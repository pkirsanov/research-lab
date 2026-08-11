# User Validation: BUG-007 — Decision-Attention Contract Drift

Items are checked `[x]` when this run measured them directly. Uncheck any item you find does
not hold — an unchecked item is a reported regression, and only you uncheck.

## Checklist

### [Verification] BUG-007 The committed attention tier satisfies decision-attention/v1

- [x] **What:** The committed brief publishes a real decision-attention tier, and the suite is green.
  - **Steps:**
    1. From the repository root, confirm the tree is clean with `git status --porcelain` (no output).
    2. Run `node scripts/selftest.mjs`.
  - **Expected:** `0 failed`, exit code 0. The total grows as scenarios are added, so the
    count is not the criterion: it read `1370 passed` when this item was written on
    2026-08-10 at HEAD `aeb1bcbc3`, and `1401 passed` at packet closure. If you run it now,
    expect a number at least that high with `0 failed`.
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
  - **Notes:** Still an owner decision, so it stays unchecked — an agent must not answer it on
    the owner's behalf. **The premise has since been investigated**, so the decision can now be
    made on evidence rather than on an open question: `build-brief-page-artifacts.mjs` reads
    `payload.attention` directly with **no snapshot fallback**, so the snapshot carrying no
    `attention` key is the expected shape rather than a disagreement between artifacts.
    Recorded as OBS-007-01, resolved as *correct by design, not a defect*. Nothing was changed.
    This is not a reported regression.

- [ ] **What:** Decide whether an all-refusal composer run must fail the publish.
  - **Steps:**
    1. Read the zero-published-zero-excluded rule declared in the spec-017 scope 06 scope file.
    2. Determine whether anything on the publish path enforces it mechanically.
  - **Expected:** an owner decision, recorded against spec 017.
  - **Verify:** owner decision
  - **Evidence:** [design.md](design.md) §5 OBS-007-02
  - **Notes:** Still an owner decision about intended policy, so it stays unchecked. **The
    factual half is now settled**: enforcement was verified to exist nowhere on the publish
    path — the composer's accounting throw passes trivially at `0 + 0 === 0` — and that gap was
    closed. A floor check was added to `scripts/validate-brief-payload.mjs` in `2802b90a` and
    hardened in `9606b04a`, so an all-refusal run now fails the publish *by name*. It is proven
    load-bearing by mutation: `not ok 30 - SCN-017-067 An empty attention tier with no recorded
    exclusions is refused`. What remains for the owner is only whether that is the policy they
    want. Recorded as OBS-007-02. This is not a reported regression.
