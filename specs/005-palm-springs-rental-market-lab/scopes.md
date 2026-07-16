# Scopes: Palm Springs Rental Market Lab

Planning authority: [spec.md](spec.md) and [design.md](design.md). Execution evidence belongs in [report.md](report.md), and human acceptance is tracked in [uservalidation.md](uservalidation.md).

This is a five-scope, single-file, sequential plan for the active `full-delivery` workflow. Scope 1 is `In Progress` from the retained partial foundation and evidence; Scopes 2 through 5 remain `Not Started`. This reconciliation adds no implementation, research, test execution, or validation evidence.

## Execution Outline

### Phase Order

1. **Scope 1 - Contract, deterministic model, and source-locked browser foundation:** add the exact local Playwright toolchain, versioned config, page-local pure production contracts, immutable rental and financing equations, focused validators, labeled adversarial fixtures, and extracted-function selftests.
2. **Scope 2 - Researched payload and manual review contract:** perform real six-category online research, author the initial source-qualified payload and graph, add the runbook and manual prompt, prove no-auto-commit review behavior, and validate the proposal.
3. **Scope 3 - Complete decision and audit page:** finish the self-contained route over one validated view model with thesis-first Simple, complete Power, controls, truth states, safe rendering, source dialog, responsive accessibility, synchronous charts, and strict owner read.
4. **Scope 4 - Additive registration and consumer integration:** add exact feature-owned hunks to registries and documentation, preserve Market Brief as a normalized owner-read consumer, and prove consumer parity and rollback boundaries.
5. **Scope 5 - Regression and governance hardening:** execute the complete Node, validator, static-page, Playwright, consumer, and Bubbles planning/delivery validation matrix and close every finding without crossing the declared change boundary.

Scope 1 is the capability foundation. Scopes 2 through 5 are overlays or consuming outcomes and depend on Scope 1. Sequential gating is stricter than the dependency minimum: Scope N may start only after every earlier scope is `Done` with current evidence.

### New Types And Signatures

- `PalmSpringsResearchConfig/v1` in `palm-springs-rental-market.config.json`.
- `PalmSpringsResearchPayload/v1` in `palm-springs-rental-market.payload.json`.
- `ResearchGraph/v1`, `UserAssumptionSet/v1`, `PalmSpringsRentalResult/v1`, `PalmSpringsViewModel/v1`, `PalmSpringsRefreshReview/v1`, and `PalmSpringsToolRead/v1` as page-local data contracts.
- `validateResearchConfig(value) -> {ok, errors}`.
- `indexResearchConfig(config) -> immutable indexes`.
- `validateResearchPayload(payload, configIndex) -> {ok, errors}`.
- `validateChangeAccounting(payload, priorPayload, graph) -> {ok, errors}`.
- `buildResearchGraph(payload, configIndex) -> indexed graph`.
- `classifyTruthState(config, payload, nowIso) -> current | stale | structured error`.
- `normalizeUserAssumptions(candidate, config, payload) -> complete assumptions | errors`.
- `computeAdjustedOccupancy(base, demandDelta, supplyDelta) -> finite ratio | structured error`.
- `computeMonthlyPayment(principal, annualRate, termYears) -> finite payment | structured error`.
- `computeRentalModel(config, scenario, assumptions) -> {ok, result, errors}`.
- `buildPalmSpringsViewModel(input) -> immutable shared render model`.
- `stableModelDigest(viewModel) -> stable identity string`.
- `buildPalmSpringsToolRead(viewModel, computedAt) -> rl-tool-read/v1 envelope`.
- Same-origin read contract: `GET ./palm-springs-rental-market.config.json`, then `GET ./palm-springs-rental-market.payload.json` only after valid config.
- Closed test transport: `?fixture=current|invalid|failed-source|missing-config&clock=<ISO>`.

### Validation Checkpoints

- **After Scope 1:** the structural source-lock validator, lockfile-strict provisioning, exact local runner-version check, focused `system-chrome` launch, extracted production helpers, exact equation cases, adversarial contract fixtures, real missing-config/invalid-payload HTTP states, and the focused validator's explicit fixture-input run all pass before the production payload exists or researched content is authored.
- **After Scope 2:** actual research execution is separately evidenced; production payload, source/claim/conflict/change graph, prompt, and runbook pass the focused validator and browser consumption checks while the proposal remains uncommitted.
- **After Scope 3:** the complete page passes inline-script/ID validation and scenario-specific static-server browser regressions for truth, no-fetch recompute, economics, provenance, classifications, responsive parity, focus, chart/table parity, and owner-read omission.
- **After Scope 4:** registry order, navigation, documentation, strict owner-read consumption, and Market Brief coverage pass independent canaries without modifying Market Brief research or equations.
- **After Scope 5:** the complete focused and broad validation set, artifact freshness/lint, G094, Test Plan/DoD parity, traceability, framework write guard, and repository readiness all pass before any terminal status request.

## Planning Assumptions And Impact

- Impacted surfaces: static HTML, checked-in JSON contracts, Node validator, pure helper selftests, Playwright E2E, manual prompt/runbook, registries, documentation indexes, and Market Brief owner-read coverage.
- No database, server API, authentication, application build, runtime package, lint, format, typecheck, scheduler, browser scraper, proxy, release train, or distributed observability workflow is introduced. The exact local Playwright dev dependency is test provisioning, not an application build or deployed runtime dependency.
- `.github/bubbles-project.yaml` declares neither `testImpact` nor `traceContracts`; no impact-plan or observability rows are applicable.
- The implementation must preserve unrelated dirty work. Every shared-file edit starts with a path-scoped diff, uses an additive feature-owned hunk, and has an exact hunk-level rollback.
- Test fixture values are explicitly labeled `TEST FIXTURE`. They validate production transformations, rejection, rendering, and state transitions; they are never evidence that the real market performed as the fixture says.

## Scope Summary

| # | Scope | Surfaces | Primary Tests | DoD Summary | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Contract, deterministic model, and source-locked browser foundation | Dev-only Playwright toolchain, HTML foundation, config, validators, fixtures, selftest | Source-lock/provisioning checks, extracted production functions, validator rejection cases, real static-server contract/model regressions | Locked runner, versions, bounds, equations, errors, fixtures, and protected selftest hunk complete | In Progress |
| 2 | Researched payload and manual review contract | Payload, runbook, prompt, validator/selftest additions, browser receipt | Real research evidence, focused validator, graph/change tests, current/baseline/failed-source browser regressions | Six categories, truthful classifications, source rights, change accounting, no-auto-commit review complete | Not Started |
| 3 | Complete decision and audit page | HTML, focused Playwright, feature fixtures | Inline script/ID check, view-model selftests, eight scenario-specific browser regressions | Complete Simple/Power/accessibility/safety/model/owner-read vertical slice | Not Started |
| 4 | Additive registration and consumer integration | tools.json, index.html, rlnav.js, README, notes index, Market Brief payload, canaries | Registry selftest, Palm Springs validator, Brief validator, registration/consumer E2E | Synchronized consumers, zero duplicated research, exact rollback | Not Started |
| 5 | Regression and governance hardening | Feature implementation/tests plus plan/evidence validation | Full selftest, validators, inline/ID check, full/focused Playwright, anti-interception, governance | Complete matrix and finding closure within boundary | Not Started |

## Stable Scenario Contract Map

All changed behaviors receive a persistent `Regression:` E2E title in `tests/palm-springs-rental-market-lab.spec.mjs`. BS-001 also requires actual online-research execution evidence; its browser test proves consumption and truth state, not that research occurred.

| Business Scenario | Stable ID | Owning Scope | Exact Persistent E2E Title |
| --- | --- | --- | --- |
| BS-001 | SCN-005-001 | Scope 2 | `Regression: SCN-005-001 researched payload exposes six truthful categories and no fixture authority` |
| BS-002 | SCN-005-002 | Scope 1 | `Regression: SCN-005-002 missing configuration blocks payload fetch and every output` |
| BS-003 | SCN-005-003 | Scope 3 | `Regression: SCN-005-003 stale research stays stale in Simple Power and owner read` |
| BS-004 | SCN-005-004 | Scope 1 | `Regression: SCN-005-004 invalid payload produces errors and no conclusion` |
| BS-005 | SCN-005-005 | Scope 3 | `Regression: SCN-005-005 levers recompute synchronously with zero post-boot requests` |
| BS-006 | SCN-005-006 | Scope 1 | `Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator` |
| BS-007 | SCN-005-007 | Scope 3 | `Regression: SCN-005-007 incompatible occupancy definitions remain separate and unaggregated` |
| BS-008 | SCN-005-008 | Scope 1 | `Regression: SCN-005-008 buyer economics use standard amortization in one result` |
| BS-009 | SCN-005-009 | Scope 1 | `Regression: SCN-005-009 zero-rate financing stays finite` |
| BS-010 | SCN-005-010 | Scope 3 | `Regression: SCN-005-010 negative cash flow remains signed and explicit everywhere` |
| BS-011 | SCN-005-011 | Scope 3 | `Regression: SCN-005-011 desktop mobile Simple Power decisions stay identical` |
| BS-012 | SCN-005-012 | Scope 3 | `Regression: SCN-005-012 source inspector resolves provenance and restores exact focus` |
| BS-013 | SCN-005-013 | Scope 2 | `Regression: SCN-005-013 compared refresh accounts for every material entity` |
| BS-014 | SCN-005-014 | Scope 2 | `Regression: SCN-005-014 baseline refresh invents no prior change` |
| BS-015 | SCN-005-015 | Scope 2 | `Regression: SCN-005-015 inaccessible research remains unknown without a value` |
| BS-016 | SCN-005-016 | Scope 3 | `Regression: SCN-005-016 observed forecast inference and modeled outputs stay distinct` |
| BS-017 | SCN-005-017 | Scope 3 | `Regression: SCN-005-017 legal and active supply remain separate from scenario assumptions` |
| BS-018 | SCN-005-018 | Scope 4 | `Regression: SCN-005-018 registered owner read preserves current stale unavailable and omissions` |
| Complete protected matrix | SCN-005-019 | Scope 5 | `Regression: SCN-005-019 complete Palm Springs protected matrix remains executable` |

## Repository Command Registry

The repository has no build, lint, format, typecheck, or project CLI command. Do not invent one.

### PSRM-SELFTEST

```bash
node scripts/selftest.mjs
```

### PSRM-VALIDATOR

```bash
node scripts/validate-palm-springs-rental-market.mjs
```

### PSRM-VALIDATOR-FIXTURE

```bash
node scripts/validate-palm-springs-rental-market.mjs tests/fixtures/palm-springs-rental-market/current.payload.json tests/fixtures/palm-springs-rental-market/config.json
```

Scope 1 uses `PSRM-VALIDATOR-FIXTURE` because the default production payload is not authored until Scope 2. Scope 2 and every later production checkpoint use `PSRM-VALIDATOR`.

### PSRM-PAGE-INLINE-ID

```bash
PAGE=palm-springs-rental-market-lab.html node -e 'const fs=require("node:fs");const p=process.env.PAGE;if(!p)throw new Error("PAGE is required");const h=fs.readFileSync(p,"utf8");const scripts=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());if(!scripts.length)throw new Error("no inline script: "+p);scripts.forEach((s,i)=>{try{new Function(s)}catch(e){throw new Error("inline script "+(i+1)+": "+e.message)}});const ids=new Set([...h.matchAll(/\bid=["\x27]([^"\x27]+)["\x27]/g)].map(m=>m[1]));const refs=scripts.flatMap(s=>[...s.matchAll(/getElementById\(\s*["\x27]([^"\x27]+)["\x27]\s*\)/g)].map(m=>m[1]));const missing=[...new Set(refs.filter(id=>!ids.has(id)))];if(missing.length)throw new Error("missing ids: "+missing.join(", "));console.log("OK page="+p+" inline="+scripts.length+" refs="+refs.length)'
```

### PSRM-SOURCE-LOCK

```bash
node scripts/validate-node-source-lock.mjs
```

### PSRM-PROVISION

```bash
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts
```

### PSRM-RUNNER-VERSION

```bash
npx --no-install playwright --version
```

The runner-version output must be exactly `Version 1.61.1`. Missing local installation, version drift, unavailable system Chrome, registry drift, integrity drift, or source-lock drift fails loud. No cache, global, sibling-repository, Python, downloaded-browser, or absolute executable-path fallback may satisfy a browser row.

### PSRM-E2E-FULL

```bash
npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

### PSRM-BRIEF-VALIDATOR

```bash
node scripts/validate-brief-payload.mjs
```

### PSRM-AUTHENTICITY-SCAN

```bash
grep -nE 'page\.route|context\.route|route\(|fulfill\(|test\.(skip|only)|return;.*(login|missing|unavailable)' tests/palm-springs-rental-market-lab.spec.mjs
```

This command passes only when it prints zero matches and exits with the expected no-match status after explicit review; the execution evidence must record that expected result truthfully.

Every focused browser row uses this exact command shape with the exact title from the scenario map:

```bash
npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-NNN exact title" --reporter=list
```

The Playwright file owns a real ephemeral `127.0.0.1` static server, reads checked-in files over HTTP, and closes the server. It contains no `page.route`, `context.route`, response fulfillment/replacement, service worker, internal mock, or silent-pass return. Request observation may use `page.on("request")` only.

---

## Scope 1: Contract, Deterministic Model, And Source-Locked Browser Foundation

**Status:** In Progress

**Tags:** `foundation:true`

**Depends On:** None

**Primary Outcome:** A versioned, fail-loud, page-local production foundation validates config and payload candidates, executes immutable equations, exposes truthful contract/model states over HTTP, and is exercised through extracted production functions, labeled adversarial fixtures, and one exact source-locked local Playwright runner using system Chrome. It contains no browser research client, hardcoded payload narrative, application build, or runtime package dependency.

### Gherkin Scenarios - Scope 1

#### SCN-005-002 / BS-002 - Missing configuration blocks the product

```gherkin
Scenario: SCN-005-002 Missing configuration blocks the product
Given the real static server returns HTTP 404 for the closed missing-config fixture path
When the production boot sequence resolves and validates configuration
Then the visible truth band says INVALID CONFIGURATION and names PSRM-CONFIG-FETCH
And the browser makes no payload request and renders no thesis scenario value model output or numeric owner metric
```

#### SCN-005-004 / BS-004 - Invalid payload produces no conclusion

```gherkin
Scenario: SCN-005-004 Invalid payload produces no conclusion
Given fixture configuration is valid and the checked-in invalid payload has a dangling source reference and missing required category
When the extracted production validator and the production page process it
Then PSRM-PAYLOAD-REF and PSRM-PAYLOAD-CATEGORY are visible
And no thesis projection deterministic result or numeric owner metric is produced
```

#### SCN-005-006 / BS-006 - Occupancy equation clamps and guards its denominator

```gherkin
Scenario: SCN-005-006 Occupancy equation clamps and guards its denominator
Given base occupancy is 0.40 demand delta is 0.10 and supply delta is 0.25
When the extracted production computeAdjustedOccupancy function runs
Then the result equals clamp(0.40 * 1.10 / 1.25, 0, 1)
And a separate invalid denominator returns PSRM-MODEL-OCCUPANCY-DENOMINATOR with no numeric result
```

#### SCN-005-008 / BS-008 - Standard amortizing buyer economics

```gherkin
Scenario: SCN-005-008 Standard amortizing buyer economics
Given positive bound-valid purchase leverage annual-rate and loan-term inputs
When the extracted production computeRentalModel function runs
Then monthly payment uses the standard amortizing equation
And annual debt service gross yield operating expense and pre-tax cash flow are fields of the same unrounded deterministic result
```

#### SCN-005-009 / BS-009 - Zero-rate financing remains finite

```gherkin
Scenario: SCN-005-009 Zero-rate financing remains finite
Given positive principal zero annual mortgage rate and a positive integer payment count
When the extracted production computeMonthlyPayment function runs
Then monthly payment equals principal divided by payments
And annual debt service and pre-tax cash flow remain finite
```

### Implementation Plan - Scope 1

1. Add `package.json`, `package-lock.json`, `.npmrc`, `playwright.config.mjs`, and `scripts/validate-node-source-lock.mjs` exactly as designed: private dev-only exact `playwright` `1.61.1`, lockfile v3, one canonical npm registry, integrity-pinned external entries, lifecycle scripts disabled, and one `system-chrome` project using `channel: "chrome"` with no executable path or browser fallback.
2. Run `node scripts/validate-node-source-lock.mjs`, then provision only with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts`, then require `npx --no-install playwright --version` to print `Version 1.61.1` before any browser evidence command. Dependency provisioning is not an application build and must not transform the Pages artifact.
3. Add `palm-springs-rental-market.config.json` with the exact closed schemas, versions, six categories, enums, source policies, catalogs, bounds, formats, scenario catalog, and explicit Simple initial mode from `design.md`.
4. Add the initial `palm-springs-rental-market-lab.html` production foundation with static shell/truth/model receipt, closed contract-path resolver, top-level ES5-compatible pure validator/index/graph/model/view-model/tool-read functions, and no payload prose or market-value substitute.
5. Enforce config-before-payload sequencing, fail-loud error vocabulary, fixture truth band, disabled fixture persistence/publication, safe path resolution, and explicit clock injection.
6. Implement exact finite-input guards, full-precision market equations, linked leverage/down-payment relationship, positive-rate amortization, zero-rate branch, expense, negative cash flow, and owner-read omission semantics.
7. Add `scripts/validate-palm-springs-rental-market.mjs` using the balanced-brace extractor against production HTML; validate the explicit fixture config/payload pair plus checked-in rejection fixtures with path-specific `PSRM-*` errors. Keep the default production-input run for Scope 2, after the researched production payload exists.
8. Add test-only `tests/fixtures/palm-springs-rental-market/config.json`, `current.payload.json`, and `invalid.payload.json`; visibly label fixture mode and never cite these records as online research evidence.
9. Add the focused Playwright file and a Palm Springs group in `scripts/selftest.mjs`; every assertion executes extracted production functions or the real HTTP page and validates produced output, not echoed setup text. Every browser command uses the committed config, `system-chrome` project, list reporter, and an exact title grep when focused.

### Change Boundary And Shared Infrastructure Impact Sweep - Scope 1

**Allowed new files:** `package.json`, `package-lock.json`, `.npmrc`, `playwright.config.mjs`, `scripts/validate-node-source-lock.mjs`, `palm-springs-rental-market-lab.html`, `palm-springs-rental-market.config.json`, `scripts/validate-palm-springs-rental-market.mjs`, `tests/palm-springs-rental-market-lab.spec.mjs`, and `tests/fixtures/palm-springs-rental-market/{config.json,current.payload.json,invalid.payload.json}`.

**Allowed shared edit:** one additive Palm Springs extraction/assertion group in `scripts/selftest.mjs` after a path-scoped pre-edit check with `git --no-pager diff -- scripts/selftest.mjs`.

**Protected contracts:** selftest group discovery, balanced-brace extraction, existing assertion totals/reporting, and every existing tool's pure-helper tests. The independent canary is the complete pre-existing `node scripts/selftest.mjs` run, not the new Palm Springs group alone.

**Explicitly excluded:** `rldata.js`, `rlapp.js`, `rlbrief.js`, `rlchart.js`, `rlg.js`, `rlnav.js`, `rlticker.js`, `market-brief.html`, `market-brief.config.json`, `market-brief.payload.json`, `scripts/brief-refresh.mjs`, application/runtime dependency manifests, workflows, registries, README files, and all unrelated tests. No dependency other than exact dev-only `playwright` `1.61.1` may enter the Scope 1 package graph.

**Rollback:** remove only the new Scope 1 files, including the five source-locked browser-toolchain files, and the exact Palm Springs selftest group through IDE edits; preserve every pre-existing byte and unrelated dirty hunk in `scripts/selftest.mjs`.

### Test Plan - Scope 1

| ID | Type | Category | File / Location | Exact Behavior | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | Unit | unit | `scripts/selftest.mjs` Palm Springs group | Extract and execute production validators/equations across bounds, non-finite inputs, clamp, amortization, zero rate, negative result, stable digest, and owner-read omission | `node scripts/selftest.mjs` | No |
| TP-01-02 | Contract | functional | `scripts/validate-palm-springs-rental-market.mjs` | Execute production validators against the explicit fixture config/current payload and invalid fixtures, and assert exact accepted/rejected `PSRM-*` paths before a production payload exists | Exact `PSRM-VALIDATOR-FIXTURE` command | No |
| TP-01-08 | Source-lock contract | functional | `scripts/validate-node-source-lock.mjs` | Structurally require the exact private manifest, single-source `.npmrc`, lockfile v3, exact Playwright graph, trusted registry URLs, integrity hashes, disabled lifecycle scripts, and zero git/file/path/alternate-source entries | `node scripts/validate-node-source-lock.mjs` | No |
| TP-01-09 | Dependency provisioning | functional | `package-lock.json` | Install only the committed lock graph with browser download and lifecycle scripts disabled; fail on lockfile or registry drift without building or transforming the Pages application | `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts` | No |
| TP-01-10 | Runner identity | functional | `package.json` and local `node_modules` | Prove `npx --no-install` resolves the checkout-local Playwright CLI and prints exactly `Version 1.61.1` before any browser scenario executes | `npx --no-install playwright --version` | No |
| TP-01-03 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-002 missing configuration blocks payload fetch and every output`; assert visible invalid state, exact code, no payload request, no substitute UI | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-002 missing configuration blocks payload fetch and every output" --reporter=list` | Yes |
| TP-01-04 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-004 invalid payload produces errors and no conclusion`; assert visible exact errors and absent thesis/model/numeric publication | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-004 invalid payload produces errors and no conclusion" --reporter=list` | Yes |
| TP-01-05 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator`; assert computed visible value then explicit unavailable result | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator" --reporter=list` | Yes |
| TP-01-06 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-008 buyer economics use standard amortization in one result`; assert visible known calculation/decomposition from production model | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-008 buyer economics use standard amortization in one result" --reporter=list` | Yes |
| TP-01-07 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-009 zero-rate financing stays finite`; assert finite debt and cash-flow output plus zero-rate explanation | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-009 zero-rate financing stays finite" --reporter=list` | Yes |

### Definition of Done - Scope 1

Core Delivery Items:

- [x] The exact config contract, page-local pure foundation, contract sequencing, immutable equations, error vocabulary, fixture posture, and strict omission behavior are implemented without embedded research values or a browser research path.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `node scripts/validate-palm-springs-rental-market.mjs`
> **Exit Code:** 0
> **Output:**
>
> ```text
> [psrm-validator] production functions extracted=22
> [psrm-validator] input-mode=scope1-fixture-explicitly-labeled
> [psrm-validator] config=tests/fixtures/palm-springs-rental-market/config.json
> [psrm-validator] payload=tests/fixtures/palm-springs-rental-market/current.payload.json
> [psrm-validator] production-config=PASS
> [psrm-validator] selected-config=PASS
> [psrm-validator] selected-payload=PASS
> [psrm-validator] invalid-payload=REJECTED
> [psrm-validator] invalid-codes=PSRM-PAYLOAD-CATEGORY,PSRM-PAYLOAD-REF,PSRM-PAYLOAD-SCENARIO
> [psrm-validator] occupancy-equation=PASS value=0.35200000000000004
> [psrm-validator] occupancy-denominator=REJECTED code=PSRM-MODEL-OCCUPANCY-DENOMINATOR
> [psrm-validator] amortization=PASS monthly=2398.2021006110276
> [psrm-validator] zero-rate=PASS monthly=1111.111111111111
> [psrm-validator] owner-read-omission=PASS
> [psrm-validator] fixture-path-contract=PASS
> [psrm-validator] OK
> ```
>
- [x] Every test file and fixture is explicitly test-owned; all fixture-facing UI says `TEST FIXTURE`, persistence/publication is disabled, and no fixture value is cited as real market evidence.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `node -e '<fixture-posture assertions>'`
> **Exit Code:** 0
> **Output:**
>
> ```text
> PSRM_FIXTURE_POSTURE_BEGIN
> visibleFixtureBand=PASS
> publicationDisabledText=PASS
> runtimePublicationFalse=PASS
> noPutToolReadCall=PASS
> fixtureModelDisclaimer=PASS
> configLabeled=PASS
> currentPayloadLabeled=PASS
> invalidPayloadLabeled=PASS
> currentEducationalOnly=PASS
> invalidNeverEvidence=PASS
> fixtureFileCount=3
> ownerReadPublication=DISABLED
> PSRM_FIXTURE_POSTURE_END
> ```
>
- [x] The `scripts/selftest.mjs` change is one additive group, preserves existing groups/reporting, passes the independent full-file canary, and has an exact hunk-level rollback.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `node -e '<selftest-hunk assertions>'` and `node scripts/selftest.mjs`
> **Exit Code:** 0 and 0
> **Output:**
>
> ```text
> PSRM_SELFTEST_HUNK_BEGIN
> groupMarkerCount=PASS
> sourceDeclarationCount=PASS
> beforeSummary=PASS
> usesExtractor=PASS
> usesProductionConfig=PASS
> usesInvalidFixture=PASS
> testsOccupancy=PASS
> testsAmortization=PASS
> testsOwnerReadOmission=PASS
> preservesSummary=PASS
> featureOwnedGroups=1
> rollbackAnchor=Feature 005 marker through group catch
> PSRM_SELFTEST_HUNK_END
> Research-Lab self-test: 376 passed, 0 failed
> ```
>
- [ ] Scope 1 stays within its declared allowed and excluded path inventory: current path-scoped status/diff hunk evidence, exact Feature 005 identifier/reference scans, and execution-history/tool evidence must attribute every current Scope 1 change; absence of the Feature 005 identifier alone is not proof that a path was unedited, pre-existing dirty excluded files remain explicitly uncertain where no clean byte baseline exists, and any unexplained excluded-path change or overlapping hunk remains `route_required` unless evidence attributes it to a prior owner.

> **Uncertainty Declaration**
> **Phase:** plan
> **Claim Source:** not-run
> **What was attempted:** The planner reconciled the containment criterion to evidence available after work has begun; no pre-invocation hashes or clean byte baseline exists for already-dirty excluded paths.
> **What was observed:** The Change Boundary declares allowed new files, the sole allowed shared edit, and excluded surfaces; current containment can be evaluated from path-scoped status/diffs, exact Feature 005 identifier/reference scans, and execution-history/tool evidence.
> **Why this is uncertain:** Those sources can attribute visible current hunks but cannot prove that pre-existing dirty bytes were never touched and restored. A missing Feature 005 identifier is only a negative reference signal, not proof that no edit occurred.
> **What would resolve this:** `bubbles.audit` must attribute every current allowed- and excluded-path hunk to this round or a prior owner using command/tool evidence; any unexplained excluded-path change or overlap with a dirty excluded file remains `route_required`.

- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass through the exact SCN-005-002, SCN-005-004, SCN-005-006, SCN-005-008, and SCN-005-009 rows below.

> **Phase:** implement
> **Claim Source:** executed
> **Command (TP-01-03):** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-002 missing configuration blocks payload fetch and every output" --reporter=list`
> **Command (TP-01-04):** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-004 invalid payload produces errors and no conclusion" --reporter=list`
> **Command (TP-01-05):** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator" --reporter=list`
> **Command (TP-01-06):** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-008 buyer economics use standard amortization in one result" --reporter=list`
> **Command (TP-01-07):** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-009 zero-rate financing stays finite" --reporter=list`
> **Exit Code:** 0 for each of five commands
> **Evidence Refs:** [SCN-005-002](report.md#scenario-scn-005-002), [SCN-005-004](report.md#scenario-scn-005-004), [SCN-005-006](report.md#scenario-scn-005-006), [SCN-005-008](report.md#scenario-scn-005-008), [SCN-005-009](report.md#scenario-scn-005-009)
> **Output:**
>
> ```text
> TP-01-03-07_CURRENT_MATRIX_BEGIN
> TP-01-03_MATRIX_BEGIN
>
> Running 1 test using 1 worker
>
>   ✓  1 …-002 missing configuration blocks payload fetch and every output (689ms)
> [SCN-005-002] truth=INVALID CONFIGURATION
> [SCN-005-002] code=PSRM-CONFIG-FETCH
> [SCN-005-002] configRequests=1
> [SCN-005-002] payloadRequests=0
> [SCN-005-002] ownerReadPublished=false
> [SCN-005-002] substituteOutputs=0
>
>   1 passed (1.9s)
> TP-01-03_EXIT=0
> TP-01-03_MATRIX_END
> TP-01-04_MATRIX_BEGIN
>
> Running 1 test using 1 worker
>
>   ✓  1 …n: SCN-005-004 invalid payload produces errors and no conclusion (369ms)
> [SCN-005-004] truth=INVALID PAYLOAD
> [SCN-005-004] code=PSRM-PAYLOAD-REF
> [SCN-005-004] code=PSRM-PAYLOAD-CATEGORY
> [SCN-005-004] payloadAccepted=false
> [SCN-005-004] modelVisible=false
> [SCN-005-004] ownerReadPublished=false
>
>   1 passed (1.2s)
> TP-01-04_EXIT=0
> TP-01-04_MATRIX_END
> TP-01-05_MATRIX_BEGIN
>
> Running 1 test using 1 worker
>
>   ✓  1 …006 occupancy equation clamps and rejects an invalid denominator (332ms)
> [SCN-005-006] base=0.40
> [SCN-005-006] demandDelta=0.10
> [SCN-005-006] supplyDelta=0.25
> [SCN-005-006] adjustedOccupancy=0.35200000000000004
> [SCN-005-006] expected=0.35200000000000004
> [SCN-005-006] invalidCode=PSRM-MODEL-OCCUPANCY-DENOMINATOR
> [SCN-005-006] invalidNumeric=false
>
>   1 passed (940ms)
> TP-01-05_EXIT=0
> TP-01-05_MATRIX_END
> TP-01-06_MATRIX_BEGIN
>
> Running 1 test using 1 worker
>
>   ✓  1 …-005-008 buyer economics use standard amortization in one result (365ms)
> [SCN-005-008] branch=amortizing
> [SCN-005-008] principal=400000
> [SCN-005-008] monthlyPaymentUsd=2398.2021006110276
> [SCN-005-008] annualDebtServiceUsd=28778.42520733233
> [SCN-005-008] grossYield=0.10278400000000001
> [SCN-005-008] operatingExpenseUsd=17987.2
> [SCN-005-008] preTaxCashFlowUsd=4626.374792667673
>
>   1 passed (1.2s)
> TP-01-06_EXIT=0
> TP-01-06_MATRIX_END
> TP-01-07_MATRIX_BEGIN
>
> Running 1 test using 1 worker
>
>   ✓  1 …131:1 › Regression: SCN-005-009 zero-rate financing stays finite (305ms)
> [SCN-005-009] branch=zero-rate
> [SCN-005-009] principal=400000
> [SCN-005-009] payments=360
> [SCN-005-009] monthlyPaymentUsd=1111.111111111111
> [SCN-005-009] annualDebtServiceUsd=13333.333333333332
> [SCN-005-009] preTaxCashFlowUsd=20071.46666666667
> [SCN-005-009] finite=true
>
>   1 passed (1.0s)
> TP-01-07_EXIT=0
> TP-01-07_MATRIX_END
> matrixResult=PASS
> TP-01-03-07_CURRENT_MATRIX_END
> ```
>
> **Result:** PASS - all five exact focused commands completed in order after TP-01-10 and emitted their scenario receipts.
>
- [x] Broader E2E regression suite passes through the exact `PSRM-E2E-FULL` command after the focused Scope 1 rows pass.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
> **Exit Code:** 0
> **Evidence Ref:** [PSRM-E2E-FULL](report.md#psrm-e2e-full---complete-scope-1-browser-suite)
> **Output:**
>
> ```text
> Running 5 tests using 1 worker
>   ✓ Regression: SCN-005-002 missing configuration blocks payload fetch and every output
>   ✓ Regression: SCN-005-004 invalid payload produces errors and no conclusion
>   ✓ Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator
>   ✓ Regression: SCN-005-008 buyer economics use standard amortization in one result
>   ✓ Regression: SCN-005-009 zero-rate financing stays finite
> [SCN-005-002] payloadRequests=0
> [SCN-005-004] ownerReadPublished=false
> [SCN-005-006] invalidCode=PSRM-MODEL-OCCUPANCY-DENOMINATOR
> [SCN-005-008] branch=amortizing
> [SCN-005-009] branch=zero-rate
> [SCN-005-009] finite=true
>   5 passed (4.7s)
> ```
>

Test Evidence Items - Exact ID Parity With 10 Test Plan Rows:

- [x] TP-01-01 unit evidence shows extracted production validators/model helpers pass their exact invariant and boundary assertions.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `node scripts/selftest.mjs`
> **Exit Code:** 0
> **Output:**
>
> ```text
> Feature 005 Palm Springs contract and deterministic model foundation
>   ✓ Palm Springs extracted config validator accepts the exact labeled fixture contract
>   ✓ Palm Springs extracted payload validator accepts all six required fixture categories
>   ✓ Palm Springs payload validator rejects dangling sources and missing categories with exact codes
>   ✓ Palm Springs occupancy applies the exact demand-over-supply equation
>   ✓ Palm Springs occupancy clamps a finite result to one
>   ✓ Palm Springs occupancy rejects a non-positive denominator without a numeric result
>   ✓ Palm Springs occupancy rejects non-finite inputs
>   ✓ Palm Springs positive-rate payment uses standard amortization
>   ✓ Palm Springs zero-rate payment divides principal by the payment count
>   ✓ Palm Springs payment rejects a non-positive loan term
>   ✓ Palm Springs rental model returns one coherent unrounded amortizing decomposition
>   ✓ Palm Springs zero-rate rental model keeps debt service and cash flow finite
>   ✓ Palm Springs rental model preserves a signed negative pre-tax cash flow
>   ✓ Palm Springs stable digest is identical for equal inputs and changes with a model assumption
>   ✓ Palm Springs unavailable owner read omits invalid numeric metrics
>   ✓ Palm Springs graph builds bidirectional claim and source indexes
>   ✓ Palm Springs closed fixture resolver selects the checked-in current payload
>   ✓ Palm Springs closed fixture resolver rejects unknown fixture ids
>
> ================================================
> Research-Lab self-test: 376 passed, 0 failed
> ================================================
> ```
>
- [x] TP-01-02 functional evidence shows the focused validator accepts valid contracts and rejects every adversarial fixture with exact codes.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `node scripts/validate-palm-springs-rental-market.mjs tests/fixtures/palm-springs-rental-market/current.payload.json tests/fixtures/palm-springs-rental-market/config.json`
> **Exit Code:** 0
> **Output:**
>
> ```text
> [psrm-validator] production functions extracted=22
> [psrm-validator] input-mode=explicit
> [psrm-validator] config=tests/fixtures/palm-springs-rental-market/config.json
> [psrm-validator] payload=tests/fixtures/palm-springs-rental-market/current.payload.json
> [psrm-validator] production-config=PASS
> [psrm-validator] selected-config=PASS
> [psrm-validator] selected-payload=PASS
> [psrm-validator] invalid-payload=REJECTED
> [psrm-validator] invalid-codes=PSRM-PAYLOAD-CATEGORY,PSRM-PAYLOAD-REF,PSRM-PAYLOAD-SCENARIO
> [psrm-validator] occupancy-equation=PASS value=0.35200000000000004
> [psrm-validator] occupancy-denominator=REJECTED code=PSRM-MODEL-OCCUPANCY-DENOMINATOR
> [psrm-validator] amortization=PASS monthly=2398.2021006110276
> [psrm-validator] zero-rate=PASS monthly=1111.111111111111
> [psrm-validator] owner-read-omission=PASS
> [psrm-validator] fixture-path-contract=PASS
> [psrm-validator] OK
> ```
>
- [x] TP-01-08 source-lock evidence shows the structural validator accepts exactly `package.json`, `package-lock.json`, and `.npmrc` under the single trusted npm source contract and rejects every forbidden source/drift class.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `node scripts/validate-node-source-lock.mjs`
> **Exit Code:** 0
> **Evidence Ref:** [TP-01-08 RED and GREEN](report.md#tp-01-08---source-lock-red-and-green)
> **Output:**
>
> ```text
> [node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
> [node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
> [node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
> [node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
> [node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
> [node-source-lock] adversarial=manifest-range result=REJECTED code=MANIFEST-PLAYWRIGHT
> [node-source-lock] adversarial=scoped-registry result=REJECTED code=NPMRC-SCOPED-REGISTRY
> [node-source-lock] adversarial=lifecycle-relaxation result=REJECTED code=NPMRC-IGNORE-SCRIPTS
> [node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
> [node-source-lock] adversarial=missing-integrity result=REJECTED code=LOCK-INTEGRITY
> [node-source-lock] adversarial=git-source result=REJECTED code=LOCK-SOURCE
> [node-source-lock] adversarial=file-source result=REJECTED code=LOCK-SOURCE
> [node-source-lock] adversarial=path-source result=REJECTED code=LOCK-SOURCE
> [node-source-lock] adversarial=http-source result=REJECTED code=LOCK-SOURCE
> [node-source-lock] actual=PASS
> [node-source-lock] OK adversarial=16 unexpectedAcceptances=0
> ```
>

- [x] TP-01-09 provisioning evidence shows `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts` installs only the lockfile graph without lifecycle scripts, browser downloads, an application build, or Pages artifact transformation.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts`
> **Exit Code:** 0
> **Evidence Ref:** [TP-01-09 provisioning](report.md#tp-01-09---lockfile-strict-provisioning)
> **Output:**
>
> ```text
> TP-01-09_CURRENT_PROVISIONING_BEGIN
>
> added 3 packages, and audited 4 packages in 539ms
>
> found 0 vulnerabilities
> manifestPrivate=PASS
> runtimeDependencies=PASS
> devPlaywrightVersion=PASS
> lockfileVersion=PASS
> lockExternalPackages=PASS
> singleRegistry=PASS
> ignoreScripts=PASS
> installedPlaywrightVersion=PASS
> literalExit=0
> assertionExit=0
> manifestBytesUnchanged=PASS
> lockBytesUnchanged=PASS
> applicationPageBytesUnchanged=PASS
> applicationConfigBytesUnchanged=PASS
> browserDownloadPolicy=PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
> lifecyclePolicy=--ignore-scripts
> provisioningResult=PASS
> TP-01-09_CURRENT_PROVISIONING_END
> ```
>
> **Result:** PASS - the literal command succeeded, the committed graph and policy matched, and application/config bytes remained unchanged.
>

- [x] TP-01-10 runner-identity evidence shows the checkout-local no-install CLI reports exactly `Version 1.61.1` before browser discovery.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `npx --no-install playwright --version`
> **Locality Assertion:** `node -e 'const fs=require("fs"),path=require("path");const packageEntry=require.resolve("playwright");const packageDir=path.dirname(packageEntry);const cli=path.join(packageDir,"cli.js");const relative=path.relative(process.cwd(),cli);const version=JSON.parse(fs.readFileSync(path.join(packageDir,"package.json"),"utf8")).version;const bin="node_modules/.bin/playwright";const checks=[["localCliCheckoutResolution",relative==="node_modules/playwright/cli.js"],["localPackageVersionMatch",version==="1.61.1"],["localBinExists",fs.existsSync(bin)],["localBinTargetsCheckout",fs.existsSync(bin)&&fs.realpathSync(bin)===fs.realpathSync(cli)]];console.log(`localCliRelative=${relative}`);console.log(`localPackageVersion=${version}`);for(const [name,pass] of checks)console.log(`${name}=${pass?"PASS":"FAIL"}`);process.exit(checks.every((entry)=>entry[1])?0:1);'`
> **No-Fallback Assertion:** after creating empty temporary prefix/cache directories, `npm_config_prefix="$prefix_dir" npm_config_cache="$cache_dir" npm_config_offline=true npm_config_update_notifier=false npx --no-install playwright --version`
> **Exit Code:** 0
> **Evidence Ref:** [TP-01-10 runner identity](report.md#tp-01-10---checkout-local-runner-identity)
> **Output:**
>
> ```text
> TP-01-10_CURRENT_RUNNER_IDENTITY_BEGIN
> localCliRelative=node_modules/playwright/cli.js
> localPackageVersion=1.61.1
> localCliCheckoutResolution=PASS
> localPackageVersionMatch=PASS
> localBinExists=PASS
> localBinTargetsCheckout=PASS
> literalCommand=npx --no-install playwright --version
> Version 1.61.1
> assertionExit=0
> literalExit=0
> observedExactVersion=PASS
> isolationPrefix=EMPTY_TEMPORARY
> isolationCache=EMPTY_TEMPORARY
> isolationNetwork=OFFLINE
> isolationInstallPolicy=NO_INSTALL
> Version 1.61.1
> isolationExit=0
> globalPrefixFallback=ABSENT
> runnerIdentityResult=PASS
> TP-01-10_CURRENT_RUNNER_IDENTITY_END
> ```
>
> **Result:** PASS - the literal command reported the exact package version from the checkout-local CLI/bin and also passed with no install, offline mode, an empty cache, and an empty global prefix.
>

- [x] TP-01-03 E2E evidence shows SCN-005-002 fails closed on a real missing config response with no payload read or substitute output.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-002 missing configuration blocks payload fetch and every output" --reporter=list`
> **Exit Code:** 0
> **Evidence Ref:** [SCN-005-002 raw output](report.md#scenario-scn-005-002)
> **Output:**
>
> ```text
> TP-01-03_CURRENT_FOCUSED_BEGIN
>
> Running 1 test using 1 worker
>
>   ✓  1 …-002 missing configuration blocks payload fetch and every output (425ms)
> [SCN-005-002] truth=INVALID CONFIGURATION
> [SCN-005-002] code=PSRM-CONFIG-FETCH
> [SCN-005-002] configRequests=1
> [SCN-005-002] payloadRequests=0
> [SCN-005-002] ownerReadPublished=false
> [SCN-005-002] substituteOutputs=0
>
>   1 passed (1.8s)
> literalExit=0
> TP-01-03_RESULT=PASS
> TP-01-03_CURRENT_FOCUSED_END
> ```
>
> **Result:** PASS - the exact focused command failed closed with one config request, zero payload requests, no owner read, and no substitute output.
>

- [x] TP-01-04 E2E evidence shows SCN-005-004 rejects an invalid same-origin payload and produces no conclusion or numeric publication.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-004 invalid payload produces errors and no conclusion" --reporter=list`
> **Exit Code:** 0
> **Evidence Ref:** [SCN-005-004 raw output](report.md#scenario-scn-005-004)
> **Output:**
>
> ```text
> TP-01-04_CURRENT_FOCUSED_BEGIN
>
> Running 1 test using 1 worker
>
>   ✓  1 …n: SCN-005-004 invalid payload produces errors and no conclusion (285ms)
> [SCN-005-004] truth=INVALID PAYLOAD
> [SCN-005-004] code=PSRM-PAYLOAD-REF
> [SCN-005-004] code=PSRM-PAYLOAD-CATEGORY
> [SCN-005-004] payloadAccepted=false
> [SCN-005-004] modelVisible=false
> [SCN-005-004] ownerReadPublished=false
>
>   1 passed (1.1s)
> literalExit=0
> TP-01-04_RESULT=PASS
> TP-01-04_CURRENT_FOCUSED_END
> ```
>
> **Result:** PASS - the exact focused command rejected the invalid payload and published neither the model nor the owner read.
>

- [x] TP-01-05 E2E evidence shows SCN-005-006 computes the exact occupancy result and exposes denominator failure as unavailable.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** Exact TP-01-05 command from the Test Plan
> **Exit Code:** 0
> **Evidence Ref:** [SCN-005-006 raw output](report.md#scenario-scn-005-006)
> **Output:**
>
> ```text
> Running 1 test using 1 worker
>   ✓ Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator (1.4s)
> [SCN-005-006] base=0.40
> [SCN-005-006] demandDelta=0.10
> [SCN-005-006] supplyDelta=0.25
> [SCN-005-006] adjustedOccupancy=0.35200000000000004
> [SCN-005-006] expected=0.35200000000000004
> [SCN-005-006] invalidCode=PSRM-MODEL-OCCUPANCY-DENOMINATOR
> [SCN-005-006] invalidNumeric=false
>   1 passed (3.2s)
> ```
>

- [x] TP-01-06 E2E evidence shows SCN-005-008 uses standard amortization and one coherent deterministic decomposition.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** Exact TP-01-06 command from the Test Plan
> **Exit Code:** 0
> **Evidence Ref:** [SCN-005-008 raw output](report.md#scenario-scn-005-008)
> **Output:**
>
> ```text
> Running 1 test using 1 worker
>   ✓ Regression: SCN-005-008 buyer economics use standard amortization in one result (762ms)
> [SCN-005-008] branch=amortizing
> [SCN-005-008] principal=400000
> [SCN-005-008] monthlyPaymentUsd=2398.2021006110276
> [SCN-005-008] annualDebtServiceUsd=28778.42520733233
> [SCN-005-008] grossYield=0.10278400000000001
> [SCN-005-008] operatingExpenseUsd=17987.2
> [SCN-005-008] preTaxCashFlowUsd=4626.374792667673
>   1 passed (2.8s)
> ```
>

- [x] TP-01-07 E2E evidence shows SCN-005-009 uses the finite zero-rate branch.

> **Phase:** implement
> **Claim Source:** executed
> **Command:** Exact TP-01-07 command from the Test Plan
> **Exit Code:** 0
> **Evidence Ref:** [SCN-005-009 raw output](report.md#scenario-scn-005-009)
> **Output:**
>
> ```text
> Running 1 test using 1 worker
>   ✓ Regression: SCN-005-009 zero-rate financing stays finite (1.6s)
> [SCN-005-009] branch=zero-rate
> [SCN-005-009] principal=400000
> [SCN-005-009] payments=360
> [SCN-005-009] monthlyPaymentUsd=1111.111111111111
> [SCN-005-009] annualDebtServiceUsd=13333.333333333332
> [SCN-005-009] preTaxCashFlowUsd=20071.46666666667
> [SCN-005-009] finite=true
>   1 passed (5.7s)
> ```
>

Build Quality Gate:

- [ ] Path-scoped diff checks, skip/silent-pass review, fixture-label review, editor diagnostics, artifact lint/freshness, G094, Test Plan/DoD parity, and scenario traceability pass; `report.md` contains current raw evidence for each checked item and no fabricated implementation claim.

> **Uncertainty Declaration**
> **Phase:** implement
> **Claim Source:** executed
> **Passing checks:** source lock, provisioning, runner identity, all focused/full browser tests, selftest, fixture validator, page integrity, authenticity, regression quality, path-scoped diff review, editor diagnostics, artifact lint/freshness, G094, exact 38-row parity, traceability, framework write guard, doctor, and repository readiness.
> **Blocking checks:** the implementation-reality scan still resolves zero scope files, falls back to 24 design files, and reports five pre-existing excluded `rldata.js` findings; the state-transition parser still truncates `.spec.mjs` paths; the stronger untouched-byte claim lacks audit evidence; and three protected files remain owned by `bubbles.devops`.
> **Required resolution:** `bubbles.devops` owns `.github/workflows/pages.yml`, `.gitignore`, and `.specify/memory/agents.md`; `bubbles.audit` owns boundary reconciliation; the canonical Bubbles framework owner owns the implementation-discovery and `.mjs` parser findings.

---

## Scope 2: Researched Payload And Manual Review Contract

**Status:** Not Started

**Tags:** `overlay:true`, `research:true`

**Depends On:** Scope 1 - Contract, Deterministic Model, And Source-Locked Browser Foundation

**Sequential Gate:** Scope 1 must be `Done` before Scope 2 starts.

**Primary Outcome:** A real initial six-category payload is authored from current online research, truthfully distinguishes observation/forecast/inference, preserves source rights and definition conflicts, records baseline or prior comparison exactly, validates through production code, and remains uncommitted for human review.

### Gherkin Scenarios - Scope 2

#### SCN-005-001 / BS-001 - Sourced online research

```gherkin
Scenario: SCN-005-001 Sourced online research
Given valid config and a clean payload-owned path for one manual refresh
When the research agent performs current online research across all six configured categories
Then every category has eligible evidence from this invocation or an explicit unknown with attempted-source context
And every material claim resolves to an allowed source role before validator acceptance
And the valid proposal remains uncommitted for review
```

#### SCN-005-013 / BS-013 - Compared refresh accounts for every material entity

```gherkin
Scenario: SCN-005-013 Compared refresh accounts for every material entity
Given a valid compared test payload names the immediately prior valid payload identity
When extracted production change validation and the real page process it
Then every material entity in the prior/current union has exactly one allowed change record
And every scenario or acquisition revision has a reason and eligible evidence source
```

#### SCN-005-014 / BS-014 - Baseline invents no change history

```gherkin
Scenario: SCN-005-014 Baseline invents no change history
Given the initial researched payload has no prior valid predecessor
When payload validation and the Change Ledger process baseline mode
Then prior identity fields are null and change records are empty
And no prior-relative improvement deterioration acceleration or reversal claim appears
```

#### SCN-005-015 / BS-015 - Failed source remains explicit unknown

```gherkin
Scenario: SCN-005-015 Failed source remains explicit unknown
Given one required source in the labeled failed-source fixture is inaccessible
When production validation and the real page process that category
Then the source remains an unverified attempt with no persisted numeric value
And the category remains unknown with attempted-source context
And the source cannot support a thesis metric or forecast
```

### Research Execution Contract - Not A Test Substitute

- The implementing research agent must use real online tools in the implementation session for current performance, legal supply/regulation, travel/air access, macro/financing, hotel competition/events, and weather/seasonality.
- Each researched value must preserve publisher URL, retrieval and observation clocks, geography, population, method, source quality, access/rights, limitations, and classification.
- User-supplied July 14 context is acceptance context only. It becomes observed data only when current eligible sources support the exact scope and definition; otherwise it is revised, classified as forecast/inference, or recorded unresolved.
- The initial payload must include complete source/claim/metric/conflict/method/series/scenario/acquisition/legal/driver graphs and a baseline `ChangeSet` with no invented predecessor.
- A validator pass proves contract conformance, not that research happened. Real online tool records and the path-scoped uncommitted payload diff are separate required evidence.
- The agent may change only `palm-springs-rental-market.payload.json` during a refresh run. It never stages, commits, pushes, deploys, or changes formulas/config/page/prompt/runbook/validator/registries.

### Implementation Plan - Scope 2

1. Perform the manual online research under the six-category, primary-source, rights, and no-fabrication policy; account for inaccessible/gated sources explicitly.
2. Add `palm-springs-rental-market.payload.json` as the sole current research authority with actual initial evidence and truthful observed/forecast/inference classification.
3. Preserve all incompatible populations, geographies, periods, and definitions in separate observations plus explicit conflicts; do not average paid occupancy with available-night occupancy or legal supply with OTA supply.
4. Add `notes/palm-springs-rental-market-lab.md` as the complete research/method/review contract and `.github/prompts/palm-springs-rental-market-update.prompt.md` as the concise manual entry point.
5. Add `failed-source.payload.json` as a visibly test-only valid unknown case; use the valid fixture set to exercise compared and baseline change behavior without representing test data as market truth.
6. Extend the focused validator and Palm Springs selftest group only inside their feature-owned regions for six-category coverage, rights, citation graph, conflicts, forecasts, baseline/compared changes, prompt/runbook parity, exact validator command, restoration behavior, and no commit/push instruction.
7. Extend the browser suite with visible production/fixture receipts that distinguish real production research from fixtures and prove baseline/compared/unknown rendering without making a research-truth claim from fixture values.

### Change Boundary And Shared Infrastructure Impact Sweep - Scope 2

**Allowed new files:** `palm-springs-rental-market.payload.json`, `notes/palm-springs-rental-market-lab.md`, `.github/prompts/palm-springs-rental-market-update.prompt.md`, and `tests/fixtures/palm-springs-rental-market/failed-source.payload.json`.

**Allowed narrow edits:** feature-owned regions in `scripts/validate-palm-springs-rental-market.mjs`, `tests/palm-springs-rental-market-lab.spec.mjs`, and the Palm Springs group in `scripts/selftest.mjs`.

**Protected contracts:** manual prompt/runbook authority, config/formula immutability, current tracked payload bytes, unreviewed-diff stop, exact-byte restore/delete behavior, and existing selftest groups. Before editing, run path-scoped diffs for the three existing files and the payload path only.

**Explicitly excluded:** all registries, README files, Market Brief files, shared runtime files, scheduler/refresh wrappers, package/workflow files, spec/design/plan artifacts, and all unrelated tests.

**Rollback:** on an invalid research proposal, restore exact prior payload bytes or delete an invalid first payload through the refresh contract; for implementation rollback, delete only the four new Scope 2 files and reverse exact Feature 005 validator/test/selftest hunks.

### Test Plan - Scope 2

| ID | Type | Category | File / Location | Exact Behavior | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | Contract | functional | `scripts/validate-palm-springs-rental-market.mjs` | Execute production validators over the researched payload, all graphs, six categories, rights, baseline/compared change rules, prompt/runbook contract, restore path, and no-commit vocabulary | `node scripts/validate-palm-springs-rental-market.mjs` | No |
| TP-02-02 | Unit | unit | `scripts/selftest.mjs` Palm Springs group | Execute production graph/change/classification/source-rights functions with valid, dangling, cyclic, incompatible, baseline, compared, and inaccessible cases | `node scripts/selftest.mjs` | No |
| TP-02-03 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-001 researched payload exposes six truthful categories and no fixture authority`; assert production truth receipt, category count, classifications, and absence of TEST FIXTURE | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-001 researched payload exposes six truthful categories and no fixture authority" --reporter=list` | Yes |
| TP-02-04 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-013 compared refresh accounts for every material entity`; assert counts/groups and sourced revision detail from a valid compared test fixture | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-013 compared refresh accounts for every material entity" --reporter=list` | Yes |
| TP-02-05 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-014 baseline refresh invents no prior change`; assert baseline wording, null prior identity, zero records, and absence of directional-change wording | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-014 baseline refresh invents no prior change" --reporter=list` | Yes |
| TP-02-06 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-015 inaccessible research remains unknown without a value`; assert attempted-source context, no numeric value, and no eligible support | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-015 inaccessible research remains unknown without a value" --reporter=list` | Yes |

### Definition of Done - Scope 2

Core Delivery Items:

- [ ] Current online research has been executed across all six categories, and every source outcome, claim classification, definition boundary, rights posture, uncertainty, and acceptance-context disposition has current tool-backed evidence.
- [ ] The initial production payload is a complete validated baseline authority with real sources and no invented predecessor, fetch, value, source ID, change, inference, legal conclusion, or formula override.
- [ ] Prompt and runbook define exact config/current/tracked-prior reads, real research, rights reconciliation, validator execution, failed-proposal restore/delete, path-scoped review, and `UNCOMMITTED FOR REVIEW`; neither contains a commit/push/deploy step.
- [ ] The researched payload remains uncommitted at refresh completion, and only the payload path changes during the manual refresh execution.
- [ ] Scope 2 stays within its allowed files; protected prior bytes and all excluded shared surfaces remain unchanged.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass through the exact SCN-005-001, SCN-005-013, SCN-005-014, and SCN-005-015 rows below.
- [ ] Broader E2E regression suite passes through the exact `PSRM-E2E-FULL` command after the focused Scope 2 rows pass.

Test Evidence Items - Exact Parity With 6 Test Plan Rows:

- [ ] TP-02-01 functional evidence shows the focused validator accepts the researched production payload and enforces graph, category, rights, change, prompt, and runbook contracts.
- [ ] TP-02-02 unit evidence shows extracted production source/claim/change functions reject dangling, cyclic, incompatible, fabricated-history, and rights-invalid candidates.
- [ ] TP-02-03 E2E evidence shows SCN-005-001 consumes the production researched payload as a six-category non-fixture read; separate research execution evidence proves the online work.
- [ ] TP-02-04 E2E evidence shows SCN-005-013 renders complete compared change accounting and sourced revisions.
- [ ] TP-02-05 E2E evidence shows SCN-005-014 renders baseline with no prior-relative claim.
- [ ] TP-02-06 E2E evidence shows SCN-005-015 keeps inaccessible research unknown and valueless.

Build Quality Gate:

- [ ] Path-scoped diff checks, research finding accounting, source-rights review, prompt/runbook parity, editor diagnostics, artifact lint/freshness, G094, Test Plan/DoD parity, and scenario traceability pass; current raw research and command evidence is recorded without treating fixtures or validator success as market-truth proof.

---

## Scope 3: Complete Decision And Audit Page

**Status:** Not Started

**Tags:** `overlay:true`, `ui:true`, `runtime-behavior:true`

**Depends On:** Scope 1 - Contract, Deterministic Model, And Source-Locked Browser Foundation; Scope 2 - Researched Payload And Manual Review Contract

**Sequential Gate:** Scopes 1 and 2 must be `Done` before Scope 3 starts.

**Primary Outcome:** The production route becomes the complete self-contained thesis-first Simple and audit-complete Power tool, using one immutable research graph, one validated assumption set, one deterministic result, and one owner-read identity across desktop/mobile and current/stale/unavailable states.

### Gherkin Scenarios - Scope 3

#### SCN-005-003 / BS-003 - Valid stale payload remains visibly stale

```gherkin
Scenario: SCN-005-003 Valid stale payload remains visibly stale
Given checked-in fixture contracts validate and the explicit fixture clock is after staleAfter
When Simple and Power render
Then both show the same STALE word age and configured threshold
And the owner-read preview remains stale
And no visible or accessible text calls the research current or live
```

#### SCN-005-005 / BS-005 - User levers recompute without research fetch

```gherkin
Scenario: SCN-005-005 User levers recompute without research fetch
Given one valid view model rendered from real same-origin fixture reads
When the user changes year scenario demand supply ADR purchase leverage rate and expense controls
Then one production compute emits the new result and digest synchronously
And the thesis payload and research graph digests remain unchanged
And zero requests occur after the initial config and payload reads
```

#### SCN-005-007 / BS-007 - Incompatible definitions remain separate

```gherkin
Scenario: SCN-005-007 Incompatible definitions remain separate
Given paid managed-home occupancy and booked available-night OTA occupancy are both valid observations
When Power and the Source Inspector expose their evidence
Then values definitions geographies populations and periods remain separate
And a DefinitionConflict names the incompatibility and confidence consequence
And no aggregate KPI series row or conversion action exists
```

#### SCN-005-010 / BS-010 - Negative cash flow remains explicit

```gherkin
Scenario: SCN-005-010 Negative cash flow remains explicit
Given gross revenue is lower than operating expense plus annual debt service
When Simple Power and the owner-read receipt render the shared result
Then pre-tax cash flow remains a signed negative number
And NEGATIVE CASH FLOW appears before gross-yield commentary
And no attractive viable or positive acquisition label appears
```

#### SCN-005-011 / BS-011 - Desktop mobile and mode parity

```gherkin
Scenario: SCN-005-011 Desktop mobile and mode parity
Given one valid fixture and one UserAssumptionSet
When the page renders at 1440 by 1000 and 390 by 844 and switches Simple and Power
Then truth thesis confidence scenario outputs and data-model-digest are identical
And there is no body overflow overlap clipped focus or pointer-only control
And synchronous charts are nonblank and match their accessible tables
```

#### SCN-005-012 / BS-012 - Complete claim-to-source trace and focus return

```gherkin
Scenario: SCN-005-012 Complete claim-to-source trace and focus return
Given a displayed material claim has validated supporting source references
When the user opens and closes the native Source Inspector
Then every reference resolves to a complete allowed source record with scope period access rights and limitations
And dynamic text is rendered literally and validated links use safe attributes
And focus returns to the exact invoking element
```

#### SCN-005-016 / BS-016 - Truth classifications stay distinct

```gherkin
Scenario: SCN-005-016 Truth classifications stay distinct
Given claims and series contain observed forecast and inference classifications
When Simple Power chart table and Source Inspector render
Then each item exposes exactly one classification word and a non-color mark
And forecasts resolve a method and inferences resolve observed inputs
And user outputs say MODELED FROM USER ASSUMPTIONS instead of using a research classification
```

#### SCN-005-017 / BS-017 - Legal supply and active supply stay separate

```gherkin
Scenario: SCN-005-017 Legal supply and active supply stay separate
Given the payload contains certificates caps waitlist and OTA active-listing observations
When Power evidence and the Simple supply control render
Then legal facts and marketplace observations use separate rows and metric definitions
And the supply delta is explicitly an agent baseline plus user assumption
And no certificate-to-listing conversion exists
```

### UI Scenario Matrix

| State / Journey | Viewports | User Action | Visible Assertion | Regression IDs |
| --- | --- | --- | --- | --- |
| Automatic first paint | Desktop and mobile | Open production or fixture route | Shell first, config before payload, explicit CURRENT/STALE/UNAVAILABLE state | SCN-005-003, SCN-005-011 |
| Thesis-first Simple | Desktop and mobile | Read without changing controls | Thesis, phase, direction, confidence, support, conflict/unknown, falsifier precede controls | SCN-005-003, SCN-005-011, SCN-005-016 |
| Full assumption workbench | Desktop and mobile | Edit every market/acquisition control and reset | Labels, units, ranges, values, linked leverage/down payment, synchronous one-result update, no request | SCN-005-005, SCN-005-010 |
| Complete Power audit | Desktop and mobile | Switch mode, inspect evidence/conflicts/series/changes/drivers/model/sources | Same decision identity with added detail, accessible contained tables, synchronous charts | SCN-005-007, SCN-005-011, SCN-005-016, SCN-005-017 |
| Native Source Inspector | Desktop and mobile | Open from claim/conflict/source and close/Escape | Complete safe source detail, focus containment, exact focus return | SCN-005-012 |
| Invalid user input | Desktop and mobile | Enter invalid bound/denominator | Typed value retained, adjacent error, dependent results unavailable, thesis unchanged | SCN-005-005 |
| Negative economics | Desktop and mobile | Select assumptions producing negative cash flow | Signed amount and explicit negative wording across Simple/Power/read | SCN-005-010 |

### Implementation Plan - Scope 3

1. Complete semantic shell and automatic first paint using the shared script order and RLAPP receipts, with config-before-payload and exact current/stale/unavailable states.
2. Build one immutable `ResearchGraph`, normalized `UserAssumptionSet`, deterministic result, stable digest, and `PalmSpringsViewModel`; make every renderer data-only and side-effect free except DOM composition.
3. Implement thesis-first Simple in the required order with all market/acquisition controls, linked leverage/down-payment, reset-to-explicit-baseline, exact outputs, exclusions, negative state, source actions, and owner-read receipt.
4. Implement complete Power parity/evidence/conflicts/history/forecast/change/drivers/legal/model/source surfaces without a second model, hidden assumption, fetch, or incompatible aggregate.
5. Render all agent text with text nodes; validate HTTP(S) source links and safe attributes; add no dynamic `innerHTML`, payload selectors, event attributes, styles, or executable narrative.
6. Implement one native dialog with exact opener tracking, focus containment, Escape/Close behavior, safe plain-text detail, and deterministic focus return.
7. Implement synchronous visible-Power chart drawing, canvas sizing, RLCHART attachment, text summary, equivalent table row parity, missing-month gaps, classification marks, resize-only bounded redraw, and no `requestAnimationFrame`.
8. Implement desktop/tablet/mobile layout, 44px mobile actions, no body overflow/overlap, keyboard mode/control/dialog flows, concise live announcements, visible focus, text expansion, reduced motion, and non-color states.
9. Publish one strict production owner read after every render; omit invalid numerics, preserve stale/unavailable/negative caveats, and disable fixture publication/persistence.
10. Extend extracted-function and browser assertions for every new renderer/control/state while preserving the production payload and graph byte identity during local interactions.

### Change Boundary - Scope 3

**Allowed edits:** `palm-springs-rental-market-lab.html`, `tests/palm-springs-rental-market-lab.spec.mjs`, feature fixture JSON only when a scenario contract requires a valid/adversarial representation, `scripts/validate-palm-springs-rental-market.mjs`, and the existing Palm Springs group in `scripts/selftest.mjs`.

**Path-scoped pre-edit checks:** inspect diffs only for those files. Existing Feature 005 work is preserved; shared selftest changes remain inside the named group.

**Explicitly excluded:** every registry/README/Market Brief path reserved for Scope 4, all shared runtime files (`rldata.js`, `rlapp.js`, `rlbrief.js`, `rlchart.js`, `rlg.js`, `rlnav.js`, `rlticker.js`), all other HTML/tools/tests, packages, workflows, and feature spec/design.

**Rollback:** reverse only Scope 3 hunks inside Feature 005 page/tests/validator/selftest region, restoring the validated Scope 2 checkpoint without changing shared runtime or unrelated dirty work.

### Test Plan - Scope 3

| ID | Type | Category | File / Location | Exact Behavior | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | Unit | unit | `scripts/selftest.mjs` Palm Springs group | Execute production view-model/digest/tool-read/render-input helpers for deterministic identity, stale/unavailable omission, safe strings, and repeated output | `node scripts/selftest.mjs` | No |
| TP-03-02 | Contract | functional | `scripts/validate-palm-springs-rental-market.mjs` | Validate production page function extraction, payload/config references, fixture paths, prompt/runbook, and exact owner-read contract | `node scripts/validate-palm-springs-rental-market.mjs` | No |
| TP-03-03 | Static page integrity | functional | `palm-springs-rental-market-lab.html` | Parse every inline script and require every literal `getElementById` target to exist | Exact `PSRM-PAGE-INLINE-ID` command | No |
| TP-03-04 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-003 stale research stays stale in Simple Power and owner read`; assert visible/accessibility state and no current/live wording | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-003 stale research stays stale in Simple Power and owner read" --reporter=list` | Yes |
| TP-03-05 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-005 levers recompute synchronously with zero post-boot requests`; observe requests without interception and assert changed outputs/unchanged research digest | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-005 levers recompute synchronously with zero post-boot requests" --reporter=list` | Yes |
| TP-03-06 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-007 incompatible occupancy definitions remain separate and unaggregated`; assert both values/definitions/conflict and absence of aggregate | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-007 incompatible occupancy definitions remain separate and unaggregated" --reporter=list` | Yes |
| TP-03-07 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-010 negative cash flow remains signed and explicit everywhere`; assert sign/wording/order and no positive acquisition label | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-010 negative cash flow remains signed and explicit everywhere" --reporter=list` | Yes |
| TP-03-08 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-011 desktop mobile Simple Power decisions stay identical`; assert digest/value parity, no overflow/overlap, keyboard operation, nonblank canvas pixels, and table parity | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-011 desktop mobile Simple Power decisions stay identical" --reporter=list` | Yes |
| TP-03-09 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-012 source inspector resolves provenance and restores exact focus`; assert complete detail, safe links/text, modal focus, Escape/Close return | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-012 source inspector resolves provenance and restores exact focus" --reporter=list` | Yes |
| TP-03-10 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-016 observed forecast inference and modeled outputs stay distinct`; assert words/marks/method/input lineage without color dependence | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-016 observed forecast inference and modeled outputs stay distinct" --reporter=list` | Yes |
| TP-03-11 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-017 legal and active supply remain separate from scenario assumptions`; assert distinct metric families and no conversion | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-017 legal and active supply remain separate from scenario assumptions" --reporter=list` | Yes |

### Definition of Done - Scope 3

Core Delivery Items:

- [ ] Automatic first paint, thesis-first Simple, all controls, deterministic outputs, complete Power audit, truthful state family, and strict owner-read receipt are fully implemented over one graph/result identity.
- [ ] Agent text and URLs are safely rendered; no dynamic markup/executable payload path, private-data input, browser research path, or silent fallback exists.
- [ ] Native dialog focus, keyboard mode/control behavior, concise announcements, responsive/mobile layout, no body overflow/overlap, text expansion, non-color states, synchronous charts, and equivalent tables satisfy the exact UI contracts.
- [ ] Fixture mode is visibly test-only and disables storage/publication; production mode reads only same-origin config/payload and publishes one strict owner read.
- [ ] Scope 3 stays within its file boundary, preserves Scope 2 research bytes during user interaction, and leaves every excluded shared file untouched.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass through the exact SCN-005-003, SCN-005-005, SCN-005-007, SCN-005-010, SCN-005-011, SCN-005-012, SCN-005-016, and SCN-005-017 rows below.
- [ ] Broader E2E regression suite passes through the exact `PSRM-E2E-FULL` command after the focused Scope 3 rows pass.

Test Evidence Items - Exact Parity With 11 Test Plan Rows:

- [ ] TP-03-01 unit evidence shows extracted production view-model/digest/tool-read helpers preserve deterministic identity and omission semantics.
- [ ] TP-03-02 functional evidence shows the focused validator accepts the complete production page and contract references.
- [ ] TP-03-03 static-page evidence shows every inline script parses and every literal ID reference resolves.
- [ ] TP-03-04 E2E evidence shows SCN-005-003 remains visibly stale across modes and owner read.
- [ ] TP-03-05 E2E evidence shows SCN-005-005 updates all dependent outputs synchronously with zero post-boot requests and unchanged research.
- [ ] TP-03-06 E2E evidence shows SCN-005-007 preserves incompatible definitions and creates no aggregate.
- [ ] TP-03-07 E2E evidence shows SCN-005-010 preserves signed negative cash flow and never softens it with gross yield.
- [ ] TP-03-08 E2E evidence shows SCN-005-011 has desktop/mobile Simple/Power decision, accessibility, layout, canvas, and table parity.
- [ ] TP-03-09 E2E evidence shows SCN-005-012 provides complete safe provenance and exact focus return.
- [ ] TP-03-10 E2E evidence shows SCN-005-016 keeps research classifications and modeled output distinct without color-only meaning.
- [ ] TP-03-11 E2E evidence shows SCN-005-017 separates legal capacity, observed listings, and explicit supply assumptions.

Build Quality Gate:

- [ ] Page-local change review, safe-render scan, no-fetch/interception scan, storage/privacy review, viewport/canvas checks, editor diagnostics, artifact lint/freshness, G094, Test Plan/DoD parity, and scenario traceability pass with current raw evidence and no implementation claim inferred from planning text.

---

## Scope 4: Additive Registration And Consumer Integration

**Status:** Not Started

**Tags:** `overlay:true`, `consumer-integration:true`

**Depends On:** Scope 1 - Contract, Deterministic Model, And Source-Locked Browser Foundation; Scope 2 - Researched Payload And Manual Review Contract; Scope 3 - Complete Decision And Audit Page

**Sequential Gate:** Scopes 1 through 3 must be `Done` before Scope 4 starts.

**Primary Outcome:** Feature 005 becomes discoverable through synchronized registries and documentation, and Market Brief covers only its normalized state-faithful owner read and deep link without copying Palm Springs research or formulas.

### Gherkin Scenario - Scope 4

#### SCN-005-018 / BS-018 - Registered owner read preserves truth and omissions

```gherkin
Scenario: SCN-005-018 Registered owner read preserves truth and omissions
Given the tool is registered and renders current stale unavailable or invalid-input state
When it publishes its strict owner read and Market Brief consumes registry coverage
Then availability direction confidence selected scenario and the material caveat remain state faithful
And invalid numeric keys are omitted rather than zero null or formatted substitutes
And the consumer deep-links the owning page without reproducing its research or equations
```

### Consumer Impact Sweep

| Consumer / Reference Surface | Required Additive Change | Stale-Reference Proof |
| --- | --- | --- |
| `tools.json` | One live tool record with exact ID/route/data/note/order/tags | Registry selftest identity/order equality |
| `index.html::TOOLS` | Matching entry in the same order and route | Registry selftest plus browser navigation |
| `rlnav.js::TOOLS` | Matching shared-nav entry in identical order | Registry selftest plus route nav assertion |
| `README.md` | One tool row and exact file-layout references | Path/link scan plus repo-readiness |
| `notes/README.md` | One methodology/runbook index entry | Path/link scan plus focused validator |
| `market-brief.payload.json` | One registry-ordered coverage reason pointing to the owner read | Brief validator; no Palm Springs facts/equations copied |
| Browser route/deep link | Exact `palm-springs-rental-market-lab.html#simple` target | E2E opens from index/nav/consumer and lands on owning state |
| Tests and validators | Exact feature ID/path/title references | Selftest, Palm validator, Brief validator, traceability |

No API client, generated client, redirect, breadcrumb framework, or backend route exists in this build-free repository. The listed surfaces are the complete first-party consumer set for this addition.

### Implementation Plan - Scope 4

1. Capture path-scoped pre-edit diffs for `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/README.md`, `market-brief.payload.json`, and `scripts/selftest.mjs` without inspecting or staging unrelated changes.
2. Add the same Feature 005 identity, route, ordering, data reference, note, blurb, and tags to all three registries with minimal local hunks.
3. Add one README tool row/file-layout reference and one notes index row; do not rewrite surrounding sections.
4. Add one Market Brief coverage reason through its existing payload/validator contract. The row may identify owner-read availability, caveat, and deep link only; it must not copy Palm Springs claims, sources, projections, scenarios, or equations.
5. Extend the existing registry selftest and focused browser suite only where Feature 005 assertions are not already generic; prove route discoverability, shared script order, exact owner-read identity, state/omission preservation, and deep-link ownership.
6. Run independent canaries before and after each shared-file hunk; preserve existing registry order and Market Brief validity.

### Shared Infrastructure Impact Sweep And Change Boundary

**High-fan-out surfaces:** three synchronized registries, root README, notes index, selftest registry canary, and Market Brief payload coverage.

**Downstream contracts:** landing-page order, shared navigation order, registered route existence, shared script order, strict `rl-tool-read/v1`, Market Brief coverage completeness, and every pre-existing tool/coverage row.

**Independent canaries:** full `node scripts/selftest.mjs`, `node scripts/validate-brief-payload.mjs`, focused Palm validator, and real index/nav/owner-read browser regression. The new registry entries do not validate themselves in isolation.

**Allowed edits:** exact additive Feature 005 hunks in `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/README.md`, `market-brief.payload.json`, the existing Palm Springs selftest group, and focused Feature 005 tests/validator.

**Explicitly excluded:** `market-brief.html`, `rlbrief.js`, `market-brief.config.json`, `scripts/brief-refresh.mjs`, `rldata.js`, `rlapp.js`, `rlchart.js`, `rlg.js`, `rlticker.js`, every other tool page/note/test, packages, workflows, and feature spec/design.

**Collision rule:** if an intended insertion overlaps unresolved user content, Scope 4 becomes `Blocked`; the hunk is not overwritten, reformatted, reverted, or relocated by a broad rewrite.

**Rollback:** delete only exact Feature 005 registry/docs/coverage/test hunks. Preserve all surrounding dirty content and existing entries. Deleting the registry entries makes the page undiscoverable; no shared data or cache rewrite occurs.

### Test Plan - Scope 4

| ID | Type | Category | File / Location | Exact Behavior | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-04-01 | Registry canary | unit | `scripts/selftest.mjs` | Prove `tools.json == index.html::TOOLS == rlnav.js::TOOLS` in order, all registered routes exist, shared script order is valid, and all existing selftests remain green | `node scripts/selftest.mjs` | No |
| TP-04-02 | Feature/consumer contract | functional | `scripts/validate-palm-springs-rental-market.mjs` | Prove exact Feature 005 IDs/paths/runbook/prompt references and strict owner-read contract remain coherent after registration | `node scripts/validate-palm-springs-rental-market.mjs` | No |
| TP-04-03 | Market Brief canary | functional | `market-brief.payload.json` via existing validator | Prove exactly one registry-ordered Palm Springs coverage reason is valid and contains no duplicated research/equation authority | `node scripts/validate-brief-payload.mjs` | No |
| TP-04-04 | Browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-018 registered owner read preserves current stale unavailable and omissions`; navigate from index/shared nav, assert strict read/omissions/deep link, and verify Market Brief ownership | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-018 registered owner read preserves current stale unavailable and omissions" --reporter=list` | Yes |

### Definition of Done - Scope 4

Core Delivery Items:

- [ ] Registry, landing page, shared navigation, README, notes index, and Market Brief coverage contain synchronized additive Feature 005 entries with exact identity/order/path ownership.
- [ ] Market Brief consumes only the strict owner read and deep link; it contains no duplicated Palm Springs research, source graph, scenarios, model math, or unavailable-value substitute.
- [ ] Path-scoped pre-edit checks, additive hunks, independent canaries, and exact reverse-hunk rollback are documented and preserve all unrelated dirty content.
- [ ] Consumer Impact Sweep is complete; zero stale or mismatched first-party Feature 005 references remain, and every explicitly excluded shared file is untouched.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass through the exact SCN-005-018 row below.
- [ ] Broader E2E regression suite passes through the exact `PSRM-E2E-FULL` command after the focused Scope 4 row passes.

Test Evidence Items - Exact Parity With 4 Test Plan Rows:

- [ ] TP-04-01 unit evidence shows complete registry/order/route/script-order parity and every pre-existing selftest remains green.
- [ ] TP-04-02 functional evidence shows the Palm validator accepts all registered feature contract references.
- [ ] TP-04-03 functional evidence shows the existing Brief validator accepts one owner-read coverage reason with no duplicated domain authority.
- [ ] TP-04-04 E2E evidence shows SCN-005-018 registered owner read preserves current, stale, and unavailable truth states and omissions, and deep-links the owning page without copied research or equations.

Build Quality Gate:

- [ ] Path-scoped dirty-worktree comparison, exact consumer stale-reference scan, editor diagnostics, artifact lint/freshness, G094, Test Plan/DoD parity, scenario traceability, framework write guard, and repository readiness pass with raw evidence; rollback touches only Feature 005 hunks.

---

## Scope 5: Regression And Governance Hardening

**Status:** Not Started

**Tags:** `overlay:true`, `validation-hardening:true`

**Depends On:** Scope 1 - Contract, Deterministic Model, And Source-Locked Browser Foundation; Scope 2 - Researched Payload And Manual Review Contract; Scope 3 - Complete Decision And Audit Page; Scope 4 - Additive Registration And Consumer Integration

**Sequential Gate:** Scopes 1 through 4 must be `Done` before Scope 5 starts.

**Primary Outcome:** The complete protected matrix executes against production functions and the real static page, every finding is accounted for and resolved within the declared boundary, and repository/Bubbles checks establish a current evidence packet without changing delivery status or certification directly.

### Gherkin Scenario - Scope 5

#### SCN-005-019 - Complete protected matrix remains executable

```gherkin
Scenario: SCN-005-019 Complete protected matrix remains executable
Given all Feature 005 implementation and consumer scopes are complete
When the full Node validators static-page check Playwright suite and governance checks execute from the repository root
Then every SCN-005-001 through SCN-005-018 contract has a real non-silent assertion and current evidence
And no live browser test intercepts an internal request or treats fixture values as market-performance proof
And every discovered finding is fixed and the affected checks rerun before completion
```

### Required Regression Coverage Matrix

| Coverage Slice | Exact Persistent Test Title(s) / Proof |
| --- | --- |
| Production current research | `Regression: SCN-005-001 researched payload exposes six truthful categories and no fixture authority` |
| Stale state | `Regression: SCN-005-003 stale research stays stale in Simple Power and owner read` |
| Invalid and missing contracts | SCN-005-002 and SCN-005-004 exact titles |
| No-fetch interactions | SCN-005-005 exact title plus request-event count after boot |
| Occupancy and financing equations | SCN-005-006, SCN-005-008, and SCN-005-009 exact titles plus extracted production selftests |
| Definition conflict and legal/active supply | SCN-005-007 and SCN-005-017 exact titles |
| Negative cash flow | SCN-005-010 exact title |
| Desktop/mobile/mode/chart/table parity | SCN-005-011 exact title at 1440x1000 and 390x844 with canvas pixel and table-row assertions |
| Source dialog and exact focus return | SCN-005-012 exact title |
| Prior comparison and baseline | SCN-005-013 and SCN-005-014 exact titles plus validator graph checks |
| Failed source and classification truth | SCN-005-015 and SCN-005-016 exact titles |
| Owner read, registry, and Market Brief | SCN-005-018 exact title, selftest registry canary, and Brief validator |
| Prompt/runbook/no-auto-commit | Focused Palm validator plus actual Scope 2 research receipt |
| Complete protected set | `Regression: SCN-005-019 complete Palm Springs protected matrix remains executable` |

### Implementation And Validation Plan

1. Review the focused test file for direct assertions, exact titles, no conditional bailout, no internal interception, no fixture-truth claims, and meaningful production transformation between inputs and assertions.
2. Execute extracted production helper tests, focused validator, page inline-script/ID check, complete Playwright file, and Brief validator with full output.
3. Execute focused Playwright titles when a full-suite failure needs discrimination; fix the owning Feature 005 slice, rerun the focused check, then rerun the complete file.
4. Verify current/stale/invalid/missing/no-fetch/conflict/focus/negative/parity/owner-read/registry/prompt-runbook coverage against the matrix and scenario manifest.
5. Run artifact freshness/lint, capability-foundation G094, Test Plan/DoD parity, traceability, editor diagnostics, framework write guard, doctor, and repository readiness. Planning checks do not substitute for product tests.
6. Account for every finding. A finding requiring an excluded shared-file change blocks this scope and is returned to the owning workflow with the complete finding set; no excluded file is edited.
7. Record current raw evidence in `report.md` under the correct specialist phases. Only `bubbles.validate` may write certification or promote terminal status.
8. Route the exact `.github/workflows/pages.yml` hunk to `bubbles.devops`: add a blocking fresh-checkout `verify` job that runs source-lock validation, `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts`, the exact `1.61.1` runner check, and the complete `system-chrome` suite; make the existing fresh-checkout deploy job depend on it and keep npm installation out of the uploaded root artifact job.
9. Route the exact `.gitignore` and `.specify/memory/agents.md` hunks to `bubbles.devops`: ignore only `/node_modules/`, `/test-results/`, and `/playwright-report/`; revise the ambient-runner prerequisite to the exact source-lock, provisioning, version, full-suite, and focused command sequence without creating a project build or package-script alias.

### Change Boundary And Rollback

**Allowed repair files:** Feature 005 HTML/config/payload/note/prompt/validator/test/fixture files; exact Feature 005 additive regions in registries/docs/Market Brief coverage/selftest when a failing contract proves that region is defective.

**Protected owner-routed files:** exact additive hunks only in `.github/workflows/pages.yml`, `.gitignore`, and `.specify/memory/agents.md`, executed by `bubbles.devops` after path-scoped pre-edit diffs. These files are not implementation-agent cleanup surfaces.

**Path-scoped pre-edit rule:** inspect only the failing path and its nearest owned contract before editing. Preserve all unrelated dirty changes and never stage, commit, reset, clean, reformat, or rewrite a shared file.

**Explicitly excluded:** shared runtime libraries (`rldata.js`, `rlapp.js`, `rlbrief.js`, `rlchart.js`, `rlg.js`, `rlticker.js`), `market-brief.html`, `market-brief.config.json`, `scripts/brief-refresh.mjs`, unrelated tools/tests/notes, package/workflow files, and foreign-owned spec/design/certification content.

The `package/workflow files` exclusion above applies to collateral files only; the five explicitly planned source-lock files from Scope 1 and the three protected owner-routed files named above are the complete exceptions.

**Canaries:** every shared additive-region repair reruns its independent broad canary before the focused and full Feature 005 checks. Registry/Market Brief repairs rerun both selftest and Brief validator.

**Rollback:** reverse only the defect-causing Feature 005 or exact additive-region hunk, then rerun the nearest focused check and broad canary. No unrelated user work is reverted.

### Test Plan - Scope 5

| ID | Type | Category | File / Location | Exact Behavior | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | Broad production helper suite | unit | `scripts/selftest.mjs` | Execute every repository helper/selftest group including Palm Springs production extraction, model, graph, owner read, and registry canaries | `node scripts/selftest.mjs` | No |
| TP-05-02 | Complete feature validator | functional | `scripts/validate-palm-springs-rental-market.mjs` | Validate production config/payload/page/fixtures/prompt/runbook/graphs/rights/change/formula/owner-read contracts and exact pass/fail counts | `node scripts/validate-palm-springs-rental-market.mjs` | No |
| TP-05-03 | Static page integrity | functional | `palm-springs-rental-market-lab.html` | Parse all inline scripts and prove every literal ID reference exists using the repository command | Exact `PSRM-PAGE-INLINE-ID` command | No |
| TP-05-04 | Complete browser regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | Execute every exact `Regression: SCN-005-*` title through the real ephemeral static server and same-origin fixture seam | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-05-05 | Focused protected-matrix regression | e2e-ui | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-019 complete Palm Springs protected matrix remains executable`; assert scenario/title inventory and required visible matrix anchors | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-019 complete Palm Springs protected matrix remains executable" --reporter=list` | Yes |
| TP-05-06 | Market Brief consumer regression | functional | `market-brief.payload.json` via existing validator | Execute existing Brief contract checks with one Feature 005 owner-read coverage reason and no duplicated market/model content | `node scripts/validate-brief-payload.mjs` | No |
| TP-05-07 | Live-test authenticity scan | functional | `tests/palm-springs-rental-market-lab.spec.mjs` | Prove no request interception/fulfillment, silent-pass return, skipped/only test, or market-truth claim from fixtures is present | Exact `PSRM-AUTHENTICITY-SCAN` command with zero matches reviewed as the expected result | No |

### Definition of Done - Scope 5

Core Delivery Items:

- [ ] Every SCN-005-001 through SCN-005-019 contract is present, exact-titled, non-silent, mapped in `scenario-manifest.json` and `test-plan.json`, and backed by the correct production-function or live-page assertion category.
- [ ] The complete desktop/mobile/current/stale/invalid/missing/no-fetch/conflict/source-focus/negative/parity/owner-read/registry/prompt-runbook matrix has current evidence, and fixtures are never presented as real market-performance evidence.
- [ ] Change Boundary is respected and zero excluded file families were changed.
- [ ] The devops-owned Pages verify job, three test-artifact ignore entries, and command-registry commands match the source-locked design exactly; the dependent deploy job still uploads a fresh repository-root checkout with no installed package tree.
- [ ] Report evidence, scope state, scenario manifest, test plan, and execution state agree; terminal status and certification remain owned by `bubbles.validate`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass through all exact SCN-005-001 through SCN-005-019 browser rows in the protected matrix.
- [ ] Broader E2E regression suite passes through TP-05-04 with the exact committed config, `system-chrome` project, and list reporter.

Test Evidence Items - Exact Parity With 7 Test Plan Rows:

- [ ] TP-05-01 unit evidence shows the complete repository selftest, including independent shared-surface canaries, passes.
- [ ] TP-05-02 functional evidence shows the complete Palm Springs validator passes with exact production and rejection coverage.
- [ ] TP-05-03 static-page evidence shows the production inline script parses and every literal ID resolves.
- [ ] TP-05-04 E2E evidence shows every scenario-specific browser regression passes against the real ephemeral static server.
- [ ] TP-05-05 focused E2E evidence shows SCN-005-019 protects the complete scenario/title matrix.
- [ ] TP-05-06 functional evidence shows Market Brief accepts one normalized Feature 005 coverage reason without research/model duplication.
- [ ] TP-05-07 authenticity evidence shows no internal interception, fulfillment, silent-pass, focused-only, skipped-test, or fixture-as-market-proof pattern remains.

Build Quality Gate:

- [ ] Path-scoped diff review, editor diagnostics, artifact freshness/lint, G094 capability foundation, Test Plan/DoD parity, scenario traceability, no-deferral/fabrication scans, framework write guard, Bubbles doctor, and repository readiness pass with full current output; no implementation test is substituted by a planning/governance check.

## Plan-Wide Completion Rules

- Scope status changes follow the sequential gate; no later scope starts while an earlier scope is incomplete.
- Each Test Plan row has exactly one matching test-related DoD item in its scope. Core Delivery and Build Quality items are delivery/governance outcomes, not extra Test Plan rows.
- A checkbox may become checked only after the named command or behavior executes in the current session and raw evidence with phase, command, exit code, and claim source is recorded in `report.md`.
- Scenario-specific E2E rows are permanent regressions. The broad suite complements them and never substitutes for them.
- Unit and functional tests extract and execute production functions. Browser tests use real HTTP and same-origin files through the closed fixture/clock seam without interception or internal mocks.
- Actual online research is an implementation activity with its own tool evidence; static payloads and fixtures cannot prove a fetch, source reachability, or market truth.
- Any source/runtime/config/contract/test/docs finding discovered during delivery is fixed and revalidated in its owning scope or returned as a complete blocking finding set. Findings never disappear from accounting.
- No agent except `bubbles.validate` writes `certification.*` or promotes the spec to a terminal status.
