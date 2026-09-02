# BUG-010 Planning Intake

**Artifact owner:** `bubbles.plan`
**Current authoring state:** `route_required` after analyst, UX, and design
**Workflow mode:** `bugfix-fastlane`
**Packet status:** `in_progress`

[Bug](bug.md) | [Expected-behavior intake](spec.md) |
[Design intake](design.md) | [Report](report.md) |
[User validation](uservalidation.md) |
[Scenario manifest](scenario-manifest.json) |
[Structured Test Plan](test-plan.json)

## Ownership Boundary

No plan phase has executed. The sections below preserve bug-owner inputs for the
canonical analyst, UX, design, and plan chain. `bubbles.plan` must adopt or amend
the scope, scenario, test, and Definition of Done structures after the prior
owners finish.

## Scope 1: Synchronize Persisted Interest Signals

**Scope ID:** `01-synchronize-persisted-interest-signals`
**Status:** Not Started
**Depends On:** None
**Planning authority:** Provisional bug-owner intake. `bubbles.plan` has not
adopted this scope.

### Candidate Scope Boundary

The delivery should synchronize durable interest signals with accepted page
behavior while preserving Feature 008 atomicity and inference containment.

Observed implementation surfaces for planner review:

- `rlportfolio.js`
- `portfolio-survival-allocation-lab.html`
- `tests/portfolio-privacy.functional.mjs`
- `tests/portfolio-survival-brief.spec.mjs`
- `tests/portfolio-survival-allocation.spec.mjs`
- `tests/portfolio-stale-domain-signal.unit.mjs`

The final plan must enumerate allowed and excluded paths after design selects
the transaction boundary. This bug-owner phase authorizes no delivery edit.

### Gherkin Scenarios

#### SCN-B010-001 - Eligible page completions persist current signals

```gherkin
Scenario: SCN-B010-001 eligible page completions persist current signals
	Given two eligible completed-research events satisfy the declared floor
	When the user confirms both through the registered page
	Then one current non-empty interestSignals cache is persisted with the events
```

#### SCN-B010-002 - Reload retains persisted signal evidence

```gherkin
Scenario: SCN-B010-002 reload retains persisted signal evidence
	Given a current interest signal was persisted through the registered page
	When the page reloads from the local workspace store
	Then the signal and its supporting evidence survive the storage reread
```

#### SCN-B010-003 - Stale-only evidence removes the persisted signal

```gherkin
Scenario: SCN-B010-003 stale-only evidence removes the persisted signal
	Given a persisted domain has only evidence outside the maximum age
	When the current interest-signal cache is synchronized
	Then the stale signal is removed without an exception
```

#### SCN-B010-004 - Behavior clear removes events and interests

```gherkin
Scenario: SCN-B010-004 behavior clear removes events and interests
	Given behavior events and derived interests are persisted
	When the user confirms behavior clear
	Then events and interests are empty on storage reread
```

#### SCN-B010-005 - Passive activity creates no inferred interest

```gherkin
Scenario: SCN-B010-005 passive activity creates no inferred interest
	Given no eligible completed-research action occurs
	When the user changes settings mode scroll or dwell
	Then no behavior event or interest signal is created
```

#### SCN-B010-006 - Black-Litterman observes signals without using them

```gherkin
Scenario: SCN-B010-006 Black-Litterman observes signals without using them
	Given a real persisted interest signal exists and no explicit view exists
	When the Black-Litterman editor renders
	Then its audit sees the real signal count
	And behavior derives no view return adjustment or confidence
```

#### SCN-B010-007 - Failed persistence preserves the prior generation

```gherkin
Scenario: SCN-B010-007 failed persistence preserves the prior generation
	Given the prior workspace generation is authoritative
	And the next storage write fails
	When the user confirms a completed-research action
	Then the prior generation remains authoritative
	And the page states that the event was not recorded
```

### Candidate Scenario Summary

| Candidate | Given | When | Then |
| --- | --- | --- | --- |
| `SCN-B010-001` | Two eligible completed-research events satisfy the declared floor | The user confirms both through the real page | One current non-empty `interestSignals` cache is persisted with the events |
| `SCN-B010-002` | A persisted current signal exists | The page reloads from the local workspace store | The signal and its supporting evidence survive the reread |
| `SCN-B010-003` | The persisted domain has only evidence outside the maximum age | The current cache is synchronized | The stale signal is removed without an exception |
| `SCN-B010-004` | Persisted behavior and interests exist | The user confirms behavior clear | Events and interests are empty on storage reread |
| `SCN-B010-005` | No eligible completion occurs | The user changes settings, mode, scroll, or dwell | No behavior event or interest signal is created |
| `SCN-B010-006` | A real persisted interest signal exists and no explicit view exists | The Black-Litterman editor renders | The audit sees the real signal count and derives zero views, return adjustments, or confidence |
| `SCN-B010-007` | The prior generation is authoritative and the next storage write fails | The user confirms a completion | The prior generation remains authoritative and the UI states that the event was not recorded |

These identifiers are discovery inputs. They become governed scenario
contracts only after `bubbles.plan` adopts them in `scenario-manifest.json`.

### Test Plan

| Plan ID | Test Type | Category | Scenario | Candidate file | Required behavior | Live system |
| --- | --- | --- | --- | --- | --- | --- |
| `TP-B010-001` | Functional | `functional` | `SCN-B010-001`, `SCN-B010-003`, `SCN-B010-004`, `SCN-B010-007` | `tests/portfolio-privacy.functional.mjs` | One composed candidate replaces signals, commits atomically, rereads them, and refuses a failed write without divergence | No |
| `TP-B010-002` | Regression E2E | `e2e-ui` | `SCN-B010-001`, `SCN-B010-002`, `SCN-B010-007` | `tests/portfolio-survival-brief.spec.mjs` | Real page completions persist non-empty signals and retain them after reload | Yes |
| `TP-B010-003` | Regression E2E | `e2e-ui` | `SCN-B010-003` | `tests/portfolio-survival-brief.spec.mjs` | Stale-only synchronization removes the persisted signal without throwing | Yes |
| `TP-B010-004` | Regression E2E | `e2e-ui` | `SCN-B010-004`, `SCN-B010-005` | `tests/portfolio-survival-brief.spec.mjs` | Behavior clear empties events and interests, while passive activity creates neither | Yes |
| `TP-B010-005` | Regression E2E | `e2e-ui` | `SCN-B010-006` | `tests/portfolio-survival-allocation.spec.mjs` | Black-Litterman accounting observes the persisted signal count and still derives zero behavior contribution | Yes |
| `TP-B010-006` | Adversarial regression | `functional` | `SCN-B010-003` | `tests/portfolio-stale-domain-signal.unit.mjs` and the selected page carrier | Restoring the direct event-only commit turns the persisted-signal assertion red | No |
| `TP-B010-007` | Broader Regression E2E | `e2e-ui` | All changed BUG-010 scenarios | Existing Feature 008 browser matrix | Existing Feature 008 user workflows remain green | Yes |

No command result is claimed. `bubbles.plan` owns final command selection,
scenario mapping, and Test Plan to DoD parity.

### Definition of Done

- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
- [ ] Broader E2E regression suite passes
- [ ] The analyst-owned outcome contract and requirements are complete.
- [ ] The UX-owned success, failure, reload, clear, inventory, and exclusion states are complete.
- [ ] The design owner selects one atomic transaction and records rejected alternatives.
- [ ] `TP-B010-001` proves `SCN-B010-001`, `SCN-B010-003`, `SCN-B010-004`, and `SCN-B010-007` through atomic candidate composition, reread, and failed-write preservation.
- [ ] `TP-B010-002` proves `SCN-B010-001`, `SCN-B010-002`, and `SCN-B010-007` through real-page persistence, reload, and failed-write behavior.
- [ ] `TP-B010-003` proves `SCN-B010-003` stale-only signal removal without throwing.
- [ ] `TP-B010-004` proves `SCN-B010-004` behavior clear and `SCN-B010-005` passive-activity exclusion.
- [ ] `TP-B010-005` proves `SCN-B010-006` observed signal count and zero Black-Litterman contribution.
- [ ] `TP-B010-006` proves `SCN-B010-003` remains adversarially detectable when the direct event-only commit returns.
- [ ] `TP-B010-007` proves broader Feature 008 browser behavior remains intact.
- [ ] Delivery changes stay inside the plan-owned change boundary.
- [ ] Human acceptance remains separate and unclaimed until a human acts.

All items remain unchecked because no delivery, product test, validation,
certification, or human acceptance occurred in this bug-owner phase.
