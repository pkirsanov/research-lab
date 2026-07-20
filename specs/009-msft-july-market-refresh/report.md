# Report: 009 MSFT July Market Refresh

Execution plan: [scopes.md](scopes.md). Human acceptance: [uservalidation.md](uservalidation.md).

## Summary

## Baseline And Red Evidence

### Scope 1

#### TP-009-S1-01

**Phase:** test
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

The current-session command reached the new Feature 009 group and failed on the first absent planned production function. The same run also reported one unrelated existing Market Brief failure; no claim is made that the rest of the repository baseline is green.

```text
  ✓ Technical Analysis Decision finite boundary rejects null and Infinity
  ✓ RLVALID exposes all seven exact Node-safe declarations once
  ✓ RLVALID builds deterministic purged and embargoed folds
  ✓ RLVALID multiplicity adjustments are finite bounded and deterministic
  ✓ RLVALID interval quantiles and outcome summary execute real generic logic
  ✓ RLVALID returns byte-identical deflated-statistic results across 100 identical inputs
  ✓ RLDATA stores and reads a source-qualified non-daily interval envelope
  ✓ RLDATA qualified interval series preserves legacy bars barInfo and tool reads byte-for-byte
  ✓ Strategy Validation local control and RLVALID adapter retain exact generic statistic parity
  ✓ Strategy Validation delegates only through the marker-bounded RLVALID parity adapter

Feature 009 Scope 1 cache-owned MSFT market truth
  ✗ FAIL (Feature 009 Scope 1 group threw): function not found: msftValidateQuoteEnvelope

================================================
Research-Lab self-test: 484 passed, 2 failed
================================================
```

This is red evidence only. TP-009-S1-01 remains incomplete pending production implementation and a later green rerun of the identical command.

#### TP-009-S1-02

**Phase:** test
**Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-001/002/005 cache-first market truth"`
**Exit Code:** 1
**Claim Source:** executed

```text
Running 1 test using 1 worker

  ✘  1 …s:46:1 › Regression: SCN-009-001/002/005 cache-first market truth (1.9s)


  1) [system-chrome] › tests/msft-july-market-refresh.spec.mjs:46:1 › Regression: SCN-009-001/002/005 cache-first market truth

    Error: planned window.MsftJulyModel production controller must exist

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      78 |
      79 |   const hasProductionController = await page.evaluate(() => Boolean(window.MsftJulyModel));
    > 80 |   expect(hasProductionController, 'planned window.MsftJulyModel production controller must exist').toBe(true);
         |                                                                                                    ^
      81 |
      82 |   expect(firstPaintSnapshotPromise, 'cache request must expose the null-safe static first-paint state').toBeTruthy();
      83 |   const firstPaintState = await firstPaintSnapshotPromise;
        at /Users/pkirsanov/Projects/research-lab/tests/msft-july-market-refresh.spec.mjs:80:100

  1 failed
    [system-chrome] › tests/msft-july-market-refresh.spec.mjs:46:1 › Regression: SCN-009-001/002/005 cache-first market truth
```

This is red evidence only. TP-009-S1-02 remains incomplete pending production implementation and a later green rerun of the identical command.

### Scope 2

#### TP-009-S2-01

**Phase:** test
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

Before any Scope 2 production function existed, the new marker-bounded Feature 009 Scope 2 group failed deterministically at its first absent production function while every Scope 1 assertion continued to pass. The exact discriminator is `function not found: msftAggregateMarketStatus` — the first not-yet-implemented Scope 2 production function extracted by the group. The single new failure is that throw; no other regression appeared.

```text
  ✓ Feature 009 accepted state keeps model quote bar retrieval and evaluation clocks distinct with no ambiguous data_as_of
  ✓ Feature 009 accepted state preserves the model cutoff and daily-only technical ownership
  ✓ Feature 009 accepted state is deeply immutable across market truth branches
  ✓ Feature 009 production-validated quote replacement changes quote-owned fields only

Feature 009 Scope 2 isolated degraded market states
  ✗ FAIL (Feature 009 Scope 2 group threw): function not found: msftAggregateMarketStatus

================================================
Research-Lab self-test: 645 passed, 1 failed
================================================
```

This is red evidence only. TP-009-S2-01 remained incomplete pending production implementation and an identical green rerun of the same command.

#### TP-009-S2-02

**Phase:** test
**Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-006/007/008 degraded resources stay isolated"`
**Exit Code:** 1
**Claim Source:** executed

Before the public production reducer existed, the new degraded-state browser scenario failed deterministically on the absent `window.MsftJulyModel.applyResourceOutcome` production operation.

```text
Running 1 test using 1 worker

  ✘  1 …Regression: SCN-009-006/007/008 degraded resources stay isolated (538ms)

  1) [system-chrome] › tests/msft-july-market-refresh.spec.mjs:209:1 › Regression: SCN-009-006/007/008 degraded resources stay isolated

    Error: planned window.MsftJulyModel.applyResourceOutcome production reducer must exist

    expect(received).toBe(expected) // Object.is equality

    Expected: true
    Received: false

      219 |   const hasReducerOperation = await page.evaluate(() => typeof window.MsftJulyModel?.applyResourceOutcome === 'function');
    > 220 |   expect(hasReducerOperation, 'planned window.MsftJulyModel.applyResourceOutcome production reducer must exist').toBe(true);

  1 failed
```

This is red evidence only. The exact discriminator is the absent `window.MsftJulyModel.applyResourceOutcome` production reducer operation (Expected true, Received false). TP-009-S2-02 remained incomplete pending production implementation and an identical green rerun.

### Scope 3

### Scope 4

### Scope 5

## Test Evidence

### Scope 1

#### Focused Browser Regression After The First-Paint Repair

**Phase:** implement
**Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-001/002/005 cache-first market truth"`
**Exit Code:** 0
**Claim Source:** executed

```text
FEATURE009_SCOPE1_FOCUSED_BEGIN
SCENARIOS=SCN-009-001,SCN-009-002,SCN-009-005
TEST_TYPE=e2e-ui

Running 1 test using 1 worker

  ✓  1 …s:46:1 › Regression: SCN-009-001/002/005 cache-first market truth (1.0s)

  1 passed (3.1s)
FOCUSED_EXIT=0
FOCUSED_RESULT=PASS
FEATURE009_SCOPE1_FOCUSED_END
```

#### Functional Assertions And Repository Baseline

**Phase:** implement
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** interpreted
**Interpretation:** The seven marker-bounded Feature 009 Scope 1 assertions passed. The command remained nonzero because the separate Market Brief payload assertion failed, so TP-009-S1-01 and Scope 1 remain incomplete.

Relevant Feature 009 window (lines 674-700 of the full preserved output):

```text
Feature 009 Scope 1 cache-owned MSFT market truth
  ✓ Feature 009 quote validator accepts the actual cache value and exact quote c
locks
  ✓ Feature 009 bar validator accepts every actual daily row and exact bar clock
s
  ✓ Feature 009 daily close and SMA20/SMA50/SMA200 equal independent test math o
ver actual daily rows
  ✓ Feature 009 High252 stack and signed distances equal independent test math o
ver actual daily rows
  ✓ Feature 009 delayed quote differs from and never contaminates the last daily
 close
  ✓ Feature 009 accepted state keeps model quote bar retrieval and evaluation cl
ocks distinct with no ambiguous data_as_of
  ✓ Feature 009 accepted state preserves the model cutoff and daily-only technic
al ownership

================================================
Research-Lab self-test: 491 passed, 1 failed
================================================
SELFTEST_EXIT=1

Command exited with code 1
```

Unrelated baseline-finding window (lines 420-432 of the same output):

```text
  ✓ same-origin bar snapshots include brief thematic-group ETFs and members

market brief — registry-wide coverage + action-only payload contract
  ✗ FAIL: current payload satisfies the executable brief contract: nextSession.s
essionDate must match snapshot.nextSessionDate
  ✓ contract rejects omission of a registered tool
  ✓ contract rejects a generic real-assets read without GLD/BTC/SLV detail
  ✓ contract rejects watch-only or incomplete next-session output
  ✓ contract rejects a missing visible brief section
  ✓ contract rejects an incomplete structural backdrop
  ✓ contract rejects a missing generation timestamp
```

#### Per-Page Inline Script And ID Parser

**Phase:** implement
**Command:** `PAGE=msft-july-print-model.html node -e 'const fs=require("node:fs");const p=process.env.PAGE;if(!p)throw new Error("PAGE is required");const h=fs.readFileSync(p,"utf8");const scripts=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());if(!scripts.length)throw new Error("no inline script: "+p);scripts.forEach((s,i)=>{try{new Function(s)}catch(e){throw new Error("inline script "+(i+1)+": "+e.message)}});const ids=new Set([...h.matchAll(/\bid=["\x27]([^"\x27]+)["\x27]/g)].map(m=>m[1]));const refs=scripts.flatMap(s=>[...s.matchAll(/getElementById\(\s*["\x27]([^"\x27]+)["\x27]\s*\)/g)].map(m=>m[1]));const missing=[...new Set(refs.filter(id=>!ids.has(id)))];if(missing.length)throw new Error("missing ids: "+missing.join(", "));console.log("OK page="+p+" inline="+scripts.length+" refs="+refs.length)'`
**Exit Code:** 0
**Claim Source:** executed

```text
OK page=msft-july-print-model.html inline=4 refs=50
```

#### Independent Test-Phase Focused Browser Evidence

**Phase:** test
**Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-001/002/005 cache-first market truth"`
**Exit Code:** 0
**Claim Source:** executed

```text
Running 1 test using 1 worker

  ✓  1 …:46:1 › Regression: SCN-009-001/002/005 cache-first market truth (749ms)
[SCN-009-001] firstPaint=loading/loading quote=null technicalClose=null
[SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=0
[SCN-009-001] sharedWriteFailures=quote:1,bars:1 reportFailures=2
[SCN-009-001] quoteReportKeys=label,providerAsOf,retrievedAt,sharedWrite,sourceId
[SCN-009-001] barsReportKeys=cutoff,label,retrievedAt,rowCount,sharedWrite,sourceId
[SCN-009-002] modelAsOf=2026-07-06
[SCN-009-002] quoteProviderAsOf=2026-07-15T15:59:59 quoteRetrievedAt=2026-07-15T21:00:20.694Z
[SCN-009-002] barsCutoff=2026-07-15 barsRetrievedAt=2026-07-15T21:01:38.963Z
[SCN-009-002] uniqueClocks=6 data_as_of=absent
[SCN-009-005] dailyRows=501 quote=395.4 dailyClose=395.6300048828125
[SCN-009-005] technicalOwners=close,sma20,sma50,sma200,high252,stack,signedDistances source=dailyRowsOnly

  1 passed (2.3s)
```

The test uses the real page and committed static server. Its fault injection replaces only shared publication methods; it does not intercept either cache request or supply a canned response. Both actual cache responses still pass through the production validators before accepted-state assertions run.

#### Independent Test-Phase Functional Evidence

**Phase:** test
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** interpreted
**Interpretation:** All twelve marker-bounded Feature 009 assertions passed against extracted production functions and parsed current caches. The exact repository command did not pass, so TP-009-S1-01 remains incomplete; the sole aggregate failure is separately accounted below.

Relevant Feature 009 window from the full current-session output:

```text
Feature 009 Scope 1 cache-owned MSFT market truth
  ✓ Feature 009 quote validator accepts the actual cache value and exact quote clocks
  ✓ Feature 009 bar validator accepts every actual daily row and exact bar clocks
  ✓ Feature 009 quote validator rejects every closed failure class with its exact reason code
  ✓ Feature 009 bar validator rejects every closed failure class with its exact reason code
  ✓ Feature 009 daily close and SMA20/SMA50/SMA200 equal independent test math over actual daily rows
  ✓ Feature 009 High252 stack and signed distances equal independent test math over actual daily rows
  ✓ Feature 009 delayed quote differs from and never contaminates the last daily close
  ✓ Feature 009 short daily history exposes every unsupported technical as unavailable with a closed reason
  ✓ Feature 009 accepted state keeps model quote bar retrieval and evaluation clocks distinct with no ambiguous data_as_of
  ✓ Feature 009 accepted state preserves the model cutoff and daily-only technical ownership
  ✓ Feature 009 accepted state is deeply immutable across market truth branches
  ✓ Feature 009 production-validated quote replacement changes quote-owned fields only

================================================
Research-Lab self-test: 496 passed, 1 failed
================================================
```

##### Separately Accounted Baseline Finding

**Phase:** test
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
  ✓ same-origin bar snapshots include brief thematic-group ETFs and members

market brief — registry-wide coverage + action-only payload contract
  ✗ FAIL: current payload satisfies the executable brief contract: nextSession.sessionDate must match snapshot.nextSessionDate
  ✓ contract rejects omission of a registered tool
  ✓ contract rejects a generic real-assets read without GLD/BTC/SLV detail
  ✓ contract rejects watch-only or incomplete next-session output
  ✓ contract rejects a missing visible brief section
  ✓ contract rejects an incomplete structural backdrop
  ✓ contract rejects a missing generation timestamp
```

Finding `F009-BASELINE-MARKET-BRIEF-DATE` is outside Scope 1 ownership and was not changed or suppressed.

#### Current Cache Truth And Dynamic-Test Evidence

**Phase:** test
**Command:** `node -e 'const fs=require("node:fs"),quote=JSON.parse(fs.readFileSync("data/options/MSFT.json","utf8")),bars=JSON.parse(fs.readFileSync("data/bars/MSFT.json","utf8")),selftest=fs.readFileSync("scripts/selftest.mjs","utf8"),browser=fs.readFileSync("tests/msft-july-market-refresh.spec.mjs","utf8");const marker=selftest.slice(selftest.indexOf("/* FEATURE-009-MSFT-JULY-MARKET-REFRESH-BEGIN */"),selftest.indexOf("/* FEATURE-009-MSFT-JULY-MARKET-REFRESH-END */")),literals=[String(quote.spot),bars.asof],hits=literals.filter((value)=>marker.includes(value)||browser.includes(value));console.log("FEATURE009_DYNAMIC_CACHE_CHECK_BEGIN");console.log("QUOTE_CACHE_VALUE="+quote.spot);console.log("QUOTE_PROVIDER_ASOF="+quote.asof);console.log("QUOTE_RETRIEVED_AT="+quote.fetched);console.log("BARS_CACHE_CUTOFF="+bars.asof);console.log("BARS_RETRIEVED_AT="+bars.fetched);console.log("BARS_ROWS="+bars.rows.length);console.log("FUNCTIONAL_EMBEDDED_TRUTH="+(literals.filter((value)=>marker.includes(value)).join(",")||"none"));console.log("E2E_EMBEDDED_TRUTH="+(literals.filter((value)=>browser.includes(value)).join(",")||"none"));console.log("EXPECTED_TRUTH_SOURCE=parsed-cache-envelopes");console.log("FINDINGS="+hits.length);console.log("RESULT="+(hits.length?"FAIL":"PASS"));console.log("FEATURE009_DYNAMIC_CACHE_CHECK_END");if(hits.length)process.exit(1);'`
**Exit Code:** 0
**Claim Source:** executed

```text
FEATURE009_DYNAMIC_CACHE_CHECK_BEGIN
QUOTE_CACHE_VALUE=395.4
QUOTE_PROVIDER_ASOF=2026-07-15T15:59:59
QUOTE_RETRIEVED_AT=2026-07-15T21:00:20.694Z
BARS_CACHE_CUTOFF=2026-07-15
BARS_RETRIEVED_AT=2026-07-15T21:01:38.963Z
BARS_ROWS=501
FUNCTIONAL_EMBEDDED_TRUTH=none
E2E_EMBEDDED_TRUTH=none
EXPECTED_TRUTH_SOURCE=parsed-cache-envelopes
FINDINGS=0
RESULT=PASS
FEATURE009_DYNAMIC_CACHE_CHECK_END
```

The stale planning canaries `397.065` and `2026-07-13` are not treated as runtime truth. Reconciliation of that planning wording is routed to `bubbles.plan`; neither planning text nor cache data was edited here.

#### Current-Session Scope 1 Revalidation After Cache-Relative Plan Repair

##### TP-009-S1-01 Exact Functional Command

**Phase:** test
**Executed:** YES (current session)
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Result:** FAIL (aggregate repository baseline); all twelve marker-bounded Feature 009 Scope 1 assertions passed.

Relevant windows from the full preserved terminal output:

```text
market brief — registry-wide coverage + action-only payload contract
  ✗ FAIL: current payload satisfies the executable brief contract: nextSession.s
essionDate must match snapshot.nextSessionDate
  ✓ contract rejects omission of a registered tool
  ✓ contract rejects a generic real-assets read without GLD/BTC/SLV detail
  ✓ contract rejects watch-only or incomplete next-session output
  ✓ contract rejects a missing visible brief section
  ✓ contract rejects an incomplete structural backdrop
  ✓ contract rejects a missing generation timestamp

Feature 009 Scope 1 cache-owned MSFT market truth
  ✓ Feature 009 quote validator accepts the actual cache value and exact quote clocks
  ✓ Feature 009 bar validator accepts every actual daily row and exact bar clocks
  ✓ Feature 009 quote validator rejects every closed failure class with its exact reason code
  ✓ Feature 009 bar validator rejects every closed failure class with its exact reason code
  ✓ Feature 009 daily close and SMA20/SMA50/SMA200 equal independent test math over actual daily rows
  ✓ Feature 009 High252 stack and signed distances equal independent test math over actual daily rows
  ✓ Feature 009 delayed quote differs from and never contaminates the last daily close
  ✓ Feature 009 short daily history exposes every unsupported technical as unavailable with a closed reason
  ✓ Feature 009 accepted state keeps model quote bar retrieval and evaluation clocks distinct with no ambiguous data_as_of
  ✓ Feature 009 accepted state preserves the model cutoff and daily-only technical ownership
  ✓ Feature 009 accepted state is deeply immutable across market truth branches
  ✓ Feature 009 production-validated quote replacement changes quote-owned fields only

================================================
Research-Lab self-test: 496 passed, 1 failed
================================================
```

The only failing assertion is owned by the already-classified packet `specs/_bugs/BUG-002-market-brief-session-date-drift`. Its current report and state route implementation to `bubbles.implement`. Feature 009 does not modify or suppress that baseline.

##### TP-009-S1-02 Exact Focused Browser Command

**Phase:** test
**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-001/002/005 cache-first market truth"`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
Running 1 test using 1 worker

  ✓  1 …:46:1 › Regression: SCN-009-001/002/005 cache-first market truth (929ms)
[SCN-009-001] firstPaint=loading/loading quote=null technicalClose=null
[SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=0
[SCN-009-001] sharedWriteFailures=quote:1,bars:1 reportFailures=2
[SCN-009-001] quoteReportKeys=label,providerAsOf,retrievedAt,sharedWrite,sourceId
[SCN-009-001] barsReportKeys=cutoff,label,retrievedAt,rowCount,sharedWrite,sourceId
[SCN-009-002] modelAsOf=2026-07-06
[SCN-009-002] quoteProviderAsOf=2026-07-15T15:59:59 quoteRetrievedAt=2026-07-15T21:00:20.694Z
[SCN-009-002] barsCutoff=2026-07-15 barsRetrievedAt=2026-07-15T21:01:38.963Z
[SCN-009-002] uniqueClocks=6 data_as_of=absent
[SCN-009-005] dailyRows=501 quote=395.4 dailyClose=395.6300048828125
[SCN-009-005] technicalOwners=close,sma20,sma50,sma200,high252,stack,signedDistances source=dailyRowsOnly

  1 passed (3.7s)
```

The values above are observations emitted after parsing the current committed cache files; they are not test expectations embedded as moving constants.

##### Current-Session Test Integrity Audit

**Claim Source:** interpreted from current-session file reads and source searches

- `scripts/selftest.mjs` reads both actual cache files, extracts the named production functions from `msft-july-print-model.html`, calls those functions, and computes its expected technical values independently from the parsed daily rows.
- `tests/msft-july-market-refresh.spec.mjs` reads both actual cache files and opens the production page through the committed static server. Its assertions read `window.MsftJulyModel.runtime.acceptedState`, so the production controller and validators remain on the tested path.
- The browser test registers a `page.on('request')` observer but contains no `page.route`, `context.route`, `intercept`, `msw`, `nock`, or canned response. Its shared-write fault injection occurs after production cache validation and does not replace either cache response.
- The boundary-aware skip scan found no `test.skip`, `test.only`, `test.todo`, `it.skip`, `it.only`, `xit`, `xdescribe`, or `pending` marker. The earlier broad `xit(` search matched only `process.exit(...)`, not a disabled test.
- Neither test surface declares a production validator, accepted-state builder, or production technical helper. The test oracle uses direct cache-row array math with a different structure from the production `msftSma`, `msftDistancePct`, and `msftClassifyStack` helpers.
- The repaired Scope 1 Test Plan and behavioral DoD are cache-relative. Neither Feature 009 test surface embeds the current quote, bar cutoff, or retrieval clocks as expected constants.

##### Current-Session Scope 1 DoD Assessment

| DoD area | Current-session evidence | Verdict |
| --- | --- | --- |
| Real-page SCN-009-001/002/005 behavior | Exact focused browser command, exit 0 | Sufficient |
| Cache-relative quote/bar/technical acceptance | Exact focused browser command plus all twelve Feature 009 functional assertions | Sufficient |
| Quote-only replacement and daily-only ownership | Marker-bounded production-function assertions passed | Sufficient for the behavioral item |
| TP-009-S1-01 | Exact command exited 1 on BUG-002 Market Brief session-date drift | Insufficient; remains unchecked |
| TP-009-S1-02 | Exact command exited 0 | Sufficient; remains checked |
| Quality/no-interception boundary | Browser output and current source audit | Sufficient |
| Dirty-work byte containment | Working tree is broadly pre-dirty; no parent byte manifest exists for the inherited Feature 009 hunks | Insufficient; remains unchecked |
| Status/certification restraint | Scope remains In Progress; later scopes and certification are untouched | Sufficient |

Finding accounting for this invocation:

| Finding | Disposition | Owner / evidence |
| --- | --- | --- |
| `F009-PLAN-CANARY-DRIFT` | Addressed before this invocation; independently verified | `bubbles.plan` repaired the Test Plan and DoD to cache-relative acceptance in `scopes.md` |
| `F009-BASELINE-MARKET-BRIEF-DATE` | Unresolved, route required | `bubbles.implement` at `specs/_bugs/BUG-002-market-brief-session-date-drift` |
| `F009-DIRTY-BYTE-ATTRIBUTION` | Unresolved, route required | top-level `bubbles.goal` runner retains the pre-session manifest; otherwise `bubbles.audit` must reconcile inherited bytes |

Scope 1 is not ready for validate/certification. TP-009-S1-01 and dirty-work containment remain incomplete even though the Feature 009 functional subgroup and focused real-page regression are green.

#### Required Parser And Test-Integrity Checks

**Phase:** test
**Command:** `PAGE=msft-july-print-model.html node -e 'const fs=require("node:fs");const p=process.env.PAGE;if(!p)throw new Error("PAGE is required");const h=fs.readFileSync(p,"utf8");const scripts=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());if(!scripts.length)throw new Error("no inline script: "+p);scripts.forEach((s,i)=>{try{new Function(s)}catch(e){throw new Error("inline script "+(i+1)+": "+e.message)}});const ids=new Set([...h.matchAll(/\bid=["\x27]([^"\x27]+)["\x27]/g)].map(m=>m[1]));const refs=scripts.flatMap(s=>[...s.matchAll(/getElementById\(\s*["\x27]([^"\x27]+)["\x27]\s*\)/g)].map(m=>m[1]));const missing=[...new Set(refs.filter(id=>!ids.has(id)))];if(missing.length)throw new Error("missing ids: "+missing.join(", "));console.log("OK page="+p+" inline="+scripts.length+" refs="+refs.length)'`
**Exit Code:** 0
**Claim Source:** executed

```text
OK page=msft-july-print-model.html inline=4 refs=50
```

**Phase:** test
**Command:** `node -e 'const fs=require("node:fs"),page=fs.readFileSync("msft-july-print-model.html","utf8"),browser=fs.readFileSync("tests/msft-july-market-refresh.spec.mjs","utf8"),selftest=fs.readFileSync("scripts/selftest.mjs","utf8");const marker=selftest.slice(selftest.indexOf("/* FEATURE-009-MSFT-JULY-MARKET-REFRESH-BEGIN */"),selftest.indexOf("/* FEATURE-009-MSFT-JULY-MARKET-REFRESH-END */"));const checks=[["no-page-key-input",!/(?:type\s*=\s*["\x27]password|id\s*=\s*["\x27][^"\x27]*(?:api.?key|credential))/i.test(page)],["no-page-credential-persistence",!/(?:localStorage|sessionStorage)\s*\.\s*(?:setItem|removeItem)\s*\([^\n]*(?:api.?key|credential|token|secret)/i.test(page)],["no-legacy-key-literals",!/(?:FINNHUB_KEY|TWELVEDATA_KEY|ALPHAVANTAGE_KEY|FRED_KEY|rlApiKeys)/.test(page)],["two-same-origin-cache-paths",page.includes("fetchMsftJson(\x27/data/options/MSFT.json\x27")&&page.includes("fetchMsftJson(\x27/data/bars/MSFT.json\x27")],["no-request-interception",!/(?:page|context|browserContext)\s*\.\s*route\s*\(|route\s*\.\s*(?:fulfill|continue)\s*\(/.test(browser)],["no-request-mock-library",!/\b(?:msw|nock|wiremock|cy\.intercept)\b/.test(browser)],["no-skip-only-todo",!/(?:\b(?:test|it|describe)\s*\.\s*(?:skip|only|todo)\s*\(|\b(?:xit|xdescribe|pending)\s*\(|\bt\s*\.\s*skip\s*\()/.test(marker+"\n"+browser)]];let ok=true;console.log("FEATURE009_FINAL_SOURCE_AUDIT_BEGIN");console.log("PAGE=msft-july-print-model.html");console.log("FUNCTIONAL_SURFACE=scripts/selftest.mjs#Feature-009");console.log("E2E_SURFACE=tests/msft-july-market-refresh.spec.mjs");for(const [name,pass] of checks){console.log(name+"="+(pass?"PASS":"FAIL"));ok&&=pass;}console.log("CHECKS="+checks.length);console.log("FAILURES="+checks.filter(([,pass])=>!pass).length);console.log("RESULT="+(ok?"PASS":"FAIL"));console.log("FEATURE009_FINAL_SOURCE_AUDIT_END");if(!ok)process.exit(1);'`
**Exit Code:** 0
**Claim Source:** executed

```text
FEATURE009_FINAL_SOURCE_AUDIT_BEGIN
PAGE=msft-july-print-model.html
FUNCTIONAL_SURFACE=scripts/selftest.mjs#Feature-009
E2E_SURFACE=tests/msft-july-market-refresh.spec.mjs
no-page-key-input=PASS
no-page-credential-persistence=PASS
no-legacy-key-literals=PASS
two-same-origin-cache-paths=PASS
no-request-interception=PASS
no-request-mock-library=PASS
no-skip-only-todo=PASS
CHECKS=7
FAILURES=0
RESULT=PASS
FEATURE009_FINAL_SOURCE_AUDIT_END
```

**Phase:** test
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh tests/msft-july-market-refresh.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/Projects/research-lab
  Timestamp: 2026-07-15T23:10:47Z
  Bugfix mode: false
============================================================

ℹ️  Scanning tests/msft-july-market-refresh.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
============================================================
```

### Scope 2

#### TP-009-S2-01 Degraded State Reducers Green

**Phase:** implement
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

After adding the production `msftAggregateMarketStatus`, `msftShouldAcceptQuote`, `msftShouldAcceptBars`, `msftSafeReasonCopy`, and `msftReduceResourceOutcome` functions, the identical command that produced the Scope 2 red now exits 0 with every Scope 1 and Scope 2 Feature 009 assertion passing (`645 → 650`, the five new Scope 2 assertions). Every expected value is derived from the parsed current `data/options/MSFT.json` and `data/bars/MSFT.json`; no moving-market value is embedded as a constant.

```text
Feature 009 Scope 2 isolated degraded market states
  ✓ Feature 009 quote-missing outcome yields partial bars-only truth with an unavailable null spot and retained daily cutoff
  ✓ Feature 009 bars-missing outcome yields partial quote-only truth with unavailable technicals and no default trend or moving average
  ✓ Feature 009 stale quote with original clocks and a rejected malformed bars candidate stay isolated without neutral substitutes
  ✓ Feature 009 monotonic acceptance admits first and newer observations while rejecting older out-of-order candidates
  ✓ Feature 009 closed safe-copy map returns bounded display strings and never echoes an untrusted reason body
================================================
Research-Lab self-test: 650 passed, 0 failed
================================================
```

#### TP-009-S2-02 Degraded State Browser Regression Green

**Phase:** implement
**Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-006/007/008 degraded resources stay isolated"`
**Exit Code:** 0
**Claim Source:** executed

The focused Scope 2 browser scenario drives the public `window.MsftJulyModel.applyResourceOutcome` production reducer through quote-missing, bars-missing, stale-quote, and malformed-bars outcomes with zero provider requests and no request interception. The cache-derived observations (spot `394.007`, cutoff `2026-07-17`, `501` rows) come from the current committed caches, not embedded constants, so a later cache refresh does not falsify the test.

```text
Running 1 test using 1 worker

  ✓  1 …Regression: SCN-009-006/007/008 degraded resources stay isolated (641ms)
[SCN-009-006] quoteMissing marketStatus=partial quote.status=unavailable quote.valueUsd=null
[SCN-009-006] quote.reasonCode=MSFT-QUOTE-HTTP quote.limitation="Delayed quote request failed" bars.rowCount=501 technicals.cutoff=2026-07-17
[SCN-009-007] barsMissing marketStatus=partial quote.valueUsd=394.007 bars.status=unavailable bars.limitation="Daily bars request failed"
[SCN-009-007] technicals.status=unavailable technicals.stack=null unavailableReasons=close,high252,sma20,sma200,sma50
[SCN-009-008] staleQuote status=stale providerAsOf=2026-07-17T15:59:59 retrievedAt=2026-07-19T20:48:21.773Z
[SCN-009-008] isolated quote.status=stale quote.valueUsd=394.007 bars.status=rejected bars.reasonCode=MSFT-BARS-SYMBOL
[SCN-009-008] isolated bars.limitation="Daily bars symbol did not match MSFT" marketStatus=partial
[SCN-009-006/007/008] providerRequests=0 interception=none

  1 passed (1.4s)
```

#### Combined Feature 009 Browser File No Scope 1 Regression

**Phase:** implement
**Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

Running both Feature 009 browser regressions confirms the aggregate-status delegation introduced in Scope 2 (the IIFE `aggregateMarketStatus` now delegates to top-level `msftAggregateMarketStatus`) did not regress the Scope 1 cache-first regression.

```text
Running 2 tests using 1 worker

  ✓  1 …:47:1 › Regression: SCN-009-001/002/005 cache-first market truth (491ms)
[SCN-009-001] firstPaint=loading/loading quote=null technicalClose=null
[SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=0
[SCN-009-001] sharedWriteFailures=quote:1,bars:1 reportFailures=2
[SCN-009-001] quoteReportKeys=label,providerAsOf,retrievedAt,sharedWrite,sourceId
[SCN-009-001] barsReportKeys=cutoff,label,retrievedAt,rowCount,sharedWrite,sourceId
[SCN-009-002] modelAsOf=2026-07-06
[SCN-009-005] dailyRows=501 quote=394.007 dailyClose=393.82000732421875
  ✓  2 …Regression: SCN-009-006/007/008 degraded resources stay isolated (569ms)
[SCN-009-006] quoteMissing marketStatus=partial quote.status=unavailable quote.valueUsd=null
[SCN-009-007] barsMissing marketStatus=partial quote.valueUsd=394.007 bars.status=unavailable bars.limitation="Daily bars request failed"
[SCN-009-008] isolated quote.status=stale bars.status=rejected bars.reasonCode=MSFT-BARS-SYMBOL marketStatus=partial
[SCN-009-006/007/008] providerRequests=0 interception=none

  2 passed (1.8s)
```

#### Scope 2 Change Containment

**Phase:** implement
**Command:** `git status --short` + credential/spot/cutoff/marker/excluded scan + path-scoped diff hunks
**Exit Code:** 0
**Claim Source:** executed

Only the four allowed Scope 2 surfaces changed (the `scopes.md` modification is the pre-existing Scope 1 blockquote-continuation fix). The sole credential-pattern match is the design-allowed centralized `RLDATA.providerFetch('finnhub', …)` at line 2334 (pre-existing Scope 1 intent, outside the Scope 2 hunks). No hard-coded `390.49` spot exists, the model cutoff `2026-07-06` is intact, the Feature 009 selftest group edits are strictly inside the markers, and every excluded surface is untouched.

```text
=== changed files ===
 M msft-july-print-model.html
 M scripts/selftest.mjs
 M specs/009-msft-july-market-refresh/scopes.md
 M tests/msft-july-market-refresh.spec.mjs
=== forbidden page-local credential patterns (msftFhKey/#fhKey/rlKeys/rlGetKey/rlSetKey/rlMigrate/token=) ===
NONE (only the design-allowed centralized RLDATA.providerFetch('finnhub', 'https://finnhub.io/api/v1/quote?symbol=MSFT') at line 2334 remains)
=== forbidden hard-coded spot 390.49 ===
NONE
=== model cutoff 2026-07-06 occurrences ===
5
=== Feature 009 selftest markers ===
1830 BEGIN / 2107 END (Scope 2 group added strictly inside; no other selftest group hunk)
=== excluded surfaces (rldata/rlapp/rlchart/rlnav/rlticker/rlbrief/data/market-brief/brief-refresh/tools.json/index.html/notes) ===
(empty)
=== html diff hunks (localized, additive except intended delegation + export edits) ===
@@ -1512,0 +1513,159 @@   (five new top-level production functions)
@@ -1529,6 +1688 @@        (aggregateMarketStatus now delegates: 6 lines -> 1)
@@ -1663,0 +1818,27 @@      (applyResourceOutcome public production operation)
@@ -1676 +1857 @@           (window.MsftJulyModel export adds applyResourceOutcome)
```

### Scope 3

### Scope 4

### Scope 5

## Dirty-Work Containment Evidence

### Pre-Change Snapshot

**Phase:** test
**Command:** `git status --short -- scripts/selftest.mjs tests/msft-july-market-refresh.spec.mjs specs/009-msft-july-market-refresh/report.md specs/009-msft-july-market-refresh/scopes.md`
**Exit Code:** 0
**Claim Source:** executed

```text
 M scripts/selftest.mjs
?? specs/009-msft-july-market-refresh/report.md
?? specs/009-msft-july-market-refresh/scopes.md
?? tests/msft-july-market-refresh.spec.mjs
```

The authorized files were already dirty or untracked before this test invocation. The complete pre-edit diff was also captured in the session, but no parent-owned byte manifest was supplied.

### Post-Change Snapshot

**Phase:** test
**Command:** `git status --short -- scripts/selftest.mjs tests/msft-july-market-refresh.spec.mjs specs/009-msft-july-market-refresh/report.md specs/009-msft-july-market-refresh/scopes.md msft-july-print-model.html data/options/MSFT.json data/bars/MSFT.json rldata.js rlapp.js tools.json notes/msft-july-print-model.md specs/009-msft-july-market-refresh/state.json specs/009-msft-july-market-refresh/scenario-manifest.json specs/009-msft-july-market-refresh/test-plan.json`
**Exit Code:** 0
**Claim Source:** executed

```text
 M msft-july-print-model.html
 M rldata.js
 M scripts/selftest.mjs
 M tools.json
?? rlapp.js
?? specs/009-msft-july-market-refresh/report.md
?? specs/009-msft-july-market-refresh/scenario-manifest.json
?? specs/009-msft-july-market-refresh/scopes.md
?? specs/009-msft-july-market-refresh/state.json
?? specs/009-msft-july-market-refresh/test-plan.json
?? tests/msft-july-market-refresh.spec.mjs
```

### Excluded-Surface Verification

The final source audit passed for credential ownership, cache paths, request interception, request-mock libraries, and skip/only/todo markers. The status snapshot above is not sufficient to attribute every excluded dirty byte to a particular concurrent agent, so the matching DoD item remains unchecked.

## Validation Evidence

### Repository Diagnostics

**Phase:** test
**Command:** `git diff --check -- scripts/selftest.mjs tests/msft-july-market-refresh.spec.mjs specs/009-msft-july-market-refresh/report.md specs/009-msft-july-market-refresh/scopes.md`
**Exit Code:** 0
**Claim Source:** executed

```text
FEATURE009_DIFF_CHECK_BEGIN
PHASE=test
PATH=scripts/selftest.mjs
PATH=tests/msft-july-market-refresh.spec.mjs
PATH=specs/009-msft-july-market-refresh/report.md
PATH=specs/009-msft-july-market-refresh/scopes.md
DIFF_CHECK_EXIT=0
DIFF_CHECK_RESULT=PASS
UNTRACKED_PATHS_SUPPLEMENTED_BY=FEATURE009_OWNED_WHITESPACE
FEATURE009_DIFF_CHECK_END
```

Because three owned files are untracked, the supplementary owned-file scan also checked trailing whitespace and final newlines directly:

```text
FEATURE009_OWNED_WHITESPACE_BEGIN
FILE=scripts/selftest.mjs
TRAILING_WHITESPACE=0
FINAL_NEWLINE=PASS
FILE=tests/msft-july-market-refresh.spec.mjs
TRAILING_WHITESPACE=0
FINAL_NEWLINE=PASS
FILE=specs/009-msft-july-market-refresh/report.md
TRAILING_WHITESPACE=0
FINAL_NEWLINE=PASS
FILE=specs/009-msft-july-market-refresh/scopes.md
TRAILING_WHITESPACE=0
FINAL_NEWLINE=PASS
FILES=4
FAILURES=0
RESULT=PASS
FEATURE009_OWNED_WHITESPACE_END
```

### Bubbles Artifact And Traceability Guards

**Phase:** test
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/009-msft-july-market-refresh`
**Exit Code:** 0
**Claim Source:** executed

```text
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
```

**Phase:** test
**Command:** `bash .github/bubbles/scripts/artifact-freshness-guard.sh specs/009-msft-july-market-refresh`
**Exit Code:** 0
**Claim Source:** executed

```text
--- Check 1: Freshness Boundary Isolation (spec.md / design.md) ---
ℹ️  spec.md has no superseded/suppressed sections
ℹ️  design.md has no superseded/suppressed sections
ℹ️  No spec/design freshness boundaries detected

--- Check 2: Superseded Scope Sections Are Non-Executable ---
ℹ️  scopes.md has no superseded scope section
ℹ️  No superseded scope sections detected

--- Check 3: Per-Scope Directory Index References ---
ℹ️  Single-file scope layout detected — orphaned per-scope directory check not applicable

--- Check 4: Result ---
RESULT: PASS (0 failures, 0 warnings)
```

**Phase:** test
**Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/009-msft-july-market-refresh`
**Exit Code:** 1
**Claim Source:** interpreted
**Interpretation:** Scope 1 scenario-to-plan-to-test-to-report linkage passes for SCN-009-001/002/005. The guard then fails G068 for all five scopes because the installed parser reports zero DoD items beneath nested Tier headings; this foreign framework defect is already tracked by upstream BUG-018.

```text
ℹ️  Checking traceability for Scope 1: Cache-Owned Market Truth
✅ Scope 1: Cache-Owned Market Truth scenario mapped to Test Plan row: The production page opens from valid same-origin MSFT caches
✅ Scope 1: Cache-Owned Market Truth scenario maps to concrete test file: tests/msft-july-market-refresh.spec.mjs
✅ Scope 1: Cache-Owned Market Truth report references concrete test evidence: tests/msft-july-market-refresh.spec.mjs
✅ Scope 1: Cache-Owned Market Truth scenario mapped to Test Plan row: The delayed quote and daily bars have different observation clocks
✅ Scope 1: Cache-Owned Market Truth scenario maps to concrete test file: scripts/selftest.mjs
✅ Scope 1: Cache-Owned Market Truth report references concrete test evidence: scripts/selftest.mjs
✅ Scope 1: Cache-Owned Market Truth scenario mapped to Test Plan row: A newer delayed quote differs from the latest daily close
✅ Scope 1: Cache-Owned Market Truth scenario maps to concrete test file: scripts/selftest.mjs
✅ Scope 1: Cache-Owned Market Truth report references concrete test evidence: scripts/selftest.mjs
ℹ️  Scope 1: Cache-Owned Market Truth summary: scenarios=3 test_rows=3
❌ Scope 1: Cache-Owned Market Truth has Gherkin scenarios but no DoD items — cannot verify content fidelity
RESULT: FAILED (5 failures, 0 warnings)
```

## Discovered Issues

| Observed | ID | Description | Disposition | Reference |
| --- | --- | --- | --- | --- |
| 2026-07-15 | F009-PLAN-CANARY-DRIFT | Scope 1 previously named moving quote/cutoff canaries; planning now derives acceptance from the parsed current cache envelopes. | addressed by `bubbles.plan`; independently reverified by `bubbles.test` | `report.md#current-session-scope-1-revalidation-after-cache-relative-plan-repair` |
| 2026-07-15 | F009-BASELINE-MARKET-BRIEF-DATE | `node scripts/selftest.mjs` exits 1 because `nextSession.sessionDate` does not match `snapshot.nextSessionDate`. | routed to `bubbles.implement` at BUG-002 | `specs/_bugs/BUG-002-market-brief-session-date-drift`; `report.md#tp-009-s1-01-exact-functional-command` |
| 2026-07-15 | F009-DIRTY-BYTE-ATTRIBUTION | The inherited working tree contains large mixed modified/untracked surfaces and no parent-provided byte manifest for Feature 009. | routed to active top-level `bubbles.goal` runner or `bubbles.audit` | `report.md#current-session-scope-1-dod-assessment` |
| 2026-07-15 | F009-UPSTREAM-G068-HEADING-DEPTH | Installed traceability guard reports zero DoD items under nested Tier headings after all Scope 1 scenario/test/report links pass. | bug-filed upstream | `<bubbles-repo>/improvements/BUG-018-traceability-test-plan-heading-depth/bug.md` |
| 2026-07-15 | F009-STATE-LEGACY-FIELD-WARNINGS | Artifact lint passes but warns that `scopeProgress`, `statusDiscipline`, and `scopeLayout` are deprecated state fields. | routed to `bubbles.validate` state owner | `state.json`; artifact-lint output in this report |

## Completion Statement

Scope 1 remains **In Progress** with two unchecked DoD items. Cache-relative SCN-009-001/002/005 acceptance and TP-009-S1-02 are current-session green. TP-009-S1-01 remains unchecked because its exact command exits 1 on BUG-002, and dirty-work byte attribution remains unchecked because no parent byte manifest can separate all inherited mixed-file edits. No spec or scope certification is claimed, and no later scope was started.

## TR-BUG-002-F009-TEST-CLOCK-01 Deterministic Browser Clock Repair (2026-07-18T21:54:44Z)

**Agent:** `bubbles.test`
**Workflow:** top-level `bubbles.goal` direct-authorized-runner / BUG-002 `bugfix-fastlane` dependency chain
**Owner spec:** `specs/009-msft-july-market-refresh`
**Finding:** `BUG002-F009-CACHE-CLOCK-DRIFT-REGRESSION`
**Claim Source:** executed

The current quote envelope reports `fetched=2026-07-17T20:48:17.970Z`; the current bars envelope reports `fetched=2026-07-17T20:48:12.303Z`. Production `boot()` captures one real `new Date().toISOString()` and passes it unchanged to both production validators. The current July 18 clock therefore correctly classified the cache-first aggregate as `stale`; the test's unbound wall clock, not production staleness behavior, was the defect.

### Required Focused RED

**Executed:** YES (current session, before the test edit)
**Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-009-001/002/005 cache-first market truth" --reporter=list`
**Exit Code:** 1
**Claim Source:** executed
**Output:**

```text
Running 1 test using 1 worker

    1 …spec.mjs:46:1 › Regression: SCN-009-001/002/005 cache-first market truth
  ✘  1 …s:46:1 › Regression: SCN-009-001/002/005 cache-first market truth (5.5s)

  1) [system-chrome] › tests/msft-july-market-refresh.spec.mjs:46:1 › Regression: SCN-009-001/002/005 cache-first market truth

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: "complete"
    Received: "stale"

    Call Log:
    - Timeout 5000ms exceeded while waiting on the predicate

      130 |     const state = window.MsftJulyModel?.runtime?.acceptedState;
      131 |     return state?.marketStatus || null;
    > 132 |   })).toBe('complete');
          |       ^

  1 failed
    [system-chrome] › tests/msft-july-market-refresh.spec.mjs:46:1 › Regression: SCN-009-001/002/005 cache-first market truth
```

**Result:** FAIL, as required for the genuine pre-edit RED. The only assertion failure was `marketStatus`: expected `complete`, received `stale`.

### Smallest Test-Only Repair

`tests/msft-july-market-refresh.spec.mjs` now derives one evaluation instant from the two parsed real cache envelopes:

```js
new Date(Math.max(Date.parse(quoteEnvelope.fetched), Date.parse(barsEnvelope.fetched)) + 60000).toISOString()
```

The exact scenario calls checkout-local Playwright's supported `page.clock.setFixedTime(...)` API before `page.goto(...)`. No production, cache, validator, runtime, matcher, config, or other test byte changed. The `complete` expectation, real same-origin responses, and request observer remain unchanged.

### Immediate Identical Focused GREEN

**Executed:** YES (current session, first post-edit action)
**Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-009-001/002/005 cache-first market truth" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
Running 1 test using 1 worker

[SCN-009-001] firstPaint=loading/loading quote=null technicalClose=null
[SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=0
[SCN-009-001] sharedWriteFailures=quote:1,bars:1 reportFailures=2
[SCN-009-001] quoteReportKeys=label,providerAsOf,retrievedAt,sharedWrite,sourceId
[SCN-009-001] barsReportKeys=cutoff,label,retrievedAt,rowCount,sharedWrite,sourceId
[SCN-009-002] modelAsOf=2026-07-06
[SCN-009-002] quoteProviderAsOf=2026-07-17T15:59:59 quoteRetrievedAt=2026-07-17T20:48:17.970Z
[SCN-009-002] barsCutoff=2026-07-17 barsRetrievedAt=2026-07-17T20:48:12.303Z
[SCN-009-002] uniqueClocks=6 data_as_of=absent
[SCN-009-005] dailyRows=501 quote=393.79 dailyClose=393.82000732421875
[SCN-009-005] technicalOwners=close,sma20,sma50,sma200,high252,stack,signedDistances source=dailyRowsOnly
  ✓  1 …:47:1 › Regression: SCN-009-001/002/005 cache-first market truth (565ms)

  1 passed (1.8s)
```

**Result:** PASS. The real page accepted both real caches as `complete`, retained six distinct clocks, issued zero provider requests, and preserved daily-row-only technical ownership.

### Complete Feature 009 Browser File

**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
Running 1 test using 1 worker

[SCN-009-001] firstPaint=loading/loading quote=null technicalClose=null
[SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=0
[SCN-009-001] sharedWriteFailures=quote:1,bars:1 reportFailures=2
[SCN-009-001] quoteReportKeys=label,providerAsOf,retrievedAt,sharedWrite,sourceId
[SCN-009-001] barsReportKeys=cutoff,label,retrievedAt,rowCount,sharedWrite,sourceId
[SCN-009-002] modelAsOf=2026-07-06
[SCN-009-002] quoteProviderAsOf=2026-07-17T15:59:59 quoteRetrievedAt=2026-07-17T20:48:17.970Z
[SCN-009-002] barsCutoff=2026-07-17 barsRetrievedAt=2026-07-17T20:48:12.303Z
[SCN-009-002] uniqueClocks=6 data_as_of=absent
[SCN-009-005] dailyRows=501 quote=393.79 dailyClose=393.82000732421875
[SCN-009-005] technicalOwners=close,sma20,sma50,sma200,high252,stack,signedDistances source=dailyRowsOnly
  ✓  1 …:47:1 › Regression: SCN-009-001/002/005 cache-first market truth (565ms)

  1 passed (1.7s)
```

**Result:** PASS.

### Complete Repository Selftest

**Executed:** YES (current session)
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
Feature 009 Scope 1 cache-owned MSFT market truth
  ✓ Feature 009 quote validator accepts the actual cache value and exact quote clocks
  ✓ Feature 009 bar validator accepts every actual daily row and exact bar clocks
  ✓ Feature 009 quote validator rejects every closed failure class with its exact reason code
  ✓ Feature 009 bar validator rejects every closed failure class with its exact reason code
  ✓ Feature 009 daily close and SMA20/SMA50/SMA200 equal independent test math over actual daily rows
  ✓ Feature 009 High252 stack and signed distances equal independent test math over actual daily rows
  ✓ Feature 009 delayed quote differs from and never contaminates the last daily close
  ✓ Feature 009 short daily history exposes every unsupported technical as unavailable with a closed reason
  ✓ Feature 009 accepted state keeps model quote bar retrieval and evaluation clocks distinct with no ambiguous data_as_of
  ✓ Feature 009 accepted state preserves the model cutoff and daily-only technical ownership
  ✓ Feature 009 accepted state is deeply immutable across market truth branches
  ✓ Feature 009 production-validated quote replacement changes quote-owned fields only

================================================
Research-Lab self-test: 491 passed, 0 failed
================================================
```

**Result:** PASS.

### Page Parser, Regression Quality, And Source Integrity

**Executed:** YES (current session)
**Command:** `PAGE=msft-july-print-model.html node -e 'const fs=require("node:fs");const p=process.env.PAGE;if(!p)throw new Error("PAGE is required");const h=fs.readFileSync(p,"utf8");const scripts=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());if(!scripts.length)throw new Error("no inline script: "+p);scripts.forEach((s,i)=>{try{new Function(s)}catch(e){throw new Error("inline script "+(i+1)+": "+e.message)}});const ids=new Set([...h.matchAll(/\bid=["\x27]([^"\x27]+)["\x27]/g)].map(m=>m[1]));const refs=scripts.flatMap(s=>[...s.matchAll(/getElementById\(\s*["\x27]([^"\x27]+)["\x27]\s*\)/g)].map(m=>m[1]));const missing=[...new Set(refs.filter(id=>!ids.has(id)))];if(missing.length)throw new Error("missing ids: "+missing.join(", "));console.log("OK page="+p+" inline="+scripts.length+" refs="+refs.length)'`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
OK page=msft-july-print-model.html inline=4 refs=50
```

The parser intentionally emits one success line; it parsed all four non-`src` inline scripts and resolved all 50 literal ID references.

**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/msft-july-market-refresh.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Timestamp: 2026-07-18T21:53:09Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/msft-july-market-refresh.spec.mjs
✅ Adversarial signal detected in tests/msft-july-market-refresh.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

**Executed:** YES (current session)
**Command:**

```text
node -e 'const fs=require("node:fs");const source=fs.readFileSync("tests/msft-july-market-refresh.spec.mjs","utf8");const quote=JSON.parse(fs.readFileSync("data/options/MSFT.json","utf8"));const bars=JSON.parse(fs.readFileSync("data/bars/MSFT.json","utf8"));const dynamicTruth=[String(quote.spot),quote.asof,quote.fetched,bars.asof,bars.fetched,String(bars.rows.at(-1).c)];const dateLiterals=[...new Set(source.match(/\b20\d{2}-\d{2}-\d{2}(?:T[^"\x27\s]+)?/g)||[])];const checks=[["real quote envelope read",source.includes("data/options/MSFT.json")],["real bars envelope read",source.includes("data/bars/MSFT.json")],["cache-relative evaluation instant",/Math\.max\(Date\.parse\(quoteEnvelope\.fetched\), Date\.parse\(barsEnvelope\.fetched\)\) \+ 60000/.test(source)],["supported page clock API",source.includes("page.clock.setFixedTime(CACHE_EVALUATION_TIME)")],["clock installed before navigation",source.indexOf("page.clock.setFixedTime(CACHE_EVALUATION_TIME)")<source.indexOf("await page.goto(")],["complete expectation preserved",source.includes("toBe(\x27complete\x27)")],["request observer retained",source.includes("page.on(\x27request\x27")],["no request interception",!/page\.route|context\.route|routeFromHAR|route\.fulfill|intercept\(|\bmsw\b|\bnock\b/i.test(source)],["no skip only todo pending",!/test\.(?:skip|only|todo)|\.skip\(|\.only\(|\bxit\(|\bxdescribe\(|\bpending\(/.test(source)],["no credential access",!/localStorage|sessionStorage|Authorization|api[_-]?key|password|secret|token/i.test(source)],["no cache rewrite or refresh",!/writeFile|appendFile|truncate|rename|unlink|rmSync|fetch-options|fetch-bars|brief-refresh/.test(source)],["no validator override",!/msftValidateQuoteEnvelope\s*=|msftValidateBarsEnvelope\s*=/.test(source)],["no moving cache truth literals",dynamicTruth.every((value)=>!source.includes(value))],["only fixed model cutoff date literal",dateLiterals.length===1&&dateLiterals[0]==="2026-07-06"],["complete assertion remains after real navigation",source.indexOf("toBe(\x27complete\x27)")>source.indexOf("await page.goto(")]];for(const [name,ok] of checks)console.log(`${ok?"PASS":"FAIL"}: ${name}`);const failed=checks.filter(([,ok])=>!ok);console.log(`sourceAuditChecks=${checks.length}`);console.log(`sourceAuditFailures=${failed.length}`);if(failed.length)process.exitCode=1;'
```

**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
PASS: real quote envelope read
PASS: real bars envelope read
PASS: cache-relative evaluation instant
PASS: supported page clock API
PASS: clock installed before navigation
PASS: complete expectation preserved
PASS: request observer retained
PASS: no request interception
PASS: no skip only todo pending
PASS: no credential access
PASS: no cache rewrite or refresh
PASS: no validator override
PASS: no moving cache truth literals
PASS: only fixed model cutoff date literal
PASS: complete assertion remains after real navigation
sourceAuditChecks=15
sourceAuditFailures=0
```

### Finding And Routing Disposition

- `BUG002-F009-CACHE-CLOCK-DRIFT-REGRESSION`: addressed by the authorized deterministic test-clock binding and the executed RED-to-GREEN evidence above.
- `TR-BUG-002-F009-TEST-CLOCK-01`: resolved under `bubbles.test`; its only allowed product/test mutation remained `tests/msft-july-market-refresh.spec.mjs`.
- `TR-BUG-002-TEST-BROWSER-INVENTORY-CARDINALITY-01`: prerequisite unblocked and remains the next `bubbles.test` transition. Its immediate foundation command and Gates 1-7 were not run in this transition.
- Feature 009 Scope 1 and spec remain **In Progress**. No DoD checkbox, planning text, feature state, BUG-002 status, or certification field changed.
- No regression, validation, audit, scope completion, bug completion, or certification claim is made.

## Takeover Finalization Scope 1

Consolidated ownership takeover (2026-07-19, baseline HEAD `2577a36`). The prior session left Scope 1 implemented and green but marked **In Progress** with two unchecked DoD items (TP-009-S1-01 and the containment diff), each blocked by a condition that is now resolved. Both are re-verified below against the current committed tree, and Scope 1 is transitioned to **Done** with a recorded implement-phase claim. No certification field is written; feature status remains `not_started` (certification is owned by bubbles.audit + bubbles.validate).

### TP-009-S1-01 — full selftest now exits 0

The prior blocker was the exact command exiting 1 on a Market Brief `nextSession.sessionDate` vs `snapshot.nextSessionDate` mismatch. The exact command now exits 0.

- **Command:** `node scripts/selftest.mjs`
- **Exit Code:** 0

```text
  ✓ Feature 009 quote validator accepts the actual cache value and exact quote clocks
  ✓ Feature 009 bar validator accepts every actual daily row and exact bar clocks
  ✓ Feature 009 quote validator rejects every closed failure class with its exact reason code
  ✓ Feature 009 bar validator rejects every closed failure class with its exact reason code
  ✓ Feature 009 daily close and SMA20/SMA50/SMA200 equal independent test math over actual daily rows
  ✓ Feature 009 High252 stack and signed distances equal independent test math over actual daily rows
  ✓ Feature 009 delayed quote differs from and never contaminates the last daily close
  ✓ Feature 009 short daily history exposes every unsupported technical as unavailable with a closed reason
  ✓ Feature 009 accepted state keeps model quote bar retrieval and evaluation clocks distinct with no ambiguous data_as_of
  ✓ Feature 009 accepted state preserves the model cutoff and daily-only technical ownership
  ✓ Feature 009 accepted state is deeply immutable across market truth branches
  ✓ Feature 009 production-validated quote replacement changes quote-owned fields only
================================================
Research-Lab self-test: 645 passed, 0 failed
================================================
```

### TP-009-S1-02 — browser regression (current caches)

- **Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --grep "Regression: SCN-009-001/002/005 cache-first market truth"`
- **Exit Code:** 0

```text
  ✓ Regression: SCN-009-001/002/005 cache-first market truth (453ms)
[SCN-009-001] firstPaint=loading/loading quote=null technicalClose=null
[SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=0
[SCN-009-002] modelAsOf=2026-07-06
[SCN-009-002] quoteProviderAsOf=2026-07-17T15:59:59 quoteRetrievedAt=2026-07-19T18:48:14.405Z
[SCN-009-002] barsCutoff=2026-07-17 barsRetrievedAt=2026-07-19T18:48:09.703Z
[SCN-009-002] uniqueClocks=6 data_as_of=absent
[SCN-009-005] dailyRows=501 quote=394.007 dailyClose=393.82000732421875
[SCN-009-005] technicalOwners=close,sma20,sma50,sma200,high252,stack,signedDistances source=dailyRowsOnly
  1 passed (1.3s)
```

### Containment — current committed baseline

The prior containment uncertainty was that a mixed dirty tree prevented per-hunk attribution. Ownership is now consolidated on a clean committed tree, so containment is verified against the current committed baseline:

```text
git status --porcelain -- <Feature 009 allowed surfaces>   → (empty: all committed/clean)
forbidden page-local credential patterns in msft-july-print-model.html → NONE (only centralized RLDATA.providerFetch remains)
bond-regime records  tools.json=3  index.html=3   (protected, intact)
msft records         tools.json=3  index.html=3
FEATURE-009 selftest group markers → line 1830 (BEGIN) / 1983 (END)
node scripts/selftest.mjs → 645 passed, 0 failed (exit 0)  (no unrelated selftest group regressed)
```

Result: Scope 1 DoD is fully met; `execution.completedPhaseClaims` records the SCOPE-01 implement claim (`dodComplete:true`, `certified:false`). Certification remains owned by bubbles.audit + bubbles.validate.

## Scope 3 Execution — Market/Model Interaction Integrity

Scope 3 was delivered test-first on the clean committed baseline (HEAD `c0bf7320`, Scope 2 Done). The additive production surface in `msft-july-print-model.html` is the pure `msftBuildValuationRead(model, quote, probabilities, impliedMovePct)` spot-relative valuation read, a `refresh-failed` branch in `msftReduceResourceOutcome` (quote and bars) that records the failure receipt while preserving the last accepted value/clocks, the public `window.MsftJulyModel.applyRefreshOutcome` production refresh operation (monotonic acceptance via `requestSeq`, spot repricing on genuine accept), the read-only `readValuation` / `snapshotScenarioInputs` diagnostics, the `#o_pricevs` wiring through the new valuation read, and the removal of the `autoImpliedMove` write into the user-owned `impMove` input (the options IV evidence is retained). Only the four allowed surfaces changed.

### Scope 3 Test-First RED Discriminators

Both Scope 3 test surfaces were authored and run RED before any product-source change.

TP-009-S3-01 (functional) RED — the Feature 009 Scope 3 selftest group throws because the planned production valuation function does not yet exist:

```text
Feature 009 Scope 3 market/model interaction integrity
  ✗ FAIL (Feature 009 Scope 3 group threw): function not found: msftBuildValuationRead
================================================
Research-Lab self-test: 650 passed, 1 failed
================================================
selftest_exit=1
```

TP-009-S3-02 (e2e-ui) RED — the focused browser scenario fails because the planned public production operations do not yet exist:

```text
  ✘  1 …ssion: SCN-009-003/004/010 market outcomes preserve the scenario (587ms)
    Error: planned Scope 3 window.MsftJulyModel refresh/valuation/snapshot operations must exist
    expect(received).toEqual(expected) // deep equality
    - Expected  - 3
    + Received  + 3
    -   "applyRefreshOutcome": true,
    -   "readValuation": true,
    -   "snapshotScenarioInputs": true,
    +   "applyRefreshOutcome": false,
    +   "readValuation": false,
    +   "snapshotScenarioInputs": false,
  1 failed
playwright_red_exit=1
```

### Scope 3 TP-009-S3-01 Functional Valuation And Reducer GREEN

After the additive production change, the Feature 009 Scope 3 group is fully green and the whole selftest stays green (650 → 658 passed, the eight new Scope 3 assertions):

```text
Feature 009 Scope 3 market/model interaction integrity
  ✓ Feature 009 valuation reprices spot-over-EPS and price-vs-spot from the accepted spot with a model-relative multiple distinct from the selected scenario P/E
  ✓ Feature 009 valuation derives the probability-weighted value and implied-move band from the accepted spot and user-owned inputs
  ✓ Feature 009 valuation reports quote-required for a missing spot with every spot-dependent field null and no zero, NaN, or Infinity
  ✓ Feature 009 valuation refuses a non-positive modeled EPS with positive-modeled-eps-required and no divide-by-zero
  ✓ Feature 009 refresh-path quote failure records the receipt while preserving the accepted spot, its clocks, the accepted bars, and the aggregate status
  ✓ Feature 009 refresh-path bars failure preserves the accepted daily bars, cutoff, and technicals while recording the receipt
  ✓ Feature 009 refresh failure with no prior accepted quote reports refresh-failed with a null spot and never resurrects a value
  ✓ Feature 009 monotonic acceptance keeps the newer accepted request sequence when an older out-of-order refresh candidate settles
================================================
Research-Lab self-test: 658 passed, 0 failed
================================================
selftest_green_exit=0
```

Every spot-relative expectation is derived from the parsed current `data/options/MSFT.json::spot`; the model and probability legs are deterministic pure-function scaffolding, not embedded market constants.

### Scope 3 TP-009-S3-02 Real-Control Market-Outcome Round-Trip GREEN

The focused browser scenario edits the real Q4-revenue, incremental-depreciation, selected-P/E, and implied-move controls, then drives an accepted newer spot, an older out-of-order candidate, and a failed refresh through the production `applyRefreshOutcome` path with zero provider requests and no request interception:

```text
  ✓  1 …ssion: SCN-009-003/004/010 market outcomes preserve the scenario (720ms)
[SCN-009-004] afterBootImpMove=5.5 optEvidenceAtmIV=0.3 day=2026-07-01
[SCN-009-004] editedInputs q4Revenue=84 deltaDep=30 fwdPE=26 impMove=8.5
[SCN-009-003] spotOverEps before=24.207797450088304 after=24.934031373590955 selectedPe=26 basis=model-relative-not-consensus
[SCN-009-003] modeledEps before=16.276036711409397 after=16.276036711409397 inputsUnchanged=true
[SCN-009-003] o_pricevs before="+7% vs $394 spot @ 26.0×" after="+4% vs $406 spot @ 26.0×"
[SCN-009-010] newerSpot=405.8272 afterOlder.value=405.82721000000004 afterOlder.seq=2
[SCN-009-010] afterFailure value=405.82721000000004 providerAsOf=2026-07-17T15:59:59 reasonCode=MSFT-QUOTE-HTTP
[SCN-009-004] inputsFinal impMove=8.5 fwdPE=26 allSurvived=true
[SCN-009-003/004/010] providerRequests=0 interception=none
  1 passed (1.6s)
playwright_green_exit=0
```

The `afterBootImpMove=5.5` line proves the removed `autoImpliedMove` write no longer overwrites the user-owned implied move even though a shared options snapshot is seeded, while `optEvidenceAtmIV=0.3` proves the options IV evidence for the risk-neutral odds panel is retained. `modeledEps before=after` with `inputsUnchanged=true` proves the accepted spot reprices only the spot-relative comparisons; `afterOlder.seq=2` and `afterFailure value` preserved prove monotonic acceptance and the failure-receipt preservation.

### Scope 3 Full-Spec Non-Regression

The complete msft browser spec stays green — Scopes 1 and 2 are not regressed by the Scope 3 change:

```text
Running 3 tests using 1 worker
  ✓  1 …:47:1 › Regression: SCN-009-001/002/005 cache-first market truth (445ms)
  ✓  2 …Regression: SCN-009-006/007/008 degraded resources stay isolated (541ms)
  ✓  3 …ssion: SCN-009-003/004/010 market outcomes preserve the scenario (514ms)
[SCN-009-005] dailyRows=501 quote=394.007 dailyClose=393.82000732421875
[SCN-009-006] quoteMissing marketStatus=partial quote.status=unavailable quote.valueUsd=null
[SCN-009-007] barsMissing marketStatus=partial quote.valueUsd=394.007 bars.status=unavailable
[SCN-009-008] isolated quote.status=stale quote.valueUsd=394.007 bars.status=rejected bars.reasonCode=MSFT-BARS-SYMBOL
[SCN-009-003/004/010] providerRequests=0 interception=none
  3 passed (2.2s)
playwright_full_exit=0
```

### Scope 3 Containment And Status Transition

Only the four allowed Scope 3 surfaces changed; excluded files, the model cutoff, protected credential behavior, and unrelated selftest groups are unchanged:

```text
=== git status --short (full tree) ===
 M msft-july-print-model.html
 M scripts/selftest.mjs
 M specs/009-msft-july-market-refresh/scopes.md
 M tests/msft-july-market-refresh.spec.mjs
=== hardcoded 390.49 spot in HTML (expect 0) ===        → 0
=== model cutoff 2026-07-06 occurrences in HTML ===     → 5 (intact)
=== page-local credential patterns ===                  → NONE beyond centralized RLDATA.providerFetch/hasKey
=== Feature 009 selftest markers ===                    → BEGIN 1830 / END 2261 (END shifted +154 = entire selftest insertion is inside the markers)
node scripts/selftest.mjs                               → 658 passed, 0 failed (exit 0)
```

Note: the pre-existing `scopes.md` blank-line normalizations in the committed Scope 1/2 evidence blocks were present in the working tree at the Scope 3 baseline (six cosmetic `>`/blank-line insertions, zero semantic content) and were left untouched rather than discarded. Result: Scope 3 DoD is fully met; `execution.completedPhaseClaims` records the SCOPE-03 implement claim (`dodComplete:true`, `certified:false`). Certification remains owned by bubbles.audit + bubbles.validate.

## Scope 4 Execution — One-State User And Export Surfaces

Scope 4 was delivered test-first on the clean committed baseline (HEAD `06adc72b`, Scope 3 Done). The additive product surface in `msft-july-print-model.html` is: the pure top-level `buildMsftCsvRows(state, exportedAt)` versioned CSV projection (`msft-july-market-refresh/v1`); a `#modeSeg` tablist plus a shared truth strip, a Simple cockpit tabpanel, and a Power tabpanel that both render from ONE accepted state; the `setMode`/`applyMode` persisted-mode engine with roving-tablist keyboard support and Power-only canvas draws; a central-policy-gated `fetchLive` refresh that preserves cache truth and links central data settings on every refusal; the `exportScenario` rewrite that reconstructs one accepted-state snapshot via `msftComposeCsvState` + `buildMsftCsvRows`; and the read-only `window.MsftJulyModel.setMode`/`displayMode`/`buildCsvSnapshot` diagnostics wired through a `msft:accepted-state` change notification. Only the three allowed product/test surfaces changed.

### Scope 4 Test-First RED Discriminators

All three Scope 4 test surfaces were authored and run RED before any product-source change.

TP-009-S4-01 (functional) RED — the Feature 009 Scope 4 selftest group throws because the planned production CSV projection does not yet exist:

```text
Feature 009 Scope 4 one-state CSV export surface
  ✗ FAIL (Feature 009 Scope 4 group threw): function not found: buildMsftCsvRows
================================================
Research-Lab self-test: 658 passed, 1 failed
================================================
selftest_s4_red_exit=1
```

TP-009-S4-02 / TP-009-S4-03 (e2e-ui) RED — both browser scenarios fail because the planned one-state mode + export surface does not yet exist:

```text
  ✘  1 …n: SCN-009-009/011/012 one state drives modes refresh and export (452ms)
    Error: planned Scope 4 one-state mode + export surface must exist
    expect(received).toEqual(expected) // deep equality
    +   "buildCsvSnapshot": false,
    +   "displayMode": false,
    +   "modeSeg": false,
    +   "powerTab": false,
    +   "powerView": false,
    +   "setMode": false,
    +   "simpleTab": false,
    +   "simpleView": false,
  ✘  2 …Regression: SCN-009-011 viewport accessibility and canvas matrix (328ms)
    Error: planned Scope 4 mode tablist and views must exist
    Expected: true
    Received: false
  2 failed
playwright_s4_red_exit=1
```

### Scope 4 TP-009-S4-01 CSV Contract GREEN

After the additive `buildMsftCsvRows` change the Feature 009 Scope 4 group is fully green and the whole selftest stays green (658 → 664 passed, the six new Scope 4 assertions). Every expected value is derived from the parsed current `data/options/MSFT.json` + `data/bars/MSFT.json` (technicals via `msftDeriveDailyTechnicals`) and deterministic pure-function scaffolding, never embedded market constants:

```text
Feature 009 Scope 4 one-state CSV export surface
  ✓ Feature 009 CSV first row is the versioned msft-july-market-refresh/v1 schema row
  ✓ Feature 009 CSV emits the full versioned field inventory with separate model/quote/bars/technical/scenario/valuation rows and no ambiguous data_as_of or static spot fallback
  ✓ Feature 009 CSV writes raw finite state values without localized currency, comma, or percent formatting
  ✓ Feature 009 CSV reconstructs the exact complete scenario input set with a distinct export timestamp separate from the evaluation clock
  ✓ Feature 009 CSV leaves unavailable values empty while preserving status and reason rows for a partially hydrated state
  ✓ Feature 009 CSV never emits a credential, tokenized value, or raw option-chain payload
================================================
Research-Lab self-test: 664 passed, 0 failed
================================================
selftest_s4_green_exit=0
```

### Scope 4 TP-009-S4-02 One-State Mode, Refresh, And Export GREEN

The focused browser scenario proves Simple is the first-use default, pointer + keyboard mode switches keep one accepted state (identical spot 394.007 in both modes, no scenario mutation, inactive view hidden + inert), the CSV snapshot is `msft-july-market-refresh/v1` with no `data_as_of`, and the central-policy refresh preserves cache truth with a settings link — all with zero provider requests:

```text
  ✓  1 …n: SCN-009-009/011/012 one state drives modes refresh and export (611ms)
[SCN-009-011] before={"displayMode":"simple","bodyPower":false,"simpleSelected":"true","powerSelected":"false","simpleHidden":false,"powerHidden":true,"powerInert":true}
[SCN-009-011] afterPointer displayMode=power bodyPower=true simpleHidden=true simpleInert=true
[SCN-009-011] afterKeyboard displayMode=simple focused=simpleTab
[SCN-009-011] acceptedSpot=394.007 simpleSpot=394.007 powerSpot=394.007 inputsUnchanged=true
[SCN-009-012] schema=msft-july-market-refresh/v1 data_as_of=absent rowCount=90
[SCN-009-012] quote_value_usd=394.007 daily_bars_row_count=501 exported_at=2026-07-19T20:49:21.773Z
[SCN-009-009] centralState=disabled statusHasSettingsLink=true acceptedSpotPreserved=true
[SCN-009-009/011/012] providerRequests=0 interception=none
  1 passed
playwright_s4_green_exit=0
```

### Scope 4 TP-009-S4-03 Viewport, Accessibility, And Canvas Matrix GREEN

The matrix proves zero body horizontal overflow at all four required viewports in both Simple and Power, the roving tablist keyboard semantics, hidden + inert inactive views, and positive nonblank Power canvas pixels, with complete and partial screenshots captured under the gitignored `test-results` dir. A real 390px Power-mode overflow was found and fixed in-scope (grid-item `min-width:0` cured the 620px heatmap grid-blowout 286 → 59; `overflow-x: clip` on `.card` contained the residual 59 → 0):

```text
  ✓  1 …Regression: SCN-009-011 viewport accessibility and canvas matrix (809ms)
[SCN-009-011] overflow={"desktop-1440":{"simple":0,"power":0},"tablet-768":{"simple":0,"power":0},"mobile-390":{"simple":0,"power":0},"mobile-320":{"simple":0,"power":0}}
[SCN-009-011] keyboard afterRight=power/powerTab afterLeft=simple/simpleTab
[SCN-009-011] canvasNonblank=verified@4viewports partialBodyClean=true providerRequests=0
  1 passed
playwright_s403_exit=0
```

### Scope 4 TP-009-S4-04 Credential Canary GREEN

The existing BUG-001 provider-credentials regression is run unmodified and stays green. Its "one shared current-document capability owns every credential surface" case scans every registered tool file — including `msft-july-print-model.html` — and proves the MSFT route carries no `fhKey`/`apiKey`/`state.fhKey` field, no credential input, no page-local storage/migration, and no tokenized URL:

```text
Running 4 tests using 1 worker
  ✓  1 …loads shared status and erase controls with no credential editor (328ms)
  ✓  2 … shared current-document capability owns every credential surface (4.0s)
  ✓  3 …G-001: every lifecycle and document boundary starts unconfigured (887ms)
  ✓  4 …01: unknown and prototype-shaped providers fail without mutation (135ms)
  4 passed (6.0s)
playwright_canary_exit=0
```

### Scope 4 Full-Spec Non-Regression

The complete msft browser spec stays green — Scopes 1, 2, and 3 are not regressed by the Scope 4 change (the Scope 3 `#o_pricevs` before/after read still works because the Results headline is a shared card visible in both modes):

```text
Running 5 tests using 1 worker
  ✓  1 …:47:1 › Regression: SCN-009-001/002/005 cache-first market truth (401ms)
  ✓  2 …Regression: SCN-009-006/007/008 degraded resources stay isolated (530ms)
  ✓  3 …ssion: SCN-009-003/004/010 market outcomes preserve the scenario (491ms)
  ✓  4 …n: SCN-009-009/011/012 one state drives modes refresh and export (415ms)
  ✓  5 …Regression: SCN-009-011 viewport accessibility and canvas matrix (809ms)
[SCN-009-003] o_pricevs before="+7% vs $394 spot @ 26.0×" after="+4% vs $406 spot @ 26.0×"
  5 passed (3.4s)
playwright_full_msft_exit=0
```

### Scope 4 Change Containment

Only the three allowed product/test surfaces changed; the credential canary is unmodified, no excluded shared/data/brief/registry/notes path changed, the model cutoff is intact, no hardcoded spot returned, no page-local credential or direct-provider URL exists, and the `scripts/selftest.mjs` diff is one hunk strictly inside the Feature 009 markers:

```text
=== changed files (only the three allowed surfaces) ===
 M msft-july-print-model.html
 M scripts/selftest.mjs
 M tests/msft-july-market-refresh.spec.mjs
=== tests/provider-credentials.spec.mjs (canary, unmodified) === (empty)
=== excluded surfaces (rldata/rlapp/rlchart/rlnav/rlticker/rlbrief/data/market-brief/brief-refresh/tools.json/index.html/notes) === (empty)
=== forbidden fhKey|msftFhKey|providerFetch|finnhub.io|RLDATA.hasKey|input[data-provider]|password patterns === NONE_FOUND_OK
=== finnhub references (central API only) ===
2798:        var status = RLDATA.credentialStatus('finnhub');
2814:        Promise.resolve(RLDATA.useCredential('finnhub', 'quote', { symbol: 'MSFT' })).then(...)
=== model cutoff 2026-07-06 occurrences === 6 (intact)   hardcoded 390.49 === 0
=== selftest single hunk inside Feature 009 markers === @@ -2258,6 +2258,124 @@ ; markers BEGIN 1830 / END 2379
node scripts/selftest.mjs === 664 passed, 0 failed (exit 0)
```

Result: Scope 4 DoD is fully met; `execution.completedPhaseClaims` records the SCOPE-04 implement claim (`dodComplete:true`, `certified:false`). Certification remains owned by bubbles.audit + bubbles.validate.
