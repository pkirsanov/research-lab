# User Validation: BUG-006 Evaluate-Before-Publish Ordering, And An Unscoreable Call Published (D16)

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Checklist

- [x] Acceptance question recorded: `node scripts/selftest.mjs` exits 0 on a clean checkout of `origin/main`.
- [x] Acceptance question recorded: the pipeline that publishes can actually hold the invariant its own selftest asserts, or the invariant is restated to match the ordering with the reason recorded.
- [x] Acceptance question recorded: D16 is enforced mechanically at the publish gate, not requested of an authoring model.
- [x] Acceptance question recorded: the D16 rule is expressed in terms of **attributed** invalidation levels, so a call carrying numerals that all classify to the trigger side is still refused.
- [x] Acceptance question recorded: both commit paths into `main` — the publisher script and the scheduled workflow — hold the same blocking gate standard, or the divergence is documented.
- [x] Acceptance question recorded: any remedy preserves the append-only ledger; no historical verdict is rewritten to improve `notEvaluableShare`.
- [x] Acceptance question recorded: a post-publish second evaluate has been assessed for convergence **and** for run-manifest / history-pointer drift before being attempted.
- [x] Acceptance question recorded: relaxing the failing assertion is not treated as a fix, because it removes the only mechanical signal that an unscoreable call reached the ledger.
- [x] Acceptance question recorded: why `"SPY closing at/above the 765 call wall"` produced no `above` level is established, or explicitly recorded as unknown.

Checked items mean the acceptance questions are **present in the packet**. They
do **not** claim the repository currently satisfies them, and they are **not**
DoD boxes. Every DoD box in [scopes.md](scopes.md) is unchecked. Runtime and
decision evidence must be recorded in [report.md](report.md) by the owning
phases once a remedy direction is selected.

## Owner Decision Required

This packet is **blocked on a decision no agent may make**, and on an explicit
operator DO-NOT-FIX constraint. Select among the candidate remedies in
[design.md](design.md#candidate-remedies-and-which-defect-each-addresses):

| Remedy | Addresses | One-line summary |
|---|---|---|
| **R1** | A | Evaluate again **after** the publish — *loop and manifest-drift questions are open* |
| **R2** | B | Enforce D16 mechanically at the publish gate — this is Step 6 / spec 015, currently `blocked` |
| **R3** | A2 | Run `selftest` in the publisher before it commits — **unsafe alone: the brief stops shipping** |
| **R4** | A (by redefinition) | Restate the assertion — **highest risk; must be paired with R2** |
| **R5** | B (partial) | Sharpen the D16 wording to speak in attributed-level terms — necessary, not sufficient |
| **R6** | B (diagnostic) | Establish why the `at/above 765` clause yielded no `above` level |

**No single remedy closes both defects.** Any complete fix is a combination.

## Why This Is Not Fixed Here

1. **Operator instruction.** A scheduled pipeline actively writes this surface,
   and the recommendation ledger is append-only. Racing it risks corrupting the
   published track record.
2. **The remedy is a trade, not a lookup.** R3 alone stops the brief shipping;
   R4 alone deletes a signal instead of a defect; R1 alone leaves the D16 breach
   accumulating.
3. **The R1 loop question is unanswered.** It is stated in
   [design.md](design.md#r1-the-loop-question--must-be-assessed-before-any-attempt)
   and labelled `interpreted`. Answering it requires executing against the real
   publish path — precisely what constraint 1 forbids right now.
4. **Defect B's remedy is owned elsewhere.** It is Step 6 work under spec 015,
   which is itself `status: blocked` / `certification.status: blocked`.

## User Journey

1. The scheduled brief pipeline runs. It evaluates the ledger at
   [`brief-refresh-and-push.sh:239`](../../../scripts/brief-refresh-and-push.sh),
   authors the narrative, and publishes at `:407`.
2. The narrative lane emits a `tactical` `hedge` call. Its invalidation field
   carries four numerals on named instruments — the D16 authoring instruction is
   satisfied **literally**.
3. Because the call is short-biased, direction-aware classification attributes
   every one of those `below` levels to the *trigger* side. Zero invalidation
   levels survive. The call is `not-evaluable` — **unscoreable at birth**.
4. The publish gate checks only that `invalidation` is non-empty text, so it
   passes. The call enters the append-only ledger. `notEvaluableShare` moves
   further from its ≤ 0.25 target, permanently.
5. The evaluator already ran, 168 lines earlier. It never runs again. The
   publisher commits and pushes without running `selftest` at all.
6. `origin/main` is now RED, and nobody is told. A developer or agent running
   the repository's canonical check sees a failure with no obvious cause.
7. Hours later the next scheduled `tier-a` run evaluates first, closes the
   pending call, and its own `selftest` step passes. `main` goes green — with
   the D16 breach permanently recorded in the ledger and never signalled.
8. Repeat on the next unscoreable call.
