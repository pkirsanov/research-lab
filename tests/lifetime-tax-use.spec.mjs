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
   assertion carrying its own 14 would keep passing against a pack that lost the figure; one that
   reads the pack cannot. */
const DAY_FIGURE = FEDERAL_PACK.useClassification.personalUseDayFigure.days;
const PERCENTAGE = FEDERAL_PACK.useClassification.personalUsePercentageFigure.rate;
const THRESHOLD_DAYS = FEDERAL_PACK.useClassification.minimalRentalUseThreshold.days;

/* Serving a fixture pack AT the declared pack path is how a refusal branch is exercised over the
   real route without inventing a tax figure and without presenting a fixture as an authority. The
   shipped pack is unchanged and these packs are reachable only from this spec. */
function packServing(mutate) {
  const pack = JSON.parse(readFileSync(join(ROOT, FEDERAL_PACK_PATH), 'utf8'));
  mutate(pack);
  return { [FEDERAL_PACK_PATH]: JSON.stringify(pack) };
}

const BASE_RENTAL = {
  rentalIncome: 40000, operatingExpenses: 9350, depreciableBasis: 160000,
  placedInServiceMonth: 2, recoveryYearOrdinal: 1, atRiskAmount: 500000,
  modifiedAdjustedGrossIncome: 90000, openingSuspendedLoss: 0, activeParticipation: 'yes'
};

async function declareRental(page, values) {
  const fill = async (selector, value) => {
    await page.fill(selector, value === undefined || value === null ? '' : String(value));
  };
  await fill('#inputRentalIncome', values.rentalIncome);
  await fill('#inputRentalOperatingExpenses', values.operatingExpenses);
  await fill('#inputRentalDepreciableBasis', values.depreciableBasis);
  await fill('#inputRentalPlacedInServiceMonth', values.placedInServiceMonth);
  await fill('#inputRentalRecoveryYearOrdinal', values.recoveryYearOrdinal);
  await fill('#inputRentalAtRiskAmount', values.atRiskAmount);
  await fill('#inputRentalModifiedAdjustedGrossIncome', values.modifiedAdjustedGrossIncome);
  await fill('#inputRentalOpeningSuspendedLoss', values.openingSuspendedLoss);
  if (values.activeParticipation !== undefined) {
    await page.selectOption('#inputRentalActiveParticipation', values.activeParticipation);
  }
}

/* The two day counts, declared last so the classification runs against a complete rental. */
async function declareUseDays(page, fairRentalDays, personalUseDays) {
  await page.fill('#inputRentalFairRentalDays', String(fairRentalDays));
  await page.fill('#inputRentalPersonalUseDays', String(personalUseDays));
}

async function comparisonResult(page, comparisonId) {
  return page.locator(`#useComparisonsBody tr[data-rl-use-comparison="${comparisonId}"] td[data-rl-result]`)
    .getAttribute('data-rl-result');
}

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* TP-04-22. */
test('Regression: SCN-023-010 the classification publishes its sourced parameters and refuses without them', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 90000, bracketId: 'b3' });
  await openPower(page);
  await declareRental(page, BASE_RENTAL);
  await declareUseDays(page, 100, 40);

  /* The category is published, and so are the two declared counts that produced it. */
  await expect(page.locator('#useCategoryLine')).toContainText('Category:');
  await expect(page.locator('#useDeclarationsBody tr')).toHaveCount(2);
  await expect(page.locator('#useDeclarationsBody tr[data-rl-use-declaration="0"] td').nth(1))
    .toContainText('100');
  await expect(page.locator('#useDeclarationsBody tr[data-rl-use-declaration="1"] td').nth(1))
    .toContainText('40');
  const declaredOrigins = await page.locator('#useDeclarationsBody td[data-rl-origin]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-origin')));
  expect(declaredOrigins.length).toBe(2);
  expect(declaredOrigins.every((origin) => origin === 'declared')).toBe(true);

  /* All three sourced parameters are rendered WITH the section each was transcribed from. A
     parameter rendered without its locator would be a figure the reader cannot check. */
  await expect(page.locator('#useParametersBody tr')).toHaveCount(3);
  await expect(page.locator('#useParametersBody tr[data-rl-use-parameter="personal-use-day-figure"] td').nth(1))
    .toContainText(String(DAY_FIGURE));
  await expect(page.locator('#useParametersBody tr[data-rl-use-parameter="personal-use-percentage"] td').nth(1))
    .toContainText(String(PERCENTAGE));
  await expect(page.locator('#useParametersBody tr[data-rl-use-parameter="minimal-rental-use-threshold"] td').nth(1))
    .toContainText(String(THRESHOLD_DAYS));
  const dayCitation = await page
    .locator('#useParametersBody tr[data-rl-use-parameter="personal-use-day-figure"] td').nth(3).textContent();
  expect(dayCitation).toContain(FEDERAL_PACK.useClassification.personalUseDayFigure.locator.slice(0, 40));
  const parameterOrigins = await page.locator('#useParametersBody td[data-rl-origin]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-origin')));
  expect(parameterOrigins.every((origin) => origin === 'sourced')).toBe(true);

  /* Every comparison performed is rendered as its left side, its operator, its right side and its
     result, which is what lets a reader see which side of each line the household landed on. */
  await expect(page.locator('#useComparisonsBody tr')).toHaveCount(4);
  await expect(page.locator('#useComparisonsBody tr[data-rl-use-comparison="personal-use-versus-day-figure"] td[data-rl-operator]'))
    .toHaveAttribute('data-rl-operator', FEDERAL_PACK.useClassification.personalUseDayFigure.comparisonOperator);
  await expect(page.locator('#usePercentageBasisLine'))
    .toContainText(FEDERAL_PACK.useClassification.personalUsePercentageFigure.comparedAgainst);

  /* The classification is VISIBLE to the reader in whichever view is open, which is what lets a
     household see why the dwelling was classified rather than only that it was. Scoping matters:
     the page is in Power here, and Simple is display:none by design, so an unscoped `.first()`
     resolves to the Simple headline node and reports hidden while the classification is on screen
     in front of the reader. Both views are therefore checked where each one renders it. */
  await expect(page.locator('#power-use #useCategoryLine')).toBeVisible();
  await expect(page.locator('#legCompositionBody tr[data-rl-leg="dwelling-use"]')).toBeVisible();
  await expect(page.locator('#simple [data-rl-leg="dwelling-use"]')).toHaveCount(1);
  await page.locator('#modeSimple').click();
  await expect(page.locator('#simple [data-rl-leg="dwelling-use"]')).toBeVisible();
  await expect(page.locator('#simple [data-rl-value="dwellingUseCategory"]')).toBeVisible();
  await openPower(page);

  /* A pack whose day figure was not retrieved refuses the classification, assigns NO category, and
     produces no rental figure at all. */
  const absentDay = packServing((pack) => {
    pack.useClassification.personalUseDayFigure = {
      contractVersion: 'AbsentFigure/v1', code: 'RLTAX-THRESHOLD-UNAVAILABLE',
      domain: 'use-classification:personalUseDayFigure',
      reason: 'This fixture pack deliberately carries no personal-use day figure.',
      whatWouldMakeItAvailable: 'Retrieve the day figure from its primary source.',
      missingSource: {
        title: 'Absent dwelling-use parameter fixture pointer',
        url: 'https://www.irs.gov/publications/p527',
        documentKind: 'publication', locator: 'Deliberately unretrieved.'
      }
    };
  });
  const absentSite = await startStaticServer({ overrides: absentDay });
  try {
    await openLifetimeTax(page, absentSite);
    await declareOrdinaryHousehold(page, { ordinary: 90000, bracketId: 'b3' });
    await openPower(page);
    await declareRental(page, BASE_RENTAL);
    await declareUseDays(page, 100, 40);
    const refusal = page.locator('#useRefusal [data-rl-unavailable]');
    await expect(refusal).toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
    await expect(page.locator('#useComparisonsBody tr')).toHaveCount(0);
    await expect(page.locator('#useCategoryLine')).toContainText('No category was assigned');
    await expect(page.locator('[data-rl-leg="dwelling-use"]')).toHaveCount(0);
    await expect(page.locator('[data-rl-leg="rental-net"]')).toHaveCount(0);
  } finally {
    await absentSite.close();
  }
});

/* TP-04-23. */
test('Regression: SCN-023-011 the three Publication 527 boundaries land on the side the publication states', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 90000, bracketId: 'b3' });
  await openPower(page);
  await declareRental(page, BASE_RENTAL);

  /* Boundary one, at EXACTLY the sourced day figure. The rental-day count makes the day figure the
     greater of the two candidates, which isolates this comparison from the percentage one. */
  const rentalDaysIsolatingDayFigure = 100;
  expect(DAY_FIGURE).toBeGreaterThan(rentalDaysIsolatingDayFigure * PERCENTAGE);
  await declareUseDays(page, rentalDaysIsolatingDayFigure, DAY_FIGURE);
  await expect(page.locator('#useCategoryLine')).toContainText('not-a-residence');
  expect(await comparisonResult(page, 'personal-use-versus-day-figure')).toBe('false');
  await expect(page.locator('#useComparisonsBody tr[data-rl-use-comparison="personal-use-versus-day-figure"] td').nth(3))
    .toHaveText(String(DAY_FIGURE));

  await declareUseDays(page, rentalDaysIsolatingDayFigure, DAY_FIGURE + 1);
  await expect(page.locator('#useCategoryLine')).toContainText('residence-rented-at-or-above-threshold');
  expect(await comparisonResult(page, 'personal-use-versus-day-figure')).toBe('true');

  await declareUseDays(page, rentalDaysIsolatingDayFigure, DAY_FIGURE - 1);
  await expect(page.locator('#useCategoryLine')).toContainText('not-a-residence');

  /* Boundary two, at EXACTLY the sourced percentage of the declared rental days. The rental-day
     count makes the percentage the greater candidate, isolating it from the day figure. */
  const rentalDaysIsolatingPercentage = 270;
  const percentagePoint = rentalDaysIsolatingPercentage * PERCENTAGE;
  expect(Number.isInteger(percentagePoint)).toBe(true);
  expect(percentagePoint).toBeGreaterThan(DAY_FIGURE);
  await declareUseDays(page, rentalDaysIsolatingPercentage, percentagePoint);
  await expect(page.locator('#useCategoryLine')).toContainText('not-a-residence');
  expect(await comparisonResult(page, 'personal-use-versus-percentage-of-rental-days')).toBe('false');
  await expect(page.locator('#useComparisonsBody tr[data-rl-use-comparison="personal-use-versus-percentage-of-rental-days"] td').nth(3))
    .toHaveText(String(percentagePoint));

  await declareUseDays(page, rentalDaysIsolatingPercentage, percentagePoint + 1);
  await expect(page.locator('#useCategoryLine')).toContainText('residence-rented-at-or-above-threshold');
  expect(await comparisonResult(page, 'personal-use-versus-percentage-of-rental-days')).toBe('true');

  /* Boundary three, at EXACTLY the fewer-than-threshold rental-days figure. */
  await declareUseDays(page, THRESHOLD_DAYS, 60);
  await expect(page.locator('#useCategoryLine')).toContainText('residence-rented-at-or-above-threshold');
  expect(await comparisonResult(page, 'rental-days-versus-minimal-use-threshold')).toBe('false');

  await declareUseDays(page, THRESHOLD_DAYS - 1, 60);
  await expect(page.locator('#useCategoryLine')).toContainText('residence-minimal-rental-use');
  expect(await comparisonResult(page, 'rental-days-versus-minimal-use-threshold')).toBe('true');

  /* An implementation that read the day-figure comparison as inclusive where the publication
     states it strictly lands on the other side of that exact boundary. Serving the inclusive
     operator is how that defect is exercised over the real route rather than described. */
  const inclusiveSite = await startStaticServer({
    overrides: packServing((pack) => {
      pack.useClassification.personalUseDayFigure.comparisonOperator = 'at-least';
    })
  });
  try {
    await openLifetimeTax(page, inclusiveSite);
    await declareOrdinaryHousehold(page, { ordinary: 90000, bracketId: 'b3' });
    await openPower(page);
    await declareRental(page, BASE_RENTAL);
    await declareUseDays(page, rentalDaysIsolatingDayFigure, DAY_FIGURE);
    await expect(page.locator('#useCategoryLine')).toContainText('residence-rented-at-or-above-threshold');
    expect(await comparisonResult(page, 'personal-use-versus-day-figure')).toBe('true');
  } finally {
    await inclusiveSite.close();
  }
});

/* TP-04-24. */
test('Regression: SCN-023-012 the under-threshold exception excludes the income and deducts no rental expense', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, {
    ordinary: 90000, bracketId: 'b3', deductionMode: 'itemized', itemizedAmount: 0
  });
  await openPower(page);
  await declareRental(page, Object.assign({}, BASE_RENTAL, {
    rentalIncome: 9000, operatingExpenses: 4000
  }));
  await declareUseDays(page, THRESHOLD_DAYS - 1, 60);

  await expect(page.locator('#useCategoryLine')).toContainText('residence-minimal-rental-use');

  /* The exclusion is STATED as the reason. A zero net result in its place would be a different
     claim, and the wording is what distinguishes them. */
  const carryoverLine = page.locator('#useCarryoverLine');
  await expect(carryoverLine).toContainText('excluded from income');
  await expect(carryoverLine).toContainText('exclusion, not a rental that settled to nothing');
  await expect(carryoverLine).toContainText('unallocated');

  /* No rental figure and no rental leg, and no deduction-order tier: nothing was deducted. */
  await expect(page.locator('[data-rl-leg="rental-net"]')).toHaveCount(0);
  await expect(page.locator('#useDeductionOrderBody tr')).toHaveCount(0);
  await expect(page.locator('#useAllocationsBody tr')).toHaveCount(0);

  /* The deduction composition carries no allocated dwelling component, because nothing was
     allocated. The property and interest declarations remain available to it whole. */
  await expect(page.locator('#deductionCompositionBody tr [data-rl-personal-portion]')).toHaveCount(0);
  const componentOrigins = await page.locator('#deductionCompositionBody td[data-rl-origin]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-origin')));
  expect(componentOrigins.every((origin) => origin === 'declared' || origin === 'computed')).toBe(true);
});

/* TP-04-25. */
test('Regression: SCN-023-013 mixed use allocates by declared days and the personal portion reaches the composition', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, {
    ordinary: 90000, bracketId: 'b3', deductionMode: 'itemized', itemizedAmount: 0
  });
  await openPower(page);
  await declareRental(page, Object.assign({}, BASE_RENTAL, {
    rentalIncome: 12000, operatingExpenses: 20000
  }));
  await declareUseDays(page, 100, 50);

  await expect(page.locator('#useCategoryLine')).toContainText('residence-rented-at-or-above-threshold');

  /* Each allocated figure is rendered beside the basis that divided it, so the division is
     inspectable rather than asserted. */
  const allocationRows = page.locator('#useAllocationsBody tr');
  await expect(allocationRows).toHaveCount(2);
  await expect(page.locator('#useAllocationsBody tr[data-rl-allocation="operating-expenses"] td').nth(2))
    .toContainText('100');
  await expect(page.locator('#useAllocationsBody tr[data-rl-allocation="operating-expenses"] td').nth(2))
    .toContainText('150');
  await expect(page.locator('#useAllocationsBody tr[data-rl-allocation="cost-recovery"]')).toHaveCount(1);
  await expect(page.locator('#useAllocationLine'))
    .toContainText(FEDERAL_PACK.useClassification.allocationRule.basis);

  /* The personal portion is present and is not a discarded figure. */
  const personalCells = page.locator('#useAllocationsBody td[data-rl-personal-portion]');
  await expect(personalCells).toHaveCount(2);
  const personalTexts = await personalCells.evaluateAll((nodes) => nodes.map((node) => node.textContent));
  expect(personalTexts.every((entry) => entry && entry.trim().length > 0)).toBe(true);

  /* The sourced deduction order is applied and every carried-over amount is published beside the
     tier that could not reach it. */
  const tierRows = page.locator('#useDeductionOrderBody tr');
  await expect(tierRows).toHaveCount(FEDERAL_PACK.useClassification.deductionOrdering.tiers.length);
  const tierOrders = await page.locator('#useDeductionOrderBody tr td:first-child')
    .evaluateAll((nodes) => nodes.map((node) => Number(node.textContent)));
  expect(tierOrders).toEqual(tierOrders.slice().sort((left, right) => left - right));
  expect(new Set(tierOrders).size).toBe(tierOrders.length);
  await expect(page.locator('#useDeductionOrderBody td[data-rl-carried-over]')).toHaveCount(tierOrders.length);
  await expect(page.locator('#useCarryoverLine')).toContainText('Carried forward to the next year');

  /* FR-023-027. The personal portion reaches the itemised composition as a named component with
     origin "computed", rather than being discarded at the allocation. */
  const dwellingComponents = page.locator('#deductionCompositionBody tr td[data-rl-disallowed^="dwelling-personal"]');
  await expect(dwellingComponents).toHaveCount(2);
  const dwellingRow = page.locator('#deductionCompositionBody tr')
    .filter({ has: page.locator('td[data-rl-disallowed="dwelling-personal-operating"]') }).first();
  await expect(dwellingRow.locator('td[data-rl-origin]')).toHaveAttribute('data-rl-origin', 'computed');

  /* FR-023-028. The classification and the category's leg reach the comparison and the curve
     surfaces as well as the headline. */
  await expect(page.locator('#legCompositionBody tr[data-rl-leg="dwelling-use"]')).toHaveCount(1);
  await expect(page.locator('#curveLegContributorsBody tr[data-rl-leg="dwelling-use"]')).toHaveCount(1);
  await expect(page.locator('#legCompositionBody tr[data-rl-leg="rental-net"]')).toHaveCount(1);
  await expect(page.locator('#curveLegContributorsBody tr[data-rl-leg="rental-net"]')).toHaveCount(1);
  await expect(page.locator('#legCompositionBody tr[data-rl-leg="property-tax"], #legCompositionBody tr[data-rl-leg="ordinary"]').first())
    .toBeVisible();
  const exportedLegs = await page.locator('body').getAttribute('data-rl-legs-record');
  expect(exportedLegs.split(',')).toContain('dwelling-use');
  expect(exportedLegs.split(',')).toContain('rental-net');
});
