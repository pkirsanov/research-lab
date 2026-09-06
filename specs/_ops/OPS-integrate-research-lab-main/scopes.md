# OPS Integration Scopes

<!-- markdownlint-disable-file MD024 -->

Links: [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Execution Outline

### Phase Order

1. Scope 1 freezes live Git state and assigns one evidence-backed classification to every discovered item.
2. Scope 2 proves inclusion or supersession, then preserves every owner-approved dirty byte on its owning history.
3. Scope 3 constructs the isolated merge candidate and records each conflict before resolving it at path level.
4. Scope 4 regenerates committed artifacts and validates one unchanged candidate revision with registered commands.
5. Scope 5 advances local `main` by compare-and-swap, proves ancestry, retains residue, and routes the delivery DAG.

Each scope depends on the prior scope. A failed checkpoint blocks the next scope.

The design-time inventory identity is
`sha256:8ab3e15d4b40fdb6984ff3f62381bf0b65ced1d81da9ab9a208f062b3c1c1eb4`.
It contains 68 refs, five worktree registrations, and one live stash alias.
Execution must derive a new full identity from live state before any mutation.

`PUSH: NOT AUTHORIZED`

`CLEANUP: NOT AUTHORIZED`

### New Types And Signatures

- `ops-integration-ledger/v1`: append-only packet ledger in `integration-ledger.jsonl`.
- `inventoryId: sha256:<full-digest>`: normalized identity for refs, worktrees, stash, dirt, and main.
- `classification`: one of the seven values defined by `OPS-FR-005`.
- `candidateAttemptId: candidate-<inventory-prefix>-<attempt>`: one isolated candidate construction attempt.
- `conflict-observed`: path, merge step, base, both source intents, owner, and unresolved state.
- `conflict-resolved`: selected behavior, result blob, owner, and exact validating check.
- `candidate-approved`: full candidate SHA plus the exact-SHA approval result.
- `main-cas`: expected old SHA, approved new SHA, result, and reverse-CAS state.
- `handoff`: packet state blob, recorded owner, next obligation, and integrated main SHA.

### Validation Checkpoints

- Checkpoint 1 proves packet validity, inventory cardinality, classification coverage, and repository quiescence.
- Checkpoint 2 proves every substantive dirty blob is durable and every operational path is excluded.
- Checkpoint 3 proves source refs are unchanged and conflict records match all unmerged paths.
- Checkpoint 4 binds every producer, product, browser, security, and governance receipt to one candidate SHA.
- Checkpoint 5 proves compare-and-swap identity, required ancestry, no push, no cleanup, and honest routing.

## Planning Basis

This plan implements the current [specification](spec.md) and [design](design.md).
It preserves the user-authorized merge and prerequisite commit boundary.
It does not authorize push, ref deletion, stash mutation, worktree removal, or file cleaning.

The operation uses Research Lab's build-free command surface.
No project CLI, lint command, format command, or typecheck command is introduced.
Every command must run from the repository root with a finite supervisor.
Output must remain complete or use the installed evidence-capture helper above 40 lines.

The repository config declares no `testImpact` or `traceContracts` block.
No impact-map or observability workflow applies to these scopes.

## Requirement And Scenario Coverage

| Scope | Requirement coverage | Scenario coverage | Primary outcome |
| --- | --- | --- | --- |
| 1 | OPS-FR-001 through OPS-FR-005, OPS-FR-022 | SCN-OPS-001, SCN-OPS-002, SCN-OPS-009 | One current, complete, quiescent inventory |
| 2 | OPS-FR-006 through OPS-FR-015 | SCN-OPS-003 through SCN-OPS-006 | Selected tips and durable owner-approved bytes |
| 3 | OPS-FR-016 through OPS-FR-022 | SCN-OPS-007, SCN-OPS-008 | One isolated merge candidate with complete conflict accounting |
| 4 | OPS-FR-023 through OPS-FR-027 | SCN-OPS-010, SCN-OPS-014 | One unchanged candidate with complete validation receipts |
| 5 | OPS-FR-027 through OPS-FR-035 | SCN-OPS-011 through SCN-OPS-015 | Validated local main plus an honest delivery handoff |

## Plan Summary

| # | Scope | Depends On | Surfaces | Test rows | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Freeze and classify live state | None | Git refs, worktrees, stash, OPS ledger | 3 | In Progress |
| 2 | Prove selection and preserve dirty bytes | 1 | Primary, Company, Shock, preservation histories | 4 | Not Started |
| 3 | Construct candidate and resolve conflicts | 2 | Isolated branch, worktree, conflict ledger | 2 | Not Started |
| 4 | Regenerate and validate exact candidate | 3 | Pages output, product checks, browser checks, Bubbles guards | 5 | Not Started |
| 5 | Compare-and-swap main and resume delivery | 4 | Local main, ancestry proof, retained residue, handoff records | 4 | Not Started |

## Scope 1: Freeze And Classify Live State

**Status:** In Progress

This scope remains nonterminal.

**Depends On:** None

**Scope Kind:** contract-only

**Requirement Refs:** OPS-FR-001 through OPS-FR-005, OPS-FR-022

### Gherkin Scenarios

#### SCN-OPS-001: Fetch Does Not Select Inputs

```gherkin
Scenario: Fetch remains separate from merge selection
  Given all available remote refs have been fetched
  When the executor begins integration planning
  Then every ref is classified before any merge input is selected
  And preservation refs are not selected merely because they were fetched
```

#### SCN-OPS-002: Every Item Is Classified

```gherkin
Scenario: Every discovered item receives one classification
  Given local, remote, checkpoint, preserve, stash, rescue, and worktree items exist
  When the executor freezes the normalized inventory
  Then every ref name and worktree alias occurs exactly once
  And every row records identity, ancestry, tree, ownership, action, and evidence
```

#### SCN-OPS-009: Drift Invalidates The Inventory

```gherkin
Scenario: Repository drift stops the next mutation
  Given an inventory identity and candidate plan are current
  When a source ref, stash, worktree status, lock, or writer state changes
  Then the ledger records INVENTORY-DRIFT
  And no later mutation runs until a new inventory is frozen
```

### Implementation Plan

1. Revalidate the inherited repository packet against session control revision 58.
2. Let `bubbles.devops` create its owned `objective.md` and `runbook.md` before Git mutation.
3. Record fetch as complete and separate from all merge-selection decisions.
4. Capture local and remote refs with full names, object identities, and object types.
5. Capture all worktree registrations, normalized worktree status, and stash parent identities.
6. Capture local `main`, `origin/main`, their merge base, and their divergence.
7. Scan locks, Git operation markers, and active writer processes.
8. Normalize machine paths to the five worktree aliases defined in [design.md](design.md).
9. Exclude only this OPS packet's planner-owned paths from dirty-status hashing.
10. Append one `inventory-frozen` event and one `inventory-item` event per item.
11. Require inventory and classification cardinality equality before freeze.
12. Recompute the inventory immediately before the first mutation boundary.

### Change Boundary

Allowed writes are `objective.md`, `runbook.md`, `integration-ledger.jsonl`, and the owned report section.
Only `bubbles.devops` may create the first three files.
This scope may add the planned OPS test files through their registered test owner.

No branch, stash, worktree, tracked product file, or remote ref may change in this scope.
No absolute worktree path may enter a committed packet artifact.

### Test Plan

| ID | Test Type | Category | File / Location | Scenario | Expected test title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | functional | functional | `tests/ops-integrate-research-lab-main.functional.mjs` | SCN-OPS-001 | `Regression: SCN-OPS-001 fetch discovery never selects merge inputs` | `node --test tests/*.functional.mjs` | No |
| TP-01-02 | functional | functional | `tests/ops-integrate-research-lab-main.functional.mjs` | SCN-OPS-002 | `Regression: SCN-OPS-002 inventory cardinality and classifications are exact` | `node --test tests/*.functional.mjs` | No |
| TP-01-03 | integration | integration | `tests/ops-integrate-research-lab-main.integration.mjs` | SCN-OPS-009 | `Regression: SCN-OPS-009 changed Git state invalidates the frozen inventory` | `node --test tests/*.integration.mjs` | Yes, isolated real Git fixture |

### Definition of Done - Tiered Validation

#### Core Outcomes

- [x] The inherited packet is current and actionable at the first observation boundary. → Evidence: [Scope 1 inventory freeze evidence](report.md#scope-1-inventory-freeze-evidence)
- [x] The full live inventory receives a new normalized SHA-256 identity. → Evidence: [Scope 1 inventory freeze evidence](report.md#scope-1-inventory-freeze-evidence)
- [x] Every ref, worktree registration, and stash alias has one classification record. → Evidence: [Scope 1 inventory freeze evidence](report.md#scope-1-inventory-freeze-evidence)
- [x] Fetch evidence and selected merge inputs remain separate ledger fields. → Evidence: [Scope 1 inventory freeze evidence](report.md#scope-1-inventory-freeze-evidence)
- [x] Quiescence is current when the inventory enters `FROZEN`. → Evidence: [Scope 1 inventory freeze evidence](report.md#scope-1-inventory-freeze-evidence)

#### Test Evidence Items

- [ ] **DOD-01-TP-01-01:** TP-01-01 proves fetched refs cannot become merge inputs without classification.
  > **Uncertainty Declaration**
  > **What was attempted:** The artifact and traceability chain inspected the planned linked test.
  > **What was observed:** The functional test file is absent. Its exact path is declared in `workBoundary.allowedPaths` for the registered test owner.
  > **Why this is uncertain:** No executable test currently proves SCN-OPS-001.
  > **What would resolve this:** `/bubbles.test` must author and run TP-01-01.
- [ ] **DOD-01-TP-01-02:** TP-01-02 proves every discovered item receives one classification with exact inventory cardinality.
  > **Uncertainty Declaration**
  > **What was attempted:** The focused ledger probe proved live cardinality, but the planned persistent test file is absent.
  > **What was observed:** The probe passed 68-ref, five-worktree, and one-stash parity. TP-01-02 has no test execution receipt.
  > **Why this is uncertain:** The direct probe does not replace the planned regression test.
  > **What would resolve this:** `/bubbles.test` must author and run TP-01-02.
- [ ] **DOD-01-TP-01-03:** TP-01-03 proves repository drift stops the next mutation and invalidates the frozen inventory.
  > **Uncertainty Declaration**
  > **What was attempted:** The live freeze checked quiescence without changing repository state.
  > **What was observed:** The integration test file is absent. Its exact path is declared in `workBoundary.allowedPaths` for the registered test owner.
  > **Why this is uncertain:** No isolated real Git fixture currently proves the drift refusal.
  > **What would resolve this:** `/bubbles.test` must author and run TP-01-03.

#### Build Quality Gate

- [ ] Scope 1 passes packet reference, ledger schema, forbidden-path, artifact, and state checks with complete evidence.
  > **Uncertainty Declaration**
  > **What was attempted:** The focused ledger probe and the complete Scope 1 governance chain ran.
  > **What was observed:** Ledger, artifact, state, YAML, references, prose, and Git whitespace passed. The all-scope traceability guard rejected missing planned test links.
  > **Why this is uncertain:** The grouped gate remains nonzero while those links name absent tests.
  > **What would resolve this:** `/bubbles.test` must author the tests, update their evidence links, and rerun the chain.

## Scope 2: Prove Selection And Preserve Dirty Bytes

**Status:** Not Started

This scope remains nonterminal.

**Depends On:** Scope 1

**Scope Kind:** bootstrap

**Requirement Refs:** OPS-FR-006 through OPS-FR-015

### Gherkin Scenarios

#### SCN-OPS-003: Mirrors Stay Out Of The Merge

```gherkin
Scenario: Represented preservation refs remain retained and excluded
  Given two or more refs resolve to represented commit or tree content
  When the executor closes their disposition records
  Then the candidate plan references that represented content once
  And every preservation alias remains recorded and retained
```

#### SCN-OPS-004: Unique Content Blocks Exclusion

```gherkin
Scenario: Unique preservation content blocks exclusion
  Given a preservation or rescue root has a unique intended commit or blob
  And no selected history proves representation
  When the executor evaluates its disposition
  Then the item remains conditional with UNIQUE-CONTENT-UNRESOLVED
  And candidate construction remains refused
```

#### SCN-OPS-005: Dirty Bytes Become Durable

```gherkin
Scenario: Owner-approved dirty bytes become durable
  Given a substantive dirty path has an owner and a pre-commit blob identity
  When the executor commits the explicit approved path list
  Then the resulting commit tree contains the approved blob
  And the commit contains no operational marker, runtime ledger, lock, or test residue
```

#### SCN-OPS-006: Latest Family Tips Are Selected

```gherkin
Scenario: Each delivery family contributes one latest complete tip
  Given Company and Shock checkpoints extend their original branch tips
  When object, ancestry, tree, blob, and owner proofs close
  Then each family contributes one latest non-superseded tip
  And every older family tip remains retained with representation evidence
```

### Implementation Plan

1. Resolve every conditional row from the current design matrix against the frozen inventory.
2. Compare exact objects before comparing ancestry, trees, paths, blobs, or patches.
3. Inspect stash base, index, worktree, and untracked parents independently.
4. Require owner decisions for semantic differences that object proofs cannot resolve.
5. Inventory staged, tracked, untracked, and ignored paths in every live worktree.
6. Assign primary dirty paths to Feature 030, BUG-022, or this OPS packet.
7. Assign Shock worktree bug paths to BUG-017 or BUG-024 owners.
8. Exclude every `.bubbles-worktree` marker and every forbidden content class.
9. Stage explicit approved path lists only. Repository-wide staging is forbidden.
10. Commit Feature 030, BUG-022, BUG-017, and BUG-024 bytes in owner-separated commits.
11. Record every pre-commit blob, expected parent, staged path set, result commit, and result blob.
12. Re-freeze all source identities and worktree states after each preservation commit.
13. Select one proved final tip for each delivery family.

### Change Boundary

Allowed source writes are the exact dirty path sets listed in [design.md](design.md).
Each commit must name one owning packet and one expected parent.
This OPS packet may change only through its planning and devops-owned records.

Excluded content includes `.bubbles-worktree`, `.specify/runtime/**`, `_site/**`, test output, locks, and session logs.
No lifecycle, certification, or human acceptance field may change by interpretation.

### Test Plan

| ID | Test Type | Category | File / Location | Scenario | Expected test title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | functional | functional | `tests/ops-integrate-research-lab-main.functional.mjs` | SCN-OPS-003 | `Regression: SCN-OPS-003 represented mirrors remain retained and merge once` | `node --test tests/*.functional.mjs` | No |
| TP-02-02 | functional | functional | `tests/ops-integrate-research-lab-main.functional.mjs` | SCN-OPS-004 | `Regression: SCN-OPS-004 unique content refuses represented classification` | `node --test tests/*.functional.mjs` | No |
| TP-02-03 | integration | integration | `tests/ops-integrate-research-lab-main.integration.mjs` | SCN-OPS-005 | `Regression: SCN-OPS-005 explicit path commit preserves approved blobs only` | `node --test tests/*.integration.mjs` | Yes, isolated real Git fixture |
| TP-02-04 | functional | functional | `tests/ops-integrate-research-lab-main.functional.mjs` | SCN-OPS-006 | `Regression: SCN-OPS-006 family selector chooses one proved latest tip` | `node --test tests/*.functional.mjs` | No |

### Definition of Done - Tiered Validation

#### Core Outcomes

- [ ] Every conditional ref row has an inclusion, representation, or refusal record.
- [ ] Every substantive dirty path has an authoritative owner and durable commit.
- [ ] Every approved blob matches its result commit tree.
- [ ] Every preservation commit uses its frozen expected parent.
- [ ] No forbidden content enters a staged set or commit tree.
- [ ] Company, Shock, primary, archive, stash, and rescue selections have complete proofs.

#### Test Evidence Items

- [ ] **DOD-02-TP-02-01:** TP-02-01 proves represented mirrors remain retained and enter the plan once.
- [ ] **DOD-02-TP-02-02:** TP-02-02 proves unresolved unique content blocks exclusion.
- [ ] **DOD-02-TP-02-03:** TP-02-03 proves explicit owner commits preserve approved blobs and reject forbidden paths.
- [ ] **DOD-02-TP-02-04:** TP-02-04 proves each delivery family contributes one latest complete tip through representation evidence.

#### Build Quality Gate

- [ ] Scope 2 passes dirty-path, staged-path, commit-tree, source-identity, packet-truth, and regression checks.

## Scope 3: Construct Candidate And Resolve Conflicts

**Status:** Not Started

This scope remains nonterminal.

**Depends On:** Scope 2

**Scope Kind:** bootstrap

**Requirement Refs:** OPS-FR-016 through OPS-FR-022

### Gherkin Scenarios

#### SCN-OPS-007: Candidate Construction Is Isolated

```gherkin
Scenario: Candidate construction uses an isolated branch and worktree
  Given every selected tip is durable and the frozen repository is quiescent
  When the executor merges full frozen identities in the declared order
  Then every required input enters through a merge commit
  And every source ref, stash, preservation ref, and source worktree stays unchanged
```

#### SCN-OPS-008: Every Conflict Is Accounted For

```gherkin
Scenario: Every conflict has one reviewable resolution
  Given Git reports an unmerged path during a candidate merge step
  When the owning history resolves that path
  Then one conflict-observed event precedes one current conflict-resolved event
  And the resolution records both intents, chosen behavior, owner, result blob, and exact check
```

### Implementation Plan

1. Revalidate the packet, frozen inventory, selected tips, locks, markers, and writers.
2. Confirm the integration branch name and worktree location do not already exist.
3. Create the integration branch from the frozen local `main` identity.
4. Create a separate candidate worktree that contains the inventory digest prefix.
5. Merge frozen `origin/main` first with a merge commit.
6. Merge the final primary, Company, and Shock tips in design order.
7. Merge the archive family only when its complete lineage is owner-approved.
8. Preserve approved stash or rescue bytes through owner-specific commits.
9. Never merge stash merge commits or mixed rescue histories as convenience inputs.
10. Capture `git ls-files -u` after every merge step.
11. Create one `conflict-observed` event for every unmerged path.
12. Read base and both source blobs before selecting behavior.
13. Resolve each conflict at the smallest meaningful unit.
14. Regenerate generated files from their producers after source conflicts close.
15. Append one `conflict-resolved` event with a specific validation check.
16. Reopen a resolution when a later merge changes its result blob.
17. Refuse the candidate while conflict and current-resolution counts differ.

### Change Boundary

Allowed Git mutations are the new integration branch, its separate worktree, merge commits, and owner-approved content commits.
Allowed file changes are only merge results that the frozen inputs require.
Each conflict record must name the artifact owner before resolution.

Local `main`, remote-tracking refs, source branches, stashes, and existing worktree registrations are excluded.
Whole-file or whole-tree `ours` and `theirs` resolutions are forbidden.

### Test Plan

| ID | Test Type | Category | File / Location | Scenario | Expected test title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | integration | integration | `tests/ops-integrate-research-lab-main.integration.mjs` | SCN-OPS-007 | `Regression: SCN-OPS-007 merge commits stay inside the isolated candidate` | `node --test tests/*.integration.mjs` | Yes, isolated real Git fixture |
| TP-03-02 | integration | integration | `tests/ops-integrate-research-lab-main.integration.mjs` | SCN-OPS-008 | `Regression: SCN-OPS-008 conflict inventory equals current resolution inventory` | `node --test tests/*.integration.mjs` | Yes, isolated real Git fixture |

### Definition of Done - Tiered Validation

#### Core Outcomes

- [ ] The candidate branch starts at the frozen local `main` identity.
- [ ] Every selected source enters through a merge commit in design order.
- [ ] Every source ref and source worktree retains its frozen or preservation identity.
- [ ] Every unmerged path has one current owner-approved resolution record.
- [ ] Every result blob matches the candidate index before its merge commit.
- [ ] The candidate contains no unresolved conflict or unrecorded content commit.

#### Test Evidence Items

- [ ] **DOD-03-TP-03-01:** TP-03-01 proves candidate construction uses an isolated branch and worktree while source histories remain unchanged.
- [ ] **DOD-03-TP-03-02:** TP-03-02 proves conflict and current-resolution cardinality plus behavior checks.

#### Build Quality Gate

- [ ] Scope 3 passes source-identity, merge-parent, conflict-ledger, generated-output, and worktree-isolation checks.

## Scope 4: Regenerate And Validate The Exact Candidate

**Status:** Not Started

This scope remains nonterminal.

**Depends On:** Scope 3

**Scope Kind:** contract-only

**Requirement Refs:** OPS-FR-023 through OPS-FR-027

### Gherkin Scenarios

#### SCN-OPS-010: Validation Failure Leaves Main Unchanged

```gherkin
Scenario: Failed or stale validation cannot update local main
  Given one isolated candidate SHA exists and local main still has its frozen identity
  When a producer, safety, product, browser, security, or governance check fails or becomes stale
  Then no local main update runs
  And the candidate retains the complete failure evidence
```

#### SCN-OPS-014: Lifecycle Meaning Is Preserved

```gherkin
Scenario: Candidate validation preserves lifecycle and acceptance meaning
  Given each delivery packet has a pre-integration state and acceptance blob identity
  When its history becomes part of the candidate
  Then integration does not interpret certification or human acceptance content
  And any semantic conflict routes to the artifact owner
```

### Implementation Plan

1. Resolve each changed committed artifact to its exact producer.
2. Regenerate Pages output with `node scripts/build-pages-site.mjs`.
3. Regenerate other committed outputs only through producers named by their owning artifacts.
4. Record producer commands and input identities in the ledger.
5. Remove untracked generated output from the candidate only through producer-owned handling.
6. Record one candidate SHA before the first validation command.
7. Record that same SHA before and after every command.
8. Mark every prior receipt stale if the candidate changes.
9. Run the full registered Node, browser, security, and Bubbles command set.
10. Run all packet-focused Feature 030, Company, portfolio, Shock, and Playwright runtime checks.
11. Run the full Git safety, ancestry, conflict, forbidden-path, and clean-tree proofs.
12. Compare lifecycle, certification, and human acceptance blobs without interpreting their status.
13. Require one complete receipt set for one unchanged candidate SHA.

### Exact Candidate Commands

Run each command with a finite supervisor. Do not filter its output.

```bash
node scripts/validate-node-source-lock.mjs
npx --no-install playwright --version
node scripts/build-pages-site.mjs
node scripts/selftest.mjs
node --test tests/*.integration.mjs
node --test tests/*.functional.mjs
node --test tests/*.test.mjs
node --test tests/*.unit.mjs
node scripts/validate-brief-payload.mjs
node scripts/validate-causal-rotation.mjs
node scripts/session-review.mjs --selftest
node scripts/pii-scan.mjs
npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/causal-rotation-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/horizon-ladder-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
node --test tests/brief-openai-compatible-adapter.functional.mjs
node --test tests/playwright-runtime.foundation.functional.mjs
node --test tests/company-intelligence.unit.mjs
npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
bash .github/bubbles/scripts/cli.sh doctor
bash .github/bubbles/scripts/cli.sh framework-write-guard
bash .github/bubbles/scripts/cli.sh repo-readiness .
bash .github/bubbles/scripts/artifact-lint.sh specs/_ops/OPS-integrate-research-lab-main 'SCN-OPS-[0-9]{3}'
bash .github/bubbles/scripts/artifact-freshness-guard.sh specs/_ops/OPS-integrate-research-lab-main
bash .github/bubbles/scripts/capability-foundation-guard.sh specs/_ops/OPS-integrate-research-lab-main
bash .github/bubbles/scripts/requirement-mechanism-guard.sh specs/_ops/OPS-integrate-research-lab-main
bash .github/bubbles/scripts/scenario-obligation-lint.sh specs/_ops/OPS-integrate-research-lab-main
bash .github/bubbles/scripts/traceability-guard.sh specs/_ops/OPS-integrate-research-lab-main --all-scopes
bash .github/bubbles/scripts/execution-substate-guard.sh specs/_ops/OPS-integrate-research-lab-main
bash .github/bubbles/scripts/yaml-schema-validate.sh
```

The Playwright version must be exactly `Version 1.61.1`.
Do not add a `--workers` override.

### Change Boundary

Allowed candidate changes are conflict resolutions, producer-owned committed outputs, OPS records, and planned OPS tests.
Every candidate change invalidates all earlier validation receipts.

Local `main`, source refs, stashes, and existing worktrees remain unchanged.
Data refresh commands and scheduler wrappers are excluded from candidate validation.

### Test Plan

| ID | Test Type | Category | File / Location | Scenario | Expected test title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-04-01 | integration | integration | Candidate producer receipt | SCN-OPS-010 | `Regression: SCN-OPS-010 registered producers recreate candidate artifacts` | `node scripts/build-pages-site.mjs` | Yes, isolated candidate |
| TP-04-02 | functional | functional | Registered Node test suites | SCN-OPS-010 | `Regression: SCN-OPS-010 one candidate passes every registered Node category` | `node scripts/selftest.mjs` and the four registered `node --test` category commands | No |
| TP-04-03 | e2e-ui | e2e-ui | Registered Playwright suites | SCN-OPS-010 | `Regression: SCN-OPS-010 one candidate passes every affected production route` | The nine exact `npx --no-install playwright test` commands above | Yes, real ephemeral HTTP servers and system Chrome |
| TP-04-04 | functional | functional | OPS and Bubbles validation receipts | SCN-OPS-010 | `Regression: SCN-OPS-010 failed or stale receipt keeps local main unchanged` | The exact product, Git safety, and Bubbles command sets in this scope | Yes, isolated candidate |
| TP-04-05 | functional | functional | `tests/ops-integrate-research-lab-main.functional.mjs` | SCN-OPS-014 | `Regression: SCN-OPS-014 integration preserves lifecycle and acceptance bytes` | `node --test tests/*.functional.mjs` | No |

### Definition of Done - Tiered Validation

#### Core Outcomes

- [ ] Every changed committed artifact identifies and uses its exact producer.
- [ ] Every receipt names one full candidate SHA before and after execution.
- [ ] Candidate identity remains unchanged across the complete receipt set.
- [ ] The candidate worktree is clean after producer-owned output handling.
- [ ] Every conflict record, ref classification, and forbidden-path proof is complete.
- [ ] Lifecycle, certification, and acceptance bytes retain their artifact-owned meaning.
- [ ] Local `main` still equals its frozen identity after validation.

#### Test Evidence Items

- [ ] **DOD-04-TP-04-01:** TP-04-01 proves registered producers recreate all affected committed artifacts.
- [ ] **DOD-04-TP-04-02:** TP-04-02 proves one unchanged candidate passes every registered Node category.
- [ ] **DOD-04-TP-04-03:** TP-04-03 proves affected production routes pass through system Chrome without interception.
- [ ] **DOD-04-TP-04-04:** TP-04-04 proves failed or stale validation cannot update local main and every current receipt names one candidate.
- [ ] **DOD-04-TP-04-05:** TP-04-05 proves candidate validation preserves lifecycle and acceptance meaning without inference.

#### Build Quality Gate

- [ ] Scope 4 passes source lock, exact runner, product, browser, security, artifact, traceability, state, and clean-tree checks.

## Scope 5: Compare-And-Swap Main And Resume Delivery

**Status:** Not Started

This scope remains nonterminal.

**Depends On:** Scope 4

**Scope Kind:** deploy-pointer

**Requirement Refs:** OPS-FR-027 through OPS-FR-035

### Gherkin Scenarios

#### SCN-OPS-011: Exact Candidate Advances Main

```gherkin
Scenario: Local main advances only to the validated candidate
  Given every required receipt names one unchanged candidate SHA
  And the operator enters that full SHA exactly
  When update-ref compares against the frozen local main identity
  Then local main becomes the approved candidate SHA
  And frozen origin main plus every included tip are ancestors
```

#### SCN-OPS-012: Integration Does Not Publish

```gherkin
Scenario: Local integration ends without publication
  Given local main has advanced through the authorized compare-and-swap
  When the integration action closes
  Then no push command or remote-ref mutation appears in the ledger
  And publication remains a separately authorized action
```

#### SCN-OPS-013: Cleanup Remains Separate

```gherkin
Scenario: Represented residue remains addressable
  Given represented branches, refs, stashes, and worktree registrations remain inventoried
  When the integration action closes
  Then no deletion, drop, prune, clean, or removal event exists
  And every residue item remains present for an independently authorized action
```

#### SCN-OPS-015: Delivery Continues From Integrated Main

```gherkin
Scenario: Existing delivery resumes through recorded owners
  Given final local main satisfies candidate validation and ancestry requirements
  When the executor reads each packet state from integrated main
  Then every handoff records the exact state blob, recorded owner, and next obligation
  And no handoff changes packet status, certification, or human acceptance
```

### Implementation Plan

1. Revalidate the inherited packet and compare every frozen source identity.
2. Confirm all validation receipts name the current candidate SHA.
3. Require the operator's exact full-SHA approval challenge to match.
4. Confirm local `main` still equals the frozen expected old SHA.
5. Run `git update-ref refs/heads/main "$approved_candidate_sha" "$frozen_local_main_sha"` once.
6. Do not retry against a changed expected old SHA.
7. Prove local `main` equals the approved candidate.
8. Prove frozen local `main`, frozen `origin/main`, and every included tip are ancestors.
9. Prove every source ref still has its frozen or approved preservation identity.
10. Attempt one reverse CAS only when a post-CAS identity or ancestry invariant fails.
11. Compare remote-tracking refs, stashes, and worktree registrations with the frozen inventory.
12. Confirm the ledger contains no push, deletion, drop, prune, clean, or removal event.
13. Read Feature 030, BUG-022, Company, and Shock state with a structured JSON parser.
14. Route each packet from the integrated main SHA to its recorded owner and next obligation.
15. Append `handoff` events without changing packet-owned lifecycle or acceptance fields.
16. End with every source ref, stash, and worktree registration retained.

### Change Boundary

The only existing canonical ref that may change is `refs/heads/main`.
It may change once through compare-and-swap to the approved candidate.
The packet ledger and owned report evidence may append current events and receipts.

Remote refs, source branches, tags, stashes, files, and worktree registrations are excluded.
No push, branch deletion, ref deletion, stash drop, clean, prune, or worktree removal may run.

### Test Plan

| ID | Test Type | Category | File / Location | Scenario | Expected test title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | integration | integration | `tests/ops-integrate-research-lab-main.integration.mjs` | SCN-OPS-011 | `Regression: SCN-OPS-011 compare-and-swap advances only to the approved SHA` | `node --test tests/*.integration.mjs` | Yes, isolated real Git fixture plus final target proof |
| TP-05-02 | functional | functional | `tests/ops-integrate-research-lab-main.functional.mjs` | SCN-OPS-012 | `Regression: SCN-OPS-012 integration ledger contains no publication action` | `node --test tests/*.functional.mjs` | No |
| TP-05-03 | functional | functional | `tests/ops-integrate-research-lab-main.functional.mjs` | SCN-OPS-013 | `Regression: SCN-OPS-013 retained residue inventory remains unchanged` | `node --test tests/*.functional.mjs` | No |
| TP-05-04 | functional | functional | `tests/ops-integrate-research-lab-main.functional.mjs` | SCN-OPS-015 | `Regression: SCN-OPS-015 handoff uses packet-owned owner and lifecycle state` | `node --test tests/*.functional.mjs` | No |

### Definition of Done - Tiered Validation

#### Core Outcomes

- [ ] Exact-SHA approval names the unchanged candidate from Scope 4.
- [ ] The compare-and-swap uses the frozen local `main` as its expected old value.
- [ ] Local `main` equals the approved candidate after the update.
- [ ] Frozen local `main`, frozen `origin/main`, and every included tip are ancestors.
- [ ] Every source ref retains its frozen or approved preservation identity.
- [ ] Every stash and worktree registration remains present.
- [ ] The ledger contains no push or destructive operation.
- [ ] Each delivery packet resumes through its recorded owner and next obligation.
- [ ] Integration changes no certification or human acceptance meaning.

#### Test Evidence Items

- [ ] **DOD-05-TP-05-01:** TP-05-01 proves exact-SHA compare-and-swap and required ancestry.
- [ ] **DOD-05-TP-05-02:** TP-05-02 proves local integration ends without publication and records no push action.
- [ ] **DOD-05-TP-05-03:** TP-05-03 proves represented residue remains addressable across refs, stashes, and worktree registrations.
- [ ] **DOD-05-TP-05-04:** TP-05-04 proves existing delivery resumes through recorded owners from integrated main.

#### Build Quality Gate

- [ ] Scope 5 passes CAS, ancestry, source-identity, no-push, no-cleanup, packet-truth, and handoff checks.

## Sequential Gate

Scope 1 is the only eligible scope at plan creation.
Each later scope remains blocked by its `Depends On` entry.
Any source-state drift returns execution to Scope 1 and creates a new inventory generation.
No scope status changes without its own current evidence.
<!-- End of planner scopes. -->