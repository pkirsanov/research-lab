# User Validation: BUG-020 — Filed, Nothing Delivered

This packet was filed by a `bubbles.stabilize` round. No scope has been started,
no shipped file has been changed, and there is nothing yet to accept.

The checklist below is what a human should be able to confirm **after** Scopes 1
and 2 are delivered. It is recorded now so the acceptance criteria are fixed
before the fix is written rather than after.

## Automation Readiness

| Item | Automatable | Why |
| --- | --- | --- |
| The refusing side refuses by name | Yes | A browser assertion on the refusal code |
| The settling side is unchanged | Yes | A browser assertion on the rendered figures |
| No infinity symbol or `NaN` renders anywhere | Yes | A browser assertion over the rendered text |
| The refusal reads as a refusal to a person | No | Whether the wording is understandable is a human judgement |
| The chosen refusal code names the real defect | No | Whether a vocabulary member is honest is an owner judgement about meaning |

The last two are the reason this file exists. Everything else belongs in the
suite.

## Checklist

- [ ] Opening the route and declaring an ordinary household still settles, with every figure identical to before the fix.
- [ ] Declaring ordinary income and qualified dividends at `8.9e307` each still settles, and every stage row shows a real dollar amount.
- [ ] Declaring ordinary income and qualified dividends at `9e307` each shows a refusal instead of a figure on every stage that cannot be represented.
- [ ] That refusal states, in words a reader who is not a programmer can follow, that the declared amounts are too large for the tool to represent, and does not read as a crash.
- [ ] No row anywhere on the route shows an infinity symbol or the text `NaN`.
- [ ] No refused row carries a rule-status label such as `enacted-current-law`.
- [ ] The settlement header does not read `Settled` while any stage it depends on is refused for this reason.
- [ ] Reloading the page with that declaration still stored reproduces the refusal rather than a settlement.
- [ ] The refusal code the owner chose reads, to the owner, as naming this defect rather than a nearby one.

## Human Acceptance Record

**Accepted by:**

**Date:**

**What was checked, in the checker's own words:**

**Anything the checker did not accept:**
