# Spec: BUG-017 — A Run In Which Every Test Passes Exits Zero

## Purpose

This specification states the behaviour a remedy must establish for local macOS runs of the
`system-chrome` browser project. It selects no remedy; the options and their consequences are
in `design.md`.

## Behaviour Under Specification

An exit code is a claim. When a runner reports ninety-four passes and exits 1, the claim and
the evidence disagree, and everything downstream that reads the exit code — a script, a hook,
a developer's habit — is reading a falsehood.

The defect is that disagreement. It is confined to one browser project on one platform, it
does not reach the pipeline, and it is intermittent. Intermittence is not a mitigation here;
it is the aggravating factor, because a failure that clears on rerun trains people to ignore
the signal rather than to investigate it.

## Requirements

### FR-017-001 — A run whose tests all pass exits zero

Under the `system-chrome` project on macOS, a run in which every test passes reports success.
Teardown of the browser is not a source of run-level failure.

### FR-017-002 — Browser workers are released when the run completes

Worker processes exit within the runner's teardown budget rather than being force-killed at
it. No browser process outlives the run that started it.

### FR-017-003 — Choice of browser channel does not change run-level outcome

Selecting the system Chrome channel rather than the bundled build changes which browser is
exercised. It does not change whether the runner can complete, and it does not change the
exit code for an identical, all-passing test set.

### FR-017-004 — Local verification cost is proportionate

The `system-chrome` project's wall time for a given test set is within a stated multiple of
the bundled project's. The currently measured ratio is roughly four to one on a clean run and
roughly eighteen to one on a stalled one. What multiple is acceptable is an owner decision
recorded against this requirement, not a number this specification fixes.

### FR-017-005 — If the defect cannot be removed, it is disclosed rather than endured

Where the cause lies outside this repository, the condition is documented where a developer
meets it, so an intermittent exit 1 on a green suite is recognised rather than rediscovered.
Disclosure is a fallback for an unremovable cause, never a substitute for a removable one.

## Acceptance Criteria

- A ninety-four-test set under `system-chrome` at six workers exits 0 on repeated
  consecutive runs, with raw output recorded for each.
- No `worker-N process did not exit within` error appears in any of those runs.
- Chrome process count returns to its pre-run level after the run completes.
- The wall-time ratio against the bundled project meets whatever bound the owner records
  under FR-017-004.
- `node scripts/selftest.mjs` reports zero failures and no fewer assertions than the recorded
  baseline.

## Explicitly Out Of Scope

- The red deploy gate. That is
  `specs/_bugs/BUG-016-combined-tax-panel-wiring-absent-on-origin-main`. It has a different,
  established cause and this defect does not reproduce in the pipeline.
- Any change to which project the pipeline runs. The pipeline is unaffected.
- Diagnosing Chromium's transport implementation, which is upstream of this repository.

## Grounding

Every factual claim in this specification is established by executed evidence in `report.md`,
produced in the filing session on the machine where the defect reproduces. Claims that were
**not** established are enumerated in `bug.md` under `## What Was Not Established` and are not
relied upon here.


## Domain Capability Model

### Single-Capability Justification

This packet delivers exactly one capability: **bound the concurrency of browser-backed
Playwright runs so the suite's exit code reports the tests rather than the teardown.**
It is a single capability rather than a foundation, and the distinction is not a
formality — it decides whether the right artefact here is a reusable seam or one line.

There is no second consumer to generalise for. The concurrency bound has exactly one
reader, Playwright's own runner, and exactly one place that runner looks:
`playwright.config.mjs`. A repository cannot own an abstraction over a value that a
third-party runner reads directly from its own config file; anything built above it
would be a wrapper this repository maintains and nothing calls.

Nor is there a second variant to hold. The natural candidates fail on inspection:
a per-project worker count is not expressible — Playwright resolves `workers` once for
the run, not per project — and a per-platform override would be a branch this repository
could never exercise, since the condition has been observed on exactly one platform, on
one machine, by one operator. Building either would create an untested path in the name
of symmetry, which is the cost this justification exists to refuse.

The proportionality trigger words that brought this gate into force appear in the
diagnostic prose — the packet discusses browser *channels*, *projects*, and candidate
*drivers* of the stall. Those are the vocabulary of the investigation, not of the
delivery. The delivery is one integer and a comment explaining it.
