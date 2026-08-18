# Feature 021 User Validation — Lifetime Tax Strategy Lab (Federal Slice 1)

Every item below starts CHECKED because it is what the feature is expected to do
once it ships. A checked box is not a record that anything was built, run or
verified — it is the baseline expectation written down in advance. You uncheck an
item when the behaviour is broken for you. An unchecked box is a reported
regression and blocks further work on this feature until it is fixed.

This is the acceptance walk you perform against the tool page opened directly
from a file, with no server and no account.

Most of this checklist is about what the tool **refuses to answer**. That is
deliberate. This first slice models one tax year, federal rules only, and four
kinds of income. Almost everything a real Roth conversion decision depends on —
your state, your Medicare premiums, your Social Security, the five-year clocks,
next year and every year after it — is not in here. A tool that hid that would
produce a number you could act on and should not. The test of this feature is
whether the missing half reads as a stated boundary rather than as a broken page.

The tool is an educational planning model. It is not tax advice, it does not
prepare or file anything, and it does not tell you what to do.

## Checklist

### It answers with almost nothing entered

- [x] I enter a filing status, one tax year, one income amount and whether I am taking the standard deduction. That is enough to get an answer.
- [x] I am not forced to fill in anything else before it will compute.
- [x] Everything I did not enter is listed as unavailable, each with a plain reason, and none of it stops the parts I did enter from working.
- [x] Nothing I left blank was quietly treated as zero.

### It tells me which rules it used, and where they came from

- [x] I can see exactly which tax year's federal rules it applied, and a link or citation to the official source they came from.
- [x] I can see the date those rules were published and the date they were retrieved.
- [x] I can see a list of federal things it does **not** handle, written out by name rather than left for me to notice.
- [x] Nothing anywhere claims this is a complete federal tax calculation.

### It refuses instead of guessing — this is the important part

- [x] I pick a tax year it does not have rules for. It says so and computes nothing for that year. It does not stretch last year's numbers forward.
- [x] I pick my state. Every state says unavailable. It does not give me an approximate state number, an average, or a zero.
- [x] I try to enter an income kind it does not support. It names that kind as unsupported rather than folding it into ordinary income.
- [x] Each of those three refusals reads differently and tells me what would make it available.
- [x] In every case the federal result I already had stays on screen and still makes sense.

### The federal number is right at the edges

- [x] I put my income just under a bracket edge, exactly on it, and just over it. The three answers differ the way the published brackets say they should.
- [x] I enter the same thing twice and get the same answer both times.
- [x] I add long-term capital gains. The tax on those gains changes when I change my ordinary income, even though the gain amount did not move.
- [x] Qualified dividends behave the same way as the long-term gains.
- [x] I enter municipal or other tax-exempt interest. It is not taxed, and it is still visibly recorded rather than dropped — with a note that its real consequences, for Social Security and Medicare, are not modelled here.
- [x] I can switch between standard and itemized, and it shows me which one it actually applied.
- [x] There is a line showing how income, deduction, taxable income and tax add up, and it balances.

### The next dollar

- [x] I get a curve showing what the next dollar of ordinary income costs me, and a second one for the next dollar of realized gain. Not one rate — a curve.
- [x] Where the curve steps up, it names the threshold that caused the step and where that threshold came from.
- [x] A cliff looks like a cliff. Nothing is smoothed into a ramp.
- [x] The curve tells me plainly that it is incomplete, and lists what is missing from it: the Social Security benefit taxation, the Medicare bands, the ACA credit, the investment income tax, and my state.
- [x] That missing list is not a footnote. It is part of the answer, and it is longer than the part it could compute.
- [x] The chart has a table underneath with the same numbers, so I can read it without the picture.

### The Roth conversion comparison

- [x] I pick a bracket to fill. It shows me two things and only two things: what I owe if I convert nothing, and what I owe if I convert up to that bracket.
- [x] It shows the conversion amount, both tax figures, and the difference between them.
- [x] It shows what the marginal cost actually is at the point I stopped filling — taken from the curve, not from the bracket's headline rate.
- [x] It lists everything it did not consider: my state, Medicare, the ACA credit, the five-year clocks, what this does to future required distributions, what happens to a surviving spouse, and the growth I give up by paying the tax now.
- [x] It never tells me which of the two is better.
- [x] There is no break-even year, no lifetime total, no ranking and no score anywhere on it.
- [x] If I did not say whether I would pay the tax from other money or withhold it from the conversion, it says that distinction is unavailable rather than picking one for me.

### Nothing here pretends to know the future

- [x] I see no probability of anything. No chance of success, no plan survival percentage, no odds.
- [x] I see no claim about how often this tool has been right before. No accuracy figure, no track record, no error rate.
- [x] Nothing is described as optimal, recommended, or best.

### It reads properly and I can use it without a mouse

- [x] The first thing I see is a plain answer, not a wall of tables.
- [x] Every number has an explanation I can reach by hovering or by tabbing to it.
- [x] The detail — brackets, rules, sources, the full curve — is one click away and clearly labelled, not gone.
- [x] I can tab through the whole page, including every unavailable item, and read what each one says.
- [x] Nothing unavailable shows up as an empty box, a bare dash, or a zero.
- [x] On my phone the tax tables are readable and I am not stuck scrolling sideways.

### My data stays mine

- [x] The page works with no internet connection and no account.
- [x] I can check the network activity and see that it made no requests at all, ever.
- [x] Nothing I typed appears in the address bar.
- [x] It never asked me for a name, an address, a Social Security number, an account number, or any tax identifier.
- [x] Nothing saves or exports on its own. A file appears only when I ask for one.
- [x] When I do export, it warns me the file has sensitive financial information in it.
- [x] The exported file has no identifiers in it, and it tells me what it left out.
- [x] There is a clear-everything action and it removes everything the tool listed as stored.
- [x] Clearing this tool's data does not disturb anything else I use on this site.

### It is not on the site yet, and that is correct

- [x] This tool does not appear in the tool list, the site index, or the navigation.
- [x] It does not appear in the market brief.
- [x] The rest of the site works exactly as it did before, including the portfolio tools.
