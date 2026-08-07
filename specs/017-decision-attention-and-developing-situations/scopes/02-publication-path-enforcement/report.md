# Scope 2 Execution Report — Publication-Path Enforcement

## Summary

`scripts/validate-brief-payload.mjs` now applies the full attention predicate from
`rlattention.js` instead of checking only the headline length, the payload gained
its attention keys additively, and the authoring instruction in
`scripts/brief-narrative-parallel.mjs` was extended to demand the whole field set
so the 4×/day cron cannot silently re-emit the pre-migration shape.

Four scenarios were authored first and recorded failing, then recorded passing.
The publication gate itself — `node scripts/validate-brief-payload.mjs` — is
recorded exiting 0 against the committed payload. An adversarial edit to the
authoring instruction confirms the instruction test bites.

**This scope had a real mid-scope defect and it is narrated below rather than
smoothed over.** The first implementation pass turned all four unit tests green
while the publication gate was still red. That is precisely the overclaim this
record exists to prevent, so it is written up before the green evidence, not after.

## The Mid-Scope Defect — Green Unit Tests Over A Red Publication Gate

After the first implementation pass, `node --test
tests/attention-payload-contract.test.mjs` reported 4 passing. On that evidence
alone the scope looked done. It was not: `node scripts/validate-brief-payload.mjs`
still exited 1, refusing **all five** attention items on two refusal codes —
`RLATTN-PRIVACY` (subject outside public watchlist scope) and `RLATTN-WINDOW` (no
anchor for window).

**Root cause.** The validator built an attention context that omitted
`watchlistScope`, `windowVocabulary`, `calendarSource` and `tradingDateIso`. That
omission rested on a mistaken premise — that no committed artifact supplied those
inputs. Three do: `watchlist.json`, `data/calendars/xnys/calendar.json` and
`market-brief.config.json`. The predicate was therefore being handed an empty
context and, correctly, refusing everything it was asked to judge. The predicate
was right; the caller was starving it.

**Second pass.** The real artifacts were wired into the validator's context,
`generationWindows` was extended **additively** with anchor and offset, and
`attention[0].subject` was corrected from `SPY` — which is not in the watchlist —
to an in-scope ticker. The publication gate then passed.

**Why this is recorded and not merely fixed.** The four unit tests exercise the
predicate and the payload contract. They do not exercise the validator's context
assembly, so they were structurally incapable of catching this. A scope closed on
unit-green alone would have shipped a publication path that refused every item it
was given. The gate run in **TP-02-02 / Publication Gate** below is the evidence
that actually retires that risk, and it is the reason the Definition of Done
carries a separate box for it.

## Test Evidence

### RED — Scenario-First, All Four Failing

**Claim Source:** executed

```text
$ node --test tests/attention-payload-contract.test.mjs
not ok 1 - SCN-017-025 The publication path refuses an over-length headline and a missing invalidation
not ok 2 - SCN-017-026 The validator and the browser apply the identical predicate on one fixture
not ok 3 - SCN-017-027 Existing attention consumers still parse the payload unchanged
not ok 4 - SCN-017-045 The authoring instruction names every required attention field
# tests 4
# pass 0
# fail 4
RED_EXIT=1
```

### GREEN — All Four Passing

**Claim Source:** executed

```text
$ node --test tests/attention-payload-contract.test.mjs
# tests 4
# pass 4
# fail 0
```

`pass 4 + fail 0 = tests 4`, so no scenario was skipped. No explicit exit line was
captured for this run; `node --test` exits 0 when the failure count is zero.

### Publication Gate Restored

This is the run that closes the mid-scope defect described above. It is the
end-to-end publication path, not a unit test.

**Claim Source:** executed

```text
$ node scripts/validate-brief-payload.mjs
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
PUB_EXIT=0
```

### Adversarial Bite — The Authoring Instruction Test Detects A Dropped Field

`escalation trigger` was replaced with a placeholder in the attention authoring
instruction inside `scripts/brief-narrative-parallel.mjs`, and the suite was
re-run. The instruction scenario flipped to failing, proving that a future edit
which quietly drops a required field is caught rather than tolerated.

**Claim Source:** executed

```text
not ok 4 - SCN-017-045 The authoring instruction names every required attention field
# tests 4
# pass 3
# fail 1
BITTEN_EXIT=1
```

The edit was reverted and the file proven byte-identical to its pre-edit state:

**Claim Source:** executed

```text
restored scripts/brief-narrative-parallel.mjs
sha256 a0365e4dc13e5a45d44fb5a4e7a5711c0bb1c2fb48a2c86489a76897c03aaaee
```

### Change Set

The validator predicate, the payload migration and the authoring instruction land
together, which is what the scope's rollback section requires: reverting one
without the others is itself a broken state.

**Claim Source:** executed

```text
$ git status --porcelain
 M market-brief.config.json
 M market-brief.payload.json
 M scripts/brief-narrative-parallel.mjs
 M scripts/validate-brief-payload.mjs
```

`watchlist.json` was **not** modified. The watchlist was read as an input to the
validator's attention context, never written to.

---

### TP-02-01

SCN-017-025 · `validate-brief-payload` refuses an over-length headline and a
missing invalidation, naming the field, exit non-zero.

**Claim Source:** executed

```text
$ node --test tests/attention-payload-contract.test.mjs
# tests 4
# pass 4
# fail 0

prior RED run, same command, before the predicate swap:
not ok 1 - SCN-017-025 The publication path refuses an over-length headline and a missing invalidation
# pass 0
# fail 4
RED_EXIT=1
```

### TP-02-02

SCN-017-026 · The validator and the browser apply the identical predicate on one
fixture, resolving to the same module function rather than two copies. The
publication-gate run is reproduced here because it is what proves the shared
predicate works against the real committed payload, not only against the fixture.

**Claim Source:** executed

```text
$ node --test tests/attention-payload-contract.test.mjs
# tests 4
# pass 4
# fail 0

$ node scripts/validate-brief-payload.mjs
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
PUB_EXIT=0
```

### TP-02-03

SCN-017-027 · Existing attention consumers still parse the payload unchanged;
every pre-existing key retains its name, its type and its value.

**Claim Source:** executed

```text
$ node --test tests/attention-payload-contract.test.mjs
# tests 4
# pass 4
# fail 0

prior RED run, same command:
not ok 3 - SCN-017-027 Existing attention consumers still parse the payload unchanged
# pass 0
# fail 4
RED_EXIT=1
```

### TP-02-04

SCN-017-045 · The attention authoring instruction names every required
`decision-attention/v1` field, so a future edit that drops one fails. This row
carries its own adversarial proof.

**Claim Source:** executed

```text
$ node --test tests/attention-payload-contract.test.mjs
# tests 4
# pass 4
# fail 0

bite — 'escalation trigger' replaced with a placeholder in the authoring instruction:
not ok 4 - SCN-017-045 The authoring instruction names every required attention field
# pass 3
# fail 1
BITTEN_EXIT=1

restored scripts/brief-narrative-parallel.mjs
sha256 a0365e4dc13e5a45d44fb5a4e7a5711c0bb1c2fb48a2c86489a76897c03aaaee
```

## Honest Gaps

| DoD item | Why it is not ticked |
|---|---|
| Every refusal message names the offending field **and the offending item** | The scenario and the Test Plan row both stop at "naming the field". Item-naming is asserted by the Definition of Done but is not covered by any executed test, so the passing run does not prove it. |
| `node scripts/selftest.mjs` exits 0 on the working tree | That command was not run in this session. |
| Every excluded path is byte-identical, proven by a diff | The captured `git status --porcelain` lists no excluded path, which is encouraging but not sufficient. It shows no untracked entry for `tests/attention-payload-contract.test.mjs`, a file this scope lists as New and which exists on disk — so the captured status cannot be read as a complete diff against the pre-scope baseline. A real baseline diff is still owed. |
| Zero warnings emitted by any command run for this scope | The two `node --test` outputs are count-filtered, so the absence of warnings cannot be read from them. The publication-gate output is complete and warning-free, but it is only one of the three commands. |

## Completion Statement

Scope 2's substantive work is delivered and evidenced: the publication path now
applies the module predicate rather than a local length check, the payload keys are
additive, the authoring instruction demands the full field set, and all three land
in one change set. All four scenarios are proven RED then GREEN, and the
authoring-instruction test is proven to bite.

The single most important line in this report is `PUB_EXIT=0`, because for a period
of this scope the four unit tests were green while that gate was red, refusing
every attention item on an empty context the validator itself had assembled. That
defect is documented above in full, including the false premise that caused it.

Four Definition of Done items remain unticked, listed above with their causes. One
of them — refusal messages naming the offending item — is a genuine coverage gap
rather than an unrun command, and needs a Test Plan row from the planning owner
before it can be honestly ticked.
