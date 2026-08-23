# Scope 25: Decision-Time Dossier And Immutable Audit

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** Done
**Scope-Kind:** runtime-behavior
**Tags:** `overlay:dossier`, `remediation`
**Depends On:** 24
**Entry Gate:** Every scope in `Depends On` must be Done.
**Finding:** F008-DOSSIER-001
**Requirements:** FR-142 through FR-150; NFR-009, NFR-023.

## Outcome

Make the dossier a durable append-oriented audit of decision-time fitting, rebalance application, embargo, complete costs, tried variants, result states, corrections, and explicit private export.

## Gherkin Scenario And Ownership

### SCN-008-051: Walk-forward records are decision-time complete and append-only

```gherkin
Scenario: A user audits and corrects a cost-aware walk-forward allocation dossier
  Given explicit decision dates rebalance dates embargo cost components source vintages and tried variant identities exist
  When walk-forward evaluation fits only decision-time evidence and the user appends a correction
  Then in-sample out-of-sample stress gross net not-evaluated infeasible and unavailable states remain distinct
  And commission spread slippage turnover financing carry and rebalance timing are itemized or net remains unavailable
  And every tried method parameter sample stress view and hedge ratio is counted
  And the correction supersedes without rewriting the prior record
  And reload and explicit private export preserve identities provenance invalidation and privacy warnings
```

## Implementation Plan

1. Implement `DecisionFold/v1` training, decision, embargo, rebalance, and application windows under decision-time evidence rules.
2. Separate in-sample, walk-forward/OOS, stress, gross, net, not-evaluated, infeasible, and unavailable result records.
3. Require complete commission/spread/slippage/turnover/financing/carry/rebalance timing for net claims; otherwise retain gross-only.
4. Record every method/parameter/sample/stress/view/hedge trial and disclose survivorship, stale classification, selection, look-ahead, and data availability.
5. Persist `ResearchDossier/v1` through versioned atomic slots with append/supersede corrections and exact result/source identities.
6. Implement previewed user-selected private export with secret rejection and no upload/public URL.

## Change Boundary

- **Allowed:** walk-forward/dossier portions of `rlportfolioanalytics.js` and `rlportfolio.js`, Dossier route regions, dossier fixtures, `tests/portfolio-allocation.functional.mjs`, a focused dossier functional carrier, and `tests/portfolio-survival-allocation.spec.mjs`.
- **Excluded:** public publisher, behavior ranking, core path generation, dependence/hedge calculations except typed results, allocation solver math except typed results, registry/docs, and framework-managed files.

## Shared Infrastructure Impact Sweep

| Contract | Consumers | Canary |
|---|---|---|
| Dossier storage/corrections | Privacy clear, export, reload, route | Prior record hash remains readable after correction/reload. |
| Walk-forward clock | Allocation validation and claims | No post-decision observation enters fitting; rebalance starts later. |
| Cost/trial ledger | Net claims and selection-bias copy | Missing component blocks net; each inspected variant increments once. |
| Private export | Auditor workflow | Preview equals selected exported fields; no secret/public request. |

## Consumer Impact Sweep

| Consumer | Required proof |
|---|---|
| Dossier route and reload | The complete hash chain preserves every prior record, correction, state, and active head. |
| Privacy clear and private export | Dossier state remains clearable, previewed, user-selected, local, and absent from public surfaces. |
| Allocation, stress, view, and hedge trials | Every inspected variant enters the ledger exactly once with decision-time provenance. |

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-051 walk-forward | Decision/rebalance/embargo fixture | Run and inspect dossier | Exact train/apply windows and state separation | e2e-ui |
| SCN-008-051 correction | Existing persisted dossier | Append correction and reload | Prior/current linked; no rewrite | e2e-ui |
| SCN-008-051 export | Dossier with personal fields | Preview and export selected fields | Private warning, exact selection, no network | e2e-ui |

## Test Plan

Every remediation assertion and exact title below is `planned-not-authored` at P1. Existing carrier paths do not imply that the new test exists.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Evidence |
|---|---|---|---|---|---|---|---|---|
| TP-25-01 | Unit/functional | functional | 051 | `tests/portfolio-allocation.functional.mjs` | Decision-time windows, rebalance, embargo, costs, trials, states, corrections and persistence | `node --test tests/portfolio-allocation.functional.mjs` | No | `report.md#tp-25-01` |
| TP-25-02 | Dossier functional | functional | 051 | `tests/portfolio-dossier.functional.mjs` | Reload, supersession, correction, private export, and clear interaction | `node --test tests/portfolio-dossier.functional.mjs` | No | `report.md#tp-25-02` |
| TP-25-03 | Regression E2E | e2e-ui | 051 | `tests/portfolio-survival-allocation.spec.mjs` | Exact title: `Regression: SCN-008-051 dossier preserves decision time costs trials corrections reload and private export` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-051 dossier preserves decision time costs trials corrections reload and private export" --reporter=list` | Yes | `report.md#tp-25-03` |
| TP-25-04 | Adversarial mutation | functional | 051 | `tests/portfolio-dossier.functional.mjs` | Disposable look-ahead, missing-window, false-net, uncounted-trial, in-place-correction, and volatile-export mutations each fail | `node --test --test-name-pattern="Adversarial: incomplete walk forward and mutable dossier records cannot satisfy the audit contract" tests/portfolio-dossier.functional.mjs` | No | `report.md#tp-25-04` |
| TP-25-05 | Broader regression | functional | 051 | `scripts/selftest.mjs` | Shared storage, analytics, and static-site invariants remain green | `node scripts/selftest.mjs` | No | `report.md#tp-25-05` |

## Rollback And Restore

- Persist new records under a new contract identity; never migrate by rewriting an existing dossier in place.
- A failed correction/export retains prior dossier and selected export preview in memory with an explicit failure state.
- Revert dossier/walk-forward files and tests while leaving existing local records inert and readable only by a compatible contract.

### Definition of Done - Tiered Validation

- [x] SCN-008-051 is implemented with decision-time walk-forward, complete cost/trial/state records, append corrections, persistence, and private export. Evidence: [scenario contract](report.md#scenario-contract-evidence), [coverage](report.md#coverage-report), and [real-page behavior](report.md#tp-25-03).
- [x] TP-25-01 allocation functional evidence passes. Evidence: [TP-25-01](report.md#tp-25-01).
- [x] TP-25-02 dossier functional evidence passes. Evidence: [TP-25-02](report.md#tp-25-02).
- [x] TP-25-03 real-page regression passes. Evidence: [TP-25-03](report.md#tp-25-03).
- [x] TP-25-04 adversarial mutation proof rejects every audited incomplete or mutable behavior. Evidence: [TP-25-04](report.md#tp-25-04) and [audited mutations](report.md#shared-infrastructure-and-rollback-evidence).
- [x] TP-25-05 broader regression passes. Evidence: [TP-25-05](report.md#tp-25-05).
- [x] Shared Infrastructure Impact Sweep and immutable rollback proof are recorded. Evidence: [shared infrastructure and rollback](report.md#shared-infrastructure-and-rollback-evidence) and [privacy clear canary](report.md#privacy-and-clear-canary).
- [x] Build Quality Gate passes with zero skips/warnings and no excluded-file changes. Evidence: [build quality gate](report.md#build-quality-gate--current-session-2026-08-23), [lint and quality](report.md#lint-and-quality), and [bounded code diff](report.md#code-diff-evidence).
