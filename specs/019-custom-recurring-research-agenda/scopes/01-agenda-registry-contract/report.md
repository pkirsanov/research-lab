# Scope 1 Execution Report - Agenda Foundation And Topic Definitions

## Summary

Scope 1 adds the committed topic-neutral agenda contract, one UMD owner, three
initial public topics, the geopolitical supply-shock calibration, adversarial
fixtures, project selftests, and a real Pages-projection canary. It performs no
runtime research and publishes no review, dossier, brief read, action, alert, or
Feature 020 destination state.

All evidence below was executed after the interrupted replan and after removing
untrusted evidence written by a failed agent stream. The repository PII scan was
clean before these records were admitted.

## Test Evidence

### replanned-contract-tp-01-01

```text
# TP-01-01 committed agenda validation
$ node scripts/selftest.mjs
exit: 0
lines: 1907
sha256: 8eb8825336bc932e57b72a3cdfb67439e336d5603e83d5d61ec930fe0fc76a77
SCN-019-001 committed agenda loads from repository state without browser or network input
Research-Lab self-test: 1650 passed, 0 failed
verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 8eb8825336bc932e57b72a3cdfb67439e336d5603e83d5d61ec930fe0fc76a77 -- node scripts/selftest.mjs
TP-01-01_EXECUTION_EXIT=0
```

### replanned-contract-tp-01-02

```text
# TP-01-02 absent agenda validation
$ node scripts/selftest.mjs
exit: 0
lines: 1907
sha256: 066bc22389e30d449dec5c1242b360c357db29349dde6c1cf97de7a97fcc83c3
SCN-019-002 absent agenda is named and never replaced with default topics
TP-01-02: absence is explicit and carries no synthesized topic
Research-Lab self-test: 1650 passed, 0 failed
verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 066bc22389e30d449dec5c1242b360c357db29349dde6c1cf97de7a97fcc83c3 -- node scripts/selftest.mjs
TP-01-02_EXECUTION_EXIT=0
```

### replanned-contract-tp-01-03

```text
# TP-01-03 per-topic refusal validation
$ node scripts/selftest.mjs
exit: 0
lines: 1907
sha256: 527d163d75681af0b453cf5e6d4cbbf6cb5aad9bd2ba83dccac38dfeed3d12ed
SCN-019-003 missing review mode refuses only the invalid topic
TP-01-03: one missing mode yields one named refusal while two topics remain accepted
TP-01-03: accepted plus refused accounts for every declared topic without disabling valid peers
Research-Lab self-test: 1650 passed, 0 failed
verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 527d163d75681af0b453cf5e6d4cbbf6cb5aad9bd2ba83dccac38dfeed3d12ed -- node scripts/selftest.mjs
```

### replanned-contract-tp-01-04

```text
# TP-01-04 topic-neutral foundation validation
$ node scripts/selftest.mjs
exit: 0
lines: 1907
sha256: 7095765baedce413489435ddc27224897a848c956dc3bfe241a1f405fdb46666
SCN-019-007 three initial topics validate through one topic-neutral foundation
TP-01-04: all definitions and the versioned primary calibration satisfy the shared contracts
TP-01-04: cadence topics remain independent and the shared contract has no Iran-only field
Research-Lab self-test: 1650 passed, 0 failed
verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 7095765baedce413489435ddc27224897a848c956dc3bfe241a1f405fdb46666 -- node scripts/selftest.mjs
```

### replanned-contract-tp-01-05

```text
# TP-01-05 fail-closed ownership validation
$ node scripts/selftest.mjs
exit: 0
lines: 1907
sha256: ec2ccc4b6d112b32efeba78582b3770cc95f1069d752fa8e33dabc63a60306d8
TP-01-05: unknown members, mandatory capacity plus one, and unknown evidence vocabulary are refused
TP-01-05: evidence weighting uses only explicit policy values and exposes every factor
TP-01-05: one UMD module owns the closed vocabulary and every deterministic function declaration
Research-Lab self-test: 1650 passed, 0 failed
verify: bash .github/bubbles/scripts/evidence-capture.sh --verify ec2ccc4b6d112b32efeba78582b3770cc95f1069d752fa8e33dabc63a60306d8 -- node scripts/selftest.mjs
```

#### Fresh independent TP-01-05 execution evidence

**Phase:** test
**Claim Source:** executed

```text
# TP-01-05 full project selftest
$ node scripts/selftest.mjs
exit: 0
lines: 2032
sha256: 971a84cb50294e4d68c2a776e615bc292469d7f9e6d461f506daf9a44eb76ffd
Regression: agenda modes capacities vocabularies and formulas fail closed and have one owner
  ✓ TP-01-05: unknown and missing policy members, mandatory capacity plus one, and unknown evidence vocabulary are refused
  ✓ TP-01-05: evidence weighting uses only explicit policy values and exposes every factor
  ✓ TP-01-05: preparation scheduling live author controls and retry cache identity consume one explicit policy digest without a 900-second source literal
  ✓ TP-01-05: one UMD module owns the closed vocabulary and every deterministic function declaration
TP_01_05_FULL_SELFTEST_CAPTURE_EXIT=0
```

### replanned-contract-tp-01-06

```text
# TP-01-06 spec test path ratchet
$ node scripts/validate-spec-test-paths.mjs
exit: 0
lines: 6
sha256: b113b5367037bc92819035c35f0f41a956d1c58056b79bb5eae65700c5dfceee
[spec-test-paths] scanned=553 references=12502 distinctPaths=218 missingPaths=81 baseline=84 new=0 stale=3
STALE-BASELINE: tests/portfolio-analytics.unit.mjs
STALE-BASELINE: tests/portfolio-survival-paths.spec.mjs
STALE-BASELINE: tests/portfolio-survival-risk.spec.mjs
[spec-test-paths] OK — no new missing test path(s) (3 stale baseline entries to remove)
TP-01-06_CAPTURE_EXIT=0
```

### replanned-contract-tp-01-07

```text
# TP-01-07 deployed foundation reachability
$ npx --no-install playwright test tests/deployed-site-parity.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-019-001 foundation artifacts are served from committed files by the real static server" --reporter=list
exit: 0
lines: 6
sha256: 6df162f5b046be15a560ce053d38984256047894bca58df3e3e7e25c47674597
Running 1 test using 1 worker
✓ 1 [system-chrome] › tests/deployed-site-parity.spec.mjs:61:1 › SCN-019-001 foundation artifacts are served from committed files by the real static server
1 passed (2.9s)
TP-01-07_CAPTURE_EXIT=0
```

## Build Quality Evidence

```text
Scope 1 artifact lint: exit 0, lines 85, sha256 94730cbebe047519718fb6242d3c5da7cb7320e68c057fa7f9bd14bac251da15
Scope 1 traceability guard: exit 0, lines 159, sha256 37eecfb5b727e4d891449e4723541d6ca38d2942d439fc9cba35d863e3c23c95
Scope 1 artifact freshness: exit 0, lines 24, sha256 b87f8612944f7c3f8a72144141584d7190c1bd730eeef2be64c3d60d4a29c195
Scope 1 capability foundation: exit 0, lines 6, sha256 d2b244e1749f54de2414b79c9220ccde7bce2e649bb2d4e3b07a47cee7a2501b
Reference existence: exit 0, 14 markdown files scanned, every relative target resolves
JSON parse: exit 0
Markdown fences: 8 files, all even
PII scan: files=6342 messages=1246 findings=0 OK
Diff check: exit 0
Scope boundary: changedPaths=25 scope1Paths=14 outsidePaths=0 feature020DestinationWrites=0 PASS
```

### Fresh reconciliation quality evidence

**Phase:** test
**Claim Source:** executed

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/019-custom-recurring-research-agenda
exit: 0
lines: 94
sha256: 77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c
Artifact lint PASSED.
```

## Gaps Reconciliation 2026-08-15

**Phase:** plan
**Claim Source:** interpreted
**Interpretation:** GAP-01 requires runtime policy mutation and author/acquisition capacity-plus-one proof that the historical evidence above does not contain. Scope 1 is `In Progress`; no implementation or test completion is claimed here.

### replanned-contract-tp-01-08

**Phase:** plan
**Claim Source:** interpreted
**Interpretation:** This anchor records an unexecuted GAP-01 validation contract. It is not test evidence and cannot satisfy the unchecked DoD item.
**Planned command:** `node --test tests/distributed-briefs.final-budget.stress.mjs`
**Result:** PLANNED, NOT EXECUTED

#### Fresh independent TP-01-08 execution evidence

**Phase:** test
**Claim Source:** executed

```text
$ node --test --test-name-pattern='Regression: every registry policy member drives runtime behavior and author and acquisition capacity plus one refuses before work' tests/distributed-briefs.final-budget.stress.mjs
exit: 0
lines: 9
sha256: b73ea7ad24a061d0918890f69b3d5e8cd15b635b387c8aad6d1ca53f5049b7a6
✔ Regression: every registry policy member drives runtime behavior and author and acquisition capacity plus one refuses before work (221.502042ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 275.518166
TP_01_08_EXACT_PLUS_ONE_CAPTURE_EXIT=0
```

#### Full stress regression

**Phase:** test
**Claim Source:** executed

```text
$ node --test tests/distributed-briefs.final-budget.stress.mjs
exit: 0
lines: 12
sha256: 61f43e61c4e592df6769599b12da5bb20464c8903b41d018f61b7e389e0097a1
✔ Final budget boundary refuses honestly and never truncates mandatory material under sweep (193.525916ms)
✔ Repeated final compaction of identical inputs is byte-stable (159.306333ms)
✔ Agenda acquisition and authoring remain within explicit topic byte concurrency and timeout budgets (4.909625ms)
✔ Regression: every registry policy member drives runtime behavior and author and acquisition capacity plus one refuses before work (128.512334ms)
ℹ tests 4
ℹ pass 4
ℹ fail 0
ℹ skipped 0
ℹ duration_ms 537.844625
```

#### Affected integration regression

**Phase:** test
**Claim Source:** executed

```text
$ node --test tests/distributed-briefs.authorship.integration.mjs tests/brief-refresh-atomicity.test.mjs
exit: 0
lines: 773
sha256: 4bf933afc34247fe735972281474c66408e52ec7d61d01bc52d0f51c9dda5970
✔ production pool resolves every registry source outcome with at most four active author processes (59.486625ms)
✔ SCN-019-013 quiet complete pass writes an unchanged review and reuses the substantive dossier (4.565ms)
✔ SCN-019-015 failed research lane publishes named unavailable without a partial finding (2.269833ms)
✔ Regression: research lane timeout leaves every critical lane output byte-identical (1.077958ms)
ℹ tests 37
ℹ pass 37
ℹ fail 0
ℹ skipped 0
ℹ duration_ms 52038.822666
```

#### Regression quality

**Phase:** test
**Claim Source:** executed

```text
$ bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/distributed-briefs.final-budget.stress.mjs tests/distributed-briefs.authorship.integration.mjs tests/brief-refresh-atomicity.test.mjs
exit: 0
lines: 19
sha256: 4df91c513388daa59647d33154af365055e42aa5f472d567b78f3623d4fec134
ℹ️  Scanning tests/distributed-briefs.final-budget.stress.mjs
✅ Adversarial signal detected in tests/distributed-briefs.final-budget.stress.mjs
ℹ️  Scanning tests/distributed-briefs.authorship.integration.mjs
✅ Adversarial signal detected in tests/distributed-briefs.authorship.integration.mjs
ℹ️  Scanning tests/brief-refresh-atomicity.test.mjs
✅ Adversarial signal detected in tests/brief-refresh-atomicity.test.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 3
```

## Completion Statement

Scope 1 is complete under the reconciled gaps contract. All 16 Scope 1 DoD
items carry item-local provenance, TP-01-05 and TP-01-08 carry fresh executed
evidence, and the 68-row parity plus required quality guards pass. This is an
execution-scope completion claim only; certification remains `not_started`, the
overall gaps phase remains active, and Scope 2 is the next eligible scope.

## Historical Completion Statement (Superseded)

Scope 1 implementation and fresh test evidence passed the post-evidence artifact,
traceability, freshness, reference, privacy, test-path, JSON, fence, and diff
checks. Scope 1 is complete; no certification or whole-feature completion is
claimed here.

<!-- bubbles:certifying-window-begin -->

## Certification Window 2026-08-16

Everything above this marker is prior-window history. The evidence below was
captured in the certifying window and is what this scope is certified on.

### Validation Evidence

**Executed:** YES
**Command:** node scripts/selftest.mjs
**Phase Agent:** bubbles.validate

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 2417 passed, 0 failed
Exit Code: 0

Scope 1 scenario assertions observed in that run:
SCN-019-001 committed agenda loads from repository state without browser or network input
SCN-019-002 absent agenda is named and never replaced with default topics
SCN-019-003 missing review mode refuses only the invalid topic
SCN-019-007 three initial topics validate through one topic-neutral foundation
```

### Audit Evidence

**Executed:** YES
**Command:** bash .github/bubbles/scripts/artifact-lint.sh specs/019-custom-recurring-research-agenda && node scripts/pii-scan.mjs
**Phase Agent:** bubbles.audit

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/019-custom-recurring-research-agenda
Artifact lint PASSED.
Exit Code: 0

$ node scripts/pii-scan.mjs
[pii-scan] files=7074 messages=1373 findings=0 OK
Exit Code: 0
```

### Chaos Evidence

**Executed:** YES
**Command:** node -e '<randomized field-mutation probe over rlagenda.js validators; seed 20260816>'
**Phase Agent:** bubbles.chaos

```text
chaos probe: rlagenda validators under randomized field mutation
iterations: 600  seed: 20260816  sources: 3 topic definitions + current.json
accepted: 28  named-refusal: 572  crashed-or-unnamed: 0
refusal codes: {"RLAGENDA-CONTRACT-MISSING-MEMBER":49,"RLAGENDA-CURRENT-INVALID":300,"RLAGENDA-SOURCE-INVALID":17,"RLAGENDA-CONTRACT-SHAPE":28,"RLAGENDA-MODEL-INVALID":102,"RLAGENDA-ID-INVALID":52,"RLAGENDA-SECTION-INVALID":15,"RLAGENDA-CONTRACT-UNKNOWN-MEMBER":5,"RLAGENDA-FLOW-INVALID":4}
CHAOS_PROBE_EXIT=0
Exit Code: 0
```

The probe mutates the committed topic definitions and `current.json` field by
field (drop, null, empty string, wrong type, wrong shape) and asserts the
registry contract refuses by NAMED code rather than crashing or silently
defaulting. Zero unnamed refusals and zero throws over 600 iterations is the
Scope 1 claim under adversarial input.

