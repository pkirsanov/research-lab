# BUG-009 — The Decision-Attention Tier Has No Observed Gate-Result Producer

**Status:** Reproduced at HEAD. Root cause established. Remedy requires an owner
product decision that no agent may make. This packet documents and routes; it fixes nothing.
**Severity:** High (the brief's owned decision surface has published nothing for 8 days, while every mechanical gate stays green)
**Reported:** 2026-08-18
**Verified by:** `bubbles.bug`, 2026-08-18, against `/Users/pkirsanov/Projects/research-lab`
**Repository binding:** `PREFLIGHT_COMMITTED decision=rb:vscode-76b63b1d817fb69cbecb59e2acefacd6:2 revision=2 repository=research-lab`
**HEAD at verification:** `373f4572dd23adb1440a87db210876d9ede3e400`

---

## 1. Symptom

`notes/market-brief.md` §0 says the Market Brief **owns** *"the ranked attention feed
(≤ 7 cards)"*. That feed has published zero items on every generation since
2026-08-10. `market-brief.payload.json` carries `attention: []` and
`attentionExclusions` holding between 2 and 7 refusals per run, every refusal
identical in code and field:

```json
{"code":"RLATTN-PROVENANCE","field":"gateResult","index":0,
 "reason":"an attention item is built from an observed gate result","subject":null}
```

The owner's description — *"it is pretty useless, there are no actionable things"* —
is accurate and understates it. The feed is not quiet. It is **structurally
unsatisfiable**, and it says "quiet" while being unsatisfiable.

## 2. Root cause (one sentence)

The `decision-attention/v1` publication contract composes each item from **three**
inputs — an observed `gateResult`, the lane's `authored` judgement, and a
deterministic `ctx` — but only `authored` and `ctx` have a producer anywhere in the
repository, so `RLATTN.buildAttentionItem` refuses **every** candidate with
`RLATTN-PROVENANCE` on `gateResult` on **every** run.

The contract was shipped with two of its three producers built. The third was never
specified and never written.

## 3. Reproduction

Run from the repository root. Reproduced this session in an isolated detached
worktree, so no working-tree edit was needed and none was made:

```
git worktree add --detach "$TMPDIR/rl-bug009-repro" HEAD
```

Compose a candidate shaped **exactly** as the signals-lane contract mandates
(`scripts/brief-narrative-parallel.mjs:83` — *"author only the judgement … Author no
serialized envelope field for an attention item"*) and pass it through the certified
composer:

```
built    = 0
refused  = 1
exclusion= {"index":0,"subject":null,"code":"RLATTN-PROVENANCE","field":"gateResult",
            "reason":"an attention item is built from an observed gate result"}
```

Exit code 0. The full command and output are recorded in [report.md](report.md) §E4.

**The lane contract and the composer contract are mutually unsatisfiable.** The lane
is forbidden from authoring envelope fields; the composer requires an observed gate
result; nothing sits between them to produce one.

## 4. The silent-escape evidence

At the same HEAD, with the feed publishing nothing:

```
Research-Lab self-test: 2843 passed, 0 failed
```

Exit code 0. `node scripts/selftest.mjs` is the repository's canonical gate and the
Pages deploy gate. It is fully green while the tier the brief owns is unreachable.
No assertion anywhere asserts that the attention feed is **reachable** — only that
whatever it contains is **conformant**. An empty array is perfectly conformant.

That is the whole escape: the suite cannot tell "nothing happened today" from
"nothing can ever happen".

## 5. Corrections to the reported framing

Three claims in the report that opened this investigation do not survive
verification and are corrected here rather than repeated.

| # | Reported | Verified | Correction |
| --- | --- | --- | --- |
| C1 | `scripts/brief-refresh.mjs` contains zero occurrences of `attention` | **Confirmed.** `grep -c attention scripts/brief-refresh.mjs` → `0` | Stands as reported |
| C2 | `scripts/build-attention-items.mjs` has **no scheduled caller** | **Refuted.** It is called at `scripts/brief-refresh-and-push.sh:514`, and that caller demonstrably runs on every publication window | The builder is **reached and executed** every run. It writes 2–7 exclusions per generation, which is proof of execution. What is true is narrower: `.github/workflows/tier-a.yml` never calls it, and never commits `market-brief.payload.json` at all |
| C3 | Because nothing produces a `gateResult`, an automated run **can only ever** emit `attention: []` | **Confirmed in outcome, refuted in mechanism.** The outcome is right; the builder is not unreached, it is *running and refusing* | The defect is a missing **producer**, not missing **wiring**. This distinction decides the remedy: rewiring the builder into `tier-a.yml` would change nothing |
| C4 | Last non-empty run was 2026-08-09 after-hours; empty from 2026-08-10 onward | **Both boundaries are real and they are different events.** The last non-empty *publication* run is `9d593acc` 2026-08-09 after-hours (`attention` length 5). The last non-empty payload of any kind is `aeb1bcbc3` 2026-08-10 14:13 — the BUG-007 fix commit itself (length 3) | An earlier draft's "2026-08-11 boundary with a mixed 2026-08-10" is wrong, as reported. The corrected statement distinguishes the last scheduled run from the one-time repair commit |

Correction C2 is the load-bearing one. A remedy built on "the builder has no caller"
would wire an already-running builder into a second path and leave the feed exactly
as empty as it is now.

## 6. BUG-007 regression-escape hypothesis: CONFIRMED

`specs/_bugs/BUG-007-decision-attention-contract-drift/` was reported 2026-08-10 and
is `done`. The hypothesis that BUG-009 is an escape from it holds, on this evidence:

- **`gateResult` appears zero times across all eight BUG-007 artifacts**, including
  its 97 KB `state.json`. Verified by `grep -c gateResult` over the whole packet.
  BUG-007 never examined the observed half of the contract.
- BUG-007's own `bug.md` contains zero mentions of `brief-refresh`,
  `build-attention-items`, wiring, or pipeline, exactly as predicted.
- BUG-007 states of itself: *"Fixed upstream, verified not reproducible at HEAD. This
  packet documents and closes the finding; it did not author the fix."* It repaired
  the committed payload's **shape**, one time, in place.
- The transition is visible in the payload history at single-commit resolution.
  `aeb1bcbc3` (BUG-007 green) carries `attention` length 3 with two `RLATTN-OVERLAP`
  exclusions — semantic refusals, meaning the observed half was present. **Every
  generation after it** carries length 0 with `RLATTN-PROVENANCE:gateResult`
  refusals — structural refusals, meaning the observed half is absent.

BUG-007 turned a **loud** failure (7 red assertions) into a **silent** one (a
well-formed empty array), because it restored contract conformance without restoring
the capability, and added no test that the capability is reachable.

One refinement to the hypothesis: BUG-007 did not *break* a working feed. The feed
had never been produced by gate detection at all. The pre-BUG-007 items were the
legacy narrative-catalyst shape the model lane authored directly, which rendered
only because the `decision-attention/v1` contract was not yet enforced. BUG-007 armed
enforcement. **The capability was always absent; BUG-007 is what made the absence
visible in the payload and invisible in the test suite.** The reported observation
that the list sat pinned at 7 for three weeks — a hand-maintained roster, not per-run
detection — is corroborated by this.

## 7. Why the origin is upstream of BUG-007

`specs/017-decision-attention-and-developing-situations/` (`status: done`) shipped the
`decision-attention/v1` contract. It contains **zero** occurrences of `gateResult`,
`gate result`, `observed gate`, or `detector`. The tier's own specification never
named a producer for its observed input.

Confirming that no producer exists anywhere in production code:

- `grep -rn "observed:" scripts/*.mjs` returns one attention-shaped construction, at
  `scripts/selftest.mjs:8522` — a **test fixture**.
- `grep -rn "validateAnomalySeed|clusterAnomalySeeds|assembleCandidate" scripts/`
  returns nothing. The certified seed→cluster→candidate→score pipeline in
  `rlmarketaction.js` has no caller in `scripts/` either.

Every gate result that has ever existed in this repository is a test fixture.

## 8. The composer is not broken — feasibility is proven

A gate result assembled from **real committed tool-read state** is accepted. Using
`payload.toolReads["sector-research-lab"]` unmodified — its real `asOf`
(`2026-08-17T20:31:11.253Z`), its real metric (`rsMom1m` = `4.44`), its real
`sourceId`, and the `deepLink` the composer resolves from that `sourceId`:

```
built   = 1
refused = 0
ACCEPTED: id=attn-cd1a23c582c623c5 subject=QQQ deepLink=sector-research-lab.html
          decisionWindow=after-hours windowResolvedFrom=session
```

Full output in [report.md](report.md) §E5. The composer, the validator, the context
builder and the lane are all functioning. **The only missing component is the
producer.**

## 9. Why this packet does not implement the fix

The probe in §8 required five values that no committed artifact supplies and that
cannot be derived from data alone:

| Field | Why it is not derivable | What supplying it would mean |
| --- | --- | --- |
| `disposition` | `attention` vs `context` vs `no-action` | deciding what interrupts the reader |
| `severity` | `mild` / `moderate` / `severe` | a loudness scale |
| `imminence` | `imminent` / `developing` / `latent` | a timing model, which also drives the ranking key |
| `marketConfirmation.state` | `present` / `absent` / `partial` | a confirmation rule |
| `transmissionPath` | the channel an effect travels | a transmission model |

`market-brief.config.json` declares numeric thresholds (`rotationFlipWarnZ`,
`regimeChangeVixJump`, `gammaFlipProximityPct`, `notableMemberMinMovePct`) and a
`red-alert-policy/v1` scoring model, but **no mapping from any observed crossing to a
disposition, a severity or an imminence**. That mapping is the detection policy, and
it does not exist in any committed artifact.

Inventing it here would produce gate results that are structurally valid,
provenance-tagged, and encode an agent's invented judgement as observation. That is
the precise failure mode the task forbids: not a synthesized *constant*, but
synthesized *judgement*, which is harder to see and worse. A reader would be
interrupted on a threshold no owner chose.

The decision is also already owner-routed elsewhere:
`specs/026-actionable-brief-brevity-and-cross-asset/spec.md` records this defect as
finding **F-026-1**, declares it **Non-Goal 6**, and leaves **Open Question 1** —
*"Should the attention path be rewired inside this feature or outside it?"* —
unanswered. Choosing here would preempt an open owner decision.

**The correct outcome is `blocked` with the evidence, and that is what this packet
records.** Candidate remedies R1–R5 are enumerated in [design.md](design.md) §4 and
**none is selected**.

## 10. Impact

The brief publishes 127,740 characters of narrative and zero actionable items, four
times a day, and states "Nothing requires attention in this window." That statement
is false in a specific and damaging way: it reports a **structural incapacity** as a
**quiet market**. Under this repository's own product principles, missing data
rendered as a neutral or plausible value is a blocking pattern, not a cosmetic one.

The feedback loop is dead too, and silently: `market-brief.attention-outcomes.jsonl`
is 0 bytes and `market-brief.attention-scorecard.json` reports `closedSample: 0`
against a `minClosedSample` of 20. No interruption rate can ever be computed, so the
tier cannot even measure its own uselessness.

## 11. Severity justification

**High**, not Critical: nothing is red, nothing is corrupted, no false figure is
published, and the deploy channel is open. Not Medium: the brief's single owned
decision surface has been inert for eight days across roughly 32 publication windows;
the surface asserts a false quiet state to the reader; and the condition is invisible
to every mechanical gate the repository has, so absent this packet it would persist
indefinitely.

## 12. Clean-tree evidence

`git status --porcelain` shows **no tracked modification** at HEAD `373f4572d`. The
eight untracked entries are a concurrent session's in-flight work (specs 025 and 026,
the company-intelligence lab) and are unrelated to this finding. Every observation
above was made against committed state. The temporary worktree was removed with
`git worktree remove --force`; `git worktree list` afterwards showed only the primary
checkout.
