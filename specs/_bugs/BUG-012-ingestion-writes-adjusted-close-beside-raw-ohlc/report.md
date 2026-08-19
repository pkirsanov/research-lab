# Report: BUG-012 — Filed, Diagnosed, Deliberately Not Fixed

## Summary

This packet **documents a defect and implements no remedy**, by instruction. The root cause is
established to the line and the failure is reproduced; the fix is withheld because the primary
remedy is a decision about the ingestion contract with more than one defensible answer, recorded
open in `design.md` §2.

Six committed tests fail at HEAD `5c978c5cb` with an **unbounded hang**. Bars ingestion writes a
dividend-adjusted close into `c` while `o`, `h` and `l` stay raw, producing rows whose low exceeds
their own close. `rlagenda.js` correctly refuses such a row; the `?fixture=reversal` boot path throws
on that refusal; its `.catch` writes an "Unavailable" message without setting `state.view`; and the
six tests wait on `getViewState()`, which therefore stays `null` forever.

- **Changed:** nothing outside this packet. Only the eight artifacts under
  `specs/_bugs/BUG-012-ingestion-writes-adjusted-close-beside-raw-ohlc/` were authored.
- **Unchanged, deliberately:** `data/**`, `tests/**`, `scripts/**`, `research-agenda-lab.html`,
  `rlagenda.js`, `playwright.config.mjs`, and the `BUG-011` packet.
- **Scenarios validated:** none. All eleven entries in `scenario-manifest.json` are `not_started`,
  and every Definition of Done item across the three scopes in `scopes.md` is unticked.

## Provenance of every figure in this report

Two kinds of evidence appear below and they are labelled separately.

**Reported measurements.** Every Playwright run, headless boot, corpus scan and model replay quoted
here was **executed earlier in this session** and is recorded as a reported observation. This agent
did not re-derive any of them and executed no test command, no Playwright run, and no corpus scan.

**Agent-executed reads.** This agent performed read-only inspection of the repository to confirm that
each cited line number, field name, file path and call site is real. Those are tagged
`Executed by this agent: YES` and are static reads, not measurements.

The distinction matters because the two support different claims. The reported measurements establish
that the defect exists and what causes it. The agent reads establish only that this document cites
the code accurately.

## Completion Statement

**Delivered:** a complete bug packet — `bug.md`, `spec.md`, `design.md`, `scopes.md`, `report.md`,
`scenario-manifest.json`, `uservalidation.md`, `state.json` — describing three distinct defects, the
invariants a fix must establish, three scopes with adversarial test plans, and the open contract
decision that the fix depends on.

**Not delivered, deliberately:** any remedy. No writer was corrected, no corpus row was repaired, no
fixture was decoupled, and no error path was made observable. The instruction that produced this
packet was to file the defect and not fix it, on the reasoning that choosing the ingestion contract
inside a filing task would settle a design decision by accident.

`state.json` is therefore `in_progress`, with `certification.status` equal to it. No terminal status
is claimed and none is available: every DoD item is unticked, no scope is Done, and nothing has been
implemented to verify.

## Test Evidence

No test command was executed by this agent.

### The six failing tests — in the suite and in isolation

**Executed by this agent:** NO
**Executed by:** prior execution, this session
**Claim Source:** reported observation, not re-derived by this agent

| Run at `5c978c5cb` | Result |
|---|---|
| Full committed suite | **490 passed, 8 failed** |
| The two affected files alone | **6 failed, 20 passed** |

The same six fail in both, which is what separates them from load flakes — an intermittent failure
does not survive isolation on a quiet machine:

```
tests/tool-experience.spec.mjs:442
tests/tool-experience.spec.mjs:485
tests/tool-experience.spec.mjs:566
tests/tool-experience.spec.mjs:605
tests/tool-experience.spec.mjs:639
tests/contextual-tooltip.spec.mjs:115
6 failed, 20 passed
```

Two of the eight full-suite failures are unrelated and are not attributed to this defect.

### The same files were green before the data refresh

**Executed by this agent:** NO
**Executed by:** prior execution, this session
**Claim Source:** reported observation, not re-derived by this agent

At `0e51d602f` the two files reported **17 passed, 1 failed**, and that single red was a different,
flaky test. The regression arrived with cron commit `643d74bfd`, an after-hours refresh. No code
between those trees touched the affected files.

### A global Playwright timeout was considered and disproven by execution

**Executed by this agent:** NO
**Executed by:** prior execution, this session
**Claim Source:** reported observation, not re-derived by this agent

The cheapest available answer to six timing-out tests is a larger budget. It was tried, under a
**240 s** budget supplied as a CLI override — **8×** the inherited default — and the tests still
failed:

```
Test timeout of 240000ms exceeded.
Error: page.waitForFunction: Test timeout of 240000ms exceeded.
> 118 | await page.waitForFunction(() => globalThis.__researchAgendaDebug && …getViewState());
```

**State this plainly: no timeout value fixes this.** The awaited condition is unreachable, not slow.
`getViewState()` returns `null` and will keep returning `null` for as long as the process runs,
because the error path never assigns the state the getter reads.

**Applying a global timeout would have masked this defect rather than fixed it.** It would have
relaxed every test in the suite, left 71,714 incoherent rows in the corpus untouched, and turned a
reproducible red into a slower reproducible red — while removing the signal that led to the diagnosis.
This measurement is recorded here so the shortcut is closed off by execution rather than by opinion.
`spec.md` INV-012B-10 makes it prohibited, and `design.md` §5 records why.

### Root cause — the observer, and the reason the page already had

**Executed by this agent:** NO
**Executed by:** prior execution, this session
**Claim Source:** reported observation, not re-derived by this agent

Booting the page headlessly:

```
getViewState() = null
currentReason  = Required same-origin research artifacts could not be loaded.
                 fixture canonical model failed: RLAGENDA-MODEL-INVALID
```

`__researchAgendaDebug` is defined; `getViewState()` is `null`. The page had already computed the
correct explanation and put it in the DOM. The tests wait on the one signal the error path never
produces.

### Root cause — localised to one symbol, and sufficient

**Executed by this agent:** NO
**Executed by:** prior execution, this session
**Claim Source:** reported observation, not re-derived by this agent

Driven through the real page runtime with the exact fixture inputs:

```
ok=false  code=RLAGENDA-MODEL-INVALID  field=currentBars.COP
COP cutoff row: low=124.12000274658203  close=123.6949691772461   low > min(o,c) = true
same call with COP close repaired to its own low: ok=true
```

The repaired-close replay returning `ok=true` is what makes COP **sufficient** and not merely
correlated: one field restores the whole model.

### What the cron changed

**Executed by this agent:** NO
**Executed by:** prior execution, this session
**Claim Source:** reported observation, not re-derived by this agent

| COP row `2026-08-13T13:30Z` | `l` | `c` | verdict |
|---|---|---|---|
| pre-cron `0e51d602f` | 124.1200 | **124.5200** | accepted → the six tests pass |
| current `5c978c5cb` | 124.1200 | **123.6950** | `RLAGENDA-MODEL-INVALID` → unbounded hang |

The close of an already-published historical row moved, in place, below its own low.

### Scale — systemic, not one row

**Executed by this agent:** NO
**Executed by:** prior execution, this session
**Claim Source:** reported observation, not re-derived by this agent

- **245 of 293** files under `data/bars/` contain at least one row with `l > min(o, c)`.
- **71,714 of 150,161** rows carry the same incoherence.

COP is not special; it is the symbol whose corrupted row happens to sit at the cutoff this fixture
pins.

### Agent-executed reads — the citations in this packet are real

**Executed by this agent:** YES
**Command:** read-only inspection of the working tree (no test executed, no file modified)
**Claim Source:** executed

| Claim | Confirmed at |
|---|---|
| Adjusted close substituted for `c` | `scripts/fetch-bars.mjs:152` |
| Raw `o`/`h`/`l` written on the same row | `scripts/fetch-bars.mjs:155` |
| Fresh rows overwrite published rows by timestamp | `scripts/fetch-bars.mjs:162` and `:165` |
| Validator refuses `l > min(o, c)` | `rlagenda.js:1718`, refusal at `:1719` |
| Fixture cutoff pinned | `tests/fixtures/research-agenda/reversal-ui.json` `attemptedAt` = `2026-08-14T12:00:00.000Z` |
| Cutoff resolved against mutable corpus | `research-agenda-lab.html:859-860` in `loadFixtureBars` (declared at `:853`) |
| Refusal converted to a throw | `research-agenda-lab.html:874` |
| `.catch` writes DOM text, never sets `state.view` | `research-agenda-lab.html:1059-1062` |
| `getViewState()` returns `null` while `state.view` is unset | `research-agenda-lab.html:1066` |
| The wait the six tests block on | `tests/tool-experience.spec.mjs:327` (helper at `:323`), `tests/contextual-tooltip.spec.mjs:118` (navigation at `:116`) |
| `data/bars/` file count | 293 files, matching the reported scan denominator |
| COP row values at HEAD | `o=125.72000122070312 h=126.38999938964844 l=124.12000274658203 c=123.6949691772461` |

One read is worth more than the rest. The five failing `tool-experience` tests are **exactly** the
five that call `openResearchAgenda` with `{ fixture: 'reversal' }` — call sites at lines 443, 488,
567, 608 and 649 — while the three tests calling the same helper **without** the fixture, at lines
365, 459 and 717, pass. That partition is structural confirmation that the reversal boot path is the
failing path, obtained without running anything.

### Tree state at authoring time

**Executed by this agent:** YES
**Command:** `git log -1 --oneline`, `git status --short --branch`
**Claim Source:** executed

```
5c978c5cb (HEAD -> main, origin/main, origin/HEAD) fix(BUG-011): declare the budget these causal
consumer tests actually need
## main...origin/main
```

The tree was clean at authoring time. This packet adds one untracked directory and modifies no
tracked file. Nothing is committed.

## Outstanding Verification

Everything. This packet verifies a defect; it verifies no remedy, because no remedy exists yet.

Specifically unestablished, and unticked in `scopes.md`:

- Which ingestion contract to adopt — `design.md` §2 Option A or Option B — and therefore whether the
  corpus becomes wholly adjusted or wholly raw with the adjusted close in its own field.
- Which decoupling shape the fixture should take — `design.md` §3 pinned inputs, or shared read with
  an explicit drift expectation.
- Whether any of the three scopes' adversarial tests, once written, actually fail before their fix.
  Each adversarial note in `scopes.md` names a specific way its scope could be tested tautologically;
  none of those tests has been written, so none has been shown to be non-tautological.
- The provenance question raised in `design.md` §2.4 — what policy should govern a published
  historical row changing value — which is recorded as out of scope in `spec.md` and remains open.

### Validation Evidence

No validation was performed and none is claimed. No independent party re-derived any measurement in
this report, `certification.completedScopes` and `certification.certifiedCompletedPhases` are both
empty in `state.json`, and there is no implementation to validate.

The only thing this agent verified first-hand is that the citations in this packet match the code, by
read-only inspection recorded above. That establishes documentary accuracy, and nothing about whether
the defect is resolved.

### Audit Evidence

No audit was performed. `design.md` and `scopes.md` were authored directly rather than dispatched to
`bubbles.design` and `bubbles.plan`, because the task was scoped to filing and no dispatch surface was
exercised. Neither artifact has been reviewed by its owning specialist, and the open decision in
`design.md` §2 is precisely the kind of choice that warrants that review before a fix begins.
