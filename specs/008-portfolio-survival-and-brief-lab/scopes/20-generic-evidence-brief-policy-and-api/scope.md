# Scope 20: Generic Evidence Brief Policy And API

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** Done
**Scope-Kind:** runtime-behavior
**Tags:** `overlay:brief`, `remediation`
**Depends On:** 19
**Entry Gate:** Every scope in `Depends On` must be Done.
**Findings:** F008-BRIEF-EVIDENCE-001, F008-BRIEF-POLICY-001, F008-BROWSER-API-001
**Requirements:** FR-040 through FR-057, FR-067, FR-153; NFR-006, NFR-021, NFR-023.

## Outcome

Make Portfolio Brief consume the generic publisher contract completely, apply one DST-safe ranking policy, and expose the full closed browser API/error surface designed for Feature 008.

## Gherkin Scenario And Ownership

### SCN-008-046: The complete generic evidence contract authors one bounded honest queue

```gherkin
Scenario: Portfolio Brief composes a DST-boundary window from generic evidence and local scope
  Given matching generic snapshot, payload, history, watchlist, and qualified owner reads exist around an America New York DST transition
  When the complete RLPORTFOLIO_BRIEF API validates, de-duplicates, derives, builds, ranks, composes, explains, and reduces the action lifecycle
  Then the selected window and cutoff follow America New_York civil time
  And freshness, catalyst, action, publisher identity, and repeated-evidence identity come from the generic artifacts
  And one global queue cap preserves urgent direct work before general-interest work
  And stale evidence authors only Refresh or Revisit actions with stale conditions
  And every failure returns the closed PortfolioError v1 shape and declared P008 code without leaking values
```

## Implementation Plan

1. Implement and export `validateGenericWindow`, `dedupeBehaviorEvents`, `deriveInterestSignals`, `buildActionCandidates`, `rankResearchActions`, `composePortfolioBrief`, `whyShown`, and `reduceResearchActionLifecycle` through browser and CommonJS contracts.
2. Parse snapshot, payload, history, watchlist, and current qualified owner reads as independent sources with exact fingerprints/cutoffs and repeated-evidence de-duplication.
3. Resolve all four windows through America/New_York timezone semantics, including DST gaps/folds, rather than a fixed UTC offset.
4. Use the D1 behavior-floor identity and one global cap over direct/general lanes; expose suppressed/no-action accounting.
5. Restrict stale evidence to Refresh/Revisit and preserve completion/invalidation/freshness fields.
6. Apply one closed `PortfolioError/v1` constructor and code registry at every public API boundary.

## Change Boundary

- **Allowed:** `rlportfoliobrief.js`, the Brief/Why-shown route regions, Feature 008 generic fixtures, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-publisher-boundary.functional.mjs`, `tests/portfolio-survival-brief.spec.mjs`, and API canaries in `scripts/selftest.mjs`.
- **Excluded:** public publisher writes/scheduler, personal store schema, risk/path/allocation math, provider credentials, registry/docs surfaces, and framework-managed files.

## Shared Infrastructure Impact Sweep

| Contract | Consumers | Canary |
|---|---|---|
| Public brief artifacts | Market Brief and Portfolio Brief | Existing generic publisher outputs remain byte-compatible and portfolio-agnostic. |
| Browser/CommonJS brief API | Route and Node tests | Export-name/error-shape parity test fails on any missing or undeclared API. |
| Window/time policy | Four-window selector and cutoff filtering | DST gap/fold fixtures plus all four ordinary windows. |
| Action queue | Simple, Power, Why shown, lifecycle | One canonical queue identity/order/cap across every projection. |

## Consumer Impact Sweep

| Consumer | Required proof |
|---|---|
| Generic snapshot, payload, history, watchlist, and owner reads | Every required identity enters one validated local projection without personal publication. |
| Browser and CommonJS consumers | All eight functions expose identical frozen behavior and closed error shapes. |
| Brief lanes, Why shown, and lifecycle controls | One queue order, cap, stale policy, and last-valid identity remain consistent. |

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-046 complete current evidence | Matching five public inputs | Open Brief, inspect lanes/Why shown | Evidence-linked current actions and global cap | e2e-ui |
| SCN-008-046 DST | Window near spring/fall transition | Select each window | Correct civil-time identity and cutoff | e2e-ui |
| SCN-008-046 stale | Stale snapshot/payload | Compose | Refresh/Revisit only; stale reason visible | e2e-ui |
| SCN-008-046 API error | Invalid generic contract | Compose | Safe closed P008 error and preserved last valid brief | e2e-ui |

## Test Plan

Every remediation assertion and exact title below is `planned-not-authored` at P1. Existing carrier paths do not imply that the new test exists.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Evidence |
|---|---|---|---|---|---|---|---|---|
| TP-20-01 | Functional | functional | 046 | `tests/portfolio-brief.functional.mjs` | Complete API, evidence projection, DST, cap, stale authoring, and error registry | `node --test tests/portfolio-brief.functional.mjs` | No | `report.md#tp-20-01` |
| TP-20-02 | Publisher boundary | functional | 046 | `tests/portfolio-publisher-boundary.functional.mjs` | Generic artifacts remain portfolio-agnostic while all five inputs are consumed locally | `node --test tests/portfolio-publisher-boundary.functional.mjs` | No | `report.md#tp-20-02` |
| TP-20-03 | Regression E2E | e2e-ui | 046 | `tests/portfolio-survival-brief.spec.mjs` | Exact title: `Regression: SCN-008-046 generic evidence DST policy complete API and global queue remain coherent` | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-046 generic evidence DST policy complete API and global queue remain coherent" --reporter=list` | Yes | `report.md#tp-20-03` |
| TP-20-04 | Adversarial mutation | functional | 046 | `tests/portfolio-brief.functional.mjs` | Disposable fixed-offset, per-lane-cap, raw-count, stale-verb, and missing-export mutations each fail | `node --test --test-name-pattern="Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract" tests/portfolio-brief.functional.mjs` | No | `report.md#tp-20-04` |
| TP-20-05 | Broader regression | functional | 046 | `scripts/selftest.mjs` | Existing Market Brief and shared contracts remain green | `node scripts/selftest.mjs` | No | `report.md#tp-20-05` |

## Rollback And Restore

- Keep generic source artifacts read-only and separately fingerprinted throughout the change.
- A failed API/window/ranking computation retains the last valid local brief identity and returns a closed error.
- Reverting this scope restores only the brief module, route projection, fixtures, and tests; it never rewrites public brief history.

### Definition of Done - Tiered Validation

- [x] Portfolio Brief composes a DST-boundary window from generic evidence and local scope; SCN-008-046 also proves the full API, closed errors, one global queue cap, and no personal publisher flow. Evidence: [Code Diff Evidence](report.md#code-diff-evidence), [TP-20-01](report.md#tp-20-01), [TP-20-02](report.md#tp-20-02), [TP-20-03](report.md#tp-20-03), [TP-20-04](report.md#tp-20-04).
- [x] TP-20-01 functional evidence passes. Evidence: [TP-20-01](report.md#tp-20-01).
- [x] TP-20-02 publisher-boundary evidence passes. Evidence: [TP-20-02](report.md#tp-20-02).
- [x] TP-20-03 real-page regression passes. Evidence: [TP-20-03](report.md#tp-20-03).
- [x] TP-20-04 adversarial mutation proof rejects each audited reduced behavior. Evidence: [TP-20-04](report.md#tp-20-04).
- [x] TP-20-05 broader regression passes. Evidence: [TP-20-05](report.md#tp-20-05).
- [x] Shared Infrastructure Impact Sweep and last-valid rollback proof are recorded. Evidence: [Code Diff Evidence](report.md#code-diff-evidence), [TP-20-03](report.md#tp-20-03), [Validation Summary](report.md#validation-summary).
- [x] Build Quality Gate passes with zero skips/warnings and no excluded-file changes. Evidence: [Code Diff Evidence](report.md#code-diff-evidence), [Lint And Quality](report.md#lint-and-quality), [Canonical Focused Traceability Correction](report.md#canonical-focused-traceability-correction).
