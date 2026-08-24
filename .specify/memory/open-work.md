# Open Work Register

Carried-over **residue** only. Spec, bug and improvement rows are DERIVED on every run by
`bash .github/bubbles/scripts/cli.sh open-work`; authoring them here would create a second
source of truth for status, and the linter refuses it.

Residue is what no spec or bug owns: stashes, untracked scratch, unpushed work — anything that
would silently vanish at the next clone. A row is DELETED when it closes, not tombstoned.

Verify with `bash .github/bubbles/scripts/cli.sh open-work --lint`.

| id | title | kind | ref | state | owner | action | opened | lastseen |
|---|---|---|---|---|---|---|---|---|
| stash-1 | One git stash is outstanding in the primary working tree | residue | working tree | open | operator | Run `git stash list`, then apply or drop it deliberately; it belongs to in-flight work and must not be dropped blind | 2026-08-23 | 2026-08-23 |
| untracked-scratch | Ten untracked files sit in the primary working tree beside in-flight spec work | residue | working tree | open | operator | Run `git status --porcelain --untracked-files=all`, then commit what is real and delete what was scratch | 2026-08-23 | 2026-08-23 |
| unpushed-31 | Thirty-one commits are ahead of `origin/main` and are not covered by the last green CI run | residue | working tree | open | operator | Push them so CI covers them, or land them deliberately; the green run at `ac6675b0e` proves nothing about work that never reached the remote | 2026-08-23 | 2026-08-23 |

## Notes

- `closeout --apply` was deliberately NOT run on 2026-08-23: its hygiene actions operate on
  worktrees, branches and the stash above, all of which belonged to another session's
  outstanding work at the time.
- Spec-008 detail is intentionally absent from this table. Spec and scope status is derived on
  every run, so restating it here — even in prose — recreates the second source of truth the row
  schema exists to prevent, and it goes stale the moment another session lands a scope. Read it
  from `cli.sh open-work` and from `specs/008-portfolio-survival-and-brief-lab/` instead.
