# Scopes: BUG-015 — Dead Subject Parameter In Two Owner-Read Deep Links

**Workflow mode:** `bugfix-fastlane`
**Filed at commit:** `752699a60`
**State:** Filed. Nothing started. Zero Definition of Done items ticked, and none should be.

---

## Sequencing Note

Scope 1 is a decision and Scope 2 is the implementation. Scope 2 depends on Scope 1 because the
route's behaviour on a subject it cannot honour is part of what Scope 2 builds, and choosing it by
building one variant is exactly what a filing packet must not do.

Scope 1 is small. It is one product question with three plausible answers, and open question 4 in
`design.md` may make it smaller still by removing the need for a reader at all. It is not
agent-dischargeable, because nothing in the evidence selects an answer.

Scope 2 is not agent-dischargeable **in this packet** for a different reason: both affected files
are outside this packet's authorisation. Filing is the deliverable of this run and fixing is a
separate authorised run.

---

## Scope 1: Decide What A Route Does With A Subject It Cannot Honour

**Status:** Done
**Depends On:** none
**Owner:** the owner of `intraday-tape-lab` / `swing-structure-lab`. **Not agent-dischargeable.**

### Problem This Scope Resolves

`RLTKR.linkedSubject` returns one of three statuses. `accepted` is unambiguous: open on the
subject. `absent` and `refused` are not, and a fourth case sits outside the reader entirely — a
grammar-valid symbol the route's own catalog does not carry.

Today all four collapse to the same outcome: the route opens on its default and says nothing.
FR-014-003 objects to that. What replaces it is a product choice about how much a reader should be
told when the link they followed did not do what its text implied.

Open question 4 belongs here too. If these routes are not meant to open from a link at all, the
correct remedy is to stop publishing a subject-bearing `deepLink`, and Scope 2 shrinks to deleting
two expressions.

### Gherkin Scenarios

```gherkin
Feature: A reader learns when the subject they named was not honoured

  Scenario: A named subject the route can serve
    Given a published deep link naming a subject the route carries
    When a reader follows it
    Then the route opens on that subject

  Scenario: A named subject the route refuses
    Given a deep link carrying a value outside SUBJECT_PATTERN
    When a reader follows it
    Then the outcome the owner selected is visible
    And the route does not present its default as the subject that was named

  Scenario: A grammar-valid subject the route does not carry
    Given a deep link naming a symbol absent from this route's catalog
    When a reader follows it
    Then the outcome the owner selected is visible
```

### Implementation Plan

1. Answer open question 4 first: are these routes meant to be openable by link at all?
2. If yes, choose the outcome for `refused`, for `absent`, and for out-of-catalog. The three may
   share one outcome or differ.
3. Record the choice and the reason, naming what it gives up.
4. Answer or explicitly defer open questions 1, 2 and 3 from `design.md`.

### Test Plan

| Test Type | Category | Location | Description |
|---|---|---|---|
| Review | `manual` | this packet | The recorded decision names the chosen outcome per status and its cost |
| Static | `unit` | `scripts/selftest.mjs` | An assertion pins the chosen outcome so it cannot regress to silence |

### Definition of Done

- [x] Open question 4 is answered: whether these two routes are openable by a subject-bearing link.
- [x] The outcome for `refused`, `absent`, and out-of-catalog is chosen and recorded with its reason.
- [x] The recorded decision names what it gives up, not only what it achieves.
- [x] Open questions 1, 2 and 3 from `design.md` are each answered or explicitly deferred with a reason.
- [x] No source file was modified by this scope.

**Evidence** — decisions and their tradeoffs are recorded in `report.md` § *Scope 1 Execution*.
The Q3 derivation was measured before it was chosen:

```
Command: node -e '…filter(f => /deepLink:\s*"[^"]*\?/.test(f.source))…'
derived routes (4): gamma-trading-lab.html, intraday-tape-lab.html, options-structure-lab.html, swing-structure-lab.html
consumers: 4/4
Exit Code: 0
```

---

## Scope 2: Make The Published Link Live In Both Directions

**Status:** Done
**Depends On:** Scope 1

### Problem This Scope Resolves

`intraday-tape-lab.html:1855` and `swing-structure-lab.html:1693` publish a `deepLink` under a
parameter no route reads, and neither route reads any subject parameter at all. The link looks
company-scoped and is not, and it fails silently at both ends.

Correcting only the emitted spelling is insufficient. It converts one reason the link is ignored
into another and changes nothing a reader can see. The emitting half and the receiving half land
together or the defect stands.

### Gherkin Scenarios

```gherkin
Feature: A published subject-bearing deep link opens on the subject it names

  Scenario: The emitted parameter is the canonical one
    Given a route that publishes a subject-bearing deepLink
    When the published link is read out of the owner read
    Then its subject parameter is RLTKR.SUBJECT_PARAM

  Scenario: Following the published link lands on the named subject
    Given a published deepLink naming a company
    When a reader follows that exact link in a browser
    Then the route renders that company
    And the owner read it republishes names the same company

  Scenario: The convention guard covers every subject-bearing route
    Given the four routes that publish a subject-bearing deepLink
    When scripts/selftest.mjs assertion 1.20 runs
    Then all four are inside its subject set
    And every emitted name resolves to SUBJECT_PARAM
    And every one of the four delegates its query read to RLTKR.linkedSubject

  Scenario: The coupled test moves with the fix
    Given tests/technical-analysis-decision-lab.spec.mjs navigates swing-structure-lab
    When the emission is corrected
    Then that navigation uses the canonical parameter
    And the test still passes
```

### Implementation Plan

1. Replace the literal `?t=` in both `deepLink` expressions with `RLTKR.SUBJECT_PARAM`, matching
   `options-structure-lab.html:1962`.
2. Add `RLTKR.linkedSubject(window.location.search)` to both routes and wire an `accepted` subject
   into the route's initial-state selection, matching `options-structure-lab.html:2565`.
3. Implement the Scope 1 outcome for `refused`, `absent`, and out-of-catalog.
4. Update `tests/technical-analysis-decision-lab.spec.mjs:922` to navigate the canonical parameter.
5. Add both routes to `F027_SUBJECT_ROUTES` in `scripts/selftest.mjs` so assertion 1.20 covers them.
6. Prove the fix at runtime in a real browser, not by source match. The publication block sits under
   `catch (f7Err)`, so a broken emission fails silently and a source-only proof would be worthless.

### Test Plan

| Test Type | Category | Location | Description |
|---|---|---|---|
| Static | `unit` | `scripts/selftest.mjs` | Assertion 1.20 over the widened `F027_SUBJECT_ROUTES`: four emitted names, all resolving to `SUBJECT_PARAM`, all four routes delegating their query read |
| Static | `unit` | `scripts/selftest.mjs` | Zero occurrences of a hard-coded `?t=` emission remain in any root route |
| Browser | `e2e` | `tests/` | Each route loaded at `?ticker=<SYMBOL>` renders that symbol and republishes a `deepLink` naming it, read back through `RLDATA.toolRead(...)` |
| Browser | `e2e` | `tests/` | Each route loaded with a refused subject produces the Scope 1 outcome |
| Regression | `e2e` | `tests/technical-analysis-decision-lab.spec.mjs` | The reconciled navigation still passes |

### Definition of Done

- [x] Both `deepLink` expressions compose their parameter from `RLTKR.SUBJECT_PARAM` (FR-014-001).
- [x] Both routes read the subject back through `RLTKR.linkedSubject(window.location.search)` and open on an `accepted` subject (FR-014-002).
- [x] The Scope 1 outcome for a subject that cannot be honoured is implemented and asserted (FR-014-003).
- [x] `grep -rn '?t=' *.html` returns zero emission sites (FR-014-004).
- [x] `F027_SUBJECT_ROUTES` contains all four subject-bearing routes and assertion 1.20 passes over the widened set (FR-014-005).
- [x] `tests/technical-analysis-decision-lab.spec.mjs:922` navigates the canonical parameter and passes (FR-014-006).
- [x] The fix is proven in a real browser, with the republished `deepLink` read out of `RLDATA.toolRead(...)`, not by source match alone.
- [x] Every new assertion was proven able to fail, by real file mutation, before being trusted.
- [x] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count from the baseline at the fixing commit (FR-014-007).

**Evidence** — full raw output in `report.md` § *Scope 2 Execution*. Both directions in a browser,
the runtime link read out of `RLDATA.toolRead`, and both new assertions proven able to fail:

```
Command: grep -rn 'deepLink: "[^"]*?t=' *.html | wc -l
0

Command: npx playwright test --project=system-chrome tests/technical-analysis-decision-lab.spec.mjs
  38 passed (46.1s)
Exit Code: 0

Command: node scripts/selftest.mjs
Research-Lab self-test: 3406 passed, 0 failed
Exit Code: 0

red-green (derived guard):   3404 passed, 2 failed  ->  3406 passed, 0 failed   revert-verified: yes
red-green (runtime link):      37 passed, 1 failed  ->    38 passed             revert-verified: yes
```

---

## Cross-Scope Definition of Done

- [x] The audit finding `F-AUDIT-02b` is discoverable from this packet, and this packet is discoverable from a search for that finding id.
- [x] `bug.md` status reads Fixed only after Scope 2's browser proof exists.
- [x] No artifact under `specs/027-company-scoped-owner-deep-links/` was modified by any scope.
- [x] The remedy added detection power and removed none.

**Evidence** — ownership boundaries held and detection widened rather than narrowed:

```
Command: git diff --name-only origin/main -- specs/027-company-scoped-owner-deep-links/
(no output — 0 files)

Command: git diff --name-only origin/main -- <packet>/uservalidation.md
(no output — 0 files; the Human Acceptance Record is human-owned and stays unfilled)

F-AUDIT-02b appears in this packet's bug.md Provenance line.
Assertions: two added (derived-route guard widened 2 -> 4 routes; runtime deepLink), none removed.
Exit Code: 0
```
