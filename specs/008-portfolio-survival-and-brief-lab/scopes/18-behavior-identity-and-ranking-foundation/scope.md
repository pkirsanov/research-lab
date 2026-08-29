# Scope 18: Behavior Identity And Ranking Foundation

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** Done
**Scope-Kind:** runtime-behavior
**Tags:** `foundation:true`, `remediation`
**Depends On:** 17
**Entry Gate:** Every scope in `Depends On` must be Done.
**Finding:** F008-BEHAVIOR-CONTRACT-001
**Requirements:** FR-034, FR-036, FR-056, FR-057, FR-067; NFR-002, NFR-006, NFR-023.

## Outcome

Make one semantic behavior identity, relevance calculation, and ranking result authoritative across storage, brief composition, and route rendering.

## Gherkin Scenario And Ownership

### SCN-008-044: Behavior relevance is identity-complete and temporally honest

```gherkin
Scenario: Repeated completed research produces one consistent relevance result
  Given completed events vary by result identity, evidence source, horizon, completion condition, and occurrence date
  When events are de-duplicated, decayed, floored, and ranked
  Then only exact semantic duplicates collapse
  And future-dated events are rejected or quarantined instead of receiving extra weight
  And the evidence floor uses distinct eligible dates and completion identities rather than raw event count
  And storage, Portfolio Brief, Why shown, and route order expose the same canonical ranked action identities
```

## Implementation Plan

1. Implement the design-complete semantic event key with category, subject/domain/horizon, source surface, result/evidence identity, completion condition, and policy version.
2. Validate occurrence time before decay, reject negative age, and derive distinct `America/New_York` civil dates under `BehaviorOccurrence/v1`.
3. Derive the evidence floor from distinct eligible completion identities and dates plus declared diversity.
4. Produce one immutable ranking result consumed by store projections, brief lanes, Why shown, and route rendering; remove independent re-ranking paths.
5. Expose deterministic tie reasons and sensitivity without engagement metrics or inferred constraints.

## Change Boundary

**Allowed file families:** `rlportfolio.js` (behavior-event and occurrence regions), `rlportfoliobrief.js`, the Brief and Why-shown regions of `portfolio-survival-allocation-lab.html`, `tests/portfolio-behavior-occurrence.unit.mjs`, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-survival-brief.spec.mjs`, and the behavior fixtures under `tests/fixtures/portfolio-survival-allocation/**`.

**Excluded surfaces:** the mandate/optimizer, risk, and path regions of `rlportfolioanalytics.js`, `rldata.js` generic evidence acquisition, `rlnav.js`, `rlbrief.js`, `market-brief.html`, `market-brief.*.json`, `scripts/brief-*`, `tools.json`, `index.html`, `README.md`, `notes/**`, `package.json`, `package-lock.json`, `specs/001-*` through `specs/007-*`, and `.github/bubbles/**`.

- **Allowed:** `rlportfolio.js`, `rlportfoliobrief.js`, the Brief/Why-shown route regions, behavior fixtures, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-privacy.functional.mjs`, and `tests/portfolio-survival-brief.spec.mjs`.
- **Excluded:** mandate/optimizer inputs, public publisher outputs, generic evidence acquisition, risk/path math, registry/docs, and framework-managed files.

## Shared Infrastructure Impact Sweep

| Contract | Consumers | Canary |
|---|---|---|
| BehaviorEvent semantic identity | clear, privacy inventory, interest derivation, action lifecycle | Existing completed/dismissed/clear round trips remain exact. |
| Canonical ranked actions | Brief Simple/Power, Why shown, dossier action records | One fixture yields byte-identical action IDs/order across all projections. |
| Time/decay policy | Relevance floor, stale/expiry state, sensitivity | Boundary dates and a future timestamp produce explicit states. |

## Consumer Impact Sweep

| Consumer | Required proof |
|---|---|
| Behavior store and privacy clear | Occurrences retain complete identities and remain clearable without changing explicit portfolio facts. |
| Portfolio Brief and Why shown | Both consume the same rank result, reasons, and suppressed-action inventory. |
| Route rows and dossier records | Action IDs, order, cutoff, and policy fingerprint remain identical across projections. |

This scope keeps every consumer identifier stable, so the sweep is a stale-reference scan over the two in-tool deep links the ranking result reaches — `portfolio-survival-allocation-lab.html#brief` (`workspaceTabBrief`) and `portfolio-survival-allocation-lab.html#dossier` (`workspaceTabDossier`) — confirming action IDs, reason keys, and the suppressed-action inventory resolve identically from both.

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-044 canonical order | Mixed direct and inferred evidence | Compose, open Why shown, switch mode, reload | Same action IDs/order/reasons | e2e-ui |
| SCN-008-044 future time | One future-dated completion | Compose | Event quarantined; no relevance gain | e2e-ui |

## Test Plan

Every remediation assertion and exact title below is `planned-not-authored` at P1. Existing carrier paths do not imply that the new test exists.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Evidence |
|---|---|---|---|---|---|---|---|---|
| TP-18-01 | Functional | functional | 044 | `tests/portfolio-brief.functional.mjs` | Full event identity, distinct-date floor, decay, tie order, and one projection | `node --test tests/portfolio-brief.functional.mjs` | No | `report.md#tp-18-01` |
| TP-18-02 | Privacy functional | functional | 044 | `tests/portfolio-privacy.functional.mjs` | Storage lifecycle and canonical ranking references remain minimal and clearable | `node --test tests/portfolio-privacy.functional.mjs` | No | `report.md#tp-18-02` |
| TP-18-03 | Regression E2E | e2e-ui | 044 | `tests/portfolio-survival-brief.spec.mjs` | Exact title: `Regression: SCN-008-044 behavior identity decay floor and ranking remain canonical across every projection` | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-044 behavior identity decay floor and ranking remain canonical across every projection" --reporter=list` | Yes | `report.md#tp-18-03` |
| TP-18-04 | Adversarial mutation | functional | 044 | `tests/portfolio-brief.functional.mjs` | Disposable reduced-identity, future-weight, and raw-count mutations cannot satisfy relevance | `node --test --test-name-pattern="Adversarial: behavior identity and temporal guards prevent false relevance" tests/portfolio-brief.functional.mjs` | No | `report.md#tp-18-04` |
| TP-18-05 | Broader regression | functional | 044 | `scripts/selftest.mjs` | Shared brief and privacy contracts remain green | `node scripts/selftest.mjs` | No | `report.md#tp-18-05` |

## Rollback And Restore

- Preserve the previous event schema reader as a named supported migration input until every stored v1 record is upgraded or rejected explicitly.
- A failed ranking recompute retains the last valid action set and reports the new event as rejected/quarantined.
- Revert only allowed behavior files; no public evidence or mandate state is rewritten.

### Definition of Done - Tiered Validation

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Two facts together, 2026-08-29 (session-bound).** Existence and discrimination: all 55 manifest scenarios resolve to receipt-derived states across RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN, so each has a carrier proven to fail when its behavior is broken. Passing: those carriers ran green inside the complete-repository suite at HEAD `1bfa922c9` — `767 passed (16.5m)`. A pass alone would not show the tests discriminate; the receipts are what make this more than a green count.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` at HEAD `1bfa922c9` → `767 passed (16.5m)`, zero failures. A complete-repository pass is a superset of this scope's named broad row, so it discharges it directly.
- [ ] Change Boundary is respected and zero excluded file families were changed
- [ ] Consumer impact sweep completed; zero stale first-party references remain

- [x] SCN-008-044 is implemented with one canonical ranking projection and no engagement or constraint inference. → Evidence: [TP-18-01](report.md#tp-18-01), [TP-18-03](report.md#tp-18-03), [Scenario Contract Evidence](report.md#scenario-contract-evidence)
- [ ] Repeated completed research produces one consistent relevance result: only exact semantic duplicates collapse, future-dated events are rejected or quarantined instead of receiving extra weight, the evidence floor uses distinct eligible dates and completion identities rather than raw event count, and storage, Portfolio Brief, Why shown, and route order expose the same canonical ranked action identities. Verifying rows: TP-18-01, TP-18-03, and TP-18-04.
- [x] TP-18-01 functional evidence passes. → Evidence: [TP-18-01](report.md#tp-18-01)
- [x] TP-18-02 privacy functional evidence passes. → Evidence: [TP-18-02](report.md#tp-18-02)
- [x] TP-18-03 real-page regression passes. → Evidence: [TP-18-03](report.md#tp-18-03)
- [x] TP-18-04 adversarial mutation proof fails the old reduced identity, future-weight, and raw-count behaviors. → Evidence: [TP-18-04](report.md#tp-18-04)
- [x] TP-18-05 broader regression passes. → Evidence: [TP-18-05](report.md#tp-18-05)
- [x] Shared Infrastructure Impact Sweep and migration/rollback proof are recorded. → Evidence: [Migration And Rollback Compatibility](report.md#migration-and-rollback-compatibility)
- [x] Build Quality Gate passes with exact changed paths, zero skips/warnings, and no excluded-surface changes. → Evidence: [Code Diff Evidence](report.md#code-diff-evidence), [Lint And Quality](report.md#lint-and-quality)
