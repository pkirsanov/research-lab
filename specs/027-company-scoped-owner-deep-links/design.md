# Feature 027 — Design: Company-Scoped Owner Deep Links

**Owner of this document.** `bubbles.design`.
**Depth.** Contract-grade. `spec.md` carries actors, use cases, eighteen Gherkin
scenarios and a UI scenario matrix, so this design states exact contracts rather
than intentions.
**Upstream.** `spec.md` (this folder), authored by `bubbles.analyst`.
**Artifacts modified outside this folder by this design run.** None.

---

## Design Brief

**Current state.** Fifteen coverage-registry rows name an owner tool for a
dimension's math. Two rows declare `ownerSubjectParam: "ticker"` and work end to
end. `rlcompanyintel.js::ownerRouteFor` (lines 468 to 483) already composes
`<validated route>.html?<validated param>=<percent-encoded value>` from
separately validated parts, so the sending side is complete. The receiving side
is not: no other owner route reads a company. A reader who follows a dimension
to its owner loses the company they were reading.

**Target state.** The two owner routes that genuinely hold a selectable company
subject open on the company named in the link. Every other owner row is an
honest bare link that states, in the row, why it carries no company. The rule
that decides what counts as a company identifier lives in exactly one module,
and the registry can no longer declare a parameter that no route reads.

**Patterns to follow.**

- `options-structure-lab.html` line 2524 and `gamma-trading-lab.html` line 1810:
  read `?ticker=`, trim, uppercase, test `/^[A-Z0-9.\-]{1,12}$/`, return `null`
  on failure, and let the link outrank restored session state. This is the
  convention. It is generalised, never re-invented.
- `rlticker.js` (`root.RLTKR`, line 122): the UMD module already loaded by all
  five candidate receiving routes, both precedent routes and the sending route.
  It already owns `normTicker` (line 38), explicitly commented "pure helpers
  (extractable by selftest)". The new rule is one more pure function there.
- `company-intelligence-lab.html::el()` (line 765): every text node is written
  with `textContent`. Refusal notices use the same shape.
- `scripts/selftest.mjs::build()` (line 67): pure functions are lifted out of a
  UMD file and exercised in a sandbox. The new function is proved this way, with
  no browser.
- `volatility-sizing-lab.html::populateAssets()` / `onAssetChange()` (lines 1103
  to 1116): the asset subject is already one closed universe plus one `<select>`
  plus one recompute. A link seeds the same control the reader would have used.

**Patterns to avoid.**

- **Do not copy `tickerFromQuery` a third time.** Two private copies exist. Five
  would be seven. P18 and P19 forbid it, and NFR-027-003 makes it a test.
- **Do not swap `company-fundamentals-lab.html`'s hardcoded primary publication
  from a query parameter.** The page's `<h1>` subtitle, its comparability
  headings, its peer set and its published owner read all name Microsoft in
  static markup. Repointing the data without repointing thirty identity strings
  renders one company's numbers under another company's name — the exact failure
  this feature exists to prevent.
- **Do not filter the options-flow scan down to one ticker.** BS-027-003
  requires the rest of the scan to survive. A filter answers "opens on that
  company" by deleting the tool.
- **Do not widen `SAFE_OWNER_ROUTE` or the composed-href pattern.** Feature 025
  fixed a real `javascript:` acceptance on this surface under a CSP that keeps
  `script-src 'unsafe-inline'`. Safety there comes from composing the href out
  of separately validated parts, not from one clever pattern.
- **Do not narrow the precedent receiver grammar to match the sender.**
  FR-027-003 forbids changing what the two working routes accept.

**Resolved decisions.**

- Four registry rows join the two market-scoped classes as honest bare links:
  `technicals`, `cycles`, `fundamentals`, `valuation`. Two rows become
  subject-carrying: `volatility` and `options-flow`. Evidence in **Decision D1**.
- This feature declares `ownerSubjectParam`, in the same change that lands the
  reader, and the registry schema makes a reader-less declaration impossible
  rather than merely discouraged. **Decision D2**.
- "The same company" on the options-flow scanner is a focus band above an
  unchanged scan, never a filter. **Decision D3**.
- The sender and receiver grammars stay different on purpose. The invariant that
  matters — sender-valid implies receiver-valid — becomes a property test.
  **Decision D4**.
- A subject that passes the grammar is still not active until it resolves to an
  entry in the receiving route's own committed catalog. **Decision D5**.
- The bare-reason display requires a small, additive change to two
  Feature 025-owned production files. No Feature 025 spec artifact is touched.
  **Decision D6**.

**Open questions.** One, for the operator, in **Open Questions** below: whether
`options-flow-feed-lab.html` should be adopted by an owning feature before or
after this change. The design proceeds either way; only the sign-off path
differs.

---

## Decision Record

### D1 — Open Question 1: which routes can receive a company

**Question.** Do `technicals` and `cycles` stay bare?

**Answer.** Yes, and the same evidence disqualifies `fundamentals` and
`valuation` as well. The feature covers **two** routes, not three and not five.

The test applied to each candidate is not "does it read a query parameter". It
is **does this route hold a company as a variable the reader can already
change**. A route that does not is not a parameter away from company-aware; it
is a capability change to a certified feature.

| Route | Company as a variable? | Evidence read this session | Verdict |
| --- | --- | --- | --- |
| `volatility-sizing-lab.html` | **Yes** | `<select id="assetSelect">` (line 495) populated from `runtime.config.assets`; `onAssetChange()` re-reads controls and re-hydrates (lines 1113 to 1117); every renderer is driven from `runtime.controls.asset`; no company name appears in static markup | **In scope** |
| `options-flow-feed-lab.html` | **Yes** | `UNIVERSE` holds twelve real symbols (line 411); `renderByTicker()` already aggregates call and put premium per ticker (line 580); every row carries `r.ticker` | **In scope** |
| `trend-dynamics-cycle-lab.html` | **No** | `trend-dynamics-cycle-universe.json` `series` array has length 1: `spy-daily`, "SPDR S&P 500 ETF adjusted close" | **Bare** |
| `technical-analysis-decision-lab.html` | **No** | `technical-analysis-decision-universe.json` `initialSelection` names seven policy identifiers — source, timeframe, sensitivity, setup focus, comparison, validation, cost — and zero instruments | **Bare** |
| `company-fundamentals-lab.html` | **No** | Zero selector controls in the file; the primary publication is a literal at the boot call, `path: "data/company-fundamentals/companies/sec-cik-0000789019/current.json"` (line 2790); the `<h1>` subtitle is static prose naming "**Microsoft (MSFT)** as the primary issuer" (line 610); the comparability heading is static `<h3>Microsoft (06-30) vs Chipotle (12-31) — stockholders equity</h3>` (line 1334); the basis labels are static `<strong>Microsoft</strong>` and `<strong>Chipotle</strong>` (lines 1338, 1342); the peer set is keyed on `subjectCompanyId === "sec-cik-0000789019"` with the hardcoded fallback purpose "Software-platform peer context for Microsoft." (lines 2497 to 2504); the published owner read is `read: "Microsoft fundamentals: …"` (line 2581) | **Bare** |

**Why the steer holds, and why it extends.** The operator's reasoning was that a
link which silently ignores the company is worse than an honest bare link, and
that turning a certified feature into a company-aware tool is a separate product
decision. That reasoning is not specific to `technicals` and `cycles`. It applies
with more force to `company-fundamentals-lab.html`, where the analyst's
classification of "Gap. Company-scoped." is contradicted by the source.

The fundamentals route is not a company tool with a missing parameter. It is a
worked example built around one issuer, with two other issuers appearing as
named archetype overlays rendered by dedicated `renderCmg` and `renderJpm`
functions. Repointing the primary publication would leave a page that says
"Microsoft (MSFT) as the primary issuer", "Microsoft's annual, quarterly,
year-to-date, and instant filings are classified…" and "Microsoft (06-30) vs
Chipotle (12-31)" while displaying another issuer's figures. That is the
`spec.md` failure condition "another company's numbers under this company's
name", reached from the other direction. The honest alternative — resolve only
`MSFT` and render every other company as unavailable — would produce a link that
fails for 292 of the 293 symbols in the committed bar corpus, while the reader's
current bare link opens a working page. Bare is strictly better.

Making the fundamentals route company-aware means de-hardcoding roughly thirty
identity strings across static markup, the peer set, the comparability blocks
and the published owner read, inside Feature 010, which is `done`. That is
IP-027-003 work, not deep-link work.

**Consequences.**

- The in-scope receiving routes are `volatility-sizing-lab.html` and
  `options-flow-feed-lab.html`.
- `fundamentals`, `valuation`, `technicals` and `cycles` become bare rows with a
  stated reason, alongside the three market-scoped rows.
- FR-027-028 and BS-027-015 now cover three routes rather than two. No
  requirement is dropped; FR-027-014's "already accepted governing feature" set
  reduces to Feature 011, and Feature 010 is no longer touched at all.
- IP-027-003 grows to cover three routes. Recorded here, delivered elsewhere.

### D2 — Open Question 2: who declares `ownerSubjectParam`

**Answer.** This feature declares it, in the same change that lands the reader,
and the registry schema is tightened so the failure mode cannot recur.

The analyst's reasoning is adopted: a declaration without a reader composes a
link that looks company-aware and is not, which is worse than a bare link
because it is silent. Deferring the declaration to Feature 025 would also leave
`VAL-025-F4` open for an extra cycle for no benefit.

The design goes one step further, because FR-027-027 and FR-027-030 are
currently promises. `readCoverageRegistry` gains two rules that turn them into
schema errors:

1. A row with an `ownerDeepLink` MUST declare exactly one of `ownerSubjectParam`
   or `ownerBareReason`. Declaring both, or neither, raises
   `C025-CONFIG-SCHEMA`.
2. `ownerBareReason` is a closed enum. An unknown value raises
   `C025-CONFIG-SCHEMA`.

Rule 1 is what makes "declaration follows capability" mechanical: a future author
who declares a parameter for a route that cannot read one still passes, but a
future author who forgets to say anything about a bare row now fails loudly, and
the only way to stay silent is removed. Combined with the per-route reader tests
in Scope 2, a declared row without a working reader cannot ship green.

**The anti-pattern is live in the committed baseline right now.** This was found
while verifying the precedent, and it sharpens why the schema rule is worth the
line:

| Fact | Read this session |
| --- | --- |
| `company-intelligence.config.json` in `HEAD` declares `ownerSubjectParam` on two rows | `git show HEAD:company-intelligence.config.json`, two matches |
| Neither `options-structure-lab.html` nor `gamma-trading-lab.html` contains `tickerFromQuery` in `HEAD` | `git show HEAD:<file>`, zero matches each |
| Both readers exist only as uncommitted working-tree changes | `git diff` on both files shows the function and the `linked` assignment being added, ten lines each |

So `spec.md`'s "two rows already carry the company and work end to end" is true of
the **working tree**, not of the committed baseline. In `HEAD` the two rows are
declarations without readers: they compose `?ticker=<company>` that the target
silently ignores. That is precisely the condition FR-027-030 calls a defect.

This changes no decision in this design, and it is not this feature's defect to
fix — the readers are already written and merely unlanded. It does change one
assumption the plan owner must not inherit blindly: **Scope 1 cannot be planned
against `HEAD`.** Either the concurrent work lands first and Scope 1 refactors two
existing readers, or it does not and Scope 1 writes them. See Open Question 2.

### D3 — Open Question 3: what "the same company" means for a scanner

**Answer.** A **focus band**, rendered above the existing scan, presenting the
named company's own read. The feed, the sortable table and the by-ticker premium
bars are untouched.

The three candidates were filter, pre-sort and highlight.

| Option | What the reader gains | What the reader loses | Verdict |
| --- | --- | --- | --- |
| Filter the table to the company | An unambiguous single-company view | The whole scan, which is the tool's reason to exist. Violates BS-027-003 | Rejected |
| Pre-sort so the company is first | The company is visible near the top | The reader's own sort preference, which is persisted in `state.sortK` / `state.sortDir` and is a control they set deliberately. Silently overriding a saved control on arrival is a behaviour change with no notice | Rejected |
| Focus band above an unchanged scan | The company's own read, stated first and named in words | Nothing. Every existing control, sort and row survives | **Adopted** |

The band needs no new computation. `renderByTicker` already groups flagged rows
per ticker and sums call and put premium. The band renders that same aggregate
for one ticker, plus its flagged-strike count, plus an explicit statement of what
the scanner is: an end-of-day proxy over twelve liquid names.

This also satisfies FR-027-008 literally — "that company's own read is the one
shown first, without removing the reader's access to the rest" — and it satisfies
FR-027-009, because the band names the active subject in words rather than
leaving it to be inferred from a table cell.

### D4 — Open Question 4: sender and receiver grammar

**Answer.** Do not unify the two expressions. Unify the invariant instead, and
make it a test that can fail.

| Side | Expression | Accepts | Max length |
| --- | --- | --- | --- |
| Sender, `rlcompanyintel.js` line 213 | `/^[A-Za-z][A-Za-z0-9.\-]{0,9}$/` on the raw entry | Leading letter required | 10 |
| Receiver, precedent routes | `/^[A-Z0-9.\-]{1,12}$/` after trim and uppercase | Leading digit allowed | 12 |

Sender-valid is a strict subset of receiver-valid, so no composed link is ever
refused for grammar. Narrowing the receiver to match the sender would change what
`options-structure-lab.html` and `gamma-trading-lab.html` accept today, which
FR-027-003 forbids outright. Widening the sender would loosen a validator that
sits directly in front of an href under a CSP that keeps `script-src
'unsafe-inline'`, which is the wrong direction on a surface that already had one
`javascript:` acceptance.

The receiver stays a documented superset. The risk that matters — the two
drifting until a composable link stops being acceptable — is closed by a
containment property test in Scope 1:

> For every value in the corpus, if the sender expression accepts it then the
> shared receiver rule accepts its normalised form.

The corpus covers every sender-composable shape, both length boundaries, the
leading-digit case, and the adversarial set. The adversarial half of P23 is
satisfied by asserting that a deliberately narrowed receiver rule breaks the
property, so the guard is proved able to fail.

### D5 — The catalog-bound subject rule

Grammar acceptance is **necessary but not sufficient** on the two in-scope
routes. A subject becomes active only after it matches an entry in that route's
own committed catalog. Anything else is `unresolvable`, not active.

This is the design rule that makes FR-027-021, FR-027-022 and FR-027-005 fall out
for free rather than needing per-sink policing:

- `volatility-sizing-lab.html` matches against `runtime.config.assets[].symbol`,
  eleven entries, already schema-validated by `RLVOL.validateUniverse`.
- `options-flow-feed-lab.html` matches against `UNIVERSE`, twelve literals.

The consequence is that the accepted string never becomes a fetch path, a
`localStorage` key, a selector, or any other constructed identifier. Only a
catalog entry the route already trusted before this feature does. `options-flow`
in particular builds `CACHE_PREFIX + sym` for its chain cache; because only a
catalog member ever reaches that path, a grammar-valid oddity such as `..` or
`.-.` can never touch it.

The two precedent routes are deliberately **not** catalog-bound, and are not
changed to be. They are free-ticker tools: the reader can type any symbol into
their own input. Constraining them would change their behaviour, which
FR-027-003 and FR-027-011 forbid. The rule therefore reads: *catalog-bound routes
resolve against their catalog; free-ticker routes seed their existing free-ticker
control.* Both are the same handoff; they differ only in what resolution means,
which is exactly the variation axis recorded below.

### D6 — The one Feature 025 production surface this feature touches

FR-027-025 and FR-027-029 require every bare row to state its reason where the
reader is. That cannot be met without touching two Feature 025 production files,
because today the reason is rendered only for rows with **no owner at all**:

- `company-intelligence-lab.html` line 1154 appends `owner.statement` only inside
  the `else` of `if (owner.hasOwner)`. Line 820 does the same on the dimension
  card.
- `rlcompanyintel.js::describeDimensionOwner` already builds an honest sentence
  for a bare-but-owned row — "…which reads no company parameter and opens on its
  own subject" — but no surface renders it.

So the change is small and additive: keep building the statement, make it
specific to the declared bare reason, and render it beside the link instead of
only instead of the link.

**No Feature 025 spec, design, scopes, report or uservalidation artifact is
modified.** The touched files are production source shared by the sending route.
This is recorded explicitly because the boundary is easy to misread.

---

## Purpose and Scope

**In scope.**

| Surface | Change |
| --- | --- |
| `rlticker.js` | One new pure function on `RLTKR`. No behaviour change to any existing export |
| `options-structure-lab.html` | Replace the private `tickerFromQuery` with the shared rule; add a refusal notice |
| `gamma-trading-lab.html` | Same |
| `volatility-sizing-lab.html` | Read the subject, resolve against the asset catalog, preselect, notice |
| `options-flow-feed-lab.html` | Read the subject, resolve against `UNIVERSE`, focus band, notice |
| `company-intelligence.config.json` | Declare `ownerSubjectParam` on two rows; declare `ownerBareReason` on seven |
| `rlcompanyintel.js` | Registry schema rules for `ownerBareReason`; reason-specific statement |
| `company-intelligence-lab.html` | Render the statement beside a bare owner link |
| `scripts/selftest.mjs`, `tests/` | New and extended proofs |

**Out of scope.** Every route named bare in D1. Any new route, registry entry,
navigation entry, data source, metric, build step or ES module. Any Feature 025
spec artifact. Any `specs/021` to `specs/024` or `specs/026` path.

---

## Capability Foundation

The proportionality triggers apply: one shared contract crossing four routes
owned by different features, with two implementations already in production and
two more added here.

### The capability

**Subject handoff.** A tool that names another tool as the owner of a piece of
math can also name the subject it was reading, and the owner tool either presents
that subject, or states plainly why it is not.

### Foundation contract

One pure function, added to the existing `RLTKR` UMD export in `rlticker.js`.
No new module (P18, P19).

```
RLTKR.linkedSubject(search, paramName) -> { status, subject, raw }

  search      string | URLSearchParams | null   the route's own location.search
  paramName   string | undefined                overrides SUBJECT_PARAM; the hub
                                                passes its own parameter name

  status   "absent"   the parameter was not present, or was empty or whitespace
           "accepted" the value is an acceptable company identifier
           "refused"  the value is present, non-empty, and not acceptable

  subject  string  the normalised identifier when status is "accepted"
           null    otherwise

  raw      null    always. The refused value is never returned, so it cannot
                   reach a sink through this contract even by mistake
```

Rules, in order:

1. Read the parameter named by the single shared constant
   `RLTKR.SUBJECT_PARAM = "ticker"`. One convention, defined once (FR-027-001).
2. A non-string, a missing parameter, an empty string, or a whitespace-only
   string yields `absent`. This makes FR-027-012's three cases identical by
   construction rather than by three separate code paths.
3. Otherwise normalise with the existing `normTicker` (trim, uppercase) — reuse,
   not reimplementation.
4. Accept if and only if the normalised value matches
   `RLTKR.SUBJECT_PATTERN = /^[A-Z0-9.\-]{1,12}$/`, byte-identical to what the
   two precedent routes accept today (FR-027-003).
5. Never return, log, store or expose the refused value (FR-027-018).

The function is pure, takes its input as an argument rather than reading
`window.location`, and lives among the helpers already commented "extractable by
selftest". That is what lets `scripts/selftest.mjs::build()` prove it without a
browser (NFR-027-005).

---

## Concrete Implementations

Each route composes the foundation with its own resolution and its own
presentation. The foundation owns acceptance; the route owns meaning. Five
production routes consume `RLTKR.linkedSubject` — the four receiving routes and
the hub, which routes its own read through the same rule; none of them defines
an acceptance rule of its own.

| Route | Resolution | Presentation of an accepted subject | Presentation of unresolvable |
| --- | --- | --- | --- |
| `volatility-sizing-lab.html` | Catalog-bound: the accepted string is resolved through `catalogAsset()` against the closed asset universe declared in `runtime.config.assets[].symbol` | Preselect the asset in `#assetSelect`, adopt its `defaultTargetVol`, then the existing recompute path runs unchanged | Named notice; the default asset stays selected and stays fully computed |
| `options-flow-feed-lab.html` | Catalog-bound against `UNIVERSE` | Focus band above the scan carrying that ticker's flagged-strike count and call-versus-put premium split. The scan itself is unchanged: the band never filters it and never pre-sorts it | Named notice in the band position; the scan renders exactly as today |
| `options-structure-lab.html` | Free-ticker; no catalog. Grammar acceptance is the whole rule | Seed `state.ticker` before the existing UI reflection, as today. An explicit deep link outranks the restored session | Not applicable; any accepted value is usable |
| `gamma-trading-lab.html` | Free-ticker; no catalog. Grammar acceptance is the whole rule | Seed `state.ticker` before the existing UI reflection, as today. An explicit deep link outranks the restored session | Not applicable |

Two of these are the precedent routes whose behaviour the foundation was
extracted from (`options-structure-lab`, `gamma-trading-lab`), and two are new
consumers (`volatility-sizing-lab`, `options-flow-feed-lab`). The precedents
keep their observable behaviour; what changes for them is only that the
acceptance rule they used to carry privately now lives in one place.

**Deliberate non-implementations.** Three owner routes cannot hold a company at
all, so they link bare and declare `ownerBareReason` instead of
`ownerSubjectParam`. These are part of the capability, not gaps in it — the
foundation has to make "this owner has no subject" a first-class, stated
outcome:

- `technical-analysis-decision-lab` — `fixed-subject`. The route names no
  instrument a caller may choose; there is nothing for a passed subject to bind
  to.
- `trend-dynamics-cycle-lab` — `fixed-subject`. The route carries a single SPY
  series; a passed subject could only contradict what is on screen.
- `company-fundamentals-lab` — `fixed-subject`. The route is hardcoded to
  Microsoft across roughly thirty identity strings; accepting a subject would
  require rebuilding the route, not adopting the contract.

### Variation Axes

- **Subject cardinality** — a single-subject route (`options-structure-lab`,
  `gamma-trading-lab`) versus a closed-catalog selector
  (`volatility-sizing-lab`) versus a multi-symbol scanner
  (`options-flow-feed-lab`). This decides whether "the subject" is the whole
  view, one selection within a fixed set, or one emphasis within many rows.
- **Binding strictness** — grammar acceptance alone versus grammar plus catalog
  membership. On the two catalog-bound routes, grammar acceptance is necessary
  but not sufficient, which is what keeps an accepted string from ever reaching
  a storage key, a path, or a fetch target.
- **Precedence against persisted reader state** — an explicit deep link
  outranks a restored session (`options-flow` via `optFlowState`, both
  precedents via their own saved state), and a deep-linked subject must not
  become the reader's persisted default. `volatility-sizing-lab` restores no
  saved asset at all, so BS-027-002 is vacuously satisfied there and must not
  be faked with a new store.
- **Miss behaviour** — a valid-but-absent subject is named unavailable while
  the route stays fully computed, rather than rendering a half-populated view.
  This is why the unresolvable column above is a notice next to working output,
  never a blank panel.
- **Declaration side** — a registry row declares exactly one of
  `ownerSubjectParam` or `ownerBareReason` (`market-scoped` | `fixed-subject`).
  Neither or both raises `C025-CONFIG-SCHEMA`, so a subject-carrying route and
  a deliberately bare route are distinguishable by schema rather than by
  convention.

---

## Handoff Lifecycle

```
composed ──► received ──► absent      ──► today's default, no notice, no DOM change
                     ├──► refused     ──► today's default + refusal notice
                     ├──► unresolvable──► today's default + named-unavailable notice
                     └──► accepted    ──► subject active + subject named in words
```

The state is computed **once**, before any control is written, and applied
atomically. No route writes a partial subject and then reconsiders. That is how
FR-027-023 and BS-027-013 are met structurally rather than by cleanup.

---

## Data Model

### Registry row schema delta

`company-intelligence.config.json`, `coverageRegistry[]`. One optional field is
added. No existing field changes meaning, and no row is rewritten (P21).

| Field | Type | Rule |
| --- | --- | --- |
| `ownerSubjectParam` | `"ticker"` or absent | Unchanged. Already validated by `SAFE_SUBJECT_PARAM` |
| `ownerBareReason` | `"market-scoped"` or `"fixed-subject"` or absent | **New.** Permitted only when `ownerDeepLink` is present |

`readCoverageRegistry` gains three checks, all raising `C025-CONFIG-SCHEMA` with
the row's dimension id:

1. `ownerBareReason` present with `ownerDeepLink === null` — a reason for a link
   that does not exist.
2. `ownerBareReason` present with a value outside the enum.
3. `ownerDeepLink !== null` and **not exactly one** of `ownerSubjectParam` /
   `ownerBareReason` present — the rule that makes silence impossible.

The reason is a closed enum rather than free text on purpose. Free text in the
registry would be operator-authored content flowing to a rendering surface; even
though the sink is `textContent`, an enum removes the question entirely and keeps
the wording under code review rather than under config edit.

### Resulting registry state — all fifteen rows

| Dimension | Owner route | Declaration | Class |
| --- | --- | --- | --- |
| `options-structure` | `options-structure-lab.html` | `ownerSubjectParam: "ticker"` | Subject-carrying, already working |
| `dealer-gamma` | `gamma-trading-lab.html` | `ownerSubjectParam: "ticker"` | Subject-carrying, already working |
| `volatility` | `volatility-sizing-lab.html` | `ownerSubjectParam: "ticker"` | **Subject-carrying, new** |
| `options-flow` | `options-flow-feed-lab.html` | `ownerSubjectParam: "ticker"` | **Subject-carrying, new** |
| `performance` | `market-brief.html` | `ownerBareReason: "market-scoped"` | Bare, market question |
| `sentiment` | `market-brief.html` | `ownerBareReason: "market-scoped"` | Bare, market question |
| `geopolitics` | `research-agenda-lab.html` | `ownerBareReason: "market-scoped"` | Bare, market question |
| `fundamentals` | `company-fundamentals-lab.html` | `ownerBareReason: "fixed-subject"` | **Bare, D1** |
| `valuation` | `company-fundamentals-lab.html` | `ownerBareReason: "fixed-subject"` | **Bare, D1** |
| `technicals` | `technical-analysis-decision-lab.html` | `ownerBareReason: "fixed-subject"` | **Bare, D1** |
| `cycles` | `trend-dynamics-cycle-lab.html` | `ownerBareReason: "fixed-subject"` | **Bare, D1** |
| `financial-events` | none | neither | Ownerless, unchanged |
| `non-financial-events` | none | neither | Ownerless, unchanged |
| `market-regime` | none | neither | Ownerless, unchanged |
| `company-risk` | none | neither | Ownerless, unchanged |

Four subject-carrying, seven bare-with-reason, four ownerless. Fifteen.

### Statement contract

`describeDimensionOwner` keeps its `company-dimension-owner/v1` contract version
and its field set. Only the `statement` text becomes reason-specific, and it is
now rendered for bare-but-owned rows as well as ownerless ones.

| Condition | Statement |
| --- | --- |
| `carriesSubject === true` | `<label> is owned by <tool>, which opens on this company.` (unchanged) |
| `ownerBareReason === "market-scoped"` | `<label> is owned by <tool>, which answers a market-wide question rather than a company one, so the link carries no company.` |
| `ownerBareReason === "fixed-subject"` | `<label> is owned by <tool>, which does not model an individual company you can choose, so the link opens on that tool's own subject.` |
| No owner | Unchanged |

The `fixed-subject` wording is the operator's steer stated on the row, and it is
accurate for all three routes it covers: one names no instrument, one holds a
single series, and one is a single-issuer worked example.

---

## Route Designs

### `volatility-sizing-lab.html`

The only insertion point is inside `boot()`, between `populateAssets()` and
`readControls()`. `populateAssets()` currently forces
`runtime.config.assets[0].symbol`; the handoff overrides that one assignment and
nothing else.

```
populateAssets()                       // unchanged; default remains assets[0]
handoff = RLTKR.linkedSubject(location.search)
if handoff.status === "accepted":
    asset = assets.find(a => a.symbol === handoff.subject)     // catalog-bound
    if asset:  select it; adopt asset.defaultTargetVol; notice = none
    else:      notice = unavailable(handoff.subject)
else if handoff.status === "refused":
    notice = refused
readControls(); setMode("simple"); recompute(); hydrate(false)   // all unchanged
```

Everything downstream — `readControls`, `recompute`, `hydrate`, `renderSimple`,
`renderPower`, the owner read publication — runs exactly as it does when the
reader picks the asset from the `<select>` by hand. No renderer learns about deep
links. The subject is already named in words by the existing `<select>` option
text, `"<symbol> — <name>"`, which satisfies FR-027-009 without new markup.

`unavailable` is correct rather than blank because the default asset is fully
computed and displayed; the notice states that the requested company is not in
this tool's eleven-asset universe and names which asset is shown. The tool never
renders another asset's numbers under the requested company's name, because the
requested company is never adopted as a label.

**Notice element.** One `<p id="linkNotice" role="status" hidden>` in the
control rail. With no parameter it stays `hidden` with empty text, so the
rendered output and the accessibility tree are byte-equivalent to today.

### `options-flow-feed-lab.html`

The insertion point is inside `boot()`, after `loadState()` and before the
cache-first `rebuild(); render()`. The resolved focus is stored on `state` but
**not** persisted: `saveState()` continues to write only `mode`, `side`, `min`
and `dte`, so a deep link never contaminates the reader's next unlinked visit.
That preserves BS-027-002's intent in the right direction — the link outranks the
restored state for this visit, and does not become the restored state.

`render()` gains one call, `renderFocus()`, before the existing feed render.

| Focus state | Band content |
| --- | --- |
| Absent | Band `hidden`; the page is byte-equivalent to today |
| Accepted and in `UNIVERSE` | The ticker named in words, its flagged-strike count, its call-versus-put premium split from the same aggregate `renderByTicker` builds, and the standing caveat that this is an end-of-day proxy over twelve liquid names |
| Accepted and not in `UNIVERSE` | The ticker named in words plus "this scanner covers twelve liquid names and does not include it"; the scan renders unchanged below |
| Accepted, in `UNIVERSE`, no flagged strikes | The ticker named in words plus "no strike crossed the activity bar for it in this scan"; distinct from not-covered, because they are different facts |
| Refused | "The link named a subject this tool could not accept"; the scan renders unchanged below |

The feed, `renderTable`, `renderByTicker`, all four segmented controls, the sort
state and the hydration progress line are untouched. The reader loses nothing
(BS-027-003).

The fourth row matters: a covered company with no unusual activity is a real,
informative answer, and collapsing it into "not covered" would be the kind of
silent inaccuracy this product exists to avoid.

### `options-structure-lab.html` and `gamma-trading-lab.html`

Two changes each, both minimal.

1. Delete the private `tickerFromQuery` and call `RLTKR.linkedSubject`. The
   `linked` assignment that already lets a deep link outrank restored session
   state stays exactly where it is, at line 2540 and line 1817 respectively.
2. Add the same `#linkNotice` element and populate it when `status === "refused"`.

The accept-set is unchanged by construction, because the shared rule is the same
expression over the same normalisation. This is proved by equivalence test rather
than asserted — see **Testing**.

The refusal notice is a behaviour change, and it is a deliberate one. Today
`options-structure-lab.html?ticker=javascript:alert(1)` silently shows the
default subject with no explanation. That is the silent failure mode P2 and P15
forbid. The change fires only when a parameter is present and unacceptable; the
no-parameter path, which is what FR-027-011 protects, is untouched.

### Sending side

`rlcompanyintel.js::ownerRouteFor` is **not modified**. It already composes
`<validated route>.html?<validated param>=<encoded value>` from separately
validated parts and refuses to widen `SAFE_OWNER_ROUTE`. Declaring
`ownerSubjectParam` on two more rows is sufficient to make it emit the company.

`company-intelligence-lab.html` changes in one way only: for a row with an owner
whose link carries no company, append `owner.statement` beside the link, using
the same `el()` helper and therefore the same `textContent` sink. Both the
coverage table (line 1150) and the dimension card (line 821) get the same
treatment, so the two surfaces stay consistent.

---

## Security

The threat model is unchanged from Feature 025: these pages run under a CSP that
keeps `script-src 'self' 'unsafe-inline'` for the single-file design, so a
`javascript:` or `data:` value reaching an href would execute rather than be
blocked. Feature 025 already fixed one such acceptance on this surface.

| Control | Where | Why it holds |
| --- | --- | --- |
| Value-only read | `RLTKR.linkedSubject` returns a string or `null`, never a URL, never a fragment | FR-027-005. No route derives a scheme, authority, path or destination from the subject |
| Strict accept | `/^[A-Z0-9.\-]{1,12}$/` after normalisation | No `:` so no scheme; no `/` so no authority or path segment; no `<`, `>`, `"`, `&` so no markup; length capped at 12 |
| Refused value is unreachable | The contract returns `raw: null` always | FR-027-018. There is no accessor through which a refused value could reach text, an attribute, an href or storage |
| Catalog binding | D5, on both new routes | Even an accepted value never becomes a fetch path, a `localStorage` key or a constructed identifier. Only a catalog entry the route already trusted does |
| Safe sinks | Notices are written with `textContent`; the coverage statement uses the existing `el()` helper | Consistent with `scripts/selftest.mjs` Step 1, which already fails any `innerHTML` concatenation of a model or config-authored field without `esc()` |
| Sender unchanged | `SAFE_OWNER_ROUTE` and the composed-href pattern are not widened | The hole is not reopened from either end |
| Receiver is never wider than intended | D4 containment property test | The receiver superset is deliberate and bounded, not accidental drift |

Adversarial corpus, exercised in Scope 1 and reused per route: `javascript:alert(1)`,
`data:text/html,x`, `//evil.example`, `../../etc/passwd`, `<img src=x onerror=1>`,
`SPY onmouseover=1`, `SPY&x=1`, `SPY#frag`, `SPY%00`, a 13-character value, an
empty string, a whitespace-only string, a lone `.`, a lone `-`, `..`, a
non-Latin-script string, and a value containing a newline or tab.

---

## Backward Compatibility and the Regression Proof

This is the headline risk, so the proof is stated per route rather than as a
blanket claim.

**The structural argument.** In every changed route the handoff is a single
expression evaluated from `location.search`. When the parameter is absent, that
expression yields `absent`, every subsequent branch is skipped, and the notice
element stays `hidden` with empty text. No default is recomputed, no control is
re-read, no ordering changes. There is no code path where absence differs from
today.

**The evidence, per route.**

| Route | Governing feature | Inherited proof | Added proof |
| --- | --- | --- | --- |
| `volatility-sizing-lab.html` | 011 `done` | `tests/volatility-sizing-lab.spec.mjs`, nineteen tests including fourteen `Regression BS-*` cases, the cache-first partial-paint test, the "controls recompute with no market-data request" test and the owner-read publication test — all run with no query string | Re-run in full and recorded as this feature's evidence (FR-027-014); a new no-parameter DOM-and-decision-identity assertion |
| `options-flow-feed-lab.html` | **none** (Honest Finding 5) | Nothing to inherit | A baseline captured **before** the change and re-demonstrated after (FR-027-015): first-paint verdict text, feed row count and order, table row order under the default sort, by-ticker order, status line, and the persisted-state round trip |
| `options-structure-lab.html` | not re-litigated here | No browser suite exists | Pure-function equivalence: the deleted private rule and the shared rule agree on the full corpus, so the accept-set is provably identical (FR-027-003); plus a no-parameter first-paint assertion. Conditional on Open Question 2 — with no landed private rule there is nothing to compare against, and the corpus test stands alone |
| `gamma-trading-lab.html` | not re-litigated here | No browser suite exists | Same equivalence proof and no-parameter assertion, under the same condition |
| `company-intelligence-lab.html` | 025 `in_progress` | `tests/company-intelligence-lab.spec.mjs` line 148 already splits path from query and asserts the query names the company being read; `tests/company-intelligence.unit.mjs` lines 1617 to 1702 filter by `ownerSubjectParam !== null` rather than a fixed count | Extended for the new declarations and the bare-reason statement. Honest Finding 6 is confirmed: neither test blocks the declaration |

The equivalence proof deserves emphasis. It is stronger than a browser
regression test for this particular risk, because it compares the old and new
acceptance functions directly over a corpus rather than sampling their effects
through the UI. Neither precedent route has a browser suite to inherit, so this
is also the only rigorous option available.

**Uncovered routes.** The three routes disqualified in D1 are not modified at
all, so Features 006, 007 and 010 acquire no regression risk from this feature.
Their registry rows gain a declaration, which is read by the sending route only.
This also answers `spec.md` Open Question 6 in the negative: Feature 007's
pending acceptance is not reopened, because its route is not touched.

---

## Failure Modes and Observability

| Failure | Detection | Behaviour |
| --- | --- | --- |
| Parameter absent | `status === "absent"` | Today's behaviour, no notice, no DOM change |
| Parameter empty or whitespace | Same branch as absent, by construction | Identical to absent (FR-027-012) |
| Value fails the grammar | `status === "refused"` | Default subject retained; notice states the link named a subject that could not be accepted and which subject is shown (FR-027-019, FR-027-020) |
| Value is acceptable but outside the route's catalog | Catalog lookup misses | Default subject retained; notice names the requested company and the reason (FR-027-021, FR-027-022) |
| Route's own config or universe fails to load | Existing paths: `showConfigError` on volatility, the empty-state verdict on options-flow | Existing failure behaviour wins; the handoff notice is suppressed rather than stacked, so the reader sees one problem, not two |
| Registry declares a parameter and a reason, or neither | `readCoverageRegistry` | `C025-CONFIG-SCHEMA`, fail-closed at config read (FR-027-030) |
| Registry declares an unknown bare reason | `readCoverageRegistry` | `C025-CONFIG-SCHEMA` |

No new telemetry, no new counter, no new network call. `RLAPP.report` usage on
both routes is unchanged.

---

## Testing and Validation Strategy

Commands are the repository's existing surfaces. No new runner, no new
dependency, no build step.

```
node scripts/selftest.mjs
npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/options-flow-feed-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

`scripts/selftest.mjs` already lifts pure functions out of UMD files with
`build()` and already lists `rlticker.js` among the company-route scripts, so the
shared rule is proved there with no browser and no bundler.

### Scenario to test mapping

| Scenario | Type | Location | Assertion |
| --- | --- | --- | --- |
| BS-027-001 | Browser | `tests/volatility-sizing-lab.spec.mjs`, `tests/options-flow-feed-lab.spec.mjs` | Opening `?ticker=NVDA` selects NVDA and names it |
| BS-027-002 | Browser | `tests/options-flow-feed-lab.spec.mjs` | Saved state present, link names a different subject, link wins for this visit and is not persisted |
| BS-027-003 | Browser | `tests/options-flow-feed-lab.spec.mjs` | Focus band present **and** feed, table and by-ticker row counts equal the unlinked baseline |
| BS-027-004 | Browser | Both route specs | The active subject appears as page text, not only inside a chart or table cell |
| BS-027-005 | Browser | Both route specs, plus the inherited Feature 011 suite | No-parameter first paint equals the pre-change baseline |
| BS-027-006 | Browser | Both route specs | `?ticker=`, `?ticker=%20%20` and no parameter produce identical rendered output |
| BS-027-007 | Selftest | `scripts/selftest.mjs` | The shared rule reads only `SUBJECT_PARAM` and ignores every other key in the query string |
| BS-027-008 | Browser | Inherited Feature 011 suite, re-run | Fourteen `Regression BS-*` cases still pass |
| BS-027-009 | Browser | All four route specs | A refused value leaves the default subject active and the tool usable |
| BS-027-010 | Selftest + Browser | `scripts/selftest.mjs`; all four route specs | `linkedSubject` never returns the refused value; the full adversarial corpus appears nowhere in `document.body.innerHTML`, in any attribute, or in `localStorage` |
| BS-027-011 | Browser | All four route specs | The notice names both facts: not accepted, and what is shown instead |
| BS-027-012 | Browser | Both new route specs | An acceptable out-of-catalog company is named and its absence explained, with no blank and no other subject's values relabelled |
| BS-027-013 | Browser | Both new route specs | After a refusal every control reflects one subject |
| BS-027-014 | Unit | `tests/company-intelligence.unit.mjs` | A `market-scoped` row composes a bare href and its statement says why |
| BS-027-015 | Unit | `tests/company-intelligence.unit.mjs` | A `fixed-subject` row composes a bare href and its statement says why |
| BS-027-016 | Unit | `tests/company-intelligence.unit.mjs` | A row declaring both, or neither, raises `C025-CONFIG-SCHEMA` |
| BS-027-017 | Selftest | `scripts/selftest.mjs` | Exactly one definition of the rule exists in the tree; every subject-carrying route consumes it; every declared row names `ticker` |
| BS-027-018 | Browser | `tests/company-intelligence-lab.spec.mjs` | Every composed subject-carrying link opens its owner on the company being read |

### Adversarial obligations (NFR-027-002, P23)

Each guard is paired with a case proving it can fail.

1. Neutralise `SUBJECT_PATTERN` to `/^.*$/` — the adversarial corpus test must go
   red.
2. Return the refused value in `raw` — the never-reaches-a-sink test must go red.
3. Remove the catalog lookup on either new route — the out-of-catalog
   named-unavailable test must go red.
4. Narrow the receiver rule to the sender expression — the D4 containment
   property test must go red.
5. Remove the exactly-one-of registry rule — the declaration-without-a-reader
   test must go red.
6. Restore either private `tickerFromQuery` — the single-definition test must go
   red.

### Budgets (NFR-027-009, P22)

No assertion-count or size budget is raised as part of this feature. If a shared
suite budget is reached, the budget is raised only behind the failing test that
justified it, and never to make a check pass.

---

## Requirement Coverage

| Requirement group | Where satisfied |
| --- | --- |
| FR-027-001 to 005 (one convention) | Capability Foundation; D4 |
| FR-027-006 to 010 (arrive on the company) | Route Designs; D3; D5 |
| FR-027-011 to 016 (backward compatibility) | Backward Compatibility, per route |
| FR-027-017 to 023 (refusal and unresolvable) | Handoff Lifecycle; Security; Failure Modes |
| FR-027-024 to 026 (market-scoped stay bare) | Data Model, `market-scoped` rows |
| FR-027-027 to 030 (honest declaration) | D2 schema rules; Data Model |
| FR-027-031 to 034 (boundaries) | Purpose and Scope; D6 |
| NFR-027-001 to 009 | Testing and Validation Strategy |

**Scope of FR-027-014 after D1.** The set of already-accepted governing features
whose behaviour must be re-demonstrated reduces to Feature 011. Features 006, 007
and 010 leave the change surface entirely.

---

## Alternatives and Tradeoffs

| Alternative | Why rejected |
| --- | --- |
| Cover all five candidate routes | Three of them have no company as a variable. Two were identified by the analyst; the third, `company-fundamentals-lab.html`, is identified here. Covering them means a capability change to three features, one of which is `blocked`. See D1 |
| Cover the analyst's recommended three | Same reason, applied to `fundamentals` and `valuation`. The evidence in D1 is decisive and contradicts the analyst's classification of that route |
| Make fundamentals resolve `MSFT` only | A link that fails for 292 of 293 corpus symbols, and that renders a page whose static prose names Microsoft while claiming to answer about another company. Worse than the working bare link it replaces |
| A new shared module for the subject rule | `rlticker.js` already owns `normTicker`, is already loaded by every consumer, and is already selftest-extractable. A new module would violate P18 and P19 for no gain |
| Unify the sender and receiver grammars | Narrowing the receiver changes what two working routes accept, forbidden by FR-027-003. Widening the sender loosens a validator directly in front of an href under `unsafe-inline`. See D4 |
| Filter the options-flow scan to the named company | Destroys the scan and violates BS-027-003. See D3 |
| Pre-sort the options-flow table by the named company | Silently overrides a persisted reader control. See D3 |
| Let Feature 025 declare `ownerSubjectParam` later | Leaves `VAL-025-F4` open an extra cycle and risks a declaration landing without a reader. See D2 |
| Free-text bare reason in the registry | Puts operator-authored content on a rendering path and takes the wording out of code review. A closed enum removes the question |
| Persist the deep-linked subject on options-flow | A link would silently become the reader's default on the next unlinked visit — a no-parameter behaviour change, which FR-027-011 forbids |
| Skip the refusal notice on the two precedent routes | Leaves two routes silently swallowing a bad link, contradicting "one convention" and P15 |

---

## Complexity Tracking

| Deviation from the simplest viable approach | Simpler alternative considered | Why it was rejected |
| --- | --- | --- |
| `linkedSubject` returns a three-state result rather than `string \| null` | Return `null` for both absent and refused, as the precedent routes do today | FR-027-020 requires the route to state that a subject was refused, which is impossible if refused and absent are the same value. The three-state result is the minimum shape that carries that distinction, and it also makes FR-027-012's three cases collapse into one branch |
| Catalog binding on top of grammar acceptance (D5) | Accept the grammar and use the value directly | The value would otherwise reach a `localStorage` key on `options-flow` (`CACHE_PREFIX + sym`). Catalog binding removes a whole class of sink question and delivers FR-027-021 and FR-027-022 as a by-product rather than as extra policing |
| `ownerBareReason` added to the registry schema | Reuse the existing generic bare statement | The existing statement is uniform and cannot distinguish a market-scoped owner from a fixed-subject one, which FR-027-025 and FR-027-029 require. One optional enum field is the smallest change that carries the distinction |
| The exactly-one-of registry rule | Rely on review and on the per-route reader tests | FR-027-030 asks that a declaration without a reader not ship. A schema rule makes silence impossible at config-read time, which is where it is cheapest to catch |
| Refusal notice added to the two precedent routes | Adopt the shared rule there without a notice | Would leave two routes silently swallowing a bad link, contradicting BS-027-017's "one convention" and P15. The notice fires only when a parameter is present and unacceptable, so no-parameter behaviour is untouched |

Everything else is the simplest viable approach: one new pure function in an
existing module, one insertion point per route, no new module, no new store, no
new dependency, no new surface.

---

## Recommended Scope Shape

Three scopes, against a ceiling of five. Offered for the plan owner, who decides.

1. **The shared subject-handoff rule.** `RLTKR.linkedSubject`,
   `RLTKR.SUBJECT_PARAM`, `RLTKR.SUBJECT_PATTERN`; the selftests including the
   D4 containment property and the adversarial corpus; adoption by
   `options-structure-lab.html` and `gamma-trading-lab.html` with the equivalence
   proof and their refusal notices.
2. **The two catalog-bound receiving routes.** `volatility-sizing-lab.html`
   preselect and `options-flow-feed-lab.html` focus band, each with catalog
   binding, named-unavailable, refusal notice, and its no-parameter regression
   proof — inherited for volatility, constructed for options-flow.
3. **The registry and the stated bare reasons.** The `ownerBareReason` schema
   rules, the eleven owner-row declarations, the reason-specific statement, and
   rendering it beside the link on both sending surfaces.

Scope 2 may be split per route if the plan owner prefers four scopes; the two
routes share no code beyond the Scope 1 contract.

---

## Plan-Time Prerequisite

`state.json` currently declares `workBoundary.allowedPaths` as
`specs/027-company-scoped-owner-deep-links/**` only. Every production file named
in **Purpose and Scope** falls outside it. The plan owner must widen the boundary
to the enumerated production paths before implementation begins. This design does
not modify the boundary.

---

## Open Questions

Two remain, and both need the operator.

1. **Should `options-flow-feed-lab.html` be adopted by an owning feature before
   this change lands?** It has no originating spec: it was added on 2026-07-08 in
   a standalone commit, Feature 002 registers it as a brief source, and Feature
   012 owns `BUG-001` against it. There is therefore no accepted behaviour to
   preserve and no feature owner to sign off the regression. FR-027-015's
   captured baseline is the design's answer, and it is a real and sufficient
   engineering control. Whether it is a sufficient **governance** control, or
   whether the route should be adopted first, is an ownership decision rather
   than a design one. The design proceeds either way; only the sign-off path
   changes.

2. **Does the concurrent precedent work land before Scope 1?** Per D2, the two
   `tickerFromQuery` readers exist only as uncommitted working-tree changes; the
   two `ownerSubjectParam` declarations are already in `HEAD` without them. This
   design assumes the readers land first, so Scope 1 refactors two existing
   implementations into one shared rule. If they are reverted or reshaped instead,
   Scope 1 writes them from the shared rule directly, the equivalence proof in
   **Backward Compatibility** loses its comparison target and is replaced by the
   corpus test alone, and the D4 accept-set constraint in FR-027-003 becomes a
   forward commitment rather than a preservation obligation. The operator must
   confirm which. It affects Scope 1's shape and its regression evidence, not any
   decision recorded here.

**Resolved without needing the operator, recorded for visibility.**

- `spec.md` Open Question 5, whether the sending row should warn that a link is
  unlikely to resolve, is answered **no**. Both in-scope routes carry small
  closed catalogs, so a pre-warning would require the sending route to model each
  receiver's catalog, duplicating a fact that belongs to the receiver and
  violating P19. The receiver names the company and states the reason on arrival,
  which FR-027-021 already requires and which cannot go stale.
- `spec.md` Open Question 6, whether Feature 007's pending acceptance reopens, is
  answered **no**, because D1 leaves that route untouched.
- `spec.md` Open Question 7, sequencing against `specs/026`, is narrowed rather
  than resolved: after D1, the only overlap with that feature's three referenced
  routes is `options-flow-feed-lab.html`. `technical-analysis-decision-lab.html`
  and `trend-dynamics-cycle-lab.html` are no longer touched. Sequencing remains a
  plan-owner decision over a single file.
