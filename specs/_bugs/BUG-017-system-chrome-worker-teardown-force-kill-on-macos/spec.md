# Spec: BUG-017 — A Run In Which Every Test Passes Exits Zero

## Purpose

This specification states the behaviour a remedy must establish for local macOS runs of the
`system-chrome` browser project. It selects no remedy. `design.md` records the options and
their consequences.

### Single-Capability Justification

**Classification:** Existing-capability extension with one concrete runner configuration.

This packet extends the existing Playwright runner policy. `playwright.config.mjs` now pins
`workers: 1`, and `.specify/memory/agents.md` records the same rollback-gated fallback.
`playwright.config.mjs` already contains the `system-chrome` and `chromium` projects. The packet
adds neither project and introduces no runner abstraction or extension point.

The remedy bounds exposure for one existing system-Chrome teardown path. It does not create a
second worker policy, browser provider, or reusable lifecycle contract. The matching design
classification is `### Single-Implementation Justification`, not a foundation and overlay split
with invented variation axes.

## Behaviour Under Specification

An exit code is a claim. A runner can report ninety-four passes and still exit 1. That
disagreement makes the exit code false. Every downstream caller then receives that falsehood.

The defect is that disagreement. It is confined to one browser project on one platform. It
does not reach the pipeline, and it is intermittent. Intermittence aggravates the defect. A
failure that clears on rerun trains people to ignore the signal rather than investigate it.

## Current Evidence Boundary

The original six-worker reproductions remain historical characterisation. They do not define
the current trigger or prove that the two-worker setting closes the defect.

At revision `d532faaac`, the exact 94-test BUG-022 C03 workload failed on two consecutive
two-worker runs after every test passed. Each run ended at the runner's force-kill boundary.
The same workload passed on two consecutive one-worker runs. These four runs define a current
sample, not a long-run rate or proof that one worker removes the cause.

Focused isolation found the Foundation worker retaining two anonymous `Socket` handles after
Chrome exited. That observation narrows the failing lifecycle boundary. It does not establish
the transport's underlying root cause.

A measured lifecycle candidate gave Foundation a worker-scoped boundary and closed its browser
in the existing `afterAll`. It passed one strict 27-test canary and one exact 94-test run.
Finalization then failed the strict canary twice at the same candidate bytes. The browser close
timed out, and Playwright force-killed a worker after 15 seconds.

The candidate commits remain in history. Two explicit revert commits restored the Foundation
and runtime-functional files to their pre-candidate blobs. The selected one-worker fallback then
passed the exact 94-test config-default command twice. Both runs exited zero without force-kill,
ignored-lifecycle, or owned-residue findings.

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
the bundled project's. Filing measurements recorded roughly four to one on a clean six-worker
run and roughly eighteen to one on a stalled run. Those values characterise the filing sample.
What multiple is acceptable remains an owner decision recorded against this requirement.

### FR-017-005 — If the defect cannot be removed, it is disclosed rather than endured

Where the cause lies outside this repository, document the condition where a developer meets
it. Developers can then recognise an intermittent exit 1 on a green suite rather than
rediscover it. Disclosure is a fallback for an unremovable cause, never a substitute for a
removable one.

### FR-017-006 — Focused proof does not certify the remedy

A lifecycle candidate remains provisional after passing the focused Foundation-to-Paths probe.
Selection requires the exact 94-test workload at two workers to pass with exit 0. No force-kill
marker or workload-owned process residue may remain.

### FR-017-007 — One worker is a rollback-gated fallback

The repository may move from two workers to one only after the lifecycle candidate fails a
required current acceptance run and its changes are hash-verified as rolled back. One worker
must then pass the same 94-test workload with exit 0. No force-kill marker or workload-owned
process residue may remain.

## Acceptance Criteria

- The rejected lifecycle candidate's successful and failed checks remain recorded as history.
- Both selected-route runs execute the exact BUG-022 C03 command through the config default.
- Each selected-route run resolves one worker, passes all 94 tests, and exits zero.
- No `worker-N process did not exit within` error appears in either selected-route run.
- Chrome process count returns to its pre-run level after the run completes.
- A one-worker configuration is eligible only under FR-017-007 and must pass the identical
  complete workload.
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

Historical filing claims remain grounded in the filing evidence in `report.md`. The current
contract is grounded in `Current-Revision Stabilization At d532faaac`, `Scope 4 Finalization
Validation - Candidate Rejected`, and `Scope 4 Fallback Selection And Verification`. The
Foundation handle observation narrows the failing boundary without establishing a root cause.
The fallback runs bound exposure. They do not identify the retained socket owner.

## Superseded Closure Inference (Historical)

The original worker sweep observed no stalls in three two-worker runs. It observed one stall
in three four-worker runs and six stalls in eight six-worker runs. Those outcomes remain valid
history in `report.md`.

The current two-worker recurrence supersedes only the inference that two workers eliminated
the default-path defect. Six workers remain part of the original characterisation. They are no
longer the acceptance workload or the only known recurrence condition.
