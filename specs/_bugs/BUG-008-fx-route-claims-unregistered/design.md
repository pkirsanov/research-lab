# Design: BUG-008 — Root Cause, Blind Spot, And The Registry-Derived Guard

## 1. Root Cause

Feature 004 split delivery across an intentional two-step boundary:

- **Scope 2** built the route while it was deliberately excluded from the published site. At
  that moment the comment and the placeholder were **accurate**: `resolveShell` really did
  refuse with `E012-REGISTRY`, and the shell really did render an unavailable state.
- **Scope 5** performed the atomic cutover — added the tool to `tools.json`, removed it from
  `site-exclusions.json` — because `scripts/build-pages-site.mjs:43` makes registration and
  exclusion mutually exclusive.

Scope 5's DoD asserted the **runtime** consequence of that cutover:

> "The shared four-view switcher resolves for `fx-regime-relative-value-lab` once registration
> lands: `resolveShell` returns the `ordinary-four-view/v1` view set with no `E012-REGISTRY`
> refusal…"

That assertion was correct and its evidence was real. Nothing, however, asserted that the
**prose describing the pre-cutover state** was retired in the same transaction. The cutover
changed the world; the sentence describing the old world stayed.

This is a *state-transition documentation leak*: text written to be true under a temporary
condition, not re-examined when the condition was deliberately ended.

## 2. Why The Existing Stale-Claim Scan Did Not Catch It

Feature 004's `docs` phase did run a stale-claim scan. Its recorded search set was:

```text
FX confirmation      -> present in the Problem Statement
globalFxConfirm      -> present in the Problem Statement
fxWeight             -> absent
FX-weighted          -> absent
currencyProxy        -> absent
```

Every term in that set is vocabulary the delivery **removed**. The scan asked "does the repo
still mention a thing that no longer exists?" It could not ask "does the repo still assert a
*condition* that has since been inverted?", because the words in the stale sentence
(`registered`, `route`, `shell`) are all words the delivered system legitimately uses.

The blind spot is structural, not an oversight of diligence: a vocabulary scan finds retired
nouns, not falsified propositions. That is precisely why the remediation below is an
executable invariant rather than an added grep term.

## 3. Fix Design

### 3.1 What the fix must not be

- **Not** deleting the comment. It carries the `build-pages-site.mjs` mutual-exclusion fact
  and the no-page-local-mode-strip decision, both still true and both load-bearing for the
  next reader.
- **Not** a grep term appended to a docs-phase checklist. That reproduces the blind spot with
  one more entry and expires the moment the sentence is reworded.
- **Not** asserting `markup.includes('...') === false` for the exact retired sentence. That
  freezes on the day it is written, passes for any paraphrase, and cannot detect the inverse
  failure where the tool is de-registered but the page still claims to be live.

### 3.2 What the fix is

**(a) Correct the two false statements, preserve the true one.**

The comment now states the condition that actually holds — registered in `tools.json`, absent
from `site-exclusions.json`, therefore `resolveShell` returns `ordinary-four-view/v1` and
`rlapp.js` mounts the four views — and retains both the mutual-exclusion mechanism and the
deliberate absence of a page-local mode strip.

The placeholder now describes hydration (`Loading the Simple, Power, Brief, and Journey
views…`), which is the state that is genuinely true in the window it is displayed.

**(b) A registry-derived regression guard.**

`Regression BUG-008` in `tests/fx-regime-relative-value-lab.spec.mjs`:

1. Reads `tools.json` and `site-exclusions.json` and **asserts the preconditions first** —
   the tool is registered, and it is not excluded.
2. Only then asserts the markup carries no contradiction of that proven state.
3. Separately asserts the `#shellMount` inner text does not deny the route's liveness.

### 3.3 Why this is durable

The guard's expectation is *computed from the registry on every run*. Consequences:

| Future change | Guard behavior | Why that is right |
|---|---|---|
| Someone restores an "unregistered" claim | **RED** on the contradiction set | The original defect cannot return |
| Someone paraphrases the claim | **RED** if it matches the semantic patterns | Patterns target the assertion, not one sentence |
| Tool is genuinely de-registered | **RED** on the `registered === true` precondition | The page would then be lying in the *other* direction |
| Tool is re-excluded from the site | **RED** on the `isExcluded === false` precondition | Forces the prose and the registry back into agreement |

A string-frozen assertion delivers only row 1. That asymmetry is the entire argument for
paying the extra cost of reading the registry inside the test.

### 3.4 Verified residual exposure

The guard covers **this** route's self-description. It does not generalize to the other 24
registered tools. That is a deliberate scope boundary, not an oversight — see §4 for the
audit that established no sibling currently carries the same defect, which is what makes a
single-route guard proportionate rather than a gap.

## 4. Sibling Audit — What Was Checked And Ruled Out

Before scoping this to one route, the whole FX surface and the registry were audited. Two
plausible larger defects were **investigated and rejected on evidence**, which is why this
packet is small:

| Hypothesis | Verdict | Evidence |
|---|---|---|
| FX lacks the mandatory Simple/Power paradigm (no `#modeSeg`) | **Rejected — by design** | `specs/004…/scopes.md:1057` states the route ships the shared-shell anchor with "deliberately NO page-local mode strip"; the shared four-view switcher is the view control |
| FX never loads `rlexperience.js`, so the shell cannot mount | **Rejected — dynamic injection** | `rlapp.js:299` `ensureSharedScript("rlexperience-shared-js", "rlexperience.js", …)`; only 3 tools carry a static tag because the rest are injected |
| FX omits contextual tooltips (0 static `title=`/`data-tip=`) | **Rejected — shared auto-decoration** | `rlg.js` auto-scans and re-scans via `MutationObserver`; reference tools `sector-research-lab.html` and `global-rotation-lab.html` carry **0** explicit sets, FX carries 2 |
| FX uses the global `isFinite` null-safety antipattern | **Rejected — clean** | Zero non-`Number.isFinite` matches in the page and `rlfx.js` |
| FX omits `toolReads` brief publication | **Rejected — present** | Page publishes a tool read; only 2 tools implement the publisher and FX is one |

Nine of ten audited dimensions were at or above repository norm. Reporting the rejected
hypotheses matters: each would have justified a far larger packet, and each was disproved by
reading the source rather than by assumption.

## 5. Named Permanent Regression Guard

**Name:** `Regression BUG-008: a registered route never claims it is unregistered`
**Location:** `tests/fx-regime-relative-value-lab.spec.mjs`
**Non-vacuity:** proven differentially — RED at the defect (3 of 4 contradiction patterns
matched), GREEN after the fix, same assertions, same run command.

## Capability Proportionality

### Single-Implementation Justification

One test, one markup block. No new module or shared helper is introduced because the
invariant has exactly one call site and §4 establishes no sibling needs it today. Building a
generalized route-self-description checker now would be an abstraction over a single instance
and would have to guess at the shape of a second case that does not exist.
