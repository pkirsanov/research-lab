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

/* The household's own benefit declarations, filled through the same four controls the benefit
   spec drives. The statement origin is used throughout this file because the inclusion is a
   function of the SETTLED benefit and this origin settles without depending on a wage series
   that can fail on its own. */
async function declareStatementBenefit(page, values) {
  await page.fill('#inputBenefitStatementPia', String(values.statementPia));
  await page.fill('#inputBenefitBirthYear', String(values.birthYear));
  await page.fill('#inputBenefitClaimAgeMonths', String(values.claimAgeMonths));
}

/* One household, declared once. Its settled annual benefit is $21,912, so one half of it is
   $10,956 and the ordinary amount below places provisional income exactly where each row needs
   it. Every figure that ACTS on those declarations is a pack figure; nothing here is a rule. */
const STATEMENT_PIA = 2609.8;
const BIRTH_YEAR = 1964;
const CLAIM_AGE_MONTHS = 744;

const legSetOf = (page, selector) => page.locator(selector)
  .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-leg')).sort());

const splitAttribute = (raw) => (raw === null || raw === '' ? [] : raw.split(','));

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* TP-02-22. */
test('Regression: SCN-024-004 provisional income shows every part by name with its origin and names the measures it is not', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await page.fill('#inputTaxExemptInterest', '4000');
  await declareStatementBenefit(page, {
    statementPia: STATEMENT_PIA, birthYear: BIRTH_YEAR, claimAgeMonths: CLAIM_AGE_MONTHS
  });
  await openPower(page);

  /* Every part the source names, published by name with its amount and where it came from. A
     composition that had silently read a settlement measure would show one part, not three. */
  const partRows = page.locator('#inclusionPartsBody tr');
  expect(await partRows.count()).toBe(3);
  const parts = await partRows.evaluateAll((rows) => rows.map((row) => Array.from(row.cells).map((cell) => {
    const figure = cell.querySelector('.val-figure');
    return (figure === null ? cell.textContent : figure.textContent).trim();
  })));
  const labels = parts.map((cells) => cells[0]);
  const origins = parts.map((cells) => cells[2]);
  expect(labels).toContain('One-half of the benefit');
  expect(labels).toContain('All other income that is taxable');
  expect(labels).toContain('Tax-exempt interest');
  /* Declared and sourced are never rendered the same way. Two of the three parts are the
     household's own declaration and say so; the third is a proportion of the settled benefit. */
  expect(origins.filter((origin) => origin === 'declared-by-the-household').length).toBe(2);
  expect(origins).toContain('proportion-of-the-settled-benefit');
  /* One half of $21,912 is $10,956, and the tax-exempt interest the household declared is
     counted here even though it is excluded from gross income, because the source says so. */
  const benefitPart = parts.filter((cells) => cells[0] === 'One-half of the benefit')[0];
  expect(benefitPart[1]).toBe('$10,956');
  const exemptPart = parts.filter((cells) => cells[0] === 'Tax-exempt interest')[0];
  expect(exemptPart[1]).toBe('$4,000');

  /* The measure names what it is NOT. Provisional income here is $10,956 + $60,000 + $4,000. */
  const measureLine = await page.locator('#inclusionMeasureLine').innerText();
  expect(measureLine).toContain('$74,956');
  expect(measureLine).toContain('adjusted-gross-income');
  expect(measureLine).toContain('modified-adjusted-gross-income');
  expect(measureLine).toContain('composed from the parts below and nothing else');

  /* Every rendered figure carries a contextual tooltip rather than standing alone. */
  const partValues = page.locator('#inclusionPartsBody [data-rl-value]');
  expect(await partValues.count()).toBe(3);
  const described = await partValues.evaluateAll((nodes) => nodes
    .map((node) => node.getAttribute('aria-describedby')));
  described.forEach((id) => expect(id).toMatch(/^tip-inclusion-part-/));
});

/* TP-02-23. */
test('Regression: SCN-024-005 the tier is selected at the exact base amount with its operator shown and the ceiling binding is stated', async ({ page }) => {
  await openLifetimeTax(page, site);
  /* Provisional income EXACTLY at the first sourced base amount: $10,956 of benefit proportion
     plus $14,044 of declared ordinary income. The source's own operator decides whether a
     household sitting exactly on the boundary falls inside it or outside it, and the comparison
     performed is rendered so a reader can see which. */
  await declareOrdinaryHousehold(page, { ordinary: 14044, bracketId: 'b3' });
  await declareStatementBenefit(page, {
    statementPia: STATEMENT_PIA, birthYear: BIRTH_YEAR, claimAgeMonths: CLAIM_AGE_MONTHS
  });
  await openPower(page);

  const boundaryRow = page.locator('#inclusionComparisonBody tr').first();
  const boundaryCells = await boundaryRow.evaluateAll((rows) => Array.from(rows[0].cells).map((cell) => {
    const figure = cell.querySelector('.val-figure');
    return (figure === null ? cell.textContent : figure.textContent).trim();
  }));
  expect(boundaryCells[0]).toBe('provisional-income-against-first-base-amount');
  expect(boundaryCells[1]).toBe('$25,000');
  expect(boundaryCells[2]).toBe('>');
  expect(boundaryCells[3]).toBe('$25,000');
  expect(boundaryCells[4]).toBe('no');
  await expect(page.locator('#inclusionTierLine')).toContainText('none-included');
  await expect(page.locator('#inclusionTierLine')).toContainText('not a category chosen for you');
  await expect(page.locator('#headlineBlock [data-rl-value="inclusion-headline"]')).toHaveText('$0');

  /* One dollar above the same figure lands in the next tier. Asserting both sides at the exact
     sourced figure is what proves an implementation swapping the operator would fail here. */
  await page.fill('#inputOrdinary', '14045');
  await expect(page.locator('#inclusionTierLine')).toContainText('first-tier');
  const aboveCells = await page.locator('#inclusionComparisonBody tr').first().evaluateAll((rows) =>
    Array.from(rows[0].cells).map((cell) => {
      const figure = cell.querySelector('.val-figure');
      return (figure === null ? cell.textContent : figure.textContent).trim();
    }));
  expect(aboveCells[1]).toBe('$25,001');
  expect(aboveCells[4]).toBe('yes');
  await expect(page.locator('#inclusionCeilingLine')).toContainText('did not bind');

  /* Far above the second base amount the sourced ceiling proportion binds, and the record SAYS
     the ceiling bound the result rather than leaving a reader to infer it from a figure that
     stopped moving. $21,912 is the settled benefit and the ceiling holds the result to a
     proportion of it that the pack carries. */
  await page.fill('#inputOrdinary', '300000');
  await expect(page.locator('#inclusionCeilingLine')).toContainText('bound the result');
  await expect(page.locator('#inclusionTierLine')).toContainText('second-tier');
  await expect(page.locator('#headlineBlock [data-rl-value="inclusion-headline"]')).toHaveText('$18,625');
  await expect(page.locator('#inclusionContributionLine')).toContainText('named contributor to ordinary taxable income');
});

/* TP-02-24. The half of this row that is reachable from the real route without intercepting a
   request — which the harness forbids — is the invariance contrast being SHOWN. The refusal
   branch is driven here through the one inclusion refusal a household can actually reach at the
   route, which proves the refusal renders whole with no tier and no amount behind it; the
   missing-basis refusal itself is asserted at the contract level, where a fixture pack can carry
   a base amount whose basis was deliberately removed. */
test('Regression: SCN-024-006 a base amount from another edition shows its quoted contrast and one without a contrast refuses naming the missing basis', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 60000, bracketId: 'b3' });
  await declareStatementBenefit(page, {
    statementPia: STATEMENT_PIA, birthYear: BIRTH_YEAR, claimAgeMonths: CLAIM_AGE_MONTHS
  });
  await openPower(page);

  const baseRows = page.locator('#inclusionBaseAmountBody tr');
  expect(await baseRows.count()).toBeGreaterThan(0);
  const bases = await baseRows.evaluateAll((rows) => rows.map((row) => Array.from(row.cells).map((cell) => {
    const figure = cell.querySelector('.val-figure');
    return (figure === null ? cell.textContent : figure.textContent).trim();
  })));
  bases.forEach((cells) => {
    /* Each base amount carries its publication and the locator it was transcribed from, the
       edition year that publication served, and — because that year is not the declared year —
       the publication's own words establishing the figure does not vary by year. */
    expect(cells[2]).toContain('irs-p915-2025');
    expect(cells[2].length).toBeGreaterThan('irs-p915-2025'.length + 5);
    expect(cells[3]).toBe('2025');
    expect(cells[4]).toContain('\u201c');
    expect(cells[4]).not.toBe('the edition read is the declared year');
    expect(cells[4].length).toBeGreaterThan(60);
  });

  /* The refusal path, driven through a filing status the publication gives two different base
     amounts and selects between on a fact only the household knows. Nothing is defaulted: the
     panel refuses whole, names the declaration it is waiting on, and publishes no tier, no base
     amount, no comparison and no included figure in the meantime. */
  await page.selectOption('#inputFilingStatus', 'married-filing-separately');
  const refusal = page.locator('#inclusionRefusal [data-rl-unavailable]');
  await expect(refusal).toHaveAttribute('data-rl-unavailable', 'RLTAX-INPUT-INCOMPLETE');
  await expect(refusal).toContainText('separateFilerSharedResidence');
  await expect(refusal).toContainText('neither situation is defaulted');
  expect(await page.locator('#inclusionBaseAmountBody tr').count()).toBe(0);
  expect(await page.locator('#inclusionComparisonBody tr').count()).toBe(0);
  expect(await page.locator('#inclusionPartsBody tr').count()).toBe(0);
  expect(await page.locator('#inclusionTierLine').innerText()).toBe('');
  expect(await page.locator('#headlineBlock [data-rl-leg="social-security-inclusion"]').count()).toBe(0);
  await expect(page.locator('#power-inclusion')).not.toContainText('$0');
});

/* TP-02-25. */
test('Regression: SCN-024-005 the inclusion leg reaches the headline, the comparison, the curve and the export', async ({ page }) => {
  await openLifetimeTax(page, site);
  /* Every leg in this fixture settles a DISTINCT non-zero figure, so omitting any one of them
     changes a surface by an amount unique to that leg. A zero leg balances an addition check
     whether or not it was added, which is exactly how a dropped leg hides. */
  await declareOrdinaryHousehold(page, {
    ordinary: 300000, longTermCapitalGain: 120000, otherNetInvestmentIncome: 5000,
    medicareWageBasis: 400000, bracketId: 'b3'
  });
  await declareStatementBenefit(page, {
    statementPia: STATEMENT_PIA, birthYear: BIRTH_YEAR, claimAgeMonths: CLAIM_AGE_MONTHS
  });
  await openPower(page);

  const record = splitAttribute(await page.locator('body').getAttribute('data-rl-legs-record'));
  expect(record).toContain('social-security-inclusion');
  expect(record).toContain('social-security-benefit');

  /* Surface one: the headline. The federal figure declares the legs it summed, and the inclusion
     carries its own figure BESIDE that total because it is a contributor to ordinary taxable
     income rather than a leg of the tax the headline prices. */
  const headlineSummed = splitAttribute(
    await page.locator('#headlineBlock [data-rl-legs]').getAttribute('data-rl-legs'));
  const headlineOwn = await legSetOf(page, '#headlineBlock [data-rl-leg]');
  const headline = headlineSummed.concat(headlineOwn).sort();
  expect(headlineOwn).toContain('social-security-inclusion');
  expect(headlineSummed).not.toContain('social-security-inclusion');

  /* Surfaces two and three: the comparison table and the curve's leg contributors. The curve row
     states, in the leg's own words, what the marginal curve does with it. */
  const comparison = await legSetOf(page, '#legCompositionBody tr[data-rl-leg]');
  const curve = await legSetOf(page, '#curveLegContributorsBody tr[data-rl-leg]');
  await expect(page.locator('#curveLegContributorsBody tr[data-rl-leg="social-security-inclusion"]'))
    .toContainText('resamples the declared workspace');
  await expect(page.locator('#legCompositionBody tr[data-rl-leg="social-security-inclusion"]'))
    .toContainText('named contributor to ordinary taxable income');

  /* Surface four: the export. */
  await page.locator('#exportAcknowledgement').check();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#exportPrivateFile').click()
  ]);
  const written = JSON.parse(readFileSync(await download.path(), 'utf8'));
  const exported = written.settledLegs.slice().sort();
  const exportedAttribute = splitAttribute(
    await page.locator('#privacyResult').getAttribute('data-rl-export-legs')).sort();
  /* The export carries leg IDENTITIES and no leg figure, so it states which legs settled without
     smuggling back a household value the sanitiser has just removed. */
  expect(JSON.stringify(written)).not.toContain('18625');
  expect(JSON.stringify(written)).not.toContain(String(STATEMENT_PIA));

  /* Two-directional set identity against every one of the four surfaces, reported by naming both
     the missing leg and the surface it failed to reach. */
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
  });

  /* The page publishes the per-leg surfaces it renders rather than holding them in a list here,
     so a surface a later scope adds is checked without editing this check. */
  const surfaces = splitAttribute(await page.locator('body').getAttribute('data-rl-leg-surfaces'));
  expect(surfaces.sort()).toEqual(['comparison', 'curve', 'headline']);
  expect(readFileSync(join(ROOT, 'lifetime-tax-strategy-lab.html'), 'utf8'))
    .toContain('data-rl-leg-surfaces');
});
