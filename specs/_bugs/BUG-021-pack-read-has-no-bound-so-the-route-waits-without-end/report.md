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

## Delivery

**Claim Source:** executed in this session, output captured verbatim.

Everything below this heading is a later round. The filing round's text above is
left exactly as it stood, including its statement that nothing was delivered,
because it was true of that round.

### What changed

The route change landed at commit `084572757`, "BUG-021: bound every declared
document read from a stratified declaration surface", across three files:
`lifetime-tax-strategy-lab.html`, `lifetime-tax-strategy.config.json` and
`rltaxworkspace.js`. This round added the assertions and the discrimination
evidence; it changed no shipped file.

The declaration surface is stratified exactly as `design.md` records it. Stratum
0 is `CONFIG_READ_BOUND_MS` in `rltaxworkspace.js`, exported and resolved by the
browser's `<script src>` tag before the inline script defines `boot`; it governs
the one read of `lifetime-tax-strategy.config.json`. Stratum 1 is
`rules.packReadBoundMs` in the configuration document; it governs the eight pack
reads the configuration declares, and `boot` promotes `readBoundMs` to it by
plain assignment immediately after `state.config = config`, before any pack read
is issued.

Eight is the count the configuration itself declares, not a number written here:
one `packPath`, two `propertyPackPaths`, two `statePackPaths`, one
`benefitPackPaths`, one `mortalityPackPaths` and one `medicarePackPaths`. With
the configuration document itself that is nine declared documents, and all nine
are bounded.

### The reproduction, driven again

The filed reproduction is an origin that accepts the request for one declared
pack and never writes a response and never closes the socket. It was measured
leaving `truthState` at `Loading` with no `data-rl-tax-state` attribute at all
after twenty seconds.

That condition is now driven by
`tests/lifetime-tax-read-bound.spec.mjs`, which withholds the medicare pack
through Playwright request interception and waits for a terminal
`data-rl-tax-state`. The route reaches one. The refusing-side assertion pins the
arrival from both directions: not before the declared bound of `10000` ms, which
is what would make a working slow origin refuse, and not after `18000` ms, which
is that bound plus the suite margin. The whole test, page load and Power-mode
navigation included, completed in `10.7s` on the run recorded below.

The terminal state is measured rather than described loosely. The body reaches
`data-rl-tax-state="ready"` and the settlement header reads `Incomplete`. Both
are asserted as exact values, because for an OPTIONAL declared document the
identity of the terminal state is the whole point: a pack that never arrives must
leave boot complete and the absence named, not block the route the way a missing
configuration does. An assertion that only required *some* terminal value would
pass equally on a route that had given up. The first draft of these assertions
did exactly that, checking membership in a three-value set; it was tightened to
the measured value before this row was ticked.

A fast read is not evidence for this bug and none of these assertions rests on
one. The strongest confirmation that the withheld condition is the one under
test is probe `P1`: with the abort signal withheld from `fetch`, so the request
is left outstanding exactly as it was before this change, the same assertion goes
red.

### Both strata, verified separately

Five of the six assertions drive a pack read, which stratum 1 governs. A bound
declared for stratum 0 and never applied to the read it exists for would leave
all five green while the route still waited without end on the document that
blocks everything else, which is the defect on the read that matters most.

The sixth withholds `lifetime-tax-strategy.config.json` itself. It reads the
bound out of the page's own module — `window.RLTAXWORKSPACE.CONFIG_READ_BOUND_MS`
— rather than restating the number, asserts that the route reaches
`data-rl-tax-state="config-blocked"` inside it, that the header reads `Blocked`
rather than `Loading`, and that `#configBlockedDetail` names both the document
and the bound it exceeded. Probe `P4` shows that assertion going red when the
route is seeded from a literal instead of from the declared constant, so it is
sensitive to stratum 0 actually governing that read rather than merely existing.

### Which handler received the bound rejection, per stage

No refusal branch was added. The implementation commit's only handler edits are
five replacements of `.catch(function () { return null; })` with
`.catch(recordUnreadDocument)`, which keeps the `return null` contract, and one
edit inside the pre-existing outer `.catch` that names the document. No new
`RLTAX-` code was introduced.

| Declared document | Stratum | Handler that received the bound rejection | Outcome |
|---|---|---|---|
| `lifetime-tax-strategy.config.json` | 0 | the boot chain's outer `.catch` | `RLTAX-CONFIG-INVALID`, `data-rl-tax-state="config-blocked"` |
| `rules.packPath` | 1 | the same outer `.catch` | `RLTAX-CONFIG-INVALID`, `data-rl-tax-state="config-blocked"` |
| `rules.propertyPackPaths` (two) | 1 | that family's `.catch(recordUnreadDocument)` | jurisdiction left unresolved; the existing per-domain refusal names it |
| `rules.statePackPaths` (two) | 1 | that family's `.catch(recordUnreadDocument)` | jurisdiction left unresolved; the existing residency refusal names it |
| `rules.benefitPackPaths` | 1 | that family's `.catch(recordUnreadDocument)` | benefit left unsettled; the existing leg refusal names it |
| `rules.mortalityPackPaths` | 1 | that family's `.catch(recordUnreadDocument)` | totals withheld; no horizon substituted |
| `rules.medicarePackPaths` | 1 | that family's `.catch(recordUnreadDocument)` | premium stage without a sourced premium; its three legs refuse by name |

A bound rejection and a `404` are the same event to every one of these handlers.
The only thing the rejection carries that a `404` does not is
`boundExceeded`, which selects which of two sentences the reader is shown.

### The harness

No test-server capability was added. Both sides are driven with Playwright's own
request interception on one declared path, which is what `design.md` chose so
that the harness stays visibly distinct from the system under test.

`withholdPack` registers a route handler that records the intercepted URL and
then never fulfils, continues or aborts. The request is accepted and no response
is ever written, which is the filed condition. `delayPack` waits and then calls
`route.continue()`, so the response is the genuine pack served by the same
static server every other lifetime-tax spec uses, not a fixture.

Neither replaces page code and neither changes the URL the page requests, so the
declared-asset ledger the privacy specs assert is undisturbed. Each withheld
assertion also checks that the handler was actually entered, so a selector that
silently stopped matching would fail rather than pass by never intercepting
anything.

### Probes

Each mutation is a single literal replacement in a single committed file, applied
and reverted by `scripts/red-green-probe.sh`, with `--summary-match` pinned to
the assertion's own wording rather than to an aggregate pass count. Every probe
reverted and hash-verified.

#### P1 — `TB-021-01` fails when the abort signal is never passed to `fetch`

This is the adversarial case `design.md` names as the one that matters: the
controller is constructed and the timer is armed, but the request is left
outstanding and the promise stays pending. It is the pre-change behaviour in all
but name, and a bare `setTimeout` race would not fail on it.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-021-01 with the AbortController constructed but its signal never passed to fetch
file:             lifetime-tax-strategy-lab.html
mutation:         signal: controller.signal  ->  signal: undefined   (1 occurrence(s))
command:          npx --no-install playwright test tests/lifetime-tax-read-bound.spec.mjs --project=chromium --reporter=line -g reaches\ a\ terminal\ display\ state\ within\ the\ declared\ bound\ and\ names\ the\ document
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-read-bound.spec.mjs:95:1 › Regression: SCN-021-01 a declared pack whose origin never responds reaches a terminal display state within the declared bound and nam
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-read-bound.spec.mjs:95:1 › Regression: SCN-021-01 a declared pack whose origin never responds reaches a terminal display state within the declared bound and n
summary-compared:     [chromium] › tests/lifetime-tax-read-bound.spec.mjs:95:1 › Regression: SCN-021-01 a declared pack whose origin never responds reaches a terminal display state within the declared bound and nam  vs  [1/1] [chromium] › tests/lifetime-tax-read-bound.spec.mjs:95:1 › Regression: SCN-021-01 a declared pack whose origin never responds reaches a terminal display state within the declared bound and n   (elapsed time normalised out)
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P2 — `TB-021-05` fails when the bound is lowered below a delay a real read has taken

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-021-04 tolerated side with the declared bound lowered to 1000, below the 3058ms a real read was observed taking
file:             lifetime-tax-strategy.config.json
mutation:         "packReadBoundMs": 10000  ->  "packReadBoundMs": 1000   (1 occurrence(s))
command:          npx --no-install playwright test tests/lifetime-tax-read-bound.spec.mjs --project=chromium --reporter=line -g the\ tolerated\ side\ of\ the\ bound\ is\ pinned
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-read-bound.spec.mjs:199:1 › Regression: SCN-021-04 the tolerated side of the bound is pinned: a pack delayed below the bound is served rather than aborted 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-read-bound.spec.mjs:199:1 › Regression: SCN-021-04 the tolerated side of the bound is pinned: a pack delayed below the bound is served rather than aborted
summary-compared:     [chromium] › tests/lifetime-tax-read-bound.spec.mjs:199:1 › Regression: SCN-021-04 the tolerated side of the bound is pinned: a pack delayed below the bound is served rather than aborted   vs  [1/1] [chromium] › tests/lifetime-tax-read-bound.spec.mjs:199:1 › Regression: SCN-021-04 the tolerated side of the bound is pinned: a pack delayed below the bound is served rather than aborted   (elapsed time normalised out)
revert-verified:  yes (committed=d174d417e19ac6c17b20e5765c70d8c606b698ac restored=d174d417e19ac6c17b20e5765c70d8c606b698ac)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P3 — `TB-021-06` fails when the bound is widened past any wait the suite can make

This is how a real bound decays into no bound at all: it is still declared, still
armed, and can no longer fire before anyone gives up.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-021-05 refusing side with the declared bound widened to 600000, past any wait the suite can make
file:             lifetime-tax-strategy.config.json
mutation:         "packReadBoundMs": 10000  ->  "packReadBoundMs": 600000   (1 occurrence(s))
command:          npx --no-install playwright test tests/lifetime-tax-read-bound.spec.mjs --project=chromium --reporter=line -g the\ refusing\ side\ of\ the\ bound\ is\ pinned
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-read-bound.spec.mjs:216:1 › Regression: SCN-021-05 the refusing side of the bound is pinned: a withheld pack is abandoned by name rather than waited on 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-read-bound.spec.mjs:216:1 › Regression: SCN-021-05 the refusing side of the bound is pinned: a withheld pack is abandoned by name rather than waited on
summary-compared:     [chromium] › tests/lifetime-tax-read-bound.spec.mjs:216:1 › Regression: SCN-021-05 the refusing side of the bound is pinned: a withheld pack is abandoned by name rather than waited on   vs  [1/1] [chromium] › tests/lifetime-tax-read-bound.spec.mjs:216:1 › Regression: SCN-021-05 the refusing side of the bound is pinned: a withheld pack is abandoned by name rather than waited on   (elapsed time normalised out)
revert-verified:  yes (committed=d174d417e19ac6c17b20e5765c70d8c606b698ac restored=d174d417e19ac6c17b20e5765c70d8c606b698ac)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P4 — the stratum-0 assertion fails when the route is seeded from a literal

```
=== RED/GREEN PROBE EVIDENCE ===
label:            the stratum-0 assertion with the route seeded from a literal instead of from the declared CONFIG_READ_BOUND_MS
file:             lifetime-tax-strategy-lab.html
mutation:         var readBoundMs = WORKSPACE.CONFIG_READ_BOUND_MS;  ->  var readBoundMs = 600000;   (1 occurrence(s))
command:          npx --no-install playwright test tests/lifetime-tax-read-bound.spec.mjs --project=chromium --reporter=line -g the\ configuration\ read\ is\ bounded\ by\ its\ own\ stratum-0\ declaration
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-read-bound.spec.mjs:131:1 › Regression: SCN-021-03 the configuration read is bounded by its own stratum-0 declaration when that origin never responds 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-read-bound.spec.mjs:131:1 › Regression: SCN-021-03 the configuration read is bounded by its own stratum-0 declaration when that origin never responds
summary-compared:     [chromium] › tests/lifetime-tax-read-bound.spec.mjs:131:1 › Regression: SCN-021-03 the configuration read is bounded by its own stratum-0 declaration when that origin never responds   vs  [1/1] [chromium] › tests/lifetime-tax-read-bound.spec.mjs:131:1 › Regression: SCN-021-03 the configuration read is bounded by its own stratum-0 declaration when that origin never responds   (elapsed time normalised out)
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P5 — the exact-key-set check, module direction

`packReadBoundMs` removed from `CONFIG_SECTION_FIELDS.rules` while the document
still declares it. The document's key is then one the expected set does not
contain, and the check must refuse.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-021-04 with packReadBoundMs removed from the expected key set while the document still declares it
file:             rltaxworkspace.js
mutation:         "packContentSha256", "packPath", "packReadBoundMs", "program"  ->  "packContentSha256", "packPath", "program"   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TB-021-04: the declared rules.packReadBoundMs is present, positive and stamped v2, a configuration missing it or carrying a near-miss key beside it is refused by the exact-key-set check, a
green-exit:       0
green-summary:      ✓ TB-021-04: the declared rules.packReadBoundMs is present, positive and stamped v2, a configuration missing it or carrying a near-miss key beside it is refused by the exact-key-set check, a bound
summary-compared:   ✗ FAIL: TB-021-04: the declared rules.packReadBoundMs is present, positive and stamped v2, a configuration missing it or carrying a near-miss key beside it is refused by the exact-key-set check, a  vs    ✓ TB-021-04: the declared rules.packReadBoundMs is present, positive and stamped v2, a configuration missing it or carrying a near-miss key beside it is refused by the exact-key-set check, a bound   (elapsed time normalised out)
revert-verified:  yes (committed=2905406391581044ea58b2fcaaa74dd830b894f4 restored=2905406391581044ea58b2fcaaa74dd830b894f4)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`. Both channels discriminated here, not only the exit code.

#### P6 — the exact-key-set check, document direction

The member deleted from the configuration document while the expected key set
still requires it. `design.md` asks for both directions and this is the second.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-021-04 with packReadBoundMs deleted from the configuration document while the expected key set still requires it
file:             lifetime-tax-strategy.config.json
mutation:         "packReadBoundMs": 10000,  ->      (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TB-021-04: the declared rules.packReadBoundMs is present, positive and stamped v2, a configuration missing it or carrying a near-miss key beside it is refused by the exact-key-set check, a
green-exit:       0
green-summary:      ✓ TB-021-04: the declared rules.packReadBoundMs is present, positive and stamped v2, a configuration missing it or carrying a near-miss key beside it is refused by the exact-key-set check, a bound
summary-compared:   ✗ FAIL: TB-021-04: the declared rules.packReadBoundMs is present, positive and stamped v2, a configuration missing it or carrying a near-miss key beside it is refused by the exact-key-set check, a  vs    ✓ TB-021-04: the declared rules.packReadBoundMs is present, positive and stamped v2, a configuration missing it or carrying a near-miss key beside it is refused by the exact-key-set check, a bound   (elapsed time normalised out)
revert-verified:  yes (committed=d174d417e19ac6c17b20e5765c70d8c606b698ac restored=d174d417e19ac6c17b20e5765c70d8c606b698ac)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`. The mutation's replacement is a single space, because the harness
requires a non-empty `--replace`; the effect is deletion of the member.

#### P7 — `TB-021-03` fails when the abort signal is never passed to `fetch`

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-021-03 with the AbortController constructed but its signal never passed to fetch
file:             lifetime-tax-strategy-lab.html
mutation:         signal: controller.signal  ->  signal: undefined   (1 occurrence(s))
command:          npx --no-install playwright test tests/lifetime-tax-read-bound.spec.mjs --project=chromium --reporter=line -g the\ settlement\ header\ does\ not\ remain\ Loading\ once\ the\ declared\ bound\ has\ elapsed
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-read-bound.spec.mjs:185:1 › Regression: SCN-021-01 the settlement header does not remain Loading once the declared bound has elapsed 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-read-bound.spec.mjs:185:1 › Regression: SCN-021-01 the settlement header does not remain Loading once the declared bound has elapsed
summary-compared:     [chromium] › tests/lifetime-tax-read-bound.spec.mjs:185:1 › Regression: SCN-021-01 the settlement header does not remain Loading once the declared bound has elapsed   vs  [1/1] [chromium] › tests/lifetime-tax-read-bound.spec.mjs:185:1 › Regression: SCN-021-01 the settlement header does not remain Loading once the declared bound has elapsed   (elapsed time normalised out)
revert-verified:  yes (committed=49d3eb42c819966d4f312e076786e959b51b3071 restored=49d3eb42c819966d4f312e076786e959b51b3071)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

#### P8 — `TB-021-02` fails when the bound is lowered to 1000

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TB-021-02 with the declared bound lowered to 1000, below the 3058ms a real read was observed taking
file:             lifetime-tax-strategy.config.json
mutation:         "packReadBoundMs": 10000  ->  "packReadBoundMs": 1000   (1 occurrence(s))
command:          npx --no-install playwright test tests/lifetime-tax-read-bound.spec.mjs --project=chromium --reporter=line -g settles\ with\ every\ figure\ identical\ to\ the\ undelayed\ settlement
red-exit:         1
red-summary:          [chromium] › tests/lifetime-tax-read-bound.spec.mjs:160:1 › Regression: SCN-021-02 a declared pack delayed below the bound settles with every figure identical to the undelayed settlement 
green-exit:       0
green-summary:    [1/1] [chromium] › tests/lifetime-tax-read-bound.spec.mjs:160:1 › Regression: SCN-021-02 a declared pack delayed below the bound settles with every figure identical to the undelayed settlement
summary-compared:     [chromium] › tests/lifetime-tax-read-bound.spec.mjs:160:1 › Regression: SCN-021-02 a declared pack delayed below the bound settles with every figure identical to the undelayed settlement   vs  [1/1] [chromium] › tests/lifetime-tax-read-bound.spec.mjs:160:1 › Regression: SCN-021-02 a declared pack delayed below the bound settles with every figure identical to the undelayed settlement   (elapsed time normalised out)
revert-verified:  yes (committed=d174d417e19ac6c17b20e5765c70d8c606b698ac restored=d174d417e19ac6c17b20e5765c70d8c606b698ac)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Probe exit `0`.

### A finding this round produced that the design did not anticipate

The first draft of these assertions declared its waits as
`{ timeout: BOUND_MS + MARGIN_MS }`, deriving the wait from the configuration so
no number was restated. The repo's own BUG-009 budget guard rejected it:

```
  ✗ FAIL: every declaration was attributed to an enclosing test budget, so none was passed over unevaluated (158 evaluated, 0 skipped, 3 unresolved)
```

That guard can only police a declared wait it can read as a number, and it
reports an expression it cannot resolve as unresolved rather than quietly
trusting it. A derived wait is therefore not free: it buys agreement with the
configuration and pays for it with a wait no guard can check. The delivered form
takes both — the wait is a digit literal the guard resolves, and the first
assertion pins that literal against `BOUND_MS + MARGIN_MS`, so a change to the
declared bound fails on the pin rather than leaving a stale number behind.

### Validation

```
SELFTEST_EXIT=0
self-test: 3409 passed, 0 failed
VP_EXIT=0
[spec-test-paths] scanned=793 references=18185 distinctPaths=267 missingPaths=70 plannedMissing=0 baseline=70 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
```

`3409` is the count before and after this round. The six assertions added here
are browser assertions, which the node self-test does not count, so the total is
unchanged rather than lower.

A later run of the same validator in the same session reported `new=0 stale=3`,
naming `tests/tool-brief-v2.unit.mjs`,
`tests/tool-brief-v2-author-boundary.functional.mjs` and
`tests/tool-brief-v2-publication.integration.mjs`. All three are untracked and
this round did not create, reference or stage any of them; a concurrent session
added them while this one was running, which turned three existing baseline
entries from missing into present and therefore stale. `new` stayed `0` and the
exit code stayed `0` across every run. The drift is recorded here rather than
silently omitted, because the run captured above and the state of the tree
afterwards are two different facts and only one of them is this round's.

One further reading is recorded because it was nearly mistaken for probe residue.
A literal grep for `"packReadBoundMs": 1000`, run as a residue check after the
probes, reported one occurrence. It is a substring of the committed
`"packReadBoundMs": 10000`, not a surviving mutation: the parsed value is
`10000` and `git diff` against `HEAD` reports the file unchanged. A residue check
written as a substring match can accuse a clean file, which is why the
authoritative check is the tracked-file status rather than the grep.

### The lifetime-tax browser suite

```
Running 111 tests using 2 workers
  111 passed (1.1m)
```

Exit code `0`. Command:
`npx --no-install playwright test tests/lifetime-tax-*.spec.mjs --project=chromium --reporter=line`.
The family held 105 tests before this round and holds 111 after it, so it carries
no fewer assertions than it did.

### Code Diff Evidence

**Claim Source:** executed, 2026-08-29. Re-derived from the repository rather than restated.

The route change landed at one commit, across three shipped files:

```
$ git show --stat --format='%h %s' 084572757
084572757 BUG-021: bound every declared document read from a stratified declaration surface

 lifetime-tax-strategy-lab.html    | 101 ++++++++++++++++++++++++++++++++------
 lifetime-tax-strategy.config.json |   3 +-
 rltaxworkspace.js                 |  22 ++++++++-
 3 files changed, 109 insertions(+), 17 deletions(-)
```

Both strata of the declaration surface are present in the shipped files:

```
$ grep -n 'CONFIG_READ_BOUND_MS' rltaxworkspace.js
33:  var CONFIG_READ_BOUND_MS = 10000;
842:    CONFIG_READ_BOUND_MS: CONFIG_READ_BOUND_MS,
$ grep -n 'packReadBoundMs' lifetime-tax-strategy.config.json
16:    "packReadBoundMs": 10000,
```

Stratum 0 governs the one read that fetches the configuration; stratum 1 governs
the eight pack reads the configuration itself declares. The surface is split
because a single stratum is circular — the configuration read cannot be governed
by a value that only exists once the configuration has been read.

#### RED → GREEN ordering

The ordering below is the whole argument for these assertions. Each was driven to
a **red stage** first, against a deliberately broken route, and only then to a
green one. `scripts/red-green-probe.sh` pins `--summary-match` to each
assertion's own wording, so a probe cannot pass by tripping some unrelated check.

**RED stage** — each mutation makes the targeted assertion fail:

| Probe | Mutation | Result |
|---|---|---|
| `P1` | abort signal never passed to `fetch` | `TB-021-01` fails — the pre-change hang returns |
| `P2` | bound lowered below a delay a real read has taken | `TB-021-05` fails |
| `P3` | bound widened past any wait the suite can make | `TB-021-06` fails |
| `P4` | stratum 0 seeded from a literal | stratum-0 assertion fails |
| `P5` | member removed from `CONFIG_SECTION_FIELDS.rules` | exact-key-set check fails, module direction |
| `P6` | member deleted from the document | exact-key-set check fails, document direction |
| `P7` | abort signal never passed to `fetch` | `TB-021-03` fails |
| `P8` | bound lowered to 1000 | `TB-021-02` fails |

**GREEN stage** — with the mutations reverted, the same assertions now pass:

```
Running 111 tests using 2 workers
  111 passed (1.1m)
SELFTEST_EXIT=0
self-test: 3409 passed, 0 failed
```

`P3` is the probe that matters most. A bound asserted only on the failing side
can be widened indefinitely and still pass, so the guarantee would decay silently
with nothing going red. Widening it to 600000 makes the refusing-side assertion
fail, which is what proves the bound is actually load-bearing rather than
decorative.
