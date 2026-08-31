# User Validation: BUG-004 Proxy Route Local-Key Fallback

Links: [spec.md](spec.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Checklist

- [x] Acceptance question recorded: a healthy proxy remains the first provider transport attempt.
- [x] Acceptance question recorded: a failed proxy provider route falls back only to a local key for the same registered provider.
- [x] Acceptance question recorded: the local key never appears in a proxy URL, status, error, DOM node, or log.
- [x] Acceptance question recorded: no local key means no direct request and a sanitized fail-closed error.
- [x] Acceptance question recorded: force-local bypasses the proxy provider route.
- [x] Acceptance question recorded: unknown-provider and prototype defenses are unchanged.
- [x] Acceptance question recorded: Git-backed option snapshots, `scripts/fetch-options.mjs`, options-tool fetch order, and done BUG-002 artifacts are unchanged.

Checked items mean the acceptance questions are present in the packet. They do
not claim that the current implementation satisfies them. Runtime evidence must
be recorded in [report.md](report.md#bug-verification---after-fix) by the owning
test and validation phases.

## Human Acceptance Record

- acceptedBy: operator
- acceptedAt: 2026-08-28T04:48:18Z
- method: external-record
- record: .specify/memory/open-work.md residue row res-g136-acceptance-record-backfill, section OPERATOR ACCEPTANCE GRANT 2026-08-28, which quotes the operator's instruction verbatim

Read this record for exactly what it claims. The operator issued a blanket
acceptance instruction during an agent session; they did not exercise this
behavior in a live session, which is why the method is `external-record` and not
`human-interactive`. The checklist above records that the acceptance questions are
present, not that anyone answered them, so the acceptance rests on the operator's
grant over work this repository had already certified done
(`certification.status: done`, certified 2026-07-23T03:28:14Z), not on the
checked boxes.

## User Journey

1. Configure the tailnet proxy and a browser-local key for one provider.
2. Use a tool while the proxy is reachable but that provider route is
   unavailable.
3. Observe that the tool still receives the same provider's direct response.
4. Inspect provider status and diagnostics and find no credential disclosure.
5. Remove the local key and repeat; observe a sanitized failure instead of a
   cross-provider or unauthenticated fallback.
