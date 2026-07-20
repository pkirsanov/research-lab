# Bug: BUG-002 Two-Tier Provider Access (supersedes the BUG-001 no-browser-credential contract)

Links: [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

> **Governance note.** This packet deliberately and explicitly **supersedes the
> Tier-2-relevant portion of [BUG-001](../BUG-001-central-provider-credential-security/bug.md)**
> ("No provider credential value is written to `localStorage`/`sessionStorage`…
> reload/navigation clear every active provider credential"). It is an
> owner-directed product decision, not a regression. The BUG-001 record remains
> preserved for traceability; its "no browser-stored credential" rule no longer
> governs Tier-2 local keys under the contract below.

## Summary

Research Lab's provider access was locked down by BUG-001 to a memory-only,
current-document model in which every third-party data provider (Twelve Data,
Finnhub, Alpha Vantage, FRED) is permanently `disabled` and no credential may
touch any browser persistence surface. In practice this rendered all four
providers un-enableable from the UI: the settings panel is status-only and the
transport (`useCredential`) is a hardcoded `TRANSPORT_UNAVAILABLE` stub.

The owner-directed replacement is a **two-tier provider-access model**:

- **Tier 1 — tailnet proxy (primary, keys never in the browser).** A
  knb-managed proxy on the operator's evo-x2 host
  (`knb/shared/research-lab-proxy`) holds the provider API keys server-side and
  is reachable only over the tailnet. The browser calls
  `https://<host>.<tailnet>.ts.net:PORT/<provider>/<path>`; the proxy injects the
  key and returns the data with a CORS header scoped to the Pages origin. Public
  GitHub Pages visitors cannot reach it (MagicDNS does not resolve off-tailnet),
  so the owner's keys are never exposed and never usable by others.
- **Tier 2 — local browser keys (fallback, per-user, self-isolating).** When the
  proxy is unreachable (off-tailnet or down), each user may enter their **own**
  provider keys on `index.html#data-settings`. These are stored only in that
  user's own browser (`localStorage.rlProviderConfig`) and are only ever sent to
  the owning provider's own HTTPS host. No shared/global key exists; each browser
  holds only its own keys.

This reverses BUG-001's `localStorage`-credential prohibition **for Tier 2
only**, as a deliberate, documented tradeoff appropriate to a single-user,
educational, bring-your-own-key tool.

## Severity

- [ ] Critical
- [ ] High
- [x] Medium — an intentional, scoped security-posture change (browser-stored BYO keys) with a documented rationale and a more-secure primary tier
- [ ] Low

## Status

- [ ] Reported
- [ ] Confirmed by an executed pre-fix regression
- [x] In Progress
- [ ] Fixed
- [ ] Verified
- [ ] Closed

## Discovery Source

- Requestor: repository owner (product decision, 2026-07-20).
- Trigger: providers displayed `disabled · PROVIDER_DISABLED` and were not
  enableable from the UI; the owner requires a tailnet-proxy-first model with a
  per-user local-key fallback.
- Superseded contract: [BUG-001](../BUG-001-central-provider-credential-security/spec.md)
  "Active Expected Behavior" (memory-only, no browser persistence, providers
  disabled). Preserved for traceability; Tier-2 portion no longer binding.

## Active Reproduction / Before State

1. Open `index.html#data-settings` on the pre-change build. The panel is
   status-only; every provider reads `disabled · PROVIDER_DISABLED`.
2. `rldata.js` `providerEligible()` can never be satisfied, so
   `providerPolicies()` returns every provider `disabled`.
3. `useCredential()` returns `TRANSPORT_UNAVAILABLE` unconditionally — no data
   path exists even if a credential were accepted.

## Active Expected Behavior (new contract)

- **Tier resolution.** On load, the client probes `<proxyBaseUrl>/health`
  (short timeout, session-cached). Reachable ⇒ Tier 1 (proxy). Unreachable ⇒
  Tier 2 (local keys). An operator override (`force local keys`) is available.
- **Tier 1.** `providerFetch(provider, urlOrPath)` routes through
  `<proxyBaseUrl>/<provider>/<path>`. No key is present in the browser. The
  proxy URL is user-configured (never hardcoded in this public repo).
- **Tier 2.** When the proxy is not active, `providerFetch` calls the provider's
  own HTTPS host directly with the browser-stored local key. A keyed provider
  with no local key rejects with `PROVIDER_KEY_MISSING` (no silent fallback to a
  different provider or transport).
- **Isolation.** Local keys live only in `localStorage.rlProviderConfig` of the
  entering user's own browser. They are never transmitted anywhere except the
  owning provider host (Tier 2) and are never sent to the proxy (Tier 1 needs no
  browser key). No key value is written to the DOM as text, logs, errors, tool
  reads, CSV exports, the proxy admin surface response, or any status text.
- **Enablement.** The settings panel is a real editor: a proxy-URL field, a
  per-provider masked local-key input, live tier status, recheck, and clear.
- Non-secret `localStorage.rlData` market/cache behavior remains intact.

## Why the BUG-001 reversal is acceptable (Tier-2 rationale)

1. **Bring-your-own-key, self-isolating.** Each user stores only their own key
   in their own browser; there is no shared/global key that a public visitor
   could use. This is the standard static-tool BYO-key pattern.
2. **Primary tier keeps keys off the browser entirely.** Tier 1 (the operator's
   own tailnet proxy) is the intended primary path; keys live server-side and
   are unreachable by the public.
3. **Scoped transmission.** A Tier-2 key is sent only to the owning provider's
   own HTTPS endpoint — never to a third party, never via the proxy, never in a
   URL surface that leaks cross-origin (referrer-policy `no-referrer` on
   provider links; keys ride the query only to the provider that issued them).
4. **Single-user educational tool.** Research Lab is a personal, educational
   research surface (not multi-tenant, no PII, watchlist is tickers-only). The
   convenience of an off-tailnet fallback outweighs the residual
   own-browser-storage risk, which harms only the key's owner.
