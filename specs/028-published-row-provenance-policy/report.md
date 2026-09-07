# Report — Published Row Provenance Policy

## Summary

**Status: Scope 1 partially done. The measurement half is complete and evidence-backed. The
owner-decision half is NOT done, and this packet is not `done`.**

This round executed the objective, non-decision part of Scope 1 — measuring how often a published
bars row actually changes value on replay — and wrote the result into `design.md`. It deliberately
stopped short of recording an owner decision (SCN-028-02), because that decision is explicitly
reserved for the owner by this packet's own `spec.md` ("No implementation should be attempted before
the policy question above is answered by the owner") and by `uservalidation.md`'s existing
acceptance record, which names the decision as out of scope for the standing operator directive that
authorized filing this packet. An implementing agent choosing the policy would settle it by proxy,
which is the exact failure mode `spec.md` names as the reason this is a spec rather than a bug.

## Provenance Of The Original Filing (2026-08-29, preserved from the prior report)

BUG-012's report recorded the condition under the heading *"Still open, and recorded as out of scope
rather than done"*. Under Gate G095 that phrasing is not a disposition — an issue an agent observes
must be filed, not narrated — so this packet was created to hold it. The framing is BUG-012's own and
is preserved rather than re-argued: the overwrite is a separate decision from the defect BUG-012
fixed, and settling it inside a bug packet would have been scope creep laundered as a fix.

## What Was Done This Round (2026-09-06)

1. **Wrote `scripts/measure-provenance-exposure.mjs`** — a new, read-only script (the only allowed
   new-file family in Scope 1's Change Boundary). It re-fetches the same Yahoo daily payload
   `fetch-bars.mjs` fetches, applies the identical Option-B basis rule, and for every timestamp
   already committed under `data/bars/<SYMBOL>.json` compares the committed value against the
   freshly-fetched one. It classifies each change using `isCoherentBar` (imported from
   `scripts/validate-bars-coherence.mjs`, unmodified) into `legacyBasisChanges` (committed row
   already incoherent — consistent with pre-BUG-012 arithmetic) versus `restatedValueChanges`
   (committed row was coherent and still changed — genuine residual exposure). It hashes the full
   `data/bars/` corpus (SHA-256 over every symbol file's bytes) before and after the run and fails
   the process if the hash differs, so non-mutation is asserted, not merely intended. It touches no
   file under `data/bars/`, no ingestion write path file, and no `validate-bars-coherence.mjs` logic.

2. **Ran it against the full committed corpus** — 292 symbol files, 150,127 published rows — and
   recorded the result in `design.md` § "Measured Exposure (Scope 1, TP-028-01)".

3. **Ran `node scripts/selftest.mjs`** to confirm no regression from adding the new file.

4. **Updated `scopes.md`'s Definition of Done** to reflect exactly what is and is not done, per item.

## What Has NOT Been Done

- No owner decision has been made. `design.md` now records a measured exposure AND a non-binding
  recommendation, but not a recorded decision — the four option sketches remain unchosen by the
  owner.
- No mechanism has been implemented, and none should be before the owner decision is recorded.

## Test Evidence

**TP-028-01** (unit: the replay counts changed timestamps without mutating the corpus)
**Claim Source: executed.**
Command: `node scripts/measure-provenance-exposure.mjs` (full corpus) and
`node scripts/measure-provenance-exposure.mjs --symbols=AAPL,COP,MSFT` (spot check), both run
2026-09-06. Full-corpus result: `symbolsMeasured: 292`, `publishedRowsChecked: 150127`,
`legacyBasisChanges: 0`, `restatedValueChanges: 258`, `unreplayableRows: 8085`, `fetchErrors: 0`,
`nonMutating: true`, exit code 0. See `scripts/measure-provenance-exposure.mjs:150-176` for the
classification logic and `scripts/measure-provenance-exposure.mjs:56-63` for the corpus-hash
non-mutation check. Full numbers are recorded durably in `design.md` § "Measured Exposure".

**TP-028-REG1** (Regression E2E: the replay is non-mutating, proven by a corpus hash compared before
and after)
**Claim Source: executed.**
The script performs this comparison on every run (`corpusHash()` called at
`scripts/measure-provenance-exposure.mjs:174` and again at `:180`) and asserts on it
(`scripts/measure-provenance-exposure.mjs:213-216`), exiting 1 if the corpus mutated. Both the
full-corpus run and the 3-symbol spot check reported `nonMutating: true` with identical
before/after SHA-256 hashes. Independently verified outside the script: `shasum data/bars/AAPL.json`
taken immediately before and after the 3-symbol run — the file's own hash was unchanged
(`730519d3bde1925093c3d99addf2d5589550b33c` both times).

**TP-028-REG2** (Regression E2E: broader suite — `node scripts/selftest.mjs` passes)
**Claim Source: executed, with a pre-existing caveat.**
Run 2026-09-06: `3497 passed, 2 failed`, exit code 0. Verified by stashing this round's changes
(`git stash -u`) and re-running on unmodified `main` (commit `ad50a5c84`): identical
`3497 passed, 2 failed`. The 2 failures are about the marketing-cockpit scorecard byte budget and a
BUG-016/BUG-017 acceptance-baseline entry — both pre-existing on `main` before this round touched
anything, and neither is in a file family this scope is allowed to change. This round introduces no
new selftest failure and fixes none of the pre-existing two; "0 failed" in the Build Quality Gate
line below is not claimed.

## Definition of Done — actual status

- [x] SCN-028-01 (exposure measured, arithmetic-caused vs. vendor-restated distinguished) — done,
  evidence above.
- [ ] SCN-028-02 (owner decision recorded in `design.md` with date/reasoning/rejected alternatives)
  — **not done.** `design.md` records a recommendation for the owner, explicitly marked as
  non-binding. Recording an actual decision requires the human owner; see rationale in `design.md`
  § "Owner Decision — NOT YET RECORDED".
- [x] Scenario-specific E2E regression tests exist and pass for the one new behavior (the
  measurement script) — TP-028-01, TP-028-REG1 above.
- [x] Broader E2E regression suite passes, with the 2 pre-existing unrelated failures disclosed
  rather than hidden.
- [x] Change Boundary respected — the only files touched are `scripts/measure-provenance-exposure.mjs`
  (new, read-only, the allowed new-file family) and this packet's own `design.md` / `scopes.md` /
  `report.md` / `state.json`. `data/bars/*.json`, the ingestion write path
  (`scripts/fetch-bars.mjs`), and `validate-bars-coherence.mjs` are unmodified — verified by
  `git status --short` showing exactly those files.
- [ ] Build Quality Gate (artifact lint clean, selftest 0 failed, pii-scan 0 findings) — selftest is
  not 0-failed (2 pre-existing, unrelated); pii-scan and artifact lint were not run this round since
  the added file is a Node script with no artifact/PII surface, but the gate as literally stated is
  not satisfied and is left unchecked rather than rounded up.

## Completion Statement

**Scope 1 is not `done`, and neither is this spec.** The measurement TP-028-01 required is real,
executed, and non-fabricated. The owner decision SCN-028-02 requires is not recorded, and should not
be recorded by an implementing agent — this packet exists specifically to prevent the policy being
settled by whoever happens to hold the pen. `certification.certifiedCompletedPhases` remains empty
and `scopeProgress` for `01-measure-exposure-and-record-decision` is set to `blocked`, not `done`.

**What unblocks this scope:** the owner reads `design.md` § "Measured Exposure" and § "Owner
Decision", picks one of the four option sketches (or another), and records the selection, date, and
reasoning — including why each rejected alternative was rejected — in `design.md`. Given the
measured shape of the exposure (volume-only, newest-session-only, zero legacy-basis changes), the
decision is now cheap to make well-informed, but it is still a decision only the owner can make.
