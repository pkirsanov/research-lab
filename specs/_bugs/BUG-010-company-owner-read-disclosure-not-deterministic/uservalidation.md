# User Validation: BUG-010 — A Safety Disclosure Must Be Deterministic And Gated

This packet delivers artifacts only. Nothing below has been implemented, so every item ships
**unchecked** — including the automation-readiness items, because no behaviour exists yet for
automation to verify.

An item is checked when the stated behaviour has actually been observed. Automation checks only the
Automation Readiness section, and doing so grants no acceptance. Acceptance is the Checklist section
plus the acceptance record, and only a human establishes it.

## Automation Readiness

- [ ] `scripts/validate-brief-payload.mjs` refuses the committed payload for the missing adapter id
      and the missing no-recommendation disclosure, with the refusal naming each fact separately.
- [ ] The gate refuses a payload whose company reason is otherwise valid but has only the adapter id
      removed, and one that has only the disclosure removed.
- [ ] The gate refuses a payload whose company coverage entry is absent, rather than reporting the
      check satisfied or skipped.
- [ ] The gate accepts the last published reason from the prior window without modification.
- [ ] The deterministic owner-read producer emits both facts with the Tier-B narrative lane disabled.
- [ ] The emitted adapter id follows a fixture configuration that declares a different id.
- [ ] A narrative result that drops both facts still yields a published entry carrying them.
- [ ] `node scripts/selftest.mjs` exits 0 with no assertion removed, weakened, or skipped.
- [ ] The two conjuncts at `scripts/selftest.mjs` line 6319 are proven unmodified by diff.

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

Acceptance has not occurred. No behaviour has been delivered for a human to exercise, so there is no
acceptor, no acceptance date, and no acceptance method to record. This section is completed by a
human when the fix has shipped and been exercised.
