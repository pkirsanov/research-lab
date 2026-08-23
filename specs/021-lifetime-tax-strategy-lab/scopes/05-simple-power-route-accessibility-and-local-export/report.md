# Scope 5 Execution Report — Simple/Power Route, Accessibility, And Local Export

This file is the evidence surface for scope 5. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-05-01

Scenario SCN-021-013 — Simple's rendered field set holds no candidate grid,
per-bracket table, rule trace or raw curve series, and every excluded detail has
a Power link.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed. RED and GREEN below are raw terminal output from the
identical command, bounded by `evidence-capture.sh`.

RED — probe C renamed the Simple headline's field id from `headlineFederalTax`
to `bracketBandTrace` at its render site and left `SIMPLE_FIELDS` untouched. That
models the real defect the row guards: a detail surface leaking into the Simple
view without being admitted to the closed list.

```
# PROBE-C RED Simple renders an undeclared field id bracketBandTrace outside SIMPLE_FIELDS
$ node scripts/selftest.mjs
exit: 1
lines: 3478
sha256: 95c9ef35295a8f68487d39f5b121348eb28971f4a93e3f58df2facb08b80dba5
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-05-01: Simple renders exactly its closed decision-field set with no candidate grid, per-band table, rule trace or raw curve series, the renderer refuses a field outside that set, every rendered field is declared and every declared field is rendered, and the declared Power sections and t
  ✗ FAIL: TP-05-08: the derived Simple field identity holds in both directions with the three new fields present — every id drawn through the Simple constructor is admitted by the closed list and every member of the closed list has a render site — both directions are proven able to fail, and no Simp
================================================
Research-Lab self-test: 3062 passed, 3 failed
================================================
```

The RED is the intended assertion failing. One mutation broke the identity in
both directions at once — `bracketBandTrace` is rendered but not declared, and
`headlineFederalTax` is declared but no longer rendered — and both the Scope 05
row and the later cross-family TP-05-08 identity row caught it. That is the
property the row claims: the restriction is enforced by two-directional
identity, so it cannot be satisfied by a matching count.

The mutation was reverted immediately and the revert proven before the same
command was rerun:

```
=== revert check ===
(empty = clean)
```

```
# PROBE-C GREEN same command after immediate revert
$ node scripts/selftest.mjs
exit: 1
lines: 3478
sha256: 928ce996e8727536328873824301982ddab66eff6cc4192840c90eccfbc87a7a
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
--- omitted 3438 line(s); sha256 above covers the full output ---
================================================
Research-Lab self-test: 3064 passed, 1 failed
================================================
```

Both moved assertions returned and the count returned to the session-entry
baseline of `3064 passed, 1 failed`.

### TP-05-02

Scenario SCN-021-013 — Simple and Power read one result envelope and neither
recomputes a tax, a curve point or a conversion amount.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed. RED and GREEN below are raw terminal output from the
identical command, bounded by `evidence-capture.sh`.

RED — probe D replaced the Simple headline's envelope read with a second live
call to the engine, so the view derived its own tax instead of rendering the one
the envelope already carried. That is the precise defect the row exists to
refuse: two derivations of the same figure that can silently disagree.

```
# PROBE-D RED renderSimple recomputes the tax instead of reading the envelope
$ node scripts/selftest.mjs
exit: 1
lines: 3478
sha256: 493a124589c175dba7fd2f92382325c5c547ae8086ea89b0eba46d04c7817998
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-05-02: exactly one function builds the result envelope, both views read it, and neither Simple nor Power recomputes a tax, a curve point or a conversion amount of its own
  ✗ FAIL: TP-05-11: the Simple headline is sourced from totalFederalTax and from no single leg, and the binding is proven consequential — the same household settles an ordinary leg of 10970.00 against a total of 113039.00, so a headline reading the ordinary leg would under-state the tax owed by 1020
  ✗ FAIL: TP-05-05: the Simple renderer reads settlement.totalFederalTax and reads none of the four single leg members anywhere in its code, the comment naming the forbidden leg is proven to be prose rather than a read, and the fixture makes the distinction real — the ordinary leg is non-zero, stric
  ✗ FAIL: TP-05-06: a renderer reading ordinaryTax, preferentialTax, netInvestmentIncomeTax or additionalMedicareTax in place of the total is caught one per leg, and the unmutated renderer passes the identical detector
================================================
Research-Lab self-test: 3060 passed, 5 failed
================================================
```

The RED is the intended assertion failing, and four independent guards caught
the single mutation: the Scope 05 single-envelope row plus three later rows that
pin the headline's source member. So "one envelope, two renderings" is enforced
by the scope that owns the renderer and re-checked by every scope that adds a
figure to it.

The mutation was reverted immediately and the revert proven before the same
command was rerun:

```
=== revert check ===
(empty = clean)
```

```
# PROBE-D GREEN same command after immediate revert
$ node scripts/selftest.mjs
exit: 1
lines: 3478
sha256: 26fa01f15567b638d89951b82733ee18e6b5fc3fb6cbd2bb48288e0bb2d99b85
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
--- omitted 3438 line(s); sha256 above covers the full output ---
================================================
Research-Lab self-test: 3064 passed, 1 failed
================================================
```

All four moved assertions returned and the count returned to the session-entry
baseline of `3064 passed, 1 failed`.

### TP-05-03

Scenario SCN-021-014 — every displayed value has a contextual tooltip sourced
from its own record.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed. The mutation, both runs and the revert were driven by
`scripts/red-green-probe.sh`, which installs its restore trap before it writes,
verifies the mutation landed, and re-verifies the revert against the committed
blob hash. The block below is the harness's own emitted verdict, verbatim.

The probe renames the `aria-describedby` attach inside the one `valueNode`
constructor to an inert `data-tip-ref`. That is the exact defect the row names:
the tooltip element is still built, so the page still looks annotated, but no
displayed figure is programmatically associated with its explanation any more.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-03 valueNode drops the aria-describedby tooltip association
file:             lifetime-tax-strategy-lab.html
mutation:         figure.setAttribute("aria-describedby", "tip-" + fieldId);  ->  figure.setAttribute("data-tip-ref", "tip-" + fieldId);   (1 occurrence(s))
command:          bash -c node\ scripts/selftest.mjs\ \>\>\ /tmp/rg-0503.log\ 2\>\&1\;\ rc=\$\?\;\ tail\ -3\ /tmp/rg-0503.log\;\ exit\ \$rc
red-exit:         1
red-summary:      Research-Lab self-test: 3171 passed, 1 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3172 passed, 0 failed
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

The RED is the intended contract assertion and no other. The suite moved by
exactly one assertion, and the single failure line names this row:

```
  ✗ FAIL: TP-05-03: exactly one constructor writes a displayed value, and it always attaches an aria-describedby tooltip element sourced from the field’s own record, so a value with no tooltip cannot be rendered
```

GREEN is the identical command after the harness-verified revert, back at the
session baseline of `3172 passed, 0 failed` at exit 0.

### TP-05-04

Scenario SCN-021-014 — every chart has a text-equivalent table emitted from the
same record.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed, through the same harness.

The probe replaces the curve table's source read with an empty array, so the
chart is still drawn while the text equivalent stops being emitted from the
record the chart is drawn from. That is the accessibility defect the row exists
to refuse — a canvas with no equivalent a non-visual reader can reach.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-04 the curve text-equivalent table stops being emitted from the curve record
file:             lifetime-tax-strategy-lab.html
mutation:         var rows = ENGINE.curveTextRows(curve);  ->  var rows = [];   (1 occurrence(s))
command:          bash -c node\ scripts/selftest.mjs\ \>\>\ /tmp/rg-0504.log\ 2\>\&1\;\ rc=\$\?\;\ tail\ -3\ /tmp/rg-0504.log\;\ exit\ \$rc
red-exit:         1
red-summary:      Research-Lab self-test: 3171 passed, 1 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3172 passed, 0 failed
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

One assertion moved, and it is this row:

```
  ✗ FAIL: TP-05-04: the chart and the text-equivalent table are both emitted from the same curve record, the table carries an aria-label, and the chart carries an aria-label plus a text fallback
```

### TP-05-05

Scenario SCN-021-014 — every unavailable record renders its code, reason and
remediation; a blank, a bare dash and a zero are each proven to fail.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed. RED and GREEN below are raw terminal output from the
identical command, bounded by `evidence-capture.sh` (the sha256 covers every
line produced, and `--verify` re-derives it).

RED — probe B replaced the remediation line inside `unavailableNode` with a bare
em dash, leaving the code, domain and reason lines standing. That is the exact
degradation the row exists to refuse: a refusal that still looks populated but
no longer tells the reader what would make the domain available.

```
# PROBE-B RED unavailableNode renders a bare dash instead of the remediation
$ node scripts/selftest.mjs
exit: 1
lines: 3478
sha256: b9fdbe7dc70d51374af50b67c5ffa054e22d6acc2222381c54fe1cb56b8c1954
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-05-05: every TaxUnavailable renders its code, its domain, its reason and its remediation on a focusable element, and the constructor emits no blank, bare dash or zero in their place
  ✗ FAIL: TP-05-11: the one unavailable constructor renders the code, the domain, the reason and the remediation on a focusable element and writes no dash, blank or zero in their place, and every refusal the benefit, inclusion and medicare families raise carries all four members as a non-empty strin
================================================
Research-Lab self-test: 3062 passed, 1 failed
================================================
```

The RED is the intended contract assertion failing, not a syntax error or a
different break: TP-05-05 names the missing remediation and the forbidden dash
directly. It is also stronger than the row asks for. Two independent guards
fired on one mutation — the Scope 05 row and the later cross-family TP-05-11
row, which re-checks the same single constructor for the benefit, inclusion and
Medicare refusal families. So the constructor is protected in both directions:
one renderer defect is caught by the scope that owns the renderer and by the
scopes that depend on it. The third failure line, `committed surface carries no
personal identifier`, is the pre-existing baseline failure described under
TP-05-16; it is not attributable to this probe and it is present identically in
the GREEN below.

The mutation was reverted immediately and the revert proven before the same
command was rerun:

```
=== revert check ===
(empty = clean)
```

```
# PROBE-B GREEN same command after immediate revert
$ node scripts/selftest.mjs
exit: 1
lines: 3478
sha256: 57cb1c15540c1be92dd05988565335b9b11563ca8fb625cf6bb3ac0821521ae3
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
--- omitted 3438 line(s); sha256 above covers the full output ---
================================================
Research-Lab self-test: 3064 passed, 1 failed
================================================
```

Both TP-05-05 and TP-05-11 return to passing and the count returns to the
session-entry baseline of `3064 passed, 1 failed`. The two assertions the probe
moved are exactly the two that came back.

### TP-05-06

Scenario SCN-021-013 — the educational not-tax-advice framing is present and no
page string claims an error rate, a track record, an accuracy figure or a plan
success probability.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed, through the same harness.

The probe inserts a track-record claim into the disclosure paragraph itself —
the one place a reader is most likely to trust — leaving the not-tax-advice
framing intact. This deliberately exercises the substantive limb rather than
the easy one: the row could have been satisfied by deleting the framing string,
which would have proven only that the framing check works, not that the claim
scan can catch a claim smuggled into otherwise-correct copy.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-06 the page copy starts claiming a track record
file:             lifetime-tax-strategy-lab.html
mutation:         advice. It does not prepare or file a return  ->  advice. It has a track record and does not prepare or file a return   (1 occurrence(s))
command:          bash -c node\ scripts/selftest.mjs\ \>\>\ /tmp/rg-0506.log\ 2\>\&1\;\ rc=\$\?\;\ tail\ -3\ /tmp/rg-0506.log\;\ exit\ \$rc
red-exit:         1
red-summary:      Research-Lab self-test: 3171 passed, 1 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3172 passed, 0 failed
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

One assertion moved, and it names the leaking surface:

```
  ✗ FAIL: TP-05-06: no page or strategy string claims a published error rate, a self-invalidation statistic, a track record, an accuracy figure or a plan success probability, and the educational not-tax-advice framing is present (lifetime-tax-strategy-lab.html:track record)
```

### TP-05-07

Scenario SCN-021-015 — the sanitizer removes every identifier category and the
omitted-field manifest matches its actual exclusions exactly.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed. RED and GREEN below are raw terminal output from the
identical command, bounded by `evidence-capture.sh`.

RED — probe E made `sanitizeForExport` publish `omittedFields` one member short
of what it actually withheld. That is the exact defect the row names: a field
dropped from the export without the manifest admitting it, so the reader is told
the file is more complete than it is.

```
# PROBE-E RED sanitizeForExport under-reports omittedFields by one member
$ node scripts/selftest.mjs
exit: 1
lines: 3478
sha256: a61d3c40b80b304c792e08c46f5d42d21ac9ff76a0c349b070b9af2705646118
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
  ✗ FAIL: TP-05-07: the export manifest lists every withheld workspace member exactly, an under-reporting manifest is proven to disagree with the sanitizer, and the file carries the sensitivity warning, the never-collected categories and no identifier
  ✗ FAIL: TP-03-15: the residency declaration is named in the privacy inventory, recorded as an unsupplied domain when absent, removed by the clear action, and redacted out of the export manifest so the location signal reaches no exported file
================================================
Research-Lab self-test: 3062 passed, 3 failed
================================================
```

The RED is the intended assertion failing. A second, privacy-owned guard fired
on the same mutation — the residency-declaration row, which depends on the
manifest naming what it redacts — so under-reporting is caught both as a
manifest-accuracy defect and as a location-signal disclosure defect.

The mutation was reverted immediately and the revert proven before the same
command was rerun:

```
=== revert check ===
(empty = clean)
```

```
# PROBE-E GREEN same command after immediate revert
$ node scripts/selftest.mjs
exit: 1
lines: 3478
sha256: 00e8d578172557dcb11f38b07c1041fbceed7261964b69d706a01330d4be2f2e
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
--- omitted 3438 line(s); sha256 above covers the full output ---
================================================
Research-Lab self-test: 3064 passed, 1 failed
================================================
```

Both moved assertions returned and the count returned to the session-entry
baseline of `3064 passed, 1 failed`.

### TP-05-08

Scenario SCN-021-015 — the written storage key set is unchanged from Scope 01,
clear-all removes every declared private category, and no key carries a portfolio
prefix.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed, through the same harness.

The probe makes `clearAllPrivateData` skip the first declared key while still
reporting it in `removedKeys`. That is the worst shape this row can take: the
clear action tells the household its private data is gone while one declared
key is still sitting in storage. A cruder mutation — removing nothing — would
have been caught by the count alone and would not have proven the assertion
compares reported removals against the store's actual residue.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-08 clear-all reports removing a declared key it actually leaves standing
file:             rltaxworkspace.js
mutation:         storage.removeItem(keys[index]);  ->  if (index > 0) storage.removeItem(keys[index]);   (1 occurrence(s))
command:          bash -c node\ scripts/selftest.mjs\ \>\>\ /tmp/rg-0508.log\ 2\>\&1\;\ rc=\$\?\;\ tail\ -3\ /tmp/rg-0508.log\;\ exit\ \$rc
red-exit:         1
red-summary:      Research-Lab self-test: 3167 passed, 5 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3172 passed, 0 failed
revert-verified:  yes (committed=6760587f2303516755ab6a5e14436050717f1227 restored=6760587f2303516755ab6a5e14436050717f1227)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

The intended row fired, and four independent privacy guards fired with it, so a
silently-retained key is caught by the scope that owns the clear action and by
every scope that declares a private member into it:

```
  ✗ FAIL: TP-01-08: clearing private data removes exactly the three declared keys, leaves a portfolio-prefixed key untouched, and a foreign key write is refused
  ✗ FAIL: TP-05-08: the written storage key set is unchanged from Scope 01, clear-all removes exactly those three keys while leaving a portfolio-prefixed key standing, and the page itself writes only the display-mode key directly
  ✗ FAIL: TP-03-15: the residency declaration is named in the privacy inventory, recorded as an unsupplied domain when absent, removed by the clear action, and redacted out of the export manifest so the location signal reaches no exported file
  ✗ FAIL: TP-04-21: the lookback declaration and the year it belongs to are inventoried workspace members that start undeclared, are named by the unavailable-domain report while undeclared, are omitted by the export sanitizer
  ✗ FAIL: TP-02-13: the privacy inventory names both declared surtax bases inside the household-values entry, the clear action removes the stored workspace carrying both declared amounts, and the export sanitizer covers them
```

All five returned on the identical command after the harness-verified revert.
This probe therefore also carries the intended RED for Scope 01's TP-01-08,
recorded there.

### TP-05-09

Scenario SCN-021-013 — the tool identifier and its page appear in none of the six
registration surfaces.
Command: `node scripts/selftest.mjs`

**Claim Source:** executed, through the same harness.

The probe names the tool inside an existing `tools.json` description string. It
deliberately does not add a tool entry: a leak that keeps the registry schema
intact is the one a schema check would miss, so this proves the row scans for
the identifier itself rather than for a well-formed registration.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-09 a registration surface starts naming the unregistered tool
file:             tools.json
mutation:         Interactive single-file research tools for the AI-datacenter capex cycle  ->  Interactive single-file research tools including the lifetime-tax lab for the AI-datacenter capex cycle   (1 occurrence(s))
command:          bash -c node\ scripts/selftest.mjs\ \>\>\ /tmp/rg-0509.log\ 2\>\&1\;\ rc=\$\?\;\ tail\ -3\ /tmp/rg-0509.log\;\ exit\ \$rc
red-exit:         1
red-summary:      Research-Lab self-test: 3170 passed, 2 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3172 passed, 0 failed
revert-verified:  yes (committed=bdc401b849dab05ca73182b2bc5d8cb836670b7f restored=bdc401b849dab05ca73182b2bc5d8cb836670b7f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Both failures name the offending surface rather than failing generically:

```
  ✗ FAIL: TP-05-09: the lifetime-tax route and its modules appear in none of tools.json, index.html, rlnav.js, README.md, notes/README.md or the market-brief configuration (tools.json)
  ✗ FAIL: TP-05-21 and TP-05-25: the combined route and its two new modules appear in no registration surface, and this feature adds no new root HTML (tools.json)
```

`git status --short -- tools.json` returned no rows after the probe, and the
harness re-derived the committed blob hash, so the registry is byte-identical to
`HEAD`. The tool remains registered nowhere.

### TP-05-10

Scenario SCN-021-013 — the finished root page still carries its deploy decision
and the pages-site build accepts it.
Command: `node scripts/build-pages-site.mjs`

**Claim Source:** executed. RED and GREEN below are raw terminal output from the
identical command, captured in this session.

RED — probe A removed the `lifetime-tax-strategy-lab.html` entry from
`site-exclusions.json` and left every other entry standing. The build refused by
name rather than silently shipping an unreachable page:

```
=== PROBE-A RED: lifetime-tax-strategy-lab.html deploy decision removed ===
file://<repo-root>/scripts/build-pages-site.mjs:24
  if (!condition) throw new Error(message);
                        ^

Error: unregistered root page lacks a deploy decision: lifetime-tax-strategy-lab.html
    at assert (file://<repo-root>/scripts/build-pages-site.mjs:24:25)
    at planPagesSite (file://<repo-root>/scripts/build-pages-site.mjs:49:3)
    at buildPagesSite (file://<repo-root>/scripts/build-pages-site.mjs:83:16)
    at file://<repo-root>/scripts/build-pages-site.mjs:110:16
    at ModuleJob.run (node:internal/modules/esm/module_job:447:25)
    at async node:internal/modules/esm/loader:646:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v26.4.0
BUILD_PAGES_EXIT=1
```

The absolute checkout path in the `file://` frames is written `file://<repo>/`
here so the committed surface carries no personal identifier; no other character
of the captured output is changed.

The mutation was reverted immediately and the revert was proven before the same
command was rerun:

```
=== revert check ===
(empty = clean)
=== PROBE-A GREEN: same command, decision restored ===
{"contractVersion":"pages-site-build-result/v1","dryRun":false,"registeredPages":28,"excludedPaths":12,"rootFiles":120,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/004902309400a815a8ac1da2877422310e381d5c20748f711cbd0233e959a67a","omittedOrphanIndexes":144}
BUILD_PAGES_EXIT=0
```

The GREEN also proves the second half of the row: `registeredPages: 28` with the
page counted among `excludedPaths: 12` means the finished page is accepted as an
unregistered page rather than registered, so the Scope 01 deploy decision is
still doing exactly the job it was added for.

### Scenario SCN-021-013

`Regression: SCN-021-013 Simple opens first with a decision level answer and Power holds the detail`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-013 Simple opens first with a decision level answer and Power holds the detail" --reporter=list`

**Claim Source:** executed, through `scripts/red-green-probe.sh` against the real
route. The probe inverts the stored-mode default so an unvisited reader lands in
Power. That is the defect the row is named after — the route stops opening on the
decision-level answer and opens on the drill-down instead.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-11 the route no longer opens Simple first
file:             lifetime-tax-strategy-lab.html
mutation:         window.localStorage.getItem(MODE_KEY) === "power" ? "power" : "simple"  ->  window.localStorage.getItem(MODE_KEY) === "simple" ? "simple" : "power"   (1 occurrence(s))
red-exit:         1
red-summary:        1 failed
green-exit:       0
green-summary:      1 passed (3.0s)
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

The RED is the row's own first expectation, at the top of the test body:

```
    Error: expect(locator).toHaveAttribute(expected) failed
    > 41 |   await expect(page.locator('#modeSimple')).toHaveAttribute('aria-pressed', 'true');
      42 |   await expect(page.locator('#simple')).toBeVisible();
      43 |   await expect(page.locator('#power')).toBeHidden();
```

### Scenario SCN-021-014

`Regression: SCN-021-014 every value is explained and every unavailable state is keyboard reachable`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-014 every value is explained and every unavailable state is keyboard reachable" --reporter=list`

**Claim Source:** executed, through the same harness against the real route. The
probe renames the `aria-describedby` attach to an inert attribute, so the
tooltip element is still built and still visible while no displayed figure is
programmatically associated with its explanation. The browser row resolves the
association live rather than reading the source, so it catches what a source
scan alone could not distinguish from a renamed-but-still-wired attribute.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-12 displayed values lose their programmatic tooltip association
file:             lifetime-tax-strategy-lab.html
mutation:         figure.setAttribute("aria-describedby", "tip-" + fieldId);  ->  figure.setAttribute("data-tip-ref", "tip-" + fieldId);   (1 occurrence(s))
red-exit:         1
red-summary:        1 failed
green-exit:       0
green-summary:      1 passed (2.8s)
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
    Error: expect(received).toBe(expected) // Object.is equality
    > 184 |     expect(entry.role).toBe('tooltip');
```

### Scenario SCN-021-014 mobile

`Regression: SCN-021-014 tax and account tables stay readable at the mobile viewport`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-014 tax and account tables stay readable at the mobile viewport" --reporter=list`

**Claim Source:** executed, through the same harness against the real route at
390×844. The probe relaxes the per-table scroll container to `visible`, so the
nine wide tables push the document itself into horizontal scroll instead of each
scrolling inside its own box.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-13 tables lose their scroll container and trap the mobile viewport
file:             lifetime-tax-strategy-lab.html
mutation:         overflow-x: auto;  ->  overflow-x: visible;   (1 occurrence(s))
red-exit:         1
red-summary:        1 failed
green-exit:       0
green-summary:      1 passed (3.2s)
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
    Error: expect(received).toBeLessThanOrEqual(expected)
    > 278 |   expect(documentOverflow).toBeLessThanOrEqual(1);
```

The RED lands on the document-level overflow rather than on the per-table
container check, which is the stronger of the two: the row's real promise is
that no table traps the page, not that a class name is present.

### Scenario SCN-021-015

`Regression: SCN-021-015 a private export happens only on explicit action, the request ledger does not grow after first paint, and every entry is a declared same-origin read`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-015 a private export happens only on explicit action, the request ledger does not grow after first paint, and every entry is a declared same-origin read" --reporter=list`

**Renamed 2026-08-22 (F-REG-02).** The persistent title was
`Regression: SCN-021-015 a private export happens only on explicit action and the request ledger stays empty`
until this date. That wording was false: the route issues same-origin document
reads and `<script src>` module loads during boot, so the ledger is never empty.
What the row proves is `expect(ledger.length).toBe(afterFirstPaint)` — no growth
after first paint — and
`expect(paths.filter((entry) => !declaredAssets.includes(entry))).toEqual([])` —
every entry is a same-origin read of a document the route's own script tags and
declared configuration name. Adversarial cases: a request issued after first
paint moves `ledger.length` and fails the first clause; a read of an undeclared
or cross-origin document fails the second, which is pinned by
`expect(declaredAssets).not.toContain('/definitely-not-declared-by-this-route.js')`.
Unlike the SCN-022-013, SCN-023-001, SCN-024-001 and SCN-024-014 rows, this row
carries **no** `expect(afterFirstPaint).toBeGreaterThan(0)` pin, so it would still
pass against a route that read nothing at all; the title therefore does not claim
that the declared reads resolve. Strengthening that is a planning matter and is
routed, not taken here. The captured block below was recorded under the
superseded title and is left exactly as executed; a fresh capture under the new
title follows it.

**Claim Source:** executed. Raw terminal output, bounded by
`evidence-capture.sh`:

```
# TP-05-14 SCN-021-015 explicit-action private export and empty request ledger
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression: SCN-021-015 a private export happens only on explicit action and the request ledger stays empty --reporter=list
exit: 0
lines: 6
sha256: e4ae04112ee5986d4b67b59b7ab25bb2dfa7906af4f759c0e57ea5d081913fe3
--- output ---

Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/lifetime-tax-route.spec.mjs:290:1 › Regression: SCN-021-015 a private export happens only on explicit action and the request ledger stays empty (830ms)

  1 passed (2.3s)
```

Fresh capture under the new persistent title, recorded 2026-08-22 after the
rename, proving the row's `--grep` still selects its own test — selected 1,
passed 1:

```text
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-015 a private export happens only on explicit action, the request ledger does not grow after first paint, and every entry is a declared same-origin read" --reporter=line
exit: 0
lines: 5
sha256: c57f0dcbd134c5a74b5eacd13f85478d343862652e1bec5e22ece8d5c693e543

Running 1 test using 1 worker

[1/1] [system-chrome] › tests/lifetime-tax-route.spec.mjs:302:1 › Regression: SCN-021-015 a private export happens only on explicit action, the request ledger does not grow after first paint, and every entry is a declared same-origin read
  1 passed (2.3s)
```

**The earlier uncertainty declaration on this row is now discharged.** It
previously carried a GREEN with no RED, because no mutation probe had been
applied. One has now been applied through `scripts/red-green-probe.sh`, and the
row discriminates.

The probe removes the acknowledgement term from the one runtime gate, so the
export control goes live the moment configuration resolves — before the reader
has acknowledged that the file carries household values. That is precisely the
"no file without explicit user action" clause:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-14 the export control goes live without the sensitivity acknowledgement
file:             lifetime-tax-strategy-lab.html
mutation:         byId("exportPrivateFile").disabled = !byId("exportAcknowledgement").checked || !state.config;  ->  byId("exportPrivateFile").disabled = !state.config;   (1 occurrence(s))
red-exit:         1
red-summary:        1 failed
green-exit:       0
green-summary:      1 passed
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
    Error: expect(locator).toBeDisabled() failed
      - Expect "toBeDisabled" with timeout 5000ms
    > 314 |   await expect(page.locator('#exportPrivateFile')).toBeDisabled();
```

**Finding — the markup `disabled` attribute on the export control is inert, and
the first probe attempt proved it.** The first mutation deleted `disabled` from
`<button id="exportPrivateFile" type="button" disabled>` and the row still
passed. The reason is that `updateExportEnabled()` is called during boot and
assigns `.disabled` from the checkbox state, so by the time any assertion runs
the runtime gate has already overwritten whatever the markup said. The attribute
is therefore a first-paint convenience, not the gate. This is a probe-design
finding rather than an assertion weakness: the row was never relying on the
attribute, and the second probe — aimed at the real gate — made it fail
immediately. The attribute is left in place because it still suppresses a click
in the window before boot completes; it is recorded here so a future reader does
not mistake it for the enforcement point.

**Finding — a Playwright summary channel must be duration-normalised.** The
first probe run reported `discriminating: yes (summary differs: "  1 passed
(2.6s)" vs "  1 passed (2.1s)")`. Both runs had passed and both exited 0; the
only difference was the elapsed-time string inside Playwright's summary line. A
`--summary-match` of `[0-9]+ (passed|failed)` therefore captures a value that
changes between two identical outcomes, so the summary channel can report a
discrimination that did not happen. Every browser probe recorded above is
unaffected — each discriminated on exit status, and the summary channel was not
the deciding one — but the re-run pipes the tail through
`perl -pe "s/\s*\([0-9.]+m?s\)//g"` so the compared line is `  1 failed` against
`  1 passed` with no timing in it. A probe whose ONLY signal is a Playwright
summary line must strip the duration first, or it can pass on noise.

The row also carries a built-in negative control the test performs on itself: it
asserts `downloads.length === 0` at two separate points before the click — after
first paint and after the household is declared — and only then asserts
`downloads.length === 1` after the explicit click on an acknowledged control. So
the "no file without explicit action" clause is proven by a counted transition,
not by observing that a file eventually appeared.

The row covers all four clauses of the export obligation against the real
browser rather than against the module:

- **No file without explicit action** — `#exportPrivateFile` is asserted
  `toBeDisabled()` until `#exportAcknowledgement` is checked, and the download
  count is asserted zero on both sides of the household entry pass.
- **Warns about sensitivity** — `#exportWarning` is asserted to contain
  `It is written only when you ask for it` before any file can exist, and the
  written file's own `warning` member is asserted longer than 40 characters.
- **Carries no identifier** — the downloaded file is read from disk, flattened,
  and asserted not to contain `"name"`, `"address"`, `"accountnumber"`,
  `"taxidentifier"`, `"credential"`, `"ssn"` or `"email"`. The scan excludes only
  the `neverCollected` disclosure array, and it excludes it soundly: the
  assertion immediately above pins that array to its exact five declared members,
  so no value can hide inside it. The scan is proven to still reach real content
  by asserting the flattened surface does contain `"ordinary"`,
  `"omittedfields"` and the sentinel household amount.
- **Manifest matches the sanitizer** — the written `omittedFields` is asserted to
  contain `generation`, `updatedAt` and `declaredUnavailableDomains`, and the
  exact-match half is carried by TP-05-07 above with its own RED.

### TP-05-15

The complete cumulative Feature 021 browser suite over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-0" --reporter=list`

### TP-05-16

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`
**Claim Source:** executed (2026-08-19)

```text
# PROBE-CSP GREEN selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3466
sha256: fbd2d65ea58af3e4961ec05823ccf52aaeac907dbad0549a9e74f31ce51c3d16
Research-Lab self-test: 3067 passed, 0 failed
```

`3067 passed, 0 failed`, exit 0. This is the first zero-failure reading this
scope has recorded: every earlier run in this report closed at
`3064 passed, 1 failed`, and the one failure was the repository's
`committed surface carries no personal identifier` assertion, tripped by absolute
checkout paths pasted into two Feature 021 report files. Those were rewritten to
the `<repo>/` form at the start of this session, which is why the count both rose
and cleared. `node scripts/pii-scan.mjs` independently confirms it at
`files=8102 messages=1515 findings=0 OK`.

No pre-existing assertion was edited, relaxed or removed: the pass count moved
**up**, from 3064 to 3067, and the three recovered assertions are the ones the
identifier failure had been masking rather than new ones. The `sha256` covers all
3466 lines the run produced and is re-derivable with `evidence-capture.sh
--verify`, so this summary cannot be a paste.

### TP-05-17

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`
**Claim Source:** executed (2026-08-19)

```text
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=678 references=14888 distinctPaths=244 missingPaths=67 baseline=67 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
paths_exit=0

$ git status --short -- scripts/validate-spec-test-paths.baseline.json
(no rows)
```

`new=0` is the clause that matters, and `missingPaths=67 baseline=67` is what
makes it meaningful: the 67 known-missing paths are exactly the baseline, so
`new=0` was reached by adding nothing rather than by the baseline having been
grown to absorb a new miss. `stale=0` confirms the reverse direction — the
baseline lists no path that has since started resolving, so it is not padded. The
path-scoped `git status` returns no rows, proving the baseline file itself is
byte-identical to `HEAD` and was not edited to produce this result.

## Cumulative Zero-Network Canary

**Claim Source:** executed. The canary is the same TP-05-14 run recorded under
Scenario SCN-021-015 above (`exit: 0`, sha256
`e4ae04112ee5986d4b67b59b7ab25bb2dfa7906af4f759c0e57ea5d081913fe3`), read for
its network clauses rather than its export clauses. The sentinel household value
is `SENTINEL_ORDINARY = '123457'`, declared once in `tests/lifetime-tax.support.mjs`.

The row exercises the finished route end to end — first paint, a full household
entry pass, the settlement, the view switch to Power, the export click, and the
clear action — and then asserts the sentinel reached none of the five surfaces
the obligation names:

| Surface the sentinel must not reach | Assertion in the row |
| --- | --- |
| Any request URL | `ledger.some((entry) => entry.url.includes(SENTINEL_ORDINARY))` is `false` |
| Any request body | `ledger.some((entry) => entry.postData.includes(SENTINEL_ORDINARY))` is `false` |
| The page URL | `location.href.includes(SENTINEL_ORDINARY)` is `false`, and `location.search` is `''` |
| The referrer | `location.referrer` is `''` |
| Any console message | `consoleMessages` is `[]` |

The request ledger itself is held to a stronger promise than "the sentinel is
absent": `ledger.length` after the Power switch is asserted equal to
`afterFirstPaint`, so **not one request of any kind** was issued after the page
loaded — not by the entry pass, not by the settlement, not by the view switch and
not by the export. The requests that did occur during first paint are then
filtered against `declaredRouteAssets()`, derived from the route's own script
tags and its declared configuration and pack paths, and the residue is asserted
`[]`. That derivation carries its own adversarial in the same row: it is proven
to contain `/rltaxproperty.js` and `/tax-rules/benefit/2026.json` and proven not
to contain `/definitely-not-declared-by-this-route.js`, so it cannot be a
vacuously permissive allowlist.

The sixth surface the obligation names is the committed artifact, which a browser
run cannot inspect. It was checked directly against the committed tree:

```
=== committed-artifact scan for SENTINEL_ORDINARY=123457 across this feature's own surfaces ===
GITGREP_EXIT=1  (exit 1 = zero matches)
```

The scan covered `lifetime-tax-strategy-lab.html`,
`lifetime-tax-strategy.config.json`, every `rltax*.js` module, everything under
`tax-rules/`, `site-exclusions.json` and every artifact under
`specs/021-lifetime-tax-strategy-lab/`. `git grep` exits 1 on zero matches, so
the sentinel appears in no committed artifact this feature owns.

### Intended RED for the canary (2026-08-19)

**Claim Source:** executed. Everything above is a GREEN reading, which on its own
proves only that the canary did not object — not that it *can* object. Two
mutations of the finished route, `lifetime-tax-strategy-lab.html`, were run to
show each arm is sensitive. Full captures, including the reverts, are in
`specs/021-lifetime-tax-strategy-lab/scopes/01-tax-workspace-rule-pack-and-privacy-foundation/report.md#scenario-scn-021-003`;
the mutated file is the same finished route this row covers, so the evidence
carries here.

| Arm | Mutation applied to the finished route | Observed RED |
| --- | --- | --- |
| The route issues no undeclared request | `window.fetch("/rltaxprobe-undeclared.js")` added to `render()` — value-free, no query string | line 310 `expect(unexpected).toEqual([])`, `Received + 11` |
| No household value reaches the URL | declared ordinary amount appended to the never-transmitted `location` hash | line 360 `expect(location.hash).toMatch(/^#(simple\|power)$/)`, `Received string: "#simple-123457"` |

`123457` is `SENTINEL_ORDINARY`, so the second probe really did put the household
value in the URL and the canary really did catch it.

**Neither probe transmits a household value, and that is deliberate.** An earlier
dispatch probed this same canary with
`window.fetch("/rl-probe-telemetry.json?ordinary=" + …)` — it built the exact
exfiltration channel the canary exists to forbid, inside the shipped page. A
probe for a privacy guarantee must not construct the leak: if the revert slips,
the failure mode of the probes above is a 404 for a file that does not exist,
whereas the failure mode of that one was disclosing the user's income. Each
mutation here was applied and reverted inside a single shell invocation, with the
revert proven by both a probe-token count of `0` and an empty path-scoped
`git status`, before the identical command was re-run GREEN.




**Claim Source:** executed. Every block below is raw terminal output captured in
this session with its real exit code. Nothing here is inferred.

### Entry state

Three of the sixteen Feature 021 browser tests were failing, all four failures
concentrated in `tests/lifetime-tax-route.spec.mjs`. A fourth failure
(`#featureLedgerBody` row count) was latent: the earlier failure at line 62
aborted SCN-021-013 before that assertion could be reached.

### Root cause 1 — product defect: a redundant `change` event destroyed the node under the pointer

`tests/lifetime-tax-route.spec.mjs:62` — following a Power link did not switch
the page into Power mode, and `tests/lifetime-tax-route.spec.mjs:108` — a
displayed value could not take keyboard focus.

Both had a single cause, established by direct in-page probe rather than by
reading the source. Every declaration control was wired to BOTH `input` and
`change`, and both handlers ran the unconditional `onWorkspaceEdit`, which calls
`render()` and rebuilds Simple and Power wholesale. `input` already applied the
edit while the field was being typed into; `change` then fired again when focus
left the field and re-rendered with an identical declaration. The mousedown that
opened a Power link, and the `focus()` that landed on a value, are each the event
that blurs the field — so the node being acted on was detached before the
interaction completed.

The probe that established it, run against the live route:

```
FOCUSPROBE {"before":{"connected":true,"rect":"98.625x39","display":"inline","tabindex":"0",
"outerHTML":"<span class=\"val-figure\" data-rl-value=\"headlineFederalTax\" tabindex=\"0\"
aria-describedby=\"tip-headlineFederalTax\">$7,91","docActive":"INPUT#inputOrdinary",
"hasFocusDoc":true},"afterConnected":false,"active":"BODY#","isSame":false,
"afterRect":"0x0","afterDisplay":""}
CLICKPROBE {"before":"false","after":"true","section":"power-bracket-detail",
"active":"power-bracket-detail","bodyClass":"power","hash":"#power"}
```

`afterConnected: false` is the finding: the element was connected before
`focus()` and detached immediately after it, in the same synchronous step.
`CLICKPROBE` is the control — a programmatic `btn.click()`, which issues no
blur, drives the mode from `false` to `true` and focuses `power-bracket-detail`
correctly. The link handler was never broken; the node it lived on was being
removed before the click could reach it.

Fixed in the product, in `lifetime-tax-strategy-lab.html`. `onWorkspaceEdit` now
compares a signature of the declaration controls and returns without rendering
when no declaration actually changed. An edit that changes nothing is not an
edit. The Simple/Power contract is untouched: Simple remains the decision-first
default, Power still holds the drill-down, and both still read the one already
computed envelope.

### Root cause 2 — test defect: a stale literal in the feature-ledger assertion

`tests/lifetime-tax-route.spec.mjs:67` expected `#featureLedgerBody` to hold 19
rows. The shipped rule pack declares 22 features, and the page renders every one
of them:

```
supported 4
unsupported 18
total 22
```

The page was correct; the literal was stale. Fixed in the spec, and strengthened
rather than merely corrected: the assertion now reads the count off
`tax-rules/federal/2026.json` and additionally asserts that every declared
feature label — supported and unsupported — appears in the rendered ledger. That
is the requirement the scenario exists to prove ("every federal feature the pack
does not support is named"), and it cannot silently stop matching its own data.

### Root cause 3 — test defect: the privacy scan flagged the privacy disclosure

`tests/lifetime-tax-route.spec.mjs:222` flattened the whole export to a lowercase
string and rejected `"name"`. The export contains a `neverCollected` array whose
entire purpose is to NAME the identifier categories the tool refuses to collect,
so the scan reported the guarantee itself as a violation:

```
Expected substring: not "\"name\""
Received string: {... "nevercollected":["name","postal-address","account-number",
"tax-identifier","credential"]}
```

The export is behaving correctly. Fixed in the spec, without weakening the
guarantee. `neverCollected` is excluded from the scanned surface, and that
exclusion is sound only because the assertion immediately above it pins that
array to its exact five declared members with `toEqual`, so no value can hide
inside it. `omittedFields` is deliberately NOT excluded — it names workspace
members the export dropped, so an identifier-bearing member appearing there is a
real signal and must still fail. Three positive controls were added
(`"ordinary"`, `"omittedfields"` and the sentinel household figure must all be
present in the scanned string) so the scan cannot pass by scanning nothing.

### Gate 1 — the five-spec browser suite

Command:
`npx playwright test tests/lifetime-tax-foundation.spec.mjs tests/lifetime-tax-federal.spec.mjs tests/lifetime-tax-marginal.spec.mjs tests/lifetime-tax-conversion.spec.mjs tests/lifetime-tax-route.spec.mjs --project=system-chrome --reporter=line`

```
Running 16 tests using 5 workers
  16 passed (5.0s)
exit=0
```

Zero skips, zero `.only`, zero `.fixme`, no timeout was raised.

### Gate 2 — whole-repository selftest

Command: `node scripts/selftest.mjs`

```
================================================
Research-Lab self-test: 2529 passed, 0 failed
================================================
exit=0
```

No assertion in `scripts/selftest.mjs` was weakened or deleted.

### Gate 3 — pages-site build

Command: `node scripts/build-pages-site.mjs --dry-run`

```
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,
"excludedPaths":7,"rootFiles":106,"directories":["briefs","data","docs","notes",
"research","rlexperience-adapters","tests/fixtures"],
"historyIndexDirectory":"briefs/indexes/29d8da3cd15e4160fb3970047c1b5e808f27a372bb889f64066d3f44b9b16c47",
"omittedOrphanIndexes":133}
exit=0
```

### Gate 4 — Bubbles artifact lint

Command: `bash .github/bubbles/scripts/artifact-lint.sh specs/021-lifetime-tax-strategy-lab`

```
✅ Every per-scope directory has a report.md file
✅ No forbidden sidecar artifacts present
✅ All checked DoD items in scopes/05-simple-power-route-accessibility-and-local-export/scope.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes/05-simple-power-route-accessibility-and-local-export/report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
exit=0
```

### Environment gap — declared, not claimed away

The `chromium` Playwright project could not be exercised on this machine. Its
bundled browser binary is not installed
(`Executable doesn't exist at .../chromium_headless_shell-1228/...`). Every
browser result recorded above was produced by the `system-chrome` project only.
This scope therefore claims coverage on system Chrome and makes **no** claim of
cross-browser or bundled-chromium coverage. This is an environment gap on the
executing machine, not a product defect and not a defect in the specs.

## Change Boundary

Path-scoped `git status` over the excluded list, run 2026-08-19.
Command: `git status --short -- rlportfolio.js rlportfolioanalytics.js portfolio-survival-allocation.config.json specs/008-portfolio-survival-and-brief-lab/ briefs/ data/ market-brief.html notes/market-brief.md scripts/brief-refresh.mjs`
**Claim Source:** executed

```text
=== Feature 008 + brief/data byte-identity (path-scoped) ===
008_scoped_dirty_rows=0
```

Zero rows. The scoping matters: `git status --short` prints one row per changed
path and nothing at all when the set is clean, so an empty result and a
"command produced no output because it silently failed" look alike. The explicit
`008_scoped_dirty_rows=0` counter removes that ambiguity — it is computed from
`git status --porcelain … | wc -l`, so it is `0` only when the command ran and
found nothing, and the surrounding invocation exited 0.

Every Feature 008 runtime file, its spec folder, and every brief or data artifact
is byte-identical to `HEAD`. This scope wrote a self-contained route and touched
none of them.

## Registration Absence

Path-scoped `git status` plus a reference scan over the six registration
surfaces, run 2026-08-19.
Command: `git status --short -- tools.json index.html rlnav.js README.md notes/README.md` and `grep -c 'lifetime-tax-strategy-lab' …`
**Claim Source:** executed

```text
=== registration-surface byte-identity ===
 M notes/README.md
registration_scoped_dirty_rows=1

=== tool absent from registration surfaces ===
tools.json:0
index.html:0
rlnav.js:0
README.md:0
notes/README.md:0
```

**The absence claim is clean and the byte-identity claim is qualified — stated
separately rather than blurred.** The reference scan is the load-bearing half:
the string `lifetime-tax-strategy-lab` appears **zero** times in all six
surfaces, so the tool is genuinely unregistered and unreachable from navigation,
the registry, either README or market-brief coverage.

Five of the six are byte-identical. The sixth, `notes/README.md`, carries one
change, and it is **not this scope's**. The full diff is two rows:

```text
$ git --no-pager diff -U0 notes/README.md
+| [us-israel-iran-conflict-market-scenarios-2026-08-19.md](…) | Da…
+| [us-israel-iran-cross-asset-equity-screen-2026-08-19.md](…) | Di…
```

Two geopolitical note entries written by a concurrent session, neither of which
mentions the tax lab. So the DoD clause's *purpose* — this scope registers the
tool nowhere and modifies no registration surface — holds and is proven; the
literal "all six are byte-identical" does not, for a reason outside this scope's
control and fully attributed here rather than papered over.

## Claim Boundary

Filled at execution. Holds the text scan proving no published error rate, no
self-invalidation statistic, no track record, no accuracy figure and no plan
success probability appears anywhere in the finished route.

## Security Remediation F2 — the privacy panel claimed an absence the route does not have

### The false sentence

`lifetime-tax-strategy.config.json` carried, and `<p id="localNetworkPolicy">`
rendered verbatim, this opening:

```
$ grep -n 'zero network' lifetime-tax-strategy.config.json
57:    "localNetworkPolicy": "This page issues zero network requests. Your filing status, income amounts and deduction choices stay in this browser's local storage under this tool's own namespace and are never placed in a URL, a request, a referrer or a console message."
$ grep -n 'localNetworkPolicy' lifetime-tax-strategy-lab.html
448:            <p id="localNetworkPolicy" class="subtle">Resolving the declared local-network policy.</p>
1862:                byId("localNetworkPolicy").textContent = inventory.localNetworkPolicy;
```

Sentence one is false. The route performs nine same-origin GETs at boot, counted
in the F2 remediation above from the page's own configuration. Sentence two —
that the household values reach no URL, request, referrer or console — was checked
clause by clause and holds, so it is kept word for word.

**Claim Source:** executed for the greps; the nine-document count is the derived
figure evidenced in the F1 section immediately above.

### The correction

Sentence one now says what happens rather than asserting an absence:

```
"When it loads, this page reads its own policy and rule-pack documents from this site, and it sends nothing. Your filing status, income amounts and deduction choices stay in this browser's local storage under this tool's own namespace and are never placed in a URL, a request, a referrer or a console message."
```

It does not overstate in the other direction either: the reads are named as the
page's own documents on this site, and "sends nothing" is retained because it is
true — every one of the nine is a GET of a local rule document.

### The guard binds the claim to the count

The panel text and the measured read count were never checked against each other,
which is how the sentence stayed shipped through three features that added reads.
The new assertion refuses a claim of absence *while any read site stands*, and
holds the verified second clause in place. Both directions are probed.

A reader-facing false claim cannot return:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            F2-false-absence-claim-cannot-return
file:             lifetime-tax-strategy.config.json
mutation:         When it loads, this page reads its own policy and rule-pack documents from this site, and it sends nothing.  ->  This page issues zero network requests.   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-05-06: the privacy panel claims no absence of requests the route does not actually have — while any read site stands, the disclosure describes the same-origin reads it performs and st
green-exit:       0
green-summary:      ✓ TP-05-06: the privacy panel claims no absence of requests the route does not actually have — while any read site stands, the disclosure describes the same-origin reads it performs and still pr
summary-compared:   ✗ FAIL: TP-05-06: the privacy panel claims no absence of requests the route does not actually have — while any read site stands, the disclosure describes the same-origin reads it performs and st  vs    ✓ TP-05-06: the privacy panel claims no absence of requests the route does not actually have — while any read site stands, the disclosure describes the same-origin reads it performs and still pr   (elapsed time normalised out)
revert-verified:  yes (committed=ac13755c5f1ab9630106b321aeb1672d64deac7b restored=ac13755c5f1ab9630106b321aeb1672d64deac7b)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

And the true promise cannot be quietly softened while nobody is looking, which is
the failure mode a correction like this invites:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            F2-the-true-clause-cannot-be-quietly-dropped
file:             lifetime-tax-strategy.config.json
mutation:         and are never placed in a URL, a request, a referrer or a console message.  ->  and are handled carefully.   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-05-06: the privacy panel claims no absence of requests the route does not actually have — while any read site stands, the disclosure describes the same-origin reads it performs and st
green-exit:       0
green-summary:      ✓ TP-05-06: the privacy panel claims no absence of requests the route does not actually have — while any read site stands, the disclosure describes the same-origin reads it performs and still pr
summary-compared:   ✗ FAIL: TP-05-06: the privacy panel claims no absence of requests the route does not actually have — while any read site stands, the disclosure describes the same-origin reads it performs and st  vs    ✓ TP-05-06: the privacy panel claims no absence of requests the route does not actually have — while any read site stands, the disclosure describes the same-origin reads it performs and still pr   (elapsed time normalised out)
revert-verified:  yes (committed=ac13755c5f1ab9630106b321aeb1672d64deac7b restored=ac13755c5f1ab9630106b321aeb1672d64deac7b)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

**Claim Source:** executed. Raw harness output.

### The four boot comments — the finding as reported is wrong, and the real defect is findability

The review reported that the four boot comments reference "the privacy ledger's
permitted-asset derivation", that `grep -rn 'permittedAsset'` returns nothing
repo-wide, and therefore that no such derivation exists. The first two statements
are correct. The conclusion is not.

The camelCase identifier does not exist, but the derivation does. It is called
`declaredPackPaths`, it lives in `tests/lifetime-tax.support.mjs`, and it is
consumed by nine privacy-ledger specs:

```
$ grep -rn 'permittedAsset' --include='*.html' --include='*.js' --include='*.mjs' --include='*.json' . | grep -v node_modules
(no output; grep pipeline exit 1)
$ grep -rn 'declaredPackPaths' tests/ | wc -l
      26
$ grep -n 'declaredPackPaths' tests/lifetime-tax.support.mjs
33:export function declaredPackPaths(config) {
$ grep -rln 'declaredPackPaths' tests/
tests/lifetime-tax.support.mjs
tests/lifetime-tax-combined.spec.mjs
tests/lifetime-tax-property.spec.mjs
tests/lifetime-tax-route.spec.mjs
tests/lifetime-tax-benefit.spec.mjs
tests/lifetime-tax-foundation.spec.mjs
tests/lifetime-tax-claim-age.spec.mjs
tests/lifetime-tax-medicare.spec.mjs
tests/lifetime-tax-state.spec.mjs
tests/lifetime-tax-retirement-route.spec.mjs
```

One support module plus nine specs. The `permittedAsset` grep is scoped to code
surfaces above because this report now contains the word itself, so the
unrestricted form the review ran no longer reproduces its own empty result.

So the comments' mechanism claim — that declaring a pack path in the configuration
lets the permitted-asset set absorb it without a hand edit — is accurate. Deleting
them, as the finding proposed, would have deleted a true statement.

The real defect is the one that produced the false finding: the comments named a
*concept* and no *symbol*, so a reviewer could not confirm them in one grep. They
now name `declaredPackPaths` and the file it lives in. A future reviewer resolves
the claim in a single search instead of concluding it is fiction.

**Claim Source:** executed. Both greps above were run in this session; the first
produced no output, which is the observation that made the finding look sound.

### Two further surfaces carry the same false claim, and are reported rather than changed

The identical "zero network requests" wording also appears in:

- `tests/lifetime-tax-foundation.spec.mjs:287` — the *title* of the SCN-021-003
  regression. Its assertions are correct and strong: they pin every request to a
  same-origin read of a derived declared asset and pin `ledger.length` after first
  paint. Only the title repeats the false claim. Renaming it is a one-line change,
  but that title appears verbatim inside roughly ten committed Playwright evidence
  blocks across the Feature 021 and 024 reports, and a rename would need a fresh
  browser run to re-evidence rather than leaving those blocks describing a test
  name that no longer exists. Left for a scope that can run the browser suite.
- `specs/021-lifetime-tax-strategy-lab/scenario-manifest.json:103` — the SCN-021-003
  `then` clause. Planning-owned artifact; not edited here.

Neither is a live claim rendered to a reader. Both are recorded so the correction
is not mistaken for complete.

## Completion Statement

Filled at execution.

## Security Remediation F1 — the zero-network detector was blind to variable-argument reads

Found by a `bubbles.security` review of the finished lab across Features 021-024
and fixed here, in the scope that owns the detector.

### The defect, measured

The TP-05-06 transport detector collected its read targets with

```
const fetchTargets = (page.match(/loadJson\("[^"]+"\)|loadJson\(config\.rules\.packPath\)/g) || []);
```

That alternation matches a string-literal argument or the single literal member
expression `config.rules.packPath`, and nothing else. Features 022-024 added five
call sites whose argument is a variable expression, so the counter never moved:

```
$ grep -c 'loadJson(' lifetime-tax-strategy-lab.html   # 8, one of which is the declaration
$ grep -n 'loadJson(' lifetime-tax-strategy-lab.html
5609:            function loadJson(path) {
5650:                loadJson("lifetime-tax-strategy.config.json").then(function (config) {
5660:                    return loadJson(config.rules.packPath).then(function (pack) {
5682:                            return loadJson(declaredRegimePaths[jurisdiction]).then(function (regime) {
5696:                            return loadJson(declaredStatePaths[jurisdiction]).then(function (statePack) {
5712:                            return loadJson(declaredBenefitPaths[year]).then(function (benefitPack) {
5724:                            return loadJson(declaredMortalityPaths[year]).then(function (mortalityPack) {
5735:                            return loadJson(declaredMedicarePaths[year]).then(function (medicarePack) {
```

Seven call sites; the detector saw two. Resolving the configuration's own
declarations gives the document count the page actually requests at boot:

```
  config document: lifetime-tax-strategy.config.json
  packPath             -> 1  tax-rules/federal/2026.json
  propertyPackPaths    -> 2  ['tax-rules/property/CA/2026.json', 'tax-rules/property/FL/2026.json']
  statePackPaths       -> 2  ['tax-rules/state/CA/2026.json', 'tax-rules/state/FL/2026.json']
  benefitPackPaths     -> 1  ['tax-rules/benefit/2026.json']
  mortalityPackPaths   -> 1  ['tax-rules/mortality/2026.json']
  medicarePackPaths    -> 1  ['tax-rules/medicare/2026.json']
TOTAL DOCUMENTS AT BOOT = 9
```

Nine. The assertion pinned two. A new `loadJson(<expression>)` carrying a
household value would have moved neither counter and failed no assertion — and
this route has already had a real same-origin probe request planted in it, which
the page's CSP would not have stopped either.

**Claim Source:** executed. The counts above are raw output of the two commands
shown, run in this session against the working tree.

### The fix

The count is no longer bounded to two argument forms. Every `loadJson(` call site
is captured whatever its argument, the permitted set is closed by argument text in
*both* directions (an unrecognised argument fails, and a declared argument that
disappears from the page also fails), and the document count is derived from the
configuration the page actually loads instead of being written by hand.

The message is corrected. It said "one same-origin read of the two local policy
documents" — true when Scope 05 shipped, false from Feature 022 — and now names
the nine reads that occur.

### Proof the new guard discriminates

Three probes, each a real defect the old detector could not see.

The blind spot itself — an existing read redirected to a variable the guard has
never heard of:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            F1-variable-argument-read-is-seen
file:             lifetime-tax-strategy-lab.html
mutation:         return loadJson(declaredMedicarePaths[year]).then(function (medicarePack) {  ->  return loadJson(sneakPath).then(function (medicarePack) {   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-05-06: every loadJson call site is counted whatever its argument form, the route holds exactly seven of them, each one names a read this list declares, and the nine same-origin document
green-exit:       0
green-summary:      ✓ TP-05-06: every loadJson call site is counted whatever its argument form, the route holds exactly seven of them, each one names a read this list declares, and the nine same-origin documents they
summary-compared:   ✗ FAIL: TP-05-06: every loadJson call site is counted whatever its argument form, the route holds exactly seven of them, each one names a read this list declares, and the nine same-origin document  vs    ✓ TP-05-06: every loadJson call site is counted whatever its argument form, the route holds exactly seven of them, each one names a read this list declares, and the nine same-origin documents they   (elapsed time normalised out)
revert-verified:  yes (committed=2e4c48120928652240f26e2e88123370184ac66e restored=2e4c48120928652240f26e2e88123370184ac66e)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

A read of a document the configuration never declared — same-origin, so neither
the CSP nor a cross-origin check would refuse it:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            F1-new-undeclared-document-read-is-caught
file:             lifetime-tax-strategy-lab.html
mutation:         loadJson(declaredBenefitPaths[year]).then(function (benefitPack) {  ->  loadJson("household-summary.json").then(function (benefitPack) {   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-05-06: every loadJson call site is counted whatever its argument form, the route holds exactly seven of them, each one names a read this list declares, and the nine same-origin document
green-exit:       0
green-summary:      ✓ TP-05-06: every loadJson call site is counted whatever its argument form, the route holds exactly seven of them, each one names a read this list declares, and the nine same-origin documents they
summary-compared:   ✗ FAIL: TP-05-06: every loadJson call site is counted whatever its argument form, the route holds exactly seven of them, each one names a read this list declares, and the nine same-origin document  vs    ✓ TP-05-06: every loadJson call site is counted whatever its argument form, the route holds exactly seven of them, each one names a read this list declares, and the nine same-origin documents they   (elapsed time normalised out)
revert-verified:  yes (committed=2e4c48120928652240f26e2e88123370184ac66e restored=2e4c48120928652240f26e2e88123370184ac66e)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

And the count itself, proven derived rather than hand-written — one extra declared
jurisdiction moves it off nine:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            F1-document-count-is-derived-not-hand-written
file:             lifetime-tax-strategy.config.json
mutation:         "state:CA": "tax-rules/state/CA/2026.json"
    },  ->  "state:CA": "tax-rules/state/CA/2026.json",
      "state:NV": "tax-rules/state/CA/2026.json"
    },   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-05-06: every loadJson call site is counted whatever its argument form, the route holds exactly seven of them, each one names a read this list declares, and the nine same-origin document
green-exit:       0
green-summary:      ✓ TP-05-06: every loadJson call site is counted whatever its argument form, the route holds exactly seven of them, each one names a read this list declares, and the nine same-origin documents they
summary-compared:   ✗ FAIL: TP-05-06: every loadJson call site is counted whatever its argument form, the route holds exactly seven of them, each one names a read this list declares, and the nine same-origin document  vs    ✓ TP-05-06: every loadJson call site is counted whatever its argument form, the route holds exactly seven of them, each one names a read this list declares, and the nine same-origin documents they   (elapsed time normalised out)
revert-verified:  yes (committed=0c62867fd6285d2bbad4b9ea983893d1433ea80f restored=0c62867fd6285d2bbad4b9ea983893d1433ea80f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

**Claim Source:** executed. Each block is raw harness output; the harness refuses
a dirty target, reverts by checkout, and reports the restored blob hash.

### Effect on the suite

```
$ node scripts/selftest.mjs
Research-Lab self-test: 3221 passed, 0 failed
```

One assertion added, none removed, none failing. The prior baseline was
`3220 passed, 0 failed`.

### No ticked item is invalidated

The zero-network DoD row on this scope claims that a sentinel household value
reaches no request, URL, referrer, console message or committed artifact, and
that `ledger.length` is pinned to `afterFirstPaint`. That is a runtime browser
observation and it remains true and remains proven; this finding concerns the
static detector standing beside it, which is why the row keeps its tick.

## Regression sweep across Features 021-024 (2026-08-22)

### F-REG-02 — the false zero-network claim survives as three normative requirements, and the security census undercounted it

The F2 remediation above corrected the privacy panel, which was the live
user-facing surface, and then recorded what it had chosen not to correct:

> The identical "zero network requests" wording also appears in:
> [...]
> Two further surfaces carry the same false claim, and are reported rather than changed

Those two are `tests/lifetime-tax-foundation.spec.mjs:287` and
`specs/021-lifetime-tax-strategy-lab/scenario-manifest.json:103`. The census
stops there. It is short by fourteen sites, and it misses every requirement-level
statement of the claim.

Grepped this session across the four features, excluding evidence reports. The
fourteen sites the census does not name:

| file | line | text |
| --- | --- | --- |
| `specs/021-lifetime-tax-strategy-lab/spec.md` | 448 | Privacy And Trust Model item 2, `The page performs zero network requests at runtime.` |
| `specs/021-lifetime-tax-strategy-lab/spec.md` | 581 | SCN-021-003 Gherkin, `Then the page has issued zero network requests` |
| `specs/021-lifetime-tax-strategy-lab/spec.md` | 845 | **NFR-021-009**, `The page performs zero network requests at runtime.` |
| `specs/021-lifetime-tax-strategy-lab/spec.md` | 1065 | `Local-only, zero network requests.` |
| `specs/021-lifetime-tax-strategy-lab/spec.md` | 1159 | **P9**, `It performs zero network requests by design, which is stronger than degrading honestly.` |
| `specs/021-lifetime-tax-strategy-lab/design.md` | 43 | `the page issues zero network requests.` |
| `specs/021-lifetime-tax-strategy-lab/scopes/_index.md` | 337 | the **PRA-021-009** row, `The page performs zero network requests.` |
| `.../scopes/01-tax-workspace-rule-pack-and-privacy-foundation/scope.md` | 23, 37, 61 | narrative, the **PRA-021-009** definition, and the Gherkin |
| `.../scopes/01-tax-workspace-rule-pack-and-privacy-foundation/scope.md` | 231 | the **TP-01-14** row, which quotes the test title twice: as the test name and inside its `--grep` command |
| `.../scopes/05-simple-power-route-accessibility-and-local-export/scope.md` | 49 | the re-assertion of **PRA-021-009** |
| `specs/023-property-tax-and-rental-income/spec.md` | 738 | **NFR-023-002**, `zero network requests at runtime, including regime pack loading.` |
| `specs/024-social-security-and-medicare/spec.md` | 883 | **NFR-024-002**, `zero network requests at runtime, including benefit, mortality and medicare pack loading.` |

The last two are the sharpest. They do not merely repeat a loose phrase. Each one
names the pack loads explicitly and then asserts there are zero of them. The
detector this scope repaired counts those same loads and pins the count:

> TP-05-06: every loadJson call site is counted whatever its argument form, the
> route holds exactly seven of them, each one names a read this list declares, and
> the nine same-origin documents they resolve to are all present in this checkout
> and none of them is remote

So `NFR-023-002` states that regime pack loading is zero network requests, while
the assertion standing beside it states that pack loading is nine of them. Both
are ticked. They cannot both be describing the same page.

#### What is and is not false here

Three claims share this wording and only some are false. Separating them is the
whole point, because a blanket rewrite would delete true statements.

| claim | verdict |
| --- | --- |
| no household value reaches any request, URL, referrer, console message or committed artifact | TRUE, and proven at runtime by the SCN-021-003 ledger assertion |
| the tool needs no key, no proxy, no account and no server | TRUE |
| the page performs zero network requests at runtime | FALSE, nine same-origin document reads |

`spec.md:745` and the first sentence of `spec.md:844` are the first kind and must
be left alone. The second sentence of `spec.md:845` is the third kind. They sit in
the same paragraph, which is how this survived. The `PRA-021-009` row at
`_index.md:337` mixes the two inside a single table cell the same way.

**Claim Source:** executed. The census grep ran in this session over
`specs/021*`, `specs/022*`, `specs/023*`, `specs/024*`, `lifetime-tax-strategy.config.json`,
`lifetime-tax-strategy-lab.html` and `tests/`, excluding `report.md` paths.
`specs/023-property-tax-and-rental-income/spec.md:734-742`,
`specs/024-social-security-and-medicare/spec.md:879-888` and
`.../scopes/01-.../scope.md:35-39` were read in this session. The nine-document
count is quoted from the shipped TP-05-06 assertion text, not restated.

#### Routed, not fixed

`spec.md`, `design.md`, `scope.md`, `_index.md` and `scenario-manifest.json` are
planning-owned and design-owned artifacts. This sweep is diagnostic and does not
edit them, which is the same boundary the F2 remediation drew when it declined to
edit the scenario manifest.

The decision is not editorial. `NFR-021-009`, `NFR-023-002` and `NFR-024-002` are
normative requirements, `P9` and `P11` in the Feature 021 product-principle table
cite `NFR-021-009` as their evidence, and `PRA-021-009` is inherited by two
scopes. Whoever owns the correction has to choose whether the requirement becomes
"no remote network requests, and no household value in any request", or whether it
keeps a zero-request form and the page changes to satisfy it. That choice reaches
three features.

Owner: `bubbles.plan` for `NFR-021-009`, `NFR-023-002`, `NFR-024-002`,
`PRA-021-009` and the two Gherkin clauses; `bubbles.design` for
`design.md:43`; `bubbles.test` for the test title the F2 census already routed.

#### Ticked evidence this finding does invalidate

None is unticked by this sweep, and the reason is worth stating rather than
assuming. Every zero-network DoD row in this family is worded as the first claim
in the table above, the household-value claim, which is true and proven. No DoD
row asserts the page issues no requests. The false statements live in requirement
and narrative text, which carries no tick of its own.

### F-REG-03 — the F5 fix removed a storage key the privacy allow-list still permits

`08caba331` deleted `MODE_KEY = "rlLifetimeTaxDisplayMode"` and dropped the
`persist` parameter from `applyDisplayMode`, so the view mode is now carried by
the location hash alone and that key is never written. The commit subject names
only the `removed.push` correction, so the second change travels unannounced.

The SCN-021-003 privacy assertion still allows the deleted key —
`tests/lifetime-tax-foundation.spec.mjs:370`:

```js
expect(storage.keys.every((key) => key.indexOf('rlLifetimeTaxV1.') === 0 || key === 'rlLifetimeTaxDisplayMode')).toBe(true);
```

The second disjunct is now dead. It cannot be exercised, and it permits a key
that the closed writer rejects and that appears in no configured inventory. An
allow-list clause that outlives the thing it allowed is a widened assertion: this
one would still pass if the key returned, which is the state F5 set out to make
impossible.

#### Severity is low, and the reason is a second assertion rather than optimism

The invariant is held elsewhere, and more strictly. The F4 assertion in
`scripts/selftest.mjs` pins it at the source level:

> F4: the page writes no storage key directly and carries no storage-key literal
> of its own, so every key this tool can write is declared in configuration, sits
> inside the declared namespace, passes the closed writer, appears in the privacy
> inventory and is removed by the clear path

A returning `rlLifetimeTaxDisplayMode` literal fails F4 before it could reach the
browser assertion that would wave it through. So this is a dead clause, not a
live hole, and it is reported at that weight rather than inflated to match the
seriousness of the file it sits in.

The configuration declares three keys — `rlLifetimeTaxV1.workspace`,
`rlLifetimeTaxV1.pointer` and `rlLifetimeTaxV1.probe` — and all three match the
first disjunct, so deleting the second changes no passing outcome.

**Claim Source:** executed. `git show 08caba331` was read in this session.
`tests/lifetime-tax-foundation.spec.mjs:355-378`,
`lifetime-tax-strategy.config.json:3-12` and the F4 assertion text at
`scripts/selftest.mjs:27632` were read in this session. The grep for
`rlLifetimeTaxDisplayMode` and `MODE_KEY` ran in this session and returned that
line as the only surviving reference inside this feature family.

#### Routed, not fixed

Deleting the disjunct is a one-line change and this sweep does not make it, for
one reason: it cannot be proven here. `tests/` is `bubbles.test`'s artifact, the
change is only meaningful under a browser run, and this sweep runs no browser. An
edit whose effect cannot be observed is not a fix, it is an assertion about a fix.

Owner: `bubbles.test`, alongside the SCN-021-003 title rename the F2 census
already routed, so both land in one browser run.

### F-REG-04 — three of the six security fixes are in the tree and in no report

Only `F1` and `F2` have evidence sections. `F3`, `F4` and `F5` have none, in any
`report.md`, across all four features. Grepped this session for
`Remediation F3|F4|F5`, for heading forms, and for `isSafeSourceUrl`; every
search returned empty.

What landed unrecorded:

| finding | commits | shipped files changed |
| --- | --- | --- |
| F3 | `39b1cb7bd`, `64dbef87b` | `rltaxrules.js`, `lifetime-tax-strategy-lab.html` |
| F4 | assertion at `scripts/selftest.mjs:27632` | closed-writer pin |
| F5 | `08caba331` | `lifetime-tax-strategy-lab.html`, `rltaxworkspace.js` |

These are not cosmetic. F3 added a scheme guard and a renderer refusal path, F5
removed a storage key and a persistence behaviour, and F4 added the assertion
that now carries the invariant F-REG-03 describes. None has a recorded
before-and-after, a probe, or a claim-source line in the artifact that owns it.

This is the mechanism behind F-REG-03 rather than a separate accident. F5's
persistence removal was never written down, so nobody reconciled it against the
allow-list that still permits its key. The same exposure applies to the other
two: a later reader has the commits and no statement of what was verified.

**Claim Source:** executed. The heading and mention greps ran in this session
over `specs/021*`, `specs/022*`, `specs/023*` and `specs/024*`. The commit and
file lists come from `git show --numstat` on each commit, run in this session.

Owner: whoever performed the security phase, to bank the three missing evidence
sections. This sweep does not write another agent's evidence, because evidence
records what its author executed and this author executed the sweep, not the fix.

## Regression sweep — what was checked and found clean

Recorded so the sweep's silence is legible. A check that ran and found nothing is
not the same as a check that never ran.

| area | check | result |
| --- | --- | --- |
| leg-set integrity | engine sums only legs whose `includedInTotal` is true, at `rltax.js:436-437` | clean |
| leg-set integrity | cost legs do reach `declaredLegs`, so the `CO-24` mis-summed pass can fire; the `includedInTotal !== true` filter is scoped to the federal `taxLegs` branch alone, and the property and premium branches push their own flag | clean |
| leg-set integrity | `federalLegIds` is built by `settledLegIds(settlement, null, null, null, null, null, null, null)`, so no cost leg can enter it by construction | clean |
| leg-set integrity | `F-AUDIT-04` census wiring discriminates on the real route — probe below | clean |
| refusal propagation | the `F3` renderer refuses a non-https source url with inert text naming the withholding, not a blank and not a live link | clean |
| refusal propagation | the census clean line claims only surface membership and cost-leg exclusion, so it does not certify a leg whose input refused | clean, and precisely scoped |
| refusal propagation | the disposition exclusion still coerces a refusal to zero — this is `F-AUDIT-05`, already open and routed, and this sweep found no change to it | pre-existing, unchanged |
| coverage | no assertion in this feature family was deleted or weakened by the fix commits | clean |
| coverage | passed count rose, `3242` to `3244`, from a concurrent session's additions | clean |

The one deletion in a fix commit was `39b1cb7bd`, which removed seven lines from
`scripts/selftest.mjs` and added seventy-one. The removed lines belong to a
concurrent session's `horizon-ladder-lab` registry assertions and were replaced
in the same commit by expanded forms of themselves, flipping them from
unregistered to registered. Nothing in this feature family was touched, and no
assertion was weakened. It is noted only because a security commit for this
family carrying another feature's registry edits is a shared-file hazard worth
seeing, not because it cost coverage.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            F-AUDIT-04 census summed-set made self-referential on the real route
file:             lifetime-tax-strategy-lab.html
mutation:         envelope.federalLegIds || []);  ->  declaredLegs.map(function (leg) { return leg.legId; }));   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: F-AUDIT-04: the route invokes CO-24 on what it rendered, feeds the summed set from the settlement’s own federalLegIds rather than from the flag it is auditing, carries each leg’s own i
green-exit:       0
green-summary:      ✓ F-AUDIT-04: the route invokes CO-24 on what it rendered, feeds the summed set from the settlement’s own federalLegIds rather than from the flag it is auditing, carries each leg’s own include
revert-verified:  yes (committed=a2bdfa4a1b312df877c58d1b19d995716393595b restored=a2bdfa4a1b312df877c58d1b19d995716393595b)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
PROBE_EXIT=0
```

Pinned to the assertion's own wording rather than to the aggregate, because the
aggregate moved twice during this sweep under a concurrent session. The census
wiring the `F-AUDIT-04` fix added is real: making its summed set self-referential
fails the assertion by name.

## TP-05-18 authored — the non-empty pin `SCN-021-015` lacked (2026-08-22)

`TP-05-18` was opened as `GAP, NOT AUTHORED` because `TP-05-14` captured
`afterFirstPaint = ledger.length` and asserted `expect(ledger.length).toBe(afterFirstPaint)`
without ever asserting the capture was greater than zero — alone in the 021-024
privacy family. Against a route that read nothing the no-growth check reads
`expect(0).toBe(0)` and the declared-asset sweep compares two empty arrays, so
the row passes while covering nothing.

The pin is now the statement immediately after the capture, which is where the
row requires it, and the row also adopts the shared same-origin helper described
under `TP-01-18` in the Scope 01 report.

### Intended RED and same-command GREEN

The mutation zeroes the captured length, which is exactly the state a boot that
issued no request would produce. The RED names the pin by file line, so the
failure is the intended contract assertion rather than a collateral one.

```
$ bash scripts/red-green-probe.sh \
    --file tests/lifetime-tax-route.spec.mjs \
    --find 'const afterFirstPaint = ledger.length;' \
    --replace 'const afterFirstPaint = ledger.length * 0;' \
    --label 'TP-05-18 non-empty pin: a boot that issued no request at all must fail this row; before the pin, afterFirstPaint of 0 made the no-growth check read expect(0).toBe(0) and the declared-asset sweep compare two empty arrays' \
    --bound 300 \
    --summary-match 'expect\(afterFirstPaint\)\.toBeGreaterThan|1 passed' \
    -- npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-015 a private export happens only on explicit action" --reporter=line
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-18 non-empty pin: a boot that issued no request at all must fail this row; before the pin, afterFirstPaint of 0 made the no-growth check read expect(0).toBe(0) and the declared-asset sweep compare two empty arrays
file:             tests/lifetime-tax-route.spec.mjs
mutation:         const afterFirstPaint = ledger.length;  ->  const afterFirstPaint = ledger.length * 0;   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep SCN-021-015\ a\ private\ export\ happens\ only\ on\ explicit\ action --reporter=line
red-exit:         1
red-summary:          > 315 |   expect(afterFirstPaint).toBeGreaterThan(0);
green-exit:       0
green-summary:      1 passed (2.1s)
summary-compared:     > 315 |   expect(afterFirstPaint).toBeGreaterThan(0);  vs     1 passed (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes (committed=f4afe1a260905d3185246119f9fd675d381a250f restored=f4afe1a260905d3185246119f9fd675d381a250f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
PROBE_TP0518B_EXIT=0
```

The `--summary-match` is pinned to the pin's own source text rather than to a
pass count, so a concurrent session moving the aggregate cannot move this
verdict. The GREEN arm's `1 passed` is the same single grepped title, not a
suite total.

## `TP-05-17` Reds, `TP-05-16` Does Not — One Probe, One Finding (2026-08-22)

The every-row DoD item's own note already records that its headline over-claimed
against its command range: the command names `TP-05-01` through `TP-05-14` while
`TP-05-15`, `TP-05-16` and `TP-05-17` also exist and carried no RED. Two of the
three were addressed here. Both blocks are verbatim harness output.

### `TP-05-17` — path guard, discriminating

The mutation targets the guard's own resolution rather than planting a fabricated
`tests/…` token in a spec artifact. A planted token would survive into this
report, which is itself scanned, and would turn the guard permanently red.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-17 path guard: a spec-referenced path that does not resolve to a file must be reported as newly missing
file:             scripts/validate-spec-test-paths.mjs
mutation:         statSync(resolve(root, path)).isFile()  ->  statSync(resolve(root, path)).isDirectory()   (1 occurrence(s))
command:          node scripts/validate-spec-test-paths.mjs
red-exit:         1
red-summary:      [spec-test-paths] FAIL — 190 new referenced path(s) do not exist
green-exit:       0
green-summary:    [spec-test-paths] OK — no new missing test path(s)
summary-compared: [spec-test-paths] FAIL — 190 new referenced path(s) do not exist  vs  [spec-test-paths] OK — no new missing test path(s)   (elapsed time normalised out)
revert-verified:  yes (committed=760f9bf0ebc04663675eee3f9d6cd81bcd9c8d0a restored=760f9bf0ebc04663675eee3f9d6cd81bcd9c8d0a)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

### `TP-05-16` — repo gate, exit 7, and the finding it produced

The mutation relaxed the non-empty guard in `rltaxstrategy.js`, this scope's own
strategy module, so a zero-length string would be accepted wherever the module
requires a non-empty one. The harness returned exit 7: the RED and GREEN channels
agreed. That is recorded here as a finding rather than retried with a different
mutation, because a probe retried until something goes red stops being evidence.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-16 repo gate: a defect planted in this scope own strategy module must make the whole-repository suite non-green and the pre-existing pass count fall
file:             rltaxstrategy.js
mutation:         return typeof candidate === "string" && candidate.length > 0;  ->  return typeof candidate === "string" && candidate.length >= 0;   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         0
red-summary:      Research-Lab self-test: 3384 passed, 0 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3384 passed, 0 failed
summary-compared: Research-Lab self-test: 3384 passed, 0 failed  vs  Research-Lab self-test: 3384 passed, 0 failed   (elapsed time normalised out)
revert-verified:  yes (committed=f4dbb4a9c8dcf3b60a9aee0c4e3816f880ead964 restored=f4dbb4a9c8dcf3b60a9aee0c4e3816f880ead964)
discriminating:   NO (both channels agree: exit 0 == 0, summary "Research-Lab self-test: 3384 passed, 0 failed" identical once elapsed time is normalised)
=== END RED/GREEN PROBE EVIDENCE ===
```

**What this establishes.** Not that `TP-05-16` is weak — the row claims the suite
stays green and the pass count does not fall, and this run shows the count
unchanged, which is the row passing. What it establishes is about the module: the
non-empty string guard in `rltaxstrategy.js` is unasserted. Relaxing it so that
an empty string is accepted moves no assertion in a 3384-assertion suite. The
same shape was found independently in `rltaxworkspace.js` under `TP-01-16`, so
this is a pair rather than a one-off, and it is named here so the finding is
available to whoever owns those modules. `TP-05-16` is left without a RED rather
than being given one by searching for a mutation that happens to fail.

**Claim Source:** executed. Both blocks are verbatim harness output from this
session, each revert hash-verified against the committed blob, and
`git status --short` for each touched file re-read clean afterwards.

### Effect on the DoD row

The every-row item stays open. `TP-05-17` now carries a RED and a same-command
GREEN. `TP-05-16` does not, for the reason recorded above. `TP-05-15`, the
cumulative browser row, still carries GREEN only and was not probed here.




