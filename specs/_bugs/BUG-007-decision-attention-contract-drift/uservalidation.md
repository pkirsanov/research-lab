# User Validation: BUG-007 — Decision-Attention Contract Drift

Items are checked `[x]` when this run measured them directly. Uncheck any item you find does
not hold — an unchecked item is a reported regression, and only you uncheck.

## Checklist

### [Verification] BUG-007 The committed attention tier satisfies decision-attention/v1

- [x] **What:** The committed brief publishes a real decision-attention tier, and the suite is green.
  - **Steps:**
    1. From the repository root, confirm the tree is clean with `git status --porcelain` (no output).
    2. Run `node scripts/selftest.mjs`.
  - **Expected:** `Research-Lab self-test: 1370 passed, 0 failed`, exit code 0.
  - **Verify:** terminal
  - **Evidence:** [report.md](report.md) §E3
  - **Notes:** Measured at `HEAD = aeb1bcbc3` on 2026-08-10.

- [x] **What:** Every committed attention item carries the certified contract and a declared window.
  - **Steps:**
    1. Open `market-brief.payload.json` and read `attention[]`.
    2. Check each item for `contractVersion: "decision-attention/v1"` and a `decisionWindow`
       from `pre-market`, `morning`, `pre-close`, `after-hours`.
  - **Expected:** 3 items, all conforming, plus 2 named refusals in `attentionExclusions[]`.
  - **Verify:** file inspection
  - **Evidence:** [report.md](report.md) §E6

- [x] **What:** The defect reproduces at the prior revision, so the guard is real.
  - **Steps:**
    1. `git worktree add --detach /tmp/rl-bug007-check HEAD~1`
    2. `cd /tmp/rl-bug007-check && node scripts/selftest.mjs`
    3. `git worktree remove /tmp/rl-bug007-check --force`
  - **Expected:** `1363 passed, 7 failed`, with the seven assertions listed in
    [bug.md](bug.md) §3.
  - **Verify:** terminal
  - **Evidence:** [report.md](report.md) §E4

- [x] **What:** The composer runs inside the regeneration path, so the property survives the
      next scheduled publish.
  - **Steps:**
    1. Read `scripts/brief-refresh-and-push.sh` around line 386.
    2. Read `notes/market-brief.md` step 3b, lines 125–132.
  - **Expected:** `build-attention-items.mjs --recompose --write` sits between
    `brief-narrative-parallel.mjs` and `validate-brief-payload.mjs` in the same `&&` chain,
    and the runbook names it at that position.
  - **Verify:** file inspection
  - **Evidence:** [report.md](report.md) §E9

### [Open] Items this run did not settle

- [ ] **What:** Decide whether `market-brief.snapshot.json` should carry an `attention` key.
  - **Steps:**
    1. Confirm `snapshot.attention` is `undefined` while `payload.attention` has 3 items.
    2. Decide whether the snapshot is meant to carry the tier at all.
  - **Expected:** an owner decision, recorded against spec 017.
  - **Verify:** owner decision
  - **Evidence:** [design.md](design.md) §5 OBS-007-01
  - **Notes:** Unchecked because the question was posed, not answered. This is not a
    reported regression.

- [ ] **What:** Decide whether an all-refusal composer run must fail the publish.
  - **Steps:**
    1. Read the zero-published-zero-excluded rule declared in the spec-017 scope 06 scope file.
    2. Determine whether anything on the publish path enforces it mechanically.
  - **Expected:** an owner decision, recorded against spec 017.
  - **Verify:** owner decision
  - **Evidence:** [design.md](design.md) §5 OBS-007-02
  - **Notes:** Unchecked because enforcement was not verified. This is not a reported
    regression.
