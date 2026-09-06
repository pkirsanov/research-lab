# BUG-023: The Cockpit Disclosure Test Calls A Mid-Load Lull "Settled", So A Passing Page Fails On Network Weather

- **Status:** Confirmed — mechanism measured, fix not written
- **Severity:** High — sits in the deploy gate, so a false red withholds a correctly-published brief from readers
- **Surface:** [`tests/market-brief-cockpit.spec.mjs:301`](../../../tests/market-brief-cockpit.spec.mjs) — `expanding a block from a file:// origin requires no network call, no credential and no build step`
- **Filed at commit:** `99b927fc7`
- **Measured at commit:** `2ce605c2f` (failure) and `99b927fc7` (mechanism probe)

## What The Test Is Right About

Recorded first, because the invariant is worth keeping and the fix must not weaken it.

The test guards a real product promise: the cockpit opens from a bare checkout with no server,
no key and no build step, so **expanding a block must not put an off-origin or credentialed
request on the wire**. Its own comment already reasons carefully about why the invariant is
ORIGIN and not COUNT — one block defers its artifact fetch until opened, and asserting zero
requests would punish that disclosure-first design. That reasoning is correct and is not what
this bug disputes.

## Summary

The test measures disclosure cost as "every request after the page settles". It decides the page
has settled by watching for **one 500 ms window with no new request**:

```js
let quiescing = -1;
for (let attempt = 0; attempt < 40 && quiescing !== requests.length; attempt++) {
  quiescing = requests.length;
  await page.waitForTimeout(500);
}
```

The live layer it is waiting on fetches a large ticker set through bounded concurrency. Its
request stream is **bursty, not continuous**: batches are separated by lulls that routinely
exceed 500 ms. A lull is indistinguishable from completion under this rule, so the loop can
declare "settled" in the middle of the load. Every request in the remaining batches is then
attributed to the expansion, they are Yahoo URLs, and the off-origin assertion fails.

The page did nothing wrong. Nothing was expanded when those requests were issued.

## Reproduction

A probe replaying the heuristic verbatim against the real page, then continuing to watch:

| Run | Heuristic declared settled | Requests at that point | Arrived after | Off-origin after | Max inter-request gap |
| --- | --- | --- | --- | --- | --- |
| 1 | 1173 ms | 30 | **26** | **26** | **2001 ms** |
| 2 | 1623 ms | 56 | 0 | 0 | 710 ms |

Same command, same machine, minutes apart. Run 1 is the failure: a **2001 ms** lull — four times
the 500 ms window — split the load, and the 26 requests that followed were billed to the
expansion. The first of them arrived at +2371 ms:

```
+2371ms  https://query1.finance.yahoo.com/v8/finance/chart/SPY?range=5y&interval=1d&includeAdjustedClose=true
+2372ms  https://query1.finance.yahoo.com/v8/finance/chart/QQQ?range=5y&interval=1d&includeAdjustedClose=true
+2372ms  https://query1.finance.yahoo.com/v8/finance/chart/RSP?range=5y&interval=1d&includeAdjustedClose=true
```

Run 2 saw no lull wide enough, counted all 56 requests before settling, and would have passed.

The probe source and the full observed run are in `report.md`.

## Expected vs Actual

**Expected.** A page that issues no off-origin request *as a result of expanding a block* passes,
whatever the network did while it was loading.

**Actual.** The verdict depends on whether a lull longer than 500 ms happens to fall inside the
live layer's load. It is a coin flip on network weather.

## The Cost Is Not Local Inconvenience

This test is in the blocking browser suite, and `pages.yml` wires `deploy: needs: verify`. A
false red therefore does not merely annoy a developer — it **withholds a correctly generated
brief from the live site**. On 2026-08-27 the full suite recorded `764 passed, 1 failed` with
this as the only failure.

That is the same shape as the two defects fixed earlier the same day: a green product held back
by a test measuring something other than what it names.

## Root Cause

A single quiet interval is being used as a proxy for "the load has finished". The two are not
the same for a bursty, bounded-concurrency loader. The heuristic has no notion of whether work
is still outstanding — only whether anything happened in the last 500 ms.

The 40-attempt cap is not the problem and does not fire here: the loop exits early, satisfied,
and its own `expect(requests.length).toBe(quiescing)` guard passes because by then the stream
really is momentarily quiet.

## What Was Not Established

Stated plainly so it is not read as more than it is.

- **The lull's cause was not identified.** A 2001 ms gap is consistent with bounded-concurrency
  batching, provider throttling, connection reuse, or local contention. No attribution was made;
  only its existence and width were measured.
- **The rate is not characterised.** One failure in one full-suite run, one reproduction in two
  probe runs. That is not a frequency.
- **CI was not observed failing this test.** It passed at `0a645b583` and again at `99b927fc7`.
  Whether a CI runner's network produces lulls this wide is unknown; the mechanism is not
  machine-specific, but its incidence there is unmeasured.
- **No fix was written or evaluated.** `design.md` records candidate directions only.
- **The other cockpit assertions were not audited** for the same coupling.

## Impact

- A correctly published brief can be withheld from readers by network timing alone.
- A developer who reruns and sees green learns to distrust the suite rather than the page, which
  is the expensive consequence.
- Any future work on the cockpit inherits an intermittent red that has nothing to do with it.

## Related

- `specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos` — also an intermittent
  false failure in the same suite, but a different mechanism (worker teardown, not request
  accounting). The two must not be conflated.
