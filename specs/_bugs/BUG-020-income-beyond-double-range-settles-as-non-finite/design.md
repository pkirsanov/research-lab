# Design: BUG-020 — Why One Of Three Sibling Formatters Has No Finiteness Guard

## What This Document Does

It explains the mechanism behind the observation in `bug.md`, which was recorded
first. It then records the owner's decision on the refusal-code question, the
alternative rejected and why, the exact contract change, what the engine and the
route must do, and the adversarial case each new assertion must fail on.

An earlier revision of this document ended at an open question and chose
nothing. That revision is superseded by `## The Decision` below, which the owner
authorised on 2026-08-24. The mechanism sections are unchanged and still
current.

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
surfaces already render.

It requires a refusal code, which is the decision below. It is necessary and it
is not sufficient: `formatForDisplay` runs after the settlement has already
decided that it settled, so a display-only guard leaves the header reading
`Settled` and cannot satisfy `FR-020-004`.

### Option B — Guard in `money()` and return `null`

`money` already returns `null` for an unavailable record, and its callers already
handle `null`. Returning `null` for a non-finite value needs no new code and no
vocabulary change.

It is weaker: a `null` renders as an absence rather than as a named refusal, so
the reader learns that a figure is missing but not why. It also leaves the engine
seam unguarded for any consumer that is not `money`. It is rejected.

### Option C — Reject the declaration at the input

Refuse a declared amount above some bound in `readNumber`. This does not fix the
formatter, moves the bound into the route as an undeclared constant, and would
have to substitute or refuse a value the household actually typed. It is rejected
and is recorded for completeness.

### What the remedy is not

It is not clamping to `Number.MAX_VALUE`. A clamped figure is a wrong figure
presented with enacted standing, which is a worse version of the defect.

## The Decision

**Decided 2026-08-24. Authorised by the owner; recorded here by `bubbles.design`.**

Add a fifteenth vocabulary member, `RLTAX-FIGURE-UNREPRESENTABLE`. Raise it at
the arithmetic origin so the whole settlement cascades through machinery that
already exists, and raise it again at the display seam so that seam can never be
the hole a second time.

### Why a new member rather than a reused one

The decisive reason is the seam, not the taste. `formatForDisplay` is generic
over every value record the tool produces: the same function renders the federal
stages, the property leg, the state settlement, the combined total, the benefit
and the Medicare legs. A refusal that function raises cannot be an income
refusal, a threshold refusal or a pack refusal, because it does not know and must
not know which of those produced the record. Only a member whose subject is *the
figure* can be raised there. Every one of the fourteen existing members names a
subject that is upstream of the figure, so none of them can be raised at the one
seam this remedy has to guard.

The condition is also genuinely new. Every existing member says that some input
to the calculation was missing, malformed, out of contract or unmodelled. This
one says the opposite: every input is present, valid and in range, the
calculation is defined and correct, and the *result* is outside what a double can
hold. Nothing in the vocabulary says that.

### The alternative rejected

`RLTAX-INCOME-KIND-UNSUPPORTED` is the nearest reuse candidate, and it is nearer
than the `RLTAX-INPUT-INCOMPLETE` this document named in its filing revision.
`computeTaxableIncome` already raises it for a declared income amount that is not
a finite non-negative number, so a reader could argue the overflow is the same
family. It is rejected on four grounds, the last of which is decisive:

1. Its domain is `income:<kind>`. No single kind is at fault here, so the domain
   would have to name a kind that is innocent or name no kind at all.
2. Its reason reads "the declared amount for this income kind is not a finite
   non-negative number". Each declared amount *is* finite and non-negative. The
   sentence would be false on the screen.
3. Its remediation reads "supply a finite non-negative amount for `<kind>`". The
   household already did. The instruction would be unfollowable.
4. It cannot be raised at `formatForDisplay`, which is the seam the remedy exists
   to close and which serves the property, state, combined, benefit and Medicare
   surfaces as well as the federal one. A code that only makes sense at one
   origin cannot name a guard that is generic over all of them.

Reusing it would also repeat the conflation the repository deliberately undid
when it separated `RLTAX-RESIDENCY-UNSUPPORTED` from
`RLTAX-JURISDICTION-UNSUPPORTED`.

### The member's meaning, and what it is not

> **`RLTAX-FIGURE-UNREPRESENTABLE`** — every input to this figure is present,
> valid and inside contract, the calculation that produces it is defined, and the
> result is not a finite double. No figure exists to show, and none is
> substituted.

| Existing member | Why it is not this | 
|---|---|
| `RLTAX-INPUT-INCOMPLETE` | a declaration is absent; here every declaration is present and readable |
| `RLTAX-INCOME-KIND-UNSUPPORTED` | a single declared amount is unmodelled or not finite; here each one is finite and non-negative |
| `RLTAX-THRESHOLD-UNAVAILABLE` | a figure the pack should carry is absent; here the pack is complete |
| `RLTAX-PACK-INVALID` | the pack is malformed; the pack is untouched |
| `RLTAX-CONFIG-INVALID` | a configuration member is wrong; the configuration is untouched |
| `RLTAX-FEATURE-UNSUPPORTED` | the engine does not model the thing; it models addition, and the double does not hold the answer |
| `RLTAX-RECONCILE` | the identity did not balance; here there is no figure to balance |
| `RLTAX-SCOPE-DEFERRED` | the work is out of scope; this is in scope and impossible |

### Where it may be raised

Only where a figure that would otherwise be published is not a finite double.
Concretely: `computeTaxableIncome` when the supported-income sum overflows, and
`formatForDisplay` when the record handed to it carries a non-finite value. It is
never raised for a declared input, never raised for a pack member, and never
raised for a bound or a policy value.

## The Contract Change

### C1 — the vocabulary member

In `rltaxrules.js`, inside the `RLTAX_CODES` freeze, after
`"RLTAX-PACK-YEAR-MISMATCH": true`, add the member and its comment in the style
the two Feature 022 members already use:

```js
    /* Every input to the figure is present, valid and inside contract, and the calculation is
       defined, but the result is not a finite double. It is not RLTAX-INPUT-INCOMPLETE because
       nothing is missing, and not RLTAX-INCOME-KIND-UNSUPPORTED because each declared amount is
       itself finite: the defect is in the range of the RESULT, not in any input. */
    "RLTAX-FIGURE-UNREPRESENTABLE": true
```

Change nothing else in that freeze. The vocabulary becomes fifteen members: the
twelve Feature 021 members, the two Feature 022 members, and this one.

### C2 — the pinned assertion

`scripts/selftest.mjs` assertion `TP-01-05` asserts that the live member count
equals `FEATURE_021_CODES.length + FEATURE_022_CODES.length` and that every live
member belongs to one of those two named lists. Both clauses become false the
moment C1 lands, and they become false whatever the implementation does. The
assertion is superseded, not relaxed. The required replacement:

1. Add `const BUG_020_CODES = ['RLTAX-FIGURE-UNREPRESENTABLE'];` beside the two
   existing lists.
2. Extend the count clause to
   `liveCodeNames.length === FEATURE_021_CODES.length + FEATURE_022_CODES.length + BUG_020_CODES.length`.
3. Extend the membership clause so a live member may belong to any of the three
   named lists.
4. Add `BUG_020_CODES.every((code) => RLTAXRULES.RLTAX_CODES[code] === true)`, so
   removing the member fails the assertion rather than shrinking it silently.
5. Retain the two existing adversarial limbs verbatim — the repurposed
   `RLTAX-RECONCILE` vocabulary and the fabricated `RLTAX-INVENTED-CODE`
   addition — and add a third: a vocabulary from which
   `RLTAX-FIGURE-UNREPRESENTABLE` has been removed must fail the membership
   clause.
6. Do not widen the derivation. `declaredCodeNames` must still be scraped from
   `rltaxrules.js` and compared to the live keys, so a member added to one and
   not the other still fails.

Record the supersession as a ledger row in this packet's `spec.md`, in the format
Feature 022 uses:

| Id | Superseded clause | Scope | Marker | Replacement |
|---|---|---|---|---|
| `SUP-020-01` | `scripts/selftest.mjs` `TP-01-05` — `liveCodeNames.length === FEATURE_021_CODES.length + FEATURE_022_CODES.length` and the two-list membership clause | 1 | marker required | A count derived from three named lists, the new member asserted present by name, and a third adversarial limb proving a vocabulary missing it fails |

## What The Engine Must Do

### E1 — refuse at the arithmetic origin

`computeTaxableIncome` in `rltax.js` already guards each declared income field
for finiteness, one line before it forms the sum that overflows. Immediately
after `var gross = income.ordinary + preferentialIncome;`, and before
`var deduction = selectDeduction(workspace, pack);`, add:

```js
    if (!Number.isFinite(gross)) {
      var overflow = rules.unavailable("RLTAX-FIGURE-UNREPRESENTABLE", "income:grossSupportedIncome",
        "each declared amount is inside the range a double can represent and their sum is not, so no figure derived from that sum exists",
        "declare amounts whose sum is at most 1.7976931348623157e+308");
      return Object.freeze({
        ok: false,
        grossSupportedIncome: overflow,
        taxExemptInterestRecorded: income.taxExemptInterest,
        appliedDeduction: overflow
      });
    }
```

Placing the refusal in `appliedDeduction` is a deliberate reuse of the channel
this function already uses to carry a refusal outward — the shape is
byte-identical to the `isUnavailable(deduction)` return three lines below it, so
`computeAnnualFederalTax` cascades it through the `deductionUnavailable` branch
that already exists at `CO-2`, `CO-3`, `CO-4`, `CO-5`, `CO-6`, `CO-7`, `CO-11`
and `CO-12`, and `sumDeclaredLegs` carries it into `CO-8` and thence into
`totalFederalTax`. What the reader sees is the refusal's own `domain`, which
names the income sum and not the deduction.

### E2 — refuse the one stage the cascade does not reach

`CO-1` is assembled from `basis.grossSupportedIncome` directly and does not pass
through `deductionUnavailable`. Three sites in `computeAnnualFederalTax` read
that member as a bare number and each needs the same guard:

```js
    var grossRecord = rules.isUnavailable(basis.grossSupportedIncome)
      ? basis.grossSupportedIncome
      : valued(basis.grossSupportedIncome, status);
```

```js
    stages["CO-1"] = rules.isUnavailable(basis.grossSupportedIncome)
      ? basis.grossSupportedIncome
      : stageRecord(basis.grossSupportedIncome, status, null);
```

and, in the `modifiedAdjustedGross` block of the result,

```js
        value: rules.isUnavailable(basis.grossSupportedIncome) ? null : basis.grossSupportedIncome,
```

The remaining two readers already hold. `averageRecord` reaches
`rules.isUnavailable(totalRecord)` first and inherits the refusal, and
`nextThresholdEdge` sits behind `deductionUnavailable`, which is true on this
path.

### E3 — refuse at the display seam

In `formatForDisplay`, immediately after the existing factor guard, add the
sibling guard the other two formatters already carry:

```js
    if (!Number.isFinite(valueRecord.value)) {
      return rules.unavailable("RLTAX-FIGURE-UNREPRESENTABLE", "display:value",
        "the record handed to the display formatter carries a value that is not a finite double, so there is no amount to round or to render",
        "correct the calculation that produced this record; a figure outside the representable range is refused at its origin and must not reach a formatter");
    }
```

Its domain is `display:value` rather than a stage name because this function does
not know, and must not know, which leg produced the record it was handed. The
naming obligation in `FR-020-002` is discharged by E1, which does know. E3 is the
last line of defence: after E1 and E2 it is unreachable from the acceptance set,
and it exists so that a future record-producing path cannot reopen the same hole.

### E4 — close the second `computeTaxableIncome` consumer

`composeDispositionLegs` calls `computeTaxableIncome` and then reads
`basis.ordinaryTaxableIncome` and `basis.preferentialTaxableIncome`
unconditionally. On any `ok: false` basis those members are absent, and
`stackPreferentialIncome` turns `undefined` into `NaN`. That hole predates this
defect — it is reachable today whenever the deduction refuses and a disposition
is declared — but E1 routes new traffic into it, and `AC-020-003` forbids `NaN`
reaching any surface. Immediately after
`var basis = computeTaxableIncome(workspace, pack);` in that function, add:

```js
    if (basis.ok !== true) {
      return Object.freeze({
        stageId: "CO-19",
        available: false,
        refusal: rules.isUnavailable(basis) ? basis : basis.appliedDeduction,
        basisOrigin: basisOrigin,
        legs: Object.freeze([]),
        marginalContext: context
      });
    }
```

The returned shape is the one that function already returns when the disposition
settlement itself refuses, so no consumer gains a branch.

## What The Route Must Do

### R1 — the settlement header

`buildEnvelope` in `lifetime-tax-strategy-lab.html` collects refusals into
`unavailable` and returns `viable`, which today means only that the declarations
are complete. Do not change what `viable` means: `combinedSettlementLeg` and the
`!envelope.viable` branch both read it, and widening it would change behaviour
for refusals that have nothing to do with this defect.

Instead publish a new member on **both** return shapes of `buildEnvelope`:

```js
                    unrepresentableDomains: unavailable
                        .filter(function (refusal) { return refusal.code === "RLTAX-FIGURE-UNREPRESENTABLE"; })
                        .map(function (refusal) { return refusal.domain; }),
```

and branch on it first in `render`, before the existing `viable` test:

```js
                if (state.envelope.unrepresentableDomains.length > 0) {
                    byId("truthState").textContent = "Incomplete";
                    byId("truthHeading").textContent = "A figure this declaration implies is outside the range this tool can represent";
                    byId("truthDetail").textContent = "Unrepresentable: "
                        + state.envelope.unrepresentableDomains.join(", ")
                        + ". Every stage that depends on it is refused by name. No placeholder figure is shown.";
                } else if (state.envelope.viable) {
```

`Incomplete` is reused deliberately rather than introducing a third header word.
`bug.md` records `Incomplete` as an acceptable expected value, the two existing
values are the only ones the browser suite asserts on, and a new word would need
its own vocabulary decision to carry no more meaning than this one already does.

### R2 — the raw stringification fallback

`stageValueText` reads

```js
                return money(record) === null ? String(record.value) : money(record);
```

`String(Infinity)` is `"Infinity"`, so this line renders a non-finite value as
text whenever `money` returns `null`. E1 and E2 make the record a refusal, which
the branch above this line already catches, so this line is not reached from the
acceptance set — but it is the one remaining path by which a non-finite value can
still become visible text, and `AC-020-003` is a statement about the whole route.
Replace the fallback with the absence the other formatters produce:

```js
                if (money(record) !== null) return money(record);
                if (!Number.isFinite(record.value)) return "no figure";
                return String(record.value);
```

### What must not change

`percent` and `dollars` already carry the guard and are untouched. `readNumber`
and `readDeclaredBasis` are untouched: the remedy must not narrow what the input
accepts, because `FR-020-006` exists to prevent exactly that delivery.

## The Boundary, Exactly

`bug.md` measured the boundary at `8.9e307` against `9e307`. Those two are two
orders of magnitude apart in the gap they leave, so a guard could move a long way
between them without an assertion noticing. Use the tightest pair the type
admits. Both round-trip exactly through `Number(String(x))`, so each survives the
input element unchanged.

| Side | Value in **both** `ordinary income` and `qualified dividends` | Sum | Behaviour |
|---|---|---|---|
| settling | `8.988465674311579e+307` | `1.7976931348623157e+308`, exactly `Number.MAX_VALUE` | settles; every stage finite |
| refusing | `8.98846567431158e+307` | `Infinity` | refuses; every dependent stage named |

The refusing value is the next representable double above the settling one. No
third behaviour can sit between them, because no third double does.

`8.9e307` and `9e307` remain valid as the reproduction from `bug.md` and may be
kept as a second pair, but they are not the pin.

## The Adversarial Case Each New Assertion Must Fail On

Every assertion below must be shown to fail under its mutation, through
`scripts/red-green-probe.sh` with `--summary-match` pinned to that assertion's
own wording rather than to the aggregate pass count.

| Assertion | Must fail when |
|---|---|
| `TP-01-05` count and membership | `RLTAX-FIGURE-UNREPRESENTABLE` is removed from `RLTAX_CODES`; and, separately, when a sixteenth fabricated member is added |
| `TB-020-04`, `formatForDisplay` refuses a non-finite value | the E3 guard is deleted; the assertion must not be satisfiable by the E1 refusal arriving pre-formed, so it must call `formatForDisplay` with a record carrying `Infinity` and a `ruleStatus` of `enacted-current-law` directly |
| `TB-020-01`, every non-finite stage refuses by name | the E1 guard is deleted, restoring `$∞`; and, separately, when only E3 is present and E1 is deleted, which must still fail `TB-020-02` |
| `TB-020-02`, the header does not read `Settled` | the R1 branch is deleted while E1 remains, which is the exact state a display-only remedy would ship |
| `TB-020-03`, no `∞` and no `NaN` anywhere | the R2 fallback is restored to `String(record.value)` and a record carrying `Infinity` is placed in a stage — this is what makes `TB-020-03` more than a restatement of `TB-020-01` |
| `TB-020-05`, the settling side settles | the guard is widened to reject at `Number.MAX_VALUE / 2` rather than on non-finiteness, which is how an over-eager remedy would start refusing real households |
| `TB-020-06`, the refusing side refuses | the guard is narrowed to `value !== Infinity`, which admits `NaN` and restores the two `$NaN` rows alone |

The last two rows are the reason the boundary pair must be adjacent. A widened
guard and a narrowed guard both survive a single-sided assertion.

## Explicitly Not In Scope

- **Precision loss above `Number.MAX_SAFE_INTEGER`.** A figure that is finite but
  no longer exact is a different question with a different remedy, and neither
  the filing round nor this decision measured it.
- **`String(parameter.value)` in the pack-parameter renderer.** That line renders
  a figure the pack declares rather than one the engine computed. Whether a pack
  can carry a non-finite parameter past pack validation was not established, so
  it is a separate finding with a separate origin, not a branch of this one.
- **Narrowing what the input accepts.** Forbidden by `FR-020-006`.
