# Bug: BUG-002 Market Brief Session-Date Drift

Links: [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Summary

The scheduled Market Brief publisher can commit a new Tier-A snapshot and history row after a failed Tier-B narrative run while retaining the prior payload. When the Tier-A target advances from July 15 to July 16, the committed site combines July 16 snapshot context with July 15 actions and the repository selftest correctly blocks on the mismatch.

## Severity

- [ ] Critical - Destructive compromise or data loss is demonstrated
- [ ] High - The complete product is unusable with no bounded recovery
- [x] Medium - The Market Brief publishes contradictory actionable state and blocks the repository selftest
- [ ] Low - Minor or cosmetic issue

## Status

- [ ] Reported
- [x] Confirmed by current-session reproduction
- [x] In Progress
- [ ] Fixed
- [ ] Verified
- [ ] Closed

No source, runtime, generated Market Brief data, Feature 005, Feature 006, shared JavaScript, installed framework file, or unrelated dirty path was changed while creating this packet. Delivery and certification are not claimed.

## Discovery And Traceability

| Field | Value |
| --- | --- |
| Parent runner | `bubbles.goal`, `executionModel: direct-authorized-runner` |
| Workflow mode | `bugfix-fastlane` |
| Parent feature context | `specs/006-trend-dynamics-cycle-lab`, Scope 3 In Progress |
| Preserved finding | `F006-EXT-SELFTEST-MARKET-BRIEF-001` |
| Exact reproduction | `node scripts/selftest.mjs` |
| Current result | Exit 1; `496 passed, 1 failed` |
| Exact failure | `current payload satisfies the executable brief contract: nextSession.sessionDate must match snapshot.nextSessionDate` |

## Reproduction Steps

1. From the Research Lab repository root, leave the current worktree bytes unchanged.
2. Run `node scripts/selftest.mjs`.
3. Observe that every Feature 006 Scope 3 assertion passes and the sole repository failure is the Market Brief executable contract.
4. Inspect `market-brief.payload.json`: `window=pre-market`, `asOf=2026-07-15T07:32:00-04:00`, `generatedAt=2026-07-15T10:53:00-04:00`, and `nextSession.sessionDate=2026-07-15`; the thesis, actions, and imminent events repeatedly target July 15.
5. Inspect `market-brief.snapshot.json`: `window=after-hours`, `generatedAt=2026-07-15T21:02:38.507Z`, and `nextSessionDate=2026-07-16`.
6. Inspect Git provenance: the payload last changed in commit `3d1bbcf6b713bdc685f2d45bc2b65c72338a2275`, while snapshot/history last changed in data-only commit `3e5958ce9b2eee4977cb87a59b7cf18264c3d11d`.
7. Trace `scripts/brief-refresh-and-push.sh`: failed narrative attempts restore only the payload, Tier A is always staged, and the data-only branch commits snapshot/history without revalidating the retained payload against the candidate snapshot.

## Expected Behavior

- A published Market Brief pair always satisfies the unchanged executable assertion that `payload.nextSession.sessionDate === snapshot.nextSessionDate`.
- A retained Tier-B payload may remain visibly stale only when it still validates against the candidate Tier-A snapshot, including the same target session date.
- If Tier A advances the target date and Tier B does not produce a valid matching payload, the wrapper retains the prior coherent snapshot/payload/history set. Refreshed raw data may still be committed separately because it does not relabel old actions.
- A failed narrative attempt restores both payload and config candidate bytes before retry or exit.
- The wrapper refuses before mutation when any wrapper-owned publication path already has staged, unstaged, or untracked changes; unrelated dirty paths remain untouched and do not block the owned transaction.
- The current invalid committed state is repaired by restoring the last coherent Tier-A snapshot/history bytes that still target July 15 while leaving the complete July 15 payload narrative unchanged.

## Actual Behavior

- `scripts/brief-refresh-and-push.sh` always stages `market-brief.snapshot.json`, `brief-history.jsonl`, and `data/` after Tier A.
- When Tier B fails or is skipped, `NARRATIVE_OK` remains zero, the old payload is retained, and no pair-level validation runs before the data-only commit.
- The after-hours data-only commit advanced `snapshot.nextSessionDate` to July 16 while leaving a payload whose action block, thesis, and events target July 15.
- `market-brief.html` passes both objects to `RLBRIEF.renderNextSession`; the renderer takes date/thesis/actions from Tier B and market state from Tier A, so the mismatch is user-visible mixed state rather than archival staleness.
- `scripts/validate-brief-payload.mjs` and `scripts/selftest.mjs` correctly reject the pair.

## Root Cause

The controlling defect is a scheduler/wrapper publication-atomicity failure. The runbook's data-only behavior was implemented as unconditional publication of candidate Tier-A snapshot/history bytes, but the published unit is actually the Tier-A snapshot plus Tier-B action payload. The wrapper validates a newly generated payload but never validates a retained payload against the candidate snapshot. Its rollback boundary also excludes snapshot/history and config. The resulting invalid stale Tier-B state is category (a), produced by category (c); category (b) is valid only while the stale payload remains internally coherent with the candidate target date.

The validator assertion is specification-aligned and must remain. Changing `2026-07-15` to `2026-07-16` in the payload would falsely relabel a complete July 15 thesis, event set, and action plan.

## Change Boundary

### Authorized For The Delivery Owner

- `scripts/brief-refresh-and-push.sh`
- `tests/brief-refresh-atomicity.support.mjs` (new)
- `tests/brief-refresh-atomicity.test.mjs` (new)
- `tests/market-brief-session-date-drift.spec.mjs` (new)
- `market-brief.snapshot.json` and `brief-history.jsonl`, only for the exact current-pair repair described in [design.md](design.md)

### Protected Read-Only Inputs

- `market-brief.payload.json`
- `market-brief.config.json`
- `scripts/brief-refresh.mjs`
- `scripts/validate-brief-payload.mjs`
- `scripts/selftest.mjs`
- `market-brief.html`, `rlbrief.js`, and every other shared JavaScript file
- `notes/market-brief.md` and `.github/prompts/market-brief-update.prompt.md`
- Feature 005, Feature 006, framework-managed files, package/source-lock files, and every unrelated dirty path

The current dirty boundary is material: the prompt, runbook, and selftest are modified, and the validator is untracked. Delivery must not edit, stage, restore, clean, or normalize those paths.

## Related

- Parent finding: `specs/006-trend-dynamics-cycle-lab/report.md`, Scope 3
- Runbook: `notes/market-brief.md`
- Timer wrapper: `scripts/brief-refresh-and-push.sh`
- Tier-A producer: `scripts/brief-refresh.mjs`
- Pair validator: `scripts/validate-brief-payload.mjs`
- Repository canary: `scripts/selftest.mjs`
- Current payload/snapshot/history: `market-brief.payload.json`, `market-brief.snapshot.json`, `brief-history.jsonl`

## Active Ownership Route

```yaml
bug: BUG-002
findingId: F006-EXT-SELFTEST-MARKET-BRIEF-001
workflowMode: bugfix-fastlane
outcome: route_required
currentOwner: bubbles.bug
nextRequiredOwner: bubbles.implement
scope: SCOPE-01
implementationDispatchAllowedNow: true
entryContract:
  - Capture the exact adversarial wrapper RED in an isolated temporary Git repository before editing the wrapper.
  - Preserve the current validator assertion and never relabel the July 15 payload as July 16.
  - Change only the authorized delivery paths and stop if their just-in-time ownership baseline is not clean.
  - Restore the current published pair to the last coherent July 15 Tier-A snapshot/history bytes without changing the payload narrative.
  - Prove same-target data-only publication, rollover retention, successful paired advancement, rollback, and dirty-worktree behavior without credentials or external network access.
parentResumeGate:
  - BUG-002 is validate-certified.
  - node scripts/selftest.mjs exits 0.
  - Feature 006 Scope 3 reruns its exact blocked quality row before independent testing begins.
```
