# Scopes: BUG-022 Historical Report Declaration Leak

Links: [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Execution Outline

### Phase Order

1. **Scope 1: Classify declaration authority and close repository reachability.**
   Land the classifier, focused regressions, and registry migration atomically.

The design forbids a parser-only intermediate state. Ignoring historical report
sites before adding current family commands would expose legitimate tests as
orphans. One scope therefore owns the complete vertical repair.

### New Types And Signatures

- `ArtifactRole`: closed role for Playwright config, command registry, active
  plan, validation note, historical report, and unknown candidate surfaces.
- `SectionRole`: closed role for Command Registry, Test Plan, Validation,
  evidence, or no recognized section.
- `DeclarationAuthority`: `active`, `historical`, or `error`.
- `DeclarationSite`: pattern, kind, artifact, line, artifact role, section role,
  authority, and machine-readable reason.
- `collectDeclaredTestGlobs(root)`: returns active `globs`,
  `historicalSites`, `classificationErrors`, and `scannedFiles`.
- `--all-sites`: prints active, historical, and error sites with provenance.

### Validation Checkpoints

1. Capture the unchanged RED result before editing production or registry code.
2. Add six named tests and confirm the bug cases are RED while the active-site
   control remains authoritative.
3. Run the focused Node file after the classifier and registry migration.
4. Run reachability and confirm zero baseline growth.
5. Run Feature 008 Node tests and Playwright tests as separate commands.
6. Run the repository selftest, packet lint, guard, and containment checks.

## Scope Inventory

| # | Name | Surfaces | Tests | DoD summary | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Declaration authority and reachability closure | Parser, focused Node test, command registry, BUG-022 packet | Functional, e2e-ui, integrity, governance | Structured roles, fail-closed unknowns, unchanged baseline and report, zero leakage | In Progress |

## Scope 1: Classify Declaration Authority And Close Reachability

**Status:** In Progress
**Depends On:** none
**Scope-Kind:** runtime-behavior
**Requirements:** FR-BUG022-001 through FR-BUG022-007

### Change Boundary

Allowed implementation files:

- `scripts/validate-test-file-reachability.mjs`
- `tests/playwright-runtime.foundation.functional.mjs`
- `.specify/memory/agents.md`

Allowed BUG-022 planning and evidence files:

- `specs/_bugs/BUG-022-historical-report-declaration-leak/scopes.md`
- `specs/_bugs/BUG-022-historical-report-declaration-leak/test-plan.json`
- `specs/_bugs/BUG-022-historical-report-declaration-leak/scenario-manifest.json`
- `specs/_bugs/BUG-022-historical-report-declaration-leak/report.md`
- `specs/_bugs/BUG-022-historical-report-declaration-leak/uservalidation.md`
- `specs/_bugs/BUG-022-historical-report-declaration-leak/state.json`

Excluded surfaces:

- `specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md`
- every BUG-016 through BUG-021 packet
- market-brief, tool-brief-v2, and open-work paths
- every portfolio source or test outside the focused foundation file
- all installed framework paths under `.github/`
- every unrelated or concurrently dirty path

No reset, rebase, push, baseline growth, frozen-crossing growth, or human
acceptance mutation belongs to this scope.

### Gherkin Scenarios

```gherkin
Feature: Current test declarations exclude immutable historical receipts

  @SCN-BUG022-001
  Scenario: Artifact role separates historical receipts from active plans
    Given identical node --test tests/portfolio-*.mjs text in a report receipt
    And in an active scope Test Plan or structured test plan
    When the production collector classifies both candidates
    Then the report site is historical and cannot declare the Node pattern
    And the active site remains authoritative with artifact and line provenance

  @SCN-BUG022-002
  Scenario: Markdown presentation cannot manufacture authority
    Given active-looking headings inside historical evidence and fenced headings
    And a glob candidate on an unrecognized artifact surface
    When the production collector classifies the candidates
    Then report artifact role outranks every nested heading
    And fenced headings cannot open or close an authority section
    And the unknown artifact role causes a fail-closed error with provenance

  @SCN-BUG022-003
  Scenario: Additive migration closes the repository without weakening ownership
    Given the original eight report-derived portfolio crossings
    And legitimate tests/*.functional.mjs and tests/*.test.mjs Node families
    When the classifier and current command registry migration land together
    Then all eight false crossings disappear without crossing-baseline growth
    And both legitimate Node families remain reachable without report authority
    And Node and Playwright ownership stays disjoint
    And the protected Feature 008 report remains byte-for-byte unchanged
```

### Scenario Obligation Matrix

| Scenario | Behavior traits | Obligations | Implementation refs |
| --- | --- | --- | --- |
| SCN-BUG022-001 | pure-calculation, static-metadata | Production-function assertion over classified output, active-versus-historical parity, artifact and line provenance | `scripts/validate-test-file-reachability.mjs#collectDeclaredTestGlobs`, `tests/playwright-runtime.foundation.functional.mjs` |
| SCN-BUG022-002 | pure-calculation, degraded-state, static-metadata | Fence-aware heading assertion, named fail-closed refusal, candidate provenance assertion | `scripts/validate-test-file-reachability.mjs#collectDeclaredTestGlobs`, `tests/playwright-runtime.foundation.functional.mjs` |
| SCN-BUG022-003 | static-metadata, user-visible-ui | Repository reachability assertion, unchanged ratchets, current production-route browser regression, immutable artifact check | `scripts/validate-test-file-reachability.mjs`, `.specify/memory/agents.md`, `playwright.config.mjs`, `tests/playwright-runtime.foundation.functional.mjs`, `tests/` |

### Implementation Plan

1. Capture RED-01 by running the unchanged runtime-foundation test. Require a
   non-zero result naming exactly the eight portfolio crossings.
2. Add the six exact Node test titles listed under RED/GREEN Tasks. Run them
   before implementation. Preserve the active declaration as a positive
   control. Do not weaken it to make every new test RED.
3. In `scripts/validate-test-file-reachability.mjs`, keep repository-wide
   candidate extraction inside `collectDeclaredTestGlobs()`.
4. Add structured artifact-role and section-role classification. Reuse the
   fence mask and heading ancestry behavior named in `design.md`.
5. Parse `specs/**/test-plan.json` commands as structured active plan sites.
   Reject malformed candidate-bearing structured plans.
6. Return separate active, historical, and classification-error collections.
   Compile reachability and crossing patterns from active sites only.
7. Make every unknown candidate block with its artifact, line, section context,
   and closed reason. Keep zero active Node declarations as a vacuity failure.
8. Add `node --test tests/*.functional.mjs` and
   `node --test tests/*.test.mjs` to `.specify/memory/agents.md` under the real
   Command Registry ancestry. Do not add a portfolio-wide Node command.
9. Keep `KNOWN_DISCOVERY_CROSSINGS` and the reachability baseline unchanged.
10. Run GREEN checkpoints in order. Run Node and Playwright commands separately.
11. Commit with an explicit pathspec containing only changed allowed files.
    Compare staged and committed paths to that allowlist and require leakage 0.

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

### Consumer Impact Sweep

- `collectDeclaredTestGlobs()` consumers in reachability validation and the
  runtime-foundation crossing assertion use the same classified result.
- `.specify/memory/agents.md` gains only the two missing current Node families.
- `playwright.config.mjs::testMatch` remains unchanged and authoritative.
- Structured `test-plan.json` commands and Markdown scope Test Plans remain
  reachable active consumers.
- Historical packet and scope reports remain observable diagnostic consumers.
- `--all-sites` exposes active, historical, and error provenance.

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
| TP-BUG022-C01 | SCN-BUG022-003 | Repository closure | functional | `scripts/validate-test-file-reachability.mjs` | Additive migration closes the repository without weakening ownership: the original eight crossings disappear, both Node families remain reachable, and the baseline does not grow | `node scripts/validate-test-file-reachability.mjs` | No |
| TP-BUG022-C02 | SCN-BUG022-003 | Node regression | functional | `tests/portfolio-*.unit.mjs`, `tests/portfolio-*.functional.mjs` | Legitimate Feature 008 Node carriers remain owned by Node | `node --test tests/portfolio-*.unit.mjs tests/portfolio-*.functional.mjs` | No |
| TP-BUG022-C03 | SCN-BUG022-003 | Browser regression | e2e-ui | `tests/portfolio-survival-*.spec.mjs` | Current portfolio browser scenarios remain owned and executable by Playwright | `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-BUG022-C04 | SCN-BUG022-001, SCN-BUG022-002, SCN-BUG022-003 | Repository regression | functional | `scripts/selftest.mjs` | The full build-free invariant suite remains green in a clean tree | `node scripts/selftest.mjs` | No |
| TP-BUG022-C05 | SCN-BUG022-003 | Integrity | governance | protected report and explicit allowlist | Historical report blob, baseline, crossing set, and excluded paths are unchanged | `git diff --exit-code 359d536b -- specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md` plus path-containment checks | No |
| TP-BUG022-C06 | SCN-BUG022-001, SCN-BUG022-002, SCN-BUG022-003 | Packet validation | governance | BUG-022 packet | Artifact structure, scenario contracts, and Test Plan parity pass | `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-022-historical-report-declaration-leak` | No |
| TP-BUG022-C07 | SCN-BUG022-001, SCN-BUG022-002, SCN-BUG022-003 | Transition report | governance | BUG-022 packet | Guard reports the truthful non-terminal state without creating acceptance | `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-022-historical-report-declaration-leak` | No |

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
- [ ] TP-BUG022-C03 passes the Feature 008 Playwright regressions separately.
  **Phase:** implement. **Claim Source:** executed. **Uncertainty Declaration:** `report.md#feature-008-playwright-regression---non-zero` records exit 1. All 94 scenarios passed, but BUG-017 worker teardown emitted two force-kill errors.
- [ ] TP-BUG022-C04 passes the full repository selftest in a clean tree.
  **Phase:** implement. **Claim Source:** executed. **Uncertainty Declaration:** `report.md#clean-tree-repository-selftest---non-zero` records exit 1 from 13 excluded certification drifts and BUG-022's validate-owned stale scope-progress claim.
- [x] TP-BUG022-C05 proves the Feature 008 report is byte-identical and every
  excluded path is unchanged.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** `report.md#change-containment`, exit 0, six allowed paths, `leakage=0`.
- [x] TP-BUG022-C06 passes packet artifact lint and scenario/Test Plan parity.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** `report.md#packet-artifact-lint`, exit 0, sha256 `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567`.
- [x] TP-BUG022-C07 records the real transition-guard verdict without changing
  terminal status, Checklist items, or Human Acceptance Record fields.
  **Phase:** implement. **Claim Source:** executed. **Evidence:** `report.md#truthful-transition-guard`, exit 1 with `DELIVERY_COMPLETION_FAILED`; status and acceptance remained unchanged.

#### Build Quality Gate

- [ ] The parser, focused test, and command-registry migration land atomically.
  `KNOWN_DISCOVERY_CROSSINGS` and the reachability baseline do not grow. The
  focused test contains no skip, only, todo, or silent-pass bailout. The final
  explicit-pathspec commit contains only allowed changed files. Staged-path,
  committed-path, and excluded-path comparisons report leakage 0. No push,
  reset, rebase, framework edit, protected evidence edit, or acceptance act
  occurs.
