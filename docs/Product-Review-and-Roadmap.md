# Research Lab — Product Review & Delivery Roadmap

**Date:** 2026-08-02 · **Type:** historical product review + shipped executable roadmap (sixth pass) · **Scope:** whole product
**Method:** line-by-line source reading, registry↔disk diffing, payload/ledger reduction, `node scripts/selftest.mjs`
(1,138 passed / 0 failed, exit 0). Every number is re-measured at HEAD `64ff26e6` unless marked *derived*.
**Related:** [`Improvement-Plan.md`](Improvement-Plan.md) · [`DomainModel.md`](DomainModel.md) ·
[`Product-Principles.md`](Product-Principles.md) · [`../notes/market-brief.md`](../notes/market-brief.md)

## Current status notice — 2026-08-12

This document preserves the 2026-08-02 review and its dated corrections. Its §11 roadmap is shipped history.
The steps in [`Improvement-Plan.md`](Improvement-Plan.md) are historical delivery provenance. Current action order
lives in the [release action ledger](releases/improvement-plan/actions.md).

**Claim source:** release-owner measurements dated 2026-08-12 and the linked action ledger.

| Current surface | Release baseline |
|---|---|
| Live inventory | **25** registry entries, **52** journey definitions, and **67** steps. The browser audit covers **25/25** pages with zero errors or leaks. |
| Planned inventory | Four future registered surfaces yield an eventual **29**. Features 016 and 020 extend existing tools and do not increase that count. |
| Current measurements | Use the `Current execution rebaseline — 2026-08-12` in [`Improvement-Plan.md`](Improvement-Plan.md). Historical counts in this review remain labeled by their measurement date. |
| Current order | Follow A01–A13 in the release action ledger. Respect active ownership in Features 007 and 008. |

> **Supersession note.** The fifth-pass edition of this document described a pre-Step-1 product. Steps 1–9 of
> its own roadmap have since shipped (commits `393f543e`, `f806d99f`, `ab309151`, `57e9f713`, `fcfba7db`,
> `6f913ad3`, `3c4919fc`, `fc83365e`, `0aa884da`). §5 below now records each original finding with its
> **measured** disposition, and §5N records the frontier those fixes exposed. Nothing here is carried
> forward on trust.

---

## 1. Historical verdict at the 2026-08-02 baseline

**The nine-step roadmap landed. The security defect, the coverage gap, the unscored ledger, the unbounded
payload and the unreachable assets are all closed and asserted. What the fixes exposed is a deeper and more
interesting problem: the product now measures itself honestly, and the honest measurement says it is mostly
blind.**

| | Measured at historical HEAD | Meaning |
|---|---|---|
| **1** | **0** unescaped LLM-content sinks; **26/26** pages carry a CSP | The credential path is shut and asserted |
| **2** | **11 of 23** tools feed the brief with live evidence (was 5) | The original coverage target is met; **5** tools remain `stale` |
| **3** | **180** recommendations closed — but **150 of them (83%)** are `not-evaluable` | The ledger closes calls it cannot actually score |
| **4** | The public watchlist matrix has **0 covered cells** of 24 applicable | The watchlist never reaches the tools; the Portfolio view is an empty grid |

Item 1 is done. Item 2 is a finite wiring list. **Items 3 and 4 are the same problem seen from two ends:**
nothing produces a *level-bearing, per-ticker* fact, so the matrix has nothing to show and the ledger has
nothing to check. That is the subject of §16 and of [`Improvement-Plan.md`](Improvement-Plan.md).

---

## 2. What existed at the 2026-08-02 baseline

### 2.1 Inventory

| Surface | Count / size | State |
|---|---|---|
| Registered tools ([`../tools.json`](../tools.json)) | 23 | all `live`, all carry a `group` |
| Tool pages on disk | 25 (+ `index.html`) | 2 unregistered — now **accounted** in [`../site-exclusions.json`](../site-exclusions.json) |
| Declared model contracts ([`../simple-models.json`](../simple-models.json)) | **23 / 23** | complete |
| Shared adapters ([`../rlexperience-adapters/`](../rlexperience-adapters)) | 7 modules | UMD dual-module, Node-loadable |
| User journeys ([`../journeys.json`](../journeys.json)) | **48 definitions / 48 steps** | mounted and reachable on **23 of 23** tool pages |
| Playwright specs | **33** files | CI runs the **full** suite, blocking |
| Selftest assertions | **1,138** | pass, exit 0; CI runs **all** of them, blocking |
| Committed market data | **289** daily-bar files, **22** option chains | same-origin, keyless |
| Brief runs to date | **120** (sharded) | 4×/day, now on a GitHub Actions clock |
| Recommendation events | **849** across 189 distinct calls | 180 closed, **9 open** |
| Brief first-load payload | **159 KB** (budget 200 KB) | budget is a failing test |
| `specs/` lifecycle | 16 features + 6 bugs | 5 `done`, 1 `specs_hardened`, 5 `in_progress`, 4 `blocked`, 1 `not_started` |

### 2.2 Architecture — the parts that are right

- **UMD dual modules.** Adapters and shared libs export `module.exports` *and* attach a global. They run in
  Node and in the browser and preserve `file://` operation (ES modules would not — they are CORS-gated). This
  is the correct pattern and must be preserved.
- **Declarative model contracts.** All 23 tools declare `adapterId`, `adapterModule`, `parameterDefinitions`,
  `inputRequirements`, `resultSchemaId`, `provenancePolicy`, `calibrationPolicy`, `limitations`,
  `deepLinkTargets`.
- **Generic publication chain.** [`../scripts/brief-distributed-publish.mjs`](../scripts/brief-distributed-publish.mjs)
  line 184 keys purely off `hasOwnProperty(toolReads, toolId)` — adding one tool read upgrades that tool
  end-to-end with **zero** downstream change.
- **Provenance as a first-class type.** `allowedClasses = [observed-fact, user-assumption, model-estimate,
  unavailable]` with `requireEvidenceCutoff: true`, across all 23 definitions.
- **Declared numeric budgets.** [`../tool-experience.config.json`](../tool-experience.config.json):
  `validationMaxMs 100`, `interactionMaxMs 100`, `localRecomputeMaxMs 250`, `layoutShiftMax 0.1`,
  `cooperativeChunkMaxMs 16`, plus artifact byte budgets.
- **Locked supply chain.** [`../.npmrc`](../.npmrc) pins the registry with `save-exact=true`,
  `package-lock=true`, `ignore-scripts=true`, `replace-registry-host=never`; lockfile committed; CI runs
  `validate-node-source-lock.mjs`. Stronger than most projects of any size.
- **Keyless-by-default data path.** `rldata.js` `pagesBars()` serves committed same-origin snapshots
  (`data/bars/<SYM>.json`, 289 symbols; 23 option chains) with no CORS, proxy or key — tried before any keyed
  provider. **11 of 23 registered tools** hydrate through it.
- **Gated publication.** `brief-refresh-and-push.sh` runs `validate-brief-payload.mjs` and restores the owned
  baseline on failure, so a malformed run cannot publish.
- **Serious data engineering.** ET date+window cache keys, XNYS-calendar session verification,
  `zero-observed` / `thin-observed` session states, dividend/split fail-closed handling, no duplicate history
  requests across windows.

---

## 3. User scenarios

### 3.1 The user

One self-directed investor running a small book ([`../watchlist.json`](../watchlist.json): QQQ, SPMO, VGT,
MSFT), making **discretionary allocation decisions**, with limited attention, a strong aversion to being sold
to, and an AI agent doing real research four times a day.

### 3.2 The three jobs

| Job | Question | Owned by | Status |
|---|---|---|---|
| **Attention** | What changed that I should act on? | the brief | partial — 5/23 evidence |
| **Depth** | Why? show me the working | the 23 tools | strong |
| **Feedback** | *Was I right?* | nothing | **absent** |

### 3.3 The 48 designed journeys — reachable, and now scoped

[`../journeys.json`](../journeys.json) defines 48 concrete goals, roughly two per tool. They are well-chosen
and specific:

| Area | Journeys |
|---|---|
| Session prep | *Prepare the next market session* · *Triage market actions* · *Investigate latent risk* |
| Structure | *Classify the current session* · *Classify trend, range or reversal* · *Define a level trigger and invalidation* |
| Options | *Map option-implied support and resistance* · *Evaluate a gamma-flip setup* · *Stress option walls and gamma flip* |
| Rotation | *Identify a sector transition* · *Decide whether leadership is broad or narrow* · *Select an ETF research vehicle* |
| Validation | *Decide whether an edge survives* · *Explain an out-of-sample failure* · *Test ETF ranking robustness* |
| Risk | *Explain the volatility throttle* · *Investigate an estimator conflict* · *Stress FX and risk penalties* |

> **Correction (measured at HEAD).** Earlier passes of this document said *"None is reachable. No page carries
> the `[data-rljourney-mount]` anchor."* **That was a measurement error on my part, not a product defect.** It came
> from grepping the HTML for a static `<script src="rlviews.js">` tag, which finds 2 pages. But
> [`../rlapp.js`](../rlapp.js) line 339 loads the view shell *dynamically* via `ensureSharedScript`, so the anchor
> is created at runtime on every page. A static grep cannot see that; a browser can.
>
> Re-measured with [`../scripts/audit-reader-legibility.mjs`](../scripts/audit-reader-legibility.mjs), which renders
> each page in Chrome and activates each view:
>
> | Surface | Views reachable | Journey rows / goals shown |
> |---|---|---|
> | 23 of 23 tool pages | `Simple · Power · Brief · Journey` | **1 row / 2 goals** — that tool's own |
> | `market-brief.html` (Action Center) | + `Portfolio · Red Alert` | **23 rows / 48 goals** — the whole catalogue |
>
> Journeys were always reachable. What was genuinely wrong is that *every* page showed *all 23 tools' journeys*,
> so a reader on one tool was handed the entire catalogue instead of that tool's two goals. Fixed in `e0bed8cd`
> by scoping the chooser to the current tool and keeping the global list on the Action Center only.

Note *"Define a level trigger and invalidation"* — that journey is the exact input the recommendation ledger
needs. The pieces were designed to fit; they were never connected. **That connection is still missing** and is
the subject of §5.3 and of the recommendation-evaluability work in [`Improvement-Plan.md`](Improvement-Plan.md).

### 3.4 The scenario that does not exist

There is no journey, page or surface for **"show me how right this thing has been."** That absence is the
product's largest gap and the subject of §5.3.

---

## 4. Is this the right problem, solved the right way?

**Right problem — yes.** [`../notes/market-brief.md`](../notes/market-brief.md) §0 states it precisely: *"The
brief is a cockpit, not another analysis tool. It answers exactly one question — what changed that I should act
on, and what's coming? — and deep-links every why to the tool that already owns it."* Competitors confirm the
demand: SpotGamma's *Founder's Note* is cited as its most popular product; Unusual Whales ships a daily AI brief.

**Right architecture — yes.** See §2.2. The no-duplication deep-link law is a design most competitors get wrong.

**Solved holistically — no.** The loop is open in three places:

1. **Evidence does not reach the cockpit** — 18 of 23 tools cannot feed it (§5.2).
2. **Claims are never checked** — 215 proposals, 0 outcomes (§5.3).
3. **Scenarios never reach the user** — 48 journeys, 0 mounted (§3.3).

The system generates analysis, publishes opinions, and learns nothing. **A brief without feedback is opinion
with extra steps.**

### The reframing

> **Research Lab is a closed-loop decision journal for a discretionary investor.**
> It says **what changed**, shows **why**, records **what it claimed**, and **scores itself in public.**

This resolves most open product questions at once:

- The 23 tools become **evidence sources**. "Is this tool good?" becomes measurable: *does its read improve
  brief calibration?*
- The brief becomes a **hypothesis generator**, not a newsletter.
- The **ledger becomes the product.**
- Every future feature faces one admission test: **does it improve decision quality, or the measurement of
  decision quality?** That single test retires most of the 1,678 open DoD items without further debate.

---

## 5. Defect register

Ordered by product impact. Every row is measured.

> **Status pass — 2026-08-03.** Every row below is preserved as its **original point-in-time
> finding**; no analysis has been removed or softened. Each row now opens with a `Status` line
> recording whether the defect still holds as of that date. `RESOLVED` and `OPEN` cite the file,
> line, or command output actually read or run; `UNVERIFIED` means the row was **not** re-measured
> in this pass and must not be read as either. Where a `Status` line contradicts a count, line
> number, or size in the prose beneath it, **the `Status` line is the current fact** and the prose
> is the as-measured-then record. All citations below were confirmed present at committed `HEAD`.

### 5.1 · LLM-authored content reaches `innerHTML` unescaped — **critical**

**Status: RESOLVED** *(2026-08-03)* — both halves are closed. The sink is escaped:
`renderExperimental()` now sits at [`../market-brief.html`](../market-brief.html) line 886 and its
`innerHTML` assignment at line 894 reads `esc(x.title || "")` … `esc(x.note || "")`
(`git grep -n 'esc(x.title' HEAD -- market-brief.html`), with `esc()` defined at line 856. The
*"no defence in depth"* half is closed too: a `Content-Security-Policy` `<meta>` is present on
**26 of 26** root pages (this row measured 0 of 26). The rule is now constitutional —
[`../.specify/memory/constitution.md`](../.specify/memory/constitution.md) **BI-7**: *"Model text is
data, never markup. Model-authored text is escaped at every rendering sink."*

[`../market-brief.html`](../market-brief.html) line 785, `renderExperimental()`:

```js
var xs = (PAYLOAD && PAYLOAD.experimental) || [];
host.innerHTML = xs.map(function (x) {
  return '<div class="acard"><b>' + (x.title || "") + '</b><div class="ay">' + (x.note || "") + '</div></div>';
}).join("");
```

`x.title` and `x.note` are **not escaped**. `PAYLOAD.experimental` is authored by the Tier-B Copilot lanes and
currently holds one entry with multi-paragraph `title`, `note` and `method` prose.

This is a **single outlier in an otherwise correct codebase** — `esc()` exists at
[`../rlbrief.js`](../rlbrief.js) line 613 and at `market-brief.html` line 896, and the main renderers apply it
properly (`renderAttention` escapes `title`, `what`, `why`, `domain`; `rlbrief.js` has 66 `esc()` calls across
21 `innerHTML` sites). A sweep of every page and shared library found **exactly one** unescaped LLM-content
sink — this one.

**Why it matters here, specifically:**

| Link in the chain | Evidence |
|---|---|
| Content is model-authored | Tier-B lanes generate `experimental`; web fetch enabled against an allowlist |
| It reaches `innerHTML` unescaped | `market-brief.html:785` |
| The origin stores provider API keys | `localStorage.rlProviderConfig` → `{ keys }`, [`../rldata.js`](../rldata.js) lines 117–123 |
| No defence in depth | **0 of 26** pages set a Content-Security-Policy |

Same-origin script can read the key store. Prompt injection via an allowlisted fetched page is the plausible
delivery vector; a model merely emitting `<` is the mundane one. **Even ignoring security, this is a rendering
bug** — any `<` or `&` in analysis prose renders as broken markup today.

**Compounding (§5.8):** BUG-002 sanctioned `localStorage` key storage on an explicit isolation argument —
*"local keys live only in `localStorage.rlProviderConfig` of the user's own browser"*. That argument holds only
if the origin has no script injection. This defect breaks the premise the storage decision was approved on.

### 5.2 · 18 of 23 tools are structurally invisible to the brief — **critical**

**Status: RESOLVED** *(2026-08-03)* — every measured claim in this row is now false.
`node scripts/brief-refresh.mjs --dry-run` reports
`coverage: 8 browser-or-agent-read · 13 fresh-headless · 2 unavailable` (was 5 / 11 / 7). All seven
tools in the table below are reached headlessly: gamma-trading, options-structure, swing-structure,
intraday-tape, market-heatmap and volatility-sizing publish substantive reads, and
`technical-analysis-decision-lab` publishes an **honest unavailable** (*"the owner five-gate model
… is not implemented … `ownerReadPublished:false`"*) rather than being narrated around — the wiring
gap is closed, the owner model is a separate, still-absent thing. Three adapters not in the table
(options-flow-feed, ai-capex-strategy, bond-regime) also publish. The *"exactly one adapter"* claim
is gone: [`../scripts/brief-refresh.mjs`](../scripts/brief-refresh.mjs) calls `OWNER.loadAdapter` at
11 sites across **5 distinct modules** (`options.js`, `fundamental-models.js`, `macro-rotation.js`,
`market-structure.js`, `rlvol.js`); 8 of those call sites exist at `HEAD`. **Residual:** 8 tools are
still `browser-or-agent-read`, so the category this row named survives — it is no longer the
majority.

Current run: **5 analyzed · 11 stale · 7 not-relevant.** Every tactical tool is `stale`: gamma, options
structure, intraday tape, swing structure, heatmap, technical-decision, volatility sizing.

"Stale" understates it. [`../scripts/brief-refresh.mjs`](../scripts/brief-refresh.mjs) line 1175 falls back to
`'browser-or-agent-read'`, but browser reads are written to **`localStorage`** ([`../rldata.js`](../rldata.js)
line 445) and no path exports them into the Node pipeline. Those tools are **permanently unreachable** by the
scheduled run; the hedged "STALE THIS WINDOW" prose is an LLM narrating around a wiring gap. The system
hardcodes this in its own comment ([`../scripts/brief-distributed-publish.mjs`](../scripts/brief-distributed-publish.mjs)
line 12): *"the 5 tools that carry a server-side Tier-A read…"*.

**The gap is small and fully verified:**

| Tool | Adapter (exists, Node-loadable) | Exported entry point | Data on disk |
|---|---|---|---|
| `gamma-trading-lab` | `options.js` | `computeGammaPlaybookSummary` | **8 / 8** chains |
| `options-structure-lab` | `options.js` | `computeSurfaceSummary`, `computeSurfaceFlipLevel` | **4 / 4** chains |
| `swing-structure-lab` | `market-structure.js` | `computeSwingTransitionSummary` | **7 / 7** bars |
| `intraday-tape-lab` | `market-structure.js` | `computeSessionAuctionSummary` | **7 / 7** bars |
| `technical-analysis-decision-lab` | `market-structure.js` | `computeTechnicalFiveGateSummary` | bars present |
| `market-heatmap-lab` | `market-structure.js` | breadth / structure primitives | 289 bars |
| `volatility-sizing-lab` | `market-structure.js` | `regimeBand`, vol primitives | bars present |

Adapters ✅ · Data **100 %** ✅ · Publish chain generic ✅ · **Missing: the wiring.**
[`../scripts/brief-refresh.mjs`](../scripts/brief-refresh.mjs) `featureRequire`s exactly **one** adapter
(`macro-rotation.js`, line 1096) — which is why 4 of the 5 working reads come from that single module.

**Knock-on:** the shipped `red-alert-policy/v1` (score ≥ 75, `minIndependentOrigins: 2`, `minOwnerEvidence: 1`)
is starved by the same gap — a risk-alert engine that is implemented but cannot reach quorum.

### 5.3 · The system proposes and never scores — **critical**

**Status: RESOLVED** *(2026-08-03)* — the loop closes. Counting every row in
`briefs/history/recommendations/*.jsonl` (864 rows across `2026-07.jsonl` and `2026-08.jsonl`):
`proposed` 464 · `body-restored` 220 · **`not-evaluable` 150 · `satisfied` 16 · `invalidated` 14** —
**180 closure events**, against 0 when this row was written. `reduceRecommendationEvents` now has
real production callers, not just tests:
[`../scripts/evaluate-recommendations.mjs`](../scripts/evaluate-recommendations.mjs) line 245,
invoked by [`../.github/workflows/tier-a.yml`](../.github/workflows/tier-a.yml) line 110 and
[`../scripts/brief-refresh-and-push.sh`](../scripts/brief-refresh-and-push.sh) line 239.
`market-brief.scorecard.json` exists (12,049 B). **Residual:** 150 of the 180 closures are
`not-evaluable`, so the realised-outcome sample is 30, not 180; and `briefs/objects/resolutions/`
does not exist, so Spec 015's resolution-object contract has not landed.

```
briefs/history/recommendations/2026-07.jsonl    579 rows
  proposed                                       384
  body-restored                                  195
  satisfied / invalidated / expired / withdrawn / unresolved / not-evaluable      0
```

Recommendation **bodies are now durable** — `scripts/recommendation-body.mjs` and
`scripts/backfill-recommendations.mjs` capture instrument, direction, levels, trigger and invalidation, and 195
historical calls have been recovered from git. The evidence problem is solved.

**The scoring problem is not.** Not one call has ever been closed. The lifecycle vocabulary
([`../rlcontracts.js`](../rlcontracts.js) line 720 `CLOSE_EVENT_TYPES`) and the reducer (line 1134
`reduceRecommendationEvents`) exist and are tested. **Their only callers are `scripts/selftest.mjs` and two test
files — zero production callers.**

Every recommendation carries `trigger`, `invalidation`, `levels`, `confidence`, and now a durable body.
**Every input the scorer needs is present and unused.**

### 5.4 · ~1.05 MB deployed but undiscoverable — **high**

**Status: RESOLVED** *(2026-08-03)* — "deployed" no longer holds, and the one *"not mounted"* row is
now genuinely mounted. [`../site-exclusions.json`](../site-exclusions.json)
(`pages-site-exclusions/v1`) registers **8 of the 10 paths** in the table below — both HTML pages,
`rlfx.js`, `fx-regime-universe.json`, `rlcausal.js`, `rlportfolio.js` and the two causal data files
— each with a recorded reason; `scripts/build-pages-site.mjs` refuses unregistered root HTML, and
[`../scripts/selftest.mjs`](../scripts/selftest.mjs) line 1716 asserts the exclusion holds.
`journeys.json` (117,975 B) is fetched by `market-brief.html`, and `rljourney.js` (79,794 B) is
loaded by [`../rlapp.js`](../rlapp.js) line 634 via `ensureSharedScript` — a real production
consumer. The `rlcausal.js` clause stands exactly as written: **no `<script src>` on any root page**
(the only reference is the test fixture `tests/fixtures/causal-rotation/foundation-harness.html`) —
but it is now a *declared* exclusion rather than a silent one. **Not verified:** the live Pages HTTP
status. This is the build plan plus the in-repo consumers, not a fetch of the deployed site.

| Asset | Size | Live? | In any registry? |
|---|---|---|---|
| `trend-dynamics-cycle-lab.html` | 305 KB / 3,500 lines | HTTP **200** | no (0 of 5) |
| `journeys.json` + `rljourney.js` | 179 KB / 48 journeys | — | not mounted |
| `portfolio-survival-allocation-lab.html` | 49 KB / 1,201 lines | HTTP **200** | no (0 of 5) |
| `rlfx.js` + `fx-regime-universe.json` | 119 KB | — | no page exists |
| `rlcausal.js` + observations | 83 KB | — | no `<script src>` anywhere |

The project's own constitution principle *No Dead Code* already forbids this state.

### 5.5 · Two contradictory Sharpe conventions in the flagship data path — **high**

**Status: RESOLVED** *(2026-08-03)* — `rlmetrics.js` is now the single definition of both
conventions, and both are published rather than silently chosen.
[`../scripts/brief-refresh.mjs`](../scripts/brief-refresh.mjs) `oneYearWindowMetrics` (line 1167)
returns **both** `sharpe` (`RLMETRICS.sharpeArithmetic`) and `sharpeGeometric`, under the inline
comment *"publishing both ends the ambiguity without silently re-ranking the funds"*; line 1202
emits `sharpeGeometric`, `sharpeArithmetic` **and** `volatilityDrag` per fund.
`etf-momentum-lab.html` loads `rlmetrics.js` at line 1365 under the comment *"rlmetrics.js is the
SINGLE definition of Sharpe"*, computes `RLMETRICS.volatilityDrag(r, ANN)` at line 1568, and
**displays** it — line 2572 renders `volatilityDragApprox`, and the Sharpe tooltip at line 2581
states *"the gap is the volatility drag."* `rlexperience-adapters/strategy-research.js` lines
168-169 now delegate to `RLMETRICS.annualizedVol` / `RLMETRICS.sharpeArithmetic` instead of the
private `Math.sqrt(ANN)` form quoted below. *"Displayed in none"* is no longer true.

```js
scripts/brief-refresh.mjs:1090    sharpe: (cagr - riskFree) / annVol             // geometric → feeds the brief
etf-momentum-lab.html:1568        annVol > 0 ? (cagr - state.rf) / annVol        // geometric
rlexperience-adapters/strategy-research.js:163
                                  sd > 1e-9 ? (mean / sd) * Math.sqrt(ANN) : 0   // arithmetic
```

Same asset, two answers, path-dependent. Separately, `etf-momentum-lab.html:1605` holds `cagr` **and**
`annArith` in one object and never subtracts them — volatility drag is depended on by four tools and displayed
in none.

### 5.6 · Unbounded flagship payload — **high**

**Status: RESOLVED** *(2026-08-03)* — the payload is bounded and the unbounded log is no longer
fetched. `market-brief.html` contains **zero** references to `brief-history.jsonl`; line 997 fetches
`brief-history.recent.jsonl` instead — *"the BOUNDED window (last 30 runs, compact projection)"* —
measured at 10,106 B / 30 rows. The whole first load across all seven files is **155,029 B
(151 KB)**. `scripts/shard-brief-history.mjs` shards the append log into `briefs/tier-a/2026-07.jsonl`
+ `2026-08.jsonl` and never rewrites it.
[`../scripts/selftest.mjs`](../scripts/selftest.mjs) enforces a `briefFirstLoadMaxBytes` budget and
carries the adversarial half that makes the budget bind: the append log — now 2,866,445 B
(2799 KB), grown from the 2,369,626 B measured below — *"genuinely exceeds the budget … so fetching
it would FAIL this test rather than slip through."*

`GET /brief-history.jsonl` → HTTP 200, **2,369,626 B**, fetched in full by
[`../market-brief.html`](../market-brief.html) line 864 on every page load. 107 runs × 22,146 B/run × 4 runs/day
⇒ **~30 MB after one year** *(derived)*. No cap, no rotation, no windowing.

### 5.7 · Direction undocumented, enforcement unwired — **high**

**Status: RESOLVED** *(2026-08-03)* — all three bullets. The constitution is no longer the bootstrap
template: **neither quoted string survives** (`double-charges`, `TODO: Replace examples…`), and
[`../.specify/memory/constitution.md`](../.specify/memory/constitution.md) now carries nine
project-specific **Business Invariants** (BI-1…BI-9 — provenance, missing-is-missing, tickers-only,
misses published with equal prominence, append-only record), a Model Compensations table, and the
D2/D3/D11/D12 architecture constraints. [`Product-Principles.md`](Product-Principles.md) exists. CI
is wired: [`../.github/workflows/pages.yml`](../.github/workflows/pages.yml) line 34 runs
`node scripts/selftest.mjs`, commented *"every assertion, not a sample … previously not run in CI at
all"*, and line 52 runs the **full** Playwright suite as a blocking deploy gate (*"Every Playwright
spec is part of the deploy gate"*) — not 1 of 28.

- [`../.specify/memory/constitution.md`](../.specify/memory/constitution.md) is the **unmodified bootstrap
  template**, still containing `*Example: Bookings must never result in double-charges*` and
  `> **TODO:** Replace examples with your project's actual business invariants.`
- No `docs/Product-Principles.md`.
- CI ([`../.github/workflows/pages.yml`](../.github/workflows/pages.yml)) runs **1 of 28** Playwright specs and
  **none of the ~1,000 selftest assertions**. The test investment is real; the enforcement is not.

### 5.8 · A superseded High bug left open — **medium**

**Status: OPEN** *(2026-08-03)* — still open, but far smaller than described.
`specs/_bugs/BUG-001-central-provider-credential-security/state.json` line 6 is still
`"status": "in_progress"`, and its `bug.md` Severity block still marks `[x] High` — so the headline
holds. The **"49 unchecked DoD items" figure is stale**: that bug's `scopes.md` now has **0
unchecked and 18 checked**. `bug.md` also narrows the bug to one live contract — *"BUG-001's only
active contract is the implemented SCOPE-01 cleanup"* — which explicitly *"must preserve BUG-002's
current proxy behavior, `localStorage.rlProviderConfig`, and non-secret `localStorage.rlData`
unchanged."* The *indistinguishable-from-real-security-work* problem is therefore resolved inside
the artifact; what remains is the status flip itself (`bug.md` records *"In Progress — withdrawal
routed to artifact owners"*).

`specs/_bugs/BUG-001-central-provider-credential-security` is **`in_progress`, severity High**, with **49
unchecked DoD items**. Its contract mandates *memory-only* credentials: *"no raw secret may enter any client
persistence or disclosure surface."*

`specs/_bugs/BUG-002-two-tier-provider-access` is **`done`** and states plainly: *"This reverses BUG-001's
`localStorage`-credential prohibition **for Tier 2**."* That reversal shipped —
[`../rldata.js`](../rldata.js) line 123 persists `{ keys }` to `localStorage.rlProviderConfig`.

The reversal was deliberate and documented, but **BUG-001 was never closed or withdrawn.** Its 49 open DoD items
describe work that is now partly moot — indistinguishable, from the outside, from real outstanding security
work, on the repo's only High-severity open bug.

### 5.9 · Single-laptop cadence — **medium**

**Status: RESOLVED** *(2026-08-03)* — for the deterministic layer, which is the one this row is
about. [`../.github/workflows/tier-a.yml`](../.github/workflows/tier-a.yml) runs Tier A on GitHub
Actions with eight `cron` entries covering the four ET windows across both DST seasons, plus
`workflow_dispatch`, and states the intent directly: *"Running it here removes the product's
dependence on a particular laptop being open at 07:30 ET."* **Residual, by explicit design:** Tier B
(narrative) *"deliberately stays operator-hosted"* because it needs a model the repo does not own,
degrading to the honest *"narrative not refreshed this window"* state rather than fabricating one.
Note that the sentence quoted below is **still present** at
[`../notes/market-brief.md`](../notes/market-brief.md) line 72 (and again at line 156) and is now
itself stale runbook prose.

[`../notes/market-brief.md`](../notes/market-brief.md) §2: *"Tier A (data) + Tier B (narrative) — **on THIS
MacBook** (macOS `launchd`, 4×/day)"*. The core cadence depends on one laptop being awake. The current payload
is from the prior session's `after-hours` window.

### 5.10 · Discovery does not scale — **medium**

**Status: RESOLVED** *(2026-08-03)* — for the discovery defect this row names. `index.html` renders
grouped sections (`.toolgroup`, lines 879-909) across six groups, sorted most-recently-updated-first
(`byUpdatedDesc`, line 868), behind a live search/filter input `#toolFilter` (lines 507-512) that
matches title + blurb + tags and shows a match count; an `Ungrouped` block catches any registered
tool no group claims. `rlnav.js` groups as well (`groupedItems()`, lines 67-90 — same six groups,
same `Ungrouped` fallback). *"One flat list … no grouping, no search, no filter, no recency"* is
false for both surfaces. **Not verified:** the accessibility counts and page-weight figures in this
row (`focus-visible` 11/26, `prefers-reduced-motion` 3/26, 305/245/242/226 KB) were **not**
re-measured in this pass.

`index.html` and `rlnav.js` each render **one flat list** of 25 tools. No grouping, no search, no filter, no
recency. Accessibility is otherwise sound — viewport 26/26, `aria-label` 24/26, `@media` 23/26, `:focus` 18/26,
`aria-live` 14/26, `keydown` 12/26, and **zero** inline `onclick` on non-interactive elements (no keyboard
traps). Two polish gaps: `focus-visible` 11/26 and `prefers-reduced-motion` 3/26. Heaviest pages: 305 / 245 /
242 / 226 KB — fine on desktop, heavy on mobile.

### 5.11 · Planning inventory is the binding constraint — **medium**

**Status: OPEN** *(2026-08-03)* — still binding, and larger. Measured across `specs/**` `*.md` +
`*.json`: **261,276 spec lines** and **1,889 open DoD checkboxes** (1,384 checked), up from the
199,606 / 1,678 recorded below. Root product files (93 `*.html` / `*.js` / `*.json` / `*.mjs`) total
106,233 lines — a ~2.5 : 1 ratio — though the counting method behind the 73,274 baseline is not
recorded here, so the two product figures are not strictly comparable. Spec 015 is **still
`blocked`**. One sub-claim is stale: specs 004, 006 and 008 are now `in_progress`, not
`not_started`.

199,606 spec lines against 73,274 product lines (**2.7 : 1**). 1,678 open DoD items. Specs 004 (103 FR), 006
(83 FR) and 008 (150 FR) sit `not_started` **with their code already shipped**.

Spec 015 — *the outcome ledger, i.e. the fix for §5.3* — is `blocked` by gate G089 on the **status** of other
specs. Its own `blockedReason` concedes: *"the code 015 depends on already EXISTS and is green… G089 is blocking
on SPEC STATUS bookkeeping, not on missing capability."*

---

## 6. Competitive position

| Competitor | Price | Their moat | Research Lab's position |
|---|---|---|---|
| **SpotGamma** | $99 – $1,999/mo | Proprietary real-time options inventory model; HIRO; Founder's Note | Cannot match real-time data. Honest EOD is a *different* product — but only if stated |
| **Unusual Whales** | $50 – $200/mo | Real-time flow, 100k users, MCP + API, AI daily brief | Shipped this flagship concept with a live feed and an ecosystem |
| **Quiver** | $25/mo | Congress/insider data **+ backtesters + published strategy performance** | `smart-money-flow-lab` uses *synthetic* filings; Quiver's **free** tier has real data **and** a track record |
| **Koyfin** | freemium | 100K securities, 5,900 screener filters, macro dashboards | Different job; not competing |
| **OpenBB** | free / OSS | Own-your-infrastructure workspace; AI agents on governed data | Closest philosophically. They solved integration first, tools second — the inverse order |
| **Composer** | flat fee | AI strategy → backtest → **live execution** | The full loop, deliberately out of scope |

### The one defensible edge

Not a feature — a **posture**: *calibrated honesty with a published track record.* No subscription competitor
can ever publish its own miss rate; a single-operator, no-revenue, educational project can.

**But the posture is worth nothing until §5.3 is fixed.** Today the product has the honesty *and* no track
record — the worst of both. Everything else here is secondary to closing that.

---

## 7. Strengths

1. **Intellectual honesty as architecture** — `coverage-only`, `not-applicable`, `zero-observed`,
   `thin-observed`; *"confidence is evidence quality, never a win probability"*; *"unknown stays unknown,
   missing stays incomplete, never zero."* No competitor attempts this.
2. **Brief prose quality** competitive with paid research — specific levels, explicit gates, completed-bar
   discipline (*"add the growth/materials turn only on the completed 7/30-bar confirmation"*).
3. **No-duplication deep-link law** — architecturally correct, rare.
4. **Anti-overfit rigor** — anti-reactivity mandate, embargoed walk-forward folds, held-k/N cross-instrument
   robustness, Deflated Sharpe Ratio.
5. **Test discipline** — over 1,000 assertions, adversarial regression tests, anti-tautology guards, and **every
   tool carries at least one Playwright spec**.
6. **Locked supply chain** — pinned registry, exact saves, committed lockfile, `ignore-scripts`, CI-enforced.
7. **Zero-dependency, no-build, offline-capable** — elegant and genuinely working.
8. **Contract-first model layer** — 23/23 declared with provenance, calibration and limitation policies.

---

## 8. Missing features

Ranked by value ÷ effort.

**Tier 1 — unlocks the thesis**

1. **Recommendation scorecard** — rolling hit-rate by horizon / domain / confidence bucket; calibration curve
   (stated vs realised); misses shown. Everything else is downstream.
2. **Trigger & invalidation watcher** — the brief already publishes an `invalidation` line per call and never
   watches it. Highest value ÷ lowest effort in the repo.
3. **Headless reads for the seven unwired tools** — closes §5.2.

**Tier 2 — completeness**

4. Mounted journeys — 48 scenarios already designed (§3.3).
5. Position/portfolio context (localStorage-only, per the tickers-only rule) so calls become sized.
6. Real filing data for `smart-money-flow-lab`, or cut it.
7. Shared volatility-drag primitive; one Sharpe convention.
8. Tool grouping + search.

**Tier 3 — reach**

9. Email/push delivery — the brief is built for an inbox; both major competitors do this.
10. Widen the key-free path — **11 of 23 registered tools** hydrate through `RLDATA.ensure*`, which serves committed
    same-origin snapshots with no key or proxy (289 bar symbols, 23 option chains). Extending snapshot coverage
    is what widens keyless reach; note `pagesBars()` is http(s)-only, so `file://` falls through to keyed
    providers.
11. MCP server exposing tool reads — reads are already contracted and provenance-tagged.

---

## 9. Fundamental vs tactical

### Fundamental — change the shape

| | Change | Why |
|---|---|---|
| **A1** | **Make the ledger the product.** Recommendations become first-class persisted objects with a lifecycle; the scorecard goes above the fold. | Converts the only defensible edge from a claim into a number |
| **A2** | **Write the product principles and real business invariants.** Replace the template constitution. | Every decision below needs a rule; the template supplies none |
| **A3** | **Decide: personal instrument or public product.** | Today it is *deployed* public and *built* personal. That ambiguity drives §5.8, §5.9 and the key-gated tools |
| **A4** | **Cap spec size; add an exception process.** | 2.7 : 1 planning-to-product with 1,678 open items is inventory, not rigor |
| **A5** | **No spec may block on another spec's status** — only on a real, named, missing capability. | §5.11: the fix for the biggest gap is blocked by paperwork |

### Tactical — same shape, fixed

`§5.1` escape + CSP · `§5.2` wiring · `§5.4` register-or-delete · `§5.5` one metric module ·
`§5.6` shard history · `§5.7` full CI · `§5.8` close BUG-001 + front-door copy · `§5.9` move Tier-A off the
laptop · `§5.10` grouping + search.

**Explicitly *not* needed:** no ESM migration (breaks `file://`), no bundler, no model rewrite, no
re-architecture. The structure is right.

---

## 10. Target state

### 10.1 What the user sees

1. **The Scorecard, above the fold** — *"Over 90 days: 412 calls, 61 % resolved in favour. At a stated 60 %
   confidence, realised 57 %. 8 % not machine-evaluable."* With recent misses listed, not hidden.
2. **The Brief** — ≤ 7 cards, each a scannable ≤ 120-char headline, then `what` / `why` / levels /
   invalidation / confidence, each deep-linking the tool that owns the math.
3. **Live evidence from every applicable tool** — gamma flip and walls, options surface, swing structure,
   session auction, breadth. Non-applicable tools say so and mean it.
4. **Guided journeys** — the 48 designed scenarios, reachable.
5. **A navigable shelf** — grouped, searchable, recency-aware.
6. **Open calls tracked** against their own published invalidation lines, closing themselves when the market
   answers.

### 10.2 Measurable definition of done

> **Status pass — 2026-08-04.** The table below is preserved as its **original point-in-time target
> set**; no metric, baseline or target has been removed or softened. Every criterion is re-measured
> **individually** beneath it — none is inferred from "§11 mostly shipped". `RESOLVED`, `PARTIAL`
> and `OPEN` cite the file, line or command output actually read or run; `UNVERIFIED` means the
> criterion was **not** re-measured in this pass and must not be read as either. Where a
> measurement contradicts the `Today` or `Target` column, **the measurement is the current fact**
> and the table is the as-set-then record. The working tree is dirty — another session's
> uncommitted changes and this session's uncommitted `scripts/*` edits are both present — so every
> citation is taken from committed `HEAD` (`git grep … HEAD`, `git show HEAD:<path>`,
> `git cat-file -s HEAD:<path>`), never from an uncommitted file. Where committed and working-tree
> state differ, both are given.

| Metric | Today | Target |
|---|---|---|
| Unescaped LLM-content sinks | 1 | **0** |
| Pages with a CSP | 0 / 26 | **26 / 26** |
| Tools contributing rich reads | 5 / 23 | **≥ 11 / 23** (all applicable) |
| Recommendation close events | 0 | **> 0, rising daily** |
| Published calibration surface | none | **live above the fold** |
| Reachable user journeys | 0 / 48 | **48 / 48** |
| Unreachable shipped assets | ~1.05 MB | **0 B** |
| Sharpe implementations in tree | 3 sites, 2 conventions | **1 module, 1 default** |
| Bytes fetched on brief load | 2.37 MB | **< 200 KB** |
| Selftest assertions in CI | none | **the full suite** |
| Playwright specs in CI | 1 / 28 | **28 / 28** |
| Open bugs whose contract was superseded | 1 | **0** |

#### Measured against that table — 2026-08-04

| # | Criterion | Target | Measured at committed `HEAD` | Status |
|---|---|---|---|---|
| 1 | Unescaped LLM-content sinks | 0 | sweep returns **empty**, exit 1 | **RESOLVED** |
| 2 | Pages with a CSP | 26 / 26 | **26 of 26** root `*.html` | **RESOLVED** |
| 3 | Tools contributing rich reads | ≥ 11 / 23 | **11 analyzed** · 5 stale · 7 not-relevant | **RESOLVED** |
| 4 | Recommendation close events | > 0, rising daily | **180 closures** on **2 calendar days**, last 2026-08-02 | **PARTIAL** |
| 5 | Published calibration surface | live above the fold | scorecard renders before the attention feed | **RESOLVED** |
| 6 | Reachable user journeys | 48 / 48 | browser audit: 48 goals on the brief, `Journey` tab on 23 of 23 pages | **RESOLVED** |
| 7 | Unreachable shipped assets | 0 B | 10 paths **declared excluded**, not registered-or-deleted | **PARTIAL** |
| 8 | Sharpe implementations in tree | 1 module, 1 default | one default, **two private duplicates** outside `rlmetrics.js` | **PARTIAL** |
| 9 | Bytes fetched on brief load | < 200 KB | **155,050 B** across 7 files | **RESOLVED** |
| 10 | Selftest assertions in CI | the full suite | `pages.yml` line 34 runs the whole suite | **RESOLVED** |
| 11 | Playwright specs in CI | 28 / 28 | whole project, no spec path — **33 of 33** | **RESOLVED** |
| 12 | Open bugs whose contract was superseded | 0 | `BUG-001` still `in_progress` | **OPEN** |

**1 · Unescaped LLM-content sinks — RESOLVED** *(2026-08-04)*. The §11 Step 1 sweep
(`git grep -nE "innerHTML[[:space:]]*=.*\+[[:space:]]*\(?[a-z]+\.(title|note|read|summary|why|what)" HEAD -- '*.html' 'rl*.js'`)
returns **no matches, exit 1** — run unfiltered, without the `grep -v 'esc('` the plan pipes it through, so
escaped sites would still have shown. The former sink is escaped at
[`../market-brief.html`](../market-brief.html) line 894 (`esc(x.title || "")` … `esc(x.note || "")`), with
`esc()` defined at line 856 and a second at line 1029. Baseline 1 → **0**.

**2 · Pages with a CSP — RESOLVED** *(2026-08-04)*. `git ls-tree --name-only HEAD` lists **26** root `*.html`
files; `git grep -l 'Content-Security-Policy' HEAD -- '*.html'` returns **26**. Baseline 0 / 26 → **26 / 26**.

**3 · Tools contributing rich reads — RESOLVED** *(2026-08-04)*, exactly at target and no further. The
committed `market-brief.payload.json` `toolCoverage` array holds 23 entries tallying **analyzed 11 · stale 5 ·
not-relevant 7**. Target is `≥ 11 / 23`, so the criterion is met with **zero margin** — one tool slipping to
`stale` breaks it. **Provenance, corrected:** the working-tree payload tallies **identically** (11 / 5 / 7), so
the higher figure quoted elsewhere is not a payload difference. It is a *pipeline* difference:
`scripts/brief-refresh.mjs` is uncommitted and carries **11** `OWNER.loadAdapter` call sites in the working
tree (lines 1291, 1316, 1358, 1431, 1493, 1588, 1611, 1636, 1637, 1676, 1704) against **8** at `HEAD` (lines
1261, 1286, 1314, 1337, 1362, 1363, 1402, 1430) — three additional call sites, reaching `fundamental-models.js`
and `macro-rotation.js` as well. All **seven** adapter modules under `rlexperience-adapters/` are tracked at
`HEAD` and unmodified on disk; **no adapter file is uncommitted.** The `13` reported elsewhere is
`brief-refresh.mjs --dry-run`'s `fresh-headless` count, a different metric from payload `analyzed`, and it was
**not** re-run in this pass.

**4 · Recommendation close events — PARTIAL** *(2026-08-04)*. The `> 0` half is closed and the *"rising daily"*
half is false. Across both committed ledger files (`briefs/history/recommendations/2026-07.jsonl` 749 rows,
`2026-08.jsonl` 115 rows — **864 rows**), event types tally `proposed` 464 · `body-restored` 220 ·
`not-evaluable` 150 · `satisfied` 16 · `invalidated` 14 — **180 closure events**, against 0 at baseline.
Grouped by `occurredAt`, every one of those 180 falls on **two calendar days**: **2026-07-31** (150 — 132
not-evaluable, 14 invalidated, 4 satisfied) and **2026-08-02** (30 — 18 not-evaluable, 12 satisfied). The
per-day count **fell** 150 → 30, and no closure has been written in the two days to 2026-08-04. Closures are
episodic, not daily.

**5 · Published calibration surface — RESOLVED** *(2026-08-04)*. `market-brief.scorecard.json` is committed at
**12,049 B** and renders above the attention feed: `<div id="scorecard">` at
[`../market-brief.html`](../market-brief.html) line 783 against `<div class="feed" id="attention">` at line
801, and `RLBRIEF.renderScorecard` at line 947 before `renderAttention` at line 952. Its `all` window reads
`closed 180 · resolved 30 · hitRate 0.5333 · notEvaluableShare 0.8333`; `30d` and `90d` are identical, the
ledger being younger than either window. `recentMisses` carries 3 entries, each with a `reasonCode` and an
`invalidatedBy` object. The refusal is real: `policy.minResolvedSample` is 20, and every under-sampled cut
publishes `hitRate: null` with `insufficientSample: true`. **Worth stating rather than glossing:** of 180
closures only **30** are resolved — a `notEvaluableShare` of **0.8333**. The surface is live and honest; the
sample behind its headline rate is 30.

**6 · Reachable user journeys — RESOLVED** *(2026-08-04)*. Committed `journeys.json` (`journey-registry/v1`)
holds **48 definitions and 48 steps** across **23 distinct tools**, and `rljourney.js` has a real production
consumer — [`../rlapp.js`](../rlapp.js) line 634 loads it via `ensureSharedScript`. Reachability was measured
in a browser **in this pass**, not cited: `node scripts/audit-reader-legibility.mjs` renders every registered
tool and activates every view, reporting `pages audited: 23   with view tabs: 23   errored: 0`, a `Journey`
tab on **23 of 23** pages, `journeyToolRows=1 journeyGoals=2` on each tool page, and
`journeyToolRows=23 journeyGoals=48` on `market-brief`. Every one of the 48 is reachable, and each tool page
shows only its own two — the scoping §3.3 records as fixed.

**7 · Unreachable shipped assets — PARTIAL** *(2026-08-04)*. Committed `site-exclusions.json`
(`pages-site-exclusions/v1`) declares **10 files**: `trend-dynamics-cycle-lab.html`,
`trend-dynamics-cycle-universe.json`, `portfolio-survival-allocation-lab.html`,
`portfolio-survival-allocation.config.json`, `rlportfolio.js`, `rlfx.js`, `fx-regime-universe.json`,
`rlcausal.js`, `causal-rotation-ledger.jsonl`, `causal-rotation-observations.json`. Those bytes are therefore
no longer *shipped-and-invisible*. Two things keep this short of the target. §11 Step 2's own contract is
*"register or delete — no third option"*, and declared exclusion is a third option; its `comm -3` check still
prints the two orphan ids. And the **live Pages state was not fetched** in this pass, so "0 B" is the build
plan plus the in-repo consumers, not an HTTP measurement — the same gap §5.4 declares.

**8 · Sharpe implementations in tree — PARTIAL** *(2026-08-04)*, and this is a live **D4** violation. The
*"1 default"* half is closed: `rlmetrics.js` line 183 exports `sharpe: sharpeArithmetic`, alongside
`arithmeticMean` 49, `annualizedVol` 67, `cagr` 81, `sharpeArithmetic` 91, `sharpeGeometric` 105,
`volatilityDrag` 139, `volatilityDragApprox` 148 and `kellyFraction` 156. The *"1 module"* half is not:
`function deflatedSharpe` is defined **twice** — [`../etf-momentum-lab.html`](../etf-momentum-lab.html) line
**1457** and [`../strategy-validation-lab.html`](../strategy-validation-lab.html) line **680** — and each
annualises its own per-period Sharpe privately at line **1467** and line **690** respectively
(`srAnn: sr * Math.sqrt(ANN)`). The two line-number pairs cited across this document are **both correct and
refer to different lines**: 1457 / 680 are the function definitions, 1467 / 690 are the private
annualisations inside them. The Step 6 sweep returns **9** hits at `HEAD`; the other 7 are volatility,
downside-deviation and tracking-error annualisations, not Sharpe. Working tree and `HEAD` agree on all four
line numbers.

**8 · Sharpe implementations in tree — PARTIAL, narrowed** *(2026-08-04, later pass)*. This supersedes the
paragraph immediately above and row 8 of the table, both retained as the earlier point-in-time record. Two
corrections. **First**, the *live* duplication is gone:
[`../etf-momentum-lab.html`](../etf-momentum-lab.html) now loads `rlvalidation.js` at line **1369** and
rebinds its runtime path to `RLVALID.rlvDeflatedSharpe` — bind **1489**, delegation **1481**, hard throw
**1484** — so its live call site at **2052** reaches the shared module. **Second**, *"two private
duplicates" was wrong when written*: [`../strategy-validation-lab.html`](../strategy-validation-lab.html)
had already migrated under Feature 007 — bind **703**, delegation **695**, throw **698** — and was
**unmodified at the committed `HEAD` that pass read**, last committed **2026-08-02** (`e38615ea`). Its line
**690** lies inside the retained oracle, not the live path. Only **one** file was ever a live duplicate.
`rlvDeflatedSharpe` is now defined once: [`../rlvalidation.js`](../rlvalidation.js) line **87**, exported
line **159** — `grep -rn "function rlvDeflatedSharpe" *.js` returns a single hit.

Still **PARTIAL**, honestly rather than pedantically. Both pages deliberately retain the original as a
**parity oracle** — `etf` **1461**/**1479**, `strategy-validation` **680**/**693** — each carrying a
load-time equality receipt (`window.__ETF_RLVALID_PARITY__` **1499**,
`window.__STRATEGY_RLVALID_PARITY__` **713**), so *implementations in the tree* are **3**, not 1. And the
target's *"1 module"* names `rlmetrics.js`, whereas deflated Sharpe is canonically owned by
**`rlvalidation.js`** (own per-period Sharpe at line **100**, `srAnn` at **109**) — a second canonical
metric module the criterion did not anticipate. Measured honestly: **live definitions 1 · verification
oracles 2 · defaults 1**. The `etf-momentum-lab.html` change is **uncommitted**
(`git diff --numstat HEAD` → `32  0`), so unlike every other citation in this section it is a working-tree
fact. Re-verified: `node scripts/selftest.mjs` **1216 passed, 0 failed**, exit 0;
`node scripts/audit-reader-legibility.mjs` **0 leaks**, exit 0.

**9 · Bytes fetched on brief load — RESOLVED** *(2026-08-04)*. [`../market-brief.html`](../market-brief.html)
line 997 fetches exactly seven files; their committed sizes are `market-brief.page.json` 95,712 ·
`market-brief.snapshot.page.json` 25,805 · `market-brief.scorecard.json` 12,049 ·
`brief-history.recent.jsonl` 10,106 · `market-brief.config.page.json` 7,705 · `market-brief.tools.page.json`
2,604 · `watchlist.json` 1,069 — **155,050 B (151 KB)**, against a declared
`briefFirstLoadMaxBytes: 204800` in [`../tool-experience.config.json`](../tool-experience.config.json)
`artifactBudgets`. The 2,866,445 B `brief-history.jsonl` append log appears in `market-brief.html` only inside
the line-994 comment; it is never fetched. Baseline 2.37 MB → **151 KB**.

**10 · Selftest assertions in CI — RESOLVED** *(2026-08-04)*.
[`../.github/workflows/pages.yml`](../.github/workflows/pages.yml) line 34 runs `node scripts/selftest.mjs` —
the whole suite, no filter. Baseline none → **full suite**.

**11 · Playwright specs in CI — RESOLVED** *(2026-08-04)*, **with the denominator moved.**
[`../.github/workflows/pages.yml`](../.github/workflows/pages.yml) line 52 runs
`npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=2 --reporter=list`
— the whole project, with **no single-spec path**. `playwright.config.mjs` line 4 sets
`testMatch: '**/*.spec.mjs'`, and **33** `tests/*.spec.mjs` files are tracked at `HEAD`, not the 28 this table
was written against. The target *"28 / 28"* is met and exceeded as **33 / 33**; the criterion is satisfied
structurally — CI cannot regress to a subset without editing the run line.

**12 · Open bugs whose contract was superseded — OPEN** *(2026-08-04)*.
`specs/_bugs/BUG-001-central-provider-credential-security/state.json` reads `"status": "in_progress"` at
committed `HEAD` **and** on disk. Baseline 1 → **1**. This is the same finding §5.8 records as OPEN and §11
Step 2 records as its outstanding half; it is the one criterion in this table that has not moved at all.

**Not measured by this table.** §10.2 carries **no planning-throughput, spec-inventory or DoD burn-down
criterion** — so nothing in it registers the movement §5.11 records, which went the **wrong way**. Re-measured
here: **1,854 open** and 1,381 checked DoD checkboxes across `specs/**/*.md` at committed `HEAD`, and
**262,062** spec lines across `specs/**` `*.md` + `*.json` in the working tree against **106,140** root
product lines. Both figures sit far above the 1,678 open items and 199,606 spec lines this document's baseline
recorded, confirming §5.11's direction. (§5.11's 2026-08-03 pass recorded 1,889 open / 1,384 checked / 261,276
lines; the small deltas are a different pass over a moving tree, not a reversal.) A definition of done that
does not measure the constraint §5.11 calls binding cannot report it improving or worsening.

---

## 11. Roadmap — shipped history

Each step ships user-visible value alone, is independently revertable, and ends with a command that proves it.
No step depends on a later one. No step requires unblocking a spec. Effort is *focused working time*.

> **⚠ "Step *N*" is ambiguous in this repository — always name the document.** This section and
> [`Improvement-Plan.md`](Improvement-Plan.md) **both** number their delivery steps 1–9, and the two sets mean
> entirely different things. A reader who cites *"Step 7"* without naming the document will be misread.

| # | **This document** — §11, the roadmap that shipped | [`Improvement-Plan.md`](Improvement-Plan.md) §5 — the frontier it exposed |
|---|---|---|
| 1 | Close the injection sink | Correct the tests that pin the placeholder |
| 2 | Truth pass | Make the Simple view speak to a human |
| 3 | Wire the adapters | Stop rendering governance to readers |
| 4 | Score the ledger | Route the watchlist into the tools |
| 5 | Surface calibration | Make Red Alert and Portfolio real |
| 6 | One metric spine | Recommendations born evaluable |
| 7 | Bounded history & performance | Close the last five stale tools |
| 8 | Journeys & discovery | A journey entry on every tool page — **VOID** (premise was a measurement error) |
| 9 | Durability | Reconcile the paperwork |

These are not two versions of one list. **§11 is the plan that shipped; `Improvement-Plan.md` §5 is the plan for
what shipping it exposed.** The collision is already live in the history: `HEAD`'s own subject line — *"docs:
specify Step 7 from evidence and lower its target to 11 -> 14"* — is about **Improvement-Plan** Step 7 (stale
tools), not §11 Step 7 (bounded history). Write *"§11 Step 7"* or *"Improvement-Plan Step 7"*, never bare
*"Step 7"*.

> **Status pass — 2026-08-03.** Every step below is preserved as its **original point-in-time plan**; no change,
> verify block or effort estimate has been removed or rewritten. Each step now opens with a `Status` line
> recording whether it has since shipped. `RESOLVED` and `PARTIAL` cite the file, line or command output
> actually read or run; `UNVERIFIED` would mean the step was **not** re-measured in this pass and must not be
> read as either. Where a `Status` line contradicts a line number, count or command in the plan beneath it,
> **the `Status` line is the current fact** and the plan is the as-written-then record. The working tree is
> dirty, so every citation below is taken from committed `HEAD` (`git grep … HEAD`, `git show HEAD:<path>`),
> never from an uncommitted file.

---

### Step 1 · Close the injection sink — **15 min** · 🔴 *do today*

**Status: RESOLVED** *(2026-08-03)* — all three changes shipped; this is the step that closed §5.1. The sink is
escaped: [`../market-brief.html`](../market-brief.html) line 894 reads `esc(x.title || "")` … `esc(x.note || "")`,
with `esc()` defined at line 856 (the line numbers in the plan below are the pre-fix ones). The first **Verify**
sweep returns **empty** — no `innerHTML` concatenation of `.title` / `.note` / `.read` / `.summary` / `.why` /
`.what` survives in any tracked `*.html` or `rl*.js` (exit 1). A `Content-Security-Policy` `<meta>` is present on
**26 of 26** root `*.html` pages, so the second sweep is empty too. The regression test exists:
`tests/brief-payload-escaping.spec.mjs`. **Not verified:** that Playwright spec was not executed in this pass.

**Value** — removes a credential-exfiltration path and fixes broken markup rendering in the same edit.

**Change**
1. [`../market-brief.html`](../market-brief.html) line 785 — wrap both interpolations in the `esc()` already
   defined at line 896: `esc(x.title || "")`, `esc(x.note || "")`.
2. Add a `Content-Security-Policy` meta to every page (`default-src 'self'; script-src 'self' 'unsafe-inline'`
   — inline is required by the single-file design; it still blocks remote exfil endpoints via `connect-src`).
3. Add a regression test asserting that a payload whose `experimental[0].title` contains `<img onerror>`
   renders as **text**, not markup.

**Verify**
```bash
grep -rnE "innerHTML\s*=.*\+\s*\(?[a-z]+\.(title|note|read|summary|why|what)" *.html rl*.js | grep -v 'esc('   # empty
grep -L 'Content-Security-Policy' *.html                                                                        # empty
npx --no-install playwright test tests/brief-payload-escaping.spec.mjs --config=playwright.config.mjs --project=system-chrome
```
**Done when** the sweep is empty, every page carries a CSP, and the escaping regression passes.

---

### Step 2 · Truth pass — **0.5 d**

**Status: PARTIAL** *(2026-08-03)* — the asset half landed, the bug half did not, and **neither Verify line passes
as written.** This step's own text targets §5.8 and §5.4, not §5.7. §5.8 is still recorded **OPEN**:
`specs/_bugs/BUG-001-central-provider-credential-security/state.json` reads `"status": "in_progress"` at `HEAD`, so
`Change` item 1 — *"Close or withdraw `BUG-001`"* — is outstanding and `jq -r '.status' … # not in_progress`
fails. `Change` item 2 was closed by a **third option its own text forbids** (*"register or delete — no third
option"*): `portfolio-survival-allocation-lab` and `trend-dynamics-cycle-lab` are neither registered nor deleted
but **declared** in [`../site-exclusions.json`](../site-exclusions.json) (`pages-site-exclusions/v1`, 10 paths,
each with a recorded reason), refused-if-unregistered by `scripts/build-pages-site.mjs` and asserted by
[`../scripts/selftest.mjs`](../scripts/selftest.mjs) — so the `comm -3 … # empty` line still prints those two
ids. §5.4 accepts that substitution and is marked RESOLVED; this step's contract does not. **Remainder:** flip
`BUG-001` to a terminal status (now [`Improvement-Plan.md`](Improvement-Plan.md) Step 9), and either amend
`Change` item 2 to admit declared exclusion as a third disposition or retire the `comm` check.

**Value** — ~1.05 MB stops being invisible; the security backlog stops lying about its size.

**Change**
1. Close or withdraw `BUG-001` (§5.8) with an explicit note that BUG-002 superseded its Tier-2 clause; retain
   any DoD item that is still genuinely outstanding, delete the rest.
2. Per orphan (§5.4): **register or delete** — no third option. Registering means all five registries +
   `rlnav.js` + notes.

**Verify**
```bash
comm -3 <(ls *.html | grep -v '^index' | sed 's/.html//' | sort) <(jq -r '.tools[].id' tools.json | sort)   # empty
jq -r '.status' specs/_bugs/BUG-001-central-provider-credential-security/state.json                         # not in_progress
node scripts/selftest.mjs
```
**Done when** all three pass.

---

### Step 3 · Wire the adapters — **2–3 d** · *most visible single change*

**Status: RESOLVED** *(2026-08-03)* — closes §5.2. At `HEAD`,
[`../scripts/brief-refresh.mjs`](../scripts/brief-refresh.mjs) carries **8** `OWNER.loadAdapter` call sites
(lines 1261, 1286, 1314, 1337, 1362, 1363, 1402, 1430) across `options.js` ×2, `market-structure.js` ×5 and
`rlvol.js` ×1 — against the *"exactly one adapter"* this step was written to fix. The committed
`market-brief.payload.json` reports **11 `analyzed` · 5 `stale` · 7 `not-relevant`** over 23 tools, meeting the
*"`analyzed ≥ 11`"* target exactly. Six of the seven tools in the ship list are `analyzed`
(`gamma-trading-lab`, `options-structure-lab`, `swing-structure-lab`, `intraday-tape-lab`, `market-heatmap-lab`,
`volatility-sizing-lab`); the seventh, `technical-analysis-decision-lab`, is wired but publishes an **honest
unavailable** because its owner five-gate model is not implemented — a missing model, not missing wiring, and
exactly the *"fail honestly"* shape this step required. The hardcoded *"5 tools"* comment is gone:
[`../scripts/brief-distributed-publish.mjs`](../scripts/brief-distributed-publish.mjs) now reads *"every tool
that carries a server-side Tier-A read (snapshot.toolReads)"*. **Residual:** the *"no tool with data on disk
reports `stale`"* clause is not met — `ai-capex-strategy-lab`, `bond-regime-lab`, `options-flow-feed-lab`,
`smart-money-flow-lab` and `technical-analysis-decision-lab` remain `stale`. That residual is now
[`Improvement-Plan.md`](Improvement-Plan.md) **Step 7**, whose honest ceiling is 14, not 23.

**Value** — the brief gains gamma flip and walls, options surface, swing structure, session auction, breadth
and the five-gate technical read. Coverage **5 → 11+**. The red-alert engine reaches quorum.

**Change** — in [`../scripts/brief-refresh.mjs`](../scripts/brief-refresh.mjs), follow the existing
`buildEtfToolRead` template (line ~1093), once per tool:

```js
export async function buildGammaToolRead(deps = {}) {
  const model = deps.model || featureRequire('../rlexperience-adapters/options.js');
  // data/options/<sym>.json + data/bars/<sym>.json → model.computeGammaPlaybookSummary(...)
  // → { id, asOf, read, metrics, deepLink, source: 'owning-tool-functions' }
}
```

Ship in value order, **one commit each** so any one can be reverted: `gamma-trading-lab` →
`options-structure-lab` → `swing-structure-lab` → `intraday-tape-lab` → `market-heatmap-lab` →
`technical-analysis-decision-lab` → `volatility-sizing-lab`.

Each must fail **honestly** — missing chain ⇒ `unavailable` with a named reason, never a fabricated number
(reuse the existing `catch` shape).

**Verify** — after each commit
```bash
node scripts/brief-refresh.mjs --dry-run
jq -r '.toolReads | keys | length' market-brief.snapshot.json          # +1 per commit
jq -r '.toolCoverage[].status' market-brief.payload.json | sort | uniq -c
node scripts/validate-brief-payload.mjs && node scripts/selftest.mjs
```
**Done when** `analyzed ≥ 11`, no tool with data on disk reports `stale`, and the hardcoded *"5 tools"* comment
at `brief-distributed-publish.mjs:12` is corrected.

---

### Step 4 · Score the ledger — **2–3 d** · ⚠ *the product thesis*

**Status: RESOLVED** *(2026-08-03)* — closes §5.3. Counting every row of
`briefs/history/recommendations/*.jsonl` at `HEAD` (864 rows across `2026-07.jsonl` and `2026-08.jsonl`):
`proposed` 464 · `body-restored` 220 · **`not-evaluable` 150 · `satisfied` 16 · `invalidated` 14** — **180
closure events**, against 0 when this step was written. `not-evaluable` is populated and is the *largest* class,
which is precisely the *"proving it is not forcing verdicts"* condition. The evaluator reduces through the
shared, tested contract rather than a private one — `RL.reduceRecommendationEvents` at
[`../scripts/evaluate-recommendations.mjs`](../scripts/evaluate-recommendations.mjs) line 245 — and it has two
real production callers: [`../.github/workflows/tier-a.yml`](../.github/workflows/tier-a.yml) line 110 and
[`../scripts/brief-refresh-and-push.sh`](../scripts/brief-refresh-and-push.sh) line 239, the latter ahead of the
Tier-B author lane as `Change` item 2 required. **Not verified:** the idempotency re-run in **Verify** was not
executed in this pass — no publish or cron script was run.

**Value** — the first honest hit-rate this project has ever produced.

**Change**
1. `scripts/evaluate-recommendations.mjs`, run at the start of each brief cycle: load open `proposed` calls,
   evaluate each against **its own published** `trigger` / `invalidation` / `levels` using the fresh
   `data/bars/` snapshot, and emit close events through the **existing, tested**
   `RLCONTRACTS.reduceRecommendationEvents` `closures` path — `satisfied` · `invalidated` · `expired` ·
   `unresolved` · `not-evaluable`.
2. Wire it into `brief-refresh-and-push.sh` **before** the Tier-B author lane, so the narrative agent sees its
   own record.

**Rules** — `not-evaluable` is a first-class outcome, never dropped. Events are append-only; a correction is a
new event, never an edit.

**Verify**
```bash
node scripts/evaluate-recommendations.mjs --dry-run --as-of 2026-07-30
jq -r '.eventType' briefs/history/recommendations/*.jsonl | sort | uniq -c    # close events present
A=$(wc -l < briefs/history/recommendations/2026-07.jsonl); node scripts/evaluate-recommendations.mjs
B=$(wc -l < briefs/history/recommendations/2026-07.jsonl); [ "$A" = "$B" ] && echo IDEMPOTENT-OK
node scripts/selftest.mjs
```
**Done when** close events exist, the evaluator is idempotent, and `not-evaluable` is populated — proving it is
not forcing verdicts.

---

### Step 5 · Surface calibration — **1–2 d**

**Status: RESOLVED** *(2026-08-03)* — measured independently; this step closes no §5 row.
[`../scripts/build-scorecard.mjs`](../scripts/build-scorecard.mjs) (10,627 B) emits
`market-brief.scorecard.json` (12,049 B, `brief-scorecard/v1`) carrying `windows` `30d` / `90d` / `all`, each
with `closed` `satisfied` `invalidated` `expired` `unresolved` `notEvaluable` `resolved` `hitRate`
`insufficientSample` `notEvaluableShare` `byHorizon` `byDirection` `byDomain` and `calibration`. The `all`
window reads `closed 180 · resolved 30 · hitRate 0.5333 · notEvaluableShare 0.8333`, and `recentMisses` carries
3 entries — misses shown, not hidden. The minimum-sample refusal is real rather than copy: `policy` declares
`minResolvedSample: 20`, and every under-sampled cut publishes `hitRate: null` with
`insufficientSample: true` (`byHorizon.swing` n=2, `byHorizon.tactical` n=1), with
`build-scorecard.mjs` line 211 logging *"withheld — insufficient resolved sample"*. It renders **above** the
attention feed: `<div id="scorecard">` at [`../market-brief.html`](../market-brief.html) line 783 against
`<div class="feed" id="attention">` at line 801, and `RLBRIEF.renderScorecard` at line 947 before
`renderAttention` at line 952. `tests/market-brief-scorecard.spec.mjs` exists (6,839 B). **Deviation:** the
shipped keys are nested under `windows.<w>` and the confidence cut is named `calibration`, so the literal
`jq '{resolved, hitRate, byConfidence, notEvaluableShare}'` in **Verify** prints nulls — the substance is
present, the command is stale.

**Value** — the differentiator becomes a number on the page.

**Change**
1. `scripts/build-scorecard.mjs` → `market-brief.scorecard.json`: rolling 30/90/all-time resolved counts;
   hit-rate by horizon, domain and confidence bucket; calibration table (stated vs realised); the N most recent
   **misses in full**; the `not-evaluable` share.
2. Render **above** the attention feed in [`../market-brief.html`](../market-brief.html) — escaped, per Step 1.
3. Below a minimum resolved sample, print *"insufficient resolved sample (n = X)"* rather than a percentage.

**Verify**
```bash
node scripts/build-scorecard.mjs
jq -r '{resolved, hitRate, byConfidence, notEvaluableShare}' market-brief.scorecard.json
npx --no-install playwright test tests/market-brief-scorecard.spec.mjs --config=playwright.config.mjs --project=system-chrome
```
**Done when** the scorecard renders above the fold, shows misses, and refuses to print a rate below the minimum
sample.

---

### Step 6 · One metric spine — **1–2 d**

**Status: PARTIAL** *(2026-08-03)* — §5.5 is closed; this step's own *"Done when"* is not. `rlmetrics.js` exists
at `HEAD` as a UMD dual module (`module.exports` + global attach, line 30, explicitly *"never ESM"*) and defines
all seven named functions — `arithmeticMean` 49, `annualizedVol` 67, `cagr` 81, `sharpeArithmetic` 91,
`sharpeGeometric` 105, `volatilityDrag` 139, `kellyFraction` 156 — plus `volatilityDragApprox` 148. Both Sharpe
forms are published and labelled rather than silently chosen:
[`../scripts/brief-refresh.mjs`](../scripts/brief-refresh.mjs) line 1172 emits `sharpeGeometric`,
`sharpeArithmetic` **and** `volatilityDrag` per fund. Drag renders — `etf-momentum-lab.html` line 1568 computes
`RLMETRICS.volatilityDrag(r, ANN)` and line 2572 displays `volatilityDragApprox`. All three call sites §5.5
named are gone: the `(cagr - …) / annVol` form matches **nowhere** at `HEAD`, and
`rlexperience-adapters/strategy-research.js` lines 168-169 now delegate to `RLMETRICS.annualizedVol` /
`RLMETRICS.sharpeArithmetic`. **Remainder:** *"zero Sharpe implementations exist outside `rlmetrics.js`"* still
fails. `deflatedSharpe()` computes its own per-period Sharpe `sr = mo.mean / mo.sd` and annualises it privately
as `srAnn: sr * Math.sqrt(ANN)`, **duplicated across two files** — `etf-momentum-lab.html` line 1467 and
`strategy-validation-lab.html` line 690. The **Verify** sweep therefore returns 9 hits rather than empty; the
other 7 are volatility and tracking-error annualisations, not Sharpe. One convention now, not yet one
implementation.

**Status: PARTIAL — narrowed** *(2026-08-04)* — the **live** D4 duplication is closed, this step's literal
*"Done when"* is still not, and the marker above **over-stated the defect by one file**.
[`../etf-momentum-lab.html`](../etf-momentum-lab.html) was the genuine live duplicate and is now migrated:
line **1369** loads `<script src="rlvalidation.js"></script>` under a line-**1366** comment naming it *"the
SINGLE definition of the Bailey & Lopez de Prado deflated / probabilistic Sharpe"*; line **1489** rebinds
`deflatedSharpe = etfMomentumParityDeflatedSharpe`, which delegates to `RLVALID.rlvDeflatedSharpe(adj,
nTrials, ANN)` at line **1481** and **throws** *"RLVALID is required for ETF Momentum statistics"* at line
**1484** rather than falling back silently. The page's live call site (line **2052**) therefore reaches the
shared module. [`../strategy-validation-lab.html`](../strategy-validation-lab.html) **was not a live duplicate
when the marker above was written**: it had already made this migration under Feature 007 — bind at line
**703**, delegation at **695**, throw at **698** — and its line **690**, cited above as a live private
annualisation, sits inside the *retained oracle*, not the runtime path. That file is **unmodified in the
working tree** and was last committed **2026-08-02** (`e38615ea`), so it already delegated at the committed
`HEAD` the earlier pass read. `rlvDeflatedSharpe` is now defined **exactly once** —
`grep -rn "function rlvDeflatedSharpe" *.js` returns a single hit,
[`../rlvalidation.js`](../rlvalidation.js) line **87**, exported line **159**.

**Why this is narrowed and not RESOLVED.** Two things fail the literal wording, and neither is pedantic.
(a) Both pages still *contain* the original implementation, deliberately retained as a **parity oracle** —
`etfMomentumOriginalDeflatedSharpe` (alias **1479**, definition **1461**) and
`strategyValidationOriginalDeflatedSharpe` (alias **693**, definition **680**) — each proved field-for-field
equal to the shared module by a receipt computed at load (`window.__ETF_RLVALID_PARITY__` line **1499**;
`window.__STRATEGY_RLVALID_PARITY__` line **713**). Read literally, *"zero Sharpe implementations exist
outside `rlmetrics.js`"* still fails: three implementations exist. What **is** closed is the **live/runtime**
duplication — one definition is reachable, the other two are verification-only and cannot be called by the
page. (b) The *"Done when"* names the wrong module for this metric. Deflated Sharpe is canonically owned by
**`rlvalidation.js`**, not `rlmetrics.js` (which owns the seven plain metrics); `rlvDeflatedSharpe` computes
its own per-period `sharpe = mean / standardDeviation` at line **100** and annualises it as `srAnn` at line
**109**. A second canonical metric module was not anticipated when this criterion was written, so the
criterion must be restated against the module that actually owns the metric before it can close on its own
terms.

**Not yet at `HEAD`.** The `etf-momentum-lab.html` migration is **uncommitted** — `git diff --numstat HEAD`
reports `32  0` for that file. Unlike every other citation in this document it is a **working-tree** fact, not
a committed one, and the page reverts to a live duplicate if the change is discarded.

**Verified** *(2026-08-04)* — `node scripts/selftest.mjs` → **1216 passed, 0 failed**, exit 0;
`node scripts/audit-reader-legibility.mjs` → 23 pages audited, **0 leaks**, exit 0. Both delegations are
asserted in [`../scripts/selftest.mjs`](../scripts/selftest.mjs): lines **981** and **2461**
(strategy-validation, marker-bounded) and line **2500** (*"etf live deflatedSharpe delegates to
RLVALID.rlvDeflatedSharpe with (equityCurve, trialCount, ANN=252)"*). The **1207 → 1216** assertion delta was
**not** independently re-measured in this pass — only the 1216 / 0 total was run.

**Value** — the same asset yields the same Sharpe everywhere; volatility drag becomes visible where four tools
already depend on it.

**Change**
1. New UMD dual module `rlmetrics.js` (same shape as the adapters — `module.exports` + global attach, **no
   ESM**): `annualizedVol`, `cagr`, `arithmeticMean`, `sharpeArithmetic`, `sharpeGeometric`, `volatilityDrag`,
   `kellyFraction`.
2. Adopt **one** default — recommended: **arithmetic Sharpe** (Sharpe 1966/1994) as `sharpe`, with
   `sharpeGeometric` available and explicitly labelled at each use. Document in `rlmetrics.js` and
   [`../notes/volatility-drag-research.md`](../notes/volatility-drag-research.md).
3. Replace the three call sites (§5.5).
4. Show `drag = annArith − cagr` in `etf-momentum-lab`, where both terms already sit in one object.

**Verify**
```bash
grep -rn 'sqrt(ANN)\|(cagr - .*) / annVol' *.html rl*.js rlexperience-adapters/*.js scripts/*.mjs | grep -v rlmetrics.js   # empty
node -e "const m=require('./rlmetrics.js'); console.log(typeof m.sharpeArithmetic, typeof m.volatilityDrag)"
node scripts/selftest.mjs
```
**Done when** zero Sharpe implementations exist outside `rlmetrics.js` and drag renders in at least one tool.

---

### Step 7 · Bounded history & performance — **1 d**

**Status: RESOLVED** *(2026-08-03)* — closes §5.6. [`../market-brief.html`](../market-brief.html) contains
**zero** references to `brief-history.jsonl`; line 997 fetches `brief-history.recent.jsonl` instead, under the
line-994 comment *"the BOUNDED window (last 30 runs, compact projection)"* — **10,106 B** at `HEAD`, against a
**2,866,445 B** append log that is no longer fetched at all. The whole first load across the seven fetched files
is **155,050 B (151 KB)**, inside the budget: `market-brief.page.json` 95,712 ·
`market-brief.snapshot.page.json` 25,805 · `market-brief.scorecard.json` 12,049 · `brief-history.recent.jsonl`
10,106 · `market-brief.config.page.json` 7,705 · `market-brief.tools.page.json` 2,604 · `watchlist.json` 1,069.
(§5.6 records 155,029 B — that figure was taken against the dirty working tree; 155,050 B is the committed
`HEAD` sum.) The budget is declared, not implicit — `briefFirstLoadMaxBytes: 204800` at
[`../tool-experience.config.json`](../tool-experience.config.json) line 140, asserted at
[`../scripts/selftest.mjs`](../scripts/selftest.mjs) line 5140 alongside the adversarial half at line 5146 that
makes the budget bind. `scripts/shard-brief-history.mjs` shards into `briefs/tier-a/2026-07.jsonl` and
`briefs/tier-a/2026-08.jsonl`. **Not verified:** `Change` item 4 — deferring non-critical panels on the heaviest
pages — was not re-measured, the same gap §5.10 declares for its page-weight figures.

**Value** — the brief loads fast today and stays fast in year three.

**Change**
1. Shard `brief-history.jsonl` → `briefs/history/tier-a/<YYYY-MM>.jsonl`; keep `brief-history.recent.jsonl`
   (last ~30 runs) as the page's default fetch; load older months on demand.
2. Point `market-brief.html` at the recent window only.
3. Add the byte budget to `artifactBudgets` in [`../tool-experience.config.json`](../tool-experience.config.json)
   and assert it in `selftest.mjs`, so the defect cannot silently return.
4. Defer non-critical panels on the heaviest pages behind the existing Simple/Power switch.

**Verify**
```bash
[ "$(stat -c%s brief-history.recent.jsonl)" -lt 204800 ] && echo RECENT-UNDER-200KB
node scripts/selftest.mjs                                  # now includes the budget assertion
```
**Done when** first-load payload < 200 KB and the budget assertion fails loudly if exceeded.

---

### Step 8 · Journeys & discovery — **2 d**

**Status: RESOLVED** *(2026-08-03)* — **including the test sub-step, contrary to the record kept elsewhere.**
Closes §5.4 and §5.10. `tools.json` has **0 ungrouped of 23**. [`../index.html`](../index.html) renders grouped
`.toolgroup` sections from the registry (line 882-885) sorted `byUpdatedDesc` (line 870) with an `Ungrouped`
catch-all (line 903-908), behind a live `#toolFilter` search input (line 509) with a match count (line 512);
`rlnav.js` groups from the registry too (`groupedItems()`, line 70, used at line 204). `rljourney.js` is loaded
by [`../rlapp.js`](../rlapp.js) line 634 via `ensureSharedScript`, and `tests/tool-discovery.spec.mjs` exists.
**The self-injected anchor is gone.** This step's own **Verify** pattern `setAttribute('data-rljourney-mount'`
matches **nothing** under `tests/` at `HEAD` (exit 1), and neither does a broader sweep for
`insertAdjacentHTML` / `dataset.rljourneyMount` / `createElement…journey`. `tests/journey-mobile.spec.mjs`
`mountJourneyOnPage()` states it directly: *"Nothing is injected: the four-view shell renders the
`[data-rljourney-mount]` anchor inside its Journey panel and calls the REAL production boot path
`RLAPP.mountJourney()` itself … deliberately stronger than the old self-injected host **it replaces**."*
`tests/journey.spec.mjs` line 138 carries a dedicated test under the banner *"Step 8 — the journey surface must
SHIP, not be test-injected"*, whose body reads *"NOTHING is injected here: no `addScriptTag`, no
`createElement`, no `setAttribute`. If the anchor only existed because the other tests in this file build it,
this test fails."* The only `addScriptTag` calls load the **real** `rlapp.js` module as a boot fallback, never an
anchor. Consequently [`Improvement-Plan.md`](Improvement-Plan.md) Step 8's *"Retained obligation"* —
*"`tests/journey-mobile.spec.mjs` still does"* — is **stale at `HEAD`**; correcting it belongs to that document's
owner and is not touched by this pass.

**Value** — 48 designed scenarios become reachable; 25 tools become navigable.

**Change**
1. Mount `[data-rljourney-mount]` on the brief and on each tool page that owns journeys. Replace
   `tests/journey-mobile.spec.mjs`'s self-injected anchor with an assertion against the **real shipped**
   surface. *(If Step 2 decided to delete, this sub-step is the deletion instead.)*
2. Add a `group` field to each `tools.json` entry — *Market Structure · Options & Flow · Rotation & Macro ·
   Strategy & Validation · Fundamentals · Place-based · Personal*. Render grouped sections in `index.html` and
   `rlnav.js` **from the registry**, never hardcoded.
3. Client-side filter over title + blurb + tags; sort within group by `updated`. No dependency, no build.

**Verify**
```bash
jq -r '.tools[] | select(.group == null) | .id' tools.json          # empty
grep -rn "setAttribute('data-rljourney-mount'" tests/               # empty
npx --no-install playwright test tests/tool-discovery.spec.mjs --config=playwright.config.mjs --project=system-chrome
```
**Done when** every tool has a group, filtering works, and no test fabricates its own mount point.

---

### Step 9 · Durability — **1–2 d**

**Status: RESOLVED** *(2026-08-03)* — closes §5.9 and the CI-and-direction half of §5.7.
[`../.github/workflows/tier-a.yml`](../.github/workflows/tier-a.yml) runs Tier A on a GitHub Actions clock:
`schedule:` at line 14 with **8 `cron` entries** (lines 18-25 — the four ET windows across both DST seasons),
plus `workflow_dispatch` at line 26. CI runs everything, blocking:
[`../.github/workflows/pages.yml`](../.github/workflows/pages.yml) line 34 runs the full
`node scripts/selftest.mjs` and line 52 the **whole** Playwright suite
(`--project=system-chrome`, no single-spec path) — not 1 of 28. [`Product-Principles.md`](Product-Principles.md)
exists (10,505 B), and the two bootstrap-template strings §5.7 named (`double-charges`, `Replace examples`)
match **nowhere** in [`../.specify/memory/constitution.md`](../.specify/memory/constitution.md) at `HEAD`. The
staleness banner ships rather than being planned: [`../rlbrief.js`](../rlbrief.js) `renderFreshness()` line 681
emits `absent` / `unknown` / `stale` / `aging` states from a `staleAfterHours` policy (default 72) and
deliberately renders nothing when fresh. **Deviation:** the **Verify** line
`grep -c 'TODO' .specify/memory/constitution.md # 0` returns **1** — the sole match is line 26, the prohibition
*"No commented-out code, no TODOs, no stubs"* itself. The command is a false positive; no template text
survives.

**Value** — every guarantee above becomes self-enforcing.

**Change**
1. Extend the `verify` job in [`../.github/workflows/pages.yml`](../.github/workflows/pages.yml) to run
   `node scripts/selftest.mjs` (the full suite) **and** the full Playwright suite (28 specs). Deploy stays gated on it.
2. Move **Tier-A** (deterministic, no LLM) to a GitHub Actions cron — it needs only `data/` and the adapters.
   Tier-B may stay operator-hosted; the page must render a truthful *"narrative not refreshed this window"*
   state when absent.
3. Add a **staleness banner** when `payload.generatedAt` is older than one window.
4. Write `docs/Product-Principles.md`; replace the template business invariants in
   [`../.specify/memory/constitution.md`](../.specify/memory/constitution.md) with §12 below.

**Verify**
```bash
gh workflow view pages --yaml | grep -c 'selftest.mjs'      # >= 1
grep -c 'TODO' .specify/memory/constitution.md              # 0
```
**Done when** CI runs everything, a missed window is visibly declared, and the constitution has no template text.

---

### Sequencing

```
1  Close the injection sink ... 15min   🔴 credential path shut; markup renders correctly
2  Truth pass .................. 0.5d   1.05 MB reachable-or-gone; BUG-001 closed
3  Wire the adapters ........... 2-3d   coverage 5 → 11+;  most visible change
4  Score the ledger ............ 2-3d   ⚠ first hit-rate ever produced
5  Surface calibration ......... 1-2d   the moat becomes a number
6  One metric spine ............ 1-2d   numbers stop contradicting
7  Bounded history ............. 1d     fast now, fast in year three
8  Journeys & discovery ........ 2d     48 scenarios reachable; shelf navigable
9  Durability .................. 1-2d   CI + cadence + written direction
                                ≈ 11-16 focused days
```

Steps 1, 2 and 3 are independent. Step 5 needs 4. Steps 6–9 are independent of all.

**Do Step 1 today — it is fifteen minutes. If only one further step is ever done: Step 4.**

---

## 12. Anti-drift contract

Targets the measured drift: 1,678 open DoD items, 2.7 : 1 planning-to-product, 1.05 MB shipped-but-hidden, 215
proposals with 0 outcomes, 1 superseded bug left open.

| # | Rule | Enforced by |
|---|---|---|
| **D1** | **Escape at every sink.** No model- or config-authored string reaches `innerHTML` without `esc()`. | grep sweep in `selftest.mjs` (Step 1) |
| **D2** | **Reachable or removed.** Nothing ships to the site root without a registry entry and a nav entry. | selftest registry↔disk assertion (Step 2) |
| **D3** | **Wired or not shipped.** No shared module lands without a production consumer. *Tests are not consumers.* | selftest consumer assertion |
| **D4** | **One definition per concept.** A financial metric is defined once, in one module. | grep assertion (Step 6) |
| **D5** | **Every claim is scoreable.** A recommendation without a machine-checkable invalidation is emitted `not-evaluable` — never silently unscoreable. | `evaluate-recommendations.mjs` |
| **D6** | **Additive contracts only.** Schemas extend; history is never rewritten. | append-only assertion |
| **D7** | **Budgets are assertions.** Every number in `performanceBudgets` / `artifactBudgets` has a failing test. | selftest |
| **D8** | **Superseding closes the superseded.** A bug or spec whose contract is reversed by a later artifact is closed or withdrawn in the same change. | artifact-lint / review |
| **D9** | **Spec cap.** No new spec above ~40 FR or ~5 scopes without a written exception. Split instead. | review discipline |
| **D10** | **No spec blocks on another spec's *status*** — only on a real, named, missing capability. | dependency-gate review |
| **D11** | **UMD, never ESM,** for shared browser+Node code. `file://` capability is a product feature. | code review + selftest |
| **D12** | **Admission test.** *Does this improve decision quality, or its measurement?* If neither, it does not ship. | product principles |

### Business invariants — to replace the constitution template

- **BI-1** Every displayed figure carries a provenance class (`observed-fact` / `user-assumption` /
  `model-estimate` / `unavailable`). Unprovenanced numbers never render.
- **BI-2** Missing data renders as *unavailable* or *incomplete* — **never zero, never inferred, never a
  plausible placeholder.**
- **BI-3** Confidence is evidence quality, **never** a win probability. Only the scorecard may state realised
  frequencies.
- **BI-4** All committed artifacts are **tickers-only**. No sizes, cost basis or P&L in the public repo, ever.
- **BI-5** The scorecard publishes **misses with equal prominence to hits.** Selective reporting is the one
  unrecoverable failure for this product.
- **BI-6** Every tool works with no key, no proxy and no account — degrading honestly rather than breaking.
- **BI-7** Model-authored text is **data, never markup.** It is escaped at every rendering sink.

---

## 13. What not to build

| Don't | Why |
|---|---|
| Migrate to ES modules / add a bundler | Breaks `file://`; UMD already solves it |
| Rewrite tool models | Already extracted and contract-declared, 23/23 |
| Add tool #24 before the scorecard ships | Tool count is not the constraint; integration and feedback are |
| Real-time options flow | SpotGamma and Unusual Whales own it via proprietary feeds |
| Order execution / brokerage | Composer owns it; converts an educational tool into a regulated one |
| Finish specs 013–016 as written | 11,165 spec lines, 1,022 open DoD, zero code. Re-scope under D9 against the admission test |
| Multi-user accounts, auth, hosting | Single-operator is a **feature** — it is what permits publishing the miss rate |
| Keep synthetic filings in `smart-money-flow-lab` | Quiver's **free** tier beats it. Use real data or cut the tool |

---

## 14. The view after Step 9

> **Status pass — 2026-08-04.** The narrative below is preserved as its **original point-in-time
> picture of the finished state**; not one sentence has been removed or softened. Each claim it
> makes is re-measured **individually** first — none is inferred from "§11 mostly shipped".
> `RESOLVED`, `PARTIAL` and `OPEN` cite the file, line or command output actually read or run;
> `UNVERIFIED` means the claim was **not** re-measured in this pass and must not be read as either.
> Where a measurement contradicts the narrative, **the measurement is the current fact** and the
> narrative is the as-written-then record. The working tree is dirty — another session's
> uncommitted changes and this session's uncommitted `scripts/*` edits are both present — so every
> citation is taken from committed `HEAD` (`git grep … HEAD`, `git show HEAD:<path>`,
> `git cat-file -s HEAD:<path>`), never from an uncommitted file.
>
> **Read the numbers in the first paragraph as illustration, not measurement.** They were written
> to show the *shape* of a scorecard that did not yet exist. It exists now, so they have real
> counterparts — and four of the five are materially different, one of them by an order of
> magnitude and in the damaging direction.

#### Measured against the narrative — 2026-08-04

| # | Claim below | Measured at committed `HEAD` | Status |
|---|---|---|---|
| 1 | The scorecard, not a chart, is first on the page | `#scorecard` line 783 before `#attention` line 801 | **RESOLVED** |
| 2 | "412 calls" | **464** proposed events; **197** distinct recommendations | **OPEN** |
| 3 | "61 % resolved in favour" | `hitRate` **0.5333** | **OPEN** |
| 4 | "at a stated 60 % confidence it realised 57 %" | only published bucket is 50-59: stated 0.564, realised 0.600 | **OPEN** |
| 5 | "8 % were not machine-evaluable" | `notEvaluableShare` **0.8333** | **OPEN** |
| 6 | Three most recent misses, with what invalidated them | `recentMisses` 3, each with `reasonCode` and `invalidatedBy` | **RESOLVED** |
| 7 | "Under that, seven cards" | `attention` holds 7; `attentionMaxCards` 7 | **RESOLVED** |
| 8 | "Each is one scannable line" | card titles **401–496 characters** | **OPEN** |
| 9 | "then what changed, then why it matters" | `what` 7 of 7, `why` 7 of 7 | **RESOLVED** |
| 10 | "then the level that would prove it wrong" | **0 of 7** cards carry an invalidation field | **OPEN** |
| 11 | Gamma, swing structure and the session auction are live | all three `analyzed` | **RESOLVED** |
| 12 | Clicking any card lands in the tool that owns the math | `deepLink` 7 of 7 | **RESOLVED** |
| 13 | "the same numbers, because there is only one implementation of each" | two private `deflatedSharpe` duplicates | **PARTIAL** |
| 14 | "Forty-eight of them, reachable" | browser audit: `journeyGoals=48` on the brief, `Journey` tab on 23 of 23 pages | **RESOLVED** |
| 15 | Model text renders as text, with a CSP behind it | sweep empty, exit 1; CSP on 26 of 26 pages | **RESOLVED** |
| 16 | "`rlmetrics.js` defines Sharpe once" | one default, two duplicates outside the module | **PARTIAL** |
| 17 | "Nothing on disk is invisible" | 10 paths declared excluded; live site not fetched | **PARTIAL** |
| 18 | History file under 200 KB, and a test fails if not | 10,106 B; budget asserted in selftest | **RESOLVED** |
| 19 | CI ran every selftest assertion and all 28 browser specs | whole suite, no spec path; **33** specs tracked | **RESOLVED** |
| 20 | Tier-A ran on a laptop-independent schedule | 8 `cron` entries plus `workflow_dispatch` | **RESOLVED** |
| 21 | A missed narrative window is declared in plain language | `renderFreshness` plus `staleAfterHours` 72 | **RESOLVED** |
| 22 | "already queued to be scored against tomorrow" | closures on 2 calendar days, last 2026-08-02 | **PARTIAL** |
| 23 | "publishes its own error rate" | published, on 30 resolved of 180 closed | **RESOLVED** |

**The scorecard paragraph — the surface RESOLVED, four of its five numbers OPEN.** The position is exactly as
described: `<div id="scorecard">` at [`../market-brief.html`](../market-brief.html) line 783 precedes
`<div class="feed" id="attention">` at line 801, and `RLBRIEF.renderScorecard` at line 947 runs before
`renderAttention` at line 952. The numbers now have measurable counterparts, and they read differently:

| Narrative says | Committed `HEAD` says |
|---|---|
| 412 calls | **464** `proposed` events across `2026-07.jsonl` and `2026-08.jsonl`; **197** distinct `recommendationKey` values |
| 61 % resolved in favour | `windows.all.hitRate` **0.5333** — 16 satisfied against 14 invalidated, on 30 resolved |
| at a stated 60 % confidence, realised 57 % | there is **no published 60 % bucket**. `calibration` withholds `60-69` as `insufficientSample: true` with `realised: null`. The only bucket that publishes a realised rate is `50-59`: stated **0.564**, realised **0.600** |
| 8 % not machine-evaluable | `notEvaluableShare` **0.8333** |
| over 90 days | `90d` is identical to `all` (`closed 180`) — the ledger is younger than the window |

The last row of that table is the one to sit with. The narrative imagined a brief that could not score 8 % of
its own calls; the shipped brief cannot score **83 %** of them. That is not a rendering gap — `not-evaluable`
is a first-class, deliberately un-forced outcome, and §5.3 and §11 Step 4 both record it as the largest class
by design. But it means the headline rate rests on **30 resolved calls out of 180 closed**, and the honest
reading of the finished state is *"the ledger closes, and most of what it closes it cannot judge."* Stating
that is the product's whole posture; glossing it would be the one failure `BI-5` names as unrecoverable.

**The three misses — RESOLVED.** `recentMisses` carries exactly 3 entries, each with `instrument`,
`direction`, `horizon`, `confidence`, `deepLink`, `proposedAt`, `closedAt`, a `reasonCode` such as
`invalidation-level-below-743.2`, and an `invalidatedBy` object giving the close, the level, the relation and
`sessionsToResolve`. *"In full, with what invalidated them"* is literally what ships.

**The seven cards — count and reasoning chain RESOLVED, the two shape claims OPEN.** The `attention` array
holds exactly **7** entries against `thresholds.attentionMaxCards: 7`, and every one carries `what`, `why` and
a `deepLink` — so *"what changed, then why it matters"* and *"clicking any card lands in the tool that owns
that math"* both hold, 7 of 7. Two claims do not. Card titles measure **469, 496, 478, 436, 415, 401 and 425
characters**; *"one scannable line"* — and §10.1's *"≤ 120-char headline"* — is missed by 3× to 4× on every
card. And **no card carries an invalidation field at all**: the card keys are `confidence`, `deepLink`,
`domain`, `horizon`, `rank`, `structuralAnchor`, `title`, `what`, `why`. *"The level that would prove it
wrong"* lives on a different, smaller object — the 5 `recommendations`, which do carry `trigger`,
`invalidation` and `levels`. The reader of a card is not shown the invalidation the narrative promises them.

**The three live reads — RESOLVED.** `gamma-trading-lab`, `swing-structure-lab` and `intraday-tape-lab` are
each `analyzed` in the committed payload — *"computed this morning … not narrated around a gap"* is true of
all three the narrative names.

**"Only one implementation of each" and "`rlmetrics.js` defines Sharpe once" — both PARTIAL.** One convention
ships (`rlmetrics.js` line 183 exports `sharpe: sharpeArithmetic`), but `function deflatedSharpe` is defined
twice — [`../etf-momentum-lab.html`](../etf-momentum-lab.html) line 1457 and
[`../strategy-validation-lab.html`](../strategy-validation-lab.html) line 680 — each annualising its own
per-period Sharpe privately at line 1467 and line 690. This is the live **D4** violation recorded against §11
Step 6. A reader clicking through from a card to one of those two tools can be shown a Sharpe the shared
module never computed.

**"Nothing on disk is invisible" — PARTIAL.** `site-exclusions.json` (`pages-site-exclusions/v1`) declares 10
files, so they are no longer shipped-and-hidden; but that is the third disposition §11 Step 2's own contract
forbids, and the **live Pages state was not fetched** in this pass.

**The durability paragraph — RESOLVED throughout.** The fetched history file is `brief-history.recent.jsonl`
at **10,106 B**, inside the declared `briefFirstLoadMaxBytes: 204800`, with the whole first load at
**155,050 B**; the 2,866,445 B append log is referenced only in a comment.
[`../.github/workflows/pages.yml`](../.github/workflows/pages.yml) line 34 runs the full selftest and line 52
the whole Playwright project with no spec path — **33** `tests/*.spec.mjs` are tracked at `HEAD`, so the
narrative's *"all 28 browser specs"* is met as 33 of 33; the denominator grew, the guarantee did not weaken.
[`../.github/workflows/tier-a.yml`](../.github/workflows/tier-a.yml) carries **8 `cron` entries** (lines 18-25)
plus `workflow_dispatch` (line 26). The missed-window declaration ships as code —
[`../rlbrief.js`](../rlbrief.js) `renderFreshness()` line 679 against a `staleAfterHours: 72` policy at
[`../market-brief.config.json`](../market-brief.config.json) line 584, whose own note commits to the exact
behaviour the narrative describes: *"An absent payload is NOT treated as fresh - it renders the explicit
'narrative not refreshed this window' state."* **Not verified:** that banner was not exercised in a browser in
this pass; the code path and the policy are what were read.

**"Already queued to be scored against tomorrow" — PARTIAL.** The queue exists and has run, but not on the
cadence this sentence implies. All 180 closures fall on **two days**, 2026-07-31 (150) and 2026-08-02 (30),
and none has been written in the two days to 2026-08-04. A claim made this morning is queued; whether it is
scored tomorrow is not yet something the record supports.

**The closing line — RESOLVED, with its sample stated.** The brief does publish its own error rate: a
`hitRate` of **0.5333** with **14 invalidated** calls and the three most recent misses shown in full. The
claim in the last sentence is earned. The number behind it rests on 30 resolved calls, and the honest version
of that sentence carries the sample with it.

You open the site on a Thursday morning.

The first thing on the page is not a chart. It is a number: **over 90 days this brief made 412 calls; 61 %
resolved in favour; at a stated 60 % confidence it realised 57 %; 8 % were not machine-evaluable and are listed
as such.** Below it, the three most recent misses, in full, with what invalidated them.

Under that, seven cards. Each is one scannable line, then what changed, then why it matters, then the level that
would prove it wrong. The gamma card is live — computed this morning from the option chain on disk, not narrated
around a gap. So is swing structure. So is the session auction read. Clicking any card lands in the tool that
owns that math, showing the same numbers, because there is only one implementation of each.

If you want to be walked through something, the journeys are there: *prepare the next market session*, *define a
level trigger and invalidation*, *decide whether an edge survives*. Forty-eight of them, reachable.

Behind the page: every string the model wrote is rendered as text, never markup, and a CSP stands behind that.
`rlmetrics.js` defines Sharpe once. Nothing on disk is invisible. The history file the page downloads is under
200 KB and always will be, because a test fails if it is not. CI ran every selftest assertion and all 28 browser
specs before this deploy. Tier-A ran on a schedule that does not care whether a laptop was open, and if the narrative lane
missed a window the page says so in plain language instead of showing yesterday as today.

And every claim it makes this morning is already queued to be scored against tomorrow.

That is the product: **not another dashboard — the only market brief that publishes its own error rate.**

---

## 15. Provenance

| Claim class | Established by |
|---|---|
| Counts, sizes, ratios | Direct measurement (`wc`, `stat`, `jq`, `ls`, `comm`, `grep`, `curl`) at HEAD, 2026-07-31 |
| Code behaviour | Source reading with file + line citations |
| Test health | `node scripts/selftest.mjs` → 1,005 passed / 0 failed, exit 0 (count grows with active development) |
| Live-site state | HTTP checks against the published Pages site |
| Competitive facts | Vendor pages fetched 2026-07-31 |
| Security assessment | Static source reading of sink and storage paths; **no exploit was constructed or executed** |
| Effort estimates | **Derived judgement**, explicitly not measured |

No spec artifact, `state.json`, or scope file was modified in producing this review.
