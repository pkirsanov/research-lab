import { expect, test } from './playwright-runtime.mjs';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import {
  collectRequests,
  declaredPackPaths,
  declareOrdinaryHousehold,
  openLifetimeTax,
  openPower,
  sameOriginPaths
} from './lifetime-tax.support.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FEDERAL_PACK_PATH = 'tax-rules/federal/2026.json';
const CONFIG_PATH = 'lifetime-tax-strategy.config.json';
const FL_REGIME_PATH = 'tax-rules/property/FL/2026.json';

const RULES = createRequire(import.meta.url)(join(ROOT, 'rltaxrules.js'));

/* The shipped pack, read rather than restated. Every figure this spec compares against is taken
   from here, so a pack edit moves the expectation with it instead of leaving a literal behind
   that a later reader would have to know was stale. */
const PACK = JSON.parse(readFileSync(join(ROOT, FEDERAL_PACK_PATH), 'utf8'));
const CAP = PACK.deductionCaps['state-and-local-tax'];
const STANDARD_SINGLE = PACK.standardDeductions.single.amount;

/* The fixture relief regimes Scope 01 introduced. They name no jurisdiction, no programme and no
   authority, so serving one AT a declared regime path settles a real property leg over the real
   route without inventing a tax figure or presenting a fixture as an authority. */
const FIXTURE_REGIMES = JSON.parse(
  readFileSync(join(ROOT, 'tax-rules/fixtures/property-regimes-2999.json'), 'utf8')).regimes;

const servingFixtureFlorida = () => ({
  [FL_REGIME_PATH]: JSON.stringify(FIXTURE_REGIMES['prior-assessed-value-cap'])
});

/* A distinctive assessed value. It legitimately appears in the DOM and in this tool's own
   local-storage namespace. It must appear nowhere in the exported file, and being distinctive is
   what stops the export scan from passing on a digit sequence some other declared member happens
   to share. */
const ASSESSED_SENTINEL = 407311;

/* A federal pack the caller mutates, served with the configuration that pins its digest. The
   digest is RECOMPUTED from the served bytes through the engine's own digest input, so the page
   performs its real pack-integrity check rather than having it disabled for the fixture. */
function servingFederalPack(mutate) {
  const pack = JSON.parse(readFileSync(join(ROOT, FEDERAL_PACK_PATH), 'utf8'));
  mutate(pack);
  pack.contentSha256 = 'sha256:' + createHash('sha256')
    .update(RULES.packContentDigestInput(pack), 'utf8').digest('hex');
  const config = JSON.parse(readFileSync(join(ROOT, CONFIG_PATH), 'utf8'));
  config.rules.packContentSha256 = pack.contentSha256;
  return {
    pack: pack,
    overrides: {
      [FEDERAL_PACK_PATH]: JSON.stringify(pack),
      [CONFIG_PATH]: JSON.stringify(config)
    }
  };
}

const money = (raw) => Number(String(raw).replace(/[^0-9.-]/g, ''));

/* One composition row, read back as the cells the page rendered. Reading the row rather than
   pinning a formatted string is what lets the arithmetic below be asserted as an identity between
   the amount, the allowed half and the disallowed half. The disallowed figure is read from its own
   value node, because the cell also carries the tooltip every displayed value must have. */
async function componentRow(page, componentId) {
  const row = page.locator('#deductionCompositionBody tr')
    .filter({ has: page.locator(`td[data-rl-disallowed="${componentId}"]`) })
    .first();
  const cells = await row.locator('td')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  const disallowed = await row.locator(`td[data-rl-disallowed="${componentId}"] [data-rl-value]`)
    .textContent();
  return {
    label: cells[0], origin: cells[1], cappedWith: cells[2],
    amount: money(cells[3]), allowed: money(cells[4]), disallowed: money(disallowed)
  };
}

async function declareProperty(page, values) {
  const fill = async (selector, value) => {
    await page.fill(selector, value === undefined || value === null ? '' : String(value));
  };
  await fill('#inputPropertyJurisdiction', values.jurisdiction);
  await fill('#inputPropertyAssessedValue', values.assessedValue);
  await fill('#inputPropertyPriorAssessedValue', values.priorAssessedValue);
  await fill('#inputPropertyAcquisitionValue', values.acquisitionValue);
  await fill('#inputPropertyLocalCombinedRate', values.localCombinedRate);
  await fill('#inputPropertyExemptionElections', values.exemptionElections);
}

async function declareMortgage(page, values) {
  await page.fill('#inputMortgageInterestPaid', String(values.interest));
  await page.fill('#inputMortgageAcquisitionDebtBalance', String(values.balance));
  await page.selectOption('#inputMortgageAcquisitionDebtTier', values.tier === undefined ? '' : values.tier);
}

const legSetOf = (page, selector) => page.locator(selector)
  .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-leg')).sort());

/* The permitted-asset set, DERIVED from the page's own script tags and from every pack path the
   configuration declares. A derived set admits only what the page itself asks for; a hand-listed
   literal has to be edited to admit a new module, and such an edit is indistinguishable from one
   admitting a leak. */
function declaredRouteAssets() {
  const routeSource = readFileSync(join(ROOT, 'lifetime-tax-strategy-lab.html'), 'utf8');
  const config = JSON.parse(readFileSync(join(ROOT, CONFIG_PATH), 'utf8'));
  const scripts = Array.from(routeSource.matchAll(/<script src="([^"]+)"><\/script>/g))
    .map((match) => '/' + match[1]);
  const packs = declaredPackPaths(config).map((path) => '/' + path);
  return ['/lifetime-tax-strategy-lab.html', '/' + CONFIG_PATH]
    .concat(scripts).concat(packs).concat(['/favicon.ico']);
}

const splitAttribute = (raw) => (raw === null || raw === '' ? [] : raw.split(','));

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* TP-02-18. */
test('Regression: SCN-023-004 property tax and state income tax compete inside one cap and the disallowed amounts are shown', async ({ page }) => {
  const capSite = await startStaticServer({ overrides: servingFixtureFlorida() });
  try {
    await openLifetimeTax(page, capSite);
    await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
    await openPower(page);

    /* The cap is BOUND. The declared assessment is large enough that the computed property tax
       alone exceeds the sourced cap, so the excess is real and the component that produced it can
       be named. The threshold above which this pack refuses to state a cap at all is far above
       this household's declared income, so the cap in force here is the stated one. */
    await declareProperty(page, {
      jurisdiction: 'state:FL', assessedValue: 3000000, priorAssessedValue: 3000000,
      acquisitionValue: 1000000, localCombinedRate: '0.02', exemptionElections: 'fixture-exemption'
    });
    const capAmount = CAP.amounts.single;
    const bound = await componentRow(page, 'property-tax');

    /* Each component appears BY NAME with its origin recorded. The property component is computed
       by this settlement, not declared, and the page says which. */
    expect(bound.label).toBe('property-tax');
    expect(bound.origin).toBe('computed by this settlement');
    expect(await page.locator('#deductionCompositionBody td[data-rl-origin="computed"]').count())
      .toBeGreaterThan(0);

    /* The component amount is the figure the property leg actually settled, so the composition is
       reading the leg rather than restating a declaration. */
    const settledPropertyTax = money(await page.locator('[data-rl-value="propertyTax"]').textContent());
    expect(bound.amount).toBe(settledPropertyTax);
    expect(bound.amount).toBeGreaterThan(capAmount);

    /* The summed component is capped at the sourced limit and the binding is STATED. The allowed
       half is the cap exactly; the disallowed half is the excess exactly; the two add back to the
       component amount, so nothing is dropped between them. */
    expect(bound.allowed).toBe(capAmount);
    expect(bound.disallowed).toBe(bound.amount - capAmount);
    expect(bound.disallowed).toBeGreaterThan(0);
    expect(bound.allowed + bound.disallowed).toBe(bound.amount);
    await expect(page.locator('#deductionCapLine')).toContainText('sourced cap of $' + capAmount.toLocaleString('en-US'));
    await expect(page.locator('#deductionCapLine')).toContainText(CAP.apportionmentRule);
    await expect(page.locator('#deductionCapLine')).toContainText('cap is bound here');
    await expect(page.locator('#deductionCapLine')).toContainText('bought nothing');

    /* The cap's declared family is read from the PACK rather than pinned here. `state-income-tax`
       is a declared member of that family — which is what proves the id moved out of the pack's
       unsupported set rather than vanishing — but this scope's settlement computes no state income
       tax, so the apportionment runs over the members that actually computed and the component
       names no sibling. A component that named an uncomputed sibling would be claiming a
       competition that did not happen. */
    expect(CAP.cappedComponentIds).toContain('state-income-tax');
    expect(CAP.cappedComponentIds).toContain('property-tax');
    expect(PACK.unsupportedFeatures.map((entry) => entry.id)).not.toContain('state-and-local-tax');
    expect(bound.cappedWith).toBe('shares no cap');
    expect(await page.locator('#deductionCompositionBody td[data-rl-disallowed="state-income-tax"]').count())
      .toBe(0);

    /* The cap is UNBOUND. The same surfaces still render, the binding is stated as unbound, and
       the disallowed amount is a COMPUTED ZERO the page labels as such rather than a blank, a
       bare dash or a figure that was never worked out. */
    await declareProperty(page, {
      jurisdiction: 'state:FL', assessedValue: 400000, priorAssessedValue: 300000,
      acquisitionValue: 200000, localCombinedRate: '0.02', exemptionElections: 'fixture-exemption'
    });
    const unbound = await componentRow(page, 'property-tax');
    expect(unbound.amount).toBeLessThan(capAmount);
    expect(unbound.allowed).toBe(unbound.amount);
    expect(unbound.disallowed).toBe(0);
    await expect(page.locator('#deductionCapLine')).toContainText('cap is unbound here');
    await expect(page.locator('#deductionCapLine')).toContainText('every capped dollar was deductible');
    await expect(page.locator('[data-rl-disallowed="property-tax"] [data-rl-value]')).toHaveText('$0');
    await expect(page.locator('#tip-disallowed-property-tax'))
      .toContainText('a computed zero, not a missing figure');
  } finally {
    await capSite.close();
  }

  /* The cap is ABSENT. A pack that could not establish the cap refuses the itemised total, and
     the standard deduction is NOT silently chosen in its place — the substitution this rule
     exists to prevent. */
  const absent = servingFederalPack((pack) => {
    pack.deductionCaps['state-and-local-tax'] = {
      contractVersion: 'AbsentFigure/v1',
      code: 'RLTAX-THRESHOLD-UNAVAILABLE',
      domain: 'deduction-cap:state-and-local-tax',
      reason: 'This fixture pack deliberately carries no cap, so the absence branch is exercised over the real route regardless of what the shipped pack retrieved.',
      whatWouldMakeItAvailable: 'Retrieve the cap and its filing-status variation from its primary source.',
      missingSource: {
        title: 'Absent-cap fixture pointer',
        url: 'https://www.irs.gov/publications/p505',
        documentKind: 'publication',
        locator: 'This fixture pointer is deliberately unretrieved so the absence branch is never vacuous.'
      }
    };
  });
  const absentSite = await startStaticServer({
    overrides: Object.assign({}, servingFixtureFlorida(), absent.overrides)
  });
  try {
    await openLifetimeTax(page, absentSite);
    await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
    await openPower(page);
    await declareProperty(page, {
      jurisdiction: 'state:FL', assessedValue: 400000, priorAssessedValue: 300000,
      acquisitionValue: 200000, localCombinedRate: '0.02', exemptionElections: 'fixture-exemption'
    });

    const refusal = page.locator('#deductionRefusal [data-rl-unavailable]');
    await expect(refusal).toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
    await expect(refusal).toHaveAttribute('data-rl-unavailable-domain', 'deduction-cap:state-and-local-tax');
    await expect(refusal).toContainText('deliberately carries no cap');
    await expect(refusal).toContainText('missing source: Absent-cap fixture pointer');

    /* Nothing stands in for the refused total: no component row, no decision row, and no zero. */
    expect(await page.locator('#deductionCompositionBody tr').count()).toBe(0);
    expect(await page.locator('#deductionDecisionBody tr').count()).toBe(0);
    expect(await page.locator('#power-deduction [data-rl-value]').count()).toBe(0);
    await expect(page.locator('#power-deduction')).not.toContainText('$0');
    await expect(page.locator('#deductionChosenLine')).toContainText('not silently substituted');

    /* Simple carries the same refusal rather than a side, so the substitution cannot be hidden by
       switching view. The standard deduction is never named as the side applied. */
    expect(await page.locator('[data-rl-value="deductionSideChosen"]').count()).toBe(0);
    await expect(page.locator('#conversionOutcomeCard [data-rl-unavailable]'))
      .toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
  } finally {
    await absentSite.close();
  }
});

/* TP-02-19. */
test('Regression: SCN-023-005 mortgage interest is limited by a sourced debt limit and the disallowed portion is named', async ({ page }) => {
  /* The SHIPPED pack ships both acquisition-debt tiers absent, because the only retrievable
     edition of the authority declares another tax year. A declared balance for which no limit was
     retrieved must therefore REFUSE rather than deducting the declared interest in full — the one
     direction this rule must never err in. This half runs against the pack a reader actually
     gets, not against a fixture. */
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await openPower(page);
  await declareMortgage(page, { interest: 20000, balance: 1000000, tier: 'acquisition-debt-current' });

  const refusal = page.locator('#deductionRefusal [data-rl-unavailable]');
  await expect(refusal).toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
  await expect(refusal).toHaveAttribute('data-rl-unavailable-domain',
    'deduction-component:mortgage-interest:acquisition-debt-current');
  await expect(refusal).toContainText('Publication 936');
  await expect(refusal).toContainText('missing source: '
    + PACK.mortgageDebtLimits.tiers[0].limits.missingSource.title);

  /* No component, no figure and no zero stands in for the refused limit. An implementation that
     deducted the declared interest in full would publish a component row here. */
  expect(await page.locator('#deductionCompositionBody tr').count()).toBe(0);
  expect(await page.locator('#power-deduction [data-rl-value]').count()).toBe(0);
  await expect(page.locator('#power-deduction')).not.toContainText('$20,000');
  await expect(page.locator('#power-deduction')).not.toContainText('$0');

  /* A fixture pack whose tiers DO carry limits. The figures are the fixture's own and can never
     resolve for a real return; they exist so the limitation arithmetic and the disallowed half are
     provable over the real route rather than only in the repository suite. */
  const interest = 20000;
  const balance = 1000000;
  const limited = servingFederalPack((pack) => {
    pack.mortgageDebtLimits.tiers[0].limits = {
      'single': 500000, 'married-filing-jointly': 500000,
      'married-filing-separately': 250000, 'head-of-household': 500000
    };
    pack.mortgageDebtLimits.tiers[1].limits = {
      'single': 700000, 'married-filing-jointly': 700000,
      'married-filing-separately': 350000, 'head-of-household': 700000
    };
  });
  const limitedSite = await startStaticServer({ overrides: limited.overrides });
  try {
    await openLifetimeTax(page, limitedSite);
    await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
    await openPower(page);
    await declareMortgage(page, { interest: interest, balance: balance, tier: 'acquisition-debt-current' });

    /* The deductible portion is computed FROM THE SOURCED LIMIT and the disallowed portion is
       named beside it rather than dropped. Both halves are derived from the limit the served pack
       declares, so the expectation moves with the pack instead of being pinned to a literal. */
    const currentLimit = limited.pack.mortgageDebtLimits.tiers[0].limits.single;
    const current = await componentRow(page, 'mortgage-interest');
    expect(current.label).toBe('Home mortgage interest');
    expect(current.origin).toBe('your own input');
    expect(current.cappedWith).toBe('shares no cap');
    expect(current.amount).toBe(interest);
    expect(current.allowed).toBe(interest * (currentLimit / balance));
    expect(current.disallowed).toBe(interest - interest * (currentLimit / balance));
    expect(current.disallowed).toBeGreaterThan(0);
    expect(current.allowed + current.disallowed).toBe(current.amount);

    /* The DECLARED tier is the one applied. Switching to the predecessor tier reaches its own,
       higher limit, so an implementation substituting one tier for the other fails here. */
    const predecessorLimit = limited.pack.mortgageDebtLimits.tiers[1].limits.single;
    await page.selectOption('#inputMortgageAcquisitionDebtTier', 'acquisition-debt-predecessor');
    const predecessor = await componentRow(page, 'mortgage-interest');
    expect(predecessor.allowed).toBe(interest * (predecessorLimit / balance));
    expect(predecessor.allowed).not.toBe(current.allowed);
    expect(predecessor.disallowed).toBeLessThan(current.disallowed);

    /* A balance BELOW the limit is deducted in full, and the disallowed half is a computed zero
       rather than an absent member. */
    await page.selectOption('#inputMortgageAcquisitionDebtTier', 'acquisition-debt-current');
    await page.fill('#inputMortgageAcquisitionDebtBalance', String(currentLimit - 1));
    const within = await componentRow(page, 'mortgage-interest');
    expect(within.allowed).toBe(interest);
    expect(within.disallowed).toBe(0);

    /* Mortgage interest declared WITHOUT a tier refuses as a missing declaration rather than as a
       missing rule, so the household can tell which half is absent. */
    await page.selectOption('#inputMortgageAcquisitionDebtTier', '');
    const incomplete = page.locator('#deductionRefusal [data-rl-unavailable]');
    await expect(incomplete).toHaveAttribute('data-rl-unavailable', 'RLTAX-INPUT-INCOMPLETE');
    await expect(incomplete).toHaveAttribute('data-rl-unavailable-domain',
      'deduction-component:mortgage-interest:tier');
    expect(await page.locator('#deductionCompositionBody tr').count()).toBe(0);
  } finally {
    await limitedSite.close();
  }
});

/* TP-02-20. */
test('Regression: SCN-023-006 the itemized versus standard decision is recomputed and the chosen side is named', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await openPower(page);

  const sideRow = async (label) => {
    const cells = await page.locator('#deductionDecisionBody tr')
      .filter({ hasText: label }).first().locator('td')
      .evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
    return { total: money(cells[1]), comparison: cells[2], priced: cells[3] };
  };
  const dollarsShown = (amount) => '$' + amount.toLocaleString('en-US');

  /* F-REG-01. The itemised total sits ABOVE the standard deduction while the household has
     declared the STANDARD mode, so the two facts this panel reports DISAGREE here, which is the
     whole point of the fixture. The comparison is recomputed from the two totals and names
     itemising. The settlement priced the tax on the standard deduction, because it applies the
     declared mode rather than substituting a computed side for a declaration. Each surface must
     say which of the two it is reporting. */
  await page.selectOption('#inputDeductionMode', 'standard');
  await page.fill('#inputItemizedAmount', String(STANDARD_SINGLE + 5000));
  let itemised = await sideRow('Itemised total');
  let standard = await sideRow('Standard deduction');
  expect(itemised.total).toBe(STANDARD_SINGLE + 5000);
  expect(standard.total).toBe(STANDARD_SINGLE);
  expect(itemised.comparison).toBe('named');
  expect(standard.comparison).toBe('not named');
  expect(itemised.priced).toBe('did not price the tax');
  expect(standard.priced).toBe('priced the tax');
  await expect(page.locator('#deductionChosenLine')).toContainText('itemised total is larger');
  await expect(page.locator('#deductionChosenLine')).toContainText('did not price the tax');
  /* Simple carries the same two facts on two rows: the deduction that priced the tax, and the
     larger side the comparison found. They are DIFFERENT here, in both mode and amount. */
  await expect(page.locator('[data-rl-value="deductionApplied"]')).toContainText('standard');
  await expect(page.locator('[data-rl-value="deductionApplied"]'))
    .toContainText(dollarsShown(STANDARD_SINGLE));
  await expect(page.locator('[data-rl-value="deductionSideChosen"]')).toContainText('itemized');
  await expect(page.locator('[data-rl-value="deductionSideChosen"]'))
    .toContainText(dollarsShown(STANDARD_SINGLE + 5000));

  /* Both totals stay side by side when the smaller side wins, and the household whose itemised
     total falls below the standard deduction is TOLD its capped components changed nothing. The
     declared mode is itemised here, so the settlement priced the tax on the SMALLER side while
     the comparison names the larger — the disagreement inverted. */
  await page.selectOption('#inputDeductionMode', 'itemized');
  await page.fill('#inputItemizedAmount', String(STANDARD_SINGLE - 5000));
  itemised = await sideRow('Itemised total');
  standard = await sideRow('Standard deduction');
  expect(itemised.total).toBe(STANDARD_SINGLE - 5000);
  expect(standard.total).toBe(STANDARD_SINGLE);
  expect(itemised.comparison).toBe('not named');
  expect(standard.comparison).toBe('named');
  expect(itemised.priced).toBe('priced the tax');
  expect(standard.priced).toBe('did not price the tax');
  await expect(page.locator('#deductionChosenLine')).toContainText('changed nothing');
  await expect(page.locator('[data-rl-value="deductionSideChosen"]')).toContainText('standard');
  await expect(page.locator('[data-rl-value="deductionApplied"]')).toContainText('itemized');

  /* The side named in Simple's COMPARISON row carries the larger of the two totals, and the
     priced-the-tax row carries the declared side's own smaller amount. Asserting both is what
     makes a surface that renders one figure under the other label fail here. */
  await expect(page.locator('[data-rl-value="deductionSideChosen"]'))
    .toContainText(dollarsShown(STANDARD_SINGLE));
  await expect(page.locator('[data-rl-value="deductionApplied"]'))
    .toContainText(dollarsShown(STANDARD_SINGLE - 5000));

  /* The tie is resolved the way the PACK declares, and the page says so rather than leaving the
     side ambiguous. At a tie the two figures agree in amount, so the labels are what separate
     them and both are still stated. */
  await page.fill('#inputItemizedAmount', String(STANDARD_SINGLE));
  await expect(page.locator('[data-rl-value="deductionSideChosen"]'))
    .toContainText(PACK.deductionChoicePolicy.onTie);
  await expect(page.locator('[data-rl-value="deductionApplied"]')).toContainText('itemized');
  await expect(page.locator('#deductionChosenLine')).toContainText('two totals are equal');
  await expect(page.locator('#deductionChosenLine')).toContainText('declared tie rule');
});

/* TP-02-28. The assertion F-REG-01 says was missing: it fails if any surface presents the
   COMPOSED side as the deduction that priced the tax. It is run under the fixture in which the
   declared mode and the composed side deliberately disagree, because under agreement no
   assertion here could tell the two apart — that is precisely how the defect survived a suite of
   3,244 checks. */
test('Regression: F-REG-01 no surface names the composed side as the deduction that priced the tax', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await page.selectOption('#inputDeductionMode', 'standard');
  await page.fill('#inputItemizedAmount', String(STANDARD_SINGLE + 5000));

  const settled = page.locator('[data-rl-value="deductionApplied"]');
  const composed = page.locator('[data-rl-value="deductionSideChosen"]');
  const settledText = (await settled.textContent()).trim();
  const composedText = (await composed.textContent()).trim();

  /* The fixture is discriminating only while the two disagree. If a pack edit ever made them
     agree, this test would silently stop testing anything, so the disagreement is asserted
     rather than assumed. */
  expect(settledText).not.toBe(composedText);
  expect(settledText).toContain('standard');
  expect(composedText).toContain('itemized');

  /* The row that claims to have priced the tax must carry the SETTLED mode and the SETTLED
     amount. Feeding it from the composition — the exact regression — puts 'itemized' and the
     $5,000-higher figure here and fails both. */
  expect(settledText).toContain('$' + STANDARD_SINGLE.toLocaleString('en-US'));
  expect(settledText).not.toContain('$' + (STANDARD_SINGLE + 5000).toLocaleString('en-US'));

  /* The composed row must not be labelled or described as the deduction that was applied. Both
     the visible label and the tooltip are read, because the defect this replaces lived in a
     tooltip whose first sentence contradicted the clause appended after it. */
  const labelFor = async (valueId) => (await page.locator('[data-rl-value="' + valueId + '"]')
    .evaluate((node) => node.closest('div').textContent)).trim();
  const composedLabel = await labelFor('deductionSideChosen');
  const settledLabel = await labelFor('deductionApplied');
  expect(settledLabel).toContain('priced the tax');
  expect(composedLabel).toContain('by comparison');
  expect(composedLabel).not.toContain('actually applied');

  const composedTip = (await page.locator('#tip-deductionSideChosen').textContent()).trim();
  const settledTip = (await page.locator('#tip-deductionApplied').textContent()).trim();
  expect(composedTip).not.toContain('actually applied');
  expect(composedTip).toContain('A comparison');
  expect(composedTip).toContain('did not price the tax');
  expect(settledTip).toContain('subtracted from income');
  /* One string may not assert both sides. The composed tooltip says it did not price the tax, so
     it must not also claim the settlement applied it. */
  expect(composedTip).not.toMatch(/this settlement applied the (itemized|standard) deduction/);

  /* Power carries the same separation: the comparison column and the priced-the-tax column are
     distinct columns, and here they name opposite sides. */
  await openPower(page);
  const decisionHeaders = await page.locator('#deductionDecision thead th')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
  expect(decisionHeaders).toEqual(['Side', 'Total', 'Comparison', 'Priced the tax']);
  const decisionAria = await page.locator('#deductionDecision').getAttribute('aria-label');
  expect(decisionAria).not.toContain('actually applied');
  expect(decisionAria).toContain('priced the tax');
});

/* TP-02-21. */
test('Regression: SCN-023-006 the composition and the decision reach the headline, the comparison, the curve and the export', async ({ page }) => {
  const legSite = await startStaticServer({ overrides: servingFixtureFlorida() });
  try {
    await openLifetimeTax(page, legSite);
    /* The all-non-zero leg fixture. Every leg settles a DISTINCT non-zero figure, so omitting any
       one of them changes the headline by an amount unique to that leg. A zero leg passes an
       addition check whether or not it was added, which is exactly how a dropped leg hides. */
    await declareOrdinaryHousehold(page, {
      ordinary: 300000, longTermCapitalGain: 120000, otherNetInvestmentIncome: 5000,
      medicareWageBasis: 400000, bracketId: 'b3'
    });
    await declareProperty(page, {
      jurisdiction: 'state:FL', assessedValue: ASSESSED_SENTINEL, priorAssessedValue: 300000,
      acquisitionValue: 200000, localCombinedRate: '0.02', exemptionElections: 'fixture-exemption'
    });
    await openPower(page);

    /* The composition and the decision are both in force for this fixture: a capped component the
       settlement computed, and a side recomputed from the two totals. The identity below is
       therefore asserted while the composition is live rather than against a settlement that
       never composed anything. */
    const composed = await componentRow(page, 'property-tax');
    expect(composed.amount).toBeGreaterThan(0);
    await expect(page.locator('#deductionCapLine')).toContainText('sourced cap of');
    await expect(page.locator('#deductionChosenLine')).not.toHaveText('');
    /* Simple's decision field is rendered from the same envelope Power reads, so it carries the
       recomputed side here even while Power is the visible view. */
    await expect(page.locator('[data-rl-value="deductionSideChosen"]')).toContainText('$');

    /* The settled record's own declared leg set. Every surface below is read against THIS, in both
       directions, rather than against a total. */
    const record = splitAttribute(await page.locator('body').getAttribute('data-rl-legs-record'));
    expect(record.length).toBeGreaterThan(1);
    expect(record).toContain('property-tax');

    /* The fixture carries no zero leg and no repeated figure, so omitting any one leg changes the
       headline by an amount unique to that leg. */
    const legAmounts = await page.locator('#legCompositionBody tr[data-rl-leg] [data-rl-value]')
      .evaluateAll((nodes) => nodes.map((node) => node.textContent.trim()));
    expect(legAmounts.length).toBe(record.length);
    expect(new Set(legAmounts).size).toBe(legAmounts.length);
    legAmounts.forEach((amount) => expect(amount).not.toBe('$0'));

    /* Surface one: the headline. The federal figure declares the legs it summed and the property
       leg carries its own figure beside it, because it is not part of that total. */
    const headlineSummed = splitAttribute(
      await page.locator('#headlineBlock [data-rl-legs]').getAttribute('data-rl-legs'));
    const headlineOwn = await legSetOf(page, '#headlineBlock [data-rl-leg]');
    const headline = headlineSummed.concat(headlineOwn).sort();

    /* Surfaces two and three: the comparison table and the curve's leg contributors. */
    const comparison = await legSetOf(page, '#legCompositionBody tr[data-rl-leg]');
    const curve = await legSetOf(page, '#curveLegContributorsBody tr[data-rl-leg]');

    /* Surface four: the export. The written file records the leg identities the settlement
       declared, so the export cannot silently carry fewer legs than the record. */
    await page.locator('#exportAcknowledgement').check();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('#exportPrivateFile').click()
    ]);
    const written = JSON.parse(readFileSync(await download.path(), 'utf8'));
    const exported = written.settledLegs.slice().sort();
    const exportedAttribute = splitAttribute(
      await page.locator('#privacyResult').getAttribute('data-rl-export-legs')).sort();

    /* Two-directional set identity against every one of the four surfaces. A leg in the record and
       missing from a surface fails; a leg on a surface and missing from the record fails too. */
    const sortedRecord = record.slice().sort();
    [
      ['headline', headline],
      ['comparison', comparison],
      ['curve', curve],
      ['export', exported],
      ['export attribute', exportedAttribute]
    ].forEach(([surface, rendered]) => {
      sortedRecord.forEach((legId) => {
        expect(rendered, `the leg ${legId} is in the settled record and does not reach ${surface}`)
          .toContain(legId);
      });
      rendered.forEach((legId) => {
        expect(sortedRecord, `the leg ${legId} appears on ${surface} and is not in the settled record`)
          .toContain(legId);
      });
      expect(rendered.length).toBe(sortedRecord.length);
    });

    /* The export carries the deduction the household DECLARED and no property declaration the
       sanitiser removed, so the fourth surface states its deduction position without smuggling a
       private value back into the file. */
    expect(written.workspace.deductionMode).toBe('standard');
    expect(written.workspace.itemizedAmount).toBe(0);
    expect(written.omittedFields).toContain('propertyAssessedValue');
    expect(written.omittedFields).toContain('mortgageInterestPaid');
    expect(written.omittedFields).toContain('mortgageAcquisitionDebtBalance');
    expect(JSON.stringify(written)).not.toContain(String(ASSESSED_SENTINEL));
  } finally {
    await legSite.close();
  }
});

/* TP-02-29. */
test('Regression: SCN-023-005 the request ledger does not grow after the mortgage declarations and every entry is a declared same-origin read', async ({ page }) => {
  const ledger = collectRequests(page);
  await openLifetimeTax(page, site);
  /* Measured before a single declaration is entered. Every assertion below is a statement about
     THIS number, so a route whose transport stopped working entirely would make all of them
     vacuous — which is why the pin comes first. */
  const afterFirstPaint = ledger.length;
  expect(afterFirstPaint).toBeGreaterThan(0);

  /* Distinctive mortgage figures. Both legitimately appear in the DOM and in this tool's own
     local-storage namespace. Being distinctive is what stops the URL scan from passing on a digit
     sequence some other declared member happens to share. */
  const interestSentinel = 20417;
  const balanceSentinel = 1130729;
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await openPower(page);
  await declareMortgage(page, {
    interest: interestSentinel, balance: balanceSentinel, tier: 'acquisition-debt-current'
  });

  /* NFR-023-003, first half. Declaring the mortgage, resolving the debt limit and rendering the
     refusal issued no request at all. */
  expect(ledger.length).toBe(afterFirstPaint);

  /* NFR-023-003, second half. Every request the route did make is one the route itself declares,
     read from the route's own origin. The origin half runs first, in the shared helper: a
     pathname is not an origin, so `https://elsewhere.example/rltaxstrategy.js` would satisfy the
     membership sweep below on its own. */
  const permitted = declaredRouteAssets();
  const paths = sameOriginPaths(ledger, site);
  paths.forEach((path) => expect(permitted).toContain(path));
  /* The derived set is the page's own declaration set rather than everything or nothing, so the
     sweep above is a real constraint. */
  expect(permitted).toContain('/' + FEDERAL_PACK_PATH);
  expect(permitted).not.toContain('/definitely-not-declared-by-this-route.js');
  expect(paths).toContain('/' + FEDERAL_PACK_PATH);

  /* No mortgage declaration reaches any URL, query string or request body, and nothing was POSTed. */
  ledger.forEach((entry) => {
    [String(interestSentinel), String(balanceSentinel), 'acquisition-debt-current'].forEach((sentinel) => {
      expect(entry.url).not.toContain(sentinel);
      expect(entry.postData).not.toContain(sentinel);
    });
    expect(entry.method).toBe('GET');
  });
  const address = page.url();
  expect(address).not.toContain(String(interestSentinel));
  expect(address).not.toContain(String(balanceSentinel));
  expect(new URL(address).search).toBe('');

  /* The declarations really are present, so every scan above ran against a live household rather
     than an empty one. */
  await expect(page.locator('#inputMortgageInterestPaid')).toHaveValue(String(interestSentinel));
  await expect(page.locator('#inputMortgageAcquisitionDebtBalance')).toHaveValue(String(balanceSentinel));
});
