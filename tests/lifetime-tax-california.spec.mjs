import { expect, test } from './playwright-runtime.mjs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
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

const GROSS_STAGE = 'CO-1';
const DEDUCTION_STAGE = 'CO-2';
const TAXABLE_STAGE = 'CO-3';
const SURCHARGE_STAGE = 'CO-14';
const CALIFORNIA_PACK_PATH = 'tax-rules/state/CA/2026.json';
const FILING_STATUSES = ['single', 'married-filing-jointly', 'married-filing-separately', 'head-of-household'];

/* California's settlement refuses at its unretrieved deduction, before any leg is priced, so on
   the shipped pack every filing status renders the SAME not-reached surcharge stage and no
   crossing point exists to observe. The surcharge threshold is nonetheless the one California
   figure that WAS retrieved, and its invariance across filing statuses is a real behaviour that
   a later edit could silently break.

   It is made observable the way CO-7 and BI-5 made their unreachable branches observable: by
   SERVING a contract fixture at a declared pack path. The fixture supplies the two figures
   California has not got — a deduction and an ordinary schedule — and those are FIXTURE values,
   invented for the contract and labelled as such in the fixture's own source record; they are
   not California's and nothing here presents them as California's.

   The surcharge threshold set is NOT a fixture value. It is lifted whole off the shipped
   California pack at test time, together with the source record it cites, so the figure under
   assertion is California's own retrieved figure carrying its own citation. An edit to the
   shipped pack's threshold set therefore flows straight into what this test observes, which is
   what makes this a regression pin on California rather than on the fixture.

   The fixture's per-status deductions DIFFER from one another. Each status is therefore driven
   to the threshold from a different gross income, so an identical crossing point cannot be an
   artifact of identical inputs. */
function servingCaliforniaSurchargeOnFixtureChassis() {
  const chassis = JSON.parse(readFileSync(join(ROOT, 'tax-rules/fixtures/state-contract-no-preferential-2999.json'), 'utf8'));
  const setId = Object.keys(CALIFORNIA.thresholdSets)[0];
  const californiaSet = CALIFORNIA.thresholdSets[setId];
  const citedSource = CALIFORNIA.sourceRecords.filter((record) => record.sourceId === californiaSet.sourceRef)[0];
  const pack = JSON.parse(JSON.stringify(chassis));
  pack.jurisdiction = 'state:CA';
  pack.thresholdSets = { [setId]: californiaSet };
  pack.taxLegs = pack.taxLegs.map((leg) => (leg.stageId === SURCHARGE_STAGE
    ? Object.assign({}, leg, { figureRef: 'thresholdSets.' + setId })
    : leg));
  pack.sourceRecords = pack.sourceRecords.concat([citedSource]);
  pack.contentSha256 = 'sha256:' + createHash('sha256')
    .update(RULES.packContentDigestInput(pack)).digest('hex');
  return { pack, setId, californiaSet, citedSource, chassis, overrides: { [CALIFORNIA_PACK_PATH]: JSON.stringify(pack) } };
}

/* The dollar figure a named stage row renders, as the reader sees it. A stage that refused or was
   never reached carries no figure at all, so `null` here is a distinct outcome from `$0` and the
   two are never merged. */
async function renderedStageFigure(page, stage) {
  const row = page.locator(`[data-rl-state-stage="${stage}"]`);
  await expect(row).toHaveCount(1);
  const rendered = await row.innerText();
  const matched = rendered.match(/-?\$[\d,]+(?:\.\d+)?/);
  return matched === null ? null : matched[0];
}

let site;
let surchargeSite;
const SURCHARGE = servingCaliforniaSurchargeOnFixtureChassis();
test.beforeAll(async () => {
  site = await startStaticServer();
  surchargeSite = await startStaticServer({ overrides: SURCHARGE.overrides });
});
test.afterAll(async () => {
  if (site) await site.close();
  if (surchargeSite) await surchargeSite.close();
});

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

test('Regression: SCN-022-012 the surcharge threshold is identical for every filing status', async ({ page }) => {
  const { pack, californiaSet, citedSource, chassis } = SURCHARGE;
  const threshold = californiaSet.thresholds.all;
  const STEP = 10000;

  /* The chassis is unmistakably a fixture and stays one. Its identity, its rule status and its
     declared jurisdiction all come from the fixture file, and the only thing re-keyed is the
     jurisdiction the served copy answers to — the same re-keying BI-5 performs. If a later edit
     turned this chassis into something that read as a sourced California pack, these fail. */
  expect(pack.id).toBe(chassis.id);
  expect(pack.id).toMatch(/fixture/);
  expect(pack.ruleStatus).toBe('user-hypothetical-law');
  expect(chassis.jurisdiction).not.toBe('state:CA');
  expect(pack.sourceRecords[0].retrievalNote).toMatch(/CONTRACT FIXTURE/);

  /* The deduction and the ordinary schedule that let this settlement reach the surcharge stage
     are the FIXTURE's, stated as the fixture's, and are not California's. California carries no
     figure for either, which is exactly why they have to come from somewhere else. */
  for (const status of FILING_STATUSES) {
    expect(pack.standardDeductions[status].sourceRef).toBe(chassis.sourceRecords[0].sourceId);
    expect(pack.standardDeductions[status].locator).toMatch(/fixture/);
    expect(RULES.isAbsentFigure(CALIFORNIA.standardDeductions[status])).toBe(true);
    expect(RULES.isAbsentFigure(CALIFORNIA.ordinaryRateTables[status])).toBe(true);
  }

  /* The threshold set, by contrast, is California's own — lifted whole off the shipped pack with
     the source record it cites, not restated here. This is what makes the assertions below a
     regression pin on California's retrieved figure. */
  expect(JSON.stringify(pack.thresholdSets[SURCHARGE.setId])).toBe(JSON.stringify(CALIFORNIA.thresholdSets[SURCHARGE.setId]));
  expect(citedSource.sourceId).toBe(californiaSet.sourceRef);
  expect(citedSource.retrievalOutcome).toBe('retrieved');
  expect(Number.isFinite(threshold)).toBe(true);

  const below = {};
  const above = {};
  const grossInputs = [];

  for (const status of FILING_STATUSES) {
    const deduction = pack.standardDeductions[status].amount;
    grossInputs.push(deduction);

    /* One dollar of taxable income short of the threshold, and STEP dollars past it. Because the
       fixture's deduction differs by status, the GROSS income each household declares to reach
       the same taxable income differs too. */
    await openLifetimeTax(page, surchargeSite);
    await declareOrdinaryHousehold(page, { filingStatus: status, ordinary: threshold + deduction - 1 });
    await declareResidency(page, 'state:CA', 'full-year-resident');
    await openPower(page);
    below[status] = {
      gross: await renderedStageFigure(page, GROSS_STAGE),
      deduction: await renderedStageFigure(page, DEDUCTION_STAGE),
      taxable: await renderedStageFigure(page, TAXABLE_STAGE),
      surcharge: await renderedStageFigure(page, SURCHARGE_STAGE)
    };

    await openLifetimeTax(page, surchargeSite);
    await declareOrdinaryHousehold(page, { filingStatus: status, ordinary: threshold + deduction + STEP });
    await declareResidency(page, 'state:CA', 'full-year-resident');
    await openPower(page);
    above[status] = {
      gross: await renderedStageFigure(page, GROSS_STAGE),
      deduction: await renderedStageFigure(page, DEDUCTION_STAGE),
      taxable: await renderedStageFigure(page, TAXABLE_STAGE),
      surcharge: await renderedStageFigure(page, SURCHARGE_STAGE)
    };
  }

  /* The four households are genuinely different households. The deductions the fixture states
     are not all equal, so the gross income each declared to reach the same taxable income is not
     all equal either. Without this the identical crossing point below would be consistent with
     four identical settlements. */
  expect(new Set(grossInputs).size).toBeGreaterThan(1);
  expect(new Set(FILING_STATUSES.map((status) => above[status].gross)).size).toBeGreaterThan(1);
  expect(new Set(FILING_STATUSES.map((status) => above[status].deduction)).size).toBeGreaterThan(1);

  /* The crossing point itself, read off the rendered rows. Every status reaches the SAME taxable
     income, and at that taxable income every status produces the SAME surcharge: zero one dollar
     short of the threshold, and the same positive figure STEP dollars past it. That is the
     threshold observed to be identical across filing statuses rather than asserted to be. */
  const taxableBelow = new Set(FILING_STATUSES.map((status) => below[status].taxable));
  const taxableAbove = new Set(FILING_STATUSES.map((status) => above[status].taxable));
  const surchargeBelow = new Set(FILING_STATUSES.map((status) => below[status].surcharge));
  const surchargeAbove = new Set(FILING_STATUSES.map((status) => above[status].surcharge));
  expect(taxableBelow.size).toBe(1);
  expect(taxableAbove.size).toBe(1);
  expect(surchargeBelow.size).toBe(1);
  expect(surchargeAbove.size).toBe(1);

  /* And the crossing is a real crossing rather than a flat line: the stage is a rendered figure
     on both sides, it is zero below and it is positive above. A stage that had refused would
     render no figure at all and `renderedStageFigure` would return null, so a settlement that
     stopped short of the surcharge cannot satisfy this. */
  for (const status of FILING_STATUSES) {
    expect(below[status].surcharge).toBe('$0');
    expect(above[status].surcharge).not.toBe(null);
    expect(above[status].surcharge).not.toBe('$0');
    expect(above[status].surcharge).toMatch(/^\$[\d,]+(?:\.\d+)?$/);
  }
});
