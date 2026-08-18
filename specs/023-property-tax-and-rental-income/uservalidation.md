# Feature 023 User Validation — Property Tax And Rental Income

Every item below starts CHECKED because it is what the feature is expected to do
once it ships. A checked box is not a record that anything was built, run or
verified — it is the baseline expectation written down in advance. You uncheck an
item when the behaviour is broken for you. An unchecked box is a reported
regression and blocks further work on this feature until it is fixed.

This is the acceptance walk you perform against the tool page opened directly from
a file, with no server and no account.

The last release knew what you earned. This one knows what you own. It can work
out your property tax from what you actually have in front of you, tell you
whether itemizing is still worth it now that two big deductions are fighting over
one cap, price a rental after depreciation and the loss limits, work out which
category a vacation home falls into, and price a sale including the part that
usually gets left out.

Almost as important as what it answers is what it refuses. It has no database of
county tax rates and never will, because that would be wrong for most people and
quietly stale for everyone else. It asks you for the local facts and it looks up
the law.

## Checklist

### It tells the difference between what I told it and what it looked up

- [x] Every figure on the property panel is marked either as something I typed or
as something it looked up. Never both, never neither.
- [x] If I leave out the assessed value, it tells me I left it out. It does not
show me a zero.
- [x] If it could not look up one of the relief rules, it says so — and that
message reads differently from the one about my missing input.
- [x] I can click through to the law behind every rule it applied, and each link
tells me which section to look at.
- [x] It never shows me a typical rate, an average, or an estimate for my area.

### Property tax

- [x] I enter an assessed value, my local rate and the exemptions I claim, and I
get a real number.
- [x] In Florida I see the homestead exemption and the cap on how fast the
assessment can rise, each with the constitutional section behind it.
- [x] In California I see that the taxable value follows what I paid for the
property rather than what it is worth now, with its own cap and its own rate
ceiling.
- [x] If my local rate is below the ceiling, it uses my rate and says so. It does
not quietly use the ceiling.
- [x] The property tax shows up in the headline total, in the comparison, in the
next-dollar curve and in the export. Not just in one of them.

### Whether itemizing is still worth it

- [x] I see my property tax and my state income tax listed separately, then
capped together.
- [x] It tells me how much of each one bought me nothing, instead of just showing
the capped total.
- [x] My mortgage interest is limited by the published debt limit, and the part
that does not count is named rather than dropped.
- [x] I see the itemized total and the standard deduction side by side, and it
tells me which one it actually used.
- [x] If itemizing does not beat the standard deduction, it tells me plainly that
my property tax changed nothing.
- [x] It no longer lists state and local tax as something it does not model,
because it now models it.

### A rental I let out all year

- [x] I get a real net figure after depreciation, not just rent minus expenses.
- [x] The depreciation comes from the published recovery period, and I can see
which publication and section it came from.
- [x] If it could not look up the recovery period, it refuses the depreciation
rather than skipping it and giving me a rosier number.
- [x] When my loss is limited, I see each limit in the order it was applied, and
how much each one disallowed.
- [x] Nothing disallowed is silently set to zero. Every disallowed amount is named
and carried.
- [x] If I tell it about a loss carried in from before, it uses my figure and
treats it as mine, not as something it looked up.
- [x] It gives me the closing carried-forward figure for this year only. It does
not tell me anything about next year.

### A holiday home I use myself

- [x] It asks how many days I rented it and how many days I used it myself, and
then tells me which category the property is in.
- [x] It shows me the actual comparison it made, with the day figure and the
percentage it compared against, and where those came from.
- [x] If it could not look up the test figures, it refuses to categorise rather
than guessing.
- [x] I try exactly the number of personal days on the boundary, exactly the
boundary percentage, and exactly the boundary number of rented days. Each lands
where the publication says it should.
- [x] If I rented it for only a handful of days, it excludes the rent from my
income and deducts none of the rental costs — and tells me that is the reason,
rather than just showing zero.
- [x] For mixed use, it splits each cost between personal and rental by the days I
declared and shows me the split it used.
- [x] The personal share is not thrown away. It goes into the deduction I might be
itemising.

### Selling

- [x] The gain is split into the part that comes from depreciation I already took
and the rest, and each is taxed under its own rule.
- [x] The depreciation part has its own maximum rate, shown with the source it
came from.
- [x] It does not tax the whole gain at one rate.
- [x] The main-home exclusion is applied only after that split, and never to the
depreciation part.
- [x] It checks how long I owned it and how long I lived in it separately, and if
one of them fails it tells me which one.
- [x] The other special categories it still cannot handle are still refused, with
the same reasons as before.

### It does not pretend to know the future or the market

- [x] I see no probability of anything. No chance of success, no odds, no
percentage likelihood.
- [x] Nothing assumes my property will go up or down in value.
- [x] There is no multi-year projection, no lifetime total and no break-even year.
- [x] I see no claim about how often this tool has been right before. No accuracy
figure, no track record, no error rate.
- [x] Nothing is described as optimal, recommended, or best.

### It reads properly and I can use it without a mouse

- [x] The first thing I see is a plain answer, not a wall of tables.
- [x] Every number has an explanation I can reach by hovering or by tabbing to it.
- [x] The detail — the relief rules, the limit ladder, the classification, the
sources — is one click away and clearly labelled, not gone.
- [x] I can tab through the whole page, including every unavailable item, and read
what each one says.
- [x] Nothing unavailable shows up as an empty box, a bare dash, or a zero.
- [x] On my phone the property, rental and disposition tables are readable and I am
not stuck scrolling sideways.

### My data stays mine

- [x] The page works with no internet connection and no account.
- [x] I can check the network activity and see that it made no requests at all,
even though it is now loading more sets of rules than before.
- [x] Nothing I typed appears in the address bar — including what my property is
worth and what I paid for it.
- [x] It never asked me for a name, an address, a parcel number, a Social Security
number, an account number, or any tax identifier.
- [x] Nothing saves or exports on its own. A file appears only when I ask for one.
- [x] The exported file leaves out my property value, my rental figures and my sale
figures, and tells me what it left out.
- [x] There is a clear-everything action and it removes everything the tool listed
as stored, including the property details.
- [x] Clearing this tool's data does not disturb anything else I use on this site.

### It is not on the site yet, and that is correct

- [x] This tool does not appear in the tool list, the site index, or the
navigation.
- [x] It does not appear in the market brief.
- [x] The rest of the site works exactly as it did before, including the portfolio
tools and everything the previous releases of this tool already did.
