# User Validation: BUG-021 — Remedy Delivered

This packet was filed by a `bubbles.stabilize` round with nothing delivered, and a
remedy was later carried into shipped code. The remedy is commit `084572757`,
"bound every declared document read from a stratified declaration surface", which
declares `packReadBoundMs` as 10000 in `lifetime-tax-strategy.config.json`, assigns
it in the route before any pack read, and applies it as the read bound — with
`rltaxworkspace.js` changed alongside; each was re-read at the audited commit
rather than taken from the packet's prose. Executed evidence: selftest checks
`TB-SEC-01-01` and `TB-SEC-01-02` hold the bound across the response body and
refuse a bound beyond the largest representable timer delay. All 14 Definition of
Done rows in `scopes.md` are ticked with none open. There is therefore delivered
behaviour to exercise. The framing that previously stood here, saying there was
none, was written at filing time and outlived the fix.

The checklist below is what a human should be able to confirm now that Scopes 1
and 2 are delivered. It was recorded at filing so the acceptance criteria were
fixed before the fix was written rather than after.

## Automation Readiness

| Item | Automatable | Why |
| --- | --- | --- |
| A withheld document reaches a terminal state | Yes | A browser assertion on the display-state attribute |
| A delayed document still settles | Yes | A browser assertion on the settled figures |
| The message names the document | Yes | A browser assertion on the rendered text |
| The wait is short enough to feel bounded | No | Whether a bound feels like patience or like a hang is a human judgement |
| The bound is the right length | No | Trading a slow origin against a hung one is an owner judgement about who is being served |

The last two are the reason this file exists. Everything else belongs in the
suite.

## Checklist

- [ ] Opening the route normally still settles, with every figure identical to before the fix.
- [ ] Opening the route against an origin that withholds one pack ends in a message rather than in a spinner.
- [ ] That message arrives soon enough that a person would wait for it rather than assume the page is broken.
- [ ] The message says which document did not arrive, in words a reader who is not a programmer can follow.
- [ ] The message does not read as a crash. It reads as the tool declining to continue without a document it needs.
- [ ] The settlement header does not still read `Loading` after the message appears.
- [ ] An origin that is merely slow, rather than stalled, still produces a normal settlement.
- [ ] The bound the owner chose is long enough that a slow but working origin is not turned into a failing one.

## Human Acceptance Record

**Accepted by:**

**Date:**

**What was checked, in the checker's own words:**

**Anything the checker did not accept:**
