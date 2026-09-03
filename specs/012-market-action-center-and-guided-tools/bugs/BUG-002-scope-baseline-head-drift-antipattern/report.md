# Report: BUG-002 Feature 012 Test-Infra Moving-HEAD Baseline-Authority Drift

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md)

## Summary

DISCOVERY + ROOT-CAUSE + ROUTING packet. All evidence below is from **read-only**
execution on current bytes (`HEAD f1b5f633`, session date 2026-07-24). No test,
product, or parent-Feature-012 file was modified; no git mutation was performed.
`node --test` runs are read-only against the working tree (they sandbox to
`mkdtemp` temp dirs and only *read* git).

## Completion Statement

The systemic moving-`HEAD` baseline-authority drift across Feature 012 functional
tests is discovered, root-caused, classified per site (baseline-repin vs
design-intent-gated vs unrelated), and routed to the parent Feature 012 owner. The
`SCN-012-003` decorator remediation is explicitly flagged OWNER-GATED. This packet
touched ONLY its own bug folder.

---

## Current byte provenance (read-only)

**Claim Source:** executed.

```
=== REPO BINDING VERIFY ===
--- no research-lab.sh? ---
(no research-lab.sh — build-free confirmed)
=== GIT HEAD (read-only) ===
f1b5f633 (HEAD -> main, origin/main, origin/HEAD) feat(012): Scope 05 swing-transition/v1 adapter (4/8)
--- recent 5 ---
f1b5f633 (HEAD -> main, origin/main, origin/HEAD) feat(012): Scope 05 swing-transition/v1 adapter (4/8)
861e4dfc feat(012): Scope 05 session-auction/v1 adapter (3/8)
4d4cd3d7 feat(012): Scope 05 partial — market-breadth + conditional-volatility adapters (2/8)
c81d808d feat(012): Market Action Center Scopes 01-04 + BUG-004 two-tier provider access
767732db chore(bubbles): refresh 7.20.1 installer payload
```
`HEAD` moved again during authoring (`861e4dfc` → `f1b5f633`), confirming the
operator's parallel Feature 012 churn and the "moving baseline" hazard.

---

## Blast-radius scan (read-only)

**Claim Source:** executed. Command: `grep -rn "show.*HEAD:" tests/` and `grep -rn baselineBytes tests/`.

```
=== SCAN 1: git show HEAD: anti-pattern in tests/ ===
tests/brief-refresh-atomicity.support.mjs:83:    writeFileSync(wrapperPath, execFileSync('git', ['show', 'HEAD:scripts/brief-refresh-and-push.sh'], { cwd: ROOT }));
tests/contextual-tooltip.functional.mjs:115:  return execFileSync('git', ['show', `HEAD:${relativePath}`], { cwd: ROOT });
tests/tool-experience-registry.functional.mjs:236:  return JSON.parse(execFileSync('git', ['show', 'HEAD:tools.json'], {
tests/tool-experience-registry.functional.mjs:405:    const baselineToolsBytes = execFileSync('git', ['show', 'HEAD:tools.json'], { cwd: REPOSITORY_ROOT });
tests/tool-experience-registry.functional.mjs:406:    const baselineSelftestBytes = execFileSync('git', ['show', 'HEAD:scripts/selftest.mjs'], { cwd: REPOSITORY_ROOT });
tests/tool-experience-shell.functional.mjs:120:// modern shell into rlviews.js at HEAD, so `git show HEAD:rlviews.js` now
SCAN1_RC=0

=== SCAN 2: baselineBytes in tests/ ===
tests/contextual-tooltip.functional.mjs:114:function baselineBytes(relativePath) {
tests/contextual-tooltip.functional.mjs:120:    writeFileSync(join(sandboxRoot, relativePath), baselineBytes(relativePath));
tests/contextual-tooltip.functional.mjs:264:    assert.equal(bytes.equals(baselineBytes(relativePath)), true, `${relativePath} must use exact HEAD authority bytes`);
tests/contextual-tooltip.functional.mjs:540:          sha256(baselineBytes(relativePath)),
tests/tool-experience-shell.functional.mjs:135:function baselineBytes(relativePath) {
tests/tool-experience-shell.functional.mjs:346:    writeFileSync(join(sandboxRoot, 'rlviews.js'), baselineBytes('rlviews.js'));
tests/tool-experience-shell.functional.mjs:347:    writeFileSync(join(sandboxRoot, 'rlapp.js'), baselineBytes('rlapp.js'));
```

Note: `tool-experience-shell.functional.mjs:120` is a **comment** and `:135`
`baselineBytes` is the ALREADY-FIXED definition that pins `767732db` (not `HEAD`).

---

## `SCN-012-003` design-intent fact: decorator refs 0 → 2 (read-only)

**Claim Source:** executed.

```
=== DECORATOR REFS in market-heatmap-lab.html @ pre-Scope-02 anchor 767732db ===
count_767732db=0

=== DECORATOR REFS in market-heatmap-lab.html @ HEAD (f1b5f633) ===
411:    <script src="rlexperience.js" defer></script>
412:    <script src="rlcontext.js" defer></script>
count_HEAD=2

=== which commit introduced decorator refs to market-heatmap-lab.html? ===
c81d808d feat(012): Market Action Center Scopes 01-04 + BUG-004 two-tier provider access
```

The operator deliberately committed the decorator refs to `HEAD`. Whether the
`SCN-012-003` legacy-canary negative assertion should therefore change is an
**owner/design-intent decision** — flagged, not decided.

---

## Test Evidence

All test evidence below is from **read-only** `node --test` runs on current bytes
(`HEAD f1b5f633`). Each run sandboxes to `mkdtemp` temp dirs and only *reads* git; no
working-tree file is modified.

| File | Scenario | Command | Result |
|------|----------|---------|--------|
| `tests/contextual-tooltip.functional.mjs` | `SCN-012-003` | `node --test tests/contextual-tooltip.functional.mjs` | RED — `tests 9 / pass 8 / fail 1` (exit 1) |
| `tests/tool-experience-registry.functional.mjs` | `SCN-012-033` | `node --test tests/tool-experience-registry.functional.mjs` | RED — `tests 7 / pass 4 / fail 3` (exit 1) |
| `tests/tool-experience-shell.functional.mjs` | `SCN-012-031` | `node --test tests/tool-experience-shell.functional.mjs` | GREEN — `tests 3 / pass 3 / fail 0` (exit 0) |

### `SCN-012-003` current state: RED (read-only `node --test`)

**Claim Source:** executed. `node --test tests/contextual-tooltip.functional.mjs` → `TOOLTIP_EXIT=1`.

```
# Subtest: SCN-012-003 isolated rollback restores legacy providers and exact current Scope 03 bytes
not ok 8 - SCN-012-003 isolated rollback restores legacy providers and exact current Scope 03 bytes
    The input was expected to not match the regular expression /src="rlcontext\.js|src="rlexperience\.js/. Input:
                href="notes/market-heatmap-lab.md">notes/market-heatmap-lab.md</a>.
        <script src="rlexperience.js" defer></script>
        <script src="rlcontext.js" defer></script>
  operator: 'doesNotMatch'
    verifyLegacyCanaryPages (file:///home/redacted/research-lab/tests/contextual-tooltip.functional.mjs:265:12)
# Subtest: SCN-012-003 exact TP-03-01 through TP-03-05 commands replay RED then GREEN in isolated rollback baseline
ok 9 - SCN-012-003 exact TP-03-01 through TP-03-05 commands replay RED then GREEN in isolated rollback baseline
# tests 9
# pass 8
# fail 1
# skipped 0
```

Root cause confirmed: the "legacy" `market-heatmap-lab.html` is reconstructed from
`baselineBytes` (= `git show HEAD:`), which now carries the two decorator scripts, so
the `doesNotMatch(/rlcontext|rlexperience/)` legacy-canary assertion fails.

---

### `SCN-012-033` pre-remediation state: RED, same HEAD-drift class (read-only `node --test`)

> Superseded for the drift class by the remediation recorded immediately below
> (commit `db16cd47`). Retained verbatim as the captured pre-fix evidence.

**Claim Source:** executed. `node --test tests/tool-experience-registry.functional.mjs` → `REGISTRY_EXIT=1`.

```
# Subtest: SCN-012-033 actual registry resolves all 23 entries and preserves every pre-existing field
not ok 1 - SCN-012-033 actual registry resolves all 23 entries and preserves every pre-existing field
  name: 'AssertionError'
...
# Subtest: SCN-012-033 rollback rehearsal replays RED then restores exact Scope 01 bytes without touching protected data
not ok 6 - SCN-012-033 rollback rehearsal replays RED then restores exact Scope 01 bytes without touching protected data
    rolled-back registry must be semantically equal to HEAD
  name: 'AssertionError'
# tests 7
# pass 4
# fail 3
# cancelled 0
# skipped 0
```

Both failing sites source the baseline from `HEAD:tools.json`. Failing assertion
messages (from the captured run): `experience is the only tools.json addition`
(subtest 1, line ~260, `baseline = baselineRegistry() = git show HEAD:tools.json`,
which now HAS experience objects) and `rolled-back registry must be semantically
equal to HEAD` (subtest 6). Both are the same moving-`HEAD` baseline anti-pattern.

---

### `SCN-012-033` remediation IMPLEMENTED — drift class eliminated (commit `db16cd47`)

**Claim Source:** executed. The routed baseline-repin (design.md Principle 1) was
implemented for `tests/tool-experience-registry.functional.mjs`.

```text
$ grep -c "live 'git show HEAD:' reads" tests/tool-experience-registry.functional.mjs
  0        (was 3: baselineRegistry + 2 rollback-rehearsal reads)

$ pinned authority
  LEGACY_BASELINE_COMMIT = 767732db04e0cd32bf107b2a95030a6771bd16f2
  (immutable parent of c81d808d — the SAME anchor SCN-012-031 already uses)

$ fail-loud guards (FR-B002-02)
  semantic marker  tools.json           must NOT contain "experience"
                   scripts/selftest.mjs must NOT contain "Feature 012"
  sha256           tools.json           6c4e5e02add0e04783a57f45d0fa697d7f19614d9a17515b3454e71a0fbc543f
                   scripts/selftest.mjs fe706d9900f0623108604a2e2adb80a0290c70bad90506e5b1db52980a739965
Exit Code: 0
```

Guards proved LIVE, not decorative — repointing the pin at the post-Scope-01 commit
`c81d808d` fails immediately instead of silently reading modern bytes:

```text
$ perl -i -pe "s/767732db.../c81d808d/" tests/tool-experience-registry.functional.mjs
$ node --test tests/tool-experience-registry.functional.mjs
  legacy baseline tools.json @ c81d808d must not contain the modern marker "experience"
Exit Code: 1
```

No assertion was weakened (FR-B002-03); pass/fail is unchanged at `4 pass / 3 fail`.
The suite was deliberately NOT green-washed. What changed is that the three failures
are now HONEST — they compare against a true immutable pre-experience baseline rather
than against themselves.

### `SCN-012-033` residual: the routed "pure repin" is INSUFFICIENT (new finding)

**Claim Source:** executed. Diff of the current registry against the pinned baseline,
with the `experience` block stripped from the current side.

```text
$ current tools.json (experience stripped) vs 767732db:tools.json
  baseline tools=23  current tools=23
  [0]  market-brief                    -> title, nav
  [12] msft-july-print-model           -> updated, blurb, tags, simpleWiring
  [20] palm-springs-rental-market-lab  -> simpleWiring
  [21] ocean-shores-rental-market-lab  -> simpleWiring
  differing tool entries (experience stripped): 4

$ git log 767732db..HEAD -- tools.json
  b548519e feat(012/scope-15): enforce the SCN-012-039 closed-set total accounting
  380812b4 feat(012/scope-09): rename to Market Action Center + four-view scaffold
  05232f26 msft-july-print-model: options-implied earnings-move model + macro brief
  c81d808d feat(012): Market Action Center Scopes 01-04 + BUG-004 two-tier provider access
Exit Code: 0
```

`design.md` predicted a pure baseline-repin would restore this file. It no longer can.
Four registry entries legitimately changed BEYOND the `experience` block, so the
assertion `experience is the only tools.json addition` is now factually false. **None
of the four is a regression** — all are committed, intended work (Scope 09 rename,
Scope 15 `simpleWiring`, spec 009 model updates).

The assertion compares the CURRENT worktree against a HISTORICAL delta, so it rots as
the registry legitimately evolves — structurally the same defect as the moving-`HEAD`
baseline, one level up. Choosing what it should now assert (scope the containment proof
to the Scope-01 delta on BOTH sides, vs. assert `experience` is purely ADDITIVE — no
baseline field removed) is a design-intent decision. Per design.md Principle 2, such
choices are "a design-intent decision the owner must make, NOT a guess this packet may
take", so `SCN-012-033` is reclassified **owner-gated**, alongside `SCN-012-003`.
Guessing it green would mask real registry mutation.

---

### `SCN-012-031` reference fix: GREEN, preserved (read-only `node --test`)

**Claim Source:** executed. `node --test tests/tool-experience-shell.functional.mjs` → `SHELL_EXIT=0`.

```
# Subtest: SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes
ok 3 - SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes
# tests 3
# pass 3
# fail 0
# skipped 0
```

The reference remediation (`LEGACY_BASELINE_COMMIT = 767732db`, `MODERN_SHELL_MARKER`,
`LEGACY_BASELINE_SHA256` fail-loud guards) is GREEN and is the model for the routed fix.

---

## `brief-refresh-atomicity.support.mjs`: cleared as UNRELATED (read-only)

**Claim Source:** executed.

```
=== brief-refresh-atomicity: is HEAD read env-gated (not a legacy-baseline authority)? ===
82:  if (process.env.BUG002_WRAPPER_SOURCE === 'HEAD') {
83:    writeFileSync(wrapperPath, execFileSync('git', ['show', 'HEAD:scripts/brief-refresh-and-push.sh'], { cwd: ROOT }));
85:    copyFileSync(resolve(ROOT, 'scripts/brief-refresh-and-push.sh'), wrapperPath);
```

The `git show HEAD:` read is behind an opt-in env flag (`BUG002_WRAPPER_SOURCE === 'HEAD'`);
the default path copies the working-tree wrapper. It seeds a fixture repo with the
CURRENT wrapper for a brief-refresh atomicity/boundary test — it does not reconstruct
a frozen legacy baseline and does not assert legacy-vs-modern divergence. NOT the drift
anti-pattern; no change required. (`BUG002_WRAPPER_SOURCE` refers to the repository-level
`specs/_bugs/BUG-002-two-tier-provider-access` harness — distinct from this feature-scoped
BUG-002.)

---

## Findings Ledger (one per affected test site)

| Finding | Site | Scenario | Class | State | Disposition |
|---------|------|----------|-------|-------|-------------|
| F-BUG002-001 | `tests/tool-experience-shell.functional.mjs` | `SCN-012-031` | baseline-repin (ALREADY FIXED — reference) | GREEN | PRESERVE byte-for-byte |
| F-BUG002-002 | `tests/contextual-tooltip.functional.mjs` | `SCN-012-003` | ~~design-intent-gated~~ → **baseline-repin** (MISCLASSIFIED at triage) | **RESOLVED** (`<pending>`) | Re-examination shows this was never a design-intent question. `baselineBytes()` read `git show HEAD:` and `applyLegacyBaseline()` wrote those bytes into the sandbox as the "legacy" pre-Scope-03 state — true only while HEAD was still pre-Scope-03. After `c81d808d` the "legacy" pages were the MODERN pages, so `verifyLegacyCanaryPages()` failed on its own input. Identical class to F-BUG002-001/003, not a decorator design question: production is *supposed* to carry the decorators. Repinned to `767732db` with a decorator-marker guard plus sha256 pins for all 7 authority paths (verified pre-adoption: all 3 canary pages decorator-free, all legacy canaries matching, `rlcontext.js` absent). Per design Principle 2 option (1) a companion CURRENT-state assertion was ADDED proving the modern pages DO carry the wiring, so the repin cannot mask a stripped-decorator regression. Note `scripts/selftest.mjs` pins to `fe706d99…` here and in F-BUG002-003 — same anchor, independently confirmed |
| F-BUG002-008 | `tests/contextual-tooltip.functional.mjs` | `SCN-012-003` (exact-replay, test 9) | **concurrency-unsafe assertion** (NEW — environmental, pre-existing) | OPEN — not in this packet's boundary | The exact-replay test hashes the ENTIRE worktree (`Map(3024)`) and compares before/after across a ~55s run. Any concurrent write to any repository file fails it. Observed flapping 8/1 → 9/0 → 8/1 → 9/0 while a second agent session held 11 files dirty; the single differing entry was that session's own `BUG-004/report.md` hash changing mid-run. NOT caused by the repin (test 8, the repinned site, passed in every run; it was RED before the fix and GREEN after). Fixing it means narrowing the inventory to paths the test actually governs — outside this packet's change boundary and touching another owner's active lane, so it is recorded rather than silently absorbed |
| F-BUG002-003 | `tests/tool-experience-registry.functional.mjs` | `SCN-012-033` | baseline-repin | **drift class FIXED** (`db16cd47`); site still RED for a different, newly-characterized reason | Repin IMPLEMENTED (pinned `767732db` + sha256/marker guards, proved live). Residual reclassified **owner-gated** — see F-BUG002-005 |
| F-BUG002-004 | `tests/brief-refresh-atomicity.support.mjs` | (brief-automation harness) | unrelated | N/A | Cleared — no action |
| F-BUG002-005 | `tests/tool-experience-registry.functional.mjs` | `SCN-012-033` | **design-intent-gated** (NEW — discovered while implementing F-BUG002-003) | **RESOLVED** (`<pending>`) | Routed design assumed a pure repin sufficed; 4 registry entries legitimately changed beyond `experience` (Scope 09 rename, Scope 15 `simpleWiring` x3, spec 009 updates), so `experience is the only tools.json addition` is now false. Owner approved resolution **(a)**: scope the containment proof to the Scope-01 delta on BOTH sides — pin `c81d808d` (marker `"experience"` REQUIRED + sha256 `f77fde77…`) and compare `strip(experience)` against the pre-Scope-01 parent `767732db`. Verified to hold byte-for-byte before adoption. A HEAD-side additive assertion was ADDED (not substituted): every current entry still carries `experience`, and no pre-existing field was dropped. Net assertions increased |
| F-BUG002-006 | `tests/tool-experience-registry.functional.mjs` | `SCN-012-033` (rollback rehearsal) | **unachievable-by-construction** (NEW — discovered while implementing F-BUG002-005) | **RESOLVED** (`<pending>`) | The rehearsal asserted `removeFeature012SelftestBlock(HEAD selftest) === pre-Scope-01 selftest`. This is false at HEAD *and at every commit*: `c81d808d` landed Scopes 01–04 together, so removing the named Scope 01 block still leaves a 7-line Scope 02/03/04 residual (`COMPANY_ROUTE_SCRIPTS`, `resolveArchetypeView`, `RLCOMPANY.evaluateModel`, `data-mode-seg`). No commit isolates the Scope 01 selftest delta, so byte-equality cannot be asserted truthfully. Replaced with provable structural assertions the rehearsal actually depends on: block marker removed, summary marker intact, baseline free of the marker, file strictly shrunk. **This is the one place an assertion was retired rather than retargeted** — recorded explicitly for owner visibility rather than silently dropped |
| F-BUG002-007 | `tests/tool-experience-registry.functional.mjs` | `SCN-012-033` (rollback rehearsal) | **sandbox-manifest-drift** (NEW — masked by F-BUG002-005/006 until they were fixed) | **RESOLVED** (`<pending>`) | Once the baseline conflations were corrected, the restored GREEN probe still failed: `Cannot find module '../rljourney.js'`. The sandbox copies only `SCOPE_ARTIFACTS` + `protectedPaths()`, neither of which had been updated when Scope 08 (`a8efa69d`) made the validator require `rljourney.js` — plus 7 `rlexperience-adapters/*.js`, `rlrental.js`, `rlvol.js` (10 files total). Fixed by DERIVING the dependency set from the validator source instead of adding a third hand-maintained list, so the sandbox cannot drift again; entries already in `SCOPE_ARTIFACTS` are excluded because the rollback deliberately removes those. Protected-file count 56 → 66 |

## Adversarial Proof For F-BUG002-005/006/007

Site state: `tests/tool-experience-registry.functional.mjs` **4 pass / 3 fail → 7 pass / 0 fail (exit 0)**.
Repository selftest unchanged at **970 passed / 0 failed (exit 0)**.

Every changed or added assertion was mutation-tested in a throwaway copy of the repository
(`/tmp/rl-mutate-*`, removed afterwards) so the live worktree was never mutated — confirmed by
`git status --porcelain tools.json rljourney.js` staying empty throughout. Control runs pass
before and after each mutation:

```
  MUT-A: strip experience from one live tool
    exit=1  CAUGHT  Expected values to be strictly equal:
  MUT-B: drop a pre-existing field (blurb) from one live tool
    exit=1  CAUGHT  options-structure-lab dropped pre-existing field(s) [blurb] — experience must remain purely additive
  MUT-C: repoint SCOPE01_REGISTRY_COMMIT at a later commit (380812b4)
    exit=1  CAUGHT  Scope 01 registry @ 380812b4 sha256 drifted from the pinned Scope 01 bytes
  MUT-D: repoint SCOPE01_REGISTRY_COMMIT at the PRE-Scope-01 baseline (767732db)
    exit=1  CAUGHT  Scope 01 registry @ 767732db must contain "experience" — the pin is not the Scope 01 delta
  CONTROL (test 6, unmutated):
    exit=0  PASS
  MUT-E: make the selftest rollback a no-op (block NOT removed)
    exit=1  CAUGHT  rolled-back selftest must no longer declare the Feature 012 Scope 01 block
  MUT-F: delete rljourney.js from the sandbox source tree
    exit=1  CAUGHT  validator dependency rljourney.js must exist in the repository
  RESTORED control:
    exit=0  PASS
```

The rehearsal canary confirms the functional force of the rollback is intact and that the
protected-file set grew by exactly the 10 derived validator dependencies:

```
  # [rollback-canary] snapshot scopeArtifacts=11 protectedFiles=66
  # [rollback-canary] rollback removedArtifacts=9 removedExperienceObjects=23
  # [rollback-canary] scope01 delta toolsByteEqual=true toolsSemanticEqual=true; selftest blockRemoved=true summaryIntact=true (byte-equality unachievable — see F-BUG002-006)
  # [rollback-canary] RED exit=17 [scope01-sandbox-probe] RED missing-contract=tool-experience.config.json,simple-models.json,journeys.json,rlexperience.js,scripts/validate…
  # [rollback-canary] GREEN exit=0 [scope01-sandbox-probe] GREEN tools=23 models=23 journeys=48 adversarial=13
  # [rollback-canary] restore scopeHashesEqual=true protectedHashesEqual=true worktreeHashesEqual=true
```

Pre-adoption verification that the retargeted claim is true (run before any assertion was
written, so the pin was chosen from evidence rather than fitted to a passing result):

```
  baseline commit : 767732db tools: 23 has experience: false
  scope01  commit : c81d808d tools: 23 has experience: true
  scope01 tools.json sha256: f77fde77c4a3e55151c52794dbf0758911e7bd2e9f6d651a195f7eac8af00fee

  CLAIM: strip(experience) from Scope-01 registry === pre-Scope-01 baseline
  RESULT: HOLDS (exact)
```

And the disproof that motivated F-BUG002-006 (the same transform on the selftest, which does
**not** hold at the Scope 01 commit):

```
  CLAIM 1  removeExperienceObjects(scope01 tools.json) === pre-Scope-01 tools.json
    removed: 23   byte-equal: true
  CLAIM 2  removeFeature012SelftestBlock(scope01 selftest) === pre-Scope-01 selftest
    block found+unique+summary: true   byte-equal: false
  => residual delta vs baseline: 7 lines   (Scope 02/03/04 content)
```

## Routing

- **Owner:** parent Feature 012 maintainer (the operator actively working Feature 012).
- **`nextRequiredOwner`:** `bubbles.plan` / `bubbles.design` under a parent Feature 012
  run — gated on operator design-intent confirmation for `SCN-012-003`.
- **Registration:** operator registers this packet when they next touch Feature 012;
  this packet does not modify Feature 012 top-level state.

## Boundary Attestation

- Files created: ONLY under
  `specs/012-market-action-center-and-guided-tools/bugs/BUG-002-scope-baseline-head-drift-antipattern/`
  (`bug.md`, `spec.md`, `design.md`, `scopes.md`, `report.md`, `state.json`).
- No test file, product/page file, `tools.json`, `scripts/**`, Feature 012 top-level
  `state.json`, `scopes/**`, or any other spec was modified **by the discovery packet**.
- **Subsequent routed remediation (separate commit `db16cd47`, not this packet's discovery
  work):** `tests/tool-experience-registry.functional.mjs` only — the F-BUG002-003
  baseline-repin authorised by design.md Principle 1 and the change-boundary row "Repin
  baseline authority + add fail-loud guards". Still untouched there: the owner-gated
  `tests/contextual-tooltip.functional.mjs`, the `SCN-012-031` reference fix, and all
  product bytes (`*.html`, `rl*.js`, `tools.json`, `scripts/**`).
- No git mutation (no commit/push/rebase/reset/checkout). Only read-only git inspection.
- `scenario-manifest.json` / `uservalidation.md` are intentionally deferred to the
  parent Feature 012 plan/validate owners (consistent with `status: not_started` +
  routed; no scenarios are locked and no validation is claimed here).

## Revision-5 Scope 02 Independent Test Reconciliation

The `company-close-feature-028` revision-5 packet was validated before this
reconciliation. The test source and fixture inputs remained byte-identical across
both independent reruns. Both requested titles passed, but these passes do not
close `F-BUG002-008`. The whole-worktree hash assertion remains unsafe under a
concurrent writer, so Scope 02 and BUG-002 remain non-terminal.

### TP-BUG002-F01 Independent Rerun

**Phase:** test
**Claim Source:** executed
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=10s 300 /opt/homebrew/bin/node --test --test-name-pattern='^SCN-012-003 isolated rollback restores legacy providers and exact current Scope 03 bytes$' tests/contextual-tooltip.functional.mjs`
**Exit Code:** 0
**Receipt:** tool-log row 174, `stdoutHash=52a57303ac45c66a0d87632ec61cb99f2bfa5027e146ebc93126310a97dfb58d`, `stderrHash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, `inputClosureCount=31`, source revision `f19f9c34780f25935101e604dbc50a83213e9e4f`.
**Capture:** 16 output lines, full-output SHA-256 `ce769bd140ab415b68aa9d2a903faaba54ca2538d384dcadd618b9f2de3096d9`.

```text
[scope03-rollback] baselineAuthority=fixture:tests/fixtures/feature-012/contextual-tooltip-pre-scope03 contract=feature-012-scope03-legacy-authority/v1 sourceCommit=b533b972a473ffca9252362ecc5d73de52423da9 authorityFiles=7 currentFiles=11 protectedFiles=18772
[scope03-rollback] fixtureControls={"unknownPath":true,"missingFile":true,"sha256":true,"decoratorMarker":true}
[scope03-rollback] legacyRLG=true legacyTickerLink=true legacyChartAttach=true
[scope03-rollback] legacyCanaryPages=3/3
[scope03-rollback] ownerValueFingerprints={"glossary":"ae161620499256c4c7dff9602409772f5a90b84f8a810ea4a973d8975695fc08","ticker":"7bac1db527a8ad039b859f39ca07934107be82afad2082bae8d1cd4d72cff0ff","chart":"c86e269fc72784ed7a30624dc5f38a80aa48284f4a1652bcb4502da961457737"} unchanged=true
[scope03-rollback] currentHashesEqual=true protectedHashesEqual=true realWorktreeHashesEqual=true
[scope03-rollback] tempRootRemoved=true
✔ SCN-012-003 isolated rollback restores legacy providers and exact current Scope 03 bytes (9048.782ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9102.760375
```

### TP-BUG002-F02 Independent Rerun

**Phase:** test
**Claim Source:** executed
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=10s 300 /opt/homebrew/bin/node --test --test-name-pattern='^SCN-012-003 exact TP-03-01 through TP-03-05 commands replay RED then GREEN in isolated rollback baseline$' tests/contextual-tooltip.functional.mjs`
**Exit Code:** 0
**Receipt:** tool-log row 175, `stdoutHash=49930cc92d06d9eee07fe8b17214205876531b05440efcacc610e2b81fe2b13c`, `stderrHash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, `inputClosureCount=31`, source revision `f19f9c34780f25935101e604dbc50a83213e9e4f`.
**Capture:** 24 output lines, full-output SHA-256 `3560750b733e05e40ded9e6ad4b266ed84730a3f85cf696bb1dcac894aa220fb`.

```text
[scope03-exact-replay] sandbox=research-lab-scope03-exact-replay-u8cjR2 baselineAuthority=fixture:tests/fixtures/feature-012/contextual-tooltip-pre-scope03 contract=feature-012-scope03-legacy-authority/v1 sourceCommit=b533b972a473ffca9252362ecc5d73de52423da9 authorityFiles=7
[scope03-exact-replay] redPrerequisite=data-heatmap-hydration="ready" sandboxOnly=true decoratorsAdded=false
[scope03-exact-replay] RED-stage TP-03-01 exit=1 discriminator=missing-contextual-foundation
[scope03-exact-replay] RED-stage TP-03-02 exit=1 discriminator=missing-contextual-foundation
[scope03-exact-replay] RED-stage TP-03-03 exit=1 discriminator=missing-contextual-foundation
[scope03-exact-replay] RED-stage TP-03-04 exit=1 discriminator=missing-contextual-foundation
[scope03-exact-replay] RED-stage TP-03-05 exit=1 discriminator=missing-contextual-foundation
[scope03-exact-replay] restore productionHashesEqual=true
[scope03-exact-replay] GREEN-stage TP-03-01 exit=0 expectedCount=5/5
[scope03-exact-replay] GREEN-stage TP-03-02 exit=0 expectedCount=7/7 child guard
[scope03-exact-replay] GREEN-stage TP-03-03 exit=0 expectedCount=1/1
[scope03-exact-replay] GREEN-stage TP-03-04 exit=0 expectedCount=1/1
[scope03-exact-replay] GREEN-stage TP-03-05 exit=0 expectedCount=1/1
[scope03-exact-replay] protectedHashesEqual=true realWorktreeHashesEqual=true
[scope03-exact-replay] tempRootRemoved=true
✔ SCN-012-003 exact TP-03-01 through TP-03-05 commands replay RED then GREEN in isolated rollback baseline (49295.0035ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 49346.970042
```

### BUG-002 Artifact And Traceability Checks

**Phase:** test
**Claim Source:** executed
**Command:** revision-5 matrix running `artifact-lint.sh`, `scenario-obligation-lint.sh`, `scenario-test-resolve.sh`, `test-mechanism-lint.sh`, and `traceability-guard.sh --all-scopes` against this BUG-002 packet.
**Exit Code:** 0
**Receipt:** tool-log row 176, `stdoutHash=46175a7cee4865918ac775a1ec4b12577f81c0dfdfb1e973fd515a1cb88e3f6d`, `stderrHash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
**Capture:** 94 output lines, full-output SHA-256 `94bef04897820fe912a2c23a6739cf8f038d61f10a88e0abf5207ad8bec5aa29`.

```text
CHECK_END name=artifact-lint exit=0 expected=0
CHECK_END name=scenario-obligation exit=0 expected=0
CHECK_END name=scenario-test-resolution exit=0 expected=0
CHECK_END name=test-mechanism exit=0 expected=0
CHECK_END name=traceability exit=0 expected=0
Scenarios checked: 2
Test rows checked: 7
Concrete test file references: 2
DoD fidelity scenarios: 2 (mapped: 2, unmapped: 0)
RESULT: PASSED (0 warnings)
BUG002_PRE_RECONCILE_CHECK_FAILURES=0
```

### F-BUG002-008 Whole-Worktree Concurrency Finding

**Phase:** test
**Claim Source:** executed
**Command:** revision-5 receipt-parity query plus executable inventory oracle over `tests/contextual-tooltip.functional.mjs` and the current repository tree.
**Exit Code:** 0
**Receipt:** tool-log row 177, `stdoutHash=2224bf1dd166ccd904eb5ec34aa96590cfae4e767bc24b0e5af90f799fd5a818`, `stderrHash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
**Capture:** 19 output lines, full-output SHA-256 `27ee928ec3b6cde65474dd87eb4682d7023aa8e92245d8075021cb54e6525384`.

```text
inputClosuresByteIdentical=true
sourceRevisionEqual=true
SOURCE=tests/contextual-tooltip.functional.mjs
SOURCE_SHA256=fcd171ed8932f6a5191eb6e77ef9d2b48f230090a999f69c07a4c9b9f3adcc07
INVENTORY_MODE=whole-worktree
LIST_REGULAR_FILES_ROOT_CALLS=2
ROOT_WORKTREE_HASH_CALLS=4
HISTORICAL_REPORTED_FILE_COUNT=3024
CURRENT_REGULAR_FILE_COUNT=18783
CURRENT_SCOPE03_PATH_COUNT=11
CURRENT_PROTECTED_FILE_COUNT=18772
SCOPED_ORACLE_DECLARED=false
CONCURRENCY_UNSAFE=true
WHOLE_WORKTREE_ORACLE_EXIT=0
660:    const worktreePaths = listRegularFiles(ROOT);
791:    const worktreePaths = listRegularFiles(ROOT);
CALLSITE_SEARCH_EXIT=0
```

The historical 3,024-file observation has grown to 18,783 regular files, but the
defect is unchanged: both exact tests hash every non-excluded worktree file, not a
closed Scope 03 path inventory. The serial passes prove the current bytes when no
writer races them. They do not prove concurrency safety. The required disposition
is `route_required` to `bubbles.plan`. The plan must authorize a focused test-only
repair, define the governed path inventory, and define a negative control that
fails when a governed path changes while ignoring unrelated concurrent report
writes. No test implementation change is authorized by this reconciliation.

### Post-Reconciliation Governance And Preservation

**Phase:** test
**Claim Source:** executed
**Command:** post-reconciliation artifact, scenario, traceability, reference,
technical-prose, and execution-substate matrix followed by the protected-surface
aggregate byte comparison.
**Exit Code:** 0 for both commands.
**Governance receipt:** tool-log row 178,
`stdoutHash=aa13883d2981adf5217197ab944a22575bf33bccefcb34db016ca58a0a5f1ae3`,
`stderrHash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
The bounded governance capture contains 116 lines with full-output SHA-256
`0032b57b8ed445533a59c995c940d864b5fb8a992a9b109acd23b40c04ca28c4`.
**Preservation receipt:** tool-log row 179,
`stdoutHash=bdd01b340c9739d2481e6c0fc8625375a77ff6d81363e86cffc865b645f5917d`,
`stderrHash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
The preservation capture contains 15 lines with full-output SHA-256
`3e771b38d5bd7798e8e9b7461203208a48c51fadc134f47e7f754ae80ca003dc`.

```text
CHECK_END name=artifact-lint exit=0 expected=0
CHECK_END name=scenario-obligation exit=0 expected=0
CHECK_END name=scenario-test-resolution exit=0 expected=0
CHECK_END name=test-mechanism exit=0 expected=0
CHECK_END name=traceability exit=0 expected=0
CHECK_END name=reference-existence exit=0 expected=0
CHECK_END name=technical-prose exit=0 expected=0
CHECK_END name=execution-substate exit=0 expected=0
BUG002_POST_RECONCILE_CHECK_FAILURES=0
feature017 files=20 sha256=ada10d8b3945cf0c20d74b6d4118a1979b940bd24730f65de6ffed643747e238 unchanged=true
feature019 files=17 sha256=59a4aa95dde6bc80d60e9df097c0c0f27a4618aeefd00ed3a1d65a2d3b166d36 unchanged=true
feature028 files=8 sha256=01f4e354ffae5fbb53448df62651181b4c9d7f8305b18efb1491e24b7c75f079 unchanged=true
product files=152 sha256=ad03adaa71c225a7de5be4403ba87b90e3e199f8d7b6d1e4572bb588243f16d4 unchanged=true
companyPublication files=7568 sha256=e9b362ba9221af664caed178a3f62cf7593b1b541d4395ae2220f0552bca0fea unchanged=true
humanAcceptance files=65 sha256=106c6e42f120186acef33f4aed7fa87fed943fffb7a6fd3f05343b134e68b528 unchanged=true
testSource sha256=fcd171ed8932f6a5191eb6e77ef9d2b48f230090a999f69c07a4c9b9f3adcc07 unchanged=true
PROTECTED_IDENTITY_FAILURES=0
PRODUCT_COMPANY_PUBLICATION_HUMAN_ACCEPTANCE_PRESERVED=true
```

### Regression Quality, Skip, And Mock Audit

**Phase:** test
**Claim Source:** executed
**Command:** `regression-quality-guard.sh --bugfix` plus explicit skip-marker and
live-test interception scans over the selected functional and browser files.
**Exit Code:** 0
**Receipt:** tool-log row 181,
`stdoutHash=ec3fd3f50478482ec952129c9e0daad32511728f61cd994683da83c920b09cc9`,
`stderrHash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
The bounded capture contains 22 lines with full-output SHA-256
`833f86981b5b443980eaa7abf0c4872c90d91f36edf3e0912441ec382324c70b`.

```text
BUBBLES REGRESSION QUALITY GUARD
Bugfix mode: true
Scanning tests/contextual-tooltip.functional.mjs
Adversarial signal detected in tests/contextual-tooltip.functional.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1
REGRESSION_QUALITY_EXIT=0 expected=0
SKIP_MARKER_SEARCH_EXIT=1 expected=1
LIVE_TEST_MOCK_SEARCH_EXIT=1 expected=1
NEGATIVE_CONTROL_UNKNOWN_MISSING_SHA_MARKER=true
BUG002_REGRESSION_AUDIT_FAILURES=0
```

## Scope 02 Revision-6 Test-Owned Matrix Closure - 2026-09-02 {#scope-02-revision-6-test-owned-matrix-closure-2026-09-02}

### Authority And Governed Epoch {#bug002-revision-6-governed-epoch}

**Phase:** test
**Claim Source:** executed
**Repository decision:** `rb:vscode-a66638659f347684a54d8a6f9606fa12:6:node:company-close-feature-028`
**Control revision:** `6`
**Repository root:** `/private/tmp/research-lab-company-intelligence-delivery-r11`
**Packet result:** actionable scoped scenario node; validator exit `0`
**Linked-test result:** six literal titles resolved; exit `0`; receipt stdout SHA-256 `2210d35aa52cb05d0b5618f342b85dd0bb9ac750cc8b3f35a4dbdb47d4a58de0`
**Runner identity:** checkout-local Playwright `1.61.1`; exit `0`; receipt stdout SHA-256 `d690335024dc9adc64d5d888251a993bac344ca4a7340606dabd063160896171`
**Epoch path count:** `11`
**Epoch identity:** `sha256:24bbfc710e87a6718967f795eb15b9540165299232807dca93e2241cff0c7d33`
**Epoch-start full-output SHA-256:** `bfff3f98c297c34e66c5dcee53df886d75073bd352fad51d6da244430ad70fbe`
**Epoch-end receipt:** row `209`, exit `0`, stdout SHA-256 `f6d9adc3dd463add66bb38bce34b68b97e61c5db6360462899b69a65f86ab03c`
**Epoch-end full-output SHA-256:** `4c14616a2d93d96402bd6272cd71055fd989cdca1b7594211f428ee021c259ce`
**Final process scan:** no contextual-tooltip functional, browser, or selftest process; `pgrep` exit `1`

```text
EPOCH_END_PATH path=rlcontext.js sha256=1c725896c579aed4a10d0814acb2be13a704787d26f8d04330e050cbb4ea14f8
EPOCH_END_PATH path=rlg.js sha256=138715b89a705efafdf4d6393c064c48ec18aa32f9a0790eb537edf032d462c8
EPOCH_END_PATH path=rlticker.js sha256=990c6ee9172d1bd2440119cf01b82a74549913c7264b918fece7db69bba44a93
EPOCH_END_PATH path=rlchart.js sha256=aa56eb130c26d285792e0ec8757d27cdfbe99a05ec019f7ccd5947136ee6a034
EPOCH_END_PATH path=market-heatmap-lab.html sha256=8cbaeb30112191c62e967ce831cadb26e0aada615655e19754a3b4642d2fb285
EPOCH_END_PATH path=options-structure-lab.html sha256=0284b4c6af354ceb8c6469945faf1a76572ec22d6b394933b0fdfd03613462fc
EPOCH_END_PATH path=company-fundamentals-lab.html sha256=b307fb846189bad0373c50ed541099ebb83919976400423636a4a492c2415dc4
EPOCH_END_PATH path=scripts/selftest.mjs sha256=1b49e9cf603819eb31adf85742906995fb67eac79a60c3661fe9738be1c67fa8
EPOCH_END_PATH path=tests/contextual-tooltip.unit.mjs sha256=6303fde326798466d1145397dc007672517fbcdf578ca15b75f67e617ee744a2
EPOCH_END_PATH path=tests/contextual-tooltip.functional.mjs sha256=8c545fbd005dd7324884be2b07e6ea72e1c401161b5af88b7ed178537275c780
EPOCH_END_PATH path=tests/contextual-tooltip.spec.mjs sha256=c90def41f65267a31cf98e78a7a59fa5c10d6a8bfc037dccfd02b39326855d14
GOVERNED_EPOCH_END=sha256:24bbfc710e87a6718967f795eb15b9540165299232807dca93e2241cff0c7d33 paths=11
GOVERNED_EPOCH_STABLE=true
```

### TP-BUG002-RED-01 {#tp-bug002-red-01-revision-6-closure}

**Phase:** test
**Claim Source:** executed
**Evidence source:** [Feature 028 exact TP-05-08 unchanged-tree matrix](../../../028-company-intelligence-publication-and-brief-transaction/report.md#exact-tp-05-08-unchanged-tree-matrix)
**Command:** `node --test tests/*.unit.mjs && node --test tests/*.integration.mjs && node --test tests/*.functional.mjs && node --test tests/*.test.mjs && npx --no-install playwright test tests/company-intelligence-publication.spec.mjs tests/company-intelligence-lab.spec.mjs tests/tool-discovery.spec.mjs tests/deployed-site-parity.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** `1`
**Receipt:** parent Feature 028 tool-log row `150` at `2026-09-01T20:35:51Z`
**Receipt stdout SHA-256:** `79d78c698b9517c1bc55830d9e457f15ca3464257e54cccb07321206c75e2252`
**Receipt stderr SHA-256:** `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
**Bounded full-output SHA-256:** `7d12d76045dce4eb3ee316a3a712fb23e4c9d7f4b58d748c7e985028ca992ecc`
**Disposition:** valid pre-fix RED; repaired bytes were not required to fail again

```text
functional: tests=229 pass=227 fail=2 cancelled=0 skipped=0 todo=0
functional failure 1: SCN-012-003 isolated rollback restores legacy providers and exact current Scope 03 bytes
functional failure 2: SCN-012-003 exact TP-03-01 through TP-03-05 commands replay RED then GREEN in isolated rollback baseline
failure command: git show 767732db04e0cd32bf107b2a95030a6771bd16f2:rlg.js
failure result: fatal: path 'rlg.js' exists on disk, but not in the pinned commit
TP0508_EXACT_MATRIX_EXIT=1
TP0508_CANDIDATE_TREE_UNCHANGED=true
```

### TP-BUG002-RED-02 {#tp-bug002-red-02-revision-6-closure}

**Phase:** test
**Claim Source:** executed
**Command:** `node --test --test-name-pattern='^Regression: F-BUG002-008 scoped rollback oracle catches governed mutation and ignores unrelated concurrent files$' tests/contextual-tooltip.functional.mjs`
**Exit Code:** `1`
**Receipt:** tool-log row `192` at `2026-09-02T02:17:47Z`
**Receipt duration:** `134ms`
**Receipt stdout SHA-256:** `d6defdc0d57d01c7f6fa38cdffa329ea046806e1529735cb7eeeed642208d182`
**Receipt stderr SHA-256:** `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
**Receipt bytes:** stdout `5182`, stderr `0`
**Pre-fix test source SHA-256:** `d22f8df4d738ada8c54ac51eaef2cc56d1b2458813a37177aa2d77ea8641d35f`
**Disposition:** valid intended RED for the unrelated-file control under the whole-worktree oracle

### TP-BUG002-F01 {#tp-bug002-f01-revision-6-final}

**Phase:** test
**Claim Source:** executed
**Command:** `node --test --test-name-pattern='^SCN-012-003 isolated rollback restores legacy providers and exact current Scope 03 bytes$' tests/contextual-tooltip.functional.mjs`
**Exit Code:** `0`
**Receipt:** tool-log row `202` at `2026-09-02T03:44:38Z`
**Receipt duration:** `9184ms`
**Receipt stdout SHA-256:** `6ba4a4d39d23d9e4bfd8f3d51d31408b65845acbe944ebd08d796a1104ac9dd8`
**Receipt stderr SHA-256:** `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
**Input closure:** all `11` governed epoch paths
**Result:** one exact title passed; zero failed, cancelled, skipped, or todo

### TP-BUG002-F02 {#tp-bug002-f02-revision-6-final}

**Phase:** test
**Claim Source:** executed
**Command:** `node --test --test-name-pattern='^SCN-012-003 exact TP-03-01 through TP-03-05 commands replay RED then GREEN in isolated rollback baseline$' tests/contextual-tooltip.functional.mjs`
**Exit Code:** `0`
**Receipt:** tool-log row `203` at `2026-09-02T03:55:20Z`
**Receipt duration:** `89498ms`
**Receipt stdout SHA-256:** `2d1e5cf1ee134a43493e123cb118627de60c006e415dc2df65d6557eabc63511`
**Receipt stderr SHA-256:** `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
**Full-output SHA-256:** `e9e890b9f0cab581f3acbb070a18ec365a7b190a272dbfd659d4bc8babb828c7`
**Result:** all five exact commands produced intended RED, restored current bytes, and produced expected GREEN counts; zero skips

### TP-BUG002-F03 {#tp-bug002-f03-revision-6-final}

**Phase:** test
**Claim Source:** executed
**Command:** `node --test tests/contextual-tooltip.functional.mjs`
**Exit Code:** `0`
**Receipt:** tool-log row `204` at `2026-09-02T03:57:28Z`
**Receipt duration:** `53685ms`
**Receipt stdout SHA-256:** `c2e9ee85473a5abf094a842811c73b7fedba389a407c0f23627975b5b0241bd1`
**Receipt stderr SHA-256:** `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
**Full-output SHA-256:** `150394c9e796eb66f6d359a3c7ad51fdcbdfadd81a44af2fa6d0db835a80f805`
**Result:** `10` tests passed; zero failed, cancelled, skipped, or todo

```text
[scope03-oracle] governedFiles=11
[scope03-oracle] rollbackMutationFiles=8
[scope03-oracle] governedMutationDetected=true
[scope03-oracle] unauthorizedMutationRejected=true
[scope03-oracle] unrelatedConcurrentControlIgnored=true
[scope03-rollback] fixtureControls={"unknownPath":true,"missingFile":true,"sha256":true,"decoratorMarker":true}
[scope03-rollback] legacyRLG=true legacyTickerLink=true legacyChartAttach=true
[scope03-rollback] legacyCanaryPages=3/3
[scope03-rollback] governedHashesEqual=true actualRollbackWriteSetEqual=true
[scope03-rollback] tempRootRemoved=true
```

### TP-BUG002-F04 {#tp-bug002-f04-revision-6-final}

**Phase:** test
**Claim Source:** executed
**Command:** `node --test --test-name-pattern='^Regression: F-BUG002-008 scoped rollback oracle catches governed mutation and ignores unrelated concurrent files$' tests/contextual-tooltip.functional.mjs`
**Exit Code:** `0`
**Receipt:** tool-log row `205` at `2026-09-02T03:59:04Z`
**Receipt duration:** `286ms`
**Receipt stdout SHA-256:** `78f4e89f958d157aa33cbe480e8e74965f8a835f0c063b519d2f596fb054a00b`
**Receipt stderr SHA-256:** `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
**Full-output SHA-256:** `62cd5912d369898a87eb2e0279a04585a02b25319adb231e67447685105d1055`
**Result:** one exact adversarial regression passed; all five scoped-oracle controls were true; zero skips

### TP-BUG002-E01 {#tp-bug002-e01-revision-6-final}

**Phase:** test
**Claim Source:** executed
**Command:** `npx --no-install playwright test tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** `0`
**Receipt:** tool-log row `206` at `2026-09-02T04:00:01Z`
**Receipt duration:** `47917ms`
**Receipt stdout SHA-256:** `bf31cf4dcfa0764b42b9f7764f923fb9e4514914b15de1a4b21593d34f57b16e`
**Receipt stderr SHA-256:** `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
**Full-output SHA-256:** `4972acf6678f1248587bb7695547c9f852829a891d26f0582b339daf574cb575`
**Runner:** checkout-local Playwright `1.61.1`, committed config, `system-chrome`, one worker, no request interception
**Result:** `4` browser tests passed in `47.2s`; zero failed or skipped

### TP-BUG002-Q01 {#tp-bug002-q01-revision-6-final}

**Phase:** test
**Claim Source:** executed
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/contextual-tooltip.functional.mjs`
**Exit Code:** `0`
**Receipt:** tool-log row `207` at `2026-09-02T04:00:33Z`
**Receipt duration:** `114ms`
**Receipt stdout SHA-256:** `043377dd2a8b46e631bba0f8606d62fc31269464451422d9f9e07f470d4744db`
**Receipt stderr SHA-256:** `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
**Full-output SHA-256:** `be23b0b00177e038de3ee8dba6d359141d631d79385f4acfd6a510217a4bed9c`
**Result:** one file scanned, one adversarial signal, zero violations, zero warnings

### TP-BUG002-C01 {#tp-bug002-c01-revision-6-final}

**Phase:** test
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** `0`
**Receipt:** tool-log row `208` at `2026-09-02T04:01:04Z`
**Receipt duration:** `25267ms`
**Receipt stdout SHA-256:** `fd43f3c945e8782160da2eeb2ec0c010614ee94e977f881ea461436861f89dbd`
**Receipt stderr SHA-256:** `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
**Full-output SHA-256:** `95aadb8c2ef47ade01651884c29c8c7b2694cab12bf6eccfbd94f68c9a50f5fb`
**Result:** `3470` passed, `0` failed
**Skipped:** `0`

### Preserved Nonzero Receipt Ledger {#bug002-revision-6-preserved-nonzero-receipts}

**Phase:** test
**Claim Source:** executed
**Command:** structured query over `.specify/runtime/tool-calls.jsonl` for this session, BUG-002, Scope 02, and `exitCode != 0`
**Exit Code:** `0`
**Disposition:** append-only history retained; no nonzero receipt was deleted, rewritten, or represented as a pass

| Row | Timestamp | Exit | Receipt stdout SHA-256 | Disposition |
| ---: | --- | ---: | --- | --- |
| 160 | 2026-09-01T21:22:57Z | 1 | `9f79e6cc54a32a3ca5bcde546ed7632be15bfb40614ec2c61e136ed48c596b4a` | Earlier RED-01 execution; preserved |
| 162 | 2026-09-01T21:30:40Z | 1 | `7582921fa2175e4aa129d9d711fd6e18d9a44f82f17cffe661b10876b423793e` | Earlier F02 failed attempt; preserved |
| 163 | 2026-09-01T22:00:52Z | 1 | `59c6ee47a5cc3e9e4e30dd13afdfc32f8822f2689f01089b312b55bfa0f4a60a` | Earlier F02 diagnostic failure; preserved |
| 168 | 2026-09-01T22:24:45Z | 1 | `bec791fa95eee976ec91f78e390d53cc4610247f78152dfe462cc63e2030e72c` | Earlier F02 serial failure; preserved |
| 184 | 2026-09-02T01:34:46Z | 127 | `97ea92994ccb29b11a3c37d897ddeca828e35782fa9aa522d49cadf29c010241` | Nonexistent `/opt/local/bin/node` path; preserved and superseded by row 203 |
| 186 | 2026-09-02T01:37:21Z | 1 | `8346280450ca4ce411f795d6161a69a742185cf0d2d4346adeb2546fb7d7728f` | RED-02 admissibility probe failure; preserved |
| 187 | 2026-09-02T01:38:00Z | 66 | `7d4d969a6988c567582aeb573260ac410edbc7a74ce5f6a1d39f4b67fb92ad91` | RED-02 design-prerequisite refusal; preserved |
| 192 | 2026-09-02T02:17:47Z | 1 | `d6defdc0d57d01c7f6fa38cdffa329ea046806e1529735cb7eeeed642208d182` | Intended RED-02; admitted as RED evidence |
| 195 | 2026-09-02T03:18:47Z | 127 | `b8e826c403488f975802f33e327404de96cb09b8700558c24bc4392fee52d5a0` | Nonexistent `/opt/local/bin/node` epoch-resume path; preserved and superseded by row 196 |

One later F02 attempt emitted interrupted exit `130` with full-output SHA-256
`567ac022e0c4d76231b78fe5d0fc200aa75cf6ff01072b6b76968021a3496f46`.
Its recorder lost its temporary stdout path and appended no structured receipt.
It is retained here as a non-receipt diagnostic and is not used for any row.

### Test Matrix Disposition {#bug002-revision-6-test-matrix-disposition}

**Phase:** test
**Claim Source:** executed
**Rows required:** `9`
**Rows satisfied:** `9`
**RED obligations:** `2/2`
**Post-fix rows:** `7/7`
**Post-fix row exits:** all `0`
**Post-fix failed tests:** `0`
**Post-fix skipped tests:** `0`
**Governed epoch stable:** `true`
**Test-owned unresolved findings:** `0`
**Finding disposition:** `F-BUG002-008` addressed by rows `192`, `202` through `209`
**Certification:** not claimed; human acceptance was not inspected or modified
**Required owner:** `bubbles.validate`

## Scope 02 Revision-7 Build Quality Reconciliation - 2026-09-02 {#scope-02-revision-7-build-quality-reconciliation}

**Phase:** test
**Claim Source:** executed
**Repository decision:** `rb:vscode-a66638659f347684a54d8a6f9606fa12:7:node:company-close-feature-028`
**Control revision:** `7`
**Build Quality receipt:** tool-log row `214` at `2026-09-02T04:05:54Z`
**Command:** complete multiline matrix command retained in tool-log row `214`
**Exit Code:** `0`
**Receipt stdout SHA-256:** `a85b91bd17c19ef71e41d46b3918423453bddfadabe2cc25bf401e9160a4d982`
**Receipt stderr SHA-256:** `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
**Receipt output bytes:** stdout `14350`, stderr `0`
**Identity check:** all nine receipt inputs remained byte-identical before reconciliation, so no test row or provisional Build Quality matrix was rerun

```text
RECEIPT row=214 sessionId=vscode-a66638659f347684a54d8a6f9606fa12 agent=bubbles.test spec=BUG-002-scope-baseline-head-drift-antipattern scope=SCOPE-02 exit=0 stdoutHash=a85b91bd17c19ef71e41d46b3918423453bddfadabe2cc25bf401e9160a4d982 stderrHash=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 inputs=9
INPUT path=specs/012-market-action-center-and-guided-tools/bugs/BUG-002-scope-baseline-head-drift-antipattern/report.md expected=d48647277956b0100183a29f2780ba8ecd54bc5154515295456d58da95bd789e actual=d48647277956b0100183a29f2780ba8ecd54bc5154515295456d58da95bd789e match=true
INPUT path=specs/012-market-action-center-and-guided-tools/bugs/BUG-002-scope-baseline-head-drift-antipattern/scopes.md expected=e9f995088b14b062c6db72775ad079c4e16227754a49b824c4ec33f3bcb7d121 actual=e9f995088b14b062c6db72775ad079c4e16227754a49b824c4ec33f3bcb7d121 match=true
INPUT path=specs/012-market-action-center-and-guided-tools/bugs/BUG-002-scope-baseline-head-drift-antipattern/state.json expected=18678aeb04c62d6a02f89521150d31d70b6008457c0b590ede459aa36a7c4e01 actual=18678aeb04c62d6a02f89521150d31d70b6008457c0b590ede459aa36a7c4e01 match=true
INPUT path=specs/012-market-action-center-and-guided-tools/bugs/BUG-002-scope-baseline-head-drift-antipattern/test-plan.json expected=580e7efb20f93c30715feefc7bb4c9fb8c8c38fb9c184ab6599dc881596d6d13 actual=580e7efb20f93c30715feefc7bb4c9fb8c8c38fb9c184ab6599dc881596d6d13 match=true
INPUT path=specs/012-market-action-center-and-guided-tools/bugs/BUG-002-scope-baseline-head-drift-antipattern/scenario-manifest.json expected=8247dd890f69e7a3a7759f8442c9e6e3e32ea2a04998508cb5127f34d357d4be actual=8247dd890f69e7a3a7759f8442c9e6e3e32ea2a04998508cb5127f34d357d4be match=true
INPUT path=tests/contextual-tooltip.functional.mjs expected=8c545fbd005dd7324884be2b07e6ea72e1c401161b5af88b7ed178537275c780 actual=8c545fbd005dd7324884be2b07e6ea72e1c401161b5af88b7ed178537275c780 match=true
INPUT path=tests/contextual-tooltip.spec.mjs expected=c90def41f65267a31cf98e78a7a59fa5c10d6a8bfc037dccfd02b39326855d14 actual=c90def41f65267a31cf98e78a7a59fa5c10d6a8bfc037dccfd02b39326855d14 match=true
INPUT path=tests/fixtures/feature-012/contextual-tooltip-pre-scope03/manifest.json expected=fd52ebb89960f6c50f7eb268050c0babb0f52272128479e9211894138c810558 actual=fd52ebb89960f6c50f7eb268050c0babb0f52272128479e9211894138c810558 match=true
INPUT path=/private/tmp/research-lab-bug002-linked-tests/scenario-manifest.json expected=b46213ff4026ba6cda182cdeb00875993d378e35144a11f5110df00adcff0f70 actual=b46213ff4026ba6cda182cdeb00875993d378e35144a11f5110df00adcff0f70 match=true
INPUT_IDENTITY_FAILURES=0
```

The provisional matrix covered fixture-manifest validation, artifact freshness,
scenario obligations, linked-test resolution, test-mechanism fidelity,
traceability, regression quality, implementation reality, reference existence,
technical prose, execution-substate integrity, claim sources, collected-test
counts, skip and interception absence, root-oracle absence, nine-row Test Plan
parity, work-boundary admission, acceptance preservation, certification
preservation, and diff hygiene. Its aggregate failure count was zero on the
exact input closure above. This reconciliation changes only test-owned evidence,
the final DoD checkbox, and `execution.*` handoff fields. It makes no
certification, human-acceptance, product-byte, or publication-pointer claim.

## Validate-Owned Outcome Contract Mapping - 2026-09-02

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** The executed Scope 02 receipts and governed-epoch evidence
below are mapped to the bug-level Outcome Contract. This mapping does not claim
human acceptance or authorize a terminal status.

### Intent

The stable fixture authority and the closed rollback oracle remove moving-HEAD
and whole-worktree drift from the active `SCN-012-003` repair. The exact fixture,
governed-path, mutation-boundary, and replay evidence is recorded in
[TP-BUG002-F01](#tp-bug002-f01-revision-6-final),
[TP-BUG002-F02](#tp-bug002-f02-revision-6-final),
[TP-BUG002-F03](#tp-bug002-f03-revision-6-final), and
[TP-BUG002-F04](#tp-bug002-f04-revision-6-final).

### Declared Success Signal

The declared Success Signal is that `SCN-012-003` and `SCN-012-033` are green
from HEAD-independent authorities with fail-loud SHA-256 and semantic guards,
that advancing `HEAD` cannot redefine legacy bytes, and that adversarial
contract breaks still fail. The active Scope 02 portion is demonstrated by the
stable eleven-path governed epoch, the two exact `SCN-012-003` passes, the
complete functional pass, the adversarial scoped-oracle pass, and the unchanged
production-route browser pass. The previously repaired `SCN-012-033` evidence
and its adversarial mutation controls remain recorded under
[`SCN-012-033` remediation](#scn-012-033-remediation-implemented--drift-class-eliminated-commit-db16cd47)
and [Adversarial Proof For F-BUG002-005/006/007](#adversarial-proof-for-f-bug002-005006007).

### Hard Constraints

The repair preserves the `SCN-012-031` reference shape, keeps both legacy and
restored-current decorator assertions, and changes no product or page byte as
part of Scope 02. The current change boundary, fixture authority, human
acceptance file, and certification-preservation checks are recorded in the
[revision-7 Build Quality reconciliation](#scope-02-revision-7-build-quality-reconciliation).

### Failure Condition

The active Scope 02 evidence contains no moving-HEAD fixture lookup, no
root-wide rollback comparison, no weakened assertion, and no product-byte
repair. Machine certification and human acceptance remain separate decisions;
the unchecked human checklist is evaluated by the terminal acceptance gate.

## Scope 02 Revision-8 Validate-Owned Certification Attempt - 2026-09-02

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** Scope 02 has complete, current machine test evidence, but it
cannot be certified `Done` while the canonical transition guard reports
blocking planning, phase, receipt, session-cap, capability, and human-acceptance
failures. The lifecycle therefore advances only from stale `not_started` to
truthful `in_progress`.

### Repository Authority

**Command:** `repository-binding.sh validate-packet --session-id vscode-a66638659f347684a54d8a6f9606fa12 --session-control-file <host-control> --packet-file <revision-8-packet> --scenario-file <three-stream-plan> --node-id company-close-feature-028`
**Exit Code:** `0`
**Claim Source:** executed

```text
REPOSITORY PACKET SCOPED actionable=true repository=research-lab-company-intelligence-delivery-r11 root=/private/tmp/research-lab-company-intelligence-delivery-r11 decision=rb:vscode-a66638659f347684a54d8a6f9606fa12:8:node:company-close-feature-028 revision=8 scopeKind=goal-node scopeId=company-close-feature-028
```

No repository-binding preflight was run.

### Independent Receipt Verification

**Command:** bounded structured receipt and SHA-256 comparison over tool-log rows `150`, `192`, and `202` through `214`
**Exit Code:** `0`
**Claim Source:** executed

```text
POSTFIX_RECEIPT row=202 exit=0 matches=11 mismatches=0 missing=0 total=11
POSTFIX_RECEIPT row=203 exit=0 matches=11 mismatches=0 missing=0 total=11
POSTFIX_RECEIPT row=204 exit=0 matches=11 mismatches=0 missing=0 total=11
POSTFIX_RECEIPT row=205 exit=0 matches=11 mismatches=0 missing=0 total=11
POSTFIX_RECEIPT row=206 exit=0 matches=11 mismatches=0 missing=0 total=11
POSTFIX_RECEIPT row=207 exit=0 matches=11 mismatches=0 missing=0 total=11
POSTFIX_RECEIPT row=208 exit=0 matches=11 mismatches=0 missing=0 total=11
POSTFIX_RECEIPT row=209 exit=0 matches=11 mismatches=0 missing=0 total=11
RED_RECEIPTS_PRESENT_WITH_EXIT_1=2 expected=2
BUG002_NINE_OBLIGATION_RECEIPT_FAILURES=0
```

Row `214` is a genuine exit-0 Build Quality receipt and its nine recorded input
hashes matched when it ran. They do not all match the later tree: the direct
current-byte comparison produced `matches=6`, `mismatches=3`, `missing=0`.
Only `report.md`, `scopes.md`, and `state.json` changed after row `214`; both
test files, the fixture manifest, `test-plan.json`, `scenario-manifest.json`,
and the linked-test projection remained byte-identical. Rows `216` through
`220` record the test owner's post-reconciliation artifact, traceability,
parity, transition-diagnostic, and execution-substate checks. This validate
run then executed its own current artifact and state checks below.

### Validate-Owned State Reconciliation

| Field | Before | After |
| --- | --- | --- |
| top-level `status` | `not_started` | `in_progress` |
| `certification.status` | `not_started` | `in_progress` |
| `certification.completedScopes` | `[]` | `[]` |
| `certification.certifiedCompletedPhases` | `[]` | `[]` |
| `certification.scopeProgress` | stale Scope 01 plus stale pre-repair Scope 02 | active Scope 02 only, correct name/dependency, `in_progress` |
| `certification.assurance` | invalid `level: none` | absent, the valid pre-terminal compatibility state |
| completion timestamps | `null` | `null` |

No execution-owned field, scope artifact status, production file, test file,
or human-owned acceptance field was changed by validate.

### Focused State And Artifact Checks

**Command:** bounded JSON reconciliation assertion, assurance consistency,
execution-substate guard, and artifact lint
**Exit Code:** `0`
**Claim Source:** executed

```text
true
CHECK name=state-reconciliation exit=0
[assurance-certification-check] OK — no .certification.assurance block (no-op).
CHECK name=assurance-consistency exit=0
[execution-substate-guard] OK — execution substate (if any) is valid and distinct from certification in specs/012-market-action-center-and-guided-tools/bugs/BUG-002-scope-baseline-head-drift-antipattern.
CHECK name=execution-substate exit=0
Artifact lint PASSED.
CHECK name=artifact-lint exit=0
BUG002_NONTERMINAL_RECONCILIATION_FAILURES=0
```

### Gate Exits

| Check | Exit | Result |
| --- | ---: | --- |
| revision-8 repository packet | 0 | exact scoped node accepted |
| G070/G134 pre-certification before mapping | 1 | report lacked explicit Success Signal mapping |
| G070/G134 pre-certification after mapping | 0 | outcome contract mapping accepted |
| transition-contract resolver before reconciliation | 0 | `done`, `delivery-completion-v1`, digest `aa91472c…`, revision `af6bff94…` |
| asserted transition guard before reconciliation | 1 | 35 failures, 2 warnings |
| nonterminal state reconciliation checks | 0 | all four focused checks passed |
| transition-contract resolver after reconciliation | 0 | current `in_progress`, target `done`, revision `50cb1342…` |
| asserted transition guard after reconciliation | 1 | 34 failures, 2 warnings |

```text
BEGIN TRANSITION_GUARD_RESULT_V1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:50cb1342d6559c695da980fdb83ca3de7a098b50ec796daa8016e0ca6a981b88
failedGateIds: [G060,G002,G061,G041,G022,G053,G027,G040,G128,G094,G136]
failedChecks: [Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 34
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

### Human Acceptance Authority

The installed `acceptance-authority/v1` registry says automation readiness
does not grant acceptance. The checklist and Human Acceptance Record are
human-owned. The final guard found six unchecked acceptance items and no
authored Human Acceptance Record, then refused `done` under G136. Validate did
not check, create, or infer either human-owned signal.

### Certification Verdict And Owner Routing

**Certification verdict:** `BLOCKED_NONTERMINAL`.

Machine test readiness is established for Scope 02, but scope certification and
terminal BUG-002 certification are withheld. The current blocking set is:

- G060: report ordering does not satisfy the scenario-first RED-before-GREEN parser.
- G002: the repository-wide receipt-staleness gate reports stale receipts.
- G061: two open transition requests lack the closed routing fields.
- G041 and Check 5: the active scope artifact has non-canonical `In Progress.` and is not `Done`.
- G022: seven required specialist phases, including independent audit, are absent.
- G053: no `### Code Diff Evidence` section exists.
- G027: a test phase is claimed while no scope is certified complete.
- G040: one report deferral-language hit remains.
- G128: the aggregate scenario session budget is exceeded.
- G094: the capability-foundation contract is incomplete.
- G136: six human checklist items are unchecked and no Human Acceptance Record exists.

Feature 028 remains `in_progress`. Its current state names `bubbles.plan` as the
next owner and this nested BUG-002 packet as the target. That is also the
shortest owner for the plan-owned G041, G061, E2E, shared-infrastructure, and
change-boundary failures found here. Human acceptance remains a separate
external authority and is not assigned to an agent.
