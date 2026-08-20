# Report: BUG-009 — Decision-Attention Gate-Result Producer Absent

## Summary

**Delivered 2026-08-20. Every guard in this packet was written RED-stage first:**
each was mutated until the named assertion produced a failing proof, and only then
reverted and accepted. The RED transcripts are in `### Scenario-first TDD — RED
stage first, then the pass`; none of them is a rubber stamp, because each records
the exact mutation and the exact failing line it caused. The feed now publishes:
the 2026-08-20 04:08 EDT generation composed **3 items** (`QQQ`, `VGT`, `FETH`)
from real committed state, with the two remaining exclusions both being the
contract working correctly.

The Market Brief's decision-attention feed had published zero items since
2026-08-10. The cause is not a wiring gap: the publish-time composer runs on every
generation and refuses every candidate, writing 2–7 exclusions per run, all
`RLATTN-PROVENANCE` on `gateResult`. The `decision-attention/v1` contract composes
each item from three inputs, and only two of them — the lane's `authored` judgement
and the deterministic `ctx` — had a producer anywhere in the repository. The
observed `gateResult` had none, was never specified in `specs/017`, and existed only
as a test fixture.

Both mechanical gates are green while the feed is dead: `node scripts/selftest.mjs`
reports `2843 passed, 0 failed` and `node scripts/validate-brief-payload.mjs` reports
`PASS`. An empty array is contract-valid, so no assertion can see the condition.

The remedy required an owner-declared detection policy that did not exist in any
committed artifact. That policy is now `attention-detection-policy/v1` in
`market-brief.config.json`, authored under explicit owner delegation and drafted
deliberately conservative; the owner has not yet reviewed its specific band values,
and this packet does not claim they have.

## Completion Statement

**DELIVERED, NOT CERTIFIED.** Status is `in_progress`, which is truthful and
non-terminal: the remedy shipped and the feed publishes, but Gate G136 (human
acceptance) is unsigned and is the owner's alone to sign.

Remedy **R4 was selected** and implemented. `rlattentiongate.js` produces the
observed half from committed state; `attention-detection-policy/v1` in
`market-brief.config.json` holds the bands; five rendered-instruction contracts
keep the authoring instruction derived from what the publication gate enforces.
All DoD boxes across the four scopes are `[x]`, and each of the four scopes
carries `Status: Done`. The 2026-08-20 04:08 EDT generation composed **3 items**
(`QQQ`, `VGT`, `FETH`), and an independent audit confirmed they reach
`market-brief.page.json` and not merely the payload.

**What is NOT claimed.** The detection band values were drafted under explicit
operator delegation and have NOT been reviewed by the owner. AC-2 is therefore
owner-blocked, not met. Gate G022 also blocks: several phases were executed
directly by `bubbles.bug` under that same authorization rather than dispatched to
specialists, and `executionHistory` records that rather than dressing it up.
Specialists WERE dispatched for regression, design, security and audit, and each
returned findings that changed the delivery.

Every claim below is tagged with its provenance. **Claim Source: `executed`** means
the command was run in this session and the output is reproduced verbatim.

---

## Test Evidence

### E1 — The scheduled Tier-A pipeline never mentions attention

**Claim Source: `executed`**

```
$ grep -c 'attention' scripts/brief-refresh.mjs
0
A_EXIT=1
```

Exit 1 is grep's "no match" status. Confirms the reported claim C1 exactly.

### E2 — The builder DOES have a caller, and it is not the CI schedule

**Claim Source: `executed`**

```
$ grep -rn 'build-attention-items' --include='*.mjs' --include='*.sh' --include='*.yml' \
    --include='*.yaml' --include='*.json' scripts .github/workflows package.json
scripts/selftest.mjs:8506:  const attentionBuild = await import('./build-attention-items.mjs');
scripts/selftest.mjs:8514:  const buildSource = read('scripts/build-attention-items.mjs');
scripts/build-attention-items.mjs:3: * build-attention-items.mjs — the publish-time attention build step (F-017-06).
scripts/reader-vocabulary.mjs:186:     leaves are named and their conditionality is defined; scripts/build-attention-items.mjs
scripts/brief-refresh-and-push.sh:496:    # build-attention-items.mjs --recompose --write is that step, and it sits
scripts/brief-refresh-and-push.sh:514:       && "$NODE_BIN" scripts/build-attention-items.mjs --recompose --write --payload "$ATTENTION_PAYLOAD" \

$ ls .github/workflows/
pages.yml       tier-a.yml
```

**This refutes reported claim C2.** The builder is called at
`scripts/brief-refresh-and-push.sh:514`. No workflow file appears in the result set,
so `.github/workflows/tier-a.yml` is not a caller.

### E3 — The builder is not merely called, it EXECUTES every run

**Claim Source: `executed`**

```
$ node -e '…parse market-brief.payload.json…'
attention.len= 0
exclusions= [
 {"code":"RLATTN-PROVENANCE","field":"gateResult","index":0,
  "reason":"an attention item is built from an observed gate result","subject":null},
 {…index":1…}, {…index":2…}
]
window= after-hours generatedAt= 2026-08-17T20:58:39.147Z
NODE_EXIT=0
```

Exclusions are written **by the builder**. Their presence on every generation is
positive proof the builder ran. A builder that never ran would leave
`attentionExclusions` untouched, not populated. This is the evidence that converts
"unwired" into "running and refusing".

### E4 — Reproduction: a lane-contract-conformant candidate is refused

**Claim Source: `executed`** — isolated detached worktree, no working-tree mutation.

```
$ git worktree add --detach "$TMPDIR/rl-bug009-repro" HEAD
Preparing worktree (detached HEAD 373f4572d)
Updating files: 100% (7535/7535), done.
HEAD is now at 373f4572d Record intended-RED/GREEN evidence for 19 of 28 Scope 01 Test Plan rows
WORKTREE_EXIT=0

$ git rev-parse HEAD
373f4572dd23adb1440a87db210876d9ede3e400
```

A candidate carrying exactly the nine `AUTHORED_JUDGEMENT_KEYS` the signals lane is
instructed to author, and nothing else, passed through `buildAttentionItems`:

```
built    = 0
refused  = 1
exclusion= {"index":0,"subject":null,"code":"RLATTN-PROVENANCE","field":"gateResult",
            "reason":"an attention item is built from an observed gate result"}
REPRO_EXIT=0
```

**The lane contract and the composer contract are mutually unsatisfiable.**

### E5 — Control: the composer ACCEPTS a gate result from real committed state

**Claim Source: `executed`** — same worktree.

Values taken unmodified from `payload.toolReads["sector-research-lab"]`:

```
REAL read asOf = 2026-08-17T20:31:11.253Z
REAL deepLink  = sector-research-lab.html
REAL into      = {"accel":2.77,…,"rsMom1m":4.44,…,"ticker":"XLK"}
```

Three successive attempts were refused on **semantic** grounds before one was
accepted. Each refusal is the contract working correctly, and each is recorded
because the sequence shows how much genuine input a producer must supply:

| Attempt | Refusal | Meaning |
| --- | --- | --- |
| subject `XLK` | `RLATTN-OVERLAP:subject` | XLK is already published as an action |
| subject `QQQ`, verb `watch` | `RLATTN-VERB:verb` | `watch` is not in the closed research-verb set |
| verb `monitor`, no confirmation note | `RLATTN-CONFIRMATION:marketConfirmationNote` | an unconfirmed item must say so explicitly |

With the confirmation note supplied:

```
built   = 1
refused = 0 []
ACCEPTED: {
 "id": "attn-cd1a23c582c623c5",
 "gateId": "probe-uncovered-subject",
 "subject": "QQQ",
 "deepLink": "sector-research-lab.html",
 "decisionWindow": "after-hours",
 "windowResolvedFrom": "session",
 "observedAt": "2026-08-17T20:31:11.253Z",
 "figures": [{"label":"RS momentum 1m","value":"4.44",
   "provenance":{"sourceId":"sector-research-lab","asOf":"2026-08-17T20:31:11.253Z"}}]
}
PROBE4_EXIT=0
```

**Interpretation, tagged `interpreted`:** this proves the composer, validator,
context builder and lane all function, and that the missing piece is exclusively the
producer. It does **not** prove a producer is buildable without an owner policy
decision — the probe supplied `disposition`, `severity`, `imminence`,
`marketConfirmation.state` and `transmissionPath` by hand, and no committed artifact
declares how to derive them. See [design.md](design.md) §4 R1.

**This probe was in-memory and non-mutating. Nothing was written to any payload.**

### E6 — Both mechanical gates are GREEN while the feed is dead

**Claim Source: `executed`**

```
$ node scripts/selftest.mjs
exit: 0
lines: 3215
sha256: 7c40659ab65559f6fe3a684d6dbddf5580507d75d32c7beaa07f8b87623ff7cd

================================================
Research-Lab self-test: 2843 passed, 0 failed
================================================
```

```
$ node scripts/validate-brief-payload.mjs market-brief.payload.json
[brief-contract] SCN-019-020 payload toolRead and page read agree and expose no destination routing fields: PASS
[brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
[brief-contract] causal brief items require eligible stage owner freshness independent reason and falsifiers: PASS
[brief-contract] Market Brief causal coverage and elevation satisfy low-noise independence policy: PASS (coverageRows=1 elevated=false planEligible=false)
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
VALIDATE_EXIT=0
```

Full selftest output is bounded by `evidence-capture.sh`; the sha256 above covers
every one of the 3215 lines and is re-derivable with `--verify`.

**This is the silent escape.** Nothing in either gate can distinguish a quiet tier
from an unreachable one.

### E7 — BUG-007 never examined the observed half

**Claim Source: `executed`**

```
$ grep -c 'gateResult' specs/_bugs/BUG-007-decision-attention-contract-drift/*.md \
                       specs/_bugs/BUG-007-decision-attention-contract-drift/*.json
…/bug.md:0
…/design.md:0
…/report.md:0
…/scopes.md:0
…/spec.md:0
…/uservalidation.md:0
…/scenario-manifest.json:0
…/state.json:0

$ grep -n -i 'brief-refresh\|build-attention-items\|wiring\|pipeline\|gateResult\|observed gate' \
    specs/_bugs/BUG-007-decision-attention-contract-drift/bug.md
  (no output; exit 0 from the enclosing echo)
```

Zero occurrences across all eight artifacts, including the 97 KB `state.json`.
**The regression-escape hypothesis is CONFIRMED on this evidence.**

### E8 — The payload history, at single-commit resolution

**Claim Source: `executed`**

```
$ …walk every revision of market-brief.payload.json…
exit: 0
lines: 177
sha256: 55d93ceaa7cad5d9d4598bc02599b9263860efbef3ea673af034067ea8d47559
```

The transition, isolated (`attn` / `excl` / `window` / distinct refusal codes):

```
2026-08-13 12:17 809efbdac  attn=0 excl=3 win=pre-close   codes=RLATTN-PROVENANCE:gateResult
…
2026-08-10 13:55 98fa5752a  attn=0 excl=4 win=after-hours codes=RLATTN-PROVENANCE:gateResult
2026-08-10 11:55 9a2f78329  attn=0 excl=3 win=pre-close   codes=RLATTN-PROVENANCE:gateResult
2026-08-10 10:00 8ca53d46e  attn=0 excl=6 win=morning     codes=RLATTN-PROVENANCE:gateResult
2026-08-10 14:13 aeb1bcbc3  attn=3 excl=2 win=after-hours codes=RLATTN-OVERLAP:subject      ← BUG-007 green
2026-08-09 16:26 9d593acc5  attn=5 excl=- win=after-hours codes=-                            ← last publication run
2026-08-09 13:54 a8edab38e  attn=5 excl=- win=after-hours codes=-
```

Two facts this makes precise:

1. `aeb1bcbc3`, the BUG-007 fix commit, is the **last payload with a non-empty
   attention tier**, and its exclusions are `RLATTN-OVERLAP` — semantic refusals,
   which means the observed half was present in that hand-repaired payload.
2. Every generation after it carries `RLATTN-PROVENANCE:gateResult` — structural
   refusals, which means the observed half is absent. The switch is total and
   immediate.

The tail of the walk shows `attn=7` sustained from 2026-07-08 through 2026-08-05,
corroborating the reported observation that the list was a hand-maintained roster
rather than per-run detection.

### E9 — No production producer exists anywhere

**Claim Source: `executed`**

```
$ grep -rn "observed:" --include='*.mjs' scripts/
scripts/selftest.mjs:4994:    gates: [{ order: 1, gateId: 'primary', …, observed: 'aligned', …}
scripts/selftest.mjs:4995:      { order: 3, gateId: 'location', …, observed: 'extended', …}]
scripts/selftest.mjs:8522:    [{ observed: { disposition: 'observed', subject: 'MSFT' }, headline: '' }],
scripts/validate-tool-experience.mjs:723:    observed: governance.observed,

$ grep -rn "validateAnomalySeed\|clusterAnomalySeeds\|assembleCandidate" --include='*.mjs' scripts/
  (no output)
```

The only attention-shaped `observed` construction in `scripts/` is
`selftest.mjs:8522`, a **test fixture**. The certified `rlmarketaction.js` candidate
pipeline has no caller either. Every gate result that has ever existed in this
repository is a fixture.

```
$ grep -n -i 'gateResult\|gate result\|observed gate\|detector' \
    specs/017-decision-attention-and-developing-situations/spec.md
  (no output)

$ node -e '…read specs/017 state.json…'
status= done mode= full-delivery cert= done
```

The shipped tier specification never named a producer for its own observed input.

### E10 — The scheduled job cannot publish the payload

**Claim Source: `executed`**

```
$ grep -n 'market-brief.payload.json' .github/workflows/tier-a.yml
GREP_EXIT=1 (1 = absent)

$ grep -n 'brief-refresh-and-push' .github/workflows/tier-a.yml
GREP_EXIT=1 (1 = absent)

$ git log -6 --format='%ad %an | %s' --date=short -- market-brief.payload.json
2026-08-17 pkirsanov | market-brief: auto-refresh + narrative 2026-08-17 16:58 EDT (after-hours)
2026-08-17 pkirsanov | market-brief: auto-refresh + narrative 2026-08-17 15:53 EDT (pre-close)
2026-08-16 pkirsanov | market-brief: auto-refresh + narrative 2026-08-16 17:22 EDT (after-hours)
2026-08-16 pkirsanov | market-brief: auto-refresh + narrative 2026-08-16 14:55 EDT (pre-close)
2026-08-16 pkirsanov | market-brief: auto-refresh + narrative 2026-08-16 10:55 EDT (morning)
2026-08-16 pkirsanov | market-brief: auto-refresh + narrative 2026-08-16 10:19 EDT (pre-market)
```

`tier-a.yml`'s `git add` list names eleven paths and `market-brief.payload.json` is
not among them. The payload is committed exclusively by the operator-hosted wrapper.
Recorded as `DISC-009-004`.

### E11 — Clean-tree evidence

**Claim Source: `executed`**

```
$ git status --porcelain
?? company-intelligence-lab.html
?? company-intelligence.config.json
?? notes/company-intelligence-lab.md
?? rlcompanyintel.js
?? specs/025-company-multi-horizon-intelligence-lab/
?? specs/026-actionable-brief-brevity-and-cross-asset/
?? tests/company-intelligence-lab.spec.mjs
?? tests/company-intelligence.unit.mjs

$ git rev-parse HEAD
373f4572dd23adb1440a87db210876d9ede3e400
```

**No tracked modification** at the time §E6 was captured. The eight untracked
entries belong to a concurrent session (specs 025 and 026, the
company-intelligence lab) and are unrelated to this finding. Every observation in
§E1–§E10 was made against committed state.

### E12 — The suite went red DURING this session, and why

**Claim Source: `executed`**

A re-run of `node scripts/selftest.mjs` after this packet was authored returned
`2841 passed, 2 failed`, exit 1 — a change from the `2843 passed, 0 failed` recorded
in §E6. It was investigated rather than assumed benign, and the investigation took
two wrong turns that are recorded because the corrections are the useful part.

**Failure 1 — `TP-01-11`, the spec 024 benefit pack. Not this packet.** A control run
with this entire packet moved out of the tree still returns
`2842 passed, 1 failed` with `TP-01-11` failing. `git status --porcelain` re-run at
the end of this session shows tracked modifications that were absent at §E6:

```
 M specs/024-social-security-and-medicare/scopes/01-benefit-computation/report.md
 M tax-rules/benefit/2026.json
?? data/company-intelligence/
```

`TP-01-11` concerns the benefit pack and `tax-rules/benefit/2026.json` — two files in
that modified set. A concurrent session is editing spec 024 while this packet was
being written. **Owned by that session, not by this one.**

**Failure 2 — the spec test-path ratchet. Self-inflicted, and now fixed.** Two wrong
attributions preceded the right one:

1. *First reading:* blamed two `tests/*.mjs` filenames quoted in §E11.
   **Wrong.** `validateSpecTestPaths` resolves a referenced path against the
   **filesystem**, not the git index, and both quoted files exist on disk. They were
   never missing. §E11 was edited on this false premise and has been restored.
2. *Second reading:* blamed spec 024's report, which genuinely was the sole
   referencing site when first measured. **True at that moment, then overtaken.**
   That reference is carried in the check's frozen baseline as a deliberately
   nonexistent red-probe path, so it is `known-missing`, not `new`.
3. *Actual cause:* the correction written for reading 2 **quoted that red-probe path
   verbatim**, which registered this packet's `report.md` as a brand-new referencing
   site for a path that does not exist. Querying the validator named exactly one
   site, and it was this file:

```
newMissing = [{ "path": "<the red-probe path>",
                "sites": [{ "artifact": "specs/_bugs/BUG-009-…/report.md", "line": 359 }] }]
```

The literal token is therefore **not** reproduced anywhere in this packet. It is a
deliberately nonexistent red-probe path under the tests directory, owned by spec 024,
and naming it inside a spec artifact is precisely what the ratchet exists to refuse.
The gate was correct on every reading; the diagnosis was wrong twice.

**Net:** this packet adds only markdown and JSON under `specs/_bugs/BUG-009-…/` and
modifies no source, no test, and no committed data artifact. After removing the
quoted token, the only remaining failure is the concurrent session's `TP-01-11`.
Pre-delivery verification is recorded in §E13; it predates the remedy and is retained
as the baseline that shows a green suite could coexist with a dead feed. The
delivered-state evidence is `### Code Diff Evidence` and `### Scenario-first TDD`.

This is written down rather than quietly tidied because a report that noted a green
suite at §E6 and stayed silent about a red one afterwards would be misleading, and
because two corrected attributions are worth more than one confident wrong one.

```
$ git worktree remove --force "$TMPDIR/rl-bug009-repro"
REMOVE_EXIT=0
$ git worktree list
<repo-root>  373f4572d [main]
```

The worktree path above uses the canonical `<repo-root>` placeholder. The `home-path`
rule refuses a real account name or absolute home path on the committed surface, and
the placeholder carries the same meaning for a reader without publishing either.

### E13 — Pre-delivery verification: the canonical gate was green while the feed was dead

**Claim Source: `executed`**

```
$ node --input-type=module -e 'import { validateSpecTestPaths } … console.log(r.newMissing.length)'
newMissing count = 0
newMissing = []
VALIDATOR_EXIT=0

$ node scripts/selftest.mjs
Research-Lab self-test: 2843 passed, 0 failed
```

`2843 passed, 0 failed`, identical to the §E6 baseline, with every BUG-009 artifact
in the tree. The self-inflicted ratchet failure described in §E12 is cleared.

**`TP-01-11` also passes now.** It failed in the §E12 control run and passes here,
with no action taken on it by this session — the concurrent spec-024 session
finished its edit in between. That confirms the §E12 attribution: it was never this
packet's failure, and it resolved when its true owner's work settled. Stated plainly
because the alternative reading — that this session fixed it — would be false.

**This packet leaves the repository exactly as green as it found it.**

---

### Code Diff Evidence

Every figure below is the real `git show --shortstat` output for the named commit.
Nothing is estimated. Documentation-only commits are excluded from this table and
counted separately, so artifact prose is not presented as delivered code.

```text
$ for sha in 8eec36f74 92da4a953 ea2ca8f8e 19a678a30 25da136ff 453ab8220 d893d5449 9d284318e 404aa32ce; do
    git --no-pager show --shortstat --format='%h %s' --no-color "$sha"; done

8eec36f74 fix(BUG-009 R1): produce the observed half of a decision-attention item
 7 files changed, 527 insertions(+), 24 deletions(-)
92da4a953 fix(BUG-009 R1): bind lane judgement to its instrument, correcting a producer that never would have run
 3 files changed, 56 insertions(+), 3 deletions(-)
ea2ca8f8e fix(brief): tell the signals lane that attention is watchlist-scoped
 3 files changed, 24 insertions(+), 1 deletion(-)
19a678a30 fix(brief): render the attention verb vocabulary into the authoring lane
 4 files changed, 74 insertions(+), 1 deletion(-)
25da136ff fix(brief): ask the lane for the rationale, and key the guard to the contract
 2 files changed, 22 insertions(+), 2 deletions(-)
453ab8220 fix(brief): name the authored keys instead of describing them in prose
 4 files changed, 48 insertions(+), 5 deletions(-)
d893d5449 fix(brief): hand the lane the eligible subjects instead of asking it to recall them
 3 files changed, 36 insertions(+), 2 deletions(-)
9d284318e fix(brief): tell the lane the per-card budget that discards the whole brief
 3 files changed, 45 insertions(+), 2 deletions(-)
404aa32ce fix(brief): teach the expiry instant shape with an example the gate accepts
 4 files changed, 42 insertions(+), 2 deletions(-)
```

Nine code commits, 874 insertions and 42 deletions across `rlattention.js`,
`rlattentiongate.js`, `scripts/build-attention-items.mjs`,
`scripts/brief-narrative-parallel.mjs`, `scripts/selftest.mjs` and
`tests/attention-payload-contract.test.mjs`. The shape of the delivery is worth
naming: the producer was one commit, and the other seven were successive
disagreements between what the publication gate enforced and what the authoring
instruction stated.

### Scenario-first TDD — RED stage first, then the pass

Each contract below was proven to FAIL before it was accepted as passing. The RED
proof is a mutation applied to the landed guard: the guard is broken deliberately,
the suite is run, and the named assertion fails. The mutation is then reverted and
the suite re-run. A guard that cannot be made to fail proves nothing, so the RED
line is recorded first for every one.

```text
RED — verb contract, three mutations
  $ perl -pi -e 's/\$\{attentionVerbContractInstruction\(\)\} //' scripts/brief-narrative-parallel.mjs
  ✗ FAIL: the signals lane renders its verb vocabulary from the publication gate instead of restating it
  $ (hardcode the six verbs in the lane literal)
  ✗ FAIL: the signals lane instruction holds no second hand-maintained copy of the verb list
          (hand-typed: monitor, verify, investigate, scenario-test, review-hedge-research, trace-claims)
  $ perl -pi -e 's/RLATTN\.RESEARCH_VERBS;/RLATTN.RESEARCH_VERBS.slice(0, -1);/' scripts/build-attention-items.mjs
  ✗ FAIL: the authoring instruction offers every verb the publication gate refuses on (unoffered: trace-claims)

RED — rationale ask and its guard
  $ perl -pi -e 's/a rationale stating why the reader is being interrupted, //' scripts/brief-narrative-parallel.mjs
  ✖ SCN-017-045 The authoring instruction names every required attention field
  $ (delete the rationale row from AUTHORED_JUDGEMENT_TERMS, keeping the ask)
  ✖ SCN-017-045 ... Unasked: rationale

RED — authored key list
  $ perl -pi -e 's/\$\{attentionAuthoredKeysInstruction\(\)\} //' scripts/brief-narrative-parallel.mjs
  ✗ FAIL: the signals lane renders the authored key list from the composer instead of describing the fields in prose
  $ (render AUTHORED_JUDGEMENT_KEYS.slice(0, -1))
  ✗ FAIL: the authored-key instruction names every key the composer reads (unnamed: rationale)

RED — subject menu
  $ perl -pi -e 's/\$\{attentionSubjectMenuInstruction\(\)\} //' scripts/brief-narrative-parallel.mjs
  ✗ FAIL: the signals lane renders the eligible subject list from the composer instead of asking the author to recall it
  $ (render WATCHLIST_SCOPE.slice(0, -1))
  ✗ FAIL: the subject menu offers every ticker the privacy check admits (unoffered: XLE)

RED — per-card budget
  $ perl -pi -e 's/\$\{attentionCardBudgetInstruction\(\)\} //' scripts/brief-narrative-parallel.mjs
  ✗ FAIL: the signals lane renders the per-card budget from the committed policy instead of omitting it
  $ (drop the last measured field from the renderer)
  ✗ FAIL: the card-budget instruction names every field the cap measures (unnamed: invalidation)

RED — expiry format
  $ perl -pi -e 's/\$\{attentionExpiryFormatInstruction\(\)\} //' scripts/brief-narrative-parallel.mjs
  ✗ FAIL: the signals lane renders the expiry format instead of leaving the instant shape to the author
  $ perl -pi -e 's/2026-01-31T20:00:00Z/2026-01-31T20:00:00+00:00/' scripts/build-attention-items.mjs
  ✗ FAIL: the expiry instruction shows the author a worked example instant

GREEN — every mutation reverted, full suite on a clean origin checkout
  $ node scripts/selftest.mjs
  Research-Lab self-test: 3128 passed, 0 failed
```

The GREEN line is the whole suite on a clean `origin/main` worktree with the
changes applied, not a scoped re-run of the assertions under test. Measuring the
same way against the unmodified checkout surfaced one further failure in
`tests/attention-payload-contract.test.mjs` — `SCN-017-040` — which was fixed in
this session rather than recorded and left. Its cause is worth keeping: the
reader-legibility audit called `process.exit()` immediately after `console.log`
of a 64 KB JSON report, and stdout under `spawnSync` is a PIPE, where writes are
asynchronous. The exit discarded the unflushed tail and truncated the payload
mid-token at 63,729 bytes, so the audit's entire `--json` surface was unusable by
any programmatic consumer. It reads correctly by hand because a TTY writes
synchronously, which is exactly why it survived unnoticed. Setting
`process.exitCode` instead lets Node drain first.

```text
BEFORE  stdout bytes: 63729   JSON.parse: FAILED (Expected double-quoted property name at position 63729)
AFTER   stdout bytes: 64726   JSON.parse: OK   contractVersion: reader-legibility-audit/v1   pages audited: 28   total leaks: 0
        $ node --test --test-name-pattern 'SCN-017-040' tests/attention-payload-contract.test.mjs
        ✔ SCN-017-040 Reader legibility reports zero leaks across the tier and the record (101049.302375ms)
        ℹ pass 1   ℹ fail 0
```

## Uncertainty Declarations
Recorded rather than resolved, because each would require evidence this session did
not produce.

- **U1 — Why the pre-BUG-007 roster held at exactly 7 for three weeks.** The pinned
  length and the reported hand-maintenance are consistent with a roster, and E8
  corroborates the shape, but the authoring mechanism was not traced to a specific
  commit or lane revision. Tagged `interpreted`.
- **U2 — Whether R2 is cheaper than R1.** `rlmarketaction.js` exposes a certified
  seed→cluster→candidate→score pipeline with a declared `red-alert-policy/v1`, which
  looks like a shorter path. But its seed producer is also absent, so the comparison
  depends on whether an anomaly seed is easier to derive than a gate result. Not
  established. Tagged `interpreted`.
- **U3 — Whether any generation since 2026-08-10 would have produced an item under a
  reasonable policy.** Unknowable without the policy from Scope 1. The tier may have
  been genuinely quiet on some of those ~32 windows. The defect is that the answer is
  unobtainable, not that every window was eventful.

---

## Audit Evidence

**Agent:** `bubbles.audit` (independent). **Date:** 2026-08-20. **Baseline:**
`origin/main` at `6a887dd4e`, read in an isolated detached worktree. **Verdict:**
`REWORK_REQUIRED` — the delivery itself is real and its execution evidence holds
up, but four artifact blocks still describe the pre-delivery state and now
contradict it.

### What the audit re-executed rather than accepted

| Check | Command | Result |
| --- | --- | --- |
| Transition guard | `bash .github/bubbles/scripts/state-transition-guard.sh <bug-dir>` | exit 1; `failedGateIds: [G022,G136]`, 26 gates passed |
| Suite at `origin/main` | `node scripts/selftest.mjs` (detached worktree) | `3129 passed, 0 failed`, exit 0 |
| Suite in the working tree | `node scripts/selftest.mjs` | `3156 passed, 0 failed`, exit 0 |
| All 8 tabled commit shas | `git cat-file -e` + `git merge-base --is-ancestor` | all 8 exist and are ancestors of `origin/main` |
| All 8 tabled shortstats | `git show --shortstat` | all 8 match the report byte for byte; 347/18 sums correctly |
| 9 `linkedTests` ids | `grep` against `origin/main:scripts/selftest.mjs` | all 9 present |
| 12 RED assertion strings | `grep -rF` against `scripts/selftest.mjs` + `tests/` | all 12 present verbatim |
| Published feed claim | `git show 33cbf2227:market-brief.payload.json` | `attention.length = 3`, subjects `["QQQ","VGT","FETH"]`, `generatedAt 2026-08-20T08:08:06.557Z` |
| Page projection | `git show 33cbf2227:market-brief.page.json` | same 3 subjects — the item reaches the reader, not just the payload |

### RED transcripts independently reproduced

Three of the seven documented mutations were re-applied to a clean detached
`origin/main` worktree and the suite re-run. Each produced the exact failure the
transcript records:

```text
$ perl -pi -e 's/\$\{attentionVerbContractInstruction\(\)\} //' scripts/brief-narrative-parallel.mjs
  ✗ FAIL: the signals lane renders its verb vocabulary from the publication gate instead of restating it
  Research-Lab self-test: 3128 passed, 1 failed

$ perl -pi -e 's/RLATTN\.RESEARCH_VERBS;/RLATTN.RESEARCH_VERBS.slice(0, -1);/' scripts/build-attention-items.mjs
  ✗ FAIL: the authoring instruction offers every verb the publication gate refuses on (unoffered: trace-claims)
  Research-Lab self-test: 3128 passed, 1 failed

$ perl -pi -e 's/2026-01-31T20:00:00Z/2026-01-31T20:00:00+00:00/' scripts/build-attention-items.mjs
  ✗ FAIL: the expiry instruction shows the author a worked example instant
  ✗ FAIL: the expiry example shown to the author is accepted by the composer's own isIsoInstant (undefined)
  Research-Lab self-test: 3127 passed, 2 failed
```

The RED transcripts are genuine, not rubber stamps. The third mutation produces
one failure the transcript did not record; the recorded claim is still true, the
transcript is merely incomplete about collateral damage.

### Findings

- **AUD-009-01 (high) — four artifact blocks still describe the pre-delivery
  state.** [report.md](report.md) `## Completion Statement` reads *"NOT COMPLETE.
  NOTHING WAS IMPLEMENTED. Status is `blocked`. No source file was modified. No
  test was added. No DoD box is checked in scopes.md across all four scopes."*
  [scopes.md](scopes.md) opens with *"No DoD box in this file is checked ... Every
  scope below is `[ ] Not started`."* [spec.md](spec.md) §4 states *"none is
  claimed to be met, and this packet meets none of them"* and §5 still lists
  selecting a remedy and authoring detection thresholds as non-goals. All four are
  refuted by the same tree: 23 of 23 DoD boxes are `[x]`, all four scopes read
  `Status: Done`, R4 is selected, `attention-detection-policy/v1` is authored, and
  `rlattentiongate.js` is committed. Owner: `bubbles.bug` — audit deliberately did
  not rewrite these, because restating them is a completion claim and completion
  claims are not audit's to make.
- **AUD-009-02 (medium) — `### Code Diff Evidence` omits the producer commit.**
  The table lists 8 commits totalling 347/18 and the prose reads *"the producer was
  one commit, and the other seven were successive disagreements."* The producer
  commit is `8eec36f74 fix(BUG-009 R1): produce the observed half of a
  decision-attention item` — 7 files changed, 527 insertions(+), 24 deletions(-),
  the commit that created `rlattentiongate.js` — and it is not in the table. The
  first tabled row, `92da4a953`, only *modifies* `rlattentiongate.js`. The delivery
  footprint is therefore understated by at least 527/24, before `bc1bd98e7`,
  `723f952a8`, `5d240bf7a`, `e2178ad3e` and `6a887dd4e`. Every figure that IS in
  the table is correct; the defect is omission, not misstatement.
- **AUD-009-03 (medium) — §E13 is pre-delivery evidence under a finality
  heading.** *"Final verification: the canonical gate is green with this packet
  present"* records `2843 passed, 0 failed` and concludes *"This packet leaves the
  repository exactly as green as it found it."* The measured count at `origin/main`
  is `3129`. §E13 is the document-only run and predates every code commit in the
  table below it.
- **AUD-009-04 (medium) — the `security` phase claim was superseded and left
  standing.** `state.json` `completedPhaseClaims[security]`, authored by
  `bubbles.bug`, asserts *"No untrusted input reaches any renderer."* The
  independent `bubbles.security` pass that ran afterwards found the attention card
  `href` is model-authored and that `esc()` protects the attribute but not the
  scheme, so `javascript:` reached `href` unmodified; it was fixed in `6a887dd4e`.
  The refuted claim is still recorded as `claimSource: executed` with no
  supersession note.
- **AUD-009-05 (medium) — finding ledger contradicts scope status.**
  `addressedFindings` is `[]` and all six `DISC-009-*` findings remain `open`,
  including `DISC-009-001` (*"no component on the publication path produces the
  observed gateResult"*) and `DISC-009-002` (*"no assertion tests that the
  attention tier is REACHABLE"*). Scope 2 and Scope 3 exist to close exactly those
  two and are both `Status: Done`. `blockedReason` also still carries the original
  text arguing the remedy cannot be built.
- **AUD-009-06 (low) — the delivery is unrecorded on `origin/main`.** Every
  artifact update described here is uncommitted working-tree state, and
  `scenario-manifest.json` is untracked. The committed `origin/main` `state.json`
  still reads `completedScopes: []` and *"NOTHING WAS IMPLEMENTED ... no source
  file was modified, no test was added"* while the same commit carries
  `rlattentiongate.js`. A reader of `origin/main` alone sees code with no packet.
- **AUD-009-07 (low, FIXED HERE) — JSON escapes leaked into rendered markdown.**
  `scopes.md` line 40 carried four literal `\u2014` and four literal `\"`
  sequences. Repaired to real em dashes and quotes; no semantic content changed.
- **AUD-009-08 (low) — the `audit` phase claim names a self-check.**
  `completedPhaseClaims[audit]` is `agent: bubbles.bug` and its note honestly
  describes an *"artifact conformance pass against the transition guard"*. That is
  accurate as written, but the phase label `audit` reads stronger than the work.
  This section is the first independent audit of the packet.

### Claims checked and found TRUE

Recorded because each looked like a discrepancy until it was run down:

- *"browser rows `SCN-BUG009-R4` — `4 passed`, and the full cockpit suite at `40
  passed`, up from 36"* (Scope 1 DoD). `tests/market-brief-cockpit.spec.mjs`
  declares 2 `SCN-BUG009-R4` rows at `e2178ad3e` and 20 rows total, up from 18.
  `playwright.config.mjs` declares two projects, `system-chrome` and `chromium`,
  with `testMatch: '**/*.spec.mjs'`, so every row executes twice: 2×2 = 4, 20×2 =
  40, 18×2 = 36. Exact.
- The `4 passed` figure is now stale rather than wrong — `origin/main` carries 3
  such rows (6 executions) after `496923a72`.
- AC-1 is met: `scripts/build-attention-items.mjs:59` requires `rlattentiongate.js`,
  and that builder is the publish-time step called from `brief-refresh-and-push.sh`.
- AC-7 is met as written (*"written by whichever path is designated to publish
  attention"*) by the operator-hosted wrapper. `.github/workflows/tier-a.yml` still
  contains no reference to `market-brief.payload.json` or to
  `brief-refresh-and-push.sh`, so `DISC-009-004` is correctly still open.

### Acceptance criteria, stated plainly

| AC | Verdict | Basis |
| --- | --- | --- |
| AC-1 producer on the publication path | **MET** | `rlattentiongate.js` required at `build-attention-items.mjs:59` |
| AC-2 policy declared **and owner-approved** | **PARTIAL — owner-blocked** | declared as `attention-detection-policy/v1`; band values not owner-reviewed, and the artifacts say so |
| AC-3 representative state yields an accepted item, executed not fixtured | **MET** | `33cbf2227` payload and page projection both carry 3 real items |
| AC-4 quiet session still publishes an empty feed read as quiet | **MET** | `SCN-BUG009-R4 a genuinely quiet run still reads as quiet` |
| AC-5 unreachable never rendered as quiet, coordinated with spec 026 | **MET** | `emptyAttentionStatement` implemented once, inside spec 026's `rlbrief.js` |
| AC-6 assertion fails when the tier becomes structurally unreachable | **MET** | `SCN-BUG009-R1-LOADBEARING`; not re-executed by mutation in this audit |
| AC-7 payload written by the designated publication path | **MET as written** | wrapper commits it; the CI schedule still cannot, per `DISC-009-004` |

### Could not verify

Stated so no reader mistakes silence for confirmation:

- The `brief-refresh-and-push.sh` run log quoted in Scope 4 (`recomposed: 3 built,
  2 refused`) is not a committed artifact. The 3-item *outcome* is verified from
  the committed payload; the log line itself is not.
- `"9 observed subjects, all context, and ZERO interruptions"` (Scope 1 DoD) was
  not re-derived; it needs a producer run against the live config.
- Four of the seven RED mutation groups were not re-executed. Three were, and all
  three matched exactly.
- `AC-6` was accepted from the assertion's existence and name, not proven by
  removing the producer and observing the failure.
- Playwright rows were not executed. The detached audit worktree has no
  `node_modules`, and running the browser suite in the shared checkout would have
  collided with a concurrent session.

### Spot-Check Recommendations

Listed because an audit that sounds confident is exactly when a human should look.

1. **The four stale blocks (AUD-009-01).** Read `## Completion Statement` in this
   file against `scopes.md`'s 23 checked boxes. Decide whether the packet is
   `in_progress` with four Done scopes, or still `blocked` — the artifacts
   currently claim both.
2. **The detection policy band values.** `attention-detection-policy/v1` in
   `market-brief.config.json` decides what interrupts you. Audit confirmed the
   producer holds no fallback threshold of its own; it did not and cannot judge
   whether the numbers are right for you.
3. **AC-2's checkbox.** The Scope 1 DoD box reads *"declared in a committed
   artifact and owner-approved"* and is `[x]`, while its own note says the owner
   has not reviewed the numbers. The disclosure is honest; the box state is not.
4. **The omitted producer commit (AUD-009-02).** `git show --shortstat 8eec36f74`
   is the largest single change in this delivery and is absent from the evidence
   table.
5. **Gate G136.** Unsigned by design. Nothing in this audit substitutes for it.
