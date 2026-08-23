# Report: BUG-015 — Dead Subject Parameter In Two Owner-Read Deep Links

**Filed at commit:** `752699a60`
**Filed:** 2026-08-22
**Phase:** bug (filing only)

> **Renumbered from BUG-014 on 2026-08-22.** This packet was filed as `BUG-014`
> after a check that read only the local working tree. `origin/main` already
> carried a different `BUG-014`, `BUG-014-recommendation-confidence-pinned-at-the-tactical-cap`,
> so the two would have collided on merge. `origin/main` also carries a spec-id
> uniqueness assertion whose `GRANDFATHERED_COLLISIONS` list is
> `['021', 'BUG-002', 'BUG-009']`, so a third collision would have been a fresh
> one and would have failed that assertion. The published number kept its id and
> this unpushed packet moved to `BUG-015`.
>
> The captured command output below is left exactly as recorded and still shows
> the `BUG-014` path, because that is the path those commands were run against.
> Rewriting a capture to match a later rename would falsify it.

---

## Summary

This packet files a defect and implements nothing.

Two routes publish a Feature 007 owner read whose `deepLink` names the company being read, and both
compose that link with a literal `?t=` parameter that no route in the tree reads. A reader who
follows one of those links does not land on the named subject. The route opens on its default and
nothing reports that the naming was discarded.

The defect was raised as audit finding `F-AUDIT-02b` during Feature 027's audit phase and routed
rather than fixed, correctly: both files are outside that feature's `workBoundary.allowedPaths`.
The routing was a dead letter. At filing, the finding id appeared only inside the routing feature's
own artifacts, so no owner outside Feature 027 could learn it existed.

Two facts established here go beyond the routed finding, and both were reached by execution rather
than by inference from the precedent:

1. **The defect has two halves.** Neither route reads any subject parameter at all — both reference
   `RLTKR` zero times despite loading the module. The precedent's one-line emission swap is
   therefore necessary and not sufficient here.
2. **The existing convention guard is blind to these routes by construction.** `scripts/selftest.mjs`
   assertion 1.20 pins exactly this property, over an explicit two-element allowlist that does not
   contain them.

No source file was modified. No selftest assertion was added, deliberately: an assertion that fails
on a known-open defect would turn the suite red for a defect nobody is yet authorised to fix.

---

## Evidence Provenance

Every command below was executed in this session, in this repository, at `752699a60`. Output is
reproduced verbatim.

Two claims in this packet are **not** established by execution here and are labelled where they
appear:

- The user-visible consequence — that a reader following the link lands on the route's default —
  is derived from the absence of any reader, not from a browser run. A browser proof is required by
  Scope 2's Definition of Done and is not supplied by a filing packet.
- The characterisation of `F-AUDIT-02b` as "correctly routed" is read from Feature 027's own
  `report.md` and is not independently re-derived.

**Claim Source:** executed, except where labelled otherwise.

---

## Test Evidence

### The routing is a dead letter

```
$ grep -rln 'F-AUDIT-02b' specs/
specs/027-company-scoped-owner-deep-links/state.json
specs/027-company-scoped-owner-deep-links/report.md
```

Two hits, both inside the feature that raised and routed the finding. No bug packet, no receiving
spec.

The routed text itself, from `specs/027-company-scoped-owner-deep-links/report.md:4977`:

```
| 2026-08-22 | `F-AUDIT-02b` | `intraday-tape-lab.html:1855` and `swing-structure-lab.html:1693`
emit the same dead `?t=` convention | Medium | **Routed, not fixed.** Both are outside
`workBoundary.allowedPaths` for this feature and were read-only here.
`tests/technical-analysis-decision-lab.spec.mjs:922` navigates `swing-structure-lab.html?t=SPY`, so
their owners must reconcile that spec in the same change. | Owners of `intraday-tape-lab` /
`swing-structure-lab` |
```

**Claim Source:** executed for the grep; the routing characterisation is quoted, not re-derived.

### The parameter is emitted

```
$ grep -rn 'deepLink' intraday-tape-lab.html swing-structure-lab.html
intraday-tape-lab.html:1855:                            deepLink: "intraday-tape-lab.html?t=" + encodeURIComponent(state.ticker)
swing-structure-lab.html:1693:                            deepLink: "swing-structure-lab.html?t=" + encodeURIComponent(state.ticker)
```

Exactly two emission sites, one per file. `grep -rn '"?t="\|?t=' *.html` over every root route
returns the same two lines and no others, so these are the only literal `?t=` emissions left in the
tree.

### Nothing reads it

```
$ grep -rn "get(\"t\")\|get('t')\|params.t\b\|searchParams.get( *['\"]t['\"] *)" *.html rlticker.js
(zero hits — nothing reads t)
```

The `(zero hits …)` line is the shell's `||` fallback echo, printed because `grep` exited non-zero
with no matching lines. Every root HTML route and the shared subject module were scanned. The
parameter has no reader anywhere.

### The canonical spelling is something else

```
$ grep -n 'SUBJECT_PARAM\|SUBJECT_PATTERN' rlticker.js
53:  var SUBJECT_PARAM = "ticker";
55:  var SUBJECT_PATTERN = /^[A-Z0-9.\-]{1,12}$/;
64:       second acceptance rule. Omitting it reads SUBJECT_PARAM, which is what every caller
66:    var name = typeof paramName === "string" && paramName ? paramName : SUBJECT_PARAM;
71:    if (!SUBJECT_PATTERN.test(normalised)) return { status: "refused", subject: null, raw: null };
152:  root.RLTKR.SUBJECT_PARAM = SUBJECT_PARAM;
153:  root.RLTKR.SUBJECT_PATTERN = SUBJECT_PATTERN;
```

One declaration, exported once, at line 152.

### The precedent — the same defect, already fixed twice

```
$ grep -rn 'SUBJECT_PARAM' options-structure-lab.html gamma-trading-lab.html
options-structure-lab.html:1962:            deepLink: "options-structure-lab.html?" + RLTKR.SUBJECT_PARAM + "=" + encodeURIComponent(state.ticker)
gamma-trading-lab.html:1512:                            deepLink: "gamma-trading-lab.html?" + RLTKR.SUBJECT_PARAM + "=" + encodeURIComponent(state.ticker)
```

Feature 027 corrected both. The remedy shape for the emitting half is settled.

### The receiving half is absent — the precedent does not cover it

```
$ grep -c 'RLTKR' intraday-tape-lab.html swing-structure-lab.html
intraday-tape-lab.html:0
swing-structure-lab.html:0
```

Zero references in either file, while both load the module:

```
$ grep -n 'rlticker' intraday-tape-lab.html swing-structure-lab.html
intraday-tape-lab.html:2226:    <script src="rlticker.js" defer></script>
swing-structure-lab.html:2056:    <script src="rlticker.js" defer></script>
```

The two precedent routes are not in that position:

```
$ grep -rn 'linkedSubject' *.html rlticker.js
company-intelligence-lab.html:1724:                var handoff = (window.RLTKR && window.RLTKR.linkedSubject)
company-intelligence-lab.html:1725:                    ? window.RLTKR.linkedSubject(window.location.search, "symbol")
gamma-trading-lab.html:1842:                var handoff = RLTKR.linkedSubject(window.location.search);
options-flow-feed-lab.html:714:        if (window.RLTKR && RLTKR.linkedSubject) FOCUS = RLTKR.linkedSubject(window.location.search);
options-structure-lab.html:2565:      var handoff = RLTKR.linkedSubject(window.location.search);
volatility-sizing-lab.html:1150:                var handoff = (window.RLTKR && RLTKR.linkedSubject)
volatility-sizing-lab.html:1151:                    ? RLTKR.linkedSubject(window.location.search)
rlticker.js:56:  function linkedSubject(search, paramName) {
rlticker.js:154:  root.RLTKR.linkedSubject = linkedSubject;
```

Five call sites. Neither affected file is among them.

### The consequence, observed in a browser

The filing above derives the consequence from the absence of a reader. This
section observes it instead, against the repository's own `startStaticServer()`
harness — the same server the committed route specs use — so the routes are
real, same-origin and unmocked. The reading is `#ticker`, the input each route
reflects its resolved subject into.

The first two rows are a positive control. Without them, "both routes showed
`SPY`" would be indistinguishable from a broken measurement.

```
$ node --input-type=module -e '<startStaticServer + playwright chromium; read #ticker per route>'
CONTROL options-structure ?ticker=NVDA -> NVDA
CONTROL options-structure  no query    -> SPY
TEST    intraday-tape     ?t=NVDA     -> SPY
TEST    intraday-tape     ?ticker=NVDA-> SPY
TEST    intraday-tape      no query   -> SPY
TEST    swing-structure   ?t=NVDA     -> SPY
TEST    swing-structure    no query   -> SPY
```

The control moves `SPY` to `NVDA`, so a working corridor is detectable by this
reading. Both affected routes stay at `SPY`: a published link naming `NVDA`
opens `SPY`, with nothing on screen saying the subject was dropped.

The fourth row is the one that changes the remedy. `?ticker=NVDA` — the
canonical spelling, the exact value the emitting-half fix would produce — is
**equally ignored**. Renaming the parameter at the two emission sites would
leave every observed value identical. The two-halves finding is therefore
measured, not inferred, and a fix that ships only the precedent's one-line swap
would close this bug while changing nothing a reader can see.

This observes the DEFECT. It is not the Scope 2 proof, which requires the same
reading to return `NVDA` after the fix lands.

### Why it fails silently — the contract validates shape, not liveness

```
$ grep -rn 'deepLink' rlcontracts.js rldata.js
rlcontracts.js:787:    "deepLink", "fingerprint"
rldata.js:481:     { id, asOf, read, metrics{}, deepLink }. A missing/invalid id is rejected. */
rldata.js:507:    if (typeof read.deepLink !== "string" || !read.deepLink) return trmFail("deep-link-required");
rldata.js:556:      var keys = Object.keys(src).sort(), expected = ["asOf", "availability", "computedAt", "contractVersion", "deepLink", "freshUntil", "id", "metrics", "read"].sort();
rldata.js:562:      if (typeof src.read !== "string" || !src.metrics || typeof src.deepLink !== "string" || !src.deepLink) return null;
rldata.js:578:      deepLink: src.deepLink || (id + ".html")
```

`rldata.js:507` rejects a missing or non-string link. A well-formed link whose parameter has no
reader passes every check.

Both emission sites sit inside an additive publication block. From `intraday-tape-lab.html`
immediately after line 1855:

```
                        });
                    }
                } catch (f7Err) { /* publication is additive */ }
                /* ---------- End Feature 007 owner read: intraday-auction/v1 ---------- */
```

and from `swing-structure-lab.html` immediately after line 1693:

```
                        });
                    }
                } catch (f7Err) { /* publication is additive; it never blocks the owner's own render */ }
                /* ---------- End Feature 007 owner read: swing-structure/v1 ---------- */
```

### The coupled test pins the dead spelling

```
$ grep -rn '?t=' tests/*.mjs
tests/technical-analysis-decision-lab.spec.mjs:922:  await page.goto(`${baseUrl}/swing-structure-lab.html?t=SPY`);
```

Its surrounding context shows why it passes today — the subject is seeded directly into `RLDATA`
before navigation, so the query string is not what puts the route into the expected state:

```
  globalThis.RLDATA.putBars('SPY', '1d', rows, 'selftest-seed');
  globalThis.RLDATA.putBars('SPY', '1wk', rows.filter((_, i) => i % 5 === 0), 'selftest-seed');
    return { seeded: true, rows: rows.length };
  });
  expect(seedOutcome.seeded).toBe(true);
  await page.goto(`${baseUrl}/swing-structure-lab.html?t=SPY`);
```

### Why the existing convention guard did not catch it

Assertion 1.20 in `scripts/selftest.mjs` pins the single-convention property in both directions.
Its own comment names this exact failure mode:

```
  /* 1.20 — the single-convention property, pinned in BOTH directions.
     Every assertion above proves the CORRECT name works; none of them counts NAMES, so a
     SECOND convention arriving alongside `ticker` survived all of them — a fallback read of
     `t` in the shared reader, or a `?t=` parameter in the deep link a route publishes about
     itself. Both are counted here instead: the shared reader must read exactly one parameter
     name, each subject route must delegate its query read to that reader rather than parse
     the search string itself, and every deepLink a subject route emits must name that same
     parameter. […] */
```

It is blind here because its subject set is an explicit allowlist:

```
$ grep -n 'F027_SUBJECT_ROUTES = Object.freeze' scripts/selftest.mjs
  const F027_SUBJECT_ROUTES = Object.freeze(['options-structure-lab.html', 'gamma-trading-lab.html']);
```

The assertion iterates the route sources derived from that constant. A route outside it is neither
checked nor reported as unchecked.

### The enabling commit introduced all three lines together

```
$ git log --oneline -3 -- intraday-tape-lab.html
a4b10dc5b Feature 007 Scope 5: owner publication and strict adapters
cbc7cf7aa fix: close roadmap verification gaps
5c15da52d feat(012/scope-15): wire intraday-tape + swing-structure Simple adapters

$ git show a4b10dc5b -- intraday-tape-lab.html | grep -n 'deepLink'
106:+                            deepLink: "intraday-tape-lab.html?t=" + encodeURIComponent(state.ticker)

$ git show a4b10dc5b -- swing-structure-lab.html | grep -n 'deepLink'
113:+                            deepLink: "swing-structure-lab.html?t=" + encodeURIComponent(state.ticker)

$ git show a4b10dc5b -- tests/technical-analysis-decision-lab.spec.mjs | grep -n 't=SPY'
268:+  await page.goto(`${baseUrl}/swing-structure-lab.html?t=SPY`);
```

One commit added the emission in both routes and the navigation in the test. The routes were given
a way to publish a subject and never a way to receive one, so the parameter was never exercised end
to end and its spelling never had to agree with anything.

---

## Filing Verification

Recorded after the packet's seven artifacts were written and before any verdict was emitted.

**Claim Source:** executed.

### The suite is unchanged

The baseline for this run was `3197 passed, 0 failed`. It still reads that. Captured unfiltered
through `evidence-capture.sh`, so the sha256 covers all 3,626 produced lines and is re-derivable
with `--verify`.

```
# BUG-014 filing verification: selftest baseline
$ node scripts/selftest.mjs
exit: 0
lines: 3626
sha256: 3916e59b61eafcff81b5e5292236e1fe3e10782b9f2e735d5a919f99f65a0ebc
--- first 20 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
  ✓ CSP blocks object, base-tag, and form exfiltration paths
  ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
  ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✓ CSP allows no open URL-forwarding relay origin
  ✓ production pages and shared runtime contain no open URL-forwarding relay chain
  ✓ no model/config-authored field reaches innerHTML without esc()
  ✓ the sink detector catches an unescaped model-authored title
[…]
--- omitted 3586 line(s); sha256 above covers the full output ---
--- last 20 ---
[…]
================================================
Research-Lab self-test: 3197 passed, 0 failed
================================================
```

No assertion was added by this packet, which is why the count is identical rather than higher. The
assertion that would pin this defect belongs in the fixing change, where it can go from red to
green in one step.

### The packet lints clean

```
$ bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-014-owner-read-deep-links-emit-dead-t-parameter
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ No forbidden sidecar artifacts present
✅ Found DoD section in scopes.md
✅ scopes.md DoD contains checkbox items
✅ All DoD bullet items use checkbox syntax in scopes.md
✅ Found Checklist section in uservalidation.md
✅ uservalidation checklist contains checkbox entries
✅ All checklist bullet items use checkbox syntax
✅ uservalidation separates automation readiness from human acceptance
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: bugfix-fastlane
✅ state.json v3 has required field: status
✅ state.json v3 has required field: execution
✅ state.json v3 has required field: certification
✅ state.json v3 has required field: policySnapshot
✅ state.json v3 has recommended field: transitionRequests
✅ state.json v3 has recommended field: reworkQueue
✅ state.json v3 has recommended field: executionHistory
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ report.md contains section matching: ###[[:space:]]+Summary|^##[[:space:]]+Summary
✅ report.md contains section matching: ###[[:space:]]+Completion Statement|^##[[:space:]]+Completion Statement
✅ report.md contains section matching: ###[[:space:]]+Test Evidence|^##[[:space:]]+Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ Value-first selection rationale lint skipped (not a value-first report)
✅ Scenario path-placeholder lint skipped (no matching scenario sections found)

=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
exit=0
```

The `ℹ️` line is informational: the mode permits `done` and the packet is deliberately not there.

### Nothing outside the packet was touched

```
$ git status --porcelain -- specs/_bugs/BUG-014-owner-read-deep-links-emit-dead-t-parameter
?? specs/_bugs/BUG-014-owner-read-deep-links-emit-dead-t-parameter/
```

One untracked directory, which is this packet.

```
$ git status --porcelain -- intraday-tape-lab.html swing-structure-lab.html rlticker.js \
    rldata.js scripts/selftest.mjs tests/technical-analysis-decision-lab.spec.mjs \
    specs/027-company-scoped-owner-deep-links
(empty above = none of the forbidden paths was modified by this run)
```

Empty. The `(empty …)` line is the trailing `echo`, not `git` output. Neither affected route, the
shared subject module, the owner-read contract, the selftest, the coupled test, nor any Feature 027
artifact was modified.

The repository-wide working tree carries other modifications that predate this run and belong to
concurrent sessions. This packet claims nothing about them, which is why the check above is scoped
to the paths this packet was told to leave alone rather than to the whole tree.

---

## Two Producers Disagree About These Links

A follow-up investigation found that each affected tool's owner read has two
independent producers, and they do not agree.

| Producer | Emitted `deepLink` |
|---|---|
| Browser, `RLDATA.putToolRead(...)` at `intraday-tape-lab.html:1855` and `swing-structure-lab.html:1693` | `intraday-tape-lab.html?t=<ticker>` |
| Server Tier-A, `scripts/brief-refresh.mjs:192`, `:2184`, `:2266` | `intraday-tape-lab.html` (bare) |

The committed graph carries the server form. `briefs/current.json` resolves both
tools to a bare `intraday-tape-lab.html` and `swing-structure-lab.html` with no
query string, so the published brief graph does not carry the dead parameter. The
defect reaches a reader only through the browser-published read, which is
localStorage-scoped and written when someone visits the tool itself.

Two consequences follow, and this packet acts on neither.

The blast radius is narrower than the filing alone would suggest. The dead
parameter is absent from the published artifact. Severity is unchanged, because
the browser read is a real reader path, but the exposure is bounded to it.

The divergence is itself evidence for open question 4. One of the product's two
producers already publishes these routes as bare-linked. That is not a decision
and is not read as one here.

One claim is deliberately not made. `ownerDeepLink` is assigned at
`rlbrief.js:989` and no render site for it was found, so this packet does not
claim a reader can click one of these links in the brief. It was checked and left
unproven rather than asserted.

---

## Completion Statement

**Nothing is fixed and nothing is certified.**

What this packet establishes, by execution: two routes emit a subject parameter that no code reads;
the canonical parameter is `RLTKR.SUBJECT_PARAM` and is declared once; neither route reads any
subject parameter at all, so the known precedent covers only half the remedy; the owner-read
contract validates the link's shape and cannot validate its liveness; the publication block
swallows its own failures by design; the existing convention guard covers an explicit two-route
allowlist that excludes both; a live test navigates the dead spelling; and all three lines arrived
in commit `a4b10dc5b`.

What it does not establish: the user-visible consequence has not been observed in a browser. It is
derived from the absence of any reader, which is strong but is not the runtime proof Scope 2's
Definition of Done requires. A source-level fix could also be dead, because the publication block
fails silently — which is exactly why Scope 2 demands a browser proof rather than a source match.

What it deliberately does not decide: what a reader should see when a named subject cannot be
honoured, and whether these routes should be openable by link at all. Both are product choices
recorded as open questions in `design.md`, and selecting one inside a filing task would prejudge
it.

Zero Definition of Done items are ticked across both scopes and the cross-scope set. `status` is
`in_progress`, `certification.status` matches it, `certifiedAt` is `null`, and
`certification.certifiedCompletedPhases` is empty. Human acceptance has not occurred and cannot:
this packet delivers no behaviour to exercise.
