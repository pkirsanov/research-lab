# Scope 06: Bounded Authorship and Recommendation Lifecycle

**Status:** Done
**Depends On:** 05
**Scope-Kind:** runtime-behavior
**Requirements:** FR-004 through FR-008, FR-012, FR-018, FR-020 through FR-042, FR-056 through FR-058, FR-064 through FR-077; NFR-003 through NFR-004, NFR-007 through NFR-011, NFR-023 through NFR-024

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [user validation](../../uservalidation.md)

## Outcome

Give every one of the 22 currently discovered source reads exactly one validated new, carried, no-recommendation, or coverage-only brief outcome under bounded external authorship. Reduce eligible recommendations into deterministic origin identities, observations, append-only lifecycle events, compatible groups, shared-origin groups, and visible conflicts without prose churn or confidence inflation.

### Gherkin Scenarios

#### SCN-002-004: Author or carry every source brief within one complete barrier

```gherkin
Scenario: SCN-002-004 gives every frozen source one truthful validated brief outcome
  Given all 22 current ToolModelRead outcomes and required profile budgets are frozen
  When changed reads use the bounded author pool and unchanged reads resolve by exact fingerprints
  Then every derived source ID has exactly one newly-authored carried-forward no-recommendation or coverage-only outcome
  And stale unavailable static local synthetic illustrative off-theme or owner-insufficient evidence cannot create an ineligible market recommendation
  And rejected author output never enters current state or authoritative history
```

#### SCN-002-005: Bound cost retries concurrency duplication and prose churn

```gherkin
Scenario: SCN-002-005 keeps repeated malformed and over-budget author work deterministic
  Given validated prior briefs frozen reads and explicit profile model validation retry concurrency and run ceilings
  When unchanged exact-cap over-cap timeout malformed unsafe duplicate and retry cases execute
  Then unchanged content is carried by reference with zero author calls
  And changed sources use at most four concurrent calls and the initial attempt plus two retries per source
  And a required-input or run-ceiling breach fails before any participant is omitted or publication begins
  And telemetry records safe counts clocks usage and categories without prompts private values or rejected prose
```

#### SCN-002-006: Preserve recommendation identity lifecycle compatible origins and conflicts

```gherkin
Scenario: SCN-002-006 reduces repeated changed compatible shared-origin and conflicting recommendations
  Given prior immutable recommendation terms and current validated source briefs cite deterministic owner and evidence refs
  When origin keys observations lifecycle events and aggregation groups are reduced
  Then unchanged terms reaffirm by reference and material terms append a modified observation under the stable origin key
  And changed thesis subject action or horizon supersedes through linked immutable keys
  And compatible independent origins merge without adding or averaging confidence
  And shared evidence counts once while incompatible direction horizon trigger invalidation or quality remains visible
```

### Implementation Plan

1. Add `scripts/brief-author.mjs::{buildToolAuthorRequest,invokeAuthor,validateAuthorEnvelope}` with instructions separated from frozen JSON data, bounded stdin/stdout, JSON-only responses, required provider/model/prompt/schema/validator identity, and no repository write, shell, source-fetch, or browser-state authority.
2. Implement `rlcontracts.js::compactAuthorInput` with mandatory identity/state/clocks/sources/boundaries/eligibility/evidence/required facts, stable optional fact priority, whole-record inclusion, omitted-ID fingerprints, conservative byte-to-token reservation, and refusal when mandatory material exceeds the explicit profile cap.
3. Implement the shared four-worker pool in `scripts/brief-refresh.mjs`, exact profile input/output budgets, per-call timeout, initial attempt plus at most two retries against identical frozen input, and run-level reservation/actual accounting before each attempt. No source reacquisition occurs after freeze.
4. Implement `resolveBriefReuse` over read/evidence semantic state plus prompt/schema/model/validator policy identity. Carry-forward points to one prior validated content object and records the current occurrence; it does not rewrite authorship time or narrative.
5. Implement `validateToolBrief` for outcome/status, read/evidence/owner interpretation refs, no-action reason, boundaries, safe text/links, allowed recommendation subject/action/horizon/trigger/invalidation/confidence, profile eligibility, usage bounds, and private/instruction-shaped field rejection.
6. Implement `reduceRecommendationEvents` for stable origin/aggregation keys, observation fingerprints, idempotent event IDs, proposal/reaffirm/modify/conflict/withdraw/expire/outcome/supersede/correction transitions, and immutable prior terms.
7. Implement `groupRecommendations` for exact/compatible groups, evidence-origin independence, shared-cause grouping, explicit incompatibility, minimum retained confidence, coverage exclusions, and deterministic ordering. Natural-language authors do not own identity or grouping.
8. Emit sanitized structured call/lifecycle telemetry and preserve a closed error taxonomy. Rejected author bodies, prompts, credentials, private fields, and complete narratives never enter telemetry.

### Change Boundary

**Allowed:** `rlcontracts.js` author/brief/recommendation contracts and reducers; new `scripts/brief-author.mjs`; tool-author pool/reuse hooks in `scripts/brief-refresh.mjs`; Scope 06 tests and external-author contract fixtures.

**Excluded:** source acquisition/owner formulas, registry metadata/read adapters, final authoring, storage/history/pointers, scheduler Git publication, shared renderer/pages, provider credential stores, dependency files, other specs, and unrelated dirty/untracked paths.

### Consumer Impact Sweep

Inventory every consumer of current recommendation/action fields in `market-brief.payload.json`, `scripts/validate-brief-payload.mjs`, Market Brief helpers, history/change memory, docs, and tests. Preserve existing action vocabulary (`hold`, `trim`, `add`, `hedge`, `rotate`) while introducing typed IDs/refs. Search for prose-similarity identity, confidence summing/averaging, tool-count independence, repeated narrative append, or author-side grouping.

### Shared Infrastructure Impact Sweep

The author boundary, pool, validators, and reducers are shared by all source profiles and final preparation. Independent canaries prove pool ordering/concurrency, zero-call carry, retry identity, validator rejection, and prior Market Brief action semantics without using the changed reducer to validate itself. Rollback removes the additive process/reducer path and leaves source reads and existing final compatibility data untouched.

### Test Plan

Contract-shaped external-author responses are permitted only at the true LLM provider boundary. Assertions must prove production compaction, pool, validation, rejection, reducer, and lifecycle behavior; merely receiving the supplied response is self-validation and invalid.

| Test Type | Category | Scenario | File / Exact Test Title | Command | Live System | Red -> Green Contract |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | unit | SCN-002-004 | `tests/distributed-briefs.authorship.unit.mjs` - `SCN-002-004: brief validation binds recommendations to eligible owner evidence` | `node --test tests/distributed-briefs.authorship.unit.mjs` | No | Red: unsupported author claim validates; Green: exact owner/read/evidence/profile checks reject it. |
| Unit | unit | SCN-002-005 | `tests/distributed-briefs.authorship.unit.mjs` - `SCN-002-005: compaction honors exact profile caps and stable whole-fact priority` | `node --test tests/distributed-briefs.authorship.unit.mjs` | No | Red: truncation/default/omission occurs; Green: exact-cap, over-cap, mandatory, and optional ordering pass. |
| Unit | unit | SCN-002-006 | `tests/distributed-briefs.lifecycle.unit.mjs` - `SCN-002-006: stable identities distinguish reaffirm modify supersede close outcome and correction` | `node --test tests/distributed-briefs.lifecycle.unit.mjs` | No | Red: terms mutate or event duplicates; Green: transition graph and immutable hashes pass. |
| Unit | unit | SCN-002-006 | `tests/distributed-briefs.lifecycle.unit.mjs` - `SCN-002-006: compatible origins merge shared causes count once and conflicts remain separate` | `node --test tests/distributed-briefs.lifecycle.unit.mjs` | No | Red: tool count inflates confidence or hides conflict; Green: exact grouping and confidence floor pass. |
| Functional | functional | SCN-002-004, SCN-002-005 | `tests/distributed-briefs.author-boundary.functional.mjs` - `External author timeout malformed unsafe illegal and duplicate responses are bounded redacted and rejected` | `node --test tests/distributed-briefs.author-boundary.functional.mjs` | No | Red: external boundary can escape policy; Green: production process/validator returns one safe bounded outcome. |
| Integration | integration | SCN-002-004, SCN-002-005 | `tests/distributed-briefs.authorship.integration.mjs` - `production pool resolves all 22 source outcomes with at most four active author processes` | `node --test tests/distributed-briefs.authorship.integration.mjs` | Yes | Red: barrier incomplete or concurrency exceeds four; Green: real frozen reads and process boundary yield exact complete outcomes. |
| Stress | stress | SCN-002-005 | `tests/distributed-briefs.authorship.stress.mjs` - `Stress: 22 changed sources honor four-call retry and run token ceilings` | `node tests/distributed-briefs.authorship.stress.mjs` | Yes | Red: concurrent/retry/budget counters breach; Green: measured pool remains within every declared budget with no omitted ID. |
| Regression E2E | e2e-api | SCN-002-004 | `tests/distributed-briefs.authorship.e2e.mjs` - `Regression: SCN-002-004 all 22 source reads reach one truthful validated brief outcome` | `node --test tests/distributed-briefs.authorship.e2e.mjs` | Yes | Red: public source set is omitted or invented; Green: complete production graph validates. |
| Regression E2E | e2e-api | SCN-002-005 | `tests/distributed-briefs.authorship.e2e.mjs` - `Regression: SCN-002-005 unchanged and duplicate work creates no author prose event or cost churn` | `node --test tests/distributed-briefs.authorship.e2e.mjs` | Yes | Red: repeated run calls author/appends; Green: counters, refs, hashes, and event sets remain idempotent. |
| Regression E2E | e2e-api | SCN-002-006 | `tests/distributed-briefs.authorship.e2e.mjs` - `Regression: SCN-002-006 recommendation lifecycle preserves prior terms merges origins and exposes conflicts` | `node --test tests/distributed-briefs.authorship.e2e.mjs` | Yes | Red: public graph rewrites/duplicates/inflates/hides; Green: immutable lifecycle and groups validate. |
| Full Regression | e2e-api | SCN-002-004, SCN-002-005, SCN-002-006 | Complete registry-owner-authorship E2E suite | `node --test tests/distributed-briefs-foundation.e2e.mjs tests/distributed-briefs-owner-reads.e2e.mjs tests/distributed-briefs.authorship.e2e.mjs` | Yes | Red: upstream read/owner contracts regress; Green: all persistent scenarios pass together. |
| Baseline | functional | SCN-002-004, SCN-002-005, SCN-002-006 | Existing complete repository selftest | `node scripts/selftest.mjs` | Yes | Red: author/lifecycle additions alter current product invariants; Green: unchanged baseline passes. |

### Definition of Done - Tiered Validation

Core outcomes:

- [x] Every currently derived source has exactly one validated authored/carried/no-recommendation/coverage outcome under frozen input, explicit profile policy, and the complete source barrier. — Evidence: [report.md](report.md#test-evidence) (TP-06-06 integration + TP-06-08 e2e: the pool resolves 22 outcome IDs exactly equal to `orderedSourceToolIds`, aggregator excluded, each brief re-validated by `validateToolBrief`).
- [x] Compaction, four-worker concurrency, attempts, timeouts, token/cost ceilings, exact reuse, duplicate handling, privacy, safe telemetry, and refusal behavior implement the declared contracts without omission or implicit values. — Evidence: [report.md](report.md#test-evidence) (TP-06-02 compaction, TP-06-05 boundary, TP-06-06/07 pool concurrency + `B002-BUDGET` ceilings; `resolveBriefReuse` zero-call carry; caller-supplied budgets, no default values).
- [x] Recommendation identities, observations, lifecycle/outcome/correction events, compatible/shared-origin/conflict groups, confidence floor, and immutable prior terms satisfy SCN-002-006. — Evidence: [report.md](report.md#test-evidence) (TP-06-03 lifecycle transitions + immutable prior terms, TP-06-04 minimum-retained grouping and visible conflicts, TP-06-10 e2e).
- [x] Consumer and Shared Infrastructure Impact Sweeps, independent author/reducer canaries, rollback, and the declared Change Boundary are complete with unrelated dirty paths unchanged and unstaged. — Evidence: [report.md](report.md#lint-and-quality) (Consumer sweep `validate-brief-payload` PASS with the payload + validator unchanged; independent pool/reuse/lifecycle canaries in the selftest group; `git status --porcelain` shows only the eleven in-scope paths; rollback is additive-only).

Test evidence items, one per Test Plan row:

- [x] [TP-06-01] Unit evidence passes for owner-evidence-bound brief validation after its recorded red stage. — Evidence: [report.md](report.md#test-evidence) (RED cited-evidence check disabled → ghost brief validated, exit 1; restored byte-exact; GREEN `recommendation-cited-evidence-absent`).
- [x] [TP-06-02] Unit evidence passes for exact-cap deterministic compaction after its recorded red stage. — Evidence: [report.md](report.md#test-evidence) (RED reversed priority sort → `['fact-low',…]` vs `['fact-high',…]`, exit 1; restored; GREEN exact-cap + `B002-BUDGET` over-cap).
- [x] [TP-06-03] Unit evidence passes for lifecycle transition identity and immutability after its recorded red stage. — Evidence: [report.md](report.md#test-evidence) (RED modified→reaffirmed forced → `['reaffirmed']` vs `['modified']`, exit 1; restored; GREEN transition graph + retained prior terms).
- [x] [TP-06-04] Unit evidence passes for compatible/shared-origin/conflict grouping after its recorded red stage. — Evidence: [report.md](report.md#test-evidence) (RED `Math.min`→`Math.max` → `64 !== 50`, exit 1; restored; GREEN minimum-retained + shared-origin-once + visible conflict).
- [x] [TP-06-05] Functional evidence passes for the true external author boundary and every adversarial response class. — Evidence: [report.md](report.md#test-evidence) (`node --test …author-boundary.functional.mjs` 1/1 exit 0; real child; timeout/oversize/malformed/unsafe/mismatch/duplicate each bounded + rejected).
- [x] [TP-06-06] Integration evidence passes for the complete 22-source four-worker pool. — Evidence: [report.md](report.md#test-evidence) (`node --test …authorship.integration.mjs` 1/1 exit 0; 22 validated outcomes, observed peak concurrency ≤ 4, one call per source).
- [x] [TP-06-07] Stress evidence passes for declared concurrency, retry, and run token ceilings. — Evidence: [report.md](report.md#test-evidence) (`node tests/…authorship.stress.mjs` 16/0 exit 0; subset retry within ceiling; output/attempt/input ceilings each refuse `B002-BUDGET`).
- [x] [TP-06-08] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-004 pass with the exact title. — Evidence: [report.md](report.md#test-evidence) (RED evidence-subset check disabled → tampered brief validated, exit 1; restored; GREEN `Regression: SCN-002-004 all 22 source reads reach one truthful validated brief outcome`).
- [x] [TP-06-09] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-005 pass with the exact title. — Evidence: [report.md](report.md#test-evidence) (RED nonce in eventId → differing event IDs, exit 1; restored; GREEN `Regression: SCN-002-005 unchanged and duplicate work creates no author prose event or cost churn`).
- [x] [TP-06-10] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-006 pass with the exact title. — Evidence: [report.md](report.md#test-evidence) (RED `Math.min`→`Math.max` → `64 !== 50`, exit 1; restored; GREEN `Regression: SCN-002-006 recommendation lifecycle preserves prior terms merges origins and exposes conflicts`).
- [x] [TP-06-11] Broader E2E regression suite passes for registry-owner-authorship behavior. — Evidence: [report.md](report.md#test-evidence) (full distributed-briefs `node --test` surface `tests 25 / pass 25 / fail 0`, exit 0).
- [x] [TP-06-12] Baseline functional evidence passes for `node scripts/selftest.mjs` after focused checks are green. — Evidence: [report.md](report.md#test-evidence) (`Research-Lab self-test: 616 passed, 0 failed`, exit 0; +10 from the 606 baseline).

Build quality gate:

- [x] Exact Node checks, author-process/privacy/unsafe-output/internal-mock/self-validation scans, artifact validation, diff isolation, and full output are recorded in this scope report with zero warning or undeclared mutation. — Evidence: [report.md](report.md#lint-and-quality) (`validate-node-source-lock` PASS 16 adversarial/0 unexpected, `brief-cache` 354, `brief-payload` PASS, artifact-lint PASSED; author boundary carries no write/shell/fetch/browser authority; no self-validation; diff isolated to the declared surface, RED restores verified byte-exact by SHA-256).
