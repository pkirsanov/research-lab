# Feature 024 User Validation — Social Security And Medicare

Every item below starts CHECKED because it is what the feature is expected to do
once it ships. A checked box is not a record that anything was built, run or
verified — it is the baseline expectation written down in advance. You uncheck an
item when the behaviour is broken for you. An unchecked box is a reported
regression and blocks further work on this feature until it is fixed.

This is the acceptance walk you perform against the tool page opened directly from
a file, with no server and no account.

The last release knew what you own. This one knows what you will be paid and what
you will pay. It can work out your Social Security benefit from either the figure
on your statement or the earnings behind it, tell you how much of it the tax
return picks up, lay out what claiming at different ages does to the arithmetic,
and price Medicare including the surcharge that gets decided by an income year you
may have forgotten about.

Almost as important as what it answers is what it refuses. It will not guess which
year's income decides your Medicare surcharge, it will not tell you the odds of
anything, and it will not tell you which claim age is best. It does the arithmetic
and it shows you the arithmetic.

## Checklist

### It tells the difference between what I told it and what it looked up

- [x] Every figure on the benefit, tax, claim-age and Medicare panels is marked
either as something I typed or as something it looked up. Never both, never
neither.
- [x] If I leave out something it needs from me, it tells me exactly what is
missing. It does not show me a zero.
- [x] If it could not look up one of the rules, it says so — and that message
reads differently from the one about my missing input.
- [x] I can click through to the source behind every rule it applied, and each
link tells me which section, table or line to look at.
- [x] Where it used a figure from a different year's edition of a publication, it
shows me the publication's own words saying that figure does not change from year
to year. It does not just tell me to trust it.
- [x] It never shows me a typical benefit, an average premium, or an estimate of
what people like me get.

### My Social Security benefit

- [x] I can give it the figure straight off my Social Security statement, and it
uses that.
- [x] Or I can give it my earnings and it works the figure out, showing me the
brackets it used and where each came from.
- [x] If I give it both, it stops and asks me to pick one instead of quietly
choosing for me.
- [x] If I give it neither, it tells me both of the things it would accept.
- [x] If it could not look up what it needs to work the figure out from earnings,
it says so — and the statement route still works, without pretending my answer is
worse than it is.
- [x] It tells me my full retirement age from my year of birth, and shows me the
row it read.
- [x] If I claim early it shows me the reduction, month by month, with the rate
for each.
- [x] If I claim late it shows me the credit, and it stops adding credit at the
age the rules say it stops. Not later.
- [x] If my birth year is outside the table it has, it says so rather than using
the nearest row.

### How much of it gets taxed

- [x] It shows me the income figure it built to make the decision, with every part
of it named and where each part came from.
- [x] It makes clear that figure is its own thing and not my adjusted gross income
or any other total on the page.
- [x] It shows me the thresholds it compared against, which tier I landed in, and
the exact comparison it made — including whether the boundary counts as in or out.
- [x] It shows me how much of my benefit ends up taxable, and that it never goes
above the maximum share the rules allow.
- [x] If it could not establish that a threshold applies to my year, it refuses
rather than using it anyway — even if it found the number.
- [x] It no longer lists taxable Social Security as something it does not model,
because it now models it.
- [x] The taxable part actually changes the tax I owe. It does not just appear in
a table.

### Comparing when to claim

- [x] I can give it several claim ages and see, for each, the yearly amount and
the total to the life-expectancy age it looked up.
- [x] It tells me which life table it used and what year that table is for.
- [x] It shows me the age at which two of those totals become equal, and names
both ages it compared.
- [x] It says in plain words that this is arithmetic on the figures I gave it, not
a prediction.
- [x] I see no chance, no odds, no probability of anything — including no
probability that I outlive any age.
- [x] Nothing assumes my money grows, and nothing is discounted back to today.
- [x] The claim ages appear in the order I entered them, not sorted by which one
looks better.
- [x] Nothing is labelled best, optimal, recommended or preferred. It does not
pick one for me.
- [x] If it could not look up the life expectancy, it leaves the totals out rather
than making up a horizon — and the yearly amounts still show.

### Medicare

- [x] It asks me for my income from the specific earlier year that decides my
surcharge, and it names that year.
- [x] It does not quietly use this year's income instead. If I give it the wrong
year, it tells me which year it needed and why.
- [x] It shows me the standard premiums for both parts, with the source for each.
- [x] It shows me which surcharge band my income falls in, the exact boundary it
compared against, and the extra amount for each part.
- [x] If it could not look up a premium, a boundary or a surcharge amount, it
refuses rather than applying zero.
- [x] The Medicare cost is shown next to my tax, clearly labelled as not part of
it. My tax total does not include my premiums.

### Everything shows up where it should

- [x] Every new figure appears in the headline total, in the comparison, in the
next-dollar curve and in the export. Not just in one of them.
- [x] The headline shows what I actually owe in total, not one piece of it.
- [x] The Medicare cost is its own figure beside the headline, and it is obvious
which is which.

### It does not pretend to know the future or the market

- [x] I see no probability of anything. No chance of success, no odds, no
percentage likelihood.
- [x] There is no simulation of markets, no random trials, no projection of my
plan working out.
- [x] There is no multi-year projection, no lifetime total, and no figure for any
year other than the one I declared — apart from the earlier income year it asked
me for, which is mine and which it labels as mine.
- [x] I see no claim about how often this tool has been right before. No accuracy
figure, no track record, no error rate.
- [x] Nothing is described as optimal, recommended, or best.

### It reads properly and I can use it without a mouse

- [x] The first thing I see is a plain answer, not a wall of tables.
- [x] Every number has an explanation I can reach by hovering or by tabbing to it.
- [x] The detail — the bend points, the thresholds, the per-age table, the
surcharge bands, the sources — is one click away and clearly labelled, not gone.
- [x] I can tab through the whole page, including every unavailable item, and read
what each one says and what would fix it.
- [x] Nothing unavailable shows up as an empty box, a bare dash, or a zero.
- [x] If I am typing in a box and the page updates, the box does not vanish from
under me and my clicks keep working.
- [x] Switching between the simple and detailed views and back does not lose where
I was.
- [x] On my phone the benefit, claim-age and Medicare tables are readable and I am
not stuck scrolling sideways.

### My data stays mine

- [x] The page works with no internet connection and no account.
- [x] I can check the network activity and see that it made no requests at all,
even though it is now loading more sets of rules than before.
- [x] Nothing I typed appears in the address bar — including my earnings, my year
of birth, when I plan to claim, and my income from that earlier year.
- [x] It never asked me for a name, an address, a Social Security number, a
Medicare number, an account number, or any tax identifier.
- [x] Nothing saves or exports on its own. A file appears only when I ask for one.
- [x] The exported file leaves out my earnings, my birth year, my claim ages, my
benefit amount and my earlier-year income, and tells me what it left out.
- [x] There is a clear-everything action and it removes everything the tool listed
as stored, including all of the above.
- [x] Clearing this tool's data does not disturb anything else I use on this site.

### It is not on the site yet, and that is correct

- [x] This tool does not appear in the tool list, the site index, or the
navigation.
- [x] It does not appear in the market brief.
- [x] The rest of the site works exactly as it did before, including the portfolio
tools and everything the previous releases of this tool already did — property
tax, rentals, the sale of a property, state income tax and the federal return.
