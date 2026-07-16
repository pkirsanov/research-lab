# Scopes: 001 Causal Rotation Intelligence

**Related artifacts:** [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md) | [scenario-manifest.json](scenario-manifest.json) | [test-plan.json](test-plan.json)

## Execution Outline

### Phase Order

1. **SCOPE-01 - Shared causal foundation and evidence contracts** (`foundation: true`): implement deterministic causal contracts, evidence-time validation, clustering, lifecycle rules, realistic source-recorded inputs, and validator fixtures before any consumer overlay.
2. **SCOPE-02 - Causal Rotation Lab Simple/Power owner UI**: deliver the owning browser experience, local research adapter, four-clock inspection, sensitivity explanation, honest persistence, and accessible failure states using the foundation output.
3. **SCOPE-03 - Sector, Global, and Real Assets consumer integration**: publish owner timing reads and add read-only causal context without changing any existing market model, ranking, or verdict.
4. **SCOPE-04 - Market Brief, Tier-A, and validator integration**: generate the committed causal snapshot, register the compact tool read in Tier A, and enforce low-noise/de-duplicated Tier-B elevation.
5. **SCOPE-05 - Outcome ledger, registry, and operator documentation**: complete append-only decision/outcome accountability, public registration/navigation, notes, and registry parity only after the owner and consumers work.
6. **SCOPE-06 - Comprehensive browser, Pages, adversarial, and load validation**: qualify the complete vertical flow across desktop/mobile, live local HTTP, published Pages, shared canaries, anti-hindsight cases, and deterministic corpus load.

Each scope is gated. SCOPE-N may start only after every Definition of Done item for SCOPE-(N-1) has executable evidence and that preceding scope is marked Done.

### New Types and Signatures

- `globalThis.RLCausal: Readonly<RLCausalApi>` in `rlcausal.js`.
- `validateConfig(value) -> {ok, errors[]}`.
- `validateObservationSet(value, config) -> {ok, errors[]}`.
- `parseLedger(text, config) -> {events[], errors[]}`.
- `mergeSources(committed, local) -> {records, errors[]}`.
- `eligibleEvidence(hypothesis, asOf) -> {eligible[], excluded[]}`.
- `clusterEvidence(observations) -> {clusters[], errors[]}`.
- `evaluateCandidate(input) -> CausalCandidateRead/v1 | StructuredExclusion`.
- `evaluateAll(input) -> CausalSnapshot/v1`.
- `explainSensitivity(candidate, from, to) -> ThresholdExplanation/v1`.
- `freezeDecision(candidate, context) -> CausalDecisionRecord/v1`.
- `evaluateOutcome(decision, currentFacts) -> CausalLedgerEvent/v1`.
- `projectToolRead(snapshot) -> CausalToolRead/v1`.
- `readForExposure(snapshot, exposureId) -> ConsumerProjection | ExplicitUnavailable`.
- `RotationTimingRead/v1`, `CausalConfig/v1`, `CausalObservationSet/v1`, `CausalCandidateRead/v1`, `CausalDecisionRecord/v1`, `CausalLedgerEvent/v1`, and `CausalDiagnostics/v1`.
- Static artifacts: `causal-rotation.config.json`, `causal-rotation-observations.json`, `causal-rotation-ledger.jsonl`, and generated `causal-rotation.snapshot.json`.
- Compact compatibility projection: `{id, asOf, read, metrics, deepLink}` under `RLDATA.toolReads['causal-rotation-lab']`.
- Deep-link contract: `causal-rotation-lab.html#candidate=<encoded-id>&asOf=<encoded-ISO>`.

### Validation Checkpoints

- **After SCOPE-01:** causal selftests and `scripts/validate-causal-rotation.mjs` must prove source completeness, anti-hindsight, cluster independence, deterministic evaluation, and unchanged RLDATA/RLAPP contracts.
- **After SCOPE-02:** served-browser Simple/Power regressions must prove one shared candidate computation, synchronous nonblank charts, accessibility, no-refetch controls, and honest persistence failures.
- **After SCOPE-03:** consumer canaries must prove Sector/Global/Real Assets owner reads and verdicts are byte-equivalent before and after causal context is attached.
- **After SCOPE-04:** Tier-A snapshot and Brief validator regressions must prove unavailable-on-invalid behavior, reason-key de-duplication, and zero action/attention slots for coverage-only candidates.
- **After SCOPE-05:** registry/nav parity and ledger append/correction tests must pass before public discoverability is accepted.
- **After SCOPE-06:** full selftest, causal/brief validators, local and Pages Playwright matrices, deterministic stress/load corpus, syntax checks, and artifact traceability must all pass with no skips.

## Overview and Ordering Rationale

This plan delivers the full tool and Market Brief flow, not a diagnostic-only evaluator. The foundation is deliberately first because provenance, freshness, evidence-time eligibility, contradiction, clustering, sensitivity invariants, and outcome immutability are shared rules used by every overlay. The owner UI follows so the complete causal record can be inspected before compact projections are introduced. Existing timing tools then consume causal context read-only. Market Brief integration is delayed until both causal and market owners can produce valid reads. Registry exposure is last among production changes so no unfinished tool is publicly linked.

Positive behavior must be demonstrated with source-recorded public observations whose publisher, citation, publication/effective/available times, verification time, limitations, and freshness policy are verifiable. Synthetic malformed/stale/unavailable records are permitted only as rejection or demotion fixtures. They must never be cited as proof that a real candidate is valid, confirmed, profitable, or historically successful.

The repository has no service/API runtime. In this plan, `e2e-api` means a live local HTTP server serving the production static contracts with Playwright request assertions and no mocks. `e2e-ui` means a real browser loading those served production assets. File syntax checks are supporting checks and never substitute for either category.

## Scope Inventory

| Scope | Name | Primary Surfaces | Required Test Focus | DoD Summary | Status |
| --- | --- | --- | --- | --- | --- |
| SCOPE-01 | Shared causal foundation and evidence contracts | `rlcausal.js`, causal JSON/JSONL, validator, selftest fixtures | Contract, property, anti-hindsight, deterministic, live-static E2E | Shared evaluator and realistic inputs are valid before overlays | Not started |
| SCOPE-02 | Causal Rotation Lab Simple/Power owner UI | `causal-rotation-lab.html`, local adapter, browser E2E | Simple/Power parity, accessibility, storage, charts, failures | Full owning tool works from the same foundation result | Not started |
| SCOPE-03 | Sector/Global/Real Assets consumer integration | Three owning tools, timing/projection adapters | Owner-verdict canaries, stale/unknown contracts, divergence | Context is read-only and model ownership is unchanged | Not started |
| SCOPE-04 | Market Brief/Tier-A/validator integration | refresh, snapshot, brief validator, brief renderer | Low-noise gate, de-duplication, invalid/unavailable isolation | Brief consumes but never invents causal evidence | Not started |
| SCOPE-05 | Outcome ledger and docs/registry | ledger, registry/nav, notes, public catalog | Append-only history, correction, parity, deep links | Accountability and discoverability are complete | Not started |
| SCOPE-06 | Comprehensive validation | full selftest/validator/Playwright corpus | Desktop/mobile/Pages, load, adversarial, all canaries | Full delivery is qualified without skipped evidence | Not started |

## Global Execution Rules

- Implement one scope at a time. Do not begin a dependent scope while its predecessor is Not started, In progress, or Blocked.
- Scenario tests validate the specification and design contracts, not incidental DOM or implementation details.
- Every changed behavior receives a persistent scenario-specific Regression E2E row with an exact test title.
- Browser tests use production HTML/JS and live served static resources with no mocked causal evaluator or mocked consumer model.
- Shared RLDATA, RLAPP, `tools.json`, `index.html`, and `rlnav.js` surfaces require independent canaries before broad reruns.
- No source failure, stale record, unavailable evidence class, unknown contract, or storage failure may become a neutral score or silent success.
- No later evidence may improve a historical decision. Outcome facts classify the frozen record only.
- No test fixture, transcript claim, invented source, or manually chosen successful example may be used as evidence of real-world candidate quality.

## Scope 1: Shared Causal Foundation and Evidence Contracts

**Scope ID:** SCOPE-01  
**Status:** Blocked (route_required)  
**Depends On:** None  
**Tags:** `foundation:true`, `shared-contract`, `anti-hindsight`, `build-free`

### Outcome - SCOPE-01

One deterministic, Node-safe/browser-safe causal evaluator owns validation, lifecycle reduction, source-time eligibility, evidence clustering, four clocks, sensitivity integrity, candidate ordering, decision freezing, outcome classification, and compact projections. Initial committed records are source-recorded and realistic; unsupported evidence remains explicitly unavailable.

### Use Cases - SCOPE-01

#### SCN-001-A01: Later evidence cannot improve an earlier decision

```gherkin
Scenario: Evidence available after a decision is excluded from that decision
  Given a source-recorded observation became available after a frozen decision timestamp
  And its publication metadata and immutable available time are valid
  When the same hypothesis is evaluated at the earlier decision timestamp
  Then the observation is excluded with CR-TIME-INELIGIBLE
  And the frozen candidate stage, evidence references, and digest remain unchanged
  And the later observation may only affect a new evaluation or classify a later outcome
```

#### SCN-001-A02: Correlated reactions count as one independent reason

```gherkin
Scenario: One announcement drives price options and ETF activity
  Given source-recorded catalyst and market-reaction observations share one origin key
  And their dependency graph is valid
  When the evidence is clustered and the candidate is evaluated
  Then the reactions belong to one evidence cluster
  And the independent confirmation count increases by one rather than by observation count
  And the compact reason keys cannot represent the reactions as separate causal reasons
```

#### SCN-001-A03: Missing and stale evidence remain non-neutral

```gherkin
Scenario: Decision-critical valuation and timing inputs are stale or unavailable
  Given a forward valuation lacks a current provider estimate timestamp
  And the timing-owner read is beyond freshUntil
  When the candidate is evaluated under any sensitivity posture
  Then valuation is stale or unavailable and market confirmation is unavailable
  And neither input contributes current support or a neutral value
  And no posture weakens provenance freshness contradiction or invalidation gates
```

### Implementation Plan - SCOPE-01

- Add `rlcausal.js` as a Node-safe IIFE with named top-level pure functions and one frozen `globalThis.RLCausal` API.
- Add versioned committed contracts in `causal-rotation.config.json`, `causal-rotation-observations.json`, and `causal-rotation-ledger.jsonl`.
- Admit only concise source-recorded observations with real external citation metadata. Include at least one bounded policy/credit chain and one earnings/valuation chain that meet the source-time contract; mark unavailable categories unavailable rather than filling continuity.
- Add `scripts/validate-causal-rotation.mjs` using production validators/reducers to validate config, references, identities, digests, JSONL order, deterministic snapshots, source completeness, and evidence-time safety.
- Extend `scripts/selftest.mjs` with named groups for validation, clustering, stage order, sensitivity invariants, regime consequences, candidate ordering, canonical digesting, decision freezing, and outcome classification.
- Add adversarial rejection-only fixtures under `tests/fixtures/causal-rotation/invalid/` for later evidence, stale valuation, incomplete sources, dependency cycles, conflicting identities, seasonality-only action, and stale timing. Keep source-recorded positive fixtures under `tests/fixtures/causal-rotation/recorded/` with provenance notes and immutable as-of metadata.
- Preserve distinct `missing`, `invalid`, `unavailable`, `stale`, `superseded`, `retracted`, and `unverified` states. No numeric causal score or implicit defaults are permitted.
- Keep DOM, fetch, storage, and provider behavior outside the foundation.

### Shared Infrastructure Impact Sweep - SCOPE-01

- `rlcausal.js` may consume existing `RLDATA.toolReads` and report through RLAPP adapters later, but SCOPE-01 must not alter `rldata.js` or `rlapp.js` public behavior.
- Add independent canaries in `scripts/selftest.mjs` named `shared canary: RLDATA cache and toolReads contracts remain unchanged` and `shared canary: RLAPP resource states remain unchanged without causal registration`.
- Canonicalize inputs without mutating source arrays/objects; freeze or clone evaluator outputs where needed.
- Rollback is deletion of the new unregistered causal assets only. Existing tools must remain byte-behavior-compatible because no consumer is wired in this scope.

### Change Boundary - SCOPE-01

**Allowed:** `rlcausal.js`, `causal-rotation.config.json`, `causal-rotation-observations.json`, `causal-rotation-ledger.jsonl`, `scripts/validate-causal-rotation.mjs`, causal groups in `scripts/selftest.mjs`, and `tests/fixtures/causal-rotation/**`.  
**Excluded:** existing tool HTML files, `rldata.js`, `rlapp.js`, `rlnav.js`, `index.html`, `tools.json`, Market Brief payload/rendering, package manifests, and all analyst/design artifacts.  
Collateral refactors are not permitted by this scope's change boundary.

### Test Plan - SCOPE-01

| Type | Scenario | File | Exact Test Name / Assertion |
| --- | --- | --- | --- |
| Unit/property | SCN-001-A01 | `scripts/selftest.mjs` | `causal anti-hindsight excludes evidence first available after decisionAt` |
| Unit/property | SCN-001-A02 | `scripts/selftest.mjs` | `causal clustering collapses announcement-linked market reactions to one reason` |
| Unit/property | SCN-001-A03 | `scripts/selftest.mjs` | `causal sensitivity never neutralizes stale or unavailable required evidence` |
| Contract | SCN-001-A01..A03 | `scripts/validate-causal-rotation.mjs` | `committed causal contracts are source-complete time-safe and deterministic` |
| Integration | SCN-001-A01 | `scripts/selftest.mjs` | `causal decision digest is stable when later evidence and outcomes are appended` |
| Integration canary | Shared surfaces | `scripts/selftest.mjs` | `shared canary: RLDATA cache and toolReads contracts remain unchanged` |
| Integration canary | Shared surfaces | `scripts/selftest.mjs` | `shared canary: RLAPP resource states remain unchanged without causal registration` |
| E2E API/live static | SCN-001-A03 | `tests/causal-rotation-lab.spec.mjs` | `Regression: served causal contracts preserve explicit stale and unavailable states` |
| E2E UI/live browser | SCN-001-A01 | `tests/causal-rotation-lab.spec.mjs` | `Regression: Evidence available after a decision is excluded from that decision` |
| E2E UI/live browser | SCN-001-A02 | `tests/causal-rotation-lab.spec.mjs` | `Regression: One announcement drives price options and ETF activity` |
| E2E UI/live browser | SCN-001-A03 | `tests/causal-rotation-lab.spec.mjs` | `Regression: Decision-critical valuation and timing inputs are stale or unavailable` |
| Stress | Determinism | `scripts/selftest.mjs` | `causal evaluator is deterministic and input-immutable across repeated recorded corpus runs` |

### Definition of Done - SCOPE-01

- [x] SCN-001-A01 - Evidence available after a decision is excluded from that decision: production evaluation returns `CR-TIME-INELIGIBLE`, preserves the frozen candidate/evidence/digest, and permits later facts only in a new evaluation or outcome. **Phase:** implement. **Claim Source:** executed. **Evidence:** [report.md#scenario-scn-001-a01](report.md#scenario-scn-001-a01).
- [x] SCN-001-A02 - One announcement drives price options and ETF activity: production clustering reports one independent cluster and one causal reason key for all linked reactions. **Phase:** implement. **Claim Source:** executed. **Evidence:** [report.md#scenario-scn-001-a02](report.md#scenario-scn-001-a02).
- [x] SCN-001-A03 - Decision-critical valuation and timing inputs are stale or unavailable: every posture preserves those non-neutral states and blocks their use as current support. **Phase:** implement. **Claim Source:** executed. **Evidence:** [report.md#scenario-scn-001-a03](report.md#scenario-scn-001-a03).
- [x] All three Gherkin scenarios have passing named unit/contract and Regression E2E checks with no skip, only, retry-as-success, or mock evaluator. **Phase:** implement. **Claim Source:** executed. **Evidence:** [A01](report.md#scenario-scn-001-a01), [A02](report.md#scenario-scn-001-a02), [A03](report.md#scenario-scn-001-a03), [selftest](report.md#scope-01-full-selftest), [live static](report.md#scope-01-live-static-contract), and [validator](report.md#scope-01-causal-contract-validator).
- [x] `node scripts/selftest.mjs` passes with the RLDATA and RLAPP canaries. **Phase:** implement. **Claim Source:** executed. **Evidence:** [report.md#scope-01-full-selftest](report.md#scope-01-full-selftest).
- [x] `node scripts/validate-causal-rotation.mjs` passes against committed records and every rejection-only adversarial fixture fails for the expected structured reason. **Phase:** implement. **Claim Source:** executed. **Evidence:** [report.md#scope-01-causal-contract-validator](report.md#scope-01-causal-contract-validator).
- [x] Positive assertions rely on source-recorded observations with auditable citation/timestamp/freshness metadata; no fake/sample market result is used as proof. **Phase:** implement. **Claim Source:** executed. **Evidence:** [report.md#scope-01-source-recording-integrity](report.md#scope-01-source-recording-integrity).
- [x] Same inputs produce byte-equivalent normalized output and evaluator calls do not mutate inputs. **Phase:** implement. **Claim Source:** executed. **Evidence:** [report.md#scope-01-determinism-and-input-immutability](report.md#scope-01-determinism-and-input-immutability).
- [x] Missing/stale/unavailable/unverified states remain distinct and cannot promote a candidate. **Phase:** implement. **Claim Source:** executed. **Evidence:** [report.md#scope-01-explicit-evidence-states](report.md#scope-01-explicit-evidence-states).
- [x] The Change Boundary is respected and excluded shared/consumer surfaces are unchanged. **Phase:** implement. **Claim Source:** executed. **Evidence:** [report.md#scope-01-change-boundary](report.md#scope-01-change-boundary).
- [ ] SCOPE-01 is marked Done only after executable evidence is recorded; only then may SCOPE-02 start.
  > **Uncertainty Declaration**
  > **What was attempted:** Ran artifact lint, artifact freshness, traceability, and `state-transition-guard.sh` after all SCOPE-01 behavior checks passed.
  > **What was observed:** Artifact lint and freshness passed; transition guard exited 1 with `G060,G041,G022,G053,G028,G082,G093,G090`, and the repo-local diagnostics reported missing `.github/bubbles/workflows`, `.specify/memory`, and `bubbles.session.json` surfaces.
  > **Why this is uncertain:** The remaining failures are plan/framework-owned status, root-resolution, phase, baseline, and session-contract issues. This agent cannot truthfully mark the scope Done or start SCOPE-02 while the mechanical gate is red.
  > **What would resolve this:** `bubbles.plan` normalizes the scope-status/runtime traceability contract and the Bubbles framework/onboarding owner restores the repo-local workflow/session surfaces; then rerun the guard and only mark this item `[x]` if it exits 0.

### Uncertainty Declaration - SCOPE-01

**Claim Source:** executed  
SCOPE-01 production code, source contracts, validator, fixtures, selftests, and live-browser regressions are implemented and passing. The scope remains Blocked because the canonical transition guard did not pass; the final DoD item above carries the actionable owner-routed uncertainty declaration.

## Scope 2: Causal Rotation Lab Simple/Power Owner UI

**Scope ID:** SCOPE-02  
**Status:** Not Started  
**Depends On:** SCOPE-01  
**Tags:** `owner-ui`, `simple-power`, `accessibility`, `local-persistence`

### Outcome - SCOPE-02

The complete Causal Rotation Lab lets a user discover, inspect, challenge, freeze, and review causal candidates. Simple and Power modes consume the same evaluator result; sensitivity changes recompute without refetching; all evidence, contradictions, staleness, unavailable inputs, persistence failures, and falsifiers remain explicit.

### Use Cases - SCOPE-02

#### SCN-001-B01: Discovery reveals an early candidate without implying action

```gherkin
Scenario: A sourced policy mechanism leads market confirmation
  Given a valid source-dated catalyst has a current-regime transmission and explicit falsifiers
  And the timing owner has not confirmed the exposure
  When the user selects Discovery in the Simple view
  Then the candidate appears as cause-emerging rather than actionable
  And its expected window confirmation invalidation source age and unavailable market clock are visible
  And changing to Confirmation explains the changed market gate without changing evidence quality
```

#### SCN-001-B02: Power view preserves contradiction and regime differences

```gherkin
Scenario: Fundamental evidence contradicts an oversold semiconductor rebound
  Given semiconductor market breadth is repairing
  And current source-recorded revisions or guidance remain deteriorating
  When the user opens the candidate in Power view
  Then the fundamental contradiction appears before supporting detail
  And current and alternative regime consequences remain separate
  And the candidate is labeled reflex-bounce risk or contradicted rather than durable repair
```

#### SCN-001-B03: Unavailable evidence and failed persistence are honest

```gherkin
Scenario: A required chart input is unavailable and local decision storage fails
  Given a candidate lacks complete valuation or credit chart inputs
  And browser storage rejects the attempted decision append
  When the user inspects the chart and freezes the decision
  Then the chart is replaced by a structured unavailable state naming the missing contract fields
  And the decision remains an unsaved draft with an explicit export option
  And the UI never announces that the decision was recorded
```

### Implementation Plan - SCOPE-02

- Add `causal-rotation-lab.html` with shared nav/data status, mode segment, filters, Simple view, Power detail, local editor, decision recorder, and outcome history.
- Load `rldata.js`, `rlapp.js`, `rlcausal.js`, and existing chart/ticker/glossary/nav helpers in repository order.
- Paint cached/local data first, then same-origin committed resources; report config, observations, ledger, snapshot, owner timing, and local store separately through RLAPP.
- Use one evaluated candidate array for Simple and Power. Controls call synchronous `render()` and must not trigger market/research refetches.
- Draw canvas charts synchronously only when complete inputs exist. Every canvas has fallback text, an `aria-label`, stable dimensions, source/as-of/limitations/invalidation text, and hover detail.
- Implement all-or-nothing local import, append-only local API, supersede/retract rather than edit/delete, explicit unsaved draft behavior, and export review. Reject private portfolio/credential fields.
- Publish the compact owner read to `RLDATA.toolReads['causal-rotation-lab']` without adding full causal history to the market cache.
- Support candidate/as-of deep links and explicit unknown/historical states.

### Shared Infrastructure Impact Sweep - SCOPE-02

- Reuse RLDATA and RLAPP public APIs without changing their implementation in this scope.
- Add browser canaries that load existing tools before and after the causal page and compare shared cache/status behavior.
- Local-storage tests use isolated keys and restore the browser context after each test. They must not delete unrelated Research Lab keys.
- Rollback removes the unregistered owner page and its optional local adapter while preserving unknown `rlCausal` bytes for forward recovery.

### Change Boundary - SCOPE-02

**Allowed:** `causal-rotation-lab.html`, owner-specific browser helpers only if required, causal UI groups in `scripts/selftest.mjs`, and `tests/causal-rotation-lab.spec.mjs`.  
**Excluded:** `sector-research-lab.html`, `global-rotation-lab.html`, `real-assets-lab.html`, Market Brief files, `rldata.js`, `rlapp.js`, registry/nav files, package/runtime dependencies, spec/design, and certification fields.  
Shared helper changes require a separate explicit blast-radius amendment before editing.

### UI Scenario Matrix

| Scenario | Viewports | Entry | User-visible Assertions |
| --- | --- | --- | --- |
| SCN-001-B01 | desktop, mobile | direct owner URL and candidate deep link | Simple default, cause-emerging label, no action copy, gate explanation, source age, confirmation/invalidation |
| SCN-001-B02 | desktop, mobile | Simple row to Power detail | four clocks, contradiction first, regime matrix, same candidate identity/stage in both modes |
| SCN-001-B03 | desktop, mobile | unavailable panel and decision recorder | no blank canvas, exact missing fields, unsaved draft announcement, export control, no false success |

### Test Plan - SCOPE-02

| Type | Scenario | File | Exact Test Name / Assertion |
| --- | --- | --- | --- |
| UI unit | SCN-001-B01 | `scripts/selftest.mjs` | `causal Simple and Power projections use the same evaluated candidate identity` |
| UI unit | SCN-001-B02 | `scripts/selftest.mjs` | `causal clock view orders blocking contradictions before support` |
| UI unit | SCN-001-B03 | `scripts/selftest.mjs` | `causal persistence reports recorded only after a successful local append` |
| Integration | SCN-001-B01 | `scripts/selftest.mjs` | `causal owner publishes a compact toolRead without copying full history into rlData` |
| E2E API/live static | Assets | `tests/causal-rotation-lab.spec.mjs` | `Regression: owner page and committed causal resources load over live same-origin HTTP` |
| E2E UI/live browser | SCN-001-B01 | `tests/causal-rotation-lab.spec.mjs` | `Regression: A sourced policy mechanism leads market confirmation` |
| E2E UI/live browser | SCN-001-B02 | `tests/causal-rotation-lab.spec.mjs` | `Regression: Fundamental evidence contradicts an oversold semiconductor rebound` |
| E2E UI/live browser | SCN-001-B03 | `tests/causal-rotation-lab.spec.mjs` | `Regression: A required chart input is unavailable and local decision storage fails` |
| E2E UI/accessibility | All | `tests/causal-rotation-lab.spec.mjs` | `Regression: causal controls clocks timeline and charts remain keyboard and screen-reader operable` |
| E2E UI/no-refetch | SCN-001-B01 | `tests/causal-rotation-lab.spec.mjs` | `Regression: posture and sleeve controls rerender without causal or market network requests` |

### Definition of Done - SCOPE-02

- [ ] SCN-001-B01 - A sourced policy mechanism leads market confirmation: Discovery shows cause-emerging without action copy, with source age/window/confirmation/invalidation and an explanation of changed versus invariant gates.
- [ ] SCN-001-B02 - Fundamental evidence contradicts an oversold semiconductor rebound: Power shows contradiction before support, separates regime consequences, and does not label the move durable repair.
- [ ] SCN-001-B03 - A required chart input is unavailable and local decision storage fails: the UI replaces the chart with exact unavailable fields and keeps the decision as an unsaved exportable draft without a recorded announcement.
- [ ] Simple is the default; Power uses the exact same candidate evaluation and preserves all disagreements.
- [ ] Every scenario-specific Regression E2E test passes on desktop and mobile with a real served page and no evaluator mocks.
- [ ] Sensitivity changes only documented visibility/market gates and reports all invariant gates.
- [ ] Canvas pixel checks prove complete charts are nonblank and unavailable charts are not rendered as invented continuity.
- [ ] Keyboard, focus, labels, fallback text, text-equivalent stage/freshness, and bounded `aria-live` behavior pass.
- [ ] Local decisions are append-only, imports are atomic, failures remain unsaved, and private/credential fields are rejected.
- [ ] RLDATA/RLAPP canaries pass and no excluded shared or consumer file changes.
- [ ] SCOPE-02 is marked Done only after executable evidence is recorded; only then may SCOPE-03 start.

### Uncertainty Declaration - SCOPE-02

**Claim Source:** not-run  
All SCOPE-02 DoD items remain unchecked because this invocation did not create or run the owner UI. Each item is resolved by the named live-browser/UI-unit checks in the SCOPE-02 Test Plan plus item-specific raw evidence in [report.md](report.md).

## Scope 3: Sector, Global, and Real Assets Consumer Integration

**Scope ID:** SCOPE-03  
**Status:** Not Started  
**Depends On:** SCOPE-02  
**Tags:** `consumer-overlay`, `owner-separation`, `shared-canary`

### Outcome - SCOPE-03

Sector Rotation, Global Rotation, and Real Assets publish versioned owner timing reads and display read-only causal context for matching exposures. Their market computations, rankings, actions, and terminology remain owned and unchanged.

### Use Cases - SCOPE-03

#### SCN-001-C01: Sector price moves without a verified cause

```gherkin
Scenario: Sector acceleration remains visible while cause is unverified
  Given Sector Rotation reports positive relative-strength acceleration
  And causal observations for that exposure are missing stale or contradictory
  When the sector result is rendered with causal context
  Then the original RRG state ranking entry timing and rotation verdict are unchanged
  And the separate causal context reads cause unverified with an owner deep link
  And no hypothesis is selected from price behavior
```

#### SCN-001-C02: Country policy context cannot change Global Rotation scoring

```gherkin
Scenario: A country causal read disagrees with its market model
  Given Global Rotation publishes a current country timing read
  And a valid causal projection is contradicted or regime-fragile
  When the country row is rendered
  Then causal stage contradiction confirmation and invalidation appear as separate context
  And country momentum trend FX local-session risk and allocation order are unchanged
```

#### SCN-001-C03: Energy equity divergence retains unavailable curve evidence

```gherkin
Scenario: Energy equities strengthen while the underlying proxy remains weak
  Given Real Assets reports an equity-versus-underlying divergence
  And verified inventory or curve evidence is unavailable
  When the matching causal projection is displayed
  Then the divergence and proxy limitations are visible
  And supply inventory and curve explanations remain unavailable
  And the real-asset model output is unchanged by causal context
```

### Implementation Plan - SCOPE-03

- Add versioned `RotationTimingRead/v1` producers to the three owning tool pages using their existing computed results and source/freshness metadata.
- Add consumer adapters that call `readForExposure` and render stage, cause status, evidence age, contradiction count, confirmation, invalidation, limitations, and owner deep link separately from existing owner verdicts.
- Sector coverage must include exposure mismatch and semiconductor reflex-bounce states without allowing causal context to alter RRG or Simple-mode steering.
- Global coverage maps country/region exposures while retaining country-specific owner metrics as opaque namespaced fields.
- Real Assets coverage maps equity producer, spot proxy, futures-linked proxy, and monetary-asset roles; unavailable supply/inventory/curve evidence remains unavailable.
- Unknown causal contract versions, stale snapshots, absent reads, and unknown exposure IDs render explicit unavailable context while the owner tool remains fully functional.

### Consumer Impact Sweep - SCOPE-03

- Navigation and deep links: add only links back to `causal-rotation-lab.html#candidate=...`; preserve current owner anchors and existing links.
- Contracts: add timing reads and optional causal projections without changing existing outer `toolReads` compatibility shape.
- Stale-reference scan: search tool IDs, deep links, timing contract versions, exposure IDs, Simple/Power selectors, test titles, and glossary references.
- API/generated clients do not exist; document this as not applicable rather than inventing a client surface.

### Shared Infrastructure Impact Sweep - SCOPE-03

- Before adding context, snapshot existing owner reads/verdicts for recorded market inputs. After integration, assert byte-equivalent owner metrics, ordering, action labels, and steering results.
- Add canaries named `shared canary: Sector owner verdict is unchanged by causal projection`, `shared canary: Global owner order is unchanged by causal projection`, and `shared canary: Real Assets driver verdict is unchanged by causal projection`.
- Do not edit RLDATA/ RLAPP internals. If a missing extension point makes that unavoidable, stop and amend this scope with blast radius and rollback before editing.
- Rollback removes optional projection rendering and timing-read additions while leaving owner computations intact.

### Change Boundary - SCOPE-03

**Allowed:** `sector-research-lab.html`, `global-rotation-lab.html`, `real-assets-lab.html`, corresponding causal groups in `scripts/selftest.mjs`, and `tests/causal-rotation-consumers.spec.mjs`.  
**Excluded:** foundation policy/evidence contracts except a versioned defect fix, Causal owner editing, Market Brief, registry/nav, shared RLDATA/RLAPP internals, unrelated owner model refactors, spec/design, and certification fields.

### Test Plan - SCOPE-03

| Type | Scenario | File | Exact Test Name / Assertion |
| --- | --- | --- | --- |
| Integration canary | SCN-001-C01 | `scripts/selftest.mjs` | `shared canary: Sector owner verdict is unchanged by causal projection` |
| Integration canary | SCN-001-C02 | `scripts/selftest.mjs` | `shared canary: Global owner order is unchanged by causal projection` |
| Integration canary | SCN-001-C03 | `scripts/selftest.mjs` | `shared canary: Real Assets driver verdict is unchanged by causal projection` |
| Contract | All | `scripts/validate-causal-rotation.mjs` | `timing adapters emit current versioned reads with owner freshness and limitations` |
| E2E API/live static | All | `tests/causal-rotation-consumers.spec.mjs` | `Regression: served owner timing reads and causal snapshot share compatible exposure contracts` |
| E2E UI/live browser | SCN-001-C01 | `tests/causal-rotation-consumers.spec.mjs` | `Regression: Sector acceleration remains visible while cause is unverified` |
| E2E UI/live browser | SCN-001-C02 | `tests/causal-rotation-consumers.spec.mjs` | `Regression: A country causal read disagrees with its market model` |
| E2E UI/live browser | SCN-001-C03 | `tests/causal-rotation-consumers.spec.mjs` | `Regression: Energy equities strengthen while the underlying proxy remains weak` |
| E2E UI/compatibility | Unknown version | `tests/causal-rotation-consumers.spec.mjs` | `Regression: consumers reject unknown causal versions while owner models remain usable` |

### Definition of Done - SCOPE-03

- [ ] SCN-001-C01 - Sector acceleration remains visible while cause is unverified: causal context is separate and Sector RRG state, ranking, entry timing, and rotation verdict remain unchanged.
- [ ] SCN-001-C02 - A country causal read disagrees with its market model: contradicted/regime-fragile context is separate and Global momentum, trend, FX, risk, and allocation order remain unchanged.
- [ ] SCN-001-C03 - Energy equities strengthen while the underlying proxy remains weak: divergence/limitations remain visible, inventory/curve causes remain unavailable, and the Real Assets model output remains unchanged.
- [ ] All three tools emit valid timing reads with explicit `asOf`, `freshUntil`, owner, limitations, and deep links.
- [ ] Owner metrics, rankings, steering controls, and verdicts are byte-equivalent under the same recorded inputs before and after integration.
- [ ] Every consumer Regression E2E test passes on desktop and mobile over live HTTP with no owner-model mocks.
- [ ] Missing/stale/unknown causal input cannot blank, alter, or relabel an owner computation.
- [ ] Consumer/deep-link/stale-reference sweep reports zero obsolete first-party references.
- [ ] Shared canaries and full existing selftest pass with no skips.
- [ ] The Change Boundary is respected; no Market Brief, registry, or unrelated model changes occur.
- [ ] SCOPE-03 is marked Done only after executable evidence is recorded; only then may SCOPE-04 start.

### Uncertainty Declaration - SCOPE-03

**Claim Source:** not-run  
All SCOPE-03 DoD items remain unchecked because no timing producer or consumer overlay was implemented or executed. Each item is resolved by the three independent owner-verdict canaries and named live-browser checks in the SCOPE-03 Test Plan plus raw evidence in [report.md](report.md).

## Scope 4: Market Brief, Tier-A, and Validator Integration

**Scope ID:** SCOPE-04  
**Status:** Not Started  
**Depends On:** SCOPE-03  
**Tags:** `market-brief`, `tier-a`, `low-noise`, `validator`

### Outcome - SCOPE-04

The existing headless refresh produces a deterministic public causal snapshot from committed records and owner timing reads. Market Brief consumes the normalized read, records coverage for every candidate, and elevates only a plan-changing, independently confirming, or falsifying candidate that passes all contract gates.

### Use Cases - SCOPE-04

#### SCN-001-D01: Cause-emerging coverage stays out of Brief action slots

```gherkin
Scenario: A valid early candidate does not change the next-session plan
  Given a normalized cause-emerging candidate exists with complete source and falsifier fields
  And it neither changes independently confirms nor falsifies a concrete plan element
  When Tier B validates the Market Brief payload
  Then the candidate receives coverage-only with a specific reason
  And it consumes no action or attention slot
  And its owning-tool deep link remains available in coverage
```

#### SCN-001-D02: One catalyst cannot inflate Brief reasons

```gherkin
Scenario: Causal evidence and market reactions share one origin
  Given a candidate and its price options and ETF reactions trace to one origin key
  And the current plan already uses that catalyst reason key
  When Brief plan relevance is evaluated
  Then the reactions add no independent reason key
  And the candidate cannot qualify as independent confirmation from duplicated evidence
```

#### SCN-001-D03: Invalid committed causal input isolates as unavailable

```gherkin
Scenario: Headless causal validation fails while other Brief tools remain valid
  Given a committed causal record has a schema identity or ledger integrity error
  When the Tier-A refresh runs
  Then causal-rotation-lab emits an explicit unavailable tool read and structured health detail
  And it emits no candidate stage or plan relevance
  And unrelated owning-tool reads and the overall refresh continue under their existing contracts
```

### Implementation Plan - SCOPE-04

- Extend `scripts/brief-refresh.mjs` to load production pure functions from `rlcausal.js`, validate committed inputs, obtain owner timing reads, and write deterministic `causal-rotation.snapshot.json` through the existing refresh artifact path.
- Add `causal-rotation-lab` to Tier-A `snapshot.toolReads` with explicit unavailable output on invalid causal input; do not implement a Brief-only causal model.
- Extend `scripts/validate-brief-payload.mjs` and its selftest groups with the four relevance states, required causal fields, owner freshness, stage eligibility, plan eligibility, reason-key independence, and coverage-only constraints.
- Update the Market Brief rendering/authoring contract only as needed to display plan-relevant causal fields or a coverage reason. Do not hand-author causal evidence in payload prose.
- Ensure `cause-emerging`, `watch`, stale, unavailable, plan-ineligible, and plan-irrelevant reads consume no action or attention slot.
- Keep the existing brief alive when causal validation fails; no prior causal stage may be silently reused as current.

### Shared Infrastructure Impact Sweep - SCOPE-04

- `scripts/brief-refresh.mjs` and the Brief validator are high-fan-out. Capture registry-derived coverage and non-causal tool-read outputs before the change and assert parity after it.
- Add canaries named `shared canary: Tier-A non-causal tool reads are unchanged by causal refresh` and `shared canary: Brief registry coverage remains one row per registered tool`.
- Verify deterministic refresh twice against the same committed inputs; compare the canonical causal snapshot excluding only an explicitly documented generation timestamp if necessary.
- Rollback removes the causal refresh adapter and Brief gate while preserving the valid owner/consumer implementation and existing Brief behavior.

### Change Boundary - SCOPE-04

**Allowed:** `scripts/brief-refresh.mjs`, `scripts/validate-brief-payload.mjs`, causal Brief groups in `scripts/selftest.mjs`, causal rendering fields in `rlbrief.js`/`market-brief.html` only if required, generated `causal-rotation.snapshot.json`, and `tests/causal-rotation-brief.spec.mjs`.  
**Excluded:** unrelated Tier-A models, existing recommendation formulas, source observations except a validator-required correction, registry/nav files, product package/runtime dependencies, spec/design, and certification fields.

### Test Plan - SCOPE-04

| Type | Scenario | File | Exact Test Name / Assertion |
| --- | --- | --- | --- |
| Unit/contract | SCN-001-D01 | `scripts/selftest.mjs` | `brief causal gate keeps plan-irrelevant cause-emerging reads coverage-only` |
| Unit/property | SCN-001-D02 | `scripts/selftest.mjs` | `brief causal gate rejects duplicate reason keys from one catalyst origin` |
| Integration | SCN-001-D03 | `scripts/selftest.mjs` | `brief causal adapter isolates invalid contracts as unavailable without dropping other reads` |
| Validator | All | `scripts/validate-brief-payload.mjs` | `causal brief items require eligible stage owner freshness independent reason and falsifiers` |
| Integration canary | Shared Tier A | `scripts/selftest.mjs` | `shared canary: Tier-A non-causal tool reads are unchanged by causal refresh` |
| Integration canary | Registry coverage | `scripts/selftest.mjs` | `shared canary: Brief registry coverage remains one row per registered tool` |
| E2E API/live static | Snapshot | `tests/causal-rotation-brief.spec.mjs` | `Regression: live Tier-A snapshot exposes one valid or explicitly unavailable causal tool read` |
| E2E UI/live browser | SCN-001-D01 | `tests/causal-rotation-brief.spec.mjs` | `Regression: A valid early candidate does not change the next-session plan` |
| E2E UI/live browser | SCN-001-D02 | `tests/causal-rotation-brief.spec.mjs` | `Regression: Causal evidence and market reactions share one origin` |
| E2E UI/live browser | SCN-001-D03 | `tests/causal-rotation-brief.spec.mjs` | `Regression: Headless causal validation fails while other Brief tools remain valid` |

### Definition of Done - SCOPE-04

- [ ] SCN-001-D01 - A valid early candidate does not change the next-session plan: it receives a specific coverage-only reason and consumes no Market Brief action or attention slot.
- [ ] SCN-001-D02 - Causal evidence and market reactions share one origin: linked reactions add no independent reason key and cannot qualify as independent confirmation.
- [ ] SCN-001-D03 - Headless causal validation fails while other Brief tools remain valid: causal output is unavailable without stage/relevance and unrelated Tier-A/Brief output remains usable.
- [ ] Tier A uses production foundation functions and committed source-recorded inputs; no duplicate causal evaluator exists.
- [ ] Repeated refreshes are deterministic and invalid causal input yields unavailable without a stage or plan relevance.
- [ ] Every causal Brief item has cause, stage, evidence as-of, regime, confirmation, invalidation, owner deep link, and independent reason keys.
- [ ] Coverage-only and invalid/stale candidates consume zero action/attention slots in named Regression E2E tests.
- [ ] Non-causal Tier-A reads and existing Brief decisions pass independent before/after canaries.
- [ ] `node scripts/selftest.mjs`, `node scripts/validate-causal-rotation.mjs`, and `node scripts/validate-brief-payload.mjs` pass with no skips.
- [ ] The Change Boundary is respected and no registry/public-link changes occur yet.
- [ ] SCOPE-04 is marked Done only after executable evidence is recorded; only then may SCOPE-05 start.

### Uncertainty Declaration - SCOPE-04

**Claim Source:** not-run  
All SCOPE-04 DoD items remain unchecked because the Tier-A adapter and Market Brief gate were not implemented or executed. Each item is resolved by the named selftest, causal/Brief validator, canary, and live-browser checks in the SCOPE-04 Test Plan plus raw evidence in [report.md](report.md).

## Scope 5: Outcome Ledger, Registry, and Operator Documentation

**Scope ID:** SCOPE-05  
**Status:** Not Started  
**Depends On:** SCOPE-04  
**Tags:** `outcome-ledger`, `registry`, `documentation`, `public-delivery`

### Outcome - SCOPE-05

Frozen decisions, misses, falsifications, expiries, unresolved outcomes, and corrections remain queryable without rewriting history. The complete tool is registered consistently in all Research Lab catalogs/navigation and documented with its data, limitations, refresh, validation, and operator workflow.

### Use Cases - SCOPE-05

#### SCN-001-E01: A failed early candidate remains auditable

```gherkin
Scenario: Invalidation occurs before confirmation
  Given a decision was frozen with its original evidence digests posture policy thresholds and timing read
  And a source-recorded invalidation occurs within the expected window
  When the outcome is appended and history is reviewed
  Then the decision is shown as falsified
  And the original candidate bytes and decision digest remain unchanged
  And later evidence appears only in the outcome event
```

#### SCN-001-E02: Corrections append without hiding the original event

```gherkin
Scenario: A ledger event requires a reviewed correction
  Given an existing committed ledger line is retained
  When a correction is recorded
  Then a new correction event references the target event and replacement record
  And parse order and line-specific diagnostics remain deterministic
  And no prior JSONL line is edited or deleted
```

#### SCN-001-E03: The completed tool is discoverable everywhere exactly once

```gherkin
Scenario: A user opens the Research Lab catalog after full causal delivery
  Given the owner page consumers Brief gate validators and ledger are complete
  When registry navigation and notes parity are validated
  Then Causal Rotation Lab appears exactly once in index tools registry and shared navigation
  And every link resolves to the production page and canonical notes
  And the Market Brief coverage registry recognizes the same tool identifier
```

### Implementation Plan - SCOPE-05

- Complete committed `causal-rotation-ledger.jsonl` decision/outcome/correction handling and browser outcome-history filters without mutating old events.
- Show wins, misses/false positives, falsifications, expiries, unresolved records, sensitivity posture, exposure, and policy version; insufficient history is explicit.
- Add `causal-rotation-lab` to `tools.json`, the `index.html` tool registry, and `rlnav.js` using the same canonical ID, title, path, description, and notes link.
- Add `notes/causal-rotation-lab.md` with purpose, owner boundaries, evidence/source rules, freshness, local-vs-public persistence, operator refresh/validation commands, known unavailable evidence classes, and Market Brief handoff.
- Update `README.md`, `notes/README.md`, and `tools.json` only where repository conventions require catalog parity.
- Extend registry and note-link selftests; stale-reference scan must find no conflicting owner IDs, old paths, duplicate registry entries, or undocumented generated artifact.

### Shared Infrastructure Impact Sweep - SCOPE-05

- Registry/nav surfaces are high-fan-out. Add a pre-registration baseline and canaries named `shared canary: every registered tool resolves one production page and notes entry`, `shared canary: rlnav renders every registered tool exactly once`, and `shared canary: Market Brief coverage IDs match tools registry IDs`.
- Verify existing tool order, IDs, URLs, and nav links remain unchanged except for the deliberate new entry.
- Ledger canary must parse the previous committed prefix byte-for-byte before accepting appended events.
- Rollback removes the registry/nav entry and public tool link but preserves ledger and unknown local storage; existing tools remain navigable.

### Consumer Impact Sweep - SCOPE-05

- Enumerate index cards, `tools.json`, `rlnav.js`, Market Brief registry coverage, owner deep links, notes indexes, README, tests, and candidate deep links.
- Search for `causal-rotation-lab`, `causal-rotation.snapshot`, `causal-tool-read/v1`, and candidate hash patterns across first-party files.
- Verify no route redirect is needed because this is a new path; unknown historical candidate deep links must still render an explicit state.

### Change Boundary - SCOPE-05

**Allowed:** `causal-rotation-ledger.jsonl` append-only additions, ledger rendering/tests in the owner, `tools.json`, `index.html`, `rlnav.js`, `notes/causal-rotation-lab.md`, `notes/README.md`, `README.md`, registry groups in `scripts/selftest.mjs`, and `tests/causal-rotation-registry.spec.mjs`.  
**Excluded:** rewriting any ledger prefix, unrelated tool metadata/order, unrelated documentation, market model logic, foundation policy changes except a versioned defect fix, spec/design, and certification fields.

### Test Plan - SCOPE-05

| Type | Scenario | File | Exact Test Name / Assertion |
| --- | --- | --- | --- |
| Unit/contract | SCN-001-E01 | `scripts/selftest.mjs` | `causal outcome append classifies falsification without mutating frozen decision bytes` |
| Unit/contract | SCN-001-E02 | `scripts/selftest.mjs` | `causal correction appends and preserves the committed ledger prefix` |
| Registry canary | SCN-001-E03 | `scripts/selftest.mjs` | `shared canary: every registered tool resolves one production page and notes entry` |
| Registry canary | SCN-001-E03 | `scripts/selftest.mjs` | `shared canary: rlnav renders every registered tool exactly once` |
| Registry canary | SCN-001-E03 | `scripts/selftest.mjs` | `shared canary: Market Brief coverage IDs match tools registry IDs` |
| E2E API/live static | SCN-001-E03 | `tests/causal-rotation-registry.spec.mjs` | `Regression: registered causal page notes data and snapshot resources return successful live responses` |
| E2E UI/live browser | SCN-001-E01 | `tests/causal-rotation-registry.spec.mjs` | `Regression: Invalidation occurs before confirmation` |
| E2E UI/live browser | SCN-001-E02 | `tests/causal-rotation-registry.spec.mjs` | `Regression: A ledger event requires a reviewed correction` |
| E2E UI/live browser | SCN-001-E03 | `tests/causal-rotation-registry.spec.mjs` | `Regression: A user opens the Research Lab catalog after full causal delivery` |

### Definition of Done - SCOPE-05

- [ ] SCN-001-E01 - Invalidation occurs before confirmation: a falsified outcome appends while the original evidence, posture, policy, thresholds, candidate bytes, and digest remain unchanged.
- [ ] SCN-001-E02 - A ledger event requires a reviewed correction: the correction appends with a target reference and every prior JSONL event remains unchanged and visible.
- [ ] SCN-001-E03 - A user opens the Research Lab catalog after full causal delivery: exactly one resolving entry exists across catalog, registry, nav, notes, data/snapshot resources, and Brief coverage.
- [ ] Decision, outcome, subsequent unresolved outcome, and correction events append; no prior committed or local event is rewritten/deleted through the public API.
- [ ] False positives, falsifications, expiries, unresolved outcomes, and insufficient-history states are visible alongside successful outcomes.
- [ ] Registry/nav/Brief coverage IDs and owner/notes/deep links pass exact parity canaries.
- [ ] Existing tool registry entries and navigation remain unchanged except for the one deliberate addition.
- [ ] Documentation states real source/freshness limits and never presents transcript claims, fixtures, or generated prose as verified evidence.
- [ ] All named Regression E2E tests pass over live HTTP with no skips.
- [ ] Consumer/stale-reference sweep reports zero stale first-party causal identifiers or paths.
- [ ] The Change Boundary is respected and the ledger prefix is preserved.
- [ ] SCOPE-05 is marked Done only after executable evidence is recorded; only then may SCOPE-06 start.

### Uncertainty Declaration - SCOPE-05

**Claim Source:** not-run  
All SCOPE-05 DoD items remain unchecked because outcome persistence, public registration, and documentation were not changed or executed. Each item is resolved by append-only ledger checks, registry canaries, stale-reference scans, and named live-browser checks in the SCOPE-05 Test Plan plus raw evidence in [report.md](report.md).

## Scope 6: Comprehensive Browser, Pages, Adversarial, and Load Validation

**Scope ID:** SCOPE-06  
**Status:** Not Started  
**Depends On:** SCOPE-05  
**Tags:** `validation`, `pages`, `playwright`, `adversarial`, `load`

### Outcome - SCOPE-06

The complete causal tool/consumer/Brief/ledger delivery is qualified against the specification using production functions, live static resources, real browsers, source-recorded positive inputs, rejection-only adversarial fixtures, shared-surface canaries, and deterministic stress/load checks.

### Use Cases - SCOPE-06

#### SCN-001-F01: One candidate remains coherent across every owner and consumer

```gherkin
Scenario: A source-recorded candidate moves from owner research to Brief coverage
  Given committed causal records and current owner timing reads pass their contracts
  When the local production site is opened and the refresh and validators run
  Then the owner Sector Global or Real Assets consumer and Market Brief use the same candidate identity stage evidence as-of and falsifiers
  And each market owner retains its original verdict
  And registry navigation and deep links resolve without duplicated causal computation
```

#### SCN-001-F02: Adversarial stale unavailable and hindsight inputs fail closed

```gherkin
Scenario: Multiple integrity failures are introduced independently
  Given fixtures cover later evidence stale timing missing source unknown versions conflicting identity and unavailable fundamentals
  When each fixture is evaluated through production validators and the live browser
  Then each failure has its expected structured code and visible unavailable stale or excluded state
  And no failure produces a neutral score current stage action slot or recorded-success message
  And unrelated owner tools remain usable
```

#### SCN-001-F03: The static experience survives mobile desktop and corpus load

```gherkin
Scenario: The complete tool is exercised across supported static runtimes
  Given the production assets are served locally and deployed on GitHub Pages
  And a repeated recorded-contract corpus is evaluated without changing its inputs
  When desktop and mobile browser matrices plus deterministic load checks run
  Then first paint controls charts timelines deep links consumers Brief and ledger remain usable and non-overlapping
  And output remains deterministic with bounded diagnostics and no stack overflow
  And no runtime backend bundler authentication or credential dependency is introduced
```

### Implementation Plan - SCOPE-06

- Consolidate the causal Playwright projects/suites under existing repository browser-validation patterns while retaining exact scenario titles from prior scopes.
- Run local live-server E2E and deployed Pages E2E against production assets. Capture desktop/mobile screenshots and canvas pixel checks; use accessibility snapshots/DOM assertions for actions.
- Exercise all spec business scenarios BS-001 through BS-012 through the stable SCN IDs in this plan and `scenario-manifest.json`.
- Add deterministic stress/load corpus checks using recorded-contract structures with assertion bodies that are either source-recorded or explicitly non-market structural payloads. Do not create fake successful market histories.
- Verify anti-hindsight, stale/unavailable, source-incomplete, rumor-as-fact, dependency-cycle, unknown timing version, stale timing, seasonality-only action, mismatch, identity mutation, outcome mutation, persistence failure, atomic import, and incomplete Brief action cases.
- Run full shared RLDATA/RLAPP/registry/Tier-A/owner-verdict canaries and stale-reference scans.
- Restrict implementation fixes discovered here to files already owned by SCOPE-01 through SCOPE-05; route unrelated findings separately rather than broad cleanup.

### Change Boundary - SCOPE-06

**Allowed:** causal test suites/fixtures, validation configuration already used by the repository, and narrowly scoped fixes in files explicitly allowed by SCOPE-01 through SCOPE-05.  
**Excluded:** unrelated tools, broad formatting, package/runtime upgrades not required by the pinned test-only browser runner, analyst/design artifacts, historical evidence rewrites, and all `certification.*` fields.  
Every fix must name the failing scenario and rerun its narrow check before the full suite.

### Test Plan - SCOPE-06

| Type | Scenario | File | Exact Test Name / Assertion |
| --- | --- | --- | --- |
| Full unit/property | All | `scripts/selftest.mjs` | `all causal production helpers and shared canaries pass without skipped groups` |
| Full contract | All | `scripts/validate-causal-rotation.mjs` | `committed causal inputs ledger snapshot and owner reads satisfy current contracts` |
| Full Brief contract | SCN-001-D01..D03 | `scripts/validate-brief-payload.mjs` | `Market Brief causal coverage and elevation satisfy low-noise independence policy` |
| E2E API/local | SCN-001-F01 | `tests/causal-rotation-delivery.spec.mjs` | `Regression: local live delivery exposes coherent causal owner consumer Brief and ledger contracts` |
| E2E UI/local | SCN-001-F01 | `tests/causal-rotation-delivery.spec.mjs` | `Regression: A source-recorded candidate moves from owner research to Brief coverage` |
| E2E UI/adversarial | SCN-001-F02 | `tests/causal-rotation-adversarial.spec.mjs` | `Regression: Multiple integrity failures are introduced independently` |
| E2E UI/Pages | SCN-001-F03 | `tests/causal-rotation-pages.spec.mjs` | `Regression: The complete tool is exercised across supported static runtimes` |
| E2E UI/mobile | SCN-001-F03 | `tests/causal-rotation-pages.spec.mjs` | `Regression: mobile causal queue clocks timeline consumers and Brief do not overlap or clip` |
| E2E UI/accessibility | SCN-001-F03 | `tests/causal-rotation-pages.spec.mjs` | `Regression: complete causal delivery has keyboard labels text equivalents and bounded announcements` |
| Stress | SCN-001-F03 | `scripts/selftest.mjs` | `causal repeated corpus evaluation is deterministic bounded and input-immutable` |
| Load | SCN-001-F03 | `tests/causal-rotation-delivery.spec.mjs` | `Regression: large valid recorded-contract corpus keeps cached first paint and interactive controls usable` |
| Registry/shared canary | All | `scripts/selftest.mjs` | `causal full delivery preserves RLDATA RLAPP registry Tier-A and owner verdict contracts` |

### Required Validation Commands

```text
node scripts/selftest.mjs
node scripts/validate-causal-rotation.mjs
node scripts/validate-brief-payload.mjs
npx playwright test tests/causal-rotation-lab.spec.mjs tests/causal-rotation-consumers.spec.mjs tests/causal-rotation-brief.spec.mjs tests/causal-rotation-registry.spec.mjs tests/causal-rotation-delivery.spec.mjs tests/causal-rotation-adversarial.spec.mjs tests/causal-rotation-pages.spec.mjs
```

Artifact lint, freshness, and traceability commands are run from the repository's canonical Bubbles surface after implementation evidence is recorded. Full raw outputs are required; summaries alone are not completion evidence.

### Definition of Done - SCOPE-06

- [ ] SCN-001-F01 - A source-recorded candidate moves from owner research to Brief coverage: owner, consumers, Brief, and ledger use one candidate identity/stage/as-of/falsifier contract while all timing-owner verdicts remain unchanged.
- [ ] SCN-001-F02 - Multiple integrity failures are introduced independently: every later/stale/missing/unknown/conflicting/unavailable case fails with its expected visible state and cannot create neutral support, current stage, action space, or false persistence.
- [ ] SCN-001-F03 - The complete tool is exercised across supported static runtimes: local and Pages desktop/mobile plus deterministic corpus load remain nonblank, responsive, bounded, and free of backend/bundler/auth/credential runtime dependencies.
- [ ] Every SCN-001-A01 through SCN-001-F03 manifest entry has at least one passing exact Regression E2E test plus its planned lower-level coverage.
- [ ] BS-001 through BS-012 and AC-001 through AC-012 are traceable to stable scenarios, production paths, test titles, and evidence commands.
- [ ] All required commands pass with full output and no skipped/ignored/only tests; syntax-only checks are not used as scenario proof.
- [ ] Desktop/mobile local and deployed Pages browser runs prove nonblank canvases, responsive layout, navigation, deep links, failure states, persistence, consumers, Brief gating, and outcome history.
- [ ] Anti-hindsight, stale/unavailable, incomplete source, duplicate origin, seasonality-only, unknown-version, persistence, import, and invalid Brief adversarial cases fail closed for the exact expected reason.
- [ ] RLDATA, RLAPP, registry/nav, Tier-A, and all three owner-verdict canaries pass independently before the broad suite result is accepted.
- [ ] Stress/load checks are deterministic, bounded, input-immutable, and do not use fabricated successful market outcomes.
- [ ] No backend, bundler, auth service, runtime dependency, credential, private portfolio field, or CORS-only causal source is introduced.
- [ ] Documentation/registry/current generated artifacts match implementation; no stale first-party causal references remain.
- [ ] The Change Boundary is respected; unrelated dirty-tree work remains untouched.
- [ ] SCOPE-06 remains Not started/In progress until every executable check is complete; final status/certification is owned by the validation workflow, not this plan.

### Uncertainty Declaration - SCOPE-06

**Claim Source:** not-run  
All SCOPE-06 DoD items remain unchecked because the complete product delivery does not exist for qualification in this planning invocation. Each item is resolved by the exact full commands, local/Pages browser matrices, adversarial checks, shared canaries, and deterministic stress/load assertions in the SCOPE-06 Test Plan plus raw evidence in [report.md](report.md).

## Requirements and Scenario Traceability

| Spec Coverage | Planned Scenarios | Primary Scope |
| --- | --- | --- |
| FR-001..FR-007, FR-053..FR-056 | SCN-001-A01, SCN-001-A02, SCN-001-E01, SCN-001-E02 | SCOPE-01, SCOPE-05 |
| FR-008..FR-018 | SCN-001-A03, SCN-001-B01, SCN-001-B02, SCN-001-C01 | SCOPE-01, SCOPE-02, SCOPE-03 |
| FR-019..FR-033 | SCN-001-B01, SCN-001-B02, SCN-001-C02, SCN-001-C03 | SCOPE-02, SCOPE-03 |
| FR-034..FR-046 | SCN-001-A02, SCN-001-B02, SCN-001-B03, SCN-001-C03 | SCOPE-01, SCOPE-02, SCOPE-03 |
| FR-047..FR-052 | SCN-001-C01..C03, SCN-001-D01..D03, SCN-001-E03 | SCOPE-03, SCOPE-04, SCOPE-05 |
| NFR-001..NFR-010 | SCN-001-B03, SCN-001-D03, SCN-001-F01..F03 | SCOPE-02, SCOPE-04, SCOPE-06 |
| BS-001, BS-007 | SCN-001-B01 | SCOPE-02 |
| BS-002 | SCN-001-C01 | SCOPE-03 |
| BS-003 | SCN-001-B01 and consumer exposure-mismatch regression | SCOPE-02, SCOPE-03 |
| BS-004 | SCN-001-C03 | SCOPE-03 |
| BS-005 | SCN-001-B02 | SCOPE-02 |
| BS-006 | SCN-001-A01 and SCN-001-B02 | SCOPE-01, SCOPE-02 |
| BS-008 | SCN-001-A03 and adversarial seasonality case | SCOPE-01, SCOPE-06 |
| BS-009 | SCN-001-A02 and SCN-001-D02 | SCOPE-01, SCOPE-04 |
| BS-010 | SCN-001-A03 | SCOPE-01 |
| BS-011 | SCN-001-D01 | SCOPE-04 |
| BS-012 | SCN-001-E01 | SCOPE-05 |
| AC-001..AC-012 | Corresponding rows above plus SCN-001-F01..F03 | SCOPE-01..SCOPE-06 |

## Planning Assumptions

- Repository configuration has no service trace contract; local diagnostics, full validator output, browser evidence, and shared canaries are the relevant observability proof. If project config later declares `traceContracts`, regenerate this plan before implementation.
- The existing Playwright dependency/pattern is reused and remains test-only. No runtime package enters the Pages artifact.
- Reliable free sector-level forward valuation, consensus revisions, institutional flow, futures curve, and inventory data are not assumed. Absence is a tested product state.
- Concrete real-source records must be reviewed when implemented; this plan intentionally does not fabricate citations or claim a candidate result.
- Public registration waits until SCOPE-05 so incomplete routes never appear in the catalog.

## Superseded Scopes (Do Not Execute)

None. This is the first active execution plan for the feature.
