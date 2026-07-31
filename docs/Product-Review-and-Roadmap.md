# Research Lab — Product Review & Delivery Roadmap

> **Date:** 2026-07-31 · **Type:** product review + executable roadmap (diagnostic; no spec artifacts mutated)
> **Method:** line-by-line source reading, registry/disk diffing, live-site HTTP checks, `node scripts/selftest.mjs`
> execution (970 passed / 0 failed), and competitive research. Every claim below cites the file or command it came
> from. Derived numbers are labelled as derived.
>
> **Companion documents:** [`DomainModel.md`](DomainModel.md) (product-domain SST) ·
> [`../notes/market-brief.md`](../notes/market-brief.md) (agent runbook) ·
> [`../notes/volatility-drag-research.md`](../notes/volatility-drag-research.md) (independent finding, corroborated here)

---

## 0. Corrections to the first-pass review

This document supersedes an earlier verbal review. Three of its conclusions were **wrong** and are corrected
here, because a roadmap built on them would have destroyed value.

| # | First-pass claim | Verified reality | Consequence |
|---|---|---|---|
| **C1** | *"Models are trapped in 25 single-file HTMLs; extract them to ES modules."* | **Already extracted.** [`../simple-models.json`](../simple-models.json) declares **23 of 23** tools with `adapterId` + `adapterModule` + `parameterDefinitions` + `resultSchemaId` + `provenancePolicy`. The 7 modules in [`../rlexperience-adapters/`](../rlexperience-adapters) are **UMD dual modules** — their own header says *"Ships as a UMD dual module: Node (`module.exports`) for tests, and browser"*. They load in Node **today**. | The recommended rewrite was already done, in a **better** shape than proposed. ES modules would have **broken** `file://` offline capability (module scripts are CORS-gated; classic scripts are not). **Do not migrate to ESM.** |
| **C2** | *"`simple-models.json` has 2 definitions."* | Misread of `jq keys` — those were the 2 **top-level keys**. `.definitions` has **23** entries, one per registered tool. | The model-contract layer is complete, not embryonic. |
| **C3** | *"Fixing 5/23 brief coverage needs an architectural rewrite."* | It needs **~6 functions**. [`../scripts/brief-refresh.mjs`](../scripts/brief-refresh.mjs) `featureRequire`s exactly **one** adapter (`macro-rotation.js`, line 1096). That one module backs 4 of the 5 tools that currently show `analyzed`. The publish chain is already **generic**: [`../scripts/brief-distributed-publish.mjs`](../scripts/brief-distributed-publish.mjs) line 184 keys purely off `hasOwnProperty(toolReads, toolId)`. | Adding one `buildXToolRead()` auto-upgrades that tool end-to-end with **zero** downstream changes. Days, not months. |

**What this means:** the project is *not* architecturally broken. It is **built and unplugged**. That is a far
better position — and a far cheaper fix — than the first pass concluded.

---

## 1. Verified findings

### F1 — The system proposes and never scores  ✅ *confirmed, not falsified*

```
briefs/history/recommendations/2026-07.jsonl   215 rows
  eventType "proposed"                         215
  satisfied / invalidated / expired / withdrawn / unresolved / not-evaluable   0
```

Falsification attempts, all negative: no other month files exist; no close event appears anywhere under
`briefs/`; no script emits `closures`. The lifecycle vocabulary
([`../rlcontracts.js`](../rlcontracts.js) line 720 `CLOSE_EVENT_TYPES`) and the reducer (line 1134
`reduceRecommendationEvents`) exist and are tested — their **only** callers are `scripts/selftest.mjs` and two
test files. **Zero production callers.**

Compounding: archive rows are hash-keyed (`recommendationKey: sha256:…`) and carry **no body**. The
instrument / direction / levels / trigger / invalidation live only in
[`../market-brief.payload.json`](../market-brief.payload.json), overwritten every run. Recoverable from **95**
git commits; nothing extracts them.

**Every recommendation already carries `trigger`, `invalidation`, `levels`, and `confidence`.** The scoring
inputs are present and unused.

### F2 — 18 of 23 tools are structurally invisible to the brief, not merely stale  ✅ *confirmed and sharpened*

Last run: **5 analyzed · 11 stale · 7 not-relevant.**

The `stale` label understates it. [`../scripts/brief-refresh.mjs`](../scripts/brief-refresh.mjs) line 1175
falls back to `'browser-or-agent-read'` — *"consume its latest browser toolRead when present"*. But browser
tool reads are written to **`localStorage`** (`RLDATA.putToolRead`, [`../rldata.js`](../rldata.js) line 445),
and no path exports localStorage into the Node pipeline (grep of `scripts/*.mjs` for `putToolRead|toolRead`
returns only `brief-distributed-publish.mjs` reading the *snapshot*).

The system says so itself — [`../scripts/brief-distributed-publish.mjs`](../scripts/brief-distributed-publish.mjs)
line 12: *"the **5 tools** that carry a server-side Tier-A read…"*. **The number 5 is hardcoded into its own
documentation.**

So those 11 tools are not stale-this-window. They are **permanently unreachable** by the scheduled run, and the
hedged "STALE THIS WINDOW" prose is an LLM narrating around a wiring gap.

**And the gap is trivially closable — verified:**

| Tool | Adapter (exists, Node-loadable) | Exported summary fn | Data on disk |
|---|---|---|---|
| `gamma-trading-lab` | `options.js` | `computeGammaPlaybookSummary` | **8 / 8** chains |
| `options-structure-lab` | `options.js` | `computeSurfaceSummary`, `computeSurfaceFlipLevel` | **4 / 4** chains |
| `swing-structure-lab` | `market-structure.js` | `computeSwingTransitionSummary` | **7 / 7** bars |
| `intraday-tape-lab` | `market-structure.js` | `computeSessionAuctionSummary` | **7 / 7** bars |
| `technical-analysis-decision-lab` | `market-structure.js` | `computeTechnicalFiveGateSummary` | bars present |
| `market-heatmap-lab` | `market-structure.js` | breadth/structure primitives | 289 bars |
| `volatility-sizing-lab` | `market-structure.js` | `regimeBand`, vol primitives | bars present |

Adapters: ✅ exist · Data: ✅ **100 %** present · Publish chain: ✅ already generic · **Missing: the wiring.**

### F3 — ~1.05 MB of finished product is deployed but undiscoverable  ✅ *confirmed*

Live HTTP checks against the production site:

```
trend-dynamics-cycle-lab.html            HTTP 200   312,641 B   (3,500 lines)
portfolio-survival-allocation-lab.html   HTTP 200    49,577 B   (1,201 lines)
```

Both are absent from **all five** registries (`tools.json`, `simple-models.json`, `journeys.json`,
`market-brief.config.json`, `index.html`) and from `rlnav.js`. Plus: `journeys.json` (117 KB, 48 journeys) +
`rljourney.js` (62 KB) — no page carries the `[data-rljourney-mount]` anchor;
[`../rlapp.js`](../rlapp.js) line 366 states the boot hook is *"inert"* on every real page, and
`tests/journey-mobile.spec.mjs` **injects the anchor itself** to test it. Plus `rlfx.js` (82 KB) + universe
(37 KB) with no page; `rlcausal.js` (48 KB) with no `<script src>`.

### F4 — Two contradictory Sharpe conventions ship in the flagship data path  ✅ *confirmed verbatim*

```js
// scripts/brief-refresh.mjs:1090   → feeds the brief
sharpe: (cagr - riskFree) / annVol                 // GEOMETRIC numerator

// etf-momentum-lab.html:1568       → same convention (consistent)
var sharpe = annVol > 0 ? (cagr - state.rf) / annVol : null;

// rlexperience-adapters/strategy-research.js:163  → the OTHER definition
var sharpe = sd > 1e-9 ? (mean / sd) * Math.sqrt(ANN) : 0;   // ARITHMETIC
```

Same asset, two answers, depending on path. Also `etf-momentum-lab.html:1605` holds `cagr` **and** `annArith`
in one object and never subtracts them — volatility drag is depended on in four tools and displayed in none
(independently found in [`../notes/volatility-drag-research.md`](../notes/volatility-drag-research.md)).

### F5 — Direction is undocumented; enforcement is unwired  ✅ *confirmed*

- [`../.specify/memory/constitution.md`](../.specify/memory/constitution.md) is the **unmodified bootstrap
  template**, still containing `*Example: Bookings must never result in double-charges*` and
  `> **TODO:** Replace examples with your project's actual business invariants.`
  [`DomainModel.md`](DomainModel.md) honestly flags this.
- There is **no** `docs/Product-Principles.md`.
- CI ([`../.github/workflows/pages.yml`](../.github/workflows/pages.yml)) runs **1 of 28** Playwright specs
  (Palm Springs) and **0 of 970** selftest assertions. The test investment is real; the enforcement is not.
- The landing page [`../index.html`](../index.html) line 438 tells every visitor *"browser credential use is
  **disabled** until a complete same-document provider policy is approved"* — while
  `specs/_bugs/BUG-002-two-tier-provider-access` is **`done`** and both tiers ship.

### F6 — Planning inventory is the real bottleneck  ✅ *confirmed*

| Measure | Value |
|---|---|
| `specs/` markdown | **199,606** lines |
| tool HTML + shared JS (the product) | **73,274** lines |
| ratio | **2.7 : 1** |
| DoD items | **742 checked / 1,678 unchecked** |
| specs `not_started` with code already shipped | 004 (103 FR), 006 (83 FR), 008 (150 FR) |

Spec 015 — *the outcome ledger, i.e. the fix for F1* — is `blocked` by gate G089 on the **status** of 007/012/013.
Its own `blockedReason` concedes: *"the code 015 depends on already EXISTS and is green… G089 is blocking on
SPEC STATUS bookkeeping, not on missing capability."*

**Governance is currently the binding constraint on product value.**

### F7 — Unbounded flagship payload  ✅ *confirmed live*

```
GET /brief-history.jsonl → HTTP 200, 2,369,626 B
107 runs · 22,146 B/run · 4 runs/day  ⇒  ~30 MB after one year   [derived]
```

Fetched **in full** by [`../market-brief.html`](../market-brief.html) line 864 on every page load. No cap, no
rotation, no windowing.

### F8 — Single-laptop single point of failure  ✅ *confirmed*

[`../notes/market-brief.md`](../notes/market-brief.md) §2: *"Tier A (data) + Tier B (narrative) — **on THIS
MacBook** (macOS `launchd`, 4×/day)"*. The product's core cadence depends on one laptop being awake.

### F9 — Discovery does not scale to 25 tools  ✅ *confirmed*

`index.html` renders one flat `<h2 class="section">Tools</h2>` list; `rlnav.js` renders one flat list. **No
grouping, no search, no filter, no recency.** Mobile/a11y is otherwise good (viewport 26/26, `aria-label`
24/26, `@media` 23/26) with one gap: `prefers-reduced-motion` in only **3/26**.

---

## 2. What was under-credited on the first pass

Recording these so the roadmap protects rather than disturbs them.

1. **The provenance contract is excellent.** `provenancePolicy.allowedClasses = [observed-fact,
   user-assumption, model-estimate, unavailable]` with `requireEvidenceCutoff: true`, applied uniformly
   across 23 model definitions. Nobody in the competitive set does this.
2. **The declared budgets are real engineering discipline.** `tool-experience.config.json` declares
   `validationMaxMs: 100`, `interactionMaxMs: 100`, `localRecomputeMaxMs: 250`, `layoutShiftMax: 0.1`,
   `cooperativeChunkMaxMs: 16`, plus artifact byte budgets. Most products never write these down.
3. **The UMD dual-module pattern is the correct answer** to "reusable in Node *and* browser *and* `file://`".
   It should be the template for all future shared code.
4. **The data layer is better than it needs to be** — ET date+window cache keys, XNYS-calendar session
   verification, `zero-observed` / `thin-observed` session states, dividend/split fail-closed handling,
   zero duplicate history requests across windows.
5. **The brief's prose quality is genuinely competitive** with paid research: specific levels, explicit gates,
   completed-bar discipline (*"add the growth/materials turn only on the completed 7/30-bar confirmation"*).

---

## 3. The product idea, stated correctly

### The user

One self-directed investor making **discretionary allocation decisions** across a small book
([`../watchlist.json`](../watchlist.json): QQQ, SPMO, VGT, MSFT), with limited attention, a strong aversion to
being sold to, and an AI agent able to do real research four times a day.

### The three problems, and who solves them

| # | Problem | Solved by | Research Lab today |
|---|---|---|---|
| 1 | **Attention** — what changed that I should act on? | SpotGamma *Founder's Note*, Unusual Whales *Mr. Whale* | Partly — 5/23 evidence |
| 2 | **Depth** — why? show me | TradingView, Koyfin, SpotGamma, Finviz | Yes — 23 tools, strong |
| 3 | **Feedback** — *was I right?* | **essentially nobody, honestly** | **No — 215 / 0** |

Everyone competes on 1 and 2. **Nobody can compete on 3**, because a subscription business cannot publish its
own miss rate. A single-operator, no-revenue, educational-only project **can** — and it is the only durable
edge available here.

Critically: **problem 3 is what makes 1 and 2 worth anything.** Without feedback a brief is opinion with extra
steps. With feedback, every card becomes a falsifiable hypothesis, every tool becomes a testable evidence
source, and the whole system becomes a *learning* loop — which the
[`../strategy-self-improvement-lab.html`](../strategy-self-improvement-lab.html) already gestures at, but only
on synthetic paths.

### The reframing

> **Research Lab is a closed-loop decision journal for a discretionary investor.**
> It tells you **what changed**, shows you **why**, records **what it claimed**, and **scores itself in public.**

Consequences that resolve most open questions:

- The 23 tools stop being products and become **evidence sources**. "Is this tool good?" becomes measurable:
  *does its read improve brief calibration?*
- The brief stops being a newsletter and becomes a **hypothesis generator**.
- The **ledger becomes the product.**
- Every future feature gets one admission test: **does it improve decision quality or its measurement?**
  That single test retires most of the 1,678 open DoD items without further debate.

---

## 4. Final state — what "done" looks like

A visitor (or the operator) opens the site and sees, in this order:

1. **The Scorecard, above the fold.** *"Over the last 90 days this brief made 412 calls. 61 % resolved in
   favour. Calibration: at stated 60 % confidence, realised 57 %. Worst domain: intraday tape (44 %). Best:
   sector rotation (68 %)."* With the misses listed, not hidden.
2. **The Brief** — ≤ 7 attention cards, each ≤ 120-char headline, each with `what` / `why` / levels /
   invalidation / confidence, each deep-linking the owning tool.
3. **Live evidence from every applicable tool.** Gamma flip and walls, options surface, swing structure,
   session auction, breadth — all `analyzed`, none narrated around a wiring gap. Non-applicable tools say
   *"not applicable"* and mean it.
4. **A navigable tool shelf** — grouped (Market Structure / Options & Flow / Rotation & Macro / Strategy &
   Validation / Fundamentals / Place-based), searchable, recency-aware.
5. **Every open recommendation tracked** against its own published invalidation line, closing itself when the
   market answers.

Behind it:

- One metric spine — one Sharpe convention, one volatility-drag primitive, one place each is defined.
- Every registered tool reachable; nothing deployed-but-hidden.
- `brief-history` sharded and windowed; first paint under budget on mobile.
- CI runs the whole 970-assertion selftest plus every Playwright spec on push.
- The cadence survives the laptop being closed.
- A written constitution and product principles that make the next feature decision a 30-second call.

**Measured definition of done**

| Metric | Today | Target |
|---|---|---|
| Tools contributing rich reads | 5 / 23 | **≥ 11 / 23** (all applicable) |
| Recommendation close events | 0 | **> 0 and rising every day** |
| Published calibration surface | none | **live on the brief** |
| Unreachable shipped assets | ~1.05 MB | **0 B** |
| Sharpe conventions in tree | 2 | **1** |
| `brief-history` bytes fetched on load | 2.37 MB | **< 200 KB** |
| Selftest assertions run in CI | 0 / 970 | **970 / 970** |
| Playwright specs run in CI | 1 / 28 | **28 / 28** |

---

## 5. The roadmap — nine verifiable steps

Design rules: **each step ships user-visible value on its own**, is **independently revertable**, and ends
with a **command that proves it**. No step depends on a later step. No step requires unblocking a spec.

Effort is *focused working time*, not elapsed time.

---

### Step 1 — Truth pass  · ~0.5 day · **unblocks nothing, fixes everything's credibility**

**Value:** the site stops misrepresenting its own capability, and ~1.05 MB stops being invisible.

**Change**
1. [`../index.html`](../index.html) line 438 — replace the "credential use is disabled" hero copy with the
   shipped two-tier reality (proxy · per-browser local key · public no-key paths).
2. Decide per orphan, then execute — **reachable or removed**, no third option:
   `trend-dynamics-cycle-lab`, `portfolio-survival-allocation-lab`, `rlfx.js` + `fx-regime-universe.json`,
   `rlcausal.js` + `causal-rotation-observations.json`, `journeys.json` + `rljourney.js`.
   Register (all 5 registries + `rlnav.js` + notes) or delete. The constitution's own *No Dead Code* principle
   already requires this.
3. Reconcile [`../README.md`](../README.md): tool table (22 rows → registry count) and the Layout section
   (14 of 25 entries).

**Verify**
```bash
# every root tool page is in the registry, and vice-versa
comm -3 <(ls *.html | grep -v '^index' | sed 's/.html//' | sort) <(jq -r '.tools[].id' tools.json | sort)
# expect: empty

grep -c 'browser credential use is disabled' index.html      # expect 0
[ "$(grep -cE '^\| \[`' README.md)" = "$(jq -r '.tools|length' tools.json)" ] && echo README-OK
```

**Done when:** all three commands pass and `node scripts/selftest.mjs` still exits 0.

---

### Step 2 — Capture the evidence  · ~1 day · **stops permanent loss, starting today**

**Value:** from this commit forward no recommendation is ever lost. Historical calls are recovered.

Every day without this discards ~28 recommendations. This is the cheapest high-consequence step in the plan.

**Change**
1. Extend the archive row in the recommendation writer so `briefs/history/recommendations/<month>.jsonl`
   carries the **body** alongside the existing hash: `instrument`, `direction`, `horizon`, `levels`,
   `trigger`, `invalidation`, `confidence`, `deepLink`, `structuralAnchor`.
   Keep `recommendationKey` — it stays the join key. **Additive only**; existing rows stay valid.
2. Write `scripts/backfill-recommendations.mjs` — walks the 95 commits of
   `market-brief.payload.json` and emits historical `proposed` rows with bodies, idempotently (skip on
   existing `eventId`).

**Verify**
```bash
node scripts/backfill-recommendations.mjs --dry-run   # prints recoverable count, writes nothing
node scripts/backfill-recommendations.mjs
jq -r 'select(.instrument == null) | .eventId' briefs/history/recommendations/*.jsonl | wc -l   # expect 0
jq -r '.eventType' briefs/history/recommendations/*.jsonl | sort | uniq -c
node scripts/selftest.mjs
```

**Done when:** every archive row carries a body, backfill is idempotent (second run adds 0 rows), selftest green.

---

### Step 3 — Wire the adapters  · ~2–3 days · **the most visible single improvement in the plan**

**Value:** the brief gains gamma flip + walls, options surface, swing structure, session auction, breadth and
the five-gate technical read. Coverage **5 → 11+**. Every tactical tool a trader actually opens before the bell
becomes live evidence instead of narrated hedging.

**Why it is this cheap:** adapters are UMD and Node-loadable today; data is **100 %** on disk (8/8, 4/4, 7/7,
7/7); the publish chain is already generic on `hasOwnProperty(toolReads, toolId)`.

**Change** — in [`../scripts/brief-refresh.mjs`](../scripts/brief-refresh.mjs), follow the existing
`buildEtfToolRead` template (line ~1093) once per tool:

```js
export async function buildGammaToolRead(deps = {}) {
  const model = deps.model || featureRequire('../rlexperience-adapters/options.js');
  // read data/options/<sym>.json + data/bars/<sym>.json → model.computeGammaPlaybookSummary(...)
  // → { id, asOf, read, metrics, deepLink, source: 'owning-tool-functions' }
}
```

Ship in value order, **one commit each** so any single one can be reverted:
`gamma-trading-lab` → `options-structure-lab` → `swing-structure-lab` → `intraday-tape-lab` →
`market-heatmap-lab` → `technical-analysis-decision-lab` → `volatility-sizing-lab`.

Each must fail **honestly**: missing chain ⇒ `unavailable` with a named reason, never a fabricated number.
Reuse the `catch` shape already in `buildEtfToolRead`.

**Verify** (after each commit)
```bash
node scripts/brief-refresh.mjs --dry-run
jq -r '.toolReads | keys | length' market-brief.snapshot.json          # +1 per commit
jq -r '.toolCoverage[] | .status' market-brief.payload.json | sort | uniq -c
node scripts/validate-brief-payload.mjs
node scripts/selftest.mjs
```

**Done when:** `analyzed` ≥ 11, no tool that has its data on disk reports `stale`, and the hardcoded "5 tools"
comment at `brief-distributed-publish.mjs:12` is updated to the real number.

---

### Step 4 — Score the ledger  · ~2–3 days · **the first honest answer to "was I right?"**

**Value:** the first hit-rate number this project has ever produced.

**Change**
1. `scripts/evaluate-recommendations.mjs`, run at the start of every brief cycle:
   - load open `proposed` recommendations (no close event) from the archive;
   - for each, evaluate its **own published** `trigger` / `invalidation` / `levels` against the fresh
     `data/bars/` snapshot;
   - emit close events through the **existing, already-tested** `RLCONTRACTS.reduceRecommendationEvents`
     `closures` path — `satisfied` · `invalidated` · `expired` (horizon elapsed) · `unresolved` ·
     `not-evaluable` (invalidation not machine-checkable).
2. Wire it into `brief-refresh-and-push.sh` **before** the Tier-B author lane, so the narrative agent can see
   its own prior record.

Honesty rules, non-negotiable: `not-evaluable` is a **first-class outcome**, never silently dropped.
Close events are **append-only** — a correction is a new event, never an edit.

**Verify**
```bash
node scripts/evaluate-recommendations.mjs --dry-run --as-of 2026-07-30
jq -r '.eventType' briefs/history/recommendations/*.jsonl | sort | uniq -c   # close events now present
# idempotence: second run must add zero events
node scripts/evaluate-recommendations.mjs && A=$(wc -l < briefs/history/recommendations/2026-07.jsonl) \
  && node scripts/evaluate-recommendations.mjs && B=$(wc -l < briefs/history/recommendations/2026-07.jsonl) \
  && [ "$A" = "$B" ] && echo IDEMPOTENT-OK
node scripts/selftest.mjs
```

**Done when:** close events exist, the evaluator is idempotent, and `not-evaluable` is populated (proving it
is not quietly forcing verdicts).

---

### Step 5 — Surface calibration  · ~1–2 days · **the moat becomes visible**

**Value:** the differentiator stops being a claim and becomes a number on the page.

**Change**
1. `scripts/build-scorecard.mjs` → `market-brief.scorecard.json`: rolling 30/90/all-time resolved counts,
   hit-rate **by horizon, by domain, by confidence bucket**, a calibration table (stated vs realised), and the
   **N most recent misses in full**.
2. Render it in [`../market-brief.html`](../market-brief.html) **above** the attention feed. Small, honest,
   unspun. Include the `not-evaluable` share — hiding it would be the exact dishonesty this project exists to
   avoid.
3. Add the sample-size guard the codebase already applies elsewhere: below a stated minimum, print
   *"insufficient resolved sample (n = X)"* rather than a percentage.

**Verify**
```bash
node scripts/build-scorecard.mjs && jq -r '{resolved, hitRate, byConfidence, notEvaluableShare}' market-brief.scorecard.json
npx --no-install playwright test tests/market-brief-scorecard.spec.mjs --config=playwright.config.mjs --project=system-chrome
node scripts/selftest.mjs
```

**Done when:** the scorecard renders above the fold, shows misses, and refuses to print a rate below the
minimum sample.

---

### Step 6 — One metric spine  · ~1–2 days · **numbers stop contradicting each other**

**Value:** the same asset yields the same Sharpe on every surface, and volatility drag becomes visible where
four tools already depend on it.

**Change**
1. New UMD dual module `rlmetrics.js` (same shape as the adapters — `module.exports` + global attach, **no
   ESM**, `file://` preserved): `annualizedVol`, `cagr`, `arithmeticMean`, `sharpeArithmetic`,
   `sharpeGeometric`, `volatilityDrag`, `kellyFraction`.
2. Pick **one** default convention, document it in `rlmetrics.js` and in
   [`../notes/volatility-drag-research.md`](../notes/volatility-drag-research.md). Recommendation:
   **arithmetic Sharpe** (Sharpe 1966/1994) as `sharpe`, with `sharpeGeometric` available and explicitly
   labelled wherever used.
3. Replace the three call sites: `scripts/brief-refresh.mjs:1090`, `etf-momentum-lab.html:1568`,
   `rlexperience-adapters/strategy-research.js:163`.
4. Surface drag where both terms already coexist — `etf-momentum-lab.html:1605` holds `cagr` **and**
   `annArith`; show `drag = annArith − cagr` with a glossary tooltip.

**Verify**
```bash
grep -rn 'sqrt(ANN)\|(cagr - .*) / annVol' *.html rl*.js rlexperience-adapters/*.js scripts/*.mjs \
  | grep -v rlmetrics.js        # expect empty
node -e "const m=require('./rlmetrics.js');console.log(m.sharpeArithmetic, m.volatilityDrag)"
node scripts/selftest.mjs
```

**Done when:** zero Sharpe implementations outside `rlmetrics.js`, and drag renders in at least one tool.

---

### Step 7 — Performance & bounded history  · ~1 day · **the flagship stops getting slower forever**

**Value:** the brief loads fast today and stays fast in year three.

**Change**
1. Shard `brief-history.jsonl` to `briefs/history/tier-a/<YYYY-MM>.jsonl`; keep a small
   `brief-history.recent.jsonl` (last ~30 runs) as the page's default fetch. Load older months only on demand.
2. `market-brief.html` fetches the recent window only.
3. Add a byte budget to the existing `artifactBudgets` block in
   [`../tool-experience.config.json`](../tool-experience.config.json) and enforce it in `selftest.mjs`, so this
   defect cannot silently return.
4. Defer-load the heaviest tool pages' non-critical panels behind the existing Simple/Power switch
   (`sector-research-lab` 245 KB, `etf-momentum-lab` 242 KB, `msft-july-print-model` 226 KB).

**Verify**
```bash
[ "$(stat -c%s brief-history.recent.jsonl)" -lt 204800 ] && echo RECENT-UNDER-200KB
curl -s -o /dev/null -w '%{size_download}\n' --max-time 20 https://pkirsanov.github.io/research-lab/brief-history.recent.jsonl
node scripts/selftest.mjs   # now includes the artifact-budget assertion
```

**Done when:** first-load payload < 200 KB and the budget assertion fails loudly if exceeded.

---

### Step 8 — Discovery  · ~2 days · **25 tools become navigable**

**Value:** the toolbox stops being a wall.

**Change**
1. Add a `group` field to each `tools.json` entry — *Market Structure · Options & Flow · Rotation & Macro ·
   Strategy & Validation · Fundamentals · Place-based · Personal*. Render grouped sections in `index.html` and
   `rlnav.js` **from the registry** (never hardcoded).
2. Client-side filter box over title + blurb + tags. No dependency, no build.
3. Sort within group by `updated`.
4. Resolve journeys: either mount `[data-rljourney-mount]` on the brief (Step 1 may already have decided) or
   delete the pair. **The test that injects its own anchor must not survive either way** — replace it with one
   that asserts the real shipped surface.

**Verify**
```bash
jq -r '.tools[] | select(.group == null) | .id' tools.json    # expect empty
npx --no-install playwright test tests/tool-discovery.spec.mjs --config=playwright.config.mjs --project=system-chrome
grep -rn "setAttribute('data-rljourney-mount'" tests/            # expect empty
```

**Done when:** every tool has a group, filtering works, and no test fabricates its own mount point.

---

### Step 9 — Durability  · ~1–2 days · **it can no longer rot silently**

**Value:** every guarantee above becomes self-enforcing.

**Change**
1. Extend [`../.github/workflows/pages.yml`](../.github/workflows/pages.yml) `verify` job:
   `node scripts/selftest.mjs` (all 970) **and** the full Playwright suite (28 specs), not just Palm Springs.
   Deploy stays gated on `verify`.
2. Move Tier-A (deterministic, no LLM) to a GitHub Actions cron — it needs only `data/` + adapters and removes
   the laptop from the critical path for the data layer. Tier-B (narrative) may remain operator-hosted; the
   brief must render a **truthful** "narrative not refreshed this window" state when it is absent.
3. Add a **staleness banner**: if `payload.generatedAt` is older than one window, say so on the page.
4. Write `docs/Product-Principles.md` and replace the template
   [`../.specify/memory/constitution.md`](../.specify/memory/constitution.md) business invariants with the real
   ones (§6 below is the starting draft).

**Verify**
```bash
gh workflow view pages --yaml | grep -c 'selftest.mjs'    # expect >= 1
gh run list --workflow=pages --limit 1
# simulate a missed window and confirm the banner renders rather than showing stale data as fresh
```

**Done when:** CI runs everything, a missed brief window is visibly declared, and the constitution contains no
`TODO` or template example.

---

## 6. Anti-drift contract

The drift being prevented is specific and already measured: **1,678 open DoD items, 199,606 spec lines, 2.7 : 1
planning-to-product, 1.05 MB shipped-but-hidden, 215 proposals with 0 outcomes.** These rules target exactly
that.

| # | Rule | Enforced by |
|---|---|---|
| **D1** | **Reachable or removed.** No artifact may be committed to the site root without a registry entry and a nav entry. | `selftest.mjs` registry↔disk assertion (Step 1) |
| **D2** | **Wired or not shipped.** No shared module may be committed without at least one production consumer. Tests are not consumers. | `selftest.mjs` consumer assertion |
| **D3** | **One definition per concept.** A financial metric is defined once, in one module. | grep assertion (Step 6) |
| **D4** | **Every claim is scoreable.** A recommendation without a machine-checkable `invalidation` must be emitted as `not-evaluable` — never silently unscoreable. | `evaluate-recommendations.mjs` |
| **D5** | **Additive contracts only.** Archive/payload schemas extend; they never rewrite history. | append-only assertion |
| **D6** | **Budgets are assertions, not aspirations.** Every number in `performanceBudgets` / `artifactBudgets` has a failing test. | `selftest.mjs` |
| **D7** | **Spec size cap.** No new spec above ~40 FR or ~5 scopes without a written exception. Split instead. | review discipline |
| **D8** | **No spec may block on another spec's *status*** — only on a real, named, missing capability. If the code exists, the gate is wrong. | G089 dependency review |
| **D9** | **UMD, never ESM,** for shared browser+Node code. `file://` capability is a product feature. | code review + `selftest.mjs` |
| **D10** | **The admission test.** Every proposed feature answers: *does this improve decision quality, or the measurement of decision quality?* If neither — it does not ship. | product principles |

**Draft business invariants** to replace the constitution template (currently `Example: Bookings must never
result in double-charges`):

- **BI-1** A displayed figure must carry a provenance class (`observed-fact` / `user-assumption` /
  `model-estimate` / `unavailable`). Unprovenanced numbers never render.
- **BI-2** Missing data renders as *unavailable* or *incomplete*. **Never zero, never inferred, never a
  plausible placeholder.**
- **BI-3** Confidence is evidence quality, **never** a win probability. Only the scorecard may state realised
  frequencies.
- **BI-4** The watchlist and all committed artifacts are **tickers-only**. No sizes, cost basis, or P&L in the
  public repo, ever.
- **BI-5** The scorecard publishes **misses with equal prominence to hits.** Selective reporting is the one
  unrecoverable failure for this product.
- **BI-6** Every tool must work with no key, no proxy, and no account — degrading honestly rather than
  breaking.

---

## 7. What NOT to build

Against the 1,678 open DoD items, these are the explicit **no**s. Each is a decision, not a deferral.

| Don't | Why |
|---|---|
| Migrate to ES modules / add a bundler | Breaks `file://`; UMD already solves it (**C1**) |
| Rewrite tool models | They are already extracted and contract-declared (**C2**) |
| Add tool #24 before the scorecard ships | Tool count is not the constraint; integration and feedback are |
| Real-time options flow | SpotGamma/Unusual Whales own it via proprietary feeds. Honest EOD is a *different* product, not a worse one |
| Order execution / brokerage | Composer owns it; it converts an educational tool into a regulated one |
| Finish specs 013/014/015/016 as written | 11,165 spec lines, 1,022 open DoD, zero code. Re-scope under D7 against the admission test |
| Multi-user accounts, auth, hosting | Single-operator is a **feature** — it is what permits publishing the miss rate |
| Replace synthetic filings in `smart-money-flow-lab` | Quiver's **free** tier beats it. Either link out or cut it |

---

## 8. Sequencing summary

```
Step 1  Truth pass ........................ 0.5d   credibility; ~1.05 MB reachable-or-gone
Step 2  Capture the evidence ............... 1d    nothing lost from here on; 95 commits recovered
Step 3  Wire the adapters .................. 2-3d  coverage 5 → 11+  ← most visible single change
Step 4  Score the ledger ................... 2-3d  first hit-rate ever produced
Step 5  Surface calibration ................ 1-2d  the moat becomes a number on the page
Step 6  One metric spine ................... 1-2d  numbers stop contradicting
Step 7  Performance & bounded history ...... 1d    fast today, fast in year three
Step 8  Discovery .......................... 2d    25 tools become navigable
Step 9  Durability ......................... 1-2d  CI + cadence + written direction
                                            ≈ 12-17 focused days
```

Steps 1–3 are independent and may run in any order. Step 4 requires Step 2. Step 5 requires Step 4. Steps 6–9
are independent of all of the above.

**If only one step is ever done: Step 2.** It is one day, and every day without it permanently discards ~28
recommendations — the exact evidence the product's only durable advantage is built from.

---

## 9. The view after Step 9

You open the site on a Thursday morning.

The first thing on the page is not a chart. It is a number: **over 90 days this brief made 412 calls; 61 %
resolved in favour; at stated 60 % confidence it realised 57 %; 8 % were not machine-evaluable and are listed
as such.** Below it, the three most recent misses, in full, with what invalidated them.

Under that, seven cards. Each is one scannable line, then what changed, then why it matters, then the level
that would prove it wrong. The gamma card is live — computed this morning from the option chain on disk, not
narrated around a gap. So is swing structure. So is the session auction read. Clicking any card lands in the
tool that owns that math, with the same numbers, because there is only one implementation of each.

Behind the page: every registered tool is reachable and grouped; a filter box finds any of them in two
keystrokes; nothing on disk is invisible. `rlmetrics.js` defines Sharpe once. The history file the page
downloads is under 200 KB and always will be, because a test fails if it is not. CI ran 970 assertions and 28
browser specs before this deploy. Tier-A ran on a schedule that does not care whether a laptop was open, and if
the narrative lane missed a window the page says so in plain language instead of showing yesterday as today.

And every claim it makes this morning is already queued to be scored against tomorrow.

That is the product: **not another dashboard — the only market brief that publishes its own error rate.**

---

## 10. Provenance

| Claim class | How established |
|---|---|
| Counts, sizes, ratios | Direct measurement (`wc`, `stat`, `jq`, `ls`, `comm`, `curl`) in the repository at HEAD, 2026-07-31 |
| Code behaviour | Direct source reading with file + line citations |
| Test health | `node scripts/selftest.mjs` → **970 passed / 0 failed**, exit 0 |
| Live-site state | HTTP checks against `pkirsanov.github.io/research-lab` |
| Competitive facts | Vendor pages fetched 2026-07-31 (SpotGamma, Unusual Whales, Quiver, Koyfin, OpenBB, Composer) |
| Effort estimates | **Derived judgement**, explicitly not measured |
| Corrections in §0 | Falsification of this reviewer's own prior claims; each cites the evidence that overturned it |

No spec artifact, `state.json`, or scope file was modified in producing this review.
