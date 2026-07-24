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

## User Journey

1. Configure the tailnet proxy and a browser-local key for one provider.
2. Use a tool while the proxy is reachable but that provider route is
   unavailable.
3. Observe that the tool still receives the same provider's direct response.
4. Inspect provider status and diagnostics and find no credential disclosure.
5. Remove the local key and repeat; observe a sanitized failure instead of a
   cross-provider or unauthenticated fallback.
