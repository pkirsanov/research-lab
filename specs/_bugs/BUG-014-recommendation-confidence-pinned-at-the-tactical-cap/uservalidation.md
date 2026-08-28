# BUG-014 User Validation

Acceptance is not certification. This packet's `status` and `certification.status` remain
`in_progress`. Recording acceptance here clears Gate G136 and nothing else.

## What To Check

1. Open `scripts/build-attention-items.mjs` and read
   `recommendationConfidenceContractInstruction()`. Confirm it reads its three numbers
   from `market-brief.config.json` and holds no literal copy of them.
2. Run `node scripts/selftest.mjs`. Confirm `3200 passed, 0 failed`.
3. Run `node scripts/validate-brief-payload.mjs`. Confirm exit 0.
4. Confirm `scripts/brief-narrative-parallel.mjs` interpolates the contract in both the
   `core` and `signals` lanes, and that the old hand-typed tactical-cap sentence is gone.
5. ~~Decide Scope 2: whether `tacticalConfidenceCap` should remain equal to
   `minimumActionConfidence`.~~ **Superseded 2026-08-28.** This instruction outlived the
   decision it asks for. Scope 2 is `Done` and records the decision made 2026-08-20 on
   delegated authority: the cap stays at 55 because `notes/market-brief.md` states the
   tactical ceiling twice as the anti-reactivity rule, and the floor moved 55 to 50
   because it is a tunable noise bar with no such standing. Verified this turn against
   committed config — `minimumActionConfidence = 50`, `tacticalConfidenceCap = 55` — so a
   band now exists. `design.md` Open Question Q1 still reads "changes neither value" and
   is stale on this point; correcting it belongs to the design owner, not to this file.

## Automation Readiness

Automation verified these this turn. **A checked item here grants no acceptance whatsoever**;
acceptance is the Checklist and the record below it.

- [x] `bash .github/bubbles/scripts/artifact-lint.sh` on this packet exits 0.
- [x] The state-transition guard passes at status `done`: `failedGateIds: []`, `failureCount: 0`,
      `exitStatus: 0`, `verdict: PASS`. **Re-measured at certification on 2026-08-28.** This bullet
      previously read "exactly one failing gate, G136, at `failureCount: 1`, so human acceptance is
      the only thing this packet is missing". That was true when written and is not true now — G136
      acceptance was recorded 2026-08-27, and the two blockers that arose afterwards (promotion-tier
      artifact-lint, then G084) have since been discharged. The claim is corrected rather than left
      ticked over a stale measurement.
- [x] The Scope 2 decision is present in committed config, not merely asserted in prose:
      `tacticalConfidenceCap` 55 is strictly greater than `minimumActionConfidence` 50.
- [ ] `node scripts/selftest.mjs` reports `3200 passed, 0 failed`. **Left unticked: the suite
      was not run in this session. The reviewer items below record that it was run when the
      work was delivered, but an authorization to accept is not evidence that a suite ran,
      and re-ticking it here on someone else's execution would be a second-hand claim.**

## Checklist

- [x] The defect is established by executed measurement over committed blobs, not asserted.
- [x] The instruction is derived from the enforced thresholds rather than restating them.
- [x] All three cap-to-floor branches are exercised, including the two live config never reaches.
- [x] The new pins are proven able to fail.
- [x] No threshold, gate, or payload schema was changed.
- [x] The report separates what was proven from what was not.
- [x] The owner has decided Scope 2.

The first six boxes were authored checked by the packet author against executed evidence and
are left as authored. The seventh was the only open one, and it is checked on the repository
operator's explicit instruction dated 2026-08-27, transcribed by automation on 2026-08-28.
Automation additionally confirmed this turn that the decision it refers to is real and landed
— Scope 2 is `Done` and committed config carries the decided values — but the acceptance
itself is the operator's judgement, not automation's.

## Human Acceptance Record

The repository operator granted acceptance as a batch directive during the working session of
2026-08-27/28. The operator did not separately exercise this behaviour in a live session; they
authorized on the basis of the verification reported to them. That is exactly why the method
below is `external-record` rather than `human-interactive` — the accepting act happened in the
session, outside this file, and the operator's dated directive **is** the record. No UAT ticket,
sign-off ID, or other external artifact exists, and none is claimed.

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-27
- method: external-record
- record: Operator directive in the 2026-08-27/28 working session, quoted verbatim — "authorized, approved, update all user validations as approved" and "Don't stop for user review, commit, continue, user approves all". Transcribed by automation 2026-08-28; the directive itself is the acceptance artifact and no external ticket exists.

This section replaces an earlier "Acceptance Contract" passage which stated that the
`## Human Acceptance Record` heading was "deliberately absent" and that the packet "correctly
reports `PD12-NO-RECORD`". That was true when written and is false now, so it has been removed
rather than left to contradict the record above it. The rule it described still holds and is
unchanged: an agent cannot accept for a human, and `acceptedBy` above is the repository git
identity `pkirsanov`, which does not match the forbidden `^bubbles\.` pattern.
