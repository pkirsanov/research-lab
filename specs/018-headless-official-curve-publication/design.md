# Feature 018 — Headless Official Curve Publication — Design

Owner: `bubbles.design`. This document owns architecture, contracts and validation
strategy. It does not own business requirements (`spec.md`, `bubbles.analyst`), the
reader-visible screens (`## UI Wireframes` in `spec.md`, `bubbles.ux`), or the scope
breakdown (`scopes.md`, `bubbles.plan`).

**Design language.** None is configured. `.github/bubbles-project.yaml` declares no
`designLanguages` block, so this design specifies against the repository's own
conventions and the UX-owned primitives already written into `spec.md`.

**Nothing in this document is built.** Every file path introduced below is a design
target. Every byte figure marked *estimated* is arithmetic over a known row shape, not
a measurement. The facts read from committed files during authoring are cited with a
path and a line or a key.

---

## Design Brief

**Current state.** `bond-regime-lab.html` owns the whole bond evidence model —
`parseTreasuryCurveCsv` (:1507), `loadTreasuryCurves` (:1662), `classifyCurveState`
(:1456), `classifyCurveImpulse` (:1477), `deriveBreakevenRows` (:1493),
`classifyInflationState` (:1694), `classifyDurationPosture` (:1707) — and
`scripts/brief-refresh.mjs:1529` already loads those exact functions by name through
`loadToolFunctions` rather than reimplementing them. The Treasury rows themselves reach
only the browser: `loadTreasuryCurves` fetches two calendar years per family into
`localStorage`, and `scripts/owner-state.mjs:484-485` therefore hands the model
`unavailableCurveFamily(...)` on every server run. The published read is a named
absence on both axes.

**Target state.** A new Node acquisition step fetches the same two key-free
`home.treasury.gov` CSVs, parses them with the page's own parser, and writes one
committed artifact carrying rows plus a validated `source-provenance/v1` envelope per
fetched response. `buildBondRegimeToolRead` reads that artifact, applies a read-time
freshness admission, and passes the resulting families through the *existing*
`nominalCurve` / `realCurve` seam into the unchanged `computeBondLabViewModel`. The
duration, curve-level, curve-impulse and inflation families resolve. The credit axis
does not, and the published `state` stays `unavailable` — the outcome
`scripts/selftest.mjs:5670-5682` already asserts.

**Patterns to follow.**

- `scripts/brief-refresh.mjs:940` `loadToolFunctions` — load the page's helpers by
  name. Extend the existing `helpers` array at `:1522-1527`; add no second classifier.
- `data/calendars/xnys/calendar.json` — a committed official artifact carrying
  top-level `contractVersion`, `coverageStart`/`coverageEnd`, `sourceUrl`,
  `sourceContentSha256`, `retrievedAt`, **and** a nested `sourceRef` holding the full
  `source-provenance/v1` envelope. This is the exact layering this feature needs.
- `scripts/brief-refresh.mjs:1087-1101` `yahooRows` — dependency-free global `fetch`
  with a `User-Agent` header and a `catch` that returns `null` rather than throwing.
- `scripts/owner-state.mjs:461-467` `barMeta` — a per-family record carrying
  `observedAt`, `retrievedAt`, `sourceId`, `rights`, `persistence`, `errorCode`, with
  `persistence: 'same-origin-snapshot'` naming *this copy's* retention.
- `scripts/validate-brief-cache.mjs` — a standalone `scripts/validate-*.mjs` gate that
  accumulates named errors and exits non-zero.

**Patterns to avoid.**

- **Do not key freshness off `data/calendars/xnys/calendar.json`.**
  `scripts/validate-brief-cache.mjs:18-33` `latestCompletedSessionDate()` is the
  tempting precedent and it is correct *for equities*. Applied to Treasury it is wrong
  twice over: the file marks `2026-10-12` and `2026-11-11` as `dateState: "regular"`
  while the bond market is closed (H-2), and its `coverageEnd` is `2026-12-31`.
- **Do not port `loadTreasuryCurves`' cache-degrade branch into Node.**
  `bond-regime-lab.html:1687-1688` marks a family `stale` and the model then *consumes*
  it, because `computeBondLabViewModel:2152-2153` only excludes `"unavailable"`. The
  headless degrade policy is a different decision (H-6) and is specified separately
  below; copying the browser branch would silently publish out-of-window rows as
  current evidence and contradict FR-018-031.
- **Do not widen the `bondRegimeOwnerState` seam.** `options.nominalCurve !== undefined`
  is the whole contract. Artifact resolution happens above it, in
  `buildBondRegimeToolRead`.
- **Do not add the artifact to the first-load set.** The set is enumerated at
  `scripts/selftest.mjs:6238-6240` and the artifact is a Node-side input, never fetched
  by `market-brief.html`.
- **Do not write a literal `tests/<name>.mjs` path into any file under `specs/`.**
  `scripts/validate-spec-test-paths.mjs:59` scans every artifact under `specs/**` for a
  repo-root-relative `tests/….mjs` token and fails on any path absent from disk and
  from `scripts/validate-spec-test-paths.baseline`. This design therefore names test
  files without the extension; `bubbles.plan` must create the file or add the path to
  the baseline in the same change that names it.

**Resolved decisions.**

- Freshness is derived from the artifact's **own observed as-of progression**, not from
  any calendar file (§ *Open Question 1*).
- The artifact carries the **full `source-provenance/v1` envelope per fetched
  response**, nested inside a family record that carries the model-facing fields the
  envelope's closed field list cannot hold (§ *Open Question 2*).
- Artifact resolution lives in `buildBondRegimeToolRead`, so the live read the selftest
  exercises and the read the pipeline publishes are the same code path.
- On acquisition failure a family is **carried forward verbatim** from the prior
  artifact — rows, envelopes and original `retrievedAt` untouched — and the read-time
  freshness rule judges it. Nothing is restamped.
- Retention is exactly the two calendar years the browser's merge holds, because
  `classifyInflationState` compares the **first and last** breakeven rows (§ D-1).

**Open questions.** Two remain, both non-blocking and both with named settling
evidence: the numeric magnitude of the observed publication gap, and the artifact's
measured byte size. Both are settled by the first acquisition run. See § *Open
Questions Remaining*.

---

## Purpose And Scope

Supply the two official Treasury curve families to the headless composition through the
seam that already exists, so the unchanged model can classify the families that
evidence actually covers.

In scope: server-side acquisition, the published artifact and its contract, the
read-time freshness admission, the consumption wiring, the validation gate, the
additive `rlcontracts.js` allowlist entries, and the test strategy.

Out of scope, and routed rather than absorbed: the credit axis (permanently, by policy
— `spec.md` Non-Goal 5), the sleeve-characteristic expiry (§ *Routed Concerns*, H-3),
and the browser tool's own source policy (FR-018-036).

---

## Open Question 1 — The Bond-Market Publication Calendar

**Resolved: freshness is derived from the artifact's own observed as-of progression. No
publication-calendar file is introduced, and `data/calendars/xnys/calendar.json` is not
read by this feature at all.**

### The rule

For each family, at read time, over the family's own committed rows:

1. `lastObserved` — the newest row date.
2. `elapsedDays` — whole calendar days from `lastObserved` to the run date, both UTC.
3. `observedGaps` — the calendar-day gaps between consecutive row dates over the
   trailing `cadenceWindowRows` rows.
4. `maxObservedGapDays` — the maximum of `observedGaps`.
5. `windowDays = maxObservedGapDays + publicationLagDays`, where `publicationLagDays`
   is `1` because Treasury posts a session's curve on the session date after the
   close, so a run before posting legitimately sees the prior date.
6. Verdict:
   - `observedGaps.length < minCadenceObservations` → **`undetermined`**, error code
     `BRL-CURVE-FRESHNESS-UNDERIVABLE`. Not current, not stale.
   - `elapsedDays <= windowDays` → **`current`**.
   - otherwise → **`stale`**, error code `BRL-CURVE-FAMILY-STALE`, reason naming
     `lastObserved`, `elapsedDays`, `windowDays` and the observed-gap basis.

`cadenceWindowRows` and `minCadenceObservations` are declared in the artifact's own
`freshnessPolicy` block, not hardcoded in a consumer, so FR-018-016 is satisfied by the
artifact declaring its own window.

### Why this rule and not a holiday list

- **It cannot be wrong about a holiday it has never heard of.** A bond-market closure
  appears in the data as a gap, so it widens `maxObservedGapDays` by itself. H-2's two
  concrete counterexamples — `2026-10-12` and `2026-11-11`, which the equity calendar
  marks `regular` — are absorbed with no list to maintain, because the equity calendar
  is never consulted.
- **It has no coverage cliff.** H-2's second defect is `coverageEnd: "2026-12-31"`. A
  rule derived from the artifact's own rows rolls forward with every acquisition; there
  is no external file to expire and no `2027-01-01` failure to schedule.
- **A weekend is structurally current, with no weekend special case.** Every weekend
  contributes a Friday-to-Monday gap of 3 days to `observedGaps`, so a Sunday run at
  `elapsedDays = 2` is inside the window by construction. BS-018-007 is satisfied by
  the shape of the rule rather than by a branch that could be deleted.
- **A live publication stoppage still goes stale.** The gap that would widen the window
  is only recorded once observations *resume*. During a stoppage the trailing max gap is
  still the old bounded value, so the family correctly goes stale. The rule cannot be
  fooled by the outage it is meant to detect.
- **It adds no supply-chain surface.** No new committed source, no new allowlist entry,
  no second fetch, and therefore nothing new to keep fresh.

### What replaces FR-018-020's out-of-coverage case

FR-018-020 requires a named absence when the run date falls outside the calendar's
coverage, defaulting neither to current nor to stale. Under an observed-cadence rule the
honest analogue is **insufficient observed history to derive a cadence** — fewer than
`minCadenceObservations` gaps — which yields `undetermined` and refuses both defaults.
The requirement's intent is preserved exactly; its stated *basis* changes from a
coverage range to an observation count.

This has a reader-visible consequence. The UX out-of-coverage variant in `spec.md`
renders *"The expected-publication calendar covers {coverageStart} to {coverageEnd} and
this run is outside it"*. Under this design the sentence must state the observation
count instead. That is a UX-owned wording change and is routed in § *Routed Concerns*,
not made here.

---

## Open Question 2 — Provenance Envelope Depth

**Resolved: the artifact carries the full `source-provenance/v1` envelope, one per
fetched response, nested inside a family record that carries the model-facing fields.
Both layers, not one or the other.**

### Why not the envelope alone

`rlcontracts.js:109-127` freezes `SOURCE_PROVENANCE_FIELDS` to seventeen names, and
`validateSourceProvenance` at `:517` calls `hasOnlyFields` and rejects anything else
with `unknown-field`. **Observation as-of is not among those seventeen.**
`sourcePublishedAt` is a timestamp describing the response, not the newest curve date
inside it. So an envelope-only design structurally cannot carry the *Observed as of*
column the UX `ProvenanceRow` requires, and cannot carry `rows`, `state` or `errorCode`
either. Envelope-only fails FR-018-010 and the UX contract at the same time.

### Why not the lighter `data/bars/*.json` form alone

`data/bars/SPY.json` carries `asof`, `fetched`, `src` and no validator. It has no host
allowlist, no `https` enforcement, no content hash, no access class and no retention
mode. BS-018-004 requires the source URL to be *"an https URL on the declared official
host"*; FR-018-012 requires content integrity; FR-018-015 requires the artifact to carry
no credential. The lighter form leaves all three to a bespoke gate, when the repository
already owns a frozen validator that enforces them mechanically:

- `rlcontracts.js:533-537` rejects any `sourceUrl` that is not `https:`, or that carries
  a username, a password or a fragment.
- `:541-546` rejects a host or path outside the frozen `SOURCE_POLICIES` entry.
- `:558` requires `contentSha256` to match `HASH_PATTERN`.
- `:559-560` binds `accessClass` to the policy's declared class.
- `validateRequestDescriptor:496` rejects any query key matching
  `/(?:authorization|cookie|credential|key|password|secret|token)/i` with
  `secret-shaped-request-field`.

That last one is decisive: **the frozen contract makes BS-018-001 and FR-018-003
mechanically unfalsifiable.** A credential cannot be recorded in a valid envelope, so an
acquisition that sent one could not produce a passing artifact. Re-deriving that in a
feature-local gate would be a second definition of a policy the repository already owns
once, against D4.

### Why the layering is the committed convention

`data/calendars/xnys/calendar.json` already does exactly this: domain fields
(`coverageStart`, `coverageEnd`, `rows`) at the top level, plus a nested `sourceRef`
holding the complete `source-provenance/v1` envelope. This design follows that shape
rather than inventing one.

### One envelope per response, not per family

FR-018-012 requires a content integrity value *for each acquired response*, and
`contentSha256` covers one response body. H-5 requires two calendar years per family.
Therefore `family.provenance` is an **array** of envelopes, one per fetched year, each
with its own `sourceUrl`, `requestDescriptor`, `retrievedAt` and `contentSha256`. A
single envelope per family would either hash one year and silently omit the other, or
hash a concatenation that corresponds to no retrievable document.

### The gap the frozen contract cannot close

Both Treasury source ids share one pathname —
`/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/{YEAR}/all`
— and differ only in the query value `type=daily_treasury_yield_curve` versus
`type=daily_treasury_real_yield_curve`. The frozen policy binds host, method and path
prefix, but not a query value to a source id. So a nominal envelope carrying a real-yield
URL would pass `validateSourceProvenance`.

The feature-local validation gate must therefore add the **source-id-to-query binding**
check. This is an addition on top of the shared contract, not a substitute for it, and
it is the one provenance check that legitimately belongs to this feature.

---

## Architecture Overview

```
ACQUISITION (network, Node, once per scheduled run)
  bond-regime-universe.json  sourcePolicies.{nominalCurve,realCurve}.urlTemplate
        │  {YEAR} → currentUTCYear, currentUTCYear-1     (4 requests total)
        ▼
  fetch (global fetch, User-Agent, no credential)
        ▼
  parseTreasuryCurveCsv          ← loaded by name from bond-regime-lab.html
        ▼
  merge by date, sort            ← same by-date collapse the browser performs
        ▼
  data/curves/us-treasury/curve.json     [committed artifact + provenance]
        │
        ├─ on family failure: carry the prior family forward verbatim
        │
════════╪═══════════ no network below this line ══════════════════════════════
        ▼
CONSUMPTION (offline, Node)
  readOfficialCurveArtifact(root)
        ▼
  admitCurveFamily(family, runDate)      ← observed-cadence freshness verdict
        │  current    → family passed through with state 'fresh'
        │  stale      → named absence, errorCode BRL-CURVE-FAMILY-STALE
        │  undetermined → named absence, BRL-CURVE-FRESHNESS-UNDERIVABLE
        │  absent/invalid → named absence, BRL-CURVE-ARTIFACT-{ABSENT,INVALID}
        ▼
  buildBondRegimeToolRead({ nominalCurve, realCurve })
        ▼
  bondRegimeOwnerState(root, { nominalCurve, realCurve, confirmations })   UNCHANGED
        ▼
  computeBondLabViewModel(config, snapshot, assumptions, {})               UNCHANGED
        ▼
  market-brief.payload.json  toolReads['bond-regime-lab']
```

Three boundaries carry the whole design:

1. **The network line.** Everything below it is a pure function of committed files and
   the run date. This is what makes the published read reproducible (NFR *Determinism*,
   NFR *Offline composition*).
2. **The admission line.** Freshness is decided *before* injection, so
   `computeBondLabViewModel` never sees a row it must not classify and needs no change.
   The model's own `state !== "unavailable"` test at `:2152-2153` continues to be the
   only gate it applies.
3. **The classification line.** No code in `scripts/` decides a curve state, an impulse,
   an inflation state or a posture. `scripts/owner-state.mjs:419-420` already states
   that boundary; this feature does not move it.

### Where artifact resolution lives, and why

Resolution happens inside `buildBondRegimeToolRead`, when `deps.nominalCurve` is
`undefined` — mirroring the precedence `bondRegimeOwnerState` already uses.

The alternative was to resolve one level up, in the pipeline caller at
`scripts/brief-refresh.mjs:1857`. That was rejected because
`scripts/selftest.mjs:5468` builds its live read with a bare
`refresh.buildBondRegimeToolRead()`. Resolving above that call would make the suite's
"live" read structurally different from the read that actually publishes — the suite
would assert an absence the pipeline no longer produces. Resolving inside keeps one code
path and keeps the suite honest.

---

## Capability Foundation

The proportionality trigger `spec.md` identifies is correct: this is a **second
implementation of an existing capability**. The capability is defined once, above both
paths.

**Capability — official curve evidence supply.** Turning a public official daily
yield-curve publication into dated, provenanced, policy-classified rows the bond model
can consume, independently of which runtime performed the acquisition.

**Foundation-owned contracts.**

| Contract | Definition | Owner |
| --- | --- | --- |
| Family record | `{ state, rows, observedAt, retrievedAt, sourceId, sourceUrl, rights, persistence, errorCode }` | `bond-regime-lab.html:1678-1679` defines it; `scripts/owner-state.mjs:405-411` reproduces it for absence. Both paths emit exactly this. |
| Row shape | nominal `date,y3m,y2,y5,y10,y30`; real `date,y5,y10,y20,y30` | `parseTreasuryCurveCsv:1533` — a closed set, whole-family rejection on any missing column |
| Merge rule | by-date collapse across two calendar years, ascending sort | `bond-regime-lab.html:1673-1677` |
| Breakeven derivation | exact common date, nominal `y10` minus real `y10` | `deriveBreakevenRows:1493-1505` |
| Provenance | `source-provenance/v1` envelope per response | `rlcontracts.js:515-566` |

**Foundation-owned policies.** A family is `unavailable` unless the publication yielded
usable rows. Rights travel with the family and are never upgraded. A restricted family
is never produced by the server path. Every family carries source id, source URL,
observation as-of and retrieval time.

### Concrete Implementations

| | Browser-live | Server-published |
| --- | --- | --- |
| Trigger | tab load / explicit refresh | scheduled headless run |
| Transport | `fetchTreasuryText` in-page | Node global `fetch` with `User-Agent` |
| Coverage | `currentUTCYear`, `currentUTCYear - 1` | identical, at write time |
| Retention | `localStorage` key `rlTreasuryCurves`, `persistence: browser-cache` | committed JSON, `persistence: same-origin-artifact` |
| Degrade | prior cache marked `stale`, **rows still classified** | prior family carried forward, **admission decides** |
| Provenance | `sourceId` + `sourceUrl` on the family | full envelope array + family record |
| Freshness | none — the browser applies no window | observed-cadence admission |

### Variation Axes

1. **Runtime and transport** — in-page `fetch` under CORS versus Node `fetch` with no
   CORS, giving the server path a two-year merge the browser must also perform.
2. **Retention and rights expression** — ephemeral browser cache versus a committed
   file, which is why `persistence` differs while `rights` does not.
3. **Degrade policy** — the browser classifies cached-stale rows; the server withholds
   out-of-window rows. This is the only axis on which the two paths reach different
   *inputs*, and § *Parity* states exactly how that is prevented from becoming a
   different *verdict*.
4. **Provenance depth** — a family-level source id in the browser versus a validated
   per-response envelope in the artifact, because only the artifact is audited offline
   by A-5 with no network available.

---

## The Published Artifact

**Path.** `data/curves/us-treasury/curve.json`

`data/` is where committed fetched evidence lives (`data/bars/`, `data/options/`,
`data/calendars/xnys/`). Root-level JSON is model configuration and published payloads;
this is neither. One file holds both families because they are acquired, validated and
consumed as one unit, and because each family carries its own independent state, which
is what FR-018-007 actually requires.

**Contract version.** `official-curve-artifact/v1`.

### Shape

```jsonc
{
  "contractVersion": "official-curve-artifact/v1",
  "artifactId": "us-treasury-daily-curves",
  "generator": "acquire-official-curves/v1",
  "writtenAt": "2026-08-10T21:05:11.402Z",     // canonical timestamp, this write
  "coverageYears": [2025, 2026],               // the merge window actually held
  "freshnessPolicy": {
    "policyId": "observed-cadence/v1",
    "cadenceWindowRows": 250,
    "minCadenceObservations": 60,
    "publicationLagDays": 1
  },
  "families": {
    "nominal": { /* family record */ },
    "real":    { /* family record */ }
  }
}
```

### Family record

```jsonc
{
  "familyId": "nominal",
  "sourceId": "us-treasury-nominal",
  "state": "fresh",                            // acquisition outcome: fresh | unavailable
  "rows": [ { "date": "2026-08-07", "y3m": 4.25, "y2": 3.88,
              "y5": 3.9, "y10": 4.21, "y30": 4.75 } ],
  "observedAt": "2026-08-07",                  // newest row date — the publisher's date
  "retrievedAt": "2026-08-10T21:05:09.881Z",   // when THESE rows were fetched
  "rights": "public-official",                 // verbatim from bond-regime-universe.json
  "persistence": "same-origin-artifact",       // what THIS copy is
  "errorCode": null,
  "declaredPolicy": {                          // the universe's words, unaltered
    "id": "us-treasury-nominal",
    "mode": "public-official-live",
    "rights": "public-official",
    "persistence": "browser-cache"
  },
  "carriedForward": false,
  "provenance": [ /* source-provenance/v1 envelope, one per fetched year */ ]
}
```

**The `persistence` decision.** FR-018-011 requires the declared rights and persistence
classes to travel unaltered. `bond-regime-universe.json` declares
`persistence: "browser-cache"`, which is a true statement about the browser copy and a
false one about a file on disk. This design carries the declared block verbatim under
`declaredPolicy` and states the copy's actual retention in `persistence`, following
`scripts/owner-state.mjs:466` which already writes
`persistence: 'same-origin-snapshot'` for committed bars. `rights` is carried unaltered
in both places, and FR-018-036 holds because the browser policy is not touched. This is
a requirement interpretation and `bubbles.plan` should carry it into the scope DoD
rather than let an implementer rediscover it.

### Provenance envelope, per fetched year

```jsonc
{
  "contractVersion": "source-provenance/v1",
  "sourceId": "us-treasury-nominal",
  "adapterId": "treasury-daily-curve-acquisition",
  "adapterVersion": "official-curve-acquisition/v1",
  "sourceKind": "official-report",
  "sourceUrl": "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/2026/all?type=daily_treasury_yield_curve&field_tdr_date_value=2026&page&_format=csv",
  "requestDescriptor": {
    "method": "GET",
    "path": "/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/2026/all",
    "query": { "type": "daily_treasury_yield_curve",
               "field_tdr_date_value": "2026", "page": "", "_format": "csv" }
  },
  "sourcePublishedAt": null,
  "retrievedAt": "2026-08-10T21:05:09.881Z",
  "contentSha256": "sha256:…",                 // of the exact response body
  "accessClass": "public-official",
  "sourceUsePolicyId": "source-use-policy/us-treasury-daily-curve/v1",
  "sourceUseReviewRef": "reviews/source-use/us-treasury-daily-curve/v1",
  "retentionMode": "normalized-facts-and-hash",
  "freshnessPolicy": "observed-cadence/v1",
  "freshnessState": "current",
  "diagnostics": []
}
```

Four constraints the frozen validator imposes, each verified against
`rlcontracts.js` during authoring:

- `sourceKind` must be one of four frozen values (`:65-70`). `official-report` fits a
  daily yield-curve publication, so **no additive `SOURCE_KINDS` entry is needed** and
  H-4's second option is not exercised.
- `retrievedAt` must match `CANONICAL_TIMESTAMP_PATTERN` — `\.\d{3}Z` exactly.
  `new Date().toISOString()` produces that form.
- `diagnostics[]` entries must match `SAFE_REASON_PATTERN` = `^[a-z0-9][a-z0-9-]*$`
  (`:8`). So `carried-forward-from-prior-artifact` is a valid diagnostic and
  `BRL-CURVE-FAMILY-STALE` is not. The uppercase `BRL-*` codes belong in the family
  record's `errorCode`, matching the existing vocabulary at
  `scripts/owner-state.mjs:484-485`. **Two vocabularies, two homes, no overlap.**
- `sourceUseReviewRef` is an identifier, not a path. No `reviews/` directory exists in
  the repository, and the committed XNYS envelope already uses the same form.

### Carry-forward rule

When a family's acquisition fails and a prior artifact exists, the prior family record
is copied **verbatim** — `rows`, `observedAt`, `retrievedAt` and every `provenance`
envelope byte-identical — with two additions: `carriedForward: true`, and a
`carried-forward-from-prior-artifact` diagnostic appended to a family-level diagnostics
list. `retrievedAt` is **never** restamped, because restamping would assert a fetch that
did not happen — the same reasoning `scripts/owner-state.mjs:403-404` already gives for
leaving `retrievedAt` null on an absence.

A carried-forward family is not automatically stale. The read-time admission decides,
so a Sunday carry-forward stays current and a week-old carry-forward does not.

### Retention

Retain exactly `currentUTCYear` and `currentUTCYear - 1` at write time — the identical
window `bond-regime-lab.html:1665-1668` holds. **Not** a row count, and **not** a
trailing-days window. See § D-1 for why this is a correctness rule and not a size rule.

---

## D-1 — Retained Window Is A Parity Requirement, Not Only A Coverage One

H-5 states that a one-year artifact would starve the 21-session impulse window. The
constraint is stronger than that.

`classifyInflationState` at `bond-regime-lab.html:1697-1699` reads:

```js
var first = rows[0], latest = rows[rows.length - 1];
var realChange = (latest.realYieldPct - first.realYieldPct) * 100;
var breakevenChange = (latest.breakevenPct - first.breakevenPct) * 100;
```

It compares the **first and last** breakeven rows. So the inflation classification is a
direct function of *how much history the retained window holds*. Two compositions
holding different windows will reach different `realYieldChangeBp`,
`breakevenChangeBp` and therefore different `inflationState`, and — because
`classifyDurationPosture` takes inflation state as an input — potentially a different
`durationPosture`. That is a genuine `Differ`, not a rounding difference.

Two consequences:

1. **Retention must match the browser's window exactly**, which is why the rule is
   "the two calendar years the browser holds", not "keep 500 rows".
2. **Window equality is a precondition of live comparability.** A carried-forward
   December artifact read on 2 January holds `[2025, 2026]` while the browser holds
   `[2026, 2027]`. Comparing them would manufacture a disagreement out of an honest
   difference of coverage. The live parity line must therefore render *Cannot be
   compared* with a sixth named reason — *the two compositions hold different
   observation windows* — which is why the artifact publishes `coverageYears`
   explicitly. That sixth reason is a UX-owned addition and is routed in § *Routed
   Concerns*.

The frozen-input differential test is unaffected: it hands both compositions the same
rows, so the windows are equal by construction.

---

## The Tier-A Acquisition Step

**Module.** `scripts/acquire-official-curves.mjs` — a Node module invoked by
`scripts/brief-refresh.mjs` before tool-read assembly, and directly runnable with
`node` for repair. One implementation, two entry points.

**Why inside the scheduled refresh and not a separate schedule.** Two schedules would
drift, and § D-1 makes window alignment between the artifact and the run a correctness
property rather than a convenience. `scripts/fetch-bars.mjs` is a standalone command
because bars feed many tools; this artifact feeds one read in the same run. This
resolves `spec.md` open question 4.

### Steps

1. **Resolve URLs.** Read `sourcePolicies.nominalCurve.urlTemplate` and
   `sourcePolicies.realCurve.urlTemplate` from `bond-regime-universe.json` and
   substitute `{YEAR}` with `currentUTCYear` and `currentUTCYear - 1`. No URL is
   written into `scripts/`; there remains exactly one definition (FR-018-002, D4).
2. **Fetch.** Four `GET` requests, global `fetch`, `User-Agent` header only. No
   `Authorization`, no cookie, no query key matching the credential regex. A non-`ok`
   status or a transport error yields `null` for that response, following
   `yahooRows`.
3. **Hash.** `sha256` over the exact response body text, before parsing, so the hash
   corresponds to a retrievable document.
4. **Parse.** `parseTreasuryCurveCsv(text, kind)`, loaded by name via
   `loadToolFunctions('bond-regime-lab.html', ['finiteNumber', 'parseTreasuryCurveCsv'])`.
   `finiteNumber` is included because the parser closes over it. The parser's own
   whole-family rejection on a missing maturity column is the behaviour relied on for
   BS-018-005; it is not re-implemented and not softened.
5. **Merge.** Collapse by date into a map, then sort ascending — the identical
   transformation at `bond-regime-lab.html:1673-1677`. A year whose response failed
   contributes nothing; a year that parsed contributes its rows.
6. **Compose the family.** `state: 'fresh'` with `observedAt` set to the newest row
   date when at least one response parsed and the merged set is non-empty; otherwise
   carry forward, or emit the named absence when there is nothing to carry.
7. **Write.** One atomic write of the whole artifact. Under `--dry-run`
   (`scripts/brief-refresh.mjs:1875`) nothing is written and the prior artifact is read
   unchanged.
8. **Read back.** The consumption path reads the committed file rather than reusing the
   in-memory result, so the published read is reproducible from the file alone.

### Degradation, matched to the browser and stated where it differs

`bond-regime-lab.html:1687-1688` falls back to the prior cached family marked `stale`,
and the model then classifies those rows. The headless equivalent is the prior committed
artifact — H-6's point — but the two differ in one respect and the difference is
deliberate:

| | Browser | Headless |
| --- | --- | --- |
| Fallback store | `localStorage` `rlTreasuryCurves` | prior `data/curves/us-treasury/curve.json` |
| Marked | `state: "stale"` at fallback time | `carriedForward: true`, state unchanged |
| Rows classified? | **Yes** — `:2152` admits any state but `unavailable` | **Only if the admission says `current`** |
| Freshness window | none | observed cadence |

The headless path is stricter, which is what FR-018-031 requires. The divergence is
confined to *which rows are admitted*; it never produces two different classifications
from one admitted set. When it causes the two compositions to hold different evidence,
the parity line reports *Cannot be compared* with its reason — never *Agree*, and never
a silent `Differ`.

---

## The Consumption Path

### `scripts/owner-state.mjs`

Two additive exports. `bondRegimeOwnerState` itself is **unchanged**.

- `unavailableCurveFamily` is promoted from module-private to exported, so the artifact
  reader and the tests construct the canonical named absence rather than a second
  hand-written one. Its shape and its `retrievedAt: null` rule are untouched.
- `officialCurveArtifact(root)` reads and JSON-parses
  `data/curves/us-treasury/curve.json`, returning `null` when absent or unparsable. It
  assembles inputs only — no classification, no freshness verdict — preserving the
  boundary stated at `:419-420`.

### `scripts/brief-refresh.mjs`

`buildBondRegimeToolRead` resolves curves before calling `bondRegimeOwnerState`:

```
nominalCurve = deps.nominalCurve !== undefined
  ? deps.nominalCurve
  : admitCurveFamily(artifact, 'nominal', runDate)
```

and identically for `realCurve`. The resolved families are then passed into
`OWNER.bondRegimeOwnerState(root, { config, confirmations, nominalCurve, realCurve })`
— **the existing seam, unwidened** (FR-018-022). The explicit-`deps` branch is
unchanged, so every injection-based adversarial case in `scripts/selftest.mjs` keeps its
exact current semantics.

`admitCurveFamily` returns either the artifact's family record with `state: 'fresh'`,
or `unavailableCurveFamily(policy, code)` extended with an additive `admission` block:

```jsonc
"admission": {
  "verdict": "stale",                        // current | stale | undetermined | absent | invalid
  "errorCode": "BRL-CURVE-FAMILY-STALE",
  "lastGoodObservedAt": "2026-07-29",
  "elapsedDays": 12,
  "windowDays": 5,
  "basis": "observed-cadence over 250 trailing rows"
}
```

The `admission` block is inert to the model — `computeBondLabViewModel` reads only
`.state`, `.rows` and `.observedAt`, and `hasOnlyFields` does not apply to family
records — and it is what lets the renderer distinguish `◐ Stale` from `○ Unavailable`
(UX `FamilyStateToken`) without the model carrying a reader concern. It is surfaced in
the tool-read metrics as an additive `curveAdmission` field, satisfying FR-018-038.

### Published metrics

No metric is renamed or removed. `curveState`, `curveImpulse`, `inflationState` and
`curveAsOf` change *value*, not shape. `curveAdmission` is added. `evidenceGaps` is
still computed at `scripts/brief-refresh.mjs:1554-1558` from the model's own states, so
the gap list narrows by itself when the families resolve — no gap string is edited.

---

## Failure Behavior

| Case | Detected by | Family state | Model-facing | Error code | Published |
| --- | --- | --- | --- | --- | --- |
| **Fetch failure** (transport, non-`ok`) | acquisition step 2 | carry forward if a prior family exists, else `unavailable` | rows admitted only if the carried family is `current` | `BRL-CURVE-FETCH-FAILED` in family diagnostics; `BRL-CURVE-NOMINAL-UNAVAILABLE` / `BRL-OPTIONAL-UNAVAILABLE` when nothing to carry | the other family is untouched (FR-018-007) |
| **Malformed CSV** (unparsable, <2 lines, no valid rows) | `parseTreasuryCurveCsv` returns `ok: false` | that year contributes nothing; family `unavailable` if no year parsed | withheld | `BRL-CURVE-PARSE-FAILED` | named absence, zero rows |
| **Missing required maturity column** | `parseTreasuryCurveCsv:1533` `missingHeaders` non-empty | **whole family** `unavailable`, `rows: []` | withheld | `BRL-CURVE-MATURITY-MISSING`, with the missing header names | BS-018-005: never partial, never substituted; the other family unaffected |
| **Out-of-window staleness** | `admitCurveFamily`, read time | artifact keeps its rows; admission verdict `stale` | withheld | `BRL-CURVE-FAMILY-STALE` | UX Screen 2: `◐ Stale`, last-good date shown and explicitly not current |
| **Freshness underivable** (< `minCadenceObservations` gaps) | `admitCurveFamily` | rows present, verdict `undetermined` | withheld | `BRL-CURVE-FRESHNESS-UNDERIVABLE` | neither current nor stale; `○ Unavailable` with the observation-count reason |
| **Absent artifact** | `officialCurveArtifact` returns `null` | n/a | `unavailableCurveFamily(...)` | `BRL-CURVE-ARTIFACT-ABSENT` | byte-comparable in kind to today's read (FR-018-030) |
| **Invalid artifact** (gate fails) | validation gate + a read-time contract check | n/a | `unavailableCurveFamily(...)` | `BRL-CURVE-ARTIFACT-INVALID` | **no row reaches the model** (FR-018-033); reason names the failure class, never a URL fragment or a value |

Every row of this table publishes a named reason and a code. None publishes a zero, an
empty-but-plausible family, or a neutral placeholder (FR-018-034). An acquisition
failure degrades the bond read alone and never fails the wider brief publication
(NFR *Failure isolation*), because acquisition is wrapped exactly as the existing
per-tool builders are.

---

## Contract Extensions

All additive. No existing field, source id, error code, cache key or contract version is
renamed or removed (FR-018-038, D6).

**`rlcontracts.js` — two `SOURCE_IDS` keys and two `SOURCE_POLICIES` entries.**

```js
"us-treasury-nominal": true,
"us-treasury-real": true
```

```js
"us-treasury-nominal": Object.freeze({
  sourceKind: "official-report", accessClass: "public-official",
  host: "home.treasury.gov", method: "GET",
  pathPrefix: "/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/"
}),
"us-treasury-real": Object.freeze({ /* identical shape, own id */ })
```

`pathPrefix` rather than `path`, because the pathname embeds the year — the form
`yahoo-chart` already uses, and the form H-4 predicted. `SOURCE_KINDS` needs no
addition. The two entries are byte-identical apart from their key, which is why the
source-id-to-query binding check belongs to the feature-local gate (§ *Open Question 2*).

**New contract versions.** `official-curve-artifact/v1`, `observed-cadence/v1`
(freshness policy), `official-curve-acquisition/v1` (adapter version).

**New error codes.** `BRL-CURVE-ARTIFACT-ABSENT`, `BRL-CURVE-ARTIFACT-INVALID`,
`BRL-CURVE-FAMILY-STALE`, `BRL-CURVE-FRESHNESS-UNDERIVABLE`, `BRL-CURVE-FETCH-FAILED`,
`BRL-CURVE-PARSE-FAILED`, `BRL-CURVE-MATURITY-MISSING`. The two existing family codes
`BRL-CURVE-NOMINAL-UNAVAILABLE` and `BRL-OPTIONAL-UNAVAILABLE` keep their exact current
meaning and remain the codes the model-facing family record carries.

---

## The Validation Gate

`scripts/validate-official-curves.mjs`, joining the `scripts/validate-*.mjs` family and
following `scripts/validate-brief-cache.mjs`: accumulate named errors, print them all,
exit non-zero. No `--skip`, no `--force`, no `--ignore` — consistent with
`scripts/validate-spec-test-paths.mjs:41-44`.

Checks, each with its own named failure:

1. File parses; `contractVersion === "official-curve-artifact/v1"`.
2. Both families present; each carries every required field.
3. Each family's `state` is `fresh` or `unavailable`; `errorCode` is non-null whenever
   `state` is not `fresh` (FR-018-009).
4. Every `provenance` entry passes `validateSourceProvenance` from `rlcontracts.js` —
   which enforces `https`, host, path prefix, method, hash form, access class,
   retention mode and the credential-shaped-query rejection.
5. **Source-id-to-query binding**: a `us-treasury-nominal` envelope carries
   `type=daily_treasury_yield_curve`; a `us-treasury-real` envelope carries
   `type=daily_treasury_real_yield_curve`. The gap the frozen contract cannot close.
6. `sourceId` matches `bond-regime-universe.json`'s declared id for that family, and
   `declaredPolicy` equals the committed policy block verbatim.
7. `coverageYears` has exactly two consecutive years and every row date falls inside
   them.
8. Rows are date-ascending, date-unique, and carry the family's full required maturity
   set — no partial row.
9. `observedAt` equals the newest row date, or is `null` when `rows` is empty.
10. **Rights and restriction sweep**: no `oas`, no `financialConditions`, no
    `restricted-local-view`, no host other than `home.treasury.gov`, and no key or value
    matching the credential-shaped regex anywhere in the artifact (FR-018-015,
    BS-018-002, BS-018-018).
11. `contentSha256` is present and well-formed for every envelope. It is not re-verified
    against a live fetch, because the gate must run offline; the hash is an audit anchor
    for A-5, and the design says so rather than implying a stronger guarantee.

Wiring: the gate joins the existing validator set that `node scripts/selftest.mjs`
drives, and refusing artifact consumption on gate failure is enforced independently at
read time — an artifact that fails the gate must not reach the model even if the gate
was not run in that process (FR-018-033).

---

## Repository Weight And The First-Load Budget

**The artifact is not a first-load resource.** The budgeted first-load set is enumerated
at `scripts/selftest.mjs:6238-6240`: `market-brief.config.page.json`,
`market-brief.page.json`, `watchlist.json`, `brief-history.recent.jsonl`,
`market-brief.snapshot.page.json`, `market-brief.tools.page.json`,
`market-brief.scorecard.json`. Measured during authoring, that set totals **175,359
bytes against the committed `briefFirstLoadMaxBytes` of 204,800** — 29,441 bytes of
headroom. `data/curves/us-treasury/curve.json` is read by Node during publication and is
never fetched by `market-brief.html`, so it enters neither that set nor
`tool-experience.config.json`'s `artifactBudgets` block, whose keys are exact-matched at
`rlexperience.js:489`. Adding a key there would be a contract change, not a budget
update.

**Effect on the budgeted artifacts.** The tool-read entry's fields already exist;
`curveState`, `curveImpulse` and `inflationState` change from `"Unavailable"` to a
classification, `curveAsOf` from `null` to a date, and `evidenceGaps` **shrinks** from
three strings to one. The single net addition is the `curveAdmission` block, in the low
hundreds of bytes. The change is comfortably inside the measured headroom, and the
existing budget assertion is the test that proves it (D7).

**Artifact size, estimated.** Two families × two calendar years ≈ 500 rows each. A
nominal row serializes to roughly 75 bytes and a real row to roughly 62; four provenance
envelopes add roughly 3 KB. That gives an estimate near **72 KB**, comparable to
`data/calendars/xnys/calendar.json`. This is arithmetic over a known row shape, not a
measurement — the first acquisition run settles it, and `bubbles.plan` should record the
measured figure rather than this estimate.

**Growth is bounded by the retention rule**, not by an append log: every write replaces
the two-year window, so the file's size is stationary rather than monotonic
(NFR *Repository weight*).

---

## Security, Rights And Compliance

- **No credential can exist in a valid artifact.** `validateRequestDescriptor:496`
  rejects a query key matching `authorization|cookie|credential|key|password|secret|token`,
  and `validateSourceProvenance:533` rejects a `sourceUrl` carrying a username or
  password. The acquisition sends only a `User-Agent`.
- **No restricted family is touched.** The acquisition module reads only
  `sourcePolicies.nominalCurve` and `sourcePolicies.realCurve`. `oas` and
  `financialConditions` are never read, never fetched, never written — enforced
  positively by the module's closed family list and negatively by gate check 10.
- **No FRED, ICE or licensed endpoint.** The only URLs are derived from the two
  committed templates. `scripts/selftest.mjs:1775` already scans the bond source policy
  for `api_key`, `fredgraph`, `series/BAML` and `series/NFCI`; that assertion is
  unchanged and continues to bind, because this feature adds no policy URL.
- **Secret hygiene.** There are no credentials in scope and none is introduced. No
  command in this feature echoes an environment variable value.
- **Reader-facing reasons carry no payload.** The validation-failure reason names a
  failure class, never a URL fragment or an observed value, because echoing one would
  publish it (BS-018-018).

---

## Determinism And Observability

- **Reproducible.** Given the same artifact and the same run date, the read is
  identical: acquisition is the only network step, and the consumption path reads the
  committed file rather than an in-memory result.
- **Run-date dependence is explicit.** The admission verdict is a function of
  `(artifact, runDate)` and is recomputed at every read rather than baked in at write
  time. A stale artifact self-reports stale without being rewritten — which is also
  what keeps the live assertions in § *Testing* honest instead of flaky.
- **Traceable offline.** Every published curve number resolves to a source id, a source
  URL, an observation date and a retrieval time inside the repository, with no network
  (NFR *Auditability*, UC-018-006).
- **Diagnostics are structured.** Family-level diagnostics use the lowercase-hyphen
  `SAFE_REASON_PATTERN` vocabulary; operator-facing codes use the uppercase `BRL-*`
  vocabulary. Neither leaks into the other's field.

---

## Testing And Validation Strategy

Per `bubbles-test-integrity`: curve values are live, so **every assertion is structural**
— shape, state, provenance, named reason, or an equality between two computed results.
No assertion pins a yield, a spread in basis points, or a classification word to a
literal. Test file names below omit the `.mjs` extension deliberately, because
`scripts/validate-spec-test-paths.mjs` fails on a `tests/….mjs` token that does not yet
exist on disk; `bubbles.plan` must create the file or baseline the path in the same
change.

### The differential test — one model, two compositions

The proof for BS-018-011, BS-018-012 and FR-018-024. New file
`tests/official-curve-parity` (Node `--test`):

1. Build one frozen input set: nominal and real rows over a fixed synthetic date range,
   with fixed values, and a fixed `bond-regime-universe.json` clone. No wall clock, no
   network, no committed artifact.
2. **Browser composition** — load `computeBondLabViewModel` and its helpers from
   `bond-regime-lab.html` via `loadToolFunctions`, hand it an observed snapshot built
   the way `mergedSnapshot` builds one at `bond-regime-lab.html:2395-2404`.
3. **Headless composition** — write the same rows into a temporary artifact, run the
   real consumption path over it, and let `buildBondRegimeToolRead` reach its verdict.
4. Assert `curveState.state`, `curveImpulse.state`, `inflationState.state` and
   `durationPosture.state` are **pairwise equal** — an equality between two computed
   values, never a comparison to a literal.
5. **Coverage variation.** Repeat with a January run date and a two-calendar-year input,
   then again with the prior year removed, and assert the two-year case yields a
   `curveImpulse` that is not `"Unavailable"` while the one-year case does — proving the
   H-5 window requirement is load-bearing rather than decorative.
6. **Adversarial.** Perturb one row in the headless input only, and assert the two
   compositions now differ. Without this, an assertion comparing two calls into the same
   loaded module would pass even if the headless path silently ignored its own input.

### Freshness tests — `tests/official-curve-freshness`

Structural, clock-injected, no live dates:

- A Friday `lastObserved` with a Sunday run over a row history whose gaps include
  weekends → verdict `current`, no staleness reason (BS-018-007).
- A row history whose gaps include a four-day bond-holiday gap, run on the day after
  such a holiday → verdict `current`, **and** assert the equity calendar file is not
  read in the process (BS-018-008, H-2). The negative assertion is the one that matters:
  a rule that happened to be right while still reading the wrong file would be a latent
  defect.
- An `elapsedDays` one over `windowDays` → `stale` with `lastGoodObservedAt`,
  `elapsedDays`, `windowDays` and a non-empty reason (BS-018-009).
- **The boundary from both sides**, following the pattern at
  `scripts/selftest.mjs:5610-5613`: `elapsedDays === windowDays` is `current` and
  `windowDays + 1` is `stale`. Without both sides the window could be widened to
  infinity and every other case would stay green.
- Fewer than `minCadenceObservations` gaps → `undetermined`, and assert it is **neither**
  `current` **nor** `stale` (BS-018-010, FR-018-020).
- A live publication stoppage: a history with a bounded max gap and a long
  `elapsedDays` → `stale`, proving the rule cannot be widened by the outage it detects.

### Artifact and provenance tests — `tests/official-curve-artifact`

- A fresh family carries source id, an `https` source URL on `home.treasury.gov`, an
  observation as-of and a retrieval time (BS-018-004). Assert the URL's scheme and host
  structurally, not its full string.
- Every provenance envelope passes the real `validateSourceProvenance` (BS-018-004).
- **Adversarial**: a nominal envelope carrying the real-yield query passes
  `validateSourceProvenance` and is rejected by the feature gate — the check that proves
  the binding gap is actually closed.
- **Adversarial**: an envelope with `?api_key=…` is rejected with
  `secret-shaped-request-field`, so BS-018-001 is proven mechanically rather than by
  inspection.
- A real-yield response missing a configured maturity column → real family `unavailable`
  with its code and **zero** rows, nominal family unaffected and still carrying full
  provenance (BS-018-005, BS-018-006).
- Carry-forward preserves `retrievedAt` and every envelope byte-identically and sets
  `carriedForward: true`.
- Full-artifact sweep for `oas`, `financialConditions`, `restricted-local-view` and any
  non-Treasury host (BS-018-002, BS-018-018).

### Consumption tests — `tests/official-curve-consumption`

- Absent artifact → the read is the named-absence form, the three curve families are
  `Unavailable`, and both curve gaps are named (BS-018-015).
- Gate-failing artifact → **zero** rows reach the model, and the reason names the
  validation failure class and contains no URL fragment (BS-018-016, FR-018-033).
- Stale artifact → rows withheld, `curveAsOf` is `null`, and the admission block carries
  the staleness reason (FR-018-029, FR-018-031).
- Fresh artifact, no credit observation → `durationPosture` is not `Indeterminate`,
  `creditRegime` **is** `Indeterminate`, published `state` is `unavailable`, and the gap
  list is the credit gap alone (BS-018-017, FR-018-035). This is the ADVERSARIAL 2 shape
  already committed at `scripts/selftest.mjs:5670-5682`.
- Inverted level with no impulse and no inflation state → posture is neither `Shorten`
  nor `Extend` (BS-018-013). Assert against the posture vocabulary, not a literal.
- A nominal date with no matching real date → **no** breakeven row for that date, and
  the breakeven row count equals the exact common-date count (BS-018-014).

### Reconciling the committed assertions in `scripts/selftest.mjs`

This is the part a plan must not discover late. Three committed blocks are affected, and
each change makes the suite **more** explicit, never weaker.

1. **`bondLive` at `:5638-5648`** asserts both axes unresolved, `curveState ===
   'Unavailable'` and the curve gap named. Once the artifact ships and admission passes,
   that is no longer the live outcome. The replacement must be a **branch on the
   artifact's own admission verdict**, asserting an implication rather than a fixed
   result:
   - admitted → `durationPosture !== 'Indeterminate'`, the curve gap absent,
     `curveState` a member of the model's curve-state vocabulary rather than a literal;
   - refused → `durationPosture === 'Indeterminate'`, the curve gap named, **and** the
     admission block carrying a non-empty reason and code.

   Both branches assert something; neither is a free pass. This is also what prevents a
   time-dependent flake when the committed artifact ages past its window between runs —
   the outcome changes, the assertion does not.
2. **`assert(/so the credit call and the duration call cannot be made/.test(bondLive.read))`
   at `:5697-5698`** is the same reconciliation and moves into the refused branch.
3. **ADVERSARIAL 3 at `:5686`** calls `buildBondRegimeToolRead({ config, confirmations })`
   with no curve keys and relies on the repository *happening* to hold no artifact. It
   must pass explicit named absences instead, so the case states the absence it means.
   ADVERSARIAL 1, 2 and 4 pass explicit families or an explicit `snapshot: null` and are
   **unchanged**.
4. The block comment at `:5615-5622` — *"the repo commits only the credit price ratio"*
   — becomes untrue on the day the artifact lands and must be updated in the same
   change (D8).

None of this weakens the refusal. The force of the block comes from ADVERSARIAL 1, 2 and
3 driving the same builder with families explicitly present and explicitly absent, and
all three keep that structure. The live read simply moves from the both-axes-unresolved
case to the curve-only case the suite already anticipates.

### Scenario-to-test mapping

| Scenario | Test surface | Assertion class |
| --- | --- | --- |
| BS-018-001, BS-018-003 | `tests/official-curve-artifact` + existing `scripts/selftest.mjs:1775` | credential-shaped rejection; policy scan |
| BS-018-002, BS-018-018 | `tests/official-curve-artifact` | full-artifact restricted-value sweep |
| BS-018-004 | `tests/official-curve-artifact` | envelope validity, scheme and host |
| BS-018-005, BS-018-006 | `tests/official-curve-artifact` | whole-family rejection; family independence |
| BS-018-007, BS-018-008 | `tests/official-curve-freshness` | verdict `current`; equity calendar not read |
| BS-018-009, BS-018-010 | `tests/official-curve-freshness` | `stale` with reason; `undetermined` neither-nor; both boundary sides |
| BS-018-011, BS-018-012 | `tests/official-curve-parity` | pairwise equality; coverage variation; perturbation |
| BS-018-013, BS-018-014 | `tests/official-curve-consumption` | posture vocabulary; exact common-date count |
| BS-018-015, BS-018-016 | `tests/official-curve-consumption` | named absence; zero rows admitted |
| BS-018-017 | `tests/official-curve-consumption` + `scripts/selftest.mjs:5670-5682` | axis split, state `unavailable`, single gap |

---

## Routed Concerns

Each of these is real, is owned by someone other than this design, and is routed rather
than silently absorbed.

**R-1 — Sleeve-characteristic expiry (H-3). Out of scope; route to a separate spec.**
Every instrument's `carry`, `rateDuration`, `spreadDuration` and `convexity` in
`bond-regime-universe.json` carries `asOf: "2026-07-10"` with `reviewWindowDays: 45`,
expiring **2026-08-24**. `notes/bond-regime-lab.md:70` states a stale characteristic
makes a sleeve *Not rankable*, and `scripts/selftest.mjs:5630-5636` re-stamps those
dates in its own fixture for exactly that reason. This is an independent second cause of
an unresolved published bond read: after this feature ships, an expired characteristic
set would leave the read unresolved for a reason that has nothing to do with curves.
This design does **not** change the staleness rule, does **not** re-stamp the committed
universe, and does **not** absorb the refresh into this feature's scope. It belongs to a
characteristic-refresh spec with its own evidence, and the review date makes it
time-sensitive independently of this work.

**R-2 — UX wording for the out-of-coverage case. Route to `bubbles.ux`.** The Screen 2
out-of-coverage variant in `spec.md` names a calendar coverage range. Under the
observed-cadence rule the basis is an observation count, so the sentence must state that
instead. The reader-visible *shape* is unchanged — `○ Unavailable`, a named absence, no
guess in either direction — only the stated basis changes.

**R-3 — A sixth `Cannot be compared` reason. Route to `bubbles.ux`.** § D-1 establishes
that two compositions holding different `coverageYears` are not comparable, because
`classifyInflationState` compares the first and last breakeven rows. The parity line
needs the reason *the two compositions hold different observation windows*, rendered
like the other five and never as `Agree`.

**R-4 — The `persistence` field interpretation. Route to `bubbles.plan`.** FR-018-011's
"unaltered" is satisfied by `declaredPolicy`, while `persistence` states what the copy
actually is. The scope DoD should name this so an implementer does not write
`persistence: "browser-cache"` onto a file on disk.

**R-5 — The spec-test-path guard. Route to `bubbles.plan`.** Any `tests/….mjs` literal
written into a `specs/**` artifact fails `scripts/validate-spec-test-paths.mjs` until
the file exists or the path is baselined. The four test files named above must be
created in the same change that first names them with an extension.

---

## Alternatives And Tradeoffs

| Alternative | Why rejected |
| --- | --- |
| Generate a bond-market publication calendar file, as `scripts/generate-xnys-calendar.mjs` does for NYSE | Introduces a new committed source, a new allowlist entry, a new fetch to keep fresh, and a new coverage cliff — reproducing H-2's second defect in a new file. The observed-cadence rule needs none of them and cannot be wrong about a holiday it has not heard of. |
| Reuse `data/calendars/xnys/calendar.json` and hand-patch the bond holidays | Requires a maintained list that is wrong the moment the publisher's schedule changes, and inherits `coverageEnd: "2026-12-31"`. It is exactly the design H-2 was written to prevent. |
| A fixed elapsed-days window, e.g. "stale after 5 days" | A magic constant with no basis in the publication it describes. It would be wrong across the Christmas cluster and would need re-tuning whenever the schedule changed. |
| Envelope-only provenance | Structurally impossible: `SOURCE_PROVENANCE_FIELDS` is closed and holds no observation as-of, and `hasOnlyFields` rejects an added one. |
| `data/bars/*.json`-style provenance only | No validator, no host allowlist, no `https` enforcement, no hash, no access class. Would re-derive in a bespoke gate what `rlcontracts.js` already owns, against D4. |
| Two artifacts, one per family | Doubles the write, the gate and the read for two families that are always acquired, validated and consumed together, and makes `coverageYears` alignment between them an unchecked assumption. Per-family independence is already achieved by per-family state inside one file. |
| Resolve the artifact in the pipeline caller at `scripts/brief-refresh.mjs:1857` | Would make the suite's live read at `scripts/selftest.mjs:5468` structurally different from the read that publishes, so the suite would assert an absence the pipeline no longer produces. |
| Extend `bondRegimeOwnerState` to read the artifact itself | Widens the injection seam FR-018-022 requires be used as-is, and would break the explicit-absence premise of the adversarial cases that prove the refusal is computed. |
| Mark a stale headless family `stale` and let the model classify it, matching the browser branch | `computeBondLabViewModel:2152` admits any state but `unavailable`, so the rows would be classified as current evidence — a direct FR-018-031 violation. The stricter admission is the point. |
| A separate acquisition schedule | Two schedules drift, and § D-1 makes window alignment a correctness property. |

---

## Complexity Tracking

| Deviation from the simplest viable approach | Simpler alternative considered | Why the simpler one was rejected |
| --- | --- | --- |
| A per-response provenance envelope array rather than one source id per family | `data/bars/*.json`'s `src` + `asof` + `fetched` | The lighter form cannot mechanically satisfy BS-018-004's host-and-scheme requirement, FR-018-012's integrity requirement, or FR-018-015's credential prohibition, all of which `rlcontracts.js` already enforces once. |
| A read-time admission layer separate from the artifact's `state` | Write the freshness verdict into the artifact at acquisition time | A baked verdict goes wrong the moment the file ages without being rewritten, and would make the read non-reproducible from the file plus the run date. |
| A `declaredPolicy` block beside `rights` and `persistence` | Copy `persistence: "browser-cache"` verbatim onto a disk file | It would be a false statement about the artifact, which the anti-fabrication rule outranks a literal field copy. |
| An observed-cadence freshness rule rather than a calendar lookup | Reuse the committed XNYS calendar | It publishes false staleness on at least two committed 2026 dates and expires on 2026-12-31 (H-2). |
| Branching live assertions on the admission verdict | Assert the post-feature outcome directly | The committed artifact ages between runs, so a fixed assertion would flake; a branch on the verdict asserts an implication that holds at any run date. |

Every other element of this design reuses an existing repository pattern rather than
introducing a mechanism: the artifact shape follows `data/calendars/xnys/calendar.json`,
the fetch follows `yahooRows`, the validator follows `scripts/validate-brief-cache.mjs`,
the helper loading follows `loadToolFunctions`, and the injection uses the seam
`scripts/owner-state.mjs:440` already exposes.

---

## Open Questions Remaining

Both are non-blocking. Neither prevents scoping or implementation, and each names the
evidence that settles it.

1. **The numeric magnitude of `maxObservedGapDays`.** The rule is correct by
   construction regardless of the value, but no committed Treasury artifact exists in
   this repository, so the observed gap distribution has not been measured and this
   design does not claim it has. **Settled by:** the first successful acquisition run —
   compute the gap distribution over the retained two-year window and record
   `maxObservedGapDays` and the resulting `windowDays`. If it exceeds a week, the
   `cadenceWindowRows` and `minCadenceObservations` defaults should be revisited before
   the rule is trusted in production.
2. **The artifact's measured byte size.** The ~72 KB figure above is arithmetic over a
   known row shape, not a measurement. **Settled by:** the first written artifact —
   record the measured size, and confirm the tool-read delta against the measured 29,441
   bytes of first-load headroom.

`spec.md`'s open questions 3 and 4 are resolved above: retention is the browser's
two-calendar-year window (§ *Retention*, § D-1), and acquisition runs inside the existing
scheduled refresh as a module with a standalone repair entry point (§ *The Tier-A
Acquisition Step*).

---

## Evidence Read During Authoring

| Claim | Evidence |
| --- | --- |
| The headless path loads the page's helpers by name | `scripts/brief-refresh.mjs:940`, `:1522-1529` |
| The injection seam and its `undefined` precedence | `scripts/owner-state.mjs:440`, `:484-485` |
| The named-absence shape and its `retrievedAt: null` rule | `scripts/owner-state.mjs:405-411` |
| The model admits any family state but `unavailable` | `bond-regime-lab.html:2152-2153` |
| Inflation state compares the first and last breakeven rows | `bond-regime-lab.html:1697-1699` |
| Curve impulse needs `lookback + 1` rows with both `y2` and `y10` | `bond-regime-lab.html:1477-1480` |
| The browser merges two calendar years and degrades to cached-stale | `bond-regime-lab.html:1665-1668`, `:1687-1688` |
| The parser rejects the whole family on a missing maturity | `bond-regime-lab.html:1533-1534` |
| Breakeven is nominal `y10` minus real `y10` on exact common dates | `bond-regime-lab.html:1493-1505` |
| Both Treasury URL templates share a pathname and differ by query | `bond-regime-universe.json` `sourcePolicies.nominalCurve`, `sourcePolicies.realCurve` |
| The provenance envelope's closed field list and its validator | `rlcontracts.js:109-127`, `:515-566` |
| Credential-shaped query keys are rejected | `rlcontracts.js:496` |
| Diagnostics must match `^[a-z0-9][a-z0-9-]*$` | `rlcontracts.js:8` |
| `SOURCE_KINDS` admits `official-report` | `rlcontracts.js:65-70` |
| `yahoo-chart` uses the `pathPrefix` form | `rlcontracts.js:63` |
| The committed layered-provenance precedent | `data/calendars/xnys/calendar.json` `sourceRef` |
| Committed bars name the copy's own persistence | `scripts/owner-state.mjs:466` |
| Dependency-free server fetch with a `User-Agent` | `scripts/brief-refresh.mjs:1087-1101` |
| The equity calendar helper that must not be reused here | `scripts/validate-brief-cache.mjs:18-33` |
| The first-load set, its budget and the measured total | `scripts/selftest.mjs:6238-6242`; measured 175,359 of 204,800 bytes |
| `artifactBudgets` keys are exact-matched | `rlexperience.js:489` |
| The committed post-feature expectation | `scripts/selftest.mjs:5670-5682` |
| The live-read assertions that must be reconciled | `scripts/selftest.mjs:5615-5622`, `:5638-5648`, `:5686`, `:5697-5698` |
| Spec artifacts are scanned for `tests/….mjs` tokens | `scripts/validate-spec-test-paths.mjs:59`, `:86-112` |
| Validators accept no bypass flag | `scripts/validate-spec-test-paths.mjs:41-44` |
| Additive contracts, no build step, spec cap | `.specify/memory/constitution.md:114-133` |
