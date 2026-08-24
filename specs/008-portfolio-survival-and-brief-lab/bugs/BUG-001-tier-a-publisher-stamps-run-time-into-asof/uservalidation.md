# User Validation: BUG-001 Tier-A Publication Clocks

Automation readiness and human acceptance are separate facts. Checked automation items below
describe only the packet and evidence already attributed in `report.md`; they do not claim that
this packet-ownership turn re-ran the product tests. Human acceptance remains entirely unchecked,
and only a human may complete the acceptance record.

## Automation Readiness

- [x] `report.md` distinguishes fix-turn execution from artifact-turn inspection and explicitly
      leaves validate-owned certification unclaimed.
- [x] `scenario-manifest.json` maps all six scope scenarios to named persistent test declarations;
      no implementation or data file is used as a test proxy.
- [ ] Independent validate-owned certification has completed. It has not: top-level status and
      `certification.status` remain `in_progress`, and `certifiedAt` remains `null`.

## Checklist

- [ ] Open `portfolio-survival-allocation-lab.html#brief` and confirm the public schedule still
      offers all four declared evidence windows.
- [ ] Confirm the selected current window shows distinct evidence-cutoff, publication, and local
      composition times, with publication time reflecting `generatedAt` rather than `asOf`.
- [ ] Present a publication dated later than its declared cutoff and confirm the page names
      `P008-BRIEF-EVIDENCE / generic-evidence-cutoff-conflict`, retains the schedule, and composes
      no lane item.
- [ ] Confirm a missing publication `asOf` fails visibly rather than being replaced by a run
      wall-clock.

## Human Acceptance Record

Acceptance has not occurred. Automation readiness above does not substitute for a human exercise
of the delivered behavior.

- acceptedBy: [human name or handle - never an agent id]
- acceptedAt: [YYYY-MM-DDTHH:MM:SSZ]
- method: [human-interactive | external-record]