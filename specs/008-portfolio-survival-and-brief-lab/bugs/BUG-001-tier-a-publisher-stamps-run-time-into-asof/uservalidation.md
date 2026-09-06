# User Validation: BUG-001 Tier-A Publication Clocks

Automation readiness and human acceptance are separate facts. Checked automation items below
describe only the packet and evidence already attributed in `report.md`; they do not claim that
this packet-ownership turn re-ran the product tests, and this turn did not tick any further
readiness item.

Human acceptance has now been recorded. The Checklist is checked on the repository operator's
explicit authorization dated 2026-08-27, transcribed by automation — not on automation's own
judgement. Acceptance is not certification: top-level `status` and `certification.status` remain
`in_progress`, and gates other than G136 are still failing.

## Automation Readiness

- [x] `report.md` distinguishes fix-turn execution from artifact-turn inspection and explicitly
      leaves validate-owned certification unclaimed.
- [x] `scenario-manifest.json` maps all six scope scenarios to named persistent test declarations;
      no implementation or data file is used as a test proxy.
- [ ] Independent validate-owned certification has completed. It has not: top-level status and
      `certification.status` remain `in_progress`, and `certifiedAt` remains `null`.

## Checklist

- [x] Open `portfolio-survival-allocation-lab.html#brief` and confirm the public schedule still
      offers all four declared evidence windows.
- [x] Confirm the selected current window shows distinct evidence-cutoff, publication, and local
      composition times, with publication time reflecting `generatedAt` rather than `asOf`.
- [x] Present a publication dated later than its declared cutoff and confirm the page names
      `P008-BRIEF-EVIDENCE / generic-evidence-cutoff-conflict`, retains the schedule, and composes
      no lane item.
- [x] Confirm a missing publication `asOf` fails visibly rather than being replaced by a run
      wall-clock.

Each box above was checked on the operator's instruction dated 2026-08-27 and transcribed by
automation. Automation did not perform these four browser exercises and is not asserting them.

## Human Acceptance Record

The repository operator granted acceptance as a batch directive during the working session of
2026-08-27/28. The operator did not separately exercise the delivered behavior in a live session;
they authorized on the basis of the verification reported to them. That is exactly why the method
below is `external-record` rather than `human-interactive` — the accepting act happened in the
session, outside this file, and the operator's dated directive **is** the record. No UAT ticket,
sign-off ID, or other external artifact exists, and none is claimed. Automation readiness above
still does not substitute for it.

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-27
- method: external-record
- record: Operator directive in the 2026-08-27/28 working session, quoted verbatim — "authorized, approved, update all user validations as approved" and "Don't stop for user review, commit, continue, user approves all". Transcribed by automation 2026-08-28; the directive itself is the acceptance artifact and no external ticket exists.
- method: [human-interactive | external-record]