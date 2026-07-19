# Scope 08 Report: Window-Aware Final Aggregation

**Status:** Done

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

**Phase:** implement · **Agent:** bubbles.implement · **Certified:** false (pending bubbles.validate)

## Summary

Scope 08 window-aware final aggregation is implemented and validated in the working tree. The additive
Scope 08 surface is `rlcontracts.js` (`compactFinalAuthorInput`, `evaluateLowNoiseGate`,
`validateFinalBrief`, the `WINDOW_POLICY` four-window contract, `validateWindowHeader`, and
`FinalSourceEnvelope/v1` construction), `scripts/brief-author.mjs` (`buildFinalAuthorRequest` +
`validateAuthorEnvelope` final path), `scripts/brief-refresh.mjs` (frozen-registry final barrier
orchestration), and the additive Scope 08 selftest group in `scripts/selftest.mjs`, plus the four new
`tests/distributed-briefs.final*.mjs` files and `tests/fixtures/feature-002/final/`. One registry-complete
`FinalBrief` is authored only after every derived source read and source brief validates; the bounded
input retains every participant, owner interpretation, evidence cutoff, lifecycle/group/conflict decision,
and window policy while excluding raw history and never self-consuming the aggregator. Counts are DERIVED
from the frozen registry (23 participants / 22 sources remain a current-repository canary only). The four
scheduled windows apply cutoff-relevant evidence policy, and the low-noise gate keeps an unsupported
unusual observation as bounded context that consumes no action slot and adds no confidence.

## Decision Record

- The Scope 08 code and tests were delivered in a prior run; this run performed DoD closeout only. Per the
  Change Boundary, no production/test/fixture byte was rewritten. Both scenario RED-before-GREEN cycles used
  controlled in-place mutation of `rlcontracts.js` reversed byte-exact via the IDE edit tool and confirmed
  by sha256 equality with the pre-mutation baseline (the Scope 08 surface is uncommitted, so `git checkout`
  would have destroyed the implementation — sha256-verified reverse-edit is the byte-exact restore path).
- Consumer sweep confirmed the Scope 08 final surfaces are ADDITIVE: no existing Market Brief consumer
  (`rlbrief.js`, `rldata.js`, `rlapp.js`, `market-brief.payload.json`, `market-brief.snapshot.json`) is
  repointed to the new final functions. The legacy Market Brief authoring path is unchanged; distributed-brief
  cutover is Scope 09. No code change was required by either sweep.

## Completion Statement

Complete for the implement phase. Every Scope 08 DoD item is met with the reproducible current-session
evidence recorded under [Test Evidence](#test-evidence). Certification of `certification.*` and feature
status remains owned by `bubbles.validate`.

## Code Diff Evidence

The Scope 08 working-tree surface is exactly (from `git status --porcelain`):

```
 M rlcontracts.js
 M scripts/brief-author.mjs
 M scripts/brief-refresh.mjs
 M scripts/selftest.mjs
?? tests/distributed-briefs.final-author.functional.mjs
?? tests/distributed-briefs.final.e2e.mjs
?? tests/distributed-briefs.final.integration.mjs
?? tests/distributed-briefs.final.unit.mjs
?? tests/fixtures/feature-002/final/
```

Byte-identity audit after both RED-before-GREEN cycles (production files restored byte-exact; unchanged
by closeout):

```
$ shasum -a 256 rlcontracts.js scripts/brief-author.mjs scripts/brief-refresh.mjs scripts/selftest.mjs
2e304d44af723328e4c1e5b110e759cf788114dd554ac51652ea13a243c04a16  rlcontracts.js
ed883c197b10d142073c921c3cff42ec2998117ac412856d59e681e7e8a65dfb  scripts/brief-author.mjs
f850ee89d4daa6f67fdf4a0122dd217b5c698e884ae35590aa214bbe1bf9a19c  scripts/brief-refresh.mjs
6783edb297831fcc8fc97ba362850bba3a104df169e39ef06485553a881014b5  scripts/selftest.mjs
```

No source/owner formula, registry/read/tool-author/lifecycle module, storage projection, scheduler, or UI
file was changed. Shared-infrastructure files (`rlbrief.js`, `rldata.js`, `rlapp.js`, `rlg.js`, `rlchart.js`,
`rlnav.js`, `tools.json`, `index.html`, `market-brief.payload.json`, `market-brief.snapshot.json`) reported
zero modification under `git status --porcelain`.

## Test Evidence

All commands below were executed this session from the repository root
(`/Users/pkirsanov/Projects/research-lab`). **Claim Source: executed.**

### RED-before-GREEN — SCN-002-025 (final compaction retains every source owner ref + window field)

RED — controlled mutation of the fail-closed coverage refusal in `rlcontracts.js::compactFinalAuthorInput`
(reason `"final-source-read-missing"` → `"final-source-read-omitted"`):

```
$ node --test tests/distributed-briefs.final.unit.mjs ; echo "SCN025_RED_EXIT=$?"
✖ SCN-002-025: final compaction retains every source owner ref and window-required field
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
    actual: 'final-source-read-omitted',
    expected: 'final-source-read-missing',
    at tests/distributed-briefs.final.unit.mjs:64:10
ℹ tests 2  ℹ pass 1  ℹ fail 1
SCN025_RED_EXIT=1
```

GREEN — mutation reversed byte-exact (sha256 == baseline), test passes:

```
$ shasum -a 256 rlcontracts.js && node --test tests/distributed-briefs.final.unit.mjs ; echo "SCN025_GREEN_EXIT=$?"
2e304d44af723328e4c1e5b110e759cf788114dd554ac51652ea13a243c04a16  rlcontracts.js
✔ SCN-002-025: final compaction retains every source owner ref and window-required field
✔ SCN-002-027: low-noise gate requires owner plus structural persistence or independent corroboration
ℹ tests 2  ℹ pass 2  ℹ fail 0
SCN025_GREEN_EXIT=0
```

### RED-before-GREEN — SCN-002-027 (low-noise gate: owner + persistence/corroboration)

RED — controlled mutation of the distinct-fingerprint persistence check in
`rlcontracts.js::evaluateLowNoiseGate` (`Object.keys(distinct).length >= 3` → `fingerprints.length >= 3`,
so three repeated identical fingerprints wrongly earn persistence credit):

```
$ node --test tests/distributed-briefs.final.unit.mjs ; echo "SCN027_RED_EXIT=$?"
✔ SCN-002-025: final compaction retains every source owner ref and window-required field
✖ SCN-002-027: low-noise gate requires owner plus structural persistence or independent corroboration
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
    actual: 'action',
    expected: 'context',
    at tests/distributed-briefs.final.unit.mjs:100:10
ℹ tests 2  ℹ pass 1  ℹ fail 1
SCN027_RED_EXIT=1
```

GREEN — mutation reversed byte-exact (sha256 == baseline), test passes:

```
$ shasum -a 256 rlcontracts.js && node --test tests/distributed-briefs.final.unit.mjs ; echo "SCN027_GREEN_EXIT=$?"
2e304d44af723328e4c1e5b110e759cf788114dd554ac51652ea13a243c04a16  rlcontracts.js
✔ SCN-002-025: final compaction retains every source owner ref and window-required field
✔ SCN-002-027: low-noise gate requires owner plus structural persistence or independent corroboration
ℹ tests 2  ℹ pass 2  ℹ fail 0
SCN027_GREEN_EXIT=0
```

### Focused Scope 08 suite (TP-08-01 … TP-08-07) — all four final test files GREEN

```
$ node --test tests/distributed-briefs.final.unit.mjs tests/distributed-briefs.final-author.functional.mjs \
        tests/distributed-briefs.final.integration.mjs tests/distributed-briefs.final.e2e.mjs
✔ Final author omission hidden conflict unsupported action unsafe text and budget mutations are rejected
✔ Regression: SCN-002-025 pre-market morning pre-close and after-hours use only cutoff-relevant owner evidence
✔ Regression: SCN-002-027 unsupported unusual evidence remains educational context with zero action-slot impact
✔ complete 23-participant final input consumes all 22 owner-read and source-brief outcomes after the barrier
✔ owner disputes thin baselines and shared source origins remain context or conflict
✔ SCN-002-025: final compaction retains every source owner ref and window-required field
✔ SCN-002-027: low-noise gate requires owner plus structural persistence or independent corroboration
ℹ tests 7  ℹ suites 0  ℹ pass 7  ℹ fail 0  ℹ duration_ms 544.984833
```

Test-Plan row mapping (each row GREEN above):

| Row | Type | Title (exact) |
| --- | --- | --- |
| TP-08-01 | Unit | `SCN-002-025: final compaction retains every source owner ref and window-required field` |
| TP-08-02 | Unit | `SCN-002-027: low-noise gate requires owner plus structural persistence or independent corroboration` |
| TP-08-03 | Functional | `Final author omission hidden conflict unsupported action unsafe text and budget mutations are rejected` |
| TP-08-04 | Integration | `complete 23-participant final input consumes all 22 owner-read and source-brief outcomes after the barrier` |
| TP-08-05 | Integration | `owner disputes thin baselines and shared source origins remain context or conflict` |
| TP-08-06 | Regression E2E | `Regression: SCN-002-025 pre-market morning pre-close and after-hours use only cutoff-relevant owner evidence` |
| TP-08-07 | Regression E2E | `Regression: SCN-002-027 unsupported unusual evidence remains educational context with zero action-slot impact` |

### TP-08-08 — broader author-lifecycle-history-final E2E regression GREEN

```
$ node --test tests/distributed-briefs.authorship.e2e.mjs tests/distributed-briefs.history.e2e.mjs \
        tests/distributed-briefs.final.e2e.mjs ; echo "TP0808_EXIT=$?"
✔ Regression: SCN-002-004 all 22 source reads reach one truthful validated brief outcome
✔ Regression: SCN-002-005 unchanged and duplicate work creates no author prose event or cost churn
✔ Regression: SCN-002-006 recommendation lifecycle preserves prior terms merges origins and exposes conflicts
✔ Regression: SCN-002-025 pre-market morning pre-close and after-hours use only cutoff-relevant owner evidence
✔ Regression: SCN-002-027 unsupported unusual evidence remains educational context with zero action-slot impact
✔ Regression: SCN-002-007 one tool current and monthly history resolve without unrelated narrative reads
✔ Regression: SCN-002-008 duplicate projection index rebuild and rollback preserve append-only authority
ℹ tests 7  ℹ suites 0  ℹ pass 7  ℹ fail 0
TP0808_EXIT=0
```

### TP-08-09 — baseline repository selftest GREEN (633 / 0)

```
$ node scripts/selftest.mjs
============================================================
Research-Lab self-test: 633 passed, 0 failed
```

(Was 624 before Scope 08; +9 for the additive Scope 08 selftest group. Zero failed proves no existing
product invariant regressed.)

### Four-window policy matrix (`rlcontracts.js::WINDOW_POLICY`, derived — validated by TP-08-06)

| Window | priorWindow | requiresOfficialClose | forbidsOfficialClose | Cutoff-relevant policy proven by TP-08-06 |
| --- | --- | --- | --- | --- |
| pre-market | `null` | false | false | overnight context, already-released reports, current pre-market evidence, open scenarios; post-cutoff evidence absent |
| morning | `pre-market` | false | false | regular tape + same-date published pre-market owner thesis reference only |
| pre-close | `null` | false | **true** | current partial regular evidence + labeled overnight implications; no premature official close |
| after-hours | `null` | **true** | false | official regular close retained separately + indicative post-close evidence + released reactions + next explicit open |

`validateWindowHeader` enforces `requiresOfficialClose`/`forbidsOfficialClose` and the `priorWindowThesisRef`
window/date match; official regular close is a distinct `officialCloseAnchorRef`, never an extended-hours
`close` label.

## Consumer Impact Sweep

Inventory + anti-pattern search (read-only `grep` over real files this session):

- **Final-function consumers** — `grep` for `compactFinalAuthorInput|validateFinalBrief|evaluateLowNoiseGate|buildFinalAuthorRequest|validateAuthorEnvelope|FinalBrief|final-author-input` across `rlcontracts.js`, `rlbrief.js`, `rldata.js`, `rlapp.js`, `market-brief.payload.json`, `market-brief.snapshot.json`, `market-brief.config.json`: matches only in `rlcontracts.js` (definitions + frozen `api` exports). **No existing Market Brief consumer is repointed** to the Scope 08 final functions — the surface is additive; cutover is Scope 09.
- **Hardcoded participant lists/counts** — `grep '\b(22|23)\b'` across `rlcontracts.js`, `scripts/brief-author.mjs`, `scripts/brief-refresh.mjs`: two hits, both benign — `rlcontracts.js:326` is a SHA-256 σ rotation constant (`rotateRight(a, 22)`), `scripts/brief-refresh.mjs:569` is a canary COMMENT. No control-path count literal; counts derive from the frozen registry.
- **Confidence averaging** — `grep 'average|mean|sum.*confidence|confidence.*sum|reduce(...confidence'`: one hit (`rlcontracts.js:1513`), a comment stating the low-noise gate "adds no confidence" (the inverse of averaging). Group merges use minimum-retained confidence (Scope 06 `groupRecommendations`, unchanged).
- **Final confirmation without owner refs** — `FinalSourceEnvelope/v1` carries `ownerInterpretationRefs`; `validateFinalBrief` rejects owner-ref-absent finals (proven by TP-08-04/05 + the functional adversarial suite TP-08-03).
- **Generic prior-close window prose / extended-hours `close` labels** — `WINDOW_POLICY` + `validateWindowHeader` keep the official regular close a distinct anchor; `pre-close` forbids an official close, `after-hours` requires it retained separately. No generic prior-close prose or extended-hours `close` mislabel.
- **Schedule-only actuals / post-cutoff evidence** — TP-08-06 asserts each window prioritizes only evidence knowable at its cutoff and that evidence first available after cutoff is absent.

**Finding: none.** No behavior-authoritative violation; no code change required by the sweep.

## Shared Infrastructure Impact Sweep

Final compaction/validation is a shared policy surface. Independent canaries (not routed through the changed
helper's own output):

- **Existing validated action shape + low-noise limits** — the pure unit canary (`tests/distributed-briefs.final.unit.mjs`) and the low-noise gate assertions validate destination/promote/reasons directly, and the functional canary rejects every unsupported external-author mutation without trusting the author response (TP-08-03).
- **Every source envelope present at exact cap; one omitted source/owner ref rejected** — the unit tight-cap and missing-source cases plus the integration barrier canary (TP-08-04) prove complete coverage in registry order and fail-closed `final-source-read-missing` / `final-aggregator-self-consumed` refusals.
- **Rollback** — the legacy Market Brief compatibility author path is untouched (shared-infra files reported zero modification), so reverting the additive Scope 08 surface leaves source briefs, lifecycle, and history immutable.
- **Baseline non-regression** — `node scripts/selftest.mjs` = 633 / 0 confirms the shared modules retain every prior invariant.

## Uncertainty Declarations

None. Every DoD item ticked is backed by a command executed and observed this session with the exact exit
code and discriminator recorded above.

## Scenario Contract Evidence

- **SCN-002-025** — RED-before-GREEN (unit:64 coverage-refusal discriminator) + TP-08-04 integration barrier +
  TP-08-06 four-window E2E regression. Full 23-participant / 22-source coverage derived from the frozen
  registry; post-cutoff evidence absent; official close distinct from indicative extended hours.
- **SCN-002-027** — RED-before-GREEN (unit:100 `action` vs `context` discriminator) + TP-08-05 integration
  dispute/thin/shared-origin + TP-08-07 E2E. Unusual evidence without an eligible owner interpretation and
  structural break / three-distinct-fingerprint persistence / independent corroboration stays bounded
  context with zero action-slot and zero confidence impact; repeated identical fingerprints earn no credit.

## Coverage Report

Scenario coverage is complete for both Scope 08 scenarios: SCN-002-025 and SCN-002-027 each carry a
scenario-specific persistent E2E regression (TP-08-06 / TP-08-07) plus unit, functional, and integration
canaries. `node scripts/selftest.mjs` = 633 / 0.

## Lint and Quality

`bash .github/bubbles/scripts/artifact-lint.sh specs/002-distributed-tool-briefs-and-history` — see
[Validation Summary](#validation-summary). Diff isolation verified by `git status --porcelain` (Scope 08
surface only) and the sha256 byte-identity audit above; zero undeclared mutation.

## Validation Summary

Implement-phase self-validation complete: Tier 1 (evidence provenance, byte-identity, diff isolation,
selftest baseline) and the Implement Tier 2 profile pass. Delivery certification remains owned by
`bubbles.validate`.

## Audit Verdict

Not audited. Audit ownership belongs to `bubbles.audit` / `bubbles.validate`.
