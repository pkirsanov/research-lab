# BUG-002 Scopes

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) |
[report.md](report.md) | [uservalidation.md](uservalidation.md)

Workflow mode: `bugfix-fastlane`. Single scope, single-file layout.

## Scope 1: Verify Canonical Fingerprints Before Dispatch

**Scope ID:** `01-verify-canonical-fingerprints-before-dispatch`
**Status:** In Progress
**Execution substate:** Implemented; independent verification pending
**Priority:** P0
**Depends On:** None
**Next owner:** `bubbles.implement`

### Goal

Reject every retained-digest request mutation before process, route, model, or
HTTP work while preserving all valid builder output bytes.

### Change Boundary

| Path | Authorized mutation |
| --- | --- |
| `scripts/brief-author.mjs` | Additive verifier export and pre-dispatch use in `invokeAuthor` only. |
| `scripts/brief-route-runtime.mjs` | Verifier import and call before route dispatch only. |
| `scripts/brief-openai-compatible-adapter.mjs` | Verifier import and call before model or HTTP work only. |
| `tests/brief-openai-compatible-adapter.functional.mjs` | The exact TP-01-10 test and helpers used only by TP-01-10. |
| `tests/brief-openai-compatible-adapter.local-canary.mjs` | Canonical builder use and verification assertions only. |
| `scripts/selftest.mjs` | Feature 030 fingerprint verifier and byte-invariance assertions only. |
| `specs/030-budget-aware-hybrid-brief-generation/bugs/BUG-002-author-request-fingerprint-pre-dispatch-verification/**` | BUG-002 artifacts and execution evidence. |

The shared selftest and functional files also carry BUG-001 work. Implementers
must keep BUG-002 changes inside fingerprint assertions and the TP-01-10 block.

Excluded surfaces include `rlbriefroute.js`, request-builder behavior,
canonical projection fields, constants, generated request bytes, every
production consumer, provider reroute, scheduler and public artifacts, parent
planner artifacts, BUG-001 artifacts, BUG-022 artifacts, and framework files.

### Gherkin Scenario

```gherkin
Feature: BUG-002 canonical author-request integrity

  Scenario: SCN-030-003 Retained fingerprint mutations refuse before every dispatch boundary
    Given a canonical builder produced a frozen author request and fingerprint
    When one canonical field is changed while the original digest is retained
    Then invokeAuthor refuses before callback or child spawn
    And the route runtime refuses before route dispatch
    And the adapter refuses before model preflight or HTTP
    And no provider reroute or authoritative state change occurs
```

### Implementation Plan

1. Add the exact TP-01-10 mutation matrix to the existing functional carrier.
2. Run the exact TP-01-10 command before changing the three source modules and retain RED.
3. Export the additive verifier from `brief-author.mjs` over its private algorithm.
4. Invoke the verifier before side effects in author, route, and adapter modules.
5. Run the unchanged TP-01-10 command and retain GREEN.
6. Add focused selftest assertions for valid requests and byte invariance.
7. Update the two canaries to use existing canonical builders.
8. Run both provider canaries last and then the broader Feature 030 sequence.

### Test Plan

| ID | Parent row | Test type | Category | Planned file | Exact title or assertion | Exact command | Live system |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-10 | TP-01-10 | functional | security | `tests/brief-openai-compatible-adapter.functional.mjs` | `Security regression: SCN-030-003 retained request fingerprint mutation refuses before process transport or HTTP dispatch` | `node --test --test-name-pattern "Security regression: SCN-030-003 retained request fingerprint mutation refuses before process transport or HTTP dispatch" tests/brief-openai-compatible-adapter.functional.mjs` | Yes; production boundaries with callback, spawn, and loopback counters |
| TP-B002-02 | TP-01-01 | unit | unit | `scripts/selftest.mjs` | Feature 030 verifier reuses canonical request identity and preserves builder bytes | `node scripts/selftest.mjs` | No |
| TP-B002-03 | TP-01-04 | Regression E2E | integration | `tests/brief-openai-compatible-adapter.local-canary.mjs` | OMLX uses a canonically built and verified request before external work | `/usr/bin/env BRIEF_SHADOW_PROFILE=omlx-openai-compatible-qwen38 BRIEF_OMLX_BASE_URL="${BRIEF_OMLX_BASE_URL:?required for OMLX canary}" node --test --test-name-pattern "Regression E2E: SCN-030-002 OMLX" tests/*.local-canary.mjs` | Yes; actual configured OMLX endpoint |
| TP-B002-04 | TP-01-05 | Regression E2E | integration | `tests/brief-openai-compatible-adapter.local-canary.mjs` | Ollama uses a canonically built and verified request before external work | `/usr/bin/env BRIEF_SHADOW_PROFILE=ollama-openai-compatible BRIEF_OLLAMA_BASE_URL="${BRIEF_OLLAMA_BASE_URL:?required for Ollama canary}" BRIEF_OLLAMA_MODEL="${BRIEF_OLLAMA_MODEL:?required for Ollama canary}" node --test --test-name-pattern "Regression E2E: SCN-030-002 Ollama" tests/*.local-canary.mjs` | Yes; actual configured Ollama endpoint and model |

### Definition of Done

- [x] SCN-030-003 refuses every retained-digest field mutation before process, route, model, or HTTP work with all side-effect counters at zero.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** [TP-01-10 GREEN](report.md#tp-01-10-green), capture `0f08ca473558f5998247749534cb4387be0543c5fd8e2fdcc377211e913af0d2`.

- [x] TP-01-10 records same-command RED before any BUG-002 source mutation.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** [TP-01-10 RED](report.md#tp-01-10-red), capture `a355f2d551cff67f17a555f3d82eaee540e50bf03a0a12de6c96d45f2e9c22da`.

- [x] FR-B002-01 through FR-B002-09 are implemented at all three dispatch boundaries.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** TP-01-10 GREEN proves zero callback, child, model-list, and chat calls for all eight mutations.

- [x] Existing builders, canonical projection, constants, and generated request bytes remain unchanged.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Current-versus-`HEAD` canonical builder comparison passed for tool-v1, tool-v2, and final-v1, capture `4a7c13b6efc2f0617b302fcceef399241d02db0054f1c90e5c5ed8b474f61e7f`.

- [x] TP-01-10 passes after the repair for eight fields at three boundaries with zero side-effect counters.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** [TP-01-10 GREEN](report.md#tp-01-10-green), exit 0 with 1 pass and 0 skips.

- [ ] TP-B002-02 passes with verifier and byte-invariance assertions in the canonical selftest.
  > **Uncertainty Declaration**
  > **What was attempted:** The existing Feature 030 selftest block was inspected.
  > **What was observed:** It does not import or exercise a canonical verification export.
  > **Why this is uncertain:** The export and assertions are not authored.
  > **What would resolve this:** Add the focused assertions and run `node scripts/selftest.mjs`.

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Final OMLX and Ollama canaries passed with canonically built and verified requests; captures `a8ebaaea00d344f5806fa3b470a15199adbc06f5ca01292cdca0c33f4d976aa7` and `09791d35e6ee1d14efce5bcc20e9259e0e6376df6e2b669cb232f5457c4bea7a`.

- [ ] Broader E2E regression suite passes
  > **Uncertainty Declaration**
  > **What was attempted:** No broader behavior suite was run in this artifact-only invocation.
  > **What was observed:** Parent request-integrity and provider evidence is invalidated by F030-SEC-02.
  > **Why this is uncertain:** The fixed revision does not exist.
  > **What would resolve this:** Run the complete Feature 030 sequence declared by the parent plan.

- [x] The regression contains no bailout, skip, only, todo, or self-validating path.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Bugfix regression-quality guard reported 0 violations and 0 warnings, capture `cabb97687d0e23cb4f0763c17cda2fd15acb2fb7a677d6c089b024b702d2ac1e`.

- [x] Zero production consumers exist and every provider refusal remains fail-loud without rerouting.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Static secret/authority/consumer scan passed, capture `378640f146262bc959636137e8503d01434f733b1f5b604f5b284df4fa5f0547`; TP-01-10 retained zero alternate calls.

- [x] The changed-path set contains only the BUG-002 boundary and preserves all excluded surfaces.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Strict parent/bug boundary capture `149717e2bbd52b646b3273b0b6ed84d47c8e5b21bb6d80e3fe017427d46989a7`; final protected and worktree capture `3c0cc5daa613a8a83894ea0d6eb62668103ef6f9b967baeb3c08a87006979910`.

- [x] Artifact, schema, and traceability checks pass after implementation evidence is recorded.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Artifact lint capture `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567`, traceability capture `00ad700b4e1e3321bf7f9fb6105590ed7d80be4541a21ee363a2147c41bc6d78`, and schema capture `cd75a3eb48744a61f7ef7eb2221b6afffe916d68248f821f81b314fe98a917a7`.
