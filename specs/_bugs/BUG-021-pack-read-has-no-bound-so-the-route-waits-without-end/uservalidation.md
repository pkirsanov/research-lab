# User Validation: BUG-021 — Bounding Every Declared Document Read

This packet was filed by a `bubbles.stabilize` round, and its title and opening paragraph long
outlived that state. Both scopes are now `done` and all 14 Definition-of-Done items are checked, so
the original text — "No scope has been started, no shipped file has been changed, and there is
nothing yet to accept" — is stale and has been corrected rather than left to contradict the
packet's own record.

The checklist below was written before the fix so the acceptance criteria would be fixed in advance
rather than after the fact. It is now checked on the repository operator's explicit authorization
dated 2026-08-27, transcribed by automation.

Acceptance is not certification. This packet's `status` and `certification.status` remain
`in_progress`, and gates other than G136 are still failing.

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

- [x] Opening the route normally still settles, with every figure identical to before the fix.
- [x] Opening the route against an origin that withholds one pack ends in a message rather than in a spinner.
- [x] That message arrives soon enough that a person would wait for it rather than assume the page is broken.
- [x] The message says which document did not arrive, in words a reader who is not a programmer can follow.
- [x] The message does not read as a crash. It reads as the tool declining to continue without a document it needs.
- [x] The settlement header does not still read `Loading` after the message appears.
- [x] An origin that is merely slow, rather than stalled, still produces a normal settlement.
- [x] The bound the owner chose is long enough that a slow but working origin is not turned into a failing one.

Each box above was checked on the operator's instruction dated 2026-08-27 and transcribed by
automation. The final two items are the human judgements the readiness table above marks as
non-automatable, and they are the operator's judgement, not automation's.

## Human Acceptance Record

The repository operator granted acceptance as a batch directive during the working session of
2026-08-27/28. The operator did not separately exercise this behaviour in a live session; they
authorized on the basis of the verification reported to them. That is exactly why the method below
is `external-record` rather than `human-interactive` — the accepting act happened in the session,
outside this file, and the operator's dated directive **is** the record. No UAT ticket, sign-off ID,
or other external artifact exists, and none is claimed.

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-27
- method: external-record
- record: Operator directive in the 2026-08-27/28 working session, quoted verbatim — "authorized, approved, update all user validations as approved" and "Don't stop for user review, commit, continue, user approves all". Transcribed by automation 2026-08-28; the directive itself is the acceptance artifact and no external ticket exists.
