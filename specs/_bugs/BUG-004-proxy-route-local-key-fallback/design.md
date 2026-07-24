# Bug Fix Design: BUG-004 Proxy Route Local-Key Fallback

Links: [bug.md](bug.md) | [spec.md](spec.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Design Brief

### Current State

`rldata.js` already owns the frozen provider registry, browser-local provider
configuration, proxy health probe, force-local control, masked status surfaces,
and the public `providerFetch(provider, urlOrPath)` transport entrypoint. The
completed BUG-002 design makes the tailnet proxy Tier 1 and a local key for the
same registered provider Tier 2.

`providerFetch` validates the provider and probes `/health`, but a reachable
proxy creates a terminal branch: a provider-route HTTP, transport, timeout, or
JSON failure rejects without reaching the existing direct-key code. The
external `fetch` injection in `tests/provider-credentials.support.mjs::loadRldata`
can distinguish health, proxy-route, and registered direct-host requests.

### Target State

Model provider transport as an ordered attempt policy. Unless force-local is
active, a reachable proxy remains first. If that same provider's proxy route
fails, make at most one direct attempt using a local key for the same frozen
registry entry; never select or inspect another provider as a fallback.

The controlling discriminator is health HTTP 200 followed by the Finnhub proxy
route returning HTTP 503 `PROVIDER_KEY_MISSING`, followed by the registered
Finnhub host returning a structurally distinct success response. The local key
is permitted only in that direct-host request.

### Patterns To Follow

- `rldata.js::providerSpec` own-property validation remains the first boundary.
- `PROVIDERS` remains the only host and key-parameter authority.
- `providerRequestPath` remains the only full-URL-to-provider-path normalizer.
- `fetchT` remains the timeout-bearing external transport primitive.
- `providerStatus` and `providerAccess` remain masked, frozen status surfaces.
- BUG-002 remains the certified two-tier capability authority.

### Patterns To Avoid

- Do not add a second registry, provider chooser, retry loop, or cross-provider
  failover path.
- Do not call `localKey(provider)`, select a provider-key value, or append a key
  while constructing the proxy request.
- Do not mark the whole proxy unhealthy because one provider route failed.
- Do not propagate caught request URLs, response bodies, or raw transport
  errors into caller-visible errors or logs.
- Do not route option snapshots or option-tool fetches through `providerFetch`.

### Resolved Decisions

- Adopt the grounded root-cause diagnosis and one-helper repair.
- Preserve the FR-2 failure set: non-2xx, transport rejection, timeout, and JSON
  decode failure all permit one same-provider direct attempt when its local key
  exists.
- Preserve proxy-first order and force-local's proxy-provider-route bypass.
- Keep proxy health, provider status, storage shape, and public API signatures
  unchanged.
- Keep all option snapshot and completed BUG-002 surfaces unchanged.

### Open Questions

None are design-blocking. Planning must add exact coverage for every FR-2
failure class and resolve scenario-specific E2E applicability without relabeling
an intercepted external provider as live transport.

## Purpose And Scope

This design repairs the shared provider-access foundation only. The production
change boundary is `rldata.js::providerFetch` plus one private direct-tier
helper in the same IIFE. Test planning may use the existing provider credential
suites and their external-fetch harness, but this design introduces no new
dependency, provider, public method, UI control, storage key, or data format.

The following are protected collateral boundaries:

- `data/options/**` remains the Git-backed same-origin snapshot dataset.
- `scripts/fetch-options.mjs` remains the independent snapshot producer.
- `options-structure-lab.html::fetchChainPages` remains same-origin snapshot
  first, with its existing conditional live fallback.
- `options-flow-feed-lab.html::ensureChain` remains local cache, then
  same-origin snapshot, then its existing live Yahoo fallback.
- `specs/_bugs/BUG-002-two-tier-provider-access/**` remains byte-unchanged.
- `rldata.js::proxied` Yahoo behavior remains outside this repair.

## Root Cause Analysis

### Investigation Summary

The certified BUG-002 design defines two distinct availability facts:

1. `<proxyBaseUrl>/health` establishes that the proxy process is reachable.
2. A provider route can still fail, including the explicit HTTP 503
   `PROVIDER_KEY_MISSING` response intended to permit Tier-2 use.

Current `rldata.js::providerFetch` handles only the first fact. After
`probeProxy(false)` resolves, the active-proxy branch returns the proxy promise
directly. A non-2xx response throws, a rejected or timed-out `fetchT` rejects,
and a failed `r.json()` rejects. None of those failures can enter the local-key
branch because key lookup and direct URL construction exist only under
`proxyActive() === false`.

### Root Cause

Tier selection is implemented as a mutually exclusive choice at request start
instead of an ordered attempt policy. Proxy health is incorrectly treated as a
guarantee that every provider route can complete and decode its response.

### Impact

- Every registered keyed provider is affected by the same branch structure.
- Users can have both a healthy proxy and a valid same-provider local key yet
  receive a rejected request.
- No persisted data is corrupted; the defect is failed acquisition.
- A careless repair could disclose the local key to the proxy or diagnostics,
  so transport ordering and error sanitization are part of correctness.

## Architecture Overview

```text
providerFetch(provider, urlOrPath)
  -> providerSpec(provider) own-property validation
  -> providerRequestPath(validatedSpec, urlOrPath)
  -> probeProxy(false)
     -> proxy inactive OR force-local
        -> directProviderFetch(validatedSpec, provider, pathQuery)
     -> proxy active
        -> keyless proxy provider-route attempt
           -> success + JSON decode success: return proxy payload
           -> route failure: directProviderFetch(same spec, same provider, same path)
              -> no same-provider key: PROVIDER_KEY_MISSING:<provider>
              -> direct success: return direct payload
              -> direct failure: sanitized provider-scoped rejection
```

`directProviderFetch(spec, provider, pathQuery)` is private and is the sole
owner of local-key lookup, direct URL construction, direct `fetchT`, JSON
decode, and direct error sanitization. The caller passes the already-validated
registry object; the helper cannot resolve a replacement provider.

There is one proxy provider-route attempt and at most one direct attempt per
`providerFetch` call. A route failure does not mutate `_proxyReachable` or
`_proxyCheckedAt`, because it proves nothing about other providers or the next
request within the health-cache window.

## Capability Foundation

BUG-004 repairs the existing BUG-002 provider-access capability rather than
adding another transport owner. `rldata.js` remains the single foundation for
provider identity validation, tier selection, provider status, key ownership,
request-path normalization, and transport dispatch.

The repair adds one private foundation helper because three existing entry
conditions need identical direct behavior: proxy unreachable, force-local, and
proxy provider-route failure. No tool page may reproduce that policy.

## Concrete Implementations

- **Tier-1 proxy transport:** keyless browser request to
  `<proxyBaseUrl>/<provider>/<pathQuery>` after a successful health probe.
- **Tier-2 local transport:** direct HTTPS request to the same provider's
  registry host with that provider's registry key parameter.
- **Provider registry entries:** `twelvedata`, `finnhub`, `alphavantage`, and
  `fred`; each remains a frozen `{ host, keyParam }` adapter definition.

### Variation Axes

- **Provider identity:** exactly one own property of `PROVIDERS`; host and key
  parameter vary only through that validated registry entry.
- **Transport entry condition:** proxy unreachable, force-local, or a failed
  proxy provider route; all direct conditions converge on one helper.
- **Proxy route outcome:** parsed success terminates the request; HTTP,
  transport, timeout, or decode failure permits one same-provider direct
  attempt when its key exists.

## Data Model And Storage

There is no data-model or migration change. `localStorage.rlProviderConfig`
retains `{ v, proxyBaseUrl, keys }`; no key is copied into `rlData`, option
snapshots, tool reads, status state, session storage, or a new cache.

The direct helper is the only path that calls `localKey(provider)`, and it does
so only when the ordered policy reaches Tier 2. `proxyBaseUrl()` still parses
the existing combined config record, but the proxy path never selects, copies,
encodes, or attaches a provider-key value to request state.

## API And Error Contracts

### Public Contract

`providerFetch(provider, urlOrPath) -> Promise<parsed JSON>` keeps its existing
signature. `urlOrPath` may be the registered provider's full HTTPS URL or a
relative provider path. `providerRequestPath` strips only the validated
provider host; it does not authorize arbitrary hosts.

### Ordered Transport Contract

1. Reject unknown and prototype-shaped providers before config or transport
   access.
2. Preserve the existing `no fetch` failure before probing.
3. Probe proxy health using the existing cache and timeout.
4. When `proxyActive()` is true, dispatch the keyless proxy route first.
5. Treat a proxy non-2xx response, transport rejection, timeout rejection, or
   JSON decode rejection as a failed provider-route attempt.
6. Continue once to `directProviderFetch` using the same validated provider.
7. Return the first successfully parsed payload; perform no further retry.

### Sanitized Error Model

- Missing same-provider local key:
  `PROVIDER_KEY_MISSING:<provider>`.
- Direct HTTP, transport, timeout, or decode failure:
  `PROVIDER_REQUEST_FAILED:<provider>`.
- Unknown-provider behavior preserves the existing `unknown provider`
  semantics required by SCN-BUG004-004.

Caught error messages, proxy response bodies, and request URLs are never
concatenated into a surfaced error. An explicit proxy HTTP 503 body such as
`{ "code": "PROVIDER_KEY_MISSING" }` is therefore an input discriminator,
not a value echoed to the caller.

## Security And Privacy

- The local key may appear only in the direct HTTPS URL for its owning
  registered provider.
- Health and proxy provider-route URLs, headers, options, and bodies carry no
  browser-local key.
- Status/access objects remain frozen masked projections and never gain an
  error-detail or URL field.
- No source path logs either request URL or a raw caught error.
- Tests must compare parsed URL components or booleans and must not print the
  sentinel key in terminal output.
- A missing key causes no direct network call.
- Provider validation occurs before `loadProviderConfig`, preserving the
  current prototype-pollution and inert-unknown-provider boundary.

## UI And User-Visible Behavior

No DOM, settings editor, status wording, or tool layout changes. Force-local
continues to make `proxyActive()` false; it bypasses the proxy provider route
and uses the shared direct helper. The existing health probe may still run as
part of `providerFetch`, but its result cannot override force-local for the
provider request.

A successful fallback is transparent to tool callers and returns the direct
provider's parsed payload. A failed fallback exposes only the sanitized error
contract above; no URL or key reaches DOM text through the shared layer.

## Configuration, Migration, And Rollout

No configuration key, registry entry, dependency, build step, or migration is
introduced. The change is an atomic browser-source repair: the helper and the
proxy failure continuation ship together so no intermediate duplicate direct
path exists.

Rollback removes the helper and continuation as one unit and restores the
pre-fix branch structure. Rollback must not alter `rlProviderConfig`, clear any
browser key, rewrite option snapshots, or edit BUG-002 evidence.

## Observability And Failure Handling

The design intentionally adds no credential-bearing logging. Observable proof
comes from deterministic request history at the injected external `fetch`
boundary, masked `providerAccess`/`providerStatus` serialization, sanitized
rejections, and the returned response structure.

The primary route sequence is:

```text
GET <proxyBaseUrl>/health
GET <proxyBaseUrl>/finnhub/api/v1/quote?symbol=MSFT
GET https://finnhub.io/api/v1/quote?symbol=MSFT&token=<local-key>
```

The proxy remains globally reachable after a provider-route failure. A direct
failure is terminal for that call; there is no retry loop and no provider
substitution.

## Testing And Validation Strategy

| Scenario / Contract | Test Type | Existing Surface | Required Assertion |
|---|---|---|---|
| SCN-BUG004-001 controlling defect | Functional adversarial RED/GREEN | `tests/provider-credentials.functional.mjs` via `loadRldata({ fetch })` | Exact health -> proxy route -> same-provider direct order; proxy 503; distinct direct response returned; sentinel absent from both proxy URLs |
| FR-2 complete failure set | Functional parameterized | Provider credential functional suite | Non-2xx, transport rejection, timeout, and JSON decode failure each converge once on the same direct helper; no retry loop |
| SCN-BUG004-002 no key | Functional negative | Provider credential functional suite | Proxy failure followed by `PROVIDER_KEY_MISSING:finnhub`; zero direct request; no raw proxy error surfaced |
| SCN-BUG004-003 force-local | Functional preservation | Provider credential functional suite | No proxy provider-route request; same direct helper and registered host are used |
| SCN-BUG004-004 provider defenses | Unit regression | `tests/provider-credentials.unit.mjs` | Unknown and prototype-shaped identifiers cause no config access, transport, or prototype mutation |
| Secret containment | Unit, functional, browser canary | Existing provider credential suites | Sentinel absent from proxy URLs, status/access JSON, errors, DOM text, logs, and tool reads; direct registered-host URL is the only allowed request occurrence |
| Protected option paths | Static/change-boundary canary | Existing option pages, snapshot script, and Git diff | No changed byte under protected paths; snapshot-first ordering remains intact |
| Shared-layer regression | Build-free full regression | `node scripts/selftest.mjs` | Existing shared cache, provider, and tool contracts remain unchanged |

The controlling regression must fail against the current proxy-only branch
before production source changes and pass after the repair. Its direct response
must be structurally distinct from the proxy response so replacing production
routing with an identity or canned return cannot satisfy the assertion.

The deterministic functional test is the exact external-transport proof. A
browser test that intercepts the provider route is a mocked boundary and may
serve as a browser regression canary, but it must not be labeled live provider
transport. `bubbles.plan` must reconcile the current Test Plan so every FR-2
failure class and the framework's scenario-specific E2E requirement have an
honest, non-duplicative row.

## Alternatives And Tradeoffs

1. **Mark the proxy globally unreachable after one route failure.** Rejected:
   one provider credential or response problem says nothing about another
   route, and it would corrupt the cached health meaning.
2. **Fallback only for HTTP 503.** Rejected: current FR-2 explicitly includes
   non-2xx, transport, timeout, and decode failures.
3. **Duplicate direct URL logic in the proxy rejection branch.** Rejected:
   two key-reading and sanitization paths can diverge and leak credentials.
4. **Ask each caller to toggle force-local or retry.** Rejected: tier policy is
   foundation-owned and tool-specific copies would violate the BUG-002 single
   provider-access contract.
5. **Retry the proxy or choose another provider.** Rejected: neither behavior
   is specified, both expand request volume, and provider substitution changes
   data semantics.

## Complexity Tracking

None - one private direct-tier helper plus one bounded proxy failure
continuation is the simplest viable approach.

## Risks And Open Questions

### Risks

- Broad FR-2 fallback can hide a transient proxy fault from the caller when the
  direct request succeeds. The one-attempt bound, same-provider rule, and
  unchanged global health state contain that tradeoff without inventing logs.
- An overly broad promise catch could accidentally catch a direct-helper
  rejection and retry recursively. The catch boundary must wrap only the proxy
  attempt; the returned direct rejection propagates unchanged after
  sanitization.
- A test that asserts only a canned direct object could self-validate its
  fixture. Exact request order, host, query-key placement, and structurally
  distinct return data must all be asserted through production `providerFetch`.

### Open Questions

None are design-blocking. The remaining questions are planning-owned:

- Which scenario-specific E2E classification can satisfy the framework without
  misrepresenting an intercepted third-party route as live transport?
- Does the current functional harness need timer control to exercise the
  existing 12-second timeout deterministically, or can planning bind timeout
  coverage to an already-supported abort-signal observation?
