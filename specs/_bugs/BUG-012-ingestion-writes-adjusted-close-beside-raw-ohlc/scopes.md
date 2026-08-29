# Scopes: BUG-012 — Coherent Bars, A Pinned Fixture, And A Failure That Can Speak

**All three scopes are implemented and committed.** The packet was originally filed under an
instruction to document and not fix; that instruction has since been discharged. The contract
decision `design.md` §2 recorded as open was resolved to **Option B** (all four OHLC fields raw,
the adjusted close carried in its own `ac` field) — see Scope 01's first Definition of Done item
for the reason it was preferred. The `design.md` §3 decoupling choice was resolved to **pinned
fixture inputs** — see Scope 02.

The three fixes are commits `8694d8696` (Scope 01), `e2499ab8a` (Scope 03) and `13ef48db9`
(Scope 02), on top of the filing commit `658a991f8`.

Scope order is causal, not arbitrary. Scope 01 removes the defect. Scope 02 stops an unrelated
scheduled job from reintroducing a red. Scope 03 makes the next data break legible instead of
invisible. Scope 03 is independent of the other two and would have paid for itself already: it is
what turns a debugging session into a glance.

**Evidence provenance.** Every corpus scan, Playwright run, headless boot and model replay quoted
as inline evidence below was executed **earlier in this session** and is recorded here as a reported
observation, not re-derived. Four checks were re-executed by the agent ticking these items —
`node scripts/selftest.mjs`, `node scripts/validate-bars-coherence.mjs`,
`node scripts/validate-agenda-fixture-pin.mjs`, and `artifact-lint.sh` on this packet — together with
read-only `git` and file inspection. Those are tagged `executed` below; everything else is tagged
`reported`. The Playwright suite was **not** run in the ticking session.

## Scope 1: 01-restore-ohlc-coherence-in-bars-ingestion

**Status:** Done
**Depends On:** none
**Owner:** delivered in commit `8694d8696`

### Change Boundary

| Allowed | Forbidden |
|---|---|
| `scripts/fetch-bars.mjs` — the price-basis contract chosen per `design.md` §2 | `rlagenda.js` refusal rules, error codes, and field names (INV-012B-4) |
| A one-time coherence repair of existing rows under `data/bars/` | `playwright.config.mjs` — no global `timeout`, no `retries` |
| A committed coherence guard wired into `node scripts/selftest.mjs` | `tests/fixtures/research-agenda/reversal-ui.json` (Scope 02 owns it) |
| This packet's own artifacts | `research-agenda-lab.html` (Scope 03 owns the error path) |
| — | The `BUG-011` packet and its delivered change |

### Gherkin Scenarios

```gherkin
Feature: BUG-012 Bars ingestion emits coherent rows

  Scenario: SCN-012B-001 A written row cannot claim a low above its own close
    Given fetch-bars trimBars line 152 takes c from the adjusted-close series
    And line 155 takes o, h and l from the raw quote series
    When bars are ingested for any symbol
    Then every emitted row satisfies l <= min(o, c) and h >= max(o, c) and l <= h
    And no emitted row can violate those relations under any adjustment factor

  Scenario: SCN-012B-002 One row carries one price basis
    Given dividend adjustment scales historical prices downward
    When a row is written
    Then o, h, l and c are all raw or all adjusted on the same basis
    And an adjusted close never displaces c beside a raw low

  Scenario: SCN-012B-003 The existing corpus is repaired, not only future writes
    Given 245 of 293 files under data/bars carry at least one incoherent row
    And 71714 of 150161 rows satisfy l > min(o, c)
    When the corpus is scanned after the fix
    Then zero rows violate OHLC coherence
    And the COP row at 2026-08-13T13:30Z is coherent

  Scenario: SCN-012B-004 The validator is not weakened to accept bad bars
    Given rlagenda.js line 1718 refuses a bar whose low exceeds both open and close
    When the committed diff is reviewed
    Then that condition is byte-identical
    And the RLAGENDA-MODEL-INVALID code and currentBars field naming are unchanged
```

### Implementation Plan

1. Record the chosen price-basis contract — Option A or Option B from `design.md` §2 — in this
   packet, with the reason it was chosen over the other.
2. Apply it in `scripts/fetch-bars.mjs` so the four price fields of a written row share one basis.
3. Repair the existing corpus under `data/bars/` to the same contract, including the COP row the
   reversal fixture pins.
4. Add a coherence guard that fails on any row with `l > min(o, c)`, `h < max(o, c)` or `l > h`, and
   wire it into `node scripts/selftest.mjs` so the corpus cannot silently regress.
5. Change nothing in `rlagenda.js`.

### Test Plan

| Test Type | Category | File / Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Corpus coherence guard | `unit` | new guard under `scripts/` | Zero rows across all 293 bars files violate OHLC coherence | `node scripts/selftest.mjs` | No |
| Writer unit, adversarial | `unit` | `scripts/fetch-bars.mjs` coverage | A vendor payload whose adjusted close sits below the raw low cannot produce an incoherent row | `node scripts/selftest.mjs` | No |
| Validator invariance | `unit` | committed diff | `rlagenda.js` refusal condition, code, and field naming unchanged | `git --no-pager diff -- rlagenda.js` | No |
| Reversal regression | `e2e-ui` | `tests/tool-experience.spec.mjs`, `tests/contextual-tooltip.spec.mjs` | The six affected tests pass with the data corrected | `npx --no-install playwright test tests/tool-experience.spec.mjs tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Repository selftest | `unit` | `scripts/selftest.mjs` | No repository invariant broken, no assertion count reduction | `node scripts/selftest.mjs` | No |

**Adversarial note.** The decisive case is a vendor payload where the adjusted close falls **below**
the raw low — the exact condition COP hit. A writer test built only from payloads whose adjustment is
negligible would pass both before and after the change and prove nothing. The corpus guard is
likewise adversarial only if it is run against the **real** `data/bars/` corpus, where 71,714 rows
currently violate it; run against a synthetic clean sample it is tautological.

### Definition of Done — 3-Part Validation

- [x] The chosen price-basis contract is recorded in this packet with the reason it was preferred over the alternative in `design.md` §2
  - **Evidence** (`executed`, read-only): **Option B** was chosen — all four of `o`, `h`, `l`, `c` stay raw and the adjusted close is carried beside them in its own `ac` field. `scripts/fetch-bars.mjs:21` states the contract in the module header ("is carried beside them in its own field, `ac`. It used to be `c` that carried the adjusted value"); `:210` writes `row.ac = adjClose` whenever the vendor supplies it; `:261` emits `{ o, h, l, c, ac: close * adjustmentFactor, v }`. **Reason preferred over Option A:** Feature 015 is an append-only claim ledger resolved against historical price levels. Under Option A every dividend rewrites history, so a minted claim can never be checked against the prices it was minted on. Option B leaves published rows stable and gives adjustment its own field.
- [x] `scripts/fetch-bars.mjs` cannot emit a row violating `l <= min(o, c)`, `h >= max(o, c)`, `l <= h`, proven by an adversarial payload whose adjusted close falls below the raw low
  - **Evidence** (`executed`, read-only + selftest run): `scripts/selftest.mjs:8762` asserts "the emitted row satisfies l <= min(o, c) and h >= max(o, c), **on the exact vendor payload whose adjusted close falls BELOW the raw low**" — the COP condition itself, not a negligible-adjustment payload. That assertion is inside the 2534 that passed.
- [x] A scan of all 293 files under `data/bars/` reports zero incoherent rows, down from the reported 71,714
  - **Evidence** (`executed`): `node scripts/validate-bars-coherence.mjs` → `scanned 292 file(s), 150013 row(s)` / `OK: every scanned row satisfies l <= min(o, c), h >= max(o, c) and l <= h`, exit **0**. **292, not 293:** 293 `.json` files sit on disk and the scanner excludes exactly one, `index.json`, a manifest and not a symbol series (`validate-bars-coherence.mjs:50` `NON_SYMBOL_FILES`, applied at `:126`). All 292 symbol files are covered — complete corpus coverage. The scan is non-vacuous by construction; `selftest.mjs:8839` records that it "is adversarial only against the REAL corpus". Pre-fix figures were 71,714 violating rows across 245 files.
- [x] The COP row at `2026-08-13T13:30Z` is coherent, and the reversal fixture's canonical replay returns `ok=true`
  - **Evidence** — coherence (`executed`, direct read of `data/bars/COP.json`): the row at epoch `1786627800000` is `{o:125.72000122070312, h:126.38999938964844, l:124.12000274658203, c:124.5199966430664, v:7248000, ac:123.6949691772461}`; `l <= min(o,c) && h >= max(o,c) && l <= h` evaluates **true**. `c` now matches the pre-cron raw close `124.5200`, and the adjusted `123.6949691` sits in `ac` where it belongs. Canonical replay `ok=true` is `reported` from prior execution this session.
- [x] A committed coherence guard fails on an incoherent row and runs inside `node scripts/selftest.mjs`
  - **Evidence** (`executed`): `scripts/validate-bars-coherence.mjs` is committed and imported at `scripts/selftest.mjs:29` (`assertCoherentBar, formatBarsCoherenceFindings, isCoherentBar, partitionCoherentBars, validateBarsCorpus`), so the corpus scan runs inside the selftest rather than beside it.
- [x] `rlagenda.js` is unchanged: the line 1718 condition, the `RLAGENDA-MODEL-INVALID` code, and the `currentBars.<sym>` field naming are byte-identical
  - **Evidence** (`executed`): `git diff --name-only 5c978c5cb..HEAD -- rlagenda.js playwright.config.mjs` returns **empty** — neither file appears in the change set at all, which is stronger than a line-level comparison. The red went away because the data became correct, not because the validator became lenient.
- [x] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count
  - **Evidence** (`executed`): `Research-Lab self-test: 2534 passed, 0 failed`, exit **0**. Pre-fix baseline recorded in `report.md` was 2490 passed; 2534 ≥ 2490, so the count rose by 44 rather than fell.
- [x] Build Quality Gate: artifact lint passes, no absolute host path appears in any packet artifact, and every issue found during this scope was resolved in-session
  - **Evidence** (`executed`): `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-012-ingestion-writes-adjusted-close-beside-raw-ohlc` → `Artifact lint PASSED.`, exit **0**. No absolute host path appears in this packet; paths are repository-relative or written `<repo-root>`. One issue found *during* this scope was fixed in-session rather than left unresolved: the ingestion guard aborted a whole symbol's write on a single incoherent vendor row, leaving the old mixed-basis file in place — which is why the first two repair passes left 38 files unrepaired. The guard now partitions rows (`partitionCoherentBars`) instead of aborting.

## Scope 2: 02-decouple-committed-fixture-from-mutable-bars

**Status:** Done
**Depends On:** 01
**Owner:** delivered in commit `13ef48db9`

### Change Boundary

| Allowed | Forbidden |
|---|---|
| `tests/fixtures/research-agenda/reversal-ui.json` and any committed input it gains | `scripts/fetch-bars.mjs` (Scope 01 owns it) |
| The fixture bar loader in `research-agenda-lab.html` if the chosen shape requires it | Any change to the six tests' assertions |
| This packet's own artifacts | `playwright.config.mjs` |
| — | Moving `attemptedAt` to skip the corrupted row — prohibited by `design.md` §5 |

### Gherkin Scenarios

```gherkin
Feature: BUG-012 A committed fixture yields a committed result

  Scenario: SCN-012B-005 A scheduled data refresh cannot turn a committed test red
    Given the reversal fixture pins attemptedAt at 2026-08-14T12:00:00.000Z
    And loadFixtureBars resolves that cutoff against mutable data/bars files
    When a scheduled refresh rewrites a row at or before that cutoff
    Then the outcome of the committed test is unchanged
    And any change to the fixture's resolved inputs requires a reviewed commit

  Scenario: SCN-012B-006 Drift is reported, never discovered by timeout
    Given the fixture may continue to read shared corpus data
    When the data behind the pinned cutoff no longer matches the fixture's expectation
    Then the test fails with a message naming the fixture, the symbol and the row
    And it does not hang
```

### Implementation Plan

1. Choose between the two shapes in `design.md` §3 — pin the fixture's bar inputs, or keep the shared
   read and add an explicit drift expectation — and record the choice.
2. Apply it so the fixture's resolved inputs are either committed or explicitly checked.
3. Leave every assertion in the six affected tests unchanged.

### Test Plan

| Test Type | Category | File / Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Fixture reproducibility | `unit` | fixture + loader | The fixture's resolved inputs are committed, or a drift expectation exists | `node scripts/selftest.mjs` | No |
| Drift, adversarial | `unit` | fixture drift check | A deliberately mutated bars row makes the check fail with a named message rather than hang | `node scripts/selftest.mjs` | No |
| Reversal regression | `e2e-ui` | the two affected spec files | The six tests pass and remain assertion-identical | `npx --no-install playwright test tests/tool-experience.spec.mjs tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

**Adversarial note.** The reproducibility item is only meaningful if the drift case is exercised by
**mutating a bars row on purpose** and observing a named failure. Asserting that the fixture passes
against today's corrected corpus proves reproducibility no more than the pre-cron green run did — it
was green for months before `643d74bfd` arrived.

### Definition of Done — 3-Part Validation

- [x] The chosen decoupling shape is recorded in this packet with the reason it was preferred over the alternative in `design.md` §3
  - **Evidence** (`executed`, read-only): the **pinned-inputs** shape was chosen. `tests/fixtures/research-agenda/reversal-ui.bars.json` is a new committed file in the change set, and `scripts/validate-agenda-fixture-pin.mjs` checks it against the live corpus. **Reason preferred over the shared-read-plus-drift-expectation alternative:** a pinned input makes the committed test's result a function of committed bytes only, so a scheduled refresh cannot change the outcome at all; the drift check is then additive — it reports divergence between pin and corpus without the test's verdict depending on the corpus. Both properties are obtained instead of trading one for the other.
- [x] The fixture's resolved inputs cannot change without a reviewed commit to the test surface
  - **Evidence** (`executed`): the fixture's bar inputs are the committed file `tests/fixtures/research-agenda/reversal-ui.bars.json`, loaded through `tests/research-agenda-fixture.support.mjs`; both appear in `git diff --name-only 5c978c5cb..HEAD`. Changing what the fixture resolves now requires editing a tracked file under `tests/`, which is a reviewed commit by definition. The cron writes `data/bars/**`, which the fixture no longer resolves against.
- [x] A deliberate mutation of a bars row produces a failure naming fixture, symbol and row, and produces no hang, proven by executing that mutation
  - **Evidence** (`executed`): `scripts/selftest.mjs:8949-8986` executes the mutations rather than asserting against today's corpus. `:8949` establishes the clean baseline (`findAgendaFixturePinDrift(pinFile, cleanCorpus).length === 0`); `:8958` rewrites COP's close (`rewriteCopClose`) and `:8961` formats the resulting finding into a named message; `:8984-8986` drops a pinned row entirely and asserts exactly one `corpus-row-missing` finding whose message contains `no longer present`, "so the pin cannot be silently outlived by the history it snapshots". All are pure-Node comparisons that return a value — there is no wait to hang on. `:8976` proves the check is not merely change-sensitive: a legitimate re-adjustment (`readjustCop`) yields zero findings. Live run: `node scripts/validate-agenda-fixture-pin.mjs` → `checked 12 pinned symbol(s) against data/bars at cutoff 2026-08-14T12:00:00.000Z, comparing o/h/l/c/v (ac excluded: a dividend rewrites it legitimately)` / `OK: every pinned row still matches the published row behind it`, exit **0**.
- [x] `tests/fixtures/research-agenda/reversal-ui.json` `attemptedAt` is unchanged — the cutoff was not moved to skip the corrupted row
  - **Evidence** (`executed`): `reversal-ui.json:9` reads `"attemptedAt": "2026-08-14T12:00:00.000Z"`, identical to the value recorded at filing. The file does not appear in `git diff --name-only 5c978c5cb..HEAD` at all, so no field in it moved.
- [x] Every assertion in the six affected tests is byte-identical
  - **Evidence** (`executed`): `git diff -U0 e2499ab8a..13ef48db9 -- tests/tool-experience.spec.mjs tests/contextual-tooltip.spec.mjs` matched by `^[+-].*expect\(` returns a count of **0** — this scope's commit changed **zero** `expect()` lines in either file. The edits are loader wiring only. `grep -cE '\.(skip|fixme)\('` returns 0 for both files, so no assertion was neutralised by being skipped either.
- [x] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count
  - **Evidence** (`executed`): `Research-Lab self-test: 2534 passed, 0 failed`, exit **0**; 2534 ≥ the 2490 pre-fix baseline.
- [x] Build Quality Gate: artifact lint passes, no absolute host path appears in any packet artifact, and every issue found during this scope was resolved in-session
  - **Evidence** (`executed`): artifact lint on this packet → `Artifact lint PASSED.`, exit **0**; no absolute host path in the packet. One issue found *during* this scope was fixed in-session rather than left unresolved: `ac` was documented and printed as excluded from comparison but was still present in `PINNED_FIELDS`, so a legitimate dividend would have been reported as drift. Two selftest assertions caught it and it is fixed — `validate-agenda-fixture-pin.mjs:46` now reads `PINNED_FIELDS = Object.freeze(['o', 'h', 'l', 'c', 'v'])`, matching the banner the tool prints.

## Scope 3: 03-surface-boot-failure-instead-of-hanging

**Status:** Done
**Depends On:** none
**Owner:** delivered in commit `e2499ab8a`

### Change Boundary

| Allowed | Forbidden |
|---|---|
| The `.catch` at `research-agenda-lab.html` lines 1059-1062 and the `__researchAgendaDebug` surface | Any change to `getViewState()`'s value on a successful boot (INV-012B-9) |
| A regression test asserting the failure is observable | `scripts/fetch-bars.mjs`, `data/bars/**` |
| This packet's own artifacts | `playwright.config.mjs` — no global `timeout`, no `retries` |
| — | `rlagenda.js` |

### Gherkin Scenarios

```gherkin
Feature: BUG-012 A boot failure reports itself instead of hanging

  Scenario: SCN-012B-007 A failed reversal boot resolves the readiness observer
    Given the catch at research-agenda-lab.html lines 1059-1062 writes two DOM strings
    And it never assigns state.view
    And getViewState returns null while state.view is unset
    When the reversal boot path throws
    Then getViewState returns a non-null value marking the state as failed
    And a caller waiting on readiness stops waiting

  Scenario: SCN-012B-008 The reason the page already computed reaches the observer
    Given the page computes fixture canonical model failed RLAGENDA-MODEL-INVALID
    And it writes that text into currentReason
    When a caller reads the debug surface after a failed boot
    Then the same refusal reason is retrievable there
    And it is not available only as DOM text

  Scenario: SCN-012B-009 The successful path is untouched
    Given three tests boot the agenda without the reversal fixture and pass today
    When the error path change is applied
    Then every value getViewState returns on a successful boot is unchanged
    And those three tests remain passing without modification
```

### Implementation Plan

1. Have the boot `.catch` record a failed state that `__researchAgendaDebug` can expose, carrying the
   refusal reason it already computes.
2. Leave the successful path's `state.view` shape and `getViewState()` return value untouched.
3. Add a regression test that drives a failing reversal boot and asserts the observer resolves with
   the reason, rather than waiting.

### Test Plan

| Test Type | Category | File / Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Failed-boot observability, adversarial | `e2e-ui` | new regression in `tests/tool-experience.spec.mjs` | A deliberately broken reversal input resolves the observer with the refusal reason and does not hang | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Success-path invariance | `e2e-ui` | the three non-fixture agenda tests at lines 364, 458, 713 | Successful boots are unchanged | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| Bounded failure | `e2e-ui` | the new regression | The failing boot reports within the test's own budget, with no CLI timeout override | same as above | Yes |
| Repository selftest | `unit` | `scripts/selftest.mjs` | No repository invariant broken | `node scripts/selftest.mjs` | No |

**Adversarial note.** This scope's regression must be driven by an **input that actually fails**, not
by the corrected corpus. After Scope 01 lands, the reversal boot succeeds, so a test that merely boots
it exercises none of the error path. The regression must inject a failing input deliberately — that
is the only form in which it would fail if the `.catch` regressed to leaving `state.view` unset.

### Definition of Done — 3-Part Validation

- [x] A failed reversal boot causes `getViewState()` to return a non-null value marking the failure, proven by a deliberately injected failing input
  - **Evidence** (`reported`, prior execution this session): the original defect was **induced**, not simulated — COP's adjusted close was put back into `c` beside the raw low through a **served override**, leaving `data/bars/**` untouched, producing `l=124.12000274658203 c=123.6949691772461` with `l > min(o, c)` evaluating **true**. That is the exact pre-fix corpus condition, so the regression is driven by an input that genuinely fails rather than by the corrected corpus. Under it, readiness resolved in **373 ms** where before the fix it never resolved at all, not even under the 240 s budget.
- [x] The refusal reason the page computes is retrievable through `__researchAgendaDebug` and not only as DOM text
  - **Evidence** (`reported`, prior execution this session): the reason was retrieved **after DOM erasure** — the strings the `.catch` writes into the page were removed first, and the refusal reason was still readable from the debug surface. That distinguishes a real observer channel from a test that is merely re-reading the same DOM text under another name.
- [x] The failing boot reports within the test's own budget, with no CLI timeout override and no global `timeout` in `playwright.config.mjs`
  - **Evidence** (`reported` for the timing, `executed` for the config): resolution took **373 ms**, comfortably inside the inherited per-test budget, with no CLI override supplied. `grep -nE '^\s*(timeout|retries)\s*:' playwright.config.mjs` returns **no match**, and `git diff --name-only 5c978c5cb..HEAD -- playwright.config.mjs` is **empty** — the config was not touched by any of the three fixes, so neither a global `timeout` nor `retries` was introduced.
- [x] Every value `getViewState()` returns on a successful boot is unchanged, and the three non-fixture agenda tests pass unmodified
  - **Evidence** (`reported`, prior execution this session): the success view was compared **byte-identically pre- and post-fix on both boot paths**, `keys=17` on each — INV-012B-9 holds. The suite run for this scope reported **21 passed**, covering the three non-fixture agenda tests without modification to them.
- [x] The new regression fails if the `.catch` is reverted to leaving `state.view` unset, proven by executing that reversion
  - **Evidence** (`reported`, prior execution this session): the page was **reconstructed with the fix's four hunks removed** and re-run. In that state `getViewState()` is `null` and the wait **rejects** — so the regression would fail if the `.catch` regressed, which is what makes it load-bearing rather than tautological. The reconstruction asserts each revert anchor appears **exactly once**, so it cannot silently revert the wrong hunk or a partial one.
- [x] `rlagenda.js` and `scripts/fetch-bars.mjs` are unchanged by this scope
  - **Evidence** (`executed`): `git diff --name-only 8694d8696..e2499ab8a` — this scope's commit — lists exactly two files, `research-agenda-lab.html` and `tests/tool-experience.spec.mjs`. Neither `rlagenda.js` nor `scripts/fetch-bars.mjs` appears, and `data/bars/**` is untouched by it.
- [x] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count
  - **Evidence** (`executed`): `Research-Lab self-test: 2534 passed, 0 failed`, exit **0**; 2534 ≥ the 2490 pre-fix baseline.
- [x] Build Quality Gate: artifact lint passes, no absolute host path appears in any packet artifact, and every issue found during this scope was resolved in-session
  - **Evidence** (`executed`): artifact lint on this packet → `Artifact lint PASSED.`, exit **0**; no absolute host path in the packet. Every issue found during this scope was resolved in-session.

## Cross-Scope Definition of Done

- [x] All six tests pass — `tests/tool-experience.spec.mjs` lines 442, 485, 566, 605, 639 and `tests/contextual-tooltip.spec.mjs` line 115 — in the full committed suite
  - **Uncertainty Declaration.** Left unticked deliberately. The Playwright suite was **not** run in the ticking session, and the run reported from prior execution this session covers a subset — **21 passed** for the Scope 03 surface — not the full committed suite, which was 490 passed / 8 failed pre-fix. The six named tests are strongly expected to pass, because the corpus condition that made them hang is gone (`validate-bars-coherence.mjs` exit 0 over 292 files) and the fixture no longer resolves against mutable data. But *strongly expected* is not evidence, and this item asserts a whole-suite result. Ticking it would state something no executed command in this session produced. Closing it requires one full-suite run; that run is also the only way to confirm whether the two unrelated pre-existing failures among the original eight are still present.
  - **Declaration discharged** (`executed`): the full committed suite was run against a clean `origin/main` worktree, exactly as the declaration required. `npx playwright test --config=playwright.config.mjs --reporter=line` → **1510 passed (11.3m)**, zero failed, zero flaky, exit **0**. The six named tests are inside that run: `tool-experience.spec.mjs` and `contextual-tooltip.spec.mjs` each report zero failures. The declaration's second question is answered too — the two unrelated pre-existing failures are **gone**, not merely unobserved, because nothing failed at all.
  - **What the first attempt got wrong, recorded because it nearly became the evidence.** A prior run of only the two named spec files returned `21 passed`. That is the *same* subset this declaration already named as insufficient, and ticking on it would have closed the item with evidence its own author had rejected. A first full-suite attempt then returned `1504 passed, 2 failed, 4 did not run` — but both failures were `_site is missing — run node scripts/build-pages-site.mjs before the Pages suite`, a missing build prerequisite of the run, not a defect. The failure count coincidentally matched the "two unrelated pre-existing failures" the declaration asks about; treating that coincidence as the answer would have been wrong. `node scripts/build-pages-site.mjs` (exit 0) was run and the suite re-executed to produce the clean result above.
- [x] The fix introduces no `retries`, no `.skip`/`.fixme`, no deleted or weakened assertion, and no global `timeout` in `playwright.config.mjs`
  - **Evidence** (`executed`): `git diff --name-only 5c978c5cb..HEAD -- playwright.config.mjs` is **empty** — the config was never touched, so no global `timeout` and no `retries` were added. `grep -nE '^\s*(timeout|retries)\s*:' playwright.config.mjs` returns no match, confirming none pre-existed either. `grep -cE '\.(skip|fixme)\('` returns **0** for both `tests/tool-experience.spec.mjs` and `tests/contextual-tooltip.spec.mjs`. The Scope 02 commit changed **0** `expect()` lines in those two files; the Scope 03 commit adds a regression to `tool-experience.spec.mjs` — it adds assertions rather than removing any. The red was removed by correcting data, not by relaxing a budget.
- [x] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count
  - **Evidence** (`executed`): `Research-Lab self-test: 2534 passed, 0 failed`, exit **0**. The pre-fix baseline recorded in `report.md` is 2490 passed / 0 failed, so the count rose by 44 — the three fixes added coverage (corpus coherence, adversarial writer payload, fixture-pin drift) and removed none.
- [x] `bash .github/bubbles/scripts/artifact-lint.sh` on this packet exits 0
  - **Evidence** (`executed`): `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-012-ingestion-writes-adjusted-close-beside-raw-ohlc` → `Artifact lint PASSED.`, exit **0**.

```gherkin
Feature: BUG-012 The red is removed by correcting data, never by waiting longer

  Scenario: SCN-012B-010 No shortcut turns the red green
    Given a 240000 ms budget was applied and the same six tests still failed
    And the awaited condition is unreachable rather than slow
    When the committed diff is reviewed
    Then playwright.config.mjs declares no global timeout and no retries
    And no test is marked skip or fixme
    And no assertion is deleted or weakened

  Scenario: SCN-012B-011 The suite still tests everything it tested before
    Given node scripts/selftest.mjs reported 2490 passed and 0 failed before the fix
    When the selftest is run after the fix
    Then it reports 0 failed
    And the assertion count is not below the pre-fix count
```
