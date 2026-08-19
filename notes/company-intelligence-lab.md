# Company Multi-Horizon Intelligence Lab

## Purpose

Answer four horizon questions about one public company from owner reads that
already exist. Every mandatory dimension answers on every run with an explicit
state, and a dimension with no source names the missing source instead of
rendering a blank, a dash or a zero.

## Current Evidence Boundary

- Company: resolved from a committed SEC identity, otherwise from committed
  price history, otherwise refused with `C025-IDENTITY-UNRESOLVED`.
- Coverage floor: fifteen mandatory dimensions declared in
  `company-intelligence.config.json`. The coverage account always holds one row
  per dimension and its totals always sum to the registry length.
- Answered in increment A: own and relative price performance from committed
  daily bars; volatility, geopolitics and market regime when the owning sibling
  has published on the shared channel; fundamentals and valuation when a
  committed publication has been read.
- Unavailable in increment A, with a named reason on every run: technicals,
  cycles, options structure, dealer gamma and options flow read
  `no-shared-read` because the owning math is page-local and no headless
  consumer can call it; financial events read `no-source-wired`; non-financial
  events read `no-source-exists`; the company risk register reads `no-owner`;
  the market regime reads `regime-not-published` until a regime is published.
- Events: the `company-event/v1` contract, the date-class vocabulary and the
  estimate-basis rule all ship and carry tests. Increment B answers the
  financial event dimension from a committed file, so a covered company renders
  sourced dates and its event horizon leaves `absent`. A company with no
  committed file keeps the named absence rather than an empty date.
- Research plan: a committed plan publishes with its version. Agent-authored
  research is not part of increment A.

### Company Event Source (increment B)

The chosen public financial event source is **SEC EDGAR company submissions**,
source id `sec-edgar-submissions`, at
`https://data.sec.gov/submissions/CIK<10-digit-CIK>.json`.

Access terms as the source publishes them: the endpoint is open to the public,
requires no API key, no account, no token and no server component of ours. SEC
asks every automated consumer to send a descriptive `User-Agent` carrying a
contact address and to stay at or below ten requests per second. The data is US
government work and is not copyrighted. Those terms are also carried verbatim in
the `eventSource.accessTerms` field of
[`company-intelligence.config.json`](../company-intelligence.config.json), so
the module refuses a source declaration that states no terms at all.

The route issues no request to that host at runtime. Rows are read out of band,
checked, and committed under `data/company-intelligence/<subjectId>/events.json`
with the filing-index URL and the as-of date each row was taken from. The route
fetches only that same-origin committed file, which is why the covered-subject
path is refused when it names anything other than a relative committed path, and
why `file://` and the offline posture both keep working. The freshness window is
declared as `eventSource.freshnessWindowDays`; a row read past it stays in the
denominator as stale rather than turning into a neutral value.

Committed coverage today is `company:msft` only. Every other company reads the
named absence, not a blank.

## Registration Status

Deliberately unregistered. The route, its module and its config are listed in
[`site-exclusions.json`](../site-exclusions.json) with a substantive reason
each, so `scripts/build-pages-site.mjs` accepts the tree and the public site
ships no page that no index, navigation entry or brief can reach. The tool is
absent from `tools.json`, `index.html` and `rlnav.js` by design, because
registration also requires a complete briefing block, a unique read adapter and
a Simple adapter module, and because adding a participant would perturb the
frozen registry fingerprint the market brief consumes.

## Views

Simple presents one cockpit: the coverage line, four horizon cards each with its
own direction, evidence quality, summary and deep dive, the contradiction count
and the publication outcome. Power presents ten workspaces over the same frozen
read version: horizon deep dives, coverage account, performance, regime and
cross-asset, cycles, fundamentals and valuation, company events, contradictions,
adaptive research plan, and sources and run identity.

The mode segment switches display only. It triggers no request and no
recomposition, because the route composes once per run and renders both modes
from the same frozen `company-read-version/v1`.

## Page-Specific Semantic Checks

- Four horizon regions render as peers. No blended single direction ever
  replaces the four, and an opposing pair becomes its own contradiction record.
- Every rendered numeric value carries a provenance chip, a source name and an
  as-of date. A value with no number renders the word `Unavailable`.
- Every unavailable dimension renders its state, its reason code and a sentence
  naming the missing source. It never renders a dash, a zero or an empty cell.
- A dimension with a registered owner renders a link to that owner's route. A
  dimension with no owner renders a sentence saying so and renders no link.
- Each of the three canvases draws synchronously inside the render call, carries
  an `aria-label`, and pairs with a table built through
  `RLCOMPANY.buildAccessibleChartTable`. Below 600 CSS pixels the canvas hides
  and the table renders alone.
- `body[data-run-status]` is one of `empty`, `composing`, `composed` or
  `refused`. `body[data-coverage-unavailable]` carries the unavailable count.
- The page declares no `innerHTML` assignment, no `requestAnimationFrame`, no
  `setTimeout`, no password input and no provider key field.

## Data And Privacy

Same-origin reads only: the coverage registry, the committed daily bars for the
opened company and its benchmark, the committed event file for the opened
company, and whatever siblings have already written to the shared cache. The
route holds tickers and nothing else. A position, size, cost basis or profit
entry is refused with `C025-INPUT-REFUSED` and nothing is stored. The committed
event files carry ticker identity, dates and filing links only. The module
declares no `localStorage` key and no `sessionStorage` key, reads no provider
credential and performs no network call.

## Validation

```bash
node --test tests/company-intelligence.unit.mjs
node scripts/selftest.mjs
node scripts/build-pages-site.mjs
npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

Educational research only. Not investment advice.
