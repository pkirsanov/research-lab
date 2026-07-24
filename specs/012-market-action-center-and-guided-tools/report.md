# Feature 012 Planning Report

## Summary

`bubbles.plan` created a 14-scope, per-scope-directory, foundation-first execution DAG from the complete Feature 012 specification and design. Planning preserves the observed 23-entry registry, exact BUG-004/Feature 002/Feature 008 predicates, Research Lab source ownership, Feature 002 atomic publication, Feature 008 private-store ownership, options publication ownership, and the Research Lab-first/QF-later contract boundary.

No product source, product test, dependency feature, framework-managed file, implementation result, user acceptance result, completed scope, status promotion, or certification claim is made by this report.

## Decision Record

- Scope 01 is independently eligible and contains contracts/config/registry validation only; it makes no integration claim.
- Scope 04 is owner-neutral and proves honest unavailable behavior; actual owner-model effects are delivered in Scopes 05-07.
- Scopes 05-07 explicitly cover all 22 ordinary tools and the internal Market Action triage model with owner parity and per-tool parameter-effect regressions.
- Scope 08 explicitly covers all 23 Journey inventories and the shared local/session/packet runtime.
- Scope 11 alone owns Feature 002-gated authored/public Brief integration.
- Scope 12 depends on bounded WebEvidence but not Scope 11, so deterministic dynamic-alert work is not blocked by uncertified publication.
- Scope 13 alone owns Feature 008-gated private matrix/stress integration and creates no second store.
- Scope 14 consumes BUG-004's authoritative functional/browser classification and evidence instead of duplicating or relabeling provider transport tests.
- Research Lab declares no `testImpact` or `traceContracts`; no impact-map or telemetry rows are fabricated.

## Completion Statement

Planning-owned artifacts are subject to the validation evidence recorded below. No implementation completion statement is authorized.

## Code Diff Evidence

Planning-only files under `specs/012-market-action-center-and-guided-tools/` are the only intended changed paths for this invocation:

- `scopes/_index.md`
- `scopes/01-*/scope.md` through `scopes/14-*/scope.md`
- `scopes/01-*/report.md` through `scopes/14-*/report.md`
- `report.md`
- `uservalidation.md`
- `scenario-manifest.json`
- `test-plan.json`
- `state.json` execution routing/history only

## Test Evidence

Planning validation commands were executed in the current session. Product behavior tests remain `planned-not-executed`; `bubbles.plan` records no product pass claim.

## Uncertainty Declarations

- Browser execution remains dependent on the repository-declared Linux `system-chrome` channel. BUG-004 currently records that `/opt/google/chrome/chrome` is absent. No planned browser row may be marked complete or replaced with managed Chromium while that remains true.
- Feature 002 and Feature 008 integration predicates are currently false. Scopes 11 and 13 remain ineligible until their exact mechanical predicates pass.
- BUG-004 remains uncertified and browser-blocked. Scope 14 remains ineligible for its integrated keyed-provider claim until that predicate passes.

## Scenario Contract Evidence

The plan maps all 32 analyst acceptance scenarios plus five technical planning scenarios (`SCN-012-033` through `SCN-012-037`) in `scenario-manifest.json`, exact Markdown Test Plan rows, exact DoD test-evidence items, and `test-plan.json`.

## Coverage Report

- 14 active scopes, all Not Started.
- Scope 01 is tagged `foundation:true`; every concrete overlay depends directly or transitively on it.
- All 22 ordinary Simple adapters are assigned across Scopes 05-07.
- All 23 registry Journey inventories are assigned in Scope 08.
- Public, authored-public, dynamic-alert, and private trust zones are separated across Scopes 09-13.
- Final integrated acceptance includes unit, functional, integration, e2e-ui, stress, and load categories without misclassifying controlled external boundaries as live.

## Lint/Quality

**Claim Source:** executed

- `bash .github/bubbles/scripts/cli.sh lint specs/012-market-action-center-and-guided-tools` passed after reconciliation.
- `bash .github/bubbles/scripts/capability-foundation-guard.sh specs/012-market-action-center-and-guided-tools` passed Gate G094.
- `bash .github/bubbles/scripts/artifact-freshness-guard.sh specs/012-market-action-center-and-guided-tools` passed with all 14 per-scope directories indexed and registered in execution routing state.
- `bash .github/bubbles/scripts/cli.sh dag specs/012-market-action-center-and-guided-tools` rendered the intended 14-node dependency graph after machine-readable header normalization.
- `bash .github/bubbles/scripts/transition-contract-resolver.sh specs/012-market-action-center-and-guided-tools` resolved `full-delivery`, target `done`, and the current planning artifact fingerprint without malformed state.
- The canonical object-shaped `test-plan.json` contains 130 unique records across 14 scopes; its TP-ID set exactly equals the 130 Markdown Test Plan IDs.
- `bash .github/bubbles/scripts/traceability-guard.sh specs/012-market-action-center-and-guided-tools` maps 37/37 Gherkin scenarios to Test Plan rows and 37/37 to DoD items, then exits nonzero on 37 delivery-file/evidence checks because implementation tests and per-scope execution evidence are absent at planning maturity.

## Spot-Check Recommendations

- Confirm every test-plan JSON row remains byte-semantically synchronized with its Markdown row after any planning reconciliation.
- Confirm each per-tool adapter test fails when its enabled control is disconnected from the declared owner output.
- Confirm private/public sentinel inventories include URL, referrer, history, request, log, DOM, storage, public artifacts, publisher input, and telemetry.

## Validation Summary

Planning artifacts are coherent and artifact-valid. The packet routes to `bubbles.implement` at `01-contract-config-registry-foundation`. Delivery traceability remains intentionally nonterminal until the planned production tests exist and execution evidence is recorded by the owning specialists.

## Audit Verdict

No audit verdict is claimed by `bubbles.plan`.
