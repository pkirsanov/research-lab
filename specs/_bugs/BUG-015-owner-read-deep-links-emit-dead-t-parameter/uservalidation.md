# User Validation: BUG-015 — Owner-Read Deep Links Emit A Dead `t` Parameter

This file was authored when the packet was a filing only, and its title and opening paragraph said
so. That is now stale: both scopes record **Status: Done** and all 18 Definition-of-Done items in
`scopes.md` are checked, with zero unchecked. The header has been corrected rather than left to
contradict the packet's own record.

The Automation Readiness items below record facts about the **filing** — that the defect was real,
grounded, and correctly attributed. They are ticked where an executed check established them, and
this turn ticked no further one.

**Ticking an Automation Readiness item grants no acceptance whatsoever.** Acceptance is the
Checklist section plus the acceptance record. The Checklist is now checked on the repository
operator's explicit authorization dated 2026-08-27, transcribed by automation — not on automation's
own judgement. Acceptance is not certification: `status` and `certification.status` remain
`in_progress`, and gates other than G136 are still failing.

## Automation Readiness

- [x] The routing was a dead letter. **`grep -rln 'F-AUDIT-02b' specs/` returns exactly two paths, both inside `specs/027-company-scoped-owner-deep-links/`. No bug packet and no receiving spec existed before this one.**
- [x] The parameter is emitted at both named sites. **`grep -rn 'deepLink' intraday-tape-lab.html swing-structure-lab.html` returns the two lines at 1855 and 1693, each composing a literal `?t=`.**
- [x] Nothing reads the parameter. **`grep -rn "get(\"t\")\|get('t')" *.html rlticker.js` exits non-zero with zero matching lines across every root route and the shared subject module.**
- [x] These are the only literal `?t=` emissions left in the tree. **`grep -rn '?t=' *.html` returns the same two lines and no others.**
- [x] The canonical spelling is `ticker`, declared once. **`rlticker.js:53` declares `SUBJECT_PARAM = "ticker"`, `rlticker.js:55` declares the grammar, and `rlticker.js:152` is the single export.**
- [x] The remedy for the emitting half has a working precedent. **`options-structure-lab.html:1962` and `gamma-trading-lab.html:1512` both compose from `RLTKR.SUBJECT_PARAM`; Feature 027 corrected them.**
- [x] The precedent covers only half the remedy here. **`grep -c 'RLTKR'` returns 0 for both affected files, while both load the module at `intraday-tape-lab.html:2226` and `swing-structure-lab.html:2056`. Both precedent routes call `RLTKR.linkedSubject` at 2565 and 1842 respectively; neither affected route appears among the five `linkedSubject` call sites.**
- [x] The defect fails silently at both ends. **`rldata.js:507` rejects only a missing or non-string `deepLink`, and both emission sites sit inside `catch (f7Err) { /* publication is additive */ }`.**
- [x] A live test navigates the dead spelling. **`tests/technical-analysis-decision-lab.spec.mjs:922` goes to `swing-structure-lab.html?t=SPY`; its surrounding code seeds `SPY` into `RLDATA` directly, which is why it passes while the parameter is inert.**
- [x] The existing convention guard is blind to these routes by construction. **`scripts/selftest.mjs` assertion 1.20 pins the property in both directions over `F027_SUBJECT_ROUTES`, a frozen two-element allowlist holding only the precedent routes.**
- [x] The enabling commit is identified and introduced all three lines together. **`git show a4b10dc5b` adds both `deepLink` expressions and the `?t=SPY` navigation; `a4b10dc5b` is the most recent commit touching either affected file.**
- [x] No source file was modified and no selftest assertion was added. **The only additions are this packet's seven artifacts under `specs/_bugs/BUG-015-owner-read-deep-links-emit-dead-t-parameter/`.**
- [x] The user-visible consequence was observed in a browser. **Observed against the repository's own `startStaticServer()` harness, reading `#ticker` on each real route. Control: `options-structure-lab.html?ticker=NVDA` yields `NVDA` and no query yields `SPY`, so a working corridor is detectable by this reading. `intraday-tape-lab.html?t=NVDA` and `swing-structure-lab.html?t=NVDA` both yield `SPY` — a link naming `NVDA` opens `SPY`. `intraday-tape-lab.html?ticker=NVDA` also yields `SPY`, so the emitting-half rename alone would change no observed value; the two-halves finding is measured, not derived. Full block in `report.md` § The consequence, observed in a browser. This observes the DEFECT only — Scope 2's Definition of Done still requires the post-fix reading to return `NVDA`.**
- [ ] The outcome for a subject that cannot be honoured is chosen. **Left unticked deliberately. `refused`, `absent` and out-of-catalog currently collapse to silence. What replaces that is a product choice, enumerated as open question 1 in `design.md` and owned by Scope 1.**
- [ ] Whether these routes should be openable by link at all is answered. **Left unticked deliberately. Open question 4 in `design.md`. If the answer is no, the correct remedy is to stop publishing a subject-bearing link, and Scope 2 shrinks to deleting two expressions.**

*Note (2026-08-28): the two items above were written while Scope 1 was open, and both scopes have
since closed. They are still left unticked. A readiness box records a fact this agent observed
first-hand, and this turn did not re-derive either answer from `design.md` — it recorded the
operator's acceptance and nothing more. Leaving them unticked understates the packet; ticking them
would overstate what was checked, and only the second failure mode is a fabrication.*

## Checklist

- [x] The defect as filed is the real defect: a published link names a company, and following it opens something else without saying so.
- [x] Filing it is the right response to a routed finding nobody received. The routing out of Feature 027 was correct and it went nowhere, which is why this packet exists.
- [x] The two-halves finding is understood as the substantive addition. Copying the precedent's one-line swap would look like a fix and would change nothing a reader can see, because these routes read no subject parameter at all.
- [x] The silence is understood as the reason this is worth filing rather than noting. A link that broke loudly would have been found the day it shipped.
- [x] The half-migrated state is understood as a second, independent reason to close this. Two conventions are live and neither is marked provisional, so the next route to publish a subject link has an even chance of copying the dead one.
- [x] Widening `F027_SUBJECT_ROUTES` is understood as part of the remedy, not an optional extra. Landing the code fix without it leaves the same blind spot for the next route.
- [x] The coupled test at `tests/technical-analysis-decision-lab.spec.mjs:922` is understood as part of the fix surface, not collateral damage.
- [x] Deciding the unhonourable-subject outcome is **your** decision, not the filing agent's. That the packet enumerates the cases and selects none is the intended outcome, not an incomplete one.
- [x] Open question 4 in `design.md` deserves an answer first, because a "no" makes the whole receiving half unnecessary and shrinks the remedy substantially.
- [x] Not adding a selftest assertion in this packet is understood as correct. An assertion that fails on a known-open defect turns the suite red for work nobody is yet authorised to do.

Each box above was checked on the operator's instruction dated 2026-08-27 and transcribed by
automation. Several of these items are decision requests addressed to the operator; checking them
records that the operator accepted the framing, not that automation judged it correct.

## Human Acceptance Record

The repository operator granted acceptance as a batch directive during the working session of
2026-08-27/28. The operator did not separately exercise the delivered behaviour in a live session;
they authorized on the basis of the verification reported to them. That is exactly why the method
below is `external-record` rather than `human-interactive` — the accepting act happened in the
session, outside this file, and the operator's dated directive **is** the record. No UAT ticket,
sign-off ID, or other external artifact exists, and none is claimed.

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-27
- method: external-record
- record: Operator directive in the 2026-08-27/28 working session, quoted verbatim — "authorized, approved, update all user validations as approved" and "Don't stop for user review, commit, continue, user approves all". Transcribed by automation 2026-08-28; the directive itself is the acceptance artifact and no external ticket exists.
