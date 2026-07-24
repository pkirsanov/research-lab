# Spec: BUG-004 Proxy Route Local-Key Fallback

Links: [bug.md](bug.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Outcome Contract

- **Intent:** Preserve proxy-first provider access while making the certified
  Tier-2 local key a real same-provider fallback when a reachable proxy cannot
  serve that provider route.
- **Success Signal:** A deterministic regression observes request order
  `health -> proxy provider route -> registered direct provider host`, receives
  the direct host's distinct structural response, and proves the local key is
  absent from every proxy URL and surfaced error/status value.
- **Hard Constraints:** No local key may be sent to the proxy or disclosed in
  status, errors, DOM, or logs; no cross-provider fallback; force-local and
  unknown-provider defenses remain; the options snapshot pipeline is unchanged.
- **Failure Condition:** Any proxy route failure still terminates before a
  configured same-provider direct attempt, or any local key reaches a proxy URL
  or observable diagnostic surface.

### Single-Capability Justification

BUG-004 is a one-helper repair inside BUG-002's existing **provider data
access** capability, not a new provider or adapter foundation. The existing
primitives remain the frozen `PROVIDERS` registry, the
`localStorage.rlProviderConfig` proxy-and-key store, `probeProxy` / tier and
force-local resolution, `providerRequestPath`, the single `providerFetch`
transport entrypoint, and the masked `providerAccess` / `providerStatus`
surfaces. Their existing policies remain proxy-first and keyless at Tier 1;
same-registered-provider only at Tier 2; fail closed when that provider has no
local key; reject unknown and prototype-shaped providers before config or
transport access; and disclose a local key only to its registered direct host.

The repair makes the existing proxy-unreachable, force-local, and failed
proxy-route paths share one private direct-tier helper. It adds no provider,
registry entry, adapter type, transport tier, public API, storage shape, screen,
or second policy owner. A second capability foundation would duplicate the
BUG-002 contract and introduce abstraction without a new implementation axis.

## Requirements

- **FR-1 Proxy-first resolution.** When `probeProxy()` reports the configured
  proxy reachable and force-local is false, `providerFetch` must attempt the
  proxy provider route before any direct request.
- **FR-2 Same-provider fallback.** If the proxy provider request fails because
  of a non-2xx response, transport rejection, timeout, or JSON decode failure,
  and a local key exists for the same registered provider, `providerFetch` must
  make one direct HTTPS request to that provider's registry host using its
  registry key parameter.
- **FR-3 One direct implementation.** Proxy fallback, proxy-unreachable access,
  and force-local access must call one shared direct-tier helper. Duplicate URL
  construction or key lookup paths are not allowed.
- **FR-4 Secret containment.** The local key must not be read into or appended
  to the proxy request. It must not appear in status results, thrown errors,
  DOM text, logs, or tool reads. Direct transport is the only request allowed to
  carry it.
- **FR-5 Fail closed without a key.** If the proxy route fails and no local key
  exists for that provider, no direct request is made and the caller receives a
  sanitized `PROVIDER_KEY_MISSING:<provider>` error.
- **FR-6 Force-local preservation.** `setForceLocal(true)` must bypass the proxy
  provider route and use the same direct-tier helper.
- **FR-7 Registry boundary preservation.** Unknown and prototype-shaped
  provider identifiers must be rejected before config or transport access.
- **FR-8 No unrelated transport changes.** Git-backed same-origin option
  snapshots, `scripts/fetch-options.mjs`, and options-tool snapshot-first fetch
  order are unchanged.

## Scenarios

```gherkin
Scenario: SCN-BUG004-001 Reachable proxy route failure falls back to the same provider
  Given the proxy health endpoint returns 200
  And a local key exists for finnhub
  And the finnhub proxy route returns 503 PROVIDER_KEY_MISSING
  When providerFetch requests a finnhub quote
  Then the proxy provider route is attempted before the direct provider host
  And the direct host's distinct structural response is returned
  And the local key appears in no proxy URL

Scenario: SCN-BUG004-002 Proxy route failure without a local key remains fail closed
  Given the proxy health endpoint returns 200
  And no local key exists for finnhub
  And the finnhub proxy route returns 503 PROVIDER_KEY_MISSING
  When providerFetch requests a finnhub quote
  Then no direct provider request is made
  And the call rejects with sanitized error PROVIDER_KEY_MISSING:finnhub

Scenario: SCN-BUG004-003 Force-local bypasses a reachable proxy
  Given the proxy health endpoint returns 200
  And a local key exists for finnhub
  When force-local is enabled and providerFetch requests a finnhub quote
  Then no proxy provider route is requested
  And the same direct-tier implementation returns the direct response

Scenario: SCN-BUG004-004 Unknown providers remain inert
  Given an unknown or prototype-shaped provider identifier
  When providerFetch or provider configuration is attempted
  Then the operation fails with UNKNOWN_PROVIDER semantics
  And built-in prototypes, provider config, and transport history are unchanged
```

## Security And Privacy Acceptance

The adversarial sentinel local key must be searched across all captured proxy
URLs, status/access serialization, rejection messages, and test-visible output.
The only permitted occurrence outside browser-local storage is the direct URL
sent to the registered provider HTTPS host.

## Out Of Scope

- `data/options/**`
- `scripts/fetch-options.mjs`
- same-origin option snapshot loading and options-tool fetch order
- any edit to `specs/_bugs/BUG-002-two-tier-provider-access/**`
- provider registry additions, removals, or host changes
