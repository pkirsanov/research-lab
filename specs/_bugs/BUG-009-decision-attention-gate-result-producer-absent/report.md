# Report: BUG-009 — Decision-Attention Gate-Result Producer Absent

## Summary

The Market Brief's decision-attention feed has published zero items since
2026-08-10. The cause is not a wiring gap: the publish-time composer runs on every
generation and refuses every candidate, writing 2–7 exclusions per run, all
`RLATTN-PROVENANCE` on `gateResult`. The `decision-attention/v1` contract composes
each item from three inputs, and only two of them — the lane's `authored` judgement
and the deterministic `ctx` — have a producer anywhere in the repository. The
observed `gateResult` has none, was never specified in `specs/017`, and exists only
as a test fixture.

Both mechanical gates are green while the feed is dead: `node scripts/selftest.mjs`
reports `2843 passed, 0 failed` and `node scripts/validate-brief-payload.mjs` reports
`PASS`. An empty array is contract-valid, so no assertion can see the condition.

The remedy requires an owner-declared detection policy that does not exist in any
committed artifact. This packet documents, routes, and implements nothing.

## Completion Statement

**NOT COMPLETE. NOTHING WAS IMPLEMENTED.** Status is `blocked` and is truthful and
non-terminal. No source file was modified. No test was added. No DoD box is checked
in [scopes.md](scopes.md) across all four scopes. No certification field asserts
anything. Candidate remedies R1–R5 are enumerated in [design.md](design.md) §4 and
**none is selected**.

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
Final verification is recorded in §E13.

This is written down rather than quietly tidied because a report that noted a green
suite at §E6 and stayed silent about a red one afterwards would be misleading, and
because two corrected attributions are worth more than one confident wrong one.

```
$ git worktree remove --force "$TMPDIR/rl-bug009-repro"
REMOVE_EXIT=0
$ git worktree list
/Users/<user>/Projects/research-lab  373f4572d [main]
```

The worktree path above is reproduced verbatim except for the account segment, which
is replaced with the `<user>` placeholder `scripts/pii-scan.mjs` documents as the
stand-in. The `home-path` rule refuses a real account name on the committed surface,
and a redacted segment carries the same meaning for a reader without publishing it.

### E13 — Final verification: the canonical gate is green with this packet present

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
