# Design: BUG-020 — Why One Of Three Sibling Formatters Has No Finiteness Guard

## What This Document Does And Does Not Do

It explains the mechanism behind the observation in `bug.md`, which was recorded
first. It names the remedy options and the single question the owner must answer
before any of them can be delivered. It chooses nothing.

## Mechanism

### Three formatters, two guards

The route holds three sibling display helpers in one block. Two of them open with
a finiteness guard and return `null` when it fails. The third does not:

- `percent(rate)` begins `if (!Number.isFinite(rate)) return null;`
- `dollars(value)` begins `if (!Number.isFinite(value)) return null;`
- `money(record)` has no equivalent line.

`money` is the one that carries a value *record* rather than a bare number, and it
is the one every stage row uses. It delegates to `ENGINE.formatForDisplay` and
then calls `toLocaleString` on whatever comes back.

### The delegate guards the wrong operand

`formatForDisplay` in `rltax.js` already knows how to refuse. Its first act after
the unavailable check is to guard the display rounding factor:

```
var factor = displayPolicy.factor;
if (!Number.isFinite(factor) || factor <= 0) {
  return rules.unavailable("RLTAX-CONFIG-INVALID", "display:displayRounding.factor", ...);
}
```

It then computes `Math.round(valueRecord.value * factor) / factor` with no
corresponding check on `valueRecord.value`. The refusal idiom is present, correct
and one line away from the operand that needs it.

### What reaches the surface

`Infinity * 1` is `Infinity`; `Math.round(Infinity)` is `Infinity`; `Infinity / 1`
is `Infinity`. `Infinity.toLocaleString("en-US")` is `"∞"`, so the row prints
`$∞`. Where two overflowed subtotals are subtracted, `Infinity - Infinity` is
`NaN`, `NaN.toLocaleString("en-US")` is `"NaN"`, and the row prints `$NaN`. That
is why the observed rows split four to two: the four earlier stages are sums, the
two later ones are differences.

The rule standing rides along untouched, because `formatForDisplay` copies
`valueRecord.ruleStatus` onto the returned object without consulting the value.
That is how `enacted-current-law` ends up attached to `$NaN`.

### Why the Simple view is clean

Simple does not render the stage table. It reports the settlement and a small
number of headline amounts, and the ones it reports were not among the six
overflowed stages for the declarations driven. This is a property of what Simple
chooses to show, not a guard, and it should not be relied on.

## Remedy Options

### Option A — Guard the value in `formatForDisplay`

Add the same check the factor already gets, on `valueRecord.value`, returning a
refusal. One seam, every consumer inherits it, and the refusal shape is one the
surfaces already render. This is the smallest correct change.

It requires a refusal code, which is the open question below.

### Option B — Guard in `money()` and return `null`

`money` already returns `null` for an unavailable record, and its callers already
handle `null`. Returning `null` for a non-finite value needs no new code and no
vocabulary change.

It is weaker: a `null` renders as an absence rather than as a named refusal, so
the reader learns that a figure is missing but not why. It also leaves the engine
seam unguarded for any consumer that is not `money`.

### Option C — Reject the declaration at the input

Refuse a declared amount above some bound in `readNumber`. This does not fix the
formatter, moves the bound into the route as an undeclared constant, and would
have to substitute or refuse a value the household actually typed. It is recorded
for completeness and is not recommended.

### What the remedy is not

It is not clamping to `Number.MAX_VALUE`. A clamped figure is a wrong figure
presented with enacted standing, which is a worse version of the defect.

## Open Question For The Owner

**Which refusal code names a figure outside the representable range?**

The vocabulary is closed at fourteen members and `scripts/selftest.mjs`
assertion `TP-01-05` asserts that every live member is one of the twelve Feature
021 members or one of the two Feature 022 members. Two paths exist:

1. **Add a fifteenth member.** The most accurate. It requires updating
   `TP-01-05`'s named lists, which is a deliberate vocabulary change, not a guard
   weakening.
2. **Widen an existing member.** `RLTAX-INPUT-INCOMPLETE` is the nearest, but the
   input is not incomplete: it is present, readable and out of range. Reusing it
   would be the same conflation the repository already rejected when it separated
   `RLTAX-RESIDENCY-UNSUPPORTED` from `RLTAX-JURISDICTION-UNSUPPORTED`.

This round takes no position beyond noting that the second path contradicts a
distinction the vocabulary was deliberately given.
