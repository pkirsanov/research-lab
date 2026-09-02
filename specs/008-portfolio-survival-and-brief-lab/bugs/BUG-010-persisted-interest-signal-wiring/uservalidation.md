# User Validation: BUG-010 Persisted Interest-Signal Wiring

Automation readiness and human acceptance are separate. Automation may record
technical readiness. It cannot grant acceptance.

## Automation Readiness

- [ ] Real-page completion persists a current non-empty interest-signal cache.
- [ ] Reload retains the persisted cache and supporting evidence.
- [ ] Stale-only evidence removes the signal without throwing.
- [ ] Behavior clear empties events and interests on storage reread.
- [ ] Passive activity creates no behavior event or interest signal.
- [ ] Black-Litterman accounting observes the real signal count and derives no behavior contribution.
- [ ] Atomic persistence failure preserves the prior authoritative generation.
- [ ] Independent validation certifies the packet.

## Checklist

- [ ] Completed research updates behavior history and current derived interests.
- [ ] Reload keeps the same current derived-interest evidence available locally.
- [ ] Expired evidence disappears without breaking the page.
- [ ] Clear behavior removes the history and its derived interests.
- [ ] Settings, mode, scrolling, and dwell do not create inferred interests.
- [ ] Black-Litterman states the observed signal count while creating no inferred view.
- [ ] A failed save states that the completion was not recorded.

## Human Acceptance Record

Acceptance has not occurred. Only a human may fill this record.

- acceptedBy: [unfilled]
- acceptedAt: [unfilled]
- method: [unfilled]
