# Scope 4: Anomaly Seeds And Red-Alert Candidacy Under The Gate

## 04-anomaly-seed-and-alert-candidacy

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** closed-vocabulary, unchanged-thresholds, gated, two-honest-non-outcomes, no-alarmism
Depends On: Scope 1 — the finding contract and the adjudicator seam. Deliberately independent of scopes 2 and 3, which share no state with this destination.

**Primary Outcome:** A topic finding carrying owner evidence and a transmission
that maps to one of the certified channels becomes an anomaly seed through the
existing seed validator. Seeds are clustered and assembled through the existing
path and scored against the unchanged red-alert policy; a rejected candidate
carries a reason from the existing closed rejection vocabulary. Two non-outcomes
are recorded honestly rather than papered over: a finding whose transmission maps
to none of the certified channels produces no seed, and a seed with no frozen
evidence bundle stops at the seed stage and stays recorded. Alarmist language is
refused before any surface. Live publication is never attempted, and the
projection carries the existing publication gate unchanged.

## Requirement Coverage

- FR-020-026 — seed emission and candidate assembly are two distinct capabilities
  with two distinct preconditions, and no surface, record or copy presents them as
  equally available. Seed emission does not require a frozen evidence bundle.
- FR-020-027 — a topic-derived seed declares at least one transmission channel from
  the existing closed vocabulary; the vocabulary is not extended and no channel is
  approximated or stretched. A finding mapping to none produces no seed, the
  outcome is recorded by name, and its eligibility for the action list and the
  attention tier is unaffected.
- FR-020-028 — candidate assembly goes through the existing clustering and
  candidate-build path, which refuses without a frozen evidence bundle carrying
  claims. Such a seed stops at the seed stage, remains recorded, and the missing
  bundle is named; no bundle is substituted or synthesised.
- FR-020-029 — a topic-derived candidate is scored against the existing red-alert
  policy with its admission score, minimum severity, minimum independent origins
  and minimum owner evidence unchanged.
- FR-020-030 — a rejected candidate carries a reason from the existing closed
  rejection-reason vocabulary.
- FR-020-031 — no path introduced here sets the alert projection to published; the
  projection carries the existing dependency-pending publication state unchanged.
- FR-020-032 — text carrying a term from the forbidden alarmist vocabulary is
  refused before it reaches any published surface.
- FR-020-038 — no destination value is modified, and every guard carries an
  adversarial case that fails when the guard is removed (P23).

## Gherkin Scenarios

```gherkin
Scenario: SCN-020-014 A finding whose transmission maps to a certified channel enters the alert pipeline
  Given a topic finding carrying owner evidence and a transmission that maps to a certified channel
  When it is routed to the alert pipeline
  Then it is recorded as an anomaly seed under the seed contract
  And the seed names its transmission channel from the existing closed channel vocabulary
  And no frozen evidence bundle is required for the seed to be recorded

Scenario: SCN-020-015 The admission bar is applied unchanged
  Given topic-derived anomaly seeds
  When they are clustered and built into a candidate
  Then the candidate is scored against the existing red-alert policy
  And a candidate below the configured admission score is rejected with a reason from the existing rejection vocabulary
  And no threshold is lowered because the origin is a research topic

Scenario: SCN-020-016 The publication gate is respected
  Given a topic-derived candidate that would clear every evidence bar
  When the alert view is composed
  Then the projection reports the publication state as the existing dependency-pending gate
  And no path sets published to true
  And the reader is told the qualification is local and nothing went live

Scenario: SCN-020-017 The forbidden-term vocabulary is honoured
  Given a topic finding whose text contains a term in the forbidden alarmist vocabulary
  When it is routed to the alert pipeline
  Then it is refused with a named reason
  And no alarmist term reaches any published surface

Scenario: SCN-020-018 Nothing qualified this window
  Given no topic-derived candidate cleared the evidence bar this window
  When the alert view is composed
  Then the empty statement is the exact committed empty-state copy
  And no weak candidate is promoted to avoid an empty section

Scenario: SCN-020-024 An unmappable transmission is a named outcome, not a forced fit
  Given a topic finding whose transmission matches none of the certified channels
  When it is routed to the alert pipeline
  Then no anomaly seed is emitted for it
  And the outcome is recorded by name as a finding with no certified transmission channel
  And the closed channel vocabulary is not extended and no channel is approximated to admit it
  And its eligibility for the action list and the attention tier is unaffected

Scenario: SCN-020-025 Seeding and candidacy have different preconditions, stated honestly
  Given a topic-derived anomaly seed whose evidence did not come through the committed acquisition path
  When candidate assembly is attempted
  Then no candidate is assembled
  And the seed remains recorded rather than being discarded
  And the outcome is recorded by name as a missing frozen evidence bundle
  And the seed is not promoted to a candidate by substituting or synthesising a bundle
```

## Implementation Files

### New

- `tests/fixtures/research-routing/alert-certified-channel.json`
- `tests/fixtures/research-routing/alert-unmappable-transmission.json`
- `tests/fixtures/research-routing/alert-no-evidence-bundle.json`
- `tests/fixtures/research-routing/alert-below-admission-score.json`
- `tests/fixtures/research-routing/alert-alarmist-text.json`
- `tests/fixtures/research-routing/alert-empty-window.json`

### Modified

- `rlrouting.js` — the alert-decision branch, `RLROUTE-BUNDLE`,
  `RLROUTE-ALARMIST`, `RLROUTE-PUBLISHED`
- `rlmarketaction.js` — **only** an additive export of the already-frozen
  forbidden-term list, if reading proves it is module-internal and therefore
  unreachable for a pre-surface check. No threshold, no vocabulary member and no
  refusal is changed. If the list is reachable without an export, this file is not
  modified at all.
- `scripts/selftest.mjs` — one new assertion group
- `notes/research-routing.md` — the alert lane, the two non-outcomes and the gate

## Implementation Plan

1. Project a routable finding into an `anomaly-seed/v1` through the existing seed
   validator, which requires a seed id, an owner tool id, at least one evidence
   reference, an observed condition, at least one normalized entity, at least one
   transmission channel from the closed eight, and an ISO cutoff instant. All are
   available from a dossier finding.
2. Treat seed emission and candidate assembly as two capabilities with two
   preconditions, and say so in every record and every reader sentence. Seed
   emission requires no frozen evidence bundle; candidate assembly does. Presenting
   them as equally available is exactly what FR-020-026 forbids.
3. Record the first honest non-outcome. Two of the certified channels cover the
   Hormuz and the oil-and-fertilizer transmissions. An earnings-acceleration
   transmission is neither, and the vocabulary is closed and certified upstream, so
   the resolution is a named no-seed outcome rather than a ninth channel. The
   finding stays fully eligible for the action list and the attention tier — this
   is a classification limit, not a quality judgement.
4. Record the second honest non-outcome. Candidate assembly refuses without a
   frozen web-evidence bundle carrying claims, so a seed whose evidence never went
   through the committed acquisition path stops at the seed stage: no candidate is
   assembled, the seed remains recorded rather than discarded, `RLROUTE-BUNDLE` is
   recorded, and no bundle is substituted or synthesised to promote it.
5. Cluster and assemble through the existing path and score against the unchanged
   policy. No threshold, minimum or cap is read into this scope as a literal and
   none is written. A rejected candidate carries a reason from the existing closed
   rejection vocabulary and is represented **by counts against reason classes
   only**, never by its title — that is the composer's own rule, and it exists so
   the page cannot become a feed of dramatic rejected headlines.
6. Refuse `RLROUTE-ALARMIST` before any surface. Read the forbidden-term list from
   the owning module rather than restating it; if reading proves the frozen list is
   module-internal and unreachable, add an additive export of the existing frozen
   array and change nothing else in that file. A literal copy is not acceptable: it
   would diverge silently the first time the owning list changed, and the alert
   composer's own refusal would then disagree with the pre-check.
7. Refuse `RLROUTE-PUBLISHED` on any attempt to set the alert projection to
   published. The projection carries the existing publication-gate value unchanged.
   A qualifying candidate is **recorded** so it is not lost, and the surface says
   publication is unavailable every time.
8. Keep the machine gate slug out of reader prose. The publication-blocking leak
   classes make it publication-blocking, so it rides a `data-*` attribute exactly as
   the shipped red-alert copy already does, while the visible sentence says "not
   published" in plain words.
9. Use the exact committed empty statement, unchanged and character-for-character,
   when nothing qualified. No weak candidate is promoted to avoid an empty section.
10. Register a `research-routing — alert lane` group in `scripts/selftest.mjs`, and
    record the lane, the two non-outcomes and the gate in
    `notes/research-routing.md`.

## Named Missing Capabilities In This Scope

| Missing capability | Degraded behaviour, which is this scope's deliverable |
| --- | --- |
| **Live Red Alert publication** | Seeds and scored candidates are produced and recorded; the projection carries the existing gate unchanged; the surface states publication is unavailable every time; nothing is faked, simulated or locally overridden. SCN-020-016 is the scenario that proves it. |
| **A frozen web-evidence bundle for a finding** | Seeding is unaffected. Candidate assembly refuses, the seed stays recorded, and the missing bundle is named. SCN-020-025 is the scenario that proves it. |
| **A routable topic finding** | The lane is proven against committed fixtures shaped to the finding contract, so no scope work waits on a live dossier. |

None of these is expressed as another spec's status, and none of them blocks this
scope from completing.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `rlmarketaction.js` | At most one additive export of an already-frozen array | Everything alert-related | **Highest in this scope** — this module owns the publication gate, the policy thresholds, the channel vocabulary and the rejection classes; any change beyond an additive export is the failure condition the spec names first | Diff the file and assert exactly one added export line and zero changed values, BEFORE the pre-check is wired | Remove the export; the pre-check falls back to the composer's own refusal, which still fires |
| The red-alert policy values | Read through the existing scoring path; never written | Every candidate verdict | High — a lowered threshold is invisible in a passing test suite and permanent in the ledger | Assert every policy value is byte-identical after this scope, by value not by presence | They are never written |
| The closed channel vocabulary | Read; not extended | Seed validation, attention transmission | High — a ninth channel would let any finding be forced into the pipeline, which SCN-020-024 forbids in as many words | Assert the vocabulary has exactly its committed membership and an unknown channel is refused | It is never written |
| The alert projection's publication state | Carried unchanged | The reader | High — a published projection is a fabricated live alert | Assert no code path can set it, and that an attempt is refused by name | The refusal is removed with the branch; the module's own refusal still fires |
| `rlrouting.js` | One decision branch and three codes added | Scope 5 | Low | Assert the module still holds no destination threshold | Remove the branch |

## Change Boundary And Protected Paths

**Allowed:** `rlrouting.js` · `rlmarketaction.js` (additive export only, and only
if reading proves it is required) · `tests/fixtures/research-routing/*.json` ·
`scripts/selftest.mjs` · `notes/research-routing.md`.

**Excluded (must remain byte-identical in this scope):**
`rlattention.js` · `rlagenda.js` · `scripts/build-attention-items.mjs` ·
`scripts/recommendation-body.mjs` · `scripts/validate-brief-payload.mjs` ·
`scripts/brief-narrative-parallel.mjs` · `scripts/build-brief-page-artifacts.mjs` ·
`scripts/build-pages-site.mjs` · `scripts/web-evidence-acquire.mjs` ·
`scripts/evaluate-recommendations.mjs` · `scripts/brief-distributed-publish.mjs` ·
`market-brief.config.json` · `market-brief.page.json` ·
`market-brief.snapshot.json` · `market-brief.html` · `rlbrief.js` ·
`watchlist.json` · `tools.json` · `index.html` · `rlnav.js` ·
`site-exclusions.json`.

`market-brief.config.json` is excluded because it carries the committed red-alert
policy block; a diff there is by itself evidence a threshold moved.
`scripts/web-evidence-acquire.mjs` is excluded because synthesising a bundle to
promote a seed is precisely what SCN-020-025 forbids.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| --- | --- | --- |
| Owning module | `rlrouting.js` | The alert decision branch and the three codes. |
| Alert vocabulary reachability | `rlmarketaction.js` | At most one additive export of an already-frozen array, so the pre-check reads the owning list instead of a divergent copy. |
| Alert fixtures | `tests/fixtures/research-routing/*.json` | The findings, seeds and candidates the lane is proven against. |
| Project test harness | `scripts/selftest.mjs` | Where the deterministic group lives. |
| Notes | `notes/research-routing.md` | Where the lane, the two non-outcomes and the gate are recorded. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --- | --- | --- |
| Policy thresholds | `market-brief.config.json` | No threshold, score, minimum or cap moves in this feature |
| Evidence acquisition | `scripts/web-evidence-acquire.mjs` | Synthesising a bundle is forbidden by SCN-020-025 |
| Action destination | `scripts/recommendation-body.mjs`, `scripts/brief-narrative-parallel.mjs` | Scope 2 |
| Attention destination | `rlattention.js`, `scripts/build-attention-items.mjs` | Scope 3 |
| Ledger, scorecard and the refusal surface | `scripts/evaluate-recommendations.mjs`, `scripts/brief-distributed-publish.mjs`, `scripts/build-brief-page-artifacts.mjs`, `market-brief.html`, `rlbrief.js` | Scope 5 |

## Rollback

Remove the alert decision branch and the three codes from `rlrouting.js`; remove
the additive export from `rlmarketaction.js` if it was added; delete the six
fixtures; remove the appended selftest group. Prove the restore by running
`node scripts/selftest.mjs` and `node scripts/validate-market-action.mjs` and
recording exit 0 for both with unfiltered output.

## Scenario-First RED/GREEN Contract

RED: author the seven scenarios and the six fixtures first. Record the
unmappable-transmission fixture being forced into the nearest channel before the
no-seed outcome exists — the approximation FR-020-027 forbids. Record the
no-bundle fixture being promoted to a candidate with a synthesised bundle. Record
the below-score fixture publishing after a lowered threshold. Record the alarmist
fixture reaching a surface. Each of these is the failure that looks most like the
feature working.

GREEN: the certified-channel fixture becomes a seed naming its channel from the
closed vocabulary, with no bundle required; the unmappable fixture emits no seed,
records the named no-channel outcome, leaves the vocabulary at its committed
membership, and remains eligible for the other two destinations; the no-bundle
fixture stops at the seed stage with the seed still recorded; the below-score
fixture is rejected with a reason from the closed class list and every policy value
byte-identical; the alarmist fixture is refused before any surface; the empty
window carries the exact committed sentence; and no path sets the projection to
published.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-04-01 | Seed | unit | SCN-020-014 | `scripts/selftest.mjs` | a topic finding carrying owner evidence and a transmission that maps to a certified channel is recorded as an anomaly seed under the existing seed contract, and the seed names its transmission channel from the existing closed channel vocabulary | `node scripts/selftest.mjs` | No | `report.md#tp-04-01` |
| TP-04-02 | Seed | unit | SCN-020-014 | `scripts/selftest.mjs` | no frozen evidence bundle is required for the seed to be recorded: the same fixture with no bundle present still produces a seed, proving seed emission and candidate assembly are two distinct capabilities | `node scripts/selftest.mjs` | No | `report.md#tp-04-02` |
| TP-04-03 | Scoring | unit | SCN-020-015 | `scripts/selftest.mjs` | topic-derived seeds are clustered and built into a candidate through the existing path and the candidate is scored against the existing red-alert policy, with the score computed by the owning module rather than recomputed here | `node scripts/selftest.mjs` | No | `report.md#tp-04-03` |
| TP-04-04 | Rejection | unit | SCN-020-015 | `scripts/selftest.mjs` | a candidate below the configured admission score is rejected with a reason drawn from the existing closed rejection vocabulary, and rejected candidates are represented by counts against reason classes rather than by their titles | `node scripts/selftest.mjs` | No | `report.md#tp-04-04` |
| TP-04-05 | Adversarial | unit | SCN-020-015 | `scripts/selftest.mjs` | Regression: no threshold is lowered because the origin is a research topic — the admission score, minimum severity, minimum independent origins and minimum owner evidence are asserted byte-identical by value, and a mutated pass that lowers one is proven to admit a candidate that should have been rejected | `node scripts/selftest.mjs` | No | `report.md#tp-04-05` |
| TP-04-06 | Gate | unit | SCN-020-016 | `scripts/selftest.mjs` | a topic-derived candidate that would clear every evidence bar composes an alert view whose projection reports the publication state as the existing dependency-pending gate, unchanged | `node scripts/selftest.mjs` | No | `report.md#tp-04-06` |
| TP-04-07 | Adversarial | unit | SCN-020-016 | `scripts/selftest.mjs` | Regression: any path attempting to set published to true is refused `RLROUTE-PUBLISHED`, and removing that refusal is proven to let a fabricated live alert render — the gate guard can actually fail | `node scripts/selftest.mjs` | No | `report.md#tp-04-07` |
| TP-04-08 | Disclosure | unit | SCN-020-016 | `scripts/selftest.mjs` | the reader is told the qualification is local and nothing went live: the visible sentence carries the words in plain language while the machine gate slug rides a data attribute, and the publication-blocking leak classes stay clean | `node scripts/selftest.mjs` | No | `report.md#tp-04-08` |
| TP-04-09 | Alarmism | unit | SCN-020-017 | `scripts/selftest.mjs` | a topic finding whose text contains a term in the forbidden alarmist vocabulary is refused `RLROUTE-ALARMIST` with a named reason before it reaches any published surface, including inside a quoted thesis | `node scripts/selftest.mjs` | No | `report.md#tp-04-09` |
| TP-04-10 | Anchor | unit | SCN-020-017 | `scripts/selftest.mjs` | Regression: the forbidden-term list used by the pre-check is the owning module's own frozen array rather than a literal copy, so the pre-check and the composer's own refusal cannot disagree; if an additive export was required, the diff of that file shows exactly one added export line and zero changed values | `node scripts/selftest.mjs` | No | `report.md#tp-04-10` |
| TP-04-11 | Empty state | unit | SCN-020-018 | `scripts/selftest.mjs` | with no topic-derived candidate clearing the evidence bar this window, the empty statement is the exact committed empty-state copy character-for-character, and no weak candidate is promoted to avoid an empty section | `node scripts/selftest.mjs` | No | `report.md#tp-04-11` |
| TP-04-12 | No forced fit | unit | SCN-020-024 | `scripts/selftest.mjs` | a topic finding whose transmission matches none of the certified channels emits no anomaly seed, and the outcome is recorded by name as a finding with no certified transmission channel | `node scripts/selftest.mjs` | No | `report.md#tp-04-12` |
| TP-04-13 | Adversarial | unit | SCN-020-024 | `scripts/selftest.mjs` | Regression: the closed channel vocabulary is asserted at its exact committed membership and is not extended, an approximated or stretched channel is refused rather than admitted, and a mutated pass that maps the finding to the nearest channel is proven to admit it | `node scripts/selftest.mjs` | No | `report.md#tp-04-13` |
| TP-04-14 | Independence | unit | SCN-020-024 | `scripts/selftest.mjs` | a finding with no certified transmission channel has its eligibility for the action list and the attention tier unaffected — it still produces an action decision and an attention decision of its own | `node scripts/selftest.mjs` | No | `report.md#tp-04-14` |
| TP-04-15 | Two preconditions | unit | SCN-020-025 | `scripts/selftest.mjs` | a topic-derived seed whose evidence did not come through the committed acquisition path assembles no candidate, the seed remains recorded rather than discarded, and the outcome is recorded by name as a missing frozen evidence bundle | `node scripts/selftest.mjs` | No | `report.md#tp-04-15` |
| TP-04-16 | Adversarial | unit | SCN-020-025 | `scripts/selftest.mjs` | Regression: the seed is not promoted to a candidate by substituting or synthesising a bundle — a mutated pass that fabricates one is proven to produce a scored candidate that should not exist, and the acquisition script is byte-identical | `node scripts/selftest.mjs` | No | `report.md#tp-04-16` |
| TP-04-17 | Contract check | integration | SCN-020-015 | `scripts/validate-market-action.mjs` | the market-action validator exits 0 with topic-derived seeds and candidates present, and no policy value, channel member, rejection class or gate value differs from its committed form | `node scripts/validate-market-action.mjs` | No | `report.md#tp-04-17` |

### Definition of Done

- [ ] SCN-020-014 — a topic finding carrying owner evidence and a transmission that maps to a certified channel is recorded as an anomaly seed under the seed contract, the seed names its channel from the existing closed vocabulary, and no frozen evidence bundle is required for the seed to be recorded, proven by TP-04-01 and TP-04-02.
- [ ] SCN-020-015 — topic-derived seeds are clustered and built into a candidate that is scored against the existing red-alert policy, a candidate below the configured admission score is rejected with a reason from the existing rejection vocabulary, and no threshold is lowered because the origin is a research topic, proven by TP-04-03, TP-04-04 and TP-04-05.
- [ ] SCN-020-016 — the projection reports the publication state as the existing dependency-pending gate, no path sets published to true, and the reader is told the qualification is local and nothing went live, proven by TP-04-06, TP-04-07 and TP-04-08.
- [ ] SCN-020-017 — a topic finding whose text contains a forbidden alarmist term is refused with a named reason and no alarmist term reaches any published surface, proven by TP-04-09 and TP-04-10.
- [ ] SCN-020-018 — with nothing qualified this window the empty statement is the exact committed empty-state copy and no weak candidate is promoted to avoid an empty section, proven by TP-04-11.
- [ ] SCN-020-024 — a finding whose transmission matches none of the certified channels emits no seed, the outcome is recorded by name as a finding with no certified transmission channel, the closed vocabulary is not extended and no channel is approximated to admit it, and its eligibility for the action list and the attention tier is unaffected, proven by TP-04-12, TP-04-13 and TP-04-14.
- [ ] SCN-020-025 — a seed whose evidence did not come through the committed acquisition path assembles no candidate, remains recorded rather than discarded, has the missing frozen evidence bundle recorded by name, and is not promoted by substituting or synthesising a bundle, proven by TP-04-15 and TP-04-16.
- [ ] Seed emission and candidate assembly are presented as two capabilities with two preconditions in every record and every reader sentence (FR-020-026), proven by TP-04-02 and TP-04-15.
- [ ] Every red-alert policy value, channel-vocabulary member, rejection-reason class and gate value is byte-identical by value at the end of this scope (FR-020-029, FR-020-030, FR-020-038), proven by TP-04-05, TP-04-13 and TP-04-17.
- [ ] `rlmarketaction.js` shows at most one added export line and zero changed values; if no export was required, the file is byte-identical, proven by TP-04-10.
- [ ] `scripts/web-evidence-acquire.mjs` and `market-brief.config.json` are byte-identical; no bundle was synthesised and no threshold moved, proven by TP-04-16 and TP-04-17.
- [ ] Rejected candidates are represented by counts against reason classes only, never by their titles, proven by TP-04-04.
- [ ] `node scripts/selftest.mjs` exits 0 with the alert group registered and zero skipped assertions, evidenced by unfiltered output.
- [ ] `node scripts/validate-market-action.mjs` exits 0, proven by TP-04-17.
- [ ] `node scripts/validate-spec-test-paths.mjs` exits 0 with zero new missing paths.
- [ ] No path excluded from this scope was modified BY this scope; `git diff --name-only` output is recorded verbatim and names only files in the Allowed table.
- [ ] TP-04-01 executed with raw output recorded at `report.md#tp-04-01`.
- [ ] TP-04-02 executed with raw output recorded at `report.md#tp-04-02`.
- [ ] TP-04-03 executed with raw output recorded at `report.md#tp-04-03`.
- [ ] TP-04-04 executed with raw output recorded at `report.md#tp-04-04`.
- [ ] TP-04-05 executed with raw output recorded at `report.md#tp-04-05`.
- [ ] TP-04-06 executed with raw output recorded at `report.md#tp-04-06`.
- [ ] TP-04-07 executed with raw output recorded at `report.md#tp-04-07`.
- [ ] TP-04-08 executed with raw output recorded at `report.md#tp-04-08`.
- [ ] TP-04-09 executed with raw output recorded at `report.md#tp-04-09`.
- [ ] TP-04-10 executed with raw output recorded at `report.md#tp-04-10`.
- [ ] TP-04-11 executed with raw output recorded at `report.md#tp-04-11`.
- [ ] TP-04-12 executed with raw output recorded at `report.md#tp-04-12`.
- [ ] TP-04-13 executed with raw output recorded at `report.md#tp-04-13`.
- [ ] TP-04-14 executed with raw output recorded at `report.md#tp-04-14`.
- [ ] TP-04-15 executed with raw output recorded at `report.md#tp-04-15`.
- [ ] TP-04-16 executed with raw output recorded at `report.md#tp-04-16`.
- [ ] TP-04-17 executed with raw output recorded at `report.md#tp-04-17`.
