# User Validation: BUG-001 Options-Flow Shell Startup Starvation

Links: [spec.md](spec.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Checklist

- [x] Acceptance question recorded: options-flow exposes the shared shell before heavy option delta hydration starts.
- [x] Acceptance question recorded: the existing 10-second all-route shell deadline is retained rather than increased.
- [x] Acceptance question recorded: all 23 registered routes remain in the canary and no route receives an exemption.
- [x] Acceptance question recorded: cache-first content still paints immediately and hydration still starts automatically once.
- [x] Acceptance question recorded: RLG, RLTKR, RLCTX, ticker links, and contextual controls remain enabled after hydration.
- [x] Acceptance question recorded: same-origin snapshots, Yahoo fallback, provider ownership, `scripts/fetch-options.mjs`, and `data/options/**` remain unchanged.
- [x] Acceptance question recorded: Feature 012 parent scope/status/certification and Scope 04 files remain unchanged.
- [x] Acceptance question recorded: isolated rollback restores the known RED and exact fixed-byte restore returns GREEN without changing protected data.

Checked items mean the acceptance questions are present in the bug packet. They
do not claim the implementation satisfies them. Runtime acceptance requires the
test, implementation, validation, and audit evidence defined in
[scopes.md](scopes.md#test-plan).

## User Journey

1. Open `options-flow-feed-lab.html` with current same-origin option snapshots.
2. Observe the four-view shell promptly, before the large options table begins
   its delta-hydration work.
3. Continue using the page while option snapshots load automatically.
4. Verify ticker links and context controls remain present after rows render.
5. Run the unchanged all-23 shell command and observe every route pass.