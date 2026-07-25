# Scopes: BUG-002 Feature 012 Test-Infra Moving-HEAD Baseline-Authority Drift

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md)

> **Planning state:** DISCOVERY + ROUTING packet. `status: not_started`. These fix
> scopes are **routed** to the parent Feature 012 owner (`bubbles.plan` /
> `bubbles.design`) and are intentionally all **Not Started** — this packet does not
> implement them. Scope 2 (`SCN-012-003`) is additionally **OWNER-GATED** on a
> design-intent confirmation. Scope structure/DoD here is a routed proposal;
> plan/design own its final form under a parent Feature 012 run.

## Execution Outline (proposed, routed)

### Phase Order

1. `bubbles.plan` / `bubbles.design` (parent Feature 012 run) adopt or amend this
   remediation design and reconcile the plan-owned scope/DoD contracts.
2. **Owner design-intent confirmation** for `SCN-012-003`: is `market-heatmap-lab.html`
   intended to carry `rlexperience.js` / `rlcontext.js` now? (Gate for Scope 2.)
3. `bubbles.test` records the pre-fix RED against current bytes for each repinned test
   (already RED today — capture under the owned run), then implements the stable
   baseline authority + guards.
4. `bubbles.regression` / `bubbles.validate` / `bubbles.audit` run the remaining
   `bugfix-fastlane` checks before any certification transition.

### Ordering Rationale

Scope 1 (registry) is a mechanical, HEAD-independent baseline repin and can proceed
once adopted. Scope 2 (tooltip) MUST wait for the owner's decorator design-intent
answer, because changing the negative assertion without it could mask a real
regression. The already-green `SCN-012-031` shell fix is the reference and is not a
scope of work.

---

## Scope 1: Repin the registry rollback baseline off moving `HEAD` (pure baseline-repin)
**Status:** [ ] Not started | [ ] In progress | [ ] Done
**Class:** baseline-repin
**Depends On:** design adoption (parent Feature 012 plan/design)

### Target
`tests/tool-experience-registry.functional.mjs` (`SCN-012-033`, Scope 01 registry
rollback). Currently RED (`4/7`; failures: `experience is the only tools.json addition`,
`rolled-back registry must be semantically equal to HEAD`) — both source the baseline
from `HEAD:tools.json`, which now contains the Feature 012 experience objects.

### Gherkin Scenarios (Regression)
```gherkin
Feature: Registry rollback baseline is HEAD-independent
  Scenario: Feature 012 is committed to HEAD
    Given the registry rollback test needs the pre-experience tools.json baseline
    When Feature 012 experience objects are committed to HEAD
    Then the test's baseline authority still returns the pre-experience bytes
    And "experience is the only tools.json addition" holds against that frozen baseline
    And "rolled-back registry must be semantically equal to <frozen baseline>" holds
    And a drift of the baseline to modern bytes fails LOUD (sha256 + marker guard)
```

### Implementation Plan (routed)
1. Replace `baselineRegistry()` and the `git show HEAD:tools.json` /
   `git show HEAD:scripts/selftest.mjs` reads with a stable, HEAD-independent
   authority (committed fixture preferred; else immutable pre-Scope-01 commit anchor).
2. Add fail-loud sha256 + semantic-marker guards mirroring `SCN-012-031`.
3. Keep every assertion byte-identical in intent; do not weaken adversarial checks.

### Test Plan
| Test Type | Category | File | Command | Live |
|-----------|----------|------|---------|------|
| Functional | functional | `tests/tool-experience-registry.functional.mjs` | `node --test tests/tool-experience-registry.functional.mjs` | No |

### Definition of Done
- [ ] Baseline authority is HEAD-independent (fixture or immutable pinned commit)
- [ ] Fail-loud sha256 + semantic-marker guards present
- [ ] No assertion weakened / skipped / deleted
- [ ] `node --test tests/tool-experience-registry.functional.mjs` GREEN
- [ ] No product / page byte changed

---

## Scope 2: Reconcile + repin the Scope 03 decorator legacy-canary (DESIGN-INTENT-GATED)
**Status:** [ ] Not started | [ ] In progress | [ ] Done
**Class:** design-intent-gated
**Depends On:** Scope 1 pattern + **OWNER design-intent confirmation** (BLOCKING GATE)

### Target
`tests/contextual-tooltip.functional.mjs` (`SCN-012-003`, Scope 03 decorator / legacy
canary pages). Currently RED (`8/9`; `not ok 8`, `doesNotMatch` at
`verifyLegacyCanaryPages:265`). `market-heatmap-lab.html`: 0 decorator refs at
`767732db` → 2 at `HEAD` (added at `c81d808d`).

### OWNER GATE (must resolve before any assertion change)
> Is `market-heatmap-lab.html` **intended** to carry `rlexperience.js` /
> `rlcontext.js` now? The parent Feature 012 owner MUST answer before the negative
> `doesNotMatch` assertion is changed. Guessing green risks masking a real regression.

### Gherkin Scenarios (Regression)
```gherkin
Feature: Scope 03 legacy-canary is HEAD-independent and intent-correct
  Scenario: Legacy canary reconstructs the pre-decorator page
    Given the legacy-canary needs the pre-Scope-03 market-heatmap-lab.html
    When Feature 012 decorators are committed to HEAD
    Then the canary reconstructs the page from a frozen pre-decorator authority
    And the intended decorator expectation is confirmed by the owner first
    And the (repinned + intent-correct) assertion still fails on a REAL contract break
```

### Implementation Plan (routed, owner-gated)
1. **Owner confirms** intended decorator behavior for `market-heatmap-lab.html`.
2. Repin `baselineBytes` to a stable pre-decorator authority (fixture preferred) with
   fail-loud sha256 + marker guards.
3. Update the decorator assertion to the owner-confirmed intended state (either keep
   `doesNotMatch` against the frozen pre-decorator legacy page, or move to the correct
   positive expectation for the modern state) — preserving adversarial strength.

### Test Plan
| Test Type | Category | File | Command | Live |
|-----------|----------|------|---------|------|
| Functional | functional | `tests/contextual-tooltip.functional.mjs` | `node --test tests/contextual-tooltip.functional.mjs` | No |

### Definition of Done
- [ ] Owner design-intent confirmation recorded (decorator behavior)
- [ ] Baseline authority is HEAD-independent (fixture or immutable pinned commit) + guards
- [ ] Assertion reflects owner-confirmed intent; still adversarial (fails on real break)
- [ ] No assertion weakened / skipped / deleted
- [ ] `node --test tests/contextual-tooltip.functional.mjs` GREEN
- [ ] No product / page byte changed

---

## Non-scope (recorded for closure)

- **`tests/tool-experience-shell.functional.mjs` (`SCN-012-031`)** — ALREADY FIXED
  reference shape; GREEN; **preserve byte-for-byte**. Not a scope of work.
- **`tests/brief-refresh-atomicity.support.mjs`** — env-gated (`BUG002_WRAPPER_SOURCE`)
  current-wrapper read; NOT the drift anti-pattern. No change required.
