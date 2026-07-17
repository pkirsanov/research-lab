# Feature 010 Execution Report — Company Fundamentals And Adaptive Brief Lab

Links: [scopes.md](scopes.md) | [spec.md](spec.md) | [design.md](design.md) | [uservalidation.md](uservalidation.md) | [scenario-manifest.json](scenario-manifest.json) | [test-plan.json](test-plan.json)

This is the single-file execution report for the seven-scope plan. Each scope records its execution evidence in this file under a scope section and per-`TP` / per-scenario anchors when it runs. Planning is complete; Scope 1 has executed with all its Definition-of-Done items checked and evidence recorded below, and Scopes 2 through 7 have not yet executed.

## Summary

`bubbles.plan` (mode: replace) re-decomposed Increment A of the single-file plan into four vertical executable slices, producing a seven-scope plan across three vertical delivery increments:

- **Increment A** — Scope 1 (MSFT Source-Qualified Facts, Periods, Reconciliation & Statement Integrity), Scope 2 (MSFT Derived Metrics, Contextual Resilience Diagnostics, Capital Allocation & Trustworthy Simple Cockpit), Scope 3 (MSFT Linked Model & User-Owned Accepted State), and Scope 4 (MSFT Detailed Workspaces, Peers, Export, Tool Read, Registry & Regression).
- **Increment B** — Scope 5 (Dynamic Adaptive Company Brief And Feature 002 Consume-Once).
- **Increment C** — Scope 6 (CMG And JPM Source-Qualified Overlays) and Scope 7 (Real Canary Acquisition, Cross-Capability Regression, Accessibility, And Static-Site Hardening).

The untracked Feature 010 materialization is a **foundation skeleton**, not a finished tool: Increment A is a large net-new build. The plan references the existing files (`company-fundamentals-lab.html`, `company-fundamentals.config.json`, `rlcompany.js`, `scripts/validate-company-fundamentals.mjs`, `data/company-fundamentals/**`, `tests/company-fundamentals-contracts.unit.mjs`, `tests/company-fundamentals-lab.spec.mjs`, and the marker-bounded Feature 010 block in `scripts/selftest.mjs`) and states per slice what is reused (validators, canonicalize/sha256, `validatePublicationGraph`, `propagateDependencyStates`, `loadCompanyPublication`, the identity-only MSFT publication) versus net-new (the reconciliation/integrity/metric/diagnostic/model/reducer/peers/export/tool-read helpers, config mappings/formulas/archetypes/peers, the enriched multi-fact dossier, and the full Simple+Detailed UI/registry). All thirty-two SCN-010 scenario contracts are preserved and each maps to exactly one active slice; none were invalidated or dropped. The retired plan's Scope 01 implement/test raw evidence is preserved unchanged under [scopes/01-contract-config-validator-publication-foundation/report.md](scopes/01-contract-config-validator-publication-foundation/report.md).

Current feature status: `in_progress`. Scope 1 (Increment A) is complete; next required owner: `bubbles.implement` for Scope 2.

## Test Evidence

Scope 1 has executed and its evidence is recorded below. This section is populated per scope and per `TP` row during implementation and testing. Evidence is recorded with the exact command, exit code, and at least ten lines of raw output, per the execution-evidence standard. Scopes 2 through 7 have not yet executed, so no result is claimed for them.

- Scope 1 — MSFT Source-Qualified Facts, Periods, Reconciliation & Statement Integrity: **complete — all six Test Plan rows green and independently verified** (see [Scope 1 Execution](#scope-1-execution)).
- Scope 2 — MSFT Derived Metrics, Contextual Resilience Diagnostics, Capital Allocation & Trustworthy Simple Cockpit: pending (TP-2-01 … TP-2-07).
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

## Completion Statement

Planning-only. The seven-scope replacement plan is authored and mechanically coherent, but no implementation, test execution, live route, publication, Feature 002 consumption, or human acceptance is claimed. Feature status, certification, completed-phase claims, and policy snapshot remain unchanged. Completion of any scope requires its own scenario-first RED/GREEN evidence and Definition-of-Done proof recorded in this report.
