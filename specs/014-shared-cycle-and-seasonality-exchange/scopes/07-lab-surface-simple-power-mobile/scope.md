# Scope 7: Lab surface — Simple, Power, mobile

**Status:** Not Started
**Depends On:** Scope 1 (`01-foundation-contracts-and-publication`), Scope 3 (`03-applicability-and-consumer-authority`), Scope 4 (`04-consumption-ledger-and-type-dispatch`), Scope 5 (`05-prospective-baseline-comparison`), Scope 6 (`06-provenance-by-recomputation`)
**Tags:** `overlay:true`

**Primary Outcome:**
`shared-cycle-exchange-lab.html` exists and renders every state the foundation produces — S1 Simple as the default
decision-first cockpit, S2 Power as the seven-panel drill-in, S5 as the mobile variant — bound to `rlcycx.js` through
EP-4 with the shared-shell load order `rldata.js` → `rlapp.js` → `rlnav.js` plus `rlg.js`, `rlchart.js`, and
`rlticker.js`. The surface is the first place a negative state can be rendered, and it renders each one as the exact
declared availability state with a named reason and a resolve line: `ineligible` stays `ineligible`, `unavailable` stays
`unavailable`, `not-applicable` stays `not-applicable`, and no attempt to present any of them as `candidate`,
`contextual`, `drifting`, neutral, zero, or last-known succeeds. No substitute nearby subject and no earlier vintage is
offered to obtain a positive reading. No control anywhere in the page yields a refused value — not present, not merely
`disabled`, not hidden-but-reachable, not reachable by keyboard focus or DOM query. `scripts/validate-shared-cycle-exchange.mjs`
is created and registered in `scripts/selftest.mjs`, and the tool ships **unregistered** — reachable by direct URL,
absent from every counted registry — so `scripts/validate-tool-experience.mjs` stays green throughout and Scope 11 owns
registration exclusively.

---

## Business Scenarios owned

### BS-014-016: A consumer may not upgrade a negative state into a value

```gherkin
Scenario: ineligible, unavailable, and not-applicable are refused as inputs to a positive reading
  Given admitted envelopes whose availability states are ineligible, unavailable, and not-applicable respectively
  And A3 holds declared consumer authority and presents a covered subject for each
  When A3 attempts to render any of those states as candidate, contextual, drifting, neutral, zero, or last-known
  Then each attempt is refused
  And each state is rendered as the exact declared availability state
  And no substitute nearby subject and no earlier vintage is used to obtain a positive reading
```

---

## Implementation Plan

1. **Create `shared-cycle-exchange-lab.html`** with the shared-shell load order `rldata.js` → `rlapp.js` → `rlnav.js`,
   plus `rlg.js`, `rlchart.js`, and `rlticker.js`, and with `rlcycx.js` loaded ahead of the inline model so the page's
   synchronous binding resolves. The page carries a `#modeSeg` segmented control writing `body.power`, persisted in
   `localStorage`, with S1 Simple as the default view.
2. **Bind EP-4 in `shared-cycle-exchange-lab.html`** so the page computes once from state and both views read the same
   result. Simple exposes the decision-first verdict plus steerable parameter levers that recompute through one `render()`
   call with no refetch; Power exposes the seven panels; Power-only panels carry `class="panel pw"` and every `<canvas>`
   draw is guarded by the active mode and redrawn on resize.
3. **Implement the negative-state renderer in `shared-cycle-exchange-lab.html`** so `ineligible`, `unavailable`, and
   `not-applicable` each render as the exact declared availability state with a named reason and a resolve line. The
   renderer has no branch that maps a negative state to `candidate`, `contextual`, `drifting`, a neutral value, a zero, or
   a last-known reading, and it offers no nearby-subject and no earlier-vintage substitution affordance.
4. **Implement the upgrade refusal in `rlcycx.js`** so every attempted presentation of a negative state as a positive
   reading refuses with `cyc-negative-state-upgrade-attempted` naming the attempted presentation, and so a nearby-subject
   or earlier-vintage substitution attempt refuses on the same code. The refusal is terminal: a repeat attempt with the
   same inputs refuses identically and never yields a value.
5. **Implement the override lock in `rlcycx.js` and `shared-cycle-exchange-lab.html`** so `cyc-override-attempted` fires
   on any programmatic path that would yield the refused value, and so the page contains **no** control that would do so —
   the affordance is absent from the DOM rather than rendered `disabled` or `hidden`.
6. **Render every foundation state in `shared-cycle-exchange-lab.html`**, including the `insufficient` comparison state and
   the refused comparison states from Scope 5 and the `reproducible` / `not-reproducible` provenance verdicts from
   Scope 6, each with a named reason and a resolve line and never as a spinner, a blank region, an em dash, or a zero. A
   `not-reproducible` claim exposes no verified presentation anywhere on the page.
7. **Add auto-hydrate and cache-first paint to `shared-cycle-exchange-lab.html`** so the page paints a meaningful first
   view on load from the `rlData` cache and then fetches only the missing or stale delta, with every numeric guarded by
   `Number.isFinite` so a half-empty first paint renders an em dash in a value cell rather than throwing and freezing the
   page.
8. **Add universal tooltips and ticker links to `shared-cycle-exchange-lab.html`** — `RLTKR.tag` on every ticker including
   chart labels and legends, a contextual `title` / `data-tip` on every dynamic value explaining what the current reading
   means, and an `RLCHART.attach` hit-test closure registered at the end of every draw function.
9. **Create `scripts/validate-shared-cycle-exchange.mjs`** on the `scripts/validate-trend-dynamics-cycle.mjs` precedent,
   asserting the shared-shell load order, the presence of a Simple and a Power view, the contextual-tooltip coverage on
   dynamic values, the canvas hit-test registration, and the absence of any control that would yield a refused value.
10. **Create `notes/shared-cycle-exchange.md`** as the per-tool handoff document required by the house rule.
11. **Modify `scripts/selftest.mjs`** to register `scripts/validate-shared-cycle-exchange.mjs`, changing nothing else in
    that file and touching no other feature's registration.
12. **Create `tests/shared-cycle-exchange.spec.mjs`** and **extend `tests/shared-cycle-exchange.functional.mjs`** and
    `tests/fixtures/shared-cycle-exchange/**` with the negative-state, substitution-attempt, and override fixtures.

---

### Test Plan

Every negative row asserts the exact `refusalCode` string plus its companion field — the attempted presentation for
`cyc-negative-state-upgrade-attempted` and the attempted control path for `cyc-override-attempted`. No row asserts only
that "a refusal occurred". No Playwright row contains an early-exit bailout: every required assertion is a direct
`expect(locator).toBeVisible()` or a direct count assertion with no escape path, and no row returns early on a URL check
or on a missing element.

| Test Type | ID | Category | Scenarios | File/Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|---|
| Functional | T-07-F1 | `functional` | BS-014-016 | `tests/shared-cycle-exchange.functional.mjs` | Against an `ineligible` record, six attempted presentations — `candidate`, `contextual`, `drifting`, neutral, zero, last-known — each refuse with `cyc-negative-state-upgrade-attempted` naming the attempted presentation, and the same six repeat against `unavailable` and `not-applicable`. Every fixture is otherwise fully consumable, so an implementation refusing on malformedness rather than on the upgrade passes none of the eighteen cases. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-07-F2 | `functional` | BS-014-016 | `tests/shared-cycle-exchange.functional.mjs` | A nearby-subject substitution attempt and an earlier-vintage substitution attempt each refuse with `cyc-negative-state-upgrade-attempted`, with the substitute genuinely present and genuinely able to yield a positive reading. Without the substitute present the row would prove nothing; its presence is what makes it adversarial. The row also asserts the refusal is terminal by repeating it and getting the identical result, and that no prior admitted record changed. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| E2E UI | T-07-P1 | `e2e-ui` | BS-014-016 | `tests/shared-cycle-exchange.spec.mjs` | The Power evidence detail renders the exact declared availability state for each of `ineligible`, `unavailable`, and `not-applicable` via direct `expect(locator).toBeVisible()` on the state text, and the row asserts the reading region contains none of `candidate`, `contextual`, `drifting`, `0`, or `—` for those subjects. | `npx --no-install playwright test tests/shared-cycle-exchange.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| E2E UI | T-07-P2 | `e2e-ui` | BS-014-016 | `tests/shared-cycle-exchange.spec.mjs` | `cyc-override-attempted`: the row asserts a DOM-wide query for any upgrade, override, proceed-anyway, or re-scope affordance returns a count of **zero**, that keyboard-focus traversal of the page reaches none, and that no such element exists in a `hidden` or `disabled` form. Asserting a control is `disabled` would pass a hidden-but-clickable implementation, so the row asserts absence rather than state. | `npx --no-install playwright test tests/shared-cycle-exchange.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| E2E UI | T-07-P3 | `e2e-ui` | BS-014-016 | `tests/shared-cycle-exchange.spec.mjs` | Every negative and refusal state the foundation produces renders with a named reason and a resolve line — including the `insufficient` and refused comparison states from Scope 5 and the `not-reproducible` provenance verdict from Scope 6 — and the row asserts none renders as a spinner, a blank region, an em dash, or a zero, and that no verified presentation of a `not-reproducible` claim exists anywhere on the page. | `npx --no-install playwright test tests/shared-cycle-exchange.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| E2E UI | T-07-P4 | `e2e-ui` | BS-014-016 | `tests/shared-cycle-exchange.spec.mjs` | S1 Simple and S5 mobile render the same declared availability state as S2 Power for the same fixture, so no viewport and no view upgrades a negative state into a value; the row also drives each Simple parameter lever and asserts the verdict recomputes through one render with no network fetch and never resolves to a refused value presented as a reading. | `npx --no-install playwright test tests/shared-cycle-exchange.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| E2E UI | T-07-P5 | `e2e-ui` | BS-014-016 | `tests/shared-cycle-exchange.spec.mjs` | The page auto-hydrates on load: with a deliberately half-empty `rlData` cache the first paint completes, the value cells for absent data render an em dash rather than throwing, and the page is not stuck on a loading shell — the row asserts zero page errors were emitted during first paint, which a `Number.isFinite` omission would fail. | `npx --no-install playwright test tests/shared-cycle-exchange.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| Tool validator | T-07-V1 | tool validator | BS-014-016 | `scripts/validate-shared-cycle-exchange.mjs` | The validator is green against the lab page: shared-shell load order correct, Simple and Power views both present, every dynamic value carrying a contextual tooltip, every canvas registering an `RLCHART.attach` hit-test, and no control present that would yield a refused value. | `node scripts/validate-shared-cycle-exchange.mjs` | No |
| Project check | T-07-S1 | project check | — | `scripts/selftest.mjs` (modified — registration only) | The repo self-test is green with `validate-shared-cycle-exchange.mjs` registered, proving the registration is correct and that no other feature's registration changed. | `node scripts/selftest.mjs` | No |

**Test Plan rows: 9.**

---

### Definition of Done

#### Core items

- [ ] `shared-cycle-exchange-lab.html` exists with the shared-shell load order `rldata.js` → `rlapp.js` → `rlnav.js` plus `rlg.js`, `rlchart.js`, `rlticker.js`, and with `rlcycx.js` loaded ahead of the inline model.
- [ ] S1 Simple is the default view, S2 Power carries the seven panels, S5 is the mobile variant, and one compute feeds all three with Power-only panels marked `class="panel pw"`.
- [ ] Every canvas draw is guarded by the active mode, redrawn on resize, and registers an `RLCHART.attach` hit-test closure.
- [ ] Every ticker is `RLTKR.tag`-linked including chart labels and legends, and every dynamic value carries a contextual tooltip explaining what the current reading means.
- [ ] The page auto-hydrates cache-first on load, fetches only the missing or stale delta, and guards every numeric with `Number.isFinite` so a half-empty first paint renders an em dash instead of throwing.
- [ ] `ineligible`, `unavailable`, and `not-applicable` each render as the exact declared availability state with a named reason and a resolve line, and the renderer has no branch mapping any of them to a positive reading.
- [ ] No nearby-subject and no earlier-vintage substitution affordance exists anywhere on the page.
- [ ] No control exists that would yield a refused value — absent from the DOM rather than `disabled` or `hidden`.
- [ ] Every negative and refusal state the foundation produces is rendered, and a `not-reproducible` claim exposes no verified presentation anywhere on the page.
- [ ] `scripts/validate-shared-cycle-exchange.mjs` exists and is registered in `scripts/selftest.mjs`, with no other feature's registration changed.
- [ ] `notes/shared-cycle-exchange.md` exists as the per-tool handoff document.
- [ ] The tool ships **unregistered**: it appears in none of `tools.json`, the `index.html` `TOOLS` array, the `rlnav.js` `TOOLS` array, `simple-models.json`, or `journeys.json`; it is reachable by direct URL; and `node scripts/validate-tool-experience.mjs` is green against the unchanged counts. Registration is Scope 11's exclusive responsibility.
- [ ] Both refusal codes owned by this scope per `_index.md` — `cyc-negative-state-upgrade-attempted` and `cyc-override-attempted` — have named negative tests asserting the exact code string plus its companion field.
- [ ] Every file this scope touches — `shared-cycle-exchange-lab.html`, `scripts/validate-shared-cycle-exchange.mjs`, `notes/shared-cycle-exchange.md`, `tests/shared-cycle-exchange.spec.mjs`, `tests/shared-cycle-exchange.functional.mjs`, `tests/fixtures/shared-cycle-exchange/**`, `rlcycx.js`, and `scripts/selftest.mjs` — is listed in `design.md` → `### Files 014 MAY CREATE` or `### Files 014 MAY MODIFY`, and no Protected Surface is opened as a change target.
- [ ] **Feature 013 interaction:** the only shared file this scope opens is `scripts/selftest.mjs`, and the change there is a single registration line for 014's own validator. Feature 013's registration line is left byte-identical, none of the five counted registries is touched, and `rldata.js`, `rlbrief.js`, `rljourney.js`, and `scripts/brief-refresh.mjs` are not reopened.

#### Test items

- [ ] T-07-F1 passes: eighteen upgrade attempts across `ineligible`, `unavailable`, and `not-applicable` each refuse with `cyc-negative-state-upgrade-attempted` naming the attempted presentation → evidence recorded in `report.md`.
- [ ] T-07-F2 passes: nearby-subject and earlier-vintage substitution attempts refuse with a genuinely available substitute present, the refusal is terminal, and no prior admitted record changed → evidence recorded in `report.md`.
- [ ] T-07-P1 passes: Power renders the exact declared availability state for all three negative states with no positive-reading token present → evidence recorded in `report.md`.
- [ ] T-07-P2 passes: `cyc-override-attempted` holds by DOM absence — zero matching elements, none keyboard-reachable, none hidden or disabled-but-present → evidence recorded in `report.md`.
- [ ] T-07-P3 passes: every negative and refusal state renders with a named reason and a resolve line, and no `not-reproducible` claim has a verified presentation → evidence recorded in `report.md`.
- [ ] T-07-P4 passes: Simple and mobile render the same declared state as Power and every lever recomputes without a fetch and without yielding a refused value → evidence recorded in `report.md`.
- [ ] T-07-P5 passes: first paint completes against a half-empty cache with zero page errors and em-dash value cells → evidence recorded in `report.md`.
- [ ] T-07-V1 passes: `node scripts/validate-shared-cycle-exchange.mjs` is green → evidence recorded in `report.md`.
- [ ] T-07-S1 passes: `node scripts/selftest.mjs` is green with the new validator registered → evidence recorded in `report.md`.

**Test-related DoD items: 9. Test Plan rows: 9. Parity confirmed.**

---

*Educational research context only — not investment advice.*
