# Feature 026 — Actionable Brief Brevity And Cross-Asset — Report

**Spec:** `specs/026-actionable-brief-brevity-and-cross-asset/`
**Workflow mode:** `full-delivery`
**Status at time of writing:** `in_progress` — planning chain complete, implementation not started.

---

## Summary

This feature makes the market brief a cockpit again. The runbook already says it
should be one. [notes/market-brief.md](../../notes/market-brief.md) §0 states the
brief "answers exactly one question — what changed that I should act on, and
what's coming?" and that it owns "the ranked attention feed (≤ 7 cards)". The
delivered artifact does not meet that contract, and nothing in the pipeline
measures the gap, so the gap grew unopposed.

The planning chain is complete. No code has been changed by this feature.

---

## Completion Statement

**Nothing in this feature is implemented.** Every one of the 117 Definition of
Done checkboxes in [scopes.md](scopes.md) is unchecked. No scope has been
started, no test has been run against this feature's behaviour, and no
implementation evidence appears below.

The Test Evidence section is deliberately empty. It will be filled by the
implementing owner, one scope at a time, with real command output and real exit
codes. It must not be filled in advance.

---

## Decision Record

The findings below were each verified directly against the repository during the
review that produced this spec. They are recorded here because several of them
correct or refine an earlier claim, and because the implementing owner needs the
verified position rather than the original one.

### D1 — The actionable surface is empty on every automated run

`market-brief.payload.json` carries `attention: []`. All three candidates in the
current run were refused with `RLATTN-PROVENANCE` on field `gateResult`, per
[rlattention.js](../../rlattention.js) line 487, which requires that "an
attention item is built from an observed gate result".

Verified across every committed payload revision: `attn=0` on every run since
2026-08-10. Before that the count sat at 7 for roughly three weeks, then 5, then
3, then 0 — a slowly edited roster rather than a per-run detection.

**Routed, not absorbed.** The producer defect is filed as
`specs/_bugs/BUG-009-decision-attention-gate-result-producer-absent/` and awaits
an owner decision. This feature must not absorb its remediation. Scope 4 treats
the unreachable decision surface as its primary live scenario; Scope 5 asserts
only that the attention rate stays withheld at `closedSample: 0`. Neither scope
touches `rlattention.js`.

### D2 — The call is frozen while the prose churns

Recommendation directions are identical across every committed run for a month.
Slot 1 has been `hold` throughout. The slate mutated roughly six times across
about 130 runs.

**Correction to the original review claim.** The text is *not* copy-pasted.
Sentence-level overlap between the 2026-08-16 and 2026-08-17 after-hours runs is
low — `backdrop.macroCycle` shares 6 of 40 sentences, `nextSession.thesis` shares
1 of 79. The prose is fully regenerated each run around an invariant skeleton and
an invariant conclusion. The reader's perception that "each day is the same" is
correct at the decision level and at the skeleton level, and incorrect at the
literal-text level. This distinction matters: deduplicating strings would not fix
it. Only delta-gated publication would.

### D3 — Rates, dollar and energy have named seams that resolve to nothing

- `toolReads.bond-regime-lab.read` — "The bond regime is unresolved… the credit
  call cannot be made." No yield level appears anywhere in the payload.
- `toolReads.fx-regime-relative-value-lab.metrics.subjectId` is `JPY` — the right
  subject with no reading. Elsewhere: "cannot be resolved this run because no FX
  evidence source is approved."
- `research-agenda-lab` topic `geopolitical-supply-shock` — "the current outcome
  is unavailable."

`market-brief.config.json` `track.macroGauges` is `^VIX, ^VIX9D, ^VIX3M` and
nothing else. There is no `^TNX`, no `^TYX`, no dollar index and no `JPY=X`.

The configuration also carries a standing instruction it does not honour. Its
2026-07-14 macro-event note says "By 2026-08-10, Hormuz is an active physical
supply shock. Re-verify crude, transit, and insurance each run." The 2026-08-17
`events[]` array holds three items — gamma and breadth, OPEX, and a distant
labour-market revision. Neither crude nor geopolitics appears.

### D4 — The drivers already exist and are discarded

[scripts/brief-refresh.mjs](../../scripts/brief-refresh.mjs) line 1288 already
computes a `drivers` object carrying `uup63`, `tlt63`, `tip63`, `xle63` and
`dbc63`. Lines 1295–1299 consume it *only* as scoring input to the gold, silver,
bitcoin, crypto and commodity models. None of it is published.

The only horizon computed is `ret63`, at line 1285 — a 63-day trailing return. A
63-day window cannot resolve a three-session move in yields or currency. This is
why FR-026-014 requires a short multi-session horizon alongside any long one.

`scripts/validate-brief-payload.mjs` contains no cross-asset, rates, duration,
dollar or FX slot, so the contract cannot presently carry such a reading even if
one were computed.

### D5 — The payload carries no version stamp at all

Verified directly: `market-brief.payload.json` has no `contractVersion` key.
Its siblings do — `market-brief.scorecard.json` carries `brief-scorecard/v1`,
`market-brief.attention-scorecard.json` carries `attention-scorecard/v1`, and the
history rows carry `brief-history-recent-row/v1`. `market-brief.snapshot.json`
also lacks one. `scripts/validate-brief-payload.mjs` contains no version gate.

**Consequence for the implementing owner.** A v2 gate written to fire on an
absent stamp would refuse the live committed payload. [scopes.md](scopes.md)
holds this as an explicit Scope 1 Definition of Done item rather than leaving it
to be discovered during implementation.

### D6 — There is no closed loop

`market-brief.attention-outcomes.jsonl` is zero lines.
`market-brief.attention-scorecard.json` reports `closedSample: 0` and was
generated 2026-08-07. `market-brief.scorecard.json` reports `openCalls: 109`
against `recentMisses: 3`, and all three resolved calls are tactical hedges
invalidated by the same 2026-08-13 close.

`scripts/build-attention-scorecard.mjs` is a manual CLI and is not on the
four-times-daily publication path, which is why the scorecard is stale.

### D7 — Workflow mode corrected

`state.json` originally carried `workflowMode` as
`implement action:full-delivery target:spec`. The installed registry at
`.github/bubbles/workflows/modes.yaml` does not resolve that form, and
`artifact-lint.sh` reported "Unknown workflow mode … cannot verify status ceiling
from workflows.yaml". Every other spec in this repository uses the bare key
`full-delivery`, which exists at line 150 of the installed `modes.yaml`.

This repository has hit the same failure before. `specs/025-.../state.json`
records: "The previously recorded workflowMode finding is resolved;
bubbles.workflow supplied full-delivery, so E009-STATE-MALFORMED no longer
applies." Corrected here to `full-delivery`, and `certification.status` aligned
to `in_progress` to match the top-level status.

---

## Open Findings Routed To Other Owners

| # | Finding | Owner | Blocks |
| --- | --- | --- | --- |
| R-1 | FR-026-013 as worded requires every run to *carry* a rates, dollar and energy reading, contradicting the ratified rule that a leg resolves to a reading **or** a dark state, never both. Needs amendment together with BS-026-011. | spec owner | Scope 2 acceptance wording, not Scope 2 start |
| R-2 | `design.md` assigns NFR-026-010 to SCOPE-05 at line 864 and to Increment A at line 1156. Both cannot stand. `scopes.md` resolves it to Scope 3, where the `artifact-budget/v1` arithmetic lives, and records the deviation. | design owner | nothing; resolved in-plan |
| R-3 | BUG-009 — decision-attention `gateResult` producer absent. | owner decision | Scope 4 live scenario coverage only |
| R-4 | Three UX corrections to the `spec.md` wireframe: the credit leg should render as a `Proxy` reading rather than `○ Credit — Dark`; the dollar leg provenance should read `Proxy` per `fx-regime-universe.json`'s own `indicative-proxy` declaration; the roll-up gains a `· N first seen` clause. | UX owner | nothing; cosmetic to the wireframe |
| R-5 | **The composer named by the plan does not write the payload.** `scopes.md` Scope 1 Implementation Plan, `design.md` `### D3` and the `## Change Boundary` Composer family all assign the `market-brief-payload/v2` stamp and the `selectDefaultVisible` call to `scripts/brief-refresh.mjs`. Verified against the working tree: `brief-refresh.mjs` is Tier A and writes only `market-brief.snapshot.json` (line 2243), `causal-rotation.snapshot.json` (line 2248) and an appended `brief-history.jsonl` row; it names `market-brief.payload.json` only in two comments (lines 688, 2269). `market-brief.payload.json` is written by `scripts/brief-narrative-parallel.mjs` (`PAYLOAD_PATH` at line 23, `renameSync(candidatePath, PAYLOAD_PATH)` at line 752), which the Scope 1 Allowed file families table does not admit. Confirmed from the publication path too: `scripts/brief-refresh-and-push.sh` line 513 invokes `brief-narrative-parallel.mjs` for the narrative lane. | plan owner (`scopes.md` Change Boundary + Implementation Plan), with design owner for the `### D3` consumer table | the payload version stamp, `selectDefaultVisible`'s production consumer, `budget-measurement/v1` being written into the payload, and Test Plan row 1.12. It blocks **none** of the measurement, the policy, the refusal gate or the module contract, all of which landed |
| R-6 | **`design.md` `### D2` is superseded by the ratified R-6 leg set and was NOT amended by this scope.** `design.md` still declares four measured legs with `DX-Y.NYB` as the dollar driver, a `JNK / LQD` ratio for credit, `Proxy` provenance for both, and the claim that "no leg introduces a provider, a key or a fetch". Two of those four drivers are unreachable through the `bars` map and the dollar proxy is inadmissible under `fx-regime-universe.json`. `scopes.md` carries the corrected table and this scope implemented that one. Also routed here: the SCN-026-012 and SCN-026-013 scoping to the **measured** shape only, since a carried leg has no `changePct` and reading those scenarios as covering credit makes them unsatisfiable. | design owner for `### D2` and the `cross-asset-reading/v1` table; spec owner for the SCN-026-012 wording | nothing; `scopes.md` is the implementing artifact and its corrected table is what shipped |
| R-7 | **The Change Boundary admits `market-brief.config.json` but not its committed derived projection.** `market-brief.config.page.json` is generated from it by `scripts/build-brief-page-artifacts.mjs`, and the selftest assertion `market-brief.config.page.json is byte-current with its full source artifacts` fails until the projection is regenerated. An additive config block therefore cannot land without also changing a file the Allowed file families table does not name. The table needs a derived-artifact row naming the artifact and its generator. Not applied here. | plan owner (`scopes.md` Change Boundary) | the Scope 2 Tier 1 "no file outside the Allowed file families table changed" item, which is left unchecked and cites this finding |
| R-8 | **An out-of-boundary modification appeared during this session and was left untouched.** `specs/022-federal-preferential-and-state-income-tax/scopes/01-federal-preferential-rate-completion/scope.md` was unmodified in the Scope 2 baseline `git status` and carries four newly checked Definition of Done boxes by the time the scope finished. No command run by this scope writes under `specs/022/**`, and this scope's work boundary is `specs/026-**`. It is most likely a concurrent session, the same class of contamination E9 already records for Feature 024. It is reported, not reverted: discarding another session's in-flight work to tidy a status listing would destroy work this scope does not own. | owner of the concurrent Feature 022 session | nothing in Scope 2; it is noise in the `git status` listing that E5 records verbatim |

---

## Test Evidence

Scope 1 — Budget policy, measurement and fail-closed refusal. Every block below
is real terminal output from this session with the observed exit code recorded
beside it. The repository is build-free; no command outside the five named in
`scopes.md` was run, and none was invented.

### E1 — Baseline, captured BEFORE any file was changed

**Claim Source:** executed.

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 2842 passed, 1 failed
SELFTEST_BEFORE_EXIT=1

  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline
    — a stale path makes a multi-file verification command silently cover less than it claims
    (1 new, 71 known-missing, 0 stale of 240 referenced)

$ node scripts/validate-brief-payload.mjs market-brief.payload.json
[brief-contract] SCN-019-020 payload toolRead and page read agree and expose no destination routing fields: PASS
[brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
[brief-contract] causal brief items require eligible stage owner freshness independent reason and falsifiers: PASS
[brief-contract] Market Brief causal coverage and elevation satisfy low-noise independence policy: PASS (coverageRows=1 elevated=false planEligible=false)
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
VALIDATE_BEFORE_EXIT=0

$ node scripts/build-pages-site.mjs
{"contractVersion":"pages-site-build-result/v1","dryRun":false,"registeredPages":28,"excludedPaths":12,"rootFiles":118,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/9bb69175f356c240125ee2384f73de8633483fa9b283895c85e3e89fccc66af6","omittedOrphanIndexes":136}
BUILD_BEFORE_EXIT=0

$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=638 references=14154 distinctPaths=240 missingPaths=72 baseline=71 new=1 stale=0
  NEW-MISSING tests/market-brief-cockpit.spec.mjs (23 reference site(s))
[spec-test-paths] FAIL — 1 new referenced path(s) do not exist
PATHS_BEFORE_EXIT=1
```

**The selftest could not exit 0 before this scope and cannot exit 0 after it.**
The single pre-existing failure is the spec-test-path guard on
`tests/market-brief-cockpit.spec.mjs` — the browser suite **Scope 4** creates.
It is not created here and the path is deliberately **not** added to
`scripts/validate-spec-test-paths.baseline`, whose header states in capitals that
the list must shrink and never grow. Scope 4 is the resolver.

### E2 — Final gate run, AFTER the change

**Claim Source:** executed.

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 2868 passed, 1 failed
SELFTEST_FINAL_EXIT=1

  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline
    — a stale path makes a multi-file verification command silently cover less than it claims
    (1 new, 71 known-missing, 0 stale of 240 referenced)

$ node scripts/validate-brief-payload.mjs market-brief.payload.json
[brief-contract] SCN-019-020 payload toolRead and page read agree and expose no destination routing fields: PASS
[brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
[brief-contract] causal brief items require eligible stage owner freshness independent reason and falsifiers: PASS
[brief-contract] Market Brief causal coverage and elevation satisfy low-noise independence policy: PASS (coverageRows=1 elevated=false planEligible=false)
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
VALIDATE_FINAL_EXIT=0

$ node scripts/build-pages-site.mjs
{"contractVersion":"pages-site-build-result/v1","dryRun":false,"registeredPages":28,"excludedPaths":12,"rootFiles":119,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/9bb69175f356c240125ee2384f73de8633483fa9b283895c85e3e89fccc66af6","omittedOrphanIndexes":136}
BUILD_FINAL_EXIT=0

$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=638 references=14168 distinctPaths=240 missingPaths=72 baseline=71 new=1 stale=0
  NEW-MISSING tests/market-brief-cockpit.spec.mjs (28 reference site(s))
[spec-test-paths] FAIL — 1 new referenced path(s) do not exist
PATHS_FINAL_EXIT=1

$ bash .github/bubbles/scripts/artifact-lint.sh specs/026-actionable-brief-brevity-and-cross-asset
Artifact lint PASSED.
ARTIFACT_LINT_EXIT=0
```

**Delta: +26 passing assertions, zero new failures.** 2842 → 2868 passed; the
failure count stayed at exactly 1 and that 1 is the same spec-test-path guard on
the same Scope 4 path. `missingPaths`, `baseline`, `new` and `stale` are
identical before and after. The reference-site count for that path moved 23 → 28
and the total reference count 14154 → 14168; neither is attributable to this
scope — every file this scope touched was grepped and contains **zero**
occurrences of `market-brief-cockpit`:

```text
$ grep -c 'market-brief-cockpit' notes/market-brief.md rlcockpit.js scripts/selftest.mjs scripts/validate-brief-payload.mjs
notes/market-brief.md:0
rlcockpit.js:0
scripts/selftest.mjs:0
scripts/validate-brief-payload.mjs:0
```

`rootFiles` 118 → 119 is the new module: the site build **accounts for
`rlcockpit.js` and does not refuse it**, so no `site-exclusions.json` entry was
appended. That is the conditional the plan left open, resolved by observation.

### E3 — The two appended selftest groups, verbatim

**Claim Source:** executed. Extracted from the final `node scripts/selftest.mjs`
run recorded in E2.

```text
rlcockpit.js — output budget
  ✓ market-brief.config.json declares output-budget/v1 with the literals 140, 300 and 3000 and exactly thirteen distinct default-visible paths
  ✓ the output-budget note records that it caps output, that artifact-budget/v1 caps fetch, and that neither may be raised inside a failing change
  ✓ TP-026-1.1 a fixture payload one character over the total cap is refused and no partial artifact is written
  ✓ TP-026-1.2 a headline of 141 characters is refused naming the field, the measured value and the 140 cap
  ✓ TP-026-1.3 a card over the 300 per-card cap is refused while the total stays under 3000
  ✓ TP-026-1.4 disclosedTotal excludes every default-visible path and is reported beside total with no cap applied
  ✓ TP-026-1.5 the three cap values equal their literals 140, 300 and 3000 after a failing run
  ✓ TP-026-1.6 the validator calls the one measureDefaultVisible in rlcockpit.js and declares no second measurement of its own
  ✓ TP-026-1.7 every outputBudget error names the exceeding path, the measured value and the cap it exceeded
  ✓ TP-026-1.9 adversarial: removing the violations check makes the over-cap fixture validate, so the guard is load-bearing
  ✓ TP-026-1.10 adversarial: editing totalDefaultVisibleChars to rescue a failing fixture fails the literal-cap assertion instead
  ✓ the budget fires only on a literal market-brief-payload/v2 stamp; an unstamped payload skips it and the two error sets differ by exactly the budget strings
  ✓ scripts/validate-brief-payload.mjs still declares exactly the five pre-existing CLI flags and the budget adds no sixth
  ✓ byField carries one row per declared field, in policy order, and sums exactly to total
  ✓ rlcockpit.js exports a frozen object over module.exports, loads under Node with no build step, and carries no top-level import or export
  ✓ extractFn reaches rlcockpit.js top-level declaration measureDefaultVisible and returns a non-empty body
  ✓ extractFn reaches rlcockpit.js top-level declaration budgetViolations and returns a non-empty body
  ✓ extractFn reaches rlcockpit.js top-level declaration selectDefaultVisible and returns a non-empty body
  ✓ rlcockpit.js contains none of document, localStorage, sessionStorage, innerHTML, fetch(, setTimeout or requestAnimationFrame
  ✓ rlcockpit.js uses Number.isFinite for every numeric guard and contains no bare isFinite

rlcockpit.js — allocation and demotion
  ✓ TP-026-1.8 selectDefaultVisible demotes whole items in the declared order and names every demoted item
  ✓ the demotion ladder moves only changed lines and low-ranked cards; dark states and the track-record line never move
  ✓ selectDefaultVisible leaves the composed run untouched and returns a separate published object
  ✓ a run already inside the total cap is published whole with an empty demoted and held-back set
  ✓ TP-026-1.11 adversarial: rlcockpit.js source contains no slice-to-length, no ellipsis literal and no truncation helper
  ✓ Regression: SCN-026-CANARY-01 every pre-existing selftest assertion stays green after the Feature 026 budget append, the fetch budget is unchanged, the committed unstamped payload still validates clean, and the site build accounts for rlcockpit.js without an exclusion
```

### E4 — The refusal output, in the shape `design.md` fixes

**Claim Source:** executed. Driven through the real `validateBriefPayload`
library path against a fixture that descends from the committed payload — which
validates with zero errors — so the only difference between a passing fixture and
a refused one is the budget.

```text
$ node -e "<drive validateBriefPayload over the committed payload, a v2-stamped copy, and a v2 copy with a 141-character headline>"
committed errors: 0 []
v2-stamped clean errors: 0 []
v2 + 141-char headline errors: 2
  - outputBudget: headline is 141 characters, over the declared cap of 140
  - outputBudget: measured over 13 declared fields; disclosed narrative was 127763 characters and is not capped
```

The 127,763-character disclosed figure independently reproduces the ~127,740
total the specification derived. The total-cap and per-card lines were exercised
the same way:

```text
total fixture total= 3001 violations= [{"path":"default-visible narrative","measured":3001,"cap":3000,"capName":"total cap"}]
validator: [
 "outputBudget: default-visible narrative is 3001 characters, over the declared total cap of 3000",
 "outputBudget: measured over 13 declared fields; disclosed narrative was 127767 characters and is not capped"
]
card fixture total= 301 cards= [{"path":"attention[0]","chars":301}]
card validator (budget line): "outputBudget: attention[0] is 301 characters, over the declared per-card cap of 300"
```

### E5 — Change boundary and shared-surface discipline

**Claim Source:** executed.

```text
$ git --no-pager diff --stat
 market-brief.config.json           |  23 +++
 scripts/selftest.mjs               | 309 +++++++++++++++++++++++++++++++++++++
 scripts/validate-brief-payload.mjs |  38 +++++
 3 files changed, 370 insertions(+)

$ git --no-pager diff --numstat scripts/selftest.mjs
309     0       scripts/selftest.mjs

$ git status --short
 M market-brief.config.json
 M scripts/selftest.mjs
 M scripts/validate-brief-payload.mjs
?? company-intelligence-lab.html
?? company-intelligence.config.json
?? data/company-intelligence/
?? notes/company-intelligence-lab.md
?? rlcockpit.js
?? rlcompanyintel.js
?? specs/025-company-multi-horizon-intelligence-lab/
?? specs/026-actionable-brief-brevity-and-cross-asset/
?? specs/_bugs/BUG-009-decision-attention-gate-result-producer-absent/
?? tests/company-intelligence-lab.spec.mjs
?? tests/company-intelligence.unit.mjs
```

`scripts/selftest.mjs` shows **309 insertions and 0 deletions** — the append
removed zero pre-existing lines, which is the shared-surface rule the Impact
Sweep sets. Every excluded family is absent from the modified list:
`market-brief.payload.json`, `rlattention.js`, `tools.json`, `index.html` and
`rlnav.js` appear on no line. The untracked entries other than `rlcockpit.js`
and the two spec folders pre-date this scope (Feature 025 and the BUG-009
artifact) and were not touched. `notes/market-brief.md` was edited after this
capture and shows **49 insertions, 0 deletions**; its fenced-code-block count is
4 before and 4 after, and `## 9.`, the new `### 9a.` and `## 10.` headers are all
intact.

The `artifact-budget/v1` block is byte-unchanged — the config diff opens on its
closing brace as pure context and every changed line belongs to the new block:

```text
$ git --no-pager diff -U2 market-brief.config.json
@@ -540,4 +540,27 @@
         "rawBodyRetention": "hash-only"
     },
+    "output-budget/v1": {
+        "contractVersion": "output-budget/v1",
...
+    },
     "web-evidence-acquisition/v1": {
```

### E6 — Test Plan row accounting

| Row | Verdict | Evidence |
| --- | --- | --- |
| 1.1 | Executed, passing | E3, `TP-026-1.1` |
| 1.2 | Executed, passing | E3, `TP-026-1.2`; message text in E4 |
| 1.3 | Executed, passing | E3, `TP-026-1.3`; message text in E4 |
| 1.4 | Executed, passing | E3, `TP-026-1.4` |
| 1.5 | Executed, passing | E3, `TP-026-1.5` |
| 1.6 | Executed **in part** | The validator half is proven: it requires `rlcockpit.js`, calls `RLCOCKPIT.measureDefaultVisible` and `RLCOCKPIT.budgetViolations`, and declares no `measureDefaultVisible` of its own; `rlcockpit.js` declares exactly one. The composer half could not run — see R-5. The assertion title was written to name only what it proves rather than to print the row's full claim |
| 1.7 | Executed, passing | E3, `TP-026-1.7` |
| 1.8 | Executed, passing | E3, `TP-026-1.8` |
| 1.9 | Executed, passing | E3, `TP-026-1.9` |
| 1.10 | Executed, passing | E3, `TP-026-1.10` |
| 1.11 | Executed, passing | E3, `TP-026-1.11` |
| 1.12 | **Not executed** | Blocked by R-5. `brief-refresh.mjs` writes no payload, so there is no contract version for it to write. No assertion was authored, because an assertion that passed vacuously would be worse than an absent one |
| 1.13 | Executed, passing | E1 and E2: the committed unstamped payload produces byte-identical validator output and exit 0 before and after |
| 1.14 | Executed, passing | E3, `SCN-026-CANARY-01` |
| 1.15 | Executed, passing | E2: exit 0, `rootFiles` 118 → 119, `rlcockpit.js` accounted for with no exclusion entry |

### E7 — Requirement coverage for this scope

| Requirement | Passing rows that carry it |
| --- | --- |
| FR-026-001 declared output budget | 1.1, 1.5, and the config-literal assertion in E3 |
| FR-026-002 one measurement implementation | 1.6 (validator half proven; composer half routed as R-5) |
| FR-026-003 no part of an over-budget run publishes | 1.1, 1.9 |
| FR-026-004 disclosed narrative measured and uncapped | 1.4, 1.7 |
| FR-026-005 refusal names path, measured value and cap | 1.2, 1.3, 1.7 |
| FR-026-006 a cap is not raised to rescue a run | 1.5, 1.10 |

### E8 — Runbook text added

`notes/market-brief.md` gains `### 9a. Output budget — output-budget/v1` under
`## 9`. It records the three caps in a table, the thirteen measured paths in
policy order, the disclosed-versus-capped split, the separation of measurement,
allocation and refusal, the version gate, and the cap-change rule verbatim:

> **Changing a cap is a separate owner decision.** A cap may not be raised inside
> a change that would otherwise fail against it, in either direction between the
> two budget blocks. […] If a cap genuinely needs to move, move it in its own
> change, record the reason here, and re-run the run that prompted it against the
> new number.

### E9 — A concurrent session contaminated the shared selftest after E2

**Claim Source:** executed. Recorded because it is the honest reading of what the
command printed, not because it is convenient.

The E1 and E2 measurements were taken while the working tree held only this
scope's changes — the `git status --short` capture in E5 lists exactly
`market-brief.config.json`, `scripts/selftest.mjs` and
`scripts/validate-brief-payload.mjs` as modified. A later re-run of the same
command printed a different, worse number:

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 2866 passed, 3 failed
SELFTEST_EXIT=1
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline …
  ✗ FAIL: TP-03-07: against a fixture pack with deliberately non-standard life-expectancy figures, each claim age's cumulative total equals the adjusted annual benefit times the whole-year count from that claim age to the life-expectancy age, asserted at three claim ages
  ✗ FAIL: TP-03-08: an implementation using a recalled life-expectancy figure is proven to produce a different total against the non-standard fixture, one applying a discount or growth rate is proven to differ, and no discount, growth, inflation or interpolation term exists anywhere in the module

$ git status --short   # tracked modifications only
 M market-brief.config.json
 M notes/market-brief.md
 M rltaxclaimage.js
 M scripts/selftest.mjs
 M scripts/validate-brief-payload.mjs
 M specs/024-social-security-and-medicare/scopes/03-claim-age-comparison/report.md
```

`rltaxclaimage.js` and the Feature 024 scope report appeared in the tree between
E2 and this run. They are a **different, concurrently running session's** work on
Feature 024, Social Security and Medicare. The failure count moved 1 → 2 → 3
across three consecutive runs of the same unchanged command, which is what an
actively edited file looks like from outside.

The two new failures are attributed away from this scope on four independent
grounds, each verified rather than asserted:

```text
$ grep -n 'Feature 026 Scope 1:' scripts/selftest.mjs
21010:/* ---------- Feature 026 Scope 1: rlcockpit.js — output budget (BEGIN) ---------- */
21217:/* ---------- Feature 026 Scope 1: rlcockpit.js — output budget (END) ---------- */
21219:/* ---------- Feature 026 Scope 1: rlcockpit.js — allocation and demotion (BEGIN) ---------- */
21317:/* ---------- Feature 026 Scope 1: rlcockpit.js — allocation and demotion (END) ---------- */

$ awk 'NR<=19070 && /group\(/{last=NR": "$0} END{print last}' scripts/selftest.mjs
18898:  group('lifetime-tax — claim age comparison');

$ sed -n '18990,19010p' scripts/selftest.mjs | grep -n 'rltax'
9:  const claimAgeSource26 = read('rltaxclaimage.js');

$ git --no-pager diff --numstat rltaxclaimage.js
(no output — this scope contributed zero lines to that file)
```

1. This scope's append is bounded to selftest lines **21010–21317**. Both failing
   assertions live in the `lifetime-tax — claim age comparison` group opened at
   line **18898**, more than two thousand lines above the append and untouched by
   it.
2. That group reads `rltaxclaimage.js`, which is not in the Scope 1 Allowed file
   families table and to which this scope contributed zero lines.
3. Every Feature 026 assertion still passes in that same contaminated run: eleven
   `TP-026-*` rows plus the group's untitled assertions, with zero failures
   matching `026`.
4. `node scripts/validate-brief-payload.mjs`, `node scripts/build-pages-site.mjs`
   and `artifact-lint.sh` are unaffected and still exit 0, 0 and 0.

**The clean measurement for this scope is therefore E2: 2842 → 2868 passed, one
failure before and one after, that one failure being the Scope 4 path guard.** No
attempt was made to stash, revert or otherwise disturb the other session's
in-flight edit to establish a tidier number. The contamination is reported rather
than cleaned, and re-measuring `node scripts/selftest.mjs` once Feature 024
settles is left as a real, named follow-up.

---


## Scope 2 Test Evidence

Scope 2 — Cross-asset legs, required-leg set and dark state. Every block below is
real terminal output from this session with the observed exit code recorded beside
it. The implemented leg set is the **corrected** one ratified by the R-6 block in
`scopes.md`, never the original four-measured-leg table.

### E2-1 — Selftest, before and after

**Claim Source:** executed.

```text
$ node scripts/selftest.mjs          # BEFORE any Scope 2 file was changed
Research-Lab self-test: 2875 passed, 1 failed
exit: 1
sha256: b73c29c5990cf8a890c85884c9ea88890e1a6dcbcb39470348ea5aaf680113e8

$ node scripts/selftest.mjs          # AFTER
Research-Lab self-test: 2906 passed, 1 failed
exit: 1
sha256: 40af98044d8a5ad95e3684b6d94e3547c3c8622b9f10c78908c1efc05b02c4f9
```

Both runs were recorded through `.github/bubbles/scripts/evidence-capture.sh`, so
each sha256 covers every line the command produced and is re-derivable with
`--verify`. Passes moved 2875 → 2906, a gain of 31. The failure count is unchanged
at 1, and it is the same failure both runs report:

```text
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the
    frozen baseline — a stale path makes a multi-file verification command
    silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240
    referenced)
```

That guard fires because this feature's own Test Plan names `tests/market-brief-cockpit.spec.mjs`,
which **Scope 4** creates. It is the identical failure Scope 1 recorded and it is
not a Scope 2 defect. Nothing in this scope can close it.

An intermediate run is recorded too, because it is the reason two assertions were
rewritten rather than accepted: at sha256 `b5472ddff2eca96382791597b601d1a66689e50d12e343a703e9904f98858051`
the suite reported `2902 passed, 5 failed`, and every one of those five was a real
defect this scope then fixed. Three were in Scope 2's own new group, one was the
stale derived config projection, and three were the Scope 1 budget assertions the
new gate collides with. They are itemised in E6.

### E2-2 — Validator and site build, before and after

**Claim Source:** executed.

```text
BEFORE
$ node scripts/validate-brief-payload.mjs market-brief.payload.json
[brief-contract] SCN-019-020 payload toolRead and page read agree and expose no destination routing fields: PASS
[brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
[brief-contract] causal brief items require eligible stage owner freshness independent reason and falsifiers: PASS
[brief-contract] Market Brief causal coverage and elevation satisfy low-noise independence policy: PASS (coverageRows=1 elevated=false planEligible=false)
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
VALIDATOR_EXIT=0
$ node scripts/build-pages-site.mjs
SITEBUILD_EXIT=0

AFTER
VALIDATOR_EXIT=0
SITEBUILD_EXIT=0
ARTIFACT_LINT_EXIT=0
```

The committed payload carries no `contractVersion`, so neither the budget block nor
the new cross-asset block fires on it. That is asserted directly rather than assumed:
`the cross-asset checks fire only on a literal market-brief-payload/v2 stamp, so the
committed unstamped payload is unaffected` printed as passed.

### E3 — The appended selftest group, verbatim

**Claim Source:** executed. Every line below is copied from the run recorded at
sha256 `40af98044d8a5ad95e3684b6d94e3547c3c8622b9f10c78908c1efc05b02c4f9`.

```text
rlcockpit.js — cross-asset legs
  ✓ TP-026-2.11 cross-asset/v1 declares the three required legs rates, dollar and energy plus the non-required credit leg in one committed location, and marks exactly the first three required
  ✓ TP-026-2.5 every measured leg's driver is declared by real-assets-universe.json and so is reachable through the bars map, and the config introduces no new provider
  ✓ TP-026-2.1 every required leg resolves to exactly one of a reading or a dark state, and never to neither or both
  ✓ TP-026-2.2 every reading carries a 5-session changePct alongside its 63-session long63Pct
  ✓ TP-026-2.3 every reading names its driver, its measured change and the number of sessions actually spanned
  ✓ each measured leg's asOf is the ISO date of the last close actually used and the carried leg's asOf is the bond read's own readablePairs date
  ✓ a leg with three available closes publishes state partial carrying the two sessions it actually spanned, not the requested five
  ✓ TP-026-2.12 the rates leg's long63Pct is the drivers.tlt63 value the scoring path consumes, and the energy leg declares its long63Pct as a fresh 63-session call because no uso63 exists in that bundle
  ✓ TP-026-2.18 fx-regime-universe.json declares zero evidenceSources with activation approved, so the dollar slot resolves dark and its reason is the fx read's own published sentence
  ✓ no cross-asset leg publishes a DX-Y.NYB or UUP figure in any form and cross-asset/v1 names neither symbol
  ✓ TP-026-2.19 the credit leg reads pairId, direction, purity and asOf from the bond-regime read and brief-refresh.mjs declares no second JNK/LQD ratio computation
  ✓ buildCrossAssetReadings calls the owning tool's realTrailingPct through loadToolFunctions and brief-refresh.mjs declares no second trailing-return implementation
  ✓ TP-026-2.7 a leg whose driver bars are cut to one row raises a dark state and emits no changePct
  ✓ TP-026-2.9 every dark card names the withheld conclusion and the substitution refusal
  ✓ TP-026-2.8 dark states are ordered ahead of every supporting block in the emitted payload structure
  ✓ TP-026-2.10 a dark state is a distinct payload item and its text appears in no supporting narrative field
  ✓ TP-026-2.6 the standing macroEvents instruction produces a bound energy outcome plus named unresolved transit and insurance aspects on every run
  ✓ resolveLeg derives provenance only from its legPolicy argument and rlcockpit.js contains no provenance-inference branch
  ✓ resolveLeg and darkState each have a production consumer in scripts/brief-narrative-parallel.mjs, the file that writes the payload
  ✓ the emitted cross-asset block carries no position size, cost basis, profit figure, credential or currency-amount value
  ✓ the cross-asset additions measure inside the declared total cap: total 706 of 3000, disclosed 481
  ✓ TP-026-2.4 a v2 payload omitting the required cross-asset slot is refused by validateBriefPayload
  ✓ the cross-asset checks fire only on a literal market-brief-payload/v2 stamp, so the committed unstamped payload is unaffected
  ✓ scripts/validate-brief-payload.mjs still declares exactly the five pre-existing CLI flags and the cross-asset checks add no sixth
  ✓ TP-026-2.13 adversarial: removing the Number.isFinite guard makes the cut fixture emit changePct 0 instead of a dark state
  ✓ TP-026-2.14 adversarial: a dark card missing reason, withheld or substitutionRefusal validates once the completeness check is removed
  ✓ TP-026-2.15 adversarial: declaring a measured leg whose driver is absent from real-assets-universe.json fails the reachability assertion instead of publishing a silent dark state
  ✓ extractFn reaches rlcockpit.js top-level declaration resolveLeg and returns a non-empty body
  ✓ extractFn reaches rlcockpit.js top-level declaration darkState and returns a non-empty body
  ✓ rlcockpit.js still exports a frozen UMD api with no top-level import or export, no browser-only global and no bare isFinite after the cross-asset append
  ✓ Regression: SCN-026-CANARY-02 the Scope 1 budget group and every pre-existing assertion stay green after the cross-asset append
```

Thirty-one assertions, all passing. The group measures through the OWNING tool's
own `realTrailingPct`, extracted from `real-assets-lab.html` and evaluated in a
sandbox, so a second definition of the return would fail the arithmetic and not
only the source check.

**The three adversarial cases each fail when their guard is removed**, which is
what makes them guards rather than decoration:

- 2.13 replaces ONE expression — the `Number.isFinite(...) ? ... : null` guard —
  with a coercion, and the same fixture that raised a dark state publishes
  `changePct: 0`. The guard is written as a single expression precisely so one
  substitution reaches both the decision and the published value.
- 2.14 strips the two completeness lines from the refusal set of an incomplete
  dark card and the fixture validates clean, so the three-sentence rule carries
  the refusal alone.
- 2.15 declares a measured leg whose driver the universe does not name; the
  reachability flag comes back false and the leg is caught at plan time instead
  of publishing a dark state a reader would read as a market condition.

### E4 — What each non-measured leg carries, beside its source

**Claim Source:** executed.

The two measured drivers, and the universe entries that put them in reach:

```text
$ node -e '... real-assets-universe.json entries ...'
real-assets entries: GLD:gold, IAU:gold, SLV:silver, BTC-USD:bitcoin, IBIT:bitcoin,
BITO:bitcoin, ETH-USD:crypto, DBC:broad, PDBC:broad, USO:energy, BNO:energy,
CPER:industrial, DBA:agriculture, PPLT:platinum, UUP(hidden), TLT(hidden),
TIP(hidden), QQQ(hidden), XLE(hidden), XLI(hidden)
```

`TLT` is a hidden entry and `USO` a visible entry with `model: "energy"`. Both are
therefore keys in the `bars` map `buildRealAssetsToolRead` builds by iterating that
same file, which is the admission test — not the presence of a `data/bars` file.

The dollar leg's dark reason, beside the source it was read from:

```text
committed payload toolReads['fx-regime-relative-value-lab'].read
  "The available evidence does not support a complete attributable recommendation.
   No FX evidence source is approved for use, so the broad-dollar, event,
   forward-carry, policy-rate-proxy, positioning, reer-value, spot families are all
   withheld and no currency regime or listed vehicle is published."

emitted crossAsset.dark[dollar].reason
  identical string, compared by identity in the assertion above

fx-regime-universe.json evidenceSources, broad-dollar family
  fed-h10-unavailable    activation "denied"      persistence "forbidden"
  broad-proxy-unreviewed activation "unreviewed"  persistence "forbidden"
                         rights "unknown"  sourceUsePolicyId null  reviewedAt null
                         subjects ["DX-Y.NYB", "UUP"]
approved evidenceSources across the whole universe: 0
```

The reason is the FX model's own published sentence. Nothing about the dollar was
composed here, and no proxy figure is published in any form.

The credit leg's carried classification, beside its source:

```text
committed payload toolReads['bond-regime-lab'].metrics
  readablePairs  [{"pairId":"jnk-lqd","direction":"strengthening","purity":"clean","asOf":"2026-08-17"}, {"pairId":"hyg-lqd", ...}]
  evidenceGaps   ["an independent credit-spread reading"]

emitted crossAsset.legs[credit]
  pairId "jnk-lqd"  direction "strengthening"  purity "clean"  asOf "2026-08-17"
  provenance "Owner-classified"
  confirmation { state: "absent", detail: "an independent credit-spread reading" }
  withheld "Whether credit is confirming or contradicting the equity trend is not stated."
  changePct  — absent  ·  long63Pct — absent
```

The `detail` is taken by identity from the bond model's own `evidenceGaps` array,
not written here. The leg carries no measured figure because it measures nothing.

### E5 — Change boundary and shared-surface discipline

**Claim Source:** executed.

```text
$ git status --porcelain | grep -E 'market-brief.payload.json|real-assets-universe.json|fx-regime-universe.json|bond-regime-universe.json|real-assets-lab.html|tools.json|rlnav.js|rlattention.js|brief-history.jsonl|^ M index.html'
EXCLUDED_MATCH_EXIT=1

$ git --no-pager diff -U0 market-brief.config.json | grep -c 'macroGauges'
0
```

The filter matches nothing at all, so every excluded family is byte-unchanged.
`track.macroGauges` appears on no diff line: the legs live in their own
`cross-asset/v1` block rather than being smuggled into the volatility-gauge list.

The full modified set for this scope is `market-brief.config.json`,
`market-brief.config.page.json`, `notes/market-brief.md`, `scripts/brief-refresh.mjs`,
`scripts/brief-narrative-parallel.mjs`, `scripts/validate-brief-payload.mjs` and
`scripts/selftest.mjs`, plus the still-untracked `rlcockpit.js` and the
`specs/026-…` tree. Every one of those is inside the Allowed file families table
**except `market-brief.config.page.json`**, which is a derived projection the
committed generator rebuilds and which the table does not name. That overrun is
declared rather than absorbed: the Tier 1 item stays unchecked and cites R-7.

Two entries in the listing are **not** this scope's and were deliberately not
touched: `specs/022-…/scope.md` and `specs/024-…/report.md`. R-8 records the first.

### E6 — The three deletions in `scripts/selftest.mjs`, itemised

**Claim Source:** executed.

```text
$ git --no-pager diff --stat scripts/selftest.mjs
 scripts/selftest.mjs | 778 +++++++++++++++++++++++++++++++++++++++++++++++++-
 1 file changed, 775 insertions(+), 3 deletions(-)
```

The Scope 2 group is a pure append. The three deletions are all inside Scope 1's
`rlcockpit.js — output budget` group and every one traces to the same real cause:
**the `market-brief-payload/v2` stamp now activates two gates rather than one.**
Scope 1's fixtures stamp v2 to exercise the budget and carry no cross-asset legs,
so the new leg gate correctly refuses them. Three assertions failed on that:

```text
  ✗ FAIL: TP-026-1.1 a fixture payload one character over the total cap is refused and no partial artifact is written
  ✗ FAIL: TP-026-1.9 adversarial: removing the violations check makes the over-cap fixture validate, so the guard is load-bearing
  ✗ FAIL: the budget fires only on a literal market-brief-payload/v2 stamp; an unstamped payload skips it and the two error sets differ by exactly the budget strings
```

The repair re-scopes them to the budget, which is their actual subject: the
`otherLines26` filter now means "lines owned by neither v2 gate", and the single
`validate26(atCap26).length === 0` becomes a budget-lines check plus an other-lines
check. **No budget assertion lost a subject**, and the behaviour the exclusion
makes room for is asserted positively in the new group rather than assumed —
`noBlock26.length === 1` proves a legless v2 payload is refused.

The alternative, making Scope 1's fixtures leg-conformant, was rejected on
inspection: any conforming fixture must carry a dark dollar card whose three
mandatory sentences are themselves default-visible, which would destroy the exact
3000/3001 arithmetic those fixtures exist to test.

### E7 — Runbook text added

**Claim Source:** executed. `notes/market-brief.md` gained `### 9b. Cross-asset legs
— cross-asset/v1`, carrying: a required-slot table naming rates, dollar and energy
as required and credit as not; a published-shape table separating measured, carried
and dark; the five-session rationale and the `partial` rule; the instrument-level
claim rule tied to the repository's existing currency-proxy reasoning; the
dark-by-governance basis quoted from the two committed source records; the
permanent-gap reading of the credit leg; the reachability rule and why widening the
universe is a separate decision; and the Tier-A/Tier-B split. The file's fenced-block
count is 4 before and 4 after.

### E8 — Requirement coverage for this scope

**Claim Source:** interpreted from the observed pass list in E3.

| Requirement | Test Plan row | Observed |
| --- | --- | --- |
| FR-026-013 | 2.1 | passed |
| FR-026-014 | 2.2 | passed |
| FR-026-015 | 2.3 | passed |
| FR-026-016 | 2.5 | passed |
| FR-026-017 | 2.4 | passed |
| FR-026-018 | 2.12 | passed |
| FR-026-019 | 2.6 | passed |
| FR-026-020 | 2.11 | passed |
| FR-026-021 | 2.7, 2.13 | both passed |
| FR-026-022 | 2.8 | passed |
| FR-026-023 | 2.10 | passed |
| FR-026-024 | 2.9 | passed |

All twelve requirements this scope owns name at least one row that printed as
passed. FR-026-013 is carried against the ratified **slot** reading rather than its
literal wording, for the reason `design.md` `### D1` gives and R-1 routes.

---


## Uncertainty Declarations

1. **The market events that prompted this work are not verifiable from the
   repository.** The reader reported that treasury yields rising, a USD/JPY
   dislocation and an oil and geopolitical move drove a sell-off the brief failed
   to report. Nothing in this repository can confirm or deny those external market
   facts. What is verified here is narrower and sufficient: the brief does not
   track those instruments, the tools that would carry them resolve to unavailable
   states, and the configuration's own standing instruction about crude is not
   honoured. The feature is justified on the structural gap, not on an unverified
   market narrative.

2. **The character budgets are derived, not measured against reader behaviour.**
   Headline 140, per-decision-card 300, total default-visible 3000. These come
   from the UX wireframe derivation and remain subject to owner ratification, per
   the spec's Open Question 2. They are not empirical findings.

3. **`scenario-manifest.json` was reported by the planning owner as a missing
   required artifact. It is not.** `artifact-lint.sh` does not require it for this
   repository, and the check was run to confirm. That claim is withdrawn.

4. **Scope 2's cross-asset block has not been exercised by a live Tier-A run.**
   Every assertion in E3 drives the real `buildCrossAssetReadings` export and the
   real `resolveLeg`, but over injected bars and over the two owner reads copied
   from the committed payload. A scheduled run that re-measures against live
   `data/bars` has not happened in this session, and no such run is claimed. What
   is verified is the code path and its arithmetic, not a published artifact.

5. **`resolveLeg`'s parameter list differs from `design.md`'s.** The design gives
   `(legPolicy, bars, sessions)`. The shipped signature is
   `(legPolicy, measurement, sessions)`, because R-5 established that measurement
   happens in Tier A and emission in Tier B, and the payload composer holds no
   bars. Handing `resolveLeg` a bars array would have forced either a second
   return formula inside `rlcockpit.js` or a `loadToolFunctions` call from a
   browser-loadable UMD module, and both are forbidden. The design's `bars`
   parameter predates R-5; the substitution is recorded here rather than treated
   as a silent liberty.
