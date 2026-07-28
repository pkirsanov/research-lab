# SCOPE-8: Regression + governance closure

**Status:** Not Started
**Tags:** `closure:true`, `regression:true`, `governance:true`
**Depends On:** SCOPE-1, SCOPE-2, SCOPE-3, SCOPE-4, SCOPE-5, SCOPE-6, SCOPE-7

## Objective

Close the feature as a whole: wire every selftest group into the project check, register the protected-scenario regression set so a re-introduced defect fails a named test, and complete artifact and traceability closure across all 22 business scenarios. This scope proves the single-source claim holds after every upstream scope has landed, not scenario by scenario in isolation.

## Implementation Files

| File | Change |
|---|---|
| `scripts/selftest.mjs` | Add the `rlratio`, `rlregime`, `rlregime-compose`, `rlregime-projection`, `rlregime-history`, `regime-primitives`, and `rlratio-scale` groups and confirm the hard-asserted registry counts. |
| `notes/market-regime-lab.md` | Complete the handoff doc with the delivered surface, the published read shape, and the retired duplicate inventory. |

No other path is touched. This scope adds no production behavior; it verifies and records what SCOPE-1 through SCOPE-7 delivered.

## Gherkin Scenarios

### BS-013-024: One regression inside the protected scenario set refuses governance closure

```gherkin
Scenario: The protected scenario set re-runs as a set and a single regression blocks closure
  Given the protected scenario set is BS-013-001 through BS-013-022
  And governance closure for this feature requires that protected set to re-run as one set rather than scenario by scenario
  When the protected set is re-run and every scenario in it holds
  Then closure is reported only with the whole set holding and the number of scenarios re-run named
  When the protected set is re-run and exactly one scenario within it regresses
  Then closure is refused and the regressing scenario is named
  And closure is not reported as partial, provisional, or passing-with-exceptions
  And the scenarios that still hold do not offset the single regression
```

## Consumer Impact Sweep

Governance closure re-verifies every surface the preceding scopes renamed, removed, or migrated, so the closure itself consumes the full protected-scenario set and every registry those scopes moved. The enumeration below is the complete re-verification surface. A stale-reference scan run at closure must return zero remaining first-party references to any derivation, identifier, or count retired by SCOPE-2 through SCOPE-7.

| Re-verified surface | Path | What closure re-verifies |
| --- | --- | --- |
| Protected scenario set | the `BS-013-*` scenarios registered across every scope of this feature | Every protected scenario holds; a single regression inside the set refuses closure outright and is not offset by the scenarios that still pass. |
| Selftest group registration | `scripts/selftest.mjs` | All seven groups — `rlratio`, `rlregime`, `rlregime-compose`, `rlregime-projection`, `rlregime-history`, `regime-primitives`, `rlratio-scale` — are wired in and the complete suite runs green. |
| Tool registry | `tools.json` | Holds the registered tool and matches its hard-asserted count of 22 ordinary tools. |
| Simple-model registry | `simple-models.json` | Holds the registered Simple model entry. |
| Journey registry | `journeys.json` | Holds 48 journey definitions against 48 total goals and 4 Market Action Center goals. |
| Experience config | `tool-experience.config.json` | `adapterPolicy.moduleAllowlist` still holds exactly 7 entries. |
| Landing-page inventory and shared navigation | `index.html` `TOOLS` array, `rlnav.js` `TOOLS` array | Every navigation entry and landing-page deep link resolves, with no dead entry and no silent redirect left behind by the registration or migration scopes. |
| Registry validator | `scripts/validate-tool-experience.mjs` | Passes against the registries with the exact asserted counts, so no registry and its assertion disagree at closure. |
| Handoff documentation | `notes/market-regime-lab.md` | Documents the delivered composer, facets, owner read, and registries with no reference to a retired derivation. |

Stale-reference scan surface: every navigation entry, every landing-page deep link, and every redirect across the registered tool set, plus every remaining first-party reference to a retired regime derivation or a pre-registration hard-asserted count.

## Implementation Plan

1. **Selftest group wiring.** Register all seven groups — `rlratio`, `rlregime`, `rlregime-compose`, `rlregime-projection`, `rlregime-history`, `regime-primitives`, `rlratio-scale` — in `scripts/selftest.mjs` so the project check exercises the pure modules on every run.
2. **Registry count confirmation.** Re-confirm the FR-051 hard-asserted counts SCOPE-5 moved (22 ordinary tools, 4 Market Action Center goals, 48 total goals, 48 journey definitions) and confirm `adapterPolicy.moduleAllowlist` still holds exactly 7 entries.
3. **Adversarial regression mutations.** Register the four RED-bite mutations from `design.md` → `## Testing Strategy` — neutralizing the no-cycle rule, the denominator shrink, the family collapse, or the archetype fallback — each required to fail a specifically named test rather than merely reducing a coverage number.
4. **Protected-scenario regression set.** Register the feature's protected scenarios under the repo's `protected-scenarios` regression policy so a reintroduced defect in any of the 22 owned scenarios fails loudly.
5. **Live-stack authenticity sweep.** Assert that no live-stack spec for this feature uses `page.route`, `context.route`, `intercept(`, `cy.intercept`, `msw`, or `nock`, and that no required spec contains a silent-pass bailout that converts a missing behavior into a pass.
6. **Consumer-trace closure.** Confirm zero remaining first-party references to the regime derivations SCOPE-6 retired, across pages, notes, registry metadata, and docs.
7. **Handoff doc completion.** Finish `notes/market-regime-lab.md` with the delivered surface, the published owner-read shape, the facet-source inventory, and the retired-duplicate inventory, so the next reader can see what became single-source and what was deleted.
8. **Traceability closure.** Confirm each of BS-013-001 … BS-013-022 traces to its single owning scope and that the feature's artifact set is internally consistent before the feature is proposed as complete.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-08-01 | Functional | `functional` | `scripts/selftest.mjs` — complete suite with the `rlratio`, `rlregime`, `rlregime-compose`, `rlregime-projection`, `rlregime-history`, `regime-primitives`, and `rlratio-scale` groups wired in | Broad-suite regression: all seven groups are registered in the project check and the complete selftest suite runs green, every pre-existing group preserved byte-for-byte and the total passing count not decreased. | `node scripts/selftest.mjs` | No |
| TP-08-02 | E2E UI | `e2e-ui` | `tests/` — the complete Playwright suite including `tests/market-regime-lab.spec.mjs`, `tests/market-regime-lab.stress.spec.mjs`, and `tests/market-regime-consumer-migration.spec.mjs` | The complete Playwright suite runs green under the system-chrome project, covering the SCOPE-4 surface matrix rows, the SCOPE-4 stress spec, and the SCOPE-6 consumer-migration spec together with every pre-existing spec in the suite. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-03 | Integration | `integration` | `.github/bubbles/scripts/artifact-lint.sh` against `specs/013-market-regime-stack-and-strategy-playbook` | Artifact closure: the feature's artifact set passes `artifact-lint.sh` with the spec, design, per-scope directories, index, report, user validation, and state artifacts all structurally consistent. | `bash .github/bubbles/scripts/artifact-lint.sh specs/013-market-regime-stack-and-strategy-playbook` | No |
| TP-08-04 | Integration | `integration` | `.github/bubbles/scripts/traceability-guard.sh` against `specs/013-market-regime-stack-and-strategy-playbook` | Traceability closure: each of BS-013-001 … BS-013-022 traces to exactly one owning scope with no unowned and no doubly-owned scenario, and every scope's Test Plan row count equals its test-related Definition of Done item count. | `bash .github/bubbles/scripts/traceability-guard.sh specs/013-market-regime-stack-and-strategy-playbook` | No |
| TP-08-05 | Integration | `integration` | `.github/bubbles/scripts/state-transition-guard.sh` against `specs/013-market-regime-stack-and-strategy-playbook` | Transition closure: the state-transition guard passes for the feature directory, confirming every scope's Definition of Done is satisfied with recorded evidence before the feature is proposed as complete. | `bash .github/bubbles/scripts/state-transition-guard.sh specs/013-market-regime-stack-and-strategy-playbook` | No |
| TP-08-06 | Integration | `integration` | `scripts/selftest.mjs` group `regime-primitives` / `the protected-scenario regression set holds BS-013-001 through BS-013-022 as a set` | **BS-013-024: One regression inside the protected scenario set refuses governance closure** — the protected scenario set BS-013-001 through BS-013-022 re-runs as one set rather than scenario by scenario, and when every scenario in it holds, closure is reported only with the whole set holding and the number of scenarios re-run named. | `node scripts/selftest.mjs` | No |
| TP-08-07 | Integration | `integration` | `scripts/validate-tool-experience.mjs` — registry validation over the post-SCOPE-5 registries | Registry-count confirmation: the FR-051 counts SCOPE-5 moved (22 ordinary tools, 4 Market Action Center goals, 48 total goals, 48 journey definitions) still hold after every upstream scope has landed, and `adapterPolicy.moduleAllowlist` still holds exactly 7 entries. | `node scripts/validate-tool-experience.mjs` | No |
| TP-08-08 | Functional | `functional` | `scripts/selftest.mjs` group `regime-primitives` / `no live-stack spec for this feature intercepts requests and no required spec contains a silent-pass bailout` | Live-stack authenticity sweep: no live-stack spec for this feature uses `page.route`, `context.route`, `intercept(`, `cy.intercept`, `msw`, or `nock`, and no required spec contains a silent-pass bailout that converts a missing behavior into a pass. | `node scripts/selftest.mjs` | No |
| TP-08-09 | Integration | `integration` | `scripts/selftest.mjs` group `regime-primitives` / `zero first-party references remain to the regime derivations retired by the migration` | Consumer-trace closure: zero remaining first-party references to the regime derivations SCOPE-6 retired, swept across pages, notes, registry metadata, and docs, so no caller resolves to a deleted path. | `node scripts/selftest.mjs` | No |
| TP-08-10 | Integration | `integration` | `scripts/selftest.mjs` group `regime-primitives` / `IP-002 no-cycle: no facet source imports a Tier 2 module and no facet declares the composed regime as an input` | **ADVERSARIAL RED-bite** — neutralize the no-cycle rule by letting a facet source import a Tier 2 module and declare the composed regime as one of its inputs, anywhere in the tree. The named test `IP-002 no-cycle: no facet source imports a Tier 2 module and no facet declares the composed regime as an input` MUST fail under that mutation and MUST pass against the delivered tree. | `node scripts/selftest.mjs` | No |
| TP-08-11 | Integration | `integration` | `scripts/selftest.mjs` group `regime-primitives` / `a single regression inside the protected scenario set refuses closure and names the regressing scenario` | **BS-013-024: One regression inside the protected scenario set refuses governance closure** — **ADVERSARIAL RED-bite** — re-run the protected set with exactly one scenario within it regressed. Closure MUST be refused with the regressing scenario named, MUST NOT be reported as partial, provisional, or passing-with-exceptions, and the scenarios that still hold MUST NOT offset the single regression. | `node scripts/selftest.mjs` | No |
| TP-08-12 | Regression E2E | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `Regression: BS-013-024 the protected scenario set re-runs on the real page as one set` | Persistent scenario-specific regression coverage for this scope's closure behavior: the feature's real-page regression spec holds the permanently registered protected-scenario cases contributed by SCOPE-1 through SCOPE-7 and re-runs them as one set, so a re-introduced defect in any owned scenario fails its own named case on the live page rather than only inside the Node suite. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Items

- [ ] `[TP-08-01]` All seven groups — `rlratio`, `rlregime`, `rlregime-compose`, `rlregime-projection`, `rlregime-history`, `regime-primitives`, `rlratio-scale` — are wired into `scripts/selftest.mjs` and the complete suite runs green with no decreased passing count.
- [ ] `[TP-08-02]` The complete Playwright suite runs green under the system-chrome project, including the SCOPE-4 surface, SCOPE-4 stress, and SCOPE-6 consumer-migration specs alongside every pre-existing spec.
- [ ] `[TP-08-03]` `artifact-lint.sh` passes for `specs/013-market-regime-stack-and-strategy-playbook`.
- [ ] `[TP-08-04]` `traceability-guard.sh` passes for `specs/013-market-regime-stack-and-strategy-playbook` with every scenario owned exactly once and every scope at Test Plan / Definition of Done parity.
- [ ] `[TP-08-05]` `state-transition-guard.sh` passes for `specs/013-market-regime-stack-and-strategy-playbook`.
- [ ] `[TP-08-06]` `[BS-013-024]` The protected scenario set BS-013-001 through BS-013-022 re-runs as one set rather than scenario by scenario, and when every scenario in it holds, closure is reported only with the whole set holding and the number of scenarios re-run named.
- [ ] `[TP-08-07]` The FR-051 counts (22 / 4 / 48 / 48) and the exactly-7-entry `adapterPolicy.moduleAllowlist` still hold after every upstream scope has landed.
- [ ] `[TP-08-08]` No live-stack spec for this feature intercepts requests and no required spec contains a silent-pass bailout.
- [ ] `[TP-08-09]` Zero first-party references remain to the regime derivations SCOPE-6 retired, across pages, notes, registry metadata, and docs.
- [ ] `[TP-08-10]` The adversarial no-cycle neutralization makes the named IP-002 assertion fail before the delivered tree and pass after it.
- [ ] `[TP-08-11]` `[BS-013-024]` When the protected set is re-run and exactly one scenario within it regresses, closure is refused and the regressing scenario is named, closure is not reported as partial, provisional, or passing-with-exceptions, and the scenarios that still hold do not offset the single regression.
- [ ] The four RED-bite mutations from `design.md` → `## Testing Strategy` — no-cycle neutralization, denominator shrink, family collapse, and archetype fallback — are each registered against a specifically named failing test rather than a coverage number.
- [ ] `notes/market-regime-lab.md` records the delivered surface, the published owner-read shape, the facet-source inventory, and the retired-duplicate inventory, with no placeholder section and no default text.
- [ ] This scope adds no production behavior: no path outside `scripts/selftest.mjs` and `notes/market-regime-lab.md` is modified.
- [ ] Consumer impact sweep is completed at closure across every re-verified surface enumerated in this scope's `## Consumer Impact Sweep` section, and zero stale first-party references remain to any derivation, identifier, or hard-asserted count retired by SCOPE-2 through SCOPE-7, with every navigation entry and landing-page deep link resolving and no silent redirect left behind.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-08-12]` the feature's real-page regression spec holds the permanently registered protected-scenario cases contributed by SCOPE-1 through SCOPE-7 and re-runs them as one set on the live page.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the feature's real-page Playwright regression spec both run green at closure, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
