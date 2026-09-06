# BUG-001 Scopes

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) |
[report.md](report.md) | [uservalidation.md](uservalidation.md)

Workflow mode: `bugfix-fastlane`. Single scope, single-file layout.

## Scope 1: Enforce Safe Token Usage Arithmetic

**Scope ID:** `01-enforce-safe-token-usage-arithmetic`
**Status:** In Progress
**Execution substate:** Implemented; independent verification pending
**Priority:** P0
**Depends On:** None
**Next owner:** `bubbles.implement`

### Goal

Make every present token count and every computed token sum safely
representable before Feature 030 returns a normalized usage receipt.

### Change Boundary

| Path | Authorized mutation |
| --- | --- |
| `rlbriefroute.js` | Safe-integer field admission, overflow-before-addition, safe-sum validation, and existing consistency comparison only. |
| `scripts/selftest.mjs` | Feature 030 safe-integer receipt assertions only. |
| `tests/brief-openai-compatible-adapter.functional.mjs` | The exact TP-01-09 test and helpers used only by TP-01-09. |
| `specs/030-budget-aware-hybrid-brief-generation/bugs/BUG-001-unsafe-token-usage-normalization/**` | BUG-001 artifacts and execution evidence. |

The shared selftest and functional files also carry BUG-002 work. Implementers
must keep BUG-001 changes inside the safe-integer assertions and TP-01-09 block.

Excluded surfaces include every route, provider, model, endpoint, profile,
policy, scheduler, public artifact, production consumer, parent planner
artifact, BUG-002 artifact, BUG-022 artifact, and framework-managed file.

### Gherkin Scenario

```gherkin
Feature: BUG-001 safe token usage normalization

  Scenario: SCN-030-002 Unsafe token counts and overflow refuse before normalized usage
    Given provider usage contains safe, unsafe, missing, and null token fields
    When the production normalizer validates fields and derives any measured sum
    Then each present count is a non-negative safe integer
    And prompt plus completion overflow refuses before addition
    And an independently safe provider total must match the safe computed sum
    And missing or null values remain unmeasured without a synthesized zero or total
```

### Implementation Plan

1. Add the exact TP-01-09 case matrix to the existing functional carrier.
2. Run the exact TP-01-09 command before changing `rlbriefroute.js` and retain RED.
3. Strengthen provider and receipt dimensions to require non-negative safe integers.
4. Add the maximum-minus-completion guard before computing the sum.
5. Run the unchanged TP-01-09 command and retain GREEN.
6. Run the Feature 030 selftest assertions and broader repository selftest.
7. Run the two existing provider canaries last without changing provider selection.

### Test Plan

| ID | Parent row | Test type | Category | Planned file | Exact title or assertion | Exact command | Live system |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-09 | TP-01-09 | functional | security | `tests/brief-openai-compatible-adapter.functional.mjs` | `Security regression: SCN-030-002 unsafe token counts and overflow refuse before normalized usage` | `node --test --test-name-pattern "Security regression: SCN-030-002 unsafe token counts and overflow refuse before normalized usage" tests/brief-openai-compatible-adapter.functional.mjs` | No; provider-free production normalizer |
| TP-B001-02 | TP-01-01 | unit | unit | `scripts/selftest.mjs` | Feature 030 safe-integer usage boundaries remain registered in the canonical selftest | `node scripts/selftest.mjs` | No |
| TP-B001-03 | TP-01-04 | Regression E2E | integration | `tests/brief-openai-compatible-adapter.local-canary.mjs` | Existing OMLX canary returns a truthful safe-integer usage state | `/usr/bin/env BRIEF_SHADOW_PROFILE=omlx-openai-compatible-qwen38 BRIEF_OMLX_BASE_URL="${BRIEF_OMLX_BASE_URL:?required for OMLX canary}" node --test --test-name-pattern "Regression E2E: SCN-030-002 OMLX" tests/*.local-canary.mjs` | Yes; actual configured OMLX endpoint |
| TP-B001-04 | TP-01-05 | Regression E2E | integration | `tests/brief-openai-compatible-adapter.local-canary.mjs` | Existing Ollama canary returns a truthful safe-integer usage state | `/usr/bin/env BRIEF_SHADOW_PROFILE=ollama-openai-compatible BRIEF_OLLAMA_BASE_URL="${BRIEF_OLLAMA_BASE_URL:?required for Ollama canary}" BRIEF_OLLAMA_MODEL="${BRIEF_OLLAMA_MODEL:?required for Ollama canary}" node --test --test-name-pattern "Regression E2E: SCN-030-002 Ollama" tests/*.local-canary.mjs` | Yes; actual configured Ollama endpoint and model |

### Definition of Done

- [x] SCN-030-002 refuses every unsafe or overflowing token measurement while missing and `null` fields remain unmeasured without synthesized numeric values.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** [TP-01-09 GREEN](report.md#tp-01-09-green), capture `68e7050d53bf8cd21c57b3358d820e027884ee40a5551e14662b8ec8dd2c1241`.

- [x] TP-01-09 records same-command RED before any BUG-001 source mutation.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** [TP-01-09 RED](report.md#tp-01-09-red), capture `d70a3ef787c2505d9816b4610fd55dc7f9e8d12e0403053f48631e40c1e3a4f0`.

- [x] FR-B001-01 through FR-B001-08 are implemented in `rlbriefroute.js`.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** TP-01-09 GREEN plus the passing SCN-030-002 functional and stress checks in [BUG-001 Post-Fix Checks](report.md#bug-001-post-fix-checks).

- [x] TP-01-09 passes after the repair with every adversarial case active.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** [TP-01-09 GREEN](report.md#tp-01-09-green), exit 0 with 1 pass and 0 skips.

- [ ] TP-B001-02 passes with safe-integer assertions in the canonical selftest.
  > **Uncertainty Declaration**
  > **What was attempted:** The existing Feature 030 selftest block was inspected.
  > **What was observed:** It covers ordinary measured, missing, and inconsistent values only.
  > **Why this is uncertain:** The unsafe and overflow assertions are not authored.
  > **What would resolve this:** Add the focused assertions and run `node scripts/selftest.mjs`.

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Final OMLX and Ollama canaries passed on fixed bytes; captures `a8ebaaea00d344f5806fa3b470a15199adbc06f5ca01292cdca0c33f4d976aa7` and `09791d35e6ee1d14efce5bcc20e9259e0e6376df6e2b669cb232f5457c4bea7a`.

- [ ] Broader E2E regression suite passes
  > **Uncertainty Declaration**
  > **What was attempted:** No broader behavior suite was run in this artifact-only invocation.
  > **What was observed:** Existing parent evidence is invalidated where usage truth changed.
  > **Why this is uncertain:** The fixed revision does not exist.
  > **What would resolve this:** Run the complete Feature 030 sequence declared by the parent plan.

- [x] The regression contains no bailout, skip, only, todo, or self-validating path.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Bugfix regression-quality guard reported 0 violations and 0 warnings, capture `cabb97687d0e23cb4f0763c17cda2fd15acb2fb7a677d6c089b024b702d2ac1e`.

- [x] The changed-path set contains only the BUG-001 boundary and preserves all excluded surfaces.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Strict parent/bug boundary capture `149717e2bbd52b646b3273b0b6ed84d47c8e5b21bb6d80e3fe017427d46989a7`; final protected and worktree capture `3c0cc5daa613a8a83894ea0d6eb62668103ef6f9b967baeb3c08a87006979910`.

- [x] Artifact, schema, and traceability checks pass after implementation evidence is recorded.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Artifact lint capture `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567`, traceability capture `00ad700b4e1e3321bf7f9fb6105590ed7d80be4541a21ee363a2147c41bc6d78`, and schema capture `cd75a3eb48744a61f7ef7eb2221b6afffe916d68248f821f81b314fe98a917a7`.
