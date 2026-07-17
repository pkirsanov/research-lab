# Feature 010 Execution Report — Company Fundamentals And Adaptive Brief Lab

Links: [scopes.md](scopes.md) | [spec.md](spec.md) | [design.md](design.md) | [uservalidation.md](uservalidation.md) | [scenario-manifest.json](scenario-manifest.json) | [test-plan.json](test-plan.json)

This is the single-file execution report for the seven-scope plan. Each scope records its execution evidence in this file under a scope section and per-`TP` / per-scenario anchors when it runs. Planning is complete; Scope 1 has executed with all its Definition-of-Done items checked and evidence recorded below, and Scopes 2 through 7 have not yet executed.

## Summary

`bubbles.plan` (mode: replace) re-decomposed Increment A of the single-file plan into four vertical executable slices, producing a seven-scope plan across three vertical delivery increments:

- **Increment A** — Scope 1 (MSFT Source-Qualified Facts, Periods, Reconciliation & Statement Integrity), Scope 2 (MSFT Derived Metrics, Contextual Resilience Diagnostics, Capital Allocation & Trustworthy Simple Cockpit), Scope 3 (MSFT Linked Model & User-Owned Accepted State), and Scope 4 (MSFT Detailed Workspaces, Peers, Export, Tool Read, Registry & Regression).
- **Increment B** — Scope 5 (Dynamic Adaptive Company Brief And Feature 002 Consume-Once).
- **Increment C** — Scope 6 (CMG And JPM Source-Qualified Overlays) and Scope 7 (Real Canary Acquisition, Cross-Capability Regression, Accessibility, And Static-Site Hardening).

The untracked Feature 010 materialization is a **foundation skeleton**, not a finished tool: Increment A is a large net-new build. The plan references the existing files (`company-fundamentals-lab.html`, `company-fundamentals.config.json`, `rlcompany.js`, `scripts/validate-company-fundamentals.mjs`, `data/company-fundamentals/**`, `tests/company-fundamentals-contracts.unit.mjs`, `tests/company-fundamentals-lab.spec.mjs`, and the marker-bounded Feature 010 block in `scripts/selftest.mjs`) and states per slice what is reused (validators, canonicalize/sha256, `validatePublicationGraph`, `propagateDependencyStates`, `loadCompanyPublication`, the identity-only MSFT publication) versus net-new (the reconciliation/integrity/metric/diagnostic/model/reducer/peers/export/tool-read helpers, config mappings/formulas/archetypes/peers, the enriched multi-fact dossier, and the full Simple+Detailed UI/registry). All thirty-two SCN-010 scenario contracts are preserved and each maps to exactly one active slice; none were invalidated or dropped. The retired plan's Scope 01 implement/test raw evidence is preserved unchanged under [scopes/01-contract-config-validator-publication-foundation/report.md](scopes/01-contract-config-validator-publication-foundation/report.md).

Current feature status: `in_progress`. Scopes 1 and 2 (Increment A) are complete; next required owner: `bubbles.implement` for Scope 3.

## Test Evidence

Scope 1 has executed and its evidence is recorded below. This section is populated per scope and per `TP` row during implementation and testing. Evidence is recorded with the exact command, exit code, and at least ten lines of raw output, per the execution-evidence standard. Scopes 2 through 7 have not yet executed, so no result is claimed for them.

- Scope 1 — MSFT Source-Qualified Facts, Periods, Reconciliation & Statement Integrity: **complete — all six Test Plan rows green and independently verified** (see [Scope 1 Execution](#scope-1-execution)).
- Scope 2 — MSFT Derived Metrics, Contextual Resilience Diagnostics, Capital Allocation & Trustworthy Simple Cockpit: **complete — all seven Test Plan rows green and shared facts proven byte-stable** (see [Scope 2 Execution](#scope-2-execution)).
- Scope 3 — MSFT Linked Model & User-Owned Accepted State: pending (TP-3-01 … TP-3-06).
- Scope 4 — MSFT Detailed Workspaces, Peers, Export, Tool Read, Registry & Regression: pending (TP-4-01 … TP-4-06).
- Scope 5 — Dynamic Adaptive Company Brief And Feature 002 Consume-Once: pending (TP-5-01 … TP-5-07).
- Scope 6 — CMG And JPM Source-Qualified Overlays: pending (TP-6-01 … TP-6-06).
- Scope 7 — Real Canary Acquisition, Cross-Capability Regression, Accessibility, And Static-Site Hardening: pending (TP-7-01 … TP-7-06).

## Scope 1 Execution

**Status:** Done — all six Test Plan rows executed green and independently verified via resolved TR-F010-SCOPE01-TEST-OWNERSHIP-01. Feature-level certification is not yet claimed (Scopes 2–7 remain).

### Files created / modified (Scope 1)

- `rlcompany.js` — added net-new production helpers `classifyReportingPeriod`, `reconcileFactObservations`, `evaluateStatementIntegrity`; added the closed error code `C010-INTEGRITY-BALANCE-SHEET`; exported all three helpers.
- `company-fundamentals.config.json` — populated the six MSFT concept `mappings` (revenue, net-income, total-assets, total-liabilities, stockholders-equity, operating-cash-flow) as us-gaap concept→normalized-concept definitions; this changed the config fingerprint to `sha256:e852b328e576f63638be68c6b4791e00178903b114f64ca6d1d7db7ece6a7dcb`.
- `scripts/validate-company-fundamentals.mjs` — added a deterministic, no-network `--rebuild-from-retained` mode that materializes the fingerprint-bound multi-period publication from the retained SEC Submissions bytes; added SCN-010-004/005/006/025 assertions to the default validation path.
- `data/company-fundamentals/**` — regenerated the content-addressed MSFT publication (11 reachable objects, new manifest `sha256:8d8f23bf35ab1dc7a3066291ca4ac64ff5ddc63141e2ddfac36cb2b6ad9c3475`) with four real reporting periods (quarter/annual/year-to-date/instant) derived from retained SEC filing metadata; `modelPackRef` and `briefRef` remain `null`.
- `tests/company-fundamentals-contracts.unit.mjs` — updated the two config-fingerprint literals to the regenerated value and added three TP-1-01 cases exercising the production helpers over the real periods and constructed contract fixtures.
- `scripts/selftest.mjs` — additive Feature 010 block only (single 70-line additive hunk, zero removals): three assertions for period classification, reconciliation, and statement integrity.
- `company-fundamentals-lab.html` — added a "Reporting periods" band (real classified periods) and a "Statement integrity" band with a clearly-labeled contract-demonstration table driven by the production guards; script count unchanged at 7; no credential field.
- `tests/company-fundamentals-lab.spec.mjs` — added the four Scope 1 regression scenarios (SCN-010-004/005/006/025) with the exact persistent titles; preserved the existing SCN-010-026 and SCN-010-029 tests.

### Provenance and anti-fabrication note

The retained source bytes are SEC **Submissions** only (identity + real filing metadata: real 10-K/10-Q accessions, report dates, forms). They contain **no** financial statement values (those live in SEC Company Facts, which is not retained). No MSFT statement value was invented. The four reporting periods are derived from real SEC filing dates (e.g. quarter `period-msft-fy2026-q3` accession `0001193125-26-191507`, annual `period-msft-fy2025-annual` form `10-K`). The reconciliation/restatement/conflict/imbalance scenarios (SCN-010-005/006/025) are exercised as **constructed contract fixtures** — exactly as the scenario text specifies ("a copied accepted SEC fact set is changed", "the later accession proves an amendment relation", "materially disagree") — clearly labeled in the UI as "not MSFT-reported values". Revenue and statement facts remain honestly `unavailable` in the accepted MSFT publication (SCN-010-026).

### Scenario evidence map

- <a id="scenario-scn-010-004"></a>**SCN-010-004** — period classification proven by TP-1-01 (unit), TP-1-02 (selftest), TP-1-03 (validator `SCN-010-004: reporting period classification valid`), and TP-1-04 (browser: four classified period rows, YTD/instant `standalone quarter = No`).
- <a id="scenario-scn-010-005"></a>**SCN-010-005** — balance-sheet imbalance emits `C010-INTEGRITY-BALANCE-SHEET` with input refs, difference `150000000000`, and allowed interval `1500000`; dependent conclusions blocked while source facts stay inspectable. Proven by TP-1-01, TP-1-02, TP-1-03, TP-1-04.
- <a id="scenario-scn-010-006"></a>**SCN-010-006** — amendment reconciliation sets `resolutionState=restated`, `currentObservationId=obs-assets-amended`, both IDs in lineage. Proven by TP-1-01, TP-1-02, TP-1-03, TP-1-04.
- <a id="scenario-scn-010-025"></a>**SCN-010-025** — genuine disagreement stays `conflicted`, `currentObservationId=null`, `averaged=false`, both observations visible. Proven by TP-1-01, TP-1-02, TP-1-03, TP-1-05.
- <a id="scenario-scn-010-026"></a>**SCN-010-026** — missing revenue remains `unavailable`; only dependency-reachable outputs are withheld while independent identity stays usable. Proven by TP-1-01, TP-1-02, TP-1-03, TP-1-05.

### TP-1-01 — `node --test tests/company-fundamentals-contracts.unit.mjs` (exit 0)

```
✔ Scope 01 config declares every policy and fails loud on version or reference drift
✔ exact recorded source publication validates and binds the retained response bytes
✔ fixture projection withholds only revenue-dependent outputs and resolves its exact claim trace
✔ SCN-010-026 missing facts withhold only dependency-reachable outputs
✔ SCN-010-029 material claims resolve the complete source and consumer chain
✔ TP-1-01 SCN-010-004 reporting periods classify exact meaning and never show YTD or instant as a standalone quarter
✔ TP-1-01 SCN-010-006 and SCN-010-025 reconciliation restates amendments and keeps genuine conflicts visible without averaging
✔ TP-1-01 SCN-010-005 and SCN-010-026 statement integrity fires balance-sheet imbalance and passes clean statements while keeping source facts inspectable
ℹ tests 14
ℹ pass 14
ℹ fail 0
ℹ skipped 0
```

### TP-1-02 — `node scripts/selftest.mjs` (exit 0)

```
Feature 010 Scope 1 company publication foundation
  ✓ Feature 010 production config validates and binds to the publication fingerprint
  ✓ Feature 010 current pointer selects the content-addressed production manifest
  ✓ Feature 010 accepted identity and period derive from production-normalized source bytes
  ✓ Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  ✓ Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field
  ✓ Feature 010 validator executes exact-capture parsing config graph projection and trace functions
  ✓ Feature 010 reporting periods classify annual quarter YTD and instant and never show YTD or instant as a standalone quarter
  ✓ Feature 010 reconciliation restates amendments and keeps genuine conflicts visible without averaging
  ✓ Feature 010 statement integrity blocks a balance-sheet imbalance while keeping source facts inspectable and passes a clean statement
================================================
Research-Lab self-test: 511 passed, 0 failed
================================================
```

### TP-1-03 — `node scripts/validate-company-fundamentals.mjs` (exit 0)

```
[company-fundamentals] config: contract valid
[company-fundamentals] manifest: pointer hash and config fingerprint valid
[company-fundamentals] objects: 11 reachable immutable objects hash-valid
[company-fundamentals] publication: complete graph valid
[company-fundamentals] publication: canonical manifest hash valid
[company-fundamentals] accepted state: source identity and period preserved
[company-fundamentals] SCN-010-026: dependency withholding valid
[company-fundamentals] SCN-010-029: source trace valid
[company-fundamentals] SCN-010-004: reporting period classification valid
[company-fundamentals] SCN-010-006 and SCN-010-025: reconciliation restatement and conflict lineage valid
[company-fundamentals] SCN-010-005: statement integrity blocks imbalance and keeps source facts inspectable
[company-fundamentals] source capture: exact raw SEC response bytes retained
[company-fundamentals] validation: PASS
```

Regeneration is deterministic and idempotent: `node scripts/validate-company-fundamentals.mjs --rebuild-from-retained` run twice produces the identical manifest hash `sha256:8d8f23bf…` with `obsolete objects removed: 0` on the second run.

### TP-1-04 — `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-004|SCN-010-005|SCN-010-006" --reporter=list` (exit 0)

```
Running 3 tests using 1 worker
  ✓  1 … quarterly YTD and instant history preserve exact period meaning (823ms)
  ✓  2 …ce blocks clean dependent conclusions and preserves source facts (212ms)
  ✓  3 …acts become current while original observations remain auditable (196ms)
  3 passed (2.3s)
```

### TP-1-05 — `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-025|SCN-010-026" --reporter=list` (exit 0)

```
Running 2 tests using 1 worker
  ✓  1 … concepts remain unavailable while independent facts stay usable (298ms)
  ✓  2 …5 conflicting sources remain visible and never become an average (187ms)
  2 passed (1.0s)
```

### TP-1-06 — `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` (exit 0)

```
Running 6 tests using 1 worker
  ✓  1 … concepts remain unavailable while independent facts stay usable (603ms)
  ✓  2 … claim reaches its exact source transformation and consumer chain (1.1s)
  ✓  3 … quarterly YTD and instant history preserve exact period meaning (200ms)
  ✓  4 …ce blocks clean dependent conclusions and preserves source facts (206ms)
  ✓  5 …acts become current while original observations remain auditable (193ms)
  ✓  6 …5 conflicting sources remain visible and never become an average (196ms)
  6 passed (4.0s)
```

### Build quality

- `git diff --check` on all Scope 1 files: exit 0 (no whitespace or conflict-marker errors).
- Change boundary respected: only `rlcompany.js`, `company-fundamentals.config.json`, `company-fundamentals-lab.html`, `scripts/validate-company-fundamentals.mjs`, `data/company-fundamentals/**`, the two scope-owned test files, and the additive Feature 010 block in `scripts/selftest.mjs` were changed. No excluded family (`rldata.js`, `rlapp.js`, `tools.json`, `index.html`, `rlnav.js`, `scripts/brief-refresh.mjs`, Market Brief artifacts) was touched, and all unrelated dirty work (specs/004, BUG-002/003, brief-refresh test support) is preserved.

## Scope 2 Execution

**Status:** Done — all seven Test Plan rows (TP-2-01 through TP-2-07) executed green with scenario-first RED/GREEN evidence; shared facts proven byte-stable; feature-level certification is not yet claimed (Scopes 3–7 remain).

### Files created / modified (Scope 2)

- `rlcompany.js` — added net-new production helpers `evaluateDerivedMetric` (transparent metric: exposes formula, ordered inputs, and qualifications; no universal score), `evaluateDiagnostic` (raw record renders before any evidenced contextual adjustment; an omitted concept with no eligible observation is `absent-from-eligible-source`, never zero or pass; capital-allocation interpretation cites net share change and dilution and keeps gross repurchase and treasury balance distinct from period flows), and `resolveArchetypeView`; extended `selectSimpleView` with an optional archetype context that reorders KPI drivers and adds four separated clocks without mutating shared facts; extended `validateConfiguredArchetypeDefinition` to carry ordered `kpiPriorities` and `diagnosticPolicies`; exported the three new helpers.
- `company-fundamentals.config.json` — populated `formulas` (`formula-cash-conversion`, `formula-operating-margin`, both referencing existing MSFT mappings) and `archetypes` (definition `archetype-software-platform` with seven ordered `kpiPriorities` and two `diagnosticPolicies`, plus the accepted MSFT assignment); this changed the config fingerprint from `sha256:e852b328…` to `sha256:f7b5851d1b0c540f32f5a3a89a449122dceb8275aecba843bac8225c36f3b477`.
- `scripts/validate-company-fundamentals.mjs` — added SCN-010-001/008/009 (archetype prioritization + separated clocks + shared-fact byte stability) and SCN-010-010/011/012 (raw-before-contextual diagnostic, absent preferred stock, capital-allocation) assertions to the default validation path over the regenerated publication.
- `data/company-fundamentals/**` — regenerated the fingerprint-bound publication via the deterministic `--rebuild-from-retained` mode; the new manifest is `sha256:ba7b3adf05267eaa3689f7c7b8c92c7d3617919262b8eb2a171cc3c486323100`. **No shared-fact object changed**: the `identity`, `summary`, `dossier`, `ownerRead`, `source`, and `history` object refs are byte-identical to the pre-Scope-2 publication; only the manifest re-hashed for the new config fingerprint.
- `tests/company-fundamentals-contracts.unit.mjs` — added eight TP-2-01 cases exercising the production `evaluateDerivedMetric`, `evaluateDiagnostic`, `resolveArchetypeView`, and archetype-prioritized `selectSimpleView` over constructed contract fixtures and the real accepted state; updated the two config-fingerprint literals to the regenerated value and evolved the config-schema archetype sample to the extended KPI/diagnostic shape (a legitimate schema evolution owned by this slice).
- `scripts/selftest.mjs` — additive Feature 010 Scope 2 marker-bounded group only (`/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE2-BEGIN/END */`, ten checks); the Scope 1 marker block is byte-unchanged; total rose from 511 to 521.
- `company-fundamentals-lab.html` — extended the Simple cockpit with the archetype-prioritized driver list, four separated statement/model/brief/market clocks, a raw-beside-contextual resilience diagnostics band (constructed fixtures clearly labeled "not MSFT-reported values"), an unclassified-lens demonstration, and an optional market-enrichment path that preserves the accepted dossier with no credential field; fetches the same-origin config for the archetype overlay; script count unchanged at 7.
- `tests/company-fundamentals-lab.spec.mjs` — added the seven Scope 2 regression scenarios (SCN-010-010/011/012/001/008/009/027) with the exact persistent titles; preserved the six Scope 1 tests.

### Provenance and anti-fabrication note

No MSFT financial statement value was invented. The retained source bytes remain SEC **Submissions** only (identity + real filing metadata); SEC Company Facts is still not retained, so every software KPI (cloud, backlog, capex, depreciation, margin, cash-conversion, dilution) renders honestly `Unavailable` with an explicit SEC Company Facts evidence requirement. The derived-metric, diagnostic (interest coverage, preferred stock), and capital-allocation demonstrations are **constructed contract fixtures** — exactly as the scenario text specifies ("a DiagnosticCheck has valid raw inputs", "a publication contains gross repurchases…") — clearly labeled in the UI as "not MSFT-reported values". The archetype overlay prioritizes KPI *concepts* (config-defined) and never fabricates a value. Shared facts stayed byte-identical (proof below). No universal score and no credential field exist anywhere (scans below). The tests exercise the production `rlcompany.js` functions and the real browser route, not re-implementations.

### Scenario evidence map

- <a id="scenario-scn-010-001"></a>**SCN-010-001** — Microsoft opens with a company-specific Simple read: the software-platform archetype orders cloud→backlog→capex→depreciation→operating-margin→cash-conversion→dilution, each honestly `Unavailable`, and the statement/model/brief/market clocks stay separate and equal the owner objects. Proven by TP-2-01 (unit), TP-2-02 (selftest), TP-2-03 (validator `SCN-010-001/008/009` line), TP-2-05 (browser).
- <a id="scenario-scn-010-008"></a>**SCN-010-008** — archetypes change KPI priority without changing shared facts: `JSON.stringify(accepted)` unchanged, and identity/evidenceCoverage/claims/dependencyResults are byte-equal across the software and a second constructed archetype. Proven by TP-2-01, TP-2-02, TP-2-03, TP-2-05.
- <a id="scenario-scn-010-009"></a>**SCN-010-009** — an unclassified company keeps shared statements and trace but inherits no lens; KPI priorities and diagnostics are unavailable with evidence requirements. Proven by TP-2-01, TP-2-02, TP-2-03, TP-2-05.
- <a id="scenario-scn-010-010"></a>**SCN-010-010** — a diagnostic renders raw value/formula/threshold/input-refs/period before its evidenced contextual adjustment (amount/rationale/sourceRefs/sensitivity/applicability), DOM order raw-before-contextual. Proven by TP-2-01, TP-2-02, TP-2-03, TP-2-04.
- <a id="scenario-scn-010-011"></a>**SCN-010-011** — an omitted preferred-stock concept with no eligible observation is `absent-from-eligible-source`, never a numeric zero, positive interpretation, or summary pass. Proven by TP-2-01, TP-2-02, TP-2-03, TP-2-04.
- <a id="scenario-scn-010-012"></a>**SCN-010-012** — buyback interpretation cites net share change (`10000000`) and dilution, keeps gross repurchase (period-flow) distinct from treasury balance, and never treats repurchase existence as beneficial. Proven by TP-2-01, TP-2-02, TP-2-03, TP-2-04.
- <a id="scenario-scn-010-027"></a>**SCN-010-027** — an unavailable optional market enrichment preserves the accepted dossier and marks only the market class unavailable, with no credential field, no synthetic value, and no external or failed request. Proven by TP-2-06 (browser) and the cockpit resilient path.

### Scenario-first RED → GREEN ledger

| Behavior | RED (before implementation) | GREEN (after implementation) |
| --- | --- | --- |
| TP-2-01 production helpers | `node --test …unit.mjs` → 14 pass / **8 fail** (`company.evaluateDiagnostic is not a function`) | same command → **22 pass / 0 fail** |
| TP-2-03 fingerprint rebind | `node scripts/validate-company-fundamentals.mjs` → **FAIL `C010-CONFIG-VERSION`** (config fingerprint no longer matches manifest) | after `--rebuild-from-retained`, same command → **PASS** |
| TP-2-04/05/06/07 cockpit | 7 new browser tests → **7 failed** (`[data-diagnostic]`, `[data-kpi-priority]`, … not found) | full suite → **13 passed** |

### TP-2-01 — `node --test tests/company-fundamentals-contracts.unit.mjs` (exit 0)

```
✔ Scope 01 config declares every policy and fails loud on version or reference drift
✔ exact recorded source publication validates and binds the retained response bytes
✔ TP-2-01 SCN-010-010 evaluateDiagnostic renders the raw record before any evidenced contextual adjustment
✔ TP-2-01 SCN-010-011 omitted preferred stock is absent from the eligible source and never zero or pass
✔ TP-2-01 SCN-010-012 buyback interpretation cites net share change and dilution and keeps gross flows distinct
✔ TP-2-01 evaluateDerivedMetric exposes formula and inputs with qualifications and never emits a universal score
✔ TP-2-01 SCN-010-001 archetype-prioritized Simple view orders software drivers and keeps separate clocks
✔ TP-2-01 SCN-010-008 archetypes change KPI priority while shared financial facts stay byte-equivalent
✔ TP-2-01 SCN-010-009 an unclassified company keeps shared facts and inherits no default lens
✔ TP-2-01 populated Scope 2 config resolves an accepted archetype view and derived formulas
ℹ tests 22
ℹ pass 22
ℹ fail 0
ℹ skipped 0
```

### TP-2-02 — `node scripts/selftest.mjs` (exit 0)

```
Feature 010 Scope 2 derived metrics diagnostics and archetype-prioritized Simple cockpit
  ✓ Feature 010 Scope 2 archetype view orders MSFT software drivers with honest unavailable KPI evidence
  ✓ Feature 010 Scope 2 Simple cockpit keeps statement model brief and market clocks separate and equal to the owner objects
  ✓ Feature 010 Scope 2 archetype prioritization keeps shared facts byte-stable across archetypes
  ✓ Feature 010 Scope 2 unclassified Simple view inherits no lens and preserves shared facts
  ✓ Feature 010 Scope 2 diagnostic renders the raw record before the contextual adjustment with no universal score
  ✓ Feature 010 Scope 2 omitted preferred stock stays absent-from-eligible-source and never zero or pass
  ✓ Feature 010 Scope 2 buyback interpretation cites net share change and dilution and keeps gross flows distinct
  ✓ Feature 010 Scope 2 derived metric exposes its formula and inputs and never emits a universal score
  ✓ Feature 010 Scope 2 config binds formulas and the software-platform archetype to the regenerated publication fingerprint
  ✓ Feature 010 Scope 2 cockpit wires the archetype-prioritized Simple view over same-origin scripts with no credential field
================================================
Research-Lab self-test: 521 passed, 0 failed
================================================
```

### TP-2-03 — `node scripts/validate-company-fundamentals.mjs` (exit 0)

```
[company-fundamentals] config: contract valid
[company-fundamentals] manifest: pointer hash and config fingerprint valid
[company-fundamentals] objects: 11 reachable immutable objects hash-valid
[company-fundamentals] publication: complete graph valid
[company-fundamentals] accepted state: source identity and period preserved
[company-fundamentals] SCN-010-026: dependency withholding valid
[company-fundamentals] SCN-010-029: source trace valid
[company-fundamentals] SCN-010-004: reporting period classification valid
[company-fundamentals] SCN-010-006 and SCN-010-025: reconciliation restatement and conflict lineage valid
[company-fundamentals] SCN-010-005: statement integrity blocks imbalance and keeps source facts inspectable
[company-fundamentals] SCN-010-001/008/009: archetype prioritization orders KPIs, separates clocks, and keeps shared facts byte-stable
[company-fundamentals] SCN-010-010/011/012: diagnostics render raw-before-contextual, preferred stock stays absent, and buybacks cite net share change and dilution
[company-fundamentals] validation: PASS
```

Shared-fact byte-stability proof (old publication vs regenerated publication object refs):

```
SHARED-FACT OBJECT REF STABILITY (old publication vs regenerated publication):
  identityRef: IDENTICAL  sha256:c6eef0b86ecec2b1b0fef7679b72bd3cc72ab4af4f3bc09aad3a4a590a8aa710
  summaryRef: IDENTICAL  sha256:bfbf7a854297d41b88577076dfb45eea0c49279dd646855a3c1c19fcd57321fe
  dossierRef: IDENTICAL  sha256:ef8c5ffbf1e597e4256987646550368f72e46f40723a96ea8c57abdb258ec989
  ownerReadRef: IDENTICAL  sha256:bb6025d4b35ed0e2d98f45ae93ed5f0f1bc7cc001d3334dcb1853e2b9185bc24
  sourceRefs: IDENTICAL
  historyRefs: IDENTICAL
CONFIG FINGERPRINT REBOUND (expected to change):
  old: sha256:e852b328e576f63638be68c6b4791e00178903b114f64ca6d1d7db7ece6a7dcb
  new: sha256:f7b5851d1b0c540f32f5a3a89a449122dceb8275aecba843bac8225c36f3b477
  changed: true
```

### TP-2-04 — `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-010|SCN-010-011|SCN-010-012" --reporter=list` (exit 0)

```
Running 3 tests using 1 worker
  ✓  1 …d contextual diagnostics remain side by side with complete trace (606ms)
  ✓  2 …ted preferred stock is absent from source and never zero or pass (245ms)
  ✓  3 …k interpretation includes issuance dilution and net share change (206ms)
  3 passed (2.2s)
```

### TP-2-05 — `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-001|SCN-010-008|SCN-010-009" --reporter=list` (exit 0)

```
Running 3 tests using 1 worker
  ✓  1 …ioritizes sourced software drivers and preserves separate clocks (494ms)
  ✓  2 …ypes change KPI priority without changing shared financial facts (355ms)
  ✓  3 …sified companies retain shared facts and inherit no default lens (227ms)
  3 passed (2.0s)
```

### TP-2-06 — `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-027" --reporter=list` (exit 0)

```
Running 1 test using 1 worker
  ✓  1 …lure preserves the last valid dossier without credential prompts (643ms)
  1 passed (1.8s)
```

### TP-2-07 — `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` (exit 0)

```
Running 13 tests using 1 worker
  13 passed (6.3s)
```

The 13 cumulative browser tests are the six Scope 1 scenarios (SCN-010-004/005/006/025/026/029) plus the seven Scope 2 scenarios (SCN-010-001/008/009/010/011/012/027), all over the real ephemeral static server with no request interception.

### Build quality

- `git diff --check` on all Scope 2 files: exit 0 (no whitespace or conflict-marker errors).
- No-universal-score scan (`rlcompany.js`, cockpit, validator): the only matches are the anti-score comments and the negative assertions (`!hasOwnProperty('score')`, `!hasOwnProperty('universalScore')`) that prove no score field is emitted — there is no universal-score field anywhere.
- No-credential / no-private-data scan on the cockpit (`type="password"`, `name*=credential|token|secret`, `apikey`, `bearer`, `authorization`): grep exit 1 (zero matches) — clean.
- Selftest baseline parity: 511 → 521; the Scope 1 marker-bounded group is byte-unchanged; only the additive Scope 2 group was added.
- Editor diagnostics: clean on `rlcompany.js`, `company-fundamentals-lab.html`, and both scope-owned test files.
- Change boundary respected: only `rlcompany.js`, `company-fundamentals.config.json`, `company-fundamentals-lab.html`, `scripts/validate-company-fundamentals.mjs`, `data/company-fundamentals/**`, the two scope-owned test files, and the additive Feature 010 Scope 2 selftest block were changed. No excluded family (`rldata.js`, `rlapp.js`, `tools.json`, `index.html`, `rlnav.js`, `scripts/brief-refresh.mjs`, Market Brief artifacts) was touched, and all unrelated dirty work (specs/004, BUG-002/003, brief-refresh test support, feature-004 collision test) is preserved.
- Planning-artifact note (routed observation, non-blocking): `test-plan.json`'s per-scope `scopes[]` array still reflects the retired five-scope grouping — its own `planNote` declares this and states `scopes.md` is the authoritative, guard-validated Test Plan and that the machine-readable mirror MUST be regenerated to the seven-scope structure. The Scope 2 Test Plan in `scopes.md` (derived metrics/diagnostics/archetype/Simple cockpit, SCN-010-001/008/009/010/011/012/027) is authoritative and was honored exactly. Regenerating that mirror is `bubbles.plan`-owned; it is not guard-read and does not block Scope 2.

## Scope 3 Execution

**Status:** Done — all six Test Plan rows (TP-3-01 through TP-3-06) executed green with scenario-first RED/GREEN evidence; the regenerated fingerprint-bound publication now carries a non-null hash-valid `modelPackRef`; model-graph acyclicity, dependency-path reporting on invalid nodes, and append-only history immutability are proven; feature-level certification is not yet claimed (Scopes 4–7 remain).

### Files created / modified (Scope 3)

- `rlcompany.js` — added net-new production functions `evaluateModel` (recomputes only dependency-reachable statement/cash/balance/KPI/per-share/valuation nodes from one draft tuple, carries unreachable history verbatim, blocks cycles/non-finite/invalid-denominator branches with an explicit `dependencyPath`, and never mutates the baseline), `computeModelBaseline` (full-tuple node evaluation used to materialize the accepted scenario's published outputs), `reduceScenarioDraft` (a draft never changes the active revision), `reduceCompanySelection` (evidence refresh returns `rebased:false` and raises one pending `company-model-impact-proposal/v1` per affected driver), `reduceProposalDecision` (accept/edit-confirm create exactly one new immutable `company-scenario-revision/v1` whose `parentRevisionId` is the prior revision; reject creates zero), and `deriveForecastError` (comparable only when definition/unit/currency/period match, keeping estimate and reported classes/sources/clocks separate); added `validateConfiguredModel` and the `model` config group to `validateCompanyConfig`; recognized `company-model-pack/v1` as a generation object; and added `modelPack` + `manifestSha256` to `projectAcceptedPublication`. All new helpers are exported.
- `company-fundamentals.config.json` — added the `model` group: one accepted ordinary-company three-statement `definition` (nine drivers, sixteen nodes spanning all six node kinds) and one accepted `scenario` (`scenario-msft-base`, revision 4, nine assumptions). This changed the config fingerprint from `sha256:f7b5851d…` to `sha256:deacff12957dde150744e399a33b1b99c805667e7c77998707d7535e8e655c5a`.
- `scripts/validate-company-fundamentals.mjs` — extended the deterministic `--rebuild-from-retained` mode to materialize the `company-model-pack/v1` object from the accepted config model + scenario (baseline computed via `computeModelBaseline`), embed its ref inside `ownerRead`, set `manifest.modelPackRef`, and grow the publication from 11 to 12 immutable objects; added SCN-010-013/014/016/023 assertions to the default validation path (non-null hash-valid model pack, generation-bound, baseline recompute-from-one-generation, reachable/unreachable/dependency-path evaluation, no-rebase refresh + pending proposals, accept=one-revision/reject=zero, comparable-only forecast error, and drift rejection by the whole-publication hash guard).
- `data/company-fundamentals/**` — regenerated the fingerprint-bound publication; the new manifest is `sha256:03185c2baa6067a6ea3e488ac83602481cde27b43dab56782711b33b254e414a` and the model pack is `sha256:a605661add9ef26f4090dc322794b8d918df7451670e129acf4bc9b5e0d2b4ba`. Two obsolete objects (the prior manifest and prior owner-read) were removed; the identity/summary/dossier/source/history/period objects are byte-identical to the pre-Scope-3 publication.
- `tests/company-fundamentals-contracts.unit.mjs` — added nine TP-3-01 cases exercising production `evaluateModel`, `reduceScenarioDraft`, `reduceCompanySelection`, `reduceProposalDecision`, `deriveForecastError`, and the real regenerated model pack over constructed model fixtures and the published accepted scenario; updated the two config-fingerprint literals to the regenerated value and taught `loadMaterializedFixture` to enqueue `modelPackRef`.
- `scripts/selftest.mjs` — additive Feature 010 Scope 3 marker-bounded group only (`/* FEATURE-010-COMPANY-FUNDAMENTALS-SCOPE3-BEGIN/END */`, ten checks); the Scope 1 and Scope 2 marker blocks are byte-unchanged; total rose from 521 to 531.
- `company-fundamentals-lab.html` — added the "Linked model & accepted state" band with the accepted-scenario identity, the baseline outputs list, a valuation-only draft demo (reachable valuation nodes recompute; carried history unchanged), an invalid-driver draft demo (blocked `node-eps` with its dependency path), an actual-vs-estimate forecast demo, an evidence-refresh proposal demo, and a proposal-decision demo — all driven by the production `evaluateModel`/`reduce*`/`deriveForecastError` functions; script count unchanged at 7; no credential field.
- `tests/company-fundamentals-lab.spec.mjs` — added the four Scope 3 regression scenarios (SCN-010-014/016/013/023) with the exact persistent titles; preserved the thirteen Scope 1+2 tests.

### Provenance and anti-fabrication note

No MSFT financial statement value was invented. The linked model is an **explicit, source-declared model definition** (drivers + pure formula nodes) with a **user-owned accepted scenario** whose assumptions are `local-user` values, not reported facts — exactly the design contract ("dated user assumptions remain `user-assumption`, never `estimate` or `actual`"). The baseline outputs are the deterministic result of `computeModelBaseline` over the accepted assumption tuple (hand-verified: `node-revenue = 200000 × 1.1 = 220000`, `node-eps = 66000 / 8000 = 8.25`, `node-value-per-share = 930000 / 8000 = 116.25`, all reproduced by the validator's recompute-from-one-generation check). The forecast-error demonstration uses **constructed estimate/actual observations** clearly labeled as demonstration inputs. Tests exercise the production `rlcompany.js` functions and the real browser route, not re-implementations. Every blocked node reports a real dependency path computed by BFS over the model graph; every immutability claim is a `JSON.stringify` before/after equality over a deep-frozen structure.

<a id="scenario-evidence-map-scope-3"></a>

### Scenario evidence map

- <a id="scenario-scn-010-013"></a>**SCN-010-013** — a newer hash-valid publication never rebases the active revision (`rebased:false`, active revision byte-identical); each affected driver receives a separate pending `company-model-impact-proposal/v1` requiring a user decision. Proven by TP-3-01 (unit), TP-3-02 (selftest), TP-3-03 (validator `SCN-010-013/023` line), TP-3-05 (browser).
- <a id="scenario-scn-010-014"></a>**SCN-010-014** — `editAssumption` on one driver recomputes every dependency-reachable statement/cash/balance/KPI/per-share/valuation node from the draft tuple; a valuation-only driver leaves all unreachable history byte-unchanged; an invalid (zero-denominator) driver blocks the reachable per-share/valuation nodes with an explicit `dependencyPath` (`driver-diluted-shares → node-eps`); a cyclic definition throws `C010-MODEL-CYCLE`; the baseline is never mutated. Proven by TP-3-01, TP-3-02, TP-3-03, TP-3-04 (browser).
- <a id="scenario-scn-010-016"></a>**SCN-010-016** — a later reported actual and its prior estimate keep separate classes (`estimate` vs `reported`), sources, and acceptance clocks; the forecast error (`3000`) derives only when definition, unit, currency, and period are compatible, and a period or currency mismatch withholds it with a typed reason. Proven by TP-3-01, TP-3-02, TP-3-03, TP-3-04.
- <a id="scenario-scn-010-023"></a>**SCN-010-023** — the proposal alone is inert (the active revision is unchanged before and after every decision); accept or edit-and-confirm creates exactly one new immutable revision `R5` whose `parentRevisionId` is `scenario-msft-base-r4`; reject records the decision with zero revisions created. Proven by TP-3-01, TP-3-02, TP-3-03, TP-3-05.

### Scenario-first RED → GREEN ledger

| Behavior | RED (before implementation) | GREEN (after implementation) |
| --- | --- | --- |
| TP-3-01 production functions | `node --test …unit.mjs --test-name-pattern='TP-3-01'` → **0 pass / 9 fail** (`TypeError: company.evaluateModel is not a function`) | `node --test …unit.mjs` → **31 pass / 0 fail** |
| TP-3-03 model-pack rebind | `node scripts/validate-company-fundamentals.mjs` → **FAIL `C010-CONFIG-VERSION`** (config fingerprint no longer matches the pre-Scope-3 manifest) | after `--rebuild-from-retained` (12 objects, non-null `modelPackRef`), same command → **PASS** |
| TP-3-04/05/06 model workspace | 4 new browser tests → **failed** (`[data-model-workspace]`, `[data-model-draft]`, … not found) | full suite → **17 passed** |

### TP-3-01 — `node --test tests/company-fundamentals-contracts.unit.mjs` (exit 0)

```
✔ TP-3-01 SCN-010-014 evaluateModel recomputes only dependency-reachable nodes from one draft tuple and never mutates history
✔ TP-3-01 SCN-010-014 a valuation-only driver edit leaves unreachable history unchanged
✔ TP-3-01 SCN-010-014 an invalid driver blocks reachable outputs with an explicit dependency path
✔ TP-3-01 SCN-010-014 evaluateModel rejects a cyclic model definition with an explicit code
✔ TP-3-01 SCN-010-014 reduceScenarioDraft creates a draft and never changes the active revision
✔ TP-3-01 SCN-010-013 reduceCompanySelection keeps assumptions active and raises separate pending proposals
✔ TP-3-01 SCN-010-023 reduceProposalDecision is inert until accept or edit-confirm and rejection records no revision
✔ TP-3-01 SCN-010-016 deriveForecastError separates estimate and actual classes and derives only when comparable
✔ TP-3-01 SCN-010-013/014 the regenerated publication exposes a non-null hash-valid model pack that recomputes from one generation
ℹ tests 31
ℹ pass 31
ℹ fail 0
ℹ skipped 0
```

The RED run of the same nine cases (before the production functions existed) reported `tests 9 / pass 0 / fail 9`, each `TypeError: company.evaluateModel is not a function` (and `reduceScenarioDraft`/`reduceCompanySelection`/`reduceProposalDecision`/`deriveForecastError` not a function).

### TP-3-02 — `node scripts/selftest.mjs` (exit 0)

```
Feature 010 Scope 3 linked model and user-owned accepted state
  ✓ Feature 010 Scope 3 config declares an accepted model definition and scenario
  ✓ Feature 010 Scope 3 publication carries a non-null hash-valid model pack ref
  ✓ Feature 010 Scope 3 model pack is generation-bound
  ✓ Feature 010 Scope 3 accepted scenario recomputes to its published baseline from one generation
  ✓ Feature 010 Scope 3 a valuation-only driver edit recomputes only reachable nodes and carries unreachable history unchanged
  ✓ Feature 010 Scope 3 an invalid driver blocks a reachable node with an explicit dependency path
  ✓ Feature 010 Scope 3 evidence refresh raises a separate pending proposal without rebasing the accepted revision
  ✓ Feature 010 Scope 3 confirmation creates exactly one immutable revision and rejection records no change
  ✓ Feature 010 Scope 3 forecast error keeps estimate and actual classes and clocks separate and derives only when comparable
  ✓ Feature 010 Scope 3 cockpit wires the linked model and accepted-state reducers over same-origin scripts with no credential field
================================================
Research-Lab self-test: 531 passed, 0 failed
================================================
```

The Scope 1 (14-check) and Scope 2 (10-check) marker-bounded groups are byte-unchanged; the total rose additively from 521 to 531.

### TP-3-03 — `node scripts/validate-company-fundamentals.mjs` (exit 0)

```
[company-fundamentals] config: contract valid
[company-fundamentals] objects: 12 reachable immutable objects hash-valid
[company-fundamentals] publication: complete graph valid
[company-fundamentals] SCN-010-010/011/012: diagnostics render raw-before-contextual, preferred stock stays absent, and buybacks cite net share change and dilution
[company-fundamentals] model pack: non-null hash-valid and generation-bound
[company-fundamentals] SCN-010-013/014: model pack recomputes to its published baseline from one generation
[company-fundamentals] SCN-010-014: driver edits recompute only reachable nodes and report invalid dependency paths without mutating history
[company-fundamentals] SCN-010-013/023: refresh raises separate proposals, confirmation creates one revision, rejection records no change
[company-fundamentals] SCN-010-016: actual and estimate keep separate classes and clocks with comparable-only forecast error
[company-fundamentals] model pack: drift rejected by the whole-publication hash guard
[company-fundamentals] validation: PASS
```

The deterministic rebuild (`node scripts/validate-company-fundamentals.mjs --rebuild-from-retained`, exit 0) reported: `rebuild model pack: model-pack-sec-cik-0000789019-g1 (16 nodes, scenario scenario-msft-base-r4)`, `rebuild model pack ref: sha256:a605661add9ef26f4090dc322794b8d918df7451670e129acf4bc9b5e0d2b4ba`, `rebuild immutable objects: 12`, `rebuild obsolete objects removed: 2`, `rebuild result: PASS`.

### TP-3-04 — `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-014|SCN-010-016" --reporter=list` (exit 0)

```
Running 2 tests using 1 worker
  ✓  1 …t recomputes linked outputs and exposes every invalid dependency (687ms)
  ✓  2 …rve prior estimates classes clocks and comparable forecast error (246ms)
  2 passed (2.0s)
```

### TP-3-05 — `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-013|SCN-010-023" --reporter=list` (exit 0)

```
Running 2 tests using 1 worker
  ✓  1 …ves accepted user assumptions and creates pending proposals only (410ms)
  ✓  2 … is inert and confirmation alone creates a new scenario revision (290ms)
  2 passed (1.3s)
```

### TP-3-06 — `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` (exit 0)

```
Running 17 tests using 1 worker
  ✓   1 …concepts remain unavailable while independent facts stay usable (528ms)
  … (Scope 1+2 scenarios 2–13 all green) …
  ✓  14 … recomputes linked outputs and exposes every invalid dependency (312ms)
  ✓  15 …ve prior estimates classes clocks and comparable forecast error (274ms)
  ✓  16 …es accepted user assumptions and creates pending proposals only (250ms)
  ✓  17 …is inert and confirmation alone creates a new scenario revision (235ms)
  17 passed (7.2s)
```

The 17 cumulative browser tests are the six Scope 1 scenarios plus the seven Scope 2 scenarios plus the four Scope 3 scenarios (SCN-010-014/016/013/023), all over the real ephemeral static server with no request interception.

<a id="build-quality-scope-3"></a>

### Build quality

- Model-graph acyclicity + dependency-path proof: `evaluateModel`/`computeModelBaseline`/`validateConfiguredModel` topologically order the node graph and throw `C010-MODEL-CYCLE` on a cycle (unit-proven); every blocked node reports a BFS-computed `dependencyPath` (`driver-diluted-shares → node-eps`, unit + validator + browser proven).
- History-immutability scan: `evaluateModel` deep-clones its inputs and returns a deep-frozen result; the baseline tuple's `JSON.stringify` is byte-identical before and after evaluation (unit + validator proven); accept/edit-confirm create a new revision object with `parentRevisionId` pointing at the immutable prior revision, which is returned unchanged (`priorRevision`), and the rebuild only appends/replaces content-addressed objects — no prior object or revision is rewritten in place.
- `git diff --check` on all Scope 3 files: exit 0 (no whitespace or conflict-marker errors).
- No-credential / no-private-data scan on the cockpit (`type="password"`, `name*=credential|token|secret`): zero matches — clean; the Scope 3 selftest and browser tests re-assert the absence.
- Selftest baseline parity: 521 → 531; the Scope 1 and Scope 2 marker-bounded groups are byte-unchanged; only the additive Scope 3 group was added.
- Editor diagnostics: clean on `rlcompany.js`, `scripts/validate-company-fundamentals.mjs`, `scripts/selftest.mjs`, `company-fundamentals-lab.html`, and both scope-owned test files.
- Change boundary respected: only `rlcompany.js`, `company-fundamentals.config.json`, `company-fundamentals-lab.html`, `scripts/validate-company-fundamentals.mjs`, `scripts/selftest.mjs` (additive Scope 3 block), `data/company-fundamentals/**`, and the two scope-owned test files were changed. No excluded family (`rldata.js`, `rlapp.js`, `tools.json`, `index.html`, `rlnav.js`, `scripts/brief-refresh.mjs`, Market Brief artifacts) was touched, and all unrelated dirty work (specs/004, specs/005, BUG-002/003, brief-refresh test support, feature-004 collision test, the untracked specs/011 + rlvol.js + volatility fixtures from a concurrent session) is preserved untouched.
- Byte-frozen-consumer safety: the model pack is reached by the Scope 1/Scope 2 selftest groups and the unit fixture loader through a nested `modelPackRef` embedded in the loose `fundamentals-tool-read/v1` owner-read object, so those groups keep passing without modification even though `manifest.modelPackRef` is now non-null; `ownerRead.modelCutoff` intentionally stays `null` so the Scope 2 "Not established" model-clock assertion is preserved.

## Scope 4 Execution

Scope 4 (MSFT Detailed workspaces, peers, export, tool read & regression — Increment A) was implemented scenario-first over the Scope 3 accepted state and model pack. The re-scoped boundary defers registry/navigation/deep-link registration and the `market-brief.payload.json` `toolCoverage` update to Scope 5 (which owns `scripts/brief-refresh.mjs`, the generator of `toolCoverage`), resolving the verified `validateBriefPayload` coupling and the concurrent registry collision. Added production `selectPeersView` (only comparable observations enter the named statistic and sample size; qualified/excluded rows, missing counts, and exact reasons stay visible with no zero insertion), the source-trace claim resolver (SCN-010-029), `buildAcceptedExport` (pure projection of one accepted generation with clocks/classes and no private data), and `buildFundamentalsToolRead` (recomputes the committed `FundamentalsToolRead/v1` owner read and rejects drift); wired the `#modeSeg` Simple/Detailed toggle and six Detailed workspaces over one `CompanyAcceptedState/v1` with zero mode/tab-triggered publication requests. The regenerated fingerprint-bound publication carries a non-null `ownerReadRef`.

### Files created / modified (Scope 4)

- `rlcompany.js` — added `selectPeersView`, the source-trace claim resolver, `buildAcceptedExport`, `buildFundamentalsToolRead`, and the one-accepted-tuple Detailed/peers/export/owner-read selectors.
- `company-fundamentals.config.json` — populated the proposed software-platform `peers` set; regenerated `configFingerprint`.
- `company-fundamentals-lab.html` — shared-shell wiring, `#modeSeg` Simple/Detailed toggle, six Detailed workspaces, peers, source-trace, and owner-read-compat surfaces over same-origin scripts with no credential field.
- `scripts/validate-company-fundamentals.mjs` — whole-publication validation of the non-null `ownerReadRef` export and `FundamentalsToolRead/v1` recompute + drift rejection.
- `tests/company-fundamentals-contracts.unit.mjs`, `tests/company-fundamentals-lab.spec.mjs` — scope-owned TP-4-01 unit cases and TP-4-04/05/06 regression titles.
- `scripts/selftest.mjs` — additive Feature 010 Scope 4 group (6 checks).
- `data/company-fundamentals/**` — regenerated publication (12 hash-valid objects) with non-null `ownerReadRef`.

### RED — scenario-first (revert Scope 4 helpers, `node --test tests/company-fundamentals-contracts.unit.mjs`)

```
--- rlcompany.js reverted to the Scope 3 version (Scope 4 helpers absent) ---
✖ TP-4-01 SCN-010-028 selectPeersView admits only comparable observations and never inserts a zero for a missing or non-comparable member
  TypeError: company.selectPeersView is not a function
✖ TP-4-01 SCN-010-015 buildAcceptedExport is a pure projection of one accepted generation with clocks and classes and no private data
  TypeError: company.buildAcceptedExport is not a function
  TypeError: company.buildFundamentalsToolRead is not a function
ℹ tests 36
ℹ pass 32
ℹ fail 4
```

### TP-4-01 — `node --test tests/company-fundamentals-contracts.unit.mjs` (exit 0)

```
✔ TP-4-01 SCN-010-028 selectPeersView admits only comparable observations and never inserts a zero for a missing or non-comparable member
✔ TP-4-01 SCN-010-028 the configured software-platform peer set is a valid proposed peer set
✔ TP-4-01 SCN-010-015 buildAcceptedExport is a pure projection of one accepted generation with clocks and classes and no private data
✔ TP-4-01 SCN-010-015 buildFundamentalsToolRead recomputes the committed owner read from the accepted generation and rejects drift
✔ TP-4-01 SCN-010-015 the Simple selector, source trace, peers, export, and owner read all derive from one accepted tuple with matching shared values
ℹ tests 36
ℹ pass 36
ℹ fail 0
```

### TP-4-02 — `node scripts/selftest.mjs` (exit 0)

```
Feature 010 Scope 4 Detailed workspaces peers export and committed owner read
  ✓ Feature 010 Scope 4 config declares a proposed software-platform peer set bound to the regenerated fingerprint
  ✓ Feature 010 Scope 4 peers admit only comparable observations and keep exclusions and missing members visible with no zero insertion
  ✓ Feature 010 Scope 4 accepted export is a pure projection with clocks and periods and no private data
  ✓ Feature 010 Scope 4 committed owner read is a faithful non-null recompute carrying the model pack ref
  ✓ Feature 010 Scope 4 Simple source-trace export and owner read share one accepted state without divergence
  ✓ Feature 010 Scope 4 cockpit wires the mode toggle, six Detailed workspaces, peers, and the owner-read compat over same-origin scripts with no credential field
Research-Lab self-test: 554 passed, 0 failed
```

The additive Feature 010 Scope 4 group is 6 checks; the Scope 1/2/3 marker-bounded groups are byte-unchanged. The `554` disk total includes a concurrent-session Feature 011 RLVOL group; the committed Feature-010-only `scripts/selftest.mjs` (the Feature 010 Scope 4 hunk staged, the concurrent Feature 011 hunk excluded) yields `537 passed, 0 failed`.

### TP-4-03 — `node scripts/validate-company-fundamentals.mjs` (exit 0)

```
[company-fundamentals] objects: 12 reachable immutable objects hash-valid
[company-fundamentals] SCN-010-015: committed owner read recomputes from one generation and rejects drift
[company-fundamentals] SCN-010-015: Simple, source trace, export, and owner read share one accepted state without refetch
[company-fundamentals] SCN-010-028: peers admit only comparable observations and keep exclusions and missing members visible with no zero insertion
[company-fundamentals] SCN-010-029: the direction claim resolves its full transformation, consumer, rights, and unavailable-link chain
[company-fundamentals] validation: PASS
```

### TP-4-04 / TP-4-05 / TP-4-06 — `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` (exit 0)

```
Running 19 tests using 1 worker
  ✓   2 …SCN-010-029 every material claim reaches its exact source transformation and consumer chain (1.1s)
  … (Scope 1/2/3 scenarios all green) …
  ✓  18 …SCN-010-015 Simple Detailed and six tabs share one state without refetch or reinterpretation (368ms)
  ✓  19 …SCN-010-028 incompatible peers stay outside statistics and ranks with exact reasons (253ms)
  19 passed (10.5s)
```

The 19 cumulative browser tests are the six Scope 1 + seven Scope 2 + four Scope 3 scenarios plus the two new Scope 4 scenarios (SCN-010-015, SCN-010-028; SCN-010-029 was re-verified from its Scope 1 origin), all over the real ephemeral static server with no request interception. TP-4-04 (`--grep "SCN-010-015"`) and TP-4-05 (`--grep "SCN-010-028\|SCN-010-029"`) are the scenario-scoped subsets of this cumulative run.

<a id="build-quality-scope-4"></a>

### Build quality

- Export/owner-read privacy scan: `buildAcceptedExport` and `buildFundamentalsToolRead` project summary-only content with no `type="password"`/`name*=credential|token|secret` field and no raw private-research payload; the Scope 4 selftest and browser tests re-assert the absence.
- `rldata.js`/`rlapp.js` unmodified proof: the shared shell is included and called by `company-fundamentals-lab.html` but neither source file is in the Scope 4 change set (`git status` shows neither modified by this scope).
- `git diff --check` on all Scope 4 files: exit 0 (no whitespace or conflict-marker errors).
- Selftest baseline parity: committed Feature-010-only 531 → 537; the Scope 1/2/3 marker-bounded groups are byte-unchanged; only the additive Scope 4 group was added.
- Editor diagnostics: clean on `rlcompany.js`, `scripts/validate-company-fundamentals.mjs`, `scripts/selftest.mjs`, `company-fundamentals-lab.html`, and both scope-owned test files.
- Change boundary respected: only `rlcompany.js`, `company-fundamentals.config.json`, `company-fundamentals-lab.html`, `scripts/validate-company-fundamentals.mjs`, `scripts/selftest.mjs` (additive Scope 4 hunk), `data/company-fundamentals/**`, and the two scope-owned test files were changed. The deferred registry files (`tools.json`, `index.html`, `rlnav.js`, `market-brief.payload.json` `toolCoverage`) were NOT touched by Scope 4 (their working-tree modifications are the concurrent Feature 011 session, preserved untouched), and no excluded family (`rldata.js`, `rlapp.js`, `scripts/brief-refresh.mjs`, Market Brief artifacts) was changed. All unrelated dirty work (specs/004, specs/005, BUG-002/003, brief-refresh/collision test support, untracked rlvol.js + specs/011 + volatility fixtures) is preserved untouched.

## Completion Statement

Increment A is four of four slices complete. Scope 1 (MSFT source-qualified facts, periods, reconciliation, and statement integrity), Scope 2 (MSFT derived metrics, contextual resilience diagnostics, capital allocation, and the trustworthy Simple cockpit), Scope 3 (MSFT linked model and user-owned accepted state), and Scope 4 (MSFT Detailed workspaces, peers, source trace, export, and the committed owner read) have each executed with scenario-first RED/GREEN evidence and Definition-of-Done proof recorded in this report; all their Test Plan rows are green over the real deterministic and browser surfaces. The fingerprint-bound MSFT publication now carries a non-null hash-valid `modelPackRef` and a non-null hash-valid `ownerReadRef`, recomputes its accepted-scenario baseline and committed `FundamentalsToolRead/v1` owner read from one generation, rejects model-pack and owner-read drift, and keeps its shared facts byte-stable across the config re-hash; the Simple cockpit, six Detailed workspaces, peers, source trace, export, and owner read all derive from one accepted tuple with comparable-only peers and no private data. Registry/navigation/deep-link registration and the `market-brief.payload.json` `toolCoverage` update were deferred to Scope 5 (which owns `scripts/brief-refresh.mjs`, the `toolCoverage` generator), resolving the verified `validateBriefPayload` coupling and the concurrent registry collision. Feature status remains `in_progress`; certification `completedScopes` and `certifiedCompletedPhases` remain empty, so no feature-level completion, live Feature 002 consumption, or human acceptance is claimed. The `state-transition-guard` is a whole-feature done-gate that correctly reports the feature is not yet done because Scopes 5 through 7 are unimplemented; `artifact-lint` passes at the slice boundary. Next required owner: `bubbles.implement` for Scope 5 (Dynamic Adaptive Company Brief, Feature 002 Consume-Once, and the deferred registry discoverability — Increment B).
