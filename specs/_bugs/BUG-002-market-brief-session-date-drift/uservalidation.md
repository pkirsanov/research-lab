# User Validation: BUG-002 Market Brief Session-Date Drift

Links: [spec.md](spec.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Checklist

- [x] Acceptance criterion recorded: a published Market Brief never combines Tier-A and Tier-B target dates.
- [x] Acceptance criterion recorded: a failed target-date rollover retains the complete prior coherent snapshot, payload, and published history bytes.
- [x] Acceptance criterion recorded: same-target stale Tier B remains allowed only when the unchanged validator accepts it against candidate Tier A.
- [x] Acceptance criterion recorded: raw fetched data may commit independently without publishing a rejected brief candidate.
- [x] Acceptance criterion recorded: payload and config are restored together after each failed Tier-B attempt.
- [x] Acceptance criterion recorded: dirty wrapper-owned paths refuse before mutation, while unrelated dirty paths remain byte- and index-identical.
- [x] Acceptance criterion recorded: the July 15 payload narrative remains byte-unchanged and is never cosmetically relabeled July 16.
- [x] Acceptance criterion recorded: the served page shows one coherent retained date, thesis, action set, and market context.
- [x] Acceptance criterion recorded: regressions use isolated temporary Git/HTTP fixtures with no secret, Copilot authentication, external network, production monitoring, backup, release-train, or knb dependency.
- [x] Acceptance criterion recorded: Feature 006 Scope 3 resumes only after BUG-002 certification and a green exact repository selftest replay.

Checked items mean the acceptance questions are present in the packet. They do not assert that current implementation satisfies them. Delivery evidence belongs in [report.md](report.md) after owned implementation, independent test, and validate phases.

## Goal

Ensure the Market Brief reader never sees prior-session actions presented beside a later Tier-A target, while preserving truthful same-target data-only operation and independently useful raw data refreshes.

## Journey Steps

| Step | User intent | Expected observation | Evidence target |
| --- | --- | --- | --- |
| 1 | Open the Market Brief after a normal matching refresh | One session date governs deterministic context, thesis, and actions | `report.md#bug-verification---after-fix` |
| 2 | Open after Tier B fails within the same target date | Older payload timestamp remains visible and the pair still validates | `report.md#bug-verification---after-fix` |
| 3 | Open after Tier A crosses to a new target date and Tier B fails | Prior coherent brief remains visible; no July 15 action is labeled or contextualized as July 16 | `report.md#bug-verification---after-fix` |
| 4 | Inspect the repository after a failed rollover | Raw data may advance; rejected snapshot/history/payload/config candidates and staged paths are absent | `report.md#bug-verification---after-fix` |
| 5 | Resume Feature 006 Scope 3 | Exact repository selftest is green before the parent reruns its blocked quality row | `report.md#bug-verification---after-fix` |

## Open Refinements

None found - current repository truth determines the expected behavior, transaction boundary, data repair, exact tests, and owner route without a remaining UX or product-policy choice.
