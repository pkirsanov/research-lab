import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import {
  collectRequests,
  declaredPackPaths,
  declareOrdinaryHousehold,
  openLifetimeTax,
  openPower
} from './lifetime-tax.support.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/* SUP-023-10, as replaced by SUP-024-09. The permitted-asset set is DERIVED from the page's own
   script tags and from every pack path the configuration declares, so the medicare pack this
   scope introduces is admitted by its own declaration rather than by a literal edited here. */
function declaredRouteAssets() {
  const routeSource = readFileSync(join(ROOT, 'lifetime-tax-strategy-lab.html'), 'utf8');
  const config = JSON.parse(readFileSync(join(ROOT, 'lifetime-tax-strategy.config.json'), 'utf8'));
  const scripts = Array.from(routeSource.matchAll(/<script src="([^"]+)"><\/script>/g))
    .map((match) => '/' + match[1]);
  const packs = declaredPackPaths(config).map((path) => '/' + path);
  return ['/lifetime-tax-strategy-lab.html', '/lifetime-tax-strategy.config.json']
    .concat(scripts).concat(packs).concat(['/favicon.ico']);
}

const MEDICARE_PACK = JSON.parse(readFileSync(join(ROOT, 'tax-rules/medicare/2026.json'), 'utf8'));
const PREMIUM_YEAR = MEDICARE_PACK.medicarePolicy.premiumYear;
const OFFSET_YEARS = MEDICARE_PACK.medicarePolicy.lookbackOffsetYears.value;
/* Derived from the pack rather than pinned, so a pack whose offset changes moves this expectation
   with it instead of leaving the spec asserting a year the product no longer requires. */
const REQUIRED_YEAR = PREMIUM_YEAR - OFFSET_YEARS;

/* The first bracket boundary the individual set states. Read from the pack so the exact-boundary
   row below is asserted at the SOURCED figure and cannot drift into asserting a recalled one. */
const INDIVIDUAL_BRACKETS = MEDICARE_PACK.medicarePolicy.bracketSets['individual-return'];
const FIRST_BOUNDARY = INDIVIDUAL_BRACKETS[1].lowerBound;

async function declareLookback(page, amount, year) {
  await page.fill('#inputLookbackYear', String(year === undefined ? REQUIRED_YEAR : year));
  await page.fill('#inputLookbackModifiedAdjustedGrossIncome', String(amount));
}

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* TP-04-24. */
test('Regression: SCN-024-010 an undeclared lookback names the year required and a wrong lookback year refuses naming the offset', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await openPower(page);

  /* Undeclared: the refusal names the exact year required AND the offset that produced it, so the
     household is told what to supply rather than that something is wrong. */
  const refusal = page.locator('#medicareRefusal [data-rl-unavailable]').first();
  await expect(refusal).toHaveAttribute('data-rl-unavailable', 'RLTAX-INPUT-INCOMPLETE');
  const undeclaredText = await refusal.innerText();
  expect(undeclaredText).toContain(String(REQUIRED_YEAR));
  expect(undeclaredText).toContain(String(OFFSET_YEARS));
  expect(undeclaredText).toContain('Unavailable because');
  expect(undeclaredText).toContain('What would make it available:');
  /* No premium is computed while the declaration is missing. */
  await expect(page.locator('#medicareLegBody tr')).toHaveCount(0);

  /* A year that is not the premium year minus the pack's offset refuses naming all three. */
  await declareLookback(page, 150000, REQUIRED_YEAR - 1);
  await openPower(page);
  const mismatch = page.locator('#medicareRefusal [data-rl-unavailable]').first();
  await expect(mismatch).toHaveAttribute('data-rl-unavailable', 'RLTAX-PACK-YEAR-MISMATCH');
  const mismatchText = await mismatch.innerText();
  expect(mismatchText).toContain(String(REQUIRED_YEAR - 1));
  expect(mismatchText).toContain(String(PREMIUM_YEAR));
  expect(mismatchText).toContain(String(REQUIRED_YEAR));
});

/* TP-04-25. */
test('Regression: SCN-024-011 the bracket is selected at the exact boundary and both part adjustments are shown with their citations', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });

  /* EXACTLY on the first sourced boundary. The publication's own operator for the row above it is
     `greater-than`, so a household sitting on the figure belongs to the row BELOW. Asserting at
     the exact figure is what makes the inclusivity readable rather than assumed. */
  await declareLookback(page, FIRST_BOUNDARY);
  await openPower(page);
  const atBoundary = await page.locator('#medicareBracketLine').innerText();
  /* Anchored on the index the line LEADS with. A bare substring test would be satisfied by any
     digit inside the quoted range the same line prints, so a bracket selected one row too high
     could still carry the index this clause is looking for. */
  const namesBracket = (line, index) => new RegExp('^Bracket ' + String(index) + ' of the ').test(line);
  expect(namesBracket(atBoundary, INDIVIDUAL_BRACKETS[0].bracketIndex), atBoundary).toBe(true);

  /* One dollar above the same boundary lands in the next row, so the assertion above is not
     passing because every income lands in the same place. */
  await declareLookback(page, FIRST_BOUNDARY + 1);
  await openPower(page);
  const aboveBoundary = await page.locator('#medicareBracketLine').innerText();
  expect(namesBracket(aboveBoundary, INDIVIDUAL_BRACKETS[1].bracketIndex), aboveBoundary).toBe(true);
  expect(aboveBoundary).not.toBe(atBoundary);

  /* The operator itself is shown, so the inclusivity is readable on the page. */
  expect(aboveBoundary.toLowerCase()).toMatch(/greater than|above|greater-than/);
});

/* TP-04-26. */
test('Regression: SCN-024-012 the annual Medicare cost is rendered beside the headline and no premium leg is inside the federal tax total', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await declareLookback(page, FIRST_BOUNDARY + 1);

  /* Simple carries the annual Medicare cost BESIDE the headline, labelled as not part of the
     federal tax total. This is decision-level information rather than a Power drill-down. */
  const costCard = page.locator('#annualMedicareCostCard [data-rl-cost-beside-total]');
  await expect(costCard).toBeVisible();
  const costText = await costCard.innerText();
  expect(costText).toContain('not part of the federal tax total');

  /* The federal headline declares the leg set it SUMMED. Every premium leg the settlement actually
     settled must be absent from it, because that total is the federal tax and a premium is not one.
     Reading `data-rl-reconciliation-legs` instead would be vacuous: that attribute publishes the
     reconciliation IDENTITY ids (L1 … L6), among which a premium leg id can never appear, so the
     clause could not fail however the legs were classified. Both sides are asserted here, and the
     settled premium set is required non-empty, so the clause cannot pass over an empty set. */
  await openPower(page);
  const federalHeadlineLegs = (await page.locator('#headlineBlock [data-rl-legs]')
    .first().getAttribute('data-rl-legs')).split(',').filter((id) => id.length > 0);
  expect(federalHeadlineLegs.length).toBeGreaterThan(0);
  const recordLegs = (await page.locator('body').getAttribute('data-rl-legs-record'))
    .split(',').filter((id) => id.length > 0);
  const declaredPremiumLegIds = MEDICARE_PACK.medicarePolicy.taxLegs.map((leg) => leg.legId);
  expect(declaredPremiumLegIds.length).toBe(3);
  const settledPremiumLegs = declaredPremiumLegIds.filter((legId) => recordLegs.includes(legId));
  expect(settledPremiumLegs.length).toBeGreaterThan(0);
  settledPremiumLegs.forEach((legId) => expect(federalHeadlineLegs).not.toContain(legId));

  /* And the identity that totals the federal tax is still among the ones evaluated, so the
     exclusion is not being achieved by the reconciliation dropping out altogether. */
  const reconciled = (await page.locator('body').getAttribute('data-rl-reconciliation-legs'))
    .split(',').filter((id) => id.length > 0);
  expect(reconciled).toContain('L4');
});

/* TP-04-27. */
test('Regression: SCN-024-012 all three premium legs reach the headline, the comparison, the curve and the export', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await declareLookback(page, FIRST_BOUNDARY + 1);
  await openPower(page);

  const attributesOf = (selector, attribute) => page.locator(selector)
    .evaluateAll((nodes, name) => nodes.map((node) => node.getAttribute(name)), attribute);

  /* The record set the settlement published, and the four surfaces read from the rendered DOM
     rather than from anything this spec composed. */
  const recordLegs = (await page.locator('body').getAttribute('data-rl-legs-record'))
    .split(',').filter((id) => id.length > 0);
  const federalHeadlineLegs = (await page.locator('#headlineBlock [data-rl-legs]')
    .first().getAttribute('data-rl-legs')).split(',').filter((id) => id.length > 0);
  const headlineHosts = await attributesOf('#headlineBlock [data-rl-leg]', 'data-rl-leg');
  const headlineLegs = federalHeadlineLegs.concat(headlineHosts);
  const comparisonLegs = await attributesOf('#legCompositionBody tr[data-rl-leg]', 'data-rl-leg');
  const curveLegs = await attributesOf('#curveLegContributorsBody tr[data-rl-leg]', 'data-rl-leg');

  /* Every premium leg the settlement actually settled. The shipped pack's Part D standard premium
     was never retrieved, so that leg refuses and surfaces nothing — which is the correct behaviour
     and is why the expectation is derived from what settled rather than from the pack's leg count. */
  const declaredPremiumLegIds = MEDICARE_PACK.medicarePolicy.taxLegs.map((leg) => leg.legId);
  expect(declaredPremiumLegIds.length).toBe(3);
  const settledPremiumLegs = declaredPremiumLegIds.filter((legId) => recordLegs.includes(legId));
  expect(settledPremiumLegs.length).toBeGreaterThan(0);

  /* Two-directional set identity, surface by surface. Asserting only one direction would let a
     surface that invented a leg pass, which is as wrong as one that dropped a leg. */
  const surfaces = { headline: headlineLegs, comparison: comparisonLegs, curve: curveLegs, export: recordLegs };
  expect(recordLegs.length).toBeGreaterThan(settledPremiumLegs.length);
  Object.keys(surfaces).forEach((surface) => {
    const carried = surfaces[surface];
    recordLegs.forEach((legId) => {
      expect(carried, 'leg ' + legId + ' missing from the ' + surface + ' surface').toContain(legId);
    });
    carried.forEach((legId) => {
      expect(recordLegs, 'leg ' + legId + ' invented by the ' + surface + ' surface').toContain(legId);
    });
    settledPremiumLegs.forEach((legId) => {
      expect(carried, 'premium leg ' + legId + ' missing from the ' + surface + ' surface').toContain(legId);
    });
  });

  /* And none of them is inside the federal figure: the headline total declares the legs it summed,
     and no premium leg is among them. Both sides are asserted so the clause cannot pass over an
     empty set. */
  expect(federalHeadlineLegs.length).toBeGreaterThan(0);
  settledPremiumLegs.forEach((legId) => expect(federalHeadlineLegs).not.toContain(legId));
});

/* TP-04-28. */
test('Regression: SCN-024-010 the request ledger stays empty and no lookback declaration reaches a URL', async ({ page }) => {
  const requests = collectRequests(page);
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await declareLookback(page, 168421);
  await openPower(page);

  /* A second year's finances is a household value. It must not appear in any URL the page fetched,
     and the page must have fetched nothing it did not declare. */
  const permitted = declaredRouteAssets();
  const paths = requests.map((request) => new URL(request.url).pathname);
  expect(paths.length).toBeGreaterThan(0);
  paths.forEach((path) => expect(permitted).toContain(path));
  requests.forEach((request) => {
    expect(request.url).not.toContain('168421');
    expect(request.postData).toBe('');
    expect(request.method).toBe('GET');
  });

  /* The medicare pack IS fetched — the derivation admits it because the configuration declares it,
     not because a literal was widened by hand. */
  expect(paths.some((path) => path.indexOf('/tax-rules/medicare/') === 0)).toBe(true);
});
