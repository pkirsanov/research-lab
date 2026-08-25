# User Validation: BUG-003 Reconcile TP-10-02 To The Ratified Shell Brief-View Contract

Items are **checked by default** because each was verified by real execution recorded in
[report.md](report.md). Uncheck any item to report that the behaviour is broken.

## Checklist

- [x] The Feature 012 shell keeps the per-tool brief in its **Brief** view; selecting Brief reveals the already-loaded brief with no refetch.
- [x] No product, shell, config or tool-page behaviour changed — the fix is confined to one test file.
- [x] `tests/distributed-briefs.static.integration.mjs` (TP-10-02) passes.
- [x] The 13 Feature 002 Scope 10 sibling regressions in `tests/distributed-briefs.spec.mjs` still pass and that file is unmodified.
- [x] `node scripts/selftest.mjs` still reports `952 passed, 0 failed`.
- [x] `node --test tests/simple-production-bridge.integration.mjs` still reports 6/6 with `wired (19)`.
- [x] TP-10-02 still proves the selective-fetch contract: no history partition before "Open history", no refetch on the Power switch, exactly one partition per selected filter.
- [x] TP-10-02 still proves the fail-closed contract: a SHA-256 mismatch yields `integrity-error` with no partial evidence.

## Human Acceptance Record

- acceptedBy: operator
- acceptedAt: 2026-08-25T16:59:38Z
- method: human-interactive
