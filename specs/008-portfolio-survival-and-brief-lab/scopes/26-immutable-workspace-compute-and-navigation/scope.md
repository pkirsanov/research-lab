# Scope 26: Immutable Workspace Compute And Navigation

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** Not Started
**Scope-Kind:** runtime-behavior
**Tags:** `integration:workspace`, `remediation`
**Depends On:** 25
**Entry Gate:** Every scope in `Depends On` must be Done.
**Finding:** F008-COMPUTE-NAV-001
**Requirements:** FR-067, FR-154; NFR-002, NFR-012, NFR-013.

## Outcome

Make `computeWorkspace` the sole orchestrator, publish one immutable view model under token/rebase control, and implement cross-page ReturnContext ownership with a visible return strip and restored focus.

## Gherkin Scenario And Ownership

### SCN-008-052: One workspace compute survives navigation and supersession

```gherkin
Scenario: A user switches modes tabs and owning tools while a newer workspace compute completes
  Given one active immutable workspace view model and one later draft identity exist
  When the user switches Simple and Power changes tabs starts a rebase opens an owning tool and returns
  Then mode and tab navigation render the active view model without recomputing analytics
  And only the newest matching compute token may publish while last-valid results remain visible
  And an explicit rebase atomically replaces every sibling projection under one identity
  And ReturnContext is consumed by the owning destination and renders a visible From Portfolio Brief return strip
  And returning restores the original action disclosure and keyboard focus without private URL or public read data
```

## Implementation Plan

1. Implement `computeWorkspace(context, evidence, policy)` as the only orchestration compute returning frozen identity, brief, risk, paths, dependence, allocation, and dossier projections.
2. Maintain `activeIdentity`, `activeViewModel`, `draftIdentity`, `computeToken`, cancellation state, and `lastValidViewModel`; reject obsolete async/chunk results.
3. Make mode/tab/lens/filter navigation presentation-only; no acquisition or analytics recompute.
4. Implement explicit new-evidence/draft rebase preview and atomic acceptance across all sibling tabs.
5. Complete `ReturnContext/v1` write/consume validation, destination/expiry checks, `rlnav.js` consumer strip, browser Back/fallback, disclosure/focus restore, and no-referrer/private URL boundary.
6. Render a visible context/read summary from the owning tool before explicit review completion; same-page assertions alone do not satisfy owner-return proof.

## Change Boundary

- **Allowed:** controller/navigation regions of `portfolio-survival-allocation-lab.html`, additive strict `rlnav.js` ReturnContext consumer, `rlportfolio.js` handoff helpers, workspace fixtures, focused workspace functional tests, Feature 008 brief/mobile browser tests, and named existing-consumer navigation canaries.
- **Excluded:** analytics formulas, behavior ranking, public publisher, provider credentials, global `rlnav` behavior unrelated to strict ReturnContext, registry/docs, and framework-managed files.

## Shared Infrastructure Impact Sweep

| Protected surface | Blast radius | Independent canary |
|---|---|---|
| Route controller compute lifecycle | All six tabs and editors | Mode/tab operations do not call compute/acquire; stale token cannot publish. |
| `rlnav.js` shared shell | Every registered tool | Ordinary navigation and no-context pages remain unchanged. |
| ReturnContext session storage | Portfolio and owning tools | Wrong destination/expired/malformed records are ignored and consumed safely. |
| Browser history/focus | Deep links and Back | Public hashes only; action/disclosure/focus restore exactly. |

## Consumer Impact Sweep

| Consumer | Required proof |
|---|---|
| Portfolio Brief action rows | Write fixed destination plus session context; no private URL fields. |
| Six sibling hashes | Render one active identity and maintain browser history. |
| Owning Research Lab tools | `rlnav.js` displays and consumes only matching ReturnContext. |
| Shared navigation without context | No strip, no storage allocation, no focus mutation. |
| Tests/docs/deep links | Zero stale `#workspace`; canonical feature entry is `#brief`. |

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-052 presentation | Active result | Switch modes and all tabs | No compute/refetch; same identity/conclusion | e2e-ui |
| SCN-008-052 supersession | Slow old job, fast new job | Edit, rebase, finish old last | New token only; last valid visible throughout | e2e-ui |
| SCN-008-052 owner return | Brief action with owner route | Open owner, inspect strip, return | Visible context and restored row/disclosure/focus | e2e-ui |

## Test Plan

Every remediation assertion and exact title below is `planned-not-authored` at P1. Existing carrier paths do not imply that the new test exists.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Evidence |
|---|---|---|---|---|---|---|---|---|
| TP-26-01 | Functional | functional | 052 | `tests/portfolio-workspace.functional.mjs` | One compute, token/cancel/last-valid/rebase, immutable projections, and no mode/tab recompute | `node --test tests/portfolio-workspace.functional.mjs` | No | `report.md#tp-26-01` |
| TP-26-02 | ReturnContext functional | functional | 052 | `tests/portfolio-privacy.functional.mjs` | Strict write/consume/destination/expiry/private-field contract | `node --test tests/portfolio-privacy.functional.mjs` | No | `report.md#tp-26-02` |
| TP-26-03 | Regression E2E | e2e-ui | 052 | `tests/portfolio-survival-brief.spec.mjs` | Exact title: `Regression: SCN-008-052 mode tabs rebase and compute tokens preserve one immutable workspace` | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-052 mode tabs rebase and compute tokens preserve one immutable workspace" --reporter=list` | Yes | `report.md#tp-26-03` |
| TP-26-04 | Owner-return E2E | e2e-ui | 052 | `tests/portfolio-survival-mobile.spec.mjs` | Exact title: `Regression: SCN-008-052 owning tool consumes ReturnContext and restores Portfolio Brief focus` | `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-052 owning tool consumes ReturnContext and restores Portfolio Brief focus" --reporter=list` | Yes | `report.md#tp-26-04` |
| TP-26-05 | Adversarial mutation | functional | 052 | `tests/portfolio-workspace.functional.mjs` | Disposable recompute, stale-publish, partial-rebase, same-page-return, and private-URL mutations each fail | `node --test --test-name-pattern="Adversarial: recomputing navigation stale publication and fake return context cannot pass" tests/portfolio-workspace.functional.mjs` | No | `report.md#tp-26-05` |
| TP-26-06 | Shared-shell canary | e2e-ui | 052 | Named existing consumer files from the Scope 16 command catalog | Shared navigation consumers remain green | `npx --no-install playwright test tests/causal-rotation-lab.spec.mjs tests/bond-regime-lab.spec.mjs tests/fx-regime-relative-value-lab.spec.mjs tests/palm-springs-rental-market-lab.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-26-06` |

## Rollback And Restore

- Preserve the active view model until a matching rebase validates; cancellation or navigation never clears it.
- Add `rlnav.js` behavior behind strict context validation so reverting the additive branch restores prior shared navigation.
- Revert controller/handoff/test changes together and clear only malformed test contexts, never user personal state.

### Definition of Done - Tiered Validation

- [ ] SCN-008-052 is implemented with one compute, token/last-valid/rebase safety, visible owner-return strip, and exact focus restoration.
- [ ] TP-26-01 workspace functional evidence passes.
- [ ] TP-26-02 ReturnContext functional evidence passes.
- [ ] TP-26-03 one-compute/rebase real-page regression passes.
- [ ] TP-26-04 owner-return real-page regression passes on the owning page and return page.
- [ ] TP-26-05 adversarial mutation proof rejects every audited compute or navigation shortcut.
- [ ] TP-26-06 shared-shell consumer canary passes.
- [ ] Consumer/Shared Infrastructure Impact Sweeps and rollback proof are recorded.
- [ ] Build Quality Gate passes with zero skips/warnings and no excluded-file changes.
