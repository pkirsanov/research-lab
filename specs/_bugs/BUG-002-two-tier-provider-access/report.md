# Report: BUG-002 Two-Tier Provider Access

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md)

## Summary

Two-tier provider access (tailnet proxy → local browser keys) implemented across
the research-lab client and a new knb-managed evo-x2 proxy. Primary gate green;
Tier-1 proxy deployed and validated live. Regression-suite rewrite (SCOPE-03) and
docs/tool-rewire (SCOPE-05) in progress.

## Completion Statement

Not yet complete. SCOPE-01, SCOPE-02, SCOPE-04 done with evidence below;
SCOPE-03 and SCOPE-05 in progress.

## Test Evidence

### s1 — rldata.js two-tier core (SCOPE-01)

```
$ node --check rldata.js && echo RLDATA_SYNTAX_OK
RLDATA_SYNTAX_OK
=== new API surface present? ===
clearAllProviderConfig:
clearKey:
providerAccess:
providerFetch:
recheckProxy:
setForceLocal:
setKey:
setProxyBaseUrl:
=== old removed? (expect empty) ===
old_refs=0
```

### s2 — rlapp.js editor (SCOPE-02)

```
$ node --check rlapp.js && echo RLAPP_SYNTAX_OK
RLAPP_SYNTAX_OK
=== new markers present ===
clearAllProviderConfig
data-provider-key
data-proxy-url
providerAccess
recheckProxy
setForceLocal
setProxyBaseUrl
settings-savekey
=== old removed (expect 0) ===
old=0
```

### s3 — primary gate (selftest) green, incl. live local-key set/clear round-trip

```
$ node scripts/selftest.mjs   (post-merge with origin/main)
================================================
Research-Lab self-test: 674 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

New assertions added: providers start `unconfigured`; the full two-tier API is
exposed; a local key configures a provider; `clearAllProviderConfig` resets it;
the landing page exposes the editor markers.

### s4 — knb proxy authored, deployed, validated live (SCOPE-04)

```
# knb/shared/research-lab-proxy lint
shellcheck OK · shfmt OK · yamllint OK · node --check OK
home-lab-service-contract.sh => PASS research-lab-proxy (exit 0)

# deploy to evo-x2 (git ff-only pull + install.sh)
INSTALL_EXIT=0
Caddy: Valid configuration → reload (peers preserved)
container up: 127.0.0.1:18099 (health: starting→healthy)
PASS local health · PASS tailnet health https://<host>.<tailnet>.ts.net:PORT/health

# live client-side validation over the tailnet HTTPS edge (5/5)
1) /health           → 200 JSON, all unconfigured
2) CORS header       → access-control-allow-origin: <pages origin>
3) twelvedata no key → 503 PROVIDER_KEY_MISSING
4) /admin            → masked, all "unset"
5) /yahoo/... SPY    → live chart JSON (regularMarketPrice, meta) — real data path
```

### s5 — tool pages (SCOPE-05, partial)

`ai-capex-strategy-lab.html` and `etf-momentum-lab.html` already contained
guarded `RLDATA.providerFetch(provider, <full url>)` calls that are now
functional. `msft-july-print-model.html` rewire and docs pending.

## Anti-fabrication note

All evidence above was captured from actual command execution in the
implementing session (node syntax checks, `node scripts/selftest.mjs`, the
evo-x2 `install.sh` run, and tailnet `curl` validation).
