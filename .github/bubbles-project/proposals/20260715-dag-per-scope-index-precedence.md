# Bubbles Framework Change Proposal

- Title: dag per scope index precedence
- Slug: dag-per-scope-index-precedence
- Created: 2026-07-15
- Created From: research-lab
- Requested Upstream Repo: bubbles

## Summary

Update `bubbles dag <spec>` so the canonical per-scope-directory layout is parsed from `scopes/_index.md` and `scopes/*/scope.md` even when a top-level `scopes.md` compatibility pointer exists. The command must render the active scope IDs, statuses, and dependency edges rather than treating the pointer as an executable single-file plan.

## Why This Must Be Upstream

The defect is in the framework-owned `cmd_dag` implementation in `bubbles/scripts/cli.sh`. Feature 002 already uses the canonical six-plus-scope layout and its project-owned artifacts cannot change framework parsing precedence or accepted canonical heading syntax. A local `.github/bubbles/**` edit would violate downstream framework immutability and disappear on refresh.

## Current Downstream Limitation

`bash .github/bubbles/scripts/cli.sh dag 002` exits 0 but emits an empty graph when `specs/002-distributed-tool-briefs-and-history/scopes.md` is a five-line non-executable pointer and the active ten-scope DAG lives in `scopes/_index.md`. Before the legacy body was removed, the same parser read bold `Depends On` text from that superseded file; shell word expansion then rendered repository-root filenames as Mermaid nodes. The current implementation also searches for legacy `## Scope ...`, `Status: ...`, and `Depends On: ...` forms, while canonical per-scope files use `# Scope 01`, `**Status:** ...`, and `**Depends On:** ...`.

## Proposed Bubbles Change

1. Make per-scope-directory layout authoritative whenever `scopes/_index.md` exists; a compatibility `scopes.md` must not shadow it.
2. Parse the `_index.md` dependency table as the primary graph contract, or parse canonical per-scope headers without shell glob expansion.
3. Normalize node IDs to `SCOPE-NN`, preserve all dependency edges, and fail nonzero when an active layout resolves to zero nodes.
4. Add selftests for a ten-scope DAG, a top-level legacy pointer, bold canonical headers, multiple dependencies, and malformed dependency text that must never expand against the working directory.
5. Document precedence between single-file and per-scope-directory layouts in CLI help or the DAG command documentation.

## Affected Framework Paths

- `bubbles/scripts/cli.sh`
- DAG command selftests under `bubbles/scripts/` or `tests/`
- CLI/DAG documentation, if maintained separately

## Expected Downstream Outcome

After the upstream fix and framework refresh, `bash .github/bubbles/scripts/cli.sh dag 002` in Research Lab must render exactly SCOPE-01 through SCOPE-10 from the active Feature 002 plan. Its edges must match `scopes/_index.md`, and SCOPE-01 must be the only zero-dependency root while all ten scopes remain `Not Started`.

## Acceptance Criteria

- [ ] `dag 002` renders exactly ten active Feature 002 scope nodes and no repository-root filenames.
- [ ] SCOPE-01 is the only zero-dependency root; edges match the active `_index.md` table exactly.
- [ ] A five-line non-executable top-level `scopes.md` pointer does not shadow `scopes/_index.md`.
- [ ] Canonical bold per-scope headers parse safely without shell pathname expansion.
- [ ] Resolving an active layout to zero nodes exits nonzero with an actionable diagnostic.
- [ ] Upstream selftests and framework validation pass, and the normal refresh flow distributes the fix.

## Notes

- Do not edit `.github/bubbles/**`, `.github/agents/bubbles*`, or other framework-managed files locally.
- Implement the framework fix in the Bubbles source repo, then refresh this repo via install/refresh.
