# Scope 1 — Preserving universe foundation

Scope ID: `01-preserving-universe-foundation`
**Status:** Not Started
Scope-Kind: runtime-behavior
Tags: `foundation:true`
Depends On: none

## Outcome And Requirements

Import a repo-local preserved archive into stable, effective-dated industry/entity/exposure/security/membership contracts. Refuse unexplained mutation or ambiguous identity. Preserve 23 industries, 230 memberships, 196 original entities, 197 assessments, ten active candidates per industry, and the Udemy/Skillsoft historical distinction. FR-034-001–016; NFR-034-001–004, 011–013.

## Gherkin

```gherkin
Scenario: SCN-034-001 Preserve the complete seed corpus
  Given the imported archive and reviewed identity map have valid byte fingerprints
  When an initial generation is created through the real importer
  Then 23 industries, 230 memberships, 196 original entities and 197 assessments are accounted for
  And every industry has ten active ranked exposures or an exact blocking coverage result

Scenario: SCN-034-002 Refuse changed history
  Given one archived historical artifact differs from its preservation fingerprint
  When the importer validates the candidate
  Then it names the artifact and refuses publication
  And the current selector remains unchanged
```

## Implementation Plan

1. Add reviewed archive manifest, import map, and versioned `data/ai-opportunity/` seed. Never mutate AIOpportunities source bytes or require its absolute path at runtime.
2. Add pure UMD `rlaiopportunity.js` exact-shape validators and canonical fingerprints. Model entities, business exposures, sites, securities, and effective-dated memberships separately.
3. Use archive byte SHA-256 and traversal-free paths. A merger or spin adds successors without rewriting predecessors. A private entity has no fabricated security.
4. Build the initial full-universe generation candidate and current-selector validator. Keep current pointer unchanged on any count, mapping, or hash refusal.
5. Add domain-model SST entities/invariants only within this scope's approved product boundary. Preserve existing tool registry until Scope 8.

## Test Plan

| ID | Type | Scenario ID | Persistent File and Exact Title | Command | Live system |
| --- | --- | --- | --- | --- | --- |
| TP-01-01 | functional | SCN-034-001 | `tests/ai-opportunity-import.functional.mjs` — `preserved seed imports with exact universe counts and historical hashes` | `node --test tests/ai-opportunity-import.functional.mjs` | Yes, real importer and seed |
| TP-01-02 | e2e-api | SCN-034-002 | `tests/ai-opportunity-import.e2e.mjs` — `Regression: changed archive refuses the initial generation and leaves current unchanged` | `node --test tests/ai-opportunity-import.e2e.mjs` | Yes, disposable repo-local publication root |

### Definition of Done

- [ ] SCN-034-001: Preserve the complete seed corpus is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-002: Refuse changed history is verified against the specified Given/When/Then behavior.
- [ ] TP-01-01 passes with raw count, rank, mapping, and preservation-hash evidence.
- [ ] TP-01-02 passes against a disposable real publication root with exact contract-refusal and unchanged-selector proof.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass.
- [ ] Broader E2E regression suite passes.
- [ ] Build quality gate: relevant selftest, archive validator, artifact lint, source rights/privacy, domain SST correspondence, and docs pass with recorded outputs; no related regression or warning remains.

No item is prechecked. Scope 2 may begin only after all items above have execution evidence.
