# User Validation: BUG-023 — Filed, Nothing Delivered

This packet was filed by a diagnostic round. No scope has been started, no shipped file has been
changed, and there is nothing yet to accept.

The checklist below is what a human should be able to confirm **after** Scopes 1 and 2 are
delivered. It is recorded now so the acceptance criteria are fixed before the fix is written
rather than after.

## Automation Readiness

| Item | Automatable | Why |
| --- | --- | --- |
| A lull no longer changes the verdict | Yes | Re-run the `report.md` probe against the fixed test |
| The disclosure invariant still fails on a real violation | Yes | The adversarial case in Scope 2 |
| A deferred same-origin fetch still passes | Yes | A browser assertion |
| An unmet precondition names itself | Yes | Assert on the failure text |
| Whether direction A, B or C is the right trade | No | B narrows what the test observes; A changes the page for testability. Which cost is acceptable is an owner judgement |
| Whether the suite now feels trustworthy | No | Trust is restored by a run of green days, not by one green run |

The last two are the reason this file exists. Everything else belongs in the suite.

## Checklist

- [ ] The full browser suite passes repeatedly on a machine under load, not only when idle.
- [ ] A block wired to issue an off-origin request on expansion still turns the suite red.
- [ ] A block that defers a same-origin artifact fetch until opened still passes.
- [ ] When the page's load cannot be shown to have finished, the failure says so in those words,
      and does not accuse the page of an off-origin request.
- [ ] The fix contains no retry, no lengthened sleep, and no widened quiet window.
- [ ] A reader of the test can tell, from the test alone, what makes its baseline trustworthy.

## Human Acceptance Record

_Not started. To be completed by the human operator after Scopes 1 and 2 are delivered._

| Field | Value |
| --- | --- |
| Accepted by | _pending_ |
| Date | _pending_ |
| Commit verified | _pending_ |
| Notes | _pending_ |
