# Design: BUG-002 Feature 012 Test-Infra Moving-HEAD Baseline-Authority Drift

Links: [bug.md](bug.md) | [spec.md](spec.md) | [scopes.md](scopes.md) | [report.md](report.md)

> **Ownership note (G042):** `bubbles.bug` authored the original discovery and
> root-cause record. `bubbles.design` now adopts the plan-owned F-BUG002-008
> contract. `bubbles.test` owns the remaining test implementation and evidence.

## Design Brief

### Current State

`tests/contextual-tooltip.functional.mjs` already reads seven legacy files from
the committed `feature-012-scope03-legacy-authority/v1` fixture. The manifest
guards exact bytes, SHA-256 values, semantic roles, and decorator absence.

Both exact `SCN-012-003` tests still enumerate the whole repository worktree.
They hash unrelated paths before and after each isolated rollback rehearsal.

### Target State

Both exact tests will compare exactly eleven Scope 03 governed paths. Every
rollback write or delete will pass through an eight-path mutation boundary.

The oracle will fail on a governed byte change or unauthorized rollback write.
It will ignore a concurrent change outside the eleven governed paths.

### Patterns to Follow

- Keep the closed fixture manifest in
  `tests/fixtures/feature-012/contextual-tooltip-pre-scope03/` as the legacy authority.
- Keep `LEGACY_AUTHORITY_PATHS` and every existing fixture guard unchanged.
- Use canonical frozen path inventories like the existing Scope 03 constants.
- Use path-specific assertion failures like the existing fixture failure controls.
- Keep all destructive test activity inside the disposable replay sandbox.

### Patterns to Avoid

- Do not use `listRegularFiles(ROOT)` as an isolation oracle. It observes bytes
  that Scope 03 does not own.
- Do not add exclusions for whichever unrelated file raced most recently. That
  converts a closed contract into an unbounded denylist.
- Do not retry a failed whole-worktree comparison. A retry can hide a governed
  mutation and cannot establish isolation.
- Do not weaken the legacy-negative or restored-current-positive decorator checks.

### Resolved Decisions

- Govern exactly eleven canonical Scope 03 paths.
- Derive the eight rollback mutation paths from the governed inventory.
- Keep the three test paths read-only during rollback.
- Reject unauthorized rollback writes before invoking the write operation.
- Name the first missing or changed governed path in every comparison failure.
- Ignore unrelated sandbox changes without weakening governed-path checks.
- Preserve both exact `SCN-012-003` titles and all current behavior assertions.
- Add the exact planned F-BUG002-008 RED-02 regression before replacing the oracle.

### Open Questions

None. The parent Scope 03 plan resolved the decorator intent and path inventory.

## Root-Cause Analysis

### Current residual defect

The legacy authority no longer reads Git history. The remaining
F-BUG002-008 defect is the whole-worktree isolation oracle in both exact tests.
Each test calls `listRegularFiles(ROOT)` and hashes paths outside Scope 03.

The rollback writes also bypass one closed mutation boundary. The current
helpers write or delete sandbox paths directly. No single pre-write check proves
that the rollback touched only its eight authorized production paths.

### Original anti-pattern

Several Feature 012 functional tests reconstruct a **pre-scope "legacy" state**
of shared files. This state predates the changes made by a given Feature 012
scope. The tests obtain those "legacy" bytes with:

```js
function baselineBytes(relativePath) {
  return execFileSync('git', ['show', `HEAD:${relativePath}`], { cwd: ROOT });
}
```

`HEAD` is the **wrong authority** for a *legacy* baseline. `HEAD` moves whenever
the repository advances. Once a Feature 012 scope is committed,
`git show HEAD:<file>` returns the **modern** bytes. The "legacy baseline"
therefore becomes identical to the modern content.

- Assertions that expect the legacy state to differ from modern then break.
  Examples include decorator absence and a registry without experience objects.
- assertions that only compare the sandbox to `baselineBytes` can pass **vacuously**
  (both sides are modern), silently destroying the adversarial value of the test.

This is not a flaky failure — it is a **guaranteed rot on every Feature 012 commit
to `HEAD`**. The `HEAD` pointer moved five times in the current session alone.

### Preserved historical evidence (see [report.md](report.md))

- `market-heatmap-lab.html` decorator refs: **0** at the immutable pre-Scope-02
  anchor `767732db` → **2** at `HEAD` (`rlexperience.js`, `rlcontext.js`),
  introduced at `c81d808d`.
- `tests/contextual-tooltip.functional.mjs` `SCN-012-003` is RED (`8/9`, `not ok 8`)
  precisely on `assert.doesNotMatch(source, /src="rlcontext\.js|src="rlexperience\.js/)`
  at `verifyLegacyCanaryPages` (`:265`), because the "legacy" heatmap page it
  reconstructs from `HEAD` now carries the decorators.
- `tests/tool-experience-registry.functional.mjs` `SCN-012-033` is RED (`4/7`,
  `3` failures) on `experience is the only tools.json addition` (baseline = `HEAD:tools.json`,
  which now HAS experience) and `rolled-back registry must be semantically equal to HEAD`.
- `tests/tool-experience-shell.functional.mjs` `SCN-012-031` is GREEN (`3/3`) — it was
  already repinned off `HEAD`.

## The reference remediation (already shipped for `SCN-012-031`)

`tests/tool-experience-shell.functional.mjs` demonstrates the durable shape.
It pins an immutable pre-scope commit instead of `HEAD`. It also guards that
commit with fail-loud checks. The reference implementation appears below.

```js
const LEGACY_BASELINE_COMMIT = '767732db04e0cd32bf107b2a95030a6771bd16f2';
const MODERN_SHELL_MARKER = 'data-rlexperience-shell';
const LEGACY_BASELINE_SHA256 = Object.freeze({
  'rlviews.js': '9695b8ca…',
  'rlapp.js':  'b481a732…'
});

function baselineBytes(relativePath) {
  const bytes = execFileSync('git', ['show', `${LEGACY_BASELINE_COMMIT}:${relativePath}`], { cwd: REPOSITORY_ROOT });
  assert.equal(bytes.includes(MODERN_SHELL_MARKER), false, `legacy baseline ${relativePath} must not contain the modern marker`);
  const expected = LEGACY_BASELINE_SHA256[relativePath];
  if (expected) assert.equal(sha256(bytes), expected, `legacy baseline ${relativePath} sha256 drifted`);
  return bytes;
}
```

Two properties make this correct. First, an immutable commit makes the source
**HEAD-independent**. Second, the marker and exact SHA-256 checks guard the pin.
A post-scope pin therefore fails loudly instead of reading modern bytes. This
preserves adversarial strength.

## Established Legacy-Authority Design

### Principle 1 — Replace every moving-`HEAD` baseline with a stable authority

Replace each `git show HEAD:<path>` drift site with a **HEAD-independent**
authority. Guard that authority with fail-loud checks.

- **Preferred: a captured, committed fixture.** Store the byte-exact legacy bytes as
  a committed fixture (e.g. under the bug/test fixtures tree), recorded with its
  sha256. A fixture is immune to rebase, history rewrite, and pinned-commit
  orphaning. It is therefore the most durable option.
- **Acceptable: an immutable pinned pre-feature commit anchor** (as `SCN-012-031`
  uses `767732db`), when a fixture is disproportionate. Still guarded by sha256 +
  a semantic marker.

Both MUST carry the fail-loud sha256 + semantic-marker guards (FR-B002-02). No
assertion is weakened (FR-B002-03).

This principle applies to **`tests/tool-experience-registry.functional.mjs`**
for `SCN-012-033`. Its historical remediation was a pure baseline repin.
`baselineRegistry()` and both `git show HEAD:` reads required the true
pre-experience authority.

### Principle 2 — Preserve the resolved two-direction decorator contract

The parent Scope 03 plan resolved the prior owner gate. Legacy fixture pages
must omit `rlexperience.js` and `rlcontext.js`. Restored current pages must
contain both shared decorators.

Keep the existing negative legacy assertion and positive restored-current
assertion. Do not invert, delete, skip, or soften either direction.

### Principle 3 — Preserve the reference fix and product bytes

- `tests/tool-experience-shell.functional.mjs` (`SCN-012-031`) stays byte-for-byte
  (already correct and GREEN).
- No product / page source (`*.html`, `rl*.js`, `tools.json`, `scripts/**`) is
  modified. This is a test-infrastructure defect only.

## F-BUG002-008 Scoped Rollback Isolation Contract

### Contract Goal

The isolation oracle protects every path that defines or validates the Scope 03
rollback. It does not claim ownership over unrelated repository bytes.

The replacement must remove both `listRegularFiles(ROOT)` oracle call sites.
No runtime worktree discovery result may determine the governed inventory.

### Closed Governed-Path Inventory

`SCOPE03_GOVERNED_PATHS` contains these paths in this canonical order:

| # | Path | Rollback authority | Role |
| --- | --- | --- | --- |
| 1 | `rlcontext.js` | write, delete, restore | Shared disclosure controller |
| 2 | `rlg.js` | write, restore | Glossary provider integration |
| 3 | `rlticker.js` | write, restore | Ticker provider integration |
| 4 | `rlchart.js` | write, restore | Chart provider integration |
| 5 | `market-heatmap-lab.html` | write, restore | DOM and chart canary |
| 6 | `options-structure-lab.html` | write, restore | Options canary |
| 7 | `company-fundamentals-lab.html` | write, restore | Source-qualified canary |
| 8 | `scripts/selftest.mjs` | write, restore | Registered broad canaries |
| 9 | `tests/contextual-tooltip.unit.mjs` | compare only | Unit contract |
| 10 | `tests/contextual-tooltip.functional.mjs` | compare only | Functional and rollback contract |
| 11 | `tests/contextual-tooltip.spec.mjs` | compare only | Current-route browser contract |

The inventory rejects duplicate paths, missing files, directories, and runtime
expansion. `SCOPE03_ROLLBACK_MUTATION_PATHS` derives from rows 1 through 8.
The implementation must not maintain a second independent mutation list.

The seven fixture-authority paths remain independent of this current-state
oracle. Their existing manifest and semantic guards remain unchanged.

### Required Helpers

- `governedSnapshot(root) -> Map<relativePath, {bytes, hash}>` reads exactly the
  eleven governed files in canonical order.
- `assertGovernedInventoryEqual(actual, expected, label) -> void` compares the
  closed key order, bytes, and hashes. It names the first missing or changed path.
- `recordScope03Mutation(relativePath, operation) -> void` normalizes and checks
  the path before invoking a write or delete operation. It records each allowed
  operation in the rehearsal mutation ledger.

`applyLegacyBaseline()`, `prepareLegacyReplayDependencies()`, and current-byte
restoration must route every rollback write and delete through
`recordScope03Mutation()`. The three governed test paths remain compare-only.

Each exact test snapshots the eleven real-worktree paths before execution. It
compares the same eleven paths after execution. No unrelated path participates.

### Failure And Concurrency Controls

1. Assert that the governed keys equal the canonical eleven paths. Assert that
  mutation keys equal rows 1 through 8.
2. Flip one byte in sandbox `rlcontext.js` after the expected snapshot. The
  governed comparison must fail and name `rlcontext.js`.
3. Ask the mutation helper to write
  `concurrency-control/unrelated-report.md`. It must reject the path before the
  operation runs, and the file must remain absent.
4. Change `concurrency-control/unrelated-report.md` directly in the disposable
  sandbox. The governed comparison must remain equal.
5. Record every rollback write and delete. The unique write set must be a subset
  of the eight mutation paths and equal the paths required by that rehearsal.
6. Restore any control mutation from its sandbox snapshot before the next
  assertion. Always remove the temporary replay root in `finally`.

The direct unrelated-file change simulates a concurrent external writer. It is
not a rollback operation and must not enter the rollback mutation ledger.

### Planned RED-02 Regression

Add this exact title before replacing the whole-worktree oracle:

`Regression: F-BUG002-008 scoped rollback oracle catches governed mutation and ignores unrelated concurrent files`

Run only that title with the exact command in `scopes.md`. Its planned RED
discriminator is the unrelated sandbox file reaching the old whole-worktree
comparison. Syntax, discovery, dependency, browser, timeout, or missing-file
failures do not satisfy RED-02.

After recording RED, implement the helpers above. The same exact title must then
prove governed-byte failure, pre-write rejection, unrelated-file tolerance, and
the exact rollback write set. This design records no RED execution claim.

### Existing Exact Tests

Keep these titles unchanged:

- `SCN-012-003 isolated rollback restores legacy providers and exact current Scope 03 bytes`
- `SCN-012-003 exact TP-03-01 through TP-03-05 commands replay RED then GREEN in isolated rollback baseline`

Both tests must use the eleven-path oracle. They retain every fixture,
provider, canary, owner-value, RED discriminator, GREEN count, restoration, and
cleanup assertion.

### Diagnostics

Replace whole-worktree count diagnostics with these exact scoped signals:

- `governedFiles=11`
- `rollbackMutationFiles=8`
- `governedMutationDetected=true`
- `unauthorizedMutationRejected=true`
- `unrelatedConcurrentControlIgnored=true`

Do not print a success signal until its matching assertion has executed.

## Data, API, Security, Configuration, And Observability

This repair changes no persisted data, schema, API, page, or user-facing flow.
It adds no configuration, dependency, migration, credential, or network access.

The only mutable state is the disposable replay sandbox. The existing `finally`
cleanup remains mandatory. No production observability contract applies.

### Single-Implementation Justification

This is one test-harness repair inside the existing Scope 03 contextual-tooltip
foundation. No second provider, adapter, screen contract, or runtime capability
is introduced. A new capability abstraction would be premature.

### Explicitly out of scope / cleared

- `tests/brief-refresh-atomicity.support.mjs` — NOT the anti-pattern. Its
  `git show HEAD:scripts/brief-refresh-and-push.sh` is behind
  `if (process.env.BUG002_WRAPPER_SOURCE === 'HEAD')`. The default path
  `copyFileSync(resolve(ROOT, 'scripts/brief-refresh-and-push.sh'), …)` copies the
  working-tree wrapper. It seeds a fixture repository with the *current* wrapper
  for a brief-refresh atomicity test. It does not reconstruct a frozen legacy
  baseline or assert legacy-versus-modern divergence. No change required.

## Change Boundary

| Surface | Allowed | Forbidden |
| --- | --- | --- |
| `tests/contextual-tooltip.functional.mjs` | Replace the root-wide oracle, add mutation plumbing, controls, and scoped diagnostics | Change existing behavior assertions or exact titles |
| `tests/fixtures/feature-012/contextual-tooltip-pre-scope03/**` | Read-only validation | Any fixture or manifest change |
| `tests/contextual-tooltip.unit.mjs` | Read-only governed comparison | Any change |
| `tests/contextual-tooltip.spec.mjs` | Read-only browser validation | Any change |
| `scripts/selftest.mjs` | Read-only governed comparison and broad validation | Any change |
| Product, publication, Feature 017, Feature 019, Feature 028, and acceptance paths | None | Any change |

`tests/tool-experience-shell.functional.mjs` and
`tests/tool-experience-registry.functional.mjs` remain outside this repair.

## Alternatives And Tradeoffs

| Alternative | Decision | Reason |
| --- | --- | --- |
| Keep the whole-worktree hash oracle | Rejected | It fails on bytes that Scope 03 neither reads nor mutates. |
| Exclude known concurrent report paths | Rejected | The next unrelated writer would recreate the same defect. |
| Retry after a hash mismatch | Rejected | A retry can hide a real governed-path mutation. |
| Remove worktree isolation assertions | Rejected | That would weaken the rollback contract. |
| Closed path oracle plus mutation ledger | Adopted | It protects the complete owned surface and rejects unauthorized writes. |

## Complexity Tracking

None — simplest viable approach used.

## Contract Open Questions

None. `scopes.md` defines the exact inventory, controls, title, and test order.

## Routing

- **`nextRequiredOwner`:** `bubbles.test`.
- **Target:** `tests/contextual-tooltip.functional.mjs` only.
- **Required sequence:** add and run RED-02, implement the scoped oracle, then run
  all nine Test Plan rows in `scopes.md`.
- **Prohibited claims:** do not claim RED, GREEN, delivery, certification, or
  human acceptance without the owning execution evidence.
