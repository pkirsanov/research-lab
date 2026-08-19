# User Validation: BUG-009 — Decision-Attention Gate-Result Producer Absent

## How to read this checklist

This packet is `blocked` and implemented nothing. Following the BUG-004 / BUG-005 /
BUG-006 convention, a checked box below means **the acceptance question has been
recorded and evidenced in this packet**. It explicitly does **not** claim the
repository satisfies it. These are not DoD boxes; the DoD boxes live in
[scopes.md](scopes.md) and every one of them is unchecked.

Where a question is answered by executed evidence, the answer is stated. Where it is
an open owner decision, that is stated instead.

---

## Checklist

### [Finding] The feed is unreachable, not quiet

- [x] **What:** The decision-attention tier has published zero items since 2026-08-10 because no component produces the observed `gateResult` the contract requires.
  - **Steps:**
    1. `node -e` parse `market-brief.payload.json` and read `.attention` and `.attentionExclusions`
    2. Observe `attention` length 0 and every exclusion `RLATTN-PROVENANCE` on `gateResult`
    3. Compose a candidate carrying only the nine lane-authored judgement keys through `buildAttentionItems`
  - **Expected:** the candidate is refused `RLATTN-PROVENANCE:gateResult`, proving the lane contract and the composer contract are mutually unsatisfiable
  - **Verify:** `report.md` §E3 and §E4
  - **Evidence:** report.md#e4-reproduction-a-lane-contract-conformant-candidate-is-refused
  - **Notes:** Reproduced in an isolated detached worktree. No working-tree mutation.

### [Correction] The builder is running, not unwired

- [x] **What:** The reported claim that `scripts/build-attention-items.mjs` has no scheduled caller is refuted.
  - **Steps:**
    1. `grep -rn 'build-attention-items' scripts .github/workflows package.json`
    2. Observe the caller at `scripts/brief-refresh-and-push.sh:514`
    3. Observe that `attentionExclusions` is populated on every generation, which only the builder writes
  - **Expected:** the builder is reached and executes every publication window, and refuses every candidate
  - **Verify:** `report.md` §E2 and §E3
  - **Evidence:** report.md#e2-the-builder-does-have-a-caller-and-it-is-not-the-ci-schedule
  - **Notes:** This correction decides the remedy. Rewiring an already-running builder would change nothing.

### [Hypothesis] BUG-007 regression escape — CONFIRMED

- [x] **What:** BUG-007 restored contract conformance without restoring the capability, and added no test that the capability is reachable.
  - **Steps:**
    1. `grep -c 'gateResult'` over all eight BUG-007 artifacts
    2. Observe zero occurrences, including in the 97 KB `state.json`
    3. Compare the BUG-007 green commit `aeb1bcbc3` (semantic `RLATTN-OVERLAP` refusals) with every later run (structural `RLATTN-PROVENANCE` refusals)
  - **Expected:** BUG-007 never examined the observed half of the contract
  - **Verify:** `report.md` §E7 and §E8
  - **Evidence:** report.md#e7-bug-007-never-examined-the-observed-half
  - **Notes:** Refinement recorded in `bug.md` §6 — BUG-007 did not break a working feed; the capability was always absent and BUG-007 made the absence visible in the payload and invisible in the suite.

### [Finding] Both mechanical gates are green while the feed is dead

- [x] **What:** `node scripts/selftest.mjs` reports `2843 passed, 0 failed` and `node scripts/validate-brief-payload.mjs` reports `PASS`, with the tier unreachable.
  - **Steps:**
    1. Run `node scripts/selftest.mjs` from the repository root
    2. Run `node scripts/validate-brief-payload.mjs market-brief.payload.json`
  - **Expected:** both exit 0, because an empty array is contract-valid
  - **Verify:** `report.md` §E6
  - **Evidence:** report.md#e6-both-mechanical-gates-are-green-while-the-feed-is-dead
  - **Notes:** A contract-conformance test cannot detect a capability that produces nothing, because producing nothing is conformant.

### [Finding] The composer is not broken

- [x] **What:** A gate result assembled from real committed tool-read state is accepted: `built=1, refused=0`.
  - **Steps:**
    1. Read `payload.toolReads["sector-research-lab"]` unmodified
    2. Assemble a gate result from its real `asOf`, real `rsMom1m`, real `sourceId`
    3. Pass it through the unmodified composer
  - **Expected:** an accepted `decision-attention/v1` envelope with a composer-resolved `deepLink` and a session-resolved decision window
  - **Verify:** `report.md` §E5
  - **Evidence:** report.md#e5-control-the-composer-accepts-a-gate-result-from-real-committed-state
  - **Notes:** In-memory and non-mutating. Nothing was written to any payload. This proves the missing piece is exclusively the producer; it does **not** prove a producer is buildable without an owner policy decision.

### [Open decision] The detection policy does not exist

- [x] **What:** Which observed crossings map to which `disposition`, `severity` and `imminence` is declared in no committed artifact.
  - **Steps:**
    1. Read `market-brief.config.json` `thresholds` and `red-alert-policy/v1`
    2. Observe numeric thresholds and a scoring model, but no mapping to a gate disposition
  - **Expected:** an implementer choosing this mapping would be inventing product policy and publishing invented judgement as observation
  - **Verify:** `bug.md` §9, `design.md` §4 R1
  - **Evidence:** bug.md#9-why-this-packet-does-not-implement-the-fix
  - **Notes:** **OWNER DECISION REQUIRED.** This is why the packet is `blocked` rather than fixed.

### [Open decision] Where this work lives

- [x] **What:** `specs/026-actionable-brief-brevity-and-cross-asset/` records this defect as F-026-1, declares it Non-Goal 6, and leaves Open Question 1 unanswered.
  - **Steps:**
    1. Read spec 026 findings F-026-1 and Open Question 1
    2. Observe that spec 026 explicitly defers the decision
  - **Expected:** ownership is unassigned and choosing here would preempt an open owner decision
  - **Verify:** `bug.md` §9, `scopes.md` Scope 1
  - **Evidence:** scopes.md#scope-1-owner-decision-on-remedy-direction
  - **Notes:** **OWNER DECISION REQUIRED.** Note also that spec 026's F-026-1 repeats the refuted "no scheduled caller" framing; routed as `DISC-009-003`.

### [Open item] The scheduled job cannot publish the payload

- [x] **What:** `.github/workflows/tier-a.yml` omits `market-brief.payload.json` from its `git add` list and never references `scripts/brief-refresh-and-push.sh`.
  - **Steps:**
    1. `grep -n 'market-brief.payload.json' .github/workflows/tier-a.yml` → no match
    2. `git log --format='%an | %s' -- market-brief.payload.json` → operator-authored refresh commits only
  - **Expected:** the scheduled CI job could not publish an attention feed even if a producer existed
  - **Verify:** `report.md` §E10, `design.md` §6
  - **Evidence:** report.md#e10-the-scheduled-job-cannot-publish-the-payload
  - **Notes:** Routed as `DISC-009-004`. Must be resolved by any remedy that places attention production on the scheduled path.

### [Constraint] Nothing was fabricated and nothing was implemented

- [x] **What:** No source file was modified, no test was added, and `market-brief.payload.json` was not edited.
  - **Steps:**
    1. `git status --porcelain` before and after every command
    2. Observe no tracked modification at HEAD `373f4572d`
  - **Expected:** the eight untracked entries belong to a concurrent session and are unrelated
  - **Verify:** `report.md` §E11
  - **Evidence:** report.md#e11-clean-tree-evidence
  - **Notes:** An empty honest feed is correct; a populated invented one is not. That constraint outranked restoring the feed.
