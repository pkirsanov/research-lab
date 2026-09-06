# Spec: BUG-015 — A Published Deep Link That Names A Subject Opens On That Subject

**Status:** Filed, not started
**Workflow mode:** `bugfix-fastlane`
**Filed at commit:** `752699a60`

---

## Purpose

State what correct behaviour is for a subject-bearing `deepLink`, so the remedy can be judged
against a written contract rather than against a resemblance to the two routes that were already
corrected.

The remedy shape is known and recorded in `design.md`. This spec defines the end state it has to
reach, including the receiving half that the precedent did not have to build.

---

## Behaviour Under Specification

Two routes publish a Feature 007 owner read through `RLDATA.publishToolRead`. Each read carries a
`deepLink` string that names the company the read is about:

```
intraday-tape-lab.html:1855   deepLink: "intraday-tape-lab.html?t="   + encodeURIComponent(state.ticker)
swing-structure-lab.html:1693 deepLink: "swing-structure-lab.html?t=" + encodeURIComponent(state.ticker)
```

The shared subject rule lives in `rlticker.js`: `SUBJECT_PARAM` is `"ticker"` (line 53),
`SUBJECT_PATTERN` is `/^[A-Z0-9.\-]{1,12}$/` (line 55), and `linkedSubject(search, paramName)`
(line 56) is the single reader every subject-carrying route delegates to.

---

## Requirements

### FR-014-001 — A published deep link names its subject under the canonical parameter

Every `deepLink` a route publishes about itself MUST compose its subject parameter from
`RLTKR.SUBJECT_PARAM` rather than from a hard-coded spelling.

Measured at filing: two of four subject-bearing routes emit a literal `?t=`. **Not satisfied.**

### FR-014-002 — The receiving route honours the parameter it publishes

A route that publishes a subject-bearing `deepLink` MUST read the subject back through
`RLTKR.linkedSubject(window.location.search)` and open on it.

This is the half the precedent did not need. `options-structure-lab.html` and
`gamma-trading-lab.html` already had a reader when their emission was corrected;
`intraday-tape-lab.html` and `swing-structure-lab.html` reference `RLTKR` zero times.

Satisfying FR-014-001 alone leaves the link ignored, for a different reason. **Not satisfied.**

### FR-014-003 — A subject that cannot be honoured is visible, not silent

When the receiving route is given a subject it refuses under `SUBJECT_PATTERN`, or one that is
outside its own catalog, the outcome MUST be observable to the reader rather than an unannounced
fall back to the default subject.

The current failure mode is silence at both ends: `rldata.js:507` validates only that `deepLink`
is a non-empty string, and both emission sites sit inside
`catch (f7Err) { /* publication is additive */ }`. Neither is wrong on its own, and together they
make a dead link indistinguishable from a live one.

**Not satisfied.** What "observable" means concretely is an open question for the owner; see
`design.md`.

### FR-014-004 — One subject convention is discoverable from the code

A maintainer reading the tree MUST be able to determine the canonical subject parameter without
choosing between two live conventions.

Two routes use `RLTKR.SUBJECT_PARAM` and two emit a literal `?t=`. Both look deliberate. **Not
satisfied.**

### FR-014-005 — The convention guard covers every subject-bearing route

`scripts/selftest.mjs` assertion 1.20 pins the single-convention property in both directions over
the route set `F027_SUBJECT_ROUTES`, currently frozen at two entries. That set MUST include every
route that publishes a subject-bearing `deepLink`.

The guard is correct and blind here, because these two routes are outside its subject set. **Not
satisfied.**

### FR-014-006 — The coupled test moves with the fix

`tests/technical-analysis-decision-lab.spec.mjs:922` navigates
`swing-structure-lab.html?t=SPY`. It passes today because the parameter is inert. It MUST be
reconciled in the same change that corrects the emission, and MUST NOT be left pinning the dead
spelling.

### FR-014-007 — The remedy adds detection power and removes none

The fix MUST NOT weaken, skip, or delete any existing assertion, and MUST NOT reduce the assertion
count of `scripts/selftest.mjs` from its baseline at the fixing commit.

---

### Single-Capability Justification

This packet extends the coverage of **one existing capability** rather than creating a foundation,
which is why it carries no Domain Capability Model.

The capability is the subject-parameter contract already shipped in `rlticker.js`:
`RLTKR.SUBJECT_PARAM` as the single canonical spelling, `RLTKR.linkedSubject()` as the single reader,
`SUBJECT_PATTERN` as the normalisation rule. Feature 027 established it and applied it to two files.
This packet applies the same settled shape to two more routes and widens the guard that enforces it.

**The evidence that this is extension and not creation is the precedent count:** the emitting shape
has 2 prior applications in the tree and the receiving shape has 5. Seven existing call sites is not
a foundation being invented; it is a convention being finished. A packet that had genuinely created
a parallel capability would show zero.

`design.md` records the real obstacle plainly: both affected files were read-only to the feature that
found the defect, so what blocked the fix was authorisation, not difficulty or missing design.

## Acceptance Criteria

- **AC-1.** `grep -rn '?t=' *.html` returns zero emission sites.
- **AC-2.** Both routes compose their `deepLink` from `RLTKR.SUBJECT_PARAM`.
- **AC-3.** Both routes call `RLTKR.linkedSubject(window.location.search)` and open on the returned
  subject when its status is `accepted`.
- **AC-4.** A browser run of each route at `?ticker=<SYMBOL>` shows the named subject rendered, and
  the published `deepLink` read back out of `RLDATA.toolRead(...)` names the same symbol. A source
  match alone does not satisfy this, because a broken publication block fails silently.
- **AC-5.** A refused or unhonourable subject produces the observable outcome the owner selects
  under FR-014-003, and that outcome is asserted.
- **AC-6.** `F027_SUBJECT_ROUTES` contains all four subject-bearing routes and assertion 1.20
  passes over the widened set.
- **AC-7.** `tests/technical-analysis-decision-lab.spec.mjs:922` navigates the canonical parameter
  and still passes.
- **AC-8.** `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count from
  the baseline at the fixing commit.

---

## Explicitly Out Of Scope

- **Any source change in this packet.** `intraday-tape-lab.html`, `swing-structure-lab.html`,
  `rlticker.js`, `rldata.js`, `scripts/selftest.mjs` and
  `tests/technical-analysis-decision-lab.spec.mjs` stay untouched. Filing is the deliverable.
- **Adding a selftest assertion in this packet.** An assertion that fails on a known-open defect
  turns the suite red. It belongs in the fixing change, where it goes red to green in one step.
- **Anything under `specs/027-company-scoped-owner-deep-links/`.** That feature routed the finding
  correctly and is at its agent-closeable ceiling.
- **The other subject-bearing routes.** `options-structure-lab.html` and `gamma-trading-lab.html`
  were corrected by the precedent and are cited here only as the reference shape.
- **Whether `ticker` is the right parameter name in principle.** This spec takes the declared
  convention as given and asks whether these two routes respect it.

---

## Grounding

Every line number, file path and quoted expression in this spec was re-derived by execution at
`752699a60` during the filing session. See `report.md` for the command and verbatim output behind
each one.
