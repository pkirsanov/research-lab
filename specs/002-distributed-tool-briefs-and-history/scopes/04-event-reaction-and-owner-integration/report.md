# Scope 04 Report: Event Reaction and Owner Integration

**Status:** Implementation Complete — the event-reaction call-site vertical (`scripts/market-session-evidence.mjs::acquireMarketSessionEvidence`) and the owner-integration surface (additive `ToolModelRead/v1` validation in `rldata.js`, and `scripts/brief-refresh.mjs::freezeToolReads` with six declared owner adapters) are delivered in the working tree, with the additive Scope 04 selftest group and the Scope 04 unit/functional/contract/integration/canary/e2e suites. DoD test-evidence items TP-04-01 through TP-04-10 are met by reproduced current-session evidence (TP-04-01/02/03 by controlled-mutation RED-before-GREEN; TP-04-04/05/06/07/08/09/10 executed GREEN). The Scope 04 surface is uncommitted (working tree); the parent verifies, stages, and commits it. Independent certification is owned by bubbles.validate; this report records implement-phase delivery evidence only.

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 04 joins immutable released reports to cutoff-safe, field-complete `ReactionSegment/v1` values through the UNCHANGED Scope 01 `rlsession.js::joinEventMarketReaction` primitive, and publishes shared `MarketSessionEvidence/v1` refs only through declared eligible owning reads. The concrete reaction call site is `scripts/market-session-evidence.mjs::acquireMarketSessionEvidence`: when a released `reactionReport` is supplied it joins the report over the same session observations, adds the report and reaction to the bundle, and builds each segment's comparable-volume baseline through the UNCHANGED `buildComparableVolumeBaseline` signature over the segment's exact non-zero window — it is a call site, not a second join implementation. `rldata.js` gains a backward-compatible `tool-model-read/v1` branch on `putToolRead` plus `validateToolModelRead` (owner-only `evidenceInterpretations`, `evidenceApplicability`, additive `evidenceCutoff`/`marketSessionEvidenceRef`/`evidenceRefs`); the existing compact `rl-tool-read/v1` and legacy paths are unchanged. `scripts/brief-refresh.mjs` gains `OWNER_EVIDENCE_DECLARATIONS` (Intraday Tape, Sector Rotation, ETF Momentum, Global Rotation, Real Assets, Bond Regime), `buildOwnerEvidenceRead`, `buildNonOwnerApplicabilityRead`, and `freezeToolReads`; the six owners delegate to their own owning functions and never recompute RRG/FX/asset/bond/momentum/VWAP/tape formulas in shared code. Scope 04 adds the reaction unit row to `tests/market-session-evidence.unit.mjs`, the contract row to `tests/distributed-briefs.contract.mjs`, the new suites `tests/event-market-reaction.functional.mjs`, `tests/event-market-reaction.e2e.mjs`, `tests/distributed-briefs-owner-reads.integration.mjs`, `tests/distributed-briefs-owner-canary.mjs`, `tests/distributed-briefs-owner-reads.e2e.mjs`, the shared `tests/fixtures/feature-002/market-session-evidence/reaction-fixture-builder.mjs`, and the additive Scope 04 group in `scripts/selftest.mjs`.

## Decision Record

1. Evidence-first: every DoD test-evidence item below cites a command re-run and observed in this session (Claim Source: executed). No historical output is relabeled, backdated, or fabricated.
2. **Controlled-mutation RED-before-GREEN for TP-04-01 (unit), TP-04-02 (functional), and TP-04-03 (contract).** Each behavior was proven by a single surgical in-place mutation reversed by an exact inverse edit (or, for the unchanged Scope 01 `rlsession.js`, by `git checkout`), with byte-identity confirmed by SHA-256 against a pre-mutation anchor. TP-04-04/05/06/07/08/09/10 carry executed GREEN output; the new suites naturally start absent and their production paths are the same paths the RED cycles discriminate.
3. **RED discriminators stayed inside the declared surface where possible.** TP-04-02 mutated the Scope 04 wiring in `scripts/market-session-evidence.mjs` (suppressing `reactions.push`); TP-04-03 mutated the Scope 04 additive validator in `rldata.js` (disabling the interpretation-provenance check). TP-04-01 mutated the consumed Scope 01 primitive `rlsession.js::buildReactionSegment` (bucket-zero remap) and restored it byte-exact via `git checkout` — that file is not part of the Scope 04 change set and ends unmodified.
4. Certification is not self-claimed. `spec.md`, `design.md`, `uservalidation.md`, and `state.json.certification.*` are unchanged; final certification remains bubbles.validate's responsibility.

## Completion Statement

Scope 04 implementation is complete and its implement-phase DoD is met by reproduced current-session evidence. All DoD items (4 core outcomes, TP-04-01 through TP-04-10, build-quality gate) are checked in [scope.md](scope.md) with the executed evidence recorded below. TP-04-01/02/03 carry fresh controlled-mutation RED-before-GREEN pairs; TP-04-04/05/06/07/08/09/10 carry executed GREEN output. The Scope 04 production/test/fixture/selftest surface is uncommitted in the working tree for the parent to stage and commit; the consumed Scope 01 primitive `rlsession.js` and every excluded surface are unchanged.

## Reproduced Delivery Validation (summary, Claim Source: executed)

| Command | Result | Exit |
| --- | --- | ---: |
| `node scripts/selftest.mjs` | `Research-Lab self-test: 601 passed, 0 failed` (was 589 pre-Scope-04; +12 additive Scope 04 checks) | 0 |
| `node --test tests/market-session-evidence.unit.mjs …` (7 Scope 04 files) | `tests 18  pass 18  fail 0` (reaction unit/functional/contract/integration/canary/e2e + Scope 01/02/03 unit) | 0 |
| `node --test tests/distributed-briefs-owner-canary.mjs` | `tests 2  pass 2  fail 0` (independent owner canary) | 0 |
| `node --test tests/market-session-evidence.source.e2e.mjs tests/released-report-evidence.e2e.mjs tests/event-market-reaction.e2e.mjs tests/distributed-briefs-owner-reads.e2e.mjs` | `tests 7  pass 7  fail 0` (full evidence-to-owner chain) | 0 |
| `node scripts/validate-node-source-lock.mjs` | `[node-source-lock] OK adversarial=16 unexpectedAcceptances=0` | 0 |
| `bash .github/bubbles/scripts/artifact-lint.sh specs/002-distributed-tool-briefs-and-history` | `Artifact lint PASSED.` | 0 |
| `node scripts/validate-brief-cache.mjs` | `[brief-cache] PASS: 354 JSON cache files parsed …` | 0 |
| `node scripts/validate-brief-payload.mjs market-brief.payload.json` | `[brief-contract] PASS …` | 0 |

## Working-Tree Audit

`git rev-parse --short HEAD` = `decaaa2`. The Scope 04 surface is **uncommitted** (working tree) for the parent to stage/commit. `git status --porcelain` (Scope 04 surface):

```text
 M rldata.js
 M scripts/brief-refresh.mjs
 M scripts/market-session-evidence.mjs
 M scripts/selftest.mjs
 M tests/distributed-briefs.contract.mjs
 M tests/market-session-evidence.unit.mjs
?? tests/distributed-briefs-owner-canary.mjs
?? tests/distributed-briefs-owner-reads.e2e.mjs
?? tests/distributed-briefs-owner-reads.integration.mjs
?? tests/event-market-reaction.e2e.mjs
?? tests/event-market-reaction.functional.mjs
?? tests/fixtures/feature-002/market-session-evidence/reaction-fixture-builder.mjs
```

Working-tree SHA-256 of the mutated-then-restored production files (each byte-identical to its pre-RED anchor after every cycle):

| File | SHA-256 |
| --- | --- |
| `rlsession.js` (consumed Scope 01; unchanged at HEAD) | `eb56dd6949cc3faa0a7749436cba633de03cb0b4bfddd53a8d475e0520f67703` |
| `scripts/market-session-evidence.mjs` | `233d40f9040236c9d84d09b67c2d5b84dc3dbafc4a6c18ca135a36427a441e9b` |
| `rldata.js` | `42fe212ce3feab55c6dfaa12c9d99500b1aab6c1b55320e5de4853e800b9ad78` |
| `scripts/brief-refresh.mjs` | `6560ce144bb9c5ddac8a6837ca1befaf1d51f53dabc1783e6106bf5b92e2b4a1` |

The consumed Scope 01 primitive `rlsession.js` is unmodified in the working tree (not in the `git status` above); every excluded surface (`tools.json`, `rlapp.js`, `rlbrief.js`, other specs, other repos) is unchanged.

## Test Evidence (one block per Test Plan row)

**Phase:** implement · **Agent:** bubbles.implement

### TP-04-01 unit SCN-002-020

Controlled mutation of the consumed Scope 01 primitive `rlsession.js::buildReactionSegment`: `var startBucket = Math.max(0, Math.floor((releaseEpoch - sessionStartEpoch) / FIVE_MINUTES_MS) + 1);` → `var startBucket = 0; /* RED-TP0401: bucket-zero remap */`.

#### RED — `node --test --test-name-pattern="ReactionSegment v1 preserves exact non-zero window" tests/market-session-evidence.unit.mjs` — Exit 1 — Claim Source: executed

```text
✖ SCN-002-020: ReactionSegment v1 preserves exact non-zero window source boundary cutoff state and identities (38.736917ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  0 !== 55
      at .../tests/market-session-evidence.unit.mjs:626:10
    actual: 0, expected: 55, operator: 'strictEqual'
ℹ tests 1  ℹ pass 0  ℹ fail 1
```

Restore: `git checkout -- rlsession.js`; `shasum -a 256 rlsession.js` = `eb56dd69…7703` (anchor).

#### GREEN — `node --test --test-name-pattern="ReactionSegment v1 preserves exact non-zero window" tests/market-session-evidence.unit.mjs` — Exit 0 — Claim Source: executed

```text
✔ SCN-002-020: ReactionSegment v1 preserves exact non-zero window source boundary cutoff state and identities (44.544167ms)
ℹ tests 1  ℹ pass 1  ℹ fail 0
```

### TP-04-02 functional SCN-002-020

Controlled mutation of the Scope 04 wiring in `scripts/market-session-evidence.mjs`: `reactions.push(reaction);` → `/* RED-TP0402: reaction intentionally not added to the bundle */` (orphans the segment baseline whose `currentAggregateRef` points at the reaction segment).

#### RED — `node --test tests/event-market-reaction.functional.mjs` — Exit 1 — Claim Source: executed

```text
✖ SCN-002-020: production reaction graph preserves field-complete segments exact comparables and revision lineage (3910.32225ms)
  AssertionError [ERR_ASSERTION]: baseline-current-aggregate-missing
  false !== true
      at .../tests/event-market-reaction.functional.mjs:75:12
ℹ tests 1  ℹ pass 0  ℹ fail 1
```

Restore: exact inverse edit; `shasum -a 256 scripts/market-session-evidence.mjs` = `233d40f9…1e9b` (anchor).

#### GREEN — `node --test tests/event-market-reaction.functional.mjs` — Exit 0 — Claim Source: executed

```text
✔ SCN-002-020: production reaction graph preserves field-complete segments exact comparables and revision lineage (14266.584334ms)
ℹ tests 1  ℹ pass 1  ℹ fail 0
```

### TP-04-03 contract SCN-002-026

Controlled mutation of the Scope 04 additive validator in `rldata.js`: `if (it.ownerAdapterId !== adapter.adapterId || it.ownerModelVersion !== adapter.owningModelVersion) return trmFail("evidence-interpretation-provenance-mismatch");` → guarded with `if (false /* RED-TP0403 */ && (…))` so a forged owner-adapter provenance is no longer rejected.

#### RED — `node --test --test-name-pattern="only owner adapters may publish" tests/distributed-briefs.contract.mjs` — Exit 1 — Claim Source: executed

```text
✖ SCN-002-026: only owner adapters may publish evidence interpretations or action eligibility (1.86175ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + undefined
  - 'evidence-interpretation-provenance-mismatch'
      at .../tests/distributed-briefs.contract.mjs:185:10
ℹ tests 1  ℹ pass 0  ℹ fail 1
```

Restore: exact inverse edit; `shasum -a 256 rldata.js` = `42fe212c…ad78` (anchor).

#### GREEN — `node --test --test-name-pattern="only owner adapters may publish" tests/distributed-briefs.contract.mjs` — Exit 0 — Claim Source: executed

```text
✔ SCN-002-026: only owner adapters may publish evidence interpretations or action eligibility (0.921042ms)
ℹ tests 1  ℹ pass 1  ℹ fail 0
```

### TP-04-04 integration SCN-002-026

`node --test tests/distributed-briefs-owner-reads.integration.mjs` — Exit 0 — Claim Source: executed. One real `MarketSessionEvidence/v1` bundle is built through both production entry points (`acquireReportEvidence` + `acquireMarketSessionEvidence` with `reactionReport`), and the six declared owners are frozen over it via production `freezeToolReads`. Every owner read validates through `RLDATA.validateToolModelRead`, carries an owner-provenance interpretation over refs that exist in the frozen bundle, and leaks no owner-formula field (the shared layer never recomputes a model); Bond Regime is the one action-eligible owner (CPI report + reaction refs), the four session-context owners are context-only/ineligible, Real Assets is explicit `not-applicable` for SPY, and every non-owner source carries explicit applicability with zero interpretations.

```text
✔ six declared owners consume typed evidence refs through production model reads (0.976833ms)
ℹ tests 1  ℹ pass 1  ℹ fail 0
```

### TP-04-05 and TP-04-06 owner canary

`node --test tests/distributed-briefs-owner-canary.mjs` — Exit 0 — Claim Source: executed. The independent Shared-Infrastructure canary imports and exercises each pre-change owner projection: the five current browser publishers still round-trip byte-identically through the UNCHANGED `rl-tool-read/v1` strict path, the legacy compact projection still normalizes to the exact 5-field shape, the four headless builders (Sector synchronous over a committed-shape fixture; ETF/Global/Real-Assets callable functions) are preserved, and Bond Regime plus the browser credential surfaces exclude every restricted local observation and private credential field.

```text
✔ Canary: five current publisher reads and four headless reads preserve pre-evidence semantics (1.731458ms)
✔ Canary: Bond Regime and browser credential boundaries exclude restricted and private fields (0.71125ms)
ℹ tests 2  ℹ pass 2  ℹ fail 0
```

### TP-04-07 e2e regression SCN-002-020

`node --test tests/event-market-reaction.e2e.mjs` — Exit 0 — Claim Source: executed. Drives `acquireReportEvidence` (report fixtures) → `reactionReport` → `acquireMarketSessionEvidence` (session fixture) and revalidates the whole immutable graph.

```text
✔ Regression: SCN-002-020 publishes only field-complete cutoff-safe ReactionSegment v1 graphs (7942.42175ms)
ℹ tests 1  ℹ pass 1  ℹ fail 0
```

### TP-04-08 e2e regression SCN-002-026

`node --test tests/distributed-briefs-owner-reads.e2e.mjs` — Exit 0 — Claim Source: executed. Proves final-eligible evidence exists only after an owning read publishes its interpretation; raw shared evidence alone never supports a recommendation and profile boundaries are preserved.

```text
✔ Regression: SCN-002-026 final-eligible evidence exists only after an owning read publishes its interpretation (0.580417ms)
ℹ tests 1  ℹ pass 1  ℹ fail 0
```

### TP-04-09 broader e2e regression suite

`node --test tests/market-session-evidence.source.e2e.mjs tests/released-report-evidence.e2e.mjs tests/event-market-reaction.e2e.mjs tests/distributed-briefs-owner-reads.e2e.mjs` — Exit 0 — Claim Source: executed. The complete production evidence-to-owner chain (Yahoo source → CPI report → reaction → owner reads).

```text
✔ Regression: SCN-002-026 final-eligible evidence exists only after an owning read publishes its interpretation
✔ Regression: SCN-002-020 publishes only field-complete cutoff-safe ReactionSegment v1 graphs
✔ Regression: SCN-002-017 publishes separate official and indicative price with exact-window volume context
✔ Regression: SCN-002-028 source acquisition is bounded reviewed fail-loud and no-write
✔ Regression: SCN-002-019 exposes upcoming then released CPI lineage without stale carry
✔ Regression: SCN-002-023 provider disagreement blocks a single CPI surprise and owner claim
✔ Regression: SCN-002-024 CPI revision appends while original release graph remains immutable
ℹ tests 7  ℹ pass 7  ℹ fail 0
```

### TP-04-10 baseline selftest

`node scripts/selftest.mjs` — Exit 0 — Claim Source: executed. The additive Scope 04 selftest group (12 checks under `Feature 002 Scope 04 event reaction and owner integration`) exercises the reaction primitive (non-zero window, straddling-bar exclusion, distinct/occurrence identities, graph revalidation) and the owner-integration surface (Bond supporting/eligible, forged-provenance rejection, final-author rejection, six validated owner reads, Real-Assets not-applicable, non-integrated applicability, and a byte-identical `rl-tool-read/v1` publisher round-trip).

```text
Feature 002 Scope 04 event reaction and owner integration
  ✓ … joinEventMarketReaction produces one partial cutoff-safe reaction segment
  ✓ … ReactionSegment preserves the exact non-zero comparison window (never remapped to bucket zero)
  ✓ … excludes the release-straddling bar and freezes the one-bar pre-release baseline
  ✓ … segment occurrence identity equals segmentId and stays distinct from the semantic identity
  ✓ … reaction graph revalidates through the Scope 01 validateEventMarketReaction primitive
  ✓ … Bond Regime owner read publishes a supporting owner interpretation and is action-eligible
  ✓ … rejects an interpretation forged away from the owning adapter provenance
  ✓ … forbids a final aggregator from publishing an owner interpretation
  ✓ … freezeToolReads publishes six validated ToolModelRead/v1 owner reads
  ✓ … Real Assets is explicitly not-applicable for a non-real-asset (SPY) run
  ✓ … a non-integrated live-market source carries explicit applicability and no interpretation
  ✓ … an existing rl-tool-read/v1 publisher projection round-trips byte-identically through putToolRead

Research-Lab self-test: 601 passed, 0 failed
```

## Scenario Contract Evidence

**SCN-002-020 (reaction):** the concrete reaction pipeline preserves exact `ReactionSegment/v1` membership and identity — the last complete bar ending at/before release is the one-bar frozen pre-release baseline (`12:25–12:30Z`), the bar starting at release is excluded (`release-straddling-bar-excluded`), the segment starts at the first theoretical calendar-grid bucket strictly after release (`startBucket 55`, never remapped to bucket zero), a missing first post-release row stays an explicit missing bucket, `buildComparableVolumeBaseline` consumes the segment through its unchanged signature and exact window, and later cutoffs/revisions link new occurrences without changing prior bytes. Evidence: TP-04-01 (RED `0 !== 55`), TP-04-02, TP-04-07, selftest group.

**SCN-002-026 (owner authority + shared-origin):** each eligible owner publishes its own supporting/contradicting/context/insufficient/not-applicable interpretation with model version and exact refs through its owning function; no foundation brief or final author can create or change an owner interpretation (`final-author-cannot-interpret`, `evidence-interpretation-provenance-mismatch`); static/synthetic/private/off-theme/continuous-session/non-integrated evidence stays ineligible or explicitly not-applicable (`non-integrated-source-cannot-interpret`, `not-applicable-source-cannot-affirm`); and shared Yahoo/BLS provenance alone cannot inflate confirmation into an action (`action-eligibility-without-owner-interpretation`). Evidence: TP-04-03 (RED forged-provenance accepted), TP-04-04, TP-04-05/06, TP-04-08, selftest group.

## Consumer and Shared Infrastructure Sweep

**Consumer Impact Sweep (Claim Source: executed).** `grep -rln` over `*.js`/`*.mjs`/`*.html` for `putToolRead`/`validateToolModelRead`/`freezeToolReads`/`buildOwnerEvidenceRead`/`OWNER_EVIDENCE_DECLARATIONS`: the new owner surfaces (`validateToolModelRead`, `freezeToolReads`, `buildOwnerEvidenceRead`, `OWNER_EVIDENCE_DECLARATIONS`) are consumed only by their definitions (`rldata.js`, `scripts/brief-refresh.mjs`), the additive `scripts/selftest.mjs` group, and the Scope 04 tests — no other production consumer is repointed. Every existing browser publisher and headless read (`sector-research-lab.html`, `global-rotation-lab.html`, `bond-regime-lab.html`, `real-assets-lab.html`, `etf-momentum-lab.html`, `company-fundamentals-lab.html`, `volatility-sizing-lab.html`, `rlvol.js`, and the technical-analysis/FX spec consumers) uses only the UNCHANGED legacy `putToolRead` path, which the additive `tool-model-read/v1` branch never intercepts (proven by the byte-identical round-trip in the canary and the selftest group). A search for `four publisher`/`publishers total four` returned zero matches (no stale "current publishers total four" assumption), and the only `regular-only` matches are unrelated Feature 006 Trend Dynamics method-availability text — no stale "Intraday Tape supplies pre/post evidence through its old regular-only path" assumption exists.

**Shared Infrastructure Impact Sweep (Claim Source: executed).** The protected high-fan-out surfaces (`rldata.js`, `scripts/brief-refresh.mjs`) are exercised by the independent owner canary (TP-04-05/06) which imports and runs each pre-change owner projection without the new bundle and asserts provider-credential state, browser-local privacy, source rights, and Bond restricted-field absence. Rollback is additive-field/adapter removal: every Scope 04 change is additive (new branch, new functions, new fields), and the three RED cycles demonstrated that each additive change reverts to a byte-identical anchor. No formula, generated history, or root dirty state is rewritten; `git status --porcelain` shows only the declared Scope 04 surface.

## Coverage Report

Coverage is expressed as scenario-to-test-to-evidence traceability for the two Scope 04 scenarios (SCN-002-020, SCN-002-026), not a line-coverage percentage — consistent with Scopes 01–03. Every Test Plan row TP-04-01 through TP-04-10 has executed evidence above; TP-04-01/02/03 additionally carry recorded RED discriminators. The additive selftest group raised the repository baseline from 589 to 601 checks with zero regressions.

## Lint and Quality

- `node scripts/validate-node-source-lock.mjs` → `[node-source-lock] OK adversarial=16 unexpectedAcceptances=0`, exit 0 (supply-chain source lock intact; Scope 04 touches no dependency manifest).
- `bash .github/bubbles/scripts/artifact-lint.sh specs/002-distributed-tool-briefs-and-history` → `Artifact lint PASSED.`, exit 0.
- `node scripts/validate-brief-cache.mjs` → `[brief-cache] PASS: 354 JSON cache files parsed …`, exit 0.
- `node scripts/validate-brief-payload.mjs market-brief.payload.json` → `[brief-contract] PASS …`, exit 0 (the additive `freezeToolReads` owner adapters do not disturb the Market Brief pipeline).
- No internal owner/model mock was introduced: the integration and canary suites execute the real production owner functions over committed fixtures. No `--skip`, interception, or self-validation shortcut was added. Full unfiltered command output was captured for every run; zero warnings and zero undeclared mutations.

## Validation Summary

Implement-phase delivery is complete and internally consistent: the reaction call-site vertical and the owner-integration surface are additive over the UNCHANGED Scope 01 primitive; TP-04-01/02/03 are proven by controlled-mutation RED-before-GREEN with byte-exact restore; TP-04-04..10 are executed GREEN; all declared sweeps pass. Independent certification (and any `done`/`certification.*` promotion) is owned by bubbles.validate and is not claimed here.

## Audit Verdict

Not independently audited. This report is implement-phase delivery evidence; `bubbles.audit`/`bubbles.validate` own the independent verdict.

## Uncertainty Declarations

None. Every DoD item checked in [scope.md](scope.md) is backed by a current-session command with its exact output, exit code, and Claim Source recorded above.
