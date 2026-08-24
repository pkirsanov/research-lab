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
