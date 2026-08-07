# Scope 6 Report — Authoring Lane Composer Routing

## Summary

This scope is **Not Started**. It was created by a planning amendment that
implements the ratified decision F-017-06, and no implementation, no test and no
verification command has been executed against it.

Nothing in this report is evidence of delivered behaviour. Every Test Evidence
section below is an empty anchor reserved for the raw output the implementing
session will record when that row is actually executed. An anchor with no output
under it means the row has not run — it does not mean the row passed.

The scope plans one publish-time build step, `scripts/build-attention-items.mjs`,
that routes the authoring lane through `RLATTN.buildAttentionItem` so the lane
authors only the `authored` argument and never serializes a
`decision-attention/v1` envelope. Seven scenarios (SCN-017-047 through
SCN-017-053) and seven Test Plan rows (TP-06-01 through TP-06-07) are declared in
`scope.md`. All 26 Definition of Done checkboxes are unticked.

## Planning Provenance

The decision this scope implements is recorded in `design.md` as F-017-06 and in
`scopes/_index.md` as Plan Amendment 2. Its triggering evidence is three
consecutive cron publishes — `348c9f88`, `d2f85159` and `1412f3e0` — that each
emitted zero `decision-attention/v1` markers while enforcement was fully intact.
That evidence was executed and recorded by the session that raised the finding;
it is cited here, not re-claimed as this scope's own execution evidence.

One consequence is owed to the planning owner before this scope executes:
shrinking the `attention` authoring instruction turns Scope 2's SCN-017-045 and
TP-02-04 red, because they assert the instruction names the decision window, the
transmission path and the provenance class that F-017-06 moves to the build step.
Scope 2 was deliberately not edited. The reconciliation is described under
*Cross-Scope Supersession* in `scope.md`.

## Test Evidence

### TP-06-01

Not executed. Reserved for SCN-017-047 — the build step composes a conforming
`decision-attention/v1` envelope from an observed gate result, an authored
judgement and a committed context.

### TP-06-02

Not executed. Reserved for SCN-017-048 — a candidate missing its invalidation is
refused with a named `RLATTN-*` code and is absent from the published attention
set. The fixture must be a candidate that genuinely fails to build, per the
anti-tautology requirement in `scope.md`.

### TP-06-03

Not executed. Reserved for SCN-017-049 — every excluded candidate is recorded
with its refusal code and field, and published plus excluded equals declared. The
fixture must be a mixed generation of one buildable and one refusable candidate.

### TP-06-04

Not executed. Reserved for SCN-017-050 — an all-refused generation publishes an
empty attention set with a full exclusion record and the publication gate exits
zero. The fixture must be a payload in which every declared candidate fails to
build; a payload declaring zero candidates does not satisfy this row.

### TP-06-05

Not executed. Reserved for SCN-017-051 — the decision attention tier renders its
declared empty state for an all-excluded generation with no placeholder card.

### TP-06-06

Not executed. Reserved for SCN-017-052 — the build step resolves window,
transmission, provenance and lifecycle from committed contracts and declares no
second copy of any module rule.

### TP-06-07

Not executed. Reserved for SCN-017-053 — the attention authoring instruction asks
only for the authored judgement and never for a `decision-attention/v1` envelope.

## Honest Gaps

- No command has been run for this scope. There is no RED run, no GREEN run and
  no adversarial bite recorded.
- The three adversarial bites required by `scope.md` (TP-06-02, TP-06-03 and
  TP-06-04, each proven by a mutation of the build step that drops a refused
  candidate without a reason) are owed and unrecorded.
- The SCN-017-045 supersession is unreconciled, so the scope is not yet safe to
  execute end to end without turning a Scope 2 scenario red.

## Completion Statement

Scope 6 is **not complete**. Its status is Not Started, zero of its 26 Definition
of Done items are ticked, and zero of its seven Test Plan rows have been executed.
This report exists to hold the planned evidence anchors and to state plainly that
they are empty.
