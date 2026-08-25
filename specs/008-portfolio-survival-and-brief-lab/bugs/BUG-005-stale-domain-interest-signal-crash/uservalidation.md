# User Validation: BUG-005 Stale-Domain Interest Signal Crash

Automation readiness and human acceptance are separate. Checked automation items
record executed technical evidence only. They do not grant acceptance.

## Automation Readiness

- [x] The focused stale-domain carrier passes all six tests, including the
  source-mutant discrimination case.
- [x] The unchanged BUG-004 unit and functional carriers pass together.
- [x] The canonical repository selftest passes.
- [x] Artifact lint passes for the complete BUG-005 packet.
- [ ] Independent validation certifies the packet.

## Checklist

- [ ] A workspace with only stale evidence in one domain no longer crashes.
- [ ] A fresh sibling domain still emits its signal when another domain is stale.
- [ ] Future-dated-only evidence is omitted without throwing.
- [ ] A below-floor but in-window domain is still reported as insufficient evidence.
- [ ] The brief still reports stale history honestly without assigning live relevance.
- [ ] Existing BUG-004 same-day occurrence and anti-inflation behavior is unchanged.

## Human Acceptance Record

Acceptance has not occurred. Only a human may fill this record.

- acceptedBy: [unfilled]
- acceptedAt: [unfilled]
- method: [unfilled]
