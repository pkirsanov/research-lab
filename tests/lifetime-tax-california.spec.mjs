import { expect, test } from './playwright-runtime.mjs';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startStaticServer } from './provider-credentials.support.mjs';
import { declareOrdinaryHousehold, openLifetimeTax, openPower } from './lifetime-tax.support.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const californiaRequire = createRequire(import.meta.url);
const RULES = californiaRequire('../rltaxrules.js');

/* The shipped California pack, read here so every expectation below is checked against the order
   and the mechanism the pack actually declares rather than against a stage id this file states.
   Nothing in this file names a rate, a bracket edge, a deduction amount or a credit amount. */
const CALIFORNIA = JSON.parse(readFileSync(join(ROOT, 'tax-rules/state/CA/2026.json'), 'utf8'));

/* The preferential stages are DERIVED from the engine's own two orders rather than listed: the
   stages a preferential pack carries that a no-preferential pack does not. Listing them would make
   this file the authority on which stages are preferential, and a later stage added to the
   preferential order would then slip past unasserted. */
const PREFERENTIAL_ORDER = RULES.calculationOrderFor({ preferentialPolicy: 'own-schedule' });
const POOLED_ORDER = RULES.calculationOrderFor({ preferentialPolicy: 'none' });
const PREFERENTIAL_ONLY_STAGES = PREFERENTIAL_ORDER.filter((stage) => POOLED_ORDER.indexOf(stage) < 0);

const RATE_STAGE = 'CO-6';
const LEG_SUM_STAGE = 'CO-8';
const CREDIT_STAGE = 'CO-13';

async function declareResidency(page, jurisdiction, pattern) {
  await page.fill('#inputResidencyJurisdiction', jurisdiction === null ? '' : jurisdiction);
  await page.selectOption('#inputResidencyPattern', pattern === null ? '' : pattern);
}

/* The rendered stage ids, in DOM order. The page walks the pack's own declared order in sequence,
   so reading the order back off the DOM is what makes a stage's POSITION an observable browser
   behaviour rather than a property of the JSON. The page appends one further row for the total,
   which is not a declared stage; it is kept in the returned list rather than filtered out so a
   stage that went missing could not hide behind a length that still matched. */
async function renderedStageOrder(page) {
  return page.locator('#stateStagesBody tr[data-rl-state-stage]').evaluateAll(
    (rows) => rows.map((row) => row.getAttribute('data-rl-state-stage')));
}

const TOTAL_ROW = 'total';

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('Regression: SCN-022-010 California renders no preferential stage and a long term gain reaches the identical state result an equal ordinary amount reaches', async ({ page }) => {
  /* The two households differ only in WHERE the same total sits: one holds part of it as a
     long-term gain, the other holds all of it as ordinary income. */
  const ORDINARY_ONLY = 400000;
  const GAIN_PORTION = 150000;

  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: ORDINARY_ONLY - GAIN_PORTION, longTermCapitalGain: GAIN_PORTION });
  await declareResidency(page, 'state:CA', 'full-year-resident');

  const gainFederal = await page.locator('[data-rl-value="headlineFederalTax"]').textContent();
  expect(gainFederal).toMatch(/^\$[\d,]+$/);

  const gainRefusal = page.locator('#stateSettlementCard [data-rl-unavailable]');
  const gainRefusalCode = await gainRefusal.getAttribute('data-rl-unavailable');
  const gainRefusalDomain = await gainRefusal.getAttribute('data-rl-unavailable-domain');
  const gainCardText = await page.locator('#stateSettlementCard').innerText();

  await openPower(page);
  const gainStages = await renderedStageOrder(page);

  /* The declared order the page walks omits every stage that exists only in the preferential
     order, and the rendered rows are that order element for element. A preferential stage is
     therefore not merely absent from the JSON — it is absent from what the household sees. */
  expect(PREFERENTIAL_ONLY_STAGES.length).toBeGreaterThan(0);
  expect(gainStages).toEqual(CALIFORNIA.calculationOrder.concat([TOTAL_ROW]));
  for (const stage of PREFERENTIAL_ONLY_STAGES) {
    expect(gainStages).not.toContain(stage);
    await expect(page.locator(`[data-rl-state-stage="${stage}"]`)).toHaveCount(0);
  }
  expect(CALIFORNIA.preferentialPolicy).toBe('none');

  /* The same total held entirely as ordinary income. */
  await page.locator('#modeSimple').click();
  await declareOrdinaryHousehold(page, { ordinary: ORDINARY_ONLY, longTermCapitalGain: 0 });
  await declareResidency(page, 'state:CA', 'full-year-resident');

  const ordinaryFederal = await page.locator('[data-rl-value="headlineFederalTax"]').textContent();
  expect(ordinaryFederal).toMatch(/^\$[\d,]+$/);

  const ordinaryRefusal = page.locator('#stateSettlementCard [data-rl-unavailable]');
  await expect(ordinaryRefusal).toHaveAttribute('data-rl-unavailable', gainRefusalCode);
  await expect(ordinaryRefusal).toHaveAttribute('data-rl-unavailable-domain', gainRefusalDomain);
  expect(await page.locator('#stateSettlementCard').innerText()).toBe(gainCardText);

  await openPower(page);
  expect(await renderedStageOrder(page)).toEqual(gainStages);

  /* The state result is identical for the two households while the FEDERAL result is not: the
     federal settlement carves the gain into a preferential band and California pools it. Without
     this half the identical state result would be consistent with a page that had simply stopped
     reacting to the household at all. */
  expect(ordinaryFederal).not.toBe(gainFederal);

  /* And nothing stands in for the pooled figure: no dollar amount is rendered in the state card. */
  expect(gainCardText).not.toMatch(/\$\s?\d/);
});

test('Regression: SCN-022-011 the exemption credit stage is rendered after the rate and the leg sum and refuses rather than resolving to zero', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 400000 });
  await declareResidency(page, 'state:CA', 'full-year-resident');
  await openPower(page);

  const stages = await renderedStageOrder(page);
  const creditIndex = stages.indexOf(CREDIT_STAGE);
  const rateIndex = stages.indexOf(RATE_STAGE);
  const legSumIndex = stages.indexOf(LEG_SUM_STAGE);

  /* All three stages are rendered, and the credit is rendered AFTER both the rate stage and the
     stage that sums the legs. The page walks the pack's declared order in sequence, so this is
     the pack's application point observed rather than restated. */
  expect(creditIndex).toBeGreaterThan(-1);
  expect(rateIndex).toBeGreaterThan(-1);
  expect(legSumIndex).toBeGreaterThan(-1);
  expect(creditIndex).toBeGreaterThan(rateIndex);
  expect(creditIndex).toBeGreaterThan(legSumIndex);

  /* The mechanism the rendered stage belongs to is a credit against tax applied after rate
     application, naming the ordinary leg alone. A mechanism that reduced INCOME would be applied
     before the rate and would therefore render before it. */
  const mechanism = CALIFORNIA.reliefMechanisms[0];
  expect(mechanism.kind).toBe('credit-against-tax');
  expect(mechanism.applicationPoint).toBe('after-rate-application');
  expect(mechanism.appliesToLegs).toEqual(['state-ordinary']);
  expect(CALIFORNIA.calculationOrder.indexOf(CREDIT_STAGE))
    .toBeGreaterThan(CALIFORNIA.calculationOrder.indexOf(RATE_STAGE));
  expect(CALIFORNIA.calculationOrder.indexOf(CREDIT_STAGE))
    .toBeGreaterThan(CALIFORNIA.calculationOrder.indexOf(LEG_SUM_STAGE));

  /* The credit stage refuses rather than resolving to zero. The row states it was not reached and
     carries no figure at all — a rendered "$0" here would tell a household it claimed nothing,
     which is a different and false statement from "this was never computed". */
  const creditRow = page.locator(`[data-rl-state-stage="${CREDIT_STAGE}"]`);
  await expect(creditRow).toHaveCount(1);
  await expect(creditRow).toContainText('not reached in this settlement');
  expect(await creditRow.innerText()).not.toMatch(/\$\s?\d/);

  /* The credit's absence is stated as an absence rather than as an amount, with the reason and the
     named missing authority both reaching the reader. */
  const creditAmount = mechanism.amounts['single'];
  expect(creditAmount.contractVersion).toBe('AbsentFigure/v1');
  expect(creditAmount.whatWouldMakeItAvailable.length).toBeGreaterThan(0);
  expect(creditAmount.missingSource.title.length).toBeGreaterThan(0);

  /* And no dollar figure is rendered anywhere in the state card, so no stage of this settlement
     silently prices the household. */
  expect(await page.locator('#stateSettlementCard').innerText()).not.toMatch(/\$\s?\d/);
});
