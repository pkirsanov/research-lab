# User Validation — 014 Shared Cycle And Seasonality Exchange

**Feature:** `specs/014-shared-cycle-and-seasonality-exchange`

## How To Use This File

Every item below is a **user-visible behaviour** drawn from `spec.md` → `## UI Scenario Matrix` (UI-01 … UI-35).
Items are created **checked `[x]`** by convention. Uncheck an item `[ ]` to report that the behaviour is broken,
missing, or wrong. An unchecked item is a user-reported regression and is **blocking**: it must be investigated and
fixed before new scope work proceeds.

**Current reality.** This feature has executed nothing — no scope is started and no surface exists yet. The checked
state below is the acceptance baseline this feature is committed to deliver, not a claim that it has been delivered.
`report.md` is the record of what has actually been run, and it is empty.

**What to look for.** This feature is refusal-first. Almost every item is about the system **declining** to produce a
value it cannot honestly produce, and saying plainly why. A blank panel, a spinner that never resolves, a zero, an
em dash, a "no data" placeholder, or a neutral-looking value standing in for a refusal is a **failure**, not a
degraded success. If a refusal appears without a named reason, uncheck the item.

## Checklist

### Publishing evidence (Power view)

- [x] UI-01 — Publishing a finding shows the admission outcome `admitted`, and the cycle type, subject scope, search breadth, applied corrections, adjustment posture, as-of vintage, and availability state are echoed back exactly as declared. No regime name and no trend-structure claim appears anywhere on the envelope.
- [x] UI-03 — Submitting a finding whose family has no search breadth and no applied correction is refused, and the refusal names the missing breadth-and-correction record. No envelope appears for that publisher, and no partial or breadth-stripped record is listed.
- [x] UI-04 — Submitting a finding with no subject applicability assertion is refused, and the refusal names the missing subject applicability assertion. No envelope readable for an undeclared subject is created.
- [x] UI-05 — Requesting a decision-time cutoff the inputs cannot serve shows the vintage as `unresolved-at-cutoff` and refuses publication. No approximate, force-publish, or use-earlier-vintage control is offered anywhere on the panel.
- [x] UI-06 — Three findings sharing the same series, mechanism, and hypothesis sweep display as **one** evidence family, with the search breadth accounted once at that family. The panel says one family, not three confirmations.
- [x] UI-07 — Opening the surviving candidate of a hypothesis sweep shows the hypotheses-searched count, the applied Benjamini–Hochberg discovery correction, the applied Holm activation correction, and the held-out gate outcome next to the finding. No breadth-stripped view of the same finding is offered.
- [x] UI-08 — A finding whose availability resolved to `unavailable` is published and listed complete, carrying its subject, type, breadth, corrections, posture, vintage, and provenance. It is not withheld, and no "nothing to publish" state appears.

### Consuming evidence (Simple view)

- [x] UI-02 — Presenting the lab's own subject and a decision-time cutoff shows the publisher's exact cycle type, availability state, and as-of vintage, and one consumption record is written with outcome `consumed`.
- [x] UI-09 — Presenting a subject without declared authority states `refused-authority` with its reason. No phase, stage, or occurrence is rendered, and one consumption record is still written.
- [x] UI-10 — Presenting a cutoff the evidence cannot serve shows `unresolved-at-cutoff` and outcome `refused-vintage`. An earlier vintage that exists in the store is visibly **not** offered and not returned.
- [x] UI-12 — Presenting subject S2 against evidence measured on subject S1 shows `not-applicable` and outcome `refused-applicability`, names both subjects and the reason, and shows nothing derived from S1 for S2.
- [x] UI-13 — Presenting a subject for which the record carries no applicability assertion shows `not-applicable` and states that the decision came from an **absent assertion**, distinguishably from a negative declaration.
- [x] UI-14 — Presenting a subject covered by an explicit applicability declaration shows `applicable` and outcome `consumed`, and both the record and the surface state that the consumption relied on a **declared transfer** rather than native scope.
- [x] UI-15 — Requesting context for a subject whose repetitions fall below the catalog minimum shows `ineligible` end to end. No phase, phase angle, amplitude, or next-turn date appears anywhere on the surface.
- [x] UI-24 — Consuming inputs whose adjustment posture cannot be determined refuses the consumption and names the undeterminable posture. The ledger shows no defaulted posture.

### Type invariance (Simple view)

- [x] UI-17 — Opening a `lifecycle` record shows the lifecycle stage from that entry's own vocabulary, and a request for period, amplitude, or phase angle is refused. The record names the consumed type as `lifecycle`.
- [x] UI-18 — Opening a `deterministic-calendar` record shows the occurrence as `scheduled`, `observed`, or `expired`, and a request for phase, turn, or direction is refused. The record names the consumed type as `deterministic-calendar`.

### Transport and admission (Power view)

- [x] UI-19 — Submitting an envelope whose declared cycle type differs from the referenced catalog type shows admission outcome `refused`. No conversion or re-typing control is offered, and a later consumer read shows absence and writes `refused-transport`.
- [x] UI-20 — Submitting a typed-declared payload that fails validation on a required field shows outcome `refused` with the specific validation reason. Nothing is stored for that identity, and no untyped compact stand-in is listed.
- [x] UI-21 — Submitting a malformed typed payload for an identity that already holds an admitted record leaves that prior record readable and unchanged, with identical availability state, cycle type, subject scope, adjustment posture, and as-of vintage.
- [x] UI-22 — Submitting a record that declares the legacy compact contract and satisfies it is admitted unchanged, and the persisted record shape is identical to the pre-feature shape. Existing tools that use the compact path keep working.

### Consumption ledger (Power view)

- [x] UI-11 — Attempting to recompute or override the carried corrected significance is refused with a reason. The engine-applied correction stays displayed unchanged, and no consumer-authored corrected significance is stored.
- [x] UI-16 — Attempting to render a negative state as `candidate`, `contextual`, `drifting`, neutral, zero, or last-known is refused every time. The exact declared state is rendered, and no nearby-subject or earlier-vintage substitute is offered.
- [x] UI-23 — Opening the record for a completed consumption shows the consumer, the evidence, the as-of used, the applicability decision, the outcome, and whether the reading was `adjusted` or `unadjusted`.
- [x] UI-25 — Filtering the ledger to refusals shows `refused-applicability`, `refused-authority`, `refused-transport`, and `refused-vintage` each as its own durable row with the same named fields. No counts-only view and no prose summary replaces a row.

### Prospective comparison (Power view)

- [x] UI-26 — Declaring a reading, its identical unadjusted baseline, a window, and a freeze time shows state `frozen` then `accruing`, counts only post-freeze observations, and on a sufficient close shows `reported` labelled as a comparison — not as superiority.
- [x] UI-27 — Submitting a freeze time later than the earliest already-accrued observation refuses the comparison as invalid. No `reported` state is reachable, no superiority claim is produced, and the retrospective freeze is recorded as an audit finding.
- [x] UI-28 — Selecting a baseline that is not the identical unadjusted baseline refuses the freeze and names the adjustment-posture mismatch. No reconcile, rescale, or posture-conversion control is offered.
- [x] UI-29 — Closing a window with fewer observations than declared shows state `insufficient`, labelled insufficient — not partial, not early, not preliminary.

### Market Brief

- [x] UI-30 — Running the Brief across three covered subjects where envelopes exist for all three but only one produced a consumed record states exactly **one** subject as context-present, excludes the other two, and cites the consumption records rather than envelope existence.
- [x] UI-31 — Running the Brief at a decision time later than the only available admitted vintage states the as-of vintage and labels it stale relative to the run. The reading is not presented as current, and no later vintage is silently substituted.
- [x] UI-32 — Running the Brief with no admitted, applicable, as-of-valid envelope for a covered subject states `context-absent` or `context-refused` with its reason. No neutral value, zero, or last-known reading appears, and no nearby subject or earlier vintage is substituted.

### Guided Journey

- [x] UI-33 — On a step refused for applicability, attempting to proceed or to re-scope the evidence to your own subject is refused. The step states plainly that the context is not applicable for that subject, and no cycle value derived from another subject's evidence is shown. No proceed-anyway or override control exists on the step at all.

### Provenance

- [x] UI-34 — Recomputing a claim from its recorded inputs, lineage, engine version, and configuration version alone reproduces the published record exactly, including cycle type and availability state, and the verdict shows `reproducible` citing the recomputation identity.
- [x] UI-35 — Adjudicating a claim that diverges under recomputation while two independent external origins agree with it shows `not-reproducible`, and the verdict is unchanged by that external agreement. No consuming surface offers a "verified" presentation of that claim.

### Cross-cutting behaviour

- [x] The tool is usable on a phone: the Simple cockpit and every refusal state read correctly on a narrow screen without horizontal scrolling or clipped text.
- [x] Every refusal anywhere in the feature is accompanied by a named reason and a line describing what would resolve it. A refusal with no reason is a failure.
- [x] Nothing in this feature ever presents a forecast, an expected return, a probability of profit, a directional signal, an exposure, an allocation, a position size, or a recommendation. Every output is descriptive.
- [x] Every ticker shown anywhere in the feature links to Yahoo Finance and carries a tooltip, and every term, KPI, badge, chart, axis, and value carries a tooltip explaining both what it is and what the current reading means.
- [x] Existing tools are unaffected: the Market Brief, the guided Journeys, and every other lab behave exactly as they did before this feature, and previously stored cache records still load.

---

*Educational research context only — not investment advice.*
