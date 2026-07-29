# Scopes: BUG-005 G087 Planning-Packet Linkage Unsatisfiable Under In-Place Delivery

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

> **This packet is DOCUMENTATION-ONLY.** No scope below is started, and none may
> start until the owner selects a resolution direction from
> [design.md](design.md#candidate-resolution-directions). Every DoD box is
> intentionally unchecked. No certification is asserted.

---

## Scope 1: Owner Decision On Resolution Direction

**Status:** [ ] Not started
**Depends On:** none
**Owner:** repository owner / framework maintainer (NOT agent-ownable)

### Description

Select among candidate directions D1 (explicit in-place delivery
classification), D2 (self-referencing `linkedImplementationSpec`), D3 (G087
framework amendment), and D4 (repository convention that packets graduate
directly and never occupy `specs_hardened`). D2 is recorded but was already
refused as untruthful by spec 013's own `modeTransition` record.

This scope cannot be discharged by an agent. It is a classification and
governance choice with framework-wide consequences.

### Gherkin Scenarios

```gherkin
Feature: A truthful resolution direction is selected

  Scenario: Owner records a decision
    Given four candidate directions are documented with their costs
    When the owner selects one or a combination
    Then the decision and its rationale are recorded
    And an implementation packet may be opened against it

  Scenario: No direction is selected
    Given the decision is outstanding
    Then this bug remains blocked
    And spec 016 cannot reach its declared ceiling truthfully
```

### Implementation Plan

1. Owner reviews [design.md](design.md#candidate-resolution-directions).
2. Owner records the selected direction and rationale.
3. A separate implementation packet is opened. **Not this packet.**

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
|---|---|---|---|---|---|
| (none) | — | — | Decision scope; no executable test applies until a direction is selected | — | No |

### Definition of Done

- [ ] Owner has selected a resolution direction from D1–D4 (or a documented combination)
- [ ] The selected direction and its rationale are recorded in a durable artifact
- [ ] The consequences for spec 016's path to `specs_hardened` are stated explicitly

---

## Scope 2: Registry Wiring Description Correction (F1)

**Status:** [ ] Not started
**Depends On:** none (orthogonal to Scope 1)
**Owner:** framework maintainer

### Description

G087's registry entry states the gate is invoked by `state-transition-guard.sh`
as "Check 29". The actual invocation lives in
`.github/bubbles/scripts/guards/tail-delegated-gates.sh`. Grepping the
documented script returns 0 and produces a false negative, as demonstrated in
[report.md](report.md#e-a3--g087-wiring-at-b525326d-the-false-negative-trap).

`.github/bubbles/**` is framework-managed in this downstream repository and MUST
NOT be patched locally. This scope routes upstream.

### Gherkin Scenarios

```gherkin
Feature: Gate wiring is discoverable from its registry description

  Scenario: Investigator follows the registry description
    Given the G087 registry entry names the script that invokes the guard
    When an investigator greps that named script for the guard invocation
    Then the invocation is found there
    And no false negative is produced
```

### Implementation Plan

1. Route the description defect to the framework owner.
2. Framework amends the G087 registry description to name the delegating script.
3. Downstream repositories pick the correction up via the normal framework
   refresh path. **No local patch.**

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Static check | `functional` | `.github/bubbles/registry/gates.yaml` | G087 description names the script that actually invokes the guard | `grep -A12 '  G087:' .github/bubbles/registry/gates.yaml` | No |

### Definition of Done

- [ ] The wiring-description defect is routed to the framework owner
- [ ] The G087 registry description names the delegating script, or explicitly notes the delegation
- [ ] Grepping the script named in the description locates the invocation
- [ ] No file under `.github/bubbles/**` was patched locally in this repository

---

## Scope 3: Disposition Of Spec 013's Historical Certification (F2)

**Status:** [ ] Not started
**Depends On:** Scope 1
**Owner:** repository owner

### Description

Commit `b525326d` certified spec 013 to `specs_hardened` in a state that G087 —
wired and live at that commit — rejects on replay. Spec 013 has since graduated
to `full-delivery` / `in_progress` and passes G087 today, so the risk is
**latent, not active**.

Decide whether the historical record needs explicit annotation, or whether the
graduation at `602f32db` already discharges it.

### Gherkin Scenarios

```gherkin
Feature: A live blocking gate is not silently passed by a rejecting state

  Scenario: Historical certification is dispositioned
    Given spec 013 was certified at a commit where G087 was live
    And replaying the guard at that commit exits 1
    When the owner reviews the record
    Then the discrepancy is either annotated or explicitly ruled discharged

  Scenario: The latent risk is confirmed to be latent
    Given spec 013 is at status in_progress under full-delivery
    When the guard is run against spec 013 at HEAD
    Then it exits 0
    And no active failure is attributable to this finding
```

### Implementation Plan

1. Owner reviews the replay evidence in [report.md](report.md#test-evidence).
2. Owner rules: annotate, or declare discharged by graduation.
3. Record the ruling. **No edit to `specs/013-*` is made by this packet.**

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Guard replay | `functional` | `specs/013-market-regime-stack-and-strategy-playbook` | Replay G087 against the archived certifying commit; expect exit 1 | see [bug.md](bug.md#r1--spec-013-was-certified-in-a-state-g087-rejects) | No |
| Guard at HEAD | `functional` | `specs/013-market-regime-stack-and-strategy-playbook` | Confirm the risk is latent; expect exit 0 | `bash .github/bubbles/scripts/planning-packet-linkage-guard.sh specs/013-market-regime-stack-and-strategy-playbook` | No |

### Definition of Done

- [ ] The replay evidence is reviewed by the owner
- [ ] A ruling is recorded: annotate the historical record, or declare it discharged by the `602f32db` graduation
- [ ] The latent-not-active characterization is confirmed or corrected against fresh guard output
- [ ] `specs/013-*` remains unmodified by this packet

---

## Cross-Scope Constraints

These hold for every scope above and were honored while authoring this packet:

- [ ] No `.html`, `.js`, or `.mjs` file is created or modified
- [ ] `specs/013-*` and `specs/016-*` are not modified
- [ ] No file under `.github/bubbles/**` is patched locally
- [ ] Files owned by the concurrent BUG-004 packet (`market-heatmap-lab.html`, `rlexperience.js`, `rlbrief.js`, and related tests) are not touched, reverted, stashed, or committed
- [ ] `state.json` remains valid JSON under `jq -e .`
- [ ] No DoD box in this packet is checked while the owner decision is outstanding
