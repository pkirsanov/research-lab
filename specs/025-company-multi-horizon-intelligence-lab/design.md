# Feature 025 — Company Multi-Horizon Intelligence Lab — Design

**Owner artifact:** design.md. **Upstream:** [spec.md](spec.md).
**Educational only — not investment advice.**

---

## Design Brief

**Current State.** No company-scoped composed surface exists. Company evidence
sits in eleven registered tools plus the shared modules. Fundamentals publish an
owner read for three SEC CIKs. Bars cover 293 symbols and options cover 23.
Technicals, options structure, gamma and flow compute inside their own pages, so
no headless consumer can read them. `rlregime.js` composes a regime that nothing
consumes. No production file writes the event cache.

**Target State.** One route answers four horizon questions about one company.
The route composes owner reads that exist today. It reports every mandatory
dimension with an explicit state. It names each absent source instead of
rendering a blank. One new shared module owns composition, and Node unit-tests
that module directly.

**Patterns to Follow.**

- UMD module shape from [rlratio.js](../../rlratio.js) and
  [rlregime.js](../../rlregime.js). The factory returns a frozen API, assigns
  `module.exports` under Node, and attaches a global in the browser.
- Owner-read publication through `putToolRead` in [rldata.js](../../rldata.js),
  using the exact nine-key `rl-tool-read/v1` shape.
- Canonicalization and content hashing from
  [rlcontracts.js](../../rlcontracts.js) through `canonicalize` and
  `contentSha256`.
- Closed vocabularies and refusal-over-inference from
  [rlregime.js](../../rlregime.js). An unmatched combination renders its
  fingerprint rather than the nearest name.
- Accessible-table pairing from `buildAccessibleChartTable` in
  [rlcompany.js](../../rlcompany.js).
- Route shell and script order from
  [technical-analysis-decision-lab.html](../../technical-analysis-decision-lab.html).
  `rldata.js` loads first, `rlapp.js` next, `rlnav.js` last.
- In-progress reachability through [site-exclusions.json](../../site-exclusions.json)
  and [scripts/build-pages-site.mjs](../../scripts/build-pages-site.mjs).

**Patterns to Avoid.**

- Page-local analysis, as in
  [gamma-trading-lab.html](../../gamma-trading-lab.html) and
  [options-structure-lab.html](../../options-structure-lab.html). Those pages
  own real math that no composed consumer can reach. This design refuses to add
  a twelfth unreachable analysis.
- A shared module with no production consumer, as in
  [rlregime.js](../../rlregime.js). Every function this feature adds gains a
  caller inside the route in the same increment.
- Deferring a canvas draw to `requestAnimationFrame`. A hidden tab never fires
  it, so the canvas ships blank.
- Global `isFinite`, which coerces strings. Every numeric guard uses
  `Number.isFinite`.
- Writing agent-authored narrative through `innerHTML`.

**Resolved Decisions.**

- One route, one owning module, one config, one notes file, two test files.
- The module publishes `rl-tool-read/v1` and verifies the stored round trip.
- Four horizons compose from four separately filtered, deep-frozen input sets.
- Every composition function stays pure and takes an explicit `decisionTime`.
- Increment A ships unregistered and excluded, not registered.

**Open Questions.**

- Which public source can supply financial company events without a key.
- How many discretionary branches one run should allow.
- Which identity scheme covers a company with no SEC CIK.

---

## Overview

The tool turns one public company identifier into four horizon reads. It owns
composition, coverage accounting and research accountability. It owns no
dimension's math.

The route holds rendering and event wiring only. All composition lives in one
new module, `rlcompanyintel.js`, so Node can test the composition without a
browser. The module never touches the DOM, never reads a credential and never
fetches.

Evidence enters through one adapter layer. Each adapter reads exactly one
source, validates its contract, and returns one `company-dimension-read/v1`.
An adapter that finds nothing returns an `unavailable` read with a named
reason. No adapter throws for a missing source, because absence is a normal
outcome.

Composition runs after every adapter answers. The composer builds four
horizon-scoped input sets, composes each horizon from its own set, and then
extracts contradictions across the four finished outputs. It publishes a
compact owner read on the shared channel.

---

## Architecture

### Layers

| Layer | File | Responsibility |
| --- | --- | --- |
| Route | `company-intelligence-lab.html` | DOM, rendering, canvases, event wiring, escaping |
| Composition | `rlcompanyintel.js` | Adapters, coverage account, horizon composition, contracts |
| Policy | `company-intelligence.config.json` | Coverage registry, freshness windows, branch budget |
| Shared data | [rldata.js](../../rldata.js) | Cache, bars, options, tool-read channel |
| Owner modules | [rlcompany.js](../../rlcompany.js), [rlvol.js](../../rlvol.js), [rlratio.js](../../rlratio.js), [rlregime.js](../../rlregime.js), [rlagenda.js](../../rlagenda.js) | Each dimension's math and its own contracts |
| Foundations | [rlcontracts.js](../../rlcontracts.js), [rlmetrics.js](../../rlmetrics.js), [rlchart.js](../../rlchart.js), [rlticker.js](../../rlticker.js) | Canonicalization, shared metrics, chart rails, ticker tokens |

### Script order on the route

```text
rldata.js          shared cache, must run first
rlapp.js           shell, data-status control
rlcontracts.js     canonicalize, contentSha256
rlmetrics.js       shared risk and return metrics
rlratio.js         relative performance math
rlvol.js           volatility regime reads
rlregime.js        published-regime reader
rlcompany.js       fundamentals contracts and accessible tables
rlagenda.js        research agenda reads
rlchart.js         chart interaction rails
rlticker.js        linked ticker tokens
rlcompanyintel.js  this feature's owning module
rlnav.js           shared navigation, must run last
```

### Run pipeline

```text
identifier
  -> resolveSubject          company-subject/v1   or refusal C025-IDENTITY-UNRESOLVED
  -> readCoverageRegistry    company-coverage-registry/v1 from the config
  -> runAdapters             one company-dimension-read/v1 per registry row
  -> buildCoverageAccount    company-coverage-account/v1, fifteen rows always
  -> partitionByHorizon      four disjoint, deep-frozen input sets
  -> composeHorizon x4       four company-horizon-read/v1, composed independently
  -> extractContradictions   company-contradiction/v1 records across the four
  -> attachResearchPlan      company-research-plan/v1 from a committed plan or empty
  -> buildReadVersion        company-read-version/v1 with a content fingerprint
  -> publishToolRead         rl-tool-read/v1 through putToolRead, then verify
```

Every step is a pure function except `runAdapters` and `publishToolRead`. Those
two touch `RLDATA`, and the route injects `RLDATA` as a parameter so a Node test
can supply a stub.

### Cache-first first paint

The route paints before any network work. `RLDATA` already holds bars, options
and tool reads written by sibling tools. The route reads that cache, composes,
and renders synchronously. It never refetches a symbol a sibling already cached.

A refresh appends only missing or stale deltas. The freshness window per source
class lives in the config. A source inside its window is reused untouched.

### Synchronous canvas drawing

The route draws every canvas inside the render call, on the same tick. It never
schedules a draw through `requestAnimationFrame` or `setTimeout`. A hidden tab
still produces a fully drawn canvas. Each canvas carries an `aria-label` and an
adjacent table holding the same values, built through
`RLCOMPANY.buildAccessibleChartTable`.

### Determinism

Composition takes a frozen `company-evidence-bundle/v1` plus an explicit
`decisionTime`. The module calls no clock and no random source. Every collection
sorts by a declared key before serialization. The module derives the version
fingerprint through `RLCONTRACTS.contentSha256` over the canonical form.

Two runs over the same frozen bundle and the same `decisionTime` therefore
produce byte-identical canonical output and an identical fingerprint. A unit
test asserts both equalities.

---

## Capability Foundation

The capability is **dimension analysis plus owner-read composition**. The
foundation owns the contracts, the state vocabulary, the coverage account, the
horizon partition and the publication path. It owns no dimension's math and no
horizon's domain judgement.

### Foundation contracts

- `company-dimension-read/v1` — the single shape every adapter returns.
- `company-horizon-read/v1` — the single shape every horizon composer returns.
- `company-coverage-account/v1` — one row per registry dimension, always.
- `company-contradiction/v1` — a standing disagreement between two horizons.
- `company-intel-error/v1` — the closed refusal record.

### Foundation extension points

| Extension point | Signature shape | Contract obligation |
| --- | --- | --- |
| Dimension adapter | `(subject, sources, decisionTime) -> company-dimension-read/v1` | Must return a read, never throw for absence |
| Horizon composer | `(filteredReads, policy, decisionTime) -> company-horizon-read/v1` | Must derive every summary claim from its own input set |
| Event source | `(subject, sources, decisionTime) -> company-event/v1[]` | Must classify each date as scheduled or estimated |
| Plan source | `(subject, sources) -> company-research-plan/v1` | Must record all six branch fields or refuse the branch |

### Foundation-owned policies

- Every registry dimension yields exactly one read per run.
- A read may serve a horizon only when its horizon rank permits it.
- A stale read carries its age and never presents as current.
- A fixture-only read leaves every horizon input set.
- A wrong-company read is discarded with a named refusal.
- A summary claim without a supporting read in its own set is refused.
- Confidence names evidence quality from a closed four-word list.

### What the foundation refuses

The foundation refuses three things by construction. It refuses to name a
horizon direction with no eligible read. It refuses to blend two disagreeing
horizons into one direction. It refuses to substitute a peer, sector or prior
value for a missing own value.

---

## Concrete Implementations

Each implementation below plugs into exactly one foundation extension point.
Every implementation states its Increment A status honestly.

### Dimension adapters

| Adapter | Source it reads | Increment A outcome |
| --- | --- | --- |
| `performanceAdapter` | `data/bars/<SYM>.json` through `RLDATA.bars` | `current` for a covered symbol |
| `relativeAdapter` | bars plus `RLRATIO.ratioSeries` and `checkComparability` | `current` when both legs cover the window |
| `fundamentalsAdapter` | committed publication plus `fundamentals-tool-read/v1` | `current` for three CIKs, otherwise `unavailable` |
| `valuationAdapter` | `company-derived-metric/v1` plus bars | `partial`, because no peer set exists |
| `technicalsAdapter` | none, no headless owner exists | `unavailable`, reason `no-shared-read` |
| `cycleAdapter` | none, the owning math is page-local | `unavailable`, reason `no-shared-read` |
| `optionsStructureAdapter` | `data/options/<SYM>.json` presence only | `unavailable`, reason `no-shared-read` |
| `gammaAdapter` | none, the owning math is page-local | `unavailable`, reason `no-shared-read` |
| `optionsFlowAdapter` | none, the owning math is page-local | `unavailable`, reason `no-shared-read` |
| `volatilityAdapter` | `rlvol-tool-read/v1` on the shared channel | `current` when the sibling has published |
| `financialEventAdapter` | none, no producer writes the event cache | `unavailable`, reason `no-source-wired` |
| `nonFinancialEventAdapter` | none, no contract and no cache slot exist | `unavailable`, reason `no-source-exists` |
| `geopoliticsAdapter` | `research-agenda-tool-read/v1` on the shared channel | `partial`, market scope only |
| `regimeAdapter` | `RLREGIME.readPublishedContext` over a published regime | `unavailable`, reason `regime-not-published` |
| `sentimentAdapter` | the fear and greed macro slot in `RLDATA` | `partial`, proxy only |
| `companyRiskAdapter` | none, nothing owns a company risk register | `unavailable`, reason `no-owner` |

The `regimeAdapter` makes the route a real caller of `RLREGIME.COMBINED_CONTRACT`
and `RLREGIME.readPublishedContext`. It does not make the route a caller of
`composeRegime` or `matchArchetype`. Finding F2 therefore stays open for those
two functions, and this design does not claim otherwise.

### Horizon composers

| Composer | Horizon | Eligible read classes | Increment A behaviour |
| --- | --- | --- | --- |
| `composeImmediate` | Immediate action | `tactical` and longer | Reads price and volatility, states an invalidation |
| `composeEvent` | Next company event | `event` and longer | States no direction, because no event source answers |
| `composeSwing` | Medium-term positioning | `swing` and longer | Reads fundamentals, relative performance and agenda |
| `composeStructural` | Long-term positioning | `structural` only | Reads fundamentals and valuation |

### Event sources

| Source | Increment A status |
| --- | --- |
| `committedEventSource` | Implemented, returns an empty set, because no committed file exists |
| `publicScheduleSource` | Delivered by Scope 3. It is exported by `rlcompanyintel.js` and held by the passing tests `every event the public schedule source produces carries a type, a date, a date class and a source class` and `the public schedule source performs no network call and refuses a caller with no decision time`. This row read "Deferred to Increment B" while Increment A was the whole of the delivered surface; that reading is stale. |

### Plan sources

| Source | Increment A status |
| --- | --- |
| `committedPlanSource` | Implemented, reads a committed plan file when one exists |
| `agentAuthoredPlanSource` | Delivered by Scope 4. It is exported by `rlcompanyintel.js` and held by the passing tests `an authored branch records all six mandatory fields and a missing field raises C025-PLAN-SCHEMA`, `an authored no-change branch survives publication with its explicit disposition` and `an authored refused branch records its reason and changes no horizon field`. This row read "Deferred to Increment C" while Increment A was the whole of the delivered surface; that reading is stale. |

### Variation Axes

- **Source availability.** An adapter reads a committed file, a shared cache
  slot, a sibling owner read, or nothing at all. Four distinct acquisition
  shapes already exist across the sixteen adapters.
- **Owner presence.** A dimension has a registered owning tool, an owning shared
  module with no route, or no owner at all. Deep-link rendering and refusal
  behaviour differ per class.
- **Horizon rank.** A read declares the longest horizon it may serve. The
  partition step filters each horizon's input set by that rank, so the same
  adapter output reaches different horizon composers.
- **Provenance class.** A value is observed, derived, proxy or modelled. Each
  class renders a different chip and carries a different limitation line.
- **Evidence state.** A read resolves to current, partial, stale, conflicted or
  unavailable. Each state drives a distinct composer contribution rule.
- **Company coverage.** A company sits inside three corpora, inside one corpus,
  or outside every corpus. Each case yields a different coverage account.

---

## Data Model

### Company subject

```json
{
  "contractVersion": "company-subject/v1",
  "subjectId": "company:msft",
  "ticker": "MSFT",
  "cik": "0000789019",
  "displayName": "Microsoft Corporation",
  "identityBasis": "sec-cik",
  "resolvedAt": "2026-08-18T00:00:00.000Z"
}
```

`identityBasis` is one of `sec-cik`, `committed-bars` or `unresolved`. An
`unresolved` basis never reaches composition. The route refuses with
`C025-IDENTITY-UNRESOLVED` and renders no horizon.

### Dimension read

```json
{
  "contractVersion": "company-dimension-read/v1",
  "dimensionId": "volatility",
  "subjectId": "company:msft",
  "state": "current",
  "reasonCode": null,
  "maxHorizon": "swing",
  "values": [
    {
      "valueId": "vol-percentile-12m",
      "label": "Volatility percentile",
      "value": "38.400",
      "unit": "percent",
      "provenanceClass": "derived",
      "sourceName": "volatility owner read",
      "asOf": "2026-08-15"
    }
  ],
  "ownerToolId": "volatility-sizing-lab",
  "ownerDeepLink": "volatility-sizing-lab.html?symbol=MSFT",
  "sourceClass": "owner-read",
  "ageDays": 3,
  "limitations": []
}
```

`state` is one of `current`, `partial`, `stale`, `conflicted`, `unavailable`.
`reasonCode` is null only when `state` is `current`. `maxHorizon` is one of
`tactical`, `event`, `swing`, `structural`. `sourceClass` is one of
`committed-file`, `cache`, `owner-read`, `fixture`, `none`.

Closed reason vocabulary: `no-shared-read`, `no-owner`, `no-source-wired`,
`no-source-exists`, `symbol-not-covered`, `company-not-in-corpus`,
`window-too-short`, `source-not-published`, `regime-not-published`,
`fixture-only-evidence`, `read-company-mismatch`, `market-scope-only`,
`proxy-only`, `peer-set-missing`, `read-aged-past-window`, `sources-disagree`.

### Horizon read

```json
{
  "contractVersion": "company-horizon-read/v1",
  "horizonId": "structural",
  "subjectId": "company:msft",
  "direction": "constructive",
  "evidenceQuality": "thin",
  "summary": "Reinvestment holds and the moat read stays thin.",
  "claims": [
    {
      "claimId": "structural-reinvestment",
      "text": "Reinvestment held across three reported periods.",
      "supportingValueIds": ["fcf-latest", "fcf-prior"]
    }
  ],
  "contributingDimensionIds": ["fundamentals", "valuation"],
  "unavailableDimensionIds": ["company-risk", "market-regime"],
  "gapEffect": "No risk register and no regime backdrop reached this read.",
  "invalidation": "Reinvestment falls across two reported years.",
  "inputFingerprint": "sha256:<64 hex>"
}
```

`direction` is one of `constructive`, `pressured`, `flat`, `none`.
`evidenceQuality` is one of `broad`, `narrow`, `thin`, `absent`. A
`none` direction forces `absent` quality and an empty `claims` array.

Every entry in `supportingValueIds` must name a value that appears inside this
horizon's own input set. The composer refuses a claim that cites any other
value, and it raises `C025-HORIZON-ISOLATION`.

### Coverage account

```json
{
  "contractVersion": "company-coverage-account/v1",
  "subjectId": "company:msft",
  "rows": [
    { "dimensionId": "performance", "state": "current", "reasonCode": null, "ownerToolId": "market-brief" }
  ],
  "totals": { "current": 4, "partial": 4, "stale": 0, "conflicted": 0, "unavailable": 7 }
}
```

The account always holds one row per registry dimension. The totals always sum
to the registry length. A unit test asserts both invariants.

### Company event

```json
{
  "contractVersion": "company-event/v1",
  "subjectId": "company:msft",
  "eventId": "earnings-2026q1",
  "eventType": "earnings",
  "eventClass": "financial",
  "date": "2026-10-24",
  "dateClass": "scheduled",
  "estimateBasis": null,
  "sourceName": "issuer investor-relations page",
  "sourceUrl": "https://example.invalid/ir",
  "asOf": "2026-08-14",
  "effectHorizonId": "immediate",
  "observedOutcome": null
}
```

`dateClass` is one of `scheduled`, `estimated`, `occurred`, `revised`,
`unavailable`. An `estimated` class requires a non-empty `estimateBasis`. A
non-financial event without both `sourceUrl` and `asOf` never renders.

### Adaptive Research Plan

```json
{
  "contractVersion": "company-research-plan/v1",
  "subjectId": "company:msft",
  "maxBranches": 5,
  "branches": [
    {
      "contractVersion": "company-research-branch/v1",
      "branchId": "branch-1",
      "question": "Does the rising margin survive a currency move?",
      "relevance": { "horizonId": "structural", "claimId": "structural-reinvestment" },
      "consulted": [
        { "kind": "registered-tool", "ref": "company-fundamentals-lab", "deepLink": "company-fundamentals-lab.html" },
        { "kind": "committed-data", "ref": "data/bars/MSFT.json", "deepLink": null }
      ],
      "result": "Two of three periods hold after the currency adjustment.",
      "disposition": "changed",
      "changedTargets": [{ "horizonId": "structural", "field": "evidenceQuality", "from": "narrow", "to": "thin" }],
      "refusalReason": null,
      "stopCondition": "Three reported periods checked.",
      "stoppedBy": "declared-limit"
    }
  ],
  "budgetRemaining": 1,
  "emptyReason": null
}
```

`disposition` is one of `changed`, `confirmed`, `no-change`, `refused`. A
`refused` disposition requires a non-empty `refusalReason` and an empty
`changedTargets`. `stoppedBy` is one of `declared-limit`, `question-answered`,
`no-source`, `guardrail`.

A discretionary branch is recorded as one array element and rendered as one
disclosure row. The row header carries the disposition word, so a reader hears
it before expanding. A branch missing any of the six mandatory fields is
refused with `C025-PLAN-SCHEMA`, and the plan renders the refusal in place of
the row.

An empty plan is a real outcome. `branches` stays empty and `emptyReason` reads
`floor-was-sufficient`. The workspace states that the floor answered the
decision.

### Read version

```json
{
  "contractVersion": "company-read-version/v1",
  "versionId": "company:msft:2026-08-18",
  "subjectId": "company:msft",
  "composedAt": "2026-08-18T00:00:00.000Z",
  "priorVersionId": "company:msft:2026-08-11",
  "horizons": [],
  "coverageAccount": {},
  "contradictions": [],
  "researchPlan": {},
  "contentFingerprint": "sha256:<64 hex>"
}
```

`priorVersionId` is null for a first version. The module never edits a prior
version. Increment A reads committed versions and renders history. Increment C
authors new committed versions.

### Committed data layout

```text
company-intelligence.config.json                       coverage registry and policy
data/company-intelligence/<subjectId>/current.json     pointer to the current version
data/company-intelligence/<subjectId>/versions/*.json  append-only read versions
data/company-intelligence/<subjectId>/plan-*.json      committed research plans
```

Increment A ships the config only. The `data/company-intelligence/` tree stays
absent, and every reader of it handles absence as an explicit unavailable.

---

## API/Contracts

### The read this tool publishes

The tool publishes one compact owner read on the shared channel under the id
`company-intelligence-lab`. It uses `rl-tool-read/v1`, because `putToolRead`
persists that shape intact after an exact nine-key match.

```json
{
  "contractVersion": "rl-tool-read/v1",
  "id": "company-intelligence-lab",
  "availability": "current",
  "asOf": "2026-08-15T00:00:00.000Z",
  "computedAt": "2026-08-18T00:00:00.000Z",
  "freshUntil": "2026-08-25T00:00:00.000Z",
  "read": "MSFT: immediate pressured, event absent, medium constructive, long constructive.",
  "metrics": {
    "subjectId": "company:msft",
    "horizonSummaries": [],
    "coverageTotals": {},
    "contradictionCount": 2,
    "contentFingerprint": "sha256:<64 hex>"
  },
  "deepLink": "company-intelligence-lab.html?symbol=MSFT"
}
```

Three rules bind this publication.

The key set must be exactly the nine keys `putToolRead` expects. Any extra or
missing key makes the read fall through to the legacy compact store, which
silently drops `availability`, `computedAt` and `freshUntil`. The module builds
the object from a frozen key list, so drift cannot occur silently.

An `unavailable` availability forces `asOf` and `freshUntil` to null. The
module derives all three together from the coverage account.

Publication is verified. The module calls `putToolRead`, reads the value back
through `getToolRead`, and compares canonical forms. A mismatch raises
`C025-PUBLISH-LOSSY`, and the route renders a named publication refusal rather
than a success claim. Nothing partial is published.

### The reads this tool consumes

| Consumed contract | Producer | Access path |
| --- | --- | --- |
| `fundamentals-tool-read/v1` | [rlcompany.js](../../rlcompany.js) | committed publication under `data/company-fundamentals/` |
| `company-derived-metric/v1` | [rlcompany.js](../../rlcompany.js) | same publication |
| `rlvol-tool-read/v1` | [rlvol.js](../../rlvol.js) | `RLDATA.toolRead("volatility-sizing-lab")` |
| `research-agenda-tool-read/v1` | [rlagenda.js](../../rlagenda.js) | `RLDATA.toolRead("research-agenda-lab")` |
| `combined-regime/v1` | [rlregime.js](../../rlregime.js) | `RLREGIME.readPublishedContext` |
| bar series | [rldata.js](../../rldata.js) | `RLDATA.bars` plus `data/bars/<SYM>.json` |

Relative performance uses `RLRATIO.ratioSeries`, `windowStats`,
`checkComparability` and `checkAdjustmentParity`. Shared risk metrics use
`RLMETRICS`. This feature adds no second definition of either.

### Behaviour when a consumed read misbehaves

| Condition | Detection | Dimension outcome | Horizon effect |
| --- | --- | --- | --- |
| Absent | The channel or file returns null | `unavailable`, reason `source-not-published` | Listed in `unavailableDimensionIds` |
| Stale | `asOf` older than the configured window | `stale`, `ageDays` populated | Excluded from every input set |
| Fixture-only | `sourceClass` is `fixture`, or the path sits under `tests/fixtures/` | `unavailable`, reason `fixture-only-evidence` | Excluded from every input set |
| Wrong company | The read names a different subject | `unavailable`, reason `read-company-mismatch` | Excluded, refusal `C025-READ-COMPANY-MISMATCH` recorded |
| Malformed | The contract version or shape fails validation | `unavailable`, reason `source-not-published` | Excluded, refusal `C025-READ-CONTRACT` recorded |
| Two sources disagree | Two adapters answer the same dimension differently | `conflicted`, both values retained | Both values render, neither wins |

A stale read stays visible in the coverage account with its age. It never
reaches a horizon, so no summary rests on aged evidence. That separation is
deliberate. A reader must see that the source exists and that it aged out.

### Refusal codes

```text
C025-IDENTITY-UNRESOLVED     the identifier resolves to no public company
C025-CONFIG-VERSION          the config contract version is not the expected one
C025-CONFIG-SCHEMA           the config fails structural validation
C025-REGISTRY-INCOMPLETE     the coverage registry omits a mandatory dimension
C025-READ-CONTRACT           a consumed read fails its own contract validation
C025-READ-COMPANY-MISMATCH   a consumed read names a different company
C025-HORIZON-ISOLATION       a horizon claim cites a value outside its input set
C025-PLAN-SCHEMA             a research branch omits a mandatory field
C025-PLAN-BUDGET             a branch exceeds the declared maximum
C025-PUBLISH-LOSSY           the published read did not round-trip intact
C025-INPUT-REFUSED           the operator entered a position, size, cost or profit value
```

Each code renders as a named refusal line. No code renders as a blank panel.

---

## UI/UX

### Route structure

The page ships one Simple cockpit and ten Power workspaces, exactly as
[spec.md](spec.md) specifies. Increment A implements all eleven, because a
workspace that reports an honest unavailable costs little and hiding it would
break the coverage floor.

The mode segment switches display only. It triggers no fetch and no recompute.
The route composes once per run and renders both modes from the same frozen
`company-read-version/v1`.

### Element identity discipline

Every element the script reads through `getElementById` exists in the shipped
markup. The route routes every lookup through one `byId` helper and one
`setText` helper, following the pattern in
[technical-analysis-decision-lab.html](../../technical-analysis-decision-lab.html).
A route test extracts every `byId` and `setText` literal and asserts each one
resolves to a declared `id`.

### Escaping

Agent-authored narrative reaches the DOM through `textContent` only. The route
declares no `innerHTML` assignment anywhere. A route test asserts the absence of
`innerHTML` in the page source and asserts that a scripted narrative string
renders as visible text.

### Charts

Increment A ships three canvases. Each one draws synchronously inside render.
Each one carries an `aria-label` naming the series, the window and the
direction. Each one pairs with a table built through
`RLCOMPANY.buildAccessibleChartTable`, which renders a missing point as explicit
text rather than a blank cell.

| Canvas | Workspace | Table caption |
| --- | --- | --- |
| Price and benchmark ratio | Performance | Price and benchmark ratio by session |
| Volatility percentile | Regime and cross-asset | Volatility percentile by session |
| Price with a long mean | Cycles | Price and long mean by session |

Below 600 CSS pixels the canvas hides and the table renders alone. That
threshold matches the wireframes.

### Refusals and absence

A refused input renders one named line above the entry field. An unavailable
dimension renders the dimension, the missing source and the effect on the read.
Neither renders a dash, a zero or an empty cell.

### No credential surface

The route declares no input of type password and no provider key field.
Provider access stays on the home page under the existing data-settings anchor.
A route test asserts the absence of a credential field.

---

## Security/Compliance

**Tickers only, forever.** The company field accepts a bounded pattern for a
public identifier. The module rejects any input carrying a currency amount, a
share count, a cost basis or a profit figure. It raises `C025-INPUT-REFUSED`
and stores nothing.

**No new storage container.** The route writes only through existing `RLDATA`
containers. It declares no new `localStorage` key and no new
`sessionStorage` key. A unit test asserts the module never references either
storage API.

**No credential handling.** The module never reads a provider key. It never
calls `providerFetch`. Network work stays inside `RLDATA`, which already owns
the proxy policy and the connect-source allowlist.

**Model text is data.** Every narrative string is escaped at every sink. The
module returns plain strings and never returns markup.

**Source rights.** Each dimension read carries its source name and its as-of
date. Reads sourced from a publication under
[rlcompany.js](../../rlcompany.js) carry that module's rights class unchanged.
This feature never widens a rights class.

**No action authority.** The module exposes no order, size, alert or routing
function. Every horizon carries an invalidation, never an instruction.

**Confidence is not a probability.** The evidence-quality vocabulary holds four
words and no number. The module has no code path that emits a percentage
alongside a horizon direction.

---

## Observability

This repository ships no telemetry backend, so observability here is in-artifact
and in-page. That is the honest boundary.

**The coverage account is the primary observability surface.** It reports what
answered, what did not, and why, on every run.

**Run identity.** The sources workspace renders the `contentFingerprint` and the
`decisionTime` of the current version. A reader can compare two runs by
fingerprint alone.

**Body state attributes.** The route sets `data-run-status` to `empty`,
`composing`, `composed` or `refused`. It sets `data-coverage-unavailable` to the
unavailable count. A route test reads both.

**Refusal visibility.** Every `C025-` code that fires during a run appears in
the sources workspace under a refusals list. A run with zero refusals renders an
explicit zero line rather than an empty block.

**Trace panel.** Any displayed value opens a trace naming its required inputs,
its sources, its formula, its provenance class, its consumers and its limits.
The trace is derived from the value record, so it cannot drift from the number.

---

## Testing Strategy

### Test files

| File | Runner | Surface |
| --- | --- | --- |
| `tests/company-intelligence.unit.mjs` | `node --test` | Pure composition, contracts, determinism, isolation |
| `tests/company-intelligence-lab.spec.mjs` | Playwright | Route rendering, element ids, escaping, canvases, accessibility |

Two files exist because the two surfaces need different runners. The module is
pure and imports cleanly into Node through its UMD `module.exports`. The route
needs a real DOM to prove that every canvas drew and every id resolved.

### Scenario coverage

| Scenario | Test type | File | Assertion |
| --- | --- | --- | --- |
| BS-025-001 | unit | `company-intelligence.unit.mjs` | The account holds one row per registry dimension and the totals sum to the registry length |
| BS-025-002 | unit | `company-intelligence.unit.mjs` | The non-financial event dimension reads `unavailable` with `no-source-exists` and carries no value |
| BS-025-003 | unit | `company-intelligence.unit.mjs` | An unresolvable identifier raises `C025-IDENTITY-UNRESOLVED` and composes no horizon |
| BS-025-004 | unit | `company-intelligence.unit.mjs` | A company outside every corpus yields four horizons with `absent` quality and `none` direction |
| BS-025-005 | e2e | `company-intelligence-lab.spec.mjs` | Four horizon regions render with four summaries and four deep-dive controls |
| BS-025-006 | unit | `company-intelligence.unit.mjs` | Every claim cites a value present in its own horizon input set |
| BS-025-007 | unit | `company-intelligence.unit.mjs` | Four unavailable contributors force a quality downgrade and populate `gapEffect` |
| BS-025-008 | unit | `company-intelligence.unit.mjs` | Two opposing horizons keep their directions and produce one contradiction record |
| BS-025-009 | unit | `company-intelligence.unit.mjs` | The module source contains no second definition of a volatility or ratio metric |
| BS-025-010 | e2e | `company-intelligence-lab.spec.mjs` | An owned dimension renders a deep link whose target is a registered route |
| BS-025-011 | unit | `company-intelligence.unit.mjs` | A dimension with no owner renders no deep link and states that no owner exists |
| BS-025-012 | unit | `company-intelligence.unit.mjs` | Every exported function has a caller inside the route source |
| BS-025-013 | unit | `company-intelligence.unit.mjs` | An estimated date without a basis is refused, and a scheduled date keeps its class |
| BS-025-014 | unit | `company-intelligence.unit.mjs` | The event horizon reads `none` with `absent` quality and names the missing source |
| BS-025-015 | unit | `company-intelligence.unit.mjs` | A non-financial event without a source url or an as-of date never renders |
| BS-025-017 | unit | `company-intelligence.unit.mjs` | A branch missing any of the six fields raises `C025-PLAN-SCHEMA` |
| BS-025-018 | unit | `company-intelligence.unit.mjs` | A `no-change` branch stays in the published plan |
| BS-025-019 | unit | `company-intelligence.unit.mjs` | A refused branch records its reason and no horizon cites its claim |
| BS-025-021 | e2e | `company-intelligence-lab.spec.mjs` | Every rendered numeric value carries a provenance chip, a source and an as-of date |
| BS-025-023 | unit | `company-intelligence.unit.mjs` | A position, size, cost or profit input raises `C025-INPUT-REFUSED` and stores nothing |
| BS-025-024 | selftest | `scripts/selftest.mjs` | The route, module and config each carry a site-exclusion entry with a substantive reason |

### Adversarial and budget tests

NFR-025-008 requires a guard with a real failure mode. Three adversarial tests
carry that weight.

- **Horizon isolation.** Compose the structural horizon twice. The second run
  adds a tactical read that would flip the direction. Assert the two structural
  outputs are byte-identical. Deleting the partition filter fails this test.
- **Publication round trip.** Publish a read carrying one extra key. Assert the
  module raises `C025-PUBLISH-LOSSY` rather than reporting success. Deleting the
  verification step fails this test.
- **Fixture leakage.** Supply a fixture-sourced fundamentals read. Assert no
  horizon cites it and the dimension reads `fixture-only-evidence`. Deleting the
  fixture filter fails this test.

NFR-025-009 requires a declared branch budget with a failing test. The config
declares `maxBranches`. A test supplies one branch beyond the budget and asserts
`C025-PLAN-BUDGET`. Raising the budget to pass the test is forbidden.

NFR-025-010 requires determinism. A test composes twice from the same frozen
bundle and the same `decisionTime`, then asserts identical canonical strings and
identical `contentSha256` values.

---

## Delivery Increments

### Increment A — Composed floor and four honest horizons

**Files created.**

| File | Why it must exist |
| --- | --- |
| `company-intelligence-lab.html` | FR-025-040 requires one route. The repository ships one self-contained HTML file per tool. |
| `rlcompanyintel.js` | FR-025-010 requires one owning module for composition. Node must import it, so it cannot live inside the page. |
| `company-intelligence.config.json` | FR-025-003 requires exactly one committed coverage registry. Every sibling tool keeps policy in a root config file. |
| `notes/company-intelligence-lab.md` | Every registered tool carries a note, and the note must exist before registration. Writing it now avoids a later registration blocker. |
| `tests/company-intelligence.unit.mjs` | The pure composition surface needs a Node runner. |
| `tests/company-intelligence-lab.spec.mjs` | The DOM, canvas and accessibility rails need a real browser. |

**Requirements Increment A satisfies in full.**

FR-025-001 through FR-025-009, FR-025-010, FR-025-011 through FR-025-026,
FR-025-029, FR-025-033, FR-025-034, FR-025-035, FR-025-038, FR-025-039 and
FR-025-040. NFR-025-001 through NFR-025-008 and NFR-025-010 through
NFR-025-012.

**Requirements Increment A satisfies partially, and how.**

- FR-025-027 and FR-025-028. The `company-event/v1` contract, the date-class
  vocabulary and the estimate-basis rule all ship and carry tests. No source
  answers, so no event renders. The producer is Increment B work.
- FR-025-030. The suppression rule ships and carries a test. No non-financial
  event exists to suppress.
- FR-025-036. A committed plan publishes with its version. An agent authors no
  plan yet.
- NFR-025-009. The budget and its failing test ship. The budget value stays an
  open question for the plan owner.

**Requirements Increment A did not satisfy on its own, and where each now stands.**

The three entries below were written when Increment A was the whole of the
delivered surface. Scopes 3 and 4 have since landed, so each is restated against
what is now built and tested rather than against what was then planned.

- FR-025-031. Reclassifying an occurred event needs an event source. Now
  satisfied by Scope 3, which landed `publicScheduleSource` and `composeEvent`.
  The passing tests `an event dated before decisionTime reclassifies to occurred
  and carries its observed outcome` and `an occurred event is absent from the
  upcoming catalyst list` hold both halves, and the browser row `Regression:
  SCN-025-016 a passed event renders as occurred and never as an upcoming
  catalyst` holds the same separation in the live DOM.
- FR-025-032. Agent-authored research freedom needs the refresh path. Now
  satisfied by Scope 4, which landed `agentAuthoredPlanSource`. The passing test
  `a branch against any registered tool is permitted and records the tool it
  consulted` holds the freedom clause, and `an authored refused branch records
  its reason and changes no horizon field` holds its guardrail.
- FR-025-037. Authoring a new dated version needs a write path. Now satisfied by
  Scope 4, which landed `planVersionWrite`, `buildReadVersion` and
  `readVersionHistory`. The passing tests `a new version references its
  predecessor and every prior file keeps its original contentFingerprint`, `the
  version writer opens no prior version file for writing` and `a first version
  carries a null priorVersionId and the pointer advances to it` hold the
  append-only contract.

Two items in the sentence below are checked and remain genuinely unbuilt, and
are stated plainly rather than swept into the paragraph above. Outcome scoring
over time has no implementation in `rlcompanyintel.js`. Headless owner reads for
the four page-local dimensions are likewise absent by design: `technicals`,
`cycles`, `dealer-gamma` and `options-flow` each resolve through
`noSharedReadAdapter`, whose recorded reason is that the math is page-local so
no headless consumer can read it.

Increment A does not deliver live event sourcing, agent-authored research
refresh, outcome scoring over time, or headless owner reads for the four
page-local tools. This design claims none of those.

### Increment B — Company event capability

Adds a public financial event source inside the free posture, the occurred
reclassification path, and the non-financial gap policy. Satisfies FR-025-027,
FR-025-028, FR-025-030 and FR-025-031 in full.

### Increment C — Authored research and outcome record

Adds the agent-authored research refresh, append-only version authoring, and the
outcome record over time. Satisfies FR-025-032, FR-025-036 and FR-025-037 in
full.

### Increment D — Headless owner reads

Extracts one owning module per page-local dimension, covering technicals, options
structure, gamma and flow. This is IP-025-005 and the declared split seam. It may
become a sibling feature. Until it lands, those four dimensions read
`unavailable` with reason `no-shared-read`, and the coverage floor already models
that.

### Registration recommendation

**Recommendation: Increment A ships unregistered, listed in
[site-exclusions.json](../../site-exclusions.json). It does not register in
`tools.json`, `index.html` or `rlnav.js`.**

Four reasons support that recommendation.

**Registration is not a three-line edit.** `RLCONTRACTS.validateRegistry` in
[rlcontracts.js](../../rlcontracts.js) requires a complete seven-field
`briefing` block. It requires a globally unique `readAdapter`. It requires a
profile and role that match, and a policy triple that matches the shared config.
Registered entries also carry an `experience` block that other checks read for
`kind`, `journeyDefinitionIds` and `matrixDomains`. Registration therefore also
implies a Simple adapter module under `rlexperience-adapters/`. That is
Increment C work, not Increment A work.

**Registration changes the frozen registry fingerprint.** Adding a participant
changes `participantCount`, `orderedParticipantIds` and the registry fingerprint
that the market brief consumes. Increment A should not perturb the brief.

**The specification already commits to exclusion.** The Exposure Contract in
[spec.md](spec.md) states that the route registers at completion and stays
listed until then. Increment A is not completion.

**Collision risk favours exclusion.** Both
[scripts/selftest.mjs](../../scripts/selftest.mjs) and
[site-exclusions.json](../../site-exclusions.json) currently carry uncommitted
Lifetime Tax work. The exclusion path appends three array elements to
`site-exclusions.json`, beside the tax work's own appended elements. That is a
mechanical adjacent-append that resolves trivially. The registration path
instead needs parity edits in three registry files, new registry fixtures, and
larger additions to the already-modified selftest.

**Concrete exclusion entries.** Three root paths need listing, because the build
copies every unexcluded root file and refuses every unregistered root page.

```text
company-intelligence-lab.html      the in-progress route
rlcompanyintel.js                  the module whose only consumer is that route
company-intelligence.config.json   the config whose only consumer is that route
```

Each reason string must reach at least forty characters, which
[scripts/build-pages-site.mjs](../../scripts/build-pages-site.mjs) asserts.

**Sequencing.** The plan owner should land the exclusion edit after the Lifetime
Tax work commits, or coordinate the two appends directly. Increment A should
touch [scripts/selftest.mjs](../../scripts/selftest.mjs) exactly once, for the
exclusion-parity assertion. Every other Increment A test belongs in the two new
clean test files.

---

## Complexity Tracking

| Deviation | Simpler alternative considered | Why the simpler option was rejected |
| --- | --- | --- |
| A new shared module rather than page-local composition | Keep composition inside the route, as the gamma and options pages do | Node cannot import page-local code, so determinism and isolation would carry no test. P18 and P19 also forbid a private second definition. |
| Four separately filtered, deep-frozen input sets | One shared bundle with a horizon tag per read | A tag is advisory and a reviewer must police it. A filtered argument makes the wrong read absent, so the composer cannot reach it. |
| A root config file rather than in-module constants | Declare the registry as a frozen constant inside the module | FR-025-003 requires one committed registry that a reader can inspect. Every sibling tool keeps policy in a root config file. |
| Two test files rather than one | Put every assertion into the Playwright spec | The pure surface runs far faster under Node and needs no browser. Mixing them would make a determinism failure slow to find. |
| Publication verified by read-back | Trust `putToolRead` to persist the object | `putToolRead` falls through to a lossy legacy store when the key set drifts. Silent field loss would publish a read the reader cannot trust. |
| Sixteen adapters rather than one generic reader | One reader driven by a source-type table | The sixteen sources differ across four acquisition shapes and three owner classes. A single reader would grow a branch per source anyway. |

---

## Risks & Open Questions

### Risks

| Risk | Effect | Mitigation |
| --- | --- | --- |
| Increment A reports seven unavailable dimensions | A reader may read thin coverage as a weak company | The cockpit states the coverage count in the header and every horizon states its gap effect |
| The volatility and agenda reads depend on a sibling run | Both dimensions read unavailable on a cold cache | The reason code names the missing publication rather than the missing data |
| The published read shares one channel with every tool | A malformed publish could overwrite a good read | The module verifies the round trip and refuses on mismatch |
| The route grows past a reviewable size | Later maintenance becomes costly | All logic stays in the module. The route holds rendering only. |
| The exclusion edit collides with concurrent tax work | A merge conflict blocks the increment | Sequence the append after the tax work commits |

### Open questions carried from the specification

1. Which public source supplies financial company events without a key. The
   design owner must choose one or accept a permanent unavailable dimension.
2. Whether non-financial events can be sourced without a paid feed. A negative
   answer keeps the dimension permanently unavailable with a named reason.
3. Whether the regime dimension needs a surface before this feature consumes it.
   This design consumes `readPublishedContext`, which needs a publisher.
4. How many discretionary branches one run should allow. The config declares the
   value and the plan owner must choose it.
5. Whether the company read should reach the market brief. Registration and
   brief participation both wait for Increment C.
6. Which dimension gets the first extracted owner module in Increment D. The
   plan owner should sequence by horizon impact.
7. What identity scheme covers a company with no SEC CIK. Increment A resolves
   through committed bars as a second basis and refuses everything else.

### New questions this design raises

8. Should a `conflicted` dimension contribute to a horizon at all. This design
   renders both values and excludes the dimension from composition. The plan
   owner should confirm that choice.
9. Should the branch budget count a refused branch. This design counts it,
   because evaluating a branch consumes real work.

**Educational research only. Not investment advice.**
