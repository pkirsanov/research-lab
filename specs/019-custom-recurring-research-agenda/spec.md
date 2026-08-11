# Feature 019 — Custom Recurring Research Agenda

**Status:** planning
**Host surface:** a committed agenda registry consumed by the existing headless
brief pipeline, plus a research read that is both filed under a registered tool
id and rendered on the brief the reader actually opens. **Not** a browser-local
list. **Not** a private portfolio queue.
**Educational only — not investment advice.**

---

## Problem Statement

The operator ran three separate deep-research sessions in chat. Only one of them
survived.

1. **Defense and weapons manufacturers.** Ranked public manufacturers by
   production-expansion visibility and by three-, six- and twelve-month
   **earnings acceleration versus consensus** — not by current numbers. The
   question was explicitly about the second derivative of the estimate revision,
   which is exactly the kind of question that has to be re-asked as new prints
   land. Nothing was persisted. The work is gone.
2. **U.S.–Iran oil and the Strait of Hormuz.** Intervention chronology, actor
   reaction functions, scenario probabilities, and confirmation rules. This one
   *was* written down, at `notes/us-iran-oil-market-intervention-patterns.md`.
   It is the only one that can be re-read today — and even it does not update
   itself. It is a snapshot of one session, not a standing topic.
3. **Food, grains and fertilizer.** Three- to twelve-month outlook, expected
   move ranges, catalysts, and invalidation levels. Nothing was persisted. Gone.

Two of the three evaporated because the product has no place to put them. The
brief refreshes on a schedule and re-derives its market reads every window, but
the *questions the operator actually cares about* live in chat transcripts,
which the pipeline cannot read and the reader cannot revisit.

The gap is not a research gap. Every mechanical part needed to close it is
already committed:

- **The pipeline already re-runs on a schedule.**
  `scripts/brief-refresh-scheduled.sh` clones `origin/main` into a disposable
  checkout (`mktemp -d`, `git clone --single-branch`) and runs
  `scripts/brief-refresh-and-push.sh` inside it. **Consequence, and it is
  binding: browser `localStorage` can never drive unattended research.** A
  disposable clone knows only what is committed. A topic registry that is not a
  committed repo file is a registry the scheduler cannot see.
- **The pipeline already carries agent-maintained standing themes.**
  `market-brief.config.json` holds `globalBackdrop` (8 entries) and
  `macroEvents` (8 entries) today. Standing narrative material in a committed
  config file is an established pattern here, not a new idea.
- **The pipeline already runs web-capable research lanes.**
  `scripts/brief-narrative-parallel.mjs` runs four write-disjoint Copilot lanes
  — `core`, `signals`, `groups`, `coverage`. Only `core` and `signals` declare
  `web: true`, and their fetches are restricted to the 15-host `webAllow`
  allowlist. Each lane may write only `.brief-work/<lane>.json` and owns an
  exact set of top-level payload keys.
- **The pipeline already has a slot for genuinely new patterns.**
  `payload.experimental[]` is owned by the non-web `coverage` lane, and
  `market-brief.experimental.json` currently carries an empty `items` array
  under `market-brief-experimental/v1`.

What is missing is the **user-owned question**. `globalBackdrop` and
`macroEvents` are agent-maintained; nothing in the repository lets the operator
say *"these are my standing topics, review each one every generation, tell me
what changed, and let me add and retire them over time."*

And there is a second, sharper failure the first three sessions demonstrated:
each of those sessions produced things the operator should have *done* —
positions to check, levels to watch, claims to verify. Those action items had
nowhere to go. A dossier that produces an action item and keeps it inside the
dossier has produced a document, not a decision. **Routing that material into
the action list, the attention tier, and the red-alert pipeline is Feature 020.**
This spec ends at the honest dossier; 020 carries it to the reader.

---

## Outcome Contract

**Intent.** The operator declares a small set of standing research topics in a
committed registry. On every brief generation the pipeline reviews each due
topic, produces or refreshes a dated dossier for it, and records honestly what
happened — updated, unchanged, stale, or unavailable. Topics are added, paused
and retired over time without rewriting history, and the agent may sharpen a
topic's scope only inside the question the operator declared.

**Success signal.** After the registry carries the three real topics — defense
production and earnings acceleration, U.S.–Iran oil and Hormuz, and food, grains
and fertilizer — a scheduled unattended generation running in a disposable clone
produces, for each due topic, either a dossier whose findings carry a date, a
source and a stated confidence, or an explicit named outcome saying why it could
not. The operator can re-read the prior dossier for any topic and see exactly
what changed since, because the previous version is still on disk. The three
sessions become three durable, self-refreshing artifacts rather than one note
and two lost conversations.

**Hard constraints.**

- **Committed registry only.** The agenda is a committed repo file. No
  `localStorage`, no browser state, no uncommitted local file, because
  `scripts/brief-refresh-scheduled.sh` runs in a disposable clone that cannot
  see any of those.
- **One owning module.** The topic contract — validation, lifecycle states, and
  the due/stale decision — is defined once, in one module, and every consumer
  reads it from there. *(P19)*
- **Public scope only, tickers only, forever.** A topic may name public market
  objects and public tickers. No position, no size, no cost basis, no P&L, ever.
  *(P13)*
- **Absence is a first-class outcome.** A topic the pipeline could not research
  this generation publishes a named outcome with a reason. Never a stale dossier
  presented as current, never a fabricated finding, never a plausible
  placeholder. *(P2)*
- **Append-only history.** A refreshed dossier is a new dated version that
  references its predecessor. A correction is a new entry, not an edit. *(P21)*
- **User-owned definitions are never silently rewritten.** The agent may narrow,
  sharpen or add sub-questions inside the operator's declared question. It may
  not replace the question, retire the topic, or widen it beyond the declared
  boundary without the change being visible in the registry diff.
- **Works with no key and no server.** Research uses the existing lane
  allowlist. No new credential, no new licensed endpoint. *(P9)*
- **The read reaches the brief.** A research surface whose output does not reach
  the brief fails the admission-test corollary and does not ship. Registering
  the tool and filing the read into the payload's tool-read channel is necessary
  but **not sufficient**: the brief's evidence drawer renders the *snapshot*
  tool reads, and the brief page artifact carries no tool-read key at all, so a
  read published only into the payload is invisible to the reader. Reaching the
  brief means rendering on a brief surface, and this spec owns both halves.
  *(§1)*

**Failure condition.** The feature has failed, even with every test green, if
any of these is true: the registry lives anywhere the disposable clone cannot
read; a topic that could not be researched publishes a dossier that looks
current; a prior dossier version is overwritten rather than superseded; the
agent rewrites the operator's declared question without that change being
visible; a topic's dossier carries a position, size or P&L; or a dossier is
produced that never reaches the brief.

---

## Goals

1. Give the operator a committed, user-owned registry of standing research
   topics that the unattended scheduler can actually read.
2. Review every due topic on every brief generation, under an explicit due /
   stale / material-change policy rather than "review everything every time".
3. Produce a dated dossier per topic whose findings carry date, source and
   stated confidence.
4. Record the honest per-topic outcome — `updated`, `unchanged`, `stale`,
   `unavailable` — so the reader can tell research from silence.
5. Keep history append-only so a topic's trajectory is legible over months.
6. Let the agent sharpen a topic's scope inside the operator's declared
   question, visibly and reversibly.

## Non-Goals

1. **No routing of findings into actions, attention or alerts.** That is
   Feature 020 and is deliberately a separate spec. *(P25)*
2. **No private portfolio input.** `specs/008-portfolio-survival-and-brief-lab`
   owns a **private**, portfolio-derived research queue whose publication is
   withheld through `site-exclusions.json`. This agenda is **public** and
   **topic-driven**, and must not read holdings. The two must not merge.
3. **No new data source or credential.** Research is bounded by the existing
   `webAllow` allowlist in `scripts/brief-narrative-parallel.mjs`.
4. **No new top-level brief view.** The research read reaches the brief through
   the existing tool-read channel plus one additive key on the existing brief
   page artifact, rendered by a section of the brief the reader already opens.
   No new tier, no new view, no second feed.
5. **No replacement of `globalBackdrop` or `macroEvents`.** Those stay
   agent-maintained. The agenda is the user-owned surface beside them.
6. **No build step and no ES modules in the browser.** *(P10)*
7. **No claim that a topic's findings are scoreable calls.** Scoreability is
   Feature 020's problem, and its honest answer is partly negative — see
   *What is not possible today*.

## Actors

| Actor | Role in this feature |
| --- | --- |
| Operator | Declares, edits, pauses and retires topics; reads dossiers; owns the question |
| Scheduler | `scripts/brief-refresh-scheduled.sh`, running unattended in a disposable clone |
| Research worker | The web-capable lane that researches a due topic under the allowlist |
| Publication gate | `scripts/validate-brief-payload.mjs`, which refuses a malformed publish |
| Reader | Anyone reading the published brief, including the operator later |

## Domain Vocabulary

| Term | Meaning |
| --- | --- |
| **Topic** | A user-declared standing research subject with an explicit question, a scope boundary and a review cadence |
| **Agenda registry** | The committed file holding every topic and its lifecycle state |
| **Declared question** | The operator's own words for what the topic must answer; the boundary the agent may sharpen inside but not replace |
| **Scope boundary** | The declared limits of a topic — subjects, geographies, instruments, horizons — outside which a finding does not belong |
| **Review cadence** | How often a topic is due for review, expressed in generations or elapsed time |
| **Due** | A topic whose cadence has elapsed, or which a declared material-change trigger has re-armed |
| **Dossier** | The dated research artifact for one topic in one review |
| **Finding** | One dated, sourced, confidence-stated statement inside a dossier |
| **Outcome state** | The honest per-topic result of a review: `updated`, `unchanged`, `stale`, `unavailable` |
| **Refinement** | An agent-proposed narrowing or sub-question inside the declared question |

---

## Business Scenarios

Each scenario is independently testable and maps one-to-one onto a stable
`SCN-019-NNN` identifier recorded in `scenario-manifest.json`.

### Cluster 1 — The registry is committed and readable by the scheduler

#### BS-019-001: The unattended scheduler can read the agenda

```gherkin
Scenario: A disposable clone sees every declared topic
  Given the agenda registry is a committed repository file
  And the scheduler has cloned origin/main into a disposable checkout
  When the generation reads the agenda
  Then it sees every topic the operator declared on the branch
  And it reads no browser state and no uncommitted local file
```

#### BS-019-002: A registry that is not committed is refused, not defaulted

```gherkin
Scenario: An absent agenda is a named absence
  Given no agenda registry exists in the checkout
  When the generation reads the agenda
  Then it records a named absence with a reason
  And it does not synthesise a default topic set
  And the rest of the brief still generates
```

#### BS-019-003: A malformed topic is refused by name and does not sink the agenda

```gherkin
Scenario: One invalid topic does not disable the others
  Given the agenda declares three topics and one is missing its declared question
  When the agenda is validated
  Then the invalid topic is refused with a named reason
  And the remaining two topics are still reviewed
```

### Cluster 2 — Lifecycle: add, pause, retire, never rewrite

#### BS-019-004: The operator adds a topic and it is reviewed on the next generation

```gherkin
Scenario: A newly declared topic enters the review cycle
  Given the operator commits a new topic with a declared question and a cadence
  When the next generation runs
  Then the topic is treated as due because it has never been reviewed
  And a first dossier is produced or a named outcome is recorded
```

#### BS-019-005: A paused topic is skipped without being deleted

```gherkin
Scenario: Pausing suspends review and preserves history
  Given a topic whose lifecycle state is paused
  When the generation reviews the agenda
  Then the topic is not researched
  And its existing dossier history remains readable
  And the published record states that it is paused rather than unavailable
```

#### BS-019-006: A retired topic stops being reviewed and its history survives

```gherkin
Scenario: Retirement is append-only
  Given the operator retires a topic
  When the generation runs
  Then the topic is not researched
  And no prior dossier version is deleted or rewritten
  And the retirement is recorded as a new lifecycle event referencing the topic
```

#### BS-019-007: The three real sessions become three topics

```gherkin
Scenario: The operator's actual research history is expressible
  Given the operator declares a defense production and earnings-acceleration topic
  And a U.S.-Iran oil and Strait of Hormuz topic
  And a food, grains and fertilizer topic
  When the agenda is validated
  Then all three are accepted with their own declared questions, scope boundaries and cadences
```

### Cluster 3 — Per-generation review policy

#### BS-019-008: A topic inside its cadence is not re-researched

```gherkin
Scenario: Cadence prevents pointless work
  Given a topic reviewed one generation ago with a weekly cadence
  And no material-change trigger has fired
  When the generation reviews the agenda
  Then the topic is not due
  And its most recent dossier remains the current one
  And the published outcome is unchanged rather than updated
```

#### BS-019-009: An elapsed cadence makes a topic due

```gherkin
Scenario: Time makes a topic due
  Given a topic whose declared cadence has elapsed since its last review
  When the generation reviews the agenda
  Then the topic is due
  And it is queued for research this generation
```

#### BS-019-010: A declared material-change trigger re-arms a topic early

```gherkin
Scenario: A material change overrides the cadence
  Given a topic declaring a material-change trigger
  And the trigger's condition is observable in this generation's committed evidence
  When the generation reviews the agenda
  Then the topic is due even though its cadence has not elapsed
  And the published record names the trigger that made it due
```

#### BS-019-011: The review budget is bounded and the overflow is named

```gherkin
Scenario: More due topics than the budget allows
  Given more topics are due than the declared per-generation review budget
  When the generation selects topics to research
  Then it researches up to the budget in a declared deterministic order
  And every deferred topic is published with a named deferred outcome and its reason
  And no deferred topic is silently dropped
```

### Cluster 4 — The dossier and honest outcome states

#### BS-019-012: A researched topic produces a dated, sourced dossier

```gherkin
Scenario: A dossier carries provenance
  Given a due topic researched successfully this generation
  When the dossier is written
  Then every finding carries an observation date, a source, and a stated confidence
  And the dossier carries the generation instant and the topic identifier
  And the outcome state is updated
```

#### BS-019-013: Research that found nothing new is unchanged, not fabricated

```gherkin
Scenario: No new evidence is a real answer
  Given a due topic whose research surfaced no new evidence since its last dossier
  When the review completes
  Then the outcome state is unchanged
  And no new finding is invented to justify the review
  And the prior dossier remains the current one
```

#### BS-019-014: A topic whose evidence is too old publishes stale

```gherkin
Scenario: Old evidence is labelled, never presented as current
  Given a due topic whose newest available evidence predates its declared freshness window
  When the review completes
  Then the outcome state is stale
  And the published record names the age of the newest evidence
  And the findings are not presented as a current read
```

#### BS-019-015: A topic the worker could not research publishes unavailable

```gherkin
Scenario: A failed lane is a named absence
  Given a due topic whose research lane failed or returned nothing usable
  When the review completes
  Then the outcome state is unavailable with a named reason
  And no partial, inferred or placeholder finding is published for it
  And the remaining topics are unaffected
```

#### BS-019-016: A refreshed dossier supersedes rather than overwrites

```gherkin
Scenario: History is append-only
  Given a topic with an existing dossier
  When a new review produces an updated dossier
  Then the new version references the version it supersedes
  And the superseded version is still readable
  And no prior finding is edited in place
```

### Cluster 5 — Bounded refinement, public safety, and reaching the brief

#### BS-019-017: The agent may sharpen a question inside its boundary

```gherkin
Scenario: A refinement narrows, it does not replace
  Given a topic whose declared question admits a narrower sub-question the evidence now supports
  When the agent proposes a refinement
  Then the refinement is recorded as an addition inside the declared question
  And the operator's declared question text is unchanged
  And the refinement is attributed to the agent and dated
```

#### BS-019-018: The agent may not widen or replace the declared question

```gherkin
Scenario: A refinement outside the boundary is refused
  Given a proposed refinement whose subject falls outside the topic's declared scope boundary
  When the refinement is validated
  Then it is refused with a named reason
  And the topic's declared question and scope boundary are unchanged
```

#### BS-019-019: A dossier never carries private portfolio state

```gherkin
Scenario: Public scope only
  Given any dossier produced by this feature
  When it is inspected
  Then it contains no position, no size, no cost basis and no profit or loss figure
  And every subject it names is a public market object or a public ticker
```

#### BS-019-020: The research read reaches the brief

```gherkin
Scenario: A read that does not reach the brief does not ship
  Given a generation in which at least one topic was reviewed
  When the published payload and the brief page artifact are inspected
  Then the payload carries a research read for the agenda under its registered tool id, with each topic's outcome state
  And the brief page artifact carries the agenda material the reader-facing section renders
  And the read is visible on a brief surface the reader opens, rather than only present in the payload or confined to a dossier file
```

---

## Requirements

Thirty-eight functional requirements across five intended scopes, inside the
P25 cap of roughly forty requirements and five scopes.

### Agenda registry contract

- **FR-019-001** The agenda MUST be a committed repository file readable by a
  Node run with no network and no browser.
- **FR-019-002** The agenda MUST NOT be sourced from `localStorage`, session
  storage, an uncommitted local file, or any state absent from a fresh
  `git clone --single-branch` of the publication branch.
- **FR-019-003** The agenda MUST carry a versioned contract identifier following
  the `contractVersion` precedent already used by
  `market-brief.experimental.json` (`market-brief-experimental/v1`).
- **FR-019-004** Each topic MUST carry a stable identifier that never changes
  once published, so history can be joined across generations.
- **FR-019-005** Each topic MUST carry the operator's declared question in the
  operator's own words.
- **FR-019-006** Each topic MUST carry an explicit scope boundary naming the
  subjects, geographies, instruments or horizons the topic covers.
- **FR-019-007** Each topic MUST carry a review cadence and a freshness window,
  both explicit; neither may be inferred from a default.
- **FR-019-008** Each topic MUST carry a lifecycle state from a closed
  vocabulary of `active`, `paused` and `retired`.
- **FR-019-009** The topic contract — its validation, its lifecycle vocabulary,
  and the due decision — MUST be defined in exactly one module, and every
  consumer MUST read it from that module. *(P19)*

### Lifecycle

- **FR-019-010** Adding a topic MUST require nothing but a committed registry
  edit; no code change and no schema migration.
- **FR-019-011** A topic that has never been reviewed MUST be treated as due on
  the next generation.
- **FR-019-012** A `paused` topic MUST NOT be researched, MUST retain its
  history, and MUST publish an explicit paused state distinct from
  `unavailable`.
- **FR-019-013** A `retired` topic MUST NOT be researched and MUST NOT have any
  prior dossier deleted or rewritten.
- **FR-019-014** Every lifecycle change MUST be recorded as a new dated event
  referencing the topic identifier, never as an in-place rewrite of history.
  *(P21)*
- **FR-019-015** An invalid topic MUST be refused by name with its reason, and
  MUST NOT prevent the remaining topics from being reviewed.

### Per-generation review policy

- **FR-019-016** Every generation MUST evaluate every `active` topic for
  dueness; skipping the evaluation is not permitted even when nothing is due.
- **FR-019-017** A topic MUST be due when its declared cadence has elapsed since
  its last recorded review.
- **FR-019-018** A topic MAY declare a material-change trigger expressed against
  evidence already available to the generation; a fired trigger MUST make the
  topic due regardless of cadence.
- **FR-019-019** When a trigger makes a topic due, the published record MUST
  name the trigger.
- **FR-019-020** The number of topics researched in one generation MUST be
  bounded by an explicit declared budget.
- **FR-019-021** When more topics are due than the budget allows, selection MUST
  follow a declared deterministic order, and every deferred topic MUST publish a
  named deferred outcome with its reason. Silent dropping is forbidden.
- **FR-019-022** The review policy MUST NOT require network access to decide
  dueness; dueness is computable from committed state alone.
- **FR-019-023** A topic that is not due MUST NOT be researched, and its most
  recent dossier MUST remain the current one.

### Dossier, outcome states, and append-only history

- **FR-019-024** A researched topic MUST produce a dossier carrying the topic
  identifier, the generation instant, and the outcome state.
- **FR-019-025** Every finding inside a dossier MUST carry an observation date,
  a source, and a stated confidence. A finding missing any of the three MUST NOT
  be published. *(P1)*
- **FR-019-026** The outcome state MUST come from the closed vocabulary
  `updated`, `unchanged`, `stale`, `unavailable`, plus the lifecycle states
  `paused` and `deferred` for topics that were not researched.
- **FR-019-027** `unchanged` MUST be published when research completed and
  surfaced no new evidence; the pipeline MUST NOT invent a finding to justify
  the review.
- **FR-019-028** `stale` MUST be published when the newest available evidence
  predates the topic's declared freshness window, together with the age of that
  evidence.
- **FR-019-029** `unavailable` MUST be published with a named reason when the
  research worker failed or returned nothing usable, and no partial or inferred
  finding may be published in its place. *(P2)*
- **FR-019-030** A new dossier version MUST reference the version it supersedes,
  and the superseded version MUST remain readable. *(P21)*
- **FR-019-031** A correction to a published finding MUST be a new entry
  referencing the old one, never an edit of the old one. *(P21)*

### Refinement, public safety, and reachability

- **FR-019-032** The agent MAY propose a refinement that narrows a topic or adds
  a sub-question **inside** the declared scope boundary.
- **FR-019-033** A refinement MUST be recorded as an attributed, dated addition;
  the operator's declared question text MUST remain byte-identical unless the
  operator changes it.
- **FR-019-034** A refinement whose subject falls outside the declared scope
  boundary MUST be refused with a named reason.
- **FR-019-035** The agent MUST NOT retire, pause, or delete a topic; lifecycle
  transitions are operator-owned.
- **FR-019-036** No dossier, registry entry, or published record may contain a
  position, a size, a cost basis, or a profit-or-loss figure. Subjects are
  public market objects and public tickers only. *(P13)*
- **FR-019-037** Research MUST be performed only through the existing
  web-capable lanes and their committed `webAllow` allowlist; this feature adds
  no credential and no licensed endpoint. *(P9)*
- **FR-019-038** Each generation MUST publish an agenda read that reaches the
  brief, carrying every topic's identifier and outcome state, so the surface
  satisfies the admission-test corollary that a read must reach the brief.
  Filing the read into the payload's tool-read channel under a registered tool
  id MUST NOT be treated as satisfying this on its own: the brief's evidence
  drawer renders the snapshot tool reads and the brief page artifact carries no
  tool-read key, so the agenda material MUST also be carried on the brief page
  artifact and rendered by a section of the brief the reader opens. Both halves
  are required and neither substitutes for the other.

## Non-Functional Requirements

- **NFR-019-001** The dueness decision MUST be computable offline from committed
  state, so a failed network cannot make the pipeline forget what is due.
- **NFR-019-002** The agenda's contribution to publication time MUST be bounded
  by the declared review budget, not by the number of declared topics.
- **NFR-019-003** Every published artifact this feature writes MUST stay inside
  the repository's existing artifact-budget contract
  (`artifact-budget/v1` in `market-brief.config.json`), and any budget figure it
  introduces MUST have a test that can actually fail. *(P22, P23)*
- **NFR-019-004** Every guard this feature introduces MUST carry an adversarial
  case that fails when the guard is removed. *(P23)*

---

## Admission Test Justification

> **Does this improve decision quality, or the measurement of decision quality?**

**Decision quality — directly.** Three real research sessions produced material
the operator wanted to act on, and two of the three no longer exist. A decision
made without the defense earnings-acceleration work, or without the fertilizer
outlook, is a decision made with less evidence than the operator already
gathered once. Re-gathering it by hand each time is exactly the cost the brief
exists to remove.

**And measurement — indirectly but concretely.** A topic that is reviewed on a
cadence and records `updated` / `unchanged` / `stale` / `unavailable` produces,
over months, a record of how often a standing question actually moved. That is a
prerequisite for Feature 020 publishing the error rate of the calls those topics
generate. Without the dated, append-only dossier trail there is nothing to score
against.

**On the corollary.** §1 says adding a surface may pass only if its read reaches
the brief. FR-019-038 makes that a requirement rather than an aspiration: the
agenda publishes a read carrying each topic's outcome state into the brief. A
dossier that never reaches the brief would fail this test, and this spec says so
explicitly in its Failure Condition.

## Product Principle Alignment

| Principle | How this spec honours it |
| --- | --- |
| **P1 — provenance on every figure** | FR-019-025: date, source and stated confidence on every finding, or it is not published |
| **P2 — missing renders as missing** | FR-019-029, BS-019-015: `unavailable` with a named reason; never a placeholder |
| **P9 — works with nothing** | FR-019-037: no new credential, no new endpoint; existing allowlist only |
| **P10 — UMD never ESM** | Non-Goal 6: no build step, no browser ES modules |
| **P11 / P12 — reuse, cache-first** | Dueness is computed from committed state (FR-019-022); a topic inside its cadence is not re-researched (FR-019-023) |
| **P13 — tickers only, forever** | FR-019-036: no position, size, cost basis or P&L, ever |
| **P17 — reachable or removed** | FR-019-038: the agenda read reaches the brief |
| **P18 — wired or not shipped** | The owning module has a production consumer in the generation path, not only a test |
| **P19 — one definition per concept** | FR-019-009: one owning module for the topic contract; no second copy |
| **P20 — every claim is scoreable** | Deliberately deferred to Feature 020, and its honest limits are stated below rather than assumed away |
| **P21 — additive, append-only** | FR-019-014, FR-019-030, FR-019-031 |
| **P22 — budgets are assertions** | NFR-019-003 |
| **P23 — a guard that cannot fail is not a guard** | NFR-019-004 |
| **P25 — capped, never status-blocked** | 38 FRs, 5 intended scopes; the split into 019 and 020 exists for this reason; dependencies below are named capabilities, not spec statuses |

## Dependencies — Named Missing Capabilities

Per P25, this spec blocks on capabilities, never on another spec's status.

| Missing capability | Why it matters here | Effect if absent |
| --- | --- | --- |
| **A committed user-owned topic registry** | The scheduler runs in a disposable clone and can read only committed files | This spec creates it; nothing else in the repo supplies one |
| **Per-topic research routing into the action list, attention tier and alert pipeline** | The three real sessions produced action items with nowhere to go | Feature 020 supplies it. Until it exists, dossiers are readable and honest but their action items stay inside the dossier |
| **Live Red Alert publication** | A topic finding that clears the alert bar still cannot go live | Handled entirely in Feature 020; this spec neither needs nor claims it |

This spec has no dependency on the *status* of any other spec. It shares no
artifact with `specs/008-portfolio-survival-and-brief-lab`; that feature's
research queue is private and portfolio-derived, this one is public and
topic-driven, and Non-Goal 2 keeps them apart.

## What Is Not Possible Today — Stated Honestly

1. **Most topic subjects cannot become scoreable brief calls.**
   `loadInstrumentUniverse` in `scripts/recommendation-body.mjs` builds the
   committed instrument universe from `data/bars/*.json`, `data/options/*.json`
   and the tickers in `watchlist.json`. European defense listings, Brent, urea
   and potash are not in it. A swing or tactical call naming an instrument
   outside that universe resolves `no-instrument-in-committed-universe` and is
   withheld by `scripts/validate-brief-payload.mjs`. **A topic cannot produce a
   scoreable call on an instrument the repository holds no data for**, and this
   spec does not pretend otherwise. Bringing such an instrument into the
   committed universe is separate work that this spec does not do.
2. **Live Red Alert publication does not exist.** `rlmarketaction.js` rejects
   `published === true` with `RLMKT-GATE`, and `GATE.redAlertPublication` is
   `"dependency-pending:feature-002"`. No topic finding can go live as an alert
   today. This spec does not need it; Feature 020 states the degraded behaviour.
3. **A topic's subject may fall outside the public attention scope.** The
   attention composer refuses a subject outside the `watchlist.json` scope with
   `RLATTN-PRIVACY`. A geopolitical or commodity topic may legitimately have no
   publishable attention subject at all. Feature 020 owns that refusal path.
4. **This spec does not resolve the action-item routing the operator asked for.**
   It ends at an honest, dated, append-only dossier. Feature 020 carries the
   findings to the action list, the attention tier, and the alert pipeline.

## Intended Scope Decomposition

Five scopes, authored by `bubbles.plan`. Recorded here as intent only.

| # | Scope | Covers |
| --- | --- | --- |
| 1 | `01-agenda-registry-contract` | FR-019-001..009 — the committed registry, its contract, and the single owning module |
| 2 | `02-topic-lifecycle` | FR-019-010..015 — add, pause, retire, append-only lifecycle events, per-topic refusal |
| 3 | `03-per-generation-review-policy` | FR-019-016..023 — dueness, triggers, budget, deterministic order, named deferral |
| 4 | `04-dossier-and-outcome-states` | FR-019-024..031 — the dossier, the four honest outcome states, append-only supersession |
| 5 | `05-refinement-public-safety-and-brief-read` | FR-019-032..038 — bounded refinement, public-scope enforcement, the read that reaches the brief |

## Assumptions And Open Questions

1. **Open — where the registry lives.** A standalone committed file beside
   `market-brief.config.json` and a new block inside it are both viable. The
   config file already carries `globalBackdrop` and `macroEvents`, but those are
   agent-maintained and this surface is operator-owned, which argues for
   separation. Resolved in design.
2. **Open — which lane researches a topic.** Only `core` and `signals` have
   `web: true`, and each lane already owns an exact set of top-level payload
   keys and may write only `.brief-work/<lane>.json`. Adding topic research to
   an existing lane's key set, versus adding a lane, is a design decision with
   real write-disjointness consequences.
3. **Open — the material-change trigger vocabulary.** FR-019-018 requires
   triggers to be expressed against evidence the generation already has. The
   exact expressible vocabulary is a design decision and must stay small enough
   to be validated mechanically.
4. **Assumption.** The three real sessions are representative of the topic shape
   the operator wants: a durable question, a scope boundary, a horizon, and
   catalysts to watch. The registry contract is designed against those three and
   should be re-checked against a fourth before it is frozen.
5. **Open — dossier storage location. Closed — the reach of registration, which
   is larger than this spec first listed.** `scripts/build-pages-site.mjs` makes
   registration binary for a root `.html`: registered, or listed in
   `site-exclusions.json`. Whether dossiers are rendered as a page at all is
   still undecided and is a design decision. What registration *costs*, once a
   page is added, is no longer open — it is eleven surfaces, not six:
   `tools.json`; the `index.html` `TOOLS` array; the `rlnav.js` `TOOLS` array;
   `README.md`; `notes/README.md` plus the tool's own notes target;
   `toolCoverage` in both `market-brief.payload.json` and
   `market-brief.snapshot.json`; the regeneration of
   `market-brief.tools.page.json` by `scripts/build-brief-page-artifacts.mjs`;
   the binary page-exists-and-is-not-excluded rule in
   `scripts/build-pages-site.mjs`, which makes the page and its registration a
   single atomic change; the frozen `PUBLIC_DIRECTORIES` allowlist in the same
   script, without which a dossier directory is never published at all; the
   tool-experience registries, since every registered tool carries an
   `experience` block naming a Simple model definition, an adapter inside the
   module allowlist, and journey definitions that must already exist; and one
   additive key on the brief page artifact.
6. **Closed — registration does not, by itself, make the read visible.** This is
   the correction that matters most, because it is easy to assume the opposite.
   The brief's evidence drawer renders the *snapshot* tool reads, and the brief
   page artifact carries no tool-read key at all, so a read published into the
   payload under a correctly registered id is still invisible to the reader.
   Registration buys the *routing* half — a legitimate owning source and an
   allowlisted deep link, which is what Feature 020's attention routing needs.
   The *visibility* half is the additive page-artifact key and the section that
   renders it. FR-019-038 now requires both.

---

*Educational models — not investment advice. Every figure in these tools is a
hypothetical output from editable assumptions, not a forecast. Do your own due
diligence and size positions yourself.*
