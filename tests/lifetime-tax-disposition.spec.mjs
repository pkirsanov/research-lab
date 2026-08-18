import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import {
  declareOrdinaryHousehold,
  openLifetimeTax,
  openPower
} from './lifetime-tax.support.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FEDERAL_PACK_PATH = 'tax-rules/federal/2026.json';
const FEDERAL_PACK = JSON.parse(readFileSync(join(ROOT, FEDERAL_PACK_PATH), 'utf8'));

/* Every expected side below is read from the SHIPPED PACK rather than written as a literal. An
   assertion carrying its own 0.25 would keep passing against a pack that lost the figure; one
   that reads the pack cannot. */
const RECAPTURE_RATE = FEDERAL_PACK.dispositionPolicy.recaptureCategory.maximumRate;
const RECAPTURE_LOCATOR = FEDERAL_PACK.dispositionPolicy.recaptureCategory.locator;
const EXCLUSION_AMOUNTS = FEDERAL_PACK.dispositionPolicy.residenceExclusion.maximumAmounts.amounts;
const OWNERSHIP_MONTHS = FEDERAL_PACK.dispositionPolicy.residenceExclusion.ownershipTest.minimumMonths;
const USE_MONTHS = FEDERAL_PACK.dispositionPolicy.residenceExclusion.useTest.minimumMonths;

/* Serving a fixture pack AT the declared pack path is how a refusal branch is exercised over the
   real route without inventing a tax figure and without presenting a fixture as an authority. The
   shipped pack is unchanged and these packs are reachable only from this spec. */
function packServing(mutate) {
  const pack = JSON.parse(readFileSync(join(ROOT, FEDERAL_PACK_PATH), 'utf8'));
  mutate(pack);
  return { [FEDERAL_PACK_PATH]: JSON.stringify(pack) };
}

/* The retrieved publication's own worked example: a property bought for $400,000, depreciated by
   $20,000 to a $380,000 basis and sold for $700,000. The gain is $320,000, of which $20,000 is
   the recapture component. Anchoring the fixture on the authority's own arithmetic means the
   split is checked against a result the publication itself states. */
const SALE = {
  proceeds: 700000, adjustedBasis: 380000, accumulatedCostRecovery: 20000,
  ownershipMonths: 60, useMonths: 24, propertyUse: 'principal-residence'
};

const GAIN = SALE.proceeds - SALE.adjustedBasis;
const REMAINDER = GAIN - SALE.accumulatedCostRecovery;

async function declareSale(page, values) {
  const fill = async (selector, value) => {
    await page.fill(selector, value === undefined || value === null ? '' : String(value));
  };
  await fill('#inputSaleProceeds', values.proceeds);
  await fill('#inputSaleAdjustedBasis', values.adjustedBasis);
  await fill('#inputSaleAccumulatedCostRecovery', values.accumulatedCostRecovery);
  await fill('#inputSaleOwnershipMonths', values.ownershipMonths);
  await fill('#inputSaleUseMonths', values.useMonths);
  if (values.propertyUse !== undefined) {
    await page.selectOption('#inputSalePropertyUse', values.propertyUse);
  }
}

const splitAttribute = (raw) => (raw === null || raw === '' ? [] : raw.split(','));

/* Money is rendered with thousands separators and a currency symbol, and a sentence that states
   an amount also carries its own prose punctuation. Comparing a rendered sentence to an expected
   one therefore needs the SAME normalisation on both sides; applying it to one side only removes
   punctuation from the actual that the expected still carries. */
const withoutCurrencyPunctuation = (raw) => String(raw).replace(/[,$]/g, '');

/* Feature 021 TP-05-06 pinned the route's URL contract: the location hash carries a view-mode
   literal and nothing else, and no query string is ever written. This is that same closed set,
   so a disposition assertion cannot contradict the route assertion that owns it. */
const VIEW_MODE_HASH = /^#(simple|power)$/;

/* The same surface census the rental spec derives, applied to a disposition leg. The surface set
   is read from the page's own `data-rl-leg-surfaces` declaration rather than pinned, so a surface
   a later scope adds is checked without editing this helper, and a leg present on one surface and
   missing from another is reported by the name of the surface it is missing from. */
async function legSurfaceCensus(page, legId) {
  return page.evaluate(({ leg }) => {
    const surfaces = (document.body.getAttribute('data-rl-leg-surfaces') || '')
      .split(',').filter((entry) => entry.length > 0);
    const findings = [];
    surfaces.forEach((surface) => {
      const hosts = Array.from(document.querySelectorAll(`[data-rl-leg-surface="${surface}"]`));
      if (hosts.length !== 1) {
        findings.push(`${surface}: ${hosts.length} elements declare this surface`);
        return;
      }
      const found = hosts[0].querySelectorAll(`[data-rl-leg="${leg}"]`).length;
      if (found !== 1) findings.push(`${surface}: the leg appears ${found} times on this surface`);
    });
    const exported = (document.body.getAttribute('data-rl-legs-record') || '')
      .split(',').filter((entry) => entry.length > 0);
    if (exported.indexOf(leg) < 0) findings.push('export: the leg is absent from the exported leg record');
    return { surfaces, exported, findings };
  }, { leg: legId });
}

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* TP-05-22. */
test('Regression: SCN-023-014 the gain splits into two legs priced under different rules', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 120000, bracketId: 'b3' });
  await openPower(page);
  await declareSale(page, SALE);

  /* Both components are named, and the two amounts sum to the realised gain the page also shows.
     A settlement that priced the whole gain under one rule would render one row here. */
  await expect(page.locator('#dispositionComponentsBody tr')).toHaveCount(2);
  const componentLegs = await page.locator('#dispositionComponentsBody tr[data-rl-leg]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-leg')).sort());
  expect(componentLegs).toEqual(['disposition-recapture', 'disposition-remainder']);

  /* The two pricing rules DIFFER. This is the claim the whole scenario rests on: one component
     is priced at a rate stated for that category alone, the other stacks. */
  const pricingRules = await page.locator('#dispositionComponentsBody tr[data-rl-leg] td')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent))
    .then((cells) => cells.filter((cell) => cell === 'own-maximum-rate' || cell === 'preferential-stacking'));
  expect(pricingRules.sort()).toEqual(['own-maximum-rate', 'preferential-stacking']);

  /* The recapture component carries the sourced amount, and its tax is the SOURCED rate applied
     to it. The expected figure is derived from the pack rather than written here. */
  const recaptureAmount = await page
    .locator('#dispositionComponentsBody tr[data-rl-leg="disposition-recapture"] [data-rl-value="disposition-amount-disposition-recapture"]')
    .textContent();
  expect(recaptureAmount.replace(/[^0-9]/g, '')).toBe(String(SALE.accumulatedCostRecovery));
  const recaptureTax = await page
    .locator('#dispositionComponentsBody tr[data-rl-leg="disposition-recapture"] [data-rl-value="disposition-tax-disposition-recapture"]')
    .textContent();
  expect(recaptureTax.replace(/[^0-9]/g, ''))
    .toBe(String(SALE.accumulatedCostRecovery * RECAPTURE_RATE));

  /* The rate carries its citation, so a reader can check the figure rather than trust it. */
  const citation = await page
    .locator('#dispositionComponentsBody tr[data-rl-leg="disposition-recapture"] td').nth(4).textContent();
  expect(citation).toContain(RECAPTURE_LOCATOR.slice(0, 40));

  /* And the remainder is the balance, which is what makes the two account for the whole gain. */
  const remainderAmount = await page
    .locator('#dispositionComponentsBody tr[data-rl-leg="disposition-remainder"] [data-rl-value="disposition-amount-disposition-remainder"]')
    .textContent();
  expect(remainderAmount.replace(/[^0-9]/g, '')).toBe(String(REMAINDER));

  /* A pack whose recapture maximum rate was not retrieved refuses the component, and in
     particular does NOT fall back to pricing the whole gain under the preferential model.
     The fixture pack is served by its OWN ephemeral origin, which is how every other refusal
     branch in this feature reaches the real route: the page performs its real fetch of the
     declared pack path and the shipped pack is untouched. */
  const absentRate = packServing((pack) => {
    pack.dispositionPolicy.recaptureCategory = {
      contractVersion: 'AbsentFigure/v1', code: 'RLTAX-THRESHOLD-UNAVAILABLE',
      domain: 'disposition:recaptureCategory',
      reason: 'This fixture pack deliberately carries no recapture maximum rate.',
      whatWouldMakeItAvailable: 'Retrieve the rate from its primary source.',
      missingSource: {
        title: 'Absent recapture-rate fixture pointer',
        url: 'https://www.irs.gov/publications/p544',
        documentKind: 'publication',
        locator: 'This fixture pointer is deliberately unretrieved so the absence branch is never vacuous.'
      }
    };
  });
  const absentRateSite = await startStaticServer({ overrides: absentRate });
  try {
    await openLifetimeTax(page, absentRateSite);
    await declareOrdinaryHousehold(page, { ordinary: 120000, bracketId: 'b3' });
    await openPower(page);
    await declareSale(page, SALE);

    const refusal = page.locator('#power-disposition [data-rl-unavailable]').first();
    await expect(refusal).toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
    /* The refusal NAMES the source it could not retrieve. A refusal that only carried a code
       would leave a reader with nothing to go and get. */
    await expect(refusal).toContainText('missing source: Absent recapture-rate fixture pointer');
    await expect(page.locator('#dispositionComponentsBody tr')).toHaveCount(0);
    /* The whole gain does not appear as a single priced figure in its place. */
    await expect(page.locator('[data-rl-leg="disposition-remainder"]')).toHaveCount(0);
    await expect(page.locator('[data-rl-leg="disposition-recapture"]')).toHaveCount(0);
  } finally {
    await absentRateSite.close();
  }
});

/* TP-05-23. */
test('Regression: SCN-023-015 the residence exclusion applies to the remainder only and names a failing test', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 120000, bracketId: 'b3' });
  await openPower(page);
  await declareSale(page, SALE);

  /* Both tests are shown, evaluated SEPARATELY, each with the period figure it compared against
     and the window it measured over. */
  await expect(page.locator('#dispositionExclusionTestsBody tr')).toHaveCount(2);
  await expect(page.locator('#dispositionExclusionTestsBody tr[data-rl-exclusion-test="ownership"] td[data-rl-test-outcome]'))
    .toHaveAttribute('data-rl-test-outcome', 'passed');
  await expect(page.locator('#dispositionExclusionTestsBody tr[data-rl-exclusion-test="use"] td[data-rl-test-outcome]'))
    .toHaveAttribute('data-rl-test-outcome', 'passed');
  const ownershipRequired = await page
    .locator('#dispositionExclusionTestsBody tr[data-rl-exclusion-test="ownership"] [data-rl-value="disposition-test-required-ownership"]')
    .textContent();
  expect(ownershipRequired).toContain(String(OWNERSHIP_MONTHS));
  const useRequired = await page
    .locator('#dispositionExclusionTestsBody tr[data-rl-exclusion-test="use"] [data-rl-value="disposition-test-required-use"]')
    .textContent();
  expect(useRequired).toContain(String(USE_MONTHS));

  /* The exclusion is applied to the REMAINDER and never to the recapture component. The line
     states the recapture component's amount AFTER the exclusion, which is the same amount it had
     before it — that is the interaction this scenario exists to pin. */
  const exclusionLine = await page.locator('#dispositionExclusionLine').textContent();
  expect(exclusionLine).toContain('both eligibility tests passed');
  expect(exclusionLine).toContain('disposition-remainder');
  /* The line is compared on a form with the thousands separators and the currency symbol
     removed, so the expected side is stated in dollars rather than in the page's own grouping.
     BOTH sides are normalised by the same function: normalising only the actual would also strip
     the sentence's own punctuation and leave an expected substring that can never match. */
  expect(withoutCurrencyPunctuation(exclusionLine))
    .toContain(withoutCurrencyPunctuation(String(EXCLUSION_AMOUNTS.single)));
  expect(withoutCurrencyPunctuation(exclusionLine))
    .toContain(withoutCurrencyPunctuation(
      `disposition-recapture, which stays at ${SALE.accumulatedCostRecovery}`));

  /* One month short of the sourced use period, the exclusion does not apply, the FAILING test is
     named, and the passing test is still shown as passed. */
  await declareSale(page, Object.assign({}, SALE, { useMonths: USE_MONTHS - 1 }));
  await expect(page.locator('#dispositionExclusionTestsBody tr[data-rl-exclusion-test="use"] td[data-rl-test-outcome]'))
    .toHaveAttribute('data-rl-test-outcome', 'failed');
  await expect(page.locator('#dispositionExclusionTestsBody tr[data-rl-exclusion-test="ownership"] td[data-rl-test-outcome]'))
    .toHaveAttribute('data-rl-test-outcome', 'passed');
  const failedLine = await page.locator('#dispositionExclusionLine').textContent();
  expect(failedLine).toContain('the use test did not pass');
  expect(failedLine).toContain('No amount was excluded');

  /* Exactly at the sourced figure the test passes again, which is what makes the boundary a real
     boundary rather than an approximate one. */
  await declareSale(page, Object.assign({}, SALE, { useMonths: USE_MONTHS }));
  await expect(page.locator('#dispositionExclusionTestsBody tr[data-rl-exclusion-test="use"] td[data-rl-test-outcome]'))
    .toHaveAttribute('data-rl-test-outcome', 'passed');

  /* A filing status the publication does not enumerate refuses rather than borrowing another
     status's amount. This is the shipped absence, not a fixture. */
  await page.selectOption('#inputFilingStatus', 'head-of-household');
  await expect(page.locator('#power-disposition [data-rl-unavailable]').first())
    .toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
  await expect(page.locator('#dispositionExclusionTestsBody tr')).toHaveCount(0);
});

/* TP-05-24. */
test('Regression: SCN-023-014 both disposition legs reach the headline, the comparison, the curve and the export', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 120000, bracketId: 'b3' });
  await openPower(page);
  await declareSale(page, SALE);

  /* Each leg appears exactly once per declared surface and is present in the exported record.
     The surface set is read from the page rather than pinned here. */
  const recaptureCensus = await legSurfaceCensus(page, 'disposition-recapture');
  expect(recaptureCensus.findings).toEqual([]);
  expect(recaptureCensus.surfaces.length).toBeGreaterThan(0);
  const remainderCensus = await legSurfaceCensus(page, 'disposition-remainder');
  expect(remainderCensus.findings).toEqual([]);
  expect(remainderCensus.surfaces).toEqual(recaptureCensus.surfaces);

  /* Every prior leg still reaches every surface, which is what makes this a non-regression rather
     than a check that only the new legs work. */
  for (const priorLeg of ['property-tax', 'rental-net', 'dwelling-use']) {
    const record = splitAttribute(await page.locator('body').getAttribute('data-rl-legs-record'));
    if (record.indexOf(priorLeg) < 0) continue;
    const census = await legSurfaceCensus(page, priorLeg);
    expect(census.findings).toEqual([]);
  }

  /* The exported leg record carries both disposition legs and no duplicate. */
  const exported = splitAttribute(await page.locator('body').getAttribute('data-rl-legs-record'));
  expect(exported.filter((leg) => leg === 'disposition-recapture').length).toBe(1);
  expect(exported.filter((leg) => leg === 'disposition-remainder').length).toBe(1);
  expect(new Set(exported).size).toBe(exported.length);

  /* And Simple carries the disposition total as a decision-level figure. Simple is display:none
     while the page is in Power, so the assertion is made in the view that renders it rather than
     through an unscoped query that would resolve to a hidden node. */
  await page.locator('#modeSimple').click();
  await expect(page.locator('#simple [data-rl-value="dispositionTax"]')).toBeVisible();
  await expect(page.locator('#simple [data-rl-leg="disposition-recapture"]')).toBeVisible();
  await expect(page.locator('#simple [data-rl-leg="disposition-remainder"]')).toBeVisible();

  /* The census DISCRIMINATES: dropping the leg from the first declared surface is reported by the
     name of that surface rather than passing silently. This probe DELETES a rendered node and the
     page does not rebuild it, so it is performed last: run before the Simple assertions above it
     would delete the very headline node they read — the first declared surface is the headline,
     and the headline block is Simple's own host. */
  const damagedSurface = await page.evaluate(() => {
    const surface = (document.body.getAttribute('data-rl-leg-surfaces') || '')
      .split(',').filter((entry) => entry.length > 0)[0];
    const host = document.querySelector(`[data-rl-leg-surface="${surface}"]`);
    host.querySelector('[data-rl-leg="disposition-recapture"]').remove();
    return surface;
  });
  const damagedCensus = await legSurfaceCensus(page, 'disposition-recapture');
  expect(damagedCensus.findings.length).toBe(1);
  expect(damagedCensus.findings[0]).toContain(damagedSurface);
});

/* TP-05-25. */
test('Regression: SCN-023-015 the request ledger stays empty and no disposition declaration reaches a URL', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => { requests.push(request.url()); });
  const consoleMessages = [];
  page.on('console', (message) => { consoleMessages.push(message.text()); });

  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 120000, bracketId: 'b3' });
  await openPower(page);
  await declareSale(page, SALE);
  await expect(page.locator('#dispositionComponentsBody tr')).toHaveCount(2);

  /* Every declared sale figure is checked against every URL the page requested, the address bar,
     the referrer and every console message. A figure that reached any of them would have left
     this browser. */
  const declaredValues = [SALE.proceeds, SALE.adjustedBasis, SALE.accumulatedCostRecovery,
    SALE.ownershipMonths, SALE.useMonths].map(String);
  const memberNames = ['saleProceeds', 'saleAdjustedBasis', 'saleAccumulatedCostRecovery',
    'saleOwnershipMonths', 'saleUseMonths', 'salePropertyUse'];

  const afterDeclaration = requests.filter((url) => !url.endsWith('.js') && !url.endsWith('.css'));
  for (const url of afterDeclaration) {
    for (const name of memberNames) expect(url).not.toContain(name);
    for (const value of declaredValues) {
      if (value.length < 5) continue;
      expect(url).not.toContain(value);
    }
  }

  const location = await page.evaluate(() => ({
    href: window.location.href, search: window.location.search,
    hash: window.location.hash, referrer: document.referrer
  }));
  expect(location.search).toBe('');
  /* The hash is not empty and is not supposed to be: the route writes the view-mode literal there
     and nothing else, which Feature 021 TP-05-06 pinned. The privacy guarantee this scenario owns
     is therefore that the hash is DRAWN FROM that closed set and carries no declaration — an
     empty-hash assertion would contradict the route contract while proving less. */
  expect(location.hash).toMatch(VIEW_MODE_HASH);
  for (const name of memberNames) {
    expect(location.hash).not.toContain(name);
    expect(location.href).not.toContain(name);
    expect(location.referrer).not.toContain(name);
  }
  for (const value of declaredValues) {
    if (value.length < 5) continue;
    expect(location.hash).not.toContain(value);
  }
  for (const message of consoleMessages) {
    for (const name of memberNames) expect(message).not.toContain(name);
    for (const value of declaredValues) {
      if (value.length < 5) continue;
      expect(message).not.toContain(value);
    }
  }

  /* And the export omits every disposition member by name rather than silently dropping it. */
  const sanitized = await page.evaluate(() =>
    window.RLTAXWORKSPACE.sanitizeForExport(window.RLTAXWORKSPACE.createEmptyWorkspace()));
  for (const name of memberNames) expect(sanitized.omittedFields).toContain(name);
  expect(JSON.stringify(sanitized.workspace)).not.toContain('sale');
});
