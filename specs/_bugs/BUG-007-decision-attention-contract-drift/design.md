# Design: BUG-007 — Root Cause, Family Classification, And Durable Control

## 1. Root Cause

`market-brief.payload.json → attention[]` was authored in the legacy narrative catalyst
shape and never passed through the certified composer before being committed.

Measured across the two revisions:

| Revision | `attention[]` | Items carrying `contractVersion` | Items in a declared window | `attentionExclusions` |
|---|---|---|---|---|
| `cc990911d` (`HEAD~1`, red) | 5 items | 0 | 0 | absent (`undefined`) |
| `aeb1bcbc3` (`HEAD`, green) | 3 items | 3 | 3 | 2 entries |

At the red revision the item keys were exactly `rank, domain, horizon, title,
structuralAnchor, what, why, confidence, deepLink` — the nine catalyst keys, and nothing
else. `rlattention.js` requires an envelope carrying `id`, `contractVersion`, `subject`,
`headline`, `state`, `decisionWindow`, `imminence`, `severity` and `transmissionPath`. None
of those existed, so `RLATTN.selectAttentionItems` published 0 of 5. Every downstream
assertion that reads the tier through the certified surface then failed as a consequence of
that one fact.

The defect is a **contract boundary that was crossed by authorship, not by code**. Neither
`rlattention.js` nor the selector was wrong; the artifact handed to them was authored to a
different contract than the one they enforce.

## 2. Failure Family Classification — Determined, Not Assumed

The seven failures were checked against each other rather than grouped by resemblance. They
collapse into **one root cause with three propagation paths**. Family (b) is a strict
consequence of family (a); it is not independent.

### Family (a1) — the payload gate rejects the legacy items

Failures 1, 2 and 3. `validateBriefPayload` walks `attention[]` and raises the full
`RLATTN-*` set per item: 11 codes × 5 items = 55 violations. Failure 1 looks unrelated from
its title — it is the volatility-owner coverage assertion — but its predicate at
`scripts/selftest.mjs:473-476` ends in `briefErrors.length === 0`, where `briefErrors` is
the payload-gate result. It failed for the attention violations, not for anything about the
volatility tool. Failure 3 is the required-narrative-pattern check reporting
`attention.[].rationale`, `attention.[].invalidation` and `attention.[].escalationTrigger`
as patterns with no matching field — those three are envelope keys the legacy shape does
not carry.

### Family (a2) — the ranking and ceiling assertions read the real committed tier

Failures 4, 5 and 6. These read `market-brief.payload.json` directly rather than a fixture,
which is why they detected the drift at all. Failure 5 reports `0 of 7` and failure 6
reports `0 published, 0 suppressed` — both are the same zero-publication consequence
observed one step further down.

### Family (b) — the stale page projection

Failure 7. **It is a consequence of (a), and this was established rather than assumed.**
Three measurements settle it:

1. `scripts/build-brief-page-artifacts.mjs:38` reads `attention: payload.attention`. The
   projection is a direct copy, with no independent attention source.
2. `market-brief.page.json` is **byte-identical at `HEAD` and `HEAD~1`**, and at `HEAD~1` it
   already carried the 3 composed `decision-attention/v1` items while its own source payload
   still carried the 5 legacy ones. The projection was ahead of its source, so the rebuild
   comparison could not match.
3. Commit `aeb1bcbc3` does not touch `market-brief.page.json` at all — its file list is
   `market-brief.payload.json`, `rlattention.js`, `scripts/build-attention-items.mjs`, a
   spec report and `tests/rlattention.test.mjs`. Recomposing the payload alone turned
   failure 7 green. A byte-currency failure that is repaired by changing only the source is
   by definition a consequence of the source.

The counter-hypothesis — that failure 7 was independent, caused by the FX tool registration
the way commit `6253ca100` was — is **refuted** by measurement 3. An independent staleness
would have required a `page.json` edit to clear, and none occurred.

**Scope limit on that conclusion, demonstrated live.** Failure 7 is a *general* staleness
detector over every projected key, not an attention-specific assertion. It was consequent on
family (a) at `HEAD~1`; it is not consequent on family (a) by nature. A concurrent writer
proved this during the authoring of this packet by adding a `backdrop.globalBackdrop` entry
to `market-brief.payload.json` without rebuilding the projection, turning failure 7 red again
with `attention` byte-current and only `backdrop` differing. Both statements hold: the
`HEAD~1` instance was caused by the attention drift, and the assertion can also fire for any
other payload key. See OBS-007-04.

### Consequence for remediation

Because all seven collapse to one cause, there is exactly one repair and six derived
confirmations. Fixing the payload shape closed every failure at once, which is what the
measured `1370 passed, 0 failed` at `HEAD` shows.

## 3. Fix Design

### 3.1 What the fix must not be

A hand-edit of `market-brief.payload.json`. The lifecycle constraint is decisive: the
authoring lane regenerates that artifact roughly four times daily per the runbook
`notes/market-brief.md`. A repaired byte sequence survives until the next scheduled run and
then reverts. Any remedy whose only artifact is the payload file is transient by
construction.

### 3.2 What the fix is — named explicitly

The fix changes **the publish path**, and the **runbook contract** records it. It does not
change the artifact projection step, and it does not rely on the committed bytes.

**Publish path.** `scripts/brief-refresh-and-push.sh:386` runs

```
&& "$NODE_BIN" scripts/build-attention-items.mjs --recompose --write \
```

positioned deliberately between the narrative lane (`brief-narrative-parallel.mjs`, line
385) and the payload gate (`validate-brief-payload.mjs`, line 387), inside the same `&&`
chain that governs the retry. The ordering is the whole design: `lane (judgement) →
composer (envelope) → validator (refusal)`. The lane can no longer emit a bad envelope
because it no longer emits the envelope at all — it authors only the falsifiability
judgement (`headline`, `invalidation`, `escalationTrigger`, `expiry`, `rationale`, and the
four enums), and the script composes each `decision-attention/v1` envelope from that
judgement plus the committed window, transmission, provenance and lifecycle contracts in
`rlattention.js`. `decisionWindow` is taken from the payload's own `window`, never authored,
so the window a reader sees is always the window the brief was generated for.

**Runbook contract.** `notes/market-brief.md` §3b, lines 125–132, names the step at its real
pipeline position, and lines 583–591 record that `attention[]` is two contracts in one
object with the lane authoring neither whole. `scripts/build-attention-items.mjs` is listed
as "step 3b" among the pipeline sources at line 656.

**Artifact projection step: unchanged, and deliberately so.** `build-brief-page-artifacts.mjs`
copies `payload.attention` verbatim. Teaching the projection to repair or filter its input
would give the system two places that decide what a valid attention item is, and the
projection would then mask exactly the drift this bug is about. The projection stays a dumb
copy; correctness is enforced once, upstream.

### 3.3 Why this choice is durable against the next 4×/day regeneration

The composer sits **inside the regeneration path**, not beside it. Every scheduled run that
produces a payload also runs the composer, so the property is re-established on each
regeneration rather than being a state the repository must remember. Three properties make
that hold under failure as well as under success:

- **Additive-or-nothing.** The step refuses to write if a pre-existing payload key would be
  lost, so it cannot silently truncate a payload it does not fully understand.
- **A refusal is not a run failure.** It exits 0 when it refuses a candidate, because
  refusing one is a correct outcome; the refusal is recorded in `attentionExclusions[]` with
  its `RLATTN-*` code. A genuine build error exits non-zero, the `&&` chain fails, and the
  attempt retries with the payload restored.
- **The gate runs after.** `validate-brief-payload.mjs` executes downstream of the composer
  in the same chain, so a payload the composer could not bring into contract is caught
  before publication rather than after.

### 3.4 Verified residual exposure

The composer's `exit 0`-on-refusal behavior means a run in which the composer refuses
**every** candidate would still exit 0. The scope note for the step already declares the
control for that case: a run that publishes zero with zero recorded exclusions is a failure.
That control is stated in the scope; whether it is enforced mechanically anywhere on the
publish path was **not** verified in this session and is recorded as an open observation
rather than a claim.

## 4. Named Permanent Regression Guard

The guard the bug calls for already exists, is named, and was measured to be non-vacuous.
No new guard was authored, because authoring a second one would create a duplicate authority
over the same property.

**Guard:** `scripts/selftest.mjs:6103-6106`

```
'the committed brief carries a real decision-attention/v1 tier to rank, every item in a
 declared decision window (' + N + ' item(s))'
```

Its predicate requires `Array.isArray(committedTier) && committedTier.length >= 3`, every
item `contractVersion === RLATTN.CONTRACT_VERSION`, and every `decisionWindow` present in
`RLATTN.DECISION_WINDOWS`.

Three properties make it the right guard:

1. **It reads the real committed artifact,** `market-brief.payload.json`, not a fixture. A
   regenerated payload is therefore checked as-published. A fixture-based guard would have
   stayed green through this entire defect.
2. **It fails by name.** The message states the contract version and the item count, so a
   legacy-shape republication produces `… (5 item(s))` rather than an anonymous type error.
3. **It is non-vacuous, measured differentially.** Evaluating the exact predicate against
   both revisions: `HEAD~1` → FAIL, 5 items, 0 carrying `contractVersion`, 0 in a declared
   window; `HEAD` → PASS, 3 items, 3 carrying `contractVersion`, 3 in a declared window. The
   guard distinguishes the two shapes rather than accepting both.

Two further guards cover the same property from different angles and were also red at
`HEAD~1`: the payload-gate assertion at `scripts/selftest.mjs:473-476`, which fails on any
`RLATTN-*` violation, and the ceiling assertions at `:6131-6140`, which fail when the tier
publishes nothing. `tests/attention-payload-contract.test.mjs` is a fourth, run separately
from the selftest and not executed in this session.

## 5. Open Observations — Recorded, Not Claimed

**OBS-007-01 — `market-brief.snapshot.json` carries no `attention` key.** Measured:
`snapshot.attention` is `undefined`, while `payload.attention` is a 3-item array. The two
artifacts do disagree about whether the tier exists. Whether that is a defect was **not**
established. The brief page projects attention from the payload, and
`build-brief-page-artifacts.mjs` reads `payload.attention` with no snapshot fallback, so the
absence may be correct by design. Recorded as an open question for the spec-017 owner, not
as a finding against this bug.

**OBS-007-02 — all-refusal runs.** See §3.4. The zero-published-zero-excluded failure
condition is declared in the scope for `scripts/build-attention-items.mjs`; its mechanical
enforcement on the publish path was not verified here.

**OBS-007-03 — the fix landed outside this packet.** Commit `aeb1bcbc3` was authored under
`specs/017-decision-attention-and-developing-situations`, whose `state.json` is
`in_progress` under an explicit certification refusal naming four surviving blockers. None
of those blockers is this defect, and this bug asserts nothing about that spec's
certification.

**OBS-007-04 — the suite is red right now from a concurrent, unrelated edit.** A concurrent
writer modified `market-brief.payload.json` and `tests/attention-payload-contract.test.mjs`
at 16:16–16:17 UTC, after every measurement in this packet was taken. `node
scripts/selftest.mjs` now returns `1369 passed, 1 failed`, exit 1, on the single assertion
`market-brief.page.json is byte-current with its full source artifacts`. A read-only rebuild
comparison isolates the cause: the only differing projected key is `backdrop`, from an added
`globalBackdrop` narrative entry; `attention` is byte-current, so BUG-007's own defect has
**not** returned. It was not repaired here because rebuilding the projection would commit
another session's uncommitted narrative work through this packet, and because the edit is
plainly in flight. Owner: whoever holds the concurrent session. The remedy is the ordinary
one — regenerate the page artifacts after the payload edit, before committing.

## Capability Proportionality

### Single-Implementation Justification

One implementation exists and one is correct.

The empty-tier floor lives in a single place, `scripts/validate-brief-payload.mjs`, inside
`validateBriefPayload`, immediately after the existing card-ceiling check and before the
per-item `attentionContext` validation. It is deliberately co-located with the other tier-level
rules rather than extracted, because extracting it would separate a seven-line invariant from
the checks it sits between and make the ordering harder to see, not easier.

A second implementation would be justified only if a second publication surface had to enforce
the same rule. None does. The composer `scripts/build-attention-items.mjs` runs *before* this
gate and is the producer, not a second enforcer; `scripts/selftest.mjs:6117` asserts a related
but distinct property against the *committed* payload, and that separation is intentional and
recorded — a second enforcement of the identical property would duplicate authority over one
invariant, which is the failure mode noted as C4 in `report.md`.

No variation axes are declared because there is nothing to vary: the rule takes no options, has
no per-environment behavior, and admits no alternative strategy. Its only design choice —
whether to read `attentionExclusions` defensively — was resolved in `9606b04a` by making the
check self-contained rather than configurable.
