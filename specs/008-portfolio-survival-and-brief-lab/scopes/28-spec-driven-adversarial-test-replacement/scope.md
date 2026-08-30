# Scope 28: Spec-Driven Adversarial Test Replacement

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** In Progress
**Scope-Kind:** runtime-behavior
**Tags:** `test-integrity`, `remediation`
**Depends On:** 27
**Entry Gate:** Every scope in `Depends On` must be Done.
**Finding:** F008-TEST-INTEGRITY-001
**Requirements:** NFR-025.

## Outcome

Replace the reduced v1 scope-claims manifest and proxy assertions with one feature-specific v2 contract that derives the complete 41-row expected inventory from authoritative scope artifacts, verifies path and identity ownership, proves causal producer-to-consumer-to-assertion bindings with language-aware edges, and exercises every refusal through independent hostile mutations. Prior tests and reports remain historical baseline only and cannot satisfy this scope.

### Single-Implementation Justification

The scope-claims verifier serves only Feature 008's remaining boundary and consumer rows. No second feature or consumer needs this contract. A generic framework capability would add abstraction without reducing current complexity.

## Gherkin Scenario And Ownership

### SCN-008-054: Protected tests detect every audited defect class

```gherkin
Scenario: A repaired Feature 008 behavior is challenged by its original reduced implementation
  Given the complete authoritative scenario set and one adversarial case for every audited defect class
  When focused Node and real-page browser carriers execute production code
  Then every required title is discovered and reaches its assertions
  And each adversarial case fails when the audited defect is represented in an isolated test fixture or disposable copy
  And the repaired implementation passes the identical behavioral command
  And no file-wrapper success proxy optional assertion interception bailout or historical receipt substitutes for behavior proof
```

## Implementation Plan

1. Inventory the authored carriers for SCN-008-001 through SCN-008-054 against each exact Test Plan title, file, assertion, and adversarial discriminator; verify that SCN-008-055 retains one separate Scope 29 plan whose authored functional and E2E carriers are not Scope 28 execution prerequisites.
2. Replace file-wrapper, hardcoded-category, sentinel-only, existence-only, and reduced-implementation assertions with production-code behavior checks.
3. Add reachability checks proving every planned `test()`/Node title is discovered and executed; no zero-match selector may pass.
4. Add hostile fixtures or disposable copies for each finding without mutating shipped source in the shared working tree.
5. Run focused RED-equivalent discriminators and identical behavior commands on the repaired tree, then the full Node, Feature 008 browser, existing-consumer, and selftest matrices.
6. Keep old report evidence and tests in Git history; current certification may cite only the new exact rows and current execution receipts.

## Change Boundary

**Allowed file families:** `tests/portfolio-*.mjs`, including verifier tests in `tests/portfolio-test-integrity.unit.mjs`, `tests/portfolio-defect-injector.cjs`, `tests/portfolio-survival.support.mjs`, `tests/fixtures/portfolio-survival-allocation/**`, `scripts/verify-spec008-scope-claims.mjs`, `scripts/spec008-scope-claims.json`, `scripts/validate-test-file-reachability.mjs` and its baseline, `scripts/validate-spec-test-paths.mjs` and its baseline, the Feature 008 canaries in `scripts/selftest.mjs`, and this scope's own `scope.md` and `report.md`. The v2 semantic analyzers and the exported refusal enum remain inside `scripts/verify-spec008-scope-claims.mjs`. No generic verifier package is introduced.

**Read-only authority inputs:** the exact scope artifacts named in [Canonical 41-Pair Inventory](#canonical-41-pair-inventory). The verifier may parse their exact named sections. Scope 28 must not mutate those artifacts to make an inventory comparison pass.

**Excluded surfaces:** all production source (`rlportfolio.js`, `rlportfolioanalytics.js`, `rlportfoliobrief.js`, `rldata.js`, `rlnav.js`, `rlapp.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`), `market-brief.*`, `scripts/brief-*`, `tools.json`, `index.html`, `README.md`, `notes/**`, non-Feature-008 tests except the named read-only consumer executions, every scope artifact except this Scope 28 file and report, `specs/001-*` through `specs/007-*`, `.github/bubbles/**` receipt code, and the `certification.*` fields of `state.json`.

- **Allowed:** Feature 008 test files, Feature 008 fixtures/support server, test declaration/reachability validators, `scripts/selftest.mjs` Feature 008 canaries, and plan/report evidence for Scope 28.
- **Excluded:** production source, public/docs surfaces, authoritative scope inputs, unrelated Feature 001-007 tests except named read-only consumer execution, framework-managed receipt code, and certification fields.

## Shared Infrastructure Impact Sweep

| Protected surface | Blast radius | Independent canary |
|---|---|---|
| Exact scope-artifact inventory derivation | All 41 generic boundary and consumer pairs | TP-28-02 derives the pair set and every boundary descriptor set from named Markdown sections. TP-28-04 deletes one pair and one descriptor independently. |
| Feature-specific JavaScript, HTML, JSON, and Markdown analyzers | Boundary ownership, write isolation, durable storage, and public consumers | TP-28-04 rewrites the same forbidden edge with alternate quotes, import forms, aliases, computed members, and helper indirection. Each form must retain the same refusal. |
| Ownership and evolution graph | Every shared path and structural identity across the 17 boundary entries | TP-28-04 introduces one undeclared overlap and one malformed ordered chain as separate mutations. |
| Fixture-overlay server/request ledger | All Feature 008 browser suites | Production HTML/JS unchanged; no interception/external host/service worker. |
| Test title discovery | Structured plan and scenario receipts | Every exact planned title resolves to one executed test. |
| Shared selftest | Entire repository | Feature additions cannot weaken existing invariants or budgets. |
| Existing-consumer browser matrix | Shared `rldata.js`/`rlnav.js` consumers | Named routes remain green after repaired shared behavior. |

## Consumer Impact Sweep

| Consumer | Required proof |
|---|---|
| Canonical 41-pair inventory | The verifier independently derives the exact 17 boundary and 24 consumer pairs from the named scope artifacts and checklist rows. Manifest deletion or addition fails. |
| SCN-008-001 through SCN-008-054 | Each Scope 01-28 contract resolves to its authored persistent carrier, exact executable title, and assertion identity where applicable. |
| SCN-008-055 | Its functional and E2E bindings remain owned only by Scope 29 and are not Scope 28 execution prerequisites. |
| Shared path and identity owners | Each tuple has one owner or one complete ordered evolution chain. Unlisted overlap fails. |
| Feature 008 producers, consumers, and test carriers | Every required declaration forms one resolved producer-to-use-to-assertion graph with no zero-match or disconnected-substring success. |
| Stale aliases | Every alias resolves to a grounded origin and complete scan surface, or the entry declares `none` with a grounded reason. |
| Existing shared-data and navigation consumers | Shared repairs preserve current consumer behavior under the named browser matrix. |
| Historical reports and receipts | They remain unchanged history and never substitute for current remediation proof. |

## Feature-Specific Scope-Claims Verifier Contract

The planned `scripts/spec008-scope-claims.json` is the closed v2 manifest for the 41 generic rows named below. It contains exactly 17 `boundary` entries and exactly 24 `consumer` entries. The verifier derives that pair set from the authoritative scope artifacts before it reads the manifest entries. The manifest cannot define its own completeness.

The planned `scripts/verify-spec008-scope-claims.mjs` validates only this manifest and the declared Feature 008 repository surfaces. The utility is feature-specific. It does not establish a reusable cross-feature capability.

### Canonical 41-Pair Inventory

For each artifact below, the manifest entry names the exact Definition of Done heading and exact generic checklist row. A heading alias, a range, or a glob is invalid. The verifier parses Markdown structure and derives the pair from the checklist row. It does not search arbitrary prose for a token.

Every table path is relative to `specs/008-portfolio-survival-and-brief-lab/`. The verifier joins that fixed feature root before canonical path validation.

The boundary row identity is `Scope-<NN> attribution covers every claimed path and marker, hunk, or whole-file ownership declaration`. The consumer row identity is `Consumer impact sweep completed; zero stale first-party references remain`. The entry records the complete row text to prevent a prefix-only match.

| Pair | Exact authoritative scope artifact |
|---|---|
| `03/boundary` | `scopes/03-local-behavior-privacy-inventory-and-clear/scope.md` |
| `04/boundary` | `scopes/04-public-evidence-barrier-and-coverage/scope.md` |
| `08/boundary` | `scopes/08-concentration-capm-and-risk-contribution/scope.md` |
| `09/boundary` | `scopes/09-dependent-path-reproducibility/scope.md` |
| `16/boundary` | `scopes/16-integrated-route-accessibility-and-atomic-release/scope.md` |
| `17/boundary` | `scopes/17-local-lifecycle-and-verified-clear-foundation/scope.md` |
| `18/boundary` | `scopes/18-behavior-identity-and-ranking-foundation/scope.md` |
| `19/boundary` | `scopes/19-coverage-aware-market-data-foundation/scope.md` |
| `20/boundary` | `scopes/20-generic-evidence-brief-policy-and-api/scope.md` |
| `21/boundary` | `scopes/21-partial-risk-input-and-diagnostics/scope.md` |
| `22/boundary` | `scopes/22-scenario-contract-and-survival-distributions/scope.md` |
| `23/boundary` | `scopes/23-stress-dependence-and-hedge-effectiveness/scope.md` |
| `24/boundary` | `scopes/24-complete-allocation-and-explicit-views/scope.md` |
| `25/boundary` | `scopes/25-decision-time-dossier-and-immutable-audit/scope.md` |
| `26/boundary` | `scopes/26-immutable-workspace-compute-and-navigation/scope.md` |
| `27/boundary` | `scopes/27-accessible-six-tab-interaction/scope.md` |
| `28/boundary` | `scopes/28-spec-driven-adversarial-test-replacement/scope.md` |
| `03/consumer` | `scopes/03-local-behavior-privacy-inventory-and-clear/scope.md` |
| `04/consumer` | `scopes/04-public-evidence-barrier-and-coverage/scope.md` |
| `05/consumer` | `scopes/05-four-window-direct-scope-brief/scope.md` |
| `06/consumer` | `scopes/06-explainable-research-action-lifecycle/scope.md` |
| `07/consumer` | `scopes/07-return-and-drawdown-x-ray/scope.md` |
| `08/consumer` | `scopes/08-concentration-capm-and-risk-contribution/scope.md` |
| `09/consumer` | `scopes/09-dependent-path-reproducibility/scope.md` |
| `10/consumer` | `scopes/10-dated-cash-needs-and-survival-states/scope.md` |
| `11/consumer` | `scopes/11-stress-tail-and-alternative-dependence/scope.md` |
| `12/consumer` | `scopes/12-hedge-variant-research/scope.md` |
| `13/consumer` | `scopes/13-six-method-allocation-basis-and-feasibility/scope.md` |
| `15/consumer` | `scopes/15-walk-forward-research-dossier-and-claim-boundaries/scope.md` |
| `16/consumer` | `scopes/16-integrated-route-accessibility-and-atomic-release/scope.md` |
| `17/consumer` | `scopes/17-local-lifecycle-and-verified-clear-foundation/scope.md` |
| `18/consumer` | `scopes/18-behavior-identity-and-ranking-foundation/scope.md` |
| `19/consumer` | `scopes/19-coverage-aware-market-data-foundation/scope.md` |
| `20/consumer` | `scopes/20-generic-evidence-brief-policy-and-api/scope.md` |
| `21/consumer` | `scopes/21-partial-risk-input-and-diagnostics/scope.md` |
| `22/consumer` | `scopes/22-scenario-contract-and-survival-distributions/scope.md` |
| `23/consumer` | `scopes/23-stress-dependence-and-hedge-effectiveness/scope.md` |
| `24/consumer` | `scopes/24-complete-allocation-and-explicit-views/scope.md` |
| `25/consumer` | `scopes/25-decision-time-dossier-and-immutable-audit/scope.md` |
| `26/consumer` | `scopes/26-immutable-workspace-compute-and-navigation/scope.md` |
| `27/consumer` | `scopes/27-accessible-six-tab-interaction/scope.md` |

### Closed Manifest Schema

- The root and every nested object reject unknown keys.
- Every entry has one unique item ID, one unique `(scope, kind)` pair, and one exact generic DoD row source.
- Duplicate IDs, duplicate scope-kind pairs, parent traversal, absolute paths, and paths outside the repository fail closed.
- Every declared path must exist both lexically and after physical resolution. A missing file, directory, source surface, consumer surface, or test carrier fails closed.
- The derived pair set and manifest pair set must equal the 41-pair table above. A missing or extra entry fails before item verification.

The root keys are exactly `schemaVersion`, `specId`, and `entries`. `schemaVersion` is `spec008-scope-claims/v2`, and `specId` is `008`.

Every entry has exactly `itemId`, `scopeId`, `kind`, `dodClaim`, and `claimSource`, plus the fields for its kind. `claimSource` has exact `artifact`, `section`, and `rowIdentity` values. The artifact must match its pair in the canonical table. The section and row must resolve exactly once.

A `boundary` entry also has exactly `expectedInventory`, `attributedPaths`, `allowedFamilies`, and `edgePolicy`.

- `expectedInventory` has exactly `sources`, `descriptors`, `descriptorCount`, and `inventorySha256`.
- Each source has an exact artifact, section, structural selector, and closed role. Roles are `owned-paths`, `owned-identities`, `test-identities`, or `edge-surfaces`.
- Each structural selector names a Markdown label, list item, checklist row, or table column. Arbitrary substring search is invalid.
- The feature profile independently selects every required source section for each role from the authoritative artifact. `expectedInventory.sources` must equal that source set before descriptor derivation. Removing a source cannot shrink the expected set.
- Each descriptor is one normalized `(path, identity)` tuple. Identity kinds are `whole-file`, `exported-symbol`, `local-symbol`, `marker`, `hunk`, `test-title`, `config-key`, or `dom-id`.
- `whole-file` is valid only when an authoritative source explicitly declares whole-file ownership. Marker and hunk identities require a stable structural anchor.
- `attributedPaths` repeats each derived tuple exactly once and adds its ownership declaration. Three sets must match: independently derived tuples, cached `expectedInventory.descriptors`, and `attributedPaths` tuples.

A `consumer` entry also has exactly `canonicalProducers`, `consumerSurfaces`, `testCarriers`, `aliases`, and `causalBindings`. These fields use structural language identities rather than universal literal tokens.

The verifier normalizes paths, identities, object keys, and array order before hashing. It rejects a descriptor count or digest that disagrees with the independently derived set. Deleting a descriptor from either manifest set therefore fails even when the attacker also edits the cached count or digest.

### Boundary Verification

The verifier derives each complete path-and-identity inventory from the exact `expectedInventory.sources`. It uses a Markdown parser and the declared structural selectors. It expands a bounded path family only within that entry's allowed family. Missing, duplicate, ambiguous, or unparseable source descriptors fail closed.

Each attributed tuple declares one ownership mode:

- `exclusive` has exactly `mode` and `ownerScopeId`. The owner must equal the containing boundary entry and may appear only once.
- `ordered-evolution` has exactly `mode`, `chainId`, and `orderedScopeIds`. Every member repeats the same complete list. The chain must contain at least two actual owners. Its order must follow the scope dependency order.

Every repeated `(path, identity)` tuple must use one identical ordered evolution chain. Missing members, extra members, conflicting order, single-member chains, and undeclared overlap fail. Different identities in one file remain separate ownership tuples.

Every boundary entry declares `edgePolicy` with exactly four analyzer classes: `dependency`, `filesystemWrite`, `durableStorageWrite`, and `publicConsumer`. Each class has exactly `permittedSurfaces` and `forbiddenSurfaces`. Every surface selector has exact `pathFamily`, `path`, `identityKind`, and `identity` fields. An observed edge must resolve to exactly one policy surface. An unclassified or forbidden edge fails.

The dependency analyzer resolves JavaScript and module imports, dynamic imports, CommonJS requires, re-exports, HTML script dependencies, local aliases, constant computed members, and bounded helper forwarding. The filesystem analyzer resolves Node write, append, rename, copy, stream, and equivalent promise APIs. The durable-storage analyzer resolves local storage, session storage, IndexedDB, Cache Storage, aliases, destructuring, computed members, and helper-mediated writes. The public-consumer analyzer resolves JavaScript calls and reads, HTML scripts and links, JSON registry entries, Markdown public links, and fixed route or hash consumers.

Equivalent single or double quotes, import syntax, aliases, computed property syntax, and helper indirection must produce the same semantic edge. Unsupported dynamic resolution fails as `SEMANTIC_EDGE_UNRESOLVED`. The verifier never treats a universal literal-token match as dependency, write, storage, or consumer proof.

Verification checks every lexical path and every physical path. Both must remain inside the repository and the same declared allowed family. A symlink that stays inside the repository but resolves into another family fails. Every path component and final target participates in this check.

The result attributes current paths and hunks to one scope. It does not claim an isolated historical commit. It does not claim that unrelated paths from a shared historical commit were unchanged.

### Consumer Verification

Each consumer entry declares one or more `causalBindings`. Every binding has exactly `bindingId`, `producer`, `consumer`, and `test`.

- `producer` has exact `path`, `language`, `identityKind`, and `identity` fields for an exported symbol or contract token.
- `consumer` has exact `path`, `language`, `dependencyEdge`, `useKind`, and `useIdentity` fields.
- `test` has exact `path`, `title`, `assertionKind`, and `assertionIdentity` fields for one assertion inside that test body.

The analyzer must resolve one connected producer-to-consumer-to-assertion graph. The assertion must consume or observe the declared consumer result. Three independent substring matches are not a binding. A disconnected producer, unused import, unreachable title, assertion outside the named test, or assertion unrelated to the consumer result fails.

`aliases` is a closed union selected by `mode`. `declared` has exactly `mode` and non-empty `values`. Every value has exactly `identity`, `origin`, and non-empty `scanSurfaces`. Origin kinds are `commit`, `artifact`, or `current-contract`. A commit origin names a resolvable commit plus the path and identity present there. An artifact origin names an exact artifact, section, and identity. A current-contract origin names the exact contract path and alias declaration.

`none` has exactly `mode`, `reason`, and `scanSurfaces`. It contains no alias values. Its non-empty scan surfaces must cover every declared consumer class. An invented alias, canonical identifier relabelled as stale, unresolved origin, origin that does not contain the alias, empty scan, or no-op alias fails. A canonical match cannot hide a stale alias.

The verifier applies the matching language analyzer to every scan surface. It rejects each grounded stale alias that survives in a consumer, test, registry, route, link, config, or documentation surface.

### Exported Refusal Contract

`scripts/verify-spec008-scope-claims.mjs` exports one frozen `SCOPE_CLAIMS_REFUSAL_V2` enum. The CLI, JSON output, and TP-28-04 import that enum. No test, helper, or manifest may duplicate the refusal list.

| Enum member | Stable code | Refusal class |
|---|---|---|
| `MANIFEST_SCHEMA_INVALID` | `SCV2-MANIFEST-SCHEMA` | Unknown key, wrong type, duplicate key, invalid version, or invalid closed union. |
| `CANONICAL_PAIR_SET_MISMATCH` | `SCV2-PAIR-SET` | Derived and declared 41-pair sets differ. |
| `INVENTORY_SOURCE_INVALID` | `SCV2-INVENTORY-SOURCE` | Exact artifact, section, row, selector, or source role is missing or ambiguous. |
| `INVENTORY_DESCRIPTOR_MISMATCH` | `SCV2-INVENTORY-DESCRIPTOR` | Derived, cached, counted, hashed, and attributed descriptor sets differ. |
| `PATH_MISSING` | `SCV2-PATH-MISSING` | A declared path or expanded member does not exist. |
| `PATH_REPOSITORY_ESCAPE` | `SCV2-PATH-REPOSITORY-ESCAPE` | A lexical or physical path leaves the repository. |
| `PATH_FAMILY_ESCAPE` | `SCV2-PATH-FAMILY-ESCAPE` | A physical path leaves its declared allowed family, including an in-repository symlink crossing. |
| `IDENTITY_UNRESOLVED` | `SCV2-IDENTITY-UNRESOLVED` | A structural path identity does not resolve exactly once. |
| `OWNERSHIP_OVERLAP_UNDECLARED` | `SCV2-OWNERSHIP-OVERLAP` | More than one scope claims a tuple without one ordered evolution chain. |
| `EVOLUTION_CHAIN_INVALID` | `SCV2-EVOLUTION-CHAIN` | A chain is incomplete, inconsistent, unordered, duplicated, or vacuous. |
| `SEMANTIC_EDGE_FORBIDDEN` | `SCV2-SEMANTIC-EDGE-FORBIDDEN` | A resolved edge reaches a forbidden surface. |
| `SEMANTIC_EDGE_UNRESOLVED` | `SCV2-SEMANTIC-EDGE-UNRESOLVED` | A dynamic or indirect edge cannot be classified exactly. |
| `ALIAS_ORIGIN_INVALID` | `SCV2-ALIAS-ORIGIN` | An alias origin is absent, unresolved, invented, or does not contain the alias. |
| `ALIAS_SCAN_INVALID` | `SCV2-ALIAS-SCAN` | Alias scan surfaces are missing, unresolved, or incomplete. |
| `ALIAS_NONE_INVALID` | `SCV2-ALIAS-NONE` | A `none` declaration lacks a reason, lacks scan surfaces, or conflicts with a grounded alias. |
| `CAUSAL_BINDING_DISCONNECTED` | `SCV2-CAUSAL-BINDING` | Producer, consumer use, and test assertion do not form one resolved graph. |
| `TEST_TITLE_UNREACHABLE` | `SCV2-TEST-TITLE` | The exact test title is absent, duplicated, filtered out, or not executable. |
| `ASSERTION_BINDING_INVALID` | `SCV2-ASSERTION-BINDING` | The exact assertion is absent, outside the title, or unrelated to the consumer result. |

### Deterministic Results And Adversarial Coverage

The planned command writes deterministic JSON to standard output. It writes ordered human-readable per-scope verdicts to standard error. Results are ordered by scope number and then kind.

The success JSON keys are exactly `schemaVersion`, `specId`, `manifestSha256`, `results`, and `summary`. Each result has exactly `itemId`, `scopeId`, `kind`, `status`, and `checks`. The result contains exactly one unique entry for each canonical pair, with 41 total results. The summary reports exactly 17 boundary, 24 consumer, 41 pass, and zero fail results.

A refusal exits nonzero and writes one deterministic refusal object. Its keys are exactly `schemaVersion`, `specId`, `status`, `refusalCode`, `itemId`, and `detail`. `refusalCode` must be a value from `SCOPE_CLAIMS_REFUSAL_V2`. When a hostile fixture violates multiple rules, the verifier selects the first code by the enum's declared validation order.

TP-28-02 proves the canonical v2 happy path, closed schema, exact 41-pair derivation, three-way inventory equality, ownership graph, semantic edge classifications, causal bindings, and deterministic result bytes. TP-28-04 imports `SCOPE_CLAIMS_REFUSAL_V2`, derives its expected code set with no copied list, and exercises every enum value in an independent subtest. Each subtest changes one condition, asserts the exact refusal code, and retains a clean control.

TP-28-04 also contains named hostile cases for descriptor deletion, undeclared overlap, malformed evolution order, equivalent quote/import/alias/computed-member/helper syntax, an in-repository cross-family symlink, invented aliases, invalid `none`, and disconnected producer/consumer/test substring matches. Canonical-manifest mutation cases alter version, spec ID, unknown keys, pair membership, inventory source, count, digest, identity, edge policy, alias origin, causal binding, test title, and assertion identity in isolated disposable copies. Tests never mutate the canonical manifest in the shared working tree.

Existing TP-28-02 and TP-28-04 provide sufficient carriers and commands for v2. No Test Plan row or test-related DoD item is added. Receipts captured against v1 cannot satisfy the v2 contract.

Each generic row closes only when its per-scope result passes and an independent audit accepts the attribution or consumer interpretation. Focused behavior evidence remains required where that scope's Test Plan names it.

### Independent Review Finding Closure

| Finding | Planned resolution in this v2 contract |
|---|---|
| `F-S28-001` | Derive the 41 pairs and every boundary path-and-identity set from exact scope artifacts and sections. Compare derived, cached, and attributed sets so descriptor deletion fails. |
| `F-S28-002` | Require one exclusive owner or one complete ordered evolution chain for every path-and-identity tuple. Refuse undeclared overlap. |
| `F-S28-003` | Replace universal literal-token edge checks with language-aware dependency, filesystem-write, durable-storage-write, and public-consumer analyzers plus per-entry policies. |
| `F-S28-004` | Require each stale alias to carry a resolvable commit, artifact, or current-contract origin and scan surfaces. Require grounded `none` declarations. |
| `F-S28-005` | Require one connected producer-to-consumer-use-to-executable-test-assertion binding. Reject independent substring matches. |
| `F-S28-006` | Check lexical and physical containment against the same allowed family. Refuse in-repository cross-family symlinks. |
| `F-S28-007` | Export one refusal enum and make TP-28-04 derive and exercise every code plus the named bypass and canonical-manifest mutations. |

## Test Plan

### Current Execution Checkpoint

- TP-28-01, TP-28-03, TP-28-05, and TP-28-06 retain their recorded outcomes. Existing TP-28-02 and TP-28-04 receipts exercised v1 and cannot satisfy v2. Their existing IDs and commands remain the v2 carriers.
- TP-28-03 is now established. The earlier non-establishment had two distinct causes, and both are resolved.
  - Cause 1, the assertion: the previous red/green pair came from a fixed expect timeout in `runCommonPathScenario` that could expire while the path compute was still in flight, so a slow settle was indistinguishable from a wrong settle. This is fixed at source by `expectPathComputeCompleted` in `tests/portfolio-survival.support.mjs`, which polls until `data-compute-state` reaches a SETTLED value (`completed|cancelled|superseded|failed`) and only then asserts that the settled value is `completed`. A late settle now retries; a wrong settle still fails. The timeout was not merely raised to turn a red run green.
  - Cause 2, a working-tree corruption: the success branch at `portfolio-survival-allocation-lab.html:4418` had been left assigning `state.pathCompute.state = "failed"`. It has been reverted to `"completed"` and that line now matches `HEAD`; `git diff` reports no change at that line.
  - Re-run in this session, on the exact TP-28-03 command from the Test Plan row: exit code 0, `92 passed (2.2m)`, with zero failed, zero flaky, and zero skipped across all eight browser carriers.
  - [report.md#tp-28-03](report.md#tp-28-03) still carries the superseded pre-fix analysis and its `not established` verdict. `report.md` is owned by `bubbles.implement` and is not written by this scope; refreshing that section with the post-fix receipt is outstanding work for that owner.
- TP-28-04 is authored in `tests/portfolio-test-integrity.unit.mjs`, with test-owned in-memory substitution support in `tests/portfolio-defect-injector.cjs`. The carrier remains reachable through the declared Node test command. Its v1 mutation set is historical until the test derives and exercises `SCOPE_CLAIMS_REFUSAL_V2`.
- The disposable Scope 27 mutation control, whose basename was `tp-27-04-control.spec.mjs` and which lived in the repository `tests/` directory, has been REMOVED from the working tree, not merely labelled as disposable. It duplicated all three exact Scope 27 scenario titles and gated its mutation behind a `TP_27_04_CONTROL` environment variable, so an ordinary run passed the duplicated titles unconditionally. Its basename matched the `**/*.spec.mjs` testMatch glob declared at `playwright.config.mjs:4`, so the matrix would have executed it. The file was never tracked in Git. No executable `TP_27_04_CONTROL` reference remains anywhere in the repository; the identifier survives only in this deletion record and in the corresponding [report.md](report.md) evidence section. This record spells the removed carrier as a bare basename with its directory stated separately, never as one rooted path token, and that spelling is load-bearing: `scripts/validate-spec-test-paths.mjs` derives live carrier references from contiguous repository-rooted test-path tokens, so a rooted spelling re-registers a deliberately deleted file as a live carrier and fails that guard. Do not rejoin the basename to its directory.
- The separate Scope 27 mutation control that REMAINS is the `Adversarial: SCN-008-053 reduced accessibility implementations fail closed` row at `tests/portfolio-survival-accessibility.spec.mjs:501`, which serves reduced HTML through Playwright route interception. That row is a disposable mutation control and is not live `e2e-ui` evidence, even though the file carries other rows that are. It is an in-file row rather than a duplicate carrier file, and it is unaffected by the removal above.
- TP-28-06 is now established. Re-run in this session on its exact Test Plan command, `node scripts/selftest.mjs` exits 0 with `Research-Lab self-test: 3404 passed, 0 failed`. The assertion previously recorded here as the sole failure (`the backfill is idempotent against the committed ledger — a re-run proposes zero further rows`, asserted at `scripts/selftest.mjs:8791` inside the recommendation-ledger group against `briefs/history/recommendations/2026-07.jsonl`) now passes. That assertion belongs to concurrent recommendation-ledger work rather than to Feature 008, and this scope never touched it; the count moved from `3403 passed, 1 failed` to `3404 passed, 0 failed` because that foreign assertion turned green, not because an assertion was removed. The pass was not bought by weakening a budget: this scope makes no edit to `scripts/selftest.mjs`. Feature 008's own contribution to the command is green independently, with `node scripts/validate-spec-test-paths.mjs` exiting 0 at `new=0 baseline=66 stale=0` and reporting no NEW-MISSING carrier.
- The v2 plan retains the six existing TP-28 IDs and commands. No manifest or structured-plan file changes in this planning transaction. Existing `done` observations for TP-28-02 and TP-28-04 describe v1 and are not v2 completion evidence.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Evidence |
|---|---|---|---|---|---|---|---|---|
| TP-28-01 | Test declaration reachability | functional | 001-054 | `scripts/validate-test-file-reachability.mjs` | Every structured Scope 01-28 title reaches an executable declaration | `node scripts/validate-test-file-reachability.mjs` | No | `report.md#tp-28-01` |
| TP-28-02 | Aggregate Node behavior | unit/functional | 001-054 | Feature 008 Node carriers | Canonical v2 execution derives all 41 pairs and boundary inventories, validates exclusive or ordered ownership, classifies semantic edges, resolves causal bindings, and emits deterministic bytes | `node --test tests/portfolio-foundation.unit.mjs tests/portfolio-analytics.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-allocation.functional.mjs tests/portfolio-publisher-boundary.functional.mjs tests/portfolio-bar-coverage.functional.mjs tests/portfolio-risk.functional.mjs tests/portfolio-paths.functional.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-dossier.functional.mjs tests/portfolio-workspace.functional.mjs tests/portfolio-test-integrity.unit.mjs` | No | `report.md#tp-28-02` |
| TP-28-03 | Complete Feature Regression E2E | e2e-ui | 001-054 | Scope 01-28 Feature 008 browser carriers | Every exact scenario regression owned through Scope 28 executes the real route with no interception/provider | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-28-03` |
| TP-28-04 | Adversarial mutation integrity | unit | 054 | `tests/portfolio-test-integrity.unit.mjs` | Exact title: `Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing`. It derives every v2 refusal code and exercises each independently, including descriptor deletion, overlap, equivalent syntax, cross-family symlink, and canonical-manifest mutations. | `node --test --test-name-pattern="Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing" tests/portfolio-test-integrity.unit.mjs` | No | `report.md#tp-28-04` |
| TP-28-05 | Regression quality | functional | 054 | All Feature 008 E2E files | Zero bailout, interception, optional-required, zero-match, or tautological patterns | `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs` | No | `report.md#tp-28-05` |
| TP-28-06 | Repository regression | functional | 001-054 | `scripts/selftest.mjs` | Full repository selftest remains green without weakening budgets while Scope 01-28 behavior is exercised | `node scripts/selftest.mjs` | No | `report.md#tp-28-06` |

## Rollback And Restore

- Add adversarial fixtures in test-owned copies; never edit and restore shipped production source to prove sensitivity.
- Keep each old test until its stronger exact replacement runs red-equivalent and green; then remove only redundant reduced assertions while preserving historical reports and Git history.
- A failing broad matrix reverts the test-only batch or repairs the discovered product defect; it never weakens expected behavior.
- The v2 verifier, canonical manifest, exported refusal enum, and TP-28-02/04 coverage form one feature-specific batch. Revert that batch together if any layer cannot produce one unambiguous result per canonical pair.
- Mutation tests use test-owned copies and remove every temporary symlink or fixture root after each case. Rollback never restores a mutated copy over the canonical manifest.
- A rollback leaves all 41 generic rows unchecked. It does not reactivate v1, restore reduced literal-token checks, or convert historical commit co-location into scope attribution.

### Definition of Done - Tiered Validation

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior → Every repaired behavior owned through Scope 28 carries its own persistent browser row named for the scenario it protects, not a shared smoke test: the matrix rows read `Regression: SCN-008-0NN …` one per scenario, and `scenario-test-resolve.sh` exits 0 resolving 68 of 68 linked-test references with zero unresolved, so no scenario is riding on another scenario's carrier. Adversarial sensitivity is proved separately rather than assumed — TP-28-04 applies one in-memory defect per audited class and requires the shipped-green test for that class to fail under it, so a regression row that could no longer detect its own defect fails this scope instead of passing quietly. TP-28-05 scans all eight E2E files at 0 violations and 0 warnings, with adversarial signals found in 8 of 8, which is what rules out the bailout, interception, optional-assertion and zero-match shapes that make a regression test unable to fail. Evidence: [report.md#tp-28-03](report.md#tp-28-03), [report.md#tp-28-04](report.md#tp-28-04), [report.md#tp-28-05](report.md#tp-28-05), [report.md#consumer-impact-sweep-evidence](report.md#consumer-impact-sweep-evidence)
- [x] Broader E2E regression suite passes → The complete eight-spec Feature 008 browser matrix, re-run in this session on the exact TP-28-03 command, exits 0 at `95 passed (2.9m)`. The run opens `Running 95 tests using 2 workers` and closes `95 passed`, so discovery equals passes: zero failed, zero flaky, zero skipped, and no selector matched zero tests. The count is 95 against the 93 in the report's TP-28-03 Current Receipt because the matrix has grown since that capture; the increment is not attributed here. This is the same single execution recorded by Scope 29 under its own broader-regression section, identified by the shared capture sha256 `254fedd3e4cd59e807db3ec744f7a912957ab07125868aaa386deb1ee0dde26d` rather than claimed twice. Evidence: [report.md#consumer-impact-sweep-evidence](report.md#consumer-impact-sweep-evidence), [report.md#tp-28-03](report.md#tp-28-03)
- [ ] Scope-28 attribution covers every claimed path and marker, hunk, or whole-file ownership declaration, with no unauthorized excluded coupling. It makes no isolated-commit claim and no claim about unrelated co-committed paths. → **Resolution condition:** the Scope 28 `boundary` result from the feature-specific verifier passes, its attributed path set is complete, and an independent audit accepts the result. Current unrelated dirty production source is not Scope 28 evidence. Scope 28 neither adopts nor overwrites it. **Preserved prior finding:** OPEN. Not satisfied, and deliberately not ticked. `rlportfolio.js` and `rlportfoliobrief.js` are named verbatim under this scope's Excluded surfaces at line 43, and both are dirty in the working tree with a 31-line and a 2-line uncommitted delta. Neither delta is Scope 28's work — the subject matter is the `PortfolioError/v1` contract-error shape, not test integrity — so the question is ownership rather than authorship, and ownership has regressed. The already-checked Build Quality Gate row below closes its `no production-source edits` clause by citing `bugs/BUG-004-same-day-behavior-occurrence-rejection` as reading `status: done` and `certification.status: done`; read in this session that packet reads `status: blocked`, `certification.status: blocked`, `certifiedAt: null`. No other packet has adopted the file: `BUG-007` names `rlportfoliobrief.js` in its Allowed list but not `rlportfolio.js`, and `BUG-008` excludes all product source explicitly. Ticking would assert containment over a surface that is demonstrably uncontained. The row reopens for ticking once an owner adopts the `rlportfolio.js` delta. Routed to `/bubbles.implement`. Blocker recorded at [report.md#change-boundary-row--current-blocker](report.md#change-boundary-row--current-blocker)
- [x] Consumer impact sweep completed; zero stale first-party references remain → All five rows of the Consumer Impact Sweep table are now established on commands executed in this session, replacing the single `interpreted` shared-consumer row that previously stood in for the sweep. Rows 1 and 2: `scenario-test-resolve.sh` exits 0 at 68 of 68 references resolved, zero unresolved — this is the guard that previously exited 1 on SCN-008-055's unresolved title, which Scope 29 has since authored. Row 3: the eight-spec browser matrix exits 0 at 95 of 95, with discovery equal to passes so no carrier matched zero tests. Row 4 moves from `interpreted` to executed: `node scripts/selftest.mjs` exits 0 at `3426 passed, 0 failed`, and the registered-tool mount sweep over the shared `rldata.js` / `rlnav.js` consumers is one group inside that run, so a zero-failure total is a green group. Row 5, the stale-reference clause: Scope 28's only removal was the disposable Scope 27 mutation control, and a repository-wide `grep -rn 'TP_27_04_CONTROL'` returns exactly three hits, all of them the deletion records in this scope's own `scope.md` and `report.md` that predict their own presence; the carrier is absent from the working tree and absent from `HEAD`, so zero executable references survive. Evidence: [report.md#consumer-impact-sweep-evidence](report.md#consumer-impact-sweep-evidence), [report.md#test-only-rollback-proof](report.md#test-only-rollback-proof)

- [x] SCN-008-054 and every authored carrier owned through Scope 28 (SCN-008-001 through SCN-008-054) have exact discriminating test ownership with no historical evidence used as current proof; SCN-008-055 remains solely owned by Scope 29, and its functional and E2E carriers are now authored, executed, and passing rather than authored-but-planned-not-executed. The 001-054 half is established by the structured boundary check reporting `boundaryPass: true` across 54 audited scenarios with all six TP-28 rows stopping at SCN-008-054, by `scenario-test-resolve.sh` exiting 0 with 68 of 68 linked-test references resolved, and by `traceability-guard.sh --all-scopes` exiting 0 with 55 of 55 scenarios mapped to DoD. The `MISSING-TITLE` gap that previously held this row open was SCN-008-055's own unresolved title, and Scope 29 closed it by authoring that carrier; the traceability summary now reads 55 report-evidence references, and the SCN-008-055 reference resolves to Scope 29's own Done evidence. The 055 half is established by Scope 29 carrying a Done status with 8/8 DoD, whose own receipts record `tests/portfolio-doc-integration.functional.mjs` at exit 0 with 3 of 3 passing and the E2E carrier at `tests/portfolio-survival-brief.spec.mjs:1078` at exit 0 with 1 passing. **Ownership boundary preserved:** Scope 28 still does not own, author, execute, or require the SCN-008-055 carrier; that execution is cited as Scope 29's evidence at `scopes/29-documentation-and-registry-truth/report.md#tp-29-01` and `#tp-29-02` and is not absorbed as Scope 28 proof. **Boundary of this planning transaction:** it reconciles planning-owned rows only, writes no report-owned execution evidence, and sets no certification field. Evidence: [report.md#scenario-ownership-and-traceability](report.md#scenario-ownership-and-traceability), [report.md#linked-test-resolution](report.md#linked-test-resolution)
- [x] TP-28-01 declaration reachability passes with zero unresolved or zero-match titles. → Evidence: [report.md#tp-28-01](report.md#tp-28-01)
- [ ] TP-28-02 canonical v2 aggregate behavior derives all inventories and validates the complete verifier contract. → **Resolution condition:** the unchanged TP-28-02 command executes the v2 canonical manifest and records a current receipt.
- [x] TP-28-03 complete real-page Feature 008 matrix passes. → The exact Test Plan command re-run in this session exits 0 with `92 passed (2.2m)`, zero failed, zero flaky, and zero skipped. The earlier red/green pair is resolved at source by `expectPathComputeCompleted` (settle-then-assert, not a raised timeout) plus the revert of the `portfolio-survival-allocation-lab.html:4418` working-tree corruption. Evidence: [Current Execution Checkpoint](#current-execution-checkpoint); [report.md#tp-28-03](report.md#tp-28-03) still holds the superseded pre-fix analysis and is owned by `bubbles.implement`.
- [ ] TP-28-04 adversarial mutation integrity derives and independently exercises every `SCOPE_CLAIMS_REFUSAL_V2` code and named bypass case. → **Resolution condition:** the unchanged TP-28-04 command records one exact-code pass per enum value and every required hostile mutation.
- [x] TP-28-05 regression-quality guard passes. → Evidence: [report.md#tp-28-05](report.md#tp-28-05)
- [x] TP-28-06 repository selftest passes. → The exact Test Plan command re-run in this session exits 0 with `Research-Lab self-test: 3404 passed, 0 failed`. The assertion previously recorded here as the sole failure (`the backfill is idempotent against the committed ledger — a re-run proposes zero further rows` at `scripts/selftest.mjs:8791`) now passes; it belongs to concurrent recommendation-ledger work outside Feature 008, and this scope never touched it. The pass was not bought by weakening a budget, because this scope makes no edit to `scripts/selftest.mjs`. Feature 008's own share of the run is green independently: `node scripts/validate-spec-test-paths.mjs` exits 0 at `new=0 baseline=66 stale=0` with no NEW-MISSING carrier. Evidence: [Current Execution Checkpoint](#current-execution-checkpoint); [report.md#tp-28-06](report.md#tp-28-06) still holds the superseded `not established` verdict and is owned by `bubbles.implement`.
- [x] Shared Infrastructure Impact Sweep and test-only rollback proof are recorded. → Evidence: [report.md#shared-infrastructure-impact-sweep](report.md#shared-infrastructure-impact-sweep) and [report.md#test-only-rollback-proof](report.md#test-only-rollback-proof)
- [x] Build Quality Gate passes with zero skips/warnings, synchronized plan/manifest rows, and no production-source edits in this scope. → All three clauses now hold on their own commands. The third is established for the first time, by an owner packet outside this scope rather than by narrowing the clause. Zero skips/warnings: the exact Test Plan TP-28-03 matrix re-run in this session exits 0 at `94 passed (3.7m)` with zero failed, zero flaky, and zero skipped; the run opens `Running 94 tests using 2 workers` and closes `94 passed`, so discovery equals passes and nothing was skipped. That count supersedes the `92 passed (2.2m)` previously recorded here — the matrix has grown since, and one added carrier is Scope 29's browser regression `Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace` at `tests/portfolio-survival-brief.spec.mjs:1078`, which sits inside this matrix's brief spec. The remaining increment is not attributed here. TP-28-01's exit 0 is recorded on its own checked row above and was not re-run in this transaction. Synchronized plan/manifest rows: `test-plan.json` carries exactly six TP-28 rows, TP-28-01 through TP-28-06, each reading `testState: authored` with `status: done`; `scenario-manifest.json` SCN-008-054 lists `testRows` as exactly that same six-row set and its `linkedTestContracts[0]` reads `planStatus: authored` against `testPlanRow: TP-28-04`, so the observation and execution axes agree one-to-one. No production-source edits: ESTABLISHED. **Why it was open** (kept, because the resolution is only legible against it): `git diff --stat HEAD -- portfolio-survival-allocation-lab.html` was empty, so the reverted `state.pathCompute.state` success branch matched `HEAD`, but that command interrogated one production file rather than the production surface this clause claims. `rlportfolio.js` is production source, which this scope's Change Boundary at line 43 lists under Excluded, and it then carried an uncommitted change replacing the `buildBehaviorCandidate` same-content-same-civil-day duplicate predicate with an exact `eventId` predicate. That change was load-bearing rather than incidental: the formerly red TP-28-02 title asserts at `tests/portfolio-foundation.unit.mjs:738` that a later same-day occurrence is `accepted: true`, which the old predicate refused and the new predicate allows, and it reverses the core of committed fix `edbbddf0d fix(008): a repeat completion must not bank a second event`. No scope, bug, or Change Boundary then declared ownership of that edit; the only artifact naming it was one passive-voice sentence in this scope's own report. A clause asserting the absence of production-source edits cannot be satisfied by a check that never looked at the production file whose edit turned a Scope 28 row green, so the clause stayed open until an owner adopted the edit and its behavior decision was recorded. It was routed on exactly those terms: production-source ownership to `/bubbles.implement`; the same-day-occurrence behavior decision to `/bubbles.analyst`. **How it resolved:** both routed halves landed in one owner packet, `bugs/BUG-004-same-day-behavior-occurrence-rejection`, whose `state.json` reads `status: done` and `certification.status: done` certified at `2026-08-25T06:29:12Z`, with `completedScopes` naming `01-preserve-occurrences-without-relevance-inflation`. Ownership is explicit rather than inferred: that packet's Change Boundary names `rlportfolio.js` and `rlportfoliobrief.js` as product source owned by `bubbles.implement` and states they are the only two product files in its boundary, so the edit is adopted rather than orphaned. The behavior decision is recorded in that packet's `design.md` under `## Decision` and `## Supersedes`: `BehaviorOccurrence/v1` is the storage uniqueness contract, the parent `design.md:1151` defines the occurrence record as `{ eventIdentity, occurredAt, newYorkCivilDate, occurrenceId }`, and `edbbddf0d` predates that model rather than dissenting from it, so only an exact occurrence repeat is a duplicate. The committed specification test is consumed as authority and left unmodified — `tests/portfolio-foundation.unit.mjs` requires a later same-day occurrence to be `accepted: true` with the same `eventIdentity` and a distinct `occurrenceId`, and an exact repeat to be refused as `duplicate-completion`. The superseded commit's unbounded-growth concern is answered rather than waived: growth is bounded separately by `policy.behavior.maxBehaviorEvents`, declared as `500`, which refuses at the cap before the append instead of evicting an earlier occurrence. That owner's own gates are clean on commands run in this session: `state-transition-guard.sh` exits 0 with `failureCount: 0` and `verdict: PASS`, and `artifact-lint.sh` exits 0 reporting `Artifact lint PASSED`. The edit is committed rather than pending, and this time the check is surface-wide rather than per-file: `git status --porcelain` over the whole repository returns zero paths, so no production source is dirty anywhere, and the change is carried by commit `a59e38d71 fix(008): separate behavior occurrences from relevance`. Scope 28 still does not own `rlportfolio.js`, and its Change Boundary still excludes production source; that exclusion is now consistent with the repository rather than contradicted by it. The four blockers previously recorded here are gone: `git diff --check` exits 0, the index carries zero unmerged paths, a tracked-tree scan finds zero conflict markers, all four `market-brief*.json` artifacts parse, `tests/portfolio-survival-foundation.spec.mjs` passes `node --check`, and `scripts/validate-spec-test-paths.mjs` exits 0 reporting `new=0 baseline=66 stale=0`. The two residual repository conditions previously named here are both cleared: `.git/MERGE_HEAD` is absent and the index carries zero unmerged paths, so the merge is committed; and `node scripts/selftest.mjs` now exits 0 at `3404 passed, 0 failed`, recorded on the now-checked TP-28-06 row above. Evidence: [Current Execution Checkpoint](#current-execution-checkpoint); [report.md#build-quality-gate](report.md#build-quality-gate)
