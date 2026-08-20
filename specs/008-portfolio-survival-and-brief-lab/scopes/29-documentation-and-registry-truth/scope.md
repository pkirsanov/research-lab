# Scope 29: Documentation And Registry Truth

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** Not Started
**Scope-Kind:** runtime-behavior
**Tags:** `docs-integration`, `remediation`
**Depends On:** 28
**Entry Gate:** Every scope in `Depends On` must be Done.
**Finding:** F008-DOC-INTEGRATION-001
**Finding Owner:** `/bubbles.docs`
**Requirements:** NFR-026.

## Outcome

Make the note, tool registry, landing inventory, navigation, and README route to the real `#brief` workspace and describe only behavior proved by the repaired implementation and current tests.

## Gherkin Scenario And Ownership

### SCN-008-055: Published Feature 008 guidance matches the executable route

```gherkin
Scenario: A reader opens Feature 008 from every published repository surface
  Given the repaired implementation and Scope 28 evidence are current
  When the reader follows the note tools registry landing page navigation and README links
  Then every entry opens portfolio-survival-allocation-lab.html#brief
  And one-compute stress appraisal hedge allocation dossier accessibility and privacy claims match executable states and limits
  And no source describes the former #workspace hash or a reduced behavior as complete
```

## Implementation Plan

1. Correct `#workspace` to `#brief` across the canonical note and registry/inventory consumers.
2. Reconcile one-compute, stress/appraisal, hedge, allocation, dossier, accessibility, and clear claims to Scope 17-28 executable evidence.
3. Keep methodology, unavailable states, privacy boundary, research-only/no-execution language, and exact validation commands accurate.
4. Update `tools.json`, `index.html`, `rlnav.js`, README, and the note as one registry transaction only where their current claim/link fields require it.
5. Add a claim/link parity test and run the real route from each published entry.

## Change Boundary

- **Allowed:** `notes/portfolio-survival-allocation-lab.md`, the Feature 008 entries in `tools.json`, `index.html`, `rlnav.js`, and `README.md`, plus the focused docs integration test.
- **Excluded:** production analytics/store/brief/controller code, generic Market Brief artifacts, unrelated tool entries/docs, test expectations outside the focused carrier, specs except this scope report, and framework-managed files.

## Consumer Impact Sweep

| Consumer | Required update/proof |
|---|---|
| Canonical Feature 008 note | `#brief`, complete method/state/privacy truth, exact commands. |
| `tools.json` | Route/hash and description match executable first screen. |
| `index.html` | Landing link and capability copy match `tools.json`. |
| `rlnav.js` | Navigation target matches tool registry and ReturnContext consumer. |
| `README.md` | Inventory claim is evidence-bounded and links to the real workspace. |
| Tests/search | Zero stale `#workspace` or superseded capability claim remains in active surfaces. |

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-055 entry links | Current registry/note/README | Open each Feature 008 link | Route opens `#brief` and default Brief panel | e2e-ui |
| SCN-008-055 claims | Scope 28 evidence current | Compare note/inventory copy with route states | No overclaim; unavailable/partial behavior preserved | functional |

## Test Plan

Every remediation assertion and exact title below is `planned-not-authored` at P1. Existing carrier paths do not imply that the new test exists.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Evidence |
|---|---|---|---|---|---|---|---|---|
| TP-29-01 | Docs integration | functional | 055 | `tests/portfolio-doc-integration.functional.mjs` | Registry/link/claim parity and stale-reference scan | `node --test tests/portfolio-doc-integration.functional.mjs` | No | `report.md#tp-29-01` |
| TP-29-02 | Entry-route E2E | e2e-ui | 055 | `tests/portfolio-survival-brief.spec.mjs` | Exact title: `Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace` | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace" --reporter=list` | Yes | `report.md#tp-29-02` |
| TP-29-03 | Registry/selftest | functional | 055 | `scripts/selftest.mjs` | Registry/navigation/landing parity and repository invariants | `node scripts/selftest.mjs` | No | `report.md#tp-29-03` |
| TP-29-04 | Test-file reachability | functional | 055 | `scripts/validate-test-file-reachability.mjs` | Every referenced focused test file/title remains reachable | `node scripts/validate-test-file-reachability.mjs` | No | `report.md#tp-29-04` |
| TP-29-05 | Adversarial mutation | functional | 055 | `tests/portfolio-doc-integration.functional.mjs` | Disposable stale-hash and overclaim mutations fail publication truth | `node --test --test-name-pattern="Adversarial: stale workspace hashes and overclaims fail Feature 008 publication truth" tests/portfolio-doc-integration.functional.mjs` | No | `report.md#tp-29-05` |

## Rollback And Restore

- Treat the registry/note/README changes as one reversible transaction.
- A broken link or unsupported claim restores the prior published entries while the product route remains directly accessible.
- Rollback does not touch browser personal data, generic brief artifacts, or completed remediation evidence.

### Definition of Done - Tiered Validation

- [ ] SCN-008-055 is implemented with `#brief` parity and evidence-bounded claims across every named consumer.
- [ ] TP-29-01 docs integration evidence passes.
- [ ] TP-29-02 real-page entry-route regression passes.
- [ ] TP-29-03 registry/selftest evidence passes.
- [ ] TP-29-04 reachability evidence passes.
- [ ] TP-29-05 adversarial mutation proof rejects a stale hash and an unsupported complete-capability claim.
- [ ] Consumer Impact Sweep and registry rollback proof are recorded with zero stale references.
- [ ] Build Quality Gate passes with zero skips/warnings, exact changed paths, and no excluded-file changes.
