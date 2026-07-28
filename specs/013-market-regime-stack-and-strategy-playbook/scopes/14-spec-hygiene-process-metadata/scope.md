# SCOPE-14: Specification hygiene — process metadata removal

**Status:** Not Started
**Tags:** `closure:true`
**Depends On:** —
**Primary Outcome:** The active specification carries zero embedded agent result-envelope blocks and zero stale authoring claims that its own contents contradict; process metadata lives in execution artifacts instead.

## Objective

Close BS-013-030. The active `spec.md` embeds 5 agent result-envelope blocks (measured at lines 244, 411, 728, 1145, 1596) and 4 stale authoring claims asserting that sections are unwritten when those sections exist in the same file. `spec.md` is the requirement surface downstream owners read; process metadata from an authoring run belongs in that run's execution artifact, not in the requirement surface. This scope removes both classes of embedded process metadata and adds a mechanical guard so neither can return.

This scope has no dependency. It changes no runtime surface, no contract, and no consumer, so it is not gated behind any other scope and it gates none.

## Implementation Files

| File | Change |
|---|---|
| `spec.md` | Remove the 5 embedded agent result-envelope blocks and the 4 stale authoring claims whose named sections exist in the same file. No requirement text, no business scenario, no functional requirement, and no business policy is altered — the edit is confined to the process-metadata blocks and the stale claims themselves. |
| `scripts/selftest.mjs` | Add the spec-hygiene guard assertions: zero embedded result-envelope blocks and zero stale authoring claims in the active specification. |

`design.md` → `## Implementation Boundary` governs the product-code surface this feature may create or modify. `spec.md` is a specification artifact rather than product code, so it is not listed there and this documentation edit does not touch the product boundary; `scripts/selftest.mjs` is the one boundary file this scope modifies, and it is already listed.

## Gherkin Scenarios

### BS-013-030: The active specification carries no embedded process metadata

```gherkin
Scenario: Agent result envelopes and stale authoring claims are absent from the active spec
  Given the active specification is the requirement surface read by downstream owners
  When the specification is inspected for process metadata
  Then it contains zero embedded agent result-envelope blocks
  And it contains zero "not yet written" claims about sections that exist in the same file
  And any agent result envelope for a run is recorded in that run's execution artifact instead
  And a stale authoring claim that contradicts the file's own contents is reported as a
    stale-process-metadata defect
```

## Implementation Plan

1. **Locate the embedded blocks.** The 5 embedded result-envelope blocks are measured in the review pass at lines 244, 411, 728, 1145, and 1596. Each is removed in full, together with any heading that exists only to introduce it.
2. **Locate the stale claims.** The 4 stale authoring claims assert a section is unwritten while that section exists in the same file. Each is removed rather than corrected in place, because the claim is process metadata about an authoring run rather than a requirement.
3. **Requirement text is untouched.** The edit removes only process metadata. Every business scenario, functional requirement, business policy, and contract paragraph in `spec.md` is preserved byte-for-byte, verified by diffing the retained content around each removal.
4. **Envelopes belong in execution artifacts.** An agent result envelope for a run is recorded in that run's execution artifact. This scope adds no envelope to `spec.md` and none to any scope artifact.
5. **Mechanical guard.** Add a selftest assertion that the active specification contains zero embedded result-envelope blocks and zero stale authoring claims, so a future authoring run cannot reintroduce either silently.
6. **Defect reporting.** A stale authoring claim that contradicts the file's own contents is reported as a stale-process-metadata defect by the guard, naming the claim and the section that contradicts it.

**Test-coverage note.** BS-013-030 asserts a property of the specification artifact rather than of a rendered page, so its scenario-specific persistent protection is the mechanical `spec-hygiene` guard in `[TP-14-04]`, which fails if either class of process metadata returns. The `e2e-ui` row `[TP-14-06]` carries the same scenario's confinement claim onto the real page: it re-runs the feature's registered real-page regression cases to prove this scope's process-metadata edit reached no rendered regime surface and no consumer contract. This scope authors no new Playwright case of its own; `[TP-14-06]` executes the cases the other scopes register.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-14-01 | Functional | `functional` | `scripts/selftest.mjs` group `spec-hygiene` / `the active specification contains zero embedded agent result-envelope blocks` | **BS-013-030: The active specification carries no embedded process metadata** — the guard scans the active `spec.md` and asserts an embedded result-envelope block count of zero, against the 5 blocks measured by the review pass. | `node scripts/selftest.mjs` | No |
| TP-14-02 | Functional | `functional` | `scripts/selftest.mjs` group `spec-hygiene` / `the active specification contains zero stale authoring claims about sections that exist in the same file` | The guard asserts zero remaining authoring claims that a section is unwritten while that named section exists in the same file, against the 4 claims measured by the review pass, and reports any survivor as a stale-process-metadata defect naming the contradicting section. | `node scripts/selftest.mjs` | No |
| TP-14-03 | Unit | `unit` | `scripts/selftest.mjs` group `spec-hygiene` / `requirement text is preserved: the business scenario, functional requirement, and business policy inventories are unchanged by the hygiene edit` | The removal is confined to process metadata: the counts and ids of business scenarios, functional requirements, and business policies in `spec.md` are unchanged from before the edit. | `node scripts/selftest.mjs` | No |
| TP-14-04 | Regression Guard | `functional` | `scripts/selftest.mjs` group `spec-hygiene` / `Regression: BS-013-030 reintroducing an embedded result-envelope block or a stale authoring claim fails the spec-hygiene guard` | **ADVERSARIAL RED-bite**, persistent and named — a fixture reintroduces one embedded result-envelope block and one stale authoring claim into a specification fixture. The named guard MUST fail under that fixture and MUST pass against the cleaned specification. This is the permanent regression protection for this scope. | `node scripts/selftest.mjs` | No |
| TP-14-05 | Functional | `functional` | `scripts/selftest.mjs` — complete suite, every pre-existing group plus the additive `spec-hygiene` group | Broad-suite regression: the full selftest suite stays green with the additive `spec-hygiene` group, every pre-existing group is preserved byte-for-byte, and the total passing count does not decrease. | `node scripts/selftest.mjs` | No |
| TP-14-06 | Regression E2E | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `Regression: BS-013-030 the process-metadata edit reaches no rendered regime surface` | **BS-013-030 confinement claim carried onto the real page**, persistent and named — the feature's registered real-page regression cases run green unchanged after this scope's process-metadata edit, proving the edit stayed inside `spec.md` process metadata plus the additive `spec-hygiene` selftest group and reached no rendered regime surface and no consumer contract. A hygiene edit that reached product behavior fails this named spec. This scope authors no new case here; it executes the cases the other scopes register. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |

### Definition of Done

#### Core Items

- [ ] `[TP-14-01]` `[TP-14-02]` `[BS-013-030]` Agent result envelopes and stale authoring claims are absent from the active spec: the active `spec.md` contains zero embedded agent result-envelope blocks and zero stale authoring claims about sections that exist in the same file, every agent result envelope for a run is instead recorded in that run's execution artifact, and a stale authoring claim that contradicts the file's own contents is reported as a stale-process-metadata defect.
- [ ] `[TP-14-01]` `[BS-013-030]` The active specification contains zero embedded agent result-envelope blocks; all 5 blocks measured by the review pass are removed in full.
- [ ] `[TP-14-02]` `[BS-013-030]` The active specification contains zero stale authoring claims about sections that exist in the same file; all 4 measured claims are removed and any survivor is reported as a stale-process-metadata defect naming the contradicting section.
- [ ] `[TP-14-03]` `[BS-013-030]` Requirement text is preserved: the business scenario, functional requirement, and business policy inventories in `spec.md` are unchanged in count and in id by the hygiene edit.
- [ ] `[TP-14-04]` `[BS-013-030]` The adversarial fixture reintroducing one embedded result-envelope block and one stale authoring claim fails the named `spec-hygiene` guard, and the cleaned specification passes it — this is the scope's persistent, named regression protection.
- [ ] `[TP-14-05]` The complete selftest suite stays green with the additive `spec-hygiene` group, every pre-existing group preserved and no decreased passing count.
- [ ] `[BS-013-030]` An agent result envelope for a run is recorded in that run's execution artifact; this scope adds no envelope to `spec.md` and none to any scope artifact it delivers.
- [ ] `[BS-013-030]` The edit is confined to process metadata: no business scenario, functional requirement, business policy, or contract paragraph is altered, and the retained content around each removal diffs clean.
- [ ] `[BS-013-030]` The delivery carries no placeholder text left in place of a removed block, no deferral language, and no stub; the only product-boundary file modified is `scripts/selftest.mjs`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-14-04]` `[BS-013-030]` the named `spec-hygiene` guard is permanently registered and fails if an embedded result-envelope block or a stale authoring claim returns, and `[TP-14-06]` the feature's real-page regression spec holds its permanently registered cases asserting that this scope's process-metadata edit reached no rendered regime surface.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the feature's real-page Playwright regression spec both run green once this scope lands, with every previously registered group, assertion, and regression case preserved and no decreased passing count.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
