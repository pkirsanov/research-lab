# User Validation: BUG-010 — A Safety Disclosure Must Be Deterministic And Gated

The fix has since shipped. The Automation Readiness items below are therefore ticked where the
stated behaviour has actually been observed by an executed command, and left unticked where it has
not. The Checklist and the acceptance record remain entirely unticked and untouched by any agent.

An item is checked when the stated behaviour has actually been observed. Automation checks only the
Automation Readiness section, and doing so grants no acceptance. Acceptance is the Checklist section
plus the acceptance record, and only a human establishes it.

## Automation Readiness

Items 1-7 were observed in a prior session and are attributed to that run; the Scope 1 and Scope 2
DoD entries in `scopes.md` carry their raw output. Item 9 was re-derived at `HEAD` `f65e5fa31`.

- [x] `scripts/validate-brief-payload.mjs` refuses the committed payload for the missing adapter id
      and the missing no-recommendation disclosure, with the refusal naming each fact separately.
      — T-10-U1, `scopes.md` Scope 1
- [x] The gate refuses a payload whose company reason is otherwise valid but has only the adapter id
      removed, and one that has only the disclosure removed. — T-10-U2 and T-10-U3, `scopes.md` Scope 1
- [x] The gate refuses a payload whose company coverage entry is absent, rather than reporting the
      check satisfied or skipped. — T-10-U4, `scopes.md` Scope 1
- [x] The gate accepts the last published reason from the prior window without modification.
      — T-10-U5, `scopes.md` Scope 1
- [x] The deterministic owner-read producer emits both facts with the Tier-B narrative lane disabled.
      — T-10-U7, `scopes.md` Scope 2
- [x] The emitted adapter id follows a fixture configuration that declares a different id.
      — T-10-U8, `scopes.md` Scope 2
- [x] A narrative result that drops both facts still yields a published entry carrying them.
      — T-10-U9, `scopes.md` Scope 2
- [ ] `node scripts/selftest.mjs` exits 0 with no assertion removed, weakened, or skipped.
      **Not observed.** The suite is red on 15 Feature 026 cockpit first-load byte-budget failures,
      filed as BUG-013. Unrelated to this packet, and not claimed on its behalf.
- [x] The two conjuncts at `scripts/selftest.mjs` line 6319 are proven unmodified by diff.
      — T-10-R3; `git diff --stat 7314777ef^ ee424df41 -- scripts/selftest.mjs` is empty, exit 0

## Checklist

- [ ] Opening the market brief shows the company fundamentals tool's coverage entry stating which
      adapter produced the read and that no recommendation is produced, in every window rather than
      in some windows.
- [ ] Re-running the brief refresh several times produces that statement every time, and the wording
      no longer depends on what the narrative model happened to write.
- [ ] A window that somehow loses the statement is refused at publish and never reaches the site,
      instead of appearing on the site and being discovered later by a failing selftest.
- [ ] The company fundamentals reads themselves are unchanged — the same hash-verified MSFT
      publication, the same statement and model cutoffs, the same partial-coverage caveat.
- [ ] No other tool's coverage entry reads differently after this change.
- [ ] The check that caught this bug is still present and still able to fail; the build is green
      because the disclosure is there, not because the assertion was relaxed for a third time.

## Human Acceptance Record

Acceptance has not occurred. The fix has shipped and the automation-readiness evidence above is
recorded, but no human has exercised the delivered behaviour, so there is no acceptor, no acceptance
date, and no acceptance method to record. This section is completed by a human.
