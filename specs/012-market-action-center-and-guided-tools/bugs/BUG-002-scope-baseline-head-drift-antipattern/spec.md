# Spec: BUG-002 Feature 012 Test-Infra Moving-HEAD Baseline-Authority Drift

Links: [bug.md](bug.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Outcome Contract

- **Intent:** Every Feature 012 compatibility / rollback test that needs a
  "legacy / pre-scope baseline authority" must derive it from a **stable,
  HEAD-independent source** that cannot silently drift to modern bytes as `HEAD`
  advances — without weakening any assertion or touching product code.
- **Success Signal:** After the routed remediation, `SCN-012-003` and
  `SCN-012-033` are GREEN because their baselines are frozen (fixture or immutable
  pinned commit) with fail-loud sha256 + semantic-marker guards; a fresh commit to
  `HEAD` can no longer flip a "legacy baseline" to modern bytes; and every
  adversarial assertion still fails on a REAL contract break.
- **Hard Constraints:** No assertion weakened / skipped / deleted; no product or
  page source changed; the already-green `SCN-012-031` reference fix preserved
  byte-for-byte; the `SCN-012-003` decorator expectation only changed AFTER the
  owner confirms the intended decorator behavior.
- **Failure Condition:** A baseline authority still reads the moving `HEAD`; an
  assertion is relaxed/removed to force green; the `SCN-012-003` negative decorator
  assertion is flipped without owner design-intent confirmation; or product bytes
  are modified.

## Requirements

- **FR-B002-01 No moving-HEAD baseline.** No Feature 012 test may reconstruct a
  legacy / pre-scope baseline via `git show HEAD:<path>`. The authority MUST be
  HEAD-independent.
- **FR-B002-02 Stable authority + fail-loud guards.** Each replaced baseline MUST
  be a byte-exact committed fixture (preferred) or an immutable pinned pre-feature
  commit anchor, guarded by a fail-loud sha256 check AND a semantic marker check so
  a drift to modern bytes fails LOUD instead of passing silently. The existing
  `SCN-012-031` fix (`LEGACY_BASELINE_COMMIT = 767732db`, `MODERN_SHELL_MARKER`,
  `LEGACY_BASELINE_SHA256`) is the reference shape.
- **FR-B002-03 Preserve adversarial strength.** Every replaced test MUST still fail
  on a genuine contract break (no vacuous / tautological pass, no bailout early
  return). Fixture-preferred because a fixture is immune to rebase/orphaning of a
  pinned commit.
- **FR-B002-04 Owner-gated `SCN-012-003`.** The `SCN-012-003` legacy-canary
  decorator expectation for `market-heatmap-lab.html` MUST NOT be changed until the
  parent Feature 012 owner confirms whether the page is intended to carry
  `rlexperience.js` / `rlcontext.js` now. Only then is the assertion updated to the
  correct intended state (still adversarial). This packet does not decide it.
- **FR-B002-05 Preserve the reference fix.** `tests/tool-experience-shell.functional.mjs`
  (`SCN-012-031`) is the model and MUST remain unchanged (it is already GREEN with
  the correct stable-anchor + guard shape).
- **FR-B002-06 No product change.** Remediation is test-infrastructure only. No
  `*.html`, `rl*.js`, `tools.json`, `scripts/**`, or other product/page byte is
  modified to satisfy a test.
- **FR-B002-07 Boundary preservation.** This discovery packet modifies ONLY files
  inside its own bug folder. It does not modify any test, product file, Feature 012
  top-level `state.json`, `scopes/**`, or any other spec. It performs no git
  mutation.

## Acceptance Criteria

- **AC-B002-01:** `grep -rn "show.*HEAD:" tests/` returns no occurrence used as a
  frozen legacy-baseline authority (env-gated current-wrapper reads such as
  `brief-refresh-atomicity.support.mjs` are explicitly out of scope and permitted).
- **AC-B002-02:** `node --test tests/tool-experience-registry.functional.mjs`
  passes with the baseline sourced from a stable HEAD-independent authority + guards.
- **AC-B002-03:** `node --test tests/contextual-tooltip.functional.mjs` passes ONLY
  after (a) baseline repinned to a stable pre-decorator authority and (b) the owner
  has confirmed the intended decorator behavior and the assertion reflects it.
- **AC-B002-04:** `node --test tests/tool-experience-shell.functional.mjs` remains
  GREEN and byte-unchanged.
- **AC-B002-05:** A fresh Feature 012 commit to `HEAD` does not turn any "legacy
  baseline" into modern bytes (proven by the sha256 + marker guards failing loud on
  drift).

## Out of Scope

- Fixing the tests here (routed to the parent Feature 012 owner / specialists).
- Any product/page change.
- The in-flight Scope 05 adapter work the operator is actively committing.
- The repository-level `specs/_bugs/BUG-002-two-tier-provider-access` (distinct bug;
  its `BUG002_WRAPPER_SOURCE` harness flag is unrelated to this drift class).
