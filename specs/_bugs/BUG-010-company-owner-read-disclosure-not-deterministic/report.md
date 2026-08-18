# Report: BUG-010 — A Safety Disclosure Must Be Deterministic And Gated

### Summary

This run produced the bug artifact packet only. No fix was implemented, no product source file was
modified, and no scope DoD item is discharged.

- **Changed:** `specs/_bugs/BUG-010-company-owner-read-disclosure-not-deterministic/` — `bug.md`,
  `spec.md`, `design.md`, `scopes.md`, `report.md`, `scenario-manifest.json`, `uservalidation.md`,
  `state.json`.
- **Unchanged, deliberately:** `scripts/selftest.mjs`, `scripts/brief-refresh.mjs`,
  `scripts/brief-narrative-parallel.mjs`, `scripts/validate-brief-payload.mjs`,
  `market-brief.payload.json`.
- **Scenarios validated:** none. `SCN-010B-001` through `SCN-010B-009` are authored and unexecuted;
  every DoD item across all three scopes is unchecked.

What this run *did* establish, by execution, is that the reported defect is real, that its failure is
narrower than the assertion text suggests, and that every file-and-line citation carried in
`design.md` matches the tree at `HEAD` `5c005750e`.

### Completion Statement

**Delivered:** the eight-artifact bug packet for BUG-010, with the reported root cause independently
grounded against the tree rather than restated.

**Not delivered:** the fix. `scripts/validate-brief-payload.mjs` still has no disclosure check,
`buildCompanyFundamentalsOwnerRead()` still omits both facts from its emitted prose, the Tier-B
narrative lane still owns the reason with no preservation duty, and `market-brief.payload.json` still
carries the reason that fails the Feature 010 Scope 6 assertion. `node scripts/selftest.mjs` still
exits 1.

`state.json` is therefore `in_progress` with `certification.status: in_progress`. Promotion is not
claimed and is not available: 21 DoD items across 3 scopes are unchecked, and none of the 9 scenario
contracts has been executed.

### Reproduction

**Executed:** YES
**Command:** `node scripts/selftest.mjs`
**Phase Agent:** bubbles.bug
**Claim Source:** executed

The failure reproduces first-hand at clean `HEAD` `5c005750e`, exactly as reported: one failure out
of 2490 assertions, and it is the Feature 010 Scope 6 company owner-read assertion.

```
# BUG-010 reproduction — repository selftest at clean HEAD 5c005750e
$ node scripts/selftest.mjs
exit: 1
lines: 2829
sha256: 558973e0b8985ffac8ea716e8ce0a29416f05b484f49c9b34929d917a007ef61
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: Feature 010 Scope 6 keeps exact registry-wide toolCoverage parity with one hash-verified company owner-read entry that discloses no recommendation is produced
--- last 20 ---
regime-primitives-stress
  ✓ the facet publication path sustains a repeated high-volume append run without unbounded slot growth or degraded write throughput

================================================
Research-Lab self-test: 2489 passed, 1 failed
================================================
```

Worktree state at the time of the run, recorded rather than cleaned, because the dirty file belongs
to another line of work and stashing it would disturb that work:

```
$ git rev-parse --short HEAD
5c005750e
$ git status --porcelain
 M tests/recommendation-track-record.canary.mjs
$ grep -n 'recommendation-track-record.canary' scripts/selftest.mjs
SELFTEST_REF_EXIT=1
```

`scripts/selftest.mjs` carries no reference to that path, and the two inputs the failing assertion
reads — `market-brief.payload.json` and `tools.json` — are both clean in the same `git status`
output. The operator separately reports reproducing the failure with the working tree stashed; that
stashed run was **not** performed here and is recorded as reported, not as executed.

### Test Evidence

No scope test was executed. This packet defines 13 test rows across 3 scopes and executes none of
them. The evidence below is **diagnostic grounding** for the citations in `bug.md` and `design.md`,
not scope-test evidence, and it discharges no DoD item.

#### Which conjuncts fail

**Executed:** YES
**Command:** `node -e` against `market-brief.payload.json`, `market-brief.snapshot.json`, `company-fundamentals.config.json`
**Phase Agent:** bubbles.bug
**Claim Source:** executed

Four of the six conjuncts pass. The two that fail are the adapter-id conjunct and the disclosure
conjunct, and the deterministic facts they need are present one key away in the same snapshot entry:

```
ENTRY_COUNT=1
STATUS=analyzed
DEEPLINK=company-fundamentals-lab.html
HAS_ADAPTER_ID=false
HAS_DISCLOSURE=false
SNAPSHOT_READ=sec-cik-0000789019 fundamentals are partial; direction Unavailable; statement 2026-03-31, model 2026-03-31, brief 2026-04-29T20:06:24.000Z, market unavailable.
SNAPSHOT_READ_HAS_ADAPTER_ID=false
SNAPSHOT_ADAPTER_STRUCT={"adapterId":"company-fundamentals-owner-v1","readContractVersion":"tool-model-read/v1","owningModelVersion":"company-publication-sec-cik-0000789019-g1"}
CONFIG_ADAPTER_ID=company-fundamentals-owner-v1
CONFIG_ELIGIBILITY=educational-research-only
NODE_EXIT=0
```

`STATUS=analyzed` and `DEEPLINK=company-fundamentals-lab.html` are the two conjuncts a reader might
suspect first, and both pass. The entry is structurally correct; only its prose is incomplete.

#### The producer holds both facts and omits them from the text

**Executed:** YES
**Command:** `sed -n '70,95p' scripts/brief-refresh.mjs`
**Phase Agent:** bubbles.bug
**Claim Source:** executed

```
$ sed -n '70,95p' scripts/brief-refresh.mjs
  const boundary = config && config.feature002;
  if (!boundary || boundary.adapterId !== 'company-fundamentals-owner-v1' || ... || boundary.recommendationEligibility !== 'educational-research-only' || ...) throw new Error('company owner adapter configuration is invalid');
  ...
  const read = `${owner.companyId} fundamentals are ${owner.status}; direction ${owner.direction}; statement ${owner.statementCutoff || 'unavailable'}, model ${owner.modelCutoff || 'unavailable'}, brief ${owner.briefCutoff || 'unavailable'}, market ${owner.marketCutoff || 'unavailable'}.`;
  return {
    ...
    adapter: { adapterId: boundary.adapterId, readContractVersion: boundary.readContractVersion, owningModelVersion: owner.publicationId },
```

Both values are validated at the top of the function and are in scope at the line that builds the
text. `adapterId` continues structurally on the next line. Neither reaches the sentence.

#### The omission propagates, and no gate stops it

**Executed:** YES
**Command:** `grep -n 'function buildToolCoverage' -A 18 scripts/brief-refresh.mjs`, `sed -n '88,100p' scripts/brief-narrative-parallel.mjs`, `sed -n '418,436p' scripts/validate-brief-payload.mjs`
**Phase Agent:** bubbles.bug
**Claim Source:** executed

```
2106:function buildToolCoverage(toolReads) {
2119-    return { id: tool.id, deepLink: tool.file, status: 'fresh-headless', reason: toolRead.read };

scripts/brief-narrative-parallel.mjs:
        id: 'coverage',
        keys: ['toolReads', 'toolCoverage', 'experimental'],
        instructions: `... toolCoverage must contain every tools.json id exactly once and no unregistered ids, each with a specific analyzed/stale/not-relevant reason. ...`

scripts/validate-brief-payload.mjs:
  coverage.forEach((entry, index) => {
    if (!hasText(entry?.reason)) errors.push(`toolCoverage[${index}].reason must state the analyzed read, staleness, or specific irrelevance`);
  });
```

`reason: toolRead.read` inherits the omission verbatim. The narrative lane owns the key and is asked
only for "a specific analyzed/stale/not-relevant reason". The validator's entire per-entry content
test is `hasText`.

#### Third flap of the same defect

**Executed:** YES
**Command:** `git log -L 6319,6319:scripts/selftest.mjs`
**Phase Agent:** bubbles.bug
**Claim Source:** executed

```
ecc9d79e5 selftest: assert the no-fabrication DISCLOSURE, not the sentence that carried it
eecf45a32 fix(012): resolve brittle Feature 010 Scope 6 coverage-status canary (market-brief automation legitimately varies per-window status)
4c677c88b feat(010): Feature 002 consume-once owner-read + registry discoverability (Increment B / Scope 6)
```

Three commits have touched that line. The first authored the assertion; the second and third each
loosened it and named it a brittle canary. Neither changed the producer, so the fact stayed
non-deterministic and has now gone missing a third time. `design.md` §2 records a fourth loosening as
prohibited.

#### Known-good control exists

**Executed:** YES
**Command:** `node -e` against `_site/market-brief.payload.json`
**Phase Agent:** bubbles.bug
**Claim Source:** executed

```
SITE_STATUS=analyzed
SITE_HAS_ADAPTER_ID=true
SITE_HAS_DISCLOSURE=true
```

The last published window satisfies both conjuncts with the same underlying read. That reason is the
negative control the Scope 01 gate must accept (`T-10-U5`), which is what prevents a
refuse-everything gate from passing the adversarial suite.

#### The packet is inert

**Executed:** YES
**Command:** `node scripts/selftest.mjs`, re-run after the eight artifacts were written
**Phase Agent:** bubbles.bug
**Claim Source:** executed

```
$ node scripts/selftest.mjs
exit: 1
lines: 2829
sha256: 009633ae3164f7c45d765f17cf6d5354ee333aa3416070b32d6dd91207162963
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: Feature 010 Scope 6 keeps exact registry-wide toolCoverage parity with one hash-verified company owner-read entry that discloses no recommendation is produced
================================================
Research-Lab self-test: 2489 passed, 1 failed
================================================
```

Same counts, same single failure, and the same line count as the pre-packet run. Writing the packet
introduced no new failure and changed nothing the selftest observes. It also cleared `pii-scan`,
which runs inside the selftest and would have failed on an absolute filesystem path in any committed
artifact.

### Discovered Issues

| Finding | Owner | Disposition |
|---|---|---|
| Two of the three commits that touched `scripts/selftest.mjs` line 6319 loosened the assertion instead of making the fact deterministic | this packet | Recorded as a hard non-goal in `design.md` §2 and enforced by `T-10-R3`, which diffs that line. |
| The Tier-B `coverage` lane carries per-tool preservation duties for four other tools but none for the company entry | this packet, Scope 02 | Addressed by `design.md` §3.3. |
| `tests/recommendation-track-record.canary.mjs` is modified in the worktree and belongs to another line of work | not this packet | Left untouched. `scripts/selftest.mjs` carries no reference to it, and both inputs of the failing assertion are clean. |
