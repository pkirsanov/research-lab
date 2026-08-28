# Design: BUG-011 — Declaring The Budget These Tests Actually Need

## 1. Root cause

Three facts compose into the defect.

**1.1 The project declares no test budget.** `playwright.config.mjs` sets `testMatch` and two
projects (`system-chrome`, `chromium`) and nothing else. There is no `timeout` key at config level,
project level, or inside `use`. Playwright therefore applies its own per-test default, and the
runner names that default in its own failure text: `Test timeout of 30000ms exceeded`.

**1.2 These tests are expensive, and the cost is concentrated in one helper.** `openOwner()` does a
full `page.goto()` of a heavy analytics page followed by `waitForLoadState('networkidle')`. Three of
the five tests call it three times; one calls it twice; one calls it once. Nothing else in the file
is remotely as costly.

**1.3 The work already fills the budget before any contention exists.** On a single worker with an
otherwise idle machine, the sector test takes **23.7 s** and the global test **17.5 s** — 79% and 58%
of a budget of 30 s. The suite runs at **4 workers** and contains a spec file that runs for **7.0 m**.
The margin that survives on one worker does not survive four.

The consequence is a file that is green alone and red together, with a failure naming a number that
appears nowhere in it.

### 1.4 Why the failure moves between runs

The reported symptom placed both failures inside `waitForLoadState('networkidle')` at line 114. The
failure reproduced in this session landed on the assertion at line 185 instead (`Error: mobile`). Both
carry the same header: `Test timeout of 30000ms exceeded`.

That is diagnostic, not cosmetic. A budget that expires terminates whichever operation happens to be
in flight, so the reported location is a function of scheduling rather than of the defect. It rules
out "one particular wait hangs" and rules in "the total budget is too small" — which decides the fix:
tuning any single wait would leave the total unchanged.

## 2. Fix design

`test.setTimeout(180_000)` as the **first statement of all five tests** in
`tests/causal-rotation-consumers.spec.mjs`, plus one comment above `openOwner()` recording why. No
other change.

### 2.1 Why `180_000`

1. It is **7.6×** the measured uncontended worst case (23.7 s), which is real margin under
   four-worker contention rather than a value tuned to just clear today's observation.
2. It is an **existing in-repo magnitude**, present at 6 sites across 4 spec files
   (`attention-browser.spec.mjs:650`, `contextual-tooltip.spec.mjs:23,67,158`,
   `technical-analysis-decision-lab.spec.mjs:861`, `trend-dynamics-cycle-lab.spec.mjs:987`). Three of
   those are BUG-009's delivered fix for the same defect class. No new number enters the repository.
3. `test.slow()` cannot express it and would be the wrong instrument regardless: it yields
   3 × 30 s = 90 s, which is a **multiplier of the implicit default**. Multiplying an accident does
   not turn it into a decision, and BUG-009 rejected `slow()` on the same ground.

### 2.2 Why all five tests, not only the two that failed

The two observed reds are the two most expensive tests. The remaining three run the same helper
against the same pages under the same undeclared budget — 42%, 25% and 18% of it uncontended.

Fixing only the observed reds would leave three siblings holding the same accident, and the next
person to see one fail would have no reason to connect it to this packet. BUG-009 set the precedent
directly: it fixed its **latent** third site because "the contradiction is the defect, and leaving it
in place leaves a trap that arms itself the first time the page slows down." The same reasoning
applies with more force here, because here the siblings share one cost driver.

Declaring on every test also means a sixth test added to this file later inherits a reviewed budget
instead of the default.

### 2.3 Per-test declaration rather than a file-wide hook

A single `test.beforeEach(() => test.setTimeout(180_000))` would cover the file in one line, and
`scripts/validate-playwright-timeout-budgets.mjs` understands that form. It was rejected on evidence:
the repository contains exactly **one** `test.beforeEach` across all spec files
(`attention-browser.spec.mjs:288`) and it sets no timeout, whereas per-test `test.setTimeout(...)`
exists at 6 sites in 4 files. Introducing a form with no precedent, to save four lines, trades a
convention every reader already knows for one they would have to learn.

`test.describe.configure({ timeout })` was rejected for a stronger reason: the budget guard does not
recognise it, so the declared budget would become invisible to the mechanism that exists to keep
budgets honest. That is precisely the blind spot BUG-009 was written to close.

### Single-Implementation Justification

This fix has exactly one concrete implementation, and building a capability foundation around it
would be premature abstraction.

The change is a declared number: five `test(..., { timeout: 180_000 }, ...)` annotations replacing
an inherited Playwright default of 30000 ms. Section 2.3 above already recorded why the per-test
form was chosen over the two alternatives — a file-wide hook has no precedent in this repository,
and `test.describe.configure` is invisible to the BUG-009 budget guard. Those alternatives were
*rejected*, not *deferred*: no second implementation is waiting to be built, so a foundation would
have nothing to hold.

There are no variation axes to enumerate, and inventing two to satisfy a section shape would be
fabrication. A timeout does not vary by provider, environment, or strategy. It is one value, read
by one runner, from one config, and its only meaningful property is whether a human chose it.
Section 2.1 records why that value is `180_000` — measured headroom over the 23.7 s worst observed
run, not a round number picked for comfort.

Gate G094 fires here on a single ordinary-English trigger word: `cost driver`, at line 63 of this
file. The gate's own diagnostic notes that keywords do not promote the shape. This section records
the proportionality decision rather than reshaping accurate prose to silence a pattern match.

## 3. Why the `networkidle` wait was NOT replaced

The stronger long-term fix would replace `waitForLoadState('networkidle')` with a wait on the
condition the test actually depends on. Playwright discourages `networkidle` for exactly the reason
this bug exists: it is timing-dependent rather than condition-dependent. That option was investigated
and rejected, and the reasons are recorded here rather than left implicit.

**State this plainly: the wait remains timing-dependent. Only its allowance grew.** This packet fixes
the budget, not the wait.

The obstacle is that the condition cannot honestly be named with what these pages currently expose.

**3.1 The precondition is "the owner model finished rendering", and nothing publishes it.** Each test
captures `ownerSurface()` twice — once with the causal bridge disabled, once with it present — and
requires the two to be **byte-identical**. That comparison is only meaningful if both captures are
taken at the same point in the page's lifecycle. `networkidle` is the proxy that currently holds them
there. Replacing it with a weaker signal would not remove a flake; it would convert a timeout into a
false surface-mismatch, which is a worse failure because it looks like a product regression.

**3.2 There is no readiness marker on these pages.** A repository-wide search for the hydration-marker
idiom finds exactly one page using it — `market-heatmap-lab.html`, with `data-heatmap-hydration` —
and none of the three owner pages here. Adding one means editing `sector-research-lab.html`,
`global-rotation-lab.html` and `real-assets-lab.html`, which are Feature 001 product surfaces. A
test-budget defect is not a licence to change three product pages.

**3.3 `load` is not sufficient, and the obvious substitutes are unsafe.**

| Candidate condition | Why it fails |
|---|---|
| `waitForLoadState('load')` | `rlviews.js` is injected **dynamically** (`rlnav.js:300`, `rlapp.js:345`), so the view shell that `enterOwnerView()` needs may not exist when `load` resolves. |
| `RLDATA.toolRead(<id>)` becomes non-null | `global-rotation-lab.html` states in its own comment that "on a cold load the country model may never reach publishRead". Waiting on it could hang forever on one of the two pages that actually fail. |
| `[data-causal-context]` attached | Only exists on the causal-enabled load. Half the `openOwner()` calls deliberately disable the causal modules, so it cannot be the shared precondition. |

A wait that can hang is worse than a wait that can be slow. None of these is safe to adopt.

**3.4 What a future Option 2 requires.** A `data-*` readiness attribute set by each of the three owner
pages once its model has rendered — the `data-heatmap-hydration` shape — after which `openOwner()`
would wait on that attribute and `networkidle` could be dropped. That is a Feature 001 change with its
own scope and its own regression surface. It is recorded in `spec.md` as out of scope, not as done.

## 4. What must NOT be done

| Prohibited | Why |
|---|---|
| Adding `retries` to `playwright.config.mjs` | Retries do not make a test pass; they make a failure invisible by re-rolling it. The budget would still be too small and the next reader would see a green suite hiding a real timing defect. |
| Marking a test `.skip` or `.fixme` | Deletes the Feature 001 consumer guarantee that causal context never alters an owner verdict. The red goes away because nothing is checked. |
| Deleting or relaxing an assertion | Same outcome, narrower blast radius. The mobile-viewport count assertion is where the failure surfaced; removing it would remove the observation, not the cause. |
| Weakening `enterOwnerView` | It returns `false` when no owner view can be reached, and `openOwner` asserts on that. Softening it converts a real inability to reach the owner surface into a silent pass. |
| Adding a suite-wide `timeout` to `playwright.config.mjs` | Relaxes every test in the suite, including the spec files that are coherent today, and would mask genuine hangs everywhere. BUG-009 rejected this for the same reason. |
| Lowering any wait budget to fit inside 30 s | Inverts the fix. The work takes 23.7 s uncontended; shrinking the allowance makes the test fail sooner under exactly the load it must survive. |
| Making the owner pages faster to close this packet | A legitimate improvement and a different change. It would alter Feature 001 product behaviour under cover of a test fix. |

## 5. Interaction with the BUG-009 guard

`scripts/validate-playwright-timeout-budgets.mjs` enforces that no wait declaration exceeds the
effective budget of any test that can reach it. This change moves an enclosing budget **upward**,
which can only increase slack, and the affected file declares **no** wait budgets at all — a search
for `timeout:` in it exits 1. The guard therefore has nothing in this file to attribute, and the
change cannot make any existing declaration unreachable.

The guard runs inside `node scripts/selftest.mjs`, so its verdict is recorded there rather than as a
separate command.
