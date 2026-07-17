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

## Completion Statement

Increment A is two of four slices complete. Scope 1 (MSFT source-qualified facts, periods, reconciliation, and statement integrity) and Scope 2 (MSFT derived metrics, contextual resilience diagnostics, capital allocation, and the trustworthy Simple cockpit) have each executed with scenario-first RED/GREEN evidence and Definition-of-Done proof recorded in this report; all their Test Plan rows are green over the real deterministic and browser surfaces, and the fingerprint-bound MSFT publication keeps its shared facts byte-stable across the config re-hash. Feature status remains `in_progress`; certification `completedScopes` and `certifiedCompletedPhases` remain empty, so no feature-level completion, live Feature 002 consumption, or human acceptance is claimed. The `state-transition-guard` is a whole-feature done-gate that correctly reports the feature is not yet done because Scopes 3 through 7 are unimplemented; `artifact-lint`, `traceability-guard`, and `artifact-freshness-guard` pass. Next required owner: `bubbles.implement` for Scope 3 (MSFT Linked Model & User-Owned Accepted State).
