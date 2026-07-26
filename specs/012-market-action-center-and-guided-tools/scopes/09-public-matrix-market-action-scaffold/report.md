# Scope 09 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md)

## Summary

Scope 09 implement — **BATCH 2 of 2 (code + tests COMPLETE; ready for `bubbles.test` finalization)**. Batch 1 delivered the PURE public projection module + unit/functional tests + validator. Batch 2 (this dispatch) delivers the two remaining tests against the already-shipped visible rename (commit `380812b4`): the consumer-trace test (TP-09-03) and the live-stack system-chrome e2e (TP-09-04..07) — all GREEN in-session. All 8 Test Plan rows now pass. The route/file `market-brief.html`, registry id `market-brief`, and payload IDs remain preserved; the four primary visible-identity surfaces read "Market Action Center". Scope 09 stays **in_progress** for independent `bubbles.test` verification (Feature `status` = `not_started`, `certifiedAt` = null — untouched).

Delivered (new): `rlmarketaction.js` (pure UMD composer/validator for `PortfolioTickerMatrix/v1` PUBLIC + `MarketActionCenterProjection/v1`), `tests/market-action.unit.mjs` (TP-09-01, 13/13), `tests/public-portfolio-matrix.functional.mjs` (TP-09-02, 10/10), `scripts/validate-market-action.mjs` (contract + forbidden-authority validator). Modified: `scripts/selftest.mjs` (Scope-09 canary group). `tool-experience.config.json` was NOT modified — `rlmarketaction.js` is a TOP-LEVEL module (like `rlbrief.js`), not an `rlexperience-adapters/*` module, so the `moduleAllowlist` (pattern `^rlexperience-adapters/…`) does not apply.

## Decision Record

- The public composer is PURE and consumes existing public reads + `watchlist.json` handed IN; it holds no I/O surface. Registry-derived domain→owner precedence is built from `tools.json` (design: "owner precedence is registry metadata, not page code").
- `MarketActionCenterProjection/v1` composes EXACTLY four top-level views (brief/portfolio/red-alert/journey). No Simple/Power/fifth top-level mode is derivable; evidence/experiments are in-view closed disclosures.
- Live Red Alert publication + authored ToolBrief/v2 Briefs = `dependency-pending:feature-002`; private Portfolio overlay = `dependency-pending:feature-008`. These are EXACT dependency-pending gates rendered here, NOT implemented (gated Scopes 11/12/13).

## Completion Statement

Batch 2 completes the Scope 09 code + test surface: all 8 Test Plan rows (TP-09-01 13/13, TP-09-02 10/10, TP-09-03 5/5, TP-09-04..07 4/4 live e2e, TP-09-08 selftest 945/0) are GREEN in-session with inline raw evidence. Regression guards hold: `node scripts/selftest.mjs` = 945/0, `node scripts/validate-brief-payload.mjs` = PASS, `watchlist.json` byte-unchanged, the no-interception scan is clean, and `regression-quality-guard.sh` reports 0 violations. Scope 09 remains **in_progress** — `bubbles.test` owns independent verification + the grouped Build Quality Gate before Done. Feature `status` = `not_started`, `certifiedAt` = null — untouched. `nextRequiredOwner` = `bubbles.test`.

## Code Diff Evidence

Change boundary (in-session `git status --short`), only the 5 owned files; the concurrent BUG-001 `scenario-manifest.json` is preserved (unstaged, not mine):

```text
 M scripts/selftest.mjs
 M specs/012-…/bugs/BUG-001-…/scenario-manifest.json   (concurrent BUG-001 — NOT touched by this dispatch)
?? rlmarketaction.js
?? scripts/validate-market-action.mjs
?? tests/market-action.unit.mjs
?? tests/public-portfolio-matrix.functional.mjs
```

**Batch 2 (this dispatch)** added ONLY the two remaining test files (committed `f2049709` consumer-trace, `c5de975b` e2e); the concurrent BUG-001 `scenario-manifest.json` remains preserved (unstaged, not mine):

```text
?? tests/market-action-consumer-trace.mjs
?? tests/market-action-center.spec.mjs
```

Scope 01-08 code byte-unchanged: `git diff --name-only` lists ONLY `scripts/selftest.mjs` (my additive canary) + the BUG-001 file (not mine). No `rlexperience*.js`, `rlexperience-adapters/**`, `simple-models.json`, `journeys.json`, `rljourney.js`, `rldata.js`, `data/options/**`, or `watchlist.json` appears in the diff.

## Test Evidence

Execution agents append one current-session block per Test Plan row with Phase, exact Command, Exit Code, Claim Source, and raw output.

<a id="tp-09-01"></a>
### TP-09-01 — Unit (`tests/market-action.unit.mjs`)

- **Phase:** implement
- **Command:** `node --test tests/market-action.unit.mjs`
- **Exit Code:** 0
- **Claim Source:** executed (current session)
- **RED proof:** with `rlmarketaction.js` moved aside (the intended "absent matrix/module" RED per the scope RED/GREEN contract), the run failed on the production-artifact existence guard — `AssertionError: production contract missing: rlmarketaction.js`, `UNIT_EXIT=1`. Module restored byte-identical; GREEN below.

```text
✔ SCN-012-019 a complete-coverage zero-action Brief states no action and fabricates nothing
✔ SCN-012-019 an admitted action suppresses the no-action state (no false no-action)
✔ SCN-012-017 the Center composes exactly the four top-level views in order
✔ a legacy #simple / #power hash maps only onto the closed four-view set (no fifth mode)
✔ dependency-pending gates are exact and not implemented (authored Brief, live alert, private overlay)
✔ claiming an authored/frozen-bundle Brief before Feature 002 is refused
✔ claiming a live Red Alert publication before Feature 002 is refused
✔ an empty Red Alert projection is an honest valid outcome
✔ long-context Brief disclosures default closed while limitations stay visible
✔ the four journey refs are exactly the committed global Market Action goals
✔ validateCenterProjection round-trips a composed projection and reports three pending gates
✔ validateCenterProjection rejects a tampered fifth view, gate downgrade, and fabricated no-action
✔ refusal errors are closed and never echo the offending value
ℹ tests 13
ℹ pass 13
ℹ fail 0
TP0901_EXIT=0
```

<a id="tp-09-02"></a>
### TP-09-02 — Public matrix functional (`tests/public-portfolio-matrix.functional.mjs`)

- **Phase:** implement
- **Command:** `node --test tests/public-portfolio-matrix.functional.mjs`
- **Exit Code:** 0
- **Claim Source:** executed (current session)
- **RED proof:** with `rlmarketaction.js` absent → `tests 10 / pass 0 / fail 10`, all 10 `AssertionError: production contract missing: rlmarketaction.js`, `FUNCTIONAL_EXIT=1`. Module restored; GREEN below. (One intermediate RED during authoring correctly caught a test-only false positive — my `forbiddenCopy` regex matched the composer's own privacy-assertion DENIAL text; fixed to scan the per-ticker rows/scope-summary, then GREEN.)

```text
✔ SCN-012-022 every composed public row is labeled Public watchlist
✔ SCN-012-022 no holding/quantity/cost/P&L/mandate/exposure field or copy exists in the matrix
✔ SCN-012-022 every cell carries an explicit applicability and closed state (never neutral by omission)
✔ an applicable domain with no owner read is explicitly unavailable with a gap reason
✔ scheduled public per-ticker Brief and private overlay remain dependency-pending gates
✔ SCN-012-022 the composer REFUSES any input carrying a Feature 008 private field
✔ the PUBLIC validator refuses a private-workspace row
✔ the validator rejects a neutral-by-omission cell (absent state)
✔ SCN-012-022 sentinel: compose+validate touches no fetch/providerFetch/storage and reads no Feature 008 key
✔ storage-write sentinel: composing the matrix leaves watchlist.json byte-identical
ℹ tests 10
ℹ pass 10
ℹ fail 0
```

<a id="tp-09-03"></a>
### TP-09-03 — Consumer trace (`tests/market-action-consumer-trace.mjs`)

- **Phase:** implement
- **Command:** `node --test tests/market-action-consumer-trace.mjs`
- **Exit Code:** 0 (`TP0903_EXIT=0`)
- **Claim Source:** executed (current session)
- **Non-tautology proof:** the `adversarial` sub-test reverts the page `<title>` to `Actionable Market Brief` IN-MEMORY and asserts the SAME classifier reports exactly one `blocking-stale-reference` — the classifier detects a real regression (not vacuously green). No disk was mutated.

```text
[consumer-trace] scannedFiles=1966
[consumer-trace] filesWithOldNameOrIdentityRef=278
[consumer-trace] oldVisibleOccurrences=881
[consumer-trace] identityRefOccurrences=1384
[consumer-trace] bucket.immutable-history=1763
[consumer-trace] bucket.routed-to-Scope-14-docs=87
[consumer-trace] bucket.explicit-compat-alias=6
[consumer-trace] bucket.in-scope-source-or-tests=409
[consumer-trace] blockingStaleReferences=0
✔ TP-09-03 the renamed route/file and registry id are preserved (identity compat, singular)
✔ TP-09-03 every primary visible-identity surface is migrated to Market Action Center (zero blocking stale reference)
✔ TP-09-03 adversarial: the classifier flags a reverted product title (non-tautological)
✔ TP-09-03 the route/file, registry id and index card are singular (no duplicate consumer)
✔ TP-09-03 the whole repository is enumerated and every old-name occurrence is classified (blocking bucket empty)
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

The enumeration classifies every old-visible-name / `market-brief` identity-ref occurrence across 1966 files: 1763 immutable-history (`specs/**` evidence, committed `*.jsonl`, payload/snapshot data), 87 routed-to-Scope-14-docs (managed `notes/**`/`.github/**`/README), 6 explicit-compat-alias (config/watchlist data), and 409 in-scope source/tests occurrences — all migrated-visible-copy / explicit-compat-alias (route/id refs, peer/tool references, declared `publicAliases`), **0 blocking**. All four primary visible-identity surfaces read "Market Action Center"; route/file `market-brief.html`, registry id `market-brief`, and payload IDs are preserved and singular.

<a id="tp-09-08"></a>
### TP-09-08 — Broad regression (`scripts/selftest.mjs`)

- **Phase:** implement
- **Command:** `node scripts/selftest.mjs`
- **Exit Code:** 0 (`SELFTEST_EXIT=0`)
- **Claim Source:** executed (current session)

```text
Feature 012 Scope 09 Market Action Center PUBLIC projection + public portfolio matrix
  ✓ rlmarketaction.js owns zero forbidden fetch/providerFetch/storage-write/publisher/LLM capability
  ✓ SCN-012-022 public matrix labels every row `Public watchlist` with one explicit applicable/state cell per domain (never neutral by omission)
  ✓ the composed public matrix validates round-trip and matches the validator row count
  ✓ the public composer refuses a smuggled Feature 008 private field (RLMKT-PRIVACY) and never echoes the private value
  ✓ SCN-012-019 the Center composes exactly four views + three exact dependency-pending gates + a truthful no-action Brief that fabricates no action/catalyst/confidence
  ✓ the market-action contract validator reports four views, three pending gates, and seven distinct closed RLMKT-* adversarial refusals
…
Research-Lab self-test: 945 passed, 0 failed
```

The Scope-09 canary group added 5 assertions; the full suite moved 939 → 945 passed, 0 failed.

**Delivered in batch 2 (this dispatch):** TP-09-03 (`tests/market-action-consumer-trace.mjs`, 5/5) + TP-09-04..07 (`tests/market-action-center.spec.mjs` live-stack system-chrome, 4/4) — both GREEN in-session against the already-shipped visible rename (commit `380812b4`). Committed: `f2049709` (consumer-trace), `c5de975b` (e2e).

## Uncertainty Declarations

- **TP-09-01 "compatibility hashes" — now proven end-to-end:** the unit test proved the projection-level four-view semantics (rejecting `simple`/`power` as top-level modes); TP-09-04/07 now prove the ACTUAL `replaceState` legacy-hash mapping in the live browser (`#simple`/`#power` → `#brief`, `#power` opening the evidence disclosure). No residual uncertainty.
- **Certification is out of scope for this implement dispatch:** the Build Quality Gate (protected-path diff, editor diagnostics, source-lock, audit) and the grouped DoD certification are owned by `bubbles.test`. Scope 09 is held `in_progress` for that independent verification.

## Scenario Contract Evidence

<a id="scenario-scn-012-017"></a>
### SCN-012-017 — Market Brief route becomes Market Action Center (PROVEN at live e2e — TP-09-04)

- **Phase:** implement
- **Command:** `npx --no-install playwright test tests/market-action-center.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-017 existing Market Brief bookmark opens renamed Center with exact four views" --reporter=list`
- **Exit Code:** 0 (`TP0904_EXIT=0`)
- **Claim Source:** executed (current session)

Live-stack against the REAL `market-brief.html` route + REAL four-view shell (`rlviews.js`) + REAL Center controller (zero request interception): visible `<title>` & `h1.logo` = "Market Action Center"; exactly 4 tabs `[brief, portfolio, red-alert, journey]` labeled `[Brief, Portfolio, Red Alert, Journey]` with no fifth/Simple/Power tab; the `[data-rlbrief-mount][data-tool-id="market-brief"]` anchor is `data-rlexperience-state="registered"` (route/id preserved); a bare bookmark boots Brief; a legacy `#simple` bookmark maps to `#brief` via boot `replaceState`; a legacy `#power` bookmark maps to `#brief` AND opens the Brief evidence disclosure (`#mac-evidence[open][data-mac-evidence-open="power"]`); Back/Forward restore the exact pushed tab.

```text
Running 1 test using 1 worker
  ✓  1 [system-chrome] › tests/market-action-center.spec.mjs:88:1 › Regression: SCN-012-017 existing Market Brief bookmark opens renamed Center with exact four views (3.8s)
  1 passed (5.2s)
TP0904_EXIT=0
```

<a id="tp-09-07"></a>
### TP-09-07 — Legacy hashes / provenance / windows / gates / closed disclosures (live e2e)

- **Phase:** implement
- **Command:** `npx --no-install playwright test tests/market-action-center.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: legacy hashes payload provenance windows action gates and closed disclosures remain truthful" --reporter=list`
- **Exit Code:** 0 (`TP0907_EXIT=0`)
- **Claim Source:** executed (current session)

Live-stack: legacy `#simple`/`#power` both normalize to `#brief` (no private value in history); the Brief lead shows the ACTUAL `data-mac-provenance="legacy-market-brief-payload"` with `data-mac-author-state="dependency-pending:feature-002"` (authored ToolBrief/v2 stays gated — no frozen-bundle claim); the four ET action-gate windows render (`#windowBtns .win` = 4); Red Alert is the honest empty projection behind `data-mac-gate="dependency-pending:feature-002"`; Journey exposes exactly 4 committed goals with the portfolio-stress goal `data-mac-gate="dependency-pending:feature-008"`; the evidence disclosure stays CLOSED on a plain Brief load.

```text
Running 1 test using 1 worker
  ✓  1 [system-chrome] › tests/market-action-center.spec.mjs:224:1 › Regression: legacy hashes payload provenance windows action gates and closed disclosures remain truthful (3.6s)
  1 passed (5.0s)
TP0907_EXIT=0
```

<a id="scenario-scn-012-019"></a>
### SCN-012-019 — No action is a valid Brief (PROVEN at unit + live e2e — TP-09-05)

With complete coverage and zero admitted actions, the composed Brief states no current action clears the bar and manufactures NO trade/catalyst/confidence. Proof (from TP-09-01 + the Scope-09 selftest canary):

```text
node -e composeCenterProjection({coverageComplete:true, actions:[]}) →
  views.brief.noAction = {
    coverageComplete: true,
    statement: "No current action clears the bar for this window.",
    fabricatedAction: false, fabricatedCatalyst: false, fabricatedConfidence: false }
  views.brief.actions        = []           (zero — no fabricated action)
  views.brief.imminentCatalysts = []        (no fabricated catalyst)
  serialized projection: /confidence":[0-9]/ = false, /"probability":[0-9]/ = false  (no fabricated numeric claim)
  validateCenterProjection rejects a tampered noAction.fabricatedCatalyst=true → RLMKT-NOACTION
  an admitted action suppresses noAction (noAction === null when actions.length===1)
```

**Live e2e (TP-09-05, exit 0):** driving the REAL `window.__rlmac.renderBrief({coverageComplete:true, actions:[]})` → `#mac-center [data-mac-noaction]` renders with `<b>` = exactly "No current action clears the bar for this window." and `data-mac-noaction-fabricated="false"`; the `#mac-center` text carries no numeric confidence/probability and no fabricated action/catalyst row; the authored-brief gate `data-mac-author-state="dependency-pending:feature-002"` is present. Adversarial: an admitted action (`renderBrief({coverageComplete:true, actions:[{…}]})`) removes `[data-mac-noaction]` entirely (no false no-action). The evidence drawer stays closed on a plain load.

```text
  ✓  1 [system-chrome] › Regression: SCN-012-019 complete coverage with zero admitted actions renders no-action and no invented row (3.2s)
  1 passed (4.5s)
TP0905_EXIT=0
```

<a id="scenario-scn-012-022"></a>
### SCN-012-022 — Watchlist never implies holdings (PROVEN at functional + live e2e — TP-09-06)

Every public row is labeled `Public watchlist`; no holding/quantity/cost/P&L/mandate/exposure field or copy exists; the composer refuses any smuggled Feature 008 private field; and a storage/request sentinel proves ZERO Feature 008 key read/create and ZERO fetch/providerFetch/storage access. Proof (from TP-09-02):

```text
compose from REAL watchlist.json (4 tickers) →
  every row: scopeClass="public-watchlist", scopeLabel="Public watchlist" (== PUBLIC_SCOPE_LABEL)
  every row: 7 cells (one per domain), each cell applicability ∈ {applicable,not-applicable}, state ∈ closed-6, non-current → gapReason
  not-applicable cells are NOT counted as coverage gaps
  privacyAssertion: publicOnly=true, feature008KeyRead=false, feature008KeyCreated=false, privateFieldsPresent=false
  ownership-implying copy scan on rows+scopeSummary = false
private-field barrier: smuggling quantity/holding/costBasis/pnl/mandate/personalExposure → RLMKT-PRIVACY, value never echoed
storage/request sentinel: install throwing globalThis.{fetch,localStorage,sessionStorage,XMLHttpRequest,RLDATA,RLAPP};
  compose+validate → ok=true, sentinel call-log = []  (pure composer touched no forbidden capability)
storage-write sentinel: sha256(watchlist.json) before === after  (composer never writes watchlist.json)
```

**Live e2e (TP-09-06, exit 0):** open the real page, click the Portfolio tab → `[data-mac-matrix]` renders; every `[data-mac-row]` carries `[data-mac-scope-label]` = "Public watchlist", closed explicit cells (`data-mac-state` ∈ the closed six, `data-mac-applicability` ∈ applicable/not-applicable), and NO private holding/quantity/cost/P&L/mandate/exposure field or copy; the private overlay is `data-mac-gate="dependency-pending:feature-008"`; the live `window.__rlmac.getMatrix().privacyAssertion` reports `publicOnly=true, feature008KeyRead=false, feature008KeyCreated=false, privateFieldsPresent=false` and every row `scopeClass="public-watchlist"`. A PASSIVE storage-API sentinel (recording wrapper installed pre-boot, returns the real value) proves ZERO private Feature-008 key was read or created during the render.

```text
  ✓  1 [system-chrome] › Regression: SCN-012-022 public watchlist row never exposes or implies a holding (3.4s)
  1 passed (5.0s)
TP0906_EXIT=0
```

## Coverage Report

Batch-1 coverage is the two public contracts:
- `PortfolioTickerMatrix/v1` PUBLIC composer + validator — TP-09-02 (10/10) + selftest canary.
- `MarketActionCenterProjection/v1` composer + validator — TP-09-01 (13/13) + selftest canary.
- Contract + adversarial + forbidden-authority — `scripts/validate-market-action.mjs` (exit 0; 7 closed adversarial refusals).
Consumer-trace (TP-09-03, 5/5) enumerates the whole repository (1966 files, 0 blocking stale references, adversarial non-tautology proof); live browser e2e (TP-09-04..07, 4/4 system-chrome) covers the rename / exact four views / legacy-hash / bookmark / Back-Forward / no-action / public-row / gates against the REAL stack with zero interception. All 8 Test Plan rows are GREEN.

## Lint/Quality

## Spot-Check Recommendations

## Validation Summary

- **`node scripts/validate-market-action.mjs`** → exit 0:

```text
[market-action] moduleAuthorityScan=PASS forbiddenCapabilities=0 scanned=10
[market-action] publicMatrix=PASS rows=4 coveredCells=3 gaps=15 scopeLabel="Public watchlist"
[market-action] centerProjection=PASS views=4 gatesPending=3 activeView=brief
[market-action] adversarial=private-field-smuggle result=REJECTED code=RLMKT-PRIVACY
[market-action] adversarial=private-workspace-row result=REJECTED code=RLMKT-SCOPE
[market-action] adversarial=neutral-by-omission-cell result=REJECTED code=RLMKT-CELL
[market-action] adversarial=fifth-top-level-view result=REJECTED code=RLMKT-VIEW
[market-action] adversarial=gate-downgrade result=REJECTED code=RLMKT-GATE
[market-action] adversarial=fabricated-no-action result=REJECTED code=RLMKT-NOACTION
[market-action] adversarial=authored-brief-before-gate result=REJECTED code=RLMKT-GATE
[market-action] OK adversarial=7 unexpectedAcceptances=0
VALIDATOR_EXIT=0
```

- **Forbidden-authority DIRECT scan on `rlmarketaction.js`** (executable occurrences): `fetch(` 0, `providerFetch(` 0, `localStorage.` 0, `sessionStorage.` 0, `.setItem(` 0, `XMLHttpRequest` 0, `WebSocket` 0, `rlProviderConfig` 0, `author(` 0, `publish(` 0, `require(` 0, `import ` 0 — the module is a pure dependency-free UMD.
- **`node scripts/selftest.mjs`** → 945 passed / 0 failed (exit 0), Scope-09 canary 5/5.
- **`bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools`** → `Artifact lint PASSED.` (`ARTIFACT_LINT_EXIT=0`).
- **`repo-binding-preflight.sh --agent-source research-lab`** → exit 0 (first action).
- **`node --test tests/market-action-consumer-trace.mjs`** → 5/5, exit 0 (repo enumerated: 1966 files scanned, 0 blocking stale references; adversarial reverted-title sub-test proves the classifier is non-tautological).
- **`npx playwright test tests/market-action-center.spec.mjs --project=system-chrome`** → 4/4, exit 0 (live-stack; zero request interception).
- **no-interception scan** on `tests/market-action-center.spec.mjs` → clean (0 matches for `page.route`/`context.route`/`intercept(`/`cy.intercept`/`msw`/`nock`/`wiremock`/`fulfill(`).
- **`regression-quality-guard.sh tests/market-action-center.spec.mjs`** → 0 violation(s), 0 warning(s), exit 0.
- **`node scripts/validate-brief-payload.mjs`** → `[brief-contract] PASS`, exit 0 (Brief payload/registry/actions intact under the rename).

## Audit Verdict

Not yet audited. Batch 2 completes the Scope 09 code + test surface (all 8 Test Plan rows GREEN in-session; selftest 945/0; validate-brief-payload PASS; no-interception clean; regression-quality-guard 0 violations; artifact-lint PASSED). Scope 09 remains `in_progress`. `nextRequiredOwner` = `bubbles.test` for independent verification + the grouped Build Quality Gate (protected-path diff, editor diagnostics, source-lock, audit) before Done.

## Independent Verification (bubbles.test)

Independent re-verification (full-delivery; recorded evidence **not** trusted — every Test Plan row reproduced from scratch this session at HEAD `df37f198` with the exact `scope.md` commands, full unfiltered output, no truncation/redirect-to-file/`--no-verify`). `repo-binding-preflight.sh --agent-source research-lab` exit 0 was the first action. **Verdict: Scope 09 = done, substate = independently_verified.** Feature `status` = `not_started`, `certifiedAt` = null, `certification.status` = `not_started` — UNTOUCHED (Scope 9 of 14).

### Reproduced Test Plan rows (this session)

| Row | Command | Result | Exit |
|---|---|---|---|
| TP-09-01 | `node --test tests/market-action.unit.mjs` | tests 13 / pass 13 / fail 0 | 0 |
| TP-09-02 | `node --test tests/public-portfolio-matrix.functional.mjs` | tests 10 / pass 10 / fail 0 | 0 |
| TP-09-03 | `node --test tests/market-action-consumer-trace.mjs` | tests 5 / pass 5 / fail 0; `blockingStaleReferences=0` (1967 files scanned) | 0 |
| TP-09-04 | `npx --no-install playwright test tests/market-action-center.spec.mjs … --grep "Regression: SCN-012-017 …exact four views"` | 1 passed | 0 |
| TP-09-05 | `… --grep "Regression: SCN-012-019 …no-action and no invented row"` | 1 passed | 0 |
| TP-09-06 | `… --grep "Regression: SCN-012-022 …never exposes or implies a holding"` | 1 passed | 0 |
| TP-09-07 | `… --grep "Regression: legacy hashes payload provenance windows action gates and closed disclosures remain truthful"` | 1 passed | 0 |
| (full spec) | `npx … playwright test tests/market-action-center.spec.mjs --project=system-chrome --reporter=list` | 4 passed (17.2s) | 0 |
| TP-09-08 | `node scripts/selftest.mjs` | `Research-Lab self-test: 945 passed, 0 failed` (Scope-09 canary group present) | 0 |
| validator | `node scripts/validate-market-action.mjs` | `moduleAuthorityScan=PASS forbiddenCapabilities=0`; `publicMatrix=PASS rows=4 scopeLabel="Public watchlist"`; `centerProjection=PASS views=4 gatesPending=3`; adversarial 7 REJECTED, unexpectedAcceptances=0 | 0 |
| validator | `node scripts/validate-brief-payload.mjs` | `[brief-contract] PASS` | 0 |

### Eight confirmation checks

1. **SCN-012-017 rename + route/ID/payload stability** — `git diff 3a86d1a3..HEAD -- market-brief.config.json` is **empty** (payload IDs + scheduler byte-unchanged, stronger than "IDs preserved"). `tools.json` / `index.html` / `rlnav.js` diffs change ONLY the visible `title`/`nav.label` to "Market Action Center"; `id: 'market-brief'` and `file: 'market-brief.html'` are preserved and singular. `market-brief.html` / `rlbrief.js` edits are purely additive (`#mac-center` section + controller; `renderCenterNoAction` export). TP-09-04/07 prove `#simple`/`#power` → `#brief` via boot `replaceState`, `#power` opens the evidence disclosure, and Back/Forward restore the exact tab on the REAL route.
2. **SCN-012-019 no-action truthful** — reproduced at unit (TP-09-01) and live e2e (TP-09-05): complete coverage + zero admitted actions → exact `NO_ACTION_STATEMENT`, `fabricatedAction/Catalyst/Confidence=false`, zero actions/catalysts, no numeric confidence/probability in the serialized projection; an admitted action suppresses no-action.
3. **SCN-012-022 public-only** — reproduced at functional (TP-09-02) and live e2e (TP-09-06): every row `scopeLabel="Public watchlist"`; no holding/quantity/cost/P&L/mandate/exposure field or copy; storage/request sentinel proves ZERO Feature-008 key read/created and zero fetch/storage; `watchlist.json` byte-unchanged, `sha256=8d65ba89aaf72e45ad1f6ab1db0eb6133f813f174b9eb3494a5aabe64bc28eb1`.
4. **Consumer-trace non-tautological** — TP-09-03 sub-test "adversarial: the classifier flags a reverted product title (non-tautological)" passes: reverting the `<title>` in-memory makes the SAME classifier report exactly one `blocking-stale-reference` (no disk mutation). Green run: `blockingStaleReferences=0`.
5. **No-interception** — raw grep of `page.route|context.route|.intercept|msw|nock|wiremock|fulfill(|cy.intercept` on `tests/market-action-center.spec.mjs` = **zero matches** (grep exit 1) — none in code or comments; the spec drives a real `page.goto` + real `market-brief.html` route + real Center runtime.
6. **RED-bite (adversarial, read-only-safe)** — neutralized a real behavior in `rlmarketaction.js` (the no-action projection's `fabricatedCatalyst: false` → `true`); the targeted assertion genuinely FAILED (`node --test --test-name-pattern="fabricates nothing"` → `AssertionError: true !== false` at `tests/market-action.unit.mjs:80`, exit 1). Restored byte-identical via `git checkout HEAD -- rlmarketaction.js` — `sha256` before `f7d43ca33cb78ff15914b996012ad7d0913222aa8da84781d56f1aa7c1251617` == after; re-run GREEN (1 passed, exit 0). `git status --short` afterward shows ONLY the concurrent BUG-001 `scenario-manifest.json` — no neutralized file left in the tree.
7. **Forbidden-authority + protected paths** — comment-stripped scan of `rlmarketaction.js`: the only two `fetch/providerFetch/localStorage/…` occurrences are lines 37-38 INSIDE the JSDoc block comment (documentation of the purity invariant); **0 executable** fetch/providerFetch/credential/LLM/publisher/storage-write (corroborated by `validate-market-action.mjs moduleAuthorityScan=PASS forbiddenCapabilities=0`). `git diff 3a86d1a3..HEAD` and `git status --short` are BOTH empty for `rlexperience.js`, `rlexperience-adapters/**`, `simple-models.json`, `journeys.json`, `rljourney.js`, `rldata.js`, `data/options/**`, `watchlist.json` — all byte-unchanged.
8. **Rollback (Core-Delivery item 4) — truthful, reasoned** — Scope-09 is additive-only: `market-brief.config.json` empty diff (payload + scheduler untouched), `watchlist.json` byte-unchanged, `id`/`file` `market-brief` preserved, no scheduler/workflow file in the diff. Reverting the Scope-09 additions (restore prior `title`/`nav.label` text + delete the new module/validator/tests + drop the additive `renderCenterNoAction` export and `#mac-center` controller) restores the prior Market Brief visible behavior via a forward revert — no history rewrite, no payload/watchlist/local-data change. The claim is verified truthful without a destructive run.

**No coverage gap; no test change required.** Scope 09 status set to `done`, substate `independently_verified`; next owner `bubbles.implement`, next scope `10-bounded-web-evidence-acquisition`. Feature status / certification untouched.
