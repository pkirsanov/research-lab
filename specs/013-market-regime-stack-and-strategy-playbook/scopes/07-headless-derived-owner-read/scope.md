# SCOPE-7: Headless DERIVED owner read

**Status:** Not Started
**Tags:** `overlay:true`, `headless:true`
**Depends On:** SCOPE-4, SCOPE-5

## Objective

Publish the composed owner read deterministically from the headless refresh pipeline so the Brief consumes exactly one read regardless of publication mode. The headless `DERIVED` adapter and the browser shared-cache publication emit byte-identical output for identical frozen inputs, and the read reports `unavailable` rather than fabricating a value when its required facets are missing.

## Implementation Files

| File | Change |
|---|---|
| `scripts/brief-refresh.mjs` | Add the deterministic `DERIVED` adapter for the composed owner read (deterministic set 5 → 6). |

`./rlregime.js` is consumed as delivered by SCOPE-2 and `./market-regime-lab.html` by SCOPE-4. `data/**` snapshots stay protected — this scope reads them and writes none.

## Gherkin Scenarios

### BS-013-021: The tool publishes exactly one owner read with the full payload

```gherkin
Scenario: A single published owner read carries the complete regime contract
  Given the composing surface has a fresh-enough facet set
  When the surface publishes its regime owner read
  Then exactly one owner read is published for the regime stack
  And that read contains the regime state, the horizon, the data cutoff, the archetype or fingerprint, the confirmation count, the recorded contradictions, and a deep link to the owning surface
  And no second owner read for the same regime stack is published
```

### BS-013-022: The owner read is unavailable rather than fabricated when facets are missing

```gherkin
Scenario: A missing required facet set blocks publication of a value
  Given every facet required by the owner read is stale or unavailable
  When the composing surface attempts to publish its owner read
  Then the published read's state is "unavailable" with the missing facets named
  And no archetype, fingerprint, or confirmation count is emitted
  And no last-known, neutral, or zero value is substituted into the read
```

## Implementation Plan

1. **Deterministic adapter registration.** Register the composed owner read as a `DERIVED` adapter in `scripts/brief-refresh.mjs`, moving the deterministic set from 5 to 6. The adapter is deterministic: identical frozen inputs produce identical output on every run.
2. **`source: 'DERIVED'` marking.** Stamp the published read with the `DERIVED` source marking the pipeline already uses, so a consumer can distinguish a derived read from a fetched one without inspecting its contents.
3. **Full payload.** Publish exactly one owner read carrying the composed verdict, the archetype-or-fingerprint identity, `k/m`, `absentFacetIds`, `availability`, the ordered sleeve-fit list, the contradiction records, and the provenance fields — the complete `RegimeOwnerReadContract`, not a subset.
4. **Byte-identical parity with the browser mode.** The headless publication and the browser shared-cache publication resolve to the same bytes for the same frozen inputs. A divergence is a defect in one of the two publication sites, not an acceptable formatting difference.
5. **Evidence-family double-count guard.** Apply the `evidenceFamilyId` guard so overlapping ratio families collapse before the confirmation arithmetic in the headless path exactly as they do in the browser path.
6. **Unavailable, never fabricated.** When required facets are missing, publish `unavailable` with the reason and what-would-resolve. No interpretation prose, no partial narrative, and no placeholder verdict is emitted, and downstream Brief rendering has an explicit refusal state to consume rather than a hedged partial.
7. **Read-only consumption downstream.** The Brief's rendered verdict, denominator, and sleeve ordering match the published payload with no recomputed or upgraded value, which is what makes the single-owner-read claim checkable end to end.
8. **No snapshot writes.** The adapter reads same-origin cached snapshots produced by their own pipelines and writes none, keeping `data/**` protected.

### Test Plan

| Test ID | Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- |
| TP-07-01 | Integration | `integration` | `scripts/selftest.mjs` group `rlregime-compose` / `brief-refresh registers the composed owner read as a DERIVED adapter moving the deterministic set from 5 to 6` | **BS-013-021: The tool publishes exactly one owner read with the full payload** — `scripts/brief-refresh.mjs` registers the composed owner read as a `DERIVED` adapter, the deterministic adapter set moves from 5 to 6, and exactly one read is published stamped `source: 'DERIVED'`. | `node scripts/selftest.mjs` | No |
| TP-07-02 | Integration | `integration` | `scripts/selftest.mjs` group `rlregime-compose` / `the headless DERIVED read carries the complete RegimeOwnerReadContract payload` | **BS-013-021: The tool publishes exactly one owner read with the full payload** — the published read carries the composed verdict, the archetype-or-fingerprint identity, `k/m`, `absentFacetIds`, `availability`, the ordered sleeve-fit list, the contradiction records, and the provenance fields — the complete contract, not a subset. | `node scripts/selftest.mjs` | No |
| TP-07-03 | Integration | `integration` | `scripts/selftest.mjs` group `rlregime-compose` / `the headless read reports unavailable or partial with absentFacetIds and a shrunken denominator when facets are missing` | **BS-013-022: The owner read is unavailable rather than fabricated when facets are missing** — with required facets absent the read publishes `unavailable` or `partial` naming every `absentFacetIds` entry and shrinking the `k/m` denominator to the facets actually present, with a reason and a what-would-resolve statement and no interpretation prose, partial narrative, or placeholder verdict. | `node scripts/selftest.mjs` | No |
| TP-07-04 | Unit | `unit` | `scripts/selftest.mjs` group `rlregime-compose` / `identical frozen inputs produce an identical fingerprint and byte-identical DERIVED output on every run` | Determinism: repeated runs of the `DERIVED` adapter over the same frozen inputs produce the same fingerprint and byte-identical published output, with no clock, ordering, or iteration-order dependence leaking into the payload. | `node scripts/selftest.mjs` | No |
| TP-07-05 | Integration | `integration` | `scripts/selftest.mjs` group `rlregime-compose` / `the headless DERIVED publication and the browser shared-cache publication emit byte-identical output for identical frozen inputs` | Publication parity: the headless `DERIVED` publication and the browser shared-cache publication resolve to the same bytes for the same frozen inputs, so a divergence is surfaced as a defect in one of the two publication sites rather than accepted as a formatting difference. | `node scripts/selftest.mjs` | No |
| TP-07-06 | Unit | `unit` | `scripts/selftest.mjs` group `rlratio` / `the headless path collapses overlapping evidenceFamilyId groups before the confirmation arithmetic` | The `evidenceFamilyId` guard applies in the headless path exactly as in the browser path: overlapping ratio families collapse to one evidence family before the confirmation arithmetic, so the headless `k/m` cannot double-count a shared family. | `node scripts/selftest.mjs` | No |
| TP-07-07 | Functional | `functional` | `scripts/selftest.mjs` group `rlregime-compose` / `the DERIVED adapter reads same-origin cached snapshots and writes no data/** path` | The adapter reads same-origin cached snapshots produced by their own pipelines and writes none; `data/**` is byte-for-byte unchanged across an adapter run, keeping the protected snapshot tree read-only for this scope. | `node scripts/selftest.mjs` | No |
| TP-07-08 | Integration | `integration` | `scripts/selftest.mjs` group `rlregime-compose` / `the headless read reports unavailable or partial with absentFacetIds and a shrunken denominator when facets are missing` | **ADVERSARIAL RED-bite** — fabricate a full read from partial facets by filling the absent facets with their most recent prior values and publishing a complete verdict at the full denominator. The named test `the headless read reports unavailable or partial with absentFacetIds and a shrunken denominator when facets are missing` MUST fail under that mutation and MUST pass against the delivered adapter. | `node scripts/selftest.mjs` | No |
| TP-07-09 | Functional | `functional` | `scripts/selftest.mjs` — complete suite, every pre-existing group plus the headless `DERIVED` assertions this scope adds | Broad-suite regression: the full selftest suite stays green with the headless adapter registered, every pre-existing group (including the SCOPE-1 through SCOPE-6 groups) is preserved byte-for-byte, and the total passing count does not decrease. | `node scripts/selftest.mjs` | No |
| TP-07-10 | Regression E2E | `e2e-ui` | `tests/market-regime-lab.spec.mjs` / `Regression: BS-013-021 and BS-013-022 the browser publication carries the full payload and is unavailable rather than fabricated` | Persistent scenario-specific regression coverage for this scope's owner-read behavior: a permanently registered case in the feature's real-page regression spec re-asserts that the browser publishes exactly one owner read carrying the full declared payload, and that missing facets publish the `unavailable` state rather than a fabricated read — the same contract the headless `DERIVED` adapter must reproduce byte-identically. A divergent or fabricated payload fails this named test by name. | `npx --no-install playwright test tests/market-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Items

- [ ] `[TP-07-01]` `[BS-013-021]` `scripts/brief-refresh.mjs` registers the composed owner read as a `DERIVED` adapter, moving the deterministic set from 5 to 6 and publishing exactly one read stamped `source: 'DERIVED'`.
- [ ] `[TP-07-02]` `[BS-013-021]` The published read carries the complete `RegimeOwnerReadContract` payload: verdict, archetype-or-fingerprint identity, `k/m`, `absentFacetIds`, `availability`, ordered sleeve fits, contradiction records, and provenance.
- [ ] `[TP-07-03]` `[BS-013-022]` With facets missing the read publishes `unavailable` or `partial`, names every `absentFacetIds` entry, and shrinks the denominator to the facets actually present.
- [ ] `[TP-07-04]` Identical frozen inputs produce an identical fingerprint and byte-identical published output on every run.
- [ ] `[TP-07-05]` The headless `DERIVED` publication and the browser shared-cache publication emit byte-identical output for identical frozen inputs.
- [ ] `[TP-07-06]` The `evidenceFamilyId` guard collapses overlapping ratio families before the confirmation arithmetic in the headless path exactly as in the browser path.
- [ ] `[TP-07-07]` The adapter writes no `data/**` path; the protected snapshot tree is byte-for-byte unchanged across an adapter run.
- [ ] `[TP-07-08]` The adversarial fabricate-from-partial-facets mutation makes the named unavailable-denominator assertion fail before the delivered adapter and pass after it.
- [ ] `[TP-07-09]` The complete selftest suite stays green with the headless adapter registered, every pre-existing group preserved and no decreased passing count.
- [ ] `[BS-013-022]` A missing required facet set blocks publication of a value: the published read's state is `unavailable` with the missing facets named, no archetype, fingerprint, or confirmation count is emitted, and no last-known, neutral, or zero value is substituted.
- [ ] `[BS-013-022]` The refusal state carries a reason code and a what-would-resolve statement; no zero, dash, blank, hedged partial, or neutral verdict stands in for a missing read.
- [ ] `[BS-013-021]` The Brief's rendered verdict, denominator, and sleeve ordering match the published payload with no recomputed or upgraded value downstream.
- [ ] `scripts/brief-refresh.mjs` carries no default value, no fallback path, and no stub in the new adapter; every numeric guard uses `Number.isFinite` and the global `isFinite` appears zero times in the added code.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-07-10]` the feature's real-page regression spec holds a permanently registered case asserting that the browser publishes exactly one owner read carrying the full declared payload and that missing facets publish the `unavailable` state rather than a fabricated read.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the feature's real-page Playwright regression spec both run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.

#### Build Quality Gate

- [ ] Build Quality Gate — zero warnings across the scope's delivered surfaces; `artifact-lint.sh` clean for this spec directory; `traceability-guard.sh` clean for this spec directory; the broad `node scripts/selftest.mjs` suite green with no decreased count; no deferral language anywhere in the delivered artifacts; and `docs/` plus `notes/` synchronized with what this scope delivered.
