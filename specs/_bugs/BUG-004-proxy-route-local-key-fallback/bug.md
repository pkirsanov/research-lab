# Bug: BUG-004 Proxy Route Local-Key Fallback

## Summary

`RLDATA.providerFetch` originally treated a successful proxy health probe as a
permanent transport choice for the request. If the selected provider route then
returned `503 PROVIDER_KEY_MISSING` or otherwise failed, the promise rejected
without trying the configured browser-local key for that same provider. This
contradicted the already-certified two-tier contract in
[`BUG-002-two-tier-provider-access`](../BUG-002-two-tier-provider-access/design.md),
which defines the proxy route failure as the signal that permits Tier-2 fallback.

The runtime repair is now green under the recorded current-session functional,
unit, and browser evidence. The bug remains `in_progress` because delivery
certification and its remaining governance/specialist gates are not complete.

## Severity

- [ ] Critical - System unusable, data loss
- [ ] High - Major feature broken, no workaround
- [x] Medium - Original impact: provider access failed despite a configured same-provider local key; force-local was a manual workaround
- [ ] Low - Minor issue, cosmetic

## Status

- [x] Reported
- [x] Confirmed (pre-fix failure reproduced by an executed regression)
- [x] In Progress (runtime behavior green; delivery certification pending)
- [ ] Fixed (reserved for delivery-certified closure)
- [ ] Verified
- [ ] Closed

## Reproduction Steps

1. Load `rldata.js` with a configured proxy URL and a browser-local key for
   `finnhub`.
2. Make `<proxyBaseUrl>/health` return HTTP 200 so Tier 1 is active.
3. Make `<proxyBaseUrl>/finnhub/api/v1/quote?symbol=MSFT` return HTTP 503 with
   `PROVIDER_KEY_MISSING`.
4. Make the registered direct host
   `https://finnhub.io/api/v1/quote?symbol=MSFT&token=<localKey>` return a
   structurally distinct successful response.
5. Call `providerFetch("finnhub", "api/v1/quote?symbol=MSFT")`.

This reproduction was executed by `bubbles.test` before the production edit.
The pre-fix RED and post-fix GREEN outputs remain recorded verbatim in
[report.md](report.md#bug-reproduction---before-fix) and
[report.md](report.md#bug-verification---after-fix).

## Expected Behavior

- The health probe and provider request use the proxy first.
- A failed proxy provider route falls back once to the direct HTTPS host only
  when a local key exists for the same registered provider.
- The local key appears only in the direct provider URL. It never appears in a
  proxy URL, status object, error, DOM text, or log.
- With no same-provider local key, the call rejects with a sanitized fail-closed
  error and performs no direct request.
- `setForceLocal(true)` bypasses the proxy provider route.
- Unknown-provider and prototype-shaped identifiers remain rejected before any
  transport work.

## Original Actual Behavior

Before the repair, the `rldata.js` `proxyActive()` branch returned the proxy
promise directly. Its response handler threw `Error("proxy http " + r.status)`
for a non-2xx response, and that branch had no rejection handler that could
enter the local tier. The `localKey(provider)` lookup and direct provider
request existed only in the non-proxy branch.

## Environment

- Service: Research Lab shared provider-access foundation (`rldata.js`)
- Version: current `main` worktree inspected on 2026-07-22
- Platform: browser contract; deterministic Node functional harness available
  in `tests/provider-credentials.support.mjs`

## Error Output

The report contains the executed pre-fix regression failure, the post-fix
functional GREEN, and the later independent browser replay. Current evidence
records Linux Google Chrome `150.0.7871.181`, TP-09 passing 1/1 without request
interception, and TP-12 passing 4/4 under its intercepted functional-browser
classification. Earlier missing-Chrome and dispatch-limit records remain
historical evidence, not current blockers.

## Current State

- **Runtime behavior:** Green under the latest recorded current-session
  evidence, including the focused provider matrix, TP-09, TP-12, and the broad
  build-free regression.
- **Browser runtime:** The declared Linux system-Chrome channel is available at
  `/opt/google/chrome/chrome`; the earlier environment blocker is resolved.
- **Delivery certification:** Still `in_progress`. The remaining work is owned
  by implementation, test, analyst, workflow phase, audit, and validation
  specialists as routed in `state.json`; no completion or certification claim
  is made here.

## Root Cause

The original implementation conflated proxy reachability with provider-route
availability. `probeProxy` answered whether the proxy service was reachable,
but `providerFetch` assumed that answer guaranteed every provider route could
serve the request. The direct-tier implementation was nested only under the
`proxyActive() === false` branch, so route-level proxy failures could not reach
it.

## Explicitly Out Of Scope

The following surfaces must remain byte-unchanged:

- `data/options/**` Git-backed same-origin option snapshots
- `scripts/fetch-options.mjs`
- option-tool same-origin snapshot-first fetch order
- the done artifacts under `specs/_bugs/BUG-002-two-tier-provider-access/**`

## Related

- Contract authority: [`BUG-002 spec`](../BUG-002-two-tier-provider-access/spec.md)
- Design authority: [`BUG-002 design`](../BUG-002-two-tier-provider-access/design.md)
- Affected source: `rldata.js::providerFetch`
- Existing harness: `tests/provider-credentials.functional.mjs` and
  `tests/provider-credentials.support.mjs`
