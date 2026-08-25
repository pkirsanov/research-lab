# User Validation: BUG-004 Market Heatmap Control Surface

## Checklist

- [x] Direct Simple cold-open automatically becomes ready after hydration without toggling modes.
- [x] Simple exposes all five controls, and each updates the heatmap locally without refetching.
- [x] Direct Power exposes the original time-window, size, and grouping controls with selected states, visible keyboard focus, and local recompute.
- [x] Changing grouping uses the boot-hydrated universe without a new request.
- [x] Wrong-tool or wrong-view events do not disable or mutate the current heatmap controls.

## Human Acceptance Record

- acceptedBy: operator
- acceptedAt: 2026-08-25T16:59:38Z
- method: external-record
- record: .specify/memory/open-work.md residue row res-g136-acceptance-record-backfill
