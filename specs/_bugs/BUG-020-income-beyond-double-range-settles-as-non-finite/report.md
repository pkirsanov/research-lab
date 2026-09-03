# Report: BUG-020 — Declared Income Beyond The Double Range Settles As A Non-Finite Figure

**Filed at commit:** `7f0c6ce38`

**Filed by:** a `bubbles.stabilize` round against the Lifetime Tax Strategy Lab
route. Nothing was delivered. No shipped file changed.

## Test-Phase RED Before GREEN Evidence

RED-STAGE: the design-named two-file mutation made the exact no-Infinity-or-NaN route assertion exit 1.

**Phase:** test
**Command:** `scripts/red-green-probe.sh --file lifetime-tax-strategy-lab.html --find 'if (!Number.isFinite(record.value)) return "no figure";' --replace 'if (false) return "no figure";' --file rltax.js --find 'if (!Number.isFinite(gross)) {' --replace 'if (false) {' --label 'BUG-020 design-named composed Infinity path' --bound 720 --summary-match 'no rendered text on the route is an infinity symbol or NaN' -- npx --no-install playwright test tests/lifetime-tax-representable.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep 'Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN' --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

GREEN-STAGE: restoring both committed guards made the same route assertion exit 0.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            BUG-020 design-named composed Infinity path
files:            lifetime-tax-strategy-lab.html rltax.js
mutations:        2 composed, applied together
  mutation 1:     [lifetime-tax-strategy-lab.html]  if (!Number.isFinite(record.value)) return "no figure";  ->  if (false) return "no figure";   (1 occurrence(s))
  mutation 2:     [rltax.js]  if (!Number.isFinite(gross)) {  ->  if (false) {   (1 occurrence(s))
command:          npx --no-install playwright test tests/lifetime-tax-representable.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Regression:\ SCN-020-01\ no\ rendered\ text\ on\ the\ route\ is\ an\ infinity\ symbol\ or\ NaN --reporter=list
red-exit:         1
red-summary:          [system-chrome] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
green-exit:       0
green-summary:      ✓  1 [system-chrome] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN (496ms)
revert-verified:  yes, all 2 targets (lifetime-tax-strategy-lab.html committed=193f75318bb85fc0ca68e1b992ad290ce371a265 restored=193f75318bb85fc0ca68e1b992ad290ce371a265, rltax.js committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Full-output receipt: `lines=15`, `sha256=c0cb916c72c864ff1655bcd1664162495de972d87a8aca2ff2790e76d101cbf8`.

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

## The Composed Adversarial Case — S1 To S4

**Claim Source:** executed. Every block below is the harness's own output,
captured verbatim from the run that produced it.

A new letter, because `P` and `Q` are taken and because `C`, `E` and `R` already
name this design's contract, engine and route steps.

### What the earlier rounds actually established, and what they did not

Six rounds reached exit `7` on `TB-020-03` and read that as a property of the
assertion. It is not. Exit `7` is a property of the MUTATION: it says RED and
GREEN agreed, so the edit that was applied did not change what the command
reported. Applying one edit to one file and reading the refusal as "this
assertion cannot fail" conflates the two.

`design.md` never asked for one edit. The adversarial-case table names, for
`TB-020-03`:

> the R2 fallback is restored to `String(record.value)` **and** a record
> carrying `Infinity` is placed in a stage — this is what makes `TB-020-03` more
> than a restatement of `TB-020-01`

That is two mutations, and they are in two different files. The R2 fallback
lives in `stageValueText` in `lifetime-tax-strategy-lab.html`. Placing a record
carrying `Infinity` in a stage requires the E1 guard in `rltax.js` to stand
down, because E1 turns that record into a refusal at the arithmetic origin and
the branch above the fallback then catches it — which is exactly the reasoning
`design.md` gives under `### R2`.

So the design was never missing. The HARNESS was: `scripts/red-green-probe.sh`
applied one `--find`/`--replace` to one `--file`, and could not state the case
the design had already written down. That is an implementation limit, not a
governance question, so this round lifted it.

### What changed in the harness

`--find`/`--replace` may now repeat, and `--file` may repeat. Each pair binds to
the most recent `--file`, which makes the old single-pair invocation a special
case of the new general one rather than a separate mode. Every safety property
is preserved and is proven below rather than asserted:

| Property | How it is preserved across several mutations |
|---|---|
| revert armed before any mutation | every target is registered and hash-pinned BEFORE the first byte changes, so the `EXIT`, `INT` and `TERM` traps already cover files not yet touched |
| revert is all-or-nothing | one restore loop over the whole target set; a failure part-way through the mutation set still restores the files already mutated |
| dirty or untracked target refused, exit `4` | every distinct `--file` is checked, and the check runs for all of them before any mutation |
| mutation landed, exit `5` | verified per pair against the hash taken immediately BEFORE that pair, not against the committed blob, because an earlier pair on the same file has already moved it |
| revert verified by blob hash, exit `6` | verified per target, and reported per target |
| RED and GREEN agree, exit `7` | unchanged |
| value-free mutations, exit `3` | every `--replace` is screened, not only the first |
| single worktree | a second `--file` in a different worktree is refused, because two checkouts cannot be reverted atomically |

Malformed pairings are usage errors rather than silent bindings. A `--file`
arriving between a `--find` and its `--replace` is refused, because it would
otherwise bind that pair to whichever target parsing reached last.

#### S1 — the extension proven, and pinned so it stays proven

The proof is a permanent selftest group rather than a one-off run, so a later
change that breaks the composed path fails `node scripts/selftest.mjs` instead
of passing quietly. The fixture reproduces the over-determination structure
rather than describing it: two gates, either of which alone keeps the command
green.

The first assertion is the control that gives the rest their meaning. Without
it, a composed exit `0` could simply be a case where one mutation was already
sufficient.

```
RED/GREEN probe harness — composed mutations (BUG-020)
  ✓ RED/GREEN compose: each single mutation ALONE is correctly refused as non-discriminating, which is the over-determination this extension exists for (A alone exit 7, B alone exit 7)
  ✓ RED/GREEN compose: the two mutations applied TOGETHER across two files discriminate at exit 0, red 1 then green 0, and every target is hash-verified back (exit 0)
  ✓ RED/GREEN compose: two chained pairs on the SAME file discriminate (exit 0) where either alone does not (exit 7), and a second pair that cannot land is still caught against its pre-pair hash (exit 5)
  ✓ RED/GREEN compose: when a LATER mutation cannot land, the probe refuses with exit 5 and the EARLIER mutation is reverted too — the revert is all-or-nothing (exit 5)
  ✓ RED/GREEN compose: a dirty SECOND target refuses with exit 4 before any mutation, preserving the uncommitted work and leaving the clean target untouched (exit 4)
  ✓ RED/GREEN compose: an exfiltrating sink in the SECOND --replace is refused with exit 3 before any file is touched (exit 3)
  ✓ RED/GREEN compose: --find before any --file, --find with no --replace, and a --file straddling a pair are all usage errors (2, 2, 2), never silent bindings (2, 2, 2)
  ✓ RED/GREEN compose: the single-pair form still emits the singular file:/mutation:/revert-verified: lines and NOT the plural form, so evidence recorded before this extension stays comparable (exit 0)
  ✓ RED/GREEN compose: a SIGTERM delivered while BOTH mutations were live restores every target to its committed blob (both mutations observed live: true)
  ✓ Regression: every pre-existing selftest assertion stays green after the composed-mutation append (3330 assertion(s) already green at this point)
```

Two of these deserve their own note.

The all-or-nothing case is the one that matters most, because it is the original
incident in miniature: mutation 1 lands, mutation 2 cannot, and a revert that
covered only the file it failed on would leave a live mutation inside a shipped
module. The probe refuses with exit `5` and both files come back.

The `SIGTERM` case reports `both mutations observed live: true`. That clause is
load-bearing. The selftest polls until it has SEEN both files differ from their
committed blobs, and only then signals. Without it the assertion would also pass
against a probe that never mutated anything.

The nineteen pre-existing assertions in the sibling harness group stayed green
throughout, so nothing in the single-pair path was disturbed.

#### S2 — backward compatibility: `Q9` reproduced unchanged, exit `0`

Other rows' recorded evidence quotes the singular `file:` and `mutation:` lines,
so the extended harness must still produce them. `Q9` was re-run through the
extended harness with the identical single-pair invocation it was recorded with.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            BACKWARD-COMPAT reproduction of Q9: SCN-020-01 at the reported 9e307 pair with the E1 arithmetic-origin guard deleted
file:             rltax.js
mutation:         if (!Number.isFinite(gross)) {  ->  if (false) {   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g the\ reported\ pair\ at\ 9e307\ refuses\ by\ name\ on\ every\ dependent\ stage
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-representable.spec.mjs:181:1 › Regression: SCN-020-01 the reported pair at 9e307 refuses by name on every dependent stage 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:181:1 › Regression: SCN-020-01 the reported pair at 9e307 refuses by name on every dependent stage
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`, matching the recorded `Q9`. The `file:` and `mutation:` lines are
the singular form, and no `files:` or `mutations:` line appears.

#### S3 — backward compatibility: `P6b` reproduced unchanged, exit `7`

The same reproduction for a recorded NON-discriminating result, which is the
harder direction: an extension that accidentally made probes easier to pass
would show up here as a `7` turning into a `0`.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            BACKWARD-COMPAT reproduction of P6b: TB-020-03 with the E1 arithmetic-origin finiteness guard deleted, ALONE
file:             rltax.js
mutation:         if (!Number.isFinite(gross)) {  ->  if (false) {   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g no\ rendered\ text\ on\ the\ route\ is\ an\ infinity\ symbol\ or\ NaN
red-exit:         0
red-summary:      [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
revert-verified:  yes (committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   NO (both channels agree: exit 0 == 0, summary "[1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN" identical once elapsed time is normalised)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `7`, matching the recorded `P6b`.

`S3` is also the control for `S4`. It is the E1 half of the design's case,
driven alone, with the identical literal `S4` uses.

#### S4 — `TB-020-03` fails under the adversarial case `design.md` names

Both mutations, applied together, across two files:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-020-03 under the design-named adversarial case: R2 fallback restored to String(record.value) AND E1 removed so a record carrying Infinity is placed in a stage
files:            lifetime-tax-strategy-lab.html rltax.js
mutations:        2 composed, applied together
  mutation 1:     [lifetime-tax-strategy-lab.html]  if (!Number.isFinite(record.value)) return "no figure";  ->  if (false) return "no figure";   (1 occurrence(s))
  mutation 2:     [rltax.js]  if (!Number.isFinite(gross)) {  ->  if (false) {   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-representable.spec.mjs --project=chromium --reporter=line -g no\ rendered\ text\ on\ the\ route\ is\ an\ infinity\ symbol\ or\ NaN
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
revert-verified:  yes, all 2 targets (lifetime-tax-strategy-lab.html committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071, rltax.js committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

Mutation 1 neutralises the `"no figure"` guard, so control falls through to the
`return String(record.value);` line beneath it — which is precisely the design's
"the R2 fallback is restored to `String(record.value)`". Mutation 2 stands E1
down, so the overflowing sum is no longer converted into a refusal and a record
carrying `Infinity` reaches a stage — the design's second clause. `String(Infinity)`
is `"Infinity"`, the assertion's `not.toMatch(/\bInfinity\b/)` limb sees it, and
the test fails.

### What this round settles

`TB-020-03` fails when its guards are removed. The proof is the case
`design.md` specified for it, driven as written, and it discriminates at exit
`0`.

The pairing of `S3` and `S4` is the finding, not `S4` alone. `S3` applies the E1
literal by itself and correctly refuses at exit `7`. `S4` applies that same
literal together with the R2 one and discriminates. The difference between them
is the second mutation and nothing else, so the earlier exit `7` readings are
explained rather than contradicted: they were true statements about
single-mutation edits, and `TB-020-03` is over-determined, not unfalsifiable.

The DoD row is therefore satisfied for all nine assertions, and it is ticked.

Nothing was weakened to reach this. No assertion text was edited, no guard was
removed, and no earlier probe block was rewritten. `P6`, `P6b`, `P6c`, `P6e`,
`P6g`, `P6i` and `Q6` remain true records of the commands that produced them.

After every probe cycle, `git status --porcelain` on the two targets was empty
and each file hashed identical to its committed blob:

```
$ git status --porcelain -- rltax.js lifetime-tax-strategy-lab.html
$ for f in rltax.js lifetime-tax-strategy-lab.html; do ... done
  rltax.js                           IDENTICAL to committed blob (f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
  lifetime-tax-strategy-lab.html     IDENTICAL to committed blob (49d3eb42c819966d4f312e076786e959b51b3071)
```

`node scripts/selftest.mjs` reports `3449 passed, 2 failed`, against a
pre-change baseline of `3439 passed, 2 failed` measured at the same head. The
ten added assertions are the composed-mutation group. The two failures are
unchanged in both identity and count, and neither belongs to this packet: one is
an unreachable-test-file census, the other a `market-brief.html` block count.
Both sit in another session's working tree.

### Code Diff Evidence

**Phase:** gaps
**Command:** `for commit in 7577d5ad3 4eb4a4725 af9934c82; do printf '%s ' "$commit"; git cat-file -t "$commit"; done && git --no-pager show --stat --oneline --decorate=no 7577d5ad3 4eb4a4725 af9934c82`
**Exit Code:** 0
**Claim Source:** executed

```text
7577d5ad3 commit
4eb4a4725 commit
af9934c82 commit
7577d5ad3 BUG-020: refuse an unrepresentable figure at its origin, at the display seam and in the header
 lifetime-tax-strategy-lab.html                     |  50 +++++++--
 rltax.js                                           |  54 +++++++++-
 rltaxrules.js                                      |  13 ++-
 scripts/selftest.mjs                               | 114 ++++++++++++++++-----
 .../spec.md                                        |  17 +++
 5 files changed, 207 insertions(+), 41 deletions(-)
4eb4a4725 BUG-020: pin the adjacent-double boundary from both sides in the browser suite
 tests/lifetime-tax-representable.spec.mjs | 172 ++++++++++++++++++++++++++++++
 1 file changed, 172 insertions(+)
af9934c82 BUG-020: assert the reported 9e307 and 8.9e307 reproduction pair in its own right
 tests/lifetime-tax-representable.spec.mjs | 70 +++++++++++++++++++++++++++++++
 1 file changed, 70 insertions(+)
```

The commits include product and persistent regression paths. This evidence does not certify the
packet or alter human acceptance.

## Gaps Audit Finding Ledger - 2026-08-27 UTC

The canonical state-transition guard was executed against this packet. It exited `1` with 37
failures before this audit and 36 after the Code Diff Evidence repair above.

| Finding | Guard increments | Disposition |
| --- | ---: | --- |
| G053 lacked git-backed implementation delta evidence | 1 -> 0 | Addressed here with current-session commit-object and `git show` evidence over `7577d5ad3`, `4eb4a4725` and `af9934c82`. |
| G055 policy snapshot lacks six policy entries plus valid provenance coverage | 7 | `route_required` to `bubbles.validate`; use authoritative policy values only. |
| G056 lacks `certifiedCompletedPhases` and `lockdownState` fields | 2 | `route_required` to `bubbles.validate`; do not fabricate certified phases. |
| G057 has no `scenario-manifest.json` | 1 | `route_required` to `bubbles.plan`; map the existing adjacent-double and reported-pair regressions. |
| G060's earliest failure line also contains a passing count on the same line | 1 | `route_required` to the producing execution owner; retain the probe and expose the real RED-before-GREEN sequence. |
| Delivered Scope 1 still reads `In Progress`, and completed scope state is empty | 2 | `route_required` to `bubbles.plan` for scope status, then `bubbles.validate` for state mirrors. |
| Eight completed phase claims lack canonical same-phase provenance arrays, plus the aggregate block | 9 | `route_required` to `bubbles.validate`; add no run and no phase beyond each existing record. |
| Retrospective implement and test records share one clock interval | 1 | Framework route: G077 conflates a historical implementation-recording window with execution time. Do not patch the installed guard downstream. |
| Two scopes lack scenario-specific E2E DoD, broader-suite DoD and explicit scenario E2E Test Plan rows | 7 | `route_required` to `bubbles.plan`; six missing rows plus aggregate refusal. |
| G027 rejects phase claims while completed scope state is empty | 1 | `route_required` to `bubbles.validate` after plan status reconciliation. |
| Two Gherkin claims lack faithful DoD text: overflow refuses by name; representable input is unchanged | 3 | `route_required` to `bubbles.plan`; two claims plus aggregate refusal. |
| G094 requires one spec classification and three design sections | 1 | `route_required` first to `bubbles.analyst`, then `bubbles.design`; record a single-capability justification unless evidence establishes reusable variation. |
| G136 reports unchecked human Checklist items and no human acceptance record | 1 | Human owner only. Automation must not create or tick acceptance. |

The open increments total 36. The packet remains `in_progress`.

## Current Implementation Reconciliation — 2026-08-31 UTC

<a name="current-implementation-reconciliation-2026-08-31"></a>

**Phase:** implement
**Claim Source:** executed
**Source revision:** `d0c09a3ec90d2bb72920caee9e44f1d5f697c619`

The active `design.md`, both scopes, the scenario manifest, the embedded Test
Plans, this report, the execution state, and every allowed implementation and
test surface were read in this invocation. This packet has no standalone
`test-plan.json`; its current Test Plans remain the two tables in `scopes.md`.
The current product and test files were clean at entry. The only BUG-020 delta
at entry was the design-owner reconciliation in `design.md`.

### Current source mechanism

The current-session mechanism inventory is retained in
`.specify/runtime/tool-calls.jsonl` at `2026-08-31T03:10:34Z`, exit `0`,
stdout hash
`3fb222e4ce84a0e058e39530438003e50b367e0231fa6256add5646736ba4efd`.
Its complete observed output was:

```text
BUG020_MECHANISM_INVENTORY_BEGIN
MECHANISM label=C1-vocabulary expected=1 actual=1 file=rltaxrules.js
MECHANISM label=E1-arithmetic-origin expected=1 actual=1 file=rltax.js
MECHANISM label=E2-co1-assembly expected=3 actual=3 file=rltax.js
MECHANISM label=E3-display-seam expected=1 actual=1 file=rltax.js
MECHANISM label=E4-disposition-refusal expected=1 actual=1 file=rltax.js
MECHANISM label=R1-envelope-and-render-sites expected=4 actual=4 file=lifetime-tax-strategy-lab.html
MECHANISM label=R1-header-precedence expected=1 actual=1 file=lifetime-tax-strategy-lab.html
MECHANISM label=R2-raw-stringification-guard expected=1 actual=1 file=lifetime-tax-strategy-lab.html
MECHANISM label=composed-parser-binding expected=1 actual=1 file=scripts/red-green-probe.sh
MECHANISM label=composed-all-target-arm expected=1 actual=1 file=scripts/red-green-probe.sh
MECHANISM label=composed-per-replacement-screen expected=1 actual=1 file=scripts/red-green-probe.sh
MECHANISM label=composed-mutation-array-loops expected=2 actual=2 file=scripts/red-green-probe.sh
MECHANISM label=composed-selftest-group expected=1 actual=1 file=scripts/selftest.mjs
MECHANISM label=TP-01-05-member expected=1 actual=1 file=scripts/selftest.mjs
MECHANISM label=TB-020-04-direct-seam expected=1 actual=1 file=scripts/selftest.mjs
MECHANISM label=SCN-020-01-no-token expected=1 actual=1 file=tests/lifetime-tax-representable.spec.mjs
MECHANISM label=SCN-020-04-inside-boundary expected=1 actual=1 file=tests/lifetime-tax-representable.spec.mjs
MECHANISM label=SCN-020-05-outside-boundary expected=1 actual=1 file=tests/lifetime-tax-representable.spec.mjs
PROBE_RESTORE file=rltax.js sha256=7e44bb4c8106fdc0b4f0b181d931b1327f213420bb7d049d96cb78b3682d73d8 gitObject=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc status=clean
PROBE_RESTORE file=lifetime-tax-strategy-lab.html sha256=b628fce363737dcdaffa474dc1be33f693a3be6729e9f852b9abd0cf9fc0b0fc gitObject=193f75318bb85fc0ca68e1b992ad290ce371a265 status=clean
MECHANISM_FAILURES=0
BUG020_MECHANISM_INVENTORY_RESULT=PASS
BUG020_MECHANISM_INVENTORY_END
```

This inventory re-derived the current mechanism rather than accepting an older
report description. It found C1, E1 through E4, R1 and R2 at the expected
current-source sites. It also found the composed harness contracts and the
persistent scenario assertions. The post-probe hashes and Git objects matched
the pre-probe identities for both transiently mutated files.

### Current composed adversarial proof

**Phase:** implement
**Command:** `scripts/red-green-probe.sh --file lifetime-tax-strategy-lab.html --find 'if (!Number.isFinite(record.value)) return "no figure";' --replace 'if (false) return "no figure";' --file rltax.js --find 'if (!Number.isFinite(gross)) {' --replace 'if (false) {' --label 'BUG-020 current design-named composed Infinity path' --bound 900 --summary-match 'no rendered text on the route is an infinity symbol or NaN' -- npx --no-install playwright test tests/lifetime-tax-representable.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep 'Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN' --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            BUG-020 current design-named composed Infinity path
files:            lifetime-tax-strategy-lab.html rltax.js
mutations:        2 composed, applied together
  mutation 1:     [lifetime-tax-strategy-lab.html]  if (!Number.isFinite(record.value)) return "no figure";  ->  if (false) return "no figure";   (1 occurrence(s))
  mutation 2:     [rltax.js]  if (!Number.isFinite(gross)) {  ->  if (false) {   (1 occurrence(s))
command:          npx --no-install playwright test tests/lifetime-tax-representable.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Regression:\ SCN-020-01\ no\ rendered\ text\ on\ the\ route\ is\ an\ infinity\ symbol\ or\ NaN --reporter=list
red-exit:         1
red-summary:          [system-chrome] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
green-exit:       0
green-summary:      ✓  1 [system-chrome] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN (414ms)
summary-compared:     [system-chrome] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN  vs    ✓  1 [system-chrome] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes, all 2 targets (lifetime-tax-strategy-lab.html committed=193f75318bb85fc0ca68e1b992ad290ce371a265 restored=193f75318bb85fc0ca68e1b992ad290ce371a265, rltax.js committed=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc restored=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Structured evidence is retained at `2026-08-31T03:09:25Z`, exit `0`, stdout
hash `52b878fdb3fdc16c3bfa0fabc0d79745d00bc7bfba37b7839a514fa57b4ef943`,
with scenario binding `SCN-020-01` and the current input closure.

### Verifier corrections preserved

The first combined design-and-routing inspection emitted a `jq` compile error
inside an outer wrapper that exited `0`. It is not used as evidence. The direct
`jq` rerun at `2026-08-31T03:09:03Z` exited `0` and exposed the stale
`bubbles.design` routing.

The first exact mechanism inventory exited `2`. Its verifier expected one
mutation-array loop where the harness legitimately has two and searched for a
double-quoted declaration where the JavaScript uses single quotes. No product
or test file changed. The corrected inventory above changed only those two
verifier expectations and exited `0`.

### Implementation decision and command boundary

No implementation gap was reproduced, so this phase changed no product source,
test source, harness, or design artifact. It appended this current evidence and
reconciled only implementation-owned execution routing in `state.json`.

`node scripts/selftest.mjs`, the complete lifetime-tax browser family, and the
complete browser suite were not executed in this implement phase. No current
pass claim is made for those commands. Independent test-phase execution is the
recorded routing target.

### Focused handoff checks

**Phase:** implement
**Claim Source:** executed

The post-edit artifact lint ran separately and exited `0`. The capture reports
`lines=40` and
`sha256=dcf94897451f9012057b886034d49b5902f54c2f6e90ccbb2a7514f4b2401d05`.
It ended with `Artifact lint PASSED.` It also emitted one recommendation:
`state.json v3 missing recommended field: transitionRequests`. That field is
not an implementation-owned `execution.*` field and was not invented here.

The all-scope traceability guard ran separately and exited `0`. The capture
reports `lines=68` and
`sha256=7fb5d6a4de26d520761d699fbeed528e858ed3df303fa1010eae6cf6ad8d25db`.
Its observed summary was:

```text
--- Traceability Summary ---
ℹ️  Scenarios checked: 5
ℹ️  Test rows checked: 10
ℹ️  Scenario-to-row mappings: 5
ℹ️  Concrete test file references: 5
ℹ️  Report evidence references: 5
ℹ️  DoD fidelity scenarios: 5 (mapped: 5, unmapped: 0)
ℹ️  Edge confidence (IMP-015 Scope B): declared=10 inferred=0 ambiguous=0

RESULT: PASSED (0 warnings)
```

The verbose implementation-reality scan exited `0`, scanned three production
files, reported zero violations, and emitted one warning. The capture reports
`lines=38` and
`sha256=4aa4d182b0eb6dae4b405d5f8886aa07f43fe2621a5b8b9ac46d1ef582a63f75`.
The warning says its scope parser yielded zero files and therefore used the
design fallback. The scan still resolved and inspected three production files.
The current `scopes.md` was read directly in this phase and contains explicit
Implementation Surfaces sections. No source gap follows from this extraction
warning.

The first strict boundary wrapper timed out inside lock-refreshing `git status`
and produced only its opening sentinel. It is retained as failed evidence and
not treated as a verdict. A different read-only check with
`GIT_OPTIONAL_LOCKS=0` then exited `0` and produced:

```text
BUG020_NO_OPTIONAL_LOCK_BOUNDARY_BEGIN
 M specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite/design.md
 M specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite/report.md
 M specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite/state.json
BUG020_STATUS_EXIT=0
BUG020_STAGED_EXIT=0
BUG020_DIFF_CHECK_EXIT=0
BUG020_NO_OPTIONAL_LOCK_BOUNDARY_END
```

The final state and source invariant check exited `0` with this observed output:

```text
BUG020_FINAL_STATE_SOURCE_INVARIANTS_BEGIN
STATE_JSON_EXIT=0
CERTIFICATION_UNCHANGED=true
TOP_STATUS=in_progress
CERTIFICATION_STATUS=in_progress
EXECUTION_PHASE=implement
EXECUTION_PHASE_STATUS=complete
EXECUTION_SUBSTATE=needs_reverification
NEXT_REQUIRED_OWNER=bubbles.test
DOD_CHECKED=18
DOD_UNCHECKED=0
REPORT_EXPLICIT_ANCHOR_COUNT=1
ALLOWED_IMPLEMENTATION_DIFF_EXIT=0
STATE_ROUTING_PREDICATE_EXIT=0
STATE_SOURCE_INVARIANT_FAILURES=0
BUG020_FINAL_STATE_SOURCE_INVARIANTS_RESULT=PASS
BUG020_FINAL_STATE_SOURCE_INVARIANTS_END
```

No file was staged or committed. The design-owner delta was preserved. The
implementation-owned changes in this invocation are this appended evidence and
the execution routing and phase claim in `state.json`.

## Independent Test Phase — 2026-08-31 UTC

<a name="independent-test-phase-2026-08-31"></a>

**Phase:** test
**Claim Source:** executed
**Source revision:** `d0c09a3ec90d2bb72920caee9e44f1d5f697c619`

This phase re-read the current packet and the production and test paths it names.
The packet has no standalone `test-plan.json`.
Its current Test Plans remain the two tables in `scopes.md`.

### Entry boundary and isolation

The entry check distinguished the three existing BUG-020 artifact changes from
all concurrent work. It found no staged path.

```text
BUG020_STRICT_ENTRY_BOUNDARY_BEGIN
ROOT=<research-lab-root>
HEAD=d0c09a3ec90d2bb72920caee9e44f1d5f697c619
DIRTY_PATH_COUNT=32
BUG020_AUTHORIZED_EXISTING_DIRTY_COUNT=3
EXPLICITLY_EXCLUDED_CONCURRENT_COUNT=26
OTHER_PROTECTED_CONCURRENT_COUNT=3
STAGED_PATH_COUNT=0
ENTRY_BOUNDARY_FAILURES=0
BUG020_STRICT_ENTRY_BOUNDARY_RESULT=PASS
BUG020_STRICT_ENTRY_BOUNDARY_END
```

The structured receipt is dated `2026-08-31T03:36:13Z`.
It exited `0` with stdout hash
`998499ec9ce3c36db47119674394373e7d804df1db14d87cd5190855788ed945`.

Tests ran in a disposable clone at the same source revision.
Only the current BUG-020 `design.md`, `report.md`, and `state.json` changes were
copied into that clone.
Each copied file matched its source SHA-256.
The clone used source-locked Playwright `1.61.1` and system Chrome.

### Focused persistent browser coverage

**Command:** `npx --no-install playwright test tests/lifetime-tax-representable.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
Running 8 tests using 1 worker
✓ Regression: SCN-020-01 every stage whose amount overflows the double range is refused by name
✓ Regression: SCN-020-02 the settlement header does not describe an unrepresentable result as settled
✓ Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN
✓ Regression: SCN-020-04 the settling side of the boundary settles with finite figures throughout
✓ Regression: SCN-020-05 the refusing side of the boundary refuses on the next representable double
✓ Regression: SCN-020-01 the reported pair at 9e307 refuses by name on every dependent stage
✓ Regression: SCN-020-02 the settlement header at the reported 9e307 pair names the unrepresentable domain
✓ Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard
8 passed (4.7s)
FOCUSED_CAPTURE_SHA256=8ca1abb57509cc0ece1fa9bb5068df86e116a8a02f2de6aa2b3fd239d65c266d
FOCUSED_TOOL_LOG_STDOUT_SHA256=9ecb93e8124bf1b39a57503ec6532d7499df26a82bc7dc8484c78f12c3c43ce6
```

The target file contains zero skip, todo, only, or request-interception matches.
The bugfix regression-quality guard scanned it and reported zero violations and
zero warnings.

### Composed TB-020-03 control and restoration

**Command:** `scripts/red-green-probe.sh --file lifetime-tax-strategy-lab.html --find 'if (!Number.isFinite(record.value)) return "no figure";' --replace 'if (false) return "no figure";' --file rltax.js --find 'if (!Number.isFinite(gross)) {' --replace 'if (false) {' --label 'BUG-020 independent design-named composed Infinity path' --bound 900 --summary-match 'no rendered text on the route is an infinity symbol or NaN' -- npx --no-install playwright test tests/lifetime-tax-representable.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep 'Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN' --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
TB02003_CONTROL_BEGIN
BEFORE path=lifetime-tax-strategy-lab.html sha256=b628fce363737dcdaffa474dc1be33f693a3be6729e9f852b9abd0cf9fc0b0fc gitObject=193f75318bb85fc0ca68e1b992ad290ce371a265
BEFORE path=rltax.js sha256=7e44bb4c8106fdc0b4f0b181d931b1327f213420bb7d049d96cb78b3682d73d8 gitObject=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc
red-exit:         1
green-exit:       0
revert-verified:  yes, all 2 targets
discriminating:   yes (exit 1 != 0)
COMPOSED_PROBE_EXIT=0
AFTER path=lifetime-tax-strategy-lab.html sha256=b628fce363737dcdaffa474dc1be33f693a3be6729e9f852b9abd0cf9fc0b0fc gitObject=193f75318bb85fc0ca68e1b992ad290ce371a265 byteExact=true
AFTER path=rltax.js sha256=7e44bb4c8106fdc0b4f0b181d931b1327f213420bb7d049d96cb78b3682d73d8 gitObject=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc byteExact=true
MUTATION_TARGET_RESIDUE_COUNT=0
TB02003_CONTROL_FAILURES=0
TB02003_CONTROL_RESULT=PASS
TB02003_CONTROL_END
```

The complete capture has SHA-256
`300eb1fbf94680ce2c9a17d698bb997a82f8327aabf2740495d6fb6e21401838`.

### Complete lifetime-tax browser family

**Command:** `npx --no-install playwright test tests/lifetime-tax*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
COMPLETE_FAMILY_FILE_COUNT=22
PLAYWRIGHT_PROJECT=system-chrome
PLAYWRIGHT_CONFIG=playwright.config.mjs
CONFIGURED_WORKERS=1
Running 111 tests using 1 worker
BUG020_PERSISTENT_TITLES_EXECUTED=8
BUG020_PERSISTENT_TITLES_PASSED=8
COMPLETE_FAMILY_PASSED=111
COMPLETE_FAMILY_FAILED=0
COMPLETE_FAMILY_SKIPPED=0
COMPLETE_FAMILY_EXIT=0
COMPLETE_FAMILY_CAPTURE_SHA256=ddf15b17b2acdb23721483252c109c16161e3731ce109e88e6921ccedadf3215
COMPLETE_FAMILY_TOOL_LOG_STDOUT_SHA256=6eac9b4f8d1c6afb32a64d7a8f12a0cd6d1858f60df81c26a64350cebfce1c55
```

### Nonzero checks retained as findings

The complete current selftest ran in the authorized overlay.
It exited `1` with `3464 passed, 1 failed`.
The sole failure names a committed BUG-017 scope-progress mismatch.
The focused validator confirmed the same mismatch.

```text
SELFTEST_EXIT=1
SELFTEST_PASSED=3464
SELFTEST_FAILED=1
SELFTEST_CAPTURE_SHA256=5cfa32f48cee8dba49bd3dc24d25e0ecdef0e8580ff6bc37d6c274d84ead2e14
SCOPE_PROGRESS_EXIT=1
SCOPE_PROGRESS_PACKETS=63
SCOPE_PROGRESS_CLAIMS=86
SCOPE_PROGRESS_NEW_DRIFT=1
SCOPE_PROGRESS_TARGET=BUG-017#02::certification
SCOPE_PROGRESS_CLAIMED_DOD=9/0
SCOPE_PROGRESS_ARTIFACT_DOD=9/2
BUG020_SCOPE_PROGRESS_DRIFT=0
NONZERO_COMMANDS_USED_AS_PASS_EVIDENCE=0
```

The family-wide live-test audit found no skip marker.
It found two `page.route(...)` interception sites in
`tests/lifetime-tax-read-bound.spec.mjs`.
That file belongs to BUG-021 and lies outside this packet's work boundary.
The audit exited `1` and is not pass evidence.

Two BUG-020 manifest controls also failed their discrimination checks.
Removing only the E3 display-seam guard left the SCN-020-01 reported-pair test
green in both channels.
The probe exited `7` and restored `rltax.js` exactly.
Applying the S4 composed mutation left the SCN-020-03 representable-input test
green in both channels.
That probe also exited `7` and restored both files exactly.

```text
SCN-020-01_DECLARED_CONTROL_PROBE_EXIT=7
SCN-020-01_RED_EXIT=0
SCN-020-01_GREEN_EXIT=0
SCN-020-01_REVERT_VERIFIED=yes
SCN-020-01_CAPTURE_SHA256=b6b082cf5f79db297bc0daceb88eca1c01f4d6ab143a4d4efcc7021d67d957d3
SCN-020-03_DECLARED_CONTROL_PROBE_EXIT=7
SCN-020-03_RED_EXIT=0
SCN-020-03_GREEN_EXIT=0
SCN-020-03_REVERT_VERIFIED=yes-all-2-targets
SCN-020-03_CAPTURE_SHA256=202174c2cad4c3b528c640c55394678c98230f1c51780f2586d0c20860d2342a
CURRENT_RED_RECEIPT_ELIGIBLE_SCN-020-01=false
CURRENT_RED_RECEIPT_ELIGIBLE_SCN-020-03=false
```

These results cannot support RED receipts for SCN-020-01 or SCN-020-03.
Writing such receipts would convert two green mutation runs into false failures.

### Packet checks completed before the artifact freeze

The following current checks exited `0`:

```text
SPEC_TEST_PATHS_EXIT=0 new=0 stale=0
ARTIFACT_LINT_EXIT=0
TRACEABILITY_EXIT=0 scenarios=5 testRows=10 mapped=5 warnings=0
LINKED_TEST_RESOLUTION_EXIT=0 references=8
SCENARIO_OBLIGATION_EXIT=0 scenarios=5
TEST_MECHANISM_LINT_EXIT=0 mechanisms=5
REGRESSION_QUALITY_EXIT=0 violations=0 warnings=0
TARGET_SKIP_MARKERS=0
TARGET_LIVE_MOCK_MATCHES=0
STAGED_PATHS=0
TEST_PHASE_PACKET_CHECKS_RECORDED=9
```

Artifact lint also reported one non-blocking recommendation.
The current `state.json` omits the recommended top-level `transitionRequests`
field.
This test phase did not edit state, scope, scenario, planning, certification,
or human-acceptance fields.

## Validate Certification Re-Derivation — 2026-08-31 UTC

<a name="validate-certification-rederivation-2026-08-31"></a>

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** The current scenario outcomes and browser behavior are green,
but the exact done transition is not certifiable. The asserted transition guard
failed with 13 blockers. G070 also failed before certification, the repository
selftest failed, and the human acceptance record remains empty. No terminal or
certified-phase field is advanced by this validation.

### Binding And Transition Contract

The goal-node packet validated before every repository-local operation:

```text
REPOSITORY PACKET SCOPED actionable=true repository=research-lab root=<research-lab-root> decision=rb:vscode-004aa4f6bc5dacec42ad4d9f2afe0015:25:node:close-bug-020 revision=25 scopeKind=goal-node scopeId=close-bug-020
```

The installed transition resolver exited `0` and returned:

```text
workflowMode=bugfix-fastlane
auditProfile=delivery-completion-v1
statusCeiling=done
targetStatus=done
currentStatus=in_progress
contractDigest=sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
pre-report-evidence-targetRevision=sha256:685f222dae3b18d9c6e425a25c9b2077222820f36560047c8f592f4e1064038e
phaseOrder=select,bootstrap,implement,test,regression,simplify,gaps,harden,stabilize,devops,security,validate,audit,finalize
```

Both mode forms resolved to the same `done` ceiling and phase order. The
persisted form used `bugfix-fastlane --grandfather`. The semantic form used
`fix action:fastlane target:bug`.

### Current Mechanical Check Matrix

| Check | Exit | Captured full-output SHA-256 | Current result |
| --- | ---: | --- | --- |
| Artifact lint | 0 | `dcf94897451f9012057b886034d49b5902f54c2f6e90ccbb2a7514f4b2401d05` | Pass; one recommendation says top-level `transitionRequests` is absent |
| Traceability, all scopes | 0 | `30614c48745f3c11eabd792fe687d564ecd61ab8f4472092836c79b3eaa0d601` | 5 scenarios, 10 Test Plan rows, 5 mappings, 0 warnings |
| Linked-test resolution | 0 | `13944314bdad890eb9fcb00c3b5c158d924974438c8d6ad0e7c3ab3963e71d03` | 8 references resolved |
| Scenario obligations | 0 | `65e1b9b55671e52df5fed6a395b47468d622b2bb17d21810f7249b8748d81a93` | 5 coherent matrices |
| Test mechanisms | 0 | `370b60628b444d257236d9a3e0e601fcf14a74e2f94a1923e0a5475c66555cb3` | 5 coherent mechanisms; mutation adapter inert |
| Scope DoD progress | 1 | `8cf4b8cd076558ed1aa4ea8023cf588d7177e145289f5aba3a05e51882294f1f` | One new repository drift, owned by BUG-022; none for BUG-020 or BUG-017 |
| Scenario-state certifiability | 0 | `a15f21be2a429552dc177b5de2348ced0729651961ba2b65616ba21159dc280d` | All five SCN-020 scenarios derive `REGRESSION_GREEN`; certifiable for that required state |
| Goal fidelity, pre-certification | 1 | `1cd618e1b0f495d850bac2603a607e8666c75b0693044a41c14e0583ea775c84` | Two G070 findings |
| Strict evidence-receipt freshness after this section's first append | 1 | `c29c00e4ea914702467670fa67afdd1d1701bac78473946328f96a7bce14ff61` | 524 stale current receipts; 945 unknown |
| Asserted done transition guard after this section's first append | 1 | `b65f94e46def5b77eb8131a68788394d8f750b384ba5e443641973377fa4bf5a` | `DELIVERY_COMPLETION_FAILED`; failed gates G022 and G136; 13 failures |
| Implementation reality | 0 | `4aa4d182b0eb6dae4b405d5f8886aa07f43fe2621a5b8b9ac46d1ef582a63f75` | 0 violations; 1 parser fallback warning |
| Artifact freshness | 0 | `f98a44d133188664774f863be5e6c2ef94fe3d9ed06e90db7662152345567ef2` | 0 failures, 0 warnings |
| Focused production-route browser replay | 0 | `5bc244e797026074bbd94dbbb3011adbf6669c310daf5a9fbabf9934419e529c` | 8 passed with system Chrome and one worker |
| Complete lifetime-tax browser family | 0 | `f0e5843890a86c8f40c87b2f22875d6b6b053ca3f4b8254577b2e4f76d56269e` | 111 passed with system Chrome and one worker |
| Repository selftest | 1 | `7a2b2649feb5e7f4685493eff308f4db6ff4271a60225ea7e5b328e0349e978f` | 3461 passed, 4 failed |
| Phase relevance | 0 | `ec102c1313830c3b96b2930578ec85de805637a572aab2c2ec01bbbf78b3000a` | Exact run/skip decisions recorded below |
| BUG-017 active-process adjudication | 0 | `71bccb2073fa4583cbe450560f442af35af6e3bba9c9edbd926952d88b03c12c` | 0 independent active BUG-017 processes |

The first complete-family invocation quoted the shell glob and therefore gave
Playwright a literal pattern. It exited `1` with `No tests found`; capture
SHA-256 `10430d4abdbd108757550247ef54aa526417db51010e4fcac2d0bf16fe54e830`.
The corrected invocation allowed the shell to expand all 22 files and produced
the 111-pass result above. The malformed invocation is not pass evidence.

### Scenario-State Resolver

**Phase:** validate
**Command:** `bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite --require REGRESSION_GREEN --certifiable --format text`
**Exit Code:** 0
**Claim Source:** executed

```text
scenario-state-resolve: specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite
  source revision: d0c09a3ec90d
  SCN-020-01  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
  SCN-020-02  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
  SCN-020-03  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
  SCN-020-04  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
  SCN-020-05  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
  (all 419 refusals are SCS-REVISION-DRIFT: superseded receipts, excluded from derivation, not blocking)
  certifiable: yes
```

The 419 revision-drift rows do not block this resolver. They are distinct from
the strict freshness and clone checks that do block the transition guard.

### Outcome Contract Failure — G070

**Phase:** validate
**Command:** `bash .github/bubbles/scripts/goal-fidelity-guard.sh --boundary pre-certification --session-file .specify/memory/bubbles.session.json --spec-dir specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite`
**Exit Code:** 1
**Claim Source:** executed

```text
GOAL-FIDELITY[G070] specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite/spec.md has no non-empty '## Outcome Contract' section. G070 requires Intent, Success Signal, Hard Constraints, and Failure Condition BEFORE bootstrap completes; without it there is no statement of what this feature was for.
GOAL-FIDELITY[G070] specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite/spec.md Outcome Contract declares no 'Hard Constraints'. Certification cannot claim constraints were preserved when none were stated.
goal-fidelity-guard: FAIL boundary=pre-certification findings=2
```

This is analyst-owned spec work. Validate did not edit `spec.md`.

### Asserted Transition Failure

**Phase:** validate
**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite --target-status done --expect-workflow-mode bugfix-fastlane --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f`
**Exit Code:** 1
**Claim Source:** executed

```text
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision-at-guard-epoch: sha256:a098300be775dbaab98facd5a2ddb13122998c6c4449431464518c757954fab8
failedGateIds: [G022,G136]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 13
exitStatus: 1
verdict: FAIL
```

The 13 guard failures account as follows:

1. Check 6B emitted eight G022 phase-provenance failures, one each for
  `regression`, `test`, `audit`, `validate`, `security`, `stabilize`,
  `implement`, and `simplify`.
2. Check 6B emitted one aggregate G022 failure for the eight unbacked claims.
3. Check 7A emitted one execution-history overlap failure between the historical
  implement and test entries.
4. Check 43 emitted one stale-receipt failure.
5. Check 43 emitted one receipt-clone failure.
6. Check 43, the Human Acceptance Terminal Gate, emitted one G136 failure.

The guard's closed machine result names G022 and G136 in `failedGateIds`.
Receipt staleness and clone detection are emitted under the exact script label
`Check 43: Evidence Receipt Staleness (IMP-027 SCOPE-3)`. The execution-history
overlap is emitted under `Check 7A`. These check failures contribute to the 13
even though the machine result does not assign them separate failed gate IDs.

### Strict Receipt Debt

**Phase:** validate
**Command:** `bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root . --strict`
**Exit Code:** 1
**Claim Source:** executed

```text
total=2224
current=1506
superseded=718
withClosure=561
valid=37
stale=524
unknown=945
strictExit=1
```

The asserted guard independently ran this strict checker and emitted both
`Evidence receipt(s) are STALE` and `Evidence receipt CLONE` as blockers under
Check 43. The debt therefore blocks this transition in current framework
behavior. No append-only log entry was rewritten or deleted.

The validate-owned report append itself invalidated 23 current receipts whose
declared input closure includes `report.md`, including the latest SCN-020-01 and
SCN-020-03 live and regression receipts. That moved the strict result from 501
to 524 stale receipts. It does not change the scenario resolver's source-revision
derivation, but it makes the strict transition check remain non-zero. The final
target revision is intentionally resolved after the last report edit rather
than embedded here, because embedding it would change the revision again.

### Repository-Wide Dependency Re-Derivation

The canonical scope-progress validator now identifies BUG-022, not BUG-017, as
the sole new drift outside the frozen baseline:

```text
[scope-dod-progress] packets=65 claims=86 agree=71 drift=15 unresolved=0 baseline=14 new=1 stale=0
NEW-DRIFT specs/_bugs/BUG-022-historical-report-declaration-leak#01::certification — claims 53/0 checked/unchecked, artifact has 53/19
[scope-dod-progress] FAIL — 1 scope progress claim(s) do not match their artifact
```

A second complete drift inventory used the validator's supported empty-baseline
seam. It listed all 15 current drifts. BUG-017 was absent. An ancestry-aware
process scan also returned `ACTIVE_BUG017_PROCESS_COUNT=0`. The conditional
BUG-017 certification repair therefore did not trigger: there is no current
BUG-017 completion-mirror disagreement to reconcile.

The current repository selftest confirms the dependency moved away from
BUG-017. It exited `1` at `3461 passed, 4 failed`. Its four current failures are:

```text
tests/*.mjs reachability: 1 new orphan
market-brief.html top-level block classification
spec-number collision: 029-budget-aware-hybrid-brief-generation and 029-shock-transmission-foundation-and-lab
scope-progress drift: 1 new, 14 frozen, 0 stale
```

All four are outside the BUG-020 certification write boundary. They remain
non-pass results and were not converted into BUG-020 evidence.

### G136 Human Acceptance Assessment

The current `uservalidation.md` has nine behavior-specific Checklist rows.
Every row remains `[ ]`. `Accepted by`, `Date`, `What was checked`, and
`Anything the checker did not accept` are blank. The asserted guard printed all
nine rows and `PD12-NO-RECORD` before failing G136.

General operator authorization to close and publish does not state that any of
those nine behaviors were exercised or accepted. Validate therefore records no
human acceptance and makes no status, `certifiedAt`, or certified-phase write.

### Current Phase Relevance And Owner Order

The installed relevance resolver measured 2,156 changed lines across the six
BUG-020 delivery surfaces. Its decisions were:

| Phase | Verdict | Owner |
| --- | --- | --- |
| implement | run, `neverSkip` | `bubbles.implement` |
| test | run, `neverSkip` | `bubbles.test` |
| regression | run | `bubbles.regression` |
| simplify | run | `bubbles.simplify` |
| gaps | run, no skip rule | `bubbles.gaps` |
| harden | run, no skip rule | `bubbles.harden` |
| stabilize | skip, no SLA or performance target | `bubbles.stabilize` |
| devops | skip, no CI, deploy, monitoring, or infrastructure change | `bubbles.devops` |
| security | skip, no authentication, input-handling, crypto, or trust-boundary change | `bubbles.security` |
| validate | run, `neverSkip` | `bubbles.validate` |
| audit | run, `neverSkip` | `bubbles.audit` |
| finalize | run, `neverSkip` | active workflow runner |

Before that delivery sequence can produce a terminal claim, `bubbles.analyst`
owns the two G070 Outcome Contract findings. The resulting actual owner order is
therefore analyst, implement, test, regression, simplify, gaps, harden,
validate, audit, then the active workflow runner for finalize. The three
registry-derived skips remain explicit decisions, not fabricated phase passes.

### Certification-Owned Mutation Decision

BUG-020's top-level and certification statuses already agree at `in_progress`.
Both completed-scope mirrors already name the same two string scope IDs.
Certification scope progress already matches the current artifacts at `10/0`
and `8/0` checked/unchecked. The canonical scope-progress validator reports no
BUG-020 drift.

No certification-owned state repair is supported. This validation appends only
this evidence section. It does not alter either status, `certifiedAt`,
`completedScopes`, `certifiedCompletedPhases`, human acceptance, source, tests,
planning, or the append-only receipt log.

### Ownership Routing Summary

| Finding | Current owner | Disposition |
| --- | --- | --- |
| VAL-020-G070-OUTCOME | `bubbles.analyst` | Route the two Outcome Contract findings; validate cannot edit `spec.md` |
| VAL-020-G022-PROVENANCE | phase owners in the installed order | Re-run relevant phase ownership and produce current provenance; validate cannot forge execution history |
| VAL-020-CHECK7A-OVERLAP | active workflow runner | Reconcile historical execution bookkeeping through owning phase records; validate does not rewrite execution history |
| VAL-020-CHECK43-STALE | affected evidence owners | Refresh append-only receipts against current inputs; no receipt may be deleted or rewritten |
| VAL-020-CHECK43-CLONE | affected evidence owners and validate | Produce distinct execution provenance or retain the clone refusal |
| VAL-020-G136-ACCEPTANCE | human | Nine behavior rows and the Human Acceptance Record remain unaccepted |
| VAL-020-SELFTEST-EXTERNAL | owners of BUG-022, market/tool-brief, and the two 029 packets | Four repository selftest failures are outside this goal-node write boundary |
| VAL-020-REALITY-WARN | `bubbles.plan` | Non-blocking parser fallback warning; the scan still inspected three production files and found zero violations |

## ROUTE-REQUIRED

Owner: `bubbles.analyst`

Reason: G070 is the first in-boundary owner repair. The done transition also
remains blocked by G022, Check 7A, Check 43 stale and clone debt, G136, and the
current repository selftest failures.

## Validate Goal-Node Reconciliation — 2026-08-31 05:23 UTC

<a name="validate-goal-node-reconciliation-2026-08-31-0523"></a>

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** Goal fidelity and all five active scenario states are now
green, but the exact terminal guard remains nonzero. This section supersedes
the earlier G070 route. It does not supersede historical evidence receipts.

### Current Authority And Contract

The exact `close-bug-020` scoped packet validated against session-control
revision 26 and the static compiled scenario declaration before repository
access. The transition resolver then returned `bugfix-fastlane`,
`delivery-completion-v1`, ceiling and target `done`, contract digest
`sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f`,
and pre-reconciliation target revision
`sha256:14eaf0e44b821452a7064a680bd4b87669afa7b3a7c44ad626dffec03cf5759f`.
The pre-certification goal-fidelity guard exited `0`.

The scenario-state resolver also exited `0`. It derived `REGRESSION_GREEN` for
`SCN-020-01`, `SCN-020-02`, `SCN-020-03`, `SCN-020-04`, and `SCN-020-05`.
Artifact lint exited `0`. It retained one non-blocking recommendation that the
top-level `transitionRequests` field is absent.

### Exact Asserted Guard Evidence

**Phase:** validate
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=20s 1740 /opt/homebrew/bin/bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite --target-status done --expect-workflow-mode bugfix-fastlane --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f`
**Exit Code:** 1
**Claim Source:** executed

```text
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:14eaf0e44b821452a7064a680bd4b87669afa7b3a7c44ad626dffec03cf5759f
failedGateIds: [G022,G136]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 13
exitStatus: 1
verdict: FAIL
capturedLines: 363
capturedOutputSha256: 442a2d1db6c175f68a8548cfc4ddd3f36bc0423a9f11a3fceaf48feca676af65
```

The 13 increments are closed and one-to-one:

| # | Finding | Current disposition |
| ---: | --- | --- |
| 1 | `VAL-020-G022-IMPLEMENT` | `implement` has a completion claim without owner-backed `phasesExecuted` provenance; run; owner `bubbles.implement` |
| 2 | `VAL-020-G022-TEST` | `test` has a completion claim without owner-backed `phasesExecuted` provenance; run; owner `bubbles.test` |
| 3 | `VAL-020-G022-REGRESSION` | `regression` has a completion claim without owner-backed `phasesExecuted` provenance; run; owner `bubbles.regression` |
| 4 | `VAL-020-G022-SIMPLIFY` | `simplify` has a completion claim without owner-backed `phasesExecuted` provenance; run; owner `bubbles.simplify` |
| 5 | `VAL-020-G022-STABILIZE-STALE-SKIP` | `stabilize` has an unbacked completion claim, while current relevance is skip; the workflow runner must record only the skip and must not treat it as completed execution |
| 6 | `VAL-020-G022-SECURITY-STALE-SKIP` | `security` has an unbacked completion claim, while current relevance is skip; the workflow runner must record only the skip and must not treat it as completed execution |
| 7 | `VAL-020-G022-VALIDATE` | `validate` has a completion claim without owner-backed `phasesExecuted` provenance; current validation is nonzero and creates no replacement claim; owner `bubbles.validate` |
| 8 | `VAL-020-G022-AUDIT` | `audit` has a completion claim without owner-backed `phasesExecuted` provenance; run after validation; owner `bubbles.audit` |
| 9 | `VAL-020-G022-AGGREGATE` | Check 6B adds one aggregate failure for the eight claim-provenance failures |
| 10 | `VAL-020-CHECK7A-OVERLAP` | Historical implement and test execution-history records overlap; active workflow runner ownership |
| 11 | `VAL-020-CHECK43-STALE` | State-transition-guard Check 43 itself blocks on 524 stale current receipts in the repository-wide log |
| 12 | `VAL-020-CHECK43-CLONE` | State-transition-guard Check 43 itself blocks on a cloned receipt whose printed target is BUG-017 |
| 13 | `VAL-020-G136-HUMAN` | Nine Checklist rows remain unchecked and the Human Acceptance Record is empty; human-only |

Check 43 is the exact enforcement surface for the two receipt increments. It is
not registered as a separate `Gxxx` identifier in the installed gate registry,
so the machine result correctly lists only `G022` and `G136`. The receipt data
is repository-global and partly external to this goal node. It is nevertheless
an in-node transition blocker because this exact BUG-020 guard invocation
counted both increments.

### Current Phase Relevance

The canonical resolver used the six current BUG-020 delivery surfaces and the
measured 2,156-line delta from the parent of `7577d5ad3` through current HEAD.

| Phase | Verdict | Owner |
| --- | --- | --- |
| select | run, `neverSkip` | `bubbles.iterate` |
| bootstrap | run, `neverSkip` | active workflow runner |
| implement | run, `neverSkip` | `bubbles.implement` |
| test | run, `neverSkip` | `bubbles.test` |
| regression | run | `bubbles.regression` |
| simplify | run | `bubbles.simplify` |
| gaps | run, no skip rule | `bubbles.gaps` |
| harden | run, no skip rule | `bubbles.harden` |
| stabilize | skip, no SLA or performance target | `bubbles.stabilize` |
| devops | skip, no CI, deploy, monitoring, or infrastructure surface | `bubbles.devops` |
| security | skip, no authentication, input-handling, crypto, or trust-boundary surface | `bubbles.security` |
| validate | run, `neverSkip` | `bubbles.validate` |
| audit | run, `neverSkip` | `bubbles.audit` |
| finalize | run, `neverSkip` | active workflow runner |

The first required automation owner is `bubbles.implement`. The later required
run order is `test`, `regression`, `simplify`, `gaps`, `harden`, `validate`,
`audit`, and `finalize`. The three skips remain skip records only.

### External Repository Failures

**Phase:** validate
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=30s 1740 node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
Research-Lab self-test: 3461 passed, 4 failed
capturedLines: 3968
capturedOutputSha256: f141a458ed58773f55f877702f4f132f3d31fd72d117802c56de6103a3be85f2
failure 1: tests/tool-brief-v2.stress.mjs is a new unreachable test
failure 2: market-brief.html top-level block classification is not exact
failure 3: spec number 029 collides between budget-aware-hybrid-brief-generation and shock-transmission-foundation-and-lab
failure 4: BUG-022 scope progress claims 53/0 while its artifact has 53/19
BUG-020 targeted scenario states: REGRESSION_GREEN 5 of 5
BUG-020 artifact lint: exit 0
BUG-020 transition guard: exit 1
```

These four failures are external to `close-bug-020`. They are not in the
transition guard's `failedGateIds`, and they must not be described as G022 or
G136. They independently prevent a clean bugfix-fastlane validation through the
mode constraint `requireNoPreexistingFailingTests: true` and the canonical core
selftest requirement.

### Validate-Owned Routing Decision

The two status mirrors remain `in_progress`. Both completed-scope mirrors remain
the same two string scope IDs. Certification scope progress remains `10/0` and
`8/0`. This phase changes no certification field and creates no validate phase
claim. It updates only validate-owned phase reconciliation and routing metadata
so the first automation owner is `bubbles.implement`; every later owner, every
legitimate skip, the two Check 43 blockers, the Check 7A blocker, all four
external selftest failures, and G136 remain visible.

## Current Implementation Provenance — 2026-08-31 05:30 UTC

<a name="current-implementation-provenance-2026-08-31-0530"></a>

**Phase:** implement
**Claim Source:** executed
**Execution interval:** `2026-08-31T05:30:12Z` through `2026-08-31T05:41:18Z`
**Source revision:** `d0c09a3ec90d2bb72920caee9e44f1d5f697c619`
**Evidence ref:** `report.md#current-implementation-provenance-2026-08-31-0530`

### Authority And Mode Ceiling

The exact `close-bug-020` goal-node packet validated against control revision
26 and the static compiled scenario declaration. The validation exited `0`.

The persisted `bugfix-fastlane` mode resolved through its grandfathered form.
The resolver exited `0` and returned `statusCeiling: done`. Implementation was
therefore permitted before either owned artifact changed.

### Current Artifact And Mechanism Review

This phase read the current spec, design, scopes, and scenario manifest. It also
read every named implementation and test seam. Those seams are `rltax.js`,
`rltaxrules.js`, `lifetime-tax-strategy-lab.html`,
`scripts/red-green-probe.sh`, `scripts/selftest.mjs`, and
`tests/lifetime-tax-representable.spec.mjs`.

The current-byte mechanism inventory ran at `2026-08-31T05:31:10Z`. It exited
`0`. Its capture SHA-256 is
`f1717d896e4d7a9636a181ddde72f77ac30acdf3623d4543fcabf1cac25d2319`.
Its structured receipt stdout SHA-256 is
`67c47c2dbe987aed23c49695e682a7548c6fd6e4d0b6bd4e72a0d2e8374c266e`.

```text
BUG020_MECHANISM_INVENTORY_BEGIN
MECHANISM label=C1-closed-member expected=1 actual=1
MECHANISM label=E1-arithmetic-origin expected=1 actual=1
MECHANISM label=E2-result-assembly expected=3 actual=3
MECHANISM label=E3-display-seam expected=1 actual=1
MECHANISM label=E4-secondary-consumer expected=1 actual=1
MECHANISM label=R1-envelope-publication expected=2 actual=2
MECHANISM label=R1-header-precedence expected=1 actual=1
MECHANISM label=R2-stringification-guard expected=1 actual=1
MECHANISM label=TP-01-05-closed-code-test expected=1 actual=1
MECHANISM label=TB-020-04-direct-formatter-test expected=1 actual=1
MECHANISM label=persistent-browser-tests expected=8 actual=8
MECHANISM label=composed-file-binding expected=1 actual=1
MECHANISM label=per-replacement-screen expected=1 actual=1
MECHANISM label=all-target-arm-before-mutation expected=1 actual=1
MECHANISM_CHECK_COUNT=14
MECHANISM_FAILURES=0
BUG020_MECHANISM_INVENTORY_RESULT=PASS
BUG020_MECHANISM_INVENTORY_END
```

### Four-Layer Dynamic Contract

The corrected dynamic contract probe executed the current modules directly.
It covered arithmetic origin, result assembly, display formatting, finite-side
preservation, and closed refusal-code membership. It exited `0` at
`2026-08-31T05:31:49Z`.

Its capture SHA-256 is
`83e980ac2aad757b4fd903b0a697cc20c2e3a0f169578dcdf07d424edbb9bf62`.
Its structured receipt stdout SHA-256 is
`f70eacc48b0096a05a0cbdcffc2edd3541987172cc732fb5b9bd1c03f389e6cf`.
The structured receipt retains the exact `node --input-type=commonjs -e` argv.

```text
BUG020_DYNAMIC_CONTRACT_BEGIN
ARITHMETIC_ORIGIN ok=false code=RLTAX-FIGURE-UNREPRESENTABLE domain=income:grossSupportedIncome
RESULT_ASSEMBLY dependentStages=7 unavailable=7
RESULT_ASSEMBLY ruleStandingOnRefusal=0
RESULT_ASSEMBLY modifiedAdjustedGross=null
DISPLAY_REFUSALS values=Infinity,-Infinity,NaN count=3 code=RLTAX-FIGURE-UNREPRESENTABLE domain=display:value
DISPLAY_REFUSAL_NUMERIC_MEMBERS=0
FINITE_BOUNDARY_SUM_IS_MAX=true
FINITE_RESULT stage=CO-1 finite=true ruleStatus=enacted-current-law
FINITE_DISPLAY raw=1240.06 displayed=1240 ruleStatus=enacted-current-law
CLOSED_CODE_COUNT=15
CLOSED_CODE_MEMBER=true
UNKNOWN_CODE_REFUSED=true
BUG020_DYNAMIC_CONTRACT_RESULT=PASS
BUG020_DYNAMIC_CONTRACT_END
```

The first inline probe had a missing closing parenthesis in its probe body. It
exited `1` with a JavaScript syntax error. Its capture SHA-256 is
`497e7218959843a78de12e4b26355f08736053d49dd01b86f1f3502593a7cef1`.
No product or test file changed. The corrected probe above is the only dynamic
contract result used as pass evidence.

### Focused Production-Route Proof

**Command:** `npx --no-install playwright test tests/lifetime-tax-representable.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

The command ran at `2026-08-31T05:32:05Z`. Its capture SHA-256 is
`8653b5b092fcaf84c47cd679162d5d332e62c3ede100de379b57f3007bfbf04a`.
Its structured receipt stdout SHA-256 is
`aad1ac568865b38412e28beafe90a7cb9c43d85e080c6aff5dc100af0d2d86cd`.

```text

Running 8 tests using 1 worker

  ✓  1 [system-chrome] › tests/lifetime-tax-representable.spec.mjs:41:1 › Regression: SCN-020-01 every stage whose amount overflows the double range is refused by name (694ms)
  ✓  2 [system-chrome] › tests/lifetime-tax-representable.spec.mjs:78:1 › Regression: SCN-020-02 the settlement header does not describe an unrepresentable result as settled (252ms)
  ✓  3 [system-chrome] › tests/lifetime-tax-representable.spec.mjs:93:1 › Regression: SCN-020-01 no rendered text on the route is an infinity symbol or NaN (370ms)
  ✓  4 [system-chrome] › tests/lifetime-tax-representable.spec.mjs:111:1 › Regression: SCN-020-04 the settling side of the boundary settles with finite figures throughout (402ms)
  ✓  5 [system-chrome] › tests/lifetime-tax-representable.spec.mjs:137:1 › Regression: SCN-020-05 the refusing side of the boundary refuses on the next representable double (327ms)
  ✓  6 [system-chrome] › tests/lifetime-tax-representable.spec.mjs:181:1 › Regression: SCN-020-01 the reported pair at 9e307 refuses by name on every dependent stage (367ms)
  ✓  7 [system-chrome] › tests/lifetime-tax-representable.spec.mjs:205:1 › Regression: SCN-020-02 the settlement header at the reported 9e307 pair names the unrepresentable domain (263ms)
  ✓  8 [system-chrome] › tests/lifetime-tax-representable.spec.mjs:213:1 › Regression: SCN-020-03 the reported settling pair at 8.9e307 is unchanged by the guard (395ms)

8 passed (4.6s)
```

### Current Manifest Negative Controls

Each control ran through `scripts/red-green-probe.sh`. Each transient mutation
produced RED exit `1`. The unchanged replay produced GREEN exit `0`. Every
target returned to its committed Git object before the probe exited `0`.

| Scenario | Current discriminating control | Probe exit | Capture SHA-256 | Receipt stdout SHA-256 |
| --- | --- | ---: | --- | --- |
| `SCN-020-01` | Remove E1 and restore R2 together. Run the no-Infinity-or-NaN route assertion. | 0 | `800f92a3dce1dc764e257f21d4c88072ac239b80c72d94998a75a51def9f32f0` | `6f519aa8ba78e9b55d0623d95faded21714f452b053c12943f6d83f73e4b62c2` |
| `SCN-020-02` | Disable the R1 header-precedence branch while E1 remains. Run the non-settled-header assertion. | 0 | `f83f50ec67b15815a6cbeaa6fa38db18a6b6d5ce35c60f46f55fdd6f6f7a0dcf` | `1774a95b4927c551ec1f1a36990d640fe24b13441130c00dec48fce7b9a23a8a` |
| `SCN-020-03` | Widen E1 above `Number.MAX_VALUE / 2`. Run the reported finite-side assertion. | 0 | `ce7645de7c4f4da9b0ab1776662b6488122ea6093ad0fe7ecfad2271ec93a590` | `f64e473e5bda0d0f860a0989340921a7d0e4660c5d41cdfff64ab3f3a6172fba` |
| `SCN-020-04` | Widen E1 above `Number.MAX_VALUE / 2`. Run the immediate inside-boundary assertion. | 0 | `14d8ba106242c0194b4c45a4022a3b69ffd2332d05de50657dd1f69305594bcb` | `82c3b1515e2f0696408bf5661339e2f6597a3b316db2b39dbb9832cdde0e156e` |
| `SCN-020-05` | Remove E1. Run the immediate outside-boundary assertion. | 0 | `a4a782bc353c1673367d9790cefe2a137153ec96d287d3909294bed5613b8d32` | `cf3b75f4e6ec99b0cec1ce088d2e8e3d540c0a7028b35e3c0616d3b5234816d3` |

The scenario-bound receipts are dated from `2026-08-31T05:32:27Z` through
`2026-08-31T05:33:39Z`. They bind phase `implement` to the current scenario,
test title, control, claim, implementation references, and input closure.

### No Product Or Test Churn

The final object comparison exited `0` at `2026-08-31T05:40:58Z`. Its capture
SHA-256 is
`ec437fe6fac0eced256771d39f09b5544133dcc7222c4710b41f046fb53f3fd5`.
Its structured receipt stdout SHA-256 is
`c29670df1cca51441900ede9436789c507719c8710a4d1c61a7ce3972db00ac1`.

```text
BUG020_NO_CHURN_BEGIN
HEAD=d0c09a3ec90d2bb72920caee9e44f1d5f697c619
NO_CHURN sameAsHead=true object=f5e12de6df8b75aacf7056a8e3fe0b26e22da1fc path=rltax.js
NO_CHURN sameAsHead=true object=1b7858372f2c9898d06035f212f2deec8bb09a4c path=rltaxrules.js
NO_CHURN sameAsHead=true object=193f75318bb85fc0ca68e1b992ad290ce371a265 path=lifetime-tax-strategy-lab.html
NO_CHURN sameAsHead=true object=62c3376d250f9a374e1efcadce2f7de44af65f36 path=scripts/red-green-probe.sh
NO_CHURN sameAsHead=true object=b9da5b45662f3e6dd3a587ea0f42cf96dcef941e path=scripts/selftest.mjs
NO_CHURN sameAsHead=true object=2a6fc0165394bff54cf3e988dae48e33fa8d7c93 path=tests/lifetime-tax-representable.spec.mjs
WORKTREE_DIFF_EXIT=0
STAGED_DIFF_EXIT=0
NO_CHURN_FAILURES=0
BUG020_NO_CHURN_RESULT=PASS
BUG020_NO_CHURN_END
```

An earlier restoration wrapper encountered a structured-logger temporary-file
hash error. Its direct retry then timed out after printing all six matching
objects. Neither result is pass evidence. The concise comparison above is the
completed verdict.

No current implementation defect was demonstrated. This phase therefore
changed no product source, test source, mutation harness, planning artifact, or
scenario declaration. It appends this evidence and updates implementation-owned
execution provenance only.

### Finding Closure And Preserved Routing

| Finding | Disposition at this phase boundary |
| --- | --- |
| `VAL-020-G022-IMPLEMENT` | Addressed by this current owner run and `phasesExecuted: ["implement"]` provenance. |
| `VAL-020-G022-TEST` | Unresolved. The current required owner is `bubbles.test`. |
| `VAL-020-G022-REGRESSION` | Unresolved. Owner remains `bubbles.regression`. |
| `VAL-020-G022-SIMPLIFY` | Unresolved. Owner remains `bubbles.simplify`. |
| `VAL-020-G022-STABILIZE-STALE-SKIP` | Unresolved. The workflow runner must record the current skip without a completion claim. |
| `VAL-020-G022-SECURITY-STALE-SKIP` | Unresolved. The workflow runner must record the current skip without a completion claim. |
| `VAL-020-G022-VALIDATE` | Unresolved. Owner remains `bubbles.validate`. |
| `VAL-020-G022-AUDIT` | Unresolved. Owner remains `bubbles.audit`. |
| `VAL-020-G022-AGGREGATE` | Unresolved until the remaining phase provenance is reconciled. |
| `VAL-020-CHECK7A-OVERLAP` | Unresolved. The active workflow runner owns the historical implement and test overlap. |
| `VAL-020-CHECK43-STALE` | Unresolved. The repository-wide strict receipt set remains owner-routed. |
| `VAL-020-CHECK43-CLONE` | Unresolved. The cloned BUG-017 receipt remains owner-routed. |
| `VAL-020-G136-HUMAN` | Unresolved and human-only. All nine Checklist rows remain unchecked. |

The current run-required sequence after implementation is `test`, `regression`,
`simplify`, `gaps`, `harden`, `validate`, `audit`, and `finalize`. The current
registry skips remain `stabilize`, `devops`, and `security`.

The four external selftest findings remain unchanged from the current validate
receipt. They are the tool-brief unreachable test, the market-brief block
classification, the `029` spec-number collision, and BUG-022 scope-progress
drift. This phase did not rerun the repository selftest and makes no current
pass claim for it.

