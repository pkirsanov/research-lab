# Feature 026 — Actionable Brief Brevity And Cross-Asset — User Validation

**Owner of this document: the human reader of the brief.** No agent may tick a
box below. An agent may only prepare the checklist and note where to look.

This feature exists because the brief stopped being useful. The checklist below
is written as the reader's own test, in the reader's own terms, and is derived
from the complaints that opened this work rather than from the requirement list.
If the brief passes every requirement and still fails this checklist, the
requirements were wrong.

**Status: not yet validated. Implementation has not started.**

---

## How to validate

Open [market-brief.html](../../market-brief.html) on a normal run, not a fixture.
Read it the way you would on a working morning: once, quickly, without scrolling
back. Then answer each item.

---

## Checklist

### I can read it in under a minute

- [ ] The default view fits without scrolling on a normal laptop screen.
- [ ] I reached the end of the default view in under sixty seconds.
- [ ] I did not skim. I read every default-visible word, because there were few
      enough to read.

### It tells me what to do, or honestly says there is nothing

- [ ] Within the first two lines I know whether I am being asked to do something.
- [ ] If there is an action, it names the instrument, the level, what would prove
      it wrong, and when it stops counting.
- [ ] If there is no action, the brief says so in a sentence and does not fill the
      space with analysis instead.
- [ ] I am not asked to infer the decision from a paragraph of context.

### It does not repeat itself

- [ ] I did not read a fresh paragraph about a position that has not changed.
- [ ] Instruments with nothing new are counted in one line, not described one by
      one.
- [ ] Reading two consecutive runs, the parts that changed are obvious and the
      parts that did not are absent rather than reworded.
- [ ] Nothing reads as though it were rewritten purely to look new.

### It tells me when the world moved, not just when my stocks moved

- [ ] Rates, the dollar and energy each appear on every run.
- [ ] Each of those carries a recent multi-session change, not only a
      multi-month trailing figure.
- [ ] When something builds over several days, I learn about it while it is
      building, not after it has resolved.
- [ ] A move outside US equities that plausibly explains an equity move is named
      as such.

### It admits what it cannot see

- [ ] When a leg cannot be resolved, the brief says so at the top, in plain
      words, before it says anything else.
- [ ] I never have to read to the end of a paragraph to discover the brief was
      blind to something.
- [ ] A dark leg is visually distinct from a leg reporting a quiet reading. I can
      tell "nothing happened" apart from "I could not look".
- [ ] The brief never sounds confident about a subject it has no data for.

### Detail is available but out of the way

- [ ] Every long-form section is collapsed when the page loads.
- [ ] I can open any one of them and get the full reasoning I used to get by
      default.
- [ ] Opening one does not require opening all of them.
- [ ] Nothing I actually needed was hidden.

### It remembers, and it keeps score

- [ ] The brief can tell me what changed since it last spoke to me.
- [ ] I can see what it previously told me to do and how that turned out.
- [ ] Calls that were wrong are as visible as calls that were right.
- [ ] A success rate is withheld when the sample is too small, rather than
      flattered.

---

## Regression check against the original complaint

These are the exact things that prompted the work. Each must be answerable
"yes" before this feature is accepted.

- [ ] The brief is no longer "a useless pile of crap".
- [ ] There are actionable things in it, or an honest statement that there are
      none today.
- [ ] It is short and precise.
- [ ] Details are hidden by default and open on request.
- [ ] Consecutive days do not read the same.
- [ ] It does not reiterate a hold on every tracked stock.
- [ ] A multi-day build in yields, currency or energy would have been reported
      while it was building.

---

## Automation Readiness

_To be completed by the implementing owner once scopes are executed._

This section records which checklist items are covered by an automated check and
which remain human-only judgement. It must not claim coverage that does not
exist. Items about whether the brief is *useful* are human-only by nature and
should be declared as such rather than proxied by a character count.

---

## Human Acceptance Record

| Field | Value |
| --- | --- |
| Validated by | _unsigned_ |
| Date | _not yet validated_ |
| Run inspected (`asOf`) | _n/a_ |
| Window | _n/a_ |
| Outcome | _pending — implementation not started_ |
| Notes | |

**This record is unsigned. The feature is not accepted.**
