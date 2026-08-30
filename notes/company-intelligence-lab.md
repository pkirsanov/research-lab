# Company Multi-Horizon Intelligence Lab

## Purpose

Answer four horizon questions about one public company from owner reads that
already exist. Every mandatory dimension answers on every run with an explicit
state, and a dimension with no source names the missing source instead of
rendering a blank, a dash or a zero.

The reader is someone who already has the sibling labs and wants one company
assembled across horizons rather than one lab at a time. The page composes what
the siblings published. It computes no new company math of its own, so a
dimension whose owning lab has not published stays unanswered by name.

## The Four Horizon Bands

The bands come from `horizons` in
[`company-intelligence.config.json`](../company-intelligence.config.json). Each
band carries its own question and its own primary dimensions.

| Band | Rank | Question | Primary dimensions |
| --- | --- | --- | --- |
| `immediate` | `tactical` | What matters for this company right now? | performance, volatility, technicals, dealer-gamma, options-flow, sentiment |
| `event` | `event` | What happens at the next company event? | financial-events, non-financial-events, options-structure |
| `swing` | `swing` | How should this company be positioned over the coming months? | fundamentals, performance, geopolitics, cycles, market-regime |
| `structural` | `structural` | What is the long-term case for this company? | fundamentals, valuation, company-risk |

Horizons are isolated in one direction. Each registry row declares a
`maxHorizon`, and a read never reaches a band longer than the one it declares.
A tactical read therefore cannot move the structural answer. The four bands
render as peers with their own direction words, and no blended single direction
replaces them. A pair that opposes becomes a contradiction record instead.

## The Adaptive Research Plan

The plan is a coverage floor, not a fixed tool sequence. The floor is the fifteen
mandatory dimensions in `coverageRegistry`. Every run accounts for all fifteen,
and the coverage totals sum to the registry length, so a dimension can go
unanswered but cannot go unmentioned. Nothing in the contract prescribes which
tool answers which dimension or in what order.

Above the floor the run may open discretionary branches. A branch may consult any
registered Research Lab tool and may also consult sourced analysis that no tool
owns. A branch exists to settle a question the floor raised, and it is written
down whether it changed anything or not.

- Six fields are mandatory on every branch: `question`, `relevance`, `consulted`,
  `result`, `disposition` and `stopCondition`. A branch missing any of them
  raises `C025-PLAN-SCHEMA` and is not published.
- `disposition` is one of `changed`, `confirmed`, `no-change` or `refused`. A
  `refused` branch must state a `refusalReason` and must change nothing.
- `stoppedBy` names the stop authority: `declared-limit`, `question-answered`,
  `no-source` or `guardrail`.
- The budget is `maxBranches: 5`, recorded in the config with the rationale that
  chose it. A sixth branch raises `C025-PLAN-BUDGET`. A refused branch is charged
  against the budget exactly as a published one is, recorded under
  `refusedBranchCounting`, so refusal is not a free retry.
- Two plan sources publish the same record. `attachResearchPlan` reads a plan the
  repository already committed and reports `planSource: "committed-file"`.
  `agentAuthoredPlanSource` reads a plan authored for the run, requires the
  `company-authored-plan/v1` contract with `authoredBy` and `authoredAt`, and
  reports `planSource: "agent-authored"`. An unsigned authored plan is refused
  with `authorship-not-recorded` rather than published anonymously.
- An empty plan is still a record. It names why it is empty:
  `floor-was-sufficient`, `every-branch-refused`, `plan-names-another-company` or
  `authorship-not-recorded`.

A corrected conclusion becomes a new version rather than an edit. `planVersionWrite`
creates a dated file under `data/company-intelligence/<subjectId>/versions/`,
sets `priorVersionId` to the current pointer, then advances `current.json`. It
opens no prior version file for writing, so an earlier read stays readable with
its original `contentFingerprint`.

## Owner Deep Links

A dimension row may name an owning tool in `ownerDeepLink`. Any row that does
must declare exactly one of `ownerSubjectParam` or `ownerBareReason`; declaring
both, or neither, raises `C025-CONFIG-SCHEMA`. The schema exists because the
registry previously declared `ownerSubjectParam` on rows whose owning routes
contained no reader for it, so those links looked company-aware and were not.

Of the fifteen rows:

- **Four carry the subject.** `options-structure`, `dealer-gamma`,
  `options-flow` and `volatility` declare `ownerSubjectParam: "ticker"`, and
  their owning routes each read `?ticker=` through `RLTKR.linkedSubject`. Follow
  one of these and the owning tool opens on the same company.
- **Seven link to an owner that cannot open on a company**, across five distinct
  tools, and each states why in `ownerBareReason`. They are plain links with no
  subject attached — not a deferred feature.
- **Four name no owner at all.** `financial-events`, `non-financial-events`,
  `market-regime` and `company-risk` have no `ownerDeepLink`.

The seven bare rows and their stated reasons:

| Row | Owner | Reason | Why the owner cannot take a company |
|---|---|---|---|
| `performance` | `market-brief.html` | `market-scoped` | The brief reads the market, not one company. |
| `sentiment` | `market-brief.html` | `market-scoped` | Same brief, same scope. |
| `geopolitics` | `research-agenda-lab.html` | `market-scoped` | The agenda is a market-wide topic list. |
| `fundamentals` | `company-fundamentals-lab.html` | `fixed-subject` | The route is hardcoded to Microsoft across roughly thirty identity strings; repointing its data alone would render one company's numbers under another company's name. |
| `valuation` | `company-fundamentals-lab.html` | `fixed-subject` | Same route, same hardcoding. |
| `technicals` | `technical-analysis-decision-lab.html` | `fixed-subject` | The route names no instrument to redirect. |
| `cycles` | `trend-dynamics-cycle-lab.html` | `fixed-subject` | The route carries a single SPY series. |

This is a limit of the linked set, not of the coverage floor: a bare row still
answers or records its absence exactly as a subject-carrying row does. It is
also a different axis from the `no-shared-read` limitation under
[Known Limitations](#known-limitations), which is about whether an owner has
published a read, not about whether its route can be opened on a company.

## Current Evidence Boundary

- Company: resolved from a committed SEC identity, otherwise from committed
  price history, otherwise refused with `C025-IDENTITY-UNRESOLVED`.
- Coverage floor: fifteen mandatory dimensions declared in
  `company-intelligence.config.json`. The coverage account always holds one row
  per dimension and its totals always sum to the registry length.
- Every state below was read from the shipped adapters in
  [`rlcompanyintel.js`](../rlcompanyintel.js). A state depends on what the owning
  sibling has published, so a dimension can move between runs.

| Dimension | Usual state today | Reason on a non-current run |
| --- | --- | --- |
| `performance` | `current` from committed daily bars, own and against the benchmark | `symbol-not-covered` when no bars are committed |
| `fundamentals` | `current` when a committed company publication has been read | `no-shared-read` when none has |
| `valuation` | `partial` against the company's own history | `peer-set-missing`, because no peer set is published |
| `technicals` | `unavailable` | `no-shared-read` |
| `cycles` | `unavailable` | `no-shared-read` |
| `options-structure` | `unavailable` | `no-shared-read` |
| `dealer-gamma` | `unavailable` | `no-shared-read` |
| `options-flow` | `unavailable` | `no-shared-read` |
| `volatility` | `current` from the volatility owner read | `source-not-published`, `fixture-only-evidence` or `read-company-mismatch` |
| `financial-events` | `current` for a company with a committed event file | `no-source-wired` for any company without one |
| `non-financial-events` | `unavailable` | `no-source-exists` |
| `geopolitics` | `partial` from the research agenda owner read | `market-scope-only`, because the agenda covers the market |
| `market-regime` | `partial` when a combined regime is published | `regime-not-published` until one is |
| `sentiment` | `partial` from the cached market gauge | `proxy-only`, because no company-level gauge exists |
| `company-risk` | `unavailable` | `no-owner` |

The five `no-shared-read` dimensions share one cause. The owning math is
page-local in the sibling lab, so no headless consumer can call it. Closing any
of them means the owning lab publishes a read on the shared channel first.

- Events: the `company-event/v1` contract, the date-class vocabulary and the
  estimate-basis rule all ship and carry tests. A covered company renders sourced
  dates and its event horizon leaves `absent`. A company with no committed file
  keeps the named absence rather than an empty date.
- Research plan: both plan sources ship. A committed plan and an authored plan
  publish with the read version, and the append-only version tree is written by
  `planVersionWrite`. Committed plan and version coverage today is
  `company:msft` only, listed under `researchRecord.coveredSubjects`.

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

`node scripts/selftest.mjs` holds that decision in place. One assertion states
that the route, the module and the config appear in none of `tools.json`, the
index or the navigation. A second asserts that all three carry a site-exclusion
entry, and proves the claim by showing the build refuses the page once the
route's entry is removed. Registering the tool without also retiring those
assertions turns the suite red, so registration is a spec-owner decision rather
than a documentation one.

This notes file is not listed in [`README.md`](README.md). That index is derived
from `tools.json`, and its parity check walks registered tools only. Listing an
unregistered tool there would advertise a page no reader can reach.

Registering the tool would require, at minimum:

- an entry in `tools.json` carrying `id`, `file` and `notes`, mirrored into the
  `TOOLS` array in `index.html` and the `TOOLS` array in `rlnav.js`;
- a row in the root `README.md` and a row in this folder's `README.md` index,
  because the reader-reachability canary reads both;
- removal of the three `site-exclusions.json` entries, so the packaged site
  ships the route and its two dependencies;
- a briefing block, a read adapter and a Simple adapter module, since the brief
  pipeline treats every registered tool as a participant;
- retirement of the two selftest assertions named above, replaced by the
  registered-tool parity checks that every other registered tool satisfies.

## Views

Simple presents one cockpit: the coverage line, four horizon cards each with its
own direction, evidence quality, summary and deep dive, the contradiction count
and the publication outcome.

Power presents ten workspaces over the same frozen read version, each carrying a
`data-workspace` attribute: `performance`, `fundamentals`, `events`,
`geopolitics`, `regime`, `cycles`, `valuation`, `sources`, `research-plan` and
`outcome-record`. The coverage account table, the evidence families, the
contradictions and the refusals raised during the run all live inside the
`sources` workspace rather than in workspaces of their own. `research-plan`
renders one disclosure row per branch with the disposition word in the row
header. `outcome-record` renders the append-only version history.

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
  `refused`. `body[data-reading-readiness]` is `established` or
  `not-established`, and the one predicate that says whether what is on screen
  is a settled reading is `data-run-status="composed"` **and**
  `data-reading-readiness="established"`. Until the corpus answers,
  `body[data-coverage-unavailable]` reads `not-established` rather than a
  count, and it carries the unavailable count only on a settled reading.
  `body[data-corpus-status]` is one of `pending`, `loaded` or `unavailable`,
  reports whether the committed record files for the opened company were read,
  and always describes the company currently on screen.
- The company publisher writes an ordinary `rl-tool-read/v1` record only when
  the exact coverage account carries `readiness="established"`. A pending account
  returns `C025-PUBLISH-LOSSY` and writes nothing. A settled unavailable account
  remains eligible and publishes with `availability="unavailable"` and null clocks.
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

## Known Limitations

- Five dimensions cannot answer at all today. Technicals, cycles, options
  structure, dealer gamma and options flow read `no-shared-read` on every run,
  because the owning math is page-local in the sibling lab. Five of the fifteen
  floor rows are therefore an honest absence rather than a reading.
- Two dimensions have no owner anywhere in the repository. Non-financial company
  events read `no-source-exists` and the company risk register reads `no-owner`.
  Neither is scheduled work here.
- Committed coverage is one company. Only `company:msft` has a committed event
  file, a committed authored plan and a committed version tree. Any other
  identifier resolves and composes, but its event, plan and outcome workspaces
  state their absence.
- Charts are readable but not keyboard-navigable. All three canvases carry
  `role="img"` and an `aria-label` and pair with an accessible table holding the
  same values, and below 600 CSS pixels the table renders alone. The route does
  not call `RLCHART.attach`, so no canvas is reachable by keyboard and no point
  rail exists. The same data stays reachable through the adjacent table. This is
  recorded as a routed gap in the feature report, not as closed work.
- Listeners accumulate across recompositions. `bindContextControl` in
  `rlticker.js` registers a `window` listener per ticker token when `RLCTX` is
  absent, and this route does not load `rlcontext.js`, so the `{ once: true }`
  cleanup never fires. DOM node count and heap stay flat over the same window.
  The condition is repository-wide rather than specific to this route, and it is
  owned by the shared module, not by this feature.
- The page states no likelihood, no rate and no ranking. Direction words are
  `constructive`, `pressured`, `flat` or `none`, evidence quality is `broad`,
  `narrow`, `thin` or `absent`, and neither vocabulary carries a likelihood. A
  dated event renders `flat` on purpose: the source says when something happens
  and says nothing about how it resolves.
- The route issues no external request. Everything is composed from same-origin
  committed files and from whatever siblings already wrote to the shared cache,
  so an owner that has not published leaves its dimension unanswered no matter
  how current the underlying public data is.

## Validation

```bash
node --test tests/company-intelligence.unit.mjs
node scripts/selftest.mjs
node scripts/build-pages-site.mjs
npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

Educational research only. Not investment advice.
