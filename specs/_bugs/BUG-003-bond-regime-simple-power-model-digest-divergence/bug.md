# Bug: BUG-003 Bond Regime Simple/Power Model-Digest Divergence

Links: [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Summary

The Bond Regime page can expose its initial cached model as Ready while the automatic Treasury hydration is still replacing that model. The protected Simple/Power test can therefore capture Simple digest `8a020d8b`, allow the shared view model to advance, and then read Power digest `40108ba6` even though both renderers use the same computation and mode switching itself does not recompute.

## Severity

- [ ] Critical - Destructive compromise or data loss is demonstrated
- [ ] High - The complete product is unusable with no bounded recovery
- [x] Medium - A protected Feature 003 contract is timing-sensitive and blocks independent acceptance of BUG-002 and Feature 006 Scope 3
- [ ] Low - Minor or cosmetic issue

## Status

- [ ] Reported
- [x] Confirmed by independent failure evidence and current-session timing-path reproduction
- [x] In Progress
- [ ] Fixed
- [ ] Verified
- [ ] Closed

No Bond Regime production byte, test byte, Feature 003 artifact, Feature 006 artifact, BUG-002 artifact, Market Brief surface, shared JavaScript file, registry, or package-graph file was changed while creating this packet. Implementation and certification are not claimed.

## Discovery And Traceability

| Field | Value |
| --- | --- |
| Parent runner | `bubbles.goal`, `executionModel: direct-authorized-runner` |
| Workflow mode | `bugfix-fastlane` |
| Parent delivery | `specs/006-trend-dynamics-cycle-lab`, Scope 3 |
| Blocking verifier | `specs/_bugs/BUG-002-market-brief-session-date-drift`, SCOPE-01 independent test |
| Owning feature | `specs/003-bond-regime-and-scenario-lab` |
| Protected scenario | `SCN-003-011` |
| Protected test | `tests/bond-regime-lab.spec.mjs` - `BS-011 Simple and Power share one model digest` |
| Independent observation | Complete system Chrome: 72 passed, 1 failed; isolated replay: 0 passed, 1 failed |
| Independent mismatch | Simple `8a020d8b`; Power `40108ba6` |
| Current packet replay | Two exact isolated replays and one complete Bond file replay passed, proving scheduling sensitivity rather than absence of the defect |

## Reproduction Steps

1. From the Research Lab repository root, keep current production and test bytes unchanged.
2. Run `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/bond-regime-lab.spec.mjs --grep "BS-011 Simple and Power share one model digest" --reporter=list`.
3. Under the independently observed timing, the test reads Simple digest `8a020d8b`, clicks Power, reads `40108ba6`, and fails equality.
4. When the exact command lands after hydration has settled, it passes with both modes at `40108ba6`; this timing-dependent pass does not invalidate the protected failure.
5. Observe the boot lifecycle with the same cache and Treasury fixtures. `decisionGrid` changes from `8a020d8b` to `40108ba6` through the same `runtime.viewModel` while `appStatus` says Ready during `refresh.active=true`.
6. Confirm that `setMode("power")` performs only visibility, persistence, and `renderPower()` composition. It neither calls `recompute()` nor replaces `runtime.viewModel`.

## Expected Behavior

- A Ready Bond Regime page represents one settled observed snapshot and one current `BondLabViewModel`.
- The existing protected BS-011 test title and assertions remain unchanged.
- Reading Simple, switching mode, and reading Power without initiating Refresh returns one identical decision digest and preserves assumptions with zero mode-switch requests.
- Cached first paint remains meaningful, but its status stays Refreshing until automatic hydration settles.
- Mode switching remains composition-only; no Simple-specific or Power-specific model computation is introduced.

## Actual Behavior

- `boot()` renders cached state as Ready and schedules `hydrate(false)` with a zero-delay timer.
- `hydrate()` marks refresh active, but its cached and final `recompute()` calls invoke `render()`, which unconditionally writes Ready before `runtime.refresh.promise` has completed.
- The protected helper waits only for Ready, so it can return during the unstable lifecycle.
- A Simple digest captured before the final automatic hydration can be compared with a Power digest rendered from the later shared view model.
- The DOM is not stuck: the Simple node advances to `40108ba6`. The stale value is the already-captured test/user observation, not a duplicate DOM assignment.

## Root Cause

The root cause is an asynchronous readiness/rerender race in the production boot lifecycle. The page exposes Ready at more than one pre-settlement point, while automatic hydration replaces `runtime.viewModel` through the one legitimate compute path. The two observed digests are successive snapshots from that same path. There is no mode-specific second calculator, duplicate digest source, or mode-triggered view-model mutation.

## Change Boundary

### Authorized For The Delivery Owner

- `bond-regime-lab.html` - only the boot/hydration status lifecycle needed to make Ready mean settled
- `tests/bond-regime-lab.spec.mjs` - preserve the exact BS-011 test and add only the deterministic external-Treasury-boundary adversarial regression if needed for scenario-first RED
- `specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/**` - implementation/test evidence and bug-owned state only

### Protected Read-Only Inputs

- `specs/003-bond-regime-and-scenario-lab/**`, including SCN-003-011, spec, design, scopes, state, report, scenario manifest, and test plan
- `specs/006-trend-dynamics-cycle-lab/**`
- `specs/_bugs/BUG-002-market-brief-session-date-drift/**`
- BUG-002 production, data, and tests, including Market Brief payload/snapshot/history, wrapper, validator, page, renderer, and BUG-002 regression files
- Every Market Brief surface and every shared JavaScript file
- Tool registries and navigation registries
- `package.json`, lock/source files, dependency graph, and Playwright configuration
- `specs/005-palm-springs-rental-market-lab/**`
- Framework-managed files and every unrelated dirty or concurrent path

The current production and test anchors are untracked shared-worktree bytes. Delivery must capture a just-in-time hash/status baseline and stop rather than overwrite a changed anchor.

## Related

- Feature contract: `specs/003-bond-regime-and-scenario-lab/spec.md`, BS-011 and FR-041/FR-042
- Feature design: `specs/003-bond-regime-and-scenario-lab/design.md`, one `BondLabViewModel` for both compositions
- Feature manifest: `specs/003-bond-regime-and-scenario-lab/scenario-manifest.json`, SCN-003-011
- Production: `bond-regime-lab.html::stableDecisionDigest`, `computeBondLabViewModel`, `render`, `renderPower`, `hydrate`, `setMode`, and `boot`
- Protected regression: `tests/bond-regime-lab.spec.mjs` - `BS-011 Simple and Power share one model digest`
- Blocking acceptance: `specs/_bugs/BUG-002-market-brief-session-date-drift`, SCOPE-01 independent test
- Parent resume: `specs/006-trend-dynamics-cycle-lab`, Scope 3

## Active Ownership Route

```yaml
bug: BUG-003
findingId: BUG003-ASYNC-READY-RACE
workflowMode: bugfix-fastlane
outcome: route_required
currentOwner: bubbles.bug
nextRequiredOwner: bubbles.implement
scope: SCOPE-01
implementationDispatchAllowedNow: true
entryContract:
  - Capture just-in-time hashes and status for both authorized existing files.
  - Add the deterministic external-boundary adversarial regression first and record RED before production editing.
  - Preserve SCN-003-011 and the exact BS-011 title and assertions.
  - Repair only the production Ready/refresh lifecycle; keep mode switching composition-only.
  - Change no excluded surface and stop on concurrent anchor drift.
resumeChain:
  - Repair and adversarial GREEN.
  - Exact BS-011 GREEN.
  - Complete Bond Regime file GREEN.
  - Complete system-Chrome inventory GREEN.
  - Return BUG-002 SCOPE-01 to bubbles.test.
  - Validate and audit BUG-002.
  - Replay parent Feature 006 Scope 3 after the certified chain.
```
