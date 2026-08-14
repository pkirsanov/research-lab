# Scope 5: Owning Tool, Brief Read, And Reachability

**Scope ID:** `05-refinement-public-safety-and-brief-read`
**Scope Dir:** `scopes/05-refinement-public-safety-and-brief-read`
**Status:** Done
**Depends On:** `01-agenda-registry-contract` (foundation), `04-dossier-and-outcome-states`
**Scope-Kind:** runtime-behavior

Related artifacts: [spec.md](../../spec.md), [design.md](../../design.md),
[scope index](../_index.md).

## Replan Evidence Boundary

The existing `report.md` records historical evidence for the superseded
implementation contract. It cannot satisfy any DoD item below. Implementation
must execute every current `TP-05-*` row and append fresh evidence under a
`replanned-contract-tp-05-*` anchor before checking the matching item.

## Outcome

Ship `research-agenda-lab.html` as the first-class owning research tool, not a
landing page. Simple is the default current-decision cockpit. Power exposes the
actor matrix, unique-flow network, scenario contributions, all six
transmission channels, proxy calibration, evidence graph, source ledger,
current/predecessor comparison, immutable versions, and review history. Both
modes consume one `computeViewState` result from `rlagenda.js`.

Publish a compact `research-agenda-read/v1` into the market-brief payload,
registered tool-read channel, page artifact, and visible brief section. Register
the page across the tool, navigation, notes, site, simple-model, adapter,
experience, journey, and public-target surfaces. Keep full model/chart detail in
the owning tool and deep-link from the brief.

Recursively reject private fields and out-of-boundary refinements. Expose a
read-only Feature 020 seam containing immutable finding, evidence, trigger,
invalidation, topic, and dossier references. Feature 019 emits no destination,
eligibility, action family, attention envelope, anomaly seed, alert candidate,
routing decision, or score.

## Requirement Coverage

FR-019-032 through FR-019-038 and NFR-019-003 through NFR-019-004. This scope
also renders the current, stale, unavailable, reversed, and historical states
created by SCN-019-012 through SCN-019-017 without changing their semantics.

## Gherkin Scenarios

```gherkin
Scenario: SCN-019-018 A refinement outside the boundary is refused
  Given a proposed refinement whose subject falls outside the topic's declared scope boundary
  When the refinement is validated
  Then it is refused with a named reason
  And the topic's declared question and scope boundary are unchanged

Scenario: SCN-019-019 Public scope only
  Given any dossier produced by this feature
  When it is inspected
  Then it contains no position, no size, no cost basis and no profit or loss figure
  And every subject it names is a public market object or a public ticker

Scenario: SCN-019-020 A tool and read that do not reach the reader do not ship
  Given a generation in which at least one topic was reviewed
  When the registered research tool, published payload and brief page artifact are inspected
  Then the tool exposes the current dossier, prior versions, sustained models, charts and review history
  And the payload carries a research read for the agenda under its registered tool id, with each topic's outcome state
  And the brief page artifact carries the agenda material the reader-facing section renders
  And the read is visible on a brief surface the reader opens, rather than only present in the payload or confined to a dossier file
```

## UI Scenario Matrix

| Scenario | Preconditions | User steps | Visible outcome | Test category |
| --- | --- | --- | --- | --- |
| SCN-019-014 | current review is stale and prior dossier exists | open brief read, then owning tool | age and stale reason are visible; prior dossier is dated history, not current | e2e-ui |
| SCN-019-015 | current mandatory review is unavailable | open the current topic | named reason is visible; no fabricated current finding or chart appears | e2e-ui |
| SCN-019-017 | current model sharply reverses predecessor | compare current and prior in Power | causal evidence, refuter/invalidation, prior view, current view, and deterministic reversal label are visible | e2e-ui |
| SCN-019-019 | nested artifact contains a private sentinel | load the tool and brief through production validation | publication refuses; sentinel appears nowhere in DOM, requests, URL, storage, or public JSON | security/e2e-ui |
| SCN-019-020 | a validated generation and registered tool exist | open brief, follow topic deep link, switch Simple/Power, move a lever | compact read is visible, full tool resolves, both modes agree, and lever recomputation makes no request | e2e-ui |

## Planned Production Paths

| Path | Disposition | Purpose |
| --- | --- | --- |
| `research-agenda-lab.html` | planned new | owning Simple/Power research tool |
| `rlexperience-adapters/research-agenda.js` | planned new | thin ordinary-view adapter delegating to `rlagenda.js` |
| `notes/research-agenda-lab.md` | planned new | method, contracts, controls, and verification guide |
| `tools.json`, `index.html`, `rlnav.js` | existing, planned modification | registry and navigation parity |
| `README.md`, `notes/README.md` | existing, planned modification | discoverability and notes parity |
| `simple-models.json`, `tool-experience.config.json`, `journeys.json` | existing, planned modification | Simple model, adapter, module allowlist, and two journeys |
| `scripts/build-pages-site.mjs` | existing, planned modification | publish `research/` and enforce registered-page reachability |
| `scripts/build-brief-page-artifacts.mjs` | existing, planned modification | additive page `researchAgenda` projection |
| `market-brief.experimental.json` | existing generated artifact, regeneration only | byte-current derived brief artifact with no item-composition change |
| `market-brief.tools.page.json` | existing generated artifact, planned regeneration | compact registered-tool artifact containing the agenda tool |
| `scripts/validate-brief-payload.mjs` | existing, planned modification | toolRead, page read, safety, balance, and boundary validation |
| `rlexperience.js` | existing, planned modification | bind the agenda adapter into the shared experience runtime |
| `scripts/validate-tool-experience.mjs` | existing, planned modification | validate agenda tool, adapter, model, and journey registry parity |
| `scripts/brief-narrative-parallel.mjs` | existing after Scope 4, planned modification | registered toolRead merge after coverage assignment |
| `market-brief.html`, `rlbrief.js` | existing, planned modification | visible compact standing-research section |
| `rlapp.js`, `rlviews.js` | existing, planned modification | additive durable public topic targets |
| `tests/tool-experience.support.mjs` | existing, planned modification | shared agenda-adapter module inventory for experience canaries |
| `tests/tool-experience.unit.mjs` | existing, planned modification | adapter allowlist boundary regression canary |
| `tests/tool-experience-registry.functional.mjs` | existing, planned modification | registry/adapter/model/journey parity |
| `tests/tool-experience.spec.mjs` | existing, planned modification | real tool browser behavior |
| `tests/market-brief-scorecard.spec.mjs` | existing, planned modification | compact brief read and deep link |
| `tests/deployed-site-parity.spec.mjs` | existing, planned modification | built-site artifact reachability |
| `tests/tool-discovery.spec.mjs` | existing, planned modification | navigation and public target reachability |
| `tests/contextual-tooltip.spec.mjs` | existing, planned modification | shared tooltip content and accessibility |

## Implementation Plan

1. Build `research-agenda-lab.html` as a real static tool. Load the committed
   registry, current pointer, referenced definitions/calibration/reviews/
   dossiers, and same-origin bars. Fetch no external source in the browser.
2. Use one `computeViewState(definition, review, leverState)` wrapper over
   `rlagenda.js`. Simple and Power render the same object. Reject canonical
   mismatch between stored and browser-recomputed models before chart render.
3. Make Simple the default. Show current-generation status, posture, scenario
   probabilities, physical versus rerouting exposures, evidence changes,
   triggers/invalidations, five explicit levers, freshness/source summary, and
   the Power link in that order.
4. Make Power render the complete actor, flow, scenario, transmission, proxy,
   evidence, source, comparison, and history architecture from design section
   12.4. Indirect evidence shows causal path, weighted impact, and refuter.
   Conflicts remain separate rows.
5. Build every figure and adjacent semantic table from the same
   `buildAgendaChartSeries` rows. Keep fixed responsive dimensions. Draw any
   canvas synchronously. Provide table fallback, accessible name, unit,
   limitation, and source for each figure.
6. Implement five slider-plus-number levers for Hormuz pass, Bab el-Mandeb
   pass, rerouted share, policy/inventory offset, and demand offset. A lever
   recomputes both modes synchronously, labels changed values as user
   assumptions, and never fetches, writes history, changes evidence, or mutates
   the published review. Reset restores published inputs.
7. Validate bounded refinements and recursive public safety through
   `rlagenda.js`. Preserve declared question and boundary bytes. Reject private
   names at every nested location and escape all model-authored text at DOM
   sinks.
8. Build the compact read once. Add it to `payload.researchAgenda`,
   `payload.toolReads['research-agenda-lab']`, and `market-brief.page.json`.
   Render a standing-research section in `market-brief.html`; full detail stays
   in the tool. Regenerate `market-brief.tools.page.json` from the registered
   tool inventory and `market-brief.experimental.json` as a derived artifact
   without changing experimental-item composition.
9. Register the tool atomically across all inventory surfaces. Add
   `simple-model/research-agenda-posture/v1`,
   `simple-adapter/research-agenda-posture/v1`, and the reversal-review and
   chokepoint-transmission journeys. Bind the adapter through `rlexperience.js`
   and validate it through the existing experience validator and support/unit
   canaries. The adapter maps only; it copies no math.
10. Publish durable targets such as
    `research-agenda-lab.html#power/geopolitical-supply-shock`. A reload focuses
    the topic heading. Existing pages that declare no public target retain
    identical routing.
11. Expose Feature 020 a validated read-only dossier/finding reference with
    immutable source/evidence/trigger/invalidation anchors. Assert the read
    shape contains none of Feature 020's destination or routing fields.
12. Add focused functional and browser tests to existing real test files. Each
    Playwright case starts the repository's real ephemeral static server and
    loads checked-in production files. `page.route`, request interception,
    response fulfillment, page-content substitution, and inline canned payload
    injection are forbidden.

## Shared Infrastructure Impact Sweep

| Surface | Risk | Canary | Restore boundary |
| --- | --- | --- | --- |
| tool/nav/site registries | a partial registration breaks discovery or Pages | all registry ids, pages, notes, simple models, adapters, journeys, and target ids agree in one run | revert all registration surfaces together |
| shared router (`rlapp.js`, `rlviews.js`) | public target change can break every tool | every existing tool route resolves identically when no target ids are declared | remove only the additive target seam |
| brief reader (`market-brief.html`, `rlbrief.js`) | agenda section can destabilize the primary page | existing sections render identically with agenda present, unavailable, and absent | remove section and renderer together |
| shared chart/tooltip behavior | visual and table values can diverge | canonical model, chart series, table cells, and tooltip value/unit match | restore the shared projection call, not copied math |

## Change Boundary

Allowed families are the production and test paths listed above plus
`rlagenda.js`, `market-brief.page.json` generation, and Feature 019 fixtures.
`market-brief.experimental.json` is admitted only as a derived regeneration
target; no experimental-item, attention, or destination composition is authorized.
Excluded are holdings, watchlist position data, scorecard call creation,
`nextSession.actions`, attention composition, anomaly seeds, candidates, alert
publication, Feature 020 thresholds, and any new credential or external source.

## Test Plan

| ID | Category | Scenario | Existing test surface | Exact planned test title | Command | Live system |
| --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | unit | SCN-019-018 | `scripts/selftest.mjs` | `SCN-019-018 out-of-boundary refinement is refused and question and boundary bytes remain equal` | `node scripts/selftest.mjs` | No |
| TP-05-02 | security | SCN-019-019 | `scripts/selftest.mjs` | `SCN-019-019 recursive private fields and non-public subjects are refused at every artifact layer` | `node scripts/selftest.mjs` | No |
| TP-05-03 | functional | SCN-019-020 | `tests/tool-experience-registry.functional.mjs` | `SCN-019-020 tool model adapter module journey and public target registries are in parity` | `node --test tests/tool-experience-registry.functional.mjs` | No |
| TP-05-04 | integration | SCN-019-020 | `scripts/validate-brief-payload.mjs` | `SCN-019-020 payload toolRead and page read agree and expose no destination routing fields` | `node scripts/validate-brief-payload.mjs` | Yes |
| TP-05-05 | e2e-ui | SCN-019-020 | `tests/tool-experience.spec.mjs` | `SCN-019-020 research agenda opens in Simple and Power reveals the complete dossier workspace` | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-019-020 research agenda opens in Simple and Power reveals the complete dossier workspace" --reporter=list` | Yes |
| TP-05-06 | e2e-ui | SCN-019-017 | `tests/tool-experience.spec.mjs` | `SCN-019-017 reversal comparison shows causal evidence invalidation prior view and current view` | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-019-017 reversal comparison shows causal evidence invalidation prior view and current view" --reporter=list` | Yes |
| TP-05-07 | e2e-ui | SCN-019-014, SCN-019-015 | `tests/tool-experience.spec.mjs` | `Regression: stale and unavailable current reviews cannot masquerade as the prior dossier` | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: stale and unavailable current reviews cannot masquerade as the prior dossier" --reporter=list` | Yes |
| TP-05-08 | e2e-ui | SCN-019-017, SCN-019-020 | `tests/tool-experience.spec.mjs` | `Regression: browser model chart table and tooltip values match canonical rlagenda output` | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: browser model chart table and tooltip values match canonical rlagenda output" --reporter=list` | Yes |
| TP-05-09 | e2e-ui | SCN-019-020 | `tests/tool-experience.spec.mjs` | `Regression: research levers recompute both modes without refetching or mutating history` | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: research levers recompute both modes without refetching or mutating history" --reporter=list` | Yes |
| TP-05-10 | security/e2e-ui | SCN-019-019 | `tests/tool-experience.spec.mjs` | `Regression: private corpus sentinel reaches no DOM request URL storage or public artifact` | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: private corpus sentinel reaches no DOM request URL storage or public artifact" --reporter=list` | Yes |
| TP-05-11 | e2e-ui | SCN-019-020 | `tests/market-brief-scorecard.spec.mjs` | `SCN-019-020 compact standing research read is visible on the brief and deep-links to its owner` | `npx --no-install playwright test tests/market-brief-scorecard.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-019-020 compact standing research read is visible on the brief and deep-links to its owner" --reporter=list` | Yes |
| TP-05-12 | e2e-ui | SCN-019-020 | `tests/contextual-tooltip.spec.mjs` | `Research charts tables tickers sources and tooltips retain units provenance limits and keyboard access` | `npx --no-install playwright test tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Research charts tables tickers sources and tooltips retain units provenance limits and keyboard access" --reporter=list` | Yes |
| TP-05-13 | e2e-ui | SCN-019-020 | `tests/deployed-site-parity.spec.mjs` | `SCN-019-020 deployed site contains every agenda artifact registry target and dossier link` | `npx --no-install playwright test tests/deployed-site-parity.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-019-020 deployed site contains every agenda artifact registry target and dossier link" --reporter=list` | Yes |
| TP-05-14 | e2e-ui | SCN-019-020 | `tests/tool-discovery.spec.mjs` | `Regression: existing tool routes and journeys remain reachable after research agenda registration` | `npx --no-install playwright test tests/tool-discovery.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: existing tool routes and journeys remain reachable after research agenda registration" --reporter=list` | Yes |

### Definition of Done - Tiered Validation

<!-- markdownlint-disable MD010 -->

#### Tier 1 - Behavior

- [x] SCN-019-018 through SCN-019-020 satisfy the exact Given/When/Then contracts above.

   ```text
   SCN-019-018 out-of-boundary refinement is refused and question and boundary bytes remain equal
	✓ TP-05-01: refinement preserves question and boundary bytes and refuses an out-of-boundary subject by name
   SCN-019-019 recursive private fields and non-public subjects are refused at every artifact layer
	✓ TP-05-02: recursive private fields and non-public subjects are refused while the read-only seam exposes no routing state
   TP-05-03_EXECUTION_BEGIN
   PLANNED_COMMAND=node --test tests/tool-experience-registry.functional.mjs
   SELECTOR=--test-name-pattern
   TARGET_TITLE=SCN-019-020 tool model adapter module journey and public target registries are in parity
   ✔ SCN-019-020 tool model adapter module journey and public target registries are in parity (33.981666ms)
   ℹ tests 1
   ℹ suites 0
   ℹ pass 1
   ℹ fail 0
   ℹ cancelled 0
   ℹ skipped 0
   ℹ todo 0
   ℹ duration_ms 92.136833
   TP-05-03_EXECUTION_EXIT=0
   TP-05-03_EXECUTION_END
   TP-05-04_EXECUTION_BEGIN
   PLANNED_COMMAND=node scripts/validate-brief-payload.mjs
   TARGET_TITLE=SCN-019-020 payload toolRead and page read agree and expose no destination routing fields
   LIVE_SYSTEM=Yes
   RUNNER=node
   [brief-contract] SCN-019-020 payload toolRead and page read agree and expose no destination routing fields: PASS
   [brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
   [brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
   TP-05-04_EXECUTION_EXIT=0
   TP-05-04_EXECUTION_END
   ```

- [x] Simple and Power expose one canonical current model, complete sustained state, prior versions, honest missing/stale states, and deterministic reversal comparison.

   ```text
   TP-05-05_EXECUTION_BEGIN
   TARGET_TITLE=SCN-019-020 research agenda opens in Simple and Power reveals the complete dossier workspace
   LIVE_SYSTEM=Yes
   Running 1 test using 1 worker
	✓  1 …opens in Simple and Power reveals the complete dossier workspace (885ms)
	1 passed (2.0s)
   TP-05-05_EXECUTION_EXIT=0
   TP-05-05_EXECUTION_END
   TP-05-06_EXECUTION_BEGIN
   TARGET_TITLE=SCN-019-017 reversal comparison shows causal evidence invalidation prior view and current view
   LIVE_SYSTEM=Yes
   Running 1 test using 1 worker
	✓  1 …n shows causal evidence invalidation prior view and current view (473ms)
	1 passed (1.2s)
   TP-05-06_EXECUTION_EXIT=0
   TP-05-06_EXECUTION_END
   TP-05-07_EXECUTION_BEGIN
   TARGET_TITLE=Regression: stale and unavailable current reviews cannot masquerade as the prior dossier
   LIVE_SYSTEM=Yes
   Running 1 test using 1 worker
	✓  1 …available current reviews cannot masquerade as the prior dossier (683ms)
	1 passed (1.9s)
   TP-05-07_EXECUTION_EXIT=0
   TP-05-07_EXECUTION_END
   TP-05-08_EXECUTION_BEGIN
   TARGET_TITLE=Regression: browser model chart table and tooltip values match canonical rlagenda output
   LIVE_SYSTEM=Yes
   Running 1 test using 1 worker
	✓  1 …l chart table and tooltip values match canonical rlagenda output (657ms)
	1 passed (1.5s)
   TP-05-08_EXECUTION_EXIT=0
   TP-05-08_EXECUTION_END
   TP-05-09_EXECUTION_BEGIN
   TARGET_TITLE=Regression: research levers recompute both modes without refetching or mutating history
   LIVE_SYSTEM=Yes
   Running 1 test using 1 worker
	✓  1 …vers recompute both modes without refetching or mutating history (724ms)
	1 passed (1.4s)
   TP-05-09_EXECUTION_EXIT=0
   TP-05-09_EXECUTION_END
   ```

- [x] The compact brief read, registered toolRead, page artifact, rendered brief section, owning tool, and durable topic links resolve as one reader journey.

   ```text
   TP-05-11_EXECUTION_BEGIN
   TARGET_TITLE=SCN-019-020 compact standing research read is visible on the brief and deep-links to its owner
   LIVE_SYSTEM=Yes
   Running 1 test using 1 worker
	✓  1 …research read is visible on the brief and deep-links to its owner (1.2s)
	1 passed (1.8s)
   TP-05-11_EXECUTION_EXIT=0
   TP-05-11_EXECUTION_END
   TP-05-13_EXECUTION_BEGIN
   TARGET_TITLE=SCN-019-020 deployed site contains every agenda artifact registry target and dossier link
   LIVE_SYSTEM=Yes
   Running 1 test using 1 worker
	✓  1 … contains every agenda artifact registry target and dossier link (564ms)
	1 passed (4.0s)
   TP-05-13_EXECUTION_EXIT=0
   TP-05-13_EXECUTION_END
   TP-05-14_EXECUTION_BEGIN
   TARGET_TITLE=Regression: existing tool routes and journeys remain reachable after research agenda registration
   LIVE_SYSTEM=Yes
   Running 1 test using 1 worker
	✓  1 …and journeys remain reachable after research agenda registration (696ms)
	1 passed (1.4s)
   TP-05-14_EXECUTION_EXIT=0
   TP-05-14_EXECUTION_END
   ```

- [x] Feature 020 receives a validated read-only finding seam, while Feature 019 writes no destination or routing state.

   ```text
   SCN-019-019 recursive private fields and non-public subjects are refused at every artifact layer
	✓ TP-05-02: recursive private fields and non-public subjects are refused while the read-only seam exposes no routing state
	✓ TP-05-04: the registered agenda tool read is canonical and the collector carries the transaction-composed read
   TP-05-04_EXECUTION_BEGIN
   TARGET_TITLE=SCN-019-020 payload toolRead and page read agree and expose no destination routing fields
   LIVE_SYSTEM=Yes
   [brief-contract] SCN-019-020 payload toolRead and page read agree and expose no destination routing fields: PASS
   TP-05-04_EXECUTION_EXIT=0
   TP-05-04_EXECUTION_END
   CANONICAL_FORBIDDEN_FIELD_CHANGES=0
   RECURSIVE_JSON_FILES=19
   RECURSIVE_FORBIDDEN_KEY_CHANGES=0
   SOURCE_ASSIGNMENT_FILES=20
   SOURCE_FORBIDDEN_ASSIGNMENTS=0
   SCOPE05_BOUNDARY_CLASSIFIER_LITERAL_PROBE_EXIT=0
   ```

#### Tier 2 - Test Evidence (14 rows)

The fourteen items below are the complete test-related DoD inventory for this
scope. Each item maps one-to-one to the same ID in the Markdown Test Plan and
`test-plan.json`.

- [x] TP-05-01: `scripts/selftest.mjs` executes `SCN-019-018 out-of-boundary refinement is refused and question and boundary bytes remain equal` with fresh evidence.

  ```text
  TP-05-01_REMEDIATION_BEGIN
  # TP-05-01 remediation re-execution
  $ node scripts/selftest.mjs
  exit: 0
  lines: 1998
  sha256: c916690a349425687bb7aa8b2ebaed6872a8afbe71d6cb42eb6e792b21487e10
  --- first 20 ---

  Step 1 security — escaped model sinks and CSP on every page
   ✓ every shipped HTML page carries a Content-Security-Policy meta
   ✓ all pages use one identical CSP instead of drifting per page
   ✓ CSP keeps the single-file inline-script design while defaulting to self
   ✓ CSP blocks object, base-tag, and form exfiltration paths
   ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
   ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
   ✓ CSP allows no open URL-forwarding relay origin
   ✓ production pages and shared runtime contain no open URL-forwarding relay chain
   ✓ no model/config-authored field reaches innerHTML without esc()
   ✓ the sink detector catches an unescaped model-authored title

  Feature 004 RLFX/RLDATA foundation
   ✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
   ✓ RLFX universe is bounded closed and asserts no live source authorization
   ✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
   ✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
   ✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
   ✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
  --- omitted 1958 line(s); sha256 above covers the full output ---
  --- last 20 ---
  Feature 019 candidate contract accounts for new sourced unchanged stale and unavailable reviews before publication
   ✓ TP-04-03: new sourced evidence creates one complete updated review and one sustained dossier
   ✓ TP-04-03: a quiet complete pass writes an unchanged review reusing the prior dossier without inventing a finding
   ✓ TP-04-03: stale evidence records its age and publishes no current model output or dossier
   ✓ TP-04-03: a failed lane creates a named unavailable review with no partial finding or dossier

  SCN-019-014 stale evidence publishes its age has zero model impact and never masquerades as current
   ✓ TP-04-05: stale evidence has zero impact and the compact read labels stale with its age
   ✓ TP-04-05: stale current review never points at or masquerades as the prior dossier

  SCN-019-018 out-of-boundary refinement is refused and question and boundary bytes remain equal
   ✓ TP-05-01: refinement preserves question and boundary bytes and refuses an out-of-boundary subject by name

  SCN-019-019 recursive private fields and non-public subjects are refused at every artifact layer
   ✓ TP-05-02: recursive private fields and non-public subjects are refused while the read-only seam exposes no routing state
   ✓ TP-05-04: the registered agenda tool read is canonical and the collector carries the transaction-composed read

  ================================================
  Research-Lab self-test: 1699 passed, 0 failed
  ================================================
  TP-05-01_REMEDIATION_OUTER_EXIT=0
  TP-05-01_REMEDIATION_END
  ```

- [x] TP-05-02: `scripts/selftest.mjs` executes `SCN-019-019 recursive private fields and non-public subjects are refused at every artifact layer` with fresh evidence.

   ```text
   TP-05-02_REMEDIATION_BEGIN
   # TP-05-02 remediation re-execution
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1998
   sha256: 8a2fec20fd9cebebe979cd438af5b16974c77f520f5d8f635e8b6c3fd076ca18
   --- first 20 ---

   Step 1 security — escaped model sinks and CSP on every page
	✓ every shipped HTML page carries a Content-Security-Policy meta
	✓ all pages use one identical CSP instead of drifting per page
	✓ CSP keeps the single-file inline-script design while defaulting to self
	✓ CSP blocks object, base-tag, and form exfiltration paths
	✓ CSP connect-src is an explicit origin allowlist, never wildcard https
	✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
	✓ CSP allows no open URL-forwarding relay origin
	✓ production pages and shared runtime contain no open URL-forwarding relay chain
	✓ no model/config-authored field reaches innerHTML without esc()
	✓ the sink detector catches an unescaped model-authored title

   Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
   --- omitted 1958 line(s); sha256 above covers the full output ---
   --- last 20 ---
   Feature 019 candidate contract accounts for new sourced unchanged stale and unavailable reviews before publication
	✓ TP-04-03: new sourced evidence creates one complete updated review and one sustained dossier
	✓ TP-04-03: a quiet complete pass writes an unchanged review reusing the prior dossier without inventing a finding
	✓ TP-04-03: stale evidence records its age and publishes no current model output or dossier
	✓ TP-04-03: a failed lane creates a named unavailable review with no partial finding or dossier

   SCN-019-014 stale evidence publishes its age has zero model impact and never masquerades as current
	✓ TP-04-05: stale evidence has zero impact and the compact read labels stale with its age
	✓ TP-04-05: stale current review never points at or masquerades as the prior dossier

   SCN-019-018 out-of-boundary refinement is refused and question and boundary bytes remain equal
	✓ TP-05-01: refinement preserves question and boundary bytes and refuses an out-of-boundary subject by name

   SCN-019-019 recursive private fields and non-public subjects are refused at every artifact layer
	✓ TP-05-02: recursive private fields and non-public subjects are refused while the read-only seam exposes no routing state
	✓ TP-05-04: the registered agenda tool read is canonical and the collector carries the transaction-composed read

   ================================================
   Research-Lab self-test: 1699 passed, 0 failed
   ================================================
   TP-05-02_REMEDIATION_OUTER_EXIT=0
   TP-05-02_REMEDIATION_END
   ```

- [x] TP-05-03: `tests/tool-experience-registry.functional.mjs` executes `SCN-019-020 tool model adapter module journey and public target registries are in parity` with fresh evidence.

   ```text
   TP-05-03_EXECUTION_BEGIN
   PLANNED_COMMAND=node --test tests/tool-experience-registry.functional.mjs
   SELECTOR=--test-name-pattern
   TARGET_TITLE=SCN-019-020 tool model adapter module journey and public target registries are in parity
   ✔ SCN-019-020 tool model adapter module journey and public target registries are in parity (33.981666ms)
   ℹ tests 1
   ℹ suites 0
   ℹ pass 1
   ℹ fail 0
   ℹ cancelled 0
   ℹ skipped 0
   ℹ todo 0
   ℹ duration_ms 92.136833
   TP-05-03_EXECUTION_EXIT=0
   TP-05-03_EXECUTION_END
   ```

- [x] TP-05-04: `scripts/validate-brief-payload.mjs` executes `SCN-019-020 payload toolRead and page read agree and expose no destination routing fields` with fresh evidence.

   ```text
   TP-05-04_EXECUTION_BEGIN
   PLANNED_COMMAND=node scripts/validate-brief-payload.mjs
   TARGET_TITLE=SCN-019-020 payload toolRead and page read agree and expose no destination routing fields
   LIVE_SYSTEM=Yes
   RUNNER=node
   [brief-contract] SCN-019-020 payload toolRead and page read agree and expose no destination routing fields: PASS
   [brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
   [brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
   TP-05-04_EXECUTION_EXIT=0
   TP-05-04_EXECUTION_END
   ```

- [x] TP-05-05: `tests/tool-experience.spec.mjs` executes `SCN-019-020 research agenda opens in Simple and Power reveals the complete dossier workspace` with fresh evidence.

   ```text
   TP-05-05_EXECUTION_BEGIN
   PLANNED_COMMAND=npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-019-020 research agenda opens in Simple and Power reveals the complete dossier workspace" --reporter=list
   TARGET_TITLE=SCN-019-020 research agenda opens in Simple and Power reveals the complete dossier workspace
   LIVE_SYSTEM=Yes

   Running 1 test using 1 worker

	✓  1 …opens in Simple and Power reveals the complete dossier workspace (885ms)

	1 passed (2.0s)
   TP-05-05_EXECUTION_EXIT=0
   TP-05-05_EXECUTION_END
   ```

- [x] TP-05-06: `tests/tool-experience.spec.mjs` executes `SCN-019-017 reversal comparison shows causal evidence invalidation prior view and current view` with fresh evidence.

   ```text
   TP-05-06_EXECUTION_BEGIN
   PLANNED_COMMAND=npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-019-017 reversal comparison shows causal evidence invalidation prior view and current view" --reporter=list
   TARGET_TITLE=SCN-019-017 reversal comparison shows causal evidence invalidation prior view and current view
   LIVE_SYSTEM=Yes

   Running 1 test using 1 worker

	✓  1 …n shows causal evidence invalidation prior view and current view (473ms)

	1 passed (1.2s)
   TP-05-06_EXECUTION_EXIT=0
   TP-05-06_EXECUTION_END
   ```

- [x] TP-05-07: `tests/tool-experience.spec.mjs` executes `Regression: stale and unavailable current reviews cannot masquerade as the prior dossier` with fresh evidence.

   ```text
   TP-05-07_EXECUTION_BEGIN
   PLANNED_COMMAND=npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: stale and unavailable current reviews cannot masquerade as the prior dossier" --reporter=list
   TARGET_TITLE=Regression: stale and unavailable current reviews cannot masquerade as the prior dossier
   LIVE_SYSTEM=Yes

   Running 1 test using 1 worker

	✓  1 …available current reviews cannot masquerade as the prior dossier (683ms)

	1 passed (1.9s)
   TP-05-07_EXECUTION_EXIT=0
   TP-05-07_EXECUTION_END
   ```

- [x] TP-05-08: `tests/tool-experience.spec.mjs` executes `Regression: browser model chart table and tooltip values match canonical rlagenda output` with fresh evidence.

   ```text
   TP-05-08_EXECUTION_BEGIN
   PLANNED_COMMAND=npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: browser model chart table and tooltip values match canonical rlagenda output" --reporter=list
   TARGET_TITLE=Regression: browser model chart table and tooltip values match canonical rlagenda output
   LIVE_SYSTEM=Yes

   Running 1 test using 1 worker

	✓  1 …l chart table and tooltip values match canonical rlagenda output (657ms)

	1 passed (1.5s)
   TP-05-08_EXECUTION_EXIT=0
   TP-05-08_EXECUTION_END
   ```

- [x] TP-05-09: `tests/tool-experience.spec.mjs` executes `Regression: research levers recompute both modes without refetching or mutating history` with fresh evidence.

   ```text
   TP-05-09_EXECUTION_BEGIN
   PLANNED_COMMAND=npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: research levers recompute both modes without refetching or mutating history" --reporter=list
   TARGET_TITLE=Regression: research levers recompute both modes without refetching or mutating history
   LIVE_SYSTEM=Yes

   Running 1 test using 1 worker

	✓  1 …vers recompute both modes without refetching or mutating history (724ms)

	1 passed (1.4s)
   TP-05-09_EXECUTION_EXIT=0
   TP-05-09_EXECUTION_END
   ```

- [x] TP-05-10: `tests/tool-experience.spec.mjs` executes `Regression: private corpus sentinel reaches no DOM request URL storage or public artifact` with fresh evidence.

   ```text
   TP-05-10_EXECUTION_BEGIN
   PLANNED_COMMAND=npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: private corpus sentinel reaches no DOM request URL storage or public artifact" --reporter=list
   TARGET_TITLE=Regression: private corpus sentinel reaches no DOM request URL storage or public artifact
   LIVE_SYSTEM=Yes

   Running 1 test using 1 worker

	✓  1 …s sentinel reaches no DOM request URL storage or public artifact (519ms)

	1 passed (1.2s)
   TP-05-10_EXECUTION_EXIT=0
   TP-05-10_EXECUTION_END
   ```

- [x] TP-05-11: `tests/market-brief-scorecard.spec.mjs` executes `SCN-019-020 compact standing research read is visible on the brief and deep-links to its owner` with fresh evidence.

   ```text
   TP-05-11_EXECUTION_BEGIN
   PLANNED_COMMAND=npx --no-install playwright test tests/market-brief-scorecard.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-019-020 compact standing research read is visible on the brief and deep-links to its owner" --reporter=list
   TARGET_TITLE=SCN-019-020 compact standing research read is visible on the brief and deep-links to its owner
   LIVE_SYSTEM=Yes

   Running 1 test using 1 worker

	✓  1 …research read is visible on the brief and deep-links to its owner (1.2s)

	1 passed (1.8s)
   TP-05-11_EXECUTION_EXIT=0
   TP-05-11_EXECUTION_END
   ```

- [x] TP-05-12: `tests/contextual-tooltip.spec.mjs` executes `Research charts tables tickers sources and tooltips retain units provenance limits and keyboard access` with fresh evidence.

   ```text
   TP-05-12_EXECUTION_BEGIN
   PLANNED_COMMAND=npx --no-install playwright test tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Research charts tables tickers sources and tooltips retain units provenance limits and keyboard access" --reporter=list
   TARGET_TITLE=Research charts tables tickers sources and tooltips retain units provenance limits and keyboard access
   LIVE_SYSTEM=Yes

   Running 1 test using 1 worker

	✓  1 … and tooltips retain units provenance limits and keyboard access (579ms)

	1 passed (1.2s)
   TP-05-12_EXECUTION_EXIT=0
   TP-05-12_EXECUTION_END
   ```

- [x] TP-05-13: `tests/deployed-site-parity.spec.mjs` executes `SCN-019-020 deployed site contains every agenda artifact registry target and dossier link` with fresh evidence.

   ```text
   TP-05-13_EXECUTION_BEGIN
   PLANNED_COMMAND=npx --no-install playwright test tests/deployed-site-parity.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-019-020 deployed site contains every agenda artifact registry target and dossier link" --reporter=list
   TARGET_TITLE=SCN-019-020 deployed site contains every agenda artifact registry target and dossier link
   LIVE_SYSTEM=Yes

   Running 1 test using 1 worker

	✓  1 … contains every agenda artifact registry target and dossier link (564ms)

	1 passed (4.0s)
   TP-05-13_EXECUTION_EXIT=0
   TP-05-13_EXECUTION_END
   ```

- [x] TP-05-14: `tests/tool-discovery.spec.mjs` executes `Regression: existing tool routes and journeys remain reachable after research agenda registration` with fresh evidence.

   ```text
   TP-05-14_EXECUTION_BEGIN
   PLANNED_COMMAND=npx --no-install playwright test tests/tool-discovery.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: existing tool routes and journeys remain reachable after research agenda registration" --reporter=list
   TARGET_TITLE=Regression: existing tool routes and journeys remain reachable after research agenda registration
   LIVE_SYSTEM=Yes

   Running 1 test using 1 worker

	✓  1 …and journeys remain reachable after research agenda registration (696ms)

	1 passed (1.4s)
   TP-05-14_EXECUTION_EXIT=0
   TP-05-14_EXECUTION_END
   ```

#### Tier 3 - Parity And Policy

- [x] Markdown Test Plan rows, `test-plan.json`, and `scenario-manifest.json` contain the same row and scenario mappings.

   ```text
   | Exact Test Plan rows executed | 14 |
   | Passed exact rows | 14 |
   | Failed exact rows | 0 |
   | Skipped exact rows | 0 |
   | TP-05-01 | unit | SCN-019-018 out-of-boundary refinement is refused and question and boundary bytes remain equal | `node scripts/selftest.mjs` | PASS |
   | TP-05-02 | security | SCN-019-019 recursive private fields and non-public subjects are refused at every artifact layer | `node scripts/selftest.mjs` | PASS |
   | TP-05-03 | functional | SCN-019-020 tool model adapter module journey and public target registries are in parity | `node --test tests/tool-experience-registry.functional.mjs` | PASS |
   | TP-05-04 | integration | SCN-019-020 payload toolRead and page read agree and expose no destination routing fields | `node scripts/validate-brief-payload.mjs` | PASS |
   | TP-05-13 | e2e-ui | SCN-019-020 deployed site contains every agenda artifact registry target and dossier link | `npx --no-install playwright test tests/deployed-site-parity.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-019-020 deployed site contains every agenda artifact registry target and dossier link" --reporter=list` | PASS |
   | TP-05-14 | e2e-ui | Regression: existing tool routes and journeys remain reachable after research agenda registration | `npx --no-install playwright test tests/tool-discovery.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: existing tool routes and journeys remain reachable after research agenda registration" --reporter=list` | PASS |
   | T3R-09 | `gtimeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/019-custom-recurring-research-agenda` | 0 | 94 lines; sha256 `77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c` |
   | T3R-10 | `gtimeout 240 bash .github/bubbles/scripts/traceability-guard.sh specs/019-custom-recurring-research-agenda --all-scopes` | 0 | 159 lines; 20 scenarios and 59 rows; sha256 `a1f9c83fbe17090a88747bbe5155097c606dba837761db4aeecab325647d9e64` |
   ```

- [x] Tool, navigation, note, site, simple-model, adapter, module-allowlist, experience, journey, public-target, payload, and page registries are in parity.

   ```text
   | T3R-02 | `gtimeout 240 npx --no-install playwright test tests/tool-discovery.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep 'Regression: existing tool routes and journeys remain reachable after research agenda registration' --reporter=list` | 0 | TP-05-14: 1 passed, 6 lines, sha256 `5b8def13d9ae00e5ceb618fff75c57a3496e14c540d5932e1dd62bf024910acb` |
   | T3R-03 | `gtimeout 540 npx --no-install playwright test tests/tool-discovery.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | 0 | 5 passed, 10 lines, sha256 `6ad890a33cd9529914c54d54aa90a5b795cd716a2eb0b0b5fbb67dc96b1fec4d` |
   | T3R-04 | `gtimeout 1140 npx --no-install playwright test tests/tool-experience.spec.mjs tests/market-brief-scorecard.spec.mjs tests/contextual-tooltip.spec.mjs tests/deployed-site-parity.spec.mjs tests/tool-discovery.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | 0 | 56 passed, 67 lines, sha256 `61fa6e8e2ce9e1c8483fabef87b59dae646b8238a9db8b1ba2b86c4b714a5ae9` |
   | T3R-05 | `gtimeout 240 bash .github/bubbles/scripts/regression-quality-guard.sh tests/tool-experience.spec.mjs tests/market-brief-scorecard.spec.mjs tests/contextual-tooltip.spec.mjs tests/deployed-site-parity.spec.mjs tests/tool-discovery.spec.mjs tests/tool-experience-registry.functional.mjs` | 0 | 23 lines, 0 violations, 0 warnings, sha256 `83b11d0f39948ef59c61b1bd163b7d306ca860413e39b66e5d7e1b4a0d10cff5` |
   | T3R-16 | `gtimeout 240 node scripts/build-pages-site.mjs --dry-run` | 0 | 1 line; 26 registered pages; sha256 `aa66a885ca60750c3b92284e118e86387df100f305cf1624539764dd8b6293eb` |
   | T3R-17 | `gtimeout 240 node scripts/build-brief-page-artifacts.mjs --check` | 0 | 1 line; `stale=false`; sha256 `ab698c0f0b3529476d586a359432aa2e04ee1c0b01bc5d93ad0e2b6d512176f7` |
   | T3R-18 | `gtimeout 240 node scripts/validate-tool-experience.mjs` | 0 | 32 lines; 26 tools, 13 adversarial rejections; sha256 `4bc90c059c6bee91ba1a3da346805521f6ec986d77eacc1f9604e997ca88b607` |
   | T3R-19 | `gtimeout 240 node scripts/validate-node-source-lock.mjs` | 0 | 22 lines; actual graph and 16 adversarial rejections; sha256 `e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1` |
   | Required assertion quality | PASS: 0 optional-required-assertion violations |
   | TP-05-14 and full discovery file | PASS: 1/1 and 5/5 |
   | Scope 5 touched browser surfaces | PASS: 56/56 |
   | Public build, experience, source-lock, PII, and framework integrity | PASS |
   ```

- [x] Recursive public-safety and reader-vocabulary checks expose no private sentinel, raw refusal code, contract slug, or misleading current-state claim.

   ```text
   | T3R-07 | `gtimeout 1140 node scripts/selftest.mjs` through `evidence-capture.sh` | 0 | 1,699 passed, 0 failed; 1,998 lines; sha256 `33264cb0ab5c53d5cbc05b48fe80140db7de953ed5d480757d6c3c29802f21a6` |
   | T3R-08 | `gtimeout 240 node scripts/validate-brief-payload.mjs` | 0 | 3 lines; sha256 `d30b047ef8a57b383285c85607ff48bfbbedf160fb719798174e0ab71a99e9dc` |
   | T3R-20 | `gtimeout 540 node scripts/pii-scan.mjs` | 0 | 1 line; 6,342 files, 1,246 messages, 0 findings; sha256 `a9b7c60c95774d9797422adf9d2395a6ec8023a40013a10e8e51b5c9ca1139c0` |
   ANTI_MOCK_FILES=6
   tests/tool-experience.spec.mjs executable_calls=0
   tests/market-brief-scorecard.spec.mjs executable_calls=0
   tests/contextual-tooltip.spec.mjs executable_calls=0
   tests/deployed-site-parity.spec.mjs executable_calls=0
   tests/tool-discovery.spec.mjs executable_calls=0
   tests/tool-experience-registry.functional.mjs executable_calls=0
   ANTI_MOCK_EXECUTABLE_FINDINGS=0
   CANONICAL_FORBIDDEN_FIELD_CHANGES=0
   RECURSIVE_JSON_FILES=19
   RECURSIVE_FORBIDDEN_KEY_CHANGES=0
   SOURCE_ASSIGNMENT_FILES=20
   SOURCE_FORBIDDEN_ASSIGNMENTS=0
   ```

- [x] Artifact lint, traceability, capability foundation, artifact freshness, payload, site, PII, test-path, reference-existence, fence-parity, and diff checks pass.

   ```text
   | T3R-09 | `gtimeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/019-custom-recurring-research-agenda` | 0 | 94 lines; sha256 `77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c` |
   | T3R-11 | `gtimeout 240 bash .github/bubbles/scripts/artifact-freshness-guard.sh specs/019-custom-recurring-research-agenda` | 0 | 24 lines; 0 failures, 0 warnings; sha256 `7fc76be2b2615eae641ccf475de92eb27c185606fef3d3e7740a1703378e9cbf` |
   | T3R-12 | `gtimeout 240 bash .github/bubbles/scripts/capability-foundation-guard.sh specs/019-custom-recurring-research-agenda` | 0 | 6 lines; Gate G094 pass; sha256 `1690ce979fffad8404589a4736402cd54da8be6eef0e71926ce74baa2c1873cf` |
   | T3R-13 | `gtimeout 240 bash .github/bubbles/scripts/reference-existence-lint.sh specs/019-custom-recurring-research-agenda` | 0 | 1 line; 14 Markdown files; sha256 `25085caa8385a79d310472d6a305b34eb7f549f54032b969db5fb203ee46aa12` |
   | T3R-14 | `gtimeout 240 node scripts/validate-spec-test-paths.mjs` | 0 | 6 lines; 0 new missing paths, 3 stale baseline rows; sha256 `5787fd18c03aec38c102bae3eebae7a1934d772bd7ecdf4c01eb190d23ea43e2` |
   | T3R-16 | `gtimeout 240 node scripts/build-pages-site.mjs --dry-run` | 0 | 1 line; 26 registered pages; sha256 `aa66a885ca60750c3b92284e118e86387df100f305cf1624539764dd8b6293eb` |
   | T3R-17 | `gtimeout 240 node scripts/build-brief-page-artifacts.mjs --check` | 0 | 1 line; `stale=false`; sha256 `ab698c0f0b3529476d586a359432aa2e04ee1c0b01bc5d93ad0e2b6d512176f7` |
   | T3R-20 | `gtimeout 540 node scripts/pii-scan.mjs` | 0 | 1 line; 6,342 files, 1,246 messages, 0 findings; sha256 `a9b7c60c95774d9797422adf9d2395a6ec8023a40013a10e8e51b5c9ca1139c0` |
   | T3R-21 | `gtimeout 240 bash .github/bubbles/scripts/downstream-framework-write-guard.sh` | 0 | 6 lines; installed snapshot unchanged; sha256 `60692529891cd94b1be31c00d768e90ae2a35f7ef250445a6e7d928d7e9a09b5` |
   | T3R-22 | `gtimeout 240 git diff --check` plus the current-session exact-hard-break classifier under marker `SCOPE05_DIFF_CHECK_BEGIN` | 2, 0 | 192 lines; sha256 `101d376e5c06c763f6f23d807ef815eeecc856051ba53e4c02c105cd5674e788`; 96 report-only exact hard breaks, 0 source/test diagnostics |
   | T3R-23 | Current-session bounded JSON/JSONL, fence, report-prefix, skip-marker, and assertion-integrity check under marker `SCOPE05_PRE_REPORT_INTEGRITY_CORRECTED_BEGIN` | 0 | 29 JSON/JSONL files parsed; 14 Feature 019 Markdown files with 206 even fences; controlling historical prefix unchanged; full output below |
   SCOPE05_REPORT_APPEND_INTEGRITY_CORRECTED_EXIT=0
   REPORT_PREFIX_HARD_BREAKS=96
   REPORT_SUFFIX_TRAILING_WHITESPACE_LINES=0
   REPORT_CURRENT_FENCES_EVEN=true
   SCOPE05_FINAL_DIFF_CHECK_CLASSIFIED_EXIT=0
   ```

- [x] The implementation diff stays inside the declared boundary and contains no action, attention, anomaly, candidate, alert, score, or Feature 020 policy write.

   ```text
   CHANGED_PATHS=82
   SCOPE_TEST_PLAN_PATHS=65
   SUPPORT_COMPANIONS=1
   SUPPORT_COMPANION=tests/brief-refresh-atomicity.support.mjs
   GOVERNANCE_PATHS=16
   UNDECLARED_PATHS=0
   OWNER_FAILURES=0
   JSON_JSONL_FILES=29
   JSON_PARSE_FAILURES=0
   FORBIDDEN_JSON_CHANGES=0
   SOURCE_ASSIGNMENT_FILES=20
   FORBIDDEN_SOURCE_ASSIGNMENTS=0
   SCOPE05_BOUNDARY_CLASSIFIER_LITERAL_PROBE_EXIT=0
   ```

<!-- markdownlint-enable MD010 -->

---

*Educational models only - not investment advice.*
