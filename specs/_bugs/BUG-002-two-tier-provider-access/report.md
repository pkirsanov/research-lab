# Report: BUG-002 Two-Tier Provider Access

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md)

## Summary

Two-tier provider access (tailnet proxy → local browser keys) implemented across
the research-lab client and a new knb-managed evo-x2 proxy. All five scopes done:
primary gate green, the regression suite rewritten to the two-tier model, the
Tier-1 proxy deployed and validated live, and the tool-page rewire + docs
complete. Shipped to origin/main (commit e0ecc92e); the client is live via Pages.

## Completion Statement

Implementation complete and shipped. All five scopes are implemented with
evidence below and validated green (selftest 674/0; node provider suite — 6
node:test + load 8/8 + stress 250/250; Playwright 15/15) on origin/main HEAD.
Shipped as commit e0ecc92e; the client is live via GitHub Pages and the Tier-1
proxy is live on evo-x2.

Status remains `in_progress`: formal bugfix-fastlane certification has NOT been
run. The state-transition guard requires the regression / simplify / stabilize /
security / audit specialist phases, TDD-RED capture, a Consumer Impact Sweep, and
report `### Validation` / `### Audit` sections. Those are the documented closure
step and must be executed through the workflow (not hand-authored).

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

### s3 — regression suite rewritten to two-tier + primary gate green (SCOPE-03)

Primary gate (selftest), on origin/main HEAD:

```
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 674 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

Node-based provider suite (unit + functional + owner-canary reconciliation, then load + stress):

```
$ node --test tests/provider-credentials.unit.mjs tests/provider-credentials.functional.mjs tests/distributed-briefs-owner-canary.mjs
✔ Canary: five current publisher reads and four headless reads preserve pre-evidence semantics
✔ Canary: Bond Regime and browser credential boundaries exclude restricted and private fields
✔ SCN-BUG002-002 local keys persist across lifecycle signals (Tier-2 is durable, not memory-only)
✔ SCN-BUG002-002b same browser shares keys across pages; separate browsers stay isolated
✔ SCN-BUG002-001 providers start unconfigured; two-tier API present; local key configures then clears
✔ SCN-BUG002-004 fail-closed transport and prototype-safe unknown providers
ℹ tests 6  ℹ pass 6  ℹ fail 0

$ node tests/provider-credentials.load.mjs
BUG002_LOAD_BEGIN
CATEGORY=load
PARALLEL_CONTEXTS=8
ISOLATED_KEYS=8
PERSISTED_ACROSS_RELOAD=8
PERSISTED_ACROSS_NAV=8
TIER2_PROVIDER_REACHED=8
KEY_LEAKS=0
RESULT=PASS
BUG002_LOAD_END

$ node tests/provider-credentials.stress.mjs
BUG002_STRESS_BEGIN
CATEGORY=stress
CYCLES=250
TIER2_ROUNDTRIPS=250
TIER1_PROXY_FETCHES=250
TIER2_PROVIDER_FETCHES=250
PROXY_KEY_LEAKS=0
TIER2_REQUESTS_MISSING_KEY=0
KEY_LEAKS=0
LEGACY_STORAGE_OFFENDERS=0
RESULT=PASS
BUG002_STRESS_END
NODE_SUITE_EXIT=0
```

Playwright browser suite (bundled chromium; the editor UI spec + the 2 reconciled specs):

```
$ npx playwright test tests/provider-credentials.spec.mjs tests/technical-analysis-decision-lab.spec.mjs tests/msft-july-market-refresh.spec.mjs --project=chromium
Running 15 tests using 3 workers
  15 passed (6.3s)
PW_EXIT=0
```

Rewrite notes: `provider-credentials.{support,unit,functional,load,stress,spec}.mjs` moved off the
BUG-001 controlled-policy harness to the two-tier model (per-browser key isolation, Tier-1 proxy vs
Tier-2 local-key routing via `page.route` mocks, fail-closed transport). `distributed-briefs-owner-canary.mjs`,
`technical-analysis-decision-lab.spec.mjs`, and `msft-july-market-refresh.spec.mjs` reconciled to
`providerStatus`/`providerAccess`/`providerFetch`. A bundled-`chromium` Playwright project was added for
local validation (CI still names `system-chrome`).

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

### s5 — tool-page rewire + editor CSS + docs (SCOPE-05)

- `ai-capex-strategy-lab.html` and `etf-momentum-lab.html` already contained guarded
  `RLDATA.providerFetch(provider, <full url>)` calls that are now functional.
- `msft-july-print-model.html` `fetchLive` rewired from the removed `credentialStatus`/`useCredential`
  to `providerFetch`: reads `providerStatus('finnhub')`, routes Tier-1 proxy / Tier-2 local key, builds a
  real Finnhub→accepted-quote envelope on success, and preserves the cache + a `#data-settings` link on
  unconfigured/refused. Validated by `msft-july-market-refresh.spec.mjs` (10/10) — the SCN-009-009 refresh
  case logs `centralState=unconfigured statusHasSettingsLink=true acceptedSpotPreserved=true`.
- `index.html` editor CSS added for `.settings-proxy` / `.settings-key` / inputs / buttons / `em.on`
  (proxy state); the provider card stacks the label / key / status rows.
- Docs updated to the two-tier model: `.github/copilot-instructions.md`, `.specify/memory/agents.md`,
  `notes/shared-data-layer.md`.

## Anti-fabrication note

All evidence above was captured from actual command execution in the
implementing session (node syntax checks, `node scripts/selftest.mjs`, the
evo-x2 `install.sh` run, and tailnet `curl` validation).
