# User Validation: BUG-003 Bond Regime Simple/Power Model-Digest Divergence

Links: [spec.md](spec.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Checklist

- [x] Acceptance question recorded: cached Bond Regime content remains visible during automatic hydration without being labeled Ready prematurely.
- [x] Acceptance question recorded: Ready means the current automatic hydration has settled and the shared view model will not be replaced by that in-flight refresh.
- [x] Acceptance question recorded: the exact protected `BS-011 Simple and Power share one model digest` title and assertions remain unchanged.
- [x] Acceptance question recorded: Simple and Power expose one production-produced digest after Ready.
- [x] Acceptance question recorded: switching modes preserves scenario assumptions and adds zero requests.
- [x] Acceptance question recorded: a true external Treasury boundary can be held deterministically without intercepting internal application behavior.
- [x] Acceptance question recorded: the complete Bond Regime file and complete system-Chrome inventory are green before BUG-002 acceptance resumes.
- [x] Acceptance question recorded: Feature 003 planning/state, Feature 006, BUG-002, Market Brief, shared JavaScript, registries, package graph, Feature 005, and unrelated dirty paths remain untouched.
- [x] Acceptance question recorded: independent evidence returns to BUG-002 `bubbles.test`, then BUG-002 validation/audit precedes Feature 006 Scope 3 replay.

Checked items mean the acceptance questions are present in the packet. They do not assert current implementation satisfies them. Runtime evidence belongs in [report.md](report.md#bug-verification---after-fix) after implementation and independent verification.

## Human Acceptance Record

- acceptedBy: operator
- acceptedAt: 2026-08-28T04:48:06Z
- method: external-record
- record: .specify/memory/open-work.md residue row res-g136-acceptance-record-backfill, section OPERATOR ACCEPTANCE GRANT 2026-08-28, which quotes the operator's instruction verbatim

Read this record for exactly what it claims. The operator issued a blanket
acceptance instruction during an agent session; they did not exercise this
behavior in a live session, which is why the method is `external-record` and not
`human-interactive`. The checklist above records that the acceptance questions are
present, not that anyone answered them, so the acceptance rests on the operator's
grant over work this repository had already certified done
(`certification.status: done`, certified 2026-07-27T20:30:33Z), not on the
checked boxes.

## Goal

Ensure a user can move from the Bond Regime Simple summary to Power detail after Ready and see the same decision, assumptions, and observed snapshot without a hidden automatic refresh crossing the interaction.

## Journey Steps

| Step | User intent | Expected observation | Evidence target |
| --- | --- | --- | --- |
| 1 | Open Bond Regime from a warm shared cache | Decision content paints immediately and status says Refreshing while Treasury hydration is unresolved | `report.md#bug-verification---after-fix` |
| 2 | Wait until the page says Ready | Automatic hydration is settled and source-state rows reflect final fresh/stale/unavailable truth | `report.md#bug-verification---after-fix` |
| 3 | Read the Simple decision and switch to Power | Power adds detail while digest, assumptions, regime, confidence, expression, ranking, and invalidation remain coherent | `report.md#bug-verification---after-fix` |
| 4 | Inspect network activity around only the mode switch | No additional request is emitted by the switch | `report.md#bug-verification---after-fix` |
| 5 | Resume blocked acceptance | Exact BS-011, complete Bond file, and complete system Chrome are green before BUG-002 and Feature 006 continue | `report.md#bug-verification---after-fix` |

## Open Refinements

None found - the current Feature 003 contract, exact failure values, runtime timeline, and existing cache-first product rules determine the repair and verification boundary without an open UX or product-policy choice.
