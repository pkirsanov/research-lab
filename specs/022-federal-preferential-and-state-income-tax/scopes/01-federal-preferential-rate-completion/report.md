# Scope 1 Execution Report — Federal Preferential Rate Completion

This file is the evidence surface for scope 1. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Scope 1's implementation was delivered in an earlier session; this session is the
verification-and-evidence pass that closes the DoD ledger. Nothing here is written
from expectation. Every claim below is either the raw output of a command executed
in this session, or a stated non-verification.

**Baseline of this session**, all four gates executed before any probe:

```
$ node scripts/selftest.mjs
Research-Lab self-test: 2874 passed, 1 failed
EXIT=1
```

The single failure is not this scope's. It is the stale spec-referenced test path
`tests/market-brief-cockpit.spec.mjs`, referenced only from
`specs/025-company-multi-horizon-intelligence-lab/`, which a concurrent session
owns:

```
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=638 references=14193 distinctPaths=240 missingPaths=72 baseline=71 new=1 stale=0
  NEW-MISSING tests/market-brief-cockpit.spec.mjs (38 reference site(s))
      referenced at specs/025-company-multi-horizon-intelligence-lab/report.md:677
      referenced at specs/025-company-multi-horizon-intelligence-lab/report.md:1523
      referenced at specs/025-company-multi-horizon-intelligence-lab/scopes.md:318
      ... and 35 further reference site(s)
[spec-test-paths] FAIL — 1 new referenced path(s) do not exist
EXIT=1
```

Every path this feature's own artifacts reference exists:

```
$ grep -rhoE 'tests/[A-Za-z0-9._/-]+\.mjs' specs/022-federal-preferential-and-state-income-tax/ | sort -u | while read -r p; do if [ -f "$p" ]; then echo "OK      $p"; else echo "MISSING $p"; fi; done
OK      tests/lifetime-tax-conversion.spec.mjs
OK      tests/lifetime-tax-federal.spec.mjs
OK      tests/lifetime-tax-foundation.spec.mjs
OK      tests/lifetime-tax-marginal.spec.mjs
OK      tests/lifetime-tax-route.spec.mjs
OK      tests/lifetime-tax.support.mjs
```

```
$ npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line
  63 passed (19.2s)
EXIT=0
```

```
$ node scripts/build-pages-site.mjs --dry-run
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":119,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/9bb69175f356c240125ee2384f73de8633483fa9b283895c85e3e89fccc66af6","omittedOrphanIndexes":136}
EXIT=0
```

**A structural fact that shapes every anchor below.** The implementation plan's
step 11 called for appending a `lifetime-tax — per-component provenance and
preferential completion` group to `scripts/selftest.mjs`. No such group exists.
The delivery instead folded this scope's assertions into the **Feature 021**
groups, in place, under Feature 021's own `TP-01-NN` numbering. The consequence is
that a `TP-01-NN` label inside `scripts/selftest.mjs` denotes Feature 021's row of
that number, not this scope's row of that number:

```
$ node -e 'read scripts/selftest.mjs, print every TP-01-NN label between L11900 and L13000'
11944: TP-01-01: the shipped federal pack validates and exposes every required TaxRulePack member
12000: TP-01-01: the pack-derived count of present figures matches the collected list, and every effective component citation — inherited or overridden — names a retrieved non-newsroom source with an absolute URL, a non-future retrievedAt and a locator, while the newsroom summary is cited by no figure and no override
12015: TP-01-21: the guard can fail — a present preferential table with no citation is refused, and a component override citing a not-retrieved record is refused with the override named
12027: TP-01-02: removing any one required pack member is refused RLTAX-PACK-INVALID exactly once with that member named
12068: TP-01-03: an unsupported year, a non-federal jurisdiction, an expired pack, an unknown filing status and a digest mismatch each refuse by their own code and return no pack
```

Each anchor below therefore names the assertion that actually carries this scope's
behaviour, by file and line, rather than relying on the label number.

## Sourcing

### BI-1 — the preferential breakpoints

The pack records the retrieval as a `SourceRecord/v2`. The scope's DoD text says
`SourceRecord/v1`; the implementation plan steps 6 and 7 say `SourceRecord/v2`, and
`v2` is the superset that adds `declaredApplicableYearsByComponentKind`. The
delivery followed the plan. Verbatim from `tax-rules/federal/2026.json`:

```
$ node -e 'print sourceRecords entry rp-2025-32 from tax-rules/federal/2026.json'
{
 "contractVersion": "SourceRecord/v2",
 "sourceId": "rp-2025-32",
 "title": "Rev. Proc. 2025-32, Internal Revenue Bulletin 2025-45",
 "url": "https://www.irs.gov/irb/2025-45_IRB",
 "publisher": "Internal Revenue Service",
 "documentKind": "revenue-procedure",
 "publishedAt": "2025-11-03",
 "retrievedAt": "2026-08-17T19:03:51.000Z",
 "retrievalOutcome": "retrieved",
 "retrievalNote": "Retrieved in the implementation session as the authoritative Internal Revenue Bulletin rendering of Revenue Procedure 2025-32. The separate rp-25-32.pdf rendering of the same document failed content extraction in the same session; the bulletin rendering is the transcription source for every figure in this pack. retrievedAt records the session retrieval time.",
 "declaredApplicableYearsByComponentKind": {
  "rate": "year-invariant",
  "breakpoint": [ 2026 ],
  "amount": [ 2026 ],
  "qualifier": []
 },
 "yearInvarianceBasis": {
  "rate": "Section 4.03 states its two amounts through the names maximum zero rate amount and maximum 15-percent rate amount. Those two names state the zero-percent and fifteen-percent rates themselves, and neither name carries a year qualifier, while the section labels its dollar amounts explicitly for taxable years beginning in 2026."
 }
}
```

### BI-3 — the top-band rate and the uncarried categories

```
$ node -e 'print sourceRecords entry irs-tc409 from tax-rules/federal/2026.json'
{
 "contractVersion": "SourceRecord/v2",
 "sourceId": "irs-tc409",
 "title": "Topic no. 409, Capital gains and losses",
 "url": "https://www.irs.gov/taxtopics/tc409",
 "publisher": "Internal Revenue Service",
 "documentKind": "publication",
 "publishedAt": "2026-02-25",
 "retrievedAt": "2026-08-17T19:03:51.000Z",
 "retrievalOutcome": "retrieved",
 "retrievalNote": "Retrieved in the implementation session. Its Capital gains tax rates section states, without a year qualifier, that a capital gains rate of 20% applies to the extent that taxable income exceeds the thresholds set for the 15% capital gain rate. The same section's dollar thresholds are labelled for taxable years beginning in 2025 and are therefore unusable for a 2026 breakpoint. This record is the sourceRef of exactly one component kind in this pack, and its breakpoint and amount kinds declare 2025 so that a 2026 breakpoint citing it refuses.",
 "declaredApplicableYearsByComponentKind": {
  "rate": "year-invariant",
  "breakpoint": [ 2025 ],
  "amount": [ 2025 ],
  "qualifier": []
 },
 "yearInvarianceBasis": {
  "rate": "The sentence stating the 20-percent rate carries no year qualifier, in explicit contrast to the same section's dollar amounts, which the page introduces with the words For taxable years beginning in 2025."
 }
}
```

### The RL-3 mismatch check

`spec.md` records RL-3 as a **lead and a mismatch check, never a source**, and a
disagreement is a stop-and-report. This session ran that check against the shipped
pack. There is no disagreement, so there is nothing to stop and report:

```
$ node -e 'compare every shipped preferential breakpoint pair against the RL-3 record'
married-filing-jointly RL-3= [98900,613700] pack= [98900,613700] MATCH rates= [0,0.15,0.2] locator= iling Joint Returns and Surviving Spouse
married-filing-separately RL-3= [49450,306850] pack= [49450,306850] MATCH rates= [0,0.15,0.2] locator= ried Individuals Filing Separate Returns
head-of-household RL-3= [66200,579600] pack= [66200,579600] MATCH rates= [0,0.15,0.2] locator= rcent rate amount for Heads of Household
single RL-3= [49450,545500] pack= [49450,545500] MATCH rates= [0,0.15,0.2] locator= nt rate amount for All Other Individuals
```

RL-3 further required that the mapping of the authority's *All Other Individuals*
row onto the `single` filing status be recorded. It is recorded — in the `single`
table's own `locator`, which ends `...the maximum zero rate amount and the maximum
15 percent rate amount for All Other Individuals`, rather than in the
`retrievalNote` RL-3 nominated. The mapping is stated on the figure it governs.

**What this session did not and could not verify.** That the two retrievals were
performed in the implementation session, and that each figure was transcribed from
the opened document rather than recalled, are historical facts about a session
that is over. This session has no network access and cannot re-open either
document. What it verified is: both records exist, both carry
`retrievalOutcome: "retrieved"`, both carry a session `retrievedAt`, both carry a
retrieval note describing the reading, and every transcribed figure agrees exactly
with the independent RL-3 record. The DoD item is ticked on that evidence and on
no stronger claim.

### Verification pass 2026-08-18 — DoD item 3 (BI-1 and BI-3 closed by retrieval)

Both records re-read from the shipped pack in this session:

```
$ node -e 'const fs=require("fs"); ... read sourceRecords rp-2025-32 and irs-tc409 from tax-rules/federal/2026.json'
rp-2025-32 {"contractVersion":"SourceRecord/v2","title":"Rev. Proc. 2025-32, Internal Revenue Bulletin 2025-45","url":"https://www.irs.gov/irb/2025-45_IRB","documentKind":"revenue-procedure","retrievedAt":"2026-08-17T19:03:51.000Z","retrievalOutcome":"retrieved","years":{"rate":"year-invariant","breakpoint":[2026],"amount":[2026],"qualifier":[]}}
irs-tc409 {"contractVersion":"SourceRecord/v2","title":"Topic no. 409, Capital gains and losses","url":"https://www.irs.gov/taxtopics/tc409","documentKind":"publication","retrievedAt":"2026-08-17T19:03:51.000Z","retrievalOutcome":"retrieved","years":{"rate":"year-invariant","breakpoint":[2025],"amount":[2025],"qualifier":[]}}
---shipped preferential breakpoints + rates---
single edges= [49450,545500] rates= [0,0.15,0.2] sourceRef= rp-2025-32 overrides= ["band:b3:rate<-irs-tc409"]
married-filing-jointly edges= [98900,613700] rates= [0,0.15,0.2] sourceRef= rp-2025-32 overrides= ["band:b3:rate<-irs-tc409"]
married-filing-separately edges= [49450,306850] rates= [0,0.15,0.2] sourceRef= rp-2025-32 overrides= ["band:b3:rate<-irs-tc409"]
head-of-household edges= [66200,579600] rates= [0,0.15,0.2] sourceRef= rp-2025-32 overrides= ["band:b3:rate<-irs-tc409"]
PROBE_EXIT=0
```

`BI-1` is closed by `rp-2025-32`, which is the `sourceRef` of every breakpoint in all
four tables. `BI-3` is closed by `irs-tc409`, which is the `sourceRef` of exactly one
component in each table — the top-band rate — and of nothing else. No dollar figure
cites the rate authority, which is the rule step 8 of the implementation plan states.

The RL-3 mismatch check was re-executed in this session, extracting the figures from
`spec.md` and comparing them row for row against the shipped pack:

```
$ node -e 'const fs=require("fs"); ... parse the RL-3 row of spec.md, compare to tax-rules/federal/2026.json in the same row order'
RL-3 as recorded in spec.md : [98900,613700,49450,306850,66200,579600,49450,545500]
pack, same row order    : [98900,613700,49450,306850,66200,579600,49450,545500]
MISMATCH_CHECK: MATCH — nothing to stop and report
  married-filing-jointly     RL-3=[98900,613700] pack=[98900,613700] MATCH
  married-filing-separately  RL-3=[49450,306850] pack=[49450,306850] MATCH
  head-of-household          RL-3=[66200,579600] pack=[66200,579600] MATCH
  single                     RL-3=[49450,545500] pack=[49450,545500] MATCH
PROBE_EXIT=0
```

**Two divergences from the DoD wording, stated rather than glossed.**

1. The item says `SourceRecord/v1`; both records ship as `SourceRecord/v2`. `v2` is
   the superset that adds `declaredApplicableYearsByComponentKind`, and steps 6 and 7
   of the same scope's implementation plan call for `v2`. The delivery followed the
   plan; the DoD sentence is the stale one.
2. *"retrievals performed in the implementation session"* and *"every figure
   transcribed directly from the opened document"* are historical facts about a
   session that has ended. This session has no network and cannot re-open either
   document, so it cannot re-derive them.

**Claim Source:** executed for everything above the divergences; **interpreted** for
the historical clause. What is machine-evidenced is that both records carry a
`retrievedAt` of `2026-08-17T19:03:51.000Z` — the implementation session's own clock —
that both carry `retrievalOutcome: "retrieved"`, and that all eight transcribed
amounts agree exactly with RL-3, an independent reading taken in the planning session.
The item is ticked on that and on nothing stronger.

## Test Evidence

### TP-01-01

Scenario SCN-022-001 — `RateTable/v2` validates with an override list, and an
absent-band path, a duplicate component, an empty locator, a `not-retrieved`
source and a newsroom source are each refused `RLTAX-PACK-INVALID` naming the
component.
Command: `node scripts/selftest.mjs`

**Delivered — the citation-validity half.** `scripts/selftest.mjs:12000` asserts
every effective component citation, inherited or overridden, over a pack-derived
figure count; `scripts/selftest.mjs:12015` is its adversarial twin.

**Intended-RED, demonstrated in this session.** The scope names its intended RED
as: a `RateTable/v2` whose top-band rate override cites a `not-retrieved` record
must be refused, naming that component.

*Probe A* removed only the `retrieved` clause of `validateComponentSources` in
`rltaxrules.js`, leaving `sources.retrieved[entry.sourceRef] !== true` as `false`.
The suite stayed green at `2874 passed, 1 failed`. That is not a vacuous
assertion — it is defence in depth. A `not-retrieved` record is also absent from
`sources.citable`, so the newsroom clause immediately below refuses the same entry
under the same `...componentSources[0].sourceRef` domain, and the assertion's
`domain.indexOf('componentSources') >= 0` test still held. Probe A was reverted
with `git checkout -- rltaxrules.js` and the baseline reconfirmed before Probe A2.

*Probe A2* removed both sourceRef clauses:

```
$ bash .github/bubbles/scripts/evidence-capture.sh --label "PROBE-A2 RED: both componentSources sourceRef clauses neutered" -- node scripts/selftest.mjs
exit: 1
lines: 3247
sha256: 6ee3e256fc028ca30e6b19392505bdb231af9e3ae8f4a7937c45321a3228cc33
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-01-21: the guard can fail — a present preferential table with no citation is refused, and a component override citing a not-retrieved record is refused with the override named
Research-Lab self-test: 2873 passed, 2 failed
```

Reverted and GREEN reconfirmed in the same step:

```
$ git checkout -- rltaxrules.js; echo "checkout_exit=$?"; git status --short rltaxrules.js
checkout_exit=0
STATUS_CLEAN_IF_EMPTY_ABOVE
$ node scripts/selftest.mjs
Research-Lab self-test: 2874 passed, 1 failed
```

**Not delivered — the four other refusal branches this row names.** The row
requires that an absent-band path, a duplicate component, an empty locator and a
newsroom-cited component each be refused *by an assertion*. `rltaxrules.js`
implements all four refusals — `validateComponentSources` raises
`the component path names no component of the enclosing figure`,
`two entries name the same component`,
`a sourceRef without a locator is not a citation` and
`a newsroom-release may not be the sourceRef of a component`. No assertion
exercises any of them:

```
$ node -e 'search scripts/selftest.mjs for each of the four refusal branches'
022 TP-01-01 duplicate component   hits=0
022 TP-01-01 absent band path      hits=0
022 TP-01-01 empty locator         hits=0
022 TP-01-01 newsroom component    hits=0
```

Four of TP-01-01's six named refusal branches are therefore implemented but
unasserted. This is recorded as finding **F-01-A** and is why the Test Plan
completeness DoD item stays unticked.

#### Verification pass 2026-08-18 — DoD item 1 (FR-022-001 … FR-022-003)

Session baseline, executed before any probe in this pass:

```
$ node scripts/selftest.mjs 2>&1 | grep -E 'self-test:|✗ FAIL'
  ✗ FAIL: market-brief.config.page.json is byte-current with its full source artifacts
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
Research-Lab self-test: 2874 passed, 2 failed

$ node scripts/selftest.mjs > /dev/null 2>&1; echo "SELFTEST_EXIT=$?"
SELFTEST_EXIT=1
```

Both failures are foreign to this scope. The first tracks `market-brief.config.json`
and `scripts/brief-narrative-parallel.mjs`, which a concurrent session holds modified
in the working tree; the second is the stale spec-referenced path owned by
`specs/025-*`. Neither names a Feature 022 artifact.

The DoD command's own assertion for this item passes inside that run:

```
$ node scripts/selftest.mjs 2>&1 | grep -nE 'TP-01-01: the pack-derived count|TP-01-21: the guard can fail'
2818:  ✓ TP-01-01: the pack-derived count of present figures matches the collected list, and every effective component citation — inherited or overridden — names a retrieved non-newsroom source with an absolute URL, a non-future retrievedAt and a locator, while the newsroom summary is cited by no fi
2819:  ✓ TP-01-21: the guard can fail — a present preferential table with no citation is refused, and a component override citing a not-retrieved record is refused with the override named
```

Direct behavioural probe of the default-plus-override model, run against the shipped
pack with every mutation held in memory:

```
$ node -e 'const R=require("./rltaxrules.js"); ... effectiveSourceFor on the single table; then the same table with sourceRef deleted and componentSources emptied'
OVERRIDDEN {"origin":"overridden","sourceRef":"irs-tc409","title":"Topic no. 409, Capital gains and losses","url":"https://www.irs.gov/taxtopics/tc409","retrievedAt":"2026-08-17T19:03:51.000Z","locatorLen":177}
INHERITED  {"origin":"inherited","sourceRef":"rp-2025-32","title":"Rev. Proc. 2025-32, Internal Revenue Bulletin 2025-45","url":"https://www.irs.gov/irb/2025-45_IRB","retrievedAt":"2026-08-17T19:03:51.000Z","locatorLen":167}
NO_DEFAULT REFUSED code=RLTAX-PACK-INVALID
PROBE_EXIT=0
```

The four refusal branches F-01-A records as unasserted are nevertheless **implemented**,
which is what this DoD item claims. Each was driven directly, in memory:

```
$ node -e 'const R=require("./rltaxrules.js"); ... four in-memory mutations of tax-rules/federal/2026.json, each passed to R.validateRulePack'
absent-band path           ok=false matching_refusals=1 code=RLTAX-PACK-INVALID
   reason: the component path names no component of the enclosing figure: band:no-such-band:rate
duplicate component        ok=false matching_refusals=1 code=RLTAX-PACK-INVALID
   reason: two entries name the same component band:b3:rate; a component with two authorities has no single answer
empty locator              ok=false matching_refusals=1 code=RLTAX-PACK-INVALID
   reason: a sourceRef without a locator is not a citation
   newsroom record present: true ir-2025-103
newsroom sourceRef         ok=false matching_refusals=2 code=RLTAX-PACK-INVALID
   reason: a newsroom-release may not be the sourceRef of a component; ir-2025-103 is a summary
   not-retrieved record present: false
not-retrieved sourceRef    ok=true matching_refusals=0
PROBE_EXIT=0
```

The fifth line is honest rather than passing: the shipped pack carries **no**
`retrievalOutcome != "retrieved"` record, so that probe mutated nothing and the pack
validated. That branch is covered instead by the `TP-01-21` assertion above, which
constructs such a record and sees the override refused by name.

No probe touched the tree:

```
$ git status --short tax-rules/
(no output)
```

**Claim Source:** executed. This item is ticked on implementation evidence only.
Assertion coverage for four of these branches remains open as F-01-A against the
Test Plan completeness item, which stays unticked.

### TP-01-02

Scenario SCN-022-001 — the unmodified Feature 021 pack validates unchanged through
the new validator and every `RateTable/v1` table is accepted with its default
citation intact.
Command: `node scripts/selftest.mjs`

**What ships.** The bumped pack is a mixed-contract pack, which is the strongest
available form of this canary: the four ordinary tables stayed `RateTable/v1` while
only the four preferential tables were promoted, so v1 and v2 are validated by the
same validator on the same run over the same file. A fifth-through-eighth v1 table
lives in the state fixture:

```
$ node -e 'count RateTable contract versions per pack file'
tax-rules/federal/2026.json {"RateTable/v1":4,"RateTable/v2":4}
tax-rules/fixtures/state-contract-no-preferential-2999.json {"RateTable/v1":4}
```

**Intended-RED, demonstrated in this session.** *Probe B* narrowed `isRateTable` in
`rltaxrules.js` to accept `RateTable/v2` only:

```
$ bash .github/bubbles/scripts/evidence-capture.sh --label "PROBE-B RED: validator rejects RateTable/v1" -- node scripts/selftest.mjs
exit: 1
lines: 3247
sha256: 26092a0c83cd41adc2bc9938689176e9462e1e75253093ef8236ef1837b8b2c7
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-01-01: the shipped federal pack validates and exposes every required TaxRulePack member
  ✗ FAIL: TP-01-03: an unsupported year, a non-federal jurisdiction, an expired pack, an unknown filing status and a digest mismatch each refuse by their own code and return no pack
  ✗ FAIL: TP-02-02: the stacking fixture is a structurally valid pack that can never resolve for a real jurisdiction or a real declared year
  ✗ FAIL: TP-03-06: a credit applied before rate application, a deduction applied after it, an appliesToLegs naming an undeclared leg and an empty applied-legs list are each refused, while both coherent pairings validate
  ✗ FAIL: TP-03-03: the federal pack still derives the federal ordered array element for element, a preferentialPolicy none pack derives the array that omits both preferential stages and carries the two new ones, and a pack imposing no tax derives an empty array
  ✗ FAIL: TP-03-02: the pack stays valid after the additive insertion, its digest is re-derivable and equals the configuration pointer, the pre-feature member set survives, and a sampled pre-existing figure from each figure family is byte-identical
  ✗ FAIL: TP-04-02: the profitable Scope 03 fixtures produce their exact prior settlements and the loss fixtures still refuse for the same pre-existing absent-allowance reason, identically whether no classification or an explicit none is supplied, the pack stays valid, its digest is re-derivable and
  ✗ FAIL: TP-05-01: every Feature 022 preferential fixture produces its exact prior preferential and total figures, settling identically with and without the registered recapture category so the registration is proven not to have reached inside the band walk, the pack stays valid, its digest is re-d
Research-Lab self-test: 2866 passed, 9 failed
```

Eight assertions across five features turn red the moment `RateTable/v1` stops
being accepted. Reverted and GREEN reconfirmed in the same step:

```
$ git checkout -- rltaxrules.js; echo "checkout_exit=$?"; git status --short rltaxrules.js
checkout_exit=0
STATUS_CLEAN_IF_EMPTY_ABOVE
$ node scripts/selftest.mjs
Research-Lab self-test: 2874 passed, 1 failed
```

**A limit on this row, stated rather than glossed.** The row's literal wording is
that *the unmodified Feature 021 pack* validates. Feature 021's pack file was
version-bumped in place to `2.0.0`; no pre-bump copy is committed anywhere in the
tree, so no run in this session can load the literal Feature 021 pack. What Probe B
proves is the property the canary exists to protect — the v1 contract is still
accepted, unchanged, by the v2-aware validator, and every value Feature 021's
assertions read from it is still produced. The DoD item is ticked on that.

#### Verification pass 2026-08-18 — DoD item 2 (`RateTable/v1` accepted unchanged)

The shipped federal pack carries **both** contract versions side by side and validates
with zero refusals, which is the acceptance claim stated directly:

```
$ node -e 'const R=require("./rltaxrules.js"); ... walk tax-rules/federal/2026.json counting RateTable contractVersions, then R.validateRulePack'
RateTable contract versions in shipped federal pack: {"RateTable/v1":4,"RateTable/v2":4}
shipped pack ok = true refusals = 0
a RateTable/v1 table is present = true bands=7 sourceRef=rp-2025-32
validateRateTable(v1) = "no direct export"
PROBE_EXIT=0
```

The four ordinary-income tables are still `RateTable/v1` with their default citation
intact; only the four preferential tables were promoted to `v2`.

**Intended-RED re-demonstrated in this session — Probe D.** `rltaxrules.js:25` was
changed from `var RATE_TABLE_CONTRACT = "RateTable/v1";` to
`"RateTable/v1-PROBE-D-RED"`, so a `v1` table is no longer recognised:

```
$ node scripts/selftest.mjs 2>&1 | grep -E 'self-test:|✗ FAIL'
  ✗ FAIL: market-brief.config.page.json is byte-current with its full source artifacts
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline …
  ✗ FAIL: TP-01-01: the shipped federal pack validates and exposes every required TaxRulePack member
  ✗ FAIL: TP-01-03: an unsupported year, a non-federal jurisdiction, an expired pack, an unknown filing status and a digest mismatch each refuse by their own code an…
  ✗ FAIL: TP-02-02: the stacking fixture is a structurally valid pack that can never resolve for a real jurisdiction or a real declared year
  ✗ FAIL: TP-03-06: a credit applied before rate application, a deduction applied after it, an appliesToLegs naming an undeclared leg and an empty applied-legs list…
  ✗ FAIL: TP-03-03: the federal pack still derives the federal ordered array element for element, a preferentialPolicy none pack derives the array that omits both pr…
  ✗ FAIL: TP-03-02: the pack stays valid after the additive insertion, its digest is re-derivable and equals the configuration pointer, the pre-feature member set su…
  ✗ FAIL: TP-04-02: the profitable Scope 03 fixtures produce their exact prior settlements and the loss fixtures still refuse for the same pre-existing absent-allowa…
  ✗ FAIL: TP-05-01: every Feature 022 preferential fixture produces its exact prior preferential and total figures, settling identically with and without the registe…
  ✗ FAIL: TP-026-1.1 a fixture payload one character over the total cap is refused and no partial artifact is written
  ✗ FAIL: TP-026-1.9 adversarial: removing the violations check makes the over-cap fixture validate, so the guard is load-bearing
  ✗ FAIL: the budget fires only on a literal market-brief-payload/v2 stamp; an unstamped payload skips it and the two error sets differ by exactly the budget strings
Research-Lab self-test: 2863 passed, 13 failed
```

Eight assertions across five features go red the instant `RateTable/v1` stops being
accepted. Reverted in the same step, and the revert verified at the source line:

```
$ git checkout -- rltaxrules.js; echo "checkout_exit=$?"; git status --short rltaxrules.js
checkout_exit=0
STATUS_CLEAN_IF_EMPTY_ABOVE
$ grep -n 'var RATE_TABLE_CONTRACT = ' rltaxrules.js
25:  var RATE_TABLE_CONTRACT = "RateTable/v1";
```

GREEN reconfirmed — all eight tax-pack failures cleared:

```
$ node scripts/selftest.mjs 2>&1 | grep -E 'self-test:|✗ FAIL'
  ✗ FAIL: market-brief.config.page.json is byte-current with its full source artifacts
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline …
  ✗ FAIL: TP-026-1.1 a fixture payload one character over the total cap is refused and no partial artifact is written
  ✗ FAIL: TP-026-1.9 adversarial: removing the violations check makes the over-cap fixture validate, so the guard is load-bearing
  ✗ FAIL: the budget fires only on a literal market-brief-payload/v2 stamp; an unstamped payload skips it and the two error sets differ by exactly the budget strings
Research-Lab self-test: 2871 passed, 5 failed
```

**A moving foreign baseline, stated rather than glossed.** This pass opened at
2874 passed / 2 failed and the post-revert run reads 2871 / 5. The three added
failures — `TP-026-1.1`, `TP-026-1.9` and the payload-budget assertion — are all
Feature 026 / market-brief, and all three were already present inside the Probe D
RED capture above, so they arrived from the concurrent session's in-flight edits
during the probe window rather than from the revert. `scripts/brief-refresh.mjs`
appeared as newly modified in the same window. No Feature 022 artifact is named by
any of the five.

Nothing was left behind:

```
$ git status --short
 M market-brief.config.json
 M notes/market-brief.md
 M scripts/brief-narrative-parallel.mjs
 M scripts/brief-refresh.mjs
 M scripts/selftest.mjs
 M scripts/validate-brief-payload.mjs
 M specs/022-federal-preferential-and-state-income-tax/scopes/01-federal-preferential-rate-completion/report.md
 M specs/022-federal-preferential-and-state-income-tax/scopes/01-federal-preferential-rate-completion/scope.md
 M specs/024-social-security-and-medicare/scopes/03-claim-age-comparison/report.md
 ?? … (the concurrent session's untracked 025/026 artifacts)
```

`rltaxrules.js` and `tax-rules/` are absent from that list. **Claim Source:** executed.

### TP-01-03

Scenario SCN-022-001 — `effectiveSourceFor` returns the override when present and
the default otherwise, flags which it returned, and refuses rather than defaulting
when the figure carries no default.
Command: `node scripts/selftest.mjs`

**Delivered.** The `SUP-022-02` region at `scripts/selftest.mjs:12267` walks every
component path of every present preferential table and requires the origin flag to
agree with the override list in both directions, plus the split-authority pair
directly:

```
    const originsAgree = paths.every((path) => {
      const effective = RLTAXRULES.effectiveSourceFor(taxPack, table, path);
      if (RLTAXRULES.isUnavailable(effective)) return false;
      const shouldBeOverridden = overriddenPaths.indexOf(path) >= 0;
      return effective.origin === (shouldBeOverridden ? 'overridden' : 'inherited')
        && typeof effective.locator === 'string' && effective.locator.length > 0;
    });
    ...
      && topRate.origin === 'overridden' && firstEdge.origin === 'inherited'
      && topRate.sourceRef !== firstEdge.sourceRef
```

The refuse-rather-than-default branch is exercised by the `uncitedPack` clone at
`scripts/selftest.mjs:12002`, which deletes `preferentialRateTables.single.sourceRef`
and requires the verdict to refuse.

**Intended-RED, demonstrated in this session.** *Probe C* made `effectiveSourceFor`
return a constant `origin: "inherited"`:

```
$ bash .github/bubbles/scripts/evidence-capture.sh --label "PROBE-C RED: effectiveSourceFor always reports inherited" -- node scripts/selftest.mjs
exit: 1
lines: 3247
sha256: de3822941eaee745fa1624fbb56203c4437534652caa1590b44f805f400c57f4
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-01-01: every one of Feature 021’s eighteen unsupported ids is in exactly one of unsupportedFeatures[], taxLegs[], the itemised composition, the pack’s inclusion policy and the pack’s medicare policy, the five sets are disjoint, the moved benefit id and the moved adjustment id are each a
Research-Lab self-test: 2873 passed, 2 failed
```

Reverted and GREEN reconfirmed in the same step:

```
$ git checkout -- rltaxrules.js; echo "checkout_exit=$?"; git status --short rltaxrules.js
checkout_exit=0
STATUS_CLEAN_IF_EMPTY_ABOVE
$ node scripts/selftest.mjs
Research-Lab self-test: 2874 passed, 1 failed
```

### TP-01-04

Scenario SCN-022-002 — preferential tax is exact immediately below, exactly at,
and immediately above every breakpoint the pack carries, for every filing status
whose table resolved.
Command: `node scripts/selftest.mjs`

**Delivered, for `single`.** The `SUP-022-06` region at `scripts/selftest.mjs:13568`
derives the edge set from the pack rather than holding it, and requires each
carried edge to appear as an exact crossing **pair**:

```
  const carriedBreakpoints = curvePack.preferentialRateTables.single.bands
    .map((band) => band.lowerInclusive).filter((edge) => edge > 0);
  const everyCarriedBreakpointIsAnExactCrossing = carriedBreakpoints.every((edge) => {
    const declaredLevel = edge + curveDeduction;
    if (declaredLevel < curveSweep.start || declaredLevel > curveSweep.end) return true;
    return gainLevels.indexOf(declaredLevel) >= 0 && gainLevels.indexOf(declaredLevel - curveSweep.probe) >= 0;
  });
```

**Intended-RED, demonstrated in this session.** *Probe D* shifted the preferential
band lower edge by one dollar in `rltax.js`:

```
$ bash .github/bubbles/scripts/evidence-capture.sh --label "PROBE-D RED: preferential band lower edge shifted by one dollar" -- node scripts/selftest.mjs
exit: 1
lines: 3234
sha256: 6a64ae0c3761a0ffd268a517dbc4bef99680a3f560f4c2c087b0127596f47deb
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-02-02: the preferential amount is taxed in the bands above ordinary taxable income, raising ordinary income alone changes the tax on an unchanged gain, and qualified dividends stack identically
  ✗ FAIL: TP-02-03: the guard can fail — a CO-7 window with the ordinary term dropped taxes the gain in isolation, is blind to ordinary income, and does not match the stacked result
  ✗ FAIL: TP-03-01: the next dollar is priced as two ordered multi-point curves; the curve record carries no averageRate and no scalar rate, and the settlement record carries no effectiveMarginalRate
  ✗ FAIL (Feature 021 Scope 03 curve group threw): Cannot read properties of undefined (reading 'forEach')
Research-Lab self-test: 2857 passed, 5 failed
```

Reverted and GREEN reconfirmed:

```
$ git checkout -- rltax.js; echo "checkout_exit=$?"; git status --short rltax.js
checkout_exit=0
STATUS_CLEAN_IF_EMPTY_ABOVE
$ node scripts/selftest.mjs
Research-Lab self-test: 2874 passed, 1 failed
```

**Not delivered — the other three filing statuses.** The row, and the DoD item it
anchors, both say *for every filing status*. *Probe E* isolated exactly that
question by corrupting the band edge for every status **except** `single`, keyed on
`table.filingStatus`, so a status with real coverage would go red and a status
without it would not:

```
$ bash .github/bubbles/scripts/evidence-capture.sh --label "PROBE-E: preferential band edge corrupted for every status EXCEPT single" -- node scripts/selftest.mjs
exit: 1
lines: 3247
sha256: 11aabf5140b8bb0c3c7233d9c10b80a0994b4f44cfc105395012025ee3557cc2
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
Research-Lab self-test: 2874 passed, 1 failed
```

```
$ npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line
  63 passed (47.6s)
PIPESTATUS=0
```

Both suites stay fully green. The married-filing-jointly, married-filing-separately
and head-of-household preferential breakpoints — `98,900 / 613,700`,
`49,450 / 306,850` and `66,200 / 579,600` — carry **no** boundary coverage at all.
Nor do the shipped edge values appear anywhere in the suite:

```
$ for v in 49450 545500 98900 613700 306850 66200 579600; do printf '%-8s selftest=%s\n' "$v" "$(grep -c "$v" scripts/selftest.mjs)"; done
49450    selftest=0
545500   selftest=0
98900    selftest=0
613700   selftest=3
306850   selftest=0
66200    selftest=0
579600   selftest=0
```

The three `613700` hits are byte-identity canaries in the Feature 023, 024 and 025
groups (`PACK03/PACK04/PACK05...bands[1].upperExclusive === 613700`), not boundary
coverage.

The scope's Implementation Files section also called for *"Known-value fixture
files for every preferential breakpoint, for each filing status the pack carries,
each naming the source edition and tax year it was derived from."* No such fixture
file exists. This is recorded as finding **F-01-B**.

Reverted and GREEN reconfirmed:

```
$ git checkout -- rltax.js; echo "checkout_exit=$?"; git status --short rltax.js
checkout_exit=0
STATUS_CLEAN_IF_EMPTY_ABOVE
$ node scripts/selftest.mjs
Research-Lab self-test: 2874 passed, 1 failed
```

#### Verification pass 2026-08-18 — DoD item 6 (known-value boundary coverage)

**Claim Source:** executed. **Outcome: the item does not hold and stays `[ ]`.**

The item requires boundary coverage *for every filing status*, plus a fixture file
per breakpoint *naming the source edition and tax year*. Re-checked against the
current tree rather than read off the earlier pass.

Step 1 — the pack carries a real, non-absent table for all four statuses, so the
"every filing status" clause is not vacuous for any of them:

```
$ node -e "
const p=require('./tax-rules/federal/2026.json');
for (const [k,v] of Object.entries(p.preferentialRateTables)) {
  console.log(k, Array.isArray(v.bands) ? 'edges=' + v.bands.map(b=>b.lowerInclusive).filter(e=>e>0).join('/') : 'ABSENT');
}
"; echo "exit=$?"
single edges=49450/545500
married-filing-jointly edges=98900/613700
married-filing-separately edges=49450/306850
head-of-household edges=66200/579600
exit=0
```

Step 2 — every preferential-table reference in the whole-repo gate names `single`
and nothing else. There is no status loop and no per-status boundary sweep:

```
$ grep -n "preferentialRateTables\." scripts/selftest.mjs
12006:  delete uncitedPack.preferentialRateTables.single.sourceRef;
12031:  smuggling.preferentialRateTables.single.value = 0;
12046:    && domainsOf(smugglingVerdict.refusals).some((domain) => domain.indexOf('preferentialRateTables.single.value') >= 0)
12330:  const yearMixedTable = yearMixedPack.preferentialRateTables.single;
12811:    const isolatedLow = isolatedStacking(50, 100, fixturePack.preferentialRateTables.single);
12812:    const isolatedHigh = isolatedStacking(150, 100, fixturePack.preferentialRateTables.single);
12813:    const stackedLow = RLTAX.stackPreferentialIncome(50, 100, fixturePack.preferentialRateTables.single).tax;
13634:  const carriedBreakpoints = curvePack.preferentialRateTables.single.bands
14111:    headlinePack.preferentialRateTables.single.bands[1].upperExclusive;
14790:  contradictoryPack.preferentialRateTables.single = {
17384:  const table05 = PACK05.preferentialRateTables.single;
```

The browser suite is the same shape — `lifetime-tax-federal.spec.mjs:15/96/116/159`,
`lifetime-tax-foundation.spec.mjs:80/193/194/195` and
`lifetime-tax-marginal.spec.mjs:241` all index `.single`. The two places that *do*
iterate `Object.keys(pack.preferentialRateTables)`
(`lifetime-tax-foundation.spec.mjs:103`, `lifetime-tax-marginal.spec.mjs:31`)
**overwrite** every status with an absent-table stub; they are the absent-table
substitution, not boundary coverage.

Step 3 — none of the six non-`single` breakpoint values is asserted anywhere:

```
$ for v in 49450 545500 98900 613700 306850 66200 579600; do printf '%-7s selftest=%s tests=%s\n' "$v" "$(grep -c "$v" scripts/selftest.mjs)" "$(grep -rl "$v" tests/ 2>/dev/null | tr '\n' ' ')"; done
49450   selftest=0 tests=tests/fixtures/feature-009/msft-bars.json 
545500  selftest=0 tests=tests/fixtures/feature-009/msft-bars.json 
98900   selftest=0 tests=
613700  selftest=3 tests=
306850  selftest=0 tests=
66200   selftest=0 tests=tests/brief-refresh-atomicity.test.mjs tests/fixtures/trend-dynamics-cycle/source-qualified/irregular-series.json tests/fixtures/feature-009/msft-bars.json 
579600  selftest=0 tests=
```

The `msft-bars.json`, `brief-refresh-atomicity` and `irregular-series` hits are
unrelated Feature 009 / brief artifacts that happen to contain the digit string.
The three `613700` hits in the gate remain the Feature 023/024/025 byte-identity
canaries already characterised above, not crossings.

Step 4 — no known-value fixture file exists:

```
$ ls specs/022-federal-preferential-and-state-income-tax/scopes/01-federal-preferential-rate-completion/
report.md
scope.md
$ find . -path ./node_modules -prune -o -name '*preferential*' -print
./tax-rules/fixtures/state-contract-no-preferential-2999.json
./specs/022-federal-preferential-and-state-income-tax
./specs/022-federal-preferential-and-state-income-tax/scopes/01-federal-preferential-rate-completion
```

The single fixture found is a *state*-contract absence fixture; it carries no
federal preferential breakpoint and names no source edition.

**Conclusion.** `single` has below/at/above coverage; `married-filing-jointly`,
`married-filing-separately` and `head-of-household` have none, and no fixture file
names a source edition or tax year for any breakpoint. This is exactly finding
**F-01-B** recorded under TP-01-04, now re-confirmed against the current tree. The
DoD item is left unchecked. Supplying the missing coverage is construction work
against `scripts/selftest.mjs` and new fixture files, not verification, so it is
not performed in this pass.

No file was mutated during this verification; every step was read-only.

#### Verification pass 2 — 2026-08-18 — DoD item 6 now HOLDS

**Claim Source:** executed. **Outcome: the item holds and is ticked `[x]`.**

The construction the pass above declined to perform has since been delivered: the
group `Feature 022 Scope 01 — preferential breakpoints for the three filing
statuses beyond single` is now present in `scripts/selftest.mjs`. Provenance,
located rather than assumed — `git log -S` puts the group's introduction in commit
`3855ee75d`, the concurrent Feature 026 commit that swept the shared
`scripts/selftest.mjs`, while its browser companion
`tests/lifetime-tax-preferential.spec.mjs` landed separately in `5920d9ede`. The
split is an artefact of two streams sharing one file; it does not change what the
group asserts. This pass re-verifies the item against the current tree rather than
against any commit message.

Baseline of this session, captured before any work:

```
$ node scripts/selftest.mjs > "$TMPDIR/st_base.log" 2>&1; echo "exit=$?"
exit=1
$ grep -c 'passed' "$TMPDIR/st_base.log"
Research-Lab self-test: 2993 passed, 1 failed
```

The single failure is the spec-test-path guard, owned by a concurrent session and
untouched here:

```
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 66 known-missing, 5 stale of 240 referenced)
```

Clause 1 — below/at/above for **every** filing status. `single` was already
covered and remains so (`SUP-022-06` / TP-03-01, from the same run):

```
  ✓ TP-03-01: the shipped pack computes a long-term gain curve whose every carried preferential breakpoint is an exact crossing pair rather than a grid position and whose tax at every sampled level equals an independent settlement of the same amount declared as a qualified dividend, while the whole original refusal — including both hasOwnProperty clauses proving a refusal smuggles no shape — is retained verbatim against the absent-table fixture
```

The other three statuses are now covered at the same rigour, 18 checks over their
6 breakpoints, from the same run:

```
Feature 022 Scope 01 — preferential breakpoints for the three filing statuses beyond single
  ✓ TP-01-16: every filing status beyond single is either a carried preferential rate table or a declared absent figure with no third state, and all three are statuses the engine supports (carried: married-filing-jointly,married-filing-separately,head-of-household; absent: none)
  ✓ TP-01-16: every carried preferential band edge and rate for married-filing-jointly, married-filing-separately and head-of-household equals the independently transcribed Rev. Proc. 2025-32 section 4.03 schedule, with a zero-floored first band and an unbounded top band (3 table(s) checked)
  ✓ TP-01-16: the preferential tax is exact immediately below, exactly at, and immediately above every breakpoint of every carried filing status beyond single (18 checks over 6 breakpoint(s): no failure)
  ✓ TP-01-16: at each carried breakpoint the band beginning there is priced at zero dollars, one dollar past the zero-rate top costs exactly 15 cents, one dollar past the 15 percent top costs exactly 20 cents, and the cumulative tax at the 15 percent top equals 15 percent of the whole 15 percent band (no failure)
  ✓ TP-01-16: for every carried filing status beyond single an unchanged gain is priced at the pack’s zero rate at the floor, at 15 percent when it sits on top of the zero-rate top, and at 20 percent when it sits on top of the 15 percent top, a gain-alone model blind to ordinary income disagrees at both raised positions, and qualified dividends are priced identically to long-term gains (no failure)
  ✓ TP-01-16 REFUSAL: a filing status beyond single whose preferential table is an AbsentFigure refuses the preferential leg and the whole federal total with RLTAX-THRESHOLD-UNAVAILABLE, carries no bands and no value, leaves the ordinary leg standing and marks L4 not-evaluable, rather than pricing the gain at a substituted rate or dropping the leg from the total (no failure)
  ✓ TP-01-16 ADVERSARIAL: the known-value coverage discriminates — pricing the window from zero disagrees with the shipped figure for every carried status, substituting the single table disagrees wherever the two schedules differ, and married-filing-separately is shown to share the single zero-rate top while carrying its own 15 percent top so the shared figure is named rather than mistaken for agreement (no failure)
```

`18 checks over 6 breakpoint(s)` is the arithmetic the clause asks for: 3 statuses
× 2 breakpoints × 3 positions. The four crossings the earlier pass named as
asserted nowhere — `98900`, `613700`, `306850`, `66200`, `579600`, `49450` — are
now the exact figures the parity assertion compares, and the two `TP-01-16`
edge-step clauses assert the below/at/above steps rather than an aggregate that
could pass with both sides shifted together.

Clause 2 — non-vacuity. The `ADVERSARIAL` line above is not an assumption: it
holds because pricing the window from zero **disagrees** with the shipped figure
for every carried status, and because substituting the `single` table disagrees
wherever the two schedules differ. The check that a copy-paste of `single` would
be caught is stated explicitly for `married-filing-separately`, whose zero-rate
top happens to equal `single`'s while its 15-percent top does not.

Clause 3 — each fixture names the source edition and the tax year. The fixture is
the in-file `KNOWN_PREFERENTIAL_SCHEDULE` block, not a separate file; the earlier
pass looked only for a separate file and so recorded the clause as unmet. Read
directly from the current tree:

```
$ sed -n '22050,22065p' scripts/selftest.mjs
  /* `single` is deliberately excluded. It already carries below/at/above coverage two groups up,
     and repeating it here would inflate the check count without checking a new figure. */
  const STATUSES_BEYOND_SINGLE = ['married-filing-jointly', 'married-filing-separately', 'head-of-household'];

  /* Rev. Proc. 2025-32 section 4.03 states the preferential schedule as two amounts per filing
     status — the maximum zero rate amount and the maximum 15 percent rate amount — with the top
     rate carried separately by the pack's own `componentSources` override citing `irs-tc409`.
     Written out here rather than read back through the pack objects, so a mistyped digit in
     either place fails the parity assertion below instead of cancelling against itself. */
  const KNOWN_PREFERENTIAL_SCHEDULE = {
    'married-filing-jointly': { maximumZeroRateAmount: 98900, maximumFifteenPercentRateAmount: 613700 },
    'married-filing-separately': { maximumZeroRateAmount: 49450, maximumFifteenPercentRateAmount: 306850 },
    'head-of-household': { maximumZeroRateAmount: 66200, maximumFifteenPercentRateAmount: 579600 }
  };
  const KNOWN_PREFERENTIAL_RATES = [0, 0.15, 0.2];
```

The source edition is named in the block itself — **Rev. Proc. 2025-32 section
4.03** — and the tax year is named twice inside the same group, once as the pack
path it reads and once as the declared year every fixture workspace carries:

```
$ sed -n '22120,22123p' scripts/selftest.mjs
    const workspace = WORKSPACEPREF.createEmptyWorkspace();
    workspace.filingStatus = filingStatus;
    workspace.declaredTaxYear = 2026;
```

with the pack read as `JSON.parse(read('tax-rules/federal/2026.json'))` at the top
of the same group. Both the edition and the year are therefore named beside the
transcribed figures. No figure in the block is derived, interpolated or recalled:
each is compared digit-for-digit against the committed pack by the parity
assertion, so a mistyped transcription fails rather than cancels.

**Conclusion.** Finding **F-01-B** is closed. All four filing statuses carry
below/at/above known-value coverage, the coverage is proven to discriminate, and
the fixture names its source edition and its tax year. The item is ticked.

No file was mutated during this verification; every step was read-only.

### TP-01-05

Scenario SCN-022-002 — a qualified dividend and a long-term capital gain of the
same amount produce an identical total, and pooling order does not change the
result.
Command: `node scripts/selftest.mjs`

**Delivered, and stronger than the row asks.** Pooling identity is asserted twice
over. On the fixture pack at `scripts/selftest.mjs:12771`:

```
    assert(... && approx(dividendOnly.preferentialTax.value, lowOrdinary.preferentialTax.value, 0.0000001) ...,
    'TP-02-02: the preferential amount is taxed in the bands above ordinary taxable income, raising ordinary income alone changes the tax on an unchanged gain, and qualified dividends stack identically');
```

And on the **shipped** pack, per sampled curve level, inside `SUP-022-06`. That
comparison is deliberately not a second gain curve — it is a full settlement of the
identical amount declared as a qualified dividend:

```
  const dividendTwin = shippedGainCurve.points.map((point) => RLTAX.computeAnnualFederalTax(
    curveWorkspace({ income: { qualifiedDividend: point.level } }), curvePack).totalFederalTax);
  const pooledIdentity = dividendTwin.every((settled, index) =>
    !RLTAXRULES.isUnavailable(settled)
    && Math.abs(settled.value - shippedGainCurve.points[index].taxAtLevel) < 0.0000001);
  const settlementPoolingIdentity = dividendPooledSettlements
    .every((pair) => Number.isFinite(pair.gain) && pair.gain === pair.dividend);
```

**Intended-RED.** Probe D above broke this row together with TP-01-04:
`TP-02-02: ... and qualified dividends stack identically` was among the five
failures, and returned to green on revert. The same capture and revert block
recorded under TP-01-04 is this row's evidence.

### TP-01-06

Scenario SCN-022-002 — `totalFederalTax` is a valued record for a household with
preferential income in a resolved status, and remains
`RLTAX-THRESHOLD-UNAVAILABLE` for a status whose table is absent.
Command: `node scripts/selftest.mjs`

**Delivered.** `SUP-022-05` at `scripts/selftest.mjs:12814` asserts the valued,
reconciling total for the resolved status, and relocates the whole original refusal
onto the absent-table fixture pack rather than deleting it:

```
12861: TP-02-10: for a status whose preferential table resolved the total is a valued, reconciling record whose legs sum to it within the pack tolerance, and the whole original missing-leg refusal ...
12869: TP-02-10: the guard can fail — a plausible total is available to be fabricated from the surviving ordinary leg, and the absent-table fixture is proven to carry no value member in its place
```

**Intended-RED.** Probe D turned the valued half red through the settlement path;
Probe B turned the pack-resolution path red at `TP-01-01: the shipped federal pack
validates`, which is the precondition for any valued total. Both captures and both
reverts are recorded above.

#### Verification pass 2026-08-18 — DoD item 5 (FR-022-004 and FR-022-005)

This is the scope's Primary Outcome, so it was settled directly rather than read off
an assertion label. Four real households were run through
`RLTAX.computeAnnualFederalTax` against the shipped pack, with a complete workspace
(`deductionMode: 'itemized'`, `itemizedAmount: 0`, both surtax bases declared zero):

```
$ node -e 'const RULES=require("./rltaxrules.js"), TAX=require("./rltax.js"), WS=require("./rltaxworkspace.js"); ... computeAnnualFederalTax against tax-rules/federal/2026.json'
=== FR-022-004: the preferential table resolves per status ===
  single                     totalFederalTax=30398  preferentialTax=9000
  married-filing-jointly     totalFederalTax=24824  preferentialTax=9000
  married-filing-separately  totalFederalTax=32488  preferentialTax=9000
  head-of-household          totalFederalTax=28587  preferentialTax=9000
=== FR-022-005a: pooling — gain vs dividend vs a 50/50 split, same amount ===
  single                     gain60k=30398 dividend60k=30398 split30/30=30398  IDENTICAL=true
  married-filing-jointly     gain60k=24824 dividend60k=24824 split30/30=24824  IDENTICAL=true
  married-filing-separately  gain60k=32488 dividend60k=32488 split30/30=32488  IDENTICAL=true
  head-of-household          gain60k=28587 dividend60k=28587 split30/30=28587  IDENTICAL=true
=== FR-022-005b: stacking — ordinary income alone moves the tax on an UNCHANGED 60k gain ===
  ordinary=30000   gain=60000  preferentialTax=6082.5  ordinaryTax=3352  total=9434.5
  ordinary=130000  gain=60000  preferentialTax=9000  ordinaryTax=23798  total=32798
  ordinary=600000  gain=60000  preferentialTax=12000  ordinaryTax=178769.25  total=193049.25
PROBE_EXIT=0
```

**FR-022-004.** All four statuses return a **valued** `totalFederalTax`. None returns
`RLTAX-THRESHOLD-UNAVAILABLE`, which is precisely the refusal Feature 021 shipped and
this scope exists to remove.

**FR-022-005, pooling.** A 60,000 long-term gain, a 60,000 qualified dividend, and a
30,000/30,000 split of the two produce the identical total in every one of the four
statuses. Twelve settlements, four distinct values, exact equality within each status.

**FR-022-005, stacking.** The gain is held at 60,000 while ordinary income alone moves,
and the preferential tax moves with it: 6,082.50 → 9,000 → 12,000. Those three are not
opaque — they reconcile against the shipped `single` table (`edges [49450, 545500]`,
`rates [0, 0.15, 0.2]`) as an arithmetic consequence of stacking above ordinary taxable
income:

- ordinary taxable 30,000 → 19,450 of the gain sits in the 0% band and 40,550 in the
  15% band → 40,550 × 0.15 = **6,082.50**
- ordinary taxable 130,000 → the whole gain sits in the 15% band → 60,000 × 0.15 = **9,000**
- ordinary taxable 600,000 → the whole gain sits above 545,500 in the 20% band →
  60,000 × 0.20 = **12,000**

The third figure is the top-band rate that `irs-tc409` overrides in, so this settlement
also exercises the split-authority path end to end. No figure here is recalled; each is
derived from the pack's own table, and the pack's figures carry the provenance verified
under DoD item 3.

The DoD command's own assertions agree in the same run:

```
$ node scripts/selftest.mjs 2>&1 | grep -E '(TP-02-02|TP-02-10|TP-03-01): '
  ✓ TP-02-02: the preferential amount is taxed in the bands above ordinary taxable income, raising ordinary income alone changes the tax on an unchanged gain, and qualified dividends stack identically
  ✓ TP-02-02: CO-4 caps the preferential amount at total taxable income, so the deduction is absorbed by ordinary income first and ordinary taxable income never goes negative
  ✓ TP-02-10: for a status whose preferential table resolved the total is a valued, reconciling record whose legs sum to it within the pack tolerance, and the whole original missing-leg refusal — including L4 not-ev…
  ✓ TP-02-10: the guard can fail — a plausible total is available to be fabricated from the surviving ordinary leg, and the absent-table fixture is proven to carry no value member in its place
  ✓ TP-03-01: the shipped pack computes a long-term gain curve whose every carried preferential breakpoint is an exact crossing pair rather than a grid position and whose tax at every sampled level equals an indepen…
  ✓ TP-03-01: the guard can fail — the shipped gain curve prices the next gain dollar above zero at some level, so a curve that dropped the preferential leg would be visible, and the absent-table fixture is proven t…
```

Each of the three carries its own `the guard can fail` companion, so none of these is a
vacuous pass. **Claim Source:** executed.

### TP-01-07

Scenario SCN-022-001 — a table whose breakpoints are overridden to the rate
authority, whose amounts carry a different tax year, is proven to fail the
tax-year agreement assertion.
Command: `node scripts/selftest.mjs`

**A genuine defect was found here, and fixed in this session.**

The passing direction was delivered: `SUP-022-02` at `scripts/selftest.mjs:12316`
asserts `componentYearContainment(...) === null` for every component path of every
present preferential table. The **refusing** direction — the entire reason the
scope's implementation plan makes per-component-kind containment its own step —
was implemented but never asserted. Searching the whole suite found the rate
authority named only in the unrelated `not-retrieved` clone and one byte-identity
canary:

```
$ node -e 'print every selftest line naming irs-tc409 or componentYearContainment'
12009: notRetrievedPack.sourceRecords.find((record) => record.sourceId === 'irs-tc409').retrievalOutcome = 'not-retrieved';
12010: notRetrievedPack.sourceRecords.find((record) => record.sourceId === 'irs-tc409').retrievalNote = 'deliberately marked not-retrieved for the adversaria
12316: const containmentHolds = paths.every((path) => RLTAXRULES.componentYearContainment(taxPack, table, path) === null);
15849: ['rp-2025-32', 'irs-tc409', 'irs-p505-2026', 'ir-2025-103'].indexOf(record.sourceId) >= 0);
```

*Probe F* proved the consequence: containment was made to never refuse, and the
suite stayed completely green.

```
$ bash .github/bubbles/scripts/evidence-capture.sh --label "PROBE-F: componentYearContainment never refuses" -- node scripts/selftest.mjs
exit: 1
lines: 3247
sha256: 0279cedd9d74406d8093c10345c97cb0bd5289e8117cfaad8ff4083d9eefa4c2
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
Research-Lab self-test: 2874 passed, 1 failed
```

Reverted, then the implementation was checked directly. `rltaxrules.js` is correct;
only the assertion was missing. Both outcomes do separate on the one record:

```
$ node -e 'exercise componentYearContainment on both kinds of the same record irs-tc409'
=== BOTH OUTCOMES ON THE SAME RECORD irs-tc409 ===
rate override  band:b3:rate        -> null
breakpoint override band:b2:lowerInclusive -> {"code":"RLTAX-THRESHOLD-UNAVAILABLE","reason":"component band:b2:lowerInclusive of kind breakpoint cites irs-tc409, which does not declare that kind applicable to tax year 2026"}

=== does validateRulePack refuse the mutated pack? ===
ok= false
   RLTAX-THRESHOLD-UNAVAILABLE pack-member:preferentialRateTables.single.band:b2:lowerInclusive
```

**The fix.** One assertion was appended to `scripts/selftest.mjs`, inside the
existing `SUP-022-02` region and carrying that ledger id as an `ADVERSARIAL`
companion, in the same shape the neighbouring `SUP-022-01 ADVERSARIAL` block uses.
It clones the pack, adds a `band:b2:lowerInclusive` override to `irs-tc409`, and
requires the rate kind to pass and the breakpoint kind to refuse with the component
named. Nothing was weakened and no existing assertion was edited; the pass count
rose by one.

```
$ bash .github/bubbles/scripts/evidence-capture.sh --label "FIX F-01-C GREEN: containment refusing direction now asserted" -- node scripts/selftest.mjs
exit: 1
lines: 3248
sha256: dd6f9d26a890013c3ca3315132abe9992eb7764bdf98f2646333ed929ebbaf1c
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
Research-Lab self-test: 2875 passed, 1 failed
```

**The new assertion is non-vacuous.** *Probe F2* re-disabled containment with the
new assertion in place:

```
$ bash .github/bubbles/scripts/evidence-capture.sh --label "PROBE-F2 RED: containment never refuses, WITH the new assertion in place" -- node scripts/selftest.mjs
# PROBE-F2 RED: containment never refuses, WITH the new assertion in place
exit: 1
lines: 3248
sha256: 7302ebf180a42420ea6d2796161f858a4679aecd9127b03eaca8dca7b5f9bd09
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
  ✗ FAIL: TP-01-07: per-component-kind year containment separates two outcomes on one source record — the top-band rate override to irs-tc409 passes because that record declares its rate kind year-invariant, while a 2026 breakpoint override to the SAME record refuses with the component named, which
Research-Lab self-test: 2874 passed, 2 failed
```

Reverted and GREEN reconfirmed, with the fix retained:

```
$ git checkout -- rltaxrules.js; echo "checkout_exit=$?"; git status --short rltaxrules.js rltax.js tax-rules/
checkout_exit=0
STATUS_CLEAN_IF_EMPTY_ABOVE
$ node scripts/selftest.mjs
Research-Lab self-test: 2875 passed, 1 failed
```

#### Verification pass 2 — 2026-08-18 — DoD item 13 HOLDS

**Claim Source:** executed. **Outcome: the item holds and is ticked `[x]`.**

The evidence above was captured when the suite stood at 2875 passed. This pass
re-confirms the assertion still exists at HEAD and still passes in a suite that has
since grown to 2993, so the item is not being ticked off a stale capture.

The assertion is present in the current tree at `scripts/selftest.mjs:12558`:

```
$ grep -n 'per-component-kind year containment separates two outcomes' scripts/selftest.mjs
12558:  'TP-01-07: per-component-kind year containment separates two outcomes on one source record — the top-band rate override to irs-tc409 passes because that record declares its rate kind year-invariant, while a 2026 breakpoint override to the SAME record refuses with the component named, which no flat whole-record year list could express');
```

and passes in this session's baseline run:

```
$ grep -n 'TP-01-07: per-component-kind year containment' "$TMPDIR/st_base.log"
2885:  ✓ TP-01-07: per-component-kind year containment separates two outcomes on one source record — the top-band rate override to irs-tc409 passes because that record declares its rate kind year-invariant, while a 2026 breakpoint override to the SAME record refuses with the component named, which no flat whole-record year list could express
```

Both halves the DoD item names are inside that one assertion, on the one record
`irs-tc409`: the `band:b3:rate` override **passes** containment because the record
declares its `rate` kind year-invariant, and the `band:b2:lowerInclusive` override
to the same record **refuses** `RLTAX-THRESHOLD-UNAVAILABLE` naming the component,
because the record's `breakpoint` kind declares a different tax year. Non-vacuity
is not assumed: Probe F2 above disabled containment with this assertion in place
and the assertion was **seen to fail** (`2874 passed, 2 failed`), then seen to pass
again on revert under the same command. The mutation was reverted immediately and
`git status --short` confirmed clean before the next step.

### TP-01-08

Scenario SCN-022-003 — an implementation that prices an unsupported preferential
category in a carried band is proven to fail the unsupported-feature enumeration.
Command: `node scripts/selftest.mjs`

### TP-01-09

Scenario SCN-022-003 — every preferential category the pack does not carry is
present in `unsupportedFeatures[]` with a reason, and no code path emits a
complete-federal-tax label.
Command: `node scripts/selftest.mjs`

#### Verification pass 2026-08-18 — DoD item 7 (FR-022-006 and FR-022-007)

**Claim Source:** executed. **Outcome: the item holds and is ticked.**

Baseline first, so the two guard probes below are read against a known gate state:

```
$ bash .github/bubbles/scripts/evidence-capture.sh --label "DoD item 7 baseline: FR-022-006 + FR-022-007" -- node scripts/selftest.mjs
# DoD item 7 baseline: FR-022-006 + FR-022-007
$ node scripts/selftest.mjs
exit: 1
lines: 3281
sha256: 356a22447277781ff01c82d9c61d948562c71f957ae9c32534aa99dc7aa51d1e
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 71 known-missing, 0 stale of 240 referenced)
--- omitted 3241 line(s); sha256 above covers the full output ---
Research-Lab self-test: 2906 passed, 1 failed
```

The one failure is the spec-test-path baseline drift owned by a concurrent session
on a different feature; it names no Feature 022 assertion and is not this scope's.
Every assertion cited below therefore passed in that run.

**FR-022-007 — the tax-year mixing guard can fail, and both outcomes separate on
one record.** Probed in memory against the shipped pack; nothing on disk was
touched:

```
$ node -e "…componentYearContainment on the rate kind and the breakpoint kind of the SAME record irs-tc409…"
=== FR-022-007 tax-year mixing: both outcomes on the SAME record irs-tc409 ===
shipped rate override  : band:b3:rate -> irs-tc409
rate kind containment  : null
breakpoint containment : {"contractVersion":"TaxUnavailable/v1","code":"RLTAX-THRESHOLD-UNAVAILABLE","domain":"component-year:band:b2:lowerInclusive","reason":"component band:b2:lowerInclusive of kind breakpoint cites irs-tc409, which does not declare that kind applicable to tax year 2026","whatWouldMakeItAvailable":"cite an authority that states this component for the declared tax year; no figure is carried between years"}
separable              : true
exit=0
```

The shipped top-band rate override to `irs-tc409` passes containment because that
record declares its `rate` kind year-invariant; a `breakpoint` override to the
**same** record refuses with the component named. A flat whole-record year list
could produce only one of those two answers, which is why the scope made
per-component-kind containment its own implementation step. The refusing direction
is asserted at `scripts/selftest.mjs:12349` (`TP-01-07`), whose `SUP-022-02
ADVERSARIAL` companion was added earlier in this scope's execution and was itself
shown non-vacuous by Probe F2 above.

**FR-022-006 — every uncarried preferential category is named, and the enumeration
guard is non-vacuous.** Also probed in memory:

```
$ node -e "…derive the above-rate deferral set from the pack's own reason text; drop one from a clone…"
=== FR-022-006 uncarried preferential categories, DERIVED from the pack reason text ===
 - qualified-small-business-stock-section-1202-gain | rate=28% | code=RLTAX-FEATURE-UNSUPPORTED | reasonLen=282 | successor=A later preferential-category feature carrying the section 1202 exclusion and the 28-percent maximum rate on the taxable part.
 - collectibles-gain | rate=28% | code=RLTAX-FEATURE-UNSUPPORTED | reasonLen=243 | successor=A later preferential-category feature carrying the collectibles 28-percent maximum rate.
 carried instead   : unrecaptured-section-1250-gain maximumRate=0.25 sourceRef=irs-tc409
 still-in-list?    : false
=== the enumeration guard is non-vacuous: drop one category from a CLONE ===
 shipped derived set size = 2 | clone derived set size = 1 | guard distinguishes = true
=== no code path claims a complete federal tax ===
  rltax.js completeFederalTax:true occurrences = 0
  rltaxrules.js completeFederalTax:true occurrences = 0
  rltaxworkspace.js completeFederalTax:true occurrences = 0
exit=0
```

Topic no. 409 names three categories taxed above the pack's top carried
preferential rate. Two remain uncarried and are named with their own reason, their
own `RLTAX-FEATURE-UNSUPPORTED` code and their own named successor. The third,
`unrecaptured-section-1250-gain`, has since **left** the deferral list — not by
deletion but because Feature 023 carries it as a priced category at its own sourced
25-percent maximum rate. `SUP-023-09` at `scripts/selftest.mjs:13059` records that
relocation and asserts the stronger form: the id is absent from the notice set
**and** present as a category whose settled disposition component prices at
`own-maximum-rate` with a matching citation. So FR-022-006 still reads true on the
current tree — the set named is exactly the set not carried.

The retained half is derived, not listed: `aboveRatePattern023` recomputes the
deferral set from the pack's own reason text, so removing one of the two remaining
categories changes the derived set rather than passing a hardcoded literal. The
clone probe above shows exactly that discrimination (2 → 1).

**Complete-federal-tax labelling.** `TP-02-10` at `scripts/selftest.mjs:13097`
asserts `balancedSettled.completeFederalTax === false` together with
`completeClaims.length === 0`, and the direct file scan above confirms none of the
three modules carries a `completeFederalTax: true` literal.

**TP-01-08** is satisfied by the adversarial at `scripts/selftest.mjs:12524`, which
requires the accounting to break three separate ways — a computed leg listed in
`unsupportedFeatures[]` breaking disjointness, an id dropped from
`unsupportedFeatures[]` with no leg declared breaking the accounting identity, and
the receiving component family removed for the id this feature moved rather than
deleted. All three fired in the baseline run.

No file was mutated. Both probes cloned the pack in memory with
`JSON.parse(JSON.stringify(...))`; `git status --short` at the end of this pass
confirms it.

### TP-01-10

Scenario SCN-022-002 — an unresolved filing status carries an `AbsentFigure/v1`
with a `missingSource` pointer, carries no smuggled numeric member, and ships no
partial table.
Command: `node scripts/selftest.mjs`

#### Verification pass 2026-08-18 — DoD item 4 (absence discipline)

Every `AbsentFigure/v1` in every shipped rule pack was walked in this session and
checked for a `missingSource` pointer and for the five value-bearing member names:

```
$ node -e 'const fs=require("fs"); ... walk every tax-rules pack for contractVersion AbsentFigure/v1, report missingSource and any of value|amount|rate|bands|default'
AbsentFigure/v1 instances found: 13
   tax-rules/federal/2026.json.deductionCaps.state-and-local-tax.reductionRate | missingSource: [object Object] | smuggled numeric members: []
   tax-rules/federal/2026.json.mortgageDebtLimits.tiers.0.limits | missingSource: [object Object] | smuggled numeric members: []
   tax-rules/federal/2026.json.mortgageDebtLimits.tiers.1.limits | missingSource: [object Object] | smuggled numeric members: []
   tax-rules/federal/2026.json.lossLimitPolicy.specialAllowance.maximumAmounts | missingSource: [object Object] | smuggled numeric members: []
   tax-rules/federal/2026.json.lossLimitPolicy.specialAllowance.phaseOutRange | missingSource: [object Object] | smuggled numeric members: []
   tax-rules/federal/2026.json.lossLimitPolicy.specialAllowance.reductionRate | missingSource: [object Object] | smuggled numeric members: []
   tax-rules/federal/2026.json.dispositionPolicy.residenceExclusion.maximumAmounts.amounts.head-of-household | missingSource: A primary Internal Revenue Service source enumerating the se | smuggled numeric members: []
   tax-rules/medicare/2026.json.medicarePolicy.standardPremiums.part-d | missingSource: [object Object] | smuggled numeric members: []
   tax-rules/mortality/2026.json.mortalityPolicy.columnLabels | missingSource: [object Object] | smuggled numeric members: []
   tax-rules/property/CA/2026.json.exemptions.0 | missingSource: [object Object] | smuggled numeric members: []
   tax-rules/property/CA/2026.json.assessmentCap.capIndexRate | missingSource: [object Object] | smuggled numeric members: []
   tax-rules/property/FL/2026.json.exemptions.1 | missingSource: [object Object] | smuggled numeric members: []
   tax-rules/property/FL/2026.json.assessmentCap.capIndexRate | missingSource: [object Object] | smuggled numeric members: []
NONCONFORMING: 0
--- partial-table check on preferentialRateTables ---
   single                     PRESENT every band fully valued = true
   married-filing-jointly     PRESENT every band fully valued = true
   married-filing-separately  PRESENT every band fully valued = true
   head-of-household          PRESENT every band fully valued = true
shipped pack validates ok = true
PROBE_EXIT=0
```

Thirteen absent figures, thirteen `missingSource` pointers, zero smuggled numeric
members. `[object Object]` is the probe's own `String()` of a structured pointer, not
an empty one — the twelve that print it carry an object-shaped `missingSource`, and
the thirteenth prints its prose form. The presence test the probe applies is truthiness
of the member, which all thirteen pass.

**No partial table ships.** All four preferential statuses resolved, so this scope
ships no absent preferential table. The stronger reading — that a shipped table is
never half-valued — is checked directly above: every band of every one of the four
carries a finite `rate`, every non-first band a finite `lowerInclusive`, and the top
band a `null` `upperExclusive`.

The DoD command's own assertions for this property pass in the same run:

```
$ node scripts/selftest.mjs 2>&1 | grep -E 'AbsentFigure|missingSource'
  ✓ TP-01-02: a value-bearing AbsentFigure, a summary-cited figure, an unknown sourceRef, a band gap and a reordered calculationOrder are each refused
  ✓ TP-02-10: the guard can fail — a plausible total is available to be fabricated from the surviving ordinary leg, and the absent-table fixture is proven to carry no value member in its place
  ✓ TP-01-10: every valued member of both shipped relief regimes cites exactly one retrieved record with a locator, and every unretrieved member is an AbsentFigure with a missingSource pointer and no numeric member beside it
  ✓ TP-04-11: every California figure that was not retrieved ships as an AbsentFigure with a missingSource pointer, a named remediation and no smuggled numeric member
  ✓ TP-02-10: each of the 17 value-bearing members of the inclusion policy resolves to exactly one retrieved source carrying a locator and a retrievedAt, and an unretrieved member ships as a value-free AbsentFigure with a missingS…
```

The `TP-01-02` line is the adversarial direction: a **value-bearing** `AbsentFigure`
is refused, so the zero-smuggled-member result above is a guard that can fail rather
than a vacuous scan. **Claim Source:** executed.

### TP-01-11

Scenario SCN-022-002 — repeated computation over identical input produces a
byte-identical result with global `fetch` stubbed to throw for the whole group.
Command: `node scripts/selftest.mjs`

### TP-01-12

Scenario SCN-022-002 — `rltaxrules.js` and `rltax.js` hold no tax-domain numeric
constant, bracket table, jurisdiction name or authority name, and both detectors
are proven to fire on a module that does.
Command: `node scripts/selftest.mjs`

#### Verification pass 2026-08-18 — DoD item 8 (no-shadow)

**Claim Source:** executed. **Outcome: the item does not hold and stays `[ ]`.**

The item has two halves. The **fact** half holds. The **gate** half does not, for
one of the two named modules.

Half 1 — the fact, checked by running TP-02-07's own detector pipeline verbatim
against both modules rather than only the one it scans:

```
$ node -e "…apply TP-02-07's exact strip pipeline (block comments, double-quoted, single-quoted, line comments) to both modules…"
rltax.js literals beyond 0/1 = 0 
rltaxrules.js literals beyond 0/1 = 37 [40,3,2,9,9,4,2,2,4,2,2,2,2,2,3,9,64,2,2,4,9,3,2,2,2,2,3,2,2,2,2,2,2,9,9,0.005,0.005]
exit=0
```

The 37 literals in `rltaxrules.js` were classified rather than assumed. They are
regex quantifiers and two reconciliation tolerances — not tax-domain figures:

```
$ grep -n "0\.005" rltaxrules.js
2528:      && Math.abs(total - Math.max(disposition.realizedGain, 0)) > 0.005) {
3291:    } else if (Math.abs(record.total - summed) > 0.005) {
$ grep -nE '\{[0-9]+(,[0-9]+)?\}' rltaxrules.js
172:  var FOREIGN_FINDING_PATTERN = /SUP-\d{3}-\d{2}|\bFeature\s+\d|specs\/|scope\.md|report\.md/;
281:  var DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
282:  var TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
283:  var SHA_PATTERN = /^sha256:[a-f0-9]{64}$/;
319:  var JURISDICTION_PATTERN = /^(?:federal|state:[A-Z]{2})$/;
344:  var PROPERTY_REGIME_PATH_PATTERN = /^tax-rules\/property\/(?:[A-Z]{2}\/\d{4}|fixtures\/[a-z0-9-]+)\.json$/;
```

Neither module declares a band table, and neither carries a jurisdiction name or
an authority name — `JURISDICTION_PATTERN` above matches a *shape*
(`state:[A-Z]{2}`) and names no state.

Half 2 — the gate. The delivered no-shadow assertion is `TP-02-07` at
`scripts/selftest.mjs:12988`, and it reads **`rltax.js` only**:

```
    const engineSource = read('rltax.js')
    …
    assert(engineLiterals.length === 0 && !engineDeclaresTable && engineReadsPack,
      'TP-02-07: rltax.js carries no numeric literal beyond 0 and 1, declares no band table of its own, and reads every rate and edge from the resolved pack …');
```

Its adversarial companion at `scripts/selftest.mjs:13005` does prove **both**
detectors live — the no-constant detector flags a planted `640600` and the
band-table detector separates a declared table from a pack value echoed into
display detail. So the "both detectors are proven to fire" clause is satisfied.

But `rltaxrules.js` is never passed through either detector. Every reference to it
in the gate is a different kind of check:

```
$ grep -n "read('rltaxrules.js')\|read(\"rltaxrules.js\")" scripts/selftest.mjs
12110:  const rulesSource = read('rltaxrules.js');
12162:    && /RLTAX_CODES\s*=\s*Object\.freeze/.test(read('rltaxrules.js')),
17692:    && !/RLTAX-(?:DISPOSITION|RECAPTURE|EXCLUSION|GAIN)-/.test(read('rltaxrules.js'))
20781:  const RULES_TEXT28 = read('rltaxrules.js');
```

Those are the closed-vocabulary check, the code-map freeze check and two
error-code-namespace checks. None of them is a tax-domain-constant or band-table
scan. A bracket edge planted in `rltaxrules.js` would pass the whole gate today.

**Conclusion.** The TP-01-12 row names *both* modules; the gate covers one. Ticking
this item would claim `node scripts/selftest.mjs` proves something it does not
prove for `rltaxrules.js`, so the item is left unchecked. Recorded as finding
**F-01-D**: extend the TP-02-07 no-shadow scan to `rltaxrules.js` with the
tolerance and regex-quantifier literals declared as the permitted non-domain set,
and add a named jurisdiction/authority detector with its own adversarial. That is
an append to `scripts/selftest.mjs` — construction, not verification — so it is not
performed in this pass.

No file was mutated during this verification; every step was read-only.

#### Verification pass 2 — 2026-08-18 — DoD item 8 now HOLDS

**Claim Source:** executed. **Outcome: the item holds and is ticked `[x]`.**

Finding **F-01-D** had two halves. The first has since been delivered: the group
`Feature 022 Scope 01 — no bracket edge is shadowed in any rltax module` is now
present in `scripts/selftest.mjs`, introduced — per `git log -S` — in commit
`3855ee75d`, the concurrent Feature 026 commit that swept the shared file. The
second turns out to have been delivered already, by an assertion the earlier pass
did not reach because it searched only for a *numeric* no-shadow scan. Both are
re-verified here against the current tree.

Half 1 — the gate now reaches `rltaxrules.js` and every other `rltax*` module.
From this session's baseline run:

```
Feature 022 Scope 01 — no bracket edge is shadowed in any rltax module
  ✓ TP-02-11: the widened scan reaches every rltax module on disk and its edge set is derived from the pack, carrying every preferential breakpoint the pack states for every filing status (14 module(s), 24 edge(s))
  ✓ TP-02-11: no rltax module holds a pack bracket edge as a numeric literal or declares a band table of its own, so every rate and every edge is read from the resolved pack in all 14 module(s) (no finding)
  ✓ TP-02-11 ADVERSARIAL: the guard can fail — a top bracket edge and a declared band table planted in rltaxrules.js are invisible to a scan that reads rltax.js alone and are named by both detectors once the scan reaches every module (narrow: silent; widened: rltaxrules.js:declares-band-table, rltaxrules.js:640600)
```

The `ADVERSARIAL` line is the exact probe F-01-D was raised for: a `640600` bracket
edge and a declared band table planted in `rltaxrules.js`. It records both results
in one assertion — `narrow: silent` reproduces the gap, `widened:
rltaxrules.js:declares-band-table, rltaxrules.js:640600` names it. **Both**
detectors — the no-constant detector and the band-table detector — are therefore
proven to fire on a module that does hold them, which is the clause the DoD item
states. The module set is read from disk (`readdirSync` filtered by
`/^rltax[a-z]*\.js$/`) rather than listed, so a module a later scope adds is
scanned the day it lands.

Half 2 — jurisdiction and authority names. This detector already existed and
already covered both modules the TP-01-12 row names. From the same run:

```
  ✓ TP-03-16: no engine module holds a state name, a postal code or an authority name, and the detector is proven to fire on a string that does ()
```

Its module set and its firing proof, read from the current tree
(`scripts/selftest.mjs:14566-14577`):

```
  const taxModules = ['rltaxrules.js', 'rltax.js', 'rltaxstate.js', 'rltaxcombined.js', 'rltaxworkspace.js'];
  const stateNameTokens = ['Florida', 'California', 'FLORIDA', 'CALIFORNIA', 'Franchise Tax Board',
    'floridarevenue', 'leginfo', 'flsenate', 'state:CA', 'state:FL', 'Revenue and Taxation Code'];
  …
  const shadowDetectorFires = stateNameTokens.some((token) => ('a module mentioning California').indexOf(token) >= 0);
  assert(shadowLeaks.length === 0 && shadowDetectorFires, …);
```

`rltaxrules.js` and `rltax.js` are both in that set; the token list carries state
names, postal codes and authority names (`Franchise Tax Board`, `Revenue and
Taxation Code`, three publisher domains); and `shadowDetectorFires` proves the
scan is not vacuous by matching a string that does contain one. The empty parens
in the passing line are the empty leak list.

Half 3 — the *fact*, re-derived in this session rather than carried over from the
earlier pass, using TP-02-07's own strip pipeline plus the pack-derived edge set:

```
$ node -e "…strip block comments, double-quoted, single-quoted and line comments; list literals beyond 0/1; derive the pack bracket-edge set; intersect…"
rltax.js literals beyond 0/1 = 0 []
rltaxrules.js literals beyond 0/1 = 37 [40,3,2,9,9,4,2,2,4,2,2,2,2,2,3,9,64,2,2,4,9,3,2,2,2,2,3,2,2,2,2,2,2,9,9,0.005,0.005]
pack bracket edges = 24
rltax.js pack-edge literals = none
rltaxrules.js pack-edge literals = none
exit=0
```

`rltax.js` holds nothing beyond 0 and 1. The 37 literals in `rltaxrules.js` are the
same regex quantifiers and two reconciliation tolerances classified in the earlier
pass — `40`, `64`, `9`, `4`, `3`, `2` are `{n}` quantifier counts in the date, SHA,
timestamp, jurisdiction and path patterns, and `0.005` is the reconciliation
tolerance at lines 2528 and 3291. Not one of the 37 is a tax-domain figure, and the
intersection with the 24 pack bracket edges is empty for both modules — which is
the mechanical form of the same statement, and the form the gate now enforces.

**Why the pack-derived edge set is the right standard for this module.** F-01-D
proposed extending TP-02-07's "any literal beyond 0 and 1" rule to `rltaxrules.js`
with a declared permitted non-domain set. The delivered detector is stricter in
reach and better targeted: a *tax-domain* constant is by definition a figure the
pack states, so intersecting against the pack's own edge set flags exactly the
shadowing the item forbids, moves automatically when the pack moves, and does not
require a hand-maintained allowlist of regex quantifiers that would itself rot. A
literal that is not a pack figure — a quantifier, a string length, a tolerance —
is not a tax-domain constant, so excluding it is correct rather than lenient.

**Conclusion.** Finding **F-01-D** is closed. No module holds a pack bracket edge
or a declared band table (14 modules, gated), no engine module holds a state name,
postal code or authority name (5 modules including both the row names, gated), and
both numeric and band-table detectors are proven to fire on a module that does.
The item is ticked.

No file was mutated during this verification; every step was read-only.

### Scenario SCN-022-001

`Regression: SCN-022-001 a preferential table displays a distinct source per component`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-001 a preferential table displays a distinct source per component" --reporter=list`

### Scenario SCN-022-002

`Regression: SCN-022-002 a household with preferential income receives a valued federal total`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-002 a household with preferential income receives a valued federal total" --reporter=list`

### Scenario SCN-022-003

`Regression: SCN-022-003 unsupported preferential categories are named and never folded in`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-003 unsupported preferential categories are named and never folded in" --reporter=list`

### TP-01-16

Feature 021's cumulative browser suite executed unchanged over the real route,
proving no regression.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-" --reporter=list`

### TP-01-17

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-01-18

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

### TP-01-19

The Pages plan succeeds and `site-exclusions.json` is unchanged.
Command: `node scripts/build-pages-site.mjs --dry-run`

#### Verification pass 2 — 2026-08-18 — DoD item 16 does NOT hold

**Claim Source:** executed. **Outcome: the item is left `[ ]`. Two of its three
commands pass; the first does not, for a reason outside this scope.**

TP-01-18 — the path guard. Exit 0 and `new=0`:

```
$ node scripts/validate-spec-test-paths.mjs; echo "exit=$?"
[spec-test-paths] scanned=670 references=14567 distinctPaths=241 missingPaths=66 baseline=71 new=0 stale=5
  STALE-BASELINE: 5 baseline entries are no longer missing — remove from scripts/validate-spec-test-paths.baseline:
      tests/recommendation-track-record.canary.mjs
      tests/recommendation-track-record.e2e.mjs
      tests/recommendation-track-record.functional.mjs
      tests/recommendation-track-record.support.mjs
      tests/recommendation-track-record.unit.mjs
[spec-test-paths] OK — no new missing test path(s) (5 stale baseline entries to remove)
exit=0
```

`scripts/validate-spec-test-paths.baseline` was not modified by this pass; the
five stale entries are reported, not removed. The row's "zero new missing
spec-referenced test paths" clause holds.

TP-01-19 — the deploy gate. Exit 0:

```
$ node scripts/build-pages-site.mjs --dry-run; echo "exit=$?"
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":120,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/70816f484626a4b2b76a8cc6565456152ba6b19189568261ef210ab7e72a9745","omittedOrphanIndexes":141}
exit=0
```

The plan succeeds with `excludedPaths 12`. The row's second clause —
`site-exclusions.json` unchanged — is the one contradicted under
`## Change Boundary` (finding **F-01-H**): the file gained the lifetime-tax route,
its six modules and its config in commit `e903749c0`, which is why `excludedPaths`
reads 12 rather than the pre-registration count.

TP-01-17 — the whole-repository suite. **Not green.**

```
$ node scripts/selftest.mjs > "$TMPDIR/st_base.log" 2>&1; echo "exit=$?"
exit=1
Research-Lab self-test: 2993 passed, 1 failed
```

The single failure is the spec-test-path assertion, and its cause is named in the
same output:

```
2133:    NEW-MISSING tests/market-brief-cockpit.spec.mjs (38 reference site(s))
  ✗ FAIL: no tests/*.mjs path named by a spec artifact is missing outside the frozen baseline — a stale path makes a multi-file verification command silently cover less than it claims (1 new, 66 known-missing, 5 stale of 240 referenced)
```

`tests/market-brief-cockpit.spec.mjs` belongs to the concurrent market-brief work,
not to Feature 022. This scope neither introduced it nor references it, and it is
deliberately left untouched. Pass count is recorded at 2993 and did not fall at any
point in this session.

**Why the item is still not ticked.** The item's own wording is `node
scripts/selftest.mjs` **is green**. It is not green, and reporting a red suite as
satisfying a green clause would be exactly the fabrication the anti-fabrication
policy forbids — even though the failure is provably foreign to this scope. The
item also carries the same unverifiable sub-clause as DoD item 15 ("no assertion
edited outside this scope's twelve ledger entries"), recorded there as finding
**F-01-I**.

**Finding F-01-J.** DoD item 16 cannot be closed while a foreign assertion is red.
It closes as soon as the concurrent session's stale
`tests/market-brief-cockpit.spec.mjs` reference is resolved — either the spec file
lands or the reference is corrected — provided finding F-01-I is also settled.
Neither is this scope's to perform.

No file was mutated during this verification; every step was read-only.

### TP-01-20

The supersession marker check: every distinct `SUP-022-NN` marker is a ledger id,
the delivered set equals this scope's seven owned entries, each marked region
names its shape, and no assertion changed without a marker.
Command: `node scripts/selftest.mjs`

#### Verification pass 2 — 2026-08-18 — DoD item 15 does NOT hold

**Claim Source:** executed. **Outcome: the item is left `[ ]`.**

The item has two clauses. The second holds. The first is not provable by the
command the item names, and the row above is itself internally inconsistent about
how many entries this scope owns.

Clause 2 — no sourcing rule, tolerance, determinism, privacy, zero-network or
Feature 008 canary was touched. This holds, and is proven two ways. Feature 008's
three files and its spec directory are byte-identical across the whole Feature 022
arc (per-path evidence under `## Change Boundary` above: `in_b9d92a3f1=0 after=`
for `rlportfolio.js`, `rlportfolioanalytics.js`,
`portfolio-survival-allocation.config.json` and
`specs/008-portfolio-survival-and-brief-lab`). Its production-consumer canary and
the determinism, privacy and byte-identity families all pass in this session's
baseline run, for example:

```
  ✓ the registered Portfolio page is the production consumer for rlportfolio.js
  ✓ both FX DAGs stay inside the public-safe privacy boundary
  ✓ Official curves TP-02-04: the carried family reproduces the prior rows and observedAt byte-identically
  ✓ Trend Dynamics consensus is deeply frozen and produces 100 byte-identical results while excluding diagnostic timings
```

and the registration surfaces are proven clean of this feature:

```
  ✓ TP-05-21 and TP-05-25: the combined route and its two new modules appear in no registration surface, and this feature adds no new root HTML ()
```

Clause 1 — *no assertion outside the twelve owned ledger entries was edited,
relaxed or deleted*. The delivered marker check does exist and passes:

```
  ✓ TP-05-22: every SUP-022 marker delivered in the source maps to a ledger row, every ledger row except the two pre-existing unmarked Scope 02 rows named here is delivered, the ids stay inside the declared range, and the ledger total agrees with the paragraph that states it
```

Read at source (`scripts/selftest.mjs:15267-15295`), that assertion compares the
set of `SUP-022-NN` strings appearing in five files against the set of ledger rows
in `spec.md`, in both directions, with `SUP-022-18` and `SUP-022-19` named
individually as the two known pre-existing unmarked Scope 02 rows. Marker↔ledger
closure is therefore genuinely proven, and the marker inventory agrees:

```
$ grep -rhoE 'SUP-022-[0-9]{2}' scripts/selftest.mjs tests/ | sort -u
SUP-022-01 … SUP-022-17 SUP-022-20 SUP-022-21 SUP-022-22   (20 delivered)
$ grep -oE 'SUP-022-[0-9]{2}' specs/…/spec.md | sort -u
SUP-022-01 … SUP-022-22                                     (22 ledger rows)
```

But marker↔ledger closure is **not** the clause. The clause is that no *unmarked*
assertion changed, and a set comparison over marker strings cannot see an unmarked
edit — an assertion silently relaxed with no marker added leaves both sets exactly
as they are. Proving the clause needs a diff against the pre-scope assertion text,
and no such baseline exists: Features 021 and 022 landed in the single squashed
commit `b9d92a3f1` (evidence under `## Change Boundary`), so there is no Feature
021 original in history to diff against. The command the item names cannot return
the answer the item claims.

**A second, independent problem: the row contradicts itself on the count.** The
scope's ledger table lists twelve entries owned by this scope (SUP-022-01, -02,
-04, -05, -06, -07, -09, -11, -12, -13, -17, -21) and the DoD item says "twelve".
The TP-01-20 row above says "this scope's **seven** owned entries", and the
Test Plan's own TP-01-20 row says "**eleven**". Three different counts for one set.
Whichever is correct, an assertion cannot be written against a target that the
plan states three ways.

**Finding F-01-I.** DoD item 15 cannot be closed as written. Closing it requires a
planning decision owned by `bubbles.plan`: reconcile the twelve/eleven/seven count
across the DoD item, the Test Plan row and the ledger table, and either narrow the
clause to what the marker check actually proves (marker↔ledger closure) or record
that the unmarked-edit clause is unverifiable against a squashed delivery history.
Neither is implementation work, so neither is performed here.

No file was mutated during this verification; every step was read-only.

### TP-01-21

Each retained branch proven non-vacuous against the absent-table fixture, and the
fabricated-figure cases demonstrated to fail.
Command: `node scripts/selftest.mjs`

#### Verification pass 2 — 2026-08-18 — DoD item 14 HOLDS

**Claim Source:** executed. **Outcome: the item holds and is ticked `[x]`.**

The item names six retained branches — SUP-022-02, -05, -06, -11, -12 and -13 —
and requires each to be exercised against an absent-table fixture **at least once,
independently of how many shipped statuses resolved**. That last clause is the
whole point: the shipped pack now carries a real table for all four statuses, so a
retained refusal branch that ran only against "whatever the pack happens to lack"
would today run against nothing.

Step 1 — the shipped pack carries every status, so no retained branch can be
exercised incidentally. From this session's baseline run:

```
  ✓ TP-01-16: every filing status beyond single is either a carried preferential rate table or a declared absent figure with no third state, and all three are statuses the engine supports (carried: married-filing-jointly,married-filing-separately,head-of-household; absent: none)
```

`absent: none`, and `single` is carried too. Every retained branch below is
therefore exercised **only** because it builds its own fixture.

Step 2 — the four `scripts/selftest.mjs` branches each construct a private
absent-table pack over `SUPPORTED_FILING_STATUSES`, i.e. over every status rather
than over the ones that happen to be missing:

```
$ node -e "…for each marker, find the nearest following preferentialRateTables[status] assignment…"
SUP-022-02 marker@12476  absentFixtureAssign@12495
   RLTAXRULES.SUPPORTED_FILING_STATUSES.forEach((status) => {
   absentTableFixturePack.preferentialRateTables[status] = {
   contractVersion: 'AbsentFigure/v1',
SUP-022-05 marker@13051  absentFixtureAssign@13059
   RLTAXRULES.SUPPORTED_FILING_STATUSES.forEach((status) => {
   settleAbsentFixturePack.preferentialRateTables[status] = {
   contractVersion: 'AbsentFigure/v1',
SUP-022-06 marker@13805  absentFixtureAssign@13815
   RLTAXRULES.SUPPORTED_FILING_STATUSES.forEach((status) => {
   curveAbsentFixturePack.preferentialRateTables[status] = {
   contractVersion: 'AbsentFigure/v1',
SUP-022-11 marker@14148  absentFixtureAssign@14179
   RLTAXRULES.SUPPORTED_FILING_STATUSES.forEach((status) => {
   strategyAbsentTablePack.preferentialRateTables[status] = {
   contractVersion: 'AbsentFigure/v1',
exit=0
```

Each fixture is consumed by an assertion rather than merely built —
`fixtureAbsent` at `:12658`, `settleAbsentFixturePack` at `:13073`,
`curveAbsentFixturePack` at `:13829-13830`, `strategyAbsentTablePack` at `:14187`
— and all four of those assertions pass in the same run, each naming the retained
clause in its own message:

```
$ grep -n 'exercised against the absent-table fixture\|the whole original missing-leg refusal\|is retained verbatim against the absent-table fixture\|TP-04-10: a household carrying a long-term gain' "$TMPDIR/st_base.log"
2886:  ✓ TP-01-01: … and the value-free AbsentFigure clause is retained verbatim for every absent status and exercised against the absent-table fixture
2902:  ✓ TP-02-10: for a status whose preferential table resolved the total is a valued, reconciling record whose legs sum to it within the pack tolerance, and the whole original missing-leg refusal — including L4 not-evaluable and the surviving ordinary leg — is retained verbatim against the absent-table fixture
2929:  ✓ TP-03-01: the shipped pack computes a long-term gain curve whose every carried preferential breakpoint is an exact crossing pair rather than a grid position and whose tax at every sampled level equals an independent settlement of the same amount declared as a qualified dividend, while the whole original refusal — including both hasOwnProperty clauses proving a refusal smuggles no shape — is retained verbatim against the absent-table fixture
2944:  ✓ TP-04-10: a household carrying a long-term gain receives a valued federal tax difference equal to an independent recomputation and distinct from the marginal-rate product, while a comparison against an absent preferential table still refuses rather than quietly dropping the preferential leg, and all 10 strategy functions are extractable UMD top-level declarations using Number.isFinite
```

Step 3 — the two browser branches do the same thing at the route level. Each
substitutes a whole static site whose served pack has every preferential table
replaced by an `AbsentFigure/v1`, with the pack digest moved and the config pin
moved with it so the route's own pack-pointer check is exercised rather than
bypassed:

```
$ grep -n 'absentPreferentialTablePack\|absentPreferentialTableOverrides\|ABSENT_TABLE_DIGEST' tests/lifetime-tax-foundation.spec.mjs tests/lifetime-tax-marginal.spec.mjs
tests/lifetime-tax-foundation.spec.mjs:100:const ABSENT_TABLE_DIGEST = 'sha256:' + '0'.repeat(63) + '1';
tests/lifetime-tax-foundation.spec.mjs:101:const absentPreferentialTablePack = () => {
tests/lifetime-tax-foundation.spec.mjs:118:  pack.contentSha256 = ABSENT_TABLE_DIGEST;
tests/lifetime-tax-foundation.spec.mjs:121:const absentPreferentialTableOverrides = () => ({
tests/lifetime-tax-foundation.spec.mjs:122:  [PACK_PATH]: absentPreferentialTablePack(),
tests/lifetime-tax-foundation.spec.mjs:123:  [CONFIG_PATH]: configWithRules({ packContentSha256: ABSENT_TABLE_DIGEST })
tests/lifetime-tax-foundation.spec.mjs:233:  const absentTableSite = await startStaticServer({ overrides: absentPreferentialTableOverrides() });
tests/lifetime-tax-marginal.spec.mjs:28:const ABSENT_TABLE_DIGEST = 'sha256:' + '0'.repeat(63) + '2';
tests/lifetime-tax-marginal.spec.mjs:29:const absentPreferentialTableOverrides = () => {
tests/lifetime-tax-marginal.spec.mjs:46:  pack.contentSha256 = ABSENT_TABLE_DIGEST;
tests/lifetime-tax-marginal.spec.mjs:48:  config.rules.packContentSha256 = ABSENT_TABLE_DIGEST;
tests/lifetime-tax-marginal.spec.mjs:294:  const absentTableSite = await startStaticServer({ overrides: absentPreferentialTableOverrides() });
```

Both substitutions iterate `Object.keys(pack.preferentialRateTables)` — again every
status, not the missing ones — and both live inside tests that passed:

```
$ npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line --workers=2; echo "exit=$?"
Running 66 tests using 2 workers
…
[26/66] [system-chrome] › tests/lifetime-tax-foundation.spec.mjs:179:1 › Regression: SCN-021-002 unsupported year jurisdiction and income kind each refuse without substitution
[35/66] [system-chrome] › tests/lifetime-tax-marginal.spec.mjs:136:1 › Regression: SCN-021-009 unsupported thresholds are named unavailable contributors and the curve is labeled incomplete
  66 passed (33.5s)
exit=0
```

The SUP-022-12 marker sits at `tests/lifetime-tax-foundation.spec.mjs:182`, inside
the test declared at `:179`; the SUP-022-13 marker sits at
`tests/lifetime-tax-marginal.spec.mjs:219`, inside the test declared at `:136`.
Both are in the passing set above.

**Conclusion.** All six retained branches are exercised against an absent-table
fixture that each branch constructs for itself over every filing status. Because
the shipped pack carries all four tables (`absent: none`), none of the six could be
running incidentally — each runs only because its fixture forces it. The item is
ticked.

No file was mutated during this verification; every step was read-only.

#### Verification pass 2026-08-18 — DoD item 10 (RED and GREEN for every Test Plan row)

**Claim Source:** executed. **Outcome: the item does not hold and stays `[ ]`.**

The item requires intended-RED and same-command GREEN evidence for **every** Test
Plan row, *including the browser rows*. Three browser rows have no test to run at
all, and eight further rows carry a heading and a command but no captured run.

Step 1 — this scope's own Playwright spec does not exist:

```
$ ls tests/lifetime-tax-*.spec.mjs
tests/lifetime-tax-benefit.spec.mjs
tests/lifetime-tax-claim-age.spec.mjs
tests/lifetime-tax-conversion.spec.mjs
tests/lifetime-tax-deduction.spec.mjs
tests/lifetime-tax-disposition.spec.mjs
tests/lifetime-tax-federal.spec.mjs
tests/lifetime-tax-foundation.spec.mjs
tests/lifetime-tax-inclusion.spec.mjs
tests/lifetime-tax-marginal.spec.mjs
tests/lifetime-tax-medicare.spec.mjs
tests/lifetime-tax-property.spec.mjs
tests/lifetime-tax-rental.spec.mjs
tests/lifetime-tax-retirement-route.spec.mjs
tests/lifetime-tax-route.spec.mjs
tests/lifetime-tax-use.spec.mjs
```

`lifetime-tax-preferential.spec.mjs` — the file named by TP-01-13, TP-01-14 and
TP-01-15 — is absent. It is also absent from `design.md:109`'s expectation that the
ratchet baseline not grow, and it is **not** in
`scripts/validate-spec-test-paths.baseline`, so its absence was never ratcheted in.
The path guard does not surface it because the Test Plan names it as a bare
filename rather than as a `tests/…` path, so the guard's reference scan never sees
it. It is deliberately named in that same bare form here, because writing it as a
`tests/…` path would itself register a new missing reference and turn this report
into the defect it is describing.

Step 2 — the exact TP-01-13 command resolves to nothing:

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-001 a preferential table displays a distinct source per component" --list
Error: No tests found
Listing tests:
Total: 0 tests in 0 files
exit=1
```

None of the three persistent titles exists anywhere in the suite, so TP-01-14 and
TP-01-15 fail identically:

```
$ grep -rn "Regression: SCN-022-00" tests/
grep_exit=1 (1 = no match anywhere)
```

This is not a configuration fault. TP-01-16's Feature 021 grep resolves normally
against the same config and project, which proves the browser harness itself is
live and the three missing titles are a real absence:

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-" --list
  [system-chrome] › tests/lifetime-tax-route.spec.mjs:254:1 › Regression: SCN-021-014 tax and account tables stay readable at the mobile viewport
  [system-chrome] › tests/lifetime-tax-route.spec.mjs:290:1 › Regression: SCN-021-015 a private export happens only on explicit action and the request ledger stays empty
Total: 16 tests in 5 files
exit=0
```

Step 3 — the report's own row inventory. Rows TP-01-01 through TP-01-10 carry
captured RED and GREEN evidence, TP-01-07 including the F-01-C fix and its Probe F2
non-vacuity check. Rows **TP-01-11, TP-01-12, TP-01-13, TP-01-14, TP-01-15,
TP-01-16, TP-01-17, TP-01-18, TP-01-19, TP-01-20 and TP-01-21** carry a heading and
the row's command, and no captured run of either colour. TP-01-12 additionally
fails on coverage grounds, recorded as F-01-D under DoD item 8 above.

**Conclusion.** Eleven of twenty-one rows lack the evidence this item asserts, and
three of them cannot acquire it until `lifetime-tax-preferential.spec.mjs` is
authored under `tests/`. The item is left unchecked. Recorded as finding
**F-01-E**: author this scope's Playwright spec carrying the three persistent
titles, then capture RED and GREEN for TP-01-13 through TP-01-21. Authoring a test
file is construction, not verification, so it is not performed in this pass.

The path-guard run used above also re-confirms that the single gate failure is not
this scope's:

```
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=638 references=14235 distinctPaths=240 missingPaths=72 baseline=71 new=1 stale=0
  NEW-MISSING tests/market-brief-cockpit.spec.mjs (36 reference site(s))
      referenced at specs/022-federal-preferential-and-state-income-tax/scopes/01-federal-preferential-rate-completion/report.md:24
      referenced at specs/022-federal-preferential-and-state-income-tax/scopes/01-federal-preferential-rate-completion/report.md:31
      referenced at specs/026-actionable-brief-brevity-and-cross-asset/design.md:1105
      ... and 33 further reference site(s)
[spec-test-paths] FAIL — 1 new referenced path(s) do not exist
path_guard_exit=1
```

The two reference sites inside this report are the quoted failure output recorded
under the Summary — naming the path in the evidence makes the report itself count
as a reference site. The originating references remain in `specs/025-*` and
`specs/026-*`, which a concurrent session owns. Neither those specs nor
`scripts/validate-spec-test-paths.baseline` were touched.

**One self-inflicted regression occurred during this pass and was corrected.** The
first draft of this section named the missing browser spec as a `tests/…` path,
which registered it as a second new-missing reference and took the guard from
`new=1` to `new=2` — the report describing the defect became an instance of it. The
two mentions were rewritten to the bare-filename form the Test Plan itself uses,
and the guard returned to the pre-existing baseline:

```
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=638 references=14253 distinctPaths=240 missingPaths=72 baseline=71 new=1 stale=0
  NEW-MISSING tests/market-brief-cockpit.spec.mjs (37 reference site(s))
[spec-test-paths] FAIL — 1 new referenced path(s) do not exist
path_guard_exit=1
```

No file was mutated during this verification; every step was read-only.

#### Verification pass 2 — 2026-08-18 — DoD item 10 still does not hold, but F-01-E is closed

**Claim Source:** executed. **Outcome: the item stays `[ ]`; one of its two
blockers is now removed.**

The blocking absence recorded as **F-01-E** above — `lifetime-tax-preferential.spec.mjs`
not existing — is closed. The file was authored in commit `5920d9ede` and now
carries all three persistent titles, and all three pass:

```
$ npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line --workers=2; echo "exit=$?"
Running 66 tests using 2 workers
…
[37/66] [system-chrome] › tests/lifetime-tax-preferential.spec.mjs:73:1 › Regression: SCN-022-001 a preferential table displays a distinct source per component
[40/66] [system-chrome] › tests/lifetime-tax-preferential.spec.mjs:202:1 › Regression: SCN-022-002 a household with preferential income receives a valued federal total
[42/66] [system-chrome] › tests/lifetime-tax-preferential.spec.mjs:349:1 › Regression: SCN-022-003 unsupported preferential categories are named and never folded in
  66 passed (33.5s)
exit=0
```

TP-01-13, TP-01-14 and TP-01-15 therefore now have **GREEN**, and TP-01-16's
Feature 021 suite is green in the same run (every `SCN-021-` title in the 66).
TP-01-18 and TP-01-19 have captured runs under DoD item 16 above; TP-01-21 has
captured GREEN under DoD item 14; TP-01-12 has captured GREEN under DoD item 8.

**What is still missing, and why the item stays unchecked.** The item requires
*intended RED and same-command GREEN* for every row. RED is still uncaptured for
TP-01-11, TP-01-13, TP-01-14, TP-01-15, TP-01-16, TP-01-17, TP-01-18, TP-01-19 and
TP-01-20. For the three browser rows the ordinary form of RED — the assertion
written first and seen to fail against the unchanged implementation — is no longer
reconstructible, because the spec was authored after the behaviour it asserts; the
substitute available is a non-vacuity probe per row, which is construction work
against source files and is not performed in this pass. Capturing partial RED
would not close the item either, since the clause is universal over the rows.

**F-01-E is superseded by F-01-K.** The remaining work is: capture a non-vacuity
probe for each of the nine rows listed above, reverting each probe immediately and
confirming `git status --short` clean between probes. That is construction, not
verification.

No file was mutated during this verification; every step was read-only.

## Supersession Ledger

Filled at execution. One block per owned entry — SUP-022-01, -02, -04, -05, -06,
-07, -09 — each holding the superseded clause verbatim, the replacement, the
shape, the intended-RED output proving the replacement failed against the
unchanged implementation, the green output after the behaviour change, and the
adversarial evidence showing each named mutation was seen to fail.

### Verification pass 2 — 2026-08-18 — DoD item 12 does NOT hold

**Claim Source:** executed. **Outcome: the item is left `[ ]`.**

The item has four conjunctive clauses. Two are proven, two are not.

**Proven — marker presence and shape naming.** All twelve owned entries are
present and each marked region names its shape. Derived by locating each owned
marker in the five marker-bearing files and reading the `shape=` token out of its
comment block:

```
$ node -e "…for each owned SUP-022-NN, find its first occurrence in the five marker files and read shape= from the following 12 lines…"
SUP-022-01 scripts/selftest.mjs:12175  shape=derive
SUP-022-02 scripts/selftest.mjs:12476  shape=partition
SUP-022-04 scripts/selftest.mjs:13238  shape=derive
SUP-022-05 scripts/selftest.mjs:13051  shape=relocate
SUP-022-06 scripts/selftest.mjs:13805  shape=relocate
SUP-022-07 tests/lifetime-tax-federal.spec.mjs:80  shape=partition
SUP-022-09 tests/lifetime-tax-foundation.spec.mjs:155  shape=derive
SUP-022-11 scripts/selftest.mjs:14148  shape=relocate
SUP-022-12 tests/lifetime-tax-foundation.spec.mjs:182  shape=partition
SUP-022-13 tests/lifetime-tax-marginal.spec.mjs:219  shape=relocate
SUP-022-17 tests/lifetime-tax-route.spec.mjs:127  shape=derive
SUP-022-21 tests/lifetime-tax-federal.spec.mjs:132  shape=derive
exit=0
```

Twelve of twelve, no `NONE` and no `NOT-FOUND`. The shapes agree with the scope's
own ledger table row for row. Marker↔ledger closure is additionally asserted
mechanically and passes:

```
  ✓ TP-05-22: every SUP-022 marker delivered in the source maps to a ledger row, every ledger row except the two pre-existing unmarked Scope 02 rows named here is delivered, the ids stay inside the declared range, and the ledger total agrees with the paragraph that states it
```

**Proven — retained branches are non-vacuous.** SUP-022-02, -05, -06, -11, -12 and
-13 each exercise their retained clause against an absent-table fixture they build
themselves over every filing status; full evidence under `### TP-01-21` above (DoD
item 14, ticked).

**Not proven — "each was written before the behaviour change and seen to fail
against the unchanged implementation".** RED evidence exists for SUP-022-02 (Probe
F2, recorded under `### TP-01-07`) and for the rows covered by Probes B and D. It
does not exist for the remaining owned entries, and for those it is no longer
reconstructible: Features 021 and 022 landed in the single squashed commit
`b9d92a3f1`, so there is no unchanged-implementation state to run the replacements
against. This is the same root cause as findings F-01-H and F-01-I.

**Not proven — "each replacement is at least as strong as the clause it
superseded".** That is a comparison against the superseded clause text, which for
the same reason has no recoverable original in history. The report's own header
above promises "the superseded clause verbatim" per entry; those verbatim
originals were never captured, and they cannot now be recovered from the
repository.

**Also inconsistent.** The item says twelve owned entries; the section header above
lists seven; the Test Plan's TP-01-20 row says eleven; the scope's ledger table
lists twelve. Recorded under finding F-01-I.

**Finding F-01-L.** DoD item 12 cannot be closed against the current history.
Closing it requires a planning decision owned by `bubbles.plan`: reconcile the
owned-entry count, and either record that the before/after clauses are
unverifiable against a squashed delivery history or replace them with a clause the
repository can answer — for example a per-entry non-vacuity probe, which is what
the retained-branch evidence under TP-01-21 already supplies for six of them.

No file was mutated during this verification; every step was read-only.

## Change Boundary

Filled at execution. Holds the path-scoped `git status` proving every excluded
path is byte-identical, including `rltax.js`, `rltaxworkspace.js`,
`rltaxstrategy.js`, `site-exclusions.json` and Feature 021's spec directory.

### Verification pass 2 — 2026-08-18 — DoD item 11 does NOT hold

**Claim Source:** executed. **Outcome: the item is left `[ ]`.**

Feature 021 and Feature 022 arrived in the repository in one squashed commit,
`b9d92a3f1` (`Add Lifetime Tax Strategy Lab: federal, state, property, rental and
retirement slices`), which is the only commit that has ever touched
`tax-rules/federal/2026.json`:

```
$ git log --oneline --reverse -- specs/022-federal-preferential-and-state-income-tax
b9d92a3f1 Add Lifetime Tax Strategy Lab: federal, state, property, rental and retirement slices
$ git log --oneline -- tax-rules/federal/2026.json
b9d92a3f1 Add Lifetime Tax Strategy Lab: federal, state, property, rental and retirement slices
```

Per-path status of the whole excluded list — whether `b9d92a3f1` touched it, and
which commits touched it afterwards:

```
$ for p in <the excluded list>; do printf '%-46s in_b9d92a3f1=%s after=%s\n' "$p" "$(git show --name-only --format='' b9d92a3f1 -- "$p" | grep -c .)" "$(git log --oneline b9d92a3f1..HEAD --format='%h' -- "$p" | tr '\n' ',')"; done; echo "exit=$?"
rlportfolio.js                                 in_b9d92a3f1=0 after=
rlportfolioanalytics.js                        in_b9d92a3f1=0 after=
portfolio-survival-allocation.config.json      in_b9d92a3f1=0 after=
specs/008-portfolio-survival-and-brief-lab     in_b9d92a3f1=0 after=
tools.json                                     in_b9d92a3f1=0 after=
index.html                                     in_b9d92a3f1=0 after=
rlnav.js                                       in_b9d92a3f1=0 after=
README.md                                      in_b9d92a3f1=0 after=
notes/README.md                                in_b9d92a3f1=0 after=
watchlist.json                                 in_b9d92a3f1=0 after=
site-exclusions.json                           in_b9d92a3f1=0 after=e903749c0,
scripts/build-pages-site.mjs                   in_b9d92a3f1=0 after=
scripts/validate-spec-test-paths.baseline      in_b9d92a3f1=0 after=2229da3c0,
rltax.js                                       in_b9d92a3f1=1 after=
rltaxworkspace.js                              in_b9d92a3f1=1 after=
rltaxstrategy.js                               in_b9d92a3f1=1 after=
tests/lifetime-tax-conversion.spec.mjs         in_b9d92a3f1=1 after=
tests/lifetime-tax.support.mjs                 in_b9d92a3f1=1 after=
specs/021-lifetime-tax-strategy-lab            in_b9d92a3f1=16 after=
exit=0
```

**What holds.** Seventeen of the nineteen excluded paths are byte-identical across
the entire Feature 022 arc. Feature 008's three files, its spec directory, all five
registries, `watchlist.json` and `scripts/build-pages-site.mjs` were not touched by
the delivery commit and have not been touched since. `rltax.js`,
`rltaxworkspace.js`, `rltaxstrategy.js`, `tests/lifetime-tax-conversion.spec.mjs`,
`tests/lifetime-tax.support.mjs` and Feature 021's sixteen-file spec directory
arrived in `b9d92a3f1` and have not been modified by any later commit, including
the two that carried this scope's own work (`3855ee75d` for the selftest groups and
`5920d9ede` for the browser spec, whose file list is a single new spec file).

**What does not hold — two named deviations.**

1. `site-exclusions.json` is **not** byte-identical. Commit `e903749c0`
   (`Register lifetime-tax and company-intelligence modules as site exclusions;
   add their selftest groups`) adds 44 lines to it, eight of which are the
   lifetime-tax route, its six `rltax*` modules and its config:

   ```
   $ git show --stat e903749c0
    scripts/selftest.mjs | 9089 ++++++++++…
    site-exclusions.json |   44 +
    2 files changed, 9133 insertions(+)
   ```

   `b9d92a3f1` is an ancestor of `e903749c0` (`git merge-base --is-ancestor`
   returns 0), so this is a change inside the Feature 022 arc, not before it. The
   change is defensible on its own terms — it is exactly the deploy decision
   TP-01-19 exists to force, keeping an unregistered route out of the packaged
   site — but the DoD item as written names `site-exclusions.json` in the
   byte-identical list, and it is not byte-identical. Ticking the item would
   assert something the tree contradicts.

2. `scripts/validate-spec-test-paths.baseline` is **not** byte-identical either.
   Commit `2229da3c0` (`Feature 024: scope 02 RED evidence progress; drop 6 stale
   spec-test-path baseline entries`) modifies it. That is a Feature 024 change,
   not a Feature 022 one, but the item's clause is unqualified byte-identity.

**A third clause is unverifiable, not merely unmet.** The item's second half
requires that only the SUP-022-07, -09, -12, -13 and -17 expectations changed in
the four permitted Feature 021 test files. Because Features 021 and 022 landed in
the same squashed commit, no Feature 021 original exists in history to diff
against, so no command can distinguish a Feature 021 original from a Feature 022
replacement in those files. The claim is not provable from the repository as it
stands, and is therefore not asserted.

**Finding F-01-H.** The change-boundary DoD item cannot be closed against the
current history. Closing it requires either (a) an owner decision amending the
excluded list to admit the `site-exclusions.json` deploy registration and the
Feature 024 baseline edit as out-of-scope-but-permitted, or (b) an explicit
recorded acceptance that the squashed-delivery history makes the per-expectation
clause unverifiable. Both are planning decisions owned by `bubbles.plan`, not
implementation work, so neither is performed here.

No file was mutated during this verification; every step was read-only.

## Claim Boundary

#### Verification pass 2026-08-18 — DoD item 9 (claim boundary)

**Claim Source:** executed. **Outcome: the item holds and is ticked.**

Scanned this scope's runtime paths — `rltaxrules.js`, `rltax.js`,
`lifetime-tax-strategy-lab.html` and `tax-rules/federal/2026.json`, the pack whose
label and reason strings are surfaced verbatim as notices — with a detector per
banned claim kind, each proven live on a planted sentence:

```
$ node -e "…scan the four runtime paths for probability / lifetime-figure / track-record / error-rate / complete-federal-tax language…"
LEAK rltax.js completeFederalTaxLabel "res[] is non-empty, so no result may be\n         labelled a complete federal tax. This is a structural member rather than page copy. */\n    "
LEAK lifetime-tax-strategy-lab.html completeFederalTaxLabel "red tax year, from the resolved rule pack only. It is not a complete federal tax: the pack names every feature it does not carry.\"));\n      "
total leaks across this scope's runtime paths = 2
--- the detectors are proven live on a sentence that does state each ---
  fires on planted probability = true
  fires on planted lifetimeFigure = true
  fires on planted trackRecord = true
  fires on planted errorRate = true
  fires on planted completeFederalTaxLabel = true
  fires on the clean pack label = false
exit=0
```

The probability, lifetime-figure, track-record and error-rate detectors each
returned **zero** hits across all four paths while each fired on the planted
sentence, so their silence is a real absence rather than a dead scan.

The two hits are both on the complete-federal-tax detector, and both are the
**opposite** of a violation — one is the code comment stating the rule, one is the
page's own disclaimer. A first-pass substring detector cannot tell an asserted
label from a disclaimed one, so it was refined to separate the two and re-run,
classifying every mention rather than counting them:

```
$ node -e "…classify every complete-federal-tax mention as ASSERTED-LABEL or DISCLAIMER…"
=== every complete-federal-tax mention, classified ===
  rltax.js | other | labelled a complete federal tax
  rltax.js | DISCLAIMER | completeFederalTax: false
  lifetime-tax-strategy-lab.html | DISCLAIMER | It is not a complete federal tax: the pack names every feature it does n
=== asserted-label count across the scope paths ===
 asserted = 0
=== the refined detector is proven live ===
 fires on "completeFederalTax: true"        = true
 fires on "This is a complete federal tax." = true
 silent on "It is not a complete federal tax"= true
exit=0
```

`rltax.js` emits `completeFederalTax: false` structurally, and the page states
plainly that the figure is not a complete federal tax because the pack names every
feature it does not carry. The `other`-classified line is the truncated fragment of
that same negated comment sentence. Zero asserted labels remain.

This is corroborated inside the gate itself: `TP-02-10` at
`scripts/selftest.mjs:13097` asserts `balancedSettled.completeFederalTax === false`
together with `completeClaims.length === 0` over `rltax.js`, `rltaxrules.js` and
`rltaxworkspace.js`, and that assertion passed in the 2906-pass baseline run
recorded under DoD item 7.

No file was mutated during this verification; every step was read-only.

## Completion Statement

Filled at execution.

### Verification pass 2 — 2026-08-18 — closing validation

**Claim Source:** executed. Four commands, verbatim, with exit codes.

1. Whole-repository suite.

```
$ node scripts/selftest.mjs > "$TMPDIR/st_final.log" 2>&1; echo "selftest_exit=$?"
selftest_exit=1
$ grep -E '✗|Research-Lab self-test:' "$TMPDIR/st_final.log"
  ✗ FAIL: no contract identifier, refusal code, spec number or content digest appears in any default-visible reader string, across every token and every authored literal in the three new renderers
  ✗ FAIL: tests/market-brief-cockpit.spec.mjs declares fourteen tests, labels both fixture-sourced decision-surface rows as such, intercepts no request, and binds itself to neither the payload nor the history ledger
Research-Lab self-test: 3008 passed, 2 failed
```

Pass count rose from the session baseline of 2993 to 3008 and never fell. Both
failures name the concurrent market-brief work — the three new renderers and
`tests/market-brief-cockpit.spec.mjs` — and neither is attributable to Feature 022.
The baseline's single failure (the stale `tests/market-brief-cockpit.spec.mjs`
reference) is gone because the concurrent session created that file mid-session,
which is also where the two new failures came from. Every Feature 022 Scope 01
assertion is green in that same run:

```
3330:Feature 022 Scope 01 — preferential breakpoints for the three filing statuses beyond single
3331:  ✓ TP-01-16: every filing status beyond single is either a carried preferential rate table or a declared absent figure with no third state … (carried: married-filing-jointly,married-filing-separately,head-of-household; absent: none)
3333:  ✓ TP-01-16: the preferential tax is exact immediately below, exactly at, and immediately above every breakpoint of every carried filing status beyond single (18 checks over 6 breakpoint(s): no failure)
3339:Feature 022 Scope 01 — no bracket edge is shadowed in any rltax module
3340:  ✓ TP-02-11: the widened scan reaches every rltax module on disk … (14 module(s), 24 edge(s))
3342:  ✓ TP-02-11 ADVERSARIAL: the guard can fail … (narrow: silent; widened: rltaxrules.js:declares-band-table, rltaxrules.js:640600)
2882:  ✓ TP-01-07: per-component-kind year containment separates two outcomes on one source record …
```

2. The lifetime-tax browser suite.

```
$ npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line --workers=2; echo "playwright_exit=$?"
  66 passed (28.8s)
playwright_exit=0
```

Zero failed. No `.skip`, `.only`, `.fixme` or raised timeout was introduced.

3. Artifact lint.

```
$ bash .github/bubbles/scripts/artifact-lint.sh specs/022-federal-preferential-and-state-income-tax; echo "artifact_lint_exit=$?"
…
=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes/01-federal-preferential-rate-completion/scope.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes/01-federal-preferential-rate-completion/scope.md
✅ No unfilled evidence template placeholders in scopes/01-federal-preferential-rate-completion/report.md
=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
artifact_lint_exit=0
```

4. Working-tree hygiene — no probe left behind.

```
$ git status --short; echo "git_status_exit=$?"
 M market-brief.html
 M rlbrief.js
 M rlcockpit.js
 M scripts/selftest.mjs
 M specs/022-federal-preferential-and-state-income-tax/scopes/01-federal-preferential-rate-completion/report.md
 M specs/022-federal-preferential-and-state-income-tax/scopes/01-federal-preferential-rate-completion/scope.md
 M specs/024-social-security-and-medicare/scopes/03-claim-age-comparison/report.md
?? company-intelligence-lab.html
?? company-intelligence.config.json
?? data/company-intelligence/
?? notes/company-intelligence-lab.md
?? rlcompanyintel.js
?? specs/025-company-multi-horizon-intelligence-lab/
?? tests/company-intelligence-lab.spec.mjs
?? tests/company-intelligence.unit.mjs
?? tests/market-brief-cockpit.spec.mjs
git_status_exit=0
$ git diff --stat -- specs/022-federal-preferential-and-state-income-tax
 .../report.md    | 2058 ++++++++++++++++-
 .../scope.md     |   63 +-
 2 files changed, 2096 insertions(+), 25 deletions(-)
```

The only paths this pass wrote are the two Feature 022 Scope 01 artifacts. Every
other entry — `market-brief.html`, `rlbrief.js`, `rlcockpit.js`,
`scripts/selftest.mjs`, the Feature 024 report and all ten untracked entries —
belongs to the concurrent session and was never opened for writing here. No tax
rule pack, no `rltax*` module and no test file carries a mutation: `tax-rules/`,
`rltax*.js` and `tests/` do not appear in the modified list at all. Every
verification step in this pass was read-only, so no probe needed reverting.

### DoD status after this pass

| # | Item | Before | After |
| --- | --- | --- | --- |
| 6 | Known-value boundary coverage for every filing status | `[ ]` | **`[x]`** |
| 8 | No module holds a tax-domain constant, table, jurisdiction or authority name | `[ ]` | **`[x]`** |
| 13 | Per-component-kind year containment, both outcomes on one record | `[ ]` | **`[x]`** |
| 14 | Every retained branch non-vacuous against the absent-table fixture | `[ ]` | **`[x]`** |
| 10 | RED and GREEN for every Test Plan row | `[ ]` | `[ ]` — F-01-K (F-01-E closed; RED outstanding on 9 rows) |
| 11 | Excluded paths byte-identical | `[ ]` | `[ ]` — F-01-H |
| 12 | All twelve owned supersessions delivered | `[ ]` | `[ ]` — F-01-L |
| 15 | No assertion edited outside the owned entries | `[ ]` | `[ ]` — F-01-I |
| 16 | Three repo gates green | `[ ]` | `[ ]` — F-01-J |

Scope 01 Definition of Done: **11 of 16 closed** (7 before this pass, 4 closed by
it). Five remain open, each with a named finding and a stated reason; none was
ticked without executed evidence.
