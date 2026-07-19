# Scope 08: Window-Aware Final Aggregation

**Status:** Done
**Depends On:** 06, 07
**Scope-Kind:** runtime-behavior
**Requirements:** FR-024 through FR-036, FR-047, FR-067 through FR-070, FR-122 through FR-130; NFR-003, NFR-007 through NFR-009, NFR-016 through NFR-024

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [user validation](../../uservalidation.md)

## Outcome

Author one registry-complete FinalBrief only after all owner reads and source briefs validate. Its bounded input retains every participant, owner interpretation, evidence cutoff, lifecycle/group/conflict decision, and window policy while excluding raw history. Pre-market, morning, pre-close, and after-hours outputs prioritize only evidence knowable at their cutoffs, and unusual tape/report context consumes no action slot without owner plus low-noise support.

### Gherkin Scenarios

#### SCN-002-025: Apply the exact evidence policy for each scheduled window

```gherkin
Scenario Outline: SCN-002-025 authors a final brief from evidence relevant to its frozen window
  Given every discovered source outcome and owner interpretation is frozen at the <window> cutoff
  When deterministic grouping and final authorship run
  Then final coverage accounts for all current 23 participants exactly once
  And the brief prioritizes <required context>
  And evidence first available after cutoff is absent
  And official regular close remains distinct from indicative extended hours

  Examples:
    | window | required context |
    | pre-market | overnight context, already released reports, current pre-market evidence, and open scenarios |
    | morning | regular tape plus exact same-date published pre-market owner thesis references |
    | pre-close | current partial regular evidence and clearly labeled overnight implications without a premature official close |
    | after-hours | the official regular close, indicative post-close evidence, released reactions, and the next explicit open session |
```

#### SCN-002-027: Keep unusual evidence as low-noise educational context until owner gates clear

```gherkin
Scenario: SCN-002-027 prevents an unusual extended-hours or report observation from becoming an unsupported action
  Given fresh comparable evidence identifies an unusual price volume or released-report observation
  But no eligible owning interpretation and structural persistence or independent-corroboration condition supports action
  When ToolBrief and FinalBrief validation run
  Then the observation remains context or no-action with its provenance and suppression reason
  And action attention and confidence counts do not increase
  And shared evidence counts once and any owner/provider conflict remains visible
  And output is not labeled fund flow official extended-hours close personalized advice or execution instruction
```

### Implementation Plan

1. Add `scripts/brief-author.mjs::{buildFinalAuthorRequest,validateAuthorEnvelope}` and `rlcontracts.js::compactFinalAuthorInput`. Require one mandatory `FinalSourceEnvelope/v1` per derived source ID in registry order plus run/window header, owner interpretations, legal recommendations, groups/conflicts, required evidence summaries, low-noise results, and compact active lifecycle metadata.
2. Enforce the explicit final input/output/run budgets without truncating participant, recommendation terms, conflicts, provenance, or required context. Optional facts add whole by stable priority/source order/fact ID and record omitted IDs/refs; mandatory overflow returns B002-BUDGET before invocation.
3. Invoke one final external author only after the frozen-registry barrier proves `readOutcomeIds` and `briefOutcomeIds` each exactly equal `orderedSourceToolIds`, with stored counts equal to the derived ID-set lengths. The current 23-participant/22-source values remain a current-repository canary and never control success. The author receives no raw HTML, raw cache, browser state, provider transport, narrative history, unselected evidence body, or Market Brief source brief.
4. Implement `validateFinalBrief` for exact current participant/source coverage, read/brief/evidence/owner refs, compatible groups/shared origins/conflicts, minimum confidence, closed action vocabulary, action/attention bounds, privacy/safe text, distinct clocks, and no evidence- or author-invented action.
5. Implement the four-window contract and `priorWindowThesisRef`: morning may reference only a published same-date pre-market owner/final thesis at an earlier cutoff; absence is `insufficient`. Pre-close cannot name an official close before the calendar close. After-hours always retains the current date's official close separately.
6. Implement the low-noise promotion gate: fresh comparable evidence + eligible owner interpretation + falsifiable terms + structural break or three distinct observation fingerprints or independent owner/evidence origin, with disputes/conflicts/thin/profile boundaries blocking promotion. Repeated same evidence gives no persistence credit.
7. Emit one coverage row per participant, one read/brief ref per source, and visible included/merged/carried/coverage/conflicted/excluded/failed decisions. Final wording cannot alter source terms or hide no-action outcomes.

### Change Boundary

**Allowed:** final compaction/validation/group consumption in `rlcontracts.js`; final request path in `scripts/brief-author.mjs`; final barrier orchestration in `scripts/brief-refresh.mjs`; `FinalBrief/v1`; Scope 08 tests/external-author contract fixtures.

**Excluded:** source/owner formulas, registry/read/tool-author/lifecycle behavior, storage projection except consuming current refs, scheduler Git publication, UI rendering, dependency files, other specs, and unrelated dirty/untracked paths.

### Consumer Impact Sweep

Inventory current Market Brief action/attention/coverage validators, compatibility payload helpers, root snapshot/payload consumers, window controls, notes/docs, and tests. Search for hardcoded participant lists/counts, final confirmation without owner refs, confidence averaging, generic prior-close window prose, schedule-only actuals, post-cutoff evidence, and extended-hours `close` labels.

### Shared Infrastructure Impact Sweep

Final compaction/validation is a shared policy surface. Independent canaries compare existing validated action shape and low-noise limits, prove every source envelope remains present at exact cap, and reject one omitted source/owner ref without relying on the external author response. Rollback restores the prior final compatibility author path while leaving source briefs/lifecycle/history immutable.

### Test Plan

The LLM is an external boundary; contract responses are functional inputs only. Integration/E2E assertions validate production compaction, barrier, grouping, author validation, and complete current objects rather than echoing response text.

| Test Type | Category | Scenario | File / Exact Test Title | Command | Live System | Red -> Green Contract |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | unit | SCN-002-025 | `tests/distributed-briefs.final.unit.mjs` - `SCN-002-025: final compaction retains every source owner ref and window-required field` | `node --test tests/distributed-briefs.final.unit.mjs` | No | Red: a source/ref/window field can drop; Green: exact cap/order/omission metadata and mandatory overflow pass. |
| Unit | unit | SCN-002-027 | `tests/distributed-briefs.final.unit.mjs` - `SCN-002-027: low-noise gate requires owner plus structural persistence or independent corroboration` | `node --test tests/distributed-briefs.final.unit.mjs` | No | Red: unusual evidence promotes alone; Green: every gate and repeated-fingerprint/shared-origin restriction passes. |
| Functional | functional | SCN-002-025, SCN-002-027 | `tests/distributed-briefs.final-author.functional.mjs` - `Final author omission hidden conflict unsupported action unsafe text and budget mutations are rejected` | `node --test tests/distributed-briefs.final-author.functional.mjs` | No | Red: external response can rewrite truth; Green: production validator rejects every unsupported mutation. |
| Integration | integration | SCN-002-025 | `tests/distributed-briefs.final.integration.mjs` - `complete 23-participant final input consumes all 22 owner-read and source-brief outcomes after the barrier` | `node --test tests/distributed-briefs.final.integration.mjs` | Yes | Red: final begins early or omits source; Green: real current artifacts and call trace prove complete barrier/order. |
| Integration | integration | SCN-002-027 | `tests/distributed-briefs.final.integration.mjs` - `owner disputes thin baselines and shared source origins remain context or conflict` | `node --test tests/distributed-briefs.final.integration.mjs` | Yes | Red: final hides/inflates/promotes; Green: current object retains exact context/conflict/exclusion. |
| Regression E2E | e2e-api | SCN-002-025 | `tests/distributed-briefs.final.e2e.mjs` - `Regression: SCN-002-025 pre-market morning pre-close and after-hours use only cutoff-relevant owner evidence` | `node --test tests/distributed-briefs.final.e2e.mjs` | Yes | Red: matrix leaks later/generic evidence; Green: four complete final objects validate exact window policy. |
| Regression E2E | e2e-api | SCN-002-027 | `tests/distributed-briefs.final.e2e.mjs` - `Regression: SCN-002-027 unsupported unusual evidence remains educational context with zero action-slot impact` | `node --test tests/distributed-briefs.final.e2e.mjs` | Yes | Red: context increases action/confidence or unsafe wording; Green: public object remains bounded no-action context. |
| Full Regression | e2e-api | SCN-002-025, SCN-002-027 | Complete author-lifecycle-history-final E2E suite | `node --test tests/distributed-briefs.authorship.e2e.mjs tests/distributed-briefs.history.e2e.mjs tests/distributed-briefs.final.e2e.mjs` | Yes | Red: upstream lifecycle/history contract regresses; Green: all persistent scenarios pass together. |
| Baseline | functional | SCN-002-025, SCN-002-027 | Existing complete repository selftest | `node scripts/selftest.mjs` | Yes | Red: final policy alters existing product invariants; Green: unchanged baseline passes. |

### Definition of Done - Tiered Validation

Core outcomes:

- [x] One final author starts only after every derived source read/brief outcome validates and receives a bounded complete registry/owner/evidence/lifecycle/group/window envelope with no raw history or recursive Market Brief input. — Evidence: [report.md](report.md#test-evidence) (TP-08-04 barrier + SCN-002-025 RED→GREEN; real evidence)
- [x] Final validation accounts for the current 23/22 canary and runtime-derived IDs, preserves origins/conflicts/exclusions/clocks/provenance, and rejects unsupported actions or confidence inflation. — Evidence: [report.md](report.md#test-evidence) (TP-08-03 functional + TP-08-05 integration; real evidence)
- [x] Pre-market, morning, pre-close, and after-hours outputs satisfy SCN-002-025; low-noise owner/persistence/corroboration policy satisfies SCN-002-027 with educational/privacy/proxy labels intact. — Evidence: [report.md](report.md#test-evidence) (four-window matrix + TP-08-06/07; real evidence)
- [x] Consumer and Shared Infrastructure Impact Sweeps, independent final-policy canaries, rollback, and the declared Change Boundary are complete with unrelated dirty paths unchanged and unstaged. — Evidence: [report.md](report.md#consumer-impact-sweep) (Consumer + Shared-Infra sweeps: none found; real evidence)

Test evidence items, one per Test Plan row:

- [x] [TP-08-01] Unit evidence passes for complete exact-cap final compaction after its recorded red stage. — Evidence: [report.md](report.md#test-evidence) (SCN-002-025 RED unit:64 → GREEN; real evidence)
- [x] [TP-08-02] Unit evidence passes for owner/structural/persistence/corroboration low-noise promotion after its recorded red stage. — Evidence: [report.md](report.md#test-evidence) (SCN-002-027 RED unit:100 → GREEN; real evidence)
- [x] [TP-08-03] Functional evidence passes for every external final-author adversarial response. — Evidence: [report.md](report.md#test-evidence) (final-author.functional GREEN; real evidence)
- [x] [TP-08-04] Integration evidence passes for the registry-derived final barrier, with 23 participants/22 sources retained only as the current-repository canary. — Evidence: [report.md](report.md#test-evidence) (final.integration barrier GREEN; real evidence)
- [x] [TP-08-05] Integration evidence passes for dispute/thin/shared-origin context treatment. — Evidence: [report.md](report.md#test-evidence) (final.integration dispute/thin GREEN; real evidence)
- [x] [TP-08-06] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-025 pass with the exact title. — Evidence: [report.md](report.md#test-evidence) (final.e2e four-window regression GREEN; real evidence)
- [x] [TP-08-07] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-027 pass with the exact title. — Evidence: [report.md](report.md#test-evidence) (final.e2e low-noise regression GREEN; real evidence)
- [x] [TP-08-08] Broader E2E regression suite passes for author-lifecycle-history-final behavior. — Evidence: [report.md](report.md#tp-08-08--broader-author-lifecycle-history-final-e2e-regression-green) (authorship+history+final 7/7; real evidence)
- [x] [TP-08-09] Baseline functional evidence passes for `node scripts/selftest.mjs` after focused checks are green. — Evidence: [report.md](report.md#tp-08-09--baseline-repository-selftest-green-633--0) (selftest 633/0; real evidence)

Build quality gate:

- [x] Exact Node checks, completeness/budget/privacy/unsafe-output/internal-mock/self-validation scans, consumer search, artifact validation, diff isolation, and full output are recorded in this scope report with zero warning or undeclared mutation. — Evidence: [report.md](report.md#test-evidence) (node --test + selftest 633/0, consumer/shared-infra sweeps, sha256 byte-identity diff isolation; real evidence)
