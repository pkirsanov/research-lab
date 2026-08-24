# Scope 29 Report: Documentation And Registry Truth

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 29 is executed. Every published Feature 008 entry now opens
`portfolio-survival-allocation-lab.html#brief`, and the canonical note describes only
behavior the shipped implementation actually has.

Two carriers were added and one document was corrected:

- `tests/portfolio-doc-integration.functional.mjs` — a new focused functional carrier that
  reads the registry, navigation, landing page, README and note against each other and
  against the real `tests/` directory listing, plus an adversarial row that mutates the
  published surfaces and requires publication truth to reject each mutation.
- A new entry-route row in `tests/portfolio-survival-brief.spec.mjs` that drives a real
  browser from five published surfaces and asserts each one lands on the Brief workspace,
  with a discriminating control.
- `notes/portfolio-survival-allocation-lab.md` — corrected so its route, its scope count and
  its capability claims match the product.

The direction of the fix is worth stating plainly, because the opposite direction would have
been the cheaper way to a green carrier: the **document** was corrected to match the
**product**. The product was not changed, and no carrier assertion was relaxed.

## Decision Record

Documentation and registry claims run last so they describe executed behavior rather than
planning intent. That ordering is what made the defects findable: by the time this scope
ran, Scopes 17-28 had settled what the product actually does, so every sentence in the note
could be checked against a real executable state instead of against a plan.

The note carried three classes of untruth, and they are not the same kind of problem:

1. **A stale route.** The note's route table sent readers to `#workspace`, a hash the
   workspace no longer uses. This is a broken link, loud and easy to find once looked for.
2. **A stale count.** The note said the feature had sixteen scopes when it has twenty-nine.
3. **Silent omission.** Three contracts had shipped and were documented nowhere:
   return-context navigation (Scope 26), the accessible tablist (Scope 27), and the immutable
   dossier audit chain (Scope 25). This class is the dangerous one. A missing sentence does
   not break a link or fail a build; it simply lets a reader conclude the product is smaller
   than it is, and nothing in the repository objects.

The carrier was therefore written to fail on omission as well as on error. Its inventory row
reads the real `tests/` directory listing, so a proof added without a matching entry in the
note fails publication truth rather than quietly leaving the inventory reading as complete
while hiding the newer half of it.

Four registry consumers, `tools.json`, `index.html`, `rlnav.js` and `README.md`, required no
edit. Their route fields already resolved to the Brief workspace, which TP-29-02 proves
against a running page rather than by inspection. The Change Boundary permitted changing them
"only where their current claim/link fields require it", and they did not.

## Completion Statement

Complete. All eight Scope 29 Definition of Done items are checked, each against raw output
from a command executed in this session.

## Code Diff Evidence

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `git diff --stat` and `git ls-files --others --exclude-standard`
**Exit Code:** 0

```text
$ git diff --stat
 notes/portfolio-survival-allocation-lab.md         |  69 ++++++-
 .../scenario-manifest.json                         |   6 +-
 .../scope.md                                       |  17 +-
 .../29-documentation-and-registry-truth/scope.md   |   2 +-
 .../scopes/_index.md                               |   2 +
 .../test-plan.json                                 |  16 +-
 tests/portfolio-survival-brief.spec.mjs            | 207 +++++++++++++++++++++
 7 files changed, 289 insertions(+), 30 deletions(-)

$ git ls-files --others --exclude-standard
tests/portfolio-doc-integration.functional.mjs
```

Three of those paths are this scope's delivery, and all three are named **Allowed** by the
Change Boundary:

| Path | Change Boundary status |
|---|---|
| `notes/portfolio-survival-allocation-lab.md` | Allowed — canonical Feature 008 note |
| `tests/portfolio-survival-brief.spec.mjs` | Allowed — the concurrently changed focused E2E carrier that owns TP-29-02 |
| `tests/portfolio-doc-integration.functional.mjs` | Allowed — the focused docs integration test |

The remaining five paths are spec artifacts belonging to a **planning** transaction that is
co-resident in the working tree, not implementation output. They are attributed here rather
than absorbed, because the Change Boundary excludes "specs except this scope report" and an
unattributed spec diff would otherwise read as a boundary breach.

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `git diff --unified=1 -- specs/008-portfolio-survival-and-brief-lab/scenario-manifest.json specs/008-portfolio-survival-and-brief-lab/scopes/29-documentation-and-registry-truth/scope.md specs/008-portfolio-survival-and-brief-lab/scopes/_index.md`
**Exit Code:** 0
**Capture sha256:** `1ba70e9631b6f91cfe00072ebda4e9a62da2870e56c4c2d9ad69f7e7c015444a`

Those diffs identify their own owner in their own text. `scenario-manifest.json` flips the
four SCN-008-055 `linkedTestContracts` entries from `planned-not-authored` to `authored` and
states that "no authorship change records execution". The Scope 29 `scope.md` edit says "this
planning reconciliation records authorship only". `_index.md` records that Scope 28 does not
own the SCN-008-055 carrier and Scope 29 is its sole owner.

Those are authorship declarations written by the planning owner. This report does not claim
them, did not write them, and does not treat them as implementation evidence.

## Test Evidence

Every block below was produced by `evidence-capture.sh`, which records the exit code, the
line count, and a sha256 over every line the command produced. Each block carries a `verify`
command that re-derives that hash from a fresh run.

All five rows were executed directly in this session. Prior run accounts supplied to the
report owner were treated as diagnostic input only and are not restated as execution
evidence; where a figure below differs from such an account, the figure recorded is the one
this session produced.

### TP-29-01

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "Scope 29 TP-29-01 docs integration parity" -- timeout 540 node --test tests/portfolio-doc-integration.functional.mjs`
**Exit Code:** 0

```text
# Scope 29 TP-29-01 docs integration parity
$ timeout 540 node --test tests/portfolio-doc-integration.functional.mjs
exit: 0
lines: 29
sha256: d76fa37186ea73194ba26edaa0e5c9ada8182d6ae528d6723b780b9e5051fa0e
--- output ---
TAP version 13
# Subtest: SCN-008-055 every published Feature 008 surface states the shipped route and shipped limits
ok 1 - SCN-008-055 every published Feature 008 surface states the shipped route and shipped limits
  ---
  duration_ms: 9.973944
  type: 'test'
  ...
# Subtest: SCN-008-055 the registry, navigation, landing page, README and note agree on one Feature 008 tool
ok 2 - SCN-008-055 the registry, navigation, landing page, README and note agree on one Feature 008 tool
  ---
  duration_ms: 7.930556
  type: 'test'
  ...
# Subtest: Adversarial: stale workspace hashes and overclaims fail Feature 008 publication truth
ok 3 - Adversarial: stale workspace hashes and overclaims fail Feature 008 publication truth
  ---
  duration_ms: 129.416871
  type: 'test'
  ...
# 12 disposable mutations rejected
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 310.469552
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify d76fa37186ea73194ba26edaa0e5c9ada8182d6ae528d6723b780b9e5051fa0e -- timeout 540 node --test tests/portfolio-doc-integration.functional.mjs -->

**Result:** PASS. 3 tests, 3 pass, 0 fail, 0 skipped, 0 todo.

The two non-adversarial rows carry the parity work. The first checks that every published
surface states the shipped route and the shipped limits. The second checks that the registry,
navigation, landing page, README and note agree that there is one Feature 008 tool, which is
the assertion that catches a surface being updated while its siblings drift.

### TP-29-02

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `timeout 1200 bash .github/bubbles/scripts/evidence-capture.sh --label "Scope 29 TP-29-02 published-entry route regression" -- timeout 1140 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace" --reporter=list`
**Exit Code:** 0

```text
# Scope 29 TP-29-02 published-entry route regression
$ timeout 1140 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace --reporter=list
exit: 0
lines: 14
sha256: 5d1d11eb6783f77e29b1592f20c1c6d40f8ee028c8af03c99842e63a104759b2
--- output ---

Running 1 test using 1 worker

[TP-29-02] briefRoute=#brief tab=workspaceTabBrief shippedRoutes=6
[TP-29-02] inventories registry=29 landing=30 nav=30 readme=28
[TP-29-02] tools.json registry -> portfolio-survival-allocation-lab.html -> #brief
[TP-29-02] index.html TOOLS -> portfolio-survival-allocation-lab.html -> #brief
[TP-29-02] rlnav.js TOOLS -> portfolio-survival-allocation-lab.html -> #brief
[TP-29-02] README.md inventory -> portfolio-survival-allocation-lab.html -> #brief
[TP-29-02] note route line -> portfolio-survival-allocation-lab.html -> #brief
[TP-29-02] control=#risk-xray flipped Brief signals; stale #workspace reached Brief by fallback only
  ✓  1 [system-chrome] › tests/portfolio-survival-brief.spec.mjs:1078:1 › Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace (2.4s)

  1 passed (4.9s)
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 5d1d11eb6783f77e29b1592f20c1c6d40f8ee028c8af03c99842e63a104759b2 -- timeout 1140 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace" --reporter=list -->

**Result:** PASS. 1 passed, at `tests/portfolio-survival-brief.spec.mjs:1078`.

The diagnostic lines are the substance of this row. Five separately-maintained published
surfaces are resolved independently, `tools.json`, `index.html`, `rlnav.js`, `README.md` and
the note, and each resolves to the same file and the same `#brief` hash. The surfaces are read
as data, not asserted as constants, so a future edit to any one of them re-enters this row
rather than bypassing it.

The last line is what stops this row from being a test that cannot fail. Two discriminators
run against the same page:

- `control=#risk-xray flipped Brief signals` — routing to a **different real tab** changes the
  observed signals. Without this, an assertion that "the Brief tab is showing" would pass on
  a page that shows the Brief tab no matter which route it was given, and the row would prove
  nothing about routing at all.
- `stale #workspace reached Brief by fallback only` — the retired hash does still land on
  Brief, but by fallback rather than by selection, and the row distinguishes the two. This is
  the honest reading of the product's behavior: the old link is not broken for a user, and it
  is also not evidence that the published surfaces are correct. Recording the distinction is
  what keeps the fallback from being mistaken for parity.

Timings differ run to run, so the recorded sha256 covers this session's output specifically.

### TP-29-03

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `timeout 1800 bash .github/bubbles/scripts/evidence-capture.sh --label "Scope 29 TP-29-03 repository selftest" -- timeout 1740 node scripts/selftest.mjs`
**Exit Code:** 0

```text
# Scope 29 TP-29-03 repository selftest
$ timeout 1740 node scripts/selftest.mjs
exit: 0
lines: 3887
sha256: 62790ad05861c3a25c389f7a815a1a06ba92d9bccfe5371a13d0019f4227a54d
--- first 20 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
  ✓ CSP blocks object, base-tag, and form exfiltration paths
  ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
  ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✓ CSP allows no open URL-forwarding relay origin
  ✓ production pages and shared runtime contain no open URL-forwarding relay chain
  ✓ no model/config-authored field reaches innerHTML without esc()
  ✓ the sink detector catches an unescaped model-authored title
--- omitted 3847 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓ the lane prompt states the required nested fields it will be rejected for omitting — enforcing an acceptance contract the lane was never told is what made the failure deterministic
  ✓ both prompt branches carry the required-leaf instruction, so no lane is judged against a contract it was not given
  ✓ a retry is told why the previous attempt was rejected and the reason reaches the prompt — a retry that re-sends the identical input is the same attempt run twice

experience shell — every registered tool is mountable
  ✓ the registered-tool sweep actually has tools to check (found 29)
  ✓ every registered tool page carries a [data-rlbrief-mount] anchor naming its own tool id — rlapp.js mounts the shell from nothing else (missing: none)
  ✓ no page carries two mount anchors — rlapp.js requires exactly one and silently declines to mount otherwise (offenders: none)
  ✓ every declared adapterModule is a module path string the shell can resolve against its bindings table

================================================
Research-Lab self-test: 3404 passed, 0 failed
================================================
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 62790ad05861c3a25c389f7a815a1a06ba92d9bccfe5371a13d0019f4227a54d -- timeout 1740 node scripts/selftest.mjs -->

**Result:** PASS. 3404 passed, 0 failed.

This is the repository-wide registry and navigation parity gate, so it is the check that would
catch a Feature 008 edit that satisfied the focused carrier while breaking a shared invariant.
The `found 29` in the registered-tool sweep is the same registry count TP-29-02 reports
independently as `registry=29`, which is a small cross-confirmation that the two gates are
reading the same registry rather than diverging views of it.

### TP-29-04

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `timeout 900 bash .github/bubbles/scripts/evidence-capture.sh --label "Scope 29 TP-29-04 test-file reachability" -- timeout 840 node scripts/validate-test-file-reachability.mjs`
**Exit Code:** 0

```text
# Scope 29 TP-29-04 test-file reachability
$ timeout 840 node scripts/validate-test-file-reachability.mjs
exit: 0
lines: 42
sha256: 512332bcaf6fd4abdac6bffe9f9f75bb33b228b352534d5ef6b6ececdd946558
--- first 20 ---
197 test file(s) in tests/, 9 declared glob(s) from 9645 artifact(s), 180 reachable, 11 exempt (shared-helper-module), 6 orphan(s)
glob **/*.spec.mjs [playwright-testMatch] declared at 1 site(s), first playwright.config.mjs:4
glob tests/*.e2e.mjs [node-test-argument] declared at 23 site(s), first specs/015-recommendation-outcome-ledger-and-track-record/scopes/01-frozen-claim-contract/scope.md:255
glob tests/*.functional.mjs [node-test-argument] declared at 4 site(s), first specs/015-recommendation-outcome-ledger-and-track-record/scopes/02-additive-ledger-row-extension/report.md:1369
glob tests/*.integration.mjs [node-test-argument] declared at 8 site(s), first .specify/memory/agents.md:142
glob tests/*.test.mjs [node-test-argument] declared at 4 site(s), first specs/015-recommendation-outcome-ledger-and-track-record/scopes/02-additive-ledger-row-extension/report.md:861
glob tests/*.unit.mjs [node-test-argument] declared at 6 site(s), first .specify/memory/agents.md:151
glob tests/causal-rotation-*.mjs [node-test-argument] declared at 1 site(s), first notes/causal-rotation-lab.md:119
glob tests/distributed-briefs*.mjs [node-test-argument] declared at 2 site(s), first specs/012-market-action-center-and-guided-tools/scopes/11-feature-002-authored-brief-integration/scope.md:155
glob tests/feature-004-*.test.mjs [node-test-argument] declared at 1 site(s), first specs/015-recommendation-outcome-ledger-and-track-record/state.json:541
--- omitted 2 line(s); sha256 above covers the full output ---
--- last 20 ---
STALE BASELINE tests/portfolio-analytics.unit.mjs — now reachable; remove it from scripts/validate-test-file-reachability.baseline
STALE BASELINE tests/portfolio-foundation.unit.mjs — now reachable; remove it from scripts/validate-test-file-reachability.baseline
STALE BASELINE tests/provider-credentials.unit.mjs — now reachable; remove it from scripts/validate-test-file-reachability.baseline
STALE BASELINE tests/recommendation-track-record.unit.mjs — now reachable; remove it from scripts/validate-test-file-reachability.baseline
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 512332bcaf6fd4abdac6bffe9f9f75bb33b228b352534d5ef6b6ececdd946558 -- timeout 840 node scripts/validate-test-file-reachability.mjs -->

**Result:** PASS.

Exit 0 alone would be a weak reading of this row, because this validator is a ratchet: it
fails only on orphans that are **not** already frozen in
`scripts/validate-test-file-reachability.baseline`. A new carrier added to the baseline would
also produce exit 0 while being unreachable in practice. The distinguishing check was executed
separately:

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `grep -n 'portfolio-doc-integration' scripts/validate-test-file-reachability.baseline`
**Exit Code:** 1 (no match — the path is absent from the baseline)

```text
$ grep -n 'portfolio-doc-integration' scripts/validate-test-file-reachability.baseline
BASELINE_GREP_RC=1 (1 = absent from baseline)

$ grep -vcE '^\s*(#|$)' scripts/validate-test-file-reachability.baseline
26
```

The new carrier is not in the 26-entry baseline, and the validator exits 0. Those two facts
together establish that `tests/portfolio-doc-integration.functional.mjs` is genuinely selected
by a declared glob, the `tests/*.functional.mjs` glob the validator reports as declared at 4
sites, rather than exempted into silence. A carrier nobody runs is not a proof, and this row is
what keeps that from happening quietly.

The `STALE BASELINE` lines are the ratchet shrinking, which is designed behavior and not a
failure. Pruning those entries is owned by the baseline, not by this scope.

### TP-29-05

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "Scope 29 TP-29-05 adversarial publication-truth mutation" -- timeout 540 node --test --test-name-pattern="Adversarial: stale workspace hashes and overclaims fail Feature 008 publication truth" tests/portfolio-doc-integration.functional.mjs`
**Exit Code:** 0

```text
# Scope 29 TP-29-05 adversarial publication-truth mutation
$ timeout 540 node --test --test-name-pattern=Adversarial: stale workspace hashes and overclaims fail Feature 008 publication truth tests/portfolio-doc-integration.functional.mjs
exit: 0
lines: 17
sha256: 4ff89e88e138b57a0a73a046ee4258b497d6501146218a4a8992c2e3e636b62c
--- output ---
TAP version 13
# Subtest: Adversarial: stale workspace hashes and overclaims fail Feature 008 publication truth
ok 1 - Adversarial: stale workspace hashes and overclaims fail Feature 008 publication truth
  ---
  duration_ms: 91.919983
  type: 'test'
  ...
# 12 disposable mutations rejected
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 203.119457
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 4ff89e88e138b57a0a73a046ee4258b497d6501146218a4a8992c2e3e636b62c -- timeout 540 node --test --test-name-pattern="Adversarial: stale workspace hashes and overclaims fail Feature 008 publication truth" tests/portfolio-doc-integration.functional.mjs -->

**Result:** PASS. 1 test, 1 pass, 0 fail, `12 disposable mutations rejected`.

This row answers the question a green parity test always invites: could TP-29-01 pass on a
repository where the documentation was wrong? The row applies twelve disposable mutations to
the published surfaces and requires publication truth to reject every one. The mutation classes
are the two failure modes this scope actually fixed, a reintroduced stale `#workspace` hash and
a capability claim stated as complete without a shipped state behind it.

The count is the load-bearing part. `12 disposable mutations rejected` means twelve independent
injected defects were each caught; had the parity assertions been weakened to make the carrier
pass, this count would fall and the row would fail rather than silently certifying a carrier
that can no longer detect anything.

## Uncertainty Declarations

- **The pre-fix defect count is not this report's execution evidence.** The account handed to
  the report owner described 21 documentation defects reported by the carrier before the note
  was corrected. Reproducing that number requires running the carrier against the pre-fix note,
  which this session did not do, because doing so means reverting a delivered file. The number
  is recorded here as **interpreted** context and is not used to satisfy any DoD item. What
  this session executed is the post-fix green state (TP-29-01), the adversarial discrimination
  proof (TP-29-05), and the note diff itself, and those three carry every checked item.
- **`git diff --check` and `artifact-lint.sh` were run against the whole working tree**, which
  includes the co-resident planning transaction. Their exit codes are therefore honest
  statements about the tree, not isolated statements about this scope's three files.
- No open uncertainty affects any checked DoD item.

## Scenario Contract Evidence

SCN-008-055 is a stable specification and manifest contract. Its linked declarations now
resolve, which they did not at Scope 28.

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "Scope 29 linked-test resolution (G057)" -- timeout 540 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/008-portfolio-survival-and-brief-lab`
**Exit Code:** 0

```text
# Scope 29 linked-test resolution (G057)
$ timeout 540 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/008-portfolio-survival-and-brief-lab
exit: 0
lines: 1
sha256: 3cd7e3e362ae0cb97a690b6ae315f516bd7754d11491cd163ca62a022e818b34
--- output ---
[scenario-test-resolve] OK — 68 reference(s) resolved via literal-scan; 68 category comparison(s) not applicable (no test-discovery adapter declared)
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 3cd7e3e362ae0cb97a690b6ae315f516bd7754d11491cd163ca62a022e818b34 -- timeout 540 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/008-portfolio-survival-and-brief-lab -->

**Result:** PASS. 68 of 68 references resolved.

This is a direct closure of a gap the Scope 28 report recorded and correctly refused to hide.
That report captured this same gate at exit 1 with:

```text
MISSING-TITLE: SCN-008-055 -> tests/portfolio-survival-brief.spec.mjs#Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace
        the referenced file contains no test with this exact title

scenario-test-resolve: 1 unresolved reference(s) of 65 checked.
```

Scope 28 named Scope 29 as the owner of that unresolved reference and left its own DoD item
unchecked rather than claiming it. The reference now resolves, and the checked count rose from
65 to 68 as the three new functional declarations joined it. Feature 008 has no unresolved
linked-test reference.

## Coverage Report

Coverage is expressed as surface coverage rather than line coverage, which is the meaningful
unit for a documentation-integration scope.

| Published surface | Route proved by | Claim parity proved by |
|---|---|---|
| `tools.json` | TP-29-02 | TP-29-01 |
| `index.html` | TP-29-02 | TP-29-01 |
| `rlnav.js` | TP-29-02 | TP-29-01 |
| `README.md` | TP-29-02 | TP-29-01 |
| `notes/portfolio-survival-allocation-lab.md` | TP-29-02 | TP-29-01 |

All five surfaces named in the Consumer Impact Sweep are covered by both a live-route proof
and a claim-parity proof, and TP-29-05 proves both proofs still discriminate.

## Consumer Impact Sweep Evidence

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `grep -n '#workspace' tools.json index.html rlnav.js README.md notes/portfolio-survival-allocation-lab.md`
**Exit Code:** 1 (no match — zero stale references)

```text
$ grep -n '#workspace' tools.json index.html rlnav.js README.md notes/portfolio-survival-allocation-lab.md
WORKSPACE_TOKEN_RC=1 (1 = none)
```

| Consumer | Required update/proof | Status |
|---|---|---|
| Canonical Feature 008 note | `#brief`, complete method/state/privacy truth, exact commands | Corrected. Route line resolves `#brief` in TP-29-02; content corrections shown in the note diff below. |
| `tools.json` | Route/hash and description match executable first screen | No edit required. Resolves `#brief` in TP-29-02; parity asserted by TP-29-01. |
| `index.html` | Landing link and capability copy match `tools.json` | No edit required. Resolves `#brief` in TP-29-02; agreement with the registry asserted by TP-29-01. |
| `rlnav.js` | Navigation target matches tool registry and ReturnContext consumer | No edit required. Resolves `#brief` in TP-29-02. |
| `README.md` | Inventory claim is evidence-bounded and links to the real workspace | No edit required. Resolves `#brief` in TP-29-02. |
| Tests/search | Zero stale `#workspace` or superseded capability claim in active surfaces | Zero. Direct search above returns no match, and TP-29-01's stale-reference scan passes independently. |

The note corrections themselves were read from the diff rather than described from memory:

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `git diff --unified=1 -- notes/portfolio-survival-allocation-lab.md`
**Exit Code:** 0
**Capture sha256:** `638d63ae025d710c747eec69c896c2c23742e0a3f4a6a66a3008dd78bccad6ac`

```text
-| Portfolio Brief | `#workspace` | Import a revision, declare a mandate, see what the held evidence does and does not support. |
+| Portfolio Brief | `#brief` | Import a revision, declare a mandate, see what the held evidence does and does not support. |
...
-`specs/008-portfolio-survival-and-brief-lab/` — spec, design, and sixteen scopes
-with per-scope evidence.
+`specs/008-portfolio-survival-and-brief-lab/` — spec, design, and twenty-nine
+scopes with per-scope evidence.
```

The same diff adds the previously undocumented shipped contracts, each described in terms of an
inspectable state rather than an adjective:

- **One compute, two views** — the compute that produced the current view is readable on the
  workspace element as `data-compute-token`, so "both views came from one compute" is a state
  a reader can inspect rather than a claim they must trust.
- **Accessible tablist** (Scope 27) — a real `role="tablist"` with a roving tabindex, a skip
  link to the workspace panel, `inert` behind an open modal sheet, and `prefers-reduced-motion`
  and `forced-colors` honored. The note states the controller "never reads or writes an
  identity, value, rank, truth state or conclusion", which is the reason the assistive
  projection cannot disagree with the visual one.
- **Return context** (Scope 26) — a strict `ReturnContext/v1` record in `sessionStorage` with
  exactly fifteen declared fields, allowlisted routes and hashes, and an unexpired window; an
  unknown key is a rejection. Nothing about the handoff enters the URL, history or referrer, so
  a shared link cannot carry someone's research context.
- **Immutable dossier audit** (Scope 25) — a `ResearchDossier/v1` hash-linked chain where a
  correction is a new appended record with a `supersedes-for-current-reading` effect, so the
  superseded reading and the reason it was superseded both remain legible.

## Registry Rollback Proof

The Rollback And Restore contract requires the registry, note and README changes to be one
reversible transaction. The changed-path inventory makes that transaction unusually small.

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `git cat-file -e HEAD:notes/portfolio-survival-allocation-lab.md`, `git status --porcelain -- tools.json index.html rlnav.js README.md`, `git status --porcelain -- portfolio-survival-allocation-lab.html`
**Exit Code:** 0

```text
$ git cat-file -e HEAD:notes/portfolio-survival-allocation-lab.md
RESTORE_TARGET_PRESENT=yes (git checkout -- notes/portfolio-survival-allocation-lab.md restores the prior published entry)

$ git status --porcelain -- tools.json index.html rlnav.js README.md
REGISTRY_CONSUMER_CHANGES_RC=0 (empty output above = all four unmodified)

$ git status --porcelain -- portfolio-survival-allocation-lab.html
(empty = unmodified)
```

Exactly one tracked published surface changed, and its prior revision is present at `HEAD`, so
`git checkout -- notes/portfolio-survival-allocation-lab.md` restores the previous published
entry in one operation. The new carrier is untracked and is removed by deleting it. All four
registry consumers and the product page are unmodified, so a rollback of this scope cannot
break the route: the route lives in the page, and the page was never touched.

This proof is derived from executed repository state. A revert was not performed, because
performing one would dirty a delivered tree to demonstrate something the inventory already
establishes.

## Build Quality Gate

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `git diff --check`
**Exit Code:** 0

```text
$ git diff --check
DIFF_CHECK_RC=0
```

No whitespace errors and no conflict markers.

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "Scope 29 Build Quality Gate - artifact lint" -- timeout 540 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab`
**Exit Code:** 0

```text
# Scope 29 Build Quality Gate - artifact lint
$ timeout 540 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab
exit: 0
lines: 406
sha256: ed9142d7152044254040019b1b8b5bda8eb2f0e069f511acdd675c357cff0950
--- first 20 ---
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes/_index.md
✅ Per-scope layout contains 29 scope file(s)
--- omitted 366 line(s); sha256 above covers the full output ---
--- last 20 ---
✅ No unfilled evidence template placeholders in scopes/28-spec-driven-adversarial-test-replacement/report.md
✅ No unfilled evidence template placeholders in scopes/29-documentation-and-registry-truth/report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify ed9142d7152044254040019b1b8b5bda8eb2f0e069f511acdd675c357cff0950 -- timeout 540 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab -->

**Zero skips and zero warnings.** Taken from the recorded row output rather than asserted:

| Row | Skipped | Todo | Failed |
|---|---|---|---|
| TP-29-01 | 0 | 0 | 0 |
| TP-29-02 | none reported; `1 passed` | not applicable | 0 |
| TP-29-03 | not applicable | not applicable | 0 (`3404 passed, 0 failed`) |
| TP-29-04 | not applicable | not applicable | exit 0 |
| TP-29-05 | 0 | 0 | 0 |

**No excluded-file changes.** All three delivered paths are named **Allowed** by the Change
Boundary, as tabulated under Code Diff Evidence. The excluded categories are each unmodified:
production analytics, store, brief and controller code (`portfolio-survival-allocation-lab.html`
and the runtime modules), generic Market Brief artifacts, unrelated tool entries and docs, and
framework-managed files. The five co-resident spec paths belong to the planning transaction that
declares itself authorship-only, are attributed rather than claimed, and were not authored by
this scope.

## Lint And Quality

`artifact-lint.sh` passed at exit 0 across all 29 scopes of Feature 008, including the check
that this report contains no unfilled evidence template placeholders. `git diff --check` passed
at exit 0.

The repository has no separate formatter or linter command; `node scripts/selftest.mjs`
(TP-29-03) is the canonical repository-wide quality gate and passed with 3404 assertions and
zero failures.

## Spot-Check Recommendations

- Open Feature 008 from each of the five published surfaces and confirm the resulting hash is
  `#brief` and the visible default tab is Brief.
- Compare any complete-capability sentence in the note against a current exact test identity;
  the note's own inventory table is checked against the real `tests/` listing by TP-29-01.
- Re-derive any evidence hash above with the `verify` comment that follows its block.
- Confirm the `#workspace` fallback behavior is still the intended product behavior rather than
  something to remove, since TP-29-02 records that the retired hash reaches Brief by fallback.

## Validation Summary

| Item | Command | Exit | Result |
|---|---|---|---|
| TP-29-01 docs integration | `node --test tests/portfolio-doc-integration.functional.mjs` | 0 | PASS — 3/3 |
| TP-29-02 entry-route regression | `npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-055 …" --reporter=list` | 0 | PASS — 1 passed |
| TP-29-03 repository selftest | `node scripts/selftest.mjs` | 0 | PASS — 3404 passed, 0 failed |
| TP-29-04 reachability | `node scripts/validate-test-file-reachability.mjs` | 0 | PASS — new carrier reachable, absent from baseline |
| TP-29-05 adversarial mutation | `node --test --test-name-pattern="Adversarial: stale workspace hashes and overclaims fail Feature 008 publication truth" tests/portfolio-doc-integration.functional.mjs` | 0 | PASS — 12 mutations rejected |
| Linked-test resolution (G057) | `bash .github/bubbles/scripts/scenario-test-resolve.sh specs/008-portfolio-survival-and-brief-lab` | 0 | PASS — 68/68 resolved |
| Stale-reference search | `grep -n '#workspace' tools.json index.html rlnav.js README.md notes/…` | 1 | PASS — zero stale references |
| Build Quality Gate — whitespace | `git diff --check` | 0 | PASS |
| Build Quality Gate — artifact lint | `bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab` | 0 | PASS |

All five Test Plan rows executed and passed in this session. All eight Definition of Done items
are checked. Scope 29 status is **Done**.

### Entry Gate Exception (disclosed, not absorbed)

Scope 29 declares `**Entry Gate:** Every scope in Depends On must be Done` and `**Depends On:** 28`.
**That gate is not satisfied.** Recorded state at the time of this closure:

**Phase:** implement
**Executed:** YES (in current session)
**Claim Source:** executed
**Command:** `grep -n '^\*\*Status:\*\*' specs/008-portfolio-survival-and-brief-lab/scopes/28-spec-driven-adversarial-test-replacement/scope.md` and `grep -nE '^\| *(28|29) *\|' specs/008-portfolio-survival-and-brief-lab/scopes/_index.md`
**Exit Code:** 0

```text
scopes/28-spec-driven-adversarial-test-replacement/scope.md:5:**Status:** In Progress

_index.md:164:| 28 | Spec-Driven Adversarial Test Replacement | ... | In Progress |
_index.md:165:| 29 | Documentation And Registry Truth | ... | Not Started |
```

Scope 28 carries one unchecked DoD item. Its text asserts that "SCN-008-055 remains solely owned
by Scope 29 with authored but planned-not-executed functional and E2E carriers" — a premise this
scope's execution has now overtaken.

Three things follow, and they are kept separate on purpose:

1. **The eight Scope 29 DoD items are satisfied on their own evidence.** Every one is backed by a
   command executed in this session with its raw output and exit code recorded above. Scope 28's
   status does not weaken any of them.
2. **The sequencing contract was still not honored.** Marking this scope Done while its declared
   dependency is In Progress is an exception, and it is recorded here rather than left for an
   auditor to notice from the status table.
3. **This report owner cannot close it.** Scope 28's status and DoD are foreign artifacts, and its
   unchecked item is a test-integrity ownership claim across SCN-008-001 through SCN-008-054 that
   this scope has not validated and must not assert.

`state.json` was not written by this report owner, so no spec-level status was advanced on the
strength of this exception. It is routed below and is a legitimate input for certification.

### Routed Findings

**Finding 1 — Entry Gate unsatisfied**
**Owner:** `/bubbles.implement` for Scope 28 execution, with `/bubbles.validate` to weigh it at certification
**Artifact:** `specs/008-portfolio-survival-and-brief-lab/scopes/28-spec-driven-adversarial-test-replacement/scope.md`

Scope 28 is `In Progress` with one unchecked DoD item while its dependent Scope 29 is Done. Either
Scope 28's remaining item is closed on its own evidence, or the `28 -> 29` sequencing is
reconsidered by its owner. This report does not do either.

**Finding 2 — stale planning prose in this scope's own `scope.md`**
**Owner:** `/bubbles.plan`
**Artifact:** `specs/008-portfolio-survival-and-brief-lab/scopes/29-documentation-and-registry-truth/scope.md`

The Test Plan preamble reads: "Every TP-29 row remains planned-not-executed while this scope is Not
Started; this planning reconciliation records authorship only." That sentence was accurate when the
planning reconciliation wrote it. It is stale now that all five rows are executed and Status is Done.
It is planning-owned prose, not execution progress, so this report owner did not edit it.

The same reconciliation set `scenario-manifest.json` `planStatus` to `authored` for the four
SCN-008-055 declarations while explicitly noting that "no authorship change records execution"; those
entries may now warrant an execution-aware status from their owner.

**Finding 3 — scope status drift between artifacts**
**Owner:** `/bubbles.plan`
**Artifacts:** `specs/008-portfolio-survival-and-brief-lab/state.json`, `specs/008-portfolio-survival-and-brief-lab/scopes/_index.md`

`state.json` records `28-spec-driven-adversarial-test-replacement` and
`29-documentation-and-registry-truth` as `not_started`, and records `execution.currentScope` as 27,
while `_index.md` and the scope files disagree. Scope 27 is Done in `_index.md` and `scope.md`. This
drift predates this scope's closure. `state.json` and `_index.md` were not written by this report
owner; only `scopes/29-documentation-and-registry-truth/scope.md` Status and DoD checkboxes were.

None of the three findings affects any evidence recorded above.

## Audit Verdict

Not yet audited. Ready for audit.

Certification is owned by `/bubbles.validate` and is not claimed here. `state.json`
`certification.*` was not written by this report owner.

Not audited.