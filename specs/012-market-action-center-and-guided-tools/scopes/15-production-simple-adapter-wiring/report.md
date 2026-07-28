# Scope 15 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [design addendum](../../design-addendum-production-simple-wiring.md) | [scope index](../_index.md)

## Summary

Scope 15 (Production Simple-View Adapter Wiring, Model B) is **In Progress**.

The production bridge itself is delivered and proven, and **16 of the 22 ordinary
tools are wired** (15 module-backed tools in strict projection parity, plus
`technical-analysis-decision-lab` as the intentional honest-`unavailable` under the
SCN-012-034 lock). `market-brief` is `kind: market-action-center` (brief-only) and is
excluded from ordinary Simple wiring by design, so it is not part of the 22.

**Six ordinary tools remain unwired**, each with a verified blocker recorded in
[Progress — 2026-07-28](#progress--2026-07-28-increments-1-12). Three of them
(`bond-regime-lab`, `volatility-sizing-lab`, `msft-july-print-model`) cannot be wired
by this scope acting alone: two would break specs owned by **certified-done** features
(003 and 011) and therefore need a spec amendment / owner decision, and one is a
deliberate shared-shell opt-out where the bridge never runs. `volatility-sizing-lab`
was attempted in this session and **deliberately reverted**.

The scope is **not** Done and no completion is claimed.

The scope exists to complete the never-wired production rendering of the 23
Feature 012 SimpleModel adapters (Model B): replace the stub
`installSimpleProjectionBridge` with a real adapter-render bridge, flip ordinary
`ownerModes` to `["power"]`, expose each page's real owner state through a
uniform provider seam, demote the 8 native `#simpleView` tools' Simple content to
Power (nothing deleted), and close the BUG-003 native-view breakage. The verified
gap analysis, rendering contract, the full 23-tool owner-state-source mapping, and
the test strategy are in
[design-addendum-production-simple-wiring.md](../../design-addendum-production-simple-wiring.md).

## Progress — 2026-07-28 (increments 1-12)

All work below is **already committed and pushed** (`main` in sync with
`origin/main`; HEAD `56099e24`). This section records it; it changed no product,
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

### Coverage: 16 of 22 ordinary tools wired

TP-15-02 derives the wired set from the production registry **and** the production
pages (never a hard-coded list). Its run log for this session:

```text
[TP-15-02] wired (16): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, ai-capex-strategy-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, technical-analysis-decision-lab
[TP-15-02] not wired (7): market-brief, bond-regime-lab, msft-july-print-model, company-fundamentals-lab, volatility-sizing-lab, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 15 of 16
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
```

Independently confirmed against the pages themselves — exactly 16 pages register the
provider seam:

```text
$ grep -ln '__rlOwnerStateProvider' *.html | sort
ai-capex-strategy-lab.html
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
waterfront-polo-lab.html
count=16
```

`market-brief` appears in the "not wired" list because it is `kind:
market-action-center` (brief-only) and is excluded from ordinary Simple wiring **by
design** — its `ownerModes` stays `["brief"]`. It is therefore not one of the 22
ordinary tools and not a remaining item.

### Change-boundary check (all 12 commits)

Every path touched by the scope-15 commits is inside the scope's Implementation Files
allowlist, and no protected path was touched:

```text
$ git show --name-only --format='' f216be0d 9a713001 5c83d9d7 29888533 0e6c5ee2 \
    0fed316b 801df1d2 d083a345 54827987 2ea284cb 9a99c1f4 56099e24 \
    | grep -v '^$' | sort -u
ai-capex-strategy-lab.html          rlapp.js
etf-momentum-lab.html               rlexperience.js
gamma-trading-lab.html              sector-research-lab.html
global-rotation-lab.html            smart-money-flow-lab.html
intraday-tape-lab.html              strategy-self-improvement-lab.html
market-heatmap-lab.html             strategy-validation-lab.html
options-flow-feed-lab.html          swing-structure-lab.html
options-structure-lab.html          waterfront-polo-lab.html
real-assets-lab.html                tests/simple-model-adapters-macro-fundamental.spec.mjs
                                    tests/simple-model-adapters-market.spec.mjs
                                    tests/simple-production-bridge.integration.mjs
                                    tests/simple-production-bridge.unit.mjs
                                    tests/simple-production-wiring.spec.mjs
=== count === 22

=== protected paths touched? (rldata.js/rlviews.js/market-brief.html/data/options) ===
(empty = none touched)
```

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

### The 6 remaining ordinary tools — each with its verified blocker

None of these is done, and none is claimed as done.

#### 1. `bond-regime-lab` — blocked on a certified-feature spec amendment

Wirable (the page already loads `rlexperience-adapters/macro-rotation.js`), but
`tests/bond-regime-lab.spec.mjs` asserts the **native** `#simpleView
[data-model-digest]` on the default Simple view in four places. Wiring flips
`ownerModes` to `["power"]`, which hides native content in Simple and breaks all four:

```text
$ grep -n 'simpleView' tests/bond-regime-lab.spec.mjs
349:    await expect(page.locator('#simpleView [data-model-digest]')).toBeVisible();
351:      digest: document.querySelector('#simpleView [data-model-digest]')?.dataset.modelDigest || '',
365:  const simpleDigest = await page.locator('#simpleView [data-model-digest]').getAttribute('data-model-digest');
383:  const simpleDigest = await page.locator('#simpleView [data-model-digest]').getAttribute('data-model-digest');
```

Line 383 is inside `BS-011 Simple and Power share one model digest`. The owning
feature is **certified done**, so this needs a spec amendment / owner decision, not a
unilateral wiring change:

```text
$ node -e '...print status + certification for 003/010/011...'
003-bond-regime-and-scenario-lab        status=done        cert=done        certifiedAt=2026-07-27T20:23:04Z
010-company-fundamentals-and-brief-lab  status=in_progress cert=in_progress certifiedAt=-
011-volatility-regime-and-sizing-lab    status=done        cert=done        certifiedAt=-
```

Current baseline is fully green and must stay that way until amended:

```text
$ npx --no-install playwright test tests/bond-regime-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
Running 27 tests using 1 worker
  ✓   1 …mjs:75:1 › BS-001 duration-driven ratio improvement stays mixed (500ms)
  ...
  ✓  18 …spec.mjs:378:1 › BS-011 Simple and Power share one model digest (516ms)
  ...
  ✓  27 …andmarks names focus and noncolor states at 390 and 1440 widths (872ms)
  27 passed (22.6s)
===PW_BOND_EXIT=0===
```

#### 2. `volatility-sizing-lab` — ATTEMPTED THIS SESSION AND DELIBERATELY REVERTED

Two independent problems.

(a) Its declared `adapterModule` is not loaded by the page — the page loads only
`rlvol.js`, so wiring additionally requires adding the module `<script>`:

```text
$ node -e '...declared adapterModule vs scripts the page loads...'
volatility-sizing-lab   adapter=simple-adapter/conditional-volatility/v1  module=rlexperience-adapters/market-structure.js
volatility-sizing-lab   loaded adapter modules: (none)   |   engines: src="rlvol.js"
```

(b) The wiring was implemented in this session and then **reverted on purpose**. The
reverted attempt failed `tests/volatility-sizing-lab.spec.mjs` (owned by Feature 011,
which is certified `done` — see the certification output above) and TP-15-02 reported
an unresolved parity divergence, `volatility-sizing-lab: bridge state matches the
explicit runtime path`. **Claim source for the failing-test count (7) and the
divergence string: the reverted in-session attempt — NOT re-verifiable at HEAD,
because the change was reverted.** What *is* verifiable at HEAD is that the revert
restored green:

```text
$ npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
Running 16 tests using 1 worker
  ✓   1 …entile always renders its trailing window and observation count (416ms)
  ✓   2 …ssion BS-005: no directional element appears in Simple or Power (422ms)
  ✓   6 …Regression BS-010: Simple and Power share one decision identity (374ms)
  ✓  10 …S-013: realized is never relabeled a forecast in the owner read (292ms)
  ✓  15 …es one owner read and Market Brief renders it without recompute (553ms)
  ✓  16 …e THROUGH the shared rlnav registration, not just by direct URL (714ms)
  16 passed (8.2s)
===PW_VOL_EXIT=0===
```

The design addendum already classifies this tool's provider extraction as an **open**
implementation item (`design-addendum-production-simple-wiring.md:221`, "owner-parity /
provider extraction is an OPEN implementation item — 4 tools") and lists six native
`#simpleView` assertion sites needing relocation (`:258` → `:74,:75,:80,:95,:161,:281`).
Same amendment requirement as bond-regime, **plus** a real parity divergence to
diagnose first.

#### 3. `msft-july-print-model` — NOT APPLICABLE (deliberate shared-shell opt-out)

The page opts out of the shared shell, so the bridge never runs and a provider would
be dead code:

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

#### 4. `company-fundamentals-lab` — pre-existing RED baseline before any wiring

The page already loads `rlexperience-adapters/fundamental-models.js`, so it is
technically wirable, but its own spec is **already failing at HEAD with the tool
unwired**, deterministically at `--workers=1`. Wiring now would muddy attribution:

```text
$ npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --workers=1 --reporter=list
Running 32 tests using 1 worker
  ✘  11 …ypes change KPI priority without changing shared financial facts (5.5s)
  ✘  13 …lure preserves the last valid dossier without credential prompts (5.5s)

  1) tests/company-fundamentals-lab.spec.mjs:271:1 › Regression: SCN-010-008 …
    Error: expect(locator).toHaveText(expected) failed
    Locator:  locator('[data-node-id="identity-summary"] [data-node-value]')
    Expected: "MICROSOFT CORP | MSFT"
    Received: "MICROSOFT CORP | MSFT?"

  2) tests/company-fundamentals-lab.spec.mjs:302:1 › Regression: SCN-010-027 …
    Error: expect(locator).toHaveText(expected) failed
    Expected: "MICROSOFT CORP | MSFT"
    Received: "MICROSOFT CORP | MSFT?"

  2 failed
  30 passed (33.5s)
===PW_COMPFUND_EXIT=1===
```

Correction to the working assumption carried into this session: the baseline is **2
failed / 30 passed**, not 1 failed / 31 passed, and it is **not** parallel-worker
contamination — it reproduces deterministically at `--workers=1` and is a single
concrete content mismatch (a stray `?` in `identity-summary`) hitting both SCN-010-008
(`:271`) and SCN-010-027 (`:302`). Both belong to Feature 010, which is
`status=in_progress`. That contamination should be fixed in Feature 010 territory
before this tool is wired.

#### 5 & 6. `palm-springs-rental-market-lab` and `ocean-shores-rental-market-lab`

Neither page loads its declared adapter module; the owner seam is the shared
`RLRENTAL` engine, so both need the design addendum's named provider **extraction**,
which the addendum itself marks as an open item:

```text
$ node -e '...declared adapterModule...' ; grep for loaded modules
palm-springs-rental-market-lab   module=rlexperience-adapters/property-research.js   loaded: (none)  engines: src="rlrental.js"
ocean-shores-rental-market-lab   module=rlexperience-adapters/property-research.js   loaded: (none)  engines: src="rlrental.js"

$ grep -n 'OPEN implementation item' specs/.../design-addendum-production-simple-wiring.md
221:(owner-parity / provider extraction is an OPEN implementation item) — 4 tools:**
226:| 20 | `palm-springs-rental-market-lab` | … | shared rental engine `RLRENTAL.mountRoute`. Page does **not** load `property-research.js`. …
227:| 21 | `ocean-shores-rental-market-lab` | … | shared rental engine `RLRENTAL.mountRoute`. Same as palm-springs. |
```

`palm-springs` additionally has a dedicated spec **and is the GitHub Pages CI deploy
gate**, which makes it the highest-risk of the six:

```text
$ grep -rn 'playwright test' .github/workflows/pages.yml
36:        run: npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list

$ npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
Running 29 tests using 1 worker
  ✓   1 …002 missing configuration blocks payload fetch and every output (471ms)
  ✓  11 …ed payload exposes four truthful units and no fixture authority (388ms)
  ✓  29 …n cockpit — model + sliders in Simple, deep-dive lives in Power (476ms)
  29 passed (19.2s)
===PW_PALM_EXIT=0===
```

### Implementation Plan step status

Prose annotation only; no DoD item is created or altered here.

| Step | Status |
|---|---|
| 1. RED contract tests first | **Complete** — `tests/simple-production-bridge.unit.mjs` and `tests/simple-production-wiring.spec.mjs` landed in `f216be0d` |
| 2. Shell bridge + provider-gated `ownerModes` | **Complete** — `rlexperience.js` + `rlapp.js` in `f216be0d`; `market-brief` confirmed unchanged (still absent from the wired set) |
| 3. Proven single-tool end-to-end (`market-heatmap-lab`) | **Complete** — `f216be0d`, greened in `ab1d4879` |
| 4. Remaining delegating tools in adapter-module batches | **Partially complete** — 15 of the 18 delegating tools wired across `9a713001`…`56099e24`; `bond-regime`, `msft-july-print-model`, `company-fundamentals` outstanding (blockers above) |
| 5. Reconcile the 8 `#simpleView` tools + BUG-003 regression | **Outstanding** — blocked on the Feature 003 / Feature 011 spec amendments; no `#simpleView` spec has been modified |
| 6. Handle the 4 non-delegating tools | **Partially complete** — `technical-analysis-decision-lab` done (intentional honest-`unavailable`, `ab1d4879`); the three provider extractions (`volatility-sizing`, `palm-springs`, `ocean-shores`) outstanding |
| 7. `scripts/selftest.mjs` bridge canaries | **Outstanding** — the broad suite is 0-fail, but no bridge canary exists (`grep` for `renderSimpleBridge` / `ownerModes` / `installSimpleProjectionBridge` in `scripts/selftest.mjs` returns nothing) |

## Evidence Anchors

- [`tp-15-01`](#tp-15-01) — **partial**: executed and green (5/5), but the file carries no `ownerModes` or forbidden-authority assertion, so the DoD item stays unchecked
- [`tp-15-02`](#tp-15-02) — **satisfied**: executed and green (6/6)
- [`tp-15-03`](#tp-15-03) — **partial**: a passing market-heatmap real-adapter-panel e2e exists, but its persistent title differs from the Test Plan row and the "control recomputes" half lives in another file
- [`tp-15-04`](#tp-15-04) — **not implemented**: the declared persistent title does not exist in the repo
- [`tp-15-05`](#tp-15-05) — **not started**: `bond-regime-lab` unwired (amendment required)
- [`tp-15-06`](#tp-15-06) — **attempted and reverted**: `volatility-sizing-lab` unwired at HEAD
- [`tp-15-07`](#tp-15-07) — **partial**: broad suite is 952 passed / 0 failed, but the new bridge canaries do not exist

## Completion Statement

Scope 15 is **In Progress** and is **not** Done. The production bridge is delivered
and proven, 16 of 22 ordinary tools are wired, and 6 remain — 3 of which require a
spec amendment or an owner decision before any further wiring is legitimate. Three
Test Plan rows (TP-15-04, TP-15-05, TP-15-06) have no executed evidence, and three
more (TP-15-01, TP-15-03, TP-15-07) are only partially satisfied against their DoD
text. No completion of the scope or of Feature 012 is claimed.

## Test Evidence

### TP-15-01

**Command:** `node --test tests/simple-production-bridge.unit.mjs`
**Claim Source:** executed (this session)
**Result:** PASSED (5/5) — but see the uncertainty note below.

```text
$ node --test tests/simple-production-bridge.unit.mjs
✔ renderSimpleBridge is exposed on the production API (4.104797ms)
✔ provider present + real owner state → renders the REAL market-breadth adapter (ready), never mutates rlv-focused (25.70928ms)
✔ no owner-state provider → honest unavailable, no invented signal, never mutates rlv-focused (4.689196ms)
✔ owner evidence does not permit a run (unhydrated) → honest unavailable, never mutates rlv-focused (10.036992ms)
✔ missing adapter module → honest unavailable (no crash), never mutates rlv-focused (3.587498ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 140.843791
===TP1501_EXIT=0===
```

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
**Claim Source:** executed (this session)
**Result:** PASSED (6/6).

```text
$ node --test tests/simple-production-bridge.integration.mjs
[TP-15-02] wired (16): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, ai-capex-strategy-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, technical-analysis-decision-lab
[TP-15-02] not wired (7): market-brief, bond-regime-lab, msft-july-print-model, company-fundamentals-lab, volatility-sizing-lab, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 15 of 16
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
✔ TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list) (44.575167ms)
✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (765.479122ms)
✔ TP-15-02 owner parity: every wired tool's Simple facts EQUAL the owner/Power-path values (863.319648ms)
✔ TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent) (1382.070447ms)
✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (48.474755ms)
✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (30.175572ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3263.332508
===TP1502_EXIT=0===
```

### TP-15-03

**Command:** the 5-spec Simple-adapter / production-wiring batch (below).
**Claim Source:** executed (this session)
**Result:** PASSED (27/27) — but the Test Plan row's persistent title does not match
the repo, so the DoD item stays unchecked.

```text
$ npx --no-install playwright test tests/simple-model-adapters-market.spec.mjs \
    tests/simple-model-adapters-macro-fundamental.spec.mjs \
    tests/simple-model-adapters-strategy-property.spec.mjs \
    tests/simple-models.spec.mjs tests/simple-production-wiring.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
Running 27 tests using 4 workers
  ✓   1 …ne seed and separates parameter sensitivity from path randomness (1.5s)
  ✓   2 …er stays unavailable without defaults fetch or fabricated result (1.7s)
  ✓   3 … rotation Simple controls recompute owner transition and ETF fit (2.6s)
  ✓   4 …p Simple breadth controls recompute owner leadership sensitivity (2.1s)
  ✓   9 … under Power (Simple stays honest-unavailable, nothing deleted) (726ms)
  ✓  12 …imple renders the real adapter panel in the real owner-mode flow (1.8s)
  ✓  18 …controls recompute bounded action or no-action inside Brief only (3.1s)
  ✓  19 …imple five-gate controls recompute or stay honestly unavailable (544ms)
  ✓  27 …e controls recompute owner playbook from existing options owner (563ms)
  27 passed (33.0s)
===PW_ADAPTERS_EXIT=0===
```

**Uncertainty Declaration.** The Test Plan declares TP-15-03's persistent title as
`Regression: market-heatmap Simple renders the real adapter panel and one control
recomputes owner leadership` in `tests/simple-production-wiring.spec.mjs`. That file
contains exactly one test, with a different title, and the "control recomputes" half
lives in a different (Scope-05) spec:

```text
$ grep -n "test('" tests/simple-production-wiring.spec.mjs
47:test('Regression: market-heatmap Simple renders the real adapter panel in the real owner-mode flow', async ({ page }) => {

$ grep -rn 'recompute owner leadership' tests/*.mjs
tests/simple-model-adapters-market.spec.mjs:310:    title: 'Regression: market heatmap Simple breadth controls recompute owner leadership sensitivity',
```

Both behaviours are genuinely proven by passing tests, but they are split across two
files and neither carries the declared persistent title. This is a Test-Plan ↔
implementation drift that `bubbles.plan` owns; the DoD item remains `- [ ]` rather
than being closed against a title that does not exist.

### TP-15-04

**Claim Source:** not-run — the declared test does not exist.
**Result:** NOT IMPLEMENTED.

The Test Plan declares the persistent title `Regression: each wired ordinary tool
shows a ready adapter panel in Simple with an owner-parity fact` in
`tests/simple-production-wiring.spec.mjs`. That file contains only the single test
shown under TP-15-03. The registry-derived per-wired-tool loop is currently proven at
the **integration** layer by TP-15-02, not by an `e2e-ui` test. The DoD item remains
`- [ ]`.

### TP-15-05

**Claim Source:** not-run — precondition unmet.
**Result:** NOT STARTED.

TP-15-05 requires bond-regime native content to show in Power and the adapter panel to
be the Simple surface. `bond-regime-lab` is unwired (see the "not wired (7)" line
under TP-15-02), its spec still asserts native `#simpleView` content on the default
Simple view, and the owning Feature 003 is certified `done`. The regression cannot be
written or run until that amendment lands. BUG-003 is therefore **not** closed.

### TP-15-06

**Claim Source:** not-run at HEAD — attempted in-session and deliberately reverted.
**Result:** NOT SATISFIED.

See "The 6 remaining ordinary tools → 2. `volatility-sizing-lab`" above for the full
record, including the reverted attempt and the restored 16/16 green baseline. The DoD
item remains `- [ ]`.

### TP-15-07

**Command:** `node scripts/selftest.mjs`
**Claim Source:** executed (this session)
**Result:** 952 passed / 0 failed, exit 0 — the 0-fail preservation half of the DoD
row is met; the "new bridge canaries" half is not.

Excerpt of the tail of the full unfiltered run (952 assertions):

```text
$ node scripts/selftest.mjs
...
Feature 012 Scope 12 Dynamic Red Alert discovery/qualification/projection
  ✓ SCN-012-023 a dynamically corroborated, market-confirmed, high-severity candidate qualifies with every falsifiable field and an admission score (never a probability/confidence/crash-odds field), publication Feature-002 gated
  ✓ SCN-012-024 a single-origin dramatic candidate consumes no visible slot, is a safe insufficient-corroboration count, and never echoes its dramatic title
  ✓ SCN-012-025 a no-candidate window renders an honest empty state with cutoff/channels/owner coverage and no illustrative topic

================================================
Research-Lab self-test: 952 passed, 0 failed
================================================
===SELFTEST_EXIT=0===
```

**Uncertainty Declaration.** The DoD row requires the broad selftest to carry the
**new bridge canaries** (no forbidden authority, provider-absent honest unavailable,
`ownerModes` contract). No such canary exists:

```text
$ grep -n 'renderSimpleBridge\|ownerModes\|production bridge\|installSimpleProjectionBridge' scripts/selftest.mjs
(no matches)
```

The DoD item therefore remains `- [ ]`.

## Status

- **Status:** In Progress
- **Phase:** implement (increments 1-12 committed and pushed; HEAD `56099e24`)
- **Coverage:** 16 of 22 ordinary tools wired (15 module-backed in strict projection
  parity + `technical-analysis-decision-lab` as the intentional honest-`unavailable`)
- **Remaining:** 6 ordinary tools — `bond-regime-lab`, `volatility-sizing-lab`,
  `msft-july-print-model`, `company-fundamentals-lab`,
  `palm-springs-rental-market-lab`, `ocean-shores-rental-market-lab`
- **Blocked on an owner decision:** `bond-regime-lab` and `volatility-sizing-lab`
  require amendments to specs owned by certified-done Features 003 and 011;
  `msft-july-print-model` requires a decision on its deliberate shared-shell opt-out
- **Evidence:** TP-15-01, TP-15-02, TP-15-03 and TP-15-07 executed this session;
  TP-15-04 not implemented; TP-15-05 and TP-15-06 not started / reverted


