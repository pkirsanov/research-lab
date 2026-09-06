# Scopes: BUG-026 — A Superseded Company Corpus Load Writes Current-Subject State

Related: [spec.md](spec.md) · [design.md](design.md) · [report.md](report.md) · [uservalidation.md](uservalidation.md)

## Change Boundary

Allowed families: this bug packet, `company-intelligence-lab.html`, `rlcompanyintel.js` only if a pure contract helper is required, `tests/company-intelligence-lab.spec.mjs`, `tests/company-intelligence.unit.mjs` only if a pure helper is added, and `notes/company-intelligence-lab.md`.

Excluded changes: other tool routes, corpus payloads, provider configuration, shared RLDATA schema, and framework-managed `.github/bubbles/**` files.

## Scope 1: Make Current-Subject State An Atomic Latest-Intent Commit

**Status:** Not Started
**Scope-Kind:** runtime-behavior
**Depends On:** none

### Gherkin Scenarios

```gherkin
Feature: Only the latest company intent owns current-subject state

  Scenario: An older subject completes after a newer subject
    Given one valid subject load is still in flight
    And a newer valid subject load has started
    When the newer load completes first
    And the older load completes last
    Then the newer subject owns every current-subject state slot
    And the rendered and published reading still name the newer subject

  Scenario: An obsolete load populates only immutable keyed caches
    Given an older load has been superseded
    When its keyed bar or committed-body request completes
    Then that keyed response may remain reusable
    But no current-subject slot changes

  Scenario: A refused replacement preserves the standing subject
    Given the current subject has settled
    When a replacement value is refused
    Then the standing subject's state remains unchanged
```

### Implementation Plan

1. Capture intent and subject before asynchronous work starts.
2. Convert event and research-record loaders from module assignments to returned values.
3. Assemble one per-intent snapshot.
4. Commit all current-subject slots only after one final latest-intent check.
5. Add a reverse-completion browser regression with distinct subject data.
6. Preserve BUG-018's refusal and synchronous pending assertions.

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- |
| Scenario-specific Regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | Release newer and older subject loads in reverse order and assert latest-intent ownership across DOM and RLDATA publication. | `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-026" --reporter=list` | Yes |
| Scenario-specific Regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | Refused replacement retains standing state after the snapshot refactor. | `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-018 scope 1|BUG-026" --reporter=list` | Yes |
| Unit regression | `unit` | `tests/company-intelligence.unit.mjs` | Exercise any extracted snapshot/commit predicate with stale and current intent ids. | `node --test tests/company-intelligence.unit.mjs` | No |
| Broader E2E regression | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | Preserve the complete Company Intelligence browser suite. | `npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Repository regression | `functional` | `scripts/selftest.mjs` | Preserve build-free repository invariants. | `node scripts/selftest.mjs` | No |

### Definition of Done

- [ ] Every asynchronous loader uses its captured intent and subject.
- [ ] Current-subject state is assembled locally and committed at one latest-intent boundary.
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior pass.
- [ ] The reversed-completion case proves the newer intent owns DOM state and shared publication after both loads finish.
- [ ] The refused-input BUG-018 regression remains green.
- [ ] Broader E2E regression suite passes.
- [ ] Unit and repository regression suites pass with zero failures.
- [ ] Change Boundary evidence shows zero excluded file families changed.
