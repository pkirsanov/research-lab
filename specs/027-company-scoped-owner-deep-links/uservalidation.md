# Feature 027 — Company-Scoped Owner Deep Links — User Validation

**Who owns this document.** You, the reader who follows a dimension to the tool
that owns its math. No agent ticks a Human Acceptance item on your behalf.

**How to read the checklist.** Every item below ships **unchecked**. An
unchecked item means the behaviour has not been accepted yet; it does not mean
the behaviour is broken. Walk the tool and **tick** only what you personally
saw be true. Leave anything you did not verify unchecked, and say what you saw
instead — that is a finding, and it is routed rather than argued with.

**What to have open.** `company-intelligence-lab.html` on any company, and the
four owner routes it links to: `options-structure-lab.html`,
`gamma-trading-lab.html`, `volatility-sizing-lab.html` and
`options-flow-feed-lab.html`. No key, no account and no server is required.

---

## Checklist

### Following a dimension keeps my company

- [ ] When I follow a dimension whose owner can show a company, that tool opens already showing the company I was reading.
- [ ] The tool tells me in words which company it is showing. I do not have to read it off a chart or a table cell.
- [ ] I never land on a different company than the one I came from.

### The scanner still scans

- [ ] When I follow the options-flow dimension, that company's own read is the first thing I see.
- [ ] The rest of the scan is still there. Nothing was filtered away and nothing was re-sorted behind my back.
- [ ] If the company is covered but nothing unusual happened for it, the tool says exactly that, and it says something different when the company is not covered at all.

### Opening a tool the ordinary way is unchanged

- [ ] Opening any of these tools directly, with no link, works exactly as it did before.
- [ ] Every control, every default and every number is where it was.
- [ ] I cannot tell this feature happened when I open a tool without a link.

### A bad link is refused, not half-obeyed

- [ ] A mangled or crafted link never puts strange text anywhere on the page.
- [ ] When a link names something the tool cannot accept, the tool says so and tells me which subject it is showing instead.
- [ ] After a refusal the tool is fully usable, and every control is showing one single subject.

### A company with no data is named, never blank

- [ ] When I follow a link to a tool that has no data for my company, it names my company and says it has no data for it.
- [ ] I never get a blank view, and I never get another company's numbers sitting under my company's name.

### Every bare link says why it is bare

- [ ] Where a dimension's owner answers a market-wide question, the row says so and the link carries no company.
- [ ] Where a dimension's owner does not model a company I can choose, the row says so and the link opens on that tool's own subject.
- [ ] No row leaves me guessing whether a bare link is deliberate or unfinished.

### It still works with nothing

- [ ] Every one of these tools opens from a plain file open, with no key, no account and no server.
- [ ] Following a link adds no waiting that was not there before.

---

## Automation Readiness

This table records which checklist sections a machine can prove and which need
your eyes. It is filled in by the implementing agent from real, executed test
results. Until a scope runs, every Ready cell stays unchecked.

| Checklist section | Automatable today | Tests that prove every item of the section | Ready |
| --- | --- | --- | --- |
| Following a dimension keeps my company | Yes | TP 2.3, 2.4, 2.9, 2.12, 3.9 | [ ] |
| The scanner still scans | Yes | TP 2.10, 2.13 | [ ] |
| Opening a tool the ordinary way is unchanged | Yes | TP 1.14, 1.18, 2.1, 2.2, 2.8 | [ ] |
| A bad link is refused, not half-obeyed | Yes | TP 1.4, 1.11, 1.12, 1.13, 1.15, 1.16, 1.17, 2.6, 2.14 | [ ] |
| A company with no data is named, never blank | Yes | TP 2.5, 2.13 | [ ] |
| Every bare link says why it is bare | Yes | TP 3.4, 3.5, 3.6, 3.10 | [ ] |
| It still works with nothing | Partly | TP 2.1, 2.8, plus a recorded manual `file://` open per changed route | [ ] |

The `file://` row is marked Partly on purpose. A test runner proves the page
loads without a bundler; it does not prove the experience of opening the file
from a disk with no network. That half stays yours.

---

## Human Acceptance Record

Filled in by you, after the walk. No agent writes in this table.

| Field | Value |
| --- | --- |
| Accepted by | Not recorded |
| Accepted on | Not recorded |
| Scopes covered by this walk | Not recorded |
| Items unchecked during the walk | Not recorded |
| Findings routed | Not recorded |
