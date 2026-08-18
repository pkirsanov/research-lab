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
   script tags and from every pack path the configuration declares, so the mortality pack this
   scope introduces is admitted by its declaration rather than by a hand-edited literal here. */
function declaredRouteAssets() {
  const routeSource = readFileSync(join(ROOT, 'lifetime-tax-strategy-lab.html'), 'utf8');
  const config = JSON.parse(readFileSync(join(ROOT, 'lifetime-tax-strategy.config.json'), 'utf8'));
  const scripts = Array.from(routeSource.matchAll(/<script src="([^"]+)"><\/script>/g))
    .map((match) => '/' + match[1]);
  const packs = declaredPackPaths(config).map((path) => '/' + path);
  return ['/lifetime-tax-strategy-lab.html', '/lifetime-tax-strategy.config.json']
    .concat(scripts).concat(packs).concat(['/favicon.ico']);
}

/* One household, declared once. Its primary insurance amount is the household's OWN statement
   figure; every figure that ACTS on it — the reduction for claiming early, the credit for
   claiming late, and the remaining years — is a pack figure transcribed from a publication.
   The claim ages are declared in an order that is NOT ascending by cumulative total, which is
   what makes the declared-order assertion capable of failing. */
const STATEMENT_PIA = 2400;
const BIRTH_YEAR = 1960;
const CLAIM_AGE_MONTHS = 804;
const DECLARED_AGES = '70, 62, 67';
const MORTALITY_COLUMN = 'published-life-expectancy-column-1';

async function declareClaimAgeComparison(page, ages) {
  await page.fill('#inputBenefitStatementPia', String(STATEMENT_PIA));
  await page.fill('#inputBenefitBirthYear', String(BIRTH_YEAR));
  await page.fill('#inputBenefitClaimAgeMonths', String(CLAIM_AGE_MONTHS));
  await page.fill('#inputClaimAgeComparisonAges', ages);
  await page.selectOption('#inputMortalityColumn', MORTALITY_COLUMN);
}

const claimAgeGrid = (page) => page.locator('#claimAgeBody tr')
  .evaluateAll((rows) => rows.map((row) => Array.from(row.cells).map((cell) => {
    const figure = cell.querySelector('.val-figure');
    return (figure === null ? cell.textContent : figure.textContent).trim();
  })));

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* TP-03-20. */
test('Regression: SCN-024-007 the claim-age panel renders identically across two loads and shows no probability column', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 40000, bracketId: 'b3' });
  await declareClaimAgeComparison(page, DECLARED_AGES);
  await openPower(page);

  const first = await claimAgeGrid(page);
  expect(first.length).toBe(3);

  /* A second load of the same declarations reproduces the panel cell for cell. The comparison
     reads no clock and no random source, so a differing cell would mean something non-declared
     reached it. */
  await openLifetimeTax(page, site);
  await openPower(page);
  const second = await claimAgeGrid(page);
  expect(second).toEqual(first);

  /* The mortality source names itself, its own table year and the locator the figures were read
     from, and it states that the table year is not the declared year rather than quietly
     reconciling them. */
  const basisLine = await page.locator('#claimAgeBasisLine').innerText();
  expect(basisLine).toContain('ssa-period-life-table-2023');
  expect(basisLine).toContain('2023');
  expect(basisLine).toContain('neither is adjusted to the other');

  /* No probability, survivorship or hazard figure appears anywhere on the panel. The published
     table carries such columns; this pack carries only the remaining-years column, and the panel
     can therefore not show one. */
  const panelText = await page.locator('#power-claim-age').innerText();
  expect(panelText).not.toMatch(/probability|survivor|hazard|chance of|odds/i);

  /* What the retrieval did NOT establish is carried on the panel as a refusal rather than being
     silently filled in with a population name nobody read. */
  await expect(page.locator('#claimAgeColumnAbsence [data-rl-unavailable]'))
    .toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
});

/* TP-03-21. */
test("Regression: SCN-024-008 the cumulative totals and the equality age are shown with both claim ages named and the record's own arithmetic statement", async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 40000, bracketId: 'b3' });
  await declareClaimAgeComparison(page, DECLARED_AGES);
  await openPower(page);

  /* Known values. The annual amounts are the household's own $2,400 statement figure adjusted by
     the pack's own factors; the remaining years are transcribed from the published table at each
     exact age; the whole-year count is the count from the claim age to the whole part of the age
     the two sum to; and the total is the product of the two. Nothing is discounted or grown. */
  const grid = await claimAgeGrid(page);
  expect(grid[0]).toEqual(['70', '$35,712', '14.66', '14', '$499,968']);
  expect(grid[1]).toEqual(['62', '$20,160', '20.29', '20', '$403,200']);
  expect(grid[2]).toEqual(['67', '$28,800', '16.71', '16', '$460,800']);

  /* The equality age names BOTH claim ages on its own row, so no reader has to infer which pair a
     figure belongs to. Claiming at 62 and claiming at 67 produce sums that are equal at 78.67. */
  const parity = await page.locator('#claimAgeParityBody tr').evaluateAll((rows) => rows
    .map((row) => Array.from(row.cells).map((cell) => {
      const figure = cell.querySelector('.val-figure');
      return (figure === null ? cell.textContent : figure.textContent).trim();
    })));
  const crossing = parity.filter((cells) => cells[0] === '62' && cells[1] === '67')[0];
  expect(crossing[2]).toBe('78.67');

  /* A pair whose sums never meet withholds the figure rather than reporting a bound. */
  const nonCrossing = parity.filter((cells) => cells[0] === '70' && cells[1] === '62')[0];
  expect(nonCrossing[2]).toContain('never become equal at any age');
  expect(nonCrossing[2]).not.toMatch(/\$/);

  /* Both statements are rendered as text on the panel rather than held only inside the record. */
  await expect(page.locator('#claimAgeResultKindLine')).toContainText('two declared sums');
  await expect(page.locator('#claimAgeResultKindLine')).toContainText('not a forecast');
  await expect(page.locator('#claimAgeSelectsNothingLine')).toContainText('selects nothing');

  /* No discount rate and no appreciation assumption appears anywhere on the panel. */
  const panelText = await page.locator('#power-claim-age').innerText();
  expect(panelText).not.toMatch(/discount rate|present value|appreciat|inflation-adjusted|growth rate/i);

  /* Every displayed figure carries a contextual tooltip rather than standing alone. */
  const described = await page.locator('#power-claim-age [data-rl-value]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-describedby')));
  expect(described.length).toBeGreaterThan(0);
  described.forEach((id) => expect(id).toMatch(/^tip-claim-age-/));
});

/* TP-03-22. */
test('Regression: SCN-024-008 an absent life-expectancy figure withholds the totals and the equality age while the per-age benefits still render', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 40000, bracketId: 'b3' });
  /* Age 75 sits outside the closed age domain this retrieval transcribed, so the table carries no
     row for it. No adjacent row is borrowed and no default horizon is substituted. */
  await declareClaimAgeComparison(page, '67, 75');
  await openPower(page);

  const rows = page.locator('#claimAgeBody tr');
  expect(await rows.count()).toBe(2);

  /* The age the table carries settles completely. */
  const grid = await claimAgeGrid(page);
  expect(grid[0]).toEqual(['67', '$28,800', '16.71', '16', '$460,800']);

  /* The age it does not carry keeps its adjusted annual benefit and refuses the rest BY NAME. */
  await expect(page.locator('#claimAgeBody tr[data-rl-claim-age="75"] [data-rl-value="claim-age-benefit-75"]'))
    .toHaveText('$35,712');
  const withheld = page.locator('#claimAgeBody tr[data-rl-claim-age="75"] [data-rl-unavailable]');
  await expect(withheld).toHaveAttribute('data-rl-unavailable', 'RLTAX-THRESHOLD-UNAVAILABLE');
  await expect(withheld).toContainText('no adjacent row stands in for it');

  /* Neither a total nor an equality age is invented for it. */
  const rowText = await page.locator('#claimAgeBody tr[data-rl-claim-age="75"]').innerText();
  expect(rowText).not.toContain('$0');
  const parityText = await page.locator('#claimAgeParityBody').innerText();
  expect(parityText).toContain('no equality between them can be stated');

  /* Every other Power section still renders, so the absent figure did not abort renderPower(). */
  await expect(page.locator('#power-settlement')).toBeVisible();
  await expect(page.locator('#power-benefit')).toBeVisible();
  await expect(page.locator('#power-source-records')).toBeVisible();
});

/* TP-03-23. */
test('Regression: SCN-024-009 the claim ages render in declared order with nothing marked best, optimal, recommended or preferred', async ({ page }) => {
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 40000, bracketId: 'b3' });
  await declareClaimAgeComparison(page, DECLARED_AGES);
  await openPower(page);

  /* The declared order is 70, 62, 67. Ascending by cumulative total would be 62, 67, 70 and
     descending would be 70, 67, 62, so a renderer that sorted by ANY figure fails this. */
  const order = await page.locator('#claimAgeBody tr')
    .evaluateAll((rows) => rows.map((row) => row.getAttribute('data-rl-claim-age')));
  expect(order).toEqual(['70', '62', '67']);

  /* No row is emphasised and no cell carries a selection marker. */
  const panelText = await page.locator('#power-claim-age').innerText();
  expect(panelText).not.toMatch(/\bbest\b|\boptimal\b|recommend|preferred|you should|winner|highest total/i);
  const emphasised = await page.locator('#power-claim-age #claimAgeBody strong, #power-claim-age #claimAgeBody em, #power-claim-age #claimAgeBody mark').count();
  expect(emphasised).toBe(0);

  await expect(page.locator('#claimAgeSelectsNothingLine')).toContainText('expresses no preference between them');
});

/* TP-03-24. */
test('Regression: SCN-024-009 the request ledger stays empty and no declared claim age reaches a URL', async ({ page }) => {
  const ledger = collectRequests(page);
  await openLifetimeTax(page, site);
  await declareOrdinaryHousehold(page, { ordinary: 40000, bracketId: 'b3' });
  await declareClaimAgeComparison(page, DECLARED_AGES);
  await openPower(page);

  const permitted = declaredRouteAssets();
  /* The mortality pack is now read from disk, so this assertion is only meaningful because the
     permitted set is derived from the configuration's own declarations. */
  expect(permitted).toContain('/tax-rules/mortality/2026.json');
  expect(permitted).toContain('/rltaxclaimage.js');

  const requested = ledger.map((entry) => new URL(entry.url).pathname);
  requested.forEach((path) => expect(permitted).toContain(path));

  /* No declared claim age, and no declared column, reaches any URL, query string or body. */
  const urls = ledger.map((entry) => entry.url).join(' ');
  expect(urls).not.toContain('70,');
  expect(urls).not.toContain('claimAge');
  expect(urls).not.toContain(MORTALITY_COLUMN);
  ledger.forEach((entry) => expect(entry.postData).toBe(''));
  ledger.forEach((entry) => expect(entry.method).toBe('GET'));
});
