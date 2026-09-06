# User Validation: BUG-016 — Filed As A Decision Request, Since Resolved By Feature 022

This packet was filed as a defect description plus a decision request. It implemented nothing,
because the remedy turned on a branch-reconciliation decision that was not the filing agent's to
make.

**That decision has since been made by what shipped.** Feature 022 landed the combined settlement
panel on the deployed branch, which is the outcome Scope 2 asked for. The header below and the three
"left unticked deliberately" items were written while the question was genuinely open; they are
updated rather than deleted, so the record still shows what was open and when.

Verified 2026-08-29 rather than assumed:

```
$ grep -c 'id="combinedCurveChart"' lifetime-tax-strategy-lab.html
1
$ npx --no-install playwright test tests/lifetime-tax-combined.spec.mjs --config=playwright.config.mjs --reporter=line
  16 passed (18.4s)
PW_EXIT=0
```

All three selectors the six failing assertions waited for — `combinedCurveChart`,
`combinedSettlementCard` and `combinedRefusal` — are present on the page, and the spec that was red
is green.

The Automation Readiness items below record facts about the **filing** — that the defect was real,
grounded, and correctly attributed.

## Automation Readiness

- [x] The deploy gate is red across an unbroken run. **Eleven consecutive completed runs of `pages.yml` on `main` report `failure`, from `32616864615` at 2026-08-23T04:02:35Z to `32651572136` at 2026-08-23T16:24:36Z.**
- [x] The failure is the blocking browser step and it skips deployment. **In run `32651572136`, job `verify` fails only at step `Full browser suite (blocking)`; the self-test step passes; job `deploy` reports `skipped`; `.github/workflows/pages.yml:69` declares `needs: verify`.**
- [x] The run's own counts were read, not inferred. **The step printed `Running 708 tests using 2 workers`, then `31 failed`, then `677 passed (12.5m)`, then exit code 1.**
- [x] The failures are real, not a worker-teardown artefact. **`31 + 677 = 708` exactly matches the run's own test count, so no test is unaccounted for, and the summary carries no flaky, interrupted, or did-not-run line. Established by reconciliation, not by matching a `force-killed` string.**
- [x] The thirty-one failures split five ways. **Derived from the canonical list between the `31 failed` header and the `677 passed` footer: 16 portfolio survival brief, 6 lifetime tax combined, 5 portfolio survival foundation, 3 volatility sizing lab, 1 portfolio survival mobile, totalling 31 list lines. Cross-checked against the directory names in the downloaded report artifact, which reproduce the same split.**
- [x] Ownership was verified, not assumed. **Last commit to touch each spec file: `8135cb540` for the combined tax spec, `9ee3c39ae` for all three portfolio survival specs, `420246341` for the volatility sizing spec. Six failures are this packet's; twenty-five are not.**
- [x] No file owned by the concurrent session was read, edited or staged. **The twenty-five failures were attributed from git metadata about their spec files only.**
- [x] The failing selectors were read from the run's own artifact. **Three distinct selectors across the six tests: `#combinedCurveChart` in three, `#combinedSettlementCard [data-rl-unavailable]` in two, `[data-rl-value="combinedFederalLeg"]` in one. Five report `expect(locator).toHaveAttribute(expected) failed` with `element(s) not found` at 5000ms; one reports `locator.textContent: Test timeout of 30000ms exceeded`.**
- [x] The page genuinely lacks the panel, observed rather than inferred. **The accessibility snapshot embedded in all six `error-context.md` files shows only the region titled "One declared year settled against one resolved federal rule pack" and no combined region.**
- [x] The wiring markers are absent on the deployed branch. **`combinedFederalLeg` 2 against 0, `rltaxcombined.js` 1 against 0, `combinedCurveChart` 3 against 0, `combinedSettlementCard` 2 against 0, local tip against `origin/main`.**
- [x] The absence is a standing property of the branch, not a transient. **All four markers count zero at every one of the eleven commits in the failing run, and the spec file is present as a blob at every one of them.**
- [x] The computation module already shipped. **`rltaxcombined.js` is blob `a24991f8c…` at both tips — byte-identical. Only the markup and script tag are missing, which narrows the remedy.**
- [x] The deployed spec revision is older than the local one. **The deployed branch still runs the title retired by `8135cb540`, verified as a commit object with `git cat-file -t`, and the corresponding failure directory in the run artifact carries that older name.**
- [x] The root cause is a recurring merge-resolution loss, established by execution. **`c58719fb4` introduced the wiring, its parent carrying zero markers and itself carrying two. It is an ancestor of `origin/main` while its content is not. Merges `612382ddf`, `a30410572`, `e8235b996` and `1e765338d` each had one parent carrying the wiring and one without, and each resolved to without. The merge base of the two tips, `4b087cf15`, still carries zero.**
- [x] The two tips hold different resolutions of the same file. **Page blob `8ffe66348…` locally against `4c64c6a2c…` remotely, while the module blob is identical at both.**
- [x] No source file was modified and no branch was moved. **The only additions are this packet's seven artifacts. Nothing was pushed, merged, rebased, or otherwise moved.**
- [x] The suite is unchanged by this filing. **`node scripts/selftest.mjs` exits 0 with 3384 passed, 0 failed.**
- [x] The reconciliation approach is chosen. **Answered by what shipped rather than by argument.** Options A, B and C were enumerated in `design.md` and none was selected by the filing evidence, because the branch decision was not the filing agent's to make. Feature 022 subsequently landed the panel on the deployed branch, which selects the outcome those options were competing to reach.
- [x] Whether a coherence check should exist is answered. **Yes, and it exists.** `tests/lifetime-tax-combined.spec.mjs` asserts the three selectors on the deployed page, so a future merge that drops the wiring again turns the spec red instead of silently un-shipping the panel. That is the recurrence protection Scope 3 asked for: four merges had each discarded the wiring before this was filed.
- [x] Whether the gate should report its ownership split is answered. **Not adopted, and the reason is recorded rather than left implicit.** It would change how every red run is read, not only this one, so it is a shared decision with a blast radius wider than this packet. The ownership split for THIS run is recorded in `report.md` instead, which is what the packet needed; generalising it into the gate remains available and unclaimed.

## Checklist

- [x] The defect as filed is the real defect: the deployed branch runs six assertions against a panel it does not carry, so the gate is red and nothing publishes.
- [x] Filing it rather than fixing it is the right response, given that the remedy turns on a branch decision that is yours and not the filing agent's.
- [x] The three-selector finding is understood as the substantive correction. A fix validated against the thirty-second timeout alone clears one test of six.
- [x] The recurring-merge finding is understood as changing the remedy. The wiring was written and committed; four merges each discarded it. A restoration that does not address recurrence restores a value the next merge may drop.
- [x] The narrowing is understood: the computation module is already deployed and byte-identical, so only markup and a script tag are missing.
- [x] The ownership split is understood and accepted. Six failures are this packet's; twenty-five are not, and twenty-one of those twenty-two portfolio failures share one error string and are likely one defect rather than twenty-two.
- [x] The separation from `BUG-017` is understood and accepted. The macOS browser-teardown defect does not reproduce in the pipeline and is not a cause of this redness.
- [x] The report-artifact over-count is understood as an observation rather than a filed defect, and you agree it belongs where it is recorded.
- [x] Not adding a selftest assertion in this packet is understood as correct. An assertion that fails on a known-open defect turns a green suite red for work nobody is yet authorised to do.
- [x] Answering open questions 1 and 4 in `design.md` first is agreed, because the answer determines whether Scope 2 is a reconciliation or a fresh commit.

## Human Acceptance Record

The repository operator granted acceptance as a batch directive during the working session of
2026-08-29. The operator did not separately exercise the panel in a live browser session; they
authorized on the basis of the verification reported to them. That is why the method below is
`external-record` rather than `human-interactive` — the accepting act happened in the session,
outside this file, and the operator's directive **is** the record. No UAT ticket, sign-off ID, or
other external artifact exists, and none is claimed.

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-29
- method: external-record
- record: Operator directive in the 2026-08-29 working session, quoted verbatim — "authorized, approved, update all user validations as approved", alongside "unblock all blocks, implement/fix/plan whatever needed to unblock, do it, continue" and "Don't stop for user review, commit, continue, user approves all".

**What changed since this section said acceptance could not occur.** It previously read *"Acceptance
has not occurred and cannot occur yet. This packet delivers no behaviour to exercise."* That was
true when written: the packet was a filing plus a decision request, and the decision was the
operator's. Feature 022 has since landed the panel, so there IS now behaviour to exercise, and the
six assertions that were red are green — 16 passed, exit 0, re-run this session.

The distinction is worth keeping rather than smoothing over. This packet did not fix the defect; it
described one accurately enough that a later feature could. Recording it as `done` says the defect
is resolved and the packet's own obligations are discharged — not that this packet performed the
remedy.
