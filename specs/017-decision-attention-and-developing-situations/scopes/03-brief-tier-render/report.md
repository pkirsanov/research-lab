# Scope 3 Execution Report — Brief Tier Render

## Summary

`market-brief.html` gained a `#decisionAttention` section above the existing
`#attention` feed and an `#attentionRecord` block below `#scorecard`, both
rendering from committed data with no provider key, no proxy and no added
network request. Five browser scenarios were authored first and recorded failing
on the missing section, then recorded passing. The degraded scenario was proven
to bite by mutating the page so live items are also stamped expired.

Two mid-scope events are narrated below before the green evidence rather than
after it, because each one changes how the green evidence should be read.

The first is a live collision with the 4×/day publication cron, which re-emitted
the pre-migration item shape while this scope was in flight. That is the failure
mode finding F-017-02 predicted, now demonstrated rather than argued.

The second is that TP-03-05 was broken in both directions when this scope
started. No implementation could have satisfied it, and it would also have passed
against an implementation that rendered no expiry label at all. Both faults were
in fixture strings, not in assertions; the assertions are byte-identical to what
planning authored.

## Mid-Scope Event 1 — A Live Collision With The Publication Cron

Mid-scope, a `git pull --rebase` autostash popped and conflicted. The 4×/day cron
had published a fresh pre-close brief while the in-flight attention migration was
built on the older morning payload:

**Claim Source:** executed

```text
$ git log -1 --format='%h %ad %s' --date=iso 4fd3bef9
4fd3bef9 2026-08-06 11:56:43 -0700 market-brief: auto-refresh + narrative 2026-08-06 14:56 EDT (pre-close)
```

`market-brief.payload.json` was left unparseable with conflict markers. The
resolution took the cron's fresh market data as authoritative — it is real,
current market state and this scope has no standing to overwrite it — and
re-applied the attention migration on top of it.

**Why this matters more than a merge anecdote.** Finding F-017-02 argued that the
authoring instruction in `scripts/brief-narrative-parallel.mjs` had to be
extended in the same change set as the payload migration, because otherwise the
cron would keep emitting the pre-migration 9-key item shape and silently undo the
migration on its next run. That was an argument about a hazard. This collision is
the hazard occurring: the cron re-emitted the pre-migration shape within hours, on
its own schedule, with no human involved.

The authoring-instruction half of Scope 2's atomic change is therefore
load-bearing rather than defensive over-engineering, and the evidence for that is
now a real event in this repository's history rather than a prediction. Anyone
later tempted to split that change set apart should read this section first.

F-017-02 is referenced here by the identifier the session used. No finding ledger
exists in this feature directory yet; `## Open Findings` in the feature-level
`report.md` is created by this scope and currently holds only F-017-04.

## Mid-Scope Event 2 — TP-03-05 Could Not Be Satisfied Or Falsified

The fifth scenario, `elapsed decision attention items render expired and a stale
generation is declared`, was unsatisfiable and unfalsifiable at the same time.
Both faults came from its two fixture headlines.

**The negative assertion was unsatisfiable.** The live fixture's headline read
`"Live fixture item that must not be marked expired"`. The assertion requires that
same element not to match `/expired/i`. The headline contains the word `expired`,
so the element could never satisfy the assertion — not because the implementation
was wrong, but because the fixture's own words matched the pattern the assertion
forbids. No possible implementation of the expiry label would have turned this
green.

**The positive assertion was tautological.** The elapsed fixture's headline read
`"Elapsed fixture item that must still be shown as expired"`. The assertion
`toContainText(/expired/i)` therefore matched the fixture's own text, and would
have passed against an implementation that rendered no expiry label whatsoever.
The scenario claimed to prove that elapsed items are labelled expired while
proving only that the test could read back its own input.

Taken together the scenario was worse than absent. It blocked the correct
implementation and would have blessed the incorrect one.

**The repair.** Both fixture headlines were renamed so that neither carries the
word `expired`. Both assertions were preserved byte-identical — the test still
asserts exactly what planning wrote it to assert, and nothing was weakened to
obtain green. E5 below is the post-repair assertion text, and the adversarial run
is the proof that the repaired scenario now genuinely bites.

## Test Evidence

### RED — Scenario-First, All Five Failing

Recorded before `market-brief.html` carried the tier. Each scenario fails on the
missing section, not on an early return.

**Claim Source:** executed

```text
5 failed
  tests/attention-browser.spec.mjs:117 › decision attention tier renders items and record from committed data
  tests/attention-browser.spec.mjs:174 › decision attention items carry no alert severity label or alert styling
  tests/attention-browser.spec.mjs:235 › every decision attention field and control exposes a contextual tooltip
  tests/attention-browser.spec.mjs:278 › authored decision attention text with markup renders escaped
  tests/attention-browser.spec.mjs:328 › elapsed decision attention items render expired and a stale generation is declared
RED_EXIT=1
```

### GREEN — All Five Passing

**Claim Source:** executed

```text
  ✓  1 decision attention tier renders items and record from committed data (3.8s)
  ✓  2 decision attention items carry no alert severity label or alert styling (4.2s)
  ✓  3 every decision attention field and control exposes a contextual tooltip (3.5s)
  ✓  4 authored decision attention text with markup renders escaped (3.6s)
  ✓  5 elapsed decision attention items render expired and a stale generation is declared (3.7s)
  5 passed (20.7s)
```

Five titles enumerated, five passed, zero failed and zero skipped. The five titles
match the five persistent titles in the Test Plan exactly.

### Adversarial Bite — The Degraded Scenario Detects A Lost Expiry Distinction

`market-brief.html` was mutated so live items are stamped expired as well, by
changing `(elapsed ? "Expired" : "Still live")` to
`(elapsed ? "Expired" : "Expired")`. If the scenario were still tautological this
edit would pass unnoticed. It fails.

**Claim Source:** executed

```text
  ✘  1 tests/attention-browser.spec.mjs:328:1 › elapsed decision attention items render expired and a stale generation is declared (8.9s)
  1 failed
```

The file was restored and proven byte-identical before and after the mutation:

**Claim Source:** executed

```text
sha256 7b1ab146e428620284ac305202acc92b8f154463c1b0cbd1217d6218ec089293
```

This run is the answer to Mid-Scope Event 2. The repaired scenario now
distinguishes an elapsed item from a live one, which is the behavior it was
always supposed to protect and never previously could.

### Guardrails Held

The Scope 1 and Scope 2 suites and the publication gate were re-run after the
`market-brief.html` change, together with the cross-page view-tab and privacy
audit.

**Claim Source:** executed

```text
# pass 28   # fail 0            (rlattention + attention-payload-contract)
pages audited: 23   with view tabs: 23   errored: 0   total leaks: 0
PUB_EXIT=0                       (node scripts/validate-brief-payload.mjs)
```

`PUB_EXIT=0` is the load-bearing line: the publication gate still accepts the
committed payload after the cron collision was resolved and the migration
re-applied on top of the cron's fresh market data.

### Assertion Integrity After The Test Repair

Proof that the TP-03-05 repair touched fixture strings and not assertions, and
that no scenario carries a skip, an `.only` or a bailout return.

**Claim Source:** executed

```text
354:  await expect(elapsedItem).toContainText(/expired/i);
359:  await expect(liveItem).not.toContainText(/expired/i);
grep -cE 'test\.skip|\.only\(|^\s*return;'  ->  0
```

---

### TP-03-01

SCN-017-028 · The Brief renders the tier and the record from committed data, with
no provider key, no proxy and no network request issued for either.

**Claim Source:** executed

```text
RED:
  tests/attention-browser.spec.mjs:117 › decision attention tier renders items and record from committed data
RED_EXIT=1

GREEN:
  ✓  1 decision attention tier renders items and record from committed data (3.8s)
  5 passed (20.7s)
```

The scenario records every request the page issues with `page.on('request')` and
asserts both the off-origin set and the provider/proxy-bound set are empty. It
also asserts `#decisionAttention` renders above `#attention`, and that
`#attentionRecord` renders below `#scorecard` with a real summary rather than an
empty placeholder.

### TP-03-02

SCN-017-029 · Attention items carry no alert severity label and no alert styling,
audited against the real alert affordances present on the same page.

**Claim Source:** executed

```text
RED:
  tests/attention-browser.spec.mjs:174 › decision attention items carry no alert severity label or alert styling
RED_EXIT=1

GREEN:
  ✓  2 decision attention items carry no alert severity label or alert styling (4.2s)
  5 passed (20.7s)
```

### TP-03-03

SCN-017-030 · Every rendered field and every control exposes a contextual tooltip
that states both what the field is and what the current reading means.

**Claim Source:** executed

```text
RED:
  tests/attention-browser.spec.mjs:235 › every decision attention field and control exposes a contextual tooltip
RED_EXIT=1

GREEN:
  ✓  3 every decision attention field and control exposes a contextual tooltip (3.5s)
  5 passed (20.7s)
```

The scenario asserts three separate offence sets are empty: tooltips that are
missing, tooltips that merely echo their own label, and tooltips that state what
the field is without stating what the current reading means.

### TP-03-04

SCN-017-031 · Authored text with markup renders escaped at every sink — headline,
rationale, escalation trigger, invalidation and next step — in both the collapsed
and the expanded form.

**Claim Source:** executed

```text
RED:
  tests/attention-browser.spec.mjs:278 › authored decision attention text with markup renders escaped
RED_EXIT=1

GREEN:
  ✓  4 authored decision attention text with markup renders escaped (3.6s)
  5 passed (20.7s)
```

The scenario opens the disclosure before asserting, so all five sinks are checked
in the expanded form as well as the collapsed one. It additionally asserts that no
sentinel node was created, that no injected script element exists and that no
injected global was set.

### TP-03-05

SCN-017-032 · An elapsed item renders as expired rather than being removed, and a
stale generation is declared in plain reader language. This row carries its own
adversarial proof, and its history is documented in Mid-Scope Event 2.

**Claim Source:** executed

```text
RED:
  tests/attention-browser.spec.mjs:328 › elapsed decision attention items render expired and a stale generation is declared
RED_EXIT=1

GREEN:
  ✓  5 elapsed decision attention items render expired and a stale generation is declared (3.7s)
  5 passed (20.7s)

BITE — live items also stamped Expired in market-brief.html:
  ✘  1 tests/attention-browser.spec.mjs:328:1 › elapsed decision attention items render expired and a stale generation is declared (8.9s)
  1 failed

restored market-brief.html byte-identical before and after
sha256 7b1ab146e428620284ac305202acc92b8f154463c1b0cbd1217d6218ec089293

assertions preserved byte-identical through the fixture repair:
354:  await expect(elapsedItem).toContainText(/expired/i);
359:  await expect(liveItem).not.toContainText(/expired/i);
```

## Honest Gaps

Five Definition of Done items are left unticked. Each is listed with the reason.

| DoD item | Why it is not ticked |
|---|---|
| The populated, empty, expanded-item, degraded and narrow projections all render as specified | Three of the five projections are asserted: populated by TP-03-01, expanded by TP-03-03 and TP-03-04, degraded by TP-03-05. The **empty** projection is asserted by no scenario — nothing exercises a zero-item payload — and the **narrow** projection is asserted by no scenario either, since no run sets a viewport. The UI Scenario Matrix maps both to existing rows, but those rows do not carry the assertions. This is a coverage gap, not an unrun command. |
| No fifth view is added and no view id is introduced | Nothing in the recorded evidence counts the views on `market-brief.html` or checks for an introduced view id. The cross-page audit line reports 23 pages with view tabs, which is a per-page privacy and tab audit rather than a view-count assertion for this page. |
| `node scripts/selftest.mjs` exits 0 on the working tree | That command was not run in this session. |
| Every excluded path listed in the Change Boundary is byte-identical to its pre-scope state, proven by a diff of the working tree | No baseline diff was run. The `sha256` recorded above proves only that `market-brief.html`, an **allowed** path, was restored after the adversarial mutation. It says nothing about `rlattention.js`, `scripts/validate-brief-payload.mjs`, `market-brief.payload.json`, `scripts/selftest.mjs` or the concurrently-owned paths. |
| Zero console errors and zero warnings during the browser runs | Only TP-03-04 asserts that the page emitted no errors, and it asserts that for its own run alone. The other four runs are unasserted on this point, and no recorded output covers warnings. The list-reporter output is per-test lines and a pass count, so the absence of warnings cannot be read from it. |

## Completion Statement

Scope 3's substantive work is delivered and evidenced. The `#decisionAttention`
tier renders above `#attention` and the `#attentionRecord` block renders below
`#scorecard`, both from committed data with an empty request set for off-origin
and provider-bound URLs. All five scenarios are proven RED then GREEN with their
exact persistent titles, and the degraded scenario is proven to bite.

**The scope is not Done.** Fourteen Definition of Done items are ticked and five
are not. Two of the five are genuine coverage gaps rather than unrun commands:
the empty and narrow projections have no assertions anywhere, and the
no-fifth-view constraint has none either. Those need Test Plan rows from the
planning owner before they can be honestly ticked. The remaining three are unrun
verifications.

Two things in this report deserve to outlive it. The cron collision turned
F-017-02 from a predicted hazard into a recorded event, which is the strongest
available argument for keeping Scope 2's change set atomic. And TP-03-05 spent
this scope's opening in a state where it could neither be satisfied nor falsified,
which is a reminder that a red test is not automatically a correct test — the
assertion has to be checked against the fixture before the implementation is
blamed.

One new defect was found while reading the rendered page during this scope and is
filed as F-017-04 in the feature-level `report.md`. It is reader-facing copy
correctness in the rank rationale, it is not covered by any test, and it is routed
rather than fixed here.
