# Bug Specification: BUG-001 Unsafe Token Usage Normalization

- **Owning feature:** `specs/030-budget-aware-hybrid-brief-generation`
- **Finding:** `F030-SEC-01`
- **Workflow mode:** `bugfix-fastlane`
- **Status:** In progress

## Problem Statement

Feature 030 usage receipts accept unsafe token integers and unchecked addition.
Rounded arithmetic can make an invalid provider total appear consistent.

## Outcome Contract

**Intent:** Reject unsafe or overflowing token measurements before a normalized
usage receipt can be returned.

**Success signal:** TP-01-09 fails on the current behavior and passes after the
repair with every boundary case asserted through production code.

**Failure condition:** Any unsafe count or overflowing sum reaches an `ok`
receipt, or any missing measurement becomes zero or a synthesized total.

## Requirements

| ID | Requirement |
| --- | --- |
| FR-B001-01 | Every present prompt, completion, and provider-total count MUST be a non-negative `Number.isSafeInteger` value. |
| FR-B001-02 | When prompt and completion are measured, the normalizer MUST refuse before addition when prompt exceeds `Number.MAX_SAFE_INTEGER - completion`. |
| FR-B001-03 | A computed prompt-plus-completion sum MUST be a safe integer before any consistency comparison. |
| FR-B001-04 | A present provider total MUST be validated independently before comparison with a safely computed sum. |
| FR-B001-05 | A safe provider total that differs from the safe computed sum MUST retain the existing inconsistent-total refusal. |
| FR-B001-06 | Missing and `null` provider fields MUST remain `unmeasured` without a numeric value. |
| FR-B001-07 | The normalizer MUST NOT synthesize zero or a total when a provider field is absent. |
| FR-B001-08 | `validateUsageReceipt` MUST reject an externally supplied measured dimension whose value is not a non-negative safe integer. |
| FR-B001-09 | A usage refusal MUST NOT select another provider, model, profile, or endpoint. |
| FR-B001-10 | The repair MUST NOT add a production consumer or change Copilot generation, publication, scheduler, or public artifacts. |

## Acceptance Scenario

```gherkin
Scenario: SCN-030-002 Unsafe token counts and overflow refuse before normalized usage
  Given provider usage contains present token fields or missing and null measurements
  When the production usage normalizer validates each field and derives any measured sum
  Then every present count is a non-negative safe integer
  And prompt plus completion overflow refuses before addition
  And a provider total is compared only after independent safe validation
  And missing or null fields remain unmeasured without synthesized numeric values
```

## Adversarial Contract

TP-01-09 must include the reported rounded-equality case. It must also cover
unsafe prompt, completion, and total values independently. The matrix must cover
the exact safe maximum, overflow at maximum plus one, a safe inconsistent total,
missing fields, and `null` fields.

The test must call production normalization. It must assert the returned
refusal or receipt. It must contain no conditional return that can turn the
failure condition into a pass.

## Preserved Constraints

- Keep receipt contract names and measured-state source labels unchanged.
- Keep provider credits and monetary cost `not-applicable` for local profiles.
- Keep profile selection and transport behavior unchanged.
- Keep the shadow CLI non-authoritative and without a production consumer.
- Keep `F030-SEC-02` and `F030-SEC-OBS-01` outside this repair.

## Product Principle Alignment

| Principle | Alignment |
| --- | --- |
| P2 - Missing data renders as missing | Missing and `null` usage remain `unmeasured`; the repair cannot invent zero or a total. |
| P7 - No blackbox numbers | Every measured count must be safely representable and its consistency check must be exact. |
| P19 - One definition per concept | `rlbriefroute.js` remains the sole usage-normalization authority. |
| P22 - Budgets are assertions | Unsafe accounting cannot pass a budget receipt through rounded arithmetic. |
| P23 - A guard that cannot fail is not a guard | TP-01-09 supplies unsafe and overflowing negative controls that must refuse. |

## Delivery Reality

This packet specifies an open repair. It does not claim source changes, authored
TP-01-09 coverage, GREEN execution, or certification.
