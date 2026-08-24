# Report: BUG-021 — A Pack Read That Never Completes Leaves The Route Waiting Without End

**Filed at commit:** `7f0c6ce38`

**Filed by:** a `bubbles.stabilize` round against the Lifetime Tax Strategy Lab
route. Nothing was delivered. No shipped file changed.

## Summary

Sixteen damage modes were driven against the route. Fifteen reached a terminal,
named state in about sixty milliseconds. The sixteenth — an origin that accepts
the request for one declared pack and never writes a response — left the route at
`truthState = Loading` with no `data-rl-tax-state` attribute at all, and it was
still there when the probe abandoned it after twenty seconds.

## Evidence Provenance

Every figure below comes from browser runs executed in this session against local
static servers serving the repository root, driven through the bundled Chromium.
Each server was instrumented for exactly one damage mode. The driver was a
temporary scratch harness written for this round under a gitignored path and
removed at the end of it, so no path to it is cited here.

**Claim Source:** executed in this session, output captured verbatim.

## Test Evidence

### The full damage sweep

```
--- baseline (nothing damaged)
    bodyState=ready  elapsedMs=111  truthState=Incomplete
--- federal pack MISSING (404)
    bodyState=config-blocked  elapsedMs=45  truthState=Blocked
    namedCodes=RLTAX-CONFIG-INVALID  inf=0 nan=0
--- federal pack MALFORMED (not json)
    bodyState=config-blocked  elapsedMs=43  truthState=Blocked
    namedCodes=RLTAX-CONFIG-INVALID  inf=0 nan=0
--- federal pack TRUNCATED (first 40%)
    bodyState=config-blocked  elapsedMs=43  truthState=Blocked
    namedCodes=RLTAX-CONFIG-INVALID  inf=0 nan=0
--- federal pack EMPTY body
    bodyState=config-blocked  elapsedMs=43  truthState=Blocked
    namedCodes=RLTAX-CONFIG-INVALID  inf=0 nan=0
--- federal pack VALID JSON, wrong shape
    bodyState=pack-blocked  elapsedMs=43  truthState=Blocked
    namedCodes=RLTAX-PACK-INVALID  inf=0 nan=0
--- config MISSING (404)
    bodyState=config-blocked  elapsedMs=42  truthState=Blocked
    namedCodes=RLTAX-CONFIG-INVALID  inf=0 nan=0
--- a MODULE missing (rltaxstate.js 404)
    bodyState=config-blocked  elapsedMs=53  truthState=Blocked
    namedCodes=RLTAX-CONFIG-INVALID  inf=0 nan=0
    pageErrors: RLTAXSTATE must be loaded before RLTAXCOMBINED
--- medicare pack SLOW (3000ms)
    bodyState=ready  elapsedMs=3058  truthState=Incomplete
    inf=0 nan=0
--- medicare pack HANGS (server never responds)
    bodyState=never-ready (no data-rl-tax-state after 20s)  waitedMs=20044
    visibleTextChars=7335 truthState=Loading saysItIsWaiting=true
```

The state, property, benefit, mortality and medicare packs were each damaged by a
404 and by truncation in the same sweep. Each left the route `ready` with
`truthState = Incomplete` and no non-finite token. Those rows are omitted here
only because, with nothing declared, they are not distinguishable from the
baseline in that output; the run below establishes the distinction properly.

### The optional-pack refusal, established properly

Driven with a household actually declared in the jurisdiction whose pack is
damaged, so the refusal is attributable rather than merely absent:

```
--- CA pack HEALTHY
    truth=Settled inf=0 nan=0
    state surface: State income tax | RLTAX-THRESHOLD-UNAVAILABLE | Domain: state-deduction:single | Unavailable because Section 17073.5(a) states a pre-indexing base amount and subdivision (d) requires the Franchise Tax Board to recompute the standard deduction for each taxable year from a California Consumer Price Index change transmitted no later than August 1 of the current calendar year, so
--- CA pack MISSING (404)
    truth=Settled inf=0 nan=0
    state surface: State income tax | RLTAX-JURISDICTION-UNSUPPORTED | Domain: jurisdiction:state:CA | Unavailable because no rule pack ships for state:CA, and no average, national default or zero is substituted | What would make it available: author a rule pack for state:CA transcribed from that jurisdiction's own retrieved authority | The stage order is the pack's own calculation order. A stage
--- CA pack TRUNCATED
    truth=Settled inf=0 nan=0
    state surface: State income tax | RLTAX-JURISDICTION-UNSUPPORTED | Domain: jurisdiction:state:CA | Unavailable because no rule pack ships for state:CA, and no average, national default or zero is substituted | What would make it available: author a rule pack for state:CA transcribed from that jurisdiction's own retrieved authority | The stage order is the pack's own calculation order. A stage
```

An unreadable pack refuses by name and explicitly declines to substitute an
average, a national default or a zero. This is the behaviour the bound rejection
in `design.md` Option A would inherit unchanged.

One wording observation, recorded and not filed as a defect: the refusal reason
reads "no rule pack ships for state:CA" in both the missing and the truncated
case. A pack that ships and cannot be read is a different situation from one that
does not ship. The remediation offered is still correct and the reader is still
refused, so this is a nuance rather than a defect.

### Severity reasoning

Nothing is rendered wrongly and nothing is claimed falsely. The word on screen is
`Loading`, which remains true. The defect is that it remains true forever, and
that the reader is never told the wait will not end. Recorded at Low to Medium:
higher than a cosmetic issue because there is no terminal state at all, lower
than a correctness defect because no figure is ever wrong.

## What This Round Did Not Establish

- Whether a real deployment target can produce this state. It was produced with a
  server that accepts and never answers.
- Whether a body that starts arriving and then stalls behaves the same as one
  that never starts. Only the never-starts case was driven.
- What bound would be tolerable. This round measured that there is none. It did
  not measure what a correct one would be, and the three second delay case shows
  only that three seconds must remain tolerated.

## Completion Statement

Nothing was delivered. This packet is a filing. The defect is reproduced, the
fifteen damage modes that behave correctly are recorded alongside it so the gap
is visible as a gap rather than as a pattern, and the downstream handling is shown
to be already complete.

The remedy is blocked on an owner decision recorded as the open question in
`design.md`. The bound must be declared rather than embedded, `validateConfig`
validates an exact key set per section so a new declared member is a contract
change, and the configuration is itself read through the helper the bound would
govern, so the first read needs a separate answer. This round took no position on
either part.
