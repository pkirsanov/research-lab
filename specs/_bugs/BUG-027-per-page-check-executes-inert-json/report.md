# Report: BUG-027 — Per-Page Check Executes Inert JSON as JavaScript

## Summary

This filing independently reproduced `BUG-025-SIMPLIFY-GAP-001` against the canonical Research Lab command. The command exits 1 because it compiles an inert `application/json` block as JavaScript.

The filing also grounded the distinct existing checks. The Company Intelligence unit carrier parses the block as JSON and compares it with the committed configuration. The origin packet records prior complete browser execution separately from this invocation.

## Completion Statement

The independent bug packet exists and remains `in_progress`. No runtime repair, command-registry change, validator implementation, or test change occurred in this invocation.

The defect is routed to `bubbles.design` for design ownership. Planning ownership follows after the executable MIME and module-parser decisions are finalized.

## Repository Binding

The host adapter first observed the operator-supplied Research Lab decision at control revision 1. The mandatory top-level preflight confirmed the same repository and advanced the external control record to revision 2.

The filing's actionable decision at that time was:

```json
{"repositoryRoot":"/home/philipk/research-lab","repositoryAlias":"research-lab","repositoryResolution":{"sessionId":"vscode-20072c8d3f74af455af2514e746fced3","decisionId":"rb:vscode-20072c8d3f74af455af2514e746fced3:2","controlRevision":2,"controlPathDigest":"sha256:7e982c9a1b25048dd68c8c758dbc39cdc603988bddfe07251568ed72f9d0becc","authority":"explicit-repository-root","transition":"confirmed","scopeKind":"command","scopeId":null,"targetKind":"repository-root","pathVisibility":"local","actionable":true}}
```

The supplied revision-1 decision remains origin provenance. It is no longer actionable after the required preflight revision advanced.

For this filing-artifact hygiene correction, the host adapter observed control revision 4. The explicit-root preflight confirmed Research Lab and advanced the control record to revision 5.

The current actionable decision is:

```json
{"repositoryRoot":"/home/philipk/research-lab","repositoryAlias":"research-lab","repositoryResolution":{"sessionId":"vscode-20072c8d3f74af455af2514e746fced3","decisionId":"rb:vscode-20072c8d3f74af455af2514e746fced3:5","controlRevision":5,"controlPathDigest":"sha256:7e982c9a1b25048dd68c8c758dbc39cdc603988bddfe07251568ed72f9d0becc","authority":"explicit-repository-root","transition":"confirmed","scopeKind":"command","scopeId":null,"targetKind":"repository-root","pathVisibility":"local","actionable":true}}
```

## Test Evidence

<a name="current-session-reproduction"></a>
### Current-Session Reproduction

**Phase:** bug
**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --diagnostic --label "BUG-027 registered per-page check reproduction" -- env PAGE=company-intelligence-lab.html timeout 60 node -e '<exact registered one-liner>'`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-027 registered per-page check reproduction
$ env PAGE=company-intelligence-lab.html timeout 60 node -e const fs=require("node:fs");const p=process.env.PAGE;if(!p)throw new Error("PAGE is required");const h=fs.readFileSync(p,"utf8");const scripts=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());if(!scripts.length)throw new Error("no inline script: "+p);scripts.forEach((s,i)=>{try{new Function(s)}catch(e){throw new Error("inline script "+(i+1)+": "+e.message)}});const ids=new Set([...h.matchAll(/\bid=["\x27]([^"\x27]+)["\x27]/g)].map(m=>m[1]));const refs=scripts.flatMap(s=>[...s.matchAll(/getElementById\(\s*["\x27]([^"\x27]+)["\x27]\s*\)/g)].map(m=>m[1]));const missing=[...new Set(refs.filter(id=>!ids.has(id)))];if(missing.length)throw new Error("missing ids: "+missing.join(", "));console.log("OK page="+p+" inline="+scripts.length+" refs="+refs.length)
exit: 1
lines: 17
sha256: 1f8854e5c32a8d77df91949ddb78a7d54c4903f411bcdccd0604975c58951401
escalation: diagnostic (bounded retention waived for this invocation)
--- output ---
[eval]:1
const fs=require("node:fs");const p=process.env.PAGE;if(!p)throw new Error("PAGE is required");const h=fs.readFileSync(p,"utf8");const scripts=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());if(!scripts.length)throw new Error("no inline script: "+p);scripts.forEach((s,i)=>{try{new Function(s)}catch(e){throw new Error("inline script "+(i+1)+": "+e.message)}});const ids=new Set([...h.matchAll(/\bid=["\x27]([^"\x27]+)["\x27]/g)].map(m=>m[1]));const refs=scripts.flatMap(s=>[...s.matchAll(/getElementById\(\s*["\x27]([^"\x27]+)["\x27]\s*\)/g)].map(m=>m[1]));const missing=[...new Set(refs.filter(id=>!ids.has(id)))];if(missing.length)throw new Error("missing ids: "+missing.join(", "));console.log("OK page="+p+" inline="+scripts.length+" refs="+refs.length)
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

The receipt hash matches the origin finding’s recorded failing output. This invocation produced the receipt independently.

<a name="id-allocation"></a>
### Collision-Free ID Allocation

**Phase:** bug
**Command:** `timeout 60 find specs/_bugs -mindepth 1 -maxdepth 1 -type d -name 'BUG-*' -print && timeout 60 find specs -type d -name 'BUG-027*' -exec printf 'BUG_027_COLLISION=%s\n' '{}' ';' && printf 'BUG_027_COLLISION_SCAN_EXIT=0\n'`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The root inventory ends at BUG-026. The all-spec scan emitted no collision record for BUG-027 and reached its exit sentinel.

```text
specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite
specs/_bugs/BUG-021-pack-read-has-no-bound-so-the-route-waits-without-end
specs/_bugs/BUG-023-cockpit-disclosure-test-reads-a-mid-load-lull-as-settled
specs/_bugs/BUG-024-attention-exclusion-record-asserted-as-overwritten
specs/_bugs/BUG-025-company-corpus-read-never-settles
specs/_bugs/BUG-026-superseded-company-corpus-state-writes
BUG_027_COLLISION_SCAN_EXIT=0
```

The displayed window contains the highest IDs from the complete 27-path output. The command produced the complete inventory without a discarding pipe.

<a name="file-grounding"></a>
### File Grounding

**Claim Source:** interpreted
**Interpretation:** These conclusions combine direct file reads with the executed command above. No runtime pass claim is inferred from source inspection.

- `.specify/memory/agents.md` says the command parses every non-`src` inline script.
- The same command maps matches to body strings before its unconditional `new Function()` loop.
- `company-intelligence-lab.html` declares an inert `application/json` configuration mirror.
- `tests/company-intelligence.unit.mjs` selects that block, parses it with `JSON.parse`, and checks deep equality.
- The origin report’s `gaps-phase-complete-browser` section records prior browser evidence. That prior receipt remains diagnostic input, not current-session execution evidence for this filing.

### Delivery Verification

**Phase:** bug
**Claim Source:** not-run

> **Uncertainty Declaration**
> **What was attempted:** The exact current command was reproduced and the owning files were inspected.
> **What was observed:** The command exits 1 on the inert JSON block before its executable checks finish.
> **Why this is uncertain:** This filing-only invocation changed no command, validator, or test carrier.
> **What would resolve this:** Implement the finalized design, capture each adversarial RED and GREEN, and rerun the registered command against the real page.

## Code Diff Evidence

The allowed mutation is this new BUG-027 packet plus the minimal BUG-025 routing closure. No source, test, command-registry, README, DomainModel, portfolio, baseline, or framework-managed file belongs to this invocation.

## Uncertainty Declarations

Implementation, post-fix command behavior, regression status, and browser preservation remain unclaimed. Their scope items stay unchecked.

## Scenario Contract Evidence

The scenario manifest records four stable planned contracts. Each contract uses the framework future-test sentinel and has no linked test. Design and planning have not selected a carrier path, and this invocation created no test file.

## Coverage Report

No coverage command ran. Coverage is not a filing-phase claim.

## Lint/Quality

<a name="filing-artifact-lint"></a>
### Filing Artifact Lint

**Phase:** bug
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-027 final filing artifact lint" -- timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-027-per-page-check-executes-inert-json`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-027 final filing artifact lint
$ timeout 240 bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-027-per-page-check-executes-inert-json
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

The lint validates packet structure only. It does not claim that the command defect is repaired.

<a name="filing-artifact-hygiene-2026-08-31"></a>
### Filing Artifact Hygiene Correction

The initial filing named a focused carrier path before design and planning selected it. The repository path guard classified that unauthored carrier as active missing work.

This correction removes the premature path token from the filing seed. It retains all four Gherkin scenarios, both focused Test Plan rows, and every scenario-specific negative control. The scenario manifest now uses its future-test sentinel and keeps `linkedTests` empty.

No `test-plan.json` was added. That artifact belongs to `bubbles.plan`, and BUG-027 has not reached its planning phase. No test, validator, command-registry entry, selftest logic, or baseline changed.

#### Focused Spec-Test-Path Validator

**Phase:** bug
**Command:** `timeout 180 bash .github/bubbles/scripts/evidence-capture.sh --diagnostic --label "BUG-025-SELFTEST-001 final spec test paths" -- timeout 120 node scripts/validate-spec-test-paths.mjs --all-sites`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-025-SELFTEST-001 final spec test paths
$ timeout 120 node scripts/validate-spec-test-paths.mjs --all-sites
exit: 0
lines: 2
sha256: dae8d5d0d8c20827b53d329efc4fa7b6b1384ebcef6591c1dd2e46f81e5fa669
escalation: diagnostic (bounded retention waived for this invocation)
--- output ---
[spec-test-paths] scanned=890 references=21205 distinctPaths=270 missingPaths=70 plannedMissing=0 baseline=70 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
<!-- verify: bash bubbles/scripts/evidence-capture.sh --verify dae8d5d0d8c20827b53d329efc4fa7b6b1384ebcef6591c1dd2e46f81e5fa669 -- timeout 120 node scripts/validate-spec-test-paths.mjs --all-sites -->
```

The `new=0` result closes `BUG-025-SELFTEST-001`. It does not claim that a BUG-027 carrier exists.

#### Repository Selftest Residual

**Phase:** bug
**Command:** `timeout 960 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-025-SELFTEST-001 final repository selftest" -- timeout 900 node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-025-SELFTEST-001 final repository selftest
$ timeout 900 node scripts/selftest.mjs
exit: 1
lines: 3907
sha256: 20a01ffd5d23f49171f23019c5e9a9abb74c04d6163659ee2fabccbac6037132
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
    ✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (95 claim(s) across 72 packet(s), 80 agreeing, baseline 14 entries)
    ✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
        NEW-DRIFT specs/_bugs/BUG-025-company-corpus-read-never-settles#01::certification (01-declare-and-enforce-one-read-bound) — claims 0/8 checked/unchecked, artifact has 0/9 [specs/_bugs/BUG-025-company-corpus-read-never-settles/scopes.md]
    ✗ FAIL: no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (1 new, 14 frozen, 0 stale of 95 claim(s))
    ✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
    ✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
    ✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
    ✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3436 passed, 1 failed
================================================
```

The sole selftest failure is BUG-025 certification progress claiming 0/8 while its scope has 0/9 items. That field belongs to `bubbles.validate` and remains unchanged.

## Spot-Check Recommendations

- Confirm the finalized executable MIME allowlist against current repository pages.
- Confirm inert JSON strings cannot enter the literal DOM-reference scan.
- Confirm the focused test invokes the same implementation as the registered command.

## Validation Summary

No validate-owned certification ran. The packet remains `in_progress`.

## Validation Evidence

**Executed:** NO
**Command:** none
**Phase Agent:** `bubbles.validate`
**Claim Source:** not-run

No validation phase ran during bug filing.

## Audit Evidence

**Executed:** NO
**Command:** none
**Phase Agent:** `bubbles.audit`
**Claim Source:** not-run

No audit phase ran during bug filing.

## Chaos Evidence

**Executed:** NO
**Command:** none
**Phase Agent:** `bubbles.chaos`
**Claim Source:** not-run

No chaos phase applies to the filing claim.
