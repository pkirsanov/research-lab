# Scope 08 — Journey Anchor, Recorded Assertion And Published Tool Read

**Status:** Not Started
**Depends On:** SCOPE-07
**Tags:** `overlay:true`
**Business scenarios owned:** BS-016-031, BS-016-034, BS-016-035

---

## Objective

Close the three host gaps that keep an asserted cell from surviving the session,
reaching the registry-derived brief, or being reachable through the two journeys
the registry already declares.

Three absences verified on disk this pass, each returning `0` from
`intraday-tape-lab.html`: `id="journey"`, `data-rljourney-mount`, `putToolRead`
and `toolReads`. `simple-models.json` line 113 declares
`deepLinkTargets.journey` as `intraday-tape-lab.html#journey`, and `tools.json`
line 225 registers `journey/intraday-tape-lab/session-classification/v1` and
`journey/intraday-tape-lab/level-plan/v1` — the latter titled "Define a level
trigger and invalidation". Two registered goals and one declared deep link are
unreachable purely because one anchor is missing.

These three belong together because they are one loop: an assertion is recorded
(W4), rendered as a recoverable row (P-18), reachable through the journey packet
whose registered outcome is to record a falsifiable plan, and published so a
brief consumer can read its status without opening the record.

---

## Implementation Files

Every path below is an authorized edit target in `design.md` §
Implementation Boundary. The nested `### Implementation Files` heading is the
exact anchor `implementation-reality-scan.sh` parses.

### Implementation Files

| Path | Boundary row | Nature of the edit in this scope |
|---|---|---|
| `intraday-tape-lab.html` | Host and sibling pages — extended, bounded, changes **(2) The missing Journey mount anchor**, **(3) The missing tool-read publication slot**, and the "one new `.pw` record panel" | Add one `<section id="journey" data-rljourney-mount>` inside the existing Power view; add the `RLDATA.putToolRead("intraday-tape-lab", read)` call site writing `tool-model-read/v1` on every render; add the W4 browser-local assertion store and the P-18 record panel |
| `tests/auction-gamma-playbook.spec.mjs` | Tests and documentation — NEW file created by this feature, created by SCOPE-01 | Extend with the Brief mounted section, the Journey shell at the new anchor, the record panel, and the four-view count |

`rldata.js` and `rlapp.js` are consumed through their existing signatures and are
never modified. `journeys.json` is consumed and never modified — the lens makes
both journeys reachable through the page anchor, not through a registry edit, so
the 48 definitions and 48 steps stay 48 and 48.

---

## Gherkin Scenarios

### BS-016-031: The playbook adds no fifth top-level view

```gherkin
Scenario: A user moves through the host tool's top-level views with the playbook present
  Given the host tool's top-level view contract is exactly Simple, Power, Brief and Journey
  When the user moves through those four views
  Then the playbook is expressed inside those existing views
  And no fifth top-level view, duplicate top-level toggle or parallel tool entry is presented
  And the playbook's expression in each view suits that view's purpose rather than repeating one view's content verbatim
```

### BS-016-034: An asserted expectation is recoverable and gradeable after the session

```gherkin
Scenario: A user returns after a completed session to grade what the playbook asserted
  Given one or more playbook cells were asserted during the session
  When the user recovers the record of those assertions
  Then each recovered assertion states what was expected, the evidence cutoff it was asserted against and its falsifier
  And the user can determine whether each falsifier triggered during the session
  And recording the outcome does not alter the original assertion or its falsifier
```

### BS-016-035: A regime-change invalidation is recorded distinctly from a falsified expectation

```gherkin
Scenario: The behavioural regime changes mid-session before an expectation's falsifier could trigger
  Given a playbook cell was asserted under a stated behavioural regime
  And the regime changed mid-session and invalidated the cell
  When the user grades that cell after the session
  Then the record shows the cell as invalidated by a regime change
  And that outcome is distinguishable from an expectation whose falsifier triggered
  And the record names the observation that indicated the regime had changed
```

---

## Implementation Plan

**1. Add the Journey mount anchor inside the existing Power view.**
One `<section id="journey" data-rljourney-mount>`, in the same shape the Brief
mount already has at lines 2180–2181. `RLAPP.mountJourney` (`rlapp.js` line 570)
discovers it through the `[data-rljourney-mount]` query at line 571 and currently
returns immediately on this page because that query is empty. The shell is
consumed as delivered; it becomes effective because the page gains the anchor, not
because the shell changes. A mounted section inside an existing view is not a
view, so the `data-m` segment at lines 1070–1071 keeps exactly two buttons and the
four-view count is unchanged.

**2. Add the W4 assertion store, append-only on grade.**
The store is a browser-local keyed map from `assertionFingerprint` to the C6
record. Writing on assert stores the complete record with `outcomes: []`. Writing
on grade appends to `outcomes` and touches no other field, so recording an outcome
cannot alter the original assertion or its falsifier. Reading recomputes the
fingerprint over `cell` and `cutoff`; a mismatch presents the record as
untrustworthy rather than accepting it. A ticker with no assertions yields an
empty list, never a placeholder record.

**3. Keep the two outcome kinds distinct.**
A falsifier-triggered outcome and a regime-change invalidation are separate
recorded values, not two labels on one field. The regime-change record names the
observation that indicated the regime had changed — the regime-level observation
SCOPE-03 places on the C3 record and SCOPE-05 carries onto the cell as P-13,
distinct from the expectation-level falsifier P-12. Because the two travelled
separately from the moment they were produced, grading them separately requires no
reconstruction.

**4. Render the recovered rows as the P-18 record panel.**
One new `.pw` panel inside Power, alongside the existing `.pw` panels. Each row
carries its own P-08 cutoff, P-12 falsifier and P-09 provenance tags so it stays
interrogable after the session. The same recovered rows are reachable from the
packet at the new Journey anchor, whose registered definition
`journey/intraday-tape-lab/level-plan/v1` carries
`packetPolicy.contractVersion: "journey-completion-packet/v1"` with
`humanSignoffRequired: true` and `noExecution: true`.

**5. Keep the record free of financial personal data.**
The record holds the cell, the cutoff and the graded outcome. It holds no position
size, no cost basis and no realized result, which is the workspace rule that the
committed surface carries tickers only.

**6. Publish the read through `RLDATA.putToolRead`.**
The page writes the `tool-model-read/v1` owner-read form validated by
`validateToolModelRead` at `rldata.js` line 378 — the only accepted shape able to
carry an evidence cutoff and evidence provenance. `role` and `profile` take the
values `tools.json` declares at lines 207–208, verified as `"source"` and
`"live-market"`. `adapter.adapterId` takes the registry's declared `readAdapter`,
`intraday-tape-owning-model-v1` at line 209, so the read's provenance matches its
declaration. The write happens on every render.

**7. Map status from the C4 arm so a reduced read is never published as fresh.**
`fused` publishes `fresh` with the C2 `declaredAsOf`. A `reduced` arm caused by
`snapshot-stale` publishes `stale` with that same cutoff. Any other `reduced`
cause publishes `unavailable`. `context-only` publishes `unavailable` with a
`null` cutoff. When no auction session has hydrated and the provider returns
`null`, the read publishes `not-run`. `evidenceCutoff` is never replaced by the
current time, so `RLDATA.freshness()` (line 465) projects a `null` freshness
rather than a fabricated recency. The `read` string names the absence cause on a
reduced arm, so a downstream reader cannot mistake it for a fused one without
opening the record.

**8. Let the Brief section render the published read unchanged.**
`RLAPP.mountBriefs` already renders at lines 2180–2181 with
`data-simple-target="rlbrief-simple"` and `data-power-target="rlbrief-power"`. It
has no read of this lens to render today because the page writes no `toolReads`
slot. The one-line `read` states the C4 arm in words a brief consumer renders
unchanged. `scripts/brief-refresh.mjs` already declares this tool in
`OWNER_EVIDENCE_DECLARATIONS` and its `buildToolCoverage` consumes any
browser-written tool read generically, so it is consumed and never modified.

**9. Keep each of the four surfaces purposeful.**
Simple carries the verdict and the lever, Power carries the basis and the record
panel, Brief carries the one-line published read, and Journey carries the packet.
No surface repeats another verbatim.

**Boundary held.** No fifth `data-m` button, no duplicate toggle, no parallel tool
entry. `tools.json`, `journeys.json`, `simple-models.json`, `rldata.js` and
`rlapp.js` are all consumed and none is modified by this scope.

---

## Test Plan

This scope's Implementation Files are `./intraday-tape-lab.html` and
`tests/auction-gamma-playbook.spec.mjs`. Every claim it makes is about what the
running page mounts, stores, recovers and publishes, so every row runs the
`system-chrome` spec against the real page. `scripts/selftest.mjs` is absent from
this scope's Implementation Files, so no row adds an assertion to it.

**Adversarial fixture rule for this scope.** Four claims here are satisfiable by
coincidence unless the fixture is built to break them. The four-view claim is
vacuous unless the button count is asserted directly, so the fixture counts the
`data-m` controls. The append-only claim is vacuous if the fixture grades a
record whose fields happen to be re-derived identically, so the fixture compares
the recorded expectation, cutoff and falsifier before and after the grade. The
fingerprint claim is vacuous against a matching record, so the fixture supplies a
stored record whose recomputed fingerprint no longer matches. The status-mapping
claim is vacuous if every fixture arm is `fused`, so the fixture supplies a
snapshot-stale reduced arm and a context-only arm and asserts neither publishes
as fresh.

| ID | Test Type | Category | File / Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|
| TP-08-01 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `journey shell mounts at the new anchor inside Power` | Asserted against the real page with no `page.route`, no `context.route` and no request interception of any kind: a `<section id="journey" data-rljourney-mount>` exists inside the existing Power view and the shared shell mounts at it, so the Journey view is reachable rather than nominal | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-02 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `both registered journeys are reachable through the mounted anchor` | Asserted against the real page: the declared deep-link target `intraday-tape-lab.html#journey` resolves to that anchor, and both registered journey definitions are reachable through the mounted packet without any registry edit | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-03 | E2E UI — live stack — adversarial | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `top-level view contract stays exactly four` | Adversarial assertion against the real page: the `data-m` segment carries exactly two buttons and the mounted section introduces no fifth top-level view, no duplicate top-level toggle and no parallel tool entry, so adding a fifth control fails the count | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-04 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `each of the four surfaces expresses the record distinctly` | Asserted against the real page: Simple carries the verdict and lever, Power the basis and the record panel, Brief the one-line published read and Journey the packet, and no surface repeats another verbatim | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-05 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `asserting a cell writes a complete record and renders the record panel` | Asserted against the real page: asserting a cell stores the complete record with an empty outcome list, and the new `.pw` record panel renders the recovered rows inside Power alongside the existing `.pw` panels | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-06 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `recovered row states expectation, cutoff and falsifier` | Asserted against the real page: each recovered row states what was expected, the evidence cutoff it was asserted against and its falsifier, and carries its own provenance tags, so the user can determine whether that falsifier triggered without re-deriving the model | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-07 | E2E UI — live stack — adversarial | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `grading appends and alters no recorded field` | Adversarial assertion against the real page: the recorded expectation, cutoff and falsifier are captured before the grade and compared after it. Grading appends to the outcome list and touches nothing else, so an implementation that rewrote the assertion in place fails | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-08 | E2E UI — live stack — adversarial | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `a fingerprint mismatch presents the record as untrustworthy` | Adversarial fixture against the real page: a stored record whose fingerprint recomputed over cell and cutoff no longer matches presents as untrustworthy rather than being accepted and rendered as a valid assertion | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-09 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `a ticker with no assertions renders an empty record list` | Asserted against the real page: a ticker with no stored assertions yields an empty list and renders no placeholder record | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-10 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `recovered rows are reachable from the journey packet` | Asserted against the real page: the same recovered rows are reachable from the packet at the Journey anchor, whose registered definition carries human sign-off required and no execution, so the record is gradeable through the journey the registry already declares | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-11 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `falsifier-triggered and regime-change outcomes are separate values` | Asserted against the real page: a falsifier-triggered outcome and a regime-change invalidation are stored as separate recorded values rather than two labels on one field, and render distinguishably in the record panel | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-12 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `a regime-change invalidation names the observation that indicated it` | Asserted against the real page: the regime-change record names the observation that indicated the regime had changed, taken from the regime-level watch item rather than reconstructed from the expectation-level falsifier | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-13 | E2E UI — live stack | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `the page publishes a valid tool read on every render` | Asserted against the real page: a `tool-model-read/v1` read is written on every render whose `role`, `profile` and `adapter.adapterId` match the values the registry declares, and which passes the shared validator | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-14 | E2E UI — live stack — adversarial | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `a reduced read is never published as fresh` | Adversarial fixture against the real page supplying a snapshot-stale reduced arm and a context-only arm: a `fused` arm publishes fresh against the declared as-of, a snapshot-stale reduced arm publishes stale against that same cutoff, every other reduced cause and the context-only arm publish unavailable, and a `null` provider publishes not-run | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-15 | E2E UI — live stack — adversarial | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `the published cutoff is never replaced by the current time` | Adversarial assertion against the real page: the published evidence cutoff is never re-stamped with the run time, so freshness projects a `null` rather than a fabricated recency; the published one-line read names the absence cause on a reduced arm; and the Brief mounted section renders that read unchanged in both its Simple and Power targets | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-16 | Regression E2E | `e2e-ui` | `tests/auction-gamma-playbook.spec.mjs` test `Regression: BS-016-031 BS-016-034 BS-016-035 journey anchor mounts, grading appends only, and no reduced read publishes as fresh` | The persistent regression case for the three host behaviours this scope changes, asserted on the real page with no `page.route`, no `context.route` and no request interception of any kind: the `<section id="journey" data-rljourney-mount>` anchor is present and the shared shell mounts at it; the recorded expectation, cutoff and falsifier are captured before a grade and are identical after it; and a snapshot-stale reduced arm publishes stale against the declared as-of while a context-only arm publishes unavailable. `grep -c 'id="journey"'`, `grep -c 'data-rljourney-mount'`, `grep -c 'putToolRead'` and `grep -c 'toolReads'` each return `0` from `intraday-tape-lab.html` today, so this case fails if the anchor that `rlapp.js` line 571 queries regresses to those zero occurrences, if grading rewrites the assertion in place, or if the publication slot regresses to absent or re-stamps a reduced arm as fresh | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-08-17 | Stress | `stress` | `tests/auction-gamma-playbook.spec.mjs` test `Stress: the full asserted-cell set publishes and recovers inside the declared per-recompute budget` | The record store is driven at the maximum distinct load the published universe admits — all six behavioural cells of BS-016-001 through BS-016-006 asserted for each of the 22 tickers `data/options/index.json` declares (`expected: 22`, `count: 22`), 132 records — and the render loop is then exercised against the real page. Every render publishes the `tool-model-read/v1` read and recovers the record panel inside the 250 ms `performancePolicy.maxComputeMs` this page's owner seam declares at `simple-models.json` line 111, which is the host model's declared per-recompute budget NFR-016-002 binds the fusion to; the panel recovers exactly 132 rows with no dropped and no duplicated fingerprint; grading under that full load still appends only, leaving the recorded expectation, cutoff and falsifier identical; and every read published across those renders still passes `validateToolModelRead` at `rldata.js` line 378 with no reduced arm published as fresh | `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

---

### Definition of Done

- [ ] `[TP-08-01]` `[BS-016-031]` A `<section id="journey" data-rljourney-mount>` exists inside the existing Power view and the shared shell mounts at it, so the Journey view is reachable rather than nominal.
- [ ] `[TP-08-02]` `[BS-016-031]` The declared deep-link target resolves to that anchor and both registered journey definitions are reachable through the mounted packet, with no registry edit.
- [ ] `[TP-08-03]` `[BS-016-031]` The `data-m` segment carries exactly two buttons and the mounted section introduces no fifth top-level view, no duplicate top-level toggle and no parallel tool entry.
- [ ] `[TP-08-04]` `[BS-016-031]` A user moves through the host tool's top-level views with the playbook present: the playbook is expressed inside the existing Simple, Power, Brief and Journey views — Simple carrying the verdict and lever, Power the basis and record panel, Brief the one-line published read and Journey the packet — and each view's expression suits that view's purpose rather than repeating another view's content verbatim.
- [ ] `[TP-08-05]` `[BS-016-034]` Asserting a cell stores the complete record with an empty outcome list, and the new `.pw` record panel renders the recovered rows inside Power alongside the existing `.pw` panels.
- [ ] `[TP-08-06]` `[BS-016-034]` A user returns after a completed session to grade what the playbook asserted: each recovered assertion states what was expected, the evidence cutoff it was asserted against and its falsifier, and carries its own provenance tags, so the user can determine whether that falsifier triggered during the session without re-deriving the model.
- [ ] `[TP-08-07]` `[BS-016-034]` Grading appends to the outcome list and touches no other field: the recorded expectation, cutoff and falsifier are identical before and after the grade.
- [ ] `[TP-08-08]` `[BS-016-034]` A stored record whose recomputed fingerprint over cell and cutoff no longer matches presents as untrustworthy rather than being accepted as a valid assertion.
- [ ] `[TP-08-09]` `[BS-016-034]` A ticker with no stored assertions yields an empty record list and renders no placeholder record.
- [ ] `[TP-08-10]` `[BS-016-034]` The recovered rows are reachable from the packet at the Journey anchor, whose registered definition carries human sign-off required and no execution.
- [ ] `[TP-08-11]` `[BS-016-035]` The behavioural regime changes mid-session before an expectation's falsifier could trigger: the record shows the cell as invalidated by a regime change, stored as a separate recorded value from a falsifier-triggered outcome rather than as two labels on one field, and the two render distinguishably in the record panel.
- [ ] `[TP-08-12]` `[BS-016-035]` A regime-change invalidation names the observation that indicated the regime had changed, taken from the regime-level watch item rather than from the expectation-level falsifier.
- [ ] `[TP-08-13]` `[BS-016-031]` A `tool-model-read/v1` read is written on every render whose role, profile and adapter id match the registry's declared values and which passes the shared validator.
- [ ] `[TP-08-14]` `[BS-016-031]` A fused arm publishes fresh against the declared as-of, a snapshot-stale reduced arm publishes stale against that same cutoff, every other reduced cause and the context-only arm publish unavailable, and a null provider publishes not-run.
- [ ] `[TP-08-15]` `[BS-016-031]` The published evidence cutoff is never replaced by the current time so freshness projects a null, the published read names the absence cause on a reduced arm, and the Brief mounted section renders that read unchanged in both its targets.
- [ ] `[TP-08-17]` `[BS-016-034]` With all six behavioural cells asserted for each of the 22 published tickers — 132 records — every render publishes the read and recovers the record panel inside the 250 ms per-recompute budget declared at `simple-models.json` line 111, the panel recovers exactly 132 rows with no dropped and no duplicated fingerprint, grading still appends only, and every published read passes the shared validator with no reduced arm published as fresh.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope are persistent and named — `[TP-08-16]` `tests/auction-gamma-playbook.spec.mjs` carries `Regression: BS-016-031 BS-016-034 BS-016-035 journey anchor mounts, grading appends only, and no reduced read publishes as fresh`, which asserts the mounted Journey anchor, the byte-identical expectation, cutoff and falsifier across a grade, and the stale-and-unavailable status mapping against the real page, and fails if the `data-rljourney-mount` anchor that `rlapp.js` line 571 queries regresses to the zero occurrences it has today, if grading rewrites the assertion in place, or if the `putToolRead` publication slot regresses to absent or re-stamps a reduced arm as fresh.
- [ ] Broader E2E regression suite passes — the complete `node scripts/selftest.mjs` suite and the real-page Playwright regression spec that already drives this page, `tests/simple-model-adapters-market.spec.mjs` case `Regression: intraday tape Simple auction controls recompute from truthful snapshot evidence`, both run green once this scope lands, with every pre-existing selftest group and every previously registered regression case preserved and no decreased passing count.

### Build Quality Gate

- [ ] `npx --no-install playwright test tests/auction-gamma-playbook.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` completes with zero failures and no skipped required test.
- [ ] `node scripts/selftest.mjs` completes with zero failing assertions and zero warnings.
- [ ] `node scripts/validate-tool-experience.mjs` completes clean; no registry count moves, because this scope registers nothing.
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh specs/016-auction-gamma-playbook` exits 0.
- [ ] The stored record holds the cell, the cutoff and the graded outcome only: no position size, no cost basis and no realized result is written on any path.
- [ ] Only the paths in this scope's Implementation Files table were modified: `tools.json`, `journeys.json`, `simple-models.json`, `rldata.js` and `rlapp.js` were consumed and none was modified, and the 23-entry, 48-definition and 48-step counts are unchanged.
