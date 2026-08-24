# Design: BUG-018 — Why A Pending Corpus Reads As A Settled Absence

## What This Document Does And Does Not Do

It establishes the mechanism from the shipped source and names the lines. It sets out remedy
options and their costs. It does **not** select a remedy: the choice between them changes what a
reader sees on first paint, which is a product decision. See "Open Questions For The Owner".

Every line reference below was read at commit `dc54a8547`.

## Mechanism

### The composer cannot express "not yet known"

`compose()` at `company-intelligence-lab.html:991` builds the entire reading from the shared cache:

```js
var bundle  = INTEL.runAdapters(subject, sources, when, window.RLDATA);
var account = INTEL.buildCoverageAccount(bundle, registry);
```

`company-intelligence-lab.html:998-999`. `runAdapters` (`rlcompanyintel.js:1198`) asks each adapter
what it can answer from `window.RLDATA`. `buildCoverageAccount` (`rlcompanyintel.js:1243`) then
tallies how many mandatory dimensions came back without a usable source.

Neither function receives a readiness signal. `compose()` does not pass one, because it has none to
pass: the module-scope `corpusStatus` variable declared at `company-intelligence-lab.html:745` is
never read by `compose()`. From inside the composer, an empty cache and a company with no committed
data are the same observation.

**This is the deepest cause.** The absence of a readiness input is what makes every downstream
surface, correctly and consistently, describe an unresolved corpus as a settled absence.

### The composed paint is scheduled ahead of the corpus request

`paintFromEmbedded()` at `company-intelligence-lab.html:1697` calls `run()` synchronously from the
embedded registry copy. `run()` at `company-intelligence-lab.html:1487` is:

```js
function run() {
    setBodyState("composing", 0);
    render(compose());
}
```

`boot()` at `company-intelligence-lab.html:1716` calls `paintFromEmbedded()` at
`company-intelligence-lab.html:1736`, and only reaches its first `loadCorpus()` at
`company-intelligence-lab.html:1749`, inside the `readConfig()` continuation.

So the ordering is fixed and unconditional: **compose and paint, then request the corpus.** There
is no interleaving to lose and no race to win. The first composed paint of every load happens with
an empty cache by construction. This is why the window is reachable at zero injected delay.

That ordering is itself deliberate and good: it is what lets the route paint from the embedded
registry with no network at all, which the offline first-paint test at
`tests/company-intelligence-lab.spec.mjs:1121-1174` exists to protect. The defect is not the
ordering. The defect is that the paint produced by that ordering **claims more than it knows**.

### The claim is unconditional prose

`render()` at `company-intelligence-lab.html:1450` writes the sentence at
`company-intelligence-lab.html:1460-1462`:

```js
setText("cockpit-coverage-line",
    version.coverageAccount.totals.unavailable + " of " + version.coverageAccount.rows.length +
    " mandatory dimensions have no usable source in this run. Each one names its reason below.");
```

There is no branch. The same grammar is emitted whether the account is settled or empty-because-
unfetched. `renderHorizonCards()` at `company-intelligence-lab.html:1085` has the same shape: it
prints `horizon.direction` and `horizon.evidenceQuality` verbatim, and a horizon composed from
nothing yields `none` / `absent`, which is exactly what a settled horizon with no contributors
yields.

### The run status is declared without consulting readiness

`render()` ends at `company-intelligence-lab.html:1484`:

```js
setBodyState("composed", version.coverageAccount.totals.unavailable);
```

`setBodyState` at `company-intelligence-lab.html:787-791` writes three attributes in one call:

```js
function setBodyState(runStatus, unavailableCount) {
    document.body.setAttribute("data-run-status", runStatus);
    document.body.setAttribute("data-coverage-unavailable", String(unavailableCount));
    document.body.setAttribute("data-corpus-status", corpusStatus);
}
```

`data-run-status` is a parameter and `data-corpus-status` is read from module scope. The two
describe different subsystems and are written at the same instant with no consistency rule between
them. `composed` is passed unconditionally; nothing prevents the pair `composed` + `pending`.

### Facet 2: the stale attribute, and why it is a separate defect

`applySubject()` at `company-intelligence-lab.html:1494` runs:

```js
var result = compose();     // 1503
render(result);             // 1504  -> setBodyState writes the PREVIOUS corpusStatus
if (!result.refusal) loadCorpus();   // 1507
```

and `loadCorpus()` at `company-intelligence-lab.html:1538` resets the variable on its first
statement after capturing the intent:

```js
var intent = readingIntent;
corpusStatus = "pending";   // 1540
```

The reset at line 1540 happens **after** the paint at line 1504 has already copied the old value
onto the body. A subject applied from a settled page therefore paints with
`data-corpus-status="loaded"` while its own corpus has not been requested.

This is worse than facet 1. Facet 1 leaves the attribute *correct* and merely unrendered, so a
consumer that reads it is safe. Facet 2 makes the attribute *wrong*, so the committed suite's own
readiness convention returns immediately on a stale value. The single-line ordering fix for this
facet is independent of every remedy option below and can land on its own.

### Why the observed magnitude varies

Probe runs in this session recorded `15 of 15` against a cold cache and `14 of 15` against a warm
one. That is expected and does not weaken the finding; it identifies who sees what.

`loadOne()` at `company-intelligence-lab.html:1520` consults `window.RLDATA.bars(symbol, "1d")`
before fetching, and returns `"cached"` without a request when the shared cache already holds that
symbol. The cache survives a reload, so a **returning** reader has one bar leg resolved
synchronously and sees `14 of 15`, while a **first-time** reader with a cold cache sees the full
`15 of 15` with all four horizons at `none` / `absent`. The settled truth is `13 of 15` in both
cases.

The count shown in the window is therefore whatever the cache held at the sampling instant. The
cold-cache maximum, `15 of 15`, is the worst case and is the one a new reader following a published
deep link actually meets.

### Why facet 2 did not produce a drifting number in this session

Both subjects tried in the stale-attribute probe (`AAPL`, `NVDA`) settle at the same count they
showed during the apply, so the attribute lied without the printed sentence changing. The lie is
established; a drift behind it is not. It is nonetheless reachable: any subject whose settled
account differs from its empty-cache account will drift, and `MSFT` is exactly such a subject
(`15 of 15` empty against `13 of 15` settled). Reproducing that specific pairing requires applying
`MSFT` manually from a settled page whose cache does not already hold `MSFT` bars, which the shared
`RLDATA` cache makes awkward within one page session. Recorded as reachable-by-argument, not as
observed.

## Remedy Options

Three shapes exist. They are not mutually exclusive; option A is a prerequisite for a complete
version of B or C.

### Option A — Give the composer a readiness input (prerequisite)

Pass `corpusStatus` into `compose()` and through to `buildCoverageAccount`, so the coverage account
carries a third totals state alongside present and unavailable: *not established*. Downstream
surfaces then read it rather than inferring it.

- Cost: touches `rlcompanyintel.js` exports and their unit tests. Additive if the new field
  defaults to the current behaviour when readiness is not supplied.
- Benefit: the distinction becomes expressible once, at the source, instead of being patched at
  each render site.

### Option B — Withhold the claim until the corpus resolves

Render the cockpit sentence and the horizon directions only when `corpusStatus !== "pending"`;
before that, show explicit readiness wording.

- Cost: the offline first paint at `tests/company-intelligence-lab.spec.mjs:1121-1174` currently
  proves a usable cockpit with no network. Under `file://` or a dead server the corpus never
  resolves, so this option must treat "resolved to unavailable" and "still pending" differently or
  it will withhold the reading forever. That distinction already exists in the code:
  `loadCorpus()` sets `unavailable` rather than leaving `pending`
  (`company-intelligence-lab.html:1543`), so the guard is expressible.
- Benefit: strongest satisfaction of P2. Nothing definite is ever shown before it is known.

### Option C — Render the claim, but mark it provisional

Keep the count and the horizon cards, and add user-visible wording plus a machine-readable marker
saying the account is incomplete while the corpus arrives.

- Cost: a reader who does not notice the marker still reads a number. Weaker than B against the
  "never a plausible placeholder" clause.
- Benefit: preserves the immediate first paint the route was designed around, and is the smaller
  change.

### What the remedy is not

- It is not "wait for the corpus before painting anything". That would delete the offline
  first-paint guarantee the route is built on and would turn a green committed test red for the
  wrong reason.
- It is not "hide `data-corpus-status`". The attribute is correct in facet 1 and is the raw
  material for any fix.
- It is not "widen the test fixture's wait". That would hide the defect from the suite even more
  thoroughly than it is hidden today.

## The Test Gap Is Structural

`openComposedRoute` at `tests/company-intelligence-lab.spec.mjs:42` gates every one of the 37 tests
on `tests/company-intelligence-lab.spec.mjs:58-59`:

```js
await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
await expect(page.locator('body')).toHaveAttribute('data-corpus-status', /^(loaded|unavailable)$/);
```

The fixture waits the window out. This is the right gate for asserting settled behaviour and it is
why the suite is green and honest at 37 of 37. It also means no assertion in the file can ever see
the pending paint. The unit suite cannot see it either, because readiness is not an input to the
module it exercises.

Any fix must therefore add a case that deliberately samples the composed paint before the corpus
resolves. A case that reuses `openComposedRoute` cannot satisfy FR-018-006.

## Open Questions For The Owner — Resolved 2026-08-23

**Who decided, and on what authority.** These four were resolved by the orchestrating session
under the operator's standing authorization, recorded verbatim as *"pick best option for long run,
no shortcuts; approved"*. They are **not** independently reached engineering conclusions presented
as an owner ruling, and question 1 was not agent-dischargeable on its own terms. It is recorded
here as a delegated decision so a later reader can see exactly whose judgement it was. An owner who
disagrees can reverse it; the reversal cost is named under each answer.

### 1. Withhold or mark? → **Option A, then Option B. Withhold.**

The choice was constrained by binding policy rather than settled by preference, which is what made
it dischargeable under a standing authorization at all.

`.github/instructions/product-principles.instructions.md` applies to `**` and is therefore binding
on this route. It lists under **Blocking Patterns**: *missing data rendered as zero, neutral, or
inferred*. It states under **UI And Data Checks**: *Missing data renders as unavailable or
incomplete, never as zero or a plausible placeholder*.

This document's own analysis of Option C, written before the decision, says it is *"Weaker than B
against the 'never a plausible placeholder' clause"* because *"a reader who does not notice the
marker still reads a number"*. A remedy this packet's own analysis already calls weaker against the
exact governing clause cannot be the remedy this packet selects. Option C is therefore rejected on
the record, not on taste.

Option A is described above as the durable shape and as *"Additive if the new field defaults to the
current behaviour when readiness is not supplied"*, so it carries no migration cost and lands
first. Option B is then a consumer of A rather than a patch at each render site.

**Reversal cost if the owner disagrees:** Option A stays regardless — it is the expressiveness the
route lacked and nothing depends on withholding. Reversing to C means changing the three render
branches in `render()`, `renderHorizonCards()` and `renderCoverage()` to print the settled copy
beside the `data-*-claim="not-established"` markers those branches already emit, and rewriting the
copy assertions in the Scope 3 browser case. The account contract does not change.

### 2. Does `composed` keep its meaning? → **Yes, and the delivered predicate is stronger than the pair.**

`composed` is unchanged and still means "this paint composed its horizons". That is what the
offline first paint at `tests/company-intelligence-lab.spec.mjs:1121-1174` and the `file://` paint
at `tests/company-intelligence-lab.spec.mjs:1075-1118` both wait on, and reserving the word for a
corpus-resolved paint would have turned both of those green tests red for the wrong reason.

The premise in the question is correct: Scope 1 corrected the stale attribute, so
`data-run-status="composed"` **and** `data-corpus-status ∈ {loaded, unavailable}` is now jointly
sufficient, and a consumer using that pair today is safe.

The delivered fix nonetheless adds `data-reading-readiness`, and the reason is a difference the
pair cannot express. `setBodyState` writes `data-corpus-status` by re-reading the module-scope
`corpusStatus` variable at the instant of the write, whereas `data-reading-readiness` is written
from `version.coverageAccount.readiness` — the readiness the account **being rendered** was built
against. Today every render path composes and paints in one synchronous call, so the two always
agree and the pair is genuinely sufficient. The readiness attribute is a single-attribute
restatement that stays correct without depending on that property continuing to hold, because it
travels with the account instead of being sampled beside it. FR-018-005 asks for *one documented
predicate*; the pair is two attributes describing two subsystems, and this is one.

The documented predicate, now used by the committed suite and recorded in
`notes/company-intelligence-lab.md`, is:

```text
body[data-run-status="composed"] AND body[data-reading-readiness="established"]
```

### 3. Does option A land first? → **Yes.**

Readiness is threaded into `buildCoverageAccount` as a third, optional argument. Omitting it means
`established`, which is what every caller written before the parameter existed was already
asserting implicitly, so the 90-test unit suite and the selftest's own `composeRun25` helper are
unchanged and both stayed green. A readiness word outside the closed set is refused with
`C025-READ-CONTRACT` rather than coerced, because a misspelling silently reverting to `established`
would reintroduce the exact claim the parameter exists to prevent.

### 4. Is facet 2 split into its own fast fix? → **Already done, ahead of this decision.**

Facet 2 shipped in Scope 1 as commit `6881aa3a4`, before question 1 was answered, exactly as this
document suggested it could. That is why question 2 can be answered as it is: the attribute pair
became jointly sufficient at that commit, and Scope 2 inherited a correct `data-corpus-status`
rather than having to repair one.

## Residual, Recorded Rather Than Silently Fixed

`dimensionCard()` at `company-intelligence-lab.html:835` renders each dimension's own state word,
and on a pre-corpus paint it still prints `unavailable` with a named absence sentence. That is the
same class of overstatement, on a power-mode surface no requirement in `spec.md` names: FR-018-001
names `#cockpit-coverage-line`, FR-018-002 names the horizon cards, and FR-018-003 asks for one
visible surface. It was left alone deliberately rather than swept in, for a reason beyond scope
discipline: the treatment applied to the coverage table withholds **every** row while the corpus is
in flight, and applying that to the dimension cards would also hide values a warm shared cache had
genuinely resolved. Whether those cards should withhold wholesale or withhold only the absence
claim is a real product judgement, not a mechanical repeat, and it belongs to `bubbles.plan`.

