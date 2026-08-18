# Lifetime Tax & Spending Strategy Lab - Proposed Design

**Status:** PROPOSED (not yet built or registered)  
**Proposed tool id:** `lifetime-tax-strategy-lab`  
**Proposed group:** `Strategy & Validation`  
**Audience:** U.S. single adults, married households, surviving spouses, and families with dependents  
**Posture:** Educational planning model only. It does not provide tax, legal, Social Security, Medicare, or investment advice.

## Decision

Build one integrated household strategy lab instead of separate tax, Social Security, Medicare, and withdrawal calculators.

The interactions are the product. A Roth conversion can change federal and state taxes, Medicare premiums, capital-gain capacity, and later required distributions. A Social Security claim date changes taxable income, survivor income, withdrawals, and portfolio survival. A rental sale can change capital gains, depreciation recapture, state tax, Medicare premiums, and available spending.

The tool must compare complete multi-year household policies on identical economic paths. It must never optimize one tax in isolation.

## Admission Test

This proposal passes the Research Lab admission test because it improves household decision quality.

The differentiated result is not another retirement dashboard. It is an auditable comparison of complete strategies under the same tax rules, life events, and market paths. The comparison exposes where a strategy wins, where it fails, and which assumptions reverse the result.

## Competitive Analysis

Retrieved 2026-08-17 from each vendor's own public pages. Feature claims are the vendor's, not measured by this repository.

| Capability | ProjectionLab | Pralana | MaxiFi | Open Social Security | This proposal |
| --- | --- | --- | --- | --- | --- |
| Roth conversion optimization | yes | yes | yes | no | yes |
| Gain-harvest coordination | yes | not stated | not stated | no | yes |
| Effective marginal rate view | yes | not stated | not stated | no | **was missing** |
| IRMAA cliff targeting | yes | not stated | not stated | no | yes |
| ACA limit targeting | yes | not stated | not stated | no | **was deferred** |
| 72(t) / SoSEPP | yes | not stated | not stated | no | **was missing** |
| Federal and state tax detail | yes | yes, plus FICA | yes | no | yes, FICA **was missing** |
| Retirement date optimization | not stated | yes | not stated | no | **was missing** |
| Consumption smoothing | no | no | yes, core method | no | **was missing** |
| Life insurance contingency | not stated | yes | yes | no | **was missing** |
| Monte Carlo and historical paths | yes | yes | yes | no | yes |
| Rental property | yes | yes | not stated | no | yes |
| Estate or legacy modeling | yes | not stated | yes | no | deferred |
| Plan versus actual tracking | yes | not stated | not stated | no | deferred |
| Spousal and survivor claiming | yes | yes | yes | yes | yes |
| PIA from earnings history | no | no | no | via SSA.tools | deferred |
| No account linking | yes | yes | yes | yes | yes |
| Runs with no server or account | no | Gold and Bronze only | no | yes | yes |
| Open source and inspectable | no | no | no | yes | yes |
| Publishes its own error rate | no | no | no | no | yes |

### What the field already does well

ProjectionLab is the closest competitor. It ships a coordinated optimizer over conversions, gain harvesting, and drawdown order, targeting federal brackets, IRMAA cliffs, and ACA limits, and it exposes effective tax brackets directly.

Pralana refuses simplifying tax assumptions, computes federal, state, and FICA tax, and compares three scenarios side by side. It optimizes retirement start age, not just claim age.

MaxiFi inverts the question. Instead of asking the user to guess spending and testing survival, it computes the affordable annual spending that sustains a living standard for life.

Open Social Security is the reference implementation for claim timing. It is free, MIT-licensed, and takes a primary insurance amount rather than an earnings record. SSA.tools computes that amount in-browser from a pasted earnings history.

### Where this proposal can actually win

Three gaps are real and defensible.

**Published error rate.** No competitor publishes how often its own guidance was later invalidated. This repository's scorecard convention is the one differentiator none of them can copy without acquiring a reason not to.

**Refusal instead of a plausible number.** Every competitor renders a complete-looking plan. This design names an unsupported state, an unsupported jurisdiction, and a missing basis rather than substituting an average.

**Runs from a file with no account.** Only Open Social Security and Pralana's downloadable tiers match this, and neither covers the full household model.

Tool count is not the edge. Honesty about what the model cannot compute is the edge.

## Primary Question

> Which tested household policy best funds the selected spending plan after taxes, benefits, health premiums, property costs, and market uncertainty?

The tool must say **best among tested policies**. It must never claim a global optimum.

## User Outcomes

The user should be able to:

1. Compare annual Roth conversion amounts and conversion windows.
2. Compare Social Security claim months for one or two adults.
3. See spousal and survivor consequences instead of optimizing each adult separately.
4. Compare taxable brokerage, traditional retirement, Roth, HSA, cash, and T-bill usage.
5. Test long-term capital-gain harvesting against ordinary-income and Medicare thresholds.
6. Compare withdrawal orders, dynamic guardrails, and reserve policies.
7. Model federal taxes with a dated, source-qualified rule pack.
8. Model a supported state with its own dated rule pack.
9. Keep unsupported state behavior unavailable or user-assumed.
10. Model property tax, a primary home, long-term rentals, and vacation rentals.
11. Compare stock, Treasury bill, Treasury bond, TIPS, municipal bond, and cash sleeves.
12. Stress the plan across inflation, recession, weak-return, strong-return, and rate scenarios.
13. See annual spending, tax, premium, property, account, and benefit ledgers.
14. See lifetime results and the exact assumptions that drive them.
15. Export a private local scenario without publishing personal values.

## Non-Goals

The first release must not:

- prepare or file a tax return
- submit a Social Security or Medicare application
- predict an SSA or Medicare appeal decision
- guarantee a Medicare refund or premium adjustment
- recommend an individual security
- execute a conversion, trade, withdrawal, or benefit claim
- infer a tax rule for an unsupported jurisdiction
- guess a missing tax basis, property value, benefit estimate, or account balance
- request names, Social Security numbers, account numbers, property addresses, or tax identifiers
- publish household data to the Market Brief or any network endpoint

## Product Shape

### Simple View: High-Level Plan Model

Simple is the default. It guides the user through household shape, goals, balances, income, spending, and four strategy levers.

Simple runs a fast `QuickProjection`. It compares the current-policy baseline with a small set of curated strategies. It uses one deterministic base path and a fixed core stress set. It does not run a candidate grid or a stochastic path simulation.

The core stress set covers an early bear market, persistent inflation, and a survivor or longevity shock. Simple reports how many named stresses remain funded. It must not describe that count as a probability.

```text
+--------------------------------------------------------------------------+
| Lifetime Tax & Spending Strategy Lab                 Simple | Power      |
+--------------------------------------------------------------------------+
| HIGH-LEVEL PLAN PREVIEW                                                 |
| Tax-smoothing supports the base plan and 2 of 3 named stress cases.      |
| It converts through 2031, claims Adult A at 70, and keeps 2 years cash.  |
| This is a quick projection. Open Power for a full path simulation.       |
+--------------------------------------------------------------------------+
| Conversion target  [22% bracket v]  Claim A [70 v]  Claim B [67 v]      |
| Reserve years      [ 2.0 --------]   Spending rule [Guardrails v]        |
+--------------------------------------------------------------------------+
| WHY IT LOOKS STRONGER           | WHAT CAN BREAK IT                       |
| + lower future RMD pressure     | - early death reverses claim value     |
| + fewer high-IRMAA years        | - poor early returns deplete taxable   |
| + survivor taxes improve        | - lower future rates cut its value     |
+--------------------------------------------------------------------------+
| NEXT DECISION WINDOWS                                                   |
| 2027 conversion range | 2028 gain-harvest room | 2030 Medicare lookback |
+--------------------------------------------------------------------------+
```

Simple offers four curated strategy presets:

- current policy baseline
- tax smoothing
- survivor protection
- liquidity first

The default strategy controls are:

- Roth conversion policy
- Social Security claim month for each eligible adult
- cash and T-bill reserve years
- spending policy

Each control recomputes the high-level projection from the same annual ledger engine. A control change must not fetch data.

Simple shows only decision-level outputs:

- essential and planned spending status
- lifetime tax and premium difference from baseline
- conversion and gain-harvest window
- Social Security claim posture
- reserve and account-use posture
- base-case ending assets
- named stress cases passed
- strongest tradeoff and reversal condition

Simple hides candidate grids, path percentiles, rule traces, tax forms, and account-level annual ledgers. It links each hidden detail to its owning Power section.

### Power View: Deep Simulation And Modeling

Power is optional deep analysis. It exposes the full model configuration, executes multi-path simulation, and audits every result.

Power adds controls for path family, return assumptions, inflation, interest rates, rental shocks, longevity, mortality source, tax-law scenario, path count, block length, seed, candidate ranges, and ranking priorities.

The user starts the heavy calculation with a clear **Run deep simulation** command. Entering Power does not run it automatically. The command performs no network request.

1. **Household Timeline** shows ages, filing status, dependents, work, retirement, benefits, Medicare, property events, and deaths.
2. **Tax Map** shows federal, state, capital-gain, net-investment, payroll, and property taxes by year.
3. **Benefits & Health** shows Social Security, survivor benefits, Medicare premiums, IRMAA lookback years, and verified adjustments.
4. **Accounts & Withdrawals** shows opening balance, growth, income, conversion, withdrawal, tax basis, and closing balance by wrapper.
5. **Property** shows primary-home costs, rental operations, depreciation, sale events, and missing jurisdiction rules.
6. **Market & Economy** shows the selected return, inflation, rate, and rental scenarios.
7. **Strategy Compare** shows baseline and candidate policies on identical paths.
8. **Sensitivity** shows claim-age, conversion, return, inflation, longevity, and state-law reversal points.
9. **Rule Ledger** shows every rule-pack version, source, effective year, and unsupported item.
10. **Privacy & Export** shows local data categories, clear actions, and publication exclusions.

### One Kernel, Two Analysis Depths

| Concern | Simple | Power |
| --- | --- | --- |
| Purpose | Fast high-level plan comparison | Deep simulation and audit |
| Policies | Baseline plus curated presets | User-defined ranges and candidate search |
| Economic paths | One base path plus three named stresses | Deterministic, bootstrap, and regime path cohorts |
| Longevity | Selected ages and one survivor stress | Configurable joint longevity draws |
| Output | Direction, tradeoffs, windows, and stress count | Distributions, Pareto set, ledgers, sensitivity, and trace |
| Calculation | Automatic and synchronous | Explicit user-run computation |
| Language | Projection and named stresses | Simulation frequencies and path percentiles |

Both depths must use the same rule packs, timeline, annual ledger, policy executor, and reconciliation equations. Simple is not a second tax calculator.

Every result carries an input hash and analysis depth. The hash covers the household plan, every strategy control, the resolved rule-pack versions, the economic assumptions, and the market-data snapshot identity. A completed Power simulation remains current only while its input hash matches the active inputs. Any changed input marks it `stale-inputs` until the user runs it again. A refreshed market snapshot is an input change, not a free update.

Simple may summarize a current Power simulation in a clearly labeled secondary line. Without a matching Power run, Simple must not display path probabilities, percentiles, or claims of simulated success.

## Capability Foundation

### Foundation Contracts

| Contract | Responsibility | Consumers |
| --- | --- | --- |
| `HouseholdPlan/v1` | Holds private household facts, assumptions, goals, and dated events. | timeline, tax, benefit, property, and simulation engines |
| `RulePack/v1` | Defines one jurisdiction or program for specific effective years. | federal, state, Social Security, Medicare, and property adapters |
| `AccountLedger/v1` | Tracks tax wrapper, basis, holdings by sleeve, flows, and year-end state. | withdrawal, conversion, gain-harvest, and simulation engines |
| `PolicyCandidate/v1` | Defines a complete tested strategy. | deterministic projection, path simulation, and comparison |
| `EconomicPath/v1` | Defines one reproducible market, inflation, rate, and rental path. | every policy candidate in one comparison cohort |
| `AnnualHouseholdLedger/v1` | Reconciles income, spending, taxes, premiums, property, and accounts. | Simple, Power, export, and comparison |
| `AnalysisRequest/v1` | Selects quick or deep analysis and binds every input through one content hash. | result orchestration and stale detection |
| `QuickProjection/v1` | Holds the baseline, curated strategies, base path, and named stress outcomes. | Simple and Power summary |
| `DeepSimulation/v1` | Holds path cohort, candidate search, distributions, Pareto set, and audit metadata. | Power and optional Simple summary |
| `HouseholdStrategyResult/v1` | Holds one quick result and an optional hash-matching deep result. | every renderer and local export |
| `PolicyComparison/v1` | Compares candidates under common paths and constraints. | Simple verdict, Power frontier, and sensitivity |

### Foundation-Owned Behavior

1. Validate all private inputs before running a projection.
2. Resolve every rule by jurisdiction, program, effective year, and version.
3. Keep unsupported rules unavailable instead of substituting a national average.
4. Apply events in one documented order within each month and tax year.
5. Reconcile every dollar from opening balances through closing balances.
6. Run every candidate on identical economic paths and longevity draws.
7. Run Quick Projection automatically without invoking the deep candidate search.
8. Run Deep Simulation only after explicit user action.
9. Mark a deep result stale when its input hash differs from the active plan.
10. Preserve full precision internally and disclose display rounding.
11. Classify every displayed value as observed fact, user assumption, model estimate, or unavailable.
12. Preserve missing inputs as missing. Never convert them to zero.
13. Produce one immutable result envelope for Simple, Power, export, and comparison.
14. Keep all household values inside the local private workspace.
15. Publish only a permanent local-only public read with no household facts.

### Extension Points

| Extension | Required behavior |
| --- | --- |
| Federal tax pack | Supplies dated federal calculations and official sources. |
| State tax pack | Supplies dated state calculations and names every unsupported feature. |
| Property jurisdiction pack | Supplies assessment, exemption, deferral, and reassessment rules. |
| Benefit adapter | Supplies Social Security or Medicare program rules by effective year. |
| Economic scenario adapter | Supplies reproducible return, inflation, rate, and rental assumptions. |
| Strategy policy | Supplies a complete conversion, claim, withdrawal, reserve, and rebalancing policy. |

## Reuse Boundaries

### Portfolio Survival & Allocation Lab

Reuse the existing private workspace, cash-need authority, reproducible bootstrap paths, and portfolio survival definitions. Do not create a second holdings store or another path generator.

The tax tool adds tax lots, account wrappers, benefits, rule packs, and annual tax settlement. The existing portfolio engine remains the owner of portfolio path generation and survival math.

### Place-Based Rental Market Capability

Consume a normalized pre-tax rental result when one is available locally. Deep-link to the owning rental tool for market evidence and operating assumptions.

The tax tool owns depreciation, passive activity, taxable income, sale tax, and household cash-flow effects. It must not copy rental-market equations or research.

### Bond Regime Lab

Reuse source-qualified Treasury curve observations and generic sleeve definitions where contracts permit. Keep future returns as explicit model assumptions.

The tax tool must not turn a current curve observation into an unsupported long-horizon forecast.

## Household Model

### Supported Household Shapes

- one adult filing single
- one adult filing head of household when a rule pack supports it
- two adults filing jointly
- two adults filing separately when a rule pack supports it
- surviving spouse and later single transitions
- dependents with dated eligibility windows

The model supports one or two adults. It does not model a larger adult household in the first release.

### Private Inputs

#### Household

- birth month and year for each adult
- filing status timeline
- state residency timeline
- dependent count and eligibility dates
- employment and retirement dates
- planning horizon and longevity scenarios
- survivor spending adjustment

#### Income

- wages and self-employment income
- pensions and annuities
- Social Security estimates
- interest, ordinary dividends, qualified dividends, and capital gains
- long-term and vacation-rental income
- other recurring or one-time income

#### Spending

- baseline annual spending
- inflation treatment by spending category
- health and long-term-care spending
- debt service
- planned large purchases, gifts, education, and travel
- survivor spending policy

#### Accounts

- taxable brokerage
- traditional IRA and employer plans
- Roth IRA and Roth employer plans
- HSA
- cash and Treasury bills
- 529 or education accounts when supported
- inherited accounts with dated distribution rules

Each account records only the detail required by the model. The tool must not request a custodian, account number, or owner name.

#### Taxable Lots

Gain harvesting needs holding period and basis evidence. The user may provide anonymous aggregate lots with value, basis, acquisition date, and asset sleeve.

If the required lot data is absent, gain harvesting remains unavailable. The tool must not estimate basis from unrealized gain percentages.

#### Property

- primary-home market value and tax basis
- actual property tax bill and assessment year
- mortgage balance, rate, term, and interest treatment
- jurisdiction rule-pack selection
- rental classification and personal-use days
- rent, vacancy, fees, operating costs, reserves, and capital expenses
- depreciable basis, placed-in-service date, and prior depreciation
- sale, exchange, or conversion events

## Time Model

The engine uses monthly events and annual tax settlement.

Monthly events support claim months, Medicare enrollment, work transitions, rent, spending, and account flows. Annual settlement supports tax brackets, deductions, credits, gains, losses, RMDs, and carryforwards.

The default horizon runs through the younger adult's age 100. The user can select a shorter horizon. The implementation should cap the horizon at 70 years, which still lets a household in its thirties project to age 100. A cap below that would silently truncate the default for younger users.

The engine must document event ordering. Steps 1 through 7 repeat every month. Steps 8 through 11 run once at each tax-year end.

1. apply beginning-of-month life and eligibility events
2. receive earned, pension, rental, and benefit income
3. determine the month's cash need from spending, premiums, debt service, and property costs
4. satisfy any required minimum distribution still outstanding for the year
5. execute the candidate policy's withdrawals, conversions, harvesting, and rebalancing
6. pay the month's cash need
7. apply market returns and income distributions
8. settle any remaining required distribution and unfunded cash need
9. calculate annual federal, state, and property taxes
10. settle taxes from the declared funding source
11. close account and carryforward ledgers

Two ordering rules are load-bearing.

Funding precedes payment. A month must never pay spending from money the policy has not yet withdrawn, because that hides an overdraft the no-negative-balance constraint is supposed to catch.

A required minimum distribution precedes a Roth conversion in the same year. Distributed dollars that satisfy that requirement are not eligible for conversion, so an engine that converts first reports a tax result the household could not have obtained.

Tests must pin this order. Changing it changes results and requires a version change.

## Federal Tax Capability

The federal adapter should support dated rules for:

- ordinary-income brackets
- payroll and self-employment tax
- standard and itemized deductions
- qualified business income deduction, including the rental real-estate safe harbor
- qualified dividends and long-term capital-gain stacking
- taxable Social Security benefits
- tax-exempt interest added back in the taxable-benefit calculation
- Roth conversions
- traditional-account distributions and required minimum distributions
- qualified charitable distributions
- capital-loss carryforwards
- basis step-up or adjustment at death under the governing rule pack
- net investment income tax
- additional Medicare tax when supported
- early-distribution penalties and explicit exceptions when supported
- HSA contributions, distributions, and delayed reimbursements when supported
- charitable deductions and appreciated-property gifts when supported
- dependent and family credits when supported
- alternative minimum tax when supported
- estimated-tax and withholding safe-harbor checks when supported

Tax-exempt municipal interest is not invisible to this model. It enters the Social Security taxable-benefit calculation and the Medicare income definition. A model that treats tax-exempt as untracked understates both, and the error grows exactly where a user expects a municipal sleeve to help.

The qualified business income deduction is the clearest reason this design uses dated rule packs rather than one current-law table. The IRS overview page retrieved on 2026-08-17 states the deduction applies to tax years beginning after 2017 and ending on or before 31 December 2025. Whether later legislation extended it is a question the rule pack must answer with a source, never an assumption carried forward by the engine.

An unsupported federal feature must remain named and unavailable. The engine must not silently omit it from a complete-tax label.

## Effective Marginal Rate Engine

Statutory brackets do not describe what a household actually pays on the next dollar. The decision-relevant number is the effective marginal rate, which includes every threshold the extra dollar crosses.

The engine must compute, for each year, the marginal cost of an additional dollar of ordinary income and of an additional dollar of realized long-term gain, including:

- the statutory ordinary or capital-gain bracket
- additional benefit becoming taxable, which can lift the effective rate well above the statutory bracket
- a Medicare adjustment band boundary, which is a cliff rather than a phase-in
- a premium-tax-credit reduction or loss before Medicare eligibility
- net investment income tax thresholds
- state bracket and exclusion boundaries
- deduction, exemption, and credit phase-outs

The output is a per-year curve, not a single rate. Simple shows the next decision window and the rate at its edge. Power shows the full curve with each contributing threshold labeled by name and rule-pack source.

This is the single most decision-relevant output in the tool. A conversion or harvest recommendation that cites only a statutory bracket is incomplete, because the cliff it is trying to avoid is invisible in that number.

A cliff must render as a cliff. Smoothing a step into a gradient would hide the exact quantity the user is steering around.

## Early-Access And Pre-Medicare Capability

Households retiring before 59½ and before Medicare eligibility face two constraints that dominate their conversion and withdrawal decisions. Both must be core.

### Substantially Equal Periodic Payments

A series of substantially equal periodic payments is the mechanism for reaching traditional retirement funds before 59½ without the additional early-distribution tax. Verified against IRS guidance retrieved 2026-08-17:

- the additional tax under section 72(t) is 10 percent on the includible amount before age 59½
- the exception requires payments over life expectancy under section 72(t)(2)(A)(iv)
- three methods are recognized: required minimum distribution, fixed amortization, and fixed annuitization
- the selected interest rate may not exceed the greater of 5 percent or 120 percent of the federal mid-term rate for either of the two months preceding the first payment
- the series must continue until the later of the fifth anniversary of the first payment and age 59½
- a modification triggers the 10 percent tax on the year's distributions plus a recapture tax for prior years plus interest
- one change from a fixed method to the required minimum distribution method is permitted
- each series belongs to one account, and balances cannot be aggregated across accounts

The lock-in is the modeling point. A series is a multi-year commitment that removes flexibility exactly when a market decline would otherwise call for a different withdrawal. The engine must model the commitment and the recapture exposure, not merely the first year's cash.

### Premium Tax Credit Before Medicare

For a household buying Marketplace coverage before Medicare eligibility, the premium tax credit is usually the binding constraint on a Roth conversion. A conversion that raises household income can reduce or eliminate the credit, and that loss can exceed the conversion's tax benefit.

The rule pack must carry the credit calculation, the household income definition, the applicable federal poverty guideline, and the eligibility boundary for each supported year. The IRS overview retrieved 2026-08-17 records that the 400 percent federal-poverty-line limit was temporarily suspended for 2021 and 2022, which is precisely why this cannot be a fixed constant in code.

Where the pack does not support the year, the credit stays unavailable and any conversion recommendation for a pre-Medicare year must say that its largest constraint was not modeled.

## State Tax Capability

State taxes require versioned adapters. A generic effective-rate fallback is not a state tax calculation.

Each state pack should declare:

- supported tax years
- filing statuses
- ordinary-income treatment
- capital-gain treatment
- Social Security and pension treatment
- deductions, exemptions, and credits
- retirement-income exclusions
- net-investment or surtax treatment
- rental-income treatment
- loss and carryforward treatment
- residency and part-year support
- official source records
- unsupported rules and their result consequences

The first implementation should ship federal rules plus one owner-selected state. Other states should display `Unavailable` until their pack exists.

The architecture must permit a state move on a dated household timeline. A move comparison must include residency uncertainty and cannot imply that taxes alone determine domicile.

## Social Security Capability

### Inputs

Use a user-entered benefit estimate from an official Social Security statement or calculator. Record its estimate date and assumed claim age.

The tool must not reconstruct a full earnings record from current salary. It must not request a Social Security number.

### Claim Search

Test eligible claim months for each adult. The candidate set should include every month from first eligibility through the delayed-credit ceiling.

For two adults, compare joint strategies instead of selecting each adult's age independently. Include worker, spousal, family, and survivor paths only when the selected rule pack supports them.

### Required Effects

- early-claim reductions
- delayed retirement credits
- cost-of-living assumptions
- earnings-test effects before full retirement age when applicable
- family and spousal benefits when supported
- survivor-benefit transitions
- taxation of benefits
- Medicare enrollment timing as a separate decision
- death-month and survivor filing-status transitions

The result should report break-even ages as model estimates. It should not use break-even age as the only objective.

## Medicare Capability

The Medicare adapter should model:

- enrollment eligibility and dates
- Part B and Part D base premium assumptions
- income-related monthly adjustment amounts by dated rule pack
- the modified adjusted gross income definition, including tax-exempt interest
- the applicable income lookback year
- household filing-status changes
- late-enrollment costs when supported
- premium withholding from Social Security
- employer or retiree reimbursements when explicitly entered
- verified premium adjustments and refunds

### Refund And Adjustment Contract

The tool must separate three states:

1. **verified adjustment** from an official notice
2. **pending appeal scenario** entered by the user
3. **unavailable outcome** when no decision exists

An SSA-44 or similar life-changing-event scenario may estimate cash flow under approval and denial branches. It must never record the estimated refund as observed or guaranteed.

Every Medicare adjustment must include amount, months, program, status, notice date, and source type. Missing evidence leaves the adjustment unavailable.

## Roth Conversion Capability

The conversion engine should compare:

- no conversion
- fixed annual amount
- fill a selected ordinary-income bracket
- stop before a selected Medicare threshold
- stop before a selected capital-gain threshold interaction
- convert during a dated low-income window
- dynamic conversions based on account balance or future RMD pressure

Each conversion policy must disclose:

- conversion amount by year
- federal and state marginal cost
- capital-gain capacity displaced
- Medicare lookback effect
- tax funding source
- lost portfolio growth on taxes paid
- later distribution and survivor effects
- the Roth five-year clocks that govern when converted amounts and earnings become withdrawable without tax or penalty
- break-even year and reversal conditions

The model must distinguish taxes paid from outside funds and taxes withheld from the converted amount.

A conversion recommendation for a household under 59½ must state the five-year clock consequence. Recommending a conversion whose proceeds the household cannot reach when it needs them is a defect, not a tax optimization.

## Capital-Gain Harvesting Capability

The engine should compare:

- no harvesting
- harvest gains through a selected long-term capital-gain band
- harvest a fixed amount
- coordinate gains with Roth conversions
- harvest losses before gains when eligible lots exist
- avoid wash-sale conclusions unless a separate supported contract can prove them

Gain harvesting must use anonymous tax lots. It must apply holding-period and basis evidence. It must preserve future basis changes and later sale consequences.

The tool must not determine that two securities are substantially identical. The existing portfolio capability already treats that as a legal and tax determination.

## Accumulation Capability

A household that is still working needs the contribution side modeled, not only the withdrawal side. Without it the tool answers retirement questions for people who have already retired, which does not match a product aimed at singles and families.

The engine should model:

- elective deferrals against the governing annual limit
- the traditional versus Roth deferral choice, which is the accumulation-stage mirror of the conversion decision
- employer match and its vesting
- catch-up contributions at the ages the rule pack defines
- HSA contributions and the delayed-reimbursement strategy
- taxable-account saving once tax-advantaged space is exhausted
- non-deductible contributions and the pro-rata rule that governs their later conversion
- self-employed retirement vehicles when a rule pack supports them
- education funding when a rule pack supports it

The pro-rata rule matters more than its length here suggests. A household with existing pre-tax balances cannot convert a non-deductible contribution in isolation, and a model that ignores that produces a conversion result the household cannot reproduce.

## Account Usage And Withdrawal Policies

Candidate policies should support:

- taxable first, then traditional, then Roth
- proportional withdrawals across wrappers
- traditional withdrawals through a selected bracket
- Roth conversions plus taxable spending
- RMD first with configurable destination for excess cash
- a substantially equal periodic payment series before age 59½
- HSA reimbursement for eligible prior expenses when supported
- qualified charitable distributions when supported
- preserve Roth for survivor or estate goals
- dynamic withdrawal guardrails
- fixed real spending
- floor-and-discretionary spending

The engine must test the whole policy. It must not present one withdrawal order as universally optimal.

## Investment And Economy Model

### Asset Sleeves

The first model should support:

- U.S. stocks
- international stocks
- Treasury bills and cash
- short, intermediate, and long Treasuries
- TIPS
- municipal bonds
- investment-grade corporate bonds
- high-yield bonds
- primary-home equity
- long-term rental property
- vacation-rental property

Individual security selection remains outside scope.

### Path Families

Offer three explicit model families:

1. **Deterministic plan** uses user-entered annual assumptions.
2. **Historical block bootstrap** reuses the portfolio path engine and preserves return sequences.
3. **Regime stress** uses named economic scenarios with explicit return, inflation, rate, and rental assumptions.

Named stress scenarios should include:

- baseline
- early retirement bear market
- persistent inflation
- recession and rate cuts
- higher-for-longer rates
- strong productivity and equity returns
- rental vacancy and repair shock
- one spouse dies early
- one spouse survives to an advanced age

### Common-Path Comparison

Every candidate must run on the same path IDs, seeds, mortality draws, inflation draws, and property shocks. This common-random-number rule reduces comparison noise.

The result must show path count, seed, block policy, return source, observation period, and every parameter assumption.

### Tax-Aware Returns

Return components must remain separate:

- price return
- qualified dividends
- ordinary dividends or interest
- realized gains caused by the policy
- turnover and realized-gain assumptions
- tax-exempt municipal interest
- rental income and appreciation

A total-return series alone cannot support a tax projection. If components are unavailable, the tax-aware result must declare the approximation.

## Property Tax And Rental Capability

### Primary Home

Model:

- actual property tax bill
- assessed value and assessment year
- annual assessment growth assumption
- homestead, senior, veteran, disability, or deferral treatment when supported
- mortgage interest and itemization interaction
- sale event and home-sale exclusion when supported
- move, purchase, and reassessment events

The tool must not estimate a property tax rate from a state average. It should prefer the user's observed bill and a local jurisdiction pack.

### Long-Term Rental

Model:

- rent and vacancy
- operating expenses and reserves
- mortgage interest
- depreciation
- passive income and loss treatment
- suspended losses
- capital improvements
- sale gain and depreciation recapture
- state and local income taxes
- property taxes

### Vacation Rental

Add:

- personal-use days
- average stay and service posture when relevant
- platform and management fees
- lodging and occupancy taxes when supported
- local permits and fixed fees as explicit cash costs
- short-term-rental tax treatment only when a dated rule supports it

The tool should consume market assumptions from the place-based rental capability. It should not copy that capability's research or demand model.

### Sale And Exchange

The first release may model a taxable sale. A 1031 exchange requires a separate supported rule contract and should remain unavailable until implemented.

## Additional Strategies

The architecture should admit these strategies after the core engine is certified. An item named as supported in a capability section above is already in scope and is not repeated here.

- donor-advised funds and appreciated-property gifts
- bunching itemized deductions
- net unrealized appreciation on employer stock
- inherited-account distribution windows
- education credits and 529 funding
- pension lump-sum versus annuity comparison
- life insurance sizing as an optimized lever rather than an entered holding
- charitable remainder strategies
- primary-home downsizing
- converting a property between rental and personal use
- relocation comparison across two supported state packs
- estate and gift-tax projections
- plan-versus-actual tracking against earlier projections

These items must not appear as supported until their rule contracts and tests exist.

Tax-loss harvesting, qualified charitable distributions, HSA reimbursement, a taxable rental sale, hypothetical tax-law scenarios, the premium tax credit before Medicare, periodic payment series, and the effective marginal rate curve are core. Each is named in a capability section above and belongs in the first release.

## Strategy Search

Strategy search belongs to Power. Simple compares only the baseline and curated presets.

### Simple Preset Comparison

Each curated preset must define a complete policy. A preset may change only declared strategy fields. It cannot change income, spending, market assumptions, tax rules, or longevity assumptions to improve its result.

Simple runs each preset on the same base path and named stress cases. It reports the result as a high-level projection, not an optimized recommendation.

### Candidate Definition

A `PolicyCandidate` must define all material choices:

- retirement month for each adult
- Social Security claim month for each adult
- contribution and deferral policy while working
- Roth conversion policy
- capital-gain harvesting policy
- early-access policy, including any periodic payment series
- withdrawal order
- spending policy
- cash and T-bill reserve target
- asset allocation and account location
- rebalancing policy
- RMD and QCD policy
- property hold or sale events
- survivor protection policy, including any insurance the household already holds
- tax funding source

A partial policy cannot compete with a complete policy.

### Search Method

Power uses a bounded grid with deterministic refinement.

1. Generate policy combinations from user-selected ranges.
2. Reject candidates that violate hard constraints.
3. Run deterministic projections for every remaining candidate.
4. Keep a transparent Pareto set.
5. Run stochastic paths on the Pareto set.
6. Refine near leading candidates without changing the path cohort.
7. Report the candidate count and every pruning rule.

The implementation should expose a tested candidate budget. It must not increase that budget to silence a performance failure. Simple does not consume this budget.

## Objective And Ranking

Do not collapse the plan into one opaque score.

### Hard Constraints

- annual essential spending floor
- minimum cash reserve
- no negative account balance
- required tax and premium payments
- required distribution compliance
- user-selected minimum plan-survival threshold

The survival-threshold constraint applies to deep analysis only, because it is a path frequency. Simple applies the spending floor, reserve, balance, payment, and distribution constraints against the base path and each named stress case.

### Primary Outcomes

- probability that essential spending is fully funded
- probability that total planned spending is fully funded
- maximum sustainable spending, solved as the inverse question
- after-tax lifetime spending
- present value of federal and state taxes
- present value of Medicare premiums
- years in each Medicare premium band
- after-tax terminal estate by percentile
- survivor shortfall probability
- worst tested five-year spending shortfall
- conversion break-even year
- Social Security lifetime and survivor value by longevity scenario

### Pareto Ranking

Show candidates that are not dominated across spending, survival, taxes, premiums, and estate value. Let the user select the priority order.

The default priority should be:

1. satisfy essential spending
2. reduce survivor shortfall
3. satisfy total planned spending
4. improve after-tax terminal value
5. reduce taxes and premiums among otherwise comparable plans

Minimizing tax is not the top objective. A plan that pays less tax by spending less or dying with less wealth is not automatically better.

### Maximum Sustainable Spending

The tool should also answer the inverse question. Rather than only testing whether an entered spending level survives, it should solve for the highest constant real spending that satisfies every hard constraint under the selected paths.

This matters because an entered spending number is usually a guess. Reporting the affordable level turns a pass-or-fail verdict into an actionable quantity, and it exposes households that are underspending as clearly as those that are overspending.

The solved figure is a model output under stated assumptions. It is never a recommendation to spend that amount.

## Result Explanations

Every leading policy should include:

- why it leads
- where it pays more tax
- where it pays less tax
- which account funds each major period
- which years create Medicare effects
- the Social Security and survivor tradeoff
- the assumptions most likely to reverse the result
- the closest competing policy
- the decision windows that require action
- which result fields remain unavailable

The tool should generate a year-by-year difference ledger between any two policies. It should not rely on a single lifetime total.

## Provenance And Rule Packs

### Required Rule-Pack Fields

```text
id
program
jurisdiction
version
effectiveTaxYears
publishedAt
retrievedAt
sourceRecords[]
supportedFeatures[]
unsupportedFeatures[]
indexingRules[]
calculationOrder
roundingPolicy
expiryPolicy
contentSha256
```

### Rule Status

Every future year must use one explicit status:

- `enacted-current-law`
- `enacted-scheduled-law`
- `user-hypothetical-law`
- `unavailable`

The tool must never extend current brackets or thresholds into future years without a declared indexing rule. Fixed thresholds must remain fixed unless law changes them.

### Source Authority

| Domain | Preferred authority |
| --- | --- |
| Federal income tax | Internal Revenue Service publications, forms, instructions, and revenue procedures |
| IRA distributions and RMDs | IRS Publication 590-B and current IRS retirement-plan guidance |
| Social Security taxation | IRS Publication 915 |
| Capital gains and investment income | IRS Publication 550 and current form instructions |
| Residential rental property | IRS Publication 527 and current form instructions |
| Social Security claiming | Social Security Administration retirement, family, and survivor guidance |
| Medicare premiums and adjustments | Medicare.gov, CMS annual publications, SSA notices, and SSA appeal forms |
| Treasury rates | U.S. Department of the Treasury daily rate publications |
| State income tax | The selected state's tax authority |
| Property tax | The selected assessor, treasurer, and enacted local rules |

Secondary summaries may help discovery. They cannot supply a rule-pack value when a primary source is available.

## Privacy Boundary

This tool handles private household data and must use the portfolio capability's local privacy model.

### Required Rules

1. Keep household state in a closed local namespace.
2. Send no household value through a URL, request body, referrer, console, or service worker.
3. Publish no household value to `rlData`, Market Brief, history, or `_site` artifacts.
4. Store no names, Social Security numbers, account numbers, tax identifiers, or property addresses.
5. Make persistence opt-in and visible.
6. Provide clear-current-scenario and clear-all-private-data actions.
7. Keep the public tool read permanently unavailable and local-only.
8. Sanitize exports and list every omitted private field.
9. Require explicit user action for a private local export.
10. Never include sample personal data that resembles a real household.

The implementation should reuse the portfolio workspace revision and clear contracts. It must not create a second unenumerated personal store.

## Local Import And Export

Support a versioned private JSON file through an explicit file picker and download action.

The export should contain no names, addresses, account numbers, tax identifiers, credentials, or browser storage keys. It may contain ages, balances, anonymous lots, income, spending, rule-pack IDs, policies, and results because the user explicitly controls the file.

The tool must warn that the file contains sensitive financial information. It must never write the file automatically.

## Failure And Unavailable States

The engine must fail closed when:

- a required rule pack is absent or expired
- the selected year is outside a pack's supported range
- filing status is unsupported
- a state or property jurisdiction is unsupported
- basis or holding period is missing for gain harvesting
- a Social Security estimate lacks a source age or estimate date
- a Medicare adjustment lacks a status
- rental tax basis or prior depreciation is missing
- return components cannot support a tax-aware projection
- a candidate cannot fund taxes or required spending
- account reconciliation does not balance
- stochastic paths are too few for the requested statistic

Each failure must name the affected result. One unavailable module should not erase valid unrelated results.

## Core Scenarios

### Scenario 1: Single Adult Conversion Window

**Given** a single adult retires before Social Security and Medicare  
**When** the user compares no conversion, bracket-fill conversion, and Medicare-threshold conversion policies  
**Then** the tool shows annual tax cost, later distribution effects, Medicare lookback effects, spending survival, and break-even conditions.

### Scenario 2: Married Claim-Age Coordination

**Given** two adults have different ages and benefit estimates  
**When** the tool compares eligible joint claim-month combinations  
**Then** it shows household and survivor income under common longevity and market paths.

### Scenario 3: Gain Harvesting Versus Conversion

**Given** taxable lots have valid basis and holding periods  
**When** gains and Roth conversions compete for tax capacity  
**Then** the tool compares current tax, future basis, Medicare effects, and later withdrawal costs.

### Scenario 4: Survivor Tax Shock

**Given** one spouse dies during the projection  
**When** filing status, benefits, spending, and account ownership change  
**Then** the tool recomputes the surviving spouse's taxes, premiums, withdrawals, and shortfall risk.

### Scenario 5: Rental Household

**Given** a household owns a primary home and one long-term or vacation rental  
**When** it compares hold and taxable-sale policies  
**Then** the tool includes property cash flow, depreciation, sale tax, state tax, and portfolio reinvestment without copying the rental market model.

### Scenario 6: Early Bear Market

**Given** retirement starts before a severe equity decline  
**When** two policies run on the same stressed path  
**Then** the tool shows tax savings, forced sales, reserve depletion, and spending effects separately.

### Scenario 7: Medicare Adjustment

**Given** a user enters a pending life-changing-event appeal  
**When** approval and denial branches run  
**Then** the tool labels both as scenarios and never counts a refund as observed before a verified decision.

### Scenario 8: Unsupported State

**Given** the household selects a state without a rule pack  
**When** the model runs  
**Then** federal and other supported results remain visible while state-dependent totals stay unavailable.

## Validation Plan

### Known-Value Tax Tests

- bracket edges immediately below, at, and above each threshold
- standard versus itemized deductions
- long-term gain stacking with ordinary income
- Social Security taxable-benefit boundaries
- tax-exempt interest raising both the taxable benefit and the Medicare income
- Roth conversion inclusion
- RMD and QCD ordering
- carryforward creation and use
- state conformity and divergence
- property depreciation and sale reconciliation

Official examples may seed fixtures. Tests must identify the source edition and year.

### Benefit And Medicare Tests

- monthly early-claim reduction boundaries
- delayed-credit ceiling
- two-adult spousal and survivor transitions
- death-month handling
- earnings-test years
- Medicare enrollment timing
- income lookback mapping
- filing-status changes
- verified, pending, denied, and unavailable adjustment states

### Strategy Tests

- every candidate uses identical path IDs
- candidate order does not change results
- the same seed reproduces the same paths and ranking
- a dominated policy cannot lead the Pareto set
- lowering spending cannot masquerade as tax optimization
- outside-funds and withheld-tax conversion results differ correctly
- gain harvesting changes future basis
- state changes can reverse a conversion result
- survivor outcomes can reverse a joint-life result

### Reconciliation Tests

For every year and path:

$$
\text{opening assets} + \text{income} + \text{return} - \text{spending} - \text{taxes} - \text{premiums} - \text{property costs} = \text{closing assets}
$$

Transfers, conversions, and rebalancing must net to zero across household accounts before transaction costs and taxes.

### Privacy Tests

- a sentinel private value appears in no request, URL, referrer, console, or service-worker message
- the public read contains no household fact
- clear-all removes every declared private category
- clear-all leaves the public market cache unchanged
- export occurs only after explicit action
- sanitized diagnostics contain no private values
- fixture data is visibly synthetic and cannot publish a result

### Browser And Accessibility Tests

- Simple opens first and paints from local state
- Simple automatically runs only the quick projection
- Simple never displays a probability without a current matching deep simulation
- Simple labels its fixed stress count as named cases, not simulation odds
- Power does not run a deep simulation merely because the user enters the view
- Run deep simulation performs no request
- Power and Simple use one ledger engine and matching input identity
- changing any shared input marks the prior deep simulation stale
- rerunning Power replaces the stale result with a matching input hash
- controls recompute without requests
- tax and account tables remain readable on mobile
- charts have text-equivalent tables and contextual tooltips
- unavailable states remain visible and keyboard accessible
- long labels do not resize stable controls

### Adversarial Tests

- an expired rule pack cannot compute a current result
- a future year cannot inherit an undeclared threshold
- a missing state rule cannot become zero tax
- a pending Medicare appeal cannot become a refund
- a total-return series cannot become tax-aware income components
- a Roth conversion cannot precede an outstanding required distribution in the same year
- a month cannot pay spending before its funding withdrawal settles
- a municipal sleeve cannot reduce the taxable benefit or the Medicare income
- a candidate cannot hide an unfunded tax payment
- a private value cannot enter a public tool read
- a lower-tax but lower-spending plan cannot lead under the default objective

## Proposed Implementation Scopes

### Scope 1: Household, Rule-Pack, And Privacy Foundation

Define the contracts, local workspace extension, annual ledger, federal rule pack, reconciliation, and privacy barrier.

### Scope 2: Benefits And Tax Strategy Policies

Add Social Security, Medicare, Roth conversion, capital-gain harvesting, account wrappers, RMDs, and withdrawal policies.

### Scope 3: High-Level Projection, Deep Simulation, And Policy Comparison

Add the automatic Quick Projection and fixed stress set. Reuse the portfolio path engine for explicit deep simulations, common-path candidate runs, Pareto comparison, and sensitivity.

### Scope 4: State, Property, And Rental Overlays

Add one owner-selected state pack, one property-jurisdiction pack, primary-home costs, and long-term or vacation-rental tax treatment.

### Scope 5: Simple, Power, Import, Export, And Registration

Build the guided Simple flow and optional Power workbench. Add accessibility, local export, browser tests, notes, registries, navigation, and the permanent local-only brief read.

Do not register the tool before all five scopes pass their required checks. A proposal note is not a shipped capability.

## Proposed File Surface

### Add

| File | Purpose |
| --- | --- |
| `lifetime-tax-strategy-lab.html` | Guided Simple projection and optional Power simulation over one result envelope. |
| `rllifetime.js` | Household timeline, ledgers, policy execution, quick projection, and result composition. |
| `rltaxrules.js` | Rule-pack validation, resolution, and calculation adapters. |
| `lifetime-tax-strategy.config.json` | Versioned model policy, limits, statuses, and supported adapters. |
| `tax-rules/federal/<year>.json` | Source-qualified federal rules by effective tax year. |
| `tax-rules/states/<state>/<year>.json` | Source-qualified state rules by effective tax year. |
| `benefit-rules/social-security/<year>.json` | Source-qualified Social Security rules. |
| `benefit-rules/medicare/<year>.json` | Source-qualified Medicare and premium rules. |
| `tests/lifetime-tax-rules.unit.mjs` | Known-value rule and boundary tests. |
| `tests/lifetime-household.functional.mjs` | Timeline, ledgers, policies, comparison, and reconciliation tests. |
| `tests/lifetime-privacy.functional.mjs` | Publication, storage, clear, and export boundary tests. |
| `tests/lifetime-tax-strategy-lab.spec.mjs` | Browser, mobile, accessibility, and scenario tests. |
| `notes/lifetime-tax-strategy-lab.md` | Design, method, sources, limitations, and handoff. |

### Extend

| File | Purpose |
| --- | --- |
| `rlportfolio.js` | Add a validated household extension to the existing private workspace. |
| `rlportfolioanalytics.js` | Expose existing reproducible paths through a stable consumer contract if needed. |
| `tools.json`, `index.html`, `rlnav.js` | Register only after implementation and validation. |
| `README.md`, `notes/README.md` | Add the live tool only after implementation. |
| `scripts/selftest.mjs` | Add pure rule, reconciliation, and deterministic comparison checks. |

The design should avoid editing `rlrental.js` or `bond-regime-lab.html`. Consume their stable outputs instead.

## Performance Budgets

The first implementation should propose and test budgets for:

- deterministic projection latency
- candidate generation count
- stochastic path count
- total candidate-path evaluations
- first meaningful paint
- local workspace size
- private export size

Do not assign final numbers in this proposal. Measure the implementation first, then set lower tested budgets from evidence.

## Product Principle Alignment

### P1 - Every displayed figure carries provenance

Every value carries a source class and rule-pack identity.

### P2 - Missing data renders as missing

Unsupported states, jurisdictions, tax lots, and program rules remain unavailable.

### P3 - Confidence is evidence quality, never a win probability

Plan survival is a measured path frequency. Evidence confidence remains a separate field.

### P7 - No blackbox numbers

The browser recomputes every ledger and exposes equations, ordering, candidates, paths, and rule versions.

### P9 - Works with nothing

The tool opens with a visibly synthetic demonstration. It requires no key, proxy, or account.

### P10 - UMD, never ESM

Shared modules must support browser globals and CommonJS without a build step.

### P11 - Reuse, never refetch

The tool reuses portfolio paths, public market cache data, rental outputs, and source-qualified Treasury observations.

### P12 - Cache-first, automatic first paint

The local workspace paints first. Public data refreshes only the missing or stale delta.

### P13 - Tickers only, forever

No personal value enters a committed artifact. Household data remains local and private.

### P14 - Simple is the default, Power is the drill-down

Simple runs a fast high-level projection with curated presets. Power runs optional multi-path simulation, policy search, ledgers, and sensitivity analysis.

### P15 - Everything is explained in place

Every rule, threshold, result, chart, table, and unavailable state needs contextual explanation.

### P16 - Deep-link, never duplicate

Portfolio paths, rental market economics, and bond regime observations remain owned by their existing tools.

### P18 - Wired or not shipped

No shared module lands without the page as a production consumer.

### P19 - One definition per concept

Tax, benefit, property, path, and reconciliation logic each have one owning module.

### P22 - Budgets are assertions

Candidate, path, latency, and storage budgets require failing tests.

### P23 - A guard that cannot fail is not a guard

Every rule, privacy, reconciliation, and freshness guard needs an adversarial fixture.

### P25 - Specs are capped, and never block on status

The implementation uses five scopes. It depends on named portfolio contracts, not another feature's status.

## Open Decisions Before Specification

1. Which state should receive the first exact state rule pack?
2. Which property-tax jurisdiction should receive the first exact local pack?
3. Should the first rental overlay support long-term rental, vacation rental, or both?
4. Which federal features are required for the first certified complete-tax label?
5. Should ACA premium-tax-credit coordination enter the core release or the next release?
6. Which Medicare refund or reimbursement cases does the owner need beyond IRMAA adjustments?
7. Should private persistence default off, or reuse the portfolio workspace default?
8. Which explicit strategy ranges should the first candidate generator test?
9. Which mortality source and user overrides should the stochastic model support?
10. Which return-component source can support a tax-aware historical bootstrap?
11. Which family-stage capabilities belong in the first release, given that the current boundary is weighted toward retirement-stage decisions?
12. Should inherited-account distribution windows ship with the core engine or wait for their own rule pack?
13. Should the tool accept an optional pasted earnings history to compute the primary insurance amount in-browser, as SSA.tools does, or continue to require a user-entered estimate?
14. Which supported year should the premium-tax-credit pack target first, given that the eligibility boundary has changed by legislation?
15. Should the proposal ship as the recommended two-feature split, or as one spec with a written cap exception?

## Recommended First Release Boundary

Start with:

- one or two adults
- federal rules, including payroll and self-employment tax
- one owner-selected state
- the effective marginal rate curve with every contributing threshold named
- taxable, traditional, Roth, HSA, cash, and Treasury bill wrappers
- contribution and deferral policy while working
- Social Security retirement, spousal, and survivor strategies
- Medicare premiums, income lookback, and explicit adjustment scenarios
- the premium tax credit before Medicare eligibility
- Roth conversions, including the five-year clocks
- periodic payment series before age 59½
- long-term capital-gain harvesting
- RMDs and QCDs
- fixed, guardrail, and floor-plus-discretionary spending, plus solved maximum sustainable spending
- retirement month and claim month as searchable levers
- deterministic, bootstrap, and named stress paths
- one primary home
- one long-term rental or one vacation rental
- baseline, strategy comparison, Pareto set, and year-by-year difference ledger

Defer exotic trusts, business entities, 1031 exchanges, estate tax, and all-state coverage until separate rule packs exist.

This boundary is weighted toward retirement-stage decisions. A working household with dependents still gets the tax, property, investment, and spending model, but child, dependent-care, and education credits stay unavailable until open decision 11 is resolved. The tool must state that limitation on screen. A family must never read a complete-tax label the model cannot support.

## Split This Into Two Features

The competitive review added the effective marginal rate engine, payroll and self-employment tax, the premium tax credit, periodic payment series, the Roth five-year clocks, accumulation contributions, a retirement-date lever, and solved maximum sustainable spending. That is more than the five proposed scopes can carry.

The product principle capping a spec at roughly forty requirements or five scopes says to split rather than to grant an exception. Recommended split:

**Feature A, household tax and benefit engine.** Contracts, privacy boundary, timeline, annual ledger, federal and one state rule pack, payroll tax, benefits, Medicare, the effective marginal rate curve, and the Simple quick projection.

**Feature B, strategy search and deep simulation.** Conversions with five-year clocks, gain harvesting, periodic payment series, the premium tax credit, accumulation policy, property and rental overlays, path cohorts, candidate search, Pareto comparison, and the Power workbench.

Feature B depends on named Feature A contracts, never on Feature A's status. The effective marginal rate curve belongs in Feature A because every strategy in Feature B reads it.

## Source Starting Points

- [IRS Publication 590-B](https://www.irs.gov/publications/p590b)
- [IRS IRA distributions FAQ](https://www.irs.gov/retirement-plans/retirement-plans-faqs-regarding-iras-distributions-withdrawals)
- [IRS substantially equal periodic payments](https://www.irs.gov/retirement-plans/substantially-equal-periodic-payments)
- [IRS exceptions to tax on early distributions](https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-exceptions-to-tax-on-early-distributions)
- [IRS qualified business income deduction](https://www.irs.gov/newsroom/qualified-business-income-deduction)
- [IRS premium tax credit basics](https://www.irs.gov/affordable-care-act/individuals-and-families/the-premium-tax-credit-the-basics)
- [IRS Publication 915](https://www.irs.gov/publications/p915)
- [IRS Publication 550](https://www.irs.gov/publications/p550)
- [IRS Publication 527](https://www.irs.gov/publications/p527)
- [SSA early retirement guidance](https://www.ssa.gov/benefits/retirement/planner/agereduction.html)
- [SSA delayed retirement credits](https://www.ssa.gov/benefits/retirement/planner/delayret.html)
- [SSA family benefits](https://www.ssa.gov/family)
- [SSA survivor benefits](https://www.ssa.gov/survivor)
- [Medicare costs](https://www.medicare.gov/basics/costs/medicare-costs)
- [SSA Form SSA-44](https://www.ssa.gov/forms/ssa-44.pdf)
- [U.S. Treasury interest-rate data](https://home.treasury.gov/resource-center/data-chart-center/interest-rates)
- [IRS state government websites](https://www.irs.gov/businesses/small-businesses-self-employed/state-government-websites)

Each implemented rule must cite its exact current source, edition, effective year, retrieval date, and limitations. This list is a discovery starting point, not a completed rule pack.

### Competitive sources

Retrieved 2026-08-17: [ProjectionLab](https://projectionlab.com/), [Pralana](https://pralanaretirementcalculator.com/), [MaxiFi](https://maxifi.com/), [Open Social Security](https://opensocialsecurity.com/), [SSA.tools](https://ssa.tools/). Vendor feature claims are theirs and were not independently measured.

## Next Step

Run the product specification workflow after the owner resolves the first state, property jurisdiction, rental mode, and Medicare adjustment cases. Do not register the tool before implementation and validation.
