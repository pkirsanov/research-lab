# Report: BUG-010 — A Safety Disclosure Must Be Deterministic And Gated

### Summary

> **Historical — describes the packet-filing run only.** The fix has since been delivered under
> Scopes 1-3. For the current position see "Scope 3 Closeout: Which Repair Route Was Taken" at the
> end of this file.

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

> **Historical — superseded by "Scope 3 Disposition" at the end of this file.** Everything listed
> as not delivered below has since been delivered; 19 of the 21 DoD items across the three scopes
> are now discharged, with the two open items blocked on BUG-013.

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
| The BUG-010 fix made `company-fundamentals.config.json` a publication-path dependency, and `tests/brief-refresh-atomicity.support.mjs` did not carry it into its synthetic repo | this packet | Fixed below. Fixture-only; no production file changed. |

### Regression: The Gate Became A Publication-Path Dependency The Fixture Did Not Carry

`tests/market-brief-session-date-drift.spec.mjs` (Regression BUG-002) began failing at
`expect(result.status).toBe(0)` — received `1`.

**Provenance of the regression finding.** The commit was isolated by an operator bisect in a
disposable worktree — the spec passes at `5d4a8202a` (immediately before this packet's fix) and
fails at `0e51d602f`, so `7314777ef` caused it. That bisect is operator-supplied diagnostic input,
not this session's execution evidence; everything below it is executed here.

#### The stated hypothesis was wrong, and the stderr says so

The suspected cause was `reassertCompanyOwnerReadDisclosure()` throwing on a fixture payload with
zero company `toolCoverage` entries. Capturing the fixture's actual stderr disconfirms it on two
independent counts.

**Executed:** YES
**Command:** drive `createBriefRefreshFixture({ browserAssets: true })` + `runBriefRefreshFixture()`
directly and print `status` / `stderr`, at `0e51d602f` before any edit
**Phase Agent:** bubbles.implement
**Claim Source:** executed

```
=== STATUS ===
1
=== STDERR ===
[brief-contract] FAIL: the company owner-read coverage entry does not disclose what Feature 010 guarantees
  - company-fundamentals.config.json could not be read, so the adapter id "company-fundamentals-lab" must name cannot be resolved — a gate that cannot form its expectation refuses rather than assumes one

=== STDOUT TAIL MARKER: full stdout below ===
[brief-timer] refusing: published snapshot/payload baseline is invalid
```

1. The refusal comes from the **publish gate** in `scripts/validate-brief-payload.mjs`, not from the
   post-merge re-assertion in `scripts/brief-refresh.mjs`.
2. The re-assertion never executed. This fixture is built without `narrativeMode`, so `copilotPath`
   is null and `runBriefRefreshFixture` sets `BRIEF_SKIP_NARRATIVE=1`; the run log confirms it —
   `[brief-timer] BRIEF_SKIP_NARRATIVE=1 — data-only run, narrative not regenerated`. A function on
   a lane that does not run cannot be the cause.

The window is also not an uncovered one. The fixture copies the committed
`market-brief.payload.json`, which carries **exactly one** `company-fundamentals-lab` coverage entry
whose `reason` already contains both required facts. The gate's subject was present; only its
**expectation** was unreachable, because the fixture's synthetic repo had no
`company-fundamentals.config.json` to read the declared `feature002.adapterId` out of.

#### Why nothing in the gate was narrowed

Narrowing the refusal to "only complain when the payload covers the tool" would have been a fix for
a bug that does not exist here — the payload *does* cover the tool. It would also have been a
straight loss: this brief covers every registered tool by contract, so a zero-entry company coverage
set is a genuine breach and the existing `entries.length !== 1` refusal is correctly scoped.

The defect is in the fixture. Before `7314777ef` nothing in the publication path read
`company-fundamentals.config.json`, so the fixture never needed it; the gate made it a dependency
and the fixture was not updated. That is the same shape the fixture already documents twice in its
own comments — `rlattention.js` ("a fixture gap presenting as a publication refusal") and the XNYS
calendar. `tools.json` alone is half the subject: the registry names *which* coverage entry to
examine, the config supplies *what* that entry must say.

#### The fix

One line plus its rationale, in `tests/brief-refresh-atomicity.support.mjs`, beside the existing
`tools.json` copy and before the fixture's baseline commit:

```
copyFileSync(resolve(ROOT, 'company-fundamentals.config.json'), resolve(repoRoot, 'company-fundamentals.config.json'));
```

No production file changed. `git diff --quiet` reports `scripts/validate-brief-payload.mjs`,
`scripts/brief-refresh.mjs`, `scripts/brief-narrative-parallel.mjs`, and `scripts/selftest.mjs` all
byte-identical to HEAD, and `scripts/selftest.mjs` line 6319 diffs clean against
`git show HEAD:scripts/selftest.mjs`. The re-assertion was not deleted, no error is swallowed, there
is no `try {} catch {}`, and no environment variable special-cases the fixture.

#### Adversarial proof — the guarantee still bites, in the path that was changed

The reason to distrust a fixture-side fix is that it could make the lane green by putting the gate
somewhere it can no longer refuse. It cannot. Construction: build the fixture **with** the fix, keep
the `company-fundamentals-lab` entry present so the window still covers the tool, overwrite only its
`reason` with prose that drops both facts, commit that as the fixture baseline, then run the
refresh.

**Executed:** YES
**Command:** fixture built with the fix, company entry retained, `reason` replaced with
`"Consumed as a committed owner read for MSFT; coverage is partial through 2026-03-31."`, committed,
then `runBriefRefreshFixture()`
**Phase Agent:** bubbles.implement
**Claim Source:** executed

```
=== fixture DOES cover the company tool: entries=1
=== mutated reason (entry kept, BOTH facts stripped): Consumed as a committed owner read for MSFT; coverage is partial through 2026-03-31.
=== STATUS === 1
=== STDERR ===
[brief-contract] FAIL: the company owner-read coverage entry does not disclose what Feature 010 guarantees
  - toolCoverage "company-fundamentals-lab" reason must name the producing adapter "company-fundamentals-owner-v1" as declared by company-fundamentals.config.json feature002.adapterId — without it a reader cannot tell which adapter produced this read
  - toolCoverage "company-fundamentals-lab" reason must state that no recommendation is produced (declared eligibility "educational-research-only") matching no recommendation[^.]*\b(?:fabricat\w*|produced|generated|issued)\b — the disclosure is the guarantee, and silence about it publishes a research tool that never says it gives no advice

=== STDOUT ===
[brief-timer] refusing: published snapshot/payload baseline is invalid
```

The fix in fact *restored* the gate's ability to discriminate inside the fixture. Before it, every
fixture run refused with the same unreachable-expectation line whether or not the disclosure was
present — an unfalsifiable refusal. After it, the fixture refuses only on the substantive breaches,
and names them.

Direct function-level adversarials confirm the same at the unit boundary, with the expected adapter
id read from `feature002.adapterId` (`company-fundamentals-owner-v1`) rather than pinned:

```
A1 CONTROL committed payload, covered AND disclosed        -> breaches=0
A2 covered, ADAPTER ID removed (disclosure kept)           -> breaches=1  (must name the producing adapter)
A3 covered, NO-RECOMMENDATION removed (adapter id kept)    -> breaches=1  (must state that no recommendation is produced)
A4 covered, BOTH removed — the BUG-010 window              -> breaches=2
A5 covered, INVERTED SENSE ("a recommendation is produced") -> breaches=1  (inverted sense does not satisfy it)

R1 reassert, company entry ABSENT      -> THREW: toolCoverage must carry exactly one "company-fundamentals-lab" entry …, found 0
R2 reassert, company entry DUPLICATED  -> THREW: … found 2
R3 reassert, entry present, disclosure stripped -> reasserted=true, canonical sentence installed
R4 reassert, committed payload         -> reasserted=false (already present, left alone)
```

#### Verification

| # | Command | Result | Exit |
|---|---|---|---|
| 1 | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-brief-session-date-drift.spec.mjs --reporter=line` | `1 passed (8.8s)` | 0 |
| 2 | `node scripts/validate-brief-payload.mjs` | company owner-read disclosure `PASS`; all sections valid | 0 |
| 3 | `node scripts/selftest.mjs` | `2490 passed, 0 failed` | 0 |
| 4 | `node --test tests/company-fundamentals-contracts.unit.mjs` | `pass 56`, `fail 0`; `T-10-U7`/`U8`/`U9` all green | 0 |
| 5 | `git diff --stat` | `tests/brief-refresh-atomicity.support.mjs \| 9 +` only; `scripts/selftest.mjs` absent | 0 |
| 6 | fixture adversarial, above | refuses with both substantive breaches | 1 (expected) |

`git diff --stat` also lists the two `specs/015-recommendation-outcome-ledger-and-track-record/scopes/01-frozen-claim-contract/`
files. They were already modified in the working tree before this session's first write — the
session-opening `git status --porcelain` reported both as ` M` — and are another line of work. They
were not touched here.

---

## Scope 3 Closeout: Which Repair Route Was Taken

**Phase Agent:** bubbles.implement
**Verified against:** `HEAD` `f65e5fa31`, tree clean

### Provenance of the evidence in this section

Two distinct sources are mixed below and are labelled throughout, because they carry different
weight:

- **Prior-session execution (operator-supplied).** The repair itself, the `git diff --stat` that
  showed the payload change was one line, the observation that `scripts/selftest.mjs` was absent
  from the diff, and the GitHub Actions cron run that republished the payload with the disclosure
  intact (`HAS_ADAPTER_ID: True`, `HAS_DISCLOSURE: True`) were all executed in a prior session and
  reported by the operator. They are recorded here as **attributed prior evidence**, not as this
  agent's own execution.
- **Re-derived this session.** Everything tagged `executed, this session` was run here against the
  tree as it now stands, deliberately not trusting the prior figures, because the payload is a
  per-window cron artifact that has been regenerated many times since.

Where the two agree, that is stated. Nothing disagreed.

### The route: regeneration through the fixed pipeline, not a byte patch

`design.md` §3.4 admitted two routes for repairing the committed window — regenerate it through the
fixed pipeline, or apply a targeted repair to the one `reason` string. **The regeneration route was
taken.** The repaired bytes were produced by the pipeline's own
`reassertCompanyOwnerReadDisclosure()`, so what landed in the committed payload is exactly what a
real window emits, not prose an agent typed to satisfy a checker.

That distinction is the whole point of the scope, and this session's re-derivation is what proves
it rather than asserting it. Compare the repair commit against the payload committed today:

| | `reason` window prose | disclosure sentence |
|---|---|---|
| repair commit `7314777ef` | "… carries into this **pre-close** view." | present |
| `HEAD` `f65e5fa31`, `generatedAt 2026-08-19T15:03:46.574Z` | "… carries into this **pre-market** view." | present, byte-identical |

The surrounding prose is regenerated per window and *did* change. The disclosure did not. Had the
repair been a targeted byte patch, it would have been destroyed the first time the cron rewrote that
sentence. It survived because the fact is re-emitted by the publication path on every run — which is
the definition of deterministic the bug asked for.

This also independently corroborates the attributed prior evidence from the GitHub Actions cron run:
the operator observed the pipeline republishing both facts automatically, and the committed payload
many windows later still carries them. Production behaviour, not test behaviour.

### What was re-derived this session

| # | Check | Command | Result | Exit |
|---|---|---|---|---|
| 1 | Publish gate against the current committed payload | `node scripts/validate-brief-payload.mjs` | `company owner-read names its producing adapter and states that no recommendation is produced: PASS`, all sections valid | 0 |
| 2 | Payload repair confined to one line | `git show --stat 7314777ef -- market-brief.payload.json` | `market-brief.payload.json \| 2 +-` | 0 |
| 3 | Repair confined to the company entry's `reason` | `git diff --unified=0 7314777ef^ 7314777ef -- market-brief.payload.json` | single `@@ -619 +619 @@` hunk; no other `toolCoverage` entry present | 0 |
| 4 | `scripts/selftest.mjs` untouched by the packet | `git diff --stat 7314777ef^ ee424df41 -- scripts/selftest.mjs` | empty — byte-identical across the packet range | 0 |
| 5 | Both facts present in the payload at `HEAD` | file read, `market-brief.payload.json:1045` | adapter id and no-recommendation disclosure both present | — |
| 6 | No absolute path in packet artifacts or changed sources | search for the three absolute-path prefixes (both POSIX user-home roots, Windows drive form) | 0 matches | — |
| 7 | Packet artifact lint | `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-010-company-owner-read-disclosure-not-deterministic` | see below | — |

Every re-derived figure matched the attributed prior figure. The one-line payload change, the
absence of `scripts/selftest.mjs` from the diff, and the publish gate's exit 0 all reproduced.

### What is NOT claimed, and why

`node scripts/selftest.mjs` **was not run in this session.** The suite currently reports 15 failures
originating in Feature 026's cockpit first-load byte budget — an unrelated defect filed as
**BUG-013** (`specs/_bugs/BUG-013-brief-recent-row-v2-breaches-cockpit-first-load-budget`, status
`in_progress`, all scopes Not Started). The two Scope 3 DoD items whose named test is that command
therefore remain **unticked**:

- T-10-R1 — Feature 010 Scope 6 assertion passes with both previously failing conjuncts intact
- T-10-R4 — repository selftest passes with no assertion removed, weakened, or skipped

The prior session did observe `2490 passed, 0 failed` (row 3 of the Verification table above), and
that observation stands as attributed prior evidence for the tree as it was then. It is **not**
carried forward to tick these items now: BUG-013 landed after it, so a green run is no longer
available to confirm, and an item whose command cannot be run green does not close on a stale
observation of a different tree.

What *can* be said without running it, and is recorded in `scopes.md` as an explicitly
`interpreted` claim rather than an executed one: both conjuncts that previously failed at
`scripts/selftest.mjs:6319` are satisfied by the committed reason. The literal
`company-fundamentals-owner-v1` is present, and `no recommendation is produced` matches the
assertion's `/no recommendation[^.]*\b(?:fabricat\w*|produced|generated|issued)\b/i`. The
assertion's remaining conjuncts — registry-wide id parity, `deepLink` equality, status-set
membership — are not evaluable by reading and stay unobserved.

The honest read is that Scope 3's own delivery is complete and evidenced, while two of its six
acceptance items are gated behind a repo-wide green suite that a different, already-filed defect
currently withholds.

### Scope 3 disposition

**4 of 6 discharged.** Scope 3 status is `In Progress`. `state.json` `status` and
`certification.status` both remain `in_progress`, because the packet cannot certify past an
acceptance item it has not observed pass.

Closing BUG-013 is what unblocks the remaining two items; no further work is required inside
BUG-010 to satisfy them.
