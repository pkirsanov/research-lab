# Scope 09 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md)

## Summary

Scope 09 implement — **BATCH 1 of 2 (PARTIAL; NOT a completed phase)**. This dispatch delivered the PURE public projection module plus its unit/functional tests plus the contract validator, all GREEN in-session. The visible RENAME (`market-brief.html`/`tools.json`/`index.html`/`rlnav.js` → "Market Action Center"), the consumer-trace test (TP-09-03), and the e2e spec (TP-09-04..07) are DEFERRED to batch 2 — reported honestly. The route/registry id `market-brief` was NOT changed this dispatch.

Delivered (new): `rlmarketaction.js` (pure UMD composer/validator for `PortfolioTickerMatrix/v1` PUBLIC + `MarketActionCenterProjection/v1`), `tests/market-action.unit.mjs` (TP-09-01, 13/13), `tests/public-portfolio-matrix.functional.mjs` (TP-09-02, 10/10), `scripts/validate-market-action.mjs` (contract + forbidden-authority validator). Modified: `scripts/selftest.mjs` (Scope-09 canary group). `tool-experience.config.json` was NOT modified — `rlmarketaction.js` is a TOP-LEVEL module (like `rlbrief.js`), not an `rlexperience-adapters/*` module, so the `moduleAllowlist` (pattern `^rlexperience-adapters/…`) does not apply.

## Decision Record

- The public composer is PURE and consumes existing public reads + `watchlist.json` handed IN; it holds no I/O surface. Registry-derived domain→owner precedence is built from `tools.json` (design: "owner precedence is registry metadata, not page code").
- `MarketActionCenterProjection/v1` composes EXACTLY four top-level views (brief/portfolio/red-alert/journey). No Simple/Power/fifth top-level mode is derivable; evidence/experiments are in-view closed disclosures.
- Live Red Alert publication + authored ToolBrief/v2 Briefs = `dependency-pending:feature-002`; private Portfolio overlay = `dependency-pending:feature-008`. These are EXACT dependency-pending gates rendered here, NOT implemented (gated Scopes 11/12/13).

## Completion Statement

Batch 1 is a genuine GREEN milestone (pure module + TP-09-01 + TP-09-02 + validator + Scope-09 selftest canary, all in-session GREEN). Scope 09 remains **in_progress** — batch 2 (rename + TP-09-03 consumer-trace + TP-09-04..07 e2e) is required before any Core Delivery or E2E DoD item can be claimed. No DoD item is checked this dispatch; none of the 8 test-evidence items is fully satisfied without the batch-2 rename + live e2e. Feature `status` = `not_started`, `certifiedAt` = null — untouched.

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

**Deferred to batch 2 (route_required continuation):** TP-09-03 (`tests/market-action-consumer-trace.mjs`), TP-09-04..07 (`tests/market-action-center.spec.mjs` desktop e2e). These depend on the visible rename (`market-brief.html`/`tools.json`/`index.html`/`rlnav.js`) which was intentionally NOT performed this dispatch.

## Uncertainty Declarations

- **TP-09-01 "compatibility hashes":** the unit test proves the projection-level four-view semantics and rejects `simple`/`power` as top-level modes, which is the *contract* behind the legacy `#simple`→brief / `#power`→brief-evidence mapping. The actual `replaceState` hash-mapping lives in `market-brief.html` and is BATCH-2 UI work; it is NOT claimed complete here. TP-09-01's DoD box is therefore left unchecked.
- No Core Delivery or E2E DoD item is checked because the full vertical slice (rename + live browser e2e) is batch 2.

## Scenario Contract Evidence

### SCN-012-017

**Batch 2 (DEFERRED).** The visible rename to "Market Action Center" + the legacy-bookmark/hash e2e (TP-09-04) require the `market-brief.html`/`tools.json`/`index.html`/`rlnav.js` rename, which was intentionally not performed this dispatch. Batch 1 lays the projection contract the rename will mount: the unit test proves the composed Center exposes exactly `[brief, portfolio, red-alert, journey]` and rejects any fifth/Simple/Power top-level view (`RLMKT-VIEW`). Full SCN-012-017 e2e proof is owed in batch 2.

### SCN-012-019 — No action is a valid Brief (PROVEN at unit)

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

### SCN-012-022 — Watchlist never implies holdings (PROVEN at functional)

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

## Coverage Report

Batch-1 coverage is the two public contracts:
- `PortfolioTickerMatrix/v1` PUBLIC composer + validator — TP-09-02 (10/10) + selftest canary.
- `MarketActionCenterProjection/v1` composer + validator — TP-09-01 (13/13) + selftest canary.
- Contract + adversarial + forbidden-authority — `scripts/validate-market-action.mjs` (exit 0; 7 closed adversarial refusals).
Consumer-trace + live browser e2e coverage (TP-09-03..07) is owed in batch 2.

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

## Audit Verdict

Not yet audited. Batch 1 is a partial (in_progress) implement milestone. `route_required` continuation → `bubbles.implement` (batch 2: rename + consumer-trace + e2e), then `bubbles.test` for independent verification.
