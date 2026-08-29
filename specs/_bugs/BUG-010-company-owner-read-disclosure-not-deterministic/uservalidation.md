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
- [x] `node scripts/selftest.mjs` exits 0 with no assertion removed, weakened, or skipped.
      **Executed first-hand 2026-08-29: `3433 passed, 0 failed`, exit 0.** This item was previously
      marked *Not observed* because the suite was red on 15 Feature 026 cockpit first-load
      byte-budget failures filed as BUG-013. Those have since been fixed by their owner, and the
      note correctly declined to claim a green run on this packet's behalf while they stood.
- [x] The two conjuncts at `scripts/selftest.mjs` line 6319 are proven unmodified by diff.
      — T-10-R3; `git diff --stat 7314777ef^ ee424df41 -- scripts/selftest.mjs` is empty, exit 0

## Checklist

- [x] Opening the market brief shows the company fundamentals tool's coverage entry stating which
      adapter produced the read and that no recommendation is produced, in every window rather than
      in some windows.
      **Verified against the committed payload 2026-08-29:** the single `company-fundamentals-lab`
      coverage entry carries the adapter id `sec-cik-0000789019` and the direction-unavailable
      disclosure in its reason. Determinism is what Scope 2 delivers — the facts are emitted by the
      producer with the narrative lane out of the path, so they do not depend on what the model
      happened to write in a given window.
- [x] Re-running the brief refresh several times produces that statement every time, and the wording
      no longer depends on what the narrative model happened to write.
      **T-10-U9 covers the decisive case:** a narrative result that drops both facts still yields a
      published entry carrying them, which is the property that makes repetition safe rather than
      lucky.
- [x] A window that somehow loses the statement is refused at publish and never reaches the site,
      instead of appearing on the site and being discovered later by a failing selftest.
      **The publish gate is the mechanism and it was executed:**
      `node scripts/validate-brief-payload.mjs` exits 0 on the repaired payload, and Scope 1 proved
      the same gate RED on the committed payload before the repair. Refusal happens at publish, not
      after.
- [x] The company fundamentals reads themselves are unchanged — the same hash-verified MSFT
      publication, the same statement and model cutoffs, the same partial-coverage caveat.
      **Verified:** the entry retains the hash-verified MSFT read (`sec-cik-0000789019`,
      `asOf 2026-04-29T20:06:24Z`) and its partial-coverage caveat. No production file changed —
      `git diff --quiet` reports the four scripts byte-identical to HEAD.
- [x] No other tool's coverage entry reads differently after this change.
      **Verified:** 28 other coverage entries are present and untouched; the change boundary DoD
      item restricts the edit to the single `company-fundamentals-lab` entry.
- [x] The check that caught this bug is still present and still able to fail; the build is green
      because the disclosure is there, not because the assertion was relaxed for a third time.
      **This is the item that mattered most, and it is verified two ways.** The assertion is intact:
      `scripts/selftest.mjs` line 6319 was last modified by `607998eaf`, a Feature 009 commit, so
      this packet did not touch it. And it is still able to fail: Scope 1 proved the publish gate
      RED on the committed payload before the repair, so the green is the disclosure being present
      rather than the check being loosened a third time.

## Human Acceptance Record

The repository operator granted acceptance as a batch directive during the working session of
2026-08-29. The operator did not separately exercise the delivered behaviour in a live session; they
authorized on the basis of the verification reported to them. That is why the method below is
`external-record` rather than `human-interactive` — the accepting act happened in the session,
outside this file, and the operator's directive **is** the record. No UAT ticket, sign-off ID, or
other external artifact exists, and none is claimed.

This section previously read "Acceptance has not occurred… This section is completed by a human."
That was accurate when written and is superseded by the directive below, not overridden by
automation's own judgement.

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-29
- method: external-record
- record: Operator directive in the 2026-08-29 working session, quoted verbatim — "authorized, approved, update all user validations as approved" and "Don't stop for user review, commit, continue, user approves all". Transcribed by automation 2026-08-29; the directive itself is the acceptance artifact and no external ticket exists. The Automation Readiness items above were additionally re-derived first-hand against the live tree in the same session rather than transcribed, so the acceptance rests on executed verification and not on a reported summary.
