# BUG-004 Scopes

**Layout:** single-file
**Mode:** `bugfix-fastlane`
**Packet status:** `in_progress`
**Next required owner:** `bubbles.design`

No implementation, test pass, or certification is claimed by this scope.

## Scope 1 - Preserve Occurrences Without Relevance Inflation

**Status:** Not Started
**Depends On:** Parent design reconciliation by `bubbles.design`.

### Change Boundary

Allowed owned paths by execution order:

- `specs/008-portfolio-survival-and-brief-lab/design.md` for `bubbles.design`;
- `tests/portfolio-foundation.unit.mjs`,
  `tests/portfolio-behavior-occurrence.unit.mjs`, and
  `tests/portfolio-brief.functional.mjs` for `bubbles.test`;
- `rlportfolio.js` for `bubbles.implement`;
- `tests/portfolio-survival-foundation.spec.mjs` for `bubbles.test`.

The existing uncommitted candidate and test hunks are protected concurrent
work. The concurrent `BUG-003-behavior-dedup-contradicts-occurrence-model`
packet is excluded. Every other dirty path is also excluded.

### Gherkin Scenarios

```gherkin
Scenario: SCN-B004-OCCURRENCE-ADMISSION
  Given one stored occurrence for a valid semantic completion
  When the same semantic completion occurs at another instant on the same New York civil date
  Then the distinct occurrence is stored
  And an exact repeated occurrence is rejected

Scenario: SCN-B004-SEMANTIC-ANTI-INFLATION
  Given a baseline stream with distinct semantic completion identities
  And an augmented stream with additional occurrences of one existing semantic identity
  When score, floor eligibility, and canonical ordering are derived
  Then the augmented stream retains more audit occurrences
  And score, floor state, relevance band, supporting identities, and order equal the baseline
```

### Implementation Plan

1. `bubbles.design` reconciles the parent design sections named in
   `design.md#design-owner-packet`.
2. `bubbles.test` preserves the concurrent carrier and adds the missing
   baseline-versus-augmented score and order discriminators.
3. `bubbles.implement` preserves exact-occurrence admission and enforces
   semantic collapse before relevance accumulation.
4. `bubbles.test` reruns every exact row below without weakening assertions.
5. `bubbles.validate` owns evidence acceptance and any state transition.

### Test Plan

| Plan ID | Test Type | Category | Live system | Persistent file | Exact behavior | Command | Current status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-B004-001 | Unit regression | `unit` | No | `tests/portfolio-foundation.unit.mjs` | A distinct same-day occurrence is accepted and an exact occurrence is rejected. | `timeout 240 node --test --test-name-pattern='privacy inventory reports real category counts and carries no stored subject value' tests/portfolio-foundation.unit.mjs` | Parent diagnostics record red before and green after. Re-execution required. |
| TP-B004-002 | Unit adversarial regression | `unit` | No | `tests/portfolio-behavior-occurrence.unit.mjs` | Pin same-day admission, exact-repeat refusal, floor boundary, cap, and sensitivity to the superseded predicate. | `timeout 240 node --test tests/portfolio-behavior-occurrence.unit.mjs` | Concurrent carrier exists. It was not executed here and omits score and order. |
| TP-B004-003 | Functional adversarial regression | `functional` | No | `tests/portfolio-brief.functional.mjs` | Added same-semantic occurrences increase audit cardinality but cannot change score, floor, band, supporting identities, or order. | `timeout 240 node --test --test-name-pattern='Regression: BUG-004 same-semantic occurrences cannot inflate relevance' tests/portfolio-brief.functional.mjs` | Planned. It must fail before projection repair if inflation remains. |
| TP-B004-004 | Functional aggregate regression | `functional` | No | Scope 28 TP-28-02 carrier set | Exact TP-28-02 remains green after the focused repair. | `timeout 1140 node --test tests/portfolio-foundation.unit.mjs tests/portfolio-analytics.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-allocation.functional.mjs tests/portfolio-publisher-boundary.functional.mjs tests/portfolio-bar-coverage.functional.mjs tests/portfolio-risk.functional.mjs tests/portfolio-paths.functional.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-dossier.functional.mjs tests/portfolio-workspace.functional.mjs tests/portfolio-test-integrity.unit.mjs` | Parent diagnostics record 239 of 239 after candidate. Re-execution required. |
| TP-B004-005 | Regression E2E | `e2e-ui` | Yes | `tests/portfolio-survival-foundation.spec.mjs` | The UI stores four occurrences, rejects an exact repeat, and proves a semantic repeat cannot change rank score, floor, or order. | `timeout 600 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep 'Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio' --reporter=list` | Existing row passes in parent diagnostics but needs the anti-inflation discriminator. |
| TP-B004-006 | Broader Regression E2E | `e2e-ui` | Yes | Feature 008 Playwright carriers | The complete Feature 008 browser matrix remains green. | `timeout 1740 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Parent diagnostics record 93 of 93. Re-execution required. |
| TP-B004-007 | Repository regression | `functional` | No | `scripts/selftest.mjs` | All registered repository checks remain green. | `timeout 1800 node scripts/selftest.mjs` | Parent diagnostics record 3404 of 3404. Re-execution required. |

### Definition of Done

#### Core Items

- [ ] Parent design separates exact-occurrence storage from semantic relevance
  de-duplication without changing SCN-008-044.
- [ ] `buildBehaviorCandidate()` rejects only an exact occurrence and preserves
  both distinct audit occurrences.
- [ ] Semantic repetitions cannot change score, floor eligibility, relevance
  band, supporting identities, or canonical ordering.
- [ ] The change boundary is respected and every pre-existing dirty path is
  preserved.
- [ ] `TP-B004-001` focused unit regression passes with current-session
  evidence in `report.md#tp-b004-001`.
- [ ] `TP-B004-002` occurrence unit carrier passes without weakened mutation,
  floor, cap, or exact-repeat assertions in `report.md#tp-b004-002`.
- [ ] `TP-B004-003` adversarial functional regression fails before projection
  repair and passes after repair in `report.md#tp-b004-003`.
- [ ] `TP-B004-004` exact functional aggregate passes in
  `report.md#tp-b004-004`.
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
- [ ] Broader E2E regression suite passes
- [ ] `TP-B004-007` registered repository selftest passes in
  `report.md#tp-b004-007`.

#### Build Quality Gate

- [ ] Artifact lint, diff checks, test integrity, and validate-owned
  certification are clean with zero warnings and zero unchecked test
  obligations.

All Definition of Done items remain unchecked.
