# Portfolio Survival & Allocation Lab

**Route:** `portfolio-survival-allocation-lab.html` · **Registry id:** `portfolio-survival-allocation-lab`

A six-tab local workspace for asking whether a portfolio survives what its owner
actually needs it to survive. Everything personal — holdings, mandate, cash
needs, scenarios, candidate allocations, research dossiers — is composed and
stored **only in this browser**. Nothing personal is ever published, and the
tool's entry in the public Market Brief is a permanent "unavailable, local-only"
read that carries no facts at all.

## What it is for

Most portfolio tools answer "what did this return?". This one answers a harder
question: *given a mandate with real dates and real cash needs, what has to be
true for this to work, and where does it stop working?* That reframing is why
the tool refuses so often. A refusal with a named reason is a usable answer; a
number produced from evidence that does not exist is not.

## The six tabs

| Tab | Hash | What it answers |
|-----|------|-----------------|
| Portfolio Brief | `#brief` | Import a revision, declare a mandate, see what the held evidence does and does not support. |
| Risk X-Ray | `#risk-xray` | Return, drag, drawdown, concentration, CAPM and factor decomposition, risk and return contributions — each with its own eligibility. |
| Path Lab | `#path-lab` | Stationary-bootstrap paths, cash-flow scheduling, survival to a dated goal, and the separation of path randomness from parameter uncertainty. |
| Diversification | `#diversification` | Correlation under stress vs calm, Forbes-Rigobon adjustment, lower-tail dependence, desmoothed alternatives, hedge variants after costs. |
| Allocation Comparison | `#allocation` | Six allocation methods on one frozen basis, feasibility, sensitivity ranges, reversal conditions, and an explicit Black-Litterman editor. |
| Research Dossier | `#dossier` | Walk-forward results kept separate from in-sample and cost-adjusted, a scoped market-efficiency finding, and a replacement comparison that refuses to adjudicate. |

## Design commitments worth knowing before changing anything

**Refusal is a feature, not an error path.** Every analytic declares its own
eligibility and fails closed with a named reason. A short sample, a singular
covariance matrix, a missing mandate, too few joint tail events — each produces
an explicit unavailable state rather than a weaker number. If you find yourself
adding a fallback so a panel "always shows something", stop: that is the bug
this tool was built to avoid.

**Separation is load-bearing.** In-sample, walk-forward and cost-adjusted are
three figures. Equilibrium, the stated view, and the posterior are three
columns. Path randomness and parameter uncertainty are two contributions.
Collapsing any of these into one number destroys the only information that
made it honest.

**Some questions are refused on principle, not on data.** The replacement
comparison delivers correlation, overlap, issuer, index and tracking facts and
then declines to say whether two securities are substantially identical — in
either direction. That is a legal and tax determination. `substantiallyIdentical`,
`notSubstantiallyIdentical` and `identityThreshold` are `null` **by contract**,
and the tests assert both directions.

**Simple and Power never disagree.** One compute feeds both. Power adds evidence
disclosures; it never re-runs analytics, never upgrades an unavailable state,
and never changes a conclusion. Simple is the default. The compute that produced
the current view is readable on the workspace element as `data-compute-token`,
so "both views came from one compute" is a state you can inspect rather than a
claim you have to trust.

**Tabs activate manually, and the accessible layer only ever projects.** The six
tabs are a real `role="tablist"` with a roving tabindex: exactly one tab holds
the page tab order, so crossing the nav costs one Tab press rather than six.
Arrow, Home and End move focus *only*; Enter and Space commit. Automatic
activation would fire a panel change on every arrow press, which is precisely
what stops a screen-reader user reading past a tab without leaving it. A skip
link jumps straight to the workspace panel, an open modal sheet marks everything
behind it inert rather than merely unfocusable, and `prefers-reduced-motion` and
`forced-colors` are honored. The accessibility controller moves focus, sets
tabindex, toggles ARIA state and hides regions — it never reads or writes an
identity, value, rank, truth state or conclusion. That is why the assistive
projection cannot disagree with the visual one: there is only one result under
both.

**A return context is a session record, never a URL.** Opening an owner page from
another tool's brief writes a strict `ReturnContext/v1` record to
`sessionStorage`, and the shared shell (`rlnav.js`) renders the return strip that
consumes it. Validation is closed: exactly the fifteen declared fields,
allowlisted routes and hashes, safe-token formats, and an unexpired window — an
unknown key is a rejection. That closure is what structurally excludes a holding,
quantity, value, mandate field or model output, because there is no admissible
shape for one. Nothing about the handoff enters the URL, history or a referrer,
so a shared link can never carry someone's research context. The strip is inert
by default: no context, a context addressed to another tool, or an expired one
renders nothing, allocates no storage, and moves no focus.

**The dossier is appended to, never edited.** A `ResearchDossier/v1` is a
hash-linked chain — each record carries its `sequence`, its `contentSha256` and
the `previousRecordHash` it follows, and the dossier carries the `headRecordHash`
the chain currently ends at. Getting something wrong therefore does not rewrite
history: a correction is a *new appended record* whose invalidation effect is
`supersedes-for-current-reading`, so the superseded reading and the reason it was
superseded both remain legible. An audit trail you can quietly edit is not an
audit trail.

## Privacy

- Personal state lives in closed local namespaces and is enumerated by the
  in-page privacy panel. The category list is derived from the runtime, not
  hand-written, so a new category cannot be added without appearing there.
- The full-personal clear empties every declared category and leaves the shared
  public cache byte-identical.
- No personal value reaches a request URL, body, referrer, console, service
  worker, `rlData` public cache, Market Brief payload, or publisher input. The
  browser suite records **every** request and asserts a sentinel never appears
  in any of them.
- The tool's public brief read is permanently `availability: "unavailable"` with
  `personalDataIncluded: false`.

## Data

Prices come from the shared `RLDATA` bar cache, cache-first and delta-only, like
every other tool. The tool issues no lookup of its own for held symbols — it
measures what the cache already has and reads an absent envelope as missing
rather than as current. A holding with no usable price is named and excluded.

## Tests

Every carrier named here exists in `tests/`. That is checked, not asserted:
`tests/portfolio-doc-integration.functional.mjs` reads this table against the
real directory listing, so a proof added without an entry here fails publication
truth instead of quietly making this inventory read as complete while hiding the
newer half of it.

| Layer | Files |
|-------|-------|
| Analytics units | `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-foundation.unit.mjs` |
| Test integrity | `tests/portfolio-test-integrity.unit.mjs` — challenges each protective test with the reduced implementation it exists to reject, so a test that could no longer fail is caught as a receipt |
| Workspace, brief and privacy | `tests/portfolio-workspace.functional.mjs`, `tests/portfolio-brief.functional.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-publisher-boundary.functional.mjs` |
| Per-tab contracts | `tests/portfolio-risk.functional.mjs`, `tests/portfolio-paths.functional.mjs`, `tests/portfolio-diversification.functional.mjs`, `tests/portfolio-allocation.functional.mjs`, `tests/portfolio-dossier.functional.mjs` |
| Shared bar cache | `tests/portfolio-bar-coverage.functional.mjs` |
| Publication truth | `tests/portfolio-doc-integration.functional.mjs` — route, registry, navigation, landing, README and this note |
| Browser | `tests/portfolio-survival-foundation.spec.mjs`, `tests/portfolio-survival-brief.spec.mjs`, `tests/portfolio-survival-risk.spec.mjs`, `tests/portfolio-survival-paths.spec.mjs`, `tests/portfolio-survival-diversification.spec.mjs`, `tests/portfolio-survival-allocation.spec.mjs`, `tests/portfolio-survival-accessibility.spec.mjs`, `tests/portfolio-survival-mobile.spec.mjs` |

Run `node scripts/selftest.mjs`, `node --test tests/portfolio-doc-integration.functional.mjs`
and the Playwright suites above. The browser tests use real fixture-overlay HTTP
servers with **no request interception** — a mocked test cannot prove a privacy
boundary.

## Specification

`specs/008-portfolio-survival-and-brief-lab/` — spec, design, and twenty-nine
scopes with per-scope evidence.
