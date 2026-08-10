# Scopes: BUG-005 G087 Planning-Packet Linkage Unsatisfiable Under In-Place Delivery

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

> **The owner decision is recorded.** The blocking precondition for this packet
> — an owner selection among the candidate directions in
> [design.md](design.md#candidate-resolution-directions) — is discharged by
> [Owner Ruling](design.md#owner-ruling). D1 was adopted and implemented
> **upstream in the Bubbles framework**, and this repository received it through
> the normal install refresh. Every scope below is now Done with item-specific
> inline evidence. No certification is asserted by this file; certification
> remains owned by `bubbles.validate`.

---

## Scope 1: Owner Decision On Resolution Direction

**Status:** Done
**Depends On:** none
**Owner:** repository owner / framework maintainer (NOT agent-ownable)
**Scope-Kind:** docs-only

### Description

Select among candidate directions D1 (explicit in-place delivery
classification), D2 (self-referencing `linkedImplementationSpec`), D3 (G087
framework amendment), and D4 (repository convention that packets graduate
directly and never occupy `specs_hardened`). D2 is recorded but was already
refused as untruthful by spec 013's own `modeTransition` record.

This scope cannot be discharged by an agent. It is a classification and
governance choice with framework-wide consequences.

### Gherkin Scenarios

```gherkin
Feature: A truthful resolution direction is selected

  Scenario: Owner records a decision (SCN-BUG005-001)
    Given four candidate directions are documented with their costs
    When the owner selects one or a combination
    Then the decision and its rationale are recorded
    And an implementation packet may be opened against it

  Scenario: No direction is selected (SCN-BUG005-002)
    Given the decision is outstanding
    Then this bug remains blocked
    And spec 016 cannot reach its declared ceiling truthfully
```

### Implementation Plan

1. Owner reviews [design.md](design.md#candidate-resolution-directions).
2. Owner records the selected direction and rationale.
3. A separate implementation packet is opened. **Not this packet.**

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Static check | `functional` | `specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery/design.md` | Owner records a decision (SCN-BUG005-001) — a ruling and its rationale are recorded under `## Owner Ruling` | `grep -c '^### Ruling' specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery/design.md` | No |
| Static check | `functional` | `specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery/design.md` | No direction is selected (SCN-BUG005-002) — negative case: confirms a direction IS selected, so the blocked state is discharged rather than persisting | `grep -n '^### Ruling 1 — D1 adopted' specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery/design.md` | No |

### Definition of Done

- [x] Owner has selected a resolution direction from D1–D4 (or a documented combination) **Claim Source:** executed. [Evidence](design.md#owner-ruling)
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Command:** `grep -n '^## Owner Ruling\|^### Ruling' "$D"`, `grep -c '^### Ruling' "$D"`, `sed -n '240,246p' "$D"`
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ D=specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery/design.md
  > $ grep -n '^## Owner Ruling\|^### Ruling' "$D"
  > 229:## Owner Ruling
  > 240:### Ruling 1 — D1 adopted, implemented at the framework source
  > 315:### Ruling 2 — Spec 013's historical certification is discharged; annotate, do not rewrite
  > $ grep -c '^### Ruling' "$D"
  > 2
  > $ sed -n '240,246p' "$D"
  > ### Ruling 1 — D1 adopted, implemented at the framework source
  >
  > **Adopted: D1 (explicit in-place delivery classification), landed upstream.**
  >
  > The premise is the collision already established above. G087 offered exactly
  > two dispositions, and for a repository that plans and delivers in the **same**
  > packet, **both are false statements**. A gate whose only exits are lies is not
  > ```
  > **Result:** PASS
- [x] The selected direction and its rationale are recorded in a durable artifact (SCN-BUG005-001) **Claim Source:** executed. [Evidence](design.md#owner-ruling)
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Command:** `grep -c 'deliveryTopology' "$D"`, `wc -l < "$D"`, `sed -n '262,276p' "$D" | cut -c1-72`
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ grep -c 'deliveryTopology' "$D"
  > 6
  > $ wc -l < "$D"
  > 355
  > $ sed -n '262,276p' "$D" | cut -c1-72
  > #### The concrete change
  >
  > G087 now accepts a third satisfier:
  >
  > | Field | Accepted value | Meaning |
  > |---|---|---|
  > | `deliveryTopology` | `"in-place"` | The packet implements its own scop
  > | `deliveryTopologyJustification` | non-empty string | Required whenever
  >
  > Three properties make this a narrowing, not a loophole:
  >
  > - **Absent means `"two-spec"`.** Packets predating the field evaluate **
  >   as before** — no silent behavior change to any existing state.
  > - **An unrecognised value is REFUSED**, not treated as absent. A typo
  >   (`"inplace"`, `"in place"`) cannot buy a pass.
  > ```
  > **Result:** PASS
- [x] The consequences for spec 016's path to `specs_hardened` are stated explicitly (SCN-BUG005-002) **Claim Source:** executed. [Evidence](design.md#owner-ruling)
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Command:** `grep -ci 'spec 016' "$D"`, `sed -n '300,310p' "$D" | cut -c1-72`, `node -e` on `specs/016-auction-gamma-playbook/state.json`
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ grep -ci 'spec 016' "$D"
  > 5
  > $ sed -n '300,310p' "$D" | cut -c1-72
  > #### Consequence for spec 016
  >
  > Spec 016 is `status: not_started` under workflow mode `product-to-planni
  > whose status ceiling is `specs_hardened`. Before this fix it **could not
  > that ceiling truthfully**: the only mechanically available route was to
  > `planningOnly: true` while fully intending to build the scopes it names.
  >
  > It can now declare `deliveryTopology: "in-place"` with a justification a
  > `specs_hardened` **honestly**. The active concern recorded under
  > [Severity Calibration](#severity-calibration) is therefore resolved at t
  > framework layer.
  > $ node -e '<print spec 016 state fields>'
  > status=not_started
  > workflowMode=product-to-planning
  > deliveryTopology=(absent)
  > planningOnly=false
  > ```
  > **Result:** PASS

---

## Scope 2: Registry Wiring Description Correction (F1)

**Status:** Done
**Depends On:** none (orthogonal to Scope 1)
**Owner:** framework maintainer
**Scope-Kind:** docs-only

### Description

G087's registry entry states the gate is invoked by `state-transition-guard.sh`
as "Check 29". The actual invocation lives in
`.github/bubbles/scripts/guards/tail-delegated-gates.sh`. Grepping the
documented script returns 0 and produces a false negative, as demonstrated in
[report.md](report.md#e-a3--g087-wiring-at-b525326d-the-false-negative-trap).

`.github/bubbles/**` is framework-managed in this downstream repository and MUST
NOT be patched locally. This scope routes upstream.

### Gherkin Scenarios

```gherkin
Feature: Gate wiring is discoverable from its registry description

  Scenario: Investigator follows the registry description (SCN-BUG005-003)
    Given the G087 registry entry names the script that invokes the guard
    When an investigator greps that named script for the guard invocation
    Then the invocation is found there
    And no false negative is produced
```

### Implementation Plan

1. Route the description defect to the framework owner.
2. Framework amends the G087 registry description to name the delegating script.
3. Downstream repositories pick the correction up via the normal framework
   refresh path. **No local patch.**

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Static check | `functional` | `.github/bubbles/registry/gates.yaml` | G087 description names the script that actually invokes the guard | `grep -A12 '  G087:' .github/bubbles/registry/gates.yaml` | No |

### Definition of Done

- [x] The wiring-description defect is routed to the framework owner **Claim Source:** executed. [Evidence](design.md#owner-ruling)
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Command:** `git -C <bubbles> log --oneline -4` and `git -C <bubbles> show --stat --oneline a76bcb5 | head -6` (framework checkout path redacted to `<bubbles>`)
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ git -C <bubbles> log --oneline -4
  > a76bcb5 (HEAD -> main) docs(gates): stop 16 gate descriptions from sending investigators to the wrong file
  > 675c4cf fix(G087): let an in-place delivery spec declare that truthfully
  > fa3c7ce fix(awk): drop the gawk shim that failed silently, 2 of 4 scripts
  > 1b64af1 fix(v5.3-selftest): a 3-line stderr preamble hid the banner from a 5-line window
  > $ git -C <bubbles> show --stat --oneline a76bcb5 | head -6
  > a76bcb5 docs(gates): stop 16 gate descriptions from sending investigators to the wrong file
  >  bubbles/registry/gates.yaml   | 32 ++++++++++++++++----------------
  >  bubbles/release-manifest.json |  8 ++++----
  >  bubbles/workflows.yaml        | 32 ++++++++++++++++----------------
  >  3 files changed, 36 insertions(+), 36 deletions(-)
  > ```
  > **Result:** PASS
- [x] The G087 registry description names the delegating script, or explicitly notes the delegation **Claim Source:** executed. [Evidence](design.md#owner-ruling)
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Note:** the defect was 16 gates wide, not 1 — 13 delegate through `tail-delegated-gates.sh` and 3 through `tail-convergence-gates.sh`.
  > **Command:** `grep -o 'through its sourced delegator [^,]*' .github/bubbles/registry/gates.yaml | sort | uniq -c` plus the corroborating counts below
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ grep -o 'through its sourced delegator [^,]*' .github/bubbles/registry/gates.yaml | sort | uniq -c
  >       3 through its sourced delegator bubbles/scripts/guards/tail-convergence-gates.sh
  >      13 through its sourced delegator bubbles/scripts/guards/tail-delegated-gates.sh
  > $ grep -c 'through its sourced delegator' .github/bubbles/registry/gates.yaml
  > 16
  > $ grep -c 'through its sourced delegator' .github/bubbles/workflows.yaml
  > 16
  > $ grep -c 'invokes this guard as Check [0-9]* through its sourced delegator' .github/bubbles/registry/gates.yaml
  > 14
  > $ ls -1 .github/bubbles/scripts/guards/
  > control-plane-checks.sh
  > planning-checks.sh
  > sensitive-client-storage-scan.py
  > tail-convergence-gates.sh
  > tail-delegated-gates.sh
  > ```
  > **Result:** PASS
- [x] Grepping the script named in the description locates the invocation (SCN-BUG005-003) **Claim Source:** executed. [Evidence](report.md#e-a3--g087-wiring-at-b525326d-the-false-negative-trap)
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Command:** `grep -c 'planning-packet-linkage-guard.sh' .github/bubbles/scripts/guards/tail-delegated-gates.sh` and the original false-negative grep, preserved
  > **Exit Code:** 0 (the `grep -c` returning `0` is the preserved false negative, not a failure)
  > **Output:**
  >
  > ```text
  > $ grep -c 'planning-packet-linkage-guard.sh' .github/bubbles/scripts/guards/tail-delegated-gates.sh
  > 3
  > $ grep -c 'planning-packet-linkage-guard' .github/bubbles/scripts/state-transition-guard.sh
  > 0
  > $ grep -n 'source .*tail-delegated-gates' .github/bubbles/scripts/state-transition-guard.sh
  > 4082:source "$SCRIPT_DIR/guards/tail-delegated-gates.sh"
  > $ grep -n 'planning-packet-linkage-guard' .github/bubbles/scripts/guards/tail-delegated-gates.sh
  > 101:# Mechanical wrapper around bubbles/scripts/planning-packet-linkage-guard.sh.
  > 108:planning_linkage_guard="$SCRIPT_DIR/planning-packet-linkage-guard.sh"
  > 121:  info "planning-packet-linkage-guard.sh not present at $planning_linkage_guard; skipping (advisory)"
  > $ grep -c '^source "$SCRIPT_DIR/guards/' .github/bubbles/scripts/state-transition-guard.sh
  > 4
  > ```
  > **Result:** PASS
- [x] No file under `.github/bubbles/**` was patched locally in this repository **Claim Source:** executed. [Evidence](design.md#owner-ruling)
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Command:** five independent cleanliness probes over the framework-managed tree plus its commit history
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ git status --porcelain .github/bubbles/ | wc -l
  > 0
  > $ git ls-files -m .github/bubbles/ | wc -l
  > 0
  > $ git ls-files -o --exclude-standard .github/bubbles/ | wc -l
  > 0
  > $ git diff --name-only .github/bubbles/ | wc -l
  > 0
  > $ git diff --cached --name-only .github/bubbles/ | wc -l
  > 0
  > $ git log --oneline -2 -- .github/bubbles/
  > fc890ad7 (HEAD -> main) chore(bubbles): refresh again to pick up the 16-gate wiring-description fix
  > 7fac02ac chore(bubbles): refresh the downstream install to pick up the G087 in-place fix
  > ```
  > **Result:** PASS

---

## Scope 3: Disposition Of Spec 013's Historical Certification (F2)

**Status:** Done
**Depends On:** Scope 1
**Owner:** repository owner
**Scope-Kind:** docs-only

### Description

Commit `b525326d` certified spec 013 to `specs_hardened` in a state that G087 —
wired and live at that commit — rejects on replay. Spec 013 has since graduated
to `full-delivery` / `in_progress` and passes G087 today, so the risk is
**latent, not active**.

Decide whether the historical record needs explicit annotation, or whether the
graduation at `602f32db` already discharges it.

### Gherkin Scenarios

```gherkin
Feature: A live blocking gate is not silently passed by a rejecting state

  Scenario: Historical certification is dispositioned (SCN-BUG005-004)
    Given spec 013 was certified at a commit where G087 was live
    And replaying the guard at that commit exits 1
    When the owner reviews the record
    Then the discrepancy is either annotated or explicitly ruled discharged

  Scenario: The latent risk is confirmed to be latent (SCN-BUG005-005)
    Given spec 013 is at status in_progress under full-delivery
    When the guard is run against spec 013 at HEAD
    Then it exits 0
    And no active failure is attributable to this finding
```

### Implementation Plan

1. Owner reviews the replay evidence in [report.md](report.md#test-evidence).
2. Owner rules: annotate, or declare discharged by graduation.
3. Record the ruling. **No edit to `specs/013-*` is made by this packet.**

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
|---|---|---|---|---|---|
| Guard replay | `functional` | `specs/013-market-regime-stack-and-strategy-playbook` | Replay G087 against the archived certifying commit; expect exit 1 | see [bug.md](bug.md#r1--spec-013-was-certified-in-a-state-g087-rejects) | No |
| Guard at HEAD | `functional` | `specs/013-market-regime-stack-and-strategy-playbook` | Confirm the risk is latent; expect exit 0 | `bash .github/bubbles/scripts/planning-packet-linkage-guard.sh specs/013-market-regime-stack-and-strategy-playbook` | No |
| Static check | `functional` | `specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery/design.md` | Historical certification is dispositioned (SCN-BUG005-004) — Ruling 2 records the disposition | `grep -n '^### Ruling 2' specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery/design.md` | No |

### Definition of Done

- [x] The replay evidence is reviewed by the owner **Claim Source:** executed. [Evidence](report.md#e-a4--reproduction-g087-violation-at-the-certifying-commit)
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Command:** `grep -n '^#### E-A' "$R"`, `grep -c '^#### E-A' "$R"`, `wc -l < "$R"`
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ R=specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery/report.md
  > $ grep -n '^#### E-A' "$R"
  > 45:#### E-A1 — Certifying commit identity
  > 57:#### E-A2 — Spec 013 state at the certifying commit
  > 72:#### E-A2b — Key presence (CORRECTION: keys present with falsy values, not absent)
  > 99:#### E-A3 — G087 wiring at b525326d (the false-negative trap)
  > 122:#### E-A4 — Reproduction: G087 violation at the certifying commit
  > 144:#### E-A5 — G087 has no grandfather clause
  > 169:#### E-A6 — The risk is LATENT, not active
  > $ grep -c '^#### E-A' "$R"
  > 7
  > $ wc -l < "$R"
  > 366
  > ```
  > **Result:** PASS
- [x] A ruling is recorded: annotate the historical record, or declare it discharged by the `602f32db` graduation (SCN-BUG005-004) **Claim Source:** executed. [Evidence](design.md#owner-ruling)
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Ruling:** discharged by the `602f32db` graduation; the historical record is left intact and this ruling is the annotation.
  > **Command:** `grep -c '602f32db' "$D"`, `grep -c 'b525326d' "$D"`, `sed -n '317,323p' "$D" | cut -c1-72`, `sed -n '329,333p' "$D" | cut -c1-72`
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ grep -c '602f32db' "$D"
  > 4
  > $ grep -c 'b525326d' "$D"
  > 6
  > $ sed -n '317,323p' "$D" | cut -c1-72
  > **Ruled: discharged by the `602f32db` graduation. No rewrite.**
  >
  > - **The risk is latent, not active.** G087 fires only when top-level
  >   `status == "specs_hardened"`. Spec 013 is now `status: in_progress` un
  >   `full-delivery`, so the gate does not apply and the guard exits **0**
  >   it at HEAD — as already evidenced under
  >   [Severity Calibration](#severity-calibration).
  > $ sed -n '329,333p' "$D" | cut -c1-72
  > **Disposition:** leave the historical record intact. This ruling is the
  > annotation — the `b525326d` certification was reviewed and ruled **dis
  > by the subsequent graduation. This closes follow-up **F2**.
  >
  > **`specs/013-*` is NOT modified by this packet.**
  > ```
  > **Result:** PASS
- [x] The latent-not-active characterization is confirmed or corrected against fresh guard output (SCN-BUG005-005) **Claim Source:** executed. [Evidence](report.md#e-a6--the-risk-is-latent-not-active)
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Command:** `bash .github/bubbles/scripts/planning-packet-linkage-guard.sh specs/013-market-regime-stack-and-strategy-playbook`
  > **Exit Code:** 0 (confirmed latent — G087 does not apply at `status: in_progress`)
  > **Output:**
  >
  > ```text
  > $ bash .github/bubbles/scripts/planning-packet-linkage-guard.sh specs/013-market-regime-stack-and-strategy-playbook
  > planning-packet-linkage-guard: PASS Gate G087 (planning_packet_implementation_linkage_gate) - spec=specs/013-market-regime-stack-and-strategy-playbook status=in_progress planningOnly=false deliveryTopology=two-spec
  > $ echo "GUARD013_EXIT=$?"
  > GUARD013_EXIT=0
  > $ node -e '<print spec 013 state fields>'
  > status=in_progress
  > workflowMode=full-delivery
  > deliveryTopology=(absent)
  > planningOnly=false
  > linkedImplementationSpec=null
  > $ bash .github/bubbles/scripts/planning-packet-linkage-guard.sh specs/016-auction-gamma-playbook
  > planning-packet-linkage-guard: PASS Gate G087 (planning_packet_implementation_linkage_gate) - spec=specs/016-auction-gamma-playbook status=not_started planningOnly=false deliveryTopology=two-spec
  > $ echo "GUARD016_EXIT=$?"
  > GUARD016_EXIT=0
  > ```
  > **Result:** PASS
- [x] `specs/013-*` remains unmodified by this packet **Claim Source:** executed. [Evidence](design.md#owner-ruling)
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Command:** working-tree, unstaged-diff, staged-diff, history, and on-disk-artifact probes scoped to `specs/013-market-regime-stack-and-strategy-playbook`
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ S=specs/013-market-regime-stack-and-strategy-playbook
  > $ git status --porcelain "$S" | wc -l
  > 0
  > $ git diff --numstat -- "$S" | wc -l
  > 0
  > $ git diff --cached --numstat -- "$S" | wc -l
  > 0
  > $ git log --date=short --format='%h %ad %s' -3 -- "$S"
  > 9bb2d697 2026-07-29 chore(specs): record mode graduation for 013 and 014
  > 392931e7 2026-07-28 spec(013): CERTIFIED at specs_hardened ceiling
  > 8c785b60 2026-07-28 plan(013): complete planning for expanded 14-scope packet (guard 19 -> 2)
  > $ ls -1 "$S"
  > audit-result-AUD-013-001.txt
  > audit-result-AUD-013-002.txt
  > audit-result-AUD-013-003.txt
  > audit-result-AUD-013-004.txt
  > audit-result.txt
  > design.md
  > report.md
  > scenario-manifest.json
  > scopes
  > spec.md
  > state.json
  > test-plan.json
  > uservalidation.md
  > ```
  > **Result:** PASS

---

## Cross-Scope Constraints

These hold for every scope above and were honored while authoring this packet:

- [x] No `.html`, `.js`, or `.mjs` file is created or modified **Claim Source:** executed.
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Note:** the three dirty entries below belong to the concurrent spec-017 attention session, not to this packet. Zero `.html` files are dirty; the `.mjs` and `.js` entries are that session's files.
  > **Command:** `git status --porcelain -- '*.html' '*.js' '*.mjs'` plus per-extension counts
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ git status --porcelain -- '*.html' '*.js' '*.mjs'
  >  M rlattention.js
  >  M scripts/validate-brief-payload.mjs
  >  M tests/attention-payload-contract.test.mjs
  > $ git status --porcelain -- '*.html' | wc -l
  > 0
  > $ git status --porcelain -- '*.js' | wc -l
  > 1
  > $ git status --porcelain -- '*.mjs' | wc -l
  > 2
  > $ git ls-files -o --exclude-standard -- '*.html' '*.js' '*.mjs' | wc -l
  > 0
  > $ git diff --numstat -- tests/attention-payload-contract.test.mjs
  > 63      0       tests/attention-payload-contract.test.mjs
  > ```
  > **Result:** PASS
- [x] `specs/013-*` and `specs/016-*` are not modified **Claim Source:** executed.
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Command:** paired unstaged/staged diff probes across both spec directories plus their commit history
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ git diff --stat -- specs/013-market-regime-stack-and-strategy-playbook specs/016-auction-gamma-playbook
  > $ git diff --numstat -- specs/013-market-regime-stack-and-strategy-playbook specs/016-auction-gamma-playbook | wc -l
  > 0
  > $ git diff --cached --numstat -- specs/013-market-regime-stack-and-strategy-playbook specs/016-auction-gamma-playbook | wc -l
  > 0
  > $ git log --oneline -2 -- specs/016-auction-gamma-playbook
  > e47ac658 feat(brief): close Step 7 tool coverage, gate D13 at publish, collapse D4 duplicate
  > 0222ed9a docs: promote spec 016 to its product-to-planning ceiling
  > $ git status --porcelain specs/013-market-regime-stack-and-strategy-playbook specs/016-auction-gamma-playbook
  > $ echo "(exit=$?)"
  > (exit=0)
  > ```
  > **Result:** PASS
- [x] No file under `.github/bubbles/**` is patched locally **Claim Source:** executed.
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Note:** the installed guard carries the upstream in-place satisfier and passes 43/43 including the adversarial S11/S12 cases, so the behavior arrived via install refresh, not a local patch.
  > **Command:** `bash .github/bubbles/scripts/planning-packet-linkage-guard-selftest.sh` (verbatim contiguous tail from S9 to the verdict; the full run was executed)
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ git status --porcelain .github/bubbles/ | wc -l
  > 0
  > $ git ls-files .github/bubbles/ | wc -l
  > 507
  > $ bash .github/bubbles/scripts/planning-packet-linkage-guard-selftest.sh
  > --- S9: in-place combined with planningOnly is contradictory and fails ---
  >   PASS: S9 in-place plus planningOnly exit=1
  >   PASS: S9 stderr contains 'G087'
  >   PASS: S9 stderr contains 'not both'
  >
  > --- S10: in-place combined with an external link is contradictory and fails ---
  >   PASS: S10 in-place plus external link exit=1
  >   PASS: S10 stderr contains 'G087'
  >   PASS: S10 stderr contains 'no external implementation target'
  >
  > --- S11: an unrecognized deliveryTopology value fails instead of passing silently ---
  >   PASS: S11 unrecognized topology exit=1
  >   PASS: S11 stderr contains 'G087'
  >   PASS: S11 stderr contains 'is not one of'
  >
  > --- S12: non-vacuity — explicit two-spec still requires the link ---
  >   PASS: S12 two-spec still enforced exit=1
  >   PASS: S12 stderr contains 'G087'
  >   PASS: S12 stderr contains 'linkedImplementationSpec is missing or empty'
  >
  > === Selftest verdict ===
  >   Total assertions: 43
  >   Passed:           43
  >   Failed:           0
  > planning-packet-linkage-guard-selftest: PASSED
  > ```
  > **Result:** PASS
- [x] Files owned by the concurrent BUG-004 packet (`market-heatmap-lab.html`, `rlexperience.js`, `rlbrief.js`, and related tests) are not touched, reverted, stashed, or committed **Claim Source:** executed.
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Note:** the 10 stash entries are pre-existing; no stash, reset, restore, checkout, or commit was run by this packet, and `HEAD` is unmoved.
  > **Command:** working-tree probes on the three named files plus stash/HEAD invariance checks
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ git status --porcelain market-heatmap-lab.html rlexperience.js rlbrief.js
  > $ git status --porcelain market-heatmap-lab.html rlexperience.js rlbrief.js | wc -l
  > 0
  > $ git ls-files -m market-heatmap-lab.html rlexperience.js rlbrief.js | wc -l
  > 0
  > $ ls -1 market-heatmap-lab.html rlexperience.js rlbrief.js | wc -l
  > 3
  > $ git stash list | wc -l
  > 10
  > $ git rev-parse --short HEAD
  > fc890ad7
  > $ git log --oneline fc890ad7..HEAD | wc -l
  > 0
  > $ git log -1 --format='%s'
  > chore(bubbles): refresh again to pick up the 16-gate wiring-description fix
  > ```
  > **Result:** PASS
- [x] `state.json` remains valid JSON under `jq -e .` **Claim Source:** executed.
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Command:** `jq -e . "$P/state.json"` plus field, byte-size, and key-count probes
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ P=specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery
  > $ jq -e . "$P/state.json" >/dev/null && echo VALID_JSON
  > VALID_JSON
  > $ jq -r '"status=\(.status)","workflowMode=\(.workflowMode)","planningOnly=\(.planningOnly // "(absent)")","deliveryTopology=\(.deliveryTopology // "(absent)")"' "$P/state.json"
  > status=blocked
  > workflowMode=bugfix-fastlane
  > planningOnly=(absent)
  > deliveryTopology=(absent)
  > $ wc -c < "$P/state.json"
  > 10748
  > $ jq -r 'keys | length' "$P/state.json"
  > 32
  > ```
  > **Result:** PASS
- [x] No DoD box in this packet is checked while the owner decision is outstanding **Claim Source:** executed. [Evidence](design.md#owner-ruling)
  > **Phase:** implement
  > **Executed:** YES (current session)
  > **Note:** the decision is no longer outstanding. `## Owner Ruling` exists in `design.md`, and the framework refreshes that carry the adopted direction are already at `HEAD`, so the record predates every box checked here.
  > **Command:** history and presence probes proving the ruling is recorded before any box was checked
  > **Exit Code:** 0
  > **Output:**
  >
  > ```text
  > $ git log --date=short --format='%h %ad %s' -3 -- "$D"
  > 20523dfb 2026-07-29 bug(005): G087 planning-packet linkage has no truthful path under in-place delivery
  > $ git status --porcelain "$D"
  >  M specs/_bugs/BUG-005-g087-planning-packet-linkage-unsatisfiable-in-place-delivery/design.md
  > $ grep -c '^## Owner Ruling' "$D"
  > 1
  > $ git log --oneline -6
  > fc890ad7 (HEAD -> main) chore(bubbles): refresh again to pick up the 16-gate wiring-description fix
  > 7fac02ac chore(bubbles): refresh the downstream install to pick up the G087 in-place fix
  > 3b532cf2 certify(017): resolved observations now carry residual severity, not original severity
  > 2ba49ed1 validate(BUG-001): certify SCOPE-01 and close the packet
  > 413bb92e audit(BUG-001): first completed delivery-completion-v1 evaluation
  > 55a96603 spec-review(017): the last at-done blocker, executed rather than recorded
  > ```
  > **Result:** PASS
