# Report: BUG-025 — A Company Corpus Read That Never Answers Never Settles

## Summary

This packet classifies `BUG018-STABILIZE-001` as an independent reliability defect and now carries the Scope 1 production repair. The configuration declares and validates one read bound, and the route aborts each accepted document request through one body-lifetime helper while preserving embedded first paint. Current implementation-owned unit and browser receipts are green. The repository selftest remains non-green on two test-owner findings, so independent verification and certification are not claimed.

## Completion Statement

The implementation phase has produced and re-executed its owned repair, then routed two unresolved test-carrier findings to `bubbles.test`. Scope 1 and the packet remain `in_progress`; all Definition of Done items remain unchecked, and `certification.*` is unchanged.

## Test Evidence

### Source Control-Flow Inspection

**Phase:** bug
**Command:** `grep -nE 'corpusStatus = "pending"|fetch\(|Promise\.all|return loadEvents|return loadResearchRecord|if \(intent !== readingIntent\)|AbortController|Promise\.race|signal[[:space:]]*:|setTimeout' company-intelligence-lab.html`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The output identifies each direct fetch and the promise chain that must settle before the final intent guard. It contains no abort, signal, race, or timer implementation on this route. This proves the missing mechanism, not a measured browser duration.


748:            var corpusStatus = "pending";
1591:                corpusStatus = "pending";
1615:                return fetch("data/bars/" + encodeURIComponent(symbol) + ".json", { cache: "no-store" })
1630:                corpusStatus = "pending";
> **What was attempted:** Source control flow was inspected and the existing released/failing-request evidence in BUG-018 was reviewed.
> **What was observed:** Every direct fetch lacks a route-owned settlement bound. Existing browser cases release or reject their injected boundary.
> **Why this is uncertain:** No current browser command kept a same-origin response open past a product-owned bound, because no such bound exists.
> **What would resolve this:** Run the planned BUG-025 never-answering browser case before the fix, then rerun the same case after the declared abort boundary is implemented.

## Scenario-First RED Evidence — Scope 1

### Scenario-First RED Unit Configuration Contract

**Phase:** test
**Command:** `timeout 180 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 RED unit configuration contract' -- timeout 120 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text

$ timeout 120 node --test tests/company-intelligence.unit.mjs
exit: 1
lines: 828
sha256: fb1d7ae58433637e9cdd16277d87eedfcfee54e0b16b45e32b98787641b4e6f4
	duration_ms: 2.244592
	type: 'test'
	...
# Subtest: every one of the five evidence states is produced by a real adapter o
utcome
ok 3 - every one of the five evidence states is produced by a real adapter outco
me
	---
	duration_ms: 3.962786
	type: 'test'
	...
# Subtest: a read aged past its window stays in the denominator as stale rather
than becoming neutral
--- failure-shaped lines from the omitted region ---
not ok 59 - the registry embedded in the route is identical to the committed reg
istry file
not ok 60 - BUG-025 readCoverageRegistry accepts v2, carries the exact positive
safe-integer read bound and freezes it
not ok 61 - BUG-025 readCoverageRegistry refuses absent readBoundMs with C025-CO
NFIG-SCHEMA
not ok 62 - BUG-025 readCoverageRegistry refuses zero readBoundMs with C025-CONF
IG-SCHEMA
not ok 63 - BUG-025 readCoverageRegistry refuses negative readBoundMs with C025-
CONFIG-SCHEMA
not ok 64 - BUG-025 readCoverageRegistry refuses non-integer readBoundMs with C0
25-CONFIG-SCHEMA
not ok 65 - BUG-025 readCoverageRegistry refuses string readBoundMs with C025-CO
NFIG-SCHEMA
not ok 66 - BUG-025 readCoverageRegistry refuses NaN readBoundMs with C025-CONFI
G-SCHEMA
not ok 67 - BUG-025 readCoverageRegistry refuses positive Infinity readBoundMs w
ith C025-CONFIG-SCHEMA
not ok 68 - BUG-025 readCoverageRegistry refuses negative Infinity readBoundMs w
ith C025-CONFIG-SCHEMA
--- omitted 788 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 101 - 027 security — ownerBareReason reaches the reader as text only, never a
n attribute, an href or markup
	---
	duration_ms: 1.029097
	type: 'test'
	...
# Subtest: 027 security — no markup-bearing subject can reach a receiver markup
sink, and every subject-fed sink escapes
ok 102 - 027 security — no markup-bearing subject can reach a receiver markup si
nk, and every subject-fed sink escapes
	---
	duration_ms: 5.542381
	type: 'test'
	...
1..102
# tests 102
# suites 0
# pass 88
# fail 14
# cancelled 0
# skipped 0
# todo 0
# duration_ms 350.809304
```

### Scenario-First RED Browser Bounded Acquisition

**Phase:** test
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 RED browser bounded acquisition scenarios' -- timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep 'BUG-025' --reporter=list`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025 RED browser bounded acquisition scenarios
$ timeout 240 npx --no-install playwright test tests/company-intelligence-lab.sp
ec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --r
eporter=list
exit: 1
lines: 98
sha256: b43b4571ea3a4bad87b0b81f1c315162e500a5e889a6ea86b221e599358dab9d
--- first 20 ---

Running 4 tests using 1 worker

	✘  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:243:1 › Regress
ion: BUG-025 a never-answering corpus request reaches a bounded unavailable resu
lt (15.5s)
	✘  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:263:1 › Regress
ion: BUG-025 a never-answering optional document reaches a bounded unavailable r
esult (15.6s)
	✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:283:1 › Regress
ion: BUG-025 an inside-bound response settles normally (3.8s)
	✘  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:314:1 › Regress
ion: BUG-025 a stalled served configuration preserves embedded first paint and s
ettles (15.3s)


	1) [system-chrome] › tests/company-intelligence-lab.spec.mjs:243:1 › Regressio
n: BUG-025 a never-answering corpus request reaches a bounded unavailable result


		Error: underlying static-server request for data/bars/MSFT.json remained ope
n after the declared 10000 ms read bound

		underlying static-server request for data/bars/MSFT.json remained open after
 the declared 10000 ms read bound

		expect(received).toBe(expected) // Object.is equality

		Expected: true
		Received: false

--- omitted 58 line(s); sha256 above covers the full output ---
--- last 20 ---

			225 |             message: `underlying static-server request for ${heldPat
h} remained open after the declared ${REQUIRED_READ_BOUND_MS} ms read bound`
			226 |         }
		> 227 |     ).toBe(true);
					|       ^
			228 |     await withheld.aborted;
			229 | }
			230 |
				at expectUnderlyingRequestAbort (~/research-lab/tests/company-intelligence-lab.spec.mjs:227:7)
				at ~/research-lab/tests/company-intelligence-lab.spec.mjs:324:15

		Error Context: test-results/tests-company-intelligence-5f6a7-ded-first-paint
-and-settles-system-chrome/error-context.md

		Error Context: test-results/tests-company-intelligence-5f6a7-ded-first-paint
-and-settles-system-chrome/error-context.md

	3 failed
		[system-chrome] › tests/company-intelligence-lab.spec.mjs:243:1 › Regression
: BUG-025 a never-answering corpus request reaches a bounded unavailable result
		[system-chrome] › tests/company-intelligence-lab.spec.mjs:263:1 › Regression
: BUG-025 a never-answering optional document reaches a bounded unavailable resu
lt
		[system-chrome] › tests/company-intelligence-lab.spec.mjs:314:1 › Regression
: BUG-025 a stalled served configuration preserves embedded first paint and sett
les
	1 passed (55.9s)
```

## Implementation Phase Evidence — Scope 1

The receipts below come from the current `bubbles.implement` invocation. The earlier
`bubbles.test` RED remains historical evidence for its own phase and was not reused as this
phase's execution claim.

### Implement RED — Unit Configuration And Route Contract

**Phase:** implement
**Command:** `timeout 180 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 implement RED unit configuration contract" -- timeout 120 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025 implement RED unit configuration contract
$ timeout 120 node --test tests/company-intelligence.unit.mjs
exit: 1
lines: 828
sha256: ffdf8811b982014c935d50417f78b6750c5ee9502ade8a60588dff1c0062a799
--- first 20 ---
TAP version 13
# Subtest: coverage account holds one row per registry dimension and totals sum
to the registry length
ok 1 - coverage account holds one row per registry dimension and totals sum to t
he registry length
	---
	duration_ms: 9.274881
	type: 'test'
	...
# Subtest: SCN-025-001 a subject carrying committed bars and a cached options ch
ain accounts for every mandatory dimension in the closed five-state vocabulary
ok 2 - SCN-025-001 a subject carrying committed bars and a cached options chain
accounts for every mandatory dimension in the closed five-state vocabulary
	---
	duration_ms: 2.198595
	type: 'test'
	...
# Subtest: every one of the five evidence states is produced by a real adapter o
utcome
ok 3 - every one of the five evidence states is produced by a real adapter outco
me
	---
	duration_ms: 4.399491
	type: 'test'
	...
# Subtest: a read aged past its window stays in the denominator as stale rather
than becoming neutral
--- failure-shaped lines from the omitted region ---
not ok 59 - the registry embedded in the route is identical to the committed reg
istry file
not ok 60 - BUG-025 readCoverageRegistry accepts v2, carries the exact positive
safe-integer read bound and freezes it
not ok 61 - BUG-025 readCoverageRegistry refuses absent readBoundMs with C025-CO
NFIG-SCHEMA
not ok 62 - BUG-025 readCoverageRegistry refuses zero readBoundMs with C025-CONF
IG-SCHEMA
not ok 63 - BUG-025 readCoverageRegistry refuses negative readBoundMs with C025-
CONFIG-SCHEMA
not ok 64 - BUG-025 readCoverageRegistry refuses non-integer readBoundMs with C0
25-CONFIG-SCHEMA
not ok 65 - BUG-025 readCoverageRegistry refuses string readBoundMs with C025-CO
NFIG-SCHEMA
not ok 66 - BUG-025 readCoverageRegistry refuses NaN readBoundMs with C025-CONFI
G-SCHEMA
not ok 67 - BUG-025 readCoverageRegistry refuses positive Infinity readBoundMs w
ith C025-CONFIG-SCHEMA
not ok 68 - BUG-025 readCoverageRegistry refuses negative Infinity readBoundMs w
ith C025-CONFIG-SCHEMA
--- omitted 788 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 101 - 027 security — ownerBareReason reaches the reader as text only, never a
n attribute, an href or markup
	---
	duration_ms: 1.042296
	type: 'test'
	...
# Subtest: 027 security — no markup-bearing subject can reach a receiver markup
sink, and every subject-fed sink escapes
ok 102 - 027 security — no markup-bearing subject can reach a receiver markup si
nk, and every subject-fed sink escapes
	---
	duration_ms: 7.284668
	type: 'test'
	...
1..102
# tests 102
# suites 0
# pass 88
# fail 14
# cancelled 0
# skipped 0
# todo 0
# duration_ms 350.625984
```

### Implement RED — Browser Bounded Acquisition

**Phase:** implement
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 implement RED browser bounded acquisition scenarios" -- timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025 implement RED browser bounded acquisition scenarios
$ timeout 240 npx --no-install playwright test tests/company-intelligence-lab.sp
ec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --r
eporter=list
exit: 1
lines: 98
sha256: 88232d4d12960452fb2a16efcd3fddb87b32c37d0fc0c730a5f7861680b01533
--- first 20 ---

Running 4 tests using 1 worker

	✘  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:243:1 › Regress
ion: BUG-025 a never-answering corpus request reaches a bounded unavailable resu
lt (16.0s)
	✘  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:263:1 › Regress
ion: BUG-025 a never-answering optional document reaches a bounded unavailable r
esult (15.6s)
	✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:283:1 › Regress
ion: BUG-025 an inside-bound response settles normally (4.0s)
	✘  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:314:1 › Regress
ion: BUG-025 a stalled served configuration preserves embedded first paint and s
ettles (15.3s)


	1) [system-chrome] › tests/company-intelligence-lab.spec.mjs:243:1 › Regressio
n: BUG-025 a never-answering corpus request reaches a bounded unavailable result


		Error: underlying static-server request for data/bars/MSFT.json remained ope
n after the declared 10000 ms read bound

		underlying static-server request for data/bars/MSFT.json remained open after
 the declared 10000 ms read bound

		expect(received).toBe(expected) // Object.is equality

		Expected: true
		Received: false

--- omitted 58 line(s); sha256 above covers the full output ---
--- last 20 ---

			225 |             message: `underlying static-server request for ${heldPat
h} remained open after the declared ${REQUIRED_READ_BOUND_MS} ms read bound`
			226 |         }
		> 227 |     ).toBe(true);
					|       ^
			228 |     await withheld.aborted;
			229 | }
			230 |
				at expectUnderlyingRequestAbort (~/research-lab/tests/company-intelligence-lab.spec.mjs:227:7)
				at ~/research-lab/tests/company-intelligence-lab.spec.mjs:324:15

		Error Context: test-results/tests-company-intelligence-5f6a7-ded-first-paint
-and-settles-system-chrome/error-context.md

		Error Context: test-results/tests-company-intelligence-5f6a7-ded-first-paint
-and-settles-system-chrome/error-context.md

	3 failed
		[system-chrome] › tests/company-intelligence-lab.spec.mjs:243:1 › Regression
: BUG-025 a never-answering corpus request reaches a bounded unavailable result
		[system-chrome] › tests/company-intelligence-lab.spec.mjs:263:1 › Regression
: BUG-025 a never-answering optional document reaches a bounded unavailable resu
lt
		[system-chrome] › tests/company-intelligence-lab.spec.mjs:314:1 › Regression
: BUG-025 a stalled served configuration preserves embedded first paint and sett
les
	1 passed (57.2s)
```

### Implement Repair-Loop Receipts

**Phase:** implement
**Claim Source:** executed

| Command receipt | Exit | Direct observation | Repair applied |
| --- | ---: | --- | --- |
| `timeout 120 node --test tests/company-intelligence.unit.mjs` (`sha256:19b7033b5bd30a6ea711518857f5cf33228154719eec97bfe209307e398285ed`) | 1 | 101 passed and the structural fetch-site test failed. | Removed the comment-only `fetch()` spelling so the immutable source scanner counts the one executable fetch site. |
| Focused BUG-025 browser command (`sha256:05bec78b6d6ed4c5cd1416aab3ee658393875f1b30b6098a4e01e9f0741b0498`) | 1 | Served-config and inside-bound cases passed. Both unavailable cases reached the expected row state but timed out waiting for its named-reason elements. | Rendered the existing reason code and readable absence statement inside settled unavailable coverage rows. |

These failures were not accepted as completion evidence. The focused commands were executed again
after each repair, and only the later passing receipts support the implementation items.

<a name="implement-green-unit-contract"></a>
### Implement GREEN — Unit Configuration And Route Contract

**Phase:** implement
**Command:** `timeout 180 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 implement final focused unit" -- timeout 120 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 implement final focused unit
$ timeout 120 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 622
sha256: 47b713a94ce88b575d058eba8e7218dda41c686f218842d0d65dc51f9099cf28
--- first 20 ---
TAP version 13
# Subtest: coverage account holds one row per registry dimension and totals sum
to the registry length
ok 1 - coverage account holds one row per registry dimension and totals sum to t
he registry length
	---
	duration_ms: 8.315273
	type: 'test'
	...
# Subtest: SCN-025-001 a subject carrying committed bars and a cached options ch
ain accounts for every mandatory dimension in the closed five-state vocabulary
ok 2 - SCN-025-001 a subject carrying committed bars and a cached options chain
accounts for every mandatory dimension in the closed five-state vocabulary
	---
	duration_ms: 2.292093
	type: 'test'
	...
# Subtest: every one of the five evidence states is produced by a real adapter o
utcome
ok 3 - every one of the five evidence states is produced by a real adapter outco
me
	---
	duration_ms: 4.079287
	type: 'test'
	...
# Subtest: a read aged past its window stays in the denominator as stale rather
than becoming neutral
--- omitted 582 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 101 - 027 security — ownerBareReason reaches the reader as text only, never a
n attribute, an href or markup
	---
	duration_ms: 0.974996
	type: 'test'
	...
# Subtest: 027 security — no markup-bearing subject can reach a receiver markup
sink, and every subject-fed sink escapes
ok 102 - 027 security — no markup-bearing subject can reach a receiver markup si
nk, and every subject-fed sink escapes
	---
	duration_ms: 5.351283
	type: 'test'
	...
1..102
# tests 102
# suites 0
# pass 102
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 390.934339
```

<a name="implement-green-browser-bound"></a>
### Implement GREEN — Focused Browser Bounded Acquisition

**Phase:** implement
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 implement GREEN browser bounded acquisition retry" -- timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 implement GREEN browser bounded acquisition retry
$ timeout 240 npx --no-install playwright test tests/company-intelligence-lab.sp
ec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --r
eporter=list
exit: 0
lines: 9
sha256: 8b92bc6ee70e5c0dbe4a99e308c5a02529268ff64ff0468760159876c2543b3d
--- output ---

Running 4 tests using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:243:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.4s)
	✓  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:263:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.3s)
	✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:283:1 › Regression: BUG-025 an inside-bound response settles normally (3.7s)
	✓  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:314:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.2s)

	4 passed (39.8s)
```

### Implement GREEN — Complete Company Intelligence Browser Suite

**Phase:** implement
**Command:** `timeout 900 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 implement complete Company Intelligence browser suite" -- timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 implement complete Company Intelligence browser suite
$ timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 51
sha256: 1ea0649cfb6f07cb7bf2d6ecafcf8d48ab8232906102f6b345ee9a2e581bcfc1
--- first 20 ---

Running 46 tests using 1 worker

	✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:243:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.6s)
	✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:263:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.7s)
	✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:283:1 › Regression: BUG-025 an inside-bound response settles normally (4.2s)
	✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:314:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (10.6s)
	✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:417:1 › four horizon regions render with four summaries and four deep-dive controls (570ms)
	✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:446:1 › Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction (525ms)
	✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:477:1 › an owned dimension renders a deep link whose target is a registered route (586ms)
	✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:521:1 › every rendered numeric value carries a provenance chip, a source name and an as-of date (555ms)
	✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:548:1 › Regression: SCN-025-021 an unavailable dimension renders a named absence and never a dash or a zero (565ms)
	✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:582:1 › Regression: SCN-025-021 a scripted narrative string renders as visible escaped text (621ms)
	✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:607:1 › a position, size or cost basis entry is refused in the browser and nothing is stored (587ms)
	✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:633:1 › each canvas draws non-blank pixels and pairs with a table holding the same values (1.0s)
	✓  13 [system-chrome] › tests/company-intelligence-lab.spec.mjs:680:1 › the route defers no drawing and schedules no repeating timer (553ms)
	✓  14 [system-chrome] › tests/company-intelligence-lab.spec.mjs:709:1 › switching the mode segment triggers no request and no recomposition (730ms)
	✓  15 [system-chrome] › tests/company-intelligence-lab.spec.mjs:731:1 › FR-025-017 a second run reuses the cached corpus and refetches no committed bar file (650ms)
	✓  16 [system-chrome] › tests/company-intelligence-lab.spec.mjs:775:1 › at 375 CSS pixels the four summaries stack and the document never scrolls sideways (630ms)
	✓  17 [system-chrome] › tests/company-intelligence-lab.spec.mjs:801:1 › the route composes from cache first and publishes a verified owner read (613ms)
--- omitted 11 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓  29 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1253:1 › Stabilize: the route writes only the shared data container and leaves a sibling tool cache intact (927ms)
	✓  30 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1280:1 › Stabilize: repeat composition of an unchanged subject issues no further request (1.4s)
	✓  31 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1312:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (5.1s)
	✓  32 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1350:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.7s)
	✓  33 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1386:1 › Chaos: a background corpus paint does not close a deep dive the reader opened (5.8s)
	✓  34 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1422:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (625ms)
	✓  35 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1465:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (857ms)
	✓  36 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1536:1 › every interactive control on the route is reachable and operable from the keyboard alone (2.2s)
	✓  37 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1682:1 › Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read (1.8s)
	✓  38 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1721:1 › Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card (950ms)
	✓  39 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1770:1 › Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href (614ms)
	✓  40 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1815:1 › Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company (1.2s)
	✓  41 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1835:1 › Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject (1.8s)
	✓  42 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1887:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (502ms)
	✓  43 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1975:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (565ms)
	✓  44 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2101:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel (456ms)
	✓  45 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2123:1 › Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel (567ms)
	✓  46 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2159:1 › Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel (398ms)

	46 passed (1.4m)
```

### Repository Selftest — Test-Owner Findings

**Phase:** implement
**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 implement repository selftest" -- timeout 540 node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025 implement repository selftest
$ timeout 540 node scripts/selftest.mjs
exit: 1
lines: 3906
sha256: 9760381c4bf56552a7c219590fbf94a85dd55c53eeaf021b7c4eabef3741a6ce
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- failure-shaped lines from the omitted region ---
	✗ FAIL: every declaration was attributed to an enclosing test budget, so none was passed over unevaluated (166 evaluated, 0 skipped, 1 unresolved)
	✗ FAIL: BUG-018 test provenance distinguishes ordinary traffic from annotated pass-through fault injection
--- omitted 3866 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (94 claim(s) across 71 packet(s), 80 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 94 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3435 passed, 2 failed
================================================
```

The timeout-budget validator's executed `--explain` receipt identifies the unresolved declaration
as `tests/company-intelligence-lab.spec.mjs:224`, where the immutable RED carrier passes
`READ_BOUND_WATCHDOG_MS` to `expect.poll`. The other failure is the repository selftest's stale
provenance wording expectation for that same immutable carrier. Both belong to independent test
ownership; this implementation phase did not alter either RED carrier or weaken either check.

### Implement Change-Boundary Receipt

**Phase:** implement
**Command:** `timeout 30 git diff --check -- company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js scripts/selftest.mjs notes/company-intelligence-lab.md specs/_bugs/BUG-025-company-corpus-read-never-settles; sha256sum tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs; git status --short`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** `git diff --check` returned zero. The final test-file hashes exactly equal the
pre-edit hashes recorded before any product edit in this invocation. The status inventory adds only
the allowed Company Intelligence production, note, selftest, and BUG-025 packet families to the
pre-existing dirty inventory.

```text
BUG025_DIFF_CHECK_EXIT=0
762c332c67d6c39f69b3cf86e3c92643599839bc6073c38636cc12832cdfc106  tests/company-intelligence.unit.mjs
775170cae6a7fa5c0687985f657a206dedd79949388d517e8cdd36227024defe  tests/company-intelligence-lab.spec.mjs
 M README.md
 M company-intelligence-lab.html
 M company-intelligence.config.json
 M docs/DomainModel.md
 M notes/company-intelligence-lab.md
 M rlcompanyintel.js
 M rlportfolio.js
 M rlportfoliobrief.js
 M scripts/selftest.mjs
 M scripts/validate-test-file-reachability.baseline
 M scripts/verify-spec008-scope-claims.mjs
 M specs/007-technical-analysis-decision-lab/scopes/01-capability-foundation/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/02-technique-engine/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/03-setup-lifecycle/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/04-five-gate-synthesis/report.md
 M specs/007-technical-analysis-decision-lab/scopes/04-five-gate-synthesis/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/05-owner-publication/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/06-comparison-optional-evidence/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/07-validation-risk-process/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/08-experience-publication/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/09-regression-closure/scope.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/report.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/scopes.md
 M specs/008-portfolio-survival-and-brief-lab/test-plan.json
 M specs/_bugs/BUG-002-market-brief-session-date-drift/uservalidation.md
 M tests/company-intelligence-lab.spec.mjs
 M tests/company-intelligence.unit.mjs
 M tests/portfolio-brief.functional.mjs
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/
```

<a name="resumed-implement-verification"></a>
## Resumed Implementation Verification — Scope 1

The mandatory result envelope from the prior implementation invocation was absent. This section
therefore rechecks the current tree instead of treating that silence as completion evidence.

### Current Production-Path Inspection

**Phase:** implement
**Claim Source:** interpreted

- `company-intelligence.config.json` and the inert JSON block in
	`company-intelligence-lab.html` both carry `company-intelligence-config/v2` and
	`readBoundMs: 10000`. The focused unit carrier compares the complete parsed objects.
- `rlcompanyintel.js::readCoverageRegistry()` requires a positive safe integer and carries the
	exact value into the frozen normalized registry. It neither rounds nor substitutes a value.
- `company-intelligence-lab.html::readRouteDocument()` snapshots `registry.readBoundMs`, creates
	one controller and timer per request, sends the controller signal to the route's only production
	`fetch()` site, keeps the timer armed through the supplied body consumer, and clears it on every
	fulfilled, rejected, or synchronous-failure path.
- `readConfig()`, `loadOne()`, and `loadOptionalJson()` supply only paths and body consumers. They
	declare no duration, retry, backoff, or second request.
- `boot()` validates and composes from the embedded registry before it invokes `readConfig()`.
	The browser cases below observe that first paint while the selected response remains held.

No further production correction was justified by this inspection or by the focused executions.
One execution-progress correction was required: the prior invocation had checked two DoD items
while `certification.scopeProgress` still truthfully recorded zero checked. Both items were restored
to unchecked before the final repository selftest. No planning text or certification field changed.

### Resumed Focused Unit Receipt

**Phase:** implement
**Command:** `timeout 180 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 resumed implement focused unit" -- timeout 120 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 resumed implement focused unit
$ timeout 120 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 622
sha256: cc38e1757e692640b553d338390d89c1a7eb075912d50052082aeffdf2f6a48b
--- first 20 ---
TAP version 13
# Subtest: coverage account holds one row per registry dimension and totals sum to the registry length
ok 1 - coverage account holds one row per registry dimension and totals sum to the registry length
	---
	duration_ms: 11.562961
	type: 'test'
	...
# Subtest: SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
ok 2 - SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
	---
	duration_ms: 4.267486
	type: 'test'
	...
# Subtest: every one of the five evidence states is produced by a real adapter outcome
ok 3 - every one of the five evidence states is produced by a real adapter outcome
	---
	duration_ms: 6.214479
	type: 'test'
	...
# Subtest: a read aged past its window stays in the denominator as stale rather than becoming neutral
--- omitted 582 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 101 - 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
	---
	duration_ms: 1.391496
	type: 'test'
	...
# Subtest: 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
ok 102 - 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
	---
	duration_ms: 7.361876
	type: 'test'
	...
1..102
# tests 102
# suites 0
# pass 102
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 947.755014
```

### Resumed Focused Browser Receipt

**Phase:** implement
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 resumed implement focused browser" -- timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 resumed implement focused browser
$ timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 0
lines: 9
sha256: 5473ee01b27afe372012ab0367cac8fe425b3f13c48efafa84dbfc0be520e9bf
--- output ---

Running 4 tests using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:243:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.2s)
	✓  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:263:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.8s)
	✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:283:1 › Regression: BUG-025 an inside-bound response settles normally (4.1s)
	✓  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:314:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (10.6s)

	4 passed (42.2s)
```

### Resumed Complete Company Intelligence Browser Receipt

**Phase:** implement
**Command:** `timeout 900 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 resumed implement complete Company Intelligence browser" -- timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 resumed implement complete Company Intelligence browser
$ timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 51
sha256: ae38408cd203f80c68eeb2dce87620d1678e2687181a813aad594e67845bf59c
--- first 20 ---

Running 46 tests using 1 worker

	✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:243:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.7s)
	✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:263:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.6s)
	✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:283:1 › Regression: BUG-025 an inside-bound response settles normally (3.9s)
	✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:314:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (10.6s)
	✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:417:1 › four horizon regions render with four summaries and four deep-dive controls (1.0s)
	✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:446:1 › Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction (664ms)
	✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:477:1 › an owned dimension renders a deep link whose target is a registered route (819ms)
	✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:521:1 › every rendered numeric value carries a provenance chip, a source name and an as-of date (816ms)
	✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:548:1 › Regression: SCN-025-021 an unavailable dimension renders a named absence and never a dash or a zero (711ms)
	✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:582:1 › Regression: SCN-025-021 a scripted narrative string renders as visible escaped text (766ms)
	✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:607:1 › a position, size or cost basis entry is refused in the browser and nothing is stored (695ms)
	✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:633:1 › each canvas draws non-blank pixels and pairs with a table holding the same values (1.1s)
	✓  13 [system-chrome] › tests/company-intelligence-lab.spec.mjs:680:1 › the route defers no drawing and schedules no repeating timer (654ms)
	✓  14 [system-chrome] › tests/company-intelligence-lab.spec.mjs:709:1 › switching the mode segment triggers no request and no recomposition (1.1s)
	✓  15 [system-chrome] › tests/company-intelligence-lab.spec.mjs:731:1 › FR-025-017 a second run reuses the cached corpus and refetches no committed bar file (839ms)
	✓  16 [system-chrome] › tests/company-intelligence-lab.spec.mjs:775:1 › at 375 CSS pixels the four summaries stack and the document never scrolls sideways (891ms)
	✓  17 [system-chrome] › tests/company-intelligence-lab.spec.mjs:801:1 › the route composes from cache first and publishes a verified owner read (760ms)
--- omitted 11 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓  29 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1253:1 › Stabilize: the route writes only the shared data container and leaves a sibling tool cache intact (1.1s)
	✓  30 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1280:1 › Stabilize: repeat composition of an unchanged subject issues no further request (1.4s)
	✓  31 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1312:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (5.0s)
	✓  32 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1350:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.5s)
	✓  33 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1386:1 › Chaos: a background corpus paint does not close a deep dive the reader opened (5.8s)
	✓  34 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1422:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (540ms)
	✓  35 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1465:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (838ms)
	✓  36 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1536:1 › every interactive control on the route is reachable and operable from the keyboard alone (2.0s)
	✓  37 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1682:1 › Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read (2.1s)
	✓  38 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1721:1 › Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card (1.3s)
	✓  39 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1770:1 › Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href (715ms)
	✓  40 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1815:1 › Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company (1.5s)
	✓  41 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1835:1 › Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject (2.8s)
	✓  42 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1887:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (693ms)
	✓  43 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1975:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (708ms)
	✓  44 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2101:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel (524ms)
	✓  45 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2123:1 › Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel (587ms)
	✓  46 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2159:1 › Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel (848ms)

	46 passed (1.6m)
```

### Resumed Final Repository Selftest Receipt

**Phase:** implement
**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 resumed implement post-routing selftest" -- timeout 540 node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

An earlier resumed run produced `sha256:6e864d31202eeed1c4a6c95a4aecb9f822bd374153e926af3e967620dbe0da1e`
and exposed a third, implementation-owned progress-drift failure because two DoD items were checked
while certification recorded zero. Restoring all DoD items to unchecked removed that drift. The
pre-routing rerun produced `sha256:19f0e717199ec8a44f81726c5261beadd56edaf179e1be68c3da75ba27f81c63`
with only the two foreign-owned findings. The post-routing run below confirms the same two-finding
set against the final packet state without changing either test carrier.

```text
# BUG-025 resumed implement post-routing selftest
$ timeout 540 node scripts/selftest.mjs
exit: 1
lines: 3906
sha256: 2f25f7039d97f1565feec85377b79a80065f7c7c96b69e43e8afce83b7b067e4
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- failure-shaped lines from the omitted region ---
	✗ FAIL: every declaration was attributed to an enclosing test budget, so none was passed over unevaluated (166 evaluated, 0 skipped, 1 unresolved)
	✗ FAIL: BUG-018 test provenance distinguishes ordinary traffic from annotated pass-through fault injection
--- omitted 3866 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (94 claim(s) across 71 packet(s), 80 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 94 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3435 passed, 2 failed
================================================
```

### Resumed Timeout-Budget Diagnosis

**Phase:** implement
**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 resumed timeout-budget diagnosis" -- timeout 60 node scripts/validate-playwright-timeout-budgets.mjs --explain`
**Exit Code:** 0
**Claim Source:** executed

The diagnostic command itself reports no unreachable literal budget and exits zero. Its explain
output still identifies one unevaluated declaration. The repository selftest treats that unresolved
declaration as a failure, which is the first routed finding.

```text
# BUG-025 resumed timeout-budget diagnosis
$ timeout 60 node scripts/validate-playwright-timeout-budgets.mjs --explain
exit: 0
lines: 169
sha256: 0e2e25fce860fda673049aa665398ed0b79c937df9331bef7fac4f9fbc7a0a92
--- first 20 ---
[timeout-budgets] scanned=80 tests=837 declarations=166 evaluated=166 unattributed=0 unresolved=1 violations=0 default=30000ms (playwright-default (config declares none))
	ok   tests/attention-browser.spec.mjs:135 declared=30000 budget=30000 [openBrief() <- test at line 1509 'a configured action floor of zero is honoured rather than swallowed by']
	ok   tests/attention-browser.spec.mjs:328 declared=30000 budget=90000 [test at line 318 'a shut decision card shows a visible cue naming what opening it reveal']
	ok   tests/attention-browser.spec.mjs:1367 declared=30000 budget=90000 [test at line 1327 'SCN-017-063 The record renders the published reduction, not a recomput']
	ok   tests/bond-regime-lab.spec.mjs:345 declared=10000 budget=30000 [openFromSharedCache() -> openWithSnapshot() <- test at line 164 'BS-001 duration-driven ratio improvement stays mixed']
	ok   tests/causal-rotation-chaos.spec.mjs:36 declared=2000 budget=30000 [clickIfReachable() <- test at line 40 'Regression: stochastic causal usage never throws, blanks, or manufactu']
	ok   tests/causal-rotation-chaos.spec.mjs:61 declared=2000 budget=30000 [test at line 40 'Regression: stochastic causal usage never throws, blanks, or manufactu']
	ok   tests/causal-rotation-chaos.spec.mjs:70 declared=2000 budget=30000 [test at line 40 'Regression: stochastic causal usage never throws, blanks, or manufactu']
	ok   tests/causal-rotation-chaos.spec.mjs:81 declared=2000 budget=30000 [test at line 40 'Regression: stochastic causal usage never throws, blanks, or manufactu']
	ok   tests/chaos-company-intelligence.spec.mjs:91 declared=30000 budget=30000 [open() <- test at line 149 'Chaos J1: seeded interleaving of mode, deep dive, apply and resize lea']
	ok   tests/chaos-company-intelligence.spec.mjs:92 declared=30000 budget=30000 [open() <- test at line 149 'Chaos J1: seeded interleaving of mode, deep dive, apply and resize lea']
	ok   tests/chaos-company-intelligence.spec.mjs:179 declared=30000 budget=30000 [test at line 149 'Chaos J1: seeded interleaving of mode, deep dive, apply and resize lea']
	ok   tests/chaos-company-intelligence.spec.mjs:185 declared=30000 budget=30000 [test at line 149 'Chaos J1: seeded interleaving of mode, deep dive, apply and resize lea']
	ok   tests/chaos-company-intelligence.spec.mjs:214 declared=30000 budget=30000 [test at line 201 'Chaos J2: twelve applies on an unchanged subject refetch no bar file a']
	ok   tests/chaos-company-intelligence.spec.mjs:249 declared=30000 budget=30000 [test at line 235 'Chaos J3: interleaved subject switches settle on the last subject and']
	ok   tests/chaos-company-intelligence.spec.mjs:263 declared=30000 budget=30000 [test at line 235 'Chaos J3: interleaved subject switches settle on the last subject and']
	ok   tests/chaos-company-intelligence.spec.mjs:295 declared=30000 budget=30000 [test at line 283 'Chaos J3b: a slow committed event file cannot land under a later subje']
	ok   tests/chaos-company-intelligence.spec.mjs:307 declared=30000 budget=30000 [test at line 283 'Chaos J3b: a slow committed event file cannot land under a later subje']
	ok   tests/chaos-company-intelligence.spec.mjs:324 declared=30000 budget=30000 [test at line 317 'Chaos J4: navigating away and back recomposes the same reading and lea']
	ok   tests/chaos-company-intelligence.spec.mjs:325 declared=30000 budget=30000 [test at line 317 'Chaos J4: navigating away and back recomposes the same reading and lea']
--- omitted 129 line(s); sha256 above covers the full output ---
--- last 20 ---
	ok   tests/simple-production-wiring.spec.mjs:518 declared=600000 budget=600000 [awaitDeclaredHydrationBoundary() <- test at line 205 'TP-15-03 market-heatmap Simple renders real steerable controls and act']
	ok   tests/simple-production-wiring.spec.mjs:539 declared=60000 budget=900000 [openAndAwaitOwnerEvidence() <- test at line 857 'TP-15-04 every wired ordinary tool paints its real Simple adapter pane']
	ok   tests/simple-production-wiring.spec.mjs:543 declared=60000 budget=900000 [openAndAwaitOwnerEvidence() <- test at line 857 'TP-15-04 every wired ordinary tool paints its real Simple adapter pane']
	ok   tests/simple-production-wiring.spec.mjs:580 declared=30000 budget=900000 [driveSimpleAndAwaitBridge() -> driveUntilOwnerParity() <- test at line 857 'TP-15-04 every wired ordinary tool paints its real Simple adapter pane']
	ok   tests/simple-production-wiring.spec.mjs:664 declared=30000 budget=900000 [assertNativeSimpleDemotion() <- test at line 857 'TP-15-04 every wired ordinary tool paints its real Simple adapter pane']
	ok   tests/swing-structure-freshness.spec.mjs:48 declared=20000 budget=30000 [test at line 15 'Regression: Swing replaces recently stamped legacy MSFT rows with the']
	ok   tests/swing-structure-freshness.spec.mjs:92 declared=20000 budget=30000 [test at line 62 'Regression: Swing keeps a current Pages snapshot cache-first']
	ok   tests/tool-discovery.spec.mjs:147 declared=15000 budget=30000 [test at line 128 'Regression: existing tool routes and journeys remain reachable after r']
	ok   tests/tool-experience.spec.mjs:825 declared=15000 budget=30000 [test at line 815 'Regression: SCN-012B-007/008 an induced reversal boot failure resolves']
	ok   tests/tool-experience.spec.mjs:873 declared=15000 budget=30000 [test at line 864 'Regression: SCN-012B-007 the reverted catch leaves the observer unreso']
	ok   tests/tool-experience.spec.mjs:882 declared=2000 budget=30000 [test at line 864 'Regression: SCN-012B-007 the reverted catch leaves the observer unreso']
	ok   tests/tool-experience.spec.mjs:894 declared=15000 budget=30000 [test at line 889 'Regression: SCN-012B-009 a successful boot returns view state identica']
	ok   tests/trend-dynamics-cycle-lab.spec.mjs:1037 declared=60000 budget=180000 [test at line 985 'Regression: maximum work plan reports progress cancels atomically and']
	ok   tests/trend-dynamics-cycle-lab.spec.mjs:1042 declared=60000 budget=180000 [test at line 985 'Regression: maximum work plan reports progress cancels atomically and']
	ok   tests/volatility-sizing-lab.spec.mjs:714 declared=15000 budget=30000 [test at line 708 'Regression: SCN-027-012 the catalog binding is discriminating on its o']
	ok   tests/volatility-sizing-lab.spec.mjs:961 declared=20000 budget=30000 [test at line 953 'Regression: SCN-027-013 the catalog-miss notice keeps naming the asset']
	ok   tests/volatility-sizing-lab.spec.mjs:985 declared=20000 budget=30000 [test at line 953 'Regression: SCN-027-013 the catalog-miss notice keeps naming the asset']
	ok   tests/web-evidence.spec.mjs:77 declared=15000 budget=30000 [openBrief() <- test at line 109 'Regression: SCN-012-006 one-origin material claim is rejected and no c']
	????  tests/company-intelligence-lab.spec.mjs:224 declared=READ_BOUND_WATCHDOG_MS — not a literal and not a module constant, so unevaluated
[timeout-budgets] OK — every declared wait fits the test budget that governs it
```

The second routed finding is grounded by the current carrier header and the current selftest
expectation. The header says fault-injection cases either pass through `page.route()` unchanged or
use a real withholding server. `scripts/selftest.mjs` still requires the older three-sentence
wording that specifically says annotated cases use `page.route()` to hold or delay a request and
that `route.continue()` forwards it. The expectation therefore fails on stale provenance wording,
not on the production helper.

### Resumed Immutable-Carrier And Change-Boundary Receipt

**Phase:** implement
**Command:** `printf '%s\n' '762c332c67d6c39f69b3cf86e3c92643599839bc6073c38636cc12832cdfc106  tests/company-intelligence.unit.mjs' '775170cae6a7fa5c0687985f657a206dedd79949388d517e8cdd36227024defe  tests/company-intelligence-lab.spec.mjs' | timeout 30 sha256sum --check --strict - && timeout 30 git diff --check -- company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js scripts/selftest.mjs notes/company-intelligence-lab.md specs/_bugs/BUG-025-company-corpus-read-never-settles && printf '%s\n' 'BUG025_DIFF_CHECK_EXIT=0' && timeout 30 git status --short`
**Exit Code:** 0
**Claim Source:** executed

The command used the two literal hashes already recorded in the earlier implementation boundary
receipt. It did not invent a new pre-change snapshot.

```text
tests/company-intelligence.unit.mjs: OK
tests/company-intelligence-lab.spec.mjs: OK
BUG025_DIFF_CHECK_EXIT=0
 M README.md
 M company-intelligence-lab.html
 M company-intelligence.config.json
 M docs/DomainModel.md
 M notes/company-intelligence-lab.md
 M rlcompanyintel.js
 M rlportfolio.js
 M rlportfoliobrief.js
 M scripts/selftest.mjs
 M scripts/validate-test-file-reachability.baseline
 M scripts/verify-spec008-scope-claims.mjs
 M specs/007-technical-analysis-decision-lab/scopes/01-capability-foundation/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/02-technique-engine/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/03-setup-lifecycle/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/04-five-gate-synthesis/report.md
 M specs/007-technical-analysis-decision-lab/scopes/04-five-gate-synthesis/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/05-owner-publication/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/06-comparison-optional-evidence/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/07-validation-risk-process/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/08-experience-publication/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/09-regression-closure/scope.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/report.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/scopes.md
 M specs/008-portfolio-survival-and-brief-lab/test-plan.json
 M specs/_bugs/BUG-002-market-brief-session-date-drift/uservalidation.md
 M tests/company-intelligence-lab.spec.mjs
 M tests/company-intelligence.unit.mjs
 M tests/portfolio-brief.functional.mjs
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/
```

The status output confirms the wider workspace remains dirty. This phase did not reset, stash,
clean, stage, commit, or modify the excluded BUG-026, BUG-002, Specs 007/008, portfolio, README,
DomainModel, reachability-baseline, or unrelated test families.

<a name="independent-test-phase-2026-08-31"></a>
## Independent Test Phase — 2026-08-31

This section supersedes only the earlier statement that independent verification was absent and
the repository selftest was non-green. It does not supersede historical RED or implementation
receipts. Scope 1 remains `In Progress`, top-level status and `certification.*` remain unchanged,
and the clean test result is routed to `bubbles.regression` for the next registered phase.

The current test carriers were inspected before execution. The browser carrier derives
`REQUIRED_READ_BOUND_MS` from the committed configuration, declares a mechanically evaluable
`15000` ms harness watchdog, and asserts that its margin equals exactly half the committed
`10000` ms product bound. Its header distinguishes unmodified ordinary traffic, annotated
pass-through interception, and real-server response withholding. The focused cases cover invalid
embedded configuration with zero requests, a headers-plus-partial-body stall, request abort, an
inside-bound success, and served-configuration expiry. The timer tracker records one timer per
request and the suite asserts cleanup after success, abort, HTTP failure, malformed data, and
`file://` transport failure.

The scenario resolver exited zero but reported zero references because this bug-filing-era
manifest carries `plannedTest` fields rather than `linkedTests`. That output is not used as title
resolution evidence. Each of the three declared titles was instead matched in the current test
source and executed by the focused browser command below.

<a name="test-phase-focused-unit"></a>
### Independent Focused Unit Receipt

**Phase:** test
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 independent focused unit" -- timeout 180 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 independent focused unit
$ timeout 180 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 622
sha256: b579b06bdae9202faf9b08683fac5e17be527dc0fa01cc084f3149711fb92f7d
--- first 20 ---
TAP version 13
# Subtest: coverage account holds one row per registry dimension and totals sum to the registry length
ok 1 - coverage account holds one row per registry dimension and totals sum to the registry length
	---
	duration_ms: 9.07387
	type: 'test'
	...
# Subtest: SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
ok 2 - SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
	---
	duration_ms: 3.778988
	type: 'test'
	...
# Subtest: every one of the five evidence states is produced by a real adapter outcome
ok 3 - every one of the five evidence states is produced by a real adapter outcome
	---
	duration_ms: 4.349586
	type: 'test'
	...
--- omitted 582 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 101 - 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
	---
	duration_ms: 0.937497
	type: 'test'
	...
# Subtest: 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
ok 102 - 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
	---
	duration_ms: 7.067976
	type: 'test'
	...
1..102
# tests 102
# suites 0
# pass 102
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 452.356385
```

<a name="test-phase-focused-browser"></a>
### Independent Focused Browser Receipt

**Phase:** test
**Command:** `timeout 660 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 independent focused browser" -- timeout 600 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 independent focused browser
$ timeout 600 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 0
lines: 10
sha256: bd32caef2acdeff41d324640c8a3bef1967f8bcfd7bc1bcd5f8c95ee9aaf1f32
--- output ---

Running 5 tests using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:303:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (597ms)
	✓  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:331:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.5s)
	✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:353:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.4s)
	✓  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:376:1 › Regression: BUG-025 an inside-bound response settles normally (3.6s)
	✓  5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:409:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.4s)

	5 passed (41.5s)
```

<a name="test-phase-complete-browser"></a>
### Independent Complete Company Intelligence Browser Receipt

**Phase:** test
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 independent complete Company Intelligence browser" -- timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 independent complete Company Intelligence browser
$ timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 52
sha256: 7d37ce9a145359be1adf0fe875fb4e76ebb892212ceb720e934ce93c12690781
--- first 20 ---

Running 47 tests using 1 worker

	✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:303:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (644ms)
	✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:331:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.4s)
	✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:353:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.4s)
	✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:376:1 › Regression: BUG-025 an inside-bound response settles normally (3.5s)
	✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:409:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.2s)
	✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:514:1 › four horizon regions render with four summaries and four deep-dive controls (785ms)
	✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:543:1 › Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction (648ms)
	✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:574:1 › an owned dimension renders a deep link whose target is a registered route (725ms)
	✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:618:1 › every rendered numeric value carries a provenance chip, a source name and an as-of date (747ms)
	✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:645:1 › Regression: SCN-025-021 an unavailable dimension renders a named absence and never a dash or a zero (789ms)
	✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:679:1 › Regression: SCN-025-021 a scripted narrative string renders as visible escaped text (785ms)
	✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:704:1 › a position, size or cost basis entry is refused in the browser and nothing is stored (754ms)
	✓  13 [system-chrome] › tests/company-intelligence-lab.spec.mjs:730:1 › each canvas draws non-blank pixels and pairs with a table holding the same values (1.2s)
	✓  14 [system-chrome] › tests/company-intelligence-lab.spec.mjs:777:1 › the route defers no drawing and schedules no repeating timer (530ms)
	✓  15 [system-chrome] › tests/company-intelligence-lab.spec.mjs:806:1 › switching the mode segment triggers no request and no recomposition (726ms)
	✓  16 [system-chrome] › tests/company-intelligence-lab.spec.mjs:828:1 › FR-025-017 a second run reuses the cached corpus and refetches no committed bar file (928ms)
	✓  17 [system-chrome] › tests/company-intelligence-lab.spec.mjs:872:1 › at 375 CSS pixels the four summaries stack and the document never scrolls sideways (707ms)
--- omitted 12 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓  30 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1358:1 › Stabilize: the route writes only the shared data container and leaves a sibling tool cache intact (600ms)
	✓  31 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1385:1 › Stabilize: repeat composition of an unchanged subject issues no further request (890ms)
	✓  32 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1417:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (4.9s)
	✓  33 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1455:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.4s)
	✓  34 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1491:1 › Chaos: a background corpus paint does not close a deep dive the reader opened (5.5s)
	✓  35 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1527:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (463ms)
	✓  36 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1573:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (591ms)
	✓  37 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1644:1 › every interactive control on the route is reachable and operable from the keyboard alone (1.6s)
	✓  38 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1790:1 › Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read (1.7s)
	✓  39 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1829:1 › Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card (818ms)
	✓  40 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1878:1 › Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href (616ms)
	✓  41 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1923:1 › Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company (1.3s)
	✓  42 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1943:1 › Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject (2.1s)
	✓  43 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1995:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (667ms)
	✓  44 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2083:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (559ms)
	✓  45 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2209:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel (468ms)
	✓  46 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2231:1 › Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel (555ms)
	✓  47 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2267:1 › Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel (466ms)

	47 passed (1.4m)
```

<a name="test-phase-repository-selftest"></a>
### Independent Repository Selftest Receipt

**Phase:** test
**Command:** `timeout 960 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 corrected final repository selftest" -- timeout 900 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 corrected final repository selftest
$ timeout 900 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: 2a512188bf35b9dacced9d3a4beddb5d686b530fe835bdcce2f8c3789b79831e
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3866 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (94 claim(s) across 71 packet(s), 80 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 94 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

<a name="gaps-phase-2026-08-31"></a>
## Gaps Phase — 2026-08-31

This phase validated the inherited Research Lab repository packet at control revision 1 before
reading the packet or working tree. It then read every BUG-025 packet artifact, the current
Company Intelligence source and test carriers, the simplify evidence, the project command
registry, and the registered page-check surface. The audit made no production, test, note,
command-registry, planning, user-validation, or certification change.

The bounded-acquisition implementation matches every functional requirement and acceptance
criterion. One design lifecycle branch has no persistent regression: a synchronous setup failure
inside `readRouteDocument()` is handled by the current catch and timer cleanup, but no test makes
that branch execute. Two planning-linkage gaps also remain. The scope does not name implementation
paths in the form consumed by the reality scan, and the scenario manifest still carries
`plannedTest` rather than mechanically resolvable `linkedTests` entries.

### Repository Binding

**Phase:** gaps
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file <validated inherited packet>`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:1 revision=1
```

The exact actionable decision preserved by this phase is
`repositoryRoot=/home/philipk/research-lab`, `repositoryAlias=research-lab`,
`sessionId=vscode-20072c8d3f74af455af2514e746fced3`,
`decisionId=rb:vscode-20072c8d3f74af455af2514e746fced3:1`, `controlRevision=1`, and
`controlPathDigest=sha256:7e982c9a1b25048dd68c8c758dbc39cdc603988bddfe07251568ed72f9d0becc`.

### Requirement And Acceptance-Criterion Trace

**Claim Source:** interpreted
**Interpretation:** Each status below combines current source inspection with the current executed
unit and browser carriers. A passing carrier is not used to infer a path it does not assert.

| Contract | Current implementation and persistent proof | Status |
| --- | --- | --- |
| FR-025-001 — explicit validated bound | The committed and embedded configurations declare `/v2` and `readBoundMs: 10000`; `readCoverageRegistry()` rejects every non-positive or non-safe-integer value; the 102-case unit carrier exercises the accepted and rejected matrix. | MATCH |
| FR-025-002 — every route-owned fetch uses the bound | `readConfig()`, `loadOne()`, and `loadOptionalJson()` call `readRouteDocument()`. Events, authored plan, current pointer, and every version record reach the helper through `loadOptionalJson()`. The structural unit assertion permits one production `fetch()` site inside the helper. | MATCH |
| FR-025-003 — expiry aborts the request | The helper creates a controller per invocation and calls `controller.abort()` from the bound timer. Focused browser cases require the real server to observe connection close for both no-headers and partial-body stalls. | MATCH |
| FR-025-004 — honest existing outcomes | `readConfig()` retains embedded configuration only for transport unavailability; bar and optional-document failures map to their existing unavailable outcomes. The focused cases require established readiness and named unavailable coverage. | MATCH |
| FR-025-005 — network-independent first paint | `boot()` calls `paintFromEmbedded()` before `readConfig()`. Every held-response focused case observes a composed four-horizon embedded paint while the selected request remains open. | MATCH |
| FR-025-006 — inside-bound success | The browser carrier releases a real bar response at 30% of the committed bound and requires loaded current data, no abort classification, one request, and zero live helper timers. | MATCH |
| FR-025-007 — both boundary sides | The persistent browser carrier includes never-answering no-header, partial-body, served-config, and inside-bound cases. The current focused run passed all five BUG-025 cases. | MATCH |
| AC-1 and AC-2 — abort and settled unavailable account | Focused cases 2 and 3 observe the server-side abort, established readiness, named reason code, and readable absence statement. | MATCH |
| AC-3 — accepted slow response | Focused case 4 loads the released response and rejects an abort classification. | MATCH |
| AC-4 — first paint precedes release | `expectEmbeddedFirstPaintBeforeRelease()` checks request entry, no release, no abort, four horizons, pending corpus status, and not-established readiness. | MATCH |
| AC-5 — complete route and repository regressions | The current complete browser carrier reported 47 passes and the current repository selftest reported 3437 passes. | MATCH |

### Design Lifecycle And Failure-Mode Trace

**Claim Source:** interpreted
**Interpretation:** The current helper, caller chain, and persistent tests were inspected one path
at a time. The one unexecuted lifecycle branch is retained as `BUG-025-GAPS-001` rather than
inferred from catch syntax.

| Required path | Current disposition |
| --- | --- |
| Response-body timeout | Covered by the partial-body event response. Headers and one body fragment arrive, the body remains open, the browser aborts it, and the reading settles unavailable. |
| Synchronous setup failure | The helper's outer `try/catch` clears an armed timer and returns a classified rejected promise if controller, timer, or fetch setup throws. No persistent test removes or throws one of those browser primitives, so cleanup and caller behavior are UNTESTED. |
| Transport failure | The `file://` browser case exercises rejected same-origin reads, reaches an established composed account, and requires zero active helper timers. |
| HTTP failure | The complete carrier's corpus-outage case serves real 404 responses for every committed source and requires unavailable settled output plus zero active helper timers. |
| Malformed JSON | The complete carrier supplies malformed committed documents and malformed served configuration, then checks unavailable or named refusal behavior and timer cleanup. |
| Per-request isolation | `readRouteDocument()` allocates controller, timer, and expiry state as function-local values on every invocation. The unit carrier requires all request families to call that helper and only that helper to own acquisition state. |
| Timer cleanup | Browser assertions cover success, abort before headers, abort during body consumption, HTTP failure, malformed documents, malformed served configuration, and `file://` transport failure. The synchronous setup branch remains the one missing execution path. |
| No retry | Each held path is counted at the real server and must be requested exactly once. The structural unit assertion permits exactly one fetch call inside each helper invocation. |
| No defaults | Invalid or absent `readBoundMs` fails loud; no caller duration exists; the implementation-reality scan found zero fallback/default violations. |
| First paint | Embedded configuration is validated and rendered before the served configuration request. Held-response tests observe that paint before release or expiry. |
| Configuration mirror and version | The unit carrier parses the inert `application/json` block with `JSON.parse`, requires deep equality with the committed file, and checks `/v2` plus `10000`. |
| Every request family | Served config and bars call the helper directly. Event, authored plan, current pointer, and recursive version-record reads all call it through `loadOptionalJson()`. The complete outage and malformed-document cases enumerate those committed paths. |
| Rendered settled account | The helper outcomes flow through `loadCorpus()` to `run()`. Focused abort cases require `data-reading-readiness="established"` and named unavailable rows; the accepted side requires loaded current performance. |

### Scope, Test Plan, DoD, And Scenario Coherence

The scope has three Gherkin scenarios, five Test Plan rows, and eight unchecked DoD items. The
three scenario titles have exact persistent browser counterparts. Each Test Plan row maps to a DoD
claim, and each unchecked DoD item retains its uncertainty declaration while certification remains
at 0 of 8.

Two mechanical planning links remain incomplete:

1. `scenario-manifest.json` names each existing test under `plannedTest`. The canonical resolver
	 reads `linkedTests`, so it resolved zero references despite all three titles existing and running.
2. The scope's implementation plan names steps but supplies no implementation paths in the form
	 consumed by `implementation-reality-scan.sh`. The scan recovered six files from `design.md` and
	 emitted one warning.

The scope also lacks a scenario, Test Plan row, and DoD item for the design's synchronous setup
failure branch. Planning ownership must add that contract before test ownership can add the
persistent negative case. Current source is not changed on inspection alone.

### Current Verification Receipts

<a name="gaps-phase-focused-unit"></a>
#### Focused Unit Carrier

**Phase:** gaps
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 gaps focused unit" -- timeout 180 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 gaps focused unit
$ timeout 180 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 110
sha256: 1cefb86af2750e53edb8c201bb5f2f19fe861aa6f76d9310f6cb6e992a3c8595
--- last 12 ---
✔ 027 security — no hostile subject can give the composed owner href a scheme, an authority, a second parameter or a fragment (3.473289ms)
✔ 027 security — the receiver refuses every hostile subject outright and returns no field carrying it (1.099197ms)
✔ 027 security — an accepted subject cannot leave data/options/, cannot become a storage key and cannot reach a prototype (2.824592ms)
✔ 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup (1.055297ms)
✔ 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes (6.067581ms)
ℹ tests 102
ℹ suites 0
ℹ pass 102
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 365.201552
```

<a name="gaps-phase-focused-browser"></a>
#### Focused Browser Carrier

**Phase:** gaps
**Command:** `timeout 660 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 gaps focused browser" -- timeout 600 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 gaps focused browser
$ timeout 600 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 0
lines: 10
sha256: ee5c0146410e8a845e65d7332b898babb18f1a68a3f10c78a6c012e40def8b42
--- output ---

Running 5 tests using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:303:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (710ms)
	✓  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:331:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.6s)
	✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:353:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.4s)
	✓  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:376:1 › Regression: BUG-025 an inside-bound response settles normally (3.6s)
	✓  5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:409:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.4s)

	5 passed (41.8s)
```

<a name="gaps-phase-complete-browser"></a>
#### Complete Browser Carrier

**Phase:** gaps
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 gaps complete Company Intelligence browser" -- timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 gaps complete Company Intelligence browser
$ timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 52
sha256: 7ef91d4e5f260b2f2881a92ddda443525c2a30e5f413dc2d9acecf6c8eee3cb0
--- first 5 ---

Running 47 tests using 1 worker

	✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:303:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (676ms)
	✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:331:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.4s)
--- last 5 ---
	✓  44 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2083:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (578ms)
	✓  45 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2209:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel (408ms)
	✓  46 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2231:1 › Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel (543ms)
	✓  47 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2267:1 › Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel (378ms)

	47 passed (1.3m)
```

<a name="gaps-phase-repository-selftest"></a>
#### Repository Selftest

**Phase:** gaps
**Command:** `timeout 960 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 gaps repository selftest" -- timeout 900 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 gaps repository selftest
$ timeout 900 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: 80d84db5fd12cfd7d75fc2114a4e466149eb489cfca5c6b2e4d9b524fd7f9c1b
--- last 10 ---
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 94 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

<a name="gaps-phase-reality-scan"></a>
#### Implementation-Reality Scan

**Phase:** gaps
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 gaps implementation reality" -- timeout 240 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --verbose`
**Exit Code:** 0
**Claim Source:** executed

```text
ℹ️  INFO: Scopes yielded 0 files — falling back to design.md for file discovery
⚠️  WARN: Resolved 6 file(s) from design.md fallback — scopes.md should reference these directly
ℹ️  INFO: Resolved 6 implementation file(s) to scan

--- Scan 1: Gateway/Backend Stub Patterns ---
--- Scan 1B: Handler / Endpoint Execution Depth ---
--- Scan 1C: Endpoint Not-Implemented / Placeholder Responses ---
--- Scan 1D: External Integration Authenticity ---
--- Scan 2: Frontend Hardcoded Data Patterns ---
--- Scan 2B: Sensitive Client Storage ---
--- Scan 3: Frontend API Call Absence ---
--- Scan 4: Prohibited Simulation Helpers in Production ---
--- Scan 5: Default/Fallback Value Patterns ---
--- Scan 6: Live-System Test Interception ---
--- Scan 7: IDOR / Auth Bypass Detection (Gate G047) ---
--- Scan 8: Silent Decode Failure Detection (Gate G048) ---

============================================================
	IMPLEMENTATION REALITY SCAN RESULT
============================================================

	Files scanned:  6
	Violations:     0
	Warnings:       1

🟡 PASSED with 1 warning(s) — manual review advised
```

<a name="gaps-phase-scenario-linkage"></a>
#### Scenario-Test Resolver

**Phase:** gaps
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 gaps scenario-test resolution" -- timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** Exit zero proves every declared `linkedTests` entry resolves. The count of zero
shows the current manifest declares no such entries, so this output cannot prove any of the three
existing persistent browser links.

```text
[scenario-test-resolve] OK — 0 reference(s) resolved via literal-scan
```

<a name="gaps-phase-page-check"></a>
#### Registered Page Check And Carried Finding

The command is not ad hoc. `.specify/memory/agents.md` requires the exact per-page check for every
changed single-file tool, and the linked Feature 025 Scope 2 Test Plan records the same command for
this page. The command parses every non-`src` script with `new Function()`, including the inert
configuration mirror. The current execution therefore fails before it reaches the executable page
script.

An existing committed validator handles the inert block correctly:
`tests/company-intelligence.unit.mjs` selects the `type="application/json"` block, parses it with
`JSON.parse`, and compares the complete object to `company-intelligence.config.json`. The 102-case
unit command passed. The 47-case browser command also executed the actual route, whose boot calls
`byId()` for every declared element identity. Those passes close any BUG-025 source or test
question raised by this one-liner, but they do not make a required command that exits 1 correct.

`BUG-025-SIMPLIFY-GAP-001` is therefore a confirmed independent command-surface defect. It does not
change the bounded-acquisition verdict and requires no BUG-025 source or test edit. It is routed to
`bubbles.bug` for a separately owned packet covering the project command registry and discriminating
validator coverage. This phase does not edit the registry or invent a replacement validator.

**Phase:** gaps
**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 gaps registered page check" -- env PAGE=company-intelligence-lab.html timeout 60 node -e '<exact registered one-liner>'`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025 gaps registered page check
exit: 1
lines: 17
sha256: 1f8854e5c32a8d77df91949ddb78a7d54c4903f411bcdccd0604975c58951401
--- output ---
[eval]:1
const fs=require("node:fs");const p=process.env.PAGE;if(!p)throw new Error("PAGE is required");const h=fs.readFileSync(p,"utf8");const scripts=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());if(!scripts.length)throw new Error("no inline script: "+p);scripts.forEach((s,i)=>{try{new Function(s)}catch(e){throw new Error("inline script "+(i+1)+": "+e.message)}});
																			^

Error: inline script 1: Unexpected identifier 'is'
		at [eval]:1:365
		at Array.forEach (<anonymous>)
		at [eval]:1:314
		at runScriptInThisContext (node:internal/vm:219:10)
		at node:internal/process/execution:451:12
		at [eval]-wrapper:6:24
		at runScriptInContext (node:internal/process/execution:449:60)
		at evalFunction (node:internal/process/execution:283:30)
		at evalTypeScript (node:internal/process/execution:295:3)
		at node:internal/main/eval_string:71:3
Node.js v24.12.0
```

### Finding Accounting

| Finding | Goal impact | Disposition | Owner route |
| --- | --- | --- | --- |
| `BUG-025-ROUTE-006` | Phase routing | Addressed. The gaps phase executed against the exact inherited packet. | None |
| `BUG-025-GAPS-001` | Required | UNTESTED: the design's synchronous acquisition-setup failure and timer-cleanup branch has no persistent scenario, Test Plan row, DoD item, or execution. | `BUG-025-ROUTE-007` to `bubbles.plan`; test ownership follows the corrected plan. |
| `BUG-025-GAPS-002` | Required | PARTIAL: the three persistent browser titles exist and pass, but `scenario-manifest.json` exposes only `plannedTest`; the canonical resolver resolves zero links. | `BUG-025-ROUTE-007` to `bubbles.plan`. |
| `BUG-025-GAPS-003` | Required | PARTIAL: `scopes.md` has no implementation path references usable by the reality scan, which had to recover six paths from `design.md`. | `BUG-025-ROUTE-007` to `bubbles.plan`. |
| `BUG-025-SIMPLIFY-GAP-001` | Independent | Confirmed command-registry defect, not a bounded-acquisition defect. The required one-liner executes inert JSON as JavaScript; committed unit and browser validators handle the page correctly. | `BUG-025-ROUTE-008` to `bubbles.bug` for an independent packet. |

## Discovered Issues

| Observed | Description | Disposition | Reference |
| --- | --- | --- | --- |
| 2026-08-31 | Synchronous setup failure is implemented but has no persistent negative regression or planning linkage. | routed | `state.json` transition request `BUG-025-ROUTE-007` |
| 2026-08-31 | Scenario and implementation paths are not mechanically linked from current planning artifacts. | routed | `state.json` transition request `BUG-025-ROUTE-007` |
| 2026-08-31 | The required per-page command executes an inert `application/json` block as JavaScript and exits 1. | routed | `state.json` transition request `BUG-025-ROUTE-008` |

### Gaps Verdict

⚠️ MINOR_GAPS_REMAIN

The production behavior passed the declared focused, complete-browser, and repository carriers,
and no source divergence was found. The gaps phase cannot declare `GAP_FREE` because one design
failure branch lacks persistent proof and two planning links remain incomplete. Scope 1, top-level
status, and all certification fields remain in progress. The in-scope owner route is
`BUG-025-ROUTE-007` to `bubbles.plan`. The independent page-check defect is separately routed by
`BUG-025-ROUTE-008` to `bubbles.bug`. `bubbles.harden` is not yet eligible.

<a name="test-phase-carrier-quality"></a>
### Test-Carrier Quality And Repaired-Finding Receipt

**Phase:** test
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 regression quality audit" -- timeout 180 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 regression quality audit
$ timeout 180 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 16
sha256: 28952cbf7ae377fb0f54bb49de9f794fbd14360cda5a6a7c1ae9d85770e95c11
--- output ---
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: ~/research-lab
	Timestamp: 2026-08-31T05:42:26Z
	Bugfix mode: true
============================================================

ℹ️  Scanning tests/company-intelligence-lab.spec.mjs
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs

============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 1
	Files with adversarial signals: 1
============================================================
```

The corrected direct skip-marker scan emitted
`BUG025_SKIP_MARKER_AUDIT=PASS zero matches` for both test carriers. The first attempt used an
unnecessary nested shell wrapper; it was immediately repeated directly and only the direct result
is relied upon.

<a name="test-phase-timeout-budget"></a>
### Mechanically Evaluated Watchdog Receipt

**Phase:** test
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 timeout-budget carrier audit" -- timeout 180 node scripts/validate-playwright-timeout-budgets.mjs --explain`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 timeout-budget carrier audit
$ timeout 180 node scripts/validate-playwright-timeout-budgets.mjs --explain
exit: 0
lines: 170
sha256: 50b70bc61221ffcafaf8a4e8e930def2b74f9fe7e60cb53bb7c4b309242609a4
--- first 20 ---
[timeout-budgets] scanned=80 tests=838 declarations=168 evaluated=168 unattributed=0 unresolved=0 violations=0 default=30000ms (playwright-default (config declares none))
	ok   tests/attention-browser.spec.mjs:135 declared=30000 budget=30000 [openBrief() <- test at line 1509 'a configured action floor of zero is honoured rather than swallowed by']
	ok   tests/attention-browser.spec.mjs:328 declared=30000 budget=90000 [test at line 318 'a shut decision card shows a visible cue naming what opening it reveal']
	ok   tests/attention-browser.spec.mjs:1367 declared=30000 budget=90000 [test at line 1327 'SCN-017-063 The record renders the published reduction, not a recomput']
	ok   tests/bond-regime-lab.spec.mjs:345 declared=10000 budget=30000 [openFromSharedCache() -> openWithSnapshot() <- test at line 164 'BS-001 duration-driven ratio improvement stays mixed']
	ok   tests/causal-rotation-chaos.spec.mjs:36 declared=2000 budget=30000 [clickIfReachable() <- test at line 40 'Regression: stochastic causal usage never throws, blanks, or manufactu']
	ok   tests/causal-rotation-chaos.spec.mjs:61 declared=2000 budget=30000 [test at line 40 'Regression: stochastic causal usage never throws, blanks, or manufactu']
	ok   tests/causal-rotation-chaos.spec.mjs:70 declared=2000 budget=30000 [test at line 40 'Regression: stochastic causal usage never throws, blanks, or manufactu']
	ok   tests/causal-rotation-chaos.spec.mjs:81 declared=2000 budget=30000 [test at line 40 'Regression: stochastic causal usage never throws, blanks, or manufactu']
	ok   tests/chaos-company-intelligence.spec.mjs:91 declared=30000 budget=30000 [open() <- test at line 149 'Chaos J1: seeded interleaving of mode, deep dive, apply and resize lea']
	ok   tests/chaos-company-intelligence.spec.mjs:92 declared=30000 budget=30000 [open() <- test at line 149 'Chaos J1: seeded interleaving of mode, deep dive, apply and resize lea']
	ok   tests/chaos-company-intelligence.spec.mjs:179 declared=30000 budget=30000 [test at line 149 'Chaos J1: seeded interleaving of mode, deep dive, apply and resize lea']
	ok   tests/chaos-company-intelligence.spec.mjs:185 declared=30000 budget=30000 [test at line 149 'Chaos J1: seeded interleaving of mode, deep dive, apply and resize lea']
	ok   tests/chaos-company-intelligence.spec.mjs:214 declared=30000 budget=30000 [test at line 201 'Chaos J2: twelve applies on an unchanged subject refetch no bar file a']
	ok   tests/chaos-company-intelligence.spec.mjs:249 declared=30000 budget=30000 [test at line 235 'Chaos J3: interleaved subject switches settle on the last subject and']
	ok   tests/chaos-company-intelligence.spec.mjs:263 declared=30000 budget=30000 [test at line 235 'Chaos J3: interleaved subject switches settle on the last subject and']
	ok   tests/chaos-company-intelligence.spec.mjs:295 declared=30000 budget=30000 [test at line 283 'Chaos J3b: a slow committed event file cannot land under a later subje']
	ok   tests/chaos-company-intelligence.spec.mjs:307 declared=30000 budget=30000 [test at line 283 'Chaos J3b: a slow committed event file cannot land under a later subje']
	ok   tests/chaos-company-intelligence.spec.mjs:324 declared=30000 budget=30000 [test at line 317 'Chaos J4: navigating away and back recomposes the same reading and lea']
	ok   tests/chaos-company-intelligence.spec.mjs:325 declared=30000 budget=30000 [test at line 317 'Chaos J4: navigating away and back recomposes the same reading and lea']
--- omitted 130 line(s); sha256 above covers the full output ---
--- last 20 ---
	ok   tests/simple-production-wiring.spec.mjs:322 declared=30000 budget=600000 [test at line 205 'TP-15-03 market-heatmap Simple renders real steerable controls and act']
	ok   tests/simple-production-wiring.spec.mjs:518 declared=600000 budget=600000 [awaitDeclaredHydrationBoundary() <- test at line 205 'TP-15-03 market-heatmap Simple renders real steerable controls and act']
	ok   tests/simple-production-wiring.spec.mjs:539 declared=60000 budget=900000 [openAndAwaitOwnerEvidence() <- test at line 857 'TP-15-04 every wired ordinary tool paints its real Simple adapter pane']
	ok   tests/simple-production-wiring.spec.mjs:543 declared=60000 budget=900000 [openAndAwaitOwnerEvidence() <- test at line 857 'TP-15-04 every wired ordinary tool paints its real Simple adapter pane']
	ok   tests/simple-production-wiring.spec.mjs:580 declared=30000 budget=900000 [driveSimpleAndAwaitBridge() -> driveUntilOwnerParity() <- test at line 857 'TP-15-04 every wired ordinary tool paints its real Simple adapter pane']
	ok   tests/simple-production-wiring.spec.mjs:664 declared=30000 budget=900000 [assertNativeSimpleDemotion() <- test at line 857 'TP-15-04 every wired ordinary tool paints its real Simple adapter pane']
	ok   tests/swing-structure-freshness.spec.mjs:48 declared=20000 budget=30000 [test at line 15 'Regression: Swing replaces recently stamped legacy MSFT rows with the']
	ok   tests/swing-structure-freshness.spec.mjs:92 declared=20000 budget=30000 [test at line 62 'Regression: Swing keeps a current Pages snapshot cache-first']
	ok   tests/tool-discovery.spec.mjs:147 declared=15000 budget=30000 [test at line 128 'Regression: existing tool routes and journeys remain reachable after r']
	ok   tests/tool-experience.spec.mjs:825 declared=15000 budget=30000 [test at line 815 'Regression: SCN-012B-007/008 an induced reversal boot failure resolves']
	ok   tests/tool-experience.spec.mjs:873 declared=15000 budget=30000 [test at line 864 'Regression: SCN-012B-007 the reverted catch leaves the observer unreso']
	ok   tests/tool-experience.spec.mjs:882 declared=2000 budget=30000 [test at line 864 'Regression: SCN-012B-007 the reverted catch leaves the observer unreso']
	ok   tests/tool-experience.spec.mjs:894 declared=15000 budget=30000 [test at line 889 'Regression: SCN-012B-009 a successful boot returns view state identica']
	ok   tests/trend-dynamics-cycle-lab.spec.mjs:1037 declared=60000 budget=180000 [test at line 985 'Regression: maximum work plan reports progress cancels atomically and']
	ok   tests/trend-dynamics-cycle-lab.spec.mjs:1042 declared=60000 budget=180000 [test at line 985 'Regression: maximum work plan reports progress cancels atomically and']
	ok   tests/volatility-sizing-lab.spec.mjs:714 declared=15000 budget=30000 [test at line 708 'Regression: SCN-027-012 the catalog binding is discriminating on its o']
	ok   tests/volatility-sizing-lab.spec.mjs:961 declared=20000 budget=30000 [test at line 953 'Regression: SCN-027-013 the catalog-miss notice keeps naming the asset']
	ok   tests/volatility-sizing-lab.spec.mjs:985 declared=20000 budget=30000 [test at line 953 'Regression: SCN-027-013 the catalog-miss notice keeps naming the asset']
	ok   tests/web-evidence.spec.mjs:77 declared=15000 budget=30000 [openBrief() <- test at line 109 'Regression: SCN-012-006 one-origin material claim is rejected and no c']
[timeout-budgets] OK — every declared wait fits the test budget that governs it
```

This closes `BUG-025-TEST-001`: the validator changed from one unresolved declaration in the
implementation receipt to `168 evaluated`, `0 unresolved`, and `0 violations`. The passing
repository selftest closes `BUG-025-TEST-002`: its active provenance predicate now accepts the
carrier's truthful mixed pass-through and real-server wording and rejects both stale blanket forms.

<a name="test-phase-artifact-lint"></a>
### Independent Artifact-Lint Receipt After Test Handoff State

**Phase:** test
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 post-test-state artifact lint" -- timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 post-test-state artifact lint
$ timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
✅ report.md contains section matching: Summary
✅ report.md contains section matching: Completion Statement
✅ report.md contains section matching: Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ Value-first selection rationale lint skipped (not a value-first report)
✅ Scenario path-placeholder lint skipped (no matching scenario sections found)

=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
```

<a name="final-independent-audit-recheck-2026-09-01"></a>
## Final Independent Audit Recheck — 2026-09-01

### Binding And Complete Chronology Coverage

**Phase:** audit
**Claim Source:** executed

Repository packet validation completed before repository reads with root
`/home/philipk/research-lab`, alias `research-lab`, session
`vscode-0f862ced0188e21d7d00451ceb459e3d`, decision
`rb:vscode-0f862ced0188e21d7d00451ceb459e3d:4`, revision `4`, control digest
`sha256:f048bc37399c341a4a0fe36c254c257274428d583124ef925808c30eef62c3c5`,
explicit-root authority, confirmed transition, command scope, local visibility, and actionable
state. No repository-binding preflight ran.

Every BUG-025 artifact was read. The complete 10,810-line report chronology was covered by its
full-file SHA-256 `c44d3e668fa8f322d7d25dc680a613fddeb6bec1734ee766353717a46ab5e698`,
all 725 headings, and all 375 finding or claim records. The complete 2,056-line state chronology
was covered through three sequential full-file reads plus all 47 execution-history records, 18
completed-phase claims, seven original findings, 35 routes, the audit attempt, and certification
mirrors. The validation closure at
`report.md#validate-audit-rework-adjudication-2026-09-01` earns Scope 1 as `Done` with 15 checked
and zero unchecked DoD rows while both status mirrors remain `in_progress` for certification.

### Original Seven-Finding Matrix

| Finding | Final audit disposition |
| --- | --- |
| `AUDIT-025-EVIDENCE-001` | Addressed. Current-revision validate execution and the 15/0 adjudication are recorded at the validation closure. |
| `AUDIT-025-SLICE-002` | Addressed. This audit covered the complete scope, certification mirrors, report chronology, phase claims, routes, and finding history. |
| `AUDIT-025-DOD-003` | Addressed. The post-repair boundary proves protected identities, admitted deltas, complete path classification, and excluded-family containment. |
| `AUD-BUG025-001` | Addressed. Exact `document.body` focus and the bounded focus-theft discriminator are present in the current audit receipts. |
| `AUD-BUG025-002` | Addressed. Non-deduplicated live-region update counting and the duplicate-announcement discriminator are present in the current audit receipts. |
| `AUD-BUG025-003` | Addressed. `SCN-BUG-025-006` mutates the unique `readEventSource()` subject predicate and its manifest, map, and linked-test identity agree. |
| `AUD-BUG025-004` | Addressed. Design and scope admit only `scripts/scenario-break-map-bug025.json`; the generic runner object is `fa7dbfe93834906dc616dc1ba12ab4a187c29730`, and sibling map objects are `6faa2c561b52df0abcb3a351948171c9fab9747c` and `3934f14cf34809283555f52a0125a990cac4516b`. |

### Current Receipt And Guard Evidence

**Phase:** audit
**Claim Source:** executed

The audit-owned scenario campaigns are recorded in `.specify/runtime/tool-calls.jsonl` lines
1741–1802. Artifact, scenario, state, and repository-selftest checks are recorded at lines
1804–1815. This persistence-only pass did not replay browser tests, repository selftest, or the
full scenario campaign. The installed framework identifies clean source commit
`a75a237179be154e1b0d3600d7a6a5211eb25f49`.

The current strict freshness command exited `0` with 1,817 total receipts, 53 closure-bearing,
53 valid, zero stale, and no stale receipt list. Its bounded output SHA-256 is
`349e1f71d6c79199d059e14d285e648f1745e1957a031062f1cb754380e5a2aa`.
The pre-closeout registry-asserted guard reports Check 43 clean, including no receipt clone, and
fails only on `G061` for the two audit-owned findings/routes and `G022` for the not-yet-recorded
audit phase. Those are closed by this audit-owned state update.

### Final Diagnostic Verdict

`SHIP_IT`

This is an independent delivery-completion diagnostic verdict. It does not certify the top-level
status. `bubbles.validate` remains the next owner for terminal certification.

## Spot-Check Recommendations

1. **Interpreted evidence blocks** — Review the report's interpreted blocks, especially the final
	validate outcome-contract correlation, to confirm each interpretation remains supported by the
	adjoining raw command output.
2. **Exactly-ten-line strict freshness capture** — Verify the 53-valid and zero-stale summary;
	this capture sits exactly at the minimum ten-line output threshold.
3. **Late DoD recheck** — Rows 9 through 11 were reopened and later re-earned after stronger focus,
	announcement, and canonical-subject controls. Verify the named mutation discriminators rather
	than relying only on the green aggregate.
4. **Dirty-tree boundary** — Verify the report's classified 16-path BUG-025 partition and 36-path
	sibling partition. The audit asserts containment, not whole-tree cleanliness.

### Persistence Result Contract

**Phase:** audit
**Claim Source:** executed

The linted `AUDIT_RESULT_V1` for attempt `AUDIT-BUG025-20260901-FINAL-002`, the final
registry-asserted transition result, artifact lint, and strict receipt output are recorded in the
post-closeout evidence appended below. The audit attempt addresses all seven original finding IDs
exactly once and carries no unresolved finding.

### Audit Persistence Recheck Blocker — 2026-09-01

The requested persistence-only recheck does not support closure. The current strict receipt
checker reports 53 closure-bearing receipts, 43 valid, and 10 stale. Each stale receipt names a
changed BUG-025 report or state input. The assertion-only transition guard therefore fails only
`applicable-integrity`; it reports no unresolved route, rework item, or missing audit phase. No
long test was rerun, and no status or certification field changed.

This supersedes the earlier 53-valid/zero-stale statement for the post-persistence tree. The exact
blocker is `AUDIT-025-PERSISTENCE-STALE-001`, routed to `bubbles.test` for canonical receipt
refresh before a new independent audit attempt.

## Spot-Check Recommendations

1. Verify the ten stale entries are refreshed against the current report and state bytes without
	weakening or deleting their input closures.
2. After refresh, verify strict receipt output returns all 53 closure-bearing receipts as valid and
	zero stale before accepting a replacement audit verdict.

BEGIN TRANSITION_GUARD_RESULT_V1
schemaVersion: transition-guard-result/v1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:e57958f25949a7f3efb82be3731a4701c1a217d0a9c86356fadcd85521071738
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G057,G061,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: []
failedChecks: [applicable-integrity]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 1
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1

target: specs/_bugs/BUG-025-company-corpus-read-never-settles
mode: bugfix-fastlane
audit class: delivery-completion
ceiling: done
verdict: DO_NOT_SHIP

BEGIN AUDIT_RESULT_V1
schemaVersion: audit-result/v1
runId: audit-bug025-20260901-final
attemptId: AUDIT-BUG025-20260901-PERSISTENCE-003
target: specs/_bugs/BUG-025-company-corpus-read-never-settles
targetRevision: sha256:e57958f25949a7f3efb82be3731a4701c1a217d0a9c86356fadcd85521071738
workflowMode: bugfix-fastlane
modeClass: none
auditClass: delivery-completion
statusCeiling: done
requestedStatus: done
auditVerdict: DO_NOT_SHIP
outcome: route_required
resultState: ACTIVE
certifiedStatus: none
planningEvaluation: NOT_EVALUATED
deliveryEvaluation: REFUSED
sourceEditLockout: PASS
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G057,G061,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: []
failedChecks: [applicable-integrity]
blockingCode: DELIVERY_COMPLETION_FAILED
unresolvedFields: []
contradictions: []
contractRef: bubbles/workflows/modes.yaml#bugfix-fastlane
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
evidenceRefs: [report.md#audit-persistence-recheck-blocker-2026-09-01]
addressedFindings: [AUDIT-025-EVIDENCE-001,AUDIT-025-SLICE-002,AUDIT-025-DOD-003,AUD-BUG025-001,AUD-BUG025-002,AUD-BUG025-003,AUD-BUG025-004]
unresolvedFindings: [AUDIT-025-PERSISTENCE-STALE-001]
nextRequiredOwner: bubbles.test
supersedesAttemptId: AUDIT-BUG025-20260901-FINAL-002
resumeFromPhase: none
END AUDIT_RESULT_V1

<a name="audit-persistence-closure-2026-09-01"></a>
## Audit Persistence Closure — 2026-09-01

**Phase:** audit
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root /home/philipk/research-lab --strict`
**Exit Code:** 0
**Claim Source:** executed

```text
{
	"total": 1829,
	"current": 1714,
	"superseded": 115,
	"withClosure": 53,
	"valid": 53,
	"stale": 0,
	"unknown": 1661,
	"staleReceipts": []
}
```

The current strict check closes `AUDIT-025-PERSISTENCE-STALE-001`: all 53
closure-bearing receipts are valid and none are stale. Attempt 003 is superseded. The replacement
audit attempt returns `SHIP_IT` with all seven original findings addressed and no unresolved
findings. Status and certification remain unchanged, and `bubbles.validate` is the next owner.

## Spot-Check Recommendations

1. **Exactly-ten-line strict receipt output** — Verify the 53-valid and zero-stale fields because
	 this evidence is exactly at the minimum output threshold.

BEGIN AUDIT_RESULT_V1
schemaVersion: audit-result/v1
runId: audit-bug025-20260901-final
attemptId: AUDIT-BUG025-20260901-PERSISTENCE-004
target: specs/_bugs/BUG-025-company-corpus-read-never-settles
targetRevision: sha256:5533052fc439d04a7bfd5d8faa969809b73f989100e44813fbcb215ba9093d22
workflowMode: bugfix-fastlane
modeClass: none
auditClass: delivery-completion
statusCeiling: done
requestedStatus: done
auditVerdict: SHIP_IT
outcome: completed_diagnostic
resultState: ACTIVE
certifiedStatus: none
planningEvaluation: NOT_EVALUATED
deliveryEvaluation: CERTIFIED
sourceEditLockout: PASS
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G057,G061,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: []
failedChecks: []
blockingCode: none
unresolvedFields: []
contradictions: []
contractRef: bubbles/workflows/modes.yaml#bugfix-fastlane
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
evidenceRefs: [report.md#audit-persistence-closure-2026-09-01]
addressedFindings: [AUDIT-025-EVIDENCE-001,AUDIT-025-SLICE-002,AUDIT-025-DOD-003,AUD-BUG025-001,AUD-BUG025-002,AUD-BUG025-003,AUD-BUG025-004,AUDIT-025-PERSISTENCE-STALE-001]
unresolvedFindings: []
nextRequiredOwner: bubbles.validate
supersedesAttemptId: AUDIT-BUG025-20260901-PERSISTENCE-003
resumeFromPhase: none
END AUDIT_RESULT_V1

<a name="validate-audit-rework-adjudication-2026-09-01"></a>
## Validate Audit-Rework Adjudication — 2026-09-01

### Current Repository And Runner Boundary

**Phase:** validate
**Claim Source:** executed

The inherited actionable packet was validated before repository reads. The validated decision is
`rb:vscode-0f862ced0188e21d7d00451ceb459e3d:1`, control revision `1`, repository
`research-lab`, and root `/home/philipk/research-lab`. No repository-binding preflight ran.

The command-bound current-revision assertion reported HEAD
`4c9f2e87b9738eece50c2f0f5b987046ee6ce7a8`, mode `bugfix-fastlane`, both status mirrors
`in_progress`, Scope 1 `In Progress`, progress `12/3`, and exactly three open findings before
adjudication. The checkout-local runner identity command reported exactly `Version 1.61.1`.

### Current Execution Receipts

**Phase:** validate
**Claim Source:** executed

| Workload | Exact registered command | Exit | Direct signal | Full-output SHA-256 |
| --- | --- | ---: | --- | --- |
| Company Intelligence unit contract | `timeout 240 node --test tests/company-intelligence.unit.mjs` | 0 | 110 passed, 0 failed, 0 skipped | `148b2d40b3008a68fbe9f8e68e7d1bba13c98b19a70bab50c1062d811d7a17da` |
| Focused BUG-025 browser replay | `timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep 'BUG-025' --reporter=list` | 0 | 14 passed | `b33e035240ea004f05d8cea79f6f679742ec25de7584a1dfea8e68ace51fff50` |
| Complete Company Intelligence browser regression | `timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | 0 | 58 passed | `1199e3347d10bb867cd4c11769d09493cf5d650c0a512a171cef48670498cd70` |
| Repository functional regression | `timeout 1200 node scripts/selftest.mjs` | 0 | 3443 passed, 0 failed | `2598ed1e07633cdc664663268674f47f53af699c2a08227daa5fc305ec86960f` |
| Strengthened scenario campaign | `timeout 1200 node scripts/scenario-receipts.mjs --spec specs/_bugs/BUG-025-company-corpus-read-never-settles --map scripts/scenario-break-map-bug025.json --scenarios SCN-BUG-025-006,SCN-BUG-025-007,SCN-BUG-025-008 --quiet-child --agent bubbles.validate` | 0 | 3/3 COMPLETE; each RED exited 1; restored target, live, and regression phases exited 0; shared tree unchanged | `2855d9ff4e0492acf037125c81922cbf20921f53885cd7c3cb806e27bdcde12c` |
| Scenario-state resolution | `timeout 300 bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/_bugs/BUG-025-company-corpus-read-never-settles --require RED_VERIFIED --require IMPLEMENTED --require GREEN_TARGETED --require GREEN_LIVE --require REGRESSION_GREEN --require OBSERVED --certifiable` | 0 | All eight scenarios `REGRESSION_GREEN`; certifiable yes | `291c313d907f7f45fdd651654bd60ced8cce81acdb33ddb43d71fa2fcab0dee9` |
| Strict current receipt freshness | `timeout 300 bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root /home/philipk/research-lab --strict` | 0 | 44 closure-bearing receipts valid; 0 stale | `b791e62deb2131285cf08ae62d44e9bd292fd24e0c57080f7df0d68d8f30bf59` |
| Regression and boundary integrity | `timeout 360 sh -c '<regression-quality, interception, skip-marker, diff, and excluded-family checks>'` | 0 | 0 regression-quality violations or warnings; no unannotated classification claim; no skip markers; diff clean; excluded tracked families equal HEAD | `7c05dedd02ad785ae2f9548999a47cacc71eea4e664eb7cbb719fa5496f70c99` |

### Individual DoD Adjudication

**Phase:** validate
**Claim Source:** executed

| DoD row | Current evidence and adjudication | Result |
| ---: | --- | --- |
| 9 — `SCN-BUG-025-006` | The focused and complete system-Chrome runs directly name the canonical-path production carrier and canonical-subject mutation control as passed. The current scenario campaign reports `SCN-BUG-025-006` COMPLETE with expected RED `1`, restored GREEN/live/regression `0`, and an unchanged shared tree. | Earned |
| 10 — `SCN-BUG-025-007` | The complete system-Chrome run directly names the embedded refusal, exact body-focus mutant, duplicate-announcement mutant, and equality-guard mutant as passed. The current campaign reports the scenario COMPLETE with expected RED `1` and every restored proof phase `0`. | Earned |
| 11 — `SCN-BUG-025-008` | The focused and complete system-Chrome runs directly name the served terminal-refusal carrier, duplicate-announcement control, equality-guard control, and route-suppression control as passed. The current campaign reports the scenario COMPLETE with expected RED `1` and every restored proof phase `0`. | Earned |
| 15 — Change Boundary | The implementation-owned current boundary at [Implementation-Owned Post-Repair Boundary](#implementation-owned-post-repair-boundary-2026-09-01) proves ten protected identities, two admitted proof identities, generic-runner and sibling-map HEAD equality, embedded-config parity, a complete 16-path BUG-025 and 36-path sibling partition, excluded tracked-family equality, and a clean complete patch. The current scenario campaign independently reports the shared tree unchanged, and the current diff/excluded-family check exits zero. This is a classified dirty tree, not an isolated-tree cleanliness claim. | Preserved as earned |

### Outcome Contract Verification

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** The user-visible Success Signal requires correlating named carrier assertions,
mutation discrimination, current scenario state, and the complete regression result. Those
executions collectively show bounded existing outcomes, acceptance of the canonical MSFT pair,
and pre-transport refusal of invalid declarations. The current results do not match the declared
Failure Condition.

| Field | Current evidence | Status |
| --- | --- | --- |
| Intent | Current unit, focused browser, complete browser, and scenario-campaign executions exercise terminal reads and the closed canonical event document authority. | Satisfied |
| Success Signal | 110 unit tests, 14 focused live browser tests, 58 complete live browser tests, 3443 functional checks, and all eight scenario states are green at the current revision. | Satisfied |
| Hard Constraints | The current carriers preserve embedded first paint, no retry or alternate path authority, exact refusal vocabulary, request ledgers, focus behavior, and unchanged shared-tree mutation windows. | Satisfied |
| Failure Condition | No current read carrier remains pending beyond its bound, and all malformed or mismatched event declarations tested remain outside transport. | Not triggered |

### Governance And Non-Terminal Disposition

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** The transition guard ran against the fresh registry contract. Its pre-audit
nonzero result is expected at this phase because audit and finalize remain unexecuted and the audit
route remains open. It does not negate the current scope-level execution evidence. The fresh
contract resolves `bugfix-fastlane`, `delivery-completion-v1`, target `done`, digest
`sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f`, and target revision
`sha256:8c7c6296673ecc32ec554385841b703d4475fdd1a649e6c8a26411c47a2a6ef5`.

Goal fidelity, scenario-test resolution, traceability, implementation reality, and artifact
freshness executed successfully. The handoff-cycle helper returned exit `2` because this product
bug directory contains no `.agent.md` definitions, so that helper is not applicable to this
packet. The impact planner reports `Configured: false` and requires the normal validation set,
which was executed above. The project config declares no `traceContracts`, and the scope declares
no `observabilityWorkflow`, so G080 and G100 are not applicable.

`AUDIT-025-EVIDENCE-001` is resolved by this current command-bound record. Scope 1 is now `Done`
with fifteen checked and zero unchecked DoD rows. The execution scope inventory and validate-owned
certification scope progress are reconciled to that artifact, and the scope id is present in
`certification.completedScopes`.

Both top-level `status` and `certification.status` remain `in_progress`. No audit claim or terminal
certification is made. `AUDIT-025-SLICE-002` and `AUD-BUG025-004` remain open for `bubbles.audit`.
`BUG-025-ROUTE-030` now records the completed validate step and retains only audit in its remaining
owner sequence. `BUG-025-ROUTE-028` remains the concrete next route.


<a name="test-phase-per-item-evidence-map"></a>
### Per-Item Evidence Map

| Definition-of-Done behavior | Current evidence | Test mechanism and negative control |
| --- | --- | --- |
| Required positive bound and fail-loud invalid values | [Focused unit](#test-phase-focused-unit), 102 passed | Production `readCoverageRegistry()` receives committed and mutated configurations. Missing, zero, negative, fractional, string, non-finite, and unsafe values must raise the named schema error. |
| Every route-owned fetch uses an abort signal and cleans its timer | [Focused unit](#test-phase-focused-unit), [focused browser](#test-phase-focused-browser) | Structural ownership rejects a second fetch site or call-site timer. Real held responses must close at the server, and the timer tracker must reach zero after each outcome. |
| Every changed scenario has focused browser regression coverage | [Focused browser](#test-phase-focused-browser), 5 passed | Production route over ephemeral HTTP; invalid config, no-headers hold, partial-body hold, inside-bound release, and served-config hold each have a visible-state or server-close assertion. |
| Never-answering reads settle unavailable after abort | [Focused browser](#test-phase-focused-browser), cases 2 and 3 | Server accepts and withholds the real repository response. A missing abort, retry, readiness transition, or named unavailable row fails the test. |
| Inside-bound success and network-independent first paint | [Focused browser](#test-phase-focused-browser), case 4 | Server releases the real bar at 30% of the committed bound. The route must have painted embedded state first, then load current data without abort classification. |
| Existing Company Intelligence journeys remain intact | [Complete browser](#test-phase-complete-browser), 47 passed | The complete current production-route carrier runs without selection narrowing. |
| Unit and repository regressions remain green | [Focused unit](#test-phase-focused-unit), [repository selftest](#test-phase-repository-selftest) | The exact declared commands report 102/102 and 3437/3437 with zero skipped unit tests and zero failures. |
| Change boundary | [Change-boundary checkpoint](#test-phase-change-boundary) | Carrier hashes and the dirty-path snapshot are compared before and after packet-only edits; no excluded path is edited by this phase. |

<a name="test-phase-finding-accounting"></a>
### Test-Phase Finding Accounting

| Finding | Disposition | Evidence |
| --- | --- | --- |
| `BUG-025-TEST-001` | Addressed. The harness watchdog is a literal declaration the validator evaluates, while its runtime assertion derives the exact 50% margin from committed configuration. | [Timeout-budget receipt](#test-phase-timeout-budget) |
| `BUG-025-TEST-002` | Addressed. The selftest expectation now matches the carrier's mixed pass-through and real-server provenance and still rejects stale blanket wording. | [Repository selftest](#test-phase-repository-selftest) |
| `BUG-025-ROUTE-003` | Addressed. Every requested independent command ran on the current carrier and exited zero. | [Focused unit](#test-phase-focused-unit), [focused browser](#test-phase-focused-browser), [complete browser](#test-phase-complete-browser), [repository selftest](#test-phase-repository-selftest), [artifact lint](#test-phase-artifact-lint) |
| `BUG-025-TEST-STATE-001` | Addressed. Per-item checkmarks were attempted individually, the final selftest rejected their mismatch with validate-owned 0/8 certification progress, and all checkmarks were restored while retaining current evidence links and uncertainty declarations. | [DoD state-coherence repair](#test-phase-dod-state-coherence) |
| `BUG-025-REGRESSION-PHASE-REQUIRED` | Unresolved phase-chain handoff. No product or test defect remains in the TEST phase. | Next owner: `bubbles.regression` |

<a name="test-phase-change-boundary"></a>
### Test-Phase Change-Boundary Checkpoint

**Phase:** test
**Command:** `timeout 60 sha256sum company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs && timeout 60 git diff --check -- company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs specs/_bugs/BUG-025-company-corpus-read-never-settles && printf '%s\n' 'BUG025_POST_EDIT_DIFF_CHECK=PASS' && timeout 60 git status --short`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The six production and test carrier hashes exactly match the pre-edit checkpoint from this invocation. The before and after dirty-path inventories are identical. This phase changed only BUG-025 packet artifacts after the checkpoint and did not alter any excluded file family.

```text
937dffcc2c78cf29e77d280f93c39c0a38c057e3035f60966f8582f1f3d4dded  company-intelligence.config.json
751257f37b6ba014239033faab05ebe26b95336fda77084fbd407cb66c10927d  company-intelligence-lab.html
14c4af82444fe0e4a07d456c18d34effd127042bca66e543244c0d008259c9f8  rlcompanyintel.js
762c332c67d6c39f69b3cf86e3c92643599839bc6073c38636cc12832cdfc106  tests/company-intelligence.unit.mjs
fc126d9e4a304729441f995e4f537e9755a624b77ad65a34a2d6fbab20cf8949  tests/company-intelligence-lab.spec.mjs
0c9b75e903a7a782acf604ce88dc5546e868a5b93ce21033b3948b519359e144  scripts/selftest.mjs
BUG025_POST_EDIT_DIFF_CHECK=PASS
 M README.md
 M company-intelligence-lab.html
 M company-intelligence.config.json
 M docs/DomainModel.md
 M notes/company-intelligence-lab.md
 M rlcompanyintel.js
 M rlportfolio.js
 M rlportfoliobrief.js
 M scripts/selftest.mjs
 M scripts/validate-test-file-reachability.baseline
 M scripts/verify-spec008-scope-claims.mjs
 M specs/007-technical-analysis-decision-lab/scopes/01-capability-foundation/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/02-technique-engine/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/03-setup-lifecycle/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/04-five-gate-synthesis/report.md
 M specs/007-technical-analysis-decision-lab/scopes/04-five-gate-synthesis/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/05-owner-publication/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/06-comparison-optional-evidence/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/07-validation-risk-process/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/08-experience-publication/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/09-regression-closure/scope.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/report.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/scopes.md
 M specs/008-portfolio-survival-and-brief-lab/scopes/04-public-evidence-barrier-and-coverage/scope.md
 M specs/008-portfolio-survival-and-brief-lab/scopes/28-spec-driven-adversarial-test-replacement/scope.md
 M specs/008-portfolio-survival-and-brief-lab/scopes/_boundary-attribution.md
 M specs/008-portfolio-survival-and-brief-lab/test-plan.json
 M specs/_bugs/BUG-002-market-brief-session-date-drift/uservalidation.md
 M tests/company-intelligence-lab.spec.mjs
 M tests/company-intelligence.unit.mjs
 M tests/portfolio-brief.functional.mjs
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/
```

<a name="test-phase-dod-state-coherence"></a>
### DoD State-Coherence Repair

**Phase:** test
**Command:** `timeout 960 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 final DoD-state repository selftest" -- timeout 900 node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

The eight evidence-backed checkmarks were applied one at a time. The exact final-epoch selftest
then rejected one state inconsistency: validate-owned certification still truthfully declared
`0/8`, while the scope artifact declared `8/0`. This test phase cannot modify
`certification.scopeProgress`. It restored the eight checkboxes to unchecked, retained each
current evidence link, added an uncertainty declaration to each item, and left Scope 1
`In Progress` as required.

```text
# BUG-025 Scope 1 final DoD-state repository selftest
$ timeout 900 node scripts/selftest.mjs
exit: 1
lines: 3907
sha256: db7d55016d11da23cc71d4a658305b1aaba85a0e7dcc6f18c40a17a1508fd6e5
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3867 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (94 claim(s) across 71 packet(s), 79 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
		NEW-DRIFT specs/_bugs/BUG-025-company-corpus-read-never-settles#01::certification (01-declare-and-enforce-one-read-bound) — claims 0/8 checked/unchecked, artifact has 8/0 [specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md]
	✗ FAIL: no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (1 new, 14 frozen, 0 stale of 94 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3436 passed, 1 failed
================================================
```

<a name="regression-phase-2026-08-31"></a>
## Regression Phase — 2026-08-31

This section records only the `bubbles.regression` invocation that began at
`2026-08-31T05:59:42Z`. It does not reuse the TEST phase's executions as regression
evidence. The TEST phase receipts serve only as the before-side baseline in the comparison
table below. Scope 1, the packet, and `certification.*` remain in progress.

### Repository Binding And Regression Epoch

The inherited actionable packet was validated before the first Research Lab repository read.

**Phase:** regression
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /tmp/bubbles-bug025-regression-binding-vscode-20072c8d3f74af455af2514e746fced3.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=~/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:1 revision=1
```

The regression epoch used current `HEAD` `79056678bd5a873a13cedd2196d6edbba8c9233c` plus
the dirty working-tree bytes identified by the hashes below. The same hashes were re-read after
all substantive regression commands. Every listed byte sequence remained unchanged.

**Phase:** regression
**Command:** `timeout 60 date -u +%Y-%m-%dT%H:%M:%SZ && timeout 60 git rev-parse HEAD && timeout 60 sha256sum company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs notes/company-intelligence-lab.md README.md docs/DomainModel.md rlportfolio.js rlportfoliobrief.js scripts/validate-test-file-reachability.baseline scripts/verify-spec008-scope-claims.mjs tests/portfolio-brief.functional.mjs specs/_bugs/BUG-002-market-brief-session-date-drift/uservalidation.md && timeout 60 git diff --check -- company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs notes/company-intelligence-lab.md specs/_bugs/BUG-025-company-corpus-read-never-settles && printf '%s\n' 'BUG025_REGRESSION_PRECHECK=PASS'`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The command fixes the exact product, carrier, shared-selftest, and protected
concurrent-work bytes for this diagnostic pass. The post-command hash check reproduced every hash.

```text
2026-08-31T05:59:42Z
79056678bd5a873a13cedd2196d6edbba8c9233c
937dffcc2c78cf29e77d280f93c39c0a38c057e3035f60966f8582f1f3d4dded  company-intelligence.config.json
751257f37b6ba014239033faab05ebe26b95336fda77084fbd407cb66c10927d  company-intelligence-lab.html
14c4af82444fe0e4a07d456c18d34effd127042bca66e543244c0d008259c9f8  rlcompanyintel.js
762c332c67d6c39f69b3cf86e3c92643599839bc6073c38636cc12832cdfc106  tests/company-intelligence.unit.mjs
fc126d9e4a304729441f995e4f537e9755a624b77ad65a34a2d6fbab20cf8949  tests/company-intelligence-lab.spec.mjs
0c9b75e903a7a782acf604ce88dc5546e868a5b93ce21033b3948b519359e144  scripts/selftest.mjs
3214109df462c2272ae50c7f63ba09b25d46be3cde01a07a5a43f2f7707c7d35  notes/company-intelligence-lab.md
c99d1157850e2cd79a87d4078b50966e35d3efdfc521077dc827278f76265489  README.md
609d8b7e5219f5901554b9b0276a095ed5d3db8208bd6cceb5446dd521a18779  docs/DomainModel.md
ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0  rlportfolio.js
2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30  rlportfoliobrief.js
f18b7e686ea3f6b4b922d75aaec0cbfed790ed96b3a04d05953e8b333ee776bd  scripts/validate-test-file-reachability.baseline
85607ac1fd83792c4086589fe70054d250b12df5e38c1b879e07ac010aaec6c0  scripts/verify-spec008-scope-claims.mjs
875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124  tests/portfolio-brief.functional.mjs
365a84ffcf3888c8b4b90ba4806edf08edc43d95c0fbbf76f38d599b1966cb63  specs/_bugs/BUG-002-market-brief-session-date-drift/uservalidation.md
BUG025_REGRESSION_PRECHECK=PASS
```

### Test Baseline And Coverage Delta

The prior TEST section is the artifact baseline, not this phase's execution evidence. This phase
reran every compared carrier from the current bytes.

| Carrier | TEST artifact baseline | Regression execution | Delta | Result |
| --- | ---: | ---: | ---: | --- |
| Company Intelligence unit | 102/102 | 102/102 | 0 | Stable |
| Company Intelligence browser | 47/47 | 47/47 | 0 | Stable |
| Repository selftest | 3437/3437 | 3437/3437 | 0 | Stable |
| BUG-025 manifest scenarios | 3 mapped | 3 mapped and exercised within the first five browser cases | 0 | Stable |

The project command registry declares no line-coverage command, so this phase makes no percentage
claim. The executed test inventory did not decrease. The unit runner reported zero skipped tests.
The browser runner reported 47 passes and no skipped or failed result. The three manifest titles
still resolve to cases 2, 4, and 5, while cases 1 and 3 strengthen invalid-config and partial-body
coverage beyond the manifest floor.

The scenario-first RED sections remain historical baseline evidence. They show the pre-repair
no-abort route failing the no-headers, partial-body, and served-config cases while the inside-bound
case remained green. This phase does not relabel those earlier commands as current execution.

<a name="regression-phase-complete-unit"></a>
### Complete Company Intelligence Unit Carrier

**Phase:** regression
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 regression complete Company Intelligence unit" -- timeout 180 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 regression complete Company Intelligence unit
$ timeout 180 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 622
sha256: c8c7e72d251b51a848f2d314ea10a399221e48ea11e731a36e3554d9e5b39448
--- first 20 ---
TAP version 13
# Subtest: coverage account holds one row per registry dimension and totals sum to the registry length
ok 1 - coverage account holds one row per registry dimension and totals sum to the registry length
	---
	duration_ms: 7.862271
	type: 'test'
	...
# Subtest: SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
ok 2 - SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
	---
	duration_ms: 2.144592
	type: 'test'
	...
# Subtest: every one of the five evidence states is produced by a real adapter outcome
ok 3 - every one of the five evidence states is produced by a real adapter outcome
	---
	duration_ms: 4.220984
	type: 'test'
	...
# Subtest: a read aged past its window stays in the denominator as stale rather than becoming neutral
--- omitted 582 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 101 - 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
	---
	duration_ms: 1.128095
	type: 'test'
	...
# Subtest: 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
ok 102 - 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
	---
	duration_ms: 5.63678
	type: 'test'
	...
1..102
# tests 102
# suites 0
# pass 102
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 347.67292
```

<a name="regression-phase-complete-browser"></a>
### Complete Company Intelligence Browser Carrier

**Phase:** regression
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 regression complete Company Intelligence browser" -- timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 regression complete Company Intelligence browser
$ timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 52
sha256: 731eb94bac2ea80d6e5e125157d5f344ffa194873f92c8ad03b6e8efcd5a35ad
--- first 20 ---

Running 47 tests using 1 worker

	✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:303:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (465ms)
	✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:331:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.4s)
	✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:353:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.4s)
	✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:376:1 › Regression: BUG-025 an inside-bound response settles normally (3.5s)
	✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:409:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.2s)
	✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:514:1 › four horizon regions render with four summaries and four deep-dive controls (508ms)
	✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:543:1 › Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction (492ms)
	✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:574:1 › an owned dimension renders a deep link whose target is a registered route (510ms)
	✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:618:1 › every rendered numeric value carries a provenance chip, a source name and an as-of date (484ms)
	✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:645:1 › Regression: SCN-025-021 an unavailable dimension renders a named absence and never a dash or a zero (497ms)
	✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:679:1 › Regression: SCN-025-021 a scripted narrative string renders as visible escaped text (483ms)
	✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:704:1 › a position, size or cost basis entry is refused in the browser and nothing is stored (443ms)
	✓  13 [system-chrome] › tests/company-intelligence-lab.spec.mjs:730:1 › each canvas draws non-blank pixels and pairs with a table holding the same values (759ms)
	✓  14 [system-chrome] › tests/company-intelligence-lab.spec.mjs:777:1 › the route defers no drawing and schedules no repeating timer (397ms)
	✓  15 [system-chrome] › tests/company-intelligence-lab.spec.mjs:806:1 › switching the mode segment triggers no request and no recomposition (501ms)
	✓  16 [system-chrome] › tests/company-intelligence-lab.spec.mjs:828:1 › FR-025-017 a second run reuses the cached corpus and refetches no committed bar file (551ms)
	✓  17 [system-chrome] › tests/company-intelligence-lab.spec.mjs:872:1 › at 375 CSS pixels the four summaries stack and the document never scrolls sideways (497ms)
--- omitted 12 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓  30 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1358:1 › Stabilize: the route writes only the shared data container and leaves a sibling tool cache intact (436ms)
	✓  31 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1385:1 › Stabilize: repeat composition of an unchanged subject issues no further request (698ms)
	✓  32 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1417:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (4.9s)
	✓  33 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1455:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.3s)
	✓  34 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1491:1 › Chaos: a background corpus paint does not close a deep dive the reader opened (5.4s)
	✓  35 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1527:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (334ms)
	✓  36 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1573:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (583ms)
	✓  37 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1644:1 › every interactive control on the route is reachable and operable from the keyboard alone (1.8s)
	✓  38 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1790:1 › Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read (1.4s)
	✓  39 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1829:1 › Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card (1.2s)
	✓  40 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1878:1 › Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href (838ms)
	✓  41 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1923:1 › Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company (1.9s)
	✓  42 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1943:1 › Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject (3.0s)
	✓  43 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1995:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (740ms)
	✓  44 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2083:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (634ms)
	✓  45 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2209:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel (576ms)
	✓  46 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2231:1 › Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel (731ms)
	✓  47 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2267:1 › Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel (691ms)

	47 passed (1.4m)
```

### Protected-Scenario Discrimination

**Phase:** regression
**Command:** `timeout 60 grep -nE 'underlying static-server request|no composed embedded first paint|bodyStarted\(\)|must not be retried|must be requested once|inside-bound response was classified as an abort|data-reading-readiness.*established|bounded-read timer active|did not clear every bounded-read timer' tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The current passing browser execution is not tautological. The no-headers and
headers-plus-partial-body cases wait for the real server to observe connection close. Removing the
controller abort, or removing `signal: controller.signal`, leaves that server-side condition false
and makes the bounded `expect.poll` fail. The partial-body case additionally requires that headers
and a body fragment were sent. Every held path requires exactly one request. The accepted-side case
requires a release at 30% of the bound, loaded current data, no abort classification, one request,
and complete timer cleanup. The embedded-first assertion runs while the held response is unreleased.

```text
213:        { timeout: 5000, message: `${context} left a bounded-read timer active` }
217:    expect(timers.cleared, `${context} did not clear every bounded-read timer`).toBe(timers.created);
266:    expect(observed.firstPaint, 'no composed embedded first paint was observed before release').not.toBeNull();
285:            message: `underlying static-server request for ${heldPath} remained open after the declared ${REQUIRED_READ_BOUND_MS} ms read bound`
292:    await expect(page.locator('body')).toHaveAttribute('data-reading-readiness', 'established', { timeout: 30_000 });
344:        expect(withheld.requestCount(), 'the aborted bar must not be retried').toBe(1);
364:        expect(withheld.bodyStarted(), 'the optional response must stall after headers and a partial body').toBe(true);
367:        expect(withheld.requestCount(), 'the aborted optional document must not be retried').toBe(1);
393:        await expect(page.locator('body')).toHaveAttribute('data-reading-readiness', 'established');
399:        expect(withheld.abortObserved(), 'an inside-bound response was classified as an abort').toBe(false);
400:        expect(withheld.requestCount(), 'the delayed valid response must be requested once').toBe(1);
424:        await expect(page.locator('body')).toHaveAttribute('data-reading-readiness', 'established');
426:        expect(withheld.requestCount(), 'the stalled served config must not be retried').toBe(1);
1242:        await expect(page.locator('body')).toHaveAttribute('data-reading-readiness', 'established');
1294:        await expect(page.locator('body')).toHaveAttribute('data-reading-readiness', 'established');
1558:    await expect(page.locator('body')).toHaveAttribute('data-reading-readiness', 'established');
2181:        await expect(page.locator('body')).toHaveAttribute('data-reading-readiness', 'established');
2218:        await expect(page.locator('body')).toHaveAttribute('data-reading-readiness', 'not-established');
2239:        await expect(page.locator('body')).toHaveAttribute('data-reading-readiness', 'not-established');
2247:        await expect(page.locator('body')).toHaveAttribute('data-reading-readiness', 'established');
2273:        await expect(page.locator('body')).toHaveAttribute('data-reading-readiness', 'established');
```

The current source wiring was also inspected. `readRouteDocument()` owns the route's one `fetch()`
site, creates the controller, calls `controller.abort()`, and passes `controller.signal`. The unit
carrier constrains the one-fetch ownership. The browser carrier supplies the observable signal
check that the structural test alone cannot provide.

```text
company-intelligence-lab.html:1634:            function readRouteDocument(path, consumeResponse) {
company-intelligence-lab.html:1647:                    controller = new AbortController();
company-intelligence-lab.html:1650:                        controller.abort();
company-intelligence-lab.html:1652:                    return fetch(path, { cache: "no-store", signal: controller.signal })
tests/company-intelligence.unit.mjs:2059:    const helperStart = ROUTE_SOURCE.indexOf('function readRouteDocument(');
tests/company-intelligence.unit.mjs:2066:    assert.equal(fetchSites.length, 1, 'exactly one production fetch site remains');
tests/company-intelligence.unit.mjs:2068:        'the only fetch site belongs to readRouteDocument');
```

### Cross-Spec Impact And Design Coherence

The changed runtime contract intersects two existing authorities. BUG-018 owns the distinction
between pending `not-established` output and established loaded or unavailable output. Feature 025
owns the fifteen-dimension account, four independent horizons, route behavior, and unit contracts.

The complete browser carrier exercised both intersections on one current tree. Cases 43 through 47
preserved BUG-018's subject-status, pending-copy, pending-publication, loaded-publication, and
unavailable-publication semantics. Cases 6 through 42 preserved Feature 025 and its later linked
owner-route behavior. The complete unit carrier preserved all 102 module contracts. No route
collision, storage mutation, API removal, or contradictory state vocabulary was found in the
current diffs. BUG-025 adds termination to the pending window. It does not redefine the BUG-018
settled predicate.

Feature 025's completed `scopes.md` retains two historical `/v1` declarations describing the
originally delivered input contract. They are not executable consumers. BUG-025 explicitly records
the incompatible input-shape bump, links back to Feature 025 through `linkedImplementationSpec`,
keeps the normalized `company-coverage-registry/v1` output contract unchanged, and requires the
live validator to reject input `/v1`.

<a name="regression-phase-repository-selftest"></a>
### Repository Selftest

**Phase:** regression
**Command:** `timeout 960 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 regression repository selftest" -- timeout 900 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 regression repository selftest
$ timeout 900 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: 7d47e00dbb9c2cd3151c345a284ec1469060f8960af8ea51d2e3cc274d2b7ece
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3866 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (94 claim(s) across 71 packet(s), 80 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 94 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

### Browser Provenance And Interception Classification

**Phase:** regression
**Command:** `timeout 60 grep -nE 'Ordinary cases|Explicitly annotated|No case fulfills|bubbles:fault-injection-(begin|end)|page\.route\(|route\.(continue|fulfill|abort)\(|startWithheldStaticServer|Regression: BUG-025' tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** BUG-025 cases 2 through 5 use `startWithheldStaticServer()` and real HTTP
responses. Their source region ends before the first `page.route()` interception. Existing
interception appears only in separately annotated fault-injection blocks and calls
`route.continue()`; the audit found no `route.fulfill()` or `route.abort()`. Those pass-through
cases are not used as BUG-025 evidence.

```text
4: * Ordinary cases use the real ephemeral static server and unmodified responses.
5: * Explicitly annotated fault-injection cases either pass through `page.route()` unchanged or make a real
6: * Node HTTP server withhold one repository file until an explicit release. No case fulfills business data.
96:async function startWithheldStaticServer(heldPath, { holdAfterHeaders = false } = {}) {
111:        // bubbles:fault-injection-begin reason=accept and withhold one real same-origin repository response until explicit release or browser abort
146:        // bubbles:fault-injection-end
303:test('Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request', async ({ page }) => {
331:test('Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result', async ({ page }) => {
334:    const withheld = await startWithheldStaticServer(heldPath);
353:test('Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result', async ({ page }) => {
356:    const withheld = await startWithheldStaticServer(heldPath, { holdAfterHeaders: true });
376:test('Regression: BUG-025 an inside-bound response settles normally', async ({ page }) => {
379:    const withheld = await startWithheldStaticServer(heldPath);
409:test('Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles', async ({ page }) => {
412:    const withheld = await startWithheldStaticServer(heldPath);
439:    // bubbles:fault-injection-begin reason=hold matching real corpus responses behind explicit request-entry and release signals, then continue each unchanged
440:    await page.route('**/data/**', async (route) => {
443:        try { await route.continue(); } catch { /* page or context already closing */ }
445:    // bubbles:fault-injection-end
1589:    // bubbles:fault-injection-begin reason=hold real fetch and XHR responses until first-paint assertions, then continue each unchanged
1590:    await page.route('**/*', async (route, request) => {
1594:            try { await route.continue(); } catch { /* page or context already closing */ }
1599:        try { await route.continue(); } catch { /* page or context already closing */ }
1601:    // bubbles:fault-injection-end
```

<a name="regression-phase-config-consumers"></a>
### Configuration Mirror, Version, And Consumer Synchronization

**Phase:** regression
**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 regression config consumer synchronization" -- timeout 60 grep -nE 'company-intelligence-config/v[12]|readBoundMs|CONFIG_VERSION' company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs notes/company-intelligence-lab.md`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The canonical config, embedded mirror, validator constant, browser carrier,
unit carrier, and selftest all consume `/v2` and the required bound. The sole executable `/v1`
reference passes an `/v1` document to `readCoverageRegistry()` and requires
`C025-CONFIG-VERSION`; it is a rejection control, not a stale consumer. The complete unit pass also
executes the deep-equality mirror assertion.

```text
# BUG-025 Scope 1 regression config consumer synchronization
$ timeout 60 grep -nE company-intelligence-config/v[12]|readBoundMs|CONFIG_VERSION company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs notes/company-intelligence-lab.md
exit: 0
lines: 45
sha256: 851fe2a5e4ec630a956e7f06b3ebd5a87c29d6958ef359b3e35155ad20688994
--- first 20 ---
company-intelligence.config.json:2:  "contractVersion": "company-intelligence-config/v2",
company-intelligence.config.json:3:  "readBoundMs": 10000,
company-intelligence-lab.html:460:    "contractVersion": "company-intelligence-config/v2",
company-intelligence-lab.html:461:    "readBoundMs": 10000,
company-intelligence-lab.html:1635:                var bound = registry.readBoundMs;
rlcompanyintel.js:86:    var CONFIG_VERSION = "company-intelligence-config/v2";
rlcompanyintel.js:285:        if (config.contractVersion !== CONFIG_VERSION) {
rlcompanyintel.js:289:        if (!Number.isSafeInteger(config.readBoundMs) || config.readBoundMs <= 0) {
rlcompanyintel.js:421:            readBoundMs: config.readBoundMs
rlcompanyintel.js:2141:        CONFIG_VERSION: CONFIG_VERSION,
tests/company-intelligence.unit.mjs:2008:    assert.equal(embedded.contractVersion, 'company-intelligence-config/v2');
tests/company-intelligence.unit.mjs:2009:    assert.equal(embedded.readBoundMs, REQUIRED_READ_BOUND_MS);
tests/company-intelligence.unit.mjs:2014:    assert.equal(registry.readBoundMs, REQUIRED_READ_BOUND_MS);
tests/company-intelligence.unit.mjs:2024:        contractVersion: 'company-intelligence-config/v2',
tests/company-intelligence.unit.mjs:2025:        readBoundMs: REQUIRED_READ_BOUND_MS
tests/company-intelligence.unit.mjs:2029:    assert.equal(registry.readBoundMs, REQUIRED_READ_BOUND_MS);
tests/company-intelligence.unit.mjs:2031:    assert.throws(() => { registry.readBoundMs = 1; }, TypeError);
tests/company-intelligence.unit.mjs:2035:    { label: 'absent', apply: (config) => { delete config.readBoundMs; } },
tests/company-intelligence.unit.mjs:2036:    { label: 'zero', apply: (config) => { config.readBoundMs = 0; } },
tests/company-intelligence.unit.mjs:2037:    { label: 'negative', apply: (config) => { config.readBoundMs = -1; } },
--- omitted 5 line(s); sha256 above covers the full output ---
--- last 20 ---
tests/company-intelligence.unit.mjs:2043:    { label: 'unsafe integer', apply: (config) => { config.readBoundMs = Number.MAX_SAFE_INTEGER + 1; } }
tests/company-intelligence.unit.mjs:2047:    test(`BUG-025 readCoverageRegistry refuses ${label} readBoundMs with C025-CONFIG-SCHEMA`, () => {
tests/company-intelligence.unit.mjs:2053:            `${label} readBoundMs must fail loud`
tests/company-intelligence.unit.mjs:2069:    assert.match(helperSource, /registry\.readBoundMs/);
tests/company-intelligence.unit.mjs:2106:        () => INTEL.readCoverageRegistry(Object.assign({}, CONFIG, { contractVersion: 'company-intelligence-config/v1' })),
tests/company-intelligence.unit.mjs:2114:    assert.equal(CONFIG.contractVersion, 'company-intelligence-config/v2');
tests/company-intelligence.unit.mjs:2115:    assert.equal(CONFIG.readBoundMs, REQUIRED_READ_BOUND_MS);
tests/company-intelligence-lab.spec.mjs:49:const REQUIRED_READ_BOUND_MS = COMMITTED_CONFIG.readBoundMs;
tests/company-intelligence-lab.spec.mjs:183:    await page.addInitScript(({ readBoundMs }) => {
tests/company-intelligence-lab.spec.mjs:192:            if (delay === readBoundMs && callbackSource.includes('controller.abort')) {
tests/company-intelligence-lab.spec.mjs:207:    }, { readBoundMs: REQUIRED_READ_BOUND_MS });
tests/company-intelligence-lab.spec.mjs:306:        `"readBoundMs": ${REQUIRED_READ_BOUND_MS}`,
tests/company-intelligence-lab.spec.mjs:307:        '"readBoundMs": 0'
scripts/selftest.mjs:13452:    && /var readBoundMs = WORKSPACE\.CONFIG_READ_BOUND_MS;/.test(routeSource021)
scripts/selftest.mjs:13453:    && /\n\s*readBoundMs = config\.rules\.packReadBoundMs;/.test(routeSource021)
scripts/selftest.mjs:13454:    && !/readBoundMs = config\.rules\.packReadBoundMs\s*\|\|/.test(routeSource021)
scripts/selftest.mjs:13461:    && /var bound = readBoundMs;/.test(loadJsonBody021[1])
scripts/selftest.mjs:23152:    && config25.contractVersion === 'company-intelligence-config/v2'
scripts/selftest.mjs:23153:    && config25.readBoundMs === 10000
scripts/selftest.mjs:23154:    && registry25.readBoundMs === config25.readBoundMs
```

<a name="regression-phase-quality-guard"></a>
### Bugfix Regression Quality Guard

**Phase:** regression
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 regression-phase quality guard" -- timeout 180 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 regression-phase quality guard
$ timeout 180 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 16
sha256: 0e13d2b671bd1deed63c5d9356a827a465bf5294745cf1fd201b1ce8c78df462
--- output ---
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: ~/research-lab
	Timestamp: 2026-08-31T06:02:22Z
	Bugfix mode: true
============================================================

ℹ️  Scanning tests/company-intelligence-lab.spec.mjs
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs

============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 1
	Files with adversarial signals: 1
============================================================
```

### Regression Finding Accounting And Verdict

No new tracked defect, coverage loss, route collision, contract consumer, pending-state conflict,
or browser-classification defect was found.

| Finding | Disposition | Evidence |
| --- | --- | --- |
| `BUG-025-REGRESSION-PHASE-REQUIRED` | Addressed by the complete current-session regression pass. | [Unit](#regression-phase-complete-unit), [browser](#regression-phase-complete-browser), [selftest](#regression-phase-repository-selftest) |
| `BUG-025-ROUTE-004` | Addressed. The requested protected-scenario and cross-spec evaluation ran. | This section |

🟢 REGRESSION_FREE

- Test baseline: unit 102/102 → 102/102; browser 47/47 → 47/47; selftest 3437/3437 → 3437/3437.
- Cross-spec conflicts: 0.
- Design contradictions: 0.
- Coverage: stable by executed carrier and scenario inventory; no line-coverage percentage is claimed because the repository declares no coverage command.
- Gherkin traceability: 3 of 3 BUG-025 manifest scenarios resolve to persistent browser cases, with one invalid-config and one partial-body case beyond that floor.

Phase-chain routing is `BUG-025-ROUTE-005` to `bubbles.simplify`. That routing is the next
registered `bugfix-fastlane` phase, not a regression finding. Scope 1 and the packet remain
`in_progress`, and this phase changed no certification field.

<a name="simplify-phase-2026-08-31"></a>
## Simplify Phase — 2026-08-31

The simplify phase reviewed the 621-line Company Intelligence production and test delta.
The review covered code reuse, control-flow quality, and resource lifetime.
It kept the explicit browser discriminators unchanged.

Two route-local simplifications were warranted:

1. `readRouteDocument()` now clears its request timer through one promise `finally` path.
	 The synchronous setup catch still clears any timer armed before a setup failure.
2. `paintFromEmbedded()` no longer returns or documents an unused boolean result.

The phase changed no test source, configuration, module, selftest, note, or excluded file.
The exact focused unit, focused browser, complete browser, and repository selftest commands
all exited zero after the route edit.

### Simplify Review Findings

| Finding | Category | Disposition | Evidence |
| --- | --- | --- | --- |
| `BUG-025-SIMPLIFY-001` | Quality and efficiency | Addressed. Replaced duplicate fulfillment and rejection cleanup branches with `finally(clearReadTimer)`. | [Focused browser](#simplify-phase-focused-browser), [complete browser](#simplify-phase-complete-browser) |
| `BUG-025-SIMPLIFY-002` | Quality | Addressed. Removed the unused `paintFromEmbedded()` return and stale comment. | [Focused unit](#simplify-phase-focused-unit), [repository selftest](#simplify-phase-repository-selftest) |
| `BUG-025-ROUTE-005` | Phase routing | Addressed. Completed the registered simplify review and preserved the protected contract. | This section |
| `BUG-025-SIMPLIFY-GAP-001` | Independent command-surface gap | Routed to `bubbles.gaps`. The generic page syntax command treats the inert embedded `application/json` block as JavaScript. | [Auxiliary page-check attempt](#simplify-phase-page-check-attempt) |

The reuse pass found no safe test extraction. The repeated browser setup keeps each abort,
partial-body, inside-bound, first-paint, timer-cleanup, and no-retry assertion visible.
The efficiency pass found no long-lived production resource after the single cleanup change.

<a name="simplify-phase-focused-unit"></a>
### Simplify Focused Unit Receipt

**Phase:** simplify
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 simplify focused unit" -- timeout 180 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 simplify focused unit
$ timeout 180 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 110
sha256: e014aef150b94e8f888757c5677a2da480dff130e35ee72484d1f0aadc5f52a9
--- first 20 ---
✔ coverage account holds one row per registry dimension and totals sum to the registry length (12.532159ms)
✔ SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary (2.95039ms)
✔ every one of the five evidence states is produced by a real adapter outcome (4.692885ms)
✔ a read aged past its window stays in the denominator as stale rather than becoming neutral (10.091367ms)
✔ non-financial event dimension reads unavailable with no-source-exists and carries no value (2.171893ms)
✔ an unavailable dimension never renders as a zero or a neutral number (4.101187ms)
✔ an unresolvable identifier raises C025-IDENTITY-UNRESOLVED and composes no horizon (1.045396ms)
✔ a company outside every corpus yields four horizons with absent quality and none direction (2.448192ms)
✔ every claim cites a value present in its own horizon input set (5.501582ms)
✔ a claim citing a value outside its own input set raises C025-HORIZON-ISOLATION (2.570992ms)
✔ four unavailable contributors downgrade evidence quality and populate gapEffect (4.403385ms)
✔ a horizon whose signalled dimensions are evenly opposed composes flat rather than picking a winner (4.548385ms)
✔ the evidence band a horizon publishes follows the count of signalled dimensions it composed (4.428385ms)
✔ two opposing horizons keep their directions and produce one contradiction record (2.483592ms)
✔ SCN-025-008 the published read version keeps both opposed horizon directions and holds no blended direction key (5.125283ms)
✔ module source contains no second definition of a volatility or ratio metric (1.738794ms)
✔ the module holds no DOM, storage, credential, clock or timer authority (2.235293ms)
✔ the module exports a frozen api and loads under Node through module.exports (0.427098ms)
✔ every reason code and every refusal code named by the design appears in the module source (0.293099ms)
✔ all eleven C025 refusal codes are raised by a real call path (5.454482ms)
--- omitted 70 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ the authored branch budget still refuses one branch beyond maxBranches and the recorded budget is unchanged (0.331199ms)
✔ the configuration records the branch budget and the refused-branch counting decision with written rationales (0.192199ms)
✔ the committed MSFT research plan and version tree are authored, dated and free of any position value (0.826497ms)
✔ adversarial: an owner envelope naming another company ONLY by ticker, or ONLY by cik, is refused (4.340086ms)
✔ the coverage account refuses a read set missing any one registry dimension rather than dropping the row (1.468295ms)
✔ a past-dated event still classed scheduled is partitioned as occurred, not presented as a forecast (0.326099ms)
✔ makeRead refuses a non-current read whose reason code is outside the closed vocabulary (3.384389ms)
✔ 027 security — no hostile subject can give the composed owner href a scheme, an authority, a second parameter or a fragment (3.21209ms)
✔ 027 security — the receiver refuses every hostile subject outright and returns no field carrying it (1.112297ms)
✔ 027 security — an accepted subject cannot leave data/options/, cannot become a storage key and cannot reach a prototype (2.613491ms)
✔ 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup (0.943597ms)
✔ 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes (5.728081ms)
ℹ tests 102
ℹ suites 0
ℹ pass 102
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 365.563202
```

<a name="simplify-phase-focused-browser"></a>
### Simplify Focused Browser Receipt

**Phase:** simplify
**Command:** `timeout 660 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 simplify focused browser" -- timeout 600 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 simplify focused browser
$ timeout 600 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 0
lines: 10
sha256: 40128b0d0e49de5e5c5f69b4fb8e8db94b2813b2eebe282ca81cccd14c3bc875
--- output ---

Running 5 tests using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:303:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (1.1s)
	✓  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:331:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (12.0s)
	✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:353:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.6s)
	✓  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:376:1 › Regression: BUG-025 an inside-bound response settles normally (4.2s)
	✓  5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:409:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (10.8s)

	5 passed (44.1s)
```

<a name="simplify-phase-complete-browser"></a>
### Simplify Complete Company Intelligence Browser Receipt

**Phase:** simplify
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 simplify complete Company Intelligence browser" -- timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 simplify complete Company Intelligence browser
$ timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 52
sha256: 157596748e4d426ba327de8301924bc1a713b0d0974d0303fc46675267ffc956
--- first 20 ---

Running 47 tests using 1 worker

	✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:303:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (1.4s)
	✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:331:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.4s)
	✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:353:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.0s)
	✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:376:1 › Regression: BUG-025 an inside-bound response settles normally (3.5s)
	✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:409:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.3s)
	✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:514:1 › four horizon regions render with four summaries and four deep-dive controls (503ms)
	✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:543:1 › Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction (471ms)
	✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:574:1 › an owned dimension renders a deep link whose target is a registered route (478ms)
	✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:618:1 › every rendered numeric value carries a provenance chip, a source name and an as-of date (477ms)
	✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:645:1 › Regression: SCN-025-021 an unavailable dimension renders a named absence and never a dash or a zero (498ms)
	✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:679:1 › Regression: SCN-025-021 a scripted narrative string renders as visible escaped text (465ms)
	✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:704:1 › a position, size or cost basis entry is refused in the browser and nothing is stored (454ms)
	✓  13 [system-chrome] › tests/company-intelligence-lab.spec.mjs:730:1 › each canvas draws non-blank pixels and pairs with a table holding the same values (759ms)
	✓  14 [system-chrome] › tests/company-intelligence-lab.spec.mjs:777:1 › the route defers no drawing and schedules no repeating timer (433ms)
	✓  15 [system-chrome] › tests/company-intelligence-lab.spec.mjs:806:1 › switching the mode segment triggers no request and no recomposition (477ms)
	✓  16 [system-chrome] › tests/company-intelligence-lab.spec.mjs:828:1 › FR-025-017 a second run reuses the cached corpus and refetches no committed bar file (484ms)
	✓  17 [system-chrome] › tests/company-intelligence-lab.spec.mjs:872:1 › at 375 CSS pixels the four summaries stack and the document never scrolls sideways (435ms)
--- omitted 12 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓  30 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1358:1 › Stabilize: the route writes only the shared data container and leaves a sibling tool cache intact (401ms)
	✓  31 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1385:1 › Stabilize: repeat composition of an unchanged subject issues no further request (661ms)
	✓  32 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1417:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (4.8s)
	✓  33 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1455:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.3s)
	✓  34 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1491:1 › Chaos: a background corpus paint does not close a deep dive the reader opened (5.5s)
	✓  35 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1527:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (325ms)
	✓  36 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1573:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (568ms)
	✓  37 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1644:1 › every interactive control on the route is reachable and operable from the keyboard alone (1.2s)
	✓  38 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1790:1 › Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read (1.6s)
	✓  39 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1829:1 › Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card (740ms)
	✓  40 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1878:1 › Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href (517ms)
	✓  41 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1923:1 › Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company (912ms)
	✓  42 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1943:1 › Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject (1.6s)
	✓  43 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1995:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (495ms)
	✓  44 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2083:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (480ms)
	✓  45 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2209:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel (367ms)
	✓  46 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2231:1 › Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel (466ms)
	✓  47 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2267:1 › Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel (314ms)

	47 passed (1.3m)
```

<a name="simplify-phase-repository-selftest"></a>
### Simplify Repository Selftest Receipt

**Phase:** simplify
**Command:** `timeout 960 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 simplify repository selftest" -- timeout 900 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 simplify repository selftest
$ timeout 900 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: 0626a7ae8344f4d7f731fa50bd042f60990311d1a1f961b0a38153db7a2d9b8a
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3866 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (94 claim(s) across 71 packet(s), 80 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 94 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

<a name="simplify-phase-page-check-attempt"></a>
### Auxiliary Page-Check Attempt

**Phase:** simplify
**Command:** `cd ~/research-lab && PAGE=company-intelligence-lab.html timeout 60 node -e 'const fs=require("node:fs");const p=process.env.PAGE;if(!p)throw new Error("PAGE is required");const h=fs.readFileSync(p,"utf8");const scripts=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());if(!scripts.length)throw new Error("no inline script: "+p);scripts.forEach((s,i)=>{try{new Function(s)}catch(e){throw new Error("inline script "+(i+1)+": "+e.message)}});const ids=new Set([...h.matchAll(/\bid=["\x27]([^"\x27]+)["\x27]/g)].map(m=>m[1]));const refs=scripts.flatMap(s=>[...s.matchAll(/getElementById\(\s*["\x27]([^"\x27]+)["\x27]\s*\)/g)].map(m=>m[1]));const missing=[...new Set(refs.filter(id=>!ids.has(id)))];if(missing.length)throw new Error("missing ids: "+missing.join(", "));console.log("OK page="+p+" inline="+scripts.length+" refs="+refs.length)'`
**Exit Code:** 1
**Claim Source:** executed

```text
Error: inline script 1: Unexpected identifier 'is'
		at [eval]:1:365
		at Array.forEach (<anonymous>)
		at [eval]:1:314
		at runScriptInThisContext (node:internal/vm:219:10)
		at node:internal/process/execution:451:12
		at [eval]-wrapper:6:24
		at runScriptInContext (node:internal/process/execution:449:60)
		at evalFunction (node:internal/process/execution:283:30)
		at evalTypeScript (node:internal/process/execution:295:3)
		at node:internal/main/eval_string:71:3
Node.js v24.12.0
```

The command parsed the first non-`src` script as JavaScript.
That script is the route's inert `type="application/json"` configuration mirror.
The focused browser carrier executed the page's production JavaScript after this diagnostic failure.
`BUG-025-SIMPLIFY-GAP-001` routes the command-surface mismatch to `bubbles.gaps`.

<a name="simplify-phase-artifact-lint"></a>
### Simplify Artifact-Lint Receipt

**Phase:** simplify
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 simplify artifact lint" -- timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 simplify artifact lint
$ timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
```

<a name="simplify-phase-final-state-selftest"></a>
### Simplify Final-State Repository Selftest Receipt

**Phase:** simplify
**Command:** `timeout 960 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 Scope 1 simplify final-state repository selftest" -- timeout 900 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 Scope 1 simplify final-state repository selftest
$ timeout 900 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: 6b06dfbf1a96cdc61e1be55b69d9c6ae18cee2641693272d25c8c97dd7765a8a
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3866 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (94 claim(s) across 71 packet(s), 80 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 94 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

<a name="independent-route-closure-bug-027"></a>
## Independent Finding Route Closure — BUG-027

`BUG-025-ROUTE-008` is completed as a filing route only. The independent packet now exists at
`specs/_bugs/BUG-027-per-page-check-executes-inert-json`.

The new packet preserves `BUG-025-SIMPLIFY-GAP-001` as filed and routed. It does not claim that the
command defect is fixed. Its current-session reproduction is recorded in
[BUG-027 report](../BUG-027-per-page-check-executes-inert-json/report.md#current-session-reproduction),
and its artifact-lint receipt is recorded in
[BUG-027 filing lint](../BUG-027-per-page-check-executes-inert-json/report.md#filing-artifact-lint).

This closure changes only the BUG-025 routing record. BUG-025 source, tests, scopes, design, spec,
and certification remain unchanged.

<a name="test-finding-closure-2026-08-31"></a>
## Test Finding Closure — 2026-08-31

`bubbles.test` added the exact SCN-BUG-025-004 carrier to the existing Company Intelligence
browser file. The carrier loads the production route from its ephemeral static origin. An init
script throws synchronously for only `data/bars/MSFT.json` before native `fetch` can return. It
delegates every other fetch to native `fetch` with the original arguments.

The carrier observes the production route rather than supplying a business response. Its request
observer sees no selected-path request. It compares every delegated path with the browser's real
network requests. The visible account reaches `established`, and its performance row retains the
existing `company-not-in-corpus` reason. The injected exception text never reaches visible copy.

The outer-catch discriminator observes the route-owned `Promise.reject` value. It requires the
selected path, `boundExceeded: false`, and `transportUnavailable: false`. An asynchronous rejected
fetch promise would bypass this discriminator. The timer snapshot must show one active helper timer
at the synchronous throw and zero after caller settlement. A retry, native selected-path request,
new visible error, async rejection, or leaked timer therefore fails a separate assertion.

### Carrier RED And Test-Owned Selector Repair

**Phase:** test
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 TEST-003 focused browser selection" -- timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025 TEST-003 focused browser selection
$ timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 1
lines: 41
sha256: b0858306e17bcdd62257ec900a4108eacef84b7eaa6841912e87335875d5432a
--- first 20 ---
Running 6 tests using 1 worker
	✓  1 Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request
	✘  2 Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers
	✓  3 Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result
	✓  4 Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result
	✓  5 Regression: BUG-025 an inside-bound response settles normally
	✓  6 Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles
Error: expect(locator).toBeVisible() failed
Locator: locator('#workspace-coverage')
Expected: visible
Error: element(s) not found
1 failed
5 passed (46.7s)
```

The failed selector named no production element. The repaired carrier selects the existing
`[data-workspace="sources"]` region. The exact scenario then passed before the complete focused
selection ran again.

**Phase:** test
**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --diagnostic --label "BUG-025 TEST-003 targeted carrier after selector repair" -- timeout 90 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 TEST-003 targeted carrier after selector repair
$ timeout 90 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers --reporter=list
exit: 0
lines: 6
sha256: 34ac8f4926c98440dea7346705ff8e911e68f8afaa703f8bae801b715958ff88
escalation: diagnostic (bounded retention waived for this invocation)
--- output ---
Running 1 test using 1 worker
	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:403:1 › Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers (635ms)
	1 passed (2.9s)
```

### Focused BUG-025 Browser Selection

**Phase:** test
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 TEST-003 focused browser final" -- timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 TEST-003 focused browser final
$ timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 0
lines: 11
sha256: f9b159821bccb735f8720233f18e68f0d8d4d20c696ab9c3ae2cd6df9b89d572
--- output ---
Running 6 tests using 1 worker
	✓  1 Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request
	✓  2 Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers
	✓  3 Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result
	✓  4 Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result
	✓  5 Regression: BUG-025 an inside-bound response settles normally
	✓  6 Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles
	6 passed (40.4s)
```

### Complete Company Intelligence Browser File

**Phase:** test
**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 TEST-003 complete Company Intelligence browser final" -- timeout 540 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 TEST-003 complete Company Intelligence browser final
$ timeout 540 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 53
sha256: ad50f62f081c90d457c7cb1cfa95556751516289cedf9083c181b4d3ee44aa22
--- first 20 ---
Running 48 tests using 1 worker
	✓   1 Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request
	✓   2 Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers
	✓   3 Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result
	✓   4 Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result
	✓   5 Regression: BUG-025 an inside-bound response settles normally
	✓   6 Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles
	✓   7 four horizon regions render with four summaries and four deep-dive controls
	✓   8 Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction
--- omitted 13 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓  41 Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href
	✓  42 Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company
	✓  43 Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject
	✓  44 Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it
	✓  45 Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established
	✓  46 Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel
	✓  47 Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel
	✓  48 Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel
	48 passed (1.3m)
```

### Company Intelligence Unit File

**Phase:** test
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 TEST-003 Company Intelligence unit final" -- timeout 240 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 TEST-003 Company Intelligence unit final
$ timeout 240 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 110
sha256: 907a3bd8210f8856a79d51d08bd70241cec6685aafed2157272ea6e4a733d3ba
--- first 20 ---
✔ coverage account holds one row per registry dimension and totals sum to the registry length
✔ SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
✔ every one of the five evidence states is produced by a real adapter outcome
✔ a read aged past its window stays in the denominator as stale rather than becoming neutral
✔ non-financial event dimension reads unavailable with no-source-exists and carries no value
--- omitted 70 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ 027 security — no hostile subject can give the composed owner href a scheme, an authority, a second parameter or a fragment
✔ 027 security — the receiver refuses every hostile subject outright and returns no field carrying it
✔ 027 security — an accepted subject cannot leave data/options/, cannot become a storage key and cannot reach a prototype
✔ 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
✔ 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
ℹ tests 102
ℹ suites 0
ℹ pass 102
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

### Scenario Resolution And Regression Quality

**Phase:** test
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 TEST-003 scenario-test resolver final" -- timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 TEST-003 scenario-test resolver final
$ timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .
exit: 0
lines: 1
sha256: 1b65070ceb8ea92d41519cde3aa9c37554198ac473e88bc20a1c8098e7715742
--- output ---
[scenario-test-resolve] OK — 4 reference(s) resolved via literal-scan; 4 category comparison(s) not applicable (no test-discovery adapter declared)
```

**Phase:** test
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 TEST-003 bugfix regression quality" -- timeout 240 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 TEST-003 bugfix regression quality
$ timeout 240 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 16
sha256: abfdbe64637999417b3d3957354e11a6e6f3886eaedb2cdb88c93c559cb7f4a2
--- output ---
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: ~/research-lab
	Bugfix mode: true
============================================================
ℹ️  Scanning tests/company-intelligence-lab.spec.mjs
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs
============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 1
	Files with adversarial signals: 1
============================================================
```

### Required Repository Selftest — Non-Green Current Tree

**Phase:** test
**Command:** `timeout 960 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 TEST-003 repository selftest final" -- timeout 900 node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025 TEST-003 repository selftest final
$ timeout 900 node scripts/selftest.mjs
exit: 1
lines: 3910
sha256: bffbcfb03b4715359f0e143195e2be2f5341a8bd889e7c0ffc772cb70c8c4982
--- failure-shaped lines from the omitted region ---
✗ FAIL: no active tests/*.mjs path named by a spec artifact is missing outside the frozen baseline; planned-not-authored paths remain visible non-failing debt (1 new, 0 planned, 70 known-missing, 0 stale of 271 referenced)
--- last 20 ---
NEW-DRIFT specs/_bugs/BUG-025-company-corpus-read-never-settles#01::certification (01-declare-and-enforce-one-read-bound) — claims 0/8 checked/unchecked, artifact has 0/9 [specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md]
✗ FAIL: no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (1 new, 14 frozen, 0 stale of 95 claim(s))
================================================
Research-Lab self-test: 3435 passed, 2 failed
================================================
```

The exact path validator identified the first failure as an unauthored focused Node carrier path
referenced by excluded BUG-027 artifacts. That packet and its carrier are outside this invocation's
allowed paths. The second failure is the
validate-owned `certification.scopeProgress` count. Planning added the ninth unchecked DoD item,
while certification still records eight. This invocation preserves certification in progress and
does not edit either excluded surface.

<a name="selftest-001-filing-hygiene-closure"></a>
## BUG-025-SELFTEST-001 Filing-Hygiene Closure

**Claim Source:** interpreted
**Interpretation:** The focused path guard now reports `new=0`, and the repository selftest no longer reports the BUG-027 filing path. The selftest still exits 1 solely on the validate-owned 0/8 versus 0/9 BUG-025 certification count.

Current-session evidence is recorded in the [BUG-027 filing-artifact hygiene receipt](../BUG-027-per-page-check-executes-inert-json/report.md#filing-artifact-hygiene-2026-08-31). This closure changes no BUG-025 scope, scenario, source, test, or certification field.

<a name="selftest-002-certification-mirror-remediation"></a>
## BUG-025-SELFTEST-002 Validate-Owned Certification-Mirror Remediation

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** The focused guard first identified the only new progress drift as the
validate-owned `certification.scopeProgress` claim of 0/8 against the Scope 1 artifact's 0/9.
After the mirror changed to `in_progress`, 0 checked, and 9 unchecked, the same guard reported
zero new drift. The complete repository selftest then reported 3437 passed and zero failed, and
BUG-025 artifact lint passed. These receipts close `BUG-025-SELFTEST-002` as a certification
mirror defect. They do not certify Scope 1 or the packet.

### Focused Scope-Progress Guard Before Reconciliation

**Phase:** validate
**Command:** `timeout 120 node scripts/validate-scope-dod-progress.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
[scope-dod-progress] packets=72 claims=95 agree=80 drift=15 unresolved=0 baseline=14 new=1 stale=0
	NEW-DRIFT specs/_bugs/BUG-025-company-corpus-read-never-settles#01::certification (01-declare-and-enforce-one-read-bound) — claims 0/8 checked/unchecked, artifact has 0/9 [specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md]
[scope-dod-progress] FAIL — 1 scope progress claim(s) do not match their artifact
```

### Focused Scope-Progress Guard After Reconciliation

**Phase:** validate
**Command:** `timeout 120 node scripts/validate-scope-dod-progress.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
[scope-dod-progress] packets=72 claims=95 agree=81 drift=14 unresolved=0 baseline=14 new=0 stale=0
[scope-dod-progress] OK — no new DoD progress drift
```

### Repository Selftest After Reconciliation

**Phase:** validate
**Command:** `timeout 960 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 SELFTEST-002 final repository selftest" -- timeout 900 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 SELFTEST-002 final repository selftest
$ timeout 900 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: 611e021b95c0b206b3d9ece90bd61c250ac349b1e79a2482b092d631c53141ce
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3866 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (95 claim(s) across 72 packet(s), 81 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 95 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

### BUG-025 Artifact Lint After Reconciliation

**Phase:** validate
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 SELFTEST-002 final artifact lint" -- timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 SELFTEST-002 final artifact lint
$ timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
```

### Finding And Routing Disposition

| Finding | Disposition | Evidence or owner |
| --- | --- | --- |
| `BUG-025-SELFTEST-002` | Addressed | The focused guard reports 0 new drift, the repository selftest reports 3437/3437, and artifact lint passes. |
| `BUG-025-REGRESSION-REVERIFY` | Unresolved | `bubbles.regression` must re-evaluate the changed persistent browser carrier before the later bugfix-fastlane phases proceed. |

No certification or promotion occurred. Scope 1 remains `In Progress`, all nine DoD items remain
unchecked, both packet status mirrors remain `in_progress`, completion arrays remain empty, and no
`certifiedAt` value was added. The final validation phase was not executed by this surgical metadata
remediation.

<a name="regression-reverification-2026-08-31"></a>
## Regression Re-verification — 2026-08-31

This section records the independent `bubbles.regression` re-verification after
`SCN-BUG-025-004` entered the persistent browser carrier and the two repository-selftest ownership
findings were closed. It does not reuse the test or validate executions as regression evidence.
Scope 1, packet status, and certification remain in progress.

### Exact Repository Binding

**Phase:** regression
**Command:** `timeout 30 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/bug-025-regression-reverify-inherited-packet.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=~/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:6 revision=6
```

The command validated the supplied revision-6 packet. This invocation did not run repository
preflight and did not advance the control revision.

### Baseline And Coverage Delta

**Claim Source:** interpreted
**Interpretation:** Every current result below comes from this regression invocation. The
post-change TEST handoff is the immediate comparison baseline. The earlier regression phase is the
pre-`SCN-BUG-025-004` inventory baseline. Research Lab declares no line-coverage command, so this
section makes no percentage claim.

| Carrier | Immediate post-change baseline | Current regression execution | Delta | Result |
| --- | ---: | ---: | ---: | --- |
| Focused BUG-025 browser | 6/6 | 6/6 | 0 | Stable |
| Complete Company Intelligence browser | 48/48 | 48/48 | 0 | Stable |
| Company Intelligence unit | 102/102 | 102/102 | 0 | Stable |
| Repository selftest | 3437/3437 | 3437/3437 | 0 | Stable |
| BUG-025 scenario links | 4 resolved | 4 resolved | 0 | Stable |

Against the earlier pre-`SCN-BUG-025-004` regression record, the complete browser inventory grew
from 47 to 48 passing cases and the scenario manifest grew from three to four resolved links. No
carrier count decreased.

<a name="regression-reverify-focused-browser"></a>
### Focused BUG-025 Browser

**Phase:** regression
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 regression reverify focused browser" -- timeout 300 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 regression reverify focused browser
$ timeout 300 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 0
lines: 11
sha256: 3be98e241e177937b6d9043df22f3f1519ce3a0bcb72f054b4d47a2a7668bbed
--- output ---

Running 6 tests using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:375:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (459ms)
	✓  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:403:1 › Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers (546ms)
	✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:463:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.3s)
	✓  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:485:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.4s)
	✓  5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:508:1 › Regression: BUG-025 an inside-bound response settles normally (3.4s)
	✓  6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:541:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.2s)

	6 passed (40.5s)
```

<a name="regression-reverify-complete-browser"></a>
### Complete Company Intelligence Browser

**Phase:** regression
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 regression reverify complete Company Intelligence browser" -- timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 regression reverify complete Company Intelligence browser
$ timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 53
sha256: a60a6eba81c136adb429debd21e4be9122fead2f5321c88b307106e8eb7e690c
--- first 20 ---

Running 48 tests using 1 worker

	✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:375:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (392ms)
	✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:403:1 › Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers (500ms)
	✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:463:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.4s)
	✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:485:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.4s)
	✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:508:1 › Regression: BUG-025 an inside-bound response settles normally (3.5s)
	✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:541:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.2s)
	✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:646:1 › four horizon regions render with four summaries and four deep-dive controls (457ms)
	✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:675:1 › Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction (438ms)
	✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:706:1 › an owned dimension renders a deep link whose target is a registered route (486ms)
	✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:750:1 › every rendered numeric value carries a provenance chip, a source name and an as-of date (458ms)
	✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:777:1 › Regression: SCN-025-021 an unavailable dimension renders a named absence and never a dash or a zero (494ms)
	✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:811:1 › Regression: SCN-025-021 a scripted narrative string renders as visible escaped text (470ms)
	✓  13 [system-chrome] › tests/company-intelligence-lab.spec.mjs:836:1 › a position, size or cost basis entry is refused in the browser and nothing is stored (662ms)
	✓  14 [system-chrome] › tests/company-intelligence-lab.spec.mjs:862:1 › each canvas draws non-blank pixels and pairs with a table holding the same values (781ms)
	✓  15 [system-chrome] › tests/company-intelligence-lab.spec.mjs:909:1 › the route defers no drawing and schedules no repeating timer (371ms)
	✓  16 [system-chrome] › tests/company-intelligence-lab.spec.mjs:938:1 › switching the mode segment triggers no request and no recomposition (482ms)
	✓  17 [system-chrome] › tests/company-intelligence-lab.spec.mjs:960:1 › FR-025-017 a second run reuses the cached corpus and refetches no committed bar file (511ms)
--- omitted 13 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓  31 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1490:1 › Stabilize: the route writes only the shared data container and leaves a sibling tool cache intact (433ms)
	✓  32 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1517:1 › Stabilize: repeat composition of an unchanged subject issues no further request (678ms)
	✓  33 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1549:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (4.8s)
	✓  34 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1587:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.3s)
	✓  35 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1623:1 › Chaos: a background corpus paint does not close a deep dive the reader opened (5.4s)
	✓  36 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1659:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (318ms)
	✓  37 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1705:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (516ms)
	✓  38 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1776:1 › every interactive control on the route is reachable and operable from the keyboard alone (1.1s)
	✓  39 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1922:1 › Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read (1.2s)
	✓  40 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1961:1 › Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card (661ms)
	✓  41 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2010:1 › Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href (480ms)
	✓  42 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2055:1 › Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company (857ms)
	✓  43 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2075:1 › Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject (1.5s)
	✓  44 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2127:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (418ms)
	✓  45 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2215:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (487ms)
	✓  46 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2341:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel (401ms)
	✓  47 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2363:1 › Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel (473ms)
	✓  48 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2399:1 › Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel (374ms)

	48 passed (1.2m)
```

<a name="regression-reverify-unit"></a>
### Company Intelligence Unit

**Phase:** regression
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 regression reverify Company Intelligence unit" -- timeout 240 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 regression reverify Company Intelligence unit
$ timeout 240 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 110
sha256: ee48b408435dcdeb2595a7b16e783ba45905351f0bac9077d04694bb5d05e1a4
--- first 20 ---
✔ coverage account holds one row per registry dimension and totals sum to the registry length (11.343463ms)
✔ SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary (2.489991ms)
✔ every one of the five evidence states is produced by a real adapter outcome (3.505988ms)
✔ a read aged past its window stays in the denominator as stale rather than becoming neutral (6.896477ms)
✔ non-financial event dimension reads unavailable with no-source-exists and carries no value (1.814294ms)
✔ an unavailable dimension never renders as a zero or a neutral number (2.067993ms)
✔ an unresolvable identifier raises C025-IDENTITY-UNRESOLVED and composes no horizon (2.123893ms)
✔ a company outside every corpus yields four horizons with absent quality and none direction (2.385092ms)
✔ every claim cites a value present in its own horizon input set (4.102587ms)
✔ a claim citing a value outside its own input set raises C025-HORIZON-ISOLATION (1.866994ms)
✔ four unavailable contributors downgrade evidence quality and populate gapEffect (3.521588ms)
✔ a horizon whose signalled dimensions are evenly opposed composes flat rather than picking a winner (7.428275ms)
✔ the evidence band a horizon publishes follows the count of signalled dimensions it composed (4.448185ms)
✔ two opposing horizons keep their directions and produce one contradiction record (2.157693ms)
✔ SCN-025-008 the published read version keeps both opposed horizon directions and holds no blended direction key (4.711284ms)
✔ module source contains no second definition of a volatility or ratio metric (1.485195ms)
✔ the module holds no DOM, storage, credential, clock or timer authority (2.359692ms)
✔ the module exports a frozen api and loads under Node through module.exports (0.416799ms)
✔ every reason code and every refusal code named by the design appears in the module source (0.2823ms)
✔ all eleven C025 refusal codes are raised by a real call path (5.607282ms)
--- omitted 70 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ the authored branch budget still refuses one branch beyond maxBranches and the recorded budget is unchanged (0.196799ms)
✔ the configuration records the branch budget and the refused-branch counting decision with written rationales (0.1484ms)
✔ the committed MSFT research plan and version tree are authored, dated and free of any position value (0.995796ms)
✔ adversarial: an owner envelope naming another company ONLY by ticker, or ONLY by cik, is refused (4.295486ms)
✔ the coverage account refuses a read set missing any one registry dimension rather than dropping the row (1.435495ms)
✔ a past-dated event still classed scheduled is partitioned as occurred, not presented as a forecast (0.363898ms)
✔ makeRead refuses a non-current read whose reason code is outside the closed vocabulary (3.493689ms)
✔ 027 security — no hostile subject can give the composed owner href a scheme, an authority, a second parameter or a fragment (3.02759ms)
✔ 027 security — the receiver refuses every hostile subject outright and returns no field carrying it (1.261896ms)
✔ 027 security — an accepted subject cannot leave data/options/, cannot become a storage key and cannot reach a prototype (2.671291ms)
✔ 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup (1.029997ms)
✔ 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes (5.361282ms)
ℹ tests 102
ℹ suites 0
ℹ pass 102
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 339.451472
```

<a name="regression-reverify-repository-selftest"></a>
### Repository Selftest

**Phase:** regression
**Command:** `timeout 960 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 regression reverify repository selftest" -- timeout 900 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 regression reverify repository selftest
$ timeout 900 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: 4fa52a9977ed6081b713cd756d9f416ba1979cd4a1426d4caaae4a91f8736aac
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3866 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (95 claim(s) across 72 packet(s), 81 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 95 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

The selftest contains no residual missing-path finding for the BUG-027 filing and no new
scope-progress drift for BUG-025. This current-session run independently closes the carried
repository-selftest precondition for regression re-verification.

<a name="regression-reverify-scenario-resolver"></a>
### Scenario-Test Resolver

**Phase:** regression
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 regression reverify scenario-test resolver" -- timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 regression reverify scenario-test resolver
$ timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .
exit: 0
lines: 1
sha256: 1b65070ceb8ea92d41519cde3aa9c37554198ac473e88bc20a1c8098e7715742
--- output ---
[scenario-test-resolve] OK — 4 reference(s) resolved via literal-scan; 4 category comparison(s) not applicable (no test-discovery adapter declared)
```

<a name="regression-reverify-quality-guard"></a>
### Bugfix Regression-Quality Guard

**Phase:** regression
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 regression reverify bugfix quality guard" -- timeout 240 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 regression reverify bugfix quality guard
$ timeout 240 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 16
sha256: f0942228f1886c10c999e956521ea8ad72fc8845ab25519dd2d8b149783bcc36
--- output ---
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: ~/research-lab
	Timestamp: 2026-08-31T07:42:45Z
	Bugfix mode: true
============================================================

ℹ️  Scanning tests/company-intelligence-lab.spec.mjs
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs

============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 1
	Files with adversarial signals: 1
============================================================
```

<a name="regression-reverify-artifact-lint"></a>
### BUG-025 Artifact Lint

**Phase:** regression
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 regression reverify artifact lint" -- timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 regression reverify artifact lint
$ timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
```

<a name="regression-reverify-discrimination"></a>
### Synchronous-Throw Discrimination

**Phase:** regression
**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 regression reverify synchronous discriminator inspection" -- timeout 60 grep -nE 'function routeDocumentFailure|function readRouteDocument|timer = setTimeout|return fetch\(path|\.finally\(clearReadTimer\)|catch \(error\)|return Promise\.reject\(routeDocumentFailure|function installSynchronousFetchSetupFailure|Promise\.reject =|throw new TypeError\(failureMessage\)|return nativeFetch\(input, init\)|activeAtThrow|selectedAttempts|networkFetchPaths\.filter|transportUnavailable: false|activeTimers|timersCleared|timersCreated|Regression: BUG-025 synchronous fetch setup failure' company-intelligence-lab.html tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The selected-path wrapper directly throws before calling `nativeFetch`, while
every non-selected path returns the native request. Production arms the timer before its only
`fetch()` call. Only the outer synchronous `catch` clears that timer and calls
`Promise.reject(routeDocumentFailure(..., false))`. The test observes that call and requires
`transportUnavailable: false`. Replacing the direct throw with an asynchronously rejected fetch
promise would enter the promise rejection branch instead, never trigger the patched
`Promise.reject` observer, leave `outerCatch` null, and fail the exact scenario. Separate assertions
require one selected attempt, zero selected-path network requests, one active timer at the throw,
zero active timers after settlement, and equal created and cleared counts. The case is therefore
discriminating rather than a generic unavailable-state test.

```text
# BUG-025 regression reverify synchronous discriminator inspection
$ timeout 60 grep -nE 'function routeDocumentFailure|function readRouteDocument|timer = setTimeout|return fetch\(path|\.finally\(clearReadTimer\)|catch \(error\)|return Promise\.reject\(routeDocumentFailure|function installSynchronousFetchSetupFailure|Promise\.reject =|throw new TypeError\(failureMessage\)|return nativeFetch\(input, init\)|activeAtThrow|selectedAttempts|networkFetchPaths\.filter|transportUnavailable: false|activeTimers|timersCleared|timersCreated|Regression: BUG-025 synchronous fetch setup failure' company-intelligence-lab.html tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 36
sha256: 8eef18a177ae38b3accc5fe2045f9a5879358d25c59817b7f8117a040f524885
--- output ---
company-intelligence-lab.html:1620:            function routeDocumentFailure(path, error, boundExceeded, transportUnavailable) {
company-intelligence-lab.html:1634:            function readRouteDocument(path, consumeResponse) {
company-intelligence-lab.html:1648:                    timer = setTimeout(function () {
company-intelligence-lab.html:1652:                    return fetch(path, { cache: "no-store", signal: controller.signal })
company-intelligence-lab.html:1661:                        .finally(clearReadTimer);
company-intelligence-lab.html:1662:                } catch (error) {
company-intelligence-lab.html:1664:                    return Promise.reject(routeDocumentFailure(path, error, expired, false));
tests/company-intelligence-lab.spec.mjs:210:async function installSynchronousFetchSetupFailure(page, selectedPath) {
tests/company-intelligence-lab.spec.mjs:212:        const activeTimers = new Set();
tests/company-intelligence-lab.spec.mjs:214:            activeAtThrow: null,
tests/company-intelligence-lab.spec.mjs:217:            selectedAttempts: 0,
tests/company-intelligence-lab.spec.mjs:218:            timersCleared: 0,
tests/company-intelligence-lab.spec.mjs:219:            timersCreated: 0
tests/company-intelligence-lab.spec.mjs:231:                activeTimers.add(handle);
tests/company-intelligence-lab.spec.mjs:232:                stats.timersCreated += 1;
tests/company-intelligence-lab.spec.mjs:237:            if (activeTimers.delete(handle)) stats.timersCleared += 1;
tests/company-intelligence-lab.spec.mjs:240:        Promise.reject = function (reason) {
tests/company-intelligence-lab.spec.mjs:257:                stats.selectedAttempts += 1;
tests/company-intelligence-lab.spec.mjs:258:                stats.activeAtThrow = activeTimers.size;
tests/company-intelligence-lab.spec.mjs:259:                throw new TypeError(failureMessage);
tests/company-intelligence-lab.spec.mjs:262:            return nativeFetch(input, init);
tests/company-intelligence-lab.spec.mjs:267:            activeAtThrow: stats.activeAtThrow,
tests/company-intelligence-lab.spec.mjs:268:            activeTimers: activeTimers.size,
tests/company-intelligence-lab.spec.mjs:271:            selectedAttempts: stats.selectedAttempts,
tests/company-intelligence-lab.spec.mjs:272:            timersCleared: stats.timersCleared,
tests/company-intelligence-lab.spec.mjs:273:            timersCreated: stats.timersCreated
tests/company-intelligence-lab.spec.mjs:403:test('Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers', async ({ page }) => {
tests/company-intelligence-lab.spec.mjs:442:    expect(snapshot.selectedAttempts, 'the selected fetch setup failure must not retry').toBe(1);
tests/company-intelligence-lab.spec.mjs:443:    expect(snapshot.activeAtThrow, 'the selected read timer must exist before fetch setup throws').toBe(1);
tests/company-intelligence-lab.spec.mjs:448:        transportUnavailable: false
tests/company-intelligence-lab.spec.mjs:450:    expect(networkFetchPaths.filter((path) => path === selectedPath),
tests/company-intelligence-lab.spec.mjs:458:    expect(snapshot.activeTimers, 'a bounded-read timer remained active after caller settlement').toBe(0);
tests/company-intelligence-lab.spec.mjs:459:    expect(snapshot.timersCreated, 'the route did not exercise any bounded reads').toBeGreaterThan(0);
tests/company-intelligence-lab.spec.mjs:460:    expect(snapshot.timersCleared, 'not every bounded-read timer was cleared').toBe(snapshot.timersCreated);
```

### Protected Feature 025 And BUG-018 Carrier

**Phase:** regression
**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 regression reverify protected browser inventory" -- timeout 60 grep -nE '^test\(.+(SCN-025|FR-025|NFR-025|BUG-018|four horizon regions|owned dimension|numeric value|position, size|canvas draws|mode segment)' tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The source inventory retains fifteen named Feature 025 behavior cases and all
five BUG-018 cases. The complete 48-case browser execution above includes Feature 025 cases in its
first retained window and all five BUG-018 cases in its last retained window. Each shown case passed.

```text
# BUG-025 regression reverify protected browser inventory
$ timeout 60 grep -nE '^test\(.+(SCN-025|FR-025|NFR-025|BUG-018|four horizon regions|owned dimension|numeric value|position, size|canvas draws|mode segment)' tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 20
sha256: 8c929984a1f00b385708dc9302bca7cd7daa358a9aef7d2e8d499d35012a3156
--- output ---
646:test('four horizon regions render with four summaries and four deep-dive controls', async ({ page }) => {
675:test('Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction', async ({ page }) => {
706:test('an owned dimension renders a deep link whose target is a registered route', async ({ page }) => {
750:test('every rendered numeric value carries a provenance chip, a source name and an as-of date', async ({ page }) => {
777:test('Regression: SCN-025-021 an unavailable dimension renders a named absence and never a dash or a zero', async ({ page }) => {
811:test('Regression: SCN-025-021 a scripted narrative string renders as visible escaped text', async ({ page }) => {
836:test('a position, size or cost basis entry is refused in the browser and nothing is stored', async ({ page }) => {
862:test('each canvas draws non-blank pixels and pairs with a table holding the same values', async ({ page }) => {
938:test('switching the mode segment triggers no request and no recomposition', async ({ page }) => {
960:test('FR-025-017 a second run reuses the cached corpus and refetches no committed bar file', async ({ page }) => {
1060:test('Regression: SCN-025-016 a passed event renders as occurred and never as an upcoming catalyst', async ({ page }) => {
1175:test('Regression: SCN-025-022 the outcome record shows the predecessor unmodified beside the new version', async ({ page }) => {
1213:test('FR-025-022 each deep dive lists every contributing read with its state, source and as-of date', async ({ page }) => {
1262:test('FR-025-014 every dated coverage row states its age, so a stale read cannot read as current', async ({ page }) => {
1300:test('NFR-025-005 every rendered ticker is a linked, described token from the shared ticker module', async ({ page }) => {
2127:test('Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it', async ({ page }) => {
2215:test('Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established', async ({ page }) => {
2341:test('Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel', async ({ page }) => {
2363:test('Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel', async ({ page }) => {
2399:test('Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel', async ({ page }) => {
```

### Change-Boundary And Design-Coherence Check

**Phase:** regression
**Command:** `timeout 60 sha256sum company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md && timeout 60 git diff --check -- company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** These hashes match the pre-execution regression epoch. The browser and Node
commands changed none of the protected product, test, scenario, selftest, or planning bytes. The
new scenario matches the design's explicit synchronous setup-failure cleanup requirement. It adds
no route, data model, storage surface, API contract, or product behavior. The complete shared
carrier therefore provides the affected Feature 025 and BUG-018 cross-spec check.

```text
2026-08-31T07:44:17Z
937dffcc2c78cf29e77d280f93c39c0a38c057e3035f60966f8582f1f3d4dded  company-intelligence.config.json
b6b25b42a903f9911ce9c3bfeba99346d723bba5bf3dac96ba93b0ff2cb6c78c  company-intelligence-lab.html
14c4af82444fe0e4a07d456c18d34effd127042bca66e543244c0d008259c9f8  rlcompanyintel.js
762c332c67d6c39f69b3cf86e3c92643599839bc6073c38636cc12832cdfc106  tests/company-intelligence.unit.mjs
78bb8f45c5f7fbe3cf5f1be361444f14a021de89924bacad9eb6f937a4ce318b  tests/company-intelligence-lab.spec.mjs
0c9b75e903a7a782acf604ce88dc5546e868a5b93ce21033b3948b519359e144  scripts/selftest.mjs
885b29e4ec81ca189971be1e7b567622aabf2b1d9842ae254ab1d80ea353156b  specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json
293f8696a8b77f0df087686fa5ae3a1e14c3efc3fe9514b8836fed20b7692fdb  specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md
BUG025_REGRESSION_REVERIFY_POSTCHECK=PASS
```

### Finding Accounting And Verdict

| Finding | Disposition | Evidence |
| --- | --- | --- |
| `BUG-025-ROUTE-010` | Addressed | The changed persistent carrier was re-evaluated through the focused and complete browser runs, source discrimination audit, unit carrier, repository selftest, scenario resolver, quality guard, and artifact lint. |
| `BUG-025-REGRESSION-REVERIFY` | Addressed | [Focused browser](#regression-reverify-focused-browser), [complete browser](#regression-reverify-complete-browser), [unit](#regression-reverify-unit), [repository selftest](#regression-reverify-repository-selftest), and [scenario resolver](#regression-reverify-scenario-resolver) all exited zero. |

No new regression, coverage loss, route collision, design contradiction, protected-scenario loss,
or unresolved finding was found.

🟢 REGRESSION_FREE

- Test baseline: focused browser 6/6 to 6/6; complete browser 48/48 to 48/48; unit 102/102 to 102/102; repository selftest 3437/3437 to 3437/3437.
- Cross-spec conflicts: 0.
- Design contradictions: 0.
- Coverage: stable by executed carrier inventory and increased by one browser case versus the pre-`SCN-BUG-025-004` regression epoch. No line-coverage percentage is claimed.
- Gherkin traceability: 4 of 4 links resolved.

The next unexecuted phase in the registered `bugfix-fastlane` order is `harden`. Transition request
`BUG-025-ROUTE-011` carries that phase route to `bubbles.harden`. Scope 1, top-level status,
certification status, all nine DoD items, and both completion arrays remain in progress.

<a name="operator-acceptance-and-automation-readiness-2026-08-31"></a>
## Operator Acceptance And Automation Readiness — 2026-08-31

This was a surgical, non-certifying readiness step. The exact inherited Research Lab packet was
validated at decision `rb:vscode-20072c8d3f74af455af2514e746fced3:7` and control revision 7.
No preflight ran and the control revision was not advanced. This step did not execute the final
validate phase, certify a scope, promote the packet, complete a DoD item, or alter the pending
`BUG-025-ROUTE-011` route to `bubbles.harden`.

### External Operator Acceptance

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** The operator explicitly directed this session to record acceptance using the
verbatim statements "authorized, approved, update all user validations as approved" and "Don't
stop for user review, commit, continue, user approves all". Those statements support an
`external-record` acceptance by `pkirsanov`. They do not establish that the operator personally
exercised the route in a browser. No ticket or live walkthrough is claimed.

The two human Checklist items in `uservalidation.md` are checked as the operator's judgment. The
four Automation Readiness items are supported separately by the current executions below.

### Browser Runner Identity

**Phase:** validate
**Command:** `timeout 60 npx --no-install playwright --version`
**Exit Code:** 0
**Claim Source:** executed

```text
Version 1.61.1
```

<a name="acceptance-readiness-focused-browser"></a>
### Focused Production-Route Browser Readiness

**Phase:** validate
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 acceptance readiness focused production-route browser" -- timeout 300 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 acceptance readiness focused production-route browser
$ timeout 300 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 0
lines: 11
sha256: b0afa19e9004b3ab31b35cb441548f655331471d712150cacf1257d0886a42eb
--- output ---

Running 6 tests using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:375:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (595ms)
	✓  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:403:1 › Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers (585ms)
	✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:463:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.5s)
	✓  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:485:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.5s)
	✓  5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:508:1 › Regression: BUG-025 an inside-bound response settles normally (3.7s)
	✓  6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:541:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.3s)

	6 passed (41.4s)
```

<a name="acceptance-readiness-unit"></a>
### 102-Case Unit Carrier

**Phase:** validate
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 acceptance readiness 102-case unit carrier" -- timeout 240 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 acceptance readiness 102-case unit carrier
$ timeout 240 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 110
sha256: 9ef71ac4e3755e2b9ec343d15283c0bcc0f7e5fe947ac3fd53d8f69bb8dcb88d
--- first 20 ---
✔ coverage account holds one row per registry dimension and totals sum to the registry length (14.733786ms)
✔ SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary (2.362382ms)
✔ every one of the five evidence states is produced by a real adapter outcome (3.86417ms)
✔ a read aged past its window stays in the denominator as stale rather than becoming neutral (7.658541ms)
✔ non-financial event dimension reads unavailable with no-source-exists and carries no value (1.718087ms)
✔ an unavailable dimension never renders as a zero or a neutral number (1.853786ms)
✔ an unresolvable identifier raises C025-IDENTITY-UNRESOLVED and composes no horizon (0.913493ms)
✔ a company outside every corpus yields four horizons with absent quality and none direction (3.517673ms)
✔ every claim cites a value present in its own horizon input set (3.86867ms)
✔ a claim citing a value outside its own input set raises C025-HORIZON-ISOLATION (5.09566ms)
✔ four unavailable contributors downgrade evidence quality and populate gapEffect (3.373074ms)
✔ a horizon whose signalled dimensions are evenly opposed composes flat rather than picking a winner (4.149368ms)
✔ the evidence band a horizon publishes follows the count of signalled dimensions it composed (4.388666ms)
✔ two opposing horizons keep their directions and produce one contradiction record (2.494081ms)
✔ SCN-025-008 the published read version keeps both opposed horizon directions and holds no blended direction key (4.452265ms)
✔ module source contains no second definition of a volatility or ratio metric (1.614088ms)
✔ the module holds no DOM, storage, credential, clock or timer authority (2.171983ms)
✔ the module exports a frozen api and loads under Node through module.exports (0.380397ms)
✔ every reason code and every refusal code named by the design appears in the module source (0.203398ms)
✔ all eleven C025 refusal codes are raised by a real call path (5.936754ms)
--- omitted 70 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ the authored branch budget still refuses one branch beyond maxBranches and the recorded budget is unchanged (0.427097ms)
✔ the configuration records the branch budget and the refused-branch counting decision with written rationales (0.466096ms)
✔ the committed MSFT research plan and version tree are authored, dated and free of any position value (1.26639ms)
✔ adversarial: an owner envelope naming another company ONLY by ticker, or ONLY by cik, is refused (4.613964ms)
✔ the coverage account refuses a read set missing any one registry dimension rather than dropping the row (1.411489ms)
✔ a past-dated event still classed scheduled is partitioned as occurred, not presented as a forecast (0.510896ms)
✔ makeRead refuses a non-current read whose reason code is outside the closed vocabulary (3.404774ms)
✔ 027 security — no hostile subject can give the composed owner href a scheme, an authority, a second parameter or a fragment (3.289775ms)
✔ 027 security — the receiver refuses every hostile subject outright and returns no field carrying it (1.352289ms)
✔ 027 security — an accepted subject cannot leave data/options/, cannot become a storage key and cannot reach a prototype (2.931977ms)
✔ 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup (1.200591ms)
✔ 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes (6.975246ms)
ℹ tests 102
ℹ suites 0
ℹ pass 102
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 377.256099
```

<a name="acceptance-readiness-scenario-resolver"></a>
### Scenario Resolver

**Phase:** validate
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 acceptance readiness scenario resolver" -- timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 acceptance readiness scenario resolver
$ timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .
exit: 0
lines: 1
sha256: 1b65070ceb8ea92d41519cde3aa9c37554198ac473e88bc20a1c8098e7715742
--- output ---
[scenario-test-resolve] OK — 4 reference(s) resolved via literal-scan; 4 category comparison(s) not applicable (no test-discovery adapter declared)
```

<a name="acceptance-readiness-artifact-lint"></a>
### Acceptance And Readiness Record Lint

**Phase:** validate
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 acceptance readiness artifact lint" -- timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 acceptance readiness artifact lint
$ timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
```

### Readiness Mapping

| Automation-readiness claim | Current assertion | Result |
| --- | --- | --- |
| Never-answering response is aborted at the declared bound | Focused browser cases 3 and 4 require the held server request to close at the configured bound. | Passed |
| Route settles unavailable after abort | Focused browser cases 3 and 4 require the named unavailable result after the close. | Passed |
| Inside-bound response loads normally | Focused browser case 5 releases before the bound and requires normal settlement. | Passed |
| Cache-first first paint is network-independent | Focused browser cases 5 and 6 require embedded first paint before delayed or stalled network settlement. | Passed |

The focused browser selection reported 6 of 6, the complete unit carrier reported 102 of 102,
and the resolver mapped 4 of 4 active scenario references. These current assertions support all
four checked Automation Readiness items.

### Commit-Authorization Schema Check

The framework supports `autoCommit.mode: scope`, but the installed policy-source enum permits only
`user-request`, `repo-default`, `workflow-forced`, and `spec-lockdown`. It does not support the
requested literal `source: operator-directive`. Therefore `policySnapshot.autoCommit` remains
unchanged as `{ "mode": "off", "source": "repo-default" }`. The top-level runner retains the
current operator commit authorization; this surgical step did not commit, stage, or alter policy
provenance to an unsupported value.

### Finding And Routing Disposition

| Finding | Disposition | Evidence |
| --- | --- | --- |
| `BUG-025-ACCEPTANCE-RECORD` | Addressed | `uservalidation.md#human-acceptance-record` records `pkirsanov`, the current UTC time, `external-record`, and the current operator directive without claiming live human exercise. |
| `BUG-025-AUTOMATION-READINESS` | Addressed | [Focused browser](#acceptance-readiness-focused-browser), [unit carrier](#acceptance-readiness-unit), [scenario resolver](#acceptance-readiness-scenario-resolver), and [artifact lint](#acceptance-readiness-artifact-lint) all exited zero. |

No finding is hidden or unresolved in this surgical step. The unchanged pending route remains
`BUG-025-ROUTE-011` to `bubbles.harden`. Top-level status, Scope 1 status, all nine DoD items,
certification status and progress, completed arrays, scenario metadata, product source, and tests
remain unchanged.

<a name="harden-phase-2026-08-31"></a>
## Harden Phase — 2026-08-31

This bounded `bubbles.harden` pass independently read the active BUG-025 contract, current
production helper, and persistent unit and browser carriers. It executed every command requested
for this phase. No source, test, scope, DoD, acceptance, or certification artifact changed.
Scope 1 and both status mirrors remain in progress.

### Exact Revision-7 Repository Binding

**Phase:** harden
**Command:** `printf '%s\n' '{"repositoryRoot":"/home/philipk/research-lab","repositoryAlias":"research-lab","repositoryResolution":{"sessionId":"vscode-20072c8d3f74af455af2514e746fced3","decisionId":"rb:vscode-20072c8d3f74af455af2514e746fced3:7","controlRevision":7,"controlPathDigest":"sha256:7e982c9a1b25048dd68c8c758dbc39cdc603988bddfe07251568ed72f9d0becc","authority":"explicit-repository-root","transition":"confirmed","scopeKind":"command","scopeId":null,"targetKind":"repository-root","pathVisibility":"local","actionable":true}}' | timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /dev/stdin`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:7 revision=7
```

No repository preflight ran and the inherited control revision did not advance.

### Bounded Artifact And Source Inspection

**Claim Source:** interpreted
**Interpretation:** The claims below come from the current reads of `scopes.md`, `state.json`,
`scenario-manifest.json`, `uservalidation.md`, the `readRouteDocument()` production region, and
the BUG-025 unit and browser helper/case regions. The executed resolver and test carriers below
provide the behavioral half of the assessment.

| Check | Observed result |
| --- | --- |
| Scenario links | Four manifest scenarios carry concrete `linkedTests`; the resolver reported 4 references resolved. |
| Test Plan and DoD | The single scope has 6 Test Plan rows and 9 DoD checkbox items. All 9 remain unchecked. |
| Certification mirror | `certification.scopeProgress` remains `dodChecked: 0`, `dodUnchecked: 9`; both status mirrors remain `in_progress`. |
| Acceptance | All 4 Automation Readiness items and both Checklist items are checked. The acceptance method is `external-record`, and the record explicitly disclaims a live operator walkthrough. |
| One request primitive | `readRouteDocument()` contains the route's only `fetch()` site, creates a fresh `AbortController`, and passes `controller.signal` to that request. |
| Bound ownership | The helper snapshots validated `registry.readBoundMs`; callers pass no duration and own no timer or controller. |
| Cleanup and request count | The helper clears through one promise `finally` path plus the synchronous setup catch. Browser assertions require timer parity, zero active timers, and one request or one selected attempt. |
| No retry or hidden duration | The helper issues one fetch and has no retry branch. The unit carrier rejects missing or invalid bounds and checks that callers contain no direct fetch, timer, controller, or numeric timeout. |
| Browser coverage | The six focused cases cover invalid embedded config, synchronous setup failure, no-header expiry, partial-body expiry, inside-bound success, and stalled served config. The complete carrier also exercises timer cleanup after HTTP, malformed, aborted, successful, and file-origin outcomes plus one-request controls. |
| Stale intent | Production snapshots `readingIntent` and suppresses an obsolete final repaint. The browser carrier does not drive two valid subject intents while the first corpus read remains pending, so it does not discriminate removal of `if (intent !== readingIntent) return;`. |

### Harden Finding — BUG-025-HARDEN-001

**Phase:** harden
**Command:** `timeout 60 grep -nE 'readingIntent|intent !== readingIntent|Regression: BUG-018 scope 1 data-corpus-status describes|Chaos: a background corpus paint|subject-apply.*click' company-intelligence-lab.html tests/company-intelligence-lab.spec.mjs`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** Production increments `readingIntent`, snapshots it for each corpus load, and
suppresses the final repaint when the snapshot is stale. The test search found apply actions and
two adjacent protections, but no browser test references the guard or performs two successive
valid-subject intents with the first corpus request still pending. Reading every returned apply
context confirmed that the BUG-018 case starts from a settled subject and the background-paint
case has only one new intent. Both would remain green if the stale-intent guard were removed.

```text
company-intelligence-lab.html:761:            var readingIntent = 0;
company-intelligence-lab.html:1585:                readingIntent += 1;
company-intelligence-lab.html:1689:                var intent = readingIntent;
company-intelligence-lab.html:1700:                        if (intent !== readingIntent) return;
company-intelligence-lab.html:1875:                byId("subject-apply").addEventListener("click", applySubject);
tests/company-intelligence-lab.spec.mjs:822:    await page.locator('#subject-apply').click();
tests/company-intelligence-lab.spec.mjs:840:    await page.locator('#subject-apply').click();
tests/company-intelligence-lab.spec.mjs:985:    await page.locator('#subject-apply').click();
tests/company-intelligence-lab.spec.mjs:1501:    await page.locator('#subject-apply').click();
tests/company-intelligence-lab.spec.mjs:1536:        await page.locator('#subject-apply').click();
tests/company-intelligence-lab.spec.mjs:1623:test('Chaos: a background corpus paint does not close a deep dive the reader opened', async ({ page }) => {
tests/company-intelligence-lab.spec.mjs:1640:        document.getElementById('subject-apply').click();
tests/company-intelligence-lab.spec.mjs:2127:test('Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it', async ({ page }) => {
tests/company-intelligence-lab.spec.mjs:2154:            document.getElementById('subject-apply').click();
tests/company-intelligence-lab.spec.mjs:2192:            document.getElementById('subject-apply').click();
```

The missing carrier must hold one valid subject's request, apply a second valid subject, release
the old request after the new intent exists, and prove the old completion cannot repaint or
publish over the newer reading. This is test-owned work; no source defect is asserted.

### Unit Carrier

**Phase:** harden
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 harden unit" -- timeout 240 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 harden unit
$ timeout 240 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 110
sha256: 96a12ce0d8bdb616284b0a6802513cd52d3129d034d2f05990aa193fab4f9d0a
--- retained summary from the bounded capture; full-output hash above ---
ℹ tests 102
ℹ suites 0
ℹ pass 102
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 520.585994
```

### Focused BUG-025 Browser Carrier

**Phase:** harden
**Command:** `timeout 360 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
Running 6 tests using 1 worker

	✓  1 …valid embedded read bound refuses before any route-owned request (888ms)
	✓  2 …etup failure reaches existing unavailable state with zero timers (885ms)
	✓  3 …er-answering corpus request reaches a bounded unavailable result (11.7s)
	✓  4 …answering optional document reaches a bounded unavailable result (11.6s)
	✓  5 …1 › Regression: BUG-025 an inside-bound response settles normally (4.0s)
	✓  6 … served configuration preserves embedded first paint and settles (11.5s)

	6 passed (44.2s)
```

### Complete Company Intelligence Browser Carrier

**Phase:** harden
**Command:** `timeout 1020 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 harden complete browser" -- timeout 960 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 harden complete browser
$ timeout 960 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 53
sha256: a179d73914d212d90cdf7256e8052ef046228bcdbebd43c0d7618afbfdcb4e7e
--- retained boundary rows from the bounded capture; full-output hash above ---
Running 48 tests using 1 worker
	✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:375:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (601ms)
	✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:403:1 › Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers (816ms)
	✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:463:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.6s)
	✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:485:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.8s)
	✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:508:1 › Regression: BUG-025 an inside-bound response settles normally (3.7s)
	✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:541:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.4s)
	✓  44 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2127:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (988ms)
	✓  45 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2215:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (1.1s)
	✓  46 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2341:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel (698ms)
	✓  47 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2363:1 › Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel (897ms)
	✓  48 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2399:1 › Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel (626ms)

	48 passed (1.6m)
```

### Repository Selftest

**Phase:** harden
**Command:** `timeout 660 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 harden repository selftest" -- timeout 600 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 harden repository selftest
$ timeout 600 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: 653026bb1332c4f78787e1786b3be249100142cf4eaf45cf72bcdd7818b3ef97
--- retained summary from the bounded capture; full-output hash above ---
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (95 claim(s) across 72 packet(s), 81 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 95 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

### Scenario And Governance Checks

**Phase:** harden
**Claim Source:** executed

```text
$ timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .
[scenario-test-resolve] OK — 4 reference(s) resolved via literal-scan; 4 category comparison(s) not applicable (no test-discovery adapter declared)

$ timeout 240 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --verbose
ℹ️  INFO: Resolved 5 implementation file(s) to scan
	Files scanned:  5
	Violations:     0
	Warnings:       0
🟢 PASSED: No source code reality violations detected

$ timeout 180 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1

$ timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
✅ Top-level status matches certification.status
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

### Hardening Verdict And Route

| Category | Result |
| --- | --- |
| Contract and artifact coherence | Passed |
| Unit carrier | 102 passed, 0 failed, 0 skipped |
| Focused browser carrier | 6 passed |
| Complete browser carrier | 48 passed |
| Repository selftest | 3437 passed, 0 failed |
| Scenario resolution | 4 of 4 linked tests resolved |
| Implementation reality | 0 violations, 0 warnings |
| Bugfix regression quality | 0 violations, 0 warnings |
| Artifact lint | Passed |
| Stale-intent browser discrimination | Failed: no two-intent out-of-order completion case |

`BUG-025-ROUTE-011` is addressed because the harden review executed. `BUG-025-HARDEN-001` remains
unresolved. The bounded hardening verdict is `🛑 NOT_HARDENED`. `BUG-025-ROUTE-012` carries the
single test-coverage finding to `bubbles.test`. Scope 1, packet status, all nine DoD items,
completion arrays, and certification remain unchanged and in progress.

<a name="planning-closure-bug-025-harden-001-2026-08-31"></a>
## Planning Closure — BUG-025-HARDEN-001 — 2026-08-31

### Summary

Planning added `SCN-BUG-025-005`, one matching Scope 1 Gherkin scenario, one scenario-specific
`e2e-ui` Test Plan row, and one matching unchecked DoD item. The new contract requires two valid
subject intents. The first subject's selected committed response remains held after real server
entry. The second subject must settle and publish before the first response is released. The
visible subject, body corpus and readiness attributes, every horizon account, the ordinary
company tool read, and a post-settlement DOM-node sentinel must remain the second subject's state.
The company publication-call count must not increase after release. This distinguishes a stale
completion that merely leaves final values equal from a stale completion that actually repaints
or republishes.

The planned carrier uses the production route, unmodified committed MSFT and AAPL responses, and
the existing ephemeral same-origin HTTP boundary. It forbids request interception, fixture-authored
business responses, and elapsed-time guesses. Its high-risk negative control removes the
`intent !== readingIntent` return in a bounded mutation probe and requires the exact carrier to
fail. `SCN-BUG-025-005` has `plannedTest` but no `linkedTests` or evidence until `bubbles.test`
authors and executes the exact title.

### Exact Revision-7 Repository Binding

**Phase:** plan
**Command:** `cd /home/philipk/research-lab && printf '%s\n' 'binding-check:start' 'repositoryAlias=research-lab' 'sessionId=vscode-20072c8d3f74af455af2514e746fced3' 'decisionId=rb:vscode-20072c8d3f74af455af2514e746fced3:7' 'controlRevision=7' 'controlPathDigest=sha256:7e982c9a1b25048dd68c8c758dbc39cdc603988bddfe07251568ed72f9d0becc' 'authority=explicit-repository-root' 'transition=confirmed' 'scopeKind=command' 'targetKind=repository-root' 'pathVisibility=local' 'actionable=true' && timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /tmp/bug025-harden-planning-binding.json && printf '%s\n' 'binding-check:valid'`
**Exit Code:** 0
**Claim Source:** executed

```text
binding-check:start
repositoryAlias=research-lab
sessionId=vscode-20072c8d3f74af455af2514e746fced3
decisionId=rb:vscode-20072c8d3f74af455af2514e746fced3:7
controlRevision=7
controlPathDigest=sha256:7e982c9a1b25048dd68c8c758dbc39cdc603988bddfe07251568ed72f9d0becc
authority=explicit-repository-root
transition=confirmed
scopeKind=command
targetKind=repository-root
pathVisibility=local
actionable=true
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:7 revision=7
binding-check:valid
```

No repository preflight ran. The inherited control revision remained 7.

### Planning And Route Accounting

**Claim Source:** interpreted
**Interpretation:** These counts and ownership dispositions come from the current Scope 1,
scenario manifest, and state records after the planning edits. They do not assert that the new
browser carrier exists or passes.

| Item | Current planning result |
| --- | --- |
| `BUG-025-HARDEN-001` | Addressed as planned, not tested. |
| Scope scenarios | Five active Gherkin scenarios. |
| Test Plan | Seven rows, including exactly one new `e2e-ui` row. |
| DoD | Ten unchecked items, including exactly one matching new item. |
| Scenario manifest | Five scenarios. Four authored links remain linked, and `SCN-BUG-025-005` is planned-only. |
| `BUG-025-TEST-004` | Unresolved and routed by `BUG-025-ROUTE-013` to `bubbles.test`. |
| `BUG-025-CERT-MIRROR-010` | Unresolved and routed by `BUG-025-ROUTE-014` to `bubbles.validate`. |
| Certification | Deliberately untouched at non-terminal 0 checked and 9 unchecked. It must mirror 0/10 before repository selftest can be green. |

The independent BUG-027 packet remains outside this planning change.

### Scenario Resolver

**Phase:** plan
**Command:** `timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .`
**Exit Code:** 0
**Claim Source:** executed

```text
[scenario-test-resolve] OK — 4 reference(s) resolved via literal-scan; 4 category comparison(s) not applicable (no test-discovery adapter declared)
```

The four existing links still resolve. The new scenario contributes no reference because its
carrier remains planned-only.

### Implementation Reality Scan

**Phase:** plan
**Command:** `timeout 240 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --verbose`
**Exit Code:** 0
**Claim Source:** executed

```text
ℹ️  INFO: Resolved 5 implementation file(s) to scan

============================================================
	IMPLEMENTATION REALITY SCAN RESULT
============================================================

	Files scanned:  5
	Violations:     0
	Warnings:       0

🟢 PASSED: No source code reality violations detected
```

### Artifact Lint

**Phase:** plan
**Command:** `timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
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
✅ Top-level status matches certification.status
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

### Scenario Obligation And Mechanism Validation

The first mechanism run refused the existing `SCN-BUG-025-004` declaration because it lacked a
negative control. Planning added the missing discriminator. Delegating the selected path instead
of throwing must make that carrier fail its unavailable, zero-network, and setup-failure checks.
The repeated validation then accepted all five obligation matrices and both declared mechanisms.

**Phase:** plan
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 planning scenario obligation contract" -- timeout 240 bash .github/bubbles/scripts/scenario-obligation-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 planning scenario obligation contract
$ timeout 240 bash .github/bubbles/scripts/scenario-obligation-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 1
sha256: 65e1b9b55671e52df5fed6a395b47468d622b2bb17d21810f7249b8748d81a93
--- output ---
[scenario-obligation-lint] OK — 5 scenario(s) with a coherent derived obligation matrix
```

**Phase:** plan
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 planning test mechanism contract" -- timeout 240 bash .github/bubbles/scripts/test-mechanism-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 planning test mechanism contract
$ timeout 240 bash .github/bubbles/scripts/test-mechanism-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 2
sha256: ebc922762f2ae2806bfb9b49bbc7b55a1b2a750eef399f3286d372b3d0c1c18a
--- output ---
[test-mechanism-lint] OK — 2 declared mechanism(s) coherent with their scenario traits
[mutation-receipt] OK — mutationExecution adapter is none (inert)
```

### Certification Mirror Route Evidence

**Phase:** plan
**Command:** `timeout 180 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 planning certification mirror" -- timeout 120 node scripts/validate-scope-dod-progress.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025 planning certification mirror
$ timeout 120 node scripts/validate-scope-dod-progress.mjs
exit: 1
lines: 3
sha256: f679cc403143ff53f3d42fc9a6c308654da6da18c99191a726d9ba4d9e7c2f14
--- output ---
[scope-dod-progress] packets=72 claims=95 agree=80 drift=15 unresolved=0 baseline=14 new=1 stale=0
	NEW-DRIFT specs/_bugs/BUG-025-company-corpus-read-never-settles#01::certification (01-declare-and-enforce-one-read-bound) — claims 0/9 checked/unchecked, artifact has 0/10 [specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md]
[scope-dod-progress] FAIL — 1 scope progress claim(s) do not match their artifact
```

This non-green result is the expected ownership boundary. Planning must not edit
`certification.scopeProgress`. `BUG-025-ROUTE-014` routes the exact non-terminal 0/10 mirror
reconciliation to `bubbles.validate`.

### Completion Statement

Planning ownership for `BUG-025-HARDEN-001` is complete. Delivery is not complete. The exact
carrier remains unimplemented and unexecuted, and the certification mirror remains intentionally
unchanged. Scope 1 and both status mirrors remain `in_progress`.

<a name="validate-certification-mirror-remediation-2026-08-31"></a>
## Validate-Owned Certification Mirror Remediation — 2026-08-31

### Summary

`bubbles.validate` reconciled only Scope 1's non-terminal `certification.scopeProgress` mirror
from 0 checked and 9 unchecked items to 0 checked and 10 unchecked items. This closes
`BUG-025-CERT-MIRROR-010` and prerequisite route `BUG-025-ROUTE-014`. Scope 1, the packet,
both status mirrors, `completedScopes`, `certifiedCompletedPhases`, lockdown, all ten DoD items,
the planned test, current implementation and test files, and acceptance remain unchanged and in
progress. No certification or promotion occurred.

`SCN-BUG-025-005` remains planned-only with no linked test claim. `BUG-025-TEST-004` remains
unresolved, and `bubbles.test` remains the primary next owner.

### Exact Revision-7 Repository Binding

The exact inherited packet was validated before the first repository-local read. No preflight ran,
and the control revision was not advanced. A bounded evidence capture then revalidated the same
packet and control file without mutation.

| Binding field | Exact value |
| --- | --- |
| `repositoryRoot` | `/home/philipk/research-lab` |
| `repositoryAlias` | `research-lab` |
| `sessionId` | `vscode-20072c8d3f74af455af2514e746fced3` |
| `decisionId` | `rb:vscode-20072c8d3f74af455af2514e746fced3:7` |
| `controlRevision` | `7` |
| `controlPathDigest` | `sha256:7e982c9a1b25048dd68c8c758dbc39cdc603988bddfe07251568ed72f9d0becc` |
| `authority` | `explicit-repository-root` |
| `transition` | `confirmed` |
| `scopeKind` / `scopeId` | `command` / `null` |
| `targetKind` | `repository-root` |
| `pathVisibility` / `actionable` | `local` / `true` |

**Phase:** validate
**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-CERT-MIRROR-010 revision-7 binding" -- env BUBBLES_BINDING_EVIDENCE=1 timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /tmp/research-lab-bug025-cert-mirror-vscode-20072c8d3f74af455af2514e746fced3.json`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025-CERT-MIRROR-010 revision-7 binding
$ env BUBBLES_BINDING_EVIDENCE=1 timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /tmp/research-lab-bug025-cert-mirror-vscode-20072c8d3f74af455af2514e746fced3.json
exit: 0
lines: 1
sha256: b82f3b2275969f899374fa2875ff6dfb8f21818187c38ffea4346152b62a5473
--- output ---
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:7 revision=7
```

### Repository Selftest After Mirror Reconciliation

**Phase:** validate
**Command:** `timeout 1300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-CERT-MIRROR-010 repository selftest" -- timeout 1200 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025-CERT-MIRROR-010 repository selftest
$ timeout 1200 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: 0318b177faa79c052703d3e77d6fbe26fd726182b8aefaa913c99de33dbbbeef
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3866 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (95 claim(s) across 72 packet(s), 81 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 95 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

The selftest is green on the 0/10 mirror while the new `plannedTest` remains unlinked, as required.

### BUG-025 Artifact Lint

**Phase:** validate
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-CERT-MIRROR-010 artifact lint" -- timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025-CERT-MIRROR-010 artifact lint
$ timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
```

### Finding And Route Accounting

| Finding or route | Disposition |
| --- | --- |
| `BUG-025-CERT-MIRROR-010` | Addressed by the validate-owned 0/10 non-terminal mirror reconciliation. |
| `BUG-025-ROUTE-014` | Completed by this surgical validate remediation. |
| `BUG-025-TEST-004` | Unresolved. Primary next owner remains `bubbles.test` under `BUG-025-ROUTE-013`. |

### Completion Statement

This was a surgical mirror and route-record repair only. The packet was not certified or promoted.
Top-level `status` and `certification.status` remain `in_progress`; completion arrays, certified
phases, lockdown, scope status, all ten DoD items, implementation, tests, and acceptance remain
unchanged. The only remaining finding carried by this result is `BUG-025-TEST-004`, owned by
`bubbles.test`.

<a name="test-finding-bug-025-test-004"></a>
## Test Finding Closure — BUG-025-TEST-004 — 2026-08-31

### Summary

`bubbles.test` independently executed the authored `SCN-BUG-025-005` carrier rather than relying
on the operator-reported earlier pass. The exact carrier passed 1 of 1. The focused BUG-025 browser
selection passed 7 of 7, the complete Company Intelligence browser file passed 49 of 49, and the
unit file passed 102 of 102 with zero skipped tests.

The first repository selftest run exposed one test-owned provenance matcher that still expected
the pre-mutation-control header. The browser carrier had truthfully added the in-memory route-only
mutation classification. The selftest matcher was updated to require that classification and to
retain both stale-wording negative controls. The repeated repository selftest passed 3437 checks
with zero failures.

The scenario resolver found all five linked references. The bugfix regression-quality guard found
zero violations and zero warnings. The implementation-reality scan found zero violations and zero
warnings. BUG-025 artifact lint passed before this execution record was appended.

### Exact Revision-7 Repository Binding

**Phase:** test
**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-TEST-004 revision-7 binding" -- timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /tmp/research-lab-bug025-binding-vscode-20072c8d3f74af455af2514e746fced3.json`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025-TEST-004 revision-7 binding
$ timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /tmp/research-lab-bug025-binding-vscode-20072c8d3f74af455af2514e746fced3.json
exit: 0
lines: 1
sha256: b82f3b2275969f899374fa2875ff6dfb8f21818187c38ffea4346152b62a5473
--- output ---
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:7 revision=7
```

No preflight ran and no control revision was advanced.

### Carrier And Mutation-Control Audit

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** Current source inspection and the executed exact-title result establish the
carrier mechanism. `routeWithoutStaleIntentReturn()` requires exactly one occurrence of the exact
production return, removes only those bytes, checks the resulting length, and rejects any remaining
occurrence. `exerciseLateValidCompletion()` passes no override for the production run, requires the
route and all AAPL peer responses to carry repository provenance, and releases the held MSFT body
through `serveRepositoryFile()`. Only the mutation run maps the route HTML to an in-memory override.
The mutation must produce the named repaint and publication discriminator failures without accepting
an arbitrary runtime error.

The working-tree production and browser-carrier hashes were captured before execution and again
after the selftest repair. Both pairs are identical:

| File | Before | After execution |
| --- | --- | --- |
| `company-intelligence-lab.html` | `aae3ca6ec0eff66270007c64fc1bb40a23e13aea` | `aae3ca6ec0eff66270007c64fc1bb40a23e13aea` |
| `tests/company-intelligence-lab.spec.mjs` | `9da1a3b71e72f05028c8e069c78a86a6747c0b1a` | `9da1a3b71e72f05028c8e069c78a86a6747c0b1a` |

```text
# BUG-025-TEST-004 pre-run production and test hashes
$ timeout 60 git hash-object company-intelligence-lab.html tests/company-intelligence-lab.spec.mjs specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json specs/_bugs/BUG-025-company-corpus-read-never-settles/report.md specs/_bugs/BUG-025-company-corpus-read-never-settles/state.json
exit: 0
lines: 5
sha256: db936c2a2a324d5c5ec61d78e6279f57a7a543b468119aed90f95e2583e4c09a
--- output ---
aae3ca6ec0eff66270007c64fc1bb40a23e13aea
9da1a3b71e72f05028c8e069c78a86a6747c0b1a
644a2c280a5843c693fcb6271577c8f4168cc8ec
5ce0038e451c10104dbc15d385b1d5a89c1a2ace
46084c6d4d4fa6447a35ea296b539c4bc855754c

# BUG-025-TEST-004 post-execution production and carrier hashes
$ timeout 60 git hash-object company-intelligence-lab.html tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs
exit: 0
lines: 3
sha256: 2e1dd299ebeb078e6adc9bdbe34c1a5c1f894f1a572f92d1f32dca782dd857e6
--- output ---
aae3ca6ec0eff66270007c64fc1bb40a23e13aea
9da1a3b71e72f05028c8e069c78a86a6747c0b1a
5703cd707d009bbf840e889eb0945a1f419065c1
```

The bounded `git diff --check` emitted `git diff --check: clean`. The browser-carrier skip-marker
scan emitted `carrier skip-marker grep exit=1 (1 means zero matches)`.

### Exact-Title Selection Correction

**Phase:** test
**Claim Source:** executed

The first anchored selector selected no tests and is not treated as a passing execution:

```text
# BUG-025-TEST-004 exact title
$ timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep ^Regression: BUG-025 late valid completion cannot overwrite a newer settled subject$ --reporter=list
exit: 1
lines: 4
sha256: 10430d4abdbd108757550247ef54aa526417db51010e4fcac2d0bf16fe54e830
--- output ---
Error: No tests found.
Make sure that arguments are regular expressions matching test files.
You may need to escape symbols like "$" or "*" and quote the arguments.
```

The same unique full title was then selected without anchors and executed:

```text
# BUG-025-TEST-004 exact title corrected
$ timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Regression: BUG-025 late valid completion cannot overwrite a newer settled subject --reporter=list
exit: 0
lines: 6
sha256: ad9299e90f2e3e31e07bffa9074b1857a3b5127d1208eb02d6ccb7b7689b6c14
--- output ---

Running 1 test using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:842:1 › Regression: BUG-025 late valid completion cannot overwrite a newer settled subject (1.7s)

	1 passed (4.6s)
```

### Focused BUG-025 Browser Selection

**Phase:** test
**Claim Source:** executed

```text
# BUG-025-TEST-004 focused BUG-025 browser selection
$ timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 0
lines: 12
sha256: 32537636657b3c8471dd13d3936cfa1813fd81171e2e3739b7c2bba54247890e
--- output ---

Running 7 tests using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:402:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (1.6s)
	✓  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:430:1 › Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers (1.2s)
	✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:490:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.0s)
	✓  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:512:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.6s)
	✓  5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:535:1 › Regression: BUG-025 an inside-bound response settles normally (3.7s)
	✓  6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:568:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.4s)
	✓  7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:842:1 › Regression: BUG-025 late valid completion cannot overwrite a newer settled subject (1.2s)

	7 passed (42.8s)
```

### Complete Company Intelligence Browser File

**Phase:** test
**Claim Source:** executed

```text
# BUG-025-TEST-004 complete Company Intelligence browser file
$ timeout 1140 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 54
sha256: c9617cad00150970c955df2d980d61947dae14e137cdf348cddafd318f6266a4
--- first 20 ---

Running 49 tests using 1 worker

	✓   1 Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request
	✓   2 Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers
	✓   3 Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result
	✓   4 Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result
	✓   5 Regression: BUG-025 an inside-bound response settles normally
	✓   6 Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles
	✓   7 Regression: BUG-025 late valid completion cannot overwrite a newer settled subject
	✓   8 four horizon regions render with four summaries and four deep-dive controls
	✓   9 Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction
	✓  10 an owned dimension renders a deep link whose target is a registered route
--- omitted 14 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓  40 Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read
	✓  41 Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card
	✓  42 Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href
	✓  43 Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company
	✓  44 Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject
	✓  45 Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it
	✓  46 Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established
	✓  47 Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel
	✓  48 Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel
	✓  49 Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel

	49 passed (1.4m)
```

### Company Intelligence Unit File

**Phase:** test
**Claim Source:** executed

```text
# BUG-025-TEST-004 Company Intelligence unit file
$ timeout 540 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 110
sha256: 31098b2a237aae446a49e24c1fbc446bd2f28cf4d9047e7d55605d312005948d
--- first 20 ---
✔ coverage account holds one row per registry dimension and totals sum to the registry length
✔ SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
✔ every one of the five evidence states is produced by a real adapter outcome
✔ a read aged past its window stays in the denominator as stale rather than becoming neutral
✔ non-financial event dimension reads unavailable with no-source-exists and carries no value
--- omitted 70 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ 027 security — no hostile subject can give the composed owner href a scheme, an authority, a second parameter or a fragment
✔ 027 security — the receiver refuses every hostile subject outright and returns no field carrying it
✔ 027 security — an accepted subject cannot leave data/options/, cannot become a storage key and cannot reach a prototype
✔ 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
✔ 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
ℹ tests 102
ℹ suites 0
ℹ pass 102
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 328.654492
```

### Repository Selftest Red And Green

**Phase:** test
**Claim Source:** executed

The first run exposed the stale test-owned provenance matcher:

```text
# BUG-025-TEST-004 repository selftest
$ timeout 1200 node scripts/selftest.mjs
exit: 1
lines: 3906
sha256: ba6dd19152ae74b989ccad3e0345428fe3b38cf8e65d1a0743081bcf17433395
--- failure-shaped lines from the omitted region ---
	✗ FAIL: BUG-018 test provenance distinguishes ordinary unmodified traffic from annotated pass-through or real-server fault injection
--- last 20 ---
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 95 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
================================================
Research-Lab self-test: 3436 passed, 1 failed
================================================
```

After the matcher required the truthful route-only mutation classification, the repeated run was green:

```text
# BUG-025-TEST-004 repository selftest GREEN
$ timeout 1200 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: 441537fdb087ea669bdbca309ba7557fc5d236bc3965539634e54a6883efc25e
--- first 20 ---

Step 1 security — escaped model sinks and CSP on every page
	✓ every shipped HTML page carries a Content-Security-Policy meta
	✓ all pages use one identical CSP instead of drifting per page
	✓ CSP keeps the single-file inline-script design while defaulting to self
	✓ CSP blocks object, base-tag, and form exfiltration paths
	✓ CSP connect-src is an explicit origin allowlist, never wildcard https
--- omitted 3866 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 95 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

### Scenario And Governance Checks

**Phase:** test
**Claim Source:** executed

```text
# BUG-025-TEST-004 five-link scenario resolver
$ timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .
exit: 0
lines: 1
sha256: e5f6dac2f68385adf5ecb870d8234a89ddd89bdda9c0a1f63994f4da1596feb6
--- output ---
[scenario-test-resolve] OK — 5 reference(s) resolved via literal-scan; 5 category comparison(s) not applicable (no test-discovery adapter declared)

# BUG-025-TEST-004 bugfix regression-quality guard
$ timeout 240 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 16
sha256: b34366959ce1cd0338fcadbc276c7183779512100dc7d7e02e159dc8b22a1fdf
--- output ---
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: /home/philipk/research-lab
	Timestamp: 2026-08-31T18:10:28Z
	Bugfix mode: true
============================================================
ℹ️  Scanning tests/company-intelligence-lab.spec.mjs
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs
============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 1
	Files with adversarial signals: 1
============================================================

# BUG-025-TEST-004 implementation reality
$ timeout 240 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --verbose
exit: 0
lines: 35
sha256: 60c8105afc4a82376f1231e9392e091a2ab9058a625d89b13fe8fc1194986a84
--- output ---
ℹ️  INFO: Resolved 5 implementation file(s) to scan
--- Scan 1: Gateway/Backend Stub Patterns ---
--- Scan 1B: Handler / Endpoint Execution Depth ---
--- Scan 1C: Endpoint Not-Implemented / Placeholder Responses ---
--- Scan 1D: External Integration Authenticity ---
--- Scan 2: Frontend Hardcoded Data Patterns ---
--- Scan 2B: Sensitive Client Storage ---
--- Scan 3: Frontend API Call Absence ---
--- Scan 4: Prohibited Simulation Helpers in Production ---
--- Scan 5: Default/Fallback Value Patterns ---
--- Scan 6: Live-System Test Interception ---
--- Scan 7: IDOR / Auth Bypass Detection (Gate G047) ---
--- Scan 8: Silent Decode Failure Detection (Gate G048) ---
============================================================
	IMPLEMENTATION REALITY SCAN RESULT
============================================================
	Files scanned:  5
	Violations:     0
	Warnings:       0
🟢 PASSED: No source code reality violations detected

# BUG-025-TEST-004 artifact lint before record closure
$ timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
✅ Top-level status matches certification.status
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

### Test Verdict And Route Accounting

| Test or check | Result |
| --- | --- |
| Exact `SCN-BUG-025-005` title | 1 passed |
| Focused BUG-025 browser selection | 7 passed |
| Complete Company Intelligence browser file | 49 passed |
| Company Intelligence unit file | 102 passed, 0 failed, 0 skipped |
| Repository selftest after test-owned repair | 3437 passed, 0 failed |
| Scenario resolver | 5 of 5 references resolved |
| Bugfix regression quality | 0 violations, 0 warnings |
| Implementation reality | 0 violations, 0 warnings |
| BUG-025 artifact lint | Passed |
| Production and browser-carrier hashes | Unchanged across this execution |

`BUG-025-TEST-004` and `BUG-025-ROUTE-013` are addressed. All ten DoD items remain unchecked.
Scope 1, top-level status, and certification remain `in_progress`. `BUG-025-HARDEN-REVERIFY` is
routed to `bubbles.harden` so the owner of the hardening finding can independently confirm closure
before stabilization relevance is evaluated.

### Completion Statement

The test-owned carrier verification and route record are complete. The packet is not certified or
promoted. No production file, Scope 1 planning text, DoD checkbox, acceptance record, completion
array, or certification field changed.

<a name="harden-reverification-bug-025-harden-reverify-2026-08-31"></a>
## Harden Re-verification — BUG-025-HARDEN-REVERIFY — 2026-08-31

### Summary

`bubbles.harden` independently inspected the current `SCN-BUG-025-005` manifest contract, the
latest test-owner closure, the browser server and snapshot helpers, the production
`readingIntent` guard, and the ordinary tool-read publication path. The exact stale-intent title
passed 1 of 1. The focused BUG-025 browser selection passed 7 of 7. The repository selftest
reported 3437 passed and zero failed. All five scenario links resolved. The bugfix regression
guard reported zero violations and zero warnings. BUG-025 artifact lint passed.

The current inspection and focused execution exposed no uncertainty that required a second
complete 49-case browser-file run. The test owner's 49-case record remains inherited baseline
only and is not used as this harden phase's execution evidence.

### Exact Revision-7 Repository Binding

**Phase:** harden
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /tmp/bug-025-harden-reverify-binding-vscode-20072c8d3f74af455af2514e746fced3.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:7 revision=7
```

The exact inherited actionable packet was validated before repository reads. No repository
preflight ran, and the control revision remained 7.

### Carrier Closure Inspection

**Phase:** harden
**Claim Source:** interpreted
**Interpretation:** The conclusions below come from direct reads of the current production and
test regions, combined with the exact-title execution that exercised both the unmodified route
and its one-line in-memory mutation control.

| Required discriminator | Current carrier behavior |
| --- | --- |
| Unmodified production traffic | `exerciseLateValidCompletion(browser, null)` supplies no route override. The route request must report `source: repository`; every AAPL peer response must report `source: repository`, finish, and remain unaborted. The held MSFT response is released through `serveRepositoryFile()`, which streams the committed repository file. |
| Newer intent settles first | The server records entry of one held `data/bars/MSFT.json` request. While it remains unreleased and unaborted, the carrier applies valid AAPL, waits for `loaded` and `established`, and requires exactly one ordinary AAPL publication. |
| Late release changes nothing | Before release, the carrier snapshots subject identity, corpus status, reading readiness, all four horizon `outerHTML` byte strings and attributes, current and persisted tool-read bytes, the first live horizon node, and publication records/count. After MSFT finishes, every snapshot remains equal, the node identity remains equal, and the mutation observer reports zero repaints. |
| Exact high-risk mutation | `routeWithoutStaleIntentReturn()` requires exactly one exact production return, removes that one byte range, verifies the exact length delta, and requires no copy to remain. Only the route HTML is served from the in-memory override; business responses still use repository files. |
| Intended failure envelope | With the return removed, the carrier requires failures for horizon-node identity, company-publication count, and no-post-release repaint. It rejects every discriminator failure outside the five allowed repaint/publication signals. |
| Production bytes unchanged | Pre-execution and post-execution object hashes are identical for the production route, browser carrier, repository selftest, and scenario manifest. The production route remained `aae3ca6ec0eff66270007c64fc1bb40a23e13aea`. |
| Arbitrary exceptions rejected | Both runs collect browser page errors and error-console messages and require the collection to equal `[]` before returning. `exerciseLateValidCompletion()` has cleanup in `finally` but no catch that converts an exception into mutation success. The mutation verdict can pass only through the named discriminator differences. |

### Playwright Runner Identity

**Phase:** harden
**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-HARDEN-REVERIFY Playwright identity" -- timeout 60 npx --no-install playwright --version`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025-HARDEN-REVERIFY Playwright identity
$ timeout 60 npx --no-install playwright --version
exit: 0
lines: 1
sha256: ec60000cff0b2bb61c0bd02338c28b5001eb04073e84ef331029c941b4b9a332
--- output ---
Version 1.61.1
```

### Exact Stale-Intent Title

**Phase:** harden
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-HARDEN-REVERIFY exact stale-intent title" -- timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-025 late valid completion cannot overwrite a newer settled subject" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025-HARDEN-REVERIFY exact stale-intent title
$ timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Regression: BUG-025 late valid completion cannot overwrite a newer settled subject --reporter=list
exit: 0
lines: 6
sha256: ad61f20bcb1de8af84375b8c7899273a22996e627d902ee001c0711ab2e8552b
--- output ---

Running 1 test using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:842:1 › Regression: BUG-025 late valid completion cannot overwrite a newer settled subject (2.7s)

	1 passed (7.0s)
```

### Focused BUG-025 Browser Selection

**Phase:** harden
**Command:** `timeout 900 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-HARDEN-REVERIFY focused BUG-025 browser selection" -- timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025-HARDEN-REVERIFY focused BUG-025 browser selection
$ timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 0
lines: 12
sha256: d2c9e85227f67b003abc6fac3456992ceb51b5929baa53953121860c677a37ce
--- output ---

Running 7 tests using 1 worker

	✓  1 Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request
	✓  2 Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers
	✓  3 Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result
	✓  4 Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result
	✓  5 Regression: BUG-025 an inside-bound response settles normally
	✓  6 Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles
	✓  7 Regression: BUG-025 late valid completion cannot overwrite a newer settled subject

	7 passed (47.4s)
```

### Repository Selftest

**Phase:** harden
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-HARDEN-REVERIFY repository selftest" -- timeout 1200 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025-HARDEN-REVERIFY repository selftest
$ timeout 1200 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: c16d7a5d2af40ec723a7fef3349d001a072f78d04f6d0248396ba8e4f1987348
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3866 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (95 claim(s) across 72 packet(s), 81 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 95 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

### Scenario Resolver And Regression Guard

**Phase:** harden
**Claim Source:** executed

```text
# BUG-025-HARDEN-REVERIFY five-link scenario resolver
$ timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .
exit: 0
lines: 1
sha256: e5f6dac2f68385adf5ecb870d8234a89ddd89bdda9c0a1f63994f4da1596feb6
--- output ---
[scenario-test-resolve] OK — 5 reference(s) resolved via literal-scan; 5 category comparison(s) not applicable (no test-discovery adapter declared)

# BUG-025-HARDEN-REVERIFY bugfix regression-quality guard
$ timeout 240 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 16
sha256: 04338dd10a83c15a835cce59baf66ddd328466830a58c67dff7b294e19dfc462
--- output ---
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: /home/philipk/research-lab
	Timestamp: 2026-08-31T18:24:14Z
	Bugfix mode: true
============================================================

ℹ️  Scanning tests/company-intelligence-lab.spec.mjs
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs

============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 1
	Files with adversarial signals: 1
============================================================
```

### BUG-025 Artifact Lint

**Phase:** harden
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-HARDEN-REVERIFY artifact lint" -- timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025-HARDEN-REVERIFY artifact lint
$ timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
✅ report.md contains section matching: Summary
✅ report.md contains section matching: Completion Statement
✅ report.md contains section matching: Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ Value-first selection rationale lint skipped (not a value-first report)
✅ Scenario path-placeholder lint skipped (no matching scenario sections found)

=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
```

### Mutation File-Integrity Boundary

**Phase:** harden
**Claim Source:** executed

```text
# BUG-025-HARDEN-REVERIFY pre-execution bytes
$ timeout 60 git hash-object company-intelligence-lab.html tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json
exit: 0
lines: 4
sha256: 1cdca86bcb0e5046ec1fb3f12160188feec55602c7fac19d808a46ee6eb26ae7
--- output ---
aae3ca6ec0eff66270007c64fc1bb40a23e13aea
9da1a3b71e72f05028c8e069c78a86a6747c0b1a
5703cd707d009bbf840e889eb0945a1f419065c1
644a2c280a5843c693fcb6271577c8f4168cc8ec

# BUG-025-HARDEN-REVERIFY post-execution bytes
$ timeout 60 git hash-object company-intelligence-lab.html tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json
exit: 0
lines: 4
sha256: 1cdca86bcb0e5046ec1fb3f12160188feec55602c7fac19d808a46ee6eb26ae7
--- output ---
aae3ca6ec0eff66270007c64fc1bb40a23e13aea
9da1a3b71e72f05028c8e069c78a86a6747c0b1a
5703cd707d009bbf840e889eb0945a1f419065c1
644a2c280a5843c693fcb6271577c8f4168cc8ec
```

### Harden Profile Closure

| Check | Result |
| --- | --- |
| H1 — findings classified with evidence | Passed. `BUG-025-HARDEN-001` and `BUG-025-HARDEN-REVERIFY` have exact executed and interpreted closure evidence. |
| H2 — fixes verified | Passed. The exact mutation carrier and its seven-case affected browser closure executed in this session. |
| H3 — required artifact updates | Passed. This harden report and execution route record are updated; planning, DoD, acceptance, status, and certification remain owner-preserved. |
| H4 — taxonomy completeness | Passed for this UI defect. Scope 1 retains unit, scenario-specific `e2e-ui`, broader `e2e-ui`, and repository-functional rows. |
| H5 — Gherkin semantic fidelity | Passed. `SCN-BUG-025-005` maps to the exact two-valid-intent, out-of-order completion carrier and its discriminating mutation control. |
| H6 — repository-realistic paths | Passed. The linked browser carrier is in the repository's existing `tests/*.spec.mjs` location and runs through the registered Playwright command. |
| H7 — regression quality | Passed. The high-risk mutation is adversarial against removal of the exact guard, and the canonical bugfix guard is clean. |
| H8 — cross-scope deduplication | Not applicable. This packet has one scope. |
| H9 — test-plan JSON synchronization | Not applicable. This packet has no `test-plan.json`; its manifest and Markdown plan links resolve through the five-link resolver. |

### Final Harden Verdict And Route Accounting

| Finding or route | Disposition |
| --- | --- |
| `BUG-025-HARDEN-001` | Addressed. `SCN-BUG-025-005` now fails specifically when the one stale-intent return is removed and passes against unmodified production bytes. |
| `BUG-025-HARDEN-REVERIFY` | Addressed by this independent source inspection and current-session exact-title, focused-browser, repository-selftest, scenario-resolver, bugfix-guard, artifact-lint, and hash-boundary execution. |
| `BUG-025-ROUTE-015` | Nominal phase-chain route to `bubbles.stabilize`, which follows `harden` in `bugfix-fastlane`. It is phase relevance, not an unresolved hardening finding. |

The final harden verdict is **🔒 HARDENED**. There are no unresolved findings from this harden
re-verification. Scope 1 remains **In Progress**. All ten DoD items remain unchecked. Top-level
status and `certification.status` remain `in_progress`. Completion arrays and certification fields
remain unchanged.

### Completion Statement

The BUG-025 harden phase and both named harden findings are closed. The packet itself is not
certified or promoted. The nominal next owner is `bubbles.stabilize` for mechanical phase
relevance under the registered `bugfix-fastlane` order.

<a name="stabilize-phase-2026-08-31"></a>
## Stabilize Phase — 2026-08-31

### Summary

`bubbles.stabilize` executed the mechanically required Scope 1 stability pass against the current
production route and real ephemeral HTTP origins. No stability defect was found. The focused
BUG-025 carrier passed 7 of 7. The existing stability and race selection passed 11 of 11. The
out-of-order two-subject carrier passed five repeated executions across two workers. The three
timeout and abort paths passed twice each across two workers. The complete Company Intelligence
browser file passed 49 of 49, and the existing Company Intelligence chaos file passed 11 of 11.
The unit carrier passed 102 of 102. The repository selftest passed 3437 of 3437. The timeout-budget
validator evaluated 172 declarations with zero unattributed, unresolved, or violating entries.
Artifact lint passed.

The production read policy remains a per-request reliability deadline. It is not a latency SLA.
The spec defines no percentile, throughput, or response-time performance target. G026 therefore
does not require permanent stress or load rows for this scope. The repeated commands below are
bounded diagnostic execution and do not create a new test category.

### Exact Revision-7 Repository Binding

**Phase:** stabilize
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /tmp/research-lab-bug025-stabilize-vscode-20072c8d3f74af455af2514e746fced3-r7.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:7 revision=7
```

The exact inherited actionable packet was validated before repository reads. No preflight ran,
and the control revision remained 7.

### Stability Inventory And Source Review

**Phase:** stabilize
**Claim Source:** interpreted
**Interpretation:** The inventory combines direct reads of the current production helper,
configuration, browser fixtures, timeout validator, G026 registry entry, and executed browser
behavior. It does not claim a sampled JavaScript heap metric.

| Domain | Evidence-backed assessment |
| --- | --- |
| Timeout and abort lifetime | `company-intelligence.config.json` declares `readBoundMs: 10000`. `rlcompanyintel.js::readCoverageRegistry()` rejects a non-positive or non-safe-integer value and carries the exact value. `company-intelligence-lab.html::readRouteDocument()` snapshots `registry.readBoundMs`, creates one fresh controller and timer, keeps the timer armed through body consumption, aborts the underlying request, and clears the timer in `finally` plus the synchronous setup-failure branch. |
| Per-request isolation | The helper has one production `fetch()` site and creates a controller inside each invocation. The overlap carrier proves a held MSFT request leaves every AAPL peer request finished and unaborted. The timeout carriers prove the selected held path has one request and no retry. No retry or backoff branch exists in the read helper or its three callers. |
| Cumulative timing | The six repeated no-header, partial-body, and served-config cases each completed in 11.3 to 11.8 seconds around the 10000 ms product bound and 15000 ms harness watchdog. No later repetition acquired a wider deadline. The contract bounds each document request; it does not claim that a sequential multi-document reading completes within 10000 ms total. |
| Timer cleanup | The focused carriers instrument the exact `controller.abort` timeout. Successful, synchronous-failed, no-header, partial-body, and served-config paths require zero active helper timers and equality between created and cleared counts. All selected cases passed. |
| Socket, server, context, and worker teardown | `startWithheldStaticServer().close()` destroys held responses and sockets before `server.close()`. The shared static server closes in `afterAll`, and route handlers are removed in `afterEach`. All repeated and complete commands returned before their outer limits. The post-run process scan found no selected Node runner, Playwright worker, or Playwright Chrome process. |
| Request growth | The held-path tests require one request and no retry. The existing stability case issues no further request for five unchanged applies. Chaos J2 issued zero bar refetches over twelve applies and retained a linear 24 paints, not a growing paint count. |
| DOM and publication stability | The five repeated stale-completion runs preserve AAPL subject, readiness, four horizon accounts, DOM-node identity, ordinary tool-read bytes, and publication count after late MSFT completion. Chaos J1 retained the declared shape after forty mixed actions. Chaos J6 sampled seventeen intermediate paints across MSFT and AAPL and found no cross-subject event leak. |
| Memory retention boundary | No heap-size claim is made. Structurally, each request-local controller and timer becomes unreachable after settlement. `committedBodies` retains one promise per named optional document path, while the version walk is capped at twenty records. Executed constant-shape, no-refetch, paint-count, and teardown checks exposed no accumulating route-owned resource. |
| Infrastructure, deployment, and build | None found — BUG-025 is a build-free same-origin browser route with no container, service lifecycle, deployment adapter, or generated bundle change. The repository selftest and browser runner are the applicable operational surfaces. |

### Playwright Runner Identity

**Phase:** stabilize
**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 stabilize Playwright identity" -- timeout 60 npx --no-install playwright --version`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 stabilize Playwright identity
$ timeout 60 npx --no-install playwright --version
exit: 0
lines: 1
sha256: ec60000cff0b2bb61c0bd02338c28b5001eb04073e84ef331029c941b4b9a332
--- output ---
Version 1.61.1
```

### Focused BUG-025 Browser

**Phase:** stabilize
**Command:** `timeout 900 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 stabilize focused browser" -- timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 stabilize focused browser
$ timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 0
lines: 12
sha256: d3599d1a9b17a50a711e7058573567abe77436eb5f851d6e233a4c80f36cc71c
--- output ---

Running 7 tests using 1 worker

	✓  1 Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request
	✓  2 Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers
	✓  3 Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result
	✓  4 Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result
	✓  5 Regression: BUG-025 an inside-bound response settles normally
	✓  6 Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles
	✓  7 Regression: BUG-025 late valid completion cannot overwrite a newer settled subject

	7 passed (47.0s)
```

### Existing Stability And Race Cases

**Phase:** stabilize
**Command:** `timeout 720 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 stabilize existing stability and race cases" -- timeout 660 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Stabilize:|Chaos: a background corpus paint|BUG-025 late valid completion|the first paint composes with every data request still outstanding" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 stabilize existing stability and race cases
$ timeout 660 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Stabilize:|Chaos: a background corpus paint|BUG-025 late valid completion|the first paint composes with every data request still outstanding --reporter=list
exit: 0
lines: 16
sha256: 9f6fb0d2f51ed63f0b279176e88b26e43dcc00f86cef28ebdbb67e9198204b29
--- output ---

Running 11 tests using 1 worker

	✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:842:1 › Regression: BUG-025 late valid completion cannot overwrite a newer settled subject (1.6s)
	✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1620:1 › Stabilize: every committed source unavailable degrades to a named absence, not a blank or a zero (466ms)
	✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1672:1 › Stabilize: a malformed committed payload degrades to an absence rather than a half-read value (439ms)
	✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1701:1 › Stabilize: an unreadable coverage registry refuses by name instead of rendering a blank page (395ms)
	✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1726:1 › Stabilize: a storage layer that throws on every write still composes the run (351ms)
	✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1749:1 › Stabilize: the route writes only the shared data container and leaves a sibling tool cache intact (494ms)
	✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1776:1 › Stabilize: repeat composition of an unchanged subject issues no further request (722ms)
	✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1808:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (4.9s)
	✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1846:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.3s)
	✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1882:1 › Chaos: a background corpus paint does not close a deep dive the reader opened (5.6s)
	✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1964:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (617ms)

	11 passed (20.3s)
```

### Repeated Overlapping Subject Race

**Phase:** stabilize
**Command:** `timeout 720 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 stabilize repeated overlapping subject race" -- timeout 660 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-025 late valid completion cannot overwrite a newer settled subject" --repeat-each=5 --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 stabilize repeated overlapping subject race
$ timeout 660 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Regression: BUG-025 late valid completion cannot overwrite a newer settled subject --repeat-each=5 --reporter=list
exit: 0
lines: 10
sha256: 0d36c12d3861fa32973d1d770f58b0983d5e3c6158d845726337dfafc9fc6f39
--- output ---

Running 5 tests using 2 workers

	✓  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:842:1 › Regression: BUG-025 late valid completion cannot overwrite a newer settled subject (2.2s)
	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:842:1 › Regression: BUG-025 late valid completion cannot overwrite a newer settled subject (2.3s)
	✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:842:1 › Regression: BUG-025 late valid completion cannot overwrite a newer settled subject (2.2s)
	✓  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:842:1 › Regression: BUG-025 late valid completion cannot overwrite a newer settled subject (2.1s)
	✓  5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:842:1 › Regression: BUG-025 late valid completion cannot overwrite a newer settled subject (1.6s)

	5 passed (11.7s)
```

### Repeated Timeout And Abort Lifecycle

**Phase:** stabilize
**Command:** `timeout 720 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 stabilize repeated timeout and abort lifecycle" -- timeout 660 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025 a never-answering|BUG-025 a stalled served configuration" --repeat-each=2 --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 stabilize repeated timeout and abort lifecycle
$ timeout 660 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 a never-answering|BUG-025 a stalled served configuration --repeat-each=2 --reporter=list
exit: 0
lines: 11
sha256: 9fda4a127cb569793a1122e5a94924be920bb1b7509b507b46d60de42eeea504
--- output ---

Running 6 tests using 2 workers

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:490:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.7s)
	✓  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:490:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.8s)
	✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:512:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.5s)
	✓  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:512:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.5s)
	✓  5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:568:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.3s)
	✓  6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:568:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.3s)

	6 passed (37.1s)
```

### Complete Company Intelligence Browser

**Phase:** stabilize
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 stabilize complete Company Intelligence browser" -- timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 stabilize complete Company Intelligence browser
$ timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 54
sha256: 0fae4875e4289cd181878823268c2f1704f0173e4d5bf9078ff83f5b7a681c38
--- first 20 ---

Running 49 tests using 1 worker

	✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:402:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (468ms)
	✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:430:1 › Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers (599ms)
	✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:490:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.3s)
	✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:512:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.3s)
	✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:535:1 › Regression: BUG-025 an inside-bound response settles normally (3.5s)
	✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:568:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.2s)
	✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:842:1 › Regression: BUG-025 late valid completion cannot overwrite a newer settled subject (1.2s)
	✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:905:1 › four horizon regions render with four summaries and four deep-dive controls (476ms)
	✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:934:1 › Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction (495ms)
	✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:965:1 › an owned dimension renders a deep link whose target is a registered route (517ms)
	✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1009:1 › every rendered numeric value carries a provenance chip, a source name and an as-of date (535ms)
	✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1036:1 › Regression: SCN-025-021 an unavailable dimension renders a named absence and never a dash or a zero (603ms)
	✓  13 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1070:1 › Regression: SCN-025-021 a scripted narrative string renders as visible escaped text (490ms)
	✓  14 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1095:1 › a position, size or cost basis entry is refused in the browser and nothing is stored (553ms)
	✓  15 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1121:1 › each canvas draws non-blank pixels and pairs with a table holding the same values (862ms)
	✓  16 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1168:1 › the route defers no drawing and schedules no repeating timer (482ms)
	✓  17 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1197:1 › switching the mode segment triggers no request and no recomposition (588ms)
--- omitted 14 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓  32 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1749:1 › Stabilize: the route writes only the shared data container and leaves a sibling tool cache intact (416ms)
	✓  33 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1776:1 › Stabilize: repeat composition of an unchanged subject issues no further request (649ms)
	✓  34 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1808:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (4.9s)
	✓  35 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1846:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.4s)
	✓  36 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1882:1 › Chaos: a background corpus paint does not close a deep dive the reader opened (5.5s)
	✓  37 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1918:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (355ms)
	✓  38 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1964:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (472ms)
	✓  39 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2035:1 › every interactive control on the route is reachable and operable from the keyboard alone (1.2s)
	✓  40 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2181:1 › Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read (1.4s)
	✓  41 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2220:1 › Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card (689ms)
	✓  42 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2269:1 › Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href (498ms)
	✓  43 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2314:1 › Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company (904ms)
	✓  44 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2334:1 › Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject (1.4s)
	✓  45 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2386:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (439ms)
	✓  46 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2474:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (481ms)
	✓  47 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2600:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel (343ms)
	✓  48 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2622:1 › Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel (428ms)
	✓  49 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2658:1 › Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel (339ms)

	49 passed (1.3m)
```

### Company Intelligence Chaos And Overlap Suite

**Phase:** stabilize
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 stabilize Company Intelligence chaos and overlap suite" -- timeout 1200 npx --no-install playwright test tests/chaos-company-intelligence.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 stabilize Company Intelligence chaos and overlap suite
$ timeout 1200 npx --no-install playwright test tests/chaos-company-intelligence.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 20
sha256: a6856047b0abf9c00df15946dc83d295a27eb82f4425e2c931b5c873b606c9b3
--- output ---

Running 11 tests using 1 worker

[chaos J1] steps=40 applies=7 dives=18 modes=10 resizes=5 paints=14
	✓   1 [system-chrome] › tests/chaos-company-intelligence.spec.mjs:149:1 › Chaos J1: seeded interleaving of mode, deep dive, apply and resize leaves the run composed and intact (3.6s)
[chaos J2] paints=24 for 12 applies; bar refetches=0
	✓   2 [system-chrome] › tests/chaos-company-intelligence.spec.mjs:201:1 › Chaos J2: twelve applies on an unchanged subject refetch no bar file and duplicate no region (1.5s)
	✓   3 [system-chrome] › tests/chaos-company-intelligence.spec.mjs:235:1 › Chaos J3: interleaved subject switches settle on the last subject and carry no other subject events (1.1s)
	✓   4 [system-chrome] › tests/chaos-company-intelligence.spec.mjs:283:1 › Chaos J3b: a slow committed event file cannot land under a later subject (2.7s)
	✓   5 [system-chrome] › tests/chaos-company-intelligence.spec.mjs:317:1 › Chaos J4: navigating away and back recomposes the same reading and leaves no state behind (1.1s)
[chaos J5] 404 probes=3 paths=/data/bars/NULL.json, /data/bars/ZZZZZZ.json
	✓   6 [system-chrome] › tests/chaos-company-intelligence.spec.mjs:353:1 › Chaos J5: refused entries interleaved with valid subjects always recover to a composed run (2.4s)
[chaos J6] samples=17 distinct subjects seen=MSFT,AAPL composing-state paints=0 msft event ids=5
	✓   7 [system-chrome] › tests/chaos-company-intelligence.spec.mjs:424:1 › Chaos J6: every intermediate paint during overlapping runs names one subject and only its own events (5.7s)
	✓   8 [system-chrome] › tests/chaos-company-intelligence.spec.mjs:488:1 › Chaos J7: a refused entry leaves the previous subject whole rather than a half-updated page (994ms)
	✓   9 [system-chrome] › tests/chaos-company-intelligence.spec.mjs:523:5 › Chaos sweep seed 11: mixed churn and fuzz leave the route composed with no page error (2.1s)
	✓  10 [system-chrome] › tests/chaos-company-intelligence.spec.mjs:523:5 › Chaos sweep seed 4242: mixed churn and fuzz leave the route composed with no page error (2.6s)
	✓  11 [system-chrome] › tests/chaos-company-intelligence.spec.mjs:523:5 › Chaos sweep seed 987654: mixed churn and fuzz leave the route composed with no page error (2.8s)

	11 passed (29.0s)
```

### Company Intelligence Unit Carrier

**Phase:** stabilize
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 stabilize Company Intelligence unit" -- timeout 240 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 stabilize Company Intelligence unit
$ timeout 240 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 110
sha256: 729ae72cf43ecb46ab750ac400d4d00dfe0eb08b84318ad7a0a14dbceb49f477
--- first 20 ---
✔ coverage account holds one row per registry dimension and totals sum to the registry length (16.155219ms)
✔ SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary (3.005603ms)
✔ every one of the five evidence states is produced by a real adapter outcome (6.114008ms)
✔ a read aged past its window stays in the denominator as stale rather than becoming neutral (17.567421ms)
✔ non-financial event dimension reads unavailable with no-source-exists and carries no value (9.550211ms)
✔ an unavailable dimension never renders as a zero or a neutral number (1.601502ms)
✔ an unresolvable identifier raises C025-IDENTITY-UNRESOLVED and composes no horizon (0.812701ms)
✔ a company outside every corpus yields four horizons with absent quality and none direction (3.796405ms)
✔ every claim cites a value present in its own horizon input set (7.630209ms)
✔ a claim citing a value outside its own input set raises C025-HORIZON-ISOLATION (1.957103ms)
✔ four unavailable contributors downgrade evidence quality and populate gapEffect (3.265604ms)
✔ a horizon whose signalled dimensions are evenly opposed composes flat rather than picking a winner (15.035318ms)
✔ the evidence band a horizon publishes follows the count of signalled dimensions it composed (10.178512ms)
✔ two opposing horizons keep their directions and produce one contradiction record (2.073502ms)
✔ SCN-025-008 the published read version keeps both opposed horizon directions and holds no blended direction key (6.779908ms)
✔ module source contains no second definition of a volatility or ratio metric (2.282602ms)
✔ the module holds no DOM, storage, credential, clock or timer authority (2.932703ms)
✔ the module exports a frozen api and loads under Node through module.exports (0.670701ms)
✔ every reason code and every refusal code named by the design appears in the module source (0.404601ms)
✔ all eleven C025 refusal codes are raised by a real call path (12.843015ms)
--- omitted 70 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ the authored branch budget still refuses one branch beyond maxBranches and the recorded budget is unchanged (0.357201ms)
✔ the configuration records the branch budget and the refused-branch counting decision with written rationales (0.2547ms)
✔ the committed MSFT research plan and version tree are authored, dated and free of any position value (1.359802ms)
✔ adversarial: an owner envelope naming another company ONLY by ticker, or ONLY by cik, is refused (6.135807ms)
✔ the coverage account refuses a read set missing any one registry dimension rather than dropping the row (7.93851ms)
✔ a past-dated event still classed scheduled is partitioned as occurred, not presented as a forecast (0.524801ms)
✔ makeRead refuses a non-current read whose reason code is outside the closed vocabulary (4.728406ms)
✔ 027 security — no hostile subject can give the composed owner href a scheme, an authority, a second parameter or a fragment (6.349708ms)
✔ 027 security — the receiver refuses every hostile subject outright and returns no field carrying it (2.972704ms)
✔ 027 security — an accepted subject cannot leave data/options/, cannot become a storage key and cannot reach a prototype (3.573504ms)
✔ 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup (1.357302ms)
✔ 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes (11.529614ms)
ℹ tests 102
ℹ suites 0
ℹ pass 102
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 595.66092
```

### Repository Selftest

**Phase:** stabilize
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 stabilize repository selftest" -- timeout 1200 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 stabilize repository selftest
$ timeout 1200 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: 527fa4da72208b3e5b9db8a2e78684d3e6c9ca1598d8831b235673cce9df114d
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3866 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (95 claim(s) across 72 packet(s), 81 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 95 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

### Timeout-Budget Validator

**Phase:** stabilize
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 stabilize timeout-budget validator" -- timeout 240 node scripts/validate-playwright-timeout-budgets.mjs --explain`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 stabilize timeout-budget validator
$ timeout 240 node scripts/validate-playwright-timeout-budgets.mjs --explain
exit: 0
lines: 174
sha256: 4e5f3efc91142e891496e26c7dd5fbfd7ed59a3c71ee55d9cc0896d68705b882
--- first 20 ---
[timeout-budgets] scanned=80 tests=840 declarations=172 evaluated=172 unattributed=0 unresolved=0 violations=0 default=30000ms (playwright-default (config declares none))
	ok   tests/attention-browser.spec.mjs:135 declared=30000 budget=30000
	ok   tests/attention-browser.spec.mjs:328 declared=30000 budget=90000
	ok   tests/attention-browser.spec.mjs:1367 declared=30000 budget=90000
	ok   tests/bond-regime-lab.spec.mjs:345 declared=10000 budget=30000
	ok   tests/causal-rotation-chaos.spec.mjs:36 declared=2000 budget=30000
	ok   tests/causal-rotation-chaos.spec.mjs:61 declared=2000 budget=30000
	ok   tests/causal-rotation-chaos.spec.mjs:70 declared=2000 budget=30000
	ok   tests/causal-rotation-chaos.spec.mjs:81 declared=2000 budget=30000
	ok   tests/chaos-company-intelligence.spec.mjs:91 declared=30000 budget=30000
	ok   tests/chaos-company-intelligence.spec.mjs:92 declared=30000 budget=30000
	ok   tests/chaos-company-intelligence.spec.mjs:179 declared=30000 budget=30000
	ok   tests/chaos-company-intelligence.spec.mjs:185 declared=30000 budget=30000
	ok   tests/chaos-company-intelligence.spec.mjs:214 declared=30000 budget=30000
	ok   tests/chaos-company-intelligence.spec.mjs:249 declared=30000 budget=30000
	ok   tests/chaos-company-intelligence.spec.mjs:263 declared=30000 budget=30000
	ok   tests/chaos-company-intelligence.spec.mjs:295 declared=30000 budget=30000
	ok   tests/chaos-company-intelligence.spec.mjs:307 declared=30000 budget=30000
	ok   tests/chaos-company-intelligence.spec.mjs:324 declared=30000 budget=30000
	ok   tests/chaos-company-intelligence.spec.mjs:325 declared=30000 budget=30000
--- omitted 134 line(s); sha256 above covers the full output ---
--- last 20 ---
	ok   tests/simple-production-wiring.spec.mjs:322 declared=30000 budget=600000
	ok   tests/simple-production-wiring.spec.mjs:518 declared=600000 budget=600000
	ok   tests/simple-production-wiring.spec.mjs:539 declared=60000 budget=900000
	ok   tests/simple-production-wiring.spec.mjs:543 declared=60000 budget=900000
	ok   tests/simple-production-wiring.spec.mjs:580 declared=30000 budget=900000
	ok   tests/simple-production-wiring.spec.mjs:664 declared=30000 budget=900000
	ok   tests/swing-structure-freshness.spec.mjs:48 declared=20000 budget=30000
	ok   tests/swing-structure-freshness.spec.mjs:92 declared=20000 budget=30000
	ok   tests/tool-discovery.spec.mjs:147 declared=15000 budget=30000
	ok   tests/tool-experience.spec.mjs:825 declared=15000 budget=30000
	ok   tests/tool-experience.spec.mjs:873 declared=15000 budget=30000
	ok   tests/tool-experience.spec.mjs:882 declared=2000 budget=30000
	ok   tests/tool-experience.spec.mjs:894 declared=15000 budget=30000
	ok   tests/trend-dynamics-cycle-lab.spec.mjs:1037 declared=60000 budget=180000
	ok   tests/trend-dynamics-cycle-lab.spec.mjs:1042 declared=60000 budget=180000
	ok   tests/volatility-sizing-lab.spec.mjs:714 declared=15000 budget=30000
	ok   tests/volatility-sizing-lab.spec.mjs:961 declared=20000 budget=30000
	ok   tests/volatility-sizing-lab.spec.mjs:985 declared=20000 budget=30000
	ok   tests/web-evidence.spec.mjs:77 declared=15000 budget=30000
[timeout-budgets] OK — every declared wait fits the test budget that governs it
```

### G026 Classification

**Phase:** stabilize
**Claim Source:** interpreted
**Interpretation:** G026 applies when a scope defines a latency SLA such as p95, p99, or a response-time
target. BUG-025 instead defines a positive cancellation deadline for each same-origin document
request. FR-025-006 explicitly preserves any valid response that arrives before the deadline, and
the design calls ordinary suite durations context rather than per-request latency measurements.
There is no percentile, throughput, sustained-load, or maximum successful-response target in the
spec or Scope 1. Stress and load Test Plan rows are therefore not required by G026. The repeated
timeout and overlap invocations above test reliability and cleanup without inventing a permanent
stress category.

### Post-Execution Resource And Byte Boundary

**Phase:** stabilize
**Command:** `printf boundary markers; timeout 60 git hash-object <eight BUG-025 production/test/validator files>; timeout 30 pgrep -af <selected runner/browser patterns>; print process status`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG-025-STABILIZE-POST-EXECUTION-BOUNDARY-BEGIN
5e4a03612e8789f5b12d82d234a8a0b04c0b99f9
aae3ca6ec0eff66270007c64fc1bb40a23e13aea
6c13cc92a6c3b682dcb7ccea033ff6d8c597a094
9da1a3b71e72f05028c8e069c78a86a6747c0b1a
40430c143138e4682fc832cd2e5ff0bad748269c
3f0aebee08c2ff4174a8f023598da87acee86e05
5703cd707d009bbf840e889eb0945a1f419065c1
2ce33306fc8f49af2b6e7177060a2ada44536c4d
process-scan-status=1 (0=matches,1=no-matches,>1=error)
BUG-025-STABILIZE-POST-EXECUTION-BOUNDARY-END
```

The first five hashes and the final two hashes match the pre-execution identities recorded by this
phase. The chaos carrier hash was added to the post-execution boundary and remained read-only.
The process query returned its documented no-match status after every selected browser command.

### BUG-025 Artifact Lint

**Phase:** stabilize
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 stabilize artifact lint pre-record" -- timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 stabilize artifact lint pre-record
$ timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
✅ report.md contains section matching: Summary
✅ report.md contains section matching: Completion Statement
✅ report.md contains section matching: Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ Value-first selection rationale lint skipped (not a value-first report)
✅ Scenario path-placeholder lint skipped (no matching scenario sections found)

=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
```

### Stabilize Profile Closure

| Check | Result |
| --- | --- |
| ST1 — stability scan complete | Passed. Timeout, abort, cleanup, request growth, overlap, publication, DOM, process teardown, configuration, build posture, and resource retention were reviewed. |
| ST2 — findings backed by evidence | Passed. No defect was found. The clean result rests on current source reads plus focused, repeated, complete, chaos, unit, selftest, timeout-budget, process, and artifact-lint execution. |
| ST3 — fixes verified | Not applicable. This diagnostic phase found no fixable issue and changed no production or test file. |
| ST4 — scope artifacts updated | Passed. This stability record and the stabilize-owned execution claim are appended. Scope, DoD, status, and certification remain in progress. |

### Final Stabilize Verdict And Route Accounting

| Finding or route | Disposition |
| --- | --- |
| `BUG-025-ROUTE-015` | Addressed. The required stabilize phase executed against revision 7 with current-session evidence. |
| Stability findings | None found. No code, test, planning, deployment, or security remediation route was created. |
| `BUG-025-ROUTE-016` | Nominal phase-chain route to `bubbles.devops` for mechanical relevance, which follows `stabilize` in `bugfix-fastlane`. It is not a stability finding. |

🟢 STABLE

All stability checks passed across the applicable domains.
No remediation is required.

Domains audited: performance, infrastructure, configuration, build, reliability, resource usage
Issues found: 0

### Completion Statement

The BUG-025 stabilize phase and `BUG-025-ROUTE-015` are closed. Scope 1 remains **In Progress**.
All ten DoD items remain unchecked. Top-level status, `certification.status`, completion arrays,
and certification fields remain in progress. The nominal next owner is `bubbles.devops` for
mechanical phase relevance under the registered `bugfix-fastlane` order.

<a name="devops-mechanical-skip-2026-08-31"></a>
## DevOps Mechanical Skip — 2026-08-31

**Phase:** devops
**Agent:** `bubbles.devops`
**Outcome:** skipped
**Claim Source:** interpreted
**Reevaluated:** false
**Exact reason:** DevOps pass skipped — scope does not modify CI, deployment, monitoring, or infrastructure (runner: bubbles.goal)

### Exact Revision-7 Repository Binding

**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:7 revision=7
```

The exact inherited actionable packet was validated against the authoritative control file before
repository reads. No repository preflight ran, and no control revision advanced.

### Read-Only Relevance Confirmation

**Claim Source:** interpreted

The current Scope 1 change boundary names only the BUG-025 packet, Company Intelligence page and
configuration surfaces, its shared browser module, focused test carriers, the repository selftest,
and its product note. Its excluded families include unrelated surfaces and framework-managed
automation. The current execution state routes `BUG-025-ROUTE-016` only for mechanical phase
relevance after stabilization. Nothing in that current boundary assigns this scope an owned CI,
deployment, monitoring, or infrastructure path. This read-only confirmation does not reevaluate
the top-level mechanical result and does not execute a DevOps check.

**Changed surface:**

- `specs/_bugs/BUG-025-company-corpus-read-never-settles/report.md`
- `specs/_bugs/BUG-025-company-corpus-read-never-settles/state.json`

No CI, deployment, monitoring, infrastructure, product, test, planning, user-validation, or
certification file was modified. No `completedPhaseClaim` was added because the phase outcome is
`skipped`.

### Mechanical Result And Routing

```text
verdict=skip
phase=devops
rule=scope_has_no_ci_deploy_or_infra_changes
reason=DevOps pass skipped — scope does not modify CI, deployment, monitoring, or infrastructure (runner: bubbles.goal)
```

`BUG-025-ROUTE-016` is closed by this recorded mechanical skip. The nominal next route is
`BUG-025-ROUTE-017` to `bubbles.security` for top-level mechanical relevance. Scope 1, all ten DoD
items, top-level status, scope status, completion arrays, and certification remain unchanged.

<a name="security-phase-2026-08-31"></a>
## Security Phase — 2026-08-31

### Verdict

🛑 VULNERABLE

One high-severity security finding remains open. The configuration validator describes
`eventSource.coveredSubjects[].eventsPath` as a same-origin committed path, but it rejects only a
scheme prefix and a leading forward slash. It accepts a network-path reference written with
backslashes. Browser URL resolution converts that accepted value into a different origin, and the
production route issues the request. This is an OWASP A10 server-side-request-forgery analogue in
the browser trust boundary and an A04 insecure-design failure. The current CSP limits reachable
origins, but it does not restore the claimed same-origin invariant and still permits requests to
allowlisted origins or local proxy ports.

The remaining reviewed surfaces produced no finding. The read bound is exact and fail-loud. Abort
expiry cannot become HTTP or schema success. Internal failure metadata is not rendered. Hostile
configuration details do not become markup or links. Subject grammar and encoding keep the ticker
out of paths, query structure, and prototype keys. The stale-intent guard prevents old reads from
repainting or publishing. The mutation carrier changes only one in-memory route guard and rejects
unrelated errors. No dependency or package-source surface changed.

### Exact Revision-7 Repository Binding

**Phase:** security
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file <exact inherited revision-7 packet>`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:7 revision=7
```

The exact inherited packet was validated before repository reads. No preflight ran, and no control
revision advanced.

### Threat Model And Trust-Boundary Review

**Phase:** security
**Claim Source:** interpreted
**Interpretation:** The table traces the current source and test paths read in this phase. Executed
receipts below prove the dynamic claims. Source-only conclusions are kept distinct from those
executions.

| Attack surface | Threat | OWASP | Severity | Current disposition |
| --- | --- | --- | --- | --- |
| `eventSource.coveredSubjects[].eventsPath` → `eventsPathFor()` → `loadOptionalJson()` → `readRouteDocument()` | A backslash network-path reference resolves off origin and causes a browser request outside the committed corpus. | A10, A04 | High | Open as `BUG-025-SEC-001`; route to `bubbles.implement`, with persistent unit and real-browser regression ownership included in the packet. |
| `readBoundMs` and abort metadata | Invalid values, expiry relabelled as success, or transport fallback hiding malformed served configuration. | A04, A08 | None found | `/v2`, positive safe integer, exact carry-forward, no clamp/default, and focused abort/config cases passed. Malformed served configuration refuses rather than falling back. |
| Error and refusal rendering | Remote/config text becomes markup, an href, or executable content. | A03 | None found | `renderRefusal()` writes through `textContent`. Hostile embedded and served config markers were absent from the refusal; child-markup and href counts were zero. |
| Ticker input and overlapping reads | Path traversal, prototype-key reach, or stale hostile/old subject publication. | A01, A03, A08 | None found | The shared ticker grammar, `encodeURIComponent`, and stale-intent return are covered by the 102-case unit and seven-case browser carriers. |
| Test mutation boundary | Canned business data, live-category misclassification, arbitrary errors accepted as mutation bite, or persistent mutation. | A08 | None found | The real HTTP server streams repository responses. The mutation changes one route line in memory, accepts only named repaint/publication differences, and rejects page errors. |
| npm dependency graph | New or untrusted source, mutable version, lifecycle script, or missing integrity. | A06, A08 | None found | Exact Playwright-only dev graph validated; no manifest, lockfile, or npm source-policy delta exists. |

### Finding BUG-025-SEC-001 — Configured Event Path Can Escape The Origin

**Severity:** High
**OWASP:** A10 Server-Side Request Forgery analogue; A04 Insecure Design
**Claim Source:** executed

`readEventSource()` rejects a scheme prefix and a leading `/`, but it does not enforce a relative
POSIX path, forbid backslashes, forbid `..` segments, or bind the resolved URL to the current
origin. The first probe called the production validator and `eventsPathFor()` directly. A
backslash authority was accepted and resolved to an external origin. Forward-slash, backslash,
and encoded traversal inputs were also accepted and escaped the intended committed-data subtree.

```text
# BUG-025 security route-path adversarial probe
$ timeout 60 node --input-type=module -e <production-validator path probe>
exit: 0
lines: 15
sha256: 4f5c9a7912e2c7705665761e2e295c7ebe124f35ae6ad9442c5fcbc10782aab8
[path-probe] candidate="\\\\allowed.example\\collect.json"
[path-probe] accepted=true resolved=https://allowed.example/collect.json
[path-probe] sameOrigin=false errorCode=null
[path-probe] candidate="..\\..\\private.json"
[path-probe] accepted=true resolved=https://lab.example/private.json
[path-probe] sameOrigin=true errorCode=null
[path-probe] candidate="../../private.json"
[path-probe] accepted=true resolved=https://lab.example/private.json
[path-probe] sameOrigin=true errorCode=null
[path-probe] candidate="%2e%2e/%2e%2e/private.json"
[path-probe] accepted=true resolved=https://lab.example/private.json
[path-probe] sameOrigin=true errorCode=null
```

The second probe served the production route and both config copies over a real ephemeral HTTP
origin. With the schema-accepted event path `\\127.0.0.1:9\collect.json`, the browser emitted one
request to `http://127.0.0.1:9/collect.json`. The route still reported a composed, established
reading, so the off-origin request is not surfaced as a configuration refusal.

```text
# BUG-025 security browser cross-origin path probe
$ timeout 120 node --input-type=module -e <production-route cross-origin probe>
exit: 0
lines: 9
sha256: 5d43755cfedbbc02a2e539ec7374f08e8a14561f37bc8406bbc963d3666c841c
[browser-path-probe] runStatus=composed
[browser-path-probe] readiness=established
[browser-path-probe] externalRequestCount=1
[browser-path-probe] externalRequests=["http://127.0.0.1:9/collect.json"]
[browser-path-probe] totalRequestCount=22
[browser-path-probe] maliciousPath="\\\\127.0.0.1:9\\collect.json"
[browser-path-probe] expectedExternalOrigin=http://127.0.0.1:9
[browser-path-probe] finding=CROSS_ORIGIN_FETCH_OBSERVED
```

Required remediation is fail-loud path validation before the normalized registry is returned.
The accepted shape must stay inside the intended relative committed-data namespace after URL
resolution. It must reject scheme, authority, leading slash, backslash, query, fragment, dot
segment, encoded separator, and encoded dot-segment forms. Add adversarial unit cases and a real
browser case proving zero off-origin requests. Do not widen CSP or rely on CSP as the primary
guard. No production, test, or planning file was changed by this diagnostic phase.

### Current-Session Security Verification

#### Company Intelligence Unit Carrier

**Phase:** security
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 security unit 102" -- timeout 240 node --test tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 security unit 102
$ timeout 240 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 110
sha256: 293fd27da8325273d51af5e0a9ae74546a294fb1c28abf7a120da4a0038b2e9f
✔ module holds no DOM, storage, credential, clock or timer authority
✔ BUG-025 readCoverageRegistry accepts v2, carries the exact positive safe-integer read bound and freezes it
✔ BUG-025 the route owns one fetch site inside readRouteDocument and no call site owns a timeout
✔ 027 security — no hostile subject can give the composed owner href a scheme, an authority, a second parameter or a fragment
✔ 027 security — the receiver refuses every hostile subject outright and returns no field carrying it
✔ 027 security — an accepted subject cannot leave data/options/, cannot become a storage key and cannot reach a prototype
✔ 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
✔ 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
ℹ tests 102
ℹ pass 102
ℹ fail 0
ℹ skipped 0
```

#### Focused BUG-025 Browser Carrier

**Phase:** security
**Command:** `timeout 900 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 security focused browser 7" -- timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 security focused browser 7
$ timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 0
lines: 12
sha256: 84c57860b071776bfda4435d5b98bf50ae11b7d311ece028b5fd4057d340ebce
Running 7 tests using 1 worker
✓ BUG-025 invalid embedded read bound refuses before any route-owned request
✓ BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers
✓ BUG-025 never-answering corpus request reaches a bounded unavailable result
✓ BUG-025 never-answering optional document reaches a bounded unavailable result
✓ BUG-025 inside-bound response settles normally
✓ BUG-025 stalled served configuration preserves embedded first paint and settles
✓ BUG-025 late valid completion cannot overwrite a newer settled subject
7 passed (42.7s)
```

#### Repository Selftest

**Phase:** security
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 security repository selftest" -- timeout 1200 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 security repository selftest
$ timeout 1200 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: 307be78734ab41c9a10ff8751a5840f2a526381317206c63a99b8e7ded047060
Step 1 security — escaped model sinks and CSP on every page
✓ every shipped HTML page carries a Content-Security-Policy meta
✓ all pages use one identical CSP instead of drifting per page
✓ CSP blocks object, base-tag, and form exfiltration paths
✓ CSP connect-src is an explicit origin allowlist, never wildcard https
✓ production pages and shared runtime contain no open URL-forwarding relay chain
✓ no model/config-authored field reaches innerHTML without esc()
Research-Lab self-test: 3437 passed, 0 failed
```

#### Regression Quality And Implementation Reality

**Phase:** security
**Claim Source:** executed

```text
# BUG-025 security bugfix regression quality
$ timeout 240 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 16
sha256: c18a2df49c219d397a3ba41f70f1a71bb0731b61d9d715c76565dfd22cd18033
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1

# BUG-025 security implementation reality
$ timeout 240 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --verbose
exit: 0
lines: 35
sha256: 60c8105afc4a82376f1231e9392e091a2ab9058a625d89b13fe8fc1194986a84
Files scanned: 5
Violations: 0
Warnings: 0
🟢 PASSED: No source code reality violations detected
```

#### PII, G034, And Dependency Source Lock

**Phase:** security
**Claim Source:** executed

```text
# BUG-025 security project PII scan
$ timeout 240 node scripts/pii-scan.mjs
exit: 0
[pii-scan] files=10737 messages=2546 findings=0 OK

# BUG-025 security G034 mechanical floor
$ timeout 240 bash .github/bubbles/scripts/security-gate.sh --repo-root /home/philipk/research-lab
exit: 0
[security-gate] OK — 10738 tracked file(s), zero G034 findings

# BUG-025 security dependency source lock
$ timeout 240 node scripts/validate-node-source-lock.mjs
exit: 0
sha256: e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

`git diff --exit-code -- package.json package-lock.json .npmrc` returned exit zero. A direct repeat
reported all three source-lock paths and confirmed no working-tree delta. The first empty-output
capture exposed an evidence-helper parsing defect and is not used as the no-delta evidence.

#### Hostile Error Metadata Probe

**Phase:** security
**Claim Source:** executed

```text
# BUG-025 security hostile error non-rendering
$ timeout 120 node --input-type=module -e <hostile embedded-and-served config probe>
exit: 0
lines: 12
sha256: 17e8ca72e9a1ddcfada770a143c40f7241eb8504f43abbb54c97d49ba7a6ffb4
[error-probe] case=embedded-version-detail
[error-probe] runStatus=refused
[error-probe] refusalCode=C025-CONFIG-VERSION
[error-probe] markerRendered=false
[error-probe] markupChildCount=0 hrefCount=0
[error-probe] textEqualsHtml=true safe=true
[error-probe] case=served-schema-detail
[error-probe] runStatus=refused
[error-probe] refusalCode=C025-CONFIG-SCHEMA
[error-probe] markerRendered=false
[error-probe] markupChildCount=0 hrefCount=0
[error-probe] textEqualsHtml=true safe=true
```

### Security Profile Closure And Finding Accounting

| Check | Result |
| --- | --- |
| SE1 — required categories reviewed | Complete. Path/origin trust, abort lifetime, metadata rendering, config semantics, input/concurrency, test authenticity, PII/secrets, dependencies, and supply-chain changes were reviewed. |
| SE2 — scanner evidence | Complete. G034, project PII, dependency source-lock, implementation-reality, regression-quality, unit, browser, and repository selftest commands executed. |
| SE3 — grounded findings | Complete. `BUG-025-SEC-001` has both production-validator URL-resolution proof and a real-browser off-origin request receipt. |
| SE4 — open-issue artifact update | Complete for diagnostic ownership. This report and state route carry the complete finding to `bubbles.implement`; no foreign-owned production, test, planning, user-validation, or certification artifact was edited. |

| Finding or route | Disposition |
| --- | --- |
| `BUG-025-ROUTE-017` | Addressed. The security phase executed against the exact inherited revision-7 binding. |
| `BUG-025-SEC-001` | Unresolved. High-severity same-origin/path-trust failure routed to `bubbles.implement` with required test closure. |
| Other reviewed security categories | No finding after current source review and executed carriers. |

Scope 1 remains **In Progress**. All ten DoD items remain unchecked. Top-level status,
`certification.status`, scope progress, completion arrays, and certification fields remain unchanged.

<a name="analyst-security-requirement-closure-2026-08-31"></a>
## Analyst Security Requirement Closure — 2026-08-31

### Exact Revision-7 Repository Binding

**Phase:** analyze
**Command:** `timeout 30 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /tmp/research-lab-bug025-revision7-packet.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:7 revision=7
```

No preflight ran, and the repository decision stayed at revision 7.

### Grounded Long-Term Decision

**Claim Source:** interpreted
**Interpretation:** The decision combines the current committed configuration, the production
validator and route, current subject construction, and the executed security-phase browser receipt.

The current control declares `company:msft` beside
`data/company-intelligence/company-msft/events.json`. `resolveSubject()` constructs company subject
IDs by lowercasing the accepted ticker after the `company:` prefix. `readEventSource()` currently
checks only a scheme prefix and one leading forward slash before returning the configured path.
`eventsPathFor()` then exposes that path to `loadOptionalJson()` and `readRouteDocument()`.

The security phase observed that `\\127.0.0.1:9\collect.json` passes that validator and causes a
real browser request to `http://127.0.0.1:9/collect.json`. The durable contract therefore removes
URL choice from `eventsPath`. A declared `company:<suffix>` now admits exactly one repository path,
derived byte-for-byte from a closed lowercase subject suffix.

The reconciled requirements add FR-025-008 through FR-025-013, three security scenarios, and eight
acceptance criteria. They require exact subject grammar, exact subject-to-path equality, fail-loud
`C025-CONFIG-SCHEMA` behavior, zero transport for invalid embedded configuration, no served-config
fallback, an adversarial unit matrix, a real-browser no-request proof, and the current MSFT control.

### Artifact Lint

**Phase:** analyze
**Command:** `timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ No forbidden sidecar artifacts present
✅ Detected state.json status: in_progress
✅ Top-level status matches certification.status
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

`bug.md` remains accurate for the original non-settling defect. Its expected bounded outcome and
missing-abort root cause do not conflict with this independent configured-path finding, so this
analyst phase did not alter that bug-owner artifact.

### Finding Accounting And Routing

| Finding | Disposition |
| --- | --- |
| `BUG-025-SEC-001-REQUIREMENTS` | Addressed. The analyst-owned requirements now define the canonical subject-to-event-path contract and its proof obligations. |
| `BUG-025-SEC-001-UX-DESIGN-PLAN-DELIVERY` | Unresolved. UX must reconcile the existing named refusal experience before design, planning, test, implementation, and security re-verification proceed. |

No broad test ran. This phase changed only analyst-owned requirements plus execution evidence and
routing metadata. Scope status, all ten DoD items, top-level status, completion arrays, and every
`certification.*` field remain unchanged.

<a name="ux-security-refusal-reconciliation-2026-08-31"></a>
## UX Security Refusal Reconciliation — 2026-08-31

### Exact Revision-8 Repository Binding

**Phase:** UX analyze
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /tmp/research-lab-bug025-sec001-rev8-packet.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:8 revision=8
```

The exact dispatched packet was validated before any Research Lab read. No preflight ran, and the control revision remained 8.

### Grounded Interaction Sources

**Claim Source:** interpreted
**Interpretation:** This UX decision reconciles the current bug contract with the existing production route and its delivered parent UX.

| Source read in this phase | UX fact retained |
| --- | --- |
| `spec.md` FR-025-008 through FR-025-013 | One canonical subject and path pair succeeds. Every invalid pair reaches the existing configuration refusal before unauthorized transport. |
| `state.json` | Scope 1 and the packet remain in progress. The analyst routed security refusal reconciliation to `bubbles.ux`. |
| `uservalidation.md` | Human acceptance remains recorded as `external-record`. It does not prove a live browser walkthrough. |
| `report.md#security-phase-2026-08-31` | The executed browser probe observed an off-origin request from a schema-accepted backslash authority. |
| `report.md#analyst-security-requirement-closure-2026-08-31` | The canonical-by-construction subject and path contract is the active requirement truth. |
| `company-intelligence-lab.html` | The Company band already contains `#subject-refusal`. Embedded composition runs before served configuration reconciliation. |
| `rlcompanyintel.js` | `readCoverageRegistry()` owns schema validation. `readEventSource()` currently returns accepted event path declarations to consumers. |
| `specs/025-company-multi-horizon-intelligence-lab/spec.md` | The delivered parent UX uses one route, Simple and Power views, four peer horizons, and named unavailable evidence. |
| `docs/Product-Principles.md` P2 and P12 | Missing evidence stays missing. A meaningful cache-first paint precedes delta acquisition. |

### Reconciled Single-Screen Contract

The UX-owned sections now define one screen with three explicit states. Valid embedded configuration paints first. Valid served configuration then reconciles on the same screen.

Invalid embedded configuration reaches the existing `C025-CONFIG-SCHEMA` paragraph immediately. It presents no settled horizon or coverage account and authorizes no route request.

Invalid served configuration replaces result emphasis with the same route-level refusal. The earlier embedded paint never becomes a fallback success and cannot authorize corpus continuation.

The refusal remains distinct from ordinary unavailable evidence. A refusal is route-level and has `data-run-status="refused"`. Unavailable evidence belongs to a valid composed reading with established readiness.

The existing paragraph receives atomic alert semantics. Initial refusal and asynchronous refusal do not steal focus. The code and safe message remain the non-colour signal.

No new page, modal, toast, retry control, configuration editor, user action, visible code, normalization, fallback, or external path was specified.

### UX Profile Mechanical Verification

**Phase:** UX analyze
**Command:** bounded UX1 through UX9 `grep` and file assertions against `spec.md`, followed by screen, state, and flow inventory counts
**Exit Code:** 0
**Claim Source:** executed

```text
UX1 PASS: canonical UI Wireframes section exists
UX2 PASS: ASCII wireframe content exists
UX3 PASS: interaction behavior is recorded
UX4 PASS: responsive behavior is recorded
UX5 PASS: accessibility behavior is recorded
UX6 PASS: state.json exists for execution metadata
UX7 PASS: one active wireframe section and one active flow section
UX8 PASS: no forbidden UX sidecar exists
UX9 PASS: concrete single-screen justification exists
UX INVENTORY: screens=1 states=3 flows=3
```

### BUG-025 Artifact Lint

**Phase:** UX analyze
**Command:** `timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
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
```

### Acceptance Evidence Boundary

The operator approval remains the existing `external-record` in `uservalidation.md`. This UX phase did not claim or perform a human live exercise.

No product test or browser carrier ran in this UX phase. The phase changed no production code, test, scope, DoD, certification, or user-validation content.

### Finding Accounting And Routing

| Finding | Disposition |
| --- | --- |
| `BUG-025-SEC-001-UX` | Addressed. The canonical inline UX sections now define all three states, focus behavior, alert semantics, responsive behavior, and refusal versus unavailable evidence. |
| `BUG-025-SEC-001-DESIGN-PLAN-DELIVERY` | Unresolved. `bubbles.design` must reconcile the technical contract before planning, RED carriers, implementation, and independent security re-verification proceed. |

Scope 1, all ten DoD items, top-level status, completion arrays, and every `certification.*` field remain unchanged and in progress.

<a name="design-security-contract-reconciliation-2026-08-31"></a>
## Design Security Contract Reconciliation — 2026-08-31

### Exact Revision-8 Repository Binding

**Phase:** design
**Command:** `printf '%s\n' '<exact inherited revision-8 packet>' | timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /dev/stdin`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:8 revision=8
```

The validated packet carried repository root `/home/philipk/research-lab`, alias `research-lab`,
decision `rb:vscode-20072c8d3f74af455af2514e746fced3:8`, revision `8`, and digest
`sha256:7e982c9a1b25048dd68c8c758dbc39cdc603988bddfe07251568ed72f9d0becc`.
No preflight ran, and the control revision remained 8.

### Grounded Design Inputs

**Claim Source:** interpreted
**Interpretation:** The design decisions below derive from the exact current artifacts and source regions read during this phase.

| Source read | Design fact retained or corrected |
| --- | --- |
| `spec.md` FR-025-008 through FR-025-013 | Each covered company admits one exact subject-derived event path. Invalid embedded and served declarations fail with existing schema refusal semantics. |
| `spec.md` UX sections | A route-level config refusal suppresses result presentation, preserves focus, announces atomically, and remains distinct from ordinary unavailable evidence. |
| `report.md#security-phase-2026-08-31` | Executed probes observed a schema-accepted backslash authority and one real off-origin browser request. |
| `report.md#analyst-security-requirement-closure-2026-08-31` | The active long-term decision removes URL choice from `eventsPath`. |
| `state.json` and `uservalidation.md` | Scope 1, all ten DoD items, status, and certification remain in progress. Human acceptance remains an external record. |
| `company-intelligence.config.json` and the embedded JSON block | Both copies contain the valid MSFT pair and remain deep-equality controls under v2. |
| `rlcompanyintel.js::readEventSource` | The current check rejects only a scheme and leading forward slash, then copies the declared path into the normalized registry. |
| `company-intelligence-lab.html::boot` | The current served branch assigns `config` before validation and starts `loadCorpus()` only after its fulfilled continuation. |
| `company-intelligence-lab.html::renderRefusal` | The current function leaves both result surfaces and subject identity present, derives readiness from corpus state, and has no atomic-alert attributes. |
| Current unit, browser, and selftest carriers | Existing tests protect v2 bounds and route lifetimes but contain no canonical event-pair rejection matrix or invalid served mismatch flow. |

### Reconciled Long-Term Contract

The design now requires exact `company:<suffix>` syntax with suffix grammar
`[a-z0-9]+(?:-[a-z0-9]+)*`. It derives
`data/company-intelligence/company-<suffix>/events.json`, compares the declaration exactly, rejects
duplicate subjects, and reconstructs the normalized row from the accepted suffix.

Raw embedded and served documents remain local candidates until the entire registry validates.
Invalid embedded config refuses before `run()` and `readConfig()`. Invalid served config refuses
after first paint but before authoritative assignment or `loadCorpus()`.

`renderRefusal()` receives an explicit route-terminal presentation for config failures. That branch
hides the subject identity and both result surfaces, forces not-established readiness, uses one
atomic alert update, preserves focus, and latches controls against corpus acquisition. Standing
input refusal and ordinary dimension unavailability keep their existing behavior.

The test design requires scenario-first RED. It specifies an accepted unit control, a complete
adversarial matrix, embedded backslash and served mismatch browser flows, one-request canonical
browser control, and exact in-memory mutation controls. New browser carriers use the real ephemeral
HTTP server and no request interception.

The closed delivery set contains `rlcompanyintel.js`, `company-intelligence-lab.html`, the two
Company Intelligence test files, `scripts/selftest.mjs`, and `notes/company-intelligence-lab.md`.
The committed config, embedded object, MSFT event document, spec, bug record, and user validation
remain controls. No shared URL framework, second capability, dependency, fallback, retry, CSP
change, or new error code is permitted.

### Design Profile Receipt

**Phase:** design
**Command:** bounded heading counts, active-security-anchor checks, stale-wording scan, and `git diff --check` against `design.md`
**Exit Code:** 0
**Claim Source:** executed

```text
DESIGN_BRIEF_COUNT=1
CURRENT_STATE_COUNT=1
TARGET_STATE_COUNT=1
CANONICAL_EVENT_COUNT=1
VALIDATION_ORDER_COUNT=1
REJECTION_MATRIX_COUNT=1
EMBEDDED_FLOW_COUNT=1
SERVED_FLOW_COUNT=1
REFUSAL_PRESENTATION_COUNT=1
PRESERVED_CONTRACTS_COUNT=1
TEST_MAPPING_COUNT=1
CONSUMER_BOUNDARY_COUNT=1
SINGLE_IMPLEMENTATION_COUNT=1
COMPLEXITY_COUNT=1
DESIGN_FRESHNESS=PASS
DESIGN_DIFF_CHECK=PASS
```

This receipt covers DE1 through DE4. Active design has one current contract, agrees with the
reconciled spec, contains no stale pre-v2 active wording, and records a concrete single-implementation
justification.

### Artifact Lint Receipt

**Phase:** design
**Command:** `timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
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
```

### Finding And Transition Accounting

| Finding or route | Disposition |
| --- | --- |
| `BUG-025-ROUTE-019` | Addressed. The required technical design now reconciles canonical validation, refusal ordering, presentation, testing, and the closed delivery boundary. |
| `BUG-025-SEC-001-DESIGN` | Addressed in `design.md` with current-source grounding and passing design-profile checks. |
| `BUG-025-SEC-001-PLAN-DELIVERY` | Unresolved. `bubbles.plan` owns Scope 1 Gherkin, Test Plan, unchecked DoD, scenario-manifest, and scenario-first RED routing. |

No product implementation or persistent test changed in this phase. No product test ran. Scope 1,
all ten current DoD items, top-level status, scope status, completion arrays, user validation, and
every `certification.*` field remain unchanged and in progress.

<a name="validate-certification-mirror-015-reconciliation-2026-08-31"></a>
## Validate Nonterminal Certification Mirror Reconciliation — BUG-025-CERT-MIRROR-015 — 2026-08-31

This surgical validate action used the exact inherited Research Lab repository-binding decision
`rb:vscode-20072c8d3f74af455af2514e746fced3:8` at control revision 8. Packet validation succeeded
against the supplied host-private control file. No repository preflight ran and no revision advanced.

Scope 1 contains zero checked and fifteen unchecked Definition of Done items. The validate-owned
`certification.scopeProgress` mirror previously claimed 0/10. This action changed only that mirror
to `status: in_progress`, `dodChecked: 0`, and `dodUnchecked: 15`, then recorded validate-owned
history and route closure. Both status mirrors remain `in_progress`. `completedScopes` and
`certifiedCompletedPhases` remain empty. No `certifiedAt` field exists. Lockdown remains `unlocked`.

### Exact Revision-8 Binding

**Phase:** validate
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id 'vscode-20072c8d3f74af455af2514e746fced3' --session-control-file '/run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json' --packet-file '/tmp/BUG-025-ROUTE-022-revision-8-packet.json'`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:8 revision=8
```

### Focused Progress Parity Before Reconciliation

**Phase:** validate
**Command:** `timeout 180 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-CERT-MIRROR-015 pre-edit focused progress parity" -- timeout 120 node scripts/validate-scope-dod-progress.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025-CERT-MIRROR-015 pre-edit focused progress parity
$ timeout 120 node scripts/validate-scope-dod-progress.mjs
exit: 1
lines: 3
sha256: 653509a9045e305463e620b31c45a71215286ec4de51ed1f36125c3387fce2c8
--- output ---
[scope-dod-progress] packets=72 claims=95 agree=80 drift=15 unresolved=0 baseline=14 new=1 stale=0
	NEW-DRIFT specs/_bugs/BUG-025-company-corpus-read-never-settles#01::certification (01-declare-and-enforce-one-read-bound) — claims 0/10 checked/unchecked, artifact has 0/15 [specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md]
[scope-dod-progress] FAIL — 1 scope progress claim(s) do not match their artifact
```

### Focused Progress Parity After Reconciliation

**Phase:** validate
**Command:** `timeout 180 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-CERT-MIRROR-015 post-edit focused progress parity" -- timeout 120 node scripts/validate-scope-dod-progress.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025-CERT-MIRROR-015 post-edit focused progress parity
$ timeout 120 node scripts/validate-scope-dod-progress.mjs
exit: 0
lines: 2
sha256: 9be37eda5989fe5a2f62b884518c685702e43e48acaf816a8b9a4d7f8b6a035d
--- output ---
[scope-dod-progress] packets=72 claims=95 agree=81 drift=14 unresolved=0 baseline=14 new=0 stale=0
[scope-dod-progress] OK — no new DoD progress drift
```

### Repository Selftest Diagnostic

**Phase:** validate
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-CERT-MIRROR-015 repository selftest diagnostic" -- timeout 1200 node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025-CERT-MIRROR-015 repository selftest diagnostic
$ timeout 1200 node scripts/selftest.mjs
exit: 1
lines: 3906
sha256: 974b16e2e38209830c5ef6542d73016f344093ba71bf7d5a6a7669763f500996
--- failure-shaped lines from the captured output ---
	✗ FAIL: BUG-018 test provenance distinguishes ordinary unmodified traffic from annotated pass-through, real-server fault injection, and the route-only mutation control
--- final summary ---
================================================
Research-Lab self-test: 3436 passed, 1 failed
================================================
```

The repository selftest is diagnostic only for this surgical mirror repair. Its current output no
longer contains the BUG-025 0/10-versus-0/15 progress drift. It remains non-green on the quoted
BUG-018 test-provenance check and therefore is not final validation or completion evidence.

### Artifact Lint

**Phase:** validate
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-CERT-MIRROR-015 artifact lint before closure record" -- timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025-CERT-MIRROR-015 artifact lint before closure record
$ timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- selected output from the captured 40-line stream ---
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ All checked DoD items in scopes.md have evidence blocks
Artifact lint PASSED.
```

### Finding And Route Accounting

| Finding or route | Disposition |
| --- | --- |
| `BUG-025-CERT-MIRROR-015` | Addressed. Scope 1's validate-owned nonterminal certification mirror now matches the artifact at 0 checked and 15 unchecked. |
| `BUG-025-ROUTE-022` | Addressed. The route is closed by `bubbles.validate` with current-session focused parity and artifact-lint evidence. |
| `BUG-025-SEC-001-RED` | Unresolved. Scenario-first security RED remains owned by `bubbles.test`. |
| `BUG-025-ROUTE-021` | Preserved pending and still routes `BUG-025-SEC-001-RED` to `bubbles.test`. |

No test, production, planning, spec, design, scenario-manifest, product documentation, or user
validation file changed in this action. All fifteen DoD items remain unchecked. This is
nonterminal certification-mirror hygiene only. It does not certify the packet, complete Scope 1,
record a validate phase claim, or promote either status mirror.

<a name="scenario-first-security-red-bug-025-sec-001-2026-08-31"></a>
## Scenario-First Security RED — BUG-025-SEC-001 — 2026-08-31

The scenario-first security checkpoint is closed as a discriminating RED receipt. It is not an
implementation fix. The canonical unit and browser controls remain green. The invalid unit matrix
and both invalid browser scenarios fail only on their named security contracts.

The production equality guard and route-terminal suppression branch do not exist yet. Their
mutation carriers therefore stop at exact mutation preconditions. These failures do not claim a
post-fix mutation bite. `BUG-025-SEC-001` remains unresolved.

### Exact Revision-8 Repository Binding

**Phase:** test
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id 'vscode-20072c8d3f74af455af2514e746fced3' --session-control-file '/run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json' --packet-file '/tmp/BUG-025-SEC-001-revision-8-packet-exact.json'`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=~/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:8 revision=8
```

The inherited packet carried control revision 8 and digest
`sha256:7e982c9a1b25048dd68c8c758dbc39cdc603988bddfe07251568ed72f9d0becc`.
No preflight ran. The revision did not advance.

<a name="bug-025-sec-001-unit-matrix"></a>
### Security Unit Matrix

**Phase:** test
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 SEC-001 whole unit carrier RED TAP accounting" -- timeout 240 node --test --test-reporter=tap tests/company-intelligence.unit.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025 SEC-001 whole unit carrier RED TAP accounting
$ timeout 240 node --test --test-reporter=tap tests/company-intelligence.unit.mjs
exit: 1
lines: 968
sha256: eb1e8b4fd3d467574006c3d543d5279c898fedf8f7feb5d97376ef1a1a5d1424
		not ok 2 - normalized event authority is reconstructed instead of copied from the raw candidate
		not ok 3 - subject grammar rejects every non-canonical prefix, suffix and hyphen form
		not ok 4 - path grammar rejects destinations, decorations, controls, dot segments and encoded forms
		not ok 5 - subject correspondence and one-row cardinality reject mismatch, arbitrary files and duplicates
		not ok 6 - readEventSource uses strict contract comparison without URL parsing decoding or sanitizing replacement
		not ok 7 - one exact equality-guard mutation admits a named invalid probe without arbitrary runtime failure
not ok 61 - BUG-025 security event declaration matrix rejects every non-canonical pair without rejecting the canonical pair
1..103
# tests 110
# suites 0
# pass 103
# fail 7
# cancelled 0
# skipped 0
# todo 0
```

The six failed nested tests and their failed parent are the complete seven-test failure set. No
test outside the security matrix failed. The accepted canonical nested subtest was selected again.

**Phase:** test
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 SEC-001 canonical unit subtest GREEN" -- timeout 240 node --test --test-name-pattern "accepted canonical pair remains exact and deeply frozen" tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 SEC-001 canonical unit subtest GREEN
$ timeout 240 node --test --test-name-pattern accepted canonical pair remains exact and deeply frozen tests/company-intelligence.unit.mjs
exit: 0
lines: 9
sha256: 1864397875ab321dcff3cf79d3d29aad62f801a79e944196259cb2444a2e1f8e
✔ tests/company-intelligence.unit.mjs (107.367907ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 117.071187
```

<a name="bug-025-sec-001-canonical-browser"></a>
### Canonical Security Browser Control

**Phase:** test
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 SEC-001 canonical browser GREEN" -- timeout 180 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-025 canonical company event path is requested once and exclusively" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 SEC-001 canonical browser GREEN
$ timeout 180 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Regression: BUG-025 canonical company event path is requested once and exclusively --reporter=list
exit: 0
lines: 6
sha256: b1abba795c20f1e062d4b131e76644205048db44d439c1bba6d67b4b2935849a

Running 1 test using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:759:1 › Regression: BUG-025 canonical company event path is requested once and exclusively (814ms)

	1 passed (3.4s)
```

<a name="bug-025-sec-001-embedded-browser"></a>
### Embedded Backslash Browser RED

**Phase:** test
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 SEC-001 embedded backslash browser RED" -- timeout 180 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-025 embedded backslash authority refuses before transport" --reporter=list`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025 SEC-001 embedded backslash browser RED
$ timeout 180 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Regression: BUG-025 embedded backslash authority refuses before transport --reporter=list
exit: 1
lines: 43
sha256: 8a2ff27d075949111840ffbeb2cbe35e2740fe2c740337913ef839c14e1c0d35

Running 1 test using 1 worker

	✘  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:791:1 › Regression: BUG-025 embedded backslash authority refuses before transport (1.0s)

Error: embedded backslash declaration survived named security discriminators: run-status-refused, refusal-code, reading-readiness-not-established, unavailable-not-established, result-surfaces-hidden, subject-identity-hidden, atomic-alert-attributes, one-alert-transition, zero-route-owned-requests

	1 failed
		[system-chrome] › tests/company-intelligence-lab.spec.mjs:791:1 › Regression: BUG-025 embedded backslash authority refuses before transport
```

The carrier first required an empty runtime-error ledger. It then failed on the nine named
security discriminators. The failure was not a page, navigation, server, or runtime error.

<a name="bug-025-sec-001-served-browser"></a>
### Served Subject-Path Mismatch Browser RED

**Phase:** test
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 SEC-001 served mismatch browser RED" -- timeout 180 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft" --reporter=list`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025 SEC-001 served mismatch browser RED
$ timeout 180 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft --reporter=list
exit: 1
lines: 45
sha256: b4208e8f59de37d36de64edc1ff8d70b6dd96c2ae4bece8171633420e212b25c

Running 1 test using 1 worker

	✘  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:802:1 › Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft (1.3s)

Error: served subject-path mismatch survived named terminal discriminators: run-status-refused, registry-source-remains-embedded, refusal-code, reading-readiness-not-established, unavailable-not-established, result-surfaces-hidden, subject-identity-hidden, atomic-alert-attributes, one-alert-transition, zero-corpus-event-continuation, mismatched-event-path-never-requested

	1 failed
		[system-chrome] › tests/company-intelligence-lab.spec.mjs:802:1 › Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft
```

The carrier first required an empty runtime-error ledger. It then failed on the eleven named
terminal-security discriminators. The focus, disclosure, request-cardinality, and terminal-stability
discriminators did not fail.

<a name="bug-025-sec-001-mutation-preconditions"></a>
### Mutation Preconditions

**Phase:** test
**Claim Source:** executed

```text
# BUG-025 SEC-001 embedded equality mutation precondition RED
$ timeout 180 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Mutation control: BUG-025 embedded equality-guard removal defeats named refusal discriminators --reporter=list
exit: 1
lines: 31
sha256: 25722d4d36f522fe43f3c74313be91e1fa1aec2f80b85807239e0ec8aa4e24a7
Error: the equality mutation must find exactly one declared-versus-derived event-path guard
Expected: 1
Received: 0

# BUG-025 SEC-001 served equality mutation precondition RED
exit: 1
lines: 31
sha256: b4ec3266c4ffc2bc454e172c50c1f160136bea5a5d0a2dc4bc8f8fd7ce106558
Error: the equality mutation must find exactly one declared-versus-derived event-path guard
Expected: 1
Received: 0

# BUG-025 SEC-001 route suppression mutation precondition RED
exit: 1
lines: 31
sha256: cc07d253eb2ab62c0038a1bd8353782211620c268960987a7e1f3b115f43a8b7
Error: the suppression mutation must find exactly one route-terminal data-surface hide statement
Expected: 1
Received: 0
```

These preconditions reject arbitrary mutation targets. They will become post-fix mutation controls
only after implementation adds one exact equality guard and one exact suppression statement.

<a name="bug-025-sec-001-selftest"></a>
### Repository Selftest After Provenance Repair

The stale predicate expected one route-only mutation. The browser header truthfully declares
bounded route or module mutations. The repaired predicate requires that exact combined wording.
It still rejects blanket no-interception and pass-through-only headers. The separate request gate
still rejects `route.fulfill()` and `route.abort()` substitution.

**Phase:** test
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 SEC-001 provenance predicate selftest GREEN" -- timeout 1200 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 SEC-001 provenance predicate selftest GREEN
$ timeout 1200 node scripts/selftest.mjs
exit: 0
lines: 3906
sha256: e0dcb399b59bf2ba7d4f2ed82c36503ab07fb1728540a3d2bf93fe68591c6a5d
--- final summary ---
================================================
Research-Lab self-test: 3437 passed, 0 failed
================================================
```

<a name="bug-025-sec-001-scenario-and-quality"></a>
### Scenario Resolution And Regression Quality

**Phase:** test
**Claim Source:** executed

```text
# BUG-025 SEC-001 eight-link scenario resolution
$ timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .
exit: 0
lines: 1
sha256: 13944314bdad890eb9fcb00c3b5c158d924974438c8d6ad0e7c3ab3963e71d03
[scenario-test-resolve] OK — 8 reference(s) resolved via literal-scan; 8 category comparison(s) not applicable (no test-discovery adapter declared)

# BUG-025 SEC-001 regression quality guard
$ timeout 240 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 16
sha256: f84b2ddf4c4e1d68723319543a55b535576bee6c25542593d8f51982048a5491
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1

[BUG-025 skip scan] OK — zero skip, only, todo, xit, xdescribe, or pending markers
[BUG-025 bailout scan] OK — zero failure-condition early-return bailout patterns
```

### Reality And Artifact Checks

**Phase:** test
**Claim Source:** executed

```text
# BUG-025 SEC-001 implementation reality before route record
$ timeout 240 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --verbose
exit: 0
lines: 35
sha256: 60c8105afc4a82376f1231e9392e091a2ab9058a625d89b13fe8fc1194986a84
IMPLEMENTATION REALITY SCAN RESULT
Files scanned:  5
Violations:     0
Warnings:       0
🟢 PASSED: No source code reality violations detected

# BUG-025 SEC-001 artifact lint before route record
$ timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ All checked DoD items in scopes.md have evidence blocks
Artifact lint PASSED.
```

### Production And Test Boundary

**Phase:** test
**Claim Source:** executed

```text
14c4af82444fe0e4a07d456c18d34effd127042bca66e543244c0d008259c9f8  rlcompanyintel.js
b6b25b42a903f9911ce9c3bfeba99346d723bba5bf3dac96ba93b0ff2cb6c78c  company-intelligence-lab.html
937dffcc2c78cf29e77d280f93c39c0a38c057e3035f60966f8582f1f3d4dded  company-intelligence.config.json
2d03ea21025c8dfd4938d53d9cfe1d76f721add78e8f06e8cfc69a17b1a39af4  data/company-intelligence/company-msft/events.json
3214109df462c2272ae50c7f63ba09b25d46be3cde01a07a5a43f2f7707c7d35  notes/company-intelligence-lab.md
402f3ba7eb0996c6849a1cb313d88034973bc0337151b23f253258d32c2341bd  tests/company-intelligence.unit.mjs
96e6b7ace04538a0a2ac787b697de1d2584142eba1abb3100b22bb015fb5bba6  tests/company-intelligence-lab.spec.mjs
a5da6b25e7598ce3af5585beff458f8a3f6fa640e97a9a3b29f2c4676a8a8c74  scripts/selftest.mjs
[BUG-025 diff check] exit=0
```

The first five hashes match the pre-edit current-session baseline. No production, config,
embedded-object container, event data, or implementation-owned note byte changed. The two test
carriers remained unchanged. Only the test-owned selftest predicate changed before this record.

### Finding And Transition Accounting

| Finding or route | Disposition |
| --- | --- |
| `BUG-025-TEST-PROVENANCE-STALE` | Addressed. The selftest now recognizes the truthful route-or-module mutation header and preserves request-substitution rejection. |
| `BUG-025-SEC-001-RED` | Addressed as a discriminating RED checkpoint. This disposition does not claim an implementation fix. |
| `BUG-025-ROUTE-021` | Addressed. The exact unit and browser carriers now have current-session RED evidence and all eight scenario links resolve. |
| `BUG-025-SEC-001` | Unresolved. Production still accepts non-canonical event declarations and lacks terminal refusal suppression. |
| `BUG-025-SEC-001-IMPLEMENTATION` | Routed through `BUG-025-ROUTE-023` to `bubbles.implement`. |

Implementation may change only `rlcompanyintel.js`, `company-intelligence-lab.html` outside the
embedded JSON object, and `notes/company-intelligence-lab.md`. The two persistent tests remain
immutable discriminators during implementation. All fifteen DoD items and both status mirrors
remain in progress. Certification and completion arrays remain unchanged.

<a name="bug-025-sec-001-quiescence-harness-correction-2026-08-31"></a>
## Test Harness Correction — BUG-025-SEC-001-QUIESCENCE-HARNESS — 2026-08-31

The test owner removed only the total static-server request-count equality from two aggregate
terminal checks. Static-resource timing can change that total after the terminal snapshot.

Both checks still compare the complete terminal security signature. Both still reject a later
composed or established state. The embedded check still requires zero route-owned, invalid-path,
and off-origin requests. The served check still requires zero corpus or event continuation. It
also requires that the mismatched event path is never requested and the served config is requested
once. Every mutation expectation remains unchanged.

All requested test and guard commands exited zero. This action does not close the production
implementation record. Existing route `BUG-025-ROUTE-023` remains pending for `bubbles.implement`.
That owner must record its production closure and route independent security verification.

### Exact Revision-8 Repository Binding

**Phase:** test
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /tmp/bug025-revision-8-packet.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=~/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:8 revision=8
```

The command validated the supplied packet directly. No repository preflight ran, and no control
revision advanced.

### Exact Embedded And Served Production Cases

**Phase:** test
**Claim Source:** executed

```text
# BUG-025 SEC-001 quiescence harness exact embedded production
$ timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Regression: BUG-025 embedded backslash authority refuses before transport --reporter=list
exit: 0
lines: 6
sha256: 877a0d0fe323d629c6bee6d68f9e8dc13db7a603897cac5639788a412570ddfb
--- output ---

Running 1 test using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:789:1 › Regression: BUG-025 embedded backslash authority refuses before transport (1.2s)

	1 passed (3.9s)

# BUG-025 SEC-001 quiescence harness exact served production
$ timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft --reporter=list
exit: 0
lines: 6
sha256: e6c94986941351c7452af1ce70239a8a9ab48967efa3c79148e3292954279230
--- output ---

Running 1 test using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:800:1 › Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft (1.1s)

	1 passed (3.4s)
```

### Exact Mutation Controls And Canonical Control

**Phase:** test
**Claim Source:** executed

```text
# BUG-025 SEC-001 exact route-suppression mutation
$ timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Mutation control: BUG-025 served route suppression removal defeats only named visibility discrimination --reporter=list
exit: 0
lines: 6
sha256: 966126ba04acc7e01ba28329d00693650b24db835f5b2a90a74a1302ee9ff84a
--- output ---

Running 1 test using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:835:1 › Mutation control: BUG-025 served route suppression removal defeats only named visibility discrimination (1.0s)

	1 passed (3.0s)

# BUG-025 SEC-001 both equality mutations
$ timeout 300 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Mutation control: BUG-025 (embedded|served) equality-guard removal defeats named (refusal|continuation) discriminators --reporter=list
exit: 0
lines: 7
sha256: 7e3669a5a65c12deaaf1e8af7d31b72e0c9c486b590adb3bebf6fa53fd747070
--- output ---

Running 2 tests using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:811:1 › Mutation control: BUG-025 embedded equality-guard removal defeats named refusal discriminators (1.0s)
	✓  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:822:1 › Mutation control: BUG-025 served equality-guard removal defeats named continuation discriminators (952ms)

	2 passed (3.9s)

# BUG-025 SEC-001 exact canonical control
$ timeout 240 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep Regression: BUG-025 canonical company event path is requested once and exclusively --reporter=list
exit: 0
lines: 6
sha256: ab63c6c0dbefd7ae347f86ebf788f6887296190baf5d9e4149c2df7f229bc2dd
--- output ---

Running 1 test using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:757:1 › Regression: BUG-025 canonical company event path is requested once and exclusively (671ms)

	1 passed (2.8s)
```

The route-suppression test source requires the exact failure list
`['result-surfaces-hidden']`. Its passing execution proves the mutation produced only that named
visibility discriminator.

### Combined Security And Focused BUG-025 Cases

**Phase:** test
**Claim Source:** executed

```text
# BUG-025 SEC-001 combined six security cases
$ timeout 420 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep (Regression: BUG-025 (canonical company event path is requested once and exclusively|embedded backslash authority refuses before transport|served subject-path mismatch becomes terminal without continuation or focus theft)|Mutation control: BUG-025 (embedded equality-guard removal defeats named refusal discriminators|served equality-guard removal defeats named continuation discriminators|served route suppression removal defeats only named visibility discrimination)) --reporter=list
exit: 0
lines: 11
sha256: 07f0b94a258ef41985453cbd198177e7f7a3dc95f05b459e9d7360ef89b0a03d
--- output ---

Running 6 tests using 1 worker

	✓  1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:757:1 › Regression: BUG-025 canonical company event path is requested once and exclusively (553ms)
	✓  2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:789:1 › Regression: BUG-025 embedded backslash authority refuses before transport (763ms)
	✓  3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:800:1 › Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft (866ms)
	✓  4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:811:1 › Mutation control: BUG-025 embedded equality-guard removal defeats named refusal discriminators (862ms)
	✓  5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:822:1 › Mutation control: BUG-025 served equality-guard removal defeats named continuation discriminators (942ms)
	✓  6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:835:1 › Mutation control: BUG-025 served route suppression removal defeats only named visibility discrimination (853ms)

	6 passed (7.0s)

# BUG-025 SEC-001 corrected-harness focused BUG-025 selection
$ timeout 900 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 0
lines: 18
sha256: 3474879fc995d14b3670602e5c03a8a7eedd38da7d49cee65224128f3acddfae
--- output ---

Running 13 tests using 1 worker

	✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:757:1 › Regression: BUG-025 canonical company event path is requested once and exclusively (571ms)
	✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:789:1 › Regression: BUG-025 embedded backslash authority refuses before transport (866ms)
	✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:800:1 › Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft (1.2s)
	✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:811:1 › Mutation control: BUG-025 embedded equality-guard removal defeats named refusal discriminators (921ms)
	✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:822:1 › Mutation control: BUG-025 served equality-guard removal defeats named continuation discriminators (949ms)
	✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:835:1 › Mutation control: BUG-025 served route suppression removal defeats only named visibility discrimination (890ms)
	✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:847:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (364ms)
	✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:875:1 › Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers (468ms)
	✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:935:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.3s)
	✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:957:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.3s)
	✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:980:1 › Regression: BUG-025 an inside-bound response settles normally (3.5s)
	✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1013:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.2s)
	✓  13 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1291:1 › Regression: BUG-025 late valid completion cannot overwrite a newer settled subject (1.1s)

	13 passed (46.7s)
```

### Complete Company Intelligence Browser Carrier

**Phase:** test
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 SEC-001 corrected-harness complete Company Intelligence browser" -- timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 SEC-001 corrected-harness complete Company Intelligence browser
$ timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 60
sha256: 3d09c2935f4b56e0ab42cd6aea57bb5da8167393b9b3f43bcc070bf11574c108
--- first 20 ---

Running 55 tests using 1 worker

	✓   1 [system-chrome] › tests/company-intelligence-lab.spec.mjs:757:1 › Regression: BUG-025 canonical company event path is requested once and exclusively (570ms)
	✓   2 [system-chrome] › tests/company-intelligence-lab.spec.mjs:789:1 › Regression: BUG-025 embedded backslash authority refuses before transport (791ms)
	✓   3 [system-chrome] › tests/company-intelligence-lab.spec.mjs:800:1 › Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft (857ms)
	✓   4 [system-chrome] › tests/company-intelligence-lab.spec.mjs:811:1 › Mutation control: BUG-025 embedded equality-guard removal defeats named refusal discriminators (880ms)
	✓   5 [system-chrome] › tests/company-intelligence-lab.spec.mjs:822:1 › Mutation control: BUG-025 served equality-guard removal defeats named continuation discriminators (918ms)
	✓   6 [system-chrome] › tests/company-intelligence-lab.spec.mjs:835:1 › Mutation control: BUG-025 served route suppression removal defeats only named visibility discrimination (844ms)
	✓   7 [system-chrome] › tests/company-intelligence-lab.spec.mjs:847:1 › Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request (287ms)
	✓   8 [system-chrome] › tests/company-intelligence-lab.spec.mjs:875:1 › Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers (471ms)
	✓   9 [system-chrome] › tests/company-intelligence-lab.spec.mjs:935:1 › Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result (11.2s)
	✓  10 [system-chrome] › tests/company-intelligence-lab.spec.mjs:957:1 › Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result (11.3s)
	✓  11 [system-chrome] › tests/company-intelligence-lab.spec.mjs:980:1 › Regression: BUG-025 an inside-bound response settles normally (3.5s)
	✓  12 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1013:1 › Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles (11.2s)
	✓  13 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1291:1 › Regression: BUG-025 late valid completion cannot overwrite a newer settled subject (996ms)
	✓  14 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1354:1 › four horizon regions render with four summaries and four deep-dive controls (438ms)
	✓  15 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1383:1 › Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction (425ms)
	✓  16 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1414:1 › an owned dimension renders a deep link whose target is a registered route (458ms)
	✓  17 [system-chrome] › tests/company-intelligence-lab.spec.mjs:1458:1 › every rendered numeric value carries a provenance chip, a source name and an as-of date (439ms)
--- omitted 20 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓  38 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2198:1 › Stabilize: the route writes only the shared data container and leaves a sibling tool cache intact (399ms)
	✓  39 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2225:1 › Stabilize: repeat composition of an unchanged subject issues no further request (643ms)
	✓  40 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2257:1 › Stabilize: the idle route runs no polling loop, no interval and no animation frame (4.8s)
	✓  41 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2295:1 › Stabilize: a version chain that points at itself terminates instead of looping (2.3s)
	✓  42 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2331:1 › Chaos: a background corpus paint does not close a deep dive the reader opened (5.5s)
	✓  43 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2367:1 › the route reaches its first paint from a file:// origin with no server and no off-origin request (321ms)
	✓  44 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2413:1 › the first paint composes with every data request still outstanding, then reconciles to the served registry (443ms)
	✓  45 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2484:1 › every interactive control on the route is reachable and operable from the keyboard alone (1.2s)
	✓  46 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2630:1 › Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read (1.5s)
	✓  47 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2669:1 › Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card (645ms)
	✓  48 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2718:1 › Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href (475ms)
	✓  49 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2763:1 › Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company (832ms)
	✓  50 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2783:1 › Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject (1.4s)
	✓  51 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2835:1 › Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it (424ms)
	✓  52 [system-chrome] › tests/company-intelligence-lab.spec.mjs:2923:1 › Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established (443ms)
	✓  53 [system-chrome] › tests/company-intelligence-lab.spec.mjs:3049:1 › Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel (345ms)
	✓  54 [system-chrome] › tests/company-intelligence-lab.spec.mjs:3071:1 › Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel (441ms)
	✓  55 [system-chrome] › tests/company-intelligence-lab.spec.mjs:3107:1 › Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel (378ms)

	55 passed (1.3m)
```

### Complete Company Intelligence Unit Carrier

**Phase:** test
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 SEC-001 corrected-harness unit 110 of 110" -- timeout 240 node --test --test-reporter=tap tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 SEC-001 corrected-harness unit 110 of 110
$ timeout 240 node --test --test-reporter=tap tests/company-intelligence.unit.mjs
exit: 0
lines: 671
sha256: 53349b7b0917623435e47ba2ac5d7c8a540d34db54477685230f987b4ac9be1e
--- first 20 ---
TAP version 13
# Subtest: coverage account holds one row per registry dimension and totals sum to the registry length
ok 1 - coverage account holds one row per registry dimension and totals sum to the registry length
	---
	duration_ms: 11.783977
	type: 'test'
	...
# Subtest: SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
ok 2 - SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary
	---
	duration_ms: 2.397106
	type: 'test'
	...
# Subtest: every one of the five evidence states is produced by a real adapter outcome
ok 3 - every one of the five evidence states is produced by a real adapter outcome
	---
	duration_ms: 4.059821
	type: 'test'
	...
# Subtest: a read aged past its window stays in the denominator as stale rather than becoming neutral
--- omitted 631 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 102 - 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
	---
	duration_ms: 1.184924
	type: 'test'
	...
# Subtest: 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
ok 103 - 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
	---
	duration_ms: 5.679568
	type: 'test'
	...
1..103
# tests 110
# suites 0
# pass 110
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 361.44559
```

### Repository Selftest

**Phase:** test
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 SEC-001 corrected-harness repository selftest" -- timeout 1200 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 SEC-001 corrected-harness repository selftest
$ timeout 1200 node scripts/selftest.mjs
exit: 0
lines: 3907
sha256: 037b9906c643f2f16cc454e6eb1393263a03e7a2532afa3d521a87ac5b371e2d
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3867 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (95 claim(s) across 72 packet(s), 81 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 95 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3438 passed, 0 failed
================================================
```

### Scenario, Regression, Reality, And Artifact Guards

**Phase:** test
**Claim Source:** executed

```text
# BUG-025 SEC-001 corrected-harness scenario resolver
$ timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .
exit: 0
lines: 1
sha256: 13944314bdad890eb9fcb00c3b5c158d924974438c8d6ad0e7c3ab3963e71d03
--- output ---
[scenario-test-resolve] OK — 8 reference(s) resolved via literal-scan; 8 category comparison(s) not applicable (no test-discovery adapter declared)

# BUG-025 SEC-001 corrected-harness regression quality
$ timeout 240 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 16
sha256: 55e9e873147798bca4d396921c526f284a366a98fc13493d693d6ef1c133cfa4
--- output ---
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: ~/research-lab
	Timestamp: 2026-08-31T22:39:02Z
	Bugfix mode: true
============================================================

ℹ️  Scanning tests/company-intelligence-lab.spec.mjs
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs

============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 1
	Files with adversarial signals: 1
============================================================

# BUG-025 SEC-001 corrected-harness implementation reality
$ timeout 240 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --verbose
exit: 0
lines: 35
sha256: 60c8105afc4a82376f1231e9392e091a2ab9058a625d89b13fe8fc1194986a84
--- output ---
ℹ️  INFO: Resolved 5 implementation file(s) to scan

--- Scan 1: Gateway/Backend Stub Patterns ---
--- Scan 1B: Handler / Endpoint Execution Depth ---
--- Scan 1C: Endpoint Not-Implemented / Placeholder Responses ---
--- Scan 1D: External Integration Authenticity ---
--- Scan 2: Frontend Hardcoded Data Patterns ---
--- Scan 2B: Sensitive Client Storage ---
--- Scan 3: Frontend API Call Absence ---
--- Scan 4: Prohibited Simulation Helpers in Production ---
--- Scan 5: Default/Fallback Value Patterns ---
--- Scan 6: Live-System Test Interception ---
--- Scan 7: IDOR / Auth Bypass Detection (Gate G047) ---
--- Scan 8: Silent Decode Failure Detection (Gate G048) ---

============================================================
	IMPLEMENTATION REALITY SCAN RESULT
============================================================

	Files scanned:  5
	Violations:     0
	Warnings:       0

🟢 PASSED: No source code reality violations detected

# BUG-025 SEC-001 corrected-harness artifact lint
$ timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- selected output from the captured 40-line stream ---
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ All checked DoD items in scopes.md have evidence blocks
Artifact lint PASSED.
```

### Finding And Route Accounting

| Finding or route | Disposition |
| --- | --- |
| `BUG-025-SEC-001-QUIESCENCE-HARNESS` | Addressed. The two aggregate checks now exclude only the total server-request-count equality. Every terminal-state and precise business-request discriminator remains active. |
| `BUG-025-SEC-001-IMPLEMENTATION` | Unresolved as an ownership record. The current production tree passes every requested test, but only `bubbles.implement` may formally close its production work. |
| `BUG-025-ROUTE-023` | Preserved pending to `bubbles.implement`. That owner must record production closure and route independent verification to `bubbles.security`. |

Scope 1 remains `In Progress`. All fifteen DoD items remain unchecked. Both status mirrors,
certification, completion arrays, lockdown state, acceptance records, and planning content remain
unchanged.

<a name="formal-implementation-closure-bug-025-sec-001-2026-09-01"></a>
## Formal Implementation Closure — BUG-025-SEC-001-IMPLEMENTATION — 2026-09-01

This is the implementation-owned closure record for the production repair already present in the
current tree. It does not close Scope 1 or certify the packet. The top-level authorized runner
executed the four long carriers below after the revision-9 repository binding and against the exact
bytes hashed in this section. This invocation did not replay those carriers and does not reconstruct
their omitted output.

### Exact Revision-9 Repository Binding

**Phase:** implement
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /tmp/research-lab-bug025-binding-packet.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:9 revision=9
```

The validated packet carried `controlRevision: 9`,
`controlPathDigest: sha256:7e982c9a1b25048dd68c8c758dbc39cdc603988bddfe07251568ed72f9d0becc`,
`authority: explicit-repository-root`, `transition: confirmed`, `scopeKind: command`,
`scopeId: null`, `targetKind: repository-root`, `pathVisibility: local`, and
`actionable: true`. No preflight ran and no control revision advanced.

### Current Production And Boundary Inspection

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** Direct source inspection found the planned closed event identity and terminal
refusal behavior in the current production files. The post-run hash snapshot below fixes the exact
bytes to which the inherited runner receipts apply.

- `readEventSource()` matches `subjectId` against the anchored company-suffix grammar, rejects a
	duplicate subject, derives the sole repository event path, requires strict declared-path equality,
	and reconstructs the normalized row from the accepted suffix and derived path.
- `eventsPathFor()` exposes only the validated normalized row.
- `paintFromEmbedded()` and the served branch in `boot()` validate local candidates before assigning
	route-visible `config` and `registry` state.
- `renderRefusal()` accepts only `standing-reading` or `route-terminal`. The terminal branch latches
	the refusal, invalidates older reading intent, clears and hides identity, hides both result
	surfaces, fixes readiness and unavailable coverage at `not-established`, writes fixed safe text,
	and reveals the existing alert without moving focus.
- `#subject-refusal` carries `role="alert"`, `aria-live="assertive"`, and `aria-atomic="true"`.
- The note states that event paths are exact subject-derived repository identities and that invalid
	embedded or served configuration reaches terminal `C025-CONFIG-SCHEMA` behavior.

### Current Git Object Hash Snapshot

**Phase:** implement
**Command:** `git hash-object` over the current implementation, test carriers, packet, and protected paths
**Exit Code:** 0
**Claim Source:** executed

```text
6793aadace2d64bb2209304a8a1f93da5ce9ea50  rlcompanyintel.js
ea7c70f21769153eb96939bd4906bba8f7bba448  company-intelligence-lab.html
7b8d6f574690186f35b6a299dd651f7774ec8a98  notes/company-intelligence-lab.md
45ba8208724d79b9544affc43d44dc65ff7395d5  tests/company-intelligence.unit.mjs
a3c0907492a83d375bc4f6bf606daaf8878d917a  tests/company-intelligence-lab.spec.mjs
946b4a0ae0aaa3dfe71a638aebcc23ebd035f595  scripts/selftest.mjs
5e4a03612e8789f5b12d82d234a8a0b04c0b99f9  company-intelligence.config.json
9885165252c8151312a47566a7a1761e25b05c32  data/company-intelligence/company-msft/events.json
5630ebd85683f6c20a817092d2aa103e8472cd18  specs/_bugs/BUG-025-company-corpus-read-never-settles/bug.md
b96b7f4629a9ced9912c98e1b127a4f1aa8d2899  specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md
f17e589fa3cd6bc03bb71adc3c050fa2d2ddb0bb  specs/_bugs/BUG-025-company-corpus-read-never-settles/design.md
7caac734df6eb06f9be95aa913ed4f0d0cf13b97  specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md
11ce0f0b1bbfbd3f3b118991c4892021b6c483ef  specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json
b8898f0ed64300719028c37b3e58c06c93b87f09  specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md
```

### Current Content SHA-256 Snapshot

**Phase:** implement
**Command:** `sha256sum` over the current implementation, test carriers, packet planning artifacts, and protected paths
**Exit Code:** 0
**Claim Source:** executed

```text
cafb9c69f16646a5e21f880f966a7a1974097e9a32df149cfeb151cf741301b7  rlcompanyintel.js
45ccdaa81ceec2b645e8203c63eab59b02fb7daace5cb1650e8b61691a1a76b8  company-intelligence-lab.html
8410619a0bdc45e5139c8fe5a809841e45c5dd03971af4a33586d80a0a5220f4  notes/company-intelligence-lab.md
402f3ba7eb0996c6849a1cb313d88034973bc0337151b23f253258d32c2341bd  tests/company-intelligence.unit.mjs
b027d0c6ab330e76067c2438fa37479c318d191ad2f59f384138419546e30a59  tests/company-intelligence-lab.spec.mjs
b816e1dc4d3a1a8d2292f8ca9041b2f299fb2e1511a21cded10ec8f31895bcce  scripts/selftest.mjs
937dffcc2c78cf29e77d280f93c39c0a38c057e3035f60966f8582f1f3d4dded  company-intelligence.config.json
2d03ea21025c8dfd4938d53d9cfe1d76f721add78e8f06e8cfc69a17b1a39af4  data/company-intelligence/company-msft/events.json
4004f960d240d1a86557e1fc5220d6d99909d28c089c1eeea78ef2c7de25a68d  specs/_bugs/BUG-025-company-corpus-read-never-settles/bug.md
37991d996e57a06857bb86fa9a3ad2c4512972a27599920dbfa8fa6833d1c89c  specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md
4226c6647e469b648e9293b7e85aa48e905f1f96e140f701e5d075f239cad021  specs/_bugs/BUG-025-company-corpus-read-never-settles/design.md
37857532f55a5c6185dc215a40958a754fa5605d37589e502673bd7ca90c5979  specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md
4b1450feb655d47a511f92321659a7c4e6925d4e86272c047cac66791fe63e2c  specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json
0d8d4480c584133ea21716d52b703fabaf78add4ec48903ba1823cca7bc7dc00  specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md
```

The committed configuration and event-data SHA-256 values equal the earlier protected-byte
boundary in this report. The current unit carrier still parses the complete inert JSON block and
requires deep equality with the committed configuration. This invocation did not change the
production, test, note, planning, acceptance, config, or event-data bytes in either snapshot.

### Current-Session Top-Level Runner Receipts

**Phase:** implement
**Execution Owner:** top-level authorized runner
**Claim Source:** executed

The following is the exact receipt metadata inherited from the current-session runner. No omitted
first, last, timing, or line-count output is invented here.

```text
receipt: Complete unit
command: timeout 240 node --test --test-reporter=tap tests/company-intelligence.unit.mjs
exit: 0
tests: 110
pass: 110
fail: 0
skip: 0
sha256: 1ce97889208483216f8b5756ce119452361a05a65f40a247f1be86f9c05c347c

receipt: Six security production/mutation browser cases
command: timeout 420 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep (Regression: BUG-025 (canonical company event path is requested once and exclusively|embedded backslash authority refuses before transport|served subject-path mismatch becomes terminal without continuation or focus theft)|Mutation control: BUG-025 (embedded equality-guard removal defeats named refusal discriminators|served equality-guard removal defeats named continuation discriminators|served route suppression removal defeats only named visibility discrimination)) --reporter=list
exit: 0
passed: 6
sha256: 508d84398e34498ef45d05515131fad046878bf9f61b5fe1952292cf1bff2b04

receipt: Complete Company Intelligence browser carrier
command: timeout 1260 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
passed: 55
sha256: 436230959ab65d24364eebd64befccd82b2f770b8f9b5822f035b61d438e8d85

receipt: Repository selftest
command: timeout 1260 node scripts/selftest.mjs
exit: 0
passed: 3438
failed: 0
sha256: 568bf9d1fd8313826fa5c5ac0e6adc072c468d2edb53e7627faaf1d369fb0cfb
```

### Fast Integrity Checks

**Phase:** implement
**Claim Source:** executed

```text
git-diff-check-exit=0
[scenario-test-resolve] OK — 8 reference(s) resolved via literal-scan; 8 category comparison(s) not applicable (no test-discovery adapter declared)
IMPLEMENTATION REALITY SCAN RESULT
Files scanned:  5
Violations:     0
Warnings:       0
PASSED: No source code reality violations detected
Artifact lint PASSED.
```

The mode resolver also resolved the persisted `bugfix-fastlane` packet through its documented
grandfather path with `statusCeiling: done`. The closure therefore does not violate a planning-only
mode ceiling.

### Post-Record Protected-Byte Recheck

**Phase:** implement
**Command:** compare each current `git hash-object` value with the pre-record Git object snapshot above
**Exit Code:** 0
**Claim Source:** executed

```text
OK 6793aadace2d64bb2209304a8a1f93da5ce9ea50 rlcompanyintel.js
OK ea7c70f21769153eb96939bd4906bba8f7bba448 company-intelligence-lab.html
OK 7b8d6f574690186f35b6a299dd651f7774ec8a98 notes/company-intelligence-lab.md
OK 45ba8208724d79b9544affc43d44dc65ff7395d5 tests/company-intelligence.unit.mjs
OK a3c0907492a83d375bc4f6bf606daaf8878d917a tests/company-intelligence-lab.spec.mjs
OK 946b4a0ae0aaa3dfe71a638aebcc23ebd035f595 scripts/selftest.mjs
OK 5e4a03612e8789f5b12d82d234a8a0b04c0b99f9 company-intelligence.config.json
OK 9885165252c8151312a47566a7a1761e25b05c32 data/company-intelligence/company-msft/events.json
OK 5630ebd85683f6c20a817092d2aa103e8472cd18 specs/_bugs/BUG-025-company-corpus-read-never-settles/bug.md
OK b96b7f4629a9ced9912c98e1b127a4f1aa8d2899 specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md
OK f17e589fa3cd6bc03bb71adc3c050fa2d2ddb0bb specs/_bugs/BUG-025-company-corpus-read-never-settles/design.md
OK 7caac734df6eb06f9be95aa913ed4f0d0cf13b97 specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md
OK 11ce0f0b1bbfbd3f3b118991c4892021b6c483ef specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json
OK b8898f0ed64300719028c37b3e58c06c93b87f09 specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md
```

### Finding And Route Accounting

| Finding or route | Disposition |
| --- | --- |
| `BUG-025-SEC-001-IMPLEMENTATION` | Addressed. Current production implements the planned subject-derived event identity and terminal configuration-refusal contract, and the current-session top-level receipts bind the complete carriers to the hash snapshot above. |
| `BUG-025-ROUTE-023` | Addressed. The implementation owner has formally recorded production closure without changing production or tests. |
| `BUG-025-SECURITY-REVERIFY` | Unresolved and routed to `bubbles.security` for independent security re-verification of the current hashes and security carriers. |

Scope 1 remains `In Progress`. All fifteen DoD items remain unchecked. Top-level status,
certification status, completion arrays, certified phase arrays, lockdown state, user validation,
and every planning artifact remain unchanged. The current execution phase is `implement` with
`route_required` disposition while independent security re-verification is outstanding.

<a name="security-reverification-bug-025-security-reverify-2026-09-01"></a>
## Independent Security Re-verification — BUG-025-SECURITY-REVERIFY — 2026-09-01

### Verdict

🔒 SECURE

The revision-9 implementation closes `BUG-025-SEC-001`. The production validator accepts the
one canonical MSFT pair and refuses every tested non-canonical declaration with exact
`C025-CONFIG-SCHEMA`. The three production browser scenarios and three in-memory mutations pass
over real ephemeral HTTP origins. No alternate raw `eventsPath` consumer, off-origin
continuation, unsafe rendering sink, rejected-payload disclosure, retry, fallback, or stale
post-refusal repaint was found.

This is a diagnostic security verdict, not final validation or certification. Scope 1, all
fifteen DoD items, both status mirrors, completion arrays, certified phase arrays, lockdown,
user validation, and `certification.*` remain unchanged and in progress.

### Exact Revision-9 Repository Binding

**Phase:** security
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-20072c8d3f74af455af2514e746fced3 --session-control-file /run/user/1000/bubbles/repository-binding/vscode-20072c8d3f74af455af2514e746fced3/repository-binding.json --packet-file /tmp/bug025-security-reverify-repository-packet.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-20072c8d3f74af455af2514e746fced3:9 revision=9
```

The packet carried the supplied `repositoryRoot`, `repositoryAlias`, `sessionId`, `decisionId`,
`controlRevision: 9`, `controlPathDigest`, authority, transition, command scope, local visibility,
and actionable state exactly. No preflight ran and the control revision did not advance. Two
initial invocations used unsupported individual field options and were rejected before any
repository-local read. The successful packet-file validation above occurred before the first
repository-local read.

### Formal-Closure Hash Epoch

**Phase:** security
**Claim Source:** executed

The pre-review epoch was `2026-09-01T04:17:05Z` at HEAD
`4c9f2e87b9738eece50c2f0f5b987046ee6ce7a8`. Every Git object id and every content SHA-256 below
matched the formal implementation closure before source inspection or substantive execution.

```text
6793aadace2d64bb2209304a8a1f93da5ce9ea50  rlcompanyintel.js
ea7c70f21769153eb96939bd4906bba8f7bba448  company-intelligence-lab.html
7b8d6f574690186f35b6a299dd651f7774ec8a98  notes/company-intelligence-lab.md
45ba8208724d79b9544affc43d44dc65ff7395d5  tests/company-intelligence.unit.mjs
a3c0907492a83d375bc4f6bf606daaf8878d917a  tests/company-intelligence-lab.spec.mjs
946b4a0ae0aaa3dfe71a638aebcc23ebd035f595  scripts/selftest.mjs
5e4a03612e8789f5b12d82d234a8a0b04c0b99f9  company-intelligence.config.json
9885165252c8151312a47566a7a1761e25b05c32  data/company-intelligence/company-msft/events.json
cafb9c69f16646a5e21f880f966a7a1974097e9a32df149cfeb151cf741301b7  rlcompanyintel.js
45ccdaa81ceec2b645e8203c63eab59b02fb7daace5cb1650e8b61691a1a76b8  company-intelligence-lab.html
8410619a0bdc45e5139c8fe5a809841e45c5dd03971af4a33586d80a0a5220f4  notes/company-intelligence-lab.md
402f3ba7eb0996c6849a1cb313d88034973bc0337151b23f253258d32c2341bd  tests/company-intelligence.unit.mjs
b027d0c6ab330e76067c2438fa37479c318d191ad2f59f384138419546e30a59  tests/company-intelligence-lab.spec.mjs
b816e1dc4d3a1a8d2292f8ca9041b2f299fb2e1511a21cded10ec8f31895bcce  scripts/selftest.mjs
937dffcc2c78cf29e77d280f93c39c0a38c057e3035f60966f8582f1f3d4dded  company-intelligence.config.json
2d03ea21025c8dfd4938d53d9cfe1d76f721add78e8f06e8cfc69a17b1a39af4  data/company-intelligence/company-msft/events.json
```

At `2026-09-01T04:25:08Z`, after the validator, browser, complete-unit, repository-selftest,
security-floor, PII, source-lock, regression-quality, reality, scenario, and packet checks, the
literal formal SHA-256 check returned:

```text
2026-09-01T04:25:08Z
4c9f2e87b9738eece50c2f0f5b987046ee6ce7a8
rlcompanyintel.js: OK
company-intelligence-lab.html: OK
notes/company-intelligence-lab.md: OK
tests/company-intelligence.unit.mjs: OK
tests/company-intelligence-lab.spec.mjs: OK
scripts/selftest.mjs: OK
company-intelligence.config.json: OK
data/company-intelligence/company-msft/events.json: OK
specs/_bugs/BUG-025-company-corpus-read-never-settles/bug.md: OK
specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md: OK
specs/_bugs/BUG-025-company-corpus-read-never-settles/design.md: OK
specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md: OK
specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json: OK
specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md: OK
```

No implementation, test, note, config, protected event-data, planning, or acceptance byte changed
during substantive security execution. No affected check required a second epoch.

### Production Validator Adversarial Matrix

**Phase:** security
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 security reverify adversarial path matrix" -- timeout 300 node --test --test-reporter=tap --test-name-pattern "BUG-025 security event declaration matrix rejects every non-canonical pair without rejecting the canonical pair" tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 security reverify adversarial path matrix
$ timeout 300 node --test --test-reporter=tap --test-name-pattern BUG-025 security event declaration matrix rejects every non-canonical pair without rejecting the canonical pair tests/company-intelligence.unit.mjs
exit: 0
lines: 59
sha256: 81a0ebe304cb0239ab08727d22170ad1675934e02b6b4f8e8de6901674e529f5
TAP version 13
# Subtest: BUG-025 security event declaration matrix rejects every non-canonical pair without rejecting the canonical pair
		# Subtest: accepted canonical pair remains exact and deeply frozen
		ok 1 - accepted canonical pair remains exact and deeply frozen
		# Subtest: normalized event authority is reconstructed instead of copied from the raw candidate
		ok 2 - normalized event authority is reconstructed instead of copied from the raw candidate
		# Subtest: subject grammar rejects every non-canonical prefix, suffix and hyphen form
		ok 3 - subject grammar rejects every non-canonical prefix, suffix and hyphen form
		# Subtest: one exact equality-guard mutation admits a named invalid probe without arbitrary runtime failure
		ok 7 - one exact equality-guard mutation admits a named invalid probe without arbitrary runtime failure
		1..7
ok 1 - BUG-025 security event declaration matrix rejects every non-canonical pair without rejecting the canonical pair
1..1
# tests 8
# suites 0
# pass 8
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 151.683434
```

**Claim Source:** interpreted
**Interpretation:** The executed parent imports `rlcompanyintel.js`. Its current source matrix
contains scheme, authority-shaped and protocol-relative forward-slash authority, leading slash,
backslash authority, current and parent traversal, encoded forward and backslash separators,
single- and double-encoded dot segments, query, fragment, control and whitespace, uppercase
subject and path, malformed suffixes, subject-to-path mismatch, arbitrary same-origin file, and
duplicate-subject probes. `assertConfigSchemaRefusals()` accepts a rejection only when its exact
error code is `C025-CONFIG-SCHEMA`. The canonical MSFT control and reconstructed frozen output
prevent a reject-all implementation from passing.

### Real-Origin Security Browser Scenarios And Mutations

**Phase:** security
**Command:** `timeout 480 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 security reverify six browser scenarios" -- timeout 420 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "(Regression: BUG-025 (canonical company event path is requested once and exclusively|embedded backslash authority refuses before transport|served subject-path mismatch becomes terminal without continuation or focus theft)|Mutation control: BUG-025 (embedded equality-guard removal defeats named refusal discriminators|served equality-guard removal defeats named continuation discriminators|served route suppression removal defeats only named visibility discrimination))" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 security reverify six browser scenarios
exit: 0
lines: 11
sha256: 1682a1eb6cb075bb4b68b998745ce4d0bacd2bba85fd496bb81ec9ffa52772f6

Running 6 tests using 1 worker

	✓  1 Regression: BUG-025 canonical company event path is requested once and exclusively
	✓  2 Regression: BUG-025 embedded backslash authority refuses before transport
	✓  3 Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft
	✓  4 Mutation control: BUG-025 embedded equality-guard removal defeats named refusal discriminators
	✓  5 Mutation control: BUG-025 served equality-guard removal defeats named continuation discriminators
	✓  6 Mutation control: BUG-025 served route suppression removal defeats only named visibility discrimination

	6 passed (10.0s)
```

**Claim Source:** interpreted
**Interpretation:** All six cases use `startWithheldStaticServer()` on `127.0.0.1` and serve
repository files or one exact in-memory route/module mutation. They do not intercept or fulfill a
business-data response. The production cases assert exact canonical request cardinality, zero
other event paths, zero off-origin traffic, terminal embedded and served refusal, fixed
`C025-CONFIG-SCHEMA` atomic-alert semantics, hidden identity and result surfaces, not-established
readiness, rejected-payload non-disclosure, initial-load no-focus-theft, served-refusal retained
input focus, zero corpus/event continuation, one served-config request, and no fallback, retry, or
later settled repaint. The three mutations require exact one-replacement preconditions and accept
only their named refusal, continuation, or visibility discriminator failures.

### Complete Unit And Repository Selftest

**Phase:** security
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 security reverify complete unit" -- timeout 300 node --test --test-reporter=tap tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 security reverify complete unit
exit: 0
lines: 671
sha256: 9089afd235cfc7b486f214102083ed2961c797ee66c6ec28a49ce1d07c40e785
TAP version 13
# Subtest: coverage account holds one row per registry dimension and totals sum to the registry length
ok 1 - coverage account holds one row per registry dimension and totals sum to the registry length
# Subtest: 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
ok 102 - 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
# Subtest: 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
ok 103 - 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
1..103
# tests 110
# suites 0
# pass 110
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 429.051622
```

**Phase:** security
**Command:** `timeout 1320 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 security reverify repository selftest" -- timeout 1260 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 security reverify repository selftest
exit: 0
lines: 3907
sha256: 447ff7176a8a554c101e26a3e8af6a43cab88cfbcee387fb73b96e4ec67f4f67
Step 1 security — escaped model sinks and CSP on every page
	✓ every shipped HTML page carries a Content-Security-Policy meta
	✓ CSP connect-src is an explicit origin allowlist, never wildcard https
	✓ production pages and shared runtime contain no open URL-forwarding relay chain
	✓ no model/config-authored field reaches innerHTML without esc()
	✓ the sink detector catches an unescaped model-authored title
================================================
Research-Lab self-test: 3438 passed, 0 failed
================================================
```

### Security And Governance Command Ledger

**Phase:** security
**Claim Source:** executed

| Check | Exact bounded command | Exit | Captured signal |
| --- | --- | ---: | --- |
| G034 mechanical floor | `timeout 300 bash .github/bubbles/scripts/security-gate.sh --repo-root /home/philipk/research-lab` | 0 | `sha256:9d217d4ac34caf617b9d87a6b08cc121ace3e910c256e10651dc1a4a6e12abf2`; 10,739 tracked files; zero findings. |
| Project PII scan | `timeout 300 node scripts/pii-scan.mjs` | 0 | `sha256:25e9b8db351244e71d072d7a1fd7c4d3e3d05c94884ee41d6a5f070276db6ab0`; 10,738 files; 2,549 messages; zero findings. |
| Dependency source lock | `timeout 300 node scripts/validate-node-source-lock.mjs` | 0 | `sha256:e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1`; exact Playwright 1.61.1 graph; sixteen adversarial sources rejected; zero unexpected acceptances. |
| Bugfix regression quality | `timeout 300 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs` | 0 | `sha256:7c6325dbdeb695c12da8651befeb3ef3a8c442659dd5ae1ce180fe738c571a15`; zero violations and warnings; adversarial signal detected. |
| Implementation reality | `timeout 360 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --verbose` | 0 | `sha256:60c8105afc4a82376f1231e9392e091a2ab9058a625d89b13fe8fc1194986a84`; five files; zero violations and warnings. |
| Scenario resolver | `timeout 300 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .` | 0 | `sha256:13944314bdad890eb9fcb00c3b5c158d924974438c8d6ad0e7c3ab3963e71d03`; eight references resolved. |
| Artifact lint before record | `timeout 360 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles` | 0 | `sha256:182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567`; packet passed at `in_progress`. |

```text
[security-gate] OK — 10739 tracked file(s), zero G034 findings
[pii-scan] files=10738 messages=2549 findings=0 OK
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files with adversarial signals: 1
IMPLEMENTATION REALITY SCAN RESULT
Files scanned:  5
Violations:     0
Warnings:       0
[scenario-test-resolve] OK — 8 reference(s) resolved via literal-scan; 8 category comparison(s) not applicable (no test-discovery adapter declared)
Artifact lint PASSED.
```

The repository registers no dependency-CVE audit command. This review therefore makes no broader
known-CVE claim. It records the required source-lock validation and the G034 scanner evidence
without substituting an invented package-audit command.

### Bypass And Trust-Boundary Inspection

**Phase:** security
**Claim Source:** interpreted
**Interpretation:** The table follows the complete current production module and route, complete
unit and browser carriers, product note, committed config, protected event file, relevant
repository-selftest group, and the exact repository-wide `eventsPathFor()` usage inventory read in
this invocation.

| Review target | Concrete current evidence | Result |
| --- | --- | --- |
| URL parsing, normalization, and decoding | `readEventSource()` uses an anchored subject regex, derives one ASCII repository path, and performs strict string inequality. Its bounded source region contains no `new URL`, `URL.parse`, URI decoder, path normalizer/resolver/join, or sanitizing replacement. | No bypass found. |
| Alternate event-path authority | Production `eventsPath` occurrences are the embedded declaration, `readEventSource()` validation/reconstruction, `eventsPathFor()`, and the route's one lookup. The repository-wide usage inventory found one production caller, `company-intelligence-lab.html::loadEvents()`, which passes the validated module-scope registry. | No raw declaration or second event-path authority found. |
| Direct transport sites | The production module contains no fetch. The route has exactly one `fetch()` call, inside `readRouteDocument()`, with `cache: "no-store"` and a fresh controller signal. Config, bars, events, plan, pointer, and version reads all reach it through declared helpers. | One bounded transport authority; no alternate direct fetch found. |
| CSP reliance | Canonical path derivation and reconstruction happen before transport. The accepted control and equality mutations show that behavior changes at the validator even though the page CSP remains unchanged. | CSP remains defense in depth, not the subject-to-path guard. |
| Unsafe DOM sinks | The production module and route contain no `innerHTML =`, `outerHTML =`, `insertAdjacentHTML`, `document.write`, `eval`, or `new Function`. Route text is created through `textContent`. | No unsafe sink found. |
| Error-detail leakage | `routeDocumentFailure()` retains internal path and classification metadata. Route-terminal `renderRefusal()` ignores the candidate error text, writes one fixed safe string through `textContent`, and exposes only `C025-CONFIG-SCHEMA`. Browser cases assert rejected-path absence from alert and visible body. | No rejected payload or parser/transport detail leaked. |
| Validation-before-assignment | Embedded and served documents remain locals until `INTEL.readCoverageRegistry()` returns. Only then do `config` and `registry` change. Invalid served validation throws before assignment and before `loadCorpus()`. | No invalid candidate enters shared route state. |
| Stale continuation | The terminal branch sets `routeConfigurationRefused`, increments `readingIntent`, hides results, and fixes body state. `setBodyState()`, rendering, subject application, each corpus stage, optional assignment, research loading, and served reconciliation all consult the latch; the final corpus paint also checks the intent. | No post-refusal continuation found. |
| Shared mutable state | `config` and `registry` commit only validated complete candidates. The refusal latch is monotonic. Request controller, timer, and expiry state are per invocation. `committedBodies` receives only code-constructed or validator-constructed paths and caches null after failure, so it does not retry automatically. | No shared invalid path or controller state found. |
| Retry, fallback, and hidden defaults | `readRouteDocument()` issues one request. `readBoundMs` is a required positive safe integer. The only embedded continuation is a transport-unavailable served-config result; schema, HTTP, parse, and version failures reach terminal refusal. | No retry, schema fallback, clamp, normalization, or hidden bound found. |
| Protected event data | The protected file remained at SHA-256 `2d03ea21025c8dfd4938d53d9cfe1d76f721add78e8f06e8cfc69a17b1a39af4`. The canonical browser control loaded its committed rows through the exact path once. | No protected-byte drift or substitute payload found. |

### Threat Matrix And Finding Closure

| Attack surface | Threat | OWASP | Disposition |
| --- | --- | --- | --- |
| Raw event subject/path declaration | Off-origin or unintended same-origin request through URL interpretation | A10, A04 | Mitigated and independently executed. Exact subject-derived equality plus reconstructed output closes `BUG-025-SEC-001`. |
| Embedded invalid configuration | Unauthorized transport or settled-looking output before served config | A04, A08 | Mitigated. Production browser case observes terminal named refusal and zero route-owned, invalid-path, and off-origin requests. |
| Served invalid configuration | Embedded fallback, stale visible results, corpus continuation, focus theft, or payload disclosure | A04, A08, A09 | Mitigated. Production browser case observes one fixed atomic alert, retained input focus, hidden result surfaces, no continuation, and no later settlement. |
| Validator or presentation regression | Positive tests stay green after owning guard disappears | A08 | Mitigated. Two equality mutations and one route-suppression mutation are killed by named discriminators without arbitrary runtime failure. |
| Dependency source | Unreviewed registry, range, integrity loss, lifecycle execution, or source fall-through | A06, A08 | No finding. The exact source-lock graph and sixteen adversarial source cases passed. |

| Finding or route | Disposition |
| --- | --- |
| `BUG-025-SECURITY-REVERIFY` | Addressed by this independent revision-9 source review, current-session execution set, and before/after hash proof. |
| `BUG-025-SEC-001` | Addressed. The original high-severity A10/A04 path-authority condition is absent from current production and is rejected by the executed matrix and real-browser carriers. |
| Other reviewed security categories | No finding. No implementation, test, planning, or acceptance remediation is required from this security pass. |
| `BUG-025-ROUTE-024` | Phase-chain route to final `bubbles.validate`. Validation remains responsible for any DoD, status, completion, or certification change. |

### Security Profile Closure

| Check | Result |
| --- | --- |
| SE1 — security coverage complete | Passed. Path authority, origin escape, validation ordering, rendering, focus, state latching, request ownership, CSP independence, retries/defaults, protected bytes, PII, and dependency source trust were reviewed. |
| SE2 — scanner evidence recorded | Passed. G034, PII, source-lock, regression-quality, implementation-reality, scenario, artifact, complete-unit, and repository-selftest commands executed with explicit bounds. |
| SE3 — findings grounded | Passed. Closure rests on the exact production/test bytes, executed adversarial matrix, executed real-origin browser scenarios, and concrete source paths. |
| SE4 — artifact record | Passed. Only this security-owned report section and state security records change. No foreign-owned source, test, planning, user-validation, DoD, status, or certification content changes. |

The security result is `completed_diagnostic`. The required final owner is `bubbles.validate`.

<a name="final-validate-phase-2026-09-01"></a>
## Final Validate Phase — 2026-09-01

### Outcome Contract Verification (G070)

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** This initial table establishes explicit traceability from the declared Outcome
Contract to the existing packet record. It does not treat prior receipts as this invocation's
execution evidence. Fresh validate-owned receipts and the final adjudication are recorded below.

| Field | Declared | Existing packet evidence | Current validation status |
| --- | --- | --- | --- |
| Intent | Every company corpus read must terminate without allowing configuration to redirect an event read away from its declared repository document. | The security re-verification section records the bounded acquisition and canonical event-identity paths. | Under independent replay |
| Success Signal | Bounded reads settle through existing outcomes. The canonical MSFT event declaration remains valid. Every other subject-to-path shape fails with `C025-CONFIG-SCHEMA` before it can authorize a document request. | The security adversarial matrix and real-origin browser scenario sections record the exact observable signals. | Under independent replay |
| Hard Constraints | Cache-first first paint; one closed subject-to-path mapping; named invalid-config refusal; no fallback, normalization, retry, external fetch, CSP reliance, or new success path. | The current spec, design, scenario manifest, and security trust-boundary inspection define the constraints and their carriers. | Under independent replay |
| Failure Condition | A read remains pending without a product-owned bound, or a malformed, mismatched, or non-canonical event declaration reaches transport. | The bounded-read and invalid-config browser carriers are the declared failure discriminators. | Under independent replay |

<a name="final-tree-test-phase-2026-09-01"></a>
## Fresh Final-Tree Test Phase — 2026-09-01

This section records a new `bubbles.test` execution epoch over the current BUG-025 source and
persistent carriers. It does not reuse an earlier report receipt. It does not check a DoD item,
change Scope 1, certify a phase, or promote either status mirror. Final per-item adjudication stays
with `bubbles.validate` under pending route `BUG-025-ROUTE-024`.

### Exact Current Repository Binding

**Phase:** test
**Command:** `cd /home/philipk/research-lab && timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-7ba6dae9325d2fc0ab03ebdac1666fe9 --session-control-file /home/philipk/.local/state/bubbles/repository-binding/vscode-7ba6dae9325d2fc0ab03ebdac1666fe9/repository-binding.json --packet-file /tmp/research-lab-bug025-repository-binding-packet.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-7ba6dae9325d2fc0ab03ebdac1666fe9:3 revision=3
```

The successful packet-file validation used the supplied local control file and exact actionable
packet before the first repository read. No repository-binding preflight ran.

### Final-Tree Epoch And Protected Bytes

**Phase:** test
**Command:** `timeout 60 date -u '+%Y-%m-%dT%H:%M:%SZ' && timeout 60 git rev-parse HEAD && timeout 60 sha256sum rlcompanyintel.js company-intelligence-lab.html notes/company-intelligence-lab.md tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs company-intelligence.config.json data/company-intelligence/company-msft/events.json specs/_bugs/BUG-025-company-corpus-read-never-settles/bug.md specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md specs/_bugs/BUG-025-company-corpus-read-never-settles/design.md specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md`
**Exit Code:** 0
**Claim Source:** executed

```text
2026-09-01T05:31:05Z
4c9f2e87b9738eece50c2f0f5b987046ee6ce7a8
cafb9c69f16646a5e21f880f966a7a1974097e9a32df149cfeb151cf741301b7  rlcompanyintel.js
45ccdaa81ceec2b645e8203c63eab59b02fb7daace5cb1650e8b61691a1a76b8  company-intelligence-lab.html
8410619a0bdc45e5139c8fe5a809841e45c5dd03971af4a33586d80a0a5220f4  notes/company-intelligence-lab.md
402f3ba7eb0996c6849a1cb313d88034973bc0337151b23f253258d32c2341bd  tests/company-intelligence.unit.mjs
b027d0c6ab330e76067c2438fa37479c318d191ad2f59f384138419546e30a59  tests/company-intelligence-lab.spec.mjs
b816e1dc4d3a1a8d2292f8ca9041b2f299fb2e1511a21cded10ec8f31895bcce  scripts/selftest.mjs
937dffcc2c78cf29e77d280f93c39c0a38c057e3035f60966f8582f1f3d4dded  company-intelligence.config.json
2d03ea21025c8dfd4938d53d9cfe1d76f721add78e8f06e8cfc69a17b1a39af4  data/company-intelligence/company-msft/events.json
4004f960d240d1a86557e1fc5220d6d99909d28c089c1eeea78ef2c7de25a68d  specs/_bugs/BUG-025-company-corpus-read-never-settles/bug.md
37991d996e57a06857bb86fa9a3ad2c4512972a27599920dbfa8fa6833d1c89c  specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md
4226c6647e469b648e9293b7e85aa48e905f1f96e140f701e5d075f239cad021  specs/_bugs/BUG-025-company-corpus-read-never-settles/design.md
37857532f55a5c6185dc215a40958a754fa5605d37589e502673bd7ca90c5979  specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md
4b1450feb655d47a511f92321659a7c4e6925d4e86272c047cac66791fe63e2c  specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json
0d8d4480c584133ea21716d52b703fabaf78add4ec48903ba1823cca7bc7dc00  specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md
```

The same command after all substantive execution at `2026-09-01T05:37:53Z` emitted the same HEAD
and the same fourteen content hashes. `git diff --check` exited zero before and after execution.

### Browser Runner Identity

**Phase:** test
**Command:** `timeout 60 npx --no-install playwright --version`
**Exit Code:** 0
**Claim Source:** executed

```text
Version 1.61.1
```

### Complete 110-Test Company Intelligence Unit Carrier

**Phase:** test
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 final-tree complete Company Intelligence unit" -- timeout 300 node --test --test-reporter=tap tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 final-tree complete Company Intelligence unit
$ timeout 300 node --test --test-reporter=tap tests/company-intelligence.unit.mjs
exit: 0
lines: 671
sha256: 91c84dcf6d309308ddcb9f02f05e90009e23ff5242b95b8a5b3ee674902cbf5d
--- first 20 ---
TAP version 13
# Subtest: coverage account holds one row per registry dimension and totals sum to the registry length
ok 1 - coverage account holds one row per registry dimension and totals sum to the registry length
--- omitted 631 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 102 - 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
# Subtest: 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
ok 103 - 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
1..103
# tests 110
# suites 0
# pass 110
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 340.489501
```

### Focused Security Unit Matrix

**Phase:** test
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 final-tree focused security unit matrix" -- timeout 300 node --test --test-reporter=tap --test-name-pattern "BUG-025 security event declaration matrix rejects every non-canonical pair without rejecting the canonical pair" tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 final-tree focused security unit matrix
exit: 0
lines: 59
sha256: cddaf600c19dc1bb36630972b8631bd0fe2bd1f4cada1aba61b42f21fe89889d
TAP version 13
# Subtest: BUG-025 security event declaration matrix rejects every non-canonical pair without rejecting the canonical pair
	ok 1 - accepted canonical pair remains exact and deeply frozen
	ok 2 - normalized event authority is reconstructed instead of copied from the raw candidate
	ok 3 - subject grammar rejects every non-canonical prefix, suffix and hyphen form
	ok 7 - one exact equality-guard mutation admits a named invalid probe without arbitrary runtime failure
	1..7
ok 1 - BUG-025 security event declaration matrix rejects every non-canonical pair without rejecting the canonical pair
1..1
# tests 8
# suites 0
# pass 8
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 110.029265
```

### Focused Eight-Scenario And Three-Mutation Browser Selection

**Phase:** test
**Command:** `timeout 900 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 final-tree focused eight-scenario and mutation browser selection" -- timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 final-tree focused eight-scenario and mutation browser selection
exit: 0
lines: 18
sha256: 5aae7743a99a96b98ccbef902ee60ab941e3dfe5458e38cf193d3d8b03c7fa38
Running 13 tests using 1 worker
✓  1 Regression: BUG-025 canonical company event path is requested once and exclusively
✓  2 Regression: BUG-025 embedded backslash authority refuses before transport
✓  3 Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft
✓  4 Mutation control: BUG-025 embedded equality-guard removal defeats named refusal discriminators
✓  5 Mutation control: BUG-025 served equality-guard removal defeats named continuation discriminators
✓  6 Mutation control: BUG-025 served route suppression removal defeats only named visibility discrimination
✓  7 Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request
✓  8 Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers
✓  9 Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result
✓ 10 Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result
✓ 11 Regression: BUG-025 an inside-bound response settles normally
✓ 12 Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles
✓ 13 Regression: BUG-025 late valid completion cannot overwrite a newer settled subject
13 passed (46.2s)
```

### Complete 55-Test Company Intelligence Browser File

**Phase:** test
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 final-tree complete Company Intelligence browser file" -- timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 final-tree complete Company Intelligence browser file
$ timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 60
sha256: e7d600ae7186fe3bc066bc2bd192eccb7232e87cabf593bbb170b414251677a8
--- first 20 ---
Running 55 tests using 1 worker
✓   1 Regression: BUG-025 canonical company event path is requested once and exclusively
✓   2 Regression: BUG-025 embedded backslash authority refuses before transport
✓   3 Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft
✓   4 Mutation control: BUG-025 embedded equality-guard removal defeats named refusal discriminators
✓   5 Mutation control: BUG-025 served equality-guard removal defeats named continuation discriminators
✓   6 Mutation control: BUG-025 served route suppression removal defeats only named visibility discrimination
✓   7 Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request
✓   8 Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers
✓   9 Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result
✓  10 Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result
✓  11 Regression: BUG-025 an inside-bound response settles normally
✓  12 Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles
✓  13 Regression: BUG-025 late valid completion cannot overwrite a newer settled subject
--- omitted 20 line(s); sha256 above covers the full output ---
--- last 20 ---
✓  43 the route reaches its first paint from a file:// origin with no server and no off-origin request
✓  44 the first paint composes with every data request still outstanding, then reconciles to the served registry
✓  45 every interactive control on the route is reachable and operable from the keyboard alone
✓  46 Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read
✓  47 Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card
✓  48 Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href
✓  49 Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company
✓  50 Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject
✓  51 Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it
✓  52 Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established
✓  53 Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel
✓  54 Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel
✓  55 Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel
55 passed (1.4m)
```

### Canonical Repository Selftest

**Phase:** test
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 final-tree canonical repository selftest" -- timeout 1200 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 final-tree canonical repository selftest
$ timeout 1200 node scripts/selftest.mjs
exit: 0
lines: 3907
sha256: 0f2424b345db51c60e7ed1a88bea42fb1809d8f06ce26a09cf38716a64710a21
--- first 20 ---
Step 1 security — escaped model sinks and CSP on every page
✓ every shipped HTML page carries a Content-Security-Policy meta
✓ all pages use one identical CSP instead of drifting per page
✓ CSP keeps the single-file inline-script design while defaulting to self
✓ CSP blocks object, base-tag, and form exfiltration paths
✓ CSP connect-src is an explicit origin allowlist, never wildcard https
✓ production pages and shared runtime contain no open URL-forwarding relay chain
✓ no model/config-authored field reaches innerHTML without esc()
--- omitted 3867 line(s); sha256 above covers the full output ---
--- last 20 ---
✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (95 claim(s) across 72 packet(s), 81 agreeing, baseline 14 entries)
✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline (0 new, 14 frozen, 0 stale of 95 claim(s))
================================================
Research-Lab self-test: 3438 passed, 0 failed
================================================
```

### Scenario, Regression-Quality, Reality, And Packet Guards

**Phase:** test
**Claim Source:** executed

```text
# eight-link scenario resolver
$ timeout 300 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .
exit: 0
lines: 1
sha256: 13944314bdad890eb9fcb00c3b5c158d924974438c8d6ad0e7c3ab3963e71d03
[scenario-test-resolve] OK — 8 reference(s) resolved via literal-scan; 8 category comparison(s) not applicable (no test-discovery adapter declared)

# bugfix regression-quality guard
$ timeout 300 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs
exit: 0
lines: 16
sha256: 6e6465cae34bf24ff58ece9c6c6d04ff73d765c05f819f156c1e4c76d812a841
✅ Asserts the current surface in tests/company-intelligence-lab.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/company-intelligence-lab.spec.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1

# implementation-reality scan
$ timeout 360 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --verbose
exit: 0
lines: 35
sha256: 60c8105afc4a82376f1231e9392e091a2ab9058a625d89b13fe8fc1194986a84
IMPLEMENTATION REALITY SCAN RESULT
Files scanned:  5
Violations:     0
Warnings:       0
🟢 PASSED: No source code reality violations detected

# artifact lint before test record
$ timeout 360 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ All checked DoD items in scopes.md have evidence blocks
Artifact lint PASSED.
```

### No-Interception, Skip, And Bailout Scans

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** The interception inventory places all selected BUG-025 declarations at lines
757 through 1013 and 1291. The first pass-through `page.route()` helper begins at line 1039 and is
called only at lines 2855, 2944, 3052, and 3074. The other pass-through route begins at line 2430.
No `route.fulfill()`, `route.abort()`, or `context.route()` occurs. The selected carriers use the
real ephemeral HTTP server, except the planned synchronous setup boundary which wraps native
`fetch()` and delegates every non-selected path. The canonical regression guard independently
accepted the mixed-inspection provenance and adversarial mechanism.

```text
757:Regression: BUG-025 canonical company event path is requested once and exclusively
789:Regression: BUG-025 embedded backslash authority refuses before transport
800:Regression: BUG-025 served subject-path mismatch becomes terminal without continuation or focus theft
811:Mutation control: BUG-025 embedded equality-guard removal defeats named refusal discriminators
822:Mutation control: BUG-025 served equality-guard removal defeats named continuation discriminators
835:Mutation control: BUG-025 served route suppression removal defeats only named visibility discrimination
847:Regression: BUG-025 an invalid embedded read bound refuses before any route-owned request
875:Regression: BUG-025 synchronous fetch setup failure reaches existing unavailable state with zero timers
935:Regression: BUG-025 a never-answering corpus request reaches a bounded unavailable result
957:Regression: BUG-025 a never-answering optional document reaches a bounded unavailable result
980:Regression: BUG-025 an inside-bound response settles normally
1013:Regression: BUG-025 a stalled served configuration preserves embedded first paint and settles
1039:async function installCorpusRequestGate(page) {
1044:    await page.route('**/data/**', async (route) => {
1047:        try { await route.continue(); } catch { /* page or context already closing */ }
1291:Regression: BUG-025 late valid completion cannot overwrite a newer settled subject
2430:    await page.route('**/*', async (route, request) => {
2855:    const corpusGate = await installCorpusRequestGate(page);
2944:    const corpusGate = await installCorpusRequestGate(page);
3052:    const corpusGate = await installCorpusRequestGate(page);
3074:    const corpusGate = await installCorpusRequestGate(page);
interception_inventory_exit=0
forbidden_response_substitution_grep_exit=1 (1 means zero matches)
BUG-025 skip-marker grep exit=1 (1 means zero matches)
BUG-025 failure-condition bailout grep exit=1 (1 means zero matches)
```

### Change Boundary And Sibling Dirty-Path Preservation

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** Pre- and post-test protected-path SHA-256 and Git object values are identical.
The exact sibling command expanded to 47 files in `README.md`, `docs/DomainModel.md`, the test-file
reachability baseline, Spec 007 scope artifacts, parent Spec 008 BUG-007, BUG-002 user validation,
BUG-026, and BUG-027. Both bounded captures produced the same full-output hash. The pre- and
post-test status inventories also contained the same modified and untracked path set. This phase
changed none of those files and changed no production, persistent test, note, config, event-data,
planning, acceptance, or framework-managed byte.

```text
# sibling dirty-path baseline
exit: 0
lines: 47
sha256: afbefede6f38011c114d13a8cdca1f5c79b05a12359d13889e161a482abd7334

# sibling dirty-path post-test replay
exit: 0
lines: 47
sha256: afbefede6f38011c114d13a8cdca1f5c79b05a12359d13889e161a482abd7334

post-test UTC: 2026-09-01T05:37:53Z
post-test HEAD: 4c9f2e87b9738eece50c2f0f5b987046ee6ce7a8
git diff --check exit: 0
protected content hashes changed: 0
protected Git object hashes changed: 0
sibling dirty-path aggregate changed: no
```

### Fifteen-Item Validate Handoff Map

The table maps every still-unchecked planning-owned DoD item to this phase's fresh evidence. It is
an evidence handoff, not a checkbox or certification decision.

| DoD item | Fresh test evidence |
| ---: | --- |
| 1 | The 110-test unit carrier and its required/invalid bound cases exited zero. |
| 2 | The 110-test structural fetch-ownership case and focused browser abort/timer cases exited zero. |
| 3 | Focused case 12 proves stalled served configuration settlement and no retry. |
| 4 | Focused cases 9 and 10 prove no-header and partial-body abort settlement. |
| 5 | Focused case 11 proves inside-bound response use and cache-first first paint. |
| 6 | Focused case 8 proves synchronous setup failure classification, zero selected-path request, and timer cleanup. |
| 7 | Focused case 13 and its in-test mutation prove stale intent cannot repaint or republish. |
| 8 | The eight-test focused security unit matrix and complete 110-test carrier exited zero. |
| 9 | Focused browser case 1 proves canonical MSFT event-path exclusivity and loaded output. |
| 10 | Focused browser cases 2 and 4 prove embedded backslash refusal and kill the equality mutation. |
| 11 | Focused browser cases 3, 5, and 6 prove served mismatch terminality and kill both owning mutations. |
| 12 | The 3438-check repository selftest and focused security unit matrix exited zero. |
| 13 | The complete 55-test Company Intelligence browser file exited zero. |
| 14 | The complete 110-test unit carrier and 3438-check repository selftest exited zero. |
| 15 | Fourteen protected-path hashes, Git object ids, sibling aggregate hash, status inventory, and diff check remained unchanged across execution. |

### Test Profile And Handoff Accounting

| Check | Result |
| --- | --- |
| T1 required test types | Executed `unit`, live `e2e-ui`, and repository `functional` carriers declared by Scope 1. |
| T2 red-to-green trace | The current phase changed no behavior. The packet retains its earlier scenario-first RED history; this phase contributes only fresh final-tree GREEN evidence. |
| T3 live-stack integrity | The selected browser tests use real ephemeral HTTP origins. Direct scans found no response fulfillment or abort substitution in the carrier. |
| T4 persistent regression | Eight linked scenarios resolve to persistent titles, and all three security mutations execute in the focused selection. |
| T5 evidence | Every requested command executed in this session with an explicit timeout and captured output or an explicit no-match exit. |
| T6 trace and SLO | Not applicable: the project config declares no `traceContracts`, and Scope 1 declares no `observabilityWorkflow`. |

| Finding or route | Disposition |
| --- | --- |
| `BUG-025-FINAL-TREE-TEST` | Addressed by the current 110-unit, 13-focused-browser, 55-complete-browser, 3438-selftest, resolver, regression-quality, reality, packet, scan, and byte-boundary receipts. |
| `BUG-025-ROUTE-024` | Remains pending for `bubbles.validate`. That owner alone adjudicates the fifteen DoD items, Scope 1, top-level and certification status, completion arrays, certified phases, and lockdown. |

Test verdict: `TESTED`. Scope 1 and all fifteen DoD items remain unchanged and in progress. No
certification or status promotion is asserted by this phase.

### Post-Record Current-Tree Checks

**Phase:** test
**Claim Source:** executed

```text
# execution-substate guard
$ timeout 60 bash .github/bubbles/scripts/execution-substate-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
sha256: 9e6fc5702263555f9de3ca0e264df52d9372f597ab54b0967dd815dbd396d4c7
[execution-substate-guard] OK — execution substate (if any) is valid and distinct from certification in specs/_bugs/BUG-025-company-corpus-read-never-settles.

# canonical repository selftest after test-owned report and state recording
$ timeout 1200 node scripts/selftest.mjs
exit: 0
lines: 3907
sha256: fbbe4fb30650e32d4415695cbdd4de28fc7135cef2583aeb429db72e15dab655
Research-Lab self-test: 3438 passed, 0 failed

# artifact lint after test-owned report and state recording
$ timeout 360 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ All checked DoD items in scopes.md have evidence blocks
Artifact lint PASSED.
```

<a name="final-validate-adjudication-2026-09-01"></a>
## Final Validate Adjudication — 2026-09-01

### Repository Binding And Transition Contract

**Phase:** validate
**Claim Source:** executed

```text
$ timeout 60 /home/philipk/bubbles/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-7ba6dae9325d2fc0ab03ebdac1666fe9 --session-control-file /home/philipk/.local/state/bubbles/repository-binding/vscode-7ba6dae9325d2fc0ab03ebdac1666fe9/repository-binding.json --packet-file /tmp/research-lab-bug025-validate-binding-packet.json
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-7ba6dae9325d2fc0ab03ebdac1666fe9:3 revision=3
$ timeout 300 bash .github/bubbles/scripts/goal-fidelity-guard.sh --boundary pre-certification --session-file .specify/memory/bubbles.session.json --spec-dir specs/_bugs/BUG-025-company-corpus-read-never-settles
goal-fidelity-guard: PASS boundary=pre-certification
$ timeout 60 bash .github/bubbles/scripts/transition-contract-resolver.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
workflowMode=bugfix-fastlane
auditProfile=delivery-completion-v1
statusCeiling=done
targetStatus=done
currentStatus=in_progress
phaseOrder=select,bootstrap,implement,test,regression,simplify,gaps,harden,stabilize,devops,security,validate,audit,finalize
contractDigest=sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision=sha256:33d32d3cbf7daf4bc7a489b4478c4701090dab601a541eb64c72c0e89686bf42
```

The resolver requires `audit` and `finalize` after `validate`. This adjudication therefore cannot
set either status mirror to `done`, even if every delivery row were earned.

### Outcome Contract Verification (G070)

**Claim Source:** interpreted
**Interpretation:** The current production and persistent carriers were read directly. Their
current SHA-256 values match the immutable final-tree epoch at
`report.md#final-tree-test-phase-2026-09-01`. The admitted test receipts are test-owned executions,
not validate-owned reruns.

| Field | Current evidence | Status |
| --- | --- | --- |
| Intent | The one bounded transport helper covers configuration, bar, and optional-document reads; the event validator derives one exact repository path from the accepted company subject. | PASS |
| Success Signal | The fresh 13-case BUG-025 browser selection records bounded settlement, canonical MSFT loading, and terminal invalid-declaration refusal; the focused eight-test validator matrix records exact canonical acceptance and non-canonical rejection. | PASS |
| Hard Constraints | The source keeps embedded first paint, exact subject-to-path equality, terminal named refusal, one request authority, no retry, and stale-intent protection. The focused browser mutations fail their named guards. | PASS |
| Failure Condition | The fresh never-answering cases settle after abort, and the embedded and served invalid-declaration cases reach no unauthorized transport or continuation. | PASS |

### Fifteen-Row DoD Adjudication

Each row was judged against its exact text. `EARNED` means the current source plus the admitted
fresh execution receipt demonstrates the row. It does not alter the planning-owned checkbox.

| Row | Adjudication | Exact basis |
| ---: | --- | --- |
| 1 | EARNED | The current v2 config carries positive `readBoundMs: 10000`; the unit carrier covers accepted, absent, zero, negative, fractional, string, non-finite, and unsafe values; the design records the measured bound rationale. |
| 2 | EARNED | The route contains one `fetch()` site inside `readRouteDocument()`, gives it a fresh abort signal, and routes configuration, bar, and optional-document reads through that helper. The 110-test unit carrier and focused abort cases passed. |
| 3 | EARNED | Focused browser case 12 preserves embedded first paint, aborts the stalled served config, retains the embedded registry, settles corpus reconciliation, and records one request with no retry. |
| 4 | EARNED | Focused cases 9 and 10 cover no-header and partial-body stalls. Both observe underlying abort, established named unavailability, one request, and zero remaining helper timers. |
| 5 | EARNED | Focused case 11 records embedded first paint before release, then loaded settlement inside the bound without abort classification, with one request and full timer cleanup. |
| 6 | EARNED | Focused case 8 injects one synchronous selected-path setup throw, observes the existing unavailable caller result, zero selected-path server requests, one attempt, and zero active helper timers. |
| 7 | EARNED | Focused case 13 holds a real MSFT response, settles and publishes AAPL, releases MSFT, and preserves the AAPL visible, readiness, horizon, DOM-node, and tool-read state. Its one-guard mutation triggers only named repaint and publication discriminators. |
| 8 | EARNED | The focused eight-test unit matrix accepts and freezes the canonical pair, reconstructs authority, rejects the complete invalid matrix with exact schema refusal, excludes alternate URL mechanisms, rejects duplicates, and kills the equality-guard mutation. |
| 9 | EARNED | Focused browser case 1 reaches composed established MSFT output, renders the committed event row, requests only the canonical event path once, and records no off-origin request. |
| 10 | EARNED | Focused browser cases 2 and 4 prove embedded backslash refusal before route transport, hidden result and identity surfaces, not-established readiness, one safe atomic alert, no payload disclosure or focus theft, and a discriminating equality mutation. |
| 11 | EARNED | Focused browser cases 3, 5, and 6 prove served mismatch terminality, unchanged embedded source, hidden settled surfaces, retained input focus, zero continuation, no later settlement, and discriminating equality and suppression mutations. |
| 12 | NOT EARNED | The repository selftest passes, but its complete Feature 025 block does not contain the required event-security functional assertions. It checks the v2 bound and earlier Feature 025 contracts only. The unit matrix proves the security behavior, but it cannot substitute for the row's explicitly required `scripts/selftest.mjs` security contract carrier. |
| 13 | EARNED | The complete Company Intelligence browser file reported 55 passed with zero failures, skips, cancellations, or todos. |
| 14 | EARNED | The complete unit carrier reported 110 passed and the canonical repository selftest reported 3438 passed, both with zero failures. |
| 15 | EARNED | The final-tree phase recorded identical pre/post hashes for all protected paths and the 47-path sibling aggregate, unchanged dirty-path inventory, zero protected object changes, and a clean diff check. The validate read-back reproduced every listed source, test, config, data, planning, and acceptance hash. |

### Blocking Functional-Carrier Finding

**Finding:** `BUG-025-VALIDATE-SELFTEST-001`

**Phase:** validate
**Command:** `timeout 60 grep -nE 'eventSource|coveredSubjects|eventsPath|readEventSource|eventsPathFor|company:msft|company-aapl' scripts/selftest.mjs; event_status=$?; printf 'event_security_contract_search_exit=%s (1 means zero matches)\n' "$event_status"; timeout 60 grep -nE 'Feature 025 company multi-horizon intelligence|config25\.contractVersion|config25\.readBoundMs|registry25\.readBoundMs|C025-REGISTRY-INCOMPLETE|TP-025-0[1-9]' scripts/selftest.mjs; feature_status=$?; printf 'feature_025_baseline_search_exit=%s\n' "$feature_status"; [[ "$event_status" -eq 1 && "$feature_status" -eq 0 ]]`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The first search covers the concrete event-contract identifiers needed to
express canonical path derivation, duplicate event-subject refusal, and event-path mechanism
checks. It found none. The second search enumerates the actual Feature 025 selftest group, which
contains the pre-existing TP-025-01 through TP-025-09 baseline and the v2 bound addition.

```text
event_security_contract_search_exit=1 (1 means zero matches)
23192:  group('Feature 025 company multi-horizon intelligence');
23236:  /* TP-025-01: the coverage floor is complete and closed. */
23240:    && config25.contractVersion === 'company-intelligence-config/v2'
23241:    && config25.readBoundMs === 10000
23242:    && registry25.readBoundMs === config25.readBoundMs
23244:  'TP-025-01: the committed coverage registry declares the v2 read bound, exactly the fifteen mandatory dimensions and four horizons');
23256:  assert(incompleteCode25 === 'C025-REGISTRY-INCOMPLETE',
23257:    'TP-025-02: removing a mandatory dimension from the registry raises C025-REGISTRY-INCOMPLETE instead of composing a shorter floor');
23315:  'TP-025-03: every run accounts for all fifteen dimensions, the totals sum to the registry length, and every non-current row names a closed reason code');
23317:  /* TP-025-04: horizon isolation. A shorter-horizon read is ABSENT from a longer horizon's set. */
23330:  'TP-025-04: adding a tactical read that would flip the direction leaves the structural horizon byte-identical, and the same read does reach the immediate horizon');
23332:  /* TP-025-05: determinism over one frozen bundle and one explicit decisionTime. */
23339:  'TP-025-05: two runs over one frozen bundle and one decisionTime produce identical canonical output and one identical fingerprint, and the module reads no clock or random source');
23341:  /* TP-025-06: publication is verified by read-back, and a lossy store is refused. */
23354:  /* TP-025-07: tickers only, forever. */
23364:  /* TP-025-08: every exported function has a production consumer inside the route. */
23393:  'TP-025-09: the company-intelligence route, module and config appear in none of tools.json, the index or the navigation');
feature_025_baseline_search_exit=0
```

The exact owner is `bubbles.test`. The missing carrier belongs in the existing Feature 025 group
of `scripts/selftest.mjs`. It must exercise canonical event-path derivation, duplicate subject
refusal, committed-to-embedded object parity, forbidden mechanism absence, and protected-surface
drift discrimination, then execute the repository selftest on the resulting bytes.

### Certification Reconciliation

No certification promotion is truthful in this tree. Scope 1 retains fifteen unchecked rows and
`In Progress`. Both status mirrors remain `in_progress`; `certification.completedScopes` and
`certification.certifiedCompletedPhases` remain empty; `certification.scopeProgress` remains
0 checked and 15 unchecked; lockdown remains `unlocked`. `BUG-025-ROUTE-024` remains pending
because final validation did not clear row 12. Audit and finalize are not claimed or routed.

Only `scenario-manifest.json` evidence links were reconciled to the fresh final-tree test anchor.
No product, test, protected, sibling, scope, acceptance, execution-state, or certification byte
was changed by this adjudication.

### Ownership Routing

| Finding | Required owner | Required closure | Re-validation |
| --- | --- | --- | --- |
| `BUG-025-VALIDATE-SELFTEST-001` | `bubbles.test` | Add the missing persistent functional assertions to the existing Feature 025 selftest group and execute the repository selftest on those bytes. | Re-adjudicate row 12, then run the narrow packet lint and transition guard. |
| `BUG-025-VALIDATE-PLAN-001` | `bubbles.plan` | Reconcile the existing scenario-specific regression and Change Boundary DoD language with the canonical guard-recognized shape without weakening any behavior or boundary. | Re-run artifact lint and the registry-asserted transition guard. |
| `BUG-025-VALIDATE-SCENARIO-STATE-001` | `bubbles.test`, then the owning implementation and regression phases | Produce current-revision `scenarioBinding` receipts for the required RED, implementation, targeted GREEN, live GREEN, and regression GREEN states of all eight scenarios. Report links alone do not create receipt-derived states. | Re-run `scenario-state-resolve.sh` through the transition guard. |
| `BUG-025-VALIDATE-DELTA-001` | `bubbles.implement` | Add the required executed `### Code Diff Evidence` section for the current implementation-bearing delta. | Re-run the registry-asserted transition guard. |
| `BUG-025-VALIDATE-STATE-001` | Owners of the affected execution claims | Reconcile the unregistered `design` phase claim and zero-duration non-trivial design, plan, and implement history entries without fabricating timestamps or deleting evidence. | Re-run the registry-asserted transition guard. |

The first required owner is `bubbles.plan`, because the mechanical planning-shape findings must be
resolved before test and execution receipts can support a terminal adjudication. Every remaining
finding above stays open in the routing packet.

### Post-Edit Narrow Mechanical Checks

#### Artifact Lint

**Phase:** validate
**Claim Source:** executed

```text
# BUG-025 final validate post-edit artifact lint
$ timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
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
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ All checked DoD items in scopes.md have evidence blocks
Artifact lint PASSED.
```

#### Registry-Asserted State Transition Guard

**Phase:** validate
**Claim Source:** executed

```text
# BUG-025 final validate post-edit state transition guard
$ timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --target-status done --expect-workflow-mode bugfix-fastlane --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
exit: 1
lines: 1985
sha256: 35266effa4915844f8d472392578cede5fad900935ca9aae52070a678490e082
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:eeb38ea7f6aedf9a614dcf1180a5c086dd28b8194f4282afde9057b71e038eb2
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
failedGateIds: [G057,G061,G022,G053,G027]
failedChecks: [Check-4-scenario-states,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 44
exitStatus: 1
verdict: FAIL
```

**Claim Source:** interpreted
**Interpretation:** A bounded diagnostic rerun preserved the non-zero verdict and exposed the
complete finding set. All eight scenarios lack current-revision receipt-derived `RED_VERIFIED`,
`IMPLEMENTED`, `GREEN_TARGETED`, `GREEN_LIVE`, and `REGRESSION_GREEN` states. Scope 1 is still In
Progress. Validate and audit phase claims are absent. The pending route prevents transition
closure. The guard also rejects the unregistered `design` phase claim, zero-duration non-trivial
execution-history entries, the planning shape for scenario-specific regression and Change
Boundary coverage, the absent `### Code Diff Evidence` section, stale evidence receipts, and the
empty completed-scope inventory while implementation and test phases are claimed. These are not
an audit-only refusal. Status and certification must remain in progress.

<a name="final-validation-planning-reconciliation-2026-09-01"></a>
## Final Validation Planning Reconciliation — 2026-09-01

### Planning-Owned Change

`BUG-025-VALIDATE-PLAN-001` is reconciled without changing the planned behavior or delivery
boundary. The existing `SCN-BUG-025-003` DoD row now begins with the canonical scenario-specific
regression requirement. The existing Change Boundary row now uses the canonical containment
sentence. The boundary section now labels the same production, test, product-documentation,
packet, protected, and excluded sets as `Allowed file families` and `Excluded surfaces`.

The Test Plan still contains 12 rows. The DoD still contains exactly 15 unchecked rows. All eight
Gherkin scenarios, scenario obligations, implementation references, evidence references, and
linked test titles are unchanged. Only the scenario manifest generation timestamp and planning
stage identify this reconciliation epoch. No product source, persistent test, acceptance,
certification, completion inventory, or status field changed in this planning action.

### Repository Binding

**Phase:** plan
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-7ba6dae9325d2fc0ab03ebdac1666fe9 --session-control-file /home/philipk/.local/state/bubbles/repository-binding/vscode-7ba6dae9325d2fc0ab03ebdac1666fe9/repository-binding.json --packet-file /tmp/research-lab-bug025-binding-packet-vscode-7ba6dae9325d2fc0ab03ebdac1666fe9-rev3.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-7ba6dae9325d2fc0ab03ebdac1666fe9:3 revision=3
```

### Narrow Planning Guards

**Phase:** plan
**Commands:**

- `timeout 60 grep -cE '^- \[ \]' specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md`
- `timeout 60 grep -cE '^\| (Unit regression|Scenario-specific Regression E2E|Security adversarial unit regression|Security canonical Regression E2E|Security embedded-refusal Regression E2E|Security served-refusal Regression E2E|Security contract regression|Served-configuration scenario and broader E2E regression|Repository regression) ' specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md`
- `timeout 300 bash .github/bubbles/scripts/scenario-obligation-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
- `timeout 300 bash .github/bubbles/scripts/test-mechanism-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
- `timeout 300 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .`
- `timeout 300 bash .github/bubbles/scripts/scope-context-fit-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
- `timeout 300 bash .github/bubbles/scripts/vertical-delivery-plan-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`

**Exit Code:** 0
**Claim Source:** executed

```text
15
12
[scenario-obligation-lint] OK — 8 scenario(s) with a coherent derived obligation matrix
[test-mechanism-lint] OK — 5 declared mechanism(s) coherent with their scenario traits
[mutation-receipt] OK — mutationExecution adapter is none (inert)
[scenario-test-resolve] OK — 8 reference(s) resolved via literal-scan; 8 category comparison(s) not applicable (no test-discovery adapter declared)
[scope-context-fit-lint] OK — all 1 scope(s) are self-contained (no chat/session-replay dependency); a fresh specialist can execute from the durable artifacts.
[vertical-delivery-plan-guard] OK — first usable increment is early (scope 1 of 1); no horizontal chain; within scope budget.
```

### Artifact Lint

**Phase:** plan
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 planning artifact lint before routing record' -- timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 planning artifact lint before routing record
$ timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
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
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

### Canonical Planning-Shape Guard

**Phase:** plan
**Command:** `timeout 660 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 planning-shape reconciliation guard' -- timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --target-status done --expect-workflow-mode bugfix-fastlane --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f`
**Exit Code:** 1
**Claim Source:** interpreted
**Interpretation:** The canonical guard no longer lists either planning check among its failed
checks. Its remaining `failedChecks` are scenario receipt state and all-done delivery state. The
non-zero result is preserved because this planning action does not own test receipts, execution
history repair, implementation delta evidence, delivery status, validation, audit, or
certification.

```text
# BUG-025 planning-shape reconciliation guard
$ timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --target-status done --expect-workflow-mode bugfix-fastlane --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
exit: 1
lines: 1983
sha256: da58856c6983718cb5d02a1c71b40f44e81a984dafa04a4c878d08b0e33b1084
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:1dc07c7c8485165ffef7b59f56bc6169cdbdca370400ca8989fce0905dc8c58c
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
failedGateIds: [G057,G061,G022,G053,G027]
failedChecks: [Check-4-scenario-states,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 39
exitStatus: 1
verdict: FAIL
```

### Finding Accounting And Routing

| Finding | Disposition after this planning action |
| --- | --- |
| `BUG-025-VALIDATE-PLAN-001` | Addressed by the canonical regression, Change Boundary, and boundary-label reconciliation above. |
| `BUG-025-VALIDATE-SELFTEST-001` | Unresolved. Routed next to `bubbles.test` for the missing Feature 025 functional contract assertions and a fresh repository selftest receipt. |
| `BUG-025-VALIDATE-SCENARIO-STATE-001` | Unresolved. Routed first to `bubbles.test` for current-revision scenario receipts. Later owner-specific receipt gaps remain governed by the final-validation finding. |
| `BUG-025-VALIDATE-DELTA-001` | Unresolved and unchanged. It remains owned by `bubbles.implement`. |
| `BUG-025-VALIDATE-STATE-001` | Unresolved and unchanged. It remains routed to the owners of the affected execution claims. |

Both status mirrors remain `in_progress`. Scope 1 remains `In Progress`. All 15 DoD rows remain
unchecked. Certification arrays remain empty and lockdown remains unlocked. The next owned action
is `BUG-025-ROUTE-025` by `bubbles.test`; this planning pass does not certify the packet.

<a name="code-diff-evidence"></a>
### Code Diff Evidence

**Phase:** implement
**Finding:** `BUG-025-VALIDATE-DELTA-001`
**Claim Source:** executed

This is current working-tree evidence against `HEAD`, not an isolated-commit claim. The tracked
patch was read in full through bounded evidence capture. The current path history was also read.
The latest commit touching this path set is the current unrelated `test(spec008)` `HEAD`, while
all seven tracked BUG-025 delivery paths remain modified and the map plus packet remain untracked.
No commit is attributed to the BUG-025 delta.

This invocation changes only this report and the implementation-attributed execution or routing
records in `state.json`. It does not change a production, test, map, note, planning-truth,
scenario, acceptance, DoD, status, or certification byte.

#### Exact BUG-025 Delta Inventory

**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 implementation-bearing path inventory' -- timeout 60 git status --short --untracked-files=all -- company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs scripts/scenario-break-map-bug025.json notes/company-intelligence-lab.md specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 implementation-bearing path inventory
$ timeout 60 git status --short --untracked-files=all -- company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs scripts/scenario-break-map-bug025.json notes/company-intelligence-lab.md specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 16
sha256: c16e9ed3eb7601b14b2fc8028936f60374243fdd607dc06f7812fb45cf44ddb5
--- output ---
 M company-intelligence-lab.html
 M company-intelligence.config.json
 M notes/company-intelligence-lab.md
 M rlcompanyintel.js
 M scripts/selftest.mjs
 M tests/company-intelligence-lab.spec.mjs
 M tests/company-intelligence.unit.mjs
?? scripts/scenario-break-map-bug025.json
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/bug.md
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/design.md
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/report.md
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/state.json
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md
```

The current implementation-bearing path set is exactly:

| Ownership surface | Current paths | This invocation |
| --- | --- | --- |
| Production and runtime configuration | `company-intelligence-lab.html`, `rlcompanyintel.js`, `company-intelligence.config.json` | Read only. The configuration is part of the whole working-tree delta but is a protected control in the latest security boundary. |
| Persistent tests | `tests/company-intelligence.unit.mjs`, `tests/company-intelligence-lab.spec.mjs`, `scripts/selftest.mjs` | Read only. `scripts/selftest.mjs` belongs to the separate test-owned final-validation campaign. |
| Test infrastructure | `scripts/scenario-break-map-bug025.json` | Read only. The untracked map belongs to `bubbles.test`. |
| Product documentation | `notes/company-intelligence-lab.md` | Read only. |
| Packet and planning records | `bug.md`, `design.md`, `report.md`, `scenario-manifest.json`, `scopes.md`, `spec.md`, `state.json`, and `uservalidation.md` under this BUG-025 folder | Only `report.md` and implementation-attributed or routing fields in `state.json` change here. |

#### Tracked Object And Line Delta

**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 tracked delta object and line evidence' -- timeout 60 git diff --raw --no-abbrev --numstat HEAD -- company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs notes/company-intelligence-lab.md`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 tracked delta object and line evidence
$ timeout 60 git diff --raw --no-abbrev --numstat HEAD -- company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs notes/company-intelligence-lab.md
exit: 0
lines: 14
sha256: c9ce965f207190ff1ebe76505da20d85b7ecadf3f74cfd7d714bceb0ce6af47b
--- output ---
:100644 100644 aca44ec5d20f47841f56e0fcbeb46741334aa382 0000000000000000000000000000000000000000 M      company-intelligence-lab.html
:100644 100644 b5c6f9a5c8a71904784176f93ec71557488a187e 0000000000000000000000000000000000000000 M      company-intelligence.config.json
:100644 100644 9854e025f3bea588bb905c4135b5678362d9a76f 0000000000000000000000000000000000000000 M      notes/company-intelligence-lab.md
:100644 100644 1f27df154d85d98c910ffd3e50d51bb86ee3a214 0000000000000000000000000000000000000000 M      rlcompanyintel.js
:100644 100644 71d428db61c1c663b114b761c85309b3d7f501cd 0000000000000000000000000000000000000000 M      scripts/selftest.mjs
:100644 100644 a14d88984d40fa3388efb4af1f3f6e3e5165378c 0000000000000000000000000000000000000000 M      tests/company-intelligence-lab.spec.mjs
:100644 100644 b5893db48b93b5f512edbbf02626ce2b763e1cef 0000000000000000000000000000000000000000 M      tests/company-intelligence.unit.mjs
142     40      company-intelligence-lab.html
2       1       company-intelligence.config.json
23      8       notes/company-intelligence-lab.md
22      8       rlcompanyintel.js
80      7       scripts/selftest.mjs
1231    5       tests/company-intelligence-lab.spec.mjs
310     3       tests/company-intelligence.unit.mjs
```

The all-zero destination object ids are Git's raw working-tree representation. They are not
asserted as content hashes. The line counts and modified-path identities are the direct signal
used here.

#### Complete Tracked Patch Capture

**Command:** `timeout 180 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 current production test and note patch' -- timeout 120 git diff --no-ext-diff --binary HEAD -- company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs notes/company-intelligence-lab.md`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 current production test and note patch
$ timeout 120 git diff --no-ext-diff --binary HEAD -- company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs notes/company-intelligence-lab.md
exit: 0
lines: 2336
sha256: 81582278024cd4a3d9891c8b1b62d5b760681e8bbece3fb35c73b61d4b3a176c
--- first 20 ---
diff --git a/company-intelligence-lab.html b/company-intelligence-lab.html
index aca44ec5d..ea7c70f21 100644
--- a/company-intelligence-lab.html
+++ b/company-intelligence-lab.html
@@ -294,7 +294,7 @@
		   <p class="dim" id="subject-help">Tickers only. A position, size, cost basis or profit entry is refused and
			  nothing is stored.</p>
		   <p id="link-notice" class="dim" hidden></p>
-            <p id="subject-refusal" class="refusal" hidden></p>
+            <p id="subject-refusal" class="refusal" role="alert" aria-live="assertive" aria-atomic="true" hidden></p>
		   <p id="subject-identity"></p>
		   <div class="segment" role="group" aria-label="View mode">
			  <button type="button" id="mode-simple" data-mode-button="simple" aria-pressed="true">Simple</button>
@@ -439,7 +439,7 @@
	<!-- The coverage registry, embedded.

		This repository is build-free and its pages are meant to open straight off disk, but a
-         `file://` document has a null origin and Chrome refuses `fetch()` from it entirely, so
+         `file://` document has a null origin and Chrome refuses browser reads from it entirely, so
		the committed company-intelligence.config.json is unreachable for a reader with no
--- omitted 2296 line(s); sha256 above covers the full output ---
--- last 20 ---
	    const trimmed = Object.assign({}, CONFIG, {
@@ -2029,7 +2335,7 @@ test('readCoverageRegistry raises C025-REGISTRY-INCOMPLETE when a mandatory dime
	    );
	});
	assert.throws(
-        () => INTEL.readCoverageRegistry(Object.assign({}, CONFIG, { contractVersion: 'company-intelligence-config/v2' })),
+        () => INTEL.readCoverageRegistry(Object.assign({}, CONFIG, { contractVersion: 'company-intelligence-config/v1' })),
	    (error) => error.code === 'C025-CONFIG-VERSION'
	);
	/* The shipped configuration passes, so the guard is not refusing everything. */
@@ -2037,7 +2343,8 @@ test('readCoverageRegistry raises C025-REGISTRY-INCOMPLETE when a mandatory dime
 });

 test('the shipped configuration declares exactly fifteen registry rows and four horizons', () => {
-    assert.equal(CONFIG.contractVersion, 'company-intelligence-config/v1');
+    assert.equal(CONFIG.contractVersion, 'company-intelligence-config/v2');
+    assert.equal(CONFIG.readBoundMs, REQUIRED_READ_BOUND_MS);
	assert.equal(CONFIG.coverageRegistry.length, 15);
	assert.equal(CONFIG.horizons.length, 4);
	assert.equal(CONFIG.decisionTimeSource, 'caller');
```

The `2336`-line hash covers every omitted patch line. The bounded excerpt confirms that the patch
starts in the production route and ends in the unit carrier rather than being an artifact-only
change.

#### Current Commit History For The Tracked Path Set

**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 implementation path commit history' -- timeout 60 git log --format=%H%x09%cI%x09%s -- company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs notes/company-intelligence-lab.md`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 implementation path commit history
$ timeout 60 git log --format=%H%x09%cI%x09%s -- company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs notes/company-intelligence-lab.md
exit: 0
lines: 314
sha256: 810c9f8712881c494d57af3860bf3bce38ef034aebda2f2292f5c62e8bf62ada
--- first 20 ---
4c9f2e87b9738eece50c2f0f5b987046ee6ce7a8        2026-08-31T22:48:13+00:00      test(spec008): enforce portfolio error registry census
095d76dc431860b0ddd904a5b0c5c4ab821f3c99        2026-08-30T16:42:23+00:00      fix(BUG-018): enforce settled publication boundary
d0ec2b5425a0db7d08da0f5122d633dfeb580b01        2026-08-29T21:10:37+00:00      bug(020): close the over-determination row by covering each layer, not by amending the design
330730dba37c3ddc48e822309f0fed439c40832a        2026-08-29T00:37:17+00:00      fix(BUG-011): write the missing regression guard and record real phase provenance
99b927fc77b701e5cb43ca2b840251451883877c        2026-08-27T08:02:19-07:00      fix(selftest): a quiet attention tier is a guaranteed outcome, not a broken gate
0a645b583de2292913991dbf43e7ad7d208fb01e        2026-08-26T23:31:29-07:00      fix(tests): stop two gates asserting the distance between a stamp and a clock
3815c1fabed349c482b710217976ec97b7d275c2        2026-08-25T10:44:11-07:00      add a drift guard for scope DoD progress claims, which nothing compared
b13924e9c8b76568427ae05ef249c1de9d3e7e68        2026-08-24T23:58:30-07:00      BUG-016: W5 — a gated emitter name must be admitted by the list its gate consults
cdff776c5ddcaeaef1996660febbee72afceb8ca        2026-08-24T23:46:40-07:00      selftest: W4 checks the emitting call, not a bare string (BUG-016)
17dafde4fee148a4664962f174daa82dacd6489d        2026-08-24T23:31:17-07:00      spec(BUG-019): assert the stopping-age disclosure, and re-measure two premises
d36ed96d32f321357c68488286f266962e16f85e        2026-08-24T21:14:54-07:00      BUG-021: assert the stratified read bound in the repo gate
57ab95a23261c9d63e0e68e64f7ea3bd42f25bca        2026-08-24T08:33:05-07:00      Merge remote-tracking branch 'origin/main' into land/merge2-20260824
7577d5ad3c36bfef843e62086e7e03b92358756d        2026-08-24T08:17:40-07:00      BUG-020: refuse an unrepresentable figure at its origin, at the display seam and in the header
5c97510b7fac25b9425324937fc1d5ad1346d112        2026-08-24T08:04:59-07:00      fix(BUG-015): make the published subject link live in both directions
e28be58145492519734f767f1d9467dec6a8ea62        2026-08-24T06:52:24-07:00      BUG-019: declare the earliest priceable claim age in the benefit pack and refuse below it
e2801ef4f1125d1270a1dd338aa187b413714357        2026-08-23T20:33:57-07:00      fix(horizon-ladder-lab): enable the brief mount that was shipped inert
4784fd4e00e673bef660b412b57fa92f42bc4569        2026-08-23T20:26:15-07:00      fix(BUG-018): withhold the coverage claim until the corpus answers
6881aa3a4af450fee790d29aeec2009c390adbf1        2026-08-23T19:08:22-07:00      fix(BUG-018 scope 1): data-corpus-status describes the subject on screen
505a41038a3a69d4660c7e5d8bb15701c8a10b38        2026-08-23T11:38:44-07:00      Merge origin/main: keep both sides of the scripts/selftest.mjs tail append
4cf6269d8cd34bbe7ad9336496f733eb3e1ff821        2026-08-23T11:23:41-07:00      selftest: assert the lifetime-tax route wires every module and panel marker it depends on (BUG-016)
--- omitted 274 line(s); sha256 above covers the full output ---
--- last 20 ---
9e9f5aa8691a049cf18b795c6267d47c6de44f21        2026-07-12T11:03:57-07:00      Add global rotation and real-assets research tools
8dd860268c0c732958a2c9caaf8b94aa6079d254        2026-07-09T15:33:30-07:00      feat(market-brief): add Mag 7 (MAGS) + semis (SOXX) thematic groups + notable members
f5d990e19d7634800676314a60499c09d4c0864f        2026-07-09T09:44:38-07:00      market-brief: larger-picture, anti-reactivity upgrade (structure first, noise last)
f480c88fc4de50ee22bac22c8bd30d7aa1b49211        2026-07-08T11:42:12-07:00      options-flow-feed-lab: unusual options activity scanner (honest EOD proxy)
4c2cdc48b4b5de0eb60bae2133c9b7b3f4231c62        2026-07-08T11:30:58-07:00      market-heatmap-lab: new sector/constituent treemap tool + cross-tool contract
cd7dbdf536171c8f4610faeb2014ea463f235b79        2026-07-06T14:03:47-07:00      research-lab: shared rlchart.js chart tooltips + sector RS log-scale & zoom
568dbc3e604db8a6bb5c94274a5dc772d611b970        2026-07-06T11:26:18-07:00      market-brief: fix rlticker auto-linker runtime regression + add DOM-path selftest guard
ab3e1a7aa0913f5fc2a2c4bd5b6d39d9773fad3d        2026-07-06T10:44:13-07:00      market-brief: Phases 1-5 cockpit + shared rlData/rlbrief/rlticker + universal ticker-links & tooltips
90470674c373c13ccc976840130f764dd5ad1464        2026-07-06T09:13:41-07:00      selftest: drop obsolete sector Simple-cockpit group (entryTiming/rotationVerdict removed in 313e941)
d01957148ec3cb82c0e7c202d97abed226906974        2026-07-05T17:56:02-07:00      feat(sector-lab): add Simple decision mode (steerable rotation call) beside the Power dashboard
3c383bc41b2ba0f439d8446d755632c43a124702        2026-07-05T15:47:32-07:00      feat(sector-research-lab): fix blank drill-down panels + deepen ETF selector
ad131174c0b1685a77d96ab0c37494f0c9d9847e        2026-07-05T14:04:42-07:00      feat(sector-research-lab): deepen sector-ETF selector for vehicle choice
8d4dbe4f828ccbabde634eee683fc8fcbbd071d1        2026-07-05T12:39:56-07:00      Add shared collapsible left-nav across all tools; add waterfront-polo + smart-money labs
7b5e0be3c58ecd7cd95a11ce731454a62a08df84        2026-07-05T08:33:44-07:00      feat(labs): volume-profile playbook layer for intraday + swing labs
4eb9471aea0e5a4ba61adc3e1564ccb4175bc8f4        2026-07-04T12:43:47-07:00      evidence: swing per-signal edge backtest (forward N-day hit-rate + median by MA-stack/200d/Weinstein state) in the analogs panel — answers 'does each signal predict returns for THIS name'; +5 selftest checks (56 total, incl. edge-recovery)
a1e0a44018af3aa70b848ca77585feb0f73915b4        2026-07-04T12:24:34-07:00      strategy: ai-capex empirical shrinkage covariance (constant-correlation target) from best-effort 1yr history fetch, replacing the 2-rho theme model when available (2-rho fallback); +7 selftest checks (51 total)
4987663e68e2372986eb4d1b32c6ad57c5c55033        2026-07-04T12:08:24-07:00      strategy: MSFT options-implied (risk-neutral) scenario odds from ATM IV+skew, shown vs the manual sliders; +5 selftest checks (44 total)
5b1ab0912fec348e7b294c367ca0f210bb3cf8ed        2026-07-04T12:04:49-07:00      strategy: options realized-vol cone (RV term + IV-vs-cone richness); swing weekly multi-timeframe (30w) confirm; intraday single-prints + poor high/low; +10 selftest checks
d6e0c9bfe8cd2ea772a4e0a6f05aaaad08a79e62        2026-07-04T12:00:42-07:00      consistency: shared window.RLG.macroRegime classifier in rlg.js (single source of truth for F&G+VIX risk); wire intraday regime signal to it; +6 selftest checks
bc3054c557f9720c491b314eecf69158d650afc1        2026-07-04T11:58:07-07:00      trust: ETF Deflated + Probabilistic Sharpe (overfitting-aware backtest); add scripts/selftest.mjs math-invariant harness (23 checks)
```

#### Unrelated Dirty Paths Kept Separate

**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 implementation final-validation current dirty inventory' -- timeout 60 git status --short --untracked-files=all`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 implementation final-validation current dirty inventory
$ timeout 60 git status --short --untracked-files=all
exit: 0
lines: 52
sha256: e97b2ac17d9ba0831ee99918b4dcfc4e987bb01a2cc731259ea45029e7a0008f
--- first 20 ---
 M README.md
 M company-intelligence-lab.html
 M company-intelligence.config.json
 M docs/DomainModel.md
 M notes/company-intelligence-lab.md
 M rlcompanyintel.js
 M scripts/selftest.mjs
 M scripts/validate-test-file-reachability.baseline
 M specs/007-technical-analysis-decision-lab/scopes/01-capability-foundation/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/02-technique-engine/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/03-setup-lifecycle/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/04-five-gate-synthesis/report.md
 M specs/007-technical-analysis-decision-lab/scopes/04-five-gate-synthesis/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/05-owner-publication/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/06-comparison-optional-evidence/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/07-validation-risk-process/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/08-experience-publication/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/09-regression-closure/scope.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/design.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/report.md
--- omitted 12 line(s); sha256 above covers the full output ---
--- last 20 ---
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/state.json
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/bug.md
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/design.md
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/report.md
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/scenario-manifest.json
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/scopes.md
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/spec.md
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/state.json
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/uservalidation.md
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/bug.md
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/design.md
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/report.md
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/scenario-manifest.json
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/scopes.md
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/spec.md
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/state.json
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/uservalidation.md
```

The 36 unrelated dirty paths are: `README.md`, `docs/DomainModel.md`,
`scripts/validate-test-file-reachability.baseline`; the ten shown files under
`specs/007-technical-analysis-decision-lab/scopes/`; the six current files under
`specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/`;
`specs/_bugs/BUG-002-market-brief-session-date-drift/uservalidation.md`; and the eight files in
each of the untracked BUG-026 and BUG-027 packets. They are not part of this implementation
finding and were neither edited nor attributed here.

#### Implementation History Reconciliation And Routing

The diagnostic transition guard passed phase-owner provenance for `bubbles.implement` but named
its `2026-09-01T04:06:24Z` history entry among three non-trivial zero-duration records. The entry
stored one instant in both timestamp fields. Neither the implementation report nor Git history
contains a separate measured start. `state.json` now keeps both original timestamps and adds the
schema-supported `durationUnmeasured` declaration with a substantive reason. No elapsed duration
or replacement timestamp is invented.

The same guard assigns the other state defects outside this owner: the unregistered design phase
claim and design span remain routed to `bubbles.design`; the plan span remains routed to
`bubbles.plan`. The separate selftest and scenario-receipt findings remain on existing
`BUG-025-ROUTE-025` to `bubbles.test`. No foreign-owned entry is rewritten here.

`BUG-025-VALIDATE-DELTA-001` is addressed by this executed Git-backed section. Scope 1, all fifteen
DoD rows, both status mirrors, completion arrays, certified phases, lockdown, and user validation
remain unchanged.

#### Protected Byte Postcheck

**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 implementation final-validation protected-byte postcheck' -- timeout 60 sha256sum company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs scripts/scenario-break-map-bug025.json notes/company-intelligence-lab.md specs/_bugs/BUG-025-company-corpus-read-never-settles/bug.md specs/_bugs/BUG-025-company-corpus-read-never-settles/design.md specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md`
**Exit Code:** 0
**Claim Source:** executed

Every digest below equals the pre-edit digest produced by the same ordered path list. The only
authorized changed bytes remain `report.md` and `state.json`.

```text
# BUG-025 implementation final-validation protected-byte postcheck
$ timeout 60 sha256sum company-intelligence.config.json company-intelligence-lab.html rlcompanyintel.js tests/company-intelligence.unit.mjs tests/company-intelligence-lab.spec.mjs scripts/selftest.mjs scripts/scenario-break-map-bug025.json notes/company-intelligence-lab.md specs/_bugs/BUG-025-company-corpus-read-never-settles/bug.md specs/_bugs/BUG-025-company-corpus-read-never-settles/design.md specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md
exit: 0
lines: 14
sha256: 8ec74ee51e58fb3042c88fa6173394cde7cfeede37920558c146717ac3d6f8cf
--- output ---
937dffcc2c78cf29e77d280f93c39c0a38c057e3035f60966f8582f1f3d4dded  company-intelligence.config.json
45ccdaa81ceec2b645e8203c63eab59b02fb7daace5cb1650e8b61691a1a76b8  company-intelligence-lab.html
cafb9c69f16646a5e21f880f966a7a1974097e9a32df149cfeb151cf741301b7  rlcompanyintel.js
402f3ba7eb0996c6849a1cb313d88034973bc0337151b23f253258d32c2341bd  tests/company-intelligence.unit.mjs
b027d0c6ab330e76067c2438fa37479c318d191ad2f59f384138419546e30a59  tests/company-intelligence-lab.spec.mjs
829fb8512bf5430106318aaeb21e562504b0a8e39b4ca8b48ab9e4e8ca11e60a  scripts/selftest.mjs
e0651ba5e97443a63c66a4ebb33d9409c52c36eda04395c3fc9cb55f7cf6a76a  scripts/scenario-break-map-bug025.json
8410619a0bdc45e5139c8fe5a809841e45c5dd03971af4a33586d80a0a5220f4  notes/company-intelligence-lab.md
4004f960d240d1a86557e1fc5220d6d99909d28c089c1eeea78ef2c7de25a68d  specs/_bugs/BUG-025-company-corpus-read-never-settles/bug.md
4226c6647e469b648e9293b7e85aa48e905f1f96e140f701e5d075f239cad021  specs/_bugs/BUG-025-company-corpus-read-never-settles/design.md
430340ae37023fb41edec441a4c581723a4326e0bcb8735b8f3da1658b2072f0  specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json
271cc4b027e4727aeca995bcb51fc5d4dcc9e72f32b302fdaf7d93516559a37e  specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md
37991d996e57a06857bb86fa9a3ad2c4512972a27599920dbfa8fa6833d1c89c  specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md
0d8d4480c584133ea21716d52b703fabaf78add4ec48903ba1823cca7bc7dc00  specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md
```

#### Narrow Closure Validation

**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 implementation final-validation artifact lint' -- timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 implementation final-validation artifact lint
$ timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
```

**Command:** `timeout 720 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 implementation final-validation diagnostic transition guard after delta closure' -- timeout 660 bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --target-status done --expect-workflow-mode bugfix-fastlane --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025 implementation final-validation diagnostic transition guard after delta closure
$ timeout 660 bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --target-status done --expect-workflow-mode bugfix-fastlane --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
exit: 1
lines: 1988
sha256: 307a43b218788a9d7d937ca25a41b2d47ffa7207bc16e3e4c4f9e43d45d825fc
--- first 20 ---
============================================================
	BUBBLES STATE TRANSITION GUARD
	Feature: specs/_bugs/BUG-025-company-corpus-read-never-settles
	Timestamp: 2026-09-01T07:02:24Z
============================================================

--- Check 1: Required Artifacts ---
✅ PASS: Required artifact exists: spec.md
✅ PASS: Required artifact exists: design.md
✅ PASS: Required artifact exists: uservalidation.md
✅ PASS: Required artifact exists: state.json
✅ PASS: Required artifact exists: scopes.md
✅ PASS: Required artifact exists: report.md

--- Check 2: state.json Integrity ---
ℹ️  INFO: Current state.json status: in_progress
ℹ️  INFO: Current workflowMode: bugfix-fastlane

--- Check 2B: workflowMode Consistency ---
ℹ️  INFO: No policySnapshot.workflowMode present — skipping consistency check
--- omitted 1948 line(s); sha256 above covers the full output ---
--- last 20 ---

🔍 Running project-defined gates from /home/philipk/research-lab/.github/bubbles-project.yaml...
BEGIN TRANSITION_GUARD_RESULT_V1
schemaVersion: transition-guard-result/v1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:d02eda79ff4e02c943c97348405cb1c9b66f1bbfc558bf4eb71d315e0b5d9f1a
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: [G057,G061,G022,G027]
failedChecks: [Check-4-scenario-states,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 42
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

The structured result now includes `G053` in `passedGateIds`, which closes the missing-delta
evidence finding. The non-zero verdict is preserved. Its remaining gate families cover scenario
receipts, incomplete scope and phase state, design/plan claim provenance, and empty completion
inventories. This implementation action does not promote status or claim those owners' work.

<a name="design-provenance-reconciliation-bug-025-validate-state-001-2026-09-01"></a>
## Design Provenance Reconciliation — `BUG-025-VALIDATE-STATE-001`

### Exact Registry Mismatch

**Phase:** bootstrap
**Claim Source:** interpreted
**Interpretation:** The active `bugfix-fastlane` registry declares `bootstrap`, but it does not
declare a `design` phase. The phase registry assigns `bootstrap` to the active workflow runner,
and the capability registry names `bubbles.design` and `bubbles.plan` as specialist owners of
that phase. Both design-authored `completedPhaseClaims` and both design-authored
`executionHistory` records used the unregistered phase name `design`, even though their actions
and evidence describe planning-time design work performed during bootstrap.

The two design claims now retain their agents, claim instants, evidence references, scopes, and
notes while naming the registered `bootstrap` phase. Their backing history records likewise name
only `bootstrap` in `phase` and `phasesExecuted`. No evidence record was deleted, and no delivery,
validation, audit, status, or certification phase was added.

### Unmeasured Design Span

The `2026-08-31T20:44:17Z` design history record stored the same real instant as `startedAt` and
`finishedAt`. Its report evidence contains no independent start boundary. Both timestamps remain
unchanged. The record now carries the schema-supported `durationUnmeasured: true` declaration and
a substantive reason stating that elapsed time is unknown rather than zero. No timestamp or
duration was reconstructed.

### Design Artifact Freshness And Change Boundary

The active design already records the current canonical subject-derived event path, validation
before assignment, terminal configuration-refusal behavior, bounded reads, and unchanged
transport semantics. The final-validation finding identifies provenance metadata, not stale
design content, so `design.md` remains unchanged.

This action changes only `report.md` and design-owned execution metadata in `state.json`. It does
not touch product source, persistent tests, the scenario break map, scenario receipts,
`scenario-manifest.json`, planning text, DoD rows, user validation, status, completion arrays, or
certification. The isolated canonical receipt campaign remains outside this action.

### Finding Accounting And Owner Route

The design-owned portion of `BUG-025-VALIDATE-STATE-001` is reconciled. The remaining
zero-duration `bubbles.plan` history record at `2026-08-31T20:56:35Z` is unchanged because it is
foreign-owned. It remains routed to `bubbles.plan` for the same timestamp-preserving,
unmeasured-duration reconciliation. The separate selftest and scenario-receipt findings remain
on their existing owners and are not adjudicated here.

### Narrow Artifact Lint

**Phase:** bootstrap
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 design provenance reconciliation artifact lint' -- timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 design provenance reconciliation artifact lint
$ timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ No forbidden sidecar artifacts present
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ All checked DoD items in scopes.md have evidence blocks
Artifact lint PASSED.
```

### Diagnostic Transition Guard

**Phase:** bootstrap
**Command:** `timeout 720 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 design provenance reconciliation diagnostic transition guard' -- timeout 660 bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --target-status done --expect-workflow-mode bugfix-fastlane --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025 design provenance reconciliation diagnostic transition guard
$ timeout 660 bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --target-status done --expect-workflow-mode bugfix-fastlane --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
exit: 1
lines: 1970
sha256: ad515729e970ac6038836c025cb1bfa0c957d17afac989c9bbc6f9af784b99d2
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
applicableCheckClasses: [universal,mode-required,delivery-completion]
failedGateIds: [G057,G061,G022,G027,G095]
failedChecks: [Check-4-scenario-states,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 41
exitStatus: 1
verdict: FAIL
```

**Claim Source:** interpreted
**Interpretation:** The full diagnostic output accepts the repaired design provenance and
distinguishes the weak historical spans without treating them as measured durations. The exact
relevant lines are:

```text
--- Check 6B: Phase-Claim Provenance (Gate G022 extension) ---
✅ PASS: Phase 'bootstrap' has specialist provenance from bubbles.design
--- Check 7A: executionHistory Timestamp Plausibility ---
ℹ️  INFO: executionHistory entries analyzed: 10
ℹ️  INFO: executionHistory declares unmeasured spans (single instant recorded, reason given):
bubbles.design:bootstrap|bubbles.implement:implement
🔴 BLOCK: executionHistory contains zero-duration entries for non-trivial phases:
bubbles.plan:plan
ℹ️  INFO: completedPhaseClaims claimedAt values analyzed: 15
✅ PASS: completedPhaseClaims claimedAt timestamps look plausible (no uniform spacing, no backwards ordering)
```

Within `BUG-025-VALIDATE-STATE-001`, no unregistered `design` claim or blocking design-duration
finding remains. The guard stays non-zero because the packet is not eligible for delivery
completion, the plan-owned span is unchanged, and other owner-routed findings remain open. The
diagnostic also reports `G095` against pre-existing malformed report-fence context around an
older captured guard line. That foreign report structure and its evidence are not rewritten by
this design-owned action.

<a name="test-owned-validation-mechanics-closure-2026-09-01"></a>
## Test-Owned Validation Mechanics Closure — 2026-09-01

### Current Source And Receipt Grounding

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** The current production route and module retain the bounded request helper,
canonical event-path derivation, stale-intent guard, and route-terminal result suppression used by
the eight controlled breaks. The current map contains exactly `SCN-BUG-025-001` through
`SCN-BUG-025-008`. The current Feature 025 selftest block contains `TP-025-SEC-01` through
`TP-025-SEC-05`, covering canonical derivation, duplicate refusal, committed-to-embedded parity,
forbidden-mechanism and single-fetch-site constraints, and equality-guard discrimination. The
canonical `.specify/runtime/tool-calls.jsonl` records the current-revision red, implementation,
targeted-green, live-green, and regression-green receipt chain for each of the eight scenarios.

### Current-Session Execution Receipts

| Receipt | Exact command | Result |
| --- | --- | --- |
| Modified Feature 025 functional selftest | `timeout 1200 node scripts/selftest.mjs` | Exit `0`; `3443 passed`; full-output SHA-256 `342d6a56ee75714772110dad21ef3c04059cec44b19b358301dba345e47053c5`. |
| Canonical eight-scenario controlled-break run | `timeout 1800 node scripts/scenario-receipts.mjs --spec specs/_bugs/BUG-025-company-corpus-read-never-settles --map scripts/scenario-break-map-bug025.json --all --quiet-child` | Exit `0`; 141 lines; full-output SHA-256 `81158849394abd45a7a251c61f8cea6777e58a1e59ad1e0bc5feb010c070fc2a`; 8/8 `COMPLETE`; every scenario records `red=1 implement=0 green=0 live=0 regression=0`; shared tree unchanged. |
| Independent canonical state resolution | `timeout 120 bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/_bugs/BUG-025-company-corpus-read-never-settles --require RED_VERIFIED --require IMPLEMENTED --require GREEN_TARGETED --require GREEN_LIVE --require REGRESSION_GREEN --require OBSERVED --certifiable` | Exit `0`; 1576 lines; full-output SHA-256 `291c313d907f7f45fdd651654bd60ced8cce81acdb33ddb43d71fa2fcab0dee9`; `certifiable: yes`. |

The independent resolver derives `PLANNED`, `RED_VERIFIED`, `IMPLEMENTED`, `GREEN_TARGETED`,
`GREEN_LIVE`, and `REGRESSION_GREEN` for all eight BUG-025 scenarios. Its 1564
`SCS-REVISION-DRIFT` records name superseded receipts, exclude them from derivation, and explicitly
classify them as nonblocking.

### Finding Accounting And Routing

| Finding | Disposition |
| --- | --- |
| `BUG-025-VALIDATE-SELFTEST-001` | Addressed. The current Feature 025 selftest contains the five required event-security assertions, and the admitted current-session selftest receipt exits zero with 3443 passes. |
| `BUG-025-VALIDATE-SCENARIO-STATE-001` | Addressed. The canonical controlled-break run is 8/8 complete, and the independent resolver derives every required applicable state with `certifiable: yes`. |
| `BUG-025-ROUTE-025` | Addressed by this test-owned record and completed in `state.json`. |
| `BUG-025-ROUTE-024` | Remains pending for final independent adjudication by `bubbles.validate`. |

The existing state already records `BUG-025-VALIDATE-DELTA-001`, `BUG-025-ROUTE-026`, and
`BUG-025-ROUTE-027` as completed. This action changes only test-owned report and execution/routing
records. All fifteen DoD rows remain unchecked. Scope 1 and both status mirrors remain in progress.
Certification completion arrays remain empty, and lockdown remains unlocked. No validation,
audit, or finalize phase is claimed.

<a name="final-validate-owned-adjudication-closure-2026-09-01"></a>
## Final Validate-Owned Adjudication Closure — 2026-09-01

This section supersedes the partial adjudication at
`report.md#final-validate-adjudication-2026-09-01`. The earlier section remains unchanged as
historical evidence of the gaps that later owners closed. This section adjudicates the current
tree after `BUG-025-ROUTE-025`, `BUG-025-VALIDATE-DELTA-001`, `BUG-025-ROUTE-026`, and
`BUG-025-ROUTE-027` all reached completed state.

### Repository Binding And Current Transition Contract

**Phase:** validate
**Claim Source:** executed

```text
$ timeout 120 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-7ba6dae9325d2fc0ab03ebdac1666fe9 --session-control-file /home/philipk/.local/state/bubbles/repository-binding/vscode-7ba6dae9325d2fc0ab03ebdac1666fe9/repository-binding.json --packet-file /tmp/research-lab-bug025-final-validate-packet.json
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-7ba6dae9325d2fc0ab03ebdac1666fe9:3 revision=3
$ timeout 300 bash .github/bubbles/scripts/goal-fidelity-guard.sh --boundary pre-certification --session-file .specify/memory/bubbles.session.json --spec-dir specs/_bugs/BUG-025-company-corpus-read-never-settles
goal-fidelity-guard: PASS boundary=pre-certification
$ timeout 120 bash .github/bubbles/scripts/transition-contract-resolver.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
workflowMode=bugfix-fastlane
auditProfile=delivery-completion-v1
statusCeiling=done
targetStatus=done
currentStatus=in_progress
phaseOrder=select,bootstrap,implement,test,regression,simplify,gaps,harden,stabilize,devops,security,validate,audit,finalize
contractDigest=sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
```

The current contract places `audit` and `finalize` after `validate`. Both status mirrors therefore
stay `in_progress` in this pre-audit increment.

### Current Validate Execution Receipts

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** Each row below records an actual command executed during this adjudication.
The exit code, complete-output line count, complete-output SHA-256, and named terminal signal are
taken from the returned evidence-capture block. The browser carriers ran against the repository's
real ephemeral origin with the committed `system-chrome` project.

| Verification | Exact command | Current result |
| --- | --- | --- |
| Outcome contract linkage | `timeout 300 bash .github/bubbles/scripts/goal-fidelity-guard.sh --boundary pre-certification --session-file .specify/memory/bubbles.session.json --spec-dir specs/_bugs/BUG-025-company-corpus-read-never-settles` | Exit `0`; `goal-fidelity-guard: PASS boundary=pre-certification`; full-output SHA-256 `3bc6db28381ca97126677622f3eccd914d5ec26e9fae7e71814eeaf2db389a46`. |
| Complete unit carrier | `timeout 240 node --test tests/company-intelligence.unit.mjs` | Exit `0`; 119 lines; `110` passed, `0` failed, `0` skipped; full-output SHA-256 `c99a2e4c5c13865d4ec5c1995e72232bddbe31864fb4c068a8e6a56532ca7435`. |
| Focused live scenario replay | `timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep 'BUG-025' --reporter=list` | Exit `0`; 18 lines; `13 passed`; full-output SHA-256 `5e98f4c4afa2d5e2cc0d4678c7e80eda16df5ac865b0d1b2ee02e00fdc41cf52`. |
| Complete Company Intelligence browser regression | `timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Exit `0`; 60 lines; `55 passed`; full-output SHA-256 `80811d18ed1315f7e83dcb83dd1fbed00d063992802d93642b47f97055e808d5`. |
| Repository functional regression | `timeout 1200 node scripts/selftest.mjs` | Exit `0`; 3912 lines; `3443 passed, 0 failed`; full-output SHA-256 `9fce097c3e707a17d1250980f0cbd85aafa46ae1befbb9781b8e20386e929ad7`. |
| Eight-scenario state resolution | `timeout 180 bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/_bugs/BUG-025-company-corpus-read-never-settles --require RED_VERIFIED --require IMPLEMENTED --require GREEN_TARGETED --require GREEN_LIVE --require REGRESSION_GREEN --require OBSERVED --certifiable` | Exit `0`; 1576 lines; all eight current scenarios derive through `REGRESSION_GREEN`; `certifiable: yes`; full-output SHA-256 `291c313d907f7f45fdd651654bd60ced8cce81acdb33ddb43d71fa2fcab0dee9`. |

The evidence-link reconciliation replayed the same carriers on the current tree. These are the
raw bounded-capture signals from that replay:

```text
# BUG-025 metadata reconciliation outcome contract
$ timeout 300 bash .github/bubbles/scripts/goal-fidelity-guard.sh --boundary pre-certification --session-file .specify/memory/bubbles.session.json --spec-dir specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 1
sha256: 3bc6db28381ca97126677622f3eccd914d5ec26e9fae7e71814eeaf2db389a46
goal-fidelity-guard: PASS boundary=pre-certification

# BUG-025 metadata reconciliation complete unit carrier
$ timeout 240 node --test tests/company-intelligence.unit.mjs
exit: 0
lines: 119
sha256: 6e33beb15c19d4c5a6a6912a2f5b4ffb586d1b1f4699931f7178176a7df5f752
ℹ tests 110
ℹ pass 110
ℹ fail 0
ℹ skipped 0

# BUG-025 metadata reconciliation focused live replay
$ timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep BUG-025 --reporter=list
exit: 0
lines: 18
sha256: f740177cd515a97ee7a0a2f1265a39c239be536416b248709cc1b159473dae89
13 passed (50.4s)

# BUG-025 metadata reconciliation complete browser regression
$ timeout 1200 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 60
sha256: f299fa940213233af02d7acef17b187d67eb0559fb0a0ab34a9e3ec9a45a2121
55 passed (1.5m)

# BUG-025 metadata reconciliation repository selftest
$ timeout 1200 node scripts/selftest.mjs
exit: 0
lines: 3912
sha256: ca044cb94a4fd36868d3a324a7b8bff6c42fc93dbf5695e20a595208a7fc2b40
Research-Lab self-test: 3443 passed, 0 failed

# BUG-025 metadata reconciliation scenario state resolution
$ timeout 180 bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/_bugs/BUG-025-company-corpus-read-never-settles --require RED_VERIFIED --require IMPLEMENTED --require GREEN_TARGETED --require GREEN_LIVE --require REGRESSION_GREEN --require OBSERVED --certifiable
exit: 0
lines: 1576
sha256: 291c313d907f7f45fdd651654bd60ced8cce81acdb33ddb43d71fa2fcab0dee9
	SCN-BUG-025-001  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-002  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-003  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-004  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-005  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-006  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-007  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-008  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
certifiable: yes
```

### Outcome Contract Verification

**Claim Source:** interpreted
**Interpretation:** The current focused and complete carriers directly exercise the externally
observable settlement, event authority, refusal, focus, and request-ledger behavior. The current
unit and functional carriers exercise the closed configuration contract and implementation
mechanisms. The outcome-contract guard independently accepted the report linkage.

| Field | Current evidence | Status |
| --- | --- | --- |
| Intent | Current focused cases 7 through 13 cover bounded reads and current focused cases 1 through 6 cover canonical event authority plus its discriminating mutations. | PASS |
| Success Signal | The 13-case live replay settles never-answering reads, accepts the canonical MSFT declaration, and refuses every exercised invalid authority path. | PASS |
| Hard Constraints | The complete unit carrier and Feature 025 selftest preserve embedded first paint, one exact derived event path, named refusal, one fetch site, no URL normalization mechanism, and no retry success path. | PASS |
| Failure Condition | The current receipt resolver derives every required state through `REGRESSION_GREEN`, and the live carrier records no pending-without-bound or invalid-declaration transport success. | PASS |

### Fifteen-Row Individual DoD Adjudication

**Claim Source:** interpreted
**Interpretation:** Each row was compared independently with its exact Scope 1 text, its
scenario-specific persistent carrier, the current execution above, and the current-revision
receipt chain where the row names scenario lifecycle proof. `EARNED` means no uncertainty remains
for that row.

| Row | Adjudication | Current row-specific basis |
| ---: | --- | --- |
| 1 | EARNED | The 110-test carrier passes the positive v2 `readBoundMs` contract and the absent, zero, negative, fractional, string, non-finite, and unsafe-value refusal matrix. The design records the `10000` ms rationale. |
| 2 | EARNED | The functional carrier proves one route fetch site inside `readRouteDocument()`. Focused cases 9, 10, and 12 prove the bound aborts corpus, optional-document, and served-configuration requests. |
| 3 | EARNED | Focused case 12 passes the exact `SCN-BUG-025-003` contract: embedded first paint survives the stalled served response, embedded authority remains valid, reconciliation settles, and one bounded request occurs without retry. |
| 4 | EARNED | Focused cases 9 and 10 pass the no-header and partial-body never-answering paths with underlying abort, established named unavailability, one request, and timer cleanup. |
| 5 | EARNED | Focused case 11 passes the inside-bound release path with embedded first paint, loaded settlement, no timeout classification, one request, and timer cleanup. |
| 6 | EARNED | Focused case 8 passes synchronous request setup failure with the existing unavailable caller outcome, zero selected-path server requests, and zero active helper timers. |
| 7 | EARNED | Focused case 13 settles and publishes AAPL while MSFT is held, then proves the late MSFT response cannot alter subject, readiness, horizon accounts, DOM identity, or ordinary tool-read publication. |
| 8 | EARNED | The 110-test carrier passes the complete security event-declaration matrix, frozen derived output, forbidden-mechanism scan, duplicate refusal, and equality-guard mutation discriminator. |
| 9 | EARNED | Focused case 1 passes composed established MSFT output, the committed financial-events row, exactly one canonical event-path request, zero alternate event paths, and zero off-origin requests. |
| 10 | EARNED | Focused cases 2 and 4 pass exact embedded backslash refusal, zero route-owned and off-origin transport, hidden settled surfaces, not-established readiness, one safe atomic alert, payload non-disclosure, focus behavior, and the equality mutation discriminator. |
| 11 | EARNED | Focused cases 3, 5, and 6 pass served mismatch terminality, embedded-source retention, hidden settled surfaces, retained input focus, zero continuation or later repaint, and both equality and suppression mutation discriminators. |
| 12 | EARNED | The current Feature 025 selftest block contains `TP-025-SEC-01` through `TP-025-SEC-05`. The current repository selftest reports `3443 passed, 0 failed`. |
| 13 | EARNED | The unnarrowed Company Intelligence browser file reports `55 passed` with no failure, skip, cancellation, or todo signal. |
| 14 | EARNED | The complete unit carrier reports `110 passed, 0 failed`, and the repository selftest reports `3443 passed, 0 failed`. |
| 15 | EARNED | `report.md#code-diff-evidence` records the closed BUG-025 path inventory, current Git-backed delivery delta, protected-byte checkpoint, and explicit unrelated-dirty-path separation. This adjudication changed only packet-owned report, scope, and validate-owned state coherence. |

All fifteen rows are now checked, and Scope 1 is `Done`. The stale uncertainty declarations were
removed rather than retained beside earned claims.

### G095 Report-Fence Repair

**Phase:** validate
**Claim Source:** executed

The initial RED unit evidence at the start of this report had a closing fence but no matching
opening fence before its preserved `$ timeout 120 node --test ...` output. One `text` opening fence
was inserted immediately before those existing bytes. No captured output byte changed.

```text
$ timeout 60 awk <balanced-fence check> report.md
fence_count=426
all_fences_balanced=true
$ timeout 300 bash .github/bubbles/scripts/discovered-issue-disposition-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 1
sha256: 31aa86026655fd6f886232252db38aa3a455b03a20be0cc1651ffd076e286a27
--- output ---
✅ G095: discovered-issue disposition clean (no unfiled deferrals)
```

### Validate-Owned State And Routing Disposition

`execution.scopeInventory` and `certification.scopeProgress` now mirror the one `Done` scope and
its `15/0` DoD count. The final validate phase is recorded with this section as evidence.
`BUG-025-ROUTE-024` is completed. The active route now targets `bubbles.audit` because the fresh
transition contract places independent audit and then finalize after this validation increment.

Top-level `status` and `certification.status` remain `in_progress`. No audit verdict, finalize
claim, terminal certification, or release claim is written by this pre-audit validation.

## Validate Metadata And Evidence-Link Reconciliation — 2026-09-01

This increment changes metadata and evidence references only.

- Every transition request now uses the closed `open`, `closed`, or `resolved` vocabulary. The
	former completed requests are `resolved`, the superseded route is `closed` with its
	supersession fields intact, and `BUG-025-ROUTE-028` is `open` with same-spec routing to its
	existing `bubbles.audit` owner and `productAction: none`.
- `execution.completedPhaseClaims` is ordered monotonically by `claimedAt`. No claim object was
	added, deleted, or rewritten.
- Each of the fifteen checked DoD rows keeps its wording and checkbox. Each now links first to
	`report.md#current-validate-execution-receipts` and then to
	`report.md#fifteen-row-individual-dod-adjudication`, with the adjudication link labeled by row.
- The top-level and certification status mirrors remain `in_progress`. Scope 1 remains `Done`,
	the certification mirror remains one completed scope with `15/0` DoD progress, the next owner
	remains `bubbles.audit`, and no audit phase claim or audit verdict was added.
- No behavior, product source, persistent test, scenario-receipt log, scenario contract,
	user-validation record, audit state, or unrelated dirty path was changed by this reconciliation.

### Reconciliation Verification

**Phase:** validate
**Claim Source:** executed

```text
state_json_parse=PASS
transition_status_vocabulary=true
completed_phase_claims_monotonic=true
preserved_status_scope_progress_route_and_no_audit_claim=true
current_validate_execution_receipt_links=15
fifteen_row_individual_adjudication_links=15
Artifact lint PASSED.
✅ G095: discovered-issue disposition clean (no unfiled deferrals)

# BUG-025 final metadata-repaired registry-asserted transition diagnostic
$ timeout 660 bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --target-status done --expect-workflow-mode bugfix-fastlane --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
exit: 1
lines: 345
sha256: 0203b0a0312b67619b58e3b183efb9ef72f2e0084ac2e1c0c406f719e337454b
passedGateIds: [G061,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: [G057,G022]
failureCount: 4
verdict: FAIL
```

The expected remaining blocker classes are the global evidence-receipt staleness result
(`total=1632`, `current=1589`, `superseded=43`, `withClosure=35`, `valid=0`, `stale=35`,
`unknown=1554`) and the required `audit` phase absence. The guard emits two audit lines: the
phase is absent and one specialist phase is missing.

One unexpected blocker remains outside this reconciliation boundary:

```text
🔴 BLOCK: scenario-manifest.json only tracks 0 scenarios but resolved scopes define 8 Gherkin scenarios (Gate G057)
```

The scenario manifest was not edited. The packet remains pre-audit and `in_progress`.

## Planning-Owned G057 Scenario Inventory Repair — 2026-09-01

### Root Cause And Minimal Correction

The installed readers disagreed on the scenario identifier field. The canonical schema and
scenario-state completion reader require `id`. The Gate G057 inventory counter in
`guards/control-plane-checks.sh` counts only literal `scenarioId` fields. The manifest therefore
contained eight canonical `id` values while that counter reported zero. Each scenario now carries
the structurally equivalent `scenarioId` alias beside its unchanged canonical `id`. Both fields
hold the same existing value. No title, trait, obligation, implementation reference, linked test,
evidence reference, test mechanism, behavior, receipt, DoD item, status, certification field, or
audit route changed.

### Current-Session Verification

**Phase:** plan
**Claim Source:** executed

```text
# BUG-025 plan G057 manifest structure repair direct traceability check
$ timeout 660 bash .github/bubbles/scripts/traceability-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 83
sha256: 9cf66b75ce75b12f2e1c84cbd2e947bd5f2113b127307408901d4e2cfa33c1c9
✅ scenario-manifest.json covers 8 scenario contract(s)
✅ scenario-manifest.json records evidenceRefs for all 8 scenario contract(s)
✅ All linked tests from scenario-manifest.json exist
ℹ️  Scenarios checked: 8
ℹ️  Scenario-to-row mappings: 8
ℹ️  DoD fidelity scenarios: 8 (mapped: 8, unmapped: 0)
RESULT: PASSED (0 warnings)

# BUG-025 plan G057 scenario linked-test resolver
$ timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 1
sha256: 13944314bdad890eb9fcb00c3b5c158d924974438c8d6ad0e7c3ab3963e71d03
[scenario-test-resolve] OK — 8 reference(s) resolved via literal-scan; 8 category comparison(s) not applicable (no test-discovery adapter declared)

# BUG-025 plan G057 scenario state resolver certifiable
$ timeout 240 bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/_bugs/BUG-025-company-corpus-read-never-settles --require RED_VERIFIED --require IMPLEMENTED --require GREEN_TARGETED --require GREEN_LIVE --require REGRESSION_GREEN --require OBSERVED --certifiable
exit: 0
lines: 1576
sha256: 291c313d907f7f45fdd651654bd60ced8cce81acdb33ddb43d71fa2fcab0dee9
	SCN-BUG-025-001  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-002  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-003  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-004  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-005  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-006  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-007  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	SCN-BUG-025-008  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
	(all 1564 refusals are SCS-REVISION-DRIFT: superseded receipts, excluded from derivation, not blocking)
	certifiable: yes

# BUG-025 plan G057 artifact lint
$ timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.

# BUG-025 plan G057 repaired full transition diagnostic
$ timeout 660 bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --target-status done --expect-workflow-mode bugfix-fastlane --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
exit: 1
lines: 345
sha256: 8e4b291469484f83959a6f6339e682900aac3d3bf3f6b45f2ede3adce1c3cfb0
✅ PASS: scenario-manifest.json covers at least as many scenarios as the scope artifacts (8 >= 8)
✅ PASS: Every required scenario state is receipt-derived for every applicable scenario
passedGateIds: [G057,G061,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: [G022]
failureCount: 3
verdict: FAIL
```

The full diagnostic now passes G057. Its three remaining failures are one stale global
input-closure receipt class and the two messages for one missing `audit` specialist phase. The
canonical scenario-state resolver still reports the older global revision-drift receipts as
superseded and nonblocking for BUG-025 derivation. The packet remains `in_progress` and routes to
`bubbles.test` first for stale-receipt closure. If that owner independently resolves the stale
receipt class, the existing `BUG-025-ROUTE-028` audit route becomes the next action.

### Post-Routing Transition Recheck

**Phase:** plan
**Claim Source:** executed

```text
# BUG-025 final transition diagnostic after G057 repair and test routing
$ timeout 660 bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --target-status done --expect-workflow-mode bugfix-fastlane --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
exit: 1
lines: 346
sha256: 4b11bf23d7835ecaa9de082fca439970a47c018f9dd5361ef97d57ef4ccf7936
passedGateIds: [G057,G061,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: [G022]
failedChecks: []
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 3
exitStatus: 1
verdict: FAIL
```

The post-routing recheck preserves the same two blocker classes. G057 and G061 remain in the
passed-gate inventory. No planning or routing edit created another failed gate.

## Surgical G057 Compatibility Revalidation — 2026-09-01

The exact control-revision-3 packet was validated before repository reads and without preflight.
The current manifest already contained the preceding plan-owned compatibility repair, so this
revalidation did not duplicate or reorder fields. All eight rows retain `id` and carry an adjacent
`scenarioId` with the same value. No scenario, behavior field, test link, receipt, DoD item,
status, certification field, or audit route changed.

### Current-Session Evidence

**Phase:** plan
**Claim Source:** executed

```text
$ timeout 120 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-7ba6dae9325d2fc0ab03ebdac1666fe9 --session-control-file /home/philipk/.local/state/bubbles/repository-binding/vscode-7ba6dae9325d2fc0ab03ebdac1666fe9/repository-binding.json --packet-file /tmp/research-lab-bug025-g057-compatibility-packet.json
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-7ba6dae9325d2fc0ab03ebdac1666fe9:3 revision=3

# BUG-025 G057 exact manifest JSON compatibility
exit: 0
lines: 7
sha256: bf8278f24d05347e64570a3acc80ab63f86e2870fc9c0d8be53d6be38b8a8baa
{
	"declared": 8,
	"rows": 8,
	"canonicalIds": 8,
	"compatibilityIds": 8,
	"mirroredIds": 8
}

# BUG-025 G057 scenario-test resolver recheck
exit: 0
sha256: 13944314bdad890eb9fcb00c3b5c158d924974438c8d6ad0e7c3ab3963e71d03
[scenario-test-resolve] OK — 8 reference(s) resolved via literal-scan; 8 category comparison(s) not applicable (no test-discovery adapter declared)

# BUG-025 G057 scenario-state certifiable recheck
exit: 0
lines: 1576
sha256: 291c313d907f7f45fdd651654bd60ced8cce81acdb33ddb43d71fa2fcab0dee9
SCN-BUG-025-001  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-BUG-025-002  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-BUG-025-003  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-BUG-025-004  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-BUG-025-005  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-BUG-025-006  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-BUG-025-007  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-BUG-025-008  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
(all 1564 refusals are SCS-REVISION-DRIFT: superseded receipts, excluded from derivation, not blocking)
certifiable: yes

# BUG-025 G057 artifact lint recheck
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
Artifact lint PASSED.

# BUG-025 G057 transition diagnostic recheck
exit: 1
lines: 346
sha256: e0bf4c2d5264b542735a656f555cf7bd96326f60b5eeb512207c4f7bca0761ea
passedGateIds: [G057,G061,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: [G022]
failureCount: 3
verdict: FAIL
```

The transition diagnostic confirms that G057 remains closed. Its three failures retain the two
previously identified blocker classes: the stale global input-closure receipts and the absent
required audit phase. The packet therefore remains `in_progress`, with stale-receipt closure
routed before the preserved audit route.

<a name="test-owned-stale-receipt-remediation-2026-09-01"></a>
## Test-Owned Stale-Receipt Remediation — 2026-09-01

The exact actionable control-revision-3 packet was validated before repository reads and without
preflight. This increment read the current append-only receipt log and reran only strict freshness.
It ran no product test and changed no behavior.

### Strict Current-Receipt Freshness

**Phase:** test
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025 stale-receipt remediation strict freshness" -- timeout 300 bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root /home/philipk/research-lab --strict`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 stale-receipt remediation strict freshness
$ timeout 300 bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root /home/philipk/research-lab --strict
exit: 0
lines: 10
sha256: 432a992ea28b8248d0da17e1dcb7450975ddae6b608578da5c249e742432034f
--- output ---
{
	"total": 1672,
	"current": 1592,
	"superseded": 80,
	"withClosure": 17,
	"valid": 17,
	"stale": 0,
	"unknown": 1575,
	"staleReceipts": []
}
```

### Append-Only Receipt Interpretation

**Claim Source:** interpreted
**Interpretation:** The strict result directly closes the stale-receipt class because every current
closure-bearing receipt is valid and the stale set is empty. The current log retains superseded and
unknown entries beside the 17 valid closure-bearing entries. The restored-tree RED identities for
`SCN-BUG-018-011` and `SCN-BUG-018-012` intentionally carry no `inputClosure`. A post-restoration
closure would describe different bytes than those expected-failing runs. They therefore remain
honestly unknown instead of becoming falsely fresh. This remediation neither rewrote nor deleted
the append-only log.

### Finding And Route Disposition

| Finding | Disposition |
| --- | --- |
| `BUG-025-STALE-INPUT-CLOSURE-RECEIPTS` | Addressed. Strict freshness reports 17 valid closure-bearing receipts and zero stale receipts. |
| `BUG-025-ROUTE-029` | Resolved by the current strict freshness receipt. |
| `BUG-025-ROUTE-028` | Preserved as the next route to `bubbles.audit` for independent delivery-completion audit. |

<a name="record-only-audit-findings-2026-09-01"></a>
## Record-Only Audit Findings — 2026-09-01

This record persists the complete findings returned by the three immediately preceding bounded
audit slices. It resolves no finding and does not claim a completed audit phase. No audit, test,
transition, lint, or product command was run for this persistence step, and no surface beyond the
current binding control plus this BUG-025 report and state record was inspected.

### Repository Binding

The current host control record matches the supplied actionable binding exactly:

| Field | Current value |
| --- | --- |
| Decision | `rb:vscode-7ba6dae9325d2fc0ab03ebdac1666fe9:3` |
| Control revision | `3` |
| Repository root | `/home/philipk/research-lab` |
| Repository alias | `research-lab` |
| Transition | `confirmed` |

**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-7ba6dae9325d2fc0ab03ebdac1666fe9 --session-control-file /home/philipk/.local/state/bubbles/repository-binding/vscode-7ba6dae9325d2fc0ab03ebdac1666fe9/repository-binding.json --packet-file /dev/stdin`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-7ba6dae9325d2fc0ab03ebdac1666fe9:3 revision=3
```

No repository-binding preflight ran. The validation did not advance the control revision.

### Carried Receipt Slice

The bounded receipt slice is clean: all `8/8` scenario chains are complete, all `17/17` current
closure-bearing receipts are valid, and the stale-receipt count is zero. This is carried slice
output, not a new execution claim from this record-only step.

### Unresolved Findings

| Finding | Severity | Complete finding |
| --- | --- | --- |
| `AUDIT-025-EVIDENCE-001` | High | Validate reconciliation metadata assertions need command-bound current-revision evidence. |
| `AUDIT-025-SLICE-002` | Medium | Audit needs full scope and certification mirrors plus complete claim chronology in a later full read. |
| `AUDIT-025-DOD-003` | High | DoD row 15 needs current boundary evidence after the later packet and map changes. |
| `AUD-BUG025-001` | High | The embedded-refusal focus proof checks only that the alert lacks focus. It must assert the exact normal initial focus and kill a focus-theft mutation. |
| `AUD-BUG025-002` | High | The alert recorder deduplicates identical states, so duplicate announcements can collapse. It must count every non-empty alert update and kill a duplicate-announcement mutation. |
| `AUD-BUG025-003` | High | `SCN-BUG-025-006` declares a subject-acceptance mutation, but the controlled-break map disables `eventsPathFor`. The exact negative control and mechanism must align without weakening behavior. |
| `AUD-BUG025-004` | High | The controlled-break map is admitted by scopes, while the design closed boundary still says no new file. Design must explicitly admit this bug-specific map while protecting the generic runner and sibling maps. |

All seven findings remain unresolved. The delivery audit outcome is `route_required`, and no
ship-ready verdict is issued.

### Required Owner Sequence

1. `bubbles.design` must reconcile the closed delivery boundary with the BUG-025 map and define
	the exact focus, announcement, and `SCN-BUG-025-006` fidelity contract.
2. `bubbles.plan` must align scope, scenario-manifest, map mechanism, mutations, and evidence rows.
3. `bubbles.test` must strengthen the focus and announcement carriers and execute discriminating
	focus-theft, duplicate-announcement, and exact scenario-mechanism negative controls.
4. `bubbles.implement` must refresh current boundary and delta evidence after the packet and map
	reconciliation without claiming an isolated commit that does not exist.
5. `bubbles.validate` must obtain command-bound current-revision reconciliation evidence and
	re-adjudicate row 15 plus the affected state mirrors.
6. `bubbles.audit` must perform the full scope, certification, and claim-chronology read and
	independently recheck all seven findings.

`BUG-025-ROUTE-028` stays open for the audit recheck. `BUG-025-ROUTE-030` carries the ordered
rework chain, with `bubbles.design` as the immediate next owner. Scope 1 remains `Done`, all fifteen
DoD rows remain checked, and both top-level and certification status remain `in_progress`.

## Spot-Check Recommendations

1. Verify that the design amendment admits only the BUG-025 map and does not widen the generic
	controlled-break runner or sibling-map boundary.
2. Inspect the repaired focus carrier to confirm it names the exact expected initial focus and
	fails when a mutation moves focus to the alert.
3. Inspect the repaired alert recorder to confirm every non-empty live-region update is counted
	and an identical duplicate announcement fails the mutation control.
4. Compare `SCN-BUG-025-006`, its map entry, and its linked test after planning to ensure all three
	name the same owning mechanism and negative control.
5. Recheck row 15 against the post-reconciliation packet and map bytes rather than relying on the
	earlier boundary epoch.

<a name="audit-rework-design-reconciliation-2026-09-01"></a>
## Audit Rework Design Reconciliation — 2026-09-01

### Exact Repository Binding

**Phase:** bootstrap
**Command:** `timeout 60 printf '%s\n' '<exact supplied actionable packet>' | timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-7ba6dae9325d2fc0ab03ebdac1666fe9 --session-control-file /home/philipk/.local/state/bubbles/repository-binding/vscode-7ba6dae9325d2fc0ab03ebdac1666fe9/repository-binding.json --packet-file /dev/stdin`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-7ba6dae9325d2fc0ab03ebdac1666fe9:3 revision=3
```

The exact supplied packet was validated before repository reads.
No repository-binding preflight ran, and the control revision remained `3`.

### Initial Embedded-Refusal Focus Observation

**Phase:** bootstrap
**Command:** `timeout 120 node --input-type=module -e '<load the current route through tests/provider-credentials.support.mjs, mutate only the embedded event path in memory, open system Chrome, and print document.activeElement identity after C025-CONFIG-SCHEMA refusal>'`
**Exit Code:** 0
**Claim Source:** executed

```text
{
	"activeElementIsBody": true,
	"activeElementTag": "body",
	"activeElementId": null,
	"refusalCode": "C025-CONFIG-SCHEMA",
	"runStatus": "refused"
}
```

The design now requires the direct identity assertion
`document.activeElement === document.body` for initial embedded refusal.
The served-refusal carrier retains its exact `#subject-input` focus assertion.

### Reconciled Design Contract

The active design now admits `scripts/scenario-break-map-bug025.json` as the sole bug-specific
declarative controlled-break mechanism. The generic `scripts/scenario-receipts.mjs` runner and
every sibling break map remain protected controls. The earlier no-new-file rule now excludes only
this admitted map and continues to forbid every other new file or capability.

The embedded-refusal carrier must count each non-empty alert content-mutation record.
It must not collapse identical successive records by comparing final state.
Attribute changes, empty content, and unrelated document mutations do not increment the count.
Both production refusal carriers require exactly one qualifying alert update.

One bounded route mutant focuses `#subject-input` after revealing the embedded-refusal alert.
It must fail only the exact `document.body` focus assertion without a runtime error.
Another bounded route mutant repeats the same non-empty alert text assignment.
It must fail only the exact one-update assertion without changing final visible state.

The `SCN-BUG-025-006` negative control now mutates the canonical subject-rejection guard inside
`readEventSource()`. It makes `company:msft` fail the existing canonical-subject predicate.
It must not suppress `eventsPathFor()` or weaken the path-equality guard.

These changes strengthen existing proof contracts for `SCN-BUG-025-006` through
`SCN-BUG-025-008`. They preserve all eight business scenarios and all fifteen DoD rows.
No product behavior, source, persistent test, map, scope, scenario manifest, DoD, certification,
or user-validation content changed in this design phase.

### Finding Accounting And Owner Route

| Finding | Design disposition | Remaining owner |
| --- | --- | --- |
| `AUDIT-025-EVIDENCE-001` | Open and unchanged. Design does not own validate reconciliation evidence. | `bubbles.validate` |
| `AUDIT-025-SLICE-002` | Open and unchanged. The independent audit still owes the full chronology read. | `bubbles.audit` |
| `AUDIT-025-DOD-003` | Open and unchanged. Row 15 needs a post-reconciliation boundary receipt. | `bubbles.implement` |
| `AUD-BUG025-001` | Open. The design now names exact body focus and a discriminating focus-theft mutant. The carrier remains unchanged. | `bubbles.plan`, then `bubbles.test` |
| `AUD-BUG025-002` | Open. The design now defines event-level non-empty update counting and a duplicate-update mutant. The carrier remains unchanged. | `bubbles.plan`, then `bubbles.test` |
| `AUD-BUG025-003` | Open. The design now requires the actual subject-acceptance mutation. The manifest and map remain unchanged. | `bubbles.plan` |
| `AUD-BUG025-004` | Partially addressed. The design contradiction is removed. Cross-artifact reconciliation and audit confirmation remain open. | `bubbles.plan`, then `bubbles.audit` |

`BUG-025-ROUTE-028` remains open for the final independent audit.
`BUG-025-ROUTE-030` remains open and now routes its planning reconciliation to `bubbles.plan`.
Planning must align the existing scope, scenario manifest, and break map with this design.
It must preserve Scope 1 as `Done`, all fifteen checked DoD rows, and both `in_progress` status mirrors.

<a name="audit-rework-planning-reconciliation-2026-09-01"></a>
## Audit Rework Planning Reconciliation — 2026-09-01

### Summary

Planning reconciled the existing `SCN-BUG-025-006` through `SCN-BUG-025-008` proof contracts.
The eight scenario ids, eight titles, eight linked tests, twelve Test Plan rows, and fifteen DoD
rows remain unchanged. Scope 1 is now `In Progress`. Rows 9 through 11 are unchecked because the
historical receipts predate the strengthened controls.

`SCN-BUG-025-006` now mutates the unique current canonical-subject predicate inside
`readEventSource()`. It no longer disables `eventsPathFor()` lookup. `SCN-BUG-025-007` now
requires direct `document.activeElement === document.body` identity and a focus-theft mutant that
focuses `#subject-input`. `SCN-BUG-025-007` and `SCN-BUG-025-008` now count every non-empty
live-region content update without deduplication and require a duplicate-announcement mutant that
fails only the update-count assertion.

The scope and design both admit only `scripts/scenario-break-map-bug025.json`. The generic
`scripts/scenario-receipts.mjs` runner and every sibling break map remain protected controls.
No production file, persistent test, user-validation record, generic runner, or sibling map was
edited or executed by this planning action.

### Exact Repository Binding

**Phase:** plan
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-7ba6dae9325d2fc0ab03ebdac1666fe9 --session-control-file /home/philipk/.local/state/bubbles/repository-binding/vscode-7ba6dae9325d2fc0ab03ebdac1666fe9/repository-binding.json --packet-file /tmp/research-lab-bug025-planning-packet-vscode-7ba6dae9325d2fc0ab03ebdac1666fe9-r3.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-7ba6dae9325d2fc0ab03ebdac1666fe9:3 revision=3
```

The exact supplied packet was validated against the current control file before repository reads.
No repository-binding preflight ran.

### Planning Guards And Scenario Resolver

**Phase:** plan
**Commands:**

- `timeout 60 grep -cE '^- \[ \]' specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md`
- `timeout 60 grep -cE '^\| (Unit regression|Scenario-specific Regression E2E|Security adversarial unit regression|Security canonical Regression E2E|Security embedded-refusal Regression E2E|Security served-refusal Regression E2E|Security contract regression|Served-configuration scenario and broader E2E regression|Repository regression) ' specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md`
- `timeout 60 grep -c '"id": "SCN-BUG-025-' specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json`
- `timeout 60 grep -c '"scenarioId": "SCN-BUG-025-' specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json`
- `timeout 60 grep -Fc '            if (subjectMatch === null) {' rlcompanyintel.js`
- `timeout 60 grep -Fc '"find": "            if (subjectMatch === null) {"' scripts/scenario-break-map-bug025.json`
- `timeout 300 bash .github/bubbles/scripts/scenario-obligation-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
- `timeout 300 bash .github/bubbles/scripts/test-mechanism-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
- `timeout 300 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .`
- `timeout 300 bash .github/bubbles/scripts/scope-context-fit-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
- `timeout 300 bash .github/bubbles/scripts/vertical-delivery-plan-guard.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
- `timeout 300 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --verbose`

**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 audit rework planning guards and scenario resolver
exit: 0
lines: 47
sha256: bbfe9b453fae175f2ae0fd8bb408cc634c7b10db430f507dd99270fd95083b7f
--- first 20 ---
unchecked_dod_rows=3
test_plan_rows=12
scenario_ids=8
scenario_id_aliases=8
canonical_subject_source_snippets=1
canonical_subject_map_snippets=1
[scenario-obligation-lint] OK — 8 scenario(s) with a coherent derived obligation matrix
[test-mechanism-lint] OK — 5 declared mechanism(s) coherent with their scenario traits
[mutation-receipt] OK — mutationExecution adapter is none (inert)
[scenario-test-resolve] OK — 8 reference(s) resolved via literal-scan; 8 category comparison(s) not applicable (no test-discovery adapter declared)
[scope-context-fit-lint] OK — all 1 scope(s) are self-contained (no chat/session-replay dependency); a fresh specialist can execute from the durable artifacts.
[vertical-delivery-plan-guard] OK — first usable increment is early (scope 1 of 1); no horizontal chain; within scope budget.
ℹ️  INFO: Resolved 7 implementation file(s) to scan
--- omitted 7 line(s); sha256 above covers the full output ---
--- last 20 ---
--- Scan 4: Prohibited Simulation Helpers in Production ---
--- Scan 5: Default/Fallback Value Patterns ---
--- Scan 6: Live-System Test Interception ---
--- Scan 7: IDOR / Auth Bypass Detection (Gate G047) ---
--- Scan 8: Silent Decode Failure Detection (Gate G048) ---
============================================================
	IMPLEMENTATION REALITY SCAN RESULT
============================================================
	Files scanned:  7
	Violations:     0
	Warnings:       0
🟢 PASSED: No source code reality violations detected
```

### Artifact Lint

**Phase:** plan
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 audit rework planning artifact lint' -- timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 audit rework planning artifact lint
$ timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
✅ report.md contains section matching: Summary
✅ report.md contains section matching: Completion Statement
✅ report.md contains section matching: Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ Value-first selection rationale lint skipped (not a value-first report)
✅ Scenario path-placeholder lint skipped (no matching scenario sections found)
=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
=== End Anti-Fabrication Checks ===
Artifact lint PASSED.
```

### Finding Accounting And Owner Route

| Finding | Planning disposition | Remaining owner |
| --- | --- | --- |
| `AUDIT-025-EVIDENCE-001` | Preserved. Planning created the validate prerequisite route but did not supply validate-owned evidence. | `bubbles.validate` |
| `AUDIT-025-SLICE-002` | Preserved. Planning did not claim the full independent audit read. | `bubbles.audit` |
| `AUDIT-025-DOD-003` | Preserved. Row 15 still needs current boundary evidence after packet, map, and persistent carrier changes. | `bubbles.implement` |
| `AUD-BUG025-001` | Planning portion addressed. Scope and scenario metadata require exact body focus and a focus-theft mutation. Persistent carrier changes and execution remain open. | `bubbles.test` |
| `AUD-BUG025-002` | Planning portion addressed. Embedded and served refusal contracts require every non-empty alert update to count without deduplication and a duplicate-announcement mutation. Persistent carrier changes and execution remain open. | `bubbles.test` |
| `AUD-BUG025-003` | Planning portion addressed. The manifest and map now target the unique current `readEventSource()` canonical-subject predicate and preserve the current linked title. RED/GREEN execution remains open. | `bubbles.test` |
| `AUD-BUG025-004` | Planning portion addressed. Design, scope, manifest, and map agree on sole map admission and generic-runner plus sibling-map protection. Independent confirmation remains open. | `bubbles.audit` |

### Routing And Non-Terminal State

`BUG-025-ROUTE-031` routes validate-owned mirror reconciliation first. Validation must remove Scope
1 from `certification.completedScopes` and record non-terminal progress as twelve checked and three
unchecked rows. It must keep both status mirrors `in_progress` and must not certify.

`BUG-025-ROUTE-032` then routes persistent carrier changes and every canonical-subject,
focus-theft, and duplicate-announcement RED/GREEN execution to `bubbles.test`. After test evidence,
`bubbles.implement` owns row 15 boundary refresh, `bubbles.validate` owns current command-bound
re-adjudication, and `bubbles.audit` owns the full seven-finding recheck under the preserved
`BUG-025-ROUTE-028` route.

### Completion Statement

The planning-owned reconciliation is complete. Delivery is not complete. No product or test
command was run, no production or persistent test byte changed, three DoD rows remain unchecked,
Scope 1 remains `In Progress`, both status mirrors remain `in_progress`, and certification remains
validate-owned.

<a name="validate-owned-nonterminal-mirror-reconciliation-2026-09-01"></a>
## Validate-Owned Nonterminal Mirror Reconciliation — 2026-09-01

### Exact Repository Binding

**Phase:** validate
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-7ba6dae9325d2fc0ab03ebdac1666fe9 --session-control-file /home/philipk/.local/state/bubbles/repository-binding/vscode-7ba6dae9325d2fc0ab03ebdac1666fe9/repository-binding.json --packet-file /tmp/research-lab-bug025-route031-repository-packet-vscode-7ba6dae9325d2fc0ab03ebdac1666fe9.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-7ba6dae9325d2fc0ab03ebdac1666fe9:3 revision=3
```

The exact supplied packet was validated against the current control file before repository reads.
No repository-binding preflight ran, and the control revision remained `3`.

### JSON, Progress, Routing, And Finding Reconciliation

**Phase:** validate
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 route 031 durable final JSON reconciliation' -- timeout 180 node --input-type=module -e 'import fs from "node:fs";const d="specs/_bugs/BUG-025-company-corpus-read-never-settles";const s=JSON.parse(fs.readFileSync(`${d}/state.json`,"utf8"));const m=fs.readFileSync(`${d}/scopes.md`,"utf8");const r=Object.fromEntries(s.transitionRequests.map(x=>[x.id,x]));const p=s.certification.scopeProgress.find(x=>x.scopeId==="01-declare-and-enforce-one-read-bound");const i=s.execution.scopeInventory.find(x=>x.scopeId==="01-declare-and-enforce-one-read-bound");const f=s.reworkQueue.filter(x=>x.status==="open").map(x=>x.id);const expected=["AUDIT-025-EVIDENCE-001","AUDIT-025-SLICE-002","AUDIT-025-DOD-003","AUD-BUG025-001","AUD-BUG025-002","AUD-BUG025-003","AUD-BUG025-004"];const out={scopeStatus:/\*\*Status:\*\* In Progress/.test(m)?"In Progress":"mismatch",dodChecked:(m.match(/^- \[x\]/gm)||[]).length,dodUnchecked:(m.match(/^- \[ \]/gm)||[]).length,status:s.status,certificationStatus:s.certification.status,completedScopes:s.certification.completedScopes,scopeProgress:p,scopeInventoryStatus:i?.status,nextOwner:s.execution.nextRequiredOwner,nextTarget:s.execution.nextRequiredTarget,route031:{status:r["BUG-025-ROUTE-031"]?.status,resolvedBy:r["BUG-025-ROUTE-031"]?.resolvedBy,resolutionEvidenceRef:r["BUG-025-ROUTE-031"]?.resolutionEvidenceRef},route032:{status:r["BUG-025-ROUTE-032"]?.status,owner:r["BUG-025-ROUTE-032"]?.nextRequiredOwner},openAuditRoutes:[r["BUG-025-ROUTE-028"]?.status,r["BUG-025-ROUTE-030"]?.status],openFindings:f,auditAttemptFindingCount:s.execution.audit.attempts[0].unresolvedFindings.length,latestHistoryAgent:s.executionHistory.at(-1)?.agent};const ok=out.scopeStatus==="In Progress"&&out.dodChecked===12&&out.dodUnchecked===3&&out.status==="in_progress"&&out.certificationStatus==="in_progress"&&out.completedScopes.length===0&&p?.status==="in_progress"&&p?.dodChecked===12&&p?.dodUnchecked===3&&i?.status==="In Progress"&&out.nextOwner==="bubbles.test"&&out.nextTarget==="BUG-025-ROUTE-032"&&out.route031.status==="resolved"&&out.route031.resolvedBy==="bubbles.validate"&&out.route031.resolutionEvidenceRef==="report.md#validate-owned-nonterminal-mirror-reconciliation-2026-09-01"&&out.route032.status==="open"&&out.route032.owner==="bubbles.test"&&out.openAuditRoutes.every(x=>x==="open")&&JSON.stringify(f)===JSON.stringify(expected)&&out.auditAttemptFindingCount===7&&out.latestHistoryAgent==="bubbles.validate";console.log(JSON.stringify(out,null,2));console.log(`reconciliation=${ok?"PASS":"FAIL"}`);if(!ok)process.exit(1);'`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 route 031 durable final JSON reconciliation
exit: 0
lines: 42
sha256: 7fd29bc6ca0d0c6034163be2b08340be65d0e4f73f6d023cac019d6777a613a1
--- first 20 ---
{
	"scopeStatus": "In Progress",
	"dodChecked": 12,
	"dodUnchecked": 3,
	"status": "in_progress",
	"certificationStatus": "in_progress",
	"completedScopes": [],
	"scopeProgress": {
		"scopeId": "01-declare-and-enforce-one-read-bound",
		"status": "in_progress",
		"dodChecked": 12,
		"dodUnchecked": 3
	},
	"scopeInventoryStatus": "In Progress",
	"nextOwner": "bubbles.test",
	"nextTarget": "BUG-025-ROUTE-032",
	"route031": {
		"status": "resolved",
		"resolvedBy": "bubbles.validate",
		"resolutionEvidenceRef": "report.md#validate-owned-nonterminal-mirror-reconciliation-2026-09-01"
--- omitted 2 line(s); sha256 above covers the full output ---
--- last 20 ---
		"status": "open",
		"owner": "bubbles.test"
	},
	"openAuditRoutes": [
		"open",
		"open"
	],
	"openFindings": [
		"AUDIT-025-EVIDENCE-001",
		"AUDIT-025-SLICE-002",
		"AUDIT-025-DOD-003",
		"AUD-BUG025-001",
		"AUD-BUG025-002",
		"AUD-BUG025-003",
		"AUD-BUG025-004"
	],
	"auditAttemptFindingCount": 7,
	"latestHistoryAgent": "bubbles.validate"
}
reconciliation=PASS
```

The assertion parsed the current state as JSON and compared the certification mirror directly
with the Scope 1 artifact. It also required both audit routes and all seven findings to remain
open while `BUG-025-ROUTE-031` became resolved and `BUG-025-ROUTE-032` became the active route.

### Focused Scope Progress Parity

**Phase:** validate
**Command:** `timeout 180 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 route 031 focused scope progress parity' -- timeout 120 node scripts/validate-scope-dod-progress.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
[scope-dod-progress] packets=72 claims=95 agree=81 drift=14 unresolved=0 baseline=14 new=0 stale=0
[scope-dod-progress] OK — no new DoD progress drift
```

### Repository Selftest

**Phase:** validate
**Command:** `timeout 1260 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 route 031 repository selftest after mirror reconciliation' -- timeout 1200 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 route 031 repository selftest after mirror reconciliation
$ timeout 1200 node scripts/selftest.mjs
exit: 0
lines: 3912
sha256: 90a3a0dcc0a12f2c160f801f4cec1999e78a81c7c9f22f3064ad8984b802d906
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

Feature 004 RLFX/RLDATA foundation
	✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
	✓ RLFX universe is bounded closed and asserts no live source authorization
	✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
	✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
	✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
	✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3872 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
	✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
	✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
	✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
	✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
	✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (95 claim(s) across 72 packet(s), 81 agreeing, baseline 14 entries)
	✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 95 claim(s))
	✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
	✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
	✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
	✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3443 passed, 0 failed
================================================
```

### Artifact Lint

**Phase:** validate
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-025 route 031 artifact lint after reconciliation' -- timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025 route 031 artifact lint after reconciliation
$ timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
✅ report.md contains section matching: Summary
✅ report.md contains section matching: Completion Statement
✅ report.md contains section matching: Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ Value-first selection rationale lint skipped (not a value-first report)
✅ Scenario path-placeholder lint skipped (no matching scenario sections found)
=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
=== End Anti-Fabrication Checks ===
Artifact lint PASSED.
```

### Finding Accounting And Route Disposition

`BUG-025-ROUTE-031` is resolved. Scope 1 is absent from
`certification.completedScopes`, and its validate-owned progress mirror is `in_progress` with
twelve checked and three unchecked rows. The top-level and certification status mirrors remain
`in_progress`. The execution scope inventory already matched `In Progress`, so its status was not
changed.

`BUG-025-ROUTE-032` is the active route to `bubbles.test`. `BUG-025-ROUTE-028` and
`BUG-025-ROUTE-030` remain open. The audit attempt and rework queue still carry all seven findings:
`AUDIT-025-EVIDENCE-001`, `AUDIT-025-SLICE-002`, `AUDIT-025-DOD-003`, `AUD-BUG025-001`,
`AUD-BUG025-002`, `AUD-BUG025-003`, and `AUD-BUG025-004`.

No source, test, controlled-break map, scope, scenario manifest, design, user-validation artifact,
or DoD checkbox changed. This is non-terminal mirror reconciliation, not certification.

<a name="test-owned-audit-route-032-closure-2026-09-01"></a>
## Test-Owned Audit Route 032 Closure — 2026-09-01

The exact actionable Research Lab packet at decision
`rb:vscode-7ba6dae9325d2fc0ab03ebdac1666fe9:4` and control revision `4` was
validated before this closure read repository files. No repository-binding preflight ran. This
record uses the already-completed current-session executions and does not replay a long test.

### Repository Binding

**Phase:** test
**Command:** `timeout 60 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-7ba6dae9325d2fc0ab03ebdac1666fe9 --session-control-file /home/philipk/.local/state/bubbles/repository-binding/vscode-7ba6dae9325d2fc0ab03ebdac1666fe9/repository-binding.json --packet-file /tmp/research-lab-bug025-route032-test-binding-packet-vscode-7ba6dae9325d2fc0ab03ebdac1666fe9-r4.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-7ba6dae9325d2fc0ab03ebdac1666fe9:4 revision=4
```

### Current-Session Bounded Capture Index

**Phase:** test
**Claim Source:** executed

The persisted session transcript supplies the exact invocations and successful tool completions.
The current structured tool-call ledger independently records the direct workloads, exit codes,
and input closures. The SHA-256 values below are the full-output hashes emitted by the bounded
capture wrapper during those current-session executions.

| Captured workload | Executed command | Exit | Direct result | Full-output SHA-256 |
| --- | --- | ---: | --- | --- |
| Focus-theft and duplicate-announcement mutation controls | `timeout 180 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Mutation control: embedded refusal focus theft|Mutation control: embedded and served refusal duplicate announcement" --reporter=list` | 0 | 2 passed | `c78a1c3f36d095fa3fe85cb59b831bd2b6e0b9b4ed34234ca321c654ba86ce68` |
| Complete BUG-025 browser selection | `timeout 840 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BUG-025" --reporter=list` | 0 | 14 passed | `de4e58da6962e1e46a9ef2584b43672e4e5cd8ba5061f1f6003f1f9aac8a534b` |
| Complete Company Intelligence browser suite | `timeout 1140 npx --no-install playwright test tests/company-intelligence-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | 0 | 58 passed | `fdd69ae4b93902e7b3699cc8ba7a2102c5c619f60ca4f45bf9ce0a1cabe28e4e` |
| Company Intelligence unit suite | `timeout 240 node --test tests/company-intelligence.unit.mjs` | 0 | 110 passed | `d88ba13c8e171ec0c69436dab80d283dc4f55cd5aeec219b28a3e01b9f97da95` |
| Repository selftest | `timeout 1200 node scripts/selftest.mjs` | 0 | 3443 passed | `5c93f1ba0974e5c8ba40fa264081058ca2e36151075cb443de8430364e39b296` |
| Bugfix regression-quality guard | `timeout 120 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/company-intelligence-lab.spec.mjs` | 0 | 0 violations; 0 warnings | `1e7798a723543f0b4f2e0edd81c299f0bfabfe0757aa1064659f6846b14e1bae` |
| Strict receipt freshness | `timeout 360 bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root /home/philipk/research-lab --strict` | 0 | 32 valid; 0 stale | `393a2edf1a55b20aae43c3ff53aa40263fda450dcfbabbfc7d15edb49500f281` |
| Scenario-test resolver | `timeout 240 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --repo-root .` | 0 | 8 references resolved | `13944314bdad890eb9fcb00c3b5c158d924974438c8d6ad0e7c3ab3963e71d03` |
| Scenario-state resolver | `timeout 240 bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/_bugs/BUG-025-company-corpus-read-never-settles --require RED_VERIFIED --require IMPLEMENTED --require GREEN_TARGETED --require GREEN_LIVE --require REGRESSION_GREEN --require OBSERVED --certifiable` | 0 | All 8 scenarios regression-green; certifiable yes | `291c313d907f7f45fdd651654bd60ced8cce81acdb33ddb43d71fa2fcab0dee9` |
| Implementation-reality scan | `timeout 360 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-025-company-corpus-read-never-settles --verbose` | 0 | 7 files; 0 violations; 0 warnings | `8c42d47ae704040365670e359c436748051343b225987b63352e5d686ee9cf32` |
| Artifact lint before route accounting | `timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles` | 0 | Artifact lint passed | `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567` |

### Canonical Affected-Scenario Receipt Campaign

**Phase:** test
**Command:** `timeout 1200 node scripts/scenario-receipts.mjs --spec specs/_bugs/BUG-025-company-corpus-read-never-settles --map scripts/scenario-break-map-bug025.json --scenarios SCN-BUG-025-006,SCN-BUG-025-007,SCN-BUG-025-008 --quiet-child --agent bubbles.test`
**Exit Code:** 0
**Claim Source:** executed

The append-only ledger lines 1673–1702 contain two isolated current-session campaigns. Lines
1688–1702 are the latest canonical equivalents. Each scenario has the required expected-red,
implementation receipt, targeted green, live green, and broad regression receipt. The expected
RED commands exit `1`; every other phase exits `0`. The latest isolated checkout is
`/tmp/rl-scenario-receipts-Zuk52Q`.

| Ledger line | Scenario | Phase | Exit | stdout SHA-256 |
| ---: | --- | --- | ---: | --- |
| 1688 | `SCN-BUG-025-006` | RED | 1 | `9b2461f1361d9ca04c36b3a76742d89b0863de2999f4b8670b4882f74a30fd97` |
| 1689 | `SCN-BUG-025-006` | implement | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 1690 | `SCN-BUG-025-006` | GREEN | 0 | `fc3cbdf3513fd70971cfa3584567f5c9acb3431eea3b3902cb2a60bc0995bff1` |
| 1691 | `SCN-BUG-025-006` | live | 0 | `aa53c3989d9702bdf1cd8782d736b4e8bed4c6aaa718b05020b9ed2f3dbcc92d` |
| 1692 | `SCN-BUG-025-006` | regression | 0 | `df4268b8de0cfa5aabea0d39750ecffdd788a709d38c70e9ff04328c91f96920` |
| 1693 | `SCN-BUG-025-007` | RED | 1 | `3a775840cd08e796d177841ad866b374aecf121156a3bad54b88f3000b1441ed` |
| 1694 | `SCN-BUG-025-007` | implement | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 1695 | `SCN-BUG-025-007` | GREEN | 0 | `3c59c45c9e0710b9f02d0834ad411995f6960b4247fe6177b414323ecc358e45` |
| 1696 | `SCN-BUG-025-007` | live | 0 | `6b1960a948b7fcaf44d2a8afdf71eff0cd13bd85a89e0e892aa2872a1e24e732` |
| 1697 | `SCN-BUG-025-007` | regression | 0 | `0f0bf393a8112678054394b2ff297596aac4cc43bb635b9006ec41a72eb3b518` |
| 1698 | `SCN-BUG-025-008` | RED | 1 | `4cb98098dc5a57d444bee92be1af37ded9662291031e10e8faf45e3ca9c75a00` |
| 1699 | `SCN-BUG-025-008` | implement | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| 1700 | `SCN-BUG-025-008` | GREEN | 0 | `fb0599702f3e9f20e397dd64b3d93a1e9ce5226658d9bf96a6ab9f66f931edb6` |
| 1701 | `SCN-BUG-025-008` | live | 0 | `2756a44647fe7aad3d96bef8a92a3d6bb51867b8b9c9e4a4d2374bc8c728e0df` |
| 1702 | `SCN-BUG-025-008` | regression | 0 | `8656a5a51dd0344a67a9492ff2593a2ee478084e20d81975e09c6edcf3b058d0` |

### Finding Accounting And Route Disposition

| Finding | Current disposition |
| --- | --- |
| `AUD-BUG025-001` | Addressed and resolved. The persistent embedded-refusal carrier asserts exact `document.body` focus, and the bounded focus-theft mutant is discriminating. |
| `AUD-BUG025-002` | Addressed and resolved. The persistent carrier counts every non-empty child-list or character-data live-region update without deduplication, and the duplicate-announcement mutant is discriminating. |
| `AUD-BUG025-003` | Addressed and resolved. The current isolated campaign mutates the exact canonical-subject predicate and records the expected RED plus green, live, and regression receipts. |
| `AUDIT-025-EVIDENCE-001` | Open under validate ownership. |
| `AUDIT-025-SLICE-002` | Open under audit ownership. |
| `AUDIT-025-DOD-003` | Open under implementation ownership for current post-repair boundary evidence. |
| `AUD-BUG025-004` | Open under audit ownership for independent boundary confirmation. |

`BUG-025-ROUTE-032` is resolved by this evidence. The next owner is `bubbles.implement` for
`AUDIT-025-DOD-003`. Scope status, DoD checkboxes, top-level status, and `certification.*` remain
unchanged. No production, configuration, note, persistent test, controlled-break map, scenario
manifest, design, user-validation, generic-runner, sibling-map, or unrelated file is changed by
this record.

<a name="implementation-owned-post-repair-boundary-2026-09-01"></a>
## Implementation-Owned Post-Repair Boundary — 2026-09-01

This checkpoint records the current post-repair boundary at HEAD
`4c9f2e87b9738eece50c2f0f5b987046ee6ce7a8`. It changes no product or test behavior.
It makes no isolated-commit claim because the BUG-025 delivery remains in the working tree.

### Exact Repository Binding

**Phase:** implement
**Command:** `cd /home/philipk/research-lab && timeout 120 bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-7ba6dae9325d2fc0ab03ebdac1666fe9 --session-control-file /home/philipk/.local/state/bubbles/repository-binding/vscode-7ba6dae9325d2fc0ab03ebdac1666fe9/repository-binding.json --packet-file /tmp/research-lab-bug025-audit025dod003-binding-packet-vscode-7ba6dae9.json`
**Exit Code:** 0
**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=/home/philipk/research-lab decision=rb:vscode-7ba6dae9325d2fc0ab03ebdac1666fe9:4 revision=4
```

The exact supplied packet was validated before repository reads. No repository-binding preflight
ran. The `bugfix-fastlane` mode inherits `statusCeiling: done`, so this record-only implementation
checkpoint is permitted.

### Protected And Admitted Content Identities

**Phase:** implement
**Command:**

```text
cd /home/philipk/research-lab && timeout 60 sha256sum --check <<< $'937dffcc2c78cf29e77d280f93c39c0a38c057e3035f60966f8582f1f3d4dded  company-intelligence.config.json\n45ccdaa81ceec2b645e8203c63eab59b02fb7daace5cb1650e8b61691a1a76b8  company-intelligence-lab.html\ncafb9c69f16646a5e21f880f966a7a1974097e9a32df149cfeb151cf741301b7  rlcompanyintel.js\n402f3ba7eb0996c6849a1cb313d88034973bc0337151b23f253258d32c2341bd  tests/company-intelligence.unit.mjs\n829fb8512bf5430106318aaeb21e562504b0a8e39b4ca8b48ab9e4e8ca11e60a  scripts/selftest.mjs\n8410619a0bdc45e5139c8fe5a809841e45c5dd03971af4a33586d80a0a5220f4  notes/company-intelligence-lab.md\n4004f960d240d1a86557e1fc5220d6d99909d28c089c1eeea78ef2c7de25a68d  specs/_bugs/BUG-025-company-corpus-read-never-settles/bug.md\n37991d996e57a06857bb86fa9a3ad2c4512972a27599920dbfa8fa6833d1c89c  specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md\n0d8d4480c584133ea21716d52b703fabaf78add4ec48903ba1823cca7bc7dc00  specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md\n2d03ea21025c8dfd4938d53d9cfe1d76f721add78e8f06e8cfc69a17b1a39af4  data/company-intelligence/company-msft/events.json\n5b8e2c7acb4dcd03c08a0936836dfb1ae828028299033af3f1ef2e3c9526eab4  tests/company-intelligence-lab.spec.mjs\n0fda8d898ee89085f89798bcb8a738e419565928b0d508eeb1a01ab053693e80  scripts/scenario-break-map-bug025.json'
```

**Exit Code:** 0
**Claim Source:** executed

```text
company-intelligence.config.json: OK
company-intelligence-lab.html: OK
rlcompanyintel.js: OK
tests/company-intelligence.unit.mjs: OK
scripts/selftest.mjs: OK
notes/company-intelligence-lab.md: OK
specs/_bugs/BUG-025-company-corpus-read-never-settles/bug.md: OK
specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md: OK
specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md: OK
data/company-intelligence/company-msft/events.json: OK
tests/company-intelligence-lab.spec.mjs: OK
scripts/scenario-break-map-bug025.json: OK
```

The first ten checks match the pre-audit-rework identities recorded in this report. They include
the protected production, unit, functional, documentation, packet, and event-data controls.
The final two checks match the admitted current behavioral-proof identities.

| Boundary class | Current result |
| --- | --- |
| Protected production and control identities | All ten expected SHA-256 values match. These working-tree paths are not audit-rework deltas. |
| Admitted persistent browser proof | `tests/company-intelligence-lab.spec.mjs` matches `5b8e2c7acb4dcd03c08a0936836dfb1ae828028299033af3f1ef2e3c9526eab4`. |
| Admitted BUG-025 controlled-break map | `scripts/scenario-break-map-bug025.json` matches `0fda8d898ee89085f89798bcb8a738e419565928b0d508eeb1a01ab053693e80`. |
| Authorized packet deltas | `design.md`, `scopes.md`, and `scenario-manifest.json` are planning records. `report.md` and `state.json` are evidence and routing records. |
| Protected packet records | `bug.md`, `spec.md`, and `uservalidation.md` retain their pre-audit-rework identities. |

### Generic Runner And Sibling Map Protection

**Phase:** implement
**Command:** `cd /home/philipk/research-lab && printf '%s\n' 'dynamic-map-inventory:' && timeout 60 find scripts -maxdepth 1 -type f -name 'scenario-break-map-*.json' -print && printf '%s\n' 'working-tree-control-objects:' && timeout 60 git hash-object scripts/scenario-receipts.mjs scripts/scenario-break-map-015.json && printf '%s\n' 'head-control-objects:' && timeout 60 git rev-parse HEAD:scripts/scenario-receipts.mjs HEAD:scripts/scenario-break-map-015.json && printf '%s\n' 'all-runner-map-status:' && timeout 60 git status --short --untracked-files=all -- scripts/scenario-receipts.mjs scripts/scenario-break-map-*.json && timeout 60 git diff --exit-code HEAD -- scripts/scenario-receipts.mjs 'scripts/scenario-break-map-*.json' ':(exclude)scripts/scenario-break-map-bug025.json' && printf '%s\n' 'generic-runner-and-sibling-map-head-equality: PASS'`
**Exit Code:** 0
**Claim Source:** executed

```text
dynamic-map-inventory:
scripts/scenario-break-map-bug025.json
scripts/scenario-break-map-015.json
working-tree-control-objects:
fa7dbfe93834906dc616dc1ba12ab4a187c29730
3934f14cf34809283555f52a0125a990cac4516b
head-control-objects:
fa7dbfe93834906dc616dc1ba12ab4a187c29730
3934f14cf34809283555f52a0125a990cac4516b
all-runner-map-status:
?? scripts/scenario-break-map-bug025.json
generic-runner-and-sibling-map-head-equality: PASS
```

Dynamic enumeration found exactly the admitted BUG-025 map and one sibling map. The generic runner
and the sibling map match their HEAD objects. Only the admitted BUG-025 map has working-tree status.

### Embedded Configuration Object Parity

**Phase:** implement
**Command:** `cd /home/philipk/research-lab && timeout 60 node --input-type=module -e 'import fs from "node:fs"; import assert from "node:assert/strict"; const source=fs.readFileSync("company-intelligence-lab.html","utf8"); const matches=[...source.matchAll(/<script type="application\\/json" data-embedded-config="company-intelligence\\.config\\.json">([\\s\\S]*?)<\\/script>/g)]; assert.equal(matches.length,1); const embedded=JSON.parse(matches[0][1]); const committed=JSON.parse(fs.readFileSync("company-intelligence.config.json","utf8")); assert.deepStrictEqual(embedded,committed); const event=embedded.eventSource.coveredSubjects[0]; console.log(JSON.stringify({embeddedBlockCount:matches.length,parity:true,contractVersion:embedded.contractVersion,readBoundMs:embedded.readBoundMs,eventSubjectCount:embedded.eventSource.coveredSubjects.length,eventSubject:event.subjectId,eventPath:event.eventsPath,committedObjectKeys:Object.keys(committed).length,embeddedObjectKeys:Object.keys(embedded).length,result:"PASS"},null,2));'`
**Exit Code:** 0
**Claim Source:** executed

```text
{
	"embeddedBlockCount": 1,
	"parity": true,
	"contractVersion": "company-intelligence-config/v2",
	"readBoundMs": 10000,
	"eventSubjectCount": 1,
	"eventSubject": "company:msft",
	"eventPath": "data/company-intelligence/company-msft/events.json",
	"committedObjectKeys": 12,
	"embeddedObjectKeys": 12,
	"result": "PASS"
}
```

The extraction uses the same inert-script selector as the canonical selftest. It found one block
and required exact object equality with the committed configuration.

### Complete Dirty-Path Inventory And Classification

**Phase:** implement
**Command:** `cd /home/philipk/research-lab && timeout 60 git status --short --untracked-files=all -- company-intelligence-lab.html company-intelligence.config.json notes/company-intelligence-lab.md rlcompanyintel.js scripts/selftest.mjs tests/company-intelligence-lab.spec.mjs tests/company-intelligence.unit.mjs scripts/scenario-break-map-bug025.json specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
 M company-intelligence-lab.html
 M company-intelligence.config.json
 M notes/company-intelligence-lab.md
 M rlcompanyintel.js
 M scripts/selftest.mjs
 M tests/company-intelligence-lab.spec.mjs
 M tests/company-intelligence.unit.mjs
?? scripts/scenario-break-map-bug025.json
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/bug.md
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/design.md
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/report.md
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/scenario-manifest.json
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/spec.md
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/state.json
?? specs/_bugs/BUG-025-company-corpus-read-never-settles/uservalidation.md
```

These sixteen paths form the complete BUG-025 partition. The identity checks above distinguish
protected baseline bytes from admitted proof and packet-record deltas.

**Phase:** implement
**Command:** `cd /home/philipk/research-lab && timeout 60 git status --short --untracked-files=all -- README.md docs/DomainModel.md scripts/validate-test-file-reachability.baseline specs/007-technical-analysis-decision-lab/scopes specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys specs/_bugs/BUG-002-market-brief-session-date-drift/uservalidation.md specs/_bugs/BUG-026-superseded-company-corpus-state-writes specs/_bugs/BUG-027-per-page-check-executes-inert-json`
**Exit Code:** 0
**Claim Source:** executed

```text
 M README.md
 M docs/DomainModel.md
 M scripts/validate-test-file-reachability.baseline
 M specs/007-technical-analysis-decision-lab/scopes/01-capability-foundation/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/02-technique-engine/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/03-setup-lifecycle/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/04-five-gate-synthesis/report.md
 M specs/007-technical-analysis-decision-lab/scopes/04-five-gate-synthesis/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/05-owner-publication/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/06-comparison-optional-evidence/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/07-validation-risk-process/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/08-experience-publication/scope.md
 M specs/007-technical-analysis-decision-lab/scopes/09-regression-closure/scope.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/design.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/report.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/scenario-manifest.json
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/scopes.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/test-plan.json
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/uservalidation.md
 M specs/_bugs/BUG-002-market-brief-session-date-drift/uservalidation.md
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/bug.md
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/design.md
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/report.md
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/scenario-manifest.json
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/scopes.md
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/spec.md
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/state.json
?? specs/_bugs/BUG-026-superseded-company-corpus-state-writes/uservalidation.md
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/bug.md
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/design.md
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/report.md
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/scenario-manifest.json
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/scopes.md
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/spec.md
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/state.json
?? specs/_bugs/BUG-027-per-page-check-executes-inert-json/uservalidation.md
```

These thirty-six paths exactly match the prior report inventory at `report.md#code-diff-evidence`.
They remain classified as pre-existing sibling work, not BUG-025 work.

**Phase:** implement
**Command:** `cd /home/philipk/research-lab && timeout 60 node /tmp/research-lab-bug025-boundary-inventory-check.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
{
	"head": "4c9f2e87b9738eece50c2f0f5b987046ee6ce7a8",
	"dirtyPathCount": 52,
	"bug025AllowedPathCount": 16,
	"preExistingSiblingPathCount": 36,
	"unclassifiedPathCount": 0,
	"duplicateClassificationCount": 0,
	"bugPacketPrefix": "specs/_bugs/BUG-025-company-corpus-read-never-settles/",
	"priorInventoryRef": "report.md#code-diff-evidence",
	"result": "PASS"
}
```

The two literal inventories cover all 52 dirty paths. The assertion found no unclassified path
and no overlapping classification. This checkpoint does not claim whole-tree cleanliness.

### Focused Boundary And Excluded Families

**Phase:** implement
**Command:** `cd /home/philipk/research-lab && printf '%s\n' 'boundary-head:' && timeout 60 git rev-parse HEAD && timeout 60 git diff --check && printf '%s\n' 'git-diff-check: PASS' && timeout 60 git diff --quiet HEAD -- rldata.js rlcontracts.js site-exclusions.json package.json package-lock.json index.html rlnav.js tools.json data/company-intelligence .github && printf '%s\n' 'excluded-tracked-families-head-equality: PASS' && printf '%s\n' 'focused-tracked-delta:' && timeout 60 git diff --name-status -- company-intelligence-lab.html company-intelligence.config.json notes/company-intelligence-lab.md rlcompanyintel.js scripts/selftest.mjs tests/company-intelligence-lab.spec.mjs tests/company-intelligence.unit.mjs && printf '%s\n' 'boundary-check-result: PASS'`
**Exit Code:** 0
**Claim Source:** executed

```text
boundary-head:
4c9f2e87b9738eece50c2f0f5b987046ee6ce7a8
git-diff-check: PASS
excluded-tracked-families-head-equality: PASS
focused-tracked-delta:
M       company-intelligence-lab.html
M       company-intelligence.config.json
M       notes/company-intelligence-lab.md
M       rlcompanyintel.js
M       scripts/selftest.mjs
M       tests/company-intelligence-lab.spec.mjs
M       tests/company-intelligence.unit.mjs
boundary-check-result: PASS
```

The focused check covers `rldata.js`, `rlcontracts.js`, site registration, package manifests,
protected event data, and framework-managed files. These tracked families equal HEAD.
The complete inventory contains no additional BUG-025-attributable path from an excluded family.
`git diff --check` also exits zero on the complete tracked patch.

### Finding And Route Disposition

| Finding | Current disposition |
| --- | --- |
| `AUDIT-025-DOD-003` | Addressed and resolved by this current post-repair boundary record. |
| `AUDIT-025-EVIDENCE-001` | Open for command-bound current-revision metadata from `bubbles.validate`. |
| `AUDIT-025-SLICE-002` | Open for the complete independent audit read. |
| `AUD-BUG025-004` | Open for independent audit confirmation of the reconciled map boundary. |

Rows 9 through 11 remain unchecked. Scope 1 remains `In Progress` with the validate-owned 12/3
progress mirror. Both status mirrors remain `in_progress`.

The next owner is `bubbles.validate`. Validation must adjudicate rows 9 through 11 and row 15
against current command-bound metadata. Audit retains the final chronology and map-boundary recheck.

### Post-Record JSON And Artifact Validation

**Phase:** implement
**Command:** `cd /home/philipk/research-lab && timeout 120 node --input-type=module -e 'import fs from "node:fs"; import assert from "node:assert/strict"; const d="specs/_bugs/BUG-025-company-corpus-read-never-settles"; const state=JSON.parse(fs.readFileSync(`${d}/state.json`,"utf8")); const scope=fs.readFileSync(`${d}/scopes.md`,"utf8"); const rows=scope.split("\n").filter((line)=>/^- \[[ x]\]/.test(line)); const progress=state.certification.scopeProgress.find((row)=>row.scopeId==="01-declare-and-enforce-one-read-bound"); const inventory=state.execution.scopeInventory.find((row)=>row.scopeId==="01-declare-and-enforce-one-read-bound"); const route=state.transitionRequests.find((row)=>row.id==="BUG-025-ROUTE-030"); const finding=state.reworkQueue.find((row)=>row.id==="AUDIT-025-DOD-003"); const open=state.reworkQueue.filter((row)=>row.status==="open").map((row)=>row.id); assert.equal(state.status,"in_progress"); assert.equal(state.certification.status,"in_progress"); assert.equal(inventory.status,"In Progress"); assert.equal((scope.match(/^- \[x\]/gm)||[]).length,12); assert.equal((scope.match(/^- \[ \]/gm)||[]).length,3); assert.equal(rows.length,15); assert.ok(rows.slice(8,11).every((row)=>row.startsWith("- [ ]"))); assert.ok(rows[14].startsWith("- [x]")); assert.deepEqual(state.certification.completedScopes,[]); assert.deepEqual(progress,{scopeId:"01-declare-and-enforce-one-read-bound",status:"in_progress",dodChecked:12,dodUnchecked:3}); assert.equal(state.execution.nextRequiredOwner,"bubbles.validate"); assert.equal(route.status,"open"); assert.equal(route.nextRequiredOwner,"bubbles.validate"); assert.deepEqual(route.remainingOwnerSequence,["bubbles.validate","bubbles.audit"]); assert.equal(finding.status,"resolved"); assert.equal(finding.resolutionEvidenceRef,"report.md#implementation-owned-post-repair-boundary-2026-09-01"); assert.deepEqual(open,["AUDIT-025-EVIDENCE-001","AUDIT-025-SLICE-002","AUD-BUG025-004"]); assert.ok(fs.readFileSync(`${d}/report.md`,"utf8").includes("<a name=\"implementation-owned-post-repair-boundary-2026-09-01\"></a>")); console.log(JSON.stringify({jsonParse:"PASS",status:state.status,certificationStatus:state.certification.status,scopeStatus:inventory.status,dodChecked:12,dodUnchecked:3,rows9To11:"unchecked",row15:"checked-pending-validate-readjudication",completedScopes:state.certification.completedScopes,nextRequiredOwner:state.execution.nextRequiredOwner,route030Status:route.status,route030Remaining:route.remainingOwnerSequence,resolvedFinding:finding.id,openFindings:open,evidenceRef:finding.resolutionEvidenceRef,result:"PASS"},null,2));'`
**Exit Code:** 0
**Claim Source:** executed

```text
{
	"jsonParse": "PASS",
	"status": "in_progress",
	"certificationStatus": "in_progress",
	"scopeStatus": "In Progress",
	"dodChecked": 12,
	"dodUnchecked": 3,
	"rows9To11": "unchecked",
	"row15": "checked-pending-validate-readjudication",
	"completedScopes": [],
	"nextRequiredOwner": "bubbles.validate",
	"route030Status": "open",
	"route030Remaining": [
		"bubbles.validate",
		"bubbles.audit"
	],
	"resolvedFinding": "AUDIT-025-DOD-003",
	"openFindings": [
		"AUDIT-025-EVIDENCE-001",
		"AUDIT-025-SLICE-002",
		"AUD-BUG025-004"
	],
	"evidenceRef": "report.md#implementation-owned-post-repair-boundary-2026-09-01",
	"result": "PASS"
}
```

**Phase:** implement
**Command:** `cd /home/philipk/research-lab && timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-025-company-corpus-read-never-settles`
**Exit Code:** 0
**Claim Source:** executed

```text
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
```

<!-- bubbles:certifying-window-begin -->

### Validation Evidence

All report material before this marker is preserved prior-window history, not current certifying
output. The existing validation record remains [Validate Audit-Rework Adjudication —
2026-09-01](#validate-audit-rework-adjudication-2026-09-01). This section adds no new command
outcome beyond that record.

### Audit Evidence

The existing independent audit and persistence records remain [Final Independent Audit Recheck —
2026-09-01](#final-independent-audit-recheck-2026-09-01) and [Audit Persistence Closure —
2026-09-01](#audit-persistence-closure-2026-09-01). This section adds no new command outcome
beyond those records.
