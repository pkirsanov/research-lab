# Scopes: BUG-024 — A Regression Test Requires The Attention Exclusion Record To Be Overwritten

**Scope layout:** single-file.

## Sequencing Note

Scope 1 is self-contained and can start immediately: the requirement that
decides it (FR-020-023) is already committed and quoted in `spec.md`, and no
product file changes.

Scope 2 is blocked until the owner picks between directions A, B and C in
`design.md`. Direction A changes what the canonical check is, and `SCN-017-044`
asserts on the canonical check from inside the very suite A would make it run —
that recursion must be broken deliberately. An implementing round must not pick
for the owner.

## Scope 1: Assert Each Channel Against Its Own Requirement

**Status:** not started

### Problem This Scope Resolves

`tests/attention-payload-contract.test.mjs:797` requires the append-only
exclusion record to equal the current generation's accounting list. FR-020-023
requires the record to be appended to and never rewritten, so the assertion is
satisfiable only when the input payload has no prior rows. The test additionally
inherits `attentionExclusions` from the live `market-brief.payload.json`, so its
fixture changes whenever the brief publishes.

### Gherkin Scenarios

Implements `SCN-024-01`, `SCN-024-02` and `SCN-024-03` from `spec.md`.

### Implementation Plan

1. Replace the line-797 equality with two assertions: the record contains every
   entry in `result.exclusions`, and it retains every prior row whose
   `code|subject` the generation did not re-derive.
2. Assert the FR-020-024 identity directly — built plus this generation's
   exclusions equals the declared candidate count — rather than inferring it.
3. Declare `attentionExclusions` explicitly in the test's input payload so the
   fixture no longer inherits published state through the object spread.
4. Leave lines 792–796 unchanged. They assert the property the test exists for
   and they already pass.
5. Change no product file. `rlattention.js`,
   `scripts/build-attention-items.mjs` and `market-brief.payload.json` stay as
   they are at `2eb14d964`.

### Test Plan

| Id | Category | Asserts |
| --- | --- | --- |
| SCN-024-01 | contract | A payload carrying five prior `RLATTN-OVERLAP` rows recomposes to one fresh `RLATTN-PROVENANCE` refusal and a record holding all six |
| SCN-024-02 | contract | Adding or removing a prior row in the committed payload does not change the test's verdict |
| SCN-024-03 | contract | Built items plus this generation's exclusions equals the declared candidate count |

### Definition of Done

- [ ] The assertion no longer requires `payload.attentionExclusions` to equal `result.exclusions`.
- [ ] The test's input payload declares its own `attentionExclusions` instead of inheriting the committed file's.
- [ ] The FR-020-024 accounting identity is asserted directly, naming the requirement.
- [ ] An adversarial run proves the repaired assertions still fail if a prior row is dropped from the record.
- [ ] `node --test tests/attention-payload-contract.test.mjs` reports 31 tests, 31 pass, 0 fail, exit 0, with `git status --porcelain` clean for every product file.

## Scope 2: Make An Automated Gate Execute The Attention Contract Suite

**Status:** not started

### Problem This Scope Resolves

The failure in Scope 1 survived six days because nothing runs the file.
`node scripts/selftest.mjs` reports 3429 passed, 0 failed while the file is red;
its only reference to it is prose at `scripts/selftest.mjs:25743`. No workflow in
`.github/workflows/` runs `node --test`. The reachability guard rates the file
covered because the glob `tests/*.test.mjs` appears in argument position inside a
committed spec report — a declaration nobody executes.

### Gherkin Scenarios

Implements `SCN-024-04` and `SCN-024-05` from `spec.md`.

### Implementation Plan

1. Record the owner's choice between directions A, B and C in `design.md`.
2. Wire the chosen gate so the `tests/*.test.mjs` family is executed by a command
   the repository declares as canonical.
3. If direction A is chosen, break the `SCN-017-044` recursion explicitly and
   state how, rather than letting the suite invoke the check that invokes it.
4. Report the distinction the reachability guard cannot currently draw — glob
   declared only in narrative versus glob executed by a gate — as a named finding
   with an owner, whether or not direction C is taken.
5. Restate the canonical pass count after the change and account for the delta.

### Test Plan

| Id | Category | Asserts |
| --- | --- | --- |
| SCN-024-04 | adversarial | An induced failure in `tests/attention-payload-contract.test.mjs` turns the canonical check red and non-zero |
| SCN-024-05 | guard | A file whose only declaring glob sits in narrative is reported as unexecuted rather than covered |

### Definition of Done

- [ ] The owner's choice between directions A, B and C is recorded in this packet.
- [ ] A command the repository declares as canonical executes `tests/attention-payload-contract.test.mjs`.
- [ ] An adversarial mutation proves a red assertion in that file turns the canonical check non-zero.
- [ ] The prose-declaration versus gate-execution gap is recorded as a named finding with an owner, and is not closed silently.

## Cross-Scope Definition of Done

- [ ] No product file changed: `rlattention.js`, `scripts/build-attention-items.mjs` and `market-brief.payload.json` are byte-identical to `2eb14d964`.
- [ ] `specs/_bugs/BUG-007-decision-attention-contract-drift/` is unmodified, and the reopening question is answered by the owner rather than assumed.
- [ ] `node scripts/pii-scan.mjs` exits 0.
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-024-attention-exclusion-record-asserted-as-overwritten` exits 0.
