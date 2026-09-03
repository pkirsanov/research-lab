# Scopes: BUG-022 Historical Report Declaration Leak

Links: [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Execution Outline

### Phase Order

1. **Scope 1: Classify declaration authority and close repository reachability.**
  Reopen the atomic slice for fail-closed presentation extraction, shell-option parsing,
  pre-write ratchet validation, dynamic Node-test detection, and one shared closure verdict.

The design forbids a parser-only intermediate state. Ignoring historical report
sites before adding current family commands would expose legitimate tests as
orphans. One scope therefore owns the complete vertical repair.

### New Types And Signatures

- `ArtifactRole`: closed role for Playwright config, command registry, active
  plan, validation note, historical report, and unknown candidate surfaces.
- `SectionRole`: closed role for Command Registry, Test Plan, Validation,
  evidence, or no recognized section.
- `DeclarationAuthority`: `active`, `historical`, or `error`.
- `DeclarationIdentity`: the ordered `(kind, pattern)` pair. Equal patterns from
  different runners remain distinct declarations.
- `DeclarationSite`: identity, artifact, line, artifact role, section role,
  authority, and machine-readable reason.
- `parseReachabilityArguments(argv)`: returns a validated root and flags or a
  usage refusal before repository scanning or baseline writes.
- `parseNodeTestCommandCandidate(line)`: recognizes a direct command or a
  supported environment, timeout, or repository alarm wrapper at line start.
- `RunnerDisjointnessRefusal`: carries the exact new or stale crossing paths.
- `runnerDisjointnessVerdict(globs, testFiles, knownCrossings)`: returns pass
  details or throws `RunnerDisjointnessRefusal` for a blocking crossing.
- `KNOWN_DISCOVERY_CROSSINGS`: one shared shrink-only ratchet consumed by the
  production update path and the committed boundary carrier.
- `collectDeclaredTestGlobs(root)`: returns active `globs`,
  `historicalSites`, `classificationErrors`, and `scannedFiles`.
- `--all-sites`: prints active, historical, and error sites with provenance.

### Validation Checkpoints

1. Preserve all 31 checked rows and their receipts as immutable history.
2. Reopen Scope 1 and author the new crossing-before-write and candidate-extraction
  adversarial regressions before changing production code.
3. Run each exact filtered command against current production and require the
  named assertion to fail for the intended defect.
4. Land the shared typed runner-disjointness call and complete presentation
  extraction as one source-and-test slice.
5. Rerun the same exact commands and require exit 0 for every title.
6. Run the complete shared carrier and object-integrity rollback proof at the
  repaired source/test epoch before routing validation mirrors.
7. Keep final-revision receipts, G136, specialist-chain, append-only
  stale-and-clone adjudication, and external-framework work under their
  recorded ownership.

## Execution Inventory

| # | Name | Surfaces | Tests | DoD summary | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Declaration authority and reachability closure | Parser, focused Node test, command registry, BUG-022 packet | Functional, e2e-ui, integrity, governance | Runner crossings refuse before baseline writes and every supported declaration presentation reaches fail-closed classification | Done |

## Scope 1: Classify Declaration Authority And Close Reachability

**Status:** Done
**Depends On:** none
**Scope-Kind:** runtime-behavior
**Requirements:** FR-BUG022-001 through FR-BUG022-007

### Convergence Iteration 4 Reopen Boundary

All 31 checked DoD rows and their report anchors remain immutable historical
execution receipts. They are not unchecked or reused as proof of the newly
discovered defects. Scope 1 is reopened because current production can write a
baseline before applying the shared runner-disjointness refusal and can drop
supported declaration presentations before role classification.

This planning reconciliation changes no prior receipt, report byte, human
acceptance record, certification mirror, completed-scope mirror, completed
phase claim, source file, or test file. Validation-owned mirrors may remain
temporarily stale until the new repair reaches tested scope truth.

### Prior Convergence Iteration 4 Planning Record

The independent test-owned receipt at
`report.md#independent-test-verification-convergence-iteration-4` closes the six
reopened planning rows. Its source object
`805d78d3719db0c0c438989df3eb13b7242cc7a9` and test object
`520a6a71b398a221c3f55c884b8591b680a05da1` match the current files. The four
focused tests, the 20-test shared carrier, and the rollback-and-restore harness
all passed against those objects.

`PLAN-R4-BUG022-REALITY-SCAN-DISCOVERY` is resolved as an advisory discovery
warning, not an implementation finding. The actual scan exited 0 with zero
violations and one warning that it used the design fallback. This scope already
names `scripts/validate-test-file-reachability.mjs` in the Change Boundary,
Scenario Obligation Matrix, implementation plan, consumer sweep, Test Plan,
and implementation references. The warning identifies the scanner's preferred
section-discovery shape; it does not identify missing source ownership or a
runtime violation.

The current test-owned C19 receipt remains valid only for its recorded source
and test epoch. It does not close the new unchecked repair rows. Validate-owned
scope-progress, completion, report-status, and certification mirrors remain
unchanged and require append-only reconciliation after the repair is tested.

### Latest Gap Set — One Atomic Vertical Repair

The validator, focused persistent regressions, production CLI, shared carrier,
and protected ratchets must change and verify together. The production update
path must consume the shared typed runner-disjointness verdict before any
baseline write. Candidate extraction must retain a quoted positional glob after
boolean `--test-only`, every command in a table row, and Markdown-list commands.
Every extracted glob must reach role classification, where unknown artifacts
fail closed. Parser-only landing is invalid. The repair must retain the prior
source and test objects as rollback anchors and must not mutate historical
report bytes.

### Current Complete Gap Finding Coverage

| Finding | Planning owner action | Downstream disposition |
| --- | --- | --- |
| GAPS-R4-BUG022-010-CROSSING-BEFORE-WRITE | Extend SCN-BUG022-007 with an adversarial active Node/Playwright crossing update that must refuse before the sole baseline write by calling `runnerDisjointnessVerdict()` rather than duplicating its set logic in the CLI path. | `bubbles.implement` authors RED first, then changes production and proves GREEN. |
| GAPS-R4-BUG022-011-CANDIDATE-EXTRACTION-DROPS | Extend SCN-BUG022-005 and SCN-BUG022-006 with independent assertions for boolean `--test-only` plus a quoted positional glob, the second command in one table row, unordered and ordered Markdown-list commands, fail-closed provenance, and the existing `Command:` control. | `bubbles.implement` authors every RED first, then changes production and proves GREEN. |
| GAPS-R4-BUG017-015-MANIFEST-EPOCH-DRIFT | Reconcile BUG-017 SCN-BUG017-06, SCN-BUG017-07, and SCN-BUG017-11 to repository-present titles, authored/current test state, report evidence, and the committed ratio evaluator. | Planning-owned metadata only; BUG-017 scopes remain Done. |
| GAPS-R4-BUG022-012-MANIFEST-EPOCH-DRIFT | Reconcile the BUG-022 current stage note and SCN-BUG022-005 through SCN-BUG022-008 to repository-present titles, authored/current test state, and real report receipts. | Planning-owned metadata only; no phase or certification claim. |
| GAPS-R4-BUG022-013-IMPLEMENTATION-DISCOVERY-SHAPE | Add the canonical `### Implementation Files` section below with the actual source and focused test paths. | Plan-owned shape is corrected. The installed scanner exits 0 but its extension matcher omits `.mjs`, so it reports one design-fallback warning. Preserve that upstream framework limitation; do not patch installed `.github/` files. |
| GAPS-R4-BUG022-014-CURRENT-REPORT-STATUS-DRIFT | Preserve the historical report tail byte-for-byte and route an append-only current supersession only after repair tests establish final scope truth. | `bubbles.validate` owns the report-status supersession after implementation and test. |

### Prior Gap Finding Coverage — Historical Epoch

| Finding | Scenario | Test Plan and DoD contract | Planning disposition |
| --- | --- | --- | --- |
| GAPS-R4-BUG022-005-DECLARATION-PRESENTATION-BYPASS | SCN-BUG022-005 | TP-BUG022-R4-F11 and DOD-TP-BUG022-R4-F11 | Current independent receipt closes the table-cell, `Command:`, and prose controls. |
| GAPS-R4-BUG022-006-SHELL-OPTION-PARSE-BYPASS | SCN-BUG022-006 | TP-BUG022-R4-F12 and DOD-TP-BUG022-R4-F12 | Current independent receipt closes both quoted-option orderings. |
| GAPS-R4-BUG022-007-RATCHET-UPDATE-BYPASS | SCN-BUG022-007 | TP-BUG022-R4-F13, TP-BUG022-R4-C18, and their matching DoD rows | Current independent receipts close pre-write orphan and vacuity checks, the valid shrink-only control, and object rollback. |
| GAPS-R4-BUG022-008-DYNAMIC-NODE-TEST-EXEMPTION | SCN-BUG022-008 | TP-BUG022-R4-F14 and DOD-TP-BUG022-R4-F14 | Current independent receipt closes the production `NODE_TEST_IMPORT` classification path. |

### Consumer Surface

The shipped increment is exposed through the existing CLI command
`node scripts/validate-test-file-reachability.mjs` and the current command registry in
`.specify/memory/agents.md`. TP-BUG022-C03 preserves the existing Playwright CLI command for the
Feature 008 browser consumer. The production collector also exposes the typed
declaration and runner-disjointness seams consumed by the shared functional
carrier. This planning trace adds no route, UI, or source behavior.

### Change Boundary

Allowed implementation files:

- `scripts/validate-test-file-reachability.mjs`
- `tests/playwright-runtime.foundation.functional.mjs`
- `.specify/memory/agents.md`

Allowed BUG-022 planning and evidence files:

- `specs/_bugs/BUG-022-historical-report-declaration-leak/scopes.md`
- `specs/_bugs/BUG-022-historical-report-declaration-leak/test-plan.json`
- `specs/_bugs/BUG-022-historical-report-declaration-leak/scenario-manifest.json`
- execution-routing fields only in
  `specs/_bugs/BUG-022-historical-report-declaration-leak/state.json`

Excluded surfaces:

- `specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md`
- every BUG-016 through BUG-021 packet
- market-brief, tool-brief-v2, and open-work paths
- every portfolio source or test outside the focused foundation file
- `specs/_bugs/BUG-022-historical-report-declaration-leak/report.md` and
  `specs/_bugs/BUG-022-historical-report-declaration-leak/uservalidation.md`
- all status, certification, phase-claim, completed-scope, and acceptance fields
- all installed framework paths under `.github/`
- every unrelated or concurrently dirty path

Exact convergence-iteration exclusions:

- `market-brief.config.json`, `market-brief.html`, `rlbrief.js`, and `rlmarketaction.js`
- `scripts/brief-author.mjs`, `scripts/brief-publication.mjs`, and
  `scripts/web-evidence-acquire.mjs`
- `tests/fixtures/feature-012/tool-brief-v2/**` and `tests/tool-brief-v2-*`
- Concurrent focusability-probe work is excluded from this bug. It is not a planned test,
  implementation reference, or evidence dependency for any BUG-022 scenario.
- the detached BUG-022 scratch worktree and the company-intelligence worktree

These exclusions may already be dirty under concurrent ownership. The planning change must add
no hunk to them and must not clean, reset, stage, or reinterpret their existing worktree state.

No reset, rebase, push, baseline growth, frozen-crossing growth, or human
acceptance mutation belongs to this scope.

### Gherkin Scenarios

```gherkin
Feature: Current test declarations exclude immutable historical receipts

  @SCN-BUG022-001
  Scenario: Artifact role separates historical receipts from active plans
    Given identical node --test tests/portfolio-*.mjs text in a report receipt
    And in an active scope Test Plan or structured test plan
    And the same pattern is declared once by Node and once by Playwright
    When the production collector classifies both candidates
    Then the report site is historical and cannot declare the Node pattern
    And the active site remains authoritative with artifact and line provenance
    And each runner retains its distinct kind and pattern identity

  @SCN-BUG022-002
  Scenario: Markdown presentation cannot manufacture authority
    Given active-looking headings inside historical evidence and fenced headings
    And a glob candidate on an unrecognized artifact surface
    And command-shaped candidates use env, timeout, or repository alarm wrappers
    And prose contains the same wrapper tokens without starting a command
    When the production collector classifies the candidates
    Then report artifact role outranks every nested heading
    And fenced headings cannot open or close an authority section
    And every wrapped unknown command causes a fail-closed error with provenance
    And prose remains inert

  @SCN-BUG022-003
  Scenario: Additive migration closes the repository without weakening ownership
    Given the original eight report-derived portfolio crossings
    And legitimate tests/*.functional.mjs and tests/*.test.mjs Node families
    And identical Node and Playwright patterns can select one fixture browser test
    When the classifier and current command registry migration land together
    Then all eight false crossings disappear without crossing-baseline growth
    And both legitimate Node families remain reachable without report authority
    And Node and Playwright ownership stays disjoint
    And the shared production verdict throws a refusal for an active crossing
    And the same command bytes in a historical report do not create a crossing
    And the protected Feature 008 report remains byte-for-byte unchanged

  @SCN-BUG022-004
  Scenario: Invalid root operands refuse before scanning or baseline mutation
    Given --root has no value or its next token is another option
    And --update-baseline appears before or after the invalid root option
    When the production CLI parses the invocation
    Then it exits 2 and prints usage
    And it does not scan the current directory
    And it does not create or change any baseline file

  @SCN-BUG022-005
  Scenario: Presentation forms cannot hide unknown declaration candidates
    Given an unknown artifact contains two declaration candidates in one Markdown table row
    And the artifact contains declaration candidates in unordered and ordered Markdown lists
    And another unknown artifact contains the same candidate after a Command label
    And prose contains the same tokens without presenting an executable command
    When the production collector extracts and classifies every command on both artifacts
    Then every candidate produces a fail-closed classification error with artifact and line provenance
    And the second table command, unordered-list command, and ordered-list command are each asserted independently
    And the existing Command-label control remains authoritative input to classification
    And the prose remains inert

  @SCN-BUG022-006
  Scenario: Quoted Node options before the glob remain extractable
    Given a direct node --test command places a quoted --test-name-pattern value before its test glob
    And another direct command places the same test glob before the quoted option and value
    And a third direct command places boolean --test-only before a quoted positional test glob
    When the production command parser extracts the declaration candidate
    Then every option form retains the exact test glob with artifact and line provenance
    And neither an option value nor a boolean option consumes or hides the positional glob

  @SCN-BUG022-007
  Scenario: Baseline updates validate before writing
    Given a fixture root contains a new orphan or contains no test authority
    And another fixture contains an active same-pattern Node and Playwright crossing
    And a valid fixture resolves one stale baseline entry with no new finding
    And the production CLI receives --update-baseline
    When validation runs
    Then the CLI refuses before changing the baseline
    And the new orphan cannot be absorbed by the update
    And the empty root cannot produce a successful empty baseline
    And the active crossing throws the shared typed runner-disjointness refusal before any write
    And the crossing fixture baseline remains byte-for-byte equal to its sentinel
    And the valid fixture shrinks its baseline only after validation and passes a normal rerun

  @SCN-BUG022-008
  Scenario: Dynamic Node test registration remains test-bearing
    Given a committed test file registers tests through dynamic import of node:test
    When reachability classifies the file
    Then the file is test-bearing rather than helper-exempt
    And missing active command authority leaves it as a blocking orphan
    And matching active authority makes it reachable
    And a file without static or dynamic test registration remains helper-exempt
```

### Scenario Obligation Matrix

| Scenario | Behavior traits | Obligations | Implementation refs |
| --- | --- | --- | --- |
| SCN-BUG022-001 | pure-calculation, static-metadata | Production-function assertion over classified output, `(kind, pattern)` identity preservation, active-versus-historical parity, artifact and line provenance | `scripts/validate-test-file-reachability.mjs#collectDeclaredTestGlobs`, `scripts/validate-test-file-reachability.mjs#declarationIdentity`, `tests/playwright-runtime.foundation.functional.mjs` |
| SCN-BUG022-002 | pure-calculation, degraded-state, static-metadata | Fence-aware heading assertion, anchored wrapper recognition, prose negative control, named fail-closed refusal, candidate provenance assertion | `scripts/validate-test-file-reachability.mjs#parseNodeTestCommandCandidate`, `scripts/validate-test-file-reachability.mjs#collectDeclaredTestGlobs`, `tests/playwright-runtime.foundation.functional.mjs` |
| SCN-BUG022-003 | pure-calculation, static-metadata, user-visible-ui | Thrown production disjointness refusal, repository reachability assertion, unchanged ratchets, current production-route browser regression, immutable artifact check | `scripts/validate-test-file-reachability.mjs#runnerDisjointnessVerdict`, `scripts/validate-test-file-reachability.mjs`, `.specify/memory/agents.md`, `playwright.config.mjs`, `tests/playwright-runtime.foundation.functional.mjs`, `tests/` |
| SCN-BUG022-004 | degraded-state, runtime-config | Production CLI usage refusal at exit 2, zero scan output, and byte-stable baseline sentinels for both update-option orderings | `scripts/validate-test-file-reachability.mjs#main`, `scripts/validate-test-file-reachability.mjs#parseReachabilityArguments`, `tests/playwright-runtime.foundation.functional.mjs` |
| SCN-BUG022-005 | pure-calculation, degraded-state, static-metadata | Production collector independently exposes both commands in one table row, the unordered-list command, and the ordered-list command; each unknown-artifact glob reaches its own named classification error with artifact and line provenance; the existing `Command:` control remains green and prose remains inert | `scripts/validate-test-file-reachability.mjs#commandCandidateFragments`, `scripts/validate-test-file-reachability.mjs#parseNodeTestCommandCandidate`, `scripts/validate-test-file-reachability.mjs#collectDeclaredTestGlobs`, `tests/playwright-runtime.foundation.functional.mjs` |
| SCN-BUG022-006 | pure-calculation, static-metadata | Production command parsing retains quoted option values, boolean `--test-only`, quoted positional test globs, exact provenance, and option-order perturbation controls | `scripts/validate-test-file-reachability.mjs#parseNodeTestCommandCandidate`, `scripts/validate-test-file-reachability.mjs#collectDeclaredTestGlobs`, `tests/playwright-runtime.foundation.functional.mjs` |
| SCN-BUG022-007 | mutable-state, degraded-state, runtime-config | Production CLI subprocesses against isolated real filesystems prove new-orphan, vacuity, and active-crossing refusals before write; the crossing uses `RunnerDisjointnessRefusal`; every invalid baseline stays byte-identical; the valid shrink-only control still passes | `scripts/validate-test-file-reachability.mjs#main`, `scripts/validate-test-file-reachability.mjs#validateTestFileReachability`, `scripts/validate-test-file-reachability.mjs#runnerDisjointnessVerdict`, `tests/playwright-runtime.foundation.functional.mjs` |
| SCN-BUG022-008 | pure-calculation, degraded-state, static-metadata | Production test-bearing classification for dynamic `import('node:test')`, orphan refusal without authority, reachable control with authority, and helper-file negative control | `scripts/validate-test-file-reachability.mjs#NODE_TEST_IMPORT`, `scripts/validate-test-file-reachability.mjs#validateTestFileReachability`, `tests/playwright-runtime.foundation.functional.mjs` |

### Implementation Plan

1. Preserve RED-01 through GREEN-03 and all 16 checked rows without rewriting
  their receipts.
2. Add TP-BUG022-F07 through TP-BUG022-F10 to the focused functional carrier.
  Run every exact title before production changes and record the named failure.
3. Parse CLI arguments into a complete value object before calling repository
  scan or baseline-write code. Reject a missing or option-shaped root operand
  with usage exit 2 for either `--update-baseline` ordering.
4. Key active declarations by the ordered `(kind, pattern)` identity. Keep all
  sites inside each declaration homogeneous by runner kind.
5. Replace the split line gate and invocation matcher with one anchored command
  parser. Support direct Node commands, environment prefixes, timeout
  prefixes, and the repository Perl-alarm prefix.
6. Require the parser to reject prose lookalikes. Preserve artifact-role and
  section-role precedence after command recognition.
7. Keep repository-wide extraction inside `collectDeclaredTestGlobs()`. Keep
  structured plans, historical sites, classification errors, and provenance
  in the same result contract.
8. Export one runner-disjointness verdict. Make the committed boundary test and
  the active-versus-historical fixture invoke that exact production function.
9. Make an active same-pattern crossing throw a typed refusal with the exact
  fixture path. Make the historical control return pass without hiding its site.
10. Preserve the two current Node family declarations. Keep
   `KNOWN_DISCOVERY_CROSSINGS` and the reachability baseline unchanged.
11. Rerun TP-BUG022-F07 through TP-BUG022-F10 in GREEN order. Then run the full
   focused carrier as TP-BUG022-C08.
12. Keep source changes inside the validator and focused functional carrier.
   Keep report, acceptance, certification, framework, BUG-017, and excluded
   concurrent paths unchanged.
13. Add table-cell and `Command:` extraction to the same anchored production parser. Unknown
  artifact candidates must reach classification and fail closed with provenance.
14. Parse direct Node shell tokens without treating a quoted `--test-name-pattern` value as a
  test glob. Retain the later test-file glob and prove option-order sensitivity.
15. Build the complete candidate, test-file, authority, orphan, crossing, and vacuity verdict in
  memory before any `--update-baseline` write. Reject new orphans and empty roots first. Permit a
  write only when the validated result shrinks or preserves the frozen set, then require a normal
  validation rerun to pass.
16. Classify static and dynamic `node:test` imports through one test-bearing detector. Keep true
  helpers exempt only when neither registration form exists.
17. Land F11 through F14 with the validator in one atomic source-and-test slice. Run the complete
  shared carrier, production reachability CLI, Feature 008 consumer, selftest, and object-integrity
  rollback harness only after all four focused rows are green.
18. Author TP-BUG022-R4-F20 through TP-BUG022-R4-F22 before any new production edit. Run each
  exact title against current production and retain a nonzero RED caused by the named defect.
19. Make the production update path consume `runnerDisjointnessVerdict()` with the authoritative
  shrink-only crossing ratchet before its sole `writeBaseline()` boundary. Catch and report the
  typed `RunnerDisjointnessRefusal`; do not duplicate crossing set logic in `main()`.
20. Make candidate extraction return every supported command fragment on a line. Preserve a
  quoted positional glob after boolean `--test-only`, both commands in one table row, unordered
  and ordered Markdown-list commands, and the existing `Command:` form.
21. Route every extracted glob through the existing authority classifier. Unknown artifacts must
  retain artifact and line provenance and fail closed; prose without a command remains inert.
22. Rerun F20 through F22 GREEN, then run C23 complete-carrier, C24 production-reachability, and
  C25 reverse-and-forward object-integrity proofs at the same repaired source/test epoch.

### Implementation Files

- `scripts/validate-test-file-reachability.mjs`
- `tests/playwright-runtime.foundation.functional.mjs`

The installed implementation-reality scanner currently recognizes `.js` but
not `.mjs` in this section. Its current run therefore exits 0 with one warning
and falls back to design discovery despite the explicit paths above. This is an
upstream framework limitation. It does not authorize a downstream framework
edit or a substitute implementation path.

### RED/GREEN Tasks And Exact Test Titles

| Task | State | Exact test or assertion | Expected result |
| --- | --- | --- | --- |
| RED-01 | RED before edits | Existing runtime-foundation crossing assertion | Non-zero with exactly eight report-derived portfolio crossings |
| RED-02 | RED before implementation | `Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs` | Fails because the report currently contributes an active pattern |
| CTRL-01 | Positive control before and after | `Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative` | Passes before the repair and remains green with artifact and line provenance |
| RED-03 | RED before implementation | `Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority` | Fails when heading text or fenced headings alter authority |
| RED-04 | RED before implementation | `Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance` | Fails because unknown command candidates do not yet block structurally |
| RED-05 | RED before registry migration | `Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth` | Fails until report sites are historical and the frozen sets stay unchanged |
| RED-06 | RED before registry migration | `Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority` | Fails until both current registry commands exist |
| GREEN-01 | GREEN after parser work | Run the six exact titles in `tests/playwright-runtime.foundation.functional.mjs` | All six pass against production collector behavior |
| GREEN-02 | GREEN after atomic migration | Run the reachability validator | Exit 0 with no baseline or frozen-crossing growth |
| GREEN-03 | GREEN closure | Run Feature 008 Node, Playwright, and repository suites as separate commands | Every command exits 0 and preserves runner ownership |

### Convergence Iteration 4 RED/GREEN Tasks

| Test Plan ID | RED command before source changes | Required RED result | GREEN command after the atomic repair | Required GREEN result |
| --- | --- | --- | --- | --- |
| TP-BUG022-F07 | `node --test --test-name-pattern='^Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write$' tests/playwright-runtime.foundation.functional.mjs` | Exit 1 after the authored test observes a non-2 usage result, scan output, or changed baseline sentinel | Same exact command | Exit 0 with every invalid permutation at CLI exit 2 and zero scan or write |
| TP-BUG022-F08 | `node --test --test-name-pattern='^Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern$' tests/playwright-runtime.foundation.functional.mjs` | Exit 1 because the pattern-only map collapses one runner kind | Same exact command | Exit 0 with two homogeneous declarations for one pattern |
| TP-BUG022-F09 | `node --test --test-name-pattern='^Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert$' tests/playwright-runtime.foundation.functional.mjs` | Exit 1 because at least one env, timeout, or Perl-alarm candidate disappears | Same exact command | Exit 0 with three wrapper errors and zero prose candidates |
| TP-BUG022-F10 | `node --test --test-name-pattern='^Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing$' tests/playwright-runtime.foundation.functional.mjs` | Exit 1 because no shared function throws the active-crossing refusal | Same exact command | Exit 0 after `assert.throws` sees the typed active refusal and the historical call returns pass |

### Prior Gap RED/GREEN Tasks — Historical Epoch

| Test Plan ID | RED command before source changes | Required RED result | GREEN command after the atomic repair | Required GREEN result |
| --- | --- | --- | --- | --- |
| TP-BUG022-R4-F11 | `node --test --test-name-pattern='^Regression: SCN-BUG022-005 table cells and Command labels on unknown artifacts fail closed$' tests/playwright-runtime.foundation.functional.mjs` | Exit 1 because a table-cell or `Command:` candidate disappears before classification | Same exact command | Exit 0 with two provenance-bearing unknown-artifact errors and inert prose |
| TP-BUG022-R4-F12 | `node --test --test-name-pattern='^Regression: SCN-BUG022-006 quoted Node options before a test glob remain extractable$' tests/playwright-runtime.foundation.functional.mjs` | Exit 1 because the quoted option value consumes or hides the later glob | Same exact command | Exit 0 with the exact glob and provenance in both supported option orders |
| TP-BUG022-R4-F13 | `node --test --test-name-pattern='^Regression: SCN-BUG022-007 baseline update refuses vacuity and new orphan absorption before write$' tests/playwright-runtime.foundation.functional.mjs` | Exit 1 because an invalid update writes, absorbs a new orphan, succeeds on an empty root, or the valid shrink-only control cannot write | Same exact command | Exit 0 after both invalid updates preserve baseline hashes, the valid control removes one stale entry, and a normal rerun passes |
| TP-BUG022-R4-F14 | `node --test --test-name-pattern='^Regression: SCN-BUG022-008 dynamic node:test imports remain test-bearing$' tests/playwright-runtime.foundation.functional.mjs` | Exit 1 because dynamic registration receives the helper exemption | Same exact command | Exit 0 with orphan, reachable, and true-helper controls distinguished |
| TP-BUG022-R4-C18 | `node --test --test-name-pattern='^Regression: SCN-BUG022-007 atomic repair rollback preserves source test and ratchet objects$' tests/playwright-runtime.foundation.functional.mjs` | Exit 1 before the reverse-and-forward object contract exists | Same exact command | Exit 0 with exact source, test, baseline, registry, and protected-report objects |

### Current Gap RED/GREEN Tasks

| Test Plan ID | RED command before source changes | Required RED result | GREEN command after the atomic repair | Required GREEN result |
| --- | --- | --- | --- | --- |
| TP-BUG022-R4-F20 | `node --test --test-name-pattern='^Regression: SCN-BUG022-007 active runner crossing refuses baseline update before write$' tests/playwright-runtime.foundation.functional.mjs` | Exit 1 because a real active same-pattern Node/Playwright crossing lets current production exit 0 after changing the crossing fixture's sentinel baseline | Same exact command | Exit 0 after the production subprocess calls `runnerDisjointnessVerdict()` before the sole baseline write, exits nonzero through `RunnerDisjointnessRefusal`, and leaves sentinel bytes identical; the CLI path contains no duplicate crossing-set decision logic |
| TP-BUG022-R4-F21 | `node --test --test-name-pattern='^Regression: SCN-BUG022-006 boolean test-only preserves a quoted positional glob$' tests/playwright-runtime.foundation.functional.mjs` | Exit 1 because boolean `--test-only` consumes the following quoted positional glob | Same exact command | Exit 0 with the exact glob, artifact, and line retained and no option-value misclassification |
| TP-BUG022-R4-F22 | `node --test --test-name-pattern='^Regression: SCN-BUG022-005 table rows and Markdown lists expose every declaration candidate$' tests/playwright-runtime.foundation.functional.mjs` | Exit 1 because the independently asserted second table-row command, unordered-list command, or ordered-list command disappears before classification | Same exact command | Exit 0 with separate assertions for both table commands, the unordered-list command, the ordered-list command, and the existing `Command:` control; every unknown candidate retains artifact and line provenance and fails closed |
| TP-BUG022-R4-C23 | No RED; run only after F20 through F22 are GREEN | Not applicable | `node --test tests/playwright-runtime.foundation.functional.mjs` | Exit 0 with every shared-carrier test, including the three new exact titles, passing without skip, todo, or only markers |
| TP-BUG022-R4-C24 | No RED; run only after F20 through F22 are GREEN | Not applicable | `node scripts/validate-test-file-reachability.mjs` | Exit 0 with no classification error, no new orphan, and no baseline or crossing-ratchet growth |
| TP-BUG022-R4-C25 | `node --test --test-name-pattern='^Regression: SCN-BUG022-007 convergence repair rollback preserves source test and protected objects$' tests/playwright-runtime.foundation.functional.mjs` | Exit 1 before the new source/test delta has a reverse-and-forward object contract | Same exact command | Exit 0 with exact rollback and repaired source/test objects, stable protected objects, and zero mutation residue |

### Scenario-First TDD Evidence Order

1. **RED:** TP-BUG022-RED-01 is the pre-implementation failing proof at
  `report.md#red-01---existing-crossing-reproduction`. It records exit 1 and exactly eight
  report-derived portfolio crossings before the parser and registry repair, with stdout
  SHA-256 `4c2060a926fe7b4601f8d9d146cac06bedef5021e9cfbe1f8e0bad961829b9a3`.
2. **RED:** The next pre-implementation receipt at
  `report.md#red-02-through-red-06-and-ctrl-01` records five failing scenario regressions and
  the unchanged positive control, with exit 1 and stdout SHA-256
  `0548aa4bb5f69dfbbbc781c0538489212337d4f62571062619d3fb44023e0ca0`.
3. **GREEN:** The later targeted proof at `report.md#focused-green` runs the same six named
  scenario regressions against the repaired production collector, with exit 0 and stdout
  SHA-256 `1dc42df34685ba8d09d852bc584dd17e54299d6a61d0bf4b06938ed07b00c5c4`.
  The subsequent `report.md#reachability-green` proof records repository reachability at exit
  0 without baseline or frozen-crossing growth, with stdout SHA-256
  `599da5809ed875ffff54f0a4befb0203252108ddd2326c078f254fdd16cfa982`.
4. **RED, convergence iteration 4:** Author TP-BUG022-F07 through
  TP-BUG022-F10 first. Run each exact command above against unchanged
  production code. Each command must exit 1 for its named assertion.
5. **GREEN, convergence iteration 4:** Rerun the same four exact commands after
  the atomic repair. Each command must exit 0. No prior receipt can satisfy
  these new rows.
6. **RED, current gap set:** Author F20 through F22 first. Run each exact command
  against unchanged production. Each must exit 1 for its named crossing-write,
  boolean-option, or presentation-extraction assertion.
7. **GREEN, current gap set:** Rerun F20 through F22 after the atomic repair.
  Then run C23, C24, and C25. Historical F11 through C19 receipts remain valid
  only for their recorded epoch and cannot satisfy these unchecked rows.

### Consumer Impact Sweep

- `collectDeclaredTestGlobs()` consumers in reachability validation and the
  runtime-foundation crossing assertion use the same classified result.
- CLI callers with valid `--root <dir>` remain compatible. Missing and
  option-shaped operands become explicit usage refusals.
- Formatter and `--all-sites` consumers receive one entry per `(kind, pattern)`
  declaration, with homogeneous site provenance.
- Direct, environment-prefixed, timeout-prefixed, and repository alarm-wrapped
  Node commands use one candidate parser.
- Boolean Node flags do not consume quoted positional test globs.
- Every executable fragment in a Markdown table row, unordered list, ordered
  list, or `Command:` label reaches the same role classifier.
- The committed crossing assertion and fixture regression use one shared
  disjointness verdict instead of separate set logic.
- The production `--update-baseline` path consumes that same typed verdict
  before its only baseline write.
- `.specify/memory/agents.md` gains only the two missing current Node families.
- `playwright.config.mjs::testMatch` remains unchanged and authoritative.
- Structured `test-plan.json` commands and Markdown scope Test Plans remain
  reachable active consumers.
- Historical packet and scope reports remain observable diagnostic consumers.
- `--all-sites` exposes active, historical, and error provenance.

### Shared Infrastructure Impact Sweep

- **Protected surfaces:** the reachability validator, declaration collector,
  formatting diagnostics, baseline writer, runtime-foundation carrier, command
  registry, structured plans, Markdown plans, notes, and historical reports.
- **Blast radius:** a parser or identity error can hide a declaration, merge
  runner ownership, scan the wrong root, mutate the wrong baseline, or weaken
  every repository-wide crossing check.
- **Independent canary:** Historical TP-BUG022-C08 and TP-BUG022-R4-C15 remain
  epoch-bound receipts. TP-BUG022-R4-C23 reruns the complete shared functional
  carrier after F20 through F22 turn GREEN. TP-BUG022-R4-C24 exercises the
  production CLI as a separate repository-wide consumer.
- **Rollback:** TP-BUG022-R4-C25 reverses and reapplies the new validator and
  focused-carrier delta together in an isolated repository. It must preserve
  the baseline, command registry, crossing ratchet, protected report, and every
  excluded path without mutation residue.

### Test Plan

| ID | Scenario | Test Type | Category | File or location | Exact behavior or title | Command | Live system |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-BUG022-RED-01 | SCN-BUG022-003 | RED evidence | functional | `tests/playwright-runtime.foundation.functional.mjs` | Existing `committed discovery boundary keeps browser specs and direct Node suites disjoint` reports exactly eight new crossings | `node --test --test-name-pattern='^committed discovery boundary keeps browser specs and direct Node suites disjoint$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-F01 | SCN-BUG022-001 | Regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | Artifact role separates historical receipts from active plans: `Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs` | `node --test --test-name-pattern='^Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-F02 | SCN-BUG022-001 | Positive control | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative` | `node --test --test-name-pattern='^Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-F03 | SCN-BUG022-002 | Adversarial regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | Markdown presentation cannot manufacture authority: `Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority` | `node --test --test-name-pattern='^Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-F04 | SCN-BUG022-002 | Adversarial regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance` | `node --test --test-name-pattern='^Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-F05 | SCN-BUG022-003 | Regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth` | `node --test --test-name-pattern='^Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-F06 | SCN-BUG022-003 | Regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority` | `node --test --test-name-pattern='^Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-F07 | SCN-BUG022-004 | Adversarial regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write` covers missing root, option-shaped root, both update orderings, usage exit 2, zero scan output, and unchanged baseline sentinels | `node --test --test-name-pattern='^Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write$' tests/playwright-runtime.foundation.functional.mjs` | Yes, production CLI subprocess |
| TP-BUG022-F08 | SCN-BUG022-001 | Adversarial regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern` returns two declarations whose sites retain their own runner kind | `node --test --test-name-pattern='^Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-F09 | SCN-BUG022-002 | Adversarial regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert` recognizes env, timeout, and repository Perl-alarm prefixes and rejects prose lookalikes | `node --test --test-name-pattern='^Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-F10 | SCN-BUG022-003 | Adversarial regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing` uses `assert.throws` on the production function and retains the historical-site pass control | `node --test --test-name-pattern='^Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-C01 | SCN-BUG022-003 | Repository closure | functional | `scripts/validate-test-file-reachability.mjs` | Additive migration closes the repository without weakening ownership: the original eight crossings disappear, both Node families remain reachable, and the baseline does not grow | `node scripts/validate-test-file-reachability.mjs` | No |
| TP-BUG022-C02 | SCN-BUG022-003 | Node regression | functional | `tests/portfolio-*.unit.mjs`, `tests/portfolio-*.functional.mjs` | Legitimate Feature 008 Node carriers remain owned by Node | `node --test tests/portfolio-*.unit.mjs tests/portfolio-*.functional.mjs` | No |
| TP-BUG022-C03 | SCN-BUG022-003 | Regression E2E | e2e-ui | `tests/portfolio-survival-*.spec.mjs` | Current portfolio browser scenarios remain owned and executable by Playwright | `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-BUG022-C04 | SCN-BUG022-001, SCN-BUG022-002, SCN-BUG022-003 | Repository regression | functional | `scripts/selftest.mjs` | The full build-free invariant suite remains green in a clean tree | `node scripts/selftest.mjs` | No |
| TP-BUG022-C05 | SCN-BUG022-003 | Integrity | governance | protected report and explicit allowlist | Historical report blob, baseline, crossing set, and excluded paths are unchanged | `git diff --exit-code 359d536b -- specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md` plus path-containment checks | No |
| TP-BUG022-C06 | SCN-BUG022-001, SCN-BUG022-002, SCN-BUG022-003 | Packet validation | governance | BUG-022 packet | Artifact structure, scenario contracts, and Test Plan parity pass | `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-022-historical-report-declaration-leak` | No |
| TP-BUG022-C07 | SCN-BUG022-001, SCN-BUG022-002, SCN-BUG022-003 | Transition report | governance | BUG-022 packet | Guard reports the truthful non-terminal state without creating acceptance | `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-022-historical-report-declaration-leak` | No |
| TP-BUG022-C08 | SCN-BUG022-001, SCN-BUG022-002, SCN-BUG022-003, SCN-BUG022-004 | Shared-carrier canary | functional | `tests/playwright-runtime.foundation.functional.mjs` | Canary: the complete shared functional carrier passes after all four focused GREEN commands | `node --test tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-C09 | SCN-BUG022-001, SCN-BUG022-002, SCN-BUG022-003, SCN-BUG022-004 | Rollback integrity | governance | validator, focused carrier, baseline, registry, and protected report | The source-and-test repair stays reversibly paired while the baseline, registry, and historical report remain unchanged | `git diff --check -- scripts/validate-test-file-reachability.mjs tests/playwright-runtime.foundation.functional.mjs && git diff --exit-code -- scripts/validate-test-file-reachability.baseline .specify/memory/agents.md specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md` | No |
| TP-BUG022-R4-F11 | SCN-BUG022-005 | Adversarial regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-005 table cells and Command labels on unknown artifacts fail closed` | `node --test --test-name-pattern='^Regression: SCN-BUG022-005 table cells and Command labels on unknown artifacts fail closed$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-R4-F12 | SCN-BUG022-006 | Adversarial regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-006 quoted Node options before a test glob remain extractable` | `node --test --test-name-pattern='^Regression: SCN-BUG022-006 quoted Node options before a test glob remain extractable$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-R4-F13 | SCN-BUG022-007 | Adversarial regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-007 baseline update refuses vacuity and new orphan absorption before write` proves both invalid-update refusals and a valid shrink-only update followed by a normal passing rerun | `node --test --test-name-pattern='^Regression: SCN-BUG022-007 baseline update refuses vacuity and new orphan absorption before write$' tests/playwright-runtime.foundation.functional.mjs` | Yes, production CLI subprocess and isolated real filesystem |
| TP-BUG022-R4-F14 | SCN-BUG022-008 | Adversarial regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-008 dynamic node:test imports remain test-bearing` | `node --test --test-name-pattern='^Regression: SCN-BUG022-008 dynamic node:test imports remain test-bearing$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-R4-C15 | SCN-BUG022-005, SCN-BUG022-006, SCN-BUG022-007, SCN-BUG022-008 | Shared-carrier canary | functional | `tests/playwright-runtime.foundation.functional.mjs` | The complete shared functional carrier includes all four exact latest-gap titles | `node --test tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-R4-C16 | SCN-BUG022-005, SCN-BUG022-006, SCN-BUG022-007, SCN-BUG022-008 | Repository closure | functional | `scripts/validate-test-file-reachability.mjs` | The production CLI reports zero new orphan, classification error, or ratchet growth | `node scripts/validate-test-file-reachability.mjs` | No |
| TP-BUG022-R4-C17 | SCN-BUG022-005, SCN-BUG022-006, SCN-BUG022-007, SCN-BUG022-008 | Regression E2E | e2e-ui | `tests/portfolio-survival-*.spec.mjs` | The complete Feature 008 consumer remains Playwright-owned under the one-worker route | `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-BUG022-R4-C18 | SCN-BUG022-005, SCN-BUG022-006, SCN-BUG022-007, SCN-BUG022-008 | Rollback and object integrity | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-007 atomic repair rollback preserves source test and ratchet objects` verifies the disposable-clone reverse-and-forward object contract | `node --test --test-name-pattern='^Regression: SCN-BUG022-007 atomic repair rollback preserves source test and ratchet objects$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-R4-C19 | SCN-BUG022-005, SCN-BUG022-006, SCN-BUG022-007, SCN-BUG022-008 | Repository regression | functional | `scripts/selftest.mjs` | The complete build-free invariant suite stays at or above its pre-repair assertion baseline | `node scripts/selftest.mjs` | No |
| TP-BUG022-R4-F20 | SCN-BUG022-007 | Adversarial regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-007 active runner crossing refuses baseline update before write` uses a real active same-pattern Node/Playwright fixture, invokes the production CLI with `--update-baseline`, requires `runnerDisjointnessVerdict()` before the sole write with no duplicate crossing decision, requires a typed nonzero refusal, and proves sentinel baseline bytes unchanged | `node --test --test-name-pattern='^Regression: SCN-BUG022-007 active runner crossing refuses baseline update before write$' tests/playwright-runtime.foundation.functional.mjs` | Yes, production CLI subprocess and isolated real filesystem |
| TP-BUG022-R4-F21 | SCN-BUG022-006 | Adversarial regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-006 boolean test-only preserves a quoted positional glob` retains the exact quoted positional glob after boolean `--test-only` with artifact and line provenance | `node --test --test-name-pattern='^Regression: SCN-BUG022-006 boolean test-only preserves a quoted positional glob$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-R4-F22 | SCN-BUG022-005 | Adversarial regression | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-005 table rows and Markdown lists expose every declaration candidate` independently asserts the second table-row command, unordered-list command, ordered-list command, and existing `Command:` control through fail-closed role classification with artifact and line provenance | `node --test --test-name-pattern='^Regression: SCN-BUG022-005 table rows and Markdown lists expose every declaration candidate$' tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-R4-C23 | SCN-BUG022-005, SCN-BUG022-006, SCN-BUG022-007 | Shared-carrier canary | functional | `tests/playwright-runtime.foundation.functional.mjs` | The complete shared carrier includes and passes F20 through F22 after the atomic repair | `node --test tests/playwright-runtime.foundation.functional.mjs` | No |
| TP-BUG022-R4-C24 | SCN-BUG022-005, SCN-BUG022-006, SCN-BUG022-007 | Repository closure | functional | `scripts/validate-test-file-reachability.mjs` | The real repository CLI remains non-vacuous and reports no classification error, new orphan, or ratchet growth | `node scripts/validate-test-file-reachability.mjs` | No |
| TP-BUG022-R4-C25 | SCN-BUG022-005, SCN-BUG022-006, SCN-BUG022-007 | Rollback and object integrity | functional | `tests/playwright-runtime.foundation.functional.mjs` | `Regression: SCN-BUG022-007 convergence repair rollback preserves source test and protected objects` verifies exact reverse-and-forward source/test objects plus stable baseline, registry, ratchet, protected report, and excluded paths | `node --test --test-name-pattern='^Regression: SCN-BUG022-007 convergence repair rollback preserves source test and protected objects$' tests/playwright-runtime.foundation.functional.mjs` | No |

### Convergence Iteration 4 Test Plan To DoD Parity

| Test Plan row | Matching DoD item | Planning state |
| --- | --- | --- |
| TP-BUG022-F07 | DOD-TP-BUG022-F07 | Checked; authored, passed, current |
| TP-BUG022-F08 | DOD-TP-BUG022-F08 | Checked; authored, passed, current |
| TP-BUG022-F09 | DOD-TP-BUG022-F09 | Checked; authored, passed, current |
| TP-BUG022-F10 | DOD-TP-BUG022-F10 | Checked; authored, passed, current |
| TP-BUG022-C08 | DOD-TP-BUG022-C08 | Checked; authored, passed, current |
| TP-BUG022-C09 | DOD-TP-BUG022-C09 | Checked; authored, passed, current |
| TP-BUG022-R4-F11 | DOD-TP-BUG022-R4-F11 | Checked; passed, current; SHA-256 `8518c47065b2f951df2b22b8dc65c0a51f06137d7fb356904a5be96fc2350bf9` |
| TP-BUG022-R4-F12 | DOD-TP-BUG022-R4-F12 | Checked; passed, current; SHA-256 `02a3187a64f581762d46824eae3b6b962f3955427241773ee6ffbd397182dded` |
| TP-BUG022-R4-F13 | DOD-TP-BUG022-R4-F13 | Checked; passed, current; SHA-256 `dc410439670fa38a134d4302cfd4cc6079764dce255be940004a4dad4ce5aaf5` |
| TP-BUG022-R4-F14 | DOD-TP-BUG022-R4-F14 | Checked; passed, current; SHA-256 `eb69c523485c8668092fc81baf5b3c8d8ba3b4b3f9eac235d91395c222a4003b` |
| TP-BUG022-R4-C15 | DOD-TP-BUG022-R4-C15 | Checked; passed, current; SHA-256 `fabc12ffdf19a870fae53474537e32a6c529615a50af95930b071605d665d6ca` |
| TP-BUG022-R4-C16 | DOD-TP-BUG022-R4-C16 | Checked; passed, current in the authorized overlay; SHA-256 `4ef47d9d15c5741ea0909133ce07d45f24c33645f1512b3e9f6bbe56861468a5` |
| TP-BUG022-R4-C17 | DOD-TP-BUG022-R4-C17 | Checked; passed, current; Node SHA-256 `9de0856f1ec5b50b6f9e87be4982255ec05ef9ddcf81ccc8bc479f2a13383847`, browser SHA-256 `9369a35796851f8d2bef40d946b5f11f2e4a4a250c0e564178d81d4bc850d023` |
| TP-BUG022-R4-C18 | DOD-TP-BUG022-R4-C18 | Checked; passed, current; SHA-256 `a169112af78acbd1290ab854e87e12e0bfe7650129156530f1e6cfa5c8379728` |
| TP-BUG022-R4-C19 | DOD-TP-BUG022-R4-C19 | Checked; passed, current; 3465 passed, 0 failed; full-output SHA-256 `48008f44ee1b7a4ca6046642b2f9d443b22562ba43b6969d9786120bb1099e2a`; structured stdout SHA-256 `452f7994001bc4466469c93f8b7f0f0eb560036ce90805c92f3f25df7621ecd8` |
| TP-BUG022-R4-F20 | DOD-TP-BUG022-R4-F20 | Checked; authored, passed, current; structured receipts at tool-log lines 1620 and 1625 |
| TP-BUG022-R4-F21 | DOD-TP-BUG022-R4-F21 | Checked; authored, passed, current; structured receipt at tool-log line 1621 |
| TP-BUG022-R4-F22 | DOD-TP-BUG022-R4-F22 | Checked; authored, passed, current; structured receipt at tool-log line 1622 |
| TP-BUG022-R4-C23 | DOD-TP-BUG022-R4-C23 | Checked; authored, passed, current; structured receipt at tool-log line 1623 |
| TP-BUG022-R4-C24 | DOD-TP-BUG022-R4-C24 | Checked; authored, passed, current; structured receipt at tool-log line 1627 |
| TP-BUG022-R4-C25 | DOD-TP-BUG022-R4-C25 | Checked; authored, passed, current; structured receipt at tool-log line 1624 |

### Definition of Done - Tiered Validation

#### Core Items

- [x] TP-BUG022-RED-01 records the unchanged RED result with exactly eight
  report-derived portfolio crossings.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** `report.md#red-01---existing-crossing-reproduction`, exit 1, sha256 `4c2060a926fe7b4601f8d9d146cac06bedef5021e9cfbe1f8e0bad961829b9a3`.
- [x] TP-BUG022-F01 proves "Artifact role separates historical receipts from
  active plans": a report receipt contributes no active Node declaration.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** exact SCN-BUG022-001 report-receipt title in `report.md#focused-green`, exit 0.
- [x] TP-BUG022-F02 proves Markdown scope Test Plans and structured test plans
  remain active with artifact and line provenance.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** exact SCN-BUG022-001 active-plan title in `report.md#focused-green`, exit 0.
- [x] TP-BUG022-F03 proves "Markdown presentation cannot manufacture
  authority": fenced and misheaded evidence cannot change its artifact role.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** exact SCN-BUG022-002 fence title in `report.md#focused-green`, exit 0.
- [x] TP-BUG022-F04 proves every unknown candidate fails closed with artifact,
  line, section, and reason provenance.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** exact SCN-BUG022-002 unknown-role title in `report.md#focused-green`, exit 0.
- [x] TP-BUG022-F05 proves exactly eight report-derived crossings disappear
  without ratchet growth.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** exact SCN-BUG022-003 crossing title in `report.md#focused-green`, exit 0.
- [x] TP-BUG022-F06 proves both legitimate Node families remain reachable from
  current command authority.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** exact SCN-BUG022-003 family-reachability title in `report.md#focused-green`, exit 0.
- [x] TP-BUG022-C01 proves "Additive migration closes the repository without
  weakening ownership" with zero reachability-baseline or crossing-set growth.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** `report.md#reachability-green`, exit 0, 0 classification errors, unchanged ratchets.
- [x] TP-BUG022-C02 passes the Feature 008 direct Node regressions.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** `report.md#feature-008-node-regression`, exit 0, 257 passed.
- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass: TP-BUG022-C03 runs the Feature 008 Playwright regressions separately for SCN-BUG022-003.
  **Phase:** test. **Claim Source:** executed. **Evidence:** `report.md#fresh-tp-bug022-c03-feature-008-playwright-regression`, exit 0, 94 passed, 0 skipped.
- [x] Broader E2E regression suite passes: TP-BUG022-C03 runs the Feature 008 Playwright regression suite.
  **Phase:** test. **Claim Source:** executed. **Evidence:** `report.md#fresh-tp-bug022-c03-feature-008-playwright-regression`, exit 0, 94 passed, 0 skipped.
- [x] TP-BUG022-C04 passes the full repository selftest in a clean tree.
  **Phase:** test. **Claim Source:** executed. **Evidence:** [Fresh TP-BUG022-C04 clean-tree repository selftest at c652cd092](report.md#fresh-tp-bug022-c04-clean-tree-repository-selftest-at-c652cd092), exit 0, 3465 passed, 0 failed, sha256 `805c958016f75c304fc504ef35ede3bd267020a9ecaabaa012c992bd6fd272c7`.
- [x] TP-BUG022-C05 proves the Feature 008 report is byte-identical and every
  excluded path is unchanged.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** `report.md#change-containment`, exit 0, six allowed paths, `leakage=0`.
- [x] TP-BUG022-C06 passes packet artifact lint and scenario/Test Plan parity.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** `report.md#packet-artifact-lint`, exit 0, sha256 `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567`.
- [x] TP-BUG022-C07 records the real transition-guard verdict without changing
  terminal status, Checklist items, or Human Acceptance Record fields.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** `report.md#truthful-transition-guard`, exit 1 with `DELIVERY_COMPLETION_FAILED`; status and acceptance remained unchanged.
- [x] DOD-TP-BUG022-F07: TP-BUG022-F07 proves "Invalid root operands refuse
  before scanning or baseline mutation": missing and option-shaped operands
  return usage exit 2 before any scan or baseline write.
  **Phase:** test. **Claim Source:** executed. **Evidence:** [Independent Test Verification - Convergence Iteration 4](report.md#independent-test-verification-convergence-iteration-4), TP-BUG022-F07 output SHA-256 `43e8402330b1f0a0cfad0ee3b24ecc1eac98960e9a686a41238264f867d2b9a3`; parent exit 0, four child usage refusals at exit 2, zero scan output, and byte-stable baseline sentinels.
- [x] DOD-TP-BUG022-F08: TP-BUG022-F08 proves one exact pattern retains separate
  Node and Playwright declaration identities and homogeneous sites.
  **Phase:** test. **Claim Source:** executed. **Evidence:** [Independent Test Verification - Convergence Iteration 4](report.md#independent-test-verification-convergence-iteration-4), TP-BUG022-F08 output SHA-256 `c13ccdad02d7413b94becce940cfa930377bd603d7968d62b5b9de6799c3b1ae`; exit 0 with two declarations and runner-homogeneous sites for the exact same pattern.
- [x] DOD-TP-BUG022-F09: TP-BUG022-F09 proves env, timeout, and repository
  Perl-alarm commands fail closed on unknown artifacts while prose stays inert.
  **Phase:** test. **Claim Source:** executed. **Evidence:** [Independent Test Verification - Convergence Iteration 4](report.md#independent-test-verification-convergence-iteration-4), TP-BUG022-F09 output SHA-256 `8559fd9fd34d504015c8f8cb62041067a4b7bbf67ad6f92e69e0f5a9665b9a50`; exit 0 with three provenance-bearing wrapper errors and zero prose candidates.
- [x] DOD-TP-BUG022-F10: TP-BUG022-F10 proves the shared disjointness verdict
  throws on an active same-pattern crossing and accepts its historical control.
  **Phase:** test. **Claim Source:** interpreted. **Interpretation:** The current test source reuses one `commandBytes` value for the active-plan and historical-report fixtures; the receipt proves the active call throws `RunnerDisjointnessRefusal` for the exact fixture leaf while the historical call returns pass with zero crossings. **Evidence:** [Independent Test Verification - Convergence Iteration 4](report.md#independent-test-verification-convergence-iteration-4), TP-BUG022-F10 output SHA-256 `844f23cacb88540bfbcff8b717f04a4d0aa8e1c3f5b22382556bd47e78bd6619`.
- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns. DOD-TP-BUG022-C08 maps to TP-BUG022-C08 after
  TP-BUG022-F07 through TP-BUG022-F10 turn GREEN.
  **Phase:** test. **Claim Source:** executed. **Evidence:** [Independent Test Verification - Convergence Iteration 4](report.md#independent-test-verification-convergence-iteration-4), TP-BUG022-C08 output SHA-256 `cedd8ef75916adb95de0eca4b1fb4e75aec6b88fc2eebf9bba6ef586b25e4b2e`; exit 0 with 20 passed, zero failed, zero skipped, zero todo, and all four iteration-4 titles green.
- [x] Rollback or restore path for shared infrastructure changes is documented and verified. DOD-TP-BUG022-C09 maps to TP-BUG022-C09 and requires the
  validator and carrier to remain one reversible change.
  **Phase:** test. **Claim Source:** interpreted. **Interpretation:** The disposable-clone harness restored exact source object `805d78d3719db0c0c438989df3eb13b7242cc7a9` and test object `520a6a71b398a221c3f55c884b8591b680a05da1`, matched both against the live bytes, and retained the 26-entry baseline plus 9-crossing ratchet. **Evidence:** [Independent Test Verification - Convergence Iteration 4](report.md#independent-test-verification-convergence-iteration-4), TP-BUG022-C09 output SHA-256 `75f6980b208fc216329137c6392edc459bae0a49abaa0ba9160f81b4d4e4b8ab`.

#### Build Quality Gate

- [x] DOD-TP-BUG022-R4-F11: TP-BUG022-R4-F11 proves "Presentation forms cannot hide unknown
  declaration candidates." Table-cell and `Command:` candidates reach fail-closed classification
  with artifact and line provenance.
  **Phase:** test. **Claim Source:** executed. **Evidence:** independent `bubbles.test` F11
  receipt, exact title PASS, SHA-256
  `8518c47065b2f951df2b22b8dc65c0a51f06137d7fb356904a5be96fc2350bf9`.
- [x] DOD-TP-BUG022-R4-F12: TP-BUG022-R4-F12 proves "Quoted Node options before the glob remain
  extractable." A quoted `--test-name-pattern` value cannot hide the direct Node declaration.
  **Phase:** test. **Claim Source:** executed. **Evidence:** independent `bubbles.test` F12
  receipt, exact title PASS, SHA-256
  `02a3187a64f581762d46824eae3b6b962f3955427241773ee6ffbd397182dded`.
- [x] DOD-TP-BUG022-R4-F13: TP-BUG022-R4-F13 proves "Baseline updates validate before writing."
  New-orphan and empty-root checks complete before any write and preserve baseline bytes. A valid
  root removes one stale baseline entry only after all checks pass, then passes a normal rerun.
  **Phase:** test. **Claim Source:** executed. **Evidence:** independent `bubbles.test` F13
  receipt, exact title PASS, SHA-256
  `dc410439670fa38a134d4302cfd4cc6079764dce255be940004a4dad4ce5aaf5`.
- [x] DOD-TP-BUG022-R4-F14: TP-BUG022-R4-F14 proves dynamic `import('node:test')` remains
  test-bearing and cannot receive the helper exemption.
  **Phase:** test. **Claim Source:** executed. **Evidence:** independent `bubbles.test` F14
  receipt, exact title PASS, SHA-256
  `eb69c523485c8668092fc81baf5b3c8d8ba3b4b3f9eac235d91395c222a4003b`.
- [x] DOD-TP-BUG022-R4-C15: TP-BUG022-R4-C15 passes the complete shared carrier after all four
  focused regressions turn green at one source revision.
  **Phase:** test. **Claim Source:** executed. **Evidence:** independent `bubbles.test` C15
  shared-carrier receipt, 26/26, exit 0, SHA-256
  `fabc12ffdf19a870fae53474537e32a6c529615a50af95930b071605d665d6ca`.
- [x] DOD-TP-BUG022-R4-C16: TP-BUG022-R4-C16 passes the real production reachability CLI with
  zero new orphans, zero classification errors, and unchanged ratchets.
  **Phase:** test. **Claim Source:** interpreted. **Interpretation:** The authorized-overlay run
  proves this row with 201 files, 10 active, 37 historical, zero errors, 184 reachable, 11 exempt,
  6 frozen, and no growth. The dirty live-tree run remains non-passing because excluded
  tool-brief work is outside this bug. **Evidence:** SHA-256
  `4ef47d9d15c5741ea0909133ce07d45f24c33645f1512b3e9f6bbe56861468a5`.
- [x] DOD-TP-BUG022-R4-C17: TP-BUG022-R4-C17 refreshes the complete Feature 008 consumer receipt
  on the same source revision under BUG-017's selected one-worker route.
  **Phase:** test. **Claim Source:** executed. **Evidence:** independent `bubbles.test` C17
  receipts: Node 257/257 with SHA-256
  `9de0856f1ec5b50b6f9e87be4982255ec05ef9ddcf81ccc8bc479f2a13383847`; browser 94/94 at
  workers=1 with zero residue and SHA-256
  `9369a35796851f8d2bef40d946b5f11f2e4a4a250c0e564178d81d4bc850d023`.
- [x] DOD-TP-BUG022-R4-C18: TP-BUG022-R4-C18 proves atomic rollback and object integrity for the
  validator and focused carrier. It also proves unchanged baseline, registry, protected report,
  and excluded paths.
  **Phase:** test. **Claim Source:** executed. **Evidence:** independent `bubbles.test` C18
  receipt, exact rollback title PASS with no mutation residue, SHA-256
  `a169112af78acbd1290ab854e87e12e0bfe7650129156530f1e6cfa5c8379728`.
- [x] DOD-TP-BUG022-R4-C19: TP-BUG022-R4-C19 passes at or above the pre-repair assertion
  baseline on the same stable revision as the focused and consumer receipts.
  **Phase:** test. **Claim Source:** interpreted. **Interpretation:** The current-session
  `bubbles.test` structured receipt at `.specify/runtime/tool-calls.jsonl` line 1612 records the
  exact `node scripts/selftest.mjs` command at exit 0. Its 13-path authorized overlay and
  `scripts/selftest.mjs` input hashes match the current files. The test-owned capture reports
  3465 assertions passed, zero failed, equal to the 3465 pre-repair baseline, with 3960 complete
  output lines and zero cleanup residue. **Evidence:** structured receipt stdout SHA-256
  `452f7994001bc4466469c93f8b7f0f0eb560036ce90805c92f3f25df7621ecd8`; full-output SHA-256
  `48008f44ee1b7a4ca6046642b2f9d443b22562ba43b6969d9786120bb1099e2a`; focused-test input
  SHA-256 `8c03acef5149c5eb431d888c9938ceb88600c36b065d691b0d71396222043644`.

- [x] DOD-TP-BUG022-R4-F20: TP-BUG022-R4-F20 proves an active same-pattern Node and
  Playwright crossing causes the production `--update-baseline` path to call
  `runnerDisjointnessVerdict()` before its sole baseline write and exit nonzero
  through `RunnerDisjointnessRefusal`, without duplicate crossing-set decision
  logic, while the exact sentinel baseline bytes remain unchanged.
  **Phase:** test. **Claim Source:** executed. **Evidence:** independent `bubbles.test`
  structured receipt at [.specify/runtime/tool-calls.jsonl line 1620](../../../.specify/runtime/tool-calls.jsonl#L1620), exact F20 title, exit 0, stdout SHA-256
  `469dc86a891668010efd6c2e2b570c99b78dd90d1185e84a8aaa1f39ad5a6ba5`; the
  valid-update control at [line 1625](../../../.specify/runtime/tool-calls.jsonl#L1625)
  also exits 0 with stdout SHA-256
  `a1e1fec237be394c1c32f2c46a356e8592c67ee6a01488a8a7a0ff8fb3792389`.
- [x] DOD-TP-BUG022-R4-F21: TP-BUG022-R4-F21 proves boolean `--test-only` cannot
  consume a following quoted positional test glob and that the extracted glob
  retains exact artifact and line provenance.
  **Phase:** test. **Claim Source:** executed. **Evidence:** independent `bubbles.test`
  structured receipt at [.specify/runtime/tool-calls.jsonl line 1621](../../../.specify/runtime/tool-calls.jsonl#L1621), exact F21 title, exit 0, stdout SHA-256
  `0dafb93205abf98a5a45a3ef789ce36049346414e3091d2d05823d36a596a883`.
- [x] DOD-TP-BUG022-R4-F22: TP-BUG022-R4-F22 proves both commands in one Markdown
  table row plus unordered and ordered Markdown-list commands are asserted
  independently and reach fail-closed role classification with artifact and
  line provenance, while the existing `Command:` control remains green.
  **Phase:** test. **Claim Source:** executed. **Evidence:** independent `bubbles.test`
  structured receipt at [.specify/runtime/tool-calls.jsonl line 1622](../../../.specify/runtime/tool-calls.jsonl#L1622), exact F22 title, exit 0, stdout SHA-256
  `1dd3fd87567649a8e05cefa450f5acc42314548c75bedbc2ca7b6891195a4ce2`.
- [x] DOD-TP-BUG022-R4-C23: TP-BUG022-R4-C23 passes the complete shared functional
  carrier after F20 through F22 turn GREEN, with no skipped, todo, or only test.
  **Phase:** test. **Claim Source:** executed. **Evidence:** independent `bubbles.test`
  complete-carrier receipt at [.specify/runtime/tool-calls.jsonl line 1623](../../../.specify/runtime/tool-calls.jsonl#L1623), exact carrier command, exit 0,
  30 passed with zero failed, skipped, or todo, stdout SHA-256
  `9ca85c43f7afc73246f9bdc612af219b9e4fdafa5ff37c120bd4916b4a006aab`.
- [x] DOD-TP-BUG022-R4-C24: TP-BUG022-R4-C24 passes the production reachability CLI
  with a non-vacuous scan, zero classification errors, zero new orphans, and no
  baseline or crossing-ratchet growth.
  **Phase:** test. **Claim Source:** executed. **Evidence:** independent `bubbles.test`
  isolated production-reachability receipt at [.specify/runtime/tool-calls.jsonl line 1627](../../../.specify/runtime/tool-calls.jsonl#L1627), exact production CLI,
  exit 0, stdout SHA-256
  `30520dbe61c1dc3d30eabc6dc550f70f80188b61b3109aca307c22b607515b74`;
  its input closure records the unchanged baseline and crossing-ratchet inputs.
- [x] DOD-TP-BUG022-R4-C25: TP-BUG022-R4-C25 reverses and reapplies the current
  validator and focused-test delta in an isolated repository, restores exact
  source/test objects in each direction, preserves every protected object and
  excluded path, and leaves zero mutation residue.
  **Phase:** test. **Claim Source:** executed. **Evidence:** independent `bubbles.test`
  rollback/reapply receipt at [.specify/runtime/tool-calls.jsonl line 1624](../../../.specify/runtime/tool-calls.jsonl#L1624), exact C25 title, exit 0, stdout SHA-256
  `4acfcb19a45ebc43f4f6d83117b97ca096f750b4079a498b6c42ee9a765be646`;
  source SHA-256 `60aaec8745d728c3044c7f19f518b739911f17dd4a7f85fd6caf19b46826efef`
  and test SHA-256 `dd8d8f209781a2b9b8612f24e2a94708f01a564c990e7764a63611168a3cf036`.

- [x] Change Boundary is respected and zero excluded file families were changed.
  The parser, focused test, and command-registry migration land atomically.
  `KNOWN_DISCOVERY_CROSSINGS` and the reachability baseline do not grow. The
  focused test contains no skip, only, todo, or silent-pass bailout. The final
  explicit-pathspec commit contains only allowed changed files. Staged-path,
  committed-path, and excluded-path comparisons report leakage 0. No push,
  reset, rebase, framework edit, protected evidence edit, or acceptance act
  occurs.
  **Phase:** test. **Claim Source:** executed. **Evidence:** [Fresh Change Boundary containment at c652cd092](report.md#fresh-change-boundary-containment-at-c652cd092), exit 0, all historical delivery and current protected-invariant subchecks passed, `CONTAINMENT_FAILURES=0`, `leakage=0`, sha256 `866f3a0b34ce3fc48a36208acd2561e5993e0e48b4337b5612e3bf62bedce2bb`.
