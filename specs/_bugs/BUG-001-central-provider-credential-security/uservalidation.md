# User Validation: BUG-001 Central Provider Credential Security

Links: [spec.md](spec.md) | [scopes.md](scopes.md) | [report.md](report.md)

## Checklist

- [x] Acceptance question recorded: does detection identify only exact registered pre-BUG-002 credential containers and report redacted provider IDs, location classes, and counts without activating or migrating their contents?
- [x] Acceptance question recorded: before cleanup, does the user see that deleting a whole legacy container can also remove nested non-secret preferences?
- [x] Acceptance question recorded: does dismissal leave every legacy container, current provider configuration, and non-secret `localStorage.rlData` unchanged?
- [x] Acceptance question recorded: does explicit confirmation erase only the selected registered pre-BUG-002 containers as whole containers?
- [x] Acceptance question recorded: is cleanup reported complete only after every selected legacy container name is verified absent?
- [x] Acceptance question recorded: does a failed or unverifiable deletion produce an explicit redacted incomplete result without a complete or success claim?
- [x] Acceptance question recorded: do detection, dismissal, complete cleanup, and incomplete cleanup preserve BUG-002 proxy configuration, `localStorage.rlProviderConfig`, and non-secret `localStorage.rlData` unchanged?
- [x] Acceptance question recorded: are current BUG-002 containers and unknown container names structurally excluded from BUG-001 cleanup?

These checked items confirm the acceptance questions are present in the packet. They do not assert that the implementation satisfies them. Executed acceptance evidence belongs in [report.md](report.md), and certification remains validate-owned.

## Human Acceptance Record

- acceptedBy: operator
- acceptedAt: 2026-08-28T04:47:39Z
- method: external-record
- record: .specify/memory/open-work.md residue row res-g136-acceptance-record-backfill, section OPERATOR ACCEPTANCE GRANT 2026-08-28, which quotes the operator's instruction verbatim

Read this record for exactly what it claims. The operator issued a blanket
acceptance instruction during an agent session; they did not exercise this
behavior in a live session, which is why the method is `external-record` and not
`human-interactive`. The checklist above records that the acceptance questions
are present, not that anyone answered them, so the acceptance rests on the
operator's grant over work this repository had already certified done
(`certification.status: done`, certified 2026-08-10T17:31:15Z), not on the
checked boxes.

## Goal

- Goal: retire exact pre-BUG-002 credential containers without changing current provider access or non-secret market-data storage.
- Acceptance question: does the Data settings flow detect registered legacy containers through redacted metadata, disclose the whole-container effect, require explicit confirmation, erase only selected historical names, verify name absence before reporting completion, and preserve BUG-002 proxy configuration, `localStorage.rlProviderConfig`, and non-secret `localStorage.rlData` in every outcome?
- Authority boundary: BUG-002 is authoritative for current Tier-1 proxy and Tier-2 per-browser local-key provider access. BUG-001 acceptance is limited to SCOPE-01 and `SCN-BUG001-004` legacy-container retirement.

## Journey Steps

| Step | User Intent | Expected observation | Evidence target | Friction vocabulary |
| --- | --- | --- | --- | --- |
| 1 | Inspect legacy presence | Only registered pre-BUG-002 provider IDs, location classes, and counts appear; no legacy content becomes active provider configuration | `SCN-BUG001-004` detection acceptance | works, unclear, broken |
| 2 | Review cleanup impact | The flow explains that deleting a whole legacy container can also remove nested non-secret preferences | `SCN-BUG001-004` disclosure acceptance | works, unclear, broken |
| 3 | Dismiss cleanup | Legacy containers, BUG-002 proxy configuration, `localStorage.rlProviderConfig`, and non-secret `localStorage.rlData` remain unchanged | `SCN-BUG001-004` dismissal acceptance | works, broken |
| 4 | Confirm cleanup | Only selected registered pre-BUG-002 containers are erased as whole containers after explicit confirmation | `SCN-BUG001-004` confirmed-erase acceptance | works, unclear, broken |
| 5 | Review cleanup result | Completion appears only after every selected legacy name is verified absent; failed or unavailable verification is explicitly incomplete and never presented as success | `SCN-BUG001-004` verification acceptance | works, unclear, broken |
| 6 | Continue current provider and market-data use | BUG-002 proxy configuration, `localStorage.rlProviderConfig`, and non-secret `localStorage.rlData` remain unchanged after detection and every cleanup outcome | `SCN-BUG001-004` preservation acceptance | works, broken |

## Open Refinements

No open acceptance refinement or user-reported unchecked regression is recorded for the active BUG-001 contract. The checklist covers only exact pre-BUG-002 legacy-container detection, destructive-effect disclosure, dismissal, confirmed whole-container erase, name-absence verification, explicit incomplete outcomes, and preservation of BUG-002 current configuration plus non-secret `localStorage.rlData`.

BUG-002 remains authoritative for current provider access. The former BUG-001 memory-only, no-persistence, lifecycle-clearing, disabled-provider, header-only, no-proxy, and no-query clauses are superseded history and are not current acceptance questions. Checked items record the presence of questions only; execution evidence and certification remain with their owning workflows.

This planning reconciliation consumes `BUG001-USERVALIDATION-ACTIVE-CONTRACT` from completed audit attempt `AUD-BUG001-003`. A fresh current-revision audit remains audit-owned.
