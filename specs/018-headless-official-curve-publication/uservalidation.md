# Feature 018 User Validation

Every item below starts CHECKED because it is expected to hold once the feature
ships. You uncheck an item when the behaviour is broken for you. An unchecked box
is a reported regression and blocks further work on this feature until it is
fixed.

Read this list against the published Market Brief's bond card and, where an item
says so, against the Bond Regime Lab page itself.

## Checklist

### The Honest Half-Resolution

These items are the heart of this feature. The bond read gets **better**, not
**finished**: the duration side of the call becomes answerable and the credit
side does not, and the brief has to say that plainly rather than let one stand in
for the other.

- [x] The bond card tells me, in words, that one side of the call is answered and one is not.
- [x] The credit line and the duration line are two separate lines I can read independently.
- [x] I can see at a glance which of the two resolved, without opening anything.
- [x] The card names the one thing still missing — an independent credit-spread reading — and says why the brief cannot supply it.
- [x] The card does not read as an error or a load failure when only one side resolved.
- [x] The card never shows me an internal status word like "unavailable" in place of a sentence.
- [x] Nothing on the card suggests the bond regime is settled when only the duration side is.

### What The Curve Now Tells Me

- [x] The curve reading has a real date on it, and that date is the publisher's date rather than the date the brief ran.
- [x] The shape of the curve today and the way the curve has been moving are shown as two separate readings, never as one.
- [x] The inflation reading is shown as its own line rather than folded into the curve line.
- [x] The break-even reading is shown separately from the real-yield reading, because they are two different things.
- [x] The break-even line tells me how many dates it actually had both readings for, so I can see the coverage rather than assume it.

### When Something Is Missing Or Old

- [x] When there is no curve on file at all, the brief says so and shows nothing in its place — no zero, no blank, no carried-over number.
- [x] When the curve on file is too old to use, the brief says it is too old and tells me why.
- [x] When the curve is too old, the last good date is shown and clearly labelled as not today's reading.
- [x] When the curve is too old, no classification is shown next to it, so I cannot mistake a held-back reading for a current one.
- [x] When the brief cannot judge whether the curve is old or current, it says it could not judge — it does not guess in either direction.
- [x] Nothing about a missing or old curve is styled as an alarm; it is a plain statement.
- [x] A weekend does not make the brief tell me the curve is stale.
- [x] A day the bond market is closed does not make the brief tell me the curve is stale.

### Where The Numbers Came From

- [x] For each curve family I can see the source it came from, the date the publisher observed it, and the time it was retrieved.
- [x] The retrieval time and the publisher's date are shown as two different facts, never merged into one.
- [x] Following the source takes me to the official public page the number came from.
- [x] No cell in the source table is blank or a bare dash; every absent value says what kind of absence it is.
- [x] Nothing in the brief or the artifact ever shows an API key, a password, or any credential.
- [x] The restricted readings I enter in the tool myself never appear in the published brief.
- [x] The restricted rows in the source table say plainly that they stay in my tab and are never published.

### The Tool And The Brief Agree

- [x] The tool page tells me whether its reading agrees with the published brief for the same observation date.
- [x] When the two cannot be compared, the page says so and gives the reason — it never shows agreement by staying silent.
- [x] When the two are comparing different observation dates, the page treats that as "cannot compare" rather than as a disagreement.
- [x] When the two genuinely disagree, the page says so plainly and I cannot dismiss or hide the message.
- [x] The page tells me how many things were compared, so a comparison that quietly shrank is visible.

### Reading It At All

- [x] Every state — current, old, missing — is readable with all colour removed; the word and the symbol carry it.
- [x] Every state is readable at 200% zoom without losing a line.
- [x] On a phone the two axis lines stay two lines and never merge into side-by-side tiles.
- [x] Every label and every value has an explanation I can reach with the keyboard, not only by hovering.
- [x] The explanation tells me what the field is and what this particular reading of it means.
- [x] Nothing here needs a key, a login, or an account.

## Human Acceptance Record

- acceptedBy: operator
- acceptedAt: 2026-08-25T16:59:38Z
- method: external-record
- record: .specify/memory/open-work.md residue row res-g136-acceptance-record-backfill
