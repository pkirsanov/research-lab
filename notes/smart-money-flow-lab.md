# Smart-Money & Congressional-Flow Lab — Analysis Notes & Methodology

> **Audience: the next agent / analyst who continues this work.**
> The tool (`smart-money-flow-lab.html`) is a single self-contained HTML file — all logic and
> all data are inline in that file, no build step, no network calls.
>
> **As-of / reference date: 2026-07-05.** The bundled sample uses this as "today" so signal ages
> are deterministic offline.
>
> **Not investment advice. The bundled filings are synthetic illustrations** (role-based filers,
> not real people or real trades) chosen to demonstrate the disclosure-lag mechanic honestly.

---

## 0. Why this tool exists

It is the honest answer to the viral "let Claude/a bot copy what insiders and politicians buy"
genre (QuiverQuant-style copy-trading, auto-executed alerts). Those clips quote cherry-picked
winners and — critically — **ignore the disclosure lag**: you can only act on a filing *after* it
is public, by which point much of the informational edge has decayed. This lab makes that cost
the headline number instead of hiding it.

It deliberately has **no execution and no live scraping** — the video's "auto-trade on whatever a
Discord posts" step is a signal-spoofing security hole and is out of scope on purpose.

Sibling in ethos: `strategy-self-improvement-lab` ("the viral loop, done honestly").

---

## 1. The model (exact math — all in the one `<script>` block)

### 1.1 Edge decay — `alphaDecay(ageDays, halfLifeDays)`

Fraction of a filing's information edge retained at a given age:
`retained = 2^(−age / half-life)`. Invariants: `=1` at age 0, `=0.5` at one half-life, strictly
decreasing, always in `(0,1]`. This single function powers both freshness and the lag haircut.

### 1.2 Disclosure lag — `dayGap(txnISO, disclosedISO)`

Whole days between the transaction and the public filing (clamped ≥ 0, NaN-safe → 0). This is the
number the hype clips omit. Characteristic real-world lags (see the in-tool research panel):
Form 4 ≈ **2 business days**; STOCK Act ≈ **30–45 days**; 13F ≈ **up to 45 days after quarter-end**.

### 1.3 Consensus / conviction — `consensusScore(nFilers, netUsd, recencyDays, halfLifeDays)`

`breadth × (1 + size) × freshness` where
`breadth = log2(1 + nFilers)`, `size = log10(1 + |netUsd| / 100k)`, `freshness = alphaDecay(recency, HL)`.
Monotonic ↑ in distinct filers and |net $|, ↓ in recency. A cluster of independent buyers dominates
one big ticket by design.

### 1.4 Realistic vs naive — `realisticEdgeFraction(disclosureLagDays, halfLifeDays)`

`= alphaDecay(lag, HL)`. **Naive** conviction treats lag as 0 (act at transaction time — the hype
number); **realistic** = naive × this fraction (act at disclosure time). Their ratio is
**edge retained**, shown per name and weighted across the set for the verdict.

### 1.5 Aggregation & summary

`aggregate()` groups the filtered trades per ticker → distinct filers, net $ (buys-only or
buys−sells per the Side control), most-recent disclosure age, average transaction→disclosure lag,
then naive/realistic/retained. `summary()` weights `retained` and `avgLag` by naive conviction for
the headline verdict.

---

## 2. Controls (state levers)

- **Edge half-life (days)** — the one modeling assumption; shorter = harsher lag penalty.
- **Filer types** — all / congress / insider / institution.
- **Side** — buys only, or net (buys − sells; lets insider selling turn a name negative).
- **Min distinct filers** — the cluster gate (require consensus).
- **Reference "today"** — where signal age is measured from (default 2026-07-05).
- **Filing data textarea** — editable CSV (`ticker,filer,type,side,usd,txn,disclosed`); Apply/Reset.

Simple view = the reality-check verdict + 4 metrics + 2 charts. Power view adds the per-ticker
consensus ledger and the editable data panel.

---

## 3. The sample dataset (synthetic)

`SAMPLE[]` in the HTML — role-based filers only (e.g. "Senator C (STOCK Act)", "Officer B (Form 4)",
"Fund X (13F)"). Chosen so the three filing types show their characteristic lags: a tight fresh
NVDA insider cluster (edge mostly retained), a long-lag GEV congressional cluster (heavy haircut),
a stale MU 13F echo (little left), and a TSLA insider-sell case. **Not real trades.** Replace it via
the textarea for your own (still non-live) analysis.

---

## 4. Honest caveats (keep these load-bearing)

- Scores are **conviction reads, not win-rates**. The only job is to make the lag cost visible.
- Survivorship / cherry-picking dominate the marketed copy-trading results.
- A filing hides size, horizon, hedges, options overlays, blind-trust/tax context.
- 13F is a **quarterly snapshot up to 45 days stale** — the manager may already be out.
- No live data, no execution, no scraping — by design.

---

## 5. Validation checklist (run after any change)

`node scripts/selftest.mjs` must stay green. The `smart-money-flow-lab.html` group asserts:
`alphaDecay(0)=1`, `alphaDecay(H,H)=0.5`, monotone-decreasing, in (0,1]; `consensusScore` monotone ↑
in filers and $ and ↓ in recency; `realisticEdgeFraction` equals the decay at the lag; a 45-day
signal with a 15-day half-life retains ≈ 12%. Then drive the page and confirm: verdict changes from
"fresh enough" → "mostly a rear-view mirror" as you drag the half-life down; charts don't grow on
resize (DPR guard); Apply/Reset data works; cluster gate hides thin single-filer names.

---

## 6. Continue — next-round ideas

- Add a real (still non-live, downloaded) disclosure snapshot as an editable JSON universe, mirroring
  the other tools' `*-universe.json` convention (keep it clearly dated and non-advice).
- Model **per-filer skill** (some filers' disclosures historically lead more than others) as an
  editable multiplier — still transparent, still not a forecast.
- Add a horizon control (does the retained edge differ at 1w / 1m / 3m holds?).
- Cross-link: names that also light up in `sector-research-lab` (rotation) or `options-structure-lab`
  (dealer positioning) are higher-confluence — a future shared-cache tie-in.

---

## 7. Change log

- **2026-07-05** — Initial build. Disclosure-lag edge-decay model, cluster-consensus scoring,
  naive-vs-realistic reality-check verdict, decay + naive/realistic charts, editable synthetic
  filing set, Simple/Power views. Authored as the honest counterpart to the copy-trading hype genre.
