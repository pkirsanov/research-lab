# Scopes: Place-Based Rental Market Research

Planning authority: [spec.md](spec.md) and [design.md](design.md). Execution evidence belongs in [report.md](report.md), and human acceptance is tracked in [uservalidation.md](uservalidation.md). The directory path remains `specs/005-palm-springs-rental-market-lab` for compatibility; the active feature identity is **Place-Based Rental Market Research**.

This is the active five-scope `full-delivery` plan. Every scope and every v2 DoD item is **Not Started**. Current Palm v1 bytes and prior evidence are migration inputs or history, never v2 completion evidence.

## Execution Outline

### Phase Order

1. **Scope 1 - RED-First Shared V2 Foundation:** first edit persistent tests/fixtures and record meaningful RED; then add `rlrental.js`, one generic config, canonical/compatibility validators, and protected Palm behavior migration. No market-research claim is authored here.
2. **Scope 2 - Four-Unit Research And Production Payloads:** perform real online research independently for both segments in both markets, author two market-owned payloads, and enforce one shared runbook/prompt, source rights, changes, unknowns, and no-auto-commit review.
3. **Scope 3 - Pair-Safe Two-Route Experience:** deliver both route-owned Simple/Power experiences over one compute/view model with pair-safe navigation/selection, coverage-first luxury analysis, Palm operating burdens, Ocean coastal effects, accessibility, safe rendering, and owner reads.
4. **Scope 4 - Additive Registration And Consumers:** only after both payloads/routes validate, add bounded registry/docs/Market Brief integration while preserving concurrent shared-file hunks.
5. **Scope 5 - Verification And Finding Closure:** run the focused and broad product/governance matrix, close or route the complete finding set, and keep delivery status/certification nonterminal.

Scope 1 is `foundation:true`. Scopes 2-5 are overlays and depend on it. The sequential gate is stricter: Scope N cannot start until every earlier scope is Done with current evidence.

### New Types And Signatures

- `place-based-rental-market-config/v2` in `place-based-rental-market.config.json`.
- `place-based-rental-market-payload/v2` in `palm-springs-rental-market.payload.json` and `ocean-shores-rental-market.payload.json`.
- `place-based-rental-market-unit/v2`, one exact `(marketId, segmentId)` unit.
- `place-based-rental-market-basis/v1`, `place-based-rental-market-user-assumptions/v2`, `place-based-rental-market-result/v2`, `place-based-rental-market-view-model/v2`, and inner `place-based-rental-market-tool-read/v2`.
- `RLRENTAL.validateConfig`, `indexConfig`, `validateMarketPayload`, `indexMarketPayload`, `evaluateLuxuryQualification`, `computeCoverage`, `buildBasisSignature`, and `compareAligned`.
- `RLRENTAL.normalizeUserAssumptions`, immutable equation helpers, `computeRentalResult`, and `resultIdentity`.
- `RLRENTAL.buildViewModel`, `buildToolRead`, and browser-only `mountRoute(options)`.

### Validation Checkpoints

- **Scope 1 RED:** new unit and route assertions fail for absent shared v2 behavior before source edits. RED caused by runner/setup defects is invalid evidence.
- **Scope 1 GREEN:** pure contracts/equations, canonical and compatibility validators, selftest sentinel canary, v1 migration/removal proof, five protected Palm regressions, and qualification/coverage/comparison regressions pass.
- **Scope 2:** online tool evidence, both payloads, four independent unit receipts, source/rights/change/unknown validation, and `UNCOMMITTED FOR REVIEW` receipt pass.
- **Scope 3:** both real-HTTP routes pass pair isolation, no-fetch interaction, Simple/Power/mobile parity, market-specific burden, safe rendering, focus, and owner-read checks.
- **Scope 4:** both payloads/routes validate immediately before bounded registration; registry/docs/Brief and dirty-hunk canaries pass.
- **Scope 5:** focused/broad tests, source-safety, no-interception, artifact lint/freshness, G094, traceability, exact planner parity, diagnostics, framework write guard, and repository readiness complete with full finding accounting.

## Impact And Assumptions

- Impacted surfaces: shared browser/Node module, generic config, two payloads, two static routes, canonical/compat validators, one pure unit suite, the existing real-HTTP Playwright suite, v2 fixtures, one research runbook/prompt, a selftest sentinel region, registries/docs, and Market Brief owner-read coverage.
- No backend, API, database, authentication, worker, scheduler, scraper, service worker, deployment target, release train, runtime dependency, generated bundle, or browser research client is introduced.
- Existing source-locked Playwright setup is reused unchanged. No second browser harness, package/source-lock edit, ambient runner fallback, or browser download is planned.
- Fixtures are visibly `TEST FIXTURE` and validate behavior, never setup prose or market truth.
- Project `testImpact`/`traceContracts` are incorporated only when `.github/bubbles-project.yaml` declares them; absence is recorded, not guessed.

## Exact Change Boundary

### Add

- `rlrental.js`
- `place-based-rental-market.config.json`
- `palm-springs-rental-market.payload.json`
- `ocean-shores-rental-market.payload.json`
- `ocean-shores-rental-market-lab.html`
- `scripts/validate-place-based-rental-market.mjs`
- `tests/place-based-rental-market.contracts.unit.mjs`
- `tests/fixtures/place-based-rental-market/config.v2.json`
- `tests/fixtures/place-based-rental-market/palm.valid.payload.json`
- `tests/fixtures/place-based-rental-market/ocean.valid.payload.json`
- `tests/fixtures/place-based-rental-market/invalid-closed-schema.json`
- `tests/fixtures/place-based-rental-market/invalid-pair-leak.json`
- `tests/fixtures/place-based-rental-market/five-bedroom-not-luxury.json`
- `tests/fixtures/place-based-rental-market/sparse-unknown-coverage.json`
- `tests/fixtures/place-based-rental-market/broad-to-luxury-substitution.json`
- `tests/fixtures/place-based-rental-market/comparison-mismatch.json`
- `tests/fixtures/place-based-rental-market/palm-missing-burden.json`
- `tests/fixtures/place-based-rental-market/ocean-coastal-sensitivity.json`
- `tests/fixtures/place-based-rental-market/unsafe-source.json`
- `notes/place-based-rental-market-research.md`
- `.github/prompts/place-based-rental-market-update.prompt.md`

### Update

- `palm-springs-rental-market-lab.html`: Palm route adapter over `RLRENTAL`; preserve route/title and protected behavior.
- `scripts/validate-palm-springs-rental-market.mjs`: tested delegation only; preserve no-argument and legacy two-positional-argument forms without duplicate logic.
- `tests/palm-springs-rental-market-lab.spec.mjs`: retain the sole real-HTTP suite path; preserve five exact existing titles/behaviors, migrate them to v2 fixtures/contracts, and add both-route behavior.
- `scripts/selftest.mjs`: replace only a sentinel-bounded Feature 005 region.
- `tools.json`, `index.html`, `rlnav.js`: two adjacent entries in identical order only after both payloads validate.
- `README.md`, `notes/README.md`: two route references and one shared-method reference through bounded hunks.
- `.github/workflows/pages.yml`, `.specify/memory/agents.md`, `market-brief.payload.json`: owner-routed additive integration only.

### Remove After Same-Change Proof

- `palm-springs-rental-market.config.json`
- `tests/fixtures/palm-springs-rental-market/config.json`
- `tests/fixtures/palm-springs-rental-market/current.payload.json`
- `tests/fixtures/palm-springs-rental-market/invalid.payload.json`

Removal requires machine-readable migrated/replaced/invalidated classification, v2 adversarial coverage, and zero live runtime/test/command references. Historical reports and superseded appendices remain historical.

### Protected Surfaces

- No edits to `rldata.js`, `rlapp.js`, `rlcontracts.js`, `rlchart.js`, `rlg.js`, shared cache semantics, unrelated tools/tests/notes, product spec/design, framework-managed files, package/source-lock files, or deployment surfaces.
- No Feature 005 edits to `package.json`, `package-lock.json`, `.npmrc`, `playwright.config.mjs`, `tests/playwright-runtime.mjs`, or `scripts/validate-node-source-lock.mjs`.
- Current unrelated edits in `scripts/selftest.mjs`, `tools.json`, `index.html`, `rlnav.js`, `README.md`, and `notes/README.md` are foreign bytes. Never attribute, normalize, stage, revert, or overwrite them.

### Shared-File Collision Protocol

Before every permitted shared-file edit, record `git status --short -- <path>`, `git --no-pager diff -- <path>`, and `shasum -a 256 <path>`. Limit the edit to a Feature 005 sentinel or structurally identified additive object/row. Afterward, verify the path diff/hash, preserve surrounding hunks byte-for-byte, and record exact hunk rollback. If overlap cannot be isolated, refuse and route it; never broad-rewrite around the collision.

`scripts/selftest.mjs` uses explicit Feature 005 begin/end sentinels. JSON registries use exact tool IDs as structural sentinels. HTML/JS/Markdown use bounded comments only when syntax permits. Rollback removes only those exact markers/objects/rows.

## Command Registry

Research Lab has no project CLI or build step. Commands run from repository root.

| ID | Exact Command |
| --- | --- |
| PBRM-UNIT | `node --test tests/place-based-rental-market.contracts.unit.mjs` |
| PBRM-SELFTEST | `node scripts/selftest.mjs` |
| PBRM-VALIDATOR | `node scripts/validate-place-based-rental-market.mjs` |
| PBRM-COMPAT | `node scripts/validate-palm-springs-rental-market.mjs` |
| PBRM-BRIEF | `node scripts/validate-brief-payload.mjs` |
| PBRM-E2E | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` |
| PBRM-NO-INTERCEPTION | Exact zero-match source scan below; expected exit 1. |
| PBRM-PLANNER-PARITY | Exact read-only Node parity command below. |
| PBRM-ARTIFACT-INTEGRITY | `bash .github/bubbles/scripts/artifact-lint.sh specs/005-palm-springs-rental-market-lab && bash .github/bubbles/scripts/artifact-freshness-guard.sh specs/005-palm-springs-rental-market-lab` |
| PBRM-G094 | `bash .github/bubbles/scripts/capability-foundation-guard.sh specs/005-palm-springs-rental-market-lab` |
| PBRM-TRACEABILITY | `bash .github/bubbles/scripts/traceability-guard.sh specs/005-palm-springs-rental-market-lab` |
| PBRM-REPOSITORY-READINESS | `bash .github/bubbles/scripts/cli.sh framework-write-guard && bash .github/bubbles/scripts/cli.sh doctor && bash .github/bubbles/scripts/cli.sh repo-readiness .` |

```bash
grep -nE 'page\.route|context\.route|route\(|fulfill\(|test\.(skip|only)' tests/palm-springs-rental-market-lab.spec.mjs
```

```bash
node -e 'const f=require("node:fs"),d="specs/005-palm-springs-rental-market-lab",k=["<!-- BEGIN"," SUPERSEDED V1 PLAN - DO NOT EXECUTE"].join(""),s=f.readFileSync(`${d}/scopes.md`,"utf8").split(k)[0],m=JSON.parse(f.readFileSync(`${d}/scenario-manifest.json`)),p=JSON.parse(f.readFileSync(`${d}/test-plan.json`)),r=p.scopes.flatMap(q=>q.tests.map(t=>({...t,n:+q.scopeId.slice(0,2)}))),c=l=>l.split("|").slice(1,-1).map(x=>x.trim().replace(/^`|`$/g,"")),a=s.split(/\r?\n/).filter(l=>/^\| BS-\d{3} \| SCN-005-\d{3} \|/.test(l)).map(l=>{const [b,i,n,t,o,x]=c(l);return{b,i,n:+n,t,o,x}});let n=0;const u=[];for(const l of s.split(/\r?\n/)){const h=l.match(/^## Scope (\d):/);if(h)n=+h[1];if(/^\| TP-\d{2}-\d{2} \|/.test(l)){const [i,t,g,cid,o,x]=c(l);u.push({i,t,g,cid,o,x,n})}}const R=new Map(r.map(x=>[x.id,x])),M=new Map(m.scenarios.map(x=>[x.scenarioId,x])),e=[];for(const x of a){const t=R.get(x.t),z=M.get(x.i);if(!t||!z||t.scenarioId!==x.i||t.testTitle!==x.x||t.dodId!==x.o||t.n!==x.n||z.businessScenarioId!==x.b||z.scopeRef!==`Scope ${x.n}`||z.linkedTestDetails?.[0]?.testId!==x.x||z.testPlanIds?.[0]!==x.t||z.dodIds?.[0]!==x.o)e.push(x.i)}for(const x of u){const t=R.get(x.i);if(!t||t.type!==x.t||t.category!==x.g||(t.commandId||"")!==x.cid||t.dodId!==x.o||t.description.replace(/\.$/,"")!==x.x.replace(/\.$/,"")||t.n!==x.n)e.push(x.i)}const I=x=>[...new Set(x)].sort(),g=[...s.matchAll(/^Scenario: (SCN-005-\d{3}) (.+)$/gm)].map(x=>({i:x[1],t:x[2]}));if(JSON.stringify(I(s.match(/TP-\d{2}-\d{2}/g)||[]))!==JSON.stringify(I(r.map(x=>x.id)))||JSON.stringify(I(s.match(/DOD-\d{2}-TP-\d{2}-\d{2}/g)||[]))!==JSON.stringify(I(r.map(x=>x.dodId)))||JSON.stringify(I(g.map(x=>x.i)))!==JSON.stringify(I(m.scenarios.map(x=>x.scenarioId)))||g.some(x=>M.get(x.i)?.title!==x.t))e.push("sets");console.log(`gherkin=${g.length}`);console.log(`scenarioRows=${a.length}`);console.log(`supportRows=${u.length}`);console.log(`jsonRows=${r.length}`);console.log(`manifestRows=${m.scenarios.length}`);console.log(`findings=${e.length}`);if(e.length){console.log(e.join("\n"));process.exit(1)}'
```

Focused E2E uses PBRM-E2E plus `--grep "<exact title>"`. The one existing suite owns an ephemeral `127.0.0.1` server, real same-origin files, request observation without interception, and server teardown. No duplicate harness is authorized.

## Scope Summary

| # | Scope | Scenario IDs | Status |
| --- | --- | --- | --- |
| 1 | RED-First Shared V2 Foundation | 002, 004, 006, 008, 009, 020-023 | Not Started |
| 2 | Four-Unit Research And Payloads | 001, 013-016, 026-028 | Not Started |
| 3 | Pair-Safe Two-Route Experience | 003, 005, 007, 010-012, 017, 019, 024-025 | Not Started |
| 4 | Additive Registration And Consumers | 018 | Not Started |
| 5 | Verification And Finding Closure | no pseudo-business scenario | Not Started |

## Scenario E2E Test Plan

`SCN-005-001..018` preserve their prior business meanings. `SCN-005-019..028` map exactly to `BS-019..028`. Scope 5 has no fake complete-matrix scenario.

All rows are `type=e2e-ui`, `category=e2e-ui`, file `tests/palm-springs-rental-market-lab.spec.mjs`, and use the focused PBRM-E2E command with the exact title.

| BS | Scenario ID | Scope | Test Plan ID | DoD ID | Exact Persistent Title |
| --- | --- | --- | --- | --- | --- |
| BS-001 | SCN-005-001 | 2 | TP-02-04 | DOD-02-TP-02-04 | `Regression: SCN-005-001 researched payload exposes four truthful units and no fixture authority` |
| BS-002 | SCN-005-002 | 1 | TP-01-06 | DOD-01-TP-01-06 | `Regression: SCN-005-002 missing configuration blocks payload fetch and every output` |
| BS-003 | SCN-005-003 | 3 | TP-03-04 | DOD-03-TP-03-04 | `Regression: SCN-005-003 stale research stays stale in Simple Power and owner read` |
| BS-004 | SCN-005-004 | 1 | TP-01-07 | DOD-01-TP-01-07 | `Regression: SCN-005-004 invalid payload produces errors and no conclusion` |
| BS-005 | SCN-005-005 | 3 | TP-03-05 | DOD-03-TP-03-05 | `Regression: SCN-005-005 pair levers recompute with zero post-boot requests` |
| BS-006 | SCN-005-006 | 1 | TP-01-08 | DOD-01-TP-01-08 | `Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator` |
| BS-007 | SCN-005-007 | 3 | TP-03-06 | DOD-03-TP-03-06 | `Regression: SCN-005-007 incompatible occupancy definitions remain separate and unaggregated` |
| BS-008 | SCN-005-008 | 1 | TP-01-09 | DOD-01-TP-01-09 | `Regression: SCN-005-008 buyer economics use standard amortization in one result` |
| BS-009 | SCN-005-009 | 1 | TP-01-10 | DOD-01-TP-01-10 | `Regression: SCN-005-009 zero-rate financing stays finite` |
| BS-010 | SCN-005-010 | 3 | TP-03-07 | DOD-03-TP-03-07 | `Regression: SCN-005-010 negative cash flow remains signed and explicit everywhere` |
| BS-011 | SCN-005-011 | 3 | TP-03-08 | DOD-03-TP-03-08 | `Regression: SCN-005-011 both routes keep desktop mobile Simple Power decisions identical` |
| BS-012 | SCN-005-012 | 3 | TP-03-09 | DOD-03-TP-03-09 | `Regression: SCN-005-012 source inspector resolves provenance and restores exact focus` |
| BS-013 | SCN-005-013 | 2 | TP-02-05 | DOD-02-TP-02-05 | `Regression: SCN-005-013 compared refresh accounts for every material entity by pair` |
| BS-014 | SCN-005-014 | 2 | TP-02-06 | DOD-02-TP-02-06 | `Regression: SCN-005-014 baseline refresh invents no prior change` |
| BS-015 | SCN-005-015 | 2 | TP-02-07 | DOD-02-TP-02-07 | `Regression: SCN-005-015 inaccessible research remains unknown without a value` |
| BS-016 | SCN-005-016 | 2 | TP-02-08 | DOD-02-TP-02-08 | `Regression: SCN-005-016 observed assumptions inference and modeled outputs stay distinct` |
| BS-017 | SCN-005-017 | 3 | TP-03-10 | DOD-03-TP-03-10 | `Regression: SCN-005-017 legal and active supply remain separate from scenario assumptions` |
| BS-018 | SCN-005-018 | 4 | TP-04-04 | DOD-04-TP-04-04 | `Regression: SCN-005-018 both registered owner reads preserve truth omissions and owning links` |
| BS-019 | SCN-005-019 | 3 | TP-03-11 | DOD-03-TP-03-11 | `Regression: SCN-005-019 market and segment switching commits one matching result` |
| BS-020 | SCN-005-020 | 1 | TP-01-11 | DOD-01-TP-01-11 | `Regression: SCN-005-020 five bedrooms alone never qualifies luxury` |
| BS-021 | SCN-005-021 | 1 | TP-01-12 | DOD-01-TP-01-12 | `Regression: SCN-005-021 sparse segment evidence remains visible` |
| BS-022 | SCN-005-022 | 1 | TP-01-13 | DOD-01-TP-01-13 | `Regression: SCN-005-022 whole-market values never become observed luxury performance` |
| BS-023 | SCN-005-023 | 1 | TP-01-14 | DOD-01-TP-01-14 | `Regression: SCN-005-023 deltas require aligned market and segment bases` |
| BS-024 | SCN-005-024 | 3 | TP-03-12 | DOD-03-TP-03-12 | `Regression: SCN-005-024 Ocean Shores coastal inputs change nights costs and cash flow` |
| BS-025 | SCN-005-025 | 3 | TP-03-13 | DOD-03-TP-03-13 | `Regression: SCN-005-025 Palm Springs luxury keeps legal and operating boundaries` |
| BS-026 | SCN-005-026 | 2 | TP-02-09 | DOD-02-TP-02-09 | `Regression: SCN-005-026 refresh accounts independently for all four mandatory units` |
| BS-027 | SCN-005-027 | 2 | TP-02-10 | DOD-02-TP-02-10 | `Regression: SCN-005-027 acquisition baselines disclose sample status and legal unknowns` |
| BS-028 | SCN-005-028 | 2 | TP-02-11 | DOD-02-TP-02-11 | `Regression: SCN-005-028 remaining-2026 and 2027 scenarios remain falsifiable not factual` |

The five exact current titles for SCN-005-002, 004, 006, 008, and 009 are protected. Current v1 passes do not prove v2; Scope 1 migrates their fixtures/assertions before rerunning them.

## UI Scenario Matrix

| Journey / State | Entry And Preconditions | Steps | User-Visible Assertions | Persistent Coverage |
| --- | --- | --- | --- | --- |
| Palm first paint | Palm route; config and Palm payload valid | Open route without query state | Palm route identity, whole-market pair, coverage receipt, thesis, Simple mode, educational disclosure | SCN-005-011, SCN-005-019, broad suite |
| Ocean first paint | Ocean route; config and Ocean payload valid | Open route without query state | Ocean route identity, whole-market pair, coastal composition, Simple mode, educational disclosure | SCN-005-011, SCN-005-019, SCN-005-024 |
| Pair-safe segment switch | Route payload has both mandatory units | Switch whole market to 5+ luxury | Target pair identity, qualification/coverage before conclusions, one target result/read, no prior-pair value | SCN-005-019 through SCN-005-023 |
| Cross-market navigation | Both routes and payloads valid | Follow configured market link with validated identifiers | Browser navigates to owning route; target rebuilds from target payload; no source-route research or numerics cross | SCN-005-019, SCN-005-018 |
| Invalid pair link | Query has invalid segment/year/scenario | Open link | `INVALID PAIR LINK`; no first-item fallback or prior-pair output | SCN-005-004, SCN-005-019 |
| Missing/invalid contracts | Config missing or own payload invalid | Open route | Exact unavailable state; config failure causes zero payload requests; no thesis/result/read numerics | SCN-005-002, SCN-005-004 |
| Stale/sparse/incomplete | Valid stale or low-coverage unit with missing required costs | Open and switch modes | Persistent STALE/SPARSE/INCOMPLETE words, age/counts/missing IDs, valid partial outputs only | SCN-005-003, SCN-005-021, SCN-005-024 |
| Assumption workbench | Valid selected pair | Edit demand/supply/ADR/downtime/acquisition/financing/cost controls | Immediate one-result update, no request, unchanged research, adjacent input errors | SCN-005-005, SCN-005-006, SCN-005-008 through SCN-005-010 |
| Evidence and comparison audit | Power mode with two observations | Inspect definitions, qualification, comparison, and sources | Separate definitions/populations; INCOMPARABLE reasons; safe source detail; exact focus return | SCN-005-007, SCN-005-012, SCN-005-020 through SCN-005-023 |
| Ocean coastal sensitivity | Ocean route and explicit coastal inputs | Change downtime and fixed-risk lines | Effective nights, revenue, cost, yield/cash flow effects named; geography remains city/county/region/coast/property | SCN-005-024 |
| Palm luxury burden | Palm route and 5+ luxury selected | Inspect legal, acquisition, and cost sections | Qualification/sample plus certificate-cap-contract, events, acquisition basis, and operating burdens without broad substitution | SCN-005-025 |
| Mobile and keyboard | Either route at 390x844 | Operate segment/mode/controls/dialog; inspect Power table/chart | No body overflow/overlap, 44px actions, visible focus, concise live update, table authority, nonblank enhancement | SCN-005-011, SCN-005-012 |
| Owner-read consumer | Both routes registered | Publish state, open Market Brief, follow deep link | Pair/truth/coverage/caveat/valid metrics and owning link preserved; no copied research or equations | SCN-005-018 |
| Authentication / redirect | Not applicable: public static GitHub Pages tool has no login, role, or authenticated redirect | Open either public route | No login prompt, auth state, credential input, or role-dependent branch is introduced | Static/source-safety validation and broad suite |

## Shared Infrastructure Impact Sweep

| Protected Surface | Downstream Contracts / Blast Radius | Independent Canary Before Broad Suite | Rollback / Collision Rule |
| --- | --- | --- | --- |
| `scripts/selftest.mjs` | Every existing tool helper, registry parity, summary counts, exit behavior, and concurrently added Feature 010 groups | PBRM-UNIT and canonical validator first; then full PBRM-SELFTEST proving every unrelated group remains present and green | Pre-edit status/diff/hash; edit only Feature 005 sentinels; reverse only sentinel hunk; refuse overlap with another active hunk |
| `tests/palm-springs-rental-market-lab.spec.mjs` | One existing ephemeral server, system-Chrome runtime, five protected titles, all future two-route tests | Run new focused RED/GREEN title first; run PBRM-NO-INTERCEPTION; then complete PBRM-E2E | Preserve server/runtime setup and five titles; add tests in existing suite; no second harness; reverse only Feature 005 test blocks |
| `tests/playwright-runtime.mjs` and Playwright config/source lock | Every browser suite in the repository | Existing source-lock and exact runner identity checks; no Feature 005 edit expected | Explicitly unchanged; any required change is a separate owner finding, not collateral Feature 005 work |
| `tools.json`, `index.html`, `rlnav.js` | Global tool order, landing page, navigation on every route, concurrent volatility-sizing additions | Canonical two-payload/route validation before edit; registry equality selftest after each bounded insertion | Structural object/row sentinels; refuse overlapping insertion; remove only two Feature 005 records |
| `README.md`, `notes/README.md` | Managed architecture/development truth and methodology discovery; both currently carry unrelated edits | Canonical reference/path check and repository readiness | Pre-edit fence; bounded Feature 005 rows only; no section normalization; exact row rollback |
| `market-brief.payload.json` | Existing strict owner-read coverage order and Market Brief validator | PBRM-BRIEF before and after two bounded entries; focused SCN-005-018 before broad suite | No rental facts/equations copied; reverse only two coverage entries |
| `.github/workflows/pages.yml`, `.specify/memory/agents.md` | Fresh-checkout CI and project command truth | Owner-run YAML/command checks plus canonical/unit/full suite | Route to `bubbles.devops` / command owner; implementation agent does not edit these surfaces |

---

<!-- markdownlint-disable MD024 -->

## Scope 1: RED-First Shared V2 Foundation

**Status:** Done

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `migration:true`, `red-first:true`

**Depends On:** None

**Primary Outcome:** One browser/Node-safe shared capability owns closed v2 contracts, pair isolation, luxury qualification, coverage, basis comparison, immutable equations, one result/view model, and route-controller semantics without market facts. Persistent tests/fixtures are the first physical edits and fail meaningfully before implementation.

### Gherkin Scenarios

```gherkin
Scenario: SCN-005-002 Missing configuration blocks the product
Given required v2 configuration is missing or unreadable
When either route boots
Then configuration is unavailable, no payload request occurs, and no market, segment, result, or owner-read metric is substituted

Scenario: SCN-005-004 An invalid payload produces no conclusion
Given a market payload violates schema, pair, category, qualification, reference, or bound rules
When shared validation runs
Then specific errors appear and no thesis, projection, deterministic result, or numeric owner-read metric is produced

Scenario: SCN-005-006 Demand and supply shocks obey the bounded occupancy equation
Given finite base occupancy and configured demand and supply deltas
When shared occupancy computation runs
Then the exact clamped demand-over-supply equation applies and an invalid denominator returns unavailable without a number

Scenario: SCN-005-008 Buyer economics use standard amortizing debt service
Given a positive price, valid down payment, finite rate, and positive term
When shared buyer economics run
Then standard amortization, gross yield, explicit costs, and pre-tax cash flow share one unrounded pair result

Scenario: SCN-005-009 Zero-rate financing remains finite
Given positive principal, zero annual rate, and a positive payment count
When shared debt service runs
Then monthly principal equals principal divided by payments and annual debt service and cash flow remain finite

Scenario: SCN-005-020 Five bedrooms alone do not qualify luxury
Given a property has at least five bedrooms
When large-luxury membership is evaluated
Then entire-home status and every configured luxury gate must pass, while marketing, price, bedroom count, one amenity, or a missing gate cannot qualify it

Scenario: SCN-005-021 Sparse segment evidence remains visible
Given a luxury candidate or qualifying intersection is sparse or unknown
When a thesis, metric, forecast, acquisition baseline, or comparison is produced
Then counts, sample size, denominator and method, missing fields, and confidence consequence remain visible and never appear complete

Scenario: SCN-005-022 Whole-market performance cannot become observed luxury performance
Given broad performance or all-home prices exist while matching luxury observations do not
When large-luxury analysis is produced
Then no broad value is copied, multiplied, or premium-adjusted into an observed segment field and the field remains unknown or an explicit assumption

Scenario: SCN-005-023 Segment and market deltas require aligned bases
Given two values are selected for comparison
When complete basis signatures are checked
Then a delta appears only when every required field aligns, otherwise INCOMPARABLE names mismatches and emits no delta or ranking
```

### Implementation Plan

1. Add v2 fixtures and `tests/place-based-rental-market.contracts.unit.mjs` first; add new browser assertions without changing five protected titles. Record RED for missing `rlrental.js`, generic config, Ocean route, and v2 behavior.
2. Add frozen browser/CommonJS `RLRENTAL`, dependent only on existing `RLCONTRACTS`; pure functions receive time/data explicitly and own no DOM/network/storage.
3. Add generic fixture and production config with exact mandatory pairs/profiles/catalogs/bounds/versions/mappings.
4. Implement pair-local references/rights, qualification, direct-count coverage, broad-substitution rejection, basis comparison, equations, completeness, identity, view model, and owner-read omission.
5. Add canonical validator and reduce Palm validator to tested delegation.
6. Migrate Palm through `RLRENTAL` after pure GREEN; preserve five behaviors through revised v2 fixtures/assertions.
7. Classify every v1 field/fixture as migrated/replaced/invalidated; remove old paths only after zero-live-reference proof.
8. Edit only Feature 005 selftest sentinels after status/diff/hash fencing and run full selftest.

### Consumer Impact Sweep

| Consumer | Scope 1 Impact | Exact Canary | Rollback Boundary |
| --- | --- | --- | --- |
| `palm-springs-rental-market-lab.html` | Direct browser consumer of `RLRENTAL`; preserves the Palm route/title, shared-script order, unavailable-state behavior, and the five protected regression titles while page-local v1 contract authority is removed. | PBRM-VALIDATOR plus the nine-test PBRM-E2E suite, including the five protected titles. | Restore only the Palm adapter/script-order hunk and the four tracked v1 paths; do not touch shared shell modules or unrelated page bytes. |
| `tests/place-based-rental-market.contracts.unit.mjs`, `scripts/validate-place-based-rental-market.mjs`, and the Feature 005 sentinel region in `scripts/selftest.mjs` | Direct Node consumers of the frozen `RLRENTAL` API, closed v2 contracts, equations, owner-read omission, and route-adapter boundary. | PBRM-UNIT, PBRM-VALIDATOR, then the explicit TP-01-05 PBRM-SELFTEST canary before PBRM-E2E. | Remove only `rlrental.js`, v2 fixtures/config, canonical-validator additions, and the exact Feature 005 sentinel region; preserve every foreign selftest hunk. |
| `scripts/validate-palm-springs-rental-market.mjs` and Features 006-008 command/test-plan references | Compatibility consumer, not a second contract owner; both no-argument and legacy two-positional-argument forms delegate to the canonical validator with unchanged exit semantics. | PBRM-COMPAT in both command shapes plus zero live references to removed v1 config/fixture paths. | Restore the prior compatibility entry only with the prior Palm foundation; never remove the command path while live planner/CI consumers remain. |
| `RLDATA.putToolRead`, Market Brief owner-read coverage, and future route deep links | Scope 1 validates the inner `place-based-rental-market-tool-read/v2` shape and strict numeric omission; it does not edit `rldata.js`, `market-brief.payload.json`, the Brief validator, registry navigation, or deep-link registration. | PBRM-UNIT owner-read assertions and PBRM-SELFTEST's existing strict `RLDATA.putToolRead` envelope canary. Market Brief registration remains a Scope 4 consumer check. | Roll back only the new inner read producer/API; leave the shared owner store and existing Brief coverage bytes unchanged. |

Explicitly unaffected in Scope 1: navigation, breadcrumbs, redirects, API clients, generated clients, `rldata.js`, `rlapp.js`, `rlcontracts.js`, `rlchart.js`, `rlg.js`, `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/README.md`, `.github/workflows/pages.yml`, `.specify/memory/agents.md`, and production Market Brief coverage. The stale-reference scan covers live runtime, test, command, config, navigation, and deep-link consumers; historical report text and the superseded appendix remain historical and are not rewritten.

### Shared Infrastructure Impact Sweep

| Protected Surface | Downstream Contract / Blast Radius | Independent Canary Before Broad Suite | Rollback / Restore |
| --- | --- | --- | --- |
| `scripts/selftest.mjs` | Every pre-existing helper group, registry-parity group, summary count, process exit, and concurrent Feature 010 additions depend on stable ordering and intact group registration. | TP-01-05 runs PBRM-SELFTEST after PBRM-UNIT/PBRM-VALIDATOR and before PBRM-E2E; it must retain every unrelated group and end with zero failures. | Feature 005 begin/end sentinels are the complete change boundary; reverse only that region after pre/post diff/hash comparison and preserve prefix, suffix, and foreign hunks byte-for-byte. |
| New shared `rlrental.js` seam with unchanged `rlcontracts.js` and `RLDATA.putToolRead` | Palm browser boot, Node import, canonical validation, immutable pair/result identity, and owner-read envelope compatibility depend on the frozen public API and shared-envelope ordering; no shared storage/session/bootstrap contract changes. | PBRM-UNIT API/envelope assertions plus the PBRM-SELFTEST CommonJS and strict-owner-read canaries. | Remove only `rlrental.js` and its direct consumer adapters/fixtures; `rlcontracts.js`, `rldata.js`, `rlapp.js`, and shared storage semantics remain untouched. |
| Existing Playwright shared runtime/config/source lock | Every browser suite depends on `playwright.config.mjs`, `tests/playwright-runtime.mjs`, package/source locks, system-Chrome selection, one ephemeral server, request timing, and teardown behavior. | The existing PBRM-E2E file runs through that unchanged runtime after PBRM-NO-INTERCEPTION; no Feature 005-specific harness or setup is added. | These files are excluded from Scope 1. Any required runtime/config edit stops this scope and routes separately; rollback removes only Feature 005 test blocks from the existing suite. |
| Registry/docs/Brief/CI/command surfaces | `tools.json`, `index.html`, `rlnav.js`, README indexes, `market-brief.payload.json`, Pages, and the command registry are protected shared consumers with unrelated dirty hunks. | No Scope 1 mutation is authorized; existing unit/validator/selftest checks prove the foundation without registering or publishing it. | Preserve all bytes in Scope 1. Their bounded additive canaries and exact-row rollback remain Scope 4 work. |

### Test Plan

| ID | Type | Category | Command | DoD ID | Exact Behavior |
| --- | --- | --- | --- | --- | --- |
| TP-01-01 | unit | unit-red | PBRM-UNIT | DOD-01-TP-01-01 | First persistent v2 contract/model run fails for absent production behavior rather than setup text or runner failure. |
| TP-01-02 | unit | unit | PBRM-UNIT | DOD-01-TP-01-02 | Closed schemas, pair references, luxury qualification, coverage, basis comparison, equations, identity, and omissions execute production functions. |
| TP-01-03 | contract | contract | PBRM-VALIDATOR | DOD-01-TP-01-03 | Canonical validator accepts valid v2 fixtures, rejects every adversarial class, and proves v1 field migration classification. |
| TP-01-04 | functional | functional | PBRM-COMPAT | DOD-01-TP-01-04 | Compatibility entry delegates no-argument and legacy two-positional-argument forms with canonical findings and exit code. |
| TP-01-05 | functional | static-integrity | PBRM-SELFTEST | DOD-01-TP-01-05 | Canary: sentinel-bounded RLRENTAL contracts pass and every unrelated selftest group remains intact before the broad suite reruns. |
| TP-01-15 | e2e-ui | broad-regression | PBRM-E2E | DOD-01-TP-01-15 | Full real-HTTP suite retains five migrated protected behaviors and all foundation regressions. |

| Test Type | Scenario ID | Test Plan ID | Concrete Test File | Exact Persistent Title | Command ID | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| e2e-ui | SCN-005-002 | TP-01-06 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-002 missing configuration blocks payload fetch and every output` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-004 | TP-01-07 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-004 invalid payload produces errors and no conclusion` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-006 | TP-01-08 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-008 | TP-01-09 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-008 buyer economics use standard amortization in one result` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-009 | TP-01-10 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-009 zero-rate financing stays finite` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-020 | TP-01-11 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-020 five bedrooms alone never qualifies luxury` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-021 | TP-01-12 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-021 sparse segment evidence remains visible` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-022 | TP-01-13 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-022 whole-market values never become observed luxury performance` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-023 | TP-01-14 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-023 deltas require aligned market and segment bases` | focused PBRM-E2E | Yes |

### Definition of Done

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior protect all nine Scope 1 scenarios through TP-01-06..14 without changing their persistent titles. (DOD-01-E2E-SCENARIO)

 **Phase:** test

 **Claim Source:** executed

 **Executed:** YES (in current session)

 **Command TP-01-06:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-002 missing configuration blocks payload fetch and every output" --reporter=list`

 **Command TP-01-07:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-004 invalid payload produces errors and no conclusion" --reporter=list`

 **Command TP-01-08:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator" --reporter=list`

 **Command TP-01-09:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-008 buyer economics use standard amortization in one result" --reporter=list`

 **Command TP-01-10:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-009 zero-rate financing stays finite" --reporter=list`

 **Command TP-01-11:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-020 five bedrooms alone never qualifies luxury" --reporter=list`

 **Command TP-01-12:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-021 sparse segment evidence remains visible" --reporter=list`

 **Command TP-01-13:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-022 whole-market values never become observed luxury performance" --reporter=list`

 **Command TP-01-14:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-023 deltas require aligned market and segment bases" --reporter=list`

 **Exit Codes:** all nine commands exited `0`.

 ```text
 TP-01-06_FOCUSED_BEGIN
 Running 1 test using 1 worker
 [SCN-005-002] truth=INVALID CONFIGURATION
 [SCN-005-002] payloadRequests=0
 [SCN-005-002] ownerReadPublished=false
 1 passed (1.9s)
 TP-01-06_FOCUSED_EXIT=0
 TP-01-07_FOCUSED_BEGIN
 Running 1 test using 1 worker
 [SCN-005-004] truth=INVALID PAYLOAD
 [SCN-005-004] modelVisible=false
 [SCN-005-004] ownerReadPublished=false
 1 passed (1.4s)
 TP-01-07_FOCUSED_EXIT=0
 TP-01-08_FOCUSED_BEGIN
 Running 1 test using 1 worker
 [SCN-005-006] adjustedOccupancy=0.35200000000000004
 [SCN-005-006] invalidCode=PBRM-MODEL-OCCUPANCY-DENOMINATOR
 [SCN-005-006] invalidNumeric=false
 1 passed (888ms)
 TP-01-08_FOCUSED_EXIT=0
 TP-01-09_FOCUSED_BEGIN
 Running 1 test using 1 worker
 [SCN-005-008] branch=amortizing
 [SCN-005-008] totalOperatingCostUsd=27987.2
 [SCN-005-008] preTaxCashFlowUsd=-5373.625207332323
 1 passed (1.3s)
 TP-01-09_FOCUSED_EXIT=0
 TP-01-10_FOCUSED_BEGIN
 Running 1 test using 1 worker
 [SCN-005-009] branch=zero-rate
 [SCN-005-009] monthlyPaymentUsd=1111.111111111111
 [SCN-005-009] finite=true
 1 passed (1.4s)
 TP-01-10_FOCUSED_EXIT=0
 TP-01-11_FOCUSED_BEGIN
 Running 1 test using 1 worker
 [SCN-005-020] premiumAttributes=1
 [SCN-005-020] disposition=UNKNOWN
 [SCN-005-020] broadSubstitution=false
 1 passed (802ms)
 TP-01-11_FOCUSED_EXIT=0
 TP-01-12_FOCUSED_BEGIN
 Running 1 test using 1 worker
 [SCN-005-021] state=SPARSE
 [SCN-005-021] coverageRatio=UNKNOWN
 [SCN-005-021] completeLabel=false
 1 passed (966ms)
 TP-01-12_FOCUSED_EXIT=0
 TP-01-13_FOCUSED_BEGIN
 Running 1 test using 1 worker
 [SCN-005-022] observedLuxuryOccupancy=UNKNOWN
 [SCN-005-022] contextOnly=true
 [SCN-005-022] premiumMultiplierUsed=false
 1 passed (1.1s)
 TP-01-13_FOCUSED_EXIT=0
 TP-01-14_FOCUSED_BEGIN
 Running 1 test using 1 worker
 [SCN-005-023] state=INCOMPARABLE
 [SCN-005-023] absoluteDelta=UNKNOWN
 [SCN-005-023] ranking=UNKNOWN
 1 passed (931ms)
 TP-01-14_FOCUSED_EXIT=0
 ```

 **Result:** PASS - all nine persistent scenario commands independently discovered exactly one test and proved their planned browser-visible behavior through local macOS system Chrome over the suite's real ephemeral HTTP server.

 **Evidence Ref:** `report.md#scope-1-test-evidence-2026-07-17`.

- [x] Broader E2E regression suite passes through the existing nine-test TP-01-15 PBRM-E2E row with no duplicate execution path. (DOD-01-E2E-BROAD)

 **Phase:** test

 **Claim Source:** executed

 **Executed:** YES (in current session)

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** `0`.

 ```text
 TP-01-15_BROAD_BEGIN
 Running 9 tests using 1 worker
 [SCN-005-002] truth=INVALID CONFIGURATION
 [SCN-005-004] truth=INVALID PAYLOAD
 [SCN-005-006] adjustedOccupancy=0.35200000000000004
 [SCN-005-008] branch=amortizing
 [SCN-005-009] branch=zero-rate
 [SCN-005-020] disposition=UNKNOWN
 [SCN-005-021] state=SPARSE
 [SCN-005-022] observedLuxuryOccupancy=UNKNOWN
 [SCN-005-023] state=INCOMPARABLE
 9 passed (2.9s)
 TP-01-15_BROAD_EXIT=0
 scenarioTitleCount=9
 pageGotoCount=9
 createServerCount=1
 beforeAllCount=1
 afterAllCount=1
 interceptionMockScan=PASS matches=0
 skipOnlyTodoScan=PASS matches=0
 silentEarlyReturnScan=PASS matches=0
 retryAuthorityScan=PASS matches=0
 ```

 **Result:** PASS - the complete file ran once with nine unique titles, one worker, one server/setup/teardown path, and zero retry, interception, mock, skip, only, todo, or silent-return authority.

 **Evidence Ref:** `report.md#scope-1-test-evidence-2026-07-17`.

 **Phase:** test

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** `0`.

 ```text
 PBRM_TEST_REFENCE_BROAD_BEGIN
 Running 9 tests using 1 worker
 [SCN-005-002] truth=INVALID CONFIGURATION
 [SCN-005-004] truth=INVALID PAYLOAD
 [SCN-005-006] adjustedOccupancy=0.35200000000000004
 [SCN-005-008] branch=amortizing
 [SCN-005-009] branch=zero-rate
 [SCN-005-020] disposition=UNKNOWN
 [SCN-005-021] state=SPARSE
 [SCN-005-022] observedLuxuryOccupancy=UNKNOWN
 [SCN-005-023] state=INCOMPARABLE
 9 passed (3.0s)
 PBRM_TEST_REFENCE_BROAD_EXIT=0
 PBRM_TEST_REFENCE_BROAD_END
 ```

 **Current-Byte Result:** PASS - after a concurrent foreign Feature 010 Scope 6 selftest addition, TP-01-15 reran after the re-fenced full selftest and remained 9/9 green.

- [x] Scope 1 Consumer Impact Sweep is completed across `RLRENTAL`, the Palm route/compatibility validator, owner-read/Market Brief seams, and explicitly unaffected consumers; zero stale first-party references remain. (DOD-01-CONSUMER-SWEEP)

 **Phase:** implement

 **Claim Source:** executed

 **Commands:** PBRM-UNIT; PBRM-VALIDATOR; PBRM-COMPAT in no-argument and legacy two-positional forms; current-session read-only consumer/reference discriminator; current-session protected-surface post-edit SHA-256 check.

 **Exit Codes:** all `0`.

 ```text
 PBRM_IMPLEMENT_CONSUMER_SWEEP_BEGIN
 palmRoute=palm-springs-rental-market-lab.html
 palmTitle=Palm Springs Rental Market Lab
 palmHeading=Palm Springs Rental Market Lab
 palmDirectRLRENTAL=true
 palmMarketId=palm-springs-ca
 palmScriptOrder=rldata.js,rlapp.js,rlcontracts.js,rlrental.js,rlnav.js
 palmUnavailableConfigBoundary=true
 palmUnavailablePayloadBoundary=true
 protectedTitle=Regression: SCN-005-002 missing configuration blocks payload fetch and every output|testCount=1
 protectedTitle=Regression: SCN-005-004 invalid payload produces errors and no conclusion|testCount=1
 protectedTitle=Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator|testCount=1
 protectedTitle=Regression: SCN-005-008 buyer economics use standard amortization in one result|testCount=1
 protectedTitle=Regression: SCN-005-009 zero-rate financing stays finite|testCount=1
 apiFrozen=true
 apiKeyCount=17
 apiKeys=buildBasisSignature,buildToolRead,buildViewModel,compareAligned,computeAdjustedOccupancy,computeCoverage,computeEffectiveAvailableNights,computeMonthlyPayment,computeRentalResult,evaluateLuxuryQualification,indexConfig,indexMarketPayload,mountRoute,normalizeUserAssumptions,resultIdentity,validateConfig,validateMarketPayload
 canonicalNodeConsumers=tests/place-based-rental-market.contracts.unit.mjs,scripts/validate-place-based-rental-market.mjs,scripts/selftest.mjs
 scannedNonHistoricalFirstPartyFiles=545
 removedV1Tokens=4
 migrationAuditReferences=2
 liveRuntimeTestCommandConfigNavDeepLinkReferences=0
 ownerReadUnitAssertionPresent=true
 marketBriefScope=unchanged-protected-consumer
 wholeFileAuthorshipClaim=false
 PBRM_IMPLEMENT_CONSUMER_SWEEP_RESULT=PASS
 PBRM_IMPLEMENT_CONSUMER_SWEEP_END
 ```

 **Result:** PASS - the direct Palm and canonical Node consumers resolve the frozen API; both compatibility forms and owner-read omission pass; the live-reference scan is zero; and all 20 protected consumer surfaces match their latest pre-edit hashes without attributing foreign hunks.

 **Evidence Ref:** `report.md#raw-registered-command-receipt` contains the literal PBRM-UNIT, PBRM-VALIDATOR, no-argument PBRM-COMPAT, and legacy two-positional PBRM-COMPAT outputs.

- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns through the existing TP-01-05 PBRM-SELFTEST row. (DOD-01-SHARED-CANARY)

 **Phase:** test

 **Claim Source:** executed

 **Executed:** YES (in current session)

 **Commands:** `node --test tests/place-based-rental-market.contracts.unit.mjs`; `node scripts/validate-place-based-rental-market.mjs`; `node scripts/selftest.mjs`.

 **Exit Codes:** `0`; `0`; `0`.

 ```text
 PBRM_TEST_UNIT_BEGIN
 ℹ tests 15
 ℹ pass 15
 ℹ fail 0
 ℹ skipped 0
 ℹ todo 0
 PBRM_TEST_UNIT_EXIT=0
 PBRM_TEST_VALIDATOR_BEGIN
 [pbrm-validator] closed-schema-rejections=6/6
 [pbrm-validator] pair-leak=REJECTED
 [pbrm-validator] broad-to-luxury=REJECTED
 [pbrm-validator] findings=0
 [pbrm-validator] OK
 PBRM_TEST_VALIDATOR_EXIT=0
 PBRM_TEST_SELFTEST_BEGIN
 Feature 005 Place-Based Rental Market shared v2 foundation
 ✓ RLRENTAL CommonJS import exposes one frozen shared API
 ✓ RLRENTAL validates the sole generic policy and all four mandatory pairs
 ✓ RLRENTAL validates both synthetic markets with pair-isolated indexes
 ✓ RLRENTAL occupancy uses the exact clamped equation and rejects an invalid denominator
 ✓ RLRENTAL amortizing and zero-rate payment branches stay exact and finite
 ✓ RLRENTAL keeps insufficient luxury gates and sparse unknown coverage explicit
 ✓ RLRENTAL emits no delta or ranking across mismatched comparison bases
 ✓ RLRENTAL strict unavailable owner read omits invalid numerics
 ✓ RLRENTAL pure execution does not mutate RLDATA tool reads or resource state before mountRoute
 ✓ existing strict RLDATA putToolRead accepts the RLRENTAL outer envelope
 ✓ Palm route loads the shared shell in order with zero v1 runtime/config/fixture authority
 Feature 006 Trend Dynamics deterministic capability foundation
 Feature 010 Scope 1 company publication foundation
 Feature 010 Scope 2 derived metrics diagnostics and archetype-prioritized Simple cockpit
 Feature 010 Scope 3 linked model and user-owned accepted state
 Feature 010 Scope 4 Detailed workspaces peers export and committed owner read
 Feature 010 Scope 5 adaptive brief core ranking and append-only history
 Feature 010 Scope 7 CMG and JPM source-qualified archetype overlays
 Research-Lab self-test: 548 passed, 0 failed
 PBRM_TEST_SELFTEST_EXIT=0
 ```

 **Result:** PASS - PBRM-UNIT and the canonical validator passed first; TP-01-05 then ran the complete repository selftest with the single Feature 005 sentinel region and every unrelated group retained, before any focused or broad browser command ran.

 **Evidence Ref:** `report.md#scope-1-test-evidence-2026-07-17`.

 **Phase:** test

 **Claim Source:** executed

 **Commands:** Feature 005 sentinel/group/hash re-fence; `node --test tests/place-based-rental-market.contracts.unit.mjs`; `node scripts/validate-place-based-rental-market.mjs`; `node scripts/selftest.mjs`.

 **Exit Codes:** `0`; `0`; `0`; `0`.

 ```text
 PBRM_TEST_CONCURRENT_REFENCE_BEGIN
 1371:/* ---------- BEGIN FEATURE 005: Place-Based Rental Market shared v2 foundation ---------- */
 1373:  group('Feature 005 Place-Based Rental Market shared v2 foundation');
 1447:/* ---------- END FEATURE 005: Place-Based Rental Market shared v2 foundation ---------- */
 2299:  group('Feature 010 Scope 6 Feature 002 consume-once and registry discoverability');
 9c0831dda2c3b53597b0dc904eab8570533bad669b4fd6baaeff5179c8365094  scripts/selftest.mjs
 c20731f45acd47a46820c9d3d186c36635643015ce3d2f1a72acace823ec490a  tests/palm-springs-rental-market-lab.spec.mjs
 d1091bac049568e0c73e0ef5d48a69e753ad28a1cde40d7b80a85d1582d44f0c  palm-springs-rental-market-lab.html
 d28a4b47433701a75bb6dafb4c343a8a8a819063267522a07b98c9342ec562da  rlrental.js
 PBRM_TEST_CONCURRENT_REFENCE_RESULT=PASS
 PBRM_TEST_REFENCE_UNIT_EXIT=0
 PBRM_TEST_REFENCE_VALIDATOR_EXIT=0
 Feature 005 Place-Based Rental Market shared v2 foundation
 ✓ RLRENTAL CommonJS import exposes one frozen shared API
 ✓ RLRENTAL validates the sole generic policy and all four mandatory pairs
 ✓ RLRENTAL occupancy uses the exact clamped equation and rejects an invalid denominator
 ✓ RLRENTAL strict unavailable owner read omits invalid numerics
 Feature 010 Scope 6 Feature 002 consume-once and registry discoverability
 ✓ Feature 010 Scope 6 reads config, pointer, manifest, and owner object exactly once each
 ✓ Feature 010 Scope 6 registers the company route at one identical tools/index/nav position and exposes its Feature 002 deep link
 Research-Lab self-test: 553 passed, 0 failed
 PBRM_TEST_REFENCE_SELFTEST_EXIT=0
 selftestGroupCount=44
 PBRM_TEST_REFENCE_POSTRUN_RESULT=PASS
 ```

 **Current-Byte Result:** PASS - the concurrent selftest change is foreign and preserved; the unique Feature 005 sentinel and unchanged product/test hashes were re-fenced, all 44 current groups passed at 553/553, and the broad suite then reran green.

- [x] Rollback or restore path for shared infrastructure changes is documented and verified for the Feature 005 selftest sentinels, shared-module seam, unchanged Playwright runtime/config, and protected registry/docs surfaces. (DOD-01-SHARED-ROLLBACK)

 **Phase:** implement

 **Claim Source:** executed

 **Command:** current-session read-only Node discriminator using exact Feature 005 sentinels, direct-consumer discovery, Git clean checks, `git ls-files --deleted`, `git show HEAD:<path>`, SHA-256 hashing, and in-memory remove/reinsert reconstruction.

 **Exit Code:** `0`.

 ```text
 PBRM_IMPLEMENT_ROLLBACK_DISCRIMINATOR_BEGIN
 beginSentinelCount=1
 endSentinelCount=1
 feature005BlockBytes=8968
 feature005AssertCount=11
 inMemoryRemovalBytes=252886
 reconstructiveRoundTrip=true
 diskMutation=false
 selftestSha256=ee4f325f73da7d1549010225143ac6dc3212361eaf5a53952f0f9748eba00c1a
 directConsumerCount=4
 directConsumer=palm-springs-rental-market-lab.html
 directConsumer=scripts/selftest.mjs
 directConsumer=scripts/validate-place-based-rental-market.mjs
 directConsumer=tests/place-based-rental-market.contracts.unit.mjs
 playwrightProtected=package.json|status=CLEAN|sha256=6897a3e4afa6cb6d255860bbfbaf756d012e0a87faa5c23d7717af96a3af9e9d
 playwrightProtected=package-lock.json|status=CLEAN|sha256=0cd1a537e3601fcf4993cea14b03c59d219c4a1e8c0b4b60bd6ee440253b070b
 playwrightProtected=.npmrc|status=CLEAN|sha256=e414f7c7e7f51a71dde1ddf1f65892d01fe482bcca95846a3a349ff0a20903c6
 playwrightProtected=playwright.config.mjs|status=CLEAN|sha256=8c4beaf38397cdc44210c0dd4b7dc76c5da11fcde135573aa2db5642484cc386
 playwrightProtected=tests/playwright-runtime.mjs|status=CLEAN|sha256=70b68b970551e2473aab3817bf8cde6480d6ff2641cde9cbf2823ede2a69d0d4
 playwrightProtected=scripts/validate-node-source-lock.mjs|status=CLEAN|sha256=8567b62c52e04295d170491e303d594e6e4a9aee7571319b85ef4814bdaed82c
 v1Restore=palm-springs-rental-market.config.json|disk=ABSENT|trackedDeletion=true|headBytes=28733|headSha256=7e1589c901ba5e163c97c78d932cf399c3fd52a5082b4e5ef9feb6585fed2833
 v1Restore=tests/fixtures/palm-springs-rental-market/config.json|disk=ABSENT|trackedDeletion=true|headBytes=13359|headSha256=07f2d7677cbfb85318a7764ed87e0a220249699aa9e70061b35de65830ab18fe
 v1Restore=tests/fixtures/palm-springs-rental-market/current.payload.json|disk=ABSENT|trackedDeletion=true|headBytes=11995|headSha256=64b686b4375b9f767e64e82358bbd3b128a1eba1ace8f386a339357a4ea840c9
 v1Restore=tests/fixtures/palm-springs-rental-market/invalid.payload.json|disk=ABSENT|trackedDeletion=true|headBytes=4515|headSha256=dfd2df400ff78a80d20ecfec526c8f12bc53f98128d9aa12e4f5f15be1582b94
 protectedSurface=tools.json|status=M tools.json|sha256=3bad6ef5fd16b29595aed4c873ef22a38cd04eafbe6d0faf49782e07b96d7a8b
 protectedSurface=index.html|status=M index.html|sha256=4d20da32eacb2f293a469b81cb7afd34b408f1000ce25b159ddeb80cebb07ed3
 protectedSurface=rlnav.js|status=M rlnav.js|sha256=8c0d6349ba7138cddf7263b476e2519e545a150d0c0366233d4513d7da7d0e69
 protectedSurface=README.md|status=M README.md|sha256=8a6fa63f70f2be45bae7b8b956500db9a82d7409be421a5ad30e82007ce48960
 protectedSurface=notes/README.md|status=M notes/README.md|sha256=ccf529e42bac2e222b87436dcbc1f8e28e92890e402882ebf71b892bc60a704b
 protectedSurface=market-brief.payload.json|status=M market-brief.payload.json|sha256=c79327f323af4e1f767f58296bba64a38ac610248acfdbd005f88f982da3e206
 protectedSurface=.github/workflows/pages.yml|status=CLEAN|sha256=275f9166add14f0db2bc276de85b5413601ae16d38fbb354cb3f993791746eaf
 protectedSurface=.specify/memory/agents.md|status=CLEAN|sha256=c02c91764e33e7643a7def49d0a5b915df3e6181a0be39b78cd709974d454cdf
 protectedSurface=rldata.js|status=CLEAN|sha256=d7c233c03482ccdd493e5aca60deb9f528a338ba43f093e84685f80a406abd91
 protectedSurface=rlapp.js|status=CLEAN|sha256=55928a7aed39894bc997d3674d1a64de2ffc6257226a00c97768dc4e22471e9d
 protectedSurface=rlcontracts.js|status=CLEAN|sha256=1fa8a60ccf8db222dba3849edf137c51a1d2615d5db26602b673c730b61452c0
 protectedSurface=rlchart.js|status=CLEAN|sha256=4ece59bdc5698ac0e09842b59c6d5ef8d997925ba9eb702f441614a343599d2e
 protectedSurface=rlg.js|status=CLEAN|sha256=08f7efcc4cace971d24443bc4a5adae2cab3c72c38abc54adb96a1e69c46f91f
 restoreAction=read-only-git-show-plus-in-memory-reconstruction
 wholeFileAuthorshipClaim=false
 PBRM_IMPLEMENT_ROLLBACK_DISCRIMINATOR_RESULT=PASS
 PBRM_IMPLEMENT_ROLLBACK_DISCRIMINATOR_END
 ```

 **Result:** PASS - the exact selftest block reconstructs byte-for-byte without disk mutation, the four direct consumers are explicit, Playwright/source-lock bytes are Git-clean, each removed v1 path is independently recoverable from `HEAD`, and pre-existing protected registry/docs/shared-shell bytes remain outside this repair.

- [x] **DOD-01-C01:** Valid RED predates source edits.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** pre-production existence assertions and SHA-256 receipt over the persistent RED corpus

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_RED_BOUNDARY_BEGIN
 rlrental.js=ABSENT
 production-config=ABSENT
 unit-test-sha256=c8c219cc50b885c0bfa5efa82289af74b6742b4f39a4bcd95444cdbbbcc8b6d1
 browser-test-sha256=c20731f45acd47a46820c9d3d186c36635643015ce3d2f1a72acace823ec490a
 fixture-config-sha256=27f19eab2c7a27052326357c1f9dbea4d952ad2a52125769545218f20cbf3319
 fixture-palm-sha256=c9297448a94f754fd2772904e8ac33cc144769e55458cb7f621b5047adfa8415
 fixture-ocean-sha256=276fd40d0d431cf9b45d628fff2217048850d86d19c0e1dff21bf20277feb85e
 fixture-corpus-json=PARSED_BY_RED_TEST
 red-failure-code=MODULE_NOT_FOUND
 red-exit=1
 PBRM_SCOPE1_RED_BOUNDARY_END
 ```

 **Result:** PASS - current hashes and absent production paths prove the valid RED predates source edits.

- [x] **DOD-01-C02:** Shared v2 contracts/model/controller boundary matches design and contains no research facts.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `node scripts/validate-place-based-rental-market.mjs`

 **Exit Code:** 0

 ```text
 [pbrm-validator] production-config=PASS path=place-based-rental-market.config.json
 [pbrm-validator] fixture-config=PASS path=tests/fixtures/place-based-rental-market/config.v2.json
 [pbrm-validator] closed-schema-rejections=6/6
 [pbrm-validator] unsafe-source-matrix=PASS cases=7
 [pbrm-validator] palm-script-order=PASS
 [pbrm-validator] palm-duplicate-contract-logic=NONE
 [pbrm-validator] palm-route-adapter=PASS
 [pbrm-validator] compatibility-delegation=PASS
 [pbrm-validator] production-payloads=NOT_APPLICABLE_SCOPE_1
 [pbrm-validator] ocean-production-route=NOT_APPLICABLE_SCOPE_1
 [pbrm-validator] findings=0
 [pbrm-validator] OK
 PBRM_SCOPE1_CANONICAL_VALIDATOR_EXIT=0
 PBRM_SCOPE1_CANONICAL_VALIDATOR_END
 ```

 **Result:** PASS - the closed shared contracts, controller adapter, source-safety matrix, and no-production-payload boundary are current and green.

- [x] **DOD-01-C03:** Five protected titles remain exact but now prove v2.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` plus the current-session protected-title identity assertion

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_PROTECTED_TITLES_BEGIN
 protectedTitles=5
 Regression: SCN-005-002 missing configuration blocks payload fetch and every output planCount=2 testCount=1
 Regression: SCN-005-004 invalid payload produces errors and no conclusion planCount=2 testCount=1
 Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator planCount=2 testCount=1
 Regression: SCN-005-008 buyer economics use standard amortization in one result planCount=2 testCount=1
 Regression: SCN-005-009 zero-rate financing stays finite planCount=2 testCount=1
 testScenarioTitles=9
 protectedPlanPresence=true
 protectedTestUniqueness=true
 broadSuiteCurrentCount=9
 PBRM_SCOPE1_PROTECTED_TITLES_RESULT=PASS
 PBRM_SCOPE1_PROTECTED_TITLES_END
 ```

 **Result:** PASS - all five protected names remain exact and unique in the live suite, and the current nine-test system-Chrome run executed them against v2 behavior.

- [x] **DOD-01-C04:** V1 migration/removal and live-reference proof are complete; history is untouched.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** current-session physical deletion, nonhistorical exact-token scan, and post-report preservation-hash assertions

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_PHYSICAL_DELETION_BEGIN
 expectedPaths=4
 gitDeletionRows=4
 path=palm-springs-rental-market.config.json physical=ABSENT gitStatus=D
 path=tests/fixtures/palm-springs-rental-market/config.json physical=ABSENT gitStatus=D
 path=tests/fixtures/palm-springs-rental-market/current.payload.json physical=ABSENT gitStatus=D
 path=tests/fixtures/palm-springs-rental-market/invalid.payload.json physical=ABSENT gitStatus=D
 allPhysicalAbsent=true
 allTrackedDeletions=true
 PBRM_SCOPE1_ZERO_LIVE_V1_REFERENCE_BEGIN
 scannedNonHistoricalFiles=1167
 migrationAuditReferences=2
 liveRuntimeTestCommandReferences=0
 PBRM_SCOPE1_ZERO_LIVE_V1_REFERENCE_RESULT=PASS
 PBRM_SCOPE1_POST_REPORT_PRESERVATION_BEGIN
 historicalUnchanged=true
 auditAttempts=3
 auditUnchanged=true
 executionHistoryEntries=20
 executionHistoryUnchanged=true
 PBRM_SCOPE1_POST_REPORT_PRESERVATION_RESULT=PASS
 ```

 **Result:** PASS - all obsolete paths are tracked deletions, zero live authority references remain, and the complete historical report/audit/history bytes match their pre-edit hashes.

- [x] **DOD-01-C05:** Shared-file fences/sentinels/canaries/rollback preserve foreign bytes.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** current-session Node hunk-classification and in-memory sentinel rollback assertions over `scripts/selftest.mjs`

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_SELFTEST_CONTAINMENT_BEGIN
 beginSentinelCount=1
 endSentinelCount=1
 beginLine=1370
 endLine=1446
 diffHunks=5
 hunk1=+180..402 class=foreign-preserved
 hunk2=+1370..1370 class=feature-005-sentinel
 hunk3=+1372..1402 class=feature-005-sentinel
 hunk4=+1404..1446 class=feature-005-sentinel
 hunk5=+2256..2306 class=foreign-preserved
 feature005Hunks=3
 foreignPreservedHunks=2
 mixedOverlapHunks=0
 featureReferencesOutsideSentinel=0
 fullFileSha256=8a606ca73156efa00e9bd69d07619d6c855c67e292378071c45f79f922d79524
 PBRM_SCOPE1_SELFTEST_CONTAINMENT_RESULT=PASS
 PBRM_SCOPE1_ROLLBACK_SIMULATION_RESULT=PASS
 diskMutation=false
 ```

 **Result:** PASS - every Feature 005 hunk is wholly sentinel-bounded, both unrelated hunks remain foreign, and the exact rollback leaves prefix, suffix, and on-disk bytes unchanged.

- [x] **DOD-01-TP-01-01:** TP-01-01 RED is recorded.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `node --test tests/place-based-rental-market.contracts.unit.mjs`

 **Exit Code:** 1 (expected RED)

 ```text
 PASS Scope 1 v2 fixture corpus parses before production module loading
 FAIL RLRENTAL owns the complete shared v2 foundation contract
 tests 2
 suites 0
 pass 1
 fail 1
 cancelled 0
 skipped 0
 todo 0
 Error: Cannot find module '../rlrental.js'
 Require stack:
 - tests/place-based-rental-market.contracts.unit.mjs
 code: 'MODULE_NOT_FOUND'
 PBRM_RED_EXIT=1
 ```

 **Result:** EXPECTED RED - fixtures parsed and the runner started; only the planned production module was absent.

- [x] **DOD-01-TP-01-02:** TP-01-02 passes.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `node --test tests/place-based-rental-market.contracts.unit.mjs`

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_UNIT_GREEN_BEGIN
 ✔ Scope 1 v2 fixture corpus parses before production module loading (4.3935ms)
 ▶ RLRENTAL owns the complete shared v2 foundation contract
   ✔ exports the frozen browser and Node API without hidden authority (0.424292ms)
   ✔ validates and indexes the closed config without mutating input (0.95825ms)
   ✔ rejects every closed-schema mutation with deterministic code and path (1.04375ms)
   ✔ validates both synthetic market payloads and isolates pair indexes (0.482667ms)
   ✔ requires every composite luxury gate and never promotes five bedrooms alone (0.310458ms)
   ✔ keeps sparse and unknown coverage explicit without multiplying marginals (0.339458ms)
   ✔ rejects whole-market evidence copied into an observed luxury field (0.529833ms)
   ✔ emits deltas only for fully aligned comparison bases (3.184542ms)
   ✔ applies occupancy, effective-night, amortizing, and zero-rate equations exactly (0.329583ms)
   ✔ keeps incomplete costs partial and coastal controls deterministic (0.4095ms)
   ✔ uses canonical identity and omits invalid owner-read numerics (0.301625ms)
   ✔ rejects unsafe source URLs while leaving script-like text inert data (0.280666ms)
 ✔ RLRENTAL owns the complete shared v2 foundation contract (12.315333ms)
 ℹ tests 14
 ℹ pass 14
 ℹ fail 0
 PBRM_SCOPE1_UNIT_GREEN_EXIT=0
 PBRM_SCOPE1_UNIT_GREEN_END
 ```

 **Result:** PASS - all 14 production-function unit assertions passed.

- [x] **DOD-01-TP-01-03:** TP-01-03 passes.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `node scripts/validate-place-based-rental-market.mjs`

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_CANONICAL_VALIDATOR_BEGIN
 [pbrm-validator] production-config=PASS path=place-based-rental-market.config.json
 [pbrm-validator] fixture-config=PASS path=tests/fixtures/place-based-rental-market/config.v2.json
 [pbrm-validator] palm-fixture=PASS units=2
 [pbrm-validator] ocean-fixture=PASS units=2
 [pbrm-validator] closed-schema-rejections=6/6
 [pbrm-validator] pair-leak=REJECTED
 [pbrm-validator] broad-to-luxury=REJECTED
 [pbrm-validator] occupancy-equation=PASS value=0.35200000000000004
 [pbrm-validator] occupancy-denominator=REJECTED
 [pbrm-validator] amortization=PASS branch=amortizing
 [pbrm-validator] zero-rate=PASS branch=zero-rate
 [pbrm-validator] unsafe-source-matrix=PASS cases=7
 [pbrm-validator] v1-field-classification=PASS fields=17 legacyPresent=false
 [pbrm-validator] findings=0
 [pbrm-validator] OK
 PBRM_SCOPE1_CANONICAL_VALIDATOR_EXIT=0
 PBRM_SCOPE1_CANONICAL_VALIDATOR_END
 ```

 **Result:** PASS - valid fixtures, adversarial rejection, source safety, equations, and the 17-field v1 classification all passed with zero findings.

- [x] **DOD-01-TP-01-04:** TP-01-04 passes.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `node scripts/validate-palm-springs-rental-market.mjs`; `node scripts/validate-palm-springs-rental-market.mjs tests/fixtures/place-based-rental-market/palm.valid.payload.json tests/fixtures/place-based-rental-market/config.v2.json`

 **Exit Code:** 0; 0

 ```text
 PBRM_SCOPE1_COMPAT_NOARG_BEGIN
 [pbrm-compat] command-shape=no-argument
 [pbrm-compat] expected-market=palm-springs-ca
 [pbrm-compat] delegate=scripts/validate-place-based-rental-market.mjs
 [pbrm-validator] v1-field-classification=PASS fields=17 legacyPresent=false
 [pbrm-validator] findings=0
 [pbrm-compat] findings=0
 [pbrm-compat] OK
 PBRM_SCOPE1_COMPAT_NOARG_EXIT=0
 PBRM_SCOPE1_COMPAT_LEGACY_BEGIN
 [pbrm-compat] command-shape=legacy-two-positional
 [pbrm-validator] input-mode=legacy-two-argument-candidate
 [pbrm-validator] candidate-config=tests/fixtures/place-based-rental-market/config.v2.json
 [pbrm-validator] candidate-payload=tests/fixtures/place-based-rental-market/palm.valid.payload.json
 [pbrm-validator] candidate-market=palm-springs-ca
 [pbrm-validator] candidate=PASS
 [pbrm-compat] findings=0
 [pbrm-compat] OK
 PBRM_SCOPE1_COMPAT_LEGACY_EXIT=0
 ```

 **Result:** PASS - both preserved command shapes delegate to the canonical validator and return zero findings.

- [x] **DOD-01-TP-01-05:** TP-01-05 passes.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `node scripts/selftest.mjs`

 **Exit Code:** 0

 ```text
 Feature 005 Place-Based Rental Market shared v2 foundation
   ✓ RLRENTAL CommonJS import exposes one frozen shared API
   ✓ RLRENTAL validates the sole generic policy and all four mandatory pairs
   ✓ RLRENTAL validates both synthetic markets with pair-isolated indexes
   ✓ RLRENTAL occupancy uses the exact clamped equation and rejects an invalid denominator
   ✓ RLRENTAL amortizing and zero-rate payment branches stay exact and finite
   ✓ RLRENTAL keeps insufficient luxury gates and sparse unknown coverage explicit
   ✓ RLRENTAL emits no delta or ranking across mismatched comparison bases
   ✓ RLRENTAL strict unavailable owner read omits invalid numerics
   ✓ RLRENTAL pure execution does not mutate RLDATA tool reads or resource state before mountRoute
   ✓ existing strict RLDATA putToolRead accepts the RLRENTAL outer envelope
   ✓ Palm route loads the shared shell in order with zero v1 runtime/config/fixture authority
 ================================================
 Research-Lab self-test: 544 passed, 0 failed
 ================================================
 PBRM_SCOPE1_SELFTEST_GREEN_EXIT=0
 PBRM_SCOPE1_SELFTEST_GREEN_END
 ```

 **Result:** PASS - all Feature 005 canaries and every unrelated repository group passed at the current concurrent count of 544/0.

- [x] **DOD-01-TP-01-06:** TP-01-06 proves SCN-005-002 Missing configuration blocks the product: given required v2 configuration is missing or unreadable, when either route boots, then configuration is unavailable, no payload request occurs, and no market, segment, result, or owner-read metric is substituted.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_SYSTEM_CHROME_BEGIN
 Running 9 tests using 1 worker
 [SCN-005-002] truth=INVALID CONFIGURATION
 [SCN-005-002] code=PBRM-CONFIG-FETCH
 [SCN-005-002] configRequests=1
 [SCN-005-002] payloadRequests=0
 [SCN-005-002] ownerReadPublished=false
 [SCN-005-002] substituteOutputs=0
 9 passed (3.8s)
 PBRM_SCOPE1_SYSTEM_CHROME_EXIT=0
 PBRM_SCOPE1_SYSTEM_CHROME_END
 ```

 **Result:** PASS - missing configuration made one config request, zero payload requests, and published no substitute output or owner read.

- [x] **DOD-01-TP-01-07:** TP-01-07 proves SCN-005-004 An invalid payload produces no conclusion: given a market payload violates schema, pair, category, qualification, reference, or bound rules, when shared validation runs, then specific errors appear and no thesis, projection, deterministic result, or numeric owner-read metric is produced.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_SYSTEM_CHROME_BEGIN
 Running 9 tests using 1 worker
 [SCN-005-004] truth=INVALID PAYLOAD
 [SCN-005-004] code=PBRM-PAYLOAD-PAIR-LEAK
 [SCN-005-004] payloadAccepted=false
 [SCN-005-004] modelVisible=false
 [SCN-005-004] ownerReadPublished=false
 9 passed (3.8s)
 PBRM_SCOPE1_SYSTEM_CHROME_EXIT=0
 PBRM_SCOPE1_SYSTEM_CHROME_END
 ```

 **Result:** PASS - the invalid pair-leak payload was rejected with no model or owner-read conclusion.

- [x] **DOD-01-TP-01-08:** TP-01-08 proves SCN-005-006 Demand and supply shocks obey the bounded occupancy equation: given finite base occupancy and configured demand and supply deltas, when shared occupancy computation runs, then the exact clamped demand-over-supply equation applies and an invalid denominator returns unavailable without a number.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** 0

 ```text
 Running 9 tests using 1 worker
 [SCN-005-006] base=0.40
 [SCN-005-006] demandDelta=0.10
 [SCN-005-006] supplyDelta=0.25
 [SCN-005-006] adjustedOccupancy=0.35200000000000004
 [SCN-005-006] expected=0.35200000000000004
 [SCN-005-006] invalidCode=PBRM-MODEL-OCCUPANCY-DENOMINATOR
 [SCN-005-006] invalidNumeric=false
 9 passed (3.8s)
 PBRM_SCOPE1_SYSTEM_CHROME_EXIT=0
 PBRM_SCOPE1_SYSTEM_CHROME_END
 ```

 **Result:** PASS - the rendered proof matched the exact equation and emitted no number for the invalid denominator.

- [x] **DOD-01-TP-01-09:** TP-01-09 proves SCN-005-008 Buyer economics use standard amortizing debt service: given a positive price, valid down payment, finite rate, and positive term, when shared buyer economics run, then standard amortization, gross yield, explicit costs, and pre-tax cash flow share one unrounded pair result.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** 0

 ```text
 [SCN-005-008] branch=amortizing
 [SCN-005-008] principal=400000
 [SCN-005-008] monthlyPaymentUsd=2398.2021006110276
 [SCN-005-008] annualDebtServiceUsd=28778.42520733233
 [SCN-005-008] grossYield=0.10278400000000001
 [SCN-005-008] variableOperatingCostUsd=17987.2
 [SCN-005-008] fixedRiskCostUsd=10000
 [SCN-005-008] totalOperatingCostUsd=27987.2
 [SCN-005-008] preTaxCashFlowUsd=-5373.625207332323
 9 passed (3.8s)
 PBRM_SCOPE1_SYSTEM_CHROME_EXIT=0
 PBRM_SCOPE1_SYSTEM_CHROME_END
 ```

 **Result:** PASS - standard amortization, debt service, explicit cost composition, yield, and signed cash flow share one result.

- [x] **DOD-01-TP-01-10:** TP-01-10 proves SCN-005-009 Zero-rate financing remains finite: given positive principal, zero annual rate, and a positive payment count, when shared debt service runs, then monthly principal equals principal divided by payments and annual debt service and cash flow remain finite.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_SYSTEM_CHROME_BEGIN
 Running 9 tests using 1 worker
 [SCN-005-009] branch=zero-rate
 [SCN-005-009] principal=400000
 [SCN-005-009] payments=360
 [SCN-005-009] monthlyPaymentUsd=1111.111111111111
 [SCN-005-009] annualDebtServiceUsd=13333.333333333332
 [SCN-005-009] preTaxCashFlowUsd=10071.466666666674
 [SCN-005-009] finite=true
 9 passed (3.8s)
 PBRM_SCOPE1_SYSTEM_CHROME_EXIT=0
 PBRM_SCOPE1_SYSTEM_CHROME_END
 ```

 **Result:** PASS - the zero-rate branch divided principal by 360 and kept debt service and cash flow finite.

- [x] **DOD-01-TP-01-11:** TP-01-11 proves SCN-005-020 Five bedrooms alone do not qualify luxury: given a property has at least five bedrooms, when large-luxury membership is evaluated, then entire-home status and every configured luxury gate must pass, while marketing, price, bedroom count, one amenity, or a missing gate cannot qualify it.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_SYSTEM_CHROME_BEGIN
 Running 9 tests using 1 worker
 [SCN-005-020] bedrooms=5
 [SCN-005-020] rentalType=entire-home
 [SCN-005-020] sampleN=4
 [SCN-005-020] premiumAttributes=1
 [SCN-005-020] disposition=UNKNOWN
 [SCN-005-020] broadSubstitution=false
 9 passed (3.8s)
 PBRM_SCOPE1_SYSTEM_CHROME_EXIT=0
 PBRM_SCOPE1_SYSTEM_CHROME_END
 ```

 **Result:** PASS - five bedrooms plus one premium attribute remained UNKNOWN rather than being promoted to luxury.

- [x] **DOD-01-TP-01-12:** TP-01-12 proves SCN-005-021 Sparse segment evidence remains visible: given a luxury candidate or qualifying intersection is sparse or unknown, when a thesis, metric, forecast, acquisition baseline, or comparison is produced, then counts, sample size, denominator and method, missing fields, and confidence consequence remain visible and never appear complete.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_SYSTEM_CHROME_BEGIN
 Running 9 tests using 1 worker
 [SCN-005-021] state=SPARSE
 [SCN-005-021] candidateCount=12
 [SCN-005-021] qualifyingCount=UNKNOWN
 [SCN-005-021] metricSampleN=UNKNOWN
 [SCN-005-021] coverageRatio=UNKNOWN
 [SCN-005-021] completeLabel=false
 9 passed (3.8s)
 PBRM_SCOPE1_SYSTEM_CHROME_EXIT=0
 PBRM_SCOPE1_SYSTEM_CHROME_END
 ```

 **Result:** PASS - sparse counts and unknown denominator/sample/ratio remained visible and never appeared complete.

- [x] **DOD-01-TP-01-13:** TP-01-13 proves SCN-005-022 Whole-market performance cannot become observed luxury performance: given broad performance or all-home prices exist while matching luxury observations do not, when large-luxury analysis is produced, then no broad value is copied, multiplied, or premium-adjusted into an observed segment field and the field remains unknown or an explicit assumption.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_SYSTEM_CHROME_BEGIN
 Running 9 tests using 1 worker
 [SCN-005-022] observedLuxuryOccupancy=UNKNOWN
 [SCN-005-022] observedLuxuryAdrUsd=UNKNOWN
 [SCN-005-022] observedLuxuryRevenueUsd=UNKNOWN
 [SCN-005-022] wholeMarketContext=0.4
 [SCN-005-022] contextOnly=true
 [SCN-005-022] premiumMultiplierUsed=false
 9 passed (3.8s)
 PBRM_SCOPE1_SYSTEM_CHROME_EXIT=0
 PBRM_SCOPE1_SYSTEM_CHROME_END
 ```

 **Result:** PASS - whole-market occupancy remained context-only and no observed luxury metric or premium multiplier was invented.

- [x] **DOD-01-TP-01-14:** TP-01-14 proves SCN-005-023 Segment and market deltas require aligned bases: given two values are selected for comparison, when complete basis signatures are checked, then a delta appears only when every required field aligns, otherwise INCOMPARABLE names mismatches and emits no delta or ranking.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_SYSTEM_CHROME_BEGIN
 Running 9 tests using 1 worker
 [SCN-005-023] state=INCOMPARABLE
 [SCN-005-023] reason=METRIC_DEFINITION
 [SCN-005-023] reason=POPULATION
 [SCN-005-023] reason=SEGMENT_QUALIFICATION
 [SCN-005-023] absoluteDelta=UNKNOWN
 [SCN-005-023] ranking=UNKNOWN
 9 passed (3.8s)
 PBRM_SCOPE1_SYSTEM_CHROME_EXIT=0
 PBRM_SCOPE1_SYSTEM_CHROME_END
 ```

 **Result:** PASS - basis mismatches produced named INCOMPARABLE reasons with no delta or ranking.

- [x] **DOD-01-TP-01-15:** TP-01-15 broad suite passes.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** 0

 ```text
 PBRM_SCOPE1_SYSTEM_CHROME_BEGIN
 Running 9 tests using 1 worker
   ✓  1 …-002 missing configuration blocks payload fetch and every output (677ms)
   ✓  2 …n: SCN-005-004 invalid payload produces errors and no conclusion (220ms)
   ✓  3 …006 occupancy equation clamps and rejects an invalid denominator (265ms)
   ✓  4 …-005-008 buyer economics use standard amortization in one result (196ms)
   ✓  5 …138:1 › Regression: SCN-005-009 zero-rate financing stays finite (205ms)
   ✓  6 …gression: SCN-005-020 five bedrooms alone never qualifies luxury (200ms)
   ✓  7 … Regression: SCN-005-021 sparse segment evidence remains visible (186ms)
   ✓  8 …022 whole-market values never become observed luxury performance (189ms)
   ✓  9 …ion: SCN-005-023 deltas require aligned market and segment bases (176ms)
 9 passed (3.8s)
 PBRM_SCOPE1_SYSTEM_CHROME_EXIT=0
 PBRM_SCOPE1_SYSTEM_CHROME_END
 ```

 **Result:** PASS - the complete current Scope 1 real-HTTP system-Chrome suite passed 9/9 in one serial worker.

- [x] **DOD-01-Q01:** Boundary, diagnostics, lint/freshness, G094, parity, and traceability pass before Scope 2.

 **Phase:** implement

 **Claim Source:** executed

 **Commands:** `bash .github/bubbles/scripts/artifact-lint.sh specs/005-palm-springs-rental-market-lab`; `bash .github/bubbles/scripts/artifact-freshness-guard.sh specs/005-palm-springs-rental-market-lab`; `bash .github/bubbles/scripts/capability-foundation-guard.sh specs/005-palm-springs-rental-market-lab`; `bash .github/bubbles/scripts/traceability-guard.sh specs/005-palm-springs-rental-market-lab`; exact planner-owned `TP-05-12` command loaded from `test-plan.json`; `bash .github/bubbles/scripts/cli.sh framework-write-guard`; `bash .github/bubbles/scripts/cli.sh doctor`; `bash .github/bubbles/scripts/cli.sh repo-readiness .`; `bash .github/bubbles/scripts/implementation-reality-scan.sh specs/005-palm-springs-rental-market-lab --verbose`; `bash .github/bubbles/scripts/framework-dogfood-guard.sh`; `bash .github/bubbles/scripts/discovered-issue-disposition-guard.sh specs/005-palm-springs-rental-market-lab`; VS Code diagnostics for all three changed code files and all three edited artifacts.

 **Exit Codes:** all commands `0`; diagnostics zero findings.

 ```text
 Artifact lint PASSED.
 RESULT: PASS (0 failures, 0 warnings)
 capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
 DoD fidelity: 29 scenarios checked, 29 mapped to DoD, 0 unmapped
 RESULT: PASSED (0 warnings)
 testPlanId=TP-05-12
 commandSha256=e6f364c1ddca88d1bd128f3cd583687b4daac1880428f7ef1447924700694c66
 gherkin=28
 scenarioRows=28
 supportRows=31
 jsonRows=59
 manifestRows=28
 findings=0
 declaredCommandExit=0
 Managed-file integrity: downstream framework-managed files still match the installed upstream snapshot
 Result: 17 passed, 0 failed, 1 advisory
 Summary: pass=9 warn=0 fail=0
 Files scanned: 37
 Violations: 0
 Warnings: 1
 PASS Gate G085 (framework_dogfood_evidence_gate) decisionCode=G085-FIRST-ADOPTION
 G095: discovered-issue disposition clean (no unfiled deferrals)
 diagnostics=0 findings across rlrental.js, unit validator, canonical validator, scopes.md, report.md, state.json
 ```

 **Result:** PASS - every Scope 1 boundary, diagnostic, artifact, G094, exact 59-row parity, and traceability obligation is current and green. G028's one design-fallback warning and Doctor's one observability advisory are preserved honestly. Scope 1 remains In Progress under `TR-005-S01-AUDIT-A4-TEST-20260717`; routing order is `bubbles.test`, then `bubbles.audit`. Scope 2 remains Not Started.

---

## Scope 2: Four-Unit Online Research And Production Payloads

**Status:** Done

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `research:true`

**Depends On:** Scope 1

**Primary Outcome:** Real online research independently covers Palm whole, Palm large-luxury, Ocean whole, and Ocean large-luxury; two production payloads expose source/rights/change/unknown truth without filling unavailable luxury evidence; one shared runbook/prompt leaves proposals uncommitted.

### Gherkin Scenarios

```gherkin
Scenario: SCN-005-001 Agent refresh performs sourced online research
Given valid v2 configuration and a manual place-based rental research refresh
When the agent investigates both segments in both markets through current online sources
Then all four units and nine categories receive independent eligible or attempted evidence, validate, and remain uncommitted for review

Scenario: SCN-005-013 Previous-refresh changes require a prior payload
Given a valid prior unit exists for the same pair
When a new matching unit is authored
Then every material entity is classified exactly once and every assumption revision cites eligible evidence

Scenario: SCN-005-014 First refresh invents no change history
Given no prior valid unit exists for the same pair
When the first unit is authored
Then change mode is baseline with null prior identity, zero records, and no prior-relative direction claim

Scenario: SCN-005-015 Failed research never becomes fabricated data
Given a required source is inaccessible or unverifiable
When the refresh completes
Then the category records attempted context and consequence while no snippet, prior value, quote, sample, source, or inference is invented

Scenario: SCN-005-016 Observed evidence, assumptions, inference, and scenario output remain distinct
Given a unit contains historical evidence, assumptions, inference, and projected output
When the records validate and render
Then each carries one visible class with proper lineage and user output never becomes research

Scenario: SCN-005-026 Research refresh accounts for all four mandatory units
Given a manual refresh starts and one or more pairs lack eligible evidence
When the four units are assembled
Then every unit still receives independent coverage and attempts and no unit inherits another unit's status, sample, source, or prior result

Scenario: SCN-005-027 Segment acquisition baselines disclose sample and status
Given active asks, closed sales, or broad prices are available
When an acquisition baseline is proposed
Then pair, status, filters, deduplication, sample size, statistic, range, period, exclusions, and legal unknowns are disclosed and only a clean matching sample can yield a baseline

Scenario: SCN-005-028 Remaining-2026 and 2027 scenarios are falsifiable, not factual
Given a pair has aligned evidence or an explicit baseline gap
When remaining-2026 and 2027 scenarios are authored
Then baseline, assumptions, inference, output, method and version, sample coverage, source support, confidence, and pair-specific falsifiers remain distinct and low-coverage output is assumption-driven or unavailable
```

### Implementation Plan

1. Add one detailed runbook and concise prompt; exact write set is two production payloads.
2. Stop on unreviewed payload diffs and resolve a matching prior or baseline.
3. Research four units x nine categories online with exact source clocks/scope/method/access/rights/attempt consequences.
4. Author both envelopes; absent source-qualified luxury performance stays sparse/unknown.
5. Prevent broad observations, independent marginals, active asks, legal counts, and context geographies from becoming luxury observations/baselines.
6. Author 2026/2027 scenarios only with aligned baseline or explicit gap and falsifiers.
7. Validate; restore only invocation-owned invalid bytes; leave valid proposals `UNCOMMITTED FOR REVIEW`; never stage/commit/push/deploy.

### Test Plan

| ID | Type | Category | Command | DoD ID | Exact Behavior |
| --- | --- | --- | --- | --- | --- |
| TP-02-01 | contract | functional | PBRM-VALIDATOR | DOD-02-TP-02-01 | Both production payloads contain four exact pair-local graphs. |
| TP-02-02 | contract | source-safety | PBRM-VALIDATOR | DOD-02-TP-02-02 | URL credential and token safety, rights, roles, geography, population, methods, and reverse references are enforced. |
| TP-02-03 | functional | no-auto-commit | PBRM-VALIDATOR | DOD-02-TP-02-03 | One runbook and prompt enforce two-payload writes, dirty-proposal refusal, invocation-only restore, review receipt, and no commit, push, or deploy. |
| TP-02-12 | e2e-ui | broad-regression | PBRM-E2E | DOD-02-TP-02-12 | Full suite passes after both production payloads and research truth states land. |

| Test Type | Scenario ID | Test Plan ID | Concrete Test File | Exact Persistent Title | Command ID | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| e2e-ui | SCN-005-001 | TP-02-04 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-001 researched payload exposes four truthful units and no fixture authority` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-013 | TP-02-05 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-013 compared refresh accounts for every material entity by pair` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-014 | TP-02-06 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-014 baseline refresh invents no prior change` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-015 | TP-02-07 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-015 inaccessible research remains unknown without a value` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-016 | TP-02-08 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-016 observed assumptions inference and modeled outputs stay distinct` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-026 | TP-02-09 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-026 refresh accounts independently for all four mandatory units` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-027 | TP-02-10 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-027 acquisition baselines disclose sample status and legal unknowns` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-028 | TP-02-11 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-028 remaining-2026 and 2027 scenarios remain falsifiable not factual` | focused PBRM-E2E | Yes |

### Definition of Done

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior protect all eight Scope 2 scenarios (SCN-005-001, SCN-005-013, SCN-005-014, SCN-005-015, SCN-005-016, SCN-005-026, SCN-005-027, and SCN-005-028) through TP-02-04..11 without changing their eight exact persistent titles. (DOD-02-E2E-SCENARIO)

 **Phase:** test

 **Claim Source:** executed

 **Commands:** the eight exact TP-02-04..11 `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "<exact persistent title>" --reporter=list` commands, each run in an individual invocation and in Test Plan order.

 **Exit Code:** `0` for all eight commands

 ```text
 Running 1 test using 1 worker
 [SCN-005-001] markets=2
 [SCN-005-001] units=4
 [SCN-005-001] categoriesPerUnit=9
 [SCN-005-001] fixtureAuthority=false
 [SCN-005-001] proposalState=UNCOMMITTED FOR REVIEW
   1 passed (1.5s)
 Running 1 test using 1 worker
 [SCN-005-013] authority=TEST FIXTURE SYNTHETIC
 [SCN-005-013] priorUnitMatch=true
 [SCN-005-013] changeRecords=11
 [SCN-005-013] materialEntities=11
 [SCN-005-013] complete=true
   1 passed (938ms)
 Running 1 test using 1 worker
 [SCN-005-014] priorMode=baseline
 [SCN-005-014] priorUnitIds=NONE
 [SCN-005-014] changeRecords=0
 [SCN-005-014] priorRelativeClaims=0
   1 passed (1.4s)
 Running 1 test using 1 worker
 [SCN-005-015] unitsWithAttempts=4
 [SCN-005-015] attemptedStates=inaccessible-or-rejected
 [SCN-005-015] numericValue=ABSENT
 [SCN-005-015] positiveSubstitution=false
   1 passed (1.0s)
 Running 1 test using 1 worker
 [SCN-005-016] visibleClasses=OBSERVED,ASSUMPTION,INFERENCE,MODELED OUTPUT
 [SCN-005-016] observedLineage=eligible source
 [SCN-005-016] modeledLineage=forecast method + assumptions + inference + falsifier
   1 passed (1.4s)
 Running 1 test using 1 worker
 [SCN-005-026] receipts=4
 [SCN-005-026] duplicateIds=0
 [SCN-005-026] foreignIds=0
 [SCN-005-026] inheritedIdentity=false
 [SCN-005-026] categories=9/9
   1 passed (1.4s)
 Running 1 test using 1 worker
 [SCN-005-027] luxurySamples=2
 [SCN-005-027] sampleStates=sparse,unclean
 [SCN-005-027] legalUnknowns=visible
 [SCN-005-027] baseline=unavailable
   1 passed (974ms)
 Running 1 test using 1 worker
 [SCN-005-028] wholeMarketScenarios=8
 [SCN-005-028] luxurySensitivityScenarios=2
 [SCN-005-028] methodsCoverageConfidenceFalsifiers=visible
 [SCN-005-028] observedFact=false
   1 passed (1.1s)
 ```

 **Visible-fidelity audit output:**

 ```text
 PBRM_SCOPE2_CURRENT_VISIBLE_FIDELITY_AUDIT_BEGIN
 SCN-005-001 receipt=#researchInventoryReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 SCN-005-013 receipt=#changeAccountingAuditReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 SCN-005-014 receipt=#changeAccountingAuditReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 SCN-005-015 receipt=#attemptedResearchReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 SCN-005-016 receipt=#evidenceClassAuditReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 SCN-005-026 receipt=#unitIndependenceReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 SCN-005-027 receipt=#acquisitionAuditReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 SCN-005-028 receipt=#scenarioAuditReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 directVisibleAssertionsTotal=8
 rawScope2ObjectReads=0
 testDomWrites=0
 SCN-005-013 comparedChecks=8/8
 SCN-005-013 expectsComparedZero=false
 SCN-005-013 validPriorBranchExercised=true
 pageOrContextInterception=0
 serviceWorkerPatterns=0
 skipOnlyTodoPatterns=0
 testBodySilentReturns=0
 serverCreateCount=1
 serverLoopbackEphemeral=true
 serverNoStore=true
 serverStreamsRepositoryFiles=true
 visibleFidelityFindings=0
 PBRM_SCOPE2_CURRENT_VISIBLE_FIDELITY_AUDIT_END
 ```

 **Result:** PASS - all eight focused real-HTTP system-Chrome commands discovered and passed one exact scenario each, and the accepted semantic audit proves eight direct production-rendered DOM receipts, zero raw Scope 2 object reads, zero test DOM writes, a non-vacuous 11-record SCN-005-013 compared branch, and zero interception, service-worker, skip/only/todo, or silent-pass findings.

- [x] Broader E2E regression suite passes through the existing complete 17-test TP-02-12 PBRM-E2E row only after all eight focused Scope 2 behaviors in TP-02-04..11 are green, with no duplicate execution path. (DOD-02-E2E-BROAD)

 **Phase:** test

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** `0`

 ```text
 Running 17 tests using 1 worker
   ✓   1 …002 missing configuration blocks payload fetch and every output (438ms)
   ✓   2 …: SCN-005-004 invalid payload produces errors and no conclusion (180ms)
   ✓   3 …06 occupancy equation clamps and rejects an invalid denominator (235ms)
   ✓   4 …005-008 buyer economics use standard amortization in one result (189ms)
   ✓   5 …61:1 › Regression: SCN-005-009 zero-rate financing stays finite (247ms)
   ✓   6 …ression: SCN-005-020 five bedrooms alone never qualifies luxury (167ms)
   ✓   7 …Regression: SCN-005-021 sparse segment evidence remains visible (191ms)
   ✓   8 …22 whole-market values never become observed luxury performance (188ms)
   ✓   9 …on: SCN-005-023 deltas require aligned market and segment bases (168ms)
   ✓  10 …ed payload exposes four truthful units and no fixture authority (202ms)
   ✓  11 …013 compared refresh accounts for every material entity by pair (175ms)
   ✓  12 …egression: SCN-005-014 baseline refresh invents no prior change (184ms)
   ✓  13 …N-005-015 inaccessible research remains unknown without a value (184ms)
   ✓  14 …bserved assumptions inference and modeled outputs stay distinct (178ms)
   ✓  15 …026 refresh accounts independently for all four mandatory units (169ms)
   ✓  16 …acquisition baselines disclose sample status and legal unknowns (185ms)
   ✓  17 …emaining-2026 and 2027 scenarios remain falsifiable not factual (198ms)
   17 passed (4.6s)
 ```

 **Result:** PASS - after focused closure and the semantic-integrity pass, the exact TP-02-12 command executed the complete current 17-test suite once with one worker, 17 passed, zero failed, zero skipped, and no retry/only signal.

- [x] **DOD-02-C01:** Online tool evidence proves four independent units and nine categories; validator/browser output is not research evidence.

 **Phase:** implement

 **Claim Source:** executed

 **Tool:** Eight current-session `fetch_webpage` calls against the exact credential-free source and methodology URLs persisted by all four units; no search query or browser/validator output was used as market evidence.

 **Observed Output (verbatim excerpts):**

 ```text
 Palm Springs's short-term rental market has 5,949 active listings as of June 2026.
 The average active listing earned $38.4K in revenue over the trailing twelve months.
 Listings were booked 50% of nights they were available at an average daily rate of $476.
 Ocean Shores's short-term rental market has 541 active listings as of June 2026.
 Listings were booked 43% of nights they were available at an average daily rate of $243.
 Entire home91.4%
 5BR+6%
 Entire home86.5%
 5BR+1.3%
 23 homesSort: Recommended
 $729,0005 beds3 baths3,015sq ft
 $30,000,0009 beds10.5 baths10,000sq ft
 4 homesSort: Recommended
 $405,900
 $879,000
 Over the three months ending May 2026, Palm Springs home prices were up 1.3%
 Over the three months ending May 2026, Ocean Shores home prices were down 11.9%
 The 30-year fixed-rate mortgage averaged 6.55% as of July 16, 2026
 Nightly rentals must have a city business license endorsement for each property of operation.
 As part of the endorsement review process, nightly rentals are required to have a building and safety inspection prior to operation
 An error occurred retrieving the fetch result: HTTP error 404
 An error occurred retrieving the fetch result: Failed to extract meaningful content from the web page
 An error occurred retrieving the fetch result: HTTP error 404
 ```

 **Result:** PASS - exact current source pages independently substantiate eligible or attempted evidence for Palm whole, Palm luxury, Ocean whole, and Ocean luxury across all nine configured categories. The final three lines are the DWA, OEHHA, and Ocean getting-here attempts; their payload records remain non-numeric inaccessible attempts.

- [x] **DOD-02-C02:** Both payloads preserve rights/scope/sample limits, honest luxury unknowns, changes, acquisition status, and falsifiable scenarios.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** read-only four-unit Node receipt over both production payloads, followed by `node scripts/validate-place-based-rental-market.mjs`

 **Exit Code:** 0; 0

 ```text
 unit=unit:palm-springs-ca:whole-market:2026-07-18-baseline
 pair=palm-springs-ca::whole-market|prior=baseline|changeMode=baseline|changeRecords=0
 sources=11|eligible=10|rejected=0|inaccessible=1
 coverage=partial|candidate=known:5949|qualifying=known:5949
 scenarios=scenario-slot:rest-2026-base:assumption-driven:45:falsifiers=1,scenario-slot:2027-downside:assumption-driven:30:falsifiers=1,scenario-slot:2027-base:assumption-driven:45:falsifiers=1,scenario-slot:2027-upside:assumption-driven:30:falsifiers=1
 acquisition=closed-sale:unclean:n=492:range=null..null|baseline=unavailable:null
 unit=unit:palm-springs-ca:large-luxury-5plus:2026-07-18-baseline
 sources=12|eligible=9|rejected=1|inaccessible=2
 metricSamples=metricdef:palm:luxury-occupancy:unavailable:null|observedMetrics=0
 luxuryDisposition=unknown|qualificationSampleN=23
 acquisition=active-ask:unclean:n=23:range=729000..30000000|baseline=unavailable:null
 legal=current:1,unknown:3|fixedMissing=11|riskMissing=0
 unit=unit:ocean-shores-wa:whole-market:2026-07-18-baseline
 sources=17|eligible=16|rejected=0|inaccessible=1
 scenarios=scenario-slot:rest-2026-base:assumption-driven:45:falsifiers=1,scenario-slot:2027-downside:assumption-driven:30:falsifiers=1,scenario-slot:2027-base:assumption-driven:40:falsifiers=1,scenario-slot:2027-upside:assumption-driven:25:falsifiers=1
 legal=current:2,unknown:2|fixedMissing=12|riskMissing=5
 unit=unit:ocean-shores-wa:large-luxury-5plus:2026-07-18-baseline
 sources=18|eligible=16|rejected=1|inaccessible=1
 metricSamples=metricdef:ocean:luxury-occupancy:unavailable:null|observedMetrics=0
 luxuryDisposition=unknown|qualificationSampleN=4
 acquisition=active-ask:sparse:n=4:range=405900..879000|baseline=unavailable:null
 legal=current:0,unknown:4|fixedMissing=12|riskMissing=5
 [pbrm-validator] production-palm-springs-ca=PASS units=2
 [pbrm-validator] production-ocean-shores-wa=PASS units=2
 [pbrm-validator] findings=0
 [pbrm-validator] OK
 ```

 **Result:** PASS - rights states, source/access limits, baseline change accounting, scenario lineage/falsifiers, acquisition sample status, luxury unknowns, and incomplete legal/cost/risk economics remain pair-local and validator-clean.

- [x] **DOD-02-C03:** Shared runbook/prompt enforce exact write boundary, dirty refusal, invocation-only restore, and no auto-commit.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** focused `grep -nE` contract scan over `notes/place-based-rental-market-research.md` and `.github/prompts/place-based-rental-market-update.prompt.md`

 **Exit Code:** 0

 ```text
 PBRM_SCOPE2_RUNBOOK_CONTRACT_BEGIN
 9:## Exact Write Set
 18:## Four Independent Research Units
 27:For each unit, research each category exactly once:
 57:Search snippets, AI summaries, cached prior values, and inaccessible report contents are not evidence.
 102:## Dirty-Proposal Refusal
 108:The only allowed restoration is invocation-owned restoration
 110:## Scenario Method
 139:Do not auto-commit, stage, push, deploy, register routes, or invoke a publishing wrapper.
 159:- the final line `UNCOMMITTED FOR REVIEW`.
 7:Research all four market/segment units and all nine categories with current online retrievals.
 9:Write only:
 14:Refuse dirty payload collisions. Restore only invalid bytes written by this invocation.
 16:Do not edit config, formulas, modules, routes, tests, fixtures, validators, registries, docs indexes, Market Brief files, workflow artifacts, package/source-lock files, or framework-managed files.
 PBRM_SCOPE2_RUNBOOK_CONTRACT_EXIT=0
 PBRM_SCOPE2_RUNBOOK_CONTRACT_END
 ```

 **Result:** PASS - one shared runbook and one delegated prompt carry the exact two-payload write boundary, collision refusal, invocation-owned restoration, review receipt, and no-auto-publication rules.

- [x] **DOD-02-C04:** Review receipt contains four unit/prior/category/coverage/rights/unknown/change states, exact diffs, validator result, and `UNCOMMITTED FOR REVIEW`.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** focused section/terminal-line scan over `specs/005-palm-springs-rental-market-lab/report.md`

 **Exit Code:** 0

 ```text
 PBRM_SCOPE2_REPORT_RECEIPT_CHECK_BEGIN
 7038:## Scope 2 Implementation And Current-Session Online Research Receipt - 2026-07-18T02:41:40Z
 7065:### Exact Current-Session Source Retrieval Ledger
 7136:### Four-Unit State And Category Receipt
 7156:### Strongest Support, Conflict, Unknown, And Luxury Disposition
 7165:### Scenario Posture And Falsifiers
 7172:### Acquisition, Legal, Cost, And Risk Completeness
 7183:### Change Accounting
 7187:### Current Hashes And Exact Two-Payload Diff Summary
 7202:### Canonical Validator Output
 7241:### Implementation-Owned Product Checks
 7252:UNCOMMITTED FOR REVIEW
 PBRM_SCOPE2_REPORT_RECEIPT_CHECK_EXIT=0
 PBRM_SCOPE2_REPORT_RECEIPT_CHECK_END
 ```

 **Result:** PASS - the uniquely named report section contains the exact retrieval ledger, all four units and baseline states, nine-category/source/coverage/rights/unknown/change receipts, scenario/acquisition/legal/cost/risk posture, hashes/diffs, validator output, ownership boundary, and required terminal line.

- [x] **DOD-02-C05:** No fixture/snippet/inaccessible/other-pair/broad substitute becomes a claim.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `node --test tests/place-based-rental-market.contracts.unit.mjs`

 **Exit Code:** 0

 ```text
 ✔ Scope 1 v2 fixture corpus parses before production module loading
 ✔ exports the frozen browser and Node API without hidden authority
 ✔ validates and indexes the closed config without mutating input
 ✔ rejects every closed-schema mutation with deterministic code and path
 ✔ validates both synthetic market payloads and isolates pair indexes
 ✔ resolves comparison metric identity from the selected pair config
 ✔ requires every composite luxury gate and never promotes five bedrooms alone
 ✔ keeps sparse and unknown coverage explicit without multiplying marginals
 ✔ rejects whole-market evidence copied into an observed luxury field
 ✔ emits deltas only for fully aligned comparison bases
 ✔ keeps incomplete costs partial and coastal controls deterministic
 ✔ rejects unsafe source URLs while leaving script-like text inert data
 ℹ tests 15
 ℹ pass 15
 ℹ fail 0
 ℹ skipped 0
 ℹ todo 0
 ```

 **Result:** PASS - persistent adversarial contracts reject pair leakage, five-bedroom-only qualification, broad-to-luxury observations, unsafe sources, and incomplete-cost substitution; inaccessible source records remain attempt-only in the separately executed retrieval ledger.

- [x] **DOD-02-TP-02-01:** TP-02-01 passes.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `node scripts/validate-place-based-rental-market.mjs`

 **Exit Code:** 0

 ```text
 [pbrm-validator] production-config=PASS path=place-based-rental-market.config.json
 [pbrm-validator] fixture-config=PASS path=tests/fixtures/place-based-rental-market/config.v2.json
 [pbrm-validator] palm-fixture=PASS units=2
 [pbrm-validator] ocean-fixture=PASS units=2
 [pbrm-validator] closed-schema-rejections=6/6
 [pbrm-validator] metric-identity-config-authority=PASS marketBranches=0
 [pbrm-validator] metric-identity-branch-discriminator=PASS cases=4
 [pbrm-validator] compatibility-delegation=PASS
 [pbrm-validator] production-palm-springs-ca=PASS units=2
 [pbrm-validator] production-ocean-shores-wa=PASS units=2
 [pbrm-validator] scope-2-artifacts=PRESENT missing=0
 [pbrm-validator] findings=0
 [pbrm-validator] OK
 ```

 **Result:** PASS - the canonical validator accepts exactly two Palm and two Ocean production units under the v2 config with zero findings.

- [x] **DOD-02-TP-02-02:** TP-02-02 passes.

 **Phase:** implement

 **Claim Source:** executed

 **Command:** `node scripts/validate-place-based-rental-market.mjs`

 **Exit Code:** 0

 ```text
 [pbrm-validator] closed-schema-rejections=6/6
 [pbrm-validator] pair-leak=REJECTED
 [pbrm-validator] broad-to-luxury=REJECTED
 [pbrm-validator] occupancy-denominator=REJECTED
 [pbrm-validator] unsafe-source-matrix=PASS cases=7
 [pbrm-validator] v1-field-classification=PASS fields=17 legacyPresent=false
 [pbrm-validator] palm-duplicate-contract-logic=NONE
 [pbrm-validator] metric-identity-config-authority=PASS marketBranches=0
 [pbrm-validator] production-palm-springs-ca=PASS units=2
 [pbrm-validator] production-ocean-shores-wa=PASS units=2
 [pbrm-validator] runbook-prompt=PASS writeSet=2
 [pbrm-validator] findings=0
 [pbrm-validator] OK
 ```

 **Result:** PASS - URL safety, exact source/claim schemas, rights/roles, clocks, geographies, populations, pair ownership, reverse references, attempted-source constraints, and broad-to-luxury rejection all pass in the canonical production branch.

- [x] **DOD-02-TP-02-03:** TP-02-03 passes.

 **Phase:** implement

 **Claim Source:** executed

 **Commands:** focused runbook/prompt contract scan; `node scripts/validate-place-based-rental-market.mjs`

 **Exit Code:** 0; 0

 ```text
 PBRM_SCOPE2_RUNBOOK_CONTRACT_BEGIN
 9:## Exact Write Set
 18:## Four Independent Research Units
 102:## Dirty-Proposal Refusal
 108:The only allowed restoration is invocation-owned restoration
 139:Do not auto-commit, stage, push, deploy, register routes, or invoke a publishing wrapper.
 159:- the final line `UNCOMMITTED FOR REVIEW`.
 9:Write only:
 14:Refuse dirty payload collisions. Restore only invalid bytes written by this invocation.
 16:Do not edit config, formulas, modules, routes, tests, fixtures, validators, registries, docs indexes, Market Brief files, workflow artifacts, package/source-lock files, or framework-managed files.
 PBRM_SCOPE2_RUNBOOK_CONTRACT_EXIT=0
 PBRM_SCOPE2_RUNBOOK_CONTRACT_END
 [pbrm-validator] runbook-prompt=PASS writeSet=2
 [pbrm-validator] scope-2-artifacts=PRESENT missing=0
 [pbrm-validator] findings=0
 [pbrm-validator] OK
 ```

 **Result:** PASS - the exact two-payload write set, unreviewed-diff refusal, invocation-owned restoration, review receipt, and no stage/commit/push/deploy/registration/publication contract are present and validator-enforced.

- [x] **DOD-02-TP-02-04:** TP-02-04 proves SCN-005-001 Agent refresh performs sourced online research: given valid v2 configuration and a separately evidenced manual online refresh, when the validated production load renders, then it visibly exposes two markets, four independent pair-owned units, nine categories per unit, production proposal and non-fixture posture, no fixture authority, and `UNCOMMITTED FOR REVIEW`; browser consumption never substitutes for the separate online-research evidence.

 **Phase:** test

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-001 researched payload exposes four truthful units and no fixture authority" --reporter=list`

 **Exit Code:** 0

 **Evidence Ref:** `report.md#scope-2-visible-fidelity-test-closure---2026-07-18t040058z`

 ```text
 Running 1 test using 1 worker
   ✓  1 …hed payload exposes four truthful units and no fixture authority (405ms)
 [SCN-005-001] markets=2
 [SCN-005-001] units=4
 [SCN-005-001] categoriesPerUnit=9
 [SCN-005-001] productionPayloads=2
 [SCN-005-001] fixtureAuthority=false
 [SCN-005-001] proposalState=UNCOMMITTED FOR REVIEW
   1 passed (1.4s)
 SCN-005-001 receipt=#researchInventoryReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 ```

 **Result:** PASS - the production page visibly exposes two markets, four independent pair lines, `categories=9/9`, production proposal posture, and uncommitted review while the fixture band remains hidden. Browser output is consumption proof, not online-research provenance.

- [x] **DOD-02-TP-02-05:** TP-02-05 proves SCN-005-013 Previous-refresh changes require a prior payload: given a valid matching prior for the same pair, when the matching current unit is compared, then nonempty complete pair-owned change accounting visibly exposes the prior identity, prior-unit match, and full material-entity coverage with every material entity classified exactly once.

 **Phase:** test

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-013 compared refresh accounts for every material entity by pair" --reporter=list`

 **Exit Code:** 0

 **Evidence Ref:** `report.md#scope-2-visible-fidelity-test-closure---2026-07-18t040058z`

 ```text
 Running 1 test using 1 worker
   ✓  1 …-013 compared refresh accounts for every material entity by pair (485ms)
 [SCN-005-013] authority=TEST FIXTURE SYNTHETIC
 [SCN-005-013] publication=DISABLED
 [SCN-005-013] comparedPair=palm-springs-ca::whole-market
 [SCN-005-013] priorUnitMatch=true
 [SCN-005-013] changeRecords=11
 [SCN-005-013] materialEntities=11
 [SCN-005-013] complete=true
 [SCN-005-013] fixtureAsMarketProof=false
   1 passed (1.6s)
 SCN-005-013 comparedChecks=8/8
 SCN-005-013 validPriorBranchExercised=true
 ```

 **Result:** PASS - the closed compared fixture is visibly synthetic and publication-disabled, and exactly one Palm whole-market line exposes the exact prior identity, all required entity types, 11/11 material accounting, pair ownership, and `complete=true`. The fixture is software-contract proof only.

- [x] **DOD-02-TP-02-06:** TP-02-06 proves SCN-005-014 First refresh invents no change history: given no valid prior unit for the same pair, when the first unit is authored and rendered, then it visibly remains in baseline/no-prior mode with null or `NONE` prior identities, zero change records, zero prior-relative claims, and no compared-completion claim.

 **Phase:** test

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-014 baseline refresh invents no prior change" --reporter=list`

 **Exit Code:** 0

 **Evidence Ref:** `report.md#scope-2-visible-fidelity-test-closure---2026-07-18t040058z`

 ```text
 Running 1 test using 1 worker
   ✓  1 …Regression: SCN-005-014 baseline refresh invents no prior change (291ms)
 [SCN-005-014] priorMode=baseline
 [SCN-005-014] priorUnitIds=NONE
 [SCN-005-014] changeRecords=0
 [SCN-005-014] priorRelativeClaims=0
 [SCN-005-014] units=4
 [SCN-005-014] comparedCompletionClaim=false
   1 passed (993ms)
 SCN-005-014 receipt=#changeAccountingAuditReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 visibleFidelityFindings=0
 ```

 **Result:** PASS - all four production pair lines visibly remain baseline with every prior identity `NONE`, zero change records, zero prior-relative claims, and no compared completion claim.

- [x] **DOD-02-TP-02-07:** TP-02-07 proves SCN-005-015 Failed research never becomes fabricated data: given an inaccessible or rejected source attempt, when the refresh completes and renders, then the attempted context and consequence remain visible, the numeric value remains absent, and no positive snippet, prior value, quote, sample, source, inference, or other substitution is presented.

 **Phase:** test

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-015 inaccessible research remains unknown without a value" --reporter=list`

 **Exit Code:** 0

 **Evidence Ref:** `report.md#scope-2-visible-fidelity-test-closure---2026-07-18t040058z`

 ```text
 Running 1 test using 1 worker
   ✓  1 …CN-005-015 inaccessible research remains unknown without a value (457ms)
 [SCN-005-015] unitsWithAttempts=4
 [SCN-005-015] attemptedStates=inaccessible-or-rejected
 [SCN-005-015] sourceContext=visible
 [SCN-005-015] consequence=visible
 [SCN-005-015] numericValue=ABSENT
 [SCN-005-015] positiveSubstitution=false
   1 passed (1.4s)
 SCN-005-015 receipt=#attemptedResearchReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 visibleFidelityFindings=0
 ```

 **Result:** PASS - visible attempt lines cover all four pairs and preserve inaccessible/rejected state, source context, consequence, absent numeric value, and no positive substitution.

- [x] **DOD-02-TP-02-08:** TP-02-08 proves SCN-005-016 Observed evidence, assumptions, inference, and scenario output remain distinct: given a unit with observed evidence, assumptions, inference, and modeled output, when it validates and renders, then all four classes remain visibly distinct with class-specific lineage and modeled output never appears as observed research.

 **Phase:** test

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-016 observed assumptions inference and modeled outputs stay distinct" --reporter=list`

 **Exit Code:** 0

 **Evidence Ref:** `report.md#scope-2-visible-fidelity-test-closure---2026-07-18t040058z`

 ```text
 Running 1 test using 1 worker
   ✓  1 …observed assumptions inference and modeled outputs stay distinct (379ms)
 [SCN-005-016] visibleClasses=OBSERVED,ASSUMPTION,INFERENCE,MODELED OUTPUT
 [SCN-005-016] observedLineage=eligible source
 [SCN-005-016] assumptionLineage=declared assumption
 [SCN-005-016] inferenceLineage=claims and method
 [SCN-005-016] modeledLineage=forecast method + assumptions + inference + falsifier
 [SCN-005-016] referenceCounts=nonzero
   1 passed (998ms)
 SCN-005-016 receipt=#evidenceClassAuditReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 visibleFidelityFindings=0
 ```

 **Result:** PASS - all four evidence classes are visibly separate with class-specific lineage and nonzero production-derived reference counts.

- [x] **DOD-02-TP-02-09:** TP-02-09 proves SCN-005-026 Research refresh accounts for all four mandatory units: given a four-pair manual refresh in which one or more pairs may lack eligible evidence, when the units render, then all four retain independent pair-owned identities and nine-of-nine category receipts with no inherited identity, foreign ID, duplicate ID, or cross-pair status, sample, source, or prior-result collision.

 **Phase:** test

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-026 refresh accounts independently for all four mandatory units" --reporter=list`

 **Exit Code:** 0

 **Evidence Ref:** `report.md#scope-2-visible-fidelity-test-closure---2026-07-18t040058z`

 ```text
 Running 1 test using 1 worker
   ✓  1 …-026 refresh accounts independently for all four mandatory units (285ms)
 [SCN-005-026] receipts=4
 [SCN-005-026] duplicateIds=0
 [SCN-005-026] foreignIds=0
 [SCN-005-026] inheritedIdentity=false
 [SCN-005-026] categories=9/9
   1 passed (890ms)
 SCN-005-026 receipt=#unitIndependenceReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 directVisibleAssertionsTotal=8
 visibleFidelityFindings=0
 ```

 **Result:** PASS - four visible pair receipts independently report zero foreign IDs, zero duplicate IDs, no inherited identity, and nine of nine categories.

- [x] **DOD-02-TP-02-10:** TP-02-10 proves SCN-005-027 Segment acquisition baselines disclose sample and status: given active asks, closed sales, or broad prices, when each luxury acquisition sample renders, then it visibly discloses active-ask status, sparse or unclean state, filters, deduplication, sample size, statistic, range, period, exclusions, rights, legal unknowns, and an unavailable baseline; only a clean matching sample may yield a baseline.

 **Phase:** test

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-027 acquisition baselines disclose sample status and legal unknowns" --reporter=list`

 **Exit Code:** 0

 **Evidence Ref:** `report.md#scope-2-visible-fidelity-test-closure---2026-07-18t040058z`

 ```text
 Running 1 test using 1 worker
   ✓  1 … acquisition baselines disclose sample status and legal unknowns (607ms)
 [SCN-005-027] luxurySamples=2
 [SCN-005-027] status=active-ask
 [SCN-005-027] sampleStates=sparse,unclean
 [SCN-005-027] filtersDedupRangePeriod=visible
 [SCN-005-027] legalUnknowns=visible
 [SCN-005-027] rights=public-summary
 [SCN-005-027] baseline=unavailable
 [SCN-005-027] purchasePriceUsd=UNAVAILABLE
   1 passed (1.3s)
 ```

 **Result:** PASS - both visible luxury pair lines disclose active-ask sparse/unclean status, filters, deduplication, sample size, statistic, range, period, exclusions, legal unknowns, public-summary rights, and unavailable baseline/purchase price.

- [x] **DOD-02-TP-02-11:** TP-02-11 proves SCN-005-028 Remaining-2026 and 2027 scenarios are falsifiable, not factual: given aligned evidence or an explicit baseline gap, when remaining-2026, 2027, and luxury-sensitivity scenarios render, then baseline or gap, assumptions, inference, output, method and version, coverage, source support, confidence, falsifiers or required inputs remain visibly distinct and modeled scenarios never appear as observed fact.

 **Phase:** test

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-028 remaining-2026 and 2027 scenarios remain falsifiable not factual" --reporter=list`

 **Exit Code:** 0

 **Evidence Ref:** `report.md#scope-2-visible-fidelity-test-closure---2026-07-18t040058z`

 ```text
 Running 1 test using 1 worker
   ✓  1 …remaining-2026 and 2027 scenarios remain falsifiable not factual (362ms)
 [SCN-005-028] wholeMarketScenarios=8
 [SCN-005-028] luxurySensitivityScenarios=2
 [SCN-005-028] methodsCoverageConfidenceFalsifiers=visible
 [SCN-005-028] requiredUserInputs=visible
 [SCN-005-028] observedFact=false
   1 passed (1.0s)
 SCN-005-028 receipt=#scenarioAuditReceipt directVisibleAssertions=1 rawObjectReads=0 testDomWrites=0
 directVisibleAssertionsTotal=8
 visibleFidelityFindings=0
 ```

 **Result:** PASS - both whole-market scenario matrices and both luxury sensitivity rows visibly preserve methods, coverage, confidence, falsifiers or required inputs, and `observedFact=false`.

- [x] **DOD-02-TP-02-12:** TP-02-12 proves the complete 17-test PBRM-E2E suite passes only after all eight focused Scope 2 behaviors in TP-02-04..11 are green.

 **Phase:** test

 **Claim Source:** executed

 **Command:** `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

 **Exit Code:** 0

 **Evidence Ref:** `report.md#scope-2-visible-fidelity-test-closure---2026-07-18t040058z`

 ```text
 Running 17 tests using 1 worker
   ✓   1 …002 missing configuration blocks payload fetch and every output (320ms)
   ✓   2 …: SCN-005-004 invalid payload produces errors and no conclusion (175ms)
   ✓   3 …06 occupancy equation clamps and rejects an invalid denominator (239ms)
   ✓   4 …005-008 buyer economics use standard amortization in one result (207ms)
   ✓   5 …61:1 › Regression: SCN-005-009 zero-rate financing stays finite (182ms)
   ✓   6 …ression: SCN-005-020 five bedrooms alone never qualifies luxury (162ms)
   ✓   7 …Regression: SCN-005-021 sparse segment evidence remains visible (177ms)
   ✓   8 …22 whole-market values never become observed luxury performance (190ms)
   ✓   9 …on: SCN-005-023 deltas require aligned market and segment bases (172ms)
   ✓  10 …ed payload exposes four truthful units and no fixture authority (178ms)
   ✓  11 …013 compared refresh accounts for every material entity by pair (228ms)
   ✓  12 …egression: SCN-005-014 baseline refresh invents no prior change (287ms)
   ✓  13 …N-005-015 inaccessible research remains unknown without a value (263ms)
   ✓  14 …bserved assumptions inference and modeled outputs stay distinct (212ms)
   ✓  15 …026 refresh accounts independently for all four mandatory units (173ms)
   ✓  16 …acquisition baselines disclose sample status and legal unknowns (165ms)
   ✓  17 …emaining-2026 and 2027 scenarios remain falsifiable not factual (183ms)
   17 passed (4.3s)
 ```

 **Result:** PASS - the complete final-byte suite discovered and passed 17/17 tests with one worker and no retries, skips, only, todo, interception, service worker, or silent-pass branch; all eight focused fidelity checks had already passed independently.

- [x] **DOD-02-Q01:** Research findings, boundary, diagnostics, lint/freshness, G094, parity, and traceability pass.

 **Phase:** implement

 **Claim Source:** executed

 **Commands/Tools:** final artifact lint; artifact freshness; G094; traceability/G068; planner-owned TP-05-12 parity; post-state containment invariant; VS Code diagnostics over both payloads plus `scopes.md`, `report.md`, and `state.json`.

 **Exit Code:** 0 for every command; zero editor diagnostics.

 ```text
 Artifact lint PASSED.
 RESULT: PASS (0 failures, 0 warnings)
 capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
 Scenarios checked: 29
 Test rows checked: 64
 Scenario-to-row mappings: 29
 DoD fidelity scenarios: 29 (mapped: 29, unmapped: 0)
 RESULT: PASSED (0 warnings)
 PBRM_SCOPE2_FINAL_PLANNER_PARITY_BEGIN
 gherkin=28
 scenarioRows=28
 supportRows=31
 jsonRows=59
 manifestRows=28
 findings=0
 PBRM_SCOPE2_FINAL_PLANNER_PARITY_EXIT=0
 PBRM_SCOPE2_FINAL_PLANNER_PARITY_END
 protectedRegistrationDocsWorkflowPackageStatus=CLEAN
 scope3OceanRoute=ABSENT
 stagedDiffExit=0
 oceanPayloadInvocationDelta=ZERO
 runbookInvocationDelta=ZERO
 promptInvocationDelta=ZERO
 ownedDiffCheckExit=0
 PBRM_SCOPE2_POST_STATE_CONTAINMENT_EXIT=0
 palm-springs-rental-market.payload.json diagnostics: No errors found
 ocean-shores-rental-market.payload.json diagnostics: No errors found
 scopes.md diagnostics: No errors found
 report.md diagnostics: No errors found
 state.json diagnostics: No errors found
 ```

 **Result:** PASS - all implementation-owned product, research-boundary, diagnostics, artifact, freshness, G094, exact parity, traceability, and containment obligations are current and green. This does not claim TP-02-04..12 browser closure.

---

## Scope 3: Pair-Safe Two-Route Experience

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `ui:true`, `runtime-behavior:true`

**Depends On:** Scope 1, Scope 2

**Primary Outcome:** Both route-owned Simple/Power experiences use one compute/view model; pair switching is atomic; coverage precedes conclusions; Ocean coastal inputs affect equations; Palm burdens stay explicit; all projections are accessible and safely rendered.

### Gherkin Scenarios

```gherkin
Scenario: SCN-005-003 A valid stale payload remains visibly stale
Given a valid selected pair payload is older than its configured threshold
When Simple, Power, and the owner read render
Then all projections retain STALE, age, threshold, and pair identity and no surface calls the research current or live

Scenario: SCN-005-005 User shock levers recompute without research fetch
Given one valid selected market-segment scenario
When the user changes pair-valid market, risk, acquisition, financing, or cost controls
Then one deterministic result updates synchronously with zero post-boot research requests and unchanged observations, coverage, qualification, forecasts, and thesis

Scenario: SCN-005-007 Incompatible metric definitions remain separate
Given similarly named metrics have different definitions, populations, periods, samples, or pair applicability
When Power compares them
Then both definitions remain visible, incompatibility is named, and no conversion or aggregate is created

Scenario: SCN-005-010 Negative cash flow remains explicit
Given revenue is below variable costs, fixed-risk costs, and debt service
When economics render
Then pre-tax cash flow remains signed negative and no confidence or gross-yield label softens it

Scenario: SCN-005-011 Mobile and desktop share one Simple and Power decision
Given one valid selected pair and assumption set
When either route switches mode or viewport
Then pair, coverage, thesis, scenario, outputs, costs, stale state, result identity, accessibility, and layout remain equivalent

Scenario: SCN-005-012 Every material claim is source traceable
Given a displayed material claim, membership, baseline, or cost-risk assumption
When the user inspects provenance
Then a complete pair-supporting source record resolves, untrusted text remains inert, links are safe, and focus returns exactly

Scenario: SCN-005-017 Legal supply does not silently become active supply
Given legal eligibility, certificates or endorsements, inspections, caps, and OTA listings exist
When supply evidence and controls render
Then each population remains distinct and any supply delta names its assumption or inference

Scenario: SCN-005-019 Market and segment switching consumes one matching result
Given both markets and both mandatory segments are configured
When the user changes route market or segment
Then matching thesis, coverage, scenario, baselines, assumptions, result, modes, and owner read commit atomically with no prior-pair fallback

Scenario: SCN-005-024 Ocean Shores coastal evidence affects deterministic analysis
Given Ocean Shores and explicit applicable downtime and fixed-risk costs are selected
When coastal assumptions change within bounds
Then effective nights, revenue, operating cost, yield, and cash flow recompute while observations remain unchanged and missing applicable inputs stay incomplete

Scenario: SCN-005-025 Palm Springs large-luxury mode retains legal and operating boundaries
Given Palm Springs large-luxury-5plus is selected
When thesis and economics render
Then qualification, coverage, certificate-cap-contract posture, event context, acquisition basis, and pool-landscape-water-energy-compliance burdens remain explicit without broad substitution
```

### Implementation Plan

1. Add Ocean route and convert Palm to the same controller; market switching is validated navigation, not in-place repaint.
2. Load config first, then both payloads once; primary and comparison failures remain independent and fail closed.
3. Build pair candidates off-DOM and atomically commit identity/coverage/thesis/assumptions/result/read; clear prior numerics on target failure.
4. Put coverage/qualification before thesis/numbers in Simple; Power projects full audit from the same model.
5. Use strict pair-scoped storage and identifier-only query/deep links; fixture mode uses no storage/publication.
6. Ocean downtime/flood/wind/salt/utility/sewer/storm/association/septic inputs alter effective nights/cost/cash flow; missing applicable inputs make economics incomplete.
7. Palm luxury exposes qualification/sample/certificate-cap-contract/event/acquisition/pool-landscape-water-energy-compliance burdens without broad substitution.
8. Use inert text/safe links, native dialog focus return, semantic tables, synchronous canvas, keyboard/live/mobile/no-overlap/reduced-motion/print parity.
9. Publish one strict route read from the same result, omitting invalid numerics.

### Test Plan

| ID | Type | Category | Command | DoD ID | Exact Behavior |
| --- | --- | --- | --- | --- | --- |
| TP-03-01 | unit | unit | PBRM-UNIT | DOD-03-TP-03-01 | View, result, owner-read identity, atomic pair state, profiles, safe projection, storage normalization, and omissions. |
| TP-03-02 | functional | functional | PBRM-VALIDATOR | DOD-03-TP-03-02 | Both adapters, DOM slots, script order, profiles, route-payload identity, query-storage keys, and owner-read contracts validate. |
| TP-03-03 | functional | static-integrity | PBRM-VALIDATOR | DOD-03-TP-03-03 | Both route scripts parse; IDs and dynamic sinks are safe; shells contain no market facts, formulas, or fallbacks. |
| TP-03-14 | e2e-ui | broad-regression | PBRM-E2E | DOD-03-TP-03-14 | Complete pair-safe two-route suite passes after all focused route behaviors. |

| Test Type | Scenario ID | Test Plan ID | Concrete Test File | Exact Persistent Title | Command ID | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| e2e-ui | SCN-005-003 | TP-03-04 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-003 stale research stays stale in Simple Power and owner read` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-005 | TP-03-05 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-005 pair levers recompute with zero post-boot requests` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-007 | TP-03-06 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-007 incompatible occupancy definitions remain separate and unaggregated` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-010 | TP-03-07 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-010 negative cash flow remains signed and explicit everywhere` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-011 | TP-03-08 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-011 both routes keep desktop mobile Simple Power decisions identical` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-012 | TP-03-09 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-012 source inspector resolves provenance and restores exact focus` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-017 | TP-03-10 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-017 legal and active supply remain separate from scenario assumptions` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-019 | TP-03-11 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-019 market and segment switching commits one matching result` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-024 | TP-03-12 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-024 Ocean Shores coastal inputs change nights costs and cash flow` | focused PBRM-E2E | Yes |
| e2e-ui | SCN-005-025 | TP-03-13 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-025 Palm Springs luxury keeps legal and operating boundaries` | focused PBRM-E2E | Yes |

### Definition of Done

- [ ] **DOD-03-C01:** Both immutable routes load config then both payloads once and atomically commit target-pair models with no cross-market fallback.
- [ ] **DOD-03-C02:** Simple/Power share one result/view/read and expose coverage first, all controls, truth classes, economics, and educational boundaries.
- [ ] **DOD-03-C03:** Ocean coastal inputs affect equations; Palm burdens stay explicit; geographies remain distinct.
- [ ] **DOD-03-C04:** Safe render, focus, keyboard/live/mobile/no-overlap/non-color/table-canvas/reduced-motion/print contracts are complete.
- [ ] **DOD-03-C05:** Fixture mode is synthetic/no-storage/no-publication; interactions issue no post-boot request or research mutation.
- [ ] **DOD-03-TP-03-01:** TP-03-01 passes.
- [ ] **DOD-03-TP-03-02:** TP-03-02 passes.
- [ ] **DOD-03-TP-03-03:** TP-03-03 passes.
- [ ] **DOD-03-TP-03-04:** TP-03-04 proves SCN-005-003.
- [ ] **DOD-03-TP-03-05:** TP-03-05 proves SCN-005-005.
- [ ] **DOD-03-TP-03-06:** TP-03-06 proves SCN-005-007.
- [ ] **DOD-03-TP-03-07:** TP-03-07 proves SCN-005-010.
- [ ] **DOD-03-TP-03-08:** TP-03-08 proves SCN-005-011.
- [ ] **DOD-03-TP-03-09:** TP-03-09 proves SCN-005-012.
- [ ] **DOD-03-TP-03-10:** TP-03-10 proves SCN-005-017.
- [ ] **DOD-03-TP-03-11:** TP-03-11 proves SCN-005-019.
- [ ] **DOD-03-TP-03-12:** TP-03-12 proves SCN-005-024.
- [ ] **DOD-03-TP-03-13:** TP-03-13 proves SCN-005-025.
- [ ] **DOD-03-TP-03-14:** TP-03-14 broad suite passes.
- [ ] **DOD-03-Q01:** Safe-render/source/request/storage/viewport/boundary/diagnostic/lint/G094/parity/traceability gates pass before registration.

---

## Scope 4: Additive Registration And Consumer Integration

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `consumer-integration:true`, `shared-hunk-protected:true`

**Depends On:** Scope 1, Scope 2, Scope 3

**Primary Outcome:** Both validated routes become discoverable in synchronized order and Market Brief consumes strict owner reads without duplicating research/equations. Every shared edit is additive, collision-aware, and hunk-reversible.

### Gherkin Scenarios

```gherkin
Scenario: SCN-005-018 Owner read preserves unavailable and stale states
Given both validated routes are registered in identical order
When each publishes current stale sparse incomplete or unavailable state
Then Market Brief preserves route pair coverage truth caveat valid metrics and owning link only
```

### Consumer Impact Sweep

| Surface | Additive Hunk | Canary |
| --- | --- | --- |
| `tools.json`, `index.html`, `rlnav.js` | Palm then Ocean, identical order | selftest equality/order/routes plus E2E navigation |
| `README.md` | two routes and shared contracts | validator/readiness |
| `notes/README.md` | shared runbook entry | validator/readiness |
| `market-brief.payload.json` | two ordered owner-read coverage entries | Brief validator, no domain duplication |
| `.github/workflows/pages.yml` | owner-routed blocking v2 checks | fresh-checkout workflow check |
| `.specify/memory/agents.md` | owner-routed exact commands | command parity |

### Implementation Plan

1. Revalidate both payloads/routes immediately before registration; stop without mutations on failure.
2. Apply collision protocol independently to six dirty shared files and treat current hunks as foreign.
3. Add two adjacent registry/docs entries and one shared-method entry without reordering/normalization.
4. Add two Brief entries consuming only owner-read IDs/state/metrics/deep links.
5. Route workflow/command registry changes to owners and validate returned hunks.
6. Run registry/canonical/Brief/focused-E2E/broad canaries; rollback exact Feature 005 hunks only.

### Test Plan

| Test Type | Scenario ID | Test Plan ID | Concrete Test File | Exact Persistent Title | Command ID | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| e2e-ui | SCN-005-018 | TP-04-04 | `tests/palm-springs-rental-market-lab.spec.mjs` | `Regression: SCN-005-018 both registered owner reads preserve truth omissions and owning links` | focused PBRM-E2E | Yes |

| ID | Type | Category | Command | DoD ID | Exact Behavior |
| --- | --- | --- | --- | --- | --- |
| TP-04-01 | unit | static-integrity | PBRM-SELFTEST | DOD-04-TP-04-01 | Three registries match in identity and order, both routes exist, and all prior groups pass. |
| TP-04-02 | functional | functional | PBRM-VALIDATOR | DOD-04-TP-04-02 | Both route, payload, config, runbook, docs, and command identities are coherent with zero removed-v1 live references. |
| TP-04-03 | contract | contract | PBRM-BRIEF | DOD-04-TP-04-03 | Exactly two ordered owner-read coverage entries preserve state and omissions without duplicating rental authority. |
| TP-04-05 | e2e-ui | broad-regression | PBRM-E2E | DOD-04-TP-04-05 | Full two-route suite passes after additive consumer integration. |

### Definition of Done

- [ ] **DOD-04-C01:** Registration starts only after both payloads/routes validate.
- [ ] **DOD-04-C02:** Three registries, docs, and two Brief entries are synchronized/additive/ordered with no duplicated authority.
- [ ] **DOD-04-C03:** Fences/sentinels/collision refusal/canaries/rollback preserve unrelated dirty bytes.
- [ ] **DOD-04-C04:** Owner-routed workflow/command hunks are validated without ownership crossing.
- [ ] **DOD-04-C05:** Consumer sweep finds zero stale v1/mismatched Feature 005 refs.
- [ ] **DOD-04-TP-04-01:** TP-04-01 passes.
- [ ] **DOD-04-TP-04-02:** TP-04-02 passes.
- [ ] **DOD-04-TP-04-03:** TP-04-03 passes.
- [ ] **DOD-04-TP-04-04:** TP-04-04 proves SCN-005-018.
- [ ] **DOD-04-TP-04-05:** TP-04-05 broad suite passes.
- [ ] **DOD-04-Q01:** Hunk containment, consumer trace, diagnostics, lint/freshness, G094, parity, traceability, write guard, and readiness pass or route a complete finding set.

---

## Scope 5: Complete Verification And Finding Closure

**Status:** Not Started

**Scope-Kind:** contract-only

**Tags:** `overlay:true`, `validation-hardening:true`, `finding-closure:true`

**Depends On:** Scope 1, Scope 2, Scope 3, Scope 4

**Primary Outcome:** Focused and broad product/governance checks execute against current bytes, every finding is accounted for, and the packet is ready for the registry-declared validation owner. This scope adds no pseudo-business scenario and sets no terminal status/certification.

### Gherkin Scenarios

```gherkin
Scenario: OP-005-VERIFICATION Every finding is fixed or routed
Given Scopes 1 through 4 have completed their planned delivery contracts
When Scope 5 executes the focused and broad product and governance checks against current bytes
Then every result is recorded without truncation or fabrication
And every discovered finding is fixed and revalidated in-owner or routed explicitly
And the business scenario inventory remains exactly SCN-005-001 through SCN-005-028
And this verification scope writes no terminal delivery status or certification
```

This is an operational verification contract, not a product or business scenario. Complete-matrix checks remain non-scenario support Test Plan rows.

### Implementation Plan

1. Prove exact SCN-005-001..028 inventory and one owner/title/Test Plan/DoD/manifest mapping each.
2. Review the one Playwright file for direct assertions, five protected titles, no bailout/interception/fulfillment/skip/only/fixture-truth, and one HTTP server.
3. Repair focused owner slices, rerun focused, then broad.
4. Run unit/selftest/canonical/compat/source-static/Brief/full-E2E/no-interception.
5. Run artifact lint/freshness, G094, exact parity, traceability, diagnostics, write guard, doctor, and readiness.
6. Maintain one-to-one finding accounting; route out-of-bound findings rather than cherry-picking.
7. Keep state/scopes nonterminal and certification untouched.

### Test Plan

| ID | Type | Category | Command | DoD ID | Exact Behavior |
| --- | --- | --- | --- | --- | --- |
| TP-05-01 | unit | unit | PBRM-UNIT | DOD-05-TP-05-01 | Complete shared v2 contract and model suite. |
| TP-05-02 | unit | broad-regression | PBRM-SELFTEST | DOD-05-TP-05-02 | All Feature 005 and unrelated repository canaries pass. |
| TP-05-03 | functional | contract | PBRM-VALIDATOR | DOD-05-TP-05-03 | Complete production, fixture, research, docs, route, static, and source-safety contract passes. |
| TP-05-04 | functional | compatibility | PBRM-COMPAT | DOD-05-TP-05-04 | Palm compatibility entry delegates and passes. |
| TP-05-05 | functional | source-safety | PBRM-VALIDATOR | DOD-05-TP-05-05 | Unsafe URLs, token-shaped URLs, rights misuse, dynamic sinks, and broad substitution remain rejected. |
| TP-05-06 | functional | no-interception | PBRM-NO-INTERCEPTION | DOD-05-TP-05-06 | Expected zero-match scan proves no request interception, fulfillment, skip, or only marker. |
| TP-05-07 | e2e-ui | broad-regression | PBRM-E2E | DOD-05-TP-05-07 | All twenty-eight exact scenario titles execute through the one real-HTTP suite. |
| TP-05-08 | functional | consumer-regression | PBRM-BRIEF | DOD-05-TP-05-08 | Both owner-read coverages remain valid, state-faithful, and non-duplicative. |
| TP-05-09 | governance | artifact-integrity | PBRM-ARTIFACT-INTEGRITY | DOD-05-TP-05-09 | Required artifacts, shape, freshness, and nonterminal state pass planning and delivery lint. |
| TP-05-10 | governance | capability-foundation | PBRM-G094 | DOD-05-TP-05-10 | G094 proves the foundation scope precedes and is depended on by every overlay. |
| TP-05-11 | governance | traceability | PBRM-TRACEABILITY | DOD-05-TP-05-11 | .github/bubbles/scripts/traceability-guard.sh confirms all 28 business mappings and OP-005-VERIFICATION finding closure: every finding is fixed or routed. |
| TP-05-12 | governance | cross-artifact-parity | PBRM-PLANNER-PARITY | DOD-05-TP-05-12 | Active Markdown Test Plan, Test Plan JSON, scenario manifest, and DoD IDs and fields are exactly equal. |
| TP-05-13 | governance | repository-readiness | PBRM-REPOSITORY-READINESS | DOD-05-TP-05-13 | Framework write guard, doctor, and repository readiness execute without product mutation. |

### Definition of Done

- [ ] **DOD-05-C01:** Exactly 28 business scenarios; no pseudo-scenario collision.
- [ ] **DOD-05-C02:** Required test categories validate behavior, not setup text or fixture authority.
- [ ] **DOD-05-C03:** Every finding is fixed/revalidated or explicitly unresolved/routed; no easy-subset completion.
- [ ] **DOD-05-C04:** Dirty-file containment/rollback preserves foreign bytes.
- [ ] **DOD-05-C05:** Report/state/scope/test/scenario artifacts agree, remain nonterminal, and claim no fabricated delivery or certification outcome.
- [ ] **DOD-05-TP-05-01:** TP-05-01 passes.
- [ ] **DOD-05-TP-05-02:** TP-05-02 passes.
- [ ] **DOD-05-TP-05-03:** TP-05-03 passes.
- [ ] **DOD-05-TP-05-04:** TP-05-04 passes.
- [ ] **DOD-05-TP-05-05:** TP-05-05 passes.
- [ ] **DOD-05-TP-05-06:** TP-05-06 expected no-match result is accurately recorded.
- [ ] **DOD-05-TP-05-07:** TP-05-07 all 28 regressions pass.
- [ ] **DOD-05-TP-05-08:** TP-05-08 passes.
- [ ] **DOD-05-TP-05-09:** TP-05-09 passes.
- [ ] **DOD-05-TP-05-10:** TP-05-10 passes.
- [ ] **DOD-05-TP-05-11:** TP-05-11 passes.
- [ ] **DOD-05-TP-05-12:** TP-05-12 passes.
- [ ] **DOD-05-TP-05-13:** TP-05-13 passes.
- [ ] **DOD-05-Q01:** Diagnostics and every valid gate pass or return a complete unresolved set; only the downstream owner advances status/certification.

## Plan-Wide Completion Rules

- Scope status remains Not Started until current evidence satisfies every item; sequencing is strict.
- Every Test Plan row has exactly one matching DoD checkbox. Scenario rows additionally match the map, manifest, and test-plan JSON.
- Scenario E2Es are permanent; broad rows complement rather than replace them.
- Unit/contract tests execute production functions. Browser tests use one real-HTTP harness without interception/mocks. Research tool evidence is separate.
- Historical v1 evidence satisfies no v2 item.
- No planner/test/implementation agent writes certification, claims delivery complete, or promotes terminal status.
- Ownership gaps or shared-file collisions are routed, never silently edited.

## Superseded V1 Plan (Do Not Execute)

The raw prior planner bytes follow only to preserve history from the dirty working tree. They are source-commented, excluded from the active inventory, and satisfy no v2 scenario, test row, DoD, status, or evidence claim.

<!-- markdownlint-disable -->

<!-- BEGIN SUPERSEDED V1 PLAN - DO NOT EXECUTE
# Scopes: Place-Based Rental Market Research

Planning authority: [spec.md](spec.md) and [design.md](design.md). Execution evidence belongs in [report.md](report.md), and human acceptance is tracked in [uservalidation.md](uservalidation.md).

This is the reconciled five-scope, single-file, sequential plan for the active `full-delivery` workflow. All five v2 scopes are `Not Started`. Existing Palm Springs v1 source, config, validator, fixtures, and five protected browser scenarios are migration inputs, not completed v2 delivery. Prior Scope 1 command evidence remains historical in [report.md](report.md) and does not precheck or satisfy any v2 Definition of Done item.

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
| 1 | Shared v2 foundation migration | `rlrental.js`, generic config, two-market fixtures, canonical/compat validators, protected selftest hunk | RED-first module/validator checks and five protected real-static-server regressions | Closed v2 contracts, exact equations, pair isolation, migration, and rollback complete | Not Started |
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

## Historical Scope 1: Shared V2 Foundation Migration

**Status:** Not Started

**Tags:** `foundation:true`

**Depends On:** None

**Primary Outcome:** A versioned, fail-loud, page-local production foundation validates config and payload candidates, executes immutable equations, exposes truthful contract/model states over HTTP, and is exercised through extracted production functions, labeled adversarial fixtures, and one exact source-locked local Playwright runner using system Chrome. It contains no browser research client, hardcoded payload narrative, application build, or runtime package dependency.

### Gherkin Scenarios - Scope 1

#### SCN-005-002 / BS-002 - Missing configuration blocks the product

```gherkin
Historical Scenario: SCN-005-002 Missing configuration blocks the product
Given the real static server returns HTTP 404 for the closed missing-config fixture path
When the production boot sequence resolves and validates configuration
Then the visible truth band says INVALID CONFIGURATION and names PSRM-CONFIG-FETCH
And the browser makes no payload request and renders no thesis scenario value model output or numeric owner metric
```

#### SCN-005-004 / BS-004 - Invalid payload produces no conclusion

```gherkin
Historical Scenario: SCN-005-004 Invalid payload produces no conclusion
Given fixture configuration is valid and the checked-in invalid payload has a dangling source reference and missing required category
When the extracted production validator and the production page process it
Then PSRM-PAYLOAD-REF and PSRM-PAYLOAD-CATEGORY are visible
And no thesis projection deterministic result or numeric owner metric is produced
```

#### SCN-005-006 / BS-006 - Occupancy equation clamps and guards its denominator

```gherkin
Historical Scenario: SCN-005-006 Occupancy equation clamps and guards its denominator
Given base occupancy is 0.40 demand delta is 0.10 and supply delta is 0.25
When the extracted production computeAdjustedOccupancy function runs
Then the result equals clamp(0.40 * 1.10 / 1.25, 0, 1)
And a separate invalid denominator returns PSRM-MODEL-OCCUPANCY-DENOMINATOR with no numeric result
```

#### SCN-005-008 / BS-008 - Standard amortizing buyer economics

```gherkin
Historical Scenario: SCN-005-008 Standard amortizing buyer economics
Given positive bound-valid purchase leverage annual-rate and loan-term inputs
When the extracted production computeRentalModel function runs
Then monthly payment uses the standard amortizing equation
And annual debt service gross yield operating expense and pre-tax cash flow are fields of the same unrounded deterministic result
```

#### SCN-005-009 / BS-009 - Zero-rate financing remains finite

```gherkin
Historical Scenario: SCN-005-009 Zero-rate financing remains finite
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

## Historical Scope 2: Researched Payload And Manual Review Contract

**Status:** Not Started

**Tags:** `overlay:true`, `research:true`

**Depends On:** Scope 1 - Contract, Deterministic Model, And Source-Locked Browser Foundation

**Sequential Gate:** Scope 1 must be `Done` before Scope 2 starts.

**Primary Outcome:** A real initial six-category payload is authored from current online research, truthfully distinguishes observation/forecast/inference, preserves source rights and definition conflicts, records baseline or prior comparison exactly, validates through production code, and remains uncommitted for human review.

### Gherkin Scenarios - Scope 2

#### SCN-005-001 / BS-001 - Sourced online research

```gherkin
Historical Scenario: SCN-005-001 Sourced online research
Given valid config and a clean payload-owned path for one manual refresh
When the research agent performs current online research across all six configured categories
Then every category has eligible evidence from this invocation or an explicit unknown with attempted-source context
And every material claim resolves to an allowed source role before validator acceptance
And the valid proposal remains uncommitted for review
```

#### SCN-005-013 / BS-013 - Compared refresh accounts for every material entity

```gherkin
Historical Scenario: SCN-005-013 Compared refresh accounts for every material entity
Given a valid compared test payload names the immediately prior valid payload identity
When extracted production change validation and the real page process it
Then every material entity in the prior/current union has exactly one allowed change record
And every scenario or acquisition revision has a reason and eligible evidence source
```

#### SCN-005-014 / BS-014 - Baseline invents no change history

```gherkin
Historical Scenario: SCN-005-014 Baseline invents no change history
Given the initial researched payload has no prior valid predecessor
When payload validation and the Change Ledger process baseline mode
Then prior identity fields are null and change records are empty
And no prior-relative improvement deterioration acceleration or reversal claim appears
```

#### SCN-005-015 / BS-015 - Failed source remains explicit unknown

```gherkin
Historical Scenario: SCN-005-015 Failed source remains explicit unknown
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

## Historical Scope 3: Complete Decision And Audit Page

**Status:** Not Started

**Tags:** `overlay:true`, `ui:true`, `runtime-behavior:true`

**Depends On:** Scope 1 - Contract, Deterministic Model, And Source-Locked Browser Foundation; Scope 2 - Researched Payload And Manual Review Contract

**Sequential Gate:** Scopes 1 and 2 must be `Done` before Scope 3 starts.

**Primary Outcome:** The production route becomes the complete self-contained thesis-first Simple and audit-complete Power tool, using one immutable research graph, one validated assumption set, one deterministic result, and one owner-read identity across desktop/mobile and current/stale/unavailable states.

### Gherkin Scenarios - Scope 3

#### SCN-005-003 / BS-003 - Valid stale payload remains visibly stale

```gherkin
Historical Scenario: SCN-005-003 Valid stale payload remains visibly stale
Given checked-in fixture contracts validate and the explicit fixture clock is after staleAfter
When Simple and Power render
Then both show the same STALE word age and configured threshold
And the owner-read preview remains stale
And no visible or accessible text calls the research current or live
```

#### SCN-005-005 / BS-005 - User levers recompute without research fetch

```gherkin
Historical Scenario: SCN-005-005 User levers recompute without research fetch
Given one valid view model rendered from real same-origin fixture reads
When the user changes year scenario demand supply ADR purchase leverage rate and expense controls
Then one production compute emits the new result and digest synchronously
And the thesis payload and research graph digests remain unchanged
And zero requests occur after the initial config and payload reads
```

#### SCN-005-007 / BS-007 - Incompatible definitions remain separate

```gherkin
Historical Scenario: SCN-005-007 Incompatible definitions remain separate
Given paid managed-home occupancy and booked available-night OTA occupancy are both valid observations
When Power and the Source Inspector expose their evidence
Then values definitions geographies populations and periods remain separate
And a DefinitionConflict names the incompatibility and confidence consequence
And no aggregate KPI series row or conversion action exists
```

#### SCN-005-010 / BS-010 - Negative cash flow remains explicit

```gherkin
Historical Scenario: SCN-005-010 Negative cash flow remains explicit
Given gross revenue is lower than operating expense plus annual debt service
When Simple Power and the owner-read receipt render the shared result
Then pre-tax cash flow remains a signed negative number
And NEGATIVE CASH FLOW appears before gross-yield commentary
And no attractive viable or positive acquisition label appears
```

#### SCN-005-011 / BS-011 - Desktop mobile and mode parity

```gherkin
Historical Scenario: SCN-005-011 Desktop mobile and mode parity
Given one valid fixture and one UserAssumptionSet
When the page renders at 1440 by 1000 and 390 by 844 and switches Simple and Power
Then truth thesis confidence scenario outputs and data-model-digest are identical
And there is no body overflow overlap clipped focus or pointer-only control
And synchronous charts are nonblank and match their accessible tables
```

#### SCN-005-012 / BS-012 - Complete claim-to-source trace and focus return

```gherkin
Historical Scenario: SCN-005-012 Complete claim-to-source trace and focus return
Given a displayed material claim has validated supporting source references
When the user opens and closes the native Source Inspector
Then every reference resolves to a complete allowed source record with scope period access rights and limitations
And dynamic text is rendered literally and validated links use safe attributes
And focus returns to the exact invoking element
```

#### SCN-005-016 / BS-016 - Truth classifications stay distinct

```gherkin
Historical Scenario: SCN-005-016 Truth classifications stay distinct
Given claims and series contain observed forecast and inference classifications
When Simple Power chart table and Source Inspector render
Then each item exposes exactly one classification word and a non-color mark
And forecasts resolve a method and inferences resolve observed inputs
And user outputs say MODELED FROM USER ASSUMPTIONS instead of using a research classification
```

#### SCN-005-017 / BS-017 - Legal supply and active supply stay separate

```gherkin
Historical Scenario: SCN-005-017 Legal supply and active supply stay separate
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

## Historical Scope 4: Additive Registration And Consumer Integration

**Status:** Not Started

**Tags:** `overlay:true`, `consumer-integration:true`

**Depends On:** Scope 1 - Contract, Deterministic Model, And Source-Locked Browser Foundation; Scope 2 - Researched Payload And Manual Review Contract; Scope 3 - Complete Decision And Audit Page

**Sequential Gate:** Scopes 1 through 3 must be `Done` before Scope 4 starts.

**Primary Outcome:** Feature 005 becomes discoverable through synchronized registries and documentation, and Market Brief covers only its normalized state-faithful owner read and deep link without copying Palm Springs research or formulas.

### Gherkin Scenario - Scope 4

#### SCN-005-018 / BS-018 - Registered owner read preserves truth and omissions

```gherkin
Historical Scenario: SCN-005-018 Registered owner read preserves truth and omissions
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

## Historical Scope 5: Regression And Governance Hardening

**Status:** Not Started

**Tags:** `overlay:true`, `validation-hardening:true`

**Depends On:** Scope 1 - Contract, Deterministic Model, And Source-Locked Browser Foundation; Scope 2 - Researched Payload And Manual Review Contract; Scope 3 - Complete Decision And Audit Page; Scope 4 - Additive Registration And Consumer Integration

**Sequential Gate:** Scopes 1 through 4 must be `Done` before Scope 5 starts.

**Primary Outcome:** The complete protected matrix executes against production functions and the real static page, every finding is accounted for and resolved within the declared boundary, and repository/Bubbles checks establish a current evidence packet without changing delivery status or certification directly.

### Gherkin Scenario - Scope 5

#### SCN-005-019 - Complete protected matrix remains executable

```gherkin
Historical Scenario: V1-MATRIX-019 Complete protected matrix remains executable
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
END SUPERSEDED V1 PLAN -->
