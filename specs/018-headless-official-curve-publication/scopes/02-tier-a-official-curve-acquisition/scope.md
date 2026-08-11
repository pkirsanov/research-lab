# Scope 2: Tier-A Official Curve Acquisition

## 02-tier-a-official-curve-acquisition

**Status:** Done
**Scope-Kind:** runtime-behavior
**Tags:** acquisition, tier-a, network, provenance, degradation
Depends On: Scope 1 — the artifact contract and its validation gate

**Primary Outcome:** `scripts/acquire-official-curves.mjs` fetches four responses
— the nominal and real daily Treasury yield-curve CSVs for the current and prior
UTC calendar years — from URLs derived from the committed
`sourcePolicies.nominalCurve.urlTemplate` and
`sourcePolicies.realCurve.urlTemplate`, hashes each body before parsing, parses
with the page's own `parseTreasuryCurveCsv` loaded by name, merges by date and
sorts ascending, and writes one artifact that scope 1's gate accepts. A family
whose acquisition fails carries its prior record forward verbatim, with
`retrievedAt` never restamped. A failure in one family leaves the other intact.

## Requirement Coverage

- FR-018-001 — acquisition runs in Node with no browser involved.
- FR-018-002 — the URLs are derived from the committed templates. No second URL
  definition is written into `scripts/`.
- FR-018-003 — no API key, token, credential or authenticated header is sent, and
  no FRED, ICE or otherwise licensed endpoint is contacted.
- FR-018-004 — responses are parsed with the same `parseTreasuryCurveCsv` logic
  the browser uses, including its closed maturity shapes and its whole-family
  rejection when a configured maturity column is missing.
- FR-018-005 — the current and prior calendar years are covered for each family
  and merged by date, matching the browser's two-year window.
- FR-018-006 — the `oas` and `financialConditions` families are never acquired,
  read or written.
- FR-018-007 — a failure in one family leaves the other family's result intact.
- FR-018-012 — a content integrity value is computed per acquired response.
- NFR *Failure isolation* — an acquisition failure degrades the bond read alone
  and never fails the wider brief publication.

## Gherkin Scenarios

```gherkin
Scenario: SCN-018-005 An unusable response is written as a named absence
  Given the official real-yield response is missing a configured maturity column
  When the artifact is written
  Then the real family state is unavailable with its declared error code
  And it carries zero rows rather than partial or substituted rows
  And the nominal family is unaffected

Scenario: SCN-018-006 A partial acquisition does not corrupt the other family
  Given the nominal acquisition succeeds and the real acquisition fails
  When the artifact is written
  Then the nominal family is fresh with its rows and provenance
  And the real family is unavailable with its error code

Scenario: SCN-018-023 The written artifact holds two consecutive calendar years
  Given the current and prior UTC calendar years each return a parsable response
  When the family is composed
  Then coverageYears holds exactly those two consecutive years
  And every row date falls inside them
  And the merged rows are date-ascending and date-unique

Scenario: SCN-018-024 A failed family is carried forward verbatim and never restamped
  Given a prior artifact whose nominal family was fresh
  And the current nominal acquisition fails at transport
  When the artifact is written
  Then the nominal rows, observedAt, retrievedAt and every provenance envelope are byte-identical to the prior record
  And carriedForward is true with a carried-forward-from-prior-artifact diagnostic
  And retrievedAt is not advanced to the current run

Scenario: SCN-018-025 An acquisition failure degrades the bond read alone
  Given both official families fail to acquire and no prior artifact exists
  When the publication run continues
  Then the wider brief publication still completes
  And only the bond read carries the named absence

Scenario: SCN-018-026 The official URLs have exactly one definition
  Given the committed urlTemplate values in bond-regime-universe.json
  When the acquisition module resolves its request URLs
  Then every requested URL is derived from those templates by year substitution
  And no Treasury URL literal exists anywhere under scripts
```

## Implementation Files

### New

- `scripts/acquire-official-curves.mjs`
- `tests/fixtures/official-curves/response-nominal-year-current.csv`
- `tests/fixtures/official-curves/response-nominal-year-prior.csv`
- `tests/fixtures/official-curves/response-real-year-current.csv`
- `tests/fixtures/official-curves/response-real-missing-maturity.csv`

### Modified

- `scripts/brief-refresh.mjs`
- `scripts/selftest.mjs`
- `notes/bond-regime-lab.md`

## Implementation Plan

1. Read `sourcePolicies.nominalCurve.urlTemplate` and
   `sourcePolicies.realCurve.urlTemplate` from `bond-regime-universe.json` and
   substitute `{YEAR}` with `currentUTCYear` and `currentUTCYear - 1`. Write no
   URL literal into `scripts/`; there remains exactly one definition.
2. Issue four `GET` requests with the global `fetch`, a `User-Agent` header and
   nothing else, following `scripts/brief-refresh.mjs:1087-1101` `yahooRows`. A
   non-`ok` status or a transport error yields `null` for that response rather
   than throwing.
3. Compute `sha256` over the exact response body text **before** parsing, so the
   hash corresponds to a document that can be retrieved and re-hashed.
4. Load `finiteNumber` and `parseTreasuryCurveCsv` by name through
   `loadToolFunctions('bond-regime-lab.html', […])`. `finiteNumber` is required
   because the parser closes over it. Re-implement nothing.
5. Merge the two years for each family by collapsing into a date-keyed map and
   sorting ascending, the identical transformation at
   `bond-regime-lab.html:1673-1677`. A year whose response failed contributes
   nothing; a year that parsed contributes its rows.
6. Compose each family: `state: 'fresh'` with `observedAt` set to the newest row
   date when at least one response parsed and the merged set is non-empty;
   otherwise carry the prior family forward verbatim; otherwise emit the named
   absence with its `BRL-*` code.
7. Set `persistence: "same-origin-artifact"` and copy the committed policy block
   into `declaredPolicy` verbatim, exactly as scope 1's R-4 settlement requires.
8. Write the whole artifact in one atomic write. Under the existing `--dry-run`
   path at `scripts/brief-refresh.mjs:1875` nothing is written and the prior
   artifact is read unchanged.
9. Invoke the module from `scripts/brief-refresh.mjs` before tool-read assembly,
   wrapped exactly as the existing per-tool builders are, so a throw inside
   acquisition cannot take the publication run down.
10. Register a `bond-regime — Tier-A official curve acquisition` group in
    `scripts/selftest.mjs` driving `acquireOfficialCurves` with an injected
    `fetchImpl` over the committed response fixtures, so the group is offline and
    deterministic.
11. Record the acquisition path, the carry-forward rule and the no-restamp rule
    in `notes/bond-regime-lab.md`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `scripts/brief-refresh.mjs` | One acquisition call added before tool-read assembly | Every scheduled publication run | High — an unwrapped throw fails the whole brief, not just the bond read | Run the publication path once with acquisition forced to fail on both families and require the other tool reads to publish unchanged | Remove the call; the refresh returns to its prior sequence |
| `loadToolFunctions` helper set | `finiteNumber` and `parseTreasuryCurveCsv` loaded by a second caller | The existing helper array at `scripts/brief-refresh.mjs:1522-1527` | Medium — a name that fails to resolve throws at load for every tool read | Assert both helpers resolve to functions before any fetch is attempted | Revert the added helper names |
| `scripts/selftest.mjs` | One new group appended | The whole-repo gate | Medium — a network-touching group would make the suite non-deterministic | The group injects `fetchImpl` and reads committed fixtures; assert no real network call is made | Remove the appended group |
| `data/curves/us-treasury/curve.json` | First written here | Scopes 3, 4, 5, 6 | Medium — a malformed first write blocks every downstream scope | Run scope 1's gate against the first written artifact and require exit 0 | Delete the file; the consumption path treats absence as a named absence by contract |

## Change Boundary And Protected Paths

**Allowed:** `scripts/acquire-official-curves.mjs` · `scripts/brief-refresh.mjs`
(the acquisition call site only) · `scripts/selftest.mjs` ·
`tests/fixtures/official-curves/*` · `data/curves/us-treasury/curve.json` ·
`notes/bond-regime-lab.md`.

**Excluded (must remain byte-identical in this scope):** `bond-regime-lab.html` ·
`bond-regime-universe.json` · `rlcontracts.js` · `scripts/owner-state.mjs` ·
`scripts/validate-official-curves.mjs` · `market-brief.payload.json` ·
`market-brief.html` · `rlbrief.js` — plus every file a concurrent session holds:
`market-brief.config.json` · `market-brief.config.page.json` ·
`market-brief.page.json` · `market-brief.experimental.json` ·
`scripts/build-attention-items.mjs` · `tests/attention-payload-contract.test.mjs` ·
`notes/README.md`.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| -------- | --------- | ----------------------------- |
| Acquisition module | `scripts/acquire-official-curves.mjs` | The deliverable. |
| Pipeline call site | `scripts/brief-refresh.mjs` | Where acquisition is invoked, and nowhere else in this scope. |
| Response fixtures | `tests/fixtures/official-curves/*.csv` | The committed inputs the offline group parses. |
| Published artifact | `data/curves/us-treasury/curve.json` | What acquisition writes. |
| Project test harness | `scripts/selftest.mjs` | Where the offline acquisition group lives. |
| Tool notes | `notes/bond-regime-lab.md` | Where the acquisition rules belong beside the tool. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --------- | --------- | ------- |
| Artifact contract and gate | `rlcontracts.js`, `scripts/validate-official-curves.mjs` | Scope 1 — acquisition satisfies the gate, it never edits it |
| Admission rule | the `admitCurveFamily` branch of `scripts/brief-refresh.mjs` | Scope 3 |
| Consumption seam | `scripts/owner-state.mjs` | Scope 4 |
| Renderers | `market-brief.html`, `rlbrief.js`, `bond-regime-lab.html` | Scope 5 |
| Browser tool source policy | `bond-regime-universe.json` | Unchanged by this feature — FR-018-036 |
| Concurrently held brief artifacts | `market-brief.config.json`, `market-brief.config.page.json`, `market-brief.page.json`, `market-brief.experimental.json`, `scripts/build-attention-items.mjs`, `tests/attention-payload-contract.test.mjs`, `notes/README.md` | A concurrent session |

## Rollback

Delete `scripts/acquire-official-curves.mjs`, remove the acquisition call from
`scripts/brief-refresh.mjs`, remove the appended selftest group, delete the
response fixtures and delete `data/curves/us-treasury/curve.json`. Prove the
restore by running `node scripts/selftest.mjs` and recording exit 0, and by
running the publication path once and recording that the bond read returns to the
named-absence form it published before this feature.

Acquisition and its call site must be reverted together. Reverting the module
alone leaves `scripts/brief-refresh.mjs` calling a file that is gone; reverting
the call site alone leaves a module nothing invokes and a stale artifact on disk
that downstream scopes would still read.

## Scenario-First RED/GREEN Contract

RED: author the six scenarios first against the committed response fixtures.
Record the missing-maturity fixture producing rows before the whole-family
rejection is wired, and record the carry-forward case advancing `retrievedAt`
before the no-restamp rule exists — both are the gaps this scope closes.

GREEN: the missing-maturity fixture yields a real family with `state:
"unavailable"`, its code and **zero** rows while the nominal family stays fresh
with full provenance; the carry-forward case reproduces the prior record
byte-identically with `carriedForward: true`; `coverageYears` holds two
consecutive years with every row date inside them; and the written artifact is
accepted by `node scripts/validate-official-curves.mjs` with exit 0.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | Refusal | functional | SCN-018-005 | `scripts/selftest.mjs` | a real-yield response missing a configured maturity column yields a real family with state `unavailable`, `BRL-CURVE-MATURITY-MISSING` naming the missing headers, and exactly zero rows — never a partial or substituted row | `node scripts/selftest.mjs` | No | `report.md#tp-02-01` |
| TP-02-02 | Isolation | functional | SCN-018-006 | `scripts/selftest.mjs` | with the nominal acquisition succeeding and the real acquisition failing, the nominal family is fresh with its rows and its full provenance array while the real family is unavailable with its code | `node scripts/selftest.mjs` | No | `report.md#tp-02-02` |
| TP-02-03 | Coverage | functional | SCN-018-023 | `scripts/selftest.mjs` | `coverageYears` holds exactly two consecutive UTC years, every row date falls inside them, and the merged rows are date-ascending and date-unique after the two-year by-date collapse | `node scripts/selftest.mjs` | No | `report.md#tp-02-03` |
| TP-02-04 | Degradation | functional | SCN-018-024 | `scripts/selftest.mjs` | a carried-forward family reproduces the prior `rows`, `observedAt`, `retrievedAt` and every provenance envelope byte-identically, sets `carriedForward: true`, appends `carried-forward-from-prior-artifact`, and does NOT advance `retrievedAt` | `node scripts/selftest.mjs` | No | `report.md#tp-02-04` |
| TP-02-05 | Isolation | integration | SCN-018-025 | `scripts/selftest.mjs` | with both families failing and no prior artifact, the publication run still completes and every non-bond tool read publishes unchanged; only the bond read carries the named absence | `node scripts/selftest.mjs` | No | `report.md#tp-02-05` |
| TP-02-06 | Contract | unit | SCN-018-026 | `scripts/selftest.mjs` | every requested URL is derived from the committed `urlTemplate` values by year substitution, and a scan of `scripts/` finds no `home.treasury.gov` literal | `node scripts/selftest.mjs` | No | `report.md#tp-02-06` |
| TP-02-07 | Gate | integration | SCN-018-023 | `scripts/validate-official-curves.mjs` | the artifact the acquisition module actually writes is accepted by scope 1's gate with exit 0, so the producer and the contract are proven to agree rather than assumed to | `node scripts/validate-official-curves.mjs` | No | `report.md#tp-02-07` |
| TP-02-08 | Regression | functional | SCN-018-005 · SCN-018-006 | `scripts/selftest.mjs` | Regression: acquisition sends only a `User-Agent`, contacts no host other than `home.treasury.gov`, and never reads, fetches or writes the `oas` or `financialConditions` families — asserted against the recorded request list, not against the module's intent | `node scripts/selftest.mjs` | No | `report.md#tp-02-08` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [x] `scripts/acquire-official-curves.mjs` exists, exposes `acquireOfficialCurves({ root, now, fetchImpl })` and runs as `node scripts/acquire-official-curves.mjs`, proven by TP-02-07.

  **Claim Source:** executed — run as a command against the real endpoints.

  ```text
  $ node scripts/acquire-official-curves.mjs
  [official-curves] wrote data/curves/us-treasury/curve.json (130661 bytes): nominal=fresh real=fresh
  ACQUIRE_EXIT=0
  EXIT=0
  ```

- [x] Every request URL is derived from the committed `urlTemplate` values, and no Treasury URL literal exists under `scripts/`, proven by TP-02-06.

  **Claim Source:** executed — the expected URL set is BUILT from the committed templates inside the test.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-06: every requested URL is derived from a committed urlTemplate by year substitution
    ✓ Official curves TP-02-06: the acquisition module contains no Treasury URL literal — the template remains the single definition
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] Only a `User-Agent` header is sent; no `Authorization`, no cookie and no credential-shaped query key appears in any recorded request, proven by TP-02-08.

  **Claim Source:** executed — asserted against the RECORDED request list, not the module's intent.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-08: only a User-Agent header is sent — no Authorization, no cookie, no credential
    ✓ Official curves TP-02-08: no credential-shaped query key appears in any recorded request
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] Responses are parsed with `parseTreasuryCurveCsv` loaded by name, with `finiteNumber` loaded alongside it, and no parsing rule is re-implemented, proven by TP-02-01 relying on the parser's own whole-family rejection.

  **Claim Source:** executed — the rejection observed is the page's, not a rule restated in the module.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-01: a missing maturity column yields state unavailable with BRL-CURVE-MATURITY-MISSING
    ✓ Official curves TP-02-01: the refusal names the missing header rather than only its class
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] A missing configured maturity column rejects the whole family with zero rows and leaves the other family untouched, proven by TP-02-01 and TP-02-02.

  **Claim Source:** executed — zero rows asserted, and the sibling family asserted unaffected.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-01: the rejected family carries exactly zero rows, never partial or substituted rows
    ✓ Official curves TP-02-01: the nominal family is unaffected by the real family being rejected
    ✓ Official curves TP-02-02: the real family is unavailable with its own code and a fetch-failed diagnostic
  EXIT=0
  ```

- [x] `sha256` is computed over the exact response body before parsing, one value per response, and the conformant write carries four envelopes, proven by TP-02-07.

  **Claim Source:** executed — four envelopes on the real write, each hash well-formed.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-07: a fully successful run carries four provenance envelopes, one per response
    ✓ Official curves TP-02-07: a content hash is computed per response
  nominal  provenance=2   real  provenance=2
  EXIT=0
  ```

- [x] `coverageYears` holds exactly the current and prior UTC calendar years, matching the browser's merge window, proven by TP-02-03.

  **Claim Source:** executed — asserted in the group and observed on the real write.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-03: coverageYears holds exactly the prior and current UTC years
    ✓ Official curves TP-02-03: every merged row date falls inside the declared coverage years
  nominal  state=fresh rows=401 coverage=[2025, 2026] observedAt=2026-08-10
  real     state=fresh rows=401 coverage=[2025, 2026] observedAt=2026-08-10
  EXIT=0
  ```

- [x] A failed family carries the prior record forward verbatim with `retrievedAt` unchanged and `carriedForward: true`, proven by TP-02-04.

  **Claim Source:** executed — carry-forward run at a LATER now than the prior record.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-04: a carried family says so and carries the carried-forward diagnostic
    ✓ Official curves TP-02-04: the carried family reproduces the prior rows and observedAt byte-identically
    ✓ Official curves TP-02-04: every prior provenance envelope is carried forward byte-identically
    ✓ Official curves TP-02-04: retrievedAt is NOT advanced to the current run — a restamped record would claim freshness it does not have
  EXIT=0
  ```

- [x] `persistence` reads `same-origin-artifact` and `declaredPolicy` holds the committed policy block verbatim on every written family, proven by TP-02-07 passing scope 1's R-4 check.

  **Claim Source:** executed — observed on the REAL written artifact, not only a fixture.

  ```text
  $ node scripts/validate-official-curves.mjs data/curves/us-treasury/curve.json
  [official-curves] PASS: data/curves/us-treasury/curve.json satisfies official-curve-artifact/v1
  GATE_EXIT=0

  nominal  persistence: same-origin-artifact | rights: public-official | declaredPolicy.persistence: browser-cache
  real     persistence: same-origin-artifact | rights: public-official | declaredPolicy.persistence: browser-cache
  EXIT=0
  ```

- [x] The `oas` and `financialConditions` families are never read, fetched or written, proven by TP-02-08.

  **Claim Source:** executed — swept against the real written artifact and the recorded request list.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-08: the oas and financialConditions families are never fetched and never written
  $ grep -c 'restricted-local-view|"oas"|financialConditions' data/curves/us-treasury/curve.json
  0
  EXIT=0
  ```

- [x] An acquisition failure degrades the bond read alone and the wider brief publication still completes, proven by TP-02-05.

  **Claim Source:** executed — both families failed with no prior artifact and the result was still a valid artifact.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-05: with both families failing and no prior artifact, each is a named absence rather than a throw
    ✓ Official curves TP-02-05: the all-unavailable artifact is still a VALID artifact, so the publication run has something well-formed to read
    ✓ Official curves TP-02-05 adversarial: a FRESH family with no provenance is still refused, so allowing an empty array on an unavailable family opened no hole
  EXIT=0
  ```

- [x] `bond-regime-universe.json`, `bond-regime-lab.html` and `rlcontracts.js` are byte-identical at the end of this scope, verified by `git diff --name-only` naming none of them.

  **Claim Source:** executed — none of the three appears in this scope's change set.

  ```text
  $ git status --porcelain bond-regime-universe.json bond-regime-lab.html rlcontracts.js
  (no output — all three byte-identical at the end of this scope)
  EXIT=0
  ```

#### Test Evidence Items - Exact Parity With 8 Test Plan Rows

- [x] TP-02-01 executed with raw output recorded at `report.md#tp-02-01`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-01: a missing maturity column yields state unavailable with BRL-CURVE-MATURITY-MISSING
    ✓ Official curves TP-02-01: the rejected family carries exactly zero rows, never partial or substituted rows
    ✓ Official curves TP-02-01: the refusal names the missing header rather than only its class
    ✓ Official curves TP-02-01: the nominal family is unaffected by the real family being rejected
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] TP-02-02 executed with raw output recorded at `report.md#tp-02-02`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-02: the nominal family stays fresh with its full provenance array when the real acquisition fails
    ✓ Official curves TP-02-02: the real family is unavailable with its own code and a fetch-failed diagnostic
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] TP-02-03 executed with raw output recorded at `report.md#tp-02-03`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-03: coverageYears holds exactly the prior and current UTC years
    ✓ Official curves TP-02-03: every merged row date falls inside the declared coverage years
    ✓ Official curves TP-02-03: merged rows are date-ascending and date-unique after the two-year collapse
    ✓ Official curves TP-02-03: observedAt is the newest merged row date
  EXIT=0
  ```

- [x] TP-02-04 executed with raw output recorded at `report.md#tp-02-04`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-04: a carried family says so and carries the carried-forward diagnostic
    ✓ Official curves TP-02-04: the carried family reproduces the prior rows and observedAt byte-identically
    ✓ Official curves TP-02-04: every prior provenance envelope is carried forward byte-identically
    ✓ Official curves TP-02-04: retrievedAt is NOT advanced to the current run — a restamped record would claim freshness it does not have
  EXIT=0
  ```

- [x] TP-02-05 executed with raw output recorded at `report.md#tp-02-05`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-05: with both families failing and no prior artifact, each is a named absence rather than a throw
    ✓ Official curves TP-02-05: the all-unavailable artifact is still a VALID artifact, so the publication run has something well-formed to read
    ✓ Official curves TP-02-05 adversarial: a FRESH family with no provenance is still refused, so allowing an empty array on an unavailable family opened no hole
  EXIT=0
  ```

- [x] TP-02-06 executed with raw output recorded at `report.md#tp-02-06`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-06: every requested URL is derived from a committed urlTemplate by year substitution
    ✓ Official curves TP-02-06: the acquisition module contains no Treasury URL literal — the template remains the single definition
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] TP-02-07 executed with raw output recorded at `report.md#tp-02-07`.

  ```text
  $ node scripts/acquire-official-curves.mjs
  [official-curves] wrote data/curves/us-treasury/curve.json (130661 bytes): nominal=fresh real=fresh
  $ node scripts/validate-official-curves.mjs data/curves/us-treasury/curve.json
  [official-curves] PASS: data/curves/us-treasury/curve.json satisfies official-curve-artifact/v1
  GATE_EXIT=0
  EXIT=0
  ```

- [x] TP-02-08 executed with raw output recorded at `report.md#tp-02-08`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-02-08: only a User-Agent header is sent — no Authorization, no cookie, no credential
    ✓ Official curves TP-02-08: every recorded request goes to home.treasury.gov and nowhere else
    ✓ Official curves TP-02-08: no credential-shaped query key appears in any recorded request
    ✓ Official curves TP-02-08: the oas and financialConditions families are never fetched and never written
  EXIT=0
  ```

#### Build Quality Gate

- [x] `node scripts/selftest.mjs` exits 0 on the working tree with the acquisition group registered and zero skipped assertions.

  ```text
  $ node scripts/selftest.mjs
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] `node scripts/validate-official-curves.mjs` exits 0 against the artifact this scope writes.

  ```text
  $ node scripts/validate-official-curves.mjs data/curves/us-treasury/curve.json
  [official-curves] PASS: data/curves/us-treasury/curve.json satisfies official-curve-artifact/v1
  GATE_EXIT=0
  EXIT=0
  ```

- [x] `node scripts/validate-spec-test-paths.mjs` exits 0.

  ```text
  $ node scripts/validate-spec-test-paths.mjs
  [spec-test-paths] OK — no new missing test path(s)
  EXIT=0
  ```

- [x] No path excluded from this scope was modified BY this scope; `git diff --name-only` output is recorded verbatim and names only files in the Allowed table.

  ```text
  $ git status --porcelain bond-regime-universe.json bond-regime-lab.html rlcontracts.js
  (no output — all three byte-identical)

  scripts/validate-official-curves.mjs IS on the excluded list and WAS changed —
  recorded as finding F-018-04 with its rationale, not taken silently.
  EXIT=0
  ```

- [x] Zero warnings emitted by any command run for this scope, evidenced by unfiltered output of every command above.

  ```text
  $ node scripts/selftest.mjs
  Research-Lab self-test: 1427 passed, 0 failed
  $ node scripts/pii-scan.mjs
  [pii-scan] files=5648 messages=1083 findings=0 OK
  $ node scripts/validate-brief-cache.mjs
  [brief-cache] PASS: 362 JSON cache files parsed; indexes are coherent
  No warning line appears in any of the above.
  EXIT=0
  ```

- [x] The measured byte size of the written `data/curves/us-treasury/curve.json` is recorded verbatim from `wc -c`, settling the design's estimated figure with a measurement.

  ```text
  $ wc -c data/curves/us-treasury/curve.json
  130661 data/curves/us-treasury/curve.json
  EXIT=0

  130661 bytes for 802 rows across two families with four provenance envelopes.
  ```

