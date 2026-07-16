# Scope 13: Accepted Export And Feature 002 Owner Read

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `integration:true`, `feature-002:true`, `registry:true`, `shared-infrastructure:true`, `ui:true`

**Depends On:** Scope 12 - Degraded And Unchanged Brief History

**Primary Outcome:** Export, browser compatibility read, committed `FundamentalsToolRead/v1`, and Feature 002 consume one accepted publication without recomputation or clock collapse; only after that boundary is proven does one additive registry transaction expose the route.

## Requirement Coverage

- **Functional:** FR-010-093 through FR-010-097 and FR-010-103.
- **Non-functional:** no new NFR ownership; this scope integrates the security, determinism, accessibility, and source-clock contracts already assigned to prior scopes.
- **Primary scenario:** SCN-010-030.

## Gherkin Scenarios

### SCN-010-030 - Feature 002 Boundary

```gherkin
Scenario: Feature 002 consumes a committed fundamentals owner read once
  Given the frozen registry selects company-fundamentals-owner-v1 and its committed owner-read manifest
  When Feature 002 builds ToolModelRead/v1 and the final Market Brief consumes it
  Then statement, model, company-brief, and market cutoffs equal the owner records and limitations remain intact
  And no Feature 002 function recomputes facts, changes archetype, applies proposals, or promotes price movement to fresh fundamentals
```

## UI Scenario Matrix

| Journey | Preconditions | Steps | Exact user-visible result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-010-030 owner-read consumption | Valid committed owner-read manifest and frozen Feature 002 registry | Run Feature 002 adapter; open Market Brief owner summary and deep link | Four clocks, status, limitations, conflicts, watch/invalidation match owner object; no recomputation/application | e2e-ui |
| Accepted export | One accepted company/publication/scenario/brief/market state | Export from Simple and Detailed without refresh | Export refs/values/classes/formulas/cutoffs/conflicts/unavailable state match on-screen generation exactly | e2e-ui |
| Atomic discovery | Direct route, owner read, adapter, and all focused tests valid | Open landing page/nav/direct route | One matching tool ID/route/config/note entry appears in each registry; existing entries/order remain intact | e2e-ui |

## Implementation Plan

1. Implement `buildAcceptedExport(state)` with exact company identity, periods, source lineage/clocks, actual/estimate/model classes, accepted assumptions, formulas, brief cutoff, conflicts/unavailable states, and export time. It performs no network request or alternate computation.
2. Implement `buildFundamentalsToolRead(state)` and committed per-company owner-read manifest. Include separate statement/model/brief/market cutoffs, coverage, direction, resilience, changes, pending/decided proposals, catalysts, risks, conflicts, confidence, horizon, watch, invalidation, deep links, limitations, and semantic fingerprint.
3. Project a strict browser compatibility `rl-tool-read/v1` through existing `RLDATA.putToolRead` only after accepted render. It is local compatibility, never scheduled authority, and cannot expose credentials/private scenarios/restricted text.
4. Add `company-fundamentals-owner-v1` to Feature 002's registry/read adapter. The adapter freezes committed owner refs for configured `briefSubjects`, emits bounded `ToolModelRead/v1`, preserves inner clocks/status/limitations, and cannot invoke company formulas, apply proposals, select archetypes, or read browser storage.
5. Extend `scripts/brief-refresh.mjs` only with the marker-bounded owner-read adapter and validation path. Market Brief may summarize owner interpretation/disagreement but cannot promote market movement to fresh fundamentals.
6. Add `notes/company-fundamentals-lab.md` with exact implemented contracts, source boundary, config, validation, user-state, accessibility, Feature 002, and rollback behavior. Delivery claims must match executed runtime evidence.
7. After direct route, export, owner-read, Feature 002, and browser tests are green, add one exact matching entry to `tools.json`, `index.html`, and `rlnav.js`. Preserve every existing entry/order/behavior and keep provider settings on `index.html#data-settings`.

## Consumer Impact Sweep

| Consumer / surface | Required change or proof | Stale-reference / regression check |
| --- | --- | --- |
| `FundamentalsToolRead/v1` manifest | One ref/fingerprint per configured canary and exact owner clocks/status | Validator recomputes projection and compares immutable refs/values |
| Feature 002 registry/read adapter | One `static-model` source with `company-fundamentals-owner-v1` and no recomputation | `tests/distributed-briefs.contract.mjs` plus adapter source scan |
| `scripts/brief-refresh.mjs` | Marker-bounded owner read consumed once | Existing owner-read/no-action/session-date/atomicity tests plus Feature 010 boundary test |
| `RLDATA.putToolRead` | Compact compatibility projection only | Existing provider/cache/tool-read selftests and browser suite |
| `tools.json` | One unique tool ID/route/config/note/tags/order entry | JSON parse, unique ID/route, cross-registry parity |
| `index.html` | One matching launcher entry and working route | Landing navigation and data-settings anchor regression |
| `rlnav.js` | One matching navigation entry | Representative existing routes, order/current-tool/focus/Escape regression |
| Deep links/export | Bounded same-company current/brief/source/model targets | Invalid/cross-company ref rejection, current/historical focus, exported generation parity |
| `notes/company-fundamentals-lab.md` | Exact implemented method/boundary/commands | Path/contract/command resolution and no overclaim scan |

## Shared Infrastructure Impact Sweep

| High-fan-out surface | Protected behavior | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| `scripts/brief-refresh.mjs` | Existing owner reads, snapshots, no-action/history, session-date and atomicity behavior | `tests/distributed-briefs.contract.mjs`, `tests/brief-refresh-atomicity.test.mjs`, and `tests/market-brief-session-date-drift.spec.mjs` | Exact `company-fundamentals-owner-v1` marker only |
| `tools.json` / `index.html` / `rlnav.js` | Existing IDs/routes/order/navigation/settings anchor | Full selftest plus representative existing tool navigation before/after | Exact Feature 010 additive entries only |
| `scripts/selftest.mjs` | Existing checks/order/summary/exit | Complete selftest before/after exact registry/Feature 002 group | Exact Feature 010 marker only |
| `RLDATA` consumer path | Existing market caches/provider policy/tool reads | Provider credential unit/functional/browser suites and existing tool-read groups | Scope-owned call site only; no `rldata.js` edit |

## Change Boundary And Rollback

**Allowed:** accepted export/read projections, Feature 010 owner-read manifest, marker-bounded Feature 002 adapter in `scripts/brief-refresh.mjs`, exact additive registry/nav/landing/selftest entries, methodology note, and scope-owned tests.

**Excluded:** company fact/model recomputation inside Feature 002, `rldata.js`/`rlapp.js` edits, existing registry reordering/reformatting, Market Brief hand-authored duplicate company math, provider eligibility, Feature 009 assumptions, package/lock/source settings, and framework-managed files.

**Rollback:** remove only the Feature 010 registry/nav/landing/note/selftest entries and disable/remove only `company-fundamentals-owner-v1`. Existing company publications/owner reads/history remain valid and directly reachable; prior Market Brief artifacts are never rewritten.

## Scenario-First Red/Green Contract

Author export-generation identity, owner-read projection parity, no-recompute source scan, four-clock/status/limitation preservation, deep-link focus, registry parity, and existing-consumer canaries before shared edits. Registry edits occur only after the direct unregistered route and owner adapter are green.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-13-01 | Owner-read integration | integration | SCN-010-030 | `tests/company-fundamentals-feature002.integration.mjs` | Build export/read from accepted objects, adapt once to ToolModelRead, preserve four clocks/status/limitations, and reject recomputation/application | `node --test tests/company-fundamentals-feature002.integration.mjs` | Yes |
| TP-13-02 | Existing Feature 002 contract | functional | SCN-010-030 | `tests/distributed-briefs.contract.mjs` | Preserve every existing owner-read and final aggregation contract after the additive Feature 010 adapter | `node --test tests/distributed-briefs.contract.mjs` | No |
| TP-13-03 | Regression E2E | e2e-ui | SCN-010-030 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-030 Feature 002 preserves owner clocks limitations and non recomputation boundary` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-030 Feature 002 preserves owner clocks limitations and non recomputation boundary" --reporter=list` | Yes |
| TP-13-04 | Export/deep-link Regression E2E | e2e-ui | SCN-010-030 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-030 export and owner deep links match the accepted publication without hidden refresh` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-030 export and owner deep links match the accepted publication without hidden refresh" --reporter=list` | Yes |
| TP-13-05 | Registry/shared canary | functional | SCN-010-030 | `scripts/selftest.mjs` | Existing checks plus unique route/config/note/nav parity, owner adapter mapping, and no-recompute/no-private-field contracts | `node scripts/selftest.mjs` | No |
| TP-13-06 | Existing shared-consumer Regression E2E | e2e-ui | SCN-010-030 | `tests/provider-credentials.spec.mjs`, `tests/causal-rotation-lab.spec.mjs`, `tests/bond-regime-lab.spec.mjs`, `tests/fx-regime-relative-value-lab.spec.mjs`, `tests/palm-springs-rental-market-lab.spec.mjs`, `tests/trend-dynamics-cycle-lab.spec.mjs`, `tests/technical-analysis-decision-lab.spec.mjs` | Preserve provider credentials, Causal, Bond, FX, Palm Springs, Trend Dynamics, and Technical Analysis behavior after registry/nav/brief additions | `npx --no-install playwright test tests/provider-credentials.spec.mjs tests/causal-rotation-lab.spec.mjs tests/bond-regime-lab.spec.mjs tests/fx-regime-relative-value-lab.spec.mjs tests/palm-springs-rental-market-lab.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-093 through FR-010-097 and FR-010-103 are implemented through one accepted export/read generation, strict owner authority, and educational non-action boundaries.
- [ ] SCN-010-030 proves Feature 002 consumes one committed owner read without recomputation, proposal application, archetype change, or clock/status upgrade.
- [ ] Consumer and Shared Infrastructure Impact Sweeps prove zero stale/duplicate/mismatched references and preserve every existing registry/nav/brief/RLDATA consumer.
- [ ] Registry participation is one atomic additive transaction after direct route/export/owner adapter validation.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 13 behavior.

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [ ] TP-13-01 integration evidence proves export/read projection parity and Feature 002 non-recomputation.
- [ ] TP-13-02 functional evidence preserves all existing distributed-brief contracts.
- [ ] TP-13-03 Regression E2E evidence proves SCN-010-030 owner boundary.
- [ ] TP-13-04 export/deep-link E2E evidence proves accepted-generation parity and no hidden refresh.
- [ ] TP-13-05 selftest evidence proves registry/nav/note/adapter parity and preserves existing checks.
- [ ] TP-13-06 existing-consumer E2E evidence proves all named shared routes remain green.

#### Build Quality Gate

- [ ] Exact RED/GREEN ledger, Consumer/Shared Impact Sweeps, export/read byte/ref parity, no-recompute/no-private-field/no-advice scans, registry/nav/note/route parity, existing brief/atomicity/session-date/provider canaries, editor diagnostics, `git diff --check`, selftest, validator, artifact lint, G094 capability check, framework write guard, repository readiness, and changed-path classification are current and every finding is individually accounted for in `report.md`.
