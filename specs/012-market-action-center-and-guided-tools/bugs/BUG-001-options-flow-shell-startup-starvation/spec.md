# Spec: BUG-001 Options-Flow Shell Startup Starvation

Links: [bug.md](bug.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Outcome Contract

- **Intent:** Preserve cache-first options behavior while guaranteeing that the
  mandatory shared experience shell becomes ready before heavy option delta
  hydration can monopolize the browser main thread.
- **Success Signal:** The unchanged all-23 shell command passes, and an
  adversarial real-browser regression proves the first
  `data/options/<ticker>.json` delta request starts only after
  `#rlviews[data-rlexperience-shell="ready"]` exists on
  `options-flow-feed-lab`.
- **Hard Constraints:** No timeout increase, route exclusion, page-ID branch in
  shared code, disabled contextual decoration, row truncation, manual fetch
  control, new option producer, changed provider/data owner, or changed
  snapshot/Yahoo fallback order.
- **Failure Condition:** Option hydration begins before shell readiness, the
  existing 10-second shell canary still fails, any other registered route
  regresses, or the fix changes source/provider/option ownership.

## Requirements

- **FR-B001-01 Prompt shell.** Every registered page must expose its shared
  shell before heavy delta hydration begins.
- **FR-B001-02 Cache-first preservation.** `options-flow-feed-lab` must still
  load state, wire controls, rebuild cached rows, and render its cache-first
  view immediately. Only the delta-hydration phase is sequenced.
- **FR-B001-03 Shared readiness contract.** Startup sequencing must consume a
  generic shared shell-ready signal or marker. It must not add an
  `options-flow-feed-lab` branch to `rlapp.js`, `rlviews.js`, or
  `rlexperience.js`.
- **FR-B001-04 Single start.** The six-worker hydration loop must start at most
  once after initial shell readiness. Later `rlviews:change` events must not
  restart it.
- **FR-B001-05 No timing workaround.** The 10,000 ms canary timeout must remain
  unchanged. Sleeping, polling with a larger deadline, or accepting eventual
  readiness is not a fix.
- **FR-B001-06 Context preservation.** RLG, RLTKR, RLCTX, ticker links, and
  contextual controls must remain enabled. The fix must sequence contention,
  not suppress required decoration.
- **FR-B001-07 Source ownership preservation.** `ensureChain`, same-origin
  `data/options/<ticker>.json` first, existing conditional Yahoo/proxy fallback,
  `scripts/fetch-options.mjs`, and `data/options/**` ownership must remain
  unchanged.
- **FR-B001-08 Complete route regression.** All 23 registered shell canaries,
  the existing shell E2E/mobile suite, and the broad Research Lab selftest must
  pass after repair.
- **FR-B001-09 Boundary preservation.** Feature 012 parent scope/status and
  certification artifacts must not be changed by this child bug repair.

## Scenarios

### SCN-BUG001-001 - Shell precedes heavy option hydration

```gherkin
Scenario: SCN-BUG001-001 Options-flow opens with a cold page and current same-origin snapshots
  Given the page is registered in Feature 012
  And the shared shell is mounting asynchronously
  And the option owner has twelve same-origin snapshots available
  When the page performs its automatic cache-first startup
  Then the shared four-view shell becomes ready before the first delta snapshot request starts
  And the existing ten-second shell canary passes without a larger timeout
  And option hydration starts once after shell readiness
```

### SCN-BUG001-002 - Context and option ownership remain intact

```gherkin
Scenario: SCN-BUG001-002 Heavy option rows render after shell readiness
  Given option hydration has started through the existing owner path
  When option rows and ticker context controls are rendered
  Then RLTKR and RLCTX continue to decorate the rendered tickers
  And same-origin snapshots remain first in the existing chain
  And no new producer, provider path, storage owner, row truncation, or manual fetch gate exists
```

### SCN-BUG001-003 - Every registered route still mounts one shell

```gherkin
Scenario: SCN-BUG001-003 The complete registered shell canary runs after repair
  Given tools.json contains the current twenty-three routes
  When the unchanged all-route shell command executes
  Then every route reports exactly one ready shell and four expected panels
  And options-flow-feed-lab is no longer the missing success record
  And zero route is skipped or granted a page-specific test exemption
```

## Acceptance Criteria

1. The pre-fix adversarial test fails because the first option delta request
   observes no ready shell, not because Chrome, the server, or a selector is
   unavailable.
2. The same test passes after the smallest startup-sequencing change.
3. `node --test tests/tool-experience-shell.functional.mjs` changes from the
   exact current single failure to three passing tests with zero skips.
4. The focused E2E retains the existing 10-second shell deadline and uses no
   request interception or service worker.
5. Option hydration still reaches current same-origin snapshots and the page
   still renders contextual ticker controls after readiness.
6. A changed-path check proves no change to `rldata.js`,
   `scripts/fetch-options.mjs`, or `data/options/**`.
7. Feature 012 parent scope/status/certification files remain byte-unchanged.

## Non-Goals

- Increasing test or product startup timeouts.
- Excluding `options-flow-feed-lab` from the 23-route canary.
- Disabling RLG, RLTKR, RLCTX, MutationObserver, or ticker context controls.
- Paginating, truncating, or redesigning the Power table in this repair.
- Changing worker count, option universe, cache schema, option snapshot shape,
  provider order, or source ownership.
- Editing Scope 04 production/tests or Feature 012 parent coordination state.