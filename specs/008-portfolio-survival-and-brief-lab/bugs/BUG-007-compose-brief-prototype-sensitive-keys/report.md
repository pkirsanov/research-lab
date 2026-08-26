# Report: BUG-007 Compose Brief Prototype-Sensitive Keys

## Summary

- Filed a complete BUG-007 control-plane packet for `SEC-B006-S1`.
- Independently reproduced the normal control and all six hostile subject/domain
  combinations against current `rlportfoliobrief.js`.
- Confirmed cleanup after every process-local built-in mutation.
- Inventoried ten internal caller-keyed maps, the nested date set, and two
  caller-supplied lookup maps that must be handled together.
- Changed no product source, persistent test, parent Feature 008 scope, or
  parent root test plan.

## Completion Statement

The bug filing and independent reproduction are complete. The bug fix is not
implemented, persistent RED/GREEN tests have not been authored, and no delivery
or certification claim is made. Packet status remains `in_progress` and routes
to the owning design phase before test and implementation work.

## Test Evidence

### Before Fix Reproduction {#before-fix-reproduction}

**Phase:** bug
**Executed:** YES
**Command:** `timeout 120 node -e '<process-isolated normal plus subject/domain hostile-key matrix over committed modules and configs>'`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG-007 PROTOTYPE-SENSITIVE KEY PROBE
preProbeMutation=none
normal.ok=true
normal.laneOrder=held,watchlist,completedResearch,inferredRelevance
normal.subjectOrder=MSFT,BND,ZZTOP,semiconductors
normal.prototypeMutation=none
case=subjectId:__proto__ returned=false envelope=false caught=true error=TypeError:categoriesBySubject[key].indexOf is not a function mutation=Object.prototype cleanup=none
case=subjectId:constructor returned=false envelope=false caught=true error=TypeError:categoriesBySubject[key].indexOf is not a function mutation=Object cleanup=none
case=subjectId:toString returned=false envelope=false caught=true error=TypeError:categoriesBySubject[key].indexOf is not a function mutation=Object.prototype.toString cleanup=none
case=domain:__proto__ returned=false envelope=false caught=true error=TypeError:categoriesBySubject[key].indexOf is not a function mutation=Object.prototype cleanup=none
case=domain:constructor returned=false envelope=false caught=true error=TypeError:categoriesBySubject[key].indexOf is not a function mutation=Object cleanup=none
case=domain:toString returned=false envelope=false caught=true error=TypeError:categoriesBySubject[key].indexOf is not a function mutation=Object.prototype.toString cleanup=none
postProbeMutation=none
```

The exit code is zero because the diagnostic intentionally catches and records
each product throw so the complete six-case matrix and cleanup can execute. The
`returned=false`, `envelope=false`, `caught=true`, and mutation fields are the
failure signals.

### Root Cause And Map Inventory {#root-cause-map-inventory}

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** Current source inspection connects the executed mutations
and throws to ordinary-object inherited lookup. The exact inventory is recorded
in `design.md#complete-affected-inventory` and includes all ten internal
caller-keyed maps, the nested date set, and the latent `owners` and
`priorEvidenceIds` reads. Domain keys enter the same support loop independently
of subject keys, matching the executed domain matrix.

### TP-B007-000 {#tp-b007-000}

**Phase:** test
**Claim Source:** not-run
The persistent pre-fix RED carrier is not authored in this filing. It must be
created and executed by the test owner before any source change.

### TP-B007-001 {#tp-b007-001}

**Phase:** test
**Claim Source:** not-run
Normal and refusal compatibility execution is planned after the persistent
carrier exists.

### TP-B007-002 {#tp-b007-002}

**Phase:** test
**Claim Source:** not-run
The persistent subject-key matrix is not authored or executed in this filing.

### TP-B007-003 {#tp-b007-003}

**Phase:** test
**Claim Source:** not-run
The persistent domain-key matrix is not authored or executed in this filing.

### TP-B007-004 {#tp-b007-004}

**Phase:** test
**Claim Source:** not-run
The persistent cleanup and source-mutation control is not authored or executed
in this filing.

### TP-B007-005 {#tp-b007-005}

**Phase:** test
**Claim Source:** not-run
The scenario-specific browser regression is not authored or executed in this
filing.

### TP-B007-006 {#tp-b007-006}

**Phase:** test
**Claim Source:** not-run
The broader Feature 008 browser regression is reserved for post-implementation
execution.

### TP-B007-007 {#tp-b007-007}

**Phase:** test
**Claim Source:** not-run
The canonical repository selftest is reserved for post-implementation
execution.

### TP-B007-008 {#tp-b007-008}

**Phase:** bug
**Executed:** YES
**Claim Source:** executed
**Commands:**

- `timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys`
- `timeout 600 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys`
- `timeout 600 bash .github/bubbles/scripts/scenario-obligation-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys`
- `timeout 600 bash .github/bubbles/scripts/test-mechanism-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --repo-root .`
- `timeout 600 bash .github/bubbles/scripts/scope-context-fit-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys`

**Exit Codes:** `0, 0, 0, 0, 0`

```text
[artifact-lint] exit=0 lines=40 sha256=182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
[artifact-lint] Artifact lint PASSED.
[traceability] exit=0 lines=49 sha256=f556562a0fd3ea81ccd61831f903372224db59ac1fed94c049cb9c63e113ebc1
[traceability] Scenarios checked: 3; Test rows checked: 11; DoD fidelity mapped: 3 of 3
[traceability] RESULT: PASSED (0 warnings)
[scenario-obligation] initial exit=1 sha256=31485045a469e90e6ec7c0bc51e98ab2c21fb3fcbb3988682f41cc58f6e0a705
[scenario-obligation] initial finding=UNKNOWN-TRAIT compatibility, adversarial-input, shared-state-integrity
[scenario-obligation] rerun exit=0 lines=1 sha256=7dbb095c16f05c2fae19ae80055d1e32ce124c903ca0237729f2240ac973d146
[scenario-obligation] OK - 3 scenarios with a coherent derived obligation matrix
[test-mechanism] initial exit=1 sha256=a46725e6133ccd6efb5a40c2ef1768d3f771664e9b211406750b62053eb60920
[test-mechanism] initial finding=high-risk normal scenario required mutation rather than perturbed-input
[test-mechanism] rerun exit=0 lines=2 sha256=40a09fadd5507bc3e742ca138d1bc1de63a54e6aeb2fd09c530a97f7aa8a5207
[test-mechanism] OK - 3 declared mechanisms coherent with their scenario traits
[test-mechanism] mutationExecution adapter is none (inert)
[scope-context] exit=0 lines=1 sha256=7a84f3ca9c4d89bb763bfc95ee9d8247f3eb7fafed040311e53609f2ae6627d9
[scope-context] OK - all 1 scopes are self-contained for a fresh specialist
```

The two initial failures were repaired only in BUG-007 planning content. The
trait vocabulary now uses registered names, and the high-risk normal scenario
uses an in-memory `LANE_ORDER` source mutation. No risk tier was lowered and no
gate was bypassed.

### TP-B007-009 {#tp-b007-009}

**Phase:** validate
**Claim Source:** not-run
The transition guard is not a filing gate. It remains reserved for final
validate-owned certification after implementation, tests, and human acceptance.

## Code Diff Evidence

This is an artifact-only filing. The permitted diff is the new BUG-007 packet
directory. Product source, persistent tests, and parent Feature 008 planning
files are not part of the filing commit.

## Validation Evidence

**Executed:** NO
**Command:** Not run in the validate phase.
**Phase Agent:** `bubbles.validate`
**Claim Source:** not-run

Validate-owned certification is outside this filing. Status remains
`in_progress`.

## Audit Evidence

**Executed:** NO
**Command:** Not run in the audit phase.
**Phase Agent:** `bubbles.audit`
**Claim Source:** not-run

Audit is a later required bugfix-fastlane phase.

## Chaos Evidence

**Executed:** NO
**Command:** Not applicable to packet filing.
**Phase Agent:** `bubbles.chaos`
**Claim Source:** not-run

No runtime implementation exists in this packet to probe through chaos work.

## Discovered Issues

No second defect was filed. Fixed-vocabulary lookup maps outside the completion
subject/domain aggregation boundary were deliberately not reclassified as part
of `SEC-B006-S1`.

## RESULT-ENVELOPE

```yaml
outcome: route_required
currentOwner: bubbles.bug
nextRequiredOwner: bubbles.design
bug: BUG-007-compose-brief-prototype-sensitive-keys
addressedFindings:
  - SEC-B006-S1-FILING
unresolvedFindings:
  - SEC-B006-S1-IMPLEMENTATION
evidence:
  - report.md#before-fix-reproduction
reason: The defect is independently reproduced and fully packeted; design ownership must confirm the boundary before scenario-first persistent tests and source implementation.
```
