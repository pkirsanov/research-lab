# Scopes: BUG-002 Feature 012 Test-Infra Moving-HEAD Baseline-Authority Drift

Planning inputs: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md).

Related records: [report.md](report.md) | [uservalidation.md](uservalidation.md).

> **Planning state:** Active reconciliation for `F-BUG002-008` only under the
> routed `company-close-feature-028` scenario node. The manifest-backed legacy
> authority and all existing behavioral assertions remain unchanged. This plan
> replaces only the concurrency-unsafe whole-worktree oracle with a closed
> Scope 03 governed-path oracle. It does not authorize product, publication,
> human-acceptance, Feature 017, Feature 019, or Feature 028 changes. No delivery
> or certification status changes in this plan.

## Execution Outline

### Phase Order

1. **Scope 2: Close the Scope 03 rollback oracle over eleven governed paths.**
   Keep the fixture authority and every legacy, parity, restored-current, and
   exact-command assertion active.
2. `bubbles.design` records the eleven-path governed inventory, eight-path
   mutation boundary, and three-control oracle in `design.md` without changing
   the legacy-authority or behavior design.
3. `bubbles.test` adds the `F-BUG002-008` regression control and records its RED
   result while the whole-worktree oracle remains active.
4. `bubbles.test` replaces both root inventory call sites with the closed
   governed-path comparison and routes rollback writes through the eight-path
   mutation boundary.
5. `bubbles.test` proves that a governed-path byte mutation fails and an
   out-of-boundary rollback write is rejected. An unrelated sandbox file change
   must not affect either exact test.
6. `bubbles.test` reruns both unchanged exact titles, the full functional file,
   the browser regression, quality checks, and the broad selftest.

### New Types And Signatures

- Fixture contract: `feature-012-scope03-legacy-authority/v1`.
- Fixture root: `tests/fixtures/feature-012/contextual-tooltip-pre-scope03/`.
- `baselineBytes(relativePath) -> Buffer` reads only the committed fixture.
- The fixture manifest records each allowed path, byte length, SHA-256, semantic
  role, and source commit provenance.
- `LEGACY_AUTHORITY_PATHS` remains a closed seven-path inventory.
- `SCOPE03_GOVERNED_PATHS` is the exact eleven-path inventory in
   [Closed Governed-Path Inventory](#closed-governed-path-inventory).
- `SCOPE03_ROLLBACK_MUTATION_PATHS` is the exact eight-path production subset.
- `governedSnapshot(root) -> Map<relativePath, {bytes, hash}>` reads only the
   eleven governed paths in canonical order.
- `assertGovernedInventoryEqual(actual, expected, label) -> void` reports the
   first missing or changed governed path and never enumerates the worktree.
- `recordScope03Mutation(relativePath, operation) -> void` rejects any rollback
   write or delete outside the eight-path mutation subset before mutation.

### Validation Checkpoints

1. Add the exact `F-BUG002-008` regression title and record RED while an
   unrelated sandbox mutation still reaches the whole-worktree comparison.
2. Assert that the governed inventory contains exactly the eleven canonical
   paths and that the mutation inventory contains exactly its eight production
   paths.
3. Change one byte in sandbox `rlcontext.js`. Require a path-specific governed
   hash failure, then restore the byte from the sandbox snapshot.
4. Attempt a rollback write to `concurrency-control/unrelated-report.md`.
   Require rejection before the file is written.
5. Change `concurrency-control/unrelated-report.md` outside the mutation helper.
   Require the eleven-path comparison to remain equal.
6. Rerun both exact `SCN-012-003` titles, the unchanged current-route browser
   suite, the full functional file, and the repository selftest.

### Ordering Rationale

The committed fixture now provides the seven-file legacy authority and both exact
tests reach their behavioral assertions. The remaining defect is the protection
oracle around those assertions. Each exact test currently enumerates every
regular worktree file and compares those hashes across a multi-second run. A
concurrent write to any unrelated file can therefore fail the test even though
the Scope 03 rollback remained isolated.

The replacement keeps the protection claim strong by governing every Scope 03
implementation path and by mediating every rollback write or delete. It stops
claiming that a Scope 03 test owns unrelated repository bytes. One negative
control changes a governed byte and must fail. A second attempts an unauthorized
rollback write and must fail before mutation. A third changes an unrelated file
and must not affect the governed comparison.

The owning Scope 03 plan lists all three canary pages as converted shared-engine
surfaces. Its browser regression requires the current contextual disclosure.
The existing functional test already checks both directions. Legacy fixture pages
must omit decorators. Restored current pages must contain them.

The prior registry proposal remains historical packet context. This scenario-node
route authorizes only `T028-S05-XF012-001` and makes no registry status claim.

### Design Ownership Disposition

The existing design remains authoritative for the manifest-backed fixture,
fail-loud fixture guards, unchanged behavioral assertions, and product-byte
boundary. It does not yet define the `F-BUG002-008` concurrency oracle. Because
`design.md` is owned by `bubbles.design`, this planning run does not edit it.
The next owner must add only the eleven-path governed inventory, eight-path
mutation boundary, and three controls defined below. Test implementation remains
blocked until that owner records the matching design contract.

## Active Scope Inventory

| # | Name | Surfaces | Tests | DoD summary | Status |
| --- | --- | --- | --- | --- | --- |
| 2 | Fixture-backed authority and scoped rollback isolation | One functional test; fixture bundle read-only | Functional, e2e-ui, quality, broad regression | Eleven governed paths, eight mutation paths, live controls, unchanged behavior | In Progress |

## Superseded Scopes (Do Not Execute In This Route)

The section below preserves the original registry proposal. This invocation does
not change, execute, or certify it.

| Historical scope | Preserved authority | This route |
| --- | --- | --- |
| SCOPE-01 registry rollback baseline | `bug.md`, `design.md`, `report.md`, and `state.json` | No edit, execution, or certification claim |

## Scope 2: Complete fixture-backed Scope 03 rollback with a scoped isolation oracle

**Status:** In Progress.
**Scope-Kind:** runtime-behavior.
**Class:** test-infrastructure-repair.
**Depends On:** Feature 012 Scope 03 delivery contract.
**Parent Route:** `T028-S05-XF012-001`.
**Active Finding:** `F-BUG002-008`.
**Consumer Surface:** current Power contextual-disclosure user interface on the
`market-heatmap-lab.html` web page. The existing browser regression verifies it.

### Target

`tests/contextual-tooltip.functional.mjs` contains two `SCN-012-003` rollback
tests. The fixture-backed authority is already present and both exact titles
have current serial pass evidence. Each test still calls `listRegularFiles(ROOT)`
and hashes every returned path before and after the rollback rehearsal. The
current measured inventory is 18,783 files. Only eleven are Scope 03 paths.
The other 18,772 files are outside the behavior under test and may be changed by
an unrelated concurrent writer.

This plan replaces those root inventories only. The seven fixture bytes, source
provenance `b533b972a473ffca9252362ecc5d73de52423da9`, fixture guards, two exact
titles, command matrix, and every behavioral assertion remain authoritative.

### Owner Decision Record

- The modern pages must carry `rlexperience.js` and `rlcontext.js`.
- The legacy fixture pages must contain neither decorator reference.
- Keep the existing negative legacy assertion.
- Keep the existing positive assertion after current bytes are restored.
- Do not invert, delete, skip, or soften either assertion.

### Gherkin Scenarios (Regression)

```gherkin
Feature: Scope 03 rollback uses a history-independent legacy authority

   @SCN-BUG002-001
   Scenario: SCN-BUG002-001 Reconciled Git history cannot invalidate the legacy rehearsal
      Given a committed fixture contains the seven exact pre-Scope-03 authority files
      And its manifest records each file's SHA-256 and semantic role
      When both SCN-012-003 rollback tests reconstruct their legacy sandbox
      Then each baseline file comes only from the committed fixture
      And no Git branch or commit lookup occurs at runtime
      And both tests reach their existing legacy and exact-restore assertions

   @SCN-BUG002-002
   Scenario: SCN-BUG002-002 Baseline drift fails without weakening current behavior
      Given the legacy fixture pages contain no Scope 03 decorator marker
      And the current canary pages contain the shared decorator wiring
      When a fixture file is missing, changed, or contaminated with modern wiring
      Then the baseline resolver fails with a path-specific guard error
      And the legacy negative decorator assertion remains active
      And the restored-current positive decorator assertion remains active

   @SCN-BUG002-003
   Scenario: SCN-BUG002-003 Rollback isolation ignores unrelated concurrent files
      Given the rollback oracle governs exactly the eleven Scope 03 paths
      And rollback writes and deletes are limited to the eight production paths
      When a governed path changes during the isolated rehearsal
      Then the oracle fails with the changed path named
      When an unrelated sandbox file changes during the same rehearsal
      Then the governed comparison remains equal
      And an attempted rollback write outside the mutation boundary fails before mutation
```

### Scenario Obligation Matrix

| Scenario | Behavior traits | Obligations | Implementation refs |
| --- | --- | --- | --- |
| SCN-BUG002-001 | pure-calculation, static-metadata, degraded-state | Persistent regression over fixture-derived bytes, exact path inventory, named missing-path refusal, and RED then GREEN proof | `tests/contextual-tooltip.functional.mjs#baselineBytes`, `tests/fixtures/feature-012/contextual-tooltip-pre-scope03/` |
| SCN-BUG002-002 | user-visible-ui, shared-consumer, degraded-state | Current-route visible contextual disclosure, provider and page parity, fail-loud fixture mutation controls, and unchanged legacy/current assertions | `tests/contextual-tooltip.functional.mjs`, `tests/contextual-tooltip.spec.mjs`, `rlcontext.js`, `market-heatmap-lab.html`, `options-structure-lab.html`, `company-fundamentals-lab.html` |
| SCN-BUG002-003 | pure-calculation, static-metadata, degraded-state | Canonical eleven-path inventory, path-specific governed mutation detection, pre-write rejection outside the eight-path mutation boundary, unrelated-file tolerance, and RED then GREEN proof | `tests/contextual-tooltip.functional.mjs#SCOPE03_GOVERNED_PATHS`, `tests/contextual-tooltip.functional.mjs#recordScope03Mutation` |

### Closed Governed-Path Inventory

`SCOPE03_GOVERNED_PATHS` must contain these paths in this canonical order. It
must reject duplicates, missing files, directories, and any runtime expansion
from worktree discovery.

| # | Governed path | Rollback mutation authority | Role |
| --- | --- | --- | --- |
| 1 | `rlcontext.js` | write, delete, restore | Scope 03 shared disclosure controller |
| 2 | `rlg.js` | write, restore | glossary provider integration |
| 3 | `rlticker.js` | write, restore | ticker provider integration |
| 4 | `rlchart.js` | write, restore | chart provider integration |
| 5 | `market-heatmap-lab.html` | write, restore | representative DOM and chart canary |
| 6 | `options-structure-lab.html` | write, restore | representative options canary |
| 7 | `company-fundamentals-lab.html` | write, restore | representative source-qualified canary |
| 8 | `scripts/selftest.mjs` | write, restore | Scope 03 registered broad canaries |
| 9 | `tests/contextual-tooltip.unit.mjs` | none; compare only | Scope 03 unit contract |
| 10 | `tests/contextual-tooltip.functional.mjs` | none; compare only | rollback and provider functional contract |
| 11 | `tests/contextual-tooltip.spec.mjs` | none; compare only | current-route browser contract |

`SCOPE03_ROLLBACK_MUTATION_PATHS` must be derived from rows 1 through 8. The
rollback harness must not maintain a second independent path list. The three
test paths remain governed. A concurrent edit to the active Scope 03 contract
invalidates the run, but the rollback harness may not write them.

The seven fixture-authority paths remain `rlg.js`, `rlticker.js`, `rlchart.js`,
`market-heatmap-lab.html`, `options-structure-lab.html`,
`company-fundamentals-lab.html`, and `scripts/selftest.mjs`. Their existing
manifest, byte-length, SHA-256, semantic-role, and decorator-marker checks are
independent of the eleven-path current-state oracle.

### Mutation And Concurrency Controls

1. **Closed inventory control:** assert the governed keys equal the eleven rows
   above in canonical order and the mutation keys equal rows 1 through 8.
2. **Governed mutation control:** in the disposable sandbox, flip one byte in
   `rlcontext.js` after the expected snapshot. The comparison must fail and name
   `rlcontext.js`. Restore from the sandbox snapshot before continuing.
3. **Mutation-boundary control:** ask the rollback mutation helper to write
   `concurrency-control/unrelated-report.md`. It must reject the path before the
   write, and the file must remain absent.
4. **Unrelated concurrency control:** change
   `concurrency-control/unrelated-report.md` directly in the disposable sandbox
   between governed snapshots. The eleven governed hashes must remain equal.
5. **Actual write-set control:** record every rollback write and delete. The
   unique write set must be a subset of the eight mutation paths and must equal
   the paths required by that rehearsal. No test path or unrelated path may
   appear.
6. **Real-worktree control:** compare only the eleven governed worktree paths
   before and after each exact test. A concurrent change to one of those paths
   invalidates the run. A change elsewhere does not participate in the oracle.

### Implementation Plan

1. Add the planned `F-BUG002-008` regression title without changing either
   exact `SCN-012-003` title. Run it before the oracle repair and record RED.
2. Replace `SCOPE03_CURRENT_PATHS` with the canonical
   `SCOPE03_GOVERNED_PATHS`. Derive the eight-path mutation subset from the
   existing production-path inventory.
3. Replace both `listRegularFiles(ROOT)` root call sites, all four root
   whole-worktree hash comparisons, and the derived `protectedPaths` maps with
   governed snapshots and explicit mutation-ledger checks.
4. Route `applyLegacyBaseline()`, `prepareLegacyReplayDependencies()`, and
   current-byte restoration through the mutation-boundary helper. Preserve the
   exact bytes each helper writes and the existing sandbox-only hydration rule.
5. Add the six controls above in the disposable sandbox. Do not mutate the
   routed worktree to exercise them.
6. Keep every fixture guard, legacy provider assertion, canary assertion,
   owner-value fingerprint, exact restore assertion, RED discriminator, GREEN
   count, cleanup assertion, and exact command unchanged.
7. Replace only obsolete diagnostics that report whole-worktree or protected
   file counts with `governedFiles=11`, `rollbackMutationFiles=8`,
   `governedMutationDetected=true`, `unauthorizedMutationRejected=true`, and
   `unrelatedConcurrentControlIgnored=true`.
8. Run the Test Plan in order. A failure routes back to the test owner without
   editing product, publication, planning-external, or acceptance files.

### Change Boundary

#### Allowed Implementation Files

- `tests/contextual-tooltip.functional.mjs`.

#### Read-Only Validation Files

- `tests/fixtures/feature-012/contextual-tooltip-pre-scope03/**`.
- `tests/contextual-tooltip.spec.mjs`.
- `scripts/selftest.mjs`.

#### Excluded Files And Families

- `tests/tool-experience-shell.functional.mjs`.
- `tests/tool-experience-registry.functional.mjs`.
- `tests/contextual-tooltip.unit.mjs`.
- `tests/contextual-tooltip.spec.mjs`.
- `tests/fixtures/feature-012/contextual-tooltip-pre-scope03/**`.
- Every production `*.html` and `rl*.js` file.
- `tools.json`, `scripts/**`, and all source-qualified data.
- `data/company-intelligence/**` and every `company:msft` publication artifact.
- Feature 028, Feature 017, and Feature 019 artifacts.
- Every `uservalidation.md` and human-acceptance record.

Immutable publication history, version files, and current pointers must remain
byte-identical. The repair may neither rebuild nor rewrite publication data.

### Test Plan

| Test Type | ID | Scenario | Category | File or location | Exact behavior or title | Command | Live system |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RED evidence | TP-BUG002-RED-01 | SCN-BUG002-001 | functional | `tests/contextual-tooltip.functional.mjs` | Both current rollback tests fail at the invalid `767732db:rlg.js` lookup before implementation | `node --test tests/contextual-tooltip.functional.mjs` | No |
| RED evidence | TP-BUG002-RED-02 | SCN-BUG002-003 | functional | `tests/contextual-tooltip.functional.mjs` | `Regression: F-BUG002-008 scoped rollback oracle catches governed mutation and ignores unrelated concurrent files` fails while the unrelated-file control still reaches the whole-worktree oracle | `node --test --test-name-pattern='^Regression: F-BUG002-008 scoped rollback oracle catches governed mutation and ignores unrelated concurrent files$' tests/contextual-tooltip.functional.mjs` | No |
| Regression | TP-BUG002-F01 | SCN-BUG002-001, SCN-BUG002-002, SCN-BUG002-003 | functional | `tests/contextual-tooltip.functional.mjs` | `SCN-012-003 isolated rollback restores legacy providers and exact current Scope 03 bytes` compares exactly eleven governed paths and preserves every existing behavior assertion | `node --test --test-name-pattern='^SCN-012-003 isolated rollback restores legacy providers and exact current Scope 03 bytes$' tests/contextual-tooltip.functional.mjs` | No |
| Regression | TP-BUG002-F02 | SCN-BUG002-001, SCN-BUG002-002, SCN-BUG002-003 | functional | `tests/contextual-tooltip.functional.mjs` | `SCN-012-003 exact TP-03-01 through TP-03-05 commands replay RED then GREEN in isolated rollback baseline` compares exactly eleven governed paths and preserves all five exact command assertions | `node --test --test-name-pattern='^SCN-012-003 exact TP-03-01 through TP-03-05 commands replay RED then GREEN in isolated rollback baseline$' tests/contextual-tooltip.functional.mjs` | No |
| Functional regression | TP-BUG002-F03 | SCN-BUG002-001, SCN-BUG002-002, SCN-BUG002-003 | functional | `tests/contextual-tooltip.functional.mjs` | Every provider, rollback, fixture-integrity, exact-replay, path-boundary, and concurrency assertion passes with zero skips | `node --test tests/contextual-tooltip.functional.mjs` | No |
| Concurrency regression | TP-BUG002-F04 | SCN-BUG002-003 | functional | `tests/contextual-tooltip.functional.mjs` | `Regression: F-BUG002-008 scoped rollback oracle catches governed mutation and ignores unrelated concurrent files` | `node --test --test-name-pattern='^Regression: F-BUG002-008 scoped rollback oracle catches governed mutation and ignores unrelated concurrent files$' tests/contextual-tooltip.functional.mjs` | No |
| Regression E2E | TP-BUG002-E01 | SCN-BUG002-002 | e2e-ui | `tests/contextual-tooltip.spec.mjs` | Current Power context remains equivalent by pointer, keyboard, touch, and table on the production route | `npx --no-install playwright test tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Regression quality | TP-BUG002-Q01 | SCN-BUG002-001, SCN-BUG002-002, SCN-BUG002-003 | functional | `tests/contextual-tooltip.functional.mjs` | Reject skipped, optional, early-return, non-adversarial, or root-wide concurrency-sensitive bugfix coverage | `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/contextual-tooltip.functional.mjs` | No |
| Broad regression | TP-BUG002-C01 | SCN-BUG002-001, SCN-BUG002-002, SCN-BUG002-003 | unit | `scripts/selftest.mjs` | Preserve all current Research Lab source, registry, context, model, publication, and tool invariants | `node scripts/selftest.mjs` | No |

### Definition of Done - Tiered Validation

#### Core Items

- [x] SCN-BUG002-001 uses exactly seven manifest-listed pre-Scope-03 files and
    records provenance from `b533b972a473ffca9252362ecc5d73de52423da9`. -> Evidence: [F03 complete functional result](report.md#tp-bug002-f03-revision-6-final)
- [x] SCN-BUG002-001 makes `baselineBytes()` read no Git ref and fail on unknown, missing, changed,
    or modern-contaminated fixture bytes without a default or fallback. -> Evidence: [F03 fixture controls](report.md#tp-bug002-f03-revision-6-final)
- [x] SCN-BUG002-002 keeps every legacy, owner-parity, protected-path,
   restored-current, and exact-replay assertion present and equally strict. -> Evidence: [F03 complete functional result](report.md#tp-bug002-f03-revision-6-final)
- [x] SCN-BUG002-002 isolated mutation controls prove both SHA-256 and decorator-marker
    guards fail before the behavioral assertions can pass vacuously. -> Evidence: [F03 fixture controls](report.md#tp-bug002-f03-revision-6-final)
- [x] SCN-BUG002-003 makes both exact rollback tests compare only the canonical
   eleven governed paths. No root worktree enumeration or root-wide hash
   comparison remains in either test. -> Evidence: [F04 scoped-oracle result](report.md#tp-bug002-f04-revision-6-final)
- [x] SCN-BUG002-003 routes every rollback write and delete through the exact
   eight-path mutation boundary and records a path-complete mutation ledger. -> Evidence: [F04 scoped-oracle result](report.md#tp-bug002-f04-revision-6-final)
- [x] SCN-BUG002-003 proves a governed `rlcontext.js` byte mutation fails by
   name. It also proves an unauthorized rollback write fails before mutation and
   a changed `concurrency-control/unrelated-report.md` does not affect the oracle. -> Evidence: [F04 scoped-oracle result](report.md#tp-bug002-f04-revision-6-final)
- [x] The change boundary contains every changed path. All excluded product,
   `company:msft`, immutable publication, Feature 017, Feature 019, Feature 028,
   and human-acceptance paths remain unchanged by this repair. -> Evidence: [stable governed epoch](report.md#bug002-revision-6-governed-epoch)

#### Test Evidence Items - Exact Parity With 9 Test Plan Rows

- [x] TP-BUG002-RED-01 records the unchanged two-failure RED before the first
   implementation edit. -> Evidence: [RED-01 pre-fix receipt](report.md#tp-bug002-red-01-revision-6-closure)
- [x] TP-BUG002-RED-02 records the `F-BUG002-008` control failing against the
  current whole-worktree oracle before the scoped-oracle edit. -> Evidence: [RED-02 pre-fix receipt](report.md#tp-bug002-red-02-revision-6-closure)
- [x] TP-BUG002-F01 is rerun after the oracle repair and passes the unchanged
  exact isolated rollback title with eleven governed paths. The earlier serial
  pass remains at [revision-5 F01 independent rerun](report.md#tp-bug002-f01-independent-rerun),
  but it predates this repair. -> Evidence: [revision-6 F01](report.md#tp-bug002-f01-revision-6-final)
- [x] TP-BUG002-F02 is rerun after the oracle repair and passes the unchanged
  exact five-command RED then GREEN replay title with eleven governed paths.
  The earlier serial pass remains at [revision-5 F02 independent rerun](report.md#tp-bug002-f02-independent-rerun),
  but it predates this repair. -> Evidence: [revision-6 F02](report.md#tp-bug002-f02-revision-6-final)
- [x] TP-BUG002-F03 passes the complete contextual-tooltip functional file with
   zero skips. -> Evidence: [revision-6 F03](report.md#tp-bug002-f03-revision-6-final)
- [x] TP-BUG002-F04 passes all closed-inventory, governed-mutation,
  unauthorized-write, unrelated-concurrency, and actual-write-set controls. -> Evidence: [revision-6 F04](report.md#tp-bug002-f04-revision-6-final)
- [x] TP-BUG002-E01 passes the unchanged production-route contextual-tooltip
   browser suite. -> Evidence: [revision-6 E01](report.md#tp-bug002-e01-revision-6-final)
- [x] TP-BUG002-Q01 accepts the bugfix regression without bailout, weakening, or
   optional assertions. -> Evidence: [revision-6 Q01](report.md#tp-bug002-q01-revision-6-final)
- [x] TP-BUG002-C01 passes the complete build-free repository selftest. -> Evidence: [revision-6 C01](report.md#tp-bug002-c01-revision-6-final)

#### Build Quality Gate

- [x] Fixture manifest validation, test-plan parity, scenario-obligation lint,
   artifact lint, changed-path containment, editor diagnostics, and the truthful
   non-terminal transition report are current and clean. No status, certification,
   human acceptance, product byte, or publication pointer changes in this scope.
   -> Evidence: [revision-7 Build Quality reconciliation](report.md#scope-02-revision-7-build-quality-reconciliation)

---

## Non-scope (recorded for closure)

| Surface | Current classification | This route |
| --- | --- | --- |
| `tests/tool-experience-shell.functional.mjs` (`SCN-012-031`) | Existing reference shape | Preserve byte-for-byte |
| `tests/brief-refresh-atomicity.support.mjs` | Environment-gated current-wrapper read | No change |
