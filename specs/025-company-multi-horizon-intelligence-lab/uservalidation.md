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

**What to have open.** `company-intelligence-lab.html`. No key and no account
are required. Serve the folder over http for most of this walk: run
`python3 -m http.server 8000`, then open
`http://localhost:8000/company-intelligence-lab.html`. The section **It works
with nothing** is the exception. Those items are about opening the file
directly, so open it that way when you reach them and judge what you see there.

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
only a person can judge. Automation resolved it on 2026-08-19. Checking a row
here grants no acceptance. The Checklist above is still entirely unwalked.

The third column names the tests that actually carry the proof, because a
Test Plan row number alone was not enough. Several sections are fully proven by
tests that no Test Plan row happens to list, and one section is named by a row
that covers least. Naming the test rather than the pointer lets a reader verify
a checkmark by running one command.

| Checklist section | Automatable today | Tests that prove every item of the section | Ready |
| --- | --- | --- | --- |
| One company, four answers | Yes | TP 2.1, 2.4 | [x] |
| The short answer never outruns the long one | Yes | TP 1.5, 1.6 | [x] |
| Disagreement survives | Yes | TP 1.7 | [x] |
| Absence is named, never blank | Yes | TP 1.1, 1.2, 2.5, plus unit `an unavailable dimension never renders as a zero or a neutral number`, `a read aged past its window stays in the denominator as stale rather than becoming neutral`, `the coverage account refuses a read set missing any one registry dimension rather than dropping the row`, `adversarial: a read naming another company is refused and never reaches a horizon`, `the financial event dimension moves to current from a sourced document while the non-financial one keeps no-source-exists` | [x] |
| Every number tells me where it came from | Yes | TP 2.3, plus browser `FR-025-014 every dated coverage row states its age, so a stale read cannot read as current` and unit `a read aged past its window stays in the denominator as stale rather than becoming neutral` | [x] |
| Following the math to its owner | Yes | TP 1.8, 1.9, 2.2 cover three items of four. The fourth is now satisfied wherever the owning tool can open on a company, and honestly stated where it cannot. See the gap table. | [ ] |
| Confidence is about evidence, not about winning | Yes | TP 2.1, plus unit `no horizon read emits a numeric confidence beside its direction` | [x] |
| The research the agent chose to do | Yes | TP 1.14, 1.15, 1.16, 1.17, 4.7, plus browser `an empty research plan renders its reason as readable copy rather than an empty block` and unit `an empty research plan is a real outcome rather than an absent one` | [x] |
| Events read honestly | Yes | TP 1.11, 1.13, 3.1, 3.6 | [x] |
| Nothing about my money, ever | Yes | TP 1.18, plus browser `a position, size or cost basis entry is refused in the browser and nothing is stored` | [x] |
| It works with nothing | Yes | TP 1.4, 2.13, plus browser `the first paint composes with every data request still outstanding, then reconciles to the served registry` | [x] |
| Reading it at all | Partly | TP 2.6, 2.7, 2.8, 2.14, plus browser `NFR-025-005 every rendered ticker is a linked, described token from the shared ticker module` | [x] |
| History is added to, never rewritten | Yes | TP 4.1, 4.2, 4.6 | [x] |

**What a checked row means, exactly.** A row is `[x]` when the tests named in its
own third column exist, pass, and between them assert every item of the matching
Checklist section. Every unit test named above was run alone under
`node --test --test-name-pattern`, and every browser test named above was run
under a filtered `--grep`, so no row rests on a suite-level green that could have
come from a neighbour. Transcripts and hashes are in [report.md](report.md).

**A checked row still grants no acceptance.** It says a machine can already see
the described outcome. It does not say a person has. The twelve checked rows
exist to shorten the walk, not to replace it: they tell the walker which
behaviours are held by a test that will keep failing if they regress, so the
walk can spend its attention on the judgements below instead.

**One row stays unchecked, and it is not a citation problem.** It named a real
item the product does not satisfy. The defect behind it was repaired on 2026-08-19
and the row moved, but its item is not satisfied outright, so it stays `[ ]` and the
residue is stated exactly below so the walker can decide it on its merits.

| Row | The item that is not satisfied | What the machine actually observes | Bearing on the walk |
| --- | --- | --- | --- |
| Following the math to its owner | "When another tool owns a dimension, the row links to that tool **for the same company**." The other three items are proven: TP 2.2 asserts every owner link resolves to a route registered in `tools.json` and that an unowned row renders a sentence and no link, TP 1.9 asserts the no-owner statement at module level, and TP 1.8 asserts this tool defines no second copy of a metric another tool owns. | The link now carries the company **wherever the owning tool can open on one**. A registry row may declare `ownerSubjectParam`, and `describeDimensionOwner` composes `<route>.html?<param>=<percent-encoded company>` from it; TP 2.2 asserts the query names the company being read. Two of the eleven owned rows carry it today — `options-structure` and `dealer-gamma`, whose owning routes take a free-text ticker and now read it from the query. The other nine do not, and this was checked rather than assumed: `company-fundamentals-lab.html` is wired to one committed publication (`sec-cik-0000789019`) and has no company control at all, `market-brief.html` and `research-agenda-lab.html` are market-wide rather than company-scoped, and `technical-analysis-decision-lab.html`, `trend-dynamics-cycle-lab.html`, `options-flow-feed-lab.html` and `volatility-sizing-lab.html` select from a fixture or a bounded universe rather than from a company. Those nine link to the bare route and the row states it: "…reads no company parameter and opens on its own subject." | The reader is no longer silently sent to another company. Two owners open on yours; the other nine say in the row that they will not. Judge whether the honest statement is enough, or whether those tools should be made company-scoped — that is a planning decision, not a defect in this tool. |

**The row that moved to `[x]` on 2026-08-19, and what changed to earn it.** "It
works with nothing" previously failed one of its four items — "Nothing waits on a
network call before the first paint" — whenever a server WAS present, because the
first paint awaited the served registry. It now paints from the registry copy the
document already carries and reconciles to the served one afterwards, which is the
repository's own cache-first first paint (P12) and the pattern the rest of the repo
follows. The served registry stays authoritative: when it says anything else the
view is recomposed from it, and when it cannot be read the page still refuses by
name, now saying explicitly that what is shown came from the embedded copy. The
proof holds every runtime `fetch` the route issues open — registry, bars, events,
research record — and requires four horizons carrying readable copy to be on screen
anyway, then releases them and requires the registry source to flip to `served`.
That assertion was proven able to fail: with the early paint removed the page stayed
at `data-run-status="empty"` and the test went red.

**What a machine cannot judge here.** Four judgements stay human. Whether a
summary reads as useful rather than merely correct. Whether a named absence
reads as an honest gap rather than as a broken page. Whether the four horizons
together answer the operator's actual question. Whether the narrow-width layout
and the keyboard focus order are pleasant to use, as opposed to merely present:
the machine proves the four summaries stack at 375 CSS pixels without sideways
scrolling and that every control on both views takes focus, in document order,
with a visible focus ring, but legibility and flow are yours to call.

**Two items are true only with a caveat, and the caveat is not a defect.**
"The financial events dimension says plainly that no producer is wired for it"
now holds for every company **except** MSFT: Increment B wired a real producer,
and the unit test above proves the dimension reads `current` for a covered
subject and `no-source-wired` for every other. Read that item against any other
company. Separately, Test Plan row 2.9 passes but reports `refs=0`, so its
id-resolution half is vacuous on this page and it proves only that the single
inline script parses. Element identity is instead held by TP 2.14, which
resolves every control by id against the live DOM.

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
