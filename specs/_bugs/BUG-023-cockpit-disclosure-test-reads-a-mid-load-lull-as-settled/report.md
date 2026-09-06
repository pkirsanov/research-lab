# Report: BUG-023 — Filing Evidence

This packet was filed by a diagnostic round. **No shipped file has been changed and no scope has
been started.** Everything below is measurement taken while diagnosing a red deploy gate.

## Summary

The cockpit disclosure test decides the page has finished loading by watching for a single
500 ms interval with no new request. The live layer it waits on fetches its ticker set in
batches, and a lull of 2001 ms was measured inside a normal load — four times the window. When
that happens the baseline is taken mid-load, and the 26 requests still to come are attributed to
a block expansion that has not occurred. They are Yahoo URLs, so the off-origin assertion fails
and a page that did nothing wrong turns the deploy gate red.

Two consecutive probe runs, same command and same machine, split on exactly this: one saw the
lull and would have failed, the other did not and passed.

## Test Evidence

### 1. The failure, in the full blocking suite

Local, `--workers=2`, exactly as `pages.yml` runs it, at commit `2ce605c2f`:

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=2 --reporter=list,json
exit: 1
lines: 1492
sha256: 1607f52250a9da2b5d910af4bcb4887bf60dfe8fda43141712697192446320f3

  1 failed
    [system-chrome] › tests/market-brief-cockpit.spec.mjs:301:1 › expanding a block from a file:// origin requires no network call, no credential and no build step
  764 passed (16.2m)
```

The reported diff was a list of Yahoo chart URLs — `MU`, `MRVL`, `ADI` and others — against an
expected `[]`:

```
      343 |   const novel = requests.slice(before).filter((url) => !new Set(requests.slice(0, before)).has(url));
      344 |   const offOrigin = novel.filter((url) => !url.startsWith('file://'));
    > 345 |   expect(offOrigin, 'expanding a block must issue no off-origin request').toEqual([]);
```

### 2. The same test in isolation

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=1 tests/market-brief-cockpit.spec.mjs -g "expanding a block from a file"

  ✓  1 … origin requires no network call, no credential and no build step (1.9s)
  1 passed (2.7s)
ATTEMPT1_EXIT=0
```

### 3. The mechanism

A probe replaying the test's quiescence loop verbatim against the real page, then continuing to
watch for 45 s. Source:

```js
// replays tests/market-brief-cockpit.spec.mjs:316-322 verbatim, then keeps watching
let quiescing = -1;
for (let attempt = 0; attempt < 40 && quiescing !== seen.length; attempt++) {
  quiescing = seen.length;
  await page.waitForTimeout(500);
}
const settleCount = seen.length;
await page.waitForTimeout(EXTRA_WATCH_MS);
const after = seen.slice(settleCount);
const offOriginAfter = after.filter((r) => !r.url.startsWith('file://'));
```

Observed, two consecutive runs at commit `99b927fc7`:

```
=== run 1 ===
  blocks attached at         : 168 ms
  heuristic declared settled  : 1173 ms   with 30 requests seen
  requests after +45s watch  : 56 ( 26 arrived AFTER the declared settle )
  OFF-ORIGIN after settle    : 26   <-- these get billed to the expansion
  inter-request gaps > 500ms : 1 of 55  (max gap 2001 ms)
  first few billed off-origin requests:
    +2371ms  https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=5y&interval=1d&includeAdjustedClose=true
    +2372ms  https://query1.finance.yahoo.com/v8/finance/chart/QQQ?range=5y&interval=1d&includeAdjustedClose=true
    +2372ms  https://query1.finance.yahoo.com/v8/finance/chart/RSP?range=5y&interval=1d&includeAdjustedClose=true
    +2372ms  https://query1.finance.yahoo.com/v8/finance/chart/XLK?range=5y&interval=1d&includeAdjustedClose=true
    +2372ms  https://query1.finance.yahoo.com/v8/finance/chart/XLV?range=5y&interval=1d&includeAdjustedClose=true

=== run 2 ===
  blocks attached at         : 120 ms
  heuristic declared settled  : 1623 ms   with 56 requests seen
  requests after +45s watch  : 56 ( 0 arrived AFTER the declared settle )
  OFF-ORIGIN after settle    : 0   <-- these get billed to the expansion
  inter-request gaps > 500ms : 1 of 55  (max gap 710 ms)
```

Run 1 is the failure reproduced without any worker contention: a 2001 ms lull — four times the
500 ms window — ended the wait at 30 of 56 requests, and the remaining 26 were attributed to an
expansion that had not yet occurred.

Run 2 saw no lull wide enough and counted all 56 before settling.

### 4. CI

The same suite passed in the pages workflow at `0a645b583` (run `33046199500`, `verify` green,
`deploy` succeeded) and again at `99b927fc7`. The defect was not observed on a CI runner; its
incidence there is unmeasured.

## What This Evidence Does Not Establish

- The cause of the lull. Width and existence were measured; attribution was not attempted.
- A failure rate. One suite failure, one probe reproduction in two runs.
- Whether any other assertion in this spec shares the coupling. Not audited.
- Any fix. None was written.

## Reproduction Command

The probe was run from a clean detached worktree at `origin/main` with the source-locked runner
installed, against the repository's own `market-brief.html`. It is not committed; the source
above is complete and self-contained.

## Completion Statement

Nothing was delivered. This packet is a filing. The defect is reproduced, its mechanism is
measured rather than hypothesised, and the invariant the test guards is recorded as correct so a
later round does not mistake the flake for a reason to delete it.

The remedy is blocked on the owner decision recorded as the open question in `design.md`: the
three candidate directions each give something up, and the choice determines Scope 2's
assertions. No fix was written, no shipped file was touched, and every Definition of Done item
in `scopes.md` is unticked.
