# Scope 10: Shared UI and Pages Acceptance

**Status:** Not Started
**Depends On:** 09
**Scope-Kind:** runtime-behavior
**Requirements:** FR-010, FR-024 through FR-028, FR-043 through FR-049, FR-073, FR-076, FR-078 through FR-091, FR-095, FR-100, FR-105 through FR-108, FR-111 through FR-121, FR-122 through FR-131; NFR-001, NFR-005, NFR-007 through NFR-008, NFR-010 through NFR-015, NFR-019 through NFR-024

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [user validation](../../uservalidation.md)

## Outcome

Mount one shared safe current/history experience on every runtime-discovered source page and Market Brief. Simple shows the same decision and strongest truthful reason; Power exposes official-versus-indicative prices, exact comparable volume, report/revision/reaction/source provenance, and conflicts; history loads only selected partitions. All states remain accessible, responsive, escaped, selective, and coherent on local static serving and deployed GitHub Pages.

### Gherkin Scenarios

#### SCN-002-013: Render truthful current source and final briefs on every registered page

```gherkin
Scenario: SCN-002-013 renders one coherent current brief across shared Simple and Power surfaces
  Given one complete pointer-selected publication exists on the static server
  When each runtime-discovered source page and Market Brief loads through the shared mount
  Then every source shows its decision or exact no-recommendation reason cutoff freshness boundaries provenance and history entry
  And eligible pages distinguish prior official close from indicative pre-market or after-hours evidence and disclose comparable volume
  And Market Brief shows complete coverage actions context merged origins conflicts exclusions and final provenance
  And a later failed run remains non-current while the last verified publication stays distinct
```

#### SCN-002-014: Load focused brief report reaction and lifecycle history on demand

```gherkin
Scenario: SCN-002-014 loads only selected immutable history and preserves chronology
  Given the history pointer and compact indexes validate
  When a user selects tool month run recommendation report lifecycle outcome or conflict filters
  Then only the declared selected monthly partition and explicitly opened evidence objects are fetched
  And authored carried modified conflicted closed outcome correction release revision reaction migration-gap and failed-run states remain distinct
  And baseline release reaction later window and revision render in immutable chronological order
  And malformed mixed-run or hash-invalid data suppresses the entire affected chronology rather than showing a partial result
```

#### SCN-002-015: Preserve accessibility responsive safety compatibility and registry auto-discovery

```gherkin
Scenario: SCN-002-015 keeps shared brief surfaces usable and safe on every registered page
  Given the observed 23 participants and one valid added-source mutation use the declarative shared mount contract
  When desktop mobile 130-percent text zoom keyboard assistive-semantics non-color state unsafe-text unsafe-link network error loading empty stale thin and disputed cases execute
  Then controls remain labeled focusable ordered and at least 44 CSS pixels without overlap clipping or horizontal overflow
  And authored markup renders literally while only validated registry or HTTPS citation links navigate
  And the compatibility projections and current pointer select the same run
  And registry membership alone supplies the mount without a page-ID switch or hand-maintained list
```

### UI Scenario Matrix

| Scenario / Contract | Preconditions | User Steps | User-Visible Assertions | Persistent Browser Title |
| --- | --- | --- | --- | --- |
| Pre-market source brief (SCN-002-017/018) | Fresh or partial pre-market evidence | Open source page Simple; activate Evidence details | `Pre-market - indicative`, cutoff, prior official close, indicative O/H/L/latest/VWAP, exact elapsed bucket, sample/coverage/median/percentile or suppression reason | `Regression: pre-market Simple and Power keep official close separate and disclose comparable volume` |
| Morning/open confirmation (SCN-002-025) | Published same-date pre-market thesis and morning run | Open Market Brief; inspect window comparison | Preserved earlier thesis, owner-produced confirmed/rejected/insufficient state, current cutoff, no later evidence | `Regression: morning final compares the exact published pre-market thesis with owner read evidence` |
| Pre-close | Open regular session before official close | Open final Simple/Power | Partial regular state, no premature official close, current breadth/volume/source labels, overnight implications qualified | `Regression: pre-close final never labels a partial regular print as the official close` |
| After-hours | Official regular close and post-close bars | Open source/final brief | Official close first; `After-hours - indicative` latest/range/VWAP; exact post-close comparable volume; next open date | `Regression: after-hours views preserve official close and label every post-close print indicative` |
| Holiday/early close (SCN-002-021) | Explicit committed holiday or early-close calendar row | Open source/final context and provenance | Holiday shows closed plus next valid session; early close shows exact official close and post-close boundary; calendar version and source remain visible | `Regression: holiday and early-close context strips use explicit calendar boundaries and next valid session` |
| CPI upcoming -> released (SCN-002-019) | Before and after accepted release objects | Open report row in Simple then Power | Before: `Not released` and no surprise; after: actual/nullable consensus/previous/release/source/freshness/units/surprise | `Regression: CPI row moves from upcoming to released without stale actual or post-release consensus` |
| CPI dispute/revision (SCN-002-023/024) | Disputed or revised evidence | Expand provider/revision rows | Separate provider values with synthesis blocked; original and revision rows/times both visible | `Regression: report conflicts stay separate and revisions append without rewriting the original` |
| Reaction chronology (SCN-002-020) | Released report and later reaction identities | Open reaction and history | Baseline -> verified release -> strictly later session segments -> later cutoff/revision, with exact cutoff/source | `Regression: reaction disclosure and history exclude look-ahead and retain immutable chronology` |
| Low-noise context (SCN-002-027) | Unusual evidence without owner gate | Open Simple/final actions and context | `Context only - action gate not met`; no action slot/confidence increase; no fund-flow/advice/execution wording | `Regression: unsupported unusual evidence remains context and consumes no action slot` |
| Loading/empty/stale/thin/disputed/error | Each designed state object or failed fetch | Load/open affected section | Exact state language, preserved last verified content where allowed, no synthetic numbers, safe retry/history controls, no partial chronology | `Regression: shared state matrix remains truthful and non-current failures cannot replace current` |
| Responsive/accessibility/safety | 390x844 and 1440x1000, 130% root zoom | Keyboard through tabs/actions/disclosures/filters; inspect semantics and unsafe content | Stable heading/order/table/list semantics, visible focus, non-color labels, 44px targets, escaped text, constrained links, no overlap | `Regression: shared brief and history UI is accessible safe and stable at desktop mobile and zoom` |

### Implementation Plan

1. Extend `rlbrief.js` as the dual-runtime contract parser, no-store pointer loader, manifest/path/hash/run verifier, selective evidence/history loader, state vocabulary owner, and safe DOM renderer. It performs no source, model, recommendation, or evidence calculation.
2. Add `BriefMount`, `BriefModeBridge`, `EvidenceContextStrip`, `EvidenceStateLabel`, `DecisionReasonRow`, `OfficialIndicativePriceRow`, `ComparableVolumeRow`, `ReportEvidenceRow`, `ReactionWindowDisclosure`, `ProviderConflictRows`, `LowNoiseGateLabel`, `ProvenanceDisclosure`, `FocusedHistoryTimeline`, `SafeAuthoredText`, and `SafeTickerLink` exactly as composed in `design.md`.
3. Update `rlapp.js` with one registry/path mount bootstrap and host Simple/Power bridge. Add exactly one declarative `data-rlbrief-mount` anchor with real registry ID and existing panel targets to every registered page. No page-ID/tool-ID JavaScript switch, broad page restyle, model recomputation, or owner-control restructuring is allowed.
4. Fetch pointer -> manifest -> one current read/brief or final object initially. Use bounded verified summaries for Simple/Power mode switching with no refetch. Fetch evidence details only on disclosure and history pointer/index/one selected partition only after `Open history`.
5. Render narrative via `textContent` only. Construct structured nodes explicitly and allow only registry-owned same-origin paths or separately validated HTTPS citations. Reject unsafe schemes, credential URLs, authored raw URLs, mixed runs, unknown enums, wrong content type, byte/hash/path mismatch, or absent Web Crypto.
6. Implement exact state language, official/indicative and report field contracts, immutable reaction order, provider conflict rows, profile honesty, failure/non-current separation, and no-action success distinct from unavailable/error.
7. Implement responsive behavior at 390x844 and 1440x1000 plus 130% root text zoom; persistent labels, semantic mobile definition lists, captions/scoped headers, ordered timelines, native disclosures, polite status updates, deterministic focus, non-color meaning, 44px targets, long-token wrapping, and no overlap/overflow.
8. Parameterize browser discovery from `tools.json` for the observed 23 pages and an added-source mutation. Validate complete compatibility projections, local static server MIME/cache/path behavior, selective network requests, and the same suite against a required deployed Pages URL.

### Change Boundary

**Allowed:** `rlbrief.js`, narrow `rlapp.js` mount bridge, declarative anchors/mode-target metadata on all registered HTML pages, static test server/runtime, complete generated compatibility outputs, Scope 10 tests, and product docs later owned by `bubbles.docs` (not this plan/implementation scope owner).

**Excluded:** owner formulas/controls/canvases/local state, page-specific renderer branches, navigation redesign, broad CSS restyling, source/author/history/scheduler logic, service worker/client persistence, credentials/private data, dependency files, other specs, and unrelated dirty/untracked paths.

### Consumer Impact Sweep

Inventory `tools.json` -> `index.html`/`rlnav.js`, every registered file/path, `RLDATA.toolReads`, `RLAPP` modes/status, `rlbrief.js` existing Market Brief helpers, root compatibility payload/snapshot, global history reads, same-origin/deep/ticker links, docs, tests, static server, and Pages workflow. Scan for eager global history, mutable-root authority, page-specific source lists, stale hardcoded participant/source counts, unsafe `innerHTML`, authored links, unlabeled `close`, full-day partial-volume comparisons, and old history paths.

### Shared Infrastructure Impact Sweep

`rlapp.js`, `rlbrief.js`, all registered pages, and browser/static harness are protected. Capture the existing all-page boot/control/mode/provider-credential baseline first. After each shared hunk run an independent canary that exercises owner controls without the brief component validating itself. Rollback removes only mounts/bridge/primitives, restores exact previous page boot/control state and root compatibility reads, and leaves pointer-selected history/evidence immutable.

### Test Plan

Browser E2E uses the real ephemeral static HTTP server and production static artifacts with no owned request interception. The deployed row requires `RESEARCH_LAB_BASE_URL` and fails loud when absent. No stress/load row is added because this scope declares no latency or throughput SLA; selective request behavior is asserted directly in browser network logs.

| Test Type | Category | Scenario | File / Exact Test Title | Command | Live System | Red -> Green Contract |
| --- | --- | --- | --- | --- | --- | --- |
| UI Unit | ui-unit | SCN-002-013, SCN-002-015 | `tests/distributed-briefs.renderer.unit.mjs` - `shared primitives emit exact labels escaped text safe links clocks and profile boundaries` | `node --test tests/distributed-briefs.renderer.unit.mjs` | No | Red: unsafe/ambiguous render output passes; Green: production helpers produce exact structures and reject unsafe values. |
| Integration | integration | SCN-002-013, SCN-002-014 | `tests/distributed-briefs.static.integration.mjs` - `static loader verifies coherent current objects and fetches history only after selection` | `node --test tests/distributed-briefs.static.integration.mjs` | Yes | Red: eager/mixed/hash-invalid load renders; Green: real HTTP request log and DOM state prove selective fail-closed behavior. |
| Canary | functional | SCN-002-013, SCN-002-015 | `tests/distributed-briefs.ui-canary.mjs` - `Canary: all observed pages retain controls Simple Power state RLDATA and credential lifecycle after mounts` | `node --test tests/distributed-briefs.ui-canary.mjs` | Yes | Red: shared bootstrap changes owner behavior; Green: independent existing-control canary passes for all pages. |
| Regression E2E | e2e-ui | SCN-002-013, SCN-002-017, SCN-002-018 | `tests/distributed-briefs.spec.mjs` - `Regression: pre-market Simple and Power keep official close separate and disclose comparable volume` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: user sees close/full-day ambiguity; Green: exact labels/metrics/reasons and mode bridge pass. |
| Regression E2E | e2e-ui | SCN-002-013, SCN-002-025 | `tests/distributed-briefs.spec.mjs` - `Regression: morning final compares the exact published pre-market thesis with owner read evidence` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: morning reconstructs/blends thesis; Green: exact earlier ref and owner state render. |
| Regression E2E | e2e-ui | SCN-002-013, SCN-002-025 | `tests/distributed-briefs.spec.mjs` - `Regression: pre-close final never labels a partial regular print as the official close` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: premature close appears; Green: partial regular/cutoff/implication labels pass. |
| Regression E2E | e2e-ui | SCN-002-013, SCN-002-017, SCN-002-025 | `tests/distributed-briefs.spec.mjs` - `Regression: after-hours views preserve official close and label every post-close print indicative` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: after-hours latest becomes close; Green: separate anchor/current/next-session fields pass. |
| Regression E2E | e2e-ui | SCN-002-013, SCN-002-021 | `tests/distributed-briefs.spec.mjs` - `Regression: holiday and early-close context strips use explicit calendar boundaries and next valid session` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: weekday/default boundaries invent or mislabel a session; Green: explicit holiday/early-close labels, boundary, calendar ref, and next session pass. |
| Regression E2E | e2e-ui | SCN-002-013, SCN-002-019 | `tests/distributed-briefs.spec.mjs` - `Regression: CPI row moves from upcoming to released without stale actual or post-release consensus` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: actual/surprise leaks or lineage is hidden; Green: exact lifecycle/fields/source/cutoff pass. |
| Regression E2E | e2e-ui | SCN-002-013, SCN-002-014, SCN-002-023, SCN-002-024 | `tests/distributed-briefs.spec.mjs` - `Regression: report conflicts stay separate and revisions append without rewriting the original` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: values average/replace; Green: separate providers and linked original/revision rows pass. |
| Regression E2E | e2e-ui | SCN-002-014, SCN-002-020 | `tests/distributed-briefs.spec.mjs` - `Regression: reaction disclosure and history exclude look-ahead and retain immutable chronology` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: later/straddling data appears earlier; Green: baseline-release-segment-revision order and cutoffs pass. |
| Regression E2E | e2e-ui | SCN-002-013, SCN-002-027 | `tests/distributed-briefs.spec.mjs` - `Regression: unsupported unusual evidence remains context and consumes no action slot` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: context promotes/uses unsafe language; Green: action counts and visible suppression pass. |
| Regression E2E | e2e-ui | SCN-002-013, SCN-002-014 | `tests/distributed-briefs.spec.mjs` - `Regression: shared state matrix remains truthful and non-current failures cannot replace current` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: loading/error/stale/thin/dispute displays synthetic/partial current; Green: exact state and preservation contract pass. |
| Regression E2E | e2e-ui | SCN-002-014 | `tests/distributed-briefs.spec.mjs` - `Regression: focused history fetches only the selected partition and opened evidence objects` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: eager unrelated narratives load; Green: request log and complete chronology pass. |
| Regression E2E | e2e-ui | SCN-002-015 | `tests/distributed-briefs.spec.mjs` - `Regression: shared brief and history UI is accessible safe and stable at desktop mobile and zoom` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: focus/labels/geometry/non-color/safety fail; Green: DOM, keyboard, pixel/box, and unsafe-content checks pass. |
| Regression E2E | e2e-ui | SCN-002-015, SCN-002-003 | `tests/distributed-briefs.spec.mjs` - `Regression: valid added registry source receives the shared mount with no page-specific branch` | `npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: mutation is omitted or needs code list; Green: generic mount/read/history/coverage path passes. |
| Consumer Trace | functional | SCN-002-015 | `tests/distributed-briefs.consumer-trace.mjs` - `compatibility consumers contain zero stale mutable-history count or unsafe-render assumptions` | `node --test tests/distributed-briefs.consumer-trace.mjs` | No | Red: old paths/counts/labels remain; Green: every first-party consumer is compatible or updated. |
| Static Pages | e2e-ui | SCN-002-013, SCN-002-014, SCN-002-015 | Deployed Pages execution of `tests/distributed-briefs.spec.mjs` | `RESEARCH_LAB_BASE_URL="${RESEARCH_LAB_BASE_URL:?required deployed Pages URL}" npx --no-install playwright test tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: deployed MIME/cache/path/hash graph differs; Green: same scenario assertions pass against Pages with no external browser source calls. |
| Full Regression | e2e-ui | SCN-002-013, SCN-002-014, SCN-002-015 | Existing plus Feature 002 complete browser suite | `npx --no-install playwright test tests/causal-rotation-lab.spec.mjs tests/bond-regime-lab.spec.mjs tests/provider-credentials.spec.mjs tests/distributed-briefs.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Red: any existing page/browser contract regresses; Green: all committed browser suites pass together. |
| Baseline | functional | SCN-002-013, SCN-002-014, SCN-002-015 | Existing complete repository selftest | `node scripts/selftest.mjs` | Yes | Red: shared UI changes regress product invariants; Green: unchanged baseline passes. |
| Integration | integration | SCN-002-013, SCN-002-014, SCN-002-015 | Complete distributed artifact graph validator | `node scripts/validate-distributed-briefs.mjs --root .` | Yes | Red: UI-consumed graph is incoherent; Green: all current/history/evidence/projection refs reconcile. |
| Integration | integration | SCN-002-014 | Actual legacy migration no-write parity check | `node scripts/migrate-brief-history.mjs --check` | Yes | Red: UI history cutover loses legacy parity; Green: all actual legacy rows (derived count) and source bytes remain exact. |

### Definition of Done - Tiered Validation

Core outcomes:

- [ ] Every runtime-discovered source page and Market Brief uses the declarative shared mount and renders one coherent current Simple/Power/history experience without changing owner controls, calculations, local state, or navigation.
- [ ] Official/indicative, comparable volume, report/revision/dispute/reaction, cutoff/provenance, profile, low-noise, loading/empty/stale/thin/error/non-current, and focused-history contracts match the UX-owned spec exactly.
- [ ] SCN-002-014 loads only the selected immutable history partition and preserves authored, carried, modified, conflicted, closed, outcome, correction, release, revision, reaction, migration-gap, and failed-run chronology without unrelated narrative reads.
- [ ] Accessibility, responsive geometry, safe text/links, selective network reads, current/compatibility coherence, registry auto-discovery, local static serving, and deployed Pages behavior satisfy SCN-002-013 through SCN-002-015.
- [ ] Consumer and Shared Infrastructure Impact Sweeps, independent all-page boot/control canaries, rollback, and the declared Change Boundary are complete with unrelated dirty paths unchanged and unstaged.

Test evidence items, one per Test Plan row:

- [ ] [TP-10-01] UI-unit evidence passes for exact labels, escaped text, safe links, clocks, and profile boundaries after its recorded red stage.
- [ ] [TP-10-02] Integration evidence passes for coherent selective static loading after its recorded red stage.
- [ ] [TP-10-03] Independent all-page controls/mode/RLDATA/credential canary evidence passes before broad browser execution.
- [ ] [TP-10-04] Scenario-specific E2E regression tests for pre-market official/indicative/comparable-volume behavior pass with the exact title.
- [ ] [TP-10-05] Scenario-specific E2E regression tests for morning owner-confirmation behavior pass with the exact title.
- [ ] [TP-10-06] Scenario-specific E2E regression tests for pre-close partial/official-close behavior pass with the exact title.
- [ ] [TP-10-07] Scenario-specific E2E regression tests for after-hours official/indicative behavior pass with the exact title.
- [ ] [TP-10-08] Scenario-specific E2E regression tests for holiday and early-close calendar presentation pass with the exact title.
- [ ] [TP-10-09] Scenario-specific E2E regression tests for CPI upcoming/released lineage pass with the exact title.
- [ ] [TP-10-10] Scenario-specific E2E regression tests for report dispute/revision immutability pass with the exact title.
- [ ] [TP-10-11] Scenario-specific E2E regression tests for cutoff-safe reaction chronology pass with the exact title.
- [ ] [TP-10-12] Scenario-specific E2E regression tests for low-noise context and zero action-slot impact pass with the exact title.
- [ ] [TP-10-13] Scenario-specific E2E regression tests for loading/empty/stale/thin/disputed/error/non-current states pass with the exact title.
- [ ] [TP-10-14] Scenario-specific E2E regression tests for focused selective history reads pass with the exact title.
- [ ] [TP-10-15] Scenario-specific E2E regression tests for accessibility, responsive geometry, non-color states, and safe authored content pass with the exact title.
- [ ] [TP-10-16] Scenario-specific E2E regression tests for registry-added shared mounting pass with the exact title.
- [ ] [TP-10-17] Functional consumer-trace evidence passes with zero stale first-party assumptions.
- [ ] [TP-10-18] Deployed Pages E2E evidence passes against the required `RESEARCH_LAB_BASE_URL` with no browser-side external source calls.
- [ ] [TP-10-19] Broader E2E regression suite passes for all existing and Feature 002 browser behavior.
- [ ] [TP-10-20] Baseline functional evidence passes for `node scripts/selftest.mjs` after focused checks are green.
- [ ] [TP-10-21] Integration evidence passes for the complete UI-consumed distributed artifact graph.
- [ ] [TP-10-22] Integration evidence passes for actual-corpus (derived row count) legacy migration parity after UI cutover.

Build quality gate:

- [ ] Exact Node and `npx --no-install` checks, no-interception/skip/self-validation/safe-render/consumer/static-path scans, responsive screenshot and geometry proof, Pages verification, artifact validation, diff isolation, and full output are recorded in this scope report with zero warning or undeclared mutation.
