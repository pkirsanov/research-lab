# Scope 1: Official Curve Artifact Contract And Validation Gate

## 01-official-curve-artifact-contract

**Status:** Done
**Scope-Kind:** contract-foundation
**Tags:** foundation:true, capability-foundation, artifact-contract, provenance, gate
Depends On: none

**Primary Outcome:** `official-curve-artifact/v1` exists as a frozen shape with a
per-family record and a per-response `source-provenance/v1` envelope array, the
shared provenance allowlist in `rlcontracts.js` carries additive
`us-treasury-nominal` and `us-treasury-real` entries in the `pathPrefix` form,
and `scripts/validate-official-curves.mjs` refuses every malformed, credentialed,
restricted, mis-bound or partially-trusted artifact with a named error and a
non-zero exit. Nothing is fetched in this scope and nothing is published; the
gate is exercised against committed fixtures only.

## Requirement Coverage

- FR-018-008, FR-018-009, FR-018-010, FR-018-011, FR-018-012, FR-018-013 — the
  artifact is a committed static file readable offline, every family carries a
  state and an error code, source id, source URL, observation as-of, retrieval
  time, a content integrity value per response, and a versioned contract id.
- FR-018-014 — additive `SOURCE_IDS` and `SOURCE_POLICIES` entries in the
  `pathPrefix` form. No existing entry is changed or removed. `SOURCE_KINDS`
  needs no addition because `official-report` already admits a daily yield-curve
  publication.
- FR-018-015 — no OAS value, no financial-conditions value, no restricted source
  URL and no credential can exist in a valid artifact.
- FR-018-016 — the artifact declares its own `freshnessPolicy` block rather than
  leaving the window to a consumer's assumption.
- FR-018-032 — the gate joins the `scripts/validate-*.mjs` family and fails on a
  missing required field, an unparsable file, a non-https or off-host source URL,
  a credential, or a restricted observation.
- FR-018-038 — every contract change is additive.
- Routed item **R-4** — the `persistence` interpretation is settled here, in a
  Core Delivery item, not left to an implementer.
- Routed item **R-5** — the spec-test-path guard stays green because this feature
  names no new `tests/*.mjs` path.

## Gherkin Scenarios

```gherkin
Scenario: SCN-018-004 Every published family carries full provenance
  Given a published official curve artifact whose nominal family is fresh
  When a reviewer inspects that family
  Then it carries a source id, a source URL, an observation as-of date, and a retrieval time
  And the source URL is an https URL on the declared official host

Scenario: SCN-018-001 Both official families are acquired without a credential
  Given the declared source policies for us-treasury-nominal and us-treasury-real
  When an artifact carrying a credential-shaped request field is validated
  Then the gate refuses it with secret-shaped-request-field
  And a conformant artifact carries no credential in any envelope or family field

Scenario: SCN-018-002 A restricted family is never acquired server-side
  Given the oas and financialConditions source policies are restricted-local-view and memory-only
  When the artifact is swept end to end
  Then no oas value, no financial-conditions value and no restricted source URL is present
  And the gate refuses an artifact in which any of them appears

Scenario: SCN-018-003 A licensed or keyed endpoint cannot enter the source policy
  Given the committed bond source policy
  When it is scanned for api_key, fredgraph, series/BAML and series/NFCI
  Then no match is found
  And the additive allowlist entries introduce no new host beyond home.treasury.gov

Scenario: SCN-018-018 Restricted observations never reach the published brief
  Given a published bond read of any state
  When the published payload is inspected
  Then it contains no oas value, no financial-conditions value and no restricted source URL

Scenario: SCN-018-019 The source id is bound to its query, not only to its host and path
  Given a nominal envelope carrying the real-yield query value
  When it is validated
  Then the shared provenance validator accepts it because host, method and path prefix all match
  And the feature gate refuses it with a named source-id-to-query binding error

Scenario: SCN-018-020 The declared policy travels verbatim and the copy states its own retention
  Given the committed source policy declares persistence browser-cache
  When a family record is written to the committed artifact
  Then declaredPolicy holds the committed policy block byte-for-byte
  And the family persistence field states same-origin-artifact
  And the family rights field carries public-official unaltered

Scenario: SCN-018-021 The contract extension is additive only
  Given the frozen SOURCE_IDS and SOURCE_POLICIES before this scope
  When they are compared with the same structures after this scope
  Then every pre-existing id and policy retains its name, its shape and its values
  And the only difference is the two added Treasury entries

Scenario: SCN-018-022 The feature names no unwritten test path
  Given every committed artifact under this feature directory
  When the spec-test-path guard runs
  Then it reports no new missing path
  And the frozen baseline file is unchanged by this feature
```

## Implementation Files

### New

- `scripts/validate-official-curves.mjs`
- `tests/fixtures/official-curves/conformant.json`
- `tests/fixtures/official-curves/missing-required-field.json`
- `tests/fixtures/official-curves/credentialed-envelope.json`
- `tests/fixtures/official-curves/restricted-observation.json`
- `tests/fixtures/official-curves/off-host-source-url.json`
- `tests/fixtures/official-curves/query-binding-mismatch.json`
- `tests/fixtures/official-curves/partial-row.json`
- `tests/fixtures/official-curves/observed-at-drift.json`

### Modified

- `rlcontracts.js`
- `scripts/selftest.mjs`
- `notes/bond-regime-lab.md`

## Implementation Plan

1. Add `us-treasury-nominal` and `us-treasury-real` to `SOURCE_IDS` in
   `rlcontracts.js`, appended, with every pre-existing key untouched.
2. Add the matching `SOURCE_POLICIES` entries using `sourceKind:
   "official-report"`, `accessClass: "public-official"`, `host:
   "home.treasury.gov"`, `method: "GET"` and the `pathPrefix` form
   `/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/`,
   because the official pathname embeds the year. Add nothing to `SOURCE_KINDS`.
3. Write the eight fixtures above. The conformant fixture carries two families,
   two `coverageYears`, four provenance envelopes and a small but real row set;
   each adversarial fixture differs from it in exactly one respect, so a refusal
   names one cause.
4. Write `scripts/validate-official-curves.mjs` following
   `scripts/validate-brief-cache.mjs`: accumulate named errors, print them all,
   exit non-zero on any. Expose `validateOfficialCurves(artifact, { universe })`
   for the selftest group and keep the command form for operator use. No
   `--skip`, no `--force`, no `--ignore`.
5. Implement gate checks 1-4: the file parses and carries
   `contractVersion === "official-curve-artifact/v1"`; both families are present
   with every required field; each `state` is `fresh` or `unavailable` with a
   non-null `errorCode` whenever it is not `fresh`; and every `provenance` entry
   passes `validateSourceProvenance` from `rlcontracts.js` rather than a
   re-derived copy of those rules.
6. Implement gate check 5, the source-id-to-query binding: a
   `us-treasury-nominal` envelope must carry `type=daily_treasury_yield_curve`
   and a `us-treasury-real` envelope `type=daily_treasury_real_yield_curve`.
   This is the one provenance rule the frozen contract structurally cannot
   express, because both ids share one host, method and path prefix.
7. Implement gate check 6: `sourceId` matches the id
   `bond-regime-universe.json` declares for that family, and `declaredPolicy`
   equals the committed policy block verbatim.
8. Implement gate checks 7-9: `coverageYears` holds exactly two consecutive
   years and every row date falls inside them; rows are date-ascending,
   date-unique and carry the family's full required maturity set with no partial
   row; `observedAt` equals the newest row date, or is `null` when `rows` is
   empty.
9. Implement gate check 10, the rights and restriction sweep: no `oas`, no
   `financialConditions`, no `restricted-local-view`, no host other than
   `home.treasury.gov`, and no key or value matching the credential-shaped
   regex anywhere in the artifact.
10. Implement gate check 11: `contentSha256` is present and well-formed for
    every envelope. The gate does not re-fetch to verify it, because the gate
    runs offline; the hash is an audit anchor and the gate's own message says so
    rather than implying a stronger guarantee.
11. Register a `bond-regime — official curve artifact contract and gate` group in
    `scripts/selftest.mjs` beside the existing bond groups, driving
    `validateOfficialCurves` over the conformant fixture and each adversarial
    fixture.
12. Record the R-4 `persistence` interpretation and the additive contract
    extension in `notes/bond-regime-lab.md` so the reasoning lives with the tool.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `rlcontracts.js` `SOURCE_IDS` / `SOURCE_POLICIES` | Two ids and two policies appended | Every caller of `validateSourceProvenance` across every tool | High — a mutated existing entry silently invalidates unrelated committed provenance | Run `node scripts/selftest.mjs` **before** any gate work, with only the allowlist entries added, and require exit 0 with the pre-existing provenance groups green | Remove the two appended entries; every pre-existing entry was never edited, so the structure returns to its prior bytes |
| `scripts/selftest.mjs` | One new group appended | The whole-repo gate every scope depends on | Medium — a group that throws takes the suite down for every concurrent scope | Run the suite with the new group registered but asserting only that the conformant fixture parses, before adding refusal assertions | Remove the appended group |
| `bond-regime-universe.json` | **Read only.** Not modified in this scope | The browser tool and the headless read | High if edited — FR-018-036 requires the browser policy to stay exactly as declared | Assert the file is byte-identical at the end of the scope | Nothing to restore; the file is on the excluded list |

## Change Boundary And Protected Paths

**Allowed:** `rlcontracts.js` · `scripts/validate-official-curves.mjs` ·
`scripts/selftest.mjs` · `tests/fixtures/official-curves/*` ·
`notes/bond-regime-lab.md`.

**Excluded (must remain byte-identical in this scope):** `bond-regime-lab.html` ·
`bond-regime-universe.json` · `scripts/brief-refresh.mjs` ·
`scripts/owner-state.mjs` · `market-brief.payload.json` · `market-brief.html` ·
`rlbrief.js` — plus every file a concurrent session holds:
`market-brief.config.json` · `market-brief.config.page.json` ·
`market-brief.page.json` · `market-brief.experimental.json` ·
`scripts/build-attention-items.mjs` · `tests/attention-payload-contract.test.mjs` ·
`notes/README.md`.

**Allowed file families.** Stated as families so a new file cannot enter simply by
not having been enumerated:

| Family | Members | Why this scope may touch it |
| -------- | --------- | ----------------------------- |
| Shared provenance contract | `rlcontracts.js` | The additive allowlist FR-018-014 requires. |
| The feature gate | `scripts/validate-official-curves.mjs` | The refusal this scope exists to add. |
| Gate fixtures | `tests/fixtures/official-curves/*` | The committed inputs the refusals are proven against. |
| Project test harness | `scripts/selftest.mjs` | Where this repository's pure-Node groups live. |
| Tool notes | `notes/bond-regime-lab.md` | Where the contract reasoning belongs beside the tool. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --------- | --------- | ------- |
| Acquisition | `scripts/acquire-official-curves.mjs` | Scope 2 |
| Admission rule | `scripts/brief-refresh.mjs` | Scope 3 and Scope 4 |
| Consumption seam | `scripts/owner-state.mjs` | Scope 4 |
| Renderers | `market-brief.html`, `rlbrief.js`, `bond-regime-lab.html` | Scope 5 |
| Browser tool source policy | `bond-regime-universe.json` | Unchanged by this feature — FR-018-036 |
| Concurrently held brief artifacts | `market-brief.config.json`, `market-brief.config.page.json`, `market-brief.page.json`, `market-brief.experimental.json`, `scripts/build-attention-items.mjs`, `tests/attention-payload-contract.test.mjs`, `notes/README.md` | A concurrent session |

## Rollback

Remove `scripts/validate-official-curves.mjs`, delete
`tests/fixtures/official-curves/`, remove the appended group from
`scripts/selftest.mjs`, and remove the two appended `SOURCE_IDS` and
`SOURCE_POLICIES` entries from `rlcontracts.js`. Prove the restore by running
`node scripts/selftest.mjs` and recording exit 0, which also proves the
pre-existing provenance groups never depended on the added entries.

## Scenario-First RED/GREEN Contract

RED: write the nine scenarios first. Each adversarial fixture must be recorded
passing a gate that does not yet implement its check — that is the gap the scope
closes — and the conformant fixture must be recorded failing before the gate can
parse the contract at all.

GREEN: the conformant fixture passes with exit 0, each adversarial fixture is
refused with one named error and a non-zero exit, the query-binding fixture is
recorded passing `validateSourceProvenance` and being refused by the feature
gate, and `node scripts/validate-spec-test-paths.mjs` exits 0 with the baseline
byte-identical.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | Contract | unit | SCN-018-004 | `scripts/selftest.mjs` | a fresh family carries a source id, an https source URL on the declared official host, an observation as-of and a retrieval time; scheme and host asserted structurally, never as a full-string literal | `node scripts/selftest.mjs` | No | `report.md#tp-01-01` |
| TP-01-02 | Refusal | unit | SCN-018-001 | `scripts/selftest.mjs` | an envelope carrying a credential-shaped request field is refused with `secret-shaped-request-field`, so the no-credential guarantee is mechanical rather than inspected | `node scripts/selftest.mjs` | No | `report.md#tp-01-02` |
| TP-01-03 | Refusal | integration | SCN-018-004 · SCN-018-019 | `scripts/validate-official-curves.mjs` | the gate exits 0 on the conformant fixture and non-zero with one named error on each of the seven adversarial fixtures | `node scripts/validate-official-curves.mjs` | No | `report.md#tp-01-03` |
| TP-01-04 | Sweep | unit | SCN-018-002 | `scripts/selftest.mjs` | an artifact containing an oas value, a financial-conditions value or a `restricted-local-view` rights string anywhere is refused by the rights-and-restriction sweep | `node scripts/selftest.mjs` | No | `report.md#tp-01-04` |
| TP-01-05 | Policy scan | unit | SCN-018-003 | `scripts/selftest.mjs` | the committed bond source policy still matches none of `api_key`, `fredgraph`, `series/BAML`, `series/NFCI`, and the two added allowlist entries introduce no host other than `home.treasury.gov` | `node scripts/selftest.mjs` | No | `report.md#tp-01-05` |
| TP-01-06 | Sweep | unit | SCN-018-018 | `scripts/selftest.mjs` | a full-artifact sweep finds no oas value, no financial-conditions value and no restricted source URL in a conformant artifact | `node scripts/selftest.mjs` | No | `report.md#tp-01-06` |
| TP-01-07 | Adversarial | unit | SCN-018-019 | `scripts/selftest.mjs` | a nominal envelope carrying `type=daily_treasury_real_yield_curve` PASSES `validateSourceProvenance` and is REFUSED by the feature gate — the binding gap the frozen contract cannot close, proven from both sides | `node scripts/selftest.mjs` | No | `report.md#tp-01-07` |
| TP-01-08 | Contract | unit | SCN-018-020 | `scripts/selftest.mjs` | `declaredPolicy` equals the committed `bond-regime-universe.json` policy block byte-for-byte, `persistence` reads `same-origin-artifact`, `rights` reads `public-official`, and a family writing `persistence: "browser-cache"` is refused | `node scripts/selftest.mjs` | No | `report.md#tp-01-08` |
| TP-01-09 | Compatibility | unit | SCN-018-021 | `scripts/selftest.mjs` | every pre-existing `SOURCE_IDS` key and `SOURCE_POLICIES` entry retains its name, shape and values, and the only difference is the two added Treasury entries | `node scripts/selftest.mjs` | No | `report.md#tp-01-09` |
| TP-01-10 | Guard | integration | SCN-018-022 | `scripts/validate-spec-test-paths.mjs` | the spec-test-path guard reports no new missing path across this feature's artifacts and exits 0, with `scripts/validate-spec-test-paths.baseline` byte-identical | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-01-10` |
| TP-01-11 | Regression | integration | SCN-018-021 | `scripts/selftest.mjs` | Regression: every pre-existing provenance group in the suite stays green after the allowlist extension, so an appended entry can never be mistaken for a safe edit of an existing one | `node scripts/selftest.mjs` | No | `report.md#tp-01-11` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [x] `rlcontracts.js` carries the two additive Treasury `SOURCE_IDS` keys and the two `SOURCE_POLICIES` entries in the `pathPrefix` form, with `SOURCE_KINDS` unchanged, proven by TP-01-09.

  **Claim Source:** executed — TP-01-09 reads the exported structures directly.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-01-09: every pre-existing SOURCE_IDS key survives the extension
    ✓ Official curves TP-01-09: the ONLY difference is the two added Treasury entries
    ✓ Official curves TP-01-09: SOURCE_KINDS is unchanged — official-report already admits a daily yield-curve publication
    ✓ Official curves TP-01-05: the two added allowlist entries introduce no host beyond home.treasury.gov

  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] Every pre-existing `SOURCE_IDS` key and `SOURCE_POLICIES` entry is byte-identical, proven by TP-01-09 and TP-01-11.

  **Claim Source:** executed — the five pre-existing policy entries are compared against a literal expectation held in the test, and the canary was taken before any gate work.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-01-09: every pre-existing SOURCE_POLICIES entry retains its shape and values byte-for-byte

  CANARY, allowlist entries only, no gate work:
  Research-Lab self-test: 1371 passed, 0 failed
  EXIT=0

  AFTER the gate, fixtures and the new group:
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] `scripts/validate-official-curves.mjs` exists, exposes `validateOfficialCurves`, runs as a command, and carries no `--skip`, `--force`, `--ignore` or `--bypass` flag, proven by TP-01-03.

  **Claim Source:** executed — the gate was run as a command and a bypass flag was attempted.

  ```text
  $ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/conformant.json
  [official-curves] PASS: tests/fixtures/official-curves/conformant.json satisfies official-curve-artifact/v1
  exit=0

  $ node scripts/validate-official-curves.mjs --force tests/fixtures/official-curves/conformant.json
  [official-curves] --force is not a flag on this gate and never will be.
  EXIT=2
  ```

- [x] All eleven gate checks are implemented and each has a distinct named error, proven by TP-01-03 refusing seven adversarial fixtures with seven distinct causes.

  **Claim Source:** executed — seven fixtures, seven distinct causes, asserted as distinct.

  ```text
  $ node scripts/validate-official-curves.mjs <each fixture>
  conformant                 exit=0 errors=0
  missing-required-field     exit=1 family-field-missing
  credentialed-envelope      exit=1 provenance-invalid:secret-shaped-request-field
  restricted-observation     exit=1 restricted-observation-present
  off-host-source-url        exit=1 off-host-source-url
  query-binding-mismatch     exit=1 source-id-to-query-binding-invalid
  partial-row                exit=1 row-partial
  observed-at-drift          exit=1 observed-at-mismatch

    ✓ Official curves TP-01-03: the seven adversarial fixtures produce seven DISTINCT causes, so no two are refused for the same reason
  EXIT=0
  ```

- [x] The gate calls `validateSourceProvenance` from `rlcontracts.js` and restates none of its rules locally, proven by TP-01-07 showing the shared validator accepting the query-binding fixture that the feature gate refuses.

  **Claim Source:** executed — the shared validator was driven directly over the mis-bound envelope.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-01-07: the SHARED validator ACCEPTS the mis-bound envelope — one host, one method, one path prefix, so the frozen contract cannot express this rule
    ✓ Official curves TP-01-07: the feature gate REFUSES the same envelope, closing the gap the shared contract structurally cannot

  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] The source-id-to-query binding check refuses a nominal envelope carrying the real-yield query, proven by TP-01-07.

  **Claim Source:** executed — the gate names the expected and the found query type.

  ```text
  $ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/query-binding-mismatch.json
  [official-curves] FAIL
    - source-id-to-query-binding-invalid at artifact.families.nominal.provenance[0].requestDescriptor.query.type — us-treasury-nominal requires type=daily_treasury_yield_curve, found daily_treasury_real_yield_curve
  exit=1

    ✓ Official curves TP-01-07: the two families are distinguished by query type, the only field that separates them
  EXIT=0
  ```

- [x] **R-4 settled:** `declaredPolicy` holds the committed policy block verbatim, `persistence` states `same-origin-artifact`, `rights` carries `public-official` unaltered, and a family writing `persistence: "browser-cache"` onto a committed file is refused, proven by TP-01-08.

  **Claim Source:** executed — all four halves of the settlement asserted, including the refusal.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-01-08: declaredPolicy holds the committed policy block byte-for-byte
    ✓ Official curves TP-01-08: the declared policy still reads browser-cache while the committed copy states same-origin-artifact
    ✓ Official curves TP-01-08: rights carries public-official unaltered
    ✓ Official curves TP-01-08: a family writing persistence browser-cache onto a committed file is refused
    ✓ Official curves TP-01-08: a declaredPolicy that drifts from the committed block is refused

  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] The artifact declares its own `freshnessPolicy` block with `policyId`, `cadenceWindowRows`, `minCadenceObservations` and `publicationLagDays`, present in the conformant fixture and required by the gate, proven by TP-01-03.

  **Claim Source:** executed — the conformant fixture carries the block and the gate requires every field.

  ```text
  $ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/conformant.json
  [official-curves] PASS: tests/fixtures/official-curves/conformant.json satisfies official-curve-artifact/v1
  exit=0

  $ node scripts/acquire-official-curves.mjs   # the real write also carries it
  [official-curves] wrote data/curves/us-treasury/curve.json (130661 bytes): nominal=fresh real=fresh
  freshnessPolicy: policyId=observed-cadence/v1 cadenceWindowRows=10 minCadenceObservations=5 publicationLagDays=1
  EXIT=0
  ```

- [x] The rights and restriction sweep refuses any oas value, financial-conditions value, `restricted-local-view` string, non-`home.treasury.gov` host or credential-shaped key anywhere in the artifact, proven by TP-01-04 and TP-01-06.

  **Claim Source:** executed — each restricted shape exercised separately, not one standing in for the family.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-01-04: a financial-conditions value anywhere is refused
    ✓ Official curves TP-01-04: a restricted-local-view rights string anywhere is refused
    ✓ Official curves TP-01-06: a full sweep of the conformant artifact finds no oas value, no financial-conditions value and no restricted rights string

  $ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/restricted-observation.json
  [official-curves] FAIL
    - restricted-observation-present at artifact.families.nominal.oas — oas is restricted-local-view and must never be published
  exit=1
  ```

- [x] `bond-regime-universe.json` and `bond-regime-lab.html` are byte-identical at the end of this scope, verified by `git diff --name-only` naming neither file.

  **Claim Source:** executed — the boundary is taken from this scope's own commits.

  ```text
  $ git show --name-only --format= bb7f90b0 039ab6d4 8d1fecba | sort -u
  rlcontracts.js
  scripts/selftest.mjs
  scripts/validate-official-curves.mjs
  specs/018-headless-official-curve-publication/state.json
  tests/fixtures/official-curves/conformant.json
  tests/fixtures/official-curves/credentialed-envelope.json
  tests/fixtures/official-curves/missing-required-field.json
  tests/fixtures/official-curves/observed-at-drift.json
  tests/fixtures/official-curves/off-host-source-url.json
  tests/fixtures/official-curves/partial-row.json
  tests/fixtures/official-curves/query-binding-mismatch.json
  tests/fixtures/official-curves/restricted-observation.json

  Neither bond-regime-universe.json nor bond-regime-lab.html appears.
  EXIT=0
  ```

- [x] **R-5 settled:** no artifact in this feature directory names a `tests/*.mjs` path that is absent from disk, and `scripts/validate-spec-test-paths.baseline` is byte-identical, proven by TP-01-10.

  **Claim Source:** executed — the guard reports new=0 and the baseline is unchanged.

  ```text
  $ node scripts/validate-spec-test-paths.mjs
  [spec-test-paths] scanned=510 references=11769 distinctPaths=218 missingPaths=86 baseline=86 new=0 stale=0
  [spec-test-paths] OK — no new missing test path(s)
  EXIT=0

  $ git status --porcelain scripts/validate-spec-test-paths.baseline
  (no output — the frozen baseline is byte-identical)
  ```

#### Test Evidence Items - Exact Parity With 11 Test Plan Rows

- [x] TP-01-01 executed with raw output recorded at `report.md#tp-01-01`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-01-01: the conformant artifact passes the gate with zero errors
    ✓ Official curves TP-01-01: a fresh family carries a source id and an https URL on the declared official host
    ✓ Official curves TP-01-01: a fresh family carries an observation as-of date and a canonical retrieval time
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] TP-01-02 executed with raw output recorded at `report.md#tp-01-02`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-01-02: a credential-shaped query key is refused with secret-shaped-request-field
  $ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/credentialed-envelope.json
  [official-curves] FAIL
    - provenance-invalid:secret-shaped-request-field at artifact.families.nominal.provenance[0].requestDescriptor.query.api_key
    - secret-shaped-field at artifact.families.nominal.provenance[0].requestDescriptor.query.api_key
  exit=1
  EXIT=0
  ```

- [x] TP-01-03 executed with raw output recorded at `report.md#tp-01-03`.

  ```text
  $ node scripts/validate-official-curves.mjs <each of the eight fixtures>
  conformant                 exit=0 errors=0
  missing-required-field     exit=1 family-field-missing
  credentialed-envelope      exit=1 provenance-invalid:secret-shaped-request-field
  restricted-observation     exit=1 restricted-observation-present
  off-host-source-url        exit=1 off-host-source-url
  query-binding-mismatch     exit=1 source-id-to-query-binding-invalid
  partial-row                exit=1 row-partial
  observed-at-drift          exit=1 observed-at-mismatch
  EXIT=0
  ```

- [x] TP-01-04 executed with raw output recorded at `report.md#tp-01-04`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-01-04: a financial-conditions value anywhere is refused
    ✓ Official curves TP-01-04: a restricted-local-view rights string anywhere is refused
  $ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/restricted-observation.json
  [official-curves] FAIL
    - restricted-observation-present at artifact.families.nominal.oas — oas is restricted-local-view and must never be published
  exit=1
  EXIT=0
  ```

- [x] TP-01-05 executed with raw output recorded at `report.md#tp-01-05`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-01-05: the committed bond source policy matches none of api_key, fredgraph, series/BAML, series/NFCI
    ✓ Official curves TP-01-05: the two added allowlist entries introduce no host beyond home.treasury.gov
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] TP-01-06 executed with raw output recorded at `report.md#tp-01-06`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-01-06: a full sweep of the conformant artifact finds no oas value, no financial-conditions value and no restricted rights string
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] TP-01-07 executed with raw output recorded at `report.md#tp-01-07`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-01-07: the SHARED validator ACCEPTS the mis-bound envelope — one host, one method, one path prefix, so the frozen contract cannot express this rule
    ✓ Official curves TP-01-07: the feature gate REFUSES the same envelope, closing the gap the shared contract structurally cannot
    ✓ Official curves TP-01-07: the two families are distinguished by query type, the only field that separates them
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] TP-01-08 executed with raw output recorded at `report.md#tp-01-08`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-01-08: declaredPolicy holds the committed policy block byte-for-byte
    ✓ Official curves TP-01-08: the declared policy still reads browser-cache while the committed copy states same-origin-artifact
    ✓ Official curves TP-01-08: rights carries public-official unaltered
    ✓ Official curves TP-01-08: a family writing persistence browser-cache onto a committed file is refused
    ✓ Official curves TP-01-08: a declaredPolicy that drifts from the committed block is refused
  EXIT=0
  ```

- [x] TP-01-09 executed with raw output recorded at `report.md#tp-01-09`.

  ```text
  $ node scripts/selftest.mjs
    ✓ Official curves TP-01-09: every pre-existing SOURCE_IDS key survives the extension
    ✓ Official curves TP-01-09: every pre-existing SOURCE_POLICIES entry retains its shape and values byte-for-byte
    ✓ Official curves TP-01-09: the ONLY difference is the two added Treasury entries
    ✓ Official curves TP-01-09: SOURCE_KINDS is unchanged — official-report already admits a daily yield-curve publication
  EXIT=0
  ```

- [x] TP-01-10 executed with raw output recorded at `report.md#tp-01-10`.

  ```text
  $ node scripts/validate-spec-test-paths.mjs
  [spec-test-paths] scanned=510 references=11769 distinctPaths=218 missingPaths=86 baseline=86 new=0 stale=0
  [spec-test-paths] OK — no new missing test path(s)
  EXIT=0
  ```

- [x] TP-01-11 executed with raw output recorded at `report.md#tp-01-11`.

  ```text
  $ node scripts/selftest.mjs   # CANARY: allowlist entries only, before any gate work
  Research-Lab self-test: 1371 passed, 0 failed
  EXIT=0

  $ node scripts/selftest.mjs   # after the gate, fixtures and the new group
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

#### Build Quality Gate

- [x] `node scripts/selftest.mjs` exits 0 on the working tree with the new group registered and zero skipped assertions.

  ```text
  $ node scripts/selftest.mjs
  Research-Lab self-test: 1427 passed, 0 failed
  EXIT=0
  ```

- [x] `node scripts/validate-official-curves.mjs` exits 0 against `tests/fixtures/official-curves/conformant.json` and exits non-zero against each of the seven adversarial fixtures.

  ```text
  $ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/conformant.json
  [official-curves] PASS: tests/fixtures/official-curves/conformant.json satisfies official-curve-artifact/v1
  exit=0
  missing-required-field exit=1 · credentialed-envelope exit=1 · restricted-observation exit=1
  off-host-source-url exit=1 · query-binding-mismatch exit=1 · partial-row exit=1 · observed-at-drift exit=1
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
  $ git status --porcelain bond-regime-universe.json bond-regime-lab.html scripts/brief-refresh.mjs scripts/owner-state.mjs market-brief.payload.json market-brief.html rlbrief.js
  (no output — every excluded path is byte-identical at the end of this scope)
  EXIT=0
  ```

- [x] Zero warnings emitted by any command run for this scope, evidenced by unfiltered output of every command above.

  ```text
  $ node scripts/selftest.mjs
  Research-Lab self-test: 1427 passed, 0 failed
  $ node scripts/pii-scan.mjs
  [pii-scan] files=5648 messages=1083 findings=0 OK
  $ node scripts/validate-spec-test-paths.mjs
  [spec-test-paths] OK — no new missing test path(s)
  No warning line appears in any of the above.
  EXIT=0
  ```

