# Scope 7 — Static owner experience

Scope ID: `07-static-owner-experience`
**Status:** Not Started
Scope-Kind: runtime-behavior
Depends On: `06-frozen-event-accountability`

## Outcome And Requirements

Deliver one usable static browser route from validated committed generation records. Simple, Power, Brief, and six domain journeys agree on identity, cutoff, evidence, model status, alerts, and coverage. Exports preserve qualifiers. FR-034-097–106, integration of 042–045 and 065; SCN-034-017, 029–032; NFR-034-003, 006–007, 012–014.

## Gherkin

```gherkin
Scenario: SCN-034-029 Simple explains a bounded thesis
  Given a current company assessment
  When the operator opens Simple on the real static route
  Then change, mechanism, next gate, critical dependency, falsifier and largest missing input are visible

Scenario: SCN-034-030 Power reconstructs the derivation
  Given a signal in Simple or Brief
  When the operator follows its owner link into Power
  Then evidence, conflicts, milestone, dependency, model, assumptions and generation diff are inspectable

Scenario: SCN-034-017 Brief orders its horizons correctly
  Given a company has next-event, six-month and twelve-month records
  When the Brief renders
  Then the next-earnings assessment appears first
  And the longer horizons remain separately labeled

Scenario: SCN-034-031 Missing qualified signals remain visible
  Given no company qualifies for a realization alert in one horizon
  When the Brief publishes
  Then that section states that no signal qualified
  And coverage failures and abstentions remain visible
```

`TP-07-05` supplies pre-publication integration coverage for `SCN-034-032`. The sole Gherkin definition and ownership for that publication-coherence scenario remain in Scope 8.

## Implementation Plan

1. Add `ai-opportunity-intelligence-lab.html`, ordinary `rlexperience.js`/`rlviews.js` view integration, and `rlexperience-adapters/ai-opportunity.js` projection. Paint committed current data on first load without credentials or a network proxy.
2. Build Simple causal chain, Power evidence/graph/model/universe, deterministic six-section Brief and six journeys: sufficiency, critical path, underwriting, conflicts, recruitment-to-utilization, event accountability.
3. Resolve all owner links against one hash-validated selector. A transient user assumption never mutates owner read, Brief, forecast, generation or history. Reset restores baseline.
4. Escape external and model-authored text. Provide semantic headings/tables, units, responsive touch/keyboard/zoom/reduced-motion parity, explicit timezone and unavailable states.
5. Add lossless structured export with IDs, clocks, measurement class, evidence/assumption qualifiers and limitations. Keep registry/public Pages integration for Scope 8.

## Test Plan

| ID | Type | Scenario ID | Persistent File and Exact Title | Command | Live system |
| --- | --- | --- | --- | --- | --- |
| TP-07-01 | e2e-ui | SCN-034-029 | `tests/ai-opportunity-intelligence-lab.spec.mjs` — `Regression: Simple shows one bounded causal chain and largest missing input` | `npx --no-install playwright test tests/ai-opportunity-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes, real static server and route; no owned-response mocks |
| TP-07-02 | e2e-ui | SCN-034-030 | `tests/ai-opportunity-intelligence-lab.spec.mjs` — `Regression: Power reconstructs the selected signal from source records` | `npx --no-install playwright test tests/ai-opportunity-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes, real static server and route; no owned-response mocks |
| TP-07-03 | e2e-ui | SCN-034-017 | `tests/ai-opportunity-intelligence-lab.spec.mjs` — `Regression: Brief places next earnings before six-month and twelve-month horizons` | `npx --no-install playwright test tests/ai-opportunity-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes, real static server and route; no owned-response mocks |
| TP-07-04 | e2e-ui | SCN-034-031 | `tests/ai-opportunity-intelligence-lab.spec.mjs` — `Regression: Brief preserves explicit empty states coverage failures and abstentions` | `npx --no-install playwright test tests/ai-opportunity-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes, real static server and route; no owned-response mocks |
| TP-07-05 | e2e-ui | SCN-034-032 | `tests/ai-opportunity-intelligence-lab.spec.mjs` — `Regression: Simple Power Brief and Journey refuse mixed generations` | `npx --no-install playwright test tests/ai-opportunity-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes, real static server and route; no owned-response mocks |

### Definition of Done

- [ ] SCN-034-029: Simple explains a bounded thesis is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-030: Power reconstructs the derivation is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-017: Brief orders its horizons correctly is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-031: Missing qualified signals remain visible is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-032 pre-publication integration coverage is verified without creating a second scenario definition.
- [ ] TP-07-01 passes on the real static route with visible causal-chain and missing-input assertions.
- [ ] TP-07-02 passes with visible source, conflict, milestone, dependency, model, and generation-diff assertions.
- [ ] TP-07-03 passes with visible next-earnings-first and separately labeled horizon assertions.
- [ ] TP-07-04 passes with visible empty-state, coverage-failure, and abstention assertions.
- [ ] TP-07-05 passes at desktop/mobile/zoom and keyboard access with mixed-generation refusal evidence.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass.
- [ ] Broader E2E regression suite passes.
- [ ] Build quality gate: selftest, per-page inline-script/ID check, source-text escaping, accessibility, artifact lint and tool note pass; no credentials or private state persist.
