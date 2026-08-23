# Long/Short Horizon Ladder Lab

**Status: REGISTERED AND LIVE.**
[`horizon-ladder-lab.html`](../horizon-ladder-lab.html) and
[`horizon-ladder-universe.json`](../horizon-ladder-universe.json) ship, are
reachable from `tools.json`, `index.html`, `rlnav.js` and both READMEs, and are
published by the pages build. Both `site-exclusions.json` staging decisions were
removed in the same change that registered the route, which the pages build
enforces.

Tool id `horizon-ladder-lab`. Group `Strategy & Validation`.

Validate with:

```
node scripts/selftest.mjs
node scripts/validate-tool-experience.mjs
node scripts/validate-brief-payload.mjs
node scripts/build-pages-site.mjs
```

The suite carries 49 assertions for this tool under the group
`Horizon Ladder Lab — the probability gate withholds until a cell is earned`.

## Metric ownership: what this tool delegates and what it owns

Product Principle 18 requires reusing the owning implementation rather than
redefining a metric. Two questions had to be settled separately, because the
answer differs.

**Delegated.** `smaArr` and `pivots` are owned by
`rlexperience-adapters/market-structure.js` (`RLMARKETSTRUCTURE`), and
`swing-structure-lab.html` states in its own source that these "live ONLY"
there. This tool loads that module and injects it, so there is one moving-average
formula and one pivot formula in the repository. Without the module the tool
withholds pivots and moving averages rather than falling back to a private copy,
and the suite pins that refusal.

**Not delegated, because no owner exists.** `analogs` is *not* exported by
`RLMARKETSTRUCTURE`; `swing-structure-lab` keeps its analog functions private to
its own page. There is therefore no importable owning implementation to consume.
This tool's analog engine is also a different question: swing scans a fixed
10-session forward window conditioned on MA alignment plus above/below POC and
reports at a minimum sample of 8, whereas this tool scans six declared horizons
conditioned on a volatility, MA-stack and distance-from-200 stratum and reports
at a minimum sample of 20. The two answer different questions at different
thresholds and must not be read as the same statistic.

**What delegation caught.** Adopting the owner's `smaArr` surfaced a real defect
in this tool: `smaArr` yields `null` through the warm-up window, and
`isFinite(null)` is `true` in JavaScript, so warm-up bars were being classified
`tangled` instead of refused and would have polluted every analog sample. The
classification now type-checks before it range-checks, and the suite pins the
null case directly.

One owner semantic was adopted rather than overridden. `RLMARKETSTRUCTURE.pivots`
compares non-strictly, so a perfectly flat series marks every interior bar as
both a high and a low. This tool does not keep a stricter private copy; the
refusal that matters happens downstream, where no level lies strictly beyond the
price so no target can be placed.

## Registration surfaces

Registration is a multi-file contract in this repository, not a single entry.
Every surface below had to move together, and the suite pins each one:

| Surface | What it carries |
| --- | --- |
| `tools.json` | Registry entry, unique `briefing.readAdapter` of `horizon-ladder-owning-model-v1`, experience block, simple-wiring decision |
| `index.html`, `rlnav.js` | Route in identical relative order to `tools.json` |
| `simple-models.json` | `simple-model/horizon-ladder/v1`, the one definition this tool owns |
| `journeys.json` | `gate-review` and `frontier-tradeoff` definitions plus their steps, matched both ways |
| `rlexperience-adapters/strategy-research.js` | `simple-adapter/horizon-ladder/v1` and its production factory registration |
| `rlexperience-adapters/market-structure.js` | Consumed, not modified. Supplies the owned `smaArr` and `pivots` formulas |
| `market-brief.payload.json` | Consumed, not modified. Supplies the owned event calendar with its declared scenario probabilities |
| `market-brief.payload.json`, `market-brief.snapshot.json` | Registry-wide coverage rows, each stating that the ladder publishes no rate |
| `README.md`, `notes/README.md` | Reader-facing rows |

The coverage rows are deliberately `not-relevant` and `browser-or-agent-read`
rather than `analyzed`. The ladder withholds a rate at all six horizons, so it
contributes no owning-tool conclusion to a brief window, and saying otherwise
would put a number into the cockpit that no resolved sample supports.

This brief is a design and a delivery record. It contains no candidate names, no
levels, and no probabilities, because the repository cannot yet substantiate
any.



## The request, and the honest translation

The request is a surface that reads the latest movements and emits ranked long
and short equity candidates at 1 week, 2 weeks, 1 month, 3 months, 6 months, and
1 year, restricted to high-probability names, sorted by probability and expected
move percent, grouped into lower-risk, high-reward, and high-probability
profiles.

Four parts of that are directly buildable: the six horizons, the long and short
directions, the expected-move percent, and the risk and reward profiles. One
part is not, and pretending otherwise would be the failure mode this repository
exists to prevent.

**"Only high probability" cannot be honestly satisfied on day one.** The
constraint is measured, published, and sitting in this repository. It is set out
in full below. The design's job is therefore to make that claim *earnable* on a
defined schedule, and to publish everything that is already true in the
meantime, rather than to invent a number that looks like the request.

## Why the probability claim is currently unavailable

Every figure in this section is read from committed repository state, not
asserted.

### The scored ledger has never issued a long or a short

`briefs/history/recommendations/2026-07.jsonl` and `2026-08.jsonl` hold 1,375
rows on contract `brief-recommendation-history-row/v2`.

| Field | Observed values |
| --- | --- |
| `direction` | `hold` 525, `hedge` 248, `rotate` 201, `trim` 105, `add` 56, null 240 |
| `horizon` | `swing` 677, `tactical` 240, `structural` 218, null 240 |
| `instrument` | 17 distinct non-null |

There is no `long` and no `short` row, at any horizon, ever. Every long/short
cell this tool would publish therefore begins with zero resolved outcomes.

### There is almost no single-name coverage

The 17 instruments are SPY 308, MSFT 213, VIX 169, SPMO 105, XLY 60, SOXX 59,
XLE 58, QQQ 52, XLK 46, XLP 16, XLI 14, XLF 12, XLRE 9, GLD 6, XLV 4, XLB 2,
ARM 2. Exactly two are individual companies. The repository is an index and
sector-ETF system that has scored two single names, one of them twice.

### The measured hit rates, and where the shortest horizon lands

From `market-brief.scorecard.json`, contract `brief-scorecard/v1`, generated
2026-08-20, policy `minResolvedSample: 20`:

| Cell | Resolved | Hit rate |
| --- | ---: | ---: |
| All calls, all time | 171 | 0.5205 |
| Horizon `structural` | 54 | 0.5741 |
| Horizon `swing` | 95 | 0.5895 |
| Horizon `tactical` | 22 | **0.0909** |
| Direction `hold` | 125 | 0.64 |
| Direction `hedge` | 22 | 0.0909 |
| Direction `rotate` | 13 | withheld, insufficient sample |
| Direction `trim` | 0 | withheld, insufficient sample |
| Direction `add` | 11 | withheld, insufficient sample |

The `tactical` bucket resolved 2 satisfied against 20 invalidated, and a further
26 calls expired without resolving. Its evaluation window is 3 sessions, read
from `outcome.windowSessions` on rows carrying `reasonCode:
horizon-tactical-elapsed`. Three sessions is shorter than the requested 1 week,
so `tactical` is the nearest measured neighbour to the two shortest requested
horizons rather than a match for them. It is the worst-performing cell in the
system by a wide margin, and it is the cell the request leans on hardest.

### No stated confidence above 60 has ever been validated

Calibration, all-time window:

| Stated bucket | Resolved | Stated | Realised |
| --- | ---: | ---: | ---: |
| below 50 | 0 | — | withheld |
| 50-59 | 152 | 0.554 | **0.500** |
| 60-69 | 18 | 0.608 | withheld, below the 20 minimum |
| 70-79 | 1 | 0.700 | withheld |
| 80 and above | 0 | — | withheld |

Two things follow. First, the only bucket with enough sample is already
mildly overconfident: stated 0.554 against realised 0.500. Second, the
repository has never accumulated enough resolved calls above 60 stated
confidence to know whether such a claim is calibrated at all. Across the whole
ledger only 7 of 1,135 confidence-bearing rows sit at or above 70, and 848 sit
at exactly 55.

A tool that printed "87% probability" would be extending a system whose only
measurable calibration bucket already realises below what it states, into a
range it has never once validated.

### More than half of closed calls produce no scoreable outcome

`eventType` across the ledger: `proposed` 799, `body-restored` 220,
`not-evaluable` 152, `satisfied` 89, `invalidated` 82, `expired` 33.

`not-evaluable` alone exceeds `satisfied` by a factor of 1.71. Of 356 closed
calls, only 171 resolved to satisfied or invalidated, so 48.0% of closed calls
produced a usable outcome. Scoreability, not accuracy, is the largest single
defect in the current pipeline, and a tool that emits six horizons times two
directions times a wider universe would multiply it unless scoreability is
enforced at mint time.

### The existing policy note already says this

`market-brief.scorecard.json` carries, verbatim:

> A rate is withheld below the minimum resolved sample. not-evaluable is never
> counted as a win. Confidence is evidence quality, not a win probability — only
> realised frequency below is a frequency.

The design below does not introduce that rule. It inherits it and extends it to
a new direction and horizon vocabulary.

## Probability and expected move are a frontier, not two sort keys

The request asks to sort by probability *and* expected move percent. Those two
quantities are not independent, and at short horizons they are close to
mutually exclusive. This is arithmetic, not opinion, and the tool must show it
rather than resolve it silently.

Let sigma-H be the horizon standard deviation of returns. For a 25% annualised
volatility name, sigma-daily is 0.25 divided by the square root of 252, and:

| Horizon | Sessions | 1-sigma move |
| --- | ---: | ---: |
| 1 week | 5 | 3.5% |
| 2 weeks | 10 | 5.0% |
| 1 month | 21 | 7.2% |
| 3 months | 63 | 12.5% |
| 6 months | 126 | 17.7% |
| 1 year | 252 | 25.0% |

Under a driftless normal terminal distribution, the probability of finishing
beyond a target placed k sigma away is:

| Target | Terminal probability | Approximate touch probability |
| --- | ---: | ---: |
| minus 1.0 sigma | 84.1% | — |
| minus 0.5 sigma | 69.1% | — |
| 0 sigma | 50.0% | 100% |
| plus 0.5 sigma | 30.9% | 61.7% |
| plus 1.0 sigma | 15.9% | 31.7% |
| plus 1.5 sigma | 6.7% | 13.4% |
| plus 2.0 sigma | 2.3% | 4.6% |

Touch probability is approximated at twice the terminal probability by the
reflection principle for a driftless walk, capped at 1.

The consequence is direct. A 70% terminal probability corresponds to a target
roughly 0.5 sigma *below* the entry for a long, which at 1 week for a 25%-vol
name is a target about 1.8% below where it trades now. "High probability" and
"large expected move" pull in opposite directions, and the shorter the horizon,
the more violently they do so, because sigma-H shrinks with the square root of
time while the probability function does not.

Two design obligations follow.

1. The tool must publish an **efficient frontier per horizon**, not one ranked
   list. Sorting by two conflicting keys without declaring the tradeoff would
   manufacture a ranking that the underlying distribution does not support.
2. Every candidate must declare `resolutionRule` as either `terminal` or
   `touch`. The same target carries roughly double the probability under `touch`
   as under `terminal`. A published probability without that field is
   meaningless, and comparing a `touch` row against a `terminal` row is the
   easiest way for this tool to lie by accident.

The frontier is also where the drift assumption must be stated. The tables above
set drift to zero. Any positive drift the tool applies is a forecast, so it must
be a declared, sourced, per-horizon input with its own provenance class, never a
silent constant folded into the probability.

## Ownership: a new tool, composing four existing owners

The repository holds 28 registered tools. The relevant ones already own the
maths this surface needs, and Product Principle 18 requires reusing the owning
implementation rather than redefining a metric.

| Need | Existing owner | Relationship |
| --- | --- | --- |
| Moving averages, pivots, alignment, regime band | `rlexperience-adapters/market-structure.js` | Consume `smaArr` and `pivots`. The page keeps no private copy of either formula. |
| Fixed 10-session pattern-analog odds | `swing-structure-lab` | Not importable: its analog functions are page-private and answer a different question at a different minimum sample. Deep-link, do not claim equivalence. |
| Per-expiry expected-move cones, IV, skew, term structure | `options-structure-lab` | Consume implied move where a chain exists. Do not re-derive greeks. |
| Volatility regime and vol-targeted position size | `volatility-sizing-lab` | Consume sigma and sizing. Do not re-implement vol targeting. |
| Regime and cycle change detection | `trend-dynamics-cycle-lab` | Consume regime state only. It must not assign directional credit. |
| Cross-sectional breadth and sigma-vs-sector outliers | `market-heatmap-lab` | Consume the cross-section. |
| Recommendation contract, scorecard, calibration, horizons | `market-brief` | Write into its append-only ledger. It stays the final aggregator. |

Nothing existing produces a cross-sectional, six-horizon, long-and-short,
base-rate-gated candidate ladder. `swing-structure-lab` is per-name and
single-horizon. `market-heatmap-lab` is cross-sectional but has no horizon or
direction contract. `market-brief` aggregates but does not screen.

So this is a **new tool that owns exactly one thing**: the composition rule that
turns per-name evidence from those owners into a horizon-by-direction ladder
with an earned-rate gate. Every number it shows either comes from an owner and
deep-links back, or is the composition itself.

It is a separate concern from the shock-transmission foundation proposed in
[global-systemic-risk-policy-reaction-audit-2026-08-22.md](global-systemic-risk-policy-reaction-audit-2026-08-22.md).
That foundation models macro transmission for agent-owned recurring dossiers.
This one is an interactive cross-sectional screener. Merging them would give one
surface two unrelated jobs.

## Contract

### Horizon vocabulary

The current vocabulary is three tokens, `tactical`, `swing`, `structural`, and
the note in the audit already calls for arbitrary declared horizons.
`market-brief.config.json` already carries a day-based band system at
`red-alert-policy/v1.horizonBands`, so the extension follows an existing shape
rather than inventing one.

| Horizon id | Sessions | Calendar | Existing band | Nearest existing token |
| --- | ---: | --- | --- | --- |
| `h1w` | 5 | 1 week | `0-2w` | none; `tactical` is 3 sessions |
| `h2w` | 10 | 2 weeks | `0-2w` | none |
| `h1m` | 21 | 1 month | `2-8w` | `swing` |
| `h3m` | 63 | 3 months | `2-6m` | none |
| `h6m` | 126 | 6 months | `2-6m` | `structural` |
| `h1y` | 252 | 1 year | `>6m` | none |

Add these additively. Do not redefine or retire `tactical`, `swing`, or
`structural`, because 1,135 historical rows are keyed to them and rewriting
history is forbidden.

### Direction vocabulary

Add `long` and `short` alongside `hold`, `hedge`, `rotate`, `trim`, `add`.
`short` is a directional claim about price, not an instruction to borrow stock,
and the tool must say so, since expressing it may require options or an inverse
vehicle whose costs it does not model.

### Candidate record

Each published candidate extends the existing row contract additively:

| Field | Meaning |
| --- | --- |
| `instrument` | Ticker |
| `direction` | `long` or `short` |
| `horizonId` | One of the six above |
| `entryReference` | The price the claim is measured from, with its timestamp |
| `target` | Absolute level and its distance in sigma |
| `invalidation` | Absolute level and its distance in sigma |
| `resolutionRule` | `terminal` or `touch` |
| `expectedMove` | P25, P50, P75 of the analog forward-return distribution |
| `sigmaHorizon` | The horizon sigma and how it was estimated |
| `impliedMove` | Option-implied move where a chain exists, else absent |
| `analogSample` | N, window, and the setup-class definition |
| `analogRate` | K of N, or withheld with N shown |
| `ledgerRate` | Rate for this direction-and-horizon cell, or withheld with resolved count shown |
| `regimeAtMint` | Regime state the analogs were conditioned on |
| `driftAssumption` | Declared drift and its provenance, or `zero` |
| `provenance` | Class per displayed figure |
| `deepLink` | Owning tool for the underlying evidence |
| `scoreableAt` | The timestamp at which resolution is machine-checkable |

### The earned-rate gate

A candidate may display a probability only when **both** samples clear their
minimum:

1. `analogSample.N` is at or above the declared analog minimum, and
2. the `ledgerRate` cell has at least `minResolvedSample` resolved outcomes,
   which is 20 under the existing policy.

If either fails, the row renders `insufficient-sample`, shows both counts, and
displays no number. It is never imputed as 0, never as 50, and never quietly
substituted with the analog rate alone.

On the day this ships, **every long and short cell fails condition 2**, because
the ledger holds zero such rows. That is the correct and intended initial state.
The tool publishes candidates with expected move, targets, invalidation, and
risk and reward, and it withholds the probability column with the resolved count
visible, so the reader can see exactly how far the system is from being able to
make the claim.

### How the claim becomes earnable

Twelve cells must each accumulate 20 resolved outcomes: six horizons times two
directions. Resolution latency differs sharply by cell, and the tool should show
the projected earn date per cell rather than one global promise.

| Cell | Sessions to resolve one call | Earliest date 20 can resolve |
| --- | ---: | --- |
| `h1w` | 5 | Fast; weeks, if enough candidates are minted |
| `h2w` | 10 | Fast |
| `h1m` | 21 | Months |
| `h3m` | 63 | Roughly a year of minting |
| `h6m` | 126 | Multiple years unless breadth is high |
| `h1y` | 252 | Multiple years |

This is the honest cost of the request. The two shortest horizons can earn a
rate soonest and are also the ones the existing record suggests will earn a poor
one. The longest horizons may never earn a rate at realistic minting volume,
and the tool should say `structurally-unearnable-at-current-breadth` rather than
leave a permanently empty cell implying a pending answer.

## Risk and reward profiles

The request names three groupings. Each becomes an explicit selection rule with
its own cost stated, because none of them is free.

| Profile | Selection rule | The cost the tool must display next to it |
| --- | --- | --- |
| **Lower risk** | Minimise invalidation distance `m` in sigma, subject to reward-to-risk at or above a declared floor | A tight stop is hit more often. At `m` of 0.5 sigma the approximate touch probability of the stop is 61.7%. Low risk per trade is not low probability of being stopped. |
| **High reward** | Maximise target distance `k` in sigma, no cap on `m` | Terminal probability falls steeply with `k`. At plus 1.5 sigma it is 6.7%. |
| **High probability** | Maximise the measured rate | Withheld until the cell earns a rate. Ships empty by design, and must say why rather than render blank. |

Reward-to-risk is `k` divided by `m` for a long. Expected value in sigma units
is `p` times `k` minus `(1 minus p)` times `m`, where `p` is the terminal
probability of the target. The tool should show `EV` alongside reward-to-risk,
because a 5-to-1 reward-to-risk at 6.7% probability has negative expected value
and a naive reward-to-risk sort would rank it first.

## Sorting and withholding

- Default sort is by expected value in sigma units, descending, because it is
  the only single key that respects the frontier.
- Probability and expected-move sorts are available, each with the other shown
  as a visible column so the tradeoff stays legible.
- Rows with a withheld rate sort into a **separate section** headed with the
  reason and the resolved count. They never interleave with rated rows, because
  interleaving forces an implicit numeric comparison against a number that does
  not exist.
- The candidate cap per horizon is declared in config, and the tool reports how
  many candidates were considered and how many were excluded and why. Built plus
  excluded must equal considered, matching the existing attention-tier invariant.

## Regime conditioning

Analog base rates must be drawn from analogs in a comparable regime, not from
unconditional history. The current state makes this load-bearing rather than
theoretical.

From `market-brief.snapshot.json`, as of 2026-08-19T18:31:30.619Z: VIX 15.17,
regime band `VIX 15.2` at score 0, benchmark momentum plus 12.79% over 126
sessions and plus 21.02% over 252, price 2.64% above its 50-day and 9.35% above
its 200-day, MA stack `bull-stack`, and 1.01% below the 52-week high.

That is a low-volatility uptrend within 1% of its high. Short candidates
screened against unconditional history in that state will be systematically
over-promised, because the unconditional sample includes downtrends that are not
the present regime. Conditioning is what stops the short side of this tool from
becoming a machine for generating losing claims that look statistically
supported.

This also sets up a real tension the tool should surface rather than hide. The
audit note describes a large physical supply shock, a stretched valuation at
1.96 times the median trailing multiple, and a reserve drawdown running at 1.34
times the pace of the largest prior release. The tape shows VIX at 15 and a
bull stack. A screener that resolves that tension by picking a side is
forecasting. A screener that shows both, and reports which regime its analogs
were drawn from, is measuring.

## Scoreability at mint

This directly attacks the 152 not-evaluable rows.

A candidate is publishable only if, at mint time, all of the following resolve:

1. `instrument` has a price series in the shared cache covering the analog
   window.
2. `entryReference` carries a level and a timestamp.
3. `target` and `invalidation` are absolute levels, not descriptions.
4. `horizonId` yields a concrete `scoreableAt` date from the session calendar in
   `scripts/generate-xnys-calendar.mjs`.
5. `resolutionRule` is set.
6. The data source that will settle it is named and reachable.

If any fails, the candidate is **not published**. It does not get minted and
later marked not-evaluable. The tool reports the refusal with its failing field
path, matching the field-level diagnostic requirement the audit note already
raises for the geopolitical generation contract.

The existing `scripts/validate-brief-payload.mjs` and its `--drop-unscoreable`
path are the precedent; this moves the same check earlier, from publication to
mint.

## Universe

`horizon-ladder-universe.json`, editable, with:

- A liquidity floor high enough that the options-implied leg is meaningful,
  since chains are fetched best-effort through the existing proxy chain and
  thin names will silently degrade.
- An explicit maximum count, because chain fetches are the binding cost.
- Seeds drawn from `sector-universe.json` and `options-structure-universe.json`
  rather than a new hand-picked list.
- A declared shortability note per name, since the short side is not uniformly
  expressible.

The current ledger covers two single names. Expanding the universe is the point
of the tool, but it also means the first months of minting are the sample-
building phase, and the tool should label itself that way.

## Interface

Follow the established Simple and Power split.

**Simple** is one decision-first view: a horizon selector across the six
horizons, a long and short toggle, the three profile groupings, and the top
candidates for the selected cell with the probability column either populated or
visibly withheld with its reason. Steer controls recompute through `render()`
with no refetch.

**Power** adds the frontier chart per horizon, the full sortable candidate
table, the analog distribution per candidate, the per-cell earn-progress table,
and the exclusion ledger.

Repository conventions that apply:

- One self-contained `horizon-ladder-lab.html`, no build step, ES5 style with
  `var` and function declarations and string concatenation.
- Declare computation helpers as top-level `function name(...)` so
  `extractFn` in `scripts/selftest.mjs` can pull them by brace matching. Arrow
  consts are not extractable.
- Cache-first from the shared `rlData` store, reused across tools, never
  refetched.
- Every `<canvas>` carries an `aria-label` and fallback text.
- Guard chart draws with a mode check, because Power canvases are
  `display: none` in Simple and will not size correctly otherwise.
- Draw synchronously in `render()`. Do not wrap canvas drawing in
  `requestAnimationFrame`, which does not fire in hidden or background tabs and
  leaves canvases undrawn while the DOM populates normally.
- Persist mode and steer levers in this tool's own `localStorage` key.
- Shared `.rlnav` nav.
- Avoid the word "call" in headings; the shared `rlg.js` glossary auto-tooltips
  it as an options call.

## Selftest additions

Add one group to `scripts/selftest.mjs` covering the pure helpers, following the
existing `extractFn` plus `build` plus `assert` pattern. Required adversarial
cases, so each guard can actually fail:

1. A cell with 19 resolved outcomes withholds; a cell with 20 publishes. Test
   the boundary from both sides.
2. A withheld rate is never rendered as 0 or 50, and never sorts among rated
   rows.
3. `terminal` and `touch` on the same target produce different probabilities,
   and a mixed-rule sort is refused.
4. Sigma scaling is checked at every one of the six horizons, not only the
   first, so a broken scaling constant cannot pass on one member.
5. A candidate missing any one of the six scoreability preconditions is refused,
   with the failing field path reported. Enumerate all six.
6. Reward-to-risk sorting does not rank a negative-expected-value row first.
7. Every horizon id and both directions appear in the rendered output
   vocabulary, counted per member across the whole vocabulary rather than by a
   single existence test, so a term repeated in surrounding prose cannot make a
   coverage pin unfailable.
8. Regime conditioning changes the analog set: the same name in two regimes
   yields different analog samples.

Numeric budgets get a failing test. Do not raise a budget to make a check pass.

## Next events and the change ledger

The request asked the tool to price the next events and to adjust as the latest
movements arrive. Both are delivered, and both refuse rather than guess.

**Events are consumed, not authored.** The calendar and its scenario
probabilities are owned by `market-brief.payload.json`. This tool selects the
events whose date falls inside the selected horizon window and shows each with
its days-out, its declared implied move and its declared scenarios. An event
with no implied move stays `null`. A scenario set whose declared probabilities
do not sum to one is reported as malformed rather than renormalised, because
silently rescaling someone else's distribution would invent a number. If the
payload cannot be read the panel says the calendar is unavailable, which is not
the same claim as no catalyst.

**An event inside the horizon is a limit on the analog rate.** The analog sample
was conditioned on price structure only, so it does not price a scheduled
catalyst and understates the spread around one. When events fall inside the
window the tool states this explicitly rather than letting the analog rate stand
unqualified.

**The change ledger compares like for like.** Each render stores the per-symbol
observation for the selected cell and diffs it against the previous one, naming
entries, exits, rate-state transitions and expected-value moves. A first look
says so instead of presenting every row as a change, an unchanged cell reports
no movement, and a move below the reporting threshold is not reported at all.

## What ships, and what does not

Two different rates appear, and conflating them is the easiest way to misread
this tool. The **analog rate** is the instrument's own conditional frequency over
its regime-matched history, shown as `k/n` and withheld with `n` displayed below
the analog minimum. The **measured rate** is this repository's scored track
record for the direction-and-horizon cell, and it is withheld at every cell
because no long or short claim has ever resolved.

| Ships day one | Withheld until earned |
| --- | --- |
| Six horizons, long and short | The measured ledger rate on every long and short cell |
| The analog rate with its `k/n` sample | The high-probability profile grouping |
| Scheduled events inside the selected horizon, with their declared scenario probabilities | Calibration of this tool's own stated confidence |
| A change ledger naming entries, exits, rate-state transitions and expected-value moves | |
| Expected move as a P25/P50/P75 distribution | |
| Sigma-scaled and option-implied moves with provenance | |
| Targets and invalidation from the name's own structure | |
| Reward-to-risk and expected value in sigma | |
| The frontier per horizon | |
| Regime-conditioned analog samples with N shown | |
| Per-cell earn-progress and projected earn dates | |
| Exclusion ledger with reasons | |

## Explicit refusals

The tool must not:

- Print a probability for a cell below the minimum resolved sample.
- Impute a withheld rate as 0, 50, or the analog rate alone.
- Present a stated confidence as a win probability. Confidence is evidence
  quality; only realised frequency is a frequency.
- Rewrite or backfill a prior candidate. Corrections append as new events.
- Mint a candidate that is not machine-checkable at mint time.
- Fold drift into a probability without declaring it.
- Compare a `touch` probability against a `terminal` probability.
- Claim the short side is expressible in a name where it is not.
- Re-implement analog odds, greeks, expected-move cones, or vol targeting that
  an existing tool owns.

## Build order

1. Extend the horizon and direction vocabularies additively, and prove the
   existing 1,375 rows still evaluate unchanged.
2. Implement the scoreability-at-mint gate and its field-level refusals.
3. Implement sigma scaling, the analog engine consumption, and regime
   conditioning.
4. Implement the earned-rate gate with the withheld rendering and the separate
   withheld section.
5. Build the frontier, the profiles, and the sort rules.
6. Ship the page with every long and short probability withheld, and the earn-
   progress table visible.
7. Let the ledger accumulate. Turn each cell on automatically when it reaches
   20 resolved.
8. Re-read the calibration table before trusting any newly turned-on cell. If
   realised comes in below stated the way the 50-59 bucket already does, fix the
   composition rule rather than the display.

## Sources for the state described here

All repository state below was read directly, not inferred.

- `briefs/history/recommendations/2026-07.jsonl`, `2026-08.jsonl` — 1,375 rows,
  direction and horizon and instrument and eventType distributions.
- `market-brief.scorecard.json` — contract `brief-scorecard/v1`, generated
  2026-08-20, policy `minResolvedSample: 20`, per-horizon and per-direction hit
  rates, calibration buckets, and the verbatim policy note.
- `market-brief.snapshot.json` — as of 2026-08-19T18:31:30.619Z, regime and
  benchmark readings.
- `market-brief.config.json` — `red-alert-policy/v1.horizonBands`.
- `tools.json` — 28 registered tools and their `briefing.role` values.
- `scripts/selftest.mjs`, `scripts/validate-brief-payload.mjs`,
  `scripts/generate-xnys-calendar.mjs` — existing validation surfaces.
