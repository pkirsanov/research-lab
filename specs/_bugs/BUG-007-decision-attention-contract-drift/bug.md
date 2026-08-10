# BUG-007 — Decision-Attention Contract Drift In The Committed Brief Payload

**Status:** Fixed upstream, verified not reproducible at HEAD. This packet documents and
closes the finding; it did not author the fix.
**Severity:** Critical (release-blocking while red)
**Reported:** 2026-08-10
**Verified by:** `bubbles.bug`, 2026-08-10, against `<repo-root>`
**Repository binding:** `PREFLIGHT_COMMITTED decision=rb:vscode-237c8ac0756a6f7a2d67045658373c1c:9 revision=9 repository=research-lab`

---

## 1. Symptom

`market-brief.payload.json` carried its `attention[]` tier in the legacy narrative
catalyst shape (`rank, domain, horizon, title, structuralAnchor, what, why, confidence,
deepLink`) instead of the `decision-attention/v1` envelope certified by `rlattention.js`.
Every consumer that reads the tier through the certified contract therefore saw zero
publishable items, and `node scripts/selftest.mjs` ended red with 7 failing assertions.

## 2. Reproduction

Run from the repository root:

```
node scripts/selftest.mjs
```

- **Red state:** commit `cc990911d` (the parent of current `HEAD`).
- **Green state:** commit `aeb1bcbc3` (current `HEAD`).

Reproduced this session in an isolated detached worktree at `cc990911d`, so no working-tree
edit was needed and none was made:

```
git worktree add --detach /tmp/rl-bug007-head1 HEAD~1
cd /tmp/rl-bug007-head1 && node scripts/selftest.mjs
```

## 3. Observed Failure Set — All 7, Enumerated

Measured at `cc990911d`. Summary line: `Research-Lab self-test: 1363 passed, 7 failed`.

| # | Failing assertion (verbatim head of line) | Site |
|---|---|---|
| 1 | `Registry-wide Market Brief coverage selftest includes the registered volatility owner read` | `scripts/selftest.mjs:476` |
| 2 | `current payload satisfies the executable brief contract: attention[0] (id absent).disposition RLATTN-DISPOSITION: …` — 55 violations, 11 per item across all 5 items | payload gate |
| 3 | `every REQUIRED narrative pattern matches a real field in the committed payload — the required list describes this payload, not an imagined one: attention.[].rationale, attention.[].invalidation, attention.[].escalationTrigger` | narrative-pattern check |
| 4 | `the committed brief carries a real decision-attention/v1 tier to rank, every item in a declared decision window (5 item(s))` | `scripts/selftest.mjs:6105` |
| 5 | `every committed attention item is live and publishes under the default card ceiling (0 of 7)` | `scripts/selftest.mjs:6133` |
| 6 | `the card ceiling really bites and suppresses the ranked tail rather than dropping it (0 published, 0 suppressed)` | `scripts/selftest.mjs:6137` |
| 7 | `market-brief.page.json is byte-current with its full source artifacts` | `scripts/selftest.mjs:6209` |

Failures 1–3 were the three lost to terminal scrollback in the original report. They are
recovered here by re-running the suite at the red commit rather than by inference.

The eleven `RLATTN-*` codes raised per item in failure 2 were `RLATTN-DISPOSITION`,
`RLATTN-PRIVACY`, `RLATTN-HEADLINE`, `RLATTN-FALSIFIABILITY`, `RLATTN-VERB`,
`RLATTN-PROVENANCE` (severity), `RLATTN-TRANSMISSION`, `RLATTN-CONFIRMATION`,
`RLATTN-PROVENANCE` (figures), `RLATTN-WINDOW`, `RLATTN-LIFECYCLE`.

## 4. Clean-Tree Evidence

`git status --porcelain` returned empty output both before and after every command run for
this packet, at `HEAD = aeb1bcbc3373cc90cc846fc4bfb577dd9f75c927`. The failures therefore
existed at a committed revision and were never an artifact of local edits. The temporary
worktree used for the red-state reproduction was removed with `git worktree remove --force`
and `git worktree list` afterwards showed only the primary checkout.

## 5. Release-Blocking Impact

The repository's own suite asserts that the GitHub Pages verify job runs the complete
selftest and that no verification job may pass softly. A red suite therefore blocks the
Pages deploy outright — the brief cannot ship while any assertion fails. The user-visible
consequence while red was narrower but worse than a build break: the brief page would have
rendered an empty decision-attention tier, because `selectAttentionItems` published 0 of 5
authored items, so readers would see no attention cards at all rather than an error.

## 6. Severity Justification

Critical rather than High, on three independent grounds. It halts the release channel, not
just a test. It silently empties a user-facing tier rather than failing visibly to the
reader. And it reaches the published artifact through the scheduled authoring lane that
regenerates `market-brief.payload.json` roughly four times daily, so an unguarded
recurrence would republish continuously rather than once.

## 7. Current State At HEAD

Not reproducible. Measured at `HEAD = aeb1bcbc3` on a clean tree:

```
Research-Lab self-test: 1370 passed, 0 failed
SELFTEST_EXIT=0
```

Commit `aeb1bcbc3` ("FR-018: an attention item deep-links to its owning tool, checked
against the registry") recomposed the payload through the certified composer. The
`attention[]` tier now carries 3 `decision-attention/v1` items plus 2 named refusals in
`attentionExclusions[]`. Root cause, family classification, durability analysis and the
residual open observations are in [`design.md`](design.md); the measured evidence blocks
are in [`report.md`](report.md).

## 8. Concurrent Writer — Tree No Longer Clean, Suite No Longer Green

After every measurement above was taken, and while this packet was being authored, a
**concurrent writer** modified two tracked files at 16:16–16:17 UTC:
`market-brief.payload.json` (one added `backdrop.globalBackdrop` narrative entry about
Hormuz oil-risk) and `tests/attention-payload-contract.test.mjs` (+25 lines). Neither edit
was made by this packet, and neither touches the `attention[]` tier.

The suite is consequently red again:

```
  ✗ FAIL: market-brief.page.json is byte-current with its full source artifacts
Research-Lab self-test: 1369 passed, 1 failed
SELFTEST_EXIT=1
```

This is **BUG-007's failure 7 recurring from an unrelated cause**. A read-only rebuild
comparison shows the only differing projected key is `backdrop`; `attention` is byte-current.
It was deliberately **not** repaired here: regenerating `market-brief.page.json` would fold
another session's uncommitted narrative edit into this packet. Recorded as OBS-007-04.

The green measurement in §7 stands as recorded — it was taken at clean `HEAD` before these
edits existed. It must not be read as a claim about the tree right now.
