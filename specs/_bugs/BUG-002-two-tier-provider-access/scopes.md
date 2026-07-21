# Scopes: BUG-002 Two-Tier Provider Access

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md)

## SCOPE-01 — Two-tier data layer (rldata.js)

**Status:** Done

**Foundation:** `foundation: true` — the single provider-access data layer every tool depends on.

Registry, `rlProviderConfig` store, proxy probe/resolver, `providerFetch`
transport, proxy-aware Yahoo routing; old BUG-001 credential API removed.

### Consumer Impact Sweep

The reversal **removes** the BUG-001 credential symbols from `rldata.js`
(`credentialStatus`, `authorizeCredential`, `useCredential`, `clearCredential`,
`clearAllCredentials`, plus `providerEligible` / `_credentialRuntime` /
`installCredentialLifecycle`). This is a data-layer **symbol** change only — no
route, navigation, breadcrumb, redirect, or deep link surface is affected. Every
first-party consumer of the removed symbols was traced and rewired to the new
`providerStatus` / `providerAccess` / `providerFetch` API so **zero
stale-reference** remains:

| First-party consumer | Removed symbol used | Action |
|---|---|---|
| `msft-july-print-model.html` (`fetchLive`) | `credentialStatus` / `useCredential` | rewired to `providerStatus` / `providerFetch` (SCOPE-05) |
| `tests/distributed-briefs-owner-canary.mjs` | credential-boundary asserts | reconciled to the two-tier boundary (SCOPE-03) |
| `tests/msft-july-market-refresh.spec.mjs` | `useCredential` refresh path | reconciled to `providerFetch` (SCOPE-03 / 05) |
| `tests/technical-analysis-decision-lab.spec.mjs` | credential-API canary | reconciled to the two-tier API (SCOPE-03) |
| `ai-capex-strategy-lab.html`, `etf-momentum-lab.html` | already used `providerFetch` | no change needed — now functional |

Sweep verification (re-run in the audit session):
`grep -cE 'credentialStatus|authorizeCredential|useCredential|clearCredential|clearAllCredentials' rldata.js` → `0`; the three reconciled specs pass and the tool-page rewire is validated (report.md #s3 / #s5 / #validation).

**Test Plan**

| Test Type | Category | File | Command | Live |
|---|---|---|---|---|
| Unit | unit | scripts/selftest.mjs (RLDATA group) | `node scripts/selftest.mjs` | No |
| Unit | unit | tests/provider-credentials.unit.mjs | `node --test tests/provider-credentials.unit.mjs` | No |

### Definition of Done

- [x] `PROVIDERS` registry + `rlProviderConfig` store implemented → Evidence: [report.md#s1](report.md)
- [x] `probeProxy`/`activeTier`/`providerFetch` implemented; fail-closed `PROVIDER_KEY_MISSING` → Evidence: [report.md#s1](report.md)
- [x] Old credential API removed (0 refs) → Evidence: [report.md#s1](report.md)
- [x] Consumer impact sweep complete — zero stale first-party references remain to the removed BUG-001 credential symbols (rldata.js old-API refs = 0; every consumer rewired/reconciled; no stale-reference in any page, deep link, or nav surface) → Evidence: [report.md#s3](report.md)
- [x] `node scripts/selftest.mjs` green (674/0) → Evidence: [report.md#s3](report.md)

## SCOPE-02 — Settings editor (rlapp.js)

**Status:** Done

**Depends On:** SCOPE-01 (the foundation data layer).

Proxy-URL field, per-provider masked key inputs, tier status, recheck,
force-local, clear-all.

### Definition of Done

- [x] Editor renders on `index.html#data-settings` with proxy + key inputs → Evidence: [report.md#s2](report.md)
- [x] `credentialApi()` guards on the new API; syntax clean → Evidence: [report.md#s2](report.md)

## SCOPE-03 — Regression suite + selftest reconciliation

**Status:** Done

**Depends On:** SCOPE-01 + SCOPE-02 (foundation + editor).

Rewrite the BUG-001 regression suite to the new two-tier invariants.

**Test Plan**

| Test Type | Category | File | Command |
|---|---|---|---|
| Unit | unit | tests/provider-credentials.unit.mjs | `node --test tests/provider-credentials.unit.mjs` |
| Functional | functional | tests/provider-credentials.functional.mjs | `node --test tests/provider-credentials.functional.mjs` |
| Load | load | tests/provider-credentials.load.mjs | `node --test tests/provider-credentials.load.mjs` |
| E2E UI | e2e-ui | tests/provider-credentials.spec.mjs | `npx playwright test tests/provider-credentials.spec.mjs` |
| Regression E2E | e2e-ui | tests/provider-credentials.spec.mjs, tests/msft-july-market-refresh.spec.mjs, tests/technical-analysis-decision-lab.spec.mjs | `npx playwright test tests/provider-credentials.spec.mjs tests/msft-july-market-refresh.spec.mjs tests/technical-analysis-decision-lab.spec.mjs --project=chromium` |
| Stress | stress | tests/provider-credentials.stress.mjs | `node --test tests/provider-credentials.stress.mjs` |

### Definition of Done

- [x] `provider-credentials.{unit,functional,load,stress}.mjs` rewritten to the two-tier model and passing → Evidence: [report.md#s3](report.md)
- [x] `provider-credentials.spec.mjs` (Playwright) rewritten and passing → Evidence: [report.md#s3](report.md)
- [x] `distributed-briefs-owner-canary.mjs`, `msft-july-market-refresh.spec.mjs`, `technical-analysis-decision-lab.spec.mjs` reconciled → Evidence: [report.md#s3](report.md)
- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass (SCN-BUG002-001..007 via `provider-credentials.spec.mjs`; SCN-009 refresh via `msft-july-market-refresh.spec.mjs`) → Evidence: [report.md#validation](report.md)
- [x] Broader E2E regression suite passes (Playwright 15/15 + selftest 674/0 + node provider suite 6/6) → Evidence: [report.md#validation](report.md)
- [x] `node scripts/selftest.mjs` remains green → Evidence: [report.md#s3](report.md)

## SCOPE-04 — Server side (knb proxy) + deploy

**Status:** Done (cross-repo, knb)

**Depends On:** none (independent server-side proxy scope).

### Definition of Done

- [x] `knb/shared/research-lab-proxy` authored, lint + contract clean → Evidence: [report.md#s4](report.md)
- [x] Deployed to evo-x2; live at the tailnet HTTPS edge; 5/5 client checks incl. real Yahoo passthrough → Evidence: [report.md#s4](report.md)

## SCOPE-05 — Tool-page rewire + docs

**Status:** Done

**Depends On:** SCOPE-01 (foundation).

### Definition of Done

- [x] `msft-july-print-model.html` uses `providerFetch` (not `credentialStatus`/`useCredential`) → Evidence: [report.md#s5](report.md)
- [x] `ai-capex-strategy-lab.html` / `etf-momentum-lab.html` prepped `providerFetch` calls now functional → Evidence: [report.md#s5](report.md)
- [x] Docs updated (`.github/copilot-instructions.md`, `notes/shared-data-layer.md`) → Evidence: [report.md#s5](report.md)
- [x] Settings CSS for `.settings-proxy`/`.settings-key` → Evidence: [report.md#s5](report.md)
