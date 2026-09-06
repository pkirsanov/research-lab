# Design: BUG-023 — Replacing A Silence Proxy With An Outstanding-Work Signal

## The Shape Of The Defect

The test needs a baseline: the request count at the moment the page has finished its own work.
It obtains that by polling for silence.

```
requests:  ■■■■■■■■■■        (lull 2001ms)        ■■■■■■■■■■■■■■■■■■■■■■■■■■
                      ↑
                      heuristic declares "settled" here, at 30 of 56 requests
```

Silence is a proxy for completion. The proxy is wrong whenever the producer is bursty, and this
producer is bursty by construction — it fetches a large ticker set through bounded concurrency,
so a batch boundary is a natural quiet moment.

Widening the window does not fix this. It moves the threshold and leaves the same class of
failure at a wider lull, while making every run slower. The 40-attempt cap already allows 20 s;
the problem is not patience, it is that the signal carries no information about outstanding work.

## Candidate Directions

Recorded as candidates. None is selected — selection belongs to the round that writes the fix,
and one of them needs an owner decision.

### A. Ask the page, not the wire

The page already knows when its live layer has settled; the brief mount exposes a readiness
attribute (`[data-rlbrief-mount][data-rlbrief-ready="1"]`) that this same test already waits for,
and the bond-regime spec's opener waits on a comparable runtime signal rather than on silence.

If the cockpit exposes — or can expose — a terminal "live layer settled" state, the baseline
becomes a fact the page asserts instead of an inference the test draws. This is the direction
most consistent with how the rest of the suite already synchronises.

**Open question for the owner:** does such a terminal state exist on this page today, and if
not, is adding one acceptable? It is a page change in service of testability, which this
repository generally treats as legitimate only when the state is meaningful to a reader too.

### B. Neutralise the live layer for this test

The invariant is about what EXPANSION costs, not about what the page's load costs. Serving the
live layer from a preseeded cache, or routing its provider calls, would remove the confound
entirely: with no background stream, any off-origin request after the baseline is unambiguously
caused by the expansion.

The same file's header already documents which of its tests are MOCKED and which are MEASURED
with zero interception, so this choice must be recorded there in the same terms. It narrows what
the test observes — it would no longer incidentally exercise a live load — which is a real
trade, not a free win.

### C. Attribute by cause rather than by time

Record requests with their initiator and count only those causally attributable to the
expansion. This is the most faithful to the invariant's wording and the least dependent on
timing, but initiator attribution across a deferred fetch is not always unambiguous, and an
attribution that is quietly wrong is worse than a timing rule that is loudly flaky.

## What Any Direction Must Carry

- The precondition must be **checked, not assumed** (FR-7). If settle cannot be established, the
  failure must name that, not a downstream symptom.
- The failure message must remain able to distinguish the three outcomes it can produce: an
  off-origin request, a credentialed request, and an unestablished precondition. Today the third
  is reported as the first, which is what made this defect read as a product violation.

## Rejected

- **Retry the test.** Converts a measurement defect into a tolerated one and hides the day it
  becomes real.
- **A longer quiet window.** Same unsound signal, different threshold, slower suite.
- **Dropping the test.** The invariant is a genuine product promise; it must keep a guard.
- **Marking it non-blocking.** The gate is correct to block on a real off-origin regression. The
  defect is the false positive, not the blocking.

## Unverified Hypothesis

The lull is *consistent with* bounded-concurrency batch boundaries in the shared fetch layer, but
no attribution was attempted. Recorded as a hypothesis so a later round does not inherit it as a
finding.
