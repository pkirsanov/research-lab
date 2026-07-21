# Spec: BUG-002 Two-Tier Provider Access

Links: [bug.md](bug.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md)

Supersedes the Tier-2 portion of
[BUG-001](../BUG-001-central-provider-credential-security/spec.md). See
[bug.md](bug.md) for the governance note and rationale.

## Goal

Make the four data providers **enableable and usable** from the Research Lab UI
via a two-tier model — a tailnet proxy (keys server-side) with automatic
fallback to per-user local browser keys — without exposing the operator's keys
to public GitHub Pages visitors.

## Requirements

- **FR-1 Registry.** `rldata.js` exposes a frozen provider registry
  (`twelvedata`, `finnhub`, `alphavantage`, `fred`) each with `host` + `keyParam`.
- **FR-2 Config store.** A single `localStorage.rlProviderConfig`
  (`{ v, proxyBaseUrl, keys }`) holds the user's proxy URL and per-provider local
  keys. It is written only by the shared data layer (`rldata.js`), only from the
  settings editor.
- **FR-3 Tier resolution.** `probeProxy()` GETs `<proxyBaseUrl>/health` with a
  short timeout, session-caches the result (~60s), and exposes
  `providerAccess()/activeTier()`. Proxy reachable ⇒ `proxy`; else ⇒ `local`. A
  `setForceLocal(true)` override forces `local`.
- **FR-4 Transport.** `providerFetch(provider, urlOrPath)` accepts either a full
  provider URL or a path. Tier 1 routes to `<proxyBaseUrl>/<provider>/<path>`
  (no browser key). Tier 2 calls `https://<host>/<path>?<keyParam>=<localKey>`.
- **FR-5 Fail-closed.** A keyed provider with neither an active proxy nor a
  local key rejects (`PROVIDER_KEY_MISSING`); no fallback to another provider or
  transport.
- **FR-6 Editor.** `index.html#data-settings` renders a proxy-URL field,
  per-provider masked key inputs, live tier status, recheck, force-local, and
  clear-all.
- **FR-7 Disclosure.** No key value appears in the DOM as text, status text,
  logs, errors, tool reads, or CSV/JSON exports. Tier-2 keys are transmitted
  only to the owning provider host; Tier-1 requests carry no key.
- **FR-8 Public safety.** The proxy URL is user-configured and never hardcoded
  in this public repo. Off-tailnet the proxy MagicDNS name does not resolve, so
  public visitors fall back to their own Tier-2 keys and cannot use the
  operator's keys.
- **FR-9 Non-regression.** Non-secret `localStorage.rlData` cache behavior and
  the shared data-status shell are unchanged.

## Domain Capability Model

The capability is **provider data access** — a single foundation that resolves,
authorizes, and fetches third-party market data on behalf of every Research Lab
tool. It has two orthogonal variation axes: the **transport tier** (Tier-1
tailnet proxy with keys server-side vs Tier-2 per-browser local key) and the
**provider** (`twelvedata`, `finnhub`, `alphavantage`, `fred`). One foundation
(`rldata.js`) owns the capability; every tool consumes it through the same
`providerFetch` / `providerAccess` surface rather than re-implementing access.

## Scenarios (Gherkin)

```gherkin
Scenario: SCN-BUG002-001 Providers start unconfigured and enableable
  Given a fresh browser with no proxy URL and no local keys
  When the settings editor renders
  Then every provider state is "unconfigured" (not "disabled")
  And the panel exposes a proxy-URL field and a per-provider key input

Scenario: SCN-BUG002-002 A local key configures a provider (Tier 2)
  Given no reachable proxy
  When the user saves a local key for "finnhub"
  Then finnhub state becomes "configured" with localConfigured true
  And the key is stored only in localStorage.rlProviderConfig of this browser

Scenario: SCN-BUG002-003 Tier-1 proxy routing carries no browser key
  Given a reachable proxy is configured
  When providerFetch("finnhub", "https://finnhub.io/api/v1/quote?symbol=MSFT") runs
  Then the request goes to <proxyBaseUrl>/finnhub/api/v1/quote?symbol=MSFT
  And no local key is read or sent from the browser

Scenario: SCN-BUG002-004 Fail-closed when no key and no proxy
  Given no reachable proxy and no local key for "twelvedata"
  When providerFetch("twelvedata", "time_series?symbol=SPY") runs
  Then it rejects with PROVIDER_KEY_MISSING and sends no request

Scenario: SCN-BUG002-005 Force-local override
  Given a reachable proxy is configured
  When the user enables "force local keys"
  Then activeTier is "local" and Tier-2 transport is used

Scenario: SCN-BUG002-006 No key disclosure
  Given a local key is configured
  When status text, tool reads, and exports are produced
  Then none of them contains the key value

Scenario: SCN-BUG002-007 Clear resets all provider config
  Given a proxy URL and local keys are set
  When the user clears all provider config
  Then proxyBaseUrl is empty, all keys are removed, and providers are unconfigured
```
