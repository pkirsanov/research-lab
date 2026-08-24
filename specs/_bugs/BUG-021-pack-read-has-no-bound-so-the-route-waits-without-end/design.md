# Design: BUG-021 — Why The Failure Handling Is Complete And The Bound Is Not

## What This Document Does

It explains the mechanism behind the observation in `bug.md`, which was recorded
first. It then records the owner's decision on where the bound is declared, how
the ordering problem in that decision is resolved, the exact contract change,
what the route must do, and the adversarial case each new assertion must fail on.

An earlier revision of this document ended at an open question and chose
nothing. That revision is superseded by `## The Decision` below, which the owner
authorised on 2026-08-24. The mechanism sections are unchanged and still
current.

## Mechanism

### The one unbounded call

All nine declared documents are read through a single helper. It has no bound of
any kind: no `AbortController`, no `setTimeout`, no `Promise.race`. The promise
it returns settles when, and only when, the network settles.

### Everything downstream is already correct

The boot chain is a sequence of stages, and every stage already terminates in a
handler that produces the right outcome for a failed read:

| Stage | Existing handler | Outcome already correct for a failure |
|---|---|---|
| configuration | outer `.catch` | `RLTAX-CONFIG-INVALID`, `data-rl-tax-state="config-blocked"` |
| federal rule pack | same outer `.catch` | same |
| property regime packs | per-pack `.catch(() => null)` | jurisdiction unresolved, per-domain refusal names it |
| state packs | per-pack `.catch(() => null)` | same |
| benefit, mortality, medicare packs | per-pack `.catch(() => null)` | domain unresolved, per-domain refusal names it |

This round drove each of those handlers by damaging the corresponding document
and observed each produce a named refusal within about sixty milliseconds. The
handling is not merely present, it is exercised and correct.

A rejection produced by a bound is indistinguishable, at those handlers, from a
rejection produced by a 404. So the remedy needs no new handler, no new branch and
no new refusal code. It needs one rejection that today never happens.

### Why a slow read is not the same defect

A three second delay on the medicare pack produced a ready state at 3058ms and a
normal settlement. Delay is already tolerated correctly and must remain so, which
is why FR-021-005 exists: an over-eager bound would convert a working slow origin
into a refusing one.

## Remedy Options

### Option A — Bound inside the helper, declared in the configuration

Race the fetch against a declared bound, and abort the request when the bound
elapses so no request is left outstanding. Every read inherits it, and every
existing handler receives the rejection it already knows how to handle.

This requires a new declared member. **Chosen.**

### Option B — Bound inside the helper, value embedded in the route

The same change with the number written into the route. It needs no contract
change and could ship immediately.

It is rejected as a design, and recorded only so the rejection is on the record:
the route's own discipline is that a policy value is declared and validated, not
embedded. An embedded bound is a default by another name, and this tool refuses
defaults everywhere else.

### Option C — Bound only the configuration and rule-pack stages

Narrower, since those two are the stages that block the whole route. It leaves an
optional pack able to suspend the chain, which is exactly the case observed, so it
does not resolve the defect. Rejected.

### What the remedy is not

It is not a retry. A retry issues a second request for the same document, which
changes the request ledger the privacy specs derive from the page's own
declarations. If a retry is ever wanted it is a separate decision with a separate
privacy review.

## The Decision

**Decided 2026-08-24. Authorised by the owner; recorded here by `bubbles.design`.**

Deliver Option A. Declare the bound governing the eight pack reads as a new
member of the configuration's `rules` section, `packReadBoundMs`, validated by
`validateConfig` and set to `10000`. Declare the bound governing the one read
that precedes the configuration in the module that already owns the
configuration contract, as an exported constant `CONFIG_READ_BOUND_MS`, also
`10000`. **No read stays unbounded**, so `FR-021-001` is satisfied as written.

### How the circularity is resolved

The ordering problem is real and cannot be argued away: the configuration is read
through the same helper the bound would govern, so a bound declared inside the
configuration cannot govern the read that fetches it. It is resolved by
**stratifying the declaration surface**, not by exempting a read.

The governing rule is: *a read may only be bounded by a declaration that is
already resolved at the moment the read is issued.* Exactly two declaration
strata satisfy that at different moments.

| Stratum | Resolved by | Resolved when | Governs |
|---|---|---|---|
| 0 — the contract module | the browser's `<script src="rltaxworkspace.js">` tag | before the inline script that defines `boot` runs at all | the one read of `lifetime-tax-strategy.config.json` |
| 1 — the configuration document | `loadJson` plus `validateConfig` | after that read validates | the eight pack reads |

Stratum 0 is a legitimate home rather than an evasion, for three reasons that are
each checkable:

1. **It is already the owner of this contract.** `rltaxworkspace.js` declares
   `CONFIG_CONTRACT`, `CONFIG_TOP_FIELDS`, `CONFIG_SECTION_FIELDS`,
   `CONFIG_SECTION_VERSIONS` and `validateConfig`. The rule for how the
   configuration document is *read* belongs beside the rules for what it must
   *contain*. Putting it anywhere else would split one contract across two files.
2. **It is a declaration, not a default.** A default is a value substituted when
   a declaration is absent. `CONFIG_READ_BOUND_MS` is substituted for nothing: it
   is the only statement of that bound, it is exported so it can be read and
   asserted, and its absence is a module defect that fails at load rather than a
   hole quietly filled. `FR-021-002` forbids "a literal written into the route",
   and this is neither a literal nor in the route.
3. **It introduces no new unbounded dependency.** The modules are delivered by
   `<script src>`, which the browser resolves before the inline script executes.
   A module that never arrives means `boot` never runs, which is a pre-existing
   failure mode with its own already-shipped outcome — the boot chain's outer
   `.catch` emitting `RLTAX-CONFIG-INVALID` and setting
   `data-rl-tax-state="config-blocked"`. Stratum 0 therefore rests on something
   the route already depends on absolutely, and adds nothing to depend on.

The alternative the filing round left open — "accept the first read as the one
unbounded read and record that acceptance" — is **rejected**. It would leave
exactly one way for the route to wait without end, which is the whole defect, and
it would leave it on the read that blocks everything else. A remedy that fixes
eight of nine reads and writes the ninth down as accepted is not a remedy; it is
the same bug with a paragraph in front of it.

Making stratum 0 *equal* stratum 1 by construction — asserting
`config.rules.packReadBoundMs === CONFIG_READ_BOUND_MS` — is also rejected. They
are bounds on different things: one small local policy document against eight
rule packs of very different sizes. Tying them would mean an operator who wants
more patience for the packs silently gets it for the configuration too, and would
make a legitimate divergence unexpressible. They start at the same number because
that is the number that fits both, not because they are the same declaration.

### Why `10000`

The filing round measured a three-second delay on the medicare pack settling
normally at 3058 ms, and every other terminal state arriving inside 60 ms. Ten
seconds is more than three times the slowest read observed to succeed, which
leaves room for a slower machine or a cold disk without leaving a reader
watching `Loading` for a length of time they would read as broken. It is a
declared value, so an operator who needs a different one changes the
configuration rather than the code.

## The Contract Change

### C1 — the configuration document

In `lifetime-tax-strategy.config.json`, inside the `rules` section, add:

```json
    "packReadBoundMs": 10000,
```

and change that section's `contractVersion` from `lifetime-tax-rules-policy/v1`
to `lifetime-tax-rules-policy/v2`.

The version bump is deliberate. The exact-key-set check alone would already
refuse an old document, so the bump buys no extra refusal — it buys honesty. A
`rules` section that declares a read bound and one that does not are different
contracts, and leaving both stamped `/v1` makes the version string false for one
of them. The string exists so a reader of the document can tell which contract it
satisfies. The change costs two lines: this one and `CONFIG_SECTION_VERSIONS` in
`rltaxworkspace.js`, which are the only two shipped-file occurrences of that
version string.

### C2 — the expected key set

In `rltaxworkspace.js`, `CONFIG_SECTION_FIELDS.rules` is compared against the
document's *sorted* key list, so the expected array must itself stay sorted.
`packReadBoundMs` sorts between `packPath` and `program`:

```js
    rules: Object.freeze([
      "benefitPackPaths", "contractVersion", "declaredTaxYear", "jurisdiction", "medicarePackPaths",
      "mortalityPackPaths",
      "packContentSha256", "packPath", "packReadBoundMs", "program", "propertyPackPaths", "statePackPaths"
    ]),
```

and `CONFIG_SECTION_VERSIONS.rules` becomes `"lifetime-tax-rules-policy/v2"`.

Do not relax the exact-key-set comparison. A configuration without
`packReadBoundMs` must continue to be refused as a missing key, which is what
makes the bound impossible to omit.

### C3 — the value check

`validateConfig` today validates member *values* for `storage`, `sweep` and
`display`, and validates only the key set for `rules`. Add the first `rules`
value check, in the shape the `sweep` checks already use:

```js
    if (isPlainObject(config.rules)) {
      if (!Number.isFinite(config.rules.packReadBoundMs) || config.rules.packReadBoundMs <= 0) {
        refusals.push(configRefusal("rules.packReadBoundMs",
          "the declared document read bound must be a finite number of milliseconds greater than zero"));
      }
    }
```

Use `Number.isFinite`, never the global `isFinite`: `TP-01-10` scans every tax
module for a bare `isFinite(` and fails on one.

### C4 — the stratum-0 declaration

In `rltaxworkspace.js`, beside `CONFIG_CONTRACT`, declare and export:

```js
  /* The bound on the ONE read that precedes the configuration: the read of the configuration
     itself. It cannot come from the configuration, because that document has not arrived yet.
     It lives here because this module already owns what a configuration must be, and it is a
     declaration rather than a default — it stands in for nothing, and its absence is a module
     defect rather than a quietly filled hole. Every other read is bounded by the declared
     rules.packReadBoundMs. See BUG-021 design.md, "How the circularity is resolved". */
  var CONFIG_READ_BOUND_MS = 10000;
```

Add `CONFIG_READ_BOUND_MS: CONFIG_READ_BOUND_MS` to the module's exported api
object so the route and the assertions can read it. Adding an export does not
disturb `TP-01-10`, whose `taxExtractable` list names functions that must be
extractable rather than an exhaustive export surface.

**No new refusal code.** A read that exceeds its bound is, at every handler, the
same event as a read that failed, and each of those handlers already produces the
right outcome. The vocabulary is unchanged by this bug.

## What The Route Must Do

### R1 — the resolved bound

In the inline script, beside the other module aliases, declare one variable and
seed it from stratum 0:

```js
            var readBoundMs = WORKSPACE.CONFIG_READ_BOUND_MS;
```

Immediately after `state.config = config;` in the boot chain, and therefore
before any pack read is issued, promote it to stratum 1:

```js
                    readBoundMs = config.rules.packReadBoundMs;
```

A plain assignment, never `config.rules.packReadBoundMs || something`. `TP-01-09`
scans the tax modules for `(config|pack).<member> ||` and fails on a match; the
route is outside that scan, and writing one there anyway would be the defaulting
`FR-021-002` forbids.

### R2 — the bounded read

`loadJson` keeps its single parameter. `TP-05-06` captures the argument text of
every `loadJson(...)` call site and compares it against a declared list of seven
exact forms, so passing the bound at the call site would fail that assertion and
would also scatter the same value across seven places.

```js
            function loadJson(path) {
                var controller = new AbortController();
                var bound = readBoundMs;
                var timer = window.setTimeout(function () { controller.abort(); }, bound);
                return window.fetch(path, {
                    cache: "no-store",
                    credentials: "same-origin",
                    signal: controller.signal
                }).then(function (response) {
                    window.clearTimeout(timer);
                    if (!response.ok) throw readFailure(path, false);
                    return response.json();
                }, function (readError) {
                    window.clearTimeout(timer);
                    throw readFailure(path, !!readError && readError.name === "AbortError");
                });
            }
```

with one constructor beside it, so both failure modes carry the same two facts:

```js
            function readFailure(path, boundExceeded) {
                var failure = new Error(path);
                failure.rlDocument = path;
                failure.boundExceeded = boundExceeded === true;
                return failure;
            }
```

`bound` is read into a local before the timer is armed so a read in flight cannot
have its bound changed underneath it by the stratum promotion in R1.

This keeps `window.fetch(` at exactly one occurrence, which `TP-05-06` asserts,
and introduces no token from the forbidden transport list — no
`XMLHttpRequest`, no `sendBeacon`, no `EventSource`, no `WebSocket`, no
`serviceWorker`, no `importScripts`. It requests nothing the configuration does
not already declare.

### R3 — naming the document that did not arrive

Two handlers exist and both already produce the right terminal state. Each needs
one line so the reader is told *which* document, which is `FR-021-006`.

The outer `.catch`, which owns the configuration and the federal rule pack, takes
the error and names it:

```js
                }).catch(function (readError) {
                    var document_ = readError && typeof readError.rlDocument === "string"
                        ? readError.rlDocument
                        : "the mandatory configuration or the declared rule pack";
                    var why = readError && readError.boundExceeded === true
                        ? "did not arrive within the declared read bound of " + readBoundMs + " milliseconds"
                        : "could not be read from this origin";
                    bootFailure(RULES.unavailable("RLTAX-CONFIG-INVALID", "config:load:" + document_,
                        document_ + " " + why,
                        "serve this page from a checkout that carries lifetime-tax-strategy.config.json and the declared rule pack, from an origin that answers within the declared bound"));
                    document.body.setAttribute("data-rl-tax-state", "config-blocked");
                });
```

The five per-pack handlers keep their `return null` contract and gain a recorder.
Replace each `.catch(function () { return null; })` with
`.catch(recordUnreadDocument)`, where:

```js
            function recordUnreadDocument(readError) {
                if (readError && typeof readError.rlDocument === "string") {
                    state.unreadDocuments.push(Object.freeze({
                        path: readError.rlDocument,
                        boundExceeded: readError.boundExceeded === true
                    }));
                }
                return null;
            }
```

Add `unreadDocuments: []` to the `state` object literal.

Render them where an absent source belongs — the existing `#power-source-records`
list, immediately after the `sourceRecordList` loop, so a document that did not
arrive appears beside the documents that did:

```js
                for (index = 0; index < state.unreadDocuments.length; index += 1) {
                    var unread = state.unreadDocuments[index];
                    var unreadItem = document.createElement("li");
                    unreadItem.setAttribute("data-rl-unread-document", unread.path);
                    unreadItem.appendChild(text("span", unread.path, "subtle"));
                    unreadItem.appendChild(text("div", unread.boundExceeded
                        ? "This declared document did not arrive within the declared read bound of "
                            + readBoundMs + " milliseconds. Every domain that depends on it is refused by name."
                        : "This declared document could not be read. Every domain that depends on it is refused by name.",
                        "microcopy"));
                    sourceHost.appendChild(unreadItem);
                }
```

No figure is substituted, and the per-domain refusals that already name the
unresolved jurisdiction, year or domain are untouched.

### What must not change

- The declared asset set. The route requests exactly the nine documents the
  configuration declares, and `TP-05-06` derives that count from the
  configuration rather than from a literal.
- The seven `loadJson` call-site argument forms.
- The single `window.fetch(` occurrence.
- The existing per-stage handlers' outcomes. A bound rejection and a 404 are the
  same event to them, which is why this remedy adds no refusal branch.

## The Boundary, Exactly

Both sides are driven from the test with Playwright's own request interception,
so no separate server capability is needed and the harness is visibly distinct
from the system under test. The intercepted path is a declared one, so the URL
the page requests is unchanged and the privacy ledger is undisturbed.

| Side | Harness behaviour on one declared pack path | Expected |
|---|---|---|
| tolerated | the handler waits `3000` ms, then calls `route.continue()` | the route reaches `data-rl-tax-state="ready"` and settles with figures identical to the undelayed settlement |
| refusing | the handler is entered and never fulfils, continues or aborts | the route reaches a terminal `data-rl-tax-state` and names the document, within `10000` ms plus the suite's own margin |

`3000` and `10000` are 3.3× apart, which is the gap the filing round's own
measurement justifies: 3058 ms was observed to settle, and nothing between 3058
ms and the bound was measured. Narrowing the pin below the measurement would
assert something no one has seen.

Use the medicare pack path for both, because it is last in the boot chain, so
every earlier stage is known to have completed and a failure cannot be confused
with an earlier one.

## The Adversarial Case Each New Assertion Must Fail On

Every assertion below must be shown to fail under its mutation, through
`scripts/red-green-probe.sh` with `--summary-match` pinned to that assertion's
own wording rather than to the aggregate pass count.

| Assertion | Must fail when |
|---|---|
| `TB-021-04`, the declared bound is validated | `packReadBoundMs` is deleted from the configuration — the exact-key-set check must refuse; and, separately, when it is present but set to `0`, to `-1`, to `"10000"` and to `null`, each of which must be refused by C3 rather than by the key check |
| the expected-key-set pin | `packReadBoundMs` is added to the document but not to `CONFIG_SECTION_FIELDS.rules`, and when it is added to `CONFIG_SECTION_FIELDS.rules` but not to the document — both directions must refuse |
| the stratum-0 pin | `CONFIG_READ_BOUND_MS` is removed from the module's exports, and when the route is mutated to arm the timer from a numeric literal instead of from `readBoundMs`. The second mutation is the one that matters: it is exactly what Option B would have shipped, and an assertion that only checks that *a* timer exists cannot fail on it |
| `TB-021-01`, a withheld pack reaches a terminal state and names the document | the `AbortController` is constructed but its `signal` is not passed to `fetch`, which leaves the request outstanding and the promise pending — this is the most likely partial implementation and a bare `setTimeout` race would not fail on it |
| `TB-021-03`, the header never remains `Loading` | the timer is armed but the rejection is swallowed, for instance by a `.catch` on `loadJson` itself that resolves to `null` instead of rethrowing |
| `TB-021-02` and `TB-021-05`, a delayed read still settles | the bound is lowered to `1000`, which is below the 3058 ms the filing round observed settling. This is the assertion that stops the remedy being delivered by making the route impatient, and it is the reason the tolerated side must be pinned at a delay a real read has actually taken |
| `TB-021-06`, a withheld pack refuses rather than settling | the bound is raised to a number large enough to outlast the suite's own timeout, which is how a real bound decays into no bound at all |

The last two rows are why both sides must be pinned. A bound asserted only on the
failing side can be widened until it is useless, and one asserted only on the
settling side can be narrowed until a working slow origin starts refusing.

## Explicitly Not In Scope

- **Retrying a read.** A bound and a retry are different decisions, and a retry
  changes the privacy surface by issuing a second request for a declared
  document.
- **Parallelising the boot chain.** A latency question, recorded in the
  stabilization report, not a correctness one.
- **A partially delivered body that then stalls.** Only the never-starts case was
  driven. The remedy bounds the whole read rather than the first byte, so it
  covers the stall as well, but that is a consequence rather than a measurement
  and no assertion here claims it.
