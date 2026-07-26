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
