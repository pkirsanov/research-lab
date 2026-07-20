# AGENTS.MD: Research Lab Operational Rules

> Generated: 2026-07-14  
> Platform: macOS and Linux/WSL  
> Stack: static HTML/CSS/JavaScript, Node.js ESM scripts, Bash scheduling,
> Playwright browser tests, GitHub Actions Pages  
> Command posture: build-free; run commands from the repository root

This file is the project command registry. It records commands that exist in
the repository or are explicitly documented by an owning project surface. It
must not grow aliases for commands that the repository does not provide.

---

## I. Context Loading Priority

Load only the files relevant to the current task, in this order:

| Priority | File | Purpose |
| --- | --- | --- |
| 1 | Active feature or bug artifacts under `specs/` | Current required behavior and validation contract |
| 2 | `.specify/memory/agents.md` | Project command truth |
| 3 | `.specify/memory/constitution.md` | Project governance |
| 4 | `.github/copilot-instructions.md` | Product architecture, credentials, data shell, and Pages rules |
| 5 | `README.md` | Effective architecture and development guide |
| 6 | `tools.json` and the relevant `notes/<tool-id>.md` | Tool registry and page-specific method/checks |
| 7 | `.github/agents/bubbles_shared/agent-common.md` | Installed framework governance index |

Framework-managed files under `.github/bubbles/`, `.github/agents/bubbles*`,
`.github/prompts/bubbles.*`, `.github/instructions/bubbles-*`, and
`.github/skills/bubbles-*` are read-only downstream install artifacts. Change
them in the canonical Bubbles repository and upgrade this repository through
the framework command surface.

---

## I-B. Tool And Shell Rules

### No project CLI or application build

Research Lab has no project CLI, Makefile, Taskfile, Justfile, application build
command, service lifecycle, or generated application bundle. Do not create
command aliases for those absent surfaces. The checked-in HTML, JavaScript,
JSON, JSONL, and data files are the deployable site.

The repository intentionally has one dev-only Node package layer solely for
source-locked browser-test infrastructure. `package.json` is private, contains
exact `playwright` `1.61.1` as its only `devDependency`, and has no runtime
dependencies or package scripts. The npm v3 lockfile and committed single-source
`.npmrc` govern that test dependency. Provisioning it does not build, bundle,
transform, or deploy the application.

The local command tools are:

| Tool | Owned use |
| --- | --- |
| `node` | Project selftests, validators, data refresh, and read-only session review |
| `python3` | The explicitly documented local static HTTP server only |
| `npm ci` | Lockfile-strict browser-test dependency provisioning after a fresh checkout or lockfile change only |
| `npx --no-install playwright` | The checkout-local exact browser-test runner through the committed config and project |
| `bash` | Market Brief scheduler wrappers and installed Bubbles CLI |
| GitHub Actions | Root-artifact deployment to GitHub Pages |

Browser tests require Node 20 or newer and system Google Chrome Stable in the
current OS environment. The committed `system-chrome` project owns channel
resolution and fails loud when Chrome is absent. Playwright-managed browser
acquisition is forbidden during normal provisioning. A cache, global install,
sibling repository, Python executable, downloaded browser, or absolute browser
path cannot substitute for the checkout-local runner and system channel. Do not
claim that a syntax-only check is E2E coverage.

### Terminal discipline

- Use IDE file tools for author-time file writes. Never use shell redirection,
  `tee`, or heredocs to write repository files.
- Show full command output. Do not pipe validation output through `head`,
  `tail`, `grep`, `sed`, or another truncating filter.
- Run commands from the repository root unless a command below says otherwise.
- Do not print credentials or secret-bearing environment values. Report only
  set/unset state with a value-safe presence check.
- Do not turn mutating refresh/scheduler commands into routine validation.

---

## II. Authoritative Project Documents

The effective managed-doc override maps both architecture and development to
`README.md`. Use the real documents below; do not cite bootstrap-only paths.

| Surface | Source | Authority |
| --- | --- | --- |
| Architecture and development | `README.md` | Build-free site shape, tool inventory, add-tool flow, deploy mechanism |
| Project policy | `.github/copilot-instructions.md` | Credentials, data shell, page behavior, validation, and framework boundary |
| Tool registry | `tools.json` | Machine-readable registered tool set |
| Shared data layer | `notes/shared-data-layer.md` | `RLDATA` cache, credentials, freshness, and request lifecycle |
| Market Brief | `notes/market-brief.md` | Tier A/Tier B refresh, payload, research, and scheduling contract |
| Tool-specific behavior | `notes/<tool-id>.md` | Page model, universe, and page-specific checks |
| Pages deployment | `.github/workflows/pages.yml` | Triggers, option snapshot, root artifact, and deployment behavior |
| Governance registry | `.github/bubbles-project.yaml` and `.github/bubbles/docs-registry.yaml` | Effective managed-doc mapping |

---

## III. Command Registry

### Static serving

Manual local HTTP serving is the command displayed by the shared navigation
shell when a data-backed page is opened over `file://`:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. There is no start/stop wrapper; stop the
foreground server with `Ctrl-C`. The Playwright spec starts and closes its own
ephemeral `127.0.0.1` Node HTTP server, so do not start this manual server for
the E2E command.

### Build, lint, and format

- Build: not applicable. GitHub Pages uploads the repository root unchanged.
- Lint: no repository lint command is declared.
- Format: no repository format command is declared.
- Typecheck: no repository typecheck command is declared.

Do not replace these absences with ecosystem defaults.

### Core selftest

```bash
node scripts/selftest.mjs
```

This executes pure production helpers extracted from the checked-in tool files,
shared data/status canaries, registry parity (`tools.json`, `index.html`, and
`rlnav.js`), Market Brief contract tests, and the currently registered model
invariants.

### Contract validators

Validate the committed Market Brief payload:

```bash
node scripts/validate-brief-payload.mjs
```

The validator also accepts one explicit payload file as its only positional
argument:

```bash
node scripts/validate-brief-payload.mjs market-brief.payload.json
```

Validate the committed causal-rotation config, observations, ledger,
deterministic snapshot, and rejection fixtures:

```bash
node scripts/validate-causal-rotation.mjs
```

Run the read-only workspace classifier's pure-function tests:

```bash
node scripts/session-review.mjs --selftest
```

The classifier itself is a separate read-only/offline operational audit:

```bash
node scripts/session-review.mjs --help
node scripts/session-review.mjs /Users/pkirsanov/Projects --json --strict --active-days=2
```

It reads locally cached Git refs only. It does not fetch, checkout, reset,
clean, commit, or push.

### Per-page inline script and ID check

For each changed single-file tool, set `PAGE` to that HTML file and run this
Node-only check. It parses every non-`src` inline script and verifies every
literal `getElementById(...)` reference has a matching HTML `id`:

```bash
PAGE=msft-july-print-model.html node -e 'const fs=require("node:fs");const p=process.env.PAGE;if(!p)throw new Error("PAGE is required");const h=fs.readFileSync(p,"utf8");const scripts=[...h.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(s=>s.trim());if(!scripts.length)throw new Error("no inline script: "+p);scripts.forEach((s,i)=>{try{new Function(s)}catch(e){throw new Error("inline script "+(i+1)+": "+e.message)}});const ids=new Set([...h.matchAll(/\bid=["\x27]([^"\x27]+)["\x27]/g)].map(m=>m[1]));const refs=scripts.flatMap(s=>[...s.matchAll(/getElementById\(\s*["\x27]([^"\x27]+)["\x27]\s*\)/g)].map(m=>m[1]));const missing=[...new Set(refs.filter(id=>!ids.has(id)))];if(missing.length)throw new Error("missing ids: "+missing.join(", "));console.log("OK page="+p+" inline="+scripts.length+" refs="+refs.length)'
```

Change only the `PAGE` value for another tool. Then run any additional semantic
one-liner in that tool's `notes/<tool-id>.md`, such as universe JSON parsing,
fallback-universe parity, asset uniqueness, or preset membership. A generic
syntax/ID pass does not replace those page-specific assertions.

### Browser test source lock and provisioning

Validate the manifest, single-source npm policy, lockfile v3 graph, exact
versions, registry URLs, and integrity hashes before dependency provisioning:

```bash
node scripts/validate-node-source-lock.mjs
```

After a fresh checkout or any `package-lock.json` change, provision the committed
test graph in this order with browser download and lifecycle scripts disabled:

```bash
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts
```

This is dependency provisioning, not an application build. It is not required
before every individual focused test when the checkout-local install is already
current with the unchanged lockfile. Before browser evidence, verify runner
identity:

```bash
npx --no-install playwright --version
```

The output must be exactly `Version 1.61.1`. A missing local install, any other
version, or an unavailable system Chrome channel is a hard failure.

### Playwright E2E

Run the complete Palm Springs browser suite:

```bash
npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

Run the implemented Scope 1 scenarios individually only with their exact Test
Plan titles:

```bash
npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-002 missing configuration blocks payload fetch and every output" --reporter=list
npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-004 invalid payload produces errors and no conclusion" --reporter=list
npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-006 occupancy equation clamps and rejects an invalid denominator" --reporter=list
npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-008 buyer economics use standard amortization in one result" --reporter=list
npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-005-009 zero-rate financing stays finite" --reporter=list
```

Existing browser suites use the same checkout-local runner, committed config,
and `system-chrome` project. These command entries assert command truth, not that
every suite has passed in the current session:

```bash
npx --no-install playwright test tests/causal-rotation-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/fx-regime-relative-value-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/provider-credentials.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

Run one causal scenario when its owning scope requires focused evidence:

```bash
npx --no-install playwright test tests/causal-rotation-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Evidence available after a decision is excluded from that decision" --reporter=list
```

Under these accepted commands, `tests/playwright-runtime.mjs` imports the same
checkout-local `playwright/test` package. Each spec owns a real ephemeral static
server. The tests exercise HTTP contract reads and browser pages; they are not
file-parsing substitutes, and compatibility lookup paths do not satisfy browser
evidence.

### Data refresh commands

These commands write tracked snapshots. Run them only when the task explicitly
owns those data changes:

```bash
node scripts/fetch-options.mjs
node scripts/fetch-bars.mjs
node scripts/fetch-bars.mjs --missing-only
node scripts/brief-refresh.mjs
node scripts/brief-refresh.mjs --window pre-market
node scripts/brief-refresh.mjs --window morning
node scripts/brief-refresh.mjs --window pre-close
node scripts/brief-refresh.mjs --window after-hours
```

The fetchers are best-effort and may exit zero after individual upstream
failures. Their logs and resulting snapshot contents must be inspected before
making freshness or completeness claims.

### Scheduled Market Brief data and narrative

The macOS launchd template invokes this owning wrapper at 07:30, 11:00, 15:00,
and 17:00 ET after its local-time entries are configured for the host:

```bash
bash scripts/brief-refresh-and-push.sh
```

The wrapper refreshes bars/options, runs deterministic Tier A, optionally asks
the authenticated GitHub Copilot CLI to rewrite and validate Tier B, stages only
the owned brief/data files, commits, and pushes the current branch. It uses the
HTTPS remote with macOS Keychain credentials and the Copilot CLI's existing
login. Never print or duplicate either credential.

The wrapper also exposes:

```bash
bash scripts/brief-refresh-and-push.sh --dry-run
```

This is not a read-only validation command: it refreshes, stages, reports, and
restores owned data files. Do not run either form in a dirty worktree unless the
operator explicitly owns the affected data and Git state.

For the split-host flow, Tier A runs first and the nudge requests the VS Code
`/market-brief-update` prompt for Tier B:

```bash
BRIEF_NTFY_TOPIC=<set-in-operator-environment> bash scripts/brief-nudge.sh pre-market
```

`BRIEF_NTFY_TOPIC` is private and must never be committed, echoed, or pasted
into agent chat. `BRIEF_NTFY_URL` is optional. The launchd template is
`scripts/com.researchlab.brief-refresh.plist`; edit its absolute wrapper path
with an IDE file tool before installing it.

### GitHub Pages behavior

There is no manual deploy command in this repository.

- A push to `main`, manual workflow dispatch, or weekday cron at
  `14:00`, `17:00`, or `20:00` UTC triggers `.github/workflows/pages.yml`.
- The blocking `verify` job uses Node 20, validates the Node source lock,
   provisions with browser downloads and lifecycle scripts disabled, checks
   exact runner identity, and runs the complete Palm Springs `system-chrome`
   suite.
- The dependent `deploy` job performs a separate clean checkout, runs
   `node scripts/fetch-options.mjs` as a non-blocking best-effort snapshot step,
   uploads `.` as the Pages artifact, and deploys it with GitHub's Pages actions.
- Dependency provisioning occurs only in `verify`; installed packages and test
   output do not enter the fresh deploy checkout or root Pages artifact.
- `.nojekyll` keeps the static files untransformed.
- Pages must be configured with GitHub Actions as its source.
- A successful Git push is not proof of successful Pages deployment; inspect
  the workflow result when deployment evidence is required.

### Bubbles governance

Run installed framework checks from this repository root:

```bash
bash .github/bubbles/scripts/cli.sh doctor
bash .github/bubbles/scripts/cli.sh framework-write-guard
bash .github/bubbles/scripts/cli.sh repo-readiness .
```

Product verification remains the Node/Playwright command surface above. Do not
replace it with framework checks, and do not patch installed framework files to
make a downstream check pass.

---

## IV. Non-Mutating Validation Set

For a command-registry or broad build-free verification change, run all
applicable commands below with full output. On a fresh checkout or after a
lockfile change, first run the provisioning sequence in Section III; do not
repeat `npm ci` before each focused test when the local install and lockfile are
unchanged:

```bash
node scripts/validate-node-source-lock.mjs
npx --no-install playwright --version
node scripts/selftest.mjs
node scripts/validate-brief-payload.mjs
node scripts/validate-causal-rotation.mjs
node scripts/session-review.mjs --selftest
npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
npx --no-install playwright test tests/causal-rotation-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
bash .github/bubbles/scripts/cli.sh doctor
bash .github/bubbles/scripts/cli.sh framework-write-guard
bash .github/bubbles/scripts/cli.sh repo-readiness .
```

Also run the per-page inline script/ID check for every changed HTML tool. Data
refresh and scheduler wrappers are deliberately excluded because they mutate
tracked snapshots or Git state.

| Verification class | Enabled | Command source |
| --- | --- | --- |
| Static artifact/build posture | true | Build-free Pages workflow and root artifact |
| Dependency source and runner identity | true | Source-lock validator and exact checkout-local Playwright version |
| Production helper unit/invariant checks | true | `node scripts/selftest.mjs` |
| Contract/integration validation | true | Brief and causal validators |
| Browser E2E | true | Complete Palm Springs suite and applicable existing suites through committed config/project |
| Page syntax and literal ID integrity | true | Per-page Node check plus page notes |
| Framework command governance | true | Installed Bubbles CLI checks |

---

## V. Credentials And Shared Data Shell

These are product invariants, not optional conventions:

1. Provider access is configured only at `index.html#data-settings` and flows
   through two tiers (see `specs/_bugs/BUG-002-two-tier-provider-access`, which
   supersedes the BUG-001 lockdown): Tier 1 is a tailnet proxy
   (`RLDATA.setProxyBaseUrl`) holding keys server-side; Tier 2 is a per-browser
   local key (`RLDATA.setKey`) stored only in `localStorage.rlProviderConfig`.
   Tools call `RLDATA.providerFetch(provider, urlOrPath)`; they must not use
   `rlApiKeys`/`RLDATA.key`, render key inputs, or persist tool-local key copies.
2. Every page loads `rldata.js` before `rlapp.js`, and `rlapp.js` before
   `rlnav.js`. Optional helpers keep their documented dependency order.
3. `rlapp.js` owns the shared data-status control. Standard resources report
   through `RLDATA.ensure*`; custom fetchers report through
   `RLAPP.report(resource, state, {label})`.
4. Status is scoped and honest: refreshing, ready/fresh, cached/stale,
   unavailable, or local/no-live-data. Cached data must never be labeled live.
5. Tools paint cache-first, fetch only missing/stale deltas, append and dedupe
   shared series, then re-render. They do not refetch data already owned by a
   sibling tool.
6. Every registered tool writes its Simple-view read to
   `RLDATA.toolReads[<id>]`. Tool registration remains synchronized across
   `tools.json`, `index.html`, and `rlnav.js`; the core selftest enforces parity.
7. Watchlists committed to the repository contain tickers only. Position size,
   cost basis, P/L, provider secrets, and other private state remain local and
   uncommitted.

---

## VI. File Organization

| Category | Location |
| --- | --- |
| Deployable pages | Root `*.html` |
| Shared browser shell/data/model helpers | Root `rl*.js` |
| Tool and universe contracts | `tools.json`, root `*-universe.json`, root config/snapshot JSON/JSONL |
| Same-origin snapshots | `data/bars/`, `data/options/` |
| Node and scheduler scripts | `scripts/` |
| Browser regressions and fixtures | `tests/` |
| Tool methodology and handoff notes | `notes/` |
| Feature governance | `specs/` |
| Pages deployment | `.github/workflows/pages.yml`, `.nojekyll` |

---

## VII. Failure Triage And Evidence

1. Read the complete failing output and preserve the exit code.
2. Determine whether the failure is in the owned change or pre-existing dirty
   work. Do not alter unrelated product/spec work to clear a command-registry
   check.
3. Compare behavior with the active spec, tool note, project policy, and this
   command registry before changing code or tests.
4. Re-run the narrow failing command after an owned fix, then run the applicable
   broader set.
5. Never infer success from a command name, soft-fail exit zero, prior-session
   output, or a successful Git push. Completion claims require current executed
   evidence.
6. Escalate after three failed repair iterations, when a required external tool
   is unavailable, when a framework-managed file would need a downstream edit,
   or when the required fix belongs to a different artifact owner.

---

## VIII. Quick Reference

| Need | Command |
| --- | --- |
| Serve locally | `python3 -m http.server 8000` |
| Validate Node source lock | `node scripts/validate-node-source-lock.mjs` |
| Provision browser tests after fresh checkout or lock change | `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts` |
| Verify browser runner | `npx --no-install playwright --version` -> exactly `Version 1.61.1` |
| Core tests | `node scripts/selftest.mjs` |
| Brief contract | `node scripts/validate-brief-payload.mjs` |
| Causal contract | `node scripts/validate-causal-rotation.mjs` |
| Session-review unit tests | `node scripts/session-review.mjs --selftest` |
| Palm Springs browser E2E | `npx --no-install playwright test tests/palm-springs-rental-market-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` |
| Causal browser E2E | `npx --no-install playwright test tests/causal-rotation-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` |
| Tier A refresh | `node scripts/brief-refresh.mjs --window pre-market` |
| Full scheduled wrapper | `bash scripts/brief-refresh-and-push.sh` |
| Framework health | `bash .github/bubbles/scripts/cli.sh doctor` |
| Registry readiness | `bash .github/bubbles/scripts/cli.sh repo-readiness .` |
