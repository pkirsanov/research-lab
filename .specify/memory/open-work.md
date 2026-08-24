# Open Work Register

This file is COMMITTED on purpose. A record of open work that lives only in a
chat transcript, a terminal scrollback, or an uncommitted file is lost at
exactly the moment it is needed — when the session ends.

Render it with:

```
bash .github/bubbles/scripts/cli.sh open-work
```

## What belongs here

Only **residue**: work that was noticed and never filed. It has no spec, no bug,
and no improvement entry, so nothing else in the repository knows it exists.

Rows for specs, bugs, and improvements are **derived on every run** from
`state.json` (via `work-tracker-project.sh`) and `improvements/INDEX.md`. Do not
author them here. Writing a status into this table that another artifact already
owns creates a second source of truth, and the two will disagree.

## Rules

- A residue row MUST carry both a `next-owner` and a `next-action`. A row nobody
  owns, or whose next step is "finish the thing", does not survive the next
  session and fails `open-work --lint`.
- `kind` must be `residue`. Any other value is a lint defect.
- `id` must be unique, so a row can be removed unambiguously when it closes.
- **Closed rows are DELETED, not tombstoned.** A row disappears when its work is
  done or when it graduates into a spec, bug, or improvement — at which point
  the derived projection covers it. This table answers "what is still open"; a
  growing tail of closed rows destroys that answer. Git history is the audit
  trail for what was removed and when.

## Residue

| id | title | kind | ref | state | next-owner | next-action | opened | last-seen |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| res-first-load-fix-copy | Orphaned `.first-load-fix-worktree/` copy pollutes repo-wide scans | residue | .first-load-fix-worktree/ | open | operator | Confirm no live session reads it — it holds no `.git` and `git worktree list` does not register it — then delete it or add it to `.gitignore`, so repo-wide censuses stop needing `--exclude-dir=.first-load-fix-worktree` and stop surfacing its stale duplicate of `scripts/selftest.mjs` | 2026-08-19 | 2026-08-24 |
| res-macos-ui-probe-scratch | Abandoned macOS accessibility-probe scratch set at repo root | residue | get_elements.py, parse_ui.py, run_accessibility_map.py, temp_script.scpt, err.txt, out.log, out.txt | open | operator | Confirm the macOS System Events UI-traversal episode is finished — all three logs record AppleScript errors and `out.txt` is empty — then delete all seven paths or add them to `.gitignore` | 2026-08-19 | 2026-08-24 |
| res-zz-probe-focusable | Self-declared temporary keyboard probe outlived its session and is load-bearing | residue | tests/zz-probe-focusable.spec.mjs | open | operator | Decide keep-or-delete for this probe, which spec 027 deliberately declined to remove; deleting it first requires clearing the reference at `specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact/report.md:266`, or `scripts/selftest.mjs` fails its spec-referenced-test-path scan with `NEW-MISSING` | 2026-08-19 | 2026-08-24 |
| res-chaos-lifetime-tax-probe | Untracked lifetime-tax chaos probe named by no artifact | residue | tests/chaos-lifetime-tax-probe.spec.mjs | open | operator | Confirm the in-flight lifetime-tax chaos round no longer needs it before touching it, then delete it as its own header directs or promote it to a durable regression owned by specs 021-024 | 2026-08-24 | 2026-08-24 |
| res-stash-outstanding | One git stash is outstanding in the primary working tree | residue | working tree | open | operator | Run `git stash list`, then apply or drop it deliberately; it belongs to in-flight work and must not be dropped blind | 2026-08-23 | 2026-08-24 |

## Notes

- The four `res-*` file rows above supersede the single coarse `untracked-scratch` row this
  register carried on 2026-08-23. They cover the same ten paths; splitting them by episode lets
  each carry its own precondition, which one row could not. `res-zz-probe-focusable` in
  particular cannot be closed by deleting the file alone.
- `closeout --apply` HAS now been run, on 2026-08-24. It deleted four provably-merged branches,
  refused to delete `rescue/uncommitted-20260822` because that branch carries unique commits,
  and did not touch the stash. The 2026-08-23 note that it had been deliberately withheld no
  longer applies.
- The `unpushed-31` row is gone because the commits it named were landed on `main`, not because
  the concern lapsed. If a future session finds commits ahead of `origin/main`, that is a new
  row, not this one reopened.
- Spec and scope status is intentionally absent from this table, in prose as well as in rows. It
  is derived on every run, so restating it here recreates the second source of truth the row
  schema exists to prevent, and it goes stale the moment another session lands a scope. Read it
  from `cli.sh open-work` instead.
