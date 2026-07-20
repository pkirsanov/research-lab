# Design: BUG-002 Two-Tier Provider Access

Links: [bug.md](bug.md) | [spec.md](spec.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Architecture

```
Browser (public GitHub Pages)
  │
  ├─ Tier 1 (primary, on tailnet): fetch  https://<host>.<tailnet>.ts.net:PORT/<provider>/<path>
  │        └─ knb/shared/research-lab-proxy injects the key server-side → provider → data (+CORS)
  │
  └─ Tier 2 (fallback, off-tailnet): fetch  https://<providerHost>/<path>?<keyParam>=<localKey>
           └─ local key from localStorage.rlProviderConfig (this browser only)
```

Tier selection is decided by a single boot-time probe of `<proxyBaseUrl>/health`
(1.5s timeout, session-cached ~60s). Off-tailnet the MagicDNS name does not
resolve, so the probe fails fast and the client uses Tier 2.

## `rldata.js` (shared data layer — sole owner of provider access)

| Symbol | Role |
|---|---|
| `PROVIDERS` | frozen registry: `{host, keyParam}` per provider |
| `rlProviderConfig` (localStorage) | `{ v, proxyBaseUrl, keys{} }` — the only persisted provider surface |
| `loadProviderConfig`/`saveProviderConfig` | read/write the config store |
| `probeProxy(force)` | GET `/health`, set `_proxyReachable` (session-cached) |
| `proxyActive`/`activeTier` | `proxy` iff reachable + URL set + not force-local |
| `providerStatus`/`providerAccess`/`providerPolicies` | masked status for the UI (never key values) |
| `setProxyBaseUrl`/`setKey`/`clearKey`/`clearAllProviderConfig` | editor writes |
| `recheckProxy`/`setForceLocal` | tier controls |
| `providerFetch(provider, urlOrPath)` | real transport; Tier 1 proxy-routed (no key) or Tier 2 direct (local key); `PROVIDER_KEY_MISSING` when neither available |
| `proxied(url)` | prepends `<proxyBaseUrl>/yahoo/…` for Yahoo when the proxy is active (replaces flaky public CORS proxies) |

The former BUG-001 symbols (`PROVIDER_POLICIES`, `_credentialRuntime`,
`providerEligible`, `credentialStatus`, `authorizeCredential`, `useCredential`,
`clearCredential`, `clearAllCredentials`, `installCredentialLifecycle`) are
removed. There is no clear-on-navigation lifecycle because Tier-2 keys now
persist per the new contract.

## `rlapp.js` (settings editor on `index.html#data-settings`)

`mountSettings` renders and re-paints: a proxy-URL field (`data-proxy-url`),
per-provider masked key inputs (`data-provider-key`), a live tier label
(`data-tier`), `recheck`, `force-local`, per-provider `Save`/`Clear`, and a
`Clear all keys + proxy` action. `credentialApi()` guards on the new API
(`providerAccess`, `setKey`, `setProxyBaseUrl`, `clearAllProviderConfig`).

## Server side (knb/shared/research-lab-proxy)

Node-builtins-only proxy behind host Caddy (Tailscale node cert TLS). Holds keys
in a `chmod 600` file, edited via a tailnet-only `/admin` page (masked). Injects
the per-provider key param; adds `Access-Control-Allow-Origin: <pages origin>`;
returns `503 PROVIDER_KEY_MISSING` for a keyed provider with no key so the client
can fall back to Tier 2. Contract: `knb/shared/research-lab-proxy/README.md`.

## Public-repo boundary

The proxy base URL is **user-configured** (entered in the UI, stored in
`rlProviderConfig`) — never committed to this public repo. The concrete tailnet
FQDN/port live only in the operator-private knb overlay.

## Test strategy

The BUG-001 regression suite (`tests/provider-credentials.*.mjs`) is rewritten to
validate the new two-tier invariants instead of the old lockdown: unconfigured
defaults, local-key set/clear, tier resolution, Tier-1 proxy routing (no key),
Tier-2 direct transport, fail-closed `PROVIDER_KEY_MISSING`, and no key
disclosure. `scripts/selftest.mjs` provider assertions are updated in lockstep
(already green: 674/0).
