# User Validation Checklist

Links: [scopes.md](scopes.md) | [report.md](report.md)

## Automation Readiness

Automation owns these readiness checks.
They grant no human acceptance.

- [ ] The live inventory has one current identity and one classification for every item.
- [ ] Every intended dirty byte has an owner-approved durable commit.
- [ ] The isolated candidate contains every selected history and every conflict decision.
- [ ] One unchanged candidate SHA has complete producer, product, browser, security, and governance receipts.
- [ ] Local `main` moved through compare-and-swap to that exact candidate.
- [ ] Final ancestry, no-push, no-cleanup, and retained-residue proofs are complete.
- [ ] Delivery routing uses each packet's recorded owner and lifecycle state.

## Checklist

Human acceptance ships unchecked.
A human checks each item after reviewing the completed operation and its evidence.

- [ ] I reviewed the complete ref, worktree, stash, and rescue classification ledger.
- [ ] I confirmed the owner and preservation decision for every substantive dirty path.
- [ ] I reviewed every merge input and every conflict resolution at path level.
- [ ] I confirmed that all validation receipts bind to one unchanged candidate SHA.
- [ ] I confirmed that local `main` equals the approved candidate and contains every required ancestor.
- [ ] I confirmed that the operation pushed nothing and removed nothing.
- [ ] I confirmed that delivery resumed without inferred status, certification, or acceptance changes.

An unchecked item at a terminal transition is unaccepted work or a reported regression.

## Human Acceptance Record

- acceptedBy:
- acceptedAt:
- method:
- record:

## Goal

- Goal: Integrate intended Research Lab histories into one validated local `main` without losing owned work.
- Success signal: The approved local revision has all required ancestors and preserves all excluded residue.

## Journey Steps

1. Review the frozen inventory and every classification record.
2. Review dirty-byte ownership, explicit path commits, and forbidden-path exclusions.
3. Review merge order, merge parents, and each conflict decision.
4. Review producer receipts and the complete candidate validation set.
5. Re-enter the full approved candidate SHA for the local-main action.
6. Review final ancestry, source identity, remote identity, and retained residue.
7. Review packet-owned delivery routes from final integrated main.

## Open Refinements

No human refinement has been recorded.
<!-- End of user validation checklist. -->