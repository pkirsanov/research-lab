# User Validation: BUG-004 Occurrence Identity

Automation readiness and human acceptance remain separate. The `## Checklist`
items are human-owned and remain unchecked until the operator accepts them; the
`## Human Acceptance Record` below is the terminal acceptance fact. Uncheck any
item to report that the behavior is broken; an unchecked item is a blocking
user-reported regression. Packet certification is a separate,
`bubbles.validate`-owned fact tracked in `state.json`, not asserted here.

The repository's former "checked-by-default" convention was retired by IMP-047
PD-12. Automation MUST NOT check a `## Checklist` item.

## Automation Readiness

- [x] Parent design text is reconciled with D1-Q2.
- [x] The focused occurrence-admission unit row passes.
- [x] The adversarial anti-inflation functional row fails before projection
  repair and passes after repair.
- [x] The exact live browser row proves storage growth without rank inflation.
- [x] The broader browser matrix and canonical selftest pass.
- [ ] Validate-owned certification completes.

## Checklist

- [ ] Record one valid semantic completion.
- [ ] Record the same semantic completion at another instant on the same New
  York civil date.
- [ ] Confirm both distinct occurrences remain in local audit storage.
- [ ] Repeat one exact occurrence and confirm storage does not grow.
- [ ] Confirm supporting identities, distinct-date floor, score, relevance
  band, and ranked order match the baseline without repeated semantics.
- [ ] Confirm privacy inventory reports the real stored occurrence count
  without exposing subject values.

## Human Acceptance Record

- acceptedBy: [human name or handle - never an agent id]
- acceptedAt: [YYYY-MM-DDTHH:MM:SSZ]
- method: [human-interactive | external-record]

No human acceptance is currently recorded. The only verified operator turn
behind the previously quoted phrases is host transcript session
`af4b63ee-61bb-4d54-ab46-d9c78d5cc181`, record 5713, at
`2026-08-23T19:57:05.002Z`. It granted broad autonomy to resolve Feature 008
work and to continue without stopping for review. It predates this bug packet's
`2026-08-24` creation, names neither BUG-004 nor any Checklist behavior, and is
not a BUG-004 acceptance record. Later copies of those phrases were authored by
agents in reasoning or subagent prompts; they are not additional human acts.

The six boxes were introduced by automation in commit `e354bb3846` and cannot
satisfy PD-12. Disclosure does not convert an automation-authored checkmark into
a human-authored acceptance fact, so they have been returned to `[ ]`.

To unblock terminal acceptance, a named human must either exercise and accept
each of the six scenarios, check each item, and record `human-interactive`, or
create a durable external sign-off or release-approval record that explicitly
names BUG-004 and accepts all six behaviors, then record its pointer with
`external-record`. This is not witnessed UAT and no such acceptance is claimed.
