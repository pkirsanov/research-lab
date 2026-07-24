# Scope 01: Contract, Configuration, And Registry Foundation

## 01-contract-config-registry-foundation

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Done

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `shared-infrastructure:true`, `registry-critical:true`

Depends On: None

**Primary Outcome:** The repository has one versioned, fail-closed, Node/browser-safe experience contract/config/registry foundation that derives the current 23-entry inventory, validates every constituent definition and adapter declaration in shadow mode, and reports exact dependency predicates without claiming any provider, Brief, portfolio, or visible-shell integration.

## Requirement Coverage

- **Functional:** FR-001 through FR-003, FR-005, FR-008, FR-109, FR-113 through FR-117, and FR-119 through FR-120.
- **Non-functional:** NFR-005, NFR-013 through NFR-015, and NFR-017.
- **Design contracts:** `ToolExperience/v1`, `ToolExperienceConfig/v1`, closed view sets, safe adapter module paths, constituent definition references, `ExperienceError/v1`, and exact BUG-004/Feature 002/Feature 008 dependency predicates.

## Gherkin Scenarios

### SCN-012-033 - Registry foundation derives and validates every experience

```gherkin
Scenario: SCN-012-033 Experience validation resolves the current registry without a hardcoded tool list
  Given tools.json and the versioned experience configuration are present
  And each registered entry declares its exact view set, model, context, Brief policy, and Journey references
  When the production experience validator runs in Node and in a real browser page
  Then it derives exactly the current registry IDs and validates each ID once
  And a newly added valid registry entry participates without adding a runtime tool-ID branch
  And missing, duplicate, unknown-version, unsafe-module, or unresolved constituent metadata fails closed
  And no visible shell, provider retry, authored Brief, private portfolio, or publication capability is claimed
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-033 shadow validation | Real `index.html`, actual `tools.json`, config, definitions, and production validator | Open the real page, invoke the production shadow diagnostic, inspect registry result | Diagnostic reports one valid record per current ID and no visible mode replacement; an invalid mutation returns the exact safe `E012-*` refusal | e2e-ui |

## Implementation Files

### New

- `tool-experience.config.json`
- `simple-models.json`
- `journeys.json`
- `rlexperience.js`
- `scripts/validate-tool-experience.mjs`
- `tests/tool-experience.unit.mjs`
- `tests/tool-experience-registry.functional.mjs`
- `tests/tool-experience.spec.mjs`
- `tests/tool-experience.support.mjs`

### Modified

- `tools.json`
- `scripts/selftest.mjs`

## Implementation Plan

1. Add exact versioned configuration for the two ordered four-view sets, hash/focus/storage names, adapter-module allowlist, constituent registry paths, dependency predicates, budgets, and refusal codes; missing values have no code fallback.
2. Add all 23 explicit `experience` records to `tools.json`, preserving existing ID order, fields, briefing metadata, and registry parity. `market-brief` is the sole specialization; every ordinary entry declares the exact ordinary set.
3. Create complete declarative model and Journey registries from the design's 23-row implementation table. Scope 01 validates identity, references, parameters, mechanisms, goals, modules, and closed policy shapes only; domain compute and Journey runtime behavior remain owned by later scopes.
4. Implement the dual-runtime pure validator, canonical fingerprinting, safe adapter registration metadata, exact dependency resolver, and safe `ExperienceError/v1` projection in `rlexperience.js`. Do not bootstrap panels or mutate current routes in this scope.
5. Implement the CLI validator over real committed artifacts. It must derive counts and ID sets, validate a synthetic valid added-tool mutation without source edits, and adversarially reject omissions, duplicates, wrong view sets, unsafe module paths, unknown fields/versions, unresolved refs, and narrative-only dependency status.
6. Add the narrow RED tests before production files: expected failure is absent/invalid production contract, not syntax, missing test discovery, or browser setup.
7. Add a real-page shadow E2E that starts the repository's ephemeral same-origin server, opens `index.html`, executes production validation without interception, and verifies current visible navigation/modes remain untouched.
8. Add exact registry/config/source-lock canaries to `scripts/selftest.mjs` without weakening existing registry parity among `tools.json`, `index.html`, and `rlnav.js`.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| `tools.json` | Existing order, IDs, files, notes, tags, and `briefing` consumers remain byte-semantically compatible | Existing registry parity in `node scripts/selftest.mjs` plus a consumer projection test that ignores additive `experience` metadata |
| `scripts/selftest.mjs` | Existing assertions and failure counts remain intact | Run pre-change baseline and post-change full command; new assertions are additive and named Feature 012 |
| Feature 002 briefing metadata | Existing owner-read and final-aggregator semantics remain unchanged | Functional test compares every pre-existing `briefing` block before/after additive experience projection |
| Dependency states | Certification predicates read exact declared state fields and evidence requirements | Mutations with implementation claims but no certification remain false for Feature 002/008; BUG-004 remains false without required browser evidence |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Protected and byte-unchanged:** `rldata.js`, `rlviews.js`, `rlapp.js`, `rlbrief.js`, `rlg.js`, `rlticker.js`, `rlchart.js`, every root tool HTML file, `market-brief.html`, `market-brief.config.json`, `watchlist.json`, `scripts/fetch-options.mjs`, `data/options/**`, all Feature 002/008/BUG-004 artifacts and source, all QF files, package/source-lock files, and framework-managed files.

**No integration claim:** a true definition/registry predicate means only that the contract is structurally eligible. It does not certify an adapter, provider path, author, private workspace, browser experience, or public publication.

## Rollback

Remove the new Feature 012 contract/validator/test files, remove only additive `experience` objects from `tools.json`, and remove only the named additive selftest block. Verify the pre-scope registry parity and full selftest return to their recorded baseline. Rollback must not rewrite IDs, briefing metadata, source data, dependency state, or published artifacts.

## Scenario-First RED/GREEN Contract

Create TP-01-01, TP-01-02, and TP-01-03 before production/config edits. Run each exact command and require the intended missing-contract or invalid-contract assertion to fail. After the smallest implementation, rerun the identical command GREEN, then run TP-01-04 and TP-01-05. A missing system Chrome channel is an environment blocker, not RED evidence and not permission to substitute Playwright-managed Chromium.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-01-01 | Unit | unit | SCN-012-033 | `tests/tool-experience.unit.mjs` | Validate closed versions, view sets, definitions, paths, fingerprints, exact errors, and dependency predicate truth tables through production exports | `node --test tests/tool-experience.unit.mjs` | No | `report.md#tp-01-01` |
| TP-01-02 | Functional | functional | SCN-012-033 | `tests/tool-experience-registry.functional.mjs` | Validate actual 23-entry parity, current config/definitions, valid added-tool scaling, preserved briefing blocks, and adversarial missing/duplicate/unsafe/unresolved mutations | `node --test tests/tool-experience-registry.functional.mjs` | No | `report.md#tp-01-02` |
| TP-01-03 | Regression E2E | e2e-ui | SCN-012-033 | `tests/tool-experience.spec.mjs` | `Regression: SCN-012-033 real-page shadow registry validation derives all experiences without cutover` | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-033 real-page shadow registry validation derives all experiences without cutover" --reporter=list` | Yes | `report.md#scenario-scn-012-033` |
| TP-01-04 | Source-lock and contract validator | functional | SCN-012-033 | `scripts/validate-node-source-lock.mjs`, `scripts/validate-tool-experience.mjs` | Prove the exact checkout-local source graph remains locked and committed Feature 012 registries validate without runtime defaults | `node scripts/validate-node-source-lock.mjs && node scripts/validate-tool-experience.mjs` | No | `report.md#tp-01-04` |
| TP-01-05 | Broad regression | unit | SCN-012-033 | `scripts/selftest.mjs` | Preserve every existing helper, data-shell, registry, Brief, and model invariant while adding Feature 012 shadow canaries | `node scripts/selftest.mjs` | No | `report.md#tp-01-05` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [x] The complete ToolExperience/config/model/Journey declaration foundation is versioned, explicit, deeply validated, registry-derived, and shadow-only; Scope 01 makes no integrated capability claim. Evidence: [TP-01-01](report.md#tp-01-01), [TP-01-02](report.md#tp-01-02), [TP-01-04](report.md#tp-01-04), and [TP-01-05](report.md#tp-01-05).
- [x] All 23 existing IDs resolve exactly once, `market-brief` is the sole specialization, every ordinary entry declares two or more Journey references, and a valid added-tool mutation scales without a runtime ID list. Evidence: [TP-01-02](report.md#tp-01-02) and [TP-01-04](report.md#tp-01-04).
- [x] Dependency predicates reject narrative implementation claims and expose exact withheld/preserved capability metadata for BUG-004, Feature 002, and Feature 008. Evidence: [TP-01-01](report.md#tp-01-01) and [TP-01-04](report.md#tp-01-04).
- [x] Shared-infrastructure canaries prove existing registry, briefing, selftest, and source-owner behavior remains unchanged; rollback restores the baseline without touching protected data. Evidence: [Rollback Rehearsal Discriminator](report.md#rollback-rehearsal-discriminator), [Full Functional Reverification](report.md#full-functional-reverification), and [Broad Selftest Reverification](report.md#broad-selftest-reverification).

#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [x] TP-01-01 unit evidence proves the closed production contracts, fingerprints, failures, and exact dependency predicate truth tables. Evidence: [TP-01-01](report.md#tp-01-01).
- [x] TP-01-02 functional evidence proves real-registry parity, valid added-tool scaling, briefing preservation, and adversarial mutation rejection. Evidence: [TP-01-02](report.md#tp-01-02).
- [x] TP-01-03 real-page E2E evidence proves SCN-012-033 shadow validation and unchanged visible behavior with no interception. Evidence: [TP-01-03](report.md#tp-01-03), [No-Interception Scan](report.md#no-interception-scan), and [SCN-012-033](report.md#scn-012-033).
- [x] TP-01-04 source-lock/validator evidence proves the dependency graph and committed registry/config/definition packet are accepted without fallback sources. Evidence: [TP-01-04](report.md#tp-01-04).
- [x] TP-01-05 broad regression evidence proves the existing build-free Research Lab baseline remains green. Evidence: [TP-01-05](report.md#tp-01-05).

#### Build Quality Gate

- [x] Intended RED and identical-command GREEN records, exact runner identity before browser evidence, no-interception scan, source-lock, registry parity, protected-path diff, editor diagnostics, `git diff --check`, artifact lint, capability-foundation guard, and broad selftest are current and clean with zero unaccounted findings.
  Evidence: [Current Isolated Exact-Command RED/GREEN Replay](report.md#current-isolated-exact-command-redgreen-replay), including the provenance-backed ordered detector bridge and identical-command exit results, plus [Current Rollback And Quality Reverification](report.md#current-rollback-and-quality-reverification) and [Broad Selftest Reverification](report.md#broad-selftest-reverification).
