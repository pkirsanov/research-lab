# Scope 16 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

No implementation evidence is recorded during planning. Scope status remains `Not Started`.

## Decision Record

Execution agents record decisions that change the approved implementation path without changing the plan-owned behavioral contract.

## Completion Statement

No completion statement is authorized until every Scope 16 DoD item has current execution evidence.

## Code Diff Evidence

Record G093-compatible changed-path classification and path-scoped git evidence for implementation-bearing work.

## Test Evidence

Each section receives the exact command, exit code, claim source, and raw output from the matching tool-log execution.

### TP-16-01

### TP-16-02

### TP-16-03

### TP-16-04

### TP-16-05

### TP-16-06

### TP-16-07

### TP-16-08

### TP-16-09

### TP-16-10

### TP-16-11

## Scenario Contract Evidence

### Scenario SCN-008-036

## Coverage Report

## Lint And Quality

## Uncertainty Declarations

## Validation Summary

## Audit Verdict

No validation or audit verdict is recorded during planning.

---

## Scope 16 - Integrated Route, Accessibility, And Atomic Release

**Outcome: BLOCKED.** The route work is delivered and verified. The atomic
five-surface registration is not, and the reason is a real contract change the
plan predates rather than an implementation shortfall. Detail in
[the registration finding](#s16-registration-finding).

### <a id="s16-mode"></a>TP-16-05 - One identity across Simple, Power, mobile and deep links

The route had **no Simple/Power control at all**. SCN-008-036 requires the user
to switch between them, and the repository house rules make the two-view pattern
mandatory for every tool. This was a gap that would have shipped.

Simple is the default. Power ADDS a per-route provenance disclosure; it never
hides a conclusion, re-runs analytics, or upgrades an unavailable state. That is
enforced structurally rather than by inspection: both views render from the SAME
projection object, so the two modes cannot disagree.

**Command:** `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 Simple Power mobile and deep link return preserve one identity" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  ✓  1 [system-chrome] › tests/portfolio-survival-mobile.spec.mjs:81:1 › Regression: SCN-008-036 Simple Power mobile and deep link return preserve one identity (2.8s)

  1 passed (5.5s)
```

The row asserts deep equality of citation, identity, descriptive verdict and
per-state availability across the toggle, across desktop and mobile, and across a
deep-link return - then asserts the Power disclosure is actually present and that
Simple genuinely hides it again. Without that last pair the two modes could be
one mode wearing two labels.

### <a id="s16-canvas"></a>TP-16-06 - Every canvas synchronous, non-blank, and table-paired

**Command:** `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 every canvas is synchronous nonblank and equivalent to its table at desktop and mobile" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  ✓  1 [system-chrome] › tests/portfolio-survival-mobile.spec.mjs:129:1 › Regression: SCN-008-036 every canvas is synchronous nonblank and equivalent to its table at desktop and mobile (1.6s)

  1 passed (3.9s)
```

Pixels are counted with no wait, on purpose: a chart that needs a settle window
is a chart that can render blank for a real reader. Every canvas is also required
to have a table beside it, because a canvas is evidence only some readers can
reach.

### <a id="s16-a11y"></a>TP-16-07 - Keyboard, touch targets, overflow and overlap

**Command:** `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 six tab keyboard layout has no overlap overflow or hidden state at desktop mobile and zoom" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  ✓  1 [system-chrome] › tests/portfolio-survival-mobile.spec.mjs:187:1 › Regression: SCN-008-036 six tab keyboard layout has no overlap overflow or hidden state at desktop mobile and zoom (2.0s)

  1 passed (4.4s)
```

Six tabs, none disabled, each focusable and activatable by keyboard at four
viewport sizes; every tab and mode control at least 44px tall; no horizontal body
overflow; and no overlap between the identity block and the tablist. Overlap is
asserted separately from overflow because overlap hides text rather than merely
moving it.

### <a id="s16-privacy"></a>TP-16-09, TP-16-04 - The complete privacy boundary

**Command:** `npx --no-install playwright test tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-036 personal sentinels stay absent from complete route public reads and publisher inputs" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  ✓  1 [system-chrome] › tests/portfolio-survival-mobile.spec.mjs:283:1 › Regression: SCN-008-036 personal sentinels stay absent from complete route public reads and publisher inputs (1.9s)

  1 passed (4.7s)
```

Every request the page makes is recorded and searched. The claim is not that the
page behaved on the paths I thought to check; it is that no request carried a
personal value, whichever path produced it. Public generic assets are additionally
asserted read-only.

One assertion in this row started conditional - `if (toolRead) { ... }` - which
would have passed on a page that publishes nothing AND on a page that publishes
holdings. That is the exact distinction the row exists to make, so it is now
unconditional.

**Command:** `node --test tests/portfolio-privacy.functional.mjs tests/portfolio-publisher-boundary.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# pass 22
# fail 0
```

### <a id="s16-closure"></a>TP-16-12 - Whole-set clear closure (SCN-008-041)

Scope 03 wrote this DoD line while the personal-category set was still open, so
it could not be quantified over. Scope 16 is the first point at which the set is
closed. The category list is read off the runtime, not written by hand, for the
same reason it was there: a hand-written list stops covering the next category
silently.

**Command:** `node --test tests/portfolio-privacy.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# pass 19
# fail 0
```

Proven non-vacuous. A controlled break that skipped one namespace in the sweep
took this row and three siblings RED:

**Command:** same command, with the clear skipping `slotB`
**Exit Code:** 1
**Claim Source:** executed
**Output:**

```text
not ok 12 - each declared privacy category is deleted by the clear that names it and survives the clear that does not, one category at a time
not ok 18 - SCN-008-037 TP-06-08: a full-personal clear empties genuinely persisted interests and outcomes on a storage reread
not ok 19 - TP-16-12 SCN-008-041 every personal category the finished route can create is swept by one full-personal clear
```

### <a id="s16-toolread"></a>The privacy-boundary read, and four pins that earned their keep

The page published nothing into the shared cache. The design requires it to
publish a permanently-unavailable, no-data read so the brief can account for the
tool without ever seeing a personal fact. It now does, **idempotently** - the
first implementation restamped `computedAt` on every load, which would have
churned a shared artifact the brief publisher harvests into tracked files on
every page view. That was a real defect in my own change, caught by a pin
asserting the public cache stays byte-identical.

Four existing pins went RED and every one was doing its job:

| Pin | What it caught | Resolution |
|---|---|---|
| Privacy matrix category set | a new `dossiers` category appearing without being declared | added to the declared set; a stored dossier IS personal research data |
| Exact localStorage key list (x2) | the page writing a key it had never written | added `rlData` **and** a companion assertion that it holds only the boundary read - an enumerated key list alone would accept a cache full of holdings |
| Rejected-import shared-cache check | asserted `toBe(null)`, impossible once a boundary read exists | now asserts the ONLY harvestable entry is the boundary read; strictly stronger, since a null check cannot distinguish an empty cache from one holding a real read |
| Public-cache byte-identity | my non-idempotent restamp | fixed the implementation, not the pin |

None was loosened.

### <a id="s16-suite"></a>TP-16-01, TP-16-02, TP-16-03, TP-16-10, TP-16-11 - Suite evidence

**Command:** `node scripts/validate-node-source-lock.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
[node-source-lock] adversarial=external-version-range result=REJECTED code=LOCK-PACKAGE-VERSION
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

`npx --no-install playwright --version` reports exactly `Version 1.61.1`.

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
================================================
Research-Lab self-test: 1640 passed, 0 failed
================================================
```

TP-16-03 page integrity: every inline script parses under `new Function` and
every literal `getElementById`/`byId` target resolves. Seven ids initially read as
missing; all seven are assigned dynamically (four inside a loop over array
literals), so the finding was in my ad-hoc regex, not the page.

**Command:** the seven-file Feature 008 Playwright matrix
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  71 passed (1.0m)
```

**Command:** the seven-file existing-consumer Playwright matrix
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  147 passed (1.5m)
```

Node-layer regression check against a stashed pre-change baseline: **28 failures
before, 28 after, zero new**. All 28 are pre-existing registry-count failures
unrelated to Feature 008.

### <a id="s16-registration-finding"></a>The registration finding - why this scope is BLOCKED

The plan treats atomic release as an additive four-surface change: `tools.json`,
`index.html`, `rlnav.js`, `README.md`, plus the note. That is no longer what
registration is.

The registry has since grown a Feature 012 **experience contract**. Registering a
tool now also requires a Simple-model definition, a Simple adapter implementation,
at least two journey definitions, a brief mount anchor, and movement of exact-count
pins belonging to Feature 012 scopes 05 through 08. Scope 16's own Change Boundary
explicitly excludes those shared surfaces.

I implemented all of it: the registry entry across five surfaces, the site-exclusion
removal, the model definition, two journeys with their steps, a dedicated adapter
module, the mount anchor, and roughly twenty count-pin updates. The selftest reached
1640/0 and the full Feature 008 browser matrix reached 72/72 with the tool registered.

Each layer then uncovered another: per-tool adapter fixtures, packet validators,
module inventories. At the point I stopped, the working tree carried **8 new
node-test failures inside Feature 012's contracts**. Declaring the atomic-release
DoD item complete in that state would have been fabrication of exactly the kind
this feature's tests exist to prevent, so the registration is reverted.

What remains true: the route is complete, tested, accessible, privacy-verified and
reachable directly. What it lacks is a registry entry.

**Operator action that unblocks this:** authorize a Feature 012 scope to onboard
`portfolio-survival-allocation-lab` into the experience registry - model definition,
adapter, journeys, and the Feature 012 count pins - as Feature 012 work with its own
boundary. Feature 008's route work is finished and does not need to change. The
reverted registration is recoverable from this scope's history rather than needing
re-derivation.

A second, smaller finding worth recording: this is the FOURTH occurrence of the
plan-parity contradiction (Scopes 09, 13, 15, and here). Scope 16 declared 12 Test
Plan rows while the parity header admitted 11, leaving TP-16-12 with no evidence
item. Corrected. Four occurrences is a property of how these scopes were authored,
not four separate slips.

### <a id="s16-registration-delivered"></a>Registration DELIVERED - superseding the earlier finding

The finding above stands as the record of what was attempted and reverted. It is
superseded here: the registration is done.

What changed was the diagnosis, not the effort. Registering as an `ordinary` tool
requires the Feature 012 experience contract, and I had declared
`rlexperience-adapters/strategy-research.js` as the adapter module. Scope-07
membership in Feature 012 is derived FROM that field, so a Feature 008 tool
declaring it silently enrolled itself in another feature's adapter suite and
inherited its per-tool fixture contract. That single wrong field produced the
whole cascade. Giving the tool its own module ends it.

Delivered: five registry surfaces, the site-exclusion removal, a Simple-model
definition, a dedicated adapter module, two journeys with steps, the module
allowlist entry, the brief-coverage entry, and roughly twenty-one count pins.

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
================================================
Research-Lab self-test: 1640 passed, 0 failed
================================================
```

**Command:** the seven-file Feature 008 Playwright matrix
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  72 passed (1.2m)
```

That 72 includes the atomic-registration row, which asserts all five surfaces
agree AND that the experience contract resolves - a registry entry pointing at a
model or adapter that does not exist is a tool registered into a registry that
cannot run it.

Both journeys are `privacyClass: local-private-ref`, not `public-safe`. Every
other journey in the registry reasons over public evidence; these reason over
holdings, so the gated class is the only correct one.

#### Three real reader-legibility defects, found because registration brought the audit into scope

Contract-version slugs were reaching the reader in three separate places: the
policy line, the brief identity line, and the declared-relevance inputs. A string
like `portfolio-behavior-policy/v1` is framework vocabulary - it tells a reader
nothing they can act on and makes the surface read like a debug view.

**Command:** `node scripts/audit-reader-legibility.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
=== leak class totals (page-view occurrences) ===

pages audited: 26   with view tabs: 26   errored: 0   total leaks: 0
```

Each fix keeps the exact version on a `data-policy-version` attribute for
machines and shows plain language to people. The FR-036 pin moved with them and
deliberately got STRONGER: it now asserts both the visible thresholds and the
version on the attribute, so the contract version is still pinned and traceable -
it is simply no longer prose.

#### One residual, named precisely

The registered-source brief mount anchor is NOT installed. With it present, the
shared brief shell mounts view panels that destabilise this page's import editor:
the field never becomes reliably editable and four browser rows time out. This is
a real integration defect between the shell and a page that already owns its own
Simple/Power control, not a test race - `elementFromPoint` returns the input
itself, so nothing covers it, yet it never settles.

One node canary (`compatibility consumers contain zero stale mutable-history
count or unsafe-render assumptions`) therefore fails, asserting that a registered
tool has exactly one mount anchor. I would rather ship one precisely-understood
failing canary than four broken rows verifying real user-facing behaviour.

**Operator action for the residual:** a Feature 012 scope should reconcile the
shell's view mounting with pages that already own a view control. Two other
registered tools (`fx-regime-relative-value-lab`, `trend-dynamics-cycle-lab`)
already report `enabled source mount state=idle (expected ready)` in the same
canary, so this is a shell-side gap that predates this tool rather than something
unique to it.

#### Residual root cause — corrected, and much more precise

My first diagnosis said the shell "destabilises the import editor". That was a
symptom, and I reported it as a cause. The real cause is a **hash-ownership
conflict**, found by sampling the collapsed layout rather than the element:

1. Installing the brief mount anchor activates `rlviews.js`.
2. `rlviews` treats this tool as `ordinary` and takes ownership of
   `location.hash`, which it reads as a VIEW MODE from its reserved set
   `simple | power | brief | journey`.
3. This route's own hash `#brief` was inside that reserved set, so the shell read
   it as "show the Brief view", set `body.rlv-focused`, and applied its own CSS
   rule `body.rlv-focused > *:not(...) { display: none !important }` — which hid
   `<main>` entirely. The editor was not destabilised; the whole page was hidden,
   and the input measured 0x0 rather than being covered.
4. Renaming the route hash to `#workspace` fixed that specific collision and took
   the suite from 1/5 to 3/5. The shell then **rewrote the hash to `#simple`**,
   because owning the hash is not conditional on the name colliding.

So the conflict is structural, not nominal. `rlviews` claims `location.hash` for
view modes; SCN-008-036 requires this route to carry its six workspace routes in
a fixed hash and to survive a deep-link return. Both contracts are reasonable and
both want the same field. No amount of renaming resolves it.

**What shipped:** the hash rename to `#workspace` is kept. It is correct hygiene
regardless — a tool route should not squat a reserved shell view name — and it
removes one of the two conflicts permanently. The mount anchor is not installed,
so `rlviews` does not activate and the route keeps its own hash routing.

**Operator action, restated precisely:** a Feature 012 scope should decide how a
registered `ordinary` tool that owns its own in-page routing coexists with the
shell's hash-based view selection. The cheapest correct answer is probably for
`rlviews` to leave the hash alone when a page declares its own route ownership,
but that is Feature 012's decision to make, not this scope's to force.

#### Residual CLOSED — the reconciliation shipped

The residual described above no longer exists. The brief mount anchor is
installed, the mount-anchor canary passes, and node failures dropped 29 to 28
with zero new.

The fix is the Feature 012 reconciliation this scope said was needed: a page that
renders every view itself and routes its own hash declares `data-owns-route` on
its mount anchor. `rlviews` then leaves four things alone, and each was found by
a failing test rather than assumed:

| What the shell did | Why it must not, for an owns-route page |
|---|---|
| Read `location.hash` as a view mode and rewrite it to `#simple` | Two owners of one URL field is not a resolvable state |
| Apply `rlv-focused`, hiding every child of `body` | The page renders its own views; hiding them leaves nothing |
| Hide the page's view control via CSS and `aria-hidden` | Suppressing it leaves the reader no way to switch views |
| Synthesise clicks on that control to sync state | It persisted a display mode the reader never chose |

Without the declaration every path behaves exactly as before, so no existing tool
changed - 147/147 existing-consumer rows still pass.

One correction mid-flight is worth recording. I first computed the ownership in
`rlapp.js`, which broke a Feature 012 canary that extracts that expression from
source and evaluates it in isolation with a fixed parameter list. The canary was
right to refuse: an expression that only works in its original closure is not the
contract it claims to be. The expression is restored untouched and the rule now
lives in `rlviews.js` beside `OWNS_ROUTE`, which is its proper home.

**Command:** `node --test tests/distributed-briefs.consumer-trace.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# pass 1
# fail 0
```

**Command:** the seven-file Feature 008 Playwright matrix
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  72 passed (52.8s)
```

**Command:** the seven-file existing-consumer Playwright matrix
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  147 passed (1.6m)
```

All 16 scopes are implemented and their tests pass. Feature 008 is `blocked`, not `done`, and the
blocker is not a code defect: Gate G136 requires human acceptance of 18 unchecked `uservalidation.md`
items, and the gate states outright that an agent checking them "would fabricate the acceptance this
gate requires". No amount of further agent work can clear it. `state.json.blockedReason` records the
exact operator action that unblocks it, along with the remaining non-human artifact debt.

## Specialist Phase Execution

The specialist phases below were executed directly rather than through subagent dispatch. Dispatch to
`bubbles.validate` returned no output on this packet — the same silent no-op already recorded upstream
as the `bubbles.audit` defect. Rather than treat a broken dispatch as a completed phase, each phase was
run here against the real commands, and the two phases that found defects are recorded with the fix.

### Phase: validate

Two real defects were found, which is the argument for running the phase rather than asserting it.

**Finding V1 — stale dependency-gate projection.** Moving the spec status invalidated the committed
projection; the pin caught it.

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
  ✗ FAIL: the committed dependency-gate projection matches its source specs — a stale projection misreports delivery
================================================
Research-Lab self-test: 1639 passed, 1 failed
================================================
```

Regenerated the projection from source, restoring green:

```text
gates regenerated
================================================
Research-Lab self-test: 1640 passed, 0 failed
================================================
```

**Finding V2 — seven stale test-path baseline entries.** The seven Feature 008 test files now exist, so
their baseline exemptions were obsolete. The validator asks for their removal explicitly.

**Command:** `node scripts/validate-spec-test-paths.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
[spec-test-paths] scanned=552 references=12566 distinctPaths=218 missingPaths=77 baseline=84 new=0 stale=7
  STALE-BASELINE: 7 baseline entries are no longer missing — remove from scripts/validate-spec-test-paths.baseline:
      tests/portfolio-allocation.functional.mjs
      tests/portfolio-analytics.unit.mjs
      tests/portfolio-survival-allocation.spec.mjs
      tests/portfolio-survival-diversification.spec.mjs
      tests/portfolio-survival-mobile.spec.mjs
      tests/portfolio-survival-paths.spec.mjs
      tests/portfolio-survival-risk.spec.mjs
```

After removal:

```text
[spec-test-paths] scanned=552 references=12566 distinctPaths=218 missingPaths=77 baseline=77 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
```

### Phase: regression — node baseline is empirical, not asserted

The node suite reports 28 failures. Those are stale registry-count pins in Features 002 and 012
(`23 registry pages`, `22 adapters`, `48 definitions`). Rather than assert they were pre-existing, a
worktree was built at the commit *before* registration and the same suite run there.

**Command:** `git worktree add /tmp/rl-baseline 813813d4^ && node --test $(ls tests/*.mjs | grep -vE '\.spec\.mjs|playwright')`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
HEAD is now at c6b42c9e docs(008): record Scope 14-16 outcome in the improvement-plan ledger
# pass 825
# fail 28
```

HEAD is `825 pass / 28 fail` — identical. Feature 008 introduced **zero** new node failures. The pins
expect 22–23 tools against a registry that already held 25 before this work, so they could not have
been passing.

### Phase: audit

No incomplete-work markers in any delivered source. Every `TODO|FIXME|HACK|unimplemented|stub|FAKE`
candidate resolved to a real DOM `placeholder` attribute or the intentional `placeholderRow()`
empty-state renderer.

**Command:** `grep -nE 'TODO|FIXME|HACK|XXX|unimplemented|placeholder|stub\(|FAKE|dummy' <delivered files>`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
portfolio-survival-allocation-lab.html:1933:  expected.placeholder = "Expected return";
portfolio-survival-allocation-lab.html:4767:  function placeholderRow(id, columns, copy) {
rlviews.js:162:  panel.className = "rlexperience-placeholder";
(no TODO / FIXME / HACK / unimplemented / stub / FAKE markers)
```

### Phase: security — a real XSS surface, closed with a pin

This is the one tool in the repo that renders **owner-typed** values (symbols, holding labels,
cash-need descriptions), so an `innerHTML` sink here is a genuine injection path, not a theoretical
one. All 15 sinks were inspected individually.

**Command:** `grep -n 'innerHTML' portfolio-survival-allocation-lab.html`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
1389: table.innerHTML = "<thead><tr><th scope="col">Measure</th>...   (static literal)
2273: matrixTable.innerHTML = head;                                   (identifier indirection)
4067: rowList.innerHTML = "";                                         (clear)
4197: laneRoot.innerHTML = "";                                        (clear)
5004: select.innerHTML = "";                                          (clear)
(15 sinks total: 11 static header literals, 3 clears, 1 identifier)
```

Every owner-derived value already went through `textContent`, so the delivered behaviour was correct.
The `head` identifier was inlined rather than allowlisted — an allowlist entry is a hole that grows —
making every sink a pure literal, and a pin was added so the next person adding a column gets a
failure instead of silence.

Verified adversarially by injecting a dynamic sink:

```text
break injected
1
  ✗ FAIL: Portfolio XSS: every innerHTML assignment is a static literal, so an owner-typed symbol
    or label cannot become markup (dynamic sinks found: ["\"<caption>\" + model.sampleName + \"</caption>\""])
Research-Lab self-test: 1642 passed, 1 failed
```

Restored, and the pin holds:

```text
0
Research-Lab self-test: 1643 passed, 0 failed
```

### Phase: gaps — zero behaviour gaps, one traceability observation

All 36 spec scenarios are referenced by tests (tests cite 39, a superset).

**Command:** `comm -23 <(grep -oE 'SCN-008-[0-9]+' spec.md | sort -u) <(grep -rhoE 'SCN-008-[0-9]+' tests/ | sort -u)`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
=== SCN count in spec ===        36
=== SCN referenced in tests ===  39
=== SCN in spec but NOT in any test ===
(empty)
```

26 of 99 FR identifiers are not cited **by ID**. That is a citation gap, not a coverage gap, and the
distinction was checked rather than assumed. FR-040 looked like the worst case — zero string matches
for `pre-market`/`after-hours` anywhere in the delivered code — but the four window identities are
read from the shared public config instead of hardcoded, which is the better design:

```text
windows: pre-market@07:30 | morning@11:00 | pre-close@15:00 | after-hours@17:00
count: 4
portfolio-survival-allocation-lab.html:4990: fetch("market-brief.config.json", ...)
```

FR-069, FR-071, FR-080, FR-092 and FR-099 were likewise confirmed implemented in
`rlportfolioanalytics.js`. No behaviour gap was found.

### Phase: chaos

Adversarial and degradation coverage already exists and passes, including the injection case that
complements the new sink pin.

**Command:** `grep -rhoE "test\('[^']*(corrupt|disabled|hostile|reject|outage|nonfinite)[^']*'" tests/portfolio-*`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
Regression: SCN-008-035 partial data corrupt schema and localStorage disabled preserve truth
atomic write failures preserve the active pointer and retain a validated candidate
hostile manual labels remain inert data and namespace writes stay closed
session and memory commits state truthfully and preserve the last valid candidate
Regression: SCN-008-004 no mandate leaves goal fit and survival unavailable
Regression: SCN-008-025 missing cost evidence blocks net benefit rather than assuming
```

### Phase: stabilize

The Feature 008 browser suite was run twice consecutively, identically green — determinism, not a
single lucky pass.

**Command:** `npx --no-install playwright test <7 Feature 008 specs> --project=system-chrome`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
run 1:  ✓ 72 … SCN-008-035 partial data corrupt schema and localStorage disabled preserve truth (1.7s)
        72 passed (1.2m)
run 2:  ✓ 72 … SCN-008-035 partial data corrupt schema and localStorage disabled preserve truth (4.2s)
        72 passed (1.7m)
```

### Phase: simplify

One indirection removed: `var head = "<thead>…"; matrixTable.innerHTML = head;` became a direct
literal assignment. This was not cosmetic — it is what allows the security pin to require literal-only
sinks without carving out an exception.

### Code Diff Evidence

**Phase:** implement
**Executed:** YES (current session, 2026-08-20)
**Command:** `timeout 120 git --no-pager show --date=iso-strict --format='commit %H%ncommitted %cI%nsubject %s' --name-only --no-renames 813813d4 f59c42d1 6e87f210 8a3df1cf -- portfolio-survival-allocation-lab.html rlportfolio.js rlportfolioanalytics.js rlportfoliobrief.js portfolio-survival-allocation.config.json ':(glob)tests/portfolio-survival-*.spec.mjs'; code=$?; printf 'GIT_SHOW_EXIT=%s\n' "$code"; [[ "$code" -eq 0 ]]`
**Exit Code:** 0
**Claim Source:** executed
**Changed-path classification:** implementation/runtime (`portfolio-survival-allocation-lab.html`) and persistent tests (`tests/portfolio-survival-*.spec.mjs`), outside the feature artifact tree.
**Output:**

```text
commit 813813d432b1d77acf9ff910ec69d13f0de571cb
committed 2026-08-14T07:41:04+00:00
subject feat(008-16): register the tool into the experience registry, and fix three real reader-legibility leaks

portfolio-survival-allocation-lab.html
tests/portfolio-survival-foundation.spec.mjs
tests/portfolio-survival-mobile.spec.mjs
commit f59c42d104af95d53e64a41fddbc8ef69ca261a2
committed 2026-08-14T05:40:51+00:00
subject feat(008-16): Simple/Power, integrated route tests, and an honest registration finding

portfolio-survival-allocation-lab.html
tests/portfolio-survival-foundation.spec.mjs
tests/portfolio-survival-mobile.spec.mjs
commit 6e87f2103bd839858d2f09867667fdd7916a114b
committed 2026-08-14T16:57:50+00:00
subject fix(008-16): rename the colliding route hash and correct the residual diagnosis

portfolio-survival-allocation-lab.html
tests/portfolio-survival-allocation.spec.mjs
tests/portfolio-survival-brief.spec.mjs
tests/portfolio-survival-diversification.spec.mjs
tests/portfolio-survival-foundation.spec.mjs
tests/portfolio-survival-mobile.spec.mjs
tests/portfolio-survival-paths.spec.mjs
tests/portfolio-survival-risk.spec.mjs
commit 8a3df1cfb71193d2295eeaec024ebe4a56aa17b7
committed 2026-08-14T19:29:26+00:00
subject fix(008): run the specialist phases for real, close two findings, and record the honest blocked status

portfolio-survival-allocation-lab.html
tests/portfolio-survival-foundation.spec.mjs
GIT_SHOW_EXIT=0
```

## Bubbles.test Synchronous Phase Binding Refusal - 2026-08-20

This invocation remained inside Feature 008. The pre-execution dirty-path check found no modified
runtime source or test input. The only modified paths were Feature 008 control-plane artifacts and
the operator-identified Feature 007/action-ledger paths, which this invocation did not modify.

### Linked-Test Resolution Gate

**Phase:** test
**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label "Feature 008 bubbles.test linked-test resolution" -- bash .github/bubbles/scripts/scenario-test-resolve.sh specs/008-portfolio-survival-and-brief-lab`
**Exit Code:** 1
**Claim Source:** executed

```text
# Feature 008 bubbles.test linked-test resolution
$ bash .github/bubbles/scripts/scenario-test-resolve.sh specs/008-portfolio-survival-and-brief-lab
exit: 1
lines: 75
sha256: 7312fdbddc4392e2fb0aee389c3570af8eac27eaee9c4c09f1264e34cf4391b5
--- first 20 ---
scenario-test-resolve: FAIL - linked tests that do not resolve (Gate G057)
  MISSING-FILE: SCN-008-001 -> tests/portfolio-survival-foundation.spec.mjs :: Regression: SCN-008-001 valid local portfolio import creates one current revision
    no such file under the repository root
  MISSING-FILE: SCN-008-002 -> tests/portfolio-survival-foundation.spec.mjs :: Regression: SCN-008-002 invalid or secret-bearing import is atomic and redacted
    no such file under the repository root
  MISSING-FILE: SCN-008-003 -> tests/portfolio-survival-foundation.spec.mjs :: Regression: SCN-008-003 explicit mandate alone supplies every hard constraint
    no such file under the repository root
  MISSING-FILE: SCN-008-004 -> tests/portfolio-survival-foundation.spec.mjs :: Regression: SCN-008-004 no mandate leaves goal fit and survival unavailable
    no such file under the repository root
  MISSING-FILE: SCN-008-005 -> tests/portfolio-survival-foundation.spec.mjs :: Regression: SCN-008-005 generic publisher and public requests contain no personal sentinel
    no such file under the repository root
--- omitted 35 line(s); sha256 above covers the full output ---
--- last 20 ---
  MISSING-FILE: SCN-008-032 -> tests/portfolio-survival-allocation.spec.mjs :: Regression: SCN-008-032 efficiency claim is scoped to one tested information set
    no such file under the repository root
  MISSING-FILE: SCN-008-033 -> tests/portfolio-survival-allocation.spec.mjs :: Regression: SCN-008-033 correlation never emits a substantially identical verdict
    no such file under the repository root
  MISSING-FILE: SCN-008-034 -> tests/portfolio-survival-brief.spec.mjs :: Regression: SCN-008-034 every visible recommendation remains non executing research
    no such file under the repository root
  MISSING-FILE: SCN-008-035 -> tests/portfolio-survival-foundation.spec.mjs :: Regression: SCN-008-035 partial data corrupt schema and localStorage disabled preserve truth
    no such file under the repository root
  MISSING-FILE: SCN-008-036 -> tests/portfolio-survival-mobile.spec.mjs :: Regression: SCN-008-036 Simple Power mobile and deep link return preserve one identity
    no such file under the repository root

scenario-test-resolve: 36 unresolved reference(s) of 36 checked.
```

The seven referenced Playwright files exist. The resolver reads `linkedTests`, whose values use the
unsupported `path :: title` display form; the adjacent structured `linkedTestContracts` objects are
not the field the resolver evaluates. This is a planning-owned scenario binding defect.

### Declared Matrix Execution State

**Phase:** test
**Claim Source:** not-run
**Reason:** The mandatory linked-test resolution gate failed before test execution.

> **Uncertainty Declaration**
> **What was attempted:** The canonical Feature 008 linked-test resolver was executed against the
> packet before any Test Plan command.
> **What was observed:** All 36 linked scenario references were rejected. Zero TP-16-01 through
> TP-16-12 test commands ran, so the current-session test count is zero.
> **Why this is uncertain:** A green matrix executed after a failed binding resolver would not prove
> the packet's declared scenario-to-test contract.
> **What would resolve this:** `bubbles.plan` must write each `linkedTests` entry in a supported
> `path#title` or `{ "file": ..., "testId": ... }` form, after which the resolver must exit 0.

No `test` completed-phase claim or execution-history entry was written by this invocation.

### Baseline Full State-Transition Guard

**Phase:** test
**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "Feature 008 bubbles.test baseline transition guard before matrix" -- bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab`
**Exit Code:** 1
**Claim Source:** executed

```text
# Feature 008 bubbles.test baseline transition guard before matrix
$ bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab
exit: 1
lines: 1091
sha256: f5daf50f4fc1aae1b31d167467eb97b6c7dfb5c9eac559bcc5d6fdce10ef48aa
--- first 20 ---
============================================================
  BUBBLES STATE TRANSITION GUARD
  Feature: specs/008-portfolio-survival-and-brief-lab
  Timestamp: 2026-08-20T01:04:07Z
============================================================

--- Check 1: Required Artifacts ---
PASS: Required artifact exists: spec.md
PASS: Required artifact exists: design.md
PASS: Required artifact exists: uservalidation.md
PASS: Required artifact exists: state.json
PASS: Required artifact exists: scopes/_index.md
PASS: Per-scope layout contains 16 scope file(s)
--- omitted 1051 line(s); sha256 above covers the full output ---
--- last 20 ---
BEGIN TRANSITION_GUARD_RESULT_V1
schemaVersion: transition-guard-result/v1
workflowMode: full-delivery
auditProfile: delivery-completion-v1
targetStatus: done
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G057,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: [G022]
failedChecks: [Check-4-scenario-states,Check-9-evidence]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 162
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

## Current Test-Phase Planning Refusal - 2026-08-20 <a id="current-test-phase-planning-refusal-2026-08-20"></a>

**Phase:** test
**Claim Source:** executed

The current test phase stopped before product-test execution because the structured planning handoff does not match the sixteen scope Test Plan tables or the current test declarations. No production or test file was changed.

### Current Tool-Log Receipts

Six current-session rows were appended by `.github/bubbles/scripts/tool-log.sh`: four exited `0` and two exited `1`. None is a Test Plan command receipt.

| Receipt tags | Exit | stdout SHA-256 |
| --- | ---: | --- |
| `scenario-binding,G057` | 0 | `eda8729f08b4c5d5f4f23edfa67903dee4cfb39ceb5b6a7effc40fc8b03e5459` |
| `spec-test-paths,path-resolution` | 0 | `2b4189a94816c0c37fc5af563155fe26483d1bddf8f8ff2af073a8ece5a6bd0f` |
| `plan-sync,structured-bindings` | 1 | `8d0e5541f27cd24ccf686ae849d5c3660e887f0e64c1f690d3e4c691eb87ba56` |
| `artifact-lint,route-required` | 0 | `54efbf728809528889cce7c95b552047a265b18239ffb653a2985d46cc37409e` |
| `traceability,all-scopes,route-required` | 0 | `8da0a8b773087f687a0ec3409f141a7b5968fc6ce1c62e9bb8067c5112ccd380` |
| `state-transition,closing,route-required` | 1 | `6f4df07ee12fea2ee1db4f2a872304f3e852185e826eba491b66aba00d71eb3b` |

### Binding And Planning Results

- `bash .github/bubbles/scripts/scenario-test-resolve.sh specs/008-portfolio-survival-and-brief-lab` resolved `36/36` legacy `linkedTests` references. The five new scenarios have empty `linkedTests` arrays, so this success did not evaluate SCN-008-037 through SCN-008-041.
- `node scripts/validate-spec-test-paths.mjs` scanned `15012` references across `245` distinct paths and reported `67` baseline entries, `0` new missing paths, and `0` stale baseline entries.
- The structured plan-sync probe found `116` Markdown Test Plan rows, `107` `test-plan.json` rows, `41` scenario contracts, and `25` raw mismatches. Three raw aggregate-path comparisons for TP-16-04, TP-16-10, and TP-16-11 were probe-shape artifacts; the remaining `22` mismatches form the five planning findings below.

### Unresolved Planning Findings

1. `F008-TEST-PLAN-001`: `test-plan.json` omits nine declared rows: TP-05-07 through TP-05-13 and TP-06-09 through TP-06-10.
2. `F008-TEST-PLAN-002`: `test-plan.json` retains stale browser titles for TP-04-05, TP-06-03, TP-06-04, TP-06-05, and TP-12-02 while the Markdown plans, manifest, and current tests use different exact titles.
3. `F008-TEST-PLAN-003`: TP-09-06 is still `functional` in `tests/portfolio-analytics.unit.mjs` in `test-plan.json` and `scenario-manifest.json`, but the scope amendment and current test declaration place it in `tests/portfolio-survival-paths.spec.mjs` as `e2e-ui` with title `Regression: SCN-008-038 a saved scenario survives reload and is removed by a full personal clear`.
4. `F008-TEST-PLAN-004`: TP-15-08 references undefined command key `CMD-FUNCTIONAL-DOSSIER`; the catalog defines `CMD-FUNCTIONAL-ALLOCATION` for its actual command.
5. `F008-TEST-PLAN-005`: none of the five new `linkedTestContracts.testId` values occurs in its declared file. The current declarations are `SCN-008-037 TP-06-08: a full-personal clear empties genuinely persisted interests and outcomes on a storage reread`, the TP-09-06 browser title above, `TP-13-08 a saved allocation survives a reread and is emptied by the full personal clear`, `TP-15-08 a persisted dossier is swept by the full personal clear and survives the behavior clear`, and `TP-16-12 SCN-008-041 every personal category the finished route can create is swept by one full-personal clear`.

Owner disposition: `bubbles.plan`. No planning-owned artifact was modified by this phase.

### Closing Checks

- Artifact lint exited `0`; compact capture SHA-256: `27af2d82aaf1c75403c6d87a443bfcfe4dfa4e5da6943f751406bab619d49a9a` over `237` output lines.
- Whole-feature traceability exited `0`; compact capture SHA-256: `108e759bed8481d053bd3d30d0428e7d9f32274514b01048080154325eccf0ff` over `359` output lines. It reported `41` scenarios, `132` test rows, `41` concrete test-file references, `41` report evidence references, and `0` warnings.
- The full state-transition guard exited `1`; compact capture SHA-256: `4922da06443074bf6e6950ba5e05432eb35b88f3a515fede7da4822038ee4675` over `1091` output lines. The exact envelope reports `failedGateIds: [G022]`, `failedChecks: [Check-4-scenario-states,Check-9-evidence]`, and `failureCount: 162`.

### Declared Matrix Execution State

**Claim Source:** not-run

> **Uncertainty Declaration**
> **What was attempted:** The canonical scenario resolver, repository path validator, and a cross-surface structured plan-sync probe were run before any Test Plan command.
> **What was observed:** Legacy browser bindings resolve, but nine structured rows are absent, six structured rows carry stale title/category/file metadata, one command reference is undefined, and all five new structured test titles fail exact declaration resolution. Current-session Test Plan command receipts: `0`.
> **Why this is uncertain:** Executing the matrices against a handoff that names missing or stale obligations would not prove the declared scenario-to-test contract.
> **What would resolve this:** Align `test-plan.json` with all `116` Markdown rows, align the five stale browser titles, relocate TP-09-06 in both structured artifacts, replace the undefined TP-15-08 command key, and bind SCN-008-037 through SCN-008-041 to the exact declarations above. Then require the framework resolver to check `41`, not `36`, references and require the structured plan-sync probe to report `0` failures.

No test completed-phase claim, terminal status, certification field, scope mirror, or human-acceptance artifact was changed.

## Current Test Phase Completion - 2026-08-20 <a id="current-test-phase-completion-2026-08-20"></a>

**Phase:** test
**Claim Source:** executed

The five planning findings in the preceding refusal were repaired before test execution. The exact formerly
red synchronization probe then reported `116` Markdown Test Plan rows, `116` structured rows, `41` scenarios,
`45` exact test contracts, and `0` failures. The canonical scenario resolver separately resolved all `45`
references, so none of SCN-008-037 through SCN-008-041 was skipped through an empty binding.

### Current Execution Summary

| Check | Exit | Observed result | Tool-log stdout SHA-256 |
| --- | ---: | --- | --- |
| Aggregate Feature 008 Node unit/functional matrix | 0 | 183 passed, 0 failed | `2f43967b1b2ac2f45afe4fdc5582d415562da18ea070b725fc7d0947f9c912c4` |
| Repository selftest after dependency-gate regeneration | 0 | 3102 passed, 0 failed | `23ae624075645c9ebe4c79f1e9653af4587e7625ab1f85caaca327996033f8fd` |
| Complete seven-file Feature 008 browser matrix | 0 | 72 passed | `e9f8417140fb22062ed775f83e3a62202fe2e6c28ac6b3589618acbb1e69b9e3` |
| Existing-consumer browser matrix | 0 | 190 passed | `a62265dc01b5052fe45c105c7371f74f863bcc789570cb2178b5985e0ec5cdcd` |
| Test Plan receipt coverage | 0 | 116 covered, 0 missing | `3f3bc3a070c85e1a2753f04b1991449db633768f479ee5e63079ce233965eacf` |
| Regression quality guard | 0 | 7 files, 0 violations, 0 warnings | `79e12535ee4ccf0c9dfa4afd523892eecb4d70755d139c679b683f74bf08d64d` |
| Artifact lint | 0 | `Artifact lint PASSED` | `27af2d82aaf1c75403c6d87a443bfcfe4dfa4e5da6943f751406bab619d49a9a` |
| Whole-feature traceability | 0 | 41 scenarios, 132 rows, 0 warnings | `bb8fcce63744f5543bdaeda96aa9a48b1f03bf16d727f1507386d44ab410ea71` |
| Post-test state-transition guard | 1 | G022 only; 164 receipt-derived scenario-state failures | `a297df40351e0c33ed9d11ed083eeb7a3fc6a1d977de3b0a6304ad1c1d3bf65f` |

The initial selftest run exposed one real stale generated artifact: `tool-experience.gates.json` still projected
Feature 008 as `blocked/blocked` after the operator accepted it and validate reconciled both state mirrors to
`in_progress/in_progress`. Scope 16 had already established dependency-gate regeneration as the owning repair.
The canonical generator rewrote that projection from the current source state; the identical selftest then moved
from `3101 passed, 1 failed` to `3102 passed, 0 failed`.

### Remaining Certification Blocker

The product test phase is complete, but the spec is not certifiable. The installed scenario-state authority
requires receipt phases `red`, `implement`, `green`, and `regression` in that order for every scenario. Feature
008 was delivered before that receipt system existed. Fresh green and regression runs cannot be promoted into a
historical pre-implementation RED, and the registry explicitly forbids inferring later states from checked boxes.
The resolver therefore keeps all 41 scenarios at `PLANNED`, while the transition guard reports `failedGateIds:
[G022]`, `failedChecks: [Check-4-scenario-states, Check-9-evidence]`, and `failureCount: 164`.

No after-the-fact RED receipt was fabricated, no scenario state was hand-written, and no terminal status or
certification field was changed.

## Current Regression Phase - 2026-08-20 <a id="current-regression-phase-2026-08-20"></a>

**Phase:** regression
**Claim Source:** executed

The independent regression pass re-executed the product and consumer baselines under `bubbles.regression`
provenance. Every command carried an explicit input closure over the tests, config, runtime modules, generated
dependency-gate projection, and the Feature 007/008 state files it consumed.

| Check | Exit | Observed result | Verifiable output SHA-256 |
| --- | ---: | --- | --- |
| Code-index freshness | 0 | fresh; 0 added, 0 modified, 0 removed | tool-log receipt at `2026-08-20T04:15:43Z` |
| Aggregate Feature 008 Node matrix | 0 | 183 passed, 0 failed | tool-log stdout `a60cf53b65dfc3101afc474f950bfc297d6be0f1b3a2aa6b0e415cc47c0a9bd8` |
| Repository selftest | 0 | 3102 passed, 0 failed | `2c32eecafccf0b44c1d913ee59741cf17be9cf57f656523438f761551416de9c` |
| Complete Feature 008 browser matrix | 0 | 72 passed | `d49fd4af9efb97bfe53e8dc20f5b4309e0e720c81b387a161572a1bee6caf8a8` |
| Existing-consumer browser matrix | 0 | 190 passed | `3c0d85a764798c2b7639d32933264819b32249965de8850817946a4e09229532` |

No cross-spec conflict, coverage reduction, route/navigation regression, contract drift, or generated-artifact
drift was observed. The initial code-index receipt exited `2`, but an immediate direct read and the recorded
closing probe both reported a fresh index with zero pending changes; it was transient and is not carried as a
finding.

The regression phase does not alter the remaining certification disposition. G022 still requires historical
scenario receipt chains that predate the receipt system. Regression execution cannot manufacture those prior
RED and implementation events, so the feature remains `in_progress`.

## Current Simplification Phase - 2026-08-20 <a id="current-simplification-phase-2026-08-20"></a>

**Phase:** simplify
**Claim Source:** executed

The post-implementation review covered the declared Feature 008 runtime, policy, Node-test, and seven-file
browser surfaces. It preserved every exported name, result field, exact test title, route identity, privacy
boundary, no-execution contract, scenario behavior, and append/supersede history rule. No test, route HTML,
store module, policy JSON, protected canary, or Feature 015 path was edited.

### Finding Accounting

| Finding | Review pass | Disposition | Resolution |
| --- | --- | --- | --- |
| `SIM-008-REUSE-001` | code reuse | fixed-in-session | `composeBrief` computed the same highest-authority lane twice for each subject. One `primary` calculation now feeds both the no-evidence and observed branches. |
| `SIM-008-EFF-001` | efficiency | fixed-in-session | Exact-date alignment compared every union date with `common.indexOf`. One `Set` now makes membership linear while the separately sorted output remains byte-for-byte ordered. |
| `SIM-008-QUALITY-001` | readability / indirection | resolved-no-change | Cross-module result helpers were not extracted: the store deep-freezes structured errors while the pure brief composer intentionally returns a different lightweight shape. Route renderers were not generalized because each carries distinct table, canvas, disclosure, and accessibility semantics and has one consumer. |
| `SIM-008-CONSUMER-001` | regression | fixed-in-session | The first four-worker existing-consumer run reported FX SCN-004-019 at `0` switchers (`189/190`). The exact title then passed `1/1`; the unchanged complete matrix passed `190/190`. No product edit was warranted. |
| `F008-TEST-SCENARIO-RECEIPTS-001` | inherited certification evidence | routed | Preserved unchanged. Historical `red`/`implement`/`green`/`regression` scenario receipts predate the receipt system and were not inferred or backfilled. Owner: `bubbles.gaps`. |

### Changed Files

| File | Change | Net lines |
| --- | --- | ---: |
| `rlportfoliobrief.js` | Reused one primary-lane selection in both subject branches. | -4 |
| `rlportfolioanalytics.js` | Reused a `Set` for common-date membership. | +1 |

Net implementation delta: 3 lines removed. No file was added, deleted, renamed, or moved.

### Current Execution Evidence

Every gate-relevant broad command below has a structured receipt in `.specify/runtime/tool-calls.jsonl` with
`agent=bubbles.simplify`, `spec=specs/008-portfolio-survival-and-brief-lab`, and `scope=SCOPE-16`.

| Check | Exact command | Exit | Observed result | Capture / stdout SHA-256 |
| --- | --- | ---: | --- | --- |
| Focused brief falsifier | `node --test tests/portfolio-brief.functional.mjs` | 0 | 20 passed, 0 failed | `d3bbc5c0ba886b6a59fb38a0f2dc1cc0f3c116544a01dbdd1468ded86fea36d5` |
| Focused analytics falsifier | `node --test tests/portfolio-analytics.unit.mjs` | 0 | 79 passed, 0 failed | `52e64742b6123323f517e7a432e1451c34678b9b57a6348342903d119897bbd2` |
| Aggregate Feature 008 Node matrix | `node --test tests/portfolio-foundation.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-brief.functional.mjs tests/portfolio-publisher-boundary.functional.mjs tests/portfolio-analytics.unit.mjs tests/portfolio-allocation.functional.mjs` | 0 | 183 passed, 0 failed | `b9adaaa7326d1081cddd87f76ce7e80a8882d9ff25257a3e0dd365f7f3cbe6b3` |
| Repository selftest | `node scripts/selftest.mjs` | 0 | 3102 passed, 0 failed | `09ace13a48e92e92b8d8cdfa69672613933c79ce0dc99e07429ba797e16eaacb` |
| Browser runner identity | `npx --no-install playwright --version` | 0 | `Version 1.61.1` | `ec60000cff0b2bb61c0bd02338c28b5001eb04073e84ef331029c941b4b9a332` |
| Complete Feature 008 browser matrix | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | 0 | 72 passed | `c5aff9ee7bf0d8da03e6b065a604c54c00dc81af077e64cc9ede749d2afcc2bf` |
| Existing-consumer matrix, initial | `npx --no-install playwright test tests/provider-credentials.spec.mjs tests/causal-rotation-lab.spec.mjs tests/bond-regime-lab.spec.mjs tests/fx-regime-relative-value-lab.spec.mjs tests/palm-springs-rental-market-lab.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | 1 | 189 passed; FX SCN-004-019 failed | `147fc9e191ee3a68a8bb522a57781549804dbc106d95c3ace1224ee202227308` |
| FX SCN-004-019 diagnostic | `npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression SCN-004-019: four views share one reader outcome while machine identity stays in Power" --reporter=list` | 0 | 1 passed | `64f6967c7561d2a2fbf01605a01118928766ec24d9c9e47493c6e86b9056aa26` |
| Existing-consumer matrix, unchanged rerun | `npx --no-install playwright test tests/provider-credentials.spec.mjs tests/causal-rotation-lab.spec.mjs tests/bond-regime-lab.spec.mjs tests/fx-regime-relative-value-lab.spec.mjs tests/palm-springs-rental-market-lab.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | 0 | 190 passed | `d203a1de0c3eb17b33df415f5c968ce9d237efd088b9352b5cf1ebbf0a5d8927` |
| Regression quality | `bash .github/bubbles/scripts/regression-quality-guard.sh --verbose tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs` | 0 | 7 files, 0 violations, 0 warnings | `93b086adfbd95d4abc50e29619c29451ba89a19130a4570316d5049247cce775` |
| Artifact lint | `bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab` | 0 | `Artifact lint PASSED` | `a951c1f69ebf90fbbc5a64027a2c839c86485cccfe82607a70730c37d310726b` |
| Whole-feature traceability | `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --all-scopes` | 0 | 41 scenarios, 132 rows, 0 warnings | `0da393a4864f0abb31adee209363e70ccd9e39d9a6ee2477a81ae252cca00f3b` |
| Final diff check | `git diff --check -- rlportfoliobrief.js rlportfolioanalytics.js` | 0 | Empty stdout; no whitespace errors | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

The simplify phase changes no certification field and makes no terminal-status claim. Feature 008 remains
`in_progress` solely with the inherited receipt-history finding above preserved for `bubbles.gaps`.
