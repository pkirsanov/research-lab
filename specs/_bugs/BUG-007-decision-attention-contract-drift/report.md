# Report: BUG-007 — Decision-Attention Contract Drift

## Summary

The reported defect is **real and fully reproducible at commit `cc990911d`**, and is **not
reproducible at current `HEAD` `aeb1bcbc3`**. Commit `aeb1bcbc3`, authored roughly two hours
before this packet, recomposed `market-brief.payload.json` through the certified composer
and closed all seven failing assertions at once. This run verified the closure by
measurement, enumerated the three failures previously lost to scrollback, determined the
failure-family structure rather than assuming it, and established that the durable control
against the 4×/day regeneration lifecycle already sits on the publish path.

**Nothing in this packet was fixed by this run.** No source file, artifact, or test outside
this bug folder was modified. The correction to the original report is that a fix was not
required — one had already shipped.

**Final-state caveat.** While this packet was being authored, a concurrent writer modified
`market-brief.payload.json` and `tests/attention-payload-contract.test.mjs`, leaving the tree
dirty and the suite at `1369 passed, 1 failed`, exit 1. That failure is **not** a BUG-007
regression — see §E10. Every green measurement below is scoped to the clean `HEAD` revision
at which it was taken.

## Completion Statement

Scope 1 (verify the defect, its family structure, and its closure) is **Done**, with every
DoD item backed by an executed command whose raw output is embedded inline in
[`scopes.md`](scopes.md). Scope 2 (residual observations) is **Not started** and carries
three open items with explicit `not-run` / `interpreted` claim sources. No certification is
asserted.

---

## Test Evidence

### E1 — Repository binding

```
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=<repo-root> source=explicit-repositoryRoot affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-237c8ac0756a6f7a2d67045658373c1c:9 revision=9 repository=research-lab root=<repo-root>
{"repositoryRoot":"<repo-root>","repositoryAlias":"research-lab","repositoryResolution":{"sessionId":"vscode-237c8ac0756a6f7a2d67045658373c1c","decisionId":"rb:vscode-237c8ac0756a6f7a2d67045658373c1c:9","controlRevision":9,"controlPathDigest":"sha256:98fab641695402d9d3acd406123518549029033892c2e14018e28c2690db1e0e","authority":"explicit-repository-root","transition":"confirmed","scopeKind":"command","scopeId":null,"targetKind":"repository-root","pathVisibility":"local","actionable":true}}
RL_PREFLIGHT_EXIT=0
```

**Claim Source:** executed. The session control file was read first and showed revision 8
with `currentBinding.repositoryRoot = <repo-root>`; preflight was
passed `--expected-control-revision 8` and committed revision 9.

### E2 — Clean tree at HEAD

```
GIT_STATUS_EXIT=0 (empty above == clean tree)
HEAD=aeb1bcbc3373cc90cc846fc4bfb577dd9f75c927 2026-08-10 14:13:48 +0000 FR-018: an attention item deep-links to its owning tool, checked against the registry
```

`git status --porcelain` produced no output. Re-checked after every subsequent command,
including after the worktree reproduction and its removal, with the same empty result.

**Claim Source:** executed.

### E3 — Full suite at HEAD (post-fix)

```
  ✓ the committed dependency-gate projection matches its source specs — a stale projection misreports delivery
  ✓ the projected site ships the dependency-gate projection, so gates resolve identically on Pages
  ✓ every declared dependency gate is represented in the projection
  ✓ the public gate projection carries only the fields the runtime predicate reads
  ✓ the browser resolves gates from the public projection and never fetches a governance statePath
  ✓ the statePath-fetch check is non-vacuous — it still matches the regressed shape
  ✓ no registered page fetches a root-absolute asset path — it loses the repo segment on project Pages
  ✓ the root-absolute asset detector still matches the regressed shape
  ✓ the workflow checks detect a reduced browser gate and a repo-root deployment
  ✓ the scan matched at least one tests/*.mjs reference against a present baseline, so the guard is not vacuously green (11587 reference(s) across 482 artifact(s), baseline 86 entries)
  ✓ no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline (0 new, 86 known-missing, 0 stale of 218 referenced)

================================================
Research-Lab self-test: 1370 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

Command: `node scripts/selftest.mjs`, run from the repository root. A second, independent
run filtered for failures returned only the summary line `Research-Lab self-test: 1370
passed, 0 failed` and no `FAIL` line, confirming the count is stable across runs rather than
a single lucky pass.

**Claim Source:** executed.

### E4 — Full suite at cc990911d (pre-fix), complete failure enumeration

```
Preparing worktree (detached HEAD cc990911d)
HEAD is now at cc990911d test(runtime): declare the three undeclared committed suites in the pinned inventory
47:  ✗ FAIL: Registry-wide Market Brief coverage selftest includes the registered volatility owner read
669:  ✗ FAIL: current payload satisfies the executable brief contract: attention[0] (id absent).disposition RLATTN-DISPOSITION: only a non-committal gate disposition may become an attention item; attention[0] (id absent).subject RLATTN-PRIVACY: an attention item names a subject inside the public watchlist scope; attention[0] (id absent).headline RLATTN-HEADLINE: an attention item carries a headline; attention[0] (id absent).invalidation RLATTN-FALSIFIABILITY: an item that cannot be invalidated is not publishable; attention[0] (id absent).verb RLATTN-VERB: an attention item uses a research verb only, never an execution command; attention[0] (id absent).severity RLATTN-PROVENANCE: the observed severity is outside the declared vocabulary; attention[0] (id absent).transmissionPath RLATTN-TRANSMISSION: the transmission path is a list of certified channels; attention[0] (id absent).marketConfirmation RLATTN-CONFIRMATION: market confirmation carries an explicit state; attention[0] (id absent).figures RLATTN-PROVENANCE: figures are a list, each one carrying its own provenance; attention[0] (id absent).decisionWindow RLATTN-WINDOW: the decision window is outside the declared window vocabulary; attention[0] (id absent).state RLATTN-LIFECYCLE: the item state is outside the declared lifecycle; … [the identical eleven codes repeat for attention[1] through attention[4]]
709:  ✗ FAIL: every REQUIRED narrative pattern matches a real field in the committed payload — the required list describes this payload, not an imagined one: attention.[].rationale, attention.[].invalidation, attention.[].escalationTrigger
1501:  ✗ FAIL: the committed brief carries a real decision-attention/v1 tier to rank, every item in a declared decision window (5 item(s))
1506:  ✗ FAIL: every committed attention item is live and publishes under the default card ceiling (0 of 7)
1507:  ✗ FAIL: the card ceiling really bites and suppresses the ranked tail rather than dropping it (0 published, 0 suppressed)
1529:  ✗ FAIL: market-brief.page.json is byte-current with its full source artifacts
1572:Research-Lab self-test: 1363 passed, 7 failed
GREP_DONE
```

Commands:

```
git worktree add --detach /tmp/rl-bug007-head1 HEAD~1
cd /tmp/rl-bug007-head1 && node scripts/selftest.mjs
git worktree remove /tmp/rl-bug007-head1 --force
```

The elision marked `[…]` in failure 2 replaces the verbatim repetition of the same eleven
`RLATTN-*` codes for `attention[1]` through `attention[4]`; the codes and their order are
identical per item, 55 violations in total. Nothing else is abridged.

The count `1363 passed, 7 failed` matches the originally reported figure exactly, which
confirms the reproduction is of the same state and not a similar one.

**Claim Source:** executed.

### E5 — Worktree removed, tree restored

```
<repo-root>  aeb1bcbc3 [main]
=== tree clean? ===
(empty above == clean)
```

`git worktree list` shows only the primary checkout; `git status --porcelain` is empty.

**Claim Source:** executed.

### E6 — Payload shape across revisions (root cause)

```
HEAD         attention: 3 item(s) | exclusions: 2 | first-item has contractVersion: decision-attention/v1
HEAD~1       attention: 5 item(s) | exclusions: undefined | first-item has contractVersion: NO
6253ca100    attention: 5 item(s) | exclusions: undefined | first-item has contractVersion: NO
a8edab38e    attention: 5 item(s) | exclusions: undefined | first-item has contractVersion: NO
```

The legacy shape reaches back at least to `a8edab38e` ("market-brief: auto-refresh +
narrative 2026-08-09 16:54 EDT"), so the drift was carried by the scheduled authoring lane
across multiple regenerations rather than introduced by one edit.

Current committed shape and the snapshot divergence:

```
payload.attention isArray: true len: 3
payload.attention[0] keys: rank, domain, horizon, title, structuralAnchor, what, why, confidence, deepLink, contractVersion, id, gateId, subject, disposition, severity, imminence, headline, rationale, verb, invalidation, escalationTrigger, expiry, decisionWindow, windowBoundaryUtc, windowTradingDate, windowResolvedFrom, transmissionPath, transmissionAbsenceNote, marketConfirmation, marketConfirmationNote, figures, observedAt, state, supersededBy, lifecycle
payload.attentionExclusions: 2 entries
snapshot.attention: undefined
```

**Claim Source:** executed.

### E7 — Guard non-vacuity, measured differentially

```
HEAD~1   selftest.mjs:6105 predicate => FAIL | items: 5 | carrying contractVersion: 0 | in a declared window: 0
HEAD     selftest.mjs:6105 predicate => PASS | items: 3 | carrying contractVersion: 3 | in a declared window: 3
=> the named guard is non-vacuous: it FAILS on the legacy shape and PASSES on the composed shape
```

The predicate evaluated is the one the guard uses verbatim: `Array.isArray(t) && t.length >= 3
&& t.every(i => i.contractVersion === CONTRACT_VERSION) && t.every(i =>
DECISION_WINDOWS.includes(i.decisionWindow))`, with `CONTRACT_VERSION` and
`DECISION_WINDOWS` taken from `rlattention.js:39` and `rlattention.js:154`.

**Claim Source:** executed.

### E8 — Family classification: page projection is consequent, not independent

```
38:      attention: payload.attention,

HEAD page.json attention: 3 item(s)
HEAD~1 page.json attention: 3 item(s)
page.json byte-identical HEAD vs HEAD~1: true

aeb1bcbc3 FR-018: an attention item deep-links to its owning tool, checked against the registry
 market-brief.payload.json                          | 288 ++++++++++++++++++---
 rlattention.js                                     |  22 +-
 scripts/build-attention-items.mjs                  |  41 ++-
 .../report.md                                      |  53 ++++
 tests/rlattention.test.mjs                         |  44 ++++
 5 files changed, 405 insertions(+), 43 deletions(-)
```

Three facts settle the classification. The builder copies `payload.attention` verbatim.
`market-brief.page.json` is byte-identical across the two revisions and already carried the
composed 3-item tier at the red revision, so the projection was ahead of its own source.
And the fix commit does not touch `market-brief.page.json`, yet the byte-currency assertion
turned green — a staleness that clears by changing only the source is consequent on the
source. The alternative hypothesis, that this was an independent staleness of the kind
commit `6253ca100` fixed when the FX tool registered, is refuted by the third fact.

**Claim Source:** executed.

### E9 — Durable control on the publish path and in the runbook

```
370-    # That only holds if the composer actually runs on the publication path.
371:    # build-attention-items.mjs --recompose --write is that step, and it sits
372-    # BETWEEN the lane and the gate on purpose:
373-    #   lane (judgement) -> composer (envelope) -> validator (refusal)
374-    # It is additive-or-nothing (it refuses to write if a pre-existing payload
375-    # key would be lost) and it exits 0 even when it refuses a candidate, since
376-    # refusing one is a correct outcome, not a run failure. A genuine build
377-    # error exits non-zero and the && chain fails the attempt, which retries.
385-          "$NODE_BIN" scripts/brief-narrative-parallel.mjs \
386:       && "$NODE_BIN" scripts/build-attention-items.mjs --recompose --write \
387-       && "$NODE_BIN" scripts/validate-brief-payload.mjs "$PAYLOAD" --drop-unscoreable; then
388-      NARRATIVE_OK=1
```

Runbook, `notes/market-brief.md`:

```
125-    3b. **recomposes the decision-attention set from the authored judgement**, via
126:      `scripts/build-attention-items.mjs --recompose --write`, after the lanes have written the payload and
127-      *before* the payload gate runs. This step is what makes the attention set a structural guarantee rather
128-      than a model promise: the lanes author only the falsifiability judgement (invalidation, escalation
129-      trigger, expiry, rationale), and this script — not a model — builds each `decision-attention/v1` envelope
130-      from that judgement plus the committed window, transmission, provenance and lifecycle contracts in
131-      `rlattention.js`. A candidate that cannot satisfy those contracts is refused with a closed `RLATTN-*`
132-      code and recorded in the payload's own `attentionExclusions[]` — index, subject, code, offending field
```

**Claim Source:** executed.

---

### E10 — Concurrent writer, and the true final suite state

After E1–E9 were taken, `git status --porcelain` stopped being empty:

```
 M market-brief.payload.json
 M tests/attention-payload-contract.test.mjs
?? specs/_bugs/BUG-007-decision-attention-contract-drift/

 market-brief.payload.json                 |  3 ++-
 tests/attention-payload-contract.test.mjs | 25 +++++++++++++++++++++++++
 2 files changed, 27 insertions(+), 1 deletion(-)

2026-08-10 09:16:41 market-brief.payload.json
2026-08-10 09:17:00 tests/attention-payload-contract.test.mjs
```

The `??` entry is this bug folder. The two `M` entries are **not** this run's work: the
mtimes are 16:16:41 and 16:17:00 UTC, after every measurement above, and the payload diff is
a single added `backdrop.globalBackdrop` narrative entry about Hormuz oil-risk. The suite is
consequently red:

```
  ✗ FAIL: market-brief.page.json is byte-current with its full source artifacts
Research-Lab self-test: 1369 passed, 1 failed
--- and the raw exit code, unpiped ---
SELFTEST_EXIT=1
```

A read-only rebuild comparison isolates the cause without writing any artifact:

```
market-brief.page.json => STALE
   differing key: backdrop
market-brief.config.page.json => byte-current
market-brief.snapshot.page.json => byte-current
market-brief.tools.page.json => byte-current
market-brief.experimental.json => byte-current
```

`attention` is byte-current. **BUG-007 has not regressed.** The failure is the ordinary
consequence of editing the payload without regenerating the page artifacts, and it sharpens
the §E8 classification rather than contradicting it: the byte-currency assertion is a general
staleness detector over every projected key. At `HEAD~1` it fired because of the attention
drift; here it fires because of `backdrop`. Both are measured, neither is inferred.

Not repaired here. Regenerating `market-brief.page.json` would fold another session's
uncommitted narrative edit into this packet, and the edit is plainly in flight.

**The concurrent session was still active at the close of this run.** A final check showed a
third file, `scripts/build-attention-items.mjs`, had also become modified, with the suite
unchanged at `1369 passed, 1 failed`. The set of concurrently-modified files is therefore a
moving target and is recorded as observed rather than chased.

**Claim Source:** executed.

---

## Corrections To The Original Report

**C1 — The defect does not reproduce at HEAD.** The report states the failures exist at
committed `HEAD` on a clean tree. That was true when captured, at `cc990911d`. It is no
longer true: `HEAD` is now `aeb1bcbc3` and the suite was green there. Both statements are
correct about their own revision. The tree has since been made dirty by a concurrent writer;
see E10.

**C2 — The remedy was already applied, and by the route the report recommends.** The report
asks that `recomposePayloadAttention` be reused rather than reinvented. It was: commit
`aeb1bcbc3` changed `scripts/build-attention-items.mjs` and the payload together, and the
committed payload now carries 3 built items plus 2 named refusals in
`attentionExclusions[]`, which is the composer's own output shape.

**C3 — The durable lifecycle control already exists.** The report asks the fix to change the
publish path or the runbook rather than the bytes. Both were already changed, under
`specs/017-decision-attention-and-developing-situations` scope 06: the composer runs at
`scripts/brief-refresh-and-push.sh:386` between lane and gate, and `notes/market-brief.md`
documents it as step 3b. No new lifecycle work was required.

**C4 — The named guard already exists and is non-vacuous.** The report asks for a permanent
guard so a legacy-shape payload fails by name. `scripts/selftest.mjs:6103-6106` is that
guard, it names the contract version in its message, and E7 shows it distinguishes the two
shapes. Authoring a second guard would duplicate authority over one property, so none was
written.

**C5 — The failure families are not independent.** The report asks whether the page-artifact
staleness is a consequence of the contract drift or independent. E8 establishes it is a
consequence. All seven failures collapse to one root cause.

**C6 — The tier is 5 items in the payload, 3 after composition.** The report describes an
`attention` array of 5 items. That is correct at the red revision. At `HEAD` it is 3 items
plus 2 refusals, because the composer refused two candidates with named reasons rather than
publishing them.

## Open Findings

| ID | Severity | Summary | Owner | Status |
| --- | --- | --- | --- | --- |
| OBS-007-01 | low | `market-brief.snapshot.json` has no `attention` key while the payload has three items. Whether this is a defect was not established. | spec 017 | open |
| OBS-007-02 | low | The composer exits 0 on refusal by design; an all-refusal run would also exit 0. Mechanical enforcement of the declared "zero published with zero exclusions is a failure" rule was not verified. | spec 017 | open |
| OBS-007-03 | informational | Spec 017 is `in_progress` under a certification refusal naming four surviving blockers, none of which is this defect. | spec 017 | open |
| OBS-007-04 | medium | A concurrent writer left the tree dirty and the suite at 1369 passed, 1 failed, exit 1, on the byte-currency assertion. Isolated read-only to the `backdrop` key; `attention` is byte-current, so BUG-007 has not regressed. Not repaired here — the edit belongs to another session in flight. | concurrent session holder | open |
