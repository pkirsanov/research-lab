# Scope 02: Yahoo Extended-Hours Evidence

**Status:** In Progress (implementation complete; certification owned by bubbles.validate)
**Depends On:** 01
**Scope-Kind:** runtime-behavior
**Requirements:** FR-093 through FR-109, FR-120, FR-131 through FR-132; NFR-016 through NFR-023

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [user validation](../../uservalidation.md)

## Outcome

Produce one bounded, source-reviewed XNYS/Yahoo evidence vertical: an explicit committed calendar, exact allowlisted `includePrePost=true` five-minute acquisition, normalized cutoff-safe session objects, official-versus-indicative price context, and exact like-window volume context. A provider failure or incompatible observation becomes a typed unavailable/thin/disputed result; no alternate provider or inferred value is substituted.

### Gherkin Scenarios

#### SCN-002-017: Preserve the official close and publish indicative extended-hours context

```gherkin
Scenario: SCN-002-017 keeps the prior official close separate from indicative extended-hours evidence
  Given a reviewed XNYS calendar row, a prior exact official-close bar, and fresh split-compatible Yahoo pre-market or after-hours bars are available by cutoff
  When the production source adapter classifies, aggregates, and compares the current session
  Then the official regular close remains a separate timestamped anchor
  And the extended-hours open, high, low, latest, valid VWAP, and return are labeled indicative
  And current cumulative volume is compared only with the same session kind and completed bucket window with sample, coverage, and robust baseline disclosure
  And a split, source mismatch, thin sample, absent volume, or missing exact close suppresses only the unsupported comparison or claim
```

#### SCN-002-028: Enforce the exact source request, use policy, bounds, freshness, and no-write smoke

```gherkin
Scenario: SCN-002-028 acquires extended-hours evidence only through the reviewed source contract
  Given the committed config declares the NYSE calendar and Yahoo request and source-use policies with no implicit value
  When the production acquisition adapter requests one configured symbol
  Then it uses HTTPS on the exact allowlisted origins and request shapes with bounded retries, bytes, timestamps, bars, and acquisition time
  And it records source identity, request descriptor, source and retrieval clocks, exact accepted-byte hash, access class, retention decision, and freshness
  And redirects, credentials, unknown fields, malformed arrays, post-cutoff bars, unreviewed retention, or an uncovered calendar date fail loud without a fallback source
  And the live source smoke writes no repository file and makes no deterministic market-value claim
```

### Implementation Plan

1. Add `scripts/generate-xnys-calendar.mjs::{parseNyseCalendarSource,materializeXNYSCalendar,validateCalendarCoverage}` and the exact `--config <path> [--check]` CLI. Materialize every covered date, named closure, early close, local/UTC boundary, next open, source hash, and Node/IANA timezone version into `data/calendars/xnys/calendar.json`; `--check` compares canonical bytes without writing.
2. Add the exact `SourceRequestPolicy/v1` and `SourceUsePolicy/v1` objects to `market-brief.config.json` for `nyse-hours-calendar` and `yahoo-chart`. Require explicit reviewed decisions and retention modes; policy metadata records the decision basis and never asserts rights from public reachability alone.
3. Add `scripts/market-session-evidence.mjs::{loadSourcePolicies,validateSourceRequest,fetchWithSourcePolicy,fetchYahooSessionSource,acquireMarketSessionEvidence}`. Use built-in Node `fetch`, `redirect: "error"`, exact query keys (`interval=5m`, `range=1mo`, `includePrePost=true`, `includeAdjustedClose=true`, split/dividend events), closed retry classes, the 120-second acquisition ceiling, 8 MiB/10,000 timestamp caps, and safe attempt diagnostics.
4. Normalize at most 200 bars per symbol/trading date with explicit five-minute start/end semantics, complete OHLC validation, one calendar/session assignment, bucket index, `provider-chart-basis`, source lineage, and distinct `observed`, `observed-zero`, and `missing` volume states.
5. Resolve the prior official close only from the exact final regular bar ending at the prior calendar close. Preserve current extended-hours latest separately; block returns and pre-action comparable candidates across split/reverse-split or unresolved event disagreement, and disclose qualifying cash-dividend context.
6. Build current aggregates and exact same-kind/same-boundary/same-provider/same-bucket baselines through the Scope 01 foundation. Persist only compact accepted normalized observations, derived summaries, hashes, and reviewed citations under the design budgets; raw upstream bodies are discarded after normalization.
7. Add `scripts/market-session-evidence-live-check.mjs --symbols SPY --no-write` as a read-only structural smoke. It must report current structural evidence or a truthful unavailable state, scan before/after repository state internally, and never serve as fixed numerical proof.

### Change Boundary

**Allowed:** `market-brief.config.json` source/evidence policy blocks; new calendar/evidence scripts; `data/calendars/xnys/calendar.json`; bounded generated `data/session-bars/**`; Scope 02 fixtures/tests; additive imports of Scope 01 contracts.

**Excluded:** owning model formulas/interpretations, BLS/report/consensus/reaction logic, registry briefing metadata, tool reads/briefs/final authoring, current/history pointers, scheduler Git publication, shared renderer/pages, legacy history, package/dependency files, other specs, and unrelated dirty/untracked paths.

### Consumer Impact Sweep

Inventory consumers of `scripts/fetch-bars.mjs`, current daily snapshots, Market Brief window labels, Intraday Tape's regular-only segmentation, and any existing Yahoo URL helper. The new adapter must not change daily-bar semantics or silently repoint existing callers. Search navigation, docs, config, scripts, tests, and generated path inventories for stale claims that pre/post evidence is daily/full-day or that an extended-hours latest is a close.

### Shared Infrastructure Impact Sweep

The committed calendar, source policy, and acquisition module are shared foundations for later owner reads. Independent canaries verify existing daily fetch/Market Brief selftest behavior, exact source-policy rejection, calendar byte stability, and no mutation outside the scope-owned generated roots. Rollback removes the additive adapter/policy and restores the previous daily-only consumer path without altering any committed evidence/history object or unrelated root state.

### Test Plan

Captured NYSE/Yahoo response bytes are external-boundary fixtures used only in `functional` contract tests. Live categories use the real production adapter and either committed accepted snapshots or actual allowlisted read-only source calls; no internal request interception or owned-logic mock is permitted.

| Test Type | Category | Scenario | File / Exact Test Title | Command | Live System | Red -> Green Contract |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | unit | SCN-002-028 | `tests/market-session-evidence.unit.mjs` - `SCN-002-028: source policy accepts only the exact NYSE and Yahoo request contracts` | `node --test tests/market-session-evidence.unit.mjs` | No | Red: unknown origin/query/redirect/retention can pass; Green: exact allowlist and use-decision rules reject every mutation. |
| Functional | functional | SCN-002-017 | `tests/market-session-evidence.functional.mjs` - `SCN-002-017: captured Yahoo bytes normalize official and indicative session fields without missing-volume coercion` | `node --test tests/market-session-evidence.functional.mjs` | No | Red: provider arrays or missing fields are trusted; Green: production parser computes normalized observations and rejects malformed bytes. |
| Functional | functional | SCN-002-028 | `tests/market-session-evidence.functional.mjs` - `SCN-002-028: Yahoo and NYSE fixture mutations enforce bounds retries provenance and source use` | `node --test tests/market-session-evidence.functional.mjs` | No | Red: oversize/redirect/schema/use-policy faults leak through; Green: each external-boundary mutation returns its closed safe reason. |
| Integration | integration | SCN-002-028 | `scripts/generate-xnys-calendar.mjs` - `--check` validates committed canonical calendar bytes | `node scripts/generate-xnys-calendar.mjs --config market-brief.config.json --check` | Yes | Red: committed calendar is absent or differs from reviewed source projection; Green: production generator validates exact canonical bytes without writing. |
| Integration | integration | SCN-002-028 | `scripts/market-session-evidence-live-check.mjs` - read-only Yahoo/NYSE structural smoke | `node scripts/market-session-evidence-live-check.mjs --symbols SPY --no-write` | Yes | Red: live adapter violates structure/policy or writes; Green: actual source path yields valid structure or typed unavailability with unchanged repository state. |
| Regression E2E | e2e-api | SCN-002-017 | `tests/market-session-evidence.source.e2e.mjs` - `Regression: SCN-002-017 publishes separate official and indicative price with exact-window volume context` | `node --test tests/market-session-evidence.source.e2e.mjs` | Yes | Red: real committed source graph relabels latest or compares full-day volume; Green: pointer-ready evidence graph preserves labels, refs, buckets, and suppression. |
| Regression E2E | e2e-api | SCN-002-028 | `tests/market-session-evidence.source.e2e.mjs` - `Regression: SCN-002-028 source acquisition is bounded reviewed fail-loud and no-write` | `node --test tests/market-session-evidence.source.e2e.mjs` | Yes | Red: production acquisition can escape policy/caps or mutate undeclared paths; Green: live/committed graph and mutation checks prove containment. |
| Full Regression | e2e-api | SCN-002-017, SCN-002-028 | Feature evidence foundation and source E2E suite | `node --test tests/market-session-evidence.foundation.e2e.mjs tests/market-session-evidence.source.e2e.mjs` | Yes | Red: a prior foundation/source scenario regresses; Green: every Scope 01-02 persistent scenario remains green together. |
| Baseline | functional | SCN-002-017, SCN-002-028 | Existing complete repository selftest | `node scripts/selftest.mjs` | Yes | Red: shared source changes alter existing owner/daily behavior; Green: the unchanged repository baseline passes. |

### Definition of Done - Tiered Validation

Core outcomes:

- [x] The committed XNYS projection, exact source/request/use policies, Yahoo normalizer, official-close anchor, extended-hours aggregate, comparable-volume result, and read-only source smoke implement the design contracts with no alternate-source or weekday fallback. — Evidence: [report.md](report.md#test-evidence-one-block-per-test-plan-row) (TP-02-01 unit + TP-02-04 calendar `--check` OK 365 rows + TP-02-05 live smoke + TP-02-09 selftest 572/0); code byte-identical to HEAD `e8328b7`.
- [x] SCN-002-017 and SCN-002-028 preserve cutoff, provenance, freshness, adjustment, official-versus-indicative, exact-bucket, thin/unavailable/disputed, and missing-versus-zero truth in machine and user-facing summaries. — Evidence: [report.md](report.md#scenario-contract-evidence) (functional TP-02-02/TP-02-03 + source.e2e TP-02-06/TP-02-07 GREEN).
- [x] Consumer and Shared Infrastructure Impact Sweeps are complete; daily-bar/current consumers remain compatible, independent canaries pass, and the narrow rollback is proven. — Evidence: [report.md](report.md#consumer-and-shared-infrastructure-sweep); the adapter is additive (no existing caller repointed) and `node scripts/selftest.mjs` = 572/0 confirms the daily-fetch + Market Brief canaries unchanged.
- [x] The declared Change Boundary is respected and every unrelated dirty or untracked path remains unchanged and unstaged. — Evidence: `git status --porcelain` empty; six Scope 02 code files byte-identical to HEAD (report.md byte-identity audit).

Test evidence items, one per Test Plan row:

- [x] [TP-02-01] Unit evidence passes for the exact NYSE/Yahoo request-policy title after its recorded red stage. — RED (host guard disabled → `expected rejection for host-not-allowlisted` true!==false unit:417, exit 1) then GREEN (unit 5/5, exit 0); [report.md](report.md#tp-02-01--unit-source-policy-allowlist-scn-002-028).
- [x] [TP-02-02] Functional evidence passes for captured Yahoo normalization after its recorded red stage; the fixture is classified only as an external contract input. — RED (null→0 coercion → `0 !== null` functional:47, exit 1) then GREEN (functional 2/2, exit 0); [report.md](report.md#tp-02-02--functional-captured-yahoo-normalization-scn-002-017).
- [x] [TP-02-03] Functional evidence passes for source mutation, bounds, retry, provenance, and use-policy rejection after its recorded red stage. — RED (redirect guard disabled → `expected failure B002-SOURCE-REDIRECT` true!==false functional:116, exit 1) then GREEN (functional 2/2, exit 0); [report.md](report.md#tp-02-03--functional-source-mutationsboundsretryprovenanceuse-scn-002-028).
- [x] [TP-02-04] Integration evidence passes for the canonical calendar `--check` command without repository writes. — `--check OK` 365 rows / 251 open, exit 0; [report.md](report.md#tp-02-04--integration-calendar---check-no-write--exit-0--claim-source-executed).
- [x] [TP-02-05] Integration evidence passes for the live no-write source smoke without fixed-value claims. — `structural=unavailable market-closed weekend`, `no-write verified`, `OK`, exit 0; [report.md](report.md#tp-02-05--integration-live-no-write-source-smoke--exit-0--claim-source-executed).
- [x] [TP-02-06] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-017 pass with the exact title. — `Regression: SCN-002-017 …` GREEN in source.e2e / combined suite, exit 0.
- [x] [TP-02-07] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-028 pass with the exact title. — `Regression: SCN-002-028 …` GREEN in source.e2e / combined suite, exit 0.
- [x] [TP-02-08] Broader E2E regression suite passes for the combined foundation and source graph. — `node --test tests/market-session-evidence.foundation.e2e.mjs tests/market-session-evidence.source.e2e.mjs` = 6/6, exit 0.
- [x] [TP-02-09] Baseline functional evidence passes for `node scripts/selftest.mjs` after focused checks are green. — `Research-Lab self-test: 572 passed, 0 failed`, exit 0.

Build quality gate:

- [x] Exact Node checks, artifact and source-use/security validation, skip/interception/self-validation scans, cross-platform shell checks for touched scripts, diff isolation, and full output are recorded in this scope report with zero warning or undeclared mutation. — Evidence: [report.md](report.md#lint-and-quality); selftest 572/0 (no warning), working tree clean, no skip/mock introduced, Scope 02 code byte-identical to HEAD.
