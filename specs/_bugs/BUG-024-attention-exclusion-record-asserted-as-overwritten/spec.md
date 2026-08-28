# Spec: BUG-024 — The Exclusion Record And The Generation's Accounting Are Two Channels, Not One

## Problem

`recomposePayloadAttention` returns a per-generation accounting list and an
append-only record. Spec 020 governs them with two different requirements, and a
regression test asserts they are the same value. The test therefore fails
whenever the record contains anything the current generation did not re-derive —
which is the normal, required state of an append-only record.

The failure is not a symptom of a product defect. It is the test asserting the
negation of FR-020-023.

## The Requirements That Decide It

| Id | Text (verbatim) | Source |
| --- | --- | --- |
| FR-020-023 | "Every attention refusal MUST be appended to the attention exclusions channel with its code, field and reason." | `specs/020-research-action-routing-and-alerts/spec.md:592` |
| FR-020-024 | "The count of built attention items plus recorded exclusions MUST equal the count declared." | `specs/020-research-action-routing-and-alerts/spec.md:594` |
| FR-020-022 | "A subject already published as an action MUST be refused as an overlap; routing MUST NOT rename or re-key the subject to evade the check." | `specs/020-research-action-routing-and-alerts/spec.md:591` |
| P21 | "Append-only. Routing decisions, exclusions and outcomes are appended, never rewritten." | `specs/020-research-action-routing-and-alerts/spec.md:157` |

FR-020-023 says *appended*. FR-020-024 constrains a *count* against the declared
candidate count, which only the current generation's list can satisfy. Two
requirements, two values. A single assertion that they are deep-equal cannot be
satisfied without violating FR-020-023.

FR-020-022 additionally establishes that the five carried-forward
`RLATTN-OVERLAP` rows are legitimate refusals that must not be evaded. Discarding
them from the record to satisfy the test would be the evasion that requirement
names.

## What Must Remain True

- `recomposePayloadAttention` keeps returning `exclusions` as this generation's
  list only, so FR-020-024's accounting identity stays checkable.
- The published `payload.attentionExclusions` keeps every prior refusal that the
  current generation did not re-derive, keyed on `code|subject` so a re-derived
  refusal replaces its own prior row rather than doubling it.
- No product file changes to make this suite green. `rlattention.js`,
  `scripts/build-attention-items.mjs` and `market-brief.payload.json` are correct
  as they stand at `2eb14d964`.
- The empty-tier floor stays: an empty `attention` with recorded exclusions
  publishes, and an empty tier with no recorded exclusions is refused
  (`SCN-017-067`).

## What Must Change

- The assertion at `tests/attention-payload-contract.test.mjs:797` must check
  each channel against the requirement that governs it, instead of equating them.
- The test's input payload must declare its own `attentionExclusions` rather
  than inheriting whatever the production feed last published.
- An automated gate must execute this file, so a red contract test cannot again
  coexist with a green canonical check.

## Scenarios

```gherkin
# SCN-024-01
Feature: The append-only record is not required to equal the generation's accounting
  Scenario: A payload carrying prior refusals is recomposed
    Given a committed payload whose attentionExclusions holds five RLATTN-OVERLAP records
    And a single candidate that carries no observed gate result
    When the payload is recomposed through the certified composer
    Then result.exclusions holds exactly one RLATTN-PROVENANCE refusal on gateResult
    And result.payload.attentionExclusions holds that refusal and all five prior records
    And no assertion requires those two values to be equal

# SCN-024-02
Feature: The regression fixture does not inherit live published data
  Scenario: The brief publishes a new exclusion after the test is written
    Given the regression test declares its own attentionExclusions in its input payload
    When market-brief.payload.json gains or loses a prior exclusion record
    Then the test's verdict is unchanged

# SCN-024-03
Feature: FR-020-024 accounting stays asserted after the fix
  Scenario: One declared candidate is refused
    Given one candidate is declared
    When it is refused
    Then built items plus this generation's exclusions equals one
    And that identity is asserted directly rather than inferred from the record

# SCN-024-04
Feature: A red contract test turns the canonical check red
  Scenario: An assertion in the attention contract suite is made to fail
    Given tests/attention-payload-contract.test.mjs contains a failing assertion
    When the canonical repository check is run
    Then it reports a failure and exits non-zero

# SCN-024-05
Feature: Reachability by prose is distinguished from execution by a gate
  Scenario: A test file is selected only by a glob quoted inside a spec report
    Given no automated gate executes that file
    When coverage is assessed
    Then the file is reported as unexecuted rather than as covered
```

## Out Of Scope

- Changing `rlattention.js`, its thirteen-code refusal list, or the overlap rule.
- Changing `market-brief.payload.json`, including its five prior `RLATTN-OVERLAP`
  records. They are a published append-only record.
- Editing `specs/_bugs/BUG-007-decision-attention-contract-drift/`. It is
  certified done. Whether it is reopened is an owner decision, recorded in
  `report.md` § 6 and routed, not taken here.
- The absent gate-result producer. That is already filed as
  `specs/_bugs/BUG-009-decision-attention-gate-result-producer-absent` and is a
  different defect; it explains why the surviving refusal is `RLATTN-PROVENANCE`
  but has no bearing on which channel the record should carry.

## Product Principle Alignment

| Principle | How this bug engages it |
| --- | --- |
| **P21 — additive, append-only** | Directly. The assertion requires prior exclusion rows to be discarded. Repairing the test is what keeps the record append-only. |
| **P2 — missing renders as missing** | A dropped `RLATTN-OVERLAP` row would erase the reader's only statement of why a subject was held back, turning a named refusal into a silent omission. |
| **P16 — no duplicate surfacing** | FR-020-022's overlap refusal is the mechanism. Its record is what makes the suppression auditable rather than invisible. |
| **P19 — one owning module** | `rlattention.js` owns the refusal contract; the test must assert against it, not restate a second rule. |
| **Tests validate specifications, not implementations** | Applied in the direction that costs the test: the spec is the authority, the assertion contradicts it, so the assertion is what changes. |

## Offline-Only Compatibility

`fully-offline`. Every artifact involved is a committed file read from disk; the
reproduction, the bisect and the probe all run with no network.
