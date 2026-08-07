# Bug Specification: BUG-005 Journey Readiness Budget

- **Owning feature:** `specs/012-market-action-center-and-guided-tools`
- **Workflow mode:** `bugfix-fastlane`
- **Status:** In progress; diagnosed and routed, not implemented

## Problem Statement

The Market Action Center Journey regression has a correct readiness predicate
but an execution budget that can expire under the complete browser suite before
the shipped async mount publishes its unchanged ready state. The repair must
make the full suite deterministic without weakening behavior assertions, adding
retries, intercepting requests, or changing production code.

## Outcome Contract

**Intent:** Make the global Journey regression tolerate measured complete-suite
async cost while preserving its exact substantive readiness and registry checks.

**Success signal:** The target, complete `journey.spec.mjs`, four-worker full
suite, and serial full suite all pass with retries disabled. Both complete
profiles retain and pass all 280 current identities across 33 files. The target
still requires a visible Journey panel, `data-rljourney-state="ready"`, a live
`__rljourneyController`, complete registry equality, uniqueness, and
`market-brief` first.

**Hard constraints:** Change only `tests/journey.spec.mjs`; retain zero request
interception; retain the existing predicate and registry assertions; do not add
retry, catch-and-continue, optional assertions, bailout returns, sleeps, product
fallbacks, or production mutations.

**Failure condition:** Any profile still times out, any original readiness or
registry assertion is removed or weakened, the larger budget affects unrelated
Journey cases, or a never-ready/unavailable/controller-absent state can pass.

## Concurrent Baseline Requirement

The current exact system-Chrome list baseline at repository HEAD
`923833254b9463cfb163cac2aace2b2fb305333b` is 280 identities across 33 files.
Earlier 277-identity executions remain valid historical evidence, but they do
not satisfy the current complete-suite acceptance requirement. This count-only
reconciliation leaves the commands, retries, worker profiles, diagnosis,
bounded fix, assertions, and behavior contract unchanged.

## Requirements

| ID | Requirement |
|---|---|
| FR-B005-01 | The global Center Journey regression MUST pass as part of all 280 current identities across 33 files in the complete four-worker browser suite with retries disabled. |
| FR-B005-02 | The same regression MUST pass as part of all 280 current identities across 33 files in the complete serial browser suite with retries disabled. |
| FR-B005-03 | The regression MUST still require the Journey panel to be visible, the mount state to equal `ready`, and `__rljourneyController` to exist. |
| FR-B005-04 | The regression MUST still compare the complete Journey tool order to `tools.json`, reject duplicates, and require `market-brief` first. |
| FR-B005-05 | Any increased readiness budget MUST be scoped to the global Center case; the helper default for ordinary tool-page Journey tests MUST remain 15 seconds. |
| FR-B005-06 | The chosen Center wait MUST be finite, evidence-backed, and strictly smaller than its target-only containing Playwright test budget; if the current outer budget leaves no deterministic margin, only this target may receive a larger outer budget. |
| FR-B005-07 | No request interception, retry, fixed sleep, failure-condition early return, or assertion weakening is permitted. |
| FR-B005-08 | No production HTML, JavaScript, registry, configuration, Feature 004 artifact, or parent Feature 012 artifact may change. |

## Acceptance Scenario

```gherkin
Scenario: SCN-B005-001 Global Journey readiness survives complete-suite load
  Given the full browser suite runs Feature 012 Journey cases under shared host load with retries disabled
  When the Market Action Center test opens Journey and waits for the shipped visible panel, ready mount state, and __rljourneyController
  Then the unchanged readiness assertions complete within a measured suite-safe budget
  And the Center lists the complete tool registry exactly once
  And market-brief remains the first Journey tool
```

## Adversarial Contract

The regression must remain red when any substantive readiness condition is
removed from the product state: a hidden panel, a mount that stays unavailable,
or an absent controller must exhaust the finite wait and fail. Restoring the old
15-second Center budget under the preserved complete-suite workload must also
reproduce the timing failure before the fix is accepted.

## Quality Attributes

- **Determinism:** no retries and no timing-dependent optional assertions.
- **Bounded execution:** one finite Center-specific timeout within Playwright's
  containing test budget.
- **Test fidelity:** real static server, real page, real JSON inputs, real shared
  runtime, and no request interception.
- **Isolation:** no mutation outside the Feature 012 test file.

## Out Of Scope

- Changing Journey production loading, controller construction, or registry data.
- Changing the intraday expected-failure marker; its body still fails as expected.
- Editing or certifying Feature 004 Scope 1.
- Broad timeout increases for all Journey tests or the entire Playwright project.
