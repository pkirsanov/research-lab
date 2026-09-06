# Scopes: BUG-025 — A Company Corpus Read That Never Answers Never Settles

Related: [spec.md](spec.md) · [design.md](design.md) · [report.md](report.md) · [uservalidation.md](uservalidation.md)

## Execution Outline

### Phase Order

1. **Scope 1 — Declare And Enforce One Read Bound:** Preserve the delivered bounded-read behavior while closing event-path authority and terminal configuration-refusal behavior on the existing Company Intelligence route.

### New Types And Signatures

- No new public type, endpoint, route, persisted schema, config version, dependency, error code, provider, adapter, or retry API is introduced.
- `readEventSource(declared)` accepts only `^company:([a-z0-9]+(?:-[a-z0-9]+)*)$`, derives `data/company-intelligence/company-<suffix>/events.json`, requires strict declared-path equality, rejects duplicate subjects, and rebuilds the normalized frozen rows.
- `eventsPathFor(registry, subjectId)` continues to return a path or `null`, but every non-null path is validator-constructed rather than copied from raw configuration.
- `renderRefusal(refusal, presentation)` receives an explicit closed presentation value. `route-terminal` suppresses result surfaces and fixes readiness at `not-established`; `standing-reading` preserves the existing accepted-reading behavior.
- `#subject-refusal` keeps the existing code and safe message surface and gains static `role="alert"`, `aria-live="assertive"`, and `aria-atomic="true"` semantics.
- Raw embedded and served configuration objects remain local candidates until `INTEL.readCoverageRegistry()` returns a complete frozen registry.

### Validation Checkpoints

1. **Planning checkpoint:** scenario obligation lint, test mechanism lint, planned-test resolver, implementation-reality scan, planning-shape checks, and artifact lint run against this exact plan.
2. **Certification-mirror checkpoint:** `bubbles.validate` removes Scope 1 from the completed-scope mirror and records non-terminal Scope 1 progress as twelve checked and three unchecked rows. Both status mirrors remain `in_progress`.
3. **Test-fidelity checkpoint:** `bubbles.test` strengthens the existing browser carrier, proves the focus-theft, duplicate-announcement, and canonical-subject mutations fail only their named discriminators, and then executes the unmodified carriers GREEN. Production bytes remain unchanged.
4. **Boundary checkpoint:** `bubbles.implement` refreshes current packet, map, protected-runner, sibling-map, production, test, and user-validation boundary evidence without claiming an isolated commit.
5. **Validation checkpoint:** `bubbles.validate` re-adjudicates rows 9 through 11 and row 15 against current execution and boundary evidence while preserving a non-terminal result unless every strengthened obligation is earned.
6. **Audit checkpoint:** `bubbles.audit` reads the complete scope, certification mirrors, and claim chronology and independently rechecks all seven findings.

### Scope Ordering Rationale

Scope 1 remains one vertical route outcome because the validator, route state transition, visible refusal, accessibility behavior, and real-origin request ledger must remain correct together. This audit rework changes proof fidelity, not production behavior. Its owner sequence is planning reconciliation, validate-owned non-terminal mirror reconciliation, test-owned carrier and mutation execution, implementation-owned boundary evidence refresh, validate-owned re-adjudication, and independent audit.

### Scope Inventory

| Scope | Surfaces | Scenario Proof | DoD Summary | Status |
| --- | --- | --- | --- | --- |
| 1. Declare And Enforce One Read Bound | Validator, existing route, unit, real-browser, selftest, product note | `SCN-BUG-025-001` through `SCN-BUG-025-008` | Preserve bounded reads; enforce one canonical event identity; make embedded and served schema refusals terminal, safe, request-free, and focus-preserving | Done |

## Change Boundary

**Allowed file families — production:** `rlcompanyintel.js` and `company-intelligence-lab.html`, excluding any change to the embedded configuration object bytes.

**Allowed file families — tests:** `tests/company-intelligence.unit.mjs`, `tests/company-intelligence-lab.spec.mjs`, and `scripts/selftest.mjs`.

**Allowed file families — test infrastructure:** `scripts/scenario-break-map-bug025.json` only. Planning may align the existing `SCN-BUG-025-006` declarative entry with the reconciled canonical-subject predicate. Persistent carrier changes and all RED/GREEN execution remain owned by `bubbles.test`. The unchanged generic runner `scripts/scenario-receipts.mjs` and every sibling `scripts/scenario-break-map-*.json` remain protected controls.

**Allowed file families — product documentation:** `notes/company-intelligence-lab.md`.

**Allowed file families — packet artifacts:** this bug packet's planning, owner-attributed execution evidence, and owner-attributed routing history only.

Protected controls: `company-intelligence.config.json`, the embedded configuration object bytes in `company-intelligence-lab.html`, `data/company-intelligence/company-msft/events.json`, `scripts/scenario-receipts.mjs`, the existing sibling controlled-break maps, `uservalidation.md`, `spec.md`, and `bug.md`.

**Excluded surfaces:** `rldata.js`, `rlcontracts.js`, CSP, service workers, site registration, `site-exclusions.json`, package manifests or locks, dependencies, provider access, external origins, retries, backoff, user-validation or certification content outside its owning agent, unrelated corpus or event data, sibling tools, and every unrelated or framework-managed file.

## Scope 1: Declare And Enforce One Read Bound

**Status:** Done
**Scope-Kind:** runtime-behavior
**Depends On:** none
**Consumer Surface:** the existing Company Multi-Horizon Intelligence Lab web page at `company-intelligence-lab.html` and its Simple and Power result surfaces.

### Gherkin Scenarios

```gherkin
Feature: Company corpus reads reach a bounded outcome

  Scenario: A same-origin corpus response never answers
    Given the route has painted from its embedded registry
    And one requested company corpus response remains open
    When the declared read bound expires
    Then the underlying request is aborted
    And the current reading settles as established with named unavailable sources

  Scenario: A slow response answers inside the bound
    Given one company corpus response is held after request entry
    When the response is released before the declared bound
    Then the current reading settles from that response
    And it is not classified as a timeout

  Scenario: The served configuration response never answers
    Given the embedded configuration has already produced first paint
    When the served configuration request exceeds the declared bound
    Then the route retains the validated embedded configuration
    And corpus reconciliation continues through bounded reads

  Scenario: Synchronous request setup fails before a usable promise exists
    Given the embedded configuration has already produced first paint
    And route-owned fetch setup throws synchronously before it returns a usable request promise
    When a company corpus document read enters the bounded helper
    Then the helper rejection reaches the caller's existing unavailable classification
    And no network request proceeds for that attempted document read
    And zero bounded-read timers remain active

  Scenario: A late valid response cannot overwrite a newer settled subject
    Given the route has selected a first valid subject
    And the first subject's selected real corpus response is held after request entry
    When the user selects a second valid subject
    And the second subject's reading settles and publishes its ordinary tool read
    And the first subject's valid response is released afterward
    Then the visible subject remains the second subject
    And the corpus and reading-readiness attributes remain the second subject's settled state
    And every horizon account remains the second subject's account
    And the ordinary published tool read remains the second subject's read
    And the stale completion neither repaints nor publishes the first subject

  Scenario: An accepted canonical company subject authorizes only its canonical event document
    Given the event source declares subject "company:msft"
    And it declares "data/company-intelligence/company-msft/events.json"
    When the production route validates the declaration and settles the MSFT reading over its real origin
    Then the frozen registry retains the exact canonical pair
    And the exact canonical event path is requested once
    And no other event path is requested
    And no off-origin request is issued

  Scenario: An embedded backslash authority is refused before transport
    Given the embedded event source declares "\\127.0.0.1:9\collect.json" for subject "company:msft"
    When the production route validates the embedded configuration
    Then it reaches the existing "C025-CONFIG-SCHEMA" route-level refusal before any route-owned or off-origin request
    And both result surfaces and the subject identity are suppressed
    And reading readiness and unavailable coverage remain "not-established"
    And the fixed safe refusal is exposed as one atomic alert without the rejected payload
    And every non-empty live-region content update is counted without deduplication and the count is exactly one
    And document.body remains the exact active element

  Scenario: A served valid-subject and path mismatch becomes a terminal refusal
    Given the validated embedded registry has produced the cache-first first paint
    And the subject input has focus
    And the served configuration pairs "company:msft" with "data/company-intelligence/company-aapl/events.json"
    When the held served configuration is released over the real origin
    Then the route reaches the existing terminal "C025-CONFIG-SCHEMA" refusal
    And the registry source remains "embedded"
    And both result surfaces and the subject identity are suppressed
    And reading readiness and unavailable coverage remain "not-established"
    And no corpus or event continuation starts from the served or embedded declaration
    And the subject input retains focus
    And every non-empty live-region content update is counted without deduplication and the count is exactly one
    And no retry, fallback, or later settled repaint occurs
```

  ### UI Scenario Matrix

  | Scenario | Preconditions | Steps | User-visible and accessibility result | Test Type |
  | --- | --- | --- | --- | --- |
  | `SCN-BUG-025-006` canonical event identity | Unmodified route, module, config, and committed MSFT event document on a real ephemeral origin | Open MSFT; wait for established settlement; inspect the visible financial-events row and complete request ledger | Route remains composed; financial events are loaded; the exact canonical path occurs once; no other event path or off-origin request occurs | `e2e-ui` |
  | `SCN-BUG-025-007` embedded backslash authority | Route response changes only the embedded event path to `\\127.0.0.1:9\collect.json`; committed config and data stay unchanged | Open the route; observe initial validation, route state, alert semantics, exact active-element identity, and browser/server request ledgers | Existing safe `C025-CONFIG-SCHEMA` alert is atomic; every non-empty live-region content update is counted without deduplication and totals one; result and identity surfaces are hidden; readiness stays not-established; payload is absent; `document.activeElement === document.body`; no route-owned or off-origin request occurs | `e2e-ui` |
  | `SCN-BUG-025-008` served subject/path mismatch | Valid embedded first paint; held served response; subject input focused | Observe first paint; release a valid v2 served object pairing MSFT with the AAPL event path; observe state, retained input focus, every non-empty live-region content update, and the request ledger | Existing safe terminal refusal replaces result presentation; registry source stays embedded; readiness stays not-established; every non-empty live-region content update is counted without deduplication and totals one; input focus remains; no event/corpus continuation, retry, fallback, or later repaint occurs | `e2e-ui` |

### Implementation Plan

1. Preserve the current production route, module, committed configuration, event data, persistent tests, product note, user validation, generic scenario runner, and sibling maps. This audit rework changes planning metadata and proof fidelity only.
2. Align the existing `SCN-BUG-025-006` entry in `scripts/scenario-break-map-bug025.json` with the exact current `readEventSource()` canonical-subject predicate while preserving its current linked title.
  - Include exactly the eight existing scenario ids.
  - Cite each unchanged manifest-linked test identity.
  - For `SCN-BUG-025-006`, replace the unique current `if (subjectMatch === null) {` predicate with `if (subjectMatch === null || entry.subjectId === "company:msft") {` so the negative control rejects the accepted canonical subject before `eventsPathFor()` lookup.
  - Apply one exact source break whose `find` occurs once for each scenario.
  - Declare each precise negative control, claim, and implementation reference.
  - Keep `scripts/scenario-receipts.mjs` and every sibling break map byte-protected.
  - Route persistent carrier changes and every RED/GREEN mutation execution to `bubbles.test`.
  - Run `node scripts/scenario-receipts.mjs --spec specs/_bugs/BUG-025-company-corpus-read-never-settles --map scripts/scenario-break-map-bug025.json --all --quiet-child`.
  - Do not change scenarios, linked titles, source carriers, the generic runner, or the DoD count to obtain `COMPLETE`.
3. Route non-terminal certification mirror reconciliation to `bubbles.validate`. It must remove Scope 1 from `certification.completedScopes` and record Scope 1 as `in_progress` with twelve checked and three unchecked rows. Planning does not edit `certification.*`.
4. Strengthen the existing `SCN-BUG-025-007` and `SCN-BUG-025-008` browser carrier through `bubbles.test`: assert exact `document.body` identity for embedded refusal; count every non-empty live-region content update without deduplication; add one bounded focus-theft mutation that focuses `#subject-input` and fails only the exact body-focus assertion; and add one bounded duplicate-announcement mutation that repeats the non-empty alert write and fails only the update-count assertion.
5. Require `bubbles.test` to execute isolated RED and unmodified GREEN runs for the canonical-subject, focus-theft, and duplicate-announcement controls, then run the unchanged scenario resolver and broader regression carriers. Planning does not execute these mutations.
6. Require `bubbles.implement` to refresh row 15 boundary and delta evidence after the packet and map changes, including byte protection for production, persistent tests, user validation, the generic runner, and sibling maps.
7. Require `bubbles.validate` to obtain command-bound current-revision reconciliation evidence, re-adjudicate rows 9 through 11 and row 15, and keep both status mirrors `in_progress` unless every strengthened obligation is earned.
8. Require `bubbles.audit` to read the complete scope, certification mirrors, and claim chronology and independently recheck all seven findings. This planning run does not certify the packet.

### Owner-Gated Delivery Order

1. `bubbles.plan`: reconcile the existing scope and scenario contracts without changing the eight-scenario, Test Plan, or fifteen-row DoD inventories.
2. `bubbles.validate`: remove Scope 1 from the completed-scope mirror and reconcile non-terminal scope progress to twelve checked and three unchecked rows before repository selftest is treated as current packet evidence.
3. `bubbles.test`: strengthen the persistent focus and alert-update carriers, then execute isolated RED and unmodified GREEN runs for the focus-theft, duplicate-announcement, and canonical-subject controls.
4. `bubbles.implement`: refresh current boundary and delta evidence after the packet, map, and persistent carrier changes without editing production or tests.
5. `bubbles.validate`: obtain command-bound current-revision metadata evidence and re-adjudicate rows 9 through 11 and row 15 without certifying a terminal state.
6. `bubbles.audit`: perform the full scope, certification, and claim-chronology read and independently recheck all seven findings.

### Implementation Files

- Production: `rlcompanyintel.js`, `company-intelligence-lab.html` outside the protected embedded configuration object bytes.
- Tests: `tests/company-intelligence.unit.mjs`, `tests/company-intelligence-lab.spec.mjs`, `scripts/selftest.mjs`.
- Test infrastructure: planning reconciles only the existing `SCN-BUG-025-006` metadata in `scripts/scenario-break-map-bug025.json`; `bubbles.test` owns all execution through the unchanged `scripts/scenario-receipts.mjs` contract.
- Product documentation: `notes/company-intelligence-lab.md`.
- Packet: `scopes.md`, `scenario-manifest.json`, owner-attributed `report.md` evidence, and owner-attributed `state.json` execution or routing history.
- Protected and excluded paths are closed by the packet-level Change Boundary above; no other file family is authorized.

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- |
| Unit regression | `unit` | `tests/company-intelligence.unit.mjs` | Validate required positive `readBoundMs`, reject absent or invalid values, and carry the validated value. | `timeout 240 node --test tests/company-intelligence.unit.mjs` | No |
| Scenario-specific Regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | A never-answering corpus request aborts and reaches settled unavailable state. | `timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list` | Yes |
| Scenario-specific Regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | A response released inside the bound loads normally and first paint remains immediate. | `timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list` | Yes |
| Scenario-specific Regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers` loads the production route, injects a synchronous selected-path `fetch` setup throw, requires zero server requests for that path, observes the existing visible unavailable caller outcome, and proves helper timer cleanup. | `timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list` | Yes |
| Scenario-specific Regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `Regression: BUG-025 late valid completion cannot overwrite a newer settled subject` uses two valid subject intents over the real ephemeral origin, holds the first subject's selected real response, settles the second subject, releases the first response, and proves the visible subject, corpus/readiness attributes, horizon account, and ordinary published tool read remain exclusively the second subject's state with no stale repaint or publication. | `timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list` | Yes |
| Security adversarial unit regression | `unit` | `tests/company-intelligence.unit.mjs` | `SCN-BUG-025-006`, `SCN-BUG-025-007`, and `SCN-BUG-025-008`: `BUG-025 security event declaration matrix rejects every non-canonical pair without rejecting the canonical pair` imports production code; keeps the exact MSFT pair green; rejects the complete subject, destination, decoration, correspondence, arbitrary-file, and duplicate matrix with exact `C025-CONFIG-SCHEMA`; proves reconstructed frozen output; rejects URL/decoder/normalizer mechanisms; and runs a one-replacement in-memory equality-guard mutant that at least one named invalid probe kills. | `timeout 240 node --test tests/company-intelligence.unit.mjs` | No |
| Security canonical Regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-025-006`: `Regression: BUG-025 canonical company event path is requested once and exclusively` drives the unmodified production route over the real ephemeral origin, proves composed established MSFT output, observes the exact canonical event path once, observes zero other event paths and off-origin requests, proves the committed event row loaded rather than falling back to unavailable, and kills an exact one-replacement `readEventSource()` mutation that rejects `company:msft` in the canonical subject predicate before event-path lookup. | `timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025 canonical company event path is requested once and exclusively" --reporter=list` | Yes |
| Security embedded-refusal Regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-025-007`: `Regression: BUG-025 embedded backslash authority refuses before transport` serves only an ephemeral route-byte mutation over the real origin; proves validation precedes `run()` and `readConfig()`; observes zero route-owned, invalid-path, and off-origin requests; asserts refusal, fixed safe atomic alert, hidden identity/results, not-established readiness, payload non-disclosure, exact `document.activeElement === document.body`, and exactly one non-empty live-region content update counted without deduplication; kills the exact equality-guard mutant; kills a bounded `#subject-input` focus-theft mutant only through the exact body-focus assertion; and kills a bounded duplicate-announcement mutant only through the update-count assertion. | `timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025 embedded backslash authority refuses before transport" --reporter=list` | Yes |
| Security served-refusal Regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-025-008`: `Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft` observes embedded first paint, focuses the subject input, releases the held mismatched served candidate, and proves terminal existing refusal, embedded registry source, hidden settled surfaces, exactly one non-empty live-region content update counted without deduplication, retained focus, zero event/corpus continuation, zero retry/fallback/later repaint, a duplicate-announcement mutant killed only by the update-count assertion, and a one-replacement route-suppression mutant killed only by named visibility or readiness discriminators. | `timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft" --reporter=list` | Yes |
| Security contract regression | `functional` | `scripts/selftest.mjs` | `SCN-BUG-025-006`, `SCN-BUG-025-007`, and `SCN-BUG-025-008`: preserve exact canonical derivation, duplicate refusal, committed-to-embedded object parity, and the absence of URL parsing, decoding, normalization, another request authority, config-byte drift, or protected-surface drift. This row runs only after `bubbles.validate` reconciles the new unchecked certification mirror. | `timeout 1200 node scripts/selftest.mjs` | No |
| Served-configuration scenario and broader E2E regression | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-025-003`: `Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles` proves the served configuration response never answers case retains validated embedded state and continues bounded reconciliation; the same complete-file run preserves every existing Company Intelligence browser journey. | `timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Repository regression | `functional` | `scripts/selftest.mjs` | Preserve build-free repository invariants. | `timeout 1200 node scripts/selftest.mjs` | No |

#### Existing Scenario-State Closure Mechanism

This mechanism closes the already-required `BUG-025-VALIDATE-SCENARIO-STATE-001` finding for the eight Test Plan scenarios above. It adds no scenario, Test Plan row, business requirement, linked test title, or DoD item.

- Planning owns this reconciliation of the existing BUG-025 map metadata. `bubbles.test` owns persistent carrier changes and every map or mutation execution. Planning does not execute the map.
- The map's entry ids must equal the eight existing ids in `scenario-manifest.json`.
- Do not omit or add an entry. Do not use `vacuous` as a substitute.
- Each entry must use the existing linked test identity byte-for-byte.
- Each entry must name one `breakFile` and one exact `edits` replacement.
- The replacement's `find` must occur exactly once in that source.
- Each entry must carry a behavior-specific `control`, the scenario `claim`, and the owning production `implementationRefs`. The `SCN-BUG-025-006` negative control must mutate the unique current canonical-subject predicate inside `readEventSource()`, not `eventsPathFor()` lookup.
- The precise negative control must fail because the named behavior was broken.
- An empty selection or unrelated failure does not earn a RED receipt. Neither does a timeout, crash, or page or server failure.
- Execute the unchanged runner with `node scripts/scenario-receipts.mjs --spec specs/_bugs/BUG-025-company-corpus-read-never-settles --map scripts/scenario-break-map-bug025.json --all --quiet-child` under the repository's explicit timeout discipline.
- Closure requires `COMPLETE` for all eight scenarios at the current revision.
- Emit a distinct live receipt when the existing manifest traits require live proof.
- Any non-`COMPLETE` outcome keeps the finding open. This includes `SURVIVED`, `UNMAPPED`, `TEST_NOT_LINKED`, `SNIPPET_NOT_UNIQUE`, and `TEST_SELECTION_EMPTY`.
- The shared tree must remain byte-stable for the whole run.
- Keep the generic runner, source and test carriers, manifest titles, and links unchanged.
- Keep all fifteen DoD rows. Rows 9 through 11 remain unchecked until the strengthened canonical-subject, exact-focus, and non-deduplicated alert-update controls execute successfully. Keep user validation and validate-owned certification fields unchanged.

### Definition of Done

- [x] The configuration declares one positive read bound with rationale, and invalid or absent values fail loud. → Evidence: [current validate execution receipts](report.md#current-validate-execution-receipts) and [row 1 individual DoD adjudication](report.md#fifteen-row-individual-dod-adjudication)
- [x] Every route-owned fetch receives an abort signal governed by that bound. → Evidence: [current validate execution receipts](report.md#current-validate-execution-receipts) and [row 2 individual DoD adjudication](report.md#fifteen-row-individual-dod-adjudication)
- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass; `SCN-BUG-025-003` proves the served configuration response never answers case preserves embedded first paint, retains the validated embedded registry after bound expiry, and continues through bounded corpus reconciliation with no retry. → Evidence: [current validate execution receipts](report.md#current-validate-execution-receipts) and [row 3 individual DoD adjudication](report.md#fifteen-row-individual-dod-adjudication)
- [x] `SCN-BUG-025-001`: A same-origin corpus response never answers, so the underlying request aborts at the declared bound and the current reading reaches established unavailable state. → Evidence: [current validate execution receipts](report.md#current-validate-execution-receipts) and [row 4 individual DoD adjudication](report.md#fifteen-row-individual-dod-adjudication)
- [x] `SCN-BUG-025-002`: A slow response answers inside the bound, loads normally without timeout classification, and first paint remains network-independent. → Evidence: [current validate execution receipts](report.md#current-validate-execution-receipts) and [row 5 individual DoD adjudication](report.md#fifteen-row-individual-dod-adjudication)
- [x] `SCN-BUG-025-004`: Synchronous request setup fails before a usable promise exists; the regression proves the existing unavailable caller classification, zero proceeded network requests for that path, and zero active bounded-read timers. → Evidence: [current validate execution receipts](report.md#current-validate-execution-receipts) and [row 6 individual DoD adjudication](report.md#fifteen-row-individual-dod-adjudication)
- [x] `SCN-BUG-025-005`: A late valid response cannot overwrite a newer settled subject; the overlapping-valid-intents regression proves it cannot repaint, republish, alter readiness, change the current subject, replace any horizon account, or overwrite the ordinary tool read. → Evidence: [current validate execution receipts](report.md#current-validate-execution-receipts) and [row 7 individual DoD adjudication](report.md#fifteen-row-individual-dod-adjudication)
- [x] The security adversarial unit regression passes for `SCN-BUG-025-006` through `SCN-BUG-025-008`: the exact canonical MSFT pair stays accepted, every named invalid subject/path/duplicate class throws exact `C025-CONFIG-SCHEMA`, returned event rows are reconstructed and frozen, forbidden URL/normalization mechanisms are absent, and the exact equality-guard mutation is killed by a named invalid probe. → Evidence: [current validate execution receipts](report.md#current-validate-execution-receipts) and [row 8 individual DoD adjudication](report.md#fifteen-row-individual-dod-adjudication)
- [x] `SCN-BUG-025-006`: An accepted canonical company subject authorizes only its canonical event document; the browser regression proves the exact MSFT event path is requested once, no other event path or off-origin request occurs, the route is not refused, the committed event row loads without unavailable fallback, and an exact canonical-subject predicate mutation inside `readEventSource()` kills the control before event-path lookup. → Evidence: [current validate audit-rework adjudication](report.md#current-repository-and-runner-boundary)
- [x] `SCN-BUG-025-007`: An embedded backslash authority is refused before transport; the browser regression proves exact `C025-CONFIG-SCHEMA`, zero route-owned/invalid-path/off-origin requests, hidden result and identity surfaces, not-established readiness, fixed safe atomic alert semantics without payload disclosure, exactly one non-empty live-region content update counted without deduplication, exact `document.activeElement === document.body`, a killed equality-guard mutation, a focus-theft mutant killed only by the body-focus assertion, and a duplicate-announcement mutant killed only by the update-count assertion. → Evidence: [current validate audit-rework adjudication](report.md#current-repository-and-runner-boundary)
- [x] `SCN-BUG-025-008`: A served valid-subject and path mismatch becomes a terminal refusal; the browser regression proves embedded first paint followed by exact `C025-CONFIG-SCHEMA`, unchanged embedded registry source, hidden settled surfaces, not-established readiness, exactly one non-empty live-region content update counted without deduplication, retained input focus, zero corpus/event continuation, zero retry/fallback/later repaint, a duplicate-announcement mutant killed only by the update-count assertion, and a killed route-suppression mutation. → Evidence: [current validate audit-rework adjudication](report.md#current-repository-and-runner-boundary)
- [x] The security contract regression in `scripts/selftest.mjs` passes after validate-owned certification-mirror reconciliation and proves canonical derivation, duplicate refusal, protected config-object parity, forbidden-mechanism absence, and zero protected-surface drift for `SCN-BUG-025-006` through `SCN-BUG-025-008`. → Evidence: [current validate execution receipts](report.md#current-validate-execution-receipts) and [row 12 individual DoD adjudication](report.md#fifteen-row-individual-dod-adjudication)
- [x] Broader E2E regression suite passes. → Evidence: [current validate execution receipts](report.md#current-validate-execution-receipts) and [row 13 individual DoD adjudication](report.md#fifteen-row-individual-dod-adjudication)
- [x] Unit and repository regression suites pass with zero failures. → Evidence: [current validate execution receipts](report.md#current-validate-execution-receipts) and [row 14 individual DoD adjudication](report.md#fifteen-row-individual-dod-adjudication)
- [x] Change Boundary is respected and zero excluded file families were changed. → Evidence: [current validate execution receipts](report.md#current-validate-execution-receipts) and [row 15 individual DoD adjudication](report.md#fifteen-row-individual-dod-adjudication)
