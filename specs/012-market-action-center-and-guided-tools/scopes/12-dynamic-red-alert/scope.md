# Scope 12: Dynamic Red Alert And Latent-Risk Journey

## 12-dynamic-red-alert

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `vertical-slice:true`, `dynamic-discovery:true`, `no-alarmism:true`

Depends On: 08-journey-runtime-definitions, 10-bounded-web-evidence-acquisition

Scope 11 is not a numbered dependency; deterministic fixture/local qualification may proceed while live publication remains gated by Feature 002.

**Primary Outcome:** Current public owner anomalies, not named topics, produce candidate clusters and bounded evidence plans. Only candidates clearing independent-source, observable-market, completeness, conflict, cutoff, severity, likelihood, and explainable-score gates become visible Red Alerts. Lifecycle/history, valid empty state, and latent-risk Journey are complete; live web/public generation activates only through the existing Feature 002 gate.

## Requirement Coverage

- **Functional:** FR-087 through FR-098 and latent-risk portions of FR-099 through FR-102.
- **Non-functional:** NFR-001 through NFR-004, NFR-006 through NFR-018.
- **Acceptance:** SCN-012-023, SCN-012-024, and SCN-012-025.

## Gherkin Scenarios

### SCN-012-023 - Red Alert qualifies dynamically

```gherkin
Scenario: SCN-012-023 A latent threat emerges across multiple transmission channels
  Given dynamic discovery finds current independent citations
  And an owning tool shows observable market transmission evidence
  When candidate qualification runs
  Then a Red Alert appears with severity, likelihood, horizon, affected assets, propagation path, why-now, trigger, invalidation, and research steps
  And the threat was not required by a hardcoded candidate list
```

### SCN-012-024 - Alarmist candidate is rejected

```gherkin
Scenario: SCN-012-024 A dramatic threat narrative lacks corroboration or market evidence
  Given fewer than two independent current citations or no observable market evidence exists
  When Red Alert qualification runs
  Then no visible alert is published
  And the candidate consumes no alert slot
```

### SCN-012-025 - Empty Red Alert is valid

```gherkin
Scenario: SCN-012-025 No discovered candidate clears the alert threshold
  Given discovery coverage and cutoff are known
  When Red Alert renders
  Then it states that no current high-severity threat cleared the evidence bar
  And it does not pad the view with illustrative topics
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-023 qualified candidate | Dynamic anomaly fixture plus independently qualified bundle and owner transmission evidence | Open Red Alert, inspect fields/citations/owner, enter latent-risk Journey | One restrained full alert row shows all falsifiable fields and research verbs; no topic seed source or execute verb exists | e2e-ui |
| SCN-012-024 dramatic weak candidate | One origin or no owner transmission | Run qualification and open Red Alert | No visible dramatic title/row; safe rejection count/reason class only; no alert slot consumed | e2e-ui |
| SCN-012-025 no candidates | Known channel/owner coverage and cutoff with zero admitted candidates | Open Red Alert | Exact no-qualified-alert copy, cutoff, channels/owner coverage, and method link; no illustrative USD/JPY/credit/capex/war topic | e2e-ui |
| Lifecycle | Qualified alert gets changed evidence, acknowledgment, invalidation/resolution | Inspect updates/history | Append/supersede events retain original trigger/invalidation; present-tense state is honest | functional/e2e-ui |

## Implementation Files

### New

- `tests/red-alert.unit.mjs`
- `tests/red-alert.functional.mjs`
- `tests/red-alert.security.mjs`
- `tests/red-alert.spec.mjs`
- `tests/fixtures/feature-012/red-alert/**`

### Modified

- `rlmarketaction.js`
- `rljourney.js`
- `journeys.json`
- `market-brief.html`
- `market-brief.config.json`
- `scripts/validate-market-action.mjs`
- `scripts/validate-web-evidence.mjs`
- `scripts/selftest.mjs`

## Implementation Plan

1. Add exact anomaly seed, transmission channel, candidate, alert, score component, lifecycle event, and projection contracts. Channels are classification labels only; config has no named threat/entity/country/asset candidate list.
2. Derive seeds solely from current public owner anomaly records, cluster overlapping entities/channels/evidence, and create bounded public query plans through Scope 10. Fixture mode uses exact-format recorded public records through the same production code.
3. Implement claim graph and owner-transmission matching. Every material claim needs two independent current origins and at least one current owner market-evidence reference.
4. Implement all hard gates and exact configured explainable score weights/threshold/cap/staleness. The total is called an admission score, never probability/confidence/crash odds.
5. Reject conflicts that change thesis/severity/likelihood/trigger/invalidation; reject missing fields, stale/cutoff mismatch, score below threshold, or weak evidence. Rejected titles/text are not projected.
6. Implement semantic de-duplication and append-only discovered/evidence/qualified/rejected/acknowledged/monitoring/invalidated/resolved/stale lifecycle events; changed theses supersede instead of rewriting.
7. Render qualified rows, lifecycle/history disclosure, restrained severity text, propagation text equivalent, citations/owner evidence, research-only actions, and exact valid empty state. No flashing/pulse/alert role/execution command.
8. Complete the latent-risk Journey definition and evidence/decision-tree transitions through Scope 08 runtime; it may qualify or reject research, never publish/execute/mutate private scope.
9. Keep live acquisition/public Red Alert objects disabled until Feature 002 predicate and Scope 11 publication contract are true. Scope 12's fixture/local proof is not publication evidence.
10. Add static scans/mutations proving illustrative spec terms never enter runtime config/source/fixture seed lists and no minimum alert count forces output.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| WebEvidence | Scope 10 policy/origin/claim/safety remains authoritative | Re-run complete Scope 10 suite; Red Alert consumes frozen bundles only |
| Journey runtime | Latent-risk goal uses shared evidence completion/backtracking/packet | Scope 08 reducer/storage/no-execution regressions remain green |
| Market Action Center | Brief/Portfolio/Journey remain usable when Red Alert is empty/rejected | Center four-view and no-action/public-matrix regressions |
| Public publication | No Red Alert object enters current generation before Feature 002 gate | Pointer/public-tree hash unchanged in Scope 12 independent tests |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Excluded:** Feature 002 author/publication source, public current pointer/objects/history, Feature 008/private scope, `rldata.js`, provider keys/paths, owner formulas/pages, watchlist, option owner/data, QF, package/source-lock files, and framework-managed files.

**No topic hardcoding:** config/source/test production fixtures may encode observed entities needed to exercise a recorded case, but no named topic may be a required runtime candidate, seed catalog, privileged score, or minimum output. Adversarial tests must mutate observed conditions and prove the resulting thesis changes or disappears.

## Rollback

Unregister Red Alert discovery/projection and latent-risk Journey hooks, restore Center/config/validator hunks, retain prior append-only lifecycle objects if any as inert versioned evidence, and prove Brief/Portfolio/Journey and public pointer remain unchanged. Never rewrite/delete prior alerts/events or private/source data.

## Scenario-First RED/GREEN Contract

Write dynamic-seed, hard-gate, weak-candidate, empty-state, lifecycle, no-topic, and no-alarmism tests before implementation. A valid RED must fail the exact production qualification/projection behavior. A fixture with a pre-labeled expected alert is self-validating and forbidden; fixtures supply observations/sources, and production code must derive/qualify the result.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-12-01 | Unit | unit | SCN-012-023, SCN-012-024, SCN-012-025 | `tests/red-alert.unit.mjs` | Validate anomaly/candidate/alert contracts, score/hard gates, origin/owner requirements, de-duplication, lifecycle, empty projection, and exact errors | `node --test tests/red-alert.unit.mjs` | No | `report.md#tp-12-01` |
| TP-12-02 | Discovery/qualification functional | functional | SCN-012-023, SCN-012-024, SCN-012-025 | `tests/red-alert.functional.mjs` | Derive candidates from raw owner anomalies, consume frozen bundles, qualify/reject, append/supersede lifecycle, and build latent-risk Journey evidence | `node --test tests/red-alert.functional.mjs` | No | `report.md#tp-12-02` |
| TP-12-03 | Security/no-alarmism functional | functional | SCN-012-024, SCN-012-025 | `tests/red-alert.security.mjs` | Prove no named topic catalog/minimum count, reject conflict/stale/weak/missing fields, safe rejection projection, restrained copy, and zero execute/private/publication authority | `node --test tests/red-alert.security.mjs` | No | `report.md#tp-12-03` |
| TP-12-04 | Regression E2E | e2e-ui | SCN-012-023 | `tests/red-alert.spec.mjs` | `Regression: SCN-012-023 dynamic anomaly and corroborated transmission qualify a complete Red Alert` | `npx --no-install playwright test tests/red-alert.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-023 dynamic anomaly and corroborated transmission qualify a complete Red Alert" --reporter=list` | Yes | `report.md#scenario-scn-012-023` |
| TP-12-05 | Adversarial Regression E2E | e2e-ui | SCN-012-024 | `tests/red-alert.spec.mjs` | `Regression: SCN-012-024 dramatic uncorroborated candidate consumes no visible alert slot` | `npx --no-install playwright test tests/red-alert.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-024 dramatic uncorroborated candidate consumes no visible alert slot" --reporter=list` | Yes | `report.md#scenario-scn-012-024` |
| TP-12-06 | Regression E2E | e2e-ui | SCN-012-025 | `tests/red-alert.spec.mjs` | `Regression: SCN-012-025 no qualified candidate renders cutoff coverage and no illustrative topic` | `npx --no-install playwright test tests/red-alert.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-025 no qualified candidate renders cutoff coverage and no illustrative topic" --reporter=list` | Yes | `report.md#scenario-scn-012-025` |
| TP-12-07 | Journey/lifecycle E2E | e2e-ui | SCN-012-023, SCN-012-024 | `tests/red-alert.spec.mjs` | `Regression: latent-risk Journey preserves alert evidence can reject candidate and never executes or publishes` | `npx --no-install playwright test tests/red-alert.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: latent-risk Journey preserves alert evidence can reject candidate and never executes or publishes" --reporter=list` | Yes | `report.md#tp-12-07` |
| TP-12-08 | Broad regression | unit | SCN-012-023, SCN-012-024, SCN-012-025 | `scripts/selftest.mjs` | Preserve Center/WebEvidence/Journey/public-pointer invariants and add dynamic/no-topic/empty/lifecycle canaries | `node scripts/selftest.mjs` | No | `report.md#tp-12-08` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] Dynamic owner anomalies and frozen evidence, not named topics, produce candidates; every visible alert clears complete corroboration/market/field/conflict/cutoff/score gates.
- [ ] Weak/alarmist/conflicted/stale candidates consume no slot; valid empty state is complete and contains no padded example.
- [ ] Append/supersede lifecycle, restrained accessible UI, and latent-risk Journey preserve evidence/falsifiers/no-execution.
- [ ] Scope 12 makes no live-publication claim while Feature 002 is false and leaves public pointer/private scope unchanged.

#### Test Evidence Items - Exact Parity With 8 Test Plan Rows

- [ ] TP-12-01 unit evidence proves contracts, gates, score, lifecycle, de-duplication, and empty state.
- [ ] TP-12-02 functional evidence proves production discovery/qualification/lifecycle/Journey transformations from raw evidence.
- [ ] TP-12-03 security evidence proves no topic/minimum/alarmism/execute/private/publication bypass.
- [ ] TP-12-04 E2E evidence proves SCN-012-023 complete dynamic qualification.
- [ ] TP-12-05 adversarial E2E evidence proves SCN-012-024 weak dramatic rejection and zero slot.
- [ ] TP-12-06 E2E evidence proves SCN-012-025 honest empty state with coverage and no example.
- [ ] TP-12-07 E2E evidence proves latent-risk Journey/lifecycle and zero execution/publication.
- [ ] TP-12-08 broad selftest evidence proves existing Research Lab behavior remains green.

#### Build Quality Gate

- [ ] Scenario RED/GREEN, exact system-Chrome identity, no-interception scan, no-topic/minimum source scan, evidence/score/lifecycle mutation matrix, no-alarmism/accessibility checks, public-pointer/private sentinel hashes, Journey no-execution checks, protected-path diff, editor diagnostics, `git diff --check`, source-lock, WebEvidence/market-action validators, artifact lint, and broad selftest are current and clean.
