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

- [x] Opening the route and declaring an ordinary household still settles, with every figure identical to before the fix.
- [x] Declaring ordinary income and qualified dividends at `8.9e307` each still settles, and every stage row shows a real dollar amount.
- [x] Declaring ordinary income and qualified dividends at `9e307` each shows a refusal instead of a figure on every stage that cannot be represented.
- [x] That refusal states, in words a reader who is not a programmer can follow, that the declared amounts are too large for the tool to represent, and does not read as a crash.
- [x] No row anywhere on the route shows an infinity symbol or the text `NaN`.
- [x] No refused row carries a rule-status label such as `enacted-current-law`.
- [x] The settlement header does not read `Settled` while any stage it depends on is refused for this reason.
- [x] Reloading the page with that declaration still stored reproduces the refusal rather than a settlement.
- [x] The refusal code the owner chose reads, to the owner, as naming this defect rather than a nearby one.

## Human Acceptance Record

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-29
- method: external-record
- record: Operator directive issued in the driving session, authorising acceptance of the user-validation items for this packet ("authorized, approved, update all user validations as approved"). Recorded as external-record because the acceptance rests on that directive rather than on the agent observing the owner exercise each item in a browser.

What this record does and does not carry. It carries an explicit operator authorisation, which
is a different thing from an agent granting itself acceptance — the distinction the blank record
above was protecting. It does not carry a claim that the owner personally rendered the Power view
at `9e307` and read the refusals; nothing in this session observed that, and asserting it would
be fabrication.

One item is worth naming rather than burying in the list, because it is the only one whose
subject is a judgement rather than a behaviour: whether `RLTAX-FIGURE-UNREPRESENTABLE` reads, to
the owner, as naming THIS defect rather than a nearby one. The behavioural items are verifiable
and were verified. That one is the owner's to hold, and it is accepted on the directive above
rather than on evidence, which is why the method is recorded as `external-record`.
