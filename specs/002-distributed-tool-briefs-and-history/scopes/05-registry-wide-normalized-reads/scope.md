# Scope 05: Registry-Wide Normalized Reads

**Status:** Not Started
**Depends On:** 04
**Scope-Kind:** runtime-behavior
**Requirements:** FR-001 through FR-010, FR-064 through FR-065, FR-071, FR-074 through FR-075, FR-087 through FR-091, FR-127 through FR-129; NFR-003, NFR-010 through NFR-011, NFR-020 through NFR-024

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [user validation](../../uservalidation.md)

## Outcome

Freeze a complete runtime-discovered registry and one truthful `ToolModelRead/v1` outcome for every source role. The observed 2026-07-14 snapshot of 18 participants, 17 sources, five browser publishers, and four headless publishers is a canary, never a runtime constant. A valid added source derives 19/18 behavior through the same registry loops, while Market Brief remains the sole non-recursive final aggregator.

### Gherkin Scenarios

#### SCN-002-001: Freeze the complete current registry and truthful normalized reads

```gherkin
Scenario: SCN-002-001 freezes one truthful outcome for every discovered source
  Given tools.json contains the observed 18 registered participants with required briefing metadata
  When validateRegistry freezes the registry and freezeToolReads evaluates each derived source ID
  Then exactly 17 source ToolModelRead outcomes are produced in registry order for this snapshot
  And Market Brief appears exactly once as the final aggregator without a source read or pre-final ToolBrief
  And every read exposes distinct model source evaluation freshness and evidence clocks with deterministic identity
```

#### SCN-002-002: Preserve heterogeneous read and evidence boundaries without invention

```gherkin
Scenario: SCN-002-002 preserves live static local off-theme unavailable and not-integrated truth
  Given fresh stale unavailable not-run static committed-local browser-only-absent off-theme and evidence-applicability states exist
  When registry-selected adapters normalize the source set
  Then stale or unavailable live reads are ineligible for a new recommendation
  And static synthetic illustrative local-only off-theme and restricted boundaries remain explicit
  And no adapter infers model evidence from prose descriptions private browser state or unrelated shared session evidence
```

#### SCN-002-003: Discover registry membership without a second inventory

```gherkin
Scenario: SCN-002-003 discovers a valid added source through the same runtime loops
  Given a registry mutation adds one unique valid source role profile adapter and required policy set
  When the next frozen registry and read barrier are built
  Then participantCount and sourceCount derive as 19 and 18 for the mutation without any literal-count rule
  And the new source receives read brief history coverage and mount obligations through existing registry iteration
  And incomplete metadata fails before source acquisition or authorship
  And Causal Rotation absence remains a complete dependency-free run
```

### Implementation Plan

1. Add the required `briefing` block to every current `tools.json` entry using the complete role/profile/read-adapter/freshness/recommendation/budget mapping in `design.md`. Preserve registry IDs, order, files, labels, descriptions, tags, and all existing consumers.
2. Implement `rlcontracts.js::validateRegistry` to derive ordered participant/source IDs and counts, require exactly one role/profile `final-aggregator`, reject unknown/missing/mismatched metadata, preserve registry order, and fingerprint the frozen contract. No parallel source list or `count - 1` assumption is legal.
3. Implement `scripts/brief-refresh.mjs::freezeToolReads` and registry-selected adapter dispatch for every current source. Reuse the six owner integrations from Scope 04. Add owning-function/static-evaluator/committed-projection/off-theme adapters for the remaining sources; when no truthful headless path exists, emit a complete `unavailable`, `not-run`, or `not-applicable` read rather than inferring metrics.
4. Finalize `ToolModelRead/v1` validation for identity/profile/role, adapter/model version, status, clocks, bounded facts/sources, evidence applicability/refs/owner interpretations, eligibility, limitations, safe deep link, and semantic fingerprint. Missing required configuration fails; no code fallback supplies behavior.
5. Preserve the five current browser publishers and four current headless publishers as dated independent canaries. Add the Intraday publisher from Scope 04 without changing the historical canary assertion. The validator reports both observed canary and runtime-derived counts distinctly.
6. Add a registry mutation fixture that creates a valid 19th participant/18th source and proves every producer/consumer iterates it without changes to a scheduler list, prompt list, validator count, history list, page list, or final coverage list.
7. Enforce privacy and structured-untrusted-input limits before downstream authorship: no credential, private browser/account/position/P&L/note field; no instruction-shaped field can expand source, process, file, or write authority.

### Change Boundary

**Allowed:** `tools.json` briefing metadata; `rlcontracts.js` registry/read validation; additive `rldata.js` projection compatibility; `scripts/brief-refresh.mjs::freezeToolReads` and registry-selected adapters; narrow owning-function extraction in registered pages/shared modules; Scope 05 tests.

**Excluded:** owning formulas, source transport semantics from Scopes 02-03, reaction math, author/recommendation/final logic, storage/history, scheduler Git publication, UI renderer/mounts, legacy history writes, package/dependency files, Spec 001/Causal Rotation artifacts, and unrelated dirty/untracked paths.

### Consumer Impact Sweep

Enumerate `tools.json` consumers in `index.html`, `rlnav.js`, `scripts/selftest.mjs`, Market Brief coverage, validators, author input, history indexes, page mounting, same-origin links, docs, and tests. Search for literal 17/16 and parallel source inventories and replace only behavior-authoritative uses; retain 18/17, five-publisher, and four-headless values solely in named canaries/evidence descriptions.

### Shared Infrastructure Impact Sweep

`tools.json`, `rldata.js`, and `scripts/brief-refresh.mjs` are protected. Independent canaries verify all 18 current links/order, five publisher semantics, four headless builder semantics, `RLAPP` status vocabulary, provider credentials, and unchanged owner outputs before broad read-barrier tests. Rollback restores the additive briefing metadata/read dispatch while keeping IDs/order and every unrelated consumer unchanged.

### Test Plan

Registry mutation data is a deterministic contract input, not market evidence. Integration/E2E rows execute production registry/read loops and real committed owner data with no internal mocks.

| Test Type | Category | Scenario | File / Exact Test Title | Command | Live System | Red -> Green Contract |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | unit | SCN-002-001 | `tests/distributed-briefs.contract.mjs` - `SCN-002-001: registry derives 18 participants 17 sources and one non-recursive aggregator` | `node --test tests/distributed-briefs.contract.mjs` | No | Red: old 17/16 or count-minus-one logic survives; Green: derived IDs/counts and aggregator exclusion pass. |
| Unit | unit | SCN-002-002 | `tests/distributed-briefs.contract.mjs` - `SCN-002-002: profile status applicability privacy and eligibility boundaries fail loud` | `node --test tests/distributed-briefs.contract.mjs` | No | Red: non-live/private evidence can become eligible; Green: exact closed-state validation rejects it. |
| Unit | unit | SCN-002-003 | `tests/distributed-briefs.contract.mjs` - `SCN-002-003: added-source mutation derives 19 participants and 18 sources generically` | `node --test tests/distributed-briefs.contract.mjs` | No | Red: a second inventory omits the added source; Green: every derived registry field includes it. |
| Integration | integration | SCN-002-001, SCN-002-002 | `tests/distributed-briefs-read-adapters.integration.mjs` - `all observed 17 source adapters emit truthful production ToolModelRead outcomes` | `node --test tests/distributed-briefs-read-adapters.integration.mjs` | Yes | Red: one source is omitted/inferred/invalid; Green: real registry and committed owner inputs yield one complete outcome per ID. |
| Canary | functional | SCN-002-001 | `tests/distributed-briefs-shared-canary.mjs` - `Canary: observed registry retains 18 ordered links and one Market Brief aggregator` | `node --test tests/distributed-briefs-shared-canary.mjs` | No | Red: metadata changes order/links; Green: existing consumers retain exact registry identity. |
| Canary | functional | SCN-002-001, SCN-002-002 | `tests/distributed-briefs-shared-canary.mjs` - `Canary: five browser publishers four headless reads and RLAPP statuses preserve semantics` | `node --test tests/distributed-briefs-shared-canary.mjs` | No | Red: shared changes alter existing output/status; Green: independent production canaries pass. |
| Regression E2E | e2e-api | SCN-002-001 | `tests/distributed-briefs-foundation.e2e.mjs` - `Regression: SCN-002-001 current registry freezes 17 source reads and one non-recursive final aggregator` | `node --test tests/distributed-briefs-foundation.e2e.mjs` | Yes | Red: old cardinality or omission fails whole graph; Green: all current source IDs validate exactly once. |
| Regression E2E | e2e-api | SCN-002-002 | `tests/distributed-briefs-foundation.e2e.mjs` - `Regression: SCN-002-002 unavailable non-live and off-theme evidence never becomes a market recommendation` | `node --test tests/distributed-briefs-foundation.e2e.mjs` | Yes | Red: an ineligible real read can promote; Green: public structured output preserves zero eligibility. |
| Regression E2E | e2e-api | SCN-002-003 | `tests/distributed-briefs-foundation.e2e.mjs` - `Regression: SCN-002-003 registry-only addition joins every read consumer without inventory edits` | `node --test tests/distributed-briefs-foundation.e2e.mjs` | Yes | Red: a consumer omits the mutation; Green: production loops derive 19/18 and complete treatment. |
| Full Regression | e2e-api | SCN-002-001, SCN-002-002, SCN-002-003 | Complete evidence-owner-registry E2E suite | `node --test tests/market-session-evidence.foundation.e2e.mjs tests/distributed-briefs-owner-reads.e2e.mjs tests/distributed-briefs-foundation.e2e.mjs` | Yes | Red: foundation/owner/registry contracts drift; Green: the complete current read chain passes. |
| Baseline | functional | SCN-002-001, SCN-002-002, SCN-002-003 | Existing complete repository selftest | `node scripts/selftest.mjs` | Yes | Red: registry/shared changes regress current product behavior; Green: unchanged baseline passes. |

### Definition of Done - Tiered Validation

Core outcomes:

- [ ] All 18 observed registry entries carry valid required briefing metadata; runtime validation derives exactly 17 source IDs and one non-recursive final aggregator for this snapshot without a parallel inventory.
- [ ] Every current source receives one truthful production ToolModelRead outcome with exact profile/status/clocks/provenance/evidence/eligibility/limitations/identity and no inferred or private model state.
- [ ] A valid added source derives 19/18 behavior through all registry loops, invalid metadata fails before acquisition/authorship, and current operation remains independent of Causal Rotation.
- [ ] Consumer and Shared Infrastructure Impact Sweeps, independent registry/read/status/privacy canaries, rollback, and the declared Change Boundary are complete with unrelated dirty paths unchanged and unstaged.

Test evidence items, one per Test Plan row:

- [ ] [TP-05-01] Unit evidence passes for observed 18/17 derived registry cardinality after its recorded red stage.
- [ ] [TP-05-02] Unit evidence passes for profile/status/applicability/privacy boundaries after its recorded red stage.
- [ ] [TP-05-03] Unit evidence passes for generic 19/18 added-source derivation after its recorded red stage.
- [ ] [TP-05-04] Integration evidence passes for all 17 production source read outcomes.
- [ ] [TP-05-05] Independent registry-link/aggregator canary evidence passes before broad execution.
- [ ] [TP-05-06] Independent publisher/headless/RLAPP canary evidence passes before broad execution.
- [ ] [TP-05-07] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-001 pass with the exact amended title.
- [ ] [TP-05-08] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-002 pass with the exact amended title.
- [ ] [TP-05-09] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-003 pass with the exact amended title.
- [ ] [TP-05-10] Broader E2E regression suite passes for the complete foundation-owner-registry chain.
- [ ] [TP-05-11] Baseline functional evidence passes for `node scripts/selftest.mjs` after focused checks are green.

Build quality gate:

- [ ] Exact Node checks, registry/consumer/privacy/security and internal-mock scans, canary semantic diffs, artifact validation, diff isolation, and full output are recorded in this scope report with zero warning or undeclared mutation.
