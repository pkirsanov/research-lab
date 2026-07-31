# Research Lab — Product Review & Delivery Roadmap

**Date:** 2026-07-31 · **Type:** product review + executable roadmap · **Scope:** whole product
**Method:** line-by-line source reading, registry↔disk diffing, live-site HTTP checks, `node scripts/selftest.mjs`
(1,005 passed / 0 failed, exit 0), competitive research. Every number is measured at HEAD unless marked *derived*.
**Related:** [`DomainModel.md`](DomainModel.md) · [`../notes/market-brief.md`](../notes/market-brief.md) ·
[`../notes/volatility-drag-research.md`](../notes/volatility-drag-research.md)

---

## 1. Verdict

**The problem is correctly chosen. The architecture is sound and largely built. The product is unplugged from
itself — and one unescaped line puts the user's provider keys within reach of its own AI output.**

| | Fact | Meaning |
|---|---|---|
| **1** | One LLM-authored payload field renders into `innerHTML` **unescaped**, on the same origin that stores provider API keys | A credential-exfiltration path with no CSP backstop — **fix first, one line** |
| **2** | The flagship brief draws real evidence from **5 of 23** tools | The cockpit synthesises the slow tools and ignores every fast one |
| **3** | **579** recommendation events archived, **0** ever scored | Bodies are now durable; nothing yet closes a call |
| **4** | **~1.05 MB** of finished product is deployed but unreachable — including all **48** user journeys | The user-scenario layer ships to nobody |

Items 2–4 are **wiring gaps** between components that already exist, are tested, and work. Remediation is
measured in days.

---

## 2. What exists today

### 2.1 Inventory

| Surface | Count / size | State |
|---|---|---|
| Registered tools ([`../tools.json`](../tools.json)) | 23 | all `live` |
| Tool pages on disk | 25 (+ `index.html`) | 2 unregistered |
| Declared model contracts ([`../simple-models.json`](../simple-models.json)) | **23 / 23** | complete |
| Shared adapters ([`../rlexperience-adapters/`](../rlexperience-adapters)) | 7 modules, 488 KB | UMD dual-module, Node-loadable |
| User journeys ([`../journeys.json`](../journeys.json)) | **48** | **0 mounted** |
| Playwright specs | 28 files, 60 tool-references | **every tool has ≥ 1**; CI runs 1 |
| Selftest assertions | 1,005 *(growing)* | pass; **0 run in CI** |
| Committed market data | 289 daily-bar files, 23 option chains | fresh, same-origin |
| Brief runs to date | 107 | 4×/day cadence |
| `specs/` markdown | 199,606 lines | 742 DoD done / **1,678 open** |
| Product code (tool HTML + shared JS) | 73,274 lines | — |

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
  provider. 12 of 25 tool pages hydrate through it.
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

### 3.3 The 48 designed journeys — built, unmounted

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

**None is reachable.** No page carries the `[data-rljourney-mount]` anchor; [`../rlapp.js`](../rlapp.js)
line 366 states the boot hook is *"inert"* on every real page, and `tests/journey-mobile.spec.mjs` injects the
anchor itself in order to test it.

Note *"Define a level trigger and invalidation"* — that journey is the exact input the recommendation ledger
needs. The pieces were designed to fit; they were never connected.

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

### 5.1 · LLM-authored content reaches `innerHTML` unescaped — **critical**

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

| Asset | Size | Live? | In any registry? |
|---|---|---|---|
| `trend-dynamics-cycle-lab.html` | 305 KB / 3,500 lines | HTTP **200** | no (0 of 5) |
| `journeys.json` + `rljourney.js` | 179 KB / 48 journeys | — | not mounted |
| `portfolio-survival-allocation-lab.html` | 49 KB / 1,201 lines | HTTP **200** | no (0 of 5) |
| `rlfx.js` + `fx-regime-universe.json` | 119 KB | — | no page exists |
| `rlcausal.js` + observations | 83 KB | — | no `<script src>` anywhere |

The project's own constitution principle *No Dead Code* already forbids this state.

### 5.5 · Two contradictory Sharpe conventions in the flagship data path — **high**

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

`GET /brief-history.jsonl` → HTTP 200, **2,369,626 B**, fetched in full by
[`../market-brief.html`](../market-brief.html) line 864 on every page load. 107 runs × 22,146 B/run × 4 runs/day
⇒ **~30 MB after one year** *(derived)*. No cap, no rotation, no windowing.

### 5.7 · Direction undocumented, enforcement unwired — **high**

- [`../.specify/memory/constitution.md`](../.specify/memory/constitution.md) is the **unmodified bootstrap
  template**, still containing `*Example: Bookings must never result in double-charges*` and
  `> **TODO:** Replace examples with your project's actual business invariants.`
- No `docs/Product-Principles.md`.
- CI ([`../.github/workflows/pages.yml`](../.github/workflows/pages.yml)) runs **1 of 28** Playwright specs and
  **none of the ~1,000 selftest assertions**. The test investment is real; the enforcement is not.

### 5.8 · A superseded High bug left open — **medium**

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

[`../notes/market-brief.md`](../notes/market-brief.md) §2: *"Tier A (data) + Tier B (narrative) — **on THIS
MacBook** (macOS `launchd`, 4×/day)"*. The core cadence depends on one laptop being awake. The current payload
is from the prior session's `after-hours` window.

### 5.10 · Discovery does not scale — **medium**

`index.html` and `rlnav.js` each render **one flat list** of 25 tools. No grouping, no search, no filter, no
recency. Accessibility is otherwise sound — viewport 26/26, `aria-label` 24/26, `@media` 23/26, `:focus` 18/26,
`aria-live` 14/26, `keydown` 12/26, and **zero** inline `onclick` on non-interactive elements (no keyboard
traps). Two polish gaps: `focus-visible` 11/26 and `prefers-reduced-motion` 3/26. Heaviest pages: 305 / 245 /
242 / 226 KB — fine on desktop, heavy on mobile.

### 5.11 · Planning inventory is the binding constraint — **medium**

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
10. Widen the key-free path — **12 of 25** tool pages hydrate through `RLDATA.ensure*`, which serves committed
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

---

## 11. Roadmap

Each step ships user-visible value alone, is independently revertable, and ends with a command that proves it.
No step depends on a later one. No step requires unblocking a spec. Effort is *focused working time*.

---

### Step 1 · Close the injection sink — **15 min** · 🔴 *do today*

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
