# Feature 019 — Custom Recurring Research Agenda

**Status:** planning
**Host surface:** a registered first-class research tool backed by a committed
agenda registry, durable dossiers, sustained analytical models, chart history,
and the existing headless brief pipeline. Every brief generation publishes an
agenda read on the brief the reader already opens. **Not** a browser-local list.
**Not** a private portfolio queue.
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
2. **U.S.-Iran, Hormuz, the Red Sea, and cross-asset supply shocks.** The session
  traced intervention chronology, actor reaction functions, escalation paths,
  chokepoints, physical-flow evidence, and cross-asset transmission. It was
  written to `notes/us-iran-oil-market-intervention-patterns.md`. It is the only
  session that can be re-read today. It is still a dated snapshot, not a tool,
  and it cannot reverse or extend its analysis when new evidence arrives.
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

What is missing is a durable **user-owned research capability**. `globalBackdrop`
and `macroEvents` are agent-maintained. Nothing lets the operator declare the
review mode for each topic, preserve its analytical models and charts, or require
a complete new review on every brief generation. Nothing tells the agent to
reverse a prior view when direct evidence or subtle indirect evidence invalidates
it.

The completed geopolitical session now sets the admission bar. Its content must
become the first primary topic in a reusable agenda foundation. The foundation
must not encode Iran as a special case. The primary topic is a geopolitical
supply-shock instance whose current scope includes U.S.-Iran reaction functions,
Hormuz, the Red Sea and Bab el-Mandeb, and cross-asset transmission. Other public
topics remain independent instances with their own questions and review modes.

And there is a second, sharper failure the first three sessions demonstrated:
each of those sessions produced things the operator should have *done* —
positions to check, levels to watch, claims to verify. Those action items had
nowhere to go. A dossier that produces an action item and keeps it inside the
dossier has produced a document, not a decision. **Routing that material into
the action list, the attention tier, and the red-alert pipeline is Feature 020.**
This spec ends at the honest dossier; 020 carries it to the reader.

---

## Outcome Contract

**Intent.** The operator declares a small set of standing public research topics
in a committed registry. Each topic has an explicit review mode. An
`every-generation` topic receives a complete research pass on every market-brief
generation. A `cadence` topic is researched only when its explicit schedule or a
declared trigger makes it due. Each pass updates a dated dossier, sustained
models, chart history, and an honest outcome. The agent may strengthen, weaken,
or sharply reverse its prior view when cited direct or indirect evidence changes.

**Success signal.** The initial registry carries a primary geopolitical
supply-shock topic in `every-generation` mode, plus defense-acceleration and
food-input topics in explicit `cadence` mode. Every scheduled generation running
in a disposable clone produces either a complete current-generation review for
the primary topic or a named unavailable outcome. The registered tool shows the
current dossier, prior versions, persistent models, chart history, evidence
classes, triggers, invalidations, and any strengthened, weakened, or reversed
view. The operator can trace every change to its sources and can still read every
superseded version.

**Hard constraints.**

- **Committed registry only.** The agenda is a committed repo file. No
  `localStorage`, no browser state, no uncommitted local file, because
  `scripts/brief-refresh-scheduled.sh` runs in a disposable clone that cannot
  see any of those.
- **Review mode is explicit.** Every active topic declares
  `every-generation` or `cadence`. No mode, cadence, freshness window, or review
  capacity is inferred from a default.
- **Every-generation means a complete pass.** The pipeline re-evaluates every
  declared analytical section for that topic on every brief generation. A prior
  `unchanged` result, a cadence budget, or a quiet market cannot suppress the
  pass. A failed pass publishes `unavailable`, not the prior dossier as current.
- **Reusable agenda foundation.** Review policy, lifecycle, evidence roles,
  analytical sections, and history apply to every topic. The primary
  geopolitical topic is a seeded instance, not an Iran-only contract.
- **Primary supply-shock coverage.** The seed topic covers actor reaction
  functions, escalation scenarios, Hormuz and Red Sea chokepoints, and direct
  and indirect evidence. It also covers transmission through oil, refined
  products, LNG, fertilizer, aluminum, shipping, and U.S.-listed proxies. Each
  path carries triggers, invalidations, and provenance.
- **One owning module.** The topic contract — validation, lifecycle states, and
  the mode-aware selection and stale decision — is defined once, in one module,
  and every consumer reads it from there. *(P19)*
- **Public scope only, tickers only, forever.** A topic may name public market
  objects and public tickers. No position, no size, no cost basis, no P&L, ever.
  *(P13)*
- **Absence is a first-class outcome.** A topic the pipeline could not research
  this generation publishes a named outcome with a reason. Never a stale dossier
  presented as current, never a fabricated finding, never a plausible
  placeholder. *(P2)*
- **Append-only history.** A refreshed dossier is a new dated version that
  references its predecessor. A correction is a new entry, not an edit. *(P21)*
- **No continuity bias.** The prior dossier is evidence, not an anchor. The
  agent may reverse direction, scenario weights, or conviction sharply when
  cited evidence changes. It must state what changed and which prior
  invalidation or new evidence caused the change.
- **Sustained analytical state.** Models, scenario sets, transmission maps,
  proxy sensitivities, chart definitions, chart series, and review history
  persist across dossier versions. A complete pass marks a section unchanged
  when appropriate. It never omits the section silently.
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
- **Dossier, tool, and read only.** Feature 019 owns topic definition, full
  research, persistent analysis, the registered tool, and the brief read. It
  does not write actions, attention items, anomaly seeds, candidates, or alerts.
  Feature 020 owns all destination routing.

**Failure condition.** The feature has failed, even with every test green, if
any of these is true: the registry lives anywhere the disposable clone cannot
read; a topic that could not be researched publishes a dossier that looks
current; a prior dossier version is overwritten rather than superseded; the
agent rewrites the operator's declared question without a visible operator edit;
an `every-generation` topic is skipped, deferred, or served from a prior run as
current; a sustained model or chart disappears without a named change; the agent
preserves a prior view after its invalidation fired; a topic's dossier carries a
position, size or P&L; Feature 019 writes to an action, attention, or alert
destination; or a dossier is produced that never reaches the brief.

---

## Goals

1. Give the operator a committed, user-owned registry of standing research
   topics that the unattended scheduler can actually read.
2. Apply an explicit review mode to every topic, with no inferred cadence or
  default policy.
3. Run a complete research pass for every `every-generation` topic on every
  brief generation, while cadence topics remain schedule- and trigger-driven.
4. Record the honest per-topic outcome — `updated`, `unchanged`, `stale`,
   `unavailable` — so the reader can tell research from silence.
5. Persist each topic's models, charts, evidence, and version history in a
  registered first-class tool.
6. Let the agent strengthen, weaken, or sharply reverse its view inside the
  operator's declared question, with cited evidence and visible reasoning.
7. Seed the agenda with the primary geopolitical supply-shock topic while
  preserving the reusable agenda foundation.

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
8. **No Iran-only implementation.** The geopolitical supply-shock topic is the
  primary seeded instance. It does not define the agenda contract for defense,
  food-input, or future topics.

## Actors

| Actor | Role in this feature |
| --- | --- |
| Operator | Declares, edits, pauses and retires topics; reads dossiers; owns the question |
| Scheduler | `scripts/brief-refresh-scheduled.sh`, running unattended in a disposable clone |
| Research worker | The web-capable research capability that reviews mandatory every-generation topics and selected cadence topics under the allowlist |
| Publication gate | `scripts/validate-brief-payload.mjs`, which refuses a malformed publish |
| Reader | Anyone reading the published brief, including the operator later |

## Use Cases

### UC-019-001: Declare a standing public topic

- **Actor:** Operator
- **Preconditions:** The operator can edit the committed agenda registry.
- **Main Flow:** The operator declares a stable topic identifier, question,
  boundary, analytical sections, review mode, freshness window, and public
  subjects. The next generation validates the topic and enters it into the
  correct review cycle.
- **Alternative Flows:** The topic is refused by name when a required field is
  absent. Other valid topics continue.
- **Postconditions:** The topic is visible in the agenda read without any private
  portfolio state.

### UC-019-002: Run mandatory and cadence research together

- **Actor:** Scheduler
- **Preconditions:** The committed agenda contains active every-generation and
  cadence topics.
- **Main Flow:** The generation selects every active every-generation topic,
  evaluates cadence dueness, applies cadence capacity, and records every topic's
  selected, not-due, paused, retired, deferred, refused, or unavailable state.
- **Alternative Flows:** A research failure produces a named unavailable result
  for the affected topic without suppressing the brief.
- **Postconditions:** Every active mandatory topic has a current-generation review
  record or a named unavailable result.

### UC-019-003: Read a current dossier and its history

- **Actor:** Reader
- **Preconditions:** At least one topic has a published review record.
- **Main Flow:** The reader opens the agenda summary from the brief, follows the
  topic into the planned first-class tool, and compares the current dossier with
  prior models, charts, evidence, and change assessments.
- **Alternative Flows:** Stale or unavailable evidence remains visible with its
  age or reason. It never appears current.
- **Postconditions:** The reader can explain what changed, what did not, and why.

### UC-019-004: Reverse a prior analytical view

- **Actor:** Research worker
- **Preconditions:** New direct evidence or subtle second-order indirect evidence
  invalidates the prior dossier inside the declared boundary.
- **Main Flow:** The worker re-evaluates every analytical section, records a
  `reversed` change assessment, cites the causal evidence, and updates current
  models and charts without editing the predecessor.
- **Alternative Flows:** Insufficient evidence produces
  `insufficient-evidence`. An out-of-boundary proposal is refused.
- **Postconditions:** The current view reflects the evidence rather than narrative
  continuity, while the prior view remains auditable.

### UC-019-005: Expose research without routing it

- **Actor:** Publication gate
- **Preconditions:** A generation has composed a valid agenda read and tool
  artifact.
- **Main Flow:** The gate accepts the dossier, first-class tool, and brief summary
  when they satisfy Feature 019 contracts.
- **Alternative Flows:** The gate refuses malformed research by name. It does not
  synthesize an action, attention item, anomaly seed, candidate, or alert.
- **Postconditions:** Feature 020 may consume valid findings through its own
  contracts. Feature 019 has chosen no destination.

## Domain Vocabulary

| Term | Meaning |
| --- | --- |
| **Topic** | A user-declared standing research subject with an explicit question, scope boundary, analytical sections, and review mode |
| **Agenda registry** | The committed file holding every topic and its lifecycle state |
| **Declared question** | The operator's own words for what the topic must answer; the boundary the agent may sharpen inside but not replace |
| **Scope boundary** | The declared limits of a topic — subjects, geographies, instruments, horizons — outside which a finding does not belong |
| **Review mode** | The required policy `every-generation` or `cadence`; no mode is implied when absent |
| **Full review** | A pass that re-evaluates every declared analytical section and records each as changed, unchanged, stale, or unavailable |
| **Review cadence** | The explicit schedule for a `cadence` topic; it does not apply to an `every-generation` topic |
| **Due** | A cadence topic whose schedule elapsed or whose declared trigger fired; every-generation topics are mandatory without a due test |
| **Dossier** | The dated research artifact for one topic in one review |
| **Evidence role** | `direct`, `indirect`, or `model-inference`, stated separately from provenance and confidence |
| **Finding** | One dated, sourced, confidence-stated statement with an explicit evidence role inside a dossier |
| **Sustained analytical state** | Versioned reaction functions, scenarios, transmission maps, proxy sensitivities, models, charts, and review history kept across runs |
| **Change assessment** | The comparison with the predecessor: `strengthened`, `weakened`, `reversed`, `unchanged`, or `insufficient-evidence` |
| **Outcome state** | The honest per-topic result of a review: `updated`, `unchanged`, `stale`, `unavailable` |
| **Refinement** | An agent-proposed narrowing or sub-question inside the declared question |

## Domain Capability Model

### Capability

**Standing public research with explicit review policy and durable analytical
state.** The capability turns an operator-owned question into a recurring,
versioned research record. Concrete topics supply their own subject matter,
analytical sections, review mode, triggers, and invalidations.

### Domain Primitives

| Primitive | Purpose | Lifecycle |
| --- | --- | --- |
| Agenda topic | Holds the declared question, boundary, analytical sections, review mode, and public subjects | `active` → `paused` or `retired`; a paused topic may return to `active` |
| Review policy | Selects mandatory every-generation work and due cadence work without a default | Declared with the topic; changes only through an operator-visible registry edit |
| Review generation | Binds one research pass to one market-brief generation | Planned, attempted, then recorded as reviewed or unavailable |
| Evidence item | Separates direct observations, indirect signals, and model inference | Added to one dossier version; never rewritten |
| Analytical model | Carries reaction functions, scenarios, transmission paths, proxy sensitivity, triggers, and invalidations | Re-evaluated on a full review; may strengthen, weaken, reverse, or remain unchanged |
| Historical view | Preserves chart definitions, chart series, annotations, and prior model states | Append-only across dossier versions |
| Dossier version | Records the outcome, change assessment, findings, sustained state, and predecessor | Current when published; superseded but always readable after the next version |

### Relationships

- An agenda topic owns one review policy and one ordered set of analytical
  sections.
- A market-brief generation creates one review generation for each mandatory
  every-generation topic and each selected cadence topic.
- A dossier version belongs to one topic and one review generation. It references
  its predecessor when one exists.
- Findings support or invalidate analytical models. Every model change names the
  direct, indirect, or inferred evidence that caused it.
- The registered tool renders dossiers and historical views. Feature 020 may
  consume findings, but Feature 019 never chooses or writes a destination.

### Business Policies

- Reject a topic with no explicit review mode. Never infer one from its title,
  position, or prior cadence.
- Select all active every-generation topics before applying the cadence-topic
  budget. Never defer the primary supply-shock topic while it remains active.
- Re-evaluate every declared analytical section during a full review. Record an
  unchanged section explicitly.
- Permit a sharp reversal when cited direct or indirect evidence invalidates the
  predecessor. Never smooth a reversal to preserve narrative continuity.
- Keep the foundation topic-neutral. Seed geopolitical supply shock as the
  primary instance without hard-coding Iran into shared behavior.
- Publish only public market subjects and public tickers. Routing remains owned
  by Feature 020.

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

#### BS-019-003: A topic with no explicit review mode is refused by name

```gherkin
Scenario: One invalid topic does not disable the others
  Given the agenda declares three topics and one is missing its review mode
  When the agenda is validated
  Then the invalid topic is refused with a named reason
  And the remaining two topics are still reviewed
```

### Cluster 2 — Lifecycle: add, pause, retire, never rewrite

#### BS-019-004: The operator adds a topic and it is reviewed on the next generation

```gherkin
Scenario: A newly declared topic enters the review cycle
  Given the operator commits a new topic with a declared question and an explicit review mode
  When the next generation runs
  Then an every-generation topic is selected as mandatory
  And a cadence topic is treated as due because it has never been reviewed
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

#### BS-019-007: The reusable agenda ships with the operator's standing topics

```gherkin
Scenario: The operator's actual research history is expressible
  Given the operator declares the primary geopolitical supply-shock topic in every-generation mode
  And its current scope covers U.S.-Iran reaction functions, Hormuz, the Red Sea and Bab el-Mandeb
  And it covers oil, refined products, LNG, fertilizer, aluminum, shipping and U.S.-listed proxy sensitivity
  And the operator declares defense-acceleration and food-input topics in cadence mode
  When the agenda is validated
  Then all three are accepted as instances of the same agenda foundation
  And each retains its own question, boundary, analytical sections and review mode
```

### Cluster 3 — Explicit review modes and per-generation capacity

#### BS-019-008: Cadence mode honours its explicit schedule

```gherkin
Scenario: Cadence mode honours its explicit schedule
  Given two cadence topics share the same explicit weekly cadence
  And one is still inside the cadence while the other has elapsed it
  And no material-change trigger has fired for either topic
  When the generation reviews the agenda
  Then the first topic is not researched and its prior dossier remains current
  And the second topic is due for research this generation
```

#### BS-019-009: Every-generation mode requires a complete research pass

```gherkin
Scenario: Every-generation work cannot be skipped as not due
  Given an active topic in every-generation mode
  And its prior dossier reported unchanged
  When the generation reviews the agenda
  Then the topic is selected for a complete research pass
  And every declared analytical section is re-evaluated
  And the current generation publishes a new review record or a named unavailable outcome
  And the prior dossier is never presented as the current generation's review
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

#### BS-019-011: Mandatory reviews are protected before cadence capacity is applied

```gherkin
Scenario: More due topics than the budget allows
  Given an active every-generation topic
  And more cadence topics are due than the declared cadence-topic budget allows
  When the generation selects topics to research
  Then it selects the every-generation topic before any cadence topic
  And it never defers that mandatory topic because of the cadence-topic budget
  And it selects cadence topics up to their budget in a declared deterministic order
  And every unselected cadence topic publishes a named deferred outcome and reason
```

### Cluster 4 — The dossier and honest outcome states

#### BS-019-012: A researched topic produces a sourced durable analytical dossier

```gherkin
Scenario: A dossier carries provenance
  Given a due topic researched successfully this generation
  When the dossier is written
  Then every finding carries an observation date, source, confidence and evidence role
  And the dossier carries the generation instant, topic identifier and change assessment
  And it carries every declared analytical section with sustained model and chart state
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
  And no prior finding, model state, chart series or scenario weight is edited in place
```

### Cluster 5 — Bounded refinement, public safety, and reaching the brief

#### BS-019-017: The agent reverses a prior view when the evidence invalidates it

```gherkin
Scenario: New direct or indirect evidence can force a sharp reversal
  Given a full review finds cited direct evidence or subtle second-order indirect evidence that invalidates the prior dossier's view
  And the evidence remains inside the operator's declared question and scope boundary
  When the agent completes the current dossier
  Then the current view may reverse direction, scenario weights or conviction sharply
  And the change assessment is reversed with the causal evidence and invalidation named
  And the prior dossier remains readable and unchanged
  And the operator's declared question text is unchanged
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

#### BS-019-020: The first-class tool and research read reach the brief

```gherkin
Scenario: A tool and read that do not reach the reader do not ship
  Given a generation in which at least one topic was reviewed
  When the registered research tool, published payload and brief page artifact are inspected
  Then the tool exposes the current dossier, prior versions, sustained models, charts and review history
  And the payload carries a research read for the agenda under its registered tool id, with each topic's outcome state
  And the brief page artifact carries the agenda material the reader-facing section renders
  And the read is visible on a brief surface the reader opens, rather than only present in the payload or confined to a dossier file
```

## UI Scenario Matrix

| Scenario | Actor | Entry Point | Steps | Expected Outcome | Screen(s) |
| --- | --- | --- | --- | --- | --- |
| BS-019-003 | Operator | Committed agenda registry | Declare a topic with no review mode; run validation | The topic is refused by name and valid topics continue | Repository editor; no product UI |
| BS-019-009 | Scheduler | Scheduled market-brief generation | Select the active every-generation topic; complete every analytical section | A current-generation review record or named unavailable result is published | Headless generation; published brief artifact |
| BS-019-012 | Reader | Agenda summary on the brief | Open the topic; inspect findings, model state, chart state, and provenance | Every analytical section and finding is explainable and dated | Planned `market-brief.html` agenda section; planned `research-agenda-lab.html` |
| BS-019-015 | Reader | Topic row with unavailable state | Open the unavailable topic | The reader sees the named failure reason and the dated prior history without a fabricated current finding | Planned brief agenda section and research tool |
| BS-019-017 | Reader | Current dossier change assessment | Compare the reversed dossier with its predecessor | The causal direct or indirect evidence, invalidation, prior view, and new view are all visible | Planned research tool history view |
| BS-019-020 | Reader | Brief agenda summary | Follow the agenda tool link; inspect current and prior versions | The tool and brief both expose the read; full models and charts remain owned by the tool | Planned `market-brief.html` and `research-agenda-lab.html` |

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
- **FR-019-007** Each active topic MUST carry a review mode from the closed
  vocabulary `every-generation | cadence` and an explicit freshness window. A
  `cadence` topic MUST also carry a positive cadence. No mode, cadence, or
  freshness window may be inferred from a default.
- **FR-019-008** Each topic MUST carry a lifecycle state from a closed
  vocabulary of `active`, `paused` and `retired`.
- **FR-019-009** The topic contract — its validation, its lifecycle vocabulary,
  and the due decision — MUST be defined in exactly one module, and every
  consumer MUST read it from that module. *(P19)*

### Lifecycle

- **FR-019-010** Adding a topic MUST require nothing but a committed registry
  edit; no code change and no schema migration.
- **FR-019-011** The initial registry MUST contain three public topic instances:
  a primary geopolitical supply-shock topic in `every-generation` mode, plus
  defense-acceleration and food-input topics in `cadence` mode. The primary
  topic MUST cover actor reaction functions, escalation scenarios, Hormuz and
  Red Sea chokepoints, oil, refined products, LNG, fertilizer, aluminum,
  shipping, U.S.-listed proxy sensitivity, triggers, invalidations, provenance,
  and direct and indirect evidence. These are topic sections, not shared
  foundation fields that hard-code Iran into every topic.
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

- **FR-019-016** Every market-brief generation MUST classify every `active`
  topic by its explicit review mode before research selection. Missing or
  unknown modes MUST be refused by name rather than treated as cadence.
- **FR-019-017** Every active `every-generation` topic MUST be selected for a
  complete research pass on every market-brief generation. A prior unchanged
  outcome, a quiet market, or cadence capacity MUST NOT suppress or defer it.
- **FR-019-018** A `cadence` topic MUST be due when it has never been reviewed,
  when its explicit cadence elapsed, or when a declared material-change trigger
  fired against evidence already available to the generation.
- **FR-019-019** The published review record MUST name the topic's review mode
  and the reason it was selected. A cadence trigger MUST be named. An
  every-generation topic MUST state that the mode required the pass.
- **FR-019-020** The registry MUST declare a positive maximum count of active
  every-generation topics and a positive cadence-topic review budget. The
  active mandatory count MUST NOT exceed its maximum. Neither capacity may be
  inferred from a default.
- **FR-019-021** Every-generation topics MUST be selected before cadence topics
  and MUST NOT be deferred by the cadence-topic budget. Due cadence topics MUST
  follow a declared deterministic order up to their budget. Every unselected
  cadence topic MUST publish a named deferred outcome with its reason.
- **FR-019-022** Mode classification, cadence dueness, trigger evaluation, and
  selection MUST be computable from committed state without network access.
- **FR-019-023** A cadence topic that is not due MUST NOT be researched, and its
  most recent dossier MUST remain current with its original date. An
  every-generation topic has no not-due state while active.

### Dossier, outcome states, and append-only history

- **FR-019-024** A researched topic MUST produce a dossier carrying the topic
  identifier, generation instant, review mode, outcome state, predecessor
  reference, and change assessment.
- **FR-019-025** Every finding inside a dossier MUST carry an observation date,
  source, stated confidence, provenance class, and evidence role from
  `direct | indirect | model-inference`. A finding missing any member MUST NOT
  be published. *(P1, P3, P7)*
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
- **FR-019-031** Each topic MUST declare its required analytical sections. A
  completed full review MUST persist every section's current model state, chart
  definition, chart series or annotation history, triggers, invalidations, and
  predecessor comparison. An unchanged section MUST be marked unchanged rather
  than omitted. A correction MUST be a new entry referencing the old one.
  *(P7, P21)*

### Refinement, public safety, and reachability

- **FR-019-032** The agent MAY narrow, strengthen, weaken, or sharply reverse a
  topic's current view inside its declared boundary. The new view MUST cite the
  direct evidence, subtle or second-order indirect evidence, or model inference
  that supports the change. It MUST NOT preserve the predecessor merely for
  narrative continuity.
- **FR-019-033** Every reviewed dossier MUST compare itself with its predecessor
  using `strengthened | weakened | reversed | unchanged | insufficient-evidence`
  and explain the evidence, trigger, or invalidation behind the assessment. The
  operator's declared question text MUST remain byte-identical unless the
  operator changes it.
- **FR-019-034** A refinement whose subject falls outside the declared scope
  boundary MUST be refused with a named reason.
- **FR-019-035** The agent MUST NOT retire, pause, or delete a topic; lifecycle
  transitions are operator-owned.
- **FR-019-036** No dossier, registry entry, or published record may contain a
  position, a size, a cost basis, or a profit-or-loss figure. Subjects are
  public market objects and public tickers only. *(P13)*
- **FR-019-037** Research MUST use only the existing web-capable acquisition
  boundary and committed allowlist. It adds no credential or licensed endpoint.
  A full review MUST reuse current shared observations and retrieve only missing
  or stale deltas, while still re-evaluating every declared analytical section.
  *(P9, P11)*
- **FR-019-038** The feature MUST ship as a registered first-class research
  tool that exposes current and prior dossiers, sustained models, charts, and
  review history. Each generation MUST also publish an agenda read on the brief
  with every topic's identifier, mode, outcome, and change assessment. For an
  active every-generation topic, the visible current result MUST belong to that
  same generation or state `unavailable`. A payload-only tool read does not
  satisfy reader visibility. The tool, page artifact, and rendered brief section
  are all required.

## Non-Functional Requirements

- **NFR-019-001** The dueness decision MUST be computable offline from committed
  state, so a failed network cannot make the pipeline forget what is due.
- **NFR-019-002** The agenda's contribution to publication time MUST be bounded
  by the declared maximum active every-generation count plus the cadence-topic
  review budget, not by the total number of declared topics.
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

## Exposure Contract

| Capability | Surface class | Surface id | Status | Plan |
| --- | --- | --- | --- | --- |
| Standing-topic definition and review policy | internal | committed agenda registry consumed by the market-brief generation path | planned | `specs/019-custom-recurring-research-agenda` |
| Per-generation recurring research | internal | market-brief generation research pass | planned | `specs/019-custom-recurring-research-agenda` |
| Full dossier, sustained models, charts, and history | uiRoute | `research-agenda-lab.html` | planned | `specs/019-custom-recurring-research-agenda` |
| Agenda summary and current outcome | uiRoute | `market-brief.html` | planned | `specs/019-custom-recurring-research-agenda` |
| Action, attention, and alert routing | internal | Feature 020 routing consumers | planned | `specs/020-research-action-routing-and-alerts` |

No Feature 019 capability is marked delivered. The current repository has the
standalone geopolitical snapshot and the existing brief-generation scripts. The
repository search for this reconciliation found agenda-tool identifiers only in
Feature 019 and Feature 020 planning artifacts. It found no registered tool page,
agenda registry, or owning runtime module.

## Delivery Status: Current Versus Roadmap

| Surface | Current truth | Roadmap commitment |
| --- | --- | --- |
| Geopolitical research | `notes/us-iran-oil-market-intervention-patterns.md` is a dated standalone snapshot | Convert its analytical content into the initial history of the primary supply-shock topic |
| Agenda foundation | Requirements, design, and scope artifacts exist; no runtime agenda capability is delivered | One reusable topic foundation with explicit review modes |
| Recurring refresh | The existing market brief has scheduled generation scripts | Run every-generation topics through a complete research pass on each generation |
| First-class tool | No registered agenda tool or tool page was found | Register and render `research-agenda-lab.html` with dossiers, sustained models, charts, and history |
| Brief exposure | No agenda read is delivered | Publish and render the current agenda read on `market-brief.html` |
| Destination routing | Feature 020 planning owns actions, attention, and alerts | Keep routing outside Feature 019 |

## Product Principle Alignment

| Principle | How this spec honours it |
| --- | --- |
| **P1 — provenance on every figure** | FR-019-025 requires observation date, source, provenance class, evidence role, and confidence on every finding |
| **P2 — missing renders as missing** | FR-019-029, BS-019-015: `unavailable` with a named reason; never a placeholder |
| **P3 — confidence is evidence quality** | FR-019-025 keeps confidence separate from scenario weights and direction |
| **P6 — say when the read is old** | FR-019-028 labels stale evidence and its age; FR-019-038 forbids showing a prior dossier as the current every-generation result |
| **P7 — no blackbox numbers** | FR-019-031 preserves model state, chart inputs, history, triggers, invalidations, and predecessor comparison |
| **P9 — works with nothing** | FR-019-037: no new credential, no new endpoint; existing allowlist only |
| **P10 — UMD never ESM** | Non-Goal 6: no build step, no browser ES modules |
| **P11 — reuse, never refetch** | FR-019-037 reuses current shared observations and retrieves only missing or stale deltas while still running a full analysis |
| **P12 — cache-first, automatic first paint** | FR-019-038 requires the tool to expose the persisted current dossier and history without waiting for a manual fetch |
| **P13 — tickers only, forever** | FR-019-036: no position, size, cost basis or P&L, ever |
| **P14 — Simple is default, Power is drill-down** | The planned tool opens on the current decision and keeps models, charts, and history in the drill-down; exact composition remains design-owned |
| **P15 — everything explained in place** | The planned tool explains review mode, evidence role, confidence, triggers, invalidations, and change assessment where they appear |
| **P16 — deep-link, never duplicate** | The brief shows the agenda summary and links to the owning tool; it does not duplicate the tool's full model or chart history |
| **P17 — reachable or removed** | FR-019-038: the agenda read reaches the brief |
| **P18 — wired or not shipped** | FR-019-009 and FR-019-038 require the planned owning module and tool to have production consumers before delivery |
| **P19 — one definition per concept** | FR-019-009: one owning module for the topic contract; no second copy |
| **P20 — every claim is scoreable** | Feature 019 records invalidations and change assessments but does not publish a finding as a call. Feature 020 owns destination eligibility and scoreability |
| **P21 — additive, append-only** | FR-019-014, FR-019-030, FR-019-031 |
| **P22 — budgets are assertions** | FR-019-020 and NFR-019-002 define mandatory and cadence capacity; NFR-019-003 requires failing budget tests |
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
| 1 | `01-agenda-registry-contract` | FR-019-001..009 — the committed registry, explicit review modes, analytical sections, and the single owning module |
| 2 | `02-topic-lifecycle` | FR-019-010..015 — seeded topic instances, add, pause, retire, append-only lifecycle events, per-topic refusal |
| 3 | `03-per-generation-review-policy` | FR-019-016..023 — mandatory every-generation work, cadence dueness, triggers, two capacity limits, deterministic order, named deferral |
| 4 | `04-dossier-and-outcome-states` | FR-019-024..031 — provenance, change assessment, sustained models and charts, honest outcomes, append-only supersession |
| 5 | `05-refinement-public-safety-and-brief-read` | FR-019-032..038 — evidence-driven reversal, bounded scope, public safety, first-class tool, and the read that reaches the brief |

## Assumptions And Open Questions

1. **Closed product decision — explicit modes.** The registry must represent
  `every-generation` and `cadence` directly. Design may choose field structure,
  but it may not restore one cadence rule or infer a mode.
2. **Closed product decision — primary seeded topic.** The initial primary topic
  is geopolitical supply shock. Its current case spans U.S.-Iran, Hormuz, the
  Red Sea, and the named cross-asset channels. The shared foundation remains
  topic-neutral.
3. **Open design question — persistent analytical shape.** Design must define a
  stable representation for models, chart definitions, series, annotations,
  section-level unchanged states, and predecessor comparisons without
  duplicating math owned by another tool.
4. **Open design question — bounded mandatory capacity.** Design must reconcile
  every-generation full reviews with timeouts and concurrency. It must enforce
  the explicit mandatory-topic maximum and cadence-topic budget without
  deferring the active primary topic.
5. **Open design question — direct and indirect evidence.** Design must define
  validation for evidence roles and model inference. Provenance and evidence
  role are separate fields and neither may be inferred from the other.
6. **Downstream artifacts are stale after this revision.** The active
  `design.md` assumes cadence fields on every topic, conditionally spawns
  research only when a topic is due, and argues that the common case adds no
  research wave. The active scope plan and its tests encode the same policy.
  `bubbles.design` must reconcile the design first. `bubbles.plan` must then
  reconcile the scenario manifest and all five scopes before implementation.

---

*Educational models — not investment advice. Every figure in these tools is a
hypothetical output from editable assumptions, not a forecast. Do your own due
diligence and size positions yourself.*
