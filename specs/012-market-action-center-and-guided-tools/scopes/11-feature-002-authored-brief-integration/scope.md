# Scope 11: Feature 002-Gated Authored Brief Integration

## 11-feature-002-authored-brief-integration

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `concrete-integration:true`, `external-gate:feature-002`, `atomic-publication:true`, `powerless-author:true`

Depends On: 10-bounded-web-evidence-acquisition

**External Eligibility Gate:** Feature 002 must be terminally certified for full delivery, and current checks must prove its pointer/manifest/hash graph, all-current-registry owner outcomes, powerless author boundary, history, compatibility, and atomic pointer-last publication. Its current implementation claims with `certification.status=not_started` do not satisfy this gate. If false, this scope remains Not Started and Scope 02's SCN-012-028 dependency state remains the only correct behavior.

**Primary Outcome:** After the exact gate passes, one frozen owner read plus one qualified frozen WebEvidenceBundle feeds a networkless/shell-less/write-less/model-less/private-less author, validates `ToolBrief/v2`, publishes per-tool and public-watchlist Briefs in the existing Feature 002 atomic generation, and renders concise action/catalyst/no-action states with claim-level citations and closed detail.

## Requirement Coverage

- **Functional:** FR-029 through FR-042, FR-068 through FR-074, FR-082, FR-115, FR-119 through FR-120.
- **Non-functional:** NFR-004, NFR-006 through NFR-010, NFR-012 through NFR-018.
- **Acceptance:** SCN-012-005, SCN-012-008, SCN-012-018, and SCN-012-020. SCN-012-006/007/028 remain mandatory regressions from Scopes 10/02.

## Gherkin Scenarios

### SCN-012-005 - Web evidence is frozen before authorship

```gherkin
Scenario: SCN-012-005 A current tool Brief is authored
  Given the owner read is validated
  And the bounded online-search stage froze a qualified WebEvidenceBundle
  When the LLM author runs
  Then it receives only the owner read and frozen qualified evidence
  And it has no web, shell, repository-write, or model-recompute authority
```

### SCN-012-008 - Tool Brief is concise by default

```gherkin
Scenario: SCN-012-008 A qualified tool Brief renders
  Given a current owner read and WebEvidenceBundle support one research action or upcoming catalyst
  When Brief opens
  Then the concise action, trigger, invalidation, horizon, citations, and owner link are visible first
  And methodology, full evidence, long context, and history remain closed by default
```

### SCN-012-018 - Market Action Center Brief prioritizes now

```gherkin
Scenario: SCN-012-018 A current window has actionable research and imminent catalysts
  Given those items clear existing action and evidence gates
  When the Brief view opens
  Then actions needed now and imminent catalysts appear before long context
  And each carries horizon, trigger, invalidation, freshness, citations, and owner link
  And backdrop, methodology, owner detail, and experiments remain closed by default
```

### SCN-012-020 - Public ticker receives scheduled brief

```gherkin
Scenario: SCN-012-020 A ticker is explicitly listed in public watchlist.json
  Given the public scheduled brief pipeline is certified
  When the unattended publisher runs
  Then it may author and publish a cited per-ticker brief for that public ticker
  And no private portfolio field is present in inputs or outputs
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-005 current owner/bundle | Feature 002 predicate true; compatible cutoff; qualified frozen bundle | Open ordinary Brief and evidence disclosures | Authored object references exact read/bundle hashes; capability ledger shows no web/shell/write/model/key/private authority | e2e-ui/integration |
| SCN-012-008 concise ordinary Brief | Qualified action or catalyst | Open Brief; inspect first viewport; expand disclosures | Owner read/action, trigger, invalidation, horizon, confidence basis, citations, owner link lead; methodology/full evidence/history closed | e2e-ui |
| SCN-012-018 Center current window | Qualified public generation and actions/catalysts | Open Center Brief/window | Bounded actions/catalysts precede backdrop; all required fields visible; blocking limitations are not hidden | e2e-ui |
| SCN-012-020 public ticker | Ticker only in committed public watchlist | Run isolated publisher and open Portfolio public row | Cited public ticker Brief appears with public label; private sentinel absent from request, author, manifest, object, compatibility payload, and DOM | integration/e2e-ui |
| Gate regression | Same code with a false Feature 002 predicate fixture | Open ordinary Brief | Exact SCN-012-028 gate returns and zero author/publication call occurs | e2e-ui |

## Implementation Files

### New

- `tests/tool-brief-v2.unit.mjs`
- `tests/tool-brief-v2-author-boundary.functional.mjs`
- `tests/tool-brief-v2-publication.integration.mjs`
- `tests/tool-brief-v2.stress.mjs`
- `tests/tool-brief-v2.spec.mjs`
- `tests/fixtures/feature-012/tool-brief-v2/**`

### Modified

- `scripts/brief-author.mjs`
- `scripts/brief-publication.mjs`
- `scripts/brief-refresh.mjs`
- `scripts/brief-narrative-parallel.mjs`
- `scripts/web-evidence-acquire.mjs`
- `rlbrief.js`
- `rlmarketaction.js`
- `market-brief.config.json`
- `market-brief.html`
- `tests/distributed-briefs.spec.mjs`
- `scripts/selftest.mjs`

## Implementation Plan

1. Run the exact Feature 002 gate command before creating RED tests or editing source. Record current accepted certification/evidence identities; refuse on narrative-only claims, partial graph, missing source outcome, author authority, or pointer failure.
2. Add `ToolAuthorRequest/v2` and `ToolBrief/v2` validators/compaction to existing Feature 002 contracts without weakening v1 readers. Each request carries exact read/bundle refs/hashes/cutoff and bounded safe data.
3. Remove/repurpose the web-enabled author lanes in `brief-narrative-parallel.mjs`; web acquisition may occur only in Scope 10's stage. Every actual author process has shell false, bounded stdin/stdout/time, no URL allowlist/network, no repository/filesystem write, no provider/private/model access.
4. Validate authored JSON independently: identity, schema, text safety, action/catalyst fields, material sentence-to-claim mappings, two independent origins, owner evidence for market state, quality/provenance, no-action/unavailable states, and closed detail.
5. Extend the Feature 002 run manifest/current pointer v2 inventory with WebEvidence, ToolBrief v2, public ticker Brief, Market Action projection, histories/indexes, compatibility projection, and pointer-last ordering. Any invalid/missing object preserves prior pointer byte-identically.
6. Read only committed ticker-only `watchlist.json` for scheduled public ticker Briefs. Assert no RLPORTFOLIO/Journey/private field or browser storage path can enter publisher/author inputs.
7. Render ordinary Brief and Center first-viewport hierarchy through safe text/links and native closed disclosures. Preserve prior verified carried/stale states and v1 compatibility.
8. Keep false/regressed Feature 002 predicates fail-closed at runtime; no direct author browsing or legacy prose relabeling bypass exists.
9. Stress bounded author pool/publication graph under configured concurrency/bytes without weakening caps or adding runtime dependencies.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| Feature 002 author | Existing bounded input/output, identity, lifecycle, and no-shell behavior remain | Existing Feature 002 unit/functional/authorship suites plus new zero-network/write capability ledger |
| Feature 002 publication | One pointer, immutable objects/history, v1/v2 reader, compatibility, dirty-tree isolation | Existing scheduler/history/git-isolation/failure tests plus partial-generation rollback mutation |
| Current Market Brief | Four windows/action gates and route remain stable | Existing distributed Brief/Market Brief payload/browser tests plus Center hierarchy tests |
| Public/private barrier | Publisher reads only committed public ticker scope | Private sentinel scans across argv/env/stdin/stdout/files/manifest/pointer/history/DOM/request/log inventories |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Excluded:** all Feature 002 spec/design/scopes/state/certification artifacts, `watchlist.json` writes, Feature 008 source/storage, BUG-004, `rldata.js`, provider keys/paths, owner formulas/pages, Journey private state, Red Alert qualification, option owner/data, QF, package/source-lock files, and framework-managed files.

**Atomic dependency rule:** if the Feature 002 predicate is false at pickup or regresses during work, make no integrated source edit/promotion and route the exact failure; do not emulate certification with fixture state in production.

## Rollback

Select the previous validated Feature 002 manifest/pointer, verify all refs/hashes, append rollback history under Feature 002's existing contract, regenerate the compatibility projection, and remove only Feature 012 adapter/projector registrations if needed. Never reauthor, delete immutable objects/history, rewrite watchlist, or touch private state.

## Scenario-First RED/GREEN Contract

After the external gate passes, create author-boundary, claim mapping, concise hierarchy, public ticker privacy, and atomic publication tests before edits. A false dependency predicate is not RED for implementation; it is an eligibility refusal. RED must exercise the accepted prerequisite graph and fail the exact new behavior.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-11-01 | Dependency gate | functional | SCN-012-028 | `scripts/validate-tool-experience.mjs` | Prove Feature 002 terminal certification and current graph/coverage/author/publication predicates before any integration work | `node scripts/validate-tool-experience.mjs --dependency feature-002 --require-accepted` | No | `report.md#tp-11-01` |
| TP-11-02 | Unit | unit | SCN-012-005, SCN-012-008 | `tests/tool-brief-v2.unit.mjs` | Validate request/Brief schemas, refs/hashes/cutoffs, claim mappings, action/catalyst/no-action/carried states, text/link safety, and v1/v2 compatibility | `node --test tests/tool-brief-v2.unit.mjs` | No | `report.md#tp-11-02` |
| TP-11-03 | Author-boundary functional | functional | SCN-012-005, SCN-012-006, SCN-012-007 | `tests/tool-brief-v2-author-boundary.functional.mjs` | Invoke author harness and prove frozen inputs only, zero web/shell/write/model/key/private authority, and rejection of unsupported/unmapped/syndicated claims | `node --test tests/tool-brief-v2-author-boundary.functional.mjs` | No | `report.md#tp-11-03` |
| TP-11-04 | Atomic publication integration | integration | SCN-012-020 | `tests/tool-brief-v2-publication.integration.mjs` | Build isolated full generation, public ticker objects, hashes/refs/history/compatibility, pointer-last promotion, failure preservation, rollback, and private-sentinel absence | `node --test tests/tool-brief-v2-publication.integration.mjs` | No | `report.md#tp-11-04` |
| TP-11-05 | Regression E2E | e2e-ui | SCN-012-005 | `tests/tool-brief-v2.spec.mjs` | `Regression: SCN-012-005 current Brief uses exact frozen read and bundle with a powerless author` | `npx --no-install playwright test tests/tool-brief-v2.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-005 current Brief uses exact frozen read and bundle with a powerless author" --reporter=list` | Yes | `report.md#scenario-scn-012-005` |
| TP-11-06 | Regression E2E | e2e-ui | SCN-012-008 | `tests/tool-brief-v2.spec.mjs` | `Regression: SCN-012-008 qualified tool Brief leads with cited action and keeps long detail closed` | `npx --no-install playwright test tests/tool-brief-v2.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-008 qualified tool Brief leads with cited action and keeps long detail closed" --reporter=list` | Yes | `report.md#scenario-scn-012-008` |
| TP-11-07 | Regression E2E | e2e-ui | SCN-012-018 | `tests/market-action-center.spec.mjs` | `Regression: SCN-012-018 Center Brief prioritizes bounded actions and catalysts with visible falsifiers` | `npx --no-install playwright test tests/market-action-center.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-018 Center Brief prioritizes bounded actions and catalysts with visible falsifiers" --reporter=list` | Yes | `report.md#scenario-scn-012-018` |
| TP-11-08 | Regression E2E | e2e-ui | SCN-012-020 | `tests/market-action-center.spec.mjs` | `Regression: SCN-012-020 public watchlist ticker receives cited scheduled Brief with zero private fields` | `npx --no-install playwright test tests/market-action-center.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-020 public watchlist ticker receives cited scheduled Brief with zero private fields" --reporter=list` | Yes | `report.md#scenario-scn-012-020` |
| TP-11-09 | Gate regression E2E | e2e-ui | SCN-012-028 | `tests/tool-experience.spec.mjs` | Re-run exact false-predicate Brief dependency regression after integrated code exists | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-028 uncertified Feature 002 exposes exact Brief gate and no author request" --reporter=list` | Yes | `report.md#tp-11-09` |
| TP-11-10 | Author/publication stress | stress | SCN-012-005, SCN-012-020 | `tests/tool-brief-v2.stress.mjs` | Execute configured max author concurrency and near-cap public generation while preserving caps, deterministic refs, and pointer-last behavior | `node --test tests/tool-brief-v2.stress.mjs` | No | `report.md#tp-11-10` |
| TP-11-11 | Feature 002 regression | integration | SCN-012-005, SCN-012-020 | Existing `tests/distributed-briefs*.mjs` suites | Preserve v1/v2 renderer, author, history, scheduler, dirty-tree, and publication contracts | `node --test tests/distributed-briefs*.mjs` | No | `report.md#tp-11-11` |
| TP-11-12 | Broad regression | unit | SCN-012-005, SCN-012-008, SCN-012-018, SCN-012-020 | `scripts/selftest.mjs` | Preserve all existing Research Lab invariants and add ToolBrief v2/publication/privacy canaries | `node scripts/selftest.mjs` | No | `report.md#tp-11-12` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] The exact Feature 002 predicate was mechanically true before integration; no narrative implementation claim or fixture bypass was used.
- [ ] ToolAuthorRequest/ToolBrief v2 enforce frozen owner+bundle input, powerless authorship, claim-level corroboration/owner grounding, concise/current/no-action/carried truth, and safe rendering.
- [ ] Public tool/ticker/Center objects publish through the existing one-generation pointer-last transaction with private sentinel exclusion and byte-identical failure preservation.
- [ ] False/regressed dependency state still renders SCN-012-028 and makes zero author/publication calls; v1 consumers/rollback remain valid.

#### Test Evidence Items - Exact Parity With 12 Test Plan Rows

- [ ] TP-11-01 gate evidence proves Feature 002 was eligible.
- [ ] TP-11-02 unit evidence proves ToolAuthorRequest/ToolBrief v2 contracts and v1 compatibility.
- [ ] TP-11-03 functional evidence proves powerless author and unsupported/correlated claim rejection.
- [ ] TP-11-04 integration evidence proves atomic public generation, public ticker scope, rollback, and private exclusion.
- [ ] TP-11-05 E2E evidence proves SCN-012-005 exact frozen inputs and author boundary.
- [ ] TP-11-06 E2E evidence proves SCN-012-008 concise cited hierarchy.
- [ ] TP-11-07 E2E evidence proves SCN-012-018 Center action/catalyst priority and falsifiers.
- [ ] TP-11-08 E2E evidence proves SCN-012-020 public ticker publication with zero private fields.
- [ ] TP-11-09 E2E evidence proves SCN-012-028 gate still fails closed after integration code exists.
- [ ] TP-11-10 stress evidence proves bounded author/publication behavior at configured limits.
- [ ] TP-11-11 Feature 002 regression evidence proves existing distributed Brief contracts remain green.
- [ ] TP-11-12 broad selftest evidence proves the existing Research Lab baseline remains green.

#### Build Quality Gate

- [ ] Eligibility gate, scenario RED/GREEN, exact system-Chrome identity, no-interception scan, author capability ledger, claim/citation/origin mutations, private sentinel scan, pointer/hash/history/rollback/dirty-tree canaries, v1/v2 compatibility, stress caps, protected-path diff, editor diagnostics, `git diff --check`, source-lock, validators, artifact lint, and broad selftest are current and clean.
