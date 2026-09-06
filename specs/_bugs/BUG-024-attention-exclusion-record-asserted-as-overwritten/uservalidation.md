# User Validation: BUG-024 — Filed, Nothing Delivered

This packet was filed by a diagnostic round. No scope has been started, no shipped file has
been changed, and there is nothing yet to accept.

The standing operator directive in this session authorises acceptance broadly. It is
deliberately **not** applied here, because there is no delivery to accept: `scopes.md` carries
0 of 13 Definition of Done items checked and `state.json` is `in_progress`. Recording
acceptance now would certify a fix that does not exist. The checklist below is what a human
should be able to confirm **after** Scopes 1 and 2 land; fixing the acceptance criteria before
the fix is written is the point of writing it now.

## Automation Readiness

| Item | Automatable | Why |
| --- | --- | --- |
| The corrected assertion still fails when the append-only record is truncated | Yes | An adversarial case in Scope 1 — the assertion must be able to fail, or it replaces one unfailable claim with another |
| `result.exclusions` satisfies FR-020-024 (built plus excluded equals declared) | Yes | Assert the arithmetic directly |
| `result.payload.attentionExclusions` satisfies FR-020-023 (append-only) | Yes | Assert that a prior refusal survives a later generation |
| The attention contract suite runs in an automated gate | Yes | Scope 2; observe the suite named in the gate's output |
| The ten `tests/*.test.mjs` files stop being invisible to the canonical check | Yes | Re-run the reference scan in `report.md` § 2 |
| Whether the overlap refusals name the right subjects | No | This bug does not establish that. MSFT, XLK, QQQ, SPMO and XLE are refused as already-published actions; whether that set is correct is a separate product judgement |
| Whether `rlattention.test.mjs` (SCN-017-001) shares a root cause | No | Found in the same blind spot and red at clean HEAD, but not diagnosed. It needs its own packet, not an assumption |

The last two are the reason this file exists. Everything else belongs in the suite.

## Checklist

- [ ] `node --test tests/attention-payload-contract.test.mjs` exits 0 with 31 of 31 passing.
- [ ] The append-only record retains a refusal raised by an earlier generation, and a test
      proves it by failing when that record is truncated.
- [ ] The current generation's refusal list is asserted against FR-020-024, not against the
      append-only record.
- [ ] No product code was changed to make the test pass, or if it was, the change is justified
      against a named requirement rather than against the test.
- [ ] An automated gate executes the attention contract suite, and its output names the suite.
- [ ] Re-running the `report.md` § 2 reference scan shows the ten `tests/*.test.mjs` files are
      no longer invisible to the canonical check.
- [ ] `tests/rlattention.test.mjs` is either fixed under its own packet or explicitly recorded
      as open, and is not left silently red.

## Human Acceptance Record

_Not started. To be completed by the human operator after Scopes 1 and 2 are delivered._

| Field | Value |
| --- | --- |
| Accepted by | _pending_ |
| Date | _pending_ |
| Commit verified | _pending_ |
| Notes | _pending_ |
