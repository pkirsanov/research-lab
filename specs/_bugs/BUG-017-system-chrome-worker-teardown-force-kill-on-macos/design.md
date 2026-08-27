# Design: BUG-017 — Where The Boundary Is, And What Is Still Behind It

## What This Document Does And Does Not Do

It fixes the boundary between what the evidence establishes and what it does not, enumerates
candidate mechanisms without selecting one, and lists remedy options with their consequences.
It does not diagnose the stall. Diagnosis needs instrumentation the filing session did not
run, and guessing past the boundary would convert an honest defect record into a
confident-sounding wrong one.

### Single-Implementation Justification

The existing owning abstraction is the repository-wide Playwright runner configuration in
`playwright.config.mjs`. It owns the worker limit and the existing `system-chrome` and
`chromium` project definitions. `.specify/memory/agents.md` records the same operating
contract.

This packet bounds one teardown exposure within that existing runner. It adds no runner
implementation, browser provider, or lifecycle extension point. Browser channel selection
already belongs to Playwright's project model, so it is not a new variation axis. A separate
foundation would duplicate that model without a second implementation to consume it.

## The Boundary

Five runs in a single session on one machine, with only one variable moving.

| Held constant | Varied |
|---|---|
| The ninety-four tests, selected from the lifetime-tax spec family | The browser project |
| Worker count within each comparison | |
| Machine, session, Node version, Playwright version | |
| Output directory, placed outside the repository | |

The bundled `chromium` project completed the set in 18.2s and exited 0. The `system-chrome`
project completed the same set twice: once in 1.3m with exit 0, once in 5.7m with a
force-killed worker and exit 1. Every test passed in all three.

What follows from this, and only this:

- **The tests are not the trigger.** They pass, quickly and cleanly, on the bundled project.
- **The trigger scales with concurrency.** At one worker the two projects differ by about a
  second. At six the clean gap is roughly four to one, and the stalled gap roughly eighteen.
- **The trigger is intermittent at six workers.** Identical commands, different outcomes.
- **It is release, not execution, that stalls.** The runner reported all ninety-four passes
  before it began waiting on the worker.

What does not follow, and is not claimed anywhere in this packet:

- That the mechanism is Chromium's CDP transport over `--remote-debugging-pipe`. That
  attribution is a hypothesis carried in from outside this session. No handle trace was taken
  here, so it is recorded below as a candidate and nowhere as a finding.
- That three to six workers are force-killed. Exactly one was, named `worker-3`.
- That any repository fixture is exonerated. The bundled-project result points away from the
  tests; pointing away is not proof, and no fixture-level isolation was attempted.

## Why It Is Worse Than A Slow Suite

A run that always failed would be fixed. This one passes on most attempts, so the developer
who reruns and sees green concludes the runner is unreliable rather than that the browser is.
The lesson learned is *ignore the exit code*, which is precisely the habit the exit code
exists to prevent — and once learned it applies to every runner, not just this project.

The standing four-to-one slowdown compounds it. A slow suite is run less often; a suite run
less often catches less.

## Candidate Mechanisms

Enumerated for whoever diagnoses this. None is selected, and the evidence in `report.md`
distinguishes none of them from the others.

1. **Transport shutdown.** The connection between runner and browser fails to close, so the
   worker waits on a channel that never signals. This is the carried-in hypothesis and the
   one most consistent with a stall at release rather than during execution.
2. **A macOS process-lifecycle interaction.** A system-installed application bundle is
   launched, supervised and reaped differently from a bundled binary in the runner's own
   install tree. Concurrency scaling would fit this.
3. **A profile or lock contention.** Six concurrent instances of the same installed browser
   may contend over shared per-user state in a way six instances of a bundled build do not.
   This would explain why the defect is absent at one worker.
4. **A version-pair interaction.** The installed Chrome and the pinned Playwright build are
   independently versioned. The bundled project has no such pairing.

Discriminating between these is Scope 1. Candidates 3 and 4 are cheap to test; candidate 1
needs instrumentation.

## Remedy Options

Enumerated, not chosen.

### Option A — Diagnose and fix or report upstream

Instrument the stall, identify the mechanism, and either remove it locally or report it where
it belongs.

**Consequence.** The only option that addresses FR-017-002 at its source. Open-ended in cost,
and the cause may be upstream and not fixable here.

### Option B — Make the bundled project the local default

Leave `system-chrome` available and deliberate rather than routine.

**Consequence.** Restores a fast, clean local loop immediately and satisfies FR-017-001 and
FR-017-004 in practice. Reduces how often the system Chrome path is exercised locally, which
matters only if a defect exists that appears solely under the installed channel — and the
pipeline runs `system-chrome`, so that path retains coverage.

### Option C — Bound the concurrency

Cap workers for `system-chrome` at a level where the stall was not observed.

**Consequence.** Cheap. Rests on an observation, not an understood threshold, so the cap is a
guess that may not hold. Does not address the four-to-one slowdown, which is present at six
workers independently of the stall.

### Option D — Disclose it

Document the condition where a developer meets it, so an intermittent exit 1 on a green suite
is recognised rather than rediscovered.

**Consequence.** Costs almost nothing and removes the confusion that does most of the damage.
Removes no cost. Legitimate only as a fallback for an unremovable cause, or alongside another
option — never alone while a removable cause is unexamined.

### What the remedy is not

It is not a change to the tests, and it is not raising the teardown budget. The budget is
already three hundred seconds; a worker that has not exited by then is not going to. Raising
it converts an intermittent false failure into an intermittent five-minute-plus stall, which
is a worse trade.

## Open Questions For The Owner

1. **Is diagnosis worth its cost?** Option A is the only one that removes the defect at
   source, and the cause may be upstream and unfixable here. B plus D is a cheap, honest
   position that leaves the mechanism unknown.
2. **What wall-time ratio is acceptable?** FR-017-004 states the property and deliberately
   fixes no number. Four to one on a clean run is the current measurement.
3. **How much does exercising the installed Chrome channel locally matter?** The pipeline runs
   it regardless, which weakens the argument against Option B considerably.
4. **Is one occurrence in two runs enough to act on?** It is not a rate. Establishing one costs
   runs; acting without one risks fixing a threshold that was never there.
