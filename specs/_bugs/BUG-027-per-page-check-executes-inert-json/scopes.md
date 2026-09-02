# Scopes: BUG-027 — Type-Aware Per-Page Script Validation

Related: [spec.md](spec.md) · [design.md](design.md) · [report.md](report.md) · [uservalidation.md](uservalidation.md)

## Change Boundary

Allowed delivery families:

- `.specify/memory/agents.md`
- planned project validator `scripts/validate-page-inline.mjs`
- plan-owned focused Node carrier whose path remains unselected during bug filing
- `scripts/selftest.mjs` only if the finalized design requires repository-selftest registration
- this BUG-027 packet

Excluded delivery families:

- BUG-025 and BUG-026 implementation artifacts
- `company-intelligence-lab.html`
- `company-intelligence.config.json`
- existing Company Intelligence unit and browser test files
- README and DomainModel files
- Specs 007 and 008
- portfolio source and tests
- baselines
- framework-managed files

## Scope 1: Type-Aware Per-Page Validation

**Status:** Not Started
**Scope-Kind:** static-validation
**Depends On:** none

### Gherkin Scenarios

```gherkin
Feature: Per-page validation respects inline content types

  Scenario: Malformed executable JavaScript fails
    Given a single-file page has an executable inline JavaScript block with invalid syntax
    When the registered per-page validator checks the page
    Then the command exits nonzero
    And the diagnostic identifies executable JavaScript syntax

  Scenario: Malformed inert JSON fails
    Given a single-file page has an application/json block with invalid JSON
    When the registered per-page validator checks the page
    Then the command exits nonzero
    And the diagnostic identifies inert JSON syntax

  Scenario: Valid inert JSON and executable JavaScript pass together
    Given a single-file page has valid application/json data
    And it has valid executable JavaScript whose literal DOM references exist
    When the registered per-page validator checks the page
    Then the command exits zero
    And the inert data is never compiled as JavaScript

  Scenario: A missing literal DOM ID fails
    Given valid executable JavaScript references a literal element ID
    And the page has no matching HTML id
    When the registered per-page validator checks the page
    Then the command exits nonzero
    And the diagnostic names the missing ID
```

### Implementation Plan

1. Inventory every current non-`src` inline script type and record the executable MIME decision in `design.md`.
2. Add one project-owned validator that preserves script attributes and dispatches by declared type.
3. Parse `application/json` blocks with JSON rules.
4. Keep executable JavaScript syntax checks and literal DOM-ID checks on executable bodies.
5. Point the command registry at the single validator with an explicit page argument.
6. Add focused adversarial coverage for all four scenarios.
7. Run the repaired command against the current Company Intelligence page.
8. Run the complete Company Intelligence browser carrier without changing its source.

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- |
| Parser and classifier unit regression | `unit` | plan-owned focused Node carrier; path unselected at filing | Exercise script extraction, type dispatch, JSON parsing, JavaScript syntax, and literal ID resolution. | Run the plan-selected carrier with the registered Node unit-test command. | No |
| Scenario-specific Regression E2E command carrier | `functional` | plan-owned focused Node carrier; path unselected at filing | Invoke the production validator entrypoint against the four adversarial fixture pages and assert process exit behavior. | Run the plan-selected carrier with the registered Node unit-test command. | No |
| Real-page command regression | `functional` | `.specify/memory/agents.md` command and `company-intelligence-lab.html` | Prove the registered command accepts the valid mixed-content Company Intelligence page. | `node scripts/validate-page-inline.mjs company-intelligence-lab.html` | No |
| Broader E2E regression | `e2e-ui` | existing `tests/company-intelligence-lab.spec.mjs` | Prove the command-only repair leaves the complete Company Intelligence browser route unchanged. | `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Repository regression | `functional` | `scripts/selftest.mjs` | Preserve the build-free repository invariant suite. | `node scripts/selftest.mjs` | No |

### Definition of Done — Tiered Validation

- [ ] One project-owned validator classifies every non-`src` inline block before selecting a parser.
- [ ] Malformed executable JavaScript exits nonzero with an executable-syntax diagnostic.
- [ ] Malformed `application/json` exits nonzero with an inert-JSON diagnostic.
- [ ] Valid inert JSON plus valid executable JavaScript exits zero without compiling JSON as JavaScript.
- [ ] A missing literal `getElementById()` target exits nonzero and names the missing ID.
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior pass.
- [ ] Broader E2E regression suite passes.
- [ ] The command registry names one explicit-page validator command and retains page-specific semantic checks.
- [ ] Change Boundary evidence shows zero excluded file families changed.

## Filing-Phase Evidence Boundary

All Definition of Done items remain unchecked. This invocation reproduced and filed the defect but changed no validator, command registry, runtime source, or test file.

The next owner must finalize `design.md`. `bubbles.plan` must then confirm this scope and scenario manifest before implementation dispatch.
