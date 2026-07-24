# Bug: BUG-001 Options-Flow Shell Startup Starvation

Links: [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Summary

The Feature 012 all-23 shell canary deterministically times out only for
`options-flow-feed-lab`. The page does not expose
`#rlviews[data-rlexperience-shell="ready"]` within the existing 10-second
contract, while the other 22 registered routes pass on the same current bytes.

The controlling path is startup ordering, not an option-source failure. The
page starts six recursive same-origin option-snapshot workers from its inline
`DOMContentLoaded` boot while the shared shell is still completing asynchronous
registry, configuration, dependency-state, and script loading. Snapshot
completion repeatedly builds a 12,055-row table and decorates 12,093 ticker
context controls. Those synchronous render/decorator tasks postpone execution
of the already-downloaded shell script until after the canary deadline.

## Severity

- [ ] Critical - System unusable, data loss
- [ ] High - Major feature broken, no workaround
- [x] Medium - One registered route violates the required startup contract and blocks the cross-route regression gate; the shell eventually appears and no data loss is observed
- [ ] Low - Minor issue, cosmetic

## Status

- [x] Reported
- [x] Confirmed (reproduced twice in this session)
- [x] In Progress (diagnosed and routed; no repair attempted)
- [ ] Fixed
- [ ] Verified
- [ ] Closed

## Reproduction Steps

1. Start from the Research Lab repository root on the current working-tree
   bytes identified in [report.md](report.md#current-byte-provenance).
2. Run `node --test tests/tool-experience-shell.functional.mjs`.
3. Observe success records for 22 registered routes and no success record for
   `options-flow-feed-lab`.
4. Observe the final failure naming
   `options-flow-feed-lab: page.waitForSelector: Timeout 10000ms exceeded` for
   `#rlviews[data-rlexperience-shell="ready"]`.
5. Run the same test alone with the exact `--test-name-pattern` command recorded
   in [report.md](report.md#standalone-reproduction).
6. Observe the same single-route timeout.

## Expected Behavior

- Every registered page exposes the shared shell promptly.
- Cache-first owner content may paint immediately.
- Heavy option delta hydration starts only after shared shell readiness, so it
  cannot starve shell registration.
- The existing 10-second canary remains unchanged.
- `scripts/fetch-options.mjs`, `data/options/<ticker>.json`, same-origin
  snapshot-first loading, Yahoo fallback order, provider ownership, and
  contextual decoration semantics remain unchanged.

## Actual Behavior

- Shared shell resources are requested and returned early, but the shell-ready
  attribute is not set until approximately 13.4 seconds in the measured
  baseline.
- Six option workers complete 12 snapshot loads and produce 12,055 table rows
  plus 12,093 ticker context controls before the shell build gets main-thread
  time.
- Holding only option hydration moves shell readiness to approximately 147 ms.
- Suppressing only repeated ticker scans moves it to approximately 5.8 seconds;
  suppressing repeated decorator observers as well moves it to approximately
  1.77 seconds. These are diagnostics, not proposed production behavior.

## Environment

- Repository: Research Lab
- Commit anchor: `6655b72a958d0710e0e00b8a5975e206c612f06d`
- Platform: Linux, repository-declared System Chrome
- Affected page SHA-256: `06685929ddb59f43404c83044f67cd414aa19f1cc295932df757eeca25daa13c`
- Shell test SHA-256: `d8be707b2d3bf251c6192a481fee4361122ac87f4687a52529f8df61a3e88db1`
- Discovery timestamp: `2026-07-24T01:12:51Z`

## Error Output

```text
✖ SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected

  + [
  +   'options-flow-feed-lab: page.waitForSelector: Timeout 10000ms exceeded.\n' +
  +     'Call log:\n' +
  +     `  - waiting for locator('#rlviews[data-rlexperience-shell="ready"]') to be visible\n`
  + ]
  - []
```

## Root Cause

The root cause is a missing startup dependency between mandatory shared-shell
registration and optional heavy delta hydration on
`options-flow-feed-lab.html`:

1. `rlapp.js::boot` starts `mountExperienceShell()`, but shell readiness is
   asynchronous.
2. The page's inline `DOMContentLoaded` callback runs `rebuild(); render();`
   and immediately calls `fetchDelta()`.
3. `fetchDelta()` starts six recursive workers over 12 same-origin snapshots.
4. Each completion schedules a full `rebuild()` and `render()`; `renderTable()`
   emits every active strike and `render()` calls `RLTKR.scan(document)`.
5. Scope 03's RLTKR/RLCTX composition makes each rendered ticker carry and bind
   a separate context control. Mutation observers add further full-document
   decoration passes.
6. Browser timing proves shell network resources are already available; long
   main-thread render/decorator tasks delay `rlviews.js::build()` and its
   `data-rlexperience-shell="ready"` write past 10 seconds.

Scope 03 did not create the unbounded page render or six-worker boot order. Its
required contextual-control work made the latent ordering defect deterministic.
Scope 04 did not cause the defect; its validation exposed this cross-scope
regression through the unchanged Scope 02 canary.

## Scope Boundary

This discovery invocation created only this child bug packet. It did not edit:

- production source or tests;
- Feature 012 parent scopes, reports, state, status, or certification;
- Scope 04 implementation/evidence files;
- option snapshots, their producer, provider/data ownership, or source order;
- framework-managed files.

## Routing Disposition

The immediate required owner is `bubbles.design` to adopt or amend the grounded
root-cause analysis and minimal sequencing design. The declared
`bugfix-fastlane` route is then `bubbles.plan` for final scope ownership,
`bubbles.test` for the persistent pre-fix adversarial RED, and only then
`bubbles.implement` for source repair.

## Related

- Parent feature: `specs/012-market-action-center-and-guided-tools/`
- Historical passing shell evidence:
  `../../scopes/02-shared-four-view-shell/report.md#tp-02-02`
- Context-provider change evidence:
  `../../scopes/03-contextual-tooltip-foundation/report.md`
- Existing shell canary: `tests/tool-experience-shell.functional.mjs`
- Affected page: `options-flow-feed-lab.html`
- Shared paths: `rlapp.js`, `rlviews.js`, `rlticker.js`, `rlcontext.js`