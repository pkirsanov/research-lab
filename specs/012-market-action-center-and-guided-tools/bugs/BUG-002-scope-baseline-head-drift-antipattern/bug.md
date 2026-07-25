# Bug: BUG-002 Feature 012 Test-Infra Moving-HEAD Baseline-Authority Drift

Links: [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md)

> **Scope of this packet:** DISCOVERY + ROOT-CAUSE + ROUTING only. No test,
> product, or parent-Feature-012 file is modified by this packet. Remediation is
> designed here and routed to the parent Feature 012 owner; it is implemented
> later under coordination. This BUG-002 is **feature-scoped** to Feature 012 and
> is distinct from the repository-level `specs/_bugs/BUG-002-two-tier-provider-access`.

## Summary

Multiple Feature 012 functional tests reconstruct a "legacy / pre-scope baseline
authority" by reading the **moving** `HEAD`:

```js
function baselineBytes(relativePath) {
  return execFileSync('git', ['show', `HEAD:${relativePath}`], { cwd: ROOT });
}
```

Because `HEAD` advances every time Feature 012 code is committed, once the
feature bytes land on `HEAD`, `git show HEAD:<file>` returns the **modern** bytes.
The intended "legacy baseline" therefore silently becomes the modern content, and
the compatibility / rollback assertions that depend on a frozen pre-feature
baseline break (or, worse, could pass vacuously). This is guaranteed to rot on
every Feature 012 commit to `HEAD`.

The class was first fixed in isolation for the Scope 02 shell rollback
(`SCN-012-031`) during the child BUG-001 run (repinned to the immutable
pre-Scope-02 commit `767732db` with sha256 + semantic-marker fail-loud guards).
This packet promotes that discovery into a first-class, tracked, systemic
Feature 012 defect covering every remaining occurrence, and routes the durable
remediation to the owner.

## Severity

- [ ] Critical - System unusable, data loss
- [x] High - A whole class of Feature 012 compatibility/rollback tests is
  guaranteed to rot on every commit to `HEAD`; two scenarios (`SCN-012-003`,
  `SCN-012-033`) are already RED on current bytes, blocking the Feature 012
  regression gate. No product data loss.
- [ ] Medium
- [ ] Low

## Status

- [x] Reported
- [x] Confirmed (reproduced read-only on current bytes; see [report.md](report.md))
- [x] In Progress (discovered, root-caused, classified, and routed; NO repair attempted here)
- [ ] Fixed
- [ ] Verified
- [ ] Closed

## Repository / Concurrency Context (verified)

- Repo: `research-lab`, Bubbles 7.20.1 local-source, build-free (no `./research-lab.sh`).
- `HEAD` is **actively moving** during this session (operator committing Feature 012
  Scope 05 adapters in parallel). Observed sequence this session:
  `… → c81d808d → 4d4cd3d7 → 861e4dfc → f1b5f633` (currently `f1b5f633`,
  "feat(012): Scope 05 swing-transition/v1 adapter (4/8)").
- Immutable anchor used by the reference fix: `767732db`
  ("chore(bubbles): refresh 7.20.1 installer payload"), the parent of the Scope 02
  commit — predates every Feature 012 marker.
- The decorator rollout that breaks `SCN-012-003` was committed at `c81d808d`
  ("feat(012): Market Action Center Scopes 01-04 + BUG-004 two-tier provider access").

## Root Cause (one sentence)

Feature 012 functional tests use the **moving `HEAD`** (`git show HEAD:<path>`) as a
"legacy / pre-scope baseline authority"; once the feature bytes are committed to
`HEAD`, the baseline silently becomes the modern content and the frozen-baseline
compatibility / rollback assertions rot.

## Blast Radius (verified read-only on HEAD `f1b5f633`)

| # | File | Test / Scenario | Class | Verified current state |
|---|------|-----------------|-------|------------------------|
| 1 | `tests/tool-experience-shell.functional.mjs` | `SCN-012-031` (Scope 02 shell rollback) | **baseline-repin — ALREADY FIXED (reference shape)** | GREEN (`tests 3 / pass 3 / fail 0`, exit 0). Pinned to `767732db` + `MODERN_SHELL_MARKER` + `LEGACY_BASELINE_SHA256` fail-loud guards. **Interim fix stays.** |
| 2 | `tests/contextual-tooltip.functional.mjs` | `SCN-012-003` (Scope 03 decorator / legacy canary pages) | **DESIGN-INTENT-GATED** | RED (`tests 9 / pass 8 / fail 1`, exit 1). `not ok 8`, `operator: 'doesNotMatch'` at `verifyLegacyCanaryPages` (`:265`). |
| 3 | `tests/tool-experience-registry.functional.mjs` | `SCN-012-033` (Scope 01 registry rollback) | **baseline-repin** | RED (`tests 7 / pass 4 / fail 3`, exit 1). Both failing sites source the baseline from `HEAD:tools.json`. |
| 4 | `tests/brief-refresh-atomicity.support.mjs` | brief-automation atomicity harness | **UNRELATED / cleared** | Not the anti-pattern. Its `git show HEAD:` read is env-gated (`BUG002_WRAPPER_SOURCE === 'HEAD'`); the default path copies the working-tree wrapper. It is not a frozen legacy-baseline authority. |

## The `SCN-012-003` Design-Intent Gate (do NOT auto-fix)

`tests/contextual-tooltip.functional.mjs` reconstructs a "legacy" copy of
`market-heatmap-lab.html` from `baselineBytes` (= `git show HEAD:`) and asserts in
`verifyLegacyCanaryPages`:

```js
assert.equal(bytes.equals(baselineBytes(relativePath)), true, `${relativePath} must use exact HEAD authority bytes`);
assert.doesNotMatch(source, /src="rlcontext\.js|src="rlexperience\.js/);
```

The operator **intentionally** committed the decorator references to `HEAD`:

- `market-heatmap-lab.html` decorator refs: **0** at `767732db` → **2** at `HEAD`
  (`<script src="rlexperience.js" defer>` L411, `<script src="rlcontext.js" defer>` L412),
  introduced at `c81d808d`.

So the negative assertion `doesNotMatch(/rlcontext|rlexperience/)` encodes a
**pre-decorator** expectation that Feature 012's design may have intentionally
changed. Whether `market-heatmap-lab.html` **should** now carry decorator refs is
an **OPERATOR / parent-Feature-012 design-intent question**. This packet does NOT
decide it. Guessing it green (e.g. deleting or inverting the assertion) could mask
a real regression. The remediation for this site is **owner-gated**: the owner must
confirm the intended decorator behavior first, then the assertion is updated to the
correct intended state while preserving adversarial strength.

## Expected Behavior (after routed remediation)

- No Feature 012 compatibility / rollback test derives its "legacy / pre-scope
  baseline" from the moving `HEAD`.
- Every baseline authority is a **stable, HEAD-independent source**: a committed,
  sha256-provenanced byte-exact fixture (preferred) or an immutable pinned
  pre-feature commit anchor — each guarded by a fail-loud sha256 + semantic-marker
  check so the baseline can never silently drift to modern bytes again.
- No assertion is weakened, skipped, or deleted; adversarial strength is preserved.
- No product / page source is changed by the remediation.
- For `SCN-012-003`, the intended decorator behavior is reconciled with the owner
  **before** the assertion is changed.

## Reproduction Steps (read-only)

1. From the repo root on current bytes (`HEAD f1b5f633`).
2. `grep -rn "show.*HEAD:" tests/` and `grep -rn baselineBytes tests/` — observe the
   occurrences in the four files above.
3. `node --test tests/contextual-tooltip.functional.mjs` → exit 1, `not ok 8` on the
   `doesNotMatch(/rlcontext|rlexperience/)` legacy-canary assertion.
4. `node --test tests/tool-experience-registry.functional.mjs` → exit 1, `3` failures
   including `rolled-back registry must be semantically equal to HEAD` and
   `experience is the only tools.json addition` (both source the baseline from `HEAD`).
5. `node --test tests/tool-experience-shell.functional.mjs` → exit 0 (the reference fix
   remains green).

All raw output is captured in [report.md](report.md).
