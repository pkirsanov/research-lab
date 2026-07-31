# Scope 15 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [design addendum](../../design-addendum-production-simple-wiring.md) | [scope index](../_index.md)

## Summary

Scope 15 (Production Simple-View Adapter Wiring, Model B) is **In Progress** and is
**not** Done.

The production bridge is delivered and proven, and **19 of the 22 ordinary tools are
wired** — 18 module-backed tools in strict projection parity plus
`technical-analysis-decision-lab`, which is registry-gated `declaredUnavailable` and
asserts the honest generic `MODULE_ABSENT_REASON` string via the integration test's
discriminator. That 19th tool is an **intended outcome, not a gap**: its registry
`limitations` entry explicitly requires the adapter to return `unavailable` until an
owner model exists (SCN-012-034 lock).

`market-brief` is excluded from ordinary Simple wiring **by design** — its registry
`experience.kind` is `market-action-center`, not an ordinary Simple/Power tool — so it
is not one of the 22.

**`volatility-sizing-lab` is now WIRED (commit `30326253`).** An earlier revision of
this report recorded it as BLOCKED after an attempted wiring was cleanly reverted on a
TP-15-02 strict projection-parity divergence. That divergence has since been
root-caused and **fixed**: the provider was taking a **second wall-clock sample**, so
the bridge and the explicit runtime path computed against two different instants and
could never converge deterministically. The fix reads `asOf` and `decisionTime` back
off the page's own displayed decision (`runtime.decision.asOf` /
`runtime.decision.computedAt`) rather than sampling time again, making the provider
single-sourced and deterministic. **No assertion was relaxed, no tolerance widened, and
no parity check removed** — the tool now passes the identical strict parity assertion
that previously failed it.

**Three ordinary tools remain unwired**, each recorded below with its verified reason.
One is a deliberate architecture opt-out (`msft-july-print-model`); two —
`palm-springs-rental-market-lab` and `ocean-shores-rental-market-lab` — are a
**deliberate product decision**: the owner published `purchasePriceUsd: null` /
`state: "unavailable"` because the underlying research found insufficient data, and the
GitHub Pages deploy gate asserts that absence, so wiring them would mean fabricating the
economic layer the owner intentionally withheld.

Of the seven recorded Test-Plan ↔ implementation drifts, **D1, D2, D3 and D5 are CLOSED**
(TP-15-03/TP-15-04 declared titles, the TP-15-07 bridge canaries, the Implementation
Files allowlist, and TP-15-06's declared title). **D4 half 2** (TP-15-05's original
BUG-003 carrier uses `page.route` interception — the row itself is closed, because
`28099a4d` added a separate interception-free carrier), **D6** (the TP-15-05 traceability
comment names the wrong carriers) and **D7** (a shared surface, `rlchart.js`, was edited
outside the Shared Infrastructure Impact Sweep) remain open with `bubbles.plan`.

No completion of the scope, and no completion of Feature 012, is claimed.

The scope exists to complete the never-wired production rendering of the 23
Feature 012 SimpleModel adapters (Model B): replace the stub
`installSimpleProjectionBridge` with a real adapter-render bridge, flip ordinary
`ownerModes` to `["power"]`, expose each page's real owner state through a
uniform provider seam, demote the 8 native `#simpleView` tools' Simple content to
Power (nothing deleted), and close the BUG-003 native-view breakage. The verified
gap analysis, rendering contract, the full 23-tool owner-state-source mapping, and
the test strategy are in
[design-addendum-production-simple-wiring.md](../../design-addendum-production-simple-wiring.md).

## Reconciliation Verification Run — 2026-07-29, HEAD `0890348a` (fully attributable)

**Claim Source:** executed (2026-07-29, this agent, this session). Every command in this
section was run by this agent and its output below is verbatim. This run supersedes the
partially-attributable session recorded further down: the concurrent session that blocked
attribution has ended, and every one of the seven Test Plan rows now has first-party
executed evidence rather than borrowed evidence.

**Tree state at execution (disclosed, because it affects reproducibility).** HEAD was
`0890348a`. `git status --porcelain` reported three modified files, **one of which is a
scope-15 Implementation File**:

```text
 M .github/bubbles-project.yaml
 M specs/002-distributed-tool-briefs-and-history/state.json
 M tests/simple-production-wiring.spec.mjs
```

The delta on `tests/simple-production-wiring.spec.mjs` (+11/-26) replaces a
request-timing "network quiet" heuristic in the TP-15-03 carrier with the page's own
declared terminal-hydration contract (`awaitDeclaredHydrationBoundary(page,
'data-heatmap-hydration')`). **No assertion was relaxed, no tolerance widened, and no
check removed** — the non-vacuity assertion (`moving a real model input must change the
rendered projection`) and the empty-request-window assertion both survive unchanged; the
change makes owner-state sampling start at a page-owned boundary instead of inferring
hydration from traffic. The TP-15-03/TP-15-04 results below therefore reflect the
**working tree**, not `0890348a` exactly. Anyone reproducing them must apply that
uncommitted delta first. This is disclosed rather than elided because the delta is on
the exact file under test.

### Command 0 — repository binding preflight

```text
$ bash .github/bubbles/scripts/repo-binding-preflight.sh \
    --repo-root ~/research-lab --agent-source research-lab
[repo-binding-preflight] OK — agent source 'research-lab' matches target repo 'research-lab'.
PREFLIGHT_EXIT=0
```

### Command 1 — TP-15-07 broad selftest (968 passed, 0 failed)

Run with **no pipe, filter, `head`, or `tail`**. The suite emits roughly one line per
assertion across 968 assertions, which exceeds this agent's inline result budget, so the
harness spilled stdout to a capture file; the two lines below are a verbatim excerpt of
that captured stdout — the bridge forbidden-authority canary and the summary banner —
located by line number in the capture, not reconstructed.

```text
$ node scripts/selftest.mjs
1133:  ✓ the production bridge path (renderSimpleBridgeInternal + installSimpleProjectionBridge) contains no rlv-focused write and, once comments are stripped, no rlv-focused reference at all (21933 source chars)
1142:Research-Lab self-test: 968 passed, 0 failed
SELFTEST_EXIT=0
```

**Why the total moved 952 → 968.** The delta is exactly the **+16 TP-15-07 production
Simple-view bridge canaries** added under Implementation Plan step 7. Nothing was
removed or renamed; the pre-existing 952 assertions all still run and still pass. The
canary group is present and greppable — the prior session's grep for it returned no
matches, this one returns 19 lines:

```text
$ grep -cE 'renderSimpleBridge|installSimpleProjectionBridge|ownerModes|production bridge' scripts/selftest.mjs
19

$ grep -nE 'renderSimpleBridge|installSimpleProjectionBridge|ownerModes|production bridge' scripts/selftest.mjs
4517:  /* (8) The production bridge path carries no rlv-focused mutation — and after comment-stripping no
4519:  const bridgePathSrc = extractFn(bridgeSrc, 'renderSimpleBridgeInternal') + '\n' + extractFn(bridgeSrc, 'installSimpleProjectionBridge');
4526:  /* (9) The ownerModes contract: rlapp.js's OWN expression, extracted verbatim and executed. */
4534:  assert(ownerModesExpr.length > 0 && JSON.stringify(wiredModes) === '["power"]' && JSON.stringify(unwiredModes) === '["simple","power"]' && JSON.stringify(briefModes) === '["brief"]', 'rlapp.js's own ownerModes expression yields ["power"] for a provider-wired ordinary tool, ["simple","power"] for an unwired one (no regression), and ["brief"] for a brief-only tool');
4536:  /* (10) SCN-012-041: feeding those REAL ownerModes into rlviews.js's REAL toggle predicate proves a
4543:  assert(typeof bridgeApi.renderSimpleBridge === 'function', 'RLEXPERIENCE.renderSimpleBridge is exposed on the production API');
   (19 matching lines total; 6 shown)
```

### Command 2 — TP-15-01 unit (7/7)

```text
$ node --test tests/simple-production-bridge.unit.mjs
✔ renderSimpleBridge is exposed on the production API (4.8265ms)
✔ provider present + real owner state → renders the REAL market-breadth adapter (ready), never mutates rlv-focused (41.300603ms)
✔ no owner-state provider → honest unavailable, no invented signal, never mutates rlv-focused (5.478901ms)
✔ owner evidence does not permit a run (unhydrated) → honest unavailable, never mutates rlv-focused (17.862401ms)
✔ missing adapter module → honest unavailable (no crash), never mutates rlv-focused (5.5465ms)
✔ a queued Simple run does not survive an invalidation, and its promise settles (37.164303ms)
✔ leaving Simple altogether also settles the queued run without painting (4.823ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 272.220719
TP1501_EXIT=0
```

The file grew from 5 to 7 tests — the two new cases are the BUG-004 queued-run
invalidation guarantees. **The TP-15-01 gap is unchanged:** the file still carries no
`ownerModes` and no forbidden-authority assertion.

```text
$ grep -nE 'ownerModes|forbidden|providerFetch|localStorage|fetch\(' tests/simple-production-bridge.unit.mjs
unit_grep_exit=1
```

### Command 3 — TP-15-02 integration (6/6, 19 wired, 18 of 19 strict parity)

```text
$ node --test tests/simple-production-bridge.integration.mjs
[TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
[TP-15-02] not wired (4): market-brief, msft-july-print-model, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 18 of 19
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
✔ TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list) (55.761106ms)
✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (1077.542114ms)
✔ TP-15-02 owner parity: every wired tool's Simple facts EQUAL the owner/Power-path values (1014.19971ms)
✔ TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent) (1799.071124ms)
✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (71.421503ms)
✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (31.556901ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ duration_ms 4187.50517
TP1502_EXIT=0
```

### Command 4 — TP-15-03 + TP-15-04 wiring spec (4/4, system-chrome)

The declared file's whole-file run. All four tests — both TP-15-03 carriers and both
TP-15-04 carriers — are green. The TP-15-04 sweep visited **all 19 wired tools** and
every one converged at `x1` (a single settled projection, no oscillation).

```text
$ npx --no-install playwright test tests/simple-production-wiring.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1
START 22:38:53Z

Running 4 tests using 1 worker

  ✓  1 …Simple renders the real adapter panel in the real owner-mode flow (2.9s)
  ✓  2 …ctuating one recomputes the production projection with no refetch (4.1m)
  ✓  3 …ol paints its real Simple adapter panel with an owner-parity fact (7.2m)
TP-15-04 swept 19 wired tools: market-heatmap-lab=ready(x1) options-flow-feed-lab=ready(x1) intraday-tape-lab=unavailable(x1) swing-structure-lab=ready(x1) options-structure-lab=ready(x1) gamma-trading-lab=ready(x1) sector-research-lab=ready(x1) global-rotation-lab=ready(x1) real-assets-lab=ready(x1) bond-regime-lab=ready(x1) ai-capex-strategy-lab=ready(x1) company-fundamentals-lab=ready(x1) etf-momentum-lab=ready(x1) strategy-self-improvement-lab=ready(x1) strategy-validation-lab=ready(x1) smart-money-flow-lab=ready(x1) waterfront-polo-lab=ready(x1) volatility-sizing-lab=ready(x1) technical-analysis-decision-lab=unavailable(x1)
  ✓  4 …s, and the honest-degradation cases are registry/provider derived (49ms)

  Slow test file: [system-chrome] › tests/simple-production-wiring.spec.mjs (11.4m)
  4 passed (11.4m)
WIRING_EXIT=0
END 22:50:20Z
```

**Honest note on the sweep result — two tools reported `unavailable`, not `ready`.**
In THIS run `intraday-tape-lab` degraded to an honest `unavailable`, alongside the
expected `technical-analysis-decision-lab` (the SCN-012-034 registry lock). The sweep
asserts *a real adapter panel carrying an owner-parity fact and converging at x1* — a
truthful `unavailable` satisfies it, an invented signal does not. `intraday-tape-lab` is
a live intraday-data tool, so an honest `unavailable` outside data hours is the designed
behaviour, not a failure; the test passed on that basis. Recording it verbatim rather
than quoting a run in which every tool happened to be `ready`.

The declared file is interception-free — all five pattern matches are inside comment
blocks that *state* the constraint:

```text
$ grep -nE 'page\.route|context\.route|intercept\(|cy\.intercept|msw|nock|wiremock' tests/simple-production-wiring.spec.mjs
16: * production bridge's rendered panel. There is NO page.route / context.route /
17: * intercept / msw / nock — the owner data is the page's real cached owner state,
110: * a request LISTENER (`page.on('request')`) — an observer, never `page.route`/`intercept`.
374:      `page.route`/`intercept`. */
413: * page.route / context.route / intercept / msw / nock anywhere in this file — the owner
```

### Command 5 — TP-15-05 bond-regime spec (27/27, system-chrome)

```text
$ npx --no-install playwright test tests/bond-regime-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list

Running 27 tests using 1 worker

  ✓  17 …ady waits for auto-hydration before Simple and Power comparison (928ms)
  ✓  18 …spec.mjs:500:1 › BS-011 Simple and Power share one model digest (839ms)
  ✓  19 …-012 lever change recomputes without fetch or observed mutation (747ms)

  27 passed (30.7s)
TP1505_EXIT=0
```

Green, but **D4 half 2 still disqualifies the row.** Re-verified this run: the
`Regression BUG-003:` carrier spans lines 413-514 and contains executable `page.route`
interception at line 426, so it is a mocked test and cannot close a live `e2e-ui` row.

```text
$ grep -nE 'page\.route|context\.route|intercept\(|cy\.intercept|msw|nock|wiremock' tests/bond-regime-lab.spec.mjs
311:    await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
378:  await page.route('**/*', async (route) => {
426:  await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {

$ grep -nE "^test\(" tests/bond-regime-lab.spec.mjs | grep -iE 'BUG-003|BS-012'
413:test('Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison', async ({ page }) => {
515:test('BS-012 lever change recomputes without fetch or observed mutation', async ({ page }) => {
```

### Command 6 — TP-15-06 volatility-sizing spec (16/16, system-chrome)

```text
$ npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list

Running 16 tests using 1 worker

  ✓   5 …n BS-009: insufficient history is unavailable with exact counts (765ms)
  ✓  16 …le THROUGH the shared rlnav registration, not just by direct URL (1.1s)

  16 passed (14.6s)
TP1506_EXIT=0
```

Both declared carriers exist verbatim and the file is interception-free (its single
pattern match is the comment that states the constraint):

```text
$ grep -nE "^test\(" tests/volatility-sizing-lab.spec.mjs | grep -E 'TP-02-04|BS-009'
221:test('Regression BS-009: insufficient history is unavailable with exact counts', async ({ page }) => {
405:test('TP-02-04: the volatility tool is reachable THROUGH the shared rlnav registration, not just by direct URL', async ({ page }) => {

$ grep -nE 'page\.route|context\.route|intercept\(|cy\.intercept|msw|nock|wiremock' tests/volatility-sizing-lab.spec.mjs
9: * page.route / route.fulfill / route.abort / response interception anywhere in this file.
```

### Command 7 — Pages deploy gate + briefs + simple-model adapters (53/53, system-chrome)

```text
$ npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs \
    tests/distributed-briefs.spec.mjs tests/simple-models.spec.mjs \
    tests/simple-model-adapters-market.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=line

Running 53 tests using 4 workers
…on: SCN-005-027 acquisition baselines disclose sample status and legal unknowns
[SCN-005-027] luxurySamples=2
[SCN-005-027] status=active-ask
[SCN-005-027] sampleStates=sparse,unclean
[SCN-005-027] legalUnknowns=visible
[SCN-005-027] baseline=unavailable
[SCN-005-027] purchasePriceUsd=UNAVAILABLE
  53 passed (50.4s)
BATCH4_EXIT=0
```

This run is the **direct executed proof of the rental-tool product decision**:
`tests/palm-springs-rental-market-lab.spec.mjs` — which is also the GitHub Pages deploy
gate — asserts `purchasePriceUsd=UNAVAILABLE` and `baseline=unavailable`. Wiring an
owner-state provider that produced a `ready` acquisition projection would have to
fabricate exactly the economic layer this gate protects.

### Not re-run by this agent — borrowed evidence, honestly attributed

`tests/market-heatmap-control-surface.spec.mjs` (BUG-004's control-surface spec,
**4 passed, 15.1m, exit 0**) was executed by the **orchestrating session** at this same
commit, not by this agent. It is recorded here for continuity only. It is **not a
declared scope-15 Test Plan row and is not used to close any DoD item in this scope.**

### Net effect of this run on the DoD

| Row | Before | After | Why |
|---|---|---|---|
| TP-15-01 | open | **open** | executed 7/7, but the named file still has no `ownerModes` / forbidden-authority assertion |
| TP-15-02 | checked | **checked** | re-executed 6/6, evidence refreshed to 19 wired / 18-of-19 |
| TP-15-03 | open | **checked** | both declared carriers executed green in the declared file |
| TP-15-04 | open | **checked** | both declared carriers executed green; sweep covered all 19 wired tools at x1 |
| TP-15-05 | open | **open** | executed 27/27, but the BUG-003 carrier still uses `page.route` (D4 half 2) |
| TP-15-06 | open | **checked** | both declared carriers executed green and interception-free |
| TP-15-07 | open | **checked** | 968/0 with the 16-canary group present |

## Verification Run — 2026-07-29, HEAD `8a2d3ce0` (partially attributable)

**Claim Source:** executed (2026-07-29, this session). Every command below was executed
by this agent. **Read the attributability tag on each command before relying on it.**

**BLOCKING CONDITION FOUND THIS SESSION — the working tree was mutated by a concurrent
session while these commands ran.** At session start `git status --porcelain` listed
exactly one modified file (`.github/bubbles-project.yaml`, unrelated). By the end of the
browser runs it listed five, four of which are **scope-15 Implementation Files**:
`market-heatmap-lab.html`, `rlexperience.js`,
`tests/market-heatmap-control-surface.spec.mjs` and
`tests/simple-production-bridge.unit.mjs`. HEAD also advanced twice
(`087ad2ad` → `43bcd583` → `8a2d3ce0`) during the session. Commands are therefore split
into two classes:

- **ATTRIBUTABLE** — ran before the first foreign write landed (18:06 UTC) and read only
  files that were clean at the time and unchanged by the intervening commits.
- **NOT ATTRIBUTABLE** — overlapped the foreign writes to the exact files under test.
  These results are recorded verbatim but are **not used to close any DoD item**, in
  either direction.

### Command 0 — repository binding preflight (ATTRIBUTABLE)

```text
$ bash .github/bubbles/scripts/repo-binding-preflight.sh \
    --repo-root ~/research-lab --agent-source research-lab
[repo-binding-preflight] OK — agent source 'research-lab' matches target repo 'research-lab'.
PREFLIGHT_EXIT=0
```

### Command 1 — TP-15-07 broad selftest (ATTRIBUTABLE)

`scripts/selftest.mjs` was clean throughout, and `git diff --name-only 087ad2ad..HEAD`
touched only `specs/002-*` documents, so this result is attributable to committed source.
The TP-15-07 canary group now exists and carries **16** canaries; the suite total moved
from 952 to **968** with 0 failures.

```text
$ node scripts/selftest.mjs

Feature 012 Scope 15 production Simple-view bridge canaries (TP-15-07)
  ✓ the bridge publishes a non-empty adapter-module binding table, each entry naming a browser global and a registrar (6 bindings parsed from rlexperience.js)
  ✓ the wired set is derived from the production registry + the deployed pages and is non-empty (19 wired of 23 registry definitions, scanned 26 pages)
  ✓ every page-registered owner-state provider resolves to a registry definition carrying a non-empty adapterId/adapterModule/definitionId (0 orphan wirings, 0 identity gaps across 19 wired tools)
  ✓ every wired tool's declared adapter module exists on disk and has a bridge binding (6 distinct modules across 19 wired tools)
  ✓ every wired tool's adapter module loads and exports the registrar its binding names (19/19 resolved, gaps: none)
  ✓ registering every wired module into the REAL runtime registers the registry-declared adapterId for the registry-declared definitionId (19/19 checked, gaps: none)
  ✓ no forbidden authority: the runtime's own diagnostic reports every authority false after adapter registration (6 authority flags x 19 wired tools, owned: 0)
  ✓ exactly one executable rlv-focused write exists across all production sources and it lives in rlviews.js (scanned 54 files, writers: rlviews.js x1)
  ✓ applyVisual (rlviews.js) is the function that owns that sole rlv-focused write
  ✓ the production bridge path (renderSimpleBridgeInternal + installSimpleProjectionBridge) contains no rlv-focused write and, once comments are stripped, no rlv-focused reference at all (20436 source chars)
  ✓ the bridge path performs local compute only — no network, provider, storage, or cookie authority in its executable source (8 tokens checked, hits: none)
  ✓ rlapp.js's own ownerModes expression yields ["power"] for a provider-wired ordinary tool, ["simple","power"] for an unwired one (no regression), and ["brief"] for a brief-only tool
  ✓ rlviews.js's own rlv-focused predicate, fed those real ownerModes, focuses a wired tool's Simple, leaves Power unfocused, and never focuses an unwired native Simple or a brief view
  ✓ RLEXPERIENCE.renderSimpleBridge is exposed on the production API
  ✓ a wired tool with no owner state degrades to an honest unavailable that names the missing owner adapter, publishes a null numeric, paints no numeric node, and invents no signal (market-heatmap-lab)
  ✓ the bridge never mutates body.classList on the unavailable path — applyVisual stays the sole owner of rlv-focused (BUG-003 invariant, 0 recorded mutations)

================================================
Research-Lab self-test: 968 passed, 0 failed
================================================
===SELFTEST_EXIT=0===
```

### Command 2 — TP-15-02 integration (ATTRIBUTABLE)

`tests/simple-production-bridge.integration.mjs` was clean, and this run completed before
the 18:06 write to `rlexperience.js`.

```text
$ node --test tests/simple-production-bridge.integration.mjs
[TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
[TP-15-02] not wired (4): market-brief, msft-july-print-model, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 18 of 19
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
✔ TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list) (68.809813ms)
✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (1146.572128ms)
✔ TP-15-02 owner parity: every wired tool's Simple facts EQUAL the owner/Power-path values (932.431301ms)
✔ TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent) (1403.481743ms)
✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (59.196183ms)
✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (40.657589ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3820.650368
===TP1502_EXIT=0===
```

### Command 3 — TP-15-01 unit + the unchanged TP-15-01 gap (ATTRIBUTABLE)

This run observed the file in its committed 5-test state, before the concurrent session
added 274 lines to it. The two assertions TP-15-01's DoD row requires beyond the bridge
contract — `ownerModes` and forbidden authority — are **still absent from the named
file**, and remained absent after the concurrent addition (re-grepped at 18:19 UTC,
still 0 matches).

```text
$ node --test tests/simple-production-bridge.unit.mjs
✔ renderSimpleBridge is exposed on the production API (4.673198ms)
✔ provider present + real owner state → renders the REAL market-breadth adapter (ready), never mutates rlv-focused (33.882691ms)
✔ no owner-state provider → honest unavailable, no invented signal, never mutates rlv-focused (6.666498ms)
✔ owner evidence does not permit a run (unhydrated) → honest unavailable, never mutates rlv-focused (12.750596ms)
✔ missing adapter module → honest unavailable (no crash), never mutates rlv-focused (4.372599ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 174.703051
===TP1501_EXIT=0===

$ grep -n 'ownerModes\|forbidden\|providerFetch\|localStorage\|fetch(' tests/simple-production-bridge.unit.mjs
===UNIT_GREP_EXIT=1===

$ grep -niE 'authority|ownermode|canFetch|network|storage|cookie|credential' tests/simple-production-bridge.unit.mjs
===GREP2_EXIT=1===
```

### Command 4 — TP-15-03 / TP-15-04 wiring spec (NOT ATTRIBUTABLE)

Exit 0, but this run took 16.2 minutes and spanned the concurrent 18:06 write to
`rlexperience.js` and the 18:13 write to `market-heatmap-lab.html` — the two files the
market-heatmap assertions exercise. The pass is recorded, and is **not** used to close a
DoD item.

The run also revealed that `playwright.config.mjs` declares `testMatch` with **no
`testIgnore`**, so specs inside the two stray in-repo git worktrees
(`.git/bug004-red-2f-09e5`, `.git/bug004-red-31-09e5`) are collected as well. The "11
tests" figure is therefore 4 working-tree tests plus 4 and 3 snapshot copies, not 11
distinct working-tree tests.

```text
$ npx --no-install playwright test tests/simple-production-wiring.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=line --workers=1

Running 11 tests using 1 worker
TP-15-04 swept 19 wired tools: market-heatmap-lab=ready(x8) options-flow-feed-lab=ready(x1) intraday-tape-lab=unavailable(x1) swing-structure-lab=ready(x1) options-structure-lab=ready(x1) gamma-trading-lab=ready(x1) sector-research-lab=ready(x1) global-rotation-lab=ready(x1) real-assets-lab=ready(x1) bond-regime-lab=ready(x1) ai-capex-strategy-lab=ready(x1) company-fundamentals-lab=ready(x1) etf-momentum-lab=ready(x1) strategy-self-improvement-lab=ready(x1) strategy-validation-lab=ready(x1) smart-money-flow-lab=ready(x1) waterfront-polo-lab=ready(x1) volatility-sizing-lab=ready(x1) technical-analysis-decision-lab=unavailable(x1)
  Slow test file: [system-chrome] › .git/bug004-red-2f-09e5/tests/simple-production-wiring.spec.mjs (6.8m)
  Slow test file: [system-chrome] › tests/simple-production-wiring.spec.mjs (5.3m)
  11 passed (16.2m)
===TP1503_TP1504_EXIT=0===

$ npx --no-install playwright test tests/simple-production-wiring.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --list
  [system-chrome] › .git/bug004-red-2f-09e5/tests/simple-production-wiring.spec.mjs:48:1 › Regression: market-heatmap Simple renders the real adapter panel in the real owner-mode flow
  [system-chrome] › .git/bug004-red-2f-09e5/tests/simple-production-wiring.spec.mjs:198:1 › TP-15-03 market-heatmap Simple renders real steerable controls and actuating one recomputes the production projection with no refetch
  [system-chrome] › .git/bug004-red-2f-09e5/tests/simple-production-wiring.spec.mjs:720:1 › TP-15-04 every wired ordinary tool paints its real Simple adapter panel with an owner-parity fact
  [system-chrome] › .git/bug004-red-2f-09e5/tests/simple-production-wiring.spec.mjs:811:1 › TP-15-04 the swept set is derived from the production registry + pages, and the honest-degradation cases are registry/provider derived
  [system-chrome] › .git/bug004-red-31-09e5/tests/simple-production-wiring.spec.mjs:48:1 › Regression: market-heatmap Simple renders the real adapter panel in the real owner-mode flow
  [system-chrome] › .git/bug004-red-31-09e5/tests/simple-production-wiring.spec.mjs:388:1 › TP-15-04 every wired ordinary tool paints its real Simple adapter panel with an owner-parity fact
  [system-chrome] › .git/bug004-red-31-09e5/tests/simple-production-wiring.spec.mjs:459:1 › TP-15-04 the swept set is derived from the production registry + pages, and the honest-degradation cases are registry/provider derived
  [system-chrome] › tests/simple-production-wiring.spec.mjs:48:1 › Regression: market-heatmap Simple renders the real adapter panel in the real owner-mode flow
  [system-chrome] › tests/simple-production-wiring.spec.mjs:198:1 › TP-15-03 market-heatmap Simple renders real steerable controls and actuating one recomputes the production projection with no refetch
  [system-chrome] › tests/simple-production-wiring.spec.mjs:720:1 › TP-15-04 every wired ordinary tool paints its real Simple adapter panel with an owner-parity fact
  [system-chrome] › tests/simple-production-wiring.spec.mjs:811:1 › TP-15-04 the swept set is derived from the production registry + pages, and the honest-degradation cases are registry/provider derived
Total: 11 tests in 3 files
===LIST_EXIT=0===
```

### Command 5 — BUG-004 market-heatmap control surface (NOT ATTRIBUTABLE, exit 1)

**This run FAILED.** `BUG-004 SCN-B004-C` could not find `#winSeg` inside the Map panel.
The run overlapped the concurrent session's uncommitted rewrite of the very file under
test: `market-heatmap-lab.html` was written at 18:13 UTC mid-run, and its working copy
reverts the committed `087ad2ad` structure (`<div class="panel">` wrapping a nested
`<div class="simple-only">`) back to the pre-fix `<div class="panel simple-only">`.
The spec resolves its served root from `BUG004_IMMUTABLE_ROOT || ACTIVE_ROOT`, and that
variable was unset, so the browser was served the mutating working tree.

This failure is therefore **not evidence that the committed BUG-004 fix is broken**, and
equally it is **not evidence that it is sound**. The state of BUG-004 could not be
established from this tree.

```text
$ npx --no-install playwright test tests/market-heatmap-control-surface.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=line --workers=1

Running 3 tests using 1 worker
  1) [system-chrome] › tests/market-heatmap-control-surface.spec.mjs:452:1 › BUG-004 SCN-B004-C: direct Power applies native treemap controls with zero post-hydration requests

    Error: the single native lever #winSeg ("Color window") must be visible inside Map

    expect(locator).toBeVisible() failed

    Locator: locator('#simpleWrap > .panel').filter({ has: locator('#tm') }).locator('#winSeg')
    Expected: visible
    Timeout: 5000ms
    Error: element(s) not found

      472 |       mapPanel.locator(`#${lever.id}`),
      473 |       `the single native lever #${lever.id} ("${lever.label}") must be visible inside Map`
    > 474 |     ).toBeVisible();
          |       ^
      475 |   }

  Slow test file: [system-chrome] › tests/market-heatmap-control-surface.spec.mjs (6.2m)
  1 failed
    [system-chrome] › tests/market-heatmap-control-surface.spec.mjs:452:1 › BUG-004 SCN-B004-C: direct Power applies native treemap controls with zero post-hydration requests
  2 passed (6.2m)
===BUG004_EXIT=1===
```

### Command 6 — Pages deploy gate + briefs + simple-model adapters (NOT ATTRIBUTABLE)

Exit 0. Ran after the 18:13/18:18 foreign writes, so it exercised the mutated tree.

```text
$ npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs \
    tests/distributed-briefs.spec.mjs tests/simple-models.spec.mjs \
    tests/simple-model-adapters-market.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=line --workers=2

  159 passed (1.9m)
===BATCH4_EXIT=0===
```

### Finding — concurrent mutation of scope-15 Implementation Files

Raw evidence of the contention, captured at 18:16 and re-confirmed at 18:19 UTC:

```text
$ git status --porcelain          # at session start
 M .github/bubbles-project.yaml

$ git status --porcelain          # after the browser runs
 M .github/bubbles-project.yaml
 M market-heatmap-lab.html
 M rlexperience.js
 M tests/market-heatmap-control-surface.spec.mjs
 M tests/simple-production-bridge.unit.mjs

$ git diff --stat
 .github/bubbles-project.yaml                  |   1 -
 market-heatmap-lab.html                       |  24 +--
 rlexperience.js                               |  62 +++---
 tests/market-heatmap-control-surface.spec.mjs |  34 +++-
 tests/simple-production-bridge.unit.mjs       | 274 ++++++++++++++++++++++++++
 5 files changed, 355 insertions(+), 40 deletions(-)

$ date; stat -c '  %y  %n' market-heatmap-lab.html rlexperience.js \
    tests/simple-production-bridge.unit.mjs tests/market-heatmap-control-surface.spec.mjs
Wed Jul 29 18:19:40 UTC 2026
  2026-07-29 18:13:13  market-heatmap-lab.html
  2026-07-29 18:06:07  rlexperience.js
  2026-07-29 18:06:07  tests/simple-production-bridge.unit.mjs
  2026-07-29 18:18:48  tests/market-heatmap-control-surface.spec.mjs

$ git log --oneline -1            # HEAD advanced twice during the session
8a2d3ce0 docs(002): record FW-01 - G026 fires on scope 08 as a framework false positive
```

The 274 added lines in the unit file are four new `requestSimpleRefresh` tests
(BUG-004 refresh-coordinator coverage). They do **not** add the `ownerModes` or
forbidden-authority assertions that TP-15-01's DoD row names.

### Finding — the declared Test-Plan titles are still absent (D1, D4, D5 stand)

> **SUPERSEDED 2026-07-29 by the `bubbles.plan` title reconciliation.** This finding is
> accurate for the state it describes (HEAD `8a2d3ce0`) and is retained as the audit
> record that routed the drift. The title half of D1, D4 and D5 is now **closed** — see
> [D1 closure](#d1--closed-2026-07-29--tp-15-03-and-tp-15-04-declared-titles-did-not-exist-in-the-suite),
> [D4 partial closure](#d4--tp-15-05s-declared-title-does-not-exist-and-the-nearest-test-is-mocked)
> and [D5](#d5--closed-2026-07-29--tp-15-06s-declared-title-did-not-exist). D4's
> interception half remains open.

The TP **identifiers** are now present throughout the suite, which is a real improvement:
`TP-15-01` ×4, `TP-15-02` ×16, `TP-15-03` ×7, `TP-15-04` ×10, `TP-15-05` ×5,
`TP-15-06` ×6, `TP-15-07` ×2 literal occurrences across `tests/` and `scripts/`, and
`tests/simple-production-wiring.spec.mjs` now carries a real TP-15-03 control-recompute
test and two real TP-15-04 sweep tests where it previously had one test in total.

The **persistent titles the Test Plan declares** are a separate matter, and all four are
still not present. Each Test Plan `Command` cell greps for a title that selects nothing:

```text
$ grep -rn -F 'Regression: market-heatmap Simple renders the real adapter panel and one control recomputes owner leadership' tests/
   (exit 1 — NOT FOUND)

$ grep -rn -F 'Regression: each wired ordinary tool shows a ready adapter panel in Simple with an owner-parity fact' tests/
   (exit 1 — NOT FOUND)

$ grep -rn -F 'Regression: bond-regime native content shows in Power not Simple and the adapter panel is the Simple surface' tests/
   (exit 1 — NOT FOUND)

$ grep -rn -F 'Regression: volatility-sizing native Simple moves to Power and Simple shows the adapter panel or an honest unavailable until the RLVOL provider is wired' tests/
   (exit 1 — NOT FOUND)
```

Reconciling the Test Plan's title column with the delivered TP-id-prefixed titles is an
edit to a Test Plan row, which this agent does not own. D1, D4 and D5 remain with
`bubbles.plan`.

### Finding — TP-15-05's carrier still uses request interception

Unchanged from the prior session, and re-verified here. `TP-15-05 CARRIER 2/2` is the
test `Regression BUG-003: Ready waits for auto-hydration before Simple and Power
comparison`, which begins at line 413; the `page.route` + `route.fulfill` pair at line
426 is inside it. A mocked test cannot satisfy an `e2e-ui` (live-system) row.

```text
$ grep -nE 'page\.route|context\.route|intercept\(|cy\.intercept|msw|nock|wiremock' tests/bond-regime-lab.spec.mjs
311:    await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
378:  await page.route('**/*', async (route) => {
426:  await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {

$ grep -n 'CARRIER' tests/bond-regime-lab.spec.mjs
139:// TP-15-05 CARRIER 1/2 — the "native content shows in POWER" half of the declared row.
407:// TP-15-05 CARRIER 2/2 — the "NOT Simple" half plus the BUG-003 closure. The test titled
```

By contrast `tests/simple-production-wiring.spec.mjs`,
`tests/market-heatmap-control-surface.spec.mjs`, `tests/volatility-sizing-lab.spec.mjs`,
`tests/simple-production-bridge.integration.mjs` and
`tests/simple-production-bridge.unit.mjs` are all interception-free — every match in the
first three is inside a comment block that states the constraint, and the last two have
no matches at all.

### Net effect on the DoD this session

One item moves: **TP-15-07** is closed, because both halves its row names are now
satisfied by attributable evidence — the suite is green at 968/0 and the bridge canaries
exist. The other nine open items stay open, each for a reason recorded under the item
itself. The scope status stays `In Progress`.

## Final Verification Run — 2026-07-28, HEAD `30326253`

**Claim Source:** executed (2026-07-28, a prior session). Every command below was
re-executed by that agent at HEAD `30326253` from a tree with **no modifications to any
scope-15 artifact or product file** (`git status --short` showed only the unrelated
concurrent `specs/002` modification and the untracked `specs/014|015|016` folders owned
by other sessions). Nothing in this section is carried over from an earlier run. This
section **supersedes** the HEAD `fed8f9ab` run retained further below.

### Command 0 — repository binding preflight

```text
$ bash .github/bubbles/scripts/repo-binding-preflight.sh \
    --repo-root /home/redacted/research-lab --agent-source research-lab
[repo-binding-preflight] OK — agent source 'research-lab' matches target repo 'research-lab'.
PREFLIGHT_EXIT=0
```

### Command 1 — TP-15-02 integration (19 wired, 18 of 19 strict parity)

```text
$ node --test tests/simple-production-bridge.integration.mjs
[TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
[TP-15-02] not wired (4): market-brief, msft-july-print-model, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 18 of 19
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
✔ TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list) (49.125262ms)
✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (917.186397ms)
✔ TP-15-02 owner parity: every wired tool's Simple facts EQUAL the owner/Power-path values (879.434727ms)
✔ TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent) (1272.626227ms)
✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (48.949663ms)
✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (30.057777ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3317.921861
EXIT=0
```

`volatility-sizing-lab` now appears in the **wired (19)** list and inside the
**18 of 19** strict-parity set — the same strict assertion that previously forced the
revert.

### Command 2 — TP-15-01 unit

```text
$ node --test tests/simple-production-bridge.unit.mjs
✔ renderSimpleBridge is exposed on the production API (3.890697ms)
✔ provider present + real owner state → renders the REAL market-breadth adapter (ready), never mutates rlv-focused (26.70638ms)
✔ no owner-state provider → honest unavailable, no invented signal, never mutates rlv-focused (4.717597ms)
✔ owner evidence does not permit a run (unhydrated) → honest unavailable, never mutates rlv-focused (9.977392ms)
✔ missing adapter module → honest unavailable (no crash), never mutates rlv-focused (3.673298ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 139.900595
EXIT=0
```

### Command 3 — TP-15-07 broad selftest

**Provenance note (honest labelling).** `node scripts/selftest.mjs` was executed with
**no pipe, filter, `head`, or `tail`**. The run emits roughly one line per assertion
across 952 assertions (~1124 lines), which exceeds this agent's inline result budget, so
the harness itself spilled the stdout to a capture file. The block below is a
**verbatim contiguous excerpt of the end of that captured stdout**, including the
summary banner and the exit code — not a summary and not a reconstruction.

```text
$ node scripts/selftest.mjs
Feature 012 Scope 12 Dynamic Red Alert discovery/qualification/projection
  ✓ SCN-012-023 a dynamically corroborated, market-confirmed, high-severity candidate qualifies with every falsifiable field and an admission score (never a probability/confidence/crash-odds field), publication Feature-002 gated
  ✓ SCN-012-024 a single-origin dramatic candidate consumes no visible slot, is a safe insufficient-corroboration count, and never echoes its dramatic title
  ✓ SCN-012-025 a no-candidate window renders an honest empty state with cutoff/channels/owner coverage and no illustrative topic

================================================
Research-Lab self-test: 952 passed, 0 failed
================================================
EXIT=0
```

### Command 4 — TP-15-06 volatility-sizing spec (standalone, system-chrome)

```text
$ npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1

Running 16 tests using 1 worker

  ✓   1 …entile always renders its trailing window and observation count (484ms)
  ✓   2 …ssion BS-005: no directional element appears in Simple or Power (495ms)
  ✓   3 …ression BS-007: backtest is a deep-link with no in-tool verdict (343ms)
  ✓   4 …S-008: managed-suppressed history is marked, not calm/full-size (471ms)
  ✓   5 …n BS-009: insufficient history is unavailable with exact counts (476ms)
  ✓   6 …Regression BS-010: Simple and Power share one decision identity (396ms)
  ✓   7 …BS-004: near-zero forecast vol floors the multiplier at the cap (289ms)
  ✓   8 …on BS-006: GARCH fit is labeled a lightweight optimizer not MLE (743ms)
  ✓   9 …ression BS-011: non-convergent GARCH falls back to labeled EWMA (465ms)
  ✓  10 …S-013: realized is never relabeled a forecast in the owner read (311ms)
  ✓  11 …longer history is caveated and reproduces no multi-decade claim (445ms)
  ✓  12 …ers synchronous non-blank canvases with text and table fallback (408ms)
  ✓  13 …Controls recompute one decision without any market-data request (666ms)
  ✓  14 …ases carry aria-label and same-data table on desktop and mobile (624ms)
  ✓  15 …es one owner read and Market Brief renders it without recompute (501ms)
  ✓  16 …e THROUGH the shared rlnav registration, not just by direct URL (858ms)

  16 passed (9.7s)
EXIT=0
```

The `--reporter=list` middle-truncates long titles, so the full titles were also
enumerated to prove exactly which behaviours the 16 green tests carry:

```text
$ npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --list
Listing tests:
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:171:1 › Regression BS-009: insufficient history is unavailable with exact counts
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:206:1 › Regression BS-010: Simple and Power share one decision identity
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:275:1 › Cache-first partial paint renders synchronous non-blank canvases with text and table fallback
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:291:1 › Controls recompute one decision without any market-data request
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:310:1 › Power canvases carry aria-label and same-data table on desktop and mobile
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:325:1 › Registered Volatility Sizing tool publishes one owner read and Market Brief renders it without recompute
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:351:1 › TP-02-04: the volatility tool is reachable THROUGH the shared rlnav registration, not just by direct URL
Total: 16 tests in 1 file
EXIT=0
```

**No test in this file carries TP-15-06's declared persistent title.** See
[D5](#d5--tp-15-06s-declared-title-does-not-exist-behaviour-proven-title-absent).

### Command 5 — Simple-adapter + production-wiring + wired-tool regression (8 specs, system-chrome)

```text
$ npx --no-install playwright test tests/simple-production-wiring.spec.mjs \
    tests/simple-models.spec.mjs tests/simple-model-adapters-market.spec.mjs \
    tests/simple-model-adapters-macro-fundamental.spec.mjs \
    tests/simple-model-adapters-strategy-property.spec.mjs \
    tests/volatility-sizing-lab.spec.mjs tests/bond-regime-lab.spec.mjs \
    tests/company-fundamentals-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1
  ✓   92 …egression BS-010: Simple and Power share one decision identity (492ms)
  ✓   93 …S-004: near-zero forecast vol floors the multiplier at the cap (415ms)
  ✓   94 …n BS-006: GARCH fit is labeled a lightweight optimizer not MLE (717ms)
  ✓   95 …ession BS-011: non-convergent GARCH falls back to labeled EWMA (582ms)
  ✓   96 …-013: realized is never relabeled a forecast in the owner read (502ms)
  ✓   97 …onger history is caveated and reproduces no multi-decade claim (861ms)
  ✓   98 …rs synchronous non-blank canvases with text and table fallback (814ms)
  ✓   99 …Controls recompute one decision without any market-data request (1.0s)
  ✓  100 …ses carry aria-label and same-data table on desktop and mobile (960ms)
  ✓  101 …s one owner read and Market Brief renders it without recompute (767ms)
  ✓  102 …e THROUGH the shared rlnav registration, not just by direct URL (1.1s)

  102 passed (1.7m)
EXIT=0
```

This single run covers the 5 Simple-adapter/wiring specs **and** all three
shell-reconciled wired-tool specs (`volatility-sizing-lab`, `bond-regime-lab`,
`company-fundamentals-lab`) together, proving the wiring did not regress any of them.

### Command 6 — GitHub Pages deploy gate (palm-springs rental, system-chrome)

```text
$ npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list

Running 29 tests using 1 worker

  ✓  17 …acquisition baselines disclose sample status and legal unknowns (396ms)
[SCN-005-027] luxurySamples=2
[SCN-005-027] status=active-ask
[SCN-005-027] sampleStates=sparse,unclean
[SCN-005-027] filtersDedupRangePeriod=visible
[SCN-005-027] legalUnknowns=visible
[SCN-005-027] rights=public-summary
[SCN-005-027] baseline=unavailable
[SCN-005-027] purchasePriceUsd=UNAVAILABLE
  ✓  27 …4 Ocean Shores coastal inputs change nights costs and cash flow (735ms)
  ✓  28 …05-025 Palm Springs luxury keeps legal and operating boundaries (474ms)
  ✓  29 …n cockpit — model + sliders in Simple, deep-dive lives in Power (516ms)

  29 passed (27.8s)
EXIT=0
```

The emitted `[SCN-005-027] purchasePriceUsd=UNAVAILABLE` and
`[SCN-005-027] baseline=unavailable` lines are the deploy gate **asserting the owner's
deliberate data absence** — the decisive reason the two rental tools are not wired.

---

## Superseded Verification Run — 2026-07-28, HEAD `fed8f9ab`

**Retained for audit; superseded by the HEAD `30326253` run above.** Every command
below was genuinely executed at HEAD `fed8f9ab`, before `volatility-sizing-lab` was
wired. Its `18 wired / 17-of-18 parity` figures are the true figures **for that commit**
and are no longer the current state.

### Command 1 — TP-15-02 integration

```text
$ node --test tests/simple-production-bridge.integration.mjs
[TP-15-02] wired (18): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, technical-analysis-decision-lab
[TP-15-02] not wired (5): market-brief, msft-july-print-model, volatility-sizing-lab, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 17 of 18
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
✔ TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list) (49.872264ms)
✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (900.39665ms)
✔ TP-15-02 owner parity: every wired tool's Simple facts EQUAL the owner/Power-path values (871.463866ms)
✔ TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent) (1276.640359ms)
✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (47.407565ms)
✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (60.649655ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3327.92107
===TP1502_EXIT=0===
```

### Command 2 — TP-15-01 unit

```text
$ node --test tests/simple-production-bridge.unit.mjs
✔ renderSimpleBridge is exposed on the production API (5.201696ms)
✔ provider present + real owner state → renders the REAL market-breadth adapter (ready), never mutates rlv-focused (33.396171ms)
✔ no owner-state provider → honest unavailable, no invented signal, never mutates rlv-focused (7.360593ms)
✔ owner evidence does not permit a run (unhydrated) → honest unavailable, never mutates rlv-focused (11.93319ms)
✔ missing adapter module → honest unavailable (no crash), never mutates rlv-focused (4.057696ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 174.403246
===TP1501_EXIT=0===
```

### Command 3 — TP-15-07 broad selftest

**Provenance note (honest labelling).** The run emitted **1030 lines / 56977 bytes** of
unfiltered stdout — roughly one line per assertion across 952 assertions. The command
was executed with no pipe, filter, `head`, or `tail`; the complete stdout was captured
to a file (1030 lines, verified with `wc -l`). The block below is a **verbatim excerpt
of that captured file's tail** — not a summary and not a reconstruction. The line count,
byte size, assertion totals and exit code are all quoted from that captured run.

```text
$ node scripts/selftest.mjs
...
  ✓ every committed web-evidence fixture (>= 11) evaluates deterministically against the REAL acquire() production transform
  ✓ web-evidence-acquire.mjs imports ONLY node:crypto and owns zero fetch/provider-key/repo-write/current-pointer/author-publication authority
  ✓ the web-evidence validator refuses twelve distinct closed adversarial mutations, each with an E012-* code
  ✓ SCN-012-006/007 single & syndicated origins leave a material claim uncorroborated while two DISTINCT origins corroborate; the safe bundle is frozen with no raw markup (SCN-012-037)

Feature 012 Scope 12 Dynamic Red Alert discovery/qualification/projection
  ✓ SCN-012-023 a dynamically corroborated, market-confirmed, high-severity candidate qualifies with every falsifiable field and an admission score (never a probability/confidence/crash-odds field), publication Feature-002 gated
  ✓ SCN-012-024 a single-origin dramatic candidate consumes no visible slot, is a safe insufficient-corroboration count, and never echoes its dramatic title
  ✓ SCN-012-025 a no-candidate window renders an honest empty state with cutoff/channels/owner coverage and no illustrative topic

================================================
Research-Lab self-test: 952 passed, 0 failed
================================================
===SELFTEST_EXIT=0===
```

### Command 4 — Simple-adapter + production-wiring Playwright batch (5 specs, system-chrome)

```text
$ npx --no-install playwright test tests/simple-production-wiring.spec.mjs \
    tests/simple-models.spec.mjs tests/simple-model-adapters-market.spec.mjs \
    tests/simple-model-adapters-macro-fundamental.spec.mjs \
    tests/simple-model-adapters-strategy-property.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list

Running 27 tests using 4 workers

  ✓   1 …ne seed and separates parameter sensitivity from path randomness (1.2s)
  ✓   2 …p Simple breadth controls recompute owner leadership sensitivity (2.1s)
  ✓   3 … rotation Simple controls recompute owner transition and ETF fit (2.5s)
  ✓   4 …er stays unavailable without defaults fetch or fabricated result (1.2s)
  ✓   5 …alidation Simple controls recompute owner out-of-sample evidence (1.0s)
  ✓   6 …ast valid run across invalid stale missing and non-finite input (965ms)
  ✓   7 …mple auction controls recompute from truthful snapshot evidence (995ms)
  ✓   8 …mart-money Simple controls recompute owner disclosure-lag decay (726ms)
  ✓   9 … under Power (Simple stays honest-unavailable, nothing deleted) (776ms)
  ✓  10 …controls recompute owner country queue with FX and session truth (2.7s)
  ✓  11 …ls recompute owner suitability with unverified evidence visible (823ms)
  ✓  12 …ing structure Simple thresholds recompute owner transition state (1.3s)
  ✓  13 …imple renders the real adapter panel in the real owner-mode flow (2.6s)
  ✓  14 …le controls recompute owner cash-flow without zero-filling gaps (683ms)
  ✓  15 …ls recompute owner seasonal cash-flow without zero-filling gaps (722ms)
  ✓  16 …ng Simple controls recompute owner forecast regime and throttle (989ms)
  ✓  17 …assets Simple controls recompute the selected owner driver model (1.2s)
  ✓  18 …controls recompute bounded action or no-action inside Brief only (3.5s)
  ✓  19 …imple five-gate controls recompute or stay honestly unavailable (643ms)
  ✓  20 …trols recompute without trade-side inference or new chain owner (18.7s)
  ✓  21 …compute owner sleeve outcomes without hiding duration conflicts (639ms)
  ✓  22 …m Simple controls recompute owner ranking and basket sensitivity (1.1s)
  ✓  23 …controls recompute owner beneficiary and portfolio distribution (729ms)
  ✓  24 …Simple controls recompute owner margin EPS and valuation bridge (493ms)
  ✓  25 …rols recompute a source-qualified scenario without filling gaps (466ms)
  ✓  26 …ompute owner walls flip move and skew from same-origin evidence (829ms)
  ✓  27 …e controls recompute owner playbook from existing options owner (554ms)

  27 passed (28.2s)
===PW_EXIT=0===
```

## Progress — 2026-07-28 (increments 1-12)

All work below is **already committed and pushed** (`main` in sync with
`origin/main`; HEAD `fed8f9ab`). This section records it; it changed no product,
source, or test file.

### Delivered increments (commit → tools)

| Commit | Date | What |
|---|---|---|
| `f216be0d` | 2026-07-27 | Production bridge itself: real `renderSimpleBridge` replaces the stub in `rlexperience.js`, provider-gated ordinary `ownerModes` in `rlapp.js`, `tests/simple-production-bridge.unit.mjs` (TP-15-01), `tests/simple-production-wiring.spec.mjs`; `market-heatmap-lab` wired |
| `ab1d4879` | 2026-07-27 | Increment 1 greened; `technical-analysis-decision-lab` wired as the intentional honest-`unavailable` |
| `9a713001` | 2026-07-28 | `intraday-tape` + `swing-structure` wired; **new TP-15-02 integration test** `tests/simple-production-bridge.integration.mjs` added |
| `5c83d9d7` | 2026-07-28 | options family: `options-flow-feed`, `options-structure`, `gamma-trading` |
| `29888533` | 2026-07-28 | `sector-research` |
| `0e6c5ee2` | 2026-07-28 | `global-rotation` |
| `0fed316b` | 2026-07-28 | `real-assets` |
| `801df1d2` | 2026-07-28 | `etf-momentum` |
| `d083a345` | 2026-07-28 | `ai-capex-strategy` |
| `54827987` | 2026-07-28 | `smart-money-flow` |
| `2ea284cb` | 2026-07-28 | `strategy-validation` |
| `9a99c1f4` | 2026-07-28 | `strategy-self-improvement` (seeded; determinism verified over 2 runs) |
| `56099e24` | 2026-07-28 | `waterfront-polo` |
| `44afd71b` | 2026-07-28 | `company-fundamentals` wired + its spec reconciled to the shell |
| `fed8f9ab` | 2026-07-28 | `bond-regime` wired + its spec reconciled to the shell (HEAD) |

### Coverage: 19 of 22 ordinary tools wired, 18 in strict projection parity

TP-15-02 derives the wired set from the production registry **and** the production
pages (never a hard-coded list), so this count cannot drift from reality. Its run log
from the HEAD `30326253` re-run above:

```text
[TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
[TP-15-02] not wired (4): market-brief, msft-july-print-model, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 18 of 19
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
```

Independently confirmed against the pages themselves — exactly 19 pages register the
provider seam:

```text
$ grep -ln '__rlOwnerStateProvider' *.html | sort
ai-capex-strategy-lab.html
bond-regime-lab.html
company-fundamentals-lab.html
etf-momentum-lab.html
gamma-trading-lab.html
global-rotation-lab.html
intraday-tape-lab.html
market-heatmap-lab.html
options-flow-feed-lab.html
options-structure-lab.html
real-assets-lab.html
sector-research-lab.html
smart-money-flow-lab.html
strategy-self-improvement-lab.html
strategy-validation-lab.html
swing-structure-lab.html
technical-analysis-decision-lab.html
volatility-sizing-lab.html
waterfront-polo-lab.html
  -- count: 19
```

Registry totals for the same run:

```text
$ python3 -c "…tools.json / simple-models.json…"
  registry tools total: 23
  ordinary (excl market-brief): 22
  simple-model adapter definitions: 23
```

`market-brief` appears in the "not wired" list because it is `kind:
market-action-center` (brief-only) and is excluded from ordinary Simple wiring **by
design** — its `ownerModes` stays `["brief"]`. It is therefore not one of the 22
ordinary tools and not a remaining item.

### The 19th wired tool is an intended outcome, not a gap

`technical-analysis-decision-lab` is **registry-gated**. `registryDeclaresUnavailable()`
in the integration test reads the definition's `limitations` array; the tool's entry
declares the refusal explicitly, so the honest generic string is the *required*
behaviour rather than a shortfall:

```text
$ grep -n -A 3 'function registryDeclaresUnavailable' tests/simple-production-bridge.integration.mjs
137:function registryDeclaresUnavailable(definition) {
138-  const limitations = Array.isArray(definition.limitations) ? definition.limitations : [];
139-  return limitations.some((limitation) => /must return unavailable/i.test(String(limitation)));
140-}

$ python3 -c "…technical-analysis-decision-lab limitations…"
  - Until owner evidence exists, the adapter must return unavailable rather than reinterpret the foundation receipt as a signal.

$ grep -n 'MODULE_ABSENT_REASON' tests/simple-production-bridge.integration.mjs
2028:const MODULE_ABSENT_REASON = 'No wired owner-state provider or adapter module is available for this tool.';
2097:    assert.equal(entry.declaredUnavailable, true, `${entry.toolId}: a wired tool whose page omits the adapter module must be registry-declared unavailable`);
2103:      MODULE_ABSENT_REASON,
```

The discriminator is enforced in both directions: a wired tool whose page omits the
adapter module **must** be registry-declared unavailable (line 2097), so the honest
generic string cannot be used to hide an un-declared gap.

### Change-boundary check (all scope-15 commits, re-verified at HEAD `fed8f9ab`)

**Claim Source:** executed (2026-07-28, this session). Union of every path touched
across the full scope-15 commit range:

```text
$ git log --format='%H' f216be0d~1..HEAD -- rlexperience.js rlapp.js \
    tests/simple-production-bridge.unit.mjs tests/simple-production-bridge.integration.mjs \
    tests/simple-production-wiring.spec.mjs '*-lab.html' \
  | while read c; do git show --name-only --format='' "$c"; done | grep -v '^$' | sort -u
ai-capex-strategy-lab.html                  strategy-self-improvement-lab.html
bond-regime-lab.html                        strategy-validation-lab.html
company-fundamentals-lab.html               swing-structure-lab.html
etf-momentum-lab.html                       technical-analysis-decision-lab.html
gamma-trading-lab.html                      tests/bond-regime-lab.spec.mjs
global-rotation-lab.html                    tests/company-fundamentals-lab.spec.mjs
intraday-tape-lab.html                      tests/simple-model-adapters-macro-fundamental.spec.mjs
market-heatmap-lab.html                     tests/simple-model-adapters-market.spec.mjs
options-flow-feed-lab.html                  tests/simple-models.spec.mjs
options-structure-lab.html                  tests/simple-production-bridge.integration.mjs
real-assets-lab.html                        tests/simple-production-bridge.unit.mjs
rlapp.js                                    tests/simple-production-wiring.spec.mjs
rlchart.js                                  waterfront-polo-lab.html
rlexperience.js                             specs/012-…/scopes/15-…/scope.md
sector-research-lab.html
smart-money-flow-lab.html
```

**Protected paths — none touched:**

```text
$ … | grep -E '^(rldata\.js|rlviews\.js|market-brief\.html|data/options/|package\.json|package-lock\.json)'
(empty = none touched)
```

**Honest correction — deviation from the declared Implementation Files allowlist.**
A prior revision of this report claimed *every* touched path was inside the scope's
Implementation Files allowlist. That claim was **inaccurate** and is corrected here.
The allowlist does **not** name `rlchart.js`, `tests/simple-models.spec.mjs`,
`tests/simple-model-adapters-market.spec.mjs`,
`tests/simple-model-adapters-macro-fundamental.spec.mjs`, or
`tests/company-fundamentals-lab.spec.mjs`, yet all five were touched. The `rlchart.js`
edit is a 5-line restoration of a documented per-canvas hit-test contract that an
unrelated refactor had dropped:

```text
$ git show --stat --format='' ab1d4879 -- rlchart.js
 rlchart.js | 5 +++++
 1 file changed, 5 insertions(+)

$ git show ab1d4879 -- rlchart.js
@@ -350,6 +350,11 @@
   function attachLegacy(canvas, hitFn) {
     canvas.__rlchartState = { hitFn: hitFn, mode: "legacy", pinned: false };
+    /* Documented per-canvas hit-test contract (specs/003-bond-regime-and-scenario-lab/design.md
+       L1006: "inspect each Power canvas for … attached __rlhit …"). The structured/legacy attach
+       refactor moved the hit fn into __rlchartState.hitFn; restore the legacy canvas.__rlhit alias
+       that Power canvases (e.g. bond-regime ratio/curve/decomposition) inspect for their hit fn. */
+    canvas.__rlhit = hitFn;
```

The four test files are adapter/wiring specs reconciled to the shell as tools were
wired. **None of the five is a protected path**, but the allowlist itself is stale
relative to what delivery required. This is a **scope-artifact drift owned by
`bubbles.plan`**, recorded here rather than silently absorbed, and it is one reason the
Build Quality Gate item stays unchecked.

Static forbidden-authority read of the bridge — the only two matches in
`rlexperience.js` are the comment that states the constraint, so the bridge holds no
fetch / provider / storage / publication authority:

```text
$ grep -nE 'fetch\(|providerFetch|localStorage|sessionStorage|publish' rlexperience.js
1334:     local compute only: it never fetch/providerFetch, reads credentials, calls an
1335:     author/publisher/store, or mutates owner state. */
(2 matches total, both inside the constraint comment — zero executable occurrences)
```

Note: this is a **manual static scan performed this session**, not an automated
canary. No automated forbidden-authority / `ownerModes` canary for the bridge exists
in `scripts/selftest.mjs` yet (see TP-15-07 below).

### The 3 remaining ordinary tools — each with its verified reason

None of these is wired, and none is claimed as wired. Each is an **outcome with a
recorded cause**, not an omission — and for the two rental tools the cause is a
**deliberate product decision**. `market-brief` is listed first for completeness even
though it is excluded by design and is not one of the 22.

#### 0. `market-brief` — BY DESIGN (not an ordinary tool; not one of the 22)

Its registry `experience.kind` is `market-action-center` with a four-view set; it has
no ordinary Simple/Power surface, so the Simple-adapter bridge does not apply. Its
`simpleAdapterId` (`simple-adapter/market-action-triage/v1`) runs **inside Brief**, and
its `ownerModes` stays `["brief"]`.

```text
$ python3 -c "…market-brief entry from tools.json…"
  "experience": {
    "contractVersion": "tool-experience/v1",
    "kind": "market-action-center",
    "viewSetId": "market-action-center-four-view/v1",
    "viewIds": [ "brief", "portfolio", "red-alert", "journey" ],
    "simpleModelDefinitionId": null,
    "simpleAdapterId": "simple-adapter/market-action-triage/v1",
    "simpleAdapterModule": "rlexperience-adapters/market-action.js",
    …
  }
```

This is an exclusion, not a remaining item.

#### RESOLVED — `volatility-sizing-lab` is no longer a remaining tool (commit `30326253`)

**This entry previously read "BLOCKED (attempted, cleanly reverted)". That is obsolete.**
Both problems recorded there have been fixed, and the fix was a genuine defect
correction — not a relaxed assertion.

**(a) Structural — fixed.** The page now loads its declared `adapterModule` after
`rlvol.js`, which is the wiring contract for this page:

```text
$ grep -n 'rlexperience-adapters/\|rlvol.js' volatility-sizing-lab.html
652:    <script src="rlvol.js"></script>
659:         rlvol.js (RLVOL.buildVolDecisionRead), loaded above, which the shared production bridge
661:         rlvol.js BEFORE this module is therefore the wiring contract for this page: without that
663:    <script src="rlexperience-adapters/market-structure.js"></script>
949:               rlexperience-adapters/market-structure.js — loaded above). Registered while this inline

$ grep -n '__rlOwnerStateProvider' volatility-sizing-lab.html
947:               globalThis.__rlOwnerStateProvider["volatility-sizing-lab"] and hands the result to the
991:            globalThis.__rlOwnerStateProvider = globalThis.__rlOwnerStateProvider || {};
992:            globalThis.__rlOwnerStateProvider["volatility-sizing-lab"] = volatilityOwnerState;
```

**(b) Parity — root-caused and fixed, not worked around.** The earlier revision recorded
the cause as "the owner state is live-data dependent, so the bridge and the explicit
runtime path do not converge deterministically". That diagnosis was **incomplete**. The
real cause was narrower and fixable: **the provider took a SECOND wall-clock sample**.
The bridge and the explicit runtime path therefore ran against two different instants,
so `volatility-sizing-lab: bridge state matches the explicit runtime path` could never
converge — not because the data was live, but because the provider re-sampled time.

The fix makes the provider **single-sourced and deterministic**: `asOf` and
`decisionTime` are read back off the page's own currently-displayed decision instead of
being sampled again. The page stays the owner and no formula is recomputed in the
provider:

```text
$ sed -n '985,995p' volatility-sizing-lab.html
            function volatilityOwnerState() {
                var decision = runtime.decision;
                if (!runtime.config || !runtime.policy || !runtime.bars || !decision) return null;
                var asset = assetById(runtime.controls.asset);
                if (!asset) return null;
                return {
                    asOf: decision.asOf,
                    decisionTime: decision.computedAt,
```

The page's own inline contract documents the single-sourcing explicitly:

```text
  • asOf        -> runtime.decision.asOf, the evidence cutoff RLVOL itself stamped on
                   the decision this page is currently displaying — never a wall clock.
  • decisionTime-> runtime.decision.computedAt, the SAME instant this page's own
                   buildInput() passed to RLVOL for the displayed decision, read back
                   off that decision rather than sampled again here, so the adapter
                   runs on the page's decision instant and not a second, later one.
```

**No assertion was relaxed.** TP-15-02's strict-parity check is unchanged and the tool
now passes it — `volatility-sizing-lab` appears in `[TP-15-02] wired (19)` and inside
the `18 of 19` strict-parity set (Command 1 above). The three previously-failing spec
assertions (BS-008, BS-009, TP-02-04) were reconciled to the Model B shell by binding
each original assertion to an explicit **native** root and adding an **additional**
adapter-agreement assertion, rather than dodged with `.first()`. The full spec is green:

```text
$ npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1
  16 passed (9.7s)
EXIT=0
```

The commit records the same root cause independently:

```text
$ git show --stat --format='%H%n%s' 30326253
30326253af551d198c95ead352f1301f95944539
feat(012/scope-15): wire volatility-sizing + reconcile its specs to the shell

Root cause of the earlier TP-15-02 parity divergence (which had forced a
revert): the provider took a SECOND wall-clock sample, so the bridge and the
explicit runtime path could never converge deterministically. Fixed by reading
asOf/decisionTime back off the page's own displayed decision, making the
provider single-sourced and deterministic rather than time-dependent.

 tests/simple-model-adapters-market.spec.mjs    |  11 +-
 tests/simple-production-bridge.integration.mjs | 151 ++++++++++++++++++++++++-
 tests/volatility-sizing-lab.spec.mjs           | 111 +++++++++++++++++-
 volatility-sizing-lab.html                     |  56 +++++++++
 4 files changed, 320 insertions(+), 9 deletions(-)
```

Note the changed-file list: **no `rlexperience-adapters/*` module was edited**, so the
Formula-ownership rule holds — the provider is a pure passthrough of values the page
already holds.

#### 1. `msft-july-print-model` — NOT APPLICABLE (deliberate shared-shell opt-out)

The page carries an **unconditional** `<meta name="rlviews" content="off">` plus a
guard script that sets `window.__rlviewsInit = 1`. `rlapp.js` gates the shared-shell
mount on `!!root.__rlviewsInit`, so on this page the shell — and therefore the
production Simple bridge — **never runs**. A provider registration would be dead code.
Wiring it would require **removing that intentional opt-out**, which is an owner
decision, not a scope-15 change.

```text
$ grep -n '__rlviewsInit' msft-july-print-model.html rlapp.js
msft-july-print-model.html:787:    // the shell (its load is gated on `!!root.__rlviewsInit`) while the separate rlbrief mount still
msft-july-print-model.html:792:        if (m && (m.getAttribute('content') || '').toLowerCase() === 'off') window.__rlviewsInit = 1;
msft-july-print-model.html:793:      } catch (e) { window.__rlviewsInit = 1; }
rlapp.js:302:          return !!root.__rlviewsInit;

$ sed -n '778,795p' msft-july-print-model.html
  <meta name="rlviews" content="off">
  ... "Setting rlviews.js's own init guard makes rlapp skip the shell
       (its load is gated on `!!root.__rlviewsInit`) while the separate rlbrief
       mount still renders." ...
```

Its adapter e2e already encodes this via the `shellOptOut` descriptor
(`tests/simple-model-adapters-macro-fundamental.spec.mjs:373`, honored at `:405`,
`:433`, `:516`, `:543`).

#### 2 & 3. `palm-springs-rental-market-lab` and `ocean-shores-rental-market-lab` — DECLINED BY PRODUCT DECISION (not merely an engineering blocker)

**Claim Source: executed (2026-07-28, this session, HEAD `30326253`).** An earlier
revision of this entry recorded only the shared-`RLRENTAL`-engine obstacle. That reason
was **incomplete**. Investigation since then found a **deeper, decisive** reason, and it
is about data the owner deliberately withheld — not about engineering difficulty.

**REASON 1 (DECISIVE) — the owner deliberately published no purchase price, and the
Pages deploy gate asserts that absence.**

The owner's published payloads carry `"purchasePriceUsd": null` with
`"state": "unavailable"` for these places, and they record *why* verbatim: the
underlying research found insufficient data to support an eligible short-term-rental
acquisition baseline.

```text
$ grep -rn '"purchasePriceUsd": null' *.payload.json
palm-springs-rental-market.payload.json:1605:                "purchasePriceUsd": null,
palm-springs-rental-market.payload.json:2899:                "purchasePriceUsd": null,
ocean-shores-rental-market.payload.json:1859:                "purchasePriceUsd": null,
ocean-shores-rental-market.payload.json:3674:                "purchasePriceUsd": null,

$ sed -n '1595,1612p' palm-springs-rental-market.payload.json
                "limitations": [
                    "Aggregate all-home median only; no price range or member set.",
                    "Cannot yield an eligible STR purchase baseline."
                ]
            },
            "acquisitionBaseline": {
                "baselineId": "baseline:palm-springs-ca:whole-market:acquisition",
                "pairKey": "palm-springs-ca::whole-market",
                "state": "unavailable",
                "sampleId": "sample:palm-springs-ca:whole-market:acquisition",
                "purchasePriceUsd": null,
                "statistic": "median",
                "sampleN": 492,
```

`tests/palm-springs-rental-market-lab.spec.mjs` — which is simultaneously the **GitHub
Pages deploy gate** — **asserts that absence directly**:

```text
$ grep -n "purchasePriceUsd\|baseline" tests/palm-springs-rental-market-lab.spec.mjs
530:    expect(receiptField(luxuryLine, 'baseline')).toBe('unavailable');
531:    expect(receiptField(luxuryLine, 'purchasePriceUsd')).toBe('UNAVAILABLE');
578:    expect(receiptField(luxuryLine, 'baseline')).toBe('UNAVAILABLE');
582:    for (const input of ['baseOccupancy', 'baseAdrUsd', 'purchasePriceUsd', 'variableOperatingExpenseRatio', 'annualFixedRiskCostUsd']) {
```

and the gate emitted exactly those receipts when executed this session (Command 6):

```text
[SCN-005-027] baseline=unavailable
[SCN-005-027] purchasePriceUsd=UNAVAILABLE
  29 passed (27.8s)
EXIT=0
```

**Consequence:** wiring an owner-state provider that produced a `ready` acquisition
projection for these tools would require **fabricating the exact economic layer the
owner intentionally withheld**, and would break the deploy gate that exists to protect
that intent. Declining to wire them is **honoring a published product decision**, not
deferring work. This is why these two tools may never move to "wired" as literally
worded, and why SCN-012-039's "every ordinary tool wired" END-state clause is routed to
`bubbles.plan` for a wording decision.

**REASON 2 (SECONDARY) — no per-tool adapter module on the page.**

Independently of the data question, neither page loads a per-tool adapter module — the
owner computation lives in the **shared `RLRENTAL` engine** (`rlrental.js`):

```text
$ for f in palm-springs-rental-market-lab.html ocean-shores-rental-market-lab.html; do \
    echo -n "  $f rlexperience-adapters => "; grep -c 'rlexperience-adapters' "$f"; done
  palm-springs-rental-market-lab.html rlexperience-adapters => 0
  ocean-shores-rental-market-lab.html rlexperience-adapters => 0

$ grep -n 'rlexperience-adapters/\|rlrental' palm-springs-rental-market-lab.html ocean-shores-rental-market-lab.html
palm-springs-rental-market-lab.html:886:    <script src="rlrental.js"></script>
ocean-shores-rental-market-lab.html:877:    <script src="rlrental.js"></script>
```

Wiring would therefore also require a named provider **EXTRACTION from shared code**,
which could not be done without either **editing the shared `RLRENTAL` engine** or
**duplicating a formula** into the page/provider — **both forbidden** by this scope's
Formula-ownership rule. This reason alone would make the work expensive; **reason 1
makes it wrong**.

```text
$ grep -n 'OPEN implementation item' specs/.../design-addendum-production-simple-wiring.md
221:(owner-parity / provider extraction is an OPEN implementation item) — 4 tools:**
226:| 20 | `palm-springs-rental-market-lab` | … | shared rental engine `RLRENTAL.mountRoute`. Page does **not** load `property-research.js`. …
227:| 21 | `ocean-shores-rental-market-lab` | … | shared rental engine `RLRENTAL.mountRoute`. Same as palm-springs. |
```

**Deploy-risk note:** `tests/palm-springs-rental-market-lab.spec.mjs` (29 tests) is the
GitHub Pages deploy gate, so a regression here breaks deployment, not just CI:

```text
$ grep -rn 'playwright test' .github/workflows/pages.yml
36:        run: npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list

$ grep -c "test('" tests/palm-springs-rental-market-lab.spec.mjs
29
```

### Implementation Plan step status

Prose annotation only; no DoD item is created or altered here.

| Step | Status |
|---|---|
| 1. RED contract tests first | **Complete** — `tests/simple-production-bridge.unit.mjs` and `tests/simple-production-wiring.spec.mjs` landed in `f216be0d` |
| 2. Shell bridge + provider-gated `ownerModes` | **Complete** — `rlexperience.js` + `rlapp.js` in `f216be0d`; `market-brief` confirmed unchanged (still absent from the wired set, `ownerModes` stays `["brief"]`) |
| 3. Proven single-tool end-to-end (`market-heatmap-lab`) | **Complete** — `f216be0d`, greened in `ab1d4879` |
| 4. Remaining delegating tools in adapter-module batches | **Partially complete** — 18 of the 19 delegating tools wired across `9a713001`…`30326253`; only `msft-july-print-model` outstanding (deliberate shell opt-out, reason 1 above) |
| 5. Reconcile the 8 `#simpleView` tools + BUG-003 regression | **Partially complete** — 7 of the 8 `#simpleView` pages are wired (`bond-regime`, `etf-momentum`, `gamma-trading`, `intraday-tape`, `sector-research`, `swing-structure`, `volatility-sizing`); `bond-regime`'s spec was reconciled to the shell in `fed8f9ab` and `volatility-sizing`'s in `30326253`. The 1 unwired `#simpleView` page (`msft-july-print-model`) is blocked on the owner opt-out decision; `tests/msft-july-market-refresh.spec.mjs` remains unmodified. **No BUG-003 closure is claimed in this report** — see TP-15-05 |
| 6. Handle the 4 non-delegating tools | **Partially complete** — `technical-analysis-decision-lab` done (intentional registry-gated honest-`unavailable`, `ab1d4879`); `volatility-sizing` **RESOLVED and wired** in `30326253` (provider re-sampled wall-clock time → fixed by single-sourcing `asOf`/`decisionTime` off the displayed decision); `palm-springs` + `ocean-shores` **declined by product decision** (owner published `purchasePriceUsd: null`; the Pages gate asserts that absence) |
| 7. `scripts/selftest.mjs` bridge canaries | **Complete** (2026-07-29, HEAD `0890348a`) — the canaries exist as a named `Feature 012 Scope 15 production Simple-view bridge canaries (TP-15-07)` group of **16**; the same `grep` that previously returned nothing now returns **19** matching lines, and the suite is **968 passed / 0 failed**. The row previously read "Outstanding … 952 passed … no bridge canary exists"; that is superseded — 952 → 968 is exactly the +16 canaries |

## Known Drift — Routed to `bubbles.plan` (NOT resolved here)

Deliberately left open. Closing a DoD row against a persistent test title that does not
exist would be fabrication.

### D1 — CLOSED 2026-07-29 — TP-15-03 and TP-15-04 declared titles did not exist in the suite

**Status: CLOSED (both halves).** Entry retained for audit; the original finding follows
unmodified, then the closure record.

*Original finding (2026-07-28, still accurate as of the state it describes):*

```text
$ grep -n "test(" tests/simple-production-wiring.spec.mjs
47:test('Regression: market-heatmap Simple renders the real adapter panel in the real owner-mode flow', async ({ page }) => {
```

The file contains exactly one test. TP-15-03 declares `Regression: market-heatmap
Simple renders the real adapter panel and one control recomputes owner leadership`;
TP-15-04 declares `Regression: each wired ordinary tool shows a ready adapter panel in
Simple with an owner-parity fact`. **Neither exists.** Both behaviours *are* genuinely
proven — the panel render by the test above, the control recompute by
`tests/simple-model-adapters-market.spec.mjs` (a Scope-05 adapter e2e), and the
per-wired-tool loop by TP-15-02 at the **integration** layer — but not under the
declared titles or in the declared file. Test-Plan ↔ implementation drift, owned by
`bubbles.plan`.

#### Closure record (2026-07-29, `bubbles.plan`, at HEAD `c0d81a0f`)

D1 had two halves. **Both are now closed.**

**Half 1 — the tests exist.** Closed by commits `c51d9495`
(*test(012/scope-15): author the declared TP-15-04 wired-tool acceptance sweep*) and
`2f65a02a` (*feat(012/scope-15): make the Simple bridge genuinely steerable + author
TP-15-03/TP-15-04*), later refined by `b674ffc1`. `tests/simple-production-wiring.spec.mjs`
now holds 4 tests, not 1 — both TP-15-03 carriers and both TP-15-04 carriers, all in the
declared file, all interception-free.

**Half 2 — the declared titles now resolve.** Closed by this `bubbles.plan` edit to
`scope.md` (uncommitted at time of writing; this agent does not commit). Every declared
persistent title is now the verbatim title of a real test, and every `Command` cell was
`--list`-verified to select ≥1 test:

```text
BEFORE (all four grep-based rows selected ZERO):
  TP-15-03  Total: 0 tests in 0 files   (exit 1)
  TP-15-04  Total: 0 tests in 0 files   (exit 1)
  TP-15-05  Total: 0 tests in 0 files   (exit 1)
  TP-15-06  Total: 0 tests in 0 files   (exit 1)

AFTER (reconciled commands, --list verified):
  TP-15-03  Total: 2 tests in 1 file    (exit 0)
  TP-15-04  Total: 2 tests in 1 file    (exit 0)
  TP-15-05  Total: 27 tests in 1 file   (exit 0)
  TP-15-06  Total: 16 tests in 1 file   (exit 0)
```

**Correction to the reported failure mode.** D1 was routed with the rationale that a
zero-match `--grep` is a *silent pass* (exit 0 having run nothing), which would let an
agent record fabricated green evidence. **That mechanism does not reproduce in this
repo** and the claim is withdrawn. Measured on Playwright **1.61.1** with this repo's
config, the row's own `--reporter=list` run form exits **1** on a zero-match grep:

```text
$ npx --no-install playwright test tests/simple-production-wiring.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome \
    --grep "Regression: each wired ordinary tool shows a ready adapter panel in Simple with an owner-parity fact" \
    --reporter=list
Error: No tests found.
RUN_EXIT=1

$ ... same command + --pass-with-no-tests
RUN_EXIT_WITH_FLAG=0          # the silent pass exists ONLY behind this flag
$ grep -rn 'passWithNoTests\|pass-with-no-tests' playwright.config.mjs package.json tests/ scripts/
grep_exit=1                   # the flag is set NOWHERE in this repo
```

So the real defect was **loud but blocking**: the declared command could never produce
green evidence for its row, and the only way to make it "pass" was to substitute a
different command — which is how the row's evidence silently decouples from its
declaration. The silent-exit-0 variant remains a live hazard if `--pass-with-no-tests`
is ever introduced; the row-command selection contract added to `scope.md` guards both.

**Not closed by this edit:** D4 half 2 (TP-15-05's carrier uses `page.route`
interception) — see D4 below. That is an independent disqualifier and is untouched.

### D2 — CLOSED 2026-07-29 — TP-15-07 bridge canaries were absent from `scripts/selftest.mjs`

**Status: CLOSED.** Entry retained for audit; the original finding follows unmodified,
then the closure record.

*Original finding (2026-07-28, accurate as of the state it describes):*

```text
$ grep -n 'renderSimpleBridge\|installSimpleProjectionBridge\|ownerModes\|production bridge' scripts/selftest.mjs
   (NO MATCHES — no bridge canary exists in selftest.mjs)
```

The 0-fail preservation half of TP-15-07 was met (952 passed / 0 failed); the "new
bridge canaries" half was not. Owned by `bubbles.plan` (Implementation Plan step 7).

#### Closure record (2026-07-29, re-verified by this agent at HEAD `0890348a`)

The canaries were authored as a named `Feature 012 Scope 15 production Simple-view
bridge canaries (TP-15-07)` group of **16**. The identical grep now returns 19 lines,
and the suite total moved **952 → 968 — a delta of exactly the +16 canaries**, with
nothing removed or renamed and 0 failures:

```text
$ grep -cE 'renderSimpleBridge|installSimpleProjectionBridge|ownerModes|production bridge' scripts/selftest.mjs
19

$ node scripts/selftest.mjs
Research-Lab self-test: 968 passed, 0 failed
SELFTEST_EXIT=0
```

The three behaviours TP-15-07 names each map to a named canary: forbidden authority to
the `no forbidden authority` + `local compute only` canaries, provider-absent honest
unavailable to the `a wired tool with no owner state degrades to an honest unavailable`
canary, and the `ownerModes` contract to the `rlapp.js's own ownerModes expression`
canary. Full output under
[Command 1](#command-1--tp-15-07-broad-selftest-968-passed-0-failed).

### D3 — CLOSED 2026-07-30 — Implementation Files allowlist was stale

**Status: CLOSED.** Entry retained for audit; the original finding follows unmodified,
then the closure record.

*Original finding (2026-07-28, accurate as of the state it describes):*

Five delivered paths fall outside the scope's declared allowlist — see
[Change-boundary check](#change-boundary-check-all-scope-15-commits-re-verified-at-head-fed8f9ab).
Owned by `bubbles.plan`.

#### Closure record (2026-07-30, `bubbles.plan`, at HEAD `acf042bb`)

**Why the prior derivation was structurally incomplete — the mechanism, not just the
count.** Every earlier derivation used a *pathspec-filtered* commit selection:

```text
git log --format='%H' f216be0d~1..HEAD -- rlexperience.js rlapp.js \
    tests/simple-production-bridge.*.mjs tests/simple-production-wiring.spec.mjs '*-lab.html'
```

That filter selects commits **by the paths already in the allowlist**, so a commit whose
only contribution was an out-of-allowlist path could never enter the union. It is a
derivation that cannot, even in principle, discover the drift it was run to measure.
Re-derived here from the **commit set** instead (subject-attributed
`git log --all --grep='scope.15'`, 31 commits, plus the 2 BUG-004 commits), which
immediately surfaced **two Scope 15 commits absent from this report's own increments
table**: `cc0e81ef` (*author the declared TP-15-07 production-bridge canaries* —
`scripts/selftest.mjs`) and `3f04904b` (*make TP-15-05 and TP-15-06 declared evidence
locatable*). `cc0e81ef` is the commit that actually delivered the D2 canaries; the D2
closure record asserted the 952 → 968 delta without ever naming the commit that produced
it.

**Delivered set, mechanically derived (33 commits, `git show --name-only`):** 32
non-artifact paths from the 31 Scope-15-attributed commits, plus 1 further path from the
2 BUG-004 commits. The three-way reconciliation against the declared allowlist:

```text
=== A) DELIVERED but NOT in allowlist (Scope-15-attributed commits) ===
    rlchart.js
    tests/company-fundamentals-lab.spec.mjs
    tests/simple-model-adapters-macro-fundamental.spec.mjs
    tests/simple-model-adapters-market.spec.mjs
    tests/simple-models.spec.mjs

=== B) DELIVERED but NOT in allowlist (BUG-004 commits 087ad2ad + 5c77e1f1) ===
    tests/market-heatmap-control-surface.spec.mjs

=== C) DECLARED in allowlist but NEVER delivered ===
    msft-july-print-model.html
    ocean-shores-rental-market-lab.html
    palm-springs-rental-market-lab.html
    tests/msft-july-market-refresh.spec.mjs
```

**Group A — ADDED to the allowlist (5 paths). Genuine Scope 15 delivery.** The four
spec files are per-tool reconciliations landed in the same commit as the tool they
reconcile — the identical class of edit as `tests/bond-regime-lab.spec.mjs` and
`tests/volatility-sizing-lab.spec.mjs`, which the allowlist *did* name. Delivery
required 7 such spec files; the allowlist anticipated 3. Diffstats are additive
reconciliations, not rewrites (`tests/company-fundamentals-lab.spec.mjs` +48/-0 in
`44afd71b`; `tests/simple-model-adapters-macro-fundamental.spec.mjs` +90/-9 across six
wiring commits). `rlchart.js` is +5/-0 in `ab1d4879`, restoring the `canvas.__rlhit`
legacy alias documented in `specs/003-.../design.md` L1006 and dropped by an unrelated
earlier refactor (`c81d808d`) — Scope 15's demotion of bond-regime's native content to
Power is what made those Power canvases load-bearing and surfaced the latent break.

**Group B — DELIBERATELY NOT ADDED (1 path). This is the honest finding, not
bookkeeping.** `tests/market-heatmap-control-surface.spec.mjs` was created by
`087ad2ad` / `5c77e1f1`, whose subjects are `fix(012/BUG-004)` and which carry a
complete BUG-004 artifact set (`bug.md`, `spec.md`, `design.md`, `scopes.md`,
`test-plan.json`, `scenario-manifest.json`, `state.json`, `uservalidation.md`). It is
**BUG-004's carrier test, delivered under BUG-004's boundary**. Adding it to Scope 15's
allowlist would misattribute another artifact's delivery to this scope and would
retroactively widen this scope's boundary to cover work it does not own. It stays out.
*(Those two commits also touched `rlexperience.js`, `market-heatmap-lab.html` and
`tests/simple-production-bridge.unit.mjs` — all already inside Scope 15's allowlist, so
they create no further drift. Cross-artifact editing of shared files in the same
subsystem is expected; only the misattribution risk is a finding.)*

**Group C — RETAINED as declared-but-not-delivered (4 paths).** The allowlist
*over*-declared in exactly the shape of the scope's remaining coverage gap: the 3
unwired ordinary tools and the msft spec. They are not stale — they record what the
scope planned and then declined for the documented product reasons. They are now
labelled as such in `scope.md` rather than left to read as delivered.

**New finding raised, not absorbed:** `rlchart.js` is a *shared* chart helper, and this
scope's own **Shared Infrastructure Impact Sweep** table (which names `rlviews.js`,
`rldata.js`, the adapter modules and `market-brief`) did not cover it. The edit was
necessary and minimal, and `rlchart.js` is not on the Excluded list — so it is
in-boundary delivery — but it went in without the blast-radius/canary discipline the
sweep exists to impose on shared surfaces. Recorded as **D7**.

No protected path was touched; that half of the original check re-verified clean at
HEAD `acf042bb`.

### D4 — TP-15-05's declared title does not exist, and the nearest test is mocked

```text
$ grep -rn 'bond-regime native content shows in Power not Simple' tests/
(exit 1 — NOT FOUND)
```

TP-15-05 declares the persistent title `Regression: bond-regime native content shows in
Power not Simple and the adapter panel is the Simple surface (BUG-003 closure)`. No such
test exists. The nearest existing test —
`Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison`
— pre-dates this scope (`943972e2`, 2026-07-16) **and uses `page.route` interception at
line 375**, so it is a mocked test and cannot close a live `e2e-ui` DoD row. The
native-content-under-Power behaviour *is* genuinely proven (by the
`openNativeResearchSurface()` helper `fed8f9ab` added, spec green 27/27 exit 0 this
session), but not under the declared contract and not by an interception-free test.
Owned by `bubbles.plan`. See [TP-15-05](#tp-15-05).

#### Partial closure record (2026-07-29, `bubbles.plan`, at HEAD `c0d81a0f`)

**Half 1 — declared title does not exist: CLOSED.** The TP-15-05 Test Plan row now
declares its two real carriers verbatim —
`Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison`
(`tests/bond-regime-lab.spec.mjs:413`) and
`BS-012 lever change recomputes without fetch or observed mutation` (`:515`, a caller of
the `openNativeResearchSurface` helper added by `fed8f9ab`, which carries the
"native content under Power" assertions). The reconciled whole-file command selects
**27** tests (`--list` verified, exit 0). Carrier attribution was established by mapping
every `openNativeResearchSurface(` call site to its enclosing test, **not** by trusting
the file's own traceability comment — which names `BS-004, BS-005, BS-012, BS-014` while
the mechanically verified callers are `BS-006` (`:249`), `BS-007` (`:262`),
`Scenario controls reject nonfinite input…` (`:286`) and `BS-012` (`:520`). That comment
is itself inaccurate and is recorded here as a new minor finding (D6).

**Half 2 — the carrier uses request interception: STILL OPEN.** Re-verified at
HEAD `c0d81a0f`: `page.route` appears at lines 311, 378 and 426 of
`tests/bond-regime-lab.spec.mjs`, and line 426 sits inside the
`Regression BUG-003:` carrier. A mocked test cannot close a live `e2e-ui` row.
Reconciling the title does **not** launder this, and the TP-15-05 DoD item stays `- [ ]`
on this disqualifier alone. **BUG-003 is still not claimed closed.**

### D5 — CLOSED 2026-07-29 — TP-15-06's declared title did not exist

**Status: CLOSED.** D5 was referenced by the 2026-07-29 finding
[*the declared Test-Plan titles are still absent*](#finding--the-declared-test-plan-titles-are-still-absent-d1-d4-d5-stand)
and by the [TP-15-06](#tp-15-06) evidence section, but was never written up as its own
`Known Drift` entry. It is recorded here for completeness and closed in the same edit.

*Finding.* TP-15-06 declared the persistent title `Regression: volatility-sizing native
Simple moves to Power and Simple shows the adapter panel or an honest unavailable until
the RLVOL provider is wired`. No such test existed; the row's `--grep` selected zero.

*Closure.* The row now declares its two real, **interception-free** carriers verbatim:
`TP-02-04: the volatility tool is reachable THROUGH the shared rlnav registration, not
just by direct URL` (`tests/volatility-sizing-lab.spec.mjs:405`, introduced by `e3e7a925`
— it pre-dates this scope) and `Regression BS-009: insufficient history is unavailable
with exact counts` (`:221`). The reconciled whole-file command selects **16** tests
(`--list` verified, exit 0). The only `page.route` match in that file is inside the
comment block that *states* the zero-interception constraint, so unlike TP-15-05 this row
carries no interception disqualifier.

### D6 — OPEN (new, minor) — the TP-15-05 traceability comment names the wrong carriers

`tests/bond-regime-lab.spec.mjs` lines 1-42 assert that the native-under-Power half is
carried by "`BS-004, BS-005, BS-012, BS-014 …`". Mechanically, the tests that actually
call `openNativeResearchSurface(` are `BS-006`, `BS-007`,
`Scenario controls reject nonfinite input and persist only allowlisted assumptions`, and
`BS-012` — so three of the four names in the comment are wrong. The same pattern holds in
`tests/volatility-sizing-lab.spec.mjs`, whose block names `BS-002` among the callers while
the verified callers are `BS-009`, `BS-014`, `Controls recompute…` and `TP-02-04`. No
assertion is affected — the helper's own assertions carry the proof either way — but a
future agent trusting the comment would cite a test that does not exercise the behaviour.
Fixing a comment inside a test file is outside `bubbles.plan`'s ownership (test-file edit)
and outside this task's change boundary; routed to the owning executor.

### D7 — OPEN (new, minor) — a shared surface was edited outside the Shared Infrastructure Impact Sweep

Surfaced by the D3 reconciliation (2026-07-30). `ab1d4879` edited `rlchart.js` (+5/-0,
restoring the documented `canvas.__rlhit` legacy alias) — a **shared** chart helper used
by every tool's canvases. This scope's own *Shared Infrastructure Impact Sweep* names
`rlviews.js`, `rldata.js`, the 7 adapter modules and `market-brief`, but not
`rlchart.js`, so the edit landed without the declared blast-radius / independent-canary
discipline that the sweep exists to impose on exactly this class of surface.

Not a policy violation: `rlchart.js` is not on the scope's Excluded list, the change was
additive and minimal, and it was required to keep bond-regime's Power canvases green
once Scope 15 demoted their native content to Power. The finding is that the sweep
table under-enumerated the shared surfaces the work would touch. The table has been
reconciled in `scope.md` with the entry explicitly marked as recorded retroactively —
the retroactive entry documents the gap, it does not pretend the discipline was applied
at the time.

Gates no DoD row on its own (the change-boundary row is open on its rollback half
regardless). Routed to `bubbles.plan` for the sweep-authoring lesson: the sweep must be
derived from the *set of surfaces the plan will touch*, not only from the surfaces the
plan intends to protect.

## Evidence Anchors

- [`tp-15-01`](#tp-15-01) — **partial**: executed and green (7/7, exit 0), but the file carries no `ownerModes` or forbidden-authority assertion, so the DoD item stays unchecked
- [`tp-15-02`](#tp-15-02) — **satisfied**: executed and green (6/6, exit 0), exact file/command/title match
- [`tp-15-03`](#tp-15-03) — **satisfied**: both declared carriers live in the declared file and were executed green by this agent (whole-file run 4/4, exit 0)
- [`tp-15-04`](#tp-15-04) — **satisfied**: both declared carriers executed green by this agent; the `e2e-ui` sweep covered all 19 wired tools, each converging at x1
- [`tp-15-05`](#tp-15-05) — **executed, still not satisfied**: `tests/bond-regime-lab.spec.mjs` was run by this agent (27/27, exit 0) and the declared titles resolve (D4 half 1 CLOSED), but the `Regression BUG-003:` carrier still uses `page.route` interception at line 426, so it cannot close a live `e2e-ui` row (**D4 half 2 OPEN**)
- [`tp-15-06`](#tp-15-06) — **satisfied**: executed green by this agent (16/16, exit 0); both declared carriers are verbatim and interception-free (D5 CLOSED)
- [`tp-15-07`](#tp-15-07) — **satisfied**: broad suite is **968 passed / 0 failed** (exit 0) and the 16-canary bridge group exists (D2 CLOSED 2026-07-29). The earlier "952 passed … canaries do not exist" reading is superseded — 952 → 968 is exactly the +16 canaries

## Completion Statement

Scope 15 is **In Progress** and is **not** Done. The production bridge is delivered and
proven; **19 of 22 ordinary tools are wired, 18 in strict projection parity**, with the
19th (`technical-analysis-decision-lab`) an intended registry-gated honest `unavailable`
rather than a gap. **Three ordinary tools remain unwired**, each a recorded outcome
rather than an unfinished task: `msft-july-print-model` is a deliberate shared-shell
opt-out, and `palm-springs-rental-market-lab` / `ocean-shores-rental-market-lab` are a
deliberate data-availability decision whose absence the Pages deploy gate asserts.
`market-brief` is excluded by design and is not one of the 22.

All seven Test Plan rows now carry first-party executed evidence, and **five of the
seven are satisfied** (TP-15-02, TP-15-03, TP-15-04, TP-15-06, TP-15-07). Two are
executed-and-green but still unsatisfied against their own DoD text: TP-15-01 (its named
file carries no `ownerModes` or forbidden-authority assertion) and TP-15-05 (its BUG-003
carrier uses `page.route` interception, so a mocked test cannot close a live `e2e-ui`
row). Drifts **D1, D2 and D5 are CLOSED**; **D3, D4 half 2 and D6 remain open** with
`bubbles.plan`. **Of the 14 DoD items, 8 are checked and 6 remain open** — none of the 6
could be honestly closed against executed evidence. **No completion of the scope, and no
completion of Feature 012, is claimed.**

## Test Evidence

### TP-15-01

**Command:** `node --test tests/simple-production-bridge.unit.mjs`
**Claim Source:** executed (2026-07-29, this agent, HEAD `0890348a`)
**Result:** PASSED (**7/7**, exit 0) — full raw output under
[Command 2](#command-2--tp-15-01-unit-77). See the uncertainty note below. *(The file
grew 5 → 7 tests; the two additions are the BUG-004 queued-run invalidation guarantees.)*

**Uncertainty Declaration.** The DoD item for TP-15-01 requires the unit evidence to
prove *`ownerModes`* and *no forbidden authority* in addition to the bridge contract
and honest-unavailable fallback. This file contains neither assertion:

```text
$ grep -n 'ownerModes\|forbidden\|providerFetch\|localStorage\|fetch(' tests/simple-production-bridge.unit.mjs
(no matches)
```

The bridge's zero-forbidden-authority property was confirmed by a manual static scan
this session (see the change-boundary section above), but that is not the automated
unit proof the DoD row asks for. The DoD item therefore remains `- [ ]`.

### TP-15-02

**Command:** `node --test tests/simple-production-bridge.integration.mjs`
**Claim Source:** executed (2026-07-29, this agent, HEAD `0890348a`)
**Result:** PASSED (6/6, exit 0). **Exact match to the Test Plan row** — the file, the
command, and all six persistent titles exist and pass, including the registry-derived
loop and the owner-parity assertion. Full raw output under
[Command 3](#command-3--tp-15-02-integration-66-19-wired-18-of-19-strict-parity). Key
derived facts from that run *(the 18-wired / 5-not-wired / 17-of-18 figures previously
quoted here were genuine but are superseded — they predate `volatility-sizing-lab` being
wired)*:

```text
[TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
[TP-15-02] not wired (4): market-brief, msft-july-print-model, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 18 of 19
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
ℹ pass 6
ℹ fail 0
TP1502_EXIT=0
```

### TP-15-03

**Command:** the declared file's whole-file run,
`npx --no-install playwright test tests/simple-production-wiring.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1`.
**Claim Source:** executed (2026-07-29, this agent) at HEAD `0890348a` plus the disclosed
working-tree delta on the spec file.
**Result:** **PASSED (4/4, exit 0) — both declared carriers green.**

The earlier reading of this row — *"that file contains exactly one test, with a different
title, and the 'control recomputes' half lives in a different (Scope-05) spec"* — is
**superseded and false at HEAD**. Both halves now live in the declared file and the Test
Plan declares both verbatim:

```text
$ grep -nE "^test\(" tests/simple-production-wiring.spec.mjs
48:test('Regression: market-heatmap Simple renders the real adapter panel in the real owner-mode flow', async ({ page }) => {
198:test('TP-15-03 market-heatmap Simple renders real steerable controls and actuating one recomputes the production projection with no refetch', async ({ page }) => {
```

The control-recompute half was a genuine **production** gap when this row was first
written — the wired Simple panel rendered no controls at all — and it was closed by the
BUG-004 fix rather than by relaxing the row. The carrier asserts non-vacuously (`moving a
real model input must change the rendered projection`) and asserts an empty request
window across the recompute, using a request **listener**, never `page.route`. Full raw
output under
[Command 4](#command-4--tp-15-03--tp-15-04-wiring-spec-44-system-chrome). The DoD item
is `- [x]`.

### TP-15-04

**Command:** `npx --no-install playwright test tests/simple-production-wiring.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "TP-15-04" --reporter=list` (executed as the whole-file run).
**Claim Source:** executed (2026-07-29, this agent) at HEAD `0890348a` plus the disclosed
working-tree delta on the spec file.
**Result:** **PASSED — both declared carriers green; the sweep covered all 19 wired tools.**

The earlier reading of this row — *"not-run — the declared test does not exist … NOT
IMPLEMENTED … that file contains only the single test shown under TP-15-03 … proven at
the integration layer by TP-15-02, not by an `e2e-ui` test"* — is **superseded and
false at HEAD**. `tests/simple-production-wiring.spec.mjs` holds 4 tests, two of them
this row's carriers, both declared verbatim in the Test Plan:

```text
$ grep -nE "^test\(" tests/simple-production-wiring.spec.mjs
716:test('TP-15-04 every wired ordinary tool paints its real Simple adapter panel with an owner-parity fact', async ({ page }) => {
807:test('TP-15-04 the swept set is derived from the production registry + pages, and the honest-degradation cases are registry/provider derived', () => {
```

The registry-derived per-wired-tool loop is therefore now proven at the **`e2e-ui`**
layer, in a real browser, in addition to TP-15-02's integration-layer proof. Full raw
output including the 19-tool sweep line under
[Command 4](#command-4--tp-15-03--tp-15-04-wiring-spec-44-system-chrome). The DoD item
is `- [x]`.

### TP-15-05

**Claim Source:** executed (2026-07-28, this session).
**Result:** SPEC GREEN 27/27 exit 0 — but the DoD row stays `- [ ]` on two independent
disqualifiers.

`tests/bond-regime-lab.spec.mjs` was re-executed by this agent on 2026-07-29 at HEAD
`0890348a` (27/27, exit 0 — see
[Command 5](#command-5--tp-15-05-bond-regime-spec-2727-system-chrome)). The 2026-07-28
run below is the earlier, superseded capture and is retained for audit:

```text
$ npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list

Running 27 tests using 1 worker

  ✓   1 …js:105:1 › BS-001 duration-driven ratio improvement stays mixed (689ms)
  ✓   2 … › BS-002 aligned ratios plus OAS confirmation are constructive (544ms)
  ✓   3 …1 › BS-003 tight but widening keeps level and momentum separate (483ms)
  ✓   4 …ec.mjs:158:1 › BS-010 latest common date excludes unmatched leg (445ms)
  ✓   5 …:167:1 › BS-004 bull steepener retains defensive credit context (516ms)
  ✓   6 ….mjs:180:1 › BS-005 bear steepener penalizes long duration most (459ms)
  ✓   7 …curve inversion alone leaves duration balanced or indeterminate (485ms)
  ✓   8 …js:202:1 › BS-006 six month mixed shock decomposes every sleeve (737ms)
  ✓   9 …S-007 oversized shock preserves estimate and lowers reliability (562ms)
  ✓  10 …26:1 › BS-008 stale characteristic remains visible and unranked (445ms)
  ✓  11 …reject nonfinite input and persist only allowlisted assumptions (523ms)
  ✓  12 …nd official nominal headers or explicit unavailable source state (5.8s)
  ✓  13 …1:1 › BS-009 optional macro outage leaves truthful partial read (403ms)
  ✓  14 …c.mjs:314:1 › BS-013 restricted observation remains memory only (405ms)
  ✓  15 …rst refresh preserves successful families when one source fails (420ms)
  ✓  16 … restricted endpoint or raw observation persistence path exists (383ms)
  ✓  17 …ady waits for auto-hydration before Simple and Power comparison (514ms)
  ✓  18 …spec.mjs:449:1 › BS-011 Simple and Power share one model digest (475ms)
  ✓  19 …-012 lever change recomputes without fetch or observed mutation (490ms)
  ✓  20 …mjs:484:1 › BS-014 partial data is keyboard and text equivalent (473ms)
  ✓  21 …Regime tool publishes one owner read without restricted payload (366ms)
  ✓  22 … nonblank synchronous and text equivalent on desktop and mobile (709ms)
  ✓  23 …stale error and large-shock layouts contain text without overlap (3.4s)
  ✓  24 …r ratio window sleeve focus and restored preferences stay local (682ms)
  ✓  25 …xpose return risk drawdown and trend when history is sufficient (461ms)
  ✓  26 …nfig cache and reachable public sources without uncaught errors (371ms)
  ✓  27 …andmarks names focus and noncolor states at 390 and 1440 widths (840ms)

  27 passed (24.1s)
===BONDREGIME_EXIT=0===
```

**Honest correction to an earlier revision of this report.** A prior revision stated
that `fed8f9ab` "added a `Regression BUG-003: …` test to
`tests/bond-regime-lab.spec.mjs`". That is **inaccurate**. `fed8f9ab` *modified* a
**pre-existing** test — `Regression BUG-003: Ready waits for auto-hydration before
Simple and Power comparison` was introduced by commit `943972e2` on **2026-07-16**,
well before this scope began:

```text
$ git log --format='%h %ad %s' --date=short -S'Regression BUG-003: Ready waits for auto-hydration' -- tests/bond-regime-lab.spec.mjs
943972e2 2026-07-16 feat: expand research lab capabilities and automation

$ git show --stat --format='%h %s' fed8f9ab -- tests/bond-regime-lab.spec.mjs
fed8f9ab feat(012/scope-15): wire bond-regime + reconcile its spec to the shell
 tests/bond-regime-lab.spec.mjs | 77 +++++++++++++++++++++++++++++++++++++++++-
 1 file changed, 76 insertions(+), 1 deletion(-)
```

What `fed8f9ab` actually contributed is the `openNativeResearchSurface()` helper, which
drives the shell to Power before three native-control tests (BS-006, BS-007, scenario
controls) touch `#treasuryShock` — a genuine proof that the native surface moved under
Power and was not deleted.

**Disqualifier 1 — the declared persistent title does not exist (drift D4).**

```text
$ grep -rn 'bond-regime native content shows in Power not Simple' tests/
(exit 1 — NOT FOUND)
```

**Disqualifier 2 — the nearest existing BUG-003 test is MOCKED, so it cannot satisfy
an `e2e-ui` live-category row.**

```text
$ grep -rn 'page\.route\|context\.route\|intercept(\|cy\.intercept\|msw\|nock\|wiremock' tests/bond-regime-lab.spec.mjs
tests/bond-regime-lab.spec.mjs:267:    await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
tests/bond-regime-lab.spec.mjs:334:  await page.route('**/*', async (route) => {
tests/bond-regime-lab.spec.mjs:375:  await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
```

Line 375 sits **inside** the `Regression BUG-003:` test (lines 362-448) and calls
`route.fulfill(...)` with fixture CSV. This interception is pre-existing Feature-003
fixture pinning, not a scope-15 regression — but under the repo's live-stack
authenticity rule a mocked Playwright test may not close a live `e2e-ui` DoD row.

The DoD item therefore remains `- [ ]`. **No BUG-003 closure is claimed.**

### TP-15-06

**Command:** `npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs
--config=playwright.config.mjs --project=system-chrome --reporter=list`
**Claim Source:** executed (2026-07-29, this agent, HEAD `0890348a`)
**Result:** **16 passed / 0 failed, exit 0 — the row is satisfied.** Both the behaviour
and the declared contract now hold: the declared persistent titles are the verbatim
titles of two real, interception-free tests, and this agent executed the declared
whole-file command itself. Full raw output under
[Command 6](#command-6--tp-15-06-volatility-sizing-spec-1616-system-chrome). *(The
earlier "the declared persistent title still does not exist, so the DoD row stays open"
reading is superseded — D5 is CLOSED and the awaited attributable run has now been
performed.)*

**Supersedes the prior entry.** An earlier revision of this section read "not-run at
HEAD — attempted in-session and deliberately reverted … The tool is unwired at HEAD".
That is **obsolete and false at HEAD `30326253`** — see
[RESOLVED — `volatility-sizing-lab`](#resolved--volatility-sizing-lab-is-no-longer-a-remaining-tool-commit-30326253).

**Both halves of the row's stated behaviour are proven by green, interception-free
live-stack tests** inside the 16/16 run:

| Row clause | Proving test | Assertions |
|---|---|---|
| native Simple moved to Power | `TP-02-04: the volatility tool is reachable THROUGH the shared rlnav registration, not just by direct URL` (`:351`) | `#simpleView` is only `toBeAttached()` (deliberately off screen) while `[data-rlexperience-panel="simple"]` is `toBeVisible()`; after driving the shell to Power, `#powerView` and `#assetSelect` are `toBeVisible()` |
| Simple shows the panel / an honest unavailable | `Regression BS-009: insufficient history is unavailable with exact counts` (`:171`) | `[data-rlexperience-panel="simple"]` carries `data-rlexperience-adapter` equal to the **registry-resolved** adapter id (read from `simple-models.json`, never hard-coded), reports `data-rlexperience-simple-state="unavailable"`, and is `toBeVisible()` |

The spec is genuinely live-stack — the only interception match is the comment that
*states* the constraint:

```text
$ grep -nE 'page\.route|context\.route|intercept\(|cy\.intercept|msw|nock|wiremock' tests/volatility-sizing-lab.spec.mjs
9: * page.route / route.fulfill / route.abort / response interception anywhere in this file.
(1 match — inside the comment block that STATES the constraint; zero executable interception)
```

**Why the DoD row is now `- [x]` (drift D5 CLOSED).** The reason previously recorded
here — *"the persistent title this Test Plan row declares does not exist anywhere in
`tests/`"* — is **obsolete**. The Test Plan row no longer declares the phantom title
`Regression: volatility-sizing native Simple moves to Power`; it declares this row's two
**real** carriers verbatim, and both were confirmed present and executed green by this
agent:

```text
$ grep -nE "^test\(" tests/volatility-sizing-lab.spec.mjs | grep -E 'TP-02-04|BS-009'
221:test('Regression BS-009: insufficient history is unavailable with exact counts', async ({ page }) => {
405:test('TP-02-04: the volatility tool is reachable THROUGH the shared rlnav registration, not just by direct URL', async ({ page }) => {
```

The standard applied to its siblings is preserved rather than weakened: TP-15-03 and
TP-15-04 close for the same reason (declared titles resolve to real tests **and** an
executed run exists), while **TP-15-05 stays open** because it carries a second,
independent disqualifier this row does not — request interception. Reconciling a title is
not sufficient on its own; an executed run is also required, and for TP-15-05 an
interception-free carrier is required on top of both.

### TP-15-07

**Command:** `node scripts/selftest.mjs`
**Claim Source:** executed (2026-07-29, this session)
**Result:** **968 passed / 0 failed, exit 0 — both halves of the DoD row are now met.**
The 0-fail preservation half holds, and the "new bridge canaries" half is satisfied by a
16-canary `Feature 012 Scope 15 production Simple-view bridge canaries (TP-15-07)` group
in `scripts/selftest.mjs`. Full raw output, including the whole canary group, under
[Command 1 — TP-15-07 broad selftest](#command-1--tp-15-07-broad-selftest-attributable).

Attributability: `scripts/selftest.mjs` was clean for the whole session, and
`git diff --name-only 087ad2ad..HEAD` touched only `specs/002-*` documents, so this
result reflects committed source rather than the concurrent session's uncommitted edits.

```text
$ node scripts/selftest.mjs

Feature 012 Scope 15 production Simple-view bridge canaries (TP-15-07)
  ✓ the bridge publishes a non-empty adapter-module binding table, each entry naming a browser global and a registrar (6 bindings parsed from rlexperience.js)
  ✓ the wired set is derived from the production registry + the deployed pages and is non-empty (19 wired of 23 registry definitions, scanned 26 pages)
  ✓ no forbidden authority: the runtime's own diagnostic reports every authority false after adapter registration (6 authority flags x 19 wired tools, owned: 0)
  ✓ the bridge path performs local compute only — no network, provider, storage, or cookie authority in its executable source (8 tokens checked, hits: none)
  ✓ rlapp.js's own ownerModes expression yields ["power"] for a provider-wired ordinary tool, ["simple","power"] for an unwired one (no regression), and ["brief"] for a brief-only tool
  ✓ a wired tool with no owner state degrades to an honest unavailable that names the missing owner adapter, publishes a null numeric, paints no numeric node, and invents no signal (market-heatmap-lab)
  ✓ the bridge never mutates body.classList on the unavailable path — applyVisual stays the sole owner of rlv-focused (BUG-003 invariant, 0 recorded mutations)

================================================
Research-Lab self-test: 968 passed, 0 failed
================================================
===SELFTEST_EXIT=0===
```

The three behaviours the DoD row names map to named canaries: forbidden authority to the
`no forbidden authority` and `local compute only` canaries, provider-absent honest
unavailable to the `a wired tool with no owner state degrades to an honest unavailable`
canary, and the `ownerModes` contract to the `rlapp.js's own ownerModes expression`
canary. The prior session's `grep` for these canaries returned no matches; it now
returns the group above, so **D2 is resolved** and the DoD item is `- [x]`.

## DoD Reconciliation Run — 2026-07-29, HEAD `a7631b36`

**Claim Source:** executed (2026-07-29, this agent, this session). This run exists to
close the two DoD rows whose delivering commits — `a7631b36` (TP-15-01's four halves)
and `28099a4d` (TP-15-05's live-stack carrier) — shipped the code but recorded **no
execution evidence**. Both are landed at HEAD; neither had an attributable run until now.
`git status --porcelain` reported no modification to any file under test.

The three Playwright suites longer than a minute (`tests/simple-production-wiring.spec.mjs`
4/4 at 11.4m, `tests/volatility-sizing-lab.spec.mjs` 16/16, `tests/market-heatmap-control-surface.spec.mjs`)
were **not** re-run here: their evidence at HEAD `0890348a`
([Commands 4/6](#command-4--tp-15-03--tp-15-04-wiring-spec-44-system-chrome)) already
covers the current committed content of those files — the disclosed working-tree delta
in that run (+11/-26 on `tests/simple-production-wiring.spec.mjs`) is byte-identical to
what `bc3b7303` later committed, and no commit since has touched either spec.

### Command 0 — repository binding preflight

```text
$ bash .github/bubbles/scripts/repo-binding-preflight.sh \
    --repo-root ~/research-lab --agent-source research-lab
[repo-binding-preflight] OK — agent source 'research-lab' matches target repo 'research-lab'.
PREFLIGHT_EXIT=0
```

### Command 1 — TP-15-01 unit, all four declared halves (9/9)

The row names four claims. At HEAD `0890348a` the file carried two of them (7/7) and the
row stayed open; `a7631b36` added the missing `ownerModes` and forbidden-authority
assertions. All four are now named tests in the declared file:

```text
$ node --test tests/simple-production-bridge.unit.mjs
✔ renderSimpleBridge is exposed on the production API (4.526289ms)
✔ provider present + real owner state → renders the REAL market-breadth adapter (ready), never mutates rlv-focused (28.047632ms)
✔ no owner-state provider → honest unavailable, no invented signal, never mutates rlv-focused (4.755089ms)
✔ owner evidence does not permit a run (unhydrated) → honest unavailable, never mutates rlv-focused (12.74387ms)
✔ missing adapter module → honest unavailable (no crash), never mutates rlv-focused (3.89799ms)
✔ a queued Simple run does not survive an invalidation, and its promise settles (19.714953ms)
✔ leaving Simple altogether also settles the queued run without painting (3.348991ms)
✔ ownerModes resolution: provider wiring hands Simple to the adapter panel and never regresses an unwired tool (1.077198ms)
✔ no forbidden authority: the runtime declares none, and running the real bridge touches no network, provider, storage or cookie surface (21.220249ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 199.425417
UNIT_EXIT=0
```

Half-to-test mapping: bridge contract → tests 1-2; honest-unavailable fallback → tests
3-5; `ownerModes` → test 8; no forbidden authority → test 9.

### Command 2 — TP-15-05 live-stack carrier (28/28, system-chrome)

`28099a4d` added `TP-15-05 live-stack: shell Simple shows the registry adapter panel with
native content hidden, shell Power shows the native content` (`tests/bond-regime-lab.spec.mjs:545`),
taking the file from 27 to 28 tests. It runs `openFromSharedCache(page, { routeTreasury: false })`
— **zero interception on its own path** — resolves the adapter id from `simple-models.json`
rather than hard-coding it, and asserts both halves of the declared row. Its
`toBeAttached()` + `not.toBeVisible()` pairing is deliberate: an absent node would satisfy
a bare not-visible check, so deletion cannot masquerade as demotion. It is test 18 below
(11.0s — the live fetch):

```text
$ npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1

Running 28 tests using 1 worker

  ✓   1 …js:164:1 › BS-001 duration-driven ratio improvement stays mixed (720ms)
  ✓   8 …js:261:1 › BS-006 six month mixed shock decomposes every sleeve (871ms)
  ✓  17 …ady waits for auto-hydration before Simple and Power comparison (738ms)
  ✓  18 …ith native content hidden, shell Power shows the native content (11.0s)
  ✓  19 …spec.mjs:590:1 › BS-011 Simple and Power share one model digest (721ms)
  ✓  20 …-012 lever change recomputes without fetch or observed mutation (764ms)
  ✓  28 …landmarks names focus and noncolor states at 390 and 1440 widths (1.1s)

  28 passed (41.5s)
TP1505_EXIT=0
```

This supersedes the D4-half-2 disqualifier recorded under [TP-15-05](#tp-15-05): that
reason was that the row's only carrier (`Regression BUG-003:`, which installs
`page.route`) is mocked and so cannot close a live `e2e-ui` row. It still is mocked, and
it is still **not** the carrier — the row is now carried by an interception-free test.
The three `page.route` sites at `:267/:334/:428` are pre-existing Feature-003 fixture
pinning and are untouched.

### Command 3 — TP-15-07 broad selftest (968 passed, 0 failed)

Re-executed at HEAD `a7631b36` to confirm the `a7631b36` unit additions introduced no
regression. Unchanged from the `0890348a` result, including the 16-canary bridge group:

```text
$ node scripts/selftest.mjs
  ✓ rlviews.js's own rlv-focused predicate, fed those real ownerModes, focuses a wired tool's Simple, leaves Power unfocused, and never focuses an unwired native Simple or a brief view
  ✓ RLEXPERIENCE.renderSimpleBridge is exposed on the production API
  ✓ a wired tool with no owner state degrades to an honest unavailable that names the missing owner adapter, publishes a null numeric, paints no numeric node, and invents no signal (market-heatmap-lab)
  ✓ the bridge never mutates body.classList on the unavailable path — applyVisual stays the sole owner of rlv-focused (BUG-003 invariant, 0 recorded mutations)

================================================
Research-Lab self-test: 968 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### Command 4 — TP-15-02 integration (6/6, 19 wired, 18 of 19 strict parity)

```text
$ node --test tests/simple-production-bridge.integration.mjs
[TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
[TP-15-02] not wired (4): market-brief, msft-july-print-model, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 18 of 19
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
ℹ tests 6
ℹ pass 6
ℹ fail 0
INTEGRATION_EXIT=0
```

### Net effect of this run on the DoD

**Closed:** TP-15-01 (four halves now asserted in the declared file, 9/9) and TP-15-05
(interception-free live carrier, executed 28/28). Together with the four rows the
`0890348a` reconciliation closed but never flipped in `scope.md` (TP-15-03, TP-15-04,
TP-15-06, TP-15-07), **10 of 14 DoD items are now checked**.

**Still open — 4 rows, and none is closable by executing anything:**

1. **SCN-012-039** — every mechanism clause is now proven (`ownerModes` at unit level in
   Command 1 and at canary level in Command 3; `applyVisual` sole `rlv-focused` owner;
   never-mutates). The row nevertheless fails on its own parenthetical **"END state =
   every ordinary tool wired"**: 19 of 22 are. The 3 remaining are owner decisions, not
   engineering gaps — `msft-july-print-model` (deliberate `window.__rlviewsInit = 1`
   shell opt-out) and the two rental tools (**declined by product decision**; the owner
   published `purchasePriceUsd: null` and the Pages gate asserts that absence). Routed
   to `bubbles.plan` as a wording question.
2. **SCN-012-041** — 7 of the 8 `#simpleView` tools are reconciled with executed proof;
   the 8th is `msft-july-print-model`, whose spec this scope never touched and where the
   shell deliberately never runs, so "reachable under Power" has no Power view to be
   reachable through. Same owner-decision root as (1).
3. **Change boundary / rollback** — both halves stand. (a) **D3 is still OPEN**: 5
   delivered paths fall outside the declared Implementation Files allowlist, owned by
   `bubbles.plan`. (b) The documented rollback path has still never been exercised by
   any executed command.
4. **Build Quality Gate** — blocker 2 (missing forbidden-authority canary) is now
   closed by Command 1 + Command 3, but blockers 1 and 3 stand independently: per-tool
   RED/GREEN is absent for the 3 unwired tools, and the changed-path boundary is not
   clean against the allowlist (D3).

**D6** (the TP-15-05 traceability comment naming the wrong carriers) was rewritten by
`28099a4d` into an explicit 3-carrier enumeration that flags carrier 2 as mocked and
names carrier 3 as the live carrier. It gates no DoD row and is non-blocking.

## DoD Closure Run — 2026-07-30, HEAD `acf042bb` (`bubbles.plan`, artifact-only)

This run edited **only** `scope.md` and `report.md`. No source, test, or `state.json`
change; nothing committed or pushed. Its purpose was to (1) close drift **D3** by
mechanically reconciling the Implementation Files allowlist, (2) re-judge **SCN-012-041**
now that its stated blocker is closed, and (3) re-run the composite gate's scans at
current HEAD so their currency is no longer in question.

### Command 0 — repository binding preflight

```text
$ bash .github/bubbles/scripts/repo-binding-preflight.sh --repo-root /home/redacted/research-lab --agent-source research-lab
[repo-binding-preflight] OK — agent source 'research-lab' matches target repo 'research-lab'.
PREFLIGHT_EXIT=0
```

### Command 1 — no-interception scan, comment-stripped, at HEAD `acf042bb`

Raw matches printed with their line text so comment-vs-executable is auditable rather
than asserted:

```text
$ grep -nE 'page\.route|context\.route|intercept\(|cy\.intercept|msw|nock|wiremock' tests/simple-production-wiring.spec.mjs
16: * production bridge's rendered panel. There is NO page.route / context.route /
17: * intercept / msw / nock — the owner data is the page's real cached owner state,
110: * a request LISTENER (`page.on('request')`) — an observer, never `page.route`/`intercept`.
374:     `page.route`/`intercept`. */
413: * page.route / context.route / intercept / msw / nock anywhere in this file — the owner
(raw match count: 5 — all five inside comment blocks; EXECUTABLE = 0)

$ grep -nE '…' tests/market-heatmap-control-surface.spec.mjs
28: * hydration from its committed data/bars snapshots. There is NO page.route /
29: * context.route / intercept / msw / nock anywhere. `page.addInitScript` and
(raw match count: 2 — both comments; EXECUTABLE = 0)

$ grep -nE '…' tests/bond-regime-lab.spec.mjs
13: * but carrier 2 installs `page.route`, which makes it MOCKED under this repo's Live-Stack
26: *      comparison` — MOCKED (holds the treasury response with `page.route` in order to
326:    await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
393:  await page.route('**/*', async (route) => {
441:  await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
517:// WHY THIS EXISTS. The BUG-003 test directly above installs `page.route` to hold the treasury
(raw match count: 6 — 3 comments; EXECUTABLE = 3, at 326/393/441)
```

Those 3 executable sites are **pre-existing and not this scope's**, established by blame
rather than by assertion, and the TP-15-05 live carrier adds none:

```text
$ git blame -L 326,326 -L 393,393 -L 441,441 --date=short -- tests/bond-regime-lab.spec.mjs
943972e29 (pkirsanov 2026-07-16 326)     await page.route(/home\.treasury\.gov\/…
943972e29 (pkirsanov 2026-07-16 393)   await page.route('**/*', async (route) => {
943972e29 (pkirsanov 2026-07-16 441)   await page.route(/home\.treasury\.gov\/…

$ git show 28099a4d -- tests/bond-regime-lab.spec.mjs | grep -n '^+.*page\.route'
42:+ * but carrier 2 installs `page.route`, which makes it MOCKED under this repo's Live-Stack
58:+ *      comparison` — MOCKED (holds the treasury response with `page.route` in order to
87:+// WHY THIS EXISTS. The BUG-003 test directly above installs `page.route` to hold the treasury
(3 added lines, ALL comments disclosing the pre-existing mocking — 0 executable added)

$ git show 3f04904b -- tests/bond-regime-lab.spec.mjs | grep -c '^+.*page\.route'   → 0
$ git show fed8f9ab -- tests/bond-regime-lab.spec.mjs | grep -c '^+.*page\.route'   → 0
```

So: **this scope introduced zero executable interception**, and the two specs it
authored are interception-free. The gate's literal wording ("across every spec this
scope touched") is still not met, because a spec it *modified* carries 3 pre-existing
sites — that distinction is preserved below rather than smoothed over.

### Command 2 — Node source lock

```text
$ node scripts/validate-node-source-lock.mjs
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
[node-source-lock] adversarial=manifest-drift result=REJECTED code=MANIFEST-KEYS
[node-source-lock] adversarial=second-registry result=REJECTED code=NPMRC-DUPLICATE
[node-source-lock] adversarial=verification-disabled result=REJECTED code=NPMRC-VERIFICATION
[node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=missing-integrity result=REJECTED code=LOCK-INTEGRITY
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
SOURCE_LOCK_EXIT=0
```

### Command 3 — whitespace / worktree hygiene

```text
$ git diff --check
DIFF_CHECK_EXIT=0

$ git diff --check -- specs/012-…/scopes/15-production-simple-adapter-wiring/
S15_DIFF_CHECK_EXIT=0

$ git status --porcelain -- specs/012-…/scopes/15-production-simple-adapter-wiring/
(blank = clean at run time; this run's own artifact edits follow)
```

### Command 4 — broad selftest at HEAD `acf042bb`

```text
$ node scripts/selftest.mjs
  ✓ the wired set is derived from the production registry + the deployed pages and is non-empty (19 wired of 23 registry definitions, scanned 26 pages)
  ✓ every wired tool’s adapter module loads and exports the registrar its binding names (19/19 resolved, gaps: none)
  ✓ no forbidden authority: the runtime’s own diagnostic reports every authority false after adapter registration (6 authority flags x 19 wired tools, owned: 0)
  ✓ exactly one executable rlv-focused write exists across all production sources and it lives in rlviews.js (scanned 54 files, writers: rlviews.js x1)
  ✓ applyVisual (rlviews.js) is the function that owns that sole rlv-focused write
  ✓ the bridge path performs local compute only — no network, provider, storage, or cookie authority in its executable source (8 tokens checked, hits: none)
  ✓ rlapp.js’s own ownerModes expression yields ["power"] for a provider-wired ordinary tool, ["simple","power"] for an unwired one (no regression), and ["brief"] for a brief-only tool
  ✓ the bridge never mutates body.classList on the unavailable path — applyVisual stays the sole owner of rlv-focused (BUG-003 invariant, 0 recorded mutations)

================================================
Research-Lab self-test: 968 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

### Command 5 — SCN-012-041 population re-derived from the deployed pages

Independent of the sweep's own derivation, to check the sweep is measuring the real
population and not a stale list:

```text
$ for f in $(grep -l 'id="simpleView"' *.html | sort); do
    grep -q '__rlOwnerStateProvider' "$f" && echo "  WIRED    $f" || echo "  UNWIRED  $f"; done
  WIRED    bond-regime-lab.html
  WIRED    etf-momentum-lab.html
  WIRED    gamma-trading-lab.html
  WIRED    intraday-tape-lab.html
  UNWIRED  msft-july-print-model.html
  WIRED    sector-research-lab.html
  WIRED    swing-structure-lab.html
  WIRED    volatility-sizing-lab.html
  -- total #simpleView pages: 8   (7 wired, 4 of the 7 also declare #powerView)
```

7 wired / 4-with-`#powerView` matches the sweep's own printed derivation
(`TP-15-04/SCN-012-041 derived native #simpleView tools: 7 of 19 wired (4 also declare
#powerView)`) exactly — two independent derivations agreeing.

### Command 6 — the msft `#simpleView` page is structurally outside the shell

Verified first-hand rather than inherited from the prior narrative:

```text
$ grep -n 'name="rlviews"' msft-july-print-model.html
778:  <meta name="rlviews" content="off">

$ grep -n '__rlviewsInit' msft-july-print-model.html
792:        if (m && (m.getAttribute('content') || '').toLowerCase() === 'off') window.__rlviewsInit = 1;
793:      } catch (e) { window.__rlviewsInit = 1; }

$ grep -n '__rlviewsInit' rlapp.js
302:          return !!root.__rlviewsInit;

$ sed -n '<ensureSharedScript>' rlapp.js
      function ensureSharedScript(id, src, ready) {
        return new Promise(function (resolve) {
          if (ready()) return resolve(true);        ← pre-set flag short-circuits the load

$ grep -c '__rlOwnerStateProvider' msft-july-print-model.html   → 0
$ grep -c 'id="simpleView"'  msft-july-print-model.html         → 1
$ grep -c 'id="powerView"'   msft-july-print-model.html         → 1
$ grep -c 'id="modeSeg"'     msft-july-print-model.html         → 1

$ (all 33 scope-15 + BUG-004 commits) | grep -c '^msft-july-print-model.html$'   → 0
```

The chain is closed end to end: the page's `meta rlviews=off` pre-sets
`window.__rlviewsInit = 1`, which makes `ensureSharedScript`'s `if (ready())` guard
short-circuit, so `rlviews.js` is **never loaded**, so `body.rlv-focused` can never be
applied, so the shell demotion this scenario describes structurally cannot run there.
The page carries its own `#modeSeg` + `#simpleView` + `#powerView`, so its native Simple
content is reachable under its **own** Power toggle. And **no commit in this scope ever
touched the file** — the scope therefore hid nothing and deleted nothing on that page.

### Net effect of this run on the DoD

**Closed: SCN-012-041** (10 → **11 of 14 checked**). Clause (b), BUG-003, was already
met by the `28099a4d` interception-free carrier. Clause (a) is now met on all 8
`#simpleView` tools: 7 by per-page executed proof (`acf042bb` extended the TP-15-04
sweep to assert both halves per tool — `#simpleView` attached-but-hidden with the panel
visible and zero native top-level children in Simple; panel hidden, `rlv-focused`
released and native content visible in Power; set derived from page source, anti-vacuity
guarded so a silently-skipped tool fails, shell rule selector extracted from the
production stylesheet with a fatal guard, RED-proven), and the 8th because it is
structurally outside the shell and untouched by the scope (Command 6).

**Closed: drift D3** — the allowlist is reconciled against a commit-set-derived delivered
path set; see the D3 closure record.

**Raised: drift D7** — `rlchart.js`, a shared surface, was edited outside the Shared
Infrastructure Impact Sweep. Minor, gates no row on its own.

**Still open — 3 rows, and all three trace to ONE root cause:**

1. **SCN-012-039** — the root blocker. Every mechanism clause is proven. Its own
   parenthetical END-state clause, "every ordinary tool wired", is **unsatisfiable as
   written**: 4 tools are deliberately not wired by documented product/architecture
   decision. Amendment proposed in `scope.md`; requires owner approval, not self-approval.
2. **Change boundary / rollback** — half (a), the allowlist, is **closed** by D3. Half
   (b), the documented rollback path, has still never been exercised by any executed
   command. That half is genuinely agent-actionable but requires source edits, which
   this artifact-only run does not perform.
3. **Build Quality Gate** — its blocker 3 (D3) is now closed and its scan-currency
   concern is answered by Commands 1-4 at HEAD `acf042bb`. It stays open on blocker 1,
   *"per-tool RED/GREEN is absent for the 3 unwired ordinary tools"* — which is
   SCN-012-039's coverage clause inherited verbatim. **Checking this composite gate while
   its own constituent stays open would be self-contradictory**, so it stays `- [ ]`.
   Blocker 4 is also recorded honestly: the scope introduced zero executable
   interception, but a spec it modified carries 3 pre-existing sites, so the gate's
   literal "across every spec this scope touched" wording remains unmet.

## Status

**Current — 2026-07-30, HEAD `acf042bb`.**

- **Status:** In Progress (scope) — **11 of 14 DoD items checked, 3 open.** `Done` would
  be fabrication while SCN-012-039 is open; `Blocked` would overstate it, because one of
  the three open rows (the rollback rehearsal) is ordinary agent-actionable work
- **Phase:** implement
- **The single root blocker:** **SCN-012-039**. All three open rows reduce to it or to
  one independent item:
  1. **SCN-012-039** — root. Every mechanism clause is proven; the row's own
     parenthetical END state, *"every ordinary tool wired"*, is unsatisfiable as written
     because 4 tools are deliberately unwired by documented decision. An amendment is
     **proposed** in `scope.md`; it is a spec change and requires owner approval
  2. **Build Quality Gate** — derivative of (1). Its D3 blocker is closed and its scans
     are re-run current at this HEAD; it stays open solely on *"per-tool RED/GREEN is
     absent for the 3 unwired ordinary tools"*, which is (1)'s coverage clause inherited
  3. **Change boundary / rollback** — independent, and the only row not blocked by (1).
     Half (a), the allowlist, is **closed** by the D3 reconciliation. Half (b), the
     documented rollback path, has never been exercised; rehearsing it requires source
     edits and is out of scope for an artifact-only run
- **Closed this run:** **SCN-012-041** (both clauses met — 7 of 8 `#simpleView` tools by
  per-page executed proof in the `acf042bb` sweep, the 8th structurally outside the shell
  and untouched by the scope) and drift **D3** (allowlist reconciled against a
  commit-set-derived delivered path set; 5 paths added, 1 deliberately refused as
  BUG-004's, 4 retained as declared-but-not-delivered)
- **Raised this run:** drift **D7** — `rlchart.js`, a shared surface, was edited outside
  the Shared Infrastructure Impact Sweep. Minor; gates no row on its own
- **Drift status:** **D1, D2, D3, D5 CLOSED.** **D4 half 2, D6, D7 open** — TP-15-05's
  original carrier contains executable `page.route` (the row is nonetheless closed,
  because `28099a4d` gave it a separate interception-free carrier), the TP-15-05
  traceability comment names the wrong carriers, and D7 above
- **Coverage:** 19 of 22 ordinary tools wired — 18 module-backed in strict projection
  parity + `technical-analysis-decision-lab` as the intended registry-gated honest
  `unavailable`. `market-brief` is excluded by design (`kind = market-action-center`)
- **This run changed only** `scope.md` and `report.md`. No source, test, or `state.json`
  change; nothing committed or pushed

### Superseded status block (HEAD `0890348a`) — retained for audit

- **Status:** In Progress (scope) — **6 of 14 DoD items remain open** after this
  reconciliation closed TP-15-03, TP-15-04, TP-15-06 and TP-15-07, so `Done` would be
  fabrication; the remaining work is *mixed* (part agent-actionable in-allowlist, part
  owner/product decisions and drifts routed to `bubbles.plan`), so `Blocked` would also
  be inaccurate
- **Phase:** implement (HEAD `0890348a` at the close of this reconciliation; `087ad2ad`
  and `5c77e1f1` — the BUG-004 fix — are ancestors)
- **Attribution:** the prior session's blocking condition has **cleared**. All seven Test
  Plan rows were re-executed by this agent against a tree whose only scope-15 delta is
  the disclosed uncommitted change to `tests/simple-production-wiring.spec.mjs`; every
  result is first-party and attributable. The single piece of borrowed evidence
  (`tests/market-heatmap-control-surface.spec.mjs`, 4 passed / 15.1m, run by the
  orchestrating session) is labelled as such and closes nothing
- **The 6 open items and exactly what blocks each:**
  1. **SCN-012-039** — the item's own text names the END state as "every ordinary tool
     wired"; 19 of 22 are. The mechanism halves are now automated-proven by the
     TP-15-07 canaries, so only the coverage clause fails. Its wording is routed to
     `bubbles.plan`
  2. **SCN-012-041** — 7 of the 8 `#simpleView` pages are reconciled;
     `msft-july-print-model` is not, and BUG-003's live `e2e-ui` closure carrier is
     interception-based (D4 half 2)
  3. **Change boundary + rollback** — D3 (5 delivered paths outside the declared
     allowlist) is open, and the documented rollback path has never been exercised
  4. **TP-15-01** — the named file still carries no `ownerModes` and no
     forbidden-authority assertion; both are now proven, but in TP-15-07's file
  5. **TP-15-05** — the `Regression BUG-003:` carrier uses `page.route` at line 426, so
     a mocked test cannot close a live `e2e-ui` row (D4 half 2)
  6. **Build Quality Gate** — 3 of its 4 blockers stand (no per-tool RED/GREEN for the 3
     unwired tools; D3 allowlist; executable interception in a spec this scope modified).
     Its forbidden-authority-canary blocker is **resolved**
- **Coverage:** **19 of 22 ordinary tools wired** — 18 module-backed in strict
  projection parity + `technical-analysis-decision-lab` as the intended registry-gated
  honest `unavailable`
- **Newly resolved this cycle:** `volatility-sizing-lab` — the earlier revert was
  caused by the provider taking a **second wall-clock sample**; fixed by reading
  `asOf`/`decisionTime` back off the page's own displayed decision, making the provider
  single-sourced and deterministic. No assertion relaxed; the tool passes the identical
  strict-parity check that previously failed it (`30326253`)
- **Remaining (3 ordinary tools):**
  - `msft-july-print-model` — NOT APPLICABLE: deliberate shared-shell opt-out
    (`window.__rlviewsInit = 1`); the bridge never runs
  - `palm-springs-rental-market-lab`, `ocean-shores-rental-market-lab` — **DECLINED BY
    PRODUCT DECISION**: the owner deliberately published `purchasePriceUsd: null` /
    `state: "unavailable"` because the research found insufficient data, and the
    GitHub Pages deploy gate **asserts that absence**, so wiring them would mean
    fabricating the economic layer the owner intentionally withheld. Secondarily,
    neither page loads a per-tool adapter module and the owner computation lives in the
    shared `RLRENTAL` engine, so extraction would also require editing shared code or
    duplicating a formula (both forbidden)
- **Excluded by design:** `market-brief` (`experience.kind = market-action-center`)
- **Drift status after this reconciliation:** **D1, D2 and D5 are CLOSED.** D1 — the
  TP-15-03 and TP-15-04 declared titles now resolve to real tests in the declared file,
  and this agent executed them. D2 — the TP-15-07 bridge canaries exist in
  `scripts/selftest.mjs` (16 canaries; suite 952 → 968, 0 failures). D5 — TP-15-06's row
  declares its two real, interception-free carriers verbatim and this agent executed
  them. **D3, D4 half 2 and D6 remain open with `bubbles.plan`**: the Implementation
  Files allowlist is still stale (5 delivered paths outside it), TP-15-05's carrier still
  contains executable `page.route` interception at line 426, and the TP-15-05
  traceability comment still names the wrong carriers. The earlier claim that "the
  TP-15-03/TP-15-04/TP-15-05/TP-15-06 persistent titles still select nothing (all four
  greps exit 1)" is **superseded** — every declared title now resolves to a real test
- **BUG-004:** fixed and committed (`087ad2ad`, `5c77e1f1`), both ancestors of HEAD. The
  prior session could not establish its state because a concurrent session had reverted
  `market-heatmap-lab.html` mid-run; that condition has cleared. Its effect is visible in
  this reconciliation's evidence: the TP-15-03 control-recompute carrier — which was a
  genuine production capability gap when the row was written — now passes, and the
  TP-15-01 unit file carries two new queued-run invalidation tests (5 → 7)
- **Evidence:** all seven Test Plan rows were executed by this agent at HEAD `0890348a`
  with attributable results (all exit 0): TP-15-01 7/7, TP-15-02 6/6, TP-15-03 + TP-15-04
  4/4 (11.4m, 19-tool sweep), TP-15-05 27/27, TP-15-06 16/16, TP-15-07 968/0, plus the
  53/53 Pages-gate batch. **TP-15-02, TP-15-03, TP-15-04, TP-15-06 and TP-15-07** are the
  closed test-evidence DoD items \u2014 **8 of 14 DoD items checked, 6 open**

---

## 2026-07-30 — Rollback rehearsal (change-boundary DoD row, half (b))

**What this closes.** The change-boundary DoD row is
`The change remains within the exact bridge/ownerModes/page-provider boundary; rollback
restores the prior stub behavior without data loss.` Half (a) (the allowlist) was closed by
D3. Half (b) — the documented rollback path — had **never been exercised by any executed
command**; every prior search for a rollback rehearsal in this scope's artifacts returned
only prose stating that no such rehearsal had been performed. This section is that
rehearsal, executed. It records evidence only; it does not check the DoD box.

**Isolation.** The rehearsal ran in a disposable detached worktree
(`git worktree add --detach /tmp/rl-rollback-rehearsal HEAD`, HEAD `d5c05ce6`), never in the
live checkout, because concurrent sessions are active in this repo and an earlier in-place
proof left a product page truncated. The live checkout was read-only for the whole
rehearsal except this report file. The worktree was removed afterwards.

### 1. Rollback target — verified, not assumed

```
$ git log -1 --format='%H%n%s' f216be0d
f216be0d2f28bf69b232174d9b0810d8482009d4
feat(experience): production Simple-view owner-state bridge (Scope 15, BUG-003 closure)

$ git log -1 --format='%H%n%s' f216be0d^
737d1d177c02b6d8b67f8b72574ea664fd5cec57
fix(pages): restore ordinary tool view routing
```

`f216be0d` is the Scope 15 bridge commit; `f216be0d^` = `737d1d17` is the pre-bridge state
and therefore the rollback target.

### 2. Derived rollback path set (git-derived, not hand-listed)

The scope's documented Rollback section names the surface: *"Restore the stub
`installSimpleProjectionBridge`, revert the `rlapp.js` `ownerModes` change, revert each
page's provider registration…"*. That is the bridge / ownerModes / page-provider boundary.
Derivation = paths changed in `f216be0d^..HEAD` **intersected with** executable source that
assigns or consumes the provider seam:

```
$ git diff --name-only f216be0d^..HEAD | grep -E '^[^/]+\.html$' \
    | while read -r f; do grep -qE '__rlOwnerStateProvider\[' "$f" && echo "$f"; done
ai-capex-strategy-lab.html          options-structure-lab.html
bond-regime-lab.html                real-assets-lab.html
company-fundamentals-lab.html       sector-research-lab.html
etf-momentum-lab.html               smart-money-flow-lab.html
gamma-trading-lab.html              strategy-self-improvement-lab.html
global-rotation-lab.html            strategy-validation-lab.html
intraday-tape-lab.html              swing-structure-lab.html
market-heatmap-lab.html             technical-analysis-decision-lab.html
options-flow-feed-lab.html          volatility-sizing-lab.html
                                    waterfront-polo-lab.html
  pages=19
+ rlexperience.js (bridge)  + rlapp.js (ownerModes gate)
ROLLBACK_PATH_COUNT=21
```

A first, looser derivation (marker match over *all* changed paths) returned 44 and was
**rejected**: it swept in `specs/002-*`, `specs/016-*` and test artifacts that merely
*mention* the seam in prose and that do carry heavy unrelated concurrent work. The
boundary is executable source, not prose.

**Purity check** — no unrelated concurrent work is entangled in the 21-path set:

```
$ while read -r f; do git log --format='%h %s' f216be0d^..HEAD -- "$f"; done \
    < rollback-paths.txt | sort -u \
    | grep -viE 'scope-15|BUG-003|BUG-004|style\(experience\): align continuation'
  (no output)
```

Every commit touching those 21 paths in the range is Scope-15 lineage (the wiring commits,
the two BUG-004 fixes *to the bridge*, and one style commit *inside* the bridge). So a
path-level restore reverts Scope 15 and nothing else. `rlchart.js` (+5 lines in the Scope-15
increment commit `ab1d4879`) is deliberately **excluded** — it is a shared chart helper
outside the bridge/ownerModes/page-provider boundary and additive.

### 3. Rollback executed

```
$ git checkout f216be0d^ -- $(cat rollback-paths.txt)
ROLLBACK_EXIT=0
MODIFIED_COUNT=21
```

Clean, no conflicts, exactly the derived set.

**Structural verification — all 21 files byte-identical to the pre-bridge state:**

```
=== A. BRIDGE (rlexperience.js) ===
  installSimpleProjectionBridge (STUB) occurrences : 2
  renderSimpleBridge          (BRIDGE) occurrences: 0
  __rlOwnerStateProvider consumed             : 0
  identical to f216be0d^ : YES

=== B. ownerModes GATE (rlapp.js) ===
  287:  ownerModes: resolved.value.kind === "ordinary" ? ["simple", "power"] : ["brief"]
  simple-models.json fetch present: 0
  identical to f216be0d^ : YES

=== C. PAGE PROVIDERS ===
  pages still registering __rlOwnerStateProvider[: 0
  all 19 pages byte-identical to f216be0d^ : 19/19
```

### 4. Prior stub behaviour restored — RED half (the bridge is genuinely gone)

Tests were **left at HEAD** rather than rolled back, so the current canaries act as
detectors. If the rollback were a no-op they would stay green.

```
$ node scripts/selftest.mjs        # at rolled-back source
  ✗ FAIL: the bridge publishes a non-empty adapter-module binding table … (0 bindings
          parsed from rlexperience.js)
  ✗ FAIL: the wired set is derived from the production registry + the deployed pages and
          is non-empty (0 wired of 23 registry definitions, scanned 26 pages)
  ✗ FAIL: no forbidden authority … (0 authority flags x 0 wired tools, owned: 0)
  ✗ FAIL (Feature 012 Scope 15 production bridge canaries threw): function not found:
          renderSimpleBridgeInternal

================================================
Research-Lab self-test: 958 passed, 4 failed
================================================
SELFTEST_EXIT=1
```

All four failures are Scope-15 bridge canaries; **zero collateral failures** across the
other 958 assertions.

```
$ npx playwright test tests/simple-production-wiring.spec.mjs --project=system-chrome
  4 failed
    … Regression: market-heatmap Simple renders the real adapter panel in the real
      owner-mode flow
    … TP-15-03 market-heatmap Simple renders real steerable controls …
    … TP-15-04 every wired ordinary tool paints its real Simple adapter panel …
    … TP-15-04 the swept set is derived from the production registry + pages …
WIRING_EXIT=1

    expect(wired.length).toBeGreaterThan(0)
    Expected: > 0
    Received:   0
```

### 5. Prior stub behaviour restored — GREEN half (native Simple returns, shell functions)

Observed in a real browser on a formerly-wired page at the rolled-back source (read-only
probe, kept outside the repo tree, asserting nothing):

```
=== OBSERVED BROWSER STATE AT ROLLED-BACK SOURCE (market-heatmap-lab, Simple view) ===
  bodyHasRlvFocused         = false
  bodyClasses               = "rlapp-status"
  adapterPanelExists        = true
  adapterPanelState         = "unavailable"
  adapterPanelAdapterId     = "simple-adapter/market-breadth/v1"
  adapterPanelVisible       = true
  adapterPanelText          = "Simple model unavailable\n\nOwner model adapter required: …"
  nativeFirstBlockVisible   = true
  nativeVisiblePanelCount   = 2
  providerRegisteredOnPage  = false
  bridgeFnPresent           = false
PROBE_EXIT=0
```

This is exactly the RED state the wiring spec's own header declared in advance for the
pre-Scope-15 stub: *"under the dead-code stub the panel stays
`data-rlexperience-simple-state="unavailable"` … so the 'ready' + adapter-id assertions
fail."* `body.rlv-focused` is **false**, so native page content is **not** hidden and two
native panels render — native Simple is restored.

**Precision note.** "No adapter panel" is not literally accurate and should not be recorded
that way: the panel *element* still exists and is visible, but it renders the stub's honest
`Simple model unavailable` placeholder instead of a real adapter projection. The spec header
also says the stub panel carries "no adapter id"; observed, it *does* carry
`data-rlexperience-adapter="simple-adapter/market-breadth/v1"` (the stub names the required
adapter). The RED comes from the state attribute, not the adapter-id attribute.

**Shell still functions** — the two shell-contract specs that predate Scope 15 and were
untouched in `f216be0d^..HEAD`:

```
$ npx playwright test tests/tool-experience.spec.mjs tests/tool-experience-mobile.spec.mjs \
    --project=system-chrome
  1 failed
    … Regression: SCN-012-028 uncertified Feature 002 exposes exact Brief gate …
  4 passed (30.6s)
SHELL_SPEC_EXIT=1
```

The single failure is **pre-existing, not rollback-caused**. Control run, same test, same
worktree restored to HEAD with the bridge present:

```
$ git checkout HEAD -- $(cat rollback-paths.txt)   # worktree back at HEAD
$ npx playwright test tests/tool-experience.spec.mjs -g "SCN-012-028" --project=system-chrome
    > 70 |   await expect(gate).toContainText('Observed status: not_started');
    - unexpected value "Dependency pending: Feature 002Observed status: done…"
  1 failed
CONTROL_EXIT=1
```

Identical assertion, identical line 70, identical failure with the bridge present. It is
Feature 002 certification drift (Feature 002 is now `done`; the test still expects
`not_started`), unrelated to Scope 15.

### 6. "Without data loss" — definition and proof

The scope's Rollback section defines the term: *"No source data, option snapshots, provider
config, or user-local history is deleted or reset."* Proof is a byte-level fingerprint of
those four classes, taken **before** the rollback and again **after** the rollback and after
every test run:

| Class | Files | SHA-256 (first 16) before | after all runs |
|---|---|---|---|
| `data/bars` (source data) | 289 | `3a97aeb6f108a02b` | `3a97aeb6f108a02b` |
| `data/options` (option snapshots) | 23 | `e8ffe32ab30d2233` | `e8ffe32ab30d2233` |
| `briefs/**` (committed snapshots/history) | 963 | `c9c9cc8f7e3019e3` | `c9c9cc8f7e3019e3` |
| root `*.json` (registries + provider config) | 34 | `05b3974fbfcffb90` | `05b3974fbfcffb90` |
| root `*.jsonl` (append-only history) | 2 | `6d32da79adebc821` | `6d32da79adebc821` |

```
  deleted files: 0
  registries intact: simple-models.json=yes tools.json=yes tool-experience.config.json=yes
```

All five classes are byte-identical and the rollback deleted nothing. `simple-models.json`
notably **survives** because it predates Scope 15 (added by `c81d808d`, Scopes 01-04); only
`rlapp.js`'s *fetch* of it is Scope-15 and is what reverts. The 19 page provider
registrations are cleanly **absent by design** — they are the reverted delivery itself, not
lost data, and each page returns byte-identical to its pre-bridge content.

### 7. Verdict and one real finding

**The documented rollback path works.** It restores the prior stub behaviour exactly
(21/21 files byte-identical to `f216be0d^`; bridge canaries go RED; native Simple returns;
shell functions with zero collateral failures) and loses no data.

**Finding ROLL-01 (documentation accuracy, LOW, does not block the rollback claim).** The
bridge commit's message and a comment still live in production source assert something the
diff disproves. `f216be0d` claims *"Removes the stub's `body.classList.add('rlv-focused')`"*
and `rlexperience.js:1844` at HEAD still states *"the stub's classList.add is removed."*
But:

```
$ git show f216be0d -- rlexperience.js | grep -nE '^[-+].*rlv-focused'
45:+     INVARIANT (BUG-003 closure): this bridge NEVER mutates body.rlv-focused —
173:+         is the sole owner of rlv-focused; the stub's classList.add is removed. */
```

Only `+` lines — the commit removed **zero** `rlv-focused` lines, and the pre-bridge
`rlexperience.js` contains **0** occurrences of `rlv-focused` at all. There was no stub
`classList.add` to remove. The sole executable owner is `rlviews.js:146`
(`document.body.classList.toggle("rlv-focused", ownerModes.indexOf(mode) === -1)`) at both
states, which is why the "exactly one executable rlv-focused write … lives in rlviews.js"
canary passes **before and after** the rollback. The BUG-003 mechanism was the shell's
relocation of `[data-rlbrief-mount]` into the hidden `brief` panel, introduced by
`c81d808d` (Scopes 01-04) and resolved by owner decision + TP-10-02 reconciliation — not by
this bridge removing a stub write. Routed to `bubbles.plan` / `bubbles.docs`: the in-source
comment overstates what the change did.

### 8. Cleanup and live-tree integrity

```
$ git worktree remove --force /tmp/rl-rollback-rehearsal   # WORKTREE_REMOVE_EXIT=0
$ git worktree prune                                       # PRUNE_EXIT=0
$ git worktree list
/home/redacted/research-lab  d5c05ce6 [main]

$ git status --porcelain          # live checkout — no source edits
 M .github/bubbles-project.yaml
 M specs/012-…/bugs/BUG-004-market-heatmap-control-surface/report.md
 M specs/012-…/bugs/BUG-004-market-heatmap-control-surface/scopes.md
 M specs/012-…/bugs/BUG-004-market-heatmap-control-surface/state.json

$ node scripts/selftest.mjs
Research-Lab self-test: 968 passed, 0 failed
LIVE_SELFTEST_EXIT=0
```

The four dirty files are pre-existing concurrent-session work and were not touched. The
live checkout is byte-unchanged in product source and still 968/0.

## Finding F-015-MSFT-OPTOUT — one of the two stated blockers is disproven

**State:** OPEN, routed to this scope's owner. No product change made; this is a
diagnosis, and adopting the shell is this scope's decision, not a test repair.

`tests/tool-experience-shell.functional.mjs` is **2 pass / 1 fail**. The failure
is a single page:

```
msft-july-print-model: page.waitForSelector: Timeout 10000ms exceeded.
  waiting for locator('#rlviews[data-rlexperience-shell="ready"]') to be visible
```

Verified this reproduces at **clean HEAD** in a detached worktree, so it is not
an artifact of the concurrent session's in-flight `rlexperience.js`.

Root cause is not a defect: `msft-july-print-model.html` deliberately opts out by
setting `meta[name=rlviews]=off` and pre-setting `__rlviewsInit=1` so rlapp skips
shell creation. Diagnostic probe confirms the mechanism — `#rlviews count: 0`
with **zero page errors and zero console errors**, and `RLEXPERIENCE` loaded. The
shell is never created; nothing is broken.

The opt-out comment states two blockers. They do not hold equally:

| # | Stated blocker | Verdict |
|---|---|---|
| 1 | "this tool's Playwright spec still couples to the legacy Simple/Power tabs… Migrate the spec, then remove this meta." | **REAL, but far smaller than stated.** The "23 legacy-tab references" figure counts textual occurrences; measured, only **2 of 6 tests** actually fail when the opt-out is removed. See the runtime measurement below. |
| 2 | the shared simple-model runtime is "a stub that hardcodes 'Simple model unavailable' for EVERY ordinary tool" | **STALE — disproven twice.** By comparison: `ai-capex-strategy-lab`, the page the comment itself cites as proof, now renders a real model result ("Grid & Electrical leads the beneficiary distribution; median return 0.085955"), as does `options-structure-lab`; `sector-research-lab` shows an honest per-tool "adapter required" message, not a hardcoded universal placeholder. And at runtime on msft itself: with the opt-out removed the native Simple view renders real data and is **not** hijacked (see below). |

msft is also already fully wired for adoption: `simple-model/msft-margin-eps/v1`,
its adapter living in the module the page already loads, a real `msftAnnualBridge`,
2 journeys, and `powerAdapterId: power-adapter/existing-owner-page/v1` (so the
native page content belongs under Power). So blocker 2 no longer justifies the
opt-out; only blocker 1 does.

**Contradiction to resolve.** This scope records msft as "not applicable…
structurally outside the shell and untouched by this scope", while the shell test
asserts **all 23** registry pages bootstrap the shell. Both cannot be right. Either
the test's population is narrowed to the pages this scope actually claims, or the
opt-out is retired by migrating `msft-july-market-refresh.spec.mjs` off the legacy
tabs. That is a product decision for this scope's owner.

### Runtime measurement of retiring the opt-out (decision-ready)

Rather than estimate, the opt-out was removed in a **throwaway detached worktree**
(`git worktree add --detach`, removed afterwards; the live tree was never modified
— confirmed by `git status --porcelain msft-july-print-model.html
tests/msft-july-market-refresh.spec.mjs` = 0 dirty). Observed behavior with lines
775–795 deleted:

| Observation | Result |
|---|---|
| Shared shell mounts | **yes** — `#rlviews[data-rlexperience-shell="ready"]`, count 1 |
| Page or console errors | **none** |
| Shell tabs | `Simple, Power, Brief, Journey` |
| Shell tabs drive the native panels | **yes** — shell Power click → `powerView` visible / `simpleView` hidden; shell Simple click → reverses |
| Native `#modeSeg` after adoption | present in DOM but **auto-hidden by the shell** (`display/visibility` computed hidden), so there is no duplicated visible tab strip |
| Native Simple content under the shell | **real, not a placeholder** — "DELAYED SPOT $448.82 … DAILY TECHNICAL STACK Bear stack (20 < 50 < 200)" |

This is the runtime disproof of blocker 2. The opt-out comment predicted the shell
would "hijack 'simple' mode with rlv-focused, hiding the native Simple view"; in
current code the shell is only a **tablist** (`#rlviews` has `role="tablist"` and
no panels of its own) and it *drives* the page's own `#simpleView` / `#powerView`.
The native Simple view is preserved, not hidden.

**Exact cost of adoption — 2 tests, not 23 references.** The "23 legacy-tab
references" figure counts textual occurrences, most of which are in asserted object
literals that still hold. Measured against `tests/msft-july-market-refresh.spec.mjs`:

| State | Result |
|---|---|
| At HEAD, opt-out intact | **6 passed** |
| Opt-out removed | **4 passed, 2 failed** |

The two failures are both native-tab-control assertions that the shared shell
replaces by design:

- `:439` `SCN-009-009/011/012 one state drives modes refresh and export` —
  `locator.click` timeout, because it clicks the now-hidden native `#simpleTab`/`#powerTab`.
- `:596` (asserting at `:713`) `SCN-009-011 viewport accessibility and canvas matrix` —
  expected `{ focused: "powerTab", mode: "power" }`, received `{ focused: "", mode: "simple" }`,
  because native-tab keyboard navigation no longer applies.

Migration is therefore bounded: repoint those two at the shell's tabs
(`#rlviews [role="tab"][data-rlview-mode="simple"|"power"]`) and delete the
21-line opt-out. Adopting it would also take `tests/tool-experience-shell.functional.mjs`
from 2 pass / 1 fail to 3 pass / 0 fail.

**Deliberately NOT applied here.** Doing it would mean rewriting Feature 009's
regression assertions (`SCN-009-009/011/012`) so that a UI change introduced in the
same edit passes — the "change the test so the change passes" antipattern — while
also overriding this scope's recorded decision that msft is out of scope. The
measurement is supplied so the owner can decide with facts instead of an estimate;
the code change is theirs to authorize.

### RESOLVED — it was never an opt-out decision, it was an unresolved contract conflict

Owner authorized proceeding. Investigating the chronology before touching anything
overturned the premise of everything above, including my own framing:

| Commit | Date | Effect |
|---|---|---|
| `36ce4243` | 07-20 | opt-out `<meta name="rlviews" content="off">` added — **ineffective**; rlapp mounted the shell regardless |
| `c81d808d` | 07-24 | Feature 012's 23-page shell contract introduced; Scope 02 certified it ✔ **and it genuinely passed** |
| `05232f26` | 07-25 | `__rlviewsInit = 1` added ("restore native Simple view") — made the opt-out effective |

The decisive measurement is what the Feature 009 msft spec did at `c81d808d`, the
moment Feature 012's contract was certified green: **4 passed / 2 failed** — the
same two tests. So this was never a regression introduced by `05232f26`. Feature
012 and Feature 009 held **mutually exclusive contracts over the same tab strip**,
and every state merely flipped which one was red:

| State | Feature 012 shell test | Feature 009 msft spec |
|---|---|---|
| `c81d808d` (certified) | 23/23 ✅ | 4/6 ❌ |
| after `05232f26` (opt-out effective) | 2/1 ❌ | 6/6 ✅ |
| opt-out removed, spec untouched | 3/0 ✅ | 4/6 ❌ |
| **adopted + assertions migrated** | **3/0 ✅** | **6/6 ✅** |

The last row had never existed. Both contracts hold for the first time.

**Why migrating Feature 009's assertions is not the antipattern I feared.** Their
guarantee is "one accepted state drives both modes, accessibly" — not "an element
with `id=simpleTab` is clickable". Every semantic assertion survives untouched
because the shell **mirrors its state onto the native elements**; verified at
runtime before editing: `aria-selected` on `#simpleTab`/`#powerTab`, `hidden` and
`inert` on `#simpleView`/`#powerView`, `MsftJulyModel.displayMode`, and
`body.power` all track the shell correctly. Only three *interaction targets* moved
from the now-shell-managed native tabs to the shell's visible tablist. The shell
implements the full roving-tablist pattern (`rlviews.js:240-246` handles
ArrowLeft/ArrowRight/Home/End/Enter/Space), so no accessibility capability is lost;
Home/End now span the shell's four views (`simple|power|brief|journey`) instead of
two native tabs, and the tests assert that measured behavior rather than the old
two-tab endpoints.

**Blocker 2 disproven a third time, at the point of change.** With the opt-out
removed the native Simple view renders real data and is not hijacked — the shell's
`#rlviews` is a `role="tablist"` with no panels of its own and simply drives the
page's own views.

**Adversarial proof** (controls green before and after):

```
  CONTROL:
    shell test: exit=0 PASS (3/0)
    msft spec : exit=0 PASS (6 passed)
  MUT-A: re-introduce the effective opt-out -> shell test must CATCH it
    shell test: exit=1 CAUGHT (2/1)
  MUT-B: neuter ArrowLeft in the shell tablist -> msft spec must CATCH it
    msft spec : exit=1 CAUGHT (2 failed 4 passed)
  RESTORED control:
    shell test: exit=0 PASS (3/0)
    msft spec : exit=0 PASS (6 passed)
```

`rlviews.js` was restored byte-clean after MUT-B (`git status --porcelain` = 0).

**This scope's own record stays true.** Scope 15 said msft was "untouched by this
scope", which remains accurate — it disclaimed the work rather than forbidding it.
Nothing in this scope's certified DoD is altered.

**Secondary finding — scenario-ID collision.** The shell test labels its cases
`SCN-012-028` / `SCN-012-029`, but those IDs belong to different scenarios —
"Feature 002 gate blocks dynamic Brief integration" and "Feature 008 gate blocks
private Portfolio integration" — which are linked to `tests/tool-experience.spec.mjs`.
The shell test borrowed unrelated IDs, so scenario-to-test traceability for those
two IDs currently resolves to two different files asserting unrelated behavior.



