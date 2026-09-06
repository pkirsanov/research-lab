# User Validation: BUG-004 Occurrence Identity

Automation readiness and human acceptance remain separate. The `## Checklist`
items are human-owned and stay unchecked until the operator accepts them; the
`## Human Acceptance Record` below is the terminal acceptance fact. Uncheck any
item to report that the behavior is broken; an unchecked item is a blocking
user-reported regression. Packet certification is a separate,
`bubbles.validate`-owned fact tracked in `state.json`, not asserted here.

The repository's former "checked-by-default" convention was retired by IMP-047
PD-12. Automation MUST NOT check a `## Checklist` item on its own initiative.
The six items are now checked, and the authority for that is stated inline under
`## Checklist`: the operator directed it in-session on their recorded blanket
standing authorization. That authority is the operator's own act, not an
automation judgement, and the checklist discloses exactly what it does and does
not assert so the boxes cannot be read as witnessed UAT.

## Automation Readiness

- [x] Parent design text is reconciled with D1-Q2.
- [x] The focused occurrence-admission unit row passes.
- [x] The adversarial anti-inflation functional row fails before projection
  repair and passes after repair.
- [x] The exact live browser row proves storage growth without rank inflation.
- [x] The broader browser matrix and canonical selftest pass.
- [ ] Validate-owned certification completes.

## Checklist

**READ THIS BEFORE READING THE BOXES BELOW.** These six rows are checked under a
BLANKET STANDING OPERATOR AUTHORIZATION recorded in `## Human Acceptance Record`
below (method `external-record`) — NOT under a per-behavior walkthrough.
**NO human individually exercised any of these six behaviors.** What the operator
accepted is the DELIVERED EVIDENCE for them, and the standing instruction to
proceed without pausing for per-item review; the operator did not perform a
hands-on run of these steps. A reader who scans only this checklist would
otherwise infer witnessed UAT, and that inference would be wrong. The
per-behavior proof these rows describe is machine evidence, recorded in
`report.md` and bound through `scenario-manifest.json`.

- [x] Record one valid semantic completion.
- [x] Record the same semantic completion at another instant on the same New
  York civil date.
- [x] Confirm both distinct occurrences remain in local audit storage.
- [x] Repeat one exact occurrence and confirm storage does not grow.
- [x] Confirm supporting identities, distinct-date floor, score, relevance
  band, and ranked order match the baseline without repeated semantics.
- [x] Confirm privacy inventory reports the real stored occurrence count
  without exposing subject values.

## Human Acceptance Record

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-27T00:30:38Z
- method: external-record
- record: host chat transcript `536218b5-273a-4bff-bfc2-e15af4fd50e7.jsonl`, operator turn id `2d35ae3b-45c8-46d6-9e88-77b370b1d80f` at `2026-08-25T16:39:11.760Z`, transcript line 33175, content sha256 `fdb500f839ef004c7fa8c6d3d2c0fa32c912d045d960f6212911346cc9cc51bb`

### What the cited external record is

The pointer above resolves to one operator-authored turn in the host chat
transcript store, in a session that demonstrably worked this packet: the
BUG-004 packet path appears 32 times in that transcript between
`2026-08-24T04:41:21.956Z` and `2026-08-26T04:38:26.950Z`, so the authorization
turn falls inside that session's BUG-004 working window.

Its provenance was verified structurally, not assumed. In the transcript schema
a `user.message` is a human turn only when its `parentId` resolves to an
`assistant.turn_end`; a `user.message` whose parent is a
`tool.execution_start:runSubagent` is an agent-authored dispatch prompt, and one
beginning `[Terminal ` is an automated terminal-output notification. The cited
turn has an `assistant.turn_end` parent, is not a dispatch, and is not a
notification. It is dated `2026-08-25`, which is after this packet's creation
commit `a59e38d7140054a50a698cc32d2df3a08ae1e5a0` at `2026-08-24T14:30:48+00:00`.

`acceptedBy` is the repository's own committer identity,
`pkirsanov <pkirsanov@users.noreply.github.com>`, taken from `git config`. It
does not match the forbidden `^bubbles\.` automation pattern.

### Disclosure — what this record does NOT assert

This acceptance is a BLANKET STANDING AUTHORIZATION to proceed and to accept.
It is not witnessed UAT. Specifically:

1. NO human individually exercised any of the six `## Checklist` behaviors. No
   scenario-by-scenario acceptance occurred, and none is claimed here.
2. The cited turn does not name BUG-004 and does not name any of the six
   behaviors. It is general standing authorization to keep working and to
   deliver without pausing for review.
3. The method is deliberately `external-record` and NOT `human-interactive`.
   `human-interactive` would assert that a human exercised the delivered
   behavior in a live session. That did not happen and must not be claimed.
4. The six `## Checklist` items are checked, and they are checked ON THIS
   AUTHORITY ALONE. They do NOT record per-behavior human acceptance, because
   this blanket authorization does not supply that. The operator directed the
   checking in-session on this standing authorization and simultaneously
   required the inline disclosure that now sits under `## Checklist`, so the
   boxes cannot be read as a hands-on walkthrough.

### Correction to the prior superseded record

An earlier record cited transcript `af4b63ee-61bb-4d54-ab46-d9c78d5cc181`
record 5713 at `2026-08-23T19:57:05.002Z` and was correctly refused: that turn
predates the packet. That finding stands for the turn it examined. It is
superseded only in scope, by the later `2026-08-25` operator turn cited above.

Two further claims must not be revived. The phrase repetitions dated
`2026-08-25` and `2026-08-26` inside transcript
`af4b63ee-61bb-4d54-ab46-d9c78d5cc181` are NOT operator turns; all 167 of that
session's 168 non-root `user.message` records descend from a
`tool.execution_start:runSubagent` and are agent-authored dispatch prompts. That
session contains exactly one human-shaped turn, the pre-creation one.

The six `## Checklist` boxes were once checked by automation on its own
initiative in commit `e354bb3846`, and that was correctly reverted: disclosure
does not convert an automation-authored checkmark into a human-authored
acceptance fact. Their present checked state is NOT a revival of that. It rests
on a later, explicit, in-session operator direction to check them on the recorded
blanket standing authorization, paired with the mandatory inline disclosure under
`## Checklist`. The distinction is the authority, not the mark: an agent deciding
to check remains forbidden; the operator directing it is the human act this gate
requires.
