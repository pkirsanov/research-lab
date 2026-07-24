# Scope 10: Bounded WebEvidence Acquisition

## 10-bounded-web-evidence-acquisition

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `security-boundary:true`, `external-source-boundary:true`, `author-network-forbidden:true`

Depends On: 09-public-matrix-market-action-scaffold

**Primary Outcome:** A scheduled, bounded, fail-closed acquisition stage validates public query plans, robots/HTTPS/host/path/media/redirect/budget policy, hostile content, source metadata, independent origins, owner evidence, claim corroboration, hashes, and frozen `WebEvidenceBundle/v1` objects. It does not author prose, publish a current generation, expose raw remote content, or grant an author network authority.

## Requirement Coverage

- **Functional acquisition:** FR-030, FR-032 through FR-036; author and Brief completion remain Scope 11.
- **Non-functional:** NFR-006 through NFR-010, NFR-012 through NFR-017.
- **Acceptance:** SCN-012-006 and SCN-012-007 plus derived SCN-012-037.

## Gherkin Scenarios

### SCN-012-006 - Uncorroborated material claims are rejected

```gherkin
Scenario: SCN-012-006 Online search finds one current source for a material market claim
  Given no independent corroborating source origin exists
  When WebEvidenceBundle and ToolBrief validation run
  Then the material claim is rejected
  And the current Brief does not imply that the claim is verified
```

### SCN-012-007 - Syndication counts as one source

```gherkin
Scenario: SCN-012-007 Two articles repeat one original report
  Given both articles trace to the same publisher or primary source
  When corroboration is calculated
  Then they count as one independent origin
  And a second independent source is still required for a material claim
```

### SCN-012-037 - Acquisition freezes a safe bounded bundle before any author can run

```gherkin
Scenario: SCN-012-037 A public owner read produces a valid bounded query plan
  Given every query term, host, purpose, cutoff, freshness window, and byte limit validates
  And retained remote content clears robots, transport, metadata, media, safety, and origin checks
  When the production acquisition stage completes
  Then one immutable WebEvidenceBundle is frozen with exact source hashes, bounded excerpts, claims, origins, owner evidence, rejections, coverage, and byte inventory
  And raw HTML, scripts, instructions, credentials, redirects, private context, and author authority are absent
  And no ToolBrief or public current pointer is produced by this scope
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-006 one origin | Static exact-format bundle fixture produced through production validator | Open Brief evidence gate/disclosure | Claim is rejected/insufficient; safe source metadata and owner read remain; no current authored claim appears | e2e-ui |
| SCN-012-007 syndicated sources | Two retained records share canonical origin/content lineage | Open corroboration disclosure | Independent-origin count is one and exact second-origin requirement is visible | e2e-ui |
| SCN-012-037 safe bundle audit | Qualified frozen bundle fixture with real production schema | Open evidence disclosure | HTTPS publisher/date/query/claim/origin/owner/freshness/hash summary appears as safe text; raw/unsafe content is absent | e2e-ui |

## Implementation Files

### New

- `scripts/web-evidence-acquire.mjs`
- `scripts/validate-web-evidence.mjs`
- `tests/web-evidence.unit.mjs`
- `tests/web-evidence.functional.mjs`
- `tests/web-evidence.security.mjs`
- `tests/web-evidence.spec.mjs`
- `tests/fixtures/feature-012/web-evidence/**`

### Modified

- `market-brief.config.json`
- `rlexperience.js`
- `rlbrief.js`
- `scripts/selftest.mjs`

## Implementation Plan

1. Add exact Tool Brief and Red Alert acquisition policies from the design: queries, candidate/source/excerpt/bundle bytes, timeouts, total ceilings, concurrency, HTTPS/443, no redirects, robots fail-closed, media/source classes, freshness, and host/path allowlists. Code has no fallback or environment relaxation.
2. Implement closed `WebEvidenceQueryPlan/v1`, candidate, source, excerpt, claim, rejection, coverage, and `WebEvidenceBundle/v1` validators/fingerprints.
3. Render query terms only from public registry templates plus validated public owner facts; reject private values, URLs, credentials, shell/control syntax, wildcards, overlength, unknown hosts, and instruction-shaped text.
4. Implement an injected search/fetch boundary for functional tests and scheduled operation. Validate DNS/URL/host/path before request, fetch robots under the same caps, reject missing/ambiguous/disallow, and fetch no content after rejection.
5. Hash exact bounded bytes, strip markup, detect hostile instructions, retain only safe plain excerpts/source metadata, group independent origins conservatively, map claims to excerpts/owner evidence, and discard raw page bodies.
6. Reject credentialed/non-HTTPS/IP-literal/redirecting/executable/unbounded/missing-metadata/stale/disputed/instruction content without echoing it to logs/artifacts/DOM.
7. Freeze the bundle before returning. The module exposes no author invocation, repository write, current-pointer, private-state, provider-key, or owner-model capability.
8. Add static exact-format fixtures for primary+independent, syndicated/common-origin, stale, conflict, robots, redirects, over-budget, metadata gaps, injection, and later-than-cutoff cases. Assertions validate production transformations, not fixture echoes.
9. Add a safe static browser disclosure consumer in `rlbrief.js`; it may inspect bundle status but cannot call acquisition from the browser.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| `market-brief.config.json` | Existing schedules/sources/action gates remain byte-semantically unchanged | Existing payload/config validators plus exact additive-policy diff |
| `rlbrief.js` | Existing Feature 002 v1 pointer/manifest/hash and safe rendering remain intact | Existing distributed Brief renderer/static/browser suites plus v1 fixture |
| Publisher/author scripts | No current publication or author authority is added | Static import/call graph proves acquisition does not import author/publication; author process unchanged |
| External content boundary | Tests may simulate true external responses only at functional boundary | Browser E2E uses static same-origin bundle and no `page.route`/`context.route`; no fake live acquisition claim |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Excluded:** `scripts/brief-author.mjs`, `scripts/brief-publication.mjs`, `scripts/brief-refresh.mjs`, `scripts/brief-narrative-parallel.mjs`, public current pointer/objects/history, `rldata.js`, provider keys/paths, private/Journey storage, Feature 002/008/BUG-004 source/artifacts, option owner/data, QF, package/source-lock files, and framework-managed files.

**Classification honesty:** functional search/fetch tests use an injected external boundary and are not called live-system tests. Browser tests exercise real static production UI over frozen bundles without request interception; they do not claim external acquisition succeeded.

## Rollback

Remove the acquisition/validator/fixture/test files and additive config/consumer hunks, restore prior `rlbrief.js` behavior, and prove existing Brief/Market Action/selftest/payload validation remains green. No published object/history/pointer, source cache, or external state is changed.

## Scenario-First RED/GREEN Contract

Create one-origin/syndication/policy/safety/freeze assertions before acquisition code. A valid RED proves production acceptance/rejection/fingerprint behavior is absent or incorrect. DNS/network unavailability is not RED because deterministic functional tests own the external boundary; browser tests never require external network.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-10-01 | Unit | unit | SCN-012-006, SCN-012-007, SCN-012-037 | `tests/web-evidence.unit.mjs` | Validate plans/policies/URLs/sources/excerpts/claims/origins/freshness/fingerprints/budgets and exact errors | `node --test tests/web-evidence.unit.mjs` | No | `report.md#tp-10-01` |
| TP-10-02 | Acquisition functional | functional | SCN-012-006, SCN-012-007, SCN-012-037 | `tests/web-evidence.functional.mjs` | Run production acquisition through controlled external transport, robots, source extraction, freeze, one-origin rejection, and syndication grouping | `node --test tests/web-evidence.functional.mjs` | No | `report.md#tp-10-02` |
| TP-10-03 | Security/adversarial functional | functional | SCN-012-037 | `tests/web-evidence.security.mjs` | Reject credentialed/HTTP/IP/redirect/media/oversize/missing-metadata/stale/conflict/injection/private/shell content without echo or author/publication authority | `node --test tests/web-evidence.security.mjs` | No | `report.md#tp-10-03` |
| TP-10-04 | Committed validator | functional | SCN-012-006, SCN-012-007, SCN-012-037 | `scripts/validate-web-evidence.mjs` | Validate all committed policies/fixtures and deterministic bundle bytes without network or writes | `node scripts/validate-web-evidence.mjs --fixtures tests/fixtures/feature-012/web-evidence` | No | `report.md#tp-10-04` |
| TP-10-05 | Regression E2E | e2e-ui | SCN-012-006 | `tests/web-evidence.spec.mjs` | `Regression: SCN-012-006 one-origin material claim is rejected and no current authored claim appears` | `npx --no-install playwright test tests/web-evidence.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-006 one-origin material claim is rejected and no current authored claim appears" --reporter=list` | Yes | `report.md#scenario-scn-012-006` |
| TP-10-06 | Regression E2E | e2e-ui | SCN-012-007 | `tests/web-evidence.spec.mjs` | `Regression: SCN-012-007 syndicated pages count as one origin in the safe evidence disclosure` | `npx --no-install playwright test tests/web-evidence.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-007 syndicated pages count as one origin in the safe evidence disclosure" --reporter=list` | Yes | `report.md#scenario-scn-012-007` |
| TP-10-07 | Regression E2E | e2e-ui | SCN-012-037 | `tests/web-evidence.spec.mjs` | `Regression: SCN-012-037 frozen safe bundle renders bounded metadata and no raw or hostile content` | `npx --no-install playwright test tests/web-evidence.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-037 frozen safe bundle renders bounded metadata and no raw or hostile content" --reporter=list` | Yes | `report.md#scenario-scn-012-037` |
| TP-10-08 | Broad regression | unit | SCN-012-006, SCN-012-007, SCN-012-037 | `scripts/selftest.mjs` | Preserve existing Brief/Center/source/model behavior and add acquisition-boundary/authority canaries | `node scripts/selftest.mjs` | No | `report.md#tp-10-08` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] Exact bounded acquisition policies, safe query rendering, robots/transport/source verification, hostile-content rejection, origin grouping, claim/owner mapping, and immutable bundle freeze are complete.
- [ ] One-origin and syndicated-common-origin material claims remain rejected; raw/unsafe/private/credential data is absent from prompts, logs, artifacts, DOM, and outputs.
- [ ] Acquisition has no author, repository-write, current-pointer, provider-key, owner-model, private-state, or public publication authority.
- [ ] Existing Feature 002 v1 Brief/payload/config behavior and rollback remain green.

#### Test Evidence Items - Exact Parity With 8 Test Plan Rows

- [ ] TP-10-01 unit evidence proves closed plan/policy/source/claim/origin/budget contracts.
- [ ] TP-10-02 functional evidence proves bounded acquisition, robots, extraction, freeze, and corroboration behavior.
- [ ] TP-10-03 security evidence proves every unsafe/private/instruction/budget mutation fails closed without echo.
- [ ] TP-10-04 validator evidence proves committed policies/fixtures produce deterministic accepted/refused results.
- [ ] TP-10-05 E2E evidence proves SCN-012-006 one-origin rejection in the real static UI.
- [ ] TP-10-06 E2E evidence proves SCN-012-007 syndicated-origin grouping in the real static UI.
- [ ] TP-10-07 E2E evidence proves SCN-012-037 safe bounded bundle projection with no hostile body.
- [ ] TP-10-08 broad selftest evidence proves existing Research Lab behavior remains green.

#### Build Quality Gate

- [ ] Scenario RED/GREEN, exact system-Chrome identity, no-interception scan, authority/import graph, robots/URL/budget/injection mutation matrix, content/credential/private sentinel scan, deterministic bytes, existing Brief/payload canaries, protected-path diff, editor diagnostics, `git diff --check`, source-lock, validators, artifact lint, and broad selftest are current and clean.
