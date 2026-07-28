# Scope 15 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [design addendum](../../design-addendum-production-simple-wiring.md) | [scope index](../_index.md)

## Summary

Scope 15 (Production Simple-View Adapter Wiring, Model B) is **In Progress** and is
**not** Done.

The production bridge is delivered and proven, and **18 of the 22 ordinary tools are
wired** — 17 module-backed tools in strict projection parity plus
`technical-analysis-decision-lab`, which is registry-gated `declaredUnavailable` and
asserts the honest generic `MODULE_ABSENT_REASON` string via the integration test's
discriminator. That 18th tool is an **intended outcome, not a gap**: its registry
`limitations` entry explicitly requires the adapter to return `unavailable` until an
owner model exists (SCN-012-034 lock).

`market-brief` is excluded from ordinary Simple wiring **by design** — its registry
`experience.kind` is `market-action-center`, not an ordinary Simple/Power tool — so it
is not one of the 22.

**Four ordinary tools remain unwired**, each recorded below with its verified reason.
One is a deliberate architecture opt-out (`msft-july-print-model`); three were
attempted and **cleanly reverted** (`volatility-sizing-lab`,
`palm-springs-rental-market-lab`, `ocean-shores-rental-market-lab`). All four require an
owner decision or a shared-code extraction that this scope may not perform unilaterally.

Two Test-Plan ↔ implementation drifts (TP-15-03/TP-15-04 declared titles, TP-15-07
bridge canaries) remain **routed to `bubbles.plan`** and are deliberately not resolved
here. A third drift — a stale Implementation Files allowlist — is newly recorded under
[Change-Boundary Check](#change-boundary-check-all-12-commits), and a fourth — TP-15-05's
declared title being absent while the nearest existing BUG-003 test uses `page.route`
interception — is newly recorded as [D4](#d4--tp-15-05s-declared-title-does-not-exist-and-the-nearest-test-is-mocked).

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

## Final Verification Run — 2026-07-28, HEAD `fed8f9ab`

**Claim Source:** executed (2026-07-28, this session). Every command below was
re-executed from a clean tree; nothing in this section is carried over from an earlier
run. At capture time `git status --porcelain -- specs/012-market-action-center-and-guided-tools`
was empty, and the repo-wide tree was clean outside the unrelated concurrent
`specs/002|013|014` work.

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

### Coverage: 18 of 22 ordinary tools wired, 17 in strict projection parity

TP-15-02 derives the wired set from the production registry **and** the production
pages (never a hard-coded list), so this count cannot drift from reality. Its run log
from the re-run above:

```text
[TP-15-02] wired (18): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, technical-analysis-decision-lab
[TP-15-02] not wired (5): market-brief, msft-july-print-model, volatility-sizing-lab, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 17 of 18
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
```

Independently confirmed against the pages themselves — exactly 18 pages register the
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
waterfront-polo-lab.html
  -- count: 18
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

### The 18th wired tool is an intended outcome, not a gap

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

### The 4 remaining ordinary tools — each with its verified reason

None of these is done, and none is claimed as done. Each is an **outcome with a
recorded cause**, not an omission. `market-brief` is listed first for completeness even
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

#### 1. `volatility-sizing-lab` — BLOCKED (attempted, cleanly reverted)

Two independent problems.

**(a) Structural — verified at HEAD this session.** Its declared `adapterModule` is not
loaded by the page; the page loads only `rlvol.js`, so wiring additionally requires
adding the module `<script>`:

```text
$ python3 -c "…declared adapterModule vs what the page loads…"
  volatility-sizing-lab: declared adapterModule=rlexperience-adapters/market-structure.js | page loads it = False

$ grep -n 'rlexperience-adapters/\|rlvol.js' volatility-sizing-lab.html
652:    <script src="rlvol.js"></script>
```

**(b) Parity — the reverted attempt.** The wiring was implemented and then **reverted
on purpose**. It reached 19-wired but **failed TP-15-02 strict projection parity** —
`volatility-sizing-lab: bridge state matches the explicit runtime path` (actual !=
expected) — plus three unreconcilable spec failures in
`tests/volatility-sizing-lab.spec.mjs`:

- **BS-008** — `[data-regime-managed]` hidden
- **BS-009** — Playwright strict-mode violation: `[data-degraded="INSUFFICIENT_HISTORY"]`
  resolved to 2 elements
- **TP-02-04** — `#simpleView` not visible

**Root cause to record:** this tool's owner state is **live-data dependent**, so the
production bridge and the explicit runtime path **do not converge deterministically**.
The attempt was reverted to keep the tree green rather than relax the parity assertion
— weakening TP-15-02's strict-parity check to accommodate one tool would degrade the
guarantee for the other 17.

**Claim Source for (b): the reverted in-session attempt — NOT re-verifiable at HEAD,
because the change was reverted.** What *is* verifiable at HEAD this session is that
the revert is clean: the tool is absent from the `[TP-15-02] wired (18)` line, present
in `not wired (5)`, and `git status --porcelain` outside `specs/002|013|014` is empty.

The design addendum already classifies this tool's provider extraction as an **open**
implementation item (`design-addendum-production-simple-wiring.md:221`, "owner-parity /
provider extraction is an OPEN implementation item — 4 tools") and lists six native
`#simpleView` assertion sites needing relocation (`:258` → `:74,:75,:80,:95,:161,:281`).

#### 2. `msft-july-print-model` — NOT APPLICABLE (deliberate shared-shell opt-out)

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

#### 3 & 4. `palm-springs-rental-market-lab` and `ocean-shores-rental-market-lab` — BLOCKED (attempted, cleanly reverted)

**Claim Source: executed (2026-07-28, this session).** Unlike the other 18, **neither
page loads a per-tool adapter module at all** — the owner computation lives in the
**shared `RLRENTAL` engine** (`rlrental.js`):

```text
$ python3 -c "…declared adapterModule vs what the page loads…"
  palm-springs-rental-market-lab: declared adapterModule=rlexperience-adapters/property-research.js | page loads it = False
  ocean-shores-rental-market-lab: declared adapterModule=rlexperience-adapters/property-research.js | page loads it = False

$ grep -n 'rlexperience-adapters/\|rlrental' palm-springs-rental-market-lab.html ocean-shores-rental-market-lab.html
palm-springs-rental-market-lab.html:886:    <script src="rlrental.js"></script>
ocean-shores-rental-market-lab.html:877:    <script src="rlrental.js"></script>
```

Wiring therefore requires a named provider **EXTRACTION from shared code**. That could
not be done without either **editing the shared `RLRENTAL` engine** or **duplicating a
formula** into the page/provider — **both forbidden** by this scope's Formula-ownership
rule ("no formula is copied into `rlexperience.js`, JSON, another adapter, or a test
helper"). The attempt was therefore reverted.

```text
$ grep -n 'OPEN implementation item' specs/.../design-addendum-production-simple-wiring.md
221:(owner-parity / provider extraction is an OPEN implementation item) — 4 tools:**
226:| 20 | `palm-springs-rental-market-lab` | … | shared rental engine `RLRENTAL.mountRoute`. Page does **not** load `property-research.js`. …
227:| 21 | `ocean-shores-rental-market-lab` | … | shared rental engine `RLRENTAL.mountRoute`. Same as palm-springs. |
```

**Additional risk to note:** `tests/palm-springs-rental-market-lab.spec.mjs` (29 tests)
is the **GitHub Pages deploy gate**, so a regression here breaks deployment, not just
CI. That makes this the highest-risk of the four:

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
| 4. Remaining delegating tools in adapter-module batches | **Partially complete** — 17 of the 18 delegating tools wired across `9a713001`…`fed8f9ab`; only `msft-july-print-model` outstanding (deliberate shell opt-out, reason 2 above) |
| 5. Reconcile the 8 `#simpleView` tools + BUG-003 regression | **Partially complete** — 6 of the 8 `#simpleView` pages are wired (`bond-regime`, `etf-momentum`, `gamma-trading`, `intraday-tape`, `sector-research`, `swing-structure`), and `bond-regime`'s spec was reconciled to the shell in `fed8f9ab`. The 2 unwired `#simpleView` pages (`msft-july-print-model`, `volatility-sizing-lab`) are blocked per reasons 1-2; `tests/volatility-sizing-lab.spec.mjs` and `tests/msft-july-market-refresh.spec.mjs` remain unmodified. **No BUG-003 closure is claimed in this report** — see TP-15-05 |
| 6. Handle the 4 non-delegating tools | **Partially complete** — `technical-analysis-decision-lab` done (intentional registry-gated honest-`unavailable`, `ab1d4879`); the three provider extractions (`volatility-sizing`, `palm-springs`, `ocean-shores`) attempted and reverted (reasons 1, 3, 4) |
| 7. `scripts/selftest.mjs` bridge canaries | **Outstanding** — the broad suite is 0-fail (952 passed), but no bridge canary exists (`grep` for `renderSimpleBridge` / `ownerModes` / `installSimpleProjectionBridge` in `scripts/selftest.mjs` returns nothing) |

## Known Drift — Routed to `bubbles.plan` (NOT resolved here)

Deliberately left open. Closing a DoD row against a persistent test title that does not
exist would be fabrication.

### D1 — TP-15-03 and TP-15-04 declared titles do not exist in the suite

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

### D2 — TP-15-07 bridge canaries are absent from `scripts/selftest.mjs`

```text
$ grep -n 'renderSimpleBridge\|installSimpleProjectionBridge\|ownerModes\|production bridge' scripts/selftest.mjs
   (NO MATCHES — no bridge canary exists in selftest.mjs)
```

The 0-fail preservation half of TP-15-07 is met (952 passed / 0 failed); the "new
bridge canaries" half is not. Owned by `bubbles.plan` (Implementation Plan step 7).

### D3 — Implementation Files allowlist is stale (newly recorded)

Five delivered paths fall outside the scope's declared allowlist — see
[Change-boundary check](#change-boundary-check-all-scope-15-commits-re-verified-at-head-fed8f9ab).
Owned by `bubbles.plan`.

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

## Evidence Anchors

- [`tp-15-01`](#tp-15-01) — **partial**: executed and green (5/5, exit 0), but the file carries no `ownerModes` or forbidden-authority assertion, so the DoD item stays unchecked
- [`tp-15-02`](#tp-15-02) — **satisfied**: executed and green (6/6, exit 0), exact file/command/title match
- [`tp-15-03`](#tp-15-03) — **partial**: a passing market-heatmap real-adapter-panel e2e exists, but its persistent title differs from the Test Plan row and the "control recomputes" half lives in another file (drift D1)
- [`tp-15-04`](#tp-15-04) — **not implemented**: the declared persistent title does not exist in the repo (drift D1)
- [`tp-15-05`](#tp-15-05) — **executed, still not satisfied**: `tests/bond-regime-lab.spec.mjs` was run this session (27/27, exit 0) and `bond-regime-lab` is wired with its spec reconciled, but the declared persistent title does not exist AND the nearest existing BUG-003 test uses `page.route` interception, so it cannot close a live `e2e-ui` row (drift D4)
- [`tp-15-06`](#tp-15-06) — **not satisfied**: `volatility-sizing-lab` unwired at HEAD after a cleanly reverted attempt
- [`tp-15-07`](#tp-15-07) — **partial**: broad suite is 952 passed / 0 failed (exit 0), but the new bridge canaries do not exist (drift D2)

## Completion Statement

Scope 15 is **In Progress** and is **not** Done. The production bridge is delivered and
proven; **18 of 22 ordinary tools are wired, 17 in strict projection parity**, with the
18th (`technical-analysis-decision-lab`) an intended registry-gated honest `unavailable`
rather than a gap. **Four ordinary tools remain unwired**, each blocked by an
architecture opt-out, live-data nondeterminism, or a forbidden shared-engine formula
extraction — all requiring an owner decision this scope may not take unilaterally.
`market-brief` is excluded by design and is not one of the 22.

Two Test Plan rows (TP-15-04, TP-15-06) have no passing evidence under their declared
contract, four rows (TP-15-01, TP-15-03, TP-15-05, TP-15-07) are executed-and-green but
still unsatisfied against their DoD text, and four drifts (D1, D2, D3, D4) are routed to
`bubbles.plan`. **Of the 14 DoD items, 4 are checked and 10 remain open** — none of the
10 could be honestly closed against executed evidence. **No completion of the scope, and
no completion of Feature 012, is claimed.**

## Test Evidence

### TP-15-01

**Command:** `node --test tests/simple-production-bridge.unit.mjs`
**Claim Source:** executed (2026-07-28, this session)
**Result:** PASSED (5/5, exit 0) — full raw output under
[Command 2](#command-2--tp-15-01-unit). See the uncertainty note below.

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
**Claim Source:** executed (2026-07-28, this session)
**Result:** PASSED (6/6, exit 0). **Exact match to the Test Plan row** — the file, the
command, and all six persistent titles exist and pass, including the registry-derived
loop and the owner-parity assertion. Full raw output under
[Command 1](#command-1--tp-15-02-integration). Key derived facts from that run:

```text
[TP-15-02] wired (18): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, technical-analysis-decision-lab
[TP-15-02] not wired (5): market-brief, msft-july-print-model, volatility-sizing-lab, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 17 of 18
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
ℹ pass 6
ℹ fail 0
===TP1502_EXIT=0===
```

This is the **only** DoD test-evidence row that is checked.

### TP-15-03

**Command:** the 5-spec Simple-adapter / production-wiring batch.
**Claim Source:** executed (2026-07-28, this session)
**Result:** PASSED (27/27, exit 0) — full raw output under
[Command 4](#command-4--simple-adapter--production-wiring-playwright-batch-5-specs-system-chrome).
The Test Plan row's persistent title does not match the repo, so the DoD item stays
unchecked.

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

**Claim Source:** executed (2026-07-28, this session).
**Result:** SPEC GREEN 27/27 exit 0 — but the DoD row stays `- [ ]` on two independent
disqualifiers.

`tests/bond-regime-lab.spec.mjs` was executed this session — the first executed
evidence this row has ever carried:

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

**Claim Source:** not-run at HEAD — attempted in-session and deliberately reverted.
**Result:** NOT SATISFIED.

See "The 4 remaining ordinary tools → 1. `volatility-sizing-lab`" above for the full
record: the TP-15-02 strict projection-parity failure (`volatility-sizing-lab: bridge
state matches the explicit runtime path`), the three unreconcilable spec failures
(BS-008, BS-009, TP-02-04), and the live-data-dependency root cause. The tool is
unwired at HEAD and the revert is clean. The DoD item remains `- [ ]`.

### TP-15-07

**Command:** `node scripts/selftest.mjs`
**Claim Source:** executed (2026-07-28, this session)
**Result:** 952 passed / 0 failed, exit 0 — the 0-fail preservation half of the DoD
row is met; the "new bridge canaries" half is not. Full raw output (verbatim tail
excerpt of the captured 1030-line run) under
[Command 3](#command-3--tp-15-07-broad-selftest).

```text
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

- **Status:** In Progress (scope); `blocked` recorded in `state.json` — the four
  remaining tools are genuine architecture/operator decisions, not pending agent work
- **Phase:** implement (increments committed and pushed; HEAD `fed8f9ab`)
- **Coverage:** **18 of 22 ordinary tools wired** — 17 module-backed in strict
  projection parity + `technical-analysis-decision-lab` as the intended registry-gated
  honest `unavailable`
- **Remaining (4 ordinary tools):**
  - `msft-july-print-model` — NOT APPLICABLE: deliberate shared-shell opt-out
    (`window.__rlviewsInit = 1`); the bridge never runs
  - `volatility-sizing-lab` — BLOCKED: strict projection-parity divergence from a
    live-data-dependent owner state; attempted and cleanly reverted
  - `palm-springs-rental-market-lab`, `ocean-shores-rental-market-lab` — BLOCKED:
    require a named provider extraction from the shared `RLRENTAL` engine, which cannot
    be done without editing shared code or duplicating a formula (both forbidden);
    attempted and cleanly reverted. `palm-springs` is the GitHub Pages deploy gate
- **Excluded by design:** `market-brief` (`experience.kind = market-action-center`)
- **Open drift routed to `bubbles.plan`:** D1 (TP-15-03/TP-15-04 titles), D2 (TP-15-07
  canaries), D3 (stale Implementation Files allowlist), D4 (TP-15-05 title absent +
  nearest BUG-003 test is mocked)
- **Evidence:** TP-15-01, TP-15-02, TP-15-03, TP-15-05 and TP-15-07 executed this
  session (all exit 0); TP-15-04 not implemented; TP-15-06 reverted. Only **TP-15-02**
  is closed as a DoD item — **4 of 14 DoD items checked, 10 open**


