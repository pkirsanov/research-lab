# Scope 10 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md)

## Summary

Scope 10 delivers a bounded, fail-closed web-evidence acquisition stage AND a safe
static browser disclosure consumer, in two batches.

- **Batch 1** (commit `5df66793`): `scripts/web-evidence-acquire.mjs` (fail-closed
  acquisition — query-plan / robots / HTTPS-443 / no-redirect / host-path / budget
  policy, hostile-instruction detection, conservative independent-origin
  corroboration, frozen `web-evidence-bundle/v1`; zero author / publication / fetch /
  provider-key / repo-write authority), `scripts/validate-web-evidence.mjs`, 11
  exact-format fixtures, `tests/web-evidence.unit.mjs` / `.functional.mjs` /
  `.security.mjs`, and a `scripts/selftest.mjs` acquisition canary.
- **Batch 2** (this session): the safe static browser disclosure consumer
  `RLBRIEF.projectSafeWebEvidence` + `RLBRIEF.renderWebEvidenceDisclosure` in
  `rlbrief.js`, and the live-stack e2e `tests/web-evidence.spec.mjs`
  (SCN-012-006/007/037). The consumer INSPECTS a frozen bundle's
  publisher/date/query/claim/origin/owner/freshness/hash status as SAFE plain text,
  summarizes source excerpts to counts (never raw bodies), redacts any
  markup/scheme/credential/redirect/control-char/instruction-shaped value, and has
  NO acquisition/fetch/author/publication/write authority.

All eight Test Plan rows were executed green in the current session. Broad selftest
is 949 passed / 0 failed. The three committed validators PASS. The e2e was proven
RED (production disclosure absent) before implementation and GREEN after.

## Decision Record

- **`rlexperience.js` left byte-unchanged (deliberate).** Implementation Plan step 9
  assigns the disclosure consumer to `rlbrief.js` only; `market-brief.html` loads
  `rlbrief.js` (line 875) but NOT `rlexperience.js` directly, so the browser e2e
  drives `window.RLBRIEF` directly. `rlexperience.js` already carries the
  `E012-WEB-*` refusal contract, and the browser MUST NOT be able to acquire — there
  is no acquisition-side wiring to add. Adding a duplicative method to that frozen,
  scope-09-heavily-tested module would add regression risk with no functional gain,
  so per "never break the tree" the consumer lives solely in `rlbrief.js`. Recorded
  as finding F-10-A (planning `Modified` list nuance) for `bubbles.test`/`bubbles.plan`.
- **`tests/distributed-briefs.spec.mjs` failures are PRE-EXISTING, not a regression.**
  With the `rlbrief.js` change stashed (reverted to HEAD), the same suite fails
  identically at `mountReady` (`waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]')`
  20s timeout) — a fixture-graph harness/env issue in this environment, unrelated to
  the additive `rlbrief.js` change. The rlbrief renderer/static canaries
  (`selftest` 949/0 + `validate-brief-payload` PASS) are green. Recorded as finding
  F-10-B (pre-existing, out of scope).

## Completion Statement

Scope-10 implementation code (batch 1 acquisition + batch 2 disclosure consumer) and
all eight Test Plan tests are complete and green in the current session. Scope status
remains `in_progress`; independent finalization is owned by `bubbles.test`. Feature
status is untouched (`not_started`, `certifiedAt=null`).

## Code Diff Evidence

Batch 2 changed set (this session):

- `rlbrief.js` — additive: `projectSafeWebEvidence` (pure) + `renderWebEvidenceDisclosure`
  (DOM) inserted after `root.RLBRIEF.renderCenterNoAction` (line 814), attached via
  `root.RLBRIEF.x = x`. The line-202 pure-export block and every existing renderer are
  byte-unchanged. `node --check rlbrief.js` → `RLBRIEF_PARSE_OK`.
- `tests/web-evidence.spec.mjs` — new live-stack system-chrome e2e (TP-10-05/06/07);
  `node --check` → `SPEC_PARSE_OK`.

`git diff --check -- rlbrief.js tests/web-evidence.spec.mjs` → exit 0 (no whitespace/
conflict markers). Excluded author/publication scripts
(`brief-author.mjs`/`brief-publication.mjs`/`brief-refresh.mjs`/`brief-narrative-parallel.mjs`),
`scripts/web-evidence-acquire.mjs`, `scripts/validate-web-evidence.mjs`, `rldata.js`,
and `rlexperience.js` are all byte-unchanged (`git status --short` on those paths →
empty). The concurrent BUG-001 `scenario-manifest.json` modification is preserved and
NOT staged.

## Test Evidence

### tp-10-01

**Phase:** implement · **Claim Source:** executed · **Command:** `node --test tests/web-evidence.unit.mjs` · **Exit Code:** 0

```
# Subtest: closed rejection-detail vocabulary is a strict superset of every fixture rejection
ok 10 - closed rejection-detail vocabulary is a strict superset of every fixture rejection
  ---
  duration_ms: 1.599901
  type: 'test'
  ...
1..10
# tests 10
# suites 0
# pass 10
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 103.052938
```

### tp-10-02

**Phase:** implement · **Claim Source:** executed · **Command:** `node --test tests/web-evidence.functional.mjs` · **Exit Code:** 0

```
✔ SCN-012-037 acquisition freezes a safe bounded WebEvidenceBundle/v1 with no raw or hostile content (8.4902ms)
✔ SCN-012-006 a single-origin material claim is rejected as uncorroborated (1.5925ms)
✔ SCN-012-007 syndicated pages count as one origin; a second independent origin is still required (1.2839ms)
✔ conflicting independent sources reject a material claim (not averaged) (2.3491ms)
✔ a stale source does not count toward the two-current-origin requirement (2.3495ms)
✔ policy enforcement: robots-disallow rejects the candidate and never retrieves its content url (1.2019ms)
✔ policy enforcement: redirects are rejected (finalUrl != requested url) (0.8045ms)
✔ policy enforcement: over-budget candidate cardinality fails closed before any retrieval (0.7629ms)
✔ policy enforcement: missing source metadata is rejected (missing-metadata) (1.1424ms)
✔ policy enforcement: a source published after the cutoff is rejected (later-than-cutoff) (1.2926ms)
✔ policy enforcement: an instruction-shaped excerpt is discarded and never echoed (1.4466ms)
ℹ tests 11
ℹ pass 11
ℹ fail 0
```

### tp-10-03

**Phase:** implement · **Claim Source:** executed · **Command:** `node --test tests/web-evidence.security.mjs` · **Exit Code:** 0

```
✔ a credentialed candidate url is rejected (credentialed-url) and the credential is never echoed (5.358892ms)
✔ a non-HTTPS candidate url is rejected (scheme-not-https) (0.731599ms)
✔ an IP-literal host is rejected (ip-literal-host) (0.561499ms)
✔ a non-allowlisted host is rejected (host-not-allowlisted) (0.831099ms)
✔ executable markup in the body is rejected (executable-markup) and never stored (1.646497ms)
✔ a non-text executable media type is rejected (executable-media) (0.760299ms)
✔ the committed injection-hostile fixture rejects and never echoes the hostile string (3.604394ms)
✔ every rejection carries only closed reason codes and safe detail tokens (no remote content) (3.902094ms)
✔ STATIC authority proof: acquisition module imports ONLY node:crypto and owns zero forbidden capability (1.627397ms)
ℹ tests 9
ℹ pass 9
ℹ fail 0
```

### tp-10-04

**Phase:** implement · **Claim Source:** executed · **Command:** `node scripts/validate-web-evidence.mjs --fixtures tests/fixtures/feature-012/web-evidence` · **Exit Code:** 0

```
[web-evidence] policy=PASS lanes=tool-brief,red-alert userAgent=ResearchLabEvidenceBot/1.0 maxQueryChars=240 contract=web-evidence-acquisition/v1
[web-evidence] fixture=one-origin-uncorroborated result=PASS ok=true retainedSources=1 origins=1 rejections=0
[web-evidence] fixture=primary-independent result=PASS ok=true retainedSources=2 origins=2 rejections=0
[web-evidence] fixture=syndicated-common-origin result=PASS ok=true retainedSources=2 origins=1 rejections=0
[web-evidence] fixture=over-budget result=PASS ok=false retainedSources=0 origins=0 rejections=0 code=E012-WEB-BUDGET
[web-evidence] moduleAuthority=PASS imports=node:crypto forbiddenCapabilities=0 importsAuthorModule=false
[web-evidence] adversarial=material-authorable-uncorroborated result=REJECTED code=E012-WEB-CORROBORATION
[web-evidence] adversarial=claim-instruction-shaped result=REJECTED code=E012-WEB-UNSAFE
[web-evidence] adversarial=bundle-fingerprint-tamper result=REJECTED code=E012-WEB-POLICY
[web-evidence] adversarial=bundle-version-tamper result=REJECTED code=E012-VERSION
[web-evidence] OK fixtures=11 adversarial=12 unexpectedAcceptances=0
```

### tp-10-05

See [Scenario Contract Evidence → SCN-012-006](#scn-012-006).

### tp-10-06

See [Scenario Contract Evidence → SCN-012-007](#scn-012-007).

### tp-10-07

See [Scenario Contract Evidence → SCN-012-037](#scn-012-037).

### tp-10-08

**Phase:** implement · **Claim Source:** executed · **Command:** `node scripts/selftest.mjs` · **Exit Code:** 0

```
  ✓ every committed web-evidence fixture (>= 11) evaluates deterministically against the REAL acquire() production transform
  ✓ web-evidence-acquire.mjs imports ONLY node:crypto and owns zero fetch/provider-key/repo-write/current-pointer/author-publication authority
  ✓ the web-evidence validator refuses twelve distinct closed adversarial mutations, each with an E012-* code
  ✓ SCN-012-006/007 single & syndicated origins leave a material claim uncorroborated while two DISTINCT origins corroborate; the safe bundle is frozen with no raw markup (SCN-012-037)

================================================
Research-Lab self-test: 949 passed, 0 failed
================================================
```

### no-interception scan

**Phase:** implement · **Claim Source:** executed · **Command:** `grep -nE 'page\.route|context\.route|\.intercept|\bmsw\b|\bnock\b|fulfill\(|wiremock|responses\(' tests/web-evidence.spec.mjs` · **Exit Code:** 1 (no matches — clean)

```
NO_INTERCEPT_EXIT=1 (1=clean)
```

The e2e uses a real static server + real `page.goto` + the real production disclosure
UI; there is no request routing, response stubbing, interception, or recorded-traffic
replay. Bundles are the REAL production `acquire()` transform of committed fixtures.

### existing-brief-canary

**Phase:** implement · **Claim Source:** executed

- `node scripts/validate-brief-payload.mjs` → exit 0: `[brief-contract] PASS: all
  visible sections, registry coverage, model-specific real assets, and next-session
  actions are valid`.
- `node scripts/validate-tool-experience.mjs` → exit 0:
  `[tool-experience] OK adversarial=13 unexpectedAcceptances=0`.
- `tests/distributed-briefs.spec.mjs` fails identically at HEAD (change stashed) — see
  Decision Record finding F-10-B; the rlbrief renderer/static canaries above are green,
  proving the additive `rlbrief.js` change introduced no regression.

```
=== run ONE distributed-briefs test at HEAD (my change reverted) ===
    > 21 |     await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 20000 });
  1 failed
    [system-chrome] › tests/distributed-briefs.spec.mjs:28:1 › Regression: pre-market Simple and Power keep official close separate and disclose comparable volume
HEAD_DISTRIB_EXIT=1
```

## Uncertainty Declarations

None. Every claim above maps to a command executed in the current session with its
recorded exit code and raw output.

## Scenario Contract Evidence

### SCN-012-006

**RED (production disclosure consumer absent, before implementation).** Command:
`npx --no-install playwright test tests/web-evidence.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-006 one-origin material claim is rejected and no current authored claim appears" --reporter=list` · Exit 1.

```
  ✘  1 …material claim is rejected and no current authored claim appears (15.8s)
    TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
    > 71 |   await page.waitForFunction(
    72 |     () => !!(window.RLBRIEF
    73 |       && typeof window.RLBRIEF.renderWebEvidenceDisclosure === 'function'
    74 |       && typeof window.RLBRIEF.projectSafeWebEvidence === 'function'),
  1 failed
RED_EXIT=1
```

**GREEN (TP-10-05, after implementation).** Same exact command · Exit 0.

```
Running 1 test using 1 worker
  ✓  1 … material claim is rejected and no current authored claim appears (3.2s)
  1 passed (4.8s)
TP05_EXIT=0
```

Proof: the one-origin frozen bundle projects `independentOriginCount=1`, its material
claim is `corroborationState=uncorroborated`, `authorableByEvidence=false`,
`secondOriginRequired=true`, `disclosureStatus=insufficient-corroboration`; the DOM
carries `data-web-evidence-material-authorable="0"` and
`data-web-evidence-author-state="dependency-pending:feature-002"` (an evidence audit —
no authored/published ToolBrief claim appears); the visible text contains
`insufficient-corroboration` and `no toolbrief is authored or published` and does NOT
contain `verified`. A non-bundle input renders a safe unavailable state (0 scripts).

### SCN-012-007

**GREEN (TP-10-06).** Command:
`npx --no-install playwright test tests/web-evidence.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-007 syndicated pages count as one origin in the safe evidence disclosure" --reporter=list` · Exit 0.

```
Running 1 test using 1 worker
  ✓  1 …dicated pages count as one origin in the safe evidence disclosure (3.1s)
  1 passed (4.4s)
TP06_EXIT=0
```

Proof: the syndicated-common-origin frozen bundle retains TWO sources
(`sources.length=2`, two `[data-web-evidence-source]` rows) but they trace to ONE
canonical origin, so `independentOriginCount=1` (`data-web-evidence-origins="1"`); the
material claim has `independentOriginGroupCount=1`, `secondOriginRequired=true`,
`corroborationState=uncorroborated`, `authorableByEvidence=false`; the visible text
contains `independent origins: 1` and `a second independent source is still required`.

### SCN-012-037

**GREEN (TP-10-07).** Command:
`npx --no-install playwright test tests/web-evidence.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-037 frozen safe bundle renders bounded metadata and no raw or hostile content" --reporter=list` · Exit 0.

```
Running 1 test using 1 worker
  ✓  1 …afe bundle renders bounded metadata and no raw or hostile content (3.0s)
  1 passed (4.4s)
TP07_EXIT=0
```

Proof (a — safe bounded projection): the qualified primary-independent frozen bundle
projects `independentOriginCount=2`; the DOM shows HTTPS publisher (`Reuters`,
`Associated Press`), host (`reuters.example`), freshness (`freshness current`), and a
bounded hash summary (`sha256:`) plus the frozen timestamp as SAFE text; `scriptCount=0`,
`jsHrefCount=0`, and rendering fires ZERO network requests (`resourcesAdded=0`). Raw
remote bodies are ABSENT — the raw source markup (`<p>The issuer raised…`) and raw
excerpt-body sentence (`the company said`) do not appear.

Proof (b — browser cannot acquire): `typeof window.RLBRIEF.acquire === 'undefined'`,
`typeof window.RLBRIEF.fetch === 'undefined'`, and neither
`renderWebEvidenceDisclosure` nor `projectSafeWebEvidence` source contains a network
primitive (`fetch(`/`XMLHttpRequest`/`import(`/`WebSocket`/`sendBeacon`/`EventSource`).

Proof (c — hostile bundle fully redacted): a crafted bundle with a `<script>` publisher,
a `https://user:secretpass@evil.example` credentialed URL, an `<img onerror=…>` excerpt,
and an instruction-shaped claim renders with `scriptCount=0`, `onerror=false`,
`window.__webEvidencePwned` still `false`, no `<script` in HTML, `secretpass` absent,
`exfiltrate` absent, and `redactedCount>0` — the consumer actively redacted every unsafe
value.

## Coverage Report

All eight Test Plan rows executed green in the current session: TP-10-01 (10/0),
TP-10-02 (11/0), TP-10-03 (9/0), TP-10-04 (validator PASS: fixtures=11 adversarial=12
unexpectedAcceptances=0), TP-10-05/06/07 (e2e 1/1 each, RED→GREEN), TP-10-08 (selftest
949/0). SCN-012-006/007/037 each proven at the functional boundary (TP-10-02) AND in
the real browser disclosure UI (TP-10-05/06/07).

## Lint/Quality

- `node --check rlbrief.js` → OK; `node --check tests/web-evidence.spec.mjs` → OK.
- `git diff --check -- rlbrief.js tests/web-evidence.spec.mjs` → exit 0.
- No-interception scan on the e2e → clean (exit 1, no matches).
- Package/source-lock files untouched; framework files (`.github/**`) untouched.

## Spot-Check Recommendations

- `bubbles.test`: run the three exact TP-10-05/06/07 grep commands and the batch-1
  TP-10-01..04 commands to independently re-verify.
- Route finding F-10-B (pre-existing `distributed-briefs.spec.mjs` harness failure) to
  the owning surface — it fails identically at HEAD and is unrelated to Scope 10.

## Validation Summary

Batch-2 code (`rlbrief.js` disclosure consumer) + e2e (`tests/web-evidence.spec.mjs`)
complete and green this session. Broad selftest 949/0; validators PASS; no regression
to the rlbrief renderer/static/payload canaries. Scope status stays `in_progress` for
`bubbles.test` finalization.

## Audit Verdict

Deferred to `bubbles.test` (independent finalization). Implementation evidence above is
current-session, executed, and non-fabricated.

## Independent Verification (bubbles.test)

**Verifier:** `bubbles.test` · **Mode:** `full-delivery` · **HEAD:** `674cb92f` ·
**Method:** recorded evidence NOT trusted — every Test Plan row reproduced from scratch
this session with the EXACT `scope.md` commands and full unfiltered output.
`repo-binding-preflight.sh --agent-source research-lab` → exit 0 first.

### Test Plan rows — all GREEN in-session

| Row | Command | Result | Exit |
|---|---|---|---|
| TP-10-01 unit | `node --test tests/web-evidence.unit.mjs` | 10 pass / 0 fail | 0 |
| TP-10-02 functional | `node --test tests/web-evidence.functional.mjs` | 11 pass / 0 fail | 0 |
| TP-10-03 security | `node --test tests/web-evidence.security.mjs` | 9 pass / 0 fail | 0 |
| TP-10-04 validator | `node scripts/validate-web-evidence.mjs --fixtures tests/fixtures/feature-012/web-evidence` | PASS fixtures=11 adversarial=12 unexpectedAcceptances=0 | 0 |
| TP-10-05 e2e SCN-012-006 | `npx --no-install playwright test tests/web-evidence.spec.mjs …system-chrome --grep "…SCN-012-006…"` | 1 passed | 0 |
| TP-10-06 e2e SCN-012-007 | `…--grep "…SCN-012-007…"` | 1 passed | 0 |
| TP-10-07 e2e SCN-012-037 | `…--grep "…SCN-012-037…"` | 1 passed | 0 |
| TP-10-08 selftest | `node scripts/selftest.mjs` | 949 passed / 0 failed | 0 |

Canaries: `validate-brief-payload` PASS (exit 0); `validate-tool-experience` PASS
adversarial=13 unexpectedAcceptances=0 (exit 0). Full web-evidence e2e spec = 3 passed
(exit 0).

### Eight independent checks — all confirmed

1. **SCN-012-006/007/037.** SCN-012-006 one-origin material claim REJECTED as
   uncorroborated (unit `SCN-012-006 one current origin leaves a material claim
   uncorroborated`; functional evaluateFixture(one-origin) exit 0; e2e
   `data-web-evidence-material-authorable="0"`, text `insufficient-corroboration` /
   `no toolbrief is authored or published`, no `verified`). SCN-012-007 syndicated
   pages → ONE independent origin, second still required (validator
   `syndicated-common-origin … origins=1`; unit `SCN-012-007 syndication counts as ONE
   independent origin`; e2e `data-web-evidence-origins="1"`, `a second independent
   source is still required`). SCN-012-037 one immutable frozen `web-evidence-bundle/v1`
   with exact hashes/bounded-excerpts/claims/origins/owner-evidence/rejections/coverage;
   raw HTML/scripts/instructions/credentials/redirects/private-context/author-authority
   ABSENT (functional freeze test + e2e proof a: `scriptCount=0 jsHrefCount=0
   resourcesAdded=0`, raw markup absent).
2. **Fail-closed policy.** Validator rejects 12 distinct closed adversarial mutations
   each with an `E012-*` code (private-fact, url-in-terms, credential-in-terms,
   shell-control-in-terms, wildcard-in-terms, instruction-shaped-terms, overlength-terms,
   too-many-queries, bundle-fingerprint-tamper, bundle-version-tamper,
   material-authorable-uncorroborated, claim-instruction-shaped);
   `unexpectedAcceptances=0`. Functional policy-enforcement rows: robots-disallow,
   redirects, over-budget (fails closed before retrieval), missing-metadata,
   later-than-cutoff, instruction-shaped-excerpt — all reject. No fallback/env relaxation
   (only import `node:crypto`).
3. **Hostile content rejected & never echoed.** Security suite: credentialed-url
   rejected and credential never echoed; executable-markup rejected and never stored;
   injection-hostile fixture rejects and never echoes the hostile string; every
   rejection carries only closed reason codes. E2e proof (c): a crafted hostile bundle
   (`<script>` publisher, `user:secretpass@evil.example` URL, `<img onerror=…>` excerpt,
   instruction-shaped claim) renders `scriptCount=0`, `onerror=false`,
   `window.__webEvidencePwned` still false, `secretpass`/`exfiltrate` absent,
   `redactedCount>0`.
4. **Zero author/network authority (STATIC).** `scripts/web-evidence-acquire.mjs` imports
   ONLY `import { createHash } from 'node:crypto';` (line 48). Forbidden-capability grep
   (fetch/XMLHttpRequest/WebSocket/writeFile/provider/apiKey/brief-author/brief-publication/
   brief-refresh/brief-narrative/currentPointer/process.env) matches ONLY docstring lines
   35/37/38 (the negative-assertion comment). Validator `moduleAuthority=PASS
   imports=node:crypto forbiddenCapabilities=0 importsAuthorModule=false`; selftest static
   authority canary green. I/O reachable ONLY through the injected `boundary.search` /
   `boundary.retrieve` object. Produces NO ToolBrief and NO public current pointer (the
   only `ToolBrief` match is the docstring `It produces NO ToolBrief …`).
5. **Browser boundary.** `rlbrief.js` consumers `projectSafeWebEvidence` (895–989, pure)
   and `renderWebEvidenceDisclosure` (990–1056, DOM via `esc()` only) contain NO network
   primitive; the sole `fetch(` in `rlbrief.js` (line 1158) is the pre-existing Feature-002
   `briefFetchText` loader, unrelated to web-evidence. E2e asserts
   `window.RLBRIEF.acquire === 'undefined'` and `window.RLBRIEF.fetch === 'undefined'`.
   No-interception grep on `tests/web-evidence.spec.mjs` = 0 matches (exit 1); e2e drives
   real `acquire()` at the Node boundary then renders the frozen bundle over a static
   same-origin `page.goto` — no raw/unsafe content in the DOM.
6. **RED-bite (adversarial, restored byte-identical).** Baseline sha256
   `d51838d7…1727f24a`. Neutralized the second-independent-origin requirement
   (`MIN_INDEPENDENT_ORIGINS` 2→1) via the IDE edit tool → functional 8 pass / **3 fail**
   (`corroboratedMaterialClaimCount 1 != 0` on one-origin/syndicated/stale, exit 1) AND
   unit 7 pass / **3 fail** (`actual: 'corroborated', expected: 'uncorroborated'`, exit 1).
   Restored `git checkout HEAD -- scripts/web-evidence-acquire.mjs` → sha256
   `d51838d7…1727f24a` (== baseline, byte-identical) → functional + unit GREEN (exit 0).
   `git status --short` afterward = ONLY the concurrent BUG-001 `scenario-manifest.json`;
   no neutralized file left in the tree.
7. **Protected paths byte-unchanged.** `git status --short` on
   `brief-author.mjs`/`brief-publication.mjs`/`brief-refresh.mjs`/`brief-narrative-parallel.mjs`,
   public pointer/objects/history, `rldata.js`, `rlexperience-adapters/`, `rlmarketaction.js`,
   `rljourney.js`, `journeys.json`, `simple-models.json`, `data/options/`,
   `market-brief.config.json`, `rlexperience.js` = EMPTY (all byte-unchanged; all tracked).
   Feature 002 renderer/static suites green (selftest 949/0 + `validate-brief-payload`
   PASS). `market-brief.config.json` change is additive (payload PASS).
8. **Rollback verified truthful (reasoned).** The Scope-10 `rlbrief.js` consumer commit
   `587e9ee9` = `1 file changed, 244 insertions(+), 0 deletions` (real-deletion grep exit
   1 — purely additive; existing renderers byte-unchanged). Removing the Scope-10
   additions (acquire/validator/fixtures/tests + additive `rlbrief.js` hunk + additive
   `market-brief.config.json`) restores prior Brief/Market-Action/selftest/payload green
   with NO published object/history/pointer or external state change (clean tree confirms
   additive delivery).

### Findings disposition (both non-blocking; already recorded)

- **F-10-A** (informational → `bubbles.plan`): `scope.md` Implementation Files → Modified
  lists `rlexperience.js`, but it is byte-unchanged (git status empty). Deliberate — the
  disclosure consumer lives in `rlbrief.js` (the module `market-brief.html` loads); the
  browser MUST NOT acquire, so there is no acquisition-side wiring to add, and
  `rlexperience.js` already carries the `E012-WEB-*` refusal contract. The DoD and the
  security boundary are genuinely satisfied without touching it. Planning-doc nuance for
  `bubbles.plan` to reconcile the Modified list. NON-BLOCKING.
- **F-10-B** (pre-existing/environmental → owning surface): `tests/distributed-briefs.spec.mjs`
  fails at current HEAD (12/13) at the `mountReady` selector
  `[data-rlbrief-mount][data-rlbrief-ready="1"]` staying HIDDEN
  (`data-rlbrief-mounting="1"`, tool `sector-research-lab`) — a Feature-002 mount-visibility
  harness/env issue in this WSL environment. Independently reproduced this session.
  DEFINITIVELY not a Scope-10 regression: the Scope-10 `rlbrief.js` change is purely
  additive (244 insertions / 0 deletions), the same browser harness passes the web-evidence
  e2e, and the rlbrief renderer/static canaries are green (selftest 949/0). NON-BLOCKING,
  out of Scope-10 boundary.

### Verdict

All 8 Test Plan rows GREEN, all 8 checks confirmed, every DoD item genuinely satisfied.
Scope 10 → `done`, substate `independently_verified`. Feature `status`=`not_started`,
`certifiedAt`=null, `certification.status`=`not_started` remain UNTOUCHED (Scope 10 of 14).
Next owner `bubbles.implement` for Scope 11 (Feature 002-Gated Authored Brief Integration).
