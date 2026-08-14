# Scope 4 Execution Report - Governed Generation And Atomic Publication

## Summary

Scope 4 integrates the offline agenda plan with the real Market Brief generation
and publication transaction. It reuses current committed evidence, searches only
for missing or stale requirements through the existing allowlisted acquisition
transform, retrieves exact bounded bytes with no redirects, and gives the frozen
bundle to a networkless research author. Research discovery and authorship execute
once per fully fingerprinted generation and are reused across outer narrative
retries. The original four critical lanes retain their pool and failure behavior.

The collector emits explicit updated, unchanged, stale, unavailable, paused,
deferred, and refused states, validates every registry topic and analytical
section, writes immutable artifacts create-only, replaces the append-only ledger,
and moves `research/agenda/current.json` last. The committed current generation
contains current-generation unavailable reviews for both selected topics and a
named deferred cadence topic; the historical Iran seed remains history only.

## Test Evidence

### replanned-contract-tp-04-01

```text
# replanned-contract-tp-04-01
$ node --test --test-name-pattern='SCN-019-004 newly committed topic receives its first current review or named outcome' tests/distributed-briefs.final.e2e.mjs
exit: 0
lines: 9
sha256: eaf1ae8da7d503908582dd0ec456daa0e0600150047967ce2d46e2d7f661257c
SCN-019-004 newly committed topic receives its first current review or named outcome
tests: 1
pass: 1
fail: 0
```

### replanned-contract-tp-04-02

```text
# replanned-contract-tp-04-02
$ node --test --test-name-pattern='SCN-019-012 generation reuses current evidence and acquires only missing or stale requirements' tests/web-evidence.functional.mjs
exit: 0
lines: 9
sha256: a07c74920d81695fe7a5d2a5f0e8d07391c2321f9c7bfd678192d050b1974502
SCN-019-012 generation reuses current evidence and acquires only missing or stale requirements
tests: 1
pass: 1
fail: 0
```

### replanned-contract-tp-04-03

```text
# replanned-contract-tp-04-03
$ node scripts/selftest.mjs
exit: 0
lines: 1991
sha256: a5db1f0293d59c7828d9fe8370830587c72e4f335e85b0e4ab873ebe4c50e77c
Feature 019 candidate contract accounts for new sourced unchanged stale and unavailable reviews before publication
TP-04-03: new sourced evidence creates one complete updated review and one sustained dossier
TP-04-03: a quiet complete pass writes an unchanged review reusing the prior dossier without inventing a finding
TP-04-03: stale evidence records its age and publishes no current model output or dossier
TP-04-03: a failed lane creates a named unavailable review with no partial finding or dossier
Research-Lab self-test: 1696 passed, 0 failed
```

### replanned-contract-tp-04-04

```text
# replanned-contract-tp-04-04
$ node --test --test-name-pattern='SCN-019-013 quiet complete pass writes an unchanged review and reuses the substantive dossier' tests/distributed-briefs.authorship.integration.mjs
exit: 0
lines: 9
sha256: 88983765c9a81829949f94c481ec4146ade5b605216e34c3f734165e042a596d
SCN-019-013 quiet complete pass writes an unchanged review and reuses the substantive dossier
tests: 1
pass: 1
fail: 0
```

### replanned-contract-tp-04-05

```text
# replanned-contract-tp-04-05
$ node scripts/selftest.mjs
exit: 0
lines: 1991
sha256: 478d09f2cdf735fe5a66a14d3c5fb82898271457592b42cf816408f00d017626
SCN-019-014 stale evidence publishes its age has zero model impact and never masquerades as current
TP-04-05: stale evidence has zero impact and the compact read labels stale with its age
TP-04-05: stale current review never points at or masquerades as the prior dossier
Research-Lab self-test: 1696 passed, 0 failed
```

### replanned-contract-tp-04-06

```text
# replanned-contract-tp-04-06
$ node --test --test-name-pattern='SCN-019-015 failed research lane publishes named unavailable without a partial finding' tests/distributed-briefs.authorship.integration.mjs
exit: 0
lines: 9
sha256: 7d5ac28dfe84947510c51e4279444e5618fe74a0b8c9e17bc67979d1865f538c
SCN-019-015 failed research lane publishes named unavailable without a partial finding
tests: 1
pass: 1
fail: 0
```

### replanned-contract-tp-04-07

```text
# replanned-contract-tp-04-07
$ node --test --test-name-pattern='Regression: research lane timeout leaves every critical lane output byte-identical' tests/distributed-briefs.authorship.integration.mjs
exit: 0
lines: 9
sha256: 7ac42cb843334e6df9022611c5d9b99b475ea0fa11664e801956a7eae8fd6174
Regression: research lane timeout leaves every critical lane output byte-identical
tests: 1
pass: 1
fail: 0
```

### replanned-contract-tp-04-08

```text
# replanned-contract-tp-04-08
$ node --test --test-name-pattern='Regression: agenda acquisition rejects query URL byte time and concurrency limits at capacity plus one' tests/web-evidence.security.mjs
exit: 0
lines: 9
sha256: 77ee4b69123d26ce99db886b75585e62b201aed8085fb89e741fb0593db3f7aa
Regression: agenda acquisition rejects query URL byte time and concurrency limits at capacity plus one
tests: 1
pass: 1
fail: 0
```

### replanned-contract-tp-04-09

```text
# replanned-contract-tp-04-09
$ node --test --test-name-pattern='Regression: shared web policy preserves all existing lane allowlist arguments byte for byte' tests/web-evidence.functional.mjs
exit: 0
lines: 9
sha256: 1b4e2048c15dfd96acd1f358220b0a5e2acedb3573186fef2b6402cd128bf8eb
Regression: shared web policy preserves all existing lane allowlist arguments byte for byte
tests: 1
pass: 1
fail: 0
```

### replanned-contract-tp-04-10

```text
# replanned-contract-tp-04-10
$ node --test --test-name-pattern='Regression: agenda publication writes immutable files before ledger and moves current pointer last' tests/brief-refresh-atomicity.test.mjs
exit: 0
lines: 9
sha256: 2bd10c2e510cddf7c7d95676fb183df9e4f7cf93ef8bfec41d647d98d45eaaa2
Regression: agenda publication writes immutable files before ledger and moves current pointer last
tests: 1
pass: 1
fail: 0
```

### replanned-contract-tp-04-11

```text
# replanned-contract-tp-04-11
$ node scripts/validate-brief-payload.mjs
exit: 0
lines: 2
sha256: 5633a06b8d73d88c69105a844e0949c1ba8ee31d362aeeeb697916d04c599479
[brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
```

### replanned-contract-tp-04-12

```text
# replanned-contract-tp-04-12
$ node --test --test-name-pattern='Agenda acquisition and authoring remain within explicit topic byte concurrency and timeout budgets' tests/distributed-briefs.final-budget.stress.mjs
exit: 0
lines: 9
sha256: 1db84abe24485db857f00a900d6da1bbd1cd23b7d71a42f233d1b5af494db65c
Agenda acquisition and authoring remain within explicit topic byte concurrency and timeout budgets
tests: 1
pass: 1
fail: 0
```

### replanned-contract-tp-04-13

```text
# replanned-contract-tp-04-13
$ node --test --test-name-pattern='SCN-019-012 real generation publishes one atomic agenda and brief payload transaction' tests/distributed-briefs.final.e2e.mjs
exit: 0
lines: 32
sha256: 4b08a5368d71f7d04cefabce0ca28358db901867b9d34bd442aa26f8627b5275
SCN-019-012 real generation publishes one atomic agenda and brief payload transaction
tests: 1
pass: 1
fail: 0
```

## Broad Execution Evidence

```text
# Scope 4 full project selftest
$ node scripts/selftest.mjs
exit: 0
lines: 1991
sha256: b34fae9c0d408726874f2672ef28b11d742597dccb710cb529e8273f2ab388b8
Research-Lab self-test: 1696 passed, 0 failed

# Scope 4 full atomic wrapper suite
$ node --test tests/brief-refresh-atomicity.test.mjs
exit: 0
lines: 697
sha256: 34d00ca9ba3b18ade6df758d2b28aa83718da5a2ea29f519740b28185dd8e851
tests: 30
pass: 30
fail: 0
```

## Build Quality Evidence

```text
artifact lint: exit 0, lines 94, sha256 77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c
traceability all scopes: exit 0, lines 159, sha256 806f8d21722564cf7072d4ef6bebbacf7421ee80c192f3a466dda6224b3b6816
artifact freshness: RESULT PASS, 0 failures, 0 warnings
capability foundation: PASS Gate G094
node source lock: actual PASS, adversarial 16, unexpected acceptances 0
PII scan: files 6342, messages 1246, findings 0
test-path ratchet: new missing paths 0; three unrelated stale baseline entries retained
Markdown and JSON: 17 artifact files, reference/fence findings 0
change boundary: changed paths 53, forbidden paths 0, UI/registration/Feature 020 writes 0
git diff --check: exit 0
```

## Completion Statement

Scope 4 implementation and all 13 replanned Test Plan rows passed current-
session validation. The governed acquisition adapter, once-per-generation
research cache, networkless side author, complete outcome composer, payload
validator, immutable transaction, rollback, and pointer-last wrapper path are
executable and covered. The current committed read is internally consistent and
labels unavailable/deferred outcomes rather than presenting the historical seed
as current.

Scope 5 is the next eligible implementation target. This report claims no
whole-feature certification and changes no certification-owned field.
