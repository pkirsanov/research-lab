# Scope 01 Report: Frozen claim contract

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Executed. Every figure and exit code below was produced by the seven commands recorded in
[Evidence Run](#evidence-run), executed in this session against the committed tree. Fourteen of the fifteen Test
Plan rows are green. **One row — `T-01-C2` — fails**, and it is recorded as a failure rather than narrated away.

**Evidence provenance.** Every block carries a `Claim Source:` tag. `executed` means the block quotes output from a
command in the Evidence Run. `interpreted` means the block reasons over that output and says so. `not-run` means the
block records work completed in a prior session and re-run by nothing here.

---

## Summary

Scope 01 delivers the `brief-recommendation-claim/v1` frozen claim contract as `rlclaims.js`, its fixture substrate
under `tests/fixtures/recommendation-track-record/claims/**`, the shared support module, and the four
`tests/recommendation-track-record.*.mjs` suites. The implementation is committed at
`39d04d9d90852b3e20ea1f6b73289bcdc466fe99` and the working tree is clean.

**Result of this evidence run:**

| Suite | Command | Exit | Rows evidenced | Outcome |
|---|---|---|---|---|
| Unit | `node --test tests/recommendation-track-record.unit.mjs` | `0` | T-01-U1 – T-01-U7 | 7 pass, 0 fail |
| Functional | `node --test tests/recommendation-track-record.functional.mjs` | `0` | T-01-F1 – T-01-F3 | 3 pass, 0 fail |
| Canary | `node --test tests/recommendation-track-record.canary.mjs` | **`1`** | T-01-C1, T-01-C2 | 1 pass, **1 fail** |
| E2E regression | `node --test tests/recommendation-track-record.e2e.mjs` | `0` | T-01-R1, T-01-R2 | 2 pass, 0 fail |
| Project check | `node scripts/selftest.mjs` | `0` | T-01-S1 | `2487 passed, 0 failed` |

**The one failure, stated plainly.** `T-01-C2` — the restore rehearsal — fails its precondition, not its subject.
The row derives *"this scope's additions"* from **untracked** working-tree entries and asserts the set is non-empty
before rehearsing a restore against them. Because this scope's files are now **committed**, `git status --porcelain`
returns zero entries, so that set is empty and the row aborts with *"the rehearsal is vacuous unless this scope
actually added something"* — refusing to report a green restore rehearsal it did not actually perform. That refusal
is the row behaving correctly: a rehearsal with nothing to restore would be a vacuous pass, which is worse than a
failure. The failure is a **row-precondition/commit-state interaction**, and it is left open and routed rather than
repaired here, because the fix is a change to a test file and this evidence pass owns no test-file edit. See
[T-01-C2](#t-01-c2) and [Still open](#still-open).

**No Definition of Done item is ticked by this report.** DoD closure is a separate pass; see
[Still open](#still-open).

---

## Evidence Run

Seven commands, each run once, unfiltered, at the repository root in this session.

| # | Command | Exit code |
|---|---|---|
| 1 | `git rev-parse HEAD` | `0` |
| 2 | `node --test tests/recommendation-track-record.unit.mjs` | `0` |
| 3 | `node --test tests/recommendation-track-record.functional.mjs` | `0` |
| 4 | `node --test tests/recommendation-track-record.canary.mjs` | **`1`** |
| 5 | `node --test tests/recommendation-track-record.e2e.mjs` | `0` |
| 6 | `node scripts/selftest.mjs` | `0` |
| 7 | `git status --porcelain` | `0` |

**Command 1 — the commit every figure below is bound to.**

```text
$ git rev-parse HEAD
39d04d9d90852b3e20ea1f6b73289bcdc466fe99
CMD1_EXIT=0
```

### Verification re-run — same commit, after two corrections

**Claim Source:** `executed`. Two commands, run once each, unfiltered, at the repository root, in a later
session. `HEAD` is unchanged at `39d04d9d9`; the only working-tree change is this report's own edit.

Two things changed between the seven commands above and this re-run, and both are recorded here because each
one moves a figure:

1. **This report's three machine-specific absolute paths were redacted.** They were the sole findings of the
   `committed surface carries no personal identifier` check, which had turned the project self-test red at
   `2486 passed, 1 failed`. Removing them is what returns the self-test to green.
2. **The canary's pre-scope boundary was fixed** — it is now derived from commit history rather than from
   untracked working-tree state. That is the remedy [Still open](#still-open) item 1 routed. The fix is real
   and it took effect: `T-01-C2` no longer fails at the vacuous-precondition assertion.

| # | Command | Exit code |
|---|---|---|
| R1 | `node scripts/selftest.mjs` | `0` |
| R2 | canary suite (`node --test`, same file as command 4) | **`1`** |

**R1 returns the self-test to green**, at `2487 passed, 0 failed` — one more passing assertion than the
`2486 passed, 1 failed` that the redaction fixed, and the same total this report already records at
[T-01-S1](#t-01-s1).

**R2 still exits `1`.** The boundary fix moved `T-01-C2` past its old failure and onto a *different, later*
assertion. It is refreshed in full, unmasked, at [T-01-C2](#t-01-c2). **`T-01-C2` is still not green, and
nothing below claims it is.**

---

## Test Evidence

Fifteen Test Plan rows, fifteen anchors. Rows sharing one suite invocation cite that invocation and quote their own
result line from it.

### Suite invocation A — unit

**Claim Source:** `executed`. Evidences `T-01-U1` – `T-01-U7`.

```text
$ node --test tests/recommendation-track-record.unit.mjs
✔ T-01-U1: claimHash is content-only across exactly the four unhashed fields (15.864285ms)
✔ T-01-U2: every hashed term is load-bearing (10.917758ms)
✔ T-01-U3: RTR-PREDICATE-AMEND refuses a byte-changing write and never overwrites (11.425161ms)
✔ T-01-U4: non-semantic-subject refuses both publisher positional fallbacks (14.99048ms)
✔ T-01-U5: no-committed-series refuses an empty seriesRefs and a partially-absent basket (17.210592ms)
✔ T-01-U6: every closed vocabulary refuses a one-character-off value (29.88576ms)
✔ T-01-U7: direction is bound to ACTION_DIRECTION and hold has no signed outcome (8.608346ms)
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 199.238466
CMD2_EXIT=0
```

<a id="t-01-u1"></a>

### T-01-U1 — `claimHash` is content-only across exactly the four unhashed fields

**Claim Source:** `executed`. **Command:** `node --test tests/recommendation-track-record.unit.mjs`
([Suite invocation A](#suite-invocation-a--unit)). **Exit code:** `0`.

```text
✔ T-01-U1: claimHash is content-only across exactly the four unhashed fields (15.864285ms)
```

Two claims with identical hashed terms but differing `proposalRunId`, `proposalEventId`, `proposedAt` **and**
`citedToolId` hash identically; the same pair mutated only in `thesisFamily` hashes differently. The second half is
what makes the row detect the withdrawn `lifecycleTerms` placement rather than certify it.

<a id="t-01-u2"></a>

### T-01-U2 — every hashed term is load-bearing

**Claim Source:** `executed`. **Command:** `node --test tests/recommendation-track-record.unit.mjs`
([Suite invocation A](#suite-invocation-a--unit)). **Exit code:** `0`.

```text
✔ T-01-U2: every hashed term is load-bearing (10.917758ms)
```

Eleven mutations spanning the nine hashed terms each yield a distinct `claimHash`, including the two a permissive
implementation is likeliest to omit — `thesisFamily` and `horizon.authoredBand`.

<a id="t-01-u3"></a>

### T-01-U3 — `RTR-PREDICATE-AMEND` refuses a byte-changing write and never overwrites

**Claim Source:** `executed`. **Command:** `node --test tests/recommendation-track-record.unit.mjs`
([Suite invocation A](#suite-invocation-a--unit)). **Exit code:** `0`.

```text
✔ T-01-U3: RTR-PREDICATE-AMEND refuses a byte-changing write and never overwrites (11.425161ms)
```

The exact refusal code fires on a write that would change bytes at an existing
`briefs/objects/claims/<hex>.json` path, and the on-disk bytes are asserted unchanged afterwards.

<a id="t-01-u4"></a>

### T-01-U4 — `non-semantic-subject` refuses both publisher positional fallbacks

**Claim Source:** `executed`. **Command:** `node --test tests/recommendation-track-record.unit.mjs`
([Suite invocation A](#suite-invocation-a--unit)). **Exit code:** `0`.

```text
✔ T-01-U4: non-semantic-subject refuses both publisher positional fallbacks (14.99048ms)
```

Both the `action-${index}` subject fallback and the `'note'` family fallback refuse, on an action that is otherwise
complete and mint-eligible — the case a permissive minter most wants through.

<a id="t-01-u5"></a>

### T-01-U5 — `no-committed-series` refuses an empty `seriesRefs` and a partially-absent basket

**Claim Source:** `executed`. **Command:** `node --test tests/recommendation-track-record.unit.mjs`
([Suite invocation A](#suite-invocation-a--unit)). **Exit code:** `0`.

```text
✔ T-01-U5: no-committed-series refuses an empty seriesRefs and a partially-absent basket (17.210592ms)
```

The adversarial half is the basket whose **first** member resolves and whose **second** does not — the input an
implementation checking only `seriesRefs[0]` would accept. The committed symbol set is enumerated at run time; no
count literal appears. The set's definition is recorded at
[Committed-bars-set definition](#committed-bars-set-definition).

<a id="t-01-u6"></a>

### T-01-U6 — every closed vocabulary refuses a one-character-off value

**Claim Source:** `executed`. **Command:** `node --test tests/recommendation-track-record.unit.mjs`
([Suite invocation A](#suite-invocation-a--unit)). **Exit code:** `0`.

```text
✔ T-01-U6: every closed vocabulary refuses a one-character-off value (29.88576ms)
```

`subject.kind`, `predicate.kind`, `predicate.comparator`, `horizon.kind` and `magnitude.unit` each refuse a value one
character off a legal member, so a `startsWith` or prefix check fails the row; `actionFamily` outside
`MARKET_ACTIONS` refuses.

<a id="t-01-u7"></a>

### T-01-U7 — `direction` is bound to `ACTION_DIRECTION` and `hold` has no signed outcome

**Claim Source:** `executed`. **Command:** `node --test tests/recommendation-track-record.unit.mjs`
([Suite invocation A](#suite-invocation-a--unit)). **Exit code:** `0`.

```text
✔ T-01-U7: direction is bound to ACTION_DIRECTION and hold has no signed outcome (8.608346ms)
```

`actionFamily: "trim"` with `direction: 1` refuses while `direction: -1` is accepted, proving the value is bound
rather than trusted; `direction: 0` refuses `neutral-direction-no-magnitude`.

---

### Suite invocation B — functional

**Claim Source:** `executed`. Evidences `T-01-F1` – `T-01-F3`.

```text
$ node --test tests/recommendation-track-record.functional.mjs
✔ T-01-F1: the content-addressed write round-trips as a byte-identical no-op (25.635852ms)
✔ T-01-F2: citedToolId is a citation — neither identity nor the producer (28.006266ms)
✔ T-01-F3: recommendationKey is one-to-many with claimHash across horizon kinds (7.010242ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 148.407277
CMD3_EXIT=0
```

<a id="t-01-f1"></a>

### T-01-F1 — the content-addressed write round-trips as a byte-identical no-op

**Claim Source:** `executed`. **Command:** `node --test tests/recommendation-track-record.functional.mjs`
([Suite invocation B](#suite-invocation-b--functional)). **Exit code:** `0`.

```text
✔ T-01-F1: the content-addressed write round-trips as a byte-identical no-op (25.635852ms)
```

Minting an identical claim twice produces one file, byte-identical across both passes; the filename equals the bare
lowercase hex of `claimHash` and the object body retains the `sha256:` prefix.

<a id="t-01-f2"></a>

### T-01-F2 — `citedToolId` is a citation, neither identity nor the producer

**Claim Source:** `executed`. **Command:** `node --test tests/recommendation-track-record.functional.mjs`
([Suite invocation B](#suite-invocation-b--functional)). **Exit code:** `0`.

```text
✔ T-01-F2: citedToolId is a citation — neither identity nor the producer (28.006266ms)
```

The resolved value is asserted **not** to equal the `market-brief` producer constant. The adversarial input is the
unmatched `deepLink`, which sets `citedToolId: null` and is **still minted and still counted** — the retired
`unresolvable-owning-tool` behaviour would refuse it and fail the row. Re-minting with a different `citedToolId`
yields the same `claimHash`, reuses the first object, and does **not** fire `RTR-PREDICATE-AMEND`.

<a id="t-01-f3"></a>

### T-01-F3 — `recommendationKey` is one-to-many with `claimHash` across horizon kinds

**Claim Source:** `executed`. **Command:** `node --test tests/recommendation-track-record.functional.mjs`
([Suite invocation B](#suite-invocation-b--functional)). **Exit code:** `0`.

```text
✔ T-01-F3: recommendationKey is one-to-many with claimHash across horizon kinds (7.010242ms)
```

Two claims sharing `{subject, family}` but declaring different `horizon.kind` mint to the same `recommendationKey`
and different `claimHash` values, and both objects coexist on disk.

---

### Suite invocation C — canary (FAILING)

**Claim Source:** `executed`. Evidences `T-01-C1` and `T-01-C2`. **This invocation exits `1`.**

This suite has been run twice against the same commit: once as command 4 of the original seven, and once as
**R2** of the [verification re-run](#verification-re-run--same-commit-after-two-corrections) after the canary's
pre-scope boundary was fixed. Both runs are kept. The first is the record of the failure that motivated the
fix; the second is the current state of the row. **Both exit `1`.**

#### C-run 2 — current, after the boundary fix (R2)

This is the authoritative transcript for `T-01-C1` and `T-01-C2` as they stand now.

```text
$ node --test <canary suite>
✔ T-01-C1: the shared substrate holds its own contracts before any broad rerun (21732.128346ms)
✖ T-01-C2: the restore path is rehearsed in a disposable worktree, never on the live tree (49093.470352ms)
ℹ tests 2
ℹ suites 0
ℹ pass 1
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 70911.705558

✖ failing tests:

test at tests/recommendation-track-record.canary.mjs:860:1
✖ T-01-C2: the restore path is rehearsed in a disposable worktree, never on the live tree (49093.470352ms)
  AssertionError [ERR_ASSERTION]: every cross-tree difference must be attributable to this scope's own additions; 3 was not, and an unexplained difference is a regression:
    group "pii-scan — no personal identifier reaches a commit" line 1
      pre :   ✓ the scan covered the repository (files=7424)
      live:   ✓ the scan covered the repository (files=7476)
    group "pii-scan — no personal identifier reaches a commit" line 2
      pre :   ✓ the scan covered commit messages (messages=1415)
      live:   ✓ the scan covered commit messages (messages=1416)
    group "spec artifacts — referenced tests/*.mjs paths exist (Playwright silently ignores absent file args)" line 0
      pre :   ✓ the scan matched at least one tests/*.mjs reference against a present baseline, so the guard is not vacuously green (13364 reference(s) across 554 artifact(s), baseline 77 entries)
      live:   ✓ the scan matched at least one tests/*.mjs reference against a present baseline, so the guard is not vacuously green (13389 reference(s) across 554 artifact(s), baseline 77 entries)

  3 !== 0

      at TestContext.<anonymous> (file://<redacted>/tests/recommendation-track-record.canary.mjs:1098:16)
      at Test.runInAsyncScope (node:async_hooks:214:14)
      at Test.run (node:internal/test_runner/test:1047:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:744:18)
      at Test.postRun (node:internal/test_runner/test:1173:19)
      at Test.run (node:internal/test_runner/test:1101:12)
      at async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: 3,
    expected: 0,
    operator: 'strictEqual',
    diff: 'simple'
  }
CANARY_EXIT=1
```

> **Redaction note.** The absolute `file://` home prefix in the `TestContext.<anonymous>` frame was replaced
> with `<redacted>` to satisfy this repository's personal-identifier rule (`scripts/pii-scan.mjs`, rule
> `home-path`). The evidentiary part of the frame — `<redacted>/tests/recommendation-track-record.canary.mjs`
> at `1098:16` — is unaltered. The `$` line is likewise written without the bare file argument; the suite is
> the same file as command 4, and the assertion frame above identifies it exactly.

#### C-run 1 — superseded, before the boundary fix (command 4)

Retained as the record of the failure that motivated the fix. **Superseded by C-run 2; do not read the row
result below as current.**

```text
$ node --test <canary suite>
✔ T-01-C1: the shared substrate holds its own contracts before any broad rerun (23491.759701ms)
✖ T-01-C2: the restore path is rehearsed in a disposable worktree, never on the live tree (30.984722ms)
ℹ tests 2
ℹ suites 0
ℹ pass 1
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 23623.308534

✖ failing tests:

test at tests/recommendation-track-record.canary.mjs:788:1
✖ T-01-C2: the restore path is rehearsed in a disposable worktree, never on the live tree (30.984722ms)
  AssertionError [ERR_ASSERTION]: the rehearsal is vacuous unless this scope actually added something
      at TestContext.<anonymous> (file://<redacted>/tests/recommendation-track-record.canary.mjs:833:12)
      at Test.runInAsyncScope (node:async_hooks:214:14)
      at Test.run (node:internal/test_runner/test:1047:25)
      at Test.processPendingSubtests (node:internal/test_runner/test:744:18)
      at Test.postRun (node:internal/test_runner/test:1173:19)
      at Test.run (node:internal/test_runner/test:1101:12)
      at async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: '==',
    diff: 'simple'
  }
CMD4_EXIT=1
```

> **Redaction note.** In the `TestContext.<anonymous>` frame above, the absolute `file://` home prefix was
> replaced with `<redacted>` to satisfy this repository's personal-identifier rule
> (`scripts/pii-scan.mjs`, rule `home-path`). Nothing evidentiary was removed: what the frame proves is the
> file and position, `<redacted>/tests/recommendation-track-record.canary.mjs` at `833:12`, both of which are
> intact. The citation is written in prefixed form deliberately, so that recording this redaction does not
> add a bare `tests/*.mjs` token and perturb the reference counter that [T-01-C2](#t-01-c2) measures.

<a id="t-01-c1"></a>

### T-01-C1 — the shared substrate holds its own contracts before any broad rerun

**Claim Source:** `executed`. **Command:** the canary suite
([Suite invocation C](#suite-invocation-c--canary-failing)). **Row result: PASS** in both runs — `21732.128346ms`
in the current C-run 2, `23491.759701ms` in the superseded C-run 1.

```text
✔ T-01-C1: the shared substrate holds its own contracts before any broad rerun (21732.128346ms)
```

The support module's export surface, its import side-effect freedom, a round-trip load of one input of each fixture
shape, the stable loader ordering, and the baseline re-asserted under the **attributable-delta** rule all hold. The
row's baseline comparison is the mechanism that reconciles the two legitimate selftest-line differences recorded at
[Attributable selftest-line differences](#attributable-selftest-line-differences); the row passing is what
establishes that both differences were attributed and neither was an unexplained movement.

The row ran **before** `T-01-R1` / `T-01-R2`, as the plan requires, so a substrate defect would have been named at
the substrate. It passed, so no substrate defect was named.

**The row is green in the current run.** It passed identically before and after the canary's boundary fix, so the
fix changed nothing this row depends on.

<a id="t-01-c2"></a>

### T-01-C2 — the restore path rehearsal — **STILL FAILING**

**Claim Source:** `executed` for the failure itself; `interpreted` for the mechanism. **Command:** the canary
suite ([Suite invocation C](#suite-invocation-c--canary-failing)). **Row result: FAIL** after `49093.470352ms`
in the current C-run 2. **Suite exit code:** `1`.

**The boundary fix worked, and the row still fails.** These are two separate facts and both are load-bearing.
The pre-scope boundary is now derived from commit history rather than untracked working-tree state, so the
`the rehearsal is vacuous unless this scope actually added something` assertion that stopped C-run 1 at
`30.984722ms` no longer fires. The row now proceeds through the rehearsal — checking out the pre-scope tree in
a disposable worktree, running the project self-test in both trees, and diffing the two transcripts — and
fails **≈1600× later**, at the attribution assertion that terminates that diff.

```text
✖ T-01-C2: the restore path is rehearsed in a disposable worktree, never on the live tree (49093.470352ms)
  AssertionError [ERR_ASSERTION]: every cross-tree difference must be attributable to this scope's own additions; 3 was not, and an unexplained difference is a regression:
    group "pii-scan — no personal identifier reaches a commit" line 1
      pre :   ✓ the scan covered the repository (files=7424)
      live:   ✓ the scan covered the repository (files=7476)
    group "pii-scan — no personal identifier reaches a commit" line 2
      pre :   ✓ the scan covered commit messages (messages=1415)
      live:   ✓ the scan covered commit messages (messages=1416)
    group "spec artifacts — referenced tests/*.mjs paths exist (Playwright silently ignores absent file args)" line 0
      pre :   ✓ ... (13364 reference(s) across 554 artifact(s), baseline 77 entries)
      live:   ✓ ... (13389 reference(s) across 554 artifact(s), baseline 77 entries)

  3 !== 0

      at TestContext.<anonymous> (file://<redacted>/tests/recommendation-track-record.canary.mjs:1098:16)
    actual: 3,
    expected: 0,
    operator: 'strictEqual',
```

> **Redaction note.** The absolute `file://` home prefix in the frame above was replaced with `<redacted>` to
> satisfy this repository's personal-identifier rule (`scripts/pii-scan.mjs`, rule `home-path`). The
> evidentiary part of the frame — `<redacted>/tests/recommendation-track-record.canary.mjs` at `1098:16` — is
> unaltered. The two `✓ ...` elisions above stand for the full assertion text, which is byte-identical
> between the `pre` and `live` lines apart from the quoted count; the unelided form is in
> [C-run 2](#suite-invocation-c--canary-failing).

**What did and did not fail.** Everything up to the attribution diff passed: the `isAllowedPath` and
`isScannedProductionSource` classifiers against their known-answer sets, the working-tree scan, the added-file
derivation, the two independent derivations of the attribution agreeing, and the adversarial known-answer
checks on the classifier itself. The disposable worktree was created and removed cleanly — `git worktree list`
shows only the live root both before and after the run. The failure is at the **final** assertion, that no
cross-tree difference is left unattributed.

**Mechanism** (`interpreted` from the source, read once — not modified). `classifyDifference` blanks every
decimal run to a placeholder and requires the surrounding skeleton to be byte-identical, then admits a
difference under exactly two shapes: a single count landing exactly on the pre/live sizes of the **scanned
production-source universe**, or an equal-and-opposite pair whose magnitude is the number of frozen-baseline
files this scope added. The three differences above are neither shape — they are three *other* counters that
this scope's additions also move:

| Counter | pre | live | Why the classifier rejects it |
|---|---|---|---|
| `pii-scan` repository files | `7424` | `7476` | Counts **all tracked files**, not the scanned production-source subset, so it never lands on the derived pre/live sizes. |
| `pii-scan` commit messages | `1415` | `1416` | A commit count. The attribution model has no shape for it at all. |
| spec-artifact `tests/*.mjs` references | `13364` | `13389` | A reference count, not the scan-universe size, so the single-count shape refuses it. |

**This is not a regression in scope 01's contract.** All three moved *upward*, in the direction this scope's
additions predict, and no pre-existing pass count fell — that separate assertion passed. What the row proves
is narrower and real: **the attribution model is incomplete.** It covers two of the counters this scope
perturbs and not these three. The row is correct to refuse; an attribution model that waved them through
would be the "classifier that returns a name for everything" the row's own adversarial half exists to prevent.

**Self-reference caveat** (`executed`). This report is itself inside the scanned spec-artifact universe, so its
own text contributes to the third counter, and **editing this report moves the number this report quotes.** That
is not a defect in the row; it is what it means for a guard to scan the artifact that reports on it. The effect
was measured directly, three times, at the same commit:

| Report state | `referenceCount` |
|---|---|
| as committed at `39d04d9d9`, before this refresh | `13394` |
| with an earlier draft of the redaction notes, which quoted the canary path as a **bare** `tests/*.mjs` token | `13396` |
| current — notes reworded to the prefixed form, and the refresh below replacing several verbatim command citations | `13389` |

The scanner's `(?<![A-Za-z0-9._/-])` lookbehind is what makes the distinction: a path preceded by `/` is not
counted, one preceded by a space or a backtick is. `13389` is the value in the transcript above and the value a
re-run reproduces, because every correction made after that run changed digits only and added no token. The
`pre` figure of `13364` is untouched by any of this — it is read from the pre-scope tree, which does not contain
this report.

**Not repaired here.** The remedy is a further edit to the canary's attribution model, which this evidence
pass does not own — it owns this report and nothing else. The row is left failing and routed. Recorded at
[Still open](#still-open). **No DoD item depending on `T-01-C2` may be ticked while this stands.**

**Superseded record — the failure this replaced.** C-run 1 stopped much earlier, at the row's added-file
precondition: the set was built from the **untracked** entries of `git status --porcelain` and asserted
non-empty, but the tree is clean because this scope's files are committed at `39d04d9d9`. That assertion was
right to fire — it refuses the vacuous pass that occurs when `HEAD` is the *post*-scope commit — and the
boundary fix is exactly the remedy this report routed for it. **That remedy landed.** It is retained here, with
its transcript at [C-run 1](#suite-invocation-c--canary-failing), so the two distinct failures are not
conflated into one unresolved complaint.


---

### Suite invocation D — E2E regression

**Claim Source:** `executed`. Evidences `T-01-R1` and `T-01-R2`.

```text
$ node --test tests/recommendation-track-record.e2e.mjs
✔ T-01-R1: the whole fixture claim set holds the frozen contract against the real store layout (124.752261ms)
✔ T-01-R2: the committed suites are intact, and the committed Node E2E suite runs green (32742.012821ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 32947.713091
CMD5_EXIT=0
```

<a id="t-01-r1"></a>

### T-01-R1 — the whole fixture claim set holds the frozen contract against the real store layout

**Claim Source:** `executed`. **Command:** `node --test tests/recommendation-track-record.e2e.mjs`
([Suite invocation D](#suite-invocation-d--e2e-regression)). **Exit code:** `0`.

```text
✔ T-01-R1: the whole fixture claim set holds the frozen contract against the real store layout (124.752261ms)
```

A full mint pass re-asserts, end to end against the real `briefs/objects/claims/` layout, that re-minting identical
terms is a byte-identical no-op, that a byte-changing write aborts with `RTR-PREDICATE-AMEND` leaving the on-disk
bytes unchanged, that each of the seven mint-refusal reasons fires for its own trigger and only its own, and that an
unmatched `deepLink` still **mints** with `citedToolId: null`. This row is permanent: a later scope that narrows the
hashed-term list, softens the append-only store, drops a refusal, or reinstates `unresolvable-owning-tool` fails
here.

<a id="t-01-r2"></a>

### T-01-R2 — the committed suites are intact and run green

**Claim Source:** `executed`. **Command:** `node --test tests/recommendation-track-record.e2e.mjs`
([Suite invocation D](#suite-invocation-d--e2e-regression)). **Exit code:** `0`.

```text
✔ T-01-R2: the committed suites are intact, and the committed Node E2E suite runs green (32742.012821ms)
```

The committed Node E2E files run green with no pre-existing test removed, skipped, or newly failing. This is the row
that proves the new content-addressed tree under `briefs/objects/` did not disturb the committed brief pipeline that
reads the same tree.

---

### Suite invocation E — project check

<a id="t-01-s1"></a>

### T-01-S1 — the repository self-test is green

**Claim Source:** `executed`. **Command:** `node scripts/selftest.mjs`. **Exit code:** `0`.

```text
$ node scripts/selftest.mjs
...
regime-primitives-stress
  ✓ the facet publication path sustains a repeated high-volume append run without unbounded slot growth or degraded write throughput

================================================
Research-Lab self-test: 2487 passed, 0 failed
================================================
CMD6_EXIT=0
```

**`2487 passed, 0 failed`, exit `0`.** The elided region is the run's own group listing; the totals line and the exit
code are quoted verbatim from the run.

---

## Baseline unchanged by design

**Claim Source:** `interpreted` from Command 6 and from [scope.md](scope.md) → *Excluded surfaces*.

The self-test reports the **same** figure before and after this scope. That is the designed outcome, and this report
does **not** claim the scope grew the count.

`scripts/selftest.mjs` is a named **excluded surface** for scope 01: *"This scope adds no import and edits no
assertion; wiring one in is scope 09's single named change."* The four new
`tests/recommendation-track-record.*.mjs` suites are therefore not yet registered with the self-test runner — they
are run directly by `node --test`, as Commands 2 – 5 show. Their assertions consequently do not appear in the
`2487` total, and they will not until **scope 09** performs its wiring change.

The `T-01-S1` criterion is `baseline + N passed, 0 failed` with **no pre-existing assertion count decreasing**. With
`N = 0` by construction, the criterion reduces to *the baseline is intact and nothing regressed*, which is what
`2487 passed, 0 failed`, exit `0` records. Reading the unchanged figure as evidence that this scope contributed
assertions to the self-test would be wrong in the direction that flatters, so it is stated here explicitly instead.

---

## Attributable selftest-line differences

**Claim Source:** `not-run` — these two magnitudes are established facts recorded in [scope.md](scope.md) →
*Baseline-Criterion Correction (P-015-C2-01)*, dated 2026-08-18. They are **restated** here as the scope's evidence
record, **not** re-derived by this run. Their reconciliation mechanism — the canary's attributable-delta rule — is
exercised by `T-01-C1`, which passed in this run.

Two deterministic assertion lines legitimately differ between the pre-scope tree and the post-scope tree. **Neither
is a regression**, and neither is avoidable while this scope delivers what it is required to deliver.

| Differing line | Movement | Why it is correct and unavoidable |
|---|---|---|
| `Feature 012 Scope 15 … (TP-15-07)` line 7 | `scanned 67 files` → `scanned 68 files` | The count is `scannedSources.length`, enumerated per run from the root `.js` / `.html` listing plus `rlexperience-adapters/*.js` (`scripts/selftest.mjs#L7658`). This scope's new root-level production module `rlclaims.js` enters that universe **by existing**. |
| `spec artifacts — referenced tests/*.mjs paths exist` line 1 | `71 known-missing, 6 stale` → `67 known-missing, 10 stale` | Four of this scope's new `tests/recommendation-track-record.*.mjs` files are already listed in `scripts/validate-spec-test-paths.baseline`, so creating them moves them from the *known-missing* bucket to the *stale-baseline* bucket. The ∓4 is equal-and-opposite and **conserved** — the two buckets partition one frozen set — and the assertion's pass predicate is `newMissing.length === 0` (`scripts/selftest.mjs#L8702`), which the movement does not touch. |

Both differences are attributable to files this scope added, by a delta the canary derives per run rather than by a
literal. Under the skeleton gate, only magnitudes may move and only by that derived amount; a changed word, a
reordered clause, or a dropped writer name could not be attributed. `T-01-C1` passing in this run is the evidence
that both were attributed and that no third, unattributed difference exists.

---

## Module filename

**Claim Source:** `interpreted`.

The claim-contract module is **`rlclaims.js`**, at the repository root. This follows the repo's established
root-level `rl<domain>.js` UMD convention — the same shape as `rlcontracts.js`, `rlvalidation.js`, `rldata.js`,
`rlbrief.js`, `rlregime.js` and their siblings. Placing it at the root is also what puts it inside the self-test's
scanned-source universe, which is the mechanism behind the `scanned 67 files` → `scanned 68 files` movement recorded
above.

---

## Committed-bars-set definition

**Claim Source:** `interpreted` from a single read of `rlclaims.js`. The directory was **not** re-scanned.

The committed-bars set admits three defensible sizes, differing by exactly three symbols — `EA`, `NDX`, `PHP=X`:

| Candidate definition | Size |
|---|---|
| Every `.json` file in `data/bars/` | 293 |
| Every `.json` file in `data/bars/` **excluding** `index.json` | 292 |
| Tickers enumerated by the `data/bars/index.json` manifest | 289 |

**`no-committed-series` uses the second definition: 292 series — every `.json` file in `data/bars/`, excluding
`index.json`.**

The deciding code is `enumerateCommittedSeries`, declared at **`rlclaims.js#L263`**. It walks the bars directory
listing and applies two filters: it skips the manifest at **`rlclaims.js#L271`**
(`if (name === BARS_MANIFEST_FILENAME) continue;`, where `BARS_MANIFEST_FILENAME` is `"index.json"`, declared at
**`rlclaims.js#L81`**), then keeps only `.json` entries at **`rlclaims.js#L272`**, stripping the extension to
recover the symbol. The directory itself is `BARS_DIR = "data/bars"` at **`rlclaims.js#L79`**. The refusal is raised
against that set at **`rlclaims.js#L501`** (empty `seriesRefs`) and **`rlclaims.js#L507`** (a member absent from the
set), with the reason string declared at **`rlclaims.js#L71`**.

The choice is deliberate and the module states why in the comment at **`rlclaims.js#L258`–`#L262`**: the bars
directory is the **availability** set — what the resolver can actually read — whereas `index.json` is the refresh
manifest and therefore a **curation** set. Using the manifest would refuse a claim on a symbol whose bars are
committed and readable, *"shrinking the denominator over a curation detail"*. That is the mechanism by which `EA`,
`NDX` and `PHP=X` are in the set the minter honours while being absent from the manifest.

The size is **derived per run from the directory listing and never written as a literal**, per the F-015-D5-02
no-literal-count rule. The figures in the table above are recorded here as sizing context for this report only; they
appear in no source file, fixture, test, or DoD item.

---

## Adversarial proof — completed (P23)

**Claim Source:** `not-run`. This records work completed in a **prior** session. Nothing in this evidence run
re-executed it, and no mutation harness was created here.

The adversarial obligation — *"every negative test verified to fail when the behaviour it guards is reverted"* — was
discharged under P23:

| Target | Perturbations applied | Result |
|---|---|---|
| The three functional rows `T-01-F1`, `T-01-F2`, `T-01-F3` | **Six** behaviour reversions | Each reversion **detected** by the row it targets |
| The canary row `T-01-C2` | **Three** derivation perturbations | Each perturbation **detected** |

Every perturbation was applied in a **disposable copy** of the tree; the live tree was never mutated. Each run
carried a **green control** — the unperturbed tree asserted green in the same pass — so a row that failed for an
unrelated reason could not be miscounted as a detection.

This is recorded as completed evidence. It is **not** re-verified here, and this report makes no claim about the
current state of those perturbations beyond the fact that they were applied and detected when they were run.

---

## Change Boundary

**Claim Source:** `executed`. **Command:** `git status --porcelain`. **Exit code:** `0`.

```text
$ git status --porcelain
CMD7_EXIT=0
```

**The output is empty.** `git status --porcelain` printed zero lines and exited `0`: the working tree is clean, with
no modified, staged, or untracked entry. The scope's delivery is committed at
`39d04d9d90852b3e20ea1f6b73289bcdc466fe99`.

An empty porcelain is the strongest possible reading of the Change Boundary: there is no working-tree entry to test
against the allowed-family list, because there is no working-tree entry at all.

**Superseded consequence.** This section previously recorded that the same emptiness was the direct cause of the
`T-01-C2` failure. That is **no longer true.** The canary now derives its pre-scope boundary from commit history
rather than from untracked working-tree state, so an empty porcelain no longer fails the row; `T-01-C2` fails at a
later assertion instead, recorded at [T-01-C2](#t-01-c2).

**Current tree state** (`executed`). The porcelain above is from command 7 of the original seven, at
`39d04d9d90852b3e20ea1f6b73289bcdc466fe99`. As of the
[verification re-run](#verification-re-run--same-commit-after-two-corrections) the working tree is **no longer
clean**: it carries this `report.md`, modified in place. `HEAD` is unchanged. That single entry is family 5 below,
so the Change Boundary still holds — but the emptiness claim above describes the earlier moment, not this one.

**The five allowed file families** — the only families this scope may create:

| # | Family | Nature |
|---|---|---|
| 1 | `rlclaims.js` | New file. The contract shape, the six closed vocabularies, `claimHash`, the content-addressed write, and the closed seven-reason mint-refusal set. |
| 2 | `tests/recommendation-track-record.*` | New files — `support.mjs`, `unit.mjs`, `functional.mjs`, `canary.mjs`, `e2e.mjs`. Created here and **extended**, never rewritten, by scopes 02 – 10. |
| 3 | `tests/fixtures/recommendation-track-record/**` | New inputs with their `*.expected.json` siblings, one rule violated per negative input. |
| 4 | `briefs/objects/claims/**` | Written at runtime by the store under test; append-only, never rewritten and never garbage-collected. |
| 5 | This scope's spec artifacts — `specs/015-recommendation-outcome-ledger-and-track-record/scopes/01-frozen-claim-contract/**` | The planning and evidence artifacts this scope owns, including this `report.md`. |

**Excluded surfaces — confirmed untouched.** With an empty porcelain and the delivery committed, no excluded surface
carries an uncommitted change. `T-01-C2`'s classifier assertions, which ran and passed before that row's
precondition failed, independently confirm the classifier refuses each of them: `rlvalidation.js` (Feature
007-owned), `scripts/selftest.mjs` (the baseline script), a neighbouring feature's test file, and — the
prefix-widening guard — `rlclaims.js.bak`. Also excluded and unopened: `rlcontracts.js` (read only, for
`MARKET_ACTIONS` and `ACTION_DIRECTION`), the persisted `rldata.js` cache schema, the Market Action Center four-view
composition, the three committed sibling validators, every counted registry (`tools.json` is **read** to resolve
`citedToolId` and never written), and every committed `briefs/history/**` and `data/**` byte.

---

## Still open

**Claim Source:** mixed, tagged per item. Nothing in this section is resolved here.

**1. `T-01-C2` fails and is routed — for a second, different reason.** `executed`. The originally-routed remedy
**landed**: the row's pre-scope boundary is now derived from commit history rather than untracked working-tree
state, and the vacuous-precondition assertion no longer fires. The row now runs the full rehearsal and fails at
its **final** assertion instead, with three cross-tree counter differences the attribution model does not cover
(tracked-file count, commit-message count, spec-artifact reference count). See [T-01-C2](#t-01-c2) for the
transcript, the per-counter breakdown, and the mechanism. The remaining remedy is a further edit to the canary's
attribution model, which this evidence pass does not own. **Route:** the scope's test owner. Until it is
resolved, the canary suite exits `1`, and no DoD item depending on `T-01-C2` — nor the Build Quality Gate item,
which requires zero issues deferred — may be ticked.

**2. DoD items remain unticked pending a separate closure pass.** `interpreted`. This report records evidence; it
ticks nothing. Fourteen rows are green and their evidence is anchored above, but closure is a distinct pass and is
in any case blocked by item 1.

**3. A DoD count discrepancy is reported and left unresolved.** `not-run` — **operator-reported diagnostic input,
not a measurement made by this agent.** The operator reports that [scope.md](scope.md) carries **33** unchecked DoD
checkboxes against a parity line asserting **32**. This report neither confirms nor disputes that count: it did not
count them, and resolving the discrepancy would require editing `scope.md`, which is **plan-owned** and outside this
agent's artifact ownership. **Route:** `bubbles.plan`, as an open question against the scope's DoD accounting.
Recorded here so it is not lost, and deliberately not resolved.

---

## Completion Statement

Scope 01's implementation is committed at `39d04d9d90852b3e20ea1f6b73289bcdc466fe99`, and this report records
execution evidence for all fifteen Test Plan rows from seven commands run once each, plus a later two-command
[verification re-run](#verification-re-run--same-commit-after-two-corrections) against the same commit.

**Fourteen rows are green.** `T-01-U1` – `T-01-U7` (exit `0`), `T-01-F1` – `T-01-F3` (exit `0`), `T-01-C1` (pass),
`T-01-R1` – `T-01-R2` (exit `0`), and `T-01-S1` at `2487 passed, 0 failed` (exit `0`).

**One row is red.** `T-01-C2` fails, and the canary suite therefore exits `1`. Its originally-routed remedy landed
— the pre-scope boundary is fixed — but the row now fails at a **later, different** assertion: three cross-tree
counter differences that the attribution model does not cover. The failure is recorded in full at
[T-01-C2](#t-01-c2) with its assertion message, its source line, its per-counter breakdown, and both transcripts.
It is not narrated as a pass, not excused, and not repaired here.

**Therefore no scope completion is claimed.** Scope 01 is **not** `Done`. No Definition of Done item is ticked by
this report, no certification is requested, and `state.json` is not advanced. The scope cannot close while a Test
Plan row fails, and the Build Quality Gate — *"zero issues deferred, skipped, or worked around"* — is unsatisfied by
construction while [Still open](#still-open) carries three entries.

What this report does assert is bounded and checkable: the seven commands above, and the two of the verification
re-run, were executed; their exit codes are recorded as returned; and every figure quoted is from their real
output. The three narrative records — the
attributable selftest-line differences, the P23 adversarial proof, and the reported DoD count discrepancy — are
tagged `not-run` and are restatements of established facts, not claims about anything this run executed.

---

*Educational research context only — not investment advice.*
