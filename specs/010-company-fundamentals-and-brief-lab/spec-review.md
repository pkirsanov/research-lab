# Spec Freshness Review: Feature 010

**Agent:** `bubbles.spec-review`
**Date:** 2026-07-16
**Workflow context:** persisted `full-delivery`, `specReviewDefault: once-before-implement`
**Invocation context:** depth-1 specialist under `bubbles.goal`
**Reviewed implementation slice:** partial Scope 01 working tree

## Classification

### Aggregate Classification

`STILL_TRUE`

The current [specification](spec.md), [design](design.md), [scope index](scopes/_index.md), [Scope 01 plan](scopes/01-contract-config-validator-publication-foundation/scope.md), [scenario manifest](scenario-manifest.json), and [test plan](test-plan.json) remain one coherent and authoritative planning truth. No requirement, design decision, scope boundary, scenario owner, or test-plan row has been superseded by a later accepted implementation decision.

| Artifact | Classification | Basis |
| --- | --- | --- |
| `spec.md` | STILL_TRUE | Scope 01 requirements and AC-010-014 still require source-qualified, non-self-validating evidence, fail-loud missing values, and exact claim traceability. |
| `design.md` | STILL_TRUE | The controlled Node boundary, content-addressed static publication, same-origin browser loader, pure `rlcompany.js`, and real-source test architecture remain mutually consistent. |
| `scopes/_index.md` | STILL_TRUE | Scope 01 still correctly precedes source ingestion, reconciliation, metrics, overlays, models, UI expansion, briefs, and Feature 002 integration. |
| Scope 01 `scope.md` | STILL_TRUE | Its allowed paths, two primary scenarios, five test rows, and protected shared-surface rules remain internally consistent and match the machine manifests. |
| `scenario-manifest.json` | STILL_TRUE | SCN-010-026 and SCN-010-029 each retain exactly one primary owner in Scope 01 with the planned persistent browser titles. |
| `test-plan.json` | STILL_TRUE | TP-01-01 through TP-01-05 match Scope 01's Markdown Test Plan and remain `planned-not-executed`. |

The implementation must be brought back to this planning truth. The findings below do not justify weakening or rewriting analyst-, design-, or plan-owned behavior.

## Freshness Evidence

- The active planning set was committed together in `943972e295b8fa93a19795e46015e5ae780b0350` on 2026-07-16 at 12:01:36-07:00.
- The reviewed Scope 01 implementation is uncommitted and therefore postdates the active planning commit. No later implementation commit supersedes the plan.
- [state.json](state.json) still has top-level and per-scope status `not_started`; its existing dirty hunk only records `bubbles.implement`, phase `implement`, and Scope 01 pickup. It does not claim completion or test evidence.
- The one-shot review was invoked after Scope 01 edits had already begun. This report is a stop-before-resume freshness checkpoint; it must not be represented as having preceded the existing partial edits.
- No product test, selftest, company validator, Playwright command, state-transition guard, or framework validation was executed by this review. Findings are based on current artifact contents, working-tree diffs, and actual git history. After classification, `artifact-lint.sh` passed for this spec; it reported only the pre-existing deprecated `scopeProgress`, `statusDiscipline`, and `scopeLayout` field warnings.

## Planning Coherence

- Scope 01's primary scenarios remain SCN-010-026 and SCN-010-029 in the scope, index, scenario manifest, and test plan.
- Scope 01 retains exactly five Markdown Test Plan rows and five machine test-plan rows, TP-01-01 through TP-01-05.
- The active plan consistently requires a real direct route, production loader/validator behavior, source-qualified recorded inputs, exact lineage, a marker-bounded selftest addition, and no changes to files outside the explicit change boundary.
- No duplicate or contradictory active scope, scenario family, API contract, or superseded appendix was found in the reviewed planning set.

## Findings

### SR010-001: The browser path bypasses the production publication loader

**Disposition:** unresolved, blocking Scope 01 proof, owner `bubbles.implement`.

The Scope 01 plan requires the direct route to load same-origin source-qualified objects, and the design requires the controller to accept a current pointer and hash-bound publication through production loading behavior. The current [page](../../company-fundamentals-lab.html) instead loads `tests/fixtures/company-fundamentals/source-qualified/foundation-publication.js` as executable page code and reads `window.RLCOMPANY_FOUNDATION_FIXTURE` directly. The production `loadCompanyPublication` function in [rlcompany.js](../../rlcompany.js) is exercised only with an injected fetch in the unit test; the browser E2E never uses it. The [validator](../../scripts/validate-company-fundamentals.mjs) also imports the executable test fixture rather than validating materialized public publication files.

Consequently, TP-01-03 and TP-01-04 could pass without proving same-origin JSON loading, current-pointer acceptance, object-path retrieval, response content type, or browser-side byte/hash rejection. Implementation must route the real page through the planned production loader and source-qualified publication artifacts; tests must exercise that path without internal request interception.

### SR010-002: The positive source fixture is a curated extract, not captured raw SEC response bytes

**Disposition:** unresolved, blocking source-qualified proof, owner `bubbles.implement`.

Scope 01 Implementation Plan item 6, the design's source-contract test architecture, and AC-010-014 require immutable captured real source bytes and prohibit invented or self-validating fixture output as positive proof. The current [SEC fixture](../../tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.extract.json) is a custom `company-source-extract/v1` envelope with `completeResponse: false`. The executable publication fixture explicitly says it is not the complete SEC response and that no Company Facts response was captured.

The tests prove only that this hand-shaped extract hashes to the hard-coded expected value and agrees with objects derived from the same extract. They do not bind the fields to retained raw response bytes or a production parser result. The publication fixture also introduces period details and derived graph records that are not reconstructed by a production source parser in Scope 01. Implementation must retain the exact source bytes and provenance required by the plan, then derive positive assertions through production normalization/validation. Honest unavailable behavior may remain, but it cannot substitute a curated envelope for the required real-source positive input.

### SR010-003: The claimed trace chain is semantically inexact

**Disposition:** unresolved, blocking SCN-010-029, owner `bubbles.implement`.

SCN-010-029 requires a material claim to reach its exact observation, artifact, period/window, mapping or interpretation, and consumers. In the current [foundation publication](../../tests/fixtures/company-fundamentals/source-qualified/foundation-publication.js), `claim-direction` is unavailable because `fact-revenue` is missing, but its only `observationId` is `obs-sec-issuer-name`. The trace then combines that issuer-name observation with `mapping-revenue`, a revenue-direction formula, and a period recovered from the separate unavailable link.

The unit and browser tests explicitly expect this mixed chain, so they can pass while proving a source artifact exists rather than proving semantic lineage for the direction claim. Implementation must represent the absent revenue observation and its source/period requirement without citing an unrelated issuer-name observation as the claim's evidentiary observation, then update tests to assert the exact production chain.

### SR010-004: Fail-loud configuration validation is incomplete for declared groups

**Disposition:** unresolved, blocking the Scope 01 config contract, owner `bubbles.implement`.

Scope 01 requires explicit contracts for companies, sources, mappings, archetypes, formulas, freshness, rights, peers, and Feature 002 subjects, with every required property validated. The current `validateCompanyConfig` implementation validates the top-level presence of several arrays and performs ID uniqueness checks, but it does not validate the item schemas and cross-references for mappings, formulas, archetype definitions/assignments, or peer sets. Empty arrays therefore make those declared groups pass without establishing their fail-loud contracts, and malformed future entries can cross the foundation validator without the planned exact-field checks.

Implementation must add the missing item-level and reference validation in the Scope 01 foundation. Later scopes may populate the registries, but they should not have to invent or replace the foundational validation contract.

### SR010-005: `playwright.config.mjs` is outside the Scope 01 change boundary

**Disposition:** unresolved, blocking changed-path conformance, owner `bubbles.implement`.

The Scope 01 Allowed list names `rlcompany.js`, the company config, direct route, validator, scope-owned fixtures/tests, and one additive selftest block. It does not authorize [playwright.config.mjs](../../playwright.config.mjs). The current dirty hunk adds a repository-wide `testMatch`, changing global test discovery for every Playwright consumer without a Scope 01 canary or rollback entry.

Implementation must remove the out-of-scope hunk or route a demonstrated shared-config requirement back through the planning owner before changing it. This review deliberately leaves the user-owned hunk untouched.

## Shared-Surface Assessment

The marker-bounded [scripts/selftest.mjs](../../scripts/selftest.mjs) addition is in the allowed Scope 01 surface, but its current assertions reinforce SR010-001 and SR010-002: it checks that script URLs are same-origin rather than requiring the production JSON loader, and it treats the curated extract/fixture's internal hash agreement as source-qualified proof. The additive shape and rollback marker are consistent with the plan; the asserted proof is not yet sufficient.

## Untouched Work

This review did not modify or revert:

- any analyst-, UX-, design-, or plan-owned behavioral artifact;
- any Scope 01 source, config, validator, fixture, test, selftest, or Playwright implementation;
- any BUG-003 artifact; or
- `tests/brief-refresh-atomicity.support.mjs`.

## Maintenance Context

Maintenance and implementation agents may treat Feature 010's active planning artifacts as authoritative. They must not treat the current partial Scope 01 route, fixture publication, source extract, trace assertion, config validator depth, or Playwright config hunk as accepted design decisions. No scope beyond Scope 01 is eligible until Scope 01 is implemented and validated against its unchanged plan.

## Required Route

**Actual next owner: `bubbles.implement`, Scope 01.**

Resume only after consuming SR010-001 through SR010-005 as one complete finding set. The parent `bubbles.goal` runner remains responsible for authoritative orchestration history; this depth-1 review does not invoke another workflow runner.
