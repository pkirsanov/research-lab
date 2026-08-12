---
applyTo: "**"
---

# Research Lab Product Principles Enforcement

## Authority

[`docs/Product-Principles.md`](../../docs/Product-Principles.md) is the binding source for Research Lab's
product principles. This instruction applies those principles without restating all 25.

The engineering constitution remains independently binding. If the two authorities conflict, stop and route
the conflict for an owner decision. Do not weaken either document silently.

All principles in `docs/Product-Principles.md` are already binding. There is no advisory or pre-ratification
period for this enforcement layer.

## Enforcement Posture

The checks below are blocking review requirements. They are mechanically enforced only where this file names
an existing command. Do not describe a review-only rule as an automated gate.

## Change Admission

Every product change must answer the admission test:

> **Does this improve decision quality, or the measurement of decision quality?**

If neither, reject the change. Tool count, visual polish, sunk effort, and roadmap status do not override the
admission test.

## Spec And Planning Checks

Every new or materially changed feature spec must include a `## Product Principle Alignment` section that:

1. Names each applicable principle by identifier and title.
2. Explains the user-visible behavior that implements each principle.
3. Defines missing, stale, unavailable, and insufficient-sample behavior where relevant.
4. Separates current measured capability from planned work.
5. Records any tension or exception and the owner's decision.

Block a spec or plan when it:

- treats another spec's status as a dependency instead of naming a missing capability;
- exceeds the principle cap of about 40 functional requirements or 5 scopes without a written exception;
- claims delivery from a spec, roadmap item, or source file without execution or artifact evidence;
- adds a capability that fails the admission test;
- rewrites or suppresses a prior outcome to improve a current metric.

Release planning must use the Phase Overview table in
[`docs/INVESTOR_OVERVIEW.md`](../../docs/INVESTOR_OVERVIEW.md). Mark a phase or capability delivered only when
the release feature ledger carries evidence. Keep planned, in-progress, partial, uncertified, and delivered
states distinct.

## UI And Data Checks

Apply P1-P3, P6-P8, and P14-P15 to every user-visible surface:

- Every displayed figure carries a provenance class.
- Missing data renders as unavailable or incomplete, never as zero or a plausible placeholder.
- Confidence describes evidence quality, never win probability.
- Stale or absent narrative is labelled plainly.
- Estimates and proxies remain labelled, and their inputs remain traceable.
- Model-authored text is escaped as data at every rendering sink.
- Simple is the default decision-first view. Power contains the drill-down.
- Every ticker and dynamic value keeps its required contextual explanation.

Block a UI change that hides missing data, opens into an unexplained dense dashboard, duplicates model logic,
or renders model-authored markup.

## Brief And Scoring Checks

Apply P4-P5, P16, and P20-P21 to the Market Action Center, recommendation history, and scorecard:

- Derive brief coverage from `tools.json`. Never maintain a hand-selected tool subset.
- Deep-link to the tool that owns the math. Do not reimplement the metric in the brief.
- Give satisfied and invalidated outcomes equal prominence.
- Withhold rates below the declared minimum sample and show the sample size.
- Require instrument, level, invalidation, and horizon for a scoreable claim.
- Emit `not-evaluable` when the claim cannot be machine-checked. Never drop it from the denominator silently.
- Extend schemas additively and append corrections as new events. Never rewrite history.

Follow [`notes/market-brief.md`](../../notes/market-brief.md) for brief refresh, publication, and narrative rules.

## Tool Registration Checks

Apply P17-P19 and P23 whenever a tool or shared module changes:

- Keep `tools.json`, `index.html`, `rlnav.js`, the tool HTML, and `notes/<tool-id>.md` synchronized.
- Keep every published tool reachable through the registry and navigation.
- Require a production consumer for every shared module. Tests are not consumers.
- Define each metric once and reuse the owning implementation.
- Give every guard an adversarial case that proves the guard can fail.
- Back every numeric budget with a failing test. Never raise a budget to make a check pass.
- Close or withdraw a superseded artifact in the same change that reverses its contract.

Registry and navigation parity are mechanically checked when the canonical selftest runs:

```bash
node scripts/selftest.mjs
```

Do not claim that this command proves every product principle. It checks only the invariants implemented by
the current selftest.

## Access And Public-Artifact Checks

Apply P9-P13 to every tool and data path:

- Preserve useful no-key, no-proxy, no-account operation with honest degradation.
- Preserve UMD browser and Node compatibility and `file://` operation. Do not add a bundler.
- Reuse cached data and append only missing or stale deltas.
- Paint from cache on first load before refreshing the delta.
- Commit tickers only. Never commit position size, cost basis, P&L, or credentials.

## Enforcement Reality

| Requirement | Current Enforcement |
|---|---|
| Registry, navigation, and selected model invariants | Mechanical when `node scripts/selftest.mjs` runs |
| Market Brief payload contract | Mechanical when `node scripts/validate-brief-payload.mjs` runs |
| Product Principle Alignment in specs | Review-enforced; no repository checker is claimed here |
| UI meaning, provenance completeness, and Simple/Power quality | Review plus applicable focused tests; no universal checker is claimed here |
| Release delivery wording and Phase Overview accuracy | Release-owner review against current evidence |
| Admission-test compliance and strategic priority | Owner and product review |

Use the exact build-free commands in [`.specify/memory/agents.md`](../../.specify/memory/agents.md). Do not
invent a project CLI, application build, lint command, or formatter. Do not modify framework-managed files
under `.github/bubbles/`, `.github/agents/bubbles*`, `.github/prompts/bubbles.*`,
`.github/instructions/bubbles-*`, or `.github/skills/bubbles-*` downstream.

## Blocking Patterns

Reject any change that introduces one of these patterns:

- an unprovenanced displayed number;
- missing data rendered as zero, neutral, or inferred;
- confidence presented as a probability of winning;
- misses hidden behind hits or excluded from the visible scorecard;
- an undersampled rate presented without withholding;
- a claim omitted because it cannot be scored;
- rewritten recommendation history;
- duplicated brief math instead of a deep link;
- a published tool absent from the registry or navigation;
- a committed position size, cost basis, P&L value, or credential;
- a delivery claim supported only by planning prose or file existence;
- work that fails the admission test.
