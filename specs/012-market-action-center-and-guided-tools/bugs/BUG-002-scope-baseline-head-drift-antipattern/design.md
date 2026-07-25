# Design: BUG-002 Feature 012 Test-Infra Moving-HEAD Baseline-Authority Drift

Links: [bug.md](bug.md) | [spec.md](spec.md) | [scopes.md](scopes.md) | [report.md](report.md)

> **Ownership note (G042):** This `design.md` is authored by `bubbles.bug` as the
> routed discovery/root-cause record. Adoption or amendment of the remediation
> design, and the plan-owned scope/DoD structure, are routed to `bubbles.design`
> and `bubbles.plan` under a **parent Feature 012** run. The `SCN-012-003` step is
> additionally gated on an operator design-intent confirmation.

## Root-Cause Analysis

### The anti-pattern

Several Feature 012 functional tests need to reconstruct the **pre-scope "legacy"
state** of shared files (the state before a given Feature 012 scope changed them)
in order to run a compatibility / rollback rehearsal. They obtain those "legacy"
bytes with:

```js
function baselineBytes(relativePath) {
  return execFileSync('git', ['show', `HEAD:${relativePath}`], { cwd: ROOT });
}
```

`HEAD` is the **wrong authority** for a *legacy* baseline. `HEAD` is a moving
pointer: as soon as the Feature 012 scope's bytes are committed (Scope 01 at
`c81d808d`, Scope 02 shell, Scope 03 decorators, Scope 05 adapters in flight),
`git show HEAD:<file>` returns the **modern** bytes. The "legacy baseline"
therefore becomes identical to the modern content, and:

- assertions that expect the legacy state to **differ** from modern (e.g. "the
  legacy page has NO decorators", "the rolled-back registry has NO experience
  objects") **break** once the feature is on `HEAD`; and
- assertions that only compare the sandbox to `baselineBytes` can pass **vacuously**
  (both sides are modern), silently destroying the adversarial value of the test.

This is not a flaky failure — it is a **guaranteed rot on every Feature 012 commit
to `HEAD`**. The `HEAD` pointer moved five times in the current session alone.

### Verified evidence (see [report.md](report.md))

- `market-heatmap-lab.html` decorator refs: **0** at the immutable pre-Scope-02
  anchor `767732db` → **2** at `HEAD` (`rlexperience.js`, `rlcontext.js`),
  introduced at `c81d808d`.
- `tests/contextual-tooltip.functional.mjs` `SCN-012-003` is RED (`8/9`; `not ok 8`)
  precisely on `assert.doesNotMatch(source, /src="rlcontext\.js|src="rlexperience\.js/)`
  at `verifyLegacyCanaryPages` (`:265`), because the "legacy" heatmap page it
  reconstructs from `HEAD` now carries the decorators.
- `tests/tool-experience-registry.functional.mjs` `SCN-012-033` is RED (`4/7`;
  `3` failures) on `experience is the only tools.json addition` (baseline = `HEAD:tools.json`,
  which now HAS experience) and `rolled-back registry must be semantically equal to HEAD`.
- `tests/tool-experience-shell.functional.mjs` `SCN-012-031` is GREEN (`3/3`) — it was
  already repinned off `HEAD`.

## The reference remediation (already shipped for `SCN-012-031`)

`tests/tool-experience-shell.functional.mjs` demonstrates the correct, durable shape.
Instead of `HEAD`, it pins an immutable pre-scope commit and guards it fail-loud:

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

Two properties make this correct: (1) the source is **HEAD-independent** (an
immutable commit), and (2) two **fail-loud guards** (no-modern-marker + exact
sha256) ensure that if the pin is ever (re)pointed at post-scope content the test
fails **loud** instead of silently reading modern bytes — preserving adversarial
strength.

## Remediation Design (routed; NOT implemented here)

### Principle 1 — Replace every moving-`HEAD` baseline with a stable authority

For each drift site, replace `git show HEAD:<path>` with a **HEAD-independent**
authority, guarded fail-loud:

- **Preferred: a captured, committed fixture.** Store the byte-exact legacy bytes as
  a committed fixture (e.g. under the bug/test fixtures tree), recorded with its
  sha256. A fixture is the most durable option: it is immune to rebase, history
  rewrite, or orphaning of a pinned commit (a real risk while the operator is
  actively rebasing this repo).
- **Acceptable: an immutable pinned pre-feature commit anchor** (as `SCN-012-031`
  uses `767732db`), when a fixture is disproportionate. Still guarded by sha256 +
  a semantic marker.

Both MUST carry the fail-loud sha256 + semantic-marker guards (FR-B002-02). No
assertion is weakened (FR-B002-03).

Applies to: **`tests/tool-experience-registry.functional.mjs`** (`SCN-012-033`) —
pure baseline-repin. Repoint `baselineRegistry()` (line ~236) and the two
`git show HEAD:` reads (lines ~405–406) at the pre-Scope-01 registry authority so
`experience is the only tools.json addition` and `rolled-back registry must be
semantically equal to HEAD` compare against the true pre-experience baseline.

### Principle 2 — `SCN-012-003` is OWNER-GATED, not a mechanical repin

`tests/contextual-tooltip.functional.mjs` is different: its failing assertion encodes
a **negative expectation** (`market-heatmap-lab.html` has NO `rlcontext.js` /
`rlexperience.js`) that Feature 012's design **may have intentionally changed**.

Two candidate remediations exist, and choosing between them is a **design-intent
decision the owner must make**, NOT a guess this packet may take:

1. **Pure legacy-baseline repin.** If the legacy-canary check is meant to prove the
   *pre-Scope-03* state, repin `baselineBytes` to a stable pre-decorator authority
   (fixture or immutable pre-decorator commit) with guards; the reconstructed legacy
   heatmap then correctly has NO decorators and `doesNotMatch` passes unchanged —
   AND a companion current-state assertion should confirm the *modern* page DOES
   carry the intended decorators, so the adversarial contract is preserved on both
   ends.
2. **Intended-state update.** If the design intent is that this canary now tracks a
   state that legitimately includes decorators, the negative assertion must be
   updated to the correct positive expectation (still adversarial — it must fail on a
   real contract break), not deleted.

**Required first step (owner-gated):** the parent Feature 012 owner confirms whether
`market-heatmap-lab.html` is intended to carry `rlexperience.js` / `rlcontext.js`
now (evidence: 0 refs at `767732db` → 2 at `HEAD`, added deliberately at `c81d808d`).
Only after that confirmation may the assertion be changed. Guessing it green risks
masking a real decorator regression.

### Principle 3 — Preserve the reference fix and product bytes

- `tests/tool-experience-shell.functional.mjs` (`SCN-012-031`) stays byte-for-byte
  (already correct and GREEN).
- No product / page source (`*.html`, `rl*.js`, `tools.json`, `scripts/**`) is
  modified. This is a test-infrastructure defect only.

### Explicitly out of scope / cleared

- `tests/brief-refresh-atomicity.support.mjs` — NOT the anti-pattern. Its
  `git show HEAD:scripts/brief-refresh-and-push.sh` is behind
  `if (process.env.BUG002_WRAPPER_SOURCE === 'HEAD')`; the default path
  `copyFileSync(resolve(ROOT, 'scripts/brief-refresh-and-push.sh'), …)` copies the
  working-tree wrapper. It seeds a fixture repo with the *current* wrapper for a
  brief-refresh atomicity/boundary test; it does not reconstruct a frozen legacy
  baseline and does not assert legacy-vs-modern divergence. No change required.

## Change Boundary (of the routed remediation, when later implemented by the owner)

| Surface | Allowed | Forbidden |
|---------|---------|-----------|
| `tests/tool-experience-registry.functional.mjs` | Repin baseline authority + add fail-loud guards | Weaken/remove any assertion |
| `tests/contextual-tooltip.functional.mjs` | Repin baseline authority; update decorator assertion to owner-confirmed intended state | Change assertion before owner confirmation; delete/relax adversarial checks |
| test fixtures tree | Add committed, sha256-provenanced legacy fixtures | — |
| `tests/tool-experience-shell.functional.mjs` | — | Any change (already correct) |
| product / pages (`*.html`, `rl*.js`, `tools.json`, `scripts/**`) | — | Any change |

## Routing

- **Owner:** parent Feature 012 maintainer (the operator actively working Feature 012).
- **`nextRequiredOwner`:** `bubbles.plan` / `bubbles.design` under a **parent
  Feature 012** run — gated on the operator's design-intent confirmation for the
  `SCN-012-003` decorator question before the assertion is changed.
- **Registration:** the operator registers this packet when they next touch Feature 012;
  this packet does not modify Feature 012's top-level state.
