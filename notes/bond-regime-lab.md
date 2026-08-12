# Bond Regime & Fixed-Income Scenario Lab

## Purpose

The Bond Regime Lab separates observed credit, curve, inflation, and duration evidence from user assumptions and modeled sleeve estimates. It is a generic fixed-income research surface, not a portfolio optimizer, bond ladder, forecast, or execution tool.

Simple and Power are two compositions over one `BondLabViewModel`. A mode switch cannot fetch, reset assumptions, or change a regime. Scenario levers recompute synchronously and cannot rewrite observed records.

## Evidence Model

### Relative credit

- `JNK/LQD` and `HYG/LQD` use exact common UTC dates from distribution-adjusted closes when available.
- No leg is forward-filled, interpolated, or nearest-date matched.
- Both ratios are breadth inside one relative-price family. They do not count as two independent credit keys.
- Every ratio shows the effective-duration gap and the estimated same-window rate contribution:

$$
\Delta R_{duration} = -(D_{HY} - D_{IG})\Delta y
$$

A directional credit regime requires one usable relative-price pulse and one current independent family. OAS or financial-conditions observations are current-tab user observations or explicitly Unavailable. Raw values and source URLs are never persisted or published in the normalized tool read.

### Curve and inflation

- Nominal curve source: U.S. Treasury daily nominal par-yield CSV, current and prior UTC year, no key.
- Real curve source: U.S. Treasury daily real-yield CSV, current and prior UTC year, no key.
- Required nominal columns: Date, 3 Mo, 2 Yr, 5 Yr, 10 Yr, 30 Yr.
- Required real columns: Date, 5 Yr, 10 Yr, 20 Yr, 30 Yr.
- Ten-year breakeven is derived only on exact common dates:

$$
BE_{10Y} = y_{10Y,nominal} - y_{10Y,real}
$$

Curve level (`Inverted`, `Flat`, `Positive`, `Mixed`) remains separate from curve impulse (`Bull/Bear Steepener/Flattener`, `Mixed`, `Unavailable`). Inversion alone cannot create a duration posture.

## Scenario Model

The seven generic sleeves are bills/cash, short Treasury, intermediate Treasury, long Treasury, TIPS, investment-grade corporate, and high-yield corporate. Current proxy characteristics live in `bond-regime-universe.json` with source, as-of date, and review window.

Signed UI shocks are basis points. Internal shocks are decimals. Annual carry is scaled to the selected horizon once.

$$
R_{carry} = c_{annual}h
$$

$$
R_{rate} = -D_r\Delta r
$$

$$
R_{spread} = -D_s\Delta s
$$

$$
R_{convexity} = \frac{1}{2}C(\Delta r + \Delta s)^2
$$

$$
R_{scenario} = R_{carry} + R_{rate} + R_{spread} + R_{convexity}
$$

For TIPS, the modeled real-yield shock is nominal minus breakeven:

$$
\Delta r_{real} = \Delta y_{nominal} - \Delta BE
$$

Treasury and TIPS spread effects are Not applicable. Missing or stale characteristics make a sleeve Not rankable. Finite shocks outside the configured local bounds retain their arithmetic but become Reduced reliability and name nonparallel curves, optionality, defaults, liquidity, and tracking.

## Presets And Controls

- Soft Landing
- Growth Shock
- Inflation / Term-Premium Shock
- Credit Stress
- Custom

Controls: 3/6/12-month horizon, Treasury yield shock, investment-grade spread shock, high-yield spread shock, and breakeven shock. Positive values mean yields or spreads rise. Editing a populated field selects Custom.

Only these preferences may persist in `bondRegimeLabState`: schema version, mode, preset, horizon, four shocks, selected ratio, ratio window, and focused sleeve. No market observation, credential, account value, holding, source URL, OAS value, or financial-conditions value may enter it.

## Sources And Rights

| Family | Source | Rights / persistence |
| --- | --- | --- |
| ETF bars | Shared `RLDATA` cache and its existing provider path | Shared browser cache; adjustment/source metadata retained |
| Nominal Treasury | `home.treasury.gov` daily nominal CSV | Public official; versioned browser cache |
| Real Treasury | `home.treasury.gov` daily real-yield CSV | Public official; versioned browser cache |
| Breakeven | Exact-date nominal minus real | Derived; both official source ids retained |
| OAS | User-viewed current-tab observation | Restricted local view; memory-only |
| Financial conditions | User-viewed current-tab observation | Restricted local view; memory-only |

No FRED API key, FRED observation endpoint, ICE observation payload, or committed OAS/NFCI observation is part of this tool.

### Headless Publication: Contract Extension And The `persistence` Reading

The headless path (spec 018) publishes the two official families as one
committed artifact, `official-curve-artifact/v1`, gated offline by
`scripts/validate-official-curves.mjs`. Two decisions belong here beside the
tool rather than buried in the spec.

**The allowlist extension is additive.** `us-treasury-nominal` and
`us-treasury-real` were appended to `SOURCE_IDS` and `SOURCE_POLICIES` in
`rlcontracts.js`; no pre-existing entry was edited and `SOURCE_KINDS` needed
nothing, because `official-report` already admits a daily yield-curve
publication. They use the `pathPrefix` form because the official pathname
embeds the year.

That has a consequence the gate has to carry. Both families share one host, one
method and one path prefix, so `validateSourceProvenance` **structurally cannot
tell them apart** — nothing it inspects differs. The only field that separates
them is the query `type`, so the source-id-to-query binding lives in the feature
gate rather than in the shared contract. The `query-binding-mismatch` fixture
pins that from both sides: the shared validator accepts it, the feature gate
refuses it.

**Why `persistence` reads differently in two places (routed item R-4).** The
committed policy in `bond-regime-universe.json` says `persistence:
"browser-cache"`, and that is correct for the browser tool, which is the only
consumer that policy was written for. A committed artifact is not a browser
cache. So the artifact carries both, and they do not contradict each other:

- `declaredPolicy` holds the committed policy block **byte-for-byte**, still
  reading `browser-cache`. It is a quotation, not a claim about the copy.
- The family's own `persistence` field reads `same-origin-artifact`, describing
  what the committed file actually is.
- `rights` carries `public-official` unaltered in both.

A family that writes `persistence: "browser-cache"` onto a committed file is
refused, because it would be describing itself as something it is not. Rewriting
the quoted policy instead would have been the other way to remove the apparent
contradiction, and it is the wrong one — it would silently edit the browser
tool's declared policy to suit a different consumer.

The gate's required maturity sets are the browser's own required column map
(`bond-regime-lab.html`, `parseTreasuryCurveCsv`): nominal `y3m,y2,y5,y10,y30`
and real `y5,y10,y20,y30`. They are stated in one place per consumer on purpose
— a second definition would let the headless path admit a curve shape the tool
would reject.

### Headless Publication: Acquisition, Carry-Forward And The No-Restamp Rule

`scripts/acquire-official-curves.mjs` fetches four responses — nominal and real,
current and prior UTC calendar year — and writes
`data/curves/us-treasury/curve.json`. It is invoked from
`scripts/brief-refresh.mjs` before tool-read assembly, wrapped like every other
per-tool builder, so an acquisition failure degrades the bond read alone and
never fails the brief.

**One URL definition.** Request URLs are built by substituting `{YEAR}` into the
committed `urlTemplate` values in `bond-regime-universe.json`. There is no
Treasury URL literal in `scripts/`, and the selftest asserts that by scanning the
acquisition module's own source. Change a URL in the universe and the headless
path follows; there is nowhere else to change it.

**One parser.** Responses are parsed with the page's own `parseTreasuryCurveCsv`,
loaded by name, and merged with the browser's exact by-date collapse. A missing
configured maturity column therefore rejects the WHOLE family with zero rows —
that is the page's behaviour, observed rather than restated. The family reports
`BRL-CURVE-MATURITY-MISSING` and names the missing headers.

**Carry-forward never restamps.** When a family fails to acquire and a prior
record exists, the prior family is carried forward byte-identically with
`carriedForward: true` and a `carried-forward-from-prior-artifact` diagnostic.
`retrievedAt` is NOT advanced to the current run. Advancing it is the tempting
shortcut and it is the wrong one: it would turn a stale record into one claiming
to be fresh, and the freshness admission downstream reads exactly that field.

A family with nothing to carry forward is a named absence — `state:
"unavailable"`, zero rows, its own error code. An `unavailable` family carries no
provenance envelopes, because when a fetch fails at transport there is no
response to attest. The gate encodes that asymmetry in ONE direction only: it
requires envelopes on a `fresh` family (`provenance-missing`) and merely permits
an empty array on an `unavailable` one. The relaxation is the risk, so it carries
an adversarial twin — a `fresh` family stripped of its envelopes is still
refused, which is what proves permitting the empty array opened no hole.

### Headless Publication: Why Freshness Reads No Calendar

`admitCurveFamily(artifact, familyId, runDate)` in `scripts/brief-refresh.mjs`
decides whether a family's rows may be presented as a current observation. It
derives the window from the family's OWN observed as-of progression:

```
observedGaps      = calendar-day gaps between consecutive row dates,
                    over the trailing cadenceWindowRows rows
windowDays        = max(observedGaps) + publicationLagDays
verdict           = undetermined  when observedGaps.length < minCadenceObservations
                  = current       when elapsedDays <= windowDays
                  = stale         otherwise
```

All three policy values come from the artifact's own `freshnessPolicy` block, so
nothing hardcodes a window and a committed artifact self-reports as it ages
without being rewritten.

**The equity calendar is deliberately not consulted.** `data/calendars/xnys/calendar.json`
marks `2026-10-12` and `2026-11-11` as regular trading days, but the US bond
market is closed on both and Treasury publishes no curve. A rule that read that
file would manufacture a staleness verdict on exactly those days. Reading nothing
is not a shortcut here — it is the correct answer, because a weekend and a
bond-market holiday are already IN the data as gaps, and a rule derived from the
observed gaps absorbs them structurally.

The window cannot be widened by the outage it exists to detect: the gaps are
taken from history the artifact already holds, so a publication stoppage raises
`elapsedDays` while leaving `windowDays` where it was.

Measured over the artifact acquisition writes: `maxObservedGapDays` 3 and
`windowDays` 4 for both families — the weekend gap, plus the one-day publication
lag.

Two vocabularies stay separate inside the admission verdict: uppercase `BRL-*`
codes appear only in `errorCode`, and `basis` carries only lowercase-hyphen
reasons. That is the whole of the rule, and it is scoped to the verdict.

The artifact family's own `diagnostics` array is deliberately mixed and is not
covered by it. A transport failure pushes the uppercase `BRL-CURVE-FETCH-FAILED`
into `diagnostics` while `errorCode` holds the model-facing absence code, so the
family can name the transport cause without overwriting the code the model reads.
Beside it sit lowercase-hyphen reasons — `carried-forward-from-prior-artifact`
and `missing-headers:…`. Do not read `diagnostics` as single-vocabulary.

### Headless Consumption Precedence

The server-side read resolves a curve family only when the caller passed no
explicit one. An explicit `deps.nominalCurve` or `deps.realCurve` always wins
over a committed artifact, which is what keeps every injected fixture in the
suite meaning exactly what it meant before the artifact existed. The
`bondRegimeOwnerState` seam is unchanged; resolution happens above it.

Three refusals sit in front of the model, and each one contributes zero rows:

1. **No artifact** — `BRL-CURVE-ARTIFACT-ABSENT`. The pre-feature behaviour,
   preserved exactly.
2. **A gate-failing artifact** — `BRL-CURVE-ARTIFACT-INVALID`. The check is the
   artifact gate's OWN validator, imported rather than restated, so an artifact
   the gate would reject and an artifact refused at read time can never become
   two different questions. Only the failure CLASS reaches the reason; the
   gate's detail text is dropped because it can quote a source URL or an
   observed value.
3. **A stale or underivable admission** — the family's own cadence verdict.

A refused family becomes the canonical named absence built by
`unavailableCurveFamily`, never a family carrying rows the model might classify.
The verdict itself is published additively as `curveAdmission`, so a reader can
see why a family was withheld without inferring it from a silence.

Note the two family shapes are not interchangeable. In the **browser** family an
absence carries `persistence: 'none'` and no coverage years. In the **artifact**
family every family carries `persistence: 'same-origin-artifact'` and its two
consecutive coverage years whatever its state, because the file is committed
same-origin regardless of whether one family in it was observed.

What this changes for the published read: the duration axis now resolves from
committed evidence, so the Treasury-curve gap disappears from `evidenceGaps`.
The credit axis does not, because the independent credit-spread observation is
still a current-tab entry its own policy marks memory-only. The published state
therefore stays `unavailable` and the read still names an absence — a narrower
one. `evidenceGaps` is not edited to achieve this; it is computed from the
model's own states and narrows by itself.

Three modules name the artifact file with a literal of their own: the gate's
default path (`scripts/validate-official-curves.mjs`), the acquisition's write
path (`ARTIFACT_RELATIVE_PATH`), and the consumption read path
(`officialCurveArtifact` in `scripts/owner-state.mjs`). The first two cannot be
single-sourced by import without closing a cycle, so `scripts/selftest.mjs`
asserts those two are equal instead. The third is not covered by that assertion.

### Source Table: Observed As Of Versus Retrieved

The `sourceStatusTable` carries five columns in one fixed order for every family:
*Family*, *State*, *Observed as of*, *Retrieved*, *Source / rights*. The order
never varies by family, so a reader who has learned one row has learned them all.

*Observed as of* and *Retrieved* are different facts and are never substituted
for one another. The first is the date the issuer's own series carries; the
second is when this tool fetched it, rendered as an explicit `UTC` stamp. A
family that was never fetched renders **Not retrieved** rather than borrowing the
observation date or printing a bare dash. Bars come from the shared RLDATA cache,
so their retrieval cell says **Via shared cache** — the retrieval fact belongs to
the cache, and claiming a timestamp this tool did not make would be false.
Breakeven says **Derived, not retrieved**, because it is computed, not fetched.

An official family names its source id, its rights class and a link whose text is
the host, and the link is rendered only when the URL is `https` on the declared
official host. A restricted family names its rights class and renders **no link
and no value** — for a memory-only observation the link would itself be the
disclosure. The breakeven row names its common-date count against the nominal
count, so the exactness of the join is visible rather than asserted.

No cell is ever an empty string or a bare dash. Every absence names its kind.

### One-Model Parity

The page composition and the published headless read must reach the same verdict,
because they are supposed to be one model reached two ways. `bondParityVerdict`
compares exactly four fields — `curveState`, `curveImpulse`, `inflationState`,
`durationPosture` — and returns exactly three verdicts:

| Verdict | Meaning |
| --- | --- |
| **Agree** | all four compared fields are equal |
| **Differ** | at least one field disagrees — a defect to investigate, not a status to acknowledge |
| **Cannot be compared** | the comparison could not be made, with its reason named |

There are five *Cannot be compared* reasons, evaluated in this order:
`no-browser-composition`, `no-published-read`, `differing-observation-window`,
`differing-as-of`, `incomplete-field-set`. The third —
`differing-observation-window` — settles routed item **R-3** and exists because of
design finding **D-1**: `classifyInflationState` compares the **first and last**
breakeven rows, so two compositions holding different windows can legitimately
reach different `realYieldChangeBp` and therefore different `inflationState` and
`durationPosture`. That is not a disagreement between models; it is a comparison
that cannot be made, and calling it *Differ* would report a defect that does not
exist. Calling it *Agree* would be worse.

The compared-field count is always rendered beside the verdict, so a comparison
that silently narrowed is visible rather than hidden behind a reassuring word.

**Silence is never agreement.** An absent published read renders *Cannot be
compared* with its reason — never an empty line, and never *Agree*.

**The guarantee is proven capable of failing.** The parity group hands one frozen
input set to the page's own `computeBondLabViewModel` and to the real headless
consumption path, then perturbs one row of the headless input alone and asserts
the two now disagree. Without that perturbation an assertion comparing two calls
into the same loaded module would pass even if the headless path ignored its own
input entirely. The group writes only under a temporary root and asserts the
committed artifact is byte-identical afterwards.

## Refresh Procedure

1. Review characteristic `asOf` and `reviewWindowDays` fields in `bond-regime-universe.json`; update only from the linked issuer source.
2. Run `node scripts/selftest.mjs`.
3. Run the committed Bond Regime Playwright suite through the repository's documented browser command surface.
4. Use Refresh in the page to request only missing or stale bars and official Treasury families.
5. Inspect Source, freshness and rights. A failed optional source must remain Unavailable or retain a validated stale cache with an explicit error code.
6. Never commit browser caches or restricted current-tab observations.

## Limitations

- Bond ETF shares have no maturity date or guaranteed redemption value.
- Parallel-shift duration/convexity arithmetic is a local approximation, not full cash-flow pricing.
- Nonparallel curves, changing duration, optionality, defaults, recoveries, liquidity, fund flows, taxes, fees not represented in carry, and tracking can change realized returns.
- The categorical regimes and thresholds are transparent research assumptions, not validated predictive claims.
- The normalized Market Brief read is derived and compact; it excludes raw restricted observations and URLs.

## Validation

The top-level pure helpers in `bond-regime-lab.html` are extracted by `scripts/selftest.mjs`. Browser tests in `tests/bond-regime-lab.spec.mjs` cover all 14 business scenarios, cache/source behavior, storage boundaries, mode and lever no-fetch behavior, canvas pixels, text-equivalent tables, keyboard semantics, and desktop/mobile containment.

## Version History

- 2026-07-13: Initial complete Bond Regime and Fixed-Income Scenario Lab.
