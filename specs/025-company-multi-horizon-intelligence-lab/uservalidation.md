# Feature 025 — Company Multi-Horizon Intelligence Lab — User Validation

**Owner artifact:** uservalidation.md. **Upstream:** [spec.md](spec.md) and
[scopes.md](scopes.md).
**Educational only — not investment advice.**

Every item below ships **unchecked**. An unchecked box means the behaviour has
not been accepted yet. It does not mean the behaviour is broken. You check a box
only after you perform the walk yourself and see the described outcome on the
real page.

This checklist is your acceptance walk, not an engineering test log. Read it in
plain terms. If an item reads as untrue when you try it, leave it unchecked and
say what you saw instead.

Most of this walk is about the cases where the tool has **nothing to say**. That
is deliberate. Increment A reports seven of fifteen dimensions as unavailable,
and an honest product looks thin exactly there. The test of this feature is
whether an absence reads as a named gap rather than as a fault.

---

## Checklist

### One company, four answers

- [ ] I type one public company identifier and press run. I get four separate answers back.
- [ ] The four answers are: what to do now, what happens at the next event, how to sit over the coming quarters, and the multi-year case.
- [ ] Each of the four carries a short summary I can read in seconds.
- [ ] Each of the four also carries a deep dive I can open.
- [ ] The four never merge into one overall verdict.

### The short answer never outruns the long one

- [ ] I open a deep dive and find every part of the summary supported by something the deep dive shows.
- [ ] Nothing in the summary asserts a conclusion the deep dive cannot derive.
- [ ] When a horizon is missing most of its evidence, the summary says so in plain words.

### Disagreement survives

- [ ] When the immediate read and the long-term read point different ways, both keep their own direction.
- [ ] The disagreement appears as its own item I can read.
- [ ] Nothing averages the two into one blended direction.

### Absence is named, never blank

- [ ] Every one of the fifteen dimensions shows a state on every run. None is silently missing.
- [ ] A dimension with no source says **unavailable** and names the missing source.
- [ ] I never see a dash, a zero or an empty cell standing in for a missing value.
- [ ] The non-financial events dimension says plainly that no source exists for it.
- [ ] The financial events dimension says plainly that no producer is wired for it.
- [ ] Nothing substitutes a peer value, a sector value or an older value for a missing one.

### Every number tells me where it came from

- [ ] Every number on the page carries its source, its as-of date and its provenance class.
- [ ] I can tell an observed value from a derived one, a proxy and a modelled one.
- [ ] A stale reading says it is stale and shows its age. It never reads as current.

### Following the math to its owner

- [ ] When another tool owns a dimension, the row links to that tool for the same company.
- [ ] The link opens a page that actually exists.
- [ ] When no tool owns a dimension, the row says so and shows no link at all.
- [ ] Nothing in this tool recomputes a number another tool already owns.

### Confidence is about evidence, not about winning

- [ ] Each horizon carries one of four words: broad, narrow, thin or absent.
- [ ] None of those words reads as a chance of making money.
- [ ] I never see a percentage next to a direction.

### The research the agent chose to do

- [ ] When the agent looks beyond the fifteen dimensions, I can read exactly what it asked.
- [ ] Each branch shows its question, why it mattered, what it consulted, what it found, what it changed and when it stopped.
- [ ] A branch that changed nothing still appears, and says it changed nothing.
- [ ] A branch the agent refused to publish appears with its refusal reason.
- [ ] When the floor answered everything, the plan says so rather than showing an empty panel.

### Events read honestly

- [ ] A date from a published calendar says **scheduled**.
- [ ] A date inferred from a pattern says **estimated** and shows the basis of the estimate.
- [ ] An event that already happened says **occurred** and shows what actually happened.
- [ ] An occurred event no longer sits in the upcoming list.
- [ ] A non-financial event with no public source and no as-of date never appears at all.

### Nothing about my money, ever

- [ ] I try to enter a position size and the tool refuses it by name.
- [ ] I try to enter a cost basis and the tool refuses it by name.
- [ ] Nothing anywhere stores a position, a size, a cost basis or a profit figure.
- [ ] The page has no password field and no place to paste a key.

### It works with nothing

- [ ] The page opens with no account, no key and no server running.
- [ ] Something paints immediately from data already on disk.
- [ ] Nothing waits on a network call before the first paint.
- [ ] A company with no committed data still gives me four honest horizons that state no direction.

### Reading it at all

- [ ] The four summaries read on a narrow phone-width screen with no sideways scrolling.
- [ ] Every chart has a table beside it holding the same numbers.
- [ ] I can reach every control with the keyboard.
- [ ] Every ticker renders as a linked, described token.
- [ ] Any text the agent wrote appears as plain visible text, never as markup.

### History is added to, never rewritten

- [ ] A second run creates a new dated version that points back at the one before it.
- [ ] The earlier version is still readable and unchanged.
- [ ] A correction appears as a new entry rather than an edit of an old one.

---

## Automation Readiness

This section records how much of the walk above a machine can prove, and what
only a person can judge. It ships with every row unresolved.

| Checklist section | Automatable today | Covering test row in scopes.md | Ready |
| --- | --- | --- | --- |
| One company, four answers | Yes | 2.1, 2.4 | [ ] |
| The short answer never outruns the long one | Yes | 1.5, 1.6 | [ ] |
| Disagreement survives | Yes | 1.7 | [ ] |
| Absence is named, never blank | Yes | 1.1, 1.2, 2.5 | [ ] |
| Every number tells me where it came from | Yes | 2.3 | [ ] |
| Following the math to its owner | Yes | 1.9, 2.2 | [ ] |
| Confidence is about evidence, not about winning | Yes | 1.6 | [ ] |
| The research the agent chose to do | Yes | 1.14, 1.15, 1.16, 1.17, 4.7 | [ ] |
| Events read honestly | Yes | 1.11, 1.13, 3.1, 3.6 | [ ] |
| Nothing about my money, ever | Yes | 1.18 | [ ] |
| It works with nothing | Partly | 2.8, 1.4 | [ ] |
| Reading it at all | Partly | 2.6, 2.7, 2.8, 2.9 | [ ] |
| History is added to, never rewritten | Yes | 4.1, 4.2, 4.6 | [ ] |

**What a machine cannot judge here.** Three judgements stay human. Whether a
summary reads as useful rather than merely correct. Whether a named absence
reads as an honest gap rather than as a broken page. Whether the four horizons
together answer the operator's actual question.

---

## Human Acceptance Record

This section stays empty until a person performs the walk. No agent may fill it
in on the operator's behalf.

| Field | Value |
| --- | --- |
| Accepted by | Not recorded |
| Accepted on | Not recorded |
| Scopes covered by this walk | Not recorded |
| Unchecked items at acceptance | Not recorded |
| Items the walker judged not applicable | Not recorded |
| Reported regressions | Not recorded |
| Next decision | Not recorded |

**Reported regressions.** Record each unchecked item here with what you saw
instead. An unchecked item after a walk blocks further work on this feature
until someone fixes it.

**Educational research only. Not investment advice.**
