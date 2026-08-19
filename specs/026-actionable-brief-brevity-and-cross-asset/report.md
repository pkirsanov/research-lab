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

The planning chain is complete, and all five scopes have since been implemented
and committed: Scopes 1 and 2 in `0f61d1a14` with a fixture and PII repair in
`a7ca8ad55`, Scope 3 in `3855ee75d`, Scope 4 in `6b00105c7` and Scope 5 in
`ec7d24b31`, across the merge `cff40e23d`.

**2026-08-19 closure pass.** Two things changed after the previous pass wrote its
account, and both are remediations of findings that pass had itself routed. The
seven Test Plan rows Scope 5 never authored — 5.1, 5.8, 5.9, 5.12, 5.13, 5.14 and
5.15, including both publication-path canaries — now exist and pass, which is what
**R-14** asked for; and the three runbook gaps — §5 change vocabulary, §9c
disclosure, §10a automated path — are now written, which is what **R-13** asked
for. The suite moved from `3019 passed, 0 failed` to `3042 passed, 0 failed`, and
the 23 added assertions are those rows and their supports. Eleven DoD items were
re-verified against the new state and checked; eight remain unchecked and are
listed below with the reason each still fails its own stated verification. The
full re-measurement is `### E11`.

---

## Completion Statement

**All five scopes are implemented. After the 2026-08-19 closure pass the
Definition of Done stands at 112 of 120 items checked, up from 101. The 8 that
remain unchecked are listed with their reasons rather than closed to make the
number look better, and not one of them was checked on weaker evidence than its
own stated verification method demands.**

| Scope | Checked | Unchecked | Position |
| --- | --- | --- | --- |
| 1 | 26 | 0 | complete |
| 2 | 25 | 2 | both open on routed findings R-7 and R-9, neither a test failure |
| 3 | 21 | 2 | boundary overrun R-10 and two selftest line deletions; the runbook gap closed |
| 4 | 23 | 2 | unrecorded pairing count and no-new-sink wording R-12; the runbook gap closed |
| 5 | 17 | 2 | derived-artifact boundary R-7 and one absent privacy assertion; the seven missing rows and FR-026-031 are delivered |

The gate commands are green and were run with their exit codes recorded:
`node scripts/selftest.mjs` at `Research-Lab self-test: 3042 passed, 0 failed`
exit 0; the browser suite at `28 passed (12.6s)` exit 0 across two browser
projects; and `node scripts/validate-brief-payload.mjs`,
`node scripts/build-pages-site.mjs`, `node scripts/validate-brief-cache.mjs`,
`node scripts/audit-reader-legibility.mjs` and `node scripts/pii-scan.mjs` all at
exit 0. Full transcripts are in `## Scopes 3, 4 and 5 Test Evidence` and `### E11`.

**The headline has moved, and the reason it moved is recorded rather than
asserted.** The previous pass judged Scope 5 materially incomplete because more
than half its declared test coverage had never been written — the gates were
green partly because the hardest assertions did not exist. That is no longer
true: all fifteen Scope 5 rows now exist, both publication-path canaries name
their pre-existing steps explicitly, and FR-026-031 is delivered by a shipped
producer rather than by a hard `null` placeholder. Scope 5 moved from 8 checked
to 17.

**What remains open is bookkeeping and one real gap, and they are different in
kind.** Six of the eight open items are Change Boundary or append-rule
bookkeeping (R-7, R-9, R-10, R-12) plus one unrecorded measurement — conditions
that are structural facts about pushed commits or about plan wording, and that
cannot be closed by this session without either rewriting history or amending
the plan. The eighth is a genuine coverage gap: Scope 5 still carries no
per-artifact privacy assertion over the scorecard, the outcome rows and the
rendered track-record string, which is the one R-14 row the new test authoring
did not close. `node scripts/pii-scan.mjs` returns `findings=0` repository-wide,
but that is a different instrument and is not offered as a substitute.
Certification remains `bubbles.validate`'s judgement; the evidence it needs is
recorded below rather than summarised away.

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
| R-10 | **Commit `3855ee75d` (Scope 3) carried 397 added lines of FOREIGN Feature 022 selftest content.** The commit added three marker-bounded groups, not one: `Feature 022 Scope 01: preferential breakpoints beyond `single``, `Feature 022 Scope 01: no bracket edge is shadowed in ANY rltax module`, and the genuine `Feature 026 Scope 3: rlcockpit.js — change vocabulary`. Measured split of the 861 insertions: 397 lines in the Feature 022 region against 453 in the Feature 026 region. The Change Boundary admits `scripts/selftest.mjs` for "appended marker-bounded **Feature 026** groups only", so this breaches the boundary even though the file itself is admitted. Almost certainly a concurrent session's work swept in by a broad `git add` — the same contamination class as R-8 and E9. **Not repaired here:** rewriting a pushed commit to excise another session's assertions would destroy work this scope does not own, and the assertions themselves pass. | owner of the concurrent Feature 022 session, with the plan owner for the boundary record | the Scope 3 Tier 1 "no file outside the Allowed file families table changed" item, which is left unchecked and cites this finding |
| R-11 | **Test Plan row 1.12 has no assertion carrying its own marker.** The row's behaviour — the composer cannot regress to an unstamped payload — does execute and pass, but under the **1.6** marker at `scripts/selftest.mjs` line 21404, `TP-026-1.6 the writer stamps v2 from the validator's exported constant, so the two cannot drift to different literals`. `grep -c "TP-026-1.12 "` returns 0. The delivered mechanism is stronger than the row as written, because the composer imports `BRIEF_PAYLOAD_BUDGET_CONTRACT` from the validator rather than repeating a literal, so the two cannot drift. This is a marker-hygiene defect only: row-to-assertion traceability is broken even though coverage is not. | plan owner (`scopes.md` Scope 1 Test Plan) or implementer, to relabel | nothing; Scope 1 is complete and the two items that cite the row are checked with the mismatch named |
| R-12 | **The Scope 4 no-new-sink DoD clause is unsatisfiable as literally worded by any renderer change.** The item requires "a source assertion that `rlbrief.js` gained no new direct `innerHTML` assignment", but `el.innerHTML = …` with `esc()` on model-authored values IS the file's established rendering idiom, so any new block adds one. Commit `6b00105c7` added 9, taking the file from 25 to 34. The substantive protection holds and is proven: row 4.12 passes and the repository-wide `no model/config-authored field reaches innerHTML without esc()` guard passes alongside its own non-vacuity control. The wording should become "introduced no new UNESCAPED sink", which is what the guards actually prove. | plan owner (`scopes.md` Scope 4 DoD wording) | the Scope 4 "every authored string reaches the DOM through `esc`" item, left unchecked pending the wording amendment |
| R-13 | **Three of the five scopes never updated `notes/market-brief.md`, and one of the gaps is an active contradiction.** The runbook was modified by exactly one Feature 026 commit, `0f61d1a14`, which added §9a and §9b for Scopes 1 and 2. Scopes 3, 4 and 5 each carry a runbook DoD item and none delivered it. Measured over the committed file: the change-vocabulary kind names occur 0 times (Scope 3), the tokens `collapsed` and `disclosure` occur 0 times (Scope 4), and — the serious one — §10a line 758 still states that `scripts/build-attention-scorecard.mjs` "is a manual CLI, not part of the" scheduled path, which Scope 5 made false by wiring it into both publication paths. A reader following the runbook would either run a builder by hand that the pipeline already runs, or assume an unwired producer that is in fact wired. **2026-08-19 — REMEDIATED and closed.** All three sections were subsequently written and the contradiction repaired. Re-measured over the committed runbook: `levelCrossed`=2, `stateFlipped`=2, `flagRaised`=3, `flagCleared`=3, `baseline`=7 (§5, was 0 for the kind names); `collapsed`=4, `disclosure`=1 with `### 9c. Disclosure` at line 774 (was 0); and the phrase "manual CLI" now occurs on exactly one line, §10a's correction `scripts/build-attention-scorecard.mjs` **"is no longer a manual CLI"**. The three runbook DoD items in Scopes 3, 4 and 5 are now checked, each quoting the delivered text. **One qualification: §9c and §10a are in `HEAD`; the §5 text is present in the working tree but NOT YET COMMITTED — pending diff `17 insertions(+), 1 deletion(-)`, and `git show HEAD:notes/market-brief.md` returns 0 occurrences of `levelCrossed`. Routed as R-18.** | docs owner, or implementer under a docs-scoped follow-up | **closed** — the runbook DoD item in each of Scopes 3, 4 and 5 is now checked; the §5 item carries the pending-commit qualification on its face |
| R-14 | **Seven of Scope 5's fifteen declared Test Plan rows were never authored, and FR-026-031 is undelivered.** The `market brief — closed loop on the path` group contains exactly eight assertions, covering rows 5.2 (three, one subsuming 5.10 and one being 5.11's adversarial), 5.3, 5.4, 5.5, 5.6 and 5.7. Absent under any marker: **5.1, 5.8, 5.9, 5.12, 5.13, 5.14, 5.15**. `SCN-026-CANARY-05` and `SCN-026-CANARY-05B` return no match anywhere in the suite, so both publication-path canaries are missing from the only scope that edits the publication path. Separately, **FR-026-031 has no implementation**: commit `ec7d24b31` does not touch `scripts/brief-narrative-parallel.mjs`, so no run records a claim together with the observation that would resolve it, and the memory row's claims block at `scripts/brief-refresh.mjs` line 1230 is `{ openCount, openedThisRun: null, resolvedThisRun: null }` — two hard `null` placeholders. Also missing: the PII field-name scan every other scope carries for its own artifacts. **2026-08-19 — REMEDIATED IN PART; one row remains open and is named rather than swept along.** All seven absent rows were subsequently authored and pass — re-measured marker counts 5.1=3, 5.8=1, 5.9=2, 5.12=2, 5.13=1, 5.14=1, 5.15=1, and both canaries now match at `SCN-026-CANARY-05`=4 and `SCN-026-CANARY-05B`=2. FR-026-031 is delivered: row 5.1's second assertion pins the shipped producer to `resolvedThisRun = scorecard.resolvedThisRun` and forbids a second local tally, so the field is no longer a hard `null`. **What is NOT remediated is the last clause of this finding:** the per-artifact privacy scan is still absent from the Scope 5 group. A scan of `scripts/selftest.mjs` lines 23206–23389 for `position`, `costBasis`, `cost_basis`, `pnl`, `profit`, `credential`, `password`, `secret`, `apiKey` and currency-shaped tokens returns **zero** matching lines; `costBasis` occurs only in the Scope 2 group (line 21986) and the Scope 3 group (line 22918). | plan owner and implementer, as a Scope 5 completion pass | **narrowed from six DoD items to one** — five are now checked; only the Scope 5 privacy item remains unchecked, citing this residual clause |
| R-15 | **A Scope 5 DoD item names a figure the ledger has outgrown.** The `notEvaluableShare` item says to record "the observed value against 152 of 304". The committed scorecard now reports `notEvaluable` 152 of `closed` **330**, so the share is **0.4606**, not the 0.50 the plan anticipated. The numerator is unchanged and the denominator has grown, which is the expected behaviour of an append-only ledger. The item's expected value needs restating as a derivation rather than a literal pair. **2026-08-19 — STILL OPEN with the plan owner, but no longer blocking.** The companion cause is gone: row 5.8 now exists and asserts the derivation `notEvaluableShare === Math.round(notEvaluable / closed * 1e4) / 1e4` rather than a literal. The DoD item's stated verification is "recording the observed value against 152 of 304", and that recording is now performed with the divergence named — observed `closed=330`, `notEvaluable=152`, `notEvaluableShare=0.4606` — so the item is checked on the recording, not on adoption of the stale pair. The plan-side wording still needs the amendment described above. | plan owner (`scopes.md` Scope 5 DoD) | the `notEvaluableShare` item is now checked, with the divergence recorded inline rather than absorbed |
| R-16 | **The delivered runbook §9c carries a stale block count that contradicts its own enumeration.** The section's summary sentence reads "Fourteen blocks, six visible, eight collapsed", but its own collapsed list names eight blocks **plus** the `tool-reads` and `experimental` drawers — ten — and the selftest independently pins the total at "exactly 16 uniquely-named top-level blocks, six default-visible and ten collapsed". The enumeration and the selftest agree with each other; only the summary sentence's two numbers are wrong. Surfaced by the 2026-08-19 closure pass while quoting §9c as evidence, and reported rather than repaired, because this session's write boundary is `scopes.md` and `report.md` only. | docs owner | nothing; the Scope 4 runbook DoD item requires the three recordings, which are present and correct, so it is checked with this inconsistency named |
| R-17 | **Test Plan row 5.13 proves the weaker of the two readings its DoD item admits.** The item says the minimum sample "is read from `scorecard-policy/v1.minResolvedSample` and no second constant is declared". Row 5.13 as authored proves this by **value identity** — `market-brief.config.json` declares 20 and the published `market-brief.scorecard.json` carries 20 — which a second constant coincidentally holding 20 would pass. The stronger form the phrase also admits is a source-side scan for a second literal `20` in the changed source, which is what the row's original plan text described. Surfaced by the 2026-08-19 closure pass. | plan owner (`scopes.md` Scope 5 Test Plan) or implementer, to strengthen the assertion | nothing; the DoD item's own stated verification is "row 5.13 passing", which is met, and the item is checked with this deviation named |
| R-18 | **The delivered §5 runbook text is uncommitted.** The Scope 3 change-vocabulary documentation — the five kinds, the precedence order and the `baseline`-versus-`unchanged` distinction — exists in the working tree but not in `HEAD`: `git show HEAD:notes/market-brief.md` returns **0** occurrences of `levelCrossed` against **2** in the working tree, with a pending `17 insertions(+), 1 deletion(-)` diff. The added lines were inspected and contain that content and nothing else, so this is Feature 026's own Scope 3 delivery awaiting a commit rather than a concurrent session's work. §9c and §10a are both in `HEAD` by contrast. Surfaced by the 2026-08-19 closure pass, which cannot commit it: that pass's write boundary is `scopes.md` and `report.md` only. **Until it is committed a `git checkout` would silently erase the delivery and reopen the Scope 3 runbook item.** | implementer, to commit `notes/market-brief.md` | nothing; the Scope 3 runbook DoD item is checked on the text being present and quotable, with this pending-commit qualification stated on the item itself |

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

## Scopes 3, 4 and 5 Test Evidence — Definition of Done closure pass, 2026-08-19

Every block below is real terminal output produced in this session. Runs longer
than 40 lines were recorded through `.github/bubbles/scripts/evidence-capture.sh`,
which prints the command, the real exit code, the line count, a sha256 over every
line the command produced, the failure-shaped lines and the first and last 20
lines. The hash is re-derivable with `--verify`, so these blocks are checkable in
a way a paste is not. No source file was modified by this pass; the only files
edited are `scopes.md`, `report.md` and `state.json`.

### E10-1 — The full suite, and the honest account of a run that was not green

The Scopes 1 and 2 selftest items had been unchecked since they were written,
each blocked on the Scope 4 browser suite that did not yet exist. Scope 4 created
it, so the item became satisfiable for the first time. It was verified rather
than assumed:

```text
$ bash .github/bubbles/scripts/evidence-capture.sh --label "selftest-clean-tree-1" -- node scripts/selftest.mjs
exit: 0
lines: 3415
sha256: 29700a6bfd4a430dd306357fff2afd7b4783087e4031dcb8bb03c54c38c20f1a

================================================
Research-Lab self-test: 3019 passed, 0 failed
================================================
```

**This was not the first result, and the discrepancy is recorded rather than
buried.** Four runs were taken in this session and they did not agree:

| # | Command form | Observed | Exit |
| --- | --- | --- | --- |
| 1 | `node scripts/selftest.mjs` | — | 0 |
| 2 | evidence-capture, sha256 `cf39fa0d…` | `3018 passed, 1 failed` | 1 |
| 3 | `node scripts/selftest.mjs` | `3018 passed, 1 failed` | 1 |
| 4 | evidence-capture, sha256 `e808b86d…` | `3019 passed, 0 failed` | 0 |
| 5 | evidence-capture, sha256 `29700a6b…`, clean tree confirmed first | `3019 passed, 0 failed` | 0 |

A suite that fails half the time does not satisfy "exits 0 with zero failures",
so the cause was diagnosed before any box was checked. See E10-2.

### E10-2 — The intermittent failure was foreign, transient and is now excluded

The failing assertion in runs 2 and 3 was, verbatim from the capture's
failure-shaped-lines section:

```text
  ✗ FAIL: TP-01-01: PropertyAssessment/v1 refuses any member carrying a sourceRef, and a regime figure whose sourceRef names no record is refused rather than displayed with an unreachable citation
```

That assertion is at `scripts/selftest.mjs` line 15340, inside the group
`lifetime-tax — property assessment and statutory relief`. It belongs to
**Feature 023**, not Feature 026, and it reads `rltaxproperty.js`. The working
tree at that moment showed:

```text
$ git status --short
 M rltaxproperty.js
 M specs/023-property-tax-and-rental-income/scopes/01-property-assessment-mechanics/report.md
 M specs/023-property-tax-and-rental-income/scopes/03-long-term-rental/report.md
 M specs/023-property-tax-and-rental-income/scopes/04-short-term-and-vacation-rental/report.md
 M specs/023-property-tax-and-rental-income/scopes/05-disposition/report.md
 M specs/025-company-multi-horizon-intelligence-lab/report.md
 M specs/025-company-multi-horizon-intelligence-lab/state.json

$ stat -f '%Sm %N' -t '%Y-%m-%dT%H:%M:%S' rltaxproperty.js
2026-08-18T23:49:37 rltaxproperty.js
$ date '+%Y-%m-%dT%H:%M:%S now'
2026-08-18T23:50:03 now
```

`rltaxproperty.js` — the exact file that assertion loads — had been written 26
seconds earlier by a concurrent session, and its diff was a single line. Moments
later `git diff rltaxproperty.js` returned empty: the file had been restored to
`HEAD`. That is this repository's standard adversarial pattern, in which a guard
is deliberately broken, the suite is run to prove the guard is load-bearing, and
the file is restored. Run 5 was taken only after confirming the tree was clean
for that path:

```text
$ git status --porcelain rltaxproperty.js; echo "TREE_CLEAN_FOR_RLTAXPROPERTY=$?"
TREE_CLEAN_FOR_RLTAXPROPERTY=0
```

**Conclusion, stated plainly.** The suite is green. The two red runs were caused
by another session's transient mutation of a Feature 023 file, not by any Feature
026 change, and no Feature 026 assertion failed in any of the five runs. Every
box checked against "the selftest exits 0" cites run 5, whose tree state was
verified first.

### E10-3 — The publication validator

```text
$ bash .github/bubbles/scripts/evidence-capture.sh --label "validate-brief-payload" -- node scripts/validate-brief-payload.mjs market-brief.payload.json
exit: 0
lines: 6
sha256: a0029e4f2e7e92919dc1f7d8f56ec6177ab240d627da3b9933345f64565367d8
--- output ---
[brief-contract] company owner-read names its producing adapter and states that no recommendation is produced: PASS
[brief-contract] SCN-019-020 payload toolRead and page read agree and expose no destination routing fields: PASS
[brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
[brief-contract] causal brief items require eligible stage owner freshness independent reason and falsifiers: PASS (no causal read published yet)
[brief-contract] Market Brief causal coverage and elevation satisfy low-noise independence policy: PASS (coverageRows=1 elevated=false planEligible=false)
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
```

Identical to the output Scopes 1 and 2 recorded. The version gate is confirmed
directly against the committed artifact rather than inferred:

```text
$ node -e "…"
payload contractVersion: undefined
has trackRecord? false undefined
has crossAsset? false
has changed? false
has rollUp? false
has budget? false
```

The committed payload carries no `contractVersion`, so all three v2-gated blocks
— `outputBudget:`, `crossAsset:` and `delta:` — skip it, exactly as R-5's
precaution requires. It also carries none of the Feature 026 payload fields,
because the scheduled Tier-A run has not republished since the code landed. The
suite models this explicitly rather than pretending otherwise, in the assertion
`the live payload's cross-asset, changed and roll-up blocks are either absent
because the composer has not republished, or in the pinned contract shape every
reader token can label — never a third shape the fixtures do not model`.

### E10-4 — Change boundary, per commit and per excluded path

Non-spec files touched by each scope's commit:

```text
$ git show --stat --name-status <commit> -- . ':!specs/026-actionable-brief-brevity-and-cross-asset'

3855ee75d  feat(026): memory row v2, change vocabulary and delta-only publishing (Scope 3)
M  brief-history.recent.jsonl        ← DERIVED artifact, not in the Allowed table (R-7 shape)
M  market-brief.config.json
M  rlcockpit.js
M  scripts/brief-narrative-parallel.mjs
M  scripts/brief-refresh.mjs
M  scripts/selftest.mjs
M  scripts/shard-brief-history.mjs
M  scripts/validate-brief-payload.mjs

6b00105c7  feat(026): disclosure-first rendering and the browser suite (Scope 4)
M  market-brief.html
M  rlbrief.js
M  rlcockpit.js
M  scripts/selftest.mjs
A  tests/market-brief-cockpit.spec.mjs        ← all five admitted for scope 4

ec7d24b31  feat(026): close the loop on the publication path (Scope 5)
M  .github/workflows/tier-a.yml
M  market-brief.scorecard.json                ← DERIVED artifact, not in the Allowed table (R-7 shape)
M  scripts/brief-refresh-and-push.sh
M  scripts/build-scorecard.mjs
M  scripts/selftest.mjs
M  tests/market-brief-cockpit.spec.mjs        ← admitted for scope 4 only, not scope 5
```

Scope 4 is the only scope whose commit stayed entirely inside its Allowed
families. Excluded paths, counted per commit across all five Feature 026 commits
rather than over a range that would sweep in the merge's 26 upstream commits:

```text
rlattention.js                                                touched_by_026_commits=0
tools.json                                                    touched_by_026_commits=0
index.html                                                    touched_by_026_commits=0
rlnav.js                                                      touched_by_026_commits=0
market-brief.payload.json                                     touched_by_026_commits=0
real-assets-universe.json                                     touched_by_026_commits=0
specs/026-…/spec.md                                           touched_by_026_commits=1
specs/026-…/design.md                                         touched_by_026_commits=1
```

The two spec-folder hits are creations, not amendments: `0f61d1a14` adds
`design.md` at `1297 0` and `spec.md` at `2196 0` — insertions only, zero
deletions — and commits `3855ee75d`, `6b00105c7` and `ec7d24b31` touch neither.
The BUG-009 folder is touched only by `0f61d1a14`, which created it, and by
`a7ca8ad55`; Scopes 3, 4 and 5 touch it zero times.

### E10-5 — The shared selftest append rule, per scope

```text
$ git show --numstat --format= <commit> -- scripts/selftest.mjs
3855ee75d: 861  2   scripts/selftest.mjs     ← 2 deletions; rule requires 0
6b00105c7: 218  0   scripts/selftest.mjs     ← clean
ec7d24b31:  86  0   scripts/selftest.mjs     ← clean
```

Scope 3's two deleted lines, in full:

```text
-     in the `rlcockpit.js — cross-asset legs` group, not assumed here. */
-  const otherLines26 = (errors) => errors.filter((line) => line.indexOf('outputBudget: ') !== 0 && line.indexOf('crossAsset: ') !== 0);
```

Both are the same physical statement and its trailing comment, at the head of
Feature 026's own **Scope 1** budget group. The replacement extends the filter
with a third clause, `&& line.indexOf('delta: ') !== 0`. The change is additive
in effect and touches no foreign spec, which distinguishes it from Scope 2's
R-9 deletions — but the item's mechanical test is a deletion count of 0 and the
observed count is 2, so the box stays unchecked.

Scope 3's insertions are not all its own:

```text
$ git show 3855ee75d -- scripts/selftest.mjs | grep -E '^\+.*-{6,}.*(START|BEGIN|END)'
+/* ---------- Feature 022 Scope 01: preferential breakpoints beyond `single` (START) ---------- */
+/* ---------- Feature 022 Scope 01: preferential breakpoints beyond `single` (END) ---------- */
+/* ---------- Feature 022 Scope 01: no bracket edge is shadowed in ANY rltax module (START) ---------- */
+/* ---------- Feature 022 Scope 01: no bracket edge is shadowed in ANY rltax module (END) ---------- */
+/* ---------- Feature 026 Scope 3: rlcockpit.js — change vocabulary (BEGIN) ---------- */
+/* ---------- Feature 026 Scope 3: rlcockpit.js — change vocabulary (END) ---------- */

added_lines_feature022_region=397
added_lines_feature026_scope3_region=453
```

397 of the 861 insertions are foreign Feature 022 content. Routed as R-10.

### E10-6 — Direct source measurements

Every figure below is a count over the committed tree, taken in this session.

| Claim | Command shape | Observed |
| --- | --- | --- |
| `rlcockpit.js` calls no clock | `grep -c "Date.now" rlcockpit.js` | **0** |
| `rlcockpit.js` constructs no date | `grep -c "new Date(" rlcockpit.js` | **0** |
| `rlcockpit.js` calls no random source | `grep -c "Math.random" rlcockpit.js` | **0** |
| `rlcockpit.js` size | `wc -l` | 664 lines |
| Scope 3 flag producers named in group | `foldLedger` / `flipProximityPct` / `isPersistentSignal` / `nearTermEvents` | **3 / 5 / 7 / 4** |
| Persistence gate reads committed config | `persistenceSnapshots` in group | **4** |
| `changeKind` consumers | composer / validator | **1 / 1** |
| `rollUpFrom` consumers | composer / validator | **1 / 0** |
| `rollUpBalances` consumers | composer / validator | **1 / 1** |
| `legTokenLabel` consumers | renderer | **2** |
| `changeTokenLabel` consumers | renderer | **1** |
| v2 recent window size | `wc -c brief-history.recent.jsonl` | **11,927 bytes over 30 rows** |
| Scorecard size | `wc -c market-brief.scorecard.json` | **12,200 bytes** |
| `artifact-budget/v1` limit | committed | 262,144 bytes |
| New `innerHTML` lines in Scope 4 | `git show 6b00105c7 -- rlbrief.js \| grep -c '^+.*innerHTML'` | **9** (file total 34) |
| `scripts/reader-vocabulary.mjs` edited by 026 | per-commit numstat | **untouched by all five** |

The composer's live call sites, read from `scripts/brief-narrative-parallel.mjs`:

```text
 29: const RLCOCKPIT = createRequire(import.meta.url)(resolve(ROOT, 'rlcockpit.js'));
789:                     dark.push(RLCOCKPIT.darkState(legPolicy,
795:             const resolved = RLCOCKPIT.resolveLeg(legPolicy, measured[legPolicy.id] ?? null, crossAssetPolicy.sessions);
836:             const kind = RLCOCKPIT.changeKind(prev, cur, changeVocabulary);
841:         const rollUp = RLCOCKPIT.rollUpFrom(curStates, kinds);
852:             + ` balances=${RLCOCKPIT.rollUpBalances(changed.length, rollUp, Object.keys(curStates).length)}`);
873:         const selection = RLCOCKPIT.selectDefaultVisible(payload, outputBudgetPolicy);
875:         payload.budget = RLCOCKPIT.measureDefaultVisible(payload, outputBudgetPolicy);
876:         payload.contractVersion = BRIEF_PAYLOAD_BUDGET_CONTRACT;
```

Line 876 is the payload stamp, and it resolves through an import rather than a
literal:

```text
scripts/brief-narrative-parallel.mjs:20: import { BRIEF_PAYLOAD_BUDGET_CONTRACT, … } from './validate-brief-payload.mjs';
scripts/validate-brief-payload.mjs:30:   export const BRIEF_PAYLOAD_BUDGET_CONTRACT = 'market-brief-payload/v2';
scripts/validate-brief-payload.mjs:714:  if (payload?.contractVersion === BRIEF_PAYLOAD_BUDGET_CONTRACT && hasObject(budgetPolicy)) {
scripts/validate-brief-payload.mjs:739:  if (payload?.contractVersion === BRIEF_PAYLOAD_BUDGET_CONTRACT && hasObject(crossAssetPolicy)) {
scripts/validate-brief-payload.mjs:825:  if (payload?.contractVersion === BRIEF_PAYLOAD_BUDGET_CONTRACT && hasObject(changeVocabulary)) {
```

Writer and gate share one constant, so they cannot drift to different literals.
This is what row 1.12 was written to protect, delivered in a stronger form than
the row describes — see R-11 on the marker mismatch.

### E10-7 — Test Plan row accounting, all five scopes

The suite reports `0 failed`, so any assertion present in it passed. Row coverage
was therefore established by locating each row's marker in `scripts/selftest.mjs`.

| Scope | Rows declared | Rows with an assertion | Rows absent |
| --- | --- | --- | --- |
| 1 | 15 | 14, plus row 1.12's behaviour under the 1.6 marker | none in substance; 1.12 lacks its own marker (R-11) |
| 2 | 19 | 19 | none |
| 3 | 19 | 19 (3.1 and 3.3 share one combined assertion) | none |
| 4 | 18 | 18 (14 browser + 2 selftest + 1 canary + 1 build gate) | none |
| 5 | 15 | **8** | **5.1, 5.8, 5.9, 5.12, 5.13, 5.14, 5.15** |

Scope 5's absences, measured:

```text
TP-026-5.1=0   TP-026-5.2=3   TP-026-5.3=1   TP-026-5.4=1   TP-026-5.5=1
TP-026-5.6=1   TP-026-5.7=1   TP-026-5.8=0   TP-026-5.9=0   TP-026-5.10=0
TP-026-5.11=0  TP-026-5.12=0  TP-026-5.13=0  TP-026-5.14=0  TP-026-5.15=0
```

Rows 5.10 and 5.11 are covered in substance by the 5.2 assertions, which check
every closed-loop producer in both publication paths and carry the adversarial
that rejects a path with no caller. The other seven are covered by nothing.
`SCN-026-CANARY-05` and `SCN-026-CANARY-05B` return no match anywhere in the
suite, so both Scope 5 canaries were never authored. Canaries 01 through 04 do
exist, at lines 21634, 22011, 22860 and 23078. Routed as R-14.

### E10-8 — The runbook gap, measured

```text
$ for c in 0f61d1a14 a7ca8ad55 3855ee75d 6b00105c7 ec7d24b31; do git show --numstat --format= $c -- notes/market-brief.md; done
0f61d1a14: 113  0   notes/market-brief.md
a7ca8ad55: (untouched)
3855ee75d: (untouched)
6b00105c7: (untouched)
ec7d24b31: (untouched)

$ grep -c "levelCrossed\|stateFlipped\|flagRaised\|flagCleared" notes/market-brief.md
0
$ grep -c "collapsed\|disclosure" notes/market-brief.md
0
$ grep -n "10a\|build-attention-scorecard" notes/market-brief.md
737:## 10a. The two attention surfaces, and why there are two
758:scheduled step appends to it — `scripts/build-attention-scorecard.mjs` is a manual CLI, not part of the
775:`market-brief.attention-scorecard.json` (the interruption record — manual, see §10a). Also implement the
```

Line 758 is the active contradiction: Scope 5 wired that builder into both
publication paths, so the runbook now tells a reader the opposite of what the
pipeline does. Routed as R-13.

### E10-9 — Requirement coverage, Scopes 3, 4 and 5

| Scope | Requirement → row | Verdict |
| --- | --- | --- |
| 3 | 007→3.2, 008→3.9 and 3.10, 009→3.4, 010→3.5, 011→3.1/3.3, 012→3.5 and 3.15, 036→3.6, 037→3.7, 038→3.8, 039→3.11, 040→3.12 | all eleven covered by a passing row |
| 4 | 025→4.6, 026→4.7, 027→4.1, 028→4.2 and 4.3, 029→4.5 and 4.4, 030→4.8 and 4.14 | all six covered by a passing row |
| 5 | 032→5.2, 033→5.2 (partial), 034→5.4, 035→5.5, 5.6 and 5.7 | four covered |
| 5 | **031→5.1** | **not covered — row absent AND behaviour undelivered** |

FR-026-031 requires a run to record what it claimed together with the observation
that would resolve it. Commit `ec7d24b31` does not touch the payload composer at
all, and the memory row's claims block is
`{ claims: { openCount, openedThisRun: null, resolvedThisRun: null }, openInstruments }`
at `scripts/brief-refresh.mjs` line 1230 — two of three fields are hard `null`
placeholders. This is an undelivered requirement, not a missing test. Routed as
R-14.

### E10-10 — The browser suite

```text
$ bash .github/bubbles/scripts/evidence-capture.sh --label "playwright-cockpit-system-chrome" -- npx --no-install playwright test tests/market-brief-cockpit.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 19
sha256: 7be1d73945974a1559204bbc03aecb4a4ee54baa6fb754f2e46cb6fe6bc402ee
--- output ---

Running 14 tests using 1 worker

  ✓   1 … every supporting block is collapsed on load and the decision surface, dark states, changed list and roll-up are visible (1.5s)
  ✓   2 … every disclosure control is reachable and operable by keyboard alone and reports aria-expanded on both states (1.7s)
  ✓   3 … expanding a block from a file:// origin requires no network call, no credential and no build step (1.9s)
  ✓   4 … a dark state, a resolved miss and an invalidation are each outside every collapsed control (954ms)
  ✓   5 … Regression: SCN-026-018 every dark state renders above the first supporting block in the default view (466ms)
  ✓   6 … the default view contains only the decision surface, the dark states, the changed narrative and the roll-up line (1.1s)
  ✓   7 … each supporting block is expandable through exactly one control and no block carries two (1.0s)
  ✓   8 … every rendered default-view value carries an in-place explanation of what it is and what the current value implies (1.1s)
  ✓   9 … Regression: SCN-026-BUG009 the live payload renders the unreachable decision-surface statement and no fabricated card (1.0s)
  ✓  10 … fixture: a payload with an empty attention list and a reachable producer renders the quiet statement (1.2s)
  ✓  11 … fixture: a payload carrying ranked attention cards renders them collapsed to their summaries (1.0s)
  ✓  12 … Regression: SCN-026-ESC a payload whose narrative carries markup renders as escaped text at every sink (1.1s)
  ✓  13 … adversarial: moving a dark card inside a details element fails the not-collapsed assertion (992ms)
  ✓  14 … adversarial: focus order follows DOM order and no style rule reorders a visible block behind a collapsed one (619ms)

  14 passed (20.5s)
```

Fourteen `✓`, no `failed` line, no `skipped` line, no `flaky` line, exit 0.

### E10-11 — The site build gate

```text
$ bash .github/bubbles/scripts/evidence-capture.sh --label "build-pages-site" -- node scripts/build-pages-site.mjs
exit: 0
lines: 1
sha256: 2aa7df0cc87ec87ecce5dabb2ff1d115dc25dff52043fb5875118d39751c2537
--- output ---
{"contractVersion":"pages-site-build-result/v1","dryRun":false,"registeredPages":28,"excludedPaths":12,"rootFiles":120,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/70816f484626a4b2b76a8cc6565456152ba6b19189568261ef210ab7e72a9745","omittedOrphanIndexes":141}
```

`rootFiles` 120, one above the 119 Scope 1 recorded. A `git status --short` taken
immediately after showed no Feature 026 path modified, so the build accounted for
every new root file without refusing one and without needing a
`site-exclusions.json` entry.

### E10-12 — The default view, from the page itself

The selftest pins both sides of the screen inventory:

```text
✓ market-brief.html classifies exactly 16 uniquely-named top-level blocks, six default-visible and ten collapsed, so an unclassified block cannot reach the default view unnoticed
✓ market-brief.html declares no ES-module script tag, carries one drawer per collapsed block, and ships no drawer with an open attribute, so the default view is collapsed on every load rather than on the first only
✓ tests/market-brief-cockpit.spec.mjs declares fourteen tests, labels both fixture-sourced decision-surface rows as such, intercepts no request, and binds itself to neither the payload nor the history ledger
✓ the comment stripper the suite scan relies on still sees an interception written in code, and stops seeing one written in prose
```

Six visible plus ten collapsed accounts for all sixteen blocks. Browser row 4.6
asserts the visible set as an exact sorted equality:
`['changed', 'cross-asset', 'dark-legs', 'decision-surface', 'headline', 'track-record']`.

### E10-13 — The two fixture-sourced decision-surface rows

Rows 4.10 and 4.11 are **fixture-sourced and are not live coverage.** Both test
titles begin with the literal token `fixture:`, observed verbatim in E10-10, and
the selftest enforces that labelling mechanically rather than trusting it. While
BUG-009 stays open the attention feed publishes nothing on any live run, so the
quiet statement and the ranked-cards state have no live subject; only the
unreachable statement, covered by row 4.9 against the committed payload, does.
Neither fixture row is offered here or in `scopes.md` as evidence of live
behaviour.

### E10-14 — Reader vocabulary

Row 4.13 passes with two adversarial variants, each of which fails when its guard
is removed, plus a non-vacuity control:

```text
✓ TP-026-4.13 adversarial: replacing changeTokenLabel's final refusal with a pass-through prints an undeclared kind at the reader
✓ TP-026-4.13 adversarial: flipping legTokenLabel does the same for legs
✓ the reader-vocabulary scan used above catches a string that genuinely carries framework vocabulary, so its clean verdict on the new copy is not vacuously green
```

**One deviation from the DoD wording is recorded rather than glossed.**
`scripts/reader-vocabulary.mjs` is byte-unchanged by all five Feature 026
commits. The new fields did not join a static checked set inside that module.
Instead the Scope 4 group imports its `findReaderVocabularyLeaks` function and
runs the new reader copy through it — a function applied to strings rather than a
registry of field names, so no edit was required and a future reader string is
covered without anyone remembering to register it.

### E10-15 — The closed loop, as published

```text
resolvedThisRun: {"runId":"evaluate-2026-08-18","closed":26,"satisfied":3,"invalidated":16,"expired":7,"unresolved":0,"notEvaluable":0,"resolved":19}
policy:          {"minResolvedSample":20,"recentMissCount":3,"windowDays":[30,90],…}
windows.all:     closed=330 satisfied=85 invalidated=69 expired=24 notEvaluable=152 unresolved=0 resolved=154 hitRate=0.5519
notEvaluableShare (windows.all): 0.4606
openCalls (top level):           103
scorecard bytes:                 12200
```

The row 5.7 identity holds on the observed values: 3 + 16 = 19 = `resolved`, and
19 ≤ 26 = `closed`. Two figures differ from what `scopes.md` anticipated, and
both are recorded rather than reconciled by rewriting the observation:

- The open count is published as **`openCalls`**, not `openCount`. The field is
  present, top-level and adjacent to `resolvedThisRun`; only the identifier
  differs, and `openCalls` is the pre-existing name the renderer consumes.
- `notEvaluableShare` is **152 of 330 at 0.4606**, not the 152 of 304 at 0.50 the
  DoD item names. The numerator is unchanged and the denominator has grown, which
  is what an append-only ledger does. Routed as R-15.

### E10-16 — The publication path, additive only

```text
$ git show --numstat --format= ec7d24b31 -- .github/workflows/tier-a.yml scripts/brief-refresh-and-push.sh scripts/build-scorecard.mjs
8   0   .github/workflows/tier-a.yml
9   0   scripts/brief-refresh-and-push.sh
21  2   scripts/build-scorecard.mjs

$ git show ec7d24b31 -- .github/workflows/tier-a.yml scripts/brief-refresh-and-push.sh | grep -c '^+.*build-attention-scorecard'
2
```

Zero deletions in both publication-path files, so every pre-existing step and
invocation survives byte-unchanged, and exactly one `build-attention-scorecard`
invocation was added to each. The producer-existence assertions that make this
durable:

```text
✓ TP-026-5.2 every closed-loop producer has a production caller in BOTH .github/workflows/tier-a.yml and scripts/brief-refresh-and-push.sh (unwired: none)
✓ TP-026-5.2 every build-attention-scorecard.mjs caller supplies the --as-of instant its CLI requires, so the call cannot fail into a soft-fail branch and leave the producer unwired
✓ TP-026-5.2 adversarial: a path with no caller and a caller with no --as-of are both rejected by the two checks above
```

The second is the sharper of the three: a caller that omits a required argument
fails into the `|| echo` soft-fail branch and leaves the producer effectively
unwired while looking wired, which is BUG-009's exact shape. What is still
missing is row 5.14, the canary that would name each pre-existing step so a
future reordering fails before the next scheduled run does. Routed as R-14.

### E10-17 — The track record, rendered

`market-brief.html` was served over a temporary loopback HTTP server and read out
of the live DOM. The server was stopped and the browser closed immediately after;
no repository file was written.

```text
#scorecard        → "resolved in favour 55.2%  154 resolved of 330 closed  46.1% not machine-evaluable  103 still open  CALIBRATION — STATED VS REALISED …  MOST RECENT MISSES  XLY · rotate · swing  Invalidated 2026-08-18 — closed 767.45 through the published below 769.91 level (stated 55%). …"
#attentionRecord  → "HOW OFTEN THESE CALLS TURNED OUT TO MATTER  The closed sample is too small to report an interruption rate. 0 items are still open in the list below, so nothing has been scored yet."

#scorecard       closest('details') === null   → not collapsible
#attentionRecord closest('details') === null   → not collapsible
resolvedThisRun rendered anywhere?             → false
```

Two rates, two samples, two outcomes, one policy shape. The recommendation rate
publishes as a percentage because its sample of 154 clears the declared minimum
of 20; the attention rate withholds as a sentence because its sample is zero.
**Neither renders as `0%`**, which is the failure mode FR-026-035 exists to
prevent — a zero would read as "we were never right", a different and false
claim. Misses render at equal prominence with their instrument, level and reason.

One negative observation is recorded because it bears on a DoD item:
`resolvedThisRun` is published in the scorecard JSON but is rendered nowhere.
`grep -c "resolvedThisRun"` returns 0 for both `rlbrief.js` and
`market-brief.html`, and the rendered text contains no "this run" phrase. The
Scope 5 DoD item that names it is scoped to the builder publishing it, which it
does, so that item is checked; but the Implementation Plan's intent that the
track-record line show resolved-this-run is not met, and it is recorded here.

---

## E11 — Definition of Done closure pass, 2026-08-19

This pass changed no source file, no config and no test. It re-verified the 19
items the previous pass left unchecked against the current committed state,
checked the 11 that now satisfy their own stated verification method, and left 8
unchecked with the reason each still fails. Every measurement below was executed
in this session.

### E11-1 — The gate commands

```text
node scripts/selftest.mjs
  → Research-Lab self-test: 3042 passed, 0 failed
  → exit 0

npx playwright test tests/market-brief-cockpit.spec.mjs
  → 28 passed (12.6s)          (14 tests across 2 browser projects)
  → exit 0

node scripts/validate-brief-payload.mjs market-brief.payload.json   → exit 0
node scripts/build-pages-site.mjs                                   → exit 0
node scripts/validate-brief-cache.mjs                               → exit 0
node scripts/audit-reader-legibility.mjs                            → exit 0
  → pages audited: 28   with view tabs: 28   errored: 0   total leaks: 0
node scripts/pii-scan.mjs                                           → exit 0
  → [pii-scan] files=8034 messages=1477 findings=0 OK

bash .github/bubbles/scripts/artifact-lint.sh specs/026-actionable-brief-brevity-and-cross-asset
  → Artifact lint PASSED.
  → exit 0
```

The suite moved from the `3019 passed, 0 failed` the previous pass recorded to
`3042 passed, 0 failed`. The 23 added assertions are the seven previously-absent
Scope 5 rows and their supports, which is what makes this pass possible at all.

### E11-2 — The seven absent Scope 5 rows now exist

This is the measurement that reverses the previous pass's central finding. The
previous pass recorded `grep -c` returning **0** for each of rows 5.1, 5.8, 5.9,
5.12, 5.13, 5.14 and 5.15, and no match anywhere for either canary. Re-measured
against `scripts/selftest.mjs`:

```text
TP-026-5.1    count=3        TP-026-5.9    count=2        TP-026-5.14   count=1
TP-026-5.2    count=3        TP-026-5.10   count=1        TP-026-5.15   count=1
TP-026-5.3    count=1        TP-026-5.11   count=2
TP-026-5.4    count=1        TP-026-5.12   count=2        SCN-026-CANARY-05    count=4
TP-026-5.5    count=1        TP-026-5.13   count=1        SCN-026-CANARY-05B   count=2
TP-026-5.6    count=1
TP-026-5.7    count=1
TP-026-5.8    count=1
```

All fifteen declared rows are present. A run reporting `0 failed` means each of
them passed. The two canaries are the ones that mattered most, because Scope 5 is
the only scope that edits the publication path, and they now name their subjects
explicitly rather than asserting a property in the abstract:

```text
Regression: SCN-026-CANARY-05 every pre-existing tier-a.yml step and
  brief-refresh-and-push.sh invocation survives the added builder call (missing: none)
    steps asserted: Refresh Tier-A, Evaluate elapsed recommendations,
                    Rebuild the scorecard, Shard brief history
    calls asserted: scripts/brief-refresh.mjs, scripts/evaluate-recommendations.mjs,
                    scripts/build-owner-reads.mjs

Regression: SCN-026-CANARY-05B the Scope 1 through Scope 4 groups stay
  marker-bounded and green after the closed-loop append (broken: none)
```

### E11-3 — FR-026-031 is delivered, not merely asserted

The previous pass recorded the memory row's claims block as
`{ openCount, openedThisRun: null, resolvedThisRun: null }` — two hard `null`
placeholders — and FR-026-031 as having no implementation. Row 5.1 now carries
two assertions, and the second is the one that closes it:

```text
TP-026-5.1 every published claim is recorded with the observation that would
  resolve it, or the row declares no claims — never a claim with no resolving observation

TP-026-5.1 the memory row reads resolvedThisRun from buildScorecard and declares
  no second tally of its own
    pins scripts/brief-refresh.mjs to:  resolvedThisRun = scorecard.resolvedThisRun
    forbids a second local  satisfied + invalidated  tally
```

`openedThisRun` remains `null`, and that is a declared contract rather than an
omission: Tier A writes the memory row before Tier B composes, and the reason is
recorded in the assertion's own comment.

### E11-4 — The three runbook gaps are closed

The previous pass measured zero occurrences of the change-vocabulary kind names
and zero occurrences of `collapsed` and `disclosure`, and found §10a actively
contradicting the shipped wiring. Re-measured over `notes/market-brief.md`
(938 lines, 4 code fences, balanced):

```text
levelCrossed   2      collapsed     4
stateFlipped   2      disclosure    1
flagRaised     3
flagCleared    3      "manual CLI"  1 occurrence — and it is the CORRECTION
baseline       7

§5   Change-detection (the brief's memory)                 line 257
§9c  Disclosure — what the reader sees before scrolling    line 774
§10a The two attention surfaces, and why there are two     line 811
```

**Two of the three are committed; the third is not, and the difference is
recorded rather than glossed.** Measured against `HEAD`:

```text
git show HEAD:notes/market-brief.md | grep -c ...

                                                  HEAD   WORKTREE
levelCrossed                                        0        2     ← §5  UNCOMMITTED
"Precedence, so one instrument gets one kind"       0        1     ← §5  UNCOMMITTED
"9c. Disclosure"                                    1        1     ← §9c committed
"no-collapsed-negative"                             1        1     ← §9c committed
"no longer a manual CLI"                            1        1     ← §10a committed

git diff --numstat -- notes/market-brief.md   →   17      1
```

The pending 17-line diff was inspected line by line. It adds exactly the §5
change vocabulary, the precedence paragraph and the `baseline`-versus-`unchanged`
paragraph, and nothing else — unambiguously this feature's own Scope 3 content,
not the concurrent session's work that accounts for the other modified paths in
the tree. So §5 is delivered documentation awaiting a commit. The Scope 3 DoD
item's stated verification is "reading the added text and quoting it in
report.md", which the present text satisfies, so the item is checked with this
qualification stated on it; the outstanding commit is routed as **R-18** so the
delivery cannot be lost to a `git checkout`.

The three quotations the DoD items require are recorded inline on each item in
`scopes.md`. The one that reverses a stated contradiction is §10a:
`scripts/build-attention-scorecard.mjs` **"is no longer a manual CLI"**, which
matches the re-counted single invocation in each of the two publication-path
files.

One defect inside the delivered text is surfaced and routed rather than repaired,
because this pass's write boundary is `scopes.md` and `report.md` only: §9c's
summary sentence says "Fourteen blocks, six visible, eight collapsed" while its
own enumeration lists ten collapsed and the selftest pins the total at sixteen.
Routed as **R-16**.

### E11-5 — The published values, re-read directly

```text
market-brief.scorecard.json    windows.all:
  closed=330   notEvaluable=152   notEvaluableShare=0.4606   resolved=154
  policy.minResolvedSample=20

market-brief.config.json       scorecard-policy/v1.minResolvedSample=20

market-brief.attention-scorecard.json   overall:
  closedSample=0   minClosedSample=20   rate=null

grep -c 'build-attention-scorecard.mjs' .github/workflows/tier-a.yml        → 1
grep -c 'build-attention-scorecard.mjs' scripts/brief-refresh-and-push.sh   → 1
```

Two observations are recorded because they bear on checked items. First, the
minimum sample is one declared value carried through to the artifact: config 20,
published policy 20, no second constant standing between them. Second, the
`notEvaluableShare` DoD item names "152 of 304" and the observed figure is 152 of
**330** at 46.06 percent. The item asks that the observed value be recorded
against that pair, which is done here with the divergence named; the stale
denominator stays routed as **R-15** rather than being silently adopted.

### E11-6 — The one R-14 row that did NOT close

R-14 named seven absent rows plus a missing per-artifact privacy scan. The seven
rows are delivered. The privacy scan is not, and it is named here rather than
swept along with them. Scanned across the whole closed-loop group,
`scripts/selftest.mjs` lines 23206–23389:

```text
tokens scanned: position costBasis cost_basis pnl profit credential
                password secret apiKey  and currency-shaped values
matching lines in the Scope 5 group: 0

costBasis occurrences elsewhere in the file:
  line 21986  — Feature 026 Scope 2 group (cross-asset legs)
  line 22918  — Feature 026 Scope 3 group (change vocabulary)
```

Scopes 2 and 3 each carry this assertion for their own emitted artifacts; Scope 5
does not, and Scope 5 is the only scope that publishes a track record whose
`recentMisses` rows carry per-call price levels. `node scripts/pii-scan.mjs`
returning `findings=0` across 8,034 files is real and reassuring, but it is a
different instrument from the per-artifact field-name and currency-shape
assertion the DoD item names. Checking that box on the repository-wide scan would
swap weaker evidence for a stronger requirement, so the item stays unchecked.

### E11-7 — Final Definition of Done state

```text
scopes.md   1383 lines   32 code fences   parity even
            112 checked   8 unchecked   120 total

Scope 1   checked=26   unchecked=0
Scope 2   checked=25   unchecked=2
Scope 3   checked=21   unchecked=2
Scope 4   checked=23   unchecked=2
Scope 5   checked=17   unchecked=2
```

Checked in this pass — 11 items:

| Scope | Item | What closed it |
| --- | --- | --- |
| 3 | runbook §5 records the change vocabulary | §5 written; kind names 0 → 2/2/3/3. **Text is uncommitted — see R-18** |
| 4 | runbook records visible, collapsed and the no-collapsed-negative rule | §9c delivered; `collapsed` 0 → 4 |
| 5 | every Test Plan row above ran | all 15 rows now exist; suite `0 failed` |
| 5 | regression coverage rows 5.11–5.15 | 4 missing rows authored, both canaries present |
| 5 | `notEvaluableShare` published and derived | row 5.8 exists; observed value recorded against the named pair |
| 5 | one added builder invocation per publication file | row 5.14 exists; counts re-measured at 1 and 1 |
| 5 | attention rate withheld at `closedSample: 0` | row 5.12 exists, proving the gate load-bearing |
| 5 | minimum sample read from `scorecard-policy/v1` | row 5.13 exists; config 20 = published 20 |
| 5 | outcome records appended, none rewritten | row 5.9 exists, asserting the producer's merge shape |
| 5 | runbook §10a records the automated path | §10a delivered; contradiction repaired |
| 5 | FR-026-031 … 035 each name a passing row | rows 5.1 and 5.9 exist; 031's producer delivered |

Left unchecked — 8 items, each with the reason it still fails its own stated
verification:

| Scope | Item | Why it stays unchecked |
| --- | --- | --- |
| 2 | no file outside the Allowed file families table changed | `market-brief.config.page.json` is a derived projection the table does not name. **R-7** open; structural fact about a pushed commit |
| 2 | the appended selftest group removed zero pre-existing lines | observed `775 insertions(+), 3 deletions(-)`; the 3 are named and attributed to spec 024. **R-9** open; required count is 0 |
| 3 | no file outside the Allowed file families table changed | `brief-history.recent.jsonl` derived (**R-7**) plus 397 lines of foreign Feature 022 content (**R-10**) |
| 3 | the appended selftest group removed zero pre-existing lines | observed `861 insertions(+), 2 deletions(-)`; both named, both this feature's own. Required count is 0 |
| 4 | every rendered default-view value carries an in-place explanation | second clause needs a **pairing** count; `28 passed` is a test count, not a pairing count, and no count was emitted or enumerated |
| 4 | every authored string reaches the DOM through `esc`, no new sink | commit `6b00105c7` added 9 `innerHTML` lines (25 → 34). The guards prove no new *unescaped* sink, which is not what the item literally requires. **R-12** open |
| 5 | no file outside the Allowed file families table changed | `market-brief.scorecard.json` derived (**R-7**) and `tests/market-brief-cockpit.spec.mjs` assigned to scope 4 only |
| 5 | no artifact carries a position size, cost basis, profit or credential | the named selftest assertion does not exist; 0 matching lines in the Scope 5 group. **R-14** residual |

Six of the eight are Change Boundary or append-rule bookkeeping plus one
unrecorded measurement — conditions that are structural facts about pushed
commits or about plan wording, closable only by amending the plan or rewriting
history. The eighth is a genuine coverage gap. Not one box was checked to raise
the count.

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
