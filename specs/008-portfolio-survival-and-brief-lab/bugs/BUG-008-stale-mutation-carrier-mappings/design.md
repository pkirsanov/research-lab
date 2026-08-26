# Design: BUG-008 Stale Mutation Carrier Mappings

## Design Brief

### Current State

`tests/portfolio-test-integrity.unit.mjs` declares 18 audited mutation cases.
For every case it resolves one title on shipped source, applies one in-memory
source substitution, and runs the same title again.

The current shared injector coordination separates representation failures from
protective assertion failures. The operator-supplied current-session run then
reports one comprehensive registry failure with seven selected titles still
green.

### Target State

Every case has a causal title-to-behavior relationship. One selected title
passes on shipped source and fails through its own assertion after the mutation
is applied exactly once.

### Patterns To Follow

- Keep the current in-memory mutation registry and exact anchors.
- Reuse a genuinely protective existing title only after a mutation RED proves
  it.
- Add one focused assertion when no existing title protects the anchor.
- Keep assertion text specific enough to identify the represented behavior.
- Run each affected functional carrier directly before the full registry.

### Patterns To Avoid

- Do not count an applied marker as causal protection.
- Do not accept any infrastructure failure as mutation discrimination.
- Do not broaden product behavior to make a test fail.
- Do not delete, skip, baseline, or weaken a mutation case.
- Do not change BUG-007 or the parent Feature 008 transaction.

## Purpose And Scope

The design repairs one test-integrity capability. It changes the registry's
mapping and the smallest causal assertions in five functional carrier files.

No product source, public route, data file, configuration, package, or policy
changes.

## Root Cause Analysis

### Controlling Path

The comprehensive `SCN-008-054` test loops through `CASES`. For each entry it:

1. resolves the configured title on shipped source
2. applies the configured `find` and `replace` in memory
3. confirms that an application marker exists
4. runs the same title under the mutation
5. expects the selected title to fail

The injector repair removed a prior false RED caused by double representation.
Seven entries now reach step five with a green selected title. The mutation is
real, but the selected test does not observe the changed behavior.

### Why The Applied Marker Is Insufficient

The marker proves source representation only. It says nothing about which
branch the selected fixture reaches or what the selected assertions inspect.
A stale mapping can therefore report one applied mutation while its title
continues to pass.

### Mapping Analysis

| Finding | Exact current mutation anchor | Current selected title | Missing causal assertion | Narrow repair candidate |
| --- | --- | --- | --- | --- |
| `F008-CLEAR-TEST-001` | `else if (!reservedPersonalKey(stored.key))` | `Adversarial: full personal clear detects undeclared keys live state and arbitrary residue` | The title checks undeclared personal keys and retained controller residue. It does not assert the public-exclusion inventory. | Add an exact public-exclusion assertion to this carrier, or select another title only after a mutation RED proves it. |
| `F008-PATH-CONTRACT-001` | token workspace or scenario identity mismatch | `TP-22-02 chunk controller cancellation and supersession preserve the last valid result` | The fixture supersedes through controller token state. `tokenFailure()` can reject it even when the identity guard is removed. | Add a direct mismatched-token identity case that depends on the mutated guard. |
| `F008-SURVIVAL-PATH-001` | first session whose date is on or after `flow.date` | `TP-22-02 complete multi-path flow and distribution records survive a public JSON round trip` | The title checks that a cash-need event exists. It does not assert declared date, modeled date, session, or wealth timing. | Assert the exact scheduled session and resulting path effect for the dated need. |
| `F008-DIVERSIFICATION-001` | qualified `ForbesRigobonRequest/v1` dispatch | `TP-23-02 complete diversification projection survives JSON round trip with exact contracts` | The title checks the adjustment contract version, not the qualified path or adjusted result. | Assert the qualified adjustment state, orientation, and calculated value. |
| `F008-HEDGE-001` | aligned excess-return sample requirement | `TP-23-02 reduced or incomplete recompute refuses publication and preserves the last valid projection` | The title tests duplicate normal/stress samples and an incomplete cost. It never supplies a wrong hedge sample definition. | Add a non-aligned sample and assert the exact unavailable reason. |
| `F008-ALLOCATION-001` | `Array.isArray(constraints) ? constraints : []` | `TP-24-02 six complete candidates retain one basis costs paths survival and no winner` | The title permits several candidate states and does not assert a specific constraint breach. | First evaluate remapping to `TP-13-02 six production candidates share one frozen basis and keep their own states`, which asserts a specific infeasible cap. Keep it only if the mutation makes that title RED. |
| `F008-DOSSIER-001` | exact decision-fold keys and request version | `Adversarial: incomplete walk forward and mutable dossier records cannot satisfy the audit contract` | The title creates a complete fold and tests incomplete costs, immutable history, secrets, gesture, and storage corruption. It does not omit a required fold key or version. | Add a malformed decision-fold request and assert `request-invalid`. |

Current source inspection found each exact anchor at one controlling site. The
fix should preserve these anchors unless a test owner proves source drift.

## Fix Design

### Mapping-First Repair

For each entry, run the proposed existing title against shipped and mutated
source. Keep a remap only when the shipped run passes, the mutation applies
once, and the selected title fails through `ERR_ASSERTION`.

### Assertion-First Repair

If no existing title rejects the mutation, add one focused assertion to the
current owning carrier. The assertion must inspect the exact value or state
changed by the mutation.

Do not create a second mutation registry. The current `CASES` array remains the
single mapping authority.

### Failure Causality Contract

For every case, require all of these signals:

- shipped run discovers one test
- shipped run passes one test
- mutation marker records one application
- mutant run discovers one test
- mutant run fails one test
- TAP names the configured title as `not ok`
- failure carries `ERR_ASSERTION`
- output contains no injector, preload, setup, anchor, syntax, or module-load
  failure

### Exact Anchor Preservation

Do not modify the seven `find` or `replace` strings during the first repair.
If a candidate title remains green after adding the expected assertion, inspect
the fixture and controlling product path before changing the mutation.

### Change Containment

Allowed delivery paths:

- `tests/portfolio-test-integrity.unit.mjs`
- `tests/portfolio-privacy.functional.mjs`
- `tests/portfolio-paths.functional.mjs`
- `tests/portfolio-diversification.functional.mjs`
- `tests/portfolio-allocation.functional.mjs`
- `tests/portfolio-dossier.functional.mjs`
- this BUG-008 packet for phase-owned updates

Excluded delivery paths:

- product source and public assets
- `tests/portfolio-defect-injector.cjs`
- BUG-007
- parent Feature 008 scopes, reports, state, scenario manifest, and test plan
- unrelated tests and specifications

## Shared Infrastructure Impact Sweep

The mutation registry is shared by all audited Feature 008 findings. A mapping
repair can accidentally hide another case if title selection becomes broad or
ambiguous.

The full 18-case registry is the independent shared-infrastructure canary.
Marker cardinality, title discovery, and assertion-origin checks must remain
per case.

Rollback reverts only the registry and focused carrier assertions. No product
or persisted state restore applies.

## Consumer Impact Sweep

| Consumer | Required outcome |
| --- | --- |
| Scope 28 `SCN-008-054` | All 18 audited mutations are causally rejected. |
| Five affected functional carriers | Each remains green on shipped source and directly observes its represented behavior. |
| Feature 008 browser carriers | Existing user-visible behavior stays unchanged. |
| Canonical selftest | Registered repository invariants stay green without budget changes. |
| BUG-007 hardening | The injector coordination repair remains intact and unchanged. |

## Regression Design

### Persistent RED/GREEN

Use the comprehensive registry title as the persistent carrier. Record RED
before repair with all mutations applied and the seven mappings named. Run the
identical title after repair and require GREEN.

### Focused Functional Carriers

Run all five affected files directly. Each new or remapped assertion must be
visible in the carrier and must remain GREEN on shipped source.

### Full Registry

Run the complete `tests/portfolio-test-integrity.unit.mjs` file. It currently
contains three outer tests. The post-fix run must execute all three with no skip
or todo and no infrastructure error.

### Browser And Repository Regression

Run the affected Feature 008 browser carriers, then the complete Feature 008
browser matrix. Run `node scripts/selftest.mjs` afterward.

### Adversarial Integrity

Run the bugfix regression-quality guard across the registry and all five
functional carriers. Keep exact title discovery and the full mutation registry
as the non-tautology proof.

## Alternatives Considered

1. Treat any applied mutation as sufficient. Rejected because the seven green
   titles prove application and protection are different facts.
2. Remove the seven cases. Rejected because it would erase audited defect
   coverage rather than repair it.
3. Baseline the seven green results. Rejected because P23 requires the guard to
   fail when the represented defect exists.
4. Change product source to produce a different failure. Rejected because the
   runtime behavior is not the defect.
5. Rewrite the injector again. Rejected because current coordination exposes
   the stale mappings correctly.

## Complexity Tracking

None - the simplest viable fix is one proven title mapping or one focused
assertion per stale case.
