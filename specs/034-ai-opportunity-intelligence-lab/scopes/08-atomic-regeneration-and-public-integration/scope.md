# Scope 8 — Atomic regeneration and public integration

Scope ID: `08-atomic-regeneration-and-public-integration`
**Status:** Not Started
Scope-Kind: runtime-behavior
Depends On: `07-static-owner-experience`

## Outcome And Requirements

Regenerate selected research on scheduled/on-demand Brief creation, publish one immutable full-universe generation and owner read, validate the matching Brief, and advance the current selector last. Register the public tool and Pages bundle. FR-034-083–091, 065, 086, 100, 102, 104–106; integration of SCN-034-003–004, 018, 020, 031–032; NFR-034-004, 008–011.

## Gherkin

```gherkin
Scenario: SCN-034-032 Views cannot mix research generations
  Given Simple, Power, Brief, and Journey are open for one company
  When their generation identities are compared
  Then all four identify the same current generation
  And a stale view refuses to present itself as current
```

## Repeated Integration Coverage

Scope 8 owns `SCN-034-032` as defined above. It does not redefine ownership of the five scenarios below; it repeats them at the publication boundary through directly labeled Test Plan rows.

| Scenario ID | Given at the integration boundary | When | Then |
| --- | --- | --- | --- |
| SCN-034-003 | A committed full-universe predecessor and selected source checks | Scheduled Brief regeneration publishes validated selected records | All unselected identities remain accounted for with prior review dates |
| SCN-034-004 | One selected source fails during scheduled regeneration | The publication candidate is validated | The identity remains in the full universe and the named failure appears in the current generation and Brief |
| SCN-034-031 | One Brief horizon has no qualified signal | The generation and six-section Brief validate together | The named empty state publishes with coverage and abstentions |
| SCN-034-018 | A qualified realization signal belongs to the candidate generation | The public Brief and owner read render | Both expose the same signal, period, falsifier, and evidence references |
| SCN-034-020 | A qualified owner signal has an unavailable or refusing destination | The public Brief and owner read render | Refusal stays visible without removing the signal or claiming external delivery or trade action |

## Implementation Plan

1. Connect `scripts/ai-opportunity-refresh.mjs` to the existing scheduled and on-demand Brief trigger before final authorship. Both paths pass declared selection, source plan and frozen cutoff; source/calendar freshness runs every generation, and each requested source records exactly one terminal state: `retrieved`, `unchanged-row`, `unavailable`, `refused`, or `not-due`.
2. Build source-qualified `tool-model-read/v1` and deterministic `ai-opportunity-brief/v1` from one candidate. Feed the actual owner read through existing Brief author/validator contracts without granting recommendation authority.
3. Use task-owned private staging, byte inventory/readback, immutable objects first, owner read/Brief next, and `data/ai-opportunity/current.json` plus matching browser projection last. Retry exact request idempotently; different bytes collide. Preserve prior pointer after any refusal and reconcile uncertain remote acknowledgment before a new run.
4. Treat Feature 032 Scope 5 as independent work on overlapping shared registration surfaces, not an implementation prerequisite. Immediately before editing, re-read its state and the current shared bytes; serialize or merge any overlapping edits. Then add Feature 034's exact tool entry/deep-links across `tools.json`, `index.html`, `rlnav.js`, `journeys.json`, Pages builder/allowlist and notes. Sweep consumers for stale links/IDs; keep existing Company Intelligence and Research Agenda behavior unchanged.
5. Treat shared Brief scheduler, registry, publication and Pages surfaces as protected: capture baseline/blast-radius inventory, run independent Research Agenda and Company Intelligence canaries, prove rollback/restoration, then run full relevant regression suites.
6. Add domain SST correspondence for universe, evidence, generation, signal and immutable forecast. Keep Feature 028 row correction and Feature 020 destination gates out of this change boundary.

## Test Plan

| ID | Type | Scenario ID | Persistent File and Exact Title | Command | Live system |
| --- | --- | --- | --- | --- | --- |
| TP-08-01 | integration | SCN-034-003 | `tests/ai-opportunity-publication.integration.mjs` — `scheduled publication overlays selected records without shrinking the universe` | `node --test tests/ai-opportunity-publication.integration.mjs` | Yes, real publication stage in disposable checkout |
| TP-08-02 | e2e-api | SCN-034-004 | `tests/ai-opportunity-publication.e2e.mjs` — `Regression: failed selected source remains visible and preserves full-universe history` | `node --test tests/ai-opportunity-publication.e2e.mjs` | Yes, real transaction and disposable Git checkout |
| TP-08-03 | functional | SCN-034-031 | `tests/ai-opportunity-publication.functional.mjs` — `validated Brief publishes named empty horizon with coverage and abstentions` | `node --test tests/ai-opportunity-publication.functional.mjs` | Yes, real Brief and generation validators |
| TP-08-04 | e2e-ui | SCN-034-032 | `tests/ai-opportunity-publication.spec.mjs` — `Regression: published Simple Power Brief and Journey share one current generation and stale views refuse` | `npx --no-install playwright test tests/ai-opportunity-publication.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes, real built Pages/static site |
| TP-08-05 | e2e-api | SCN-034-018 | `tests/ai-opportunity-notice-publication.e2e.mjs` — `Regression: owner read and Brief publish the same qualified realization notice` | `node --test tests/ai-opportunity-notice-publication.e2e.mjs` | Yes, real publication transaction and owner projections |
| TP-08-06 | functional | SCN-034-020 | `tests/ai-opportunity-registry.functional.mjs` — `destination refusal remains visible while shared registry canaries pass` | `node --test tests/ai-opportunity-registry.functional.mjs` | Yes, checked-in registry and real shared validators |

### Definition of Done

- [ ] SCN-034-003 repeated integration coverage is verified without creating a second scenario definition.
- [ ] SCN-034-004 repeated integration coverage is verified without creating a second scenario definition.
- [ ] SCN-034-031 repeated integration coverage is verified without creating a second scenario definition.
- [ ] SCN-034-032: Views cannot mix research generations is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-018 repeated integration coverage is verified without creating a second scenario definition.
- [ ] SCN-034-020 repeated integration coverage is verified without creating a second scenario definition.
- [ ] TP-08-01 passes with scheduled overlay, current-source freshness, and full-universe evidence.
- [ ] TP-08-02 passes with failed identity retention and full-universe history evidence.
- [ ] TP-08-03 passes with named empty-state, coverage, and abstention evidence.
- [ ] TP-08-04 passes against built public files with pointer-last rollback and visible generation agreement.
- [ ] TP-08-05 passes with owner-read and Brief notice identity evidence.
- [ ] TP-08-06 passes with destination-refusal, Research Agenda, Company Intelligence, and consumer canary evidence.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass.
- [ ] Broader E2E regression suite passes.
- [ ] Build quality gate: `node scripts/selftest.mjs`, `node scripts/validate-brief-payload.mjs`, `node scripts/build-pages-site.mjs`, applicable Node/browser suites, artifact lint, registry parity, SST correspondence, source-rights/privacy and docs pass with raw output. Shared-path consumer sweep finds no stale first-party IDs. No external delivery or trading claim is made.

No prior scope may be silently edited to make this integration green. Route any foreign-artifact defect to its owner and keep this scope Not Started or In Progress until the full finding set closes.
