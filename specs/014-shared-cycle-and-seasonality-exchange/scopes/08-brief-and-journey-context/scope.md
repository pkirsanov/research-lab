# Scope 8: Brief and Journey context

**Status:** Not Started
**Depends On:** Scope 1 (`01-foundation-contracts-and-publication`), Scope 4 (`04-consumption-ledger-and-type-dispatch`), Scope 7 (`07-lab-surface-simple-power-mobile`)
**Tags:** `overlay:true`

**Primary Outcome:**
`RLCYCX.coverageFromConsumption(records, decisionTime)` and the `cycle-context-surface/v1` contract make consumer context
honest on the two surfaces that carry it: the Market Brief cycle-context block in `rlbrief.js` (S3) and the guided Journey
cycle step in `rljourney.js` (S4). Coverage is asserted from consumption records with outcome `consumed` and from nothing
else — an admitted envelope that exists but was never consumed contributes nothing, and a present cache key with no
consumed record claims nothing, so envelope existence and key presence are both structurally excluded from the coverage
computation. Evidence whose as-of vintage precedes the run's decision time is stated as stale with its vintage named, is
not presented as current, and is never silently refreshed by substituting a vintage that was never consumed. Where no
admitted, applicable, as-of-valid envelope exists, the surface states `context-absent` or `context-refused` with its
reason — the two are textually and visually distinct — and renders no neutral value, no zero, no last-known reading, no
nearby subject, and no earlier vintage in its place. A guided Journey participant cannot override a refusal or re-scope
the evidence to their own subject: the override path is absent from the DOM, the step states plainly that the context is
not applicable for that subject, and no cycle value derived from another subject's evidence is presented. Every one of
these refusals is terminal and non-upgradable, and none mutates the evidence, applicability, or consumption state that
preceded it.

---

## Business Scenarios owned

### BS-014-030: Consumer context coverage is asserted from consumption records, never from key presence

```gherkin
Scenario: An envelope that exists but was never consumed contributes nothing to stated coverage
  Given a consumer context surface covering three subjects
  And admitted envelopes exist for all three subjects
  And only one of the three produced a consumption record with outcome consumed for an applicable, as-of-valid record
  When the surface states its cycle and seasonal coverage for the run
  Then exactly one subject is stated as context-present
  And the two subjects whose envelopes exist but produced no consumed record are not counted in the coverage claim
  And the coverage claim cites the consumption records rather than the existence of the envelopes
```

### BS-014-031: Stale evidence is stated as stale rather than presented as current

```gherkin
Scenario: A consumer context surface names staleness explicitly
  Given a consumer context surface running at a decision time later than the as-of vintage of the only available admitted envelope for a covered subject
  When the surface renders cycle context for that subject
  Then the surface states the as-of vintage of the evidence and states that it is stale relative to the run
  And the stale reading is not presented as current
  And the stale reading is not silently refreshed by substituting a later vintage that was never consumed
```

### BS-014-032: Unavailable context degrades to an honest refusal, never to a neutral value

```gherkin
Scenario: Brief and Journey consumption states absence instead of inventing a value
  Given a consumer context surface requesting cycle context for a covered subject
  And no admitted, applicable, as-of-valid envelope exists for that subject at the run's decision time
  When the surface renders cycle context for that subject
  Then the surface states context-absent or context-refused with its reason
  And no neutral value, no zero, and no last-known reading is rendered in place of the missing context
  And no nearby subject and no earlier vintage is substituted for the missing evidence
```

### BS-014-033: A guided Journey participant cannot override a refusal

```gherkin
Scenario: A refused journey step states the refusal and does not proceed on an overridden value
  Given a guided journey step that requests cycle context for the participant's subject
  And the consumption attempt produced the outcome refused-applicability
  When A6 attempts to proceed by overriding the refusal or by re-scoping the evidence to their own subject
  Then the override is refused
  And the step states plainly that the context is not applicable for the participant's subject
  And no cycle value derived from another subject's evidence is presented to the participant
```

---

## Implementation Plan

1. **Add the `cycle-context-surface/v1` contract to `rlcycx.js`** exactly as `design.md` → `### Consumer-surface state`
   defines it, registered in the same deeply frozen contract table as the foundation's other contracts, with the closed
   surface-state vocabulary `context-present` / `context-absent` / `context-refused` and no fourth value.
2. **Implement `RLCYCX.coverageFromConsumption(records, decisionTime)` in `rlcycx.js`** so its only input is the
   consumption-record set. A subject is `context-present` only when a record with outcome `consumed` exists for an
   applicable, as-of-valid envelope; the returned claim cites the contributing consumption record identities. The function
   signature accepts no envelope collection and no cache handle, so envelope existence and key presence are structurally
   incapable of entering the coverage computation.
3. **Implement the unbacked-coverage refusal in `rlcycx.js`** so a claim asserted for a subject with no contributing
   `consumed` record refuses with `cyc-coverage-unbacked` naming the unbacked subject, rather than returning a coverage
   count that happens to be zero.
4. **Implement the staleness band in `rlcycx.js`** so the surface state carries the evidence as-of vintage, the run's
   decision-time cutoff, and the signed distance between them. A reading whose vintage precedes the cutoff is marked stale
   and any attempt to present it as current refuses with `cyc-stale-presented-as-current` naming the vintage and the
   cutoff. No path substitutes a vintage that produced no consumed record.
5. **Implement the two absence states in `rlcycx.js`** so `cyc-context-absent` fires when no admitted, applicable,
   as-of-valid envelope exists and `cyc-context-refused` fires when an admitted envelope was refused at consumption. The
   two carry distinct codes and distinct reasons and are never collapsed into one, and neither path produces a neutral
   value, a zero, a last-known reading, a nearby subject, or an earlier vintage.
6. **Add the cycle-context block to `rlbrief.js` (S3)** consuming `rlcycx.js` and rendering the coverage claim, the
   staleness band, and the two absence states each with a named reason and a resolve line. The block changes no existing
   brief contract and no other tool's read handling.
7. **Add the guided cycle step to `rljourney.js` (S4)** with its gating: a step whose consumption produced
   `refused-applicability` states plainly that the context is not applicable for the participant's subject, presents no
   cycle value derived from another subject's evidence, and contains **no** proceed-anyway, re-scope, or override
   affordance in the DOM — absent rather than `disabled` or `hidden`. Any programmatic attempt to reach the refused value
   refuses with `cyc-override-attempted`, the code Scope 7 owns and whose exact-code assertion Scope 7's named test
   established. The step changes no existing journey step semantics.
8. **Add 014's own cycle owner-read adapter to `scripts/brief-refresh.mjs`**, leaving Feature 013's regime owner-read
   adapter in that file byte-identical.
9. **Extend `tests/fixtures/shared-cycle-exchange/**`** with the context fixture family: three covered subjects with
   admitted envelopes where exactly one produced a `consumed` record; a genuinely present cache key with no consumed
   record; a stale reading whose values are plausible and current-looking alongside a newer vintage that produced no
   consumed record; a subject with no admitted envelope; a subject whose envelope was refused at consumption; and a
   journey fixture whose step consumption produced `refused-applicability` with another subject's positive evidence
   available in the same run.
10. **Extend `tests/shared-cycle-exchange.functional.mjs`, `tests/shared-cycle-exchange.integration.mjs`,
    `tests/shared-cycle-exchange.e2e.mjs`, and `tests/shared-cycle-exchange.spec.mjs`** with the coverage, staleness,
    absence, and override tests.

---

### Test Plan

Every negative row asserts the exact `refusalCode` string plus its companion field — the unbacked subject for
`cyc-coverage-unbacked`, the vintage and cutoff for `cyc-stale-presented-as-current`, the reason for `cyc-context-absent`
and `cyc-context-refused`, and the attempted control path for the journey override. No row asserts only that "a refusal
occurred". No Playwright row contains an early-exit bailout: every required assertion is a direct
`expect(locator).toBeVisible()` or a direct count assertion with no escape path, and no row returns early on a URL check
or a missing element. `cyc-override-attempted` is owned by Scope 7 per the `_index.md` refusal-code ownership map, whose
named test established the exact-code assertion; the rows below prove the Journey-side behaviour on that same code.

| Test Type | ID | Category | Scenarios | File/Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|---|
| Functional | T-08-F1 | `functional` | BS-014-030 | `tests/shared-cycle-exchange.functional.mjs` | Across three covered subjects with admitted envelopes for all three and a `consumed` record for exactly one, `coverageFromConsumption` states exactly one `context-present`, excludes the other two, and cites the contributing consumption record identities. The two excluded subjects have complete, applicable, as-of-valid envelopes, so an existence-based implementation would claim three — which is exactly what the row fails. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-08-F2 | `functional` | BS-014-031 | `tests/shared-cycle-exchange.functional.mjs` | `cyc-stale-presented-as-current` fires when a stale reading whose values are plausible and current-looking is presented as current; the row asserts the as-of vintage, the run cutoff, and the signed distance are all carried, and that a newer vintage present in the fixture but never consumed is not substituted. The plausible values and the available newer vintage are what make the row adversarial. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Integration | T-08-I1 | `integration` | BS-014-030 | `tests/shared-cycle-exchange.integration.mjs` | `cyc-coverage-unbacked` fires for a subject whose cache **key is genuinely present** but which produced no `consumed` record, naming the unbacked subject. The key's real presence is the adversarial element: an implementation keying coverage off the cache passes without it. | `node --test tests/shared-cycle-exchange.integration.mjs` | No |
| Integration | T-08-I2 | `integration` | BS-014-033 | `tests/shared-cycle-exchange.integration.mjs` | A journey re-scope attempt from a `refused-applicability` step to the participant's own subject writes exactly one further consumption record with outcome `refused-applicability` and yields no value; the row asserts the prior admitted envelope and every prior consumption record are byte-identical after the attempt, so the refusal mutates nothing. | `node --test tests/shared-cycle-exchange.integration.mjs` | No |
| E2E (headless) | T-08-E1 | `e2e` | BS-014-032 | `tests/shared-cycle-exchange.e2e.mjs` | `cyc-context-absent` and `cyc-context-refused` are distinct exact codes carrying distinct reasons on the headless surface contract; the row asserts neither path returns a neutral value, a zero, a last-known reading, a nearby subject, or an earlier vintage, and that the two are not collapsed into a single state. | `node --test tests/shared-cycle-exchange.e2e.mjs` | No |
| E2E UI | T-08-P1 | `e2e-ui` | BS-014-032 | `tests/shared-cycle-exchange.spec.mjs` | The Brief cycle-context block renders `context-absent` and `context-refused` as textually and visually distinct named reasons each with a resolve line, asserted by direct `expect(locator).toBeVisible()`; the row asserts neither region is a spinner, blank, an em dash, or a zero, and that no nearby-subject or earlier-vintage reading appears in the block. | `npx --no-install playwright test tests/shared-cycle-exchange.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| E2E UI | T-08-P2 | `e2e-ui` | BS-014-031 | `tests/shared-cycle-exchange.spec.mjs` | The Brief states the as-of vintage and labels the reading stale relative to the run, asserted on visible text; the row asserts the reading carries no current-band label and that the newer unconsumed vintage present in the fixture does not appear anywhere in the block. | `npx --no-install playwright test tests/shared-cycle-exchange.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| E2E UI | T-08-P3 | `e2e-ui` | BS-014-030 | `tests/shared-cycle-exchange.spec.mjs` | Running the Brief across the three-subject fixture states exactly one subject `context-present` and cites the consumption records; the row asserts the coverage line names one subject and that the two envelope-only subjects appear in neither the count nor the cited basis. | `npx --no-install playwright test tests/shared-cycle-exchange.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| E2E UI | T-08-P4 | `e2e-ui` | BS-014-033 | `tests/shared-cycle-exchange.spec.mjs` | On a `refused-applicability` Journey step, a DOM-wide query for any proceed-anyway, re-scope, or override affordance returns a count of **zero**, keyboard-focus traversal of the step reaches none, and none exists in a `hidden` or `disabled` form; the step's refusal sentence is asserted visible, and the row asserts no cycle value derived from the other subject's positive evidence — which is present in the same run — appears anywhere in the step. | `npx --no-install playwright test tests/shared-cycle-exchange.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| Project check | T-08-S1 | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the Brief block, the Journey step, and 014's own owner-read adapter land, proving this scope adds no repo-check regression and alters no other feature's registration. | `node scripts/selftest.mjs` | No |

**Test Plan rows: 10.**

---

### Definition of Done

#### Core items

- [ ] `cycle-context-surface/v1` is registered in `rlcycx.js` with the closed three-value surface-state vocabulary `context-present` / `context-absent` / `context-refused`.
- [ ] `RLCYCX.coverageFromConsumption(records, decisionTime)` takes only consumption records; its signature accepts no envelope collection and no cache handle, so existence and key presence cannot enter the computation.
- [ ] A coverage claim cites the contributing consumption record identities, and a claim for a subject with no contributing `consumed` record refuses with `cyc-coverage-unbacked`.
- [ ] The surface state carries the evidence as-of vintage, the run's decision-time cutoff, and the signed distance; presenting a stale reading as current refuses with `cyc-stale-presented-as-current`.
- [ ] No path substitutes a vintage that produced no consumed record.
- [ ] `cyc-context-absent` and `cyc-context-refused` carry distinct codes and distinct reasons, are never collapsed, and neither produces a neutral value, a zero, a last-known reading, a nearby subject, or an earlier vintage.
- [ ] `rlbrief.js` carries the cycle-context block consuming `rlcycx.js`, and no existing brief contract and no other tool's read handling changed.
- [ ] `rljourney.js` carries the guided cycle step, and no existing journey step semantics changed.
- [ ] The Journey step contains no proceed-anyway, re-scope, or override affordance in the DOM — absent rather than `disabled` or `hidden` — and presents no cycle value derived from another subject's evidence.
- [ ] Every surface refusal is terminal and non-upgradable, and none mutates evidence, applicability, or consumption state admitted before it.
- [ ] All four surface refusal codes owned by this scope per `_index.md` — `cyc-context-absent`, `cyc-context-refused`, `cyc-coverage-unbacked`, `cyc-stale-presented-as-current` — each have a named negative test asserting the exact code string plus its companion field.
- [ ] Every file this scope touches — `rlcycx.js`, `rlbrief.js`, `rljourney.js`, `scripts/brief-refresh.mjs`, `tests/shared-cycle-exchange.functional.mjs`, `tests/shared-cycle-exchange.integration.mjs`, `tests/shared-cycle-exchange.e2e.mjs`, `tests/shared-cycle-exchange.spec.mjs`, `tests/fixtures/shared-cycle-exchange/**` — is listed in `design.md` → `### Files 014 MAY CREATE` or `### Files 014 MAY MODIFY`, and no Protected Surface is opened as a change target.
- [ ] **Feature 013 interaction:** this scope opens three shared files. In `scripts/brief-refresh.mjs` it adds 014's own cycle owner-read adapter and leaves Feature 013's regime owner-read adapter byte-identical. In `rlbrief.js` and `rljourney.js` it adds only 014's block and step and changes no existing contract or step semantics. It touches none of the five counted registries and does not reopen `rldata.js`, so `node scripts/validate-tool-experience.mjs` stays green against the unchanged counts.

#### Test items

- [ ] T-08-F1 passes: exactly one of three envelope-backed subjects is `context-present`, cited from consumption records → evidence recorded in `report.md`.
- [ ] T-08-F2 passes: `cyc-stale-presented-as-current` fires on a plausible-looking stale reading with the vintage, cutoff, and signed distance carried, and the newer unconsumed vintage is not substituted → evidence recorded in `report.md`.
- [ ] T-08-I1 passes: `cyc-coverage-unbacked` fires for a genuinely present cache key with no consumed record → evidence recorded in `report.md`.
- [ ] T-08-I2 passes: a journey re-scope attempt writes one `refused-applicability` record, yields no value, and leaves all prior records byte-identical → evidence recorded in `report.md`.
- [ ] T-08-E1 passes: `cyc-context-absent` and `cyc-context-refused` are distinct codes with distinct reasons and neither yields a substitute reading → evidence recorded in `report.md`.
- [ ] T-08-P1 passes: the Brief renders the two absence states as visually and textually distinct named reasons with resolve lines and no substitute reading → evidence recorded in `report.md`.
- [ ] T-08-P2 passes: the Brief names the as-of vintage, labels it stale, and shows no newer unconsumed vintage → evidence recorded in `report.md`.
- [ ] T-08-P3 passes: the Brief coverage line states one subject and cites the consumption records, excluding the two envelope-only subjects → evidence recorded in `report.md`.
- [ ] T-08-P4 passes: the Journey step exposes zero override affordances by DOM count and keyboard traversal, states the refusal, and shows no other subject's cycle value → evidence recorded in `report.md`.
- [ ] T-08-S1 passes: `node scripts/selftest.mjs` is green → evidence recorded in `report.md`.

**Test-related DoD items: 10. Test Plan rows: 10. Parity confirmed.**

---

*Educational research context only — not investment advice.*
