# Scope 5 Execution Report — Legacy Feed Reconciliation And Acceptance

## Summary

The acceptance set for this scope ran clean. All five guardrails are green across
the whole repository: the project selftest, the publication gate, the module suite,
the payload-contract suite, the browser budget run and the reader-legibility audit.
Every block below is raw output from a run in this session.

One acceptance scenario, **SCN-017-044** (the project selftest exits 0 with the new
module registered), was **blocked for part of delivery** and is narrated first,
because a reader who sees only the final `1251 passed, 0 failed` would take it for a
scenario that was never in doubt. It was.

Not everything in this scope is delivered. Two Core Delivery items — the
`notes/market-brief.md` records for the H-4 and H-5 decisions — are **provably not
done**, and the working-tree scan that proves it is recorded under **Honest Gaps**.
The green acceptance run does not close them and is not offered as if it did.

Seventeen Definition of Done items are ticked and five are not.

## Blocking Event — SCN-017-044 Was Red On Three Pre-Existing Failures

TP-05-05 / SCN-017-044 asserts the project selftest exits 0 with the new module
registered. For part of this scope's delivery it did not. `node scripts/selftest.mjs`
reported three failures.

**The three failures were not introduced by this feature.** That was established
rather than assumed. A clean-HEAD worktree was measured, with none of this feature's
changes present, and it reported the same three failures.

**Claim Source:** executed

```text
clean-HEAD worktree, none of this feature's changes present:
Research-Lab self-test: 1230 passed, 3 failed
```

Three failures on a tree that does not contain `rlattention.js`, the two new test
files or the `market-brief.html` tier cannot have been caused by any of them. The
selftest was red **before** this feature and would have been red without it.

**The cause was a cron authoring regression, not a test defect.** A scheduled brief
publish had dropped `events[].psychologyNote` from `market-brief.payload.json` — a
key that HEAD's own committed validator requires. The publishing path and the
validating path had drifted apart in the tree, and commit `1412f3e0` is the publish
that carried the drop. Nothing in the test suite was wrong; the payload it validated
was.

This is the same failure mode that `notes/decision-attention.md` §8 warns about in
general terms — the authoring instruction and the validator moving out of step, with
the 4×/day cron re-emitting the wrong shape within hours. Here it presented from the
opposite direction: the authoring side regressed against a validator that had not
moved.

**It passes now that the payload is repaired.** The repair restored the dropped key;
the current tree reports `1251 passed, 0 failed`. The delta from 1230 to 1251 is the
newly registered coverage this feature adds, and the three failures are gone.

**Why this is recorded rather than smoothed over.** Reading `1251 passed, 0 failed`
as "the selftest was always fine" would erase the only interesting thing that
happened to this scenario. The distinction that mattered during delivery was between
*this feature broke the selftest* and *the selftest was already broken* — and the
clean-HEAD worktree is what settled it. Without that measurement the apparent next
step would have been to hunt for a defect in this feature that did not exist.

## Test Evidence

### E-FINAL — All Five Guardrails Green, Whole Repository

Every command below was run in this session against the current working tree. This
single block is the source for the five per-row anchors that follow; each row
reproduces the portion of it that is that row's evidence.

**Claim Source:** executed

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 1251 passed, 0 failed
EXIT=0

$ node scripts/validate-brief-payload.mjs
PUB_EXIT=0

$ node --test tests/rlattention.test.mjs
# pass 25   # fail 0

$ node --test tests/attention-payload-contract.test.mjs
# pass 15   # fail 0

$ npx --no-install playwright test tests/attention-browser.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
6 passed

$ node scripts/audit-reader-legibility.mjs
pages audited: 23   with view tabs: 23   errored: 0   total leaks: 0
```

### E-SKIP — No Scenario Is Skipped, Disabled Or Bailing Out

A green count is only worth what the scenarios behind it assert. The three test files
were scanned for the patterns that turn a passing count into a hollow one.

**Claim Source:** executed

```text
$ grep -nE "\.only\(|test\.skip|it\.skip|describe\.skip|t\.skip|\bskip:\s*true|test\.todo|return;\s*//|if \(.*url\(\).*includes\(.*login" tests/rlattention.test.mjs tests/attention-payload-contract.test.mjs tests/attention-browser.spec.mjs
grep_exit=1

$ grep -c "^test(\|^  test(\|^test\.\|^ *test(" tests/rlattention.test.mjs tests/attention-payload-contract.test.mjs
tests/rlattention.test.mjs:25
tests/attention-payload-contract.test.mjs:15
```

`grep_exit=1` is grep's no-match exit: zero `.only`, zero `skip`, zero `todo`, zero
bailout return across all three files. The declared counts, 25 and 15, equal the
passing counts in E-FINAL exactly, so no scenario was silently dropped between
declaration and execution.

### E-BOUNDARY — Working-Tree Scan Of This Scope's Excluded Paths

**Claim Source:** executed

```text
$ for p in rlbrief.js rlexperience.js rlfx.js rljourney.js rlmarketaction.js rlcontracts.js market-brief.scorecard.json tool-experience.config.json notes/market-brief.md; do printf '%-34s %s\n' "$p" "$(git status --porcelain -- "$p" | head -1)"; done
rlbrief.js
rlexperience.js
rlfx.js
rljourney.js
rlmarketaction.js
rlcontracts.js
market-brief.scorecard.json
tool-experience.config.json
notes/market-brief.md

$ git status --porcelain -- 'specs/004*' 'specs/_bugs/BUG-002*' 'specs/012-market-action-center-and-guided-tools/bugs'
 M specs/004-fx-regime-relative-value-lab/report.md
 M specs/004-fx-regime-relative-value-lab/scopes.md
 M specs/004-fx-regime-relative-value-lab/state.json
 M specs/004-fx-regime-relative-value-lab/test-plan.json
M  specs/004-fx-regime-relative-value-lab/uservalidation.md
M  specs/_bugs/BUG-002-market-brief-session-date-drift/report.md
M  specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md
M  specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json
?? specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/
?? specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/
?? specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/
```

Two results, and they point opposite ways.

The eight code and config paths are **clean** — an empty porcelain line means the
working-tree copy is identical to the committed one. `rlbrief.js` in particular is
untouched, which is the load-bearing half of this scope's H-4 claim: the legacy feed
was to be re-scoped at the call site *without* editing the module behind it.

The three concurrent-session paths are **not** clean, so the blanket byte-identity
DoD item cannot be ticked. See **Honest Gaps**.

The same scan carries a third result that no acceptance run would have surfaced:
`notes/market-brief.md` is unmodified. That file is where this scope's H-4 and H-5
decision records were supposed to go. It never received them.

### E-REGISTER — `rlattention.js` Is Registered With The Project Selftest

An exit code of 0 proves the selftest ran, not that it ran the new module. That is a
separate claim and it needs a separate look.

**Claim Source:** executed

```text
$ grep -n "rlattention" scripts/selftest.mjs
5657:/* ---------- rlattention — the attention tier APPENDS to the certified lifecycle, it never redefines it ---------- */
5659:  group('rlattention.js \u2014 append-only lifecycle, upstream-owned vocabulary, and a rank order with no clock in it');
5662:  const ATTENTION_PATH = join(ROOT, 'rlattention.js');
5664:  const attentionSource = read('rlattention.js');
5675:    'rlattention.js loads as a frozen UMD module publishing the whole decision-attention/v1 surface (' + ATTENTION_SURFACE.length + ' names, missing: ' + (missingSurface.join(', ') || 'none') + ')');
5704:    'losing a certified state upstream makes rlattention.js refuse to LOAD, naming the missing state (' + String(driftRefusal).slice(0, 90) + ')');
5719:  assert(impurities.length === 0, 'rlattention.js reads no clock and draws no randomness (' + impurities.length + ' offending construct(s))');
5767:  const attentionTagAt = attentionBriefPage.indexOf('src="rlattention.js"');
5769:    'market-brief.html loads rlattention.js AFTER rlmarketaction.js, because the attention tier resolves the certified vocabulary from the browser global at load time');
5771:  const reversedScriptOrder = '<script src="rlattention.js"></script><script src="rlmarketaction.js"></script>';
5772:  assert(reversedScriptOrder.indexOf('src="rlattention.js"') < reversedScriptOrder.indexOf('src="rlmarketaction.js"'),
5774:} catch (e) { failures++; console.log('  \u2717 FAIL (rlattention group threw): ' + e.message); }
matches=12

$ git diff --stat -- scripts/selftest.mjs
 scripts/selftest.mjs | 119 ++
```

The module has its own `group(...)` block spanning lines 5657 to 5774, twelve
references, asserting the frozen UMD surface, the load-time lifecycle-drift refusal,
clock and randomness purity, and the script-tag ordering against `rlmarketaction.js`.
That is registration, not incidental mention.

It also explains the count movement recorded under TP-05-05: the clean-HEAD tree has
no such block and runs 1230 assertions; the working tree runs 1251.

### E-H4 — The Legacy `#attention` Feed Is Re-Scoped At The Call Site

**Claim Source:** executed

```text
$ grep -n 'id="attention"' market-brief.html
955:        <div class="feed" id="attention"></div>

market-brief.html:944-955 —
            Needs a decision — and when it stops counting</h2>
        <section id="decisionAttention" data-rlk-done="1"
            aria-label="Items asking for a decision this session"></section>

        <h2 class="sec"
            title="Only structurally anchored, adequately confident changes that can affect the next session. Watch/noise stays out.">
            Actionable changes and catalysts</h2>
        <div class="feed" id="attention"></div>
```

The re-scope is visible as a pair. The decision-grade framing — *Needs a decision —
and when it stops counting* — sits on `#decisionAttention`. The legacy `#attention`
feed directly below it is headed *Actionable changes and catalysts*, and its tooltip
describes structurally anchored changes with watch and noise excluded. No decision
demand is made of the reader by the legacy feed.

One word is worth putting on the record rather than leaving for someone to find:
**"Actionable"**. It qualifies the changes' relevance, not the reader's obligation,
and the sentence makes no claim that a decision is owed. A reviewer who reads
"actionable" as itself decision-grade has the verbatim copy above and can reverse
this tick without re-running anything.

---

### TP-05-01

SCN-017-040 · Reader legibility reports zero leaks across the tier and the record.

**Claim Source:** executed

```text
$ node scripts/audit-reader-legibility.mjs
pages audited: 23   with view tabs: 23   errored: 0   total leaks: 0
```

Twenty-three pages audited, twenty-three carrying view tabs, zero errored, zero
leaks. No contract id, gate code, scope number or digest prefix appears in the reader
copy the audit covers.

Read the boundary of this row honestly: the audit covers rendered pages. It does not
cover `notes/decision-attention.md`, which is a separate surface with its own DoD item
in Scope 1, and which does not clear the same bar.

### TP-05-02

SCN-017-041 · The view ids remain the existing four and no fifth view exists.

**Claim Source:** executed

```text
$ node --test tests/attention-payload-contract.test.mjs
# pass 15   # fail 0

$ grep -c "^test(\|^  test(\|^test\.\|^ *test(" tests/attention-payload-contract.test.mjs
tests/attention-payload-contract.test.mjs:15
```

The view-id invariant is one of the fifteen scenarios in this file and is inside the
`# fail 0`. The declared count equals the passing count, so it ran rather than being
skipped.

### TP-05-03

SCN-017-042 · Red Alert thresholds and its seven hard gates are byte-identical.

**Claim Source:** executed

```text
$ node --test tests/attention-payload-contract.test.mjs
# pass 15   # fail 0
```

The byte-identity assertion for the Red Alert thresholds and the seven hard gates is
one of the fifteen and is inside the `# fail 0`. This scope performed no write to
that surface; the assertion is what proves it.

### TP-05-04

SCN-017-043 · All six performance budgets hold.

**Claim Source:** executed

```text
$ npx --no-install playwright test tests/attention-browser.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
6 passed
```

The Test Plan row for this scenario narrows the run with
`--grep "decision attention rendering holds all six performance budgets"`. The
recorded run is the **whole file** without that filter — a superset of the row's
command, six scenarios rather than one. The budget scenario is inside the six and
inside the pass. Stated plainly so no reader takes `6 passed` for a targeted run that
was not performed.

### TP-05-05

SCN-017-044 · The project selftest exits 0 with the new module registered.

**Claim Source:** executed

```text
BLOCKED, on three failures this feature did not introduce:
Research-Lab self-test: 1230 passed, 3 failed      (clean-HEAD worktree)

GREEN, after the payload repair restored events[].psychologyNote:
$ node scripts/selftest.mjs
Research-Lab self-test: 1251 passed, 0 failed
EXIT=0
```

This row carries the blocking event narrated at the top of this report. The
clean-HEAD measurement is the load-bearing half: three failures on a tree containing
none of this feature's changes is what separates *this feature broke the selftest*
from *the selftest was already broken*, and it settled the question in favour of the
second.

The 1230-to-1251 movement is the coverage this feature registers. The three-to-zero
movement is the payload repair.

---

## Honest Gaps

Five Definition of Done items are left unticked. Each is listed with the reason, and
three of them are **proven not satisfied** rather than merely unproven — the
working-tree scan actively contradicts them.

| DoD item | Why it is not ticked |
|---|---|
| The H-4 decision and its one-sentence justification are recorded in `notes/market-brief.md` in reader language | **Proven not done.** `git status --porcelain -- notes/market-brief.md` returns empty in E-BOUNDARY: the file is byte-identical to its committed state. It received no H-4 entry. This is a delivery gap, not a missing run. The *application* of H-4 at the call site did land and is evidenced in E-H4; only the written record is missing. |
| The H-5 position is recorded: the `escalated` terminal state and its outcome class ship now, and live cross-tier publication stays behind the existing declared gate in committed code | **Proven not done.** Same scan, same file, same result. The H-5 position was never written to `notes/market-brief.md`. The substance of the position is recorded in `notes/decision-attention.md` §5 and §10, but that is a different file from the one this item names, and this scope's Change Boundary does not list it. Whether relocating the record satisfies the item is a planning-owner question. |
| `node scripts/build-attention-scorecard.mjs` exits 0 | Not run, deliberately. The reducer writes `market-brief.attention-scorecard.json`, and this session is artifact-only — running it would mutate a payload file outside the permitted write surface. The same item is open in Scope 4 for the same command. |
| Every excluded path listed in the Change Boundary is byte-identical to its pre-scope state, proven by a diff of the working tree | **Proven not satisfied, with a caveat.** E-BOUNDARY clears the eight code and config paths, but `specs/004*` (5 files), `specs/_bugs/BUG-002*` (3 files) and `specs/012*/bugs/*` (3 new directories) are all modified. The scope text names those three as *owned by CONCURRENT sessions*, so the modifications are almost certainly not this scope's doing — but the DoD item as written asks for byte-identity, and byte-identity does not hold. Whether an excluded path modified by its declared concurrent owner satisfies or voids this claim is a planning-owner question, not a tick here. |
| Zero warnings and zero console errors across every command run for this scope | Unproven. Every captured output in E-FINAL is a count-filtered summary line. The absence of warnings cannot be read from a filtered summary. Evidence owed: one unfiltered run of each command. |

One disclosure that is not a DoD row and is recorded so it is not mistaken for one:
TP-05-04's browser run was the unfiltered whole-file superset rather than the exact
`--grep`-narrowed command in the Test Plan. The row is ticked on the superset and the
substitution is stated under TP-05-04 rather than hidden.

## Completion Statement

Scope 5's acceptance work is delivered and evidenced. All five guardrails are green
across the whole repository — the project selftest at `1251 passed, 0 failed`, the
publication gate at exit 0, the module suite at 25/0, the payload-contract suite at
15/0, six browser scenarios passing and the reader-legibility audit at zero leaks
over twenty-three pages. None of those counts rests on a skipped or disabled
scenario: the scan for `.only`, `skip`, `todo` and bailout returns across all three
test files returns no match, and the declared scenario counts equal the passing
counts exactly.

The re-scope itself landed. The decision-grade framing sits on `#decisionAttention`
and the legacy feed below it is headed *Actionable changes and catalysts*, with
`rlbrief.js` byte-identical behind it — the H-4 shape exactly as specified. The module
is registered with the project selftest in its own assertion group, which is what the
1230-to-1251 movement is made of.

**The scope is not Done.** Seventeen Definition of Done items are ticked and five are
not. Two of the five are unproven — one command deliberately not run because it
writes a payload file this artifact-only session may not touch, and one warning-count
claim no filtered output can speak to. Three are worse than unproven: the
working-tree scan **contradicts** them. `notes/market-brief.md` is byte-identical to
its committed state, so neither the H-4 nor the H-5 decision record was ever written,
and three excluded paths owned by concurrent sessions are modified, so the blanket
byte-identity claim does not hold as written. Those three need a planning-owner
decision, not another run.

Two things in this report deserve to outlive it.

The first is the clean-HEAD measurement. SCN-017-044 was red on three failures, and
the obvious reading — a feature that adds a module and two test files broke the
selftest — was wrong. Measuring a worktree with none of this feature's changes
present cost one command and redirected the investigation from a defect that did not
exist to a cron publish that had dropped `events[].psychologyNote` from the payload.
When a guardrail goes red during delivery, establishing *whether it was already red*
is cheaper than any amount of hunting.

The second is what the boundary scan found that the acceptance run could not. Six
green commands say nothing about a file nobody wrote to. `notes/market-brief.md` sat
unmodified through the entire scope while two Core Delivery items required entries in
it, and the only reason that surfaced is that a scan was run against the change
boundary rather than the test suite. A fully green acceptance set is evidence that
what shipped works. It is not evidence that everything that was supposed to ship did.
