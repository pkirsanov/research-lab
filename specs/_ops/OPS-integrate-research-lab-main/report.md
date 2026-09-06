# Execution Reports

Links: [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md)

## Scope Reports

Execution agents append evidence under the matching scope and Test Plan identifier.
Every receipt must name the full candidate SHA that produced it.
No evidence in this file may imply push, cleanup, certification, or human acceptance.

### Scope 1: Inventory Freeze And Classification

**Scope status:** In Progress

**Phase agent:** `bubbles.devops`

**Claim source:** executed

Scope 1 created [objective.md](objective.md), [runbook.md](runbook.md), and
[integration-ledger.jsonl](integration-ledger.jsonl). The ledger contains one
freeze event and 36 item events. Its 30 ref groups cover 68 current refs. Five
worktree records and one stash-alias record cover the remaining inventory.

The freeze identity is
`sha256:e3d062462b03930c7abc565837254eb3e37c0866ac5b9dbd0ee537bc86f5acf5`.
The status hash excludes only this OPS packet. The ledger keeps `selectedInputs`
empty and records that Scope 1 did not execute fetch.

#### Scope 1 Inventory Freeze Evidence

**Executed:** YES.

**Session:** Current.

**Phase:** devops

**Command:** Current-session structured tool-log receipt tagged
`Scope-1,focused,ledger-schema,cardinality,live-parity,quiescence,phase:devops,no-mutation,retry-2`.
The tool log retains the complete argv.

**Exit Code:** 0

**Claim Source:** executed

```text
LEDGER_JSON_PARSE=PASS rows=37
LEDGER_SCHEMA=PASS ops-integration-ledger/v1
LEDGER_SEQUENCE=PASS first=1 last=37
LEDGER_RECORD_IDS=PASS unique=37
LEDGER_EVENTS=PASS frozen=1 items=36
LEDGER_ITEM_KINDS=PASS refGroups=30 worktrees=5 stashAliases=1
LEDGER_REF_CARDINALITY=PASS refs=68 unique=68 liveParity=68
LEDGER_CLASSIFICATIONS=PASS closedVocabulary=7
LEDGER_PATH_HYGIENE=PASS absoluteMachinePaths=0
LEDGER_FETCH_SELECTION_SEPARATION=PASS selectedInputs=0
LIVE_MAIN_IDENTITIES=PASS local=fa9be9ddcd330220171c7e374071be6856adc677 origin=397dc41d7c4189299d2e2ceb0486927545e39677
LIVE_MERGE_BASE=PASS c0d7f5568805af40fa77ae70e1387fbc5dbca2a5
LIVE_INVENTORY_ID=PASS sha256:e3d062462b03930c7abc565837254eb3e37c0866ac5b9dbd0ee537bc86f5acf5
LIVE_WORKTREES=PASS registrations=5 aliases=5
LIVE_STASH=PASS aliases=1
QUIESCENCE=PASS locks=0 markers=0 scopedWriters=0
```

Structured receipt: `2026-09-03T13:30:00Z`, exit `0`, duration `401ms`,
stdout SHA-256 `e052374b05277891eaa0efc43eea97b77770d67c859c902003e80731b1d3e2dd`.

#### Scope 1 Governance Evidence

**Executed:** YES.

**Session:** Current.

**Phase:** devops

**Command:** Bounded Scope 1 artifact, state, reference, prose, traceability,
schema, and Git whitespace chain recorded by the structured tool log.

**Exit Code:** 1

**Claim Source:** interpreted

**Interpretation:** The captured failure-shaped lines identify missing planned
test links. The focused ledger check, execution-substate check, YAML check,
reference check, prose report, and Git whitespace check produced clean signals.

```text
exit: 1
lines: 239
sha256: ada128566d97ebb31d1488e0c67a07386983ea911d50af9e184156496341a504
CHECK_BEGIN=artifact-lint
scenario-manifest.json references missing linked test file: __FUTURE_TEST__
RESULT: FAILED (29 failures, 0 warnings)
CHECK_EXIT=traceability:1
CHECK_EXIT=execution-substate:0
CHECK_EXIT=yaml-schema:0
CHECK_EXIT=reference-existence:0
CHECK_EXIT=technical-prose:0
CHECK_EXIT=git-diff-check:0
GOVERNANCE_CHAIN_EXIT=1
```

Structured receipt: `2026-09-03T13:30:49Z`, exit `1`, duration `8913ms`,
stdout SHA-256 `76a30363cc8d7b6b7c49e1ddaf821f84469c7673d763faffed5f13d12e9ee330`.

#### Scope 1 Work-Boundary Evidence

**Executed:** YES.

**Session:** Current.

**Phase:** devops

**Command:** `bash .github/bubbles/scripts/work-boundary-resolve.sh --feature-dir specs/_ops/OPS-integrate-research-lab-main --candidate-repo research-lab --candidate-spec specs/_ops/OPS-integrate-research-lab-main --candidate-path tests/ops-integrate-research-lab-main.functional.mjs --strict --require-allowed-paths`

**Exit Code:** 0

**Claim Source:** executed

```text
disposition=route-same-repo
repoMatch=true
reason=candidate path 'tests/ops-integrate-research-lab-main.functional.mjs' is
in-repo but outside the declared allowedPaths
```

The same command for `tests/ops-integrate-research-lab-main.integration.mjs`
returned `disposition=route-same-repo` and `repoMatch=true`.

#### Scope 1 Handoff

`OPS-PLAN-WORK-BOUNDARY-006` remains open for `bubbles.plan`.
The state boundary permits only the OPS packet, but Scope 1 plans two test files
under `tests/`.

`OPS-TEST-TRACEABILITY-007` remains open for `bubbles.test`.
The scenario manifest carries 15 missing linked-test sentinels that make the
all-scope traceability guard nonzero. The test owner may update evidence links
after authoring the planned files. Artifact lint passes on the current packet.

`OPS-TEST-AUTHORING-004` remains open for `bubbles.test` after the planner
reconciles both contracts. TP-01-01 through TP-01-03 have no execution evidence.
Their Test Plan rows and test DoD items remain unchanged.

No checkout, branch creation, merge, rebase, reset, stash mutation, clean,
product-file commit, push, ref deletion, or worktree removal ran.

#### Final Scope 1 Governance Summary

**Executed:** YES.

**Session:** Current.

**Phase:** devops

**Command:** Final bounded Scope 1 governance chain plus the required
single-file `traceability-guard.sh --all-scopes` invocation.

**Exit Code:** 1

**Claim Source:** interpreted

**Interpretation:** Every owned artifact, state, reference, prose, schema, and
whitespace check passed. The traceability guard remains nonzero because planned
test files are absent and all 15 manifest entries still name `__FUTURE_TEST__`.

```text
FINAL_CHECK_EXIT=artifact-lint:0
FINAL_CHECK_EXIT=artifact-freshness:0
FINAL_CHECK_EXIT=capability-foundation:0
FINAL_CHECK_EXIT=requirement-mechanism:0
FINAL_CHECK_EXIT=scenario-obligation:0
FINAL_CHECK_EXIT=execution-substate:0
FINAL_CHECK_EXIT=yaml-schema:0
FINAL_CHECK_EXIT=reference-existence:0
FINAL_CHECK_EXIT=technical-prose:0
FINAL_CHECK_EXIT=git-diff-check:0
TRACEABILITY_ALL_SCOPES_EXIT=1
TRACEABILITY_SCENARIOS=15
TRACEABILITY_FAILURES=29
TRACEABILITY_WARNINGS=0
```

Final governance capture SHA-256:
`ae2da1f994be07cd7e9f4ce4f2e2f2efc3a8cabb2538e43d327408b5a75275a9`.
All-scope traceability capture SHA-256:
`c1cc3a53b9a71cf65be190a1ee0e84e69a7363cdc04dcc82f87387766d8383ec`.

### Summary

The planning chain defines five sequential scopes for the local integration operation.
Scope 1 is `In Progress`. Its operational records and core outcomes are current.
Scopes 2 through 5 remain `Not Started`.
Scope 1 did not fetch, commit, merge, validate a candidate, update local `main`, push, or clean.

### Code Diff Evidence

Scope 1 adds the packet-owned objective, runbook, and integration ledger.
It updates only packet execution evidence and execution-state fields.
It changes no product source or test file.

### Completion Statement

No delivery completion statement exists at planning time.
The packet remains nonterminal until its owners execute and validate every unchecked DoD item.

### Test Evidence

No product, integration, browser, security, or operational test evidence has been appended.
Execution evidence must map to the exact `TP-*` and `DOD-*-TP-*` identifiers in [scopes.md](scopes.md).

### Validation Evidence

**Executed:** NO

**Phase Agent:** bubbles.validate

**Claim Source:** not-run

No validation-phase evidence exists in this initial planning report.

### Audit Evidence

**Executed:** NO

**Phase Agent:** bubbles.audit

**Claim Source:** not-run

No audit-phase evidence exists in this initial planning report.

### Chaos Evidence

**Executed:** NO

**Phase Agent:** bubbles.chaos

**Claim Source:** not-run

No chaos-phase evidence exists in this initial planning report.
