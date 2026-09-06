# Runbook: Integrate Research Lab Main

Links: [objective.md](objective.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Operating Boundary

Run commands from the `research-lab` repository root.
Apply a finite `gtimeout` on macOS or `timeout` on Linux.
Keep command output complete.
Use the evidence-capture helper when output exceeds 40 lines.

`PUSH: NOT AUTHORIZED`

`CLEANUP: NOT AUTHORIZED`

Do not fetch during Scope 1.
Do not run checkout, branch creation, merge, rebase, reset, stash mutation, clean, commit, push, ref deletion, or worktree removal.

## Repository Authority

Validate the exact inherited packet before every repository-sensitive run.
Reject a stale decision, changed root, changed revision, or non-actionable packet.
Preserve the validated repository decision unchanged in the result envelope.

## Worktree Aliases

Committed records use only these aliases.

| Alias | Registration role |
| --- | --- |
| `primary` | Primary Research Lab checkout |
| `company-r11` | Live Company checkpoint checkout |
| `shock-transmission` | Live Shock checkpoint checkout |
| `prunable-bug017-bug022` | Prunable BUG-017 and BUG-022 registration |
| `prunable-bug022` | Prunable BUG-022 registration |

Never commit an absolute worktree path.

## Scope 1 Freeze Procedure

1. Resolve full local `main`, `origin/main`, merge-base, and divergence identities.
2. Read every ref with `git for-each-ref --sort=refname`.
3. Group exact object mirrors while retaining every full ref name.
4. Read every registration with `git worktree list --porcelain`.
5. Read every live checkout with `git status --porcelain=v2 --branch --untracked-files=all`.
6. Read stash parents and trees without applying or dropping the stash.
7. Check Git lock files and operation markers in each live Git directory.
8. Check writer processes whose cwd or command resolves inside a registered Research Lab checkout.
9. Compute the normalized inventory identity.
10. Repeat refs, stash, registrations, and normalized status before accepting the freeze.
11. Append one `inventory-frozen` event and one `inventory-item` event per grouped ref item, worktree, and stash alias.

An unrelated Git process outside every Research Lab checkout is diagnostic only.
It must not create a false repository-writer refusal.

## Inventory Normalization

Use `ops-inventory-normalization/v1` in this exact order.

1. Repository alias.
2. Full local `main` identity.
3. Full `origin/main` identity.
4. Full merge-base identity.
5. Left and right divergence counts.
6. Ref name, object identity, and object type sorted by full ref name.
7. Worktree alias, head, branch, and registration state.
8. Stash alias, object, parents, and trees.
9. Porcelain-v2 status for every live worktree.

Exclude only `specs/_ops/OPS-integrate-research-lab-main/**` from status hashing.
Include all other tracked, staged, untracked, and ignored status signals.
Terminate the normalized payload with one newline before SHA-256 hashing.

For each ref object group, record tree-path deltas against both frozen main identities.
Each path set stores its exact count and SHA-256 identity.
These values describe tree differences only.
They do not prove representation or authorize exclusion.

## Classification Contract

Use only these classifications.

- `canonical-input`
- `delivery-candidate`
- `included-tip`
- `represented-preservation`
- `superseded-delivery`
- `rescue-root`
- `worktree-metadata`

Scope 1 records a design-time classification and proposed action.
It leaves `selectedInputs` empty.
Scope 2 must append final inclusion, representation, or refusal proof.

## Fetch Evidence

Record three distinct facts.

1. The operator reported that fetch completed before Scope 1.
2. The current local tracking ref resolves to `397dc41d7c4189299d2e2ceb0486927545e39677`.
3. The local reflog records `fetch --all --prune --tags: fast-forward` for that identity.

Set `fetchExecutedByScope1` to `false`.
Never place fetched refs into `selectedInputs` during Scope 1.

## Drift And Refusal

Append a `refusal` event with code `INVENTORY-DRIFT` when a frozen ref, stash, worktree, lock, marker, or scoped writer changes.
Record the observed condition, required condition, owner, and unchanged local `main`.
Invalidate the old inventory identity.
Allow one bounded rebuild from current state.
Stop after a second drift or any unresolved writer.

The initial custom capture attempt failed before freeze because its newline helper was undefined.
The next attempt rejected an unrelated Git writer outside Research Lab.
The bounded rebuild narrowed writer scope and produced the current frozen identity.

## Scope 1 Verification

After creating the ledger, run one focused read-only contract check.
It must prove all of these facts.

- Every line parses as one JSON object.
- The schema version is `ops-integration-ledger/v1`.
- Sequence values are contiguous from 1.
- Exactly one `inventory-frozen` record exists.
- Exactly 36 `inventory-item` records exist.
- Thirty ref groups cover 68 unique full ref names.
- Five unique worktree aliases exist.
- One stash alias exists.
- Every classification belongs to the closed vocabulary.
- No committed record contains an absolute home or temporary worktree path.
- The selected-input array is empty.
- The recomputed live inventory identity still matches the frozen identity.
- Git locks, operation markers, and scoped writers remain absent.

Run the packet artifact, freshness, reference, requirement, scenario, state, and prose checks after the focused check.
Do not mark TP-01-01, TP-01-02, or TP-01-03 complete until `/bubbles.test` authors and runs them.

## Later-Scope Entry Guards

Scope 2 must prove representation and preserve owner-approved dirty bytes before candidate construction.
Scope 3 must use a new isolated branch and worktree.
Scope 4 must bind every validation receipt to one unchanged candidate identity.
Scope 5 may move local `main` only through the design's compare-and-swap rule.

No later scope may infer certification or human acceptance from Git ancestry.

## Rollback Guidance

Scope 1 mutates no Git ref, stash, worktree registration, or product file.
Its refusal action is to retain the ledger and keep local `main` unchanged.

If Scope 5 later detects a post-CAS invariant failure, allow one reverse compare-and-swap only.
Use the frozen local `main` as the requested value and the approved candidate as the expected old value.
Record the result and stop.
Never reset a worktree or alter a remote ref as rollback.

<!-- End of operational runbook. -->