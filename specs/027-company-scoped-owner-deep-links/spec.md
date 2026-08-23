# Feature 027 — Company-Scoped Owner Deep Links

**Status.** Delivered. Design, scopes and implementation are landed; see [report.md](report.md).
**Owner of this document.** `bubbles.analyst`.
**Closes.** `VAL-025-F4`, routed out of Feature 025's declared work boundary.
**Artifacts modified outside this folder by this analysis.** None.

---

## Problem Statement

Feature 025 shipped a company-scoped intelligence route. Its coverage registry
names, for each of fifteen dimensions, the tool that owns that dimension's math.
The reader is meant to be able to follow a dimension to its owner and keep
reading about the same company.

Feature 025's own acceptance checklist states the promise:

> "When another tool owns a dimension, the row links to that tool **for the same
> company**."

The promise is not kept. Feature 025 recorded that honestly rather than ticking
the item, and routed it out as `VAL-025-F4`:

> **VAL-025-F4 — the owner deep link does not carry the company. New, product
> defect, routed.**
> (`specs/025-company-multi-horizon-intelligence-lab/report.md` line 4638)

The sending side is finished. `rlcompanyintel.js` already composes
`<route>.html?<param>=<percent-encoded company>` whenever a registry row declares
an `ownerSubjectParam` (`ownerRouteFor`, lines 468 to 483). Two rows declare one
today and work end to end. The remaining gap is entirely on the receiving side:
the owning routes do not read a company.

This feature closes the receiving side. It adds no route, no screen, no metric
and no data source. It makes an existing promise true.

The risk that dominates this feature is not the parameter. It is that the
receiving routes belong to **other features, four of which are already certified
`done`**. A change to a certified feature's route is only acceptable if the
route's behaviour with no parameter is proven unchanged. That proof is a
first-class requirement here, not a footnote.

---

## Outcome Contract

**Intent.** A reader looking at one company on the company intelligence route
follows a dimension to the tool that owns its math, and that tool opens already
showing the same company. No re-typing, no re-selecting, no silent switch to a
different subject. Every route that cannot honour that promise says so in the
row instead of pretending.

**Success signal.** For every registry row whose owner route can resolve a
company subject, following the link opens that route with that company as its
active subject on first paint. For every one of those routes, opening it with no
parameter reproduces today's behaviour exactly. For every hostile, malformed or
unresolvable value, the route refuses the value, falls back to the subject it
shows today, and tells the reader that the link named a subject it cannot show.
For every market-scoped owner, the row stays a bare link and states why.

**Hard constraints.**

- **Backward compatibility is absolute.** Every receiving route, opened with no
  subject parameter, behaves as it does today. Four of the five receiving
  features are certified `done`. A behaviour change with the parameter absent is
  a regression against a certified feature, not a trade-off. *(P24)*
- **One convention, never two.** The subject parameter is named `ticker`,
  because `options-structure-lab.html` and `gamma-trading-lab.html` already read
  `ticker` and already work. A second convention would make the registry
  ambiguous. *(P19)*
- **One definition of the accepted value.** The grammar that decides whether a
  value is an acceptable company identifier is defined once, in one owning
  module with production consumers. It does not become a seventh private copy.
  *(P18, P19)*
- **The receiver is as strict as the sender.** Feature 025 fixed a real
  `javascript:` URL acceptance on this exact surface
  (`specs/025-.../report.md` lines 2068 to 2101) and deliberately composes the
  href from separately validated parts rather than widening a URL pattern. A
  receiver that accepts a wider value than the sender can compose reopens that
  hole from the other end. *(P8)*
- **A refused value never reaches a sink.** A value that fails the grammar is
  never rendered as text, never written to an attribute, never placed in an
  href, and never stored. *(P8)*
- **Unresolvable is a state, not a blank.** A syntactically valid company that
  the receiving route has no data for renders an explicit unavailable state
  naming the company and the reason. It never renders a blank view, a
  half-populated view, or another company's numbers under this company's name.
  *(P2, P6)*
- **A declaration requires a reader.** A registry row may declare
  `ownerSubjectParam` only once its route actually reads it. A declaration
  without a reader produces a link the receiver ignores, which is worse than a
  bare link because it looks correct. *(P7)*
- **A subject that does not exist is not invented.** A route with no company
  subject concept is not given one by this feature. It stays a bare link with a
  stated reason. *(P2)*
- **No new surface.** No new route, no new registry entry, no navigation change,
  no new data source, no new metric, no build step, no ES modules. *(P10, P17)*
- **Works with nothing.** Reading the subject from the route requires no key, no
  account and no server. *(P9)*

**Failure condition.** This feature has failed, even with every test green, if
any of the following is true. A receiving route behaves differently than it does
today when opened with no parameter. A reader follows an owner link and lands on
a different company than the one they were reading. A malformed value renders
anywhere on the page. A valid company with no data on the receiving route
produces a blank or half-populated view instead of a named unavailable state. A
registry row declares a subject parameter that its route does not read. A second
parameter convention is introduced. The accepted-value grammar is copied into a
route instead of consumed from its owner. Any artifact of Feature 025, or any
tax, `specs/021` to `specs/024`, or `specs/026` path, is modified.

---

## Goals

1. Make the owner deep link carry the company for every owner route that can
   resolve one.
2. Prove that all five receiving routes are unchanged when no subject is passed.
3. Refuse hostile and unresolvable subjects on the receiving side, with a named
   fallback.
4. Keep market-scoped owners as bare links and record the reason in the registry.
5. Use one parameter name and one accepted-value definition across every route.
6. Leave Feature 025 able to declare `ownerSubjectParam` for the rows this
   feature makes readable.

## Non-Goals

1. **No redesign of any owner tool.** No new view, no new control layout, no new
   analysis on any of the five receiving routes.
2. **No new company subject where none exists.** Routes whose subject is a
   fixture, a policy profile or a single committed series do not gain a company
   concept here. See Honest Finding 2.
3. **No corpus expansion.** No new committed bars, publications, options
   snapshots or universe entries.
4. **No change to the sending side.** `rlcompanyintel.js` already composes the
   href correctly and is not touched.
5. **No modification of Feature 025's artifacts.** This feature reports the
   downstream consequence; Feature 025's spec, design, scopes, report and
   uservalidation stay untouched by this analysis.
6. **No new route and no navigation change.** *(P17 is satisfied trivially; this
   feature ships no root page.)*
7. **No build step and no browser ES modules.** *(P10)*
8. **No lifetime-tax path and no `specs/026` path.** Both belong to concurrent
   sessions.

## Release Train

This repository has no release-train model. `config/` holds no release-train
configuration and no per-train feature-flag bundle. The product ships as a
static, build-free site. This feature therefore declares no train and no flag.

This feature also needs no reachability control, because it ships no new root
page. The `site-exclusions.json` mechanism that Feature 025 used does not apply.

---

## Current Capability Map

Every row below was read from the working tree during this analysis. Sources are
listed in **Evidence Sources**.

### The fifteen registry rows, classified

Read from `company-intelligence.config.json`.

| # | Dimension | Owner route | Subject param today | Classification |
| --- | --- | --- | --- | --- |
| 1 | `performance` | `market-brief.html` | none | Market-scoped. Correct as a bare link. |
| 2 | `fundamentals` | `company-fundamentals-lab.html` | none | ~~**Gap.** Company-scoped.~~ **Superseded** by design.md D1: shipped as `ownerBareReason: fixed-subject`. |
| 3 | `valuation` | `company-fundamentals-lab.html` | none | ~~**Gap.** Company-scoped.~~ **Superseded** by design.md D1: shipped as `ownerBareReason: fixed-subject`. |
| 4 | `technicals` | `technical-analysis-decision-lab.html` | none | **Gap, constrained.** See Honest Finding 2. |
| 5 | `cycles` | `trend-dynamics-cycle-lab.html` | none | **Gap, constrained.** See Honest Finding 2. |
| 6 | `options-structure` | `options-structure-lab.html` | `ticker` | Working precedent. |
| 7 | `dealer-gamma` | `gamma-trading-lab.html` | `ticker` | Working precedent. |
| 8 | `options-flow` | `options-flow-feed-lab.html` | none | **Gap.** Multi-subject scanner. |
| 9 | `volatility` | `volatility-sizing-lab.html` | none | **Gap.** Company-scoped selector exists. |
| 10 | `financial-events` | none | n/a | No owner. Correct as a sentence, not a link. |
| 11 | `non-financial-events` | none | n/a | No owner. Correct as a sentence, not a link. |
| 12 | `geopolitics` | `research-agenda-lab.html` | none | Market-scoped. Correct as a bare link. |
| 13 | `market-regime` | none | n/a | No owner. Correct as a sentence, not a link. |
| 14 | `sentiment` | `market-brief.html` | none | Market-scoped. Correct as a bare link. |
| 15 | `company-risk` | none | n/a | No owner. Correct as a sentence, not a link. |

Four rows have no owner. Two rows already carry the company. Three rows point at
market-scoped tools. Six rows are the gap, and those six span five distinct
routes.

### The sending side is already complete

| Fact | Where read |
| --- | --- |
| Owner route must match `/^[A-Za-z0-9._-]+\.html$/` | `rlcompanyintel.js` line 90 |
| Subject parameter name must match `/^[A-Za-z][A-Za-z0-9_]{0,31}$/` | `rlcompanyintel.js` line 95 |
| Company identifier must match `/^[A-Za-z][A-Za-z0-9.\-]{0,9}$/`, then uppercased | `rlcompanyintel.js` line 213 |
| The href is composed as `<validated route>.html?<validated param>=<percent-encoded value>` | `rlcompanyintel.js` lines 468 to 483 |
| The sending route reads its own company from `?symbol=` | `company-intelligence-lab.html` line 1681 |

No sending-side change is required. Declaring `ownerSubjectParam: "ticker"` on a
row is sufficient to make the composer emit the company.

### The receiving side, route by route

Each of the five was read directly. None reads a company parameter today.

| Route | Query parameters read today | Subject concept today | Deep link resolves to |
| --- | --- | --- | --- |
| `company-fundamentals-lab.html` | none | One accepted publication feeds the whole cockpit. No company control. Three committed CIK publications exist. | A ticker must resolve to a committed publication. Three companies qualify today. |
| `volatility-sizing-lab.html` | none | An asset selector over 11 universe assets, of which 3 are single companies (AAPL, MSFT, NVDA). | Preselect the matching asset. Other companies are unavailable. |
| `options-flow-feed-lab.html` | none | A scanner over a hardcoded 12-symbol universe. Renders many tickers at once. | Focus the company's own row within the scan. See Open Question 3. |
| `technical-analysis-decision-lab.html` | `fixture`, `clock` | No instrument is named. Selection is source, timeframe, sensitivity and validation policies. | Nothing resolvable today. See Honest Finding 2. |
| `trend-dynamics-cycle-lab.html` | `fixture`, `clock`, `case`, `profile` | One series in the catalog: `spy-daily`. | Nothing resolvable today. See Honest Finding 2. |

### The working precedent

`options-structure-lab.html` line 2524 and `gamma-trading-lab.html` line 1810
carry the same function under the same comment:

> "A company named by a deep link from an owning workspace. The value is accepted
> only as a plain ticker, so a link can seed the subject and nothing else."

Both trim the raw value, uppercase it, test it against
`/^[A-Z0-9.\-]{1,12}$/`, and return `null` on failure. Both let an explicit deep
link outrank restored session state. This is the behaviour to generalise, and it
already exists twice.

### One candidate home for the shared definition

`rlticker.js` is loaded by all five receiving routes, by both precedent routes,
and by the sending route. It already owns `normTicker`, which is the trim and
uppercase half of the precedent. It is therefore the only module in the tree that
is already a production dependency of every consumer this feature touches. The
choice of module is the design owner's; this analysis records that a home with
seven existing production consumers exists, so P18 and P19 can be satisfied
without creating a new module.

---

## Honest Findings

These correct or sharpen the premise this analysis was given. Each was verified.

**Honest Finding 1 — two of the five receiving routes read query parameters
already, and the premise understated it.** `technical-analysis-decision-lab.html`
reads `fixture` **and** `clock` (line 3644). `trend-dynamics-cycle-lab.html`
reads `fixture`, `clock`, `case` **and** `profile` (lines 4092 to 4096). Adding a
subject parameter must not disturb those, and their precedence relative to the
new parameter must be stated rather than assumed. The other three routes read no
query parameter at all.

**Honest Finding 2 — two of the five routes have no company subject to receive.**
This is the largest correction. `trend-dynamics-cycle-lab.html` has exactly one
series in its catalog, `spy-daily`, labelled "SPDR S&P 500 ETF adjusted close".
`technical-analysis-decision-lab.html` names no instrument at all; its
`initialSelection` chooses a source policy, a timeframe profile, a sensitivity
profile and a validation policy, and its own status text states that "no
instrument is named". For these two routes, accepting a ticker is not "read a
parameter". It is giving the tool a company-subject capability it does not have.
That is a capability change to Feature 006 (`done`) and Feature 007 (`blocked` on
human acceptance), and it would breach this feature's requirement and scope
ceiling. See Open Question 1. This analysis recommends those two rows stay bare
with a stated reason, and that this feature deliver the three routes that can
actually resolve a company.

**Honest Finding 3 — the sender grammar and the receiver grammar are not the
same.** The sender accepts `/^[A-Za-z][A-Za-z0-9.\-]{0,9}$/`, which requires a
leading letter and allows at most ten characters. The precedent receiver accepts
`/^[A-Z0-9.\-]{1,12}$/` after uppercasing, which allows a leading digit and up to
twelve characters. Every sender-valid value is receiver-valid, so no composed
link is rejected. The reverse is not true, so a hand-typed URL can be accepted by
a receiver that the sender would never have produced. This is not a live defect.
It is an inconsistency that must be resolved deliberately. See Open Question 4.

**Honest Finding 4 — the five receiving features are not uniformly certified
`done`.** The premise described them as "several already certified done". The
measured state is more specific, and one is not `done` at all.

| Route | Governing feature | That feature's status |
| --- | --- | --- |
| `company-fundamentals-lab.html` | `specs/010-company-fundamentals-and-brief-lab` | `done` |
| `volatility-sizing-lab.html` | `specs/011-volatility-regime-and-sizing-lab` | `done` |
| `trend-dynamics-cycle-lab.html` | `specs/006-trend-dynamics-cycle-lab` | `done` |
| `technical-analysis-decision-lab.html` | `specs/007-technical-analysis-decision-lab` | **`blocked`** on Gate G136 human acceptance, with 17 unchecked acceptance items |
| `options-flow-feed-lab.html` | **no originating feature** | see below |

**Honest Finding 5 — `options-flow-feed-lab.html` has no owning feature.** It was
added on 2026-07-08 in a standalone commit, "options-flow-feed-lab: unusual
options activity scanner (honest EOD proxy)", before the feature series covered
it. No spec claims it as a deliverable. Feature 002 (`done`) registers it as a
brief source, and Feature 012 (`blocked`) owns `BUG-001` against it. There is
therefore no single certified feature whose acceptance a change to this route
must preserve, and equally no feature that will notice a regression. The
regression proof for this route must be constructed rather than inherited.

**Honest Finding 6 — Feature 025's existing tests do not block the declaration.**
`tests/company-intelligence-lab.spec.mjs` line 148 asserts the registered-route
check against the path half only, after splitting on `?`, and separately asserts
that the query names the company being read.
`tests/company-intelligence.unit.mjs` lines 1617 to 1702 filter rows by
`ownerSubjectParam !== null` rather than asserting a fixed count. Declaring six
more rows will not break either. Feature 025's report line 4645 states that a
query suffix "would fail" the registered-route assertion; that statement is stale
against the current test, which was subsequently widened.

**Honest Finding 7 — one concurrent feature overlaps three of the five routes.**
`specs/026-actionable-brief-brevity-and-cross-asset/spec.md` references
`technical-analysis-decision-lab.html`, `trend-dynamics-cycle-lab.html` and
`options-flow-feed-lab.html`. That feature belongs to a concurrent session and
was not read beyond confirming those references. Sequencing is a plan-owner
decision. See Open Question 7.

---

## Domain Capability Model

The capability-first triggers apply: this feature applies one shared contract
across five routes owned by five different features, and two routes already
implement it. The capability is therefore defined before any route.

### Capability

**Subject handoff between owning tools.** A tool that names another tool as the
owner of a piece of math can also name the subject it was reading, so the reader
continues the same investigation instead of restarting it.

### Domain primitives

| Primitive | Definition |
| --- | --- |
| **Subject** | The public company a reader is currently investigating, identified by its ticker. |
| **Owner route** | A registered tool that owns a dimension's math. |
| **Subject-carrying route** | An owner route that can resolve a subject and present it. |
| **Bare route** | An owner route that cannot resolve a subject, either because it is market-scoped or because it has no subject concept. |
| **Handoff** | A single navigation from a naming tool to an owner route that names the subject. |
| **Refusal** | The receiving route's decision that a named subject is not acceptable, with a named fallback. |
| **Unresolvable subject** | A syntactically acceptable subject for which the receiving route holds no data. |

### Lifecycle of a handoff

`composed` → `received` → one of `resolved`, `refused`, `unresolvable`.

A handoff never rests in an intermediate state. A route that has received a
subject is either showing it, or showing its default with a stated reason.

### Relationships

- A dimension has at most one owner route.
- An owner route serves one or more dimensions. `company-fundamentals-lab.html`
  serves two.
- A subject-carrying route declares exactly one subject parameter name.
- All subject-carrying routes share one parameter name and one accepted-value
  definition.
- A bare route declares no subject parameter and carries a stated reason.

### Business policies every implementation must obey

1. A route is subject-carrying only if it can resolve a subject. Declaration
   follows capability; it never precedes it.
2. Absence of the subject means today's behaviour, unchanged.
3. A named subject outranks a restored session, because the reader's most recent
   act is the link they just followed.
4. An unacceptable subject is refused before it reaches any sink, and the route
   falls back to the subject it would have shown with no parameter.
5. An acceptable subject the route has no data for is reported as unavailable by
   name. It is never rendered as a blank or as another subject's numbers.
6. A market-scoped route is bare by design, and the design is recorded.
7. There is one parameter name and one accepted-value definition across the whole
   product.

---

## Actors

| Actor | Description | Goal in this feature | Permissions |
| --- | --- | --- | --- |
| Researcher | The single operator reading the company intelligence route. | Follow a dimension to its owner and keep reading the same company. | Read-only. Opens routes, follows links, types URLs. |
| Owner-tool reader | The same person arriving at an owner route directly, without a deep link. | Have the tool behave exactly as it always has. | Read-only. |
| Hostile URL author | Anyone who can hand the operator a crafted link, including the operator pasting a mangled URL. | Out of scope as a goal. The system's goal is to refuse the input. | None granted. |
| Feature owner of a receiving route | The party accountable for a certified feature whose route changes. | Keep that feature's accepted behaviour intact. | Owns the regression bar for that route. |

---

## Use Cases

### UC-027-001: Follow a dimension to its owner and keep the company

- **Actor:** Researcher.
- **Preconditions:** The company intelligence route is open on a company. The
  dimension has an owner route that can resolve a subject.
- **Main flow:**
  1. The researcher reads a dimension row and wants the owner's full workings.
  2. The researcher follows the row's owner link.
  3. The owner route opens with that company as its active subject.
  4. The route names the active subject so the researcher can confirm it.
- **Alternative flows:**
  - The owner route holds no data for that company. It opens on its default
    subject and states, by name, that it has no data for the requested company.
  - The owner route is market-scoped. The link is bare and the row says so.
- **Postconditions:** The researcher is reading the same company on the owner
  route, or knows precisely why they are not.

### UC-027-002: Open an owner route directly, as always

- **Actor:** Owner-tool reader.
- **Preconditions:** None. The route is opened with no query string, or with only
  the query parameters it already accepted before this feature.
- **Main flow:**
  1. The reader opens the owner route.
  2. The route selects the same default subject it selected before this feature.
  3. Every control, every default and every rendered value matches the
     pre-feature behaviour.
- **Postconditions:** The reader cannot tell this feature happened.

### UC-027-003: A crafted or malformed subject arrives

- **Actor:** Hostile URL author, or a researcher with a mangled URL.
- **Preconditions:** An owner route is opened with a subject value that is not an
  acceptable company identifier.
- **Main flow:**
  1. The route reads the value.
  2. The route tests the value against the single accepted-value definition.
  3. The test fails.
  4. The route discards the value without rendering, storing or linking it.
  5. The route continues with the subject it would have shown with no parameter.
  6. The route states that the link named a subject it could not accept.
- **Postconditions:** No part of the crafted value appears anywhere on the page,
  and the route is fully usable.

### UC-027-004: A registry row becomes subject-carrying

- **Actor:** Feature owner of a receiving route.
- **Preconditions:** An owner route now reads and resolves the shared subject
  parameter, with regression proof for the no-parameter case.
- **Main flow:**
  1. The owner confirms the route resolves a subject.
  2. The registry row for each dimension that route owns declares the shared
     parameter name.
  3. The composed link now carries the company.
- **Alternative flows:**
  - The route cannot resolve a subject. The row stays bare and records the
    reason.
- **Postconditions:** Every declared row has a reader, and every bare row has a
  reason.

---

## Business Scenarios

Eighteen scenarios. Each carries a stable identifier.

### Cluster 1 — Arriving on the same company

#### BS-027-001: A company-scoped owner opens on the company that was being read

```gherkin
Given the researcher is reading a company on the company intelligence route
And the dimension's owner route can resolve a company subject
When the researcher follows that dimension's owner link
Then the owner route opens with that company as its active subject
And the owner route names the active subject on screen
```

#### BS-027-002: The link outranks whatever the tool remembered

```gherkin
Given an owner route remembers a different company from a previous visit
When the researcher arrives through an owner link naming a company
Then the route presents the company named by the link
And the remembered company does not override it
```

#### BS-027-003: A scanner focuses the named company without hiding the scan

```gherkin
Given the owner route presents many companies at once
When the researcher arrives through an owner link naming one of them
Then that company's own read is the one the route presents first
And the researcher can still see the rest of the scan
```

#### BS-027-004: The reader can always tell which company is shown

```gherkin
Given the researcher has arrived on an owner route through a deep link
When the route finishes its first paint
Then the active company is stated in words on the page
And it is not inferable only from a chart or a table cell
```

### Cluster 2 — Nothing changes without a parameter

#### BS-027-005: No parameter means today's behaviour

```gherkin
Given a receiving owner route
When it is opened with no subject parameter
Then it selects exactly the default subject it selected before this feature
And every control, default and rendered value matches the pre-feature behaviour
```

#### BS-027-006: An empty subject is the same as no subject

```gherkin
Given a receiving owner route
When it is opened with a subject parameter that is empty or only whitespace
Then it behaves exactly as if no subject parameter had been supplied
```

#### BS-027-007: Existing query parameters keep their meaning

```gherkin
Given an owner route that already accepted its own query parameters
When it is opened with those parameters and no subject parameter
Then each of them behaves exactly as it did before this feature
And the presence of a subject parameter never changes what they mean
```

#### BS-027-008: A certified feature's accepted behaviour is re-proved

```gherkin
Given a receiving route belongs to a feature that was already accepted
When this feature changes that route
Then that feature's accepted behaviour is demonstrated again with no subject parameter
And the demonstration is recorded as evidence for this feature
```

### Cluster 3 — Refusing what must not be trusted

#### BS-027-009: A malformed subject is refused and the tool still works

```gherkin
Given an owner route is opened with a subject value that is not an acceptable company identifier
When the route reads the value
Then it discards the value
And it continues with the subject it would have shown with no parameter
And the route remains fully usable
```

#### BS-027-010: A crafted value never reaches the page

```gherkin
Given an owner route is opened with a subject value carrying a scheme, markup, or a control character
When the route reads the value
Then no part of that value is rendered as text
And no part of that value is written into an attribute or a link
And no part of that value is stored for a later visit
```

#### BS-027-011: The reader is told the subject was not accepted

```gherkin
Given an owner route refused the subject named in the link
When the route finishes its first paint
Then it states that the link named a subject it could not accept
And it states which subject it is showing instead
```

#### BS-027-012: A valid company with no data is named as unavailable

```gherkin
Given an owner route is opened with an acceptable company it holds no data for
When the route finishes its first paint
Then it names that company and states that it has no data for it
And it does not render a blank view
And it does not render another company's values under that company's name
```

#### BS-027-013: A refusal never leaves the tool half-configured

```gherkin
Given an owner route began applying a subject and then refused it
When the route finishes its first paint
Then every control reflects one single subject
And no control reflects the refused value
```

### Cluster 4 — Honest declarations across the registry

#### BS-027-014: A market-scoped owner stays a bare link

```gherkin
Given a dimension whose owner route answers a market-wide question
When the row renders its owner link
Then the link carries no company
And the row states that the owner is market-scoped rather than company-scoped
```

#### BS-027-015: A route with no company subject stays bare and says why

```gherkin
Given a dimension whose owner route has no company subject concept
When the row renders its owner link
Then the link carries no company
And the row states that the owner route opens on its own subject
```

#### BS-027-016: A declaration without a reader is refused

```gherkin
Given a registry row declares a subject parameter
When the route it names does not read that parameter
Then the condition is reported as a defect
And it is not allowed to ship as a working deep link
```

#### BS-027-017: One convention across every subject-carrying route

```gherkin
Given more than one route carries a company subject
When their parameter names are compared
Then every route uses the same parameter name
And every route accepts the same set of company identifier values
```

#### BS-027-018: The upstream promise becomes satisfiable

```gherkin
Given every owner route that can resolve a company now reads the shared subject parameter
And every row for those routes declares the shared parameter name
When the upstream acceptance item about linking to an owner for the same company is re-read
Then it can be exercised end to end for those dimensions
And the dimensions that remain bare carry a stated reason rather than a silent gap
```

---

## Functional Requirements

Thirty-four requirements, inside the ~40 ceiling. Every requirement traces to at
least one business scenario in the **Traceability** table.

### A. One shared convention

- **FR-027-001** The subject parameter has one name across every subject-carrying
  route, and that name is the one two routes already use.
- **FR-027-002** The rule that decides whether a value is an acceptable company
  identifier is defined once, in one module that already has production
  consumers. No route defines its own copy.
- **FR-027-003** The accepted-value rule preserves the behaviour of the two
  precedent routes exactly. Any value they accept today they still accept, and
  any value they reject today they still reject.
- **FR-027-004** The accepted-value rule accepts every value the sending route
  can compose, so a composed link is never refused for grammar.
- **FR-027-005** Reading the subject reads a value only. No route derives a
  scheme, an authority, a path or a destination from it.

### B. Arriving on the same company

- **FR-027-006** An owner route that can resolve a company presents the company
  named in the link as its active subject on first paint.
- **FR-027-007** A subject named in the link takes precedence over any subject
  the route restored from a previous visit.
- **FR-027-008** For an owner route that presents several companies at once,
  presenting the named company means that company's own read is the one shown
  first, without removing the reader's access to the rest.
- **FR-027-009** Every route that has applied a subject states that subject in
  words on the page.
- **FR-027-010** The subject travels through the link alone. No route obtains it
  from shared storage, a global, or any other cross-tool channel.

### C. Backward compatibility for the receiving features

- **FR-027-011** Every receiving route, opened with no subject parameter, selects
  the same default subject and renders the same values it does today.
- **FR-027-012** A subject parameter that is absent, empty, or whitespace only
  produces identical behaviour in all three cases.
- **FR-027-013** Every query parameter a receiving route already accepted keeps
  its existing meaning, its existing validation and its existing effect.
- **FR-027-014** For each receiving route governed by a feature that was already
  accepted, that feature's accepted behaviour is demonstrated again with no
  subject parameter, and the demonstration is recorded as evidence here.
- **FR-027-015** For the receiving route with no owning feature, an equivalent
  no-parameter behaviour baseline is captured before the change and demonstrated
  again after it.
- **FR-027-016** No receiving route changes its registry entry, its navigation
  entry, its file name or its exposure identity.

### D. Refusing hostile and unresolvable subjects

- **FR-027-017** A subject value that fails the accepted-value rule is discarded
  before it is used for anything.
- **FR-027-018** A discarded value is never rendered as text, never written into
  an attribute, never placed in a link, and never persisted.
- **FR-027-019** After discarding a value, the route continues with the subject
  it would have shown had no subject parameter been supplied.
- **FR-027-020** After discarding a value, the route states that the link named a
  subject it could not accept, and states which subject it is showing.
- **FR-027-021** A subject that passes the accepted-value rule but for which the
  route holds no data produces an explicit unavailable state that names the
  subject and the reason.
- **FR-027-022** An unavailable subject never produces a blank view, a partially
  populated view, or values belonging to a different subject.
- **FR-027-023** A route that refuses a subject leaves every control consistent
  with one single subject.

### E. Market-scoped owners stay bare, on purpose

- **FR-027-024** The owner routes that answer market-wide questions carry no
  subject parameter and remain bare links.
- **FR-027-025** The registry records, for each bare market-scoped owner, that
  the owner is market-scoped, so a later reader does not read it as an omission.
- **FR-027-026** No market-scoped owner row is given a subject parameter.

### F. Honest declaration and subject capability

- **FR-027-027** A registry row declares a subject parameter only when the route
  it names actually reads and resolves that parameter.
- **FR-027-028** An owner route with no company subject concept is not given one
  by this feature. Its rows remain bare.
- **FR-027-029** Each bare row that is bare for a reason other than market scope
  records that reason in the reader-visible row.
- **FR-027-030** A declared row whose route does not read the parameter is
  treated as a defect and does not ship.

### G. Boundaries and downstream consequence

- **FR-027-031** This feature adds no route, no registry entry, no navigation
  entry, no data source and no metric.
- **FR-027-032** This feature introduces no build step and no browser ES modules,
  and every changed route continues to work with no key, no account and no
  server.
- **FR-027-033** On completion, the upstream coverage registry can declare the
  shared subject parameter for every dimension whose owner route became
  subject-carrying, and the upstream acceptance item about following the math to
  its owner for the same company becomes exercisable for those dimensions.
- **FR-027-034** This feature modifies no artifact of the upstream feature, no
  lifetime-tax path, and no concurrent feature folder.

### Traceability

| Requirement | Scenarios |
| --- | --- |
| FR-027-001 | BS-027-017 |
| FR-027-002 | BS-027-017 |
| FR-027-003 | BS-027-005, BS-027-017 |
| FR-027-004 | BS-027-001, BS-027-017 |
| FR-027-005 | BS-027-010 |
| FR-027-006 | BS-027-001 |
| FR-027-007 | BS-027-002 |
| FR-027-008 | BS-027-003 |
| FR-027-009 | BS-027-004 |
| FR-027-010 | BS-027-001, BS-027-002 |
| FR-027-011 | BS-027-005 |
| FR-027-012 | BS-027-006 |
| FR-027-013 | BS-027-007 |
| FR-027-014 | BS-027-008 |
| FR-027-015 | BS-027-008 |
| FR-027-016 | BS-027-005 |
| FR-027-017 | BS-027-009 |
| FR-027-018 | BS-027-010 |
| FR-027-019 | BS-027-009 |
| FR-027-020 | BS-027-011 |
| FR-027-021 | BS-027-012 |
| FR-027-022 | BS-027-012 |
| FR-027-023 | BS-027-013 |
| FR-027-024 | BS-027-014 |
| FR-027-025 | BS-027-014 |
| FR-027-026 | BS-027-014 |
| FR-027-027 | BS-027-016 |
| FR-027-028 | BS-027-015 |
| FR-027-029 | BS-027-015 |
| FR-027-030 | BS-027-016 |
| FR-027-031 | BS-027-005 |
| FR-027-032 | BS-027-005 |
| FR-027-033 | BS-027-018 |
| FR-027-034 | BS-027-018 |

---

## Non-Functional Requirements

- **NFR-027-001 Regression bar.** The no-parameter behaviour of every receiving
  route is proven by a test that fails if the behaviour changes. A visual
  inspection is not evidence.
- **NFR-027-002 Adversarial bar.** Every refusal requirement is proven by a test
  that fails when the refusal is removed. A guard that cannot fail is not a
  guard. *(P23)*
- **NFR-027-003 Single definition.** A repository search shows exactly one
  definition of the accepted-value rule, and every consumer reads it. *(P19)*
- **NFR-027-004 Production consumers.** The module that owns the rule has
  production consumers, not only tests. *(P18)*
- **NFR-027-005 No build step.** Every changed file remains loadable without a
  bundler and works from a plain file open. *(P10)*
- **NFR-027-006 First paint.** Applying a deep-linked subject does not delay the
  route's first paint beyond its current behaviour, and does not introduce a
  network request the route did not already make. *(P12)*
- **NFR-027-007 No new data.** No new network source, no new credential and no
  new corpus entry is introduced. *(P9, P11)*
- **NFR-027-008 Accessibility of the stated subject.** The active subject and any
  refusal notice are readable as text, not conveyed by colour or position alone.
- **NFR-027-009 Budget.** Any assertion count or size budget touched by this
  feature is raised only with a failing test that justified it, never to make a
  check pass. *(P22)*

---

## Product Principle Alignment

| Principle | Application here |
| --- | --- |
| P1 provenance | No new figure is displayed, so no new provenance obligation arises. The unavailable notice names its reason. |
| P2 missing renders as missing | FR-027-021 and FR-027-022. An unresolvable company is named as unavailable, never blank. |
| P3 confidence | Not applicable. This feature displays no confidence. |
| P4 misses | Not applicable. No scoreable claim. |
| P5 minimum sample | Not applicable. No rate. |
| P6 say when the read is old | Unchanged. This feature does not alter any freshness display. |
| P7 no blackbox numbers | FR-027-027 and FR-027-030. A link that claims to carry a company must actually carry one. |
| P8 model text is data | FR-027-018. A refused value never becomes markup. |
| P9 works with nothing | FR-027-032 and NFR-027-007. |
| P10 UMD never ESM | FR-027-032 and NFR-027-005. |
| P11 reuse never refetch | NFR-027-007. |
| P12 cache-first first paint | NFR-027-006. |
| P13 tickers only | The only value that crosses the link is a ticker. No position, size, cost basis or profit. |
| P14 Simple default | Unchanged. This feature adds no view. |
| P15 explained in place | FR-027-020, FR-027-025 and FR-027-029. Every bare link and every refusal states its reason where the reader is. |
| P16 deep-link never duplicate | This feature is the direct enforcement of P16. It makes the deep link usable so no reader has a reason to recompute elsewhere. |
| P17 reachable or removed | FR-027-031. No new root page ships, so nothing can ship hidden. |
| P18 wired or not shipped | FR-027-002 and NFR-027-004. |
| P19 one definition per concept | FR-027-001, FR-027-002 and NFR-027-003. |
| P20 every claim scoreable | Not applicable. This feature makes no market claim. |
| P21 additive, append-only | The registry gains an optional field on existing rows. No row is rewritten and no contract is narrowed. |
| P22 budgets are assertions | NFR-027-009. |
| P23 a guard that cannot fail | NFR-027-002. |
| P24 superseding closes the superseded | FR-027-033. The upstream finding is closed by this feature rather than left open in two places. |
| P25 specs are capped | 34 requirements and a recommended 3 scopes, both inside the ceiling. |

**Admission test.** Does this improve decision quality, or the measurement of
decision quality? It improves decision quality. A researcher who has to re-select
a company in the owning tool loses their place and frequently reads a different
company's numbers by accident. The current bare link is a correctness hazard
disguised as a convenience gap.

---

## Competitive Analysis

No new competitor page was fetched for this analysis. The relevant axis was
already fetched and recorded in Feature 025's Competitive Analysis, and this
feature is an internal navigation-consistency change rather than a new
capability. Reusing that verified evidence is honest; fetching new pages to fill
a template would not add signal.

From the Feature 025 fetches, one row bears on this feature.

| Capability | Research Lab today | What the fetched competitor pages established |
| --- | --- | --- |
| Explicit unavailable states | Enforced by principle | None of the fetched pages advertised explicit unavailable states or per-figure provenance |

The competitive point specific to this feature is negative and worth stating
plainly. A subject that follows the reader between views is table stakes on any
integrated terminal; it is not a differentiator. Its absence here is a defect
against a promise this product already made to itself, not a missing feature
relative to the market. The differentiator this feature protects is the one
Feature 025 identified: saying exactly where the evidence stops. A bare link that
silently opens on a different company is the opposite of that, because it looks
like an answer about your company and is not.

**Table stakes, not a differentiator.** Prioritise it as correctness work.

---

## Improvement Proposals

### IP-027-001: One shared subject-handoff definition instead of a seventh copy ⭐ Competitive edge

- **Impact:** Medium.
- **Effort:** S.
- **Competitive advantage:** It removes the class of bug where two tools disagree
  about what a valid company is. Two private copies of the rule exist today. Five
  more would make seven.
- **Actors affected:** Researcher, every future tool author.
- **Business scenarios:** BS-027-017.

### IP-027-002: Record why each bare link is bare ⭐ Competitive edge

- **Impact:** Medium.
- **Effort:** S.
- **Competitive advantage:** It converts five silent gaps into five stated
  positions, which is the product's declared differentiator. A future reader
  cannot mistake a deliberate market-scoped link for an unfinished one.
- **Actors affected:** Researcher, future analyst.
- **Business scenarios:** BS-027-014, BS-027-015.

### IP-027-003: Give the two subject-less routes a company subject

- **Impact:** High for coverage, high for risk.
- **Effort:** L.
- **Competitive advantage:** It would make `technicals` and `cycles` company
  answerable, which is the largest remaining hole in the coverage promise.
- **Why it is not in this feature:** It is a capability change to Feature 006 and
  Feature 007, not a parameter change, and it would breach this feature's
  ceiling. See Honest Finding 2 and Open Question 1. Proposed as a separate
  feature.
- **Business scenarios:** BS-027-015 records the honest interim position.

---

## Change Magnitude Decision

**Minor, and it stays minor deliberately.**

| Test | Result |
| --- | --- |
| New endpoints | None. This product has no server. |
| New routes or screens | None. |
| New actor types | None. |
| Schema change | One optional field on existing registry rows, additive. |
| New service boundaries | None. |
| UI changes | A stated active subject and a refusal notice on three routes. |

This is a new feature folder rather than an amendment to Feature 025 for one
reason: the work lands in routes Feature 025 does not own, and Feature 025's
declared work boundary explicitly excludes them. That is why `VAL-025-F4` was
routed rather than patched.

**Recommended scope shape, for the plan owner, at three scopes.** The plan owner
decides; this is an analyst recommendation, not a scope decomposition.

1. The shared subject-handoff definition and its adoption by the two precedent
   routes, proving their behaviour is unchanged.
2. The three receiving routes that can resolve a company, each with its
   no-parameter regression proof and its refusal proof.
3. The registry declarations and the stated reasons for every row that stays
   bare.

---

## UI Scenario Matrix

No new screen is designed by this feature, so no wireframes are included. The
changes are to what an existing screen shows on arrival.

| Scenario | Actor | Entry point | Steps | Expected outcome | Screen |
| --- | --- | --- | --- | --- | --- |
| BS-027-001 | Researcher | Company intelligence coverage row | Follow the owner link | The owner route opens on the same company and names it | Owner route, first paint |
| BS-027-003 | Researcher | Company intelligence coverage row | Follow the owner link to a scanner | The company's row is presented first, the rest of the scan is still reachable | Scanner route |
| BS-027-005 | Owner-tool reader | Direct navigation or navigation menu | Open the route with no query | The route looks and behaves exactly as before | Owner route, first paint |
| BS-027-011 | Researcher | A mangled or crafted URL | Open the route | A notice states the named subject was not accepted and which subject is shown | Owner route, status area |
| BS-027-012 | Researcher | Company intelligence coverage row | Follow the owner link for a company the route has no data for | The route names the company and states it has no data for it | Owner route, status area |
| BS-027-014 | Researcher | Company intelligence coverage row | Read a market-scoped owner row | The row states the owner is market-scoped and the link carries no company | Company intelligence coverage table |
| BS-027-015 | Researcher | Company intelligence coverage row | Read a subject-less owner row | The row states the owner opens on its own subject | Company intelligence coverage table |

---

## Exposure Contract

| Capability | Surface class | Surface id | Status | Plan |
| --- | --- | --- | --- | --- |
| Shared subject-handoff definition | internal | one owning shared module already loaded by every consumer | planned | Consumed in production by every subject-carrying owner route delivered in this feature |
| Subject-carrying arrival on the fundamentals route | uiRoute | `company-fundamentals-lab.html` | superseded | Design ruling D1 made this route bare (`fixed-subject`); it reads no query parameter and gained no subject arrival |
| Subject-carrying arrival on the volatility route | uiRoute | `volatility-sizing-lab.html` | planned | Already registered in `tools.json`; this feature adds subject arrival |
| Subject-carrying arrival on the options-flow route | uiRoute | `options-flow-feed-lab.html` | planned | Already registered in `tools.json`; this feature adds subject arrival |
| Subject-carrying arrival on the options-structure route | uiRoute | `options-structure-lab.html` | delivered | Verified reading `ticker` at line 2524 today |
| Subject-carrying arrival on the gamma route | uiRoute | `gamma-trading-lab.html` | delivered | Verified reading `ticker` at line 1810 today |
| Owner-link composition carrying a subject | internal | `rlcompanyintel.js` `ownerRouteFor` | delivered | Verified composing `<route>?<param>=<value>` at lines 468 to 483, consumed in production by the company intelligence route |
| Registry declaration of the subject parameter | internal | `company-intelligence.config.json` coverage registry rows | planned | Declared for each row whose route becomes subject-carrying in this feature |
| Stated reason on every bare owner row | uiRoute | company intelligence coverage table | planned | Rendered by the existing coverage table; no new surface |

Three rows are marked delivered and each was confirmed by reading the source in
this session. No planned row names a target outside this feature.

No row is orphaned: every planned capability names the route or file that
exposes it, and no capability in this feature is reachable only by a test.

---

## Acceptance Criteria

This specification is complete when all of the following hold.

1. Every registry row is classified as company-scoped, market-scoped, or
   ownerless, and each classification cites the source that established it.
2. Every functional requirement traces to at least one business scenario.
3. Every business scenario carries a stable identifier and a valid Gherkin block.
4. The backward-compatibility obligation for the receiving features is expressed
   as a requirement with its own proof obligation, not as advice.
5. The routes that cannot resolve a company are named as such, with evidence,
   rather than assumed to be a parameter away.
6. The governing feature and its current status are recorded for each receiving
   route, including the route that has no governing feature.
7. The requirement count stays at or below the ceiling, and the recommended scope
   count stays at or below five.
8. Every principle from P1 to P25 has an alignment row or a stated reason for
   non-application.
9. No artifact outside this feature folder is modified by this analysis.

---

## Open Questions

These need an owner decision. None blocks this analysis.

1. **Do `technicals` and `cycles` stay bare?** `technical-analysis-decision-lab`
   names no instrument and `trend-dynamics-cycle-lab` has one series,
   `spy-daily`. Giving either a company subject is a capability change to
   Feature 006 (`done`) and Feature 007 (`blocked`), not a parameter change. This
   analysis recommends both rows stay bare with a stated reason, and that
   IP-027-003 carry the capability work in a separate feature. The design owner
   must confirm or reject.

2. **Who declares `ownerSubjectParam` on the six rows?** The sending composer
   already honours the declaration, so the config edit is one line per row. This
   analysis recommends this feature owns the declaration, because a declaration
   without a reader produces a link the receiver silently ignores. The
   alternative is for Feature 025 to declare it after this feature lands, which
   leaves `VAL-025-F4` open for an extra cycle. An owner must choose.

3. **What does "the same company" mean for the options-flow scanner?**
   `options-flow-feed-lab.html` renders a hardcoded twelve-symbol universe as a
   multi-ticker table. Options are: filter the table to the named company,
   pre-sort so it is first, or highlight it in place. Each answers "opens on that
   company" differently, and each changes what a reader loses. This needs a
   product decision before design.

4. **Are the sender and receiver grammars unified?** The sender accepts
   `/^[A-Za-z][A-Za-z0-9.\-]{0,9}$/`; the precedent receiver accepts
   `/^[A-Z0-9.\-]{1,12}$/` after uppercasing. Every sender-valid value is
   receiver-valid, so no composed link breaks, but the receiver accepts values the
   sender would never produce. Unifying them changes the two precedent routes'
   accepted set, which FR-027-003 currently forbids. Deliberately documenting the
   receiver as a superset is the lower-risk option. An owner must pick one.

5. **What happens for a company outside a receiving route's corpus?**
   `company-fundamentals-lab` has three committed publications;
   `volatility-sizing-lab` has three single companies in an eleven-asset universe;
   `options-flow-feed-lab` has twelve hardcoded symbols. The committed bar corpus
   has 293 symbols. Most companies will therefore be unresolvable on most routes.
   FR-027-021 requires a named unavailable state. The design owner must decide
   whether the naming tool should also mark the link as unlikely to resolve
   before the reader follows it.

6. **Does changing `technical-analysis-decision-lab` reopen Feature 007's
   acceptance?** Feature 007 is `blocked` with 17 unchecked human acceptance
   items. If Open Question 1 is answered "give it a subject", that route changes
   while its acceptance is pending. Whether the pending acceptance must be
   re-scoped is a human decision, not an agent one.

7. **How is this sequenced against the concurrent feature?**
   `specs/026-actionable-brief-brevity-and-cross-asset` references three of the
   five receiving routes. It belongs to a concurrent session and was not read
   beyond confirming those references. The plan owner must sequence the two, or
   confirm the surfaces do not collide.

8. **Does `options-flow-feed-lab.html` need an owning feature first?** It has
   none. Changing an unowned route means there is no accepted behaviour to
   preserve and no owner to sign off the regression. FR-027-015 requires a
   captured baseline instead. Whether that is sufficient, or whether the route
   should be adopted by a feature first, is an owner decision.

---

## Evidence Sources

Every claim in this document was read from the working tree in this session.

| Claim | Source read |
| --- | --- |
| The coverage registry has 15 rows with the owners and subject params listed | `company-intelligence.config.json`, `coverageRegistry` |
| Four rows have a null owner | Same file, rows `financial-events`, `non-financial-events`, `market-regime`, `company-risk` |
| Two rows declare `ownerSubjectParam: "ticker"` | Same file, rows `options-structure`, `dealer-gamma` |
| The owner-route pattern forbids a query string | `rlcompanyintel.js` line 90 |
| The subject-parameter-name pattern | `rlcompanyintel.js` line 95 |
| The sender's company identifier grammar | `rlcompanyintel.js` line 213 |
| The composer builds `<route>?<param>=<encoded value>` from validated parts | `rlcompanyintel.js` lines 468 to 483 |
| The sending route reads its own company from `?symbol=` | `company-intelligence-lab.html` line 1681 |
| `options-structure-lab.html` reads `ticker` and validates it | Line 2524 and the surrounding `tickerFromQuery` |
| `gamma-trading-lab.html` reads `ticker` and validates it | Line 1810 and the surrounding `tickerFromQuery` |
| Both precedent routes let a deep link outrank restored session state | The `linked` assignment in each `boot`/`afterUni` |
| `company-fundamentals-lab.html` reads no query parameter | Search for `URLSearchParams` and `location.search` returned nothing |
| `options-flow-feed-lab.html` reads no query parameter | Same search returned nothing |
| `volatility-sizing-lab.html` reads no query parameter | Same search returned nothing |
| `technical-analysis-decision-lab.html` reads `fixture` and `clock` | Line 3644 |
| `trend-dynamics-cycle-lab.html` reads `fixture`, `clock`, `case` and `profile` | Lines 4092 to 4096 |
| `market-brief.html` reads no query parameter | Same search returned nothing |
| `research-agenda-lab.html` reads only `fixture` | Line 1025 |
| `trend-dynamics-cycle-lab` has one series, `spy-daily` | `trend-dynamics-cycle-universe.json`, `series` array of length 1 |
| `technical-analysis-decision-lab` names no instrument in its initial selection | `technical-analysis-decision-universe.json`, `initialSelection` |
| That route's own status text states no instrument is named | `technical-analysis-decision-lab.html` line 3057 |
| `volatility-sizing-lab` selects from 11 universe assets, 3 of which are single companies | `volatility-sizing-universe.json`, `assets` |
| `options-flow-feed-lab` scans a hardcoded 12-symbol universe | `options-flow-feed-lab.html` line 410 |
| `company-fundamentals-lab` is fed by one accepted publication | `company-fundamentals-lab.html` line 650 |
| Three committed fundamentals publications exist | `data/company-fundamentals/companies/` |
| The committed bar corpus holds 293 symbols | `data/bars/` |
| `rlticker.js` is loaded by all five receiving routes, both precedent routes and the sending route | The `<script src>` list in each file |
| `rlticker.js` already owns `normTicker` | `rlticker.js` line 38 |
| 28 tools are registered, all five receiving routes among them with `status: "live"` | `tools.json` |
| `VAL-025-F4` is recorded as a routed product defect | `specs/025-company-multi-horizon-intelligence-lab/report.md` line 4638 |
| The upstream acceptance item and the readiness row it blocks | `specs/025-.../uservalidation.md` lines 60, 138 and 167 |
| The upstream feature's boundary excludes the owner routes | `specs/025-.../state.json`, `workBoundary.specTargets` |
| The upstream `javascript:` acceptance and its fix | `specs/025-.../report.md` lines 2068 to 2101 |
| The registered-route assertion splits path from query | `tests/company-intelligence-lab.spec.mjs` line 148 |
| The unit tests filter rows by `ownerSubjectParam` rather than asserting a count | `tests/company-intelligence.unit.mjs` lines 1617 to 1702 |
| Feature statuses 006 `done`, 007 `blocked`, 010 `done`, 011 `done`, 025 `in_progress` | Each feature's `state.json` |
| Feature 007's blocked reason is Gate G136 with 17 unchecked items | `specs/007-technical-analysis-decision-lab/state.json` |
| `options-flow-feed-lab.html` was added on 2026-07-08 in a standalone commit | `git log --diff-filter=A -- options-flow-feed-lab.html` |
| `technical-analysis-decision-lab.html` and `trend-dynamics-cycle-lab.html` were added on 2026-07-16 in a non-feature commit | Same command per file |
| `company-fundamentals-lab.html` was added by a Feature 010 commit | Same command |
| `volatility-sizing-lab.html` was added by a Feature 011 commit | Same command |
| `notes/technical-analysis-decision-lab.md` names Feature 007 as its spec | That file, line 3 |
| `notes/options-flow-feed-lab.md` names no spec | That file |
| Feature 026 references three of the five receiving routes | `specs/026-actionable-brief-brevity-and-cross-asset/spec.md` |
| Product principles P1 to P25 and the admission test | `docs/Product-Principles.md` |
| Competitive rows reused rather than refetched | `specs/025-.../spec.md`, Competitive Analysis |
| House analyst spec shape | `specs/025-.../spec.md` |

**Educational research only. Not investment advice.**
