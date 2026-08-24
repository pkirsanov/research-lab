# BUG-020: Declared Income Beyond The Double Range Settles As A Non-Finite Figure

**Filed at commit:** `7f0c6ce38`

**Filed by:** a `bubbles.stabilize` round against the Lifetime Tax Strategy Lab
route. That round is authorised to record findings and file bug artifacts. It is
not authorised to change a shipped file, and it changed none.

**Severity:** Low. The defect is a real breach of the route's central promise,
and the trigger is not reachable by any household that exists.

## Summary

When the household's declared income amounts sum to more than the largest number
a double can hold, the Power view renders six stage rows whose figures are `$∞`
or `$NaN`, the settlement header reads `Settled`, and every one of those six rows
carries the rule standing `enacted-current-law`.

The route's promise is that a figure carries the legal standing of the rule it
came from, and that anything it cannot price is named rather than filled in. Here
it does neither: it prints a symbol that is not a number and attaches enacted law
to it.

## Why This Matters

Every other damage mode this round drove was refused correctly and by name. A
missing pack, a truncated pack, a malformed pack, a pack of valid JSON in the
wrong shape, a missing module and a missing configuration each produced a named
`RLTAX-` refusal and no figure at all. This is the one path found where a figure
reaches the surface without being a figure.

The rows are not marked. A reader scanning the stage table sees the same
`enacted-current-law` standing on the row reading `$NaN` that they see on a row
reading a real dollar amount.

## Reproduction

1. Open the route and let it reach `data-rl-tax-state="ready"`.
2. Declare filing status `single`, tax year `2026`, deduction mode `standard`,
   other net investment income `0`, Medicare wage basis `0`.
3. Enter `1e308` in ordinary income.
4. Enter `1e308` in qualified dividends.
5. Switch to Power.

The stage table now reads:

```
CO-1 $∞ enacted-current-law
CO-3 $∞ enacted-current-law
CO-5 $∞ enacted-current-law
CO-6 $∞ enacted-current-law
CO-7 $NaN enacted-current-law
CO-8 $NaN enacted-current-law
```

The settlement header reads `Settled` throughout.

## Observed Against Expected

| | Observed | Expected |
|---|---|---|
| Settlement header | `Settled` | a refusal, or `Incomplete` |
| CO-1, CO-3, CO-5, CO-6 | `$∞` | a named `RLTAX-` refusal |
| CO-7, CO-8 | `$NaN` | a named `RLTAX-` refusal |
| Rule standing on those rows | `enacted-current-law` | no standing, because there is no figure |
| Simple view | unaffected, no non-finite token | unaffected |

## The Boundary

The trigger is the sum crossing `Number.MAX_VALUE`, not any single entry:

| Declaration | Power view |
|---|---|
| one field at `1e308` | clean |
| one field at `1.7976931348623157e308` (`Number.MAX_VALUE`) | clean |
| two fields at `8.9e307` (sum `1.78e308`) | clean |
| two fields at `9e307` (sum `1.8e308`) | four `$∞`, two `$NaN` |
| two fields at `1e308` | four `$∞`, two `$NaN` |

`1e400` is not a trigger: the browser rejects it at the input, `.value` reads
back as the empty string, and the settlement falls to `Incomplete`. A negative
entry is likewise not a trigger.

## It Persists

The declaration is written to the workspace and read back on reload. After a full
reload the ordinary field reads `1e+308` and opening Power reproduces the same
six rows without any further typing.

## What The Export Does

The exported private file is clean. It carries the declared inputs as
`1e+308` and contains no `Infinity` and no `NaN` token. The defect is confined to
the rendered Power surface.

## Root Cause

`money()` in the route formats a value record through `ENGINE.formatForDisplay`
and then calls `toLocaleString` on the result. `formatForDisplay` in `rltax.js`
guards the display rounding *factor* with `Number.isFinite` and returns a refusal
when it fails, but applies no such guard to `valueRecord.value`. A non-finite
value therefore passes straight through `Math.round(value * factor) / factor` and
reaches `toLocaleString`, which renders `Infinity` as `∞` and `NaN` as `NaN`.

The two sibling helpers in the same block, `percent()` and `dollars()`, each begin
with `if (!Number.isFinite(...)) return null;`. The record-carrying path is the
one member of the three without that guard.

## Why This Round Did Not Fix It

An honest refusal needs a refusal code, and the code vocabulary is closed and
pinned. `scripts/selftest.mjs` assertion `TP-01-05` derives the member list from
the module's own declaration and asserts that every live member is one of the
twelve Feature 021 members or one of the two Feature 022 members. Introducing a
fifteenth member fails that assertion. Reusing an existing member would name a
defect that is not the defect: none of the fourteen describes a figure that is
outside the representable range.

Choosing between adding a member and widening an existing one is a contract
decision for the owner, not an implementer's edit, so this round recorded it
rather than making it.

## Not Established

- Whether any figure below the overflow boundary is silently wrong rather than
  merely imprecise. Values above `Number.MAX_SAFE_INTEGER` lose integer
  precision, and this round did not measure whether that changes a rendered
  amount.
- Whether the same seam is reachable from a declaration other than the four
  income fields.
- Whether a hand-edited workspace in local storage can carry a non-finite value
  directly, rather than a large finite one.
