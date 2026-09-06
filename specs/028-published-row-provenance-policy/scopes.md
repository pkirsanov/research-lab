# Scopes — Published Row Provenance Policy

**Status:** not_started. No scope may begin before Scope 1 records an owner decision.

## Scope 1: Measure The Exposure And Record The Owner Decision

**Status:** Not Started

**foundation: true**

This scope establishes the fact base and the policy. Every later scope depends on the decision it
records, which is why it is the foundation.

### Problem This Scope Resolves

The policy question cannot be answered without knowing how often a published row actually changes
value, and a mechanism chosen before that is a guess wearing an implementation.

### Gherkin Scenarios

```gherkin
# SCN-028-01
Scenario: the exposure is measured before a policy is chosen
  Given the committed bars corpus and the current ingestion path
  When the ingestion is replayed against the corpus without writing
  Then the count of timestamps whose value would change is recorded
  And that count distinguishes changes caused by the removed adjusted-close arithmetic from changes a vendor restated

# SCN-028-02
Scenario: the owner decision is recorded before any mechanism is built
  Given the measured exposure
  When the owner selects a policy
  Then design.md records the selected option, the date, and the reasoning
  And the rejected options are recorded with the reason each was rejected
```

### Test Plan

| Id | Category | Asserts |
|---|---|---|
| TP-028-01 | unit | The replay counts changed timestamps without mutating the corpus |
| TP-028-REG1 | Regression E2E | Scenario-specific: the replay is non-mutating, proven by a corpus hash compared before and after |
| TP-028-REG2 | Regression E2E | Broader suite: `node scripts/selftest.mjs` passes |

### Definition of Done

- [ ] SCN-028-01 holds: the exposure is measured and the count recorded, distinguishing arithmetic-caused changes from vendor restatements
- [ ] SCN-028-02 holds: the owner decision, its date, its reasoning, and the rejected alternatives are recorded in `design.md`
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior exist and pass
- [ ] Broader E2E regression suite passes
- [ ] Change Boundary is respected and zero excluded file families were changed
- [ ] Build Quality Gate: artifact lint clean, selftest 0 failed, pii-scan 0 findings

### Change Boundary

**Allowed file families**

| Family | Why it is in scope |
|---|---|
| A new read-only measurement script | The replay must not write |
| `design.md` | Where the decision is recorded |

**Excluded surfaces**

| Surface | Why it is excluded |
|---|---|
| `data/bars/*.json` | The measurement is read-only by construction; writing would destroy the thing being measured |
| The ingestion write path | No mechanism may be built before Scope 1 records a decision |
| BUG-012's INV-012B invariants and `validate-bars-coherence.mjs` | Binding and must continue to pass |
