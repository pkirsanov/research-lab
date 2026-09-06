# Report: BUG-002 Author Request Fingerprint Pre-Dispatch Verification

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) |
[scopes.md](scopes.md) | [uservalidation.md](uservalidation.md)

## Summary

This artifact-only invocation creates the feature-bound packet for
`F030-SEC-02`. It records the missing canonical equality check, the additive
three-module repair boundary, and the TP-01-10 RED/GREEN contract.

No production source, test carrier, parent Feature 030 artifact, BUG-022
artifact, framework file, public artifact, or scheduler file is changed by this
packet.

## Completion Statement

The defect remains open. Scope 1 is Not Started, packet status is
`in_progress`, certification is `in_progress`, and every DoD item is unchecked.
This report claims only bug-packet authorship and packet-level checks executed
after creation.

## Test Evidence

### Inherited RED Context

**Phase:** bug
**Executed:** NO
**Claim Source:** not-run

The security handoff reports that a builder-generated request retained its
digest after `data.compactedRead.observationRef` changed, reached `/v1/models`
and `/v1/chat/completions`, and returned `ok: true`. This invocation treats that
result as diagnostic input only and does not present it as current evidence.

### RED And GREEN Plan

**Phase:** bug
**Executed:** NO
**Claim Source:** not-run

The next owner must add the exact TP-01-10 title and execute this same command
before and after the source repair:

`node --test --test-name-pattern "Security regression: SCN-030-003 retained request fingerprint mutation refuses before process transport or HTTP dispatch" tests/brief-openai-compatible-adapter.functional.mjs`

No RED or GREEN result is claimed here.

## Code Diff Evidence

**Phase:** bug
**Executed:** NO
**Claim Source:** not-run

This invocation does not edit production or test code. The implementation owner
must later prove that only the allowed source and focused test hunks changed.

## Packet Validation Evidence

**Phase:** bug
**Claim Source:** executed

### Artifact Lint

**Executed:** YES
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 300 /opt/homebrew/bin/bash .github/bubbles/scripts/artifact-lint.sh specs/030-budget-aware-hybrid-brief-generation/bugs/BUG-002-author-request-fingerprint-pre-dispatch-verification`
**Exit Code:** 0
**Receipt SHA-256:** `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567`

```text
# BUG-002 final packet artifact lint
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ No forbidden sidecar artifacts present
✅ Found DoD section in scopes.md
✅ scopes.md DoD contains checkbox items
✅ All DoD bullet items use checkbox syntax in scopes.md
✅ Found Checklist section in uservalidation.md
✅ uservalidation checklist contains checkbox entries
✅ All checklist bullet items use checkbox syntax
✅ uservalidation separates automation readiness from human acceptance
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: bugfix-fastlane
✅ state.json v3 has required field: status
✅ state.json v3 has required field: execution
✅ state.json v3 has required field: certification
✅ state.json v3 has required field: policySnapshot
✅ state.json v3 has recommended field: transitionRequests
✅ state.json v3 has recommended field: reworkQueue
✅ state.json v3 has recommended field: executionHistory
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ report.md contains section matching: ###[[:space:]]+Summary|^##[[:space:]]+Summary
✅ report.md contains section matching: ###[[:space:]]+Completion Statement|^##[[:space:]]+Completion Statement
✅ report.md contains section matching: ###[[:space:]]+Test Evidence|^##[[:space:]]+Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ Value-first selection rationale lint skipped (not a value-first report)
✅ Scenario path-placeholder lint skipped (no matching scenario sections found)

=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
```

### Scenario Manifest Schema

**Executed:** YES
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 120 /usr/local/bin/python3 -c 'import json,sys; from jsonschema import Draft7Validator; schema=json.load(open(sys.argv[1])); target=json.load(open(sys.argv[2])); errors=list(Draft7Validator(schema).iter_errors(target)); print("SCHEMA="+sys.argv[1]); print("TARGET="+sys.argv[2]); print("SCHEMA_ERRORS="+str(len(errors))); print("SCHEMA_RESULT="+("PASS" if not errors else "FAIL")); [print("ERROR="+error.message) for error in errors]; sys.exit(1 if errors else 0)' .github/bubbles/schemas/scenario-manifest.schema.json specs/030-budget-aware-hybrid-brief-generation/bugs/BUG-002-author-request-fingerprint-pre-dispatch-verification/scenario-manifest.json`
**Exit Code:** 0
**Receipt SHA-256:** `317e976585b8f8fbafd626a0b50300d1374901d25648d5961193a019bbefc5d0`

```text
# BUG-002 scenario manifest schema
exit: 0
lines: 4
sha256: 317e976585b8f8fbafd626a0b50300d1374901d25648d5961193a019bbefc5d0
--- output ---
SCHEMA=.github/bubbles/schemas/scenario-manifest.schema.json
TARGET=specs/030-budget-aware-hybrid-brief-generation/bugs/BUG-002-author-request-fingerprint-pre-dispatch-verification/scenario-manifest.json
SCHEMA_ERRORS=0
SCHEMA_RESULT=PASS
```

### Traceability

**Executed:** YES
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 480 /opt/homebrew/bin/bash .github/bubbles/scripts/traceability-guard.sh specs/030-budget-aware-hybrid-brief-generation/bugs/BUG-002-author-request-fingerprint-pre-dispatch-verification --all-scopes`
**Exit Code:** 0
**Receipt SHA-256:** `fc2946debfe745c1e5d292cee7e9a68fcc957d4baf406124d0588b5dab17987f`

```text
# BUG-002 packet traceability
exit: 0
lines: 37
sha256: fc2946debfe745c1e5d292cee7e9a68fcc957d4baf406124d0588b5dab17987f
--- output ---
============================================================
  BUBBLES TRACEABILITY GUARD
  Feature: ~/research-lab/specs/030-budget-aware-hybrid-brief-generation/bugs/BUG-002-author-request-fingerprint-pre-dispatch-verification
  Timestamp: 2026-09-03T12:45:55Z
============================================================

--- Scenario Manifest Cross-Check (G057/G059) ---
✅ scenario-manifest.json covers 1 scenario contract(s)
✅ scenario-manifest.json linked test exists: tests/brief-openai-compatible-adapter.functional.mjs
✅ scenario-manifest.json linked test exists: scripts/selftest.mjs
✅ scenario-manifest.json linked test exists: tests/brief-openai-compatible-adapter.local-canary.mjs
✅ scenario-manifest.json linked test exists: tests/brief-openai-compatible-adapter.local-canary.mjs
✅ scenario-manifest.json records evidenceRefs for all 1 scenario contract(s)
✅ All linked tests from scenario-manifest.json exist

ℹ️  Checking traceability for Scope 1: Verify Canonical Fingerprints Before Dispatch
✅ Scope 1: Verify Canonical Fingerprints Before Dispatch scenario mapped to Test Plan row: SCN-030-003 Retained fingerprint mutations refuse before every dispatch boundary
ℹ️  Scope 1: Verify Canonical Fingerprints Before Dispatch scenario→row match confidence: declared
✅ Scope 1: Verify Canonical Fingerprints Before Dispatch scenario maps to concrete test file: tests/brief-openai-compatible-adapter.functional.mjs
✅ Scope 1: Verify Canonical Fingerprints Before Dispatch report references concrete test evidence: tests/brief-openai-compatible-adapter.functional.mjs
ℹ️  Scope 1: Verify Canonical Fingerprints Before Dispatch summary: scenarios=1 test_rows=5

--- Gherkin → DoD Content Fidelity (Gate G068) ---
✅ Scope 1: Verify Canonical Fingerprints Before Dispatch scenario maps to DoD item: SCN-030-003 Retained fingerprint mutations refuse before every dispatch boundary
ℹ️  Scope 1: Verify Canonical Fingerprints Before Dispatch scenario→DoD match confidence: declared
ℹ️  DoD fidelity: 1 scenarios checked, 1 mapped to DoD, 0 unmapped

--- Traceability Summary ---
ℹ️  Scenarios checked: 1
ℹ️  Test rows checked: 5
ℹ️  Scenario-to-row mappings: 1
ℹ️  Concrete test file references: 1
ℹ️  Report evidence references: 1
ℹ️  DoD fidelity scenarios: 1 (mapped: 1, unmapped: 0)
ℹ️  Edge confidence (IMP-015 Scope B): declared=2 inferred=0 ambiguous=0

RESULT: PASSED (0 warnings)
```

These checks validate packet structure, schema, and traceability only. They do
not validate the defect repair or satisfy any unchecked DoD item.

## Validation Evidence

**Executed:** NO
**Phase Agent:** bubbles.validate
**Claim Source:** not-run

No certification validation was requested or performed.

## Audit Evidence

**Executed:** NO
**Phase Agent:** bubbles.audit
**Claim Source:** not-run

No independent audit was requested or performed.

## Chaos Evidence

**Executed:** NO
**Phase Agent:** bubbles.chaos
**Claim Source:** not-run

No chaos phase applies to packet creation.

## Implementation Evidence - 2026-09-03

### TP-01-10 RED

**Phase:** implement
**Executed:** YES (current session)
**Claim Source:** executed
**Exit Code:** 1
**Capture SHA-256:** `a355f2d551cff67f17a555f3d82eaee540e50bf03a0a12de6c96d45f2e9c22da`

```text
# BUG-002 TP-01-10 RED before source repair
$ node --test --test-name-pattern Security regression: SCN-030-003 retained request fingerprint mutation refuses before process transport or HTTP dispatch tests/brief-openai-compatible-adapter.functional.mjs
exit: 1
lines: 29
sha256: a355f2d551cff67f17a555f3d82eaee540e50bf03a0a12de6c96d45f2e9c22da
--- output ---
✖ Security regression: SCN-030-003 retained request fingerprint mutation refuses before process transport or HTTP dispatch
ℹ tests 1
ℹ pass 0
ℹ fail 1
AssertionError [ERR_ASSERTION]: contractVersion stale fingerprint reached the transport callback
1 !== 0
```

The exact planned test failed because the retained digest reached a transport
callback. No fingerprint-verification source had changed when this RED ran.

### TP-01-10 GREEN

**Phase:** implement
**Executed:** YES (current session)
**Claim Source:** executed
**Exit Code:** 0
**Capture SHA-256:** `0f08ca473558f5998247749534cb4387be0543c5fd8e2fdcc377211e913af0d2`

```text
# BUG-002 TP-01-10 GREEN with canonical fixtures
$ node --test --test-name-pattern Security regression: SCN-030-003 retained request fingerprint mutation refuses before process transport or HTTP dispatch tests/brief-openai-compatible-adapter.functional.mjs
exit: 0
lines: 9
sha256: 0f08ca473558f5998247749534cb4387be0543c5fd8e2fdcc377211e913af0d2
--- output ---
✔ Security regression: SCN-030-003 retained request fingerprint mutation refuses before process transport or HTTP dispatch
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

The matrix retains the builder-generated digest while independently mutating
`contractVersion`, `data`, `provider`, `model`, `promptPolicy`, `schema`,
`validator`, and `maxOutputTokens`. Every mutation refuses before transport
callback, child spawn, route model-list, route chat, adapter model-list, and
adapter chat counters.

### Builder And Existing Boundary Preservation

**Phase:** implement
**Claim Source:** executed

- Current and `HEAD` canonical tool-v1, tool-v2, and final-v1 builder outputs are byte-identical and have identical fingerprints. Verification is nonmutating. Capture: `4a7c13b6efc2f0617b302fcceef399241d02db0054f1c90e5c5ed8b474f61e7f`.
- The established tool-v1, tool-v2, and final-v1 author-boundary files passed 11 tests with zero failures or skips. Capture: `14311ea0042b07f05c66e13558fa17cebf6a608f7f25064fd2b687ceeb66bdee`.
- The complete Feature 030 functional suite passed 6 tests with zero failures or skips. Capture: `73dd73d41d56dcf4271cf60efd79e5ea3cd9108df5069bcdd941c6bc5ea52388`.
- The strict parent and bug work-boundary matrix passed. Capture: `149717e2bbd52b646b3273b0b6ed84d47c8e5b21bb6d80e3fe017427d46989a7`.
- Static secret, authority, and production-consumer checks passed. Capture: `378640f146262bc959636137e8503d01434f733b1f5b604f5b284df4fa5f0547`.
- Bugfix regression-quality checks reported zero violations and warnings. Capture: `cabb97687d0e23cb4f0763c17cda2fd15acb2fb7a677d6c089b024b702d2ac1e`.

### Real Provider Results

**Phase:** implement
**Claim Source:** executed

The first Ollama run reached the selected provider but returned the closed
`completion-message-shape` refusal. The canary then placed the same bounded
candidate object inside the canonical builder's frozen data. It did not change
the provider, model, endpoint, production prompt, host, or committed timeout.

- Final OMLX canary: exit 0, capture `a8ebaaea00d344f5806fa3b470a15199adbc06f5ca01292cdca0c33f4d976aa7`.
- Final Ollama canary: exit 0, capture `09791d35e6ee1d14efce5bcc20e9259e0e6376df6e2b669cb232f5457c4bea7a`.
- The complete selftest executed and the Feature 030 canonical-verifier assertion passed. The command exited 1 only because the unrelated operations packet references three missing tests; diagnostic capture `020a5bcbfd6e00c0826dbb9eeb7c3d965078c4cc828179c60e41cd8e1b6cc6e4`.

BUG-002 is implementation-complete but nonterminal. Independent test,
security, validation, and audit remain outside this implementation claim.

### Final Artifact And Boundary Checks

**Phase:** implement
**Claim Source:** executed

- Parent and both bug traceability guards passed on final artifacts; capture `00ad700b4e1e3321bf7f9fb6105590ed7d80be4541a21ee363a2147c41bc6d78`.
- Both bug scenario manifests passed the installed schema; capture `cd75a3eb48744a61f7ef7eb2221b6afffe916d68248f821f81b314fe98a917a7`.
- Final worktree classification, protected hashes, Git index, `git diff --check`, framework boundary, and unchanged BUG-022 diff passed; capture `3c0cc5daa613a8a83894ea0d6eb62668103ef6f9b967baeb3c08a87006979910`.
- The external scheduler status receipt changed independently; its publish acknowledgment remained unchanged. No scheduler artifact was restored or authored.

## Independent Test Verification - 2026-09-03

**Phase:** test
**Executed:** YES
**Claim Source:** executed
**Repository HEAD:** `eba665b8ee5569b2bb14c4ab6f868cb7636788c8`
**Implementation SHA-256:** `scripts/brief-author.mjs` = `e3e30ee35cafed5d1560210bcdd8120f362792021aa9a79fc0c9f033a701bc4c`
**Route SHA-256:** `scripts/brief-route-runtime.mjs` = `14ded75f26a20b267cd15815973e8ebcb5321be9e08fd23ecaa082219712225e`
**Adapter SHA-256:** `scripts/brief-openai-compatible-adapter.mjs` = `1a2e6047b136d70c9feece8c236646790712e2b96d4edb135dcd2584d8f5aac2`
**Test SHA-256:** `tests/brief-openai-compatible-adapter.functional.mjs` = `60e66ee75a52d8b7ba1b0ef8c5af272adb02f9cb56bde5f06d6b8ea05e88517f`

### TP-01-10 Current-Byte Proof

**Command:** `node --test --test-name-pattern "Security regression: SCN-030-003 retained request fingerprint mutation refuses before process transport or HTTP dispatch" tests/brief-openai-compatible-adapter.functional.mjs`
**Exit Code:** 0
**Capture SHA-256:** `c7efd6ed006d15689386f40979718e0abaeeb95d083e1363105686531a338cea`

```text
✔ Security regression: SCN-030-003 retained request fingerprint mutation refuses before process transport or HTTP dispatch (8.60675ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 65.662833
```

The current test source and executed test jointly prove the full matrix. The
test independently mutates `contractVersion`, `data`, `provider`, `model`,
`promptPolicy`, `schema`, `validator`, and `maxOutputTokens` while retaining the
builder-generated digest. Each mutation must leave transport callback, child
spawn, route model-list, route chat, adapter model-list, and adapter chat counts
unchanged. The final counter assertion requires `{ childSpawn: 0, modelList: 0,
chat: 0 }`. The matrix audit found all eight mutations and all seven guard
assertions. Capture: `5648f82374ffd3d795c7630700caecd4b6a938bcabdfa3ff886781994b55b450`.

### Broader Current-Byte Proof

- The complete Feature 030 functional carrier passed 6 of 6 with zero failures, skips, or todos. Capture: `bfeee28a8e522ee7b7097e41254aae99c54a3f14f83e9dba8195a360d30b53ec`.
- The established tool-author v1, tool-author v2, and final-author v1 boundary matrix passed 11 of 11. Capture: `c6675a162addac45b36c542e2993ffecbef309c597636a2a86e65e705feadc85`.
- The exact OMLX Test Plan command passed in 69 seconds. Capture: `bdb8952781aff8368da66e37546507a7a11e37511bd89a55d2c02a431593f035`.
- The exact Ollama Test Plan command passed with `qwen3.8:27b` in 5 seconds. Capture: `c1432481e4e2b0bf3d68bee451afc73fdf55bfb9503c43b8564a172da4257bcb`.
- The full selftest executed 3,476 assertions and ended with 3,475 passed and 1 failed. All nine Feature 030 assertions passed. The sole failure was the unrelated spec-test-path ratchet. Capture: `de31f97ceb3ca6332e76ce86423b207df80d59bf515e924064d9f2d0d3367ccd`.
- The canonical path validator attributed that failure only to three absent files referenced by `specs/_ops/OPS-integrate-research-lab-main`. Capture: `0a3919c2dfe9cef1d55029c36609528d90adf2b271cda8630074f232d12accb2`.
- The bugfix regression-quality guard reported 0 violations and 0 warnings. Capture: `3d713fe6e6d128e53c2e641125bb8304089031e8caf58e3e5364cf618805f591`.

### Governance And Containment

- BUG-002 artifact lint, test-mechanism lint, linked-test resolution, and traceability passed. The scenario manifest also passed the installed JSON Schema. Captures: `ed0b33223d36ef4e26e03d38c1d5a9c068def11c9fe8a7d312e904c5d2937808` and `82e033f9418a7f8c72192df6bc89bcf6a1e2a6291aab1b8ac49f0b8f91760943`.
- Contract-aware structured Test Plan parity passed all 4 rows. Capture: `cb9adefcd4b8e615bd6c474c17dbc960c6158edc25429e2b04f54bf34aac1a66`.
- `scenario-obligation-lint.sh` reported one planner-owned contract gap: the declared `pure-calculation` and `dependency-path` traits have no obligation entries. Capture: `aa025c5577649ac300320079f7bfa67b9d554b0fcadd8d39e8bda8618c91d475`. This test phase did not edit the planner-owned obligation matrix.
- The focused secret/authority/consumer scan, repository security gate, and PII scanner all passed with zero findings. Captures: `528b7727de64bfcba2c3b683faba26f68d3969fb63c0135b3bd77eb8794d1d43`, `14d80232634c77bab4df436f05fdf729728159ed575b8eb4d9d1705904f0b135`, and `afb48caff79d25e811ee5fbb9822db8ed960570a19cfe8eb959f4f48010e153f`.
- All implementation, test, protected production, public, BUG-022, OPS, Git index, branch, and HEAD bytes matched their pre-edit baselines. The scheduler receipt advanced independently; its publish acknowledgment stayed byte-identical. Capture: `43062956f0d1161ea1e17e0503eacae99ea67896697303e0a926c46cee20dfb0`.

### Test Verdict

`F030-SEC-02` is independently verified on the exact bytes identified above.
BUG-002 remains `in_progress`; no scope completion, certification, validation,
audit, commit, or push is claimed. Security review is the next owner action.
