# Spec: BUG-012 — A Bar Must Be Coherent, A Fixture Must Be Pinned, And A Failure Must Be Visible

## Problem statement

Three contracts are unstated, and each one is broken.

**A bar's four prices must describe the same trade sequence.** Ingestion substitutes a
dividend-adjusted close into `c` while `o`, `h` and `l` remain raw. The row that results claims a low
above its own close, which no market produced. **245 of 293** files under `data/bars/` and **71,714 of
150,161** rows carry that contradiction.

**A committed fixture must be reproducible.** `tests/fixtures/research-agenda/reversal-ui.json` pins
a fixed cutoff and then reads mutable `data/bars/*.json`. The cutoff is stable; the data behind it is
not. A scheduled refresh can therefore turn a passing committed test red without any code change, and
did.

**A failure must be able to report itself.** The reversal boot path computes the correct explanation
and writes it into the DOM, then leaves `state.view` unset. Every observer that waits on
`getViewState()` — which is how the six affected tests observe readiness — waits forever. The page
knows what went wrong and has no way to say so to anything watching for readiness.

The three compose: a data defect becomes an unbounded hang carrying no diagnosis.

## Domain Capability Model

**Capability: a single-basis OHLC row, enforced wherever a row is produced or read.**

The defect was not one bad number. It was a row carrying two price bases at once — a raw low beside
an adjusted close — which is a self-contradictory row that no consumer can interpret. The capability
this packet delivers is the invariant `l <= min(o, c)`, `h >= max(o, c)`, `l <= h`, together with the
rule that all four fields share one basis.

| Concern | Where it belongs |
|---|---|
| Deciding which basis a row carries | The ingestion contract, decided once |
| Refusing to WRITE a row that violates the invariant | The writer |
| Refusing to ACCEPT a corpus that already violates it | The corpus scan |
| Reacting to an invalid bar at read time | `rlagenda.js`, which already did this correctly and is unchanged |

Two enforcement points are required rather than one, and the reason is not symmetry. A writer-only
guard leaves 71,714 already-committed rows broken, so the six affected tests stay red. A scan-only
guard lets the next refresh reintroduce the defect. Fixing one without the other was explicitly
considered and rejected in `design.md`.

The capability deliberately stops at coherence. It does not police whether a published row may later
change VALUE — that is a separate decision, filed as
[`specs/028-published-row-provenance-policy`](../../028-published-row-provenance-policy/spec.md).

## Expected behaviour

### Data integrity

**INV-012B-1 — OHLC coherence.** Every row written to `data/bars/*.json` satisfies
`l <= min(o, c)`, `h >= max(o, c)` and `l <= h`. No writer may emit a row that fails these.

**INV-012B-2 — one price basis per row.** A row's `o`, `h`, `l` and `c` are all raw or all adjusted
on the same basis. An adjusted close is never placed beside raw `o`/`h`/`l`. If an adjusted close is
retained, it occupies its own named field and does not displace `c`.

**INV-012B-3 — the corpus is coherent, not just new writes.** After the fix, a scan of every file
under `data/bars/` finds zero rows violating INV-012B-1. Fixing the writer while leaving 71,714
incoherent rows in place would leave the defect live.

**INV-012B-4 — the validator is not weakened.** `rlagenda.js` still refuses a bar with
`l > min(o, c)`. Satisfying INV-012B-1 through INV-012B-3 changes no validation rule, no error code,
and no refusal path.

### Fixture reproducibility

**INV-012B-5 — a committed fixture yields a committed result.** A test that pins a fixed cutoff
resolves against inputs that cannot change without a reviewed commit to the test surface. A scheduled
data refresh may not alter the outcome of a committed test.

**INV-012B-6 — drift is detected, not discovered.** If a fixture continues to read shared data, the
coupling is explicit and a violation of INV-012B-5 fails with a message naming the fixture, the
symbol and the row — not with a timeout.

### Error-path visibility

**INV-012B-7 — a boot failure resolves the readiness observer.** When the reversal boot path fails,
`__researchAgendaDebug.getViewState()` stops returning `null` and returns a value that identifies the
state as failed. No caller waiting on readiness waits without bound.

**INV-012B-8 — the computed reason reaches the observer.** The refusal the page already computes —
for the observed break, `fixture canonical model failed: RLAGENDA-MODEL-INVALID` — is retrievable
through the debug surface, not only as DOM text.

**INV-012B-9 — the successful path is unchanged.** Satisfying INV-012B-7 and INV-012B-8 alters no
rendering, no state shape, and no value returned by `getViewState()` on a successful boot.

### Suite

**INV-012B-10 — the six tests pass on their merits.** All six pass with the data corrected, with no
`retries`, no `.skip` or `.fixme`, no deleted or weakened assertion, and no global Playwright
`timeout`. The 240 s measurement in `report.md` establishes that a timeout cannot fix this; adding one
would mask the defect rather than remove it.

**INV-012B-11 — the suite is unreduced.** The fix removes, skips or renames no test.
`node scripts/selftest.mjs` reports **0 failed** with no reduction in assertion count.

## Acceptance criteria

| ID | Criterion | Scope |
|---|---|---|
| AC-1 | `scripts/fetch-bars.mjs` cannot write a row violating `l <= min(o, c)`, `h >= max(o, c)`, `l <= h`. | 01 |
| AC-2 | The chosen price-basis contract is stated in the packet and applied consistently; an adjusted close never displaces `c` beside raw `o`/`h`/`l`. | 01 |
| AC-3 | A scan of all 293 files under `data/bars/` reports zero incoherent rows, down from 71,714. | 01 |
| AC-4 | A committed guard fails if any bars row violates OHLC coherence, and it runs inside `node scripts/selftest.mjs`. | 01 |
| AC-5 | `rlagenda.js` refusal rules, error codes and field names are byte-identical. | 01 |
| AC-6 | The reversal fixture's inputs cannot be changed by a scheduled data refresh. | 02 |
| AC-7 | If shared data is still read, a drift between fixture expectation and data fails with a message naming fixture, symbol and row. | 02 |
| AC-8 | On a failed reversal boot, `getViewState()` returns a non-null value marking the failure. | 03 |
| AC-9 | The computed refusal reason is retrievable through `__researchAgendaDebug`. | 03 |
| AC-10 | On a successful boot, every `getViewState()` value is unchanged. | 03 |
| AC-11 | All six tests at `tool-experience.spec.mjs:442,485,566,605,639` and `contextual-tooltip.spec.mjs:115` pass. | 01, 02, 03 |
| AC-12 | No `retries`, no `.skip`/`.fixme`, no deleted assertion, and no global `timeout` in `playwright.config.mjs`. | 01, 02, 03 |
| AC-13 | `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count. | 01, 02, 03 |
| AC-14 | `bash .github/bubbles/scripts/artifact-lint.sh` on this packet exits 0. | 01, 02, 03 |

## Out of scope

- **Choosing the ingestion contract inside this filing.** The remedy for defect 1 is a design
  decision with more than one defensible answer, and the options and their consequences are recorded
  in `design.md` §2 rather than settled here. This packet defines what any chosen answer must
  satisfy.
- **Restating history semantics for already-published rows.** `design.md` §2.4 records that
  retroactively rewriting a published row is a provenance concern independent of the arithmetic. What
  the retention policy should be is a separate decision and is not decided here.
- **Weakening `rlagenda.js`.** Explicitly prohibited by INV-012B-4. Accepting incoherent bars would
  convert a loud defect into a silent one.
- **A global Playwright `timeout`.** Considered and disproven by execution at 240 s; see `report.md`.
  It is prohibited by INV-012B-10, not merely unnecessary.
- **The two unrelated failures in the 8-failure full-suite run.** Only six are attributed to this
  defect. The other two are recorded as context and are not claimed here.
- **`BUG-011`'s packet and its delivered change.** Untouched.

## Traceability

| Invariant | Scenario | Scope |
|---|---|---|
| INV-012B-1 | SCN-012B-001 | 01 |
| INV-012B-2 | SCN-012B-002 | 01 |
| INV-012B-3 | SCN-012B-003 | 01 |
| INV-012B-4 | SCN-012B-004 | 01 |
| INV-012B-5 | SCN-012B-005 | 02 |
| INV-012B-6 | SCN-012B-006 | 02 |
| INV-012B-7 | SCN-012B-007 | 03 |
| INV-012B-8 | SCN-012B-008 | 03 |
| INV-012B-9 | SCN-012B-009 | 03 |
| INV-012B-10 | SCN-012B-010 | 01, 02, 03 |
| INV-012B-11 | SCN-012B-011 | 01, 02, 03 |
