# Scopes: BUG-002 Two-Tier Provider Access

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md)

## SCOPE-01 — Two-tier data layer (rldata.js)

**Status:** Done

Registry, `rlProviderConfig` store, proxy probe/resolver, `providerFetch`
transport, proxy-aware Yahoo routing; old BUG-001 credential API removed.

**Test Plan**

| Test Type | Category | File | Command | Live |
|---|---|---|---|---|
| Unit | unit | scripts/selftest.mjs (RLDATA group) | `node scripts/selftest.mjs` | No |
| Unit | unit | tests/provider-credentials.unit.mjs | `node --test tests/provider-credentials.unit.mjs` | No |

**DoD**

- [x] `PROVIDERS` registry + `rlProviderConfig` store implemented → Evidence: [report.md#s1](report.md)
- [x] `probeProxy`/`activeTier`/`providerFetch` implemented; fail-closed `PROVIDER_KEY_MISSING` → Evidence: [report.md#s1](report.md)
- [x] Old credential API removed (0 refs) → Evidence: [report.md#s1](report.md)
- [x] `node scripts/selftest.mjs` green (674/0) → Evidence: [report.md#s3](report.md)

## SCOPE-02 — Settings editor (rlapp.js)

**Status:** Done

Proxy-URL field, per-provider masked key inputs, tier status, recheck,
force-local, clear-all.

**DoD**

- [x] Editor renders on `index.html#data-settings` with proxy + key inputs → Evidence: [report.md#s2](report.md)
- [x] `credentialApi()` guards on the new API; syntax clean → Evidence: [report.md#s2](report.md)

## SCOPE-03 — Regression suite + selftest reconciliation

**Status:** Done

Rewrite the BUG-001 regression suite to the new two-tier invariants.

**Test Plan**

| Test Type | Category | File | Command |
|---|---|---|---|
| Unit | unit | tests/provider-credentials.unit.mjs | `node --test tests/provider-credentials.unit.mjs` |
| Functional | functional | tests/provider-credentials.functional.mjs | `node --test tests/provider-credentials.functional.mjs` |
| Load | load | tests/provider-credentials.load.mjs | `node --test tests/provider-credentials.load.mjs` |
| E2E UI | e2e-ui | tests/provider-credentials.spec.mjs | `npx playwright test tests/provider-credentials.spec.mjs` |
| Stress | stress | tests/provider-credentials.stress.mjs | `node --test tests/provider-credentials.stress.mjs` |

**DoD**

- [x] `provider-credentials.{unit,functional,load,stress}.mjs` rewritten to the two-tier model and passing → Evidence: [report.md#s3](report.md)
- [x] `provider-credentials.spec.mjs` (Playwright) rewritten and passing → Evidence: [report.md#s3](report.md)
- [x] `distributed-briefs-owner-canary.mjs`, `msft-july-market-refresh.spec.mjs`, `technical-analysis-decision-lab.spec.mjs` reconciled → Evidence: [report.md#s3](report.md)
- [x] `node scripts/selftest.mjs` remains green → Evidence: [report.md#s3](report.md)

## SCOPE-04 — Server side (knb proxy) + deploy

**Status:** Done (cross-repo, knb)

**DoD**

- [x] `knb/shared/research-lab-proxy` authored, lint + contract clean → Evidence: [report.md#s4](report.md)
- [x] Deployed to evo-x2; live at the tailnet HTTPS edge; 5/5 client checks incl. real Yahoo passthrough → Evidence: [report.md#s4](report.md)

## SCOPE-05 — Tool-page rewire + docs

**Status:** Done

**DoD**

- [x] `msft-july-print-model.html` uses `providerFetch` (not `credentialStatus`/`useCredential`) → Evidence: [report.md#s5](report.md)
- [x] `ai-capex-strategy-lab.html` / `etf-momentum-lab.html` prepped `providerFetch` calls now functional → Evidence: [report.md#s5](report.md)
- [x] Docs updated (`.github/copilot-instructions.md`, `notes/shared-data-layer.md`) → Evidence: [report.md#s5](report.md)
- [x] Settings CSS for `.settings-proxy`/`.settings-key` → Evidence: [report.md#s5](report.md)
