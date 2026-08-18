# Feature 022 User Validation — Federal Preferential Completion And State Income Tax

Every item below starts CHECKED because it is what the feature is expected to do
once it ships. A checked box is not a record that anything was built, run or
verified — it is the baseline expectation written down in advance. You uncheck an
item when the behaviour is broken for you. An unchecked box is a reported
regression and blocks further work on this feature until it is fixed.

This is the acceptance walk you perform against the tool page opened directly from
a file, with no server and no account.

The last release could not give you a federal number at all if you held a stock
that had gone up. This one can. It also knows about the two extra federal taxes
that switch on above certain income levels, and it knows about exactly two states
— California and Florida — chosen because they are about as different as two
states get. Every other state still says it does not know, and that is still the
correct answer rather than a gap.

Almost as important as what it now answers is what it still refuses. The tool is
an educational planning model. It is not tax advice, it does not prepare or file
anything, and it does not tell you what to do.

## Checklist

### It finally answers when I hold an investment

- [x] I enter some ordinary income and a long-term capital gain. I get a real
total instead of a message saying it cannot work it out.
- [x] Qualified dividends behave exactly the same as the long-term gain.
- [x] The gain is taxed on top of my ordinary income, not on its own, so raising
my ordinary income changes what the gain costs.
- [x] I put the gain just under a rate breakpoint, exactly on it, and just over
it. The three answers differ the way the published breakpoints say they should.

### It shows me where each number came from — and they are not all from one place

- [x] I open the detail on the capital-gain rate table. The dollar breakpoints and
the top rate cite **different** official documents, and both are shown.
- [x] I can click through to each cited document, and each citation tells me which
section to look at.
- [x] The one that came from somewhere unusual is marked as such, so I can see at
a glance which figure is the odd one out.
- [x] Nothing cites a press release or a summary page as the source of a number.
- [x] It tells me the collectibles, small-business-stock and depreciation-recapture
categories are not covered, rather than quietly taxing them at the ordinary rate.

### The two extra federal taxes

- [x] I see a separate line for the investment income tax and a separate line for
the extra Medicare tax. They are not merged into one figure.
- [x] Each one shows the income level where it switches on for my filing status.
- [x] I put my income just under, exactly on, and just over each of those levels.
The answers change the way they should.
- [x] It asks me how much of my ordinary income is investment income, and
separately how much is wages. If I do not tell it, it says so instead of guessing
zero.
- [x] If I tell it zero, it uses zero — and that reads differently from not having
told it.
- [x] My tax-exempt municipal interest is not counted as investment income for
this tax, and it is still shown as recorded.
- [x] When I add a Roth conversion, the investment income tax can go up but the
extra Medicare tax does not move. The tool says why.

### It asks where I live, and refuses honestly when it does not know

- [x] It asks which state I live in. If I do not answer, it says the state part is
unavailable — it does not show me zero.
- [x] I pick a state it does not have rules for. It says so by name and tells me
what would make it available.
- [x] I say I moved states partway through the year. That gets its own separate
message, different from the one above, because the state itself is supported and
the situation is not.
- [x] In every one of those cases my federal answer is still there and still makes
sense.
- [x] It never gives me an approximate state number, a national average, or a zero
standing in for "we don't know".

### Florida

- [x] I pick Florida. I get a zero — and it is clearly a real answer, with the
official source for why Florida has no personal income tax attached to it.
- [x] That zero looks and behaves differently from the "unavailable" message I get
for a state it has no rules for.
- [x] It is not a blank, not a dash, and not an empty box.
- [x] The combined total treats it as a real zero rather than skipping the state
part.

### California

- [x] I pick California with a long-term capital gain. California taxes the gain
at the same rates as my ordinary income — there is no special lower rate — and the
federal side still uses its lower rates.
- [x] California uses its own standard deduction, not the federal one.
- [x] The exemption relief is taken off the tax, not off my income, and I can see
both the before and after figures.
- [x] Above the very high income level there is an extra one-percent charge, and
the level where it starts is the same whether I file single or jointly. It is not
doubled for a couple.
- [x] The exemption relief does not reduce that extra charge.
- [x] If a California figure could not be sourced, that part says unavailable
rather than showing me a number someone remembered.

### Both together

- [x] I see one combined total, with the federal and state figures shown beside it.
- [x] Each of the three carries its own status.
- [x] If either side cannot be worked out, the combined figure says so rather than
showing me half a number.
- [x] If I itemize, it tells me plainly that it did not add my state tax to my
itemized deduction, and that it did not check whether I already had.
- [x] If the federal rules and the state rules are for different years, it refuses
outright and names both, rather than mixing them.

### The next dollar, across both

- [x] I get one curve showing what the next dollar costs me federally, at state
level, and in total.
- [x] Where the curve steps up, it names the threshold that caused it **and which
government it belongs to**.
- [x] A California bracket edge and a federal bracket edge both show up as sharp
steps in the right places, not as a smooth slope through the middle.
- [x] In Florida the state line is there and flat at zero, with the source
attached — not missing.
- [x] The curve still tells me plainly what is missing from it, and that list is
still long.
- [x] The chart has a table underneath with the same numbers, so I can read it
without the picture.

### Nothing here pretends to know the future

- [x] I see no probability of anything. No chance of success, no plan survival
percentage, no odds.
- [x] I see no claim about how often this tool has been right before. No accuracy
figure, no track record, no error rate.
- [x] Nothing is described as optimal, recommended, or best.
- [x] There is no break-even year, no lifetime total and no multi-year projection.

### It reads properly and I can use it without a mouse

- [x] The first thing I see is a plain answer, not a wall of tables.
- [x] Every number has an explanation I can reach by hovering or by tabbing to it.
- [x] The detail — brackets, rules, sources, the full curve — is one click away and
clearly labelled, not gone.
- [x] I can tab through the whole page, including every unavailable item and every
sourced zero, and read what each one says.
- [x] Nothing unavailable shows up as an empty box, a bare dash, or a zero.
- [x] On my phone the state and combined tables are readable and I am not stuck
scrolling sideways.

### My data stays mine

- [x] The page works with no internet connection and no account.
- [x] I can check the network activity and see that it made no requests at all,
even though it is now loading more than one set of tax rules.
- [x] Nothing I typed appears in the address bar — including which state I live in.
- [x] It never asked me for a name, an address, a Social Security number, an
account number, or any tax identifier.
- [x] Nothing saves or exports on its own. A file appears only when I ask for one.
- [x] The exported file leaves out my state, my income and my two new figures, and
tells me what it left out.
- [x] There is a clear-everything action and it removes everything the tool listed
as stored, including where I live.
- [x] Clearing this tool's data does not disturb anything else I use on this site.

### It is not on the site yet, and that is correct

- [x] This tool does not appear in the tool list, the site index, or the
navigation.
- [x] It does not appear in the market brief.
- [x] The rest of the site works exactly as it did before, including the portfolio
tools and everything the previous release of this tool already did.
