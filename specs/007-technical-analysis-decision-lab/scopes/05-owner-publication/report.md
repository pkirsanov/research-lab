# Scope 05 Report: Existing-Owner Publication And Strict Adapters

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Execution complete. Every command below was run in this session and the output is copied verbatim.

## Summary

Six existing specialist pages now publish a nested `rl-ta-owner-read/v1` passport inside the outer `rl-tool-read/v1` envelope they already emitted. The Feature 007 page admits or refuses those published reads through four strict adapters and reuses the Scope 01 `tadValidateOwnerRead` contract instead of inventing a second schema.

No owner formula was recomputed, no owner private function was called, no owner script was loaded, no iframe was inspected, and no owner DOM was parsed. Each publisher serializes state its own render had already computed.

## Decision Record

**D-05-1 — the two option owners are asymmetric, and the payload says so.** `options-structure-lab` bakes the dealer convention into its stored values (`computeAll` applies `signMul`), so its passport declares `signApplied: true` and a consumer must not re-sign. `gamma-trading-lab` always stores raw base-convention values and applies the flip at read time, so its passport declares `signApplied: false` and takes its regime word from `state.ev.env` rather than the sign of `snap.netGEX`. This was measured in both pages before either publisher was written. A single blanket "apply the flip" rule would be wrong for one of them.

**D-05-2 — a gamma-playbook read cannot supply option positioning by itself.** Because `signApplied` is false, `tadAdmitOptionPositioning` refuses it with `TAD-OPTION-POSITIONING-ABSENT`. That is the honest consequence of the asymmetry rather than a special case.

**D-05-3 — absence is published as absence.** `state.opt === null` (swing, intraday) and `state.agg === null` (options) are emitted as `null` payload fields plus `optionSnapshotAvailable: false` / `snapshotAvailable: false`. No publisher emits `0` for a missing level, because a zero wall reads as a real flat-gamma measurement.

**D-05-4 — Scope 05 owns no analytic primitive.** The four new `tad*` symbols are strict adapters. The remaining design backlog (`tadBuildValidationPassport`, `tadBuildComparisonSet`, and others) belongs to Scopes 06-08 and was deliberately not started here.

## Completion Statement

All nine Test Plan rows executed with recorded output. All Definition of Done items are checked with inline evidence. Four controlled breaks were applied to real source, confirmed present, detected by the intended gate, and restored. Scope 05 is Done.

## Code Diff Evidence

Six publishers, each marker-bounded, verified present exactly twice per page (open plus close marker), and each page's inline scripts verified to still compile:

```
$ node /tmp/f7-syntax-check.mjs <all seven pages>
ok   technical-analysis-decision-lab.html  inlineScripts=2  ownerReadMarkers=0
ok   options-structure-lab.html  inlineScripts=2  ownerReadMarkers=2
ok   gamma-trading-lab.html  inlineScripts=1  ownerReadMarkers=2
ok   market-heatmap-lab.html  inlineScripts=1  ownerReadMarkers=2
ok   swing-structure-lab.html  inlineScripts=1  ownerReadMarkers=2
ok   intraday-tape-lab.html  inlineScripts=1  ownerReadMarkers=2
ok   sector-research-lab.html  inlineScripts=2  ownerReadMarkers=2
RESULT: all inline scripts compile
```

`market-heatmap-lab` and `sector-research-lab` already published a generic read; both nest inside the existing envelope rather than replacing it. The other four gained a publication path they did not previously have.

## Test Evidence

### TP-05-01

```
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 1863 passed, 0 failed
================================================
```

Baseline before this scope was 1811 passed / 0 failed, so Scope 05 adds 52 assertions and breaks none.

### TP-05-02

```
$ node scripts/validate-technical-analysis-decision.mjs
[tad-validator] scope01-production-declarations-20-exact=PASS
[tad-validator] scope02-production-declarations-17-exact=PASS
[tad-validator] scope03-production-declarations-8-exact=PASS
[tad-validator] scope04-production-declarations-8-exact=PASS
[tad-validator] scope05-adapter-declarations-4-exact=PASS
[tad-validator] checks=133
[tad-validator] result=PASS
```

Baseline was 78 checks. The declaration inventory is derived from name lists, so the four new adapters had to be registered explicitly. Before registering them the validator failed `scope01-production-declarations-20-exact`, which is the inventory check working as designed.

### TP-05-03, TP-05-04, TP-05-05, TP-05-06, TP-05-07, TP-05-09

```
$ npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
  ✓  21 Regression: SCN-007-015 missing option snapshot stays unavailable and never becomes neutral gamma (896ms)
  ✓  22 Regression: SCN-007-016 option flip walls and GEX preserve one inherited convention (5.4s)
  ✓  23 Regression: SCN-007-017 OHLCV leaves footprint depth and large-trade modules unavailable (898ms)
  ✓  24 Regression: SCN-007-024 daily-only read stays useful while tactical evidence remains unavailable (655ms)
[Feature-007-owner] swing-structure-lab=published truth=current
[Feature-007-owner] intraday-tape-lab=no-data-no-publication
[Feature-007-owner] options-structure-lab=published truth=current
[Feature-007-owner] gamma-trading-lab=no-data-no-publication
[Feature-007-owner] market-heatmap-lab=published truth=current
[Feature-007-owner] sector-research-lab=published truth=unavailable
[Feature-007-owner] seededPublication=true closedCoverage=836 liveOwnersPublished=4
[Feature-007-owner] strategyValidationParity=true rlvalidKeys=7
  ✓  25 Regression: Feature 007 owner integrations preserve source cutoffs limitations and existing reads (39.6s)

  25 passed (1.2m)
```

Four real owner pages published a full envelope during the run, so the owner-matrix assertions ran against genuine output. Two pages had no data and published nothing, which is asserted explicitly: an owner without data must publish NOTHING rather than a fabricated read.

The seeded leg proves the swing publisher end to end. It seeds the shared cache through the product's own documented cache-first path (`RLDATA.putBars`), reloads the real page, and reads the envelope the page then published (`closedCoverage=836`). Without that leg the envelope assertions could pass vacuously on a machine with no market data, which would make the canary decorative.

### TP-05-08

```
$ npx --no-install playwright test tests/provider-credentials.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
  ✓  5 Regression BUG-001: legacy cleanup erases pre-BUG-002 containers and preserves current provider access (718ms)
  ✓  6 Regression BUG-001: incomplete legacy cleanup is explicit and does not alter BUG-002 configuration (767ms)
  ✓  7 Regression BUG-001: inaccessible legacy storage is unavailable, never falsely clear (509ms)
  ✓  8 Regression BUG-001: cancelling destructive cleanup preserves the legacy container (841ms)

  8 passed (9.0s)
```

## Scenario Contract Evidence

### Scenario SCN-007-015

A missing option chain snapshot is refused with `TAD-OPTION-SNAPSHOT-UNAVAILABLE`; the option owner's `truthState` stays `unavailable` and is never promoted; `levels` and `aggregates` are `null` rather than `0`; the daily owner in the same situation stays `current` and usable, so absence is scoped rather than contagious. Controlled break A made this branch return eligible and the test failed. See the adversarial table.

### Scenario SCN-007-016

Both option owners share one `signConventionId`. `options-structure-lab` declares `signApplied: true` and `gamma-trading-lab` declares `signApplied: false`, both asserted against the REAL published payload, not source text. Two disagreeing conventions refuse with `TAD-OPTION-CONVENTION-CONFLICT` instead of silently re-signing one. Neither publisher block contains a sign multiplication.

### Scenario SCN-007-017

All three microstructure contracts are unsatisfied by OHLCV bars and by an option chain snapshot. Each refusal names its exact feed requirement (tick volume at price with bid/ask or aggressor; time-stamped full-book add/move/cancel/execute; per-trade size/price/time/classification) and states that no proxy is substituted. A genuine tick feed with aggressor classification does satisfy the footprint contract, so the rule discriminates rather than always refusing.

### Scenario SCN-007-024

The daily-only situation admits both daily owners at `truthState: current`, admits no `intraday-auction/v1` owner, and reports tactical evidence as unavailable while stating that daily-eligible reads remain usable. An honest gap is not the same as a dead page.

## Owner Finding Ledger

| Owner | Observed state before | Action | Canary | Rollback unit |
| --- | --- | --- | --- | --- |
| Swing Structure | `render()` complete, no `putToolRead` | Added nested publisher after `renderAnalogs()` | `swing-structure-freshness.spec.mjs` GREEN; live publication observed `truth=current`; seeded publication `closedCoverage=836` | marker pair only |
| Intraday Tape | `render()` complete, no `putToolRead`, early return when `state.today` absent | Added nested publisher after `renderAnalogs(ova)` | no data in harness, published nothing (correct); source and fixture coverage | marker pair only |
| Options Structure | `render()` has zero locals, all state on `state`; `state.agg=null` when no chain | Added nested publisher reading `state.*` and `optRead()` | live publication observed `truth=current`; `signApplied:true` asserted at runtime | marker pair only |
| Gamma Trading | `snap` not re-signed; flip applied at read time | Added nested publisher recording `state.dealerFlip`, regime from `state.ev.env` | no data in harness, published nothing (correct); validator asserts `signApplied:false` | marker pair only |
| Market Heatmap | already published via `buildHeatToolRead` | Nested inside existing `metrics`, outer read preserved | `market-heatmap-control-surface.spec.mjs` GREEN including two tests asserting ZERO post-hydration requests | marker pair only |
| Sector Research | already published via `publishSectorRead` | Nested inside existing `metrics`, outer read preserved | live publication observed `truth=unavailable` (honest) | marker pair only |
| Strategy Validation | read-only in this scope | No change | asserted to contain neither `rl-ta-owner-read/v1` nor a Feature 007 marker; `rlvalidKeys=7` unchanged | not applicable |
| Feature 006 adapter | no producer exists in repo | Read-only adapter added in Feature 007 page | compatible, wrong-symbol, wrong-contract, wrong-cutoff, and absent all asserted | marker pair only |

## Coverage Report

Outer envelope keys, nested envelope keys, capability discriminator, owner identity, source-set id, decision cutoff, truth preservation, provisional coverage, option convention inheritance, option eligibility contract completeness, missing-as-unavailable, microstructure contract discrimination, daily-only eligibility, Feature 006 strictness, Strategy Validation parity, and the no-private-call/no-DOM-scrape rule are each covered by at least one selftest assertion and at least one validator check. The four scenario behaviours are additionally covered by a browser regression asserting user-visible text.

## Lint And Quality

```
$ node scripts/audit-reader-legibility.mjs
pages audited: 27   with view tabs: 27   errored: 0   total leaks: 0
```

Owner-page impact sweep:

```
$ npx --no-install playwright test tests/market-heatmap-control-surface.spec.mjs \
    tests/swing-structure-freshness.spec.mjs \
    tests/simple-model-adapters-strategy-property.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
  ✓  11 BUG-004 SCN-B004-B: ready Simple applies all five registry controls with owner parity and zero post-hydration requests (17.1s)
  ✓  12 BUG-004 SCN-B004-C: direct Power applies native treemap controls with zero post-hydration requests (38.4s)
  ✓  13 BUG-004 SCN-B004-D: boot hydrates the union of both groupings, so the grouping lever acquires nothing (25.1s)

  13 passed (1.8m)
```

The two ZERO-post-hydration-request assertions are direct evidence that the nested publisher adds no network work to an owner's render.

Node suite, measured against a clean tree in this same session:

```
clean tree (git stash):   # tests 873   # pass 849   # fail 24
with Scope 05 changes:    24 failing test names
```

Identical failure count. Every failing name is a pre-existing registry-count pin in Features 002 and 012 (for example `Regression: SCN-002-001 current registry freezes 22 source reads and one non-recursive final aggregator` and `SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift`). None mentions Feature 007, owner reads, or any file this scope touched. One earlier run of the same command reported 25 failures; re-running produced 24 twice, so that reading was a flake and is recorded here rather than omitted.

## Spot-Check Recommendations

Open `technical-analysis-decision-lab.html?fixture=owner-publication` and read the Owner evidence admission band: five situations, the aggregate admission count, the option refusal codes, the established convention with its conflict note, and the three microstructure modules with their exact feed requirements. Then open `options-structure-lab.html` and `gamma-trading-lab.html` and compare their `signApplied` values in the published `RLDATA.toolRead(...)` envelope.

## Validation Summary

All nine Test Plan rows executed with recorded output. Selftest 1863/0, validator 133 checks PASS, Feature 007 browser suite 25/25, credential canary 8/8, owner-page sweep 13/13, reader legibility 0 leaks across 27 pages, node suite at clean-tree parity.

## Audit Verdict

Three defects were found by probing observed behaviour, and all three were fixed rather than deferred.

**D1 — summary facts described one situation while five were displayed.** The band populated its four facts from the `complete` situation only, so a reader would have seen "Option positioning: eligible" directly above a record refusing it. Found because the SCN-007-015 assertion read the visible fact and disagreed with the per-situation record. Fixed by aggregating across every situation and naming the distinct refusal codes.

**D2 — two assertions banned a word the required disclaimer contains.** `iframe` was banned from the page source, but its only occurrence was the comment stating the page never inspects one. `neutral` was banned from the option refusal, but that refusal is REQUIRED to say "neutral dealer positioning are not inferred from absence". Both would have forced deleting the disclaimer to pass, inverting the scenario. Fixed by stripping comments before scanning for the act, banning the affirmative claim with negative lookbehind, and separately asserting the disclaimer is PRESENT.

**D3 — the sign-convention asymmetry was asserted only against fixture data.** Controlled break B flipped `signApplied` in the real options-structure publisher and the selftest stayed green at 1863, because its asymmetry assertions read the checked-in fixture rather than the page. The validator caught it, but a source-token check cannot observe what a page emits at runtime. SCN-007-016 now reads the REAL published payload from each option owner; re-running the same break with that assertion in place fails the test.

### Adversarial verification

Each break was confirmed present with `grep -c 'CONTROLLED BREAK'` before its run, so no result is a false negative from an edit that never landed.

| Break | Change | Detected by | Isolation |
| --- | --- | --- | --- |
| A | absent snapshot returns eligible | selftest 2 assertions; browser SCN-007-015 | SCN-007-016 stayed GREEN |
| B | options-structure publishes `signApplied: false` | validator `scope05-options-sign-applied-true` | selftest stayed GREEN, recorded as D3 |
| B2 | same break after adding the runtime assertion | browser SCN-007-016 | fails on the emitted value, not source text |
| C | footprint check always returns true | selftest 2 assertions; browser SCN-007-017 | SCN-007-015 and 016 unaffected |
| D | breadth publisher drops `limitations` | validator `scope05-nested-keys-complete-market-breadth-v1` | marker pair only |

Breaks A and C together produced exactly two browser failures (015 and 017) while 016 passed, demonstrating the tests fail for their own reason rather than collectively. All breaks were restored from `/tmp/f7-backup`; the restored tree was re-verified at `breaks remaining: 0`, selftest 1863/0, validator 133 PASS.

## Uncertainty Declarations

1. **Two owner pages published nothing during the browser run.** `intraday-tape-lab` and `gamma-trading-lab` had no data in the harness, so their publication paths did not execute. Their envelope shape is covered by the validator at source level, by the selftest against fixture data, and by the shared marker and key checks, but not by an observed runtime envelope. The seeded leg proves the pattern for `swing-structure-lab`; it was not extended to the option pages because seeding a synthetic option chain would require asserting against a chain shape this scope does not own.

2. **`signApplied` for gamma-trading is asserted conditionally at runtime.** The browser assertion runs only when that page actually publishes. When it does not, the guarantee falls back to the validator source check. This is stated rather than hidden, because a conditional assertion that never runs would otherwise look like coverage it is not.

3. **Feature 006 has no live producer.** The adapter is exercised against fixture envelopes covering compatible, wrong-symbol, wrong-contract, wrong-cutoff, and absent cases. No page in this repository publishes `tdc-tool-read/v1`, so no end-to-end admission has been observed.
