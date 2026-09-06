# Scope 25 Report: Decision-Time Dossier And Immutable Audit

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 25 implements decision-time walk-forward folds, explicit purge and embargo windows, itemized cost authority,
exact-once tried-variant records, and a versioned append-only private dossier. The real Dossier route persists and
reloads the hash chain, appends corrections and export receipts without rewriting earlier records, previews only
user-selected fields, rejects secret-shaped export content, and performs the download locally without navigation or
network publication.

## Decision Record

Walk-forward clocks, source vintages, costs, tried variants, result states, corrections, persistence, and export remain
one dossier slice because each is required to interpret the same claim. `DecisionFold/v1` is a pure analytics contract.
`ResearchDossier/v1` and `DossierRecord/v1` form a separate two-slot local store with an immutable hash chain. The
legacy workspace dossier remains readable for compatibility, while new Scope 25 records use the dedicated namespace.
An export is itself auditable: a successful local download appends an `export-receipt` record after the user gesture.

## Completion Statement

Implementation and all five declared Test Plan commands pass on the committed tree. The complete Allocation and
Dossier browser carrier passes 16/16, the privacy/full-clear carrier passes 22/22, and the repository selftest passes
3,249/0.

**Execution closeout — 2026-08-23.** All five declared Test Plan commands plus the privacy canary were re-executed in
the current session and passed, so Scope 25's eight DoD rows are now closed and its `**Status:**` is `Done`. That is an
execution claim only. Certification remains unwritten and unclaimed here: `certification.*` is owned by the validation
agent, and no feature-level terminal claim is made by this scope.

## Code Diff Evidence

**Claim Source:** executed and inspected in the current session

```text
$ git log -1 --format=fuller -- <Scope 25 implementation and test paths>
commit 55a539f51ccafcd518976c9f6b9c2b8b53c41d2c
Author:     pkirsanov <pkirsanov@users.noreply.github.com>
AuthorDate: Sun Aug 23 02:32:13 2026 +0000
Commit:     pkirsanov <pkirsanov@users.noreply.github.com>
CommitDate: Sun Aug 23 02:32:13 2026 +0000

		feat(008): implement immutable decision dossier

$ git diff --check -- <Scope 25 paths>
exit: 0
output: empty
```

The implementation and tests are committed in `55a539f5`. The later certification-only active-scope mirror is not
attributed to that implementation commit. Scope 25 touches only the declared analytics/store/policy/route/test surface;
the current evidence does not claim ownership of unrelated concurrent repository changes.

## Test Evidence

**Claim Source:** executed in the current session

### TP-25-01

```text
# Feature 008 Scope 25 TP-25-01 allocation functional final
$ node --test tests/portfolio-allocation.functional.mjs
exit: 0
lines: 52
sha256: eacd3c39acae4c91dd2a95bedf5d7a993ffa0c5d0cd74e89d450556868127825
ok 6 - TP-15-08 a persisted dossier is swept by the full-personal clear and survives the behavior clear
ok 7 - TP-25-01 decision-time folds preserve clocks costs states and exact tried variants
1..7
# tests 7
# pass 7
# fail 0
# skipped 0
# duration_ms 3248.973219
```

**Current session re-execution — 2026-08-23. Claim Source: executed.** Exit 0; 7 tests, 7 pass, 0 fail, 0 skipped, 0 todo.

```text
# Feature 008 Scope 25 TP-25-01 allocation functional (session 2026-08-23)
$ node --test tests/portfolio-allocation.functional.mjs
exit: 0
lines: 52
sha256: 4928f1723a8befa39be4e8db7a06eab0aa1f574dc7e17f609d93234d7bc352e6
ok 6 - TP-15-08 a persisted dossier is swept by the full-personal clear and survives the behavior clear
ok 7 - TP-25-01 decision-time folds preserve clocks costs states and exact tried variants
1..7
# tests 7
# suites 0
# pass 7
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 3067.234078
```

Re-derive with `bash .github/bubbles/scripts/evidence-capture.sh --verify
4928f1723a8befa39be4e8db7a06eab0aa1f574dc7e17f609d93234d7bc352e6 -- node --test tests/portfolio-allocation.functional.mjs`.

### TP-25-02

```text
# Feature 008 Scope 25 TP-25-02 dossier functional final
$ node --test tests/portfolio-dossier.functional.mjs
exit: 0
lines: 22
sha256: 1b02ce1c38a918cb457c0b64d1a90a6e6cd4ee0e05f3fab098d18aadddcc4a96
ok 1 - TP-25-02 dossier reload corrections private export and clear preserve an immutable hash chain
ok 2 - Adversarial: incomplete walk forward and mutable dossier records cannot satisfy the audit contract
1..2
# tests 2
# pass 2
# fail 0
# skipped 0
# duration_ms 356.186941
```

**Current session re-execution — 2026-08-23. Claim Source: executed.** Exit 0; 2 tests, 2 pass, 0 fail, 0 skipped, 0 todo.
Output was 12 lines, so it is recorded verbatim rather than through the capture helper.

```text
$ node --test tests/portfolio-dossier.functional.mjs
exit: 0
✔ TP-25-02 dossier reload corrections private export and clear preserve an immutable hash chain (75.477752ms)
✔ Adversarial: incomplete walk forward and mutable dossier records cannot satisfy the audit contract (14.331115ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 216.491016
```

### TP-25-03

The exact named row passed, and the full carrier provides raw-output depth plus regression coverage for every earlier
Allocation and Dossier contract in the same real page:

```text
# Feature 008 Scope 25 complete Allocation and Dossier browser final
$ npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 21
sha256: f5eaa7781aaf43b21740918c9e20208672eb47b327c970fdac19799a93546d33
Running 16 tests using 1 worker
	PASS SCN-008-026 all six allocation methods share one frozen basis
	PASS SCN-008-027 allocation comparison presents tradeoffs and no universal winner
	PASS SCN-008-029 conflicting constraints remain infeasible without relaxation
	PASS SCN-008-028 unstable allocation shows weight ranges and reversal conditions
	PASS SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate
	PASS SCN-008-050 six real allocation methods enforce one complete basis and explicit views
	PASS SCN-008-031 dossier separates in sample walk forward costs and trials
	PASS SCN-008-051 dossier preserves decision time costs trials corrections reload and private export
	PASS SCN-008-032 efficiency claim is scoped to one tested information set
	PASS SCN-008-033 correlation never emits a substantially identical verdict
	PASS dossier ledgers claims corrections and private export remain accessible without mobile overlap
	16 passed (45.1s)
```

The exact SCN-008-051 command also passed independently in 7.8 seconds. Its compact capture SHA-256 is
`3a6afa127178a734d7328ffc23258632829137524ed8b6497471b6d3539a7bb9`.

**Current session re-execution — 2026-08-23. Claim Source: executed.** The exact declared Test Plan command — the
`--grep`-scoped form, not the full carrier — ran against the real fixture-overlay page. Exit 0; 1 passed.

```text
# Feature 008 Scope 25 TP-25-03 SCN-008-051 real-page regression (session 2026-08-23)
$ npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-051 dossier preserves decision time costs trials corrections reload and private export" --reporter=list
exit: 0
lines: 6
sha256: dfd4d8e93ae763bd332cb568e4379ebc470d5c7f418d12f5e98ad8188e9e68d9
Running 1 test using 1 worker
  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:548:1 › Regression: SCN-008-051 dossier preserves decision time costs trials corrections reload and private export (5.5s)
  1 passed (8.7s)
```

### TP-25-04

```text
# Feature 008 Scope 25 TP-25-04 adversarial final
$ node --test --test-name-pattern="Adversarial: incomplete walk forward and mutable dossier records cannot satisfy the audit contract" tests/portfolio-dossier.functional.mjs
exit: 0
lines: 16
sha256: a660b13e959b0f6d0e64d75252f609caab0b4de47f3e8e95737937deea388de5
TAP version 13
ok 1 - Adversarial: incomplete walk forward and mutable dossier records cannot satisfy the audit contract
1..1
# tests 1
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 243.974882
```

**Current session re-execution — 2026-08-23. Claim Source: executed.** Exit 0; 1 test, 1 pass, 0 fail, 0 skipped, 0 todo.
The name pattern selected exactly the adversarial row; nothing was reported skipped, so the filter did not mask a sibling.

```text
$ node --test --test-name-pattern="Adversarial: incomplete walk forward and mutable dossier records cannot satisfy the audit contract" tests/portfolio-dossier.functional.mjs
exit: 0
✔ Adversarial: incomplete walk forward and mutable dossier records cannot satisfy the audit contract (31.662812ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 154.70168
```

### TP-25-05

```text
# Feature 008 Scope 25 TP-25-05 repository selftest final
$ node scripts/selftest.mjs
exit: 0
lines: 3679
sha256: 316a6843bf860e75c5c9b3256785a19cc981700ac3ea846cb697300de95ccf4a
--- first 20 ---
Step 1 security - escaped model sinks and CSP on every page
	PASS every shipped HTML page carries a Content-Security-Policy meta
	PASS all pages use one identical CSP instead of drifting per page
	PASS no model/config-authored field reaches innerHTML without esc()
--- omitted 3639 line(s); sha256 above covers the full output ---
--- last 20 ---
specs - one number, one packet
	PASS the spec scan reads real directories rather than passing on an empty list (44 found)
	PASS no spec number is used by two packets beyond the recorded pre-existing pairs
================================================
Research-Lab self-test: 3249 passed, 0 failed
================================================
```

**Current session re-execution — 2026-08-23. Claim Source: executed.** Exit 0; 3,300 passed, 0 failed.
The assertion count rose from 3,249 to 3,300 because unrelated repository work landed between the two runs. The
movement is therefore not attributable to Scope 25, and the number is reported as an observed total rather than as a
Scope 25 delta.

```text
# Feature 008 Scope 25 TP-25-05 repository selftest (session 2026-08-23)
$ node scripts/selftest.mjs
exit: 0
lines: 3732
sha256: 90eef4eca60a978106f7244e3b8d2cf23ac6a2ac8842bb1314cd65df7f860d04
--- last 3 of 3732 ---
================================================
Research-Lab self-test: 3300 passed, 0 failed
================================================
```

Re-derive with `bash .github/bubbles/scripts/evidence-capture.sh --verify
90eef4eca60a978106f7244e3b8d2cf23ac6a2ac8842bb1314cd65df7f860d04 -- node scripts/selftest.mjs`.

### Privacy And Clear Canary

```text
# Feature 008 Scope 25 privacy and clear canary final
$ node --test tests/portfolio-privacy.functional.mjs
exit: 0
lines: 142
sha256: 64b41f3449e54a725ebcd8dc6aefcc1ef25ff5db8da0bfcdd1d1ed51532eed18
ok 1 - real-format import previews commits reloads and exports one local revision
ok 2 - secret-bearing import is redacted and cannot mutate any storage namespace
ok 3 - atomic write failures preserve the active pointer and retain a validated candidate only in memory
ok 21 - SCN-008-044 canonical behavior and rank references stay minimal and full clear removes them
ok 22 - Adversarial: full personal clear detects undeclared keys live state and arbitrary residue
1..22
# tests 22
# pass 22
# fail 0
# skipped 0
```

**Current session re-execution — 2026-08-23. Claim Source: executed.** Exit 0; 22 tests, 22 pass, 0 fail, 0 skipped.

```text
# Feature 008 Scope 25 privacy and clear canary (session 2026-08-23)
$ node --test tests/portfolio-privacy.functional.mjs
exit: 0
lines: 142
sha256: fc82b0dd6eb4fbfe89f62bf15eb3645747aebca146b97dfb805cfc61b7266512
ok 21 - SCN-008-044 TP-18-02 canonical behavior and rank references stay minimal and full clear removes them without public-state loss
ok 22 - Adversarial: full personal clear detects undeclared keys live state and arbitrary residue
1..22
# tests 22
# suites 0
# pass 22
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2046.821287
```

## Uncertainty Declarations

- The fold records exactly the held sample and configured decision clocks. It does not claim an exhaustive historical
	universe or the absence of survivorship, stale-classification, selection, look-ahead, or source-availability limits.
- Net outcomes remain unavailable whenever any declared commission, spread, slippage, turnover, financing, carry, or
	rebalance-timing authority is absent. Gross availability does not imply net availability.
- Tried-variant records describe only methods, parameters, samples, stress cases, views, or hedge ratios actually
	inspected by the controller. Merely supported variants are not entered into the ledger.
- Private export remains a browser-local user gesture. The system does not claim custody, encryption, or safe handling
	after the user chooses the destination.

## Scenario Contract Evidence

SCN-008-051 executes through `tests/portfolio-allocation.functional.mjs`,
`tests/portfolio-dossier.functional.mjs`, and the exact persistent row in
`tests/portfolio-survival-allocation.spec.mjs`. The live row uses the real fixture-overlay server without request
interception or test-injected DOM. It proves explicit decision/rebalance/embargo clocks, source vintages, all cost
states, exact tried variants, durable reload, immutable correction, selected-field preview, local download, persisted
export receipt, and unchanged prior record identities.

The receipt below repeats the exact command, exit code, and result line of the three carriers that execute
SCN-008-051, already recorded per row under Test Evidence in this report. No new execution is claimed here.

```text
# SCN-008-051 carriers — 3 of 3 executed, 0 failed, 0 skipped
$ node --test tests/portfolio-allocation.functional.mjs
exit: 0
# tests 7   # pass 7   # fail 0   # skipped 0
$ node --test tests/portfolio-dossier.functional.mjs
exit: 0
# tests 2   # pass 2   # fail 0   # skipped 0
$ npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-051 dossier preserves decision time costs trials corrections reload and private export" --reporter=list
exit: 0
  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:548:1 › Regression: SCN-008-051 dossier preserves decision time costs trials corrections reload and private export (5.5s)
  1 passed (8.7s)
```

## Coverage Report

The functional matrix covers post-cutoff exclusion, publication-time exclusion, purge/embargo/rebalance boundaries,
gross versus net state separation, incomplete costs, exact-once trial identity, JSON-safe records, atomic two-slot
commit/reload, broken-chain refusal, missing correction targets, secret rejection, user-gesture enforcement, private
selection, export receipts, and full clear. Browser coverage exercises the full user workflow and all 16 legacy/new
Allocation and Dossier scenarios. Repository coverage is reported only as 3,249 passing selftest assertions; no line-
coverage percentage is inferred. The current-session selftest observed 3,300 passing assertions; the two totals differ
because unrelated repository work landed between the runs, not because Scope 25 changed the count.

## Shared Infrastructure And Rollback Evidence

**Claim Source:** executed (every outcome below is a test that passed in the current session) and inspected (the named
assertion identities are read from the carrier source, not inferred from a pass).

Each Shared Infrastructure Impact Sweep canary declared in `scope.md` maps to a named assertion that ran this session:

| Contract | Canary | Assertion that proves it | Carrier |
|---|---|---|---|
| Dossier storage/corrections | Prior record hash remains readable after correction/reload | `a correction appends and leaves every prior byte-addressed record unchanged`, then the reloaded collection deep-equals the corrected dossier and re-validates | TP-25-02 |
| Walk-forward clock | No post-decision observation enters fitting; rebalance starts later | `TP-25-01 decision-time folds preserve clocks costs states and exact tried variants` | TP-25-01 |
| Cost/trial ledger | Missing component blocks net; each inspected variant increments once | incomplete-cost fold yields `net.state = unavailable` with `gross.state = gross-only`; a repeated trial returns `accepted = false`, `reason = duplicate-trial`, and an unchanged dossier | TP-25-04, TP-25-02 |
| Private export | Preview equals selected exported fields; no secret/public request | preview `selectedFields` deep-equals the request, `publicUrl` and `networkRequest` are `null`, exported keys equal the selection; secret content refuses `secret-shaped-content` and an ungestured export refuses `user-gesture-required` | TP-25-02, TP-25-04 |

Immutable rollback proof, from the same passing adversarial row:

- **No in-place migration.** Rewriting a prior record makes `validateResearchDossier` refuse — `in-place history mutation
	must break the content-addressed chain`. The chain is content-addressed, so a silent rewrite is not expressible.
- **A failed correction retains the prior dossier.** A correction naming an absent target refuses with
	`correction-target-missing` and returns no mutated dossier.
- **A failed export retains the prior dossier.** An export without a user gesture refuses with `user-gesture-required`.
- **A corrupted slot does not damage the pointer.** After a deliberately broken slot, `openDossiers` refuses with
	`P008-DOSSIER` and the active pointer bytes are asserted unchanged — `a broken chain is refused without rewriting the
	active pointer`. This is what makes the store recoverable rather than merely append-only.
- **New records use a new contract identity.** The dossier store uses its own `dossierNamespace` / `dossierPointerKey` /
	`dossierSlotKeys`, separate from the legacy workspace namespace, so existing local records stay inert and readable
	instead of being migrated.

The privacy-clear consumer was updated in the same commit to declare those new dossier keys, and the canary passes
22/22 including `Adversarial: full personal clear detects undeclared keys live state and arbitrary residue`. That
adversarial row is what makes the sweep non-vacuous: an undeclared dossier key would have reddened it.

## Lint And Quality

- Editor diagnostics: zero errors across all nine Scope 25 implementation and test paths.
- Incomplete-marker scan: zero `TODO`, `FIXME`, `HACK`, or `STUB` matches in the touched slice.
- Live-test authenticity scan: zero request-interception patterns in `tests/portfolio-survival-allocation.spec.mjs`.
- Silent-pass scan: zero bailout, skip, or optional-exit matches in the three Scope 25 carriers.
- Regression quality guard: exit 0; 0 violations and 0 warnings; compact capture SHA-256
	`0eb96dae2ca75b9a1e59b007456f04665594c6ef1712053a0c42db38de78f0bf`.
- Pages build dry run: exit 0; 28 registered pages and 121 root files; compact capture SHA-256
	`1236a093e0ac2e61be1503f26255cf8205ed73b8f6569c8cc4e44d2053a2405c`.
- Structured test paths: exit 0; zero new or stale missing paths and four future planned carriers; compact capture
	SHA-256 `dd7ad59ec896c4ba700bf71e763bb8f11d5432059a828555fda9b199a23115d3`.
- Artifact lint before report population: exit 0 with `Artifact lint PASSED`; compact capture SHA-256
	`ed9142d7152044254040019b1b8b5bda8eb2f0e069f511acdd675c357cff0950`.
- Canonical focused traceability: exit 0; 51 scenarios, 190 test rows, 51 concrete test references, 51 report
	references, and 0 warnings; compact capture SHA-256
	`a1b831cbedb736af7b5c5cca43e2d1f2234d6e360d385ade7c4a2a6690ed5c26`.
- PII scan: `{"ok":true,"findings":[],"filesScanned":9274,"messagesScanned":1831}`.
- `git diff --check` over the Scope 25 slice: exit 0 with empty output.

### Build Quality Gate — Current Session 2026-08-23 <a id="build-quality-gate--current-session-2026-08-23"></a>

**Phase:** implement
**Claim Source:** executed.

The receipt below repeats the exact command and exit code of each gate command described in this section and
under Lint And Quality. No new execution is claimed here.

```text
$ bash .github/bubbles/scripts/regression-quality-guard.sh tests/portfolio-survival-allocation.spec.mjs
exit: 0
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
$ grep -nE 'TODO|FIXME|HACK|STUB' <six Scope 25 implementation and test paths>
exit: 1
$ grep -nE 'page\.route|context\.route|intercept\(|cy\.intercept|msw|nock|wiremock' tests/portfolio-survival-allocation.spec.mjs
exit: 1
$ git diff --check
exit: 0
$ node scripts/selftest.mjs
exit: 0
Research-Lab self-test: 3300 passed, 0 failed
```

- **Zero skips.** Across all six commands re-executed this session the reported skipped/todo counts are 0: TP-25-01
	7/7, TP-25-02 2/2, TP-25-03 1 passed, TP-25-04 1/1, TP-25-05 3,300/0, privacy canary 22/22.
- **Zero warnings.** `bash .github/bubbles/scripts/regression-quality-guard.sh tests/portfolio-survival-allocation.spec.mjs`
	exited 0 with `REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)` over 1 file scanned.
- **Incomplete-marker scan.** `grep -nE 'TODO|FIXME|HACK|STUB'` over the six Scope 25 implementation and test paths
	exited 1 with no matches.
- **Live-test authenticity.** `grep -nE 'page\.route|context\.route|intercept\(|cy\.intercept|msw|nock|wiremock'` over
	`tests/portfolio-survival-allocation.spec.mjs` exited 1 with no matches, so TP-25-03 is a genuine live-stack row.
- **Whitespace check.** `git diff --check` over the Scope 25 slice exited 0 with empty output.
- **No excluded-file changes.** The implementation commit `55a539f5` touched 12 paths. None falls in the scope's
	Excluded list: the registry/docs surface (`tools.json`, `index.html`, `rlnav.js`, `notes/`) and the framework-managed
	`.github/` surface were confirmed untouched by a name-only filter that returned no matches.

**Honest boundary note.** Two of those 12 paths — `tests/portfolio-foundation.unit.mjs` and
`tests/portfolio-privacy.functional.mjs` — are not named in the scope's *Allowed* list, though neither is in the
*Excluded* list. Both changes are the declared-key partition extension that the new dossier namespace forces on the
privacy-clear consumer, which is the sweep's own `Privacy clear, export, reload, route` row. They are recorded here
rather than absorbed silently, because the DoD row asserts only the absence of *excluded* changes and that is the
narrower claim being made.

**Working-tree note.** `tests/recommendation-track-record.e2e.mjs` is currently modified in the working tree by
unrelated concurrent work. It is not a Scope 25 path, was not touched by this scope, and is excluded from every claim
above.

## Spot-Check Recommendations

- Retain the post-cutoff return discriminator. It fails if fitting admits evidence that was unavailable at decision time.
- Retain the chain corruption, missing correction target, no-user-gesture, and incomplete-cost adversarial probes.
- Retain both reloads in the browser workflow: one after correction and one after export receipt. Together they prove
	new heads survive without rewriting any prior record identity.
- Keep source-vintage and limitation disclosures visible. Their omission would turn a correct stored contract into an
	overstated user-facing claim.

## Validation Summary

All five declared Test Plan commands, the complete browser carrier, privacy/full-clear canary, regression-quality
guard, Pages dry run, structured-path validator, artifact lint, PII scan, editor diagnostics, and whitespace check pass.
Focused traceability initially refused because the stale report did not reference
`tests/portfolio-survival-allocation.spec.mjs`; after this report supplied that evidence edge, the canonical focused
guard passed with 51/51 scenario-to-report references and zero warnings. Scope 25 is ready for planning-owned DoD
evaluation and subsequent execution/certification reconciliation.

## Audit Verdict

Implementation, tests, privacy integration, and rollback behavior are internally coherent. No independent specialist
audit or terminal feature certification is claimed. Scopes 26-29 are dependency-ordered successors to this scope;
each now declares Done in its own scope.md.
