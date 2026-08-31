# Feature 019 User Validation — Custom Recurring Research Agenda

Every item below starts CHECKED because it is what the feature is expected to do
once it ships. A checked box is not a record that anything was built, run or
verified — it is the baseline expectation written down in advance. You uncheck an
item when the behaviour is broken for you. An unchecked box is a reported
regression and blocks further work on this feature until it is fixed.

This is the acceptance walk you perform against the published brief and the
standing-research tool page.

Walk it against your three real topics — **defense manufacturers and earnings
acceleration**, **U.S.–Iran oil and the Strait of Hormuz**, and **food, grains
and fertilizer** — and against the degraded cases, which matter more than the
happy path because an honest product looks broken exactly there.

## Checklist

### My topics exist, and the unattended run can see them

- [x] I can find the file where my topics live, and it is a file in this repository — not a setting in a browser tab.
- [x] I can add a topic by editing that file and committing it. I do not have to change any code, and nothing asks me to run a migration.
- [x] My three topics are there: defense manufacturers and earnings acceleration, U.S.–Iran oil and the Strait of Hormuz, and food, grains and fertilizer.
- [x] Each of the three has its own question, in my own words, not a paraphrase.
- [x] Each of the three has its own boundary — what it covers and what it does not — and its own review schedule.
- [x] The question I see on screen is character-for-character the question I wrote.
- [x] A scheduled run that I did not start picks up a topic I committed, without me opening the site at all.
- [x] Nothing anywhere asks me to add a topic through the page, and no button implies I could.

### The run tells me what it actually did

- [x] For every topic I can tell, without opening anything, whether it was reviewed this run.
- [x] A topic that was refreshed says so and shows how many findings it has.
- [x] A topic that was reviewed but turned up nothing new says exactly that — and I can tell that apart from a topic that was never looked at this run.
- [x] A topic that was not due says it was not due and tells me when its next review is.
- [x] I am never shown an internal status word like `updated` or `unavailable` in place of a sentence.
- [x] Nothing is styled as an alarm. A topic with nothing new is a normal outcome, not a warning.

### The degraded cases — a topic that is not due

- [x] Take the grains and fertilizer topic on a run inside its schedule. It is marked not due, its previous read is still shown with its own date, and nothing pretends that read is from today.
- [x] Its previous findings are still fully readable. Nothing was cleared just because it was not reviewed.
- [x] A run where none of my three topics is due says so plainly and shows each topic's own last read, rather than showing an empty section.

### The degraded cases — old evidence

- [x] Take the Hormuz topic when the newest thing anyone published is older than the freshness window I set. It says the evidence is old and tells me how old, in days.
- [x] It tells me to read those findings as history rather than as today's read.
- [x] The findings are still shown. They are labelled, not hidden.

### The degraded cases — the research step failed

- [x] When the research step fails for a topic, that topic says it could not be researched this run and gives me a specific reason. "An error occurred" is not a reason.
- [x] No finding is invented for it. Not a placeholder, not a guess, not a plausible-sounding sentence.
- [x] The rest of the brief is completely unaffected. My next-session actions, the decision list and the catalysts are all still there.
- [x] My other topics were still reviewed.

### The degraded cases — a topic I wrote badly

- [x] If I commit a topic with no question, that topic alone is refused, it tells me what was missing, and my other topics are still reviewed.
- [x] The count adds up: the number of topics shown plus the number refused equals the number I declared. Nothing disappears.

### The degraded cases — more topics than the run can handle

- [x] When more topics are due than a single run reviews, the ones that did not fit say so, and say they are next in line.
- [x] None of them silently vanishes. I can always account for every topic I declared.
- [x] The order is explained to me, and it is the same order every time for the same inputs.

### Pausing and retiring are mine

- [x] I can pause a topic by committing a change, and it stops being researched.
- [x] A paused topic says *I* paused it. It does not say it was unavailable, because that would blame the system for my choice.
- [x] Everything already written for a paused topic is still readable.
- [x] I can retire a topic, and nothing already written for it is deleted.
- [x] Nothing in the page offers to pause, retire or delete a topic on my behalf.

### History is kept, never edited

- [x] When a topic is refreshed, the earlier version is still there and I can open it.
- [x] I can see the earlier version and the current one at the same time, so working out what changed is a reading task rather than a memory task.
- [x] There is no edit control anywhere. A correction appears as a new dated line pointing at the old one.

### The agent may sharpen my question, never replace it

- [x] When the agent narrows a topic inside the boundary I set, I see it as a dated addition with the agent named, and my own question is untouched.
- [x] When the agent proposes something outside my boundary, I see that it was **not** applied, and why.
- [x] My question and my boundary are never changed without that change being visible to me.

### It never carries anything private

- [x] No topic, no finding and no published record anywhere shows a position, a share count, a cost basis or a profit or loss figure.
- [x] Everything named is a public ticker or a public market thing.
- [x] Nothing here needs a key, a login or an account.

### Every finding says where it came from

- [x] Every finding carries the date it was observed, the source it came from, and a stated confidence.
- [x] Confidence is always followed by what it means — evidence quality, not a probability of being right.
- [x] A finding that could not be researched is shown as a named gap with a reason, not as a blank line and not as a zero.
- [x] Following a finding's link takes me to the tool that owns the underlying math. The finding itself prints no price level of its own.

### I can actually see this on the brief

- [x] The standing-research section is on the brief page I already open. I do not have to go anywhere else to learn what happened to my topics.
- [x] It sits alongside the sections I already read, rather than as a separate feed or a new view.
- [x] Every state is readable with all colour removed — the symbol and the word carry it.
- [x] Every state is readable at 200% zoom without losing a line.
- [x] On a phone the section is a single column and I never have to scroll sideways.
- [x] Every label has an explanation I can reach with the keyboard, not only by hovering, and it tells me both what the field is and what this particular value means.
- [x] Opening a topic works with the keyboard alone.

### The honest limit I am accepting for now

- [x] My topics' findings stay inside their dossiers this time round. Nothing here promises to put them into the next-session action list, the decision list or the alert area — that is the next feature, and this one does not pretend otherwise.

## Human Acceptance Record

- acceptedBy: operator
- acceptedAt: 2026-08-25T16:59:38Z
- method: external-record
- record: .specify/memory/open-work.md residue row res-acceptance-method-mislabelled, and the grant quoted in res-g136-acceptance-record-backfill section OPERATOR ACCEPTANCE GRANT 2026-08-28
