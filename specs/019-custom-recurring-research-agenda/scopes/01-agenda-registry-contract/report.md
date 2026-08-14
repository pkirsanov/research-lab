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

## Completion Statement

Scope 1 implementation and fresh test evidence passed the post-evidence artifact,
traceability, freshness, reference, privacy, test-path, JSON, fence, and diff
checks. Scope 1 is complete; no certification or whole-feature completion is
claimed here.
